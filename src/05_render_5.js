'use strict';
function toScreen(x, y) { return { x: W / 2 + (x - cam.x) * cam.z, y: H / 2 + (y - cam.y) * cam.z }; }
function drawBubbles() {
  const list = peds.filter(p => p.bub && onScreen(p.x, p.y, 20)); if (player.bub && !player.car) list.push(player);
  ctx.font = '15px ' + FONT; ctx.textAlign = 'center';
  for (const p of list.slice(0, 8)) {
    const s = toScreen(p.x, p.y), w = ctx.measureText(p.bub.text).width + 16, y = s.y - 26 * cam.z - 12;
    ctx.globalAlpha = Math.min(1, p.bub.t * 3); ctx.fillStyle = '#fffdf2'; ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; rr(s.x - w / 2, y - 16, w, 23, 8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.x - 5, y + 6.5); ctx.lineTo(s.x, y + 14); ctx.lineTo(s.x + 5, y + 6.5); ctx.fillStyle = '#fffdf2'; ctx.fill(); ctx.fillStyle = '#141414'; ctx.fillText(p.bub.text, s.x, y + 1);
  }
  ctx.globalAlpha = 1;
  for (const f of floaters) { const s = toScreen(f.x, f.y); ctx.globalAlpha = Math.min(1, f.t * 2); otext(f.text, s.x, s.y - (1.5 - f.t) * 34, 20, f.col, 'center', 4); }
  ctx.globalAlpha = 1;
  // "RING RING" over nearby phones
  if (!G.mission && G.state === 'play') for (const d of MISSIONS) { const ph = d.phone; if (!onScreen(ph.x, ph.y, 0)) continue; const s = toScreen(ph.x, ph.y); if (Math.sin(G.t * 9) > -0.2) otext(G.done[d.id] ? d.title + ' (again?)' : d.title, s.x, s.y - 30 * cam.z - 8, 18, '#ffd21f', 'center', 4); }
}

// ---------- HUD ----------
function drawArrowTo(tx, ty, col) {
  const s = toScreen(tx, ty), m = 70;
  if (s.x > m && s.x < W - m && s.y > m && s.y < H - m) {     // on screen: bouncing chevron above it
    const y = s.y - 46 * cam.z - 20 + Math.sin(G.t * 6) * 6; ctx.fillStyle = col; ctx.strokeStyle = '#141414'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s.x - 13, y - 16); ctx.lineTo(s.x + 13, y - 16); ctx.lineTo(s.x, y + 6); ctx.closePath(); ctx.fill(); ctx.stroke(); return;
  }
  const a = Math.atan2(s.y - H / 2, s.x - W / 2), r = Math.min(W, H) * 0.5 - 64, x = W / 2 + Math.cos(a) * Math.min(r * (W / H > 1 ? 1.25 : 1), W / 2 - 60), y = H / 2 + Math.sin(a) * r;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col; ctx.strokeStyle = '#141414'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-10, -15); ctx.lineTo(-3, 0); ctx.lineTo(-10, 15); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  const d = hyp(tx - player.x, ty - player.y); otext(Math.round(d / 20) + 'm', x - Math.cos(a) * 34, y - Math.sin(a) * 34 + 6, 16, '#fff', 'center', 3);
}
function drawRadar() {
  const rw = Math.round(clamp(W * 0.19, 130, 200)), rh = Math.round(rw * 0.74), rx = 16, ry = H - rh - 16, P = player;
  ctx.save(); rr(rx, ry, rw, rh, 10); ctx.fillStyle = '#16241a'; ctx.fill(); ctx.clip();
  const sx = P.x * MS - rw / 2, sy = P.y * MS - rh / 2; ctx.globalAlpha = 0.95; ctx.drawImage(mapCanvas, -sx + rx, -sy + ry); ctx.globalAlpha = 1;
  const blip = (x, y, col, r, edge) => { let bx = (x - P.x) * MS, by = (y - P.y) * MS; if (edge) { bx = clamp(bx, -rw / 2 + 7, rw / 2 - 7); by = clamp(by, -rh / 2 + 7, rh / 2 - 7); } else if (Math.abs(bx) > rw / 2 || Math.abs(by) > rh / 2) return; ctx.fillStyle = col; ctx.strokeStyle = '#141414'; ctx.lineWidth = 1.5; circ(rx + rw / 2 + bx, ry + rh / 2 + by, r); ctx.fill(); ctx.stroke(); };
  if (!G.mission) for (const d of MISSIONS) blip(d.phone.x, d.phone.y, G.done[d.id] ? '#9fe08a' : '#ffd21f', 5, true);
  blip(SPOTS.respray.x, SPOTS.respray.y, '#7dff8a', 3.5, false);
  for (const c of cars) if (c.type === 'police' && c.ai && c.ai.mode === 'chase') blip(c.x, c.y, Math.sin(G.t * 14) > 0 ? '#5ab4ff' : '#fff', 4, false);
  const tg = targetPos(); if (tg) blip(tg.x, tg.y, '#ff4fa3', 5 + Math.sin(G.t * 6), true);
  ctx.translate(rx + rw / 2, ry + rh / 2); ctx.rotate(P.a); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -5.5); ctx.lineTo(-3, 0); ctx.lineTo(-6, 5.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 4; rr(rx, ry, rw, rh, 10); ctx.stroke(); ctx.strokeStyle = COL.yellow; ctx.lineWidth = 1.5; rr(rx + 2, ry + 2, rw - 4, rh - 4, 8); ctx.stroke();
  return { rw, rh };
}
function drawHUD() {
  const P = player, t = G.t, small = W < 700, u = small ? 0.8 : 1;
  // money, hearts, stars
  otext('£' + Math.round(G.money).toLocaleString('en-GB'), W - 18, 44 * u, 38 * u, COL.yellow, 'right');
  for (let i = 0; i < 5; i++) { heart(W - 30 - (4 - i) * 26 * u, 66 * u, 9 * u); ctx.fillStyle = i < P.hp ? '#ff4d4d' : 'rgba(20,20,20,0.55)'; ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 2.5; ctx.stroke(); }
  if (G.stars > 0 || G.heat > 0.5) for (let i = 0; i < 4; i++) { const on = i < G.stars; ctx.fillStyle = on ? (Math.sin(t * 12 + i) > 0 ? '#5ab4ff' : '#fff') : 'rgba(20,20,20,0.5)'; star(W - 32 - (3 - i) * 28 * u, 98 * u, 12 * u); ctx.strokeStyle = '#141414'; ctx.lineWidth = 2.5; ctx.stroke(); }
  if (G.nickT > 0.12 && G.nickLim) {
    const k = clamp(G.nickT / G.nickLim, 0, 1), bw = 240 * u, bx = W / 2 - bw / 2, by = H * 0.3 + 10;
    otext('Cornered! Keep moving or you are nicked', W / 2, H * 0.3, 23 * u, '#8fb8ff');
    ctx.fillStyle = 'rgba(16,22,18,0.75)'; rr(bx - 3, by - 3, bw + 6, 16, 7); ctx.fill(); ctx.fillStyle = k > 0.7 ? '#ff5a4a' : '#5ab4ff'; rr(bx, by, Math.max(4, bw * k), 10, 4); ctx.fill();
  }
  // pager
  const pg = G.pager;
  if (pg) {
    const pw = Math.min(380, W * 0.46), px = 16, py = 14; ctx.font = 'bold ' + (small ? 12 : 14) + 'px ' + MONO; ctx.textAlign = 'left';
    const lines = wrap(pg.text.slice(0, Math.floor(pg.n)), pw - 34), lh = small ? 15 : 18, ph = Math.max(3, wrap(pg.text, pw - 34).length) * lh + 26;
    ctx.fillStyle = '#23262b'; rr(px, py, pw, ph, 12); ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#a9c078'; rr(px + 8, py + 8, pw - 16, ph - 16, 6); ctx.fill(); ctx.fillStyle = '#1c2a12';
    lines.forEach((l, i) => ctx.fillText(l, px + 17, py + 26 + i * lh));
    if (pg.n >= pg.text.length && Math.sin(t * 8) > 0) ctx.fillRect(px + pw - 26, py + ph - 20, 8, 3);
  }
  const rd = G.state === 'play' && !P.box ? drawRadar() : null;
  if (P.box && G.state === 'play') otext('Nae map. Box.', 18, H - 22, 20, '#e6d3a8', 'left');
  // objective and timer
  if (G.obj) {
    ctx.font = (small ? 17 : 21) + 'px ' + FONT; const lines = wrap(G.obj, Math.min(W - (rd ? rd.rw * 2 + 80 : 60), 640)), lh = small ? 20 : 25, bh = lines.length * lh + 14, bw = Math.max.apply(null, lines.map(l => ctx.measureText(l).width)) + 34, by = H - bh - 18;
    ctx.fillStyle = 'rgba(16,22,18,0.78)'; rr(W / 2 - bw / 2, by, bw, bh, 12); ctx.fill(); ctx.strokeStyle = '#ff4fa3'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; lines.forEach((l, i) => ctx.fillText(l, W / 2, by + lh * (i + 1) - 1));
    if (G.timer !== null) { const s = Math.ceil(G.timer), low = s <= 10; otext(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'), W / 2, by - 14, (low ? 52 + Math.sin(t * 12) * 4 : 46) * u, low ? '#ff5a4a' : '#fff'); }
    if (P.pax) otext('Lads aboard: ' + P.pax, W / 2, by - (G.timer !== null ? 66 * u : 14), 20, '#ffb3d6');
  }
  if (G.hintT > 0 && G.hint) { ctx.globalAlpha = Math.min(1, G.hintT * 3); otext(G.hint, W / 2, H * 0.68, 24 * u, '#fff'); ctx.globalAlpha = 1; }
  if (G.vehT > 0) {
    ctx.globalAlpha = Math.min(1, G.vehT * 2); otext(G.vehName, W / 2, H * 0.6, 30 * u, '#9fe8ff');
    const c = P.car;
    if (c && !c.sp.boat) {
      const sp = c.sp, st = [['Speed', (sp.max - 130) / 70], ['Pick-up', sp.acc / 88], ['Turning', (sp.turn - 1.1) / 0.58], ['Grip', sp.grip / 2.1]], cw = 118 * u, x0 = W / 2 - cw * 2 + 6 * u, y = H * 0.6 + 28 * u;
      st.forEach((q, i) => { const n = clamp(Math.round(q[1]), 1, 5), x = x0 + i * cw; otext(q[0], x + 44 * u, y + 5 * u, 15 * u, '#f4efe0', 'right', 3); for (let j = 0; j < 5; j++) { ctx.fillStyle = j < n ? '#ffd21f' : 'rgba(20,20,20,0.6)'; ctx.strokeStyle = '#141414'; ctx.lineWidth = 1.5; circ(x + 54 * u + j * 11 * u, y, 4 * u); ctx.fill(); ctx.stroke(); } });
    }
    ctx.globalAlpha = 1;
  }
  if (G.zoneT > 0) { ctx.globalAlpha = Math.min(1, G.zoneT * 1.5, (4 - G.zoneT) * 3); otext(G.zone, W - 18, H - 22, 28 * u, '#f4efe0', 'right'); ctx.globalAlpha = 1; }
  const Wp = WEAPONS[P.weapon], wl = Wp.name + (Wp.per ? '  x' + P.ammo[P.weapon] : '');
  ctx.font = 19 * u + 'px ' + FONT; { const tw0 = ctx.measureText(wl).width; ctx.fillStyle = 'rgba(16,22,18,0.62)'; rr(W - 18 - tw0 - 46 * u, 114 * u, tw0 + 54 * u, 28 * u, 10); ctx.fill(); }
  otext(wl, W - 18, 134 * u, 19 * u, P.car ? 'rgba(244,239,224,0.55)' : '#f4efe0', 'right', 3.5); { const tw = ctx.measureText(wl).width; ctx.save(); ctx.translate(W - 18 - tw - 24 * u, 128 * u); ctx.scale(1.5 * u, 1.5 * u); drawWeaponIcon(P.weapon); ctx.restore(); }
  if (P.car && P.car.sp.nitro) {
    const c = P.car, bw = 130 * u, bx = W - 18 - bw, by = 146 * u; ctx.fillStyle = 'rgba(20,20,20,0.7)'; rr(bx - 3, by - 3, bw + 6, 16 * u + 6, 6); ctx.fill();
    ctx.fillStyle = c.nlock ? (Math.sin(t * 12) > 0 ? '#777' : '#555') : c.boost ? '#5ad1ff' : '#ff4fa3'; rr(bx, by, Math.max(4, bw * c.nitro), 16 * u, 4); ctx.fill(); otext(c.nlock ? 'RECHARGING' : 'NITRO  (SHIFT)', bx + bw / 2, by + 13 * u, 13 * u, '#fff', 'center', 3);
  }
  if (G.muted) otext('Sound off (N)', W - 18, (P.car && P.car.sp.nitro ? 190 : 160) * u, 16, '#ddd', 'right', 3);
  // mission arrow
  const tg = targetPos(); if (tg && G.state === 'play' && !P.box) drawArrowTo(tg.x, tg.y, '#ff4fa3');
  // big banner
  const b = G.big;
  if (b) {
    const k = clamp((b.t0 - b.t) * 5, 0, 1), fade = clamp(b.t * 2.5, 0, 1), size = Math.min(W / (b.text.length * 0.5 + 2), 120) * (0.6 + 0.4 * k + Math.max(0, 0.15 - (b.t0 - b.t)) * 2);
    ctx.globalAlpha = fade; ctx.save(); ctx.translate(W / 2, H * 0.4); ctx.rotate(-0.045);
    ctx.font = size + 'px ' + FONT; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.fillStyle = '#b3261e'; ctx.fillText(b.text, 5, 6); otext(b.text, 0, 0, size, b.col, 'center', size * 0.13);
    ctx.restore(); if (b.sub) otext(b.sub, W / 2, H * 0.4 + size * 0.5 + 18, clamp(W / 34, 16, 26), '#fff'); ctx.globalAlpha = 1;
  }
}
