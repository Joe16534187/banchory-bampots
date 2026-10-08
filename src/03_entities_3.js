'use strict';
// ---------- pedestrians ----------
const SHIRTS = ['#c8322b', '#2f66b3', '#e8e4da', '#3b3f46', '#1f7a4d', '#d9a521', '#7a3fa0', '#d86a1e', '#56b6c9', '#9a2f5a', '#6b7a3a', '#8a5a2b'];
const OUCH = ['Jings!', 'Michty me!', 'Help ma boab!', 'Ya bampot!', 'Watch it, min!', 'Fit ye daein?!', 'Crivvens!', 'Ooyah!', 'Mind yersel!', 'Aye, very good.'];
const HIKE = ['Fine view!', 'Nearly there.', 'Is it far?', 'Ma legs!', 'Braw day for it.', 'Mind the roots.'];
const HOWZAT = ['Howzat!', 'Owzat!', 'Catch it!', 'Good shot.', 'No ball!', 'Tea yet?', 'Leg before, surely.', 'Mind the square!'];
const CHAT = ['Fit like?', 'Nae bad.', 'Affa weather.', 'Foos yer doos?', 'Aye, peckin awa.', 'Braw day.', 'Chavvin awa.'];
function makePed(x, y, kind) {
  const p = { x, y, a: rnd(TAU), kind: kind || 'ped', state: 'walk', t: 0, vx: 0, vy: 0, z: 0, vz: 0, rot: 0, rv: 0, spd: rnd(34, 52), e: null, dir: 1, sw: 1, bub: null, walk: rnd(TAU), flee: 0, chatT: rnd(4, 30),
    skin: pick(['#f1c9a5', '#e8b88f', '#f6d7bd', '#c98f62', '#8d5a3b', '#f3cfb4']), shirt: pick(SHIRTS), hair: pick(['#3a2a1c', '#6b4a2b', '#c9a25a', '#b5482a', '#d8d8d8', '#1c1c1c', '#9a9a9a']),
    hat: Math.random() < 0.28 ? (Math.random() < 0.5 ? 1 : 2) : 0, hatCol: pick(['#6b6f58', '#7a6a55', '#b22', '#2f66b3', '#444']), legs: pick(['#2d3a55', '#3b3b3b', '#5a4a3a', '#2f4a3a']), keep: false, home: null };
  peds.push(p); return p;
}
function knockPed(p, vx, vy, byPlayer) {
  if (p.state === 'fly') return;
  const s = hyp(vx, vy);
  p.state = 'fly'; p.vx = vx * 0.9 + rnd(-50, 50); p.vy = vy * 0.9 + rnd(-50, 50); p.vz = 150 + s * 0.3; p.z = 1; p.rv = rnd(-14, 14);
  if (p.kind === 'sheep') { say(p, 'BAA!'); if (onScreen(p.x, p.y)) AudioFX.baa(); }
  else if (p.kind === 'turkey') { say(p, 'GOBBLE!'); if (onScreen(p.x, p.y)) AudioFX.gobble(); }
  else { say(p, pick(OUCH)); if (onScreen(p.x, p.y)) AudioFX.bonk(); if (byPlayer) addHeat(s > 100 ? 0.5 : 0.3); }
}
function spawnPed() {
  const f = focusPos(); let n = 0;
  for (const p of peds) if (p.kind === 'ped' && !p.home && !p.stay) n++;
  if (n >= 26) return;
  for (let tries = 0; tries < 6; tries++) {
    const e = pick(EDGES); if (!e.peds) continue;
    const t = rnd(20, e.len - 20), sw = Math.random() < 0.5 ? 1 : -1, off = (e.hw + (e.pave ? e.pave / 2 + 1 : 7)) * sw;
    const x = e.a.x + e.ux * t + e.uy * off, y = e.a.y + e.uy * t - e.ux * off, d = hyp(x - f.x, y - f.y);
    if (d > 1500 || onScreen(x, y, 60)) continue;
    const p = makePed(x, y); p.e = e; p.dir = Math.random() < 0.5 ? 1 : -1; p.sw = sw; if (e.type === 'track') { p.hiker = true; p.hat = 2; p.spd *= 0.9; } return;
  }
}
function pedFindEdge(p) {
  let bd = 1e9;
  for (const e of EDGES) { if (!e.peds) continue; const dx = p.x - e.a.x, dy = p.y - e.a.y, t = clamp(dx * e.ux + dy * e.uy, 0, e.len), qx = dx - e.ux * t, qy = dy - e.uy * t, d = hyp(qx, qy); if (d < bd) { bd = d; p.e = e; p.sw = (qx * e.uy - qy * e.ux) >= 0 ? 1 : -1; } }
  p.dir = Math.random() < 0.5 ? 1 : -1; if (bd > 900) p.e = null;
}
function updatePed(p, dt) {
  if (p.bub) { p.bub.t -= dt; if (p.bub.t <= 0) p.bub = null; }
  if (p.state === 'fly') {
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-1.6 * dt); p.vy *= Math.exp(-1.6 * dt); p.z += p.vz * dt; p.vz -= 560 * dt; p.rot += p.rv * dt;
    queryGrid(GRID, p.x, p.y, 10, _cols); for (const col of _cols) { const r = resolveCircle(p.x, p.y, 6, col); if (r) { p.x += r.nx * r.pen; p.y += r.ny * r.pen; const vn = p.vx * r.nx + p.vy * r.ny; if (vn < 0) { p.vx -= 1.5 * vn * r.nx; p.vy -= 1.5 * vn * r.ny; } } }
    if (p.z <= 0) {
      p.z = 0;
      if (surfaceAt(p.x, p.y) === 'water') { splash(p.x, p.y); if (onScreen(p.x, p.y)) { AudioFX.splash(); floater(p.x, p.y, 'Glug!', '#cfeaff'); } p.dead = true; return; }
      p.state = 'down'; p.t = rnd(1.5, 2.6); puff(p.x, p.y, 4, 'rgba(220,210,190,0.8)', 30, 4, 0.5);
    }
    return;
  }
  if (p.state === 'down') { p.t -= dt; if (p.t <= 0) { p.state = p.home ? 'wander' : p.kind === 'stag' || p.stay ? 'wait' : 'walk'; p.flee = 3.5; p.rot = 0; if (p.kind === 'ped' && Math.random() < 0.5) say(p, p.dealer ? pick(['Nae discount for that.', 'Prices just went up.', 'Cheeky.']) : p.cricketer ? pick(['Not cricket, that.', 'Pitch invader!', 'Umpire!']) : pick(['Ya bampot!', 'Polis!', 'Aye, right!', "I'm fine. I'm fine."])); } return; }
  if (p.flee > 0) p.flee -= dt;
  if (p.state === 'wait') {
    if (p.post && hyp(p.post.x - p.x, p.post.y - p.y) > 5) { const qx = p.post.x - p.x, qy = p.post.y - p.y, q = hyp(qx, qy); p.x += qx / q * 60 * dt; p.y += qy / q * 60 * dt; p.a = Math.atan2(qy, qx); p.walk += dt * 13; return; }      // back to the stall
    const dx = player.x - p.x, dy = player.y - p.y; p.a += angDiff(p.a, Math.atan2(dy, dx)) * Math.min(1, dt * 4); p.walk += dt * 2; return;
  }
  let tx, ty, spd = p.spd * (p.flee > 0 ? 2.5 : 1);
  if (p.state === 'wander') {
    p.t -= dt; if (p.t <= 0 || p.tx === undefined) { p.tx = p.home.x + rnd(30, p.home.w - 30); p.ty = p.home.y + rnd(30, p.home.h - 30); p.t = rnd(3, 9); p.idle = Math.random() < 0.5 ? rnd(1, 4) : 0; }
    if (p.cricketer) { p.chatT -= dt; if (p.chatT <= 0) { p.chatT = rnd(9, 30); if (onScreen(p.x, p.y)) say(p, pick(HOWZAT)); } }
    if (p.idle > 0 && p.flee <= 0) { p.idle -= dt; return; }
    tx = p.tx; ty = p.ty; if (hyp(tx - p.x, ty - p.y) < 8) { p.t = 0; return; }
    spd *= 0.6;
  } else {
    if (!p.e) { pedFindEdge(p); if (!p.e) { p.dead = true; return; } }
    const e = p.e;
    const A = p.dir > 0 ? e.a : e.b, Bn = p.dir > 0 ? e.b : e.a, ux = e.ux * p.dir, uy = e.uy * p.dir, t = (p.x - A.x) * ux + (p.y - A.y) * uy;
    if (t > e.len - (e.hw + e.pave + 4)) {
      const opts = Bn.edges.filter(x => x !== e && x.peds);
      if (!opts.length) p.dir = -p.dir; else { const ne = pick(opts); p.e = ne; p.dir = ne.a === Bn ? 1 : -1; if (Math.random() < 0.5) p.sw = -p.sw; }
      return;
    }
    const off = (e.hw + (e.pave ? e.pave / 2 + 1 : 7)) * p.sw, tt = Math.min(t + 26, e.len);
    tx = A.x + ux * tt + e.uy * off; ty = A.y + uy * tt - e.ux * off;
    p.chatT -= dt; if (p.chatT <= 0) { p.chatT = rnd(15, 50); if (onScreen(p.x, p.y) && !player.box) say(p, pick(p.hiker ? HIKE : CHAT)); else if (onScreen(p.x, p.y)) say(p, pick(['Boxhead!', 'Is that a box?', 'Nice hat!', 'Ha!'])); }
  }
  const dx = tx - p.x, dy = ty - p.y, d = hyp(dx, dy) || 1;
  p.x += dx / d * spd * dt; p.y += dy / d * spd * dt; p.walk += spd * dt * 0.22;
  p.a += angDiff(p.a, Math.atan2(dy, dx)) * Math.min(1, dt * 8);
  // leap clear of fast motors
  for (const c of cars) {
    const cs = carSpeed(c); if (cs < 130) continue; const rx = p.x - c.x, ry = p.y - c.y, rd = hyp(rx, ry); if (rd > 110 || rd < 1) continue;
    if ((rx * c.vx + ry * c.vy) / (rd * cs) > 0.86 && Math.random() < dt * 5) { const s = (rx * -c.vy + ry * c.vx) > 0 ? 1 : -1; p.state = 'fly'; p.vx = -c.vy / cs * 170 * s; p.vy = c.vx / cs * 170 * s; p.vz = 130; p.z = 1; p.rv = rnd(-6, 6); say(p, pick(OUCH)); break; }
  }
}
function collideCarPeds(c) {
  const cs = carSpeed(c); if (cs < 12 || c.sink || c.sp.boat) return;
  const fx = Math.cos(c.a), fy = Math.sin(c.a), R = c.sp.len / 2 + 12;
  for (const p of peds) {
    if (p.state === 'fly') continue; const dx = p.x - c.x, dy = p.y - c.y; if (Math.abs(dx) > R || Math.abs(dy) > R) continue;
    for (const o of c.sp.offs) { const ex = p.x - (c.x + fx * o), ey = p.y - (c.y + fy * o), d = hyp(ex, ey); if (d < c.sp.r + 6) { if (cs > (c === player.car ? 55 : c.ai && c.ai.mode === 'chase' ? 90 : 150)) knockPed(p, c.vx, c.vy, c === player.car); else if (d > 0.01) { p.x += ex / d * (c.sp.r + 6 - d); p.y += ey / d * (c.sp.r + 6 - d); } break; } }
  }
}
const _pp = [];
function collideCarProps(c) {
  const cs = carSpeed(c); if (cs < 30 || c.sp.boat) return;
  queryGrid(PGRID, c.x, c.y, c.sp.len / 2 + 20, _pp);
  if (!_pp.length) return;
  const fx = Math.cos(c.a), fy = Math.sin(c.a);
  for (const p of _pp) {
    if (p.knocked) continue;
    for (const o of c.sp.offs) if (hyp(p.x - (c.x + fx * o), p.y - (c.y + fy * o)) < c.sp.r + p.r) {
      p.knocked = true; p.vx = c.vx * 1.15 + rnd(-60, 60); p.vy = c.vy * 1.15 + rnd(-60, 60); p.vr = rnd(-12, 12); p.z = 1; p.vz = 160;
      const heavy = p.type === 'bale' || p.type === 'bench'; c.vx *= heavy ? 0.82 : 0.96; c.vy *= heavy ? 0.82 : 0.96;
      if (onScreen(p.x, p.y)) { AudioFX.clatter(vol(p.x, p.y)); if (p.type === 'tub') puff(p.x, p.y, 6, '#6b4a2b', 60, 4, 0.6, 2); if (p.type === 'bin') puff(p.x, p.y, 5, '#ddd', 70, 3, 0.7, 0); }
      if (c === player.car) { addMoney(p.type === 'bale' ? 10 : 5, p.x, p.y - 10); addHeat(0.03); }
      break;
    }
  }
}
function updateProps(dt) {
  for (const p of PROPS) {
    if (!p.knocked || (p.vx === 0 && p.vy === 0 && p.z <= 0)) continue;
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.z += p.vz * dt; p.vz -= 600 * dt;
    if (p.z <= 0) { p.z = 0; p.vz = 0; const f = Math.exp(-4 * dt); p.vx *= f; p.vy *= f; p.vr *= f; if (hyp(p.vx, p.vy) < 6) { p.vx = 0; p.vy = 0; p.vr = 0; if (surfaceAt(p.x, p.y) === 'water') { splash(p.x, p.y); p.sunk = true; } } }
  }
}

// ---------- the player ----------
function enterCar(c) {
  const P = player;
  if (P.box) { hint('You cannae drive with a box on your head!'); return; }
  if (c.ai) {
    const p = makePed(c.x - Math.sin(c.a) * (c.sp.w / 2 + 10), c.y + Math.cos(c.a) * (c.sp.w / 2 + 10));
    p.state = 'fly'; p.vx = -Math.sin(c.a) * 90; p.vy = Math.cos(c.a) * 90; p.vz = 120; p.z = 1; p.rv = rnd(-6, 6); p.flee = 5;
    say(p, pick(['Ma motor!', "That's ma car, min!", 'Thief!', 'Polis!'])); addHeat(c.sp.cop ? 1.5 : 0.6); c.ai = null;
  }
  c.driver = 'player'; c.siren = false; P.car = c; P.vx = P.vy = 0;
  G.vehName = c.sp.name; G.vehT = 2.6; AudioFX.door();
  if (c.sp.boat) { c.moored = false; hint('UP to paddle, LEFT and RIGHT to steer. The river does the rest.', 4.5); }
  if (c.type === 'pzazz' && !c.dead) { bigText('THE PZAZZ!', 'You found it. Hold SHIFT for nitro', '#ff7ad1', 3.6); AudioFX.pass(); }
  if (c.sp.tank && !c.dead) { bigText('A TANK!', 'H fires the big gun. Mind the neighbours', '#a9c078', 3.6); c.turret = c.a; c.fireT = 0.5; }
  if (c.dead) hint("This one's deid");
  missionEvent('enter', c);
}
function exitCar() {
  const P = player, c = P.car; if (!c) return;
  if (c.sp.boat) {
    for (let r = 26; r <= 70; r += 11) for (let k = 0; k < 12; k++) { const an = k * TAU / 12, x = c.x + Math.cos(an) * r, y = c.y + Math.sin(an) * r; if (surfaceAt(x, y) !== 'water' && !inBuilding(x, y, 6)) { c.driver = null; P.car = null; P.x = x; P.y = y; AudioFX.door(); return; } }
    hint('Paddle to the bank to get oot'); return;
  }
  if (Math.abs(c.vf) > 95) { hint('Slow down to bail oot'); return; }
  const fx = Math.cos(c.a), fy = Math.sin(c.a), off = c.sp.w / 2 + 12;
  let x = c.x - fy * off, y = c.y + fx * off;
  if (inBuilding(x, y, 6) || surfaceAt(x, y) === 'water') { x = c.x + fy * off; y = c.y - fx * off; }
  c.driver = null; c.boost = false; P.car = null; P.x = x; P.y = y; P.a = c.a; AudioFX.door(); if (c.type === 'icevan') AudioFX.jingle(false);
  missionEvent('exit', c);
}
