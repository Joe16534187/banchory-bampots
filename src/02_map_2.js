'use strict';
const SHEEP_FIELD = area('field', 3700, 3000, 800, 380, { crop: 'pasture', sheep: true }); reserve(3700, 3000, 800, 380);
const TURKEY_FIELD = area('field', 4580, 3300, 560, 420, { crop: 'pasture' }); reserve(4560, 3040, 620, 700);
const SCOLTY = { x: 600 * S, y: 3450 * S, r: 560 * S };
// parks and the golf course (west of Dee Street, between Inchmarlo Road and the river)
const BELLFIELD = area('park', 2740, 1850, 420, 350, { name: 'Bellfield Park' }); reserve(2740, 1850, 420, 350);
const BURNETT_PARK = area('park', 900, 760, 480, 340, { name: 'Burnett Park', pitch: true }); reserve(900, 760, 480, 340);
const GOLF_A = area('golf', 920, 1640, 480, 720), GOLF_B = area('golf', 1420, 2010, 1080, 430); reserve(920, 1640, 480, 720); reserve(1420, 2010, 1080, 430);
const GOLFF = {
  fair: [[1170, 1720, 200, 70, 0.2], [1140, 2030, 70, 190, 0.05], [1250, 2305, 130, 44, -0.1], [2060, 2185, 220, 52, 0.1], [1800, 2345, 290, 46, 0.03], [2360, 2330, 120, 52, -0.2]].map(f => [f[0] * S, f[1] * S, f[2] * S, f[3] * S, f[4]]),
  greens: [[1345, 1705], [1125, 2262], [1010, 1960], [2305, 2160], [2130, 2352], [1470, 2372], [2435, 2385]].map(g => M(g[0], g[1])),
  tee: M(1500, 2075), tuts: null
};
[[1720, 2090, 125, 50, 0, 1], [1290, 1735, 44, 22, 0.3], [1378, 1775, 20, 16, 0], [1060, 2200, 40, 22, -0.4], [1205, 2335, 44, 18, 0.2], [985, 1885, 28, 42, 0], [2235, 2095, 46, 22, 0.2],
  [2380, 2215, 38, 20, -0.3], [2060, 2405, 48, 17, 0.1], [2215, 2325, 34, 20, 0.4], [1565, 2405, 40, 17, 0], [2468, 2300, 24, 36, 0], [1905, 2262, 44, 20, -0.2]]
  .forEach(b => { const o = { x: b[0] * S, y: b[1] * S, rx: b[2] * S, ry: b[3] * S, rot: b[4], c: Math.cos(b[4]), s: Math.sin(b[4]) }; BUNKERS.push(o); if (b[5]) GOLFF.tuts = o; });
const PITCH = area('pitch', 3340, 860, 300, 240); reserve(3035, 830, 632, 530); reserve(1000, 1150, 420, 240); reserve(4380, 1060, 440, 360);
// tarmac
const CP_BELL = carpark(2580, 1712, 205, 112), CP_SHOP = carpark(4400, 1250, 400, 156), CP_GOLF = carpark(1600, 1905, 215, 76),
  CP_SCOLTY = carpark(1435, 2978, 135, 76), CP_ACAD = carpark(3370, 1270, 172, 76);
const PLAYGROUND = hard(3165, 1040, 125, 100, 'play'), SQUARE = hard(2436, 1535, 86, 84, 'square');
const YARD_POLIS = hard(1276, 1497, 60, 70), YARD_TURKEY = hard(4700, 3125, 220, 64), YARD_GARAGE = hard(3796, 1550, 138, 40), YARD_PETROL = hard(4430, 1590, 120, 30), YARD_FARM = hard(4030, 2918, 150, 66), YARD_TOR = hard(1125, 1335, 170, 44);

// ---------- buildings ----------
const BUILDINGS = [];
const GRANITE = ['#b9b2a9', '#c4b7ae', '#aeaaa4', '#c9c1b6', '#bdb0a6'], HARL = ['#e9e3d3', '#ded8c8', '#efe9dc'],
  SLATE = ['#57626f', '#4f5a66', '#646c77', '#5a5f6b'], TILE = ['#9c5540', '#8a5a48'];
function Bpx(x, y, w, h, o) { const b = Object.assign({ x, y, w, h, ht: 2, wall: spick(GRANITE), roof: spick(SLATE), style: 'pitch', label: '' }, o || {}); BUILDINGS.push(b); return b; }
function B(x, y, w, h, o) { return Bpx(x * S, y * S, w * S, h * S, o); }
const LM = {};  // named landmarks
function L(key, name, b) { b.lm = name; LM[key] = b; return b; }

// High Street, north side (odd numbers), west to east. Mount Street runs up beside the Burnett Arms.
B(1732, 1392, 62, 73, { label: 'TOWN|HALL', ht: 3, wall: '#aeaaa4' }); B(1802, 1410, 38, 42, { ht: 5, wall: '#aeaaa4', roof: '#4a5560', style: 'spire' });
L('kirk', 'West Kirk', B(1846, 1392, 120, 73, { label: 'WEST KIRK', ht: 3, wall: '#aeaaa4', roof: '#4f5a66' }));
L('burnett', 'Burnett Arms', B(2032, 1383, 150, 82, { label: 'BURNETT ARMS', ht: 3, wall: '#c4b7ae', awn: 'S', awnCol: '#7b2331' }));
B(2190, 1400, 66, 65, { label: 'BAKER', awn: 'S', awnCol: '#d99a2b' }); B(2264, 1390, 84, 75, { label: 'BANK', ht: 3, wall: '#aeaaa4' });
B(2356, 1400, 70, 65, { label: 'BUTCHER', awn: 'S', awnCol: '#b0302c' }); B(2434, 1393, 86, 72, { label: 'POST OFFICE', awn: 'S', awnCol: '#c8281e' });
B(2528, 1400, 84, 65, { label: 'TWEEDS', awn: 'S', awnCol: '#5c6b3a' }); B(2620, 1395, 110, 70, { label: 'BOOKSHOP', awn: 'S', awnCol: '#3b4a7a', ht: 3 });
B(2738, 1400, 64, 65, { label: 'FLORIST', awn: 'S', awnCol: '#b0508a' }); B(2810, 1400, 86, 65, { label: 'FISHMONGER', awn: 'S', awnCol: '#3f8fa8' }); B(2904, 1395, 60, 70, { label: 'LIBRARY', ht: 3 });
B(2200, 1302, 70, 60, { label: 'CHIPPER', awn: 'N', awnCol: '#2f6fb0', wall: HARL[0] });      // on Watson Street
// High Street, south side (even numbers). The Stag sits on the corner of Dee Street.
B(1740, 1535, 100, 66, { label: 'IRONMONGER', awn: 'N', awnCol: '#444' }); B(1848, 1535, 82, 62, { label: 'CAFE', awn: 'N', awnCol: '#c56a2a', wall: HARL[1] }); B(1938, 1535, 84, 64, { label: 'NEWSAGENT', awn: 'N', awnCol: '#2b62a8' });
L('douglas', 'Douglas Arms', B(2030, 1535, 140, 85, { label: 'DOUGLAS ARMS', ht: 3, wall: '#bdb0a6', awn: 'N', awnCol: '#27406b' }));
B(2178, 1535, 46, 70, { label: 'CHEMIST', awn: 'N', awnCol: '#2e8a57', ht: 3 });
L('stag', 'The Stag', B(2232, 1535, 140, 85, { label: 'THE STAG', ht: 3, wall: '#e9e3d3', awn: 'N', awnCol: '#1f5a3a' }));
B(2530, 1535, 84, 66, { label: 'CURRY HOUSE', awn: 'N', awnCol: '#c2452b' }); B(2622, 1535, 84, 64, { label: 'BARBER', awn: 'N', awnCol: '#b22' });
B(2714, 1535, 86, 66, { label: 'TOY SHOP', awn: 'N', awnCol: '#e0a020' }); B(2808, 1535, 92, 64, { label: 'GIFTS', awn: 'N', awnCol: '#7a3fa0' }); B(2908, 1535, 86, 66, { label: 'WOOL SHOP', awn: 'N', awnCol: '#3f8a6a' });
// Dee Street (even numbers on the west side), Bridge Street and Bellfield
L('cc', 'Continental Creams', B(2352, 1632, 74, 84, { label: 'CONTINENTAL|CREAMS', wall: '#f3ead8', roof: '#c9577a', awn: 'E', awnCol: '#f08fb0' }));
B(2200, 1668, 90, 66, { label: 'MUSEUM', awn: 'S', awnCol: '#6b5a45' });
L('health', 'Health Centre', B(2800, 1716, 140, 72, { label: 'HEALTH CENTRE', style: 'flat', wall: '#d8d2c4', roof: '#8d949b' }));
L('scout', 'Scout Hut', B(2552, 2215, 110, 70, { label: 'SCOUT HUT', ht: 1, wall: '#8a6a4a', roof: '#3d6b4a' }));
L('lodge', 'Banchory Lodge', B(3010, 2316, 140, 80, { label: 'BANCHORY LODGE', ht: 3, wall: '#efe9dc' }));
// west: Tor-na-Coille looks across Inchmarlo Road to the golf course; the clubhouse is at the end of Kinneskie Road
L('tor', 'Tor-na-Coille', B(1120, 1235, 170, 90, { label: 'TOR-NA-COILLE', ht: 3, wall: '#bdb0a6', roof: '#4f5a66' }));
L('golf', 'Golf Club', B(1390, 1925, 150, 85, { label: 'GOLF CLUB', wall: '#efe9dc', roof: '#3d6b4a' }));
B(1240, 790, 84, 50, { label: 'PAVILION', ht: 1, wall: HARL[0], roof: '#7b8a5a' });
// east: Station Road and North Deeside Road
L('polis', 'Police Station', B(1150, 1492, 120, 76, { label: 'POLICE', style: 'flat', wall: '#aeb4bd', roof: '#6d7783' }));
L('primary', 'Banchory Primary School', B(3060, 1150, 230, 105, { label: 'BANCHORY|PRIMARY SCHOOL', wall: '#c4b7ae', roof: '#646c77' })); B(3060, 1050, 90, 96, { wall: '#c4b7ae', roof: '#646c77' });
L('academy', 'Banchory Academy', B(3340, 1140, 250, 100, { label: 'BANCHORY ACADEMY', ht: 3, style: 'flat', wall: '#c9c1b6', roof: '#8d949b' })); B(3600, 1150, 62, 110, { ht: 2, style: 'flat', wall: '#b9b2a9', roof: '#99a0a6', label: 'GAMES|HALL' });
L('skinner', "Scott Skinner's", B(4060, 1395, 150, 82, { label: "SCOTT SKINNER'S", ht: 2, wall: '#e9e3d3', roof: '#4f5a66', awn: 'S', awnCol: '#8a5a2b' }));
L('garage', "Dod's Motors", B(3800, 1592, 130, 80, { label: "DOD'S MOTORS|RESPRAYS", style: 'flat', wall: '#9aa3ad', roof: '#3f7fb5' }));
L('shop', 'Big Shop', B(4430, 1080, 300, 150, { label: 'BIG SHOP', style: 'flat', ht: 2, wall: '#d8d2c4', roof: '#a8adb2' }));
B(4440, 1620, 100, 56, { label: 'PETROL', style: 'flat', ht: 1, wall: '#d8d2c4', roof: '#c53a30' });
L('barn', 'Woodend Barn', B(4690, 730, 130, 80, { label: 'WOODEND BARN', wall: '#7a5a48', roof: '#8a3f33' }));
// south of the river
L('tower', 'Scolty Tower', B(548, 3500, 26, 26, { ht: 5, style: 'tower', wall: '#9a948c', roof: '#7f7a72' }));
L('farm', 'Mains Farm', B(3800, 2900, 92, 56, { label: 'MAINS FARM', wall: HARL[2] })); B(3900, 2900, 124, 70, { wall: '#7a5a48', roof: '#8a3f33', ht: 2 });
L('feugh', 'Falls of Feugh Tearoom', B(3400, 2640, 92, 60, { label: 'TEAROOM', wall: HARL[0], roof: TILE[0] }));
L('turkey', 'Turkey Farm', B(4600, 3205, 200, 62, { label: 'TURKEY FARM', ht: 1, wall: '#9c8f7f', roof: '#b9b2a9' })); B(4830, 3205, 200, 62, { ht: 1, wall: '#9c8f7f', roof: '#a8a297' }); B(4960, 3090, 92, 56, { wall: HARL[1], roof: TILE[1], chim: true, house: true });
const PLOTS = [];
function house(x, y, w, h) { B(x, y, w, h, { house: true, chim: true, wall: spick(GRANITE.concat(HARL)), roof: spick(SLATE) }); PLOTS.push({ x: (x - 12) * S, y: (y - 12) * S, w: (w + 24) * S, h: (h + 24) * S, col: '#7cc05a' }); }
house(2838, 2750, 52, 38); house(2946, 2762, 52, 38); house(3054, 2774, 52, 38);        // on the road from the Bridge of Dee towards the Feugh
house(2652, 2728, 52, 38); house(2542, 2748, 52, 38);                                      // on the Scolty road, just over the bridge
const HAND_BUILT = BUILDINGS.length;

// ---------- props, pickups, phones (placed before houses so they stay clear) ----------
const PROPS = [], TREES = [], PARKED = [];
function prop(type, x, y, o) { const p = Object.assign({ type, x, y, x0: x, y0: y, rot: 0, vx: 0, vy: 0, vr: 0, knocked: false, solid: type === 'phone' || type === 'post' || type === 'totem' || type === 'memorial', r: 8 }, o || {}); PROPS.push(p); return p; }
const PHONES = { spade: M(2588, 1880), box: M(3476, 1362), ice: M(2474, 1730), buggy: M(1570, 1918), stag: M(1830, 1471.5) };
for (const k in PHONES) { prop('phone', PHONES[k].x, PHONES[k].y, { r: 10 }); CLEAR.push({ x: PHONES[k].x, y: PHONES[k].y, r: 60 }); }
const SPOTS = {     // mission places, in pixels
  start: M(2300, 1528.5), spadeBed: M(2950, 2020), bridge: M(2770, 2540), ccDoor: M(2452, 1675), tower: M(612, 3492),
  primaryGate: M(3012, 1200), burnettGate: M(842, 930), golfDoor: M(1560, 1880), bellCP: M(2680, 1768),
  stagP: M(2300, 1514), burnettP: M(2140, 1486), douglasP: M(2060, 1514), skinnerP: M(4135, 1516), kirkP: M(1905, 1486),
  respray: M(3865, 1570), polisDoor: M(1210, 1482), healthDoor: M(2870, 1806), academyGate: M(3450, 1365)
};
