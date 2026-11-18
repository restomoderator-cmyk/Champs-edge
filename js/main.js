(function () {
  'use strict';

  // Аналитика и параметры адреса, см. js/site-params.js. Если этот файл не загрузился
  // (например, его срезал блокировщик), сайт работает без аналитики.
  var TR = window.CE_TRACK || {
    r: null, role: null, path: null, utm: {},
    consent: function () { return 'no'; }, setConsent: function () {}, goal: function () { return false; }, goalOnce: function () {},
    urlWith: function (k, v) {
      var parts = location.search.replace(/^\?/, '').split('&').filter(function (p) { return p && p.split('=')[0] !== k; });
      parts.push(k + '=' + encodeURIComponent(v));
      return location.pathname + '?' + parts.join('&') + location.hash;
    }
  };

  /* =====================================================================
     ЯЗЫК: русский или английский
     ===================================================================== */
  // Порядок выбора: ?lang=en в адресе, сохранённый выбор, язык браузера.
  var LANG = (function () {
    var q = /[?&]lang=(ru|en)\b/.exec(location.search), saved = store('ce-lang');
    if (q) { store('ce-lang', q[1]); return q[1]; }
    if (saved === 'ru' || saved === 'en') return saved;
    return /^(ru|uk|be|kk)\b/i.test(navigator.language || '') ? 'ru' : 'en';
  })();
  // Вид спорта. У каждого есть своя страница: /hockey/ и /tennis/ (собираются из index.html
  // скриптом tools/make-sport-pages.py). На главной: ?sport=tennis в адресе или сохранённый выбор,
  // по умолчанию хоккей.
  var HAS_PAGES = document.documentElement.hasAttribute('data-pages');          // в предпросмотре одним файлом страниц нет
  var SPORT_PAGE = document.documentElement.getAttribute('data-sport-page');
  var SPORT = (function () {
    if (SPORT_PAGE === 'hockey' || SPORT_PAGE === 'tennis') { store('ce-sport', SPORT_PAGE); return SPORT_PAGE; }
    var q = /[?&]sport=(hockey|tennis)\b/.exec(location.search);
    if (q) { store('ce-sport', q[1]); return q[1]; }
    return store('ce-sport') === 'tennis' ? 'tennis' : 'hockey';
  })();
  var TENNIS = SPORT === 'tennis';
  document.documentElement.setAttribute('data-sport', SPORT);
  var SDICT = TENNIS && window.CE_TENNIS || null;   // хоккейная строка → теннисная
  // Роль посетителя известна до сборки страницы: агент, клуб и тренер читают сайт в своей редакции
  // (на «вы», об игроке в третьем лице), см. js/voice-pro.js.
  var ROLE0 = TR.role || store('ce-role') || 'player';
  var PRO = ROLE0 === 'agent' || ROLE0 === 'club' || ROLE0 === 'coach';
  var VDICT = PRO && window.CE_PRO || null;
  var DICT = LANG === 'en' && window.CE_EN || null;
  // Перевод строки. Всё, чего нет в словаре, остаётся по-русски.
  function T(s) {
    if (SDICT && Object.prototype.hasOwnProperty.call(SDICT, s)) s = SDICT[s];     // сначала вид спорта
    if (VDICT && Object.prototype.hasOwnProperty.call(VDICT, s)) s = VDICT[s];     // потом редакция для профессионалов
    return DICT && Object.prototype.hasOwnProperty.call(DICT, s) ? DICT[s] : s;   // потом язык
  }
  document.documentElement.lang = LANG;
  if (LANG === 'en') {
    var enWho = SPORT_PAGE === 'tennis' ? 'tennis players' : SPORT_PAGE === 'hockey' ? 'hockey players' : 'athletes';
    document.title = "Champion's Edge" + (SPORT_PAGE === 'tennis' ? ' Tennis' : SPORT_PAGE === 'hockey' ? ' Hockey' : '') + ': individual development for professional ' + enWho;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', 'An individual development program for professional ' + (SPORT_PAGE ? enWho : 'hockey players and athletes') + '. Built on years of studying champions and coaches across 6 sports. Online.');
  }
  // Тексты, которые стоят прямо в разметке, и подписи для экранных читалок
  if (DICT || SDICT || VDICT) (function () {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), node, list = [];
    while ((node = walker.nextNode())) list.push(node);
    list.forEach(function (nd) {
      var raw = nd.nodeValue, key = raw.replace(/\s+/g, ' ').trim();
      var out = key && T(key);
      if (!key || out === key) return;
      nd.nodeValue = raw.replace(/^(\s*)[\s\S]*?(\s*)$/, function (m, a, b) { return a + out + b; });
    });
    [].forEach.call(document.querySelectorAll('[aria-label]'), function (el) { el.setAttribute('aria-label', T(el.getAttribute('aria-label'))); });
  })();
  (function () {
    var btn = document.getElementById('langToggle'), other = LANG === 'en' ? 'ru' : 'en';
    btn.textContent = other.toUpperCase();
    btn.setAttribute('aria-label', other === 'en' ? 'Switch to English' : 'Переключить на русский');
    btn.addEventListener('click', function () {
      store('ce-lang', other);
      if (store('ce-lang') === other && !/[?&]lang=/.test(location.search)) location.reload();
      else location.href = TR.urlWith('lang', other);  // язык в адресе; остальные параметры и hash сохраняются
    });
  })();

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
      id: 'young', num: T('МОЛОДОЙ ИГРОК'), short: T('ТАЛАНТ'), name: T('ПУТЬ ТАЛАНТА'),
      who: T('Для молодых игроков от 18 лет'),
      text: T('Ты в самом начале карьеры. Закладываем фундамент, на котором она будет строиться.'),
      stage: T('Начало карьеры'), goal: T('Заложить фундамент'),
      about: T('Впереди вся карьера, и привычки ещё не затвердели. Сейчас легче всего выстроить правильное мышление: потом оно будет работать на тебя годами, а переучиваться всегда дороже.'),
      focus: [T('Понять, кто ты как игрок, раньше, чем это решат за тебя'), T('Научиться учиться: ошибка - это материал, а не приговор'), T('Собрать первые рабочие инструменты до того, как вырастут ставки')],
      jersey: '#63c74d', jerseyDark: '#3e8948', trim: '#ffffff', beard: null, letter: null,
      helloOther: T('Путь таланта. Для игрока в начале карьеры: закладываем надёжный фундамент на годы вперёд.'),
      hello: T('Ты выбрал путь таланта. Карьера только начинается, самое время заложить надёжный фундамент на всю карьеру.')
    },
    {
      id: 'peak', num: T('ИГРОК НА ПИКЕ'), short: T('ГЕРОЙ'), name: T('ПУТЬ ГЕРОЯ'),
      who: T('Для сильных игроков'),
      text: T('Ты уже хорошо играешь и хочешь стать лучшим. Ищем то, что отделяет хорошего игрока от великого.'),
      stage: T('Расцвет карьеры'), goal: T('Из хорошего в лучшие'),
      about: T('Мастерство и физика у тебя уже есть. Как и у твоих соперников. На этом уровне разницу делает голова: кто надёжнее играет, когда всё решается.'),
      focus: [T('Решающие моменты: играть их так же, как обычные'), T('Стабильность: лучшая игра не раз в месяц, а из матча в матч'), T('Состояние потока по запросу, а не по везению')],
      jersey: '#e43b44', jerseyDark: '#9e2835', trim: '#ffffff', beard: null, letter: 'C',
      helloOther: T('Путь героя. Для игрока, который уже хорош и должен стать лучшим.'),
      hello: T('Ты выбрал путь героя, а славу героям приносят испытания. Пора становиться лучшим.')
    },
    {
      id: 'veteran', num: T('ИГРОК 32+'), short: T('ЛЕГЕНДА'), name: T('ПУТЬ ЛЕГЕНДЫ'),
      who: T('Для игроков 32+'),
      text: T('Ты многого добился и хочешь продлить или перезагрузить карьеру. Собираем систему под новый этап.'),
      stage: T('Зрелая карьера, 32+'), goal: T('Продлить или перезагрузить карьеру'),
      about: T('У тебя есть то, чего нет у молодых: опыт. Задача в том, чтобы он работал на тебя, пока тело требует всё больше внимания, а роль в команде меняется.'),
      focus: [T('Восстановление как часть профессии: сон, дыхание, длинный сезон'), T('Адаптация тренировок и роли для максимального продления карьеры'), T('Опыт вместо запаса сил: играть умнее, а не больше')],
      jersey: '#3b55b8', jerseyDark: '#1b2a6b', trim: '#feae34', beard: '#8b9bb4', letter: 'A',
      helloOther: T('Путь легенды. Для игрока 32+, который хочет продлить карьеру.'),
      hello: T('Ты выбрал путь легенды. У тебя уже есть всё, о чём ты мечтал. Продлим эту сказку по максимуму!')
    }
  ];

  // Роли. Сайт написан для игрока; агент, клуб и тренер видят те же разделы,
  // но обращение, кнопки и текст сообщения меняются под них.
  var ROLES = [
    { id: 'player', name: T('ИГРОК'), desc: T('Хочу пройти программу сам.'),
      hi: T('Привет! Я твой проводник по Champion\'s Edge.'),
      aim: T('Выбери свой путь чемпиона броском: внизу трое ворот, у каждых свой путь. Забей в нужные.'),
      pathLead: T('Три пути для трёх этапов карьеры. Выбери свой броском на площадке или карточкой здесь: проводник и запись на программу подстроятся под него.'),
      ready: T('ГОТОВ?'), pathLabel: T('ТВОЙ ПУТЬ:'), button: T('ЗАПИСАТЬСЯ'), panelButton: T('ЗАПИСАТЬСЯ НА ЭТОТ ПУТЬ'),
      ctaText: T('Напиши нам. Расскажем, как всё устроено, и создадим вместе твой путь под твоё амплуа и цели.'),
      msg: T('Здравствуйте! Хочу записаться на Champion\'s Edge.'), msgPath: T(' Мой путь: '),
      steps: [[T('НАПИШИ'), T('В Telegram или на почту. Одного сообщения достаточно.')],
        [T('ЗНАКОМСТВО'), T('Бесплатный созвон на 15–20 минут. Понимаем, подходим ли мы друг другу.')],
        [T('ВВОДНАЯ ВСТРЕЧА'), T('Около трёх часов. Разбираем твою ситуацию и проводим первую сессию. Если идёшь в программу, первая сессия бесплатно.')],
        [T('СТАРТ'), T('Собираем твой путь под амплуа и цели и начинаем. В любой точке сезона.')]] },
    { id: 'agent', name: T('АГЕНТ'), desc: T('Ищу программу для своих игроков.'), who: T('вашего игрока'),
      button: T('ОБСУДИТЬ ИГРОКА'), ctaText: T('Напишите нам. Расскажем, как всё устроено, и обсудим программу для вашего игрока.'),
      msg: T('Здравствуйте! Я агент. Хочу обсудить Champion\'s Edge для своего игрока.') },
    { id: 'club', name: T('КЛУБ'), desc: T('Хотим усилить игроков команды.'), who: T('ваших игроков'),
      button: T('ОБСУДИТЬ ИГРОКОВ'), ctaText: T('Напишите нам. Расскажем, как всё устроено, и обсудим программу для игроков вашей команды.'),
      msg: T('Здравствуйте! Я представляю клуб. Хочу обсудить Champion\'s Edge для игроков команды.') },
    { id: 'coach', name: T('ТРЕНЕР'), desc: T('Работаю с игроком и хочу действовать вместе.'), who: T('вашего игрока'),
      button: T('ОБСУДИТЬ РАБОТУ'), ctaText: T('Напишите нам. Расскажем, как всё устроено, и обсудим, как выстроить работу с вашим игроком вместе.'),
      msg: T('Здравствуйте! Я тренер. Хочу обсудить Champion\'s Edge для игрока, с которым работаю.') }
  ];
  // Редакции для агента, клуба и тренера: свои реплики проводника, заметка под каждым путём,
  // блок «Что это даёт», свой заход в разделе о программе и свои шаги.
  var ROLE_PRO = {
   "agent": {
    "hi": "Здравствуйте! Я проводник по Champion's Edge. Покажу программу глазами агента.",
    "intro": [
     "Это программа индивидуального развития профессиональных атлетов: год системной работы с игроком.",
     "Игрок выходит из неё сильнее и стабильнее. А сильный игрок сам меняет разговор о своём будущем."
    ],
    "aim": "Выберите путь игрока броском по воротам: у каждых ворот свой этап карьеры.",
    "pathLead": "Три пути для трёх этапов карьеры. Выберите тот, на котором сейчас игрок: броском на площадке или карточкой здесь.",
    "pathNote": {
     "young": "Для агента: фундамент, заложенный сейчас, работает на всю карьеру игрока. Чем раньше он появится, тем длиннее и успешнее карьера.",
     "peak": "Для агента: на пике всё решают стабильность и решающие матчи. Именно они делают игрока тем, за кого борются.",
     "veteran": "Для агента: каждый сезон на высоком уровне ценен. Работаем на то, чтобы их было больше."
    },
    "benefits": {
     "title": "ЧТО ЭТО ДАЁТ АГЕНТУ",
     "items": [
      [
       "ИГРОК РАСТЁТ",
       "Стабильнее играет, надёжнее в решающих матчах, быстрее возвращается после неудач. Это видно в игре."
      ],
      [
       "СИЛЬНЕЕ ПОЗИЦИЯ",
       "Игрок, который прибавляет из сезона в сезон, сам становится главным аргументом в разговоре о его будущем."
      ],
      [
       "ДОЛГАЯ КАРЬЕРА",
       "Система привычек и восстановления работает на годы вперёд, а не на один сезон."
      ],
      [
       "ВСЁ ВНУТРИ СВЯЗКИ",
       "Работаем в связке: игрок, вы и мы. Всё, что обсуждается, остаётся внутри неё."
      ]
     ]
    },
    "aboutLead": "Вы ведёте карьеру игрока. Мы работаем с тем, от чего она зависит изнутри: с головой, привычками и системой жизни профессионала.",
    "steps": [
     [
      "НАПИШИТЕ",
      "В Telegram или на почту. Одного сообщения достаточно."
     ],
     [
      "ЗНАКОМСТВО",
      "Бесплатный созвон на 15–20 минут. Обсуждаем игрока, его этап и задачу."
     ],
     [
      "ВВОДНАЯ ВСТРЕЧА",
      "Около трёх часов с игроком: разбор его ситуации и первая сессия. Если игрок идёт в программу, первая сессия бесплатно."
     ],
     [
      "СТАРТ",
      "Собираем путь игрока под его этап и цели. Можно привести и двоих: есть работа в паре и в группе до четырёх человек."
     ]
    ],
    "ctaText": "Напишите нам. Обсудим вашего игрока: где он сейчас и что программа может ему дать."
   },
   "club": {
    "hi": "Здравствуйте! Я проводник по Champion's Edge. Покажу программу глазами клуба.",
    "intro": [
     "Это программа индивидуального развития профессиональных атлетов: год системной работы с игроком.",
     "Игрок прибавляет во всём: в голове, в теле, в игре. Помогаем клубу вырастить и раскрыть его."
    ],
    "aim": "Выберите путь игрока броском по воротам: у каждых ворот свой этап карьеры.",
    "pathLead": "Три пути для трёх этапов карьеры. Выберите тот, на котором сейчас игрок: броском на площадке или карточкой здесь.",
    "pathNote": {
     "young": "Для клуба: молодой игрок быстрее взрослеет и раньше начинает приносить пользу команде.",
     "peak": "Для клуба: лидер, который играет надёжно, когда всё решается, тянет за собой команду.",
     "veteran": "Для клуба: опытный игрок дольше остаётся в строю и передаёт свой опыт молодым."
    },
    "benefits": {
     "title": "ЧТО ЭТО ДАЁТ КЛУБУ",
     "items": [
      [
       "АПГРЕЙД ИГРОКА",
       "Игрок прибавляет по всем параметрам: ментальным, физическим и игровым."
      ],
      [
       "РАСКРЫТЫЙ ПОТЕНЦИАЛ",
       "Помогаем вырастить игрока для клуба и раскрыть то, что в нём уже есть."
      ],
      [
       "ОДИН, ПАРА ИЛИ ГРУППА",
       "Можно завести одного игрока или нескольких сразу. Работа идёт индивидуально, в парах или в группе до четырёх человек."
      ],
      [
       "ВСЁ ВНУТРИ СВЯЗКИ",
       "Работаем в связке: игрок, клуб и мы. Всё, что обсуждается, остаётся внутри неё."
      ]
     ]
    },
    "aboutLead": "У клуба есть тренировочный процесс. Мы добавляем к нему то, на что в плотном сезоне редко остаётся время: личную работу с игроком.",
    "steps": [
     [
      "НАПИШИТЕ",
      "В Telegram или на почту. Одного сообщения достаточно."
     ],
     [
      "ЗНАКОМСТВО",
      "Бесплатный созвон на 15–20 минут. Обсуждаем игроков и задачу клуба."
     ],
     [
      "ВВОДНАЯ ВСТРЕЧА",
      "Около трёх часов с игроком: разбор его ситуации и первая сессия. Если игрок идёт в программу, первая сессия бесплатно."
     ],
     [
      "СТАРТ",
      "Собираем формат под клуб: индивидуально, в парах или в группе до четырёх. Условия для нескольких игроков обсуждаем отдельно."
     ]
    ],
    "ctaText": "Напишите нам. Обсудим игроков вашей команды и формат, который подойдёт клубу."
   },
   "coach": {
    "hi": "Здравствуйте! Я проводник по Champion's Edge. Покажу программу глазами тренера.",
    "intro": [
     "Это программа индивидуального развития профессиональных атлетов: год системной работы с игроком.",
     "Мы не заменяем вашу работу, а усиливаем её: сверяемся с вами в начале и на каждой фазе."
    ],
    "aim": "Выберите путь игрока броском по воротам: у каждых ворот свой этап карьеры.",
    "pathLead": "Три пути для трёх этапов карьеры. Выберите тот, на котором сейчас игрок: броском на площадке или карточкой здесь.",
    "pathNote": {
     "young": "Для тренера: игрок учится учиться, и ваши подсказки начинают доходить быстрее.",
     "peak": "Для тренера: игрок надёжнее выполняет план, когда цена ошибки высока.",
     "veteran": "Для тренера: опытный игрок берёт на себя больше и помогает вам с молодыми."
    },
    "benefits": {
     "title": "ЧТО ЭТО ДАЁТ ТРЕНЕРУ",
     "items": [
      [
       "ВАШИ ЗАДАЧИ В ОСНОВЕ",
       "В начале сверяемся с вами: что вы видите в игроке и какие задачи ставите. Программа работает на них."
      ],
      [
       "ЧЕТЫРЕ СВЕРКИ",
       "Сверяемся с вами на каждой фазе, четыре раза за программу, и подстраиваем акценты."
      ],
      [
       "ИГРОК ВОСПРИИМЧИВЕЕ",
       "Лучше слышит обратную связь, быстрее отпускает ошибку и возвращается в игру."
      ],
      [
       "ВСЁ ВНУТРИ СВЯЗКИ",
       "Работаем в связке: игрок, вы и мы. Всё, что обсуждается, остаётся внутри неё."
      ]
     ]
    },
    "aboutLead": "Вы работаете с игроком каждый день. Мы берём на себя то, что остаётся за пределами тренировки: голову, привычки и систему жизни профессионала.",
    "steps": [
     [
      "НАПИШИТЕ",
      "В Telegram или на почту. Одного сообщения достаточно."
     ],
     [
      "ЗНАКОМСТВО",
      "Бесплатный созвон на 15–20 минут. Обсуждаем игрока и то, как вы видите его задачи."
     ],
     [
      "ВВОДНАЯ ВСТРЕЧА",
      "Около трёх часов с игроком: разбор его ситуации и первая сессия. Если игрок идёт в программу, первая сессия бесплатно."
     ],
     [
      "СТАРТ",
      "Сверяем задачи с вами и начинаем. Дальше сверяемся на каждой фазе: четыре раза за программу."
     ]
    ],
    "ctaText": "Напишите нам. Обсудим вашего игрока и то, как выстроить работу вместе."
   }
  };
  function tAll(x) {
    if (typeof x === 'string') return T(x);
    if (Array.isArray(x)) return x.map(tAll);
    var o = {}; for (var k in x) o[k] = tAll(x[k]); return o;
  }
  ROLES.slice(1).forEach(function (r) {
    var d = tAll(ROLE_PRO[r.id]);
    for (var k in d) r[k] = d[k];
    r.ready = T('ГОТОВЫ?'); r.pathLabel = T('ПУТЬ ИГРОКА:'); r.panelButton = r.button; r.msgPath = T(' Путь: ');
  });

  // Программа: 12 месяцев, 4 фазы, 45 недель. Фаза 1 расписана по неделям
  // (недели 1-6 открыты, 7-12 под замком), фазы 2-4 показаны по месяцам под замком:
  // по задумке закрытые уровни открываются в процессе игры.
  // sessions - названия сессий недели, loot - что игрок уносит с уровня.
  var LOCKED = { locked: true };
  var PHASES = [
    { name: T('ФУНДАМЕНТ'), when: T('МЕСЯЦЫ 1–3 · НЕДЕЛИ 1–12'),
      task: T('Строим систему: личность, привычки, ментальная база, первые шаги в эмоциях и командной работе. Самый плотный период программы.'),
      worlds: [
        { name: T('МЕСЯЦ 1 · «ПРОБУЖДЕНИЕ»'), sub: T('личность, мышление, фокус'), levels: [
          { num: T('НЕДЕЛЯ 1'), icon: 'pyramid', title: T('ЛИЧНОСТЬ И ХАРАКТЕР'), q: T('Кто ты до того, что ты делаешь?'),
            text: T('Начинаем с личности, а не с результата. Кто ты в тот день, когда тебя не поставили в состав? Учимся не определять себя через голы, очки и номер звена.'),
            sessions: [T('Кто ты до того, что ты делаешь'), T('Пирамида: с основания'), T('Система 1%'), T('Твоя операционная система')],
            loot: [T('Личная Конституция: ценности без компромисса'), T('Первая версия личной ОС'), T('Микропривычка на 1% в день')] },
          { num: T('НЕДЕЛЯ 2'), icon: 'arrow', title: T('МЫШЛЕНИЕ РОСТА'), q: T('Как ты растёшь?'),
            text: T('Фиксированное и растущее мышление, осознанная практика, уроки из неудач. Как фиксированное мышление прячется в хоккее: «руки не те», «я не бомбардир», «меня не видят».'),
            sessions: [T('Фиксированное мышление и растущее мышление'), T('Осознанная практика'), T('Внутренняя игра: утихомирить Я-1'), T('Твоя система обучения')],
            loot: [T('Обзор после исполнения: три вопроса, пять минут'), T('Язык роста вместо фиксированного')] },
          { num: T('НЕДЕЛЯ 3'), icon: 'target', title: T('КОНЦЕНТРАЦИЯ И ФОКУС'), q: T('Куда ты смотришь?'),
            text: T('Ментальные навыки, которые отделяют хорошего от великого. Фокус, сброс и визуализация собираются в единую систему.'),
            sessions: [T('Наука фокуса'), T('Кнопка сброса'), T('Визуализация: увидеть до того, как сделать'), T('Ментальный набор')],
            loot: [T('Кнопка сброса на 10 секунд'), T('Личный триггер фокуса'), T('Весь ментальный набор на одной карточке')] },
          { num: T('НЕДЕЛЯ 4'), icon: 'star', title: T('ИНТЕГРАЦИЯ'), q: T('Что прижилось за месяц?'), boss: true,
            text: T('Закрытие первого месяца. Собираем всё вместе: Конституцию, Пирамиду, ОС и ментальный набор. Смотрим на данные четырёх недель: что прижилось, а что нет.'),
            sessions: [T('Препятствие как путь'), T('Твоя личная Пирамида'), T('Пересборка ОС по итогам месяца')],
            loot: [T('Своя Пирамида'), T('ОС, пересобранная на данных месяца')] }
        ] },
        { name: T('МЕСЯЦ 2 · «ГЛУБЖЕ»'), sub: T('от инструментов к состоянию'), levels: [
          { num: T('НЕДЕЛЯ 5'), icon: 'wave', title: T('СОСТОЯНИЕ ПОТОКА'), q: T('Как войти в зону?'),
            text: T('Наука пиковой игры. Поток в смене: когда игра «замедляется». Разбираем твой лучший матч сезона и то, что ему предшествовало.'),
            sessions: [T('Анатомия потока'), T('Осознанная практика встречает поток'), T('Интеграция недели')],
            loot: [T('Карта триггеров потока')] },
          { num: T('НЕДЕЛЯ 6'), icon: 'flame', title: T('ИНСТИНКТ УБИЙЦЫ'), q: T('Кто берёт шайбу в последней минуте?'),
            text: T('Соревновательное мышление и разум воина. Действие без колебания. Злость, которая забивает, и злость, которая едет на две минуты.'),
            sessions: [T('Хороший, великий, неудержимый'), T('Разум воина'), T('Баланс драйва и контроля')],
            loot: [T('Своя карта трёх вопросов под давлением'), T('Шкала интенсивности: от рядовой смены до буллита')] },
          { num: T('НЕДЕЛЯ 7'), locked: true }, { num: T('НЕДЕЛЯ 8'), locked: true }
        ] },
        { name: T('МЕСЯЦ 3 · «ИНТЕГРАЦИЯ»'), sub: T('всё собранное в одну систему'), levels: [
          { num: T('НЕДЕЛЯ 9'), locked: true }, { num: T('НЕДЕЛЯ 10'), locked: true }, { num: T('НЕДЕЛЯ 11'), locked: true }, { num: T('НЕДЕЛЯ 12'), locked: true }
        ] }
      ] },
    { name: T('ЗАТОЧКА'), when: T('МЕСЯЦЫ 4–6 · НЕДЕЛИ 13–24'),
      task: T('Система, построенная в первой фазе, начинает работать под реальным соревновательным давлением. Меньше теории, больше применения.'),
      worlds: [{ name: T('ТРИ МЕСЯЦА ФАЗЫ'), sub: T('давление, эмоции, стойкость'), levels: [
        { num: T('МЕСЯЦ 4'), title: T('«ДАВЛЕНИЕ»'), locked: true }, { num: T('МЕСЯЦ 5'), title: T('«ЭМОЦИИ КАК ОРУЖИЕ»'), locked: true }, { num: T('МЕСЯЦ 6'), title: T('«СТОЙКОСТЬ»'), locked: true }
      ] }] },
    { name: T('ПОЛИГОН'), when: T('МЕСЯЦЫ 7–9 · НЕДЕЛИ 25–33'),
      task: T('Пик сезона и плей-офф. Применение под огнём: сессии реже, работа идёт по твоим реальным матчам, а не по учебнику. Плюс лидерство.'),
      worlds: [{ name: T('ТРИ МЕСЯЦА ФАЗЫ'), sub: T('лидерство, плей-офф, восстановление'), levels: [
        { num: T('МЕСЯЦ 7'), title: T('«ЛИДЕРСТВО»'), locked: true }, { num: T('МЕСЯЦ 8'), title: T('«ПОД ОГНЁМ»'), locked: true }, { num: T('МЕСЯЦ 9'), title: T('«ГЛУБИНА»'), locked: true }
      ] }] },
    { name: T('ЭВОЛЮЦИЯ'), when: T('МЕСЯЦЫ 10–12 · НЕДЕЛИ 34–45'),
      task: T('Тело как система, стратегия карьеры, деньги, дизайн жизни. Все девять доменов собираются в финальную версию твоей системы.'),
      worlds: [{ name: T('ТРИ МЕСЯЦА ФАЗЫ'), sub: T('тело, стратегия, финальная сборка'), levels: [
        { num: T('МЕСЯЦ 10'), title: T('«ТЕЛО КАК СИСТЕМА»'), locked: true }, { num: T('МЕСЯЦ 11'), title: T('«СТРАТЕГИЯ И ДЕНЬГИ»'), locked: true }, { num: T('МЕСЯЦ 12'), title: T('«ПОЛНАЯ ИНТЕГРАЦИЯ»'), locked: true }
      ] }] }
  ];

  // Девять доменов программы
  var DOMAINS = [
    { icon: 'pyramid', name: T('ЛИЧНОСТЬ И ХАРАКТЕР'), text: T('Пирамида Вудена, Личная Конституция, принципы.') },
    { icon: 'target', name: T('МЕНТАЛЬНАЯ ЭФФЕКТИВНОСТЬ'), text: T('Фокус, сброс, визуализация, Внутренняя игра, поток.') },
    { icon: 'floppy', name: T('СИСТЕМЫ ПРИВЫЧЕК'), text: T('Кайдзен, атомные привычки, личная операционная система.') },
    { icon: 'flame', name: T('СОРЕВНОВАТЕЛЬНОЕ МЫШЛЕНИЕ'), text: T('Инстинкт убийцы, разум воина, решающий момент.') },
    { icon: 'heart', name: T('ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ'), text: T('Эмоции как инструмент, чтение партнёров и соперника.') },
    { icon: 'shield', name: T('УСТОЙЧИВОСТЬ'), text: T('Преодоление, стоицизм, смысл, ментальное здоровье.') },
    { icon: 'moon', name: T('ФИЗИЧЕСКИЙ ИНТЕЛЛЕКТ'), text: T('Сон, дыхание, восстановление, питание.') },
    { icon: 'star', name: T('КОМАНДА И ЛИДЕРСТВО'), text: T('Культура раздевалки, лидерство до титула.') },
    { icon: 'bars', name: T('СТРАТЕГИЯ И ДИЗАЙН ЖИЗНИ'), text: T('Карьерные решения, финансы, жизнь за пределами льда.') }
  ];

  // Девять принципов программы
  var PRINCIPLES = [
    T('Быть чемпионом - это не титулы и награды, а образ жизни и способ мышления. Титулы лишь подтверждают это.'),
    T('Чем усерднее я работаю сегодня, тем сильнее и увереннее буду завтра.'),
    T('Одно действие сильнее тысячи намерений.'),
    T('Я принимаю и похвалу, и критику со смирением.'),
    T('Я всегда учусь, а не проигрываю. Это часть пути.'),
    T('«Не знаю» не существует. Есть «разберусь и научусь».'),
    T('Я никогда не сдаюсь. Даже когда ничего не выходит, у меня всегда есть выбор продолжать бороться.'),
    T('Я всегда говорю правду. Тонко.'),
    T('Великие достижения - всегда командная работа.')
  ];

  // Сквозные инструменты: проходят через всю программу и остаются у игрока
  var INVENTORY = [
    { icon: 'shield', name: T('ЛИЧНАЯ КОНСТИТУЦИЯ'), text: T('Ценности без компромисса. Ты здесь закон.') },
    { icon: 'pyramid', name: T('СВОЯ ПИРАМИДА'), text: T('Твои блоки, принципы и приоритеты. От основания до соревновательного величия.') },
    { icon: 'floppy', name: T('ЛИЧНАЯ ОС'), text: T('Твоя операционная система игрока. Пересобирается на каждом рубеже программы.') },
    { icon: 'clock', name: T('ОБЗОР ПОСЛЕ ИСПОЛНЕНИЯ'), text: T('Три вопроса, пять минут. После каждой тренировки и матча до конца программы.') },
    { icon: 'bolt', name: T('КНОПКА СБРОСА'), text: T('Отпустить плохую смену и вернуть фокус.') },
    { icon: 'bars', name: T('ЛИЧНЫЕ ДАШБОРДЫ'), text: T('Твои показатели на одном экране. Виден тренд, а не оценка.') },
    { icon: 'target', name: T('МЕНТАЛЬНЫЙ НАБОР'), text: T('Фокус, сброс и визуализация на одной карточке.') },
    { icon: 'lock', name: '???', text: T('Откроется в процессе игры.'), locked: true },
    { icon: 'lock', name: '???', text: T('Откроется в процессе игры.'), locked: true },
    { icon: 'lock', name: '???', text: T('Откроется в процессе игры.'), locked: true },
    { icon: 'lock', name: '???', text: T('Откроется в процессе игры.'), locked: true },
    { icon: 'lock', name: '???', text: T('Откроется в процессе игры.'), locked: true }
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
    // телефон мог приостановить звук страницы (блокировка экрана, звонок, другое приложение)
    if (audio.state !== 'running') { audioStalled = true; audio.resume().catch(function () {}); return; }
    // таймер проспал (вкладка была в фоне): продолжаем с текущего момента, а не догоняем пропущенное залпом
    if (mNext < audio.currentTime - 0.1) mNext = audio.currentTime + 0.06;
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
  // Возвращает звук к жизни: вызывается, когда страница снова видна, и на любом действии человека
  var audioStalled = false;
  function reviveAudio() {
    if (!audio || (!musicOn && !soundOn)) return;
    if (audio.state !== 'running') audio.resume().catch(function () {});
    if (musicOn && !document.hidden && !musicTimer) mRun(true);
    audioStalled = false;
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
  document.addEventListener('visibilitychange', function () {
    if (!musicOn) return;
    if (document.hidden) mRun(false); else reviveAudio();
  });
  window.addEventListener('pageshow', reviveAudio);
  window.addEventListener('focus', reviveAudio);
  // если телефон заглушил звук, первое же касание или клавиша возвращают его
  ['pointerdown', 'touchend', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { if (audio && audio.state !== 'running') reviveAudio(); }, true);
  });

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
  // sustain = true: овация держится, пока её не остановят (возвращает функцию остановки);
  // иначе короткий возглас, как после гола.
  function crowdRoar(sustain) {
    if (!soundOn || !audio) return null;
    var t = audio.currentTime + 0.02, out = audio.destination;
    var len = sustain ? 12 : 2.7;                       // для овации это только потолок на случай сбоя
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
    f1.frequency.setValueAtTime(320, t); f1.frequency.linearRampToValueAtTime(780, t + 0.3);
    f2.frequency.setValueAtTime(700, t); f2.frequency.linearRampToValueAtTime(1250, t + 0.3);
    if (!sustain) {                                     // после гола гласная закрывается в «у-у-у»
      f1.frequency.setValueAtTime(780, t + 0.55); f1.frequency.linearRampToValueAtTime(340, t + 1.2);
      f2.frequency.setValueAtTime(1250, t + 0.55); f2.frequency.linearRampToValueAtTime(760, t + 1.2);
    }
    mix.connect(f1); mix.connect(f2); f1.connect(roar); f2.connect(g2); g2.connect(roar);
    roar.gain.setValueAtTime(0.0001, t);
    roar.gain.exponentialRampToValueAtTime(0.16, t + 0.3);
    if (!sustain) { roar.gain.setValueAtTime(0.16, t + 0.9); roar.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); }
    roar.connect(out);
    var sources = [];
    for (var v = 0; v < 10; v++) {                 // десять «голосов» разной высоты
      var o = audio.createOscillator(), vg = audio.createGain();
      var base = 120 + Math.random() * 150, st = t + Math.random() * 0.08;
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(base * 0.9, st);
      o.frequency.linearRampToValueAtTime(base * (1.25 + Math.random() * 0.1), st + 0.35);
      if (!sustain) o.frequency.linearRampToValueAtTime(base * (0.8 + Math.random() * 0.08), st + 2.4);
      vg.gain.value = 0.12;
      o.connect(vg); vg.connect(mix); o.start(st); o.stop(t + len); sources.push(o);
    }
    var src = audio.createBufferSource(), ng = audio.createGain();   // дыхание толпы
    src.buffer = sfxNoise; src.loop = true; ng.gain.value = 0.5;
    src.connect(ng); ng.connect(mix); src.start(t); src.stop(t + len); sources.push(src);
    // Аплодисменты: отдельные короткие хлопки, а не сплошное шипение
    function claps(from, span, count) {
      for (var c = 0; c < count; c++) {
        var ct = from + Math.random() * span;
        var cs = audio.createBufferSource(), cb = audio.createBiquadFilter(), cg = audio.createGain();
        cs.buffer = sfxNoise;
        cb.type = 'bandpass'; cb.frequency.value = 900 + Math.random() * 900; cb.Q.value = 1.2;
        cg.gain.setValueAtTime(0.012 + Math.random() * 0.012, ct);
        cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.035);
        cs.connect(cb); cb.connect(cg); cg.connect(out);
        cs.start(ct, Math.random() * 1.5, 0.05);
      }
    }
    if (!sustain) {
      claps(t + 0.25, 2.3, 34);
      [116.5, 174.6].forEach(function (fr) {           // сирена
        var o2 = audio.createOscillator(), og = audio.createGain();
        o2.type = 'sawtooth'; o2.frequency.value = fr;
        og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.008, t + 0.05);
        og.gain.setValueAtTime(0.008, t + 0.6); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
        o2.connect(og); og.connect(out); o2.start(t); o2.stop(t + 0.9);
      });
      return null;
    }
    // овация: хлопки подсыпаются, пока она идёт; остановка - плавное затихание
    claps(t + 0.2, 0.5, 8);
    var clapTimer = setInterval(function () { claps(audio.currentTime + 0.02, 0.5, 8); }, 500);
    var safety = setTimeout(stop, (len - 1) * 1000);
    function stop() {
      if (!clapTimer) return;
      clearInterval(clapTimer); clapTimer = null; clearTimeout(safety);
      var now = audio.currentTime;
      roar.gain.cancelScheduledValues(now);
      roar.gain.setValueAtTime(Math.max(roar.gain.value, 0.0001), now);
      roar.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      claps(now, 0.6, 6);
      sources.forEach(function (n) { try { n.stop(now + 0.9); } catch (err) {} });
    }
    return stop;
  }
  var SFX = {
    crowd: function () { crowdRoar(false); },
    ovation: function () { return crowdRoar(true); },
    blip: function () { play([[880, 0.04]], 0.03); },
    move: function () { play([[440, 0.05], [660, 0.06]]); },
    select: function () { play([[523, 0.07], [659, 0.07], [784, 0.07], [1047, 0.14]]); },
    locked: function () { play([[140, 0.12, 'sawtooth'], [110, 0.18, 'sawtooth']]); },
    shot: function () { if (TENNIS) play([[520, 0.05, 'triangle', 240], [300, 0.04, 'triangle']], 0.12); else play([[900, 0.09, 'square', 180]], 0.05); },
    goal: function () { play([[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.09], [784, 0.09], [1047, 0.3]], 0.05); },
    miss: function () { play([[200, 0.08, 'triangle', 90]], 0.08); },
    start: function () { play([[392, 0.09], [523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.28]], 0.07); }
  };

  soundBtn.addEventListener('click', function () { setSound(!soundOn); SFX.move(); });

  /* =====================================================================
     ПЕРСОНАЖ
     ===================================================================== */

  // Рисует хоккеиста (лицом вправо) с левым верхним углом в (x, y). Размер 30×32.
  function drawHockeyPlayer(c, x, y, path, frame, shoot) {
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

  // Теннисист (лицом вправо), тот же размер, что у хоккеиста. swing - момент подачи.
  function drawTennisPlayer(c, x, y, path, frame, swing) {
    function R(col, rx, ry, w, h) { c.fillStyle = col; c.fillRect(x + rx, y + ry, w, h); }
    var K = OUT, SK = '#f2c9a0', by = frame === 1 ? 1 : 0;
    // ракетка: поднята вверх, на подаче уходит вперёд
    if (!swing) {
      R('#b86f50', 21, 13 + by, 2, 6);
      R(K, 18, 1 + by, 9, 13); R('#fee761', 19, 2 + by, 7, 11);
      R(K, 19, 5 + by, 7, 1); R(K, 19, 9 + by, 7, 1); R(K, 22, 2 + by, 1, 11);
    } else {
      R('#b86f50', 17, 17 + by, 5, 2);
      R(K, 21, 13 + by, 12, 10); R('#fee761', 22, 14 + by, 10, 8);
      R(K, 22, 17 + by, 10, 1); R(K, 26, 14 + by, 1, 8);
    }
    // ноги и кроссовки
    var legs = frame === 0 ? [[3, 0], [11, 0]] : [[5, -1], [9, 0]];
    legs.forEach(function (l) {
      var lx = l[0], ly = 24 + l[1];
      R(K, lx - 1, ly, 6, 6); R(SK, lx, ly, 4, 4); R('#ffffff', lx, ly + 4, 4, 1);
      R(K, lx - 1, ly + 5, 8, 4); R('#ffffff', lx, ly + 6, 6, 2);
    });
    // шорты
    R(K, 2, 19 + by, 13, 7); R('#262b44', 3, 19 + by, 11, 6);
    // футболка с полосой цвета пути
    R(K, 1, 9 + by, 15, 11); R('#ffffff', 2, 10 + by, 13, 9); R('#c0cbdc', 2, 10 + by, 2, 9);
    R(path.jersey, 2, 14 + by, 13, 2);
    // рука
    R(K, 11, 11 + by, 8, 6); R('#ffffff', 12, 12 + by, 3, 4); R(SK, 15, 12 + by, 3, 4);
    // голова с повязкой
    R(K, 3, 0 + by, 11, 10);
    R('#733e39', 4, 1 + by, 9, 2); R(path.jersey, 4, 3 + by, 9, 2);
    R(SK, 4, 5 + by, 9, 4); R('#733e39', 4, 5 + by, 2, 3); R(K, 11, 6 + by, 1, 1);
    if (path.beard) { R(path.beard, 8, 8 + by, 5, 1); R(path.beard, 9, 9 + by, 3, 1); }
  }
  var drawPlayer = TENNIS ? drawTennisPlayer : drawHockeyPlayer;

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
  var MAIL = 'edgechamps@gmail.com', ctaMail = document.getElementById('ctaMail'), mailCopy = document.getElementById('mailCopy');
  // Почтовые ссылки открываются не у всех, поэтому адрес виден текстом и копируется кнопкой
  mailCopy.addEventListener('click', function () {
    function done(ok) {
      mailCopy.textContent = ok ? T('СКОПИРОВАНО') : T('ВЫДЕЛЕНО');
      setTimeout(function () { mailCopy.textContent = T('КОПИРОВАТЬ'); }, 1800);
    }
    function select() {
      var r = document.createRange(); r.selectNodeContents(ctaMail);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); done(false);
    }
    SFX.move();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(MAIL).then(function () { done(true); }, select);
    else select();
  });

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

  var role = ROLES[0];
  function signupMsg(p) {
    return role.msg + (TENNIS ? T(' Версия: теннис.') : '') + (p ? role.msgPath + p.name.toLowerCase() + '.' : '') +
      (TR.r ? '\n' + T('код: ') + TR.r : '');       // код персональной ссылки, без имени человека
  }
  function signupHref(p) {
    // роль и выбранный путь подставляются в текст сообщения
    return ctaBase + '?text=' + encodeURIComponent(signupMsg(p));
  }

  // На телефоне карточки путей - карусель: листается свайпом или стрелками,
  // путь выбирается нажатием на карточку, описание раскрывается под каруселью.
  var pathsPrev = document.getElementById('pathsPrev'), pathsNext = document.getElementById('pathsNext');
  var pathsCount = document.getElementById('pathsCount');
  function carouselIndex() {
    var mid = pathsEl.scrollLeft + pathsEl.clientWidth / 2, best = 0, bd = 1e9;
    pathCards.forEach(function (pc, i) {
      var d = Math.abs(pc.el.offsetLeft + pc.el.offsetWidth / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  function carouselGo(i, instant) {
    var el = pathCards[Math.max(0, Math.min(pathCards.length - 1, i))].el;
    pathsEl.scrollTo({ left: el.offsetLeft - (pathsEl.clientWidth - el.offsetWidth) / 2, behavior: instant || reduced ? 'auto' : 'smooth' });
  }
  function carouselSync() {
    var i = carouselIndex();
    pathsCount.textContent = (i + 1) + ' / ' + pathCards.length;
    pathsPrev.disabled = i === 0; pathsNext.disabled = i === pathCards.length - 1;
  }
  pathsPrev.addEventListener('click', function () { SFX.move(); carouselGo(carouselIndex() - 1); });
  pathsNext.addEventListener('click', function () { SFX.move(); carouselGo(carouselIndex() + 1); });
  pathsEl.addEventListener('scroll', function () { requestAnimationFrame(carouselSync); }, { passive: true });
  window.addEventListener('resize', carouselSync);

  function choosePath(p, byUser, quiet) {
    currentPath = p;
    pathCards.forEach(function (pc) {
      var on = pc.path === p;
      pc.el.setAttribute('aria-checked', String(on));
      pc.el.querySelector('.path__pick').textContent = on ? T('★ ВЫБРАН') : T('ВЫБРАТЬ');
    });
    cta.href = signupHref(p);
    // то же сообщение уходит и в письмо
    ctaMail.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Champion\'s Edge') + '&body=' + encodeURIComponent(signupMsg(p));
    if (p) { pathPanel.style.setProperty('--path-col', p.jersey); pathPanel.style.setProperty('--path-dark', p.jerseyDark); }
    pathPanel.classList.toggle('has-path', !!p);
    ctaPathEl.textContent = p ? p.name : T('НЕ ВЫБРАН');
    ctaPick.hidden = !!p;
    if (p) {
      pathPanel.innerHTML = '<div class="level__top"><span class="level__tag">' + p.num + '</span><h3 class="level__title">' + p.name + '</h3></div>' +
        T('<dl class="pathinfo__meta"><div><dt>ЭТАП</dt><dd>') + p.stage + T('</dd></div><div><dt>ЦЕЛЬ</dt><dd>') + p.goal + '</dd></div></dl>' +
        '<p>' + p.about + '</p>' + (role.pathNote ? '<p class="pathinfo__role">' + role.pathNote[p.id] + '</p>' : '') + T('<div class="level__cols"><div><h4>НА ЧТО ДЕЛАЕМ УПОР</h4><ul>') +
        p.focus.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul></div>' +
        T('<div><h4>ЧТО ОБЩЕЕ У ВСЕХ ПУТЕЙ</h4><ul><li>Формат один на один с тренером</li><li>Та же программа: 4 фазы, 9 доменов</li><li>Примеры и задания из твоей карьеры и твоего этапа</li></ul></div></div>') +
        '<p class="pathinfo__cta"><a class="btn btn--cta btn--small" href="' + cta.href + '" target="_blank" rel="noopener">▶ ' + role.panelButton + '</a></p>';
    } else {
      pathPanel.innerHTML = T('<p class="pathinfo__empty">Путь ещё не выбран. Нажми на карточку или забей в одни из ворот на площадке. Здесь появится, на что делаем упор на твоём этапе.</p>');
    }
    // карусель показывает выбранный путь (например, после гола на площадке)
    if (p && narrow.matches) carouselGo(PATHS.indexOf(p), !byUser);
    drawFace(); drawGuide(); guideCta.href = cta.href;
    if (byUser) {
      store('ce-path', p.id);
      TR.goal('path_selected', { path: p.id });
      say([role.id === 'player' ? p.hello : p.helloOther], { label: T('ИЗУЧИТЬ ПУТЬ ▼'), target: pathPanel, exit: true });
      if (!quiet) {
        // выбрали карточкой: показываем раскрывшееся описание
        SFX.select(); guideTuck();
        reveal(pathPanel);
      }
    }
  }
  narrow.addEventListener('change', function () { placeLevelPanel(); carouselSync(); });

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
    dialogGo.classList.toggle('dialog__go--blink', !!(dialogAction && dialogAction.exit));
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
    var target = dialogAction.target;
    function go() { target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
    // после выбора пути игрок сначала уезжает за свои ворота, «вниз по странице», и только потом листаем
    if (dialogAction.exit && currentPath && !reduced && onScreen(cv)) startExit(PATHS.indexOf(currentPath), function () { pour(target); go(); });
    else go();
  });
  dialogGo.addEventListener('keydown', function (e) { e.stopPropagation(); });

  // Цвет выбранного пути «вытекает» из площадки вниз по странице, туда, куда ушёл игрок,
  // и вливается в описание пути: игра и сайт читаются как одно целое.
  function pour(target) {
    var cr = cv.getBoundingClientRect(), tr = target.getBoundingClientRect(), sy = window.pageYOffset, sx = window.pageXOffset;
    var top = cr.bottom + sy, end = tr.top + sy + 6, k = cr.width / W;
    if (end - top < 20) return;
    var el = document.createElement('div');
    el.className = 'pour'; el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--path-col', currentPath.jersey); el.style.setProperty('--path-dark', currentPath.jerseyDark);
    el.style.width = Math.round(40 * k) + 'px';
    el.style.left = Math.round(cr.left + sx + (hero.x + 11 - 20) * k) + 'px';
    el.style.top = Math.round(top) + 'px';
    document.body.appendChild(el);
    var t0 = performance.now(), dur = 1400;
    (function grow(now) {
      // голова потока идёт вместе с прокруткой и всё время видна на экране
      var len = end - top, h = Math.max(len * Math.min(1, (now - t0) / dur), window.pageYOffset + window.innerHeight * 0.6 - top);
      var f = Math.min(1, h / len);
      el.style.height = Math.round(len * f / 8) * 8 + 'px';                  // растёт ступеньками по 8 пикселей
      if (f < 1 && now - t0 < 3000) { requestAnimationFrame(grow); return; }
      target.classList.remove('is-poured'); void target.offsetWidth; target.classList.add('is-poured');
      el.classList.add('is-out');
      setTimeout(function () { el.remove(); }, 700);
    })(t0);
  }
  dialog.addEventListener('click', advance);
  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); advance(); }
  });

  // Показывает раскрывшийся блок: верх не под шапкой, низ по возможности на экране
  function reveal(el) {
    var r = el.getBoundingClientRect(), top = document.querySelector('.hud').getBoundingClientRect().bottom + 14, vh = window.innerHeight;
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
  // На телефоне площадка выше (320×320 вместо 320×240): занимает больше экрана, игроку просторнее.
  var TALL = narrow.matches ? 80 : 0;
  var W = 320, H = 240 + TALL, ICE_Y = 52, GOAL_Y = 212 + TALL;
  if (TALL) { cv.height = H; cv.parentNode.style.setProperty('--rink-ar', String(W / H)); document.querySelector('.stage').style.setProperty('--rink-ar', String(W / H)); }
  var scoreEl = document.getElementById('score');
  var keys = {}, score = 0;
  var hero = { x: 60, y: 66, vx: 0, vy: 0, dir: 1, auto: true, autoDir: 1, shootT: 0, idleT: 0, target: null, cruise: null };
  var puck = { x: 0, y: 0, vx: 0, vy: 0, live: false };
  var goalFlash = 0, banner = '', banner2 = '', bannerT = 0, lastZone = -1, cheerT = 0;
  // Трое ворот - по одним на каждый путь чемпиона: [левая штанга, правая штанга]
  var NETS = [[26, 98], [124, 196], [222, 294]];
  var HERO_MIN_X = 4, HERO_MAX_X = 286, HERO_MIN_Y = 28, HERO_MAX_Y = 166 + TALL;
  // Уход с площадки: чужие ворота гаснут, свои встают в центр, игрок закатывается за них
  var exit = null, netOff = [0, 0, 0], netAlpha = [1, 1, 1];
  function startExit(zone, done) {
    if (exit) return;
    exit = { zone: zone, t: 0, done: done, fired: false };
    hero.target = null; hero.cruise = null; hero.auto = false; puck.live = false; ball = null; keys = {};
    exit.stopOvation = SFX.ovation();                   // трибуны провожают овацией, пока игрок не скроется
  }
  function updateExit() {
    var e = exit, z = e.zone, slide = NETS[1][0] - NETS[z][0];          // на сколько сдвинуть свои ворота до центра
    e.t++;
    var k = Math.min(1, e.t / 45), ease = k * k * (3 - 2 * k);
    for (var i = 0; i < 3; i++) {
      if (i === z) netOff[i] = slide * ease; else netAlpha[i] = 1 - Math.min(1, e.t / 30);
    }
    // игрок объезжает свои ворота справа и уезжает за нижний край площадки
    var sideX = 210, dx = sideX - hero.x;
    hero.vx = Math.abs(dx) > 1.5 ? (dx > 0 ? 2 : -2) : 0;
    hero.vy = 0;
    if (!hero.vx) { hero.x = sideX; if (e.t > 30) hero.vy = 1.8; }
    else if (hero.y < 150) hero.vy = 1;                 // по пути подъезжает ближе к воротам
    if (hero.vx) hero.dir = hero.vx > 0 ? 1 : -1; else hero.dir = -1;
    hero.x += hero.vx; hero.y += hero.vy;
    if (!e.fired) cheerT = 45;                          // трибуна на ногах, пока игрок на площадке
    if (hero.y > H + 4 && !e.fired) { e.fired = true; e.fireT = e.t; if (e.stopOvation) e.stopOvation(); e.done(); }
    // площадка возвращается в исходный вид, когда страница уже уехала к описанию пути
    if (e.fired && e.t - e.fireT > 100) {
      exit = null; netOff = [0, 0, 0]; netAlpha = [1, 1, 1];
      hero.x = 60; hero.y = 66; hero.dir = 1; hero.auto = true; hero.autoDir = 1;
    }
  }

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

    var flash = goalFlash > 0 && Math.floor(goalFlash / 4) % 2 === 0;
    g.font = '8px "Press Start 2P", monospace'; g.textAlign = 'center';
    if (TENNIS) drawCourt(flash); else drawRink(flash);

    drawHero(t);

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

  // Хоккейная площадка: лёд и трое ворот
  function drawRink(flash) {
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
    NETS.forEach(function (n, i) {
      if (netAlpha[i] <= 0) return;
      g.globalAlpha = netAlpha[i];
      var off = Math.round(netOff[i]);
      var p = PATHS[i], l = n[0] + off, r = n[1] + off, hit = flash && lastZone === i, cur = p === currentPath;
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
      g.globalAlpha = 1;
    });
  }

  /* ---------------------------------------------------------------------
     ТЕННИС. Вид как в теннисных играх: игрок спиной к нам у ближней задней
     линии, корт уходит вдаль, за сеткой три зоны. Игрок ходит только вдоль
     линии и останавливается, когда отпустили клавишу. Подача: подброс и удар.
     --------------------------------------------------------------------- */
  var CT = { near: 212 + TALL, far: 72, hwNear: 136, hwFar: 100, q: 0.75 };
  function ctY(d) { var k = d / (d + (1 - d) * CT.q); return CT.near - (CT.near - CT.far) * k; }       // глубина 0..1 → y
  function ctHW(y) { return CT.hwNear - (CT.hwNear - CT.hwFar) * (CT.near - y) / (CT.near - CT.far); }  // полуширина корта на высоте y
  var T_NET = Math.round(ctY(0.5)), T_LAND = Math.round(ctY(0.76)), T_HERO_Y = 189 + TALL;      // игрок стоит за задней линией: подаёт из-за корта
  var ball = null;
  if (TENNIS) { hero.x = 149; hero.y = T_HERO_Y; hero.auto = false; }

  // Край зоны i (0..3) на высоте y
  function zoneX(i, y) { var hw = ctHW(y); return 160 - hw + 2 * hw * i / 3; }
  function zoneAt(x) {
    var hw = ctHW(T_LAND), l = 160 - hw, w = 2 * hw / 3;
    if (x < l + 2 || x > 160 + hw - 2) return -1;
    var rel = (x - l) / w, i = Math.floor(rel);
    return Math.abs(rel - Math.round(rel)) * w < 1.5 && Math.round(rel) % 3 !== 0 ? -1 : Math.min(2, i);   // на линии между зонами - аут
  }
  // Куда прилетит подача, если игрок стоит в точке hero.x. Подача идёт по диагонали, как в теннисе:
  // справа подают в левую зону, слева в правую.
  var AIM_K = ctHW(T_LAND) / CT.hwNear * 1.25;
  function aimX() { return 160 - (hero.x + 11 - 160) * AIM_K; }

  function poly(col, pts) {
    g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]);
    for (var k = 2; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]);
    g.closePath(); g.fill();
  }
  function slant(col, x0, y0, x1, y1) {                     // наклонная линия по пикселям, без сглаживания
    g.fillStyle = col;
    for (var y = y0; y <= y1; y++) g.fillRect(Math.round(x0 + (x1 - x0) * (y - y0) / (y1 - y0)), y, 1, 1);
  }

  function drawCourt(flash) {
    var N = CT.near, F = CT.far;
    g.fillStyle = '#3e8948'; g.fillRect(0, ICE_Y, W, H - ICE_Y);                  // покрытие вокруг корта
    g.fillStyle = '#265c42'; g.fillRect(0, ICE_Y, W, 2);
    poly('#0099db', [160 - CT.hwFar, F, 160 + CT.hwFar, F, 160 + CT.hwNear, N, 160 - CT.hwNear, N]);
    // три зоны на дальней половине: цвет - форма пути
    for (var i = 0; i < 3; i++) {
      if (netAlpha[i] <= 0) continue;
      var p = PATHS[i], hit = flash && lastZone === i, cur = p === currentPath;
      g.globalAlpha = netAlpha[i];
      poly(hit ? '#fee761' : cur ? p.jersey : p.jerseyDark, [zoneX(i, F), F, zoneX(i + 1, F), F, zoneX(i + 1, T_NET), T_NET, zoneX(i, T_NET), T_NET]);
      var mx = (zoneX(i, 100) + zoneX(i + 1, 100)) / 2, tw = p.short.length * 8 + 4;
      g.fillStyle = OUT; g.fillRect(Math.round(mx - tw / 2), 93, tw, 11);
      g.fillStyle = cur ? '#fee761' : '#ffffff'; g.fillText(p.short, Math.round(mx), 102);
    }
    g.globalAlpha = 1;
    // разметка
    g.fillStyle = '#ffffff';
    g.fillRect(160 - CT.hwFar, F, CT.hwFar * 2, 1); g.fillRect(160 - CT.hwNear, N, CT.hwNear * 2 + 1, 1);
    slant('#ffffff', 160 - CT.hwFar, F, 160 - CT.hwNear, N); slant('#ffffff', 160 + CT.hwFar, F, 160 + CT.hwNear, N);
    slant('#ffffff', zoneX(1, F), F, zoneX(1, T_NET), T_NET); slant('#ffffff', zoneX(2, F), F, zoneX(2, T_NET), T_NET);
    var sy = Math.round(ctY(0.25));                                               // ближняя линия подачи и центральная
    g.fillStyle = '#ffffff'; g.fillRect(Math.round(160 - ctHW(sy)), sy, Math.round(ctHW(sy) * 2), 1); g.fillRect(160, T_NET, 1, sy - T_NET);
    // сетка: полоса с тросом сверху и стойками
    var nh = ctHW(T_NET) + 7;
    g.fillStyle = 'rgba(24,20,37,0.55)'; g.fillRect(Math.round(160 - nh), T_NET - 9, Math.round(nh * 2), 9);
    g.fillStyle = 'rgba(192,203,220,0.35)'; for (var nx = Math.round(160 - nh) + 2; nx < 160 + nh; nx += 4) g.fillRect(nx, T_NET - 8, 1, 8);
    g.fillStyle = '#ffffff'; g.fillRect(Math.round(160 - nh), T_NET - 10, Math.round(nh * 2), 1);
    g.fillStyle = '#c0cbdc'; g.fillRect(Math.round(160 - nh) - 2, T_NET - 12, 3, 13); g.fillRect(Math.round(160 + nh) - 1, T_NET - 12, 3, 13);
    // путь выбран: от своей зоны к игроку и дальше вниз раскатывается дорожка цвета пути
    if (exit) {
      var ez = exit.zone, grow = Math.min(1, exit.t / 24), yb = T_NET + (H - T_NET) * grow, hc = hero.x + 11;
      var xl = zoneX(ez, T_NET), xr = zoneX(ez + 1, T_NET), bl = xl + (hc - 20 - xl) * grow, br = xr + (hc + 20 - xr) * grow;
      g.globalAlpha = 0.85; poly(PATHS[ez].jersey, [xl, T_NET, xr, T_NET, br, yb, bl, yb]); g.globalAlpha = 1;
      // затем цвет пути заливает всю ближнюю половину корта
      var wide = Math.max(0, Math.min(1, (exit.t - 24) / 20));
      if (wide) { g.globalAlpha = 0.7 * wide; poly(PATHS[ez].jersey, [160 - ctHW(T_NET), T_NET, 160 + ctHW(T_NET), T_NET, 160 + CT.hwNear, CT.near, 160 - CT.hwNear, CT.near]); g.globalAlpha = 1; }
      g.fillStyle = '#fee761';
      for (var ay = T_NET + 10 + (exit.t * 1.5) % 22; ay < yb - 6; ay += 22) {       // стрелки бегут вниз
        var ac = Math.round((xl + xr) / 2 + (hc - (xl + xr) / 2) * (ay - T_NET) / (H - T_NET));
        g.fillRect(ac - 4, ay, 9, 2); g.fillRect(ac - 2, ay + 2, 5, 2); g.fillRect(ac, ay + 4, 1, 2);
      }
    }
    // прицел: куда уйдёт подача с текущего места
    if (!ball && !exit) { var ax = Math.round(aimX()); g.fillStyle = '#ffffff'; g.fillRect(ax - 3, T_LAND, 7, 1); g.fillRect(ax, T_LAND - 3, 1, 7); }
  }

  // Теннисист со спины (22×33). swing - кадр удара.
  function drawTennisBack(c, x, y, path, frame, swing) {
    function R(col, rx, ry, w, h) { c.fillStyle = col; c.fillRect(x + rx, y + ry, w, h); }
    var K = OUT, SK = '#f2c9a0', by = frame === 1 ? 1 : 0;
    // ракетка: в замахе над плечом, после удара впереди слева
    if (!swing) {
      R('#b86f50', 18, 6 + by, 2, 7);
      R(K, 15, -8 + by, 9, 14); R('#fee761', 16, -7 + by, 7, 12);
      R(K, 16, -3 + by, 7, 1); R(K, 16, 1 + by, 7, 1); R(K, 19, -7 + by, 1, 12);
    } else {
      R('#b86f50', 5, 3 + by, 7, 2);
      R(K, -6, -8 + by, 12, 12); R('#fee761', -5, -7 + by, 10, 10);
      R(K, -5, -3 + by, 10, 1); R(K, 0, -7 + by, 1, 10);
    }
    // ноги: широкая стойка, на втором кадре переступает
    var legs = frame === 0 ? [[3, 0], [12, 0]] : [[5, 0], [10, -1]];
    legs.forEach(function (l) {
      var lx = l[0], ly = 24 + l[1];
      R(K, lx - 1, ly, 6, 6); R(SK, lx, ly, 4, 4); R('#ffffff', lx, ly + 4, 4, 1);
      R(K, lx - 1, ly + 5, 6, 4); R('#ffffff', lx, ly + 6, 4, 2);
    });
    R(K, 3, 19 + by, 13, 7); R('#262b44', 4, 19 + by, 11, 6);                      // шорты
    R(K, 2, 9 + by, 15, 11); R('#ffffff', 3, 10 + by, 13, 9); R('#c0cbdc', 3, 10 + by, 2, 9);   // спина
    R(path.jersey, 3, 14 + by, 13, 2);
    R(K, 0, 10 + by, 3, 9); R(SK, 1, 14 + by, 2, 4); R('#ffffff', 1, 11 + by, 2, 3);           // левая рука
    R(K, 16, 9 + by, 4, 6); R(SK, 17, 10 + by, 2, 4);                                          // правая рука с ракеткой
    R(K, 4, 0 + by, 11, 10); R('#733e39', 5, 1 + by, 9, 8); R(path.jersey, 5, 3 + by, 9, 2);   // затылок с повязкой
    R(SK, 5, 8 + by, 9, 1);
  }
  function drawTennisHero(t) {
    var moving = hero.vx !== 0, frame = moving ? Math.floor(t / 110) % 2 : Math.floor(t / 420) % 2;
    var hx = Math.round(hero.x), hy = Math.round(hero.y - (hero.hop || 0));
    g.fillStyle = 'rgba(24,20,37,0.3)'; g.fillRect(hx, Math.round(hero.y) + 32, 20, 3);
    if (exit && exit.t > 40) drawTennisPlayer(g, hx, hy, look(), frame, false);      // развернулся и бежит
    else drawTennisBack(g, hx, hy, look(), frame, hero.shootT > 0);
    if (exit) {
      // праздник: вспышки фотокамер на трибунах и конфетти цвета пути
      var et = exit.t, cols = [look().jersey, '#fee761', '#ffffff'];
      for (var f = 0; f < 5; f++) {
        var fk = Math.floor(et / 4) * 7 + f * 31;
        g.fillStyle = '#ffffff'; g.fillRect((fk * 73) % W, 4 + (fk * 29) % (ICE_Y - 30), 3, 3);
      }
      for (var c = 0; c < 80; c++) {
        var cy = et * (1.6 + (c % 5) * 0.5) - (c * 13) % 110;
        if (cy < 0 || cy > H) continue;
        g.fillStyle = cols[c % 3];
        g.fillRect(Math.round((c * 53) % W + Math.sin((et + c * 7) / 9) * 4), Math.round(cy), c % 2 ? 3 : 2, 2);
      }
    }
    if (!ball) return;
    // мяч: тень на корте и сам мяч на высоте
    var b = ball, s = b.size;
    g.fillStyle = 'rgba(24,20,37,0.3)'; g.fillRect(Math.round(b.gx), Math.round(b.gy), s, Math.max(1, s - 2));
    g.fillStyle = OUT; g.fillRect(Math.round(b.gx) - 1, Math.round(b.gy - b.h) - s - 1, s + 2, s + 2);
    g.fillStyle = '#c6f432'; g.fillRect(Math.round(b.gx), Math.round(b.gy - b.h) - s, s, s);
  }

  function serve() {
    if (ball || exit) return;
    hero.target = null; hero.vx = 0;
    ball = { phase: 'toss', t: 0, gx: hero.x + 17, gy: hero.y + 33, h: 22, size: 4 };
  }

  function updateTennis(dt) {
    if (goalFlash > 0) goalFlash--;
    if (cheerT > 0) cheerT--;
    if (bannerT > 0) bannerT--;
    if (hero.shootT > 0) hero.shootT--;
    if (exit) {
      // путь выбран: чужие зоны гаснут, игрок разворачивается и убегает вниз, к описанию пути
      var e = exit; e.t++;
      for (var i = 0; i < 3; i++) if (i !== e.zone) netAlpha[i] = 1 - Math.min(1, e.t / 30);
      // сначала радуется на месте, потом по цветной дорожке своего пути бежит на нас, вниз, к описанию пути
      hero.vx = 1; hero.hop = e.t <= 40 ? Math.abs(Math.sin(e.t / 20 * Math.PI)) * 9 : 0;
      if (e.t > 40) hero.y += 1;
      if (!e.fired) cheerT = 45;
      if (hero.y > H + 4 && !e.fired) { e.fired = true; e.fireT = e.t; if (e.stopOvation) e.stopOvation(); e.done(); }
      if (e.fired && e.t - e.fireT > 100) { exit = null; netAlpha = [1, 1, 1]; hero.y = T_HERO_Y; hero.vx = 0; hero.hop = 0; }
      return;
    }
    // движение только вдоль задней линии, без инерции
    var left = keys.ArrowLeft || keys.a, right = keys.ArrowRight || keys.d;
    hero.vx = 0;
    if (!ball || ball.phase !== 'toss') {
      if (left || right) { hero.target = null; hero.vx = right ? 2.2 : -2.2; }
      else if (hero.target) {
        var dx = hero.target.x - hero.x;
        var sp = hero.target.fast ? 6 : 2.6;       // за пальцем игрок успевает, к зоне идёт обычным шагом
        if (Math.abs(dx) <= sp) { hero.x = hero.target.x; var go = hero.target.serve; hero.target = null; if (go) serve(); }
        else hero.vx = dx > 0 ? sp : -sp;
      }
    }
    hero.x = Math.max(12, Math.min(286, hero.x + hero.vx));

    if (!ball) return;
    var b = ball; b.t++;
    if (b.phase === 'toss') {
      // подброс: мяч взлетает над игроком и чуть опускается к точке удара
      var k = b.t / 20; b.h = 22 + 34 * Math.sin(Math.PI * Math.min(1, k) * 0.78);
      b.gx = hero.x + 17; b.gy = hero.y + 33;
      if (b.t >= 20) {
        hero.shootT = 12; SFX.shot();
        b.phase = 'fly'; b.t = 0; b.x0 = b.gx; b.y0 = b.gy; b.h0 = b.h;
        b.x1 = aimX() + (Math.random() - 0.5) * 7; b.y1 = T_LAND;
      }
    } else if (b.phase === 'fly') {
      var f = Math.min(1, b.t / 26);
      b.gx = b.x0 + (b.x1 - b.x0) * f; b.gy = b.y0 + (b.y1 - b.y0) * f;
      b.h = b.h0 * (1 - f) + 30 * Math.sin(Math.PI * f) * (1 - f * 0.5);
      b.size = f > 0.8 ? 2 : f > 0.45 ? 3 : 4;                                   // мяч уменьшается, улетая вдаль
      if (f >= 1) {
        var zone = zoneAt(b.x1);
        b.phase = 'bounce'; b.t = 0; b.h = 0;
        if (zone >= 0) {
          score++; scoreEl.textContent = ('00' + score).slice(-3);
          lastZone = zone; goalFlash = 70; banner = T('ГОЛ!'); banner2 = PATHS[zone].name; bannerT = 90; cheerT = 130; SFX.goal(); SFX.crowd();
          choosePath(PATHS[zone], true, true);
        } else { banner = T('МИМО!'); banner2 = ''; bannerT = 40; SFX.miss(); }
      }
    } else {
      // отскок в сторону трибун
      b.gy -= 1.1; b.h = 12 * Math.sin(Math.PI * Math.min(1, b.t / 16));
      if (b.t >= 16) ball = null;
    }
  }

  // Мышь и палец на корте: нажатие на зону - встать напротив и подать, на свою половину - перейти туда
  var tDrag = false;
  function tennisDrag(e) {
    if (!tDrag || exit || (ball && ball.phase === 'toss')) return;
    var pt = scenePoint(e);
    hero.target = { x: Math.max(12, Math.min(286, Math.round(pt.x - 11))), serve: false, fast: true };
  }
  cv.addEventListener('pointermove', function (e) { if (TENNIS) tennisDrag(e); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { cv.addEventListener(ev, function () { tDrag = false; }); });
  function tennisPointer(e) {
    if (exit) return;
    var pt = scenePoint(e);
    if (e.pointerType === 'mouse') e.preventDefault();
    if (pt.y < T_NET) {
      var px = 160 - (Math.max(160 - ctHW(T_LAND) + 6, Math.min(160 + ctHW(T_LAND) - 6, pt.x)) - 160) / AIM_K;     // встаёт по диагонали от зоны
      hero.target = { x: Math.max(12, Math.min(286, Math.round(px - 11))), serve: true };
      return;
    }
    var now = e.timeStamp;
    if (now - lastTap.t < 320 && Math.abs(pt.x - lastTap.x) < 40) { lastTap.t = 0; serve(); return; }   // двойное нажатие - подача
    lastTap = { t: now, x: pt.x, y: pt.y };
    hero.target = { x: Math.max(12, Math.min(286, Math.round(pt.x - 11))), serve: false };
    tDrag = true;                      // дальше игрок идёт за пальцем, пока его не отпустили
  }

  function drawHero(t) {
    if (TENNIS) { drawTennisHero(t); return; }
    var hy = Math.round(hero.y), moving = hero.vx !== 0 || hero.vy !== 0;
    var frame = moving ? Math.floor(t / 140) % 2 : Math.floor(t / 500) % 2;
    g.fillStyle = 'rgba(38,43,68,0.25)'; g.fillRect(Math.round(hero.x) - 1, Math.round(hero.y) + 32, 22, 3);
    g.save();
    if (hero.dir < 0) { g.translate(Math.round(hero.x) * 2 + 18, 0); g.scale(-1, 1); }
    drawPlayer(g, Math.round(hero.x), hy, look(), frame, hero.shootT > 0);
    g.restore();
  }

  // aimed: бросок по нажатию на ворота. Посетитель сам указал цель, поэтому шайба летит точно.
  function shoot(aimed) {
    if (exit) return;
    if (puck.live || hero.shootT > 0) return;
    if (TENNIS) { serve(); return; }
    hero.dir = 1; hero.shootT = 14;
    puck.live = true;
    puck.x = hero.x + 25; puck.y = hero.y + 29;
    // чем дальше от ворот, тем больше разброс
    var dist = Math.max(0, GOAL_Y - puck.y);
    // на высокой площадке (телефон) шайба летит дольше: разброс уменьшаем, чтобы снос остался прежним
    var k = 212 / GOAL_Y;
    puck.vx = aimed === true ? (Math.random() - 0.5) * 0.08 : (Math.random() - 0.5) * (0.15 + dist / 160) * k * k;
    puck.vy = 4;
    SFX.shot();
  }

  function update(dt) {
    if (TENNIS) { updateTennis(dt); return; }
    if (exit) { updateExit(); if (goalFlash > 0) goalFlash--; if (bannerT > 0) bannerT--; if (cheerT > 0) cheerT--; return; }
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
      if (Math.abs(dx) <= 2) { hero.x = hero.target; hero.target = null; shoot(true); hero.auto = true; } // после броска катится дальше
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
      var arrived = false, pcx = 0, zone = -1;
      puck.x += puck.vx; puck.y += puck.vy;
      if (puck.x < 2 || puck.x > W - 7) puck.vx *= -1;
      if (puck.y >= GOAL_Y) { arrived = true; pcx = puck.x + 2.5; }
      if (arrived) {
        puck.live = false;
        NETS.forEach(function (n, i) { if (pcx > n[0] && pcx < n[1]) zone = i; });
        if (zone >= 0) {
          score++; scoreEl.textContent = ('00' + score).slice(-3);
          lastZone = zone; goalFlash = 70; banner = T('ГОЛ!'); banner2 = PATHS[zone].name; bannerT = 90; cheerT = 130; SFX.goal(); SFX.crowd();
          choosePath(PATHS[zone], true, true);
        } else { banner = T('МИМО!'); banner2 = ''; bannerT = 40; SFX.miss(); }
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
    var k = e.key || ''; k = k.length === 1 ? k.toLowerCase() : k;
    k = RU_KEYS[k] || k;
    if (!onScreen(cv)) return;
    if (e.target.matches && e.target.matches('input, textarea, select')) return;      // человек печатает в анкете
    // Пробел оставляем кнопке только если на неё пришли с клавиатуры (Tab)
    if (k === ' ' && e.target !== cv && e.target.matches && e.target.matches('button:focus-visible, a:focus-visible, [role="button"]:focus-visible, input, textarea, select')) return;
    if (k === ' ') { e.preventDefault(); shoot(); return; }
    if (TENNIS && /^(ArrowUp|ArrowDown|w|s)$/.test(k)) return;      // в теннисе вверх-вниз не заняты игрой: страница листается
    if (MOVE_KEYS.indexOf(k) >= 0 && !exit) { keys[k] = true; if (k.length > 1) e.preventDefault(); }
  });
  window.addEventListener('keyup', function (e) {
    var k = e.key || ''; k = k.length === 1 ? k.toLowerCase() : k;
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
    if (TENNIS) { tennisPointer(e); return; }
    if (exit) return;
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
    b.innerHTML = T('<span class="phase__num">ФАЗА ') + (i + 1) + '</span>' + ph.name;
    b.addEventListener('click', function () { openPhase(i, true); });
    phaseTabs.appendChild(b);
  });

  function openPhase(i, byUser) {
    var ph = PHASES[i];
    phaseIdx = i; nodes = [];
    [].forEach.call(phaseTabs.children, function (t, k) { t.setAttribute('aria-selected', String(k === i)); });
    phaseInfo.innerHTML = '<span class="phase__when">' + ph.when + '</span>' + esc(ph.task);
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

  // На телефоне описание уровня открывается окном поверх карты: сама карта при этом не сдвигается.
  // На широком экране описание стоит под картой.
  var section = document.getElementById('map');
  var sheetBack = document.getElementById('sheetBack');
  function sheet(open) {
    levelPanel.classList.toggle('is-open', open);
    sheetBack.hidden = !open;
    guideEl.classList.toggle('guide--under', open);
  }
  sheetBack.addEventListener('click', function () { sheet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') sheet(false); });
  levelPanel.addEventListener('click', function (e) {
    var act = e.target.getAttribute && e.target.getAttribute('data-sheet');
    if (act === 'close') { SFX.move(); sheet(false); }
    if (act === 'prev') openLevel(levelIdx - 1, true);
    if (act === 'next') openLevel(levelIdx + 1, true);
  });
  function placeLevelPanel() { if (!narrow.matches) sheet(false); }

  function openLevel(idx, byUser) {
    var lv = nodes[idx].lv;
    levelIdx = idx;
    nodes.forEach(function (n, i) { n.el.setAttribute('aria-pressed', String(i === idx)); });
    var bar = '<div class="sheet__bar">' +
      '<button type="button" data-sheet="prev"' + (idx === 0 ? ' disabled' : '') + T(' aria-label="Предыдущий уровень">◄</button>') +
      '<span>' + (idx + 1) + ' / ' + nodes.length + '</span>' +
      '<button type="button" data-sheet="next"' + (idx === nodes.length - 1 ? ' disabled' : '') + T(' aria-label="Следующий уровень">►</button>') +
      T('<button type="button" data-sheet="close" class="sheet__close" aria-label="Закрыть">✕</button></div>');
    if (lv.locked) {
      levelPanel.innerHTML = bar + '<div class="sheet__body"><div class="level__top"><span class="level__tag">' + lv.num + '</span><h3 class="level__title">' + (lv.title || '???') + T(' · ЗАКРЫТО</h3></div>') +
        T('<p>Этот уровень пока закрыт. Он откроется в процессе игры.</p></div>');
      if (byUser) SFX.locked();
    } else {
      var html = bar + '<div class="sheet__body"><div class="level__top"><span class="level__tag' + (lv.boss ? ' level__tag--boss' : '') + '">' + (lv.boss ? T('ИТОГ МЕСЯЦА · ') : '') + lv.num + '</span>' +
        '<h3 class="level__title">' + lv.title + '</h3></div>' +
        '<p class="level__q">«' + esc(lv.q) + '»</p><p>' + esc(lv.text) + '</p><div class="level__cols">';
      if (lv.sessions) html += T('<div><h4>СЕССИИ НЕДЕЛИ</h4>') + list(lv.sessions) + '</div>';
      html += T('<div><h4>ТРОФЕИ УРОВНЯ</h4>') + list(lv.loot) + '</div></div></div>';
      levelPanel.innerHTML = html;
      if (byUser) SFX.select();
    }
    if (!byUser) return;
    if (narrow.matches) sheet(true);
    else setTimeout(function () { reveal(levelPanel); }, 0);
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
    var d = document.createElement('div'); d.className = 'panel item' + (it.locked ? ' item--locked' : '');
    d.innerHTML = '<canvas aria-hidden="true"></canvas><div><b>' + it.name + '</b><span>' + it.text + '</span></div>';
    drawIcon(d.querySelector('canvas'), it.icon);
    invEl.appendChild(d);
  });

  // Длинные списки свёрнуты: видны первые шесть, остальные по кнопке.
  // Источники свёрнуты везде, инвентарь только на телефоне (кнопка там и видна).
  function collapsible(listId, btnId, cls, word) {
    var listEl = document.getElementById(listId), btn = document.getElementById(btnId);
    var total = listEl.children.length;
    btn.textContent = T('▼ ПОКАЗАТЬ ') + word + ' · ' + total;
    btn.addEventListener('click', function () {
      var open = listEl.classList.toggle(cls) === false;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? T('▲ СВЕРНУТЬ') : T('▼ ПОКАЗАТЬ ') + word + ' · ' + total;
      SFX.move();
      if (!open) reveal(listEl);
    });
  }
  collapsible('masters', 'mastersToggle', 'masters--collapsed', T('ВСЕХ'));
  collapsible('inventory', 'inventoryToggle', 'is-collapsed', T('ВСЕ'));

  /* =====================================================================
     ПРОВОДНИК: идёт за читателем по странице и подсказывает, что делать
     ===================================================================== */

  var GUIDE = [
    { id: 'path', text: T('Здесь три пути чемпиона. Нажми на карточку: ниже появится, на что делаем упор именно на твоём этапе.') },
    { id: 'about', text: T('Коротко о формате: один на один с тренером, 12 месяцев онлайн и месяц предсезонки в Москве.') },
    { id: 'map', text: T('Это карта программы. Переключай фазы и нажимай на уровни: внутри тема, сессии и трофеи. Замки откроются в процессе игры.') },
    { id: 'domains', text: T('Девять доменов. Это ветки навыков, которые программа прокачивает за год.') },
    { id: 'loot', text: T('А это ты унесёшь с собой. Инструменты проходят через всю программу и остаются у тебя.') },
    { id: 'code', text: T('Кодекс. Девять принципов, на которых стоит программа.') },
    { id: 'science', text: T('А это лор: откуда взялась методика и на чьи идеи она опирается.') },
    { id: 'how', text: T('Четыре шага до старта. И главное правило: имён мы не публикуем.') },
    { id: 'start', text: T('Готов? Жми «Записаться»: откроется Telegram с готовым сообщением.') }
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

  // путь из адреса (?path=) важнее сохранённого: выбирается сразу и без реплики проводника
  if (TR.path) { store('ce-path', TR.path); TR.goal('path_selected', { path: TR.path }); }
  var saved = TR.path || store('ce-path');
  choosePath(PATHS.filter(function (p) { return p.id === saved; })[0] || null, false);
  openPhase(0, false);
  carouselSync();

  /* =====================================================================
     ВЫБОР РОЛИ
     ===================================================================== */

  // Пиксельные фигуры ролей (48×60). Игрок рисуется тем же спрайтом, что на площадке.
  var ROLE_ART = {
    agent: function (R) { R(OUT,15,5,16,16);R('#733e39',16,6,14,5);R('#f2c9a0',16,10,14,10);R(OUT,19,13,2,2);R(OUT,25,13,2,2);R(OUT,10,21,26,20);R('#262b44',11,22,24,18);R('#fff',20,22,6,9);R('#e43b44',22,23,2,10);R(OUT,13,41,20,13);R('#262b44',14,41,8,12);R('#262b44',24,41,8,12);R(OUT,12,53,11,4);R(OUT,23,53,11,4);R(OUT,34,34,13,12);R('#b86f50',35,36,11,9);R(OUT,38,32,5,3);R('#feae34',39,39,3,2); },
    club: function (R) { R(OUT,8,6,32,4);R(OUT,8,6,4,30);R(OUT,36,6,4,30);R('#0099db',12,10,12,26);R('#124e89',24,10,12,26);for(var i=0;i<10;i++){R(OUT,8+i*2,36+i*2,4,2);R(OUT,36-i*2,36+i*2,4,2);R('#0099db',12+i*2,36+i*2,12-i*2,2);R('#124e89',24,36+i*2,12-i*2,2);}R('#fee761',16,16,16,3);R('#fee761',22,12,4,20);R('#fff',14,24,20,3); },
    coach: function (R) { R(OUT,14,4,18,7);R('#e43b44',15,5,16,5);R(OUT,28,9,9,3);R('#f2c9a0',16,11,14,9);R(OUT,19,13,2,2);R(OUT,25,13,2,2);R(OUT,10,20,26,21);R('#3e8948',11,21,24,19);R('#fff',11,21,3,19);R('#c0cbdc',22,21,2,8);R('#feae34',21,29,4,3);R(OUT,13,41,20,13);R('#262b44',14,41,8,12);R('#262b44',24,41,8,12);R(OUT,12,53,11,4);R(OUT,23,53,11,4);R(OUT,33,26,14,18);R('#fff',34,27,12,16);R('#5a6988',36,30,8,1);R('#5a6988',36,33,8,1);R('#5a6988',36,36,5,1); }
  };
  var rolesEl = document.getElementById('roles'), roleCards = [];
  ROLES.forEach(function (r) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'panel role'; b.setAttribute('role', 'radio');
    b.innerHTML = '<canvas width="48" height="60" aria-hidden="true"></canvas><b>' + r.name + '</b><span>' + r.desc + '</span><i></i>';
    var c = b.querySelector('canvas').getContext('2d');
    if (ROLE_ART[r.id]) ROLE_ART[r.id](function (col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); });
    else { c.canvas.width = 32; c.canvas.height = 40; drawPlayer(c, 1, 4, PATHS[1], 0, false); }   // игрок крупнее: свой холст
    b.addEventListener('click', function () { setRole(r, true); });
    rolesEl.appendChild(b); roleCards.push({ role: r, el: b });
  });

  function intro() {
    say([role.hi].concat(role.intro || [
      T('Это программа индивидуального развития профессиональных атлетов. Один на один с тренером.'),
      T('Программа идёт 12 месяцев: 4 фазы, 45 недель. Начать можно в любой точке сезона.')
    ], [role.aim]), { label: T('ИЛИ ВЫБРАТЬ КАРТОЧКОЙ ▼'), target: document.getElementById('path') });
  }
  function setRole(r, byUser) {
    // Игрок и профессионалы (агент, клуб, тренер) читают сайт в разных редакциях. При переходе между ними
    // страница пересобирается: экран гаснет и проявляется уже в нужной редакции, на площадке.
    if (byUser && (r.id !== 'player') !== PRO) {
      store('ce-role', r.id);
      TR.goal('role_selected', { role: r.id });
      SFX.select();
      try { sessionStorage.setItem('ce-go', 'rink'); } catch (e) {}
      document.documentElement.classList.add('is-leaving');
      setTimeout(function () {
        if (store('ce-role') === r.id && !/[?&]role=/.test(location.search)) location.reload();
        else location.href = TR.urlWith('role', r.id).replace(/#.*$/, '');      // роль в адресе: хранилище недоступно или в ссылке была другая
      }, reduced ? 0 : 230);
      return;
    }
    // роль пришла в ссылке, а посетитель выбрал другую: адрес не должен вернуть прежнюю после перезагрузки
    if (byUser && /[?&]role=/.test(location.search) && window.history && history.replaceState) {
      try { history.replaceState(null, '', TR.urlWith('role', r.id)); } catch (e) {}
    }
    role = r;
    document.documentElement.setAttribute('data-role', r.id);
    roleCards.forEach(function (rc) {
      var on = rc.role === r;
      rc.el.setAttribute('aria-checked', String(on));
      rc.el.querySelector('i').textContent = on ? T('★ ВЫБРАНО') : T('ВЫБРАТЬ');
    });
    document.getElementById('navRole').textContent = T('РОЛЬ: ') + r.name;
    document.getElementById('pathLead').textContent = r.pathLead;
    document.getElementById('ctaReady').textContent = r.ready;
    document.getElementById('ctaPathLabel').textContent = r.pathLabel;
    document.getElementById('ctaText').textContent = r.ctaText;
    cta.textContent = '▶ ' + r.button;
    guideCta.textContent = r.button + ' ▶';
    // свой заход в разделе о программе и блок «Что это даёт» для агента, клуба и тренера
    var aboutRole = document.getElementById('aboutRole'), benefits = document.getElementById('roleBenefits');
    aboutRole.hidden = !r.aboutLead; aboutRole.textContent = r.aboutLead || '';
    benefits.hidden = !r.benefits;
    benefits.innerHTML = r.benefits ? '<h3 class="h3">' + r.benefits.title + '</h3><ul class="benefits__list">' +
      r.benefits.items.map(function (it) { return '<li><b>' + it[0] + '</b><span>' + it[1] + '</span></li>'; }).join('') + '</ul>' : '';
    document.getElementById('steps').innerHTML = r.steps.map(function (st) { return '<li><b>' + st[0] + '</b><span>' + st[1] + '</span></li>'; }).join('');
    choosePath(currentPath, false);                 // пересобирает ссылки и кнопку в описании пути
    intro();
    if (byUser) {
      store('ce-role', r.id);
      TR.goal('role_selected', { role: r.id });
      SFX.select();
      cv.focus({ preventScroll: true });
      document.getElementById('rink').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }
  }
  if (TR.role) { store('ce-role', TR.role); TR.goal('role_selected', { role: TR.role }); }     // роль из адреса (?role=)
  var savedRole = TR.role || store('ce-role');
  setRole(ROLES.filter(function (r) { return r.id === savedRole; })[0] || ROLES[0], false);

  // Заставка: кнопка START есть у каждой игры. Свой вид спорта открывает сайт дальше,
  // другой - сохраняется, и страница перезагружается уже в нём.
  [].forEach.call(document.querySelectorAll('.btn--start'), function (btn) {
    var sport = btn.getAttribute('data-sport'), c = btn.querySelector('canvas').getContext('2d');
    (sport === 'tennis' ? drawTennisPlayer : drawHockeyPlayer)(c, 1, 4, PATHS[1], 0, false);
    btn.setAttribute('aria-pressed', String(sport === SPORT));
    btn.addEventListener('click', function () {
      unlockAudio();
      if (sport !== SPORT) {
        store('ce-sport', sport);
        try { sessionStorage.setItem('ce-go', '1'); } catch (e) {}
        // экран плавно гаснет, страница другой игры так же плавно проявляется: без вспышки
        document.documentElement.classList.add('is-leaving');
        setTimeout(function () {
          if (HAS_PAGES) {
            // у каждой игры своя страница; остальные параметры адреса (код ссылки, UTM, язык) едут с нами
            var keep = location.search.replace(/^\?/, '').split('&').filter(function (p) { return p && p.split('=')[0] !== 'sport'; }).join('&');
            location.href = (SPORT_PAGE ? '../' : '') + sport + '/' + (keep ? '?' + keep : '');
          }
          else if (store('ce-sport') === sport && !/[?&]sport=/.test(location.search)) location.reload();
          else location.href = TR.urlWith('sport', sport).replace(/#.*$/, '');   // выбор в адресе, остальные параметры на месте
        }, reduced ? 0 : 230);
        return;
      }
      SFX.start();
      document.getElementById('role').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });
  // после смены игры страница перезагрузилась: сразу ведём к выбору роли
  try {
    var goTo = sessionStorage.getItem('ce-go');
    if (goTo) {
      sessionStorage.removeItem('ce-go');
      setTimeout(function () {
        document.getElementById(goTo === 'rink' ? 'rink' : 'role').scrollIntoView({ behavior: 'instant' });
        requestAnimationFrame(function () { document.documentElement.classList.remove('is-arriving'); });
      }, 60);
    }
  } catch (e) {}
  document.documentElement.classList.add('is-ready');
  setTimeout(function () { document.documentElement.classList.remove('is-arriving'); }, 1500);     // страховка: страница не остаётся скрытой
  // вернулись кнопкой «назад»: страница не должна остаться погашенной
  window.addEventListener('pageshow', function (e) { if (e.persisted) document.documentElement.classList.remove('is-leaving', 'is-arriving'); });

  // звук на ссылках и кнопках
  document.querySelectorAll('.hud__nav a, .hud__logo').forEach(function (a) { a.addEventListener('click', SFX.move); });
  cta.addEventListener('click', SFX.select);

  /* =====================================================================
     ЦЕЛИ МЕТРИКИ: клики по контактам и доскролл до ключевых разделов
     ===================================================================== */
  function who() { var o = { role: role.id }; if (currentPath) o.path = currentPath.id; return o; }
  // Ловим на всём документе: кнопка в описании пути пересобирается, а цель должна уйти до перехода
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.indexOf('https://t.me/call_pascal') === 0) TR.goal('cta_telegram', who());
    else if (href.indexOf('mailto:' + MAIL) === 0) TR.goal('cta_email', who());
  }, true);
  if (window.IntersectionObserver) (function () {
    var timers = {}, steps = [];
    for (var i = 0; i <= 20; i++) steps.push(i / 20);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        // раздел занимает заметную часть экрана (или виден на 40%) и задержался на нём
        var seen = en.isIntersecting && (en.intersectionRatio >= 0.4 || en.intersectionRect.height >= window.innerHeight * 0.4);
        clearTimeout(timers[id]);
        if (seen) timers[id] = setTimeout(function () { TR.goalOnce('section_' + id); }, 700);
      });
    }, { threshold: steps });
    ['role', 'path', 'about', 'science', 'how', 'start'].forEach(function (id) { io.observe(document.getElementById(id)); });
  })();

  /* =====================================================================
     COOKIE И АНАЛИТИКА: уведомление и выбор посетителя
     ===================================================================== */
  (function () {
    var box = document.getElementById('consent'), legal = document.getElementById('legal');
    function decide(yes) { TR.setConsent(yes); box.hidden = true; SFX.move(); }
    document.getElementById('consentYes').addEventListener('click', function () { decide(true); });
    document.getElementById('consentNo').addEventListener('click', function () { decide(false); });
    document.getElementById('consentChange').addEventListener('click', function () { box.hidden = false; });
    if (!TR.consent()) box.hidden = false;
    // ссылки на полный текст раскрывают его
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a[data-legal]')) legal.open = true;
    });
    if (location.hash === '#privacy') legal.open = true;
  })();

  /* =====================================================================
     АНКЕТА НА СОЗВОН
     ===================================================================== */
  // Публичный адрес сервера заявок (API Gateway в Yandex Cloud, см. server/form-handler/README.md).
  // Пока адрес не задан, кнопка анкеты скрыта: посетители пишут в Telegram или на почту.
  // Для проверки вёрстки анкету можно открыть адресом с ?form=test: заявка никуда не уйдёт, покажется запасной путь.
  var FORM_ENDPOINT = '';
  (function () {
    var openBtn = document.getElementById('formOpen'), form = document.getElementById('callForm');
    var sendBtn = document.getElementById('formSend'), msg = document.getElementById('formMsg');
    var fallback = document.getElementById('formFallback'), done = document.getElementById('formDone');
    if (!FORM_ENDPOINT && !/[?&]form=test(&|$)/.test(location.search)) return;
    openBtn.hidden = false;
    document.getElementById('legalForm').hidden = false;      // текст согласия на персональные данные нужен только вместе с анкетой
    var openedAt = 0, leadId = '', busy = false;
    function newId() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
    }
    function note(text, withFallback) {
      msg.textContent = text; msg.hidden = !text;
      fallback.hidden = !withFallback;
      if (withFallback) {                                   // те же ссылки, что у кнопок выше: с ролью, путём и кодом
        document.getElementById('formTg').href = cta.href;
        document.getElementById('formMail').href = ctaMail.href;
      }
    }
    openBtn.addEventListener('click', function () {
      var show = form.hidden;
      form.hidden = !show; openBtn.setAttribute('aria-expanded', String(show));
      SFX.move();
      if (!show) return;
      openedAt = Date.now(); leadId = leadId || newId();
      // роль уже выбрана на сайте или пришла в адресе: подставляем её
      if (!form.role.value && (TR.role || store('ce-role'))) form.role.value = role.id;
      TR.goal('form_open', who());
      form.elements.name.focus({ preventScroll: true });
      reveal(form);
    });
    function failed() { busy = false; sendBtn.disabled = false; sendBtn.textContent = T('ОТПРАВИТЬ АНКЕТУ'); note(T('Не получилось отправить форму. Напишите нам в Telegram или на почту, текст обращения уже подготовлен.'), true); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var f = form.elements, bad = null;
      ['name', 'role', 'change', 'contact'].forEach(function (k) {
        var empty = !f[k].value.trim();
        f[k].classList.toggle('is-bad', empty);
        if (empty && !bad) bad = f[k];
      });
      if (bad) { note(T('Заполните поля, отмеченные звёздочкой.')); bad.focus(); return; }
      if (!f.consent.checked) { note(T('Без согласия на обработку персональных данных мы не можем принять анкету.')); f.consent.focus(); return; }
      var elapsed = Date.now() - openedAt;
      if (elapsed < 3000) { note(T('Секунду. Попробуйте отправить ещё раз.')); return; }
      if (f.website.value) { failed(); return; }            // ловушка для роботов: человек это поле не видит
      if (!FORM_ENDPOINT) { failed(); return; }             // сервер ещё не подключён: успех не изображаем
      busy = true; sendBtn.disabled = true; sendBtn.textContent = T('ОТПРАВЛЯЕМ...'); note('');
      var body = {
        id: leadId, name: f.name.value.trim(), role: f.role.value, club: f.club.value.trim(), league: f.league.value.trim(),
        change: f.change.value.trim(), contact: f.contact.value.trim(), consent: true, website: '', elapsed: elapsed,
        r: TR.r || '', utm: TR.utm, site_role: store('ce-role') || TR.role || '', site_path: currentPath ? currentPath.id : '',
        lang: LANG, sport: SPORT, url: location.href.slice(0, 500)
      };
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
        .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, j: j }; }); })
        .then(function (r) {
          clearTimeout(timer);
          var ch = r.j && r.j.channels || {};
          // успех только когда сервер подтвердил доставку хотя бы в один канал
          if (!r.ok || !r.j || !r.j.ok || !(ch.telegram || ch.mail)) { failed(); return; }
          TR.goal('form_submit_ok', { telegram: !!ch.telegram, mail: !!ch.mail });
          form.hidden = true; openBtn.hidden = true; done.hidden = false; SFX.select();
          reveal(done);
        })
        .catch(function () { clearTimeout(timer); failed(); });
    });
  })();

  // Ссылка с якорем (#start и т.п.): разделы дорисовывает скрипт, поэтому после сборки страницы
  // ещё раз встаём на нужный раздел
  if (/^#[a-z]+$/.test(location.hash) && document.getElementById(location.hash.slice(1))) setTimeout(function () {
    document.getElementById(location.hash.slice(1)).scrollIntoView({ behavior: 'auto' });
  }, 80);

  guideSync();
  requestAnimationFrame(loop);
})();
