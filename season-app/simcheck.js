// Проверка баланса: node simcheck.js [матчей на ячейку] [страница]. Печатает таблицу и PASS/FAIL по целям из PLAN.md.
const {chromium}=require('playwright');const D=__dirname;const N=+process.argv[2]||150;const PAGE=process.argv[3]||'test-next.html';(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+D+'/'+PAGE);
const rows=[['aceF','ace',{},'отличник, нападающий'],['aceD','ace',{role:'D'},'отличник, защитник'],['panic','panicker',{},'паникёр'],['c250','camper',{cx:160,cy:250},'засадник у синей'],['c200','camper',{cx:160,cy:200},'засадник между защ.'],['c165','camper',{cx:160,cy:165},'засадник у рамки'],['skater','skater',{},'катала'],['novice','novice',{},'новичок'],['spam','spammer',{},'торопыга']];
const NM=await p.evaluate(()=>window.__seasonMatches.length);const R={};let hung=0;console.log('бот'.padEnd(24)+Array.from({length:NM},(_,i)=>('М'+(i+1)).padEnd(15)).join(''));
for(const [key,bot,cfg,name] of rows){R[key]=[];let line=name.padEnd(24);for(let id=1;id<=NM;id++){const a=await p.evaluate(([b,i,n,c])=>window.__mvp.sim(b,i,n,c),[bot,id,N,cfg]);const n=Math.max(1,a.n);hung+=a.hung;const m={you:a.you/n,riv:a.riv/n,win:100*a.win/n,ot:100*a.ot/n,stars:a.stars/n,loss:a.loss/n};R[key].push(m);line+=`${m.you.toFixed(1)}:${m.riv.toFixed(1)} ${Math.round(m.win)}%`.padEnd(15);}console.log(line);}
const checks=[];const ck=(name,ok,detail)=>checks.push([ok,name,detail]);const W=[100,95,88,75];
ck('матч 1: у отличника 10-14 голов',R.aceF[0].you>=10&&R.aceF[0].you<=14,R.aceF[0].you.toFixed(1));
ck('матч 1: новичок выигрывает от 50%',R.novice[0].win>=50,Math.round(R.novice[0].win)+'%');
for(let i=0;i<4;i++){const d=Math.abs(R.aceD[i].you-R.aceF[i].you)/R.aceF[i].you*100;ck(`матч ${i+1}: защитник и нападающий в пределах 12% по голам`,d<=12,d.toFixed(0)+'%');}
for(let i=0;i<4;i++)ck(`матч ${i+1}: побед у отличника около ${W[i]}% (допуск 7)`,Math.abs(R.aceF[i].win-W[i])<=7,Math.round(R.aceF[i].win)+'%');
const LATE={5:[70,90],6:[65,88],7:[50,70]};for(const id in LATE)if(R.aceF[id-1]){ck(`матч ${id}: побед у отличника от ${LATE[id][0]} до ${LATE[id][1]}%`,R.aceF[id-1].win>=LATE[id][0]&&R.aceF[id-1].win<=LATE[id][1],Math.round(R.aceF[id-1].win)+'%');ck(`матч ${id}: паникёр хуже отличника от 10 пунктов`,R.aceF[id-1].win-R.panic[id-1].win>=10,Math.round(R.panic[id-1].win)+'%');}
if(R.aceF[6])ck('дерби (матч 7) труднее матчей 5 и 6 для отличника',R.aceF[6].win<R.aceF[4].win&&R.aceF[6].win<R.aceF[5].win,'');
ck('паникёр нигде не лучше отличника',R.panic.every((m,i)=>m.win<=R.aceF[i].win+3),R.panic.map(m=>Math.round(m.win)).join('/'));
ck('паникёр заметно хуже отличника в матче 3 или 4 (от 10 пунктов)',R.aceF[2].win-R.panic[2].win>=10||R.aceF[3].win-R.panic[3].win>=10,'');
for(const k of ['c250','c200','c165'])ck(`засадник (${k}) нигде не выигрывает чаще отличника`,R[k].every((m,i)=>m.win<=R.aceF[i].win+5),R[k].map(m=>Math.round(m.win)).join('/'));
ck('торопыга забивает в среднем от 0.8 гола в матчах 1-4',R.spam.slice(0,4).every(m=>m.you>=0.8),R.spam.slice(0,4).map(m=>m.you.toFixed(1)).join('/'));
ck('соперник забивает отличнику хотя бы 0.5 гола в каждом матче',R.aceF.every(m=>m.riv>=0.5),R.aceF.map(m=>m.riv.toFixed(1)).join('/'));
ck('ни один матч не завис, ошибок нет',hung===0&&errs.length===0,`зависло ${hung}, ошибок ${errs.length}`);
console.log('');let fail=0;for(const [ok,name,detail] of checks){if(!ok)fail++;console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ['+detail+']':''));}
console.log('\n'+(fail?`FAIL: не выполнено целей: ${fail} из ${checks.length}`:`PASS: все ${checks.length} целей выполнены`)+`  (по ${N} матчей на ячейку)`);await b.close();process.exit(fail?1:0)})()
