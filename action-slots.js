// Positions depend only on the captain's power, never on the current legal choices.
export function actionSlots(power,request,player=null,game=null){
 let powerSlot={'Navigator':['protect','Use Navigator token'],'Parrot Whisperer':['parrot','Use Parrot token'],'Cannoneer':['fire','Fire cannon token'],'Tide Watcher':['tide','Place secret card']}[power];
 if(player?.tokens===0&&['Navigator','Parrot Whisperer','Cannoneer'].includes(power))powerSlot=null;
 const special=request&&!['turn','round','round-end'].includes(request.kind);
 const options=request?.options||[];
 const primaryIndex=request?.kind==='turn'?options.findIndex(o=>o.value==='stay'):options.length?0:-1;
 const slots=[{key:'advance',index:special?-1:primaryIndex,label:special?'Make your choice':options[primaryIndex]?.label||'Continue',choice:!!special}];
 for(const [key,label] of [['harbor','Harbor'],...(powerSlot?[powerSlot]:[])]){const index=request?.kind==='turn'?options.findIndex(o=>o.value===key):-1;slots.push({key,index,label:options[index]?.label||label,choice:false})}
 return slots.map(s=>{const available=s.choice||s.index>=0;let reason='';if(!available){reason=request?.kind!=='turn'?'Not now':s.key==='harbor'?(player?.status!=='active'?'Already out':game?.safe?'Calm Waters':game?.cannonBlocked?'Wait one draw':game?.song?'Siren’s Song':'Unavailable'):s.key==='tide'?'No secret card':s.key==='protect'?'Already used this round':s.key==='parrot'?'Already used this draw':s.key==='fire'?'No eligible target':'Resolving card';if(game?.safe&&s.key!=='advance')reason='Calm Waters'}return {...s,available,reason}});
}
