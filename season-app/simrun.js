const {chromium}=require('playwright');const D=__dirname;const N=+process.argv[2]||60;(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+D+'/'+(process.env.SEASON_PAGE||'test.html'));
const rows=[['novice',{}],['spammer',{}],['skater',{}],['ace',{}],['panicker',{}],['camper',{cx:160,cy:250},'засадник у синей'],['camper',{cx:160,cy:200},'засадник между защ.'],['camper',{cx:160,cy:165},'засадник у рамки'],['camper',{cx:62,cy:135},'засадник сбоку ворот'],['ace',{role:'D'},'отличник-защитник']];
const pad=(s,n)=>String(s).padEnd(n);console.log(pad('бот',22)+['М1','М2','М3','М4'].map(x=>pad(x+' счёт  поб% от% зв гор пот',34)).join(''));
for(const [bot,cfg,name] of rows){let line=pad(name||bot,22);for(let id=1;id<=4;id++){const a=await p.evaluate(([b,i,n,c])=>window.__mvp.sim(b,i,n,c),[bot,id,N,cfg]);const f=(x,d=1)=>(x/Math.max(1,a.n)).toFixed(d);
 line+=pad(`${f(a.you)}:${f(a.riv)} ${Math.round(100*a.win/Math.max(1,a.n))}% ${Math.round(100*a.ot/Math.max(1,a.n))}% ${f(a.stars)} ${f(a.hot,0)} ${f(a.loss)}`+(a.hung?' HUNG'+a.hung:''),34);}console.log(line);}
console.log('errors',errs);await b.close()})()
