'use strict';
function missionPass(note) {
  const m = G.mission; if (!m) return;
  const r = m.def.reward + (m.bonus || 0), first = !G.done[m.def.id];
  endMission(); addMoney(r); G.done[m.def.id] = true; G.heat = 0; saveGame();
  bigText('JOB DONE!', (note ? note + '   ' : '') + '+£' + r, '#8dff6b', 4.6); AudioFX.pass();
  if (first && MISSIONS.every(d => G.done[d.id])) { addMoney(2000); pagerMsg("That's every job in the toon done. You are officially the top bampot in Banchory. Here's a £2000 bonus. Away and find the rest of the golden rowies."); }
}
function missionFail(why) { if (!G.mission) return; endMission(); bigText('JOB BOTCHED!', why, '#ff6b5c', 4); AudioFX.fail(); }
function missionEvent(ev, data) {
  const m = G.mission; if (!m) return;
  if (m.def.event) { const r = m.def.event(m, ev, data); if (r) return r; }
  if (!G.mission) return;
  if (ev === 'nicked') missionFail('The polis got you'); else if (ev === 'knackered') missionFail('You got knackered');
}
function updateMissions(dt) {
  const P = player;
  if (!G.mission) {
    let nearAny = false;
    for (const def of MISSIONS) {
      if (!near(P, def.phone, 50)) continue;
      nearAny = true;
      if (P.car) { if (Math.abs(P.car.vf) < 60) hint('Get oot to answer the phone', 0.5); }
      else if (G.phoneArmed && P.knock <= 0) { startMission(def); break; }
    }
    if (!nearAny) G.phoneArmed = true;
  } else {
    const m = G.mission; m.t += dt;
    if (G.timer !== null) {
      G.timer -= dt;
      if (G.timer <= 0) { G.timer = 0; const r = m.def.event && m.def.event(m, 'timeout'); if (G.mission === m && r !== 'handled') missionFail("Time's up"); return; }
    }
    m.def.update(m, dt);
  }
  // things in flight
  for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; if (f.t >= f.dur) { splash(f.x1, f.y1, true); AudioFX.splash(); floater(f.x1, f.y1 - 10, 'Plop!', '#cfeaff'); fx.splice(i, 1); } }
}
function updatePickups(dt) {
  const P = player;
  for (const p of pickups) {
    if (p.gone) { if (p.type !== 'rowie') { p.t -= dt; if (p.t <= 0) p.gone = false; } continue; }
    if (!near(P, p, P.car ? 30 : 20)) continue;
    if (p.type === 'rowie') {
      p.gone = true; G.rowies[p.id] = 1; const n = Object.keys(G.rowies).length; addMoney(100, p.x, p.y - 12); AudioFX.pickup();
      hint('Golden rowie ' + n + ' of ' + ROWIES.length, 2.5);
      if (n === ROWIES.length) { addMoney(1000); bigText('ALL THE ROWIES!', 'A baker\u2019s dozen, less one   +£1000', '#ffd21f', 4.5); AudioFX.pass(); }
      saveGame();
    } else if (p.type === 'weapon') {
      const Wp = WEAPONS[p.w], first = !P.has[p.w]; p.gone = true; p.t = 80; P.has[p.w] = true; if (Wp.per) P.ammo[p.w] += Wp.per; P.weapon = p.w; AudioFX.pickup();
      floater(p.x, p.y - 12, Wp.name + (Wp.per ? ' +' + Wp.per : ''), '#fff'); if (first) hint(Wp.name + ': SPACE on foot to use it, Q to switch', 3.5);
    } else if (P.hp < 5) { p.gone = true; p.t = 60; P.hp++; AudioFX.pickup(); floater(p.x, p.y - 12, 'Macaroni pie!', '#ffe9a8'); }
  }
  // Dod's Motors: a quick respray gets the polis off your back
  const c = P.car;
  if (c && near(c, SPOTS.respray, 46) && Math.abs(c.vf) < 40 && G.heat >= 1) {
    if (G.money >= 50) { addMoney(-50, c.x, c.y - 24); G.heat = 0; c.col = pick(CARCOLS.filter(x => x !== c.col)); c.dmg = Math.max(0, c.dmg - 40); puff(c.x, c.y, 16, c.col, 80, 9, 0.9); AudioFX.pickup(); hint('Resprayed. The polis are none the wiser.', 3); }
    else hint('Dod wants £50 for a respray', 0.5);
  }
}
