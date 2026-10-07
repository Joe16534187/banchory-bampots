'use strict';
function drawBoxOverlay() {
  if (!boxCanvas) boxCanvas = document.createElement('canvas');
  if (boxCanvas.width !== canvas.width || boxCanvas.height !== canvas.height) { boxCanvas.width = canvas.width; boxCanvas.height = canvas.height; }
  const o = boxCanvas.getContext('2d'), P = player, s = toScreen(P.x, P.y), t = G.t;
  o.setTransform(DPR, 0, 0, DPR, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1;
  o.fillStyle = '#b98a54'; o.fillRect(0, 0, W, H);
  o.strokeStyle = 'rgba(90,60,25,0.22)'; o.lineWidth = 2; o.beginPath(); for (let x = -H; x < W; x += 9) { o.moveTo(x, 0); o.lineTo(x + H * 0.08, H); } o.stroke();
  o.fillStyle = 'rgba(230,211,168,0.75)'; o.fillRect(0, H * 0.16, W, 46); o.fillStyle = 'rgba(90,60,25,0.7)'; o.font = '30px ' + FONT; o.textAlign = 'left'; o.fillText('THIS WAY UP', 30, H * 0.16 + 34); o.textAlign = 'right'; o.fillText('FRAGILE: 48 CONES', W - 30, H * 0.16 + 34);
  // the hand-hole you are peering through
  const R = clamp(Math.min(W, H) * 0.34, 150, 300), a = P.a + Math.sin(t * 9) * 0.03 * (P.moving ? 1 : 0), half = 0.5, wob = P.moving ? Math.sin(t * 13) * 5 : 0;
  o.globalCompositeOperation = 'destination-out';
  const g = o.createRadialGradient(s.x, s.y, R * 0.55, s.x, s.y, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  o.fillStyle = g; o.beginPath(); o.moveTo(s.x, s.y + wob); o.arc(s.x, s.y + wob, R, a - half, a + half); o.closePath(); o.fill();
  o.fillStyle = '#000'; o.beginPath(); o.arc(s.x, s.y, 30, 0, TAU); o.fill();
  o.globalCompositeOperation = 'source-over';
  o.strokeStyle = 'rgba(70,45,15,0.6)'; o.lineWidth = 5; o.beginPath(); o.moveTo(s.x + Math.cos(a - half) * 30, s.y + wob + Math.sin(a - half) * 30); o.lineTo(s.x + Math.cos(a - half) * R * 0.8, s.y + wob + Math.sin(a - half) * R * 0.8); o.moveTo(s.x + Math.cos(a + half) * 30, s.y + wob + Math.sin(a + half) * 30); o.lineTo(s.x + Math.cos(a + half) * R * 0.8, s.y + wob + Math.sin(a + half) * R * 0.8); o.stroke();
  ctx.drawImage(boxCanvas, 0, 0, W, H);
}
function drawControls(x, y, size) {
  const rows = [['Arrows / WASD', 'Walk, or drive (up is go, down is brake)'], ['Enter / E', 'Get in or oot of a motor'], ['Space', 'Handbrake in a motor. Use your weapon on foot'], ['Q or 1 to 5', 'Switch weapon'], ['Shift', 'Nitro, if you ever find the Pzazz'], ['H', 'Horn (jingle in the ice cream van)'], ['M', 'Map'], ['P', 'Pause'], ['N', 'Sound on or off']];
  rows.forEach((r, i) => { otext(r[0], x - 12, y + i * size * 1.5, size, COL.yellow, 'right', 3.5); otext(r[1], x + 12, y + i * size * 1.5, size, '#f4efe0', 'left', 3.5); });
}
function drawTitle() {
  const t = G.t, g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(10,20,14,0.8)'); g.addColorStop(0.5, 'rgba(10,20,14,0.5)'); g.addColorStop(1, 'rgba(10,20,14,0.88)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.font = '100px ' + FONT; const size = Math.min(W * 0.88 / ctx.measureText('BANCHORY BAMPOTS').width * 100, H / 5.2, 130), by = H * 0.27;
  ctx.save(); ctx.translate(W / 2, by); ctx.rotate(-0.035);
  ctx.fillStyle = ctx.createPattern(tartan, 'repeat'); ctx.fillRect(-W, -size * 0.78, W * 2, size * 1.3); ctx.fillStyle = '#141414'; ctx.fillRect(-W, -size * 0.78 - 6, W * 2, 6); ctx.fillRect(-W, size * 0.52, W * 2, 6);
  ctx.font = size + 'px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = '#b3261e'; ctx.fillText('BANCHORY BAMPOTS', 6, size * 0.3 + 7); otext('BANCHORY BAMPOTS', 0, size * 0.3, size, COL.yellow, 'center', size * 0.12);
  ctx.restore();
  otext('A wee crime caper on Royal Deeside', W / 2, by + size * 0.95 + 16, clamp(size * 0.3, 18, 34), '#f4efe0');
  const cs = clamp(H / 46, 13, 20); drawControls(W / 2 - Math.min(W * 0.14, 120), H * 0.5, cs);
  if (Math.sin(t * 4) > -0.3) otext('Press Enter to start', W / 2, H * 0.5 + cs * 1.5 * 9 + 30, clamp(size * 0.42, 24, 46), '#8dff6b');
  otext('Click the game once if the keys do nothing. Answer a ringing phone box for a job.', W / 2, H - 22, clamp(cs * 0.95, 13, 18), '#cfd8c8', 'center', 3);
}
function drawPause() {
  ctx.fillStyle = 'rgba(10,20,14,0.8)'; ctx.fillRect(0, 0, W, H);
  otext('PAUSED', W / 2, H * 0.2, Math.min(90, W / 8), COL.yellow);
  const cs = clamp(H / 44, 13, 20); drawControls(W / 2 - Math.min(W * 0.14, 120), H * 0.3, cs);
  const y = H * 0.3 + cs * 1.5 * 9 + 20, jobs = MISSIONS.filter(d => G.done[d.id]).length;
  otext('Jobs done ' + jobs + ' of ' + MISSIONS.length + '      Golden rowies ' + Object.keys(G.rowies).length + ' of ' + ROWIES.length, W / 2, y, cs * 1.2, '#8dff6b');
  otext('R: put me back on the nearest road      X twice: wipe saved progress', W / 2, y + cs * 2, cs, '#f4efe0');
  otext('Press P or Enter to carry on', W / 2, y + cs * 4.4, cs * 1.4, '#fff');
}
function drawMap() {
  ctx.fillStyle = 'rgba(10,20,14,0.92)'; ctx.fillRect(0, 0, W, H);
  const k = Math.min((W - 40) / WW, (H - 110) / WH), mw = WW * k, mh = WH * k, mx = (W - mw) / 2, my = 64, P = player;
  otext('Banchory', mx, 46, 40, COL.yellow, 'left'); otext('M to close', mx + mw, 46, 20, '#f4efe0', 'right', 3.5);
  ctx.imageSmoothingEnabled = true; ctx.drawImage(mapCanvas, mx, my, mw, mh); ctx.strokeStyle = '#141414'; ctx.lineWidth = 4; ctx.strokeRect(mx, my, mw, mh);
  const fs = clamp(W / 80, 10, 15);
  const lo = { burnett: [-6, -16], stag: [26, 20], douglas: [-36, 20], cc: [-58, 26], polis: [-10, 22], kirk: [-52, -12], feugh: [84, -24], health: [44, -10], lodge: [56, 10], golf: [-10, 22], tower: [0, 22], skinner: [0, -14], garage: [20, 22], scout: [-50, 8], tor: [0, -14], academy: [42, -16], primary: [-62, -28], shop: [0, -14], barn: [0, -12], farm: [30, 18], turkey: [0, -12] };
  ctx.strokeStyle = 'rgba(20,20,20,0.7)'; ctx.lineWidth = 1.5;
  for (const key in LM) { const b = LM[key], o = lo[key] || [0, -3], bx = mx + (b.x + b.w / 2) * k, byy = my + (b.y + b.h / 2) * k; if (lo[key]) { ctx.beginPath(); ctx.moveTo(bx, byy); ctx.lineTo(bx + o[0] * 0.6, byy + o[1] * 0.6); ctx.stroke(); } otext(b.lm, bx + o[0], byy + o[1] + (o[1] >= 0 ? fs * 0.4 : -2), fs, '#fff', 'center', 3); }
  for (const l of MAP_LABELS) otext(l.name, mx + l.x * k, my + l.y * k, fs * 1.1, l.name.startsWith('To ') ? '#ffd9a0' : '#d8f0c8', 'center', 3);
  for (const d of MISSIONS) { const x = mx + d.phone.x * k, y = my + d.phone.y * k; ctx.fillStyle = G.done[d.id] ? '#9fe08a' : COL.yellow; ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; circ(x, y, 7); ctx.fill(); ctx.stroke(); }
  for (const p of pickups) if (p.type === 'rowie' && p.gone) { ctx.fillStyle = '#e7ae4e'; circ(mx + p.x * k, my + p.y * k, 3.5); ctx.fill(); }
  const tg = targetPos(); if (tg) { ctx.fillStyle = '#ff4fa3'; ctx.strokeStyle = '#141414'; circ(mx + tg.x * k, my + tg.y * k, 7 + Math.sin(G.t * 6) * 2); ctx.fill(); ctx.stroke(); }
  ctx.save(); ctx.translate(mx + P.x * k, my + P.y * k); ctx.rotate(P.a); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#141414'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -8); ctx.lineTo(-4, 0); ctx.lineTo(-8, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  const ly = my + mh + 26; ctx.fillStyle = COL.yellow; circ(mx + 8, ly - 5, 6); ctx.fill(); otext('Phone box with a job', mx + 22, ly, 16, '#f4efe0', 'left', 3);
  ctx.fillStyle = '#9fe08a'; circ(mx + 208, ly - 5, 6); ctx.fill(); otext('Job done', mx + 222, ly, 16, '#f4efe0', 'left', 3);
  ctx.fillStyle = '#e7ae4e'; circ(mx + 318, ly - 5, 4); ctx.fill(); otext('Rowie found (' + Object.keys(G.rowies).length + '/' + ROWIES.length + ')', mx + 330, ly, 16, '#f4efe0', 'left', 3);
}
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = COL.grass; ctx.fillRect(0, 0, W, H);
  const z = cam.z, sk = REDUCE_MOTION ? 0 : G.shake, sx = (Math.random() - 0.5) * sk, sy = (Math.random() - 0.5) * sk;
  ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - cam.x * z + sx), DPR * (H / 2 - cam.y * z + sy));
  drawWorld();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (G.state === 'title') { drawTitle(); return; }
  if (player.box) drawBoxOverlay();
  drawBubbles(); drawHUD();
  if (G.state === 'pause') drawPause(); else if (G.state === 'map') drawMap();
}
