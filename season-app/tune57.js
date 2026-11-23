// Примерка матчей 5+: node tune57.js '{"5":{"tune":{"paceK":1.4}}}' 150
const {chromium}=require('playwright');const over=JSON.parse(process.argv[2]||'{}');const N=+process.argv[3]||150;(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/test-next.html');await p.evaluate(o=>{for(const id in o){const m=window.__seasonMatches[id-1];for(const k in o[id]){if(k==='tune')Object.assign(m.tune,o[id].tune);else m[k]=o[id][k];}}},over);
const ids=Object.keys(over).length?Object.keys(over).map(Number):[5,6,7];
for(const [bot,cfg,name] of [['ace',{},'ace'],['panicker',{},'panic'],['camper',{cx:160,cy:165},'camp165'],['camper',{cx:160,cy:250},'camp250']]){let line=name.padEnd(9);for(const id of ids){const a=await p.evaluate(([b,i,n,c])=>window.__mvp.sim(b,i,n,c),[bot,id,N,cfg]);const n=Math.max(1,a.n);line+=`M${id} ${(a.you/n).toFixed(1)}:${(a.riv/n).toFixed(1)} ${Math.round(100*a.win/n)}% | `;}console.log(line);}
if(errs.length)console.log(errs);await b.close()})()
