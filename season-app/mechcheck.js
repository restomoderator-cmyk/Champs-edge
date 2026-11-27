// Проверка каждого приёма по отдельности, настоящими касаниями (два пальца). node mechcheck.js [страница]
const {chromium}=require('playwright');const D=__dirname;const PAGE=process.argv[2]||'test-next.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:664},hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const cdp=await ctx.newCDPSession(p);const pts={};
const send=async(type)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:Object.entries(pts).map(([id,q])=>({x:q.x,y:q.y,id:+id}))});
let box=null;const X=v=>box.x+v/320*box.width,Y=v=>box.y+v/470*box.height;
const down=async(id,x,y)=>{pts[id]={x:X(x),y:Y(y)};await send('touchStart')};
const move=async(id,x,y)=>{pts[id]={x:X(x),y:Y(y)};await send('touchMove')};
const up=async(id)=>{const q=pts[id];if(!q)return;delete pts[id];await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:q.x,y:q.y,id:+id}]})};
const wait=ms=>p.waitForTimeout(ms);const G=f=>p.evaluate(f);
const done={};for(let i=1;i<=40;i++)done[i]=true;
const base={short:true,sound:false,firstTop:true,done,stars:{},role:'F',num:'9',values:['Смелость','Упорство','Радость игры'],core:true,trust:1,room:1,form:1,rep:1,fix:false,reset:{g:'x',w:'Здесь'},life:{},pre:{5:{heat:0},6:{heat:0},8:{heat:0},11:{focus:'cool'},22:{heat:0},23:{heat:0},24:{heat:0},25:{heat:0},26:{heat:0}},tips:{flow:1,oneT:1,mate:1,mirror:1,noise:1},taught:true};
async function start(id,extra,seg){for(const k in pts)delete pts[k];await p.goto('file://'+D+'/'+PAGE);await p.evaluate(s=>{localStorage.removeItem('ce-season-mvp-log-2');localStorage.setItem('ce-season-mvp-2',s)},JSON.stringify(Object.assign({},base,extra||{})));await p.reload();if(seg)await p.evaluate(v=>window.__mvp.seg(v),seg);
 await p.click(`[data-act="match"][data-m="${id}"]`);await p.click('[data-act="go"]');await ready();box=await p.locator('#rink').boundingBox();}
const ready=()=>p.waitForFunction(()=>{const g=window.__mvp.g();return g&&g.puck.s==='ready'&&g.pause<=0},null,{timeout:20000});
const freeze=()=>G(()=>{const g=window.__mvp.g();g.mg=Object.assign({},g.mg,{speed:0,mirror:false});g.gx=112;g.defs=[];g.ch=null;g.clock=99;g.press=0;g.rate=0;});
const aimHold=async(ms,dx)=>{await down(2,240,380);await move(2,240-(dx||0),430);await wait(ms)};
const lastShot=()=>G(()=>{const L=window.__mvp.log();for(let i=L.length-1;i>=0;i--)if(L[i].e==='shot')return L[i];return null});
const misses=()=>G(()=>window.__mvp.log().filter(r=>r.e==='miss').map(r=>r.kind));
const R=[];const ck=(n,ok,d)=>{R.push([!!ok,n,d]);};
try{
 await start(2);await freeze();
 await aimHold(0,0);const full=await p.waitForFunction(()=>window.__mvp.g().wasFull,null,{timeout:3000}).then(()=>true,()=>false);ck('выдох: линия сжимается до точки, пока палец неподвижен',full);
 await G(()=>{const g=window.__mvp.g();g.px=170;g.vx=0;});for(let k=1;k<=4;k++){await move(2,240+k,430);await wait(70);}
 ck('плавный сдвиг прицела после выдоха не сбрасывает идеальный момент',await G(()=>window.__mvp.g().wasFull));await up(2);await wait(900);
 ck('идеальный бросок в свободный угол: гол',await G(()=>window.__mvp.g().tops>=1),JSON.stringify(await lastShot()));
 await ready();await freeze();await down(2,240,400);await up(2);await wait(300);ck('щелчок: быстрый тап бросает без прицела',(await lastShot()||{}).slap===true);
 await ready();await freeze();await G(()=>{const g=window.__mvp.g();g.heat=0;g.core=true;});await down(1,80,420);await up(1);await wait(80);await down(1,80,420);await up(1);await wait(200);
 ck('стержень при холодной голове не тратится',await G(()=>window.__mvp.g().core===true));
 await G(()=>{const g=window.__mvp.g();g.heat=0.8;});await down(1,80,420);await up(1);await wait(80);await down(1,80,420);await up(1);await wait(200);
 ck('стержень: двойной тап остужает горячую голову',await G(()=>{const g=window.__mvp.g();return g.heat===0&&g.core===false}));
 await ready();await freeze();await G(()=>{const g=window.__mvp.g();g.px=160;g.py=320;g.vx=0;g.vy=0;});await down(1,80,420);await move(1,110,420);await down(2,240,380);await move(2,240,430);await wait(700);
 const two=await G(()=>{const g=window.__mvp.g();return [g.px,!!window.__mvp.pr(),g.breath]});ck('два пальца сразу: один ведёт, другой целится',two[0]>190&&two[1],JSON.stringify(two));await up(1);await up(2);
 await start(5);await freeze();await G(()=>{const g=window.__mvp.g();g.noise=3;g.shield=0;});await down(1,80,420);await up(1);await wait(200);
 ck('своё слово: одиночный тап убирает шум',await G(()=>{const g=window.__mvp.g();return !(g.noise>0)&&g.trig===1}));
 await start(8);await freeze();await G(()=>{const g=window.__mvp.g();g.topRow=2;g.px=170;g.vx=0;});await aimHold(0,0);await p.waitForFunction(()=>window.__mvp.g().wasFull,null,{timeout:3000}).catch(()=>{});await G(()=>{const g=window.__mvp.g();g.px=170;g.vx=0;});await up(2);await wait(900);
 ck('поток: третий идеальный гол подряд включает поток',await G(()=>window.__mvp.g().flow>0||window.__mvp.g().flows>=1));
 await start(9);await freeze();await G(()=>{const g=window.__mvp.g();g.puck={s:'in',t:0.6};g.px=200;});await down(2,240,380);await move(2,225,430);
 await p.waitForFunction(()=>window.__mvp.g().puck.s==='ready',null,{timeout:5000});await wait(120);await up(2);await wait(300);ck('бросок в касание: палец оттянут до паса, отпущен сразу',(await lastShot()||{}).one===true,JSON.stringify(await lastShot()));
 await start(10);await G(()=>{const g=window.__mvp.g();g.defs=[];g.ch=null;g.clock=99;g.rate=0;g.gx=112;});await down(2,240,380);await move(2,205,430);await wait(900);
 const gx=await G(()=>window.__mvp.g().gx);ck('зеркало: вратарь идёт за прицелом',gx>135,'gx '+Math.round(gx));await up(2);
 await start(10);await G(()=>{const g=window.__mvp.g();g.mheat=1;g.defs=[];g.rate=0;Math.random=()=>0.01;});await down(2,240,400);await up(2);await wait(9000);
 ck('голова партнёра: горячий партнёр отдаёт неточный пас',(await misses()).includes('badpass'),(await misses()).join(','));
 await start(13);ck('большинство: защитников на одного меньше и никто не идёт на игрока',await G(()=>{const g=window.__mvp.g();return g.sit==='pp'&&g.defs.length===1&&!g.ch}));
 await start(14);ck('меньшинство: ситуация включена, активный защитник есть',await G(()=>{const g=window.__mvp.g();return g.sit==='pk'&&!!g.ch}));
 await start(17,null,3);await G(()=>{const g=window.__mvp.g();g.you=3;g.rate=0;g.press=0;});await p.waitForFunction(()=>{const g=window.__mvp.g();return g&&g.seg===2&&g.puck.s==='ready'&&g.pause<=0},null,{timeout:30000});
 ck('пустые ворота: ведёшь перед концовкой, вратаря нет',await G(()=>window.__mvp.g().empty===true));
 await start(3);await G(()=>{const g=window.__mvp.g();g.rate=0;g.press=0;g.ch=null;g.px=160;g.py=110;g.vx=0;g.vy=0;});await down(1,80,420);await wait(500);
 ck('вратарь выбивает шайбу из своей рамки',(await misses()).includes('poke'),(await misses()).join(','));await G(()=>{const g=window.__mvp.g();g.px=160;g.py=330;});await up(1);
 await ready();const gr=await G(()=>window.__mvp.g().grace);ck('пауза после потери: шайбу какое-то время нельзя отобрать',gr>0.5,'grace '+gr);
 await down(1,80,420);await G(()=>{const g=window.__mvp.g();const d=g.defs[0];g.px=d.x+25;g.py=d.y+15;g.grace=1.2;});await wait(300);const m1=(await misses()).filter(k=>k==='steal').length;await wait(1500);await G(()=>{const g=window.__mvp.g();if(g.puck.s==='ready'){const d=g.defs[0];g.px=d.x+25;g.py=d.y+15;}});await wait(400);
 ck('защитник на линии: в паузе не отбирает, после паузы отбирает',m1===0&&(await misses()).includes('steal'),(await misses()).join(','));await up(1);
 await start(3);await G(()=>{const g=window.__mvp.g();g.rate=0;g.press=0;g.safe=false;});await down(1,80,420);
 for(let i=0;i<120&&!(await misses()).includes('icept');i++){await G(()=>{const g=window.__mvp.g();g.ch=null;if(g.puck.s==='in'){g.px=40;g.py=120;g.mate={x:290,y:330};g.safe=false;}else if(g.puck.s==='ready'){g.px=40;g.py=300;g.clock=99;}});if(await G(()=>window.__mvp.g().puck.s==='ready')){await down(2,240,400);await up(2);}await wait(100);}
 ck('перехват: пас через защитника забирают',(await misses()).includes('icept'),(await misses()).join(','));await up(1);
 await start(1,{firstTop:false});await G(()=>{const g=window.__mvp.g();g.clock=99;g.rate=0;g.px=170;g.vx=0;g.gx=150;});await down(1,80,420);await aimHold(0,0);await p.waitForFunction(()=>window.__mvp.g().wasFull,null,{timeout:3000}).catch(()=>{});await G(()=>{const g=window.__mvp.g();g.gx=Math.max(110,Math.min(166,g.px+20-22));g.mg=Object.assign({},g.mg,{speed:0});});await up(2);await wait(900);await up(1);
 ck('первый в жизни идеальный бросок заходит, даже если вратарь стоит на линии',await G(()=>window.__mvp.g().goals>=1&&window.__mvp.s().firstTop===true));
 await start(2);await G(()=>{const g=window.__mvp.g();g.heat=0.9;g.hotLong=4.9;g.clock=99;g.rate=0;g.ch=null;});await wait(900);ck('горячая голова: через пять секунд появляется подсказка',await p.locator('#coach:not([hidden])').count()===1&&/ГОЛОВА ГОРИТ/.test(await p.locator('#coach').textContent()));
 await start(2,{lefty:true});await G(()=>{const g=window.__mvp.g();g.px=160;g.vx=0;g.defs=[];g.ch=null;g.clock=99;});await down(1,240,420);await move(1,270,420);await wait(600);const lx=await G(()=>window.__mvp.g().px);await up(1);
 await down(2,80,380);await move(2,80,430);await wait(300);const lpr=await G(()=>!!window.__mvp.pr());await up(2);ck('режим левши: правая сторона ведёт, левая бросает',lx>190&&lpr,'px '+Math.round(lx)+' aim '+lpr);
}catch(e){ck('сценарии дошли до конца',false,String(e.message).slice(0,200));}
let fail=0;for(const [ok,n,d] of R){if(!ok)fail++;console.log((ok?'ok   ':'FAIL ')+n+(ok||!d?'':'  ['+d+']'));}
if(errs.length){fail++;console.log('FAIL ошибки страницы: '+errs.slice(0,3).join(' | '));}
console.log(fail?`FAIL: не сработало приёмов: ${fail} из ${R.length}`:`PASS: все ${R.length} приёмов сработали`);await b.close();process.exit(fail?1:0)})()
