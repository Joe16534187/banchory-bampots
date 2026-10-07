'use strict';
const TUTS_STROKES = [[[0, 0], [1, 0]], [[0.5, 0], [0.5, 1.4]], [[1.4, 0], [1.4, 1.0], [1.55, 1.3], [1.9, 1.4], [2.25, 1.3], [2.4, 1.0], [2.4, 0]], [[2.8, 0], [3.8, 0]], [[3.3, 0], [3.3, 1.4]],
  [[5.15, 0.15], [4.95, 0], [4.45, 0], [4.22, 0.2], [4.26, 0.5], [4.7, 0.7], [5.08, 0.9], [5.14, 1.2], [4.9, 1.4], [4.4, 1.4], [4.2, 1.25]]];
function drawGolf() {
  if (cam.x1 < GOLF_A.x || cam.x0 > GOLF_B.x + GOLF_B.w || cam.y1 < GOLF_A.y || cam.y0 > GOLF_B.y + GOLF_B.h) return;
  ctx.fillStyle = '#84cf66'; for (const f of GOLFF.fair) { ctx.beginPath(); ctx.ellipse(f[0], f[1], f[2], f[3], f[4], 0, TAU); ctx.fill(); }
  for (const b of BUNKERS) {
    ctx.fillStyle = '#d9c583'; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.rx + 5, b.ry + 5, b.rot, 0, TAU); ctx.fill();
    ctx.fillStyle = '#eddc9c'; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.rx, b.ry, b.rot, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(190,165,95,0.45)'; ctx.lineWidth = 1.5; for (const k of [0.8, 0.6, 0.4]) { ctx.beginPath(); ctx.ellipse(b.x, b.y, b.rx * k, b.ry * k, b.rot, 0, TAU); ctx.stroke(); }
  }
  // somebody has been busy with the rake
  const tb = GOLFF.tuts, u = 62, x0 = tb.x - 5.15 * u / 2, y0 = tb.y - 0.7 * u;
  ctx.fillStyle = '#eddc9c'; ctx.beginPath(); ctx.ellipse(tb.x, tb.y, tb.rx * 0.9, tb.ry * 0.82, 0, 0, TAU); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const pass of [[17, '#c9b06a'], [12.5, '#eddc9c'], [8, '#c9b06a'], [3.5, '#eddc9c']]) {
    ctx.strokeStyle = pass[1]; ctx.lineWidth = pass[0]; ctx.beginPath();
    for (const st of TUTS_STROKES) st.forEach((p, i) => i ? ctx.lineTo(x0 + p[0] * u, y0 + p[1] * u) : ctx.moveTo(x0 + p[0] * u, y0 + p[1] * u));
    ctx.stroke();
  }
  for (const g of GOLFF.greens) { ctx.fillStyle = '#a6e584'; circ(g.x, g.y, 62); ctx.fill(); ctx.strokeStyle = '#8fd26e'; ctx.lineWidth = 5; ctx.stroke(); }
  const t = GOLFF.tee; ctx.fillStyle = '#9bdc7c'; ctx.fillRect(t.x - 40, t.y - 16, 80, 32); ctx.fillStyle = '#fff'; circ(t.x - 22, t.y, 3); ctx.fill(); circ(t.x + 22, t.y, 3); ctx.fill();
}
function drawFalls() {
  const F = FALLS; if (!onScreen(F.x, F.y, 220)) return; const t = G.t, hw = F.hw - 3;
  ctx.save(); ctx.translate(F.x, F.y); ctx.rotate(Math.atan2(F.fy, F.fx));            // local +x points downstream
  ctx.fillStyle = 'rgba(30,95,150,0.35)'; ctx.fillRect(-80, -hw, 80, hw * 2);          // the deep pool above the lip
  const g = ctx.createLinearGradient(0, 0, 70, 0); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.55, 'rgba(225,242,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, -hw, 70, hw * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2.5; ctx.lineCap = 'butt'; ctx.setLineDash([11, 13]);
  for (let y = -hw + 6; y < hw; y += 9) { ctx.lineDashOffset = -(t * 95 + y * 7); ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(60, y + Math.sin(y) * 2); ctx.stroke(); }
  ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; for (let i = 0; i < 9; i++) { circ(63 + Math.sin(t * 5 + i) * 4, -hw + 9 + i * (hw * 2 - 18) / 8, 7.5 + Math.sin(t * 7 + i * 2) * 2.5); ctx.fill(); }
  for (let i = 0; i < 7; i++) { const y = -hw + i * hw * 2 / 6; ctx.fillStyle = '#625d56'; ctx.beginPath(); ctx.ellipse(-4 + (i % 2) * 5, y, 10, 14, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#8f8a80'; ctx.beginPath(); ctx.ellipse(-6 + (i % 2) * 5, y - 3, 5, 6, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function drawSalmon() {
  const F = FALLS;
  for (const s of salmon) {
    const k = s.t / s.dur, up = Math.sin(k * Math.PI), along = s.fail ? -44 + up * 44 : -44 + k * 78, x = F.x - F.fy * s.side - F.fx * along, y = F.y + F.fx * s.side - F.fy * along;
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(up * 5, up * 6, 8, 3, 0, 0, TAU); ctx.fill();
    ctx.rotate(Math.atan2(-F.fy, -F.fx) + (s.fail ? k * Math.PI * s.flip : Math.sin(k * TAU) * 0.3)); const sc = 0.9 + up * 1.0; ctx.scale(sc, sc);
    ctx.fillStyle = '#6f8794'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-14, -4.5); ctx.lineTo(-13, 0); ctx.lineTo(-14, 4.5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 3.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#d7dee3'; ctx.beginPath(); ctx.ellipse(0.5, 1.1, 8.5, 2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e89a9a'; ctx.fillRect(-5, -0.4, 9, 1.1); ctx.fillStyle = '#141414'; circ(7, -0.8, 0.9); ctx.fill();
    ctx.restore();
  }
}
function drawJetty() {
  for (const h of PIERS) {
    if (!vis(h)) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(h.x + 4, h.y + 5, h.w, h.h); ctx.fillStyle = '#9a7a52'; ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.strokeStyle = '#6b5234'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let y = h.y + 9; y < h.y + h.h; y += 9) { ctx.moveTo(h.x, y); ctx.lineTo(h.x + h.w, y); } ctx.stroke(); ctx.strokeRect(h.x, h.y, h.w, h.h);
    ctx.fillStyle = '#5d4529'; for (const q of [[0, 0.45], [1, 0.45], [0, 1], [1, 1]]) { circ(h.x + q[0] * h.w, h.y + q[1] * h.h, 4); ctx.fill(); }
  }
}
function drawPitchLines(x, y, w, h) {
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
  circ(x + w / 2, y + h / 2, Math.min(w, h) * 0.16); ctx.stroke(); ctx.strokeRect(x, y + h * 0.28, w * 0.12, h * 0.44); ctx.strokeRect(x + w * 0.88, y + h * 0.28, w * 0.12, h * 0.44);
}
function drawDecals() {
  const t = G.t;
  // skid marks
  if (skidN) {
    for (const g of [0, 1, 2]) { ctx.strokeStyle = g === 2 ? 'rgba(170,140,70,0.6)' : g ? 'rgba(90,60,30,0.4)' : 'rgba(20,20,22,0.38)'; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i < skidN; i++) { const k = i * 5; if (skids[k + 4] !== g) continue; ctx.moveTo(skids[k], skids[k + 1]); ctx.lineTo(skids[k + 2], skids[k + 3]); } ctx.stroke(); }
  }
  // respray forecourt
  const rs = SPOTS.respray; if (onScreen(rs.x, rs.y, 100)) { ctx.strokeStyle = G.heat >= 1 ? '#7dff8a' : 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 30; circ(rs.x, rs.y, 40); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; }
  // mission target ring
  const tg = targetPos();
  if (tg && onScreen(tg.x, tg.y, 120)) {
    ctx.strokeStyle = '#ff4fa3'; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 50; circ(tg.x, tg.y, tg.r + Math.sin(t * 5) * 4); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.fillStyle = 'rgba(255,79,163,0.16)'; circ(tg.x, tg.y, tg.r); ctx.fill();
  }
  // the spade, waiting in its flower bed
  const m = G.mission; if (m && m.def.id === 'spade' && m.step === 0) drawSpade(SPOTS.spadeBed.x, SPOTS.spadeBed.y, -0.9, 1.5);
}
function targetPos() { const t = G.target; if (!t) return null; return t.follow ? { x: t.follow.x, y: t.follow.y, r: t.r } : t; }
function drawSpade(x, y, a, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(6, 0); ctx.moveTo(-10, -3); ctx.lineTo(-10, 3); ctx.stroke();
  ctx.fillStyle = '#aab4bd'; ctx.strokeStyle = '#5c6670'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(13, -4); ctx.quadraticCurveTo(17, 0, 13, 4); ctx.lineTo(6, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ---------- props, people, motors ----------
function drawProp(p) {
  if (p.sunk) return;
  ctx.save(); ctx.translate(p.x, p.y); if (p.z > 0) { const s = 1 + p.z * 0.006; ctx.scale(s, s); } ctx.rotate(p.rot);
  switch (p.type) {
    case 'bin': ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-4, -5, 11, 13); ctx.fillStyle = p.col; ctx.fillRect(-5, -6, 10, 12); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-5, -6, 10, 4);
      if (p.knocked) { ctx.fillStyle = '#eee'; ctx.fillRect(7, -2, 4, 3); ctx.fillStyle = '#c96'; ctx.fillRect(9, 4, 3, 3); ctx.fillStyle = '#7ab'; ctx.fillRect(6, 8, 3, 2); } break;
    case 'tub': ctx.fillStyle = '#8a5a3a'; circ(0, 0, 8); ctx.fill(); ctx.fillStyle = '#4a3320'; circ(0, 0, 6); ctx.fill(); if (!p.knocked) { const f = ['#f25f5c', '#ffe066', '#f7a8d0', '#fff']; for (let i = 0; i < 5; i++) { ctx.fillStyle = f[i % 4]; circ(Math.cos(i * 1.26) * 3.4, Math.sin(i * 1.26) * 3.4, 2.2); ctx.fill(); } } break;
    case 'litter': ctx.fillStyle = '#2c3035'; circ(0, 0, 6); ctx.fill(); ctx.strokeStyle = '#70767d'; ctx.lineWidth = 1.5; circ(0, 0, 4); ctx.stroke(); break;
    case 'bench': ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-10, -3, 22, 9); ctx.fillStyle = '#7d5532'; ctx.fillRect(-11, -4, 22, 8); ctx.strokeStyle = '#5d3d22'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-11, -1.3); ctx.lineTo(11, -1.3); ctx.moveTo(-11, 1.3); ctx.lineTo(11, 1.3); ctx.stroke(); break;
    case 'cone': ctx.fillStyle = '#d9541a'; ctx.fillRect(-6, -6, 12, 12); ctx.fillStyle = '#ff7a2a'; circ(0, 0, 5); ctx.fill(); ctx.fillStyle = '#fff'; circ(0, 0, 3.2); ctx.fill(); ctx.fillStyle = '#ff7a2a'; circ(0, 0, 1.6); ctx.fill(); break;
    case 'flag': ctx.fillStyle = '#1d3d1d'; circ(0, 0, 3.5); ctx.fill(); ctx.strokeStyle = '#eee'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -16); ctx.stroke(); ctx.fillStyle = '#e02f2f'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(12, -12.5); ctx.lineTo(0, -9); ctx.fill(); break;
    case 'bale': ctx.fillStyle = 'rgba(0,0,0,0.2)'; circ(3, 4, 15); ctx.fill(); ctx.fillStyle = '#dcbb4c'; circ(0, 0, 15); ctx.fill(); ctx.strokeStyle = '#b8962c'; ctx.lineWidth = 2; circ(0, 0, 10); ctx.stroke(); circ(0, 0, 5); ctx.stroke(); break;
    case 'phone': ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-7, -6, 19, 19); ctx.fillStyle = '#b01f17'; ctx.fillRect(-10, -10, 20, 20); ctx.fillStyle = '#d93127'; ctx.fillRect(-8, -8, 16, 16); ctx.fillStyle = '#f04a3e'; ctx.fillRect(-5, -5, 10, 10); ctx.fillStyle = '#ffd98a'; circ(0, 0, 2); ctx.fill(); break;
    case 'totem': ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-2, -1, 10, 26); for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#c8322b', '#e8c74a', '#2f66b3', '#1f7a4d'][i]; ctx.fillRect(-5, -14 + i * 7, 10, 7); } ctx.fillStyle = '#7a5230'; ctx.fillRect(-11, -11, 22, 3); break;
    case 'memorial': ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-9, -7, 22, 22); ctx.fillStyle = '#8f8a80'; ctx.fillRect(-11, -11, 22, 22); ctx.fillStyle = '#b3aea3'; ctx.fillRect(-7, -7, 14, 14); ctx.fillStyle = '#9a948c'; ctx.fillRect(-1.5, -5, 3, 10); ctx.fillRect(-4, -2.5, 8, 3); break;
    case 'post': ctx.fillStyle = 'rgba(0,0,0,0.25)'; circ(2, 3, 7); ctx.fill(); ctx.fillStyle = '#c8281e'; circ(0, 0, 7); ctx.fill(); ctx.fillStyle = '#8f1a13'; circ(0, 0, 4.5); ctx.fill(); break;
  }
  ctx.restore();
}
