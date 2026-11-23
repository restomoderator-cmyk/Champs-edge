# Правки текстов копии игры поверх patch2.py (запускается из build_next.py во временной папке)
p='mvp2.html';s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
rep("Защитник: бросок из-за синей линии летит быстрее и пробивает одного защитника, но разворачивается он тяжелее.","Защитник: бросок из-за синей линии летит быстрее, а его щелчок издалека вратарь не успевает прочитать. Разворачивается он тяжелее.")
rep("Три отрезка по 35 секунд.","' + (m.id === 1 ? 'Три коротких отрезка по 25 секунд.' : 'Три отрезка по 35 секунд.') + '")
rep("<title>Edge Season Two Thumbs</title>","<title>Edge Season Next</title>")
rep("    brief(m);\n  }\n  function brief(m) {","    if (m.pre && !(S.pre && S.pre[id])) return m.pre(function () { brief(m); });\n    brief(m);\n  }\n  function brief(m) {")
rep("var si = Math.random() < 0.5 ? 0 : 1,","var si = Math.floor(Math.random() * opts.length),")
rep("Четыре матча пройдены. Дальше в полной версии: дерби и первый месяц до конца.","Все готовые матчи пройдены. Продолжение в работе.")
rep(": '<span class=\"tag tag--mute\">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class=\"h1\">ДЕНЬ, КОГДА МАЛО ИГРАЛ</h1>",": MATCHES[id - 1].life ? '<span class=\"tag tag--mute\">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class=\"h1\">' + MATCHES[id - 1].life.h + '</h1><p class=\"lead\">' + MATCHES[id - 1].life.t + '</p>' : '<span class=\"tag tag--mute\">В НАСТОЯЩЕЙ ЖИЗНИ</span><h1 class=\"h1\">ДЕНЬ, КОГДА МАЛО ИГРАЛ</h1>")
rep("case 'quit': x = 'вышел из матча'; break;","case 'quit': x = 'вышел из матча'; break;\n      case 'word': x = 'сказал своё слово, шум ушёл'; break;")
assert chr(8212) not in s
open(p,'w',encoding='utf-8').write(s)
