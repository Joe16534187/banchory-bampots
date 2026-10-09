'use strict';
function knockPlayer(vx, vy) {
  const P = player; if (P.inv > 0 || P.knock > 0) return;
  P.knock = 1.7; P.vx = vx * 0.8 + rnd(-40, 40); P.vy = vy * 0.8 + rnd(-40, 40); P.z = 1; P.vz = 190; P.rv = rnd(-13, 13); P.inv = 3;
  if (P.armour > 0) { P.armour--; floater(P.x, P.y - 30, P.armour ? 'The tweed took it!' : 'The tweed is done for!', '#c9b06a'); } else P.hp--;
  G.shake = 12; AudioFX.bonk(); say(P, pick(['Oof!', 'Ooyah!', 'Ma heid!']));
}
function respawn(at) { const P = player; P.x = at.x; P.y = at.y; P.vx = P.vy = 0; P.knock = 0; P.z = 0; P.rot = 0; P.inv = 2.5; P.safe.x = at.x; P.safe.y = at.y; cam.x = at.x; cam.y = at.y; }
function drookit() {
  const P = player;
  if (P.car) { P.car.driver = null; P.car = null; }
  AudioFX.jingle(false); AudioFX.splash(); G.shake = 10; const cold = P.inv <= 0;
  if (missionEvent('drookit') !== 'handled') bigText('DROOKIT!', 'Soaked in the river', '#7fd1ff');
  if (cold) P.hp--; respawn(P.safe); P.freeze = 1.1; puff(P.x, P.y, 8, '#bfe3f7', 60, 4, 0.7, 2);
  if (P.hp <= 0) knackered();
}
function knackered() {
  const P = player; if (P.car) { P.car.driver = null; P.car = null; }
  missionEvent('knackered'); bigText('KNACKERED!', 'Patched up at the health centre  -£100', '#ff8f6b'); addMoney(-100);
  P.hp = 5; P.tipsy = 0; G.heat = 0; copShots.length = 0; respawn(SPOTS.healthDoor); AudioFX.fail();
}
function nicked() {
  const P = player; if (P.car) { P.car.driver = null; P.car = null; }
  const armed = Object.keys(P.has).length > 1; P.has = { fist: true }; P.ammo = { tattie: 0, haggis: 0, rocket: 0 }; P.weapon = 'fist';
  missionEvent('nicked'); bigText('NICKED!', (armed ? 'Weapons confiscated' : 'A stern word from the polis') + '  -£150', '#8fb8ff'); addMoney(-150);
  G.heat = 0; G.nickT = 0; P.tipsy = 0; copShots.length = 0; respawn(SPOTS.polisDoor); AudioFX.jingle(false); AudioFX.fail();
  for (const c of cars) if (c.sp.cop && c.ai && c.ai.mode === 'chase' && !onScreen(c.x, c.y)) c.gone = true;
}
function updatePlayer(dt, inp) {
  const P = player;
  if (P.bub) { P.bub.t -= dt; if (P.bub.t <= 0) P.bub = null; }
  if (P.inv > 0) P.inv -= dt; if (P.shove > 0) P.shove -= dt; if (P.shoveCd > 0) P.shoveCd -= dt;
  // a few pints in: it wears off in about half a minute a pint, and meantime nothing goes quite where you point it
  const tw = Math.min(P.tipsy, 4);
  if (P.tipsy > 0) {
    P.tipsy = Math.max(0, P.tipsy - dt / TIPSY_SECS); P.hicT = (P.hicT || 6) - dt;
    if (P.hicT <= 0) { P.hicT = rnd(5, 11) / Math.max(1, tw); if (tw >= 1.5 && !P.car) say(P, pick(['Hic!', 'Hic!', 'Jusht the one.', 'Am fine.', 'Hic! Pardon.']), 1.2); }
    if (P.car && !P.car.sp.boat && tw >= 2 && G.heat < 1 && G.state === 'play') for (const o of cars) if (o.type === 'police' && o.ai && hyp(o.x - P.x, o.y - P.y) < 230) { G.heat = 1.05; G.unseenT = 0; hint('The polis smell the heavy on you. Drink driving!', 3.5); break; }
  }
  if (P.knock > 0) {
    P.knock -= dt; P.x += P.vx * dt; P.y += P.vy * dt; const f = Math.exp(-(P.z > 0 ? 1.5 : 6) * dt); P.vx *= f; P.vy *= f;
    if (P.z > 0) { P.z += P.vz * dt; P.vz -= 560 * dt; P.rot += P.rv * dt; if (P.z <= 0) { P.z = 0; puff(P.x, P.y, 4, 'rgba(220,210,190,0.8)', 30, 4, 0.5); } }
    collideWalker(P);
    if (P.z <= 0 && surfaceAt(P.x, P.y) === 'water') { P.knock = 0; splash(P.x, P.y, true); drookit(); return; }
    if (P.knock <= 0) { P.rot = 0; if (P.hp <= 0) knackered(); }
    return;
  }
  if (inp.nextHit) cycleWeapon(); if (inp.numHit) { const w = WORDER[inp.numHit - 1]; if (w && P.has[w]) P.weapon = w; }
  if (P.car) {
    const c = P.car;
    if (c.fireT > 0 && c.driver === 'player') c.fireT -= dt;
    if (hasNitro(c)) {
      if (c.nitro <= 0.02) c.nlock = true; else if (c.nitro > 0.3) c.nlock = false;
      c.boost = inp.nitro && inp.up && !c.nlock && !c.dead;
      c.nitro = c.boost ? Math.max(0, c.nitro - dt * 0.36) : Math.min(1, c.nitro + dt * 0.09);
    }
    updateCar(c, dt, (inp.up ? 1 : 0) - (inp.down ? 1 : 0), clamp((inp.right ? 1 : 0) - (inp.left ? 1 : 0) + (tw > 0.5 && !c.sp.boat ? Math.sin(G.t * 2.3) * 0.17 * tw * clamp(Math.abs(c.vf) / 120, 0, 1) : 0), -1, 1), inp.space);
    if (!P.car) return;                      // went for a swim
    P.x = c.x; P.y = c.y; P.a = c.a; P.vx = c.vx; P.vy = c.vy;
    if (inp.horn) { if (c.type === 'icevan') { if (inp.hornHit) AudioFX.jingle('toggle'); } else if (c.type === 'police' || c.type === 'polvan') { if (inp.hornHit) c.siren = !c.siren; }
      else if (c.sp.tank) { c.turret = c.a; if (inp.hornHit && !c.dead) { if (c.fireT > 0) hint('Reloading...', 0.6); else { c.fireT = 1.5; fireShell(c, c.x + Math.cos(c.a) * 430, c.y + Math.sin(c.a) * 430, false); } } }
      else c.horn = 0.1; }
    if (c.sp.tank) c.turret = c.a;
    if (inp.enterHit) exitCar();
  } else {
    let mx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), my = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
    if (P.freeze > 0) { P.freeze -= dt; mx = 0; my = 0; }
    const m = hyp(mx, my), sp = P.box ? 118 : P.carrying ? 122 : 132;
    if (m > 0 && tw > 0.5) { const wob = Math.sin(G.t * 2.9) * 0.2 * tw, cw = Math.cos(wob), sw = Math.sin(wob), ox = mx; mx = ox * cw - my * sw; my = ox * sw + my * cw; }      // weaving hame
    if (m > 0) { mx /= m; my /= m; P.a += angDiff(P.a, Math.atan2(my, mx)) * Math.min(1, dt * 14); P.walk += dt * 13; }
    P.moving = m > 0;
    P.vx = lerp(P.vx, mx * sp, Math.min(1, dt * 12)); P.vy = lerp(P.vy, my * sp, Math.min(1, dt * 12));
    P.x += P.vx * dt; P.y += P.vy * dt;
    collideWalker(P);
    P.x = clamp(P.x, 30, WW - 30); P.y = clamp(P.y, 30, WH - 30);
    // motors: get shoved aside, or sent flying
    for (const c of cars) {
      const dx = P.x - c.x, dy = P.y - c.y, R = c.sp.len / 2 + 14; if (Math.abs(dx) > R || Math.abs(dy) > R || c.sink) continue;
      const fx = Math.cos(c.a), fy = Math.sin(c.a);
      for (const o of c.sp.offs) { const ex = P.x - (c.x + fx * o), ey = P.y - (c.y + fy * o), d = hyp(ex, ey), rr = c.sp.r + 7; if (d < rr && d > 0.01) { if (carSpeed(c) > 85 && (ex * c.vx + ey * c.vy) > 0) { knockPlayer(c.vx, c.vy); return; } P.x += ex / d * (rr - d); P.y += ey / d * (rr - d); } }
    }
    for (const p of peds) { if (p.state === 'fly') continue; const dx = p.x - P.x, dy = p.y - P.y, d = hyp(dx, dy); if (d < 13 && d > 0.01) { p.x += dx / d * (13 - d); p.y += dy / d * (13 - d); } }
    if (surfaceAt(P.x, P.y) === 'water') { splash(P.x, P.y, true); drookit(); return; }
    if (inp.enterHit) {
      let best = null, bd = 1e9;
      for (const c of cars) { if (c.sink) continue; const fx = Math.cos(c.a), fy = Math.sin(c.a); for (const o of c.sp.offs) { const d = hyp(P.x - (c.x + fx * o), P.y - (c.y + fy * o)) - c.sp.r; if (d < bd) { bd = d; best = c; } } }
      if (best && bd < (best.sp.boat ? 36 : 26)) enterCar(best);
    } else {
      if (inp.spaceHit) P.fireBuf = 0.3; else if (P.fireBuf > 0) P.fireBuf -= dt;
      if ((P.fireBuf > 0 || (inp.space && WEAPONS[P.weapon].auto)) && P.shoveCd <= 0 && P.freeze <= 0) {
        const tap = P.fireBuf > 0; P.fireBuf = 0;
        if (!(tap && missionEvent('action') === 'handled')) useWeapon();
      }
    }
  }
  P.safeT -= dt;
  if (P.safeT <= 0) { P.safeT = 0.35; const s = surfaceAt(P.x, P.y); if (s !== 'water' && (!P.car || s === 'road' && !_rb) && riverDist(P.x, P.y) > 70) { P.safe.x = P.x; P.safe.y = P.y; } }
}
function collideWalker(P) {
  queryGrid(GRID, P.x, P.y, 14, _cols);
  for (const col of _cols) { const r = resolveCircle(P.x, P.y, 7, col); if (r) { P.x += r.nx * r.pen; P.y += r.ny * r.pen; } }
}

// ---------- world setup ----------
function initWorld() {
  cars.length = 0; peds.length = 0; pickups.length = 0; copShots.length = 0; helis.length = 0; splats.length = 0; G.herd = null; G.funeral = null;
  for (const p of PARKED) makeCar(p.type, p.x, p.y, p.a, { keep: !!p.keep, tag: p.tag || '', parked0: true });
  const herd = (kind, n, home, v0, v1) => { for (let i = 0; i < n; i++) { const s = makePed(home.x + rnd(40, home.w - 40), home.y + rnd(40, home.h - 40), kind); s.state = 'wander'; s.home = home; s.keep = true; s.spd = rnd(v0, v1); s.animal = kind !== 'ped'; if (kind === 'ped') { s.hiker = true; s.hat = 2; } if (kind === 'cow') { s.shirt = pick(['#b5651d', '#c2742a', '#a85a1c', '#d9b77a', '#2b2622']); s.chatT = rnd(3, 30); } } };
  herd('sheep', 12, SHEEP_FIELD, 24, 36); herd('turkey', 16, TURKEY_FIELD, 26, 44); herd('cow', 9, COW_HOME, 14, 22);
  makePagans();
  herd('ped', 4, { x: LM.tower.x + 70, y: LM.tower.y - 130, w: 230, h: 270 }, 30, 44);                 // hikers taking in the view from the top of Scolty
  // Banchory Cricket Club, hard at it in Burnett Park: two at the crease and five in the field
  for (let i = 0; i < 7; i++) {
    const bat = i < 2, home = bat ? { x: CRICKET.x + (i ? 1 : -1) * 40 - 35, y: CRICKET.y - 35, w: 70, h: 70 } : CRICKET_BOX;
    const s = makePed(home.x + home.w / 2 + (bat ? 0 : rnd(-150, 150)), home.y + home.h / 2 + (bat ? 0 : rnd(-110, 110)));
    s.state = 'wander'; s.home = home; s.keep = true; s.cricketer = true; s.bat = bat; s.spd = bat ? 26 : rnd(34, 50); s.shirt = '#f6f3e6'; s.legs = '#ebe8da'; s.hat = i % 3 === 2 ? 0 : 1; s.hatCol = bat ? '#16324f' : '#f6f3e6'; s.chatT = rnd(3, 25);
  }
  // Big Eck, purveyor of fish and ordnance, in the grounds of Glen O' Dee
  { const d = makePed(SPOTS.dealer.x, SPOTS.dealer.y); d.state = 'wait'; d.stay = true; d.keep = true; d.dealer = true; d.post = { x: SPOTS.dealer.x, y: SPOTS.dealer.y }; d.a = Math.PI / 2; d.shirt = '#4a4034'; d.legs = '#2b2b2b'; d.hat = 1; d.hatCol = '#6b6f58'; d.hair = '#9a9a9a'; G.dealer = d; }
  G.dinghy = makeCar('dinghy', DINGHY_SPOT.x, DINGHY_SPOT.y, 0, { keep: true, tag: 'dinghy', moored: true }); G.dnT = 0; salmon.length = 0;
  ROWIES.forEach((p, i) => pickups.push({ x: p.x, y: p.y, type: 'rowie', id: i, gone: !!G.rowies[i], t: 0 }));
  PIES.forEach(p => pickups.push({ x: p.x, y: p.y, type: 'pie', gone: false, t: 0 }));
  WEAPON_SPOTS.forEach(p => pickups.push({ x: p.x, y: p.y, type: 'weapon', w: p.w, gone: false, t: 0 }));
  shots.length = 0; G.pzazz = null; spawnPzazz();
}

// ---------- the Pzazz: one of a kind, never where you left it ----------
function spawnPzazz() {
  for (let i = 0; i < 40; i++) {
    const p = pick(PZAZZ_SPOTS);
    if (G.pzazzLast === p || inBuilding(p.x, p.y, 26) || surfaceAt(p.x, p.y) === 'water' || (G.state !== 'title' && hyp(p.x - player.x, p.y - player.y) < 1500)) continue;
    let clear = true; for (const c of cars) if (hyp(c.x - p.x, c.y - p.y) < 70) { clear = false; break; }
    if (!clear) continue;
    G.pzazzLast = p; G.pzazz = makeCar('pzazz', p.x, p.y, rnd(TAU), { keep: true, tag: 'pzazz' }); G.pzT = 0; return;
  }
}
function updatePzazz(dt) {
  const z = G.pzazz;
  if (z && !z.gone && !(z.dead && z !== player.car && hyp(z.x - player.x, z.y - player.y) > 1100)) return;
  if (z && !z.gone) z.gone = true;
  G.pzT = (G.pzT || 0) + dt; if (G.pzT > 25) spawnPzazz();
}

// ---------- weapons (slapstick only: folk fall over, motors conk out) ----------
const WEAPONS = {
  fist: { name: 'Bare hands', melee: true, reach: 32, power: 170, cd: 0.45 },
  haddock: { name: 'Wet haddock', melee: true, reach: 46, power: 290, cd: 0.36 },
  tattie: { name: 'Tattie gun', per: 40, cd: 0.15, auto: true, unit: 'tatties' },
  haggis: { name: 'Haggis grenade', per: 6, cd: 0.7, unit: 'haggis' },
  rocket: { name: 'Ginger rocket', per: 4, cd: 1.0, unit: 'rockets' }
};
const WORDER = ['fist', 'haddock', 'tattie', 'haggis', 'rocket'];
function cycleWeapon() { const P = player; let i = WORDER.indexOf(P.weapon); for (let k = 0; k < 5; k++) { i = (i + 1) % 5; const w = WORDER[i]; if (P.has[w] && (WEAPONS[w].melee || P.ammo[w] > 0)) { P.weapon = w; AudioFX.tick(); return; } } }
function carReact(c, heat) { if (c.ai) { c.ai.stun = Math.max(c.ai.stun, c.sp.tank ? 0.15 : 0.6); c.horn = 0.5; } if (c !== player.car) addHeat(c.sp.cop ? heat * 3 : heat); }
function useWeapon() {
  const P = player, w = P.weapon, Wp = WEAPONS[w], fx = Math.cos(P.a), fy = Math.sin(P.a);
  P.shoveCd = Wp.cd; P.shove = 0.2;
  if (Wp.melee) {
    let hit = false;
    for (const p of peds) { const dx = p.x - P.x, dy = p.y - P.y, d = hyp(dx, dy); if (d < Wp.reach && p.state !== 'fly' && p.state !== 'down' && (dx * fx + dy * fy) > 0) { knockPed(p, fx * Wp.power, fy * Wp.power, !p.animal); hit = true; } }
    for (const p of PROPS) { if (p.knocked || p.solid) continue; const dx = p.x - P.x, dy = p.y - P.y; if (Math.abs(dx) < Wp.reach && Math.abs(dy) < Wp.reach && (dx * fx + dy * fy) > 0) { p.knocked = true; p.vx = fx * Wp.power * 0.9; p.vy = fy * Wp.power * 0.9; p.vr = rnd(-8, 8); p.z = 1; p.vz = 120; AudioFX.clatter(0.6); hit = true; } }
    if (w === 'haddock') {
      for (const c of cars) { const dx = c.x - P.x, dy = c.y - P.y, d = hyp(dx, dy); if (d < Wp.reach + c.sp.len / 2 && (dx * fx + dy * fy) > 0 && !c.sink) { c.vx += fx * 50 / c.sp.mass; c.vy += fy * 50 / c.sp.mass; if (!c.dead && !c.sp.tank) { c.dmg += 4; if (c.dmg >= 100) killCar(c); } carReact(c, 0.15); hit = true; } }
      AudioFX.slap(); for (let i = 0; i < 4; i++) part(P.x + fx * 22, P.y + fy * 22, fx * 80 + rnd(-60, 60), fy * 80 + rnd(-60, 60), 0.35, 2.5, '#cfe8f5', 'dot');
      if (hit) floater(P.x + fx * 30, P.y + fy * 30 - 10, pick(['SLAP!', 'SKELP!', 'THWAP!']), '#cfe8f5');
    }
    return;
  }
  if (P.ammo[w] <= 0) { hint('Out of ' + Wp.unit); cycleWeapon(); return; }
  P.ammo[w]--; addHeat(0.05);
  const sx = P.x + fx * 13, sy = P.y + fy * 13;
  if (w === 'tattie') { const a = P.a + rnd(-0.045, 0.045); shots.push({ type: 'tattie', x: sx, y: sy, vx: Math.cos(a) * 640 + P.vx * 0.4, vy: Math.sin(a) * 640 + P.vy * 0.4, life: 0.7, rot: rnd(TAU) }); AudioFX.pop(); }
  else if (w === 'haggis') { shots.push({ type: 'haggis', x: sx, y: sy, vx: fx * 300 + P.vx * 0.5, vy: fy * 300 + P.vy * 0.5, z: 8, vz: 230, fuse: 1.5, rot: 0 }); AudioFX.whoosh(); }
  else { shots.push({ type: 'rocket', x: sx, y: sy, a: P.a, sp: 140, vx: 0, vy: 0, life: 1.5, rot: 0 }); AudioFX.fizz(); P.vx -= fx * 160; P.vy -= fy * 160; }
  if (P.ammo[w] <= 0) { hint('Out of ' + Wp.unit); P.weapon = P.has.haddock ? 'haddock' : 'fist'; }
}
