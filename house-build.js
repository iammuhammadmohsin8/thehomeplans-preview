import * as THREE from './assets/vendor/three.module.min.js';
import { VILLA } from './villa-layout.js';

const root=document.querySelector('.build-story');
if(root) start();
function start(){
 const pin=root.querySelector('.build-pin'),host=document.getElementById('villa-scene'),sheet=root.querySelector('.plan-sheet'),svg=document.getElementById('plan-content');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=()=>innerWidth<=600;
 const buttons=[...root.querySelectorAll('[data-build-stage]')];
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},range=(p,a,b)=>smooth((p-a)/(b-a));
 const stops=[.21,.48,.66,.82,1];
 let progress=0,target=0,raf=0,last=0,inView=true,startY=0,distance=1,disposed=false;
 let renderer,scene,camera,build,ground,blueprint,glass=[],solid=[],roofs=[],landscape=[],furnish=[],drawLines=[],paths=[],labels=[];
 const svgNS='http://www.w3.org/2000/svg';
 function element(tag,attrs,parent=svg){const e=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;}
 function path(d,cls='plan-detail'){const e=element('path',{d,class:cls});paths.push(e);return e;}
 function segment(w,from,to){const dx=w.b[0]-w.a[0],dz=w.b[1]-w.a[1],len=Math.hypot(dx,dz);return [[w.a[0]+dx*from/len,w.a[1]+dz*from/len],[w.a[0]+dx*to/len,w.a[1]+dz*to/len]];}
 const parts=[];
 for(const w of VILLA.walls){const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);let cursor=0;
  for(const o of [...w.open,{from:len,to:len}]){
   if(o.from>cursor){const [a,b]=segment(w,cursor,o.from);path(`M${a}L${b}`,'plan-wall');parts.push({a,b,bottom:0,top:3.2,interior:w.interior});}
   if(o.to>o.from){const [a,b]=segment(w,o.from,o.to);path(`M${a}L${b}`,o.door?'plan-detail':'plan-window');parts.push({a,b,bottom:o.top,top:3.2,interior:w.interior});if(o.sill)parts.push({a,b,bottom:0,top:o.sill});if(o.door){path(`M${a}l1.2,0a1.2,1.2 0 0 1 -1.2,1.2`);} }
   cursor=o.to;
  }
 }
 path('M-2,1H9V6H-2Z');path('M0,6.6H8V9.6H0Z','plan-window');
 // Plan furniture is placed at the same model coordinates as the furniture below.
 path('M1,-1.8h5v1.3H1Z M2,-3.1h2.6v.8H2Z M2,-5.5h4v1H2Z');
 for(const z of [-4.5,1.5])path(`M-7.8,${z}h2.2v2.4h-2.2Z M-7.8,${z+.5}h2.2`);
 path('M-9,-6.8V-7.3 M9,-6.8V-7.3 M-9,-7.05H9 M-9.8,-6H-10.2 M-9.8,6H-10.2 M-10,-6V6','plan-dimension');
 for(const r of VILLA.rooms){const label=element('text',{x:r.x,y:r.z,class:'plan-label'});label.textContent=r.name;labels.push(label);}
 element('text',{x:0,y:-7.3,class:'plan-label'}).textContent='18.00 m';
 const dim=element('text',{x:-10.3,y:0,class:'plan-label',transform:'rotate(-90 -10.3 0)'});dim.textContent='12.00 m';
 paths.forEach(p=>{const len=p.getTotalLength();p.style.strokeDasharray=len;p.dataset.length=len;});
 function fallback(){root.classList.add('build-static');host.style.display='none';sheet.style.cssText='';paths.forEach(p=>p.style.strokeDashoffset=0);labels.forEach(p=>p.style.opacity=1);document.getElementById('build-caption').textContent='A thoughtful plan for your home.';document.getElementById('build-hint').textContent='Interactive 3D unavailable on this browser.';buttons.forEach(b=>b.disabled=true);}
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{fallback();return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.5:1.8));renderer.setClearColor(0xf2f0e8,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 host.replaceChildren(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(33,1,.1,150);build=new THREE.Group();scene.add(build);
 scene.add(new THREE.HemisphereLight(0xfff8e8,0x9b9d90,1.6));
 const sun=new THREE.DirectionalLight(0xfff4df,3.1);sun.position.set(-12,24,12);sun.castShadow=true;sun.shadow.mapSize.set(mobile()?1024:2048,mobile()?1024:2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:70});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;sun.shadow.radius=3;scene.add(sun);
 // Locally generated material textures: no external media or tracking requests.
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');let seed=31;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};ctx.fillStyle=kind==='wood'?'#8b6845':'#ddd8c9';ctx.fillRect(0,0,256,256);for(let i=0;i<4500;i++){ctx.fillStyle=rand()>.5?'#ffffff12':'#221c1515';if(kind==='wood')ctx.fillRect(rand()*256,rand()*256,.5+rand(),12+rand()*90);else ctx.fillRect(rand()*256,rand()*256,rand()*3,rand()*3);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?4:3,3);t.colorSpace=THREE.SRGBColorSpace;return t;}
 const stoneMap=texture('stone'),woodMap=texture('wood');
 const stone=new THREE.MeshStandardMaterial({color:0xeee7d9,map:stoneMap,roughness:.8});
 const plaster=new THREE.MeshStandardMaterial({color:0xf3eee4,roughness:.86});
 const wood=new THREE.MeshStandardMaterial({map:woodMap,color:0xcba57e,roughness:.65});
 const metal=new THREE.MeshStandardMaterial({color:0x343e38,metalness:.65,roughness:.3});
 // Soft sky environment gives glass genuine angle-dependent reflections.
 const envCanvas=document.createElement('canvas');envCanvas.width=512;envCanvas.height=256;
 const envCtx=envCanvas.getContext('2d'),envGradient=envCtx.createLinearGradient(0,0,0,256);
 envGradient.addColorStop(0,'#7397aa');envGradient.addColorStop(.45,'#e9eee9');envGradient.addColorStop(.52,'#b5bbaa');envGradient.addColorStop(1,'#737b64');envCtx.fillStyle=envGradient;envCtx.fillRect(0,0,512,256);
 const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
 const pmrem=new THREE.PMREMGenerator(renderer),envTarget=pmrem.fromEquirectangular(envTexture);scene.environment=envTarget.texture;pmrem.dispose();envTexture.dispose();
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xb0c8cb,metalness:.05,roughness:.08,envMapIntensity:1.6,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false});
 const floor=new THREE.MeshStandardMaterial({color:0xb4ab91,map:stoneMap,roughness:.75});
 const green=new THREE.MeshStandardMaterial({color:0x69765c,roughness:1});
 const foliage=new THREE.MeshStandardMaterial({color:0x4e6650,roughness:1});
 const water=new THREE.MeshPhysicalMaterial({color:0x4a9592,metalness:.4,roughness:.13,transparent:true,opacity:.88});
 function box(w,h,d,x,y,z,mat,parent=build){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function animateObject(obj,a,b,kind='rise',offset=0){const entry={obj,a,b,kind,base:obj.position.clone(),scale:obj.scale.clone(),offset};return entry;}
 function wall(a,b,bottom,top,mat,parent=build){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);const m=box(len,top-bottom,.19,(a[0]+b[0])/2,(top+bottom)/2+.3,(a[1]+b[1])/2,mat,parent);m.rotation.y=-Math.atan2(dz,dx);return m;}
 ground=new THREE.Group();build.add(ground);
 box(25,.22,22,0,-.18,1.5,green,ground);
 for(const [x,z,w,d]of VILLA.slabs){solid.push(animateObject(box(w,.3,d,x,.15,z,floor),.26,.36,'rise'));}
 // Terrace is an actual L-shaped recess, not a different facade pasted over a plan.
 solid.push(animateObject(box(11,.28,5,3.5,.14,3.5,stone),.3,.4,'rise'));
 solid.push(animateObject(box(11,.14,1,3.5,.07,6.5,stone),.32,.42,'rise'));
 parts.forEach((p,i)=>{solid.push(animateObject(wall(p.a,p.b,p.bottom,p.top,p.interior?plaster:stone),.35+(i%5)*.013,.55+(i%5)*.013,'wall'));});
 // Identical opening intervals supply the 2D window marks and 3D assemblies.
 for(const w of VILLA.walls)for(const o of w.open){if(o.door)continue;const [a,b]=segment(w,o.from,o.to),group=new THREE.Group();build.add(group);wall(a,b,o.sill,o.top,glassMat,group);const n=Math.max(1,Math.ceil((o.to-o.from)/1.7));for(let i=0;i<=n;i++){const t=i/n;box(.055,o.top-o.sill,.055,a[0]+(b[0]-a[0])*t,(o.top+o.sill)/2+.3,a[1]+(b[1]-a[1])*t,metal,group);}for(const y of [o.sill+.03,o.top-.03]){const beam=wall(a,b,y,y+.045,metal,group);beam.scale.z=.34;}glass.push(animateObject(group,.55,.7,'slide',w.a[0]<0?-7:7));}
 // Entry privacy fins, placed on the solid north facade.
 const fins=new THREE.Group();build.add(fins);for(let x=-1.6;x<1.4;x+=.15)box(.075,3.2,.16,x,1.9,-6.15,wood,fins);glass.push(animateObject(fins,.56,.72,'slide',-6));
 VILLA.roofs.forEach(([x,z,w,d],i)=>{const group=new THREE.Group();build.add(group);box(w,.3,d,x,3.65,z,plaster,group);box(w-.35,.09,d-.35,x,3.85,z,stone,group);box(w,.055,.08,x,3.45,z+d/2-.05,new THREE.MeshStandardMaterial({color:0xf3d8a1,emissive:0x9b7134,emissiveIntensity:.5}),group);roofs.push(animateObject(group,.71+i*.025,.85+i*.025,'drop',8));});
 // Slatted pergola stays over the exact terrace shown in the drawing.
 const pergola=new THREE.Group();build.add(pergola);for(const x of [1,8.5])for(const z of [1.6,5.5])box(.12,3.1,.12,x,1.85,z,metal,pergola);for(let x=.7;x<9;x+=.42)box(.12,.18,4.3,x,3.42,3.5,wood,pergola);roofs.push(animateObject(pergola,.77,.9,'drop',6));
 function furniture(){const g=new THREE.Group();build.add(g);const fabric=new THREE.MeshStandardMaterial({color:0xe1d9c8,roughness:.96});box(5,.35,1.3,3.5,.6,-1.15,fabric,g);box(5,.55,.22,3.5,.92,-1.7,fabric,g);for(let x=1.2;x<6;x+=1.15)box(1.05,.13,1,x,.85,-1.05,fabric,g);box(2.6,.32,.8,3.3,.65,-2.7,wood,g);box(4,.9,1,4,.75,-5,wood,g);box(4.1,.09,1.1,4,1.25,-5,stone,g);for(const z of [-3.3,2.7]){box(2.2,.35,2.4,-6.7,.6,z,wood,g);box(2.15,.18,2.3,-6.7,.87,z,fabric,g);box(2.2,.75,.12,-6.7,.9,z-1.2,wood,g);}furnish.push(animateObject(g,.48,.64,'slide',-3));}furniture();
 const pool=new THREE.Group();build.add(pool);box(8.7,.16,3.7,4,.01,8.1,stone,pool);box(8,.17,3,4,.13,8.1,water,pool);landscape.push(animateObject(pool,.83,.96,'rise'));
 const garden=new THREE.Group();build.add(garden);
 // Restrained landscaping with multi-volume, seeded canopies and soft shadows.
 let leafSeed=17;const leafRand=()=>{leafSeed=(leafSeed*1664525+1013904223)>>>0;return leafSeed/4294967296};
 const leafMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.16,0),foliage,1800),dummy=new THREE.Object3D();let leafIndex=0;
 for(const [x,z,size]of [[-11,-4,1.5],[-10.8,7.8,1.25],[11,-4,1.5],[10.8,6,1.1],[-4.5,9.2,.9]]){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.065,.13,2.7,8),wood);trunk.position.set(x,1.3,z);trunk.castShadow=true;garden.add(trunk);
  for(let i=0;i<360;i++){const theta=leafRand()*Math.PI*2,phi=Math.acos(2*leafRand()-1),r=size*Math.cbrt(leafRand());dummy.position.set(x+Math.sin(phi)*Math.cos(theta)*r,2.7+Math.cos(phi)*r*.8,z+Math.sin(phi)*Math.sin(theta)*r);dummy.rotation.set(leafRand()*3,leafRand()*6,leafRand()*3);dummy.scale.set(1.3,.5,1);dummy.updateMatrix();leafMesh.setMatrixAt(leafIndex,dummy.matrix);leafMesh.setColorAt(leafIndex,new THREE.Color().setHSL(.22+leafRand()*.06,.16+leafRand()*.15,.2+leafRand()*.17));leafIndex++;}
 }
 leafMesh.castShadow=true;garden.add(leafMesh);
 for(let x=-8;x<0;x+=1.3)box(.85,.05,.65,x,.02,9.5,stone,garden);
 for(let x=1;x<8;x+=2){box(.9,.12,1.7,x,.42,5,wood,garden);box(.8,.07,1.6,x,.52,5,plaster,garden);}
 landscape.push(animateObject(garden,.86,1,'rise'));
 blueprint=new THREE.Group();build.add(blueprint);
 for(const w of VILLA.walls){const pts=[new THREE.Vector3(w.a[0],.34,w.a[1]),new THREE.Vector3(w.b[0],.34,w.b[1])];const geo=new THREE.BufferGeometry().setFromPoints(pts);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x9b8154,transparent:true,opacity:1}));blueprint.add(line);drawLines.push(line);}
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.32;shadow.receiveShadow=true;scene.add(shadow);
 const captions=['Every home begins with a line.','Your layout takes shape.','Light finds its way inside.','Every detail falls into place.','From your vision. To your home.'];
 const tags=['THE DRAWING','THE STRUCTURE','THE CONNECTION','THE CRAFT','THE COMPLETE VISION'];let active=-1;
 function apply(entry,p){const t=range(p,entry.a,entry.b),o=entry.obj;o.visible=t>.001;o.position.copy(entry.base);o.scale.copy(entry.scale);if(entry.kind==='slide')o.position.x+=(1-t)*entry.offset;else if(entry.kind==='drop')o.position.y+=(1-t)*entry.offset;else if(entry.kind==='wall'){o.scale.y=Math.max(.001,t);o.position.y=.3+(entry.base.y-.3)*t;}else{o.scale.y=Math.max(.001,t);o.position.y=entry.base.y*t;}}
 function paint(p){
  const morph=range(p,.24,.38),reveal=range(p,.29,.42);
  paths.forEach((e,i)=>{const t=range(p,i/paths.length*.13,.08+i/paths.length*.13);e.style.strokeDashoffset=(1-t)*+e.dataset.length;});labels.forEach(e=>e.style.opacity=range(p,.15,.24));
  const sw=sheet.offsetWidth,sh=sheet.offsetHeight;
  if(mobile()){sheet.style.transform=`translate(${-sw*.395*morph}px,${-sh*.39*morph}px) scale(${1-.69*morph})`;sheet.style.opacity=String(1-.12*morph);}
  else{sheet.style.transform=`translate(${-pin.clientWidth*.52*morph}px,${pin.clientHeight*.12*morph}px) scale(${1-.54*morph})`;sheet.style.opacity='1';}
  host.style.opacity=reveal;ground.scale.y=Math.max(.001,range(p,.3,.47));ground.visible=p>.3;
  [...solid,...glass,...roofs,...furnish,...landscape].forEach(o=>apply(o,p));
  blueprint.visible=p>.27&&p<.64;drawLines.forEach(l=>l.material.opacity=1-range(p,.49,.64));
  const orbit=range(p,.28,.85);camera.position.set(THREE.MathUtils.lerp(3,23,orbit),THREE.MathUtils.lerp(43,19,orbit),THREE.MathUtils.lerp(5,34,orbit));
  camera.lookAt(0,.7,1.4);build.rotation.y=-.1*range(p,.86,1);
  renderer.render(scene,camera);
  const ix=p<.28?0:p<.54?1:p<.71?2:p<.88?3:4;
  if(ix!==active){active=ix;document.getElementById('build-caption').textContent=captions[ix];document.getElementById('build-number').textContent=`0${ix+1} / 05`;document.getElementById('build-scene-label').textContent=tags[ix];buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===ix)));}
  buttons.forEach((b,i)=>b.style.setProperty('--fill',clamp((p-(i?stops[i-1]:0))/(stops[i]-(i?stops[i-1]:0)))));
  root.dataset.progress=p.toFixed(4);root.dataset.stage=ix;root.dataset.ready='true';
 }
 function measure(){startY=root.getBoundingClientRect().top+scrollY;distance=Math.max(1,root.offsetHeight-pin.offsetHeight);const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mobile()?45:39;camera.updateProjectionMatrix();}
 function tick(now){raf=0;if(disposed||document.hidden||!inView)return;const dt=last?Math.min(50,now-last):16.7;last=now;progress+=(target-progress)*(1-Math.exp(-dt/80));if(Math.abs(target-progress)<.0001)progress=target;paint(progress);if(progress!==target)raf=requestAnimationFrame(tick);else last=0;}
 function update(){if(reduced.matches)return;target=clamp((scrollY-startY)/distance);if(!raf&&inView&&!document.hidden)raf=requestAnimationFrame(tick);}
 function mode(){root.classList.toggle('build-static',reduced.matches);measure();progress=target=reduced.matches?1:clamp((scrollY-startY)/distance);paint(progress);document.getElementById('build-hint').textContent=reduced.matches?'Choose a stage to explore.':'Scroll to build. Reverse to rewind.';}
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{if(reduced.matches){progress=target=stops[i];paint(progress);}else scrollTo({top:startY+stops[i]*distance,behavior:'smooth'});}));
 addEventListener('scroll',update,{passive:true});let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{measure();paint(progress);update();},120);},{passive:true});
 reduced.addEventListener('change',mode);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else update();});
 new IntersectionObserver(e=>{inView=e[0].isIntersecting;if(inView)update();else{cancelAnimationFrame(raf);raf=0;last=0;}}).observe(root);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();disposed=true;cancelAnimationFrame(raf);fallback();});
 mode();
}
