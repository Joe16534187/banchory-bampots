# Banchory Bampots

A wee top-down crime caper set in a stylised Banchory, Royal Deeside. It is an affectionate, unofficial homage to the
original top-down Grand Theft Auto games, with slapstick rules: folk fall over and get back up, motors conk out, and
you get NICKED, DROOKIT or KNACKERED instead of anything worse.

Plain HTML, canvas and JavaScript. No dependencies and no build step.

## Play

Open `index.html` in a desktop browser (a keyboard is needed). It also works as a GitHub Pages site served from the
repository root.

| Key | Action |
|---|---|
| Arrows or WASD | Walk, or drive (up is go, down is brake and reverse) |
| Enter or E | Get in or out of a vehicle |
| Space | Handbrake when driving. Use your weapon on foot |
| Q or 1 to 5 | Switch weapon |
| T | Go in: a pub door, Dod's Motors (in a vehicle), or Big Eck's stall at Glen O' Dee |
| Shift | Nitro (the Pzazz, or any vehicle with Dod's nitro kit) |
| H | Horn. Siren in a police vehicle, the big gun in a tank |
| M | Map |
| P | Pause |
| N | Sound on or off |

Answer a ringing phone box to start a job: The Spade, Boxhead, Melting Point, Buggy Up Scolty and The Stag Do.
Progress is saved in the browser's local storage.

### The polis

The more stars, the worse it gets. Nobody dies: baton rounds cost a heart, shells send motors spinning.

| Stars | What turns up | What they do |
|---|---|---|
| 1 | Patrol car | Tails you. You are only nicked if cornered and standing still |
| 2 | Riot van | Rams you and cuts you off, with the odd baton round |
| 3 | Helicopter and more vans | Everyone fires, and cars will run you down on foot. The helicopter cannot see you under trees |
| 4 | Tanks and army jeeps | Tanks shell you. A red ring shows where each shell will land |

### Spending money

- **Pubs** (The Stag, Burnett Arms, Douglas Arms, Scott Skinner's, and the Tor-na-Coille and Banchory Lodge bars):
  pints and nips restore hearts but leave you tipsy, stovies sober you up, a round for the bar takes a star off.
- **Big Eck**, in the grounds of the ruined Glen O' Dee hospital: weapons, ammunition and tweed body armour.
- **Dod's Motors**: respray, repairs, tartan paint, grippy tyres, bull bars, engine tune and a nitro kit.

## Code layout

The files in `src/` are ordinary scripts that share one global scope, so they must load in name order.

| Files | Contents |
|---|---|
| `01_core.js` | Maths helpers and the seeded random generator used to lay out the town |
| `02_map_*.js` | Roads, rivers, landmarks, generated houses and trees, collision grid, place names |
| `03_entities_*.js` | Vehicles and driving model, traffic and police AI, pedestrians, the player, weapons, the dinghy. `03_entities_6.js` holds police weapons and the helicopter |
| `04_missions_*.js` | Phone box jobs and pickups |
| `04_shops.js` | Pubs, Big Eck's stall and Dod's Motors |
| `05_render_*.js` | All drawing: ground, buildings, vehicles, people, HUD, map, shop and title screens |
| `06_audio.js` | Synthesised sound (Web Audio) |
| `07_main.js` | Input, saving, camera and the main loop |

Map coordinates are in "map units" (`S = 2` pixels each). Most places are set by hand near the top of `02_map_*.js`.

## Single-file build

`./build.sh` writes `dist/banchory-bampots.html`, one self-contained file with all the scripts inlined.

## Notes

The map is stylised, not surveyed. Real business names are used only as landmarks; this project is not affiliated
with any of them.
