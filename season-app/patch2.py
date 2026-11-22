p='mvp2.html';s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
def cut(a,b,new):
    global s
    i=s.index(a); j=s.index(b,i); s=s[:i]+new+s[j:]
cut("  /* ---------- матч ---------- */","  /* ---------- события ---------- */",open('engine.js',encoding='utf-8').read())
rep(".tag--red {", ".chip--back { color: var(--white); border-color: var(--white); font-family: system-ui, sans-serif; font-size: 18px; }\n.mine { color: var(--cyan); font-size: 19px; }\n.inp { background: var(--ink); border: 3px solid var(--steel); color: var(--white); font: inherit; padding: 10px 12px; min-height: 52px; width: 100%; border-radius: 0; }\n.inp::placeholder { color: var(--steel); }\n.cards--tight .card { min-height: 48px; padding: 8px 6px; font-size: 21px; }\n.tag--red {")
rep(".coach { position: absolute; left: 50%; top: 36%;",".coach { position: absolute; left: 50%; top: 27%;")
rep("height: 260px; font: 13px/1.35 ui-monospace, Menlo, Consolas, monospace;","height: 300px; font: 15px/1.4 system-ui, sans-serif;")
rep("var KEY = 'ce-season-mvp-1', LOGKEY = 'ce-season-mvp-log';","var KEY = 'ce-season-mvp-2', LOGKEY = 'ce-season-mvp-log-2';")
rep("var r = { t: Math.round((Date.now() - T0) / 100) / 10, m: m, e: e };","var r = { t: Math.round((Date.now() - T0) / 100) / 10, c: new Date().toTimeString().slice(0, 8), m: m, e: e };")
rep("""function hud(title) { return '<header class="hud gut"><span class="hud__ce">CE</span><span class="hud__t">' + title""",
"""function hud(title) { var nb = { home: 1, decide: 1, decided: 1, quit: 1, result: 1, fix: 1 }; return '<header class="hud gut">' + (nb[view] ? '<span class="hud__ce">CE</span>' : '<button class="chip chip--back" data-act="back" type="button" aria-label="Назад">◀</button>') + '<span class="hud__t">' + title""")
rep("var n = noise(3, 420, 0.0001); if (!n) return; n.s.loop = true; n.g.gain.linearRampToValueAtTime(0.06, n.a.currentTime + 0.3);",
    "var n = noise(3, 240, 0.0001); if (!n) return; n.s.loop = true; n.g.gain.linearRampToValueAtTime(0.012, n.a.currentTime + 0.6);")
rep("  /* ---------- экраны ---------- */", """  /* ---------- музыка: простая петля, временная, до работы композитора ---------- */
  var MUS = { t: null, step: 0, next: 0, gain: null };
  var CH = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]], ARP = [0, 1, 2, 1, 0, 2, 1, 2];
  function mnote(f, at, dur, type, vol) { var a = audio, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur); o.connect(g); g.connect(MUS.gain); o.start(at); o.stop(at + dur + 0.02); }
  function musicTick() {
    if (!S.sound || !audio || audio.state !== 'running' || document.hidden) return;
    var a = audio, play = view === 'play', sd = play ? 0.15 : 0.21; if (MUS.next < a.currentTime) MUS.next = a.currentTime + 0.05;
    MUS.gain.gain.setTargetAtTime(G && (G.breathing || G.wasFull) ? 0.25 : 1, a.currentTime, 0.15);
    while (MUS.next < a.currentTime + 0.3) { var st = MUS.step, c = CH[(st >> 4) & 3], k = st & 15;
      if (k % 4 === 0 || (play && k === 14)) mnote(c[0] / 2, MUS.next, sd * 2.2, 'triangle', 0.05);
      if (play ? k % 2 === 0 : k % 4 === 2) mnote(c[ARP[(k >> 1) & 7]] * 2, MUS.next, sd * 1.6, 'square', 0.011);
      MUS.next += sd; MUS.step = (st + 1) & 63; }
  }
  function startMusic() { if (MUS.t) return; try { var a = ac(); MUS.gain = a.createGain(); MUS.gain.connect(a.destination); MUS.t = setInterval(musicTick, 100); } catch (e) {} }

  /* ---------- экраны ---------- */""")
rep("АКТ 1 · ТАЛАНТ","ПУТЬ 1 · ТАЛАНТ")
rep("var NUMS = ","var TEAM = 'Северный Ветер';\n  var NUMS = ")
rep("name: 'ПЕРВЫЙ ВЫХОД', rival: 'Новичок', about: 'Юниорская лига. Тренер выпускает тебя в первой смене.'","name: 'ПЕРВЫЙ ВЫХОД', team: 'Кометы', rival: 'Новичок', about: 'Юниорская лига. Ты в команде «Северный Ветер». Тренер выпускает тебя в первой смене. Вратарь соперника новичок: двигается медленно.'")
rep("name: 'ЗА ЧТО ТЕБЯ ЦЕНИТЬ', rival:","name: 'В ЧЁМ ТВОЯ СУПЕРСИЛА', team: 'Вьюга', chase: [0, 0, 30], rival:")
rep("name: 'ПЕРВАЯ ОШИБКА', rival:","name: 'ПЕРВАЯ ОШИБКА', team: 'Кедры', chase: [0, 30, 34], rival:")
rep("name: 'СКАМЕЙКА', rival:","name: 'СКАМЕЙКА', team: 'Айсберг', chase: [0, 34, 40], rival:")
rep("star3: 'Стержень использован с горячей головой'","star3: 'Остудил голову стержнем в трудный момент'")
rep("'</b>Соперник: ' + m.rival + '</span>","'</b>«' + m.team + '» · вратарь ' + m.rival + '</span>")
rep("""'<span>ДОВЕРИЕ</span>' + pips(S.trust)""","""'<span>КОМАНДА</span><span style="color:#fff">' + TEAM.toUpperCase() + '</span><span>ДОВЕРИЕ</span>' + pips(S.trust)""")
rep("' · СОПЕРНИК: ' + m.rival.toUpperCase() + '</span>","' · «' + m.team.toUpperCase() + '»</span>")
cut("    var keys = m.id === 1 ?","    screen(m.name, '<span class=\"tag\">МАТЧ","""    var keys = m.id === 1 ? '<section class="panel"><div class="keys"><b>ПРАВЫЙ</b><span>Шайбу тебе пасует партнёр у борта. Принял: коснись справа внизу и тяни назад, появится линия броска. Отпусти: бросок.</span><b>ЗАМРИ</b><span>Подержи палец ровно секунду. Это выдох: линия сужается, голова остывает. Кистевой бросок, точный.</span><b>ЩЕЛЧОК</b><span>Быстрый тап правым: сильный бросок без прицела. Летит быстро, но широко.</span><b>ЛЕВЫЙ</b><span>Води слева внизу: ведёшь игрока. Отпустил: он катится дальше туда же. С шайбой не въезжай в красную рамку вратаря и не касайся защитников.</span></div></section>' : '';
    var extra = m.id === 2 ? '<section class="panel panel--hot"><h2 class="h2">НОВОЕ: СТЕРЖЕНЬ</h2><p>Стержень это твои сильные качества. Два быстрых тапа левым пальцем: горячая голова сразу остывает. Один раз за матч.</p><p>Заряжается, когда ты верен своим сильным качествам: в решениях на скамейке и поступками на льду. Сейчас: ' + (S.core ? 'заряжен.' : 'пуст.') + '</p></section>'
      : m.id > 2 && S.values.length ? '<section class="panel"><h2 class="h2">СТЕРЖЕНЬ: ' + (S.core ? 'ЗАРЯЖЕН' : 'ПУСТ') + '</h2><p>' + (S.core ? 'Два быстрых тапа левым пальцем, когда голова горячая.' : 'Зарядится от решения на скамейке или поступка на льду в духе твоего качества.') + '</p></section>' : '';
    if (m.id >= 2 && S.values.length) extra += '<section class="panel"><h2 class="h2">КАК ЗАРЯДИТЬ СТЕРЖЕНЬ НА ЛЬДУ</h2>' + S.values.map(function (v) { return '<p><span style="color:#fff">' + v + ':</span> ' + hintOf(v) + '</p>'; }).join('') + '</section>';
    if (m.chase) extra += '<p class="note">' + (m.id === 2 ? 'Оранжевый защитник' : 'Один из защитников') + ' идёт на тебя и отбирает шайбу. Уезжай от него левым пальцем.</p>';
    if (m.id === 4 && S.fix) extra += '<section class="panel panel--hot"><h2 class="h2">ПОПРАВКА ИЗ РАЗБОРА</h2><p>В первом твоём отрезке голубая рамка на воротах показывает, где вратарь окажется к моменту броска. Бросай мимо рамки.</p></section>';
""")
cut("  function pre1a() {","  var REV = ","""  function pre1a() {
    view = 'pre1'; var own = pick.num && NUMS.indexOf(pick.num) < 0 ? pick.num : '';
    screen('ТВОЙ ИГРОК', '<span class="tag">ДВА КАСАНИЯ</span><h1 class="h1">КТО ТЫ НА ЛЬДУ?</h1><div class="cards">' +
      [['F', 'Нападающий'], ['D', 'Защитник']].map(function (r) { return '<button class="card" type="button" data-act="pick" data-k="role" data-v="' + r[0] + '" aria-pressed="' + (pick.role === r[0]) + '">' + r[1] + '</button>'; }).join('') + '</div><p class="note">Нападающий: линия броска уже, идеальный момент для броска держится дольше. Защитник: бросок из-за синей линии летит быстрее и пробивает одного защитника, но разворачивается он тяжелее.</p>' +
      '<h2 class="h2">НОМЕР</h2><div class="cards" style="grid-template-columns:repeat(3,1fr)">' + NUMS.map(function (n) { return '<button class="card" type="button" data-act="pick" data-k="num" data-v="' + n + '" aria-pressed="' + (pick.num === n) + '">' + n + '</button>'; }).join('') + '</div>' +
      '<input class="inp" data-inp="num" inputmode="numeric" maxlength="2" placeholder="Свой номер: от 1 до 99" aria-label="Свой номер" value="' + esc(own) + '">',
      '<button class="btn" type="button" data-act="pre1done"' + (pick.role && pick.num ? '' : ' disabled') + '>ГОТОВО ▶</button>');
  }
  function values() {
    view = 'values'; pick.vals = pick.vals || []; var n = pick.vals.length;
    screen('СУПЕРСИЛА', '<span class="tag">АНКЕТА НОВИЧКА</span><h1 class="h1">В ЧЁМ ТВОЯ СУПЕРСИЛА?</h1><p>Выбери три сильных качества. Когда ты верен им в игре, заряжается стержень.</p><div class="cards cards--tight">' +
      VALUES.map(function (v) { return '<button class="card" type="button" data-act="val" data-v="' + v + '" aria-pressed="' + (pick.vals.indexOf(v) >= 0) + '">' + v + '</button>'; }).join('') + '</div><p class="note">Выбрано: ' + n + ' из 3</p>',
      '<button class="btn" type="button" data-act="valdone"' + (n === 3 ? '' : ' disabled') + '>ГОТОВО ▶</button>');
  }
  var GEST = ['Стукнуть клюшкой по льду', 'Поправить шлем', 'Сжать и разжать кулак', 'Глоток воды', 'Встряхнуть плечами', 'Перехватить клюшку', 'Коснуться борта', 'Взгляд в одну точку на льду'], WORD = ['Следующая', 'Здесь', 'Моя', 'Дальше', 'Играю', 'Спокойно'];
  function life(id, done) {
    view = 'life'; FLOW = done;
    if (id === 1 && !pick.l1) return screen('СБРОС', '<span class="tag tag--mute">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class="h1">ЧТО ТАКОЕ СБРОС</h1><p class="lead">Сброс это короткий ритуал после ошибки: движение, выдох, слово. Три секунды.</p>' +
      '<section class="panel"><h2 class="h2">ЗАЧЕМ</h2><p>После ошибки голова остаётся в прошлом эпизоде, и следующий ты играешь хуже. Сброс возвращает внимание в настоящий момент.</p></section>' +
      '<section class="panel"><h2 class="h2">В ИГРЕ</h2><p>Это твой выдох перед броском: голова остывает, линия сужается.</p></section>' +
      '<section class="panel"><h2 class="h2">В ЖИЗНИ</h2><p>То же самое после пропущенной шайбы, потери или свистка. Один и тот же ритуал каждый раз, чтобы он срабатывал сам.</p></section>',
      '<button class="btn" type="button" data-act="life1go">СОБРАТЬ СВОЙ СБРОС ▶</button>');
    var og = pick.gest && GEST.indexOf(pick.gest) < 0 ? pick.gest : '', ow = pick.word && WORD.indexOf(pick.word) < 0 ? pick.word : '';
    var body = id === 1 ? '<span class="tag tag--mute">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class="h1">СОБЕРИ СВОЙ СБРОС</h1><p>Движение, выдох, слово. Выбери то, что сделаешь на настоящем льду.</p><h2 class="h2">ДВИЖЕНИЕ</h2><div class="cards cards--tight">' +
        GEST.map(function (g) { return '<button class="card" type="button" data-act="pick" data-k="gest" data-v="' + g + '" aria-pressed="' + (pick.gest === g) + '">' + g + '</button>'; }).join('') + '</div><input class="inp" data-inp="gest" maxlength="40" placeholder="Или своё движение" aria-label="Своё движение" value="' + esc(og) + '">' +
        '<h2 class="h2">СЛОВО</h2><div class="cards cards--tight" style="grid-template-columns:repeat(3,1fr)">' +
        WORD.map(function (g) { return '<button class="card" type="button" data-act="pick" data-k="word" data-v="' + g + '" aria-pressed="' + (pick.word === g) + '">' + g + '</button>'; }).join('') + '</div><input class="inp" data-inp="word" maxlength="20" placeholder="Или своё слово" aria-label="Своё слово" value="' + esc(ow) + '">'
      : '<span class="tag tag--mute">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class="h1">ДЕНЬ, КОГДА МАЛО ИГРАЛ</h1><p class="lead">Перечитай свои сильные качества в день, когда мало играл. Они остаются с тобой и на скамейке.</p><p class="line">' + esc(S.values.join(' · ')) + '</p>';
    var ok = id !== 1 || (pick.gest && pick.word);
    screen('В ЖИЗНИ', body, '<button class="btn" type="button" data-act="lifeyes" data-m="' + id + '"' + (ok ? '' : ' disabled') + '>СДЕЛАЮ</button><button class="btn btn--ghost" type="button" data-act="lifeno" data-m="' + id + '">ПОЗЖЕ</button>');
  }
""")
rep("S.values.length < 3) return values(0);","S.values.length < 3) return values();")
rep("return values(pick.page); }","return values(); }")
rep("riv: [[24], [14, 30], [10, 26]], defs: [1, 1, 2]","riv: [[24], [14, 30], [10, 26]], defs: [1, 2, 2]")
rep("riv: [[6], [16], [10, 26]], defs: [1, 1, 2]","riv: [[6], [16], [10, 26]], defs: [2, 2, 2]")
rep("defs: [1, 2, 2], bench1","defs: [2, 2, 2], bench1")
rep('''<button class="btn btn--ghost" type="button" data-act="logs">ЖУРНАЛ ТЕСТА</button>');''','''<button class="btn btn--ghost" type="button" data-act="logs">ЖУРНАЛ ТЕСТА</button><button class="btn btn--ghost" type="button" data-act="wipeask">НАЧАТЬ ЗАНОВО</button>');''')
rep("    if (a === 'valnext') return values(1);\n    if (a === 'valback') return values(0);\n","    if (a === 'wipeask') { view = 'quit'; return screen('СЕЗОН', '<span class=\"tag tag--red\">СБРОС ПРОГРЕССА</span><h1 class=\"h1\">НАЧАТЬ ЗАНОВО?</h1><p class=\"lead\">Сотрутся пройденные матчи, игрок и журнал теста.</p>', '<button class=\"btn\" type=\"button\" data-act=\"wipe\">СТЕРЕТЬ И НАЧАТЬ ЗАНОВО</button><button class=\"btn btn--ghost\" type=\"button\" data-act=\"home\">ОТМЕНА</button>'); }\n    if (a === 'life1go') { pick.l1 = true; return life(1, FLOW); }\n    if (a === 'back') { if (G && view === 'play') return quit(); return home(); }\n    if (a === 'quitno') { rebuildMatchDom(); return run(); }\n    if (a === 'quityes') { log(M.id, 'quit'); G = null; return home(); }\n")
rep("var el = e.target.closest ? e.target.closest('[data-act]') : null; if (!el || el.disabled) return;","startMusic(); var el = e.target.closest ? e.target.closest('[data-act]') : null; if (!el || el.disabled) return;")
rep("""(o.dots ? '<span class="dots">'""","""(mineOf(o) ? '<span class="mine">★ Твоё сильное качество: ' + mineOf(o) + '</span>' : '') + (o.dots ? '<span class="dots">'""")
rep("  function chose(i) {","  function mineOf(o) { return (o.vals || []).filter(function (v) { return S.values.indexOf(v) >= 0; })[0] || ''; }\n  function chose(i) {")
rep("lines.push('Стержень заряжен: это было в духе твоей ценности «' + spirit + '»');","lines.push('Стержень заряжен: ты был верен своему сильному качеству «' + spirit + '»');")
rep("'<p class=\"note\">Точки показывают, что изменится. Больше точка: сильнее.</p>'","'<p class=\"note\">Точки показывают, что изменится. Больше точка: сильнее. Звезда: выбор в духе твоего сильного качества, он заряжает стержень.</p>'")
rep("  window.__mvp = { g: function () { return G; },","""  document.addEventListener('input', function (e) {
    var el = e.target, k = el.getAttribute ? el.getAttribute('data-inp') : null; if (!k) return; var v = el.value;
    if (k === 'num') { v = v.replace(/\\D/g, '').slice(0, 2); el.value = v; v = +v < 1 ? '' : String(+v); } else v = v.trim();
    pick[k] = v || null;
    [].forEach.call(document.querySelectorAll('[data-k="' + k + '"]'), function (c) { c.setAttribute('aria-pressed', 'false'); });
    var b = document.querySelector('[data-act="pre1done"],[data-act="lifeyes"]'); if (b) b.disabled = view === 'pre1' ? !(pick.role && pick.num) : !(pick.gest && pick.word);
  });
  window.__mvp = { pr: function () { return PR; }, g: function () { return G; },""")
rep("esc(LOG.map(function (r) { return JSON.stringify(r); }).join('\\n'))","esc(LOG.map(fmt).join('\\n'))")
rep("  function logs() {","""  function fmt(r) {
    var t = r.c || (Math.floor(r.t / 60) + ':' + ('0' + Math.floor(r.t % 60)).slice(-2)), p = function (v) { return Math.round((v || 0) * 100) + '%'; }, x;
    var MISS = { save: 'сейв вратаря', block: 'блок защитника', wide: 'мимо ворот', post: 'штанга', late: 'не успел бросить', steal: 'защитник отобрал', poke: 'вратарь выбил шайбу', icept: 'защитник перехватил пас' }, WHY = { save: 'сейв', block: 'блок', wide: 'мимо', post: 'штанга', late: 'не успел', steal: 'отобрали', poke: 'вратарь выбил', icept: 'перехват паса', rival_goal: 'гол соперника' };
    switch (r.e) {
      case 'open': x = 'открыл матч'; break;
      case 'player': x = 'игрок: ' + (r.role === 'D' ? 'защитник' : 'нападающий') + ', номер ' + r.num; break;
      case 'values': x = 'сильные качества: ' + (r.values || []).join(', '); break;
      case 'start': x = 'НАЧАЛО МАТЧА'; break;
      case 'bench_watch': x = 'первый отрезок на скамейке'; break;
      case 'shot': x = 'бросок: ширина линии ' + r.width + ', выдох ' + p(r.breath) + (r.top ? ', точно на выдохе' : '') + ', голова ' + p(r.heat) + (r.slap ? ', щелчок' : r.aimed ? '' : ', без прицела') + (r.far ? ', издалека' : ''); break;
      case 'overtime': x = 'ОВЕРТАЙМ'; break;
      case 'shootout': x = 'БУЛЛИТЫ'; break;
      case 'goal': x = 'ГОЛ' + (r.top ? ' (идеальный бросок)' : r.breath ? ' (с выдохом)' : ' (без выдоха)'); break;
      case 'miss': x = 'промах: ' + (MISS[r.kind] || r.kind); break;
      case 'heat': x = 'голова нагрелась до ' + p(r.heat) + ' (' + (WHY[r.by] || r.by) + ')'; break;
      case 'rival_goal': x = 'СОПЕРНИК ЗАБИЛ'; break;
      case 'hold_after_rival_goal': x = 'первый выдох после пропущенной: через ' + r.sec + ' с'; break;
      case 'core': x = 'включил стержень, голова была ' + p(r.heat); break;
      case 'decision': x = 'решение «' + r.key + '»: вариант ' + (r.choice + 1) + ', думал ' + (r.ms / 1000).toFixed(1) + ' с' + (r.spirit ? ', стержень заряжен (' + r.spirit + ')' : ''); break;
      case 'end': x = 'КОНЕЦ МАТЧА: ' + r.you + ':' + r.riv + ', звёзд ' + r.stars + ', бросков с узкой линией ' + p(r.narrowShare) + ', с горячей головой ' + r.hotSec + ' с, левый палец вёл ' + (r.leftSec || 0) + ' с, пустых двойных тапов ' + (r.falseTaps || 0); break;
      case 'charge': x = 'стержень заряжен на льду (' + r.q + ')'; break;
      case 'life': x = 'задание в жизни: ' + (r.answer === 'yes' ? 'сделаю' : 'позже'); break;
      case 'review': x = 'разбор: ответы ' + (r.answers || []).map(function (a) { return a + 1; }).join(', '); break;
      case 'quit': x = 'вышел из матча'; break;
      default: x = r.e;
    }
    return t + '  матч ' + r.m + '  ' + x;
  }
  function logs() {""")
rep("star3: 'Одна «девятка» за матч'","star3: 'Один идеальный бросок за матч'")
rep(".pacecap {", ".pace--riv { border-color: var(--red-dark); height: 14px; margin-bottom: 6px; }\n.pace--riv i { background: var(--red); }\n.pacecap {")
rep("Красные метки на полосе сверху: когда забьёт соперник.","Красная полоса сверху: давление соперника. Растёт само и прыгает от каждой твоей потери. Заполнилась: тебе забили. Твой гол её отбрасывает.")
rep("var S = blank(), LOG = [], T0 = Date.now();","var S = blank(), LOG = [], T0 = Date.now(), SIM = null;")
rep("function save() { try {","function save() { if (SIM) return; try {")
rep("function log(m, e, d) { var r","function log(m, e, d) { if (SIM) { var sk = e + (d && d.kind ? ':' + d.kind : ''); SIM.log[sk] = (SIM.log[sk] || 0) + 1; return; } var r")
rep("  function decide(mid, key, q, opts, cb, tag) {\n","  function decide(mid, key, q, opts, cb, tag) {\n    if (SIM) { var si = Math.random() < 0.5 ? 0 : 1, so0 = opts[si]; so0.apply(); var sm = mineOf(so0); if (sm) S.core = true; return cb(si, !!sm); }\n")
rep("window.__mvp = { pr: function () { return PR; },","window.__mvp = { sim: function (b, id, n, cfg) { return simBatch(b, id, n, cfg); }, pr: function () { return PR; },")
assert '—' not in s
s=s.replace('<title>Edge Season MVP</title>','<title>Edge Season Two Thumbs</title>')
open(p,'w',encoding='utf-8').write(s)
