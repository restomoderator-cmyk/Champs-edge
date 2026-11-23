const {chromium}=require('playwright');const D=__dirname;const MODE=process.argv[2]||'pro';(async()=>{const b=await chromium.launch();
 const c=await b.newContext({locale:'ru-RU',viewport:{width:390,height:664}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+D+'/'+(process.env.SEASON_PAGE||'test.html'));if(process.env.SEASON_STATE){await p.evaluate(s=>localStorage.setItem('ce-season-mvp-2',s),process.env.SEASON_STATE);await p.reload();}await p.waitForTimeout(300);if(process.argv[3])await p.evaluate(v=>window.__mvp.seg(v),+process.argv[3]);
 const shot=n=>p.screenshot({path:D+'/w-'+n+'.png'});const seen={};const once=async n=>{if(!seen[n]){seen[n]=1;await shot(n);}};
 const click=async s=>{await p.click(s,{timeout:3000});await p.waitForTimeout(120)};const has=async s=>(await p.locator(s).count())>0;
 let guard=0,shots=0,quitDone=false;
 for(;;){ if(++guard>5000){console.log('GUARD');break;}
  const playing=await p.evaluate(()=>!!window.__mvp.g()&&!!document.getElementById('rink'));
  if(playing){
   const st=await p.evaluate(()=>{const g=window.__mvp.g();return {s:g.puck.s,px:g.px,py:g.py,gx:g.gx,pause:g.pause,heat:g.heat,lesson:g.lesson,core:g.core,t:g.t,seg:g.seg}});
   await p.keyboard.down('ArrowLeft');await p.keyboard.down('ArrowRight');
   if(st.pause>0||st.s!=='ready'){await p.waitForTimeout(80);continue;}
   if(!quitDone&&st.seg===1&&st.t>3){quitDone=true;await click('[data-act="back"]');await shot('quit');await click('[data-act="quitno"]');continue;}
   const r=await p.locator('#rink').boundingBox();const X=x=>r.x+x/320*r.width,Y=y=>r.y+y/470*r.height;
   if(st.core&&st.heat>=0.5){await p.mouse.click(X(80),Y(430));await p.waitForTimeout(90);await p.mouse.click(X(80),Y(430));await p.waitForTimeout(200);await once('core');continue;}
   
   const sx=st.px+20,sy=st.py+20,tx=(st.gx+22)<160?196:124;let dx=tx-sx,dy=84-sy;const l=Math.hypot(dx,dy);dx/=l;dy/=l;
   await p.mouse.move(X(240),Y(400));await p.mouse.down();await p.mouse.move(X(240-dx*55),Y(400-dy*55),{steps:4});
   if(MODE==='pro'||st.lesson===1){await p.waitForFunction(()=>{const g=window.__mvp.g();return !g||g.wasFull||g.puck.s!=='ready'},null,{timeout:4000}).catch(()=>{});await once('breath-'+guard);await p.waitForTimeout(80);}
   else {await p.waitForTimeout(200);if(st.heat>0.5)await once('hot');}
   await p.mouse.up();shots++;await p.waitForTimeout(250);continue;}
  if(await has('.final')){const t=await p.locator('.tag').first().textContent();console.log(t,'|',(await p.locator('.final').textContent()).trim(),'| stars',await p.locator('.star.on').count(),'|',(await p.locator('.stats').textContent()));await shot('result-'+t.slice(5,6));if(await has('[data-act="after"]'))await click('[data-act="after"]');else await click('[data-act="go"]');continue;}
  if(!(await has('.final'))&&await has('[data-act="after"]')){await once('world');await click('[data-act="after"]');continue;}
  if(await has('[data-act="choose"]')){await once('decide-'+guard);await click('[data-act="choose"][data-i="0"]');await once('decided-'+guard);continue;}
  if(await has('[data-act="decided"]')){await click('[data-act="decided"]');continue;}
  if(await has('[data-act="pre1done"]')){await click('[data-v="F"]');await p.fill('[data-inp="num"]','4x5');await shot('pre1');await click('[data-act="pre1done"]');continue;}
  if(await has('[data-act="valdone"]')){await click('[data-v="Смелость"]');await click('[data-v="Честность"]');await click('[data-v="Радость игры"]');await shot('values');await click('[data-act="valdone"]');continue;}
  if(await has('[data-act="go"]')){await shot('brief-'+guard);await click('[data-act="go"]');continue;}
  if(await has('[data-act="life1go"]')){await shot('life-intro');await click('[data-act="life1go"]');continue;}
  if(await has('[data-act="lifeyes"]')){if(await has('[data-k="gest"]')){await click('[data-k="gest"]');await p.fill('[data-inp="word"]','Погнали');}await shot('life-'+guard);await click('[data-act="lifeyes"]');continue;}
  if(await has('[data-act="rev"]')){await click('[data-act="rev"][data-i="0"]');continue;}
  if(await has('.node--open')){await click('.node--open');continue;}
  if(await has('[data-act="home"]')){await click('[data-act="home"]');continue;}
  if(await has('[data-act="settings"]')&&!(await has('[data-act="tgl"]'))){await shot('home-end');break;}
  if(await has('[data-act="logs"]')){await shot('home-end');await click('[data-act="logs"]');await shot('logs');break;}
  await p.waitForTimeout(100);}
 const L=await p.evaluate(()=>window.__mvp.log());const cnt={};L.forEach(r=>{const k=r.e+(r.kind?':'+r.kind:'');cnt[k]=(cnt[k]||0)+1});
 console.log(MODE,'shots',shots,JSON.stringify(await p.evaluate(()=>window.__mvp.s())));console.log(JSON.stringify(cnt));console.log('errors',errs);
 await b.close()})()
