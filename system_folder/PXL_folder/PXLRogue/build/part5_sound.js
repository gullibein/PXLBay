/* ============================================================ ROGUE-8
   Part 5 : sound.

   The effects are sfxr sounds.  Rather than ship seven WAV files as
   base64 - which would add well over a hundred kilobytes to a game that
   is meant to be one file you can read - the generator itself is in
   here, ported from chr15m/jsfxr, and the sounds are twenty-three
   numbers each.  Those numbers are exactly what sfxr.me puts in its
   share links; build/decode_sfx.py turns a link back into this row.

   There is no need to play anything silently at startup to warm it up.
   Each sound is rendered to samples once, into an AudioBuffer, before
   it is ever asked for; playing one is then just pointing a source node
   at a buffer that already exists.  The only thing that has to wait for
   the player is the AudioContext itself, which browsers will not let us
   start until a key is pressed.
   ============================================================ */

/* the order is sfxr's own, so a row can be pasted straight from
   decode_sfx.py without rearranging anything */
var SFX_KEYS = [
  'wave', 'attack', 'sustain', 'punch', 'decay', 'freq', 'freqLimit',
  'freqRamp', 'freqDramp', 'vibStrength', 'vibSpeed', 'arpMod', 'arpSpeed',
  'duty', 'dutyRamp', 'repeatSpeed', 'phaOffset', 'phaRamp',
  'lpfFreq', 'lpfRamp', 'lpfResonance', 'hpfFreq', 'hpfRamp'
];

var SFX = {
  miss:    [3,0,0.0602156,0,0.148643,0.541983,0,-0.377235,0,0,0,0,0,0,0,0,0,0,1,0,0,0.204015,0],
  hurt:    [0,0,0.151,0,0.261,0.451109,0.159,-0.474,-0.196,0,0,0,0,0.371998,0,0,0,0,1,0,0,0.178328,0],
  arrow:   [3,0,0.0602156,0,0.148643,0.541983,0,-0.377235,0,0,0,0,0,0,0,0,0,0,1,0,0,0.204015,0],
  zap:     [0,0,0.0784737,0,0.242959,0.724,0.198,-0.4,0,0,0,0,0,0.437258,0,0,0,0,1,0,0,0,0],
  cast:    [3,0,0.0729751,0,0.287484,0.744545,0,-0.463,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
  pickup:  [1,0,0.049,0.151,0.3,0.269,0,0,0,0,0,0.484026,0.65201,0,0,0,0,0,1,0,0,0,0],
  boom:    [3,0,0.234729,0.55761,0.498918,0.229,0,-0.370547,0,0.35911,0.557037,0,0,0,0,0,0,0,1,0,0,0,0],
  death:   [1,9.06826e-05,0.747,0.00560851,0.135,0.418,0,-0.18,-0.592224,0.135,0.7,-0.32826,-0.828853,0.958536,-0.0375376,0.735216,-0.0293114,-0.166794,0.977765,-0.112777,0.153358,0.695998,0.00567069]
};

var SFX_RATE = 44100;
var SFX_GAIN = 0.32;              /* these are sharp sounds; keep them down */
var SFX_VOL = 0.5;                /* sfxr's own sound_vol */
var OVERSAMPLE = 8;

/* the flourish over a slain creature: G4 C5 F5 G5, quick */
var KILL_NOTES = [392.00, 523.25, 698.46, 783.99];
var KILL_STEP = 0.062, KILL_LEN = 0.095, KILL_GAIN = 0.16;

var actx = null, sfxBuf = {}, soundReady = false, soundOff = false;

/* ------------------------------------------------------ the generator
   A close port of sfxr's sample loop.  Given a row of parameters it
   returns a Float32Array of samples at SFX_RATE. */
function sfxRender(row) {
  var p = {}, i;
  for (i = 0; i < SFX_KEYS.length; i++) p[SFX_KEYS[i]] = row[i] || 0;

  var period = 100 / (p.freq * p.freq + 0.001);
  var periodMax = 100 / (p.freqLimit * p.freqLimit + 0.001);
  var cutoff = p.freqLimit > 0;
  var periodMult = 1 - Math.pow(p.freqRamp, 3) * 0.01;
  var periodMultSlide = -Math.pow(p.freqDramp, 3) * 0.000001;
  var duty = 0.5 - p.duty * 0.5;
  var dutySlide = -p.dutyRamp * 0.00005;
  var arpMul = p.arpMod >= 0 ? 1 - Math.pow(p.arpMod, 2) * 0.9
                             : 1 + Math.pow(p.arpMod, 2) * 10;
  var arpTime = p.arpSpeed === 1 ? 0
              : Math.floor(Math.pow(1 - p.arpSpeed, 2) * 20000 + 32);

  var fltw = Math.pow(p.lpfFreq, 3) * 0.1;
  var lowPass = p.lpfFreq !== 1;
  var fltw_d = 1 + p.lpfRamp * 0.0001;
  var fltdmp = 5 / (1 + Math.pow(p.lpfResonance, 2) * 20) * (0.01 + fltw);
  if (fltdmp > 0.8) fltdmp = 0.8;
  var flthp = Math.pow(p.hpfFreq, 2) * 0.1;
  var flthp_d = 1 + p.hpfRamp * 0.0003;

  var vibSpeed = Math.pow(p.vibSpeed, 2) * 0.01;
  var vibAmp = p.vibStrength * 0.5;

  var envLen = [Math.floor(p.attack * p.attack * 100000),
                Math.floor(p.sustain * p.sustain * 100000),
                Math.floor(p.decay * p.decay * 100000)];
  var punch = p.punch;

  var phaOff = Math.pow(p.phaOffset, 2) * 1020;
  if (p.phaOffset < 0) phaOff = -phaOff;
  var phaSlide = Math.pow(p.phaRamp, 2);
  if (p.phaRamp < 0) phaSlide = -phaSlide;

  var repeatTime = p.repeatSpeed === 0 ? 0
                 : Math.floor(Math.pow(1 - p.repeatSpeed, 2) * 20000 + 32);
  var elapsedRepeat = 0;
  var gain = Math.exp(SFX_VOL) - 1;

  var fltp = 0, fltdp = 0, fltphp = 0;
  var noise = new Float32Array(32);
  for (i = 0; i < 32; i++) noise[i] = Math.random() * 2 - 1;
  var flanger = new Float32Array(1024), ipp = 0;
  var envStage = 0, envElapsed = 0, vibPhase = 0, phase = 0;

  var out = [], guard = SFX_RATE * 3;         /* three seconds is plenty */
  for (var t = 0; t < guard; t++) {
    if (repeatTime !== 0 && ++elapsedRepeat >= repeatTime) {
      elapsedRepeat = 0;
      period = 100 / (p.freq * p.freq + 0.001);
      periodMult = 1 - Math.pow(p.freqRamp, 3) * 0.01;
      duty = 0.5 - p.duty * 0.5;
      arpTime = p.arpSpeed === 1 ? 0
              : Math.floor(Math.pow(1 - p.arpSpeed, 2) * 20000 + 32);
    }
    if (arpTime !== 0 && t >= arpTime) { arpTime = 0; period *= arpMul; }

    periodMult += periodMultSlide;
    period *= periodMult;
    if (period > periodMax) { period = periodMax; if (cutoff) break; }

    var rf = period;
    if (vibAmp > 0) { vibPhase += vibSpeed; rf = period * (1 + Math.sin(vibPhase) * vibAmp); }
    var iper = Math.floor(rf);
    if (iper < OVERSAMPLE) iper = OVERSAMPLE;

    duty += dutySlide;
    if (duty < 0) duty = 0;
    if (duty > 0.5) duty = 0.5;

    if (++envElapsed > envLen[envStage]) {
      envElapsed = 0;
      if (++envStage > 2) break;
    }
    var envf = envLen[envStage] ? envElapsed / envLen[envStage] : 1;
    var env = envStage === 0 ? envf
            : envStage === 1 ? 1 + (1 - envf) * 2 * punch
            : 1 - envf;

    phaOff += phaSlide;
    var iphase = Math.abs(Math.floor(phaOff));
    if (iphase > 1023) iphase = 1023;

    if (flthp_d !== 0) {
      flthp *= flthp_d;
      if (flthp < 0.00001) flthp = 0.00001;
      if (flthp > 0.1) flthp = 0.1;
    }

    var sample = 0;
    for (var si = 0; si < OVERSAMPLE; si++) {
      var sub = 0;
      phase++;
      if (phase >= iper) {
        phase %= iper;
        if (p.wave === 3) for (i = 0; i < 32; i++) noise[i] = Math.random() * 2 - 1;
      }
      var fp = phase / iper;
      if (p.wave === 0) sub = fp < duty ? 0.5 : -0.5;
      else if (p.wave === 1) sub = fp < duty ? -1 + 2 * fp / duty
                                             : 1 - 2 * (fp - duty) / (1 - duty);
      else if (p.wave === 2) sub = Math.sin(fp * 2 * Math.PI);
      else sub = noise[Math.floor(phase * 32 / iper)];

      var pp = fltp;
      fltw *= fltw_d;
      if (fltw < 0) fltw = 0;
      if (fltw > 0.1) fltw = 0.1;
      if (lowPass) {
        fltdp += (sub - fltp) * fltw;
        fltdp -= fltdp * fltdmp;
      } else { fltp = sub; fltdp = 0; }
      fltp += fltdp;

      fltphp += fltp - pp;
      fltphp -= fltphp * flthp;
      sub = fltphp;

      flanger[ipp & 1023] = sub;
      sub += flanger[(ipp - iphase + 1024) & 1023];
      ipp = (ipp + 1) & 1023;

      sample += sub * env;
    }
    sample = sample / OVERSAMPLE * gain;
    if (sample > 1) sample = 1;
    if (sample < -1) sample = -1;
    out.push(sample);
  }
  return Float32Array.from(out);
}

/* ------------------------------------------------------------- output */
function soundStart() {
  if (actx || soundOff) return;
  var C = window.AudioContext || window.webkitAudioContext;
  if (!C) { soundOff = true; return; }
  try { actx = new C(); } catch (e) { soundOff = true; return; }

  /* Render every sound now, into buffers that will simply be replayed.
     Nothing has to be played at zero volume first: the work that would
     have made the first play stutter has already been done here. */
  var names = Object.keys(SFX);
  for (var i = 0; i < names.length; i++) {
    var s = sfxRender(SFX[names[i]]);
    if (!s.length) continue;
    var b = actx.createBuffer(1, s.length, SFX_RATE);
    b.getChannelData(0).set(s);
    sfxBuf[names[i]] = b;
  }
  soundReady = true;
}

/* browsers hold the context suspended until the player acts */
function soundWake() {
  if (!actx) soundStart();
  if (actx && actx.state === 'suspended' && actx.resume) actx.resume();
}

/* Everything scheduled but not yet heard, so a player who is going
   faster than the pacing does not get last turn's noises over this
   turn's. */
var pending = [];

function playSfx(name, vol, delayMs) {
  if (soundOff || !soundReady || !actx) return false;
  var b = sfxBuf[name];
  if (!b) return false;
  var src = actx.createBufferSource();
  src.buffer = b;
  var g = actx.createGain();
  g.gain.value = SFX_GAIN * (vol === undefined ? 1 : vol);
  src.connect(g); g.connect(actx.destination);
  var d = (delayMs || 0) / 1000;
  src.start(actx.currentTime + d);
  if (d > 0) pending.push(src);
  return true;
}

/* Give up on anything still waiting to be played. */
function soundSettle() {
  for (var i = 0; i < pending.length; i++) {
    try { pending[i].stop(); } catch (e) { /* already finished */ }
  }
  pending.length = 0;
}

/* Four notes over a fallen creature, one after another.  Built from
   oscillators rather than samples: it is a tune, not a noise. */
function playKillTune(delayMs) {
  if (soundOff || !actx) return false;
  var t0 = actx.currentTime + 0.01 + (delayMs || 0) / 1000;
  for (var i = 0; i < KILL_NOTES.length; i++) {
    var t = t0 + i * KILL_STEP;
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = 'square';
    o.frequency.value = KILL_NOTES[i];
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(KILL_GAIN, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + KILL_LEN);
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + KILL_LEN + 0.02);
  }
  return true;
}

/* ------------------------------------------------------------ the cue
   One place that knows which sound belongs to which event, so the game
   code says what happened rather than which waveform to play.

   The delay is the whole point.  A turn is resolved in one go - your
   blow, then every creature's answer, all inside the same millisecond -
   and the pacing lives entirely in G.beat, which until now only held
   back the *text*.  So both blows landed on the ear at once and read as
   a single noise.  Each cue is now scheduled at the instant of the
   action that caused it, exactly like the line that describes it. */
function soundDelay() {
  if (typeof G === 'undefined' || !G) return 0;
  var d = G.beat || 0;
  return d > 0 ? d : 0;
}
function sound(what) {
  var d = soundDelay();
  switch (what) {
    case 'miss': return playSfx('miss', 1, d);
    case 'hurt': return playSfx('hurt', 1, d);
    case 'shoot': return playSfx('arrow', 1, d);
    case 'lightning': return playSfx('zap', 1, d);
    case 'magic': return playSfx('cast', 1, d);
    case 'pickup': return playSfx('pickup', 1, d);
    case 'boom': return playSfx('boom', 1, d);
    case 'kill': return playKillTune(d);
    case 'death': return playSfx('death', 1, d);
  }
  return false;
}
