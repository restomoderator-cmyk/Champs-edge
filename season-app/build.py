"""Сборка игры «Сезон»: base.html + engine.js + patch2.py -> season.html (одна страница, шрифты и спрайты внутри)."""
import re, base64, os, shutil, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__)); repo = os.path.dirname(here)
os.chdir(here)
shutil.copy('base.html', 'mvp2.html')
subprocess.check_call([sys.executable, 'patch2.py'])
src = open('mvp2.html', encoding='utf-8').read()
main = open(repo + '/js/main.js', encoding='utf-8').read()
css = open(repo + '/css/style.css', encoding='utf-8').read()
faces = re.findall(r'@font-face \{.*?\}', css, re.S)
def font(m): return 'url("data:font/woff2;base64,%s")' % base64.b64encode(open(repo + '/fonts/' + m.group(1), 'rb').read()).decode()
fonts = '\n'.join(re.sub(r'url\("\.\./fonts/([^"]+)"\)', font, f) for f in faces)
c = main.index('  function drawHockeyPlayer('); d = main.index('  function drawTennisPlayer(')
out = src.replace('/*FONTS*/', fonts).replace('/*SPRITES*/', main[c:d])
assert '—' not in src
open('season.html', 'w', encoding='utf-8').write(out)
js = out[out.index('<script>') + 8:out.rindex('</script>')]
open('check.js', 'w').write(js)
open('test.html', 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + out + '</body></html>')
os.remove('mvp2.html'); print(len(out))
