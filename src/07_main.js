'use strict';
// ---------- input, saving, main loop ----------
const keys = {}; let hits = {};
const GAMEKEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Enter', 'NumpadEnter', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyF', 'KeyH', 'KeyM', 'KeyP', 'KeyN', 'KeyR', 'KeyX', 'KeyQ', 'KeyB', 'KeyT', 'ShiftLeft', 'ShiftRight', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Escape']);
const inp = { up: false, down: false, left: false, right: false, space: false, spaceHit: false, enterHit: false, horn: false, hornHit: false, nitro: false, nextHit: false, numHit: 0 };
const SAVE_KEY = 'banchory-bampots-v1'; let wipeArm = 0, saveT = 15, lastSaved = -1, lastTs = 0;
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ money: Math.round(G.money), done: G.done, rowies: G.rowies })); lastSaved = G.money; } catch (e) { /* storage unavailable: play on without saving */ } }
function loadGame() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s) { G.money = s.money | 0; G.done = s.done || {}; G.rowies = s.rowies || {}; } } catch (e) { /* nothing saved */ } }
function startGame() {
  G.state = 'play'; AudioFX.init();
  if (!G.started) { G.started = true; cam.x = player.x; cam.y = player.y; pagerMsg('Welcome to Banchory. Find a ringing phone box (yellow on the radar) for a job. Press ENTER beside a motor to borrow it. Crates hold weapons. Got money to spend? Press T at a pub door, at Dod\'s Motors, or beside the man in the woods at Glen O\' Dee. And somewhere oot there sits the Pzazz.'); }
}
function unstick() {
  const P = player, c = P.car, o = c || P; roadDist(o.x, o.y); let e = _re;
  if (!e || e.bridge || e.type === 'track') { const n = nearestNode(o.x, o.y); e = n.edges[0]; }
  const t = clamp((o.x - e.a.x) * e.ux + (o.y - e.a.y) * e.uy, 60, e.len - 60), lo = c ? e.hw * 0.5 : e.hw + 8;
  o.x = e.a.x + e.ux * t + e.uy * lo; o.y = e.a.y + e.uy * t - e.ux * lo; o.vx = o.vy = 0;
  if (c) { c.a = Math.atan2(e.uy, e.ux); c.spin = 0; P.x = c.x; P.y = c.y; } P.knock = 0; P.z = 0;
}
function onKey(k) {
  if (G.state === 'title') { if (k === 'Enter' || k === 'Space' || k === 'NumpadEnter') { startGame(); hits = {}; } return; }
  if (k === 'KeyN') { G.muted = !G.muted; AudioFX.setMuted(G.muted); return; }
  if (G.state === 'play') { if (k === 'KeyP' || k === 'Escape') G.state = 'pause'; else if (k === 'KeyM' || k === 'Tab') G.state = 'map'; else if (k === 'KeyT') { const s = shopNear(); if (s) openShop(s); else if (!G.prompt) hint('Nothing to buy here. Try a pub door, or Dod\'s Motors.', 2); } }
  else if (G.state === 'shop') {
    if (k === 'ArrowUp' || k === 'KeyW') shopMove(-1); else if (k === 'ArrowDown' || k === 'KeyS') shopMove(1);
    else if (k === 'Enter' || k === 'NumpadEnter' || k === 'Space') shopBuy();
    else if (k === 'Escape' || k === 'KeyT' || k === 'KeyP' || k === 'KeyE') { closeShop(); hits = {}; }
  }
  else if (G.state === 'pause') {
    if (k === 'KeyP' || k === 'Escape' || k === 'Enter' || k === 'NumpadEnter') { G.state = 'play'; hits = {}; }
    else if (k === 'KeyR') { unstick(); G.state = 'play'; hits = {}; }
    else if (k === 'KeyX') { if (performance.now() - wipeArm < 1500) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } G.money = 0; G.done = {}; G.rowies = {}; player.has = { fist: true }; player.weapon = 'fist'; player.armour = 0; for (const p of pickups) if (p.type === 'rowie') p.gone = false; bigText('Progress wiped', 'A clean slate', '#fff', 2.5); G.state = 'play'; hits = {}; } else wipeArm = performance.now(); }
  } else if (G.state === 'map') { if (k === 'KeyM' || k === 'Tab' || k === 'Escape' || k === 'Enter') { G.state = 'play'; hits = {}; } }
}
function updateCamera(dt) {
  const baseZ = clamp(Math.min(W, H) / 780, 0.6, 1.3);
  if (G.state === 'title') { cam.x = 2400 * S + Math.cos(G.t * 0.06) * 1000; cam.y = 1600 * S + Math.sin(G.t * 0.06) * 380; cam.z = baseZ * 0.82; }
  else if (G.state === 'play') {
    const P = player, c = P.car, spd = c ? carSpeed(c) : 0, tz = baseZ * (c ? lerp(1.21, 0.72, clamp(spd / 430, 0, 1)) : 1.3);            // about a tenth closer in on foot and at a crawl
    cam.z += (tz - cam.z) * Math.min(1, dt * 1.6);
    const lx = P.x + (c ? c.vx * 0.3 : P.vx * 0.12), ly = P.y + (c ? c.vy * 0.3 : P.vy * 0.12);
    cam.x += (lx - cam.x) * Math.min(1, dt * 6); cam.y += (ly - cam.y) * Math.min(1, dt * 6);
  }
  const hw = W / 2 / cam.z, hh = H / 2 / cam.z;
  if (hw * 2 < WW) cam.x = clamp(cam.x, hw, WW - hw); if (hh * 2 < WH) cam.y = clamp(cam.y, hh, WH - hh);
  cam.x0 = cam.x - hw; cam.x1 = cam.x + hw; cam.y0 = cam.y - hh; cam.y1 = cam.y + hh;
}
const _active = [];
function update(dt, first) {
  G.t += dt; const title = G.state === 'title', P = player;
  inp.up = !title && !!(keys.ArrowUp || keys.KeyW); inp.down = !title && !!(keys.ArrowDown || keys.KeyS); inp.left = !title && !!(keys.ArrowLeft || keys.KeyA); inp.right = !title && !!(keys.ArrowRight || keys.KeyD);
  inp.space = !title && !!keys.Space; inp.horn = !title && !!keys.KeyH; inp.spaceHit = first && !!hits.Space; inp.hornHit = first && !!hits.KeyH; inp.enterHit = first && !!(hits.Enter || hits.NumpadEnter || hits.KeyE || hits.KeyF);
  inp.nitro = !title && !!(keys.ShiftLeft || keys.ShiftRight || keys.KeyB); inp.nextHit = first && !!hits.KeyQ; inp.numHit = 0; if (first) for (let i = 1; i <= 5; i++) if (hits['Digit' + i]) inp.numHit = i;
  G.pnT = (G.pnT || 0) - dt; if (G.pnT <= 0) { G.pnT = 0.4; const o = P.car || P; G.playerNode = nearestNode(o.x, o.y); }
  if (!title) updatePlayer(dt, inp);
  const f = focusPos(); _active.length = 0;
  for (const c of cars) {
    if (c.horn > 0) c.horn -= dt;
    if (c === P.car) { _active.push(c); continue; }
    if (c.gone) continue;
    if (!c.ai && c.vx === 0 && c.vy === 0 && (Math.abs(c.x - f.x) > 1800 || Math.abs(c.y - f.y) > 1800)) continue;
    if (c.ai) { const k = aiControl(c, dt); if (c.gone) continue; updateCar(c, dt, k.thr, k.steer, k.hb); } else updateCar(c, dt, 0, 0, false);
    _active.push(c);
  }
  collideCars(_active);
  for (const c of _active) { collideCarPeds(c); collideCarProps(c); }
  for (let i = cars.length - 1; i >= 0; i--) {
    const c = cars[i]; if (c === P.car) continue; let kill = c.gone;
    if (!kill && !c.keep) { const d = hyp(c.x - f.x, c.y - f.y); if (c.ai) kill = d > (c.ai.mode === 'chase' ? 3600 : 2300); else if (c.dead) kill = d > 1600; else if (!c.parked0) kill = d > 2600; }
    if (kill) { c.gone = true; cars.splice(i, 1); }
  }
  for (let i = peds.length - 1; i >= 0; i--) { const p = peds[i]; updatePed(p, dt); if (p.dead || (!p.keep && hyp(p.x - f.x, p.y - f.y) > 1750)) peds.splice(i, 1); }
  updateProps(dt);
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; const k = Math.exp(-2.5 * dt); p.vx *= k; p.vy *= k; }
  for (let i = floaters.length - 1; i >= 0; i--) { floaters[i].t -= dt; if (floaters[i].t <= 0) floaters.splice(i, 1); }
  G.spawnT -= dt; if (G.spawnT <= 0) { G.spawnT = 0.2; spawnTraffic(); spawnPed(); }
  updateSalmon(dt);
  if (!title) {
    updatePolice(dt); updateMissions(dt); updatePickups(dt); updateShots(dt); updateCopShots(dt); G.nearShop = shopNear(); updatePzazz(dt); updateDinghy(dt);
    G.zoneT -= dt; G.znT = (G.znT || 0) - dt; if (G.znT <= 0) { G.znT = 0.5; const z = zoneAt(P.x, P.y); if (z !== G.zone) { G.zone = z; G.zoneT = 4; } }
    if (!G.pager && G.pagerQ.length) G.pager = { text: G.pagerQ.shift(), n: 0, hold: 0 };
    if (G.pager) { const pg = G.pager; if (pg.n < pg.text.length) { const b = Math.floor(pg.n); pg.n += dt * 55; if (Math.floor(pg.n) > b && Math.floor(pg.n) % 3 === 0) AudioFX.tick(); } else { pg.hold += dt; if (pg.hold > (G.pagerQ.length ? 3 : 8)) G.pager = null; } }
    if (G.big) { G.big.t -= dt; if (G.big.t <= 0) G.big = null; }
    if (G.hintT > 0) G.hintT -= dt; if (G.vehT > 0) G.vehT -= dt * (player.car && !player.car.sp.boat ? 0.6 : 1);
    saveT -= dt; if (saveT <= 0) { saveT = 15; if (G.money !== lastSaved) saveGame(); }
  }
  G.shake *= Math.exp(-7 * dt); if (G.shake < 0.2) G.shake = 0;
}
function updateAudio(dt) {
  const P = player, c = P.car, play = G.state === 'play';
  let siren = 0, horn = false, ring = 0, heli = 0;
  if (play) {
    for (const o of cars) { if (o.siren) siren = Math.max(siren, 0.25 + 0.75 * vol(o.x, o.y)); if (o.horn > 0 && onScreen(o.x, o.y, 100)) horn = true; }
    for (const h of helis) heli = Math.max(heli, clamp(1 - hyp(h.x - P.x, h.y - P.y) / 1300, 0, 1));
    if (!G.mission) for (const d of MISSIONS) ring = Math.max(ring, clamp(1 - hyp(d.phone.x - P.x, d.phone.y - P.y) / 650, 0, 1));
  }
  if (!play) AudioFX.nitro = 0;
  AudioFX.update(dt, { inCar: play && !!c, speed: c ? carSpeed(c) : 0, type: c ? c.type : '', thr: inp.up || inp.down, dead: c && (c.dead || c.sp.boat), horn, siren, ring, heli, t: G.t });
  if (!play) AudioFX.skid = 0;
}
function frame(ts) {
  const dt = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000 || 0)); lastTs = ts;
  if (G.state === 'play' || G.state === 'title') { update(dt / 2, true); update(dt / 2, false); } else G.t += dt * 0.0001;
  hits = {};
  updateCamera(dt); updateAudio(dt); render();
  requestAnimationFrame(frame);
}
function resize() { DPR = Math.min(window.devicePixelRatio || 1, 2); W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight; canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR); }
function boot() {
  canvas = document.getElementById('game'); ctx = canvas.getContext('2d');
  resize(); loadGame(); buildPaths(); initWorld(); updateCamera(0);
  for (let i = 0; i < 14; i++) { spawnTraffic(); spawnPed(); spawnPed(); }
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', e => { const k = e.code; if (GAMEKEYS.has(k)) e.preventDefault(); if (e.repeat || e.metaKey || e.ctrlKey) return; keys[k] = true; hits[k] = true; AudioFX.init(); onKey(k); });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (G.state === 'play') G.state = 'pause'; });
  canvas.addEventListener('pointerdown', () => { canvas.focus(); AudioFX.init(); if (G.state === 'title') startGame(); else if (G.state === 'pause') G.state = 'play'; else if (G.state === 'shop') { /* stay at the counter */ } });
  if (document.fonts && document.fonts.load) document.fonts.load("40px 'Bangers'").catch(() => {});
  window.__bb = { FALLS, DINGHY_SPOT, JETTY, salmon, G, player, cars, peds, cam, SPOTS, PHONES, MISSIONS, keys, startMission, missionPass, PROPS, pickups, S, shots, GOLFF, LM, copShots, helis, SHOPS, PUBS, DEALER, DODS, CRICKET, SPECS, WEAPONS, EDGES, TREES, BUILDINGS, HARD };
  requestAnimationFrame(frame);
}
boot();
