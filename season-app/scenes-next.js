  /* ---------- сцены между матчами: фигурки в раздевалке и в машине, реплики в пузырях ---------- */
  var SCENE = (function () {
    var SKIN = '#e8b796', INK = '#181425';
    function sh(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function k(v) { v = f < 0 ? v * (1 + f) : v + (255 - v) * f; return Math.max(0, Math.min(255, Math.round(v))); } return 'rgb(' + k(r) + ',' + k(g) + ',' + k(b) + ')'; }
    function R(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
    function A(c, col, a, x, y, w, h) { c.globalAlpha = a; R(c, col, x, y, w, h); c.globalAlpha = 1; }
    var CAST = {
      you: { name: 'ТЫ', shirt: '#2ce8f5', hair: '#b86f50' },
      sht: { name: 'ШТАНГА', shirt: '#2ce8f5', hair: '#feae34' },
      bat: { name: 'БАТЯ', shirt: '#2ce8f5', hair: '#3e2731', stubble: true },
      ded: { name: 'ДЕД', shirt: '#3a4466', hair: '#c0cbdc', beard: true },
      anya: { name: 'АНЯ', shirt: '#63c74d', hair: '#9e2835', long: true }
    };
    function head(c, x, y, s, o) {
      function P(col, px, py, w, h) { R(c, col, x + px * s, y + py * s, w * s, h * s); }
      if (o.long) { P(o.hair, -1, 2, 14, 11); P(sh(o.hair, -0.3), 11, 4, 2, 9); }
      P(SKIN, 0, 1, 12, 11); P(sh(SKIN, -0.18), 10, 1, 2, 11); P(sh(SKIN, -0.18), 1, 11, 10, 1); P(sh(SKIN, 0.25), 1, 3, 1, 4);
      P(o.hair, 0, 0, 12, 3); P(o.hair, 0, 3, 1, 4); P(o.hair, 11, 3, 1, 4); P(sh(o.hair, 0.3), 2, 0, 5, 1); P(sh(o.hair, -0.3), 9, 1, 3, 2);
      var e = o.emo, ey = 5, B = sh(o.hair, -0.4);
      if (e === 'joy') { P(INK, 2, ey + 1, 3, 1); P(INK, 2, ey, 1, 1); P(INK, 4, ey, 1, 1); P(INK, 7, ey + 1, 3, 1); P(INK, 7, ey, 1, 1); P(INK, 9, ey, 1, 1); P(B, 2, 3, 3, 1); P(B, 7, 3, 3, 1); P(INK, 3, 8, 6, 3); P('#ffffff', 3, 8, 6, 1); P('#e43b44', 4, 10, 4, 1); P('#f2a0a0', 1, 7, 2, 1); P('#f2a0a0', 9, 7, 2, 1); }
      else if (e === 'sad') { P('#ffffff', 2, ey, 3, 2); P('#ffffff', 7, ey, 3, 2); P(INK, 3, ey + 1, 2, 1); P(INK, 8, ey + 1, 2, 1); P(B, 2, 4, 1, 1); P(B, 3, 3, 2, 1); P(B, 7, 3, 2, 1); P(B, 9, 4, 1, 1); P(INK, 4, 9, 4, 1); P(INK, 3, 10, 1, 1); P(INK, 8, 10, 1, 1); }
      else if (e === 'stern') { P(INK, 2, 4, 4, 1); P(INK, 6, 4, 4, 1); P(INK, 1, 3, 2, 1); P(INK, 9, 3, 2, 1); P('#ffffff', 2, ey, 3, 1); P('#ffffff', 7, ey, 3, 1); P(INK, 3, ey, 2, 1); P(INK, 7, ey, 2, 1); P(sh(SKIN, -0.3), 5, 6, 2, 2); P(INK, 4, 9, 5, 1); }
      else if (e === 'wow') { P('#ffffff', 2, ey - 1, 3, 3); P('#ffffff', 7, ey - 1, 3, 3); P(INK, 3, ey - 1, 2, 2); P(INK, 8, ey - 1, 2, 2); P(B, 2, 2, 3, 1); P(B, 7, 2, 3, 1); P(INK, 5, 9, 2, 2); }
      else if (e === 'smirk') { P('#ffffff', 2, ey, 3, 2); P('#ffffff', 7, ey, 3, 2); P(INK, 3, ey, 2, 2); P(INK, 8, ey, 2, 2); P(B, 2, 3, 3, 1); P(B, 7, 2, 3, 1); P(INK, 4, 9, 4, 1); P(INK, 8, 8, 1, 1); }
      else { P('#ffffff', 2, ey, 3, 2); P('#ffffff', 7, ey, 3, 2); P(INK, 3, ey, 2, 2); P(INK, 8, ey, 2, 2); P(B, 2, 3, 3, 1); P(B, 7, 3, 3, 1); P(INK, 4, 9, 4, 1); }
      if (o.beard) { P('#c0cbdc', 0, 8, 2, 4); P('#c0cbdc', 10, 8, 2, 4); P('#c0cbdc', 2, 10, 8, 2); P('#8b9bb4', 9, 10, 3, 2); if (e === 'stern') P(INK, 4, 9, 5, 1); }
      if (o.stubble) { A(c, '#3e2731', 0.35, x, y + 9 * s, 12 * s, 3 * s); }
      if (o.talk && e !== 'joy' && e !== 'wow') P(INK, 4, 9, 4, 2);
    }
    function emote(c, kind, x, y) {
      if (kind === 'sweat') { R(c, '#2ce8f5', x + 1, y, 2, 2); R(c, '#2ce8f5', x, y + 2, 4, 3); R(c, '#ffffff', x + 1, y + 2, 1, 1); }
      if (kind === 'laugh') { R(c, '#fee761', x, y + 3, 1, 3); R(c, '#fee761', x + 3, y, 1, 4); R(c, '#fee761', x + 6, y + 3, 1, 3); }
      if (kind === 'bang') { R(c, '#fee761', x, y, 3, 6); R(c, '#fee761', x, y + 8, 3, 3); }
      if (kind === 'dots') { R(c, '#ffffff', x - 2, y + 2, 14, 7); R(c, INK, x, y + 4, 2, 2); R(c, INK, x + 4, y + 4, 2, 2); R(c, INK, x + 8, y + 4, 2, 2); }
      if (kind === 'anger') { R(c, '#e43b44', x, y + 2, 7, 2); R(c, '#e43b44', x + 2, y, 2, 7); }
    }
    function man(c, x, y, o) {
      var S0 = o.shirt, D = sh(S0, -0.3), L = sh(S0, 0.25), P = '#262b44', sit = o.pose === 'sit' || o.pose === 'slump', by = y + 12, hx = x + 2, hy = y;
      A(c, '#000000', 0.3, x - 2, y + (sit ? 33 : 39), 20, 3);
      if (sit) { R(c, P, x + 1, by + 13, 14, 5); R(c, sh(P, 0.2), x + 1, by + 13, 14, 1); R(c, P, x + 2, by + 18, 5, 6); R(c, P, x + 9, by + 18, 5, 6); R(c, INK, x + 1, by + 23, 6, 3); R(c, INK, x + 9, by + 23, 6, 3); }
      else { R(c, P, x + 2, by + 14, 5, 12); R(c, P, x + 9, by + 14, 5, 12); R(c, sh(P, 0.2), x + 2, by + 14, 1, 12); R(c, INK, x + 1, by + 25, 7, 3); R(c, INK, x + 8, by + 25, 7, 3); }
      if (o.pose === 'slump') { by += 3; hy += 5; hx += 1; }
      R(c, S0, x, by, 16, 14); R(c, D, x + 12, by, 4, 14); R(c, L, x, by, 12, 1); R(c, D, x, by + 12, 16, 2); R(c, '#ffffff', x + 5, by + 4, 5, 5); R(c, D, x + 6, by + 5, 3, 3);
      if (o.pose === 'cross') { R(c, D, x - 1, by + 5, 18, 5); R(c, L, x - 1, by + 5, 18, 1); R(c, SKIN, x - 1, by + 6, 3, 3); R(c, SKIN, x + 14, by + 7, 3, 3); }
      else if (o.pose === 'slump') { R(c, S0, x - 3, by + 2, 4, 9); R(c, D, x + 15, by + 2, 4, 9); R(c, SKIN, x + 2, by + 11, 4, 3); R(c, sh(SKIN, -0.18), x + 10, by + 11, 4, 3); }
      else { R(c, S0, x - 3, by + 1, 4, 11); R(c, L, x - 3, by + 1, 4, 1); R(c, SKIN, x - 3, by + 12, 4, 3); if (o.arm === 'up') { R(c, S0, x + 15, by - 6, 4, 8); R(c, SKIN, x + 15, by - 9, 4, 3); } else { R(c, D, x + 15, by + 1, 4, 11); R(c, sh(SKIN, -0.18), x + 15, by + 12, 4, 3); } }
      R(c, sh(SKIN, -0.18), hx + 4, hy + 11, 4, 2);
      head(c, hx, hy, 1, o);
      if (o.emote) emote(c, o.emote, hx + 13, hy - 9);
    }
    function big(c, x, y, o) { c.setTransform(3, 0, 0, 3, x * 2, y * 2); man(c, 0, 0, o); c.setTransform(2, 0, 0, 2, 0, 0); }
    function locker(c, x, col, tone) {
      R(c, sh(tone, -0.45), x, 62, 40, 78); R(c, sh(tone, -0.2), x + 2, 64, 36, 3); R(c, sh(tone, -0.6), x + 2, 67, 36, 71); R(c, '#5a6988', x + 4, 70, 32, 2);
      R(c, col, x + 10, 74, 20, 26); R(c, sh(col, -0.3), x + 25, 74, 5, 26); R(c, sh(col, 0.25), x + 10, 74, 15, 2); R(c, col, x + 6, 76, 4, 12); R(c, sh(col, -0.3), x + 30, 76, 4, 12); R(c, '#ffffff', x + 16, 82, 8, 9);
      R(c, '#feae34', x + 8, 112, 10, 14); R(c, sh('#feae34', -0.35), x + 15, 112, 3, 14); R(c, '#181425', x + 22, 118, 12, 10);
    }
    function room(c, warm) {
      var tone = warm ? '#4a3f5c' : '#2f3d5e';
      var g = c.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, sh(tone, -0.35)); g.addColorStop(0.65, tone); g.addColorStop(1, sh(tone, -0.2)); c.fillStyle = g; c.fillRect(0, 0, 320, 220);
      for (var k = 0; k < 8; k++) locker(c, k * 40, '#2ce8f5', tone);
      R(c, '#b86f50', 0, 140, 320, 7); R(c, sh('#b86f50', 0.25), 0, 140, 320, 1); R(c, sh('#b86f50', -0.4), 0, 147, 320, 3);
      for (var b = 0; b < 4; b++) R(c, sh(tone, -0.55), 20 + b * 90, 150, 5, 22);
      var f = c.createLinearGradient(0, 172, 0, 220); f.addColorStop(0, sh(tone, 0.12)); f.addColorStop(1, sh(tone, -0.3)); c.fillStyle = f; c.fillRect(0, 172, 320, 48);
      for (var t = 0; t < 320; t += 32) A(c, '#000000', 0.12, t, 172, 1, 48); A(c, '#000000', 0.12, 0, 196, 320, 1);
      [70, 230].forEach(function (lx) { var lg = c.createRadialGradient(lx, 20, 4, lx, 110, 150); lg.addColorStop(0, warm ? 'rgba(254,231,97,0.34)' : 'rgba(192,230,255,0.3)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = lg; c.fillRect(0, 0, 320, 220); R(c, '#ffffff', lx - 10, 6, 20, 3); R(c, '#3a4466', lx - 12, 3, 24, 3); });
      R(c, '#181425', 150, 198, 12, 7); R(c, '#c0cbdc', 151, 203, 10, 2);
    }
    // Вечер, старая машина сестры: видны двое в окнах
    function car(c, st) {
      var g = c.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, '#181425'); g.addColorStop(0.7, '#3a2f55'); g.addColorStop(1, '#262b44'); c.fillStyle = g; c.fillRect(0, 0, 320, 220);
      for (var i = 0; i < 26; i++) R(c, '#ffffff', (i * 53) % 320, (i * 29) % 60, 1, 1);
      for (var b = 0; b < 7; b++) { var bx = b * 50 - 10, bh = 40 + (b * 37) % 40; R(c, '#262b44', bx, 132 - bh, 42, bh); for (var w = 0; w < 6; w++) if ((b + w) % 3) R(c, '#feae34', bx + 6 + (w % 3) * 12, 132 - bh + 8 + Math.floor(w / 3) * 14, 5, 6); }
      [40, 280].forEach(function (lx) { R(c, '#5a6988', lx, 60, 3, 110); R(c, '#fee761', lx - 6, 56, 15, 5); var lg = c.createRadialGradient(lx, 62, 2, lx, 110, 80); lg.addColorStop(0, 'rgba(254,231,97,0.35)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = lg; c.fillRect(0, 40, 320, 180); });
      R(c, '#3a4466', 0, 172, 320, 48); R(c, '#262b44', 0, 172, 320, 3); for (var d = 0; d < 320; d += 40) R(c, '#fee761', d + 6, 196, 20, 2);
      A(c, '#000000', 0.35, 46, 176, 232, 6);
      R(c, '#e43b44', 50, 130, 224, 42); R(c, sh('#e43b44', -0.35), 50, 160, 224, 12); R(c, sh('#e43b44', 0.2), 50, 130, 224, 2);
      R(c, '#e43b44', 92, 92, 140, 40); R(c, sh('#e43b44', 0.2), 92, 92, 140, 2); R(c, '#181425', 98, 98, 60, 32); R(c, '#181425', 166, 98, 60, 32); R(c, sh('#e43b44', -0.35), 158, 92, 8, 80);
      R(c, '#fee761', 266, 140, 8, 8); R(c, '#9e2835', 50, 140, 5, 8); R(c, '#c0cbdc', 150, 148, 10, 2); R(c, '#c0cbdc', 216, 148, 10, 2); R(c, sh('#e43b44', -0.5), 70, 150, 30, 3);
      [[78, 164], [226, 164]].forEach(function (p) { R(c, '#181425', p[0], p[1], 26, 16); R(c, '#181425', p[0] + 4, p[1] - 4, 18, 24); R(c, '#8b9bb4', p[0] + 8, p[1] + 3, 10, 10); });
      c.save(); c.beginPath(); c.rect(98, 98, 60, 32); c.rect(166, 98, 60, 32); c.clip();
      R(c, st.you.shirt, 108, 124, 40, 10); head(c, 116, 100, 2, st.you); R(c, st.anya.shirt, 176, 124, 40, 10); head(c, 184, 100, 2, st.anya);
      c.restore();
      A(c, '#ffffff', 0.12, 100, 98, 10, 32); A(c, '#ffffff', 0.12, 168, 98, 10, 32);
      if (st.you.emote) emote(c, st.you.emote, 140, 84); if (st.anya.emote) emote(c, st.anya.emote, 208, 84);
    }
    function bubble(c, text, tx, kind) {
      c.setTransform(1, 0, 0, 1, 0, 0); c.font = '600 26px Handjet, "Arial Narrow", sans-serif'; c.textBaseline = 'top';
      var ls = [], line = ''; text.split(' ').forEach(function (w) { var t = line ? line + ' ' + w : w; if (c.measureText(t).width > 560 && line) { ls.push(line); line = w; } else line = t; }); if (line) ls.push(line);
      c.setTransform(2, 0, 0, 2, 0, 0); var bh = ls.length * 14 + 8, by = 6, col = kind === 'hard' ? '#fee761' : kind === 'low' ? '#c0cbdc' : '#ffffff';
      R(c, '#0e0c18', 12, by + 2, 300, bh); R(c, col, 10, by, 300, bh); R(c, col, tx, by + bh, 5, 3); R(c, col, tx + 1, by + bh + 3, 3, 3);
      c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = INK; ls.forEach(function (l, n) { c.fillText(l, 36, (by + 4) * 2 + n * 28); }); c.setTransform(2, 0, 0, 2, 0, 0);
    }
    // Реплика: [кто, текст, 'кто=эмоция:значок:поза кто=...', вид пузыря]. Состояние копится от реплики к реплике.
    var DATA = {
      '1a': { title: 'ПЕРВЫЙ ДЕНЬ', bg: 'room', warm: true, cast: { you: [40, 112, 'stand'], sht: [124, 102, 'sit'], bat: [188, 102, 'sit'] }, lines: [
        ['sht', 'О, новенький. Тебя как звать?', 'sht=joy you=wow'],
        ['you', '{name}', 'you=norm sht=norm'],
        ['bat', 'Неважно. Будет Малой.', 'bat=smirk you=sad:dots'],
        ['you', 'Я вообще-то ещё расту.', 'you=stern:anger sht=joy:laugh'],
        ['sht', 'Не обижайся. Меня вообще в честь железки назвали. Я Штанга: попадаю в неё чаще, чем в ворота.', 'sht=joy::sit+up you=norm'],
        ['bat', 'Я Глеб. Для этих детей Батя: мне девятнадцать, я тут самый древний.', 'bat=smirk sht=norm::sit'],
        ['ded', 'Малой. Первая смена твоя. Посмотрим, зачем тебя сюда привезли.', 'ded=stern::cross@262,112 you=wow:bang sht=wow bat=norm', 'hard'],
        ['sht', 'Это он так здоровается.', 'sht=smirk you=norm', 'low']
      ] },
      '2a': { title: 'ВОПРОС ДЕДА', bg: 'room', warm: false, cast: { you: [70, 102, 'sit'], sht: [10, 102, 'sit'], ded: [200, 112, 'cross'] }, lines: [
        ['ded', 'Вчера я видел, как ты бросаешь. Теперь вопрос сложнее. Зачем ты команде?', 'ded=stern you=wow sht=norm', 'hard'],
        ['you', 'Ну... забивать?', 'you=sad:sweat'],
        ['ded', 'Забивать хотят все. Я спрашиваю, какой ты, когда не забивается.', 'ded=stern you=wow:dots'],
        ['sht', 'Отвечай честно. Он всё равно узнает.', 'sht=smirk you=norm', 'low']
      ] },
      '3a': { title: 'ПО ДОРОГЕ НА ИГРУ', bg: 'car', cast: { you: [0, 0, ''], anya: [0, 0, ''] }, lines: [
        ['anya', 'Ты молчишь уже четыре светофора.', 'anya=smirk you=sad'],
        ['you', 'Там в составе все на голову выше меня.', 'you=sad:sweat'],
        ['anya', 'В прямом смысле?', 'anya=norm'],
        ['you', 'В прямом.', 'you=stern'],
        ['anya', 'Отлично. Значит, шайбу внизу они видят хуже тебя.', 'anya=joy you=wow:bang'],
        ['you', 'Это так не работает.', 'you=smirk anya=smirk'],
        ['anya', 'Ты проверял?', 'anya=joy:laugh you=norm']
      ] },
      '3b': { title: 'РАЗДЕВАЛКА ПОСЛЕ ИГРЫ', bg: 'room', warm: true, cast: { you: [70, 107, 'slump'], sht: [140, 102, 'sit'], ded: [256, 114, 'cross'] }, lines: [
        ['sht', 'Чего лицо такое? Та шайба вообще не твоя была.', 'sht=norm you=sad:sweat:slump ded=stern'],
        ['you', 'Я мог успеть.', 'you=sad::slump'],
        ['sht', 'Мог. А я в прошлом сезоне забил в свои ворота. Дважды. В одном матче.', 'sht=joy:laugh:sit+up'],
        ['you', 'И что тебе сказали?', 'you=wow::sit sht=joy::sit'],
        ['sht', 'Что у меня хотя бы бросок поставлен.', 'sht=smirk you=smirk'],
        ['ded', 'Пропустили все пятеро. Мне интересно другое: что каждый сделает в следующей смене. Начиная с тебя, Малой.', 'ded=stern you=wow:bang sht=wow', 'hard'],
        ['sht', 'Это он так хвалит. Лет через пять привыкнешь.', 'sht=smirk you=norm', 'low']
      ] },
      '4a': { title: 'СОСТАВ', bg: 'room', warm: false, cast: { you: [70, 102, 'sit'], bat: [140, 102, 'sit'], ded: [236, 112, 'cross'] }, lines: [
        ['ded', 'Состав на первый период. Малой, ты пока сидишь.', 'ded=stern you=wow:bang bat=norm', 'hard'],
        ['you', 'За что?', 'you=stern:anger'],
        ['ded', 'Ни за что. Сидишь.', 'ded=stern you=sad:dots'],
        ['bat', 'Двигайся. Я на этой скамейке третий год сижу лучше всех в лиге. Научу.', 'bat=smirk you=sad::slump']
      ] },
      '4b': { title: 'ПОСЛЕ ИГРЫ', bg: 'room', warm: true, cast: { you: [70, 102, 'sit'], bat: [140, 102, 'sit'], sht: [216, 102, 'sit'] }, lines: [
        ['bat', 'Знаешь, что видно со скамейки? Всё. Кто закипает, кто прячется, у кого вратарь не закрывает левый угол.', 'bat=norm you=norm sht=norm'],
        ['you', 'Ты поэтому не злишься, что мало играешь?', 'you=wow'],
        ['bat', 'Злюсь. Просто сижу при этом с пользой.', 'bat=smirk you=smirk'],
        ['sht', 'Он врёт. Он там семечки ест.', 'sht=joy:laugh:sit+up bat=stern:anger', 'low']
      ] }
    };
    function stateAt(sc, i) {
      var st = {}, k; for (k in sc.cast) { st[k] = { x: sc.cast[k][0], y: sc.cast[k][1], pose: sc.cast[k][2], emo: 'norm', on: true }; for (var q in CAST[k]) st[k][q] = CAST[k][q]; }
      if (!sc.cast.ded) { st.ded = { on: false }; for (var q2 in CAST.ded) st.ded[q2] = CAST.ded[q2]; }
      for (var n = 0; n <= i; n++) { for (k in st) st[k].emote = ''; (sc.lines[n][2] || '').split(' ').forEach(function (tok) { if (!tok) return; var a = tok.split('='), id = a[0], at = a[1].split('@'), p = at[0].split(':'), o = st[id]; if (!o) return;
        o.on = true; o.emo = p[0] || o.emo; o.emote = p[1] || ''; if (p[2]) { var ps = p[2].split('+'); o.pose = ps[0]; o.arm = ps[1] || ''; } if (at[1]) { o.x = +at[1].split(',')[0]; o.y = +at[1].split(',')[1]; } }); }
      for (k in st) st[k].talk = k === sc.lines[i][0];
      return st;
    }
    function draw(c, key, i) {
      var sc = DATA[key], st = stateAt(sc, i), who = sc.lines[i][0], tx;
      c.imageSmoothingEnabled = false; c.setTransform(2, 0, 0, 2, 0, 0);
      if (sc.bg === 'car') { car(c, st); tx = who === 'you' ? 126 : 194; }
      else { room(c, sc.warm); Object.keys(st).sort(function (a, b) { return st[a].y - st[b].y; }).forEach(function (k) { if (st[k].on && st[k].x != null) big(c, st[k].x, st[k].y, st[k]); }); tx = st[who].x + 14; }
      bubble(c, text(key, i), Math.max(16, Math.min(296, tx)), sc.lines[i][3]);
    }
    function text(key, i) { return DATA[key].lines[i][1].replace('{name}', S.name ? S.name + '.' : 'Меня зовут...'); }
    return { data: DATA, draw: draw, cast: CAST, text: text };
  })();
  var SC = null;
  function scnWant(key) { return !!SCENE.data[key] && !(S.sc && S.sc[key]) && !SIM && !(navigator.webdriver && !window.__scenes); }
  function scnShow() {
    var sc = SCENE.data[SC.key], last = SC.i === sc.lines.length - 1;
    if (view !== 'scene' || !document.getElementById('scn')) { view = 'scene';
      screen(sc.title, '<span class="tag tag--mute">' + sc.title + '</span><canvas id="scn" width="640" height="440" data-act="scn" style="width:100%;height:auto;border:4px solid var(--slate);cursor:pointer" role="img"></canvas><p class="note" id="scnwho"></p>',
        '<button class="btn" type="button" data-act="scn" id="scnbtn">ДАЛЬШЕ ▶</button><button class="btn btn--ghost" type="button" data-act="scnskip">ПРОПУСТИТЬ СЦЕНУ</button>'); }
    var cvs = document.getElementById('scn'); SCENE.draw(cvs.getContext('2d'), SC.key, SC.i);
    cvs.setAttribute('aria-label', SCENE.cast[sc.lines[SC.i][0]].name + ': ' + SCENE.text(SC.key, SC.i));
    document.getElementById('scnwho').textContent = SCENE.cast[sc.lines[SC.i][0]].name + ' · ' + (SC.i + 1) + ' из ' + sc.lines.length;
    document.getElementById('scnbtn').textContent = last ? 'ДАЛЬШЕ ▶▶' : 'ДАЛЬШЕ ▶';
  }
  function playScene(key, done) { SC = { key: key, i: 0, done: done }; log(+key.charAt(0), 'scene', { k: key }); scnShow(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (SC && view === 'scene') scnShow(); }); }
  function scnNext() { if (!SC) return; if (SC.i < SCENE.data[SC.key].lines.length - 1) { SC.i++; return scnShow(); } scnEnd(false); }
  function scnEnd(skipped) { if (!SC) return; var d = SC.done; S.sc = S.sc || {}; S.sc[SC.key] = 1; save(); if (skipped) log(+SC.key.charAt(0), 'scene_skip', { k: SC.key, at: SC.i + 1 }); SC = null; d(); }
