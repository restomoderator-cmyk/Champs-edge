#!/usr/bin/env python3
"""Собирает страницы /hockey/ и /tennis/ из index.html.

Запускать из корня репозитория после любой правки index.html:

    python3 tools/make-sport-pages.py

Страницы отличаются от главной только заголовком, описанием, адресами для поисковиков
и видом спорта, который открывается сразу. Править руками hockey/index.html и
tennis/index.html не нужно: они перезаписываются.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://edgechamps.com/'
TITLE = "Champion's Edge: индивидуальное развитие профессиональных атлетов"
WHO = 'профессиональных хоккеистов и атлетов'

PAGES = {
    'hockey': {
        'title': "Champion's Edge Hockey: индивидуальное развитие профессиональных хоккеистов",
        'who': 'профессиональных хоккеистов',
        'cut': [],
        # пояснение про теннисную программу хоккейной странице не нужно
        'cut_re': [r'[ \t]*<p class="only-tennis">.*?</p>\n'],
    },
    'tennis': {
        'title': "Champion's Edge Tennis: индивидуальное развитие профессиональных теннисистов",
        'who': 'профессиональных теннисистов',
        # в тексте для поисковиков хоккейные лиги теннисной странице не нужны
        # ...и офлайн-месяц в Москве: он относится только к хоккейной программе
        'cut': [', один месяц из двенадцати проходит офлайн на тренировочной базе в Москве'],
        # в тексте для поисковиков теннис называется первым
        'swap': [('хоккей, футбол, теннис, баскетбол', 'теннис, хоккей, футбол, баскетбол'),
                 ('для игроков 32+', 'для игроков 30+'),
                 (' Опыт работы с игроками НХЛ, КХЛ, ВХЛ и МХЛ.', ' Методика отработана с игроками НХЛ, КХЛ, ВХЛ и МХЛ.')],
    },
}

def must_replace(html, old, new):
    if old not in html:
        sys.exit('make-sport-pages: в index.html не найдено: ' + old[:70])
    return html.replace(old, new)

src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
for sport, cfg in PAGES.items():
    html = src
    html = must_replace(html, '<html lang="ru" data-pages>', '<html lang="ru" data-pages data-sport-page="%s">' % sport)
    html = must_replace(html, '<head>', '<head>\n<!-- Файл собран из index.html скриптом tools/make-sport-pages.py. Не править руками. -->')
    html = must_replace(html, TITLE, cfg['title'])
    html = must_replace(html, WHO, cfg['who'])
    for piece in cfg['cut']:
        html = must_replace(html, piece, '')
    for pattern in cfg.get('cut_re', []):
        html, n = re.subn(pattern, '', html, flags=re.S)
        if not n: sys.exit('make-sport-pages: не найдено по шаблону: ' + pattern)
    for old, new in cfg.get('swap', []):
        html = must_replace(html, old, new)
    # адреса страницы для поисковиков и превью
    html = must_replace(html, '"%s?lang=en"' % SITE, '"%s%s/?lang=en"' % (SITE, sport))
    html = re.sub(r'(<meta property="og:url" content="|<link rel="canonical" href="|hreflang="(?:ru|x-default)" href=")' + re.escape(SITE) + '"',
                  lambda m: m.group(1) + SITE + sport + '/"', html)
    # файлы сайта лежат уровнем выше
    html = re.sub(r'(src|href)="(js|css|img|fonts)/', r'\1="../\2/', html)
    os.makedirs(os.path.join(ROOT, sport), exist_ok=True)
    open(os.path.join(ROOT, sport, 'index.html'), 'w', encoding='utf-8').write(html)
    print('ok', sport + '/index.html')
