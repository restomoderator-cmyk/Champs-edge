"""Самопроверка текстов копии игры. Запуск: python3 build_next.py && python3 textcheck.py"""
import re, sys
t = open('season-next.html', encoding='utf-8').read()
js = t[t.index('<script>'):]
bad = 0
def check(name, ok, detail=''):
    global bad
    if not ok: bad += 1
    print(('ok   ' if ok else 'FAIL ') + name + ((' [' + detail + ']') if detail else ''))
check('нет длинного тире', chr(8212) not in t)
check('нет внешних адресов', not re.search(r'https?://', t))
check('нет сетевых вызовов', not re.search(r'fetch\(|XMLHttpRequest|sendBeacon', t))
check('нет уведомлений и геолокации', not re.search(r'Notification|geolocation', t))
dev = re.findall(r"[^'\"<>]{0,40}[Дд]евятк[^'\"<>]{0,30}", js)
check('слово «девятка» только про бросок в угол', all('ДЕВЯТКА!' in d or '//' in d for d in dev), '; '.join(d.strip() for d in dev if 'ДЕВЯТКА!' not in d and '//' not in d)[:200])
real = ['НХЛ', 'КХЛ', 'МХЛ', 'ВХЛ', 'NHL', 'KHL', 'Кубок Стэнли', 'Кубок Гагарина', 'Олимпи']
found = [w for w in real if w in js]
check('нет названий реальных лиг и турниров', not found, ', '.join(found))
price = re.findall(r'\d+\s?(?:₽|руб|\$|USD|€|шек)', js)
check('нет цен', not price, ', '.join(price))
teams = sorted(set(re.findall(r"team: '([^']+)'", js) + re.findall(r"pool\(\d+, '[^']+', '([^']+)'", js) + re.findall(r"var TEAM = '([^']+)'", js)))
rivals = sorted(set(re.findall(r"rival: '([^']+)'", js) + re.findall(r"pool\(\d+, '[^']+', '[^']+', '([^']+)'", js) + re.findall(r"name: '(Зеркало|Часы|Стена)'", js)))
open('docs/nazvaniya-komand.md', 'w', encoding='utf-8').write(
    '# Названия в игре: проверить на совпадения\n\nСписок собран автоматически из сборки (`python3 textcheck.py`). Все названия придуманы и не проверялись на совпадение с настоящими командами, включая детские, любительские и зарубежные.\n\n## Команды\n\n'
    + '\n'.join('- ' + x for x in teams) + '\n\n## Типы вратарей (характеры, не люди)\n\n' + '\n'.join('- ' + x for x in rivals)
    + '\n\n## Что проверить\n\n- Нет ли клуба с таким названием в хоккее, особенно в юношеских лигах.\n- Нет ли зарегистрированного товарного знака в играх и спорте.\n- Не читается ли название как намёк на настоящий клуб.\n- Название самой игры «Сезон» и программы на экране для родителей.\n')
print('команд:', len(teams), '| вратарей:', len(rivals))
print('PASS' if not bad else 'FAIL: %d' % bad); sys.exit(1 if bad else 0)
