'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { handle } = require('./index.js');

function d_tg(o) { return o.tgFails === true; }
function deps(opts) {
  opts = opts || {};
  const mem = new Map(), sent = { tg: [], mail: [] }, logs = [];
  let tgCalls = 0;
  return {
    mem, sent, logs,
    env: { ALLOWED_ORIGINS: 'https://edgechamps.com' },
    now: () => new Date('2026-01-02T03:04:05Z'),
    log: (m) => logs.push(m),
    store: {
      async get(k) { if (opts.readFails) throw new Error('down'); return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
      async put(k, o) { if (opts.storeFails) throw new Error('down'); mem.set(k, JSON.stringify(o)); },
    },
    async sendTelegram(t) { tgCalls++; if (d_tg(opts) || (opts.tgFails === 'once' && tgCalls === 1)) throw new Error('tg'); sent.tg.push(t); },
    async sendMail(s, t) { if (opts.mailFails && !opts.mailFixed) throw new Error('smtp'); sent.mail.push([s, t]); },
    opts,
  };
}
function lead(over) {
  return Object.assign({
    id: 'a1b2c3d4-0000-4000-8000-000000000001', name: 'Тест', role: 'player', club: '', league: '', change: 'Стабильность', contact: '@test',
    consent: true, website: '', elapsed: 9000, r: 'ce_testxxxx', utm: { utm_source: 'tg', utm_term: '<script>' },
    site_role: 'player', site_path: 'peak', lang: 'ru', sport: 'hockey', url: 'https://edgechamps.com/?r=ce_testxxxx',
  }, over || {});
}
function post(body, origin) {
  return { httpMethod: 'POST', headers: { Origin: origin === undefined ? 'https://edgechamps.com' : origin }, body: JSON.stringify(body) };
}

test('заявка сохраняется и уходит в оба канала', async () => {
  const d = deps();
  const res = await handle(post(lead()), d);
  const j = JSON.parse(res.body);
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(j.channels, { telegram: true, mail: true });
  assert.strictEqual(res.headers['Access-Control-Allow-Origin'], 'https://edgechamps.com');
  assert.strictEqual(d.mem.size, 1);
  assert.match(d.sent.tg[0], /код: ce_testxxxx/);
  assert.match(d.sent.tg[0], /utm_source=tg/);
  assert.doesNotMatch(d.sent.tg[0], /script/);
  assert.strictEqual(d.sent.mail.length, 1);
  assert.ok(d.logs.every((l) => !/Тест|@test/.test(l)), 'в журнале нет данных анкеты');
});

test('чужой источник отклоняется', async () => {
  const d = deps();
  const res = await handle(post(lead(), 'https://evil.example'), d);
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(d.mem.size, 0);
});

test('предварительный запрос CORS', async () => {
  const res = await handle({ httpMethod: 'OPTIONS', headers: { origin: 'https://edgechamps.com' } }, deps());
  assert.strictEqual(res.statusCode, 204);
  assert.strictEqual(res.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS');
});

test('без согласия и без обязательных полей заявка не принимается', async () => {
  const d = deps();
  assert.strictEqual((await handle(post(lead({ consent: false })), d)).statusCode, 400);
  assert.strictEqual((await handle(post(lead({ contact: '  ' })), d)).statusCode, 400);
  assert.strictEqual((await handle(post(lead({ role: 'admin' })), d)).statusCode, 400);
  assert.strictEqual(d.mem.size, 0);
  assert.strictEqual(d.sent.tg.length, 0);
});

test('робот: скрытое поле или слишком быстрая отправка', async () => {
  const d = deps();
  for (const over of [{ website: 'http://spam' }, { elapsed: 500 }]) {
    const res = await handle(post(lead(over)), d);
    assert.deepStrictEqual(JSON.parse(res.body).channels, { telegram: false, mail: false });
  }
  assert.strictEqual(d.mem.size, 0);
  assert.strictEqual(d.sent.tg.length + d.sent.mail.length, 0);
});

test('хранилище недоступно: никуда не отправляем', async () => {
  const d = deps({ storeFails: true });
  const res = await handle(post(lead()), d);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(d.sent.tg.length + d.sent.mail.length, 0);
});

test('один канал не доставил: второй уходит, повтор досылает только недостающий', async () => {
  const d = deps({ mailFails: true });
  const first = JSON.parse((await handle(post(lead()), d)).body);
  assert.deepStrictEqual(first.channels, { telegram: true, mail: false });
  assert.strictEqual(first.ok, true);
  d.opts.mailFixed = true;
  const second = JSON.parse((await handle(post(lead()), d)).body);
  assert.deepStrictEqual(second.channels, { telegram: true, mail: true });
  assert.strictEqual(d.sent.tg.length, 1, 'в Telegram заявка не дублируется');
  assert.strictEqual(d.sent.mail.length, 1);
});

test('сбой канала с первой попытки повторяется', async () => {
  const d = deps({ tgFails: 'once' });
  const j = JSON.parse((await handle(post(lead()), d)).body);
  assert.strictEqual(j.channels.telegram, true);
});

test('оба канала недоступны: заявка сохранена, сайт покажет запасной путь', async () => {
  const d = deps({ tgFails: true, mailFails: true });
  const res = await handle(post(lead()), d);
  const j = JSON.parse(res.body);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(j.ok, false);
  assert.strictEqual(j.stored, true);
  assert.strictEqual(d.mem.size, 1);
});

test('невалидный код и мусор в полях отбрасываются', async () => {
  const d = deps();
  await handle(post(lead({ r: 'CE_BAD', site_path: '<b>', lang: 'xx' })), d);
  const rec = JSON.parse([...d.mem.values()][0]);
  assert.strictEqual(rec.lead.r, '');
  assert.strictEqual(rec.lead.site_path, '');
  assert.strictEqual(rec.lead.lang, 'ru');
});

test('ничего не доставлено, человек исправил контакт: уходит исправленная анкета', async () => {
  const d = deps({ tgFails: true, mailFails: true });
  await handle(post(lead({ contact: '@oshibka' })), d);
  d.opts.tgFails = false; d.opts.mailFixed = true;
  const j = JSON.parse((await handle(post(lead({ contact: '@verno' })), d)).body);
  assert.strictEqual(j.ok, true);
  assert.match(d.sent.tg[0], /@verno/);
  assert.doesNotMatch(d.sent.tg[0], /@oshibka/);
});

test('хранилище не читается: заявка не дублируется и не отправляется', async () => {
  const d = deps({ readFails: true });
  const res = await handle(post(lead()), d);
  assert.strictEqual(res.statusCode, 502);
  assert.strictEqual(d.sent.tg.length + d.sent.mail.length, 0);
});
