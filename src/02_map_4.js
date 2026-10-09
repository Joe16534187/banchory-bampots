'use strict';
// ---------- parked motors and street furniture ----------
function parkIn(cp, list) { list.forEach((t, i) => { if (!t) return; const s = cp.spots[i]; PARKED.push({ x: s.x, y: s.y, a: s.a, type: t.split('!')[0], keep: t.includes('!'), tag: t.split('!')[1] || '' }); }); }
parkIn(CP_BELL, ['icevan!icevan', 0, 'hatch', 0, 'saloon', 0, 0, 'fourby', 0, 0, 'hatch', 0, 0, 'van', 0, 'sport', 0, 0, 'saloon', 0]);
parkIn(CP_SHOP, ['hatch', 0, 'saloon', 'van', 0, 0, 'hatch', 0, 'fourby', 0, 'pickup', 0, 0, 'hatch', 0, 0, 'saloon', 0, 0, 'hatch', 0, 'sport', 0, 'van', 0, 0, 'hatch', 0, 'saloon', 0, 'fourby', 0, 0, 'hatch']);
parkIn(CP_GOLF, ['fourby', 0, 'sport', 0, 0, 'saloon', 0, 0, 0, 0, 0, 'fourby', 0, 'hatch']);
parkIn(CP_SCOLTY, ['hatch', 0, 0, 'fourby', 0, 0, 0, 0, 'pickup']);
parkIn(CP_ACAD, ['hatch', 0, 'saloon', 0, 0, 'hatch', 0, 0, 0, 0, 0, 'van', 0, 0, 'hatch']);
PARKED.push({ x: 1306 * S, y: 1532 * S, a: Math.PI / 2, type: 'police' }, { x: 4070 * S, y: 2951 * S, a: 0, type: 'tractor', keep: true }, { x: 4142 * S, y: 2951 * S, a: Math.PI, type: 'pickup' },
  { x: 3915 * S, y: 1570 * S, a: 0, type: 'saloon' }, { x: 4490 * S, y: 1605 * S, a: 0, type: 'hatch' }, { x: 4640 * S, y: 800 * S, a: Math.PI / 2, type: 'fourby' }, { x: 3170 * S, y: 2380 * S, a: 0, type: 'sport' },
  { x: 1160 * S, y: 1357 * S, a: Math.PI / 2, type: 'fourby' }, { x: 1262 * S, y: 1357 * S, a: -Math.PI / 2, type: 'saloon' },
  { x: 1470 * S, y: 2050 * S, a: Math.PI / 2, type: 'buggy', keep: true, tag: 'buggy' }, { x: 1510 * S, y: 2050 * S, a: Math.PI / 2, type: 'buggy', keep: true }, { x: 2200 * S, y: 2200 * S, a: 0.4, type: 'buggy', keep: true }, { x: 960 * S, y: 1050 * S, a: 0.2, type: 'tractor', keep: true },
  { x: 606 * S, y: 1487 * S, a: 0, type: 'tractor', keep: true }, { x: 760 * S, y: 1487 * S, a: Math.PI, type: 'pickup' });
(function furniture() {
  const kinds = ['tub', 'litter', 'bench', 'tub', 'litter'];
  let k = 0;
  for (let x = 1745; x < 2970; x += 92) { if (!(x > 1960 && x < 2040)) prop(kinds[k++ % 5], x * S, 1500 * S - 57); if (!(x + 40 > 2370 && x + 40 < 2470)) prop(kinds[k++ % 5], (x + 40) * S, 1500 * S + 57); }
  for (const g of GOLFF.greens) prop('flag', g.x, g.y, { r: 5 });
  for (let i = 0; i < 9; i++) prop('bale', sr(4440, 5080) * S, sr(1800, 2320) * S, { r: 15 });
  for (let i = 0; i < 6; i++) prop('bale', sr(80, 620) * S, sr(740, 1220) * S, { r: 15 });
  for (const p of [[1450, 1441], [1470, 1443], [1490, 1446], [1510, 1448], [1530, 1451], [4560, 1330], [4580, 1330], [4600, 1330], [3400, 1312], [3420, 1304], [3440, 1312], [3500, 1304], [3520, 1312]]) prop('cone', p[0] * S, p[1] * S, { r: 6 });
  for (const p of [[2800, 1900], [2800, 2100], [3100, 1900], [3100, 2140], [960, 860], [1300, 1000], [1140, 1060], [3060, 2424], [3450, 2722], [2470, 1560], [2500, 1600]]) prop('bench', p[0] * S, p[1] * S);
  prop('post', 2440 * S - 12, 1465 * S + 8, { r: 7 }); prop('post', 2610 * S, 1960 * S, { r: 7 });
  prop('totem', 2676 * S, 2250 * S, { r: 7 }); prop('memorial', 1484 * S, 1518 * S, { r: 11 });
  for (const p of [[690, 1500], [706, 1500], [698, 1487]]) prop('bale', p[0] * S, p[1] * S, { r: 15 });      // Inchmarlo Farm
  for (let i = 0; i < 9; i++) { if (i === 0) continue; const an = i * TAU / 9; prop('stone', SPOTS.stanes.x + Math.cos(an) * 104, SPOTS.stanes.y + Math.sin(an) * 104, { r: 11, rot: an * 3.7, big: i % 3 === 0 }); }   // the auld stanes: a ring of nine, less the one on the east side where the track comes in
  prop('stall', 1262 * S, 322 * S, { r: 15 });                                 // the dealer's table at Glen O' Dee
})();

// ---------- static collision grid ----------
const CELL = 240, GRID = new Map(), PGRID = new Map();
function gridPut(g, c, x0, y0, x1, y1) { for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) for (let j = Math.floor(y0 / CELL); j <= Math.floor(y1 / CELL); j++) { const k = i + j * 4096; let a = g.get(k); if (!a) g.set(k, a = []); a.push(c); } }
for (const b of BUILDINGS) gridPut(GRID, { k: 0, x: b.x, y: b.y, w: b.w, h: b.h, q: 0, b }, b.x, b.y, b.x + b.w, b.y + b.h);
for (const t of TREES) gridPut(GRID, { k: 1, x: t.x, y: t.y, r: 7, q: 0, tree: t }, t.x - 7, t.y - 7, t.x + 7, t.y + 7);
for (const p of PROPS) { if (p.solid) gridPut(GRID, { k: 1, x: p.x, y: p.y, r: p.r, q: 0 }, p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r); else gridPut(PGRID, p, p.x, p.y, p.x, p.y); }
let _qid = 0;
function queryGrid(g, x, y, r, out) {
  out.length = 0; _qid++;
  for (let i = Math.floor((x - r) / CELL); i <= Math.floor((x + r) / CELL); i++) for (let j = Math.floor((y - r) / CELL); j <= Math.floor((y + r) / CELL); j++) {
    const a = g.get(i + j * 4096); if (a) for (const c of a) if (c.q !== _qid) { c.q = _qid; out.push(c); }
  }
  return out;
}
const _res = { nx: 0, ny: 0, pen: 0 };
function resolveCircle(cx, cy, r, c) {
  if (c.k === 1) { const dx = cx - c.x, dy = cy - c.y, d = hyp(dx, dy), R = r + c.r; if (d >= R) return null; if (d < 1e-4) { _res.nx = 1; _res.ny = 0; _res.pen = R; return _res; } _res.nx = dx / d; _res.ny = dy / d; _res.pen = R - d; return _res; }
  const qx = clamp(cx, c.x, c.x + c.w), qy = clamp(cy, c.y, c.y + c.h), dx = cx - qx, dy = cy - qy, d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return null;
  if (d2 > 1e-6) { const d = Math.sqrt(d2); _res.nx = dx / d; _res.ny = dy / d; _res.pen = r - d; return _res; }
  const l = cx - c.x, rr = c.x + c.w - cx, t = cy - c.y, b = c.y + c.h - cy, m = Math.min(l, rr, t, b);
  if (m === l) { _res.nx = -1; _res.ny = 0; _res.pen = l + r; } else if (m === rr) { _res.nx = 1; _res.ny = 0; _res.pen = rr + r; } else if (m === t) { _res.nx = 0; _res.ny = -1; _res.pen = t + r; } else { _res.nx = 0; _res.ny = 1; _res.pen = b + r; }
  return _res;
}

// ---------- place names ----------
const ZONES = [
  ['Bridge of Dee', 2700, 2400, 150, 290], ['Bridge of Feugh', 3200, 2660, 200, 150], ['Scolty Hill', 0, 2890, 1250, 910], ['Bellfield Park', 2740, 1830, 440, 380], ['Bellfield', 2570, 1700, 400, 130],
  ['Banchory Golf Club', 900, 1540, 520, 840], ['Banchory Golf Club', 1380, 1880, 1140, 580], ['Tor-na-Coille', 1000, 1150, 420, 262], ['Burnett Park', 880, 740, 520, 370],
  ['Bridge Street', 1760, 1700, 740, 130], ['High Street', 1700, 1370, 1300, 290], ['Dee Street', 2380, 1650, 480, 760],
  ['Banchory Primary School', 3035, 830, 300, 550], ['Banchory Academy', 3335, 830, 335, 550], ['Maryfield Farm', 4560, 3040, 620, 700], ["Glen O' Dee", 1080, 130, 420, 330], ['Falls of Feugh', 3180, 2760, 220, 140], ['Arbeadie Road', 2900, 0, 200, 1380], ['Station Road', 3000, 1380, 700, 290], ['North Deeside Road', 3700, 1380, 1620, 320],
  ['Raemoir Road', 3560, 0, 300, 1000], ['Hill of Banchory', 3700, 0, 1620, 1380], ['Watson Street', 2030, 1200, 970, 170], ['Mount Street', 1900, 800, 200, 580], ['Arbeadie', 2000, 600, 1300, 600],
  ['Ramsay Road', 1560, 780, 300, 600], ['The Auld Stanes', 210, 270, 300, 260], ['Inchmarlo Farm', 40, 1496, 800, 804], ['Glassel Road', 600, 0, 400, 1400], ['Kinneskie Road', 1400, 1740, 400, 180], ['Inchmarlo Road', 0, 1300, 1700, 300], ['Auchattie', 1250, 2700, 1520, 500],
  ['South Deeside Road', 2700, 2600, 2700, 1300], ['Deeside', 0, 0, 5200, 3800]
].map(z => ({ name: z[0], x: z[1] * S, y: z[2] * S, w: z[3] * S, h: z[4] * S }));
function zoneAt(x, y) { for (const z of ZONES) if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) return z.name; return 'Banchory'; }
const MAP_LABELS = [['Scolty Hill', 600, 3300], ['River Dee', 520, 2470], ['River Dee', 4350, 2640], ['Water of Feugh', 2620, 3440], ['Bellfield Park', 2950, 1990], ['Golf Course', 1900, 2270], ['Burnett Park', 1140, 950],
  ['Bridge of Dee', 2600, 2560], ['Bridge of Feugh', 3090, 2672], ['Falls of Feugh', 3130, 2890], ['Dinghy', 150, 2360], ['The Auld Stanes', 430, 345], ['To Aberdeen', 4950, 1560], ['To Braemar', 240, 1510], ['To Strachan', 3400, 3720]].map(l => ({ name: l[0], x: l[1] * S, y: l[2] * S }));
