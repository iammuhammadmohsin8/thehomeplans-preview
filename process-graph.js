(()=>{
 const root=document.querySelector('.process-graph');if(!root)return;
 const pin=root.querySelector('.pg-pin'),nodes=[...root.querySelectorAll('[data-pg-step]')],panels=[...root.querySelectorAll('[data-pg-detail]')],lines=[...root.querySelectorAll('[data-pg-line]')],ring=root.querySelector('.pg-progress-ring');
 const names=['Your brief','The scope','Design & review','Your files'],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let active=-1,progress=0,target=0,start=0,distance=1,raf=0,last=0,visible=true;
 const clamp=x=>Math.max(0,Math.min(1,x));
 function paint(p){const phase=clamp(p)*4,index=Math.min(3,Math.floor(phase));ring.style.strokeDashoffset=String(1-clamp(p));lines.forEach((line,i)=>{line.style.strokeDashoffset=String(1-clamp(phase-i+.15));line.style.opacity=i===index?'1':'.35';});
  if(index!==active){active=index;nodes.forEach((node,i)=>node.setAttribute('aria-pressed',String(i===index)));panels.forEach((panel,i)=>{panel.hidden=i!==index;if(i===index&&!reduced.matches)panel.animate([{opacity:0,transform:'translateX(18px)'},{opacity:1,transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});});document.getElementById('pg-heart-label').textContent=names[index];document.getElementById('pg-count').textContent=String(index+1).padStart(2,'0');}
  root.dataset.stage=index;root.dataset.progress=p.toFixed(4);
 }
 function measure(){start=root.getBoundingClientRect().top+scrollY;distance=Math.max(1,root.offsetHeight-pin.offsetHeight);}
 function tick(now){raf=0;if(document.hidden||!visible)return;const dt=last?Math.min(now-last,50):16.7;last=now;progress+=(target-progress)*(1-Math.exp(-dt/70));if(Math.abs(progress-target)<.0001)progress=target;paint(progress);if(progress!==target)raf=requestAnimationFrame(tick);else last=0;}
 function update(){if(reduced.matches)return;target=clamp((scrollY-start)/distance);if(visible&&!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
 function mode(){cancelAnimationFrame(raf);raf=0;last=0;root.classList.toggle('pg-static',reduced.matches);measure();progress=target=reduced.matches?0:clamp((scrollY-start)/distance);paint(progress);document.getElementById('pg-scroll-hint').textContent=reduced.matches?'Choose a step to explore':'Scroll to follow the journey';}
 nodes.forEach((node,i)=>node.addEventListener('click',()=>{const p=(i+.45)/4;if(reduced.matches){progress=target=p;paint(p);}else{measure();scrollTo({top:start+p*distance,behavior:'smooth'});}}));
 addEventListener('scroll',update,{passive:true});let resize;addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{measure();update()},120)},{passive:true});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)update();else{cancelAnimationFrame(raf);raf=0;last=0;}}).observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else update();});reduced.addEventListener('change',mode);
 // Earlier media and font loading can shift the section's document offset.
 new ResizeObserver(()=>{measure();update()}).observe(document.querySelector('main'));addEventListener('load',()=>{measure();update()});mode();
})();
