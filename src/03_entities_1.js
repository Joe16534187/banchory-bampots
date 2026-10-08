'use strict';
// ---------- game state ----------
const G = { state: 'title', t: 0, money: 0, heat: 0, stars: 0, mission: null, done: {}, rowies: {}, pager: null, pagerQ: [], big: null, zone: '', zoneT: 0, vehT: 0, vehName: '',
  nickT: 0, unseenT: 0, shake: 0, phoneArmed: true, obj: '', target: null, timer: null, muted: false, spawnT: 0, polT: 0, hint: null, hintT: 0, allDone: false };
const cam = { x: SPOTS.start.x, y: SPOTS.start.y - 200, z: 1, x0: 0, y0: 0, x1: 0, y1: 0 };
const player = { x: SPOTS.start.x, y: SPOTS.start.y, a: Math.PI / 2, vx: 0, vy: 0, car: null, hp: 5, knock: 0, z: 0, vz: 0, rot: 0, rv: 0, carrying: null, box: false, shove: 0, shoveCd: 0,
  safe: { x: SPOTS.start.x, y: SPOTS.start.y }, safeT: 0, walk: 0, inv: 0, bub: null, isPlayer: true, moving: false, pax: 0,
  skin: '#f1c9a5', shirt: '#ffd21f', hair: '#3a2a1c', legs: '#2d3a55', hat: 0, kind: 'player', state: 'walk',
  weapon: 'fist', has: { fist: true }, ammo: { tattie: 0, haggis: 0, rocket: 0 }, freeze: 0, armour: 0, tipsy: 0, inside: false };
const cars = [], peds = [], parts = [], floaters = [], pickups = [], shots = [], salmon = [], copShots = [], helis = [];
const NO_UP = {};                               // a motor with nothing bought for it at Dod's
const SKID_MAX = 500, skids = new Float32Array(SKID_MAX * 5); let skidN = 0, skidI = 0;

function bigText(text, sub, col, dur) { G.big = { text, sub: sub || '', col: col || '#ffd21f', t: dur || 3.4, t0: dur || 3.4 }; }
function pagerMsg(text) { G.pagerQ.push(text); if (G.pager && G.pager.n >= G.pager.text.length && G.pager.hold > 1.5) G.pager = null; }
function hint(text, dur) { G.hint = text; G.hintT = dur || 2.5; }
function floater(x, y, text, col) { floaters.push({ x, y, text, col: col || '#fff', t: 1.5 }); if (floaters.length > 30) floaters.shift(); }
function addMoney(n, x, y) { G.money = Math.max(0, G.money + n); if (x !== undefined) floater(x, y, (n >= 0 ? '+£' : '-£') + Math.abs(n), n >= 0 ? '#ffe45c' : '#ff7a6a'); }
function addHeat(v) { G.heat = Math.min(4.99, G.heat + v); G.unseenT = 0; }
function say(ent, text, dur) { ent.bub = { text, t: dur || 2 }; }
function onScreen(x, y, m) { m = m || 0; return x > cam.x0 - m && x < cam.x1 + m && y > cam.y0 - m && y < cam.y1 + m; }
function focusPos() { return G.state === 'title' ? cam : (player.car || player); }
function vol(x, y) { const f = focusPos(); return clamp(1 - hyp(x - f.x, y - f.y) / 900, 0, 1); }

// ---------- particles ----------
function part(x, y, vx, vy, life, size, col, kind, grow) { if (parts.length > 420) parts.shift(); parts.push({ x, y, vx, vy, life, max: life, size, col, kind: kind || 'dot', grow: grow || 0 }); }
function puff(x, y, n, col, spd, size, life, grow) { for (let i = 0; i < n; i++) { const a = rnd(TAU), s = rnd(spd || 40); part(x, y, Math.cos(a) * s, Math.sin(a) * s, rnd(0.5, 1) * (life || 0.8), rnd(0.6, 1) * (size || 6), col, 'smoke', grow === undefined ? 14 : grow); } }
function sparks(x, y, n) { for (let i = 0; i < n; i++) { const a = rnd(TAU), s = rnd(60, 220); part(x, y, Math.cos(a) * s, Math.sin(a) * s, rnd(0.15, 0.4), 2, pick(['#ffe680', '#fff', '#ffb347']), 'dot'); } }
function splash(x, y, big) { for (let i = 0; i < (big ? 26 : 12); i++) { const a = rnd(TAU), s = rnd(40, big ? 240 : 140); part(x, y, Math.cos(a) * s, Math.sin(a) * s, rnd(0.4, 0.9), rnd(3, 6), pick(['#e8f6ff', '#bfe3f7', '#fff']), 'dot'); } part(x, y, 0, 0, 0.9, 10, '#e8f6ff', 'ring', big ? 110 : 60); }
function addSkid(x1, y1, x2, y2, grass) { const i = skidI * 5; skids[i] = x1; skids[i + 1] = y1; skids[i + 2] = x2; skids[i + 3] = y2; skids[i + 4] = +grass || 0; skidI = (skidI + 1) % SKID_MAX; skidN = Math.min(SKID_MAX, skidN + 1); }

// ---------- vehicles ----------
const SPECS = {      // max: top speed, acc: pick-up, turn: steering sharpness, grip: low values slide, brake: stopping power
  hatch: { name: 'Wee Hatchback', len: 42, w: 21, max: 305, acc: 310, turn: 3.6, grip: 8.5, mass: 0.9, brake: 2.0 },
  saloon: { name: 'Family Saloon', len: 48, w: 22, max: 365, acc: 235, turn: 2.6, grip: 7, mass: 1.25, brake: 1.8 },
  racer: { name: 'Boy Racer', len: 43, w: 21, max: 415, acc: 390, turn: 3.7, grip: 4.8, mass: 0.95, brake: 2.2, cols: ['#2bd13a', '#f2e318', '#ff6a00', '#1d8fd1'] },
  sport: { name: 'Flash Motor', len: 46, w: 22, max: 485, acc: 430, turn: 3.0, grip: 10.5, mass: 1.1, brake: 2.8, cols: ['#d9261c', '#f2c318', '#1d8fd1', '#e85d1a'] },
  banger: { name: 'Auld Banger', len: 46, w: 22, max: 250, acc: 160, turn: 2.4, grip: 6, mass: 1.15, brake: 1.2, cols: ['#8a7a5a', '#6b7a6a', '#9a8f86', '#7a5a4a'] },
  fourby: { name: "Laird's 4x4", len: 50, w: 24, max: 315, acc: 235, turn: 2.3, grip: 9, mass: 1.9, brake: 1.7, offroad: true, cols: ['#2f4a35', '#3b3f46', '#6b5a45', '#8a9199'] },
  pickup: { name: "Fermer's Pickup", len: 52, w: 23, max: 295, acc: 255, turn: 2.5, grip: 5.2, mass: 1.5, brake: 1.6, offroad: true, cols: ['#9c2f25', '#3c5f8a', '#d8d2c4', '#4d6b3a'] },
  van: { name: 'White Van', len: 54, w: 24, max: 335, acc: 245, turn: 2.2, grip: 5.5, mass: 1.8, brake: 1.5, cols: ['#eeeae2'] },
  icevan: { name: 'Ice Cream Van', len: 54, w: 25, max: 265, acc: 185, turn: 2.1, grip: 5.5, mass: 1.9, brake: 1.4, cols: ['#fdf3f6'] },
  bus: { name: 'The 201 Bus', len: 88, w: 27, max: 235, acc: 115, turn: 1.5, grip: 8, mass: 4.5, brake: 1.2, cols: ['#f1ead6'] },
  tractor: { name: 'Tractor', len: 44, w: 27, max: 160, acc: 230, turn: 2.9, grip: 10, mass: 3, brake: 2.5, offroad: true, cols: ['#2f8a3c', '#c73a2b', '#2b62a8'] },
  buggy: { name: 'Golf Buggy', len: 30, w: 18, max: 195, acc: 270, turn: 4.0, grip: 5, mass: 0.5, brake: 2.0, offroad: true, cols: ['#f4f1e8'] },
  pzazz: { name: 'The Pzazz', len: 46, w: 22, max: 470, acc: 420, turn: 3.2, grip: 9.5, mass: 1.1, brake: 2.8, nitro: true, cols: ['#e21d8e'] },
  police: { name: 'Polis Car', len: 46, w: 22, max: 405, acc: 350, turn: 3.1, grip: 9, mass: 1.3, brake: 2.4, cop: true, cols: ['#f4f4f0'] },
  polvan: { name: 'Polis Riot Van', len: 56, w: 25, max: 375, acc: 330, turn: 2.6, grip: 9, mass: 2.9, brake: 2.2, cop: true, cols: ['#f4f4f0'] },
  jeep: { name: 'Army Jeep', len: 44, w: 23, max: 430, acc: 400, turn: 3.2, grip: 9.5, mass: 1.6, brake: 2.6, offroad: true, cop: true, cols: ['#55623f'] },
  tank: { name: 'Army Tank', len: 62, w: 36, max: 205, acc: 200, turn: 1.9, grip: 12, mass: 9, brake: 3, offroad: true, cop: true, tank: true, cols: ['#5b6843'] },
  dinghy: { name: 'Rubber Dinghy', len: 34, w: 20, max: 130, acc: 135, turn: 2.2, grip: 1, mass: 0.4, boat: true, cols: ['#f0791a'] }
};
for (const k in SPECS) { const sp = SPECS[k]; sp.r = sp.w / 2 + 1; const n = Math.max(2, Math.round(sp.len / sp.w)), m = sp.len / 2 - sp.r; sp.offs = []; for (let i = 0; i < n; i++) sp.offs.push(-m + 2 * m * i / (n - 1)); if (!sp.cols) sp.cols = CARCOLS; }
let CAR_ID = 1;
function makeCar(type, x, y, a, o) {
  const sp = SPECS[type];
  const c = { id: CAR_ID++, type, sp, x, y, a, vx: 0, vy: 0, vf: 0, spin: 0, steer: 0, col: pick(sp.cols), driver: null, ai: null, dmg: 0, dead: false, brake: false, sink: 0, keep: false, tag: '',
    horn: 0, siren: false, slip: 0, surf: 'road', gone: false, smokeT: 0, hitCd: 0, nitro: 1, boost: false, nlock: false, up: null, turret: a, fireT: 0 };
  if (type === 'banger') c.dmg = rnd(30, 48);
  if (o) Object.assign(c, o);
  cars.push(c); return c;
}
function carSpeed(c) { return hyp(c.vx, c.vy); }
function hasNitro(c) { return !!(c.sp.nitro || c.up && c.up.nitro); }
function killCar(c) {
  c.dead = true; c.siren = false;
  puff(c.x + Math.cos(c.a) * c.sp.len * 0.3, c.y + Math.sin(c.a) * c.sp.len * 0.3, 14, '#3a3a3a', 70, 10, 1.4);
  if (onScreen(c.x, c.y)) { floater(c.x, c.y - 20, 'Deid!', '#ddd'); AudioFX.crash(0.9); }
  if (c.ai) { const p = makePed(c.x - Math.sin(c.a) * 20, c.y + Math.cos(c.a) * 20); p.flee = 6; say(p, pick(['Ma motor!', 'It was a classic!', 'Affa!'])); c.ai = null; c.driver = null; }
  if (c === player.car) { pagerMsg("The motor's deid. Get oot and find another."); missionEvent('carDead', c); }
}
function carImpact(c, imp, x, y) {
  if (imp < 60 || c.hitCd > 0) return;
  c.hitCd = 0.12;
  if (!c.dead) { c.dmg += (imp - 60) * 0.05 * (c.type === 'buggy' ? 1.3 : 1) * (c.sp.tank ? 0 : c.up && c.up.bars ? 0.5 : 1); if (c.dmg >= 100) killCar(c); }
  if (onScreen(x, y, 80)) { sparks(x, y, Math.min(9, imp / 35)); AudioFX.crash(clamp(imp / 380, 0.15, 1) * vol(x, y)); }
  if (c === player.car) { G.shake = Math.min(16, G.shake + imp * 0.035); missionEvent('crash', imp); }
}
function startSink(c) {
  if (c.sink > 0) return;
  c.sink = 0.01; c.siren = false; splash(c.x, c.y, true); if (onScreen(c.x, c.y, 100)) AudioFX.splash();
  c.ai = null; if (c.driver === 'ai') c.driver = null;
  if (c === player.car) drookit();
}
const _cols = [];
function collideCarStatic(c) {
  const sp = c.sp, r = sp.r;
  queryGrid(GRID, c.x, c.y, sp.len / 2 + r + 6, _cols);
  if (!_cols.length) return;
  const fx = Math.cos(c.a), fy = Math.sin(c.a); let hit = 0, hx = 0, hy = 0, leaf = null;
  for (const o of sp.offs) for (const col of _cols) {
    const cx = c.x + fx * o, cy = c.y + fy * o, res = resolveCircle(cx, cy, r, col);
    if (!res) continue;
    c.x += res.nx * res.pen; c.y += res.ny * res.pen;
    const vn = c.vx * res.nx + c.vy * res.ny;
    if (vn < 0) {
      c.vx -= 1.22 * vn * res.nx; c.vy -= 1.22 * vn * res.ny; c.vx *= 0.99; c.vy *= 0.99;
      const cross = (fx * o) * res.ny - (fy * o) * res.nx; c.spin = clamp(c.spin + cross * (-vn) * 0.0011, -4, 4);
      if (-vn > hit) { hit = -vn; hx = cx - res.nx * r; hy = cy - res.ny * r; leaf = col.tree; }
    }
  }
  if (hit > 60) { carImpact(c, hit, hx, hy); if (leaf && onScreen(hx, hy)) for (let i = 0; i < 6; i++) part(leaf.x + rnd(-14, 14), leaf.y + rnd(-14, 14), rnd(-40, 40), rnd(-40, 40), rnd(0.6, 1.2), 4, leaf.col, 'dot'); }
}
function updateCar(c, dt, thr, steer, hb) {
  const sp = c.sp;
  if (sp.boat) { updateBoat(c, dt, thr, steer); return; }
  if (c.hitCd > 0) c.hitCd -= dt;
  if (c.sink > 0) { c.sink += dt * 1.1; c.vx *= 0.92; c.vy *= 0.92; c.x += c.vx * dt; c.y += c.vy * dt; if (c.sink >= 1) c.gone = true; return; }
  if (c.dead) { thr = 0; }
  const surf = surfaceAt(c.x, c.y); c.surf = surf;
  if (surf === 'water') { startSink(c); return; }
  const sand = surf === 'sand', off = surf === 'grass' || sand, boost = c.boost && thr > 0 && !sand && !c.dead;
  const up = c.up || NO_UP, acc = sp.acc * (up.tune ? 1.15 : 1);                       // Dod's upgrades
  const maxV = sp.max * (up.tune ? 1.12 : 1) * (sand ? 0.3 : off ? (sp.offroad ? 0.86 : 0.6) : 1) * (1 - 0.3 * clamp((c.dmg - 60) / 40, 0, 1)) * (boost ? 1.45 : 1);
  const grip = (hb ? 1.5 : sp.grip * (up.tyres ? 1.3 : 1)) * (sand ? 0.45 : off ? 0.62 : 1);
  c.steer += clamp(steer - c.steer, -dt * 7, dt * 7);
  let fx = Math.cos(c.a), fy = Math.sin(c.a), vf = c.vx * fx + c.vy * fy;
  const sf = clamp(vf / 100, -1, 1) * (1 - 0.42 * clamp(Math.abs(vf) / sp.max, 0, 1));
  c.a += c.steer * sp.turn * sf * dt * (hb ? 1.3 : 1) + c.spin * dt;
  c.spin *= Math.exp(-5 * dt);
  fx = Math.cos(c.a); fy = Math.sin(c.a); vf = c.vx * fx + c.vy * fy; let vl = -c.vx * fy + c.vy * fx;
  c.brake = false;
  if (thr > 0) { if (vf < -5) { vf += acc * 2.2 * dt; c.brake = true; } else vf += acc * (sand ? 0.5 : off ? 0.75 : 1) * (boost ? 2.3 : 1) * thr * Math.max(0, 1 - vf / maxV) * dt; }
  else if (thr < 0) { if (vf > 8) { vf += 290 * sp.brake * dt * thr; c.brake = true; } else vf += acc * 0.7 * thr * Math.max(0, 1 + vf / (maxV * 0.38)) * dt; }
  if (hb) { vf -= Math.sign(vf) * Math.min(Math.abs(vf), 240 * dt); c.brake = true; }
  const drag = (c.driver ? 0.05 : 1.8) + (sand ? 3 : off ? 0.8 : 0) + (thr === 0 ? 0.5 : 0) + (c.dead ? 1.5 : 0);
  vf *= Math.exp(-drag * dt);
  if (vf > maxV) vf = lerp(vf, maxV, 1 - Math.exp(-3 * dt));
  c.slip = Math.abs(vl);
  vl *= Math.exp(-grip * dt);
  if (!c.driver && Math.abs(vf) < 5 && Math.abs(vl) < 5) { vf = 0; vl = 0; }
  c.vx = fx * vf - fy * vl; c.vy = fy * vf + fx * vl; c.vf = vf;
  c.x += c.vx * dt; c.y += c.vy * dt;
  collideCarStatic(c);
  if (c.driver !== 'ai') { c.x = clamp(c.x, 40, WW - 40); c.y = clamp(c.y, 40, WH - 40); }
  // effects
  const spd = Math.abs(vf), vis = onScreen(c.x, c.y, 60);
  if (vis && (c.slip > 85 || (hb && spd > 60)) && spd + c.slip > 90) {
    const bx = c.x - fx * sp.len * 0.3, by = c.y - fy * sp.len * 0.3, w = sp.w * 0.4;
    for (const s of [-1, 1]) { const wx = bx - fy * w * s, wy = by + fx * w * s; addSkid(wx - c.vx * dt, wy - c.vy * dt, wx, wy, off ? (sand ? 2 : 1) : 0); }
    if (off && Math.random() < 0.3) puff(bx, by, 1, '#8a6a48', 30, 5, 0.6);
    if (c === player.car) AudioFX.skid = 1;
  }
  if (vis && off && !sand && spd > 120 && Math.random() < dt * 14) puff(c.x - fx * sp.len * 0.4, c.y - fy * sp.len * 0.4, 1, 'rgba(150,130,90,0.7)', 20, 5, 0.6);
  if (vis && sand && spd > 12 && Math.random() < dt * 30) puff(c.x - fx * sp.len * 0.4 + rnd(-8, 8), c.y - fy * sp.len * 0.4 + rnd(-8, 8), 1, '#e6d291', 50, 5, 0.7, 6);
  if (sand && c === player.car && spd > 20 && G.hintT <= 0) hint('Bunker! Sand slows you right down', 1.5);
  if (boost) {
    const bx = c.x - fx * sp.len * 0.5, by = c.y - fy * sp.len * 0.5;
    for (let i = 0; i < 2; i++) part(bx - fy * rnd(-5, 5), by + fx * rnd(-5, 5), -c.vx * 0.2 + rnd(-30, 30), -c.vy * 0.2 + rnd(-30, 30), rnd(0.15, 0.35), rnd(3, 6), pick(['#ffe680', '#ff9a2a', '#5ad1ff', '#fff']), 'dot', -3);
    if (Math.random() < 0.3) part(bx, by, rnd(-20, 20), rnd(-20, 20), 0.6, 4, '#e21d8e', 'smoke', 10);
    if (c === player.car) { G.shake = Math.max(G.shake, 2.5); AudioFX.nitro = 1; }
  }
  if (vis && c.type === 'pzazz' && !c.dead && Math.random() < dt * 4) part(c.x + rnd(-20, 20), c.y + rnd(-14, 14), 0, -14, 0.7, 2.2, pick(['#fff', '#ffe680', '#ff9ad5']), 'dot');
  if (vis && c.dmg > 45) { c.smokeT -= dt; if (c.smokeT <= 0) { c.smokeT = c.dmg > 80 ? 0.05 : 0.14; part(c.x + fx * sp.len * 0.35, c.y + fy * sp.len * 0.35, rnd(-15, 15), rnd(-15, 15) - 12, 1.1, 5, c.dmg > 80 || c.dead ? '#2e2e2e' : '#d9d9d9', 'smoke', 16); } }
  if (vis && c.type === 'tractor' && c.driver && Math.random() < dt * 5) part(c.x + fx * 12 - fy * 6, c.y + fy * 12 + fx * 6, rnd(-8, 8), rnd(-8, 8), 0.7, 3, '#555', 'smoke', 10);
}
