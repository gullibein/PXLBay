/* Sound verification.

   Two halves.  First the synthesiser: every sound is rendered and
   measured - length, loudness, and for the tonal ones the pitch it
   actually comes out at, checked against sfxr's own frequency formula.
   Then the cues: a fake AudioContext records what gets played, the game
   is driven through each event, and the right noise has to come out.

   The pitch check is the one that matters.  A port of a sample loop can
   be wrong in ways that still produce plausible-sounding noise; if the
   period arithmetic or the oversampling is off, the note is wrong, and
   only measuring it will say so. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname;
const ATLAS = JSON.parse(fs.readFileSync(path.join(D, 'atlas.json')));
const src = ['part1_core.js', 'part2_game.js', 'part3_actions.js', 'part5_sound.js']
  .map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');

const problems = [];
const check = (ok, why) => { if (!ok) problems.push(why); };

/* ---- a fake AudioContext that writes down what it is asked to do ---- */
let played = [], notes = [], buffers = 0, starts = [], stopped = 0;
function FakeContext() {
  this.state = 'running';
  this.currentTime = 0;
  this.destination = { _dest: true };
}
FakeContext.prototype.createBuffer = function (ch, len, rate) {
  buffers++;
  const data = new Float32Array(len);
  return { length: len, sampleRate: rate, getChannelData: () => data };
};
FakeContext.prototype.createBufferSource = function () {
  const self = this;
  return { buffer: null, connect() { },
           start(t) { played.push(this.buffer); starts.push(t === undefined ? self.currentTime : t); },
           stop() { stopped++; } };
};
FakeContext.prototype.createGain = function () {
  return { gain: { value: 1, setValueAtTime() { }, exponentialRampToValueAtTime() { } },
           connect() { } };
};
FakeContext.prototype.createOscillator = function () {
  const o = { type: 'sine', frequency: { value: 0 }, connect() { },
              start(t) { notes.push({ hz: o.frequency.value, at: t, type: o.type }); },
              stop() { } };
  return o;
};
FakeContext.prototype.resume = function () { this.state = 'running'; };

globalThis.ATLAS = ATLAS;
globalThis.window = globalThis;
globalThis.AudioContext = FakeContext;
vm.runInThisContext(src);
const ctx = globalThis;

vm.runInThisContext(`
function bootTest(seed){ srand(seed); makeAppearances(); G=freshG(); P=newPlayer();
  var d=mkItem('weapon',2); d.known=1; var b=mkItem('armor',0); b.known=1;
  P.eq.rh=d; P.eq.body=b; enterLevel(1); }`);

/* ---- 1. the synthesiser ------------------------------------------- */

/* sfxr's own mapping from the 0..1 slider to hertz */
const sfxrHz = v => 8 * 44100 * (v * v + 0.001) / 100;

/* the strongest frequency in a stretch of samples, by plain DFT over a
   band of candidates - cheaper to trust than an FFT written in a hurry */
function dominantHz(buf, rate, lo, hi) {
  const n = Math.min(buf.length, 4096);
  let bestHz = 0, bestMag = 0;
  for (let hz = lo; hz <= hi; hz += Math.max(1, hz * 0.01)) {
    let re = 0, im = 0;
    const w = 2 * Math.PI * hz / rate;
    for (let i = 0; i < n; i++) {
      re += buf[i] * Math.cos(w * i);
      im += buf[i] * Math.sin(w * i);
    }
    const mag = re * re + im * im;
    if (mag > bestMag) { bestMag = mag; bestHz = hz; }
  }
  return bestHz;
}

/* how tonal a sound is: the peak's share of the total energy */
function tonality(buf, rate) {
  const n = Math.min(buf.length, 4096);
  let total = 0;
  for (let i = 0; i < n; i++) total += buf[i] * buf[i];
  if (!total) return 0;
  const hz = dominantHz(buf, rate, 120, 6000);
  let re = 0, im = 0;
  const w = 2 * Math.PI * hz / rate;
  for (let i = 0; i < n; i++) { re += buf[i] * Math.cos(w * i); im += buf[i] * Math.sin(w * i); }
  return (re * re + im * im) / (total * n / 2);
}

const WAVE = ['square', 'sawtooth', 'sine', 'noise'];
const WAVE_NAME = WAVE;

/* Does a steady note come out at the pitch sfxr says it should?

   Not measurable on the sounds themselves: every one of them slides
   downward hard - 'hurt' falls by a factor of seventy inside its own
   forty milliseconds - so any average over the whole buffer lands an
   octave or more below the starting note, which tells us nothing.  Hold
   the frequency still instead, across the whole usable range, and the
   period arithmetic and the oversampling are pinned exactly. */
{
  const bad = [];
  const rows = [];
  for (const wave of [0, 1, 2]) {
    for (const f of [0.15, 0.25, 0.35, 0.5, 0.65, 0.8]) {
      const row = new Array(23).fill(0);
      row[0] = wave;
      row[2] = 0.35;                  /* a third of a second of sustain */
      row[5] = f;
      row[13] = 0.5;                  /* a symmetrical square */
      row[18] = 1;                    /* filters out of the way */
      const buf = ctx.sfxRender(row);
      const want = sfxrHz(f);
      const got = dominantHz(buf, ctx.SFX_RATE, want * 0.4, want * 2.2);
      const err = Math.abs(got - want) / want;
      rows.push({ wave: WAVE_NAME[wave], want, got, err });
      if (err > 0.04) bad.push(WAVE_NAME[wave] + ' at ' + Math.round(want) +
        'Hz came out at ' + Math.round(got) + 'Hz');
    }
  }
  const worst = rows.reduce((a, b) => b.err > a.err ? b : a);
  console.log('steady pitch : %d notes from %dHz to %dHz across square, ' +
    'sawtooth and sine - worst error %s%% (%s at %dHz)',
    rows.length, Math.round(rows[0].want),
    Math.round(rows[rows.length - 1].want), (worst.err * 100).toFixed(1),
    worst.wave, Math.round(worst.want));
  for (const b of bad.slice(0, 4)) check(false, 'pitch is wrong: ' + b);
}

console.log('rendered sounds:');
const rendered = {};
for (const name of Object.keys(ctx.SFX)) {
  const row = ctx.SFX[name];
  const buf = ctx.sfxRender(row);
  rendered[name] = buf;
  let peak = 0, rms = 0;
  for (let i = 0; i < buf.length; i++) {
    const a = Math.abs(buf[i]);
    if (a > peak) peak = a;
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / Math.max(1, buf.length));
  const secs = buf.length / ctx.SFX_RATE;
  const wave = WAVE[row[0]];
  let note = '';
  if (row[7] < 0 && row[0] !== 3) {
    /* it should end lower than it began - that is the slide working.
       Only for tones: noise has no pitch to slide, and the peak of a
       noise spectrum wanders wherever it likes. */
    const half = buf.length >> 1;
    const lo = dominantHz(buf.subarray(0, Math.min(2048, half)), ctx.SFX_RATE, 80, 8000);
    const hi = dominantHz(buf.subarray(half), ctx.SFX_RATE, 80, 8000);
    note = ', slides ' + Math.round(lo) + 'Hz -> ' + Math.round(hi) + 'Hz';
    check(hi < lo * 1.05, name + ' has a downward slide but does not fall (' +
      Math.round(lo) + ' -> ' + Math.round(hi) + 'Hz)');
  }
  console.log('  %s %s %ss, peak %s, rms %s%s',
    name.padEnd(7), wave.padEnd(8), secs.toFixed(3).padStart(5),
    peak.toFixed(3), rms.toFixed(4), note);

  check(buf.length > 500, name + ' is only ' + buf.length + ' samples long');
  check(secs < 2.5, name + ' runs for ' + secs.toFixed(2) + 's - far too long');
  check(peak > 0.05, name + ' is inaudible (peak ' + peak.toFixed(4) + ')');
  check(peak <= 1.0001, name + ' clips at ' + peak.toFixed(3));
  check(rms > 0.005, name + ' is nearly silent (rms ' + rms.toFixed(5) + ')');
  for (let i = 0; i < buf.length; i++)
    if (!isFinite(buf[i])) { check(false, name + ' has a non-finite sample at ' + i); break; }
}

/* Noise must be noisy and tones must be tonal - this is what catches a
   waveform switch wired to the wrong case.

   Measured with the slide taken out.  'zap' sweeps from 1290Hz down to
   411Hz inside ninety milliseconds; smeared across a range like that,
   a perfectly good square wave reads as noise, and the check would be
   testing the sweep rather than the waveform. */
const tonal = {}, WAVE_OF = n => WAVE[ctx.SFX[n][0]];
for (const name of Object.keys(rendered)) {
  const steady = ctx.SFX[name].slice();
  steady[7] = 0; steady[8] = 0;          /* no slide */
  steady[2] = Math.max(steady[2], 0.3);  /* long enough to look at */
  steady[9] = 0; steady[11] = 0;         /* no vibrato, no arpeggio */
  tonal[name] = tonality(ctx.sfxRender(steady), ctx.SFX_RATE);
}
console.log('waveform     : held steady, tonality (1 = a pure tone) - ' +
  Object.keys(tonal).map(n => n + ' ' + tonal[n].toFixed(3)).join(', '));
/* No fixed threshold: an asymmetric square puts most of its energy in
   harmonics and reads far less "pure" than a sine, which is correct and
   not a fault.  What has to hold is a clear gap - the quietest tone well
   clear of the most tonal noise. */
{
  const tones = Object.keys(tonal).filter(n => WAVE_OF(n) !== 'noise');
  const noises = Object.keys(tonal).filter(n => WAVE_OF(n) === 'noise');
  const quietestTone = Math.min.apply(null, tones.map(n => tonal[n]));
  const peakiestNoise = Math.max.apply(null, noises.map(n => tonal[n]));
  console.log('             : quietest tone %s, most tonal noise %s - a %sx gap',
    quietestTone.toFixed(3), peakiestNoise.toFixed(3),
    Math.round(quietestTone / Math.max(1e-6, peakiestNoise)));
  check(quietestTone > peakiestNoise * 5,
    'tones and noise are not clearly apart: quietest tone ' +
    quietestTone.toFixed(3) + ' vs noisiest ' + peakiestNoise.toFixed(3));
}

/* the two sfxr strings that arrived identical really are identical */
check(JSON.stringify(ctx.SFX.miss) === JSON.stringify(ctx.SFX.arrow),
  'miss and arrow were given as the same sfxr string but differ here');

/* ---- 2. nothing is played before it exists ------------------------- */
check(!ctx.soundReady, 'sound claimed to be ready before it was started');
check(ctx.sound('hurt') === false, 'a sound played before the context existed');

ctx.soundStart();
check(ctx.soundReady, 'soundStart did not get the sounds ready');
check(buffers === Object.keys(ctx.SFX).length,
  'expected ' + Object.keys(ctx.SFX).length + ' buffers up front, got ' + buffers);
console.log('startup      : %d buffers rendered before anything is played, ' +
  'so nothing has to be warmed up silently', buffers);

/* ---- 3. the right noise at the right moment ------------------------ */
const names = Object.keys(ctx.SFX);
const bufName = b => {
  for (const n of names) if (ctx.sfxBuf[n] === b) return n;
  return '?';
};
function record(fn) {
  played = []; notes = []; starts = [];
  fn();
  return { sfx: played.map(bufName), notes: notes.slice(), at: starts.slice() };
}

/* bootTest builds a fresh player and level, so anything held from
   before it points at the previous game.  Always ask ctx. */
bootTest(4242);
let P = ctx.P, L = ctx.L;

/* a miss and a hit, forced either way by stacking the odds */
function duel(playerHits) {
  const m = ctx.mkMonster('K', 1, P.x + 1, P.y);
  m.state = 2; m.surprised = 0; m.disguise = 0;
  m.hp = m.mhp = 500;
  m.ar = playerHits ? 40 : -40;          /* higher ar is easier to hit */
  L.mons.length = 0; L.mons.push(m);
  P.hp = P.mhp = 500;
  ctx.G.msgq = [];
  return m;
}

let hitSeen = false, missSeen = false;
for (let i = 0; i < 40 && !(hitSeen && missSeen); i++) {
  let r = record(() => ctx.playerAttack(duel(true)));
  if (r.sfx.includes('hurt')) hitSeen = true;
  r = record(() => ctx.playerAttack(duel(false)));
  if (r.sfx.includes('miss')) missSeen = true;
}
console.log('striking     : a landed blow %s, a whiff %s',
  hitSeen ? 'sounds' : 'IS SILENT', missSeen ? 'sounds' : 'IS SILENT');
check(hitSeen, 'a landed blow makes no sound');
check(missSeen, 'a miss makes no sound');

/* a kill: four notes, rising, in the order asked for */
let kill = { notes: [] };
for (let i = 0; i < 40 && kill.notes.length === 0; i++) {
  const m = duel(true); m.hp = 1;
  kill = record(() => ctx.playerAttack(m));
}
console.log('slaying      : %s', kill.notes.length
  ? kill.notes.map(n => Math.round(n.hz) + 'Hz').join(' -> ') : 'NOTHING PLAYED');
check(kill.notes.length === 4, 'the kill flourish played ' + kill.notes.length + ' notes, not 4');
if (kill.notes.length === 4) {
  const want = ctx.KILL_NOTES;
  for (let i = 0; i < 4; i++)
    check(Math.abs(kill.notes[i].hz - want[i]) < 0.5,
      'note ' + (i + 1) + ' is ' + kill.notes[i].hz + 'Hz, wanted ' + want[i]);
  for (let i = 1; i < 4; i++)
    check(kill.notes[i].at > kill.notes[i - 1].at,
      'the notes do not follow one another - note ' + (i + 1) + ' is not after note ' + i);
  const span = kill.notes[3].at - kill.notes[0].at;
  check(span > 0.05 && span < 0.6, 'the flourish spans ' + span.toFixed(2) + 's - not "quick succession"');
}

/* picking something up */
const gold = ctx.mkItem('gold', 0); gold.cnt = 7; gold.x = P.x; gold.y = P.y;
L.items.push(gold);
let r = record(() => ctx.autoPickup());
console.log('stooping     : %s', r.sfx.join(', ') || 'NOTHING PLAYED');
check(r.sfx.includes('pickup'), 'picking something up is silent');

/* starving costs you health, so it has to sound like it - the meter
   dropping in silence read as nothing having happened */
{
  P.hp = P.mhp = 400; ctx.G.dead = 0; P.perks = {};
  P.food = 10; ctx.G.hungerState = 3; ctx.G.turn = ctx.STARVE_DAMAGE_EVERY;
  const before = P.hp;
  const s = record(() => ctx.upkeep());
  console.log('starving     : %s', s.sfx.join(', ') || 'NOTHING PLAYED');
  check(P.hp < before, 'starvation did not cost any health, so there was nothing to hear');
  check(s.sfx.includes('hurt'), 'starving to death happens in silence');
  P.food = 1300; ctx.G.hungerState = 0;
}

/* a wand: lightning has its own crackle, anything else shares one */
function zap(kind) {
  const w = ctx.mkItem('wand', ctx.WANDS.findIndex(x => x.n === kind));
  w.ch = 5;
  L.mons.length = 0;
  return record(() => ctx.zapWand(w, 1, 0)).sfx;
}
const zl = zap('lightning'), zm = zap('slow monster');
console.log('wands        : lightning -> %s, slow -> %s',
  zl.join(',') || 'silent', zm.join(',') || 'silent');
check(zl.includes('zap'), 'lightning does not crackle');
check(zm.includes('cast'), 'an ordinary wand makes no sound');
check(!zm.includes('zap'), 'an ordinary wand crackles like lightning');

/* an explosion */
r = record(() => ctx.spawnFire(P.x, P.y));
console.log('fire         : %s', r.sfx.join(', ') || 'NOTHING PLAYED');
check(r.sfx.includes('boom'), 'fire bursts in silence');

/* a shot */
bootTest(99);
P = ctx.P; L = ctx.L;
const bow = ctx.mkItem('weapon', ctx.weaponIndex('short bow')); bow.known = 1;
const arrows = ctx.mkItem('weapon', ctx.weaponIndex('arrow')); arrows.cnt = 5; arrows.known = 1;
P.eq.lh = bow; ctx.addItem(arrows);
const tgt = ctx.mkMonster('K', 1, P.x + 3, P.y);
tgt.state = 2; tgt.hp = tgt.mhp = 300; tgt.disguise = 0;
L.mons.length = 0; L.mons.push(tgt);
r = record(() => ctx.fireAt(tgt));
console.log('loosing      : %s', r.sfx.join(', ') || 'NOTHING PLAYED');
check(r.sfx.includes('arrow'), 'an arrow flies in silence');

/* ---- 4. a turn does not arrive as one noise ------------------------
   The whole turn is resolved inside a single millisecond - your blow,
   then every creature's answer - and the pacing lives in G.beat.  Until
   the cues were scheduled on that clock, both blows hit the ear at the
   same instant and read as one sound. */
{
  bootTest(1234);
  P = ctx.P; L = ctx.L;
  const mons = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1]]) {
    const m = ctx.mkMonster('K', 1, P.x + dx, P.y + dy);
    m.state = 2; m.surprised = 0; m.disguise = 0;
    m.hp = m.mhp = 900; m.ar = -40;
    mons.push(m);
  }
  L.mons.length = 0; L.mons.push.apply(L.mons, mons);
  P.hp = P.mhp = 900;
  ctx.G.beat = 0;

  const r = record(() => {
    ctx.playerAttack(mons[0]);          /* your blow, at the head of the turn */
    ctx.beatWait(ctx.BEAT_PLAYER);      /* the pause the turn takes */
    for (const m of mons) {             /* then each creature in its moment */
      ctx.monAttack(m);
      ctx.beatWait(ctx.BEAT_ACT);
    }
  });
  const t0 = r.at.length ? r.at[0] : 0;
  const offsets = r.at.map(t => Math.round((t - t0) * 1000));
  console.log('one turn     : %s at %sms',
    r.sfx.join(', '), offsets.join(', '));

  check(r.sfx.length >= 4, 'a four-way exchange made only ' + r.sfx.length + ' sounds');
  const gap = offsets.length > 1 ? offsets[1] - offsets[0] : 0;
  check(gap >= ctx.BEAT_PLAYER - 1,
    'your blow and the answer are only ' + gap + 'ms apart, not ' + ctx.BEAT_PLAYER);
  /* nothing may share an instant with its neighbour */
  for (let i = 1; i < offsets.length; i++)
    check(offsets[i] - offsets[i - 1] >= 80,
      'two sounds land ' + (offsets[i] - offsets[i - 1]) + 'ms apart - they will merge');

  /* and the whole thing is still over quickly enough to feel like a turn */
  const span = offsets.length ? offsets[offsets.length - 1] : 0;
  check(span <= ctx.BEAT * (offsets.length - 1),
    'the turn takes ' + span + 'ms to be heard out');

  /* One pace among the creatures - the answer, the next creature, the
     second step of a quick one - and a shorter one for the gap you
     yourself sit through.

     This used to be a single number for all four, and it was the right
     rule for everything except the one gap that happens on every single
     step you take: waiting a full beat after your own move for the room
     to do anything reads as the dungeon thinking about it.  So that one
     is shorter.  It is not free to make it any shorter than it is: your
     walk cycle runs WALK_ANIM_MS after you move, and an answer that
     lands inside it treads on your own step. */
  const beats = { BEAT_ACT: ctx.BEAT_ACT, BEAT_STEP: ctx.BEAT_STEP };
  const odd = Object.keys(beats).filter(k => beats[k] !== ctx.BEAT);
  console.log('pacing       : the room answers you in ' + ctx.BEAT_PLAYER +
    'ms, and every move after that waits ' + ctx.BEAT + 'ms' +
    (odd.length ? ' EXCEPT ' + odd.map(k => k + '=' + beats[k]).join(', ') : ''));
  for (const k of odd) check(false, k + ' is ' + beats[k] + 'ms, not ' + ctx.BEAT);
  check(ctx.BEAT_PLAYER < ctx.BEAT,
    'the room takes as long to answer you as it takes between creatures');
  check(ctx.BEAT_PLAYER > ctx.WALK_ANIM_MS,
    'the room answers in ' + ctx.BEAT_PLAYER + 'ms, inside the ' +
    ctx.WALK_ANIM_MS + 'ms your own step is still being drawn');
  /* and the turn we just measured has to show it: your blow, then the
     answer a short beat later, then the rest at the full one */
  for (let i = 1; i < offsets.length; i++) {
    const want = i === 1 ? ctx.BEAT_PLAYER : ctx.BEAT;
    check(offsets[i] - offsets[i - 1] === want,
      (i === 1 ? 'the answer to your blow comes ' : 'two moves are ') +
      (offsets[i] - offsets[i - 1]) + 'ms apart, not ' + want);
  }

  /* pressing on drops whatever has not been heard yet */
  stopped = 0;
  ctx.soundSettle();
  console.log('rushing      : %d queued sounds dropped when you press on', stopped);
  check(stopped >= r.at.length - 1,
    'only ' + stopped + ' of ' + (r.at.length - 1) +
    ' queued sounds were dropped when the turn was skipped');
}

if (problems.length) {
  console.log('\nFAILURES (' + problems.length + '):');
  [...new Set(problems)].slice(0, 12).forEach(p => console.log(' * ' + p));
  process.exit(1);
}
console.log('\nSOUND CHECKS PASSED');
