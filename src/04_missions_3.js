'use strict';
// ---------- Hamlet: a piglet, a stampede, and a funeral nobody saw coming ----------
const FUNERAL = ['We are gathered to mind on Hamlet.', 'He was a good pig.', 'A short life, but a muddy one.', 'He never complained. He couldnae.', 'Ashes to ashes. Ham to ham.', 'Gang weel, wee yin.'];
MISSIONS.push({
  id: 'pig', title: 'Hamlet', phone: PHONES.pig, reward: 900,
  start(m) {
    const d = m.d; d.pig = this.loosePig(SPOTS.pigStart.x, SPOTS.pigStart.y);
    stampede(true); G.timer = 60;
    pagerMsg("AGNES AT INCHMARLO FARM: Help! Wee Hamlet the piglet has got in amang the coos and set them stampeding. Get in aboot and grab him afore he's flattened. And mind yersel: thon coos will flatten you an a!");
    setObj('Rescue Hamlet the piglet from the stampede. On foot, run into him to pick him up', { follow: d.pig, r: 26 });
  },
  loosePig(x, y) { const p = makePed(x, y, 'pig'); p.state = 'panic'; p.back = 'panic'; p.home = COW_HOME; p.keep = true; p.animal = true; p.spd = 96; return p; },
  update(m, dt) {
    const P = player, d = m.d, T = SPOTS.stanes;
    if (m.step === 0) {                                                      // in amang the coos
      herdUpdate(dt, d.pig);
      if (d.pig.dead) { d.pig = this.loosePig(SPOTS.pigStart.x, SPOTS.pigStart.y); G.target = { follow: d.pig, r: 26 }; }
      if (!P.car && P.knock <= 0 && d.pig.state === 'panic' && near(P, d.pig, 18)) {
        d.pig.dead = true; d.pig = null; P.carrying = 'pig'; m.step = 1; G.timer = null; AudioFX.pickup(); AudioFX.squeal(); say(P, 'Got you!', 1.4);
        if (!d.told) { d.told = true; pagerMsg("AGNES: You've got him! He canna bide here, the coos will never settle. There's folk bide at the auld stanes, in the woods at the top of the Glassel Road, wha take in waifs and strays. Awa up there wi him. The track is on your left."); }
        setObj('Take Hamlet to the folk at the auld stanes: up the Glassel Road, then left along the forest track', { x: T.x, y: T.y, r: 80 });
      } else if (P.car && near(P, d.pig, 90) && Math.abs(P.car.vf) < 60) hint('Get oot and grab him', 0.5);
    } else if (m.step === 1) {                                               // away to the woods
      const hm = COW_HOME, inField = P.x > hm.x - 60 && P.x < hm.x + hm.w + 60 && P.y > hm.y - 60 && P.y < hm.y + hm.h + 60;
      if (G.herd) { herdUpdate(dt, null); if (!inField) { d.calm = (d.calm || 0) + dt; if (d.calm > 4) stampede(false); } else d.calm = 0; }
      if (!P.car && near(P, T, 84)) {
        m.step = 2; d.t = 0; d.line = 0; P.carrying = null; AudioFX.pickup(); stampede(false);
        const pg = makePed(T.x, T.y, 'pig'); pg.state = 'wait'; pg.stay = true; pg.keep = true; pg.animal = true; pg.a = Math.PI / 2; d.fpig = pg;
        G.funeral = { t: 0, coffin: false };
        say(G.pagans[0], 'A piglet! The Great Boar provides.', 2.6); setObj('The folk of the stanes take Hamlet in', null);
      } else if (P.car && near(P, T, 190) && Math.abs(P.car.vf) < 60) hint('Get oot and carry him ower to the stanes', 0.5);
    } else if (m.step === 2) {                                               // the service
      d.t += dt; G.funeral.t = d.t;
      if (!G.funeral.coffin && d.t > 3.2) {
        G.funeral.coffin = true; d.fpig.dead = true; d.fpig = null; puff(T.x, T.y, 16, '#7a5aa8', 90, 10, 1.2); AudioFX.toll(); G.shake = 5;
        say(G.pagans[0], 'He is at peace noo.', 2.4); say(P, 'Wait, whit?', 2); setObj("Hamlet's funeral. Pay your respects", { x: T.x, y: T.y, r: 80 });
      }
      if (G.funeral.coffin) {
        G.pagans.forEach(p => { const an = p.ring + (d.t - 3.2) * 0.3; p.post = { x: T.x + Math.cos(an) * 58, y: T.y + Math.sin(an) * 58 }; });        // a slow walk roon the stanes
        const k = Math.floor((d.t - 5) / 2.3);
        if (k >= d.line && k < FUNERAL.length) { d.line = k + 1; say(G.pagans[(k * 2) % 6], FUNERAL[k], 2.2); if (k % 2 === 0) AudioFX.toll(); }
      }
      if (d.t > 17) {                                                        // and then somebody clypes
        m.step = 3; G.heat = Math.max(G.heat, 3.6); G.unseenT = 0; polisRaid();
        G.pagans.forEach(p => { const an = Math.atan2(p.y - T.y, p.x - T.x) + rnd(-0.5, 0.5), r = rnd(300, 420); p.post = { x: T.x + Math.cos(an) * r, y: T.y + Math.sin(an) * r }; p.flee = 14; p.face = null; });
        say(G.pagans[0], 'The polis! Scatter!', 2.5); bigText('THE POLIS!', 'Somebody clyped. Lose them', '#8fb8ff', 3.4);
        pagerMsg('An unlicensed funeral, one stolen pig and a toon full of polis. Three stars. Shake them off: the helicopter cannae see you under the trees.');
        setObj('Shake off the polis', null);
      }
    } else if (G.heat < 1) missionPass('Hamlet would have wanted it this way. Probably.');
  },
  event(m, ev) {
    const P = player, d = m.d;
    if (ev === 'trampled' && m.step === 1 && P.carrying === 'pig') {         // dropped him: back in you go
      P.carrying = null; m.step = 0; G.timer = 45; d.calm = 0; if (!G.herd) stampede(true);
      d.pig = this.loosePig(P.x, P.y); knockPed(d.pig, rnd(-120, 120), rnd(-120, 120), false);
      setObj('You dropped Hamlet! Grab him again', { follow: d.pig, r: 26 });
    }
    if (ev === 'timeout') { missionFail('The coos got to Hamlet first'); return 'handled'; }
  },
  cleanup(m) { const d = m.d; if (d.pig) d.pig.dead = true; if (d.fpig) d.fpig.dead = true; stampede(false); G.funeral = null; pagansHome(); }
});
