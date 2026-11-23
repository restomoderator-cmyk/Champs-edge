"""Готовит папку www для приложения: собирает копию игры и оборачивает её в страницу для телефона.
Запуск из любой папки: python3 season-app/ios-app/make_www.py"""
import os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__)); app = os.path.dirname(here)
subprocess.check_call([sys.executable, app + '/build_next.py'])
page = open(app + '/season-next.html', encoding='utf-8').read()
head = ('<!doctype html><html lang="ru"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="format-detection" content="telephone=no">'
        '<style>html,body{margin:0;height:100%;background:#181425;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overscroll-behavior:none}</style>'
        '</head><body>')
os.makedirs(here + '/www', exist_ok=True)
open(here + '/www/index.html', 'w', encoding='utf-8').write(head + page + '</body></html>')
print('www/index.html готов,', len(page), 'символов')
