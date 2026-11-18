/* =====================================================================
   Аналитика и параметры адреса. Подключается в <head>, до остальных скриптов.

   - Яндекс Метрика 114286443 запускается только после согласия посетителя
     (ключ ce_analytics: 'yes' или 'no'). Без согласия счётчик и Вебвизор не грузятся.
   - ?r=   персональный код вида ce_xxxxxxxx: хранится в cookie и localStorage (ce_r),
           уходит в Метрику параметром визита и в текст обращения.
   - ?role= и ?path= проходят белый список, применяет их js/main.js.
   - UTM-метки хранятся до отправки анкеты в sessionStorage.
   Ни имя, ни телефон, ни почта сюда не попадают.
   ===================================================================== */
(function () {
  'use strict';
  var YM_ID = 114286443;
  var R_RE = /^ce_[a-z2-9]{8}$/;
  var ROLE_IDS = ['player', 'agent', 'club', 'coach'];
  var PATH_IDS = { young: 'young', peak: 'peak', veteran: 'veteran', talent: 'young', hero: 'peak', legend: 'veteran' };
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function ls(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  function ss(key, val) {
    try {
      if (val === undefined) return sessionStorage.getItem(key);
      sessionStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  function cookie(name) {
    var m = new RegExp('(?:^|; )' + name + '=([^;]*)').exec(document.cookie || '');
    return m ? m[1] : null;
  }

  // Параметры адреса. Значение используется только после сверки с шаблоном или белым списком.
  var query = {};
  (location.search || '').replace(/^\?/, '').split('&').forEach(function (pair) {
    if (!pair) return;
    var i = pair.indexOf('='), k = i < 0 ? pair : pair.slice(0, i), v = i < 0 ? '' : pair.slice(i + 1);
    try { k = decodeURIComponent(k); v = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) { return; }
    if (!Object.prototype.hasOwnProperty.call(query, k)) query[k] = v;
  });
  function param(k) { return Object.prototype.hasOwnProperty.call(query, k) ? query[k] : null; }

  // --- персональный код ---
  var rCode = null;
  (function () {
    var fromUrl = param('r'), saved = cookie('ce_r') || ls('ce_r');
    if (saved && !R_RE.test(saved)) saved = null;
    if (fromUrl && R_RE.test(fromUrl)) rCode = fromUrl;       // новая валидная ссылка заменяет сохранённый код
    else rCode = saved;                                       // невалидное значение из адреса игнорируется целиком
    if (!rCode) return;
    ls('ce_r', rCode);
    try {
      document.cookie = 'ce_r=' + rCode + '; Max-Age=' + 90 * 24 * 3600 + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    } catch (e) {}
  })();

  // --- роль и путь из адреса ---
  var urlRole = ROLE_IDS.indexOf(param('role')) >= 0 ? param('role') : null;
  var urlPath = Object.prototype.hasOwnProperty.call(PATH_IDS, param('path') || '') ? PATH_IDS[param('path')] : null;

  // --- UTM: буквы, цифры, точка, подчёркивание, дефис, не длиннее 120 символов ---
  var utm = {};
  (function () {
    var saved = null;
    try { saved = JSON.parse(ss('ce_utm') || 'null'); } catch (e) {}
    var fresh = {}, any = false;
    UTM_KEYS.forEach(function (k) {
      var v = param(k) || '';
      // значение с посторонними символами отбрасывается целиком
      if (/^[0-9A-Za-z\u0400-\u04FF._-]{1,120}$/.test(v)) { fresh[k] = v; any = true; }
    });
    if (any) { utm = fresh; ss('ce_utm', JSON.stringify(fresh)); }
    else if (saved && typeof saved === 'object') UTM_KEYS.forEach(function (k) {
      if (typeof saved[k] === 'string' && /^[0-9A-Za-z\u0400-\u04FF._-]{1,120}$/.test(saved[k])) utm[k] = saved[k];
    });
  })();

  // --- Яндекс Метрика ---
  var started = false, pending = [];
  function startMetrika() {
    if (started) return;
    started = true;
    /* Yandex.Metrika counter: официальный код без изменений */
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=114286443', 'ym');

    ym(114286443, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
    /* /Yandex.Metrika counter */
    if (rCode) {
      ym(114286443, 'params', { r_code: rCode });
      ym(114286443, 'userParams', { r_code: rCode });
    }
    // цели, которые случились до согласия (например, роль и путь из ссылки), уходят сейчас
    pending.splice(0).forEach(function (g) { goal(g[0], g[1]); });
  }
  function consent() { var v = ls('ce_analytics'); return v === 'yes' || v === 'no' ? v : null; }
  function setConsent(yes) {
    ls('ce_analytics', yes ? 'yes' : 'no');
    if (yes) startMetrika(); else pending.length = 0;
    // отказ после согласия действует со следующей загрузки страницы: уже загруженный счётчик выгрузить нельзя
  }
  // Цель. Пока посетитель не ответил на вопрос о cookie, цели копятся и уходят после согласия;
  // при отказе они никуда не отправляются. Возвращает true, если цель отправлена или отложена.
  function goal(name, params) {
    if (!started) {
      if (consent() === 'no') return false;
      if (pending.length < 40) pending.push([name, params]);
      return true;
    }
    if (typeof window.ym !== 'function') return false;
    if (params) window.ym(YM_ID, 'reachGoal', name, params); else window.ym(YM_ID, 'reachGoal', name);
    return true;
  }
  // Цель, которая за визит отправляется один раз (доскроллы)
  function goalOnce(name) {
    var sent = (ss('ce_goals') || '').split(',');
    if (sent.indexOf(name) >= 0) return;
    if (goal(name)) { sent.push(name); ss('ce_goals', sent.join(',')); }
  }
  if (consent() === 'yes') startMetrika();

  // Адрес той же страницы с изменённым параметром: остальные параметры и hash сохраняются
  function urlWith(key, value) {
    var parts = (location.search || '').replace(/^\?/, '').split('&').filter(function (p) {
      return p && p.split('=')[0] !== key;
    });
    parts.push(key + '=' + encodeURIComponent(value));
    return location.pathname + '?' + parts.join('&') + location.hash;
  }

  // Пришли со страницы другой игры: экран проявляется плавно (см. .is-arriving в стилях).
  // Ставится здесь, в <head>, чтобы страница не успела мигнуть заставкой.
  if (ss('ce-go')) document.documentElement.className += ' is-arriving';

  window.CE_TRACK = {
    r: rCode, role: urlRole, path: urlPath, utm: utm,
    consent: consent, setConsent: setConsent, goal: goal, goalOnce: goalOnce, urlWith: urlWith
  };
})();
