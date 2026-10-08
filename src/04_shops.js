'use strict';
// ---------- places to spend your winnings ----------
// Walk up (or, at Dod's, drive up) and press T. The world waits outside while you make up your mind.
const TIPSY = ['', 'Merry', 'Tipsy', 'Steaming', 'Blootered'];
function pubItems(k) {                                   // k: hotel bars charge hotel prices
  const P = player;
  return [
    { name: 'Pint of heavy', price: Math.round(4 * k), desc: 'Puts back one heart. Leaves you a bit merry.',
      why: () => P.tipsy >= 4 ? "You've had enough, son" : null, buy() { P.hp = Math.min(5, P.hp + 1); P.tipsy += 1; AudioFX.gulp(); return pick(['Slainte!', 'Doon the hatch.', 'Braw pint, that.']); } },
    { name: 'Nip of whisky', price: Math.round(7 * k), desc: 'Puts back two hearts. Goes straight to your legs.',
      why: () => P.tipsy >= 3.5 ? "You've had enough, son" : null, buy() { P.hp = Math.min(5, P.hp + 2); P.tipsy += 2; AudioFX.gulp(); return pick(['Warms the cockles.', 'A fine dram.', 'Oof. Smooth.']); } },
    { name: 'Plate of stovies', price: Math.round(9 * k), desc: 'All five hearts back, and it sobers you right up.',
      why: () => P.hp >= 5 && P.tipsy < 0.5 ? "You're nae hungry" : null, buy() { P.hp = 5; P.tipsy = 0; AudioFX.pickup(); return pick(['Wi oatcakes and beetroot.', 'Just like yer granny made.', 'Fair set you up.']); } },
    { name: 'A round for the whole bar', price: Math.round(60 * k), desc: 'Buys you an alibi: one wanted star comes off.',
      why: () => G.stars < 1 ? 'Nobody is looking for you' : G.stars >= 4 ? 'Not even a round will fix this' : null,
      buy() { G.heat = G.heat - 1 < 1 ? 0 : G.heat - 1; G.stars = Math.floor(G.heat); G.unseenT = 0; AudioFX.pass(); return G.heat ? '"He was here all night, officer."' : '"Him? Been here since dinner time."'; } }
  ];
}
function dealerItems() {
  const P = player, ammo = (w, extra) => ({ name: WEAPONS[w].name + (w === 'tattie' ? ' and ' : 's  x') + WEAPONS[w].per + (w === 'tattie' ? ' tatties' : ''), price: extra, desc: w === 'tattie' ? 'Rapid-fire Maris Pipers. Knocks folk over and dents motors.' : w === 'haggis' ? 'Lob it, wait for the bang. Sends motors spinning.' : 'A shaken bottle of ginger with a firework taped on. Goes a long way.',
    why: () => P.ammo[w] >= WEAPONS[w].per * 3 ? 'Your pockets are full' : null, buy() { P.has[w] = true; P.ammo[w] += WEAPONS[w].per; P.weapon = w; AudioFX.till(); return pick(['No refunds.', 'You never got it fae me.', 'Mind where you point it.']); } });
  return [
    { name: 'Wet haddock', price: 40, desc: 'Fresh this morning. Longer reach than your fists and a better skelp.', why: () => P.has.haddock ? "You've a haddock already" : null, buy() { P.has.haddock = true; P.weapon = 'haddock'; AudioFX.till(); return 'Caught it mysel.'; } },
    ammo('tattie', 60), ammo('haggis', 150), ammo('rocket', 300),
    { name: 'Tweed body armour', price: 300, desc: 'Three layers of Harris tweed. Soaks up the next three knocks afore your hearts take any.', why: () => P.armour >= 3 ? 'You are wearing it' : null, buy() { P.armour = 3; AudioFX.till(); return "Itchy, but you'll thank me."; } }
  ];
}
function dodItems() {
  const c = player.car, up = c.up || NO_UP, st = Math.max(1, G.stars);
  const fit = (key, name, price, desc) => ({ name, price, desc, why: () => up[key] ? 'Already fitted' : null, buy() { c.up = c.up || {}; c.up[key] = true; c.keep = true; if (key === 'nitro') { c.nitro = 1; c.nlock = false; } AudioFX.till(); puff(c.x, c.y, 8, '#ddd', 60, 6, 0.6); return pick(['Sorted.', 'Good as new. Better, even.', "That'll go like the clappers."]); } });
  return [
    { name: c.tartan ? 'Fresh coat of tartan' : 'Respray', price: 50 * st, desc: G.stars ? 'A new colour, and the polis lose all interest. Dearer the more wanted you are.' : 'A new colour. Worth minding for when the polis are after you.', why: () => null,
      buy() { c.col = pick(CARCOLS.filter(x => x !== c.col)); const had = G.heat >= 1; G.heat = 0; G.stars = 0; puff(c.x, c.y, 16, c.col, 80, 9, 0.9); AudioFX.till(); return had ? (c.tartan ? 'A different tartan a thegither. The polis are none the wiser.' : 'The polis are none the wiser.') : 'Suits her.'; } },
    { name: c.dead ? 'Back fae the deid' : 'Patch her up', price: c.dead ? 200 : 80, desc: 'Every dent hammered oot. Even a deid motor runs again.', why: () => !c.dead && c.dmg < 5 ? "There's nae a mark on her" : null, buy() { c.dmg = 0; c.dead = false; AudioFX.till(); return 'Mind the kerbs this time.'; } },
    { name: 'Tartan paint job', price: 120, desc: 'Does nothing at all for the performance. Looks braw.', why: () => c.tartan ? 'She is tartan already' : c.sp.tank ? 'Nae on a tank' : null, buy() { c.tartan = true; c.keep = true; AudioFX.till(); puff(c.x, c.y, 12, '#1d4f38', 80, 8, 0.9); return 'Royal Deeside special.'; } },
    fit('tyres', 'Grippy tyres', 250, 'Sticks to the road in the corners. A third more grip.'),
    fit('bars', 'Bull bars', 300, 'Half the crash damage, and you shove other motors aboot like a much heavier car.'),
    fit('tune', 'Engine tune', 400, 'Dod has a wee look under the bonnet. Quicker off the mark and a higher top speed.'),
    Object.assign(fit('nitro', 'Nitro kit', 1500, 'Hold SHIFT for a daft burst of speed, in any motor. Even a tractor.'), { why: () => hasNitro(c) ? 'Already fitted' : null })
  ];
}
const PUB = (name, at, keeper, line, k) => ({ kind: 'pub', name, at, r: 30, keeper, line, col: '#ffb347', prompt: 'Go into ' + name, items: () => pubItems(k || 1) });
const PUBS = [
  PUB('The Stag', M(2300, 1528.5), 'Senga', 'Fit can I get you?'),
  PUB('the Burnett Arms', M(2140, 1471.5), 'Mr Burnett', 'Evening. The usual?'),
  PUB('the Douglas Arms', M(2060, 1528.5), 'Big Isla', "Nae fighting, nae singing."),
  PUB("Scott Skinner's", M(4135, 1500.5), 'Fiddler Tam', 'A tune wi your pint?'),
  PUB('the Tor-na-Coille bar', SPOTS.torDoor, 'The head waiter', 'Hotel prices, I am afraid, sir.', 1.5),
  PUB('the Banchory Lodge bar', SPOTS.lodgeDoor, 'The barman', 'Residents and bampots welcome. Hotel prices.', 1.5)
];
const DEALER = { kind: 'dealer', name: "Big Eck's stall", at: SPOTS.dealer, r: 36, keeper: 'Big Eck', line: 'Psst. Fish? Tatties? Something louder?', col: '#c58cff', prompt: 'Talk to Big Eck', items: dealerItems };
const DODS = { kind: 'garage', name: "Dod's Motors", at: SPOTS.respray, r: 46, keeper: 'Dod', line: 'Fit are we daein to her the day?', col: '#7dff8a', prompt: "See what Dod can do for your motor", items: dodItems };
const SHOPS = PUBS.concat([DEALER, DODS]);

function shopNear() {                                    // sets G.nearShop, and G.prompt for the wee T sign
  const P = player, c = P.car; G.prompt = '';
  if (P.knock > 0 || P.box || G.state !== 'play') return null;
  if (c) { if (!c.sp.boat && near(c, DODS.at, DODS.r) && Math.abs(c.vf) < 40) { G.prompt = DODS.prompt; return DODS; } return null; }
  for (const s of PUBS) if (near(P, s.at, s.r)) { G.prompt = s.prompt; return s; }
  const d = G.dealer; if (d && d.state === 'wait' && near(P, d, DEALER.r) && near(d, d.post, 12)) { G.prompt = DEALER.prompt; return DEALER; }
  if (near(P, DODS.at, 40)) G.prompt = '!Dod only works on motors. Bring one roon.';
  return null;
}
function openShop(def) {
  G.shop = { def, i: 0, msg: def.line, good: true, items: def.items(), n: 0 }; G.state = 'shop';
  if (def.kind === 'pub') player.inside = true;
  AudioFX.door(); AudioFX.jingle(false);
}
function closeShop() {
  const sh = G.shop; if (!sh) return; G.shop = null; G.state = 'play'; player.inside = false; player.inv = Math.max(player.inv, 0.8); AudioFX.door();
  if (sh.def.kind === 'pub' && player.tipsy >= 3) say(player, pick(['Hic!', 'Fa moved the door?', 'Am fine.']), 1.6);
  if (sh.n) saveGame();
}
function shopMove(d) { const sh = G.shop; if (!sh) return; sh.i = (sh.i + d + sh.items.length) % sh.items.length; AudioFX.tick(); }
function shopBuy() {
  const sh = G.shop; if (!sh) return; const it = sh.items[sh.i], why = it.why();
  if (why) { sh.msg = why + '.'; sh.good = false; AudioFX.nope(); return; }
  if (G.money < it.price) { sh.msg = sh.def.kind === 'pub' ? "Nae tick here. You're £" + Math.ceil(it.price - G.money) + ' short.' : "Come back wi £" + Math.ceil(it.price - G.money) + ' mair.'; sh.good = false; AudioFX.nope(); return; }
  G.money -= it.price; sh.msg = it.buy(); sh.good = true; sh.n++;
  const i = sh.i; sh.items = sh.def.items(); sh.i = Math.min(i, sh.items.length - 1);          // prices and names can change once you have bought something
}
