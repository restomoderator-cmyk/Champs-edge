// Быстрая примерка баланса: node tune.js '{"topV":1.5}' 60
const {chromium}=require('playwright');const D=__dirname;const over=JSON.parse(process.argv[2]||'{}');const N=+process.argv[3]||60;(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+D+'/test-next.html');await p.evaluate(o=>Object.assign(window.__seasonTune,o),over);
const rows=[['ace',{},'ace F'],['ace',{role:'D'},'ace D'],['panicker',{},'panic'],['camper',{cx:160,cy:250},'camp250'],['camper',{cx:160,cy:200},'camp200'],['camper',{cx:160,cy:165},'camp165'],['skater',{},'skater'],['novice',{},'novice'],['spammer',{},'spam'],['spammer',{role:'D'},'spam D']];
for(const [bot,cfg,name] of rows){let line=name.padEnd(9);for(let id=1;id<=4;id++){const a=await p.evaluate(([b,i,n,c])=>window.__mvp.sim(b,i,n,c),[bot,id,N,cfg]);const f=x=>(x/Math.max(1,a.n)).toFixed(1);line+=`${f(a.you).padStart(5)}:${f(a.riv)} ${String(Math.round(100*a.win/Math.max(1,a.n))).padStart(3)}%`+(a.hung?'H':' ')+' |';}console.log(line);}
if(errs.length)console.log('errors',errs);await b.close()})()
