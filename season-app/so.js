const {chromium}=require('playwright');const D=__dirname;(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:664}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+D+'/'+(process.env.SEASON_PAGE||'test.html'));await p.evaluate(()=>{localStorage.setItem('ce-season-mvp-2',JSON.stringify({sound:false,done:{1:true,2:true},stars:{},role:'D',num:'9',values:['Смелость','Упорство','Честность'],core:false,trust:0,room:0,fix:false,reset:null,life:{1:'yes'},taught:true}))});await p.reload();
await p.evaluate(()=>window.__mvp.seg(3));await p.click('[data-act="match"][data-m="1"]');await p.click('[data-act="go"]');
await p.keyboard.down('ArrowLeft');await p.keyboard.down('ArrowRight');let shots=0,shotSO=false,shotOT=false;
for(let i=0;i<900;i++){ if(await p.locator('.final').count())break;
 if(await p.locator('[data-act="choose"]').count()){await p.click('[data-act="choose"][data-i="1"]');await p.click('[data-act="decided"]');continue;}
 const st=await p.evaluate(()=>{const g=window.__mvp.g();return g?{s:g.puck.s,px:g.px,py:g.py,gx:g.gx,pause:g.pause,so:!!g.so,seg:g.seg,t:g.t}:null});
 if(!st||st.pause>0||st.s!=='ready'||!st.so){ if(st&&st.seg===3&&!shotOT&&st.t>2){shotOT=true;await p.screenshot({path:D+'/w-ot.png'});} await p.waitForTimeout(100);continue;}
 const r=await p.locator('#rink').boundingBox();const X=x=>r.x+x/320*r.width,Y=y=>r.y+y/470*r.height;
 const sx=st.px+20,sy=st.py+20,tx=(st.gx+22)<160?198:122;let dx=tx-sx,dy=84-sy;const l=Math.hypot(dx,dy);dx/=l;dy/=l;
 await p.mouse.move(X(240),Y(400));await p.mouse.down();await p.mouse.move(X(240-dx*55),Y(400-dy*55),{steps:4});
 if(shots%2===0)await p.waitForFunction(()=>{const g=window.__mvp.g();return !g||g.wasFull},null,{timeout:3000}).catch(()=>{});
 if(!shotSO){shotSO=true;await p.screenshot({path:D+'/w-so.png'});}
 await p.mouse.up();shots++;await p.waitForTimeout(300);}
console.log(await p.locator('.tag').first().textContent(),(await p.locator('.final').textContent()).trim(),'shots',shots,errs);
console.log(await p.evaluate(()=>window.__mvp.log().filter(r=>/overtime|shootout|end/.test(r.e)).map(r=>r.e).join(',')));await p.screenshot({path:D+'/w-sores.png'});await b.close()})()
