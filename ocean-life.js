import {playbackDuration} from './playback.js?v=stats-35';
// Decorative, local-only physics. No game state, score or random seed is touched.
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let ocean=null,serial=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const names=['coin','coins','crown','gem','chest','sack','goblet','ring','key'];
export function separate(a,b,ra,rb,immovable=false){
 const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy),over=ra+rb-d;if(over<=0)return false;
 const nx=d?dx/d:1,ny=d?dy/d:0,part=immovable?1:.5;
 a.x+=nx*over*part;a.y+=ny*over*part;if(!immovable){b.x-=nx*over*.5;b.y-=ny*over*.5}
 const approach=(a.vx-(b.vx||0))*nx+(a.vy-(b.vy||0))*ny;
 if(approach<0){a.vx-=1.3*approach*nx*part;a.vy-=1.3*approach*ny*part;if(!immovable){b.vx+=.65*approach*nx;b.vy+=.65*approach*ny}}
 return true;
}
// A soft current opens breathing room around the chorus and active fleet.
export function songCurrent(p,zones){
 let x=0,y=0;
 for(const z of zones){const dx=p.x-z.x,dy=p.y-z.y,d=Math.hypot(dx,dy),radius=z.r+p.size*.5;if(d>=radius)continue;
 const strength=40*Math.pow(1-d/radius,.65),angle=p.phase||0;
 x+=(d?dx/d:Math.cos(angle))*strength;y+=(d?dy/d:Math.sin(angle))*strength;
 }
 const magnitude=Math.hypot(x,y),limit=magnitude>40?40/magnitude:1;
 return {x:x*limit,y:y*limit};
}
function songZones(o){
 if(!o.board.classList.contains('song-active'))return [];
 const br=o.board.getBoundingClientRect(),w=o.board.clientWidth,h=o.board.clientHeight;
 return [{x:w*.71,y:h*.52,r:Math.min(w*.28,h*.42)},...[...o.board.querySelectorAll('.fleet-ship.at-sea')].map(el=>{const r=el.getBoundingClientRect();return{x:r.left-br.left+r.width/2,y:r.top-br.top+r.height/2,r:Math.max(r.width,r.height)*.5+48}})];
}
export function attachOcean(board,key,onChestPop=()=>{}){
 if(!board)return;
 if(!ocean||ocean.key!==key){if(ocean)cancelAnimationFrame(ocean.frame);ocean={key,items:[],last:0,nextSpawn:0,mode:null,board:null,frame:0};}
 const o=ocean;cancelAnimationFrame(o.frame);o.board=board;o.last=0;o.onChestPop=onChestPop;
 const layer=document.createElement('div');layer.className='flotsam-layer';layer.setAttribute('aria-label','Draggable floating treasure');board.appendChild(layer);o.layer=layer;
 o.items.forEach(p=>mount(p,o,false));if(!o.items.length&&!o.mode)seed(o);
 function tick(t){if(ocean!==o||!board.isConnected)return;const dt=Math.min(.035,(t-(o.last||t))/1000);o.last=t;step(o,dt,t);o.frame=requestAnimationFrame(tick)}
 o.frame=requestAnimationFrame(tick);
}
function obstacles(o){const br=o.board.getBoundingClientRect();return [...o.board.querySelectorAll('.fleet-ship,.map-rowboat:not(.cashed-boat)')].filter(e=>!e.classList.contains('being-swallowed')).map(el=>{const r=el.getBoundingClientRect();return{x:r.left-br.left+r.width/2,y:r.top-br.top+r.height/2,r:Math.min(r.width,r.height)*.5+3,vx:0,vy:0}})}
function mount(p,o,fade){const el=document.createElement('div');el.className='flotsam'+(p.kind<8?' treasure-flotsam':'')+(fade?' fresh-flotsam':'');el.dataset.flotsam=String(p.id);el.dataset.kind=names[p.kind];el.style.width=p.size+'px';el.style.height=p.size+'px';const src=new URL(`./assets/flotsam/${names[p.kind]}.${p.kind===8?'svg':'png'}`,import.meta.url).href;el.innerHTML=`<img src="${src}" alt="" draggable="false"><i class="treasure-gleam" aria-hidden="true"></i>`;el.setAttribute('aria-hidden','true');o.layer.appendChild(el);p.el=el;el.querySelector('img').addEventListener('error',()=>remove(o,p),{once:true});
 el.onpointerdown=e=>{if(o.mode||p.claimed)return;e.preventDefault();p.drag=e.pointerId;el.setPointerCapture(e.pointerId);el.classList.add('dragging-flotsam');p.vx=p.vy=0};
 el.onpointermove=e=>{if(p.drag!==e.pointerId)return;const r=o.board.getBoundingClientRect();p.x=clamp(e.clientX-r.left,r.width*.29+p.size/2,r.width-p.size/2);p.y=clamp(e.clientY-r.top,p.size/2,r.height-p.size/2);solve(o);paint(p,o,performance.now());};
 const release=e=>{if(p.drag!==e.pointerId)return;p.drag=null;if(e.type==='pointerup'&&unlockChest(o,p))return;el.classList.remove('dragging-flotsam');p.vx=(Math.random()-.5)*6;p.vy=(Math.random()-.5)*4};el.onpointerup=release;el.onpointercancel=release;el.onlostpointercapture=release;paint(p,o,performance.now());}
function create(o,edge=false,kind=null){const w=o.board.clientWidth,h=o.board.clientHeight,size=w<400?11+Math.random()*3:13+Math.random()*4;const p={id:serial++,kind:Math.random()<.44?Math.floor(Math.random()*2):2+Math.floor(Math.random()*7),size,x:w*(.33+Math.random()*.62),y:h*(.1+Math.random()*.8),vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*4,phase:Math.random()*6.28,drag:null,gleam:performance.now()+4000+Math.random()*20000};
 if(kind!==null)p.kind=kind;
 if(edge){const side=Math.floor(Math.random()*3);if(side===0){p.x=w+size;p.vx=-5}else if(side===1){p.y=-size;p.vy=4}else{p.y=h+size;p.vy=-4}p.entering=true;}
 else {const obs=obstacles(o);let clear=false;for(let n=0;n<35;n++){clear=[...o.items.map(x=>({...x,r:x.size*.5})),...obs].every(b=>Math.hypot(p.x-b.x,p.y-b.y)>size*.5+b.r+8);if(clear)break;p.x=w*(.33+Math.random()*.62);p.y=h*(.1+Math.random()*.8)}if(!clear)return;}
 o.items.push(p);mount(p,o,!edge);}
function seed(o){const count=o.board.clientWidth<400?10:15;for(let i=0;i<count;i++)create(o,false,i===0?8:i===1?4:null);o.nextSpawn=performance.now()+7000;}
function remove(o,p){p.el?.remove();o.items=o.items.filter(a=>a!==p)}
function solve(o){const obs=obstacles(o);for(let pass=0;pass<3;pass++){for(const p of o.items){for(const b of obs)separate(p,b,p.size*.5,b.r,true);for(const b of o.items){if(b.id<=p.id)continue;if((p.drag!=null||b.drag!=null)&&((p.kind===8&&b.kind===4)||(p.kind===4&&b.kind===8)))continue;separate(p,b,p.size*.5,b.size*.5)}if(!p.entering){p.x=Math.max(o.board.clientWidth*.29+p.size*.5,p.x)}}}}
function paint(p,o,t){const elapsed=Math.min(50,t-(p.paintedAt||t));p.paintedAt=t;const blend=p.drag||o.mode?1:1-Math.exp(-elapsed/180);p.renderX=(p.renderX??p.x)+(p.x-(p.renderX??p.x))*blend;p.renderY=(p.renderY??p.y)+(p.y-(p.renderY??p.y))*blend;p.el.style.left=p.renderX+'px';p.el.style.top=p.renderY+'px';if(o.mode!=='whirlpool')p.el.style.transform=`translate(-50%,-50%) translateY(${reduced()?0:Math.sin(t/720+p.phase)*2.2}px) rotate(${reduced()?0:Math.sin(t/2900+p.phase)*2}deg)`;}
function step(o,dt,t){const w=o.board.clientWidth,h=o.board.clientHeight;
 if(o.width&&o.width!==w){for(const p of o.items){p.x*=w/o.width;p.y*=h/o.height}}o.width=w;o.height=h;if(w<400&&o.items.length>12){o.items.slice(12).forEach(p=>remove(o,p))}
 if(o.mode==='whirlpool')return;
 if(o.mode==='wave'){const front=w*(.24+(t-o.waveStart)/playbackDuration(1800)*.85),obs=obstacles(o);for(const p of [...o.items]){if(front>p.x)p.caught=true;if(p.caught){p.vx=w*.65*(1800/playbackDuration(1800));p.vy=0;for(const b of obs){if(b.x>=p.x&&b.x-p.x<60&&Math.abs(p.y-b.y)<b.r+p.size*.5+5)p.vy=(p.y>=b.y?1:-1)*80;}p.x+=p.vx*dt;p.y+=p.vy*dt;}if(p.x>w+p.size||p.y< -p.size||p.y>h+p.size)remove(o,p);}solve(o);o.items.forEach(p=>paint(p,o,t));return;}
 const zones=songZones(o);
 for(const p of [...o.items]){if(!p.drag&&!p.claimed&&!reduced()){const current=songCurrent(p,zones),clearing=Math.hypot(current.x,current.y)>.01,ease=1-Math.exp(-dt*(clearing?2.2:.22));p.vx+=(Math.cos(t/13000+p.phase)*3.4*(clearing?.15:1)+current.x-p.vx)*ease;p.vy+=(Math.sin(t/17000+p.phase)*2.2*(clearing?.15:1)+current.y-p.vy)*ease;p.x+=p.vx*dt;p.y+=p.vy*dt;}
 if(p.entering&&p.x<w-p.size*.5&&p.y>p.size*.5&&p.y<h-p.size*.5)p.entering=false;
 if(!p.entering&&(p.x>w+p.size||p.y< -p.size||p.y>h+p.size)){remove(o,p);continue}
 if(p.kind<8&&t>p.gleam){p.el.classList.remove('gleaming');void p.el.offsetWidth;p.el.classList.add('gleaming');p.gleam=t+12000+Math.random()*16000;}
 }
 solve(o);o.items.forEach(p=>paint(p,o,t));if(t>o.nextSpawn&&!reduced()){const max=w<400?12:18;if(o.items.length<max)create(o,true);o.nextSpawn=t+5000+Math.random()*5000;}
}
export async function sweepOcean(){const o=ocean;if(!o?.board.isConnected)return;o.mode='wave';o.waveStart=performance.now();o.items.forEach(p=>{p.drag=null;p.caught=false});const board=o.board,w=board.clientWidth,h=board.clientHeight;const clip=document.createElement('div');clip.className='wave-sweep-layer';board.appendChild(clip);const duration=reduced()?50:playbackDuration(1800);
 const animations=[];for(let i=0;i<7;i++){const im=document.createElement('img');im.src='assets/single-wave.png';im.alt='';im.style.cssText=`left:${w*.24}px;top:${h*(.05+i*.135)}px;width:${w<400?38:58}px`;clip.appendChild(im);animations.push(im.animate([{transform:'translateX(0)',opacity:0},{opacity:1,offset:.12},{transform:`translateX(${w*.82}px)`,opacity:.8}],{duration,delay:reduced()?0:playbackDuration((i%3)*90),fill:'forwards'}).finished.catch(()=>{}))}
 await Promise.all(animations);if(!reduced()){await new Promise(resolve=>{function check(){if(ocean!==o||!board.isConnected||!o.items.length){resolve();return}requestAnimationFrame(check)}check()})}clip.remove();if(ocean!==o)return;o.items.forEach(p=>p.el.remove());o.items=[];o.mode=null;if(board.isConnected)seed(o);
}
export async function pullOcean(){const o=ocean;if(!o?.board.isConnected)return;o.mode='whirlpool';const w=o.board.clientWidth,h=o.board.clientHeight,cx=w*.71,cy=h*.52,near=o.items.filter(p=>Math.hypot((p.x-cx)/w,(p.y-cy)/h)<.31&&!p.drag);
 await Promise.all(near.map(p=>p.el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(${(cx-p.x)*.5-(cy-p.y)*.25}px,${(cy-p.y)*.5+(cx-p.x)*.25}px) rotate(130deg) scale(.7)`,opacity:1,offset:.6},{transform:`translate(${cx-p.x}px,${cy-p.y}px) rotate(350deg) scale(0)`,opacity:0}],{duration:reduced()?50:playbackDuration(2000),fill:'forwards'}).finished.catch(()=>{})));
 if(ocean!==o)return;near.forEach(p=>remove(o,p));o.mode=null;o.nextSpawn=performance.now()+6000;
}

// Reserve decorative treasure for the heist; no score or deck contents change.
export function reserveTreasures(count,origin){const o=ocean;if(!o?.board.isConnected)return [];return o.items.filter(p=>!p.drag&&!p.claimed&&!p.entering).sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y)).slice(0,count).map(p=>{p.claimed=true;return {x:p.renderX??p.x,y:p.renderY??p.y,src:p.el.querySelector('img').src,collect:()=>remove(o,p)}})}

// Easter egg stays entirely inside the decorative ocean, never the game engine.
export function matchingChest(key,items){return key.kind===8?items.find(p=>p.kind===4&&!p.claimed&&Math.hypot(p.x-key.x,p.y-key.y)<(p.size+key.size)*.7):null}
function unlockChest(o,key){const chest=matchingChest(key,o.items);if(!chest)return false;const x=chest.x,y=chest.y;remove(o,key);remove(o,chest);o.onChestPop?.();const burst=document.createElement('div');burst.className='ocean-gold-poof';burst.style.cssText=`left:${x}px;top:${y}px`;burst.innerHTML=Array.from({length:8},(_,i)=>`<i style="--dx:${Math.cos(i*Math.PI/4)*25}px;--dy:${Math.sin(i*Math.PI/4)*25}px"></i>`).join('');o.layer.appendChild(burst);setTimeout(()=>burst.remove(),900);return true}
