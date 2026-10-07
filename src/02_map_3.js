'use strict';
const BUGGY_SPOT = M(1470, 2050);
for (const k in SPOTS) CLEAR.push({ x: SPOTS[k].x, y: SPOTS[k].y, r: 70 });
CLEAR.push({ x: LM.tower.x + 26, y: LM.tower.y + 26, r: 190 });
for (const b of BUNKERS) CLEAR.push({ x: b.x, y: b.y, r: Math.max(b.rx, b.ry) + 16 });
for (const g of GOLFF.greens) CLEAR.push({ x: g.x, y: g.y, r: 76 });
const ROWIES = [[590, 3545], [2305, 2160], [3230, 1090], [1140, 930], [3300, 2735], [3490, 980], [2110, 1338], [3200, 2350], [4100, 3190], [4660, 705], [3060, 2110], [1060, 1200]].map(p => M(p[0], p[1]));
const PIES = [[2223, 1471.5], [4580, 1242], [1620, 1892], [1500, 3016], [3960, 2990], [3610, 1300], [880, 1125], [3455, 2716]].map(p => M(p[0], p[1]));
const WEAPON_SPOTS = [['haddock', 2853, 1471.5], ['haddock', 2940, 2424], ['tattie', 4105, 2996], ['tattie', 1282, 858], ['haggis', 2391, 1471.5], ['haggis', 1306, 1282], ['haggis', 2610, 2305], ['rocket', 682, 3502], ['rocket', 4752, 836]]
  .map(w => ({ w: w[0], x: w[1] * S, y: w[2] * S }));
for (const p of ROWIES.concat(PIES, WEAPON_SPOTS)) CLEAR.push({ x: p.x, y: p.y, r: 46 });
for (const p of [[3170, 2380], [1470, 2050], [1510, 2050], [2200, 2200], [960, 1050], [4640, 800]]) CLEAR.push({ x: p[0] * S, y: p[1] * S, r: 110 });
// the Pzazz turns up somewhere different every time
const PZAZZ_SPOTS = [[4850, 760], [540, 3455], [1590, 3010], [3545, 2660], [4210, 2962], [4440, 3330], [5080, 2300], [4770, 1130], [3610, 745], [3318, 960], [2300, 300], [1340, 1060], [1345, 1200],
  [300, 1000], [400, 2250], [980, 2300], [2480, 2415], [3120, 2170], [2160, 1700], [4135, 1350], [3865, 1712], [2500, 2950], [5000, 900], [150, 150], [3080, 3300], [5125, 3075]].map(p => M(p[0], p[1]));
for (const p of PZAZZ_SPOTS) CLEAR.push({ x: p.x, y: p.y, r: 80 });
const JETTY = M(68, 2420), DINGHY_SPOT = M(87, 2414); CLEAR.push({ x: JETTY.x, y: JETTY.y - 60, r: 150 });
// the Falls of Feugh, just upstream (south) of the bridge
const FALLS = (function () { const p = RIVERS[1].pts, Y = 2815 * S; for (let i = 0; i < p.length - 1; i++) if ((p[i].y - Y) * (p[i + 1].y - Y) <= 0) { const t = (Y - p[i].y) / (p[i + 1].y - p[i].y), dx = p[i + 1].x - p[i].x, dy = p[i + 1].y - p[i].y, l = hyp(dx, dy); return { x: p[i].x + dx * t, y: Y, fx: dx / l, fy: dy / l, hw: RIVERS[1].hw }; } return { x: 3285 * S, y: Y, fx: 0, fy: -1, hw: 72 }; })();
function riverFlow(x, y) {           // nearest river: signed distance from the bank (< 0 in the water), centreline point and flow direction
  const o = { d: 1e9, cx: 0, cy: 0, fx: 1, fy: 0, r: 0 };
  RIVERS.forEach((r, ri) => { const p = r.pts; for (let i = 0; i < p.length - 1; i++) { const ax = p[i].x, ay = p[i].y, bx = p[i + 1].x - ax, by = p[i + 1].y - ay, l2 = bx * bx + by * by; let t = ((x - ax) * bx + (y - ay) * by) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t; const qx = ax + bx * t, qy = ay + by * t, d = hyp(x - qx, y - qy) - r.hw; if (d < o.d) { const l = Math.sqrt(l2); o.d = d; o.cx = qx; o.cy = qy; o.fx = bx / l; o.fy = by / l; o.r = ri; } } });
  return o;
}

function inBuilding(x, y, pad) { for (const b of BUILDINGS) if (x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad) return true; return false; }
function inReserved(x, y) { for (const r of RESERVED) if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return true; return false; }
function inClear(x, y) { for (const c of CLEAR) if (hyp(x - c.x, y - c.y) < c.r) return true; return false; }
function rectFree(x, y, w, h, pad) {
  for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) { const px = x + w * i / 3, py = y + h * j / 3; if (roadDist(px, py) < pad || riverDist(px, py) < pad + 24) return false; }
  for (const r of RESERVED) if (x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y) return false;
  for (const b of BUILDINGS) if (x < b.x + b.w + pad && x + w + pad > b.x && y < b.y + b.h + pad && y + h + pad > b.y) return false;
  for (const c of CLEAR) if (c.x > x - c.r * 0.6 && c.x < x + w + c.r * 0.6 && c.y > y - c.r * 0.6 && c.y < y + h + c.r * 0.6) return false;
  return true;
}

// ---------- houses along the residential streets ----------
const LAWN = ['#7cc05a', '#74b955', '#86c765', '#6fb351'], CARCOLS = ['#c8322b', '#2f66b3', '#e8e4da', '#3b3f46', '#8a9199', '#1f7a4d', '#d9a521', '#7a3fa0', '#d86a1e', '#56b6c9'];
(function houses() {
  for (const e of EDGES) {
    if (!e.res) continue;
    const horiz = Math.abs(e.ux) > Math.abs(e.uy);
    for (const side of [-1, 1]) {
      let t = sr(70, 120);
      while (t < e.len - 70) {
        const w = sr(84, 118), d = sr(62, 82), drive = srand() < 0.15, setb = drive ? 62 : sr(40, 56);
        const nx = e.uy * side, ny = -e.ux * side, off = e.hw + e.pave + setb + d / 2;
        const mx = e.a.x + e.ux * (t + w / 2), my = e.a.y + e.uy * (t + w / 2), cx = mx + nx * off, cy = my + ny * off;
        const bw = horiz ? w : d, bh = horiz ? d : w, x = cx - bw / 2, y = cy - bh / 2;
        if (rectFree(x - 10, y - 10, bw + 20, bh + 20, 6)) {
          const harl = srand() < 0.35;
          const b = Bpx(x, y, bw, bh, { ht: srand() < 0.3 ? 1 : 2, wall: harl ? spick(HARL) : spick(GRANITE), roof: srand() < 0.12 ? spick(TILE) : spick(SLATE), house: true, chim: srand() < 0.7 });
          let px0 = x - 14, py0 = y - 14, px1 = x + bw + 14, py1 = y + bh + 14;
          if (horiz) { if (ny > 0) { py0 = y - setb + 3; py1 = y + bh + 26; } else { py0 = y - 26; py1 = y + bh + setb - 3; } }
          else { if (nx > 0) { px0 = x - setb + 3; px1 = x + bw + 26; } else { px0 = x - 26; px1 = x + bw + setb - 3; } }
          PLOTS.push({ x: px0, y: py0, w: px1 - px0, h: py1 - py0, col: spick(LAWN) });
          const fx = mx + nx * (e.hw + e.pave), fy = my + ny * (e.hw + e.pave);   // kerb in front of the house
          if (srand() < 0.5) prop('bin', fx + e.ux * (w / 2 - 8) + nx * 9, fy + e.uy * (w / 2 - 8) + ny * 9, { col: spick(['#3d7a46', '#3a5f96', '#555b63', '#7a5a3a']) });
          if (drive) PARKED.push({ x: fx - e.ux * (w / 2 - 16) + nx * 30, y: fy - e.uy * (w / 2 - 16) + ny * 30, a: Math.atan2(ny, nx) + (srand() < 0.5 ? Math.PI : 0), type: spick(['hatch', 'hatch', 'saloon', 'fourby', 'pickup', 'sport']) });
          if (srand() < 0.4) b.gtree = { x: cx + nx * (d / 2 + 14) + e.ux * (w / 2) * (srand() < 0.5 ? -1 : 1), y: cy + ny * (d / 2 + 14) + e.uy * (w / 2) * (srand() < 0.5 ? -1 : 1) };
        }
        t += w + sr(30, 54);
      }
    }
  }
})();

// ---------- trees ----------
const TGRID = new Map();
function treeNear(x, y, d) {
  const cx = Math.floor(x / 80), cy = Math.floor(y / 80);
  for (let i = cx - 1; i <= cx + 1; i++) for (let j = cy - 1; j <= cy + 1; j++) { const a = TGRID.get(i + j * 4096); if (a) for (const t of a) if (hyp(t.x - x, t.y - y) < d) return true; }
  return false;
}
function addTree(x, y, kind, force) {
  if (x < 20 || y < 20 || x > WW - 20 || y > WH - 20) return false;
  if (roadDist(x, y) < 30 || riverDist(x, y) < 16 || inBuilding(x, y, 20) || inClear(x, y) || treeNear(x, y, 58)) return false;
  if (force) { for (const h of HARD) if (x > h.x - 12 && x < h.x + h.w + 12 && y > h.y - 12 && y < h.y + h.h + 12) return false; }
  else if (inReserved(x, y)) return false;
  const con = kind === 'con';
  const t = { x, y, kind, r: con ? sr(17, 26) : sr(22, 34), h: con ? sr(2.2, 3.4) : sr(1.6, 2.6), col: con ? spick(['#1f5a38', '#245f3a', '#1b5233', '#2a6a40']) : spick(['#3f8f3c', '#4a9a42', '#378436', '#5aa548']), ph: srand() * TAU };
  TREES.push(t); const k = Math.floor(x / 80) + Math.floor(y / 80) * 4096; if (!TGRID.has(k)) TGRID.set(k, []); TGRID.get(k).push(t); return true;
}
(function trees() {
  for (const b of BUILDINGS) if (b.gtree) addTree(b.gtree.x, b.gtree.y, 'bro');
  const inField = (x, y) => { for (const a of AREAS) if (a.kind === 'field' && x > a.x - 10 && x < a.x + a.w + 10 && y > a.y - 10 && y < a.y + a.h + 10) return true; return false; };
  const scatterRect = (x, y, w, h, n, kinds, force) => { for (let i = 0; i < n * 3; i++) { const px = (x + srand() * w) * S, py = (y + srand() * h) * S; if (!inField(px, py)) addTree(px, py, spick(kinds), force); } };
  for (let i = 0; i < 2600; i++) { const a = srand() * TAU, r = Math.sqrt(srand()) * SCOLTY.r; addTree(SCOLTY.x + Math.cos(a) * r, SCOLTY.y + Math.sin(a) * r, srand() < 0.9 ? 'con' : 'bro'); }
  scatterRect(0, 0, 640, 660, 220, ['con', 'con', 'bro']); scatterRect(880, 0, 1150, 560, 300, ['con', 'bro']); scatterRect(3050, 0, 800, 640, 220, ['con', 'bro']); scatterRect(4650, 0, 550, 280, 70, ['con', 'bro']);
  scatterRect(1000, 1150, 420, 240, 70, ['con', 'bro', 'bro'], true);                 // Tor-na-Coille means "wooded hill"
  scatterRect(1560, 2980, 1250, 820, 420, ['con', 'bro', 'bro']); scatterRect(2850, 2850, 620, 900, 200, ['bro', 'con']); scatterRect(3620, 2560, 900, 230, 70, ['bro']);
  scatterRect(40, 2300, 860, 120, 40, ['bro']); scatterRect(0, 1300, 820, 120, 30, ['bro']); scatterRect(4900, 1650, 300, 110, 16, ['bro']); scatterRect(3180, 1860, 110, 420, 22, ['bro']);
  for (const r of RIVERS) for (let i = 0; i < r.pts.length - 1; i++) for (let k = 0; k < 5; k++) {
    const p = r.pts[i], q = r.pts[i + 1], t = srand(), dx = q.x - p.x, dy = q.y - p.y, l = hyp(dx, dy), o = (r.hw + sr(26, 120)) * (srand() < 0.5 ? -1 : 1);
    addTree(p.x + dx * t - dy / l * o, p.y + dy * t + dx / l * o, 'bro');
  }
  const ring = (a, n) => { for (let i = 0; i < n * 2; i++) { const s = (srand() * 4) | 0, u = srand(); let x = a.x + 22, y = a.y + 22; if (s === 0) x += u * (a.w - 44); else if (s === 1) { x += a.w - 44; y += u * (a.h - 44); } else if (s === 2) { x += u * (a.w - 44); y += a.h - 44; } else y += u * (a.h - 44); addTree(x, y, 'bro', true); } };
  ring(BELLFIELD, 16); ring(BURNETT_PARK, 20); ring(GOLF_A, 26); ring(GOLF_B, 30);
  for (const p of [[1250, 1880], [1060, 2080], [1300, 2180], [1650, 2230], [1950, 2110], [2150, 2250], [2330, 2260], [1700, 2410], [2000, 2300], [1100, 1620]]) addTree(p[0] * S, p[1] * S, 'bro', true);
})();

