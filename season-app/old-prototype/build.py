import re,base64,sys,os
here=os.path.dirname(os.path.abspath(__file__)); repo='/home/user/Champs-edge'
src=open(here+'/src.html',encoding='utf-8').read()
main=open(repo+'/js/main.js',encoding='utf-8').read()
css=open(repo+'/css/style.css',encoding='utf-8').read()
faces=re.findall(r'@font-face \{.*?\}',css,re.S)
def font(m): return 'url("data:font/woff2;base64,%s")'%base64.b64encode(open(repo+'/fonts/'+m.group(1),'rb').read()).decode()
fonts='\n'.join(re.sub(r'url\("\.\./fonts/([^"]+)"\)',font,f) for f in faces)
a=main.index('  var ICONS = {'); b=main.index('  function drawIcon('); b=main.index('\n  }\n',b)+5
c=main.index('  function drawHockeyPlayer('); d=main.index('  var drawPlayer')
out=src.replace('/*FONTS*/',fonts).replace('/*SPRITES*/',main[a:b]+'\n'+main[c:d])
assert '—' not in src, 'em dash in text'
open(here+'/season.html','w',encoding='utf-8').write(out); print(len(out))
