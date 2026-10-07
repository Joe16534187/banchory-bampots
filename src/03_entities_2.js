'use strict';
function collideCars(list) {
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j]; if (a.sink || b.sink || a.sp.boat || b.sp.boat) continue;
    const R = (a.sp.len + b.sp.len) / 2 + 4, ddx = a.x - b.x, ddy = a.y - b.y; if (Math.abs(ddx) > R || Math.abs(ddy) > R) continue;
    if (!a.driver && !b.driver && a.vx === 0 && b.vx === 0 && a.vy === 0 && b.vy === 0) continue;
    const afx = Math.cos(a.a), afy = Math.sin(a.a), bfx = Math.cos(b.a), bfy = Math.sin(b.a);
    let best = 0, nx = 0, ny = 0, oa = 0, ob = 0, px = 0, py = 0;
    for (const o1 of a.sp.offs) for (const o2 of b.sp.offs) {
      const ax = a.x + afx * o1, ay = a.y + afy * o1, bx = b.x + bfx * o2, by = b.y + bfy * o2, dx = ax - bx, dy = ay - by, d = hyp(dx, dy), pen = a.sp.r + b.sp.r - d;
      if (pen > best && d > 0.001) { best = pen; nx = dx / d; ny = dy / d; oa = o1; ob = o2; px = (ax + bx) / 2; py = (ay + by) / 2; }
    }
    if (best <= 0) continue;
    const ma = a.sp.mass, mb = b.sp.mass, tot = ma + mb;
    a.x += nx * best * mb / tot; a.y += ny * best * mb / tot; b.x -= nx * best * ma / tot; b.y -= ny * best * ma / tot;
    const rvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (rvn < 0) {
      const jn = -1.3 * rvn / (1 / ma + 1 / mb), imp = -rvn;
      a.vx += jn / ma * nx; a.vy += jn / ma * ny; b.vx -= jn / mb * nx; b.vy -= jn / mb * ny;
      a.spin = clamp(a.spin + ((afx * oa) * ny - (afy * oa) * nx) * imp * 0.0012 * mb / tot, -4, 4);
      b.spin = clamp(b.spin - ((bfx * ob) * ny - (bfy * ob) * nx) * imp * 0.0012 * ma / tot, -4, 4);
      if (imp > 60) {
        const pc = a === player.car ? a : b === player.car ? b : null, other = pc === a ? b : a;
        if (pc && pc.hitCd <= 0) {
          if (other.type === 'police') addHeat(0.8); else if (other.driver === 'ai') addHeat(0.22); else addHeat(0.04);
          if (other.ai) { other.ai.stun = rnd(0.5, 1.2); other.horn = 0.8; if (Math.random() < 0.5) floater(other.x, other.y - 24, pick(['HONK!', 'BEEP!', 'Oi!', 'Ya bampot!']), '#fff'); }
        }
        carImpact(a, imp * 2 * mb / tot, px, py); carImpact(b, imp * 2 * ma / tot, px, py);
      }
    }
  }
}

// ---------- traffic AI ----------
function aheadBlocked(c) {
  const fx = Math.cos(c.a), fy = Math.sin(c.a), look = c.sp.len / 2 + 24 + Math.abs(c.vf) * 0.42, hw = c.sp.w / 2;
  for (const o of cars) {
    if (o === c || o.sink || o.sp.boat) continue; const dx = o.x - c.x, dy = o.y - c.y; if (Math.abs(dx) > 280 || Math.abs(dy) > 280) continue;
    const lx = dx * fx + dy * fy, ly = -dx * fy + dy * fx, rel = Math.abs(Math.cos(o.a - c.a)), eF = lerp(o.sp.w / 2, o.sp.len / 2, rel), eL = lerp(o.sp.len / 2, o.sp.w / 2, rel);
    if (lx > 0 && lx < look + eF && Math.abs(ly) < hw + eL + 2) return o;
  }
  for (const p of peds) { if (p.state === 'fly') continue; const dx = p.x - c.x, dy = p.y - c.y; if (Math.abs(dx) > 200 || Math.abs(dy) > 200) continue; const lx = dx * fx + dy * fy, ly = -dx * fy + dy * fx; if (lx > 0 && lx < look + 26 && Math.abs(ly) < hw + 17) return p; }
  if (!player.car && G.state !== 'title') { const dx = player.x - c.x, dy = player.y - c.y, lx = dx * fx + dy * fy, ly = -dx * fy + dy * fx; if (lx > 0 && lx < look + 8 && Math.abs(ly) < hw + 9) return player; }
  return null;
}
function aiStart(c, e, dir) { c.ai = { mode: 'traffic', e, dir, spd: rnd(0.82, 1.05), wait: 0, stun: 0, push: 0, blk: null, stuck: 0, rev: 0, revSteer: 0, node: null, hornCd: 0 }; c.driver = 'ai'; }
function aiNearestEdge(c) {
  let best = null, bd = 1e9, bdir = 1;
  for (const e of EDGES) { if (!e.traffic) continue; const dx = c.x - e.a.x, dy = c.y - e.a.y; let t = clamp(dx * e.ux + dy * e.uy, 0, e.len); const d = hyp(dx - e.ux * t, dy - e.uy * t); if (d < bd) { bd = d; best = e; bdir = Math.cos(c.a) * e.ux + Math.sin(c.a) * e.uy >= 0 ? 1 : -1; } }
  return [best, bdir];
}
const _ctl = { thr: 0, steer: 0, hb: false };
function aiControl(c, dt) {
  const ai = c.ai; _ctl.thr = 0; _ctl.steer = 0; _ctl.hb = false;
  if (ai.hornCd > 0) ai.hornCd -= dt;
  if (ai.stun > 0) { ai.stun -= dt; _ctl.hb = true; return _ctl; }
  if (ai.rev > 0) { ai.rev -= dt; _ctl.thr = -1; _ctl.steer = ai.revSteer; return _ctl; }
  if (ai.mode === 'chase') return chaseControl(c, dt);
  let e = ai.e, A = ai.dir > 0 ? e.a : e.b, Bn = ai.dir > 0 ? e.b : e.a, ux = e.ux * ai.dir, uy = e.uy * ai.dir;
  let t = (c.x - A.x) * ux + (c.y - A.y) * uy;
  if (t > e.len - (Bn.exit ? -40 : 44)) {
    if (Bn.exit) { c.gone = true; return _ctl; }
    const opts = Bn.edges.filter(x => x !== e && x.traffic), ne = opts.length ? pick(opts) : e;
    ai.dir = ne === e ? -ai.dir : (ne.a === Bn ? 1 : -1); ai.e = e = ne;
    A = ai.dir > 0 ? e.a : e.b; Bn = ai.dir > 0 ? e.b : e.a; ux = e.ux * ai.dir; uy = e.uy * ai.dir; t = (c.x - A.x) * ux + (c.y - A.y) * uy;
  }
  const look = Math.min(Math.max(t, 0) + 58 + Math.abs(c.vf) * 0.22, e.len + 30), lo = e.hw * 0.5;
  const tx = A.x + ux * look + uy * lo, ty = A.y + uy * look - ux * lo, d = angDiff(c.a, Math.atan2(ty - c.y, tx - c.x));
  _ctl.steer = clamp(d * 2.4, -1, 1);
  let target = Math.min(e.speed * ai.spd, c.sp.max * 0.82);
  if (e.len - t < 170 && !Bn.exit && Bn.edges.length > 2) target = Math.min(target, 125);
  if (Math.abs(d) > 0.45) target = Math.min(target, 95);
  const blk = aheadBlocked(c); ai.blk = blk;
  if (blk && !(blk.ai && blk.ai.blk === c && c.id > blk.id) && ai.push <= 0) {
    target = 0; ai.wait += dt;
    if (ai.wait > 2.5 && ai.hornCd <= 0 && onScreen(c.x, c.y)) { c.horn = 0.5; ai.hornCd = rnd(3, 6); }
    if (ai.wait > 7) { ai.push = 1.6; ai.wait = 0; }
  } else ai.wait = Math.max(0, ai.wait - dt * 2);
  if (ai.push > 0) { ai.push -= dt; target = Math.min(target || 70, 70); }
  const vf = c.vf;
  if (vf < target - 8) _ctl.thr = 0.85; else if (vf > target + 22) _ctl.thr = -1;
  if (target === 0 && vf < 6) { _ctl.thr = 0; _ctl.hb = true; }
  if (target > 0 && Math.abs(vf) < 8) { ai.stuck += dt; if (ai.stuck > 2.5) { ai.rev = 0.9; ai.revSteer = d > 0 ? -1 : 1; ai.stuck = 0; } } else ai.stuck = 0;
  return _ctl;
}
function chaseControl(c, dt) {
  const ai = c.ai, P = player.car || player, dx = P.x - c.x, dy = P.y - c.y, dist = hyp(dx, dy);
  let tx, ty;
  const pn = G.playerNode || nearestNode(P.x, P.y);
  if (dist < 460 || ai.node === pn && hyp(pn.x - c.x, pn.y - c.y) < 90) { tx = P.x + (P.vx || 0) * 0.3; ty = P.y + (P.vy || 0) * 0.3; ai.node = null; }
  else {
    if (!ai.node) { let bn = null, bd = 1e9; for (const n of NODE_LIST) { const d0 = hyp(n.x - c.x, n.y - c.y); if (d0 > 700) continue; const d = d0 + DIST[n.idx][pn.idx]; if (d < bd) { bd = d; bn = n; } } ai.node = bn || nearestNode(c.x, c.y); }
    if (hyp(ai.node.x - c.x, ai.node.y - c.y) < 80 && ai.node !== pn) ai.node = NEXT[ai.node.idx][pn.idx] || pn;
    tx = ai.node.x; ty = ai.node.y;
  }
  const d = angDiff(c.a, Math.atan2(ty - c.y, tx - c.x));
  _ctl.steer = clamp(d * 2.6, -1, 1); _ctl.thr = 1;
  if (Math.abs(d) > 0.9 && c.vf > 160) _ctl.thr = -0.6;
  if (Math.abs(d) > 1.5 && c.vf > 120) _ctl.hb = true;
  const halt = !player.car && dist < 95;
  if (halt) { _ctl.thr = c.vf > 25 ? -1 : 0; _ctl.hb = c.vf < 40; }
  else if (Math.abs(c.vf) < 16) { ai.stuck += dt; if (ai.stuck > 1.0) { ai.rev = 0.8; ai.revSteer = d > 0 ? -1 : 1; ai.stuck = 0; ai.node = null; } } else ai.stuck = 0;
  return _ctl;
}
const TRAFFIC_MIX = { hatch: 26, saloon: 20, banger: 9, van: 10, fourby: 9, pickup: 8, racer: 5, sport: 4, tractor: 5, bus: 3, police: 4 };
function spawnTraffic() {
  const f = focusPos(); let n = 0;
  for (const c of cars) if (c.ai && c.ai.mode === 'traffic' && hyp(c.x - f.x, c.y - f.y) < 1900) n++;
  if (n >= 12) return;
  for (let tries = 0; tries < 6; tries++) {
    const e = pick(EDGES); if (!e.traffic) continue;
    const t = rnd(30, e.len - 30), dir = Math.random() < 0.5 ? 1 : -1, ux = e.ux * dir, uy = e.uy * dir, lo = e.hw * 0.5;
    const x = e.a.x + e.ux * t + uy * lo, y = e.a.y + e.uy * t - ux * lo, d = hyp(x - f.x, y - f.y);
    if (d > 1800 || onScreen(x, y, 140) || x < 0 || y < 0 || x > WW || y > WH) continue;
    let clear = true; for (const o of cars) if (hyp(o.x - x, o.y - y) < 150) { clear = false; break; }
    if (!clear) continue;
    const c = makeCar(wpick(TRAFFIC_MIX), x, y, Math.atan2(uy, ux)); aiStart(c, e, dir); c.vx = ux * e.speed * 0.6; c.vy = uy * e.speed * 0.6; return;
  }
}
function spawnPolice() {
  const P = player.car || player, pn = G.playerNode || nearestNode(P.x, P.y); let best = null, bs = 1e9;
  for (const n of NODE_LIST) { if (n.exit || onScreen(n.x, n.y, 160)) continue; const d = DIST[n.idx][pn.idx]; if (d < 500) continue; const s = Math.abs(d - 1100) + rnd(300); if (s < bs) { bs = s; best = n; } }
  if (!best) return;
  const nx = NEXT[best.idx][pn.idx] || pn, c = makeCar('police', best.x, best.y, Math.atan2(nx.y - best.y, nx.x - best.x));
  aiStart(c, best.edges[0], 1); c.ai.mode = 'chase'; c.ai.node = nx; c.siren = true;
}
function updatePolice(dt) {
  const P = player.car || player;
  G.stars = Math.floor(G.heat);
  let chasers = 0, near = false, close = false;
  for (const c of cars) {
    if (c.type !== 'police' || !c.ai) continue;
    const d = hyp(c.x - P.x, c.y - P.y);
    if (G.stars > 0) {
      if (c.ai.mode !== 'chase' && d < 800) { c.ai.mode = 'chase'; c.ai.node = null; c.siren = true; }
      if (c.ai.mode === 'chase') { chasers++; if (d < 520) near = true; if (d < 130) close = true; }
    } else if (c.ai.mode === 'chase') { const r = aiNearestEdge(c); c.ai.mode = 'traffic'; c.ai.e = r[0]; c.ai.dir = r[1]; c.siren = false; }
  }
  if (G.stars > 0) {
    G.polT -= dt; if (chasers < G.stars && G.polT <= 0) { spawnPolice(); G.polT = 2.5; }
    if (near) G.unseenT = 0; else G.unseenT += dt;
    if (G.unseenT > 5) { G.heat -= dt * 0.16; if (G.heat < 1) { G.heat = 0; hint("You've shaken the polis", 3); } }
    const still = player.car ? Math.abs(player.car.vf) < 30 && !player.car.sp.boat : (hyp(player.vx, player.vy) < 24 || player.knock > 0);
    G.nickLim = player.car ? 2.6 : 2.2;
    if (close && still) G.nickT += dt * (player.knock > 0 ? 0.4 : 1); else G.nickT = Math.max(0, G.nickT - dt * (close ? 1.2 : 3));
    if (G.nickT > G.nickLim) nicked();
  } else { G.nickT = 0; if (G.heat > 0) G.heat = Math.max(0, G.heat - dt * 0.03); }
}

