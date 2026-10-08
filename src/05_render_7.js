'use strict';
// ---------- newer scenery: the cricket club, Glen O' Dee, flower beds ----------
function drawCricket() {
  const C = CRICKET;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(C.x, C.y, C.rx, C.ry, 0, 0, TAU); ctx.fillStyle = '#74bd5a'; ctx.fill(); ctx.clip();
  ctx.fillStyle = '#7fc965'; for (let x = C.x - C.rx; x < C.x + C.rx; x += 56) ctx.fillRect(x, C.y - C.ry, 28, C.ry * 2);          // mown in stripes
  ctx.restore();
  ctx.strokeStyle = '#f6f3e6'; ctx.lineWidth = 3; ctx.setLineDash([11, 5]); ctx.beginPath(); ctx.ellipse(C.x, C.y, C.rx - 6, C.ry - 6, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);   // the boundary rope
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 24; i++) { const an = i * TAU / 24; circ(C.x + Math.cos(an) * C.rx * 0.5, C.y + Math.sin(an) * C.ry * 0.56, 1.8); ctx.fill(); }   // the inner ring
  ctx.fillStyle = '#93d577'; ctx.fillRect(C.x - 72, C.y - 46, 144, 92);                                                            // the square
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.beginPath(); for (let y = C.y - 30; y < C.y + 46; y += 16) { ctx.moveTo(C.x - 72, y); ctx.lineTo(C.x + 72, y); } ctx.stroke();
  ctx.fillStyle = '#d9cb93'; ctx.fillRect(C.x - 52, C.y - 8, 104, 16); ctx.strokeStyle = 'rgba(120,100,50,0.45)'; ctx.lineWidth = 1; ctx.strokeRect(C.x - 52, C.y - 8, 104, 16);   // the strip
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath();
  for (const s of [-1, 1]) { ctx.moveTo(C.x + s * 39, C.y - 13); ctx.lineTo(C.x + s * 39, C.y + 13); ctx.moveTo(C.x + s * 47, C.y - 8); ctx.lineTo(C.x + s * 47, C.y + 8); }
  ctx.stroke();
  ctx.fillStyle = '#e9c98a'; for (const s of [-1, 1]) for (const k of [-3, 0, 3]) { circ(C.x + s * 47, C.y + k, 1.5); ctx.fill(); }  // stumps
  for (const s of [-1, 1]) { const x = C.x + s * (C.rx + 12) - 4; ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x + 3, C.y - 32, 8, 70); ctx.fillStyle = '#f6f6f2'; ctx.fillRect(x, C.y - 36, 8, 70); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(x, C.y - 36, 8, 70); }   // sight screens
  const bx = C.x - 342, by = C.y - 196;                                                                                             // the scoreboard
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(bx + 4, by + 5, 90, 32); ctx.fillStyle = '#1c1f24'; ctx.fillRect(bx, by, 90, 32); ctx.strokeStyle = '#f6f3e6'; ctx.lineWidth = 1.5; ctx.strokeRect(bx + 2, by + 2, 86, 28);
  ctx.fillStyle = '#f6f3e6'; ctx.textAlign = 'center'; ctx.font = 'bold 9px Arial,sans-serif'; ctx.fillText('BANCHORY C.C.', bx + 45, by + 13); ctx.font = 'bold 11px Arial,sans-serif'; ctx.fillStyle = '#ffd21f'; ctx.fillText('147 for 6', bx + 45, by + 25);
}
function drawFlowerBed(x, y) {
  if (!onScreen(x, y, 60)) return;
  ctx.fillStyle = '#5d4026'; ctx.beginPath(); ctx.ellipse(x, y, 47, 31, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#6b4a2b'; ctx.beginPath(); ctx.ellipse(x, y, 44, 28, 0, 0, TAU); ctx.fill();
  const fl = ['#f25f5c', '#ffe066', '#f7a8d0', '#fff'];
  for (let i = 0; i < 14; i++) { const fx = x + Math.cos(i * 2.4) * (12 + (i * 7) % 26), fy = y + Math.sin(i * 2.4) * (8 + (i * 5) % 16); ctx.fillStyle = '#3f8a3f'; circ(fx + 1.5, fy + 1.5, 2.6); ctx.fill(); ctx.fillStyle = fl[i % 4]; circ(fx, fy, 3.2); ctx.fill(); }
}
function drawRubble(h) {                                    // cracked slabs and weeds: nobody has swept here in a while
  const r = rng((h.x * 7 + h.y) | 0);
  ctx.strokeStyle = 'rgba(55,52,45,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i < 16; i++) { let x = h.x + r() * h.w, y = h.y + r() * h.h; ctx.moveTo(x, y); for (let k = 0; k < 3; k++) { x = clamp(x + (r() - 0.5) * 60, h.x, h.x + h.w); y = clamp(y + (r() - 0.5) * 60, h.y, h.y + h.h); ctx.lineTo(x, y); } }
  ctx.stroke();
  for (let i = 0; i < 34; i++) {
    const x = h.x + 8 + r() * (h.w - 16), y = h.y + 8 + r() * (h.h - 16), k = r(), s = 3 + r() * 5;
    if (k < 0.5) { ctx.fillStyle = k < 0.25 ? '#5f8a4a' : '#6f9a55'; circ(x, y, s); ctx.fill(); circ(x + s * 0.8, y + s * 0.3, s * 0.6); ctx.fill(); }
    else { ctx.fillStyle = k < 0.75 ? '#77736a' : '#a39d8e'; ctx.fillRect(x, y, s * 1.6, s); }
  }
}
function drawRuinTop(b, x, y, w, h) {                       // no roof to speak of: you look straight down into the rooms
  const r = rng((b.x + b.y * 3) | 0), long = w >= h, n = Math.max(1, Math.round((long ? w : h) / 120));
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#474b42'; ctx.fillRect(x, y, w, h);
  for (let i = 0, m = w * h / 2400; i < m; i++) { const px = x + r() * w, py = y + r() * h, k = r(); ctx.fillStyle = k < 0.4 ? '#58784a' : k < 0.7 ? '#716d64' : '#393b36'; circ(px, py, 3 + r() * 6); ctx.fill(); }
  ctx.strokeStyle = '#8f897c'; ctx.lineWidth = 5; ctx.lineCap = 'butt'; ctx.beginPath();                       // what is left of the inside walls
  for (let i = 1; i < n; i++) { const f = 0.35 + r() * 0.5, top = r() < 0.5; if (long) { const px = x + w * i / n; ctx.moveTo(px, top ? y : y + h); ctx.lineTo(px, top ? y + h * f : y + h - h * f); } else { const py = y + h * i / n; ctx.moveTo(top ? x : x + w, py); ctx.lineTo(top ? x + w * f : x + w - w * f, py); } }
  ctx.stroke();
  for (let i = 0; i < n; i++) {                                                                               // a few slates hanging on, rafters showing
    const keep = r(), cw = (long ? w : h) / n, c0 = (long ? x : y) + cw * i, f0 = r() * 0.3, f1 = 0.55 + r() * 0.4;
    if (keep < 0.42) continue;
    const ax = long ? c0 + cw * f0 : x, ay = long ? y : c0 + cw * f0, aw = long ? cw * (f1 - f0) : w * (0.45 + r() * 0.3), ah = long ? h * (0.45 + r() * 0.3) : cw * (f1 - f0);
    ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k < 4; k++) { if (long) { ctx.moveTo(ax + aw * k / 3, ay); ctx.lineTo(ax + aw * k / 3, ay + ah + 26); } else { ctx.moveTo(ax, ay + ah * k / 3); ctx.lineTo(ax + aw + 26, ay + ah * k / 3); } } ctx.stroke();
    ctx.fillStyle = keep < 0.7 ? '#55606b' : '#4c5661'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + aw, ay);
    if (long) { ctx.lineTo(ax + aw, ay + ah * 0.7); ctx.lineTo(ax + aw * 0.7, ay + ah); ctx.lineTo(ax + aw * 0.45, ay + ah * 0.78); ctx.lineTo(ax + aw * 0.2, ay + ah * 0.95); ctx.lineTo(ax, ay + ah * 0.6); }
    else { ctx.lineTo(ax + aw, ay + ah * 0.25); ctx.lineTo(ax + aw * 0.75, ay + ah * 0.5); ctx.lineTo(ax + aw * 0.95, ay + ah * 0.8); ctx.lineTo(ax + aw * 0.6, ay + ah); ctx.lineTo(ax, ay + ah); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.strokeStyle = '#bcb6a7'; ctx.lineWidth = 10; ctx.setLineDash([70 + r() * 50, 16, 110, 24, 46, 12]); ctx.lineDashOffset = r() * 80; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10); ctx.setLineDash([]); ctx.lineDashOffset = 0;   // the outer walls, with gaps
  for (let i = 0; i < 12; i++) { const side = (r() * 4) | 0, f = r(), px = side === 0 ? x + 6 : side === 1 ? x + w - 6 : x + w * f, py = side === 2 ? y + 6 : side === 3 ? y + h - 6 : y + h * f; ctx.fillStyle = r() < 0.5 ? '#3f7a3f' : '#4f8a45'; circ(px, py, 6 + r() * 7); ctx.fill(); circ(px + 7, py + 4, 5); ctx.fill(); }   // ivy
  ctx.restore();
}

// ---------- the heavy mob ----------
function lightBar(c, x, Wd, h) {
  const fl = c.siren && Math.sin(G.t * 16) > 0;
  ctx.fillStyle = '#222'; ctx.fillRect(x, -h + 4, 5, Wd - 8); ctx.fillStyle = c.siren ? (fl ? '#5ab4ff' : '#1b3f8a') : '#2b62c8'; ctx.fillRect(x, -h + 4, 5, (Wd - 8) / 2); ctx.fillStyle = c.siren ? (fl ? '#1b3f8a' : '#5ab4ff') : '#2b62c8'; ctx.fillRect(x, 0, 5, (Wd - 8) / 2);
  if (c.siren) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#5ab4ff'; circ(x + 3, fl ? -5 : 5, 16); ctx.fill(); ctx.globalAlpha = 1; }
}
function drawTank(c, L, Wd, h) {
  const col = c.dead ? '#6b6b62' : c.col, tr = (c.x * Math.cos(c.a) + c.y * Math.sin(c.a)) % 7;
  for (const s of [-1, 1]) {                                                         // tracks
    const y = s < 0 ? -h : h - 10; ctx.fillStyle = '#1b1c1e'; rr(-L / 2, y, L, 10, 3); ctx.fill();
    ctx.strokeStyle = '#4a4c50'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = -L / 2 + 3 + ((tr % 7) + 7) % 7; x < L / 2 - 2; x += 7) { ctx.moveTo(x, y + 1); ctx.lineTo(x, y + 9); } ctx.stroke();
  }
  ctx.fillStyle = col; rr(-L / 2 + 3, -h + 7, L - 6, Wd - 14, 4); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = shade(col, 0.82); ctx.beginPath(); ctx.ellipse(-L * 0.3, -3, 9, 5, 0.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(L * 0.2, 5, 10, 4, -0.4, 0, TAU); ctx.fill();   // camouflage
  ctx.fillStyle = shade(col, 0.7); ctx.fillRect(-L / 2 + 5, -6, 8, 12); ctx.fillStyle = '#fff6c2'; ctx.fillRect(L / 2 - 6, -h + 9, 2.5, 3); ctx.fillRect(L / 2 - 6, h - 12, 2.5, 3);
  ctx.rotate(c.turret - c.a);                                                         // the turret turns on its own
  ctx.fillStyle = shade(col, 0.6); ctx.fillRect(8, -2.6, 33, 5.2); ctx.fillStyle = '#222'; ctx.fillRect(38, -3.4, 5, 6.8);
  ctx.fillStyle = shade(col, 0.88); circ(0, 0, 12); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = shade(col, 0.68); circ(-3, 3, 4.2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.stroke();
  if (c === player.car) { ctx.fillStyle = '#ffd21f'; circ(-3, 3, 2.8); ctx.fill(); }
}
function drawPolvan(c, L, Wd, h, glass) {
  ctx.fillStyle = glass; ctx.beginPath(); ctx.moveTo(L / 2 - 13, -h + 2.5); ctx.lineTo(L / 2 - 6, -h + 4); ctx.lineTo(L / 2 - 6, h - 4); ctx.lineTo(L / 2 - 13, h - 2.5); ctx.fill();
  ctx.strokeStyle = 'rgba(210,214,220,0.85)'; ctx.lineWidth = 0.7; ctx.beginPath(); for (let y = -h + 5; y < h - 4; y += 3) { ctx.moveTo(L / 2 - 13, y); ctx.lineTo(L / 2 - 6, y); } ctx.stroke();   // riot mesh over the screen
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#f2d21f' : '#2b62c8'; ctx.fillRect(-L / 2 + 3 + i * 5, -h + 0.6, 5, 2.6); ctx.fillStyle = i % 2 ? '#2b62c8' : '#f2d21f'; ctx.fillRect(-L / 2 + 3 + i * 5, h - 3.2, 5, 2.6); }
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; ctx.strokeRect(-L / 2 + 5, -h + 5, 16, Wd - 10);
  ctx.save(); ctx.translate(-L / 2 + 13, 0); ctx.rotate(Math.PI / 2); ctx.fillStyle = '#2b62c8'; ctx.font = 'bold 6.5px Arial,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('POLIS', 0, 2.4); ctx.restore();
  ctx.fillStyle = '#3a3d42'; ctx.fillRect(L / 2 - 2, -h + 2, 3.5, Wd - 4);                                     // the ram on the front
  lightBar(c, 2, Wd, h);
}
function drawJeep(c, L, Wd, h) {
  ctx.fillStyle = '#2f3626'; rr(-L * 0.36, -h + 3, L * 0.5, Wd - 6, 3); ctx.fill();                              // open cab
  ctx.fillStyle = '#6b7a4f'; rr(-L * 0.12, -h + 4.5, 8, 6, 2); ctx.fill(); rr(-L * 0.12, h - 10.5, 8, 6, 2); ctx.fill();
  if (c.ai || c.driver) { ctx.fillStyle = '#4a5536'; circ(-L * 0.12 + 4, -h + 7.5, 3.3); ctx.fill(); if (c.ai) { circ(-L * 0.12 + 4, h - 7.5, 3.3); ctx.fill(); } }
  ctx.fillStyle = '#27323f'; ctx.fillRect(L * 0.14, -h + 2.5, 2.2, Wd - 5);
  ctx.fillStyle = '#f4f4f0'; star(L * 0.32, 0, 4.2);
  ctx.fillStyle = '#17181b'; circ(-L / 2 + 2.5, 0, 5); ctx.fill(); ctx.fillStyle = '#3a3d42'; circ(-L / 2 + 2.5, 0, 2.2); ctx.fill();   // spare wheel
}
function drawCarExtras(c, L, Wd, h) {                       // things bolted on at Dod's
  const up = c.up; if (!up && !c.boost) return;
  if (up && up.bars) { ctx.fillStyle = '#2b2e33'; ctx.fillRect(L / 2 - 0.5, -h + 1.5, 3.2, Wd - 3); ctx.fillRect(L / 2 - 4, -h + 3, 4, 2); ctx.fillRect(L / 2 - 4, h - 5, 4, 2); ctx.fillStyle = '#9aa3ad'; ctx.fillRect(L / 2 + 0.4, -h + 3, 1.2, Wd - 6); }
  if (up && up.tune) { ctx.fillStyle = '#c9ced4'; ctx.fillRect(-L / 2 - 2.5, -5.5, 3, 2.4); ctx.fillRect(-L / 2 - 2.5, 3.1, 3, 2.4); }
  if (up && up.tyres) { ctx.fillStyle = '#e8e4da'; const wx = L * 0.3; for (const a of [-wx, wx]) { ctx.fillRect(a - 2, -h - 1.2, 4, 1.2); ctx.fillRect(a - 2, h + 0, 4, 1.2); } }
  if (c.boost && c.type !== 'pzazz') { ctx.fillStyle = '#5ad1ff'; ctx.beginPath(); ctx.moveTo(-L / 2, -4); ctx.lineTo(-L / 2 - 14 - Math.random() * 8, 0); ctx.lineTo(-L / 2, 4); ctx.fill(); }
}
let tartanPat = null;
function drawTartan(L, Wd, h, rad) {                        // Dod's Royal Deeside special
  if (!tartanPat) tartanPat = ctx.createPattern(tartan, 'repeat');
  ctx.save(); rr(-L / 2, -h, L, Wd, rad); ctx.clip(); ctx.scale(0.24, 0.24); ctx.fillStyle = tartanPat; ctx.fillRect(-L * 2.2, -Wd * 2.2, L * 4.4, Wd * 4.4); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.2; rr(-L / 2, -h, L, Wd, rad); ctx.stroke();
}

// ---------- things in the air: baton rounds, shells and the helicopter (drawn over the rooftops) ----------
function drawHeli(h) {
  const t = G.t;
  if (!h.leave && onScreen(h.lx, h.ly, 110)) {                                        // the searchlight
    ctx.fillStyle = G.hidden ? 'rgba(255,250,205,0.10)' : 'rgba(255,250,205,0.18)'; circ(h.lx, h.ly, 92); ctx.fill(); ctx.strokeStyle = 'rgba(255,250,205,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    const a = Math.atan2(h.ly - h.y, h.lx - h.x), nx = -Math.sin(a) * 92, ny = Math.cos(a) * 92; ctx.fillStyle = 'rgba(255,250,205,0.06)'; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.lx + nx, h.ly + ny); ctx.lineTo(h.lx - nx, h.ly - ny); ctx.closePath(); ctx.fill();
  }
  if (!onScreen(h.x, h.y, 140)) return;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(h.x + 46, h.y + 60, 36, 15, h.a, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(h.x, h.y + Math.sin(t * 2 + h.ph) * 3); ctx.rotate(h.a); ctx.scale(1.55, 1.55);
  ctx.strokeStyle = '#26282c'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8, -11); ctx.lineTo(13, -11); ctx.moveTo(-8, 11); ctx.lineTo(13, 11); ctx.moveTo(-2, -8); ctx.lineTo(-2, -11); ctx.moveTo(7, -8); ctx.lineTo(7, -11); ctx.moveTo(-2, 8); ctx.lineTo(-2, 11); ctx.moveTo(7, 8); ctx.lineTo(7, 11); ctx.stroke();   // skids
  ctx.fillStyle = '#1f3f7a'; ctx.fillRect(-36, -2, 26, 4); ctx.beginPath(); ctx.moveTo(-38, -8); ctx.lineTo(-32, -2); ctx.lineTo(-32, 2); ctx.lineTo(-38, 8); ctx.closePath(); ctx.fill();   // tail
  ctx.strokeStyle = 'rgba(20,20,20,0.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-36, -5 - Math.sin(h.rot * 1.7) * 5); ctx.lineTo(-36, -5 + Math.sin(h.rot * 1.7) * 5); ctx.stroke();
  ctx.fillStyle = '#f4f4f0'; ctx.beginPath(); ctx.ellipse(0, 0, 17, 9.5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#f2d21f' : '#2b62c8'; ctx.fillRect(-13 + i * 4, -2.5, 4, 2.5); ctx.fillStyle = i % 2 ? '#2b62c8' : '#f2d21f'; ctx.fillRect(-13 + i * 4, 0, 4, 2.5); }
  ctx.fillStyle = '#27323f'; ctx.beginPath(); ctx.ellipse(10.5, 0, 6, 7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(12, -2, 2.5, 3, 0, 0, TAU); ctx.fill();
  ctx.rotate(h.rot); ctx.fillStyle = 'rgba(30,30,30,0.14)'; circ(0, 0, 32); ctx.fill();
  ctx.strokeStyle = 'rgba(20,20,20,0.7)'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-32, 0); ctx.lineTo(32, 0); ctx.moveTo(0, -32); ctx.lineTo(0, 32); ctx.stroke(); ctx.fillStyle = '#222'; circ(0, 0, 3); ctx.fill();
  ctx.restore();
}
function drawSky() {
  const t = G.t;
  for (const s of copShots) {
    if (s.type === 'shell') {
      const k = clamp(s.t / s.dur, 0, 1), x = lerp(s.x0, s.tx, k), y = lerp(s.y0, s.ty, k), up = Math.sin(k * Math.PI);
      ctx.fillStyle = 'rgba(255,60,40,0.12)'; circ(s.tx, s.ty, 100); ctx.fill();                               // where it is going to land
      ctx.strokeStyle = 'rgba(255,70,50,' + (0.6 + 0.35 * Math.sin(t * 24)) + ')'; ctx.lineWidth = 3.5; ctx.setLineDash([13, 8]); ctx.lineDashOffset = -t * 45; circ(s.tx, s.ty, 100); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      ctx.lineWidth = 2.5; circ(s.tx, s.ty, Math.max(2, 100 * (1 - k))); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s.tx - 12, s.ty); ctx.lineTo(s.tx + 12, s.ty); ctx.moveTo(s.tx, s.ty - 12); ctx.lineTo(s.tx, s.ty + 12); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, 6, 4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2b2b2b'; circ(x, y - up * 70, 4 + up * 3.5); ctx.fill(); ctx.fillStyle = '#ffb347'; circ(x, y - up * 70, 1.6 + up * 1.5); ctx.fill();
    } else {
      const a = Math.atan2(s.vy, s.vx), k = s.air ? 1 + clamp(s.life, 0, 1) * 0.8 : 1;
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(a); ctx.scale(k, k);
      ctx.strokeStyle = 'rgba(255,240,170,0.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-4, 0); ctx.stroke();
      ctx.fillStyle = '#26282c'; rr(-5, -2.6, 10, 5.2, 2.6); ctx.fill(); ctx.fillStyle = '#f2d21f'; ctx.fillRect(-1.5, -2.6, 3, 5.2);
      ctx.restore();
    }
  }
  for (const h of helis) drawHeli(h);
}

// ---------- the T sign, and the shop counter ----------
function drawPrompt(u) {
  if (!G.prompt || G.state !== 'play') return;
  const warn = G.prompt[0] === '!', txt = warn ? G.prompt.slice(1) : G.prompt, fs = 20 * u, y = H * 0.76;
  ctx.font = fs + 'px ' + FONT; const tw = ctx.measureText(txt).width, kw = warn ? 0 : 34 * u, bw = tw + kw + 30 * u, bx = W / 2 - bw / 2;
  ctx.fillStyle = 'rgba(16,22,18,0.82)'; rr(bx, y - 22 * u, bw, 32 * u, 12 * u); ctx.fill(); ctx.strokeStyle = warn ? '#ff9a8a' : COL.yellow; ctx.lineWidth = 2; ctx.stroke();
  if (!warn) { const kx = bx + 10 * u, ky = y - 17 * u + Math.sin(G.t * 5) * 1.5; ctx.fillStyle = COL.yellow; rr(kx, ky, 24 * u, 22 * u, 5 * u); ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#141414'; ctx.textAlign = 'center'; ctx.font = fs * 0.95 + 'px ' + FONT; ctx.fillText('T', kx + 12 * u, ky + 17.5 * u); }
  ctx.font = fs + 'px ' + FONT; ctx.textAlign = 'left'; ctx.fillStyle = warn ? '#ffd0c8' : '#fff'; ctx.fillText(txt, bx + 15 * u + kw, y);
}
function shield(x, y, s) { ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y - s); ctx.lineTo(x + s, y); ctx.quadraticCurveTo(x + s, y + s, x, y + s * 1.35); ctx.quadraticCurveTo(x - s, y + s, x - s, y); ctx.closePath(); }
function drawShop() {
  const sh = G.shop; if (!sh) return;
  const def = sh.def, u = clamp(Math.min(W / 700, H / 620), 0.62, 1), P = player, n = sh.items.length, rowH = 38 * u;
  ctx.fillStyle = 'rgba(10,20,14,0.84)'; ctx.fillRect(0, 0, W, H);
  const pw = Math.min(W - 20, 660 * u), ph = 132 * u + n * rowH + 128 * u, px = (W - pw) / 2, py = Math.max(6, (H - ph) / 2);
  ctx.fillStyle = '#20241f'; rr(px, py, pw, ph, 16); ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = def.col; ctx.lineWidth = 2; rr(px + 4, py + 4, pw - 8, ph - 8, 13); ctx.stroke();
  ctx.save(); rr(px + 6, py + 6, pw - 12, 62 * u, 11); ctx.clip(); ctx.fillStyle = ctx.createPattern(tartan, 'repeat'); ctx.globalAlpha = def.kind === 'pub' ? 0.9 : 0.35; ctx.fillRect(px, py, pw, 80 * u); ctx.globalAlpha = 1; ctx.restore();
  otext(def.name[0].toUpperCase() + def.name.slice(1), W / 2, py + 50 * u, 40 * u, COL.yellow);
  // the keeper has something to say
  ctx.font = 19 * u + 'px ' + FONT; const line = def.keeper + ':  ' + sh.msg, lw = Math.min(pw - 40, ctx.measureText(line).width + 30);
  ctx.fillStyle = sh.good ? '#fffdf2' : '#ffe1dc'; rr(W / 2 - lw / 2, py + 78 * u, lw, 32 * u, 10); ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#141414'; ctx.textAlign = 'center'; ctx.fillText(line, W / 2, py + 100 * u, pw - 56);
  // the list
  const y0 = py + 126 * u;
  sh.items.forEach((it, i) => {
    const y = y0 + i * rowH, sel = i === sh.i, why = it.why(), poor = !why && G.money < it.price;
    if (sel) { ctx.fillStyle = 'rgba(255,210,31,0.16)'; rr(px + 14, y, pw - 28, rowH - 4, 8); ctx.fill(); ctx.strokeStyle = COL.yellow; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.moveTo(px + 24, y + rowH * 0.24); ctx.lineTo(px + 36, y + rowH * 0.46); ctx.lineTo(px + 24, y + rowH * 0.68); ctx.fill(); }
    ctx.font = 23 * u + 'px ' + FONT; ctx.textAlign = 'left'; ctx.fillStyle = why ? 'rgba(244,239,224,0.4)' : '#f4efe0'; ctx.fillText(it.name, px + 46, y + rowH * 0.66);
    ctx.textAlign = 'right';
    if (why) { ctx.font = 17 * u + 'px ' + FONT; ctx.fillStyle = 'rgba(244,239,224,0.5)'; ctx.fillText(why, px + pw - 26, y + rowH * 0.64); }
    else { ctx.fillStyle = poor ? '#ff8a7a' : '#8dff6b'; ctx.fillText('£' + it.price.toLocaleString('en-GB'), px + pw - 26, y + rowH * 0.66); }
  });
  const yd = y0 + n * rowH + 8 * u; ctx.font = 18 * u + 'px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = '#cfd8c8';
  wrap(sh.items[sh.i].desc, pw - 70).slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, yd + 18 * u + i * 21 * u));
  // what you have
  const ys = yd + 68 * u; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + 20, ys - 20 * u); ctx.lineTo(px + pw - 20, ys - 20 * u); ctx.stroke();
  otext('£' + Math.round(G.money).toLocaleString('en-GB'), px + 24, ys + 8 * u, 28 * u, COL.yellow, 'left');
  let st = '';
  if (def.kind === 'pub') {
    for (let i = 0; i < 5; i++) { heart(px + pw - 30 - (4 - i) * 24 * u, ys - 1 * u, 8 * u); ctx.fillStyle = i < P.hp ? '#ff4d4d' : 'rgba(20,20,20,0.6)'; ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; ctx.stroke(); }
    st = (P.tipsy >= 0.5 ? TIPSY[clamp(Math.round(P.tipsy), 1, 4)] : 'Sober') + (G.stars ? '     Wanted: ' + G.stars + (G.stars > 1 ? ' stars' : ' star') : '');
    otext(st, px + pw - 30 - 5 * 24 * u, ys + 6 * u, 18 * u, '#ffcf6b', 'right', 3);
  } else if (def.kind === 'dealer') {
    st = 'Tatties ' + P.ammo.tattie + '     Haggis ' + P.ammo.haggis + '     Rockets ' + P.ammo.rocket + '     Tweed ' + P.armour + '/3';
    otext(st, px + pw - 24, ys + 6 * u, 18 * u, '#d9c8ff', 'right', 3);
  } else {
    const c = P.car, up = c.up || NO_UP, fitted = ['tyres', 'bars', 'tune', 'nitro'].filter(k => up[k]).map(k => ({ tyres: 'tyres', bars: 'bull bars', tune: 'tune', nitro: 'nitro' })[k]);
    st = c.sp.name + '     ' + (c.dead ? 'Deid' : 'Damage ' + Math.round(clamp(c.dmg, 0, 100)) + '%') + (fitted.length ? '     Fitted: ' + fitted.join(', ') : '');
    otext(st, px + pw - 24, ys + 6 * u, 17 * u, '#b8ffbf', 'right', 3);
  }
  otext('Up and Down to choose      Enter to buy      Esc or T to leave', W / 2, py + ph - 14 * u, 16 * u, '#f4efe0', 'center', 3);
}
