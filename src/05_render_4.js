'use strict';
// ---------- tall things: buildings and trees lean away from the camera ----------
const _vb = [];
function drawBuilding(b) {
  const k = 1 + b.ht * 0.05, cx = cam.x, cy = cam.y, x0 = b.x, y0 = b.y, x1 = b.x + b.w, y1 = b.y + b.h;
  const rx0 = cx + (x0 - cx) * k, ry0 = cy + (y0 - cy) * k, rx1 = cx + (x1 - cx) * k, ry1 = cy + (y1 - cy) * k;
  if (b.awn) {
    ctx.fillStyle = b.awnCol;
    if (b.awn === 'S') ctx.fillRect(x0 + 6, y1, b.w - 12, 9); else if (b.awn === 'N') ctx.fillRect(x0 + 6, y0 - 9, b.w - 12, 9); else if (b.awn === 'E') ctx.fillRect(x1, y0 + 6, 9, b.h - 12); else ctx.fillRect(x0 - 9, y0 + 6, 9, b.h - 12);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    if (b.awn === 'S' || b.awn === 'N') { const yy = b.awn === 'S' ? y1 : y0 - 9; for (let x = x0 + 12; x < x1 - 12; x += 16) ctx.fillRect(x, yy, 8, 9); } else { const xx = b.awn === 'E' ? x1 : x0 - 9; for (let y = y0 + 12; y < y1 - 12; y += 16) ctx.fillRect(xx, y, 9, 8); }
  }
  const wall = (ax, ay, bx, by, cx2, cy2, dx, dy, f) => { ctx.fillStyle = shade(b.wall, f); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.lineTo(dx, dy); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(30,40,60,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([7, 7]); ctx.beginPath(); ctx.moveTo((ax + dx) / 2, (ay + dy) / 2); ctx.lineTo((bx + cx2) / 2, (by + cy2) / 2); ctx.stroke(); ctx.setLineDash([]); };
  if (cy > y1) wall(x0, y1, x1, y1, rx1, ry1, rx0, ry1, 0.86);
  if (cy < y0) wall(x0, y0, x1, y0, rx1, ry0, rx0, ry0, 0.7);
  if (cx > x1) wall(x1, y0, x1, y1, rx1, ry1, rx1, ry0, 0.78);
  if (cx < x0) wall(x0, y0, x0, y1, rx0, ry1, rx0, ry0, 0.92);
  const rw = rx1 - rx0, rh = ry1 - ry0;
  ctx.fillStyle = b.roof; ctx.fillRect(rx0, ry0, rw, rh);
  if (b.style === 'pitch') {
    if (b.w >= b.h) { ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(rx0, ry0, rw, rh / 2); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx0, ry0 + rh / 2); ctx.lineTo(rx1, ry0 + rh / 2); ctx.stroke(); }
    else { ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(rx0, ry0, rw / 2, rh); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx0 + rw / 2, ry0); ctx.lineTo(rx0 + rw / 2, ry1); ctx.stroke(); }
    if (b.chim || !b.house) { ctx.fillStyle = '#8a7f76'; if (b.w >= b.h) { ctx.fillRect(rx0 + rw * 0.14, ry0 + rh / 2 - 5, 9, 10); if (!b.house) ctx.fillRect(rx0 + rw * 0.8, ry0 + rh / 2 - 5, 9, 10); } else ctx.fillRect(rx0 + rw / 2 - 5, ry0 + rh * 0.16, 10, 9); }
  } else if (b.style === 'flat') {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.strokeRect(rx0 + 4, ry0 + 4, rw - 8, rh - 8); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(rx0 + rw * 0.7, ry0 + rh * 0.2, 16, 12);
  } else if (b.style === 'spire') {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(rx0, ry0); ctx.lineTo(rx0 + rw / 2, ry0 + rh / 2); ctx.lineTo(rx0, ry1); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.moveTo(rx1, ry0); ctx.lineTo(rx0 + rw / 2, ry0 + rh / 2); ctx.lineTo(rx1, ry1); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(rx0, ry0); ctx.lineTo(rx1, ry1); ctx.moveTo(rx1, ry0); ctx.lineTo(rx0, ry1); ctx.stroke(); ctx.fillStyle = '#e8c74a'; circ(rx0 + rw / 2, ry0 + rh / 2, 3); ctx.fill();
  } else if (b.style === 'tower') {
    ctx.strokeStyle = '#5f5a53'; ctx.lineWidth = 6; ctx.strokeRect(rx0 + 3, ry0 + 3, rw - 6, rh - 6); ctx.fillStyle = '#6d675f'; ctx.fillRect(rx0 + rw / 2 - 5, ry0 + rh / 2 - 5, 10, 10);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(rx0, ry0, rw, rh);
  if (b.label) {
    const lines = b.label.split('|'), longest = Math.max.apply(null, lines.map(l => l.length)), size = clamp(Math.min(rw * 1.75 / longest, rh * 0.42 / lines.length), 10, 24);
    ctx.font = size + 'px ' + FONT; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    lines.forEach((l, i) => { const ty = ry0 + rh / 2 + size * 0.36 + (i - (lines.length - 1) / 2) * size * 1.05; ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(20,20,20,0.85)'; ctx.strokeText(l, rx0 + rw / 2, ty); ctx.fillStyle = b.lm ? '#ffe45c' : '#f4efe0'; ctx.fillText(l, rx0 + rw / 2, ty); });
  }
}
function drawTall() {
  _vb.length = 0; ctx.setLineDash([]); ctx.lineDashOffset = 0;
  const m = 140;
  for (const b of BUILDINGS) if (b.x < cam.x1 + m && b.x + b.w > cam.x0 - m && b.y < cam.y1 + m && b.y + b.h > cam.y0 - m) { b._d = Math.abs(b.x + b.w / 2 - cam.x) + Math.abs(b.y + b.h / 2 - cam.y); _vb.push(b); }
  _vb.sort((a, b) => b._d - a._d);
  for (const b of _vb) drawBuilding(b);
  const P = player.car || player, t = G.t;
  for (const tr of TREES) {
    if (tr.x < cam.x0 - 70 || tr.x > cam.x1 + 70 || tr.y < cam.y0 - 70 || tr.y > cam.y1 + 70) continue;
    const k = 1 + tr.h * 0.022, sw = Math.sin(t * 1.3 + tr.ph) * 1.5, x = cam.x + (tr.x - cam.x) * k + sw, y = cam.y + (tr.y - cam.y) * k;
    const nearP = Math.abs(tr.x - P.x) < 70 && Math.abs(tr.y - P.y) < 70;
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; circ(tr.x + 5, tr.y + 7, tr.r * 0.9); ctx.fill();
    ctx.globalAlpha = nearP ? 0.4 : 0.93; ctx.fillStyle = tr.col;
    if (tr.kind === 'con') { ctx.beginPath(); for (let i = 0; i < 14; i++) { const an = i * TAU / 14 + tr.ph, r2 = i % 2 ? tr.r * 0.66 : tr.r; ctx.lineTo(x + Math.cos(an) * r2, y + Math.sin(an) * r2); } ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.10)'; circ(x - tr.r * 0.15, y - tr.r * 0.15, tr.r * 0.4); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; circ(x, y, 2.5); ctx.fill(); }
    else { circ(x, y, tr.r); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.13)'; circ(x - tr.r * 0.25, y - tr.r * 0.28, tr.r * 0.55); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.10)'; circ(x + tr.r * 0.3, y + tr.r * 0.3, tr.r * 0.4); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}

// ---------- the world, in order ----------
function drawWorld() {
  const t = G.t;
  drawGround(); drawDecals();
  for (const p of PROPS) if (p.x > cam.x0 - 30 && p.x < cam.x1 + 30 && p.y > cam.y0 - 30 && p.y < cam.y1 + 30) drawProp(p);
  // phones that are ringing
  if (!G.mission && G.state !== 'title') for (const d of MISSIONS) { const ph = d.phone; if (!onScreen(ph.x, ph.y, 60)) continue; const k = (t * 1.6) % 1; ctx.strokeStyle = 'rgba(255,210,31,' + (1 - k) + ')'; ctx.lineWidth = 4; circ(ph.x, ph.y, 14 + k * 34); ctx.stroke(); }
  for (const p of pickups) {
    if (p.gone || !onScreen(p.x, p.y, 30)) continue;
    const bob = Math.sin(t * 4 + p.x) * 2;
    if (p.type === 'weapon') { ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + 0.1 * Math.sin(t * 5)) + ')'; circ(p.x, p.y, 20); ctx.fill(); ctx.fillStyle = '#7d5532'; ctx.fillRect(p.x - 12, p.y - 12 + bob, 24, 24); ctx.strokeStyle = '#4a2f1c'; ctx.lineWidth = 2; ctx.strokeRect(p.x - 12, p.y - 12 + bob, 24, 24); ctx.fillStyle = '#a57a4a'; ctx.fillRect(p.x - 10, p.y - 10 + bob, 20, 20); ctx.save(); ctx.translate(p.x + 1, p.y + bob); ctx.rotate(-0.5); ctx.scale(0.85, 0.85); drawWeaponIcon(p.w); ctx.restore(); }
    else if (p.type === 'rowie') { ctx.fillStyle = 'rgba(255,220,80,0.3)'; circ(p.x, p.y, 17 + Math.sin(t * 5) * 3); ctx.fill(); ctx.fillStyle = '#b9772c'; ctx.beginPath(); ctx.ellipse(p.x, p.y + bob, 11, 9, 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#e7ae4e'; ctx.beginPath(); ctx.ellipse(p.x - 1, p.y - 1 + bob, 8.5, 6.5, 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff3b0'; star(p.x + 5, p.y - 6 + bob, 3.5); }
    else { ctx.fillStyle = 'rgba(255,255,255,0.25)'; circ(p.x, p.y, 14); ctx.fill(); ctx.fillStyle = '#c98f3c'; circ(p.x, p.y + bob, 8.5); ctx.fill(); ctx.fillStyle = '#f6dc8a'; circ(p.x, p.y + bob, 6); ctx.fill(); ctx.fillStyle = '#e8b54a'; circ(p.x - 1.5, p.y - 1 + bob, 1.6); ctx.fill(); circ(p.x + 2, p.y + 2 + bob, 1.4); ctx.fill(); }
  }
  for (const p of peds) if (p.state === 'down' && onScreen(p.x, p.y, 30)) drawPerson(p);
  for (const p of peds) if (p.state !== 'down' && p.z <= 0 && onScreen(p.x, p.y, 30)) drawPerson(p);
  if (!player.car && player.z <= 0 && G.state !== 'title') drawPerson(player);
  for (const c of cars) if (onScreen(c.x, c.y, 80)) drawCar(c);
  // particles
  for (const p of parts) {
    const k = p.life / p.max;
    if (p.kind === 'ring') { ctx.strokeStyle = p.col; ctx.globalAlpha = k * 0.8; ctx.lineWidth = 3; circ(p.x, p.y, p.size + (1 - k) * p.grow); ctx.stroke(); }
    else { ctx.globalAlpha = p.kind === 'smoke' ? k * 0.6 : Math.min(1, k * 2); ctx.fillStyle = p.col; circ(p.x, p.y, p.size + (1 - k) * p.grow); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  if (salmon.length) drawSalmon();
  for (const p of peds) if (p.z > 0 && onScreen(p.x, p.y, 30)) drawPerson(p);
  if (!player.car && player.z > 0 && G.state !== 'title') drawPerson(player);
  for (const s of shots) {
    ctx.save(); ctx.translate(s.x, s.y);
    if (s.type === 'tattie') { ctx.rotate(s.rot); ctx.fillStyle = '#c9a567'; ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 4.6, 3.6, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    else if (s.type === 'haggis') { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(s.z * 0.15, s.z * 0.15, 8, 5, 0, 0, TAU); ctx.fill(); const k = 1 + s.z * 0.012; ctx.scale(k, k); ctx.rotate(s.rot); drawWeaponIcon('haggis'); if (s.fuse < 0.6 && Math.sin(t * 40) > 0) { ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 2; circ(0, 0, 11); ctx.stroke(); } }
    else { ctx.rotate(s.a); ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-22 - Math.random() * 8, 0); ctx.lineTo(-12, 3); ctx.fill(); ctx.scale(1.3, 1.3); drawWeaponIcon('rocket'); }
    ctx.restore();
  }
  for (const f of fx) { const k = f.t / f.dur, x = lerp(f.x0, f.x1, k), y = lerp(f.y0, f.y1, k); drawSpade(x, y, f.t * 14, 1.2 + Math.sin(k * Math.PI) * 1.6); }
  drawTall();
}
