(()=>{
 const section=document.querySelector('.service-fan');if(!section)return;
 const deck=section.querySelector('.sf-deck'),cards=[...section.querySelectorAll('.sf-card')],tabs=[...section.querySelectorAll('[role=tab]')],panels=[...section.querySelectorAll('[role=tabpanel]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let active=0,spread=1,target=1,raf=0,last=0,inView=false;
 const clamp=n=>Math.max(0,Math.min(1,n));
 function layout(animate=false){
  const width=deck.clientWidth,mobile=innerWidth<=680,space=mobile?width*.165:Math.min(95,width*.135);
  cards.forEach((card,i)=>{let slot=(i-active+cards.length)%cards.length;if(slot>2)slot-=cards.length;const distance=Math.abs(slot),x=slot*space*spread,y=distance*distance*(mobile?4:7)*spread+90*(1-spread),rot=slot*7.5*spread,scale=(1-distance*.085)*(.75+.25*spread);
   const transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${rot}deg) scale(${scale})`;
   if(animate&&!reduced.matches){const previous=getComputedStyle(card).transform;card.getAnimations().forEach(a=>a.cancel());card.animate([{transform:previous},{transform}],{duration:650,easing:'cubic-bezier(.22,.75,.18,1)',fill:'none'});}
   card.style.transform=transform;card.style.zIndex=String(10-distance);card.style.opacity=String(.55+.45*spread);card.dataset.active=String(i===active);
  });
 }
 function select(i,focus=false){active=(i+cards.length)%cards.length;panels.forEach((p,n)=>p.hidden=n!==active);tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===active));t.tabIndex=n===active?0:-1;});document.getElementById('sf-current').textContent=String(active+1).padStart(2,'0');layout(true);if(focus)tabs[active].focus();section.dataset.service=String(active);}
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();select(e.key==='Home'?0:e.key==='End'?cards.length-1:active+(e.key==='ArrowRight'?1:-1),true);});});
 let swipeAt=0;cards.forEach((c,i)=>c.addEventListener('click',()=>{if(Date.now()-swipeAt>400)select(i)}));
 section.querySelector('[data-sf-prev]').addEventListener('click',()=>select(active-1));section.querySelector('[data-sf-next]').addEventListener('click',()=>select(active+1));
 let startX=0,startY=0;deck.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;startX=e.clientX;startY=e.clientY;},{passive:true});deck.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){swipeAt=Date.now();select(active+(dx<0?1:-1));}},{passive:true});
 function tick(now){raf=0;if(document.hidden||!inView)return;const dt=last?Math.min(50,now-last):16.7;last=now;spread+=(target-spread)*(1-Math.exp(-dt/85));if(Math.abs(target-spread)<.001)spread=target;layout();if(spread!==target)raf=requestAnimationFrame(tick);else last=0;}
 function scroll(){if(!inView||reduced.matches)return;const top=deck.getBoundingClientRect().top;target=clamp((innerHeight-top)/(Math.min(innerHeight*.65,420)));if(!raf)raf=requestAnimationFrame(tick);}
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)scroll();else{cancelAnimationFrame(raf);raf=0;last=0;}},{rootMargin:'80px'}).observe(section);
 addEventListener('scroll',scroll,{passive:true});let resize;addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{layout();scroll()},100)},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else scroll();});
 reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;spread=target=1;layout();scroll();});
 select(0);section.classList.add('sf-ready');
})();
