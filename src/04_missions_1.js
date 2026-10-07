'use strict';
// ---------- missions ----------
const fx = [];                                   // things flying through the air (a spade, mostly)
const near = (a, b, r) => hyp(a.x - b.x, a.y - b.y) < r;
function setObj(text, target) { G.obj = text; G.target = target || null; }
function findTagged(tag) { for (const c of cars) if (c.tag === tag && !c.gone && !c.sink) return c; return null; }
const LAD_SPOTS = [
  { name: 'The Stag', road: SPOTS.stagP, at: M(2300, 1528.5) }, { name: 'the Burnett Arms', road: SPOTS.burnettP, at: M(2140, 1471.5) },
  { name: 'the Douglas Arms', road: SPOTS.douglasP, at: M(2060, 1528.5) }, { name: "Scott Skinner's", road: SPOTS.skinnerP, at: M(4135, 1500.5) }
];
const MISSIONS = [
  {
    id: 'spade', title: 'The Spade', phone: PHONES.spade, reward: 500,
    start(m) {
      pagerMsg("DODE: Fit like? I, eh, borrowed the greenkeeper's prize spade and the polis are asking questions. It's planted in the flower bed in Bellfield Park. Get rid o it!");
      setObj('Dig the spade out of the flower bed in Bellfield Park', { x: SPOTS.spadeBed.x, y: SPOTS.spadeBed.y, r: 34 });
    },
    update(m, dt) {
      const P = player;
      if (m.step === 0) {
        if (!P.car && near(P, SPOTS.spadeBed, 36)) {
          m.step = 1; P.carrying = 'spade'; G.heat = Math.max(G.heat, 2.2); G.unseenT = 0; AudioFX.pickup();
          pagerMsg('A wifie in the park clocked you and phoned the polis. Chuck it off the Bridge of Dee, quick!');
          setObj('Take the spade to the Bridge of Dee. On foot, press SPACE to chuck it in', { x: SPOTS.bridge.x, y: SPOTS.bridge.y, r: 70 });
        } else if (P.car && near(P, SPOTS.spadeBed, 90)) hint('Get oot and dig', 0.5);
      } else if (m.step === 1) { if (P.car && near(P, SPOTS.bridge, 90) && Math.abs(P.car.vf) < 60) hint('Get oot, then press SPACE', 0.5); }
      else { m.d.t -= dt; if (m.d.t <= 0) missionPass('Evidence? What evidence?'); }
    },
    event(m, ev) {
      const P = player;
      if (ev === 'action' && m.step === 1 && !P.car) {
        if (!near(P, SPOTS.bridge, 84)) { if (riverDist(P.x, P.y) < 120) hint('Get to the middle of the bridge first'); return; }
        const dir = Math.cos(P.a) >= 0 ? 1 : -1;
        m.step = 2; m.d.t = 1.6; P.carrying = null; P.shove = 0.25; setObj('', null); G.heat = 0;
        fx.push({ type: 'spade', x0: P.x, y0: P.y, x1: P.x + dir * 175, y1: P.y + rnd(-30, 30), t: 0, dur: 0.95 }); AudioFX.whoosh();
        return 'handled';
      }
      if (ev === 'drookit' && m.step === 1) { missionPass('In you went, spade and all. That works.'); return 'handled'; }
    }
  },
  {
    id: 'box', title: 'Boxhead', phone: PHONES.box, reward: 400,
    start(m) {
      player.box = true; G.timer = 48;
      pagerMsg("IT'S A DARE: Run fae the Academy to Continental Creams on Dee Street wi this box on your head. Doon Schoolhill, along Station Road and the High Street, left at the lights. No peeking, no motors, and nae arrow to help you!");
      setObj('Leg it to Continental Creams on Dee Street', { x: SPOTS.ccDoor.x, y: SPOTS.ccDoor.y, r: 44 });
    },
    update(m) { if (near(player, SPOTS.ccDoor, 46) && !player.car && player.knock <= 0) { m.bonus = Math.round(G.timer) * 5; missionPass('A double nougat for the boxhead.'); } },
    event(m, ev) {
      if (ev === 'timeout') { missionFail('Too slow. The ice cream shop has shut.'); return 'handled'; }
      if (ev === 'drookit') { missionFail('The box went soggy'); return 'handled'; }
    }
  },
  {
    id: 'ice', title: 'Melting Point', phone: PHONES.ice, reward: 600,
    start(m) {
      let van = findTagged('icevan');
      if (!van || van.dead) { if (van) van.gone = true; const s = CP_BELL.spots[0]; van = makeCar('icevan', s.x, s.y, s.a, { tag: 'icevan' }); }
      van.keep = true; van.dmg = Math.min(van.dmg, 30); m.d.van = van;
      m.d.stops = [{ p: SPOTS.golfDoor, name: 'the Golf Club', add: 27 }, { p: SPOTS.burnettGate, name: 'Burnett Park, up Glassel Road', add: 53 }, { p: SPOTS.primaryGate, name: 'Banchory Primary School, on Arbeadie Road', add: 24 }, { p: SPOTS.academyGate, name: 'Banchory Academy, up Schoolhill', add: 0 }];
      G.timer = 35;
      pagerMsg("LUIGI: The freezer in the van is broken and there's orders all ower the toon. The van is in Bellfield car park, just doon Dee Street. Deliver afore it all melts!");
      setObj('Get in the ice cream van in Bellfield car park', { follow: van, r: 40 });
    },
    update(m) {
      const van = m.d.van;
      if (van.gone || van.sink > 0) { missionFail('The van is at the bottom of the river'); return; }
      if (van.dead) { missionFail('You wrecked the van'); return; }
      if (player.car !== van) { setObj('Get in the ice cream van', { follow: van, r: 40 }); return; }
      const s = m.d.stops[m.step];
      setObj('Deliver cones to ' + s.name + '  (' + m.step + '/' + m.d.stops.length + ')', { x: s.p.x, y: s.p.y, r: 62 });
      if (near(van, s.p, 66) && Math.abs(van.vf) < 45) {
        m.step++; addMoney(50, van.x, van.y - 24); AudioFX.pickup(); G.timer += s.add;
        for (let i = 0; i < 5; i++) floater(van.x + rnd(-50, 50), van.y + rnd(-40, 40), pick(['Yum!', 'A 99!', 'Raspberry sauce!', 'Cheers!']), '#ffd1e3');
        if (m.step >= m.d.stops.length) missionPass('Not a drip spilt.'); else hint('Delivered! +' + s.add + ' seconds', 2);
      }
    },
    event(m, ev, data) {
      const van = m.d.van;
      if (ev === 'crash' && player.car === van && data > 150) { G.timer = Math.max(1, G.timer - 3); floater(van.x, van.y - 28, 'Splat! -3s', '#ffb3d1'); }
      if (ev === 'timeout') { missionFail("It's all melted"); return 'handled'; }
      if (ev === 'drookit') { missionFail('The van is at the bottom of the river'); return 'handled'; }
    }
  },
  {
    id: 'buggy', title: 'Buggy Up Scolty', phone: PHONES.buggy, reward: 800,
    start(m) {
      let b = findTagged('buggy');
      if (!b || b.dead) { if (b) b.gone = true; b = makeCar('buggy', BUGGY_SPOT.x, BUGGY_SPOT.y, Math.PI / 2, { tag: 'buggy' }); }
      b.keep = true; b.dmg = Math.min(b.dmg, 20); m.d.b = b;
      pagerMsg("WULLIE: I've twenty quid on a golf buggy making it up Scolty. Nick the one at the first tee and park it at the tower. Mind, the club captain will be raging.");
      setObj('Nick the golf buggy at the first tee', { follow: b, r: 36 });
    },
    update(m) {
      const b = m.d.b;
      if (b.gone || b.sink > 0) { missionFail('The buggy is in the river'); return; }
      if (b.dead) { missionFail('The buggy conked oot'); return; }
      if (m.step === 0) {
        if (player.car === b) { m.step = 1; G.heat = Math.max(G.heat, 2.3); G.unseenT = 0; pagerMsg('The captain has phoned the polis! Ower the Bridge of Dee, first right, then up the Scolty track to the tower.'); }
        return;
      }
      if (player.car !== b) { setObj('Get back in the buggy', { follow: b, r: 36 }); return; }
      setObj('Park the buggy at Scolty Tower', { x: SPOTS.tower.x, y: SPOTS.tower.y, r: 72 });
      if (near(b, SPOTS.tower, 78) && Math.abs(b.vf) < 45) missionPass('What a view. Wullie is twenty quid up.');
    },
    event(m, ev) { if (ev === 'drookit') { missionFail('The buggy is in the river'); return 'handled'; } }
  },
  {
    id: 'stag', title: 'The Stag Do', phone: PHONES.stag, reward: 700,
    start(m) {
      G.timer = 84; m.d.got = 0;
      m.d.lads = LAD_SPOTS.map(s => { const p = makePed(s.at.x, s.at.y, 'stag'); p.state = 'wait'; p.keep = true; p.shirt = '#ff5fa2'; p.hat = 0; return { ped: p, spot: s, got: false }; });
      pagerMsg("THE MINISTER: The groom's pals are scattered roon the pubs and the wedding starts in two minutes. Find a motor, round up all four, and get them to the West Kirk!");
    },
    update(m) {
      const P = player, d = m.d;
      if (d.got < 4) {
        let best = null, bd = 1e9;
        for (const l of d.lads) {
          if (l.got) continue;
          if (l.ped.dead) { l.ped = makePed(l.spot.at.x, l.spot.at.y, 'stag'); l.ped.state = 'wait'; l.ped.keep = true; l.ped.shirt = '#ff5fa2'; l.ped.hat = 0; }
          const dd = hyp(l.spot.road.x - P.x, l.spot.road.y - P.y); if (dd < bd) { bd = dd; best = l; }
          if (P.car && near(P.car, l.spot.road, 70) && Math.abs(P.car.vf) < 42) {
            l.got = true; l.ped.dead = true; d.got++; P.pax = d.got; AudioFX.pickup(); G.timer += 5;
            floater(P.car.x, P.car.y - 26, pick(['Wahey!', 'Cheers, min!', 'Taxi!', 'Shotgun!']), '#ffb3d6');
          }
        }
        if (best && d.got < 4) setObj((P.car ? 'Pick up the lad outside ' + best.spot.name : 'Find a motor, then pick up the lads') + '  (' + d.got + '/4)', { x: best.spot.road.x, y: best.spot.road.y, r: 64 });
      }
      if (d.got >= 4) {
        setObj('Get the lads to the West Kirk', { x: SPOTS.kirkP.x, y: SPOTS.kirkP.y, r: 66 });
        if (P.car && near(P.car, SPOTS.kirkP, 72) && Math.abs(P.car.vf) < 42) {
          for (let i = 0; i < 4; i++) { const p = makePed(P.car.x + rnd(-30, 30), P.car.y + 30 + rnd(20), 'stag'); p.kind = 'ped'; p.antlers = true; p.shirt = '#ff5fa2'; p.hat = 0; p.flee = 4; say(p, pick(['Wahey!', 'Am I late?', 'Hic!', 'Fa has the rings?'])); }
          missionPass('Just in time. Nobody mention the antlers.');
        }
      }
    },
    cleanup(m) { for (const l of m.d.lads) l.ped.dead = true; },
    event(m, ev) { if (ev === 'timeout') { missionFail('The wedding started without them'); return 'handled'; } }
  }
];
function startMission(def) {
  const m = { def, step: 0, t: 0, d: {}, bonus: 0 };
  G.mission = m; G.timer = null; G.pagerQ.length = 0; G.pager = null;
  bigText(def.title, 'New job', '#ffd21f', 2.6); AudioFX.blip();
  def.start(m);
}
function endMission() {
  const m = G.mission; if (!m) return;
  if (m.def.cleanup) m.def.cleanup(m);
  G.mission = null; G.obj = ''; G.target = null; G.timer = null; G.phoneArmed = false;
  player.box = false; player.carrying = null; player.pax = 0;
}
