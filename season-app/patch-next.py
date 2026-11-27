# Правки текстов копии игры поверх patch2.py (запускается из build_next.py во временной папке)
p='mvp2.html';s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
rep("Защитник: бросок из-за синей линии летит быстрее и пробивает одного защитника, но разворачивается он тяжелее.","Защитник: бросок из-за синей линии летит быстрее, а его щелчок издалека вратарь не успевает прочитать. Разворачивается он тяжелее.")
rep("Три отрезка по 35 секунд.","' + (m.id === 1 ? 'Три коротких отрезка по 25 секунд.' : 'Три отрезка по 35 секунд.') + '")
rep("<title>Edge Season Two Thumbs</title>","<title>Edge Season Next</title>")
rep("    brief(m);\n  }\n  function brief(m) {","    if (m.pre && !(S.pre && S.pre[id])) return m.pre(function () { brief(m); });\n    brief(m);\n  }\n  function brief(m) {")
rep("var si = Math.random() < 0.5 ? 0 : 1,","var si = Math.floor(Math.random() * opts.length),")
rep("Четыре матча пройдены. Дальше в полной версии: дерби и первый месяц до конца.","Все готовые матчи пройдены. Продолжение в работе.")
rep(": '<span class=\"tag tag--mute\">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class=\"h1\">ДЕНЬ, КОГДА МАЛО ИГРАЛ</h1>",": MATCHES[id - 1].life ? '<span class=\"tag tag--mute\">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class=\"h1\">' + MATCHES[id - 1].life.h + '</h1><p class=\"lead\">' + MATCHES[id - 1].life.t + '</p>' : '<span class=\"tag tag--mute\">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class=\"h1\">ДЕНЬ, КОГДА МАЛО ИГРАЛ</h1>")
rep("case 'quit': x = 'вышел из матча'; break;","case 'quit': x = 'вышел из матча'; break;\n      case 'word': x = 'сказал своё слово, шум ушёл'; break;")
rep("    screen(m.name, '<span class=\"tag\">МАТЧ","    extra += worldBrief(m);\n    screen(m.name, '<span class=\"tag\">МАТЧ")
rep("'<span>РАЗДЕВАЛКА</span>' + pips(S.room) +","'<span>РАЗДЕВАЛКА</span>' + pips(S.room) + (S.form != null ? '<span>ФОРМА</span>' + pips(S.form) + '<span>РЕПУТАЦИЯ</span>' + pips(S.rep || 0) : '') +")
rep("var nb = { home: 1, decide: 1, decided: 1, quit: 1, result: 1, fix: 1 };","var nb = { home: 1, decide: 1, decided: 1, quit: 1, result: 1, fix: 1, world: 1 };")
rep("icept: 'защитник перехватил пас' }","icept: 'защитник перехватил пас', badpass: 'пас партнёра не дошёл' }")
rep("case 'word': x = 'сказал своё слово, шум ушёл'; break;","case 'word': x = 'сказал своё слово, шум ушёл'; break;\n      case 'path_end': x = 'ИТОГ ПУТИ, баллов ' + r.sc; break;")
rep("if (!S.done[MATCHES[i].id]) return MATCHES[i].id;","if (!S.done[MATCHES[i].id] && !MATCHES[i].pool) return MATCHES[i].id;")
rep("var done = S.done[m.id], open = m.id === nx,","if (m.id === 13) h += '<h2 class=\"h2\">ОБЫЧНЫЕ МАТЧИ: ИГРАЙ ЛЮБЫЕ' + (S.done[7] ? '' : ' ПОСЛЕ ДЕРБИ') + '</h2>' + (S.rec ? '<p class=\"note\">Рекорд тренировки: идеальных бросков ' + S.rec + '</p>' : '');\n      if (m.id === 28) h += '<h2 class=\"h2\">ОБЫЧНЫЕ МАТЧИ ВТОРОГО ПУТИ' + (S.done[22] ? '' : ': ПОСЛЕ ДЕБЮТА') + '</h2>';\n      var done = S.done[m.id], open = m.pool ? !!S.done[m.pool2 ? 22 : 7] && !done : m.id === nx,")
rep("function screen(title, body, foot) { app.innerHTML = hud(title) + '<main class=\"stage gut\" id=\"stage\"><div class=\"stage__in\">' + body + '</div></main>' + (foot ? '<div class=\"foot gut\">' + foot + '</div>' : ''); }","function screen(title, body, foot) { app.innerHTML = hx(hud(title)) + '<main class=\"stage gut\" id=\"stage\"><div class=\"stage__in\">' + hx(body) + '</div></main>' + (foot ? '<div class=\"foot gut\">' + hx(foot) + '</div>' : ''); }")
rep("if (!S.sound || !audio || audio.state","if (!S.sound || S.music === false || !audio || audio.state")
rep("<button class=\"btn btn--ghost\" type=\"button\" data-act=\"logs\">ЖУРНАЛ ТЕСТА</button><button class=\"btn btn--ghost\" type=\"button\" data-act=\"wipeask\">НАЧАТЬ ЗАНОВО</button>');","<button class=\"btn btn--ghost\" type=\"button\" data-act=\"settings\">НАСТРОЙКИ</button>');")
rep("    if (a === 'life1go') {","    if (a === 'settings') return settings();\n    if (a === 'tgl') { var tk = el.getAttribute('data-k'); if (tk === 'lang') S.lang = S.lang === 'en' ? 'ru' : 'en'; else S[tk] = tk === 'lefty' || tk === 'fast1' || tk === 'short' ? !S[tk] : S[tk] === false ? true : false; save(); if (!S.sound) breathSound(false); return settings(); }\n    if (a === 'parent') return parentGate();\n    if (a === 'parentgo') return +pick.pans === pick.pa[0] * pick.pa[1] ? parentInfo() : parentGate(true);\n    if (a === 'life1go') {")
rep("var nb = { home: 1, decide: 1, decided: 1, quit: 1, result: 1, fix: 1, world: 1 };","var nb = { home: 1, decide: 1, decided: 1, quit: 1, result: 1, fix: 1, world: 1, settings: 1, parent: 1 };")
rep("if (m.id === 13) h +=","if (m.id === 22) h += '<span class=\"tag tag--red\">ПУТЬ 2 · ГЕРОЙ · ЧЕРНОВИК, ШЕСТЬ МАТЧЕЙ ИЗ ДВЕНАДЦАТИ</span>';\n      if (m.id === 13) h +=")
rep("icept: 'перехват паса', rival_goal","icept: 'перехват паса', noise: 'шум трибун', badpass: 'пас не дошёл', rival_goal")
rep("+ (r.far ? ', издалека' : ''); break;","+ (r.far ? ', издалека' : '') + (r.one ? ', в касание' : ''); break;\n      case 'flow': x = 'ПОТОК: три идеальных гола подряд'; break;\n      case 'sit': x = 'ситуация: ' + ({ pp: 'большинство', pk: 'меньшинство', empty: 'пустые ворота' }[r.s] || r.s); break;\n      case 'world': x = 'мир изменился: ' + r.d; break;\n      case 'series': x = 'серия ' + r.w + ':' + r.l + (r.over ? ', решена' : ''); break;")
rep("save(); log(d.mid, 'decision',","S.dec = S.dec || {}; S.dec[d.mid + ':' + d.key] = o.label; save(); log(d.mid, 'decision',")
rep("<button class=\"btn btn--ghost\" type=\"button\" data-act=\"settings\">НАСТРОЙКИ</button>');","<button class=\"btn btn--ghost\" type=\"button\" data-act=\"stars\">МОИ ЗВЁЗДЫ И РЕШЕНИЯ</button><button class=\"btn btn--ghost\" type=\"button\" data-act=\"settings\">НАСТРОЙКИ</button>');")
rep("    if (a === 'settings') return settings();","    if (a === 'stars') return starsScreen();\n    if (a === 'settings') return settings();")
rep("  function musicTick() {\n","  function musicTick() {\n    if (musicFile()) return;\n")
rep("    if (id === 1 && !S.role) return pre1a();","    if (id === 1 && !S.role && S.fast1) { S.role = 'F'; S.num = '9'; S.askRole = true; save(); log(1, 'fast_entry'); return startMatch(1); }\n    if (id === 1 && !S.role) return pre1a();")
rep("return brief(MATCHES[0]); }","if (S.askRole && G) { S.askRole = false; save(); return FLOW(); } return brief(MATCHES[0]); }")
rep("    if (a === 'stars') return starsScreen();","    if (a === 'savecode') return saveCode();\n    if (a === 'loadcode') { if (codeLoad(pick.code)) return home(); return saveCode('Код не подошёл. Проверь, что он скопирован целиком.'); }\n    if (a === 'stars') return starsScreen();")
rep("case 'path_end':","case 'fast_entry': x = 'вход для теста: сразу на лёд'; break;\n      case 'path_end':")
rep("fix: 1, world: 1, settings: 1, parent: 1 };","fix: 1, world: 1, settings: 1, parent: 1, savecode: 1 };")
rep("'</b>«' + m.team + '» · вратарь ' + m.rival + '</span>","'</b>«' + m.team + '»' + cityOf(m.team) + ' · вратарь ' + m.rival + '</span>")
rep("Ты в команде «Северный Ветер».","Ты в команде «Северный Ветер» из Ледогорска.")
rep("TEAM.toUpperCase() + '</span><span>ДОВЕРИЕ</span>'","TEAM.toUpperCase() + cityOf(TEAM).toUpperCase() + '</span><span>ДОВЕРИЕ</span>'")
# Облако: прогресс и журнал копии дублируются в хранилище страницы, чтобы не пропадать при выходе
rep("  function save() { if (SIM) return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }",
"""  var CL = null, clReady = false, clBusy = false, clDirty = false, clT = 0, TS0 = S.ts || 0, LB = [], lgId = 'c' + T0, lgBusy = false, lgT = 0;
  function save() { if (SIM) return; S.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} cloudSave(); }
  function cloudSave() { if (!CL || !clReady) return; clDirty = true; clearTimeout(clT); clT = setTimeout(cloudFlush, 2500); }
  function cloudFlush() { if (clBusy || !clDirty) return; clBusy = true; clDirty = false; CL.doc('season/state').set({ ts: S.ts || 0, json: JSON.stringify(S) }).catch(function () {}).then(function () { clBusy = false; if (clDirty) cloudSave(); }); }
  function cloudLog() { if (!CL || !clReady || lgT || !LB.length) return; lgT = setTimeout(function () { lgT = 0; if (lgBusy) return cloudLog(); lgBusy = true; var id = lgId, n = LB.length; CL.doc('log/' + id).set({ t0: T0, n: n, json: JSON.stringify(LB.slice(0, n)) }).then(function () { if (n >= 250) { LB = LB.slice(n); lgId = 'c' + Date.now(); } }).catch(function () {}).then(function () { lgBusy = false; if (LB.length > n || (n >= 250 && LB.length)) cloudLog(); }); }, 5000); }
  try { if (window.claude && window.claude.use) window.claude.use('db').then(function (db) { if (!db) return; CL = db; return db.doc('season/state').get().then(function (sn) { var d = sn.exists ? sn.data() : null; if (d && d.json && (d.ts || 0) > TS0 && !G) { var o = JSON.parse(d.json); S = blank(); for (var k in o) S[k] = o[k]; try { localStorage.setItem(KEY, d.json); } catch (e) {} if (view === 'home') home(); } clReady = true; if ((S.ts || 0) > ((d && d.ts) || 0)) cloudSave(); cloudLog(); }); }).catch(function () {}); } catch (e) {}""")
rep("LOG.push(r); if (LOG.length > 3000) LOG.shift();","LOG.push(r); if (LOG.length > 3000) LOG.shift(); LB.push(r); cloudLog();")
# Сцены между матчами (scenes-next.js): перед матчами 1-4 и после матчей 3 и 4
import os as _os
rep("  function runMatch(id) {", open(_os.path.dirname(_os.path.abspath(__file__)) + '/scenes-next.js', encoding='utf-8').read() + "  function runMatch(id) {")
rep("    var m = MATCHES[id - 1]; pick = {}; log(id, 'open');", "    if (!(id === 1 && !S.role && !S.fast1) && scnWant(id + 'a')) return playScene(id + 'a', function () { runMatch(id); });\n    var m = MATCHES[id - 1]; pick = {}; log(id, 'open');")
rep("    if (id === 1 && !S.life[1]) return life(1, home);", "    if (scnWant(id + 'b')) return playScene(id + 'b', function () { after(id); });\n    if (id === 1 && !S.life[1]) return life(1, home);")
rep("    if (a === 'savecode') return saveCode();", "    if (a === 'scn') return scnNext();\n    if (a === 'scnskip') return scnEnd(true);\n    if (a === 'savecode') return saveCode();")
rep("case 'fast_entry':", "case 'scene': x = 'сцена ' + r.k; break;\n      case 'scene_skip': x = 'пропустил сцену ' + r.k + ' на реплике ' + r.at; break;\n      case 'fast_entry':")
# Пачка 27 ноября: имя героя, сцена после выбора игрока, тексты без повторов
rep("if (S.askRole && G) { S.askRole = false; save(); return FLOW(); } return brief(MATCHES[0]); }", "if (S.askRole && G) { S.askRole = false; save(); return FLOW(); } return runMatch(1); }")
rep("S.role = pick.role; S.num = pick.num; save(); log(1, 'player'", "S.role = pick.role; S.num = pick.num; S.name = pick.name ? String(pick.name).slice(0, 12) : (S.name || ''); save(); log(1, 'player'")
rep("placeholder=\"Свой номер: от 1 до 99\" aria-label=\"Свой номер\" value=\"' + esc(own) + '\">',", "placeholder=\"Свой номер: от 1 до 99\" aria-label=\"Свой номер\" value=\"' + esc(own) + '\">' +\n      '<h2 class=\"h2\">ИМЯ</h2><input class=\"inp\" data-inp=\"name\" maxlength=\"12\" placeholder=\"Как тебя зовут в игре\" aria-label=\"Имя в игре\" value=\"' + esc(pick.name || S.name || '') + '\"><p class=\"note\">Имя остаётся только на этом устройстве. Можно не вводить.</p>',")
rep("about: 'Юниорская лига. Ты в команде «Северный Ветер» из Ледогорска. Тренер выпускает тебя в первой смене. Вратарь соперника новичок: двигается медленно.'", "about: 'Вратарь соперника новичок: двигается медленно. Самое время попробовать всё.'")
rep("горячая голова сразу остывает. Один раз за матч.", "горячая голова сразу остывает. Один раз за отрезок.", 2)
# На время тестов на главном экране только первые LIMIT матчей
rep("if (m.id === 22) h +=", "if (m.id > LIMIT) return;\n      if (m.id === 22) h +=")
rep("if (!S.done[MATCHES[i].id] && !MATCHES[i].pool) return MATCHES[i].id;", "if (!S.done[MATCHES[i].id] && !MATCHES[i].pool && MATCHES[i].id <= LIMIT) return MATCHES[i].id;")
assert chr(8212) not in s
open(p,'w',encoding='utf-8').write(s)
