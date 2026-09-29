import {playbackDuration} from './playback.js?v=stats-32';
// Re-export the map lifecycle so every effect shares one ocean instance.
export {attachOcean,pullOcean} from './ocean-life.js?v=stats-32';
import {sweepOcean,reserveTreasures} from './ocean-life.js?v=stats-32';
// Presentation only. These animations never change a game decision or reward.
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause=ms=>new Promise(r=>setTimeout(r,reduced()?0:playbackDuration(ms)));
const animate=async(el,frames,ms=600,extra={})=>{if(!el||!el.isConnected)return;if(reduced()){Object.assign(el.style,frames.at(-1));return}try{const a=el.animate(frames,{duration:playbackDuration(ms),easing:'cubic-bezier(.25,.65,.25,1)',fill:'forwards',...extra});await a.finished;return a}catch{}};
const point=(el,board)=>{const r=el.getBoundingClientRect(),b=board.getBoundingClientRect();return{x:r.left-b.left+r.width/2,y:r.top-b.top+r.height/2}};
export const dockY=[12,22,42,52,72,82];
export function rowboatsMarkup(g,order){return order.map((id,i)=>{
 const p=g.players[id],a=-Math.PI/2+i*2*Math.PI/order.length,charmed=g.song&&p.status==='active'&&p.power!=='Siren Queen',sx=71+(charmed?16:20)*Math.cos(a),sy=52+(charmed?22.4:28)*Math.sin(a),escape=p.held.some(c=>c.effect==='escape'),tricks=p.held.filter(c=>c.effect==='trick').length;
 const x=p.status==='active'?sx+5:p.status==='sunk'?24.5:10,y=p.status==='active'?sy+5:dockY[i];
 return (escape?`<button class="map-rowboat escape-rowboat ${p.status==='harbor'?'cashed-boat':''}" data-rowboat="escape" data-inner-dock="${p.status==='harbor'}" data-owner="${id}" data-x="${x}" data-y="${y}" data-berth-y="${dockY[i]}" data-sea-x="${sx+5}" data-sea-y="${sy+5}" style="left:${x}%;top:${y}%" aria-label="Escape Ship rowboat for captain ${id+1}"><img src="assets/rowboat-${p.status==='sunk'?'gold':'empty'}.svg" alt=""></button>`:'')+(tricks?`<button class="map-rowboat trick-rowboat" data-rowboat="trick" data-owner="${id}" data-berth-y="${dockY[i]}" data-x="10" data-y="${dockY[i]+3}" style="left:10%;top:${dockY[i]+3}%" aria-label="Tempest Trick rowboat for captain ${id+1}"><img src="assets/rowboat-gold.svg" alt="">${tricks>1?`<small>×${tricks}</small>`:''}</button>`:'')}).join('')}
export function startRipples(board){if(!board||reduced())return;const layer=board.querySelector('.sea-waves');function spawn(){if(!board.isConnected)return;const ripple=document.createElement('img');ripple.src='assets/chart-ripple.png';ripple.alt='';ripple.className='chart-ripple';ripple.style.cssText=`left:${30+Math.random()*65}%;top:${8+Math.random()*84}%;width:${23+Math.random()*16}px;--ripple-life:${2+Math.random()*2}s`;layer.appendChild(ripple);ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});setTimeout(spawn,450+Math.random()*700)}spawn()}
let dealt=[];
export function clearProphecy(){dealt.forEach(e=>e.remove());dealt=[];document.querySelectorAll('.moving-deck').forEach(e=>e.remove());const deck=document.querySelector('.draw-pile');if(deck)deck.style.visibility=''}
export async function dealProphecy(e,back,sound){if(dealt.length)return;const deck=document.querySelector('.draw-pile'),profile=document.querySelector(`[data-captain="${e.player}"]`);if(!deck||!profile)return;const from=deck.getBoundingClientRect(),to=profile.getBoundingClientRect(),w=Math.min(60,to.width*.35),h=w*14/9;sound('draw');for(let i=0;i<e.count;i++){const card=document.createElement('img');card.src=back;card.alt='Private inspected card';card.className='travel-card';card.style.cssText=`left:${from.left}px;top:${from.top}px;width:${w}px;height:${h}px`;document.body.appendChild(card);dealt.push(card);const x=to.left+to.width/2+(i-(e.count-1)/2)*(e.spyglass?Math.min(w*.32,(to.width-w)/Math.max(1,e.count-1)):w*.66)-w/2-from.left,y=to.top+18-from.top;card.dataset.endX=x;card.dataset.endY=y;await animate(card,[{transform:'translate(0,0) rotate(0deg)',opacity:.7},{transform:`translate(${x}px,${y}px) rotate(${(i-(e.count-1)/2)*(e.spyglass?3:12)}deg)`,opacity:1}],e.spyglass?140:480)}await pause(250)}
export async function returnProphecy(e,back,sound){await dealProphecy(e,back,sound);const deck=document.querySelector('.draw-pile');if(!deck||!dealt.length){clearProphecy();return}const r=deck.getBoundingClientRect(),stack=document.createElement('img');stack.src=back;stack.alt='';stack.className='moving-deck';stack.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;document.body.appendChild(stack);deck.style.visibility='hidden';const bottom=dealt.slice(0,e.bottom||0),top=dealt.slice(e.bottom||0);
 async function returnCard(card,below){const from=card.getBoundingClientRect();card.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:${below?120:124}`;await animate(card,[{transform:'translate(0,0) rotate(0deg)'},{transform:`translate(${r.left-from.left}px,${r.top-from.top}px) rotate(0deg)`,width:r.width+'px',height:r.height+'px'}],520);sound('draw')}
 if(bottom.length){const shift=Math.min(r.width+22,Math.max(75,r.left-14));await animate(stack,[{transform:'translateX(0)'},{transform:`translateX(-${shift}px)`}],350);if(e.spyglass)await Promise.all(bottom.map(card=>returnCard(card,true)));else for(const card of bottom)await returnCard(card,true);await pause(120);await animate(stack,[{transform:`translateX(-${shift}px)`},{transform:'translateX(0)'}],400);bottom.forEach(c=>c.remove())}
 for(const card of top){await returnCard(card,false);await pause(100);card.remove()}clearProphecy();sound('shuffle')}
export async function wildWaveEffect(sound){sound('splash');await sweepOcean()}
export function stageRescueBoats(events){const board=document.querySelector('.fleet-board');if(!board)return;for(const e of events){const boat=board.querySelector(`[data-rowboat="escape"][data-owner="${e.player}"]`);if(!boat)continue;boat.dataset.rescue=e.kind==='sink'?'rescue':'follow';boat.classList.remove('cashed-boat');boat.querySelector('img').src='assets/rowboat-empty.svg';boat.style.transform=`translate(${(+boat.dataset.seaX-+boat.dataset.x)*board.clientWidth/100}px,${(+boat.dataset.seaY-+boat.dataset.y)*board.clientHeight/100}px)`}}

const journeys=new WeakMap();
export function escortBoat(id,sound){const boat=document.querySelector(`[data-rowboat="escape"][data-owner="${id}"][data-rescue="follow"]`);if(boat&&!journeys.has(boat))journeys.set(boat,sailBoat(boat,sound));}
async function sailBoat(boat,sound){const rescue=boat.dataset.rescue==='rescue',board=boat.closest('.fleet-board');if(rescue)boat.querySelector('img').src='assets/rowboat-gold.svg';const from=boat.style.transform;
 if(!rescue&&board){const berth=`translate(${(24.5-+boat.dataset.x)*board.clientWidth/100}px,${(+boat.dataset.berthY-+boat.dataset.y)*board.clientHeight/100}px)`;await animate(boat,[{transform:from},{transform:berth}],1400);await animate(boat,[{transform:berth},{transform:'translate(0,0)'}],650);}else await animate(boat,[{transform:from},{transform:'translate(0,0)'}],1400);
 boat.style.transform='';delete boat.dataset.rescue;if(!rescue&&board){const burst=document.createElement('div');burst.className='boat-gold-poof';burst.style.cssText=`left:${boat.dataset.x}%;top:${boat.dataset.y}%`;burst.innerHTML=Array.from({length:7},(_,i)=>`<i style="--coin:${i}"></i>`).join('');board.appendChild(burst);boat.classList.add('cashed-boat');sound('coins');setTimeout(()=>burst.remove(),850);}}
export async function rescueBoats(sound){const boats=[...document.querySelectorAll('[data-rescue]')];await Promise.all(boats.map(boat=>{if(!journeys.has(boat))journeys.set(boat,sailBoat(boat,sound));return journeys.get(boat)}));}
export async function trickBoatEffect(player,sound){const board=document.querySelector('.fleet-board'),boat=document.querySelector(`[data-rowboat="trick"][data-owner="${player}"]`),ship=document.querySelector(`[data-ship="${player}"]`);if(!board||!boat||!ship)return;
 boat.classList.remove('cashed-boat');boat.querySelector('img').src='assets/rowboat-empty.svg';const home={x:+boat.dataset.x*board.clientWidth/100,y:+boat.dataset.y*board.clientHeight/100},trans=p=>`translate(${p.x-home.x}px,${p.y-home.y}px)`;let here=point(ship,board);boat.style.transform=trans(here);
 const targets=reserveTreasures(1,here);boat.dataset.collected='0';
 for(const target of targets){const near={x:target.x-12,y:target.y+10};await animate(boat,[{transform:trans(here)},{transform:trans(near)}],650);const coin=document.createElement('img');coin.className='heist-treasure';coin.src=target.src;coin.alt='';coin.style.cssText=`left:${target.x}px;top:${target.y}px`;board.appendChild(coin);target.collect();sound('coins');await animate(coin,[{transform:'translate(-50%,-50%)',opacity:1},{transform:`translate(${(near.x-target.x)*.5}px,${near.y-target.y-20}px)`,opacity:1,offset:.45},{transform:`translate(${near.x-target.x}px,${near.y-target.y}px) scale(.4)`,opacity:0}],320);coin.remove();boat.dataset.collected=String(+boat.dataset.collected+1);here=near;}
 boat.querySelector('img').src='assets/rowboat-gold.svg';const approach={x:+boat.dataset.approachX||home.x+35,y:home.y};await animate(boat,[{transform:trans(here)},{transform:trans(approach)}],650);await animate(boat,[{transform:trans(approach)},{transform:'translate(0,0)'}],450);boat.style.transform='';delete boat.dataset.rescue;}
let wasSong=false;
export function prepareSirens(board){if(wasSong)board?.querySelector('.siren-chorus')?.classList.add('sirens-present')}
export function stageSirens(board,active){if(!board)return;const chorus=board.querySelector('.siren-chorus');if(active){chorus.classList.add('sirens-present');if(!wasSong)chorus.classList.add('sirens-arrive')}else if(wasSong){chorus.classList.remove('sirens-present');chorus.classList.add('sirens-depart');setTimeout(()=>chorus.classList.remove('sirens-depart'),1100)}wasSong=!!active;}

export async function tidePlacementEffect(e,back,sound){
 const deck=document.querySelector('.draw-pile'),profile=document.querySelector(`[data-captain="${e.player}"]`);if(!deck||!profile)return;
 const from=profile.getBoundingClientRect(),to=deck.getBoundingClientRect(),w=Math.min(60,from.width*.4),h=w*14/9,card=document.createElement('img');
 card.className='travel-card tide-travel-card';card.src=back;card.alt='Tide Watcher places a secret card face down on top';card.style.cssText=`left:${from.left+from.width/2-w/2}px;top:${from.top+from.height/2-h/2}px;width:${w}px;height:${h}px;z-index:124`;
 document.body.appendChild(card);sound('draw');const r=card.getBoundingClientRect();
 await animate(card,[{transform:'translate(0,0) rotate(-8deg)',opacity:1},{transform:'translate(0,-15px) rotate(0deg)',opacity:1}],250);
 await animate(card,[{transform:'translate(0,-15px) rotate(0deg)'},{transform:`translate(${to.left-r.left}px,${to.top-r.top}px) rotate(0deg)`,width:to.width+'px',height:to.height+'px'}],850);sound('draw');await pause(200);card.remove();
 deck.classList.add('tide-card-landed');setTimeout(()=>deck.classList.remove('tide-card-landed'),800);
}

// Match docking to the actual cover-cropped chart, rather than a viewport percentage.
let dockObserver;
export function positionRowboatDocks(board){dockObserver?.disconnect();if(!board)return;const place=()=>placeRowboatDocks(board);place();dockObserver=new ResizeObserver(place);dockObserver.observe(board);}
function placeRowboatDocks(board){const w=board.clientWidth,h=board.clientHeight,k=Math.max(w/1774,h/887),ox=(w-1774*k)/2,oy=(h-887*k)/2;
 for(const boat of board.querySelectorAll('.map-rowboat')){
  if(boat.dataset.rowboat==='escape'&&boat.dataset.innerDock!=='true')continue;
  const berth=+boat.dataset.berthY||(+boat.dataset.y-3),slot=dockY.indexOf(berth);if(slot<0)continue;
  const center=[152,417,680][Math.floor(slot/2)],half=boat.offsetHeight/2,pad=half+5;
  const x=Math.max(boat.offsetWidth/2+5,340*k+ox,256*k+ox+boat.offsetWidth/2+6),y=Math.max(pad,Math.min(h-pad,(center+(slot%2?18:-18))*k+oy+(slot%2?pad:-pad)));
  boat.dataset.x=String(x/w*100);boat.dataset.y=String(y/h*100);boat.dataset.approachX=String(Math.max(x+25,420*k+ox+boat.offsetWidth/2));boat.style.left=boat.dataset.x+'%';boat.style.top=boat.dataset.y+'%';
 }
}

export async function spyglassEffect(e,back,sound){const plan={...e,spyglass:true};await dealProphecy(plan,back,sound);await pause(450);await returnProphecy(plan,back,sound);}
