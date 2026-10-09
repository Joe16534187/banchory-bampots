'use strict';
function drawPerson(p) {
  const isP = p.isPlayer, sheep = p.kind === 'sheep';
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(2 + p.z * 0.12, 3 + p.z * 0.12, 7.5, 6, 0, 0, TAU); ctx.fill();
  if (isP && !p.box && G.state === 'play') { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; circ(0, 0, 12); ctx.stroke(); }
  if (isP && p.inv > 0 && Math.sin(G.t * 30) > 0) ctx.globalAlpha = 0.45;
  const fly = p.z > 0, down = isP ? (p.knock > 0 && !fly) : p.state === 'down';
  if (fly) { const s = 1 + p.z * 0.006; ctx.scale(s, s); }
  ctx.rotate(p.a + (fly || down ? p.rot : 0));
  if (p.kind === 'cow') { drawCow(p, down || fly); ctx.restore(); return; }
  if (p.kind === 'pig') { drawPig(down || fly, p.walk); ctx.restore(); return; }
  if (p.kind === 'turkey') {
    if (down || fly) { ctx.strokeStyle = '#e8b54a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-1, -3); ctx.lineTo(-1, -10); ctx.moveTo(3, 3); ctx.lineTo(3, 10); ctx.stroke(); }
    ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(-1, 0, 10, Math.PI * 0.55, Math.PI * 1.45); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-1, 0, 8.6, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-1, 0, 6, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke();
    ctx.fillStyle = '#3d2a1a'; ctx.beginPath(); ctx.ellipse(1.5, 0, 6, 5, 0, 0, TAU); ctx.fill();
    const nod = Math.sin(p.walk * 2) * 0.8; ctx.fillStyle = '#7fa7c9'; circ(7.5 + nod, 0, 2.4); ctx.fill(); ctx.fillStyle = '#d9261c'; circ(8.6 + nod, 1.6, 1.6); ctx.fill(); ctx.fillStyle = '#e8b54a'; ctx.fillRect(9.4 + nod, -0.9, 2.6, 1.5);
    ctx.restore(); return;
  }
  if (sheep) {
    if (down || fly) { ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); for (const q of [[-5, -8], [3, -8], [-5, 8], [3, 8]]) { ctx.moveTo(q[0], q[1] * 0.5); ctx.lineTo(q[0], q[1] * 1.3); } ctx.stroke(); }
    ctx.fillStyle = '#f3f1ea'; for (const q of [[-5, 0, 6.5], [0, -1.5, 6.5], [0, 1.5, 6.5], [4, 0, 6]]) { circ(q[0], q[1], q[2]); ctx.fill(); }
    ctx.fillStyle = '#26262a'; ctx.beginPath(); ctx.ellipse(9.5, 0, 4, 3.2, 0, 0, TAU); ctx.fill(); ctx.fillRect(7, -5, 2.5, 3); ctx.fillRect(7, 2, 2.5, 3);
    ctx.restore(); return;
  }
  if (down || fly) {
    ctx.lineCap = 'round'; ctx.strokeStyle = p.legs || '#2d3a55'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(-11, -6); ctx.moveTo(-3, 2); ctx.lineTo(-11, 5); ctx.stroke();
    ctx.strokeStyle = p.shirt; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(5, -11); ctx.moveTo(2, 4); ctx.lineTo(5, 11); ctx.stroke();
    ctx.fillStyle = p.shirt; ctx.beginPath(); ctx.ellipse(0, 0, 7, 5.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = p.skin; circ(8, 0, 4.5); ctx.fill(); ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(8, 0, 4.6, -0.6, 0.6, true); ctx.fill();
  } else {
    const mv = isP ? (p.moving ? 1 : 0) : (p.state === 'walk' || p.state === 'wander' ? 1 : 0), s = Math.sin(p.walk) * mv;
    ctx.fillStyle = '#1e1e22'; ctx.beginPath(); ctx.ellipse(s * 4.2, -3.4, 3.4, 2.3, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-s * 4.2, 3.4, 3.4, 2.3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = p.skin; if (isP && p.shove > 0) { circ(7, -4.5, 2.4); ctx.fill(); circ(7, 4.5, 2.4); ctx.fill(); } else { circ(-s * 3.6, -7.6, 2.3); ctx.fill(); circ(s * 3.6, 7.6, 2.3); ctx.fill(); }
    ctx.fillStyle = p.shirt; ctx.beginPath(); ctx.ellipse(0, 0, 4.8, 7.8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1; ctx.stroke();
    if (isP) { ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-1, -7, 2, 14); }
    if (p.hiker) { ctx.fillStyle = p.hatCol === '#b22' ? '#2f6b4a' : '#b5482a'; rr(-9, -5, 6, 10, 2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.strokeStyle = '#444'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-s * 3.6, -7.6); ctx.lineTo(-s * 3.6 + 7, -9.5); ctx.moveTo(s * 3.6, 7.6); ctx.lineTo(s * 3.6 + 7, 9.5); ctx.stroke(); }
    if (p.bat) { ctx.fillStyle = '#d9b97a'; ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 0.8; ctx.fillRect(2 + s * 2, 7, 13, 3.2); ctx.strokeRect(2 + s * 2, 7, 13, 3.2); }
    if (p.dealer) { ctx.fillStyle = '#3a3229'; ctx.beginPath(); ctx.ellipse(-1.5, 0, 5.6, 9, 0, 0, TAU); ctx.fill(); }             // a long coat with deep pockets
    if (isP && p.armour > 0) { ctx.strokeStyle = '#b08d57'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(0, 0, 4.8, 7.8, 0, 0, TAU); ctx.stroke(); }
    if (isP && p.carrying === 'spade') drawSpade(2, 10, 0.1, 1);
    else if (isP && p.carrying === 'pig') { ctx.save(); ctx.translate(7.5, 5); ctx.rotate(0.35 + Math.sin(G.t * 9) * 0.12); ctx.scale(0.92, 0.92); drawPig(false, G.t * 14); ctx.restore(); }
    else if (isP && p.weapon !== 'fist') { ctx.save(); ctx.translate(p.shove > 0 ? 13 : 7, p.shove > 0 ? 3 : 8.5); ctx.rotate(p.shove > 0 ? -0.5 : 0); ctx.scale(0.8, 0.8); drawWeaponIcon(p.weapon); ctx.restore(); }
    ctx.fillStyle = p.skin; circ(1.2, 0, 4.5); ctx.fill(); ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(0.8, 0, 4.7, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
    if (p.hat === 1) { ctx.fillStyle = p.hatCol; circ(0.8, 0, 4.9); ctx.fill(); ctx.beginPath(); ctx.ellipse(4.6, 0, 2.6, 3.8, 0, 0, TAU); ctx.fill(); }
    else if (p.hat === 2) { ctx.fillStyle = p.hatCol; circ(0.8, 0, 4.9); ctx.fill(); ctx.fillStyle = '#f4f4f4'; circ(0.8, 0, 1.9); ctx.fill(); }
    if (p.robe) drawRobe(p);
    if (p.kind === 'stag' || p.antlers) { ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 1.8; ctx.beginPath(); for (const q of [-1, 1]) { ctx.moveTo(1, 3.5 * q); ctx.lineTo(3, 9 * q); ctx.lineTo(7, 10.5 * q); ctx.moveTo(3, 9 * q); ctx.lineTo(0, 12 * q); } ctx.stroke(); }
    if (isP && p.box) { ctx.fillStyle = '#b98a54'; ctx.strokeStyle = '#7d5a30'; ctx.lineWidth = 1.2; ctx.fillRect(-6, -7.5, 14, 15); ctx.strokeRect(-6, -7.5, 14, 15); ctx.beginPath(); ctx.moveTo(1, -7.5); ctx.lineTo(1, 7.5); ctx.stroke(); ctx.fillStyle = '#e6d3a8'; ctx.fillRect(-1, -7.5, 4, 15); ctx.fillStyle = '#222'; ctx.fillRect(6, -3, 2, 6); }
  }
  ctx.restore();
  if (down && !isP || (isP && down)) { ctx.fillStyle = '#ffe14a'; for (let i = 0; i < 3; i++) { const an = G.t * 5 + i * 2.09; star(p.x + Math.cos(an) * 11, p.y - 4 + Math.sin(an) * 5, 3.2); } }
}
function drawWeaponIcon(k) {
  switch (k) {
    case 'fist': ctx.fillStyle = '#f1c9a5'; circ(0, 0, 5); ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 1; ctx.stroke(); break;
    case 'haddock': ctx.fillStyle = '#9fb4c2'; ctx.strokeStyle = '#4d5f6b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-15, -5); ctx.lineTo(-15, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 10, 4.2, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e8f0f4'; ctx.beginPath(); ctx.ellipse(1, 1.3, 6, 1.7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#141414'; circ(6.5, -1, 1); ctx.fill(); break;
    case 'tattie': ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-12, -2.5, 9, 6.5); ctx.fillStyle = '#7d858c'; ctx.fillRect(-4, -2.2, 15, 4.4); ctx.strokeStyle = '#141414'; ctx.lineWidth = 0.8; ctx.strokeRect(-4, -2.2, 15, 4.4);
      ctx.fillStyle = '#c9a567'; ctx.beginPath(); ctx.ellipse(12, 0, 3.4, 2.8, 0, 0, TAU); ctx.fill(); break;
    case 'haggis': ctx.fillStyle = '#e8dcc0'; ctx.fillRect(-12.5, -1.5, 4, 3); ctx.fillRect(8.5, -1.5, 4, 3); ctx.fillStyle = '#8a5a3a'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a2f1c'; ctx.lineWidth = 1; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(-1, -1, 5, 3.6, 5); ctx.stroke(); break;
    case 'rocket': ctx.fillStyle = '#c8322b'; ctx.beginPath(); ctx.moveTo(-9, -3.5); ctx.lineTo(-14, -6.5); ctx.lineTo(-11, 0); ctx.lineTo(-14, 6.5); ctx.lineTo(-9, 3.5); ctx.fill();
      ctx.fillStyle = '#f0791a'; rr(-9, -3.5, 16, 7, 3); ctx.fill(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-3, -3.4, 5, 6.8); ctx.fillStyle = '#2b62a8'; ctx.fillRect(7, -2, 5, 4); break;
  }
}
function star(x, y, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const an = i * Math.PI / 5 - Math.PI / 2, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(an) * rr2, y + Math.sin(an) * rr2); } ctx.closePath(); ctx.fill(); }
function heart(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.9); ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.35); ctx.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9); ctx.closePath(); }
function drawCar(c) {
  const sp = c.sp, L = sp.len, Wd = sp.w, h = Wd / 2, type = c.type, t = G.t;
  ctx.save(); ctx.translate(c.x, c.y);
  if (c.sink > 0) { const s = 1 - c.sink * 0.45; ctx.globalAlpha = Math.max(0, 1 - c.sink); ctx.scale(s, s); ctx.rotate(c.sink * 0.8); }
  ctx.rotate(c.a);
  if (type === 'dinghy') {
    roadDist(c.x, c.y); if (_rb) { ctx.restore(); return; }                           // out of sight under a bridge
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(-3, 0, L / 2 + 5 + Math.sin(t * 3) * 1.5, h + 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c9561a'; rr(-L / 2, -h, L, Wd, 9); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#f0791a'; rr(-L / 2 + 1.5, -h + 1.5, L - 3, Wd - 3, 8); ctx.fill(); ctx.fillStyle = '#4d5760'; rr(-L / 2 + 6, -h + 5, L - 13, Wd - 10, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); rr(-L / 2 + 3.5, -h + 3, L - 7, Wd - 6, 6); ctx.stroke(); ctx.setLineDash([]);
    if (c.driver) {
      const sw = Math.sin(c.paddle || 0) * 7; ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -h + 2); ctx.lineTo(3 + sw, -h - 11); ctx.moveTo(0, h - 2); ctx.lineTo(3 - sw, h + 11); ctx.stroke();
      ctx.fillStyle = '#c9a567'; ctx.beginPath(); ctx.ellipse(3 + sw, -h - 12, 3, 4.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(3 - sw, h + 12, 3, 4.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffd21f'; ctx.beginPath(); ctx.ellipse(-2, 0, 4.6, 7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#f1c9a5'; circ(-1, 0, 4.2); ctx.fill(); ctx.fillStyle = '#3a2a1c'; ctx.beginPath(); ctx.arc(-1.4, 0, 4.4, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
    }
    ctx.restore(); return;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.26)'; rr(-L / 2 + 3, -h + 4, L, Wd, 5); ctx.fill();
  if (type === 'tractor') {
    ctx.fillStyle = '#17181b'; rr(-L / 2, -h, 20, 9, 3); ctx.fill(); rr(-L / 2, h - 9, 20, 9, 3); ctx.fill(); ctx.fillRect(L / 2 - 12, -h + 3, 10, 5); ctx.fillRect(L / 2 - 12, h - 8, 10, 5);
    ctx.fillStyle = c.col; rr(-L / 2 + 6, -7, L - 8, 14, 3); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#2a3440'; rr(-L / 2 + 6, -9, 17, 18, 3); ctx.fill(); ctx.fillStyle = shade(c.col, 1.15); ctx.fillRect(-L / 2 + 9, -6.5, 11, 13);
    ctx.fillStyle = '#333'; circ(L / 2 - 16, 5, 2.2); ctx.fill(); ctx.fillStyle = '#fff6c2'; ctx.fillRect(L / 2 - 3, -6, 2.5, 3); ctx.fillRect(L / 2 - 3, 3, 2.5, 3);
    ctx.restore(); return;
  }
  if (type === 'tank') { drawTank(c, L, Wd, h); ctx.restore(); return; }
  // wheels
  ctx.fillStyle = '#17181b'; const wx = L * 0.3; for (const a of [-wx, wx]) { ctx.fillRect(a - 5, -h - 1.2, 10, 4); ctx.fillRect(a - 5, h - 2.8, 10, 4); }
  const boxy = type === 'van' || type === 'icevan' || type === 'bus' || type === 'polvan', rad = boxy ? 4 : type === 'buggy' || type === 'jeep' ? 5 : 7;
  ctx.fillStyle = c.col; rr(-L / 2, -h, L, Wd, rad); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
  if (c.tartan) drawTartan(L, Wd, h, rad);
  const glass = '#27323f';
  if (type === 'buggy') {
    ctx.fillStyle = '#3d4852'; ctx.fillRect(-4, -h + 2.5, 8, Wd - 5); ctx.fillStyle = '#efe9d8'; rr(-L / 2 + 6, -h + 1.5, L - 13, Wd - 3, 3); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();
    ctx.fillStyle = '#3d6b4a'; ctx.fillRect(-L / 2 + 1, -5, 5, 4.5); ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-L / 2 + 1, 0.5, 5, 4.5);
  } else if (type === 'polvan') { drawPolvan(c, L, Wd, h, glass);
  } else if (type === 'jeep') { drawJeep(c, L, Wd, h);
  } else if (type === 'bus') {
    ctx.fillStyle = '#2b62a8'; ctx.fillRect(-L / 2 + 2, -h + 1, L - 6, 3); ctx.fillRect(-L / 2 + 2, h - 4, L - 6, 3);
    ctx.fillStyle = glass; ctx.fillRect(L / 2 - 9, -h + 3, 5, Wd - 6); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 4; i++) ctx.fillRect(-L / 2 + 8 + i * 17, -h + 6, 13, Wd - 12);
    ctx.save(); ctx.translate(L / 2 - 18, 0); ctx.rotate(Math.PI / 2); ctx.fillStyle = '#2b62a8'; ctx.font = 'bold 9px Arial,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('201', 0, 3); ctx.restore();
  } else if (type === 'van' || type === 'icevan') {
    ctx.fillStyle = glass; ctx.beginPath(); ctx.moveTo(L / 2 - 12, -h + 2.5); ctx.lineTo(L / 2 - 6, -h + 4); ctx.lineTo(L / 2 - 6, h - 4); ctx.lineTo(L / 2 - 12, h - 2.5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L / 2 - 15, -h + 1); ctx.lineTo(L / 2 - 15, h - 1); ctx.stroke();
    if (type === 'icevan') {
      ctx.fillStyle = '#f08fb0'; ctx.fillRect(-L / 2 + 2, -h + 1, L - 20, 3.5); ctx.fillRect(-L / 2 + 2, h - 4.5, L - 20, 3.5);
      ctx.fillStyle = '#d99a4a'; circ(-6, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; circ(-6, 0, 5.4); ctx.fill(); ctx.strokeStyle = '#f08fb0'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-6, 0, 3, t * 3, t * 3 + 4.4); ctx.stroke(); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(-5, -4, 5, 1.6);
    } else { ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.strokeRect(-L / 2 + 4, -h + 4, L - 22, Wd - 8); }
  } else {
    const hatch = type === 'hatch' || type === 'fourby' || type === 'racer', f0 = L * 0.1, f1 = L * 0.25, r1 = hatch ? -L * 0.42 : -L * 0.34, r0 = hatch ? -L * 0.33 : -L * 0.24;
    if (type === 'pickup') { ctx.fillStyle = shade(c.col, 0.6); ctx.fillRect(-L / 2 + 3, -h + 3, L * 0.42, Wd - 6); if (c.id % 3 === 0) { ctx.fillStyle = '#dcbb4c'; circ(-L / 2 + 13, 0, 7); ctx.fill(); } else if (c.id % 3 === 1) { ctx.fillStyle = '#f3f1ea'; circ(-L / 2 + 12, 0, 5.5); ctx.fill(); ctx.fillStyle = '#26262a'; circ(-L / 2 + 17.5, 0, 2.6); ctx.fill(); } }
    ctx.fillStyle = glass; ctx.beginPath(); ctx.moveTo(f0, -h + 2.5); ctx.lineTo(f1, -h + 4.2); ctx.lineTo(f1, h - 4.2); ctx.lineTo(f0, h - 2.5); ctx.fill();
    if (type !== 'pickup') { ctx.beginPath(); ctx.moveTo(r1, -h + 4.2); ctx.lineTo(r0, -h + 2.5); ctx.lineTo(r0, h - 2.5); ctx.lineTo(r1, h - 4.2); ctx.fill(); ctx.fillRect(r0, -h + 1.6, f0 - r0, 2); ctx.fillRect(r0, h - 3.6, f0 - r0, 2); }
    else { ctx.fillRect(-L * 0.08, -h + 1.6, f0 + L * 0.08, 2); ctx.fillRect(-L * 0.08, h - 3.6, f0 + L * 0.08, 2); }
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(type === 'pickup' ? -L * 0.07 : r0 + 1, -h + 4.4, (type === 'pickup' ? L * 0.16 : f0 - r0 - 2), Wd - 8.8);
    if (type === 'pzazz') { ctx.fillStyle = '#ffd21f'; ctx.fillRect(-L * 0.3, -h + 0.5, L * 0.6, 1.8); ctx.fillRect(-L * 0.3, h - 2.3, L * 0.6, 1.8); star(L * 0.37, 0, 4.6); ctx.fillStyle = '#fff'; star(-L * 0.42, 0, 2.8); ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.35 * Math.sin(t * 6 + c.id)) + ')'; star(-L * 0.05, 0, 3.4);
      if (c.boost) { ctx.fillStyle = '#5ad1ff'; ctx.beginPath(); ctx.moveTo(-L / 2, -4); ctx.lineTo(-L / 2 - 14 - Math.random() * 8, 0); ctx.lineTo(-L / 2, 4); ctx.fill(); } }
    if (type === 'racer') { ctx.fillStyle = '#141414'; ctx.fillRect(-L / 2 - 1.5, -h + 1, 3.5, Wd - 2); ctx.fillStyle = 'rgba(20,20,20,0.85)'; ctx.fillRect(f1 + 1, -3.4, L / 2 - f1 - 2, 2.2); ctx.fillRect(f1 + 1, 1.2, L / 2 - f1 - 2, 2.2); ctx.fillStyle = '#fff'; circ(L * 0.36, 0, 2.6); ctx.fill(); }
    if (type === 'banger') { ctx.fillStyle = 'rgba(120,60,25,0.75)'; ctx.beginPath(); ctx.ellipse(L * 0.34, -h + 5, 5, 3, 0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-L * 0.4, h - 4, 4, 3, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-L * 0.1, -h + 2.5, 6, 2, 0, 0, TAU); ctx.fill(); }
    if (type === 'sport') { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(f1 + 1, -2.4, L / 2 - f1 - 3, 1.8); ctx.fillRect(f1 + 1, 0.8, L / 2 - f1 - 3, 1.8); ctx.fillRect(-L / 2 + 2, -2.4, L / 2 + r1 - 3, 1.8); ctx.fillRect(-L / 2 + 2, 0.8, L / 2 + r1 - 3, 1.8); }
    if (type === 'police') {
      for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#f2d21f' : '#2b62c8'; ctx.fillRect(-L / 2 + 3 + i * 5.6, -h + 0.6, 5.6, 2.4); ctx.fillStyle = i % 2 ? '#2b62c8' : '#f2d21f'; ctx.fillRect(-L / 2 + 3 + i * 5.6, h - 3, 5.6, 2.4); }
      lightBar(c, -3, Wd, h);
    }
  }
  drawCarExtras(c, L, Wd, h);
  ctx.fillStyle = c.dead ? '#777' : '#fff6c2'; ctx.fillRect(L / 2 - 2.8, -h + 2, 2.8, 4.2); ctx.fillRect(L / 2 - 2.8, h - 6.2, 2.8, 4.2);
  ctx.fillStyle = c.brake && !c.dead ? '#ff4a3a' : '#9c1f1a'; ctx.fillRect(-L / 2, -h + 2, 2.6, 4.2); ctx.fillRect(-L / 2, h - 6.2, 2.6, 4.2);
  if (c.dmg > 35) { ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L / 2 - 4, -h + 3); ctx.lineTo(L / 2 - 9, -1); ctx.lineTo(L / 2 - 5, 3); ctx.lineTo(L / 2 - 10, h - 3); ctx.stroke(); }
  if (c === player.car && (type === 'buggy')) { ctx.fillStyle = '#3a2a1c'; circ(-1, 3, 3.6); ctx.fill(); }
  ctx.restore();
}

