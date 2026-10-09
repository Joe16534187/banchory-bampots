'use strict';
// ---------- beasts, robes and the auld stanes ----------
function drawCow(p, flat) {                      // a Highland coo, seen from above, facing +x
  const col = p.shirt, dk = shade(col, 0.72), angry = p.state === 'stampede';
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(1, 4, 18, 11, 0, 0, TAU); ctx.fill();
  if (flat) { ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); for (const q of [[-9, -1], [5, -1], [-9, 1], [5, 1]]) { ctx.moveTo(q[0], q[1] * 7); ctx.lineTo(q[0] + 1, q[1] * 16); } ctx.stroke(); }
  else { const s = Math.sin(p.walk) * (angry ? 3 : 1.5); ctx.fillStyle = '#3a2a1c'; for (const q of [[-9, -1, s], [5, -1, -s], [-9, 1, -s], [5, 1, s]]) { ctx.beginPath(); ctx.ellipse(q[0] + q[2], q[1] * 8.5, 3, 2.2, 0, 0, TAU); ctx.fill(); } }
  ctx.strokeStyle = dk; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-21, Math.sin(p.walk * 0.7) * 3); ctx.stroke();                       // tail
  ctx.fillStyle = col; for (const q of [[-9, 0, 8.5], [-3, -2.6, 9], [-3, 2.6, 9], [4, 0, 8.5]]) { circ(q[0], q[1], q[2]); ctx.fill(); }
  ctx.strokeStyle = dk; ctx.lineWidth = 1.2; ctx.beginPath(); for (const q of [[-11, -3], [-6, 2], [-1, -4], [3, 3], [-8, 5], [1, -1]]) { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - 3, q[1] + 1.5); } ctx.stroke();   // shaggy
  ctx.strokeStyle = '#efe6cc'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(11, -3.5); ctx.quadraticCurveTo(9, -13, 16, -15); ctx.moveTo(11, 3.5); ctx.quadraticCurveTo(9, 13, 16, 15); ctx.stroke();             // the horns
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(12.5, 0, 5.5, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = dk; ctx.beginPath(); ctx.ellipse(10.5, 0, 3.4, 4.8, 0, 0, TAU); ctx.fill();                       // the fringe it cannot see through
  ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.ellipse(17.2, 0, 1.8, 2.8, 0, 0, TAU); ctx.fill();
  if (angry && Math.sin(G.t * 14 + p.ox) > 0.2) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; circ(20.5, -3.5, 2.2); ctx.fill(); circ(20.5, 3.5, 2.2); ctx.fill(); }   // snorting
}
function drawPig(flat, walk) {                   // a piglet, facing +x
  if (flat) { ctx.strokeStyle = '#d98a9c'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); for (const q of [[-3, -1], [2.5, -1], [-3, 1], [2.5, 1]]) { ctx.moveTo(q[0], q[1] * 3); ctx.lineTo(q[0], q[1] * 7.5); } ctx.stroke(); }
  else { const s = Math.sin(walk || 0) * 1.6; ctx.fillStyle = '#d98a9c'; for (const q of [[-3, -1, s], [2.5, -1, -s], [-3, 1, -s], [2.5, 1, s]]) { ctx.beginPath(); ctx.ellipse(q[0] + q[2], q[1] * 4.2, 1.6, 1.2, 0, 0, TAU); ctx.fill(); } }
  ctx.strokeStyle = '#e58fa3'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-8, 0, 1.8, 0.5, 5.2); ctx.stroke();                                                                   // curly tail
  ctx.fillStyle = '#f4adbd'; ctx.beginPath(); ctx.ellipse(-0.5, 0, 6.6, 4.6, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = '#e58fa3'; ctx.beginPath(); ctx.moveTo(3.5, -2.5); ctx.lineTo(4.5, -6.2); ctx.lineTo(7, -3); ctx.fill(); ctx.beginPath(); ctx.moveTo(3.5, 2.5); ctx.lineTo(4.5, 6.2); ctx.lineTo(7, 3); ctx.fill();   // lugs
  ctx.fillStyle = '#f4adbd'; circ(6, 0, 3.6); ctx.fill(); ctx.fillStyle = '#e07f96'; ctx.beginPath(); ctx.ellipse(9.2, 0, 1.5, 2.1, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#141414'; circ(6.6, -1.7, 0.7); ctx.fill(); circ(6.6, 1.7, 0.7); ctx.fill();
}
function drawRobe(p) {                           // hood up, face just showing
  ctx.fillStyle = p.shirt; ctx.beginPath(); ctx.ellipse(-0.6, 0, 6, 9, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = '#c9b06a'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(1.5, -8); ctx.lineTo(1.5, 8); ctx.stroke();                                                         // rope belt
  ctx.fillStyle = shade(p.shirt, 1.25); circ(0.4, 0, 5.3); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = p.skin; circ(3.1, 0, 2.5); ctx.fill();
}
function drawSplats() {
  for (const s of splats) {
    if (!onScreen(s.x, s.y, 40)) continue;
    ctx.save(); ctx.translate(s.x, s.y); ctx.globalAlpha = Math.min(1, s.t / 5);
    ctx.rotate(s.sk); ctx.strokeStyle = 'rgba(25,22,20,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-10, -7); ctx.lineTo(34, -7); ctx.moveTo(-10, 7); ctx.lineTo(34, 7); ctx.stroke();   // the tyre tracks carry on
    ctx.rotate(s.a - s.sk);
    if (s.kind === 'sheep') {
      ctx.strokeStyle = '#26262a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); for (const q of [[-7, -1], [4, -1], [-7, 1], [4, 1]]) { ctx.moveTo(q[0], q[1] * 5); ctx.lineTo(q[0] + q[1] * 2 - 2, q[1] * 14); } ctx.stroke();
      ctx.fillStyle = '#e9e6dc'; for (const q of [[-8, 0, 7], [-2, -4, 7.5], [-2, 4, 7.5], [5, 0, 7], [-5, -6, 4], [2, 7, 4], [-11, 4, 4]]) { circ(q[0], q[1], q[2]); ctx.fill(); }
      ctx.fillStyle = '#26262a'; ctx.beginPath(); ctx.ellipse(12, 0, 4.4, 3.6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#f4f4f0'; ctx.lineWidth = 0.9; ctx.beginPath(); for (const y of [-1.6, 1.6]) { ctx.moveTo(12, y - 0.9); ctx.lineTo(13.8, y + 0.9); ctx.moveTo(13.8, y - 0.9); ctx.lineTo(12, y + 0.9); } ctx.stroke();   // X X
    } else {
      ctx.fillStyle = '#5a3a22'; circ(-1, 0, 11.5); ctx.fill(); ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.4; circ(-1, 0, 9.8); ctx.stroke(); ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1; circ(-1, 0, 7); ctx.stroke();
      ctx.fillStyle = '#3d2a1a'; ctx.beginPath(); ctx.ellipse(1, 0, 6.5, 5.5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#e8b54a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-1, -5); ctx.lineTo(-4, -13); ctx.moveTo(2, 5); ctx.lineTo(4, 13); ctx.stroke();
      ctx.fillStyle = '#7fa7c9'; circ(9, 0, 2.6); ctx.fill(); ctx.fillStyle = '#d9261c'; circ(10.4, 2, 1.7); ctx.fill();
      ctx.strokeStyle = '#141414'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(8.2, -0.9); ctx.lineTo(9.8, 0.9); ctx.moveTo(9.8, -0.9); ctx.lineTo(8.2, 0.9); ctx.stroke();
    }
    ctx.restore();
  }
}
function drawStanes() {                          // the ground inside the ring, the slab in the middle, and whatever is lying on it
  const T = SPOTS.stanes; if (!onScreen(T.x, T.y, 170)) return; const t = G.t, F = G.funeral;
  ctx.fillStyle = 'rgba(110,95,65,0.32)'; circ(T.x, T.y, 118); ctx.fill(); ctx.fillStyle = 'rgba(110,95,65,0.25)'; circ(T.x, T.y, 84); ctx.fill();
  ctx.strokeStyle = 'rgba(240,235,215,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([9, 7]); circ(T.x, T.y, 78); ctx.stroke(); ctx.setLineDash([]);                                       // a chalk ring
  ctx.strokeStyle = 'rgba(240,235,215,0.4)'; ctx.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const an = i * TAU / 3 - 0.5; ctx.beginPath(); ctx.arc(T.x + Math.cos(an) * 34, T.y + Math.sin(an) * 34, 9, an, an + 4.6); ctx.stroke(); }
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(T.x - 19, T.y - 10, 44, 28); ctx.fillStyle = '#8f8a80'; rr(T.x - 22, T.y - 14, 44, 28, 5); ctx.fill(); ctx.strokeStyle = '#5f5a53'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#a39d8e'; rr(T.x - 18, T.y - 11, 36, 20, 4); ctx.fill(); ctx.fillStyle = 'rgba(80,120,70,0.5)'; circ(T.x - 15, T.y + 9, 4); ctx.fill(); circ(T.x + 17, T.y - 10, 3); ctx.fill();
  for (const q of [[-30, -20], [30, -20], [-30, 20], [30, 20]]) {                                                                                                                     // candles
    const fl = 2.2 + Math.sin(t * 11 + q[0] + q[1]) * 0.7; ctx.fillStyle = 'rgba(255,220,120,0.22)'; circ(T.x + q[0], T.y + q[1], 9 + fl); ctx.fill();
    ctx.fillStyle = '#f1ead6'; circ(T.x + q[0], T.y + q[1], 2.6); ctx.fill(); ctx.fillStyle = '#ffb347'; circ(T.x + q[0], T.y + q[1], fl * 0.6); ctx.fill();
  }
  if (F && F.coffin) {                                                                                                                                                              // a very small coffin
    ctx.save(); ctx.translate(T.x, T.y - 1);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-12, -4, 28, 13);
    ctx.fillStyle = '#6b4a2b'; ctx.beginPath(); ctx.moveTo(-14, -3.5); ctx.lineTo(-8, -6.5); ctx.lineTo(13, -5); ctx.lineTo(13, 5); ctx.lineTo(-8, 6.5); ctx.lineTo(-14, 3.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#3d2a1a'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = '#c9a567'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -6.5); ctx.lineTo(-8, 6.5); ctx.moveTo(-3, 0); ctx.lineTo(9, 0); ctx.moveTo(4, -3); ctx.lineTo(4, 3); ctx.stroke();
    ctx.strokeStyle = '#3f8a3f'; ctx.lineWidth = 2.4; circ(19, 9, 4.5); ctx.stroke(); for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#f7a8d0', '#fff', '#ffe066'][i % 3]; circ(19 + Math.cos(i * 1.26) * 4.5, 9 + Math.sin(i * 1.26) * 4.5, 1.5); ctx.fill(); }   // a wreath
    ctx.restore();
  }
}
