(()=>{
 const root=document.querySelector('.world-section');if(!root)return;
 const atlas=root.querySelector('.wm-atlas'),routes=[...root.querySelectorAll('.wm-route')],buttons=[...root.querySelectorAll('[data-country]')],bridge=root.querySelector('.wm-bridge'),previous=document.querySelector('.pg-bottom'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const countries=['the United States','Canada','Australia'];let raf=0,visible=false,selected=0;
 const clamp=n=>Math.max(0,Math.min(1,n));
 function select(i){selected=i;buttons.forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.country===i)));routes.forEach((r,n)=>r.classList.toggle('is-selected',n===i));document.getElementById('wm-project-title').textContent=`Planning a home in ${countries[i]}?`;root.dataset.country=i;}
 buttons.forEach(b=>b.addEventListener('click',()=>select(+b.dataset.country)));
 function paint(){raf=0;if(!visible||document.hidden)return;const top=root.getBoundingClientRect().top,at=atlas.getBoundingClientRect().top;
  const entry=reduced.matches?1:clamp((innerHeight-top)/(innerHeight*.6));bridge.style.setProperty('--entry',entry);if(previous)previous.style.setProperty('--wm-entry',entry);
  const progress=reduced.matches?1:clamp((innerHeight-at)/(Math.min(innerHeight*.8,atlas.clientHeight*.95)));
  root.style.setProperty('--land',String(.45+.55*progress));routes.forEach((r,i)=>{const draw=clamp((progress-i*.12)/.72);r.style.strokeDashoffset=String(1-draw)});root.dataset.progress=progress.toFixed(3);
 }
 function update(){if(visible&&!raf&&!document.hidden)raf=requestAnimationFrame(paint);}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)update();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'150px'}).observe(root);
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update,{passive:true});document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);select(0);
})();
