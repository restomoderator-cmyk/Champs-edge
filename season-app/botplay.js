// Бот-игрок: настоящие касания двумя пальцами. Катается, уходит от активного защитника, выдыхает перед броском,
// говорит своё слово против шума, включает стержень при горячей голове. node botplay.js [секунд на отрезок] [lefty]
const {chromium}=require('playwright');const D=__dirname;const SEG=+process.argv[2]||0;const LEFTY=process.argv[3]==='lefty';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({locale:'ru-RU',viewport:{width:390,height:664},hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+D+'/'+(process.env.SEASON_PAGE||'test-next.html'));
const st0=process.env.SEASON_STATE?JSON.parse(process.env.SEASON_STATE):{sound:false};if(LEFTY)st0.lefty=true;
await p.evaluate(s=>{localStorage.removeItem('ce-season-mvp-log-2');localStorage.setItem('ce-season-mvp-2',s)},JSON.stringify(st0));await p.reload();if(SEG)await p.evaluate(v=>window.__mvp.seg(v),SEG);
const cdp=await ctx.newCDPSession(p);const pts={};let box=null;
const sx=x=>LEFTY?320-x:x;const X=v=>box.x+sx(v)/320*box.width,Y=v=>box.y+v/470*box.height;
const send=t=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:Object.entries(pts).map(([id,q])=>({x:q.x,y:q.y,id:+id}))});
const down=async(id,x,y)=>{pts[id]={x:X(x),y:Y(y)};await send('touchStart')};const move=async(id,x,y)=>{if(!pts[id])return;pts[id]={x:X(x),y:Y(y)};await send('touchMove')};const up=async(id)=>{const q=pts[id];if(!q)return;delete pts[id];await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:q.x,y:q.y,id:+id}]})};
const allUp=async()=>{for(const k of Object.keys(pts))await up(k)};
const click=async s=>{await p.click(s,{timeout:3000});await p.waitForTimeout(100)};const has=async s=>(await p.locator(s).count())>0;
const LX=80,LY=420;let aiming=false,aimT=0,guard=0,played=0,stat={word:0,core:0};
const tap=async()=>{await up(1);await down(1,LX,LY);await up(1);await p.waitForTimeout(60);};
for(;;){ if(++guard>9000){console.log('GUARD');break;}
 const st=await p.evaluate(()=>{const g=window.__mvp.g();if(!g||!document.getElementById('rink'))return null;return {s:g.puck.s,px:g.px,py:g.py,gx:g.gx,pause:g.pause,heat:g.heat,core:g.core,noise:g.noise,clock:g.clock,full:g.wasFull,breath:g.breath,lesson:g.lesson,ch:g.ch?[g.ch.x,g.ch.y]:null,so:!!g.so,vals:(window.__mvp.s().values||[]).length}});
 if(st){ if(process.env.DBG&&guard%20===0)require('fs').appendFileSync('/tmp/bp-dbg.log',JSON.stringify(st)+' '+Object.keys(pts).join()+'\n');if(!box)box=await p.locator('#rink').boundingBox();
  if(st.pause>0){await allUp();aiming=false;await p.waitForTimeout(80);continue;}
  if(st.noise>0.3&&st.lesson>=9){await tap();stat.word++;continue;}
  if(st.core&&st.heat>=0.5&&st.vals&&st.lesson>=9){await tap();await p.waitForTimeout(70);await tap();stat.core++;await p.waitForTimeout(150);continue;}
  // левый палец: стоим у синей линии, а от активного защитника уезжаем
  let dx=0,dy=0;const hx=160,hy=320;
  if(st.ch){const cx=st.px-st.ch[0],cy=st.py-st.ch[1],cd=Math.hypot(cx,cy)||1;if(cd<120){dx=cx/cd;dy=cy/cd;if(st.px<60&&dx<0)dx=1;if(st.px>260&&dx>0)dx=-1;if(st.py<262&&dy<0)dy=0.6;if(st.py>410&&dy>0)dy=-0.4;}}
  if(!dx&&!dy){const tx=hx-st.px,ty=hy-st.py,td=Math.hypot(tx,ty);if(td>14){dx=tx/td;dy=ty/td;}}
  if(!pts[1])await down(1,LX,LY);await move(1,LX+dx*30*(LEFTY?-1:1),LY+dy*30);
  // правый палец: оттяжка в сторону свободного угла, выдох, бросок
  if(st.s==='ready'){
   const sX=st.px+20,sY=st.py+20,tx=(st.gx+22)<160?196:124;let ax=tx-sX,ay=84-sY;const al=Math.hypot(ax,ay);ax/=al;ay/=al;
   if(!aiming){await down(2,240,380);aiming=true;aimT=Date.now();}
   await move(2,240-ax*50*(LEFTY?-1:1),380-ay*50);
   const near=st.ch&&Math.hypot(st.px-st.ch[0],st.py-st.ch[1])<48;const held=Date.now()-aimT;
   if(st.full||near||st.clock<1.6||held>2600||(st.lesson===0&&held>300)){await up(2);aiming=false;await p.waitForTimeout(120);}
  } else if(aiming){await up(2);aiming=false;}
  await p.waitForTimeout(50);continue;}
 box=null;aiming=false;await allUp();
 if(await has('.final')){if(process.env.MAXM&&++played>+process.env.MAXM)break;const t=await p.locator('.tag').first().textContent();console.log(t,'|',(await p.locator('.final').textContent()).trim().slice(0,12),'| звёзд',await p.locator('.star.on').count());if(await has('[data-act="after"]'))await click('[data-act="after"]');else await click('[data-act="go"]');continue;}
 if(await has('[data-act="after"]')){await click('[data-act="after"]');continue;}
 if(await has('[data-act="choose"]')){const n=await p.locator('[data-act="choose"]').count();await click(`[data-act="choose"][data-i="${Math.floor(Math.random()*n)}"]`);continue;}
 if(await has('[data-act="decided"]')){await click('[data-act="decided"]');continue;}
 if(await has('[data-act="pre1done"]')){await click('[data-v="F"]');await click('[data-v="17"]');await click('[data-act="pre1done"]');continue;}
 if(await has('[data-act="valdone"]')){await click('[data-v="Спокойствие"]');await click('[data-v="Упорство"]');await click('[data-v="Радость игры"]');await click('[data-act="valdone"]');continue;}
 if(await has('[data-act="go"]')){await click('[data-act="go"]');continue;}
 if(await has('[data-act="life1go"]')){await click('[data-act="life1go"]');continue;}
 if(await has('[data-act="lifeyes"]')){if(await has('[data-k="gest"]')){await click('[data-k="gest"]');await click('[data-k="word"]');}await click('[data-act="lifeyes"]');continue;}
 if(await has('[data-act="rev"]')){await click('[data-act="rev"][data-i="0"]');continue;}
 if(await has('.node--open')){await click('.node--open');continue;}
 if(await has('[data-act="settings"]')&&!(await has('[data-act="tgl"]')))break;
 if(await has('[data-act="home"]')){await click('[data-act="home"]');continue;}
 await p.waitForTimeout(100);}
const L=await p.evaluate(()=>window.__mvp.log());const c={};L.forEach(r=>{const k=r.e+(r.kind?':'+r.kind:'');c[k]=(c[k]||0)+1});
console.log('своё слово',stat.word,'| стержень',stat.core,'| голов',c.goal||0,'| бросков',c.shot||0,'| отборов',c['miss:steal']||0,'| выбил вратарь',c['miss:poke']||0,'| перехватов',c['miss:icept']||0,'| не успел',c['miss:late']||0,'| потоков',c.flow||0);
console.log('errors',JSON.stringify(errs));await b.close()})()
