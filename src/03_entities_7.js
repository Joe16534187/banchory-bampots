'use strict';
// ---------- farm beasts: roadkill, the stampede, and the folk at the auld stanes ----------
const splats = [];                              // what is left of a sheep or a turkey after a motor has been over it

// Sheep and turkeys do not survive being run over. Another comes out of the farm shed, so the head count never changes.
function killAnimal(p, c) {
  p.dead = true;
  splats.push({ x: p.x, y: p.y, kind: p.kind, a: p.a, sk: Math.atan2(c.vy, c.vx), t: 40 }); if (splats.length > 40) splats.shift();
  if (onScreen(p.x, p.y, 40)) {
    puff(p.x, p.y, 9, p.kind === 'sheep' ? '#f3f1ea' : '#5a3a22', 120, 4, 0.9, 2); if (p.kind === 'turkey') puff(p.x, p.y, 5, '#e8dcc0', 150, 3, 1.0, 0);
    floater(p.x, p.y - 14, p.kind === 'sheep' ? pick(['SPLAT!', 'Mutton!', 'Baa...']) : pick(['SPLAT!', 'Gobble...', 'Christmas dinner!']), '#fff');
    AudioFX.slap(); if (p.kind === 'sheep') AudioFX.baa(); else AudioFX.gobble();
  }
  c.vx *= 0.94; c.vy *= 0.94;
  const d = SHED[p.kind], n = makePed(d.x + rnd(-8, 8), d.y, p.kind);
  n.state = 'wander'; n.home = p.home; n.keep = true; n.spd = p.spd; n.animal = true; n.flee = 5; n.a = Math.PI / 2;       // comes out at a run
}
function updateSplats(dt) { for (let i = splats.length - 1; i >= 0; i--) { splats[i].t -= dt; if (splats[i].t <= 0) splats.splice(i, 1); } }

// ---------- the stampede ----------
// The herd shares one target (G.herd) and thunders after it. Coos turn slowly, so stepping aside works; standing in front does not.
function stampede(on) {
  G.herd = on ? { x: SPOTS.pigStart.x, y: SPOTS.pigStart.y, t: 0, cx: 0, cy: 0 } : null;
  for (const p of peds) {
    if (p.kind !== 'cow') continue;
    if (on) { p.back = 'stampede'; if (p.state !== 'fly' && p.state !== 'down') p.state = 'stampede'; p.run = rnd(150, 182); p.ox = rnd(-95, 95); p.oy = rnd(-95, 95); }
    else { p.back = null; if (p.state === 'stampede') { p.state = 'wander'; p.t = 0; } }
  }
}
function herdUpdate(dt, pig) {
  const H = G.herd, P = player, hm = COW_HOME; if (!H) return;
  let cx = 0, cy = 0, n = 0; for (const p of peds) if (p.kind === 'cow') { cx += p.x; cy += p.y; n++; }
  if (!n) return; cx /= n; cy /= n; H.cx = cx; H.cy = cy; H.t -= dt;
  if (H.t <= 0 || hyp(H.x - cx, H.y - cy) < 80) {
    const r = Math.random(), pin = !P.car && P.x > hm.x - 40 && P.x < hm.x + hm.w + 40 && P.y > hm.y - 40 && P.y < hm.y + hm.h + 40;
    let tx, ty;
    if (pig && !pig.dead && r < 0.4) { tx = pig.x; ty = pig.y; }
    else if (pin && r < 0.78) { tx = P.x + P.vx * 0.6; ty = P.y + P.vy * 0.6; }
    else { tx = hm.x + rnd(60, hm.w - 60); ty = hm.y + rnd(60, hm.h - 60); }
    const a = Math.atan2(ty - cy, tx - cx); tx += Math.cos(a) * 170; ty += Math.sin(a) * 170;                    // they thunder on past whatever they were after
    H.x = clamp(tx, hm.x + 40, hm.x + hm.w - 40); H.y = clamp(ty, hm.y + 40, hm.y + hm.h - 40); H.t = rnd(2.4, 3.8);
  }
  AudioFX.rumble = Math.max(AudioFX.rumble, clamp(1 - hyp(cx - P.x, cy - P.y) / 900, 0, 1));
}
function stampedeStep(p, dt) {
  const H = G.herd, hm = p.home; if (!H) { p.state = 'wander'; p.t = 0; return; }
  const tx = clamp(H.x + p.ox, hm.x + 10, hm.x + hm.w - 10), ty = clamp(H.y + p.oy, hm.y + 10, hm.y + hm.h - 10), far = hyp(tx - p.x, ty - p.y);
  p.a += clamp(angDiff(p.a, Math.atan2(ty - p.y, tx - p.x)), -dt * 1.6, dt * 1.6);
  const sp = p.run * (far < 45 ? 0.45 : 1), fx = Math.cos(p.a), fy = Math.sin(p.a);
  p.vx = fx * sp; p.vy = fy * sp; p.x += p.vx * dt; p.y += p.vy * dt; p.walk += sp * dt * 0.2;
  p.x = clamp(p.x, hm.x - 30, hm.x + hm.w + 30); p.y = clamp(p.y, hm.y - 20, hm.y + hm.h + 20);
  for (const o of peds) { if (o === p || o.kind !== 'cow') continue; const dx = p.x - o.x, dy = p.y - o.y, d = hyp(dx, dy); if (d < 24 && d > 0.01) { p.x += dx / d * (24 - d) * 0.5; p.y += dy / d * (24 - d) * 0.5; } }   // shoulder to shoulder, not on top of each other
  if (onScreen(p.x, p.y, 30)) {
    if (Math.random() < dt * 8) puff(p.x - fx * 12, p.y - fy * 12, 1, 'rgba(150,130,90,0.6)', 24, 5, 0.6);
    if (Math.random() < dt * 0.22) { say(p, pick(['MOO!', 'MOOO!', 'HRMPH!']), 1.2); AudioFX.moo(vol(p.x, p.y)); }
  }
  const P = player;
  if (!P.car && G.state === 'play' && P.knock <= 0 && P.inv <= 0 && hyp(P.x - p.x, P.y - p.y) < 17) tramplePlayer(p);
  for (const o of peds) if (o.kind === 'pig' && o.state !== 'fly' && o.state !== 'down' && hyp(o.x - p.x, o.y - p.y) < 15) knockPed(o, p.vx * 0.7, p.vy * 0.7, false);
}
function tramplePlayer(cow) {                    // a coo is worth two hearts (or one heart and a layer of tweed)
  const P = player, tweed = P.armour > 0;
  knockPlayer(cow.vx * 1.2, cow.vy * 1.2); if (!tweed) P.hp--;
  floater(P.x, P.y - 34, 'TRAMPLED!', '#ffb347'); G.shake = 16; AudioFX.thud(1);
  missionEvent('trampled');
}
function panicStep(p, dt) {                      // a piglet with nowhere to go, darting away from whichever coo is nearest
  const hm = p.home; p.t -= dt;
  if (p.t <= 0 || p.tx === undefined || hyp(p.tx - p.x, p.ty - p.y) < 10) {
    let nx = 0, ny = 0; for (const o of peds) if (o.kind === 'cow') { const dx = p.x - o.x, dy = p.y - o.y, d = hyp(dx, dy); if (d < 220 && d > 1) { nx += dx / d * (220 - d); ny += dy / d * (220 - d); } }
    const a = nx || ny ? Math.atan2(ny, nx) + rnd(-1.1, 1.1) : rnd(TAU), r = rnd(70, 150);
    p.tx = clamp(p.x + Math.cos(a) * r, hm.x + 40, hm.x + hm.w - 40); p.ty = clamp(p.y + Math.sin(a) * r, hm.y + 40, hm.y + hm.h - 40); p.t = rnd(0.5, 1.1);
    if (onScreen(p.x, p.y) && Math.random() < 0.3) say(p, pick(['Wheek!', 'Oink!', 'Wheeeek!']), 0.9);
  }
  const dx = p.tx - p.x, dy = p.ty - p.y, d = hyp(dx, dy) || 1;
  p.x += dx / d * p.spd * dt; p.y += dy / d * p.spd * dt; p.walk += p.spd * dt * 0.3; p.a += angDiff(p.a, Math.atan2(dy, dx)) * Math.min(1, dt * 12);
}

// ---------- the folk at the auld stanes, in the woods at the top of the Glassel Road ----------
function makePagans() {
  G.pagans = [];
  for (let i = 0; i < 6; i++) {
    const an = i * TAU / 6 + 0.52, x = SPOTS.stanes.x + Math.cos(an) * 58, y = SPOTS.stanes.y + Math.sin(an) * 58, p = makePed(x, y);
    p.state = 'wait'; p.stay = true; p.keep = true; p.robe = true; p.ring = an; p.post = { x, y }; p.post0 = { x, y }; p.face = SPOTS.stanes; p.a = an + Math.PI;
    p.shirt = pick(['#3d2f52', '#2f4a3a', '#4a3528', '#2b3550']); p.legs = p.shirt; p.hat = 0; p.chatT = rnd(3, 20);
    if (i === 0) { p.chief = true; p.antlers = true; p.shirt = p.legs = '#5a2a2a'; }
    G.pagans.push(p);
  }
}
function pagansHome() { for (const p of G.pagans) { p.post = p.post0; p.face = SPOTS.stanes; p.flee = 0; } }
// send the polis in along the forest track
function polisRaid() {
  const n = NODES.pgJ, e = n.edges[0], T = SPOTS.stanes;
  [['police', 0], ['police', 230], ['polvan', -230]].forEach(q => {
    const x = n.x + e.ux * q[1], y = n.y + e.uy * q[1]; if (onScreen(x, y, 140)) return;
    const to = q[1] ? n : T, a = Math.atan2(to.y - y, to.x - x), c = makeCar(q[0], x, y, a);                       // the first is already turning in; the others come along the road to the junction
    aiStart(c, e, 1); c.ai.mode = 'chase'; c.ai.node = q[1] ? n : NODES.pg1; c.siren = true; c.vx = Math.cos(a) * 60; c.vy = Math.sin(a) * 60;
  });
  G.polT = 5; G.heliT = Math.max(G.heliT || 0, 9);                 // a head start afore the helicopter turns up
}
