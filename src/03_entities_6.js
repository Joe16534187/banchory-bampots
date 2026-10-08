'use strict';
// ---------- what the polis throw at you as the stars go up ----------
// Slapstick rules still apply: baton rounds knock you on your backside, shells send motors spinning. Nobody dies.
function copFire(c, dt, d, st) {
  const P = player.car || player;
  if (c.sp.tank) c.turret += angDiff(c.turret, Math.atan2(P.y - c.y, P.x - c.x)) * Math.min(1, dt * 2.2);
  if (c.fireT > 0) { c.fireT -= dt; return; }
  if (st < 2 || c.dead || c.ai.stun > 0 || player.inv > 0.5) return;
  if (c.sp.tank) {
    if (d < 170 || d > 900 || !onScreen(c.x, c.y, 320)) return;
    if (Math.abs(angDiff(c.turret, Math.atan2(P.y - c.y, P.x - c.x))) > 0.3) return;
    fireShell(c, P.x + (P.vx || 0) * 0.9 + rnd(-45, 45), P.y + (P.vy || 0) * 0.9 + rnd(-45, 45), true); c.fireT = rnd(2.8, 3.8); return;
  }
  if (d > 380 || d < 40) return;
  let cd = 0;
  if (c.type === 'jeep') cd = rnd(0.7, 1.1); else if (st >= 4) cd = rnd(1.2, 1.8); else if (st === 3) cd = rnd(1.6, 2.3); else if (c.type === 'polvan') cd = rnd(2.8, 3.8);
  if (!cd) return;                                       // at two stars only the riot van is armed
  fireBaton(c.x, c.y, 0.09, false); c.fireT = cd;
}
function fireBaton(sx, sy, spread, air) {
  const P = player.car || player, sp = 540, d = hyp(P.x - sx, P.y - sy), tt = d / sp * 0.7;
  const a = Math.atan2(P.y + (P.vy || 0) * tt - sy, P.x + (P.vx || 0) * tt - sx) + rnd(-spread, spread);
  copShots.push({ type: 'baton', x: sx, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: air ? d / sp + 0.3 : 1.0, air: !!air, t: 0 });
  if (onScreen(sx, sy, 120)) AudioFX.thud(vol(sx, sy));
}
function fireShell(c, tx, ty, cops) {
  const fx = Math.cos(c.turret), fy = Math.sin(c.turret), mx = c.x + fx * 44, my = c.y + fy * 44, d = hyp(tx - mx, ty - my);
  copShots.push({ type: 'shell', x0: mx, y0: my, tx, ty, t: 0, dur: clamp(d / 560, 0.85, 1.7), cops: !!cops });
  c.vx -= fx * 45; c.vy -= fy * 45;                      // recoil
  puff(mx, my, 7, '#e8e4d8', 70, 7, 0.7); sparks(mx, my, 6);
  if (onScreen(mx, my, 200)) { AudioFX.boom(0.45 * Math.max(0.3, vol(mx, my))); G.shake = Math.max(G.shake, c === player.car ? 9 : 4); }
}
function updateCopShots(dt) {
  const P = player, pc = P.car;
  for (let i = copShots.length - 1; i >= 0; i--) {
    const s = copShots[i]; let dead = false; s.t += dt;
    if (s.type === 'shell') {
      if (s.t >= s.dur) { if (surfaceAt(s.tx, s.ty) === 'water') { splash(s.tx, s.ty, true); AudioFX.splash(); } else explode(s.tx, s.ty, 120, 380, 60, 'shell', s.cops); dead = true; }
    } else {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (!s.air) { queryGrid(GRID, s.x, s.y, 6, _cols); for (const col of _cols) if (resolveCircle(s.x, s.y, 3, col)) { dead = true; puff(s.x, s.y, 2, '#d8d2c0', 40, 3, 0.4, 2); break; } }
      if (!dead && pc && !pc.sink) {
        if (Math.abs(pc.x - s.x) < 70 && Math.abs(pc.y - s.y) < 70) { const fx = Math.cos(pc.a), fy = Math.sin(pc.a); for (const o of pc.sp.offs) if (hyp(s.x - (pc.x + fx * o), s.y - (pc.y + fy * o)) < pc.sp.r + 4) { dead = true; break; } }
        if (dead) { if (!pc.dead && !pc.sp.tank && !pc.sp.boat) { pc.dmg += 4; if (pc.dmg >= 100) killCar(pc); } sparks(s.x, s.y, 4); AudioFX.clatter(0.6); G.shake = Math.max(G.shake, 3); }
      } else if (!dead && !pc && P.knock <= 0 && P.inv <= 0 && hyp(P.x - s.x, P.y - s.y) < 11) { knockPlayer(s.vx * 0.3, s.vy * 0.3); floater(P.x, P.y - 34, pick(['THWOCK!', 'DUNT!', 'OOF!']), '#ffe680'); dead = true; }
      if (s.life <= 0) dead = true;
    }
    if (dead) copShots.splice(i, 1);
  }
}

// ---------- the polis helicopter (three stars and up) ----------
// It keeps you in sight wherever you drive, so the heat never cools. Trees hide you from it. Tatties and rockets see it off.
function underTrees(x, y) {
  queryGrid(GRID, x, y, 60, _cols);
  for (const col of _cols) if (col.tree && hyp(col.tree.x - x, col.tree.y - y) < col.tree.r + 4) return true;
  return false;
}
function heliAt(x, y, r) { for (const h of helis) if (!h.leave && hyp(h.x - x, h.y - y) < r) return h; return null; }
function hitHeli(h, n) {
  h.hp -= n; sparks(h.x, h.y, 6); addHeat(0.25); if (onScreen(h.x, h.y, 80)) AudioFX.clatter(0.7);
  if (h.hp <= 0 && !h.leave) {
    h.leave = true; h.smoke = true; h.la = rnd(TAU); G.heliT = 45;
    floater(h.x, h.y - 30, 'Mayday! Mayday!', '#fff'); addMoney(150, h.x, h.y); hint('The helicopter is away hame for repairs', 3.5); puff(h.x, h.y, 10, '#3a3a3a', 80, 9, 1.2);
  }
}
function updateHelis(dt, st) {
  const P = player.car || player; G.heliNear = false;
  if (G.heliT > 0) G.heliT -= dt;
  if (st >= 3 && !helis.length && !(G.heliT > 0)) {
    const a = rnd(TAU);
    helis.push({ x: P.x + Math.cos(a) * 1500, y: P.y + Math.sin(a) * 1500, vx: 0, vy: 0, a: a + Math.PI, rot: 0, hp: 8, fireT: 2.5, lx: P.x, ly: P.y, leave: false, smoke: false, la: 0, ph: rnd(TAU), smT: 0 });
    if (!G.heliMsg) { G.heliMsg = true; pagerMsg("That's the polis helicopter up. It can follow you anywhere, but it cannae see through trees. Hide in the woods, or shoot back with tatties or a rocket."); }
  }
  if (!helis.length) { G.hidden = false; return; }
  G.hidT = (G.hidT || 0) - dt; if (G.hidT <= 0) { G.hidT = 0.2; G.hidden = underTrees(P.x, P.y); }
  const hid = G.hidden;
  for (let i = helis.length - 1; i >= 0; i--) {
    const h = helis[i]; h.rot += dt * 27;
    if (st < 3 && !h.leave) { h.leave = true; h.la = Math.atan2(h.y - P.y, h.x - P.x); }                 // the heat is off: away hame
    let tx, ty;
    if (h.leave) { tx = h.x + Math.cos(h.la) * 600; ty = h.y + Math.sin(h.la) * 600; }
    else if (hid) { const an = G.t * 0.7 + h.ph; tx = h.lx + Math.cos(an) * 200; ty = h.ly + Math.sin(an) * 150; }   // lost you: circling where it last saw you
    else { const an = G.t * 0.5 + h.ph; tx = P.x + (P.vx || 0) * 0.6 + Math.cos(an) * 150; ty = P.y + (P.vy || 0) * 0.6 + Math.sin(an) * 110; }
    const dx = tx - h.x, dy = ty - h.y, d = hyp(dx, dy) || 1, want = Math.min(h.leave ? 360 : 470, d * 2.2);
    h.vx += (dx / d * want - h.vx) * Math.min(1, dt * 1.8); h.vy += (dy / d * want - h.vy) * Math.min(1, dt * 1.8);
    h.x += h.vx * dt; h.y += h.vy * dt;
    const pd = hyp(P.x - h.x, P.y - h.y), face = hyp(h.vx, h.vy) > 60 || h.leave ? Math.atan2(h.vy, h.vx) : Math.atan2(P.y - h.y, P.x - h.x);
    h.a += angDiff(h.a, face) * Math.min(1, dt * 3);
    if (h.smoke) { h.smT -= dt; if (h.smT <= 0) { h.smT = 0.06; part(h.x + rnd(-8, 8), h.y + rnd(-8, 8), rnd(-20, 20), rnd(-20, 20), 1.2, 6, '#2e2e2e', 'smoke', 18); } h.a += dt * 2.5; }
    if (h.leave) { if (pd > 1900) helis.splice(i, 1); continue; }
    if (!hid) { h.lx += (P.x - h.lx) * Math.min(1, dt * 5); h.ly += (P.y - h.ly) * Math.min(1, dt * 5); if (pd < 650) G.heliNear = true; }
    else { h.lx += Math.cos(G.t * 1.1 + h.ph) * 60 * dt; h.ly += Math.sin(G.t * 1.4 + h.ph) * 60 * dt; }             // the searchlight hunts about
    h.fireT -= dt;
    if (h.fireT <= 0 && pd < 430 && !hid && player.inv <= 0.5 && G.state === 'play') { fireBaton(h.x, h.y, 0.07, true); h.fireT = st >= 4 ? rnd(0.9, 1.3) : rnd(1.5, 2.1); }
  }
}
