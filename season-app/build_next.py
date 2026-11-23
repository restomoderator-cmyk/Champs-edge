"""Сборка копии игры: base.html + engine-next.js + patch2.py (+ patch-next.py, если есть) -> season-next.html.
Текущую сборку season.html и её исходники не трогает: работает во временной папке."""
import re, base64, os, shutil, subprocess, sys, tempfile
here = os.path.dirname(os.path.abspath(__file__)); repo = os.path.dirname(here)
tmp = tempfile.mkdtemp()
shutil.copy(here + '/base.html', tmp + '/mvp2.html'); shutil.copy(here + '/engine-next.js', tmp + '/engine.js')
subprocess.check_call([sys.executable, here + '/patch2.py'], cwd=tmp)
if os.path.exists(here + '/patch-next.py'): subprocess.check_call([sys.executable, here + '/patch-next.py'], cwd=tmp)
src = open(tmp + '/mvp2.html', encoding='utf-8').read(); shutil.rmtree(tmp)
main = open(repo + '/js/main.js', encoding='utf-8').read()
css = open(repo + '/css/style.css', encoding='utf-8').read()
faces = re.findall(r'@font-face \{.*?\}', css, re.S)
def font(m): return 'url("data:font/woff2;base64,%s")' % base64.b64encode(open(repo + '/fonts/' + m.group(1), 'rb').read()).decode()
fonts = '\n'.join(re.sub(r'url\("\.\./fonts/([^"]+)"\)', font, f) for f in faces)
c = main.index('  function drawHockeyPlayer('); d = main.index('  function drawTennisPlayer(')
out = src.replace('/*FONTS*/', fonts).replace('/*SPRITES*/', main[c:d])
assert '—' not in src
os.chdir(here)
# файлы художника и композитора из assets/ вшиваются в страницу; игра берёт их вместо заглушек
import glob, json
assets = {}
for f in sorted(glob.glob(here + '/assets/*')):
    ext = f.rsplit('.', 1)[-1].lower(); mime = {'png': 'image/png', 'wav': 'audio/wav', 'mp3': 'audio/mpeg'}.get(ext)
    if mime: assets[os.path.basename(f)] = 'data:%s;base64,%s' % (mime, base64.b64encode(open(f, 'rb').read()).decode())
if assets:
    k = out.rindex('<script>'); out = out[:k] + '<script>window.__assets = ' + json.dumps(assets) + ';</script>\n' + out[k:]
    print('вшито файлов из assets:', len(assets))
open('season-next.html', 'w', encoding='utf-8').write(out)
js = out[out.rindex('<script>') + 8:out.rindex('</script>')]
open('check-next.js', 'w').write(js)
open('test-next.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + out + '</body></html>')
print(len(out))
