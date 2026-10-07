'use strict';
// ---------- MAP: a stylised Banchory ----------
const S = 2;                                    // map units -> pixels
const WW = 5200 * S, WH = 3800 * S;
const M = (x, y) => ({ x: x * S, y: y * S });

const NODES = {}, NODE_LIST = [], EDGES = [];
function N(id, x, y, exit) { const n = { id, x: x * S, y: y * S, edges: [], exit: !!exit, idx: NODE_LIST.length }; NODES[id] = n; NODE_LIST.push(n); }
const ROADT = { main: { hw: 50, pave: 14, speed: 250 }, street: { hw: 40, pave: 12, speed: 195 }, lane: { hw: 27, pave: 0, speed: 140 }, track: { hw: 19, pave: 0, speed: 110 } };
function E(a, b, type, flags, name) {
  const A = NODES[a], Bn = NODES[b], len = hyp(Bn.x - A.x, Bn.y - A.y), t = ROADT[type], f = flags || '';
  const e = { a: A, b: Bn, type, len, ux: (Bn.x - A.x) / len, uy: (Bn.y - A.y) / len, hw: t.hw, pave: t.pave, speed: t.speed,
    traffic: type === 'main' || type === 'street', res: f.includes('r'), peds: f.includes('p'), yellow: f.includes('y'), bridge: f.includes('b'), name: name || '' };
  EDGES.push(e); A.edges.push(e); Bn.edges.push(e); return e;
}

// The A93, west to east: Inchmarlo Road, High Street, Station Road, North Deeside Road
N('a0', -120, 1480, 1); N('aJ', 150, 1459); N('jt', 112, 2362); N('aG', 900, 1400); N('aT', 1210, 1439); N('aL', 1420, 1465); N('a3', 1700, 1500); N('a4', 2000, 1500); N('a5', 2400, 1500);
N('a6', 3000, 1500); N('aS', 3450, 1500); N('aR', 3700, 1500); N('t2', 4000, 1520); N('a8', 4300, 1540); N('aB', 4600, 1560); N('a10', 5320, 1610, 1);
// Dee Street runs south-east from the lights to the bridge; then west for Scolty, east for the Feugh
N('d0', 2515, 1765); N('d1', 2680, 2150); N('d2', 2760, 2400); N('s1', 2780, 2680); N('s2', 3215, 2725); N('s3', 3385, 2745);
N('s4', 3520, 2800); N('s5', 3560, 3920, 1); N('e1', 4300, 2900); N('eT', 4800, 2929); N('tf', 4800, 3125); N('e3', 5320, 2960, 1);
N('sc1', 2200, 2790); N('sc2', 1500, 2950); N('sc3', 1100, 3120); N('sc4', 820, 3340); N('sc5', 630, 3470);
// Bridge Street and Kinneskie Road, round to the golf club and back up to the A93
N('b1', 1780, 1765); N('g1', 1560, 1880);
// north side
N('ws1', 2000, 1272); N('wsM', 2500, 1272); N('ws2', 3000, 1272); N('n1', 2000, 800); N('nM', 2500, 800); N('nW', 3000, 800); N('n6', 2970, -120, 1); N('nRN', 3700, 800);
N('nR1', 3700, 1000); N('n5', 3760, -120, 1); N('ac', 3450, 1345); N('t1', 4000, 1000); N('hb1', 4300, 1000); N('wb', 4700, 830); N('sm1', 4600, 1420);
N('r1', 1700, 800); N('w2', 1450, 620); N('wG', 800, 640); N('w3', 700, -120, 1); N('tc', 1210, 1350); N('bf', 2600, 1768); N('lg', 2972, 2387);

E('a0', 'aJ', 'main', ''); E('aJ', 'aG', 'main', ''); E('aJ', 'jt', 'track', ''); E('aG', 'aT', 'main', '', 'Inchmarlo Road'); E('aT', 'aL', 'main', '', 'Inchmarlo Road'); E('aL', 'a3', 'main', 'rp', 'Inchmarlo Road');
E('a3', 'a4', 'main', 'py', 'High Street'); E('a4', 'a5', 'main', 'py', 'High Street'); E('a5', 'a6', 'main', 'py', 'High Street');
E('a6', 'aS', 'main', 'rp', 'Station Road'); E('aS', 'aR', 'main', 'rp', 'Station Road'); E('aR', 't2', 'main', 'r', 'North Deeside Road'); E('t2', 'a8', 'main', 'r'); E('a8', 'aB', 'main', 'r'); E('aB', 'a10', 'main', '');
E('a5', 'd0', 'street', 'py', 'Dee Street'); E('d0', 'd1', 'street', 'rp', 'Dee Street'); E('d1', 'd2', 'street', 'rp', 'Dee Street'); E('d2', 's1', 'street', 'bp', 'Bridge of Dee');
E('s1', 's2', 'street', ''); E('s2', 's3', 'street', 'b', 'Bridge of Feugh'); E('s3', 's4', 'street', ''); E('s4', 's5', 'street', ''); E('s4', 'e1', 'street', ''); E('e1', 'eT', 'street', ''); E('eT', 'e3', 'street', ''); E('eT', 'tf', 'lane', '');
E('s1', 'sc1', 'lane', ''); E('sc1', 'sc2', 'lane', ''); E('sc2', 'sc3', 'track', 'p'); E('sc3', 'sc4', 'track', 'p'); E('sc4', 'sc5', 'track', 'p');
E('d0', 'b1', 'street', 'rp', 'Bridge Street'); E('b1', 'g1', 'street', 'rp', 'Kinneskie Road'); E('g1', 'aL', 'street', '', 'Kinneskie Road');
E('a4', 'ws1', 'street', 'rp', 'Mount Street'); E('ws1', 'n1', 'street', 'rp', 'Mount Street');
E('ws1', 'wsM', 'street', 'rp', 'Watson Street'); E('wsM', 'ws2', 'street', 'rp', 'Watson Street'); E('a6', 'ws2', 'main', 'rp', 'Arbeadie Road'); E('ws2', 'nW', 'main', 'rp', 'Arbeadie Road'); E('nW', 'n6', 'main', 'r', 'Arbeadie Road'); E('wsM', 'nM', 'street', 'r');
E('n1', 'nM', 'street', 'r', 'Arbeadie Road'); E('nM', 'nW', 'street', 'r'); E('nW', 'nRN', 'street', 'r');
E('aR', 'nR1', 'main', 'rp', 'Raemoir Road'); E('nR1', 'nRN', 'main', 'r', 'Raemoir Road'); E('nRN', 'n5', 'main', 'r', 'Raemoir Road'); E('aS', 'ac', 'lane', 'p', 'Schoolhill');
E('nR1', 't1', 'street', 'r'); E('t1', 'hb1', 'street', 'r'); E('hb1', 'a8', 'street', 'r'); E('t1', 't2', 'street', 'r'); E('hb1', 'wb', 'lane', ''); E('aB', 'sm1', 'lane', '');
E('a3', 'r1', 'street', 'r', 'Ramsay Road'); E('r1', 'n1', 'street', 'r'); E('r1', 'w2', 'street', 'r'); E('w2', 'wG', 'street', ''); E('aG', 'wG', 'street', '', 'Glassel Road'); E('wG', 'w3', 'street', '');
E('aT', 'tc', 'lane', ''); E('d0', 'bf', 'lane', 'p'); E('d2', 'lg', 'lane', '');

// all-pairs shortest paths, used by the polis
const NEXT = [], DIST = [];
(function () {
  const n = NODE_LIST.length;
  for (let i = 0; i < n; i++) { DIST.push(new Array(n).fill(1e9)); NEXT.push(new Array(n).fill(null)); DIST[i][i] = 0; }
  for (const e of EDGES) { DIST[e.a.idx][e.b.idx] = e.len; DIST[e.b.idx][e.a.idx] = e.len; NEXT[e.a.idx][e.b.idx] = e.b; NEXT[e.b.idx][e.a.idx] = e.a; }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
    if (DIST[i][k] + DIST[k][j] < DIST[i][j]) { DIST[i][j] = DIST[i][k] + DIST[k][j]; NEXT[i][j] = NEXT[i][k]; }
})();
function nearestNode(x, y) { let b = null, bd = 1e18; for (const n of NODE_LIST) { const d = (n.x - x) * (n.x - x) + (n.y - y) * (n.y - y); if (d < bd) { bd = d; b = n; } } return b; }

// ---------- rivers ----------
function smooth(pts, n) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, o = {};
      for (const c of [0, 1]) o[c ? 'y' : 'x'] = 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3) * S;
      out.push(o);
    }
  }
  const l = pts[pts.length - 1]; out.push({ x: l[0] * S, y: l[1] * S }); return out;
}
const RIVERS = [
  { name: 'River Dee', hw: 140, pts: smooth([[-300, 2470], [600, 2440], [1300, 2580], [2000, 2640], [2770, 2540], [3350, 2470], [3900, 2540], [4500, 2680], [5500, 2640]], 8) },
  { name: 'Water of Feugh', hw: 72, pts: smooth([[2300, 4000], [2700, 3500], [3050, 3100], [3270, 2900], [3300, 2730], [3350, 2490]], 6) }
];
function riverDist(x, y) {           // < 0 means in the water
  let best = 1e9;
  for (const r of RIVERS) {
    const p = r.pts;
    for (let i = 0; i < p.length - 1; i++) {
      const ax = p[i].x, ay = p[i].y, bx = p[i + 1].x - ax, by = p[i + 1].y - ay, dx = x - ax, dy = y - ay;
      let t = (dx * bx + dy * by) / (bx * bx + by * by); t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = dx - bx * t, qy = dy - by * t, d = Math.sqrt(qx * qx + qy * qy) - r.hw;
      if (d < best) best = d;
    }
  }
  return best;
}
let _re = null, _rb = false;
function roadDist(x, y) {            // < 0 means on a road or its pavement; sets _re (nearest edge) and _rb (on a bridge)
  let best = 1e9; _re = null; _rb = false;
  for (let i = 0; i < EDGES.length; i++) {
    const e = EDGES[i], dx = x - e.a.x, dy = y - e.a.y;
    let t = dx * e.ux + dy * e.uy; t = t < 0 ? 0 : t > e.len ? e.len : t;
    const qx = dx - e.ux * t, qy = dy - e.uy * t, d = Math.sqrt(qx * qx + qy * qy) - e.hw - e.pave;
    if (d < best) { best = d; _re = e; }
    if (e.bridge && d < 5) _rb = true;
  }
  return best;
}
const AREAS = [], RESERVED = [], HARD = [], CLEAR = [];
const BUNKERS = [], PIERS = [{ x: 62 * S, y: 2372 * S, w: 12 * S, h: 50 * S }];
function inBunker(x, y) {
  if (x < 1800 || x > 5100 || y < 3000 || y > 4950) return false;
  for (const b of BUNKERS) { const dx = x - b.x, dy = y - b.y, u = (dx * b.c + dy * b.s) / b.rx, v = (-dx * b.s + dy * b.c) / b.ry; if (u * u + v * v < 1) return true; }
  return false;
}
function surfaceAt(x, y) {
  const d = roadDist(x, y);
  for (const h of PIERS) if (x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.h) return 'road';
  if (!_rb && riverDist(x, y) < 0) return 'water';
  if (d < 0) return 'road';
  for (const h of HARD) if (x > h.x && x < h.x + h.w && y > h.y && y < h.y + h.h) return 'road';
  if (inBunker(x, y)) return 'sand';
  return 'grass';
}

// ---------- ground areas ----------
function area(kind, x, y, w, h, o) { const a = Object.assign({ kind, x: x * S, y: y * S, w: w * S, h: h * S }, o || {}); AREAS.push(a); return a; }
function reserve(x, y, w, h) { RESERVED.push({ x: x * S, y: y * S, w: w * S, h: h * S }); }
function hard(x, y, w, h, kind) { const a = { x: x * S, y: y * S, w: w * S, h: h * S, kind: kind || 'yard', spots: [] }; HARD.push(a); RESERVED.push(a); return a; }
function carpark(x, y, w, h) {
  const a = hard(x, y, w, h, 'carpark'), n = Math.floor(a.w / 38), x0 = a.x + (a.w - n * 38) / 2;
  for (let i = 0; i < n; i++) { a.spots.push({ x: x0 + 19 + i * 38, y: a.y + 30, a: -Math.PI / 2 }); }
  for (let i = 0; i < n; i++) { a.spots.push({ x: x0 + 19 + i * 38, y: a.y + a.h - 30, a: Math.PI / 2 }); }
  a.bays = n; a.bx0 = x0; return a;
}

// fields round the edge of town
area('field', 40, 700, 620, 560, { crop: 'barley' }); area('field', 40, 1600, 800, 700, { crop: 'pasture' });
area('field', 2100, 80, 840, 560, { crop: 'barley' }); area('field', 3900, 100, 700, 700, { crop: 'pasture' });
area('field', 4400, 1760, 720, 600, { crop: 'barley' }); area('field', 3300, 1800, 950, 500, { crop: 'pasture' });
area('field', 3700, 3440, 820, 330, { crop: 'barley' }); area('field', 4850, 300, 320, 900, { crop: 'plough' });
