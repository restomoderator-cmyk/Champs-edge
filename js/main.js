(function () {
  'use strict';

  // Высота шапки нужна стилям, чтобы переходы по странице не уезжали под неё
  (function () {
    var hud = document.querySelector('.hud');
    function measure() { document.documentElement.style.setProperty('--hud-h', hud.offsetHeight + 'px'); }
    measure();
    window.addEventListener('resize', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(hud);
  })();

  // Меню на узких экранах: кнопка «МЕНЮ» раскрывает все разделы
  (function () {
    var btn = document.getElementById('navToggle'), nav = document.getElementById('nav');
    function setOpen(open) { nav.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  })();

  /* =====================================================================
     ДАННЫЕ
     ===================================================================== */

  // Три пути чемпиона. jersey/trim - цвета формы персонажа.
  var PATHS = [
    {
      id: 'young', num: 'МОЛОДОЙ ИГРОК', short: 'ПРОСПЕКТ', name: 'ПУТЬ ПРОСПЕКТА',
      who: 'Для молодых игроков',
      text: 'Ты в самом начале карьеры. Закладываем фундамент, на котором она будет строиться.',
      stage: 'Начало карьеры', goal: 'Заложить фундамент',
      about: 'Впереди вся карьера, и привычки ещё не затвердели. Сейчас проще всего поставить голову правильно: потом это будет работать на тебя годами, а переучиваться всегда дороже.',
      focus: ['Понять, кто ты как игрок, раньше, чем это решат за тебя', 'Научиться учиться: ошибка - это материал, а не приговор', 'Собрать первые рабочие инструменты до того, как вырастут ставки'],
      jersey: '#63c74d', jerseyDark: '#3e8948', trim: '#ffffff', beard: null, letter: null,
      hello: 'Ты выбрал путь проспекта. Карьера только начинается, самое время заложить фундамент.'
    },
    {
      id: 'peak', num: 'ИГРОК НА ПИКЕ', short: 'ГЕРОЙ', name: 'ПУТЬ ГЕРОЯ',
      who: 'Для сильных игроков',
      text: 'Ты уже хорошо играешь и хочешь стать лучшим. Ищем то, что отделяет хорошего игрока от великого.',
      stage: 'Расцвет карьеры', goal: 'Из хорошего в лучшие',
      about: 'Мастерство и физика у тебя уже есть. Как и у твоих соперников. На этом уровне разницу делает голова: кто надёжнее играет, когда всё решается.',
      focus: ['Решающие моменты: играть их так же, как обычные', 'Стабильность: лучшая игра не раз в месяц, а из матча в матч', 'Состояние потока по запросу, а не по везению'],
      jersey: '#e43b44', jerseyDark: '#9e2835', trim: '#ffffff', beard: null, letter: 'C',
      hello: 'Ты выбрал путь героя. Ты уже хорош. Будем делать из тебя лучшего.'
    },
    {
      id: 'veteran', num: 'ТОП-ИГРОК 30–35', short: 'ВЕТЕРАН', name: 'ПУТЬ СЛАВНОГО ВЕТЕРАНА',
      who: 'Для топ-игроков 30–35 лет',
      text: 'Ты многого добился и хочешь продлить или перезагрузить карьеру. Собираем систему под новый этап.',
      stage: '30–35 лет, топ-уровень', goal: 'Продлить или перезагрузить карьеру',
      about: 'У тебя есть то, чего нет у молодых: опыт. Задача в том, чтобы он работал на тебя, пока тело требует всё больше внимания, а роль в команде меняется.',
      focus: ['Восстановление как часть профессии: сон, дыхание, длинный сезон', 'Новый ответ на вопрос «кто я как игрок» на новом этапе', 'Опыт вместо запаса сил: играть умнее, а не больше'],
      jersey: '#3b55b8', jerseyDark: '#1b2a6b', trim: '#feae34', beard: '#8b9bb4', letter: 'A',
      hello: 'Ты выбрал путь славного ветерана. Опыт у тебя есть. Продлим карьеру или запустим её заново.'
    }
  ];

  // Программа: 12 месяцев, 4 фазы, 45 недель. Фаза 1 расписана по неделям
  // (недели 1-6 открыты, 7-12 под замком), фазы 2-4 показаны по месяцам под замком:
  // по задумке закрытые уровни открываются в процессе игры.
  // sessions - названия сессий недели, loot - что игрок уносит с уровня.
  var LOCKED = { locked: true };
  var PHASES = [
    { name: 'ФУНДАМЕНТ', when: 'МЕСЯЦЫ 1–3 · НЕДЕЛИ 1–12',
      task: 'Строим систему: личность, привычки, ментальная база, первые шаги в эмоциях и командной работе. Самый плотный период программы.',
      worlds: [
        { name: 'МЕСЯЦ 1 · «ПРОБУЖДЕНИЕ»', sub: 'вводный курс, в конце Ворота: решение, идти ли дальше', levels: [
          { num: 'НЕДЕЛЯ 1', icon: 'pyramid', title: 'ЛИЧНОСТЬ И ХАРАКТЕР', q: 'Кто ты до того, что ты делаешь?',
            text: 'Начинаем с личности, а не с результата. Кто ты в тот день, когда тебя не поставили в состав? Ловушка в том, чтобы определять себя через голы, очки и номер звена.',
            sessions: ['Кто ты до того, что ты делаешь', 'Пирамида: с основания', 'Система 1%', 'Твоя операционная система'],
            loot: ['Личная Конституция: пять ценностей без компромисса', 'Первая версия личной ОС', 'Микропривычка на 1% в день'] },
          { num: 'НЕДЕЛЯ 2', icon: 'arrow', title: 'МЫШЛЕНИЕ РОСТА', q: 'Как ты растёшь?',
            text: 'Фиксированное и растущее мышление, осознанная практика, уроки из неудач. Как фиксированное мышление прячется в хоккее: «руки не те», «я не бомбардир», «меня не видят».',
            sessions: ['Фиксированное мышление и растущее мышление', 'Осознанная практика', 'Внутренняя игра: утихомирить Я-1', 'Твоя система обучения'],
            loot: ['Обзор после исполнения: три вопроса, пять минут', 'Язык роста вместо фиксированного'] },
          { num: 'НЕДЕЛЯ 3', icon: 'target', title: 'КОНЦЕНТРАЦИЯ И ФОКУС', q: 'Куда ты смотришь?',
            text: 'Ментальные навыки, которые отделяют хорошего от великого. Острота на смене в 45 секунд и 15 минут ожидания на скамейке. Табло, трибуны и судья как отвлекатели.',
            sessions: ['Наука фокуса', 'Кнопка сброса', 'Визуализация: увидеть до того, как сделать', 'Ментальный набор'],
            loot: ['Кнопка сброса на 10 секунд', 'Личный триггер фокуса', 'Весь ментальный набор на одной карточке'] },
          { num: 'НЕДЕЛЯ 4', icon: 'star', title: 'ИНТЕГРАЦИЯ И ВОРОТА', q: 'Идёшь дальше?', boss: true,
            text: 'Закрытие первого месяца и точка решения. Ты представляешь свою Конституцию, Пирамиду, ОС и ментальный набор. После этого решаешь, идти ли в полную программу.',
            sessions: ['Препятствие как путь', 'Твоя личная Пирамида', 'Пересборка ОС по итогам месяца', 'Ворота: закрытие Месяца 1'],
            loot: ['Своя Пирамида', 'ОС, пересобранная на данных месяца', 'Решение Ворот'] }
        ] },
        { name: 'МЕСЯЦ 2 · «ГЛУБЖЕ»', sub: 'от инструментов к состоянию', levels: [
          { num: 'НЕДЕЛЯ 5', icon: 'wave', title: 'СОСТОЯНИЕ ПОТОКА', q: 'Как войти в зону?',
            text: 'Наука пиковой игры. Поток в смене: когда игра «замедляется». Разбираем твой лучший матч сезона и то, что ему предшествовало.',
            sessions: ['Анатомия потока', 'Осознанная практика встречает поток', 'Лист недели'],
            loot: ['Карта триггеров потока', 'Лист недели: одна страница до конца программы'] },
          { num: 'НЕДЕЛЯ 6', icon: 'flame', title: 'ИНСТИНКТ УБИЙЦЫ', q: 'Кто берёт шайбу в последней минуте?',
            text: 'Соревновательное мышление и разум воина. Действие без колебания. Злость, которая забивает, и злость, которая едет на две минуты.',
            sessions: ['Cooler, Closer, Cleaner', 'Разум воина', 'Баланс драйва и контроля'],
            loot: ['Своя карта трёх вопросов под давлением', 'Шкала интенсивности: от рядовой смены до буллита'] },
          { num: 'НЕДЕЛЯ 7', locked: true }, { num: 'НЕДЕЛЯ 8', locked: true }
        ] },
        { name: 'МЕСЯЦ 3 · «ИНТЕГРАЦИЯ»', sub: 'всё собранное в одну систему', levels: [
          { num: 'НЕДЕЛЯ 9', locked: true }, { num: 'НЕДЕЛЯ 10', locked: true }, { num: 'НЕДЕЛЯ 11', locked: true }, { num: 'НЕДЕЛЯ 12', locked: true }
        ] }
      ] },
    { name: 'ЗАТОЧКА', when: 'МЕСЯЦЫ 4–6 · НЕДЕЛИ 13–24',
      task: 'Система, построенная в первой фазе, начинает работать под реальным соревновательным давлением. Меньше теории, больше применения.',
      worlds: [{ name: 'ТРИ МЕСЯЦА ФАЗЫ', sub: 'давление, эмоции, стойкость', levels: [
        { num: 'МЕСЯЦ 4', title: '«ДАВЛЕНИЕ»', locked: true }, { num: 'МЕСЯЦ 5', title: '«ЭМОЦИИ КАК ОРУЖИЕ»', locked: true }, { num: 'МЕСЯЦ 6', title: '«СТОЙКОСТЬ»', locked: true }
      ] }] },
    { name: 'ПОЛИГОН', when: 'МЕСЯЦЫ 7–9 · НЕДЕЛИ 25–33',
      task: 'Пик сезона и плей-офф. Применение под огнём: сессии реже, работа идёт по твоим реальным матчам, а не по учебнику. Плюс лидерство.',
      worlds: [{ name: 'ТРИ МЕСЯЦА ФАЗЫ', sub: 'лидерство, плей-офф, восстановление', levels: [
        { num: 'МЕСЯЦ 7', title: '«ЛИДЕРСТВО»', locked: true }, { num: 'МЕСЯЦ 8', title: '«ПОД ОГНЁМ»', locked: true }, { num: 'МЕСЯЦ 9', title: '«ГЛУБИНА»', locked: true }
      ] }] },
    { name: 'ЭВОЛЮЦИЯ', when: 'МЕСЯЦЫ 10–12 · НЕДЕЛИ 34–45',
      task: 'Тело как система, стратегия карьеры, деньги, дизайн жизни. Все девять доменов собираются в финальную версию твоей системы.',
      worlds: [{ name: 'ТРИ МЕСЯЦА ФАЗЫ', sub: 'тело, стратегия, финальная сборка', levels: [
        { num: 'МЕСЯЦ 10', title: '«ТЕЛО КАК СИСТЕМА»', locked: true }, { num: 'МЕСЯЦ 11', title: '«СТРАТЕГИЯ И ДЕНЬГИ»', locked: true }, { num: 'МЕСЯЦ 12', title: '«ПОЛНАЯ ИНТЕГРАЦИЯ»', locked: true }
      ] }] }
  ];

  // Девять доменов программы
  var DOMAINS = [
    { icon: 'pyramid', name: 'ЛИЧНОСТЬ И ХАРАКТЕР', text: 'Пирамида Вудена, Личная Конституция, принципы.' },
    { icon: 'target', name: 'МЕНТАЛЬНАЯ ЭФФЕКТИВНОСТЬ', text: 'Фокус, сброс, визуализация, Внутренняя игра, поток.' },
    { icon: 'floppy', name: 'СИСТЕМЫ ПРИВЫЧЕК', text: 'Кайдзен, атомные привычки, личная операционная система.' },
    { icon: 'flame', name: 'СОРЕВНОВАТЕЛЬНОЕ МЫШЛЕНИЕ', text: 'Инстинкт убийцы, разум воина, решающий момент.' },
    { icon: 'heart', name: 'ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ', text: 'Эмоции как инструмент, чтение партнёров и соперника.' },
    { icon: 'shield', name: 'УСТОЙЧИВОСТЬ', text: 'Преодоление, стоицизм, смысл, ментальное здоровье.' },
    { icon: 'moon', name: 'ФИЗИЧЕСКИЙ ИНТЕЛЛЕКТ', text: 'Сон, дыхание, восстановление, питание.' },
    { icon: 'star', name: 'КОМАНДА И ЛИДЕРСТВО', text: 'Культура раздевалки, лидерство без титула.' },
    { icon: 'bars', name: 'СТРАТЕГИЯ И ДИЗАЙН ЖИЗНИ', text: 'Карьерные решения, финансы, жизнь за пределами льда.' }
  ];

  // Девять принципов программы
  var PRINCIPLES = [
    'Быть чемпионом - это не титулы и награды, а образ жизни и способ мышления. Титулы лишь подтверждают это.',
    'Чем усерднее я работаю сегодня, тем сильнее и увереннее буду завтра.',
    'Одно действие сильнее тысячи намерений.',
    'Я принимаю и похвалу, и критику со смирением.',
    'Я всегда учусь, а не проигрываю. Это часть пути.',
    '«Не знаю» не существует. Есть «разберусь и научусь».',
    'Я никогда не сдаюсь. Даже когда ничего не выходит, у меня всегда есть выбор продолжать бороться.',
    'Я всегда говорю правду. Тонко.',
    'Великие достижения - всегда командная работа.'
  ];

  // Сквозные инструменты: проходят через всю программу и остаются у игрока
  var INVENTORY = [
    { icon: 'shield', name: 'ЛИЧНАЯ КОНСТИТУЦИЯ', text: 'Пять ценностей без компромисса. Пишется в первую неделю и проверяется на худший сценарий.' },
    { icon: 'pyramid', name: 'СВОЯ ПИРАМИДА', text: 'Твои блоки, принципы и приоритеты. От основания до соревновательного величия.' },
    { icon: 'floppy', name: 'ЛИЧНАЯ ОС', text: 'Твоя операционная система игрока. Пересобирается на каждом рубеже программы.' },
    { icon: 'clock', name: 'ОБЗОР ПОСЛЕ ИСПОЛНЕНИЯ', text: 'Три вопроса, пять минут. После каждой тренировки и матча до конца программы.' },
    { icon: 'bolt', name: 'КНОПКА СБРОСА', text: 'Десять секунд, чтобы отпустить плохую смену, выдохнуть и вернуть фокус.' },
    { icon: 'bars', name: 'ЛИСТ НЕДЕЛИ', text: 'Одна страница. Ни одной строки, которую надо считать во время игры.' }
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
  var M_STEP = 0.112; // длительность шестнадцатой, сек (~134 удара в минуту)
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
  var noiseBuf = null;
  function mNoise(t, dur, vol, cutoff) {
    if (!noiseBuf) {
      noiseBuf = audio.createBuffer(1, audio.sampleRate * 0.2, audio.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var n = 0; n < d.length; n++) d[n] = Math.random() * 2 - 1;
    }
    var src = audio.createBufferSource(), f = audio.createBiquadFilter(), gn = audio.createGain();
    src.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = cutoff;
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(gn); gn.connect(musicGain);
    src.start(t); src.stop(t + dur + 0.02);
  }
  function mSchedule() {
    while (mNext < audio.currentTime + 0.35) {
      var st = mStep % 128, i = st % 16, bar = Math.floor(st / 16), ch = M_CHORDS[bar % 4];
      // бас: ровные восьмые с октавным скачком - он и даёт напор
      if (i % 2 === 0) mNote(hz(ch[0] - (i % 4 === 2 ? 12 : 24)), mNext, 0.13, 'triangle', 0.55);
      // арпеджио шестнадцатыми
      mNote(hz(ch[M_ARP[i % 8]] + (i >= 8 ? 12 : 0)), mNext, 0.07, 'square', 0.085);
      // ударные: бочка на каждую долю, малый на вторую и четвёртую, хэт на слабые
      if (i % 4 === 0) mNote(120, mNext, 0.11, 'sine', 0.7, 42);
      if (i === 4 || i === 12) mNoise(mNext, 0.09, 0.28, 1800);
      if (i % 4 === 2) mNoise(mNext, 0.03, 0.12, 7000);
      if (bar % 4 === 3 && i >= 12) mNoise(mNext, 0.05, 0.2, 2500); // сбивка в конце фразы
      var ld = M_LEAD[st];
      if (ld) mNote(hz(ld[0]), mNext, ld[1] * M_STEP * 0.95, 'square', 0.16);
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
    if (musicOn && !musicGain) { musicGain = audio.createGain(); musicGain.gain.value = 0.11; musicGain.connect(audio.destination); }
    mRun(musicOn && !document.hidden);
    musicBtn.setAttribute('aria-pressed', String(musicOn));
    store('ce-music', musicOn ? '1' : '0');
  }
  musicBtn.addEventListener('click', function () { setMusic(!musicOn); });

  // Звук и музыка включены по умолчанию. Браузеры не дают играть звук, пока
  // человек не коснулся страницы, поэтому запускаем их на первом же действии.
  var audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return; audioUnlocked = true;
    ['pointerup', 'keydown', 'click'].forEach(function (ev) { document.removeEventListener(ev, unlockAudio, true); });
    if (store('ce-sound') !== '0') setSound(true);
    if (store('ce-music') !== '0') setMusic(true);
  }
  ['pointerup', 'keydown', 'click'].forEach(function (ev) { document.addEventListener(ev, unlockAudio, true); });
  soundBtn.setAttribute('aria-pressed', String(store('ce-sound') !== '0'));
  musicBtn.setAttribute('aria-pressed', String(store('ce-music') !== '0'));
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
      g.gain.setValueAtTime((vol || 0.06) * 0.42, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
      o.connect(g); g.connect(audio.destination);
      o.start(t); o.stop(t + n[1] + 0.02);
      t += n[1] * 0.85;
    });
  }
  var sfxNoise = null;
  // Рёв трибун и сирена после гола
  function crowdRoar() {
    if (!soundOn || !audio) return;
    var t = audio.currentTime + 0.02, out = audio.destination;
    if (!sfxNoise) {
      sfxNoise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
      var d = sfxNoise.getChannelData(0);
      for (var n = 0; n < d.length; n++) d[n] = Math.random() * 2 - 1;
    }
    // Возглас «ва-а-у-у»: голоса толпы (расстроенные пилы) и немного шума идут
    // через два «гласных» фильтра, которые скользят у → а → у; тон сначала
    // взлетает, потом долго опускается.
    var mix = audio.createGain(), roar = audio.createGain();
    var f1 = audio.createBiquadFilter(), f2 = audio.createBiquadFilter(), g2 = audio.createGain();
    f1.type = 'bandpass'; f1.Q.value = 4; f2.type = 'bandpass'; f2.Q.value = 6; g2.gain.value = 0.6;
    //            «в/у»        «а»              «у-у-у»
    f1.frequency.setValueAtTime(320, t); f1.frequency.linearRampToValueAtTime(780, t + 0.3);
    f1.frequency.setValueAtTime(780, t + 0.55); f1.frequency.linearRampToValueAtTime(340, t + 1.2);
    f2.frequency.setValueAtTime(700, t); f2.frequency.linearRampToValueAtTime(1250, t + 0.3);
    f2.frequency.setValueAtTime(1250, t + 0.55); f2.frequency.linearRampToValueAtTime(760, t + 1.2);
    mix.connect(f1); mix.connect(f2); f1.connect(roar); f2.connect(g2); g2.connect(roar);
    roar.gain.setValueAtTime(0.0001, t);
    roar.gain.exponentialRampToValueAtTime(0.16, t + 0.3);
    roar.gain.setValueAtTime(0.16, t + 0.9);
    roar.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    roar.connect(out);
    for (var v = 0; v < 10; v++) {                 // десять «голосов» разной высоты
      var o = audio.createOscillator(), vg = audio.createGain();
      var base = 120 + Math.random() * 150, st = t + Math.random() * 0.08;
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(base * 0.9, st);
      o.frequency.linearRampToValueAtTime(base * (1.25 + Math.random() * 0.1), st + 0.35);
      o.frequency.linearRampToValueAtTime(base * (0.8 + Math.random() * 0.08), st + 2.4);
      vg.gain.value = 0.12;
      o.connect(vg); vg.connect(mix); o.start(st); o.stop(t + 2.7);
    }
    var src = audio.createBufferSource(), ng = audio.createGain();   // дыхание толпы
    src.buffer = sfxNoise; src.loop = true; ng.gain.value = 0.5;
    src.connect(ng); ng.connect(mix); src.start(t); src.stop(t + 2.7);
    // Аплодисменты: отдельные короткие хлопки, а не сплошное шипение
    for (var c = 0; c < 34; c++) {
      var ct = t + 0.25 + Math.pow(Math.random(), 1.4) * 2.3;
      var cs = audio.createBufferSource(), cb = audio.createBiquadFilter(), cg = audio.createGain();
      cs.buffer = sfxNoise;
      cb.type = 'bandpass'; cb.frequency.value = 900 + Math.random() * 900; cb.Q.value = 1.2;
      cg.gain.setValueAtTime(0.012 + Math.random() * 0.012, ct);
      cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.035);
      cs.connect(cb); cb.connect(cg); cg.connect(out);
      cs.start(ct, Math.random() * 1.5, 0.05);
    }
    [116.5, 174.6].forEach(function (fr) {           // сирена
      var o = audio.createOscillator(), og = audio.createGain();
      o.type = 'sawtooth'; o.frequency.value = fr;
      og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.008, t + 0.05);
      og.gain.setValueAtTime(0.008, t + 0.6); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.9);
    });
  }
  var SFX = {
    crowd: crowdRoar,
    blip: function () { play([[880, 0.04]], 0.03); },
    move: function () { play([[440, 0.05], [660, 0.06]]); },
    select: function () { play([[523, 0.07], [659, 0.07], [784, 0.07], [1047, 0.14]]); },
    locked: function () { play([[140, 0.12, 'sawtooth'], [110, 0.18, 'sawtooth']]); },
    shot: function () { play([[900, 0.09, 'square', 180]], 0.05); },
    goal: function () { play([[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.09], [784, 0.09], [1047, 0.3]], 0.05); },
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

  // Пока посетитель сам не выбрал путь, пути нет: игрок в нейтральной форме
  var currentPath = null;
  var NEUTRAL = { jersey: '#8b9bb4', jerseyDark: '#5a6988', trim: '#ffffff', beard: null, letter: null };
  function look() { return currentPath || NEUTRAL; }
  var narrow = window.matchMedia('(max-width: 760px)');
  var pathsEl = document.getElementById('paths');
  var ctaPathEl = document.getElementById('ctaPath');
  var ctaPick = document.getElementById('ctaPick');
  var cta = document.getElementById('cta');
  var ctaBase = cta.getAttribute('href');
  var pathCards = [];
  var pathPanel = document.getElementById('pathPanel');
  var guideCta = document.getElementById('guideCta');

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

  function signupHref(p) {
    // Выбранный путь подставляется в текст сообщения (работает для ссылок t.me и mailto)
    var msg = 'Здравствуйте! Хочу записаться на Champion\'s Edge.' + (p ? ' Мой путь: ' + p.name.toLowerCase() + '.' : '');
    if (/^https:\/\/t\.me\//.test(ctaBase)) return ctaBase + '?text=' + encodeURIComponent(msg);
    if (/^mailto:/.test(ctaBase)) return ctaBase + '?subject=' + encodeURIComponent('Champion\'s Edge') + '&body=' + encodeURIComponent(msg);
    return ctaBase;
  }

  // На телефоне описание раскрывается сразу под выбранной карточкой, на широком экране - под всеми тремя
  function placePathPanel() {
    var sel = pathCards.filter(function (pc) { return pc.path === currentPath; })[0];
    if (narrow.matches && sel) sel.el.insertAdjacentElement('afterend', pathPanel);
    else pathsEl.appendChild(pathPanel);
  }

  function choosePath(p, byUser, quiet) {
    currentPath = p;
    pathCards.forEach(function (pc) {
      var on = pc.path === p;
      pc.el.setAttribute('aria-checked', String(on));
      pc.el.querySelector('.path__pick').textContent = on ? '★ ВЫБРАН' : 'ВЫБРАТЬ';
    });
    cta.href = signupHref(p);
    ctaPathEl.textContent = p ? p.name : 'НЕ ВЫБРАН';
    ctaPick.hidden = !!p;
    if (p) {
      pathPanel.innerHTML = '<div class="level__top"><span class="level__tag">' + p.num + '</span><h3 class="level__title">' + p.name + '</h3></div>' +
        '<dl class="pathinfo__meta"><div><dt>ЭТАП</dt><dd>' + p.stage + '</dd></div><div><dt>ЦЕЛЬ</dt><dd>' + p.goal + '</dd></div></dl>' +
        '<p>' + p.about + '</p><div class="level__cols"><div><h4>НА ЧТО ДЕЛАЕМ УПОР</h4><ul>' +
        p.focus.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul></div>' +
        '<div><h4>ЧТО ОБЩЕЕ У ВСЕХ ПУТЕЙ</h4><ul><li>Формат один на один с тренером</li><li>Та же программа: 4 фазы, 9 доменов</li><li>Примеры и задания из твоей карьеры и твоего этапа</li></ul></div></div>' +
        '<p class="pathinfo__cta"><a class="btn btn--cta btn--small" href="' + cta.href + '" target="_blank" rel="noopener">▶ ЗАПИСАТЬСЯ НА ЭТОТ ПУТЬ</a></p>';
    } else {
      pathPanel.innerHTML = '<p class="pathinfo__empty">Путь ещё не выбран. Нажми на карточку или забей в одни из ворот на площадке. Здесь появится, на что делаем упор на твоём этапе.</p>';
    }
    placePathPanel();
    drawFace(); drawGuide(); guideCta.href = cta.href;
    if (byUser) {
      store('ce-path', p.id);
      say([p.hello], { label: 'К ОПИСАНИЮ ПУТИ ▼', target: pathPanel });
      if (!quiet) {
        // выбрали карточкой: показываем раскрывшееся описание
        SFX.select(); guideTuck();
        reveal(pathPanel);
      }
    }
  }
  narrow.addEventListener('change', function () { placePathPanel(); placeLevelPanel(); });

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
    drawPlayer(faceCtx, 0, 3, look(), 0, false);
  }

  // Реплика печатается по буквам, но место под весь текст занято сразу:
  // высота рамки не «дышит» и страница под ней не прыгает.
  var dShown = document.createElement('span'), dRest = document.createElement('span');
  dRest.style.visibility = 'hidden';
  dialogText.appendChild(dShown); dialogText.appendChild(dRest);
  function showChars(s, n) { dShown.textContent = s.slice(0, n); dRest.textContent = s.slice(n); }
  function typeLine() {
    clearInterval(typer);
    var s = lines[lineIdx]; charIdx = 0; showChars(s, 0);
    if (reduced) { charIdx = s.length; showChars(s, charIdx); return; }
    typer = setInterval(function () {
      charIdx++;
      showChars(s, charIdx);
      if (charIdx % 3 === 0 && onScreen(dialog)) SFX.blip();
      if (charIdx >= s.length) clearInterval(typer);
    }, 28);
  }
  var dialogNext = dialog.querySelector('.dialog__next');
  var dialogGo = document.getElementById('dialogGo');
  var dialogAction = null;
  function dialogSync() {
    var lastLine = lineIdx === lines.length - 1;
    dialogNext.hidden = lastLine;                       // листать дальше некуда
    dialogGo.hidden = !(lastLine && dialogAction);
    if (dialogAction) dialogGo.textContent = dialogAction.label;
  }
  // action - кнопка на последней реплике: { label, target }
  function say(newLines, action) { lines = newLines; lineIdx = 0; dialogAction = action || null; dialogSync(); typeLine(); }
  function advance() {
    var s = lines[lineIdx];
    if (charIdx < s.length) { clearInterval(typer); charIdx = s.length; showChars(s, charIdx); return; }
    if (lineIdx === lines.length - 1) return;           // последняя реплика: по кругу не ходим
    lineIdx++; dialogSync();
    SFX.move(); typeLine();
  }
  dialogGo.addEventListener('click', function (e) {
    e.stopPropagation(); SFX.move();
    dialogAction.target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
  dialogGo.addEventListener('keydown', function (e) { e.stopPropagation(); });
  dialog.addEventListener('click', advance);
  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); advance(); }
  });

  // Показывает раскрывшийся блок: верх не под шапкой, низ по возможности на экране
  function reveal(el) {
    var r = el.getBoundingClientRect(), top = document.querySelector('.hud').offsetHeight + 14, vh = window.innerHeight;
    var dy = 0;
    if (r.top < top || r.height > vh - top - 12) dy = r.top - top;
    else if (r.bottom > vh - 12) dy = r.bottom - vh + 12;
    if (Math.abs(dy) > 2) window.scrollBy({ top: dy, behavior: reduced ? 'auto' : 'smooth' });
  }
  function onScreen(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  /* =====================================================================
     СЦЕНА: площадка
     ===================================================================== */

  var cv = document.getElementById('scene'), g = cv.getContext('2d');
  // Вид сверху-сбоку: трибуны и борт вверху, трое ворот внизу, бросок - вниз.
  var W = 320, H = 240, ICE_Y = 52, GOAL_Y = 212;
  var scoreEl = document.getElementById('score');
  var keys = {}, score = 0;
  var hero = { x: 60, y: 66, vx: 0, vy: 0, dir: 1, auto: true, autoDir: 1, shootT: 0, idleT: 0, target: null, cruise: null };
  var puck = { x: 0, y: 0, vx: 0, vy: 0, live: false };
  var goalFlash = 0, banner = '', banner2 = '', bannerT = 0, lastZone = -1, cheerT = 0;
  // Трое ворот - по одним на каждый путь чемпиона: [левая штанга, правая штанга]
  var NETS = [[26, 98], [124, 196], [222, 294]];
  var HERO_MIN_X = 4, HERO_MAX_X = 286, HERO_MIN_Y = 28, HERO_MAX_Y = 166;

  // Трибуны - заранее сгенерированные зрители
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
      // после гола трибуна вскакивает и машет руками
      var jump = cheerT > 0 && Math.sin(t / 70 + s.p * 9) > -0.2;
      if (jump) up = 2;
      g.fillStyle = s.c; g.fillRect(x, s.y - up, 3, 4 + up);
      g.fillStyle = '#f2c9a0'; g.fillRect(x + 1, s.y - 1 - up, 1, 1);
      if (jump) { g.fillRect(x, s.y - 2 - up, 1, 2); g.fillRect(x + 2, s.y - 2 - up, 1, 2); }
    });
    // вспышки камер
    for (var f = 0, fn = cheerT > 0 ? 14 : 3; f < fn; f++) {
      var k = Math.floor(t / (cheerT > 0 ? 90 : 180) + f * 37);
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
    g.fillStyle = '#0099db'; g.fillRect(0, 124, W, 4);
    g.fillStyle = '#e43b44';
    [62, 160, 258].forEach(function (dx) { g.fillRect(dx - 2, 172, 4, 4); });
    g.fillRect(0, GOAL_Y, W, 2);

    // трое ворот: цвет - форма пути, выбранный путь подсвечен
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
    drawPlayer(g, Math.round(hero.x), hy, look(), frame, hero.shootT > 0);
    g.restore();

    // шайба
    if (puck.live) {
      g.fillStyle = OUT; g.fillRect(Math.round(puck.x), Math.round(puck.y), 5, 4);
      g.fillStyle = '#5a6988'; g.fillRect(Math.round(puck.x) + 1, Math.round(puck.y) + 1, 3, 1);
    }

    // надпись
    if (bannerT > 0) {
      var by0 = 88 + (bannerT > 60 ? (bannerT - 60) : 0), col = Math.floor(bannerT / 5) % 2 ? '#fee761' : '#ffffff';
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
      // отпустил клавишу - игрок продолжает катиться в ту же сторону
      hero.cruise = { vx: hero.vx, vy: hero.vy };
    } else if (hero.cruise) {
      // тач-режим: катимся без остановки, от бортов отскакиваем
      var cr = hero.cruise;
      hero.auto = false; hero.idleT = 0;
      if ((hero.x <= HERO_MIN_X && cr.vx < 0) || (hero.x >= HERO_MAX_X && cr.vx > 0)) cr.vx *= -1;
      if ((hero.y <= HERO_MIN_Y && cr.vy < 0) || (hero.y >= HERO_MAX_Y && cr.vy > 0)) cr.vy *= -1;
      hero.vx = cr.vx; hero.vy = cr.vy;
    } else if (hero.target !== null) {
      // нажали на лёд: встаём напротив этой точки и бросаем
      var dx = hero.target - hero.x;
      hero.auto = false; hero.idleT = 0;
      if (Math.abs(dx) <= 2) { hero.x = hero.target; hero.target = null; shoot(); hero.auto = true; } // после броска катится дальше
      else hero.vx = dx > 0 ? 2.4 : -2.4;
    } else if (!hero.auto) { hero.idleT += dt; if (hero.idleT > 6000) hero.auto = true; }
    if (hero.auto && hero.shootT <= 0) {
      hero.vx = hero.autoDir * 0.6;
      if (hero.x > 260) hero.autoDir = -1;
      if (hero.x < 24) hero.autoDir = 1;
    }
    if (Math.abs(hero.vx) > 0.3) hero.dir = hero.vx > 0 ? 1 : -1;
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
          lastZone = zone; goalFlash = 70; banner = 'ГОЛ!'; banner2 = PATHS[zone].name; bannerT = 90; cheerT = 130; SFX.goal(); SFX.crowd();
          choosePath(PATHS[zone], true, true);
        } else { banner = 'МИМО!'; banner2 = ''; bannerT = 40; SFX.miss(); }
      }
    }
    if (goalFlash > 0) goalFlash--;
    if (cheerT > 0) cheerT--;
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
    // Пробел оставляем кнопке только если на неё пришли с клавиатуры (Tab)
    if (k === ' ' && e.target !== cv && e.target.matches && e.target.matches('button:focus-visible, a:focus-visible, [role="button"]:focus-visible, input, textarea, select')) return;
    if (k === ' ') { e.preventDefault(); shoot(); return; }
    if (MOVE_KEYS.indexOf(k) >= 0) { keys[k] = true; if (k.length > 1) e.preventDefault(); }
  });
  window.addEventListener('keyup', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[RU_KEYS[k] || k] = false;
  });
  window.addEventListener('blur', function () { keys = {}; });
  // После клика мышью или тапа снимаем фокус с кнопки, чтобы пробел не нажимал её повторно
  document.addEventListener('click', function (e) {
    var a = document.activeElement;
    if (e.detail > 0 && a && a !== cv && a !== document.body && !/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) a.blur();
  });
  function scenePoint(e) {
    var r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  var lastTap = { t: 0, x: 0, y: 0 };
  cv.addEventListener('pointerdown', function (e) {
    var pt = scenePoint(e);
    if (e.pointerType === 'mouse') {
      // мышь: нажал на лёд - игрок встаёт напротив и бросает
      e.preventDefault();
      if (pt.y < ICE_Y) { shoot(); return; }
      hero.cruise = null; // клик мышью отменяет катание по инерции
      hero.target = Math.max(HERO_MIN_X, Math.min(HERO_MAX_X, Math.round(pt.x - 27)));
      return;
    }
    // палец по воротам: игрок встаёт напротив и бросает
    if (pt.y >= GOAL_Y - 12) {
      lastTap.t = 0; hero.cruise = null;
      hero.target = Math.max(HERO_MIN_X, Math.min(HERO_MAX_X, Math.round(pt.x - 27)));
      return;
    }
    // палец по льду: игрок катится сам, тап задаёт направление, двойной тап - бросок
    var now = e.timeStamp;
    if (now - lastTap.t < 320 && Math.abs(pt.x - lastTap.x) < 40 && Math.abs(pt.y - lastTap.y) < 40) {
      lastTap.t = 0; shoot(); return;
    }
    lastTap = { t: now, x: pt.x, y: pt.y };
    var dx = pt.x - (hero.x + 12), dy = pt.y - (hero.y + 30), d = Math.hypot(dx, dy) || 1;
    hero.target = null;
    hero.cruise = { vx: dx / d * 1.5, vy: dy / d * 1.5 };
  });

  /* =====================================================================
     КАРТА УРОВНЕЙ
     ===================================================================== */

  var worldsEl = document.getElementById('worlds');
  var levelPanel = document.getElementById('levelPanel');
  var phaseTabs = document.getElementById('phaseTabs');
  var phaseInfo = document.getElementById('phaseInfo');
  var nodes = [];          // уровни выбранной фазы: { el, lv, row } (row - уровни того же мира)
  var phaseIdx = 0, levelIdx = 0;

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function list(arr) { return '<ul>' + arr.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>'; }

  PHASES.forEach(function (ph, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'phase'; b.setAttribute('role', 'tab');
    b.innerHTML = '<span class="phase__num">ФАЗА ' + (i + 1) + '</span>' + ph.name;
    b.addEventListener('click', function () { openPhase(i, true); });
    phaseTabs.appendChild(b);
  });

  function openPhase(i, byUser) {
    var ph = PHASES[i];
    phaseIdx = i; nodes = [];
    [].forEach.call(phaseTabs.children, function (t, k) { t.setAttribute('aria-selected', String(k === i)); });
    phaseInfo.innerHTML = '<span class="phase__when">' + ph.when + '</span>' + esc(ph.task);
    section.appendChild(levelPanel);              // вынимаем панель, прежде чем перерисовать уровни
    worldsEl.innerHTML = '';
    ph.worlds.forEach(function (w) {
      var el = document.createElement('div'); el.className = 'world';
      el.innerHTML = '<div class="world__head"><span class="world__name">' + w.name + '</span><span class="world__sub">' + w.sub + '</span></div>';
      var pathEl = document.createElement('div'); pathEl.className = 'world__path world__path--' + w.levels.length;
      var row = [];
      w.levels.forEach(function (lv) {
        var idx = nodes.length, b = document.createElement('button');
        b.type = 'button'; b.className = 'node' + (lv.locked ? ' node--locked' : '');
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="node__tile"><canvas aria-hidden="true"></canvas></span>' +
          '<span class="node__num">' + lv.num + '</span>' + (lv.title || '???');
        drawIcon(b.querySelector('canvas'), lv.locked ? 'lock' : lv.icon);
        b.addEventListener('click', function () { openLevel(idx, true); });
        pathEl.appendChild(b); row.push(b); nodes.push({ el: b, lv: lv, row: row });
      });
      el.appendChild(pathEl); worldsEl.appendChild(el);
    });
    openLevel(0, false);
    if (byUser) SFX.move();
  }

  // На телефоне описание уровня раскрывается под рядом, в котором стоит нажатый уровень
  var section = document.getElementById('map'), mapNote = section.querySelector('.map__note');
  function placeLevelPanel() {
    var n = nodes[levelIdx];
    if (narrow.matches && n) {
      var k = n.row.indexOf(n.el);
      n.row[Math.min(k - k % 2 + 1, n.row.length - 1)].insertAdjacentElement('afterend', levelPanel);
    } else section.insertBefore(levelPanel, mapNote);
  }
  function openLevel(idx, byUser) {
    var lv = nodes[idx].lv;
    levelIdx = idx; placeLevelPanel();
    if (byUser) guideTuck();
    if (byUser) setTimeout(function () { reveal(levelPanel); }, 0);
    nodes.forEach(function (n, i) { n.el.setAttribute('aria-pressed', String(i === idx)); });
    if (lv.locked) {
      levelPanel.innerHTML = '<div class="level__top"><span class="level__tag">' + lv.num + '</span><h3 class="level__title">' + (lv.title || '???') + ' · ЗАКРЫТО</h3></div>' +
        '<p>Этот уровень пока закрыт. Он откроется в процессе игры.</p>';
      if (byUser) SFX.locked();
      return;
    }
    var html = '<div class="level__top"><span class="level__tag' + (lv.boss ? ' level__tag--boss' : '') + '">' + (lv.boss ? 'ВОРОТА · ' : '') + lv.num + '</span>' +
      '<h3 class="level__title">' + lv.title + '</h3></div>' +
      '<p class="level__q">«' + esc(lv.q) + '»</p><p>' + esc(lv.text) + '</p><div class="level__cols">';
    if (lv.sessions) html += '<div><h4>СЕССИИ НЕДЕЛИ</h4>' + list(lv.sessions) + '</div>';
    html += '<div><h4>ТРОФЕИ УРОВНЯ</h4>' + list(lv.loot) + '</div></div>';
    levelPanel.innerHTML = html;
    if (byUser) SFX.select();
  }

  /* =====================================================================
     ДОМЕНЫ И ПРИНЦИПЫ
     ===================================================================== */

  var domEl = document.getElementById('domainList');
  DOMAINS.forEach(function (d, i) {
    var el = document.createElement('div'); el.className = 'panel item';
    el.innerHTML = '<canvas aria-hidden="true"></canvas><div><b>' + (i + 1) + '. ' + d.name + '</b><span>' + d.text + '</span></div>';
    drawIcon(el.querySelector('canvas'), d.icon);
    domEl.appendChild(el);
  });
  var codeEl = document.getElementById('principles');
  PRINCIPLES.forEach(function (t) {
    var li = document.createElement('li'); li.textContent = t; codeEl.appendChild(li);
  });

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
    { id: 'path', text: 'Здесь три пути чемпиона. Нажми на карточку: под ней появится, на что делаем упор именно на твоём этапе.' },
    { id: 'about', text: 'Коротко о формате: один на один с тренером, 12 месяцев, старт в любой точке сезона.' },
    { id: 'map', text: 'Это карта программы. Переключай фазы и нажимай на уровни: внутри тема, сессии и трофеи. Замки откроются в процессе игры.' },
    { id: 'domains', text: 'Девять доменов. Это ветки навыков, которые программа прокачивает за год.' },
    { id: 'loot', text: 'А это ты унесёшь с собой. Инструменты проходят через всю программу и остаются у тебя.' },
    { id: 'code', text: 'Кодекс. Девять принципов, на которых стоит программа.' },
    { id: 'science', text: 'А это лор: откуда взялась методика и на чьи идеи она опирается.' },
    { id: 'start', text: 'Готов? Жми «Записаться»: откроется Telegram с готовым сообщением.' }
  ];
  var guideEl = document.getElementById('guide');
  var guideText = document.getElementById('guideText');
  var guideNext = document.getElementById('guideNext');
  var guideBubble = document.getElementById('guideBubble');
  var guideCtx = document.getElementById('guideHero').querySelector('canvas').getContext('2d');
  var guideIdx = -1, guideClosed = store('ce-guide') === '0';

  function drawGuide() {
    guideCtx.clearRect(0, 0, 32, 40);
    drawPlayer(guideCtx, 1, 4, look(), 0, false);
  }
  function guideSync() {
    // какой раздел сейчас перед глазами
    var idx = -1, mid = window.innerHeight * 0.55;
    GUIDE.forEach(function (gd, i) { if (document.getElementById(gd.id).getBoundingClientRect().top < mid) idx = i; });
    // на титуле и рядом с репликой под площадкой проводник не дублируется
    // пока читатель на площадке, говорит реплика под ней; у кнопки записи проводник её не загораживает
    guideEl.hidden = idx < 0 || onScreen(cta);
    if (idx < 0 || idx === guideIdx) return;
    guideIdx = idx;
    // в новом разделе подсказка возвращается; на телефоне она свёрнута, а на проводнике загорается метка
    guideBubble.hidden = guideClosed || narrow.matches;
    guideEl.classList.toggle('guide--new', guideBubble.hidden);
    guideOpenY = window.scrollY;
    guideText.textContent = GUIDE[idx].text;
    var lastStep = idx === GUIDE.length - 1;
    guideNext.hidden = lastStep; guideCta.hidden = !lastStep;
  }
  // На телефоне подсказка прячется, когда человек раскрыл описание, чтобы не закрывать текст
  function guideTuck() { if (narrow.matches) guideBubble.hidden = true; }
  function guideShow(open) {
    guideBubble.hidden = !open;
    if (!narrow.matches) { guideClosed = !open; store('ce-guide', open ? '1' : '0'); }
  }
  guideNext.addEventListener('click', function () {
    var target = document.getElementById(GUIDE[guideIdx + 1].id);
    SFX.move(); target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
  document.getElementById('guideClose').addEventListener('click', function () { SFX.move(); guideShow(false); });
  document.getElementById('guideHero').addEventListener('click', function () { SFX.move(); guideShow(guideBubble.hidden); guideOpenY = window.scrollY; guideEl.classList.remove('guide--new'); });
  var guideTick = false;
  var guideOpenY = 0, tight = window.matchMedia('(max-width: 1500px)');
  function guideOnScroll() {
    // на телефоне открытая подсказка прячется, как только страницу начали листать
    // на экранах, где у подсказки нет свободного поля сбоку, она тоже не висит над текстом:
    // показалась в новом разделе и убралась, когда читатель пролистал дальше
    var moved = Math.abs(window.scrollY - guideOpenY);
    if (!guideBubble.hidden && ((narrow.matches && moved > 40) || (tight.matches && moved > 260))) {
      guideBubble.hidden = true; guideEl.classList.add('guide--new');
    }
    if (guideTick) return; guideTick = true;
    requestAnimationFrame(function () { guideTick = false; guideSync(); });
  }
  window.addEventListener('scroll', guideOnScroll, { passive: true });
  window.addEventListener('resize', guideOnScroll);
  guideBubble.hidden = guideClosed || narrow.matches;

  /* =====================================================================
     ЗАПУСК
     ===================================================================== */

  // портреты на карточках путей
  pathCards.forEach(function (pc) {
    var c = pc.el.querySelector('canvas'); c.width = 32; c.height = 40;
    drawPlayer(pc.ctx, 1, 4, pc.path, 0, false);
  });

  var saved = store('ce-path');
  choosePath(PATHS.filter(function (p) { return p.id === saved; })[0] || null, false);
  openPhase(0, false);

  say([
    'Привет! Я твой проводник по Champion\'s Edge.',
    'Это программа индивидуального развития профессиональных атлетов. Один на один с тренером.',
    'Программа идёт 12 месяцев: 4 фазы, 45 недель. Первый месяц можно пройти отдельно, как вводный курс.',
    'Выбери свой путь чемпиона броском: внизу трое ворот, у каждых свой путь. Забей в нужные.'
  ], { label: 'ИЛИ ВЫБРАТЬ КАРТОЧКОЙ ▼', target: document.getElementById('path') });

  document.getElementById('pressStart').addEventListener('click', function () {
    unlockAudio();
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
