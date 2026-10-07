'use strict';
function explode(x, y, R, pow, dmg, kind) {
  const v = vol(x, y), P = player;
  G.shake = Math.min(20, G.shake + 16 * v); AudioFX.boom(v); addHeat(0.9);
  for (let i = 0; i < 22; i++) { const a = rnd(TAU), s = rnd(60, 380); part(x, y, Math.cos(a) * s, Math.sin(a) * s, rnd(0.25, 0.6), rnd(4, 9), pick(kind === 'haggis' ? ['#8a5a3a', '#c98f3c', '#ffe680', '#6b4a2b'] : ['#ffe680', '#ff9a2a', '#fff', '#ff5a2a']), 'dot', -4); }
  puff(x, y, 12, 'rgba(60,60,60,0.9)', 110, 14, 1.3, 26); part(x, y, 0, 0, 0.5, 14, '#fff3c0', 'ring', R);
  floater(x, y - 20, kind === 'haggis' ? 'SPLAT!' : 'BOOM!', '#ffe680');
  for (const p of peds) { const dx = p.x - x, dy = p.y - y, d = hyp(dx, dy) || 1; if (d < R) knockPed(p, dx / d * pow * (1 - d / R * 0.5), dy / d * pow * (1 - d / R * 0.5), false); else if (d < 520 && p.kind === 'ped') { p.flee = 4; if (Math.random() < 0.25) say(p, pick(OUCH)); } }
  for (const c of cars) {
    const dx = c.x - x, dy = c.y - y, d = hyp(dx, dy) || 1, RR = R + c.sp.len / 2; if (d > RR || c.sink) continue;
    const f = 1 - d / RR; c.vx += dx / d * pow * f / c.sp.mass; c.vy += dy / d * pow * f / c.sp.mass; c.spin += rnd(-4, 4) * f;
    if (!c.dead) { c.dmg += dmg * f + 8; if (c.dmg >= 100) killCar(c); } if (c.ai) c.ai.stun = Math.max(c.ai.stun, 1.2); if (c.type === 'police' && c !== P.car) addHeat(0.6);
  }
  queryGrid(PGRID, x, y, R, _pp);
  for (const p of _pp) { const dx = p.x - x, dy = p.y - y, d = hyp(dx, dy) || 1; if (p.knocked || d > R) continue; p.knocked = true; p.vx = dx / d * pow * 0.8; p.vy = dy / d * pow * 0.8; p.vr = rnd(-12, 12); p.z = 1; p.vz = 200; }
  if (!P.car && hyp(P.x - x, P.y - y) < R * 0.6) { const dx = P.x - x, dy = P.y - y, d = hyp(dx, dy) || 1; knockPlayer(dx / d * pow, dy / d * pow); }
}
function shotHits(s, r) {            // returns 'wall', a ped or a car, or null
  queryGrid(GRID, s.x, s.y, r + 2, _cols); for (const col of _cols) if (resolveCircle(s.x, s.y, r, col)) return 'wall';
  for (const p of peds) if (p.state !== 'fly' && Math.abs(p.x - s.x) < 12 + r && Math.abs(p.y - s.y) < 12 + r && hyp(p.x - s.x, p.y - s.y) < 8 + r) return p;
  for (const c of cars) { if (c === player.car && s.life > 0.5 || c.sink) continue; if (Math.abs(c.x - s.x) > 60 || Math.abs(c.y - s.y) > 60) continue; const fx = Math.cos(c.a), fy = Math.sin(c.a); for (const o of c.sp.offs) if (hyp(s.x - (c.x + fx * o), s.y - (c.y + fy * o)) < c.sp.r + r) return c; }
  return null;
}
function updateShots(dt) {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i]; let dead = false;
    if (s.type === 'tattie') {
      s.x += s.vx * dt; s.y += s.vy * dt; s.rot += dt * 20; s.life -= dt;
      const h = shotHits(s, 4);
      if (h === 'wall') { puff(s.x, s.y, 3, '#e8dcae', 50, 3, 0.4, 2); dead = true; }
      else if (h && h.sp) { if (!h.dead) { h.dmg += 5; if (h.dmg >= 100) killCar(h); } h.vx += s.vx * 0.04 / h.sp.mass; h.vy += s.vy * 0.04 / h.sp.mass; sparks(s.x, s.y, 3); AudioFX.clatter(0.5 * vol(s.x, s.y)); carReact(h, 0.12); dead = true; }
      else if (h) { knockPed(h, s.vx * 0.36, s.vy * 0.36, !h.animal); dead = true; }
      else { queryGrid(PGRID, s.x, s.y, 14, _pp); for (const p of _pp) if (!p.knocked && hyp(p.x - s.x, p.y - s.y) < p.r + 6) { p.knocked = true; p.vx = s.vx * 0.3; p.vy = s.vy * 0.3; p.vr = rnd(-10, 10); p.z = 1; p.vz = 130; AudioFX.clatter(0.5 * vol(s.x, s.y)); dead = true; break; } }
      if (s.life <= 0) dead = true;
    } else if (s.type === 'haggis') {
      s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.vz -= 520 * dt; s.rot += dt * 9; s.fuse -= dt;
      if (s.z <= 0) { s.z = 0; s.vz = Math.abs(s.vz) > 60 ? -s.vz * 0.4 : 0; const f = Math.exp(-5 * dt); s.vx *= f; s.vy *= f; }
      queryGrid(GRID, s.x, s.y, 10, _cols); for (const col of _cols) { const r = resolveCircle(s.x, s.y, 6, col); if (r) { s.x += r.nx * r.pen; s.y += r.ny * r.pen; const vn = s.vx * r.nx + s.vy * r.ny; if (vn < 0) { s.vx -= 1.5 * vn * r.nx; s.vy -= 1.5 * vn * r.ny; } } }
      if (s.fuse <= 0) { if (surfaceAt(s.x, s.y) === 'water') { splash(s.x, s.y, true); AudioFX.splash(); } else explode(s.x, s.y, 130, 340, 55, 'haggis'); dead = true; }
    } else {
      s.sp = Math.min(640, s.sp + 1000 * dt); s.a += Math.sin(G.t * 26) * 0.035; s.vx = Math.cos(s.a) * s.sp; s.vy = Math.sin(s.a) * s.sp; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      part(s.x - s.vx * 0.02, s.y - s.vy * 0.02, rnd(-20, 20), rnd(-20, 20), 0.5, 4, pick(['#ffb347', '#fff', '#ff7a2a']), 'smoke', 8);
      if (s.life <= 0 || shotHits(s, 6)) { explode(s.x, s.y, 155, 400, 90, 'rocket'); dead = true; }
    }
    if (dead || s.x < 0 || s.y < 0 || s.x > WW || s.y > WH) shots.splice(i, 1);
  }
}

// ---------- the rubber dinghy: drifts down the Dee with the current ----------
function updateBoat(c, dt, thr, steer) {
  if (c.moored) { c.vx = c.vy = 0; c.vf = 0; return; }
  const sp = c.sp, rf = riverFlow(c.x, c.y), cur = rf.r === 0 ? 78 : 60;
  c.steer += clamp(steer - c.steer, -dt * 5, dt * 5);
  if (c.driver) c.a += c.steer * sp.turn * dt; else c.a += angDiff(c.a, Math.atan2(rf.fy, rf.fx)) * Math.min(1, dt * 0.4) + c.spin * dt;
  c.spin *= Math.exp(-2 * dt);
  const fx = Math.cos(c.a), fy = Math.sin(c.a);
  if (thr && c.driver) { c.vx += fx * sp.acc * thr * (thr < 0 ? 0.6 : 1) * dt; c.vy += fy * sp.acc * thr * (thr < 0 ? 0.6 : 1) * dt; c.paddle = (c.paddle || 0) + dt * 7; }
  const k = Math.min(1, dt * 0.95); c.vx += (rf.fx * cur - c.vx) * k; c.vy += (rf.fy * cur - c.vy) * k;
  c.x += c.vx * dt; c.y += c.vy * dt;
  const r2 = riverFlow(c.x, c.y), lim = -17;
  if (r2.d > lim) { const dx = r2.cx - c.x, dy = r2.cy - c.y, l = hyp(dx, dy) || 1, push = r2.d - lim; c.x += dx / l * push; c.y += dy / l * push; const vn = c.vx * dx / l + c.vy * dy / l; if (vn < 0) { c.vx -= 1.3 * vn * dx / l; c.vy -= 1.3 * vn * dy / l; } }
  if (r2.r === 1 && c.y > FALLS.y - 46) { c.y = FALLS.y - 46; if (c.vy > 0) c.vy = -c.vy * 0.5; if (c === player.car && G.hintT <= 0) hint('Even the salmon struggle to get up there', 2.5); }
  if (c.x > WW - 60) { c.x = WW - 60; if (c.vx > 0) c.vx = 0; if (c === player.car && G.hintT <= 0) hint('Next stop Aberdeen. Paddle to the bank.', 2.5); }
  c.x = Math.max(c.x, 40); c.vf = c.vx * fx + c.vy * fy; c.surf = 'water'; c.brake = false;
  if (onScreen(c.x, c.y, 40) && Math.random() < dt * (thr ? 9 : 3)) part(c.x - fx * 16 + rnd(-6, 6), c.y - fy * 16 + rnd(-6, 6), rnd(-10, 10), rnd(-10, 10), 0.9, 3, '#e8f6ff', 'ring', 14);
}
function updateDinghy(dt) {
  const d = G.dinghy; if (!d) return;
  if (!d.driver && !d.moored && hyp(d.x - DINGHY_SPOT.x, d.y - DINGHY_SPOT.y) > 300 && !onScreen(d.x, d.y, 300)) { G.dnT += dt; if (G.dnT > 40) { d.x = DINGHY_SPOT.x; d.y = DINGHY_SPOT.y; d.a = 0; d.vx = d.vy = 0; d.moored = true; d.dmg = 0; d.dead = false; G.dnT = 0; } } else G.dnT = 0;
}
// ---------- salmon having a go at the Falls of Feugh ----------
function updateSalmon(dt) {
  const f = focusPos();
  if (hyp(f.x - FALLS.x, f.y - FALLS.y) < 1500) { G.salT = (G.salT || 0) - dt; if (G.salT <= 0) { G.salT = rnd(0.7, 3.2); salmon.push({ t: 0, dur: rnd(0.75, 1.05), side: rnd(-0.75, 0.75) * FALLS.hw, fail: Math.random() < 0.45, flip: Math.random() < 0.5 ? 1 : -1 }); } }
  for (let i = salmon.length - 1; i >= 0; i--) {
    const s = salmon[i], t0 = s.t; s.t += dt;
    if (t0 === 0 || s.t >= s.dur) { const k = s.t >= s.dur ? 1 : 0, along = s.fail ? -44 : (k ? 34 : -44), x = FALLS.x - FALLS.fy * s.side - FALLS.fx * along, y = FALLS.y + FALLS.fx * s.side - FALLS.fy * along; if (onScreen(x, y, 40)) { splash(x, y); if (Math.random() < 0.5) AudioFX.plip(vol(x, y)); if (k && s.fail && Math.random() < 0.3) floater(x, y - 8, pick(['So close!', 'Nae luck.', 'Again!']), '#cfeaff'); } }
    if (s.t >= s.dur) salmon.splice(i, 1);
  }
}
