'use strict';
// ---------- rendering ----------
let canvas, ctx, W = 960, H = 600, DPR = 1, PATHS = null, mapCanvas = null, boxCanvas = null, tartan = null;
const FONT = "'Bangers','Impact','Haettenschweiler','Arial Narrow Bold',sans-serif", MONO = "'Courier New',Courier,monospace";
const MS = 0.1, REDUCE_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);                                   // map canvas scale
const COL = { grass: '#69a94b', pave: '#bcb7ab', road: '#4f535b', street: '#565a62', lane: '#676a70', track: '#a8905f', water: '#3f8fc6', water2: '#4fa2d6', bank: '#cdbd8e', yellow: '#ffd21f' };
const vis = a => a.x < cam.x1 && a.x + a.w > cam.x0 && a.y < cam.y1 && a.y + a.h > cam.y0;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
function otext(t, x, y, size, fill, align, lw) { ctx.font = size + 'px ' + FONT; ctx.textAlign = align || 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = lw || Math.max(3, size * 0.16); ctx.strokeStyle = '#141414'; ctx.strokeText(t, x, y); ctx.fillStyle = fill; ctx.fillText(t, x, y); }
function wrap(text, maxW) { const words = text.split(' '), lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
function shade(hex, f) { const n = parseInt(hex.slice(1), 16), r = clamp(((n >> 16) & 255) * f, 0, 255) | 0, g = clamp(((n >> 8) & 255) * f, 0, 255) | 0, b = clamp((n & 255) * f, 0, 255) | 0; return 'rgb(' + r + ',' + g + ',' + b + ')'; }

function buildPaths() {
  const P = {};
  for (const t of ['main', 'street', 'lane', 'track']) { const p = new Path2D(); for (const e of EDGES) if (e.type === t) { p.moveTo(e.a.x, e.a.y); p.lineTo(e.b.x, e.b.y); } P[t] = p; }
  P.yellow = new Path2D(); P.bridge = new Path2D(); P.deck = new Path2D();
  for (const e of EDGES) {
    if (e.yellow) for (const s of [-1, 1]) { const o = (e.hw - 4) * s; P.yellow.moveTo(e.a.x + e.uy * o + e.ux * 60, e.a.y - e.ux * o + e.uy * 60); P.yellow.lineTo(e.b.x + e.uy * o - e.ux * 60, e.b.y - e.ux * o - e.uy * 60); }
    if (e.bridge) { for (const s of [-1, 1]) { const o = (e.hw + e.pave + 1) * s; P.bridge.moveTo(e.a.x + e.uy * o, e.a.y - e.ux * o); P.bridge.lineTo(e.b.x + e.uy * o, e.b.y - e.ux * o); } P.deck.moveTo(e.a.x, e.a.y); P.deck.lineTo(e.b.x, e.b.y); }
  }
  P.rivers = RIVERS.map(r => { const p = new Path2D(); r.pts.forEach((q, i) => i ? p.lineTo(q.x, q.y) : p.moveTo(q.x, q.y)); return p; });
  PATHS = P;
  // tartan tile for the title screen
  tartan = document.createElement('canvas'); tartan.width = tartan.height = 96; const t = tartan.getContext('2d');
  t.fillStyle = '#1d4f38'; t.fillRect(0, 0, 96, 96);
  const bands = [[0, 20, '#16324f', 0.75], [44, 8, '#b3261e', 0.7], [60, 14, '#16324f', 0.75], [84, 3, '#e8c74a', 0.8], [30, 3, '#f1ead6', 0.5]];
  for (const b of bands) { t.globalAlpha = b[3]; t.fillStyle = b[2]; t.fillRect(b[0], 0, b[1], 96); t.fillRect(0, b[0], 96, b[1]); }
  t.globalAlpha = 0.12; t.strokeStyle = '#000'; t.lineWidth = 1; for (let i = -96; i < 96; i += 4) { t.beginPath(); t.moveTo(i, 0); t.lineTo(i + 96, 96); t.stroke(); }
  buildMapCanvas();
}
function buildMapCanvas() {
  mapCanvas = document.createElement('canvas'); mapCanvas.width = WW * MS; mapCanvas.height = WH * MS;
  const m = mapCanvas.getContext('2d'); m.scale(MS, MS);
  m.fillStyle = '#7fb866'; m.fillRect(0, 0, WW, WH);
  for (const a of AREAS) { m.fillStyle = a.kind === 'field' ? (a.crop === 'barley' ? '#d6c56e' : a.crop === 'plough' ? '#98795a' : '#8cc66c') : a.kind === 'golf' ? '#9bd67e' : '#93d274'; m.fillRect(a.x, a.y, a.w, a.h); }
  m.fillStyle = '#4c8a48'; m.beginPath(); m.arc(SCOLTY.x, SCOLTY.y, SCOLTY.r, 0, TAU); m.fill(); m.fillStyle = '#8b6f9a'; m.beginPath(); m.arc(SCOLTY.x, SCOLTY.y, SCOLTY.r * 0.22, 0, TAU); m.fill();
  m.fillStyle = 'rgba(40,100,55,0.55)'; for (const t of TREES) { m.beginPath(); m.arc(t.x, t.y, t.r, 0, TAU); m.fill(); }
  m.lineCap = 'round'; m.lineJoin = 'round';
  RIVERS.forEach((r, i) => { m.strokeStyle = '#4b9bd6'; m.lineWidth = r.hw * 2; m.stroke(PATHS.rivers[i]); });
  m.fillStyle = '#8a8f96'; for (const h of HARD) m.fillRect(h.x, h.y, h.w, h.h);
  m.strokeStyle = '#3c4047'; m.lineWidth = 150; m.stroke(PATHS.main); m.lineWidth = 120; m.stroke(PATHS.street); m.lineWidth = 80; m.stroke(PATHS.lane);
  m.strokeStyle = '#f4efe0'; m.lineWidth = 100; m.stroke(PATHS.main); m.lineWidth = 76; m.stroke(PATHS.street); m.lineWidth = 44; m.stroke(PATHS.lane); m.strokeStyle = '#c9ab72'; m.lineWidth = 36; m.stroke(PATHS.track);
  for (const b of BUILDINGS) { m.fillStyle = b.lm ? '#c8322b' : b.house ? '#6f6a66' : '#55504c'; m.fillRect(b.x, b.y, b.w, b.h); }
}

// ---------- ground ----------
const ZEBRAS = [[2200, 1500, 0, 50], [2700, 1500, 0, 50], [3000, 1200, 1, 50], [3400, 1500, 0, 50], [2140, 1765, 0, 40]].map(z => ({ x: z[0] * S, y: z[1] * S, v: z[2], hw: z[3] }));
function drawGround() {
  const t = G.t;
  // Scolty: woodland up to a heathery top
  if (SCOLTY.x - SCOLTY.r < cam.x1 && SCOLTY.y - SCOLTY.r < cam.y1 && SCOLTY.x + SCOLTY.r > cam.x0 && SCOLTY.y + SCOLTY.r > cam.y0) {
    const rings = [[1, '#5d9d49'], [0.74, '#54914a'], [0.5, '#5c8c50'], [0.32, '#77905e'], [0.22, '#8b6f9a'], [0.11, '#a48bb3']];
    for (const r of rings) { ctx.fillStyle = r[1]; circ(SCOLTY.x, SCOLTY.y, SCOLTY.r * r[0]); ctx.fill(); }
  }
  for (const a of AREAS) {
    if (!vis(a)) continue;
    if (a.kind === 'field') {
      const c = a.crop === 'barley' ? ['#d8c66c', '#c9b65a'] : a.crop === 'plough' ? ['#97785a', '#86694d'] : ['#7fc05e', '#74b556'];
      ctx.fillStyle = c[0]; ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.strokeStyle = c[1]; ctx.lineWidth = a.crop === 'pasture' ? 2 : 5; ctx.beginPath();
      const st = a.crop === 'pasture' ? 44 : 20, y0 = Math.max(a.y, cam.y0 - ((cam.y0 - a.y) % st + st) % st), y1 = Math.min(a.y + a.h, cam.y1);
      for (let y = y0 + st / 2; y < y1; y += st) { ctx.moveTo(a.x + 6, y); ctx.lineTo(a.x + a.w - 6, y); }
      ctx.stroke();
      ctx.strokeStyle = '#2f6b3a'; ctx.lineWidth = 9; ctx.strokeRect(a.x, a.y, a.w, a.h);
    } else if (a.kind === 'park') {
      ctx.fillStyle = '#7fc862'; rr(a.x, a.y, a.w, a.h, 26); ctx.fill(); ctx.strokeStyle = '#5aa548'; ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = '#dccb9e'; ctx.lineWidth = 16; rr(a.x + 70, a.y + 70, a.w - 140, a.h - 140, 60); ctx.stroke();
      if (a.pitch) { const px = a.x + a.w * 0.3, py = a.y + a.h * 0.28, pw = a.w * 0.5, ph = a.h * 0.46; ctx.fillStyle = '#72ba58'; ctx.fillRect(px, py, pw, ph); drawPitchLines(px, py, pw, ph); }
      else {
        const b = SPOTS.spadeBed; ctx.fillStyle = '#6b4a2b'; ctx.beginPath(); ctx.ellipse(b.x, b.y, 44, 28, 0, 0, TAU); ctx.fill();
        const fl = ['#f25f5c', '#ffe066', '#f7a8d0', '#fff']; for (let i = 0; i < 14; i++) { ctx.fillStyle = fl[i % 4]; circ(b.x + Math.cos(i * 2.4) * (12 + (i * 7) % 26), b.y + Math.sin(i * 2.4) * (8 + (i * 5) % 16), 3.2); ctx.fill(); }
        const pg = M(2790, 1880); ctx.fillStyle = '#d98b4a'; rr(pg.x, pg.y, 150, 110, 12); ctx.fill();
        ctx.strokeStyle = '#3b6fb0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(pg.x + 20, pg.y + 22); ctx.lineTo(pg.x + 90, pg.y + 22); ctx.stroke(); ctx.fillStyle = '#222'; ctx.fillRect(pg.x + 32, pg.y + 16, 12, 12); ctx.fillRect(pg.x + 66, pg.y + 16, 12, 12);
        ctx.fillStyle = '#c8322b'; circ(pg.x + 108, pg.y + 74, 22); ctx.fill(); ctx.strokeStyle = '#ffd21f'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 3; i++) { const an = t * 0.8 + i * TAU / 6; ctx.moveTo(pg.x + 108 - Math.cos(an) * 22, pg.y + 74 - Math.sin(an) * 22); ctx.lineTo(pg.x + 108 + Math.cos(an) * 22, pg.y + 74 + Math.sin(an) * 22); } ctx.stroke();
        const bs = M(3060, 2110); ctx.fillStyle = '#e9e3d3'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i * TAU / 8 + 0.39; ctx.lineTo(bs.x + Math.cos(an) * 46, bs.y + Math.sin(an) * 46); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#9c5540'; ctx.lineWidth = 4; ctx.stroke();
      }
    } else if (a.kind === 'golf') { ctx.fillStyle = '#62ad4c'; rr(a.x, a.y, a.w, a.h, 40); ctx.fill();
    } else if (a.kind === 'pitch') { ctx.fillStyle = '#72ba58'; ctx.fillRect(a.x, a.y, a.w, a.h); drawPitchLines(a.x + 30, a.y + 30, a.w - 60, a.h - 60); }
  }
  drawGolf();
  // gardens
  ctx.lineWidth = 3; ctx.strokeStyle = '#3f8a3f';
  for (const p of PLOTS) if (vis(p)) { ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.strokeRect(p.x, p.y, p.w, p.h); }
  // rivers
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  RIVERS.forEach((r, i) => { ctx.strokeStyle = COL.bank; ctx.lineWidth = r.hw * 2 + 30; ctx.stroke(PATHS.rivers[i]); });
  RIVERS.forEach((r, i) => {
    const p = PATHS.rivers[i];
    ctx.strokeStyle = COL.water; ctx.lineWidth = r.hw * 2; ctx.stroke(p); ctx.strokeStyle = COL.water2; ctx.lineWidth = r.hw * 1.3; ctx.stroke(p);
    ctx.lineCap = 'butt'; ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = r.hw * 1.5; ctx.setLineDash([5, 150]); ctx.lineDashOffset = -t * 46; ctx.stroke(p);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.setLineDash([26, 110]); ctx.lineDashOffset = -t * 60; ctx.stroke(p);
    ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.lineCap = 'round';
  });
  drawFalls(); drawJetty();
  // tarmac yards and car parks
  for (const h of HARD) {
    if (!vis(h)) continue;
    ctx.fillStyle = h.kind === 'play' ? '#7d828b' : h.kind === 'carpark' ? '#5c6068' : h.kind === 'square' ? '#c9c2b4' : '#6c6f75'; ctx.fillRect(h.x, h.y, h.w, h.h);
    if (h.kind === 'square') { ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let x = h.x + 24; x < h.x + h.w; x += 24) { ctx.moveTo(x, h.y); ctx.lineTo(x, h.y + h.h); } for (let y = h.y + 24; y < h.y + h.h; y += 24) { ctx.moveTo(h.x, y); ctx.lineTo(h.x + h.w, y); } ctx.stroke(); }
    if (h.kind === 'carpark') { ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= h.bays; i++) { const x = h.bx0 + i * 38; ctx.moveTo(x, h.y + 3); ctx.lineTo(x, h.y + 58); ctx.moveTo(x, h.y + h.h - 58); ctx.lineTo(x, h.y + h.h - 3); } ctx.stroke(); }
    if (h.kind === 'play') {
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) ctx.strokeRect(h.x + 40 + i * 24, h.y + 40 + (i % 2) * 12, 22, 22);
      ctx.strokeStyle = '#fff'; circ(h.x + h.w - 90, h.y + h.h - 70, 44); ctx.stroke(); ctx.strokeStyle = '#ff8f6b'; circ(h.x + 110, h.y + h.h - 60, 30); ctx.stroke();
    }
  }
  // roads: pavements first, then tarmac, then paint
  ctx.setLineDash([]); ctx.lineDashOffset = 0;
  ctx.strokeStyle = COL.pave; ctx.lineWidth = 128; ctx.stroke(PATHS.main); ctx.lineWidth = 104; ctx.stroke(PATHS.street);
  ctx.strokeStyle = '#8f7a52'; ctx.lineWidth = 46; ctx.stroke(PATHS.track); ctx.strokeStyle = COL.track; ctx.lineWidth = 38; ctx.stroke(PATHS.track);
  ctx.strokeStyle = '#7b7e84'; ctx.lineWidth = 60; ctx.stroke(PATHS.lane);
  ctx.strokeStyle = COL.lane; ctx.lineWidth = 54; ctx.stroke(PATHS.lane);
  ctx.strokeStyle = COL.street; ctx.lineWidth = 80; ctx.stroke(PATHS.street);
  ctx.strokeStyle = COL.road; ctx.lineWidth = 100; ctx.stroke(PATHS.main);
  ctx.strokeStyle = '#8fb062'; ctx.lineWidth = 5; ctx.setLineDash([14, 22]); ctx.stroke(PATHS.track);
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.setLineDash([20, 24]); ctx.stroke(PATHS.main); ctx.stroke(PATHS.street); ctx.setLineDash([]);
  ctx.strokeStyle = '#e7c53a'; ctx.lineWidth = 2.5; ctx.stroke(PATHS.yellow);
  ctx.strokeStyle = 'rgba(160,150,130,0.35)'; ctx.lineWidth = 80; ctx.stroke(PATHS.deck);
  ctx.strokeStyle = '#8c8578'; ctx.lineWidth = 8; ctx.stroke(PATHS.bridge); ctx.strokeStyle = '#a9a294'; ctx.lineWidth = 3; ctx.stroke(PATHS.bridge);
  ctx.lineCap = 'round';
  for (const z of ZEBRAS) {
    if (z.x < cam.x0 - 80 || z.x > cam.x1 + 80 || z.y < cam.y0 - 80 || z.y > cam.y1 + 80) continue;
    ctx.fillStyle = '#f1f1ec'; const hw = z.hw;
    for (let o = -hw + 5; o < hw - 4; o += 16) { if (z.v) ctx.fillRect(z.x + o, z.y - 15, 8, 30); else ctx.fillRect(z.x - 15, z.y + o, 30, 8); }
    ctx.fillStyle = Math.sin(t * 5) > 0 ? '#ffb020' : '#b87400'; for (const s of [-1, 1]) { if (z.v) circ(z.x + (hw + 7) * s, z.y - 20 * s, 4.5); else circ(z.x - 20 * s, z.y + (hw + 8) * s, 4.5); ctx.fill(); }
  }
}
