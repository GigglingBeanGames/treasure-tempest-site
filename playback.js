// Presentation speed only; decisions and engine rules are unchanged.
let speed=1;
export const setPlaybackSpeed=value=>{speed=[0,1,2,5].includes(value)?value:1};
export const playbackDuration=ms=>ms/(speed||1);
export function canAutoDraw(state,round){return !!state?.game&&state.game.round===round&&!state.complete&&state.game.players[0].status!=='active'&&state.request?.kind==='turn'&&state.game.current!==0;}

export const nextPlaybackSpeed=value=>({1:2,2:5,5:0,0:1})[value]??1;
export const autoDrawDelay=()=>playbackDuration(1800);
