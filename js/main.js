(function () {
  'use strict';

  /* =====================================================================
     ДАННЫЕ
     ===================================================================== */

  // Три пути чемпиона. jersey/trim — цвета формы персонажа.
  var PATHS = [
    {
      id: 'young', num: 'МОЛОДОЙ ИГРОК', short: 'ПРОСПЕКТ', name: 'ПУТЬ ПРОСПЕКТА',
      who: 'Для молодых игроков',
      text: 'Ты в самом начале карьеры. Закладываем фундамент, на котором она будет строиться.',
      stage: 'Начало карьеры', goal: 'Заложить фундамент',
      about: 'Впереди вся карьера, и привычки ещё не затвердели. Сейчас проще всего поставить голову правильно: потом это будет работать на тебя годами, а переучиваться всегда дороже.',
      focus: ['Понять, кто ты как игрок, раньше, чем это решат за тебя', 'Научиться учиться: ошибка — это материал, а не приговор', 'Собрать первые рабочие инструменты до того, как вырастут ставки'],
      jersey: '#63c74d', jerseyDark: '#3e8948', trim: '#ffffff', beard: null, letter: null,
      hello: 'Ты выбрал путь проспекта. Карьера только начинается — самое время заложить фундамент.'
    },
    {
      id: 'peak', num: 'ИГРОК НА ПИКЕ', short: 'ГЕРОЙ', name: 'ПУТЬ ГЕРОЯ',
      who: 'Для сильных игроков',
      text: 'Ты уже хорошо играешь и хочешь стать лучшим. Ищем то, что отделяет хорошего игрока от великого.',
      stage: 'Расцвет карьеры', goal: 'Из хорошего — в лучшие',
      about: 'Мастерство и физика у тебя уже есть — как и у твоих соперников. На этом уровне разницу делает голова: кто надёжнее играет, когда всё решается.',
      focus: ['Решающие моменты: играть их так же, как обычные', 'Стабильность: лучшая игра не раз в месяц, а из матча в матч', 'Состояние потока по запросу, а не по везению'],
      jersey: '#e43b44', jerseyDark: '#9e2835', trim: '#ffffff', beard: null, letter: 'C',
      hello: 'Ты выбрал путь героя. Ты уже хорош — будем делать из тебя лучшего.'
    },
    {
      id: 'veteran', num: 'ТОП-ИГРОК 30–35', short: 'ВЕТЕРАН', name: 'ПУТЬ СЛАВНОГО ВЕТЕРАНА',
      who: 'Для топ-игроков 30–35 лет',
      text: 'Ты многого добился и хочешь продлить или перезагрузить карьеру. Собираем систему под новый этап.',
      stage: '30–35 лет, топ-уровень', goal: 'Продлить или перезагрузить карьеру',
      about: 'У тебя есть то, чего нет у молодых, — опыт. Задача в том, чтобы он работал на тебя, пока тело требует всё больше внимания, а роль в команде меняется.',
      focus: ['Восстановление как часть профессии: сон, дыхание, длинный сезон', 'Новый ответ на вопрос «кто я как игрок» на новом этапе', 'Опыт вместо запаса сил: играть умнее, а не больше'],
      jersey: '#3b55b8', jerseyDark: '#1b2a6b', trim: '#feae34', beard: '#8b9bb4', letter: 'A',
      hello: 'Ты выбрал путь славного ветерана. Опыт у тебя есть — продлим карьеру или запустим её заново.'
    }
  ];

  // Уровни программы. sessions — примеры названий сессий.
  var WORLDS = [
    { name: 'МЕСЯЦ 1', sub: 'четыре этажа: фундамент, двигатель, прожектор, курок' },
    { name: 'МЕСЯЦ 2 · «ГЛУБЖЕ»', sub: 'от инструментов — к состоянию' },
    { name: 'МЕСЯЦ 3 · «ИНТЕГРАЦИЯ»', sub: 'всё собранное — в одну систему' }
  ];
  var LEVELS = [
    { icon: 'pyramid', title: 'ИДЕНТИЧНОСТЬ', q: 'Кто ты как игрок?',
      text: 'Первый этаж — фундамент. Отвечаем на главный вопрос и собираем первую версию твоей личной операционной системы.',
      loot: ['Личная ОС v1.0', 'Правило одного процента (кайдзен)'] },
    { icon: 'arrow', title: 'МЫШЛЕНИЕ РОСТА', q: 'Как ты растёшь?',
      text: 'Второй этаж — двигатель. Фиксированное против растущего мышления, осознанная практика и обучение через неудачу.',
      sessions: ['Фиксированное против растущего: мышление, меняющее всё', 'Осознанная практика: как на самом деле работает мастерство', 'Внутренняя игра: как заглушить «Я-1»', 'Интеграция: твоя система обучения'],
      loot: ['Личная система обучения', 'Обновление ОС до v1.1'] },
    { icon: 'target', title: 'КОНЦЕНТРАЦИЯ И ФОКУС', q: 'Куда ты смотришь?',
      text: 'Третий этаж — прожектор. Ментальные навыки, которые отделяют хорошего игрока от великого: управление вниманием по ходу матча.',
      loot: ['Циклы внимания: эконом-режим и боевой'] },
    { icon: 'bolt', title: 'РЕШАЮЩИЙ МОМЕНТ', q: 'Как ты играешь, когда всё решается?',
      text: 'Четвёртый этаж — курок. Строим рутину, которая срабатывает раньше, чем ты о ней вспомнил.',
      loot: ['Рутина решающего момента', 'Команда исполнения'] },
    { icon: 'wave', title: 'СОСТОЯНИЕ ПОТОКА', q: 'Как войти в зону?',
      text: 'Наука пиковой производительности: тихая игра, в которой комментатор в голове молчит.',
      sessions: ['Тихая игра: анатомия потока', 'Осознанная практика встречает поток', 'Дашборд: одна страница вместо вердикта'],
      loot: ['Дашборд недели', 'Ритуал недельного обзора — 15 минут'] },
    { icon: 'flame', title: 'ИНСТИНКТ УБИЙЦЫ', q: 'Хочешь ли ты, чтобы шайба пришла к тебе?',
      text: 'Действие без колебания. Учимся замечать, как чувство крутит внутренний «градус», и возвращать его на место.',
      loot: ['Градус: заметить и вернуть'] },
    { icon: 'heart', title: 'ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ', q: 'Что ты чувствуешь — и что с этим делать?',
      text: 'Эмоции как инструменты производительности. Три умения по порядку: знать, что чувствуешь; управлять этим; чувствовать других.',
      sessions: ['Назвать чувство', 'Чувство как топливо', 'Читать других'],
      loot: ['Чувство как данные', 'Обновление ОС до v1.5'] },
    { icon: 'shield', title: 'СТРЕСС-ТЕСТ СИСТЕМЫ', q: 'Что из построенного живёт само?', boss: true,
      text: 'Новых тем нет: это проверка всего, что построено за два месяца, в игровых условиях. Один матч целиком — от приезда на арену до вечернего разбора.',
      sessions: ['Матч целиком', 'Починка двух звеньев', 'Два месяца на одной странице'],
      loot: ['Лист починки', 'ОС v2.0 на одной странице'] },
    { icon: 'moon', title: 'ФИЗИЧЕСКИЙ ИНТЕЛЛЕКТ', q: 'Насколько ты восстановился?',
      text: 'Тело как система. Всё собранное работает настолько, насколько ты отдохнул.',
      sessions: ['Сон: тренировка, которую не видно', 'Дыхание: то, что всегда с тобой', 'Восстановление: как прожить длинный сезон'],
      loot: ['Протоколы сна, дыхания и восстановления'] },
    { locked: true }, { locked: true }, { locked: true }
  ];

  var INVENTORY = [
    { icon: 'floppy', name: 'ЛИЧНАЯ ОС', text: 'Твоя операционная система игрока на одной странице. Обновляется по ходу программы: от v1.0 до v2.0.' },
    { icon: 'star', name: 'ПРАВИЛО 1%', text: 'Один процент улучшения на неделю. Одна строка, которая становится заданием на матч.' },
    { icon: 'clock', name: 'РУТИНА РЕШАЮЩЕГО МОМЕНТА', text: 'Последовательность, которая срабатывает сама, когда всё решается.' },
    { icon: 'thermo', name: 'ГРАДУС', text: 'Умение заметить, что чувство сбило настройку, и вернуть её.' },
    { icon: 'bars', name: 'ДАШБОРД НЕДЕЛИ', text: 'Панель, которая не ставит оценку, а показывает тренд.' },
    { icon: 'wrench', name: 'ЛИСТ ПОЧИНКИ', text: 'Что живёт само, а что держится на силе воли — и как это чинить.' }
  ];

  /* =====================================================================
     ПИКСЕЛЬНЫЕ ИКОНКИ (12×12, тёмный контур добавляется автоматически)
     ===================================================================== */

  var OUT = '#181425';
  function ring(cx, cy, r) { return function (x, y) { return Math.hypot(x - cx, y - cy) <= r; }; }

  var ICONS = {
    pyramid: { pal: { a: '#fee761', b: '#feae34' }, rows: [
      '............', '.....aa.....', '.....ab.....', '....aabb....', '....aabb....', '...aaabbb...',
      '...aaabbb...', '..aaaabbbb..', '..aaaabbbb..', '.aaaaabbbbb.', '.aaaaabbbbb.', '............'] },
    arrow: { pal: { a: '#63c74d', b: '#3e8948' }, rows: [
      '.....aa.....', '....aaaa....', '...aaaaaa...', '..aaaaaaaa..', '.aaaaaaaaaa.', '....aabb....',
      '....aabb....', '....aabb....', '....aabb....', '....aabb....', '....aabb....', '............'] },
    target: { pal: { a: '#e43b44', b: '#ffffff' }, fn: function (x, y) {
      var d = Math.hypot(x - 5.5, y - 5.5);
      return d > 5.6 ? '.' : d > 4.2 ? 'a' : d > 2.8 ? 'b' : d > 1.3 ? 'a' : 'b'; } },
    bolt: { pal: { a: '#fee761', b: '#feae34' }, rows: [
      '......aaa...', '.....aaa....', '....aaa.....', '...aaa......', '..aaaaaaa...', '.....aab....',
      '....aab.....', '...aab......', '..aab.......', '..ab........', '.b..........', '............'] },
    wave: { pal: { a: '#0099db', b: '#2ce8f5', c: '#ffffff' }, fn: function (x, y) {
      var top = Math.round(4.5 + 2.2 * Math.sin(x * 1.05));
      return y < top || y > 10 ? '.' : y === top ? 'c' : y < top + 3 ? 'b' : 'a'; } },
    flame: { pal: { a: '#e43b44', b: '#feae34', c: '#fee761' }, rows: [
      '.....a......', '....aa......', '....aaa..a..', '...aaaa.aa..', '..aaabaaaa..', '..aabbbaaa..',
      '.aaabbbbaaa.', '.aabbccbbaa.', '.aabbccbbaa.', '.aaabccbaaa.', '..aaabbaaa..', '...aaaaaa...'] },
    heart: { pal: { a: '#e43b44', c: '#f6757a' }, rows: [
      '............', '..aaa..aaa..', '.acaaaaaaaa.', '.acaaaaaaaa.', '.aaaaaaaaaa.', '.aaaaaaaaaa.',
      '..aaaaaaaa..', '...aaaaaa...', '....aaaa....', '.....aa.....', '............', '............'] },
    shield: { pal: { a: '#0099db', b: '#124e89', c: '#2ce8f5' }, rows: [
      '.aaaaaabbbb.', '.accccabbbb.', '.acaaaabbbb.', '.acaaaabbbb.', '.aaaaaabbbb.', '.aaaaaabbbb.',
      '..aaaaabbb..', '..aaaaabbb..', '...aaaabb...', '....aaab....', '.....ab.....', '............'] },
    moon: { pal: { a: '#fee761' }, fn: function (x, y) {
      return ring(5.5, 5.5, 5.4)(x, y) && !ring(8, 4, 4.4)(x, y) ? 'a' : '.'; } },
    lock: { pal: { a: '#8b9bb4', b: '#5a6988', c: '#181425' }, rows: [
      '....aaaa....', '...aa..aa...', '...a....a...', '...a....a...', '.bbbbbbbbbb.', '.bbbbbbbbbb.',
      '.bbbbccbbbb.', '.bbbbccbbbb.', '.bbbbbcbbbb.', '.bbbbbbbbbb.', '.bbbbbbbbbb.', '............'] },
    floppy: { pal: { a: '#3b55b8', b: '#c0cbdc', c: '#ffffff' }, rows: [
      '.aaaaaaaaa..', '.aabbbbbaaa.', '.aabbbabaaa.', '.aabbbbbaaa.', '.aaaaaaaaaa.', '.aaaaaaaaaa.',
      '.acccccccca.', '.acccccccca.', '.acccccccca.', '.acccccccca.', '.aaaaaaaaaa.', '............'] },
    star: { pal: { a: '#fee761', b: '#feae34' }, rows: [
      '.....aa.....', '.....aa.....', '....aaaa....', 'aaaaaaaaaaaa', '.aaaaaaaaab.', '..aaaaaabb..',
      '...aaaabb...', '..aaaaabbb..', '..aaa..bbb..', '.aaa....bbb.', '.aa......bb.', '............'] },
    clock: { pal: { a: '#c0cbdc', b: '#ffffff', c: '#e43b44' }, fn: function (x, y) {
      var d = Math.hypot(x - 5.5, y - 5.5);
      if (d > 5.6) return '.';
      if (d > 4.3) return 'a';
      if ((x === 5 && y >= 2 && y <= 5) || (y === 5 && x >= 5 && x <= 8)) return 'c';
      return 'b'; } },
    thermo: { pal: { a: '#ffffff', b: '#e43b44' }, rows: [
      '....aaaa....', '....abba....', '....aaba....', '....abba....', '....aaba....', '....abba....',
      '....abba....', '...aabbaa...', '..aabbbbaa..', '..aabbbbaa..', '...aabbaa...', '....aaaa....'] },
    bars: { pal: { a: '#63c74d', b: '#fee761', c: '#feae34', d: '#e43b44' }, rows: [
      '............', '.........aa.', '.........aa.', '......bb.aa.', '......bb.aa.', '...cc.bb.aa.',
      '...cc.bb.aa.', 'dd.cc.bb.aa.', 'dd.cc.bb.aa.', 'dd.cc.bb.aa.', 'dd.cc.bb.aa.', '............'] },
    wrench: { pal: { a: '#c0cbdc', b: '#8b9bb4' }, rows: [
      '.......aa...', '......aa....', '......aa..a.', '......aaaaa.', '.....aaaaa..', '....aaab....',
      '...aaab.....', '..aaab......', '.aaab.......', '.aab........', '............', '............'] }
  };

  function iconCell(ic, x, y) {
    if (x < 0 || y < 0 || x > 11 || y > 11) return '.';
    return ic.fn ? ic.fn(x, y) : (ic.rows[y][x] || '.');
  }

  // Рисует иконку на canvas 16×16 (поле 2 px вокруг сетки 12×12).
  function drawIcon(canvas, name) {
    var ic = ICONS[name], c = canvas.getContext('2d');
    canvas.width = 16; canvas.height = 16;
    for (var y = -1; y <= 12; y++) for (var x = -1; x <= 12; x++) {
      var ch = iconCell(ic, x, y);
      if (ch !== '.') { c.fillStyle = ic.pal[ch]; c.fillRect(x + 2, y + 2, 1, 1); continue; }
      if (iconCell(ic, x - 1, y) !== '.' || iconCell(ic, x + 1, y) !== '.' ||
          iconCell(ic, x, y - 1) !== '.' || iconCell(ic, x, y + 1) !== '.') {
        c.fillStyle = OUT; c.fillRect(x + 2, y + 2, 1, 1);
      }
    }
  }

  /* =====================================================================
     ЗВУК (WebAudio, без файлов)
     ===================================================================== */

  var audio = null, soundOn = false;
  var soundBtn = document.getElementById('soundToggle');

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function ensureAudio() {
    if (!audio) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audio = new AC();
    }
    if (audio && audio.state === 'suspended') audio.resume();
    return !!audio;
  }

  function setSound(on) {
    soundOn = on && ensureAudio();
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    store('ce-sound', soundOn ? '1' : '0');
  }

  /* Фоновая музыка: собственная короткая мелодия, синтезируется на лету.
     Восемь тактов по кругу: бас, тихое арпеджио, мягкий бит; во второй
     половине вступает тема. */
  var musicBtn = document.getElementById('musicToggle');
  var musicOn = false, musicGain = null, musicTimer = null, mStep = 0, mNext = 0;
  var M_STEP = 0.15; // длительность шестнадцатой, сек
  var M_CHORDS = [[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 62, 67], [57, 61, 64, 69]];
  var M_ARP = [0, 1, 2, 3, 2, 1, 2, 3];
  var M_LEAD = { 64: [78, 4], 68: [81, 4], 72: [86, 8], 80: [83, 6], 86: [81, 2], 88: [78, 8],
    96: [79, 4], 100: [83, 4], 104: [86, 8], 112: [85, 4], 116: [83, 4], 120: [81, 8] };
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function mNote(freq, t, dur, type, vol, endFreq) {
    var o = audio.createOscillator(), gn = audio.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(vol, t + 0.01);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(musicGain);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function mSchedule() {
    while (mNext < audio.currentTime + 0.35) {
      var st = mStep % 128, i = st % 16, ch = M_CHORDS[Math.floor(st / 16) % 4];
      if (i % 4 === 0) mNote(hz(ch[0] - 24), mNext, 0.3, 'triangle', 0.5);
      if (i === 14) mNote(hz(ch[0] - 12), mNext, 0.12, 'triangle', 0.35);
      if (i % 2 === 0) mNote(hz(ch[M_ARP[i / 2]]), mNext, 0.11, 'square', 0.1);
      if (i === 0 || i === 8) mNote(110, mNext, 0.12, 'sine', 0.5, 45);
      var ld = M_LEAD[st];
      if (ld) mNote(hz(ld[0]), mNext, ld[1] * M_STEP * 0.95, 'triangle', 0.4);
      mNext += M_STEP; mStep++;
    }
  }
  function mRun(run) {
    clearInterval(musicTimer); musicTimer = null;
    if (!run) return;
    mNext = audio.currentTime + 0.06;
    musicTimer = setInterval(mSchedule, 100); mSchedule();
  }
  function setMusic(on) {
    musicOn = on && ensureAudio();
    if (musicOn && !musicGain) { musicGain = audio.createGain(); musicGain.gain.value = 0.07; musicGain.connect(audio.destination); }
    mRun(musicOn && !document.hidden);
    musicBtn.setAttribute('aria-pressed', String(musicOn));
    store('ce-music', musicOn ? '1' : '0');
  }
  musicBtn.addEventListener('click', function () { setMusic(!musicOn); });
  document.addEventListener('visibilitychange', function () { if (musicOn) mRun(!document.hidden); });

  // notes: [частота, длительность, тип?] подряд
  function play(notes, vol) {
    if (!soundOn || !audio) return;
    var t = audio.currentTime + 0.01;
    notes.forEach(function (n) {
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = n[2] || 'square';
      o.frequency.setValueAtTime(n[0], t);
      if (n[3]) o.frequency.exponentialRampToValueAtTime(n[3], t + n[1]);
      g.gain.setValueAtTime(vol || 0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
      o.connect(g); g.connect(audio.destination);
      o.start(t); o.stop(t + n[1] + 0.02);
      t += n[1] * 0.85;
    });
  }
  var SFX = {
    blip: function () { play([[880, 0.04]], 0.03); },
    move: function () { play([[440, 0.05], [660, 0.06]]); },
    select: function () { play([[523, 0.07], [659, 0.07], [784, 0.07], [1047, 0.14]]); },
    locked: function () { play([[140, 0.12, 'sawtooth'], [110, 0.18, 'sawtooth']]); },
    shot: function () { play([[900, 0.09, 'square', 180]], 0.05); },
    goal: function () { play([[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.09], [784, 0.09], [1047, 0.3]], 0.07); },
    miss: function () { play([[200, 0.08, 'triangle', 90]], 0.08); },
    start: function () { play([[392, 0.09], [523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.28]], 0.07); }
  };

  soundBtn.addEventListener('click', function () { setSound(!soundOn); SFX.move(); });

  /* =====================================================================
     ПЕРСОНАЖ
     ===================================================================== */

  // Рисует хоккеиста (лицом вправо) с левым верхним углом в (x, y). Размер 30×32.
  function drawPlayer(c, x, y, path, frame, shoot) {
    function R(col, rx, ry, w, h) { c.fillStyle = col; c.fillRect(x + rx, y + ry, w, h); }
    var K = OUT, bob = frame === 1 ? 1 : 0;
    var by = bob; // тело чуть приседает на втором кадре

    // клюшка
    var sx = shoot ? 4 : 0;
    for (var i = 0; i < 12; i++) R('#b86f50', 17 + sx + Math.floor(i * 0.6), 15 + by + i, 2, 1);
    R(K, 23 + sx, 26 + by, 7, 4); R('#feae34', 24 + sx, 27 + by, 5, 2);

    // ноги и коньки
    var legs = frame === 0 ? [[3, 0], [11, 0]] : [[5, -1], [9, 0]];
    legs.forEach(function (l) {
      var lx = l[0], ly = 24 + l[1];
      R(K, lx - 1, ly, 6, 6);
      R('#ffffff', lx, ly, 4, 5); R(path.jersey, lx, ly + 2, 4, 1);
      R(K, lx - 1, ly + 5, 8, 3);
      R('#c0cbdc', lx - 1, ly + 8, 9, 1);
    });

    // шорты
    R(K, 2, 19 + by, 13, 7); R('#262b44', 3, 19 + by, 11, 6); R('#3a4466', 3, 19 + by, 11, 1);

    // корпус
    R(K, 1, 9 + by, 15, 11);
    R(path.jersey, 2, 10 + by, 13, 9);
    R(path.jerseyDark, 2, 10 + by, 2, 9);
    R(path.trim, 2, 16 + by, 13, 2);
    if (path.letter) { R('#fee761', 10, 11 + by, 3, 3); R(K, 11, 12 + by, 2, 1); }

    // рука и перчатка
    R(K, 11, 11 + by, 8 + sx, 6);
    R(path.jersey, 12, 12 + by, 4 + sx, 4);
    R('#262b44', 15 + sx, 12 + by, 3, 4);

    // голова
    R(K, 3, 0 + by, 11, 10);
    R('#f4f4f4', 4, 1 + by, 9, 5);          // шлем
    R(path.jersey, 4, 3 + by, 9, 1);        // полоса шлема
    R('#c0cbdc', 4, 5 + by, 4, 3);          // затылок шлема
    R('#f2c9a0', 8, 6 + by, 5, 3);          // лицо
    R(K, 11, 6 + by, 1, 1);                 // глаз
    R('#2ce8f5', 9, 5 + by, 5, 1);          // визор
    if (path.beard) { R(path.beard, 8, 8 + by, 5, 1); R(path.beard, 9, 9 + by, 3, 1); }
  }

  /* =====================================================================
     ВЫБОР ПУТИ
     ===================================================================== */

  var currentPath = PATHS[1];
  var pathsEl = document.getElementById('paths');
  var ctaPathEl = document.getElementById('ctaPath');
  var cta = document.getElementById('cta');
  var ctaBase = cta.getAttribute('href');
  var pathCards = [];
  var pathPanel = document.getElementById('pathPanel');

  PATHS.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'panel path';
    b.setAttribute('role', 'radio');
    b.innerHTML = '<canvas width="24" height="30" aria-hidden="true"></canvas>' +
      '<span class="path__num">' + p.num + '</span>' +
      '<span class="path__name">' + p.name + '</span>' +
      '<span class="path__who">' + p.who + '</span>' +
      '<span>' + p.text + '</span>' +
      '<span class="path__pick"></span>';
    b.addEventListener('click', function () { choosePath(p, true); });
    pathsEl.appendChild(b);
    pathCards.push({ path: p, el: b, ctx: b.querySelector('canvas').getContext('2d') });
  });

  function choosePath(p, byUser, quiet) {
    currentPath = p;
    pathCards.forEach(function (pc) {
      var on = pc.path === p;
      pc.el.setAttribute('aria-checked', String(on));
      pc.el.querySelector('.path__pick').textContent = on ? '★ ВЫБРАН' : 'ВЫБРАТЬ';
    });
    ctaPathEl.textContent = p.name;
    pathPanel.innerHTML = '<div class="level__top"><span class="level__tag">' + p.num + '</span><h3 class="level__title">' + p.name + '</h3></div>' +
      '<dl class="pathinfo__meta"><div><dt>ЭТАП</dt><dd>' + p.stage + '</dd></div><div><dt>ЦЕЛЬ</dt><dd>' + p.goal + '</dd></div></dl>' +
      '<p>' + p.about + '</p><div class="level__cols"><div><h4>НА ЧТО ДЕЛАЕМ УПОР</h4><ul>' +
      p.focus.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>ЧТО ОБЩЕЕ У ВСЕХ ПУТЕЙ</h4><ul><li>Формат один на один с тренером</li><li>Те же 12 уровней программы</li><li>Примеры и задания — из твоей карьеры и твоего этапа</li></ul></div></div>';
    // Подставляем выбранный путь в текст сообщения (работает для ссылок t.me и mailto)
    var msg = 'Здравствуйте! Хочу записаться на The Champion\'s Edge. Мой путь: ' + p.name.toLowerCase() + '.';
    if (/^https:\/\/t\.me\//.test(ctaBase)) cta.href = ctaBase + '?text=' + encodeURIComponent(msg);
    else if (/^mailto:/.test(ctaBase)) cta.href = ctaBase + '?subject=' + encodeURIComponent('The Champion\'s Edge') + '&body=' + encodeURIComponent(msg);
    drawFace(); drawGuide();
    if (byUser) {
      store('ce-path', p.id);
      if (!quiet) SFX.select();
      say([p.hello, 'Листай вниз — покажу, как устроена программа и что ты из неё вынесешь.']);
    }
  }

  /* =====================================================================
     ДИАЛОГ
     ===================================================================== */

  var dialog = document.getElementById('dialog');
  var dialogText = document.getElementById('dialogText');
  var faceCtx = document.getElementById('face').getContext('2d');
  var lines = [], lineIdx = 0, charIdx = 0, typer = null;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawFace() {
    faceCtx.clearRect(0, 0, 16, 16);
    faceCtx.fillStyle = '#262b44'; faceCtx.fillRect(0, 0, 16, 16);
    drawPlayer(faceCtx, 0, 3, currentPath, 0, false);
  }

  function typeLine() {
    clearInterval(typer);
    var s = lines[lineIdx]; charIdx = 0; dialogText.textContent = '';
    if (reduced) { dialogText.textContent = s; charIdx = s.length; return; }
    typer = setInterval(function () {
      charIdx++;
      dialogText.textContent = s.slice(0, charIdx);
      if (charIdx % 3 === 0 && onScreen(dialog)) SFX.blip();
      if (charIdx >= s.length) clearInterval(typer);
    }, 28);
  }
  function say(newLines) { lines = newLines; lineIdx = 0; typeLine(); }
  function advance() {
    var s = lines[lineIdx];
    if (charIdx < s.length) { clearInterval(typer); charIdx = s.length; dialogText.textContent = s; return; }
    lineIdx = (lineIdx + 1) % lines.length;
    SFX.move(); typeLine();
  }
  dialog.addEventListener('click', advance);
  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); advance(); }
  });

  function onScreen(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  /* =====================================================================
     СЦЕНА: площадка
     ===================================================================== */

  var cv = document.getElementById('scene'), g = cv.getContext('2d');
  // Вид сверху-сбоку: трибуны и борт вверху, трое ворот внизу, бросок — вниз.
  var W = 320, H = 200, ICE_Y = 52, GOAL_Y = 172;
  var scoreEl = document.getElementById('score');
  var keys = {}, score = 0;
  var hero = { x: 60, y: 66, vx: 0, vy: 0, dir: 1, auto: true, autoDir: 1, shootT: 0, idleT: 0, target: null };
  var puck = { x: 0, y: 0, vx: 0, vy: 0, live: false };
  var goalFlash = 0, banner = '', banner2 = '', bannerT = 0, lastZone = -1;
  // Трое ворот — по одним на каждый путь чемпиона: [левая штанга, правая штанга]
  var NETS = [[26, 98], [124, 196], [222, 294]];
  var HERO_MIN_X = 4, HERO_MAX_X = 286, HERO_MIN_Y = 28, HERO_MAX_Y = 126;

  // Трибуны — заранее сгенерированные зрители
  var crowd = [], CROWD_COLS = ['#3a4466', '#5a6988', '#9e2835', '#124e89', '#3e8948', '#733e39', '#262b44', '#68386c'];
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  for (var cy = 0; cy < 4; cy++) for (var cx = 0; cx < 90; cx++) {
    crowd.push({ x: cx * 4 - 16 + (cy % 2) * 2, y: 10 + cy * 6, c: CROWD_COLS[Math.floor(rnd() * CROWD_COLS.length)], p: rnd() });
  }

  function drawScene(t) {
    var par = (hero.x - 150) * 0.05;

    // свод арены и зрители
    g.fillStyle = '#0c0a14'; g.fillRect(0, 0, W, 6);
    g.fillStyle = '#181425'; g.fillRect(0, 6, W, 28);
    crowd.forEach(function (s) {
      var x = Math.round(s.x - par), up = Math.sin(t / 300 + s.p * 40) > 0.92 ? 1 : 0;
      g.fillStyle = s.c; g.fillRect(x, s.y - up, 3, 4);
      g.fillStyle = '#f2c9a0'; g.fillRect(x + 1, s.y - 1 - up, 1, 1);
    });
    // вспышки камер
    for (var f = 0; f < 3; f++) {
      var k = Math.floor(t / 180 + f * 37);
      var fx = (k * 73 + f * 51) % W, fy = 9 + (k * 29) % 20;
      if ((k + f) % 4 === 0) { g.fillStyle = '#ffffff'; g.fillRect(fx, fy, 2, 2); g.fillRect(fx - 1, fy, 4, 1); g.fillRect(fx, fy - 1, 1, 4); }
    }
    // прожекторы
    g.fillStyle = '#fee761';
    [60, 160, 260].forEach(function (lx) { g.fillRect(lx - 4, 1, 8, 2); });

    // стекло и борт
    var bo = Math.round(-par * 2);
    g.fillStyle = 'rgba(192,203,220,0.18)'; g.fillRect(0, 32, W, 8);
    g.fillStyle = '#8b9bb4';
    for (var gx = bo % 40 - 40; gx < W; gx += 40) g.fillRect(gx, 32, 1, 8);
    g.fillStyle = '#e43b44'; g.fillRect(0, 40, W, 2);
    g.fillStyle = '#ffffff'; g.fillRect(0, 42, W, 8);
    g.fillStyle = '#fee761'; g.fillRect(0, 50, W, 2);
    var ads = ['#0099db', '#e43b44', '#63c74d', '#feae34'];
    for (var a = -1; a < 6; a++) {
      var ax = a * 72 + ((bo % 72) + 72) % 72 - 60;
      g.fillStyle = ads[((a % 4) + 4) % 4]; g.fillRect(ax, 43, 44, 6);
      g.fillStyle = '#ffffff'; g.fillRect(ax + 4, 45, 20, 2); g.fillRect(ax + 28, 45, 10, 2);
    }

    // лёд
    g.fillStyle = '#e8f2fb'; g.fillRect(0, ICE_Y, W, H - ICE_Y);
    g.fillStyle = '#d3e3f2';
    for (var iy = ICE_Y + 8; iy < H; iy += 14) g.fillRect(0, iy, W, 1);
    g.fillStyle = '#c0cbdc'; g.fillRect(0, ICE_Y, W, 2);
    g.fillStyle = 'rgba(255,255,255,0.7)';
    [60, 160, 260].forEach(function (lx) { g.fillRect(lx - 12, 74, 24, 1); g.fillRect(lx - 6, 77, 12, 1); });
    // синяя линия, точки вбрасывания, линия ворот
    g.fillStyle = '#0099db'; g.fillRect(0, 106, W, 4);
    g.fillStyle = '#e43b44';
    [62, 160, 258].forEach(function (dx) { g.fillRect(dx - 2, 138, 4, 4); });
    g.fillRect(0, GOAL_Y, W, 2);

    // трое ворот: цвет — форма пути, выбранный путь подсвечен
    var flash = goalFlash > 0 && Math.floor(goalFlash / 4) % 2 === 0;
    g.font = '8px "Press Start 2P", monospace'; g.textAlign = 'center';
    NETS.forEach(function (n, i) {
      var p = PATHS[i], l = n[0], r = n[1], hit = flash && lastZone === i, cur = p === currentPath;
      g.fillStyle = '#e43b44'; g.fillRect(l + 7, GOAL_Y - 9, r - l - 14, 1);            // площадь ворот
      g.fillRect(l + 7, GOAL_Y - 9, 1, 9); g.fillRect(r - 8, GOAL_Y - 9, 1, 9);
      g.fillStyle = '#9fd6f5'; g.fillRect(l + 8, GOAL_Y - 8, r - l - 16, 8);
      g.fillStyle = cur ? p.jerseyDark : '#262b44'; g.fillRect(l, GOAL_Y + 2, r - l, 20);
      g.fillStyle = hit ? '#fee761' : '#5a6988';                                         // сетка
      for (var ny = GOAL_Y + 4; ny < GOAL_Y + 22; ny += 3) g.fillRect(l, ny, r - l, 1);
      for (var nx = l + 2; nx < r; nx += 3) g.fillRect(nx, GOAL_Y + 2, 1, 20);
      g.fillStyle = hit ? '#fee761' : p.jersey;                                          // рама
      g.fillRect(l - 2, GOAL_Y - 1, 2, 25); g.fillRect(r, GOAL_Y - 1, 2, 25);
      g.fillRect(l - 2, GOAL_Y + 22, r - l + 4, 2);
      // название пути
      var tw = p.short.length * 8 + 4, mx = (l + r) / 2;
      g.fillStyle = OUT; g.fillRect(Math.round(mx - tw / 2), GOAL_Y + 7, tw, 11);
      g.fillStyle = cur ? '#fee761' : '#ffffff'; g.fillText(p.short, mx, GOAL_Y + 16);
    });

    // игрок
    var hy = Math.round(hero.y), moving = hero.vx !== 0 || hero.vy !== 0;
    var frame = moving ? Math.floor(t / 140) % 2 : Math.floor(t / 500) % 2;
    g.fillStyle = 'rgba(38,43,68,0.25)'; g.fillRect(Math.round(hero.x) - 1, hy + 32, 22, 3);
    g.save();
    if (hero.dir < 0) { g.translate(Math.round(hero.x) * 2 + 18, 0); g.scale(-1, 1); }
    drawPlayer(g, Math.round(hero.x), hy, currentPath, frame, hero.shootT > 0);
    g.restore();

    // шайба
    if (puck.live) {
      g.fillStyle = OUT; g.fillRect(Math.round(puck.x), Math.round(puck.y), 5, 4);
      g.fillStyle = '#5a6988'; g.fillRect(Math.round(puck.x) + 1, Math.round(puck.y) + 1, 3, 1);
    }

    // надпись
    if (bannerT > 0) {
      var by0 = 138 + (bannerT > 60 ? (bannerT - 60) : 0), col = Math.floor(bannerT / 5) % 2 ? '#fee761' : '#ffffff';
      var shadow = [[-2, 0], [2, 0], [0, -2], [0, 2], [2, 2]];
      g.textAlign = 'center';
      g.font = '16px "Press Start 2P", monospace';
      g.fillStyle = OUT; shadow.forEach(function (o) { g.fillText(banner, 160 + o[0], by0 + o[1]); });
      g.fillStyle = col; g.fillText(banner, 160, by0);
      if (banner2) {
        g.font = '8px "Press Start 2P", monospace';
        g.fillStyle = OUT; g.fillRect(160 - banner2.length * 4 - 4, by0 + 5, banner2.length * 8 + 8, 13);
        g.fillStyle = '#ffffff'; g.fillText(banner2, 160, by0 + 15);
      }
    }
  }

  function shoot() {
    if (puck.live || hero.shootT > 0) return;
    hero.dir = 1; hero.shootT = 14;
    puck.live = true;
    puck.x = hero.x + 25; puck.y = hero.y + 29;
    // чем дальше от ворот, тем больше разброс
    var dist = Math.max(0, GOAL_Y - puck.y);
    puck.vx = (Math.random() - 0.5) * (0.15 + dist / 160);
    puck.vy = 4;
    SFX.shot();
  }

  function update(dt) {
    var left = keys.ArrowLeft || keys.a, right = keys.ArrowRight || keys.d;
    var up = keys.ArrowUp || keys.w, down = keys.ArrowDown || keys.s;
    hero.vx = 0; hero.vy = 0;
    if (left || right || up || down) {
      hero.auto = false; hero.idleT = 0; hero.target = null;
      hero.vx = right ? 1.6 : left ? -1.6 : 0;
      hero.vy = down ? 1.2 : up ? -1.2 : 0;
    } else if (hero.target !== null) {
      // нажали на лёд: встаём напротив этой точки и бросаем
      var dx = hero.target - hero.x;
      hero.auto = false; hero.idleT = 0;
      if (Math.abs(dx) <= 2) { hero.x = hero.target; hero.target = null; shoot(); }
      else hero.vx = dx > 0 ? 2.4 : -2.4;
    } else if (!hero.auto) { hero.idleT += dt; if (hero.idleT > 6000) hero.auto = true; }
    if (hero.auto && hero.shootT <= 0) {
      hero.vx = hero.autoDir * 0.6;
      if (hero.x > 260) hero.autoDir = -1;
      if (hero.x < 24) hero.autoDir = 1;
    }
    if (hero.vx) hero.dir = hero.vx > 0 ? 1 : -1;
    hero.x = Math.max(HERO_MIN_X, Math.min(HERO_MAX_X, hero.x + hero.vx));
    hero.y = Math.max(HERO_MIN_Y, Math.min(HERO_MAX_Y, hero.y + hero.vy));
    if (hero.shootT > 0) hero.shootT--;

    if (puck.live) {
      puck.x += puck.vx; puck.y += puck.vy;
      if (puck.x < 2 || puck.x > W - 7) puck.vx *= -1;
      if (puck.y >= GOAL_Y) {
        puck.live = false;
        var pcx = puck.x + 2.5, zone = -1;
        NETS.forEach(function (n, i) { if (pcx > n[0] && pcx < n[1]) zone = i; });
        if (zone >= 0) {
          score++; scoreEl.textContent = ('00' + score).slice(-3);
          lastZone = zone; goalFlash = 70; banner = 'ГОЛ!'; banner2 = PATHS[zone].name; bannerT = 90; SFX.goal();
          choosePath(PATHS[zone], true, true);
        } else { banner = 'МИМО!'; banner2 = ''; bannerT = 40; SFX.miss(); }
      }
    }
    if (goalFlash > 0) goalFlash--;
    if (bannerT > 0) bannerT--;
  }

  var last = 0, acc = 0, sceneVisible = true;
  function loop(t) {
    requestAnimationFrame(loop);
    if (!sceneVisible) { last = t; return; }
    acc += Math.min(100, t - last); last = t;
    while (acc >= 16.6) { update(16.6); acc -= 16.6; }
    drawScene(t);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { sceneVisible = es[0].isIntersecting; }).observe(cv);
  }

  var RU_KEYS = { 'ф': 'a', 'в': 'd', 'ц': 'w', 'ы': 's' };
  var MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'];
  window.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    k = RU_KEYS[k] || k;
    if (!onScreen(cv)) return;
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName) && k === ' ') return;
    if (k === ' ') { e.preventDefault(); shoot(); return; }
    if (MOVE_KEYS.indexOf(k) >= 0) { keys[k] = true; if (k.length > 1) e.preventDefault(); }
  });
  window.addEventListener('keyup', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[RU_KEYS[k] || k] = false;
  });
  window.addEventListener('blur', function () { keys = {}; });
  cv.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    var r = cv.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
    if (py < ICE_Y) { shoot(); return; }
    hero.target = Math.max(HERO_MIN_X, Math.min(HERO_MAX_X, Math.round(px - 27)));
  });

  /* =====================================================================
     КАРТА УРОВНЕЙ
     ===================================================================== */

  var worldsEl = document.getElementById('worlds');
  var levelPanel = document.getElementById('levelPanel');
  var nodes = [];

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function list(arr) { return '<ul>' + arr.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>'; }

  WORLDS.forEach(function (w, wi) {
    var el = document.createElement('div'); el.className = 'world';
    el.innerHTML = '<div class="world__head"><span class="world__name">' + w.name + '</span><span class="world__sub">' + w.sub + '</span></div>';
    var pathEl = document.createElement('div'); pathEl.className = 'world__path';
    for (var i = 0; i < 4; i++) (function (idx) {
      var lv = LEVELS[idx], b = document.createElement('button');
      b.type = 'button'; b.className = 'node' + (lv.locked ? ' node--locked' : '');
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="node__tile"><canvas aria-hidden="true"></canvas></span>' +
        '<span class="node__num">НЕДЕЛЯ ' + (idx + 1) + '</span>' + (lv.locked ? '???' : lv.title);
      drawIcon(b.querySelector('canvas'), lv.locked ? 'lock' : lv.icon);
      b.addEventListener('click', function () { openLevel(idx, true); });
      pathEl.appendChild(b); nodes.push(b);
    })(wi * 4 + i);
    el.appendChild(pathEl); worldsEl.appendChild(el);
  });

  function openLevel(idx, byUser) {
    var lv = LEVELS[idx];
    nodes.forEach(function (n, i) { n.setAttribute('aria-pressed', String(i === idx)); });
    var num = 'УРОВЕНЬ ' + (idx + 1) + ' · НЕДЕЛЯ ' + (idx + 1);
    if (lv.locked) {
      levelPanel.innerHTML = '<div class="level__top"><span class="level__tag">' + num + '</span><h3 class="level__title">??? ЗАКРЫТО</h3></div>' +
        '<p>Этот уровень откроется по ходу игры. Финал третьего месяца собирает всё построенное в одну систему.</p>';
      if (byUser) SFX.locked();
      return;
    }
    var html = '<div class="level__top"><span class="level__tag' + (lv.boss ? ' level__tag--boss' : '') + '">' + (lv.boss ? 'БОСС · ' : '') + num + '</span>' +
      '<h3 class="level__title">' + lv.title + '</h3></div>' +
      '<p class="level__q">«' + esc(lv.q) + '»</p><p>' + esc(lv.text) + '</p><div class="level__cols">';
    if (lv.sessions) html += '<div><h4>СЕССИИ</h4>' + list(lv.sessions) + '</div>';
    html += '<div><h4>ТРОФЕИ УРОВНЯ</h4>' + list(lv.loot) + '</div></div>';
    levelPanel.innerHTML = html;
    if (byUser) SFX.select();
  }

  /* =====================================================================
     ИНВЕНТАРЬ
     ===================================================================== */

  var invEl = document.getElementById('inventory');
  INVENTORY.forEach(function (it) {
    var d = document.createElement('div'); d.className = 'panel item';
    d.innerHTML = '<canvas aria-hidden="true"></canvas><div><b>' + it.name + '</b><span>' + it.text + '</span></div>';
    drawIcon(d.querySelector('canvas'), it.icon);
    invEl.appendChild(d);
  });

  /* =====================================================================
     ПРОВОДНИК: идёт за читателем по странице и подсказывает, что делать
     ===================================================================== */

  var GUIDE = [
    { id: 'path', text: 'Здесь три пути чемпиона. Нажми на карточку — ниже появится, на что делаем упор именно на твоём этапе.' },
    { id: 'about', text: 'Коротко о формате: один на один с тренером, 12 недель, теория в беседе и практика на льду.' },
    { id: 'map', text: 'Это карта программы. Нажимай на уровни: внутри тема недели, сессии и трофеи. Замки откроются по ходу игры.' },
    { id: 'loot', text: 'А это ты унесёшь с собой. Инструменты остаются у тебя и после программы.' },
    { id: 'science', text: 'Здесь — на чьих идеях построена программа. Всё переложено на хоккей.' },
    { id: 'start', text: 'Готов? Жми «Записаться»: откроется Telegram, твой путь уже вписан в сообщение.' }
  ];
  var guideEl = document.getElementById('guide');
  var guideText = document.getElementById('guideText');
  var guideNext = document.getElementById('guideNext');
  var guideBubble = document.getElementById('guideBubble');
  var guideCtx = document.getElementById('guideHero').querySelector('canvas').getContext('2d');
  var guideIdx = -1, guideClosed = store('ce-guide') === '0';

  function drawGuide() {
    guideCtx.clearRect(0, 0, 32, 40);
    drawPlayer(guideCtx, 1, 4, currentPath, 0, false);
  }
  function guideSync() {
    // какой раздел сейчас перед глазами
    var idx = -1, mid = window.innerHeight * 0.55;
    GUIDE.forEach(function (gd, i) { if (document.getElementById(gd.id).getBoundingClientRect().top < mid) idx = i; });
    // на титуле и рядом с репликой под площадкой проводник не дублируется
    guideEl.hidden = idx < 0 || onScreen(dialog);
    if (idx < 0 || idx === guideIdx) return;
    guideIdx = idx;
    guideText.textContent = GUIDE[idx].text;
    guideNext.textContent = idx === GUIDE.length - 1 ? '▲ НАВЕРХ' : 'ДАЛЬШЕ ▶';
  }
  function guideShow(open) {
    guideClosed = !open; guideBubble.hidden = guideClosed;
    store('ce-guide', open ? '1' : '0');
  }
  guideNext.addEventListener('click', function () {
    var target = guideIdx === GUIDE.length - 1 ? document.getElementById('rink') : document.getElementById(GUIDE[guideIdx + 1].id);
    SFX.move(); target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
  document.getElementById('guideClose').addEventListener('click', function () { SFX.move(); guideShow(false); });
  document.getElementById('guideHero').addEventListener('click', function () { SFX.move(); guideShow(guideClosed); });
  var guideTick = false;
  function guideOnScroll() {
    if (guideTick) return; guideTick = true;
    requestAnimationFrame(function () { guideTick = false; guideSync(); });
  }
  window.addEventListener('scroll', guideOnScroll, { passive: true });
  window.addEventListener('resize', guideOnScroll);
  guideBubble.hidden = guideClosed;

  /* =====================================================================
     ЗАПУСК
     ===================================================================== */

  // портреты на карточках путей
  pathCards.forEach(function (pc) {
    var c = pc.el.querySelector('canvas'); c.width = 32; c.height = 40;
    drawPlayer(pc.ctx, 1, 4, pc.path, 0, false);
  });

  var saved = store('ce-path');
  choosePath(PATHS.filter(function (p) { return p.id === saved; })[0] || PATHS[1], false);
  openLevel(0, false);

  say([
    'Привет! Я твой проводник по The Champion\'s Edge.',
    'Это программа ментальной подготовки для хоккеистов. Один на один с тренером.',
    '12 недель — 12 уровней. С каждого уровня ты уносишь инструмент, который остаётся с тобой.',
    'Выбери свой путь чемпиона броском: внизу трое ворот, каждые — свой путь. Забей в нужные. Описание путей — ниже.'
  ]);

  document.getElementById('pressStart').addEventListener('click', function () {
    if (store('ce-sound') !== '0') setSound(true);
    if (store('ce-music') !== '0' && !musicOn) setMusic(true);
    SFX.start();
    cv.focus({ preventScroll: true }); // чтобы ПРОБЕЛ сразу бросал, а не нажимал кнопку
    document.getElementById('rink').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  // звук на ссылках и кнопках
  document.querySelectorAll('.hud__nav a, .hud__logo').forEach(function (a) { a.addEventListener('click', SFX.move); });
  cta.addEventListener('click', SFX.select);

  guideSync();
  requestAnimationFrame(loop);
})();
