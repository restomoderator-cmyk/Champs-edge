'use strict';
/*
 * Приём анкеты на созвон с сайта edgechamps.com.
 * Yandex Cloud Functions (ru-central1), вызов через API Gateway.
 *
 * Порядок строго такой:
 *   1. проверка запроса (источник, поля, согласие, ловушка для роботов);
 *   2. первичная запись заявки в Object Storage в России;
 *   3. только после этого копия в Telegram и письмо на почту;
 *   4. отметка в той же записи, какой канал подтвердил доставку.
 *
 * Все секреты приходят из переменных окружения (Lockbox). В журнал не пишутся
 * ни секреты, ни содержимое заявок: только её номер и состояние каналов.
 */

const LIMITS = { name: 80, club: 120, league: 120, change: 2000, contact: 160, url: 500 };
const ROLES = ['player', 'agent', 'coach', 'club', 'family'];
const SITE_ROLES = ['player', 'agent', 'coach', 'club'];
const PATHS = ['young', 'peak', 'veteran'];
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const R_RE = /^ce_[a-z2-9]{8}$/;
const ID_RE = /^[A-Za-z0-9-]{8,64}$/;
const UTM_RE = /^[0-9A-Za-zЀ-ӿ._-]{1,120}$/;
const MIN_FILL_MS = 3000;

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || 'https://edgechamps.com').split(',').map((s) => s.trim()).filter(Boolean);
}
function header(event, name) {
  const h = event.headers || {};
  const key = Object.keys(h).find((k) => k.toLowerCase() === name);
  return key ? String(h[key]) : '';
}
function reply(status, body, origin) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Origin' };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return { statusCode: status, headers, body: body === null ? '' : JSON.stringify(body) };
}
function text(v, max) {
  if (typeof v !== 'string') return '';
  // управляющие символы убираем, переводы строк оставляем
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

// Проверка и очистка заявки. Возвращает { lead } или { error }.
function parseLead(raw) {
  if (!raw || typeof raw !== 'object') return { error: 'bad_request' };
  if (!ID_RE.test(String(raw.id || ''))) return { error: 'bad_id' };
  const lead = {
    id: String(raw.id),
    name: text(raw.name, LIMITS.name),
    role: ROLES.includes(raw.role) ? raw.role : '',
    club: text(raw.club, LIMITS.club),
    league: text(raw.league, LIMITS.league),
    change: text(raw.change, LIMITS.change),
    contact: text(raw.contact, LIMITS.contact),
    r: R_RE.test(String(raw.r || '')) ? raw.r : '',
    utm: {},
    site_role: SITE_ROLES.includes(raw.site_role) ? raw.site_role : '',
    site_path: PATHS.includes(raw.site_path) ? raw.site_path : '',
    lang: raw.lang === 'en' ? 'en' : 'ru',
    sport: raw.sport === 'tennis' ? 'tennis' : 'hockey',
    url: text(raw.url, LIMITS.url),
  };
  const utm = raw.utm && typeof raw.utm === 'object' ? raw.utm : {};
  UTM_KEYS.forEach((k) => { if (typeof utm[k] === 'string' && UTM_RE.test(utm[k])) lead.utm[k] = utm[k]; });
  if (!lead.name || !lead.role || !lead.change || !lead.contact) return { error: 'missing_fields' };
  if (raw.consent !== true) return { error: 'no_consent' };
  return { lead };
}

function leadText(lead) {
  const utm = UTM_KEYS.filter((k) => lead.utm[k]).map((k) => k + '=' + lead.utm[k]).join(', ');
  return [
    'Анкета на созвон: Champion\'s Edge',
    '',
    'Имя: ' + lead.name,
    'Роль: ' + lead.role,
    'Клуб: ' + (lead.club || '-'),
    'Лига: ' + (lead.league || '-'),
    'Контакт: ' + lead.contact,
    '',
    'Что хочет изменить:',
    lead.change,
    '',
    'код: ' + (lead.r || '-'),
    'UTM: ' + (utm || '-'),
    'Роль на сайте: ' + (lead.site_role || '-') + ', путь: ' + (lead.site_path || '-'),
    'Язык: ' + lead.lang + ', версия: ' + lead.sport,
    'Страница: ' + (lead.url || '-'),
    'Получена: ' + lead.received_at,
    'Номер: ' + lead.id,
  ].join('\n');
}

async function withRetry(fn) {
  try { await fn(); return true; } catch (e) { /* вторая попытка ниже */ }
  try { await fn(); return true; } catch (e) { return false; }
}

/*
 * deps:
 *   env                     переменные окружения
 *   now()                   текущее время (Date)
 *   store.get(key)          вернуть сохранённую запись или null
 *   store.put(key, object)  записать
 *   sendTelegram(text), sendMail(subject, text)   бросают исключение при неудаче
 *   log(message)
 */
async function handle(event, deps) {
  const env = deps.env;
  const origin = header(event, 'origin');
  const okOrigin = allowedOrigins(env).includes(origin) ? origin : '';
  const method = (event.httpMethod || '').toUpperCase();

  if (method === 'OPTIONS') return reply(okOrigin ? 204 : 403, null, okOrigin);
  if (method !== 'POST') return reply(405, { ok: false, error: 'method' }, okOrigin);
  if (!okOrigin) return reply(403, { ok: false, error: 'origin' }, '');

  let raw;
  try {
    let body = event.body || '';
    if (event.isBase64Encoded) body = Buffer.from(body, 'base64').toString('utf8');
    if (body.length > 20000) return reply(413, { ok: false, error: 'too_large' }, okOrigin);
    raw = JSON.parse(body);
  } catch (e) { return reply(400, { ok: false, error: 'bad_json' }, okOrigin); }

  // Робот: заполнил скрытое поле или отправил форму быстрее человека.
  // Отвечаем как обычно, но ничего не храним и никуда не шлём; каналы пустые, цель на сайте не сработает.
  if ((raw && raw.website) || !(Number(raw && raw.elapsed) >= MIN_FILL_MS)) {
    return reply(200, { ok: true, channels: { telegram: false, mail: false } }, okOrigin);
  }

  const parsed = parseLead(raw);
  if (parsed.error) return reply(400, { ok: false, error: parsed.error }, okOrigin);
  const lead = parsed.lead;
  const key = 'leads/' + lead.id + '.json';

  // Повторная отправка той же анкеты: заявку не дублируем, досылаем только то, что не дошло
  let record = null;
  try { record = await deps.store.get(key); } catch (e) { record = null; }
  if (!record) {
    lead.received_at = deps.now().toISOString();
    record = { lead, channels: { telegram: false, mail: false } };
    try { await deps.store.put(key, record); } catch (e) {
      // без записи в российское хранилище заявка дальше не идёт
      deps.log('lead ' + lead.id + ': storage write failed');
      return reply(502, { ok: false, error: 'storage' }, okOrigin);
    }
  }

  const body = leadText(record.lead);
  const ch = record.channels;
  const jobs = [];
  if (!ch.telegram) jobs.push(withRetry(() => deps.sendTelegram(body)).then((ok) => { ch.telegram = ok; }));
  if (!ch.mail) jobs.push(withRetry(() => deps.sendMail('Анкета на созвон: ' + record.lead.role + (record.lead.r ? ' / ' + record.lead.r : ''), body)).then((ok) => { ch.mail = ok; }));
  if (jobs.length) {
    await Promise.all(jobs);
    record.delivered_at = deps.now().toISOString();
    try { await deps.store.put(key, record); } catch (e) { deps.log('lead ' + lead.id + ': status update failed'); }
  }
  deps.log('lead ' + lead.id + ': telegram=' + ch.telegram + ' mail=' + ch.mail);

  // Заявка сохранена в любом случае. ok=true, когда подтверждён хотя бы один канал доставки.
  const delivered = ch.telegram || ch.mail;
  return reply(delivered ? 200 : 502, { ok: delivered, id: lead.id, stored: true, channels: { telegram: ch.telegram, mail: ch.mail } }, okOrigin);
}

/* ---------- боевые зависимости ---------- */
function need(env, name) {
  if (!env[name]) throw new Error('env ' + name + ' is not set');
  return env[name];
}
function realDeps(env) {
  let s3 = null, mailer = null;
  function client() {
    if (s3) return s3;
    const { S3Client } = require('@aws-sdk/client-s3');
    s3 = new S3Client({
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
      credentials: { accessKeyId: need(env, 'S3_ACCESS_KEY_ID'), secretAccessKey: need(env, 'S3_SECRET_ACCESS_KEY') },
    });
    return s3;
  }
  return {
    env,
    now: () => new Date(),
    log: (m) => console.log(m),
    store: {
      async get(key) {
        const { GetObjectCommand } = require('@aws-sdk/client-s3');
        try {
          const out = await client().send(new GetObjectCommand({ Bucket: need(env, 'S3_BUCKET'), Key: key }));
          return JSON.parse(await out.Body.transformToString('utf8'));
        } catch (e) {
          if (e && (e.name === 'NoSuchKey' || (e.$metadata && e.$metadata.httpStatusCode === 404))) return null;
          throw e;
        }
      },
      async put(key, obj) {
        const { PutObjectCommand } = require('@aws-sdk/client-s3');
        await client().send(new PutObjectCommand({
          Bucket: need(env, 'S3_BUCKET'), Key: key, Body: JSON.stringify(obj, null, 1), ContentType: 'application/json; charset=utf-8',
        }));
      },
    },
    async sendTelegram(body) {
      const res = await fetch('https://api.telegram.org/bot' + need(env, 'TELEGRAM_BOT_TOKEN') + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // без parse_mode: текст анкеты не разбирается как разметка
        body: JSON.stringify({ chat_id: need(env, 'TELEGRAM_CHAT_ID'), text: body.slice(0, 4000), disable_web_page_preview: true }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error('telegram ' + res.status);
    },
    async sendMail(subject, body) {
      if (!mailer) {
        const port = Number(env.SMTP_PORT || 465);
        mailer = require('nodemailer').createTransport({
          host: need(env, 'SMTP_HOST'), port, secure: port === 465,
          auth: { user: need(env, 'SMTP_USER'), pass: need(env, 'SMTP_PASSWORD') },
          connectionTimeout: 8000, socketTimeout: 8000,
        });
      }
      await mailer.sendMail({ from: env.FROM_EMAIL || env.SMTP_USER, to: env.TO_EMAIL || 'edgechamps@gmail.com', subject, text: body });
    },
  };
}

module.exports.handler = async function (event) {
  return handle(event, realDeps(process.env));
};
module.exports.handle = handle;
module.exports.parseLead = parseLead;
