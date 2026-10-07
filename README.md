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
| Shift | Nitro (the Pzazz only) |
| H | Horn |
| M | Map |
| P | Pause |
| N | Sound on or off |

Answer a ringing phone box to start a job: The Spade, Boxhead, Melting Point, Buggy Up Scolty and The Stag Do.
Progress is saved in the browser's local storage.

## Code layout

The files in `src/` are ordinary scripts that share one global scope, so they must load in name order.

| Files | Contents |
|---|---|
| `01_core.js` | Maths helpers and the seeded random generator used to lay out the town |
| `02_map_*.js` | Roads, rivers, landmarks, generated houses and trees, collision grid, place names |
| `03_entities_*.js` | Vehicles and driving model, traffic and police AI, pedestrians, the player, weapons, the dinghy |
| `04_missions_*.js` | Phone box jobs, pickups, the respray garage |
| `05_render_*.js` | All drawing: ground, buildings, vehicles, people, HUD, map and title screens |
| `06_audio.js` | Synthesised sound (Web Audio) |
| `07_main.js` | Input, saving, camera and the main loop |

Map coordinates are in "map units" (`S = 2` pixels each). Most places are set by hand near the top of `02_map_*.js`.

## Single-file build

`./build.sh` writes `dist/banchory-bampots.html`, one self-contained file with all the scripts inlined.

## Notes

The map is stylised, not surveyed. Real business names are used only as landmarks; this project is not affiliated
with any of them.
