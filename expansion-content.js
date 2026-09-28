export const expansionCards = {
 spoils: {name:'Cursed Spoils', rule:'Subtract 100 gold from the shared pot, down to zero. This is a curse. In safe waters it is worth 0 gold and has no effect.'},
 heart: {name:'Heart of the Sea', rule:'Keep this card face up. When you sink, it saves your ship, but you still leave the round and lose gold normally. If you harbor, earn 10 extra gold instead. Only one active Heart per captain. Return it at round end.'},
 spyglass: {name:'Spyglass', rule:'Privately inspect the bottom 10 cards (or all remaining cards if fewer). If any are treasures, choose one treasure to place on top. Return the other cards to the bottom in any order. Only you know their identities.'},
 fortune: {name:'Lost Fortune', rule:'Add 200 gold to the shared treasure chest. It is a treasure, including during safe waters.'}
};
export const updatedPowerRules = {
 'Merchant':'Start with 6 ships. Gain 25 extra gold each time you harbor. Each ship remaining at game end is worth 60 gold instead of 30.',
 'Siren Queen':'Start with 7 ships. Every Enchanted Key and Chest drawn by anyone outside safe waters comes to you, even after you leave the round. Their normal effects still happen. At round end gain one ship per Key–Chest pair, up to 8 ships total, then return ALL collected cards to the deck. Echo copies count. You may harbor during Siren’s Song and are immune to hazards while the Song is active. No necklace bonus.',
 'Cursed Captain':'Start with 6 ships. Collect the first two curses drawn by anyone outside safe waters each round: Cursed Coin is worth 10 gold, Cursed Idol 50, Cursed Spoils 100. No swapping; later curses are discarded normally. Your own curse draws never subtract from the pot, even after you collect two. Everyone else’s curse draws still do. Collected cards return at round end.',
 'Sea Witch':'Start with 6 ships and no tokens. Whenever anyone draws a curse outside safe waters while you remain in the storm, gain a Hex token. At game end, every Hex gives you 10 gold and costs each rival 10 gold. Whenever anyone draws Heart of the Sea outside safe waters, gain a Heart token, up to 3 held—even after you leave the round. When sinking, spend one Heart token to save your ship; you still leave and lose gold normally. Spare Heart tokens are worth 10 gold each.',
 'Ghost Captain':'Start with one indestructible ship. You can never lose it or be eliminated. Sinking still removes you from the round with the usual gold loss or Marooned recovery, then gives you 30 extra gold. Your remaining ship is worth 30 gold at game end.',
 'Marooned Monarch':'Start with 6 ships. You are immune to Marooned. Gain 60 gold whenever another captain is actually marooned, even after you leave the round. A saved or repaired ship still triggers this reward; a blocked Marooned does not.',
 'Storm Swindler':'Start with 6 ships. Take the first treasure drawn by anyone outside safe waters each round—even if you have already left. It adds nothing to the pot. Keep it face up beside your power and receive its printed value at round end, then return it to the deck. Echo copies count. Tide Watcher’s setup treasure is separate. Tempest Trick remains the normal 20 gold.'
};
export const newVictoryLines = {
 'Sea Witch':'Every curse has finally paid its debt.',
 'Ghost Captain':'An eternal captain. An unforgettable fortune.',
 'Marooned Monarch':'Stranded on an island of riches.',
 'Storm Swindler':'The first treasure was only the beginning.'
};
export function witchTokens(player) {
 if(player.power!=='Sea Witch')return '';
 return `<div class="witch-tokens"><span title="Each Hex: +10 gold to you, −10 to every rival at game end">✦ ${player.hexTokens||0} Hex</span><span title="Spend a Heart token when sinking to save your ship">♥ ${player.heartTokens||0}/3 Heart</span></div>`;
}
