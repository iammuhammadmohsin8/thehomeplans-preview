/* Adapted from the React Murmuration Wordmark supplied by the client.
   Native canvas integration for the existing static/WordPress preview. */
(() => {
 const root=document.querySelector('.murmuration-hero'); if(!root)return;
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'); if(!ctx)return;
 const stage=root.querySelector('.flock-stage'),pause=root.querySelector('.flock-pause');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let w=1,h=1,dpr=1,birds=[],points=[],sky,raf=0,last=0,time=0,visible=true,paused=motion.matches,hx=-9999,hy=-9999;
 let seed=11;const random=()=>{seed=(seed+0x6d2b79f5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
 const ease=k=>{k=Math.max(0,Math.min(1,k));return k*k*(3-2*k)};
 function curl(x,y,t){const a=1.7*x+t,b=1.3*y-.6*t,c=2.9*y+1.1*x-.8*t,d=4.3*x-3.7*y+1.3*t;return[-1.3*Math.sin(a)*Math.sin(b)+1.74*Math.cos(c)+1.295*Math.sin(d),-1.7*Math.cos(a)*Math.cos(b)-.66*Math.cos(c)+1.505*Math.sin(d)];}
 function layout(){
  const r=stage.getBoundingClientRect();w=Math.max(1,Math.round(r.width));h=Math.max(1,Math.round(r.height));dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=w*dpr;canvas.height=h*dpr;
  sky=document.createElement('canvas');sky.width=canvas.width;sky.height=canvas.height;const s=sky.getContext('2d');s.scale(dpr,dpr);
  const g=s.createLinearGradient(0,0,0,h);g.addColorStop(0,'#d9e1d5');g.addColorStop(.65,'#efe9dd');g.addColorStop(1,'#e4cdb0');s.fillStyle=g;s.fillRect(0,0,w,h);
  const sun=s.createRadialGradient(w*.76,h*.67,0,w*.76,h*.67,w*.42);sun.addColorStop(0,'#fff8e8');sun.addColorStop(.3,'rgba(255,248,232,.5)');sun.addColorStop(1,'rgba(255,248,232,0)');s.fillStyle=sun;s.fillRect(0,0,w,h);
  // Quiet architectural silhouette anchors the supplied nature effect to home design.
  s.strokeStyle='rgba(37,61,53,.24)';s.lineWidth=1;
  const base=h*.92,unit=Math.min(w/6,150);
  s.beginPath();s.moveTo(0,base);s.lineTo(w,base);s.moveTo(w*.06,base);s.lineTo(w*.06,base-unit*.44);s.lineTo(w*.06+unit*.6,base-unit*.8);s.lineTo(w*.06+unit*1.2,base-unit*.44);s.lineTo(w*.06+unit*1.2,base);
  s.moveTo(w*.82,base);s.lineTo(w*.82,base-unit*.55);s.lineTo(w*.94,base-unit*.55);s.lineTo(w*.94,base);s.stroke();
  const mask=document.createElement('canvas');mask.width=w;mask.height=h;const m=mask.getContext('2d',{willReadFrequently:true});
  m.font='900 100px Arial';const size=Math.min(w*.84/m.measureText('HOME PLANS').width*100,h*.4);m.font='900 '+size+'px Arial';m.textAlign='center';m.textBaseline='middle';m.fillText('HOME PLANS',w/2,h*.46);
  const data=m.getImageData(0,0,w,h).data;points=[];const step=w<600?2:3;
  for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step)if(data[(y*w+x)*4+3]>128)points.push([x,y]);
  for(let i=points.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[points[i],points[j]]=[points[j],points[i]];}
  const n=w<600?1000:3000;birds=Array.from({length:n},(_,i)=>{const a=random()*Math.PI*2,r=Math.sqrt(random()),p=points[i%points.length]||[w/2,h/2];return{x:p[0],y:p[1],vx:Math.cos(a)*12,vy:Math.sin(a)*12,depth:.55+random()*.45,phase:random()*6.28,target:p};});
  time=7;draw(1);sync();
 }
 function draw(pull){ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(sky,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  for(let pass=0;pass<2;pass++){ctx.beginPath();for(const b of birds){if((b.depth>.78)!==(pass===1))continue;const size=(1.2+b.depth*1.8)*(1-.35*pull),speed=Math.hypot(b.vx,b.vy),dx=speed>.1?b.vx/speed:1,dy=speed>.1?b.vy/speed:0,flap=.55+.45*Math.sin(b.phase),wx=-dx*size,wy=-dy*size,nx=-dy*size*flap,ny=dx*size*flap;ctx.moveTo(b.x+wx+nx,b.y+wy+ny);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x+wx-nx,b.y+wy-ny);}ctx.strokeStyle='#253d35';ctx.globalAlpha=pass?.9:.5;ctx.lineWidth=pass?1.15:.8;ctx.stroke();}ctx.globalAlpha=1;
 }
 function tick(now){raf=0;if(paused||!visible||document.hidden)return;const dt=last?Math.min(.04,(now-last)/1000):.016;last=now;time+=dt;
  const tc=time%15,fly=4;let pull=tc<fly?0:tc<fly+2.4?ease((tc-fly)/2.4):tc<12?1:1-ease((tc-12)/3);
  const u=Math.min(w,h),cx=w/2+(.42*Math.sin(time*.21)+.12*Math.sin(time*.53+1))*w*.28,cy=h*.46+(.16*Math.sin(time*.33+2)-.08)*h;
  for(const b of birds){const cv=curl((b.x-w/2)/u*2.2+b.depth*.25,(b.y-h/2)/u*2.2,time*.35),free=1-pull,dc=Math.hypot(cx-b.x,(cy-b.y)*1.6)/u,hold=.15+Math.max(0,dc-.14)*6;
   let ax=cv[0]*240*free+(cx-b.x)*hold*2.2*free+(b.target[0]-b.x)*9*pull-b.vx*3.2*pull;
   let ay=cv[1]*240*free+(cy-b.y)*hold*1.6*free+(b.target[1]-b.y)*9*pull-b.vy*3.2*pull;
   const dx=b.x-hx,dy=b.y-hy,d=Math.hypot(dx,dy),radius=u*.16;if(d<radius){const force=(1-d/radius)*2600;ax+=dx/(d+.01)*force;ay+=dy/(d+.01)*force;}
   b.vx=(b.vx+ax*dt)*(1-1.1*dt);b.vy=(b.vy+ay*dt)*(1-1.1*dt);const speed=Math.hypot(b.vx,b.vy),cap=450;if(speed>cap){b.vx*=cap/speed;b.vy*=cap/speed;}b.x+=b.vx*dt;b.y+=b.vy*dt;b.phase+=dt*(9+speed*.02);
  }draw(pull);raf=requestAnimationFrame(tick);
 }
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;pause.textContent=paused?'Play animation':'Pause animation';pause.setAttribute('aria-pressed',String(paused));if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
 pause.addEventListener('click',()=>{paused=!paused;sync()});
 stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||paused)return;const r=stage.getBoundingClientRect();hx=e.clientX-r.left;hy=e.clientY-r.top;});stage.addEventListener('pointerleave',()=>{hx=hy=-9999});
 motion.addEventListener('change',()=>{paused=motion.matches;layout()});document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync()}).observe(root);
 let resize;new ResizeObserver(()=>{clearTimeout(resize);resize=setTimeout(layout,120)}).observe(stage);layout();
})();
