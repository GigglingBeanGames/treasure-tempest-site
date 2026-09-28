// Presentation batching preserves the engine's existing, replayable choices.
export class ChoiceFlow {
 constructor(){this.declinedPlunder=null;}
 key(state){return `${state.id}:${state.game.round}:${state.game.last?.draw??state.game.totalDraws}:${state.game.pot}`;}
 async act(state,value,send,onState=()=>{}){
  if(state.request?.kind==='plunder'&&value===false)this.declinedPlunder=this.key(state);
  let next=await send({type:'action',requestId:state.request.id,value});onState(next);
  while(next.request?.kind==='plunder'&&this.key(next)===this.declinedPlunder){
   next=await send({type:'action',requestId:next.request.id,value:false});onState(next);
  }
  return next;
 }
 async order(state,order,send,onState=()=>{}){
  const remaining=state.request.cards.map((_,i)=>i);
  if(order.length!==remaining.length||new Set(order).size!==remaining.length||order.some(i=>!remaining.includes(i)))throw Error('Every card must appear exactly once.');
  for(const id of order.slice(0,-1)){
   if(state.request?.kind!=='spyglass-order')throw Error('The Spyglass choice has changed.');
   const index=remaining.indexOf(id);
   state=await this.act(state,index,send,onState);remaining.splice(index,1);
  }
  return state;
 }
}
