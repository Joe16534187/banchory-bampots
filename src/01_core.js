'use strict';
// ============================================================
//  BANCHORY BAMPOTS  -  a wee top-down caper on Royal Deeside
// ============================================================
const TAU = Math.PI * 2, hyp = Math.hypot;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; }
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const srand = rng(1887);                       // deterministic, for building the town
const sr = (a, b) => a + srand() * (b - a);
const spick = arr => arr[(srand() * arr.length) | 0];
const rnd = (a, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];
function wpick(table) { let tot = 0; for (const k in table) tot += table[k]; let r = Math.random() * tot; for (const k in table) { r -= table[k]; if (r <= 0) return k; } return Object.keys(table)[0]; }
