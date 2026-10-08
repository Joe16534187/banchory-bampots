'use strict';
// ---------- sound (all synthesised, nothing to download) ----------
const AudioFX = (function () {
  let ac = null, master = null, nbuf = null, eng = null, eng2 = null, engF = null, engG = null, hornG = null, sirO = null, sirG = null, ringG = null, skidG = null, nitG = null, nitF = null, heliG = null;
  let jingleOn = false, jT = 0, jI = 0, muted = false, ringT = 0;
  // Greensleeves (traditional), the classic ice cream van chime
  const N = { E4: 329.63, G4: 392, Gs4: 415.3, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46 };
  const TUNE = [['A4', 2], ['C5', 4], ['D5', 2], ['E5', 3], ['F5', 1], ['E5', 2], ['D5', 4], ['B4', 2], ['G4', 3], ['A4', 1], ['B4', 2], ['C5', 4], ['A4', 2], ['A4', 3], ['Gs4', 1], ['A4', 2], ['B4', 4], ['Gs4', 2], ['E4', 4], [null, 2]];
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { ac = new AC(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination);
    nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const osc = (type, f, dest) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.connect(dest); o.start(); return o; };
    engF = ac.createBiquadFilter(); engF.type = 'lowpass'; engF.frequency.value = 500; engG = ac.createGain(); engG.gain.value = 0; engF.connect(engG); engG.connect(master);
    eng = osc('sawtooth', 60, engF); eng2 = osc('square', 30, engF);
    hornG = ac.createGain(); hornG.gain.value = 0; hornG.connect(master); osc('square', 415, hornG); osc('square', 523, hornG);
    sirG = ac.createGain(); sirG.gain.value = 0; sirG.connect(master); sirO = osc('square', 660, sirG);
    ringG = ac.createGain(); ringG.gain.value = 0; ringG.connect(master); osc('sine', 400, ringG); osc('sine', 450, ringG);
    const sf = ac.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1900; sf.Q.value = 2.5; skidG = ac.createGain(); skidG.gain.value = 0; sf.connect(skidG); skidG.connect(master);
    const ns = ac.createBufferSource(); ns.buffer = nbuf; ns.loop = true; ns.connect(sf); ns.start();
    // helicopter: low rumble chopped by the blades
    const hf = ac.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 260; const hc = ac.createGain(); hc.gain.value = 0.5; heliG = ac.createGain(); heliG.gain.value = 0; ns.connect(hf); hf.connect(hc); hc.connect(heliG); heliG.connect(master);
    const hl = ac.createOscillator(), hlg = ac.createGain(); hl.type = 'square'; hl.frequency.value = 13; hlg.gain.value = 0.5; hl.connect(hlg); hlg.connect(hc.gain); hl.start();
    nitF = ac.createBiquadFilter(); nitF.type = 'bandpass'; nitF.frequency.value = 600; nitF.Q.value = 1.2; nitG = ac.createGain(); nitG.gain.value = 0; ns.connect(nitF); nitF.connect(nitG); nitG.connect(master);
  }
  function tone(f, dur, type, vol, slide, delay) {
    if (!ac) return; const t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, vol, freq, q, type, delay, slide) {
    if (!ac) return; const t = ac.currentTime + (delay || 0), s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = nbuf; f.type = type || 'lowpass'; f.frequency.setValueAtTime(freq || 1200, t); if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + dur); f.Q.value = q || 0.7;
    g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
  }
  const set = (p, v, k) => { if (ac) p.setTargetAtTime(v, ac.currentTime, k || 0.05); };
  return {
    init, skid: 0, nitro: 0,
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.5; },
    update(dt, s) {
      if (!ac) return;
      // engine
      if (s.inCar) {
        const tr = s.type === 'tractor', bg = s.type === 'buggy', k = clamp(s.speed / 420, 0, 1.2);
        set(eng.frequency, (tr ? 38 : bg ? 110 : 52) + k * (tr ? 60 : bg ? 120 : 150) + (s.thr ? 8 : 0)); set(eng2.frequency, (tr ? 19 : 26) + k * (tr ? 30 : 75));
        set(engF.frequency, 300 + k * 1100 + (s.thr ? 250 : 0)); set(engG.gain, s.dead ? 0 : (bg ? 0.035 : 0.06) + (s.thr ? 0.035 : 0), 0.08);
      } else set(engG.gain, 0, 0.08);
      set(hornG.gain, s.horn ? 0.07 : 0, 0.01);
      set(sirG.gain, s.siren * 0.05, 0.1); if (s.siren > 0) sirO.frequency.value = (s.t % 1.1) < 0.55 ? 660 : 495;
      // British double ring from a nearby phone box
      ringT = (ringT + dt) % 3; const on = ringT < 0.4 || (ringT > 0.6 && ringT < 1.0); set(ringG.gain, on ? s.ring * 0.07 : 0, 0.01);
      set(skidG.gain, this.skid ? 0.09 : 0, 0.04); this.skid = 0;
      set(nitG.gain, this.nitro ? 0.22 : 0, 0.06); set(nitF.frequency, this.nitro ? 1500 : 500, 0.5); this.nitro = 0;
      set(heliG.gain, (s.heli || 0) * 0.5, 0.15);
      if (jingleOn) { jT -= dt; if (jT <= 0) { const n = TUNE[jI % TUNE.length]; jI++; jT = n[1] * 0.125; if (n[0]) { tone(N[n[0]] * 2, n[1] * 0.125 + 0.25, 'triangle', 0.1); tone(N[n[0]] * 4, n[1] * 0.1 + 0.1, 'sine', 0.035); } } }
    },
    jingle(on) { jingleOn = on === 'toggle' ? !jingleOn : !!on; if (jingleOn) { jT = 0; jI = 0; } },
    crash(v) { v = v === undefined ? 0.6 : v; if (v < 0.03) return; noise(0.35, 0.5 * v, 900, 0.8, 'lowpass', 0, 200); tone(90, 0.22, 'sine', 0.45 * v, 40); noise(0.12, 0.25 * v, 3000, 1, 'bandpass'); },
    clatter(v) { v = v === undefined ? 0.6 : v; if (v < 0.03) return; noise(0.1, 0.3 * v, 2400, 3, 'bandpass'); noise(0.12, 0.25 * v, 1500, 3, 'bandpass', 0.08); tone(240, 0.08, 'square', 0.08 * v, 120); },
    bonk() { tone(260, 0.28, 'sine', 0.3, 620); tone(180, 0.1, 'triangle', 0.25, 90); },
    baa() { if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), l = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain(), f = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(470, t); o.frequency.linearRampToValueAtTime(400, t + 0.55); l.frequency.value = 11; lg.gain.value = 28; l.connect(lg); lg.connect(o.frequency); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 1.2; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); o.connect(f); f.connect(g); g.connect(master); o.start(t); l.start(t); o.stop(t + 0.65); l.stop(t + 0.65); },
    gobble() { for (let i = 0; i < 6; i++) tone(520 + (i % 2) * 180 + Math.random() * 60, 0.06, 'sawtooth', 0.09, 380, i * 0.055); },
    plip(v) { v = v === undefined ? 0.5 : v; if (v < 0.03) return; noise(0.18, 0.2 * v, 2400, 0.8, 'lowpass', 0, 500); tone(700, 0.08, 'sine', 0.1 * v, 300); },
    splash() { noise(0.6, 0.45, 2600, 0.6, 'lowpass', 0, 300); tone(160, 0.3, 'sine', 0.2, 60); },
    slap() { noise(0.09, 0.4, 1800, 1.2, 'bandpass'); noise(0.12, 0.3, 500, 0.8, 'lowpass', 0.02); tone(210, 0.1, 'sine', 0.2, 90); },
    pop() { tone(520, 0.09, 'triangle', 0.22, 140); noise(0.05, 0.18, 1200, 1, 'bandpass'); },
    fizz() { noise(0.9, 0.25, 3000, 1.2, 'highpass', 0, 6000); tone(300, 0.5, 'sawtooth', 0.06, 900); },
    boom(v) { v = v === undefined ? 1 : v; if (v < 0.03) return; noise(0.9, 0.7 * v, 500, 0.6, 'lowpass', 0, 60); tone(70, 0.6, 'sine', 0.6 * v, 28); noise(0.25, 0.3 * v, 2500, 0.8, 'bandpass'); },
    whoosh() { noise(0.5, 0.2, 500, 1.5, 'bandpass', 0, 2600); },
    thud(v) { v = v === undefined ? 0.6 : v; if (v < 0.03) return; tone(150, 0.13, 'sine', 0.4 * v, 55); noise(0.07, 0.3 * v, 700, 1, 'lowpass'); },
    till() { noise(0.05, 0.2, 3000, 2, 'bandpass'); tone(1320, 0.1, 'square', 0.07, 0, 0.05); tone(1760, 0.3, 'triangle', 0.16, 0, 0.13); tone(2640, 0.25, 'sine', 0.06, 0, 0.13); },
    nope() { tone(170, 0.11, 'square', 0.1, 150); tone(140, 0.18, 'square', 0.1, 120, 0.13); },
    gulp() { for (let i = 0; i < 3; i++) tone(300 - i * 30, 0.1, 'sine', 0.22, 150, i * 0.16); tone(900, 0.2, 'sine', 0.05, 0, 0.55); },
    door() { noise(0.06, 0.3, 500, 1, 'lowpass'); tone(110, 0.07, 'square', 0.1, 70); },
    blip() { tone(880, 0.07, 'square', 0.07); tone(1320, 0.09, 'square', 0.07, 0, 0.08); },
    tick() { tone(1500, 0.02, 'square', 0.02); },
    pickup() { tone(660, 0.09, 'triangle', 0.2); tone(990, 0.09, 'triangle', 0.2, 0, 0.08); tone(1320, 0.16, 'triangle', 0.2, 0, 0.16); },
    pass() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.6 : 0.16, 'square', 0.1, 0, i * 0.12)); [262, 330, 392].forEach(f => tone(f, 0.9, 'triangle', 0.1, 0, 0.6)); },
    fail() { [392, 370, 349, 311].forEach((f, i) => tone(f, i === 3 ? 0.9 : 0.3, 'sawtooth', 0.09, i === 3 ? f * 0.8 : f * 0.97, i * 0.32)); }
  };
})();
