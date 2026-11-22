# Правки текстов копии игры поверх patch2.py (запускается из build_next.py во временной папке)
p='mvp2.html';s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)
rep("Защитник: бросок из-за синей линии летит быстрее и пробивает одного защитника, но разворачивается он тяжелее.","Защитник: бросок из-за синей линии летит быстрее, а его щелчок издалека вратарь не успевает прочитать. Разворачивается он тяжелее.")
rep("Три отрезка по 35 секунд.","' + (m.id === 1 ? 'Три коротких отрезка по 25 секунд.' : 'Три отрезка по 35 секунд.') + '")
rep("<title>Edge Season Two Thumbs</title>","<title>Edge Season Next</title>")
assert '—' not in s
open(p,'w',encoding='utf-8').write(s)
