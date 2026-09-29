// All gameplay stays on this device. No game server or account is required.
let worker,serial=0;
const pending=new Map();
const SAVE='treasure-tempest-expansion-rotating-v1';
function loading(text) {
  let panel=document.getElementById('engine-loading');
  if(!panel){panel=document.createElement('div');panel.id='engine-loading';panel.setAttribute('role','status');panel.innerHTML='<div><span class="eyebrow">TREASURE TEMPEST</span><h2></h2><p>Your voyage runs right here in your browser.</p><div class="engine-wave"></div></div>';document.body.append(panel)}
  panel.querySelector('h2').textContent=text;
}
function hideLoading(){document.getElementById('engine-loading')?.remove()}
function getWorker(){
  if(worker)return worker;
  worker=new Worker(new URL('./engine-worker.js?v=stats-35',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{
    if(data.status){if(data.status!=='ready')loading(data.status);return}
    const job=pending.get(data.id);if(!job)return;
    pending.delete(data.id);clearTimeout(job.timer);hideLoading();
    if(data.error){job.reject(Error(data.error));return}
    try{localStorage.setItem(SAVE,JSON.stringify({...data.result.document,resumeAvailable:!data.result.state.complete&&['sailing','resolving'].includes(data.result.state.game?.phase)&&data.result.state.game.players.some(p=>p.status==='active')}))}catch{document.dispatchEvent(new CustomEvent('save-warning'))}
    job.resolve(data.result.state);
  };
  worker.onerror=()=>{
    hideLoading();for(const job of pending.values()){clearTimeout(job.timer);job.reject(Error('The game could not start. Reload the page and try again.'))}pending.clear();worker.terminate();worker=null;
  };
  return worker;
}
export function gameCall(message){
  return new Promise((resolve,reject)=>{
    const id=++serial;
    const timer=setTimeout(()=>loading(message.type==='action'?'The fleet is deciding…':'Preparing your voyage…'),600);
    pending.set(id,{resolve,reject,timer});getWorker().postMessage({id,message});
  });
}
export function savedVoyage(){try{return JSON.parse(localStorage.getItem(SAVE)||'null')}catch{return null}}
export function forgetVoyage(){localStorage.removeItem(SAVE)}
export function choosePowers(requested,all){
  const used=new Set(requested.filter(p=>p!=='random'));
  const remaining=all.filter(p=>!used.has(p));
  for(let i=remaining.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]]}
  return requested.map(p=>p==='random'?remaining.pop():p);
}
export function newSeed(){return crypto.getRandomValues(new Uint32Array(1))[0]>>>1}
