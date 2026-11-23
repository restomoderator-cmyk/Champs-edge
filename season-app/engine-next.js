  /* ---------- матч: левый палец ведёт игрока, правый тянет назад, держит (выдох) и отпускает (бросок) ---------- */
  var W = 320, H = 470, NET_L = 110, NET_R = 210, GW = 44, SEG = 35, FLY = 620, GOAL_Y = 84, BREATH = 0.9, CLOCK = 9, ZONE = 392;
  // настройки баланса: одна таблица, по одному числу на матч там, где матчи различаются
  var T = { topV: 1.5, topR: [19, 17, 17, 15], rateK: [0.55, 1.1, 1.5, 0.97], push: [0.04, 0.2, 0.22, 0.2], goalPush: [0, 0.05, 0.05, 0.05], goalT: 2.0, chase: 1.7, gsp: [0.6, 1, 1, 1],
    slapSp: 0.06, seenAdd: 10, dSpread: 1.0, fSpread: 0.85, dTop: 0.7, pierce: 0, dFar: 1.3, dSlap: 1, segT: [25, 35, 35, 35], paceK: [1.3, 1.25, 1.3, 1], chaseM: [null, [0, 28, 32], [26, 32, 36], null] };
  window.__seasonTune = T;
  function tv(k) { var a = T[k]; if (M.tune && k in M.tune) return M.tune[k]; return M.id - 1 < a.length ? a[M.id - 1] : a[a.length - 1]; }
  var G = null, M = null, cv, cx, raf = 0, prev = 0, spr = {}, els = {}, PL = null, PR = null, KEYS = {}, lastL = 0;
  function mk(path) { var c = document.createElement('canvas'); c.width = 34; c.height = 36; drawHockeyPlayer(c.getContext('2d'), 2, 3, path, 0, false); return c; }
  function startMatch(id) {
    M = MATCHES[id - 1]; PL = PR = null; if (M.pickG) { var pg = M.pickG(); M.g = pg.g; M.rival = pg.name; } if (tv('chaseM')) M.chase = tv('chaseM');
    G = { seg: 0, t: 0, T: 0, you: 0, riv: 0, px: 160, py: 320, vx: 0, vy: 0, ax: 1, ay: 0, gx: 138, gdir: 1, gfreeze: 0, gspeed: 0,
      heat: 0, mg: M.g, tip: null, tipQ: [], hN: 0, hSide: 0, hB: 0, hY: 0, topRow: 0, flow: 0, flows: 0, recvAge: 9, oneGoals: 0, mheat: 0, mateHot: 0, losses: 0, noise: 0, nz: 4, shield: 0, trig: 0, hotShots: 0, segShots: 0, segFirst: [], breathK: 1, gheat: 0, breath: 0, over: 0, breathing: false, wasFull: false, core: S.core && id >= 2, coreHot: false,
      puck: { s: 'in', t: 0.5 }, clock: 0, defs: [], ch: null, rivAt: [], rivI: 0, msg: '', sub: '', msgT: 0, msgC: '#fff', parts: [], trail: [], stop: 0, jump: 0, net: 0, flash: 0, shake: 0,
      shots: 0, goals: 0, breathShots: 0, breathGoals: 0, narrow: 0, tops: 0, hot: 0, streak: 0, pause: 0, pauseText: null, done: false, nextSeg: null, afterPause: null,
      rivGoals: [], firstAfter: null, firstAfterBreath: false, lesson: id === 1 && !S.taught ? 0 : 9, l1: 0, l2: 0, leftSec: 0, falseTaps: 0, missRow: 0, breathRow: 0, segLen: SEG, safe: false, grace: 0, l3: 0, strip: id === 1 && !S.done[1], press: 0, rate: 0, mate: { x: 30, y: 300 }, recv: 0, so: null, soPend: null, endHow: '', fast: false, ghost: id === 4 && S.fix, playSeg: 0, finalSeg: true };
    log(id, 'start');
    spr.me = mk({ jersey: '#e43b44', jerseyDark: '#9e2835', trim: '#ffffff', beard: null, letter: null });
    spr.def = mk({ jersey: '#3b55b8', jerseyDark: '#1b2a6b', trim: '#feae34', beard: null, letter: null });
    spr.ch = id === 2 ? mk({ jersey: '#f77622', jerseyDark: '#b86f50', trim: '#181425', beard: null, letter: null }) : spr.def;
    rebuildMatchDom();
    var pe = (S.pre && S.pre[id]) || {}; G.heat = pe.heat || 0; G.breathK = pe.breathK || 1;
    if (M.series && !SIM) { S.ser = S.ser || {}; var s0 = S.ser[id]; if (s0 && s0.over) { s0 = S.ser[id] = { w: (M.seriesStart || [0, 0])[0], l: (M.seriesStart || [0, 0])[1], g: 0 }; } if (s0) G.breathK *= 1 + 0.07 * (s0.g || 0); }
    if (M.tired) G.breathK *= 1.15; if (M.startHeat) G.heat = Math.max(G.heat, M.startHeat);
    if (id > 4) { var fm = S.form == null ? 1 : S.form; G.breathK *= 1.07 - 0.07 * fm; G.passK = S.room >= 2 ? 0.85 : S.room === 0 ? 1.1 : 1; if (S.trust >= 2 && S.values.length) G.core = true; G.shortEnd = S.trust === 0; }
    if (M.onlySO) { setSeg(0); G.so = { n: 0, you: 0, riv: 0 }; G.defs = []; G.puck = { s: 'wait' }; marks(); G.pause = 3.2; G.pauseText = ['БУЛЛИТЫ', 'Один бросок, одна попытка. Твой вратарь пропустит две из трёх: тебе нужны все три или серия пойдёт дальше.']; G.afterPause = soShot; return run(); }
    if (M.bench1) return benchFirst();
    setSeg(0); matchTips(); if (G.core) say('СТЕРЖЕНЬ ЗАРЯЖЕН', '#2ce8f5', 2.4, 'ДВА БЫСТРЫХ ТАПА ЛЕВЫМ ПАЛЬЦЕМ'); run();
  }
  function run() { if (SIM) { view = 'play'; return; } view = 'play'; prev = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  function quit() { cancelAnimationFrame(raf); breathSound(false); PL = PR = null; if (G) G.breathing = false; view = 'quit';
    screen('ПАУЗА', '<span class="tag tag--red">ПАУЗА</span><h1 class="h1">ВЫЙТИ ИЗ МАТЧА?</h1><p class="lead">Счёт этого матча не сохранится.</p>', '<button class="btn" type="button" data-act="quitno">ПРОДОЛЖИТЬ МАТЧ</button><button class="btn btn--ghost" type="button" data-act="quityes">ВЫЙТИ</button>'); }
  // матч 4: первый отрезок игрок смотрит со скамейки и принимает одно решение
  function benchFirst() {
    G.riv = 1; G.seg = 0; log(4, 'bench_watch');
    decide(4, 'coach', 'Первый отрезок ты на скамейке. Команда пропустила, 0:1. Тренер рядом. Что делаешь?', [
      { label: 'СПРОШУ ПРЯМО, ЧТО ИСПРАВИТЬ', dots: [['Доверие', 2], ['Раздевалка', 1]], vals: ['Смелость', 'Честность', 'Ответственность', 'Любопытство'],
        apply: function () { S.trust = Math.min(3, S.trust + 1); S.room = Math.max(0, S.room - 1); return ['Доверие +1: спросил прямо и по делу', 'Раздевалка −1: партнёры видели, что ты думал о себе']; } },
      { label: 'ПОДДЕРЖУ ТЕХ, КТО НА ЛЬДУ', dots: [['Раздевалка', 2]], vals: ['Верность команде', 'Смирение', 'Уважение', 'Спокойствие', 'Радость игры'],
        apply: function () { S.room = Math.min(3, S.room + 1); return ['Раздевалка +1: партнёры слышали твой голос со скамейки', 'Доверие без изменений: тренер этого не заметил']; } }
    ], function (i, spirit) {
      G.finalSeg = S.trust >= 1; G.fast = S.room >= 1; if (spirit) G.core = true;
      rebuildMatchDom(); setSeg(1); matchTips(); G.playSeg = 1; G.pause = 2.8;
      G.pauseText = ['ТВОЙ ВЫХОД', (G.finalSeg ? 'Тренер доверяет: в концовке у тебя полная смена. ' : 'Доверия мало: в концовке тебе дадут только половину смены. ') + (G.fast ? 'Партнёры ищут тебя пасом.' : '')]; run();
    }, 'МАТЧ 4 · СКАМЕЙКА');
  }
  function marks() { var g = G; els.cap.textContent = hands(g.so ? 'БУЛЛИТЫ ' + g.so.you + ':' + g.so.riv : g.seg === 3 ? 'ОВЕРТАЙМ' : 'ОТРЕЗОК ' + (g.seg + 1) + ' / 3'); }
  function rebuildMatchDom() {
    view = 'play'; if (SIM) { els = { cap: {}, pf: { style: {} }, coach: { hidden: true, innerHTML: '', getAttribute: function () { return null; }, setAttribute: function () {} } }; return; }
    app.innerHTML = hud(M.name) + '<div class="gut"><div class="board"><span>ТЫ<b id="sYou">0</b></span><span class="t" id="sTime">0:35</span><span><b id="sRiv">0</b>' + M.team.toUpperCase() + '</span></div>' +
      '<div class="pace" id="pace"><i id="paceFill"></i></div><div class="pacecap"><span id="segCap"></span><span>ДАВЛЕНИЕ СОПЕРНИКА ▼</span></div><div class="pace pace--riv"><i id="pressFill"></i></div></div>' +
      '<div class="rinkwrap gut" id="wrap"><canvas id="rink" width="' + W + '" height="' + H + '"></canvas><div class="coach" id="coach" hidden></div></div>';
    cv = document.getElementById('rink'); cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
    els = { pf: document.getElementById('pressFill'), you: document.getElementById('sYou'), riv: document.getElementById('sRiv'), time: document.getElementById('sTime'), pace: document.getElementById('pace'), fill: document.getElementById('paceFill'), cap: document.getElementById('segCap'), coach: document.getElementById('coach') };
    if (S.lang === 'en' || S.lefty) { var tw = document.createTreeWalker(app, 4, null), tn; while ((tn = tw.nextNode())) { if (tn.nodeValue && tn.nodeValue.trim() && !/^\d+$/.test(tn.nodeValue.trim())) tn.nodeValue = hands(tn.nodeValue); } }
    fit(); bind(); if (G) marks();
  }
  // темп соперника известен заранее и не зависит от счёта
  function setSeg(i) {
    var g = G; g.seg = i; g.t = 0; g.rivI = 0; g.mg = (M.segG && M.segG[Math.min(i, 2)]) || M.g; g.segShots = 0; g.nz = 4; g.noise = 0; g.rate = i === 3 ? 1 / 40 : (M.riv[i] || []).length / 33 * tv('rateK'); if (i === 0) g.press = M.id === 3 ? 0.85 : 0;
    var nd = M.defs[Math.min(i, 2)]; g.defs = nd === 0 ? [] : nd === 1 ? [{ x: 40, y: 196, v: 60 }] : [{ x: 40, y: 196, v: 64 }, { x: 240, y: 146, v: -78 }];
    var sl = SEG === 35 ? tv('segT') : SEG; g.segLen = i === 3 ? 20 : M.id === 4 && i === 2 && !g.finalSeg ? Math.round(sl / 2) : M.id > 4 && i === 2 && g.shortEnd ? Math.round(sl * 0.75) : sl;
    g.sit = M.sit ? M.sit[Math.min(i, 2)] : ''; if (g.sit === 'pp') g.defs = g.defs.slice(0, Math.max(0, g.defs.length - 1)); if (g.sit === 'pk') g.rate *= 1.3;
    g.empty = !!M.emptyNet && i === 2 && g.you > g.riv; if (g.empty) g.rate *= 1.6;
    if (g.sit || g.empty) log(M.id, 'sit', { s: g.empty ? 'empty' : g.sit });
    if (g.sit || g.empty) { g.msg = g.empty ? 'ПУСТЫЕ ВОРОТА' : g.sit === 'pp' ? 'БОЛЬШИНСТВО' : 'МЕНЬШИНСТВО'; g.msgC = '#fee761'; g.msgT = 2.4; g.sub = g.empty ? 'СОПЕРНИК СНЯЛ ВРАТАРЯ И ДАВИТ СИЛЬНЕЕ' : g.sit === 'pp' ? 'У НИХ НА ОДНОГО МЕНЬШЕ: ПАС БЫСТРЕЕ' : 'ВАС МЕНЬШЕ: ШАЙБА РЕДКО, ДАВЛЕНИЕ ВЫШЕ'; }
    g.ch = null; marks(); g.puck = { s: 'in', t: 0.6 }; g.breath = 0; g.breathing = false; g.wasFull = false; g.over = 0; g.px = 160; g.py = 320; g.playSeg++; PL = PR = null;
  }
  function fit() { var w = document.getElementById('wrap'); if (!w || !cv) return; var cs = getComputedStyle(w), aw = w.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 8, ah = w.clientHeight - parseFloat(cs.paddingBottom) - 8, k = Math.max(0.4, Math.min(aw / W, ah / H)); cv.style.width = Math.floor(W * k) + 'px'; cv.style.height = Math.floor(H * k) + 'px'; }
  window.addEventListener('resize', fit);

  // английский черновик: матчи 1-7 и общие экраны. Чего нет в таблице, остаётся по-русски. Ключи до трёх букв заменяются только целиком
  var EN = [
    ['СУПЕРСИЛА', 'SUPERPOWER'], ['КАК ЗАРЯДИТЬ СТЕРЖЕНЬ НА ЛЬДУ', 'HOW TO CHARGE YOUR CORE ON THE ICE'],
    ['Стержень это твои сильные качества. Два быстрых тапа левым пальцем: горячая голова сразу остывает. Один раз за матч.', 'Your core is your strengths. Two quick taps with your left thumb and a hot head cools at once. Once per charge.'],
    ['Заряжается, когда ты верен своим сильным качествам: в решениях на скамейке и поступками на льду. Сейчас: ', 'It charges when you stay true to your strengths: in choices on the bench and in what you do on the ice. Right now: '], ['заряжен.', 'charged.'], ['пуст.', 'empty.'],
    ['Два быстрых тапа левым пальцем, когда голова горячая.', 'Two quick taps with your left thumb when your head is hot.'], ['Зарядится от решения на скамейке или поступка на льду в духе твоего качества.', 'It charges from a bench choice or an act on the ice that fits your strength.'],
    ['полный выдох сразу после пропущенной', 'a full exhale right after a goal against'], ['три броска подряд с выдохом', 'three shots in a row on an exhale'], ['гол с выдохом после двух промахов подряд', 'a goal on an exhale after two misses in a row'], ['гол под давлением: защитник рядом или время на исходе', 'a goal under pressure: a defender close or the clock running out'], ['гол первым же броском после пропущенной', 'a goal with your very first shot after a goal against'], ['два гола подряд', 'two goals in a row'],
    ['Оранжевый защитник идёт на тебя и отбирает шайбу. Уезжай от него левым пальцем.', 'The orange defender comes at you and takes the puck. Skate away with your left thumb.'], ['Один из защитников идёт на тебя и отбирает шайбу. Уезжай от него левым пальцем.', 'One defender comes at you and takes the puck. Skate away with your left thumb.'],
    ['Три отрезка по 35 ' + 'секунд.', 'Three periods of 35 seconds.'], ['Три коротких отрезка по 25 секунд.', 'Three short periods of 25 seconds.'], ['Красная полоса сверху: давление соперника. Растёт само и прыгает от каждой твоей потери. Заполнилась: тебе забили. Твой гол её отбрасывает.', 'The red bar on top is opponent pressure. It grows on its own and jumps with every turnover. When it fills, they score. Your goal pushes it back.'],
    ['СЕЗОН', 'SEASON'], ['ПУТЬ 1 · ТАЛАНТ', 'PATH 1 · TALENT'], ['ИГРОК', 'PLAYER'], ['КОМАНДА', 'TEAM'], ['ДОВЕРИЕ', 'TRUST'], ['РАЗДЕВАЛКА', 'LOCKER ROOM'], ['ФОРМА', 'FORM'], ['РЕПУТАЦИЯ', 'REPUTATION'],
    ['СТЕРЖЕНЬ ЗАРЯЖЕН', 'CORE CHARGED'], ['СТЕРЖЕНЬ ПУСТ', 'CORE IS EMPTY'], ['СТЕРЖЕНЬ: ЗАРЯЖЕН', 'CORE: CHARGED'], ['СТЕРЖЕНЬ: ПУСТ', 'CORE: EMPTY'], ['НОВОЕ: СТЕРЖЕНЬ', 'NEW: YOUR CORE'], ['СТЕРЖЕНЬ', 'CORE'], ['ЗАРЯЖЕН', 'CHARGED'], ['ГОТОВ', 'READY'], ['ТАП-ТАП', 'TAP-TAP'], ['ПУСТ', 'EMPTY'],
    ['НАПАДАЮЩИЙ', 'FORWARD'], ['ЗАЩИТНИК', 'DEFENSEMAN'], ['Нападающий', 'Forward'], ['Защитник', 'Defenseman'], ['вратарь', 'goalie'], ['Новичок', 'Rookie'], ['Горячий', 'Hothead'], ['Стена', 'The Wall'], ['Провокатор и Горячий', 'Agitator and Hothead'], ['Провокатор', 'Agitator'],
    ['Северный Ветер', 'North Wind'], ['СЕВЕРНЫЙ ВЕТЕР', 'NORTH WIND'], ['Кометы', 'Comets'], ['КОМЕТЫ', 'COMETS'], ['Вьюга', 'Blizzard'], ['ВЬЮГА', 'BLIZZARD'], ['Кедры', 'Cedars'], ['КЕДРЫ', 'CEDARS'], ['Айсберг', 'Iceberg'], ['АЙСБЕРГ', 'ICEBERG'], ['Прибой', 'Surf'], ['ПРИБОЙ', 'SURF'], ['Ледокол', 'Icebreaker'], ['ЛЕДОКОЛ', 'ICEBREAKER'], ['Южный Порт', 'South Port'], ['ЮЖНЫЙ ПОРТ', 'SOUTH PORT'],
    ['ПЕРВЫЙ ВЫХОД', 'FIRST SHIFT'], ['В ЧЁМ ТВОЯ СУПЕРСИЛА?', 'WHAT IS YOUR SUPERPOWER?'], ['В ЧЁМ ТВОЯ СУПЕРСИЛА', 'YOUR SUPERPOWER'], ['ПЕРВАЯ ОШИБКА', 'FIRST MISTAKE'], ['СКАМЕЙКА', 'THE BENCH'], ['ЧУЖИЕ ТРИБУНЫ', 'HOSTILE CROWD'], ['НОЧЬ ПЕРЕД ИГРОЙ', 'THE NIGHT BEFORE'], ['ДЕРБИ', 'THE DERBY'],
    ['МОИ ЗВЁЗДЫ И РЕШЕНИЯ', 'MY STARS AND CHOICES'], ['НАСТРОЙКИ', 'SETTINGS'], ['ЖУРНАЛ ТЕСТА', 'TEST LOG'], ['НАЧАТЬ ЗАНОВО', 'START OVER'], ['ДЛЯ РОДИТЕЛЕЙ', 'FOR PARENTS'], ['ПЕРЕНЕСТИ ПРОГРЕСС', 'MOVE PROGRESS'], ['ГОТОВО', 'DONE'], ['НАЗАД', 'BACK'], ['ЗВУК: ВКЛЮЧЁН', 'SOUND: ON'], ['ЗВУК: ВЫКЛЮЧЕН', 'SOUND: OFF'], ['МУЗЫКА: ВКЛЮЧЕНА', 'MUSIC: ON'], ['МУЗЫКА: ВЫКЛЮЧЕНА', 'MUSIC: OFF'], ['ЗВУК', 'SOUND'],
    ['ТВОЙ ИГРОК', 'YOUR PLAYER'], ['ДВА КАСАНИЯ', 'TWO TAPS'], ['КТО ТЫ НА ЛЬДУ?', 'WHO ARE YOU ON THE ICE?'], ['НОМЕР', 'NUMBER'],
    ['Нападающий: линия броска уже, идеальный момент для броска держится дольше. Защитник: бросок из-за синей линии летит быстрее, а его щелчок издалека вратарь не успевает прочитать. Разворачивается он тяжелее.', 'Forward: a narrower shot line, and the perfect moment lasts longer. Defenseman: shots from the blue line fly faster, and the goalie cannot read his long slap shot. He turns more slowly.'],
    ['АНКЕТА НОВИЧКА', 'ROOKIE FORM'], ['Выбери три сильных качества. Когда ты верен им в игре, заряжается стержень.', 'Pick three strengths. When you stay true to them in the game, your core charges.'], ['Выбрано:', 'Picked:'], [' из 3', ' of 3'],
    ['Трудолюбие', 'Hard work'], ['Честность', 'Honesty'], ['Смелость', 'Courage'], ['Дисциплина', 'Discipline'], ['Верность команде', 'Team loyalty'], ['Спокойствие', 'Calm'], ['Любопытство', 'Curiosity'], ['Упорство', 'Persistence'], ['Ответственность', 'Responsibility'], ['Уважение', 'Respect'], ['Радость игры', 'Joy of the game'], ['Смирение', 'Humility'],
    ['▶ НА ЛЁД', '▶ HIT THE ICE'], ['ДАЛЬШЕ ▶', 'NEXT ▶'], ['ПЕРЕИГРАТЬ', 'REPLAY'], ['МАТЧ ', 'MATCH '], ['ПОБЕДА В ОВЕРТАЙМЕ', 'OVERTIME WIN'], ['ПОРАЖЕНИЕ В ОВЕРТАЙМЕ', 'OVERTIME LOSS'], ['ПОБЕДА ПО БУЛЛИТАМ', 'SHOOTOUT WIN'], ['ПОРАЖЕНИЕ ПО БУЛЛИТАМ', 'SHOOTOUT LOSS'], ['ПОБЕДА', 'WIN'], ['ПОРАЖЕНИЕ', 'LOSS'],
    ['ЗВЁЗДЫ ДАЮТ ЗА ГОЛОВУ, А НЕ ЗА СЧЁТ', 'STARS ARE FOR YOUR HEAD, NOT THE SCORE'], ['Остудил голову после каждой пропущенной', 'Cooled your head after every goal against'], ['Голова не перегревалась', 'Your head never overheated'], ['Половина бросков с узкой линией', 'Half your shots with a narrow line'],
    ['Один идеальный бросок за матч', 'One perfect shot in the match'], ['Остудил голову стержнем в трудный момент', 'Cooled your head with your core at a hard moment'], ['Первый бросок после пропущенной был с выдохом', 'Your first shot after a goal against came on an exhale'], ['Два гола с выдоха', 'Two goals on an exhale'], ['Трижды убрал шум своим словом', 'Cleared the noise with your word three times'], ['Ни одного броска с горячей головой', 'Not one shot with a hot head'], ['В каждом отрезке первый бросок был с выдохом', 'In every period your first shot came on an exhale'],
    ['Бросков с узкой линией', 'Shots with a narrow line'], ['Голов с выдоха', 'Goals on an exhale'], ['Идеальных бросков', 'Perfect shots'], ['Секунд с горячей головой', 'Seconds with a hot head'],
    ['Юниорская лига. Ты в команде «Северный Ветер». Тренер выпускает тебя в первой смене. Вратарь соперника новичок: двигается медленно.', 'Junior league. You play for the North Wind. Coach sends you out on the first shift. Their goalie is a rookie and moves slowly.'],
    ['Вратарь соперника закипает после пропущенной и начинает ошибаться.', 'Their goalie boils over after a goal against and starts making mistakes.'],
    ['В первом отрезке ты пропустишь. Это не твоя ошибка. Смотри, что будет дальше.', 'You will be scored on in the first period. It is not your mistake. Watch what happens next.'],
    ['Вратарь соперника почти не греется. Его берут терпением. Первый отрезок ты сидишь на скамейке.', 'Their goalie barely heats up. Patience beats him. You sit out the first period.'],
    ['Выезд. Трибуны гудят, и линия броска начинает дрожать. Новый приём: твоё слово. Короткий тап левым пальцем, и шум уходит на несколько секунд.', 'Away game. The crowd roars and your shot line starts to shake. New move: your word. A short tap with your left thumb clears the noise for a few seconds.'],
    ['Как герой провёл вечер, так он и начнёт матч. Вратарь почти не греется: его берут терпением.', 'How he spent the evening is how he starts the match. The goalie barely heats up: patience beats him.'],
    ['Главный матч месяца. Три отрезка, три разных условия, и никто не подсказывает. В воротах по очереди Провокатор и Горячий.', 'The biggest game of the month. Three periods, three different conditions, and nobody tells you what to do. Agitator and Hothead take turns in net.'],
    ['Шайбу тебе пасует партнёр у борта. Принял: коснись справа внизу и тяни назад, появится линия броска. Отпусти: бросок.', 'A teammate at the boards passes you the puck. Got it: touch the lower right and pull back, and the shot line appears. Let go to shoot.'],
    ['Подержи палец ровно секунду. Это выдох: линия сужается, голова остывает. Кистевой бросок, точный.', 'Keep your thumb still for a second. That is an exhale: the line narrows and your head cools. A wrist shot, accurate.'],
    ['Быстрый тап правым: сильный бросок без прицела. Летит быстро, но широко.', 'A quick tap with the right thumb: a hard shot with no aim. Fast but wide.'],
    ['Води слева внизу: ведёшь игрока. Отпустил: он катится дальше туда же. С шайбой не въезжай в красную рамку вратаря и не касайся защитников.', 'Move in the lower left to skate your player. Let go and he keeps gliding that way. With the puck, stay out of the red crease and do not touch defenders.'],
    ['ПРАВЫЙ', 'RIGHT'], ['ЗАМРИ', 'HOLD'], ['ЩЕЛЧОК', 'SLAP SHOT'], ['ЛЕВЫЙ', 'LEFT'],
    ['ОТРЕЗОК ', 'PERIOD '], ['ДАВЛЕНИЕ СОПЕРНИКА', 'OPPONENT PRESSURE'], ['ОВЕРТАЙМ', 'OVERTIME'], ['БУЛЛИТЫ', 'SHOOTOUT'], ['ТЫ', 'YOU'],
    ['ТЯНИ И ОТПУСТИ', 'PULL AND RELEASE'], ['Правый палец: коснись справа внизу, потяни назад и отпусти. Это бросок.', 'Right thumb: touch the lower right, pull back and let go. That is a shot.'],
    ['ЗАМРИ ПЕРЕД БРОСКОМ', 'HOLD BEFORE YOU SHOOT'], ['Потяни и подержи палец ровно секунду. Это выдох: линия сузится, голова остынет. Потом отпусти.', 'Pull and keep your thumb still for a second. That is an exhale: the line narrows and your head cools. Then let go.'],
    ['ЛЕВЫЙ ПАЛЕЦ ВЕДЁТ', 'LEFT THUMB SKATES'], ['Води левым пальцем слева внизу: игрок едет за ним по всей зоне, хоть к самым воротам. Отпустил: катится сам.', 'Move your left thumb in the lower left: your player follows it anywhere in the zone. Let go and he keeps gliding.'],
    ['Быстрый тап правым пальцем: сильный бросок без прицела. Летит быстро, но широко. Для моментов, когда защитник уже рядом.', 'A quick tap with your right thumb: a hard shot with no aim. Fast but wide. For when a defender is already on you.'],
    ['ЛЕВЫЙ ПАЛЕЦ', 'LEFT THUMB'], ['ПРАВЫЙ ПАЛЕЦ', 'RIGHT THUMB'], ['ВЕДЁТ', 'SKATES'], ['ТЯНИ И ДЕРЖИ', 'PULL AND HOLD'],
    ['ДЕВЯТКА!', 'TOP CORNER!'], ['НАД ПЛЕЧОМ!', 'OVER THE SHOULDER!'], ['НАД БЛИНОМ!', 'BLOCKER SIDE!'], ['НАД ЛОВУШКОЙ!', 'GLOVE SIDE!'], ['ВЫДОХНУЛ И ПОПАЛ', 'EXHALED AND SCORED'], ['С ВЫДОХОМ', 'ON THE EXHALE'], ['ГОЛ', 'GOAL'],
    ['СЕЙВ', 'SAVE'], ['МИМО', 'WIDE'], ['БЛОК', 'BLOCKED'], ['ШТАНГА!', 'OFF THE POST!'], ['ПОТЕРЯ', 'TURNOVER'], ['ПЕРЕХВАТ', 'INTERCEPTED'],
    ['ВРАТАРЬ БЫЛ НА ЛИНИИ', 'THE GOALIE WAS ON YOUR LINE'], ['ВРАТАРЬ ХОЛОДНЫЙ: ОН УСПЕЛ', 'THE GOALIE IS COOL: HE GOT THERE'], ['ЛИНИЯ БЫЛА ШИРОКОЙ: ЗАМРИ ПЕРЕД БРОСКОМ', 'YOUR LINE WAS TOO BROAD: HOLD FIRST'], ['ЛИНИЯ СМОТРЕЛА МИМО ВОРОТ', 'YOUR LINE MISSED THE NET'], ['ЛИНИЯ БЫЛА ШИРОКОЙ', 'YOUR LINE WAS TOO BROAD'], ['ЧУТЬ ТОЧНЕЕ', 'JUST A BIT TIGHTER'],
    ['ЗАЩИТНИК БЫЛ НА ЛИНИИ БРОСКА', 'A DEFENDER WAS IN THE LANE'], ['ЗАЩИТНИК ОТОБРАЛ: УЕЗЖАЙ ЛЕВЫМ ПАЛЬЦЕМ', 'STRIPPED: SKATE AWAY WITH YOUR LEFT THUMB'], ['СЛИШКОМ БЛИЗКО К ЗАЩИТНИКУ: ОБЪЕЗЖАЙ', 'TOO CLOSE TO A DEFENDER: GO AROUND'], ['ВРАТАРЬ ВЫБИЛ ШАЙБУ: НЕ ЛЕЗЬ В ЕГО ЗОНУ', 'POKED AWAY: STAY OUT OF HIS CREASE'], ['ЗАЩИТНИК ПЕРЕХВАТИЛ ПАС: ОТКРОЙСЯ ПАРТНЁРУ', 'GET OPEN FOR YOUR TEAMMATE'], ['ПОЗДНО: ВРЕМЯ НА БРОСОК ВЫШЛО', 'TOO LATE: SHOT CLOCK RAN OUT'],
    ['БРОСИЛ ПРЯМО ВО ВРАТАРЯ: ЦЕЛЬСЯ В УГОЛ', 'RIGHT AT THE GOALIE: AIM FOR A CORNER'], ['ВБЛИЗИ ВРАТАРЬ ВЫХОДИТ: НУЖЕН ТОЧНЫЙ ВЫДОХ', 'UP CLOSE HE COMES OUT: YOU NEED A FULL EXHALE'], ['ХОЛОДНЫЙ ВРАТАРЬ ВИДИТ ЩЕЛЧОК ИЗДАЛЕКА', 'A COOL GOALIE READS A LONG SLAP SHOT'],
    ['СОПЕРНИК ЗАБИЛ', 'THEY SCORED'], ['ГОЛОВА НАГРЕЛАСЬ: ЛИНИЯ ШИРЕ', 'YOUR HEAD HEATED UP: WIDER LINE'], ['ГОЛОВА ОСТЫЛА СРАЗУ', 'YOUR HEAD COOLED AT ONCE'], ['ГОЛОВА ХОЛОДНАЯ', 'HEAD IS COOL'], ['СТЕРЖЕНЬ ОСТАЛСЯ ПРИ ТЕБЕ', 'YOU KEPT YOUR CORE'], ['ЗАРЯДИ ПОСТУПКОМ В ДУХЕ СВОЕГО КАЧЕСТВА', 'CHARGE IT BY ACTING ON YOUR STRENGTH'], ['ДВА БЫСТРЫХ ТАПА ЛЕВЫМ ПАЛЬЦЕМ', 'TWO QUICK TAPS WITH YOUR LEFT THUMB'], ['ГОЛОВА ГОРИТ: ТАП-ТАП', 'HEAD ON FIRE: TAP-TAP'],
    ['ТРИБУНЫ ГУДЯТ', 'THE CROWD IS ON YOU'], ['ТАП ЛЕВЫМ ПАЛЬЦЕМ: ТВОЁ СЛОВО', 'TAP WITH YOUR LEFT THUMB: YOUR WORD'], ['ШУМ УШЁЛ', 'THE NOISE IS GONE'], ['ШУМ ТРИБУН', 'CROWD NOISE'], ['Линия дрожит. Короткий тап пальцем, которым ведёшь игрока: твоё слово уберёт шум.', 'The line is shaking. A short tap with your skating thumb: your word clears the noise.'],
    ['ФИНАЛЬНАЯ СИРЕНА', 'FINAL HORN'], ['СИРЕНА', 'HORN'], ['Ничья.', 'Tied.'], ['Ничьих в хоккее нет. Двадцать секунд до первого гола. Давление соперника растёт: потеряешь шайбу, забьют тебе.', 'No ties in hockey. Twenty seconds, next goal wins. Their pressure keeps rising: lose the puck and they score.'],
    ['РЕШЕНИЕ', 'DECISION'], ['ТЫ ВЫБРАЛ', 'YOU CHOSE'], ['Точки показывают, что изменится. Больше точка: сильнее. Звезда: выбор в духе твоего сильного качества, он заряжает стержень.', 'Dots show what will change. A bigger dot means more. A star marks the choice that fits your strength and charges your core.'], ['★ Твоё сильное качество: ', '★ Your strength: '], ['Голова', 'Head'], ['Темп', 'Pace'], ['Раздевалка', 'Locker room'], ['Доверие', 'Trust'],
    ['Горячий злится после каждой пропущенной. Как играешь дальше?', 'Hothead fumes after every goal against. How do you play from here?'], ['ДАВЛЮ: БРОСАЮ ЧАЩЕ', 'PRESS: SHOOT MORE OFTEN'], ['ЖДУ СВОЙ МОМЕНТ', 'WAIT FOR MY MOMENT'],
    ['Вы пропустили в твою смену. Партнёр смотрит на тебя.', 'You were scored on during your shift. Your teammate looks at you.'], ['«МОЯ. СЛЕДУЮЩУЮ ЗАБИРАЕМ»', '"MY BAD. WE GET THE NEXT ONE"'], ['МОЛЧА ВЫДОХНУ И СОБЕРУСЬ', 'EXHALE QUIETLY AND REFOCUS'],
    ['Первый отрезок ты на скамейке. Команда пропустила, 0:1. Тренер рядом. Что делаешь?', 'You sit out the first period. The team is down 0:1. Coach is right there. What do you do?'], ['СПРОШУ ПРЯМО, ЧТО ИСПРАВИТЬ', 'ASK STRAIGHT WHAT TO FIX'], ['ПОДДЕРЖУ ТЕХ, КТО НА ЛЬДУ', 'BACK THE GUYS ON THE ICE'],
    ['Вечер перед выездом. В телефоне пишут про завтрашний матч и про тебя.', 'The evening before the away game. Your phone is full of talk about tomorrow and about you.'], ['ЧИТАЮ, ЧТО ПИШУТ', 'READ WHAT THEY WRITE'], ['ТЕЛЕФОН В ДРУГУЮ КОМНАТУ', 'PHONE IN ANOTHER ROOM'],
    ['Вечер перед игрой. Завтра сильный соперник.', 'The evening before the game. Tomorrow you face a strong team.'], ['ЛОЖУСЬ ВОВРЕМЯ', 'LIGHTS OUT ON TIME'], ['ДОИГРЫВАЮ В ПРИСТАВКУ ДО НОЧИ', 'GAMING UNTIL LATE'], ['ДО ПОЛУНОЧИ РАЗБИРАЮ СВОИ ОШИБКИ', 'REPLAYING MY MISTAKES PAST MIDNIGHT'],
    ['Партнёр ошибся, и вам забили. Он садится рядом и молчит.', 'Your teammate made a mistake and they scored. He sits down next to you and says nothing.'], ['«ЗАБУДЬ. СЛЕДУЮЩАЯ СМЕНА НАША»', '"LET IT GO. NEXT SHIFT IS OURS"'], ['«СОБЕРИСЬ УЖЕ»', '"GET IT TOGETHER"'],
    ['В НАСТОЯЩЕЙ ЖИЗНИ', 'IN REAL LIFE'], ['ЧТО ТАКОЕ СБРОС', 'WHAT A RESET IS'], ['Сброс это короткий ритуал после ошибки: движение, выдох, слово. Три секунды.', 'A reset is a short ritual after a mistake: a gesture, an exhale, a word. Three seconds.'], ['СОБРАТЬ СВОЙ СБРОС ▶', 'BUILD MY RESET ▶'], ['СОБЕРИ СВОЙ СБРОС', 'BUILD YOUR RESET'], ['СДЕЛАЮ', 'I WILL'], ['ПОЗЖЕ', 'LATER'], ['ДВИЖЕНИЕ', 'GESTURE'], ['СЛОВО', 'WORD'], ['ЗАЧЕМ', 'WHY'], ['В ИГРЕ', 'IN THE GAME'], ['В ЖИЗНИ', 'IN LIFE'],
    ['МЕЖДУ МАТЧАМИ', 'BETWEEN GAMES'], ['ЧТО ИЗМЕНИЛОСЬ', 'WHAT CHANGED'], ['В СЛЕДУЮЩЕМ МАТЧЕ', 'IN THE NEXT GAME'], ['С ЧЕМ ТЫ ВЫХОДИШЬ', 'WHAT YOU BRING'], ['ПАУЗА', 'PAUSE'], ['ВЫЙТИ ИЗ МАТЧА?', 'LEAVE THE GAME?'], ['Счёт этого матча не сохранится.', 'This score will not be saved.'], ['ПРОДОЛЖИТЬ МАТЧ', 'KEEP PLAYING'], ['ВЫЙТИ', 'LEAVE'],
    ['ОБЫЧНЫЕ МАТЧИ: ИГРАЙ ЛЮБЫЕ', 'REGULAR GAMES: PLAY ANY'], [' ПОСЛЕ ДЕРБИ', ' AFTER THE DERBY'], ['ЗАРЯД: ', 'CHARGE: ']
  ].sort(function (a, b) { return b[0].length - a[0].length; }), TRC = {};
  function tr(t) {
    if (S.lang !== 'en' || !t) return t; t = String(t); if (TRC[t] != null) return TRC[t]; var o = t, e = t.trim();
    for (var i = 0; i < EN.length; i++) { var k = EN[i][0]; if (k.length <= 3) { if (e === k) { t = t.replace(k, EN[i][1]); break; } } else if (t.indexOf(k) >= 0) t = t.split(k).join(EN[i][1]); }
    return (TRC[o] = t);
  }
  function hx(html) { return String(html).replace(/(^|>)([^<]+)(?=<|$)/g, function (m, a, t) { return a + hands(t); }); }
  var HP = [['left', 'right'], ['Left', 'Right'], ['LEFT', 'RIGHT'], ['левым', 'правым'], ['левый', 'правый'], ['Левый', 'Правый'], ['ЛЕВЫМ', 'ПРАВЫМ'], ['ЛЕВЫЙ', 'ПРАВЫЙ'], ['слева', 'справа'], ['Слева', 'Справа'], ['СЛЕВА', 'СПРАВА']];
  function hands(t) { if (!t) return t; t = tr(t); if (!S.lefty) return t; t = String(t); HP.forEach(function (p, i) { t = t.split(p[0]).join('\u0001' + i + '\u0001').split(p[1]).join('\u0002' + i + '\u0002'); }); HP.forEach(function (p, i) { t = t.split('\u0001' + i + '\u0001').join(p[1]).split('\u0002' + i + '\u0002').join(p[0]); }); return t; }
  function say(m, c, d, sub) { m = hands(m); sub = hands(sub); G.msg = m; G.msgC = c || '#fff'; G.msgT = d || 1.2; G.sub = M.blind ? '' : (sub || ''); }
  function burst(x, y, n, cols) { for (var i = 0; i < n; i++) G.parts.push({ x: x, y: y, vx: (Math.random() - 0.5) * 240, vy: -60 - Math.random() * 220, l: 0.6 + Math.random() * 0.6, c: cols[i % cols.length] }); }
  var AS = window.__assets || {}, IMG = {}, SND = {};
  function img(n) { if (!AS[n]) return null; if (!IMG[n]) { IMG[n] = new Image(); IMG[n].src = AS[n]; } return IMG[n].complete && IMG[n].naturalWidth ? IMG[n] : null; }
  function sndName(n) { return AS[n + '.wav'] ? n + '.wav' : AS[n + '.mp3'] ? n + '.mp3' : ''; }
  function sndBuf(n) {
    var f = sndName(n); if (!f) return null; if (SND[f]) return SND[f] === 1 ? null : SND[f]; SND[f] = 1;
    try { var b64 = AS[f].slice(AS[f].indexOf(',') + 1), bin = atob(b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      ac().decodeAudioData(u.buffer, function (buf) { SND[f] = buf; }, function () {}); } catch (e) {}
    return null;
  }
  function sndPlay(n, loop, vol) { var b = sndBuf(n); if (!b) return null; try { var a = ac(), s0 = a.createBufferSource(), g0 = a.createGain(); s0.buffer = b; s0.loop = !!loop; g0.gain.value = vol == null ? 1 : vol; s0.connect(g0); g0.connect(a.destination); s0.start(); window.__sndPlayed = (window.__sndPlayed || 0) + 1; return { s: s0, g: g0 }; } catch (e) { return null; } }
  SFX.pass = function () { beep([[520, 0.04, 'triangle'], [820, 0.06, 'triangle']], 0.09); };
  // у каждого звука сначала пробуем файл sfx_<имя>, потом синтез
  Object.keys(SFX).forEach(function (k) { var f = SFX[k]; SFX[k] = function () { if (S.sound && sndName('sfx_' + k)) { if (sndPlay('sfx_' + k)) return; } return f.apply(null, arguments); }; });
  Object.keys(AS).forEach(function (n) { if (/\.png$/.test(n)) img(n); });
  var _bs = breathSound, BRS = null;
  breathSound = function (on) {
    if (!on) { if (BRS) { try { BRS.s.stop(); } catch (e) {} BRS = null; } return _bs(false); }
    if (S.sound && sndName('sfx_breath')) { if (!BRS) BRS = sndPlay('sfx_breath', true); if (BRS) return; }
    return _bs(true);
  };
  var MF = { cur: '', node: null };
  function musicStop() { if (MF.node) { try { MF.node.s.stop(); } catch (e) {} } MF.node = null; MF.cur = ''; }
  // музыка из файлов music_menu и music_match, если они есть; иначе играет синтезированная петля
  function musicFile() {
    var want = view === 'play' ? 'music_match' : 'music_menu'; if (!sndName(want)) { musicStop(); return false; }
    if (!S.sound || S.music === false) { musicStop(); return true; }
    if (MF.cur !== want) { musicStop(); var n = sndPlay(want, true, 0.5); if (n) { MF.node = n; MF.cur = want; } }
    if (MF.node) MF.node.g.gain.value = G && (G.breathing || G.wasFull) ? 0.12 : 0.5;
    return !!MF.node;
  }
  function nextPuck(d) { G.mate = { x: Math.random() < 0.5 ? 30 : 290, y: 255 + Math.random() * 95 }; G.puck = { s: 'in', t: (d || 1.5) * (G.fast ? 0.65 : 1) * (G.lastSlap ? 1.6 : 1) * tv('paceK') * (G.passK || 1) * (G.flow > 0 ? 0.7 : 1) * (1 + 0.6 * (G.mheat || 0)) * (G.sit === 'pp' ? 0.85 : G.sit === 'pk' ? 1.45 : 1) }; G.ch = null; }
  function coach(title, text) { var c = els.coach; if (!title) { c.hidden = true; return; } title = hands(title); text = hands(text); if (c.getAttribute('data-k') !== title) { c.setAttribute('data-k', title); c.innerHTML = '<b>' + title + '</b><p>' + text + '</p>'; } c.hidden = false; }
  function heatUp(v, why) { var g = G; g.heat = Math.min(1, g.heat + v); g.shake = 0.25; log(M.id, 'heat', { by: why, heat: +g.heat.toFixed(2) }); }
  // буллиты: темп соперника объявлен заранее, как и красные метки
  function soShot() { var g = G; g.px = 160; g.py = 330; g.vx = 0; g.vy = 0; g.ax = 1; g.ay = 0; g.puck = { s: 'in', t: 0.8 }; marks(); }
  function soResult(sc) {
    var g = G, so = g.so, r = so.n < 3 ? (M.soSeq || [1, 0, 0])[so.n] : (so.n % 2 === 0 ? 1 : 0); if (sc) so.you++; so.riv += r; so.n++; marks();
    g.pause = 2.4; g.pauseText = [sc ? 'ТЫ ЗАБИЛ' : 'НЕ ЗАБИЛ', 'Соперник: ' + (r ? 'гол' : 'сейв твоего вратаря') + '. Буллиты ' + so.you + ':' + so.riv];
    if (so.n >= 3 && so.you !== so.riv) { if (so.you > so.riv) g.you++; else g.riv++; g.endHow = ' ПО БУЛЛИТАМ'; g.done = true; } else g.afterPause = soShot;
  }
  function breathT() { var y = stick()[1]; return (G.flow > 0 ? 0.6 : 1) * G.breathK * (0.45 + 0.45 * Math.max(0, Math.min(1, (y - 150) / 112))); }
  function outK(y) { return Math.max(0, Math.min(1, (262 - y) / 112)); }
  function saveHalf(top, y, seen) { return top ? tv('topR') + 10 * outK(y) : GW / 2 + 3 + 18 * outK(y) + (seen ? T.seenAdd : 0); }
  function topW() { return S.role === 'F' ? 1.0 : T.dTop; }
  function stick() { return [G.px + 20, G.py + 20]; }
  // направление броска: противоположно оттяжке; короткий тап бьёт в центр ворот
  function aim() {
    var s = stick(), dx = 160 - s[0], dy = GOAL_Y - s[1], armed = false;
    if (PR) { var ax = PR.ox - PR.x, ay = PR.oy - PR.y; if (Math.hypot(ax, ay) >= 12 && ay < -3) { dx = ax; dy = ay; armed = true; } }
    return { a: Math.max(-1.1, Math.min(1.1, Math.atan2(dx, -dy) + (G.noise > 0 ? Math.sin(G.T * 11) * 0.1 : 0))), armed: armed };
  }
  function spreadA() { var g = G, b = Math.min(1, g.breath), e = 1 - (1 - b) * (1 - b); return Math.max(0.008, (0.035 + g.heat * 0.5) * (1 - 0.85 * e * (1 - 0.6 * g.heat)) * (S.role === 'F' ? T.fSpread : T.dSpread)); }
  function isTop() { return G.wasFull && G.over <= topW(); }
  function shoot(slap) {
    var g = G, p = g.puck; if (p.s !== 'ready' || g.pause > 0) return;
    var s = stick(), A = aim(); slap = !!slap && !A.armed; var one = !!M.oneT && !slap && A.armed && g.recvAge < 0.45; var far = S.role === 'D' && s[1] > 262, fs = slap || one ? 1.5 : far ? T.dFar : 1; g.lastSlap = slap;
    var b = slap ? 0 : Math.min(1, g.breath), withBreath = b >= 0.5, top = !slap && isTop(), sp = top ? 0 : slap ? T.slapSp + g.heat * 0.5 : spreadA(), ang = A.a + (Math.random() * 2 - 1) * sp;
    var dist = (s[1] - GOAL_Y) / Math.cos(A.a), spx = Math.tan(sp) * dist;
    g.puck = { s: 'fly', x: s[0], y: s[1], vx: Math.sin(ang) * FLY * (top ? T.topV : fs), vy: -Math.cos(ang) * FLY * (top ? T.topV : fs), one: one, pierce: far && !slap ? T.pierce : 0, skip: 0, slap: slap, from: s[1], top: top, breath: withBreath, wide: spx > 22,
      first: !!(g.rivGoals.length && g.firstAfter === null), press: !!(g.ch && Math.hypot(g.ch.x - g.px, g.ch.y - g.py) < 80) || g.clock < 3 };
    if (withBreath) { if (++g.breathRow >= 3) { g.breathRow = 0; deed('disc'); } } else g.breathRow = 0;
    g.shots++; if (withBreath) g.breathShots++; if (spx <= 14) g.narrow++; g.trail = [];
    g.hN++; g.hSide += s[0] + Math.tan(A.a) * (s[1] - GOAL_Y) < 160 ? -1 : 1; g.hB += b; g.hY += s[1];
    if (g.heat >= 0.66) g.hotShots++; if (g.segShots++ === 0) g.segFirst[g.seg] = withBreath; if (g.shots === 0) g.firstShotBreath = withBreath;
    if (g.rivGoals.length && g.firstAfter === null) { g.firstAfter = withBreath; g.firstAfterBreath = withBreath; }
    log(M.id, 'shot', { width: Math.round(spx * 2), breath: +b.toFixed(2), top: top, heat: +g.heat.toFixed(2), aimed: A.armed, slap: slap, far: far, one: one });
    g.breath = 0; g.over = 0; g.wasFull = false; g.breathing = false; breathSound(false); SFX.shot();
    if (g.lesson === 3 && slap) { g.lesson = 9; S.taught = true; save(); }
    if (g.lesson === 1) { if (withBreath) g.lesson = 2; else if (++g.l1 >= 6) g.lesson = 2; }
  }
  function miss(text, why, soft, kind) {
    var g = G; g.streak = 0; g.missRow++; g.topRow = 0; g.flow = 0; if (kind === 'steal' || kind === 'poke' || kind === 'late' || kind === 'icept') { g.losses++; if (g.seg >= 2) g.lossesEnd = (g.lossesEnd || 0) + 1; } if (kind === 'steal' || kind === 'poke' || kind === 'late' || kind === 'icept') g.safe = true;
    if ((kind === 'steal' || kind === 'poke' || kind === 'late' || kind === 'icept') && g.lesson >= 9 && !g.so) g.press = Math.min(0.99, g.press + tv('push')); heatUp(kind === 'badpass' ? 0.05 : soft || kind === 'poke' || kind === 'steal' || kind === 'icept' ? 0.1 : 0.22, kind); if (kind === 'badpass') g.safe = true; log(M.id, 'miss', { kind: kind });
    say(text, soft ? '#fee761' : '#e43b44', 1.7, why); if (soft) SFX.post(); else SFX.bad(); nextPuck(soft ? 1.6 : 1.9); if (g.so) { g.puck = { s: 'wait' }; g.soPend = { t: 1.2, sc: false }; }
  }
  // стержень: два быстрых тапа левым пальцем. При холодной голове не тратится
  var DEEDS = { calm: ['Спокойствие', 'Смирение'], disc: ['Дисциплина', 'Уважение'], grit: ['Упорство', 'Трудолюбие'], brave: ['Смелость'], resp: ['Ответственность', 'Честность'], joy: ['Радость игры', 'Любопытство', 'Верность команде'] };
  var HINT = { calm: 'полный выдох сразу после пропущенной', disc: 'три броска подряд с выдохом', grit: 'гол с выдохом после двух промахов подряд', brave: 'гол под давлением: защитник рядом или время на исходе', resp: 'гол первым же броском после пропущенной', joy: 'два гола подряд' };
  var SHORT = { calm: 'ВЫДОХ СРАЗУ ПОСЛЕ ПРОПУЩЕННОЙ', disc: '3 БРОСКА ПОДРЯД С ВЫДОХОМ', grit: 'ГОЛ С ВЫДОХОМ ПОСЛЕ 2 ПРОМАХОВ', brave: 'ГОЛ, КОГДА ЗАЩИТНИК РЯДОМ', resp: 'ГОЛ ПЕРВЫМ БРОСКОМ ПОСЛЕ ПРОПУЩЕННОЙ', joy: '2 ГОЛА ПОДРЯД' };
  function shortOf(v) { for (var k in DEEDS) if (DEEDS[k].indexOf(v) >= 0) return SHORT[k]; return ''; }
  function hintOf(v) { for (var k in DEEDS) if (DEEDS[k].indexOf(v) >= 0) return HINT[k]; return ''; }
  // стержень заряжается и на льду: поступком в духе выбранного сильного качества
  function deed(k) {
    var g = G; if (!g || g.core || M.id < 2) return; var q = DEEDS[k].filter(function (v) { return S.values.indexOf(v) >= 0; })[0]; if (!q) return;
    g.core = true; S.core = true; save(); log(M.id, 'charge', { by: k, q: q });
    if (g.msgT > 0.3) g.sub = 'СТЕРЖЕНЬ ЗАРЯЖЕН: ' + q.toUpperCase(); else say('СТЕРЖЕНЬ ЗАРЯЖЕН', '#2ce8f5', 1.8, q.toUpperCase()); SFX.full();
  }
  // с шайбой нельзя: въезжать в зону вратаря и вплотную сближаться с защитником
  function danger() { var g = G; var st = stick(); if (st[1] < 137 && st[0] > 102 && st[0] < 218) return 'poke'; if (!(g.grace > 0)) for (var i = 0; i < g.defs.length; i++) if (Math.hypot(g.px - (g.defs[i].x + 25), g.py - (g.defs[i].y + 15)) < 30) return 'def'; return ''; }
  function hitDef(x, y) { var g = G, c = g.ch; for (var i = 0; i < g.defs.length; i++) { var d = g.defs[i]; if (x > d.x + 6 && x < d.x + 42 && y > d.y - 8 && y < d.y + 40) return true; } return !!c && x > c.x - 20 && x < c.x + 18 && y > c.y - 24 && y < c.y + 24; }
  // своё слово: короткий тап левым пальцем убирает шум трибун и на несколько секунд не даёт ему вернуться
  var TIPS = { flow: ['ПОТОК', 'Три идеальных гола подряд, и на восемь секунд выдох и пас быстрее. Промах его обрывает.'],
    oneT: ['БРОСОК В КАСАНИЕ', 'Оттяни палец броска ещё до паса и отпусти сразу, как принял шайбу. Только с холодной головой.'],
    mate: ['ГОЛОВА ПАРТНЁРА', 'Полоска над партнёром. Когда она красная, его пас может не дойти. Твой гол её остужает.'],
    mirror: ['ВРАТАРЬ-ЗЕРКАЛО', 'Он идёт за твоим прицелом, пока ты держишь палец. Сдвинь прицел перед самым броском.'],
    noise: ['ШУМ ТРИБУН', 'Линия дрожит. Короткий тап пальцем, которым ведёшь игрока: твоё слово уберёт шум.'] };
  function tipOnce(k) { if (!G || M.noHints || SIM) return; S.tips = S.tips || {}; if (S.tips[k]) return; S.tips[k] = 1; save(); G.tipQ.push({ a: TIPS[k][0], b: TIPS[k][1], t: 6 }); }
  function matchTips() { if (M.flow) tipOnce('flow'); if (M.oneT) tipOnce('oneT'); if (M.mateHead) tipOnce('mate'); if (G.mg && G.mg.mirror) tipOnce('mirror'); }
  function useWord() {
    var g = G; if (!g || g.pause > 0 || !(g.noise > 0)) return;
    g.noise = 0; g.shield = 4.5; g.trig++; if (g.tip && g.tip.a === TIPS.noise[0]) g.tip.t = 0; log(M.id, 'word'); say(String(S.reset && S.reset.w ? S.reset.w : 'Здесь').toUpperCase() + '!', '#2ce8f5', 1.2, 'ШУМ УШЁЛ'); SFX.full(); buzz(15);
  }
  function useCore() {
    var g = G; if (!g || g.pause > 0 || M.id < 2 || !S.values.length) return;
    if (!g.core) { g.falseTaps++; return say('СТЕРЖЕНЬ ПУСТ', '#8b9bb4', 1.4, 'ЗАРЯДИ ПОСТУПКОМ В ДУХЕ СВОЕГО КАЧЕСТВА'); }
    if (g.heat < 0.33) g.falseTaps++;
    if (g.heat < 0.33) return say('ГОЛОВА ХОЛОДНАЯ', '#63c74d', 1.4, 'СТЕРЖЕНЬ ОСТАЛСЯ ПРИ ТЕБЕ');
    g.core = false; S.core = false; save(); if (g.heat >= 0.5) g.coreHot = true; log(M.id, 'core', { heat: +g.heat.toFixed(2) });
    g.heat = 0; g.flash = 0.3; say('СТЕРЖЕНЬ', '#2ce8f5', 1.4, 'ГОЛОВА ОСТЫЛА СРАЗУ'); SFX.core(); buzz([20, 40, 60]);
  }
  function update(dt) {
    var g = G, p = g.puck;
    if (g.grace > 0) g.grace -= dt; if (g.recv > 0) g.recv -= dt; if (g.msgT > 0) g.msgT -= dt; if (g.flash > 0) g.flash -= dt; if (g.jump > 0) g.jump -= dt; if (g.net > 0) g.net -= dt; if (g.shake > 0) g.shake -= dt;
    g.parts.forEach(function (q) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 520 * dt; q.l -= dt; }); g.parts = g.parts.filter(function (q) { return q.l > 0; });
    if (g.pause > 0) { g.pause -= dt; if (g.pause <= 0) { g.pauseText = null; if (g.done) return finish(); if (g.nextSeg != null) { var ns = g.nextSeg; g.nextSeg = null; return between(ns); } } return; }
    g.T += dt;
    var teaching = g.lesson < 2 && g.seg === 0;
    if (!teaching && !g.so) g.t += dt;
    if (g.soPend) { g.soPend.t -= dt; if (g.soPend.t <= 0) { var sp0 = g.soPend; g.soPend = null; if (sp0.end) { g.done = true; g.endHow = ' В ОВЕРТАЙМЕ'; g.pause = 1.4; g.pauseText = [sp0.lose ? 'ПОРАЖЕНИЕ В ОВЕРТАЙМЕ' : 'ПОБЕДА В ОВЕРТАЙМЕ', '']; return; } return soResult(sp0.sc); } }
    // сирена ждёт, пока шайба долетит
    if (g.t >= g.segLen && p.s !== 'fly' && !g.so && !g.soPend) { breathSound(false); g.breathing = false; g.breath = 0; PL = PR = null; SFX.end();
      if (g.seg >= 2 && g.you !== g.riv) { g.done = true; g.pause = 1.2; g.pauseText = ['ФИНАЛЬНАЯ СИРЕНА', '']; }
      else if (g.seg === 2) { log(M.id, 'overtime'); g.nextSeg = 3; g.pause = 1.0; g.pauseText = ['СИРЕНА', 'Ничья.']; }
      else if (g.seg === 3) { log(M.id, 'shootout'); g.so = { n: 0, you: 0, riv: 0 }; g.t = 0; g.defs = []; g.ch = null; g.puck = { s: 'wait' }; marks(); g.pause = 3.4; g.pauseText = ['БУЛЛИТЫ', 'По три попытки. Твой вратарь пропустит первую и возьмёт две следующие. Забей больше одной.']; g.afterPause = soShot; }
      else { g.nextSeg = g.seg + 1; g.pause = 1.0; g.pauseText = ['СКАМЕЙКА', '']; }
      return; }
    if (!teaching && !g.so && !g.soPend) g.press += g.rate * dt;
    if (g.press >= 1 && !g.so && !g.soPend) { g.press = 0; g.flow = 0; g.topRow = 0; if (M.mateHead) g.mheat = Math.min(1, g.mheat + 0.4); g.riv++; g.rivGoals.push({ at: g.T, cooled: false }); g.firstAfter = null; heatUp(0.3, 'rival_goal'); log(M.id, 'rival_goal'); say('СОПЕРНИК ЗАБИЛ', '#e43b44', 1.6, 'ГОЛОВА НАГРЕЛАСЬ: ЛИНИЯ ШИРЕ'); SFX.riv();
      if (g.seg === 3) { PR = null; breathSound(false); g.puck = { s: 'wait' }; g.soPend = { t: 1.4, end: true, lose: true }; return; } }
    if (g.flow > 0) g.flow -= dt; g.recvAge += dt; if (M.mateHead) { g.mheat = Math.max(0, g.mheat - 0.02 * dt); if (g.mheat >= 0.5) g.mateHot += dt; }
    if (g.shield > 0) g.shield -= dt; if (g.noise > 0) g.noise -= dt;
    if (M.noise && M.noise[Math.min(g.seg, 2)] && !g.so && !g.soPend) { g.nz -= dt; if (g.nz <= 0 && g.noise <= 0 && g.shield <= 0) { tipOnce('noise'); g.noise = 3.5; g.nz = 6 + Math.random() * 3; heatUp(0.08, 'noise'); say('ТРИБУНЫ ГУДЯТ', '#e43b44', 1.5, 'ТАП ЛЕВЫМ ПАЛЬЦЕМ: ТВОЁ СЛОВО'); SFX.riv(); } }
    if (g.heat >= 0.66 && g.core) { g.hotRun = (g.hotRun || 0) + dt; if (g.hotRun > 8 && !g.nudged) { g.nudged = true; g.nudge = 5; } } else g.hotRun = 0; if (g.nudge > 0) g.nudge -= dt;
    if (g.heat >= 0.66) g.hot += dt;
    g.rivGoals.forEach(function (r) { if (!r.cooled && g.heat < 0.33 && g.T - r.at <= 10) r.cooled = true; });
    g.gheat = Math.max(0, g.gheat - G.mg.cool * dt);
    // движение: левый палец или клавиши; без них игрок катится сам
    var ix = 0, iy = 0;
    if (PL) { var ldx = PL.x - PL.ox, ldy = PL.y - PL.oy, ld = Math.hypot(ldx, ldy); if (ld > 34) { PL.ox = PL.x - ldx / ld * 34; PL.oy = PL.y - ldy / ld * 34; } ix = (PL.x - PL.ox) / 34; iy = (PL.y - PL.oy) / 34; }
    if (KEYS.l) ix -= 1; if (KEYS.r) ix += 1; if (KEYS.u) iy -= 1; if (KEYS.d) iy += 1;
    if (SIM) { ix = SIM.ix; iy = SIM.iy; }
    var im = Math.hypot(ix, iy); if (im > 1) { ix /= im; iy /= im; } if (im < 0.18) { ix = 0; iy = 0; }
    var manual = !!PL || KEYS.l || KEYS.r || KEYS.u || KEYS.d || !!(SIM && SIM.man), tvx, tvy;
    if (manual) { tvx = ix * 190; tvy = iy * 190; if (im >= 0.18) { g.ax = ix / im; g.ay = iy / im; g.leftSec += dt; if (g.lesson === 2) g.l2 += dt * 4; } }
    else { if ((g.px <= 38 && g.ax < 0) || (g.px >= 282 && g.ax > 0)) g.ax = -g.ax; if ((g.py >= (g.strip ? 362 : 428) && g.ay > 0) || (g.ay < 0 && (g.py <= 112 || (g.py < 128 && g.px > 74 && g.px < 206)))) g.ay = -g.ay; tvx = g.ax * 60; tvy = g.ay * 60; }
    var kk = Math.min(1, dt * (S.role === 'D' ? 6 : 9)); g.vx += (tvx - g.vx) * kk; g.vy += (tvy - g.vy) * kk;
    var opx = g.px, opy = g.py; g.px = Math.max(34, Math.min(286, g.px + g.vx * dt)); g.py = Math.max(108, Math.min(g.strip ? 366 : 432, g.py + g.vy * dt));
    var spd = Math.hypot(g.px - opx, g.py - opy) / dt;
    // выдох: правый палец оттянут и держится ровно. Голова остывает только так
    if (PR && p.s === 'ready') {
      PR.sp = PR.sp * 0.75 + (PR.mv / dt) * 0.25; PR.mv = 0;
      var steady = Math.max(0, Math.min(1, 1 - (PR.sp - 25) / 90)), rate = steady * (1 - 0.7 * Math.min(1, spd / 170));
      if (PR.sp > 140) { g.breath = Math.max(0, g.breath - 2 * dt); g.wasFull = false; g.over = 0; g.breathing = false; }
      else if (g.wasFull) { g.over += dt; g.breath = g.over <= topW() ? 1 : Math.max(0.5, 1 - (g.over - topW()) * 0.5); g.breathing = false; }
      else if (rate > 0.05) {
        if (!g.breathing) { var lg = g.rivGoals[g.rivGoals.length - 1]; if (lg && lg.hold == null) { lg.hold = g.T - lg.at; log(M.id, 'hold_after_rival_goal', { sec: +lg.hold.toFixed(1) }); } }
        g.breathing = true; g.breath += rate * dt / breathT(); g.heat = Math.max(0, g.heat - 0.08 * rate * dt);
        if (g.breath >= 1) { g.breath = 1; g.wasFull = true; g.over = 0; g.heat = Math.max(0, g.heat - 0.3); SFX.full(); buzz(15); var lc = g.rivGoals[g.rivGoals.length - 1]; if (lc && !lc.calm && g.T - lc.at <= 6) { lc.calm = true; deed('calm'); } }
      } else g.breathing = false;
    } else { g.breath = Math.max(0, g.breath - 3 * dt); g.wasFull = false; g.over = 0; g.breathing = false; }
    breathSound(g.breathing);
    var gs = 92 * G.mg.speed * tv('gsp') * (1 - 0.45 * g.gheat) * (M.id === 1 && g.seg === 0 ? 0.8 : 1);
    if (g.gheat > 0.3 && g.gfreeze <= 0 && Math.random() < g.gheat * 1.6 * dt) g.gfreeze = 0.35 + Math.random() * 0.3;
    if (g.gfreeze > 0) g.gfreeze -= dt; else if (g.mg.mirror && PR && p.s === 'ready' && aim().armed) { var st3 = stick(), mtx = Math.max(NET_L, Math.min(NET_R - GW, st3[0] + Math.tan(aim().a) * (st3[1] - GOAL_Y) - GW / 2)), mdx = mtx - g.gx; g.gx += (mdx > 0 ? 1 : -1) * Math.min(Math.abs(mdx), gs * 0.7 * dt); } else g.gx += g.gdir * gs * dt;
    g.gspeed = g.gfreeze > 0 ? 0 : gs;
    if (g.gx < NET_L) { g.gx = NET_L; g.gdir = 1; } if (g.gx > NET_R - GW) { g.gx = NET_R - GW; g.gdir = -1; }
    g.defs.forEach(function (d) { d.x += d.v * dt; if (d.x < 16) { d.x = 16; d.v = -d.v; } if (d.x > W - 50) { d.x = W - 50; d.v = -d.v; } });
    if (g.ch && p.s === 'ready' && !teaching) { var c = g.ch, cd = Math.hypot(g.px - c.x, g.py - c.y) || 1, ctx2 = g.px + g.vx * 0.45 - c.x, cty = g.py + g.vy * 0.45 - c.y, ct = Math.hypot(ctx2, cty) || 1, cv2 = c.v * T.chase * (cd < 90 ? 1.5 : 1); c.x += ctx2 / ct * cv2 * dt; c.y += cty / ct * cv2 * dt;
      if (cd < 24 && !(g.grace > 0)) { PR = null; breathSound(false); return miss('ПОТЕРЯ', 'ЗАЩИТНИК ОТОБРАЛ: УЕЗЖАЙ ЛЕВЫМ ПАЛЬЦЕМ', false, 'steal'); } }
    var dg = p.s === 'ready' && !teaching ? danger() : '';
    if (dg) { PR = null; breathSound(false); return dg === 'poke' ? miss('ПОТЕРЯ', 'ВРАТАРЬ ВЫБИЛ ШАЙБУ: НЕ ЛЕЗЬ В ЕГО ЗОНУ', false, 'poke') : miss('ПОТЕРЯ', 'СЛИШКОМ БЛИЗКО К ЗАЩИТНИКУ: ОБЪЕЗЖАЙ', false, 'steal'); }
    if (p.s === 'in' && p.t < 0.45 && p.t > 0 && !g.so && !g.safe && g.lesson >= 9) { var ik = 1 - p.t / 0.45, st2 = stick(), ipx = g.mate.x + 20 + (st2[0] - g.mate.x - 20) * ik, ipy = g.mate.y + 20 + (st2[1] - g.mate.y - 20) * ik; if (hitDef(ipx, ipy)) return miss('ПЕРЕХВАТ', 'ЗАЩИТНИК ПЕРЕХВАТИЛ ПАС: ОТКРОЙСЯ ПАРТНЁРУ', false, 'icept'); }
    if (p.s === 'in' && M.mateHead && p.t < 0.45 && !p.rolled && !g.so) { p.rolled = true; if (g.mheat >= 0.5 && !g.safe && Math.random() < 0.4 * g.mheat) return miss('ПАС НЕТОЧНЫЙ', 'ПАРТНЁР КИПИТ: ЕГО ПАС НЕ ДОШЁЛ', true, 'badpass'); }
    if (p.s === 'in') { p.t -= dt; if (p.t <= 0 && !danger()) { g.puck = { s: 'ready' }; g.recvAge = 0; if (g.safe) { g.safe = false; g.grace = 1.25; } g.recv = 0.35; SFX.pass(); buzz(10); g.clock = g.so ? 6 : CLOCK; if (M.chase && M.chase[g.seg] && g.sit !== 'pp') { var sp1 = [[58, 150], [262, 150], [58, 350], [262, 350], [160, 135], [160, 355], [40, 250], [280, 250]].filter(function (q) { return Math.hypot(q[0] - g.px, q[1] - g.py) > 120; }), sq = sp1[Math.floor(Math.random() * sp1.length)] || [58, 150]; g.ch = { x: sq[0], y: sq[1], v: M.chase[g.seg] * (g.sit === 'pk' ? 1.12 : 1) }; } } }
    else if (p.s === 'ready') { if (g.lesson >= 9) g.clock -= dt; if (g.clock <= 0) { PR = null; breathSound(false); miss('ПОТЕРЯ', 'ПОЗДНО: ВРЕМЯ НА БРОСОК ВЫШЛО', false, 'late'); } }
    else if (p.s === 'fly') {
      for (var q = 0; q < 4 && p.y > GOAL_Y; q++) { p.y += p.vy * dt / 4; p.x += p.vx * dt / 4; if (p.skip > 0) p.skip -= dt / 4; else if (hitDef(p.x, p.y)) { if (p.pierce > 0) { p.pierce--; p.skip = 0.1; var pv = Math.hypot(p.vx, p.vy) || 1; p.vx *= FLY * 0.85 / pv; p.vy *= FLY * 0.85 / pv; p.top = false; } else return miss('БЛОК', 'ЗАЩИТНИК БЫЛ НА ЛИНИИ БРОСКА', false, 'block'); } }
      g.trail.push([p.x, p.y]); if (g.trail.length > 7) g.trail.shift();
      if (p.x < 8 || p.x > W - 8) return miss('МИМО', p.wide ? 'ЛИНИЯ БЫЛА ШИРОКОЙ: ЗАМРИ ПЕРЕД БРОСКОМ' : 'ЛИНИЯ СМОТРЕЛА МИМО ВОРОТ', false, 'wide');
      if (p.y <= GOAL_Y) {
        // «девятка» идёт в угол: вратарь берёт её, только если стоит прямо на линии
        var inNet = p.x > NET_L + 2 && p.x < NET_R - 2, seen = !!p.slap && (g.mg.mirror || (p.from > 262 && g.gheat < 0.33 && !(S.role === 'D' && T.dSlap))), saved = !g.empty && Math.abs(p.x - (g.gx + GW / 2)) < saveHalf(p.top, p.from, seen) - (p.one ? 8 : 0) + (seen && g.mg.mirror ? 16 : 0);
        if (inNet && !saved) {
          if (!g.so) g.you++; g.press = Math.max(0, g.press - tv('goalPush')); g.goals++; g.streak++; if (p.breath) g.breathGoals++; g.gheat = Math.min(1, g.gheat + G.mg.gain); log(M.id, 'goal', { top: !!p.top, breath: !!p.breath });
          g.stop = p.top ? 0.16 : 0.1; g.jump = 0.5; g.net = 0.5; buzz(p.top ? [20, 30, 60] : 30);
          if (g.seg >= 2) g.goalsEnd = (g.goalsEnd || 0) + 1;
          if (p.top) g.topRow++; else g.topRow = 0; if (p.one) g.oneGoals++; if (M.mateHead) g.mheat = Math.max(0, g.mheat - 0.3);
          if (p.top) { g.tops++; burst(p.x, 70, 30, ['#2ce8f5', '#ffffff', '#fee761']); g.flash = 0.3; say(Math.min(p.x - NET_L, NET_R - p.x) < 18 ? 'ДЕВЯТКА!' : Math.abs(p.x - (g.gx + GW / 2)) < GW / 2 + 4 ? 'НАД ПЛЕЧОМ!' : p.x < g.gx ? 'НАД БЛИНОМ!' : 'НАД ЛОВУШКОЙ!', '#2ce8f5', 1.5, 'ВЫДОХНУЛ И ПОПАЛ'); SFX.top(); }
          else { burst(p.x, 70, 16, ['#fee761', '#feae34', '#ffffff']); say('ГОЛ', '#63c74d', 1.2, p.breath ? 'С ВЫДОХОМ' : ''); SFX.goal(g.streak); }
          if (g.missRow >= 2 && p.breath) deed('grit'); if (p.press) deed('brave'); if (p.first) deed('resp'); if (g.streak >= 2) deed('joy'); g.missRow = 0;
          if (p.one && !p.top) say('В КАСАНИЕ!', '#fee761', 1.4, 'ПОКА ВРАТАРЬ НЕ ВСТАЛ');
          if (M.flow && g.topRow >= 3 && !(g.flow > 0)) { g.flow = 8; g.flows++; g.topRow = 0; log(M.id, 'flow'); say('ПОТОК', '#2ce8f5', 1.8, 'ВОСЕМЬ СЕКУНД: ВЫДОХ И ПАС БЫСТРЕЕ'); SFX.core(); }
          nextPuck(T.goalT); if (g.so) { g.puck = { s: 'wait' }; g.soPend = { t: 1.3, sc: true }; } else if (g.seg === 3) { g.puck = { s: 'wait' }; g.soPend = { t: 1.3, end: true }; }
        } else { if (inNet) g.gheat = Math.min(1, g.gheat + G.mg.shotGain);
          if (saved && inNet) miss('СЕЙВ', seen ? (g.mg.mirror ? 'ЗЕРКАЛО ЧИТАЕТ ЩЕЛЧОК: НУЖЕН ПРИЦЕЛ' : 'ХОЛОДНЫЙ ВРАТАРЬ ВИДИТ ЩЕЛЧОК ИЗДАЛЕКА') : !p.top && p.from < 230 ? 'ВБЛИЗИ ВРАТАРЬ ВЫХОДИТ: НУЖЕН ТОЧНЫЙ ВЫДОХ' : p.top ? 'БРОСИЛ ПРЯМО ВО ВРАТАРЯ: ЦЕЛЬСЯ В УГОЛ' : g.gheat < 0.33 ? 'ВРАТАРЬ ХОЛОДНЫЙ: ОН УСПЕЛ' : 'ВРАТАРЬ БЫЛ НА ЛИНИИ', false, 'save');
          else if (Math.abs(p.x - NET_L) < 9 || Math.abs(p.x - NET_R) < 9) miss('ШТАНГА!', p.wide ? 'ЛИНИЯ БЫЛА ШИРОКОЙ' : 'ЧУТЬ ТОЧНЕЕ', true, 'post');
          else miss('МИМО', p.wide ? 'ЛИНИЯ БЫЛА ШИРОКОЙ: ЗАМРИ ПЕРЕД БРОСКОМ' : 'ЛИНИЯ СМОТРЕЛА МИМО ВОРОТ', false, 'wide'); }
      }
    }
    if (g.lesson === 0) { coach('ТЯНИ И ОТПУСТИ', 'Правый палец: коснись справа внизу, потяни назад и отпусти. Это бросок.'); if (g.shots >= 2) g.lesson = 1; }
    else if (g.lesson === 1) coach('ЗАМРИ ПЕРЕД БРОСКОМ', 'Потяни и подержи палец ровно секунду. Это выдох: линия сузится, голова остынет. Потом отпусти.');
    else if (g.lesson === 2) { coach('ЛЕВЫЙ ПАЛЕЦ ВЕДЁТ', 'Води левым пальцем слева внизу: игрок едет за ним по всей зоне, хоть к самым воротам. Отпустил: катится сам.'); g.l2 += dt; if (g.l2 > 9) g.lesson = 3; }
    else if (g.lesson === 3) { coach('ЩЕЛЧОК', 'Быстрый тап правым пальцем: сильный бросок без прицела. Летит быстро, но широко. Для моментов, когда защитник уже рядом.'); g.l3 += dt; if (g.l3 > 9) { g.lesson = 9; S.taught = true; save(); } }
    else if (g.tip && g.tip.t > 0 && g.pause <= 0) { coach(g.tip.a, g.tip.b); g.tip.t -= dt; }
    else if (g.tipQ && g.tipQ.length && g.pause <= 0) { g.tip = g.tipQ.shift(); }
    else coach(null);
  }
  // пауза между отрезками: одно решение, которое меняет следующий отрезок
  function between(ns) {
    cancelAnimationFrame(raf);
    function go(i, spirit) { if (spirit) G.core = true; rebuildMatchDom(); setSeg(ns); run(); }
    if (M.id === 1 && ns === 1 && S.askRole) { pick = {}; FLOW = go; return pre1a(); }
    if (M.dec && M.dec[ns]) return decide(M.id, M.dec[ns].key, M.dec[ns].q, M.dec[ns].opts(), go, 'МАТЧ ' + M.id + ' · СКАМЕЙКА');
    if (M.id === 2 && ns === 1) return decide(2, 'tempo', 'Горячий злится после каждой пропущенной. Как играешь дальше?', [
      { label: 'ДАВЛЮ: БРОСАЮ ЧАЩЕ', dots: [['Темп', 2], ['Голова', 1]], vals: ['Смелость', 'Упорство', 'Трудолюбие', 'Радость игры'], apply: function () { G.fast = true; G.heat = Math.min(1, G.heat + 0.15); return ['Шайба приходит быстрее', 'Голова теплее: темп стоит нервов']; } },
      { label: 'ЖДУ СВОЙ МОМЕНТ', dots: [['Голова', 2]], vals: ['Спокойствие', 'Дисциплина', 'Смирение', 'Любопытство'], apply: function () { G.fast = false; G.heat = Math.max(0, G.heat - 0.3); return ['Голова холоднее на старте отрезка', 'Темп обычный']; } }], go, 'МАТЧ 2 · СКАМЕЙКА');
    if (M.id === 3 && ns === 1) return decide(3, 'after_goal', 'Вы пропустили в твою смену. Партнёр смотрит на тебя.', [
      { label: '«МОЯ. СЛЕДУЮЩУЮ ЗАБИРАЕМ»', dots: [['Раздевалка', 2]], vals: ['Ответственность', 'Верность команде', 'Честность', 'Уважение', 'Смелость'], apply: function () { S.room = Math.min(3, S.room + 1); return ['Раздевалка +1: взял на себя и не стал искать виноватых']; } },
      { label: 'МОЛЧА ВЫДОХНУ И СОБЕРУСЬ', dots: [['Голова', 2]], vals: ['Спокойствие', 'Дисциплина', 'Смирение'], apply: function () { G.heat = Math.max(0, G.heat - 0.35); return ['Голова холоднее на старте отрезка', 'Раздевалка без изменений: партнёр остался один со своей ошибкой']; } }], go, 'МАТЧ 3 · СКАМЕЙКА');
    G.pause = 2.4; G.pauseText = ns === 3 ? ['ОВЕРТАЙМ', 'Ничьих в хоккее нет. Двадцать секунд до первого гола. Давление соперника растёт: потеряешь шайбу, забьют тебе.'] : ['СКАМЕЙКА', ns === 1 ? (M.id === 1 ? 'Дальше соперник тоже атакует. Красная полоса сверху: его давление. Каждая твоя потеря её толкает.' : 'Второй отрезок.') : 'Последний отрезок.' + (M.chase && M.chase[ns] ? (M.id === 2 ? ' Оранжевый защитник' : ' Один из защитников') + ' идёт на тебя: уезжай.' : '')];
    var keepSeg = ns; G.afterPause = function () { setSeg(keepSeg); }; run();
  }
  function R(c, x, y, w, h) { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); }
  function draw() {
    var g = G, p = g.puck, sh = g.shake > 0 ? 3 : 0, nk = g.net > 0 ? Math.round(Math.sin(g.net * 40) * 2) : 0, jy = g.jump > 0 ? Math.round(Math.sin(g.jump / 0.5 * Math.PI) * 10) : 0, s = stick();
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.textBaseline = 'top'; R('#181425', 0, 0, W, H);
    cx.translate(Math.round((Math.random() - 0.5) * sh), Math.round((Math.random() - 0.5) * sh));
    var rk = img('rink.png'); if (rk) cx.drawImage(rk, 0, 0, W, H); else {
    R('#dfe9f5', 8, 8, W - 16, H - 16); R('#e43b44', 8, 80, W - 16, 3); R('#0099db', 8, 240, W - 16, 4); R('#bcd3ee', 102, 83, 116, 54); R('#e43b44', 102, 135, 116, 2); R('#e43b44', 102, 83, 2, 54); R('#e43b44', 216, 83, 2, 54);
    }
    // нижняя полоса с подсказками только в первом матче; дальше это место для катания
    if (g.strip) {
    cx.fillStyle = S.lefty ? 'rgba(254,174,52,.14)' : 'rgba(0,153,219,.12)'; cx.fillRect(8, ZONE, W / 2 - 9, H - ZONE - 8); cx.fillStyle = S.lefty ? 'rgba(0,153,219,.12)' : 'rgba(254,174,52,.14)'; cx.fillRect(W / 2 + 1, ZONE, W / 2 - 9, H - ZONE - 8); var mvx = S.lefty ? 236 : 84, amx = S.lefty ? 84 : 236;
    cx.font = '8px "Press Start 2P", monospace'; cx.textAlign = 'center'; cx.fillStyle = '#5a6988';
    if (!PL) { cx.fillText(hands('ЛЕВЫЙ ПАЛЕЦ'), mvx, 414); cx.fillText(tr('ВЕДЁТ'), mvx, 428); }
    if (!PR) { cx.fillText(hands('ПРАВЫЙ ПАЛЕЦ'), amx, 414); cx.fillText(tr('ТЯНИ И ДЕРЖИ'), amx, 428); }
    }
    if (!rk) {
    R(OUT, NET_L - 4, 44, NET_R - NET_L + 8, 38); R('#ffffff', NET_L, 48, NET_R - NET_L, 32);
    for (var i = NET_L + 8; i < NET_R; i += 10) R('#c0cbdc', i + nk, 48 - Math.abs(nk), 1, 32);
    for (var j = 56; j < 80; j += 8) R('#c0cbdc', NET_L, j, NET_R - NET_L, 1);
    R('#e43b44', NET_L - 4, 44, 4, 38); R('#e43b44', NET_R, 44, 4, 38); R('#e43b44', NET_L - 4, 44, NET_R - NET_L + 8, 4);
    }
    if (p.s === 'ready' && g.pause <= 0) {
      var A = aim(), top = isTop(), sp = top ? 0.006 : spreadA(), dy = s[1] - GOAL_Y - 2;
      var hot = g.heat * (1 - 0.85 * Math.min(1, g.breath)), jit = hot > 0.2 ? (Math.random() - 0.5) * hot * 0.05 : 0;
      var x1 = s[0] + Math.tan(A.a - sp + jit) * dy, x2 = s[0] + Math.tan(A.a + sp + jit) * dy, xc = s[0] + Math.tan(A.a) * dy;
      var col = M.blind ? '200,205,215' : top ? '44,232,245' : g.heat >= 0.66 ? '228,59,68' : g.heat >= 0.33 ? '254,174,52' : '99,199,77', al = PR ? 1 : 0.35;
      cx.fillStyle = 'rgba(' + col + ',' + ((top ? 0.55 : 0.28) * al) + ')'; cx.beginPath(); cx.moveTo(s[0] - 2, s[1]); cx.lineTo(x1, GOAL_Y + 2); cx.lineTo(x2, GOAL_Y + 2); cx.lineTo(s[0] + 2, s[1]); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(' + col + ',' + (0.95 * al) + ')'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(s[0], s[1]); cx.lineTo(x1, GOAL_Y + 2); cx.moveTo(s[0], s[1]); cx.lineTo(x2, GOAL_Y + 2); cx.stroke();
      if (PR) { var blocked = (!g.empty && Math.abs(xc - (g.gx + GW / 2)) < saveHalf(top, s[1], false)) || xc < NET_L + 2 || xc > NET_R - 2; R(blocked ? '#e43b44' : '#ffffff', x1 - 1, GOAL_Y - 1, Math.max(3, x2 - x1 + 2), 3);
        if (g.breath > 0.03) { cx.strokeStyle = top ? '#2ce8f5' : '#ffffff'; cx.lineWidth = top ? 5 : 3; cx.beginPath(); cx.arc(s[0], s[1], 28 - 21 * Math.min(1, g.breath), 0, 6.3); cx.stroke(); } }
      // поправка из разбора: где вратарь окажется к моменту броска
      if (g.ghost && g.playSeg === 2) { var fx = g.gx + g.gdir * (g.gspeed || 0) * (dy / FLY); if (fx < NET_L) fx = NET_L + (NET_L - fx); if (fx > NET_R - GW) fx = (NET_R - GW) - (fx - (NET_R - GW)); cx.strokeStyle = 'rgba(44,232,245,.9)'; cx.lineWidth = 2; cx.strokeRect(Math.round(fx), 66, GW, 30); cx.fillStyle = '#0b7c8a'; cx.fillText('БУДЕТ ТУТ', Math.round(fx) + GW / 2, 122); }
    }
    var gh = g.gheat, gj = gh > 0.3 ? Math.round((Math.random() - 0.5) * gh * 5) : 0, gxx = g.gx + gj;
    var gout = p.s === 'ready' ? Math.round(outK(s[1]) * 10) : 0; cx.save(); cx.translate(0, g.empty ? -600 : gout);
    var gi = img(gh >= 0.66 ? 'goalie_hot.png' : gh >= 0.33 ? 'goalie_warm.png' : 'goalie_cool.png');
    if (gi) { cx.drawImage(gi, Math.round(gxx - 9), 51, 62, 52);
    R(OUT, g.gx + 5, 106, GW - 10, 6); R(gh >= 0.66 ? '#e43b44' : gh >= 0.33 ? '#feae34' : '#63c74d', g.gx + 6, 107, Math.max(2, (GW - 12) * Math.max(0.08, gh)), 4);
    } else {
    var gc = gh >= 0.66 ? '#9e2835' : gh >= 0.33 ? '#b86f50' : '#3b55b8';
    // клюшка и блин (слева), ловушка (справа), щитки, маска с решёткой
    R(OUT, gxx - 4, 80, 4, 22); R('#b86f50', gxx - 3, 81, 2, 20); R(OUT, gxx - 4, 98, 20, 5); R('#b86f50', gxx - 3, 99, 18, 3);
    R(OUT, gxx - 1, 66, GW + 2, 30); R(gc, gxx, 67, GW, 14); R('#ffffff', gxx, 81, GW, 14); R('#feae34', gxx, 79, GW, 2); R(OUT, gxx + 21, 81, 2, 14); R('#c0cbdc', gxx + 2, 92, 17, 2); R('#c0cbdc', gxx + 25, 92, 17, 2);
    R(OUT, gxx - 8, 70, 10, 15); R('#feae34', gxx - 7, 71, 8, 13); R('#b86f50', gxx - 7, 71, 8, 2);
    R(OUT, gxx + GW - 2, 68, 11, 12); R('#c0cbdc', gxx + GW - 1, 69, 9, 10); R(OUT, gxx + GW + 2, 71, 4, 5); R('#8b9bb4', gxx + GW + 3, 72, 2, 3);
    R(OUT, gxx + 13, 53, 18, 16); R(gh >= 0.66 ? '#f6757a' : gh >= 0.33 ? '#feae34' : '#f4f4f4', gxx + 14, 54, 16, 14); R(gc, gxx + 14, 54, 16, 3);
    R(OUT, gxx + 16, 59, 12, 7); R('#8b9bb4', gxx + 17, 60, 10, 5); R(OUT, gxx + 17, 62, 10, 1); R(OUT, gxx + 20, 60, 1, 5); R(OUT, gxx + 23, 60, 1, 5);
    R(OUT, g.gx + 5, 106, GW - 10, 6); R(gh >= 0.66 ? '#e43b44' : gh >= 0.33 ? '#feae34' : '#63c74d', g.gx + 6, 107, Math.max(2, (GW - 12) * Math.max(0.08, gh)), 4);
    }
    cx.restore();
    g.defs.forEach(function (d) { cx.drawImage(img('defender.png') || spr.def, Math.round(d.x), d.y - 12, 51, 54); });
    if (g.ch) cx.drawImage(img(M.id === 2 ? 'chaser.png' : 'defender.png') || spr.ch, Math.round(g.ch.x - 25), Math.round(g.ch.y - 27), 51, 54);
    if (p.s === 'fly') { g.trail.forEach(function (q, k) { R(p.top ? '#2ce8f5' : '#8b9bb4', q[0] - 2, q[1], 4, 4 + k); }); R(OUT, p.x - 4, p.y - 3, 8, 6); R('#3a4466', p.x - 3, p.y - 2, 6, 3); }
    g.parts.forEach(function (q) { R(q.c, q.x, q.y, 3, 3); });
    if (!g.so) { cx.globalAlpha = 0.8; cx.drawImage(img('mate.png') || spr.me, Math.round(g.mate.x - 25), Math.round(g.mate.y - 27), 51, 54); cx.globalAlpha = 1;
      if (M.mateHead) { R(OUT, g.mate.x - 18, g.mate.y - 38, 36, 6); R(g.mheat >= 0.66 ? '#e43b44' : g.mheat >= 0.33 ? '#feae34' : '#63c74d', g.mate.x - 17, g.mate.y - 37, Math.max(2, 34 * Math.max(0.08, g.mheat)), 4); } }
    if (p.s === 'in' && p.t < 0.45 && !g.so) { var pk = Math.max(0, Math.min(1, 1 - p.t / 0.45)), mx = g.mate.x + 20, my = g.mate.y + 20, qx = mx + (s[0] - mx) * pk, qy = my + (s[1] - my) * pk;
      cx.strokeStyle = 'rgba(58,68,102,.45)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(mx, my); cx.lineTo(qx, qy); cx.stroke(); R(OUT, qx - 5, qy - 3, 10, 6); R('#3a4466', qx - 4, qy - 2, 8, 3); }
    cx.drawImage(img(S.role === 'D' ? 'hero_d.png' : 'hero_f.png') || spr.me, Math.round(g.px - 25), Math.round(g.py - 27 - jy), 51, 54);
    if (g.grace > 0) { cx.strokeStyle = 'rgba(255,255,255,' + (0.35 + 0.5 * (g.grace / 1.25)).toFixed(2) + ')'; cx.lineWidth = 2; cx.beginPath(); cx.arc(g.px, g.py, 31, 0, 6.3); cx.stroke(); }
    if (g.recv > 0) { cx.strokeStyle = 'rgba(254,231,97,' + (g.recv / 0.35).toFixed(2) + ')'; cx.lineWidth = 3; cx.beginPath(); cx.arc(s[0], s[1], 8 + (0.35 - g.recv) * 60, 0, 6.3); cx.stroke(); }
    if (p.s === 'ready') { R(OUT, s[0] - 5, s[1] - 3, 10, 6); R('#3a4466', s[0] - 4, s[1] - 2, 8, 3);
      R(OUT, g.px - 22, g.py - 40 - jy, 44, 7); R(g.clock < 2.5 ? '#e43b44' : '#63c74d', g.px - 21, g.py - 39 - jy, Math.max(0, 42 * g.clock / CLOCK), 5); }
    // пальцы
    if (PL) { cx.strokeStyle = 'rgba(0,153,219,.8)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(PL.ox, PL.oy, 22, 0, 6.3); cx.stroke(); var lx = PL.x - PL.ox, ly = PL.y - PL.oy, ll = Math.hypot(lx, ly) || 1, lk = Math.min(1, 22 / ll); cx.fillStyle = 'rgba(0,153,219,.8)'; cx.beginPath(); cx.arc(PL.ox + lx * lk, PL.oy + ly * lk, 8, 0, 6.3); cx.fill(); }
    if (PR) { cx.strokeStyle = 'rgba(184,111,80,.9)'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(PR.ox, PR.oy); cx.lineTo(PR.x, PR.y); cx.stroke(); cx.fillStyle = 'rgba(184,111,80,.9)'; cx.beginPath(); cx.arc(PR.ox, PR.oy, 5, 0, 6.3); cx.fill(); }
    cx.setTransform(1, 0, 0, 1, 0, 0);
    if (M.id >= 2 && S.values.length) { var hotc = g.core && g.heat >= 0.33; R(OUT, 12, 12, 82, 42); R(hotc ? (Math.floor(g.T * 4) % 2 ? '#2ce8f5' : '#ffffff') : g.core ? '#1b6f7a' : '#3a4466', 14, 14, 78, 38); cx.font = '8px "Press Start 2P", monospace'; cx.textAlign = 'center'; cx.fillStyle = hotc ? '#181425' : g.core ? '#c0cbdc' : '#8b9bb4'; cx.fillText(tr('СТЕРЖЕНЬ'), 53, 21); cx.fillText(tr(hotc ? 'ТАП-ТАП' : g.core ? 'ГОТОВ' : 'ПУСТ'), 53, 36); }
    if (M.id >= 2 && S.values.length && !g.core && g.pause <= 0 && !M.noHints) { var hv = S.values[Math.floor(g.T / 3.5) % S.values.length]; cx.font = '8px "Press Start 2P", monospace'; cx.textAlign = 'center'; var hy = g.strip ? 372 : 444; R('rgba(24,20,37,.82)', 8, hy, W - 16, 18); cx.fillStyle = '#2ce8f5'; cx.fillText('ЗАРЯД: ' + shortOf(hv), W / 2, hy + 5, W - 24); }
    if (g.flow > 0) { cx.strokeStyle = 'rgba(44,232,245,' + (0.6 + 0.3 * Math.sin(g.T * 10)).toFixed(2) + ')'; cx.lineWidth = 6; cx.strokeRect(3, 3, W - 6, H - 6); }
    if (g.noise > 0) { var na = 0.1 + 0.07 * Math.sin(g.T * 14); cx.fillStyle = 'rgba(228,59,68,' + na.toFixed(2) + ')'; cx.fillRect(0, 0, W, 26); cx.fillRect(0, 0, 12, H); cx.fillRect(W - 12, 0, 12, H); }
    if (g.nudge > 0 && g.core && g.pause <= 0) { cx.font = '8px "Press Start 2P", monospace'; cx.textAlign = 'center'; R(OUT, 12, 58, 172, 20); R(Math.floor(g.T * 4) % 2 ? '#2ce8f5' : '#ffffff', 14, 60, 168, 16); cx.fillStyle = '#181425'; cx.fillText(tr('ГОЛОВА ГОРИТ: ТАП-ТАП'), 98, 64); }
    if (g.flash > 0) { cx.fillStyle = 'rgba(255,255,255,' + (g.flash * 1.4).toFixed(2) + ')'; cx.fillRect(0, 0, W, H); }
    cx.textAlign = 'center';
    if (g.msgT > 0 && g.pause <= 0) { cx.font = '14px "Press Start 2P", monospace'; cx.fillStyle = OUT; cx.fillText(g.msg, W / 2 + 2, 152); cx.fillStyle = g.msgC; cx.fillText(g.msg, W / 2, 150);
      if (g.sub) { cx.font = '8px "Press Start 2P", monospace'; var sw = Math.min(W - 8, cx.measureText(g.sub).width + 14); R('#181425', W / 2 - sw / 2, 172, sw, 18); cx.fillStyle = '#ffffff'; cx.fillText(g.sub, W / 2, 177, W - 16); } }
    if (g.pause > 0 && g.pauseText) { cx.fillStyle = 'rgba(24,20,37,.88)'; cx.fillRect(0, 0, W, H); cx.font = '14px "Press Start 2P", monospace'; cx.fillStyle = '#fee761'; cx.fillText(g.pauseText[0], W / 2, 190);
      cx.font = '8px "Press Start 2P", monospace'; cx.fillStyle = '#ffffff'; wrap(hands(g.pauseText[1]), W / 2, 224, 280, 15); }
    cx.textAlign = 'left';
    var left = Math.max(0, Math.ceil(g.segLen - g.t)), tm = '0:' + ('0' + left).slice(-2);
    if (els.time.textContent !== tm) els.time.textContent = tm;
    if (els.you.textContent !== String(g.you)) els.you.textContent = g.you;
    if (els.riv.textContent !== String(g.riv)) els.riv.textContent = g.riv;
    els.pf.style.width = Math.min(100, g.press * 100) + '%';
    els.fill.style.width = Math.min(100, g.t / g.segLen * 100) + '%';
  }
  function wrap(text, x, y, maxW, lh) { var line = ''; text.split(' ').forEach(function (w) { var tl = line ? line + ' ' + w : w; if (cx.measureText(tl).width > maxW && line) { cx.fillText(line, x, y); y += lh; line = w; } else line = tl; }); if (line) cx.fillText(line, x, y); }
  function loop(now) {
    if (view !== 'play' || !G) return;
    var dt = Math.max(0.001, Math.min(0.05, (now - prev) / 1000)); prev = now;
    if (G.pause > 0 && G.afterPause && G.pause - dt <= 0) { var f = G.afterPause; G.afterPause = null; G.pause = 0; G.pauseText = null; f(); }
    else if (G.stop > 0) G.stop -= dt; else update(dt);
    if (view === 'play' && G) { draw(); raf = requestAnimationFrame(loop); }
  }
  function finish() {
    var g = G, m = M; cancelAnimationFrame(raf); breathSound(false);
    var r = { goalsEnd: g.goalsEnd || 0, firstShotBreath: !!g.firstShotBreath, lossesEnd: g.lossesEnd || 0, flows: g.flows, oneGoals: g.oneGoals, mateHot: g.mateHot, losses: g.losses, trig: g.trig, hotShots: g.hotShots, firstAll: [0, 1, 2].every(function (i) { return g.segFirst[i] === true; }), you: g.you, riv: g.riv, shots: g.shots, goals: g.goals, breathShots: g.breathShots, breathGoals: g.breathGoals, narrow: g.narrow, tops: g.tops, hot: Math.round(g.hot), coreHot: g.coreHot, firstAfterBreath: g.firstAfterBreath,
      cooledAll: g.rivGoals.every(function (x) { return x.cooled; }), rivGoals: g.rivGoals.length };
    var s1 = r.cooledAll, s2 = r.shots > 0 && r.narrow / r.shots >= 0.5, s3 = !!m.s3(r), n = (s1 ? 1 : 0) + (s2 ? 1 : 0) + (s3 ? 1 : 0);
    if (SIM) { SIM.result = { you: r.you, riv: r.riv, stars: n, hot: r.hot, shots: r.shots, narrow: r.narrow, goals: r.goals, how: g.endHow }; G = null; return; }
    S.st3 = S.st3 || {}; var o3 = S.st3[m.id] || [0, 0, 0]; S.st3[m.id] = [o3[0] || (s1 ? 1 : 0), o3[1] || (s2 ? 1 : 0), o3[2] || (s3 ? 1 : 0)];
    var se = null, serOpen = false;
    if (m.series) { S.ser = S.ser || {}; se = S.ser[m.id] || { w: (m.seriesStart || [0, 0])[0], l: (m.seriesStart || [0, 0])[1], g: 0 }; se.g = (se.g || 0) + 1; if (r.you > r.riv) se.w++; else se.l++; se.over = se.w >= m.series || se.l >= m.series; S.ser[m.id] = se; serOpen = !se.over; log(m.id, 'series', { w: se.w, l: se.l, over: se.over }); }
    var first = !S.done[m.id] && !serOpen; if (!serOpen) S.done[m.id] = true; S.stars[m.id] = Math.max(S.stars[m.id] || 0, n); S.core = g.core; if (first) { S.res = S.res || {}; S.res[m.id] = (se ? se.w >= m.series : r.you > r.riv) ? 1 : 0; if (g.hN) { S.hab = S.hab || {}; S.hab[m.id] = [+(g.hSide / g.hN).toFixed(2), +(g.hB / g.hN).toFixed(2), Math.round(g.hY / g.hN)]; } } if (m.record) S.rec = Math.max(S.rec || 0, r.tops); if (first && m.id >= 4) worldAfter(m, r, n, g); save(); log(m.id, 'end', { leftSec: Math.round(g.leftSec), falseTaps: g.falseTaps, you: r.you, riv: r.riv, stars: n, narrowShare: r.shots ? +(r.narrow / r.shots).toFixed(2) : 0, hotSec: r.hot });
    G = null; view = 'result';
    function star(on, text) { return '<div class="star' + (on ? ' on' : '') + '"><i>★</i><span>' + text + '</span></div>'; }
    var win = r.you > r.riv;
    screen('ИТОГ', '<span class="tag' + (win ? '' : ' tag--red') + '">МАТЧ ' + m.id + ' · ' + (m.record ? 'ТРЕНИРОВКА' : (win ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ') + g.endHow) + (se ? ' · СЕРИЯ ' + se.w + ':' + se.l : '') + '</span>' +
      (m.record ? '<div class="final">' + r.tops + '<small>ИДЕАЛЬНЫХ БРОСКОВ · РЕКОРД ' + (S.rec || r.tops) + '</small></div>' : '<div class="final">' + r.you + ' : ' + r.riv + '<small>' + (m.myTeam || TEAM).toUpperCase() + ' · ' + m.team.toUpperCase() + '</small></div>') +
      '<section class="panel panel--hot"><h2 class="h2">ЗВЁЗДЫ ДАЮТ ЗА ГОЛОВУ, А НЕ ЗА СЧЁТ</h2>' +
      star(s1, r.rivGoals ? 'Остудил голову после каждой пропущенной' : 'Голова не перегревалась') +
      star(s2, 'Половина бросков с узкой линией') + star(s3, m.star3) + '</section>' +
      '<section class="panel"><div class="stats"><span>Бросков с узкой линией</span><b>' + r.narrow + ' / ' + r.shots + '</b><span>Голов с выдоха</span><b>' + r.breathGoals + ' / ' + r.goals + '</b><span>Идеальных бросков</span><b>' + r.tops + '</b><span>Секунд с горячей головой</span><b>' + r.hot + '</b></div></section>',
      (serOpen ? '<button class="btn" type="button" data-act="go" data-m="' + m.id + '">СЛЕДУЮЩАЯ ИГРА СЕРИИ ▶</button>' : '<button class="btn" type="button" data-act="after" data-m="' + m.id + '">ДАЛЬШЕ ▶</button><button class="btn btn--ghost" type="button" data-act="go" data-m="' + m.id + '">ПЕРЕИГРАТЬ</button>'));
  }
  function after(id) {
    pick = {};
    if (S.last && S.last.id === id && !S.last.seen) { S.last.seen = true; save(); return world(id); }
    if (id === 1 && !S.life[1]) return life(1, home);
    if (id === 3 && !S.fix) return review(0, home);
    if (id === 4 && !S.life[4]) return life(4, home);
    if (id > 4 && MATCHES[id - 1].life && !S.life[id]) return life(id, function () { after(id); });
    if (MATCHES[id - 1].pathEnd === true && !S.path1) return pathEnd();
    if (MATCHES[id - 1].pathEnd === 2 && !S.path2) return pathEnd2();
    home();
  }
  // левая половина льда: палец ведёт игрока, два быстрых тапа включают стержень. Правая: оттяжка, выдох, бросок
  function bind() {
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; }
    cv.addEventListener('pointerdown', function (e) { e.preventDefault(); if (!G) return; var q = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      if ((q[0] < W / 2) !== !!S.lefty) PL = { id: e.pointerId, ox: q[0], oy: q[1], x: q[0], y: q[1], sx: q[0], sy: q[1], t0: performance.now() };
      else PR = { id: e.pointerId, ox: q[0], oy: q[1], x: q[0], y: q[1], mv: 0, sp: 0, t0: performance.now() }; });
    cv.addEventListener('pointermove', function (e) { if (!G) return; var q = pos(e);
      if (PL && PL.id === e.pointerId) { PL.x = q[0]; PL.y = q[1]; }
      else if (PR && PR.id === e.pointerId) { PR.mv += Math.hypot(q[0] - PR.x, q[1] - PR.y); PR.x = q[0]; PR.y = q[1]; } });
    function up(e, cancel) { if (PL && PL.id === e.pointerId) { var now = performance.now(); if (!cancel && now - PL.t0 < 230 && Math.hypot(PL.x - PL.sx, PL.y - PL.sy) < 10) { useWord(); if (now - lastL < 400) { lastL = 0; useCore(); } else lastL = now; } PL = null; } else if (PR && PR.id === e.pointerId) { if (G && !cancel) shoot(performance.now() - PR.t0 < 220); PR = null; } }
    cv.addEventListener('pointerup', function (e) { e.preventDefault(); up(e, false); });
    cv.addEventListener('pointercancel', function (e) { up(e, true); });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  /* ---------- мир между матчами: форма, доверие, раздевалка, репутация ---------- */
  // Меняется от решений и от того, как сыгран матч (только первое прохождение). Действует на матчи с пятого.
  function worldAfter(m, r, n, g) {
    if (S.form == null) { S.form = 1; S.rep = 0; }
    var d = [], win = r.you > r.riv;
    function ch(k, name, v, why) { var o = S[k] || 0, nv = Math.max(0, Math.min(3, o + v)); if (nv !== o) { S[k] = nv; d.push(name + (v > 0 ? ' +1: ' : ' −1: ') + why); } }
    if (n >= 2) ch('form', 'Форма', 1, 'две звезды и больше, играл головой'); else if (n === 0) ch('form', 'Форма', -1, 'ни одной звезды за голову');
    if (win && (n === 3 || g.endHow)) ch('rep', 'Репутация', 1, g.endHow ? 'победа в концовке, о тебе заговорили' : 'победа на три звезды'); else if (!win && n === 0) ch('rep', 'Репутация', -1, 'поражение без единой звезды');
    if (n === 3) ch('trust', 'Доверие', 1, 'тренер видел холодную голову весь матч'); else if (r.hot >= 20) ch('trust', 'Доверие', -1, 'тренер видел, как ты кипел');
    S.last = { id: m.id, d: d, seen: false }; if (d.length) log(m.id, 'world', { d: d.join('; ') });
  }
  function worldLines() {
    var fm = S.form == null ? 1 : S.form;
    return ['Форма: выдох ' + (fm >= 2 ? 'быстрее обычного' : fm === 0 ? 'медленнее обычного' : 'обычный'),
      'Раздевалка: пас ' + (S.room >= 2 ? 'быстрее обычного' : S.room === 0 ? 'медленнее обычного' : 'обычный'),
      'Доверие: ' + (S.trust >= 2 ? 'стержень заряжен на старте' : S.trust === 0 ? 'в концовке тебе дадут меньше времени' : 'обычная смена'),
      'Репутация: решит, куда ты попадёшь в конце пути'];
  }
  function worldBrief(m) { var pg = m.pickG ? m.pickG() : null, sr = m.series ? (S.ser && S.ser[m.id] && !S.ser[m.id].over ? S.ser[m.id] : { w: (m.seriesStart || [0, 0])[0], l: (m.seriesStart || [0, 0])[1], g: 0 }) : null; return (sr ? '<section class="panel panel--hot"><h2 class="h2">СЕРИЯ ' + sr.w + ':' + sr.l + ' · ИГРА ' + (sr.w + sr.l + 1) + '</h2><p>' + (sr.g ? 'Силы не восстановились: выдох длиннее, чем в прошлой игре.' : 'Серия идёт до ' + m.series + ' побед.') + '</p></section>' : '') + (pg ? '<section class="panel panel--hot"><h2 class="h2">В ВОРОТАХ: ' + pg.name.toUpperCase() + '</h2><p>' + pg.why + '</p></section>' : '') + (m.id > 4 ? '<section class="panel"><h2 class="h2">С ЧЕМ ТЫ ВЫХОДИШЬ</h2>' + worldLines().slice(0, 3).map(function (l) { return '<p>' + l + '</p>'; }).join('') + '</section>' : ''); }
  function world(id) {
    view = 'world'; var d = (S.last && S.last.d) || [];
    screen('МЕЖДУ МАТЧАМИ', '<span class="tag">МЕЖДУ МАТЧАМИ</span><h1 class="h1">ЧТО ИЗМЕНИЛОСЬ</h1>' +
      (d.length ? d.map(function (l) { return '<p class="line">' + l + '</p>'; }).join('') : '<p class="lead">Без перемен: всё осталось как было.</p>') +
      '<section class="panel"><div class="meters"><span>ФОРМА</span>' + pips(S.form == null ? 1 : S.form) + '<span>ДОВЕРИЕ</span>' + pips(S.trust || 0) + '<span>РАЗДЕВАЛКА</span>' + pips(S.room || 0) + '<span>РЕПУТАЦИЯ</span>' + pips(S.rep || 0) + '</div></section>' +
      '<section class="panel"><h2 class="h2">В СЛЕДУЮЩЕМ МАТЧЕ</h2>' + worldLines().map(function (l) { return '<p>' + l + '</p>'; }).join('') + '</section>',
      '<button class="btn" type="button" data-act="after" data-m="' + id + '">ДАЛЬШЕ ▶</button>');
  }

  // экран «мои звёзды и развилки»: что взято, что осталось, какие решения приняты
  function starsScreen() {
    view = 'stars'; var h = '<span class="tag">МОИ ЗВЁЗДЫ И РЕШЕНИЯ</span>', any = false;
    MATCHES.forEach(function (m) {
      if (!S.done[m.id]) return; any = true; var t = (S.st3 || {})[m.id], n = S.stars[m.id] || 0, dk = S.dec || {}, ds = [];
      for (var k in dk) if (k.indexOf(m.id + ':') === 0) ds.push(dk[k]);
      function row(on, text) { return '<div class="star' + (on ? ' on' : '') + '"><i>★</i><span>' + text + '</span></div>'; }
      h += '<section class="panel"><h2 class="h2">' + m.id + ' · ' + m.name + '</h2>' + (t ? row(t[0], 'Остудил голову после каждой пропущенной') + row(t[1], 'Половина бросков с узкой линией') + row(t[2], m.star3) : '<p class="note">Звёзд: ' + n + ' из 3. Какие именно, покажет следующая игра в этом матче.</p>') +
        ds.map(function (d) { return '<p class="line">' + d + '</p>'; }).join('') + '</section>';
    });
    screen('ЗВЁЗДЫ', any ? h + '<p class="note">Серые звёзды можно взять, переиграв матч. Решения при переигровке остаются прежними.</p>' : h + '<p class="lead">Пока пусто. Сыграй первый матч.</p>', '<button class="btn" type="button" data-act="home">НАЗАД</button>');
  }
  function settings() {
    view = 'settings';
    function tg(k, on, a, b) { return '<button class="opt" type="button" data-act="tgl" data-k="' + k + '"><b>' + (on ? a : b) + '</b></button>'; }
    screen('НАСТРОЙКИ', '<span class="tag">НАСТРОЙКИ</span>' + tg('sound', S.sound, 'ЗВУК: ВКЛЮЧЁН', 'ЗВУК: ВЫКЛЮЧЕН') + tg('music', S.music !== false, 'МУЗЫКА: ВКЛЮЧЕНА', 'МУЗЫКА: ВЫКЛЮЧЕНА') +
      tg('lang', S.lang !== 'en', 'ЯЗЫК: РУССКИЙ', 'LANGUAGE: ENGLISH (draft, matches 1-7)') +
      tg('fast1', !S.fast1, 'ВХОД: ОБЫЧНЫЙ. Сначала экраны, потом лёд', 'ВХОД ДЛЯ ТЕСТА: сразу на лёд, амплуа после первого отрезка') +
      tg('lefty', !S.lefty, 'РУКИ: ОБЫЧНО. Ведёт левая рука, бросает правая', 'РУКИ: ДЛЯ ЛЕВШИ. Ведёт правая рука, бросает левая') +
      '<button class="btn btn--ghost" type="button" data-act="savecode">ПЕРЕНЕСТИ ПРОГРЕСС</button><button class="btn btn--ghost" type="button" data-act="logs">ЖУРНАЛ ТЕСТА</button><button class="btn btn--ghost" type="button" data-act="parent">ДЛЯ РОДИТЕЛЕЙ</button><button class="btn btn--ghost" type="button" data-act="wipeask">НАЧАТЬ ЗАНОВО</button>',
      '<button class="btn" type="button" data-act="home">ГОТОВО</button>');
  }
  // перенос прогресса: строка-код, без сети. Всё, что приходит из кода, чистится: в строках не остаётся разметки
  function cleanState(o, d) {
    if (d > 5) return null; if (typeof o === 'string') return o.replace(/[<>&"'`]/g, '').slice(0, 60); if (typeof o === 'number') return isFinite(o) ? o : 0; if (typeof o === 'boolean' || o === null) return o;
    if (Array.isArray(o)) return o.slice(0, 40).map(function (x) { return cleanState(x, d + 1); }); if (typeof o !== 'object') return null;
    var r = {}, n = 0; for (var k in o) { if (n++ > 80) break; r[String(k).replace(/[^0-9A-Za-z_:]/g, '').slice(0, 24)] = cleanState(o[k], d + 1); } return r;
  }
  function codeOf() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { return ''; } }
  function codeLoad(c) {
    try { var o = cleanState(JSON.parse(decodeURIComponent(escape(atob(String(c).replace(/\s+/g, ''))))), 0); if (!o || typeof o.done !== 'object' || o.done === null) return false;
      var n = blank(); for (var k in o) n[k] = o[k]; n.values = (Array.isArray(n.values) ? n.values : []).filter(function (v) { return VALUES.indexOf(v) >= 0; }).slice(0, 3);
      n.role = n.role === 'D' ? 'D' : n.role === 'F' ? 'F' : null; n.num = n.num == null ? null : String(n.num).replace(/\D/g, '').slice(0, 2) || null; n.trust = Math.max(0, Math.min(3, +n.trust || 0)); n.room = Math.max(0, Math.min(3, +n.room || 0));
      S = n; save(); return true; } catch (e) { return false; }
  }
  function saveCode(msg) {
    view = 'savecode';
    screen('ПРОГРЕСС', '<span class="tag">ПЕРЕНОС ПРОГРЕССА</span><p class="lead">Скопируй код и вставь его на другом телефоне. Код никуда не отправляется.</p><textarea class="log" id="logbox" readonly style="height:120px">' + esc(codeOf()) + '</textarea><p class="note" id="logmsg">' + (msg || 'В коде твои матчи, звёзды и выбор. Имени и других данных в нём нет.') + '</p>' +
      '<h2 class="h2">ВОССТАНОВИТЬ ИЗ КОДА</h2><textarea class="log" data-inp="code" style="height:120px" placeholder="Вставь код сюда" aria-label="Код прогресса"></textarea><p class="note">Текущий прогресс на этом телефоне заменится.</p>',
      '<button class="btn" type="button" data-act="copylog">СКОПИРОВАТЬ КОД</button><button class="btn btn--ghost" type="button" data-act="loadcode">ВОССТАНОВИТЬ</button><button class="btn btn--ghost" type="button" data-act="settings">НАЗАД</button>');
  }
  function parentGate(bad) {
    view = 'parent'; if (!pick.pa) pick.pa = [12 + Math.floor(Math.random() * 8), 3 + Math.floor(Math.random() * 7)]; pick.pans = null;
    screen('ДЛЯ РОДИТЕЛЕЙ', '<span class="tag tag--mute">ТОЛЬКО ДЛЯ ВЗРОСЛЫХ</span><h1 class="h1">РАЗДЕЛ ДЛЯ РОДИТЕЛЕЙ</h1><p class="lead">Чтобы войти, решите пример.</p><div class="final">' + pick.pa[0] + ' × ' + pick.pa[1] + '</div>' +
      '<input class="inp" data-inp="pans" inputmode="numeric" maxlength="4" placeholder="Ответ" aria-label="Ответ">' + (bad ? '<p class="note">Неверно. Попробуйте ещё раз.</p>' : ''),
      '<button class="btn" type="button" data-act="parentgo">ВОЙТИ</button><button class="btn btn--ghost" type="button" data-act="settings">НАЗАД</button>');
  }
  function parentInfo() {
    view = 'parent'; pick.pa = null;
    screen('ДЛЯ РОДИТЕЛЕЙ', '<span class="tag tag--red">ЧЕРНОВИК ТЕКСТА</span><h1 class="h1">ОТКУДА ЭТА ИГРА</h1>' +
      '<p class="lead">Игра выросла из индивидуальной программы ментальной подготовки спортсменов «Грани Чемпионов».</p>' +
      '<section class="panel"><h2 class="h2">ЧТО ПРОБУЕТ РЕБЁНОК</h2><p>Выдох перед действием, короткий сброс после ошибки, своё слово для фокуса. В игре это приёмы на льду. В программе с ними работают лично, под конкретного спортсмена.</p></section>' +
      '<section class="panel"><h2 class="h2">ДАННЫЕ</h2><p>Игра ничего не собирает и никуда не отправляет. Всё, что ребёнок выбирает и пишет, остаётся на этом телефоне.</p></section>' +
      '<section class="panel"><h2 class="h2">О ПРОГРАММЕ</h2><p>Узнать о программе можно на её сайте: edgechamps.com. Игра сама на сайт не переходит. Условия обсуждаются лично.</p></section>',
      '<button class="btn" type="button" data-act="settings">НАЗАД</button>');
  }

  /* ---------- матчи 5-7: черновик. Названия команд вымышленные и не проверены ---------- */
  var PROVOK = { gain: 0.3, shotGain: 0, cool: 0.06, speed: 1 }, HOT = { gain: 0.6, shotGain: 0, cool: 0.035, speed: 1 };
  function preSet(id, o) { S.pre = S.pre || {}; S.pre[id] = o; }
  MATCHES.push({ id: 5, name: 'ЧУЖИЕ ТРИБУНЫ', team: 'Прибой', rival: 'Провокатор',
    about: 'Выезд. Трибуны гудят, и линия броска начинает дрожать. Новый приём: твоё слово. Короткий тап левым пальцем, и шум уходит на несколько секунд.',
    g: PROVOK, riv: [[20], [12, 28], [10, 24]], defs: [2, 2, 2], chase: [30, 36, 40], noise: [1, 1, 1], tune: { topR: 16, rateK: 1.0, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.4, chaseM: null },
    star3: 'Трижды убрал шум своим словом', s3: function (r) { return r.trig >= 3; },
    life: { h: 'ТРИГГЕР ФОКУСА', t: 'Десять раз за тренировку скажи себе своё слово в тот момент, когда внимание ушло. Слово то же, что в игре.' },
    pre: function (done) { decide(5, 'phone', 'Вечер перед выездом. В телефоне пишут про завтрашний матч и про тебя.', [
      { label: 'ЧИТАЮ, ЧТО ПИШУТ', dots: [['Голова', 2]], vals: ['Любопытство', 'Смелость'], apply: function () { preSet(5, { heat: 0.3 }); return ['Завтра выйдешь с тёплой головой: чужие слова останутся с тобой']; } },
      { label: 'ТЕЛЕФОН В ДРУГУЮ КОМНАТУ', dots: [['Голова', 2]], vals: ['Дисциплина', 'Спокойствие', 'Ответственность'], apply: function () { preSet(5, { heat: 0 }); return ['Завтра выйдешь с холодной головой']; } }], done, 'МАТЧ 5 · НАКАНУНЕ'); } });
  MATCHES.push({ id: 6, name: 'НОЧЬ ПЕРЕД ИГРОЙ', team: 'Ледокол', rival: 'Стена',
    about: 'Как герой провёл вечер, так он и начнёт матч. Вратарь почти не греется: его берут терпением.',
    g: { gain: 0.1, shotGain: 0, cool: 0.16, speed: 1.05 }, riv: [[14, 30], [12, 26], [10, 22, 32]], defs: [2, 2, 2], chase: [36, 40, 44], tune: { topR: 15, rateK: 0.62, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.3, chaseM: null },
    star3: 'Ни одного броска с горячей головой', s3: function (r) { return r.shots > 0 && r.hotShots === 0; },
    life: { h: 'ОДНА МИКРОПРИВЫЧКА', t: 'Выбери одну маленькую привычку на неделю и привяжи её к тому, что уже делаешь каждый день. Одну, а не три.' },
    pre: function (done) { decide(6, 'evening', 'Вечер перед игрой. Завтра сильный соперник.', [
      { label: 'ЛОЖУСЬ ВОВРЕМЯ', dots: [['Голова', 2]], vals: ['Дисциплина', 'Ответственность', 'Трудолюбие'], apply: function () { preSet(6, { heat: 0, breathK: 0.95 }); S.form = Math.min(3, (S.form == null ? 1 : S.form) + 1); return ['Холодный старт', 'Форма +1: выдох быстрее']; } },
      { label: 'ДОИГРЫВАЮ В ПРИСТАВКУ ДО НОЧИ', dots: [['Голова', 2]], vals: ['Радость игры'], apply: function () { preSet(6, { heat: 0.35, breathK: 1.1 }); S.form = Math.max(0, (S.form == null ? 1 : S.form) - 1); return ['Тёплый старт', 'Форма −1: герой не выспался, выдох длиннее']; } },
      { label: 'ДО ПОЛУНОЧИ РАЗБИРАЮ СВОИ ОШИБКИ', dots: [['Голова', 1], ['Доверие', 1]], vals: ['Упорство', 'Честность'], apply: function () { preSet(6, { heat: 0.2, breathK: 1.1 }); S.trust = Math.min(3, S.trust + 1); return ['Доверие +1: утром тренер увидел твои вопросы', 'Но голова тёплая и выдох длиннее']; } }], done, 'МАТЧ 6 · НАКАНУНЕ'); } });
  MATCHES.push({ id: 7, name: 'ДЕРБИ', team: 'Южный Порт', rival: 'Провокатор и Горячий',
    about: 'Главный матч месяца. Три отрезка, три разных условия, и никто не подсказывает. В воротах по очереди Провокатор и Горячий.',
    g: PROVOK, segG: [PROVOK, HOT, HOT], noise: [1, 0, 1], noHints: true, riv: [[12, 28], [10, 24], [8, 20, 30]], defs: [2, 2, 2], chase: [37, 41, 45], tune: { topR: 16, rateK: 0.66, push: 0.22, goalPush: 0.05, gsp: 1.05, segT: 35, paceK: 1.3, chaseM: null },
    star3: 'В каждом отрезке первый бросок был с выдохом', s3: function (r) { return r.firstAll; },
    dec: { 1: { key: 'partner', q: 'Партнёр ошибся, и вам забили. Он садится рядом и молчит.', opts: function () { return [
      { label: '«ЗАБУДЬ. СЛЕДУЮЩАЯ СМЕНА НАША»', dots: [['Раздевалка', 2]], vals: ['Верность команде', 'Уважение', 'Спокойствие', 'Смирение'], apply: function () { S.room = Math.min(3, S.room + 1); G.fast = true; return ['Раздевалка +1', 'Партнёр ожил: пас идёт быстрее']; } },
      { label: '«СОБЕРИСЬ УЖЕ»', dots: [['Раздевалка', 1]], vals: ['Честность', 'Смелость'], apply: function () { S.room = Math.max(0, S.room - 1); return ['Раздевалка −1: он услышал упрёк', 'Пас идёт как раньше']; } }]; } } } });

  /* ---------- матчи 8-12: черновик, сюжетный конец пути «Талант» ---------- */
  var WALL = { gain: 0.1, shotGain: 0, cool: 0.16, speed: 1.05 }, CLOCK1 = { gain: 0.2, shotGain: 0, cool: 0.1, speed: 1 }, CLOCK3 = { gain: 0.15, shotGain: 0, cool: 0.12, speed: 1.3 }, MIRROR = { gain: 0.25, shotGain: 0, cool: 0.08, speed: 1, mirror: true };
  MATCHES.push({ id: 8, name: 'В ЗОНЕ', team: 'Маяк', rival: 'Стена', flow: true,
    about: 'Новое: поток. Три идеальных гола подряд, и на восемь секунд выдох и пас становятся быстрее. Любой промах или гол соперника его обрывает.',
    g: WALL, riv: [[14, 30], [12, 26], [10, 22, 32]], defs: [2, 2, 2], chase: [36, 40, 44], tune: { topR: 15, rateK: 0.62, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.3, chaseM: null },
    star3: 'Вошёл в поток', s3: function (r) { return r.flows >= 1; },
    life: { h: 'ТВОЙ ЛУЧШИЙ МАТЧ', t: 'Вспомни свой лучший матч и что ты делал за час до него. Три вещи. Это начало твоего ритуала.' },
    pre: function (done) { function opt(label, vals) { return { label: label, dots: [['Голова', 1]], vals: vals, apply: function () { preSet(8, { heat: 0, breathK: 0.95 }); S.ritual = label; return ['Это теперь твой ритуал перед игрой', 'Холодный старт']; } }; }
      decide(8, 'ritual', 'Что ты делаешь перед игрой, когда всё получается? Собери свой ритуал.', [opt('ОДНА И ТА ЖЕ РАЗМИНКА', ['Дисциплина', 'Трудолюбие']), opt('НАУШНИКИ И ТИШИНА', ['Спокойствие', 'Радость игры']), opt('ТРИ МЕДЛЕННЫХ ВЫДОХА У БОРТА', ['Смирение', 'Упорство'])], done, 'МАТЧ 8 · ПЕРЕД ИГРОЙ'); } });
  MATCHES.push({ id: 9, name: 'ПОСЛЕДНЯЯ МИНУТА', team: 'Полюс', rival: 'Часы', flow: true, oneT: true,
    about: 'Новое: бросок в касание. Оттяни палец заранее и отпусти сразу, как принял пас: вратарь не успеет встать. Работает только с холодной головой. Вратарь ровный весь матч и прибавляет в концовке.',
    g: CLOCK1, segG: [CLOCK1, CLOCK1, CLOCK3], riv: [[14, 30], [12, 26], [8, 18, 28]], defs: [2, 2, 2], chase: [36, 40, 44], tune: { topR: 16, rateK: 0.62, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.3, chaseM: null },
    star3: 'Забил в касание', s3: function (r) { return r.oneGoals >= 1; },
    dec: { 2: { key: 'ask', q: 'Счёт на табло, осталась концовка. Тренер смотрит на скамейку.', opts: function () { return [
      { label: 'ПРОШУСЬ НА ЛЁД', dots: [['Давление', 2]], vals: ['Смелость', 'Ответственность', 'Упорство'], apply: function () { G.press = Math.min(0.99, G.press + 0.3); return ['Ты на льду с первой секунды концовки', 'Соперник это видит: его давление выше']; } },
      { label: 'ЖДУ РЕШЕНИЯ ТРЕНЕРА', dots: [['Голова', 2]], vals: ['Смирение', 'Спокойствие', 'Уважение'], apply: function () { G.heat = Math.max(0, G.heat - 0.3); G.shortEnd = true; return ['Голова холоднее', 'Тренер выпустил тебя не сразу: концовка короче']; } }]; } } } });
  MATCHES.push({ id: 10, name: 'ПАРТНЁР ОШИБСЯ', team: 'Утёс', rival: 'Зеркало', flow: true, oneT: true, mateHead: true,
    about: 'Над партнёром теперь видна его голова. Когда она горячая, его пас идёт дольше и может не дойти. Остужают её твой гол и твоё слово на скамейке. Вратарь идёт за твоим прицелом: смени прицел перед броском.',
    g: MIRROR, riv: [[12, 28], [10, 24], [8, 20, 30]], defs: [2, 2, 2], chase: [33, 37, 41], tune: { topR: 16, rateK: 0.57, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.25, chaseM: null },
    star3: 'Партнёр кипел меньше десяти секунд', s3: function (r) { return r.mateHot < 10; },
    life: { h: 'ЧЕСТНОЕ СЛОВО', t: 'Скажи одному партнёру одно честное и заботливое слово после его ошибки. Не совет, а поддержку.' },
    dec: { 1: { key: 'mate', q: 'Партнёр отдал шайбу сопернику, и вам забили. Он бьёт клюшкой о борт.', opts: function () { return [
      { label: '«ДЫШИ. РАЗБЕРЁМ ПОСЛЕ ИГРЫ»', dots: [['Раздевалка', 2]], vals: ['Спокойствие', 'Верность команде', 'Уважение', 'Смирение'], apply: function () { G.mheat = Math.max(0, G.mheat - 0.5); S.room = Math.min(3, S.room + 1); return ['Голова партнёра остыла', 'Раздевалка +1']; } },
      { label: '«ПРОСТО ОТДАВАЙ МНЕ»', dots: [['Раздевалка', 1]], vals: ['Смелость', 'Упорство'], apply: function () { G.mheat = Math.min(1, G.mheat + 0.25); S.room = Math.max(0, S.room - 1); return ['Партнёр закипел сильнее: его пас станет хуже', 'Раздевалка −1']; } }]; } } } });
  MATCHES.push({ id: 11, name: 'БЕЗ ПОДСКАЗОК', team: 'Туман', rival: 'Часы', flow: true, oneT: true, blind: true, noHints: true,
    about: 'Проверка всего, что ты собрал. Линия броска без цвета, пояснений к промахам нет. Голову придётся чувствовать самому.',
    g: CLOCK1, segG: [CLOCK1, CLOCK1, CLOCK3], riv: [[12, 28], [10, 24], [8, 20, 30]], defs: [2, 2, 2], chase: [36, 40, 44], tune: { topR: 16, rateK: 0.67, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.3, chaseM: null },
    star3: 'Починил выбранное слабое звено', s3: function (r) { var f = (S.pre && S.pre[11] && S.pre[11].focus) || 'cool'; return f === 'cool' ? r.cooledAll : f === 'hot' ? r.shots > 0 && r.hotShots === 0 : r.losses <= 2; },
    life: { h: 'ДВА СТОЛБЦА', t: 'Раздели лист пополам. Слева: что в твоей игре живёт само. Справа: что держится на силе воли. Выбери одно из правого столбца на эту неделю.' },
    pre: function (done) { function opt(label, f, vals, line) { return { label: label, dots: [['Голова', 1]], vals: vals, apply: function () { preSet(11, { focus: f }); MATCHES[10].star3 = line; return ['Третья звезда этого матча: ' + line.toLowerCase()]; } }; }
      decide(11, 'fix', 'Что в твоей игре чаще всего ломается? Выбери одно звено и чини его в этом матче.', [opt('ВЫДОХ ПОСЛЕ ПРОПУЩЕННОЙ', 'cool', ['Спокойствие', 'Дисциплина'], 'Остудил голову после каждой пропущенной'), opt('БРОСКИ В СПЕШКЕ', 'hot', ['Упорство', 'Смирение'], 'Ни одного броска с горячей головой'), opt('ПОТЕРИ ШАЙБЫ', 'loss', ['Ответственность', 'Трудолюбие'], 'Не больше двух потерь за матч')], done, 'МАТЧ 11 · ПЕРЕД ИГРОЙ'); } });
  MATCHES.push({ id: 12, name: 'ПРОСМОТР', team: 'Северная Звезда', rival: 'Главный соперник', flow: true, oneT: true, mateHead: true, pathEnd: true,
    about: 'Плей-офф, последний матч пути. На трибуне скауты. В воротах тот, кого ты ещё не обыгрывал. Всё, что собрано, пригодится.',
    g: MIRROR, pickG: function () { var r = S.res || {}; return r[10] === 0 ? { g: MIRROR, name: 'Зеркало', why: 'Ему ты проиграл в матче 10.' } : r[9] === 0 || r[11] === 0 ? { g: CLOCK3, name: 'Часы', why: 'Его ты ещё не обыгрывал.' } : r[8] === 0 || r[6] === 0 ? { g: WALL, name: 'Стена', why: 'Её ты ещё не пробил.' } : { g: MIRROR, name: 'Зеркало', why: 'Ты обыграл всех, поэтому в воротах самый трудный.' }; },
    noise: [1, 0, 1], riv: [[12, 28], [10, 24], [8, 20, 30]], defs: [2, 2, 2], chase: [34, 38, 42], tune: { topR: 17, rateK: 0.58, push: 0.22, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.22, chaseM: null },
    star3: 'Показал скаутам поток или гол в касание', s3: function (r) { return r.flows >= 1 || r.oneGoals >= 1; } });
  /* ---------- обычные матчи первого пути: соперник + ситуация + условие. Играются по выбору, сюжет не держат ---------- */
  function pool(id, name, team, rival, about, g, o) { var m = { id: id, pool: true, name: name, team: team, rival: rival, about: about, g: g, flow: true, oneT: true, riv: [[14, 30], [12, 26], [10, 24]], defs: [2, 2, 2], chase: [34, 38, 42],
    tune: { topR: 16, rateK: 0.6, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.25, chaseM: null }, star3: o.star3, s3: o.s3 }; for (var k in o) if (k !== 'tune') m[k] = o[k]; if (o.tune) for (k in o.tune) m.tune[k] = o.tune[k]; MATCHES.push(m); }
  pool(13, 'ЛИШНИЙ ИГРОК', 'Кометы', 'Горячий', 'Весь матч в большинстве: у соперника на одного меньше, пас идёт быстрее, никто не идёт на тебя. Время забивать.', HOT,
    { sit: ['pp', 'pp', 'pp'], star3: 'Шесть голов с выдохом', s3: function (r) { return r.breathGoals >= 6; }, tune: { rateK: 1.1, paceK: 1.9, segT: 28 } });
  pool(14, 'ВЧЕТВЕРОМ', 'Ледокол', 'Стена', 'Весь матч в меньшинстве: шайба приходит редко, соперник давит. Каждая потеря стоит дорого.', WALL,
    { sit: ['pk', 'pk', 'pk'], star3: 'Не больше двух потерь', s3: function (r) { return r.losses <= 2; }, tune: { rateK: 0.42 } });
  pool(15, 'ВТОРОЙ ДЕНЬ', 'Прибой', 'Провокатор', 'Второй матч за два дня, и снова на выезде. Герой устал: выдох длиннее. Трибуны гудят.', PROVOK,
    { tired: true, noise: [1, 1, 1], star3: 'Половина голов с выдохом', s3: function (r) { return r.goals > 0 && r.breathGoals * 2 >= r.goals; } });
  pool(16, 'НА СЛЕДУЮЩИЙ ДЕНЬ', 'Полюс', 'Часы', 'Матч на следующий день после поражения. Голова тёплая с первой секунды: вчерашняя игра ещё с тобой.', CLOCK1,
    { segG: [CLOCK1, CLOCK1, CLOCK3], startHeat: 0.45, star3: 'Первый бросок матча был с выдохом', s3: function (r) { return r.firstShotBreath; }, tune: { rateK: 0.7 } });
  pool(17, 'ШЕСТОЙ ПОЛЕВОЙ', 'Вьюга', 'Горячий', 'Если ведёшь перед концовкой, соперник снимает вратаря: ворота пустые, но его давление растёт в полтора раза. Потеря равна голу.', HOT,
    { emptyNet: true, star3: 'Ни одной потери в концовке', s3: function (r) { return r.lossesEnd === 0; }, tune: { rateK: 0.7 } });
  pool(18, 'ЧУЖОЙ ЛЁД', 'Утёс', 'Зеркало', 'Выезд к вратарю, который идёт за твоим прицелом. Трибуны гудят в первом и последнем отрезке.', MIRROR,
    { noise: [1, 0, 1], chase: [32, 36, 40], star3: 'Трижды убрал шум своим словом', s3: function (r) { return r.trig >= 3; } });
  pool(19, 'ШТРАФНОЙ ДЕНЬ', 'Кедры', 'Стена', 'Отрезок в большинстве, отрезок в меньшинстве, отрезок на равных. Каждый раз другая игра.', WALL,
    { sit: ['pp', 'pk', ''], chase: [38, 42, 46], star3: 'Остудил голову после каждой пропущенной', s3: function (r) { return r.cooledAll; }, tune: { rateK: 0.85, paceK: 1.4 } });
  pool(20, 'ТРЕНИРОВКА: РЕКОРД', 'Свои', 'Новичок', 'Тренировка без соперника и без защитников. Сколько идеальных бросков ты сделаешь за минуту? Рекорд сохраняется.', { gain: 0.34, shotGain: 0.14, cool: 0.07, speed: 0.8 },
    { record: true, riv: [[], [], []], defs: [0, 0, 0], chase: [0, 0, 0], star3: 'Восемь идеальных бросков', s3: function (r) { return r.tops >= 8; }, tune: { segT: 20, paceK: 1, rateK: 0 } });
  pool(21, 'СЕРИЯ ДО ДВУХ ПОБЕД', 'Айсберг', 'Стена', 'Серия с одним соперником до двух побед. Между играми силы не восстанавливаются: с каждой игрой выдох длиннее. Матч засчитан, когда серия решена.', WALL,
    { series: 2, star3: 'Остудил голову после каждой пропущенной', s3: function (r) { return r.cooledAll; } });
  // итог пути: карьера идёт дальше при любом исходе, меняется только куда
  function pathEnd() {
    var st = 0, w = 0, k; for (k in S.stars) st += S.stars[k]; for (k in (S.res || {})) w += S.res[k];
    var sc = (S.rep || 0) * 2 + (S.trust || 0) + ((S.res || {})[12] ? 2 : 0) + st / 8;
    var o = sc >= 9 ? ['ДРАФТ: ТЕБЯ ВЫБРАЛИ РАНО', 'Клуб, который давно следил за тобой, называет твоё имя одним из первых. Впереди взрослая лига и совсем другой лёд.']
      : sc >= 6 ? ['КОНТРАКТ', 'Тебя не выбрали в первых рядах, но клуб предлагает контракт. Место в составе придётся забирать самому.']
      : sc >= 3 ? ['ПРИГЛАШЕНИЕ НА ПРОСМОТР', 'Скауты записали твой номер. Летом ты едешь в лагерь, где за место спорят сорок человек.']
      : ['ЕЩЁ СЕЗОН ЗДЕСЬ', 'Этой весной телефон молчит. Тренер говорит: тебя запомнили, приходи сильнее. Карьера продолжается.'];
    S.path1 = { o: o[0], sc: Math.round(sc) }; save(); log(12, 'path_end', { sc: Math.round(sc) }); view = 'world';
    screen('ИТОГ ПУТИ', '<span class="tag">ПУТЬ 1 · ТАЛАНТ · ИТОГ</span><h1 class="h1">' + o[0] + '</h1><p class="lead">' + o[1] + '</p>' +
      '<section class="panel"><div class="stats"><span>Побед</span><b>' + w + ' из 12</b><span>Звёзд за голову</span><b>' + st + ' из 36</b></div></section>' +
      '<section class="panel"><h2 class="h2">ЧТО РЕШИЛО</h2><div class="meters"><span>РЕПУТАЦИЯ</span>' + pips(S.rep || 0) + '<span>ДОВЕРИЕ</span>' + pips(S.trust || 0) + '</div><p>И то, как ты сыграл просмотр. Счёт матчей на исход почти не влиял: скауты смотрели на голову.</p></section>',
      '<button class="btn" type="button" data-act="home">ДАЛЬШЕ ▶</button>');
  }
  /* ---------- путь 2 «Герой»: черновик. Собраны только матчи, которые делаются из готового; остальные шесть на бумаге ---------- */
  var VET = { gain: 0.12, shotGain: 0, cool: 0.14, speed: 1.15 }, VET3 = { gain: 0.3, shotGain: 0, cool: 0.06, speed: 0.85 }, LEGEND = { gain: 0.1, shotGain: 0, cool: 0.16, speed: 1.2, mirror: true };
  function story2(o) { var m = { flow: true, oneT: true, riv: [[12, 28], [10, 24], [8, 20, 30]], defs: [2, 2, 2], chase: [36, 40, 44], tune: { topR: 16, rateK: 0.62, push: 0.2, goalPush: 0.05, gsp: 1, segT: 35, paceK: 1.3, chaseM: null } }; for (var k in o) if (k !== 'tune') m[k] = o[k]; if (o.tune) for (k in o.tune) m.tune[k] = o.tune[k]; MATCHES.push(m); }
  function d3(id, key, q, opts, done, tag) { decide(id, key, q, opts.map(function (o) { return { label: o[0], dots: o[1], vals: o[2], apply: o[3] }; }), done, tag); }
  story2({ id: 22, name: 'ДЕБЮТ', team: 'Гавань', myTeam: 'Перевал', rival: 'Ветеран', g: VET, segG: [VET, VET, VET3],
    about: 'Первый матч во взрослой лиге. В воротах Ветеран: холодный и быстрый, но к третьему отрезку устаёт. Терпение в начале, броски в конце.',
    star3: 'Половина голов в третьем отрезке', s3: function (r) { return r.goals > 0 && r.goalsEnd * 2 >= r.goals; },
    pre: function (done) { d3(22, 'routine', 'Взрослая раздевалка. До выхода двадцать минут. Что ты делаешь?', [
      ['СВОЙ РИТУАЛ, КАК ВСЕГДА', [['Голова', 2]], ['Дисциплина', 'Спокойствие', 'Трудолюбие'], function () { preSet(22, { heat: 0, breathK: 0.95 }); return ['Холодный старт: ритуал работает и здесь']; }],
      ['СМОТРЮ, ЧТО ДЕЛАЮТ ВЕТЕРАНЫ', [['Раздевалка', 1], ['Голова', 1]], ['Любопытство', 'Уважение', 'Смирение'], function () { preSet(22, { heat: 0.2 }); S.room = Math.min(3, S.room + 1); return ['Раздевалка +1: тебя заметили', 'Но свой ритуал ты пропустил: голова тёплая']; }],
      ['СИЖУ В ТЕЛЕФОНЕ, ЧТОБЫ НЕ НЕРВНИЧАТЬ', [['Голова', 2]], ['Радость игры'], function () { preSet(22, { heat: 0.35 }); return ['Тёплый старт: волнение никуда не делось']; }]], done, 'МАТЧ 22 · ПЕРЕД ИГРОЙ'); } });
  story2({ id: 23, name: 'БУЛЛИТ', team: 'Гранит', myTeam: 'Перевал', rival: 'Часы', g: CLOCK3, onlySO: true, soSeq: [1, 1, 0], defs: [0, 0, 0], chase: [0, 0, 0], tune: { gsp: 1.25 },
    about: 'Матч решается в серии буллитов. Один на один, шесть секунд на бросок. Здесь нет ничего, кроме тебя, вратаря и твоей головы.',
    star3: 'Забил два буллита', s3: function (r) { return r.goals >= 2; },
    pre: function (done) { d3(23, 'look', 'Ты едешь к центру. На что смотришь?', [
      ['НА ТОЧКУ НА ЛЬДУ, КАК В СБРОСЕ', [['Голова', 2]], ['Спокойствие', 'Дисциплина', 'Смирение'], function () { preSet(23, { heat: 0 }); return ['Холодная голова: ты здесь, а не на табло']; }],
      ['НА ВРАТАРЯ', [['Голова', 1]], ['Смелость', 'Любопытство'], function () { preSet(23, { heat: 0.2 }); return ['Голова чуть теплее: он тоже смотрит на тебя']; }],
      ['НА ТАБЛО И ТРИБУНЫ', [['Голова', 2]], ['Радость игры'], function () { preSet(23, { heat: 0.4 }); return ['Тёплая голова: ты уже думаешь о результате']; }]], done, 'МАТЧ 23 · ПЕРЕД БРОСКОМ'); } });
  story2({ id: 24, name: 'ОБМЕН', team: 'Перевал', myTeam: 'Гранит', rival: 'Горячий', g: HOT, tune: { paceK: 1.55 },
    about: 'Тебя обменяли. Новая команда, раздевалка с нуля, пасов пока мало. А напротив твой бывший клуб.',
    star3: 'Не больше двух потерь', s3: function (r) { return r.losses <= 2; },
    pre: function (done) { d3(24, 'trade', 'Утром тебе сообщили об обмене. Вечером первый вопрос от журналиста.', [
      ['«СПАСИБО КЛУБУ И ПАРТНЁРАМ»', [['Репутация', 2]], ['Уважение', 'Смирение', 'Верность команде'], function () { preSet(24, { heat: 0.15 }); S.room = 0; S.rep = Math.min(3, (S.rep || 0) + 1); return ['Репутация +1', 'Раздевалка с нуля: в новой команде тебя ещё не знают']; }],
      ['«БЕЗ КОММЕНТАРИЕВ»', [['Голова', 1]], ['Спокойствие', 'Дисциплина'], function () { preSet(24, { heat: 0.25 }); S.room = 0; return ['Раздевалка с нуля', 'Голова тёплая: ты это не прожил, а отложил']; }],
      ['«ОНИ ЕЩЁ ПОЖАЛЕЮТ»', [['Репутация', 1], ['Голова', 2]], ['Смелость', 'Честность'], function () { preSet(24, { heat: 0.45 }); S.room = 0; S.rep = Math.max(0, (S.rep || 0) - 1); return ['Репутация −1', 'Раздевалка с нуля', 'Голова горячая: ты вышел доказывать, а не играть']; }]], done, 'МАТЧ 24 · НАКАНУНЕ'); } });
  story2({ id: 25, name: 'МИКРОФОН', team: 'Маяк', myTeam: 'Гранит', rival: 'Стена', g: WALL, startHeat: 0.3,
    about: 'Вчера вас разгромили. Сегодня снова матч, а перед ним пресс-конференция. У каждого ответа своя цена.',
    star3: 'Остудил голову после каждой пропущенной', s3: function (r) { return r.cooledAll; },
    pre: function (done) { d3(25, 'press', 'Журналист: «Что вчера случилось?»', [
      ['«Я СЫГРАЛ ПЛОХО. ИСПРАВЛЮ»', [['Доверие', 2], ['Голова', 1]], ['Честность', 'Ответственность', 'Смелость'], function () { preSet(25, { heat: 0.2 }); S.trust = Math.min(3, S.trust + 1); return ['Доверие +1: тренер услышал', 'Голова тёплая: ты взял на себя много']; }],
      ['«КОМАНДА НЕ БЫЛА ГОТОВА»', [['Раздевалка', 2]], ['Честность'], function () { preSet(25, { heat: 0 }); S.room = Math.max(0, S.room - 1); return ['Раздевалка −1: партнёры это прочитают', 'Тебе самому легче: голова холодная']; }],
      ['«ЗАВТРА НОВЫЙ МАТЧ»', [['Голова', 1]], ['Спокойствие', 'Смирение', 'Дисциплина'], function () { preSet(25, { heat: 0.1 }); return ['Ничего не изменилось: ты ничего не сказал', 'Голова почти холодная']; }]], done, 'МАТЧ 25 · ПРЕСС-КОНФЕРЕНЦИЯ'); } });
  story2({ id: 26, name: 'СЕРИЯ 1:3', team: 'Айсберг', myTeam: 'Гранит', rival: 'Зеркало', g: MIRROR, series: 4, seriesStart: [1, 3], mateHead: true, chase: [33, 37, 41], tune: { rateK: 0.55 },
    about: 'Плей-офф. Серия до четырёх побед, и вы проигрываете 1:3. Любое поражение заканчивает сезон. Силы от игры к игре не возвращаются.',
    star3: 'Партнёр кипел меньше десяти секунд', s3: function (r) { return r.mateHot < 10; },
    pre: function (done) { d3(26, 'speech', 'Раздевалка перед пятой игрой. Все молчат. Кто-то должен сказать.', [
      ['«ОДНА СМЕНА. ПОТОМ СЛЕДУЮЩАЯ»', [['Раздевалка', 2]], ['Спокойствие', 'Дисциплина', 'Верность команде'], function () { preSet(26, { heat: 0 }); S.room = Math.min(3, S.room + 1); return ['Раздевалка +1: стало тише и собраннее']; }],
      ['«НАМ НЕЧЕГО ТЕРЯТЬ»', [['Голова', 1]], ['Смелость', 'Радость игры'], function () { preSet(26, { heat: 0.15 }); return ['Команда оживилась', 'Голова чуть теплее: азарт тоже греет']; }],
      ['МОЛЧУ: Я НЕ КАПИТАН', [['Раздевалка', 1]], ['Смирение'], function () { preSet(26, { heat: 0.1 }); S.room = Math.max(0, S.room - 1); return ['Раздевалка −1: слова ждали от тебя']; }]], done, 'МАТЧ 26 · РАЗДЕВАЛКА'); } });
  story2({ id: 27, name: 'СЕДЬМОЙ МАТЧ', team: 'Северная Звезда', myTeam: 'Гранит', rival: 'Легенда', g: LEGEND, noise: [1, 0, 1], mateHead: true, pathEnd: 2, chase: [34, 38, 42], tune: { topR: 17, rateK: 0.56, paceK: 1.22 },
    about: 'Седьмой матч финала. В воротах Легенда: читает прицел, быстрый, почти не греется. Всё, что собрано за два пути, пригодится.',
    star3: 'Вошёл в поток или забил в касание', s3: function (r) { return r.flows >= 1 || r.oneGoals >= 1; } });
  // обычные матчи второго пути: те же ситуации, новые вратари. Открываются после дебюта
  function pool2(id, name, team, rival, about, g, o) { pool(id, name, team, rival, about, g, o); var m = MATCHES[MATCHES.length - 1]; m.pool2 = true; m.myTeam = 'Гранит'; }
  pool2(28, 'БОЛЬШИНСТВО ПРОТИВ ВЕТЕРАНА', 'Гавань', 'Ветеран', 'Весь матч в большинстве против вратаря, который устаёт к третьему отрезку. Не спеши в начале.', VET,
    { segG: [VET, VET, VET3], sit: ['pp', 'pp', 'pp'], star3: 'Половина голов в третьем отрезке', s3: function (r) { return r.goals > 0 && r.goalsEnd * 2 >= r.goals; }, tune: { rateK: 1.1, paceK: 1.9, segT: 28 } });
  pool2(29, 'ВЧЕТВЕРОМ ПРОТИВ ЛЕГЕНДЫ', 'Северная Звезда', 'Легенда', 'Меньшинство против лучшего вратаря лиги. Шайба приходит редко, каждая на вес золота.', LEGEND,
    { sit: ['pk', 'pk', 'pk'], chase: [29, 33, 37], star3: 'Не больше двух потерь', s3: function (r) { return r.losses <= 2; }, tune: { rateK: 0.3 } });
  pool2(30, 'ПУСТЫЕ ВОРОТА ВЕТЕРАНА', 'Маяк', 'Ветеран', 'Если ведёшь перед концовкой, соперник снимает вратаря. Ворота пустые, давление в полтора раза выше.', VET,
    { segG: [VET, VET, VET3], emptyNet: true, star3: 'Ни одной потери в концовке', s3: function (r) { return r.lossesEnd === 0; }, tune: { rateK: 0.7 } });
  pool2(31, 'СЕРИЯ ДО ТРЁХ ПОБЕД', 'Айсберг', 'Стена', 'Серия до трёх побед. Силы от игры к игре не возвращаются: распредели голову на всю серию.', WALL,
    { series: 3, star3: 'Остудил голову после каждой пропущенной', s3: function (r) { return r.cooledAll; } });
  function pathEnd2() {
    var won = (S.res || {})[27] === 1; S.path2 = { cup: won }; save(); log(27, 'path_end', { sc: won ? 1 : 0 }); view = 'world';
    screen('ИТОГ ПУТИ', '<span class="tag">ПУТЬ 2 · ГЕРОЙ · ИТОГ</span><h1 class="h1">' + (won ? 'КУБОК' : 'ФИНАЛ БЕЗ КУБКА') + '</h1><p class="lead">' + (won ? 'Ты поднимаешь кубок над головой. Завтра будет новое утро и новый вопрос: что дальше.' : 'Вы были в одном матче от кубка. Это остаётся с тобой, как и всё, чему ты научился по дороге.') + '</p>' +
      '<section class="panel"><p>Карьера идёт дальше в обоих случаях. Третий путь, «Легенда», пока не собран.</p></section>', '<button class="btn" type="button" data-act="home">ДАЛЬШЕ ▶</button>');
  }
  window.__seasonMatches = MATCHES;

  /* ---------- боты-тестировщики: матч считается без экрана и без ожидания ---------- */
  function simAim(g, away) { var s = stick(), gc = g.gx + GW / 2, tx = away ? (gc < 160 ? 198 : 122) : 160; return Math.atan2(tx - s[0], s[1] - GOAL_Y); }
  function simWait(g, dt) { var m = SIM.m; if (g.puck.s !== 'ready') { m.r = null; return true; } if (m.r == null) { m.r = 0.5 + Math.random() * 0.7; m.e = (Math.random() - 0.5) * 0.07; } m.r -= dt; return m.r > 0; }
  function simHold(a) { a += SIM.m.e || 0; if (!PR) PR = { id: -1, ox: 240, oy: 380, x: 240, y: 380, mv: 0, sp: 0, t0: 0 }; PR.x = PR.ox - Math.sin(a) * 50; PR.y = PR.oy + Math.cos(a) * 50; PR.mv = 0; }
  function simFire(slap) { shoot(slap); PR = null; }
  function simGo(g, x, y) { var dx = x - g.px, dy = y - g.py, d = Math.hypot(dx, dy); SIM.man = true; if (d < 6) { SIM.ix = 0; SIM.iy = 0; return true; } SIM.ix = dx / d; SIM.iy = dy / d; return false; }
  var BOTS = {
    // новичок: катается и бросает наугад
    novice: function (g, dt) { var m = SIM.m; m.t = (m.t || 0) - dt; if (m.t <= 0) { m.t = 0.6 + Math.random(); var a = Math.random() * 6.28; SIM.man = Math.random() < 0.6; SIM.ix = Math.cos(a); SIM.iy = Math.sin(a); }
      if (g.puck.s !== 'ready') { m.w = null; return; } if (m.w == null) { m.w = 0.3 + Math.random() * 2; m.h = Math.random() * 0.8; m.a = simAim(g, false) + (Math.random() - 0.5) * 0.5; m.sl = Math.random() < 0.3; }
      m.w -= dt; if (m.w > 0) return; if (m.sl) return simFire(true); simHold(m.a); m.h -= dt; if (m.h <= 0) simFire(false); },
    // торопыга: только щелчки, сразу
    spammer: function (g, dt) { SIM.man = false; if (!simWait(g, dt)) simFire(true); },
    // засадник: встаёт в одну точку и бросает оттуда с половиной выдоха
    camper: function (g, dt) { if (g.noise > 0) useWord(); var at = simGo(g, SIM.cx || 160, SIM.cy || 250); if (simWait(g, dt)) return; if (!at && g.clock > 3) return; simHold(simAim(g, true)); if (g.breath >= 0.55) simFire(false); },
    // катала: всё время в движении, бросает на ходу
    skater: function (g, dt) { var m = SIM.m; m.a = (m.a || 0) + dt * 1.6; SIM.man = true; SIM.ix = Math.cos(m.a); SIM.iy = Math.sin(m.a) * 0.6; if (simWait(g, dt)) return; simHold(simAim(g, true)); if (g.breath >= 0.6 || g.clock < 2) simFire(false); },
    // отличник: стоит у синей линии, полный выдох перед каждым броском, стержень по делу
    ace: function (g, dt) { if (g.noise > 0) useWord(); simGo(g, 160, 320); if (g.core && g.heat >= 0.5) useCore(); if (simWait(g, dt)) return; simHold(simAim(g, true)); if (g.wasFull || g.clock < 1.5) simFire(false); },
    // паникёр: играет как отличник, но девять секунд после пропущенной только щёлкает
    panicker: function (g, dt) { var lg = g.rivGoals[g.rivGoals.length - 1], pan = lg && g.T - lg.at < 9; simGo(g, 160, 320); if (simWait(g, dt)) return; if (pan) return simFire(true); simHold(simAim(g, true)); if (g.wasFull || g.clock < 1.5) simFire(false); }
  };
  function simRun(id, bot, cfg) {
    var keepS = S, keepView = view, keepG = G, keepM = M; SIM = { ix: 0, iy: 0, man: false, m: {}, log: {}, result: null, cx: cfg && cfg.cx, cy: cfg && cfg.cy };
    S = blank(); S.sound = false; S.role = 'F'; S.num = '9'; S.values = ['Упорство', 'Ответственность', 'Радость игры']; S.core = id >= 2; S.taught = true; S.done = { 1: true }; S.fix = id === 4; S.pre = {}; S.reset = { g: 'x', w: 'Здесь' }; if (id > 4) { S.trust = 1; S.room = 1; S.form = 1; S.rep = 0; }
    if (cfg) for (var k in cfg) if (k in S) S[k] = cfg[k];
    var f = BOTS[bot], dt = 1 / 30, n = 0; startMatch(id);
    while (!SIM.result && G && n++ < 40000) {
      if (G.pause > 0 && G.afterPause && G.pause - dt <= 0) { var fn = G.afterPause; G.afterPause = null; G.pause = 0; G.pauseText = null; fn(); }
      else if (G.stop > 0) G.stop -= dt; else { if (G.pause <= 0) f(G, dt); update(dt); }
    }
    var r = SIM.result || { hung: true }; r.log = SIM.log; SIM = null; PL = PR = null; S = keepS; view = keepView; G = keepG; M = keepM; return r;
  }
  function simBatch(bot, id, n, cfg) {
    var a = { n: 0, you: 0, riv: 0, win: 0, ot: 0, stars: 0, hot: 0, loss: 0, hung: 0, shots: 0, narrow: 0 };
    for (var i = 0; i < n; i++) { var r = simRun(id, bot, cfg); if (r.hung) { a.hung++; continue; } a.n++; a.you += r.you; a.riv += r.riv; a.win += r.you > r.riv ? 1 : 0; a.ot += r.how ? 1 : 0; a.stars += r.stars; a.hot += r.hot; a.shots += r.shots; a.narrow += r.narrow;
      a.loss += (r.log['miss:steal'] || 0) + (r.log['miss:poke'] || 0) + (r.log['miss:icept'] || 0) + (r.log['miss:late'] || 0); }
    return a;
  }
  var KMAP = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', KeyA: 'l', KeyD: 'r', KeyW: 'u', KeyS: 'd' };
  window.addEventListener('keydown', function (e) { if (KMAP[e.code] && view === 'play') { KEYS[KMAP[e.code]] = true; e.preventDefault(); } });
  window.addEventListener('keyup', function (e) { if (KMAP[e.code]) KEYS[KMAP[e.code]] = false; });

