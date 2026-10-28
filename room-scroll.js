/* Native scroll-driven staging. No scroll hijacking, playback loop or video seeks. */
(()=>{
 const root=document.querySelector('.room-story');if(!root)return;
 const pin=root.querySelector('.room-pin'),layers=[...root.querySelectorAll('.room-layer')],buttons=[...root.querySelectorAll('.room-step')],fills=buttons.map(b=>b.querySelector('.step-line>span'));
 const count=document.getElementById('room-count'),title=document.getElementById('room-stage-title'),description=document.getElementById('room-stage-description'),hint=document.getElementById('room-hint');
 const titles=['The blank canvas','Warmth & light','Room to unwind','The finishing touch'];
 const descriptions=['Every thoughtful home starts with possibility.','Walnut panels and a soft architectural glow.','A sofa, a rug, a place to slow down.','Art brings the whole room together.'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let ready=false,raf=0,progress=0,target=0,last=0,active=-1,start=0,distance=1,inView=true;
 const clamp=n=>Math.min(1,Math.max(0,n));const ease=n=>{n=clamp(n);return n*n*(3-2*n)};
 function paint(p){
  // Short holds at each fully formed state; interpolation stays continuous in both directions.
  const scaled=clamp((p-.05)/.9)*3;
  layers[0].style.opacity='1';
  for(let i=1;i<4;i++)layers[i].style.opacity=String(ease((scaled-(i-1)-.15)/.7));
  layers.forEach((l,i)=>l.setAttribute('aria-hidden',String(i!==Math.round(scaled))));
  fills.forEach((f,i)=>f.style.transform=`scaleX(${clamp(scaled-i+1)})`);
  const index=Math.round(scaled);
  if(index!==active){active=index;count.textContent=String(index+1).padStart(2,'0');title.textContent=titles[index];description.textContent=descriptions[index];buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
  root.dataset.progress=p.toFixed(4);
 }
 function measure(){start=root.getBoundingClientRect().top+scrollY;distance=Math.max(1,root.offsetHeight-pin.offsetHeight);}
 function tick(now){raf=0;if(!ready||reduced.matches||document.hidden)return;
  const dt=last?Math.min(64,now-last):16.67;last=now;
  progress+=(target-progress)*(1-Math.exp(-dt/75));
  if(Math.abs(target-progress)<.0002)progress=target;
  paint(progress);if(progress!==target)raf=requestAnimationFrame(tick);else last=0;
 }
 function update(){if(!ready||reduced.matches)return;target=clamp((scrollY-start)/distance);if(!raf&&inView)raf=requestAnimationFrame(tick);}
 function mode(){cancelAnimationFrame(raf);raf=0;last=0;root.classList.toggle('is-reduced',reduced.matches);measure();if(reduced.matches){paint(1);hint.textContent='Choose a stage to compare';}else{progress=target=clamp((scrollY-start)/distance);paint(progress);hint.textContent='Scroll to transform · Reverse to rewind';update();}}
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{if(!ready)return;const p=i/3;if(reduced.matches){paint(p);return;}measure();window.scrollTo({top:start+p*distance,behavior:'smooth'});}));
 root.classList.add('is-loading');hint.textContent='Preparing your room…';
 Promise.all(layers.map(l=>l.querySelector('img').decode())).then(()=>{ready=true;root.classList.remove('is-loading');root.classList.add('is-ready');mode();}).catch(()=>{root.classList.remove('is-loading');hint.textContent='Room preview · Full sequence unavailable';buttons.forEach(b=>b.disabled=true);});
 addEventListener('scroll',update,{passive:true});
 let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>{measure();update()},120)},{passive:true});
 reduced.addEventListener('change',()=>{if(ready)mode()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0}else update()});
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;if(inView)update();else{cancelAnimationFrame(raf);raf=0;last=0;}}).observe(root);
})();
