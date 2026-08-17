/* Renderer verification with a fake canvas.
   Asserts: no crashes in any UI mode, and every blit lands on whole
   pixels inside the 320x200 buffer with an integer scale factor. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname;
const ATLAS = JSON.parse(fs.readFileSync(path.join(D, 'atlas.json')));
const src = ['part1_core.js', 'part2_game.js', 'part3_actions.js', 'part4_render.js', 'part5_sound.js']
  .map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');

let blits = [], fills = [], problems = [];

/* ------------------------------------------------- one name, one thing
   The four parts are concatenated into one scope, so a second
   `function foo` anywhere silently replaces the first and every call in
   the file that declared it goes to the wrong body.  That is how a new
   stat line called drawStats came to draw the side panel's whole stat
   block over the open pack: no error, no crash, just the wrong picture.
   Cheap to check, so it is checked before anything else runs. */
{
  const seen = new Map(), dupes = [];
  for (const f of ['part1_core.js', 'part2_game.js', 'part3_actions.js',
                   'part4_render.js', 'part5_sound.js']) {
    const lines = fs.readFileSync(path.join(D, f), 'utf8').split('\n');
    lines.forEach((ln, i) => {
      const m = /^function ([A-Za-z_$][\w$]*)\s*\(/.exec(ln);
      if (!m) return;
      const where = f + ':' + (i + 1);
      if (seen.has(m[1])) dupes.push(m[1] + ' is declared at ' + seen.get(m[1]) + ' and again at ' + where);
      else seen.set(m[1], where);
    });
  }
  console.log('one name one thing    : ' + seen.size + ' functions, ' + dupes.length + ' declared twice');
  dupes.slice(0, 6).forEach(d => problems.push(d));
}
/* Both lists are filled in draw order, but they are two lists - so each
   draw carries the order it went down in, and a test can ask which of
   two things was painted first. */
let drawSeq = 0;

/* The canvas the game boots onto.  It listens for the mouse now, and a
   test drives clicks straight through clickAt rather than through the
   browser, so the listeners only have to exist. */
function fakeCtx(tag) {
  /* The real canvas has a transform, and the renderer uses it to mirror a
     creature and to turn a cracked flagstone.  Carrying one here means a
     blit is recorded where it actually lands, and whether it was flipped
     or turned on the way - otherwise a mirrored sprite looks identical to
     an unmirrored one and the test proves nothing. */
  let m = [1, 0, 0, 1, 0, 0];            /* a b c d e f */
  const stack = [];
  /* Whether a clip is in force.  The sliding map draws a row and column
     of tiles past the edge of the screen and lets the canvas cut them
     off, so a blit made under a clip is not a blit that lands anywhere
     it should not. */
  let clipped = 0;
  const mul = (n) => {
    m = [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
         m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
         m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  };
  const at = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  return {
    _tag: tag,
    imageSmoothingEnabled: true,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000',
    save: function () { stack.push({ m: m.slice(), clipped: clipped }); },
    /* the map is clipped to its own area while it slides */
    beginPath: function () { },
    rect: function () { },
    clip: function () { clipped = 1; },
    restore: function () {
      if (!stack.length) return;
      const s = stack.pop();
      m = s.m; clipped = s.clipped;
    },
    translate: function (x, y) { mul([1, 0, 0, 1, x, y]); },
    scale: function (x, y) { mul([x, 0, 0, y, 0, 0]); },
    rotate: function (r) {
      const c = Math.round(Math.cos(r)), s = Math.round(Math.sin(r));
      mul([c, s, -s, c, 0, 0]);
    },
    drawImage: function (img, sx, sy, sw, sh, dx, dy, dw, dh) {
      /* which sheet did this come from?  font glyphs live on their own
         canvases and must not be mistaken for atlas tiles */
      /* three sources: the sheet, a tinted copy of it for hit flashes,
         and the per-colour font sheets */
      const from = (img && img.kind) ? img.kind : 'atlas';
      /* how faded the sheet this came off is: 1 for the plain atlas */
      const shade = (img && img.shade !== undefined) ? img.shade : 1;
      const alpha = this.globalAlpha;
      const nine = arguments.length === 9;
      let ddx = nine ? dx : sx, ddy = nine ? dy : sy;
      let ddw = nine ? dw : sw, ddh = nine ? dh : sh;
      /* where the four corners actually land */
      const cs = [at(ddx, ddy), at(ddx + ddw, ddy), at(ddx, ddy + ddh), at(ddx + ddw, ddy + ddh)];
      const xs = cs.map(c => c[0]), ys = cs.map(c => c[1]);
      const flip = (m[0] * m[3] - m[1] * m[2]) < 0;
      /* a quarter turn shows up as the x axis no longer pointing along x */
      const turn = Math.abs(m[1]) > 0.5 ? (m[1] > 0 ? 1 : 3) : (m[0] < 0 && !flip ? 2 : 0);
      const rec = { seq: drawSeq++, tag: tag, from, at: alpha, shade, flip, turn,
        clipped: !!clipped,
        tint: (img && img.tint) || null,
        dx: Math.round(Math.min(...xs)), dy: Math.round(Math.min(...ys)),
        dw: Math.round(Math.max(...xs) - Math.min(...xs)),
        dh: Math.round(Math.max(...ys) - Math.min(...ys)) };
      if (nine) { rec.sx = sx; rec.sy = sy; rec.sw = sw; rec.sh = sh; }
      else { rec.sx = 0; rec.sy = 0; rec.sw = sw; rec.sh = sh; }
      blits.push(rec);
    },
    fillRect: function (x, y, w, h) {
      fills.push({ seq: drawSeq++, tag: tag, x, y, w, h, col: this.fillStyle });
    }
  };
}
const canvases = [];
function fakeCanvas(tag) {
  /* The canvas listens for the mouse now, and it can be asked where it
     sits on the page so a click can be turned into buffer pixels.  Here
     it is 3x at the origin, which is a scale the game really uses. */
  const c = { width: 0, height: 0, style: {}, _tag: tag,
    getContext: () => fakeCtx(tag),
    addEventListener: (n, f) => { canvasListeners[n] = f; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 230 * 3, height: 128 * 3 }) };
  canvases.push(c);
  return c;
}
const canvasListeners = {};

const listeners = {};
const ctx = {
  ATLAS, ATLAS_PNG: 'data:image/png;base64,AAAA',
  console, Math, Date, JSON, Object, Array, String, Number,
  Uint8Array, Int8Array, isNaN, parseInt, btoa, atob,
  requestAnimationFrame: function () { },
  document: {
    getElementById: () => fakeCanvas('screen'),
    createElement: () => fakeCanvas('font')
  },
  Image: function () {
    /* An image with nothing listening for it is perfectly ordinary - the
       splash screen is loaded and simply drawn when it happens to be
       ready - so only call the handler if there is one. */
    const self = this;
    let src = '';
    Object.defineProperty(this, 'src', {
      get: function () { return src; },
      set: function (v) {
        src = v;
        setTimeout(() => { if (typeof self.onload === 'function') self.onload(); }, 0);
      }
    });
    this.complete = false;
    this.naturalWidth = 0;
  },
  setTimeout,
  window: {
    devicePixelRatio: 2, innerWidth: 1512, innerHeight: 945,
    addEventListener: (n, f) => { listeners[n] = f; },
    /* the save store, as the browser would provide it */
    localStorage: (function () {
      const m = {};
      return {
        getItem: k => (k in m ? m[k] : null),
        setItem: (k, v) => { m[k] = String(v); },
        removeItem: k => { delete m[k]; }
      };
    })()
  }
};
ctx.window.window = ctx.window;
vm.createContext(ctx);
ctx.addEventListener = ctx.window.addEventListener;
vm.runInContext(src, ctx);

/* One dungeon, every run.  A suite that walks a randomly generated floor
   about and counts what it sees passes or fails on the clock otherwise -
   and a failure nobody can reproduce is not much of a failure. */
vm.runInContext('FORCED_SEED = 20260811;', ctx);
vm.runInContext('boot();', ctx);

setTimeout(() => {
  const key = k => listeners['keydown']({ key: k, shiftKey: k.length === 1 && k !== k.toLowerCase(), preventDefault() { } });
  /* holding SHIFT: every keydown reports it, and there is a keyup at the end */
  const shiftKey = k => listeners['keydown']({ key: k, shiftKey: true, preventDefault() { } });
  const shiftUp = () => listeners['keyup']({ key: 'Shift' });

  function frame(label) {
    blits = []; fills = []; drawSeq = 0;
    try { vm.runInContext('render();', ctx); }
    catch (e) { problems.push('render crash [' + label + ']: ' + e.message); return; }
    validate(label);
    return blits.filter(b => b.tag === 'screen').length;
  }

  /* Letters may sit next to each other but never on top of each other -
     wherever that happens, a panel has outgrown its space. */
  function textClash(label) {
    /* A modal paints an opaque box over whatever was behind it, so text
       under an open menu or pouch is covered, not collided with. */
    if (ctx.G && (ctx.G.menu || ctx.G.pouch)) return 0;
    const seen = new Set();
    let clashes = 0;
    for (const b of blits) {
      if (b.tag !== 'screen' || b.from !== 'font') continue;
      for (let y = b.dy; y < b.dy + b.dh; y++)
        for (let x = b.dx; x < b.dx + b.dw; x++) {
          const k = y * 1000 + x;
          if (seen.has(k)) clashes++;
          seen.add(k);
        }
    }
    if (clashes > 0) {
      const where = [];
      const seen2 = new Set();
      for (const b of blits) {
        if (b.tag !== 'screen' || b.from !== 'font') continue;
        for (let y = b.dy; y < b.dy + b.dh; y++)
          for (let x = b.dx; x < b.dx + b.dw; x++) {
            const k = y * 1000 + x;
            if (seen2.has(k)) { where.push(b.dx + ',' + b.dy); y = 1e9; break; }
            seen2.add(k);
          }
      }
      problems.push(label + ': text drawn over text (' + clashes + ' px) at ' +
        [...new Set(where)].slice(0, 4).join(' ') + ' mode=' + ctx.G.mode);
    }
    return clashes;
  }

  /* Everything drawn in the last render, checked for whole pixels, whole
     scale factors, and staying inside the buffer. */
  function validate(label) {
    textClash(label);
    for (const b of blits) {
      if (b.tag !== 'screen') continue;
      const ints = [b.dx, b.dy, b.dw, b.dh, b.sx, b.sy, b.sw, b.sh];
      if (ints.some(v => !Number.isInteger(v)))
        problems.push(label + ': non-integer blit ' + JSON.stringify(b));
      if (b.dw % b.sw !== 0 || b.dh % b.sh !== 0)
        problems.push(label + ': non-integer scale ' + JSON.stringify(b));
      if (b.dw / b.sw !== b.dh / b.sh)
        problems.push(label + ': non-uniform scale ' + JSON.stringify(b));
      /* A blit made under a clip is one the canvas is cutting off for
         us: the sliding map deliberately draws a row and column past the
         edge so the moving border is never bare. */
      if (!b.clipped && (b.dx < -8 || b.dy < -8 || b.dx > ctx.SW || b.dy > ctx.SH))
        problems.push(label + ': blit off-buffer ' + JSON.stringify(b));
      /* Text is never clipped on purpose, so a glyph that hangs over the
         edge means a panel has outgrown the screen. */
      if (b.from === 'font' &&
          (b.dx < 0 || b.dy < 0 || b.dx + b.dw > ctx.SW || b.dy + b.dh > ctx.SH))
        problems.push(label + ': text off-screen at ' + b.dx + ',' + b.dy +
          ' (' + b.dw + 'x' + b.dh + ')');
    }
    for (const f of fills) {
      if (f.tag !== 'screen') continue;
      if (![f.x, f.y, f.w, f.h].every(Number.isInteger))
        problems.push(label + ': non-integer fill ' + JSON.stringify(f));
    }
  }

  const counts = {};
  counts.title = frame('title');
  /* The title screen is a painted picture with a menu over it.  The first
     key opens the menu - it does not start a run - so that LOAD can be
     reached without playing a turn first. */
  if (ctx.G.titleMenu) problems.push('the title menu is open before a key is pressed');
  key(' ');
  if (!ctx.G.titleMenu) problems.push('a key on the title screen did not open the menu');
  counts.titleMenu = frame('title-menu');
  const titleNames = ctx.TITLE_OPTS.map(o => o[0]);
  for (const want of ['start', 'load', 'hints', 'help', 'exit'])
    if (titleNames.indexOf(want) < 0) problems.push('the title menu has no ' + want);
  ctx.G.titleMenu.i = titleNames.indexOf('start');
  key('Enter');                   // START
  if (ctx.G.titleMenu) problems.push('START left the title menu open');
  counts.play = frame('play');
  /* help used to be on ?, which is now the look cursor.  It lives on the
     ESC menu: open it, walk to HELP, take it. */
  key('Escape');
  ctx.G.pause.i = ctx.PAUSE_OPTS.map(o => o[0]).indexOf('help');
  key('Enter');
  counts.help = frame('help'); key(' ');
  key('Tab'); counts.inv = frame('inv');
  key('ArrowDown'); key(' '); counts.invSel = frame('item-menu');
  if (ctx.G.menu) {
    key('ArrowDown'); counts.menu2 = frame('item-menu-2');
    // walk every entry of every menu the pack can show
    const seenLabels = new Set();
    for (const it of [...ctx.P.slots, ...Object.values(ctx.P.eq)].filter(Boolean)) {
      for (const kind of ['slot', 'eq']) {
        const ref = kind === 'eq' ? { kind: 'eq', key: 'rh' } : { kind: 'slot', i: 0 };
        for (const [, label] of ctx.itemActions(it, ref)) seenLabels.add(label);
      }
    }
    console.log('menu labels          :', [...seenLabels].sort().join(' '));
    const tooWide = [...seenLabels].filter(l => l.length > 12);
    if (tooWide.length) problems.push('menu label too wide: ' + tooWide.join(', '));
  } else problems.push('SPACE did not open the item menu');
  key('Escape');
  key('ArrowRight'); key(' '); key('Escape');
  key('Escape');
  /* an ESC too many now opens the pause menu, so make sure we are back
     in the dungeon before carrying on */
  ctx.G.pause = null; ctx.G.look = null; ctx.G.mode = 'play';
  key('Tab');
  ctx.G.aim = ctx.P.slots.find(s => s) || null;
  if (ctx.G.aim) { ctx.G.mode = 'dir'; counts.dir = frame('dir'); key('Escape'); }

  // wander, rendering as we go; poke the inventory every so often
  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter',
                'Escape', '?', 'Tab'];
  for (let i = 0; i < 5000; i++) {
    try { key(keys[Math.floor(Math.random() * keys.length)]); }
    catch (e) { problems.push('key crash: ' + e.message + '\n' + (e.stack || '').split('\n')[1]); break; }
    if (i % 41 === 0) frame('walk' + i);
    if (i % 137 === 0) { key('Tab'); frame('inv' + i); key('Tab'); }
    if (ctx.G.mode === 'dir') key('ArrowUp');
    /* the random walk is allowed to open the save screens, but not to
       use them: loading mid-soak would swap the whole game underneath
       the checks that come after */
    if (ctx.G.mode === 'slots' || ctx.G.mode === 'hint') key('Escape');
    /* dying holds on the dungeon for a beat so the last words can be
       read; render it, then let the clock run out */
    if (ctx.G.mode === 'dying') { counts.dying = frame('dying'); ctx.G.deadAt = 0; }
    if (ctx.G.mode === 'dead') { counts.dead = frame('dead'); key('Enter'); }
    if (ctx.G.mode === 'win') { counts.won = frame('won'); key('Enter'); }
  }
  /* ---- the meter waits for the blow ----------------------------------
     A turn is worked out in one go, so the damage was on the bar most of
     a second before the blow that caused it was drawn or heard.  The
     meter has to read what has actually happened. */
  {
    const P = ctx.P, L = ctx.L, G = ctx.G;
    G.mode = 'play'; G.invOpen = 0; G.menu = null; G.dead = 0;
    G.hpq = []; G.beat = 0;
    P.hp = P.mhp = 40; P.hurt = null;
    L.mons.length = 0;

    const before = ctx.shownHp().hp;
    ctx.beatWait(ctx.BEAT_PLAYER);        /* the pause a turn takes */
    ctx.hurtPlayer(9, 'a test');
    const duringTurn = ctx.shownHp().hp;
    G.hpq.forEach(e => { e.at = Date.now() - 1; });   /* let the moment arrive */
    const afterBlow = ctx.shownHp().hp;

    console.log('health meter         : ' + before + ' before, still ' + duringTurn +
      ' while the blow is in the air, ' + afterBlow + ' once it lands');
    if (duringTurn !== 40) problems.push('the meter dropped to ' + duringTurn +
      ' before the blow landed');
    if (afterBlow !== 31) problems.push('the meter never caught up: ' + afterBlow);

    /* an unstamped change must not get stuck behind the queue */
    G.hpq = []; G.beat = 0;
    P.hp = 22;
    if (ctx.shownHp().hp !== 22)
      problems.push('a change nobody stamped is not being shown at all');
    P.hp = P.mhp;
  }

  /* ---- dead is dead, whatever screen you were on ----------------------
     The lock used to be on the mode.  Die with the pack open and the
     pack was still taking orders. */
  {
    const P = ctx.P, L = ctx.L, G = ctx.G;
    const before = { turn: G.turn, x: P.x, y: P.y };
    G.dead = 1; G.mode = 'inv'; G.invOpen = 1; G.invMode = 'normal';
    for (const k of ['ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Tab'])
      key(k);
    const acted = G.turn !== before.turn || P.x !== before.x || P.y !== before.y;
    console.log('dead hands           : ' + (acted ? 'STILL TAKING ORDERS' :
      'the pack ignores you once you are dead'));
    if (acted) problems.push('a dead player could still act from the pack');
    G.dead = 0; G.mode = 'play'; G.invOpen = 0; P.hp = P.mhp;
  }

  /* ---- an exchange of blows moves both parties ------------------------
     Whoever swings leans one pixel toward the other; whoever is hit is
     knocked two pixels away and flashes red.  Both are measured against
     the same sprite drawn with nothing happening to it. */
  {
    const P = ctx.P, L = ctx.L, G = ctx.G;
    G.mode = 'play'; G.invOpen = 0; G.menu = null; G.dead = 0;
    P.hp = P.mhp; P.hurt = null; P.lunge = null; P.walkT = 0;
    P.hallu = 0;                 /* else every frame picks a new species */
    L.corpses.length = 0;        /* a corpse uses the same sprite */

    /* put a creature to the player's east, where both are on screen */
    const m = ctx.mkMonster('K', 1, P.x + 1, P.y);
    m.state = 2; m.surprised = 0; m.disguise = 0; m.hp = m.mhp = 500;
    L.mons.length = 0; L.mons.push(m);
    for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;

    const playerSpr = ctx.IX['hero'], playerSpr2 = ctx.IX['hero2'];
    const monSpr = ctx.IX['mon_K'];
    const find = want => {
      for (const b of blits) {
        if (b.tag !== 'screen' || b.from !== 'atlas') continue;
        if (b.dx < ctx.VIEW_PX) continue;
        const idx = (b.sy / 8) * ctx.ATLAS.cols + b.sx / 8;
        if (want.includes(idx)) return { x: b.dx, y: b.dy };
      }
      return null;
    };

    frame('rest');
    const p0 = find([playerSpr, playerSpr2]), m0 = find([monSpr]);
    let lungeBad = [];
    if (!p0 || !m0) lungeBad.push('could not find the player and the creature on screen');
    else {
      /* the player swings east: lean +1 in x, and no flash on him */
      P.lunge = { t: Date.now(), dx: 1, dy: 0 }; P.hurt = null;
      m.hurt = null; m.lunge = null;
      frame('lunge');
      const p1 = find([playerSpr, playerSpr2]);
      if (!p1 || p1.x - p0.x !== ctx.LUNGE_PX || p1.y !== p0.y)
        lungeBad.push('the swing moved the player by ' +
          (p1 ? (p1.x - p0.x) + ',' + (p1.y - p0.y) : 'nothing') +
          ' instead of ' + ctx.LUNGE_PX + ',0');

      /* the creature is struck from the west: knocked +2 in x, and red */
      P.lunge = null;
      m.hurt = { t: Date.now(), dx: 1, dy: 0 };
      frame('recoil');
      const m1 = find([monSpr]);
      if (!m1 || m1.x - m0.x !== ctx.HURT_PX || m1.y !== m0.y)
        lungeBad.push('the blow moved the creature by ' +
          (m1 ? (m1.x - m0.x) + ',' + (m1.y - m0.y) : 'nothing') +
          ' instead of ' + ctx.HURT_PX + ',0');
      const flash = blits.filter(b => b.tag === 'screen' && b.from === 'tint');
      if (!flash.length) lungeBad.push('nothing flashed red when the blow landed');
      else if (m1 && !flash.some(f => f.dx === m1.x && f.dy === m1.y))
        lungeBad.push('the red flash is not on the creature that was hit');

      /* being hit beats leaning in: you cannot press an attack while
         you are being knocked backwards */
      m.lunge = { t: Date.now(), dx: -1, dy: 0 };
      frame('both');
      const m2 = find([monSpr]);
      if (!m2 || m2.x - m0.x !== ctx.HURT_PX)
        lungeBad.push('a lunge cancelled out the knockback');

      /* it wears off */
      m.hurt.t = Date.now() - ctx.HURT_MS - 30;
      m.lunge.t = Date.now() - ctx.LUNGE_MS - 30;
      frame('settled');
      const m3 = find([monSpr]);
      if (!m3 || m3.x !== m0.x || m3.y !== m0.y)
        lungeBad.push('the creature never came back to its square');
    }
    console.log('blows                : ' + (lungeBad.length ? lungeBad.length + ' problems' :
      'attacker leans ' + ctx.LUNGE_PX + 'px in, the struck reel ' + ctx.HURT_PX +
      'px back and flash red, both settle'));
    for (const b of lungeBad) problems.push('blows: ' + b);
    P.hurt = null; P.lunge = null; L.mons.length = 0;
  }

  /* ---- equipping draws a current between the two squares --------------
     The pack screen is otherwise perfectly still, so a thing quietly
     appearing in a different square is easy to miss entirely. */
  {
    const P = ctx.P, G = ctx.G;
    G.dead = 0; P.hp = P.mhp;
    G.mode = 'inv'; G.invOpen = 1; G.invMode = 'normal';
    G.menu = null; G.sel = null; G.arc = null;
    ctx.setPouch(null); G.pouchT = 0;

    const helm = ctx.mkItem('head', 1); helm.known = 1;
    P.slots[0] = helm; P.eq.head = null;
    G.cur.r = 1; G.cur.c = 0;
    key(' ');
    const arcBad = [];
    if (!G.menu) arcBad.push('SPACE did not open the item menu');
    else {
      const i = G.menu.opts.findIndex(o => o[0] === 'equip');
      if (i < 0) arcBad.push('nothing in the menu equips it');
      else { G.menu.i = i; key(' '); }
    }
    if (P.eq.head !== helm) arcBad.push('it did not end up on your head');
    if (!G.arc) arcBad.push('no current was drawn');
    else {
      /* it runs from the pack square it left to the slot it went into */
      const from = ctx.refPixel({ kind: 'slot', i: 0 });
      const to = ctx.refPixel({ kind: 'eq', key: 'head' });
      if (G.arc.x0 !== from[0] || G.arc.y0 !== from[1])
        arcBad.push('the current does not start where the thing was');
      if (G.arc.x1 !== to[0] || G.arc.y1 !== to[1])
        arcBad.push('the current does not end at the slot it went to');
      frame('arc');
      const lit = fills.filter(f => f.tag === 'screen' && f.w === 1 && f.h === 1).length;
      if (lit < 8) arcBad.push('only ' + lit + ' pixels of current were drawn');
      /* and it goes out */
      G.arc.t = Date.now() - ctx.ARC_MS - 50;
      frame('arc-gone');
      if (G.arc) arcBad.push('the current never faded');
    }
    console.log('equipping            : ' + (arcBad.length ? arcBad.length + ' problems' :
      'a current runs from the square it left to the slot it went into'));
    for (const b of arcBad) problems.push('equipping: ' + b);
    P.slots[0] = null; G.arc = null; G.mode = 'play'; G.invOpen = 0;
  }

  /* ---- a chest opens as a container ----------------------------------
     Stepping onto one shows it in the pack screen with five squares,
     rather than reading its contents out and stuffing them into a pack
     that may not have room.  Things go both ways. */
  {
    const P = ctx.P, L = ctx.L, G = ctx.G;
    G.dead = 0; P.hp = P.mhp; G.menu = null; G.sel = null;
    G.mode = 'play'; G.invOpen = 0;
    ctx.setPouch(null); G.pouchT = 0;

    const chest = ctx.mkChest(3, 0, 1);
    chest.gold = 120;
    const held = ctx.contCount(chest);
    chest.x = P.x; chest.y = P.y;
    L.items.length = 0; L.items.push(chest);
    L.mons.length = 0;

    const purse = P.gold;
    G.msgq = [];
    ctx.autoPickup();
    vm.runInContext('finishMsgs();', ctx);

    const chestBad = [];
    if (G.mode !== 'inv') chestBad.push('stepping on a chest did not open the pack screen');
    if (G.pouch !== chest) chestBad.push('the chest is not the open container');
    if (P.gold !== purse + 120) chestBad.push('the coins did not go into your purse');
    if (ctx.contCount(chest) !== held) chestBad.push('opening it emptied it');
    if (L.items.indexOf(chest) < 0) chestBad.push('the chest left the floor');

    /* five squares, one row */
    G.pouchT = Date.now() - ctx.POUCH_SLIDE_MS - 50;
    frame('chest-open');
    const boxes = fills.filter(f => f.tag === 'screen' &&
      f.w === ctx.SL && f.h === ctx.SL);
    const rows = new Set(boxes.map(f => f.y));
    if (ctx.contRows(chest) !== 1)
      chestBad.push('a chest is drawn as ' + ctx.contRows(chest) + ' rows');
    if (boxes.length !== 5 + 5)
      chestBad.push('expected 5 equip squares and 5 chest squares, got ' + boxes.length);

    /* the soak may have filled the pack; taking things out needs room */
    P.slots[18] = null; P.slots[19] = null;

    /* take a thing out of the chest, through the menu the player uses */
    let hasOne = -1;
    for (let i = 0; i < ctx.CHEST_CAP; i++) if (chest.items[i]) { hasOne = i; break; }
    if (hasOne < 0) { chest.items[0] = ctx.mkItem('food', 0); hasOne = 0; }
    const outIt = chest.items[hasOne];
    ctx.setPouch(chest); G.pcur.r = 0; G.pcur.c = hasOne;
    G.menu = null;
    const heldBefore = ctx.carriedItems().reduce((n, x) => n + (x.cnt || 1), 0);
    key(' ');                                  /* opens the item menu */
    let took = false;
    if (G.menu) {
      const idx = G.menu.opts.findIndex(o => o[0] === 'takeout');
      if (idx < 0) chestBad.push('no way to take a thing out of a chest');
      else { G.menu.i = idx; key(' '); took = true; }
    } else chestBad.push('SPACE in a chest did not open the item menu');
    if (took) {
      if (chest.items[hasOne] === outIt) chestBad.push('it stayed in the chest');
      /* it may have merged into a stack you already carry, so count
         rather than look for the object itself */
      const carried = ctx.carriedItems()
        .reduce((n, x) => n + (x.cnt || 1), 0);
      if (carried <= heldBefore) chestBad.push('it did not reach the pack');
    }

    /* and put one of yours back, from the pack side */
    ctx.setPouch(null);
    const mine = ctx.mkItem('food', 1);
    P.slots[0] = mine;
    G.cur.r = 1; G.cur.c = 0; G.menu = null; G.sel = null;
    key(' ');
    if (G.menu) {
      const idx = G.menu.opts.findIndex(o => o[0] === 'putin');
      if (idx < 0) chestBad.push('no way to put a thing into the chest');
      else {
        G.menu.i = idx; key(' ');
        if (P.slots[0] === mine) chestBad.push('it stayed in the pack');
        let inChest = false;
        for (let i = 0; i < ctx.CHEST_CAP; i++) if (chest.items[i] === mine) inChest = true;
        if (!inChest) chestBad.push('it never reached the chest');
      }
    } else chestBad.push('SPACE in the pack did not open the item menu');

    console.log('chest                : ' + (chestBad.length ? chestBad.length + ' problems' :
      'opens on the pack screen, five squares, coins to your purse, things go both ways'));
    for (const b of chestBad) problems.push('chest: ' + b);
    ctx.setPouch(null); G.mode = 'play'; G.invOpen = 0;
    P.slots[0] = null; P.slots[1] = null;
  }

  /* ---- the pouch takes the pack's place ------------------------------
     Opening it should run the bag squares up and out while the pouch
     squares rise into exactly the space they left - not drop a window
     on top of everything. */
  {
    const P = ctx.P, G = ctx.G;
    const pouch = ctx.mkItem('pouch', 0);
    pouch.items[0] = ctx.mkItem('potion', 0);
    P.slots[0] = pouch;
    G.dead = 0; P.hp = P.mhp;
    G.mode = 'inv'; G.invOpen = 1; G.invMode = 'normal';
    G.menu = null; G.sel = null;
    ctx.setPouch(null); G.pouchT = 0;
    G.cur.r = 1; G.cur.c = 0;

    /* where the bag squares sit with no pouch open */
    frame('pack');
    const boxes = () => fills.filter(f => f.tag === 'screen' &&
      f.w === ctx.SL && f.h === ctx.SL).map(f => f.x + ',' + f.y);
    const packBoxes = new Set(boxes());

    ctx.setPouch(pouch);
    /* park it squarely mid-slide: reading the clock a moment after
       setPouch can land exactly on zero on a quick machine */
    G.pouchT = Date.now() - Math.round(ctx.POUCH_SLIDE_MS * 0.5);
    frame('pouch-opening');
    const mid = new Set(boxes());
    const midPhase = ctx.pouchPhase();

    G.pouchT = Date.now() - ctx.POUCH_SLIDE_MS - 50;   /* let it finish */
    frame('pouch-open');
    const openBoxes = new Set(boxes());

    const bagRow0 = ctx.GX + ',' + ctx.GY_BAG;
    const pouchLanded = openBoxes.has(bagRow0);
    const bagRow3 = ctx.GX + ',' + (ctx.GY_BAG + 3 * ctx.PITCH);
    console.log('pouch drawer         : ' + (midPhase > 0 && midPhase < 1 ? 'slides' : 'JUMPS') +
      ', lands on the pack squares ' + (pouchLanded ? 'yes' : 'NO') +
      ', bag row 4 gone ' + (!openBoxes.has(bagRow3) ? 'yes' : 'NO'));
    if (!(midPhase > 0 && midPhase < 1)) problems.push('the pouch appears without sliding');
    if (!packBoxes.has(bagRow0)) problems.push('test is wrong: no bag square at the top row');
    if (!pouchLanded) problems.push('the pouch does not land where the pack squares were');
    if (openBoxes.has(bagRow3)) problems.push('the bag is still showing under the pouch');
    if (openBoxes.size !== 15) problems.push('expected 5 equip + 10 pouch squares, got ' + openBoxes.size);

    ctx.setPouch(null);
    G.pouchT = Date.now() - ctx.POUCH_SLIDE_MS - 50;
    frame('pouch-closed');
    if (new Set(boxes()).size !== 25) problems.push('the pack did not come back');
    P.slots[0] = null; G.mode = 'play'; G.invOpen = 0;
  }

  /* ---- dying is not instant -----------------------------------------
     The screen used to be replaced the moment the blow landed, so the
     line that killed you - and whatever the wand you gambled on turned
     out to do - was never shown at all.  The stone has to wait for the
     log, the panel has to stay readable, and nothing you press in the
     meantime should count. */
  {
    const P = ctx.P, L = ctx.L, G = ctx.G;
    let checked = 0, deathBad = [];
    for (let s = 0; s < 40 && checked < 10; s++) {
      const m = ctx.mkMonster('T', 6, P.x + 1, P.y);
      m.state = 2; m.surprised = 0; m.disguise = 0;
      L.mons.length = 0; L.mons.push(m);
      P.hp = 3; G.dead = 0; G.mode = 'play'; G.beat = 0;
      G.msgq = []; G.log = [];
      let guard = 0;
      while (!G.dead && guard++ < 60) { ctx.monAttack(m); if (G.dead) break; P.hp = 3; }
      if (!G.dead) continue;
      checked++;
      vm.runInContext('finishMsgs();', ctx);
      if (G.mode !== 'dying') { deathBad.push('went straight to ' + G.mode); continue; }
      let last = 0;
      for (const e of G.log) if (e.at > last) last = e.at;
      if (G.deadAt < last)
        deathBad.push('the stone beats the last line by ' + (last - G.deadAt) + 'ms');
      else if (G.deadAt - last < ctx.DEATH_PAUSE - 1)
        deathBad.push('only ' + (G.deadAt - last) + 'ms to read it');
      const x = P.x, y = P.y, hp = P.hp;
      key('ArrowLeft'); key('Enter');
      if (P.x !== x || P.y !== y || P.hp !== hp || G.mode !== 'dying')
        deathBad.push('a keypress got through while dying');
      /* the panel must still be there to read */
      frame('dying-frame');
      const panelText = blits.filter(b => b.tag === 'screen' &&
        b.from === 'font' && b.dx < ctx.PANEL_W).length;
      if (panelText < 10) deathBad.push('the panel went blank while dying');
      G.deadAt = 0;
      frame('dead-over-map');
      const stillPanel = blits.filter(b => b.tag === 'screen' &&
        b.from === 'font' && b.dx < ctx.PANEL_W).length;
      if (stillPanel < 10) deathBad.push('the tombstone covered the panel');
      if (G.mode !== 'dead') deathBad.push('the stone never went up');
      /* the headstone carving must not sit on top of the words: the
         font-on-font check cannot see a sprite doing it */
      const inBox = b => b.tag === 'screen' && b.dx >= ctx.VIEW_PX;
      const art = blits.filter(b => inBox(b) && b.from === 'atlas' && b.dw > 8);
      const words = blits.filter(b => inBox(b) && b.from === 'font');
      for (const a of art) for (const w of words)
        if (a.dx < w.dx + w.dw && w.dx < a.dx + a.dw &&
            a.dy < w.dy + w.dh && w.dy < a.dy + a.dh)
          deathBad.push('the grave is drawn over the epitaph at ' + w.dx + ',' + w.dy);
    }
    console.log('dying                : ' + checked + ' deaths watched, ' +
      (deathBad.length ? deathBad.length + ' problems' :
       'log first, then the stone, panel readable throughout'));
    if (!checked) problems.push('never managed to die - death pacing untested');
    for (const b of [...new Set(deathBad)].slice(0, 4)) problems.push('dying: ' + b);
    ctx.G.dead = 0; ctx.G.mode = 'play'; ctx.P.hp = ctx.P.mhp;
  }

  // force the win screen
  ctx.P.amulet = 1; ctx.G.mode = 'win';
  counts.win = frame('win');

  // a thrown thing is drawn as itself while it is in the air
  {
    const P = ctx.P, L = ctx.L, G = ctx.G;
    G.mode = 'play'; G.menu = null; G.invOpen = 0; G.dead = 0;
    P.hp = P.mhp; P.blind = 0; P.hallu = 0;
    L.mons.length = 0; L.items.length = 0;
    for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;
    /* mid-flight, halfway along: this is what throwAtSquare sets up */
    G.shot = { sx: P.x, sy: P.y, ex: P.x + 6, ey: P.y,
               t: Date.now() - 40, dur: 200, tail: 4, spr: 'stone' };
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    const si = ATLAS.index['stone'];
    const sx = (si % ATLAS.cols) * 8, sy = ((si / ATLAS.cols) | 0) * 8;
    const hits = blits.filter(b => b.tag === 'screen' && b.from === 'atlas' &&
                                   b.sx === sx && b.sy === sy);
    console.log('thrown stone in flight:', hits.length,
      hits.map(h => '(' + h.dx + ',' + h.dy + ')').join(' '));
    if (hits.length !== 1)
      problems.push('expected exactly 1 stone in the air, drew ' + hits.length);
    for (const h of hits)
      if (!Number.isInteger(h.dx) || !Number.isInteger(h.dy))
        problems.push('a thrown thing was drawn on a fractional pixel');
    G.shot = null;
    ctx.G.bolt = null;
  }

  // a monster that moved twice must be drawn walking, not teleporting
  {
    const L = ctx.L, P = ctx.P;
    /* The soak may have left us blind or hallucinating; either would hide
       the monster or randomise its sprite, and this check is about
       movement, not eyesight. */
    P.blind = 0; P.hallu = 0; P.monsight = 0;
    for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;
    L.mons.length = 0;
    L.corpses.length = 0;      /* a corpse uses the same sprite */
    const m = ctx.mkMonster('K', 3, P.x + 2, P.y);
    m.state = 2; m.disguise = 0; m.invis = 0;
    /* Each step carries the moment it happens.  They used to share one,
       which is what made a bat's two squares look like a teleport. */
    const walk = (t0) => [[P.x, P.y, P.x + 1, P.y, t0],
                          [P.x + 1, P.y, P.x + 2, P.y, t0 + ctx.BEAT_STEP]];
    m.anim = walk(Date.now());
    L.mons.push(m);
    const ai = ATLAS.index['mon_K'];
    const ax = (ai % ATLAS.cols) * 8, ay = ((ai / ATLAS.cols) | 0) * 8;
    const seen = [];
    ctx.G.mode = 'play'; ctx.G.menu = null; ctx.G.pouch = null; ctx.G.invOpen = 0;
    for (const off of [10, 60, 160, 400, ctx.BEAT_STEP + 60, ctx.BEAT_STEP + 400]) {
      /* monPixel clears the walk once it has played out, so hand it a
         fresh one for every sample */
      m.anim = walk(Date.now() - off);
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const b = blits.find(o => o.tag === 'screen' && o.from === 'atlas' && o.sx === ax && o.sy === ay);
      if (b) {
        seen.push(b.dx);
        if (!Number.isInteger(b.dx) || !Number.isInteger(b.dy))
          problems.push('animated monster drawn on a fractional pixel');
      }
    }
    const distinct = new Set(seen).size;
    console.log('walk animation       :', seen.length, 'samples,', distinct, 'distinct x positions');
    if (distinct < 3) problems.push('double move still looks instantaneous: ' + distinct + ' positions');
    m.animT = 0; m.anim = null;
  }

  /* ENTER on something you are already wearing takes it off.  ENTER is
     "do the obvious thing with this", and the obvious thing with a sword
     already in your hand is to put it away. */
  {
    const P = ctx.P;
    ctx.G.mode = 'inv'; ctx.G.pouch = null; ctx.G.sel = null;
    ctx.G.invMode = 'normal';
    const sword = ctx.mkItem('weapon', ctx.weaponIndex('long sword'));
    sword.known = 1; sword.cursed = 0;
    P.eq.rh = sword;
    P.slots = new Array(ctx.N_SLOTS).fill(null);
    /* the cursor on the equip row, over the right hand */
    ctx.G.cur.r = 0; ctx.G.cur.c = ctx.EQ_ORDER.indexOf('rh');
    vm.runInContext('invEnter();', ctx);
    const off = P.eq.rh === null;
    let inPack = false;
    for (const s of P.slots) if (s === sword) inPack = true;
    console.log('enter on a worn item :', off ? 'taken off' : 'still worn',
      inPack ? 'and in the pack' : 'and NOT in the pack');
    if (!off) problems.push('ENTER on a worn item did not take it off');
    if (!inPack) problems.push('the item did not go back into the pack');
    /* and a cursed one stays put */
    const stuck = ctx.mkItem('weapon', ctx.weaponIndex('long sword'));
    stuck.known = 1; stuck.cursed = 1;
    P.eq.rh = stuck;
    vm.runInContext('invEnter();', ctx);
    if (P.eq.rh !== stuck) problems.push('a cursed item came off');
    P.eq.rh = null;
    ctx.G.mode = 'play';
  }

  /* Three stages of light: bright close to you, dimmer at the edge of
     what you can see, and dimmer still for what you only remember. */
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.mode = 'play'; ctx.G.bolt = null; ctx.G.aim = null; ctx.G.shot = null;
    /* Stand in a hallway, where your sight really does run out: a room
       with a lamp in it is lit to its walls, and rightly has no falloff
       to show. */
    let spot = null;
    for (let i = 0; i < L.tiles.length && !spot; i++)
      if (L.tiles[i] === ctx.CORR && !L.darkMap[i])
        spot = [i % ctx.MAP_W, (i / ctx.MAP_W) | 0];
    let big = null;
    for (const r of L.rooms)
      if (!r.gone && r.lit && !r.dark && (!big || r.floors.length > big.floors.length)) big = r;
    if (spot || big) {
      if (spot) { P.x = spot[0]; P.y = spot[1]; }
      else { P.x = big.cx; P.y = big.cy; }
      for (let i = 0; i < L.flags.length; i++) L.flags[i] |= ctx.F_SEEN;
      ctx.computeVis();
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const bands = {};
      /* and count the walls and the floors apart: a wall standing round a
         lit room should be as lit as the room, and it was not */
      const wallCell = n => { const i = ATLAS.index[n]; return [(i % ATLAS.cols) * 8, ((i / ATLAS.cols) | 0) * 8]; };
      /* every flagstone variant, however many there are, the same way the
         wall variants are gathered - naming two of three quietly stopped
         counting the third */
      const floors = Object.keys(ATLAS.index).filter(n => n.indexOf('floor') === 0).map(wallCell);
      const walls = Object.keys(ATLAS.index).filter(n => n.indexOf('wall') === 0).map(wallCell);
      let wallBright = 0, wallDim = 0, floorBright = 0, floorDim = 0;
      /* Two vantage points, counted together: a hallway is where your own
         light runs out, and a lit room is where the flagstones are - from
         a corridor square every piece of ground in view is corridor, so
         asking one frame for both was asking it for something it does not
         have. */
      if (spot && big) {
        const keep = blits.slice();
        P.x = big.cx; P.y = big.cy;
        ctx.computeVis();
        blits = []; fills = [];
        vm.runInContext('render();', ctx);
        blits = keep.concat(blits);
      }
      for (const b of blits) {
        if (b.tag !== 'screen' || b.from !== 'atlas' || b.dx < ctx.VIEW_PX) continue;
        if (b.dw !== 8 || b.dh !== 8) continue;
        const k = b.at.toFixed(2);
        bands[k] = (bands[k] || 0) + 1;
        const isFloor = floors.some(c => b.sx === c[0] && b.sy === c[1]);
        const isWall = walls.some(c => b.sx === c[0] && b.sy === c[1]);
        if (isFloor) { if (b.at > 0.99) floorBright++; else if (b.at > ctx.DIM_A + 0.01) floorDim++; }
        if (isWall) { if (b.at > 0.99) wallBright++; else if (b.at > ctx.DIM_A + 0.01) wallDim++; }
      }
      console.log('walls and floors     : ' + wallBright + ' walls fully lit, ' + wallDim +
        ' at the edge; ' + floorBright + ' floors fully lit, ' + floorDim + ' at the edge');
      if (!wallBright) problems.push('no wall is ever drawn at full brightness');
      if (!floorBright) problems.push('no floor is drawn at full brightness');

      /* A room with a lamp in it is lit to its walls and its doorways.
         The dimmer stage marks where your own light runs out, not where a
         dark corridor happens to adjoin a lit room - shade creeping out
         of a hallway into a lit room reads as the room being unlit near
         the exit, which it is not. */
      {
        let litDim = 0, litSeen = 0;
        for (const b of blits) {
          if (b.tag !== 'screen' || b.from !== 'atlas' || b.dw !== 8 || b.dh !== 8) continue;
          if (b.dx < ctx.VIEW_PX) continue;
          if (!floors.some(c => b.sx === c[0] && b.sy === c[1])) continue;
          const vx = Math.round((b.dx - ctx.VIEW_PX) / 8);
          const vy = Math.round((b.dy - ctx.VIEW_PY) / 8);
          const mx = P.x - (ctx.VIEW_W >> 1) + vx, my = P.y - (ctx.VIEW_H >> 1) + vy;
          if (mx < 0 || my < 0 || mx >= ctx.MAP_W || my >= ctx.MAP_H) continue;
          if (!L.litMap[my * ctx.MAP_W + mx]) continue;
          litSeen++;
          if (b.at < 0.99 && b.at > ctx.DIM_A + 0.01) litDim++;
        }
        console.log('a lit room           : ' + litSeen + ' of its squares in view, ' +
          litDim + ' of them shaded');
        if (litDim) problems.push(litDim + ' squares of a lit room are drawn shaded');
      }

      /* A secret door is a wall until you find it, and it has to be lit
         as one.  Lit as the floor it will become, it comes out a shade
         different from the stones round it - which is how you find one
         without ever searching. */
      {
        /* put one in every wall of the room and look at all of them:
           waiting for the floor to have generated one in view tests
           nothing on the floors that did not */
        let doors = 0, giveaway = 0;
        const walls2 = [];
        for (let i = 0; i < L.tiles.length; i++) {
          if (L.tiles[i] !== ctx.WALL || !(L.flags[i] & ctx.F_VIS)) continue;
          walls2.push(i);
        }
        for (const i of walls2.slice(0, 24)) {
          const mx = i % ctx.MAP_W, my = (i / ctx.MAP_W) | 0;
          const asWall = ctx.tileLight(mx, my);
          L.tiles[i] = ctx.SDOOR;
          const asDoor = ctx.tileLight(mx, my);
          L.tiles[i] = ctx.WALL;
          doors++;
          if (Math.abs(asWall - asDoor) > 0.01) giveaway++;
        }
        console.log('secret doors         : ' + doors + ' tried, ' + giveaway +
          ' a different shade from the wall they hide in');
        if (giveaway) problems.push(giveaway + ' secret doors give themselves away by their shade');
      }

      /* and your own light does run out somewhere: in the dark, the last
         square it reaches is the dimmer stage */
      {
        let dim = 0;
        const save = L.litMap;
        L.litMap = new Uint8Array(L.litMap.length);   /* no lamps anywhere */
        ctx.computeVis();
        blits = []; fills = [];
        vm.runInContext('render();', ctx);
        for (const b of blits) {
          if (b.tag !== 'screen' || b.from !== 'atlas' || b.dw !== 8 || b.dh !== 8) continue;
          if (b.dx < ctx.VIEW_PX) continue;
          if (Math.abs(b.at - ctx.LIGHT_EDGE) < 0.01) dim++;
        }
        L.litMap = save;
        ctx.computeVis();
        console.log('your own light       : ' + dim + ' squares at the edge of it with no lamps lit');
        if (!dim) problems.push('nothing is drawn at the edge shade even with every lamp out');
      }

      /* A wall has no light of its own: it is lit by the room it stands
         round.  So no wall may be dimmer than the ground beside it - one
         side of a room came out dimmer than the other because the walls
         on that side had a corridor behind them, and the corridor is the
         very thing the wall is there to hide. */
      {
        const shadeAtXY = {};
        for (const b of blits) {
          if (b.tag !== 'screen' || b.from !== 'atlas' || b.dw !== 8 || b.dh !== 8) continue;
          if (b.dx < ctx.VIEW_PX) continue;
          const vx = Math.round((b.dx - ctx.VIEW_PX) / 8);
          const vy = Math.round((b.dy - ctx.VIEW_PY) / 8);
          const mx = P.x - (ctx.VIEW_W >> 1) + vx, my = P.y - (ctx.VIEW_H >> 1) + vy;
          const isWall = walls.some(c => b.sx === c[0] && b.sy === c[1]);
          const isFloor = floors.some(c => b.sx === c[0] && b.sy === c[1]);
          if (isWall || isFloor) shadeAtXY[mx + ',' + my] = { at: b.at, wall: isWall };
        }
        let shy = 0, checked = 0;
        for (const k in shadeAtXY) {
          const cellHere = shadeAtXY[k];
          if (!cellHere.wall || cellHere.at <= ctx.DIM_A + 0.01) continue;
          const [mx, my] = k.split(',').map(Number);
          for (const [dx, dy] of ctx.DIR8) {
            const n = shadeAtXY[(mx + dx) + ',' + (my + dy)];
            if (!n || n.wall || n.at <= ctx.DIM_A + 0.01) continue;
            checked++;
            if (n.at > cellHere.at + 0.01) { shy++; break; }
          }
        }
        console.log('walls beside floor   : ' + checked + ' checked, ' + shy +
          ' dimmer than the ground they stand beside');
        if (shy) problems.push(shy + ' walls are dimmer than the floor beside them');
      }
      /* A corner patch is laid down solid, so its own fade has to match
         the tile it is covering.  With one faded sheet for every shade
         but only the remembered one to draw from, the corners of a dimmed
         wall came out at the darkness of a wall you cannot see. */
      const tileAt = {};
      for (const b of blits) {
        if (b.tag !== 'screen' || b.dw !== 8 || b.dh !== 8) continue;
        tileAt[b.dx + ',' + b.dy] = b.at;
      }
      let patches = 0, mismatched = 0;
      for (const b of blits) {
        if (b.tag !== 'screen' || b.dw !== 2 || b.dh !== 2) continue;
        const ox = b.dx - ((b.dx - ctx.VIEW_PX) % 8);
        const oy = b.dy - ((b.dy - ctx.VIEW_PY) % 8);
        const want = tileAt[ox + ',' + oy];
        if (want === undefined) continue;
        patches++;
        if (Math.abs(b.shade - want) > 0.02) mismatched++;
      }
      console.log('corner patches       : ' + patches + ' checked, ' + mismatched +
        ' at a different shade from the tile under them');
      if (mismatched) problems.push(mismatched + ' corner patches are the wrong shade');
      const got = Object.keys(bands).map(Number).sort((a, b) => b - a);
      console.log('stages of light      : alphas ' + JSON.stringify(bands));
      const wantBright = got.some(v => Math.abs(v - 1) < 0.01);
      /* the edge shade is checked on its own below, with the lamps out:
         a floor whose rooms are all lit rightly has none of it */
      const wantEdge = true;
      const wantDim = got.some(v => Math.abs(v - ctx.DIM_A) < 0.01);
      if (!wantBright) problems.push('nothing is drawn at full brightness');
      if (!wantEdge) problems.push('no square is drawn at the edge brightness ' + ctx.LIGHT_EDGE);
      if (!wantDim) problems.push('nothing is drawn as remembered');
      if (ctx.LIGHT_EDGE >= 1 || ctx.LIGHT_EDGE <= ctx.DIM_A)
        problems.push('the edge stage is not between bright and remembered');
    }
  }

  /* A rat has a nose and a tail, so it is mirrored when it walks the
     other way rather than running backwards.  And cracked flagstones are
     painted joining a hole above them, so beside a hole they are turned
     to face it. */
  {
    const P = ctx.P, L = ctx.L;
    const cell = n => { const i = ATLAS.index[n]; return [(i % ATLAS.cols) * 8, ((i / ATLAS.cols) | 0) * 8]; };
    const rat = cell('mon_K');
    ctx.G.mode = 'play'; ctx.G.bolt = null; ctx.G.aim = null; ctx.G.shot = null;
    P.x = ctx.MAP_W >> 1; P.y = ctx.MAP_H >> 1; P.warp = null;
    L.mons.length = 0; L.clouds.length = 0;
    let spot = null;
    for (const [dx, dy] of ctx.DIR4) if (ctx.walkable(P.x + dx, P.y + dy)) { spot = [P.x + dx, P.y + dy]; break; }
    if (spot) {
      const m = ctx.mkMonster('K', 1, spot[0], spot[1]);
      m.hp = m.mhp = 90; m.state = 2; L.mons.push(m);
      ctx.computeVis();
      const ratBlit = () => {
        blits = []; fills = [];
        vm.runInContext('render();', ctx);
        return blits.find(b => b.tag === 'screen' && b.from === 'atlas' &&
          b.sx === rat[0] && b.sy === rat[1] && b.dx >= ctx.VIEW_PX);
      };
      m.face = 1;
      const right = ratBlit();
      m.face = -1;
      const left = ratBlit();
      console.log('rat facing           : walking right flip=' + (right && right.flip) +
        ', walking left flip=' + (left && left.flip));
      if (!right || !left) problems.push('the rat is not drawn at all');
      else {
        if (right.flip) problems.push('a rat walking right is drawn mirrored');
        if (!left.flip) problems.push('a rat walking left is not drawn mirrored');
      }
      L.mons.length = 0;
    }

    /* a hole, with a cracked flagstone on each side of it */
    const hx = P.x, hy = P.y - 2;
    if (hx > 2 && hy > 2 && hx < ctx.MAP_W - 3 && hy < ctx.MAP_H - 3) {
      const idx = (x, y) => y * ctx.MAP_W + x;
      for (let y = hy - 2; y <= hy + 2; y++)
        for (let x = hx - 2; x <= hx + 2; x++) { L.tiles[idx(x, y)] = ctx.FLOOR; delete L.decor[idx(x, y)]; }
      L.tiles[idx(hx, hy)] = ctx.HOLE;
      const crack = cell('crack');
      const sides = [[hx, hy + 1, 0], [hx - 1, hy, 1], [hx, hy - 1, 2], [hx + 1, hy, 3]];
      /* the crack below the hole has the hole above it: no turn.  Then
         clockwise round: left of the hole is a quarter, above is a half,
         right is three quarters. */
      const want = { }; want[hx + ',' + (hy + 1)] = 0; want[(hx - 1) + ',' + hy] = 1;
      want[hx + ',' + (hy - 1)] = 2; want[(hx + 1) + ',' + hy] = 3;
      for (const [x, y] of [[hx, hy + 1], [hx - 1, hy], [hx, hy - 1], [hx + 1, hy]])
        L.decor[idx(x, y)] = 'crack';
      ctx.computeVis();
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const cracks = blits.filter(b => b.tag === 'screen' && b.from === 'atlas' &&
        b.sx === crack[0] && b.sy === crack[1] && b.dx >= ctx.VIEW_PX);
      const turns = cracks.map(b => b.turn).sort();
      console.log('cracks round a hole  : ' + cracks.length + ' drawn, turns ' +
        JSON.stringify(turns));
      if (cracks.length !== 4) problems.push('expected 4 cracked flagstones, drew ' + cracks.length);
      else if (turns.join(',') !== '0,1,2,3')
        problems.push('the cracks round a hole are not each turned to face it: ' + turns.join(','));
      /* and the hole itself has no lip painted round it */
      const lip = fills.filter(f => f.tag === 'screen' && (f.w === 8 && f.h === 1 || f.w === 1 && f.h === 8) &&
        f.col === '#3f4966');
      if (lip.length) problems.push(lip.length + ' bright edges drawn round a hole');
      for (let y = hy - 2; y <= hy + 2; y++)
        for (let x = hx - 2; x <= hx + 2; x++) delete L.decor[idx(x, y)];
    }
  }

  /* Going somewhere else without walking there: shake where it stood, a
     flash at each end, and only then is it somewhere else.  What must
     never happen is the creature simply being on the new square while
     the flight is still playing. */
  {
    const P = ctx.P, L = ctx.L;
    const cell = n => { const i = ATLAS.index[n]; return [(i % ATLAS.cols) * 8, ((i / ATLAS.cols) | 0) * 8]; };
    const witch = cell('mon_k');
    const flashes = ctx.WARP_FRAMES.map(cell);
    ctx.G.mode = 'play'; ctx.G.bolt = null; ctx.G.aim = null; ctx.G.shot = null;
    P.x = ctx.MAP_W >> 1; P.y = ctx.MAP_H >> 1; P.warp = null;
    L.mons.length = 0; L.clouds.length = 0;
    /* two clear squares beside you */
    let from = null, to = null;
    for (const [dx, dy] of ctx.DIR4) {
      if (!ctx.walkable(P.x + dx, P.y + dy)) continue;
      if (!from) from = [P.x + dx, P.y + dy];
      else if (!to) to = [P.x + dx, P.y + dy];
    }
    if (from && to) {
      const m = ctx.mkMonster('k', 6, to[0], to[1]);
      m.hp = m.mhp = 900; m.state = 2;
      L.mons.push(m);
      ctx.computeVis();
      const look = () => {
        blits = []; fills = [];
        vm.runInContext('render();', ctx);
        /* only what is drawn on the map.  The side panel lists every
           creature you can see, and it goes on listing one that is
           halfway through going somewhere else - which is right, and is
           not the question being asked here. */
        const has = c => blits.some(b => b.tag === 'screen' && b.from === 'atlas' &&
          b.sx === c[0] && b.sy === c[1] && b.dx >= ctx.VIEW_PX);
        return { witch: has(witch), flash: flashes.findIndex(has) };
      };
      /* mid-shake: still drawn on the square it is leaving */
      m.warp = { fx: from[0], fy: from[1], t: Date.now() - 100 };
      const shaking = look();
      /* and the shiver is a shiver: sampling it a few frames apart gives
         different pixels to sit on */
      const spots = new Set();
      for (let n = 0; n < 8; n++) {
        const j = ctx.warpJitter({ fx: from[0], fy: from[1] }, n * ctx.WARP_SHAKE_STEP);
        spots.add(j[0] + ',' + j[1]);
      }
      console.log('teleport shiver      :', spots.size, 'different pixels over 8 steps of',
        ctx.WARP_SHAKE_STEP + 'ms');
      if (spots.size < 3) problems.push('the teleport shiver barely moves: ' + [...spots].join(' '));
      /* mid-flash: not drawn at all, a flash at each end instead - and
         the flash is three frames, so sampling it early, halfway and
         late has to give three different pictures */
      const frames = [];
      const step = ctx.WARP_FLASH / ctx.WARP_FRAMES.length;
      /* Hold the clock still.  Sampling by subtracting from Date.now()
         and then rendering means the frame drawn is the one the render
         took long enough to reach, which is a test of how fast this
         machine is rather than of the animation. */
      const RealDate = ctx.Date;
      const frozen = RealDate.now();
      ctx.Date = { now: () => frozen };
      for (let n = 0; n < ctx.WARP_FRAMES.length; n++) {
        m.warp = { fx: from[0], fy: from[1],
                   t: frozen - (ctx.WARP_SHAKE + step * n + step / 2) };
        frames.push(look().flash);
      }
      ctx.Date = RealDate;
      m.warp = { fx: from[0], fy: from[1], t: Date.now() - (ctx.WARP_SHAKE + 20) };
      const flashing = look();
      console.log('flash frames         :', JSON.stringify(frames),
        'of', ctx.WARP_FRAMES.length, 'icons');
      if (new Set(frames).size !== ctx.WARP_FRAMES.length)
        problems.push('the flash does not run all ' + ctx.WARP_FRAMES.length +
          ' of its frames: saw ' + JSON.stringify(frames));
      /* after: ordinary again */
      m.warp = { fx: from[0], fy: from[1],
                 t: Date.now() - (ctx.WARP_SHAKE + ctx.WARP_FLASH + 50) };
      const done = look();
      console.log('teleport frames      : shaking', shaking.witch ? 'creature' : 'nothing',
        '| flash', flashing.witch ? 'creature still drawn' : 'creature hidden',
        flashing.flash >= 0 ? '+ flash' : '+ NO FLASH',
        '| after', done.witch ? 'creature' : 'nothing');
      if (!shaking.witch) problems.push('a creature mid-teleport is not drawn while it shakes');
      if (flashing.witch) problems.push('a creature is drawn during the flash of its teleport');
      if (flashing.flash < 0) problems.push('no flash is drawn when something teleports');
      if (!done.witch) problems.push('a creature never comes back from a teleport');
      /* and one conjured a moment ago is not drawn before it arrives */
      m.warp = null;
      m.showAt = Date.now() + 5000;
      const early = look();
      m.showAt = 0;
      const there = look();
      if (early.witch) problems.push('a conjured creature is drawn before it arrives');
      if (!there.witch) problems.push('a conjured creature is never drawn');
      L.mons.length = 0;
    }
  }

  /* Fire a creature throws is worked out the instant it takes its turn
     and lands a beat later.  Drawn at the working-out, the player stood
     in flames before the ball had left the creature's mouth. */
  {
    const P = ctx.P, L = ctx.L;
    const flames = ['flame', 'fire_wall'].map(n => {
      const i2 = ATLAS.index[n];
      return [(i2 % ATLAS.cols) * 8, ((i2 / ATLAS.cols) | 0) * 8];
    });
    ctx.G.mode = 'play'; ctx.G.bolt = null; ctx.G.aim = null; ctx.G.shot = null;
    P.x = ctx.MAP_W >> 1; P.y = ctx.MAP_H >> 1;
    L.clouds.length = 0;
    ctx.computeVis();
    const countFlames = () => {
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      return blits.filter(b => b.tag === 'screen' && b.from === 'atlas' &&
        flames.some(c => b.sx === c[0] && b.sy === c[1])).length;
    };
    /* fire that has not started yet */
    L.clouds.push({ x: P.x, y: P.y, kind: 'fire', turns: 2, at: Date.now() + 5000 });
    const early = countFlames();
    /* and the same fire once its moment has come */
    L.clouds[0].at = Date.now() - 1;
    const late = countFlames();
    console.log('fire in flight       :', early, 'flames before its moment,', late, 'after');
    if (early) problems.push('fire is drawn before the thing that lit it has landed');
    if (!late) problems.push('fire is never drawn at all');
    L.clouds.length = 0;
  }

  /* A barrel with its fuse lit is drawn burning.  It goes up a turn
     later, and that turn is the one you have to get out of the room in -
     which is no use if the only sign of it is a line in the log. */
  {
    const P = ctx.P, L = ctx.L;
    const flames = ['flame', 'fire_wall'].map(n => {
      const i2 = ATLAS.index[n];
      return [(i2 % ATLAS.cols) * 8, ((i2 / ATLAS.cols) | 0) * 8];
    });
    ctx.G.mode = 'play'; ctx.G.bolt = null; ctx.G.aim = null; ctx.G.shot = null;
    P.x = ctx.MAP_W >> 1; P.y = ctx.MAP_H >> 1;
    /* somewhere beside you that you can see */
    let bx = null, by = null;
    for (const [dx, dy] of ctx.DIR4) {
      if (ctx.walkable(P.x + dx, P.y + dy)) { bx = P.x + dx; by = P.y + dy; break; }
    }
    if (bx === null) { L.tiles[P.y * ctx.MAP_W + P.x + 1] = ctx.FLOOR; bx = P.x + 1; by = P.y; }
    const bj = by * ctx.MAP_W + bx;
    L.barrels[bj] = 1; L.decor[bj] = 'barrel'; L.fuses = {};
    L.clouds.length = 0;
    ctx.computeVis();
    const findFlame = () => {
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      return blits.filter(b => b.tag === 'screen' && b.from === 'atlas' &&
        flames.some(c => b.sx === c[0] && b.sy === c[1]));
    };
    const before = findFlame().length;
    ctx.lightBarrel(bx, by);
    ctx.computeVis();
    const after = findFlame().length;
    console.log('a lit barrel         :', before, 'flames before the fuse,', after, 'after');
    if (!L.fuses[bj]) problems.push('the barrel would not light');
    if (after <= before) problems.push('a barrel with its fuse lit is drawn no differently');
    delete L.barrels[bj]; delete L.decor[bj]; L.fuses = {};
  }

  // you are always in the exact middle of the view, wherever you stand
  {
    const P = ctx.P, L = ctx.L;
    /* the player blinks between two frames, and the status bar reuses the
       same sprite, so match either frame and only inside the map view */
    const cells = ['hero', 'hero2'].map(n => {
      const i2 = ATLAS.index[n];
      return [(i2 % ATLAS.cols) * 8, ((i2 / ATLAS.cols) | 0) * 8];
    });
    P.hurt = null;             /* a flinch shifts the sprite a pixel */
    const spots = [[1, 1], [ctx.MAP_W - 2, 1], [1, ctx.MAP_H - 2],
                   [ctx.MAP_W - 2, ctx.MAP_H - 2],
                   [ctx.MAP_W >> 1, ctx.MAP_H >> 1]];
    const seen = new Set();
    ctx.G.mode = 'play'; ctx.G.bolt = null; ctx.G.aim = null;
    for (const [sx, sy] of spots) {
      P.x = sx; P.y = sy;
      blits = []; fills = [];
      try { vm.runInContext('render();', ctx); }
      catch (e) { problems.push('render crash at map edge: ' + e.message); break; }
      const h = blits.find(b => b.tag === 'screen' && b.from === 'atlas' &&
        b.dy < ctx.VIEW_PY + ctx.VIEW_H * 8 && b.dy >= ctx.VIEW_PY &&
        b.dx >= ctx.VIEW_PX &&
        cells.some(c => b.sx === c[0] && b.sy === c[1]));
      if (!h) { problems.push('player not drawn at ' + sx + ',' + sy); continue; }
      seen.add(h.dx + ',' + h.dy);
    }
    console.log('player position       :', [...seen].join(' ') || 'none');
    if (seen.size > 1)
      problems.push('camera drifts at the map edge: ' + [...seen].join(' '));
  }

  // the panel must re-flow around a crowd, never draw on top of itself
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.mode = 'play'; ctx.G.dead = 0; ctx.G.menu = null; ctx.G.invOpen = 0;
    const counts = [];
    for (const n of [0, 4]) {
      L.mons.length = 0;
      for (let i = 0; i < n; i++) {
        const m = ctx.mkMonster('O', 5, P.x + 1 + i, P.y);
        m.state = 2; m.disguise = 0; L.mons.push(m);
      }
      ctx.computeVis();
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      validate('panel/' + n + 'foes');
      // every pixel a sprite or glyph puts inside the panel, counted once
      const seen = new Map();
      let clashes = 0;
      for (const b of blits) {
        if (b.tag !== 'screen' || b.dx >= ctx.PANEL_W) continue;
        for (let y = b.dy; y < b.dy + b.dh; y++)
          for (let x = b.dx; x < b.dx + b.dw; x++) {
            const k = y * 1000 + x;
            if (seen.has(k)) clashes++;
            seen.set(k, 1);
          }
      }
      counts.push({ n, panelBlits: blits.filter(b => b.tag === 'screen' && b.dx < ctx.PANEL_W).length, clashes });
      if (clashes > 0)
        problems.push('panel draws on top of itself with ' + n + ' foes (' + clashes + ' px)');
    }
    console.log('panel re-flow         :', counts.map(c => c.n + ' foes -> ' +
      c.panelBlits + ' marks, ' + c.clashes + ' overlaps').join('; '));
    if (counts[1].panelBlits <= 0) problems.push('the battle panel drew nothing');
    L.mons.length = 0;
  }

  // while the map is showing, words belong in the panel - the only thing
  // allowed over the dungeon is the key belt in the top corner
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.dead = 0; ctx.G.menu = null; ctx.G.invOpen = 0;
    P.keys[1] = 1; P.keys[3] = 2;
    /* the bottom line only draws when something is wrong with you, and the
       bottom line is exactly where clipping shows up */
    ctx.G.hungerState = 3; P.conf = 5; P.haste = 4; P.amulet = 1;
    L.mons.length = 0;
    for (let i = 0; i < 3; i++) {
      const m = ctx.mkMonster('R', 6, P.x + 2 + i, P.y);
      m.state = 2; m.disguise = 0; L.mons.push(m);
    }
    ctx.computeVis();
    const strays = [];
    for (const mode of ['play', 'dir', 'target', 'blink']) {
      ctx.G.mode = 'play';
      if (mode === 'target') { ctx.beginShooting(); if (ctx.G.mode !== 'target') continue; }
      else if (mode === 'dir') { ctx.G.aim = ctx.P.slots.find(s2 => s2) || null; ctx.G.mode = 'dir'; }
      else if (mode === 'blink') { ctx.G.bl = { x: P.x + 1, y: P.y }; ctx.G.mode = 'blink'; }
      blits = []; fills = [];
      try { vm.runInContext('render();', ctx); }
      catch (e) { problems.push('render crash in ' + mode + ': ' + e.message); continue; }
      validate('aim/' + mode);
      for (const b of blits) {
        if (b.tag !== 'screen' || b.from !== 'font') continue;
        const inPanel = b.dx + b.dw <= ctx.PANEL_W;
        const inKeyBelt = b.dy < 12 && b.dx > ctx.SW / 2;
        if (!inPanel && !inKeyBelt) strays.push(mode + ' @' + b.dx + ',' + b.dy);
      }
    }
    console.log('text stays in panel   :',
      strays.length ? strays.slice(0, 4).join(' ') : 'yes, in every aiming mode');
    if (strays.length)
      problems.push('text drawn over the map: ' + [...new Set(strays)].slice(0, 3).join(', '));
    ctx.G.mode = 'play'; ctx.G.bl = null; ctx.G.aim = null; L.mons.length = 0;
    ctx.G.hungerState = 0; P.conf = 0; P.haste = 0; P.amulet = 0;
  }

  // a hit shows on screen: knocked back a pixel, washed in red
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.mode = 'play'; ctx.G.dead = 0; ctx.G.menu = null; ctx.G.invOpen = 0;
    L.mons.length = 0;
    const m = ctx.mkMonster('O', 5, P.x + 1, P.y);
    m.state = 2; m.disguise = 0; m.anim = null;
    L.mons.push(m);
    ctx.computeVis();
    const mi = ATLAS.index['mon_O'];
    const mx = (mi % ATLAS.cols) * 8, my = ((mi / ATLAS.cols) | 0) * 8;
    const find = () => blits.find(b => b.tag === 'screen' && b.from === 'atlas' &&
      b.sx === mx && b.sy === my);

    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    const calm = find();

    ctx.G.beat = 0;                       // markHurt rides the turn clock
    ctx.markHurt(m, P.x, P.y);            // struck from the player's side
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    const hit = find();
    const flash = blits.filter(b => b.tag === 'screen' && b.from === 'tint' &&
      b.sx === mx && b.sy === my);

    if (!calm || !hit) problems.push('the monster was not drawn');
    else {
      const dx = hit.dx - calm.dx, dy = hit.dy - calm.dy;
      console.log('hit reaction         :', 'shifted ' + dx + ',' + dy +
        ' (away from the blow), ' + flash.length + ' red overlay');
      if (dx !== ctx.HURT_PX || dy !== 0)
        problems.push('knockback was ' + dx + ',' + dy +
          ', expected ' + ctx.HURT_PX + ',0');
      if (!Number.isInteger(hit.dx) || !Number.isInteger(hit.dy))
        problems.push('a flinching sprite landed on a fractional pixel');
      if (flash.length !== 1)
        problems.push('expected one red overlay, got ' + flash.length);
    }

    // and it must settle back on its own
    m.hurt.t = Date.now() - ctx.HURT_MS - 1;
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    const after = find();
    if (!after || after.dx !== calm.dx || after.dy !== calm.dy)
      problems.push('the monster never returned to its square');
    if (m.hurt) problems.push('the flinch was never cleared');
    L.mons.length = 0;
  }

  // a stone offers Throw, and choosing it asks who to hit
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.mode = 'play'; ctx.G.dead = 0; ctx.G.menu = null;
    ctx.G.invOpen = 0; ctx.G.throwing = null;
    L.mons.length = 0;
    // stand somewhere with room around, wherever the soak left us
    for (const r of L.rooms) {
      if (r.gone || r.floors.length < 12) continue;
      P.x = r.cx; P.y = r.cy; break;
    }
    ctx.computeVis();
    // a stone in the pack, and something to aim at down a clear line
    let stone = null;
    for (const it of ctx.carriedItems())
      if (it.t === 'weapon' && ctx.WEAPONS[it.k].thrown) stone = it;
    if (!stone) {
      /* the soak may have thrown them all - this check is about the menu */
      stone = ctx.mkItem('weapon', ctx.weaponIndex('stone'));
      stone.cnt = 3; stone.known = 1;
      if (!ctx.addItem(stone)) { P.slots[0] = stone; }
    }
    else {
      const opts = ctx.itemActions(stone, { kind: 'slot', i: 0 }).map(o => o[1]);
      console.log('stone menu           :', opts.join(' '));
      if (opts.indexOf('Throw') < 0) problems.push('a stone offers no Throw');
      if (opts.some(o => /Wield|Wear|Ready|Raise/.test(o)))
        problems.push('a stone can still be equipped from the menu');

      // walk outwards in every direction until a square works as a target
      let placed = false;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        for (let d = 2; d < 7 && !placed; d++) {
          const x = P.x + dx * d, y = P.y + dy * d;
          if (!ctx.walkable(x, y)) break;
          const m = ctx.mkMonster('O', 5, x, y);
          m.state = 2; m.disguise = 0; m.hp = m.mhp = 400;
          L.mons.push(m);
          ctx.computeVis();
          if (ctx.shotTargets().length) { placed = true; break; }
          L.mons.length = 0;
        }
        if (placed) break;
      }
      if (!placed) problems.push('could not place anything to throw at');
      ctx.computeVis();
      /* One target and it just goes; more than one and the game asks
         which.  Either way the stone must leave the pack. */
      /* Throwing opens a cursor over the map.  It starts on the nearest
         enemy, moves with the arrows, costs nothing until ENTER, and ESC
         puts the stone back untouched. */
      const before = stone.cnt;
      const foe = L.mons[0];
      ctx.beginThrow(stone);
      const onFoe = foe && ctx.G.aimSq &&
        ctx.G.aimSq.x === foe.x && ctx.G.aimSq.y === foe.y;
      console.log('throwing a stone     :', 'mode=' + ctx.G.mode +
        ', cursor ' + (ctx.G.aimSq ? ctx.G.aimSq.x + ',' + ctx.G.aimSq.y : 'none') +
        (foe ? ' (foe at ' + foe.x + ',' + foe.y + ')' : ' (no foe)') +
        ', stones still ' + stone.cnt);
      if (ctx.G.mode !== 'aim') problems.push('throwing did not open the aim cursor');
      if (!ctx.G.aimSq) problems.push('no aim cursor');
      else if (foe && !onFoe) problems.push('the cursor did not start on the nearest enemy');
      if (ctx.G.throwing !== stone) problems.push('choosing Throw did not arm the stone');
      if (stone.cnt !== before) problems.push('the stone was spent before you confirmed');
      if (ctx.G.invOpen) problems.push('the pack stayed open while throwing');

      // the arrows must move the cursor
      const was = ctx.G.aimSq ? ctx.G.aimSq.x + ',' + ctx.G.aimSq.y : '';
      key('ArrowUp'); key('ArrowLeft');
      const now = ctx.G.aimSq ? ctx.G.aimSq.x + ',' + ctx.G.aimSq.y : '';
      if (was === now) problems.push('the arrows did not move the aim cursor');
      frame('aiming');

      // ESC must cancel cleanly
      key('Escape');
      // and ENTER on the stone in the pack must do the same as Throw
      ctx.openInv();
      ctx.G.cur.r = 0; ctx.G.cur.c = 0;
      for (let i = 0; i < ctx.P.slots.length; i++)
        if (ctx.P.slots[i] === stone) { ctx.G.cur.r = (i / 5 | 0) + 1; ctx.G.cur.c = i % 5; }
      ctx.invEnter();
      console.log('ENTER on a stone     :', 'mode=' + ctx.G.mode +
        ', armed=' + (ctx.G.throwing === stone));
      if (ctx.G.mode !== 'aim') problems.push('ENTER on a stone did not start a throw');
      if (ctx.G.throwing !== stone) problems.push('ENTER on a stone armed the wrong thing');
      if (ctx.G.invOpen) problems.push('ENTER on a stone left the pack open');
      key('Escape');
      if (ctx.G.throwing) problems.push('ESC did not cancel the throw');
      if (stone.cnt !== before) problems.push('cancelling still cost a stone');
      if (ctx.G.mode !== 'play') problems.push('ESC left the game in ' + ctx.G.mode);
      // ESC must cancel cleanly
      key('Escape');
      // and ENTER on the stone in the pack must do the same as Throw
      ctx.openInv();
      ctx.G.cur.r = 0; ctx.G.cur.c = 0;
      for (let i = 0; i < ctx.P.slots.length; i++)
        if (ctx.P.slots[i] === stone) { ctx.G.cur.r = (i / 5 | 0) + 1; ctx.G.cur.c = i % 5; }
      ctx.invEnter();
      console.log('ENTER on a stone     :', 'mode=' + ctx.G.mode +
        ', armed=' + (ctx.G.throwing === stone));
      if (ctx.G.mode !== 'aim') problems.push('ENTER on a stone did not start a throw');
      if (ctx.G.throwing !== stone) problems.push('ENTER on a stone armed the wrong thing');
      if (ctx.G.invOpen) problems.push('ENTER on a stone left the pack open');
      key('Escape');
      if (ctx.G.throwing) problems.push('ESC did not cancel the throw');
      if (stone.cnt !== before) problems.push('cancelling still cost a stone');
      if (ctx.G.mode !== 'play') problems.push('ESC left the game in ' + ctx.G.mode);
      frame('throwing');
    }
    ctx.G.throwing = null; ctx.G.targets = []; ctx.G.mode = 'play';
    L.mons.length = 0;
  }

  // standing still means standing still
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.mode = 'play'; ctx.G.dead = 0; ctx.G.menu = null; ctx.G.invOpen = 0;
    L.mons.length = 0; P.hurt = null;
    ctx.computeVis();
    const cells = ['hero', 'hero2'].map(n => {
      const i2 = ATLAS.index[n];
      return [(i2 % ATLAS.cols) * 8, ((i2 / ATLAS.cols) | 0) * 8];
    });
    function heroFrame() {
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const b = blits.find(o => o.tag === 'screen' && o.from === 'atlas' &&
        o.dy >= ctx.VIEW_PY && o.dx >= ctx.VIEW_PX &&
        cells.some(c => o.sx === c[0] && o.sy === c[1]));
      return b ? (b.sx === cells[0][0] && b.sy === cells[0][1] ? 0 : 1) : -1;
    }
    /* The clock is held still for each of these.  It used to set walkT a
       fixed distance behind the real Date.now and then render: how far
       through the walk cycle the renderer thought it was depended on how
       long the render took to start, so a busy machine could push the
       95ms sample past the end of the cycle and the second frame would
       never be drawn.  Freezing the clock asks the question exactly. */
    /* The engine runs in its own context, so it is ctx.Date the renderer
       reads - freezing this file's Date would leave it on the real clock
       and prove nothing. */
    const RealDate = ctx.Date;
    const T0 = RealDate.now();
    const at = (age, walkT) => {
      P.walkT = walkT;
      ctx.Date = { now: () => T0 + age };
      try { return heroFrame(); } finally { ctx.Date = RealDate; }
    };
    /* idle: no step behind you, at any moment of the cycle */
    const idle = new Set();
    for (const age of [0, 45, 90, 135, 179, 400, 5000]) idle.add(at(age, 0));
    /* and a step so long ago the cycle is well over */
    for (const age of [5000, 9000]) idle.add(at(age, T0));
    /* walking: both frames must show inside the cycle */
    const walking = new Set();
    for (const age of [0, 95, 190]) walking.add(at(age, T0));
    console.log('player animation      :', 'idle frames ' + [...idle].join('/') +
      ', walking frames ' + [...walking].sort().join('/'));
    if (idle.size !== 1) problems.push('the player animates while standing still');
    if (walking.size < 2) problems.push('the player does not animate while walking');
    P.walkT = 0;
  }

  // SPACE must pass exactly one turn, standing still
  {
    const P = ctx.P;
    ctx.G.mode = 'play'; ctx.G.dead = 0; ctx.G.menu = null;
    ctx.G.invOpen = 0; ctx.G.aim = null;
    /* The random-key stage above can leave you halfway down a trap door.
       This is a test of what SPACE does, not of what falling does. */
    ctx.G.pendingFall = 0;
    ctx.L.traps.length = 0;
    P.hp = P.mhp; P.frozen = 0; P.iced = 0; P.held = 0; P.heldBy = null;
    const t0 = ctx.G.turn, x0 = P.x, y0 = P.y;
    key(' ');
    console.log('SPACE waits          :', 'turn ' + t0 + ' -> ' + ctx.G.turn +
      ', position ' + (P.x === x0 && P.y === y0 ? 'unchanged' : 'MOVED'));
    if (ctx.G.turn !== t0 + 1) problems.push('SPACE did not pass exactly one turn');
    if (P.x !== x0 || P.y !== y0) problems.push('SPACE moved the player');
  }

  /* ---- rounded corners survive the dark ------------------------------
     A corner patch replaces two pixels of the tile beneath it.  Drawn at
     part opacity it would blend with them instead, which is why
     remembered walls used to keep their square corners.  Walk about
     until plenty of the map is remembered but out of sight, then insist
     that every patch is laid down solid. */
  {
    const P = ctx.P;
    ctx.G.mode = 'play'; ctx.G.menu = null;
    ctx.G.invOpen = 0; ctx.G.aim = null; ctx.G.dead = 0;
    P.hp = P.mhp;
    for (let i = 0; i < 400; i++) {
      key(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'][i & 3]);
      P.hp = P.mhp;                      /* stay alive long enough to look */
    }
    const L = ctx.L;
    let seen = 0, lit = 0;
    for (let i = 0; i < L.flags.length; i++) {
      if (L.flags[i] & ctx.F_SEEN) seen++;
      if (L.flags[i] & ctx.F_VIS) lit++;
    }
    /* one viewport holds few enough corners that a single frame could
       show none at all; walk on and keep counting */
    let patches = 0, faded = 0, blended = 0;
    for (let step = 0; step < 60; step++) {
      frame('dimcorners');
      for (const b of blits) {
        if (b.tag !== 'screen') continue;
        if (!(b.sw === 2 && b.sh === 2 && b.dw === 2 && b.dh === 2)) continue;
        patches++;
        if (b.from === 'dim') faded++;
        else if (b.from === 'atlas' && b.at < 1) blended++;
      }
      key(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'][step & 3]);
      P.hp = P.mhp;
    }
    console.log('dim corners          : ' + patches + ' patches over 60 frames, ' +
      faded + ' from the faded sheet, ' + blended + ' blended ' +
      '(' + (seen - lit) + ' squares remembered but unlit)');
    if (seen - lit < 20) problems.push('not enough of the map is remembered to test dim corners');
    if (blended) problems.push(blended + ' corner patches are blended, not solid');
    if (!faded) problems.push('no corner patch used the faded sheet - dim corners are not rounded');
  }

  /* ---- ESC opens the pause menu, ? looks around ----------------------- */
  {
    const P = ctx.P, G = ctx.G, L = ctx.L;
    G.mode = 'play'; G.menu = null; G.invOpen = 0; G.aim = null; G.dead = 0;
    G.pause = null; G.look = null; G.choice = null;
    ctx.setPouch(null); G.box = null;
    P.hp = P.mhp; P.blind = 0; P.hallu = 0;
    L.mons.length = 0; L.items.length = 0;
    for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;

    key('Escape');
    if (G.mode !== 'pause') problems.push('ESC did not open the menu');
    else {
      frame('pause');
      const drawn = blits.filter(b => b.tag === 'screen').length;
      if (drawn < 30) problems.push('the pause menu was not drawn');
      const i0 = G.pause.i;
      key('ArrowDown');
      if (G.pause.i === i0) problems.push('the pause cursor does not move');
      key('Escape');
      if (G.mode !== 'play') problems.push('ESC did not back out of the menu');
      const names = ctx.PAUSE_OPTS.map(o => o[0]);
      key('Escape');
      G.pause.i = names.indexOf('help');
      key('Enter');
      if (G.mode !== 'help') problems.push('HELP did not open the help screen');
      key(' ');
      console.log('pause menu           :', drawn, 'marks, cursor walks, ' +
        ctx.PAUSE_OPTS.map(o => o[1]).join('/'));
    }


    /* ? no longer opens help - it opens the cursor */
    G.mode = 'play'; G.pause = null;
    key('?');
    if (G.mode !== 'look') problems.push('? did not open the look cursor');
    else {
      if (G.look.x !== P.x || G.look.y !== P.y)
        problems.push('the cursor did not start on you');
      frame('look');
      const marks = blits.filter(b => b.tag === 'screen').length;
      /* it walks */
      const x0 = G.look.x;
      key('ArrowRight');
      if (G.look.x === x0) problems.push('the look cursor does not move');
      /* and reads */
      key('Enter');
      if (!G.look.lines || !G.look.lines.length)
        problems.push('ENTER read nothing off the square');
      else {
        frame('lookbox');
        for (const b of blits)
          if (b.tag === 'screen' && (b.dx < 0 || b.dy < 0 ||
              b.dx + b.dw > ctx.SW || b.dy + b.dh > ctx.SH))
            problems.push('the look box draws outside the screen');
        for (const s of G.look.lines)
          if (s.length > 34) problems.push('a look line is ' + s.length + ' wide: ' + s);
      }
      key('Enter');
      if (G.look.lines) problems.push('a second ENTER did not close the box');
      key('Escape');
      if (G.mode !== 'play') problems.push('ESC did not leave the look cursor');
      console.log('looking about        :', marks, 'marks, cursor walks, reads, and closes');
    }
    G.look = null; G.pause = null; G.mode = 'play';
  }

  /* ---- ENTER, when it could mean two things --------------------------- */
  {
    const P = ctx.P, G = ctx.G, L = ctx.L;
    G.mode = 'play'; G.menu = null; G.invOpen = 0; G.aim = null;
    G.dead = 0; P.hp = P.mhp; P.blind = 0; P.hallu = 0;
    ctx.setPouch(null); G.box = null; G.choice = null;
    L.items.length = 0; L.mons.length = 0;
    for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;

    const ch = ctx.mkItem('chest', 0);
    ch.seen = 1; ch.x = P.x; ch.y = P.y;
    L.items.push(ch);

    /* nothing to shoot at: ENTER just opens it */
    P.eq.lh = null;
    key('Enter');
    if (G.mode !== 'inv' || G.pouch !== ch)
      problems.push('ENTER on a chest with no target did not open it');
    key('Escape'); key('Escape');
    ctx.setPouch(null); G.box = null; G.invOpen = 0; G.mode = 'play';

    /* a loaded bow and something in view: it has to ask */
    let bow = -1, arrows = -1;
    for (let i = 0; i < ctx.WEAPONS.length; i++) {
      if (ctx.WEAPONS[i].n === 'short bow') bow = i;
      if (ctx.WEAPONS[i].ammoFor === 'short bow') arrows = i;
    }
    P.eq.lh = ctx.mkItem('weapon', bow);
    const am = ctx.mkItem('weapon', arrows); am.cnt = 20; ctx.addItem(am);
    /* somewhere with a clear line to it - where the player happens to be
       standing after the random-key stage is not guaranteed to have one */
    let spot = null;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      for (let n = 2; n <= 6 && !spot; n++) {
        const x = P.x + dx * n, y = P.y + dy * n;
        if (!ctx.walkable(x, y) || ctx.monAt(L, x, y)) continue;
        if (!ctx.shotClear(P.x, P.y, x, y)) continue;
        spot = [x, y];
      }
      if (spot) break;
    }
    if (!spot) console.log('ENTER when it is two things: nowhere to stand a target, skipped');
    else {
    const foe = ctx.mkMonster('Z', 3, spot[0], spot[1]);
    foe.state = 2; foe.disguise = 0; foe.invis = 0;
    L.mons.push(foe);
    vm.runInContext('computeVis();', ctx);
    if (!ctx.shootableNow()) problems.push('the bow and target were not set up right');
    else {
      key('Enter');
      if (G.mode !== 'choose') problems.push('ENTER did not ask which thing you meant');
      else {
        frame('choose');
        const drawn = blits.filter(b => b.tag === 'screen').length;
        if (drawn < 40) problems.push('the question was not drawn');
        /* the map is still visible behind it */
        key('Escape');
        if (G.mode !== 'play') problems.push('ESC did not back out of the question');
        key('Enter');
        /* first option is shoot */
        if (G.mode !== 'choose') problems.push('the question did not come back');
        G.choice.i = 1;                    /* open chest */
        key('Enter');
        if (G.pouch !== ch) problems.push('choosing the chest did not open it');
        console.log('ENTER when it is two things:', drawn, 'marks, ESC backs out, both answers work');
      }
    }
    }
    key('Escape'); key('Escape');
    ctx.setPouch(null); G.box = null; G.choice = null; G.invOpen = 0; G.mode = 'play';
    L.items.length = 0; L.mons.length = 0; P.eq.lh = null;
  }

  /* ---- ENTER on a staircase with a bow in hand ------------------------ */
  {
    const P = ctx.P, L = ctx.L, G = ctx.G;
    G.mode = 'play'; G.menu = null; G.invOpen = 0; G.aim = null; G.dead = 0;
    G.choice = null; ctx.setPouch(null); G.box = null;
    P.hp = P.mhp; P.blind = 0; P.hallu = 0;
    L.items.length = 0; L.mons.length = 0;
    for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;

    /* somewhere with a clear line, for a target */
    let spot = null;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      for (let n = 2; n <= 6 && !spot; n++) {
        const x = P.x + dx * n, y = P.y + dy * n;
        if (!ctx.walkable(x, y) || ctx.monAt(L, x, y)) continue;
        if (!ctx.shotClear(P.x, P.y, x, y)) continue;
        spot = [x, y];
      }
      if (spot) break;
    }
    if (!spot) console.log('stairs and a bow    : nowhere to stand a target, skipped');
    else {
      let bow = -1, arrows = -1;
      for (let i = 0; i < ctx.WEAPONS.length; i++) {
        if (ctx.WEAPONS[i].n === 'short bow') bow = i;
        if (ctx.WEAPONS[i].n === 'arrow') arrows = i;
      }
      P.eq.lh = ctx.mkItem('weapon', bow);
      const am = ctx.mkItem('weapon', arrows); am.cnt = 20; ctx.addItem(am);
      const foe = ctx.mkMonster('Z', 3, spot[0], spot[1]);
      foe.state = 2; foe.disguise = 0; foe.invis = 0;
      L.mons.push(foe);
      vm.runInContext('computeVis();', ctx);

      const at = P.y * ctx.MAP_W + P.x, was = L.tiles[at];
      /* If there is nothing actually shootable the menu is not supposed
         to open, and pressing ENTER would take the stairs and carry the
         rest of the suite off to another floor.  Check before pressing. */
      if (!ctx.shootableNow()) {
        console.log('stairs and a bow    : nothing shootable from here, skipped');
        P.eq.lh = null; L.mons.length = 0;
      } else {
      L.tiles[at] = ctx.STAIR;
      key('Enter');
      if (G.mode !== 'choose') problems.push('stairs and a loaded bow did not ask');
      else {
        const labels = ctx.choiceOpts().map(o => o[1]);
        if (labels.indexOf('Shoot') < 0) problems.push('no Shoot on the stairs menu');
        if (labels.indexOf('Climb down') < 0)
          problems.push('the stairs menu reads ' + labels.join(' / '));
        frame('stairchoice');
        /* taking Shoot must not move you down a floor */
        const d0 = ctx.G.depth;
        G.choice.i = 0;
        key('Enter');
        if (ctx.G.depth !== d0) problems.push('choosing Shoot took the stairs anyway');
        console.log('stairs and a bow    : asks', labels.join(' / '),
          '- and Shoot does not descend');
      }
      L.tiles[at] = was;
      G.mode = 'play'; G.choice = null; G.targets = [];
      P.eq.lh = null; L.mons.length = 0;
      }
    }
  }

  /* ---- the equip row, reached from inside an open chest --------------- */
  {
    const P = ctx.P, G = ctx.G, L = ctx.L;
    G.mode = 'play'; G.menu = null; G.invOpen = 0; G.aim = null;
    G.dead = 0; P.hp = P.mhp; P.perks = {};
    ctx.setPouch(null); G.box = null; G.sel = null;
    L.items.length = 0;
    /* a chest under your feet, already looked in, with one thing in it */
    const ch = ctx.mkItem('chest', 0);
    ch.seen = 1; ch.x = P.x; ch.y = P.y;
    ch.items[0] = ctx.mkItem('potion', 0);
    L.items.push(ch);
    /* something worn, so the equip row has something to act on */
    P.eq.head = ctx.mkItem('head', 0); P.eq.head.known = 1; P.eq.head.cursed = 0;

    key('Enter');                             /* ENTER opens it now */
    if (G.mode !== 'inv' || !G.pouch || G.pouch !== ch)
      problems.push('ENTER did not open the chest under your feet');
    else {
      /* climb up out of the chest onto the equip row */
      let guard = 0;
      while (G.pcur.r > -1 && guard++ < 8) key('ArrowUp');
      const ref = ctx.cursorRef();
      if (!ref || ref.kind !== 'eq')
        problems.push('you cannot reach the equip row from inside a chest');
      else {
        /* walk it to the head slot and see what it offers */
        guard = 0;
        while (ctx.cursorRef().key !== 'head' && guard++ < 8) key('ArrowRight');
        const acts = ctx.itemActions(P.eq.head, ctx.cursorRef()).map(a => a[1]);
        for (const want of ['Take off', 'Put in chest', 'Drop'])
          if (acts.indexOf(want) < 0)
            problems.push('the equip row inside a chest does not offer: ' + want);
        /* and it really works: put the hat in the chest */
        const before = ctx.contCount(ch);
        key(' ');
        if (!G.menu) problems.push('no menu on the equip row inside a chest');
        else {
          let g2 = 0;
          while (G.menu.opts[G.menu.i][0] !== 'putin' && g2++ < 10) key('ArrowDown');
          key(' ');
          if (P.eq.head) problems.push('the hat is still on your head');
          if (ctx.contCount(ch) !== before + 1)
            problems.push('the hat did not go into the chest');
        }
        console.log('chest + equip row    :', acts.length, 'actions on a worn thing,',
          'and it goes straight in');
      }
    }
    ctx.setPouch(null); G.box = null; G.invOpen = 0; G.mode = 'play';
    L.items.length = 0; P.eq.head = null;
  }

  /* ---- coming of age: the choice screen ------------------------------ */
  {
    const P = ctx.P, G = ctx.G;
    G.mode = 'play'; G.menu = null; G.pouch = null;
    G.invOpen = 0; G.aim = null; G.dead = 0;
    P.hp = P.mhp; P.perks = {};
    P.lv = 1; P.exp = ctx.E_LEVELS[0];
    G.perkPick = null;
    ctx.checkLevelUp();
    if (!G.perkPick) problems.push('levelling to 2 did not offer a choice');
    else {
      /* it waits for the fighting to stop and for the blow to be told */
      ctx.L.mons.length = 0;
      if (ctx.perkReady()) problems.push('the choice opened before the dust settled');
      G.perkPick.at = 0;
      if (!ctx.perkReady()) problems.push('the choice never became ready');
      vm.runInContext('resumeMode();', ctx);
      if (G.mode !== 'perk') problems.push('the choice did not open its screen');
      const rows = ctx.perkRows();
      if (rows.length !== ctx.PERK_OFFER + 1)
        problems.push('the screen offers ' + rows.length + ' choices');

      const bandY = () => {
        frame('perk');
        const band = fills.find(f => f.w === ctx.SW - 8 && f.h === 17);
        return band ? band.y : null;
      };
      const y0 = bandY();
      if (y0 === null) problems.push('nothing marks which choice you are on');
      /* every glyph and sprite has to land inside the screen */
      for (const b of blits)
        if (b.tag === 'screen' && (b.dx < 0 || b.dy < 0 ||
            b.dx + b.dw > ctx.SW || b.dy + b.dh > ctx.SH))
          problems.push('the choice screen draws outside the frame');
      const drawn = blits.filter(b => b.tag === 'screen').length;
      if (drawn < 40) problems.push('the choice screen is nearly empty: ' + drawn + ' marks');

      key('ArrowDown');
      const y1 = bandY();
      if (y0 !== null && y1 === y0) problems.push('the cursor does not move');
      key('Escape');
      if (!G.perkPick) problems.push('you could duck out of the choice');
      key('Tab');
      if (!G.perkPick) problems.push('TAB escaped the choice');

      /* the last row is always the health, and taking it closes up */
      G.perkPick.i = rows.length - 1;
      const before = P.mhp;
      key('Enter');
      if (G.perkPick) problems.push('choosing did not close the screen');
      if (P.mhp !== before + ctx.PERK_HP)
        problems.push('choosing health gave ' + (P.mhp - before) + ', not ' + ctx.PERK_HP);
      if (G.mode === 'perk') problems.push('the screen stayed open');
      console.log('coming of age        :', drawn, 'marks,', rows.length,
        'choices, cursor walks, no way out but choosing');
    }
    P.perks = {}; P.lv = 1;
  }

  /* ---- unseen: you fade, you do not disappear ------------------------ */
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.mode = 'play'; ctx.G.menu = null; ctx.G.pouch = null;
    ctx.G.invOpen = 0; ctx.G.aim = null; ctx.G.dead = 0;
    P.hp = P.mhp; P.blind = 0; P.hallu = 0; P.iced = 0;
    L.mons.length = 0; L.corpses.length = 0;
    /* The random walk before this leaves the player wherever it likes,
       and the walking frame alternates between two sprites - so pin
       both down rather than measuring whatever happened to be drawn. */
    ctx.G.pan = null; ctx.G.look = null; ctx.G.pause = null;
    P.anim = null; P.animT = 0;
    if (!vm.runInContext('walkable(P.x,P.y)', ctx)) {
      outer2:
      for (let y = 1; y < ctx.MAP_H - 1; y++)
        for (let x = 1; x < ctx.MAP_W - 1; x++)
          if (vm.runInContext('walkable(' + x + ',' + y + ')', ctx)) { P.x = x; P.y = y; break outer2; }
    }
    /* either frame of the hero counts: it is the alpha under test */
    const cells = ['hero', 'hero2'].map(n => ATLAS.index[n])
      .map(i => [(i % ATLAS.cols) * 8, ((i / ATLAS.cols) | 0) * 8]);
    const heroAlpha = () => {
      frame('unseen');
      const b = blits.find(o => o.tag === 'screen' && o.from === 'atlas' &&
        cells.some(c => c[0] === o.sx && c[1] === o.sy));
      return b ? (b.at === undefined ? 1 : b.at) : null;
    };
    P.unseen = 0; const plain = heroAlpha();
    P.unseen = 10; const faded = heroAlpha();
    P.unseen = 0;
    console.log('unseen               : drawn at', plain, 'in plain sight,', faded, 'while hidden');
    if (plain === null || faded === null) problems.push('the hero was not drawn at all');
    else if (!(faded < plain)) problems.push('being unseen does not show on the hero');
  }

  /* ---- a pillar standing in water, and a bridge over a stream --------
     A pillar in a pool has its corners taken off.  The bite has to be
     filled with the water lying there: filling it with dry floor left a
     grey collar round every pillar in the water.  And a bridge has to
     show what it spans, or it reads as a plank floating in the room. */
  {
    const P = ctx.P, L = ctx.L;
    ctx.G.mode = 'play'; ctx.G.menu = null; ctx.G.pouch = null;
    ctx.G.invOpen = 0; ctx.G.aim = null; ctx.G.dead = 0;
    P.hp = P.mhp; P.blind = 0; P.hallu = 0;
    const W = ctx.MAP_W;
    /* lay a pond right in front of the player, with a pillar in the
       middle of it and a bridge over one side */
    const cxp = P.x, cyp = P.y;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const j = (cyp + dy) * W + (cxp + dx);
      L.tiles[j] = ctx.WATER;
      L.decor[j] = 0;
    }
    L.tiles[cyp * W + cxp] = ctx.FLOOR;                 /* stand on dry land */
    const pil = cyp * W + (cxp + 2);
    L.tiles[pil] = ctx.WALL;                            /* the pillar */
    const brg = (cyp - 2) * W + cxp;
    L.tiles[brg] = ctx.BRIDGE; L.under[brg] = ctx.WATER;
    for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;
    L.mons.length = 0; L.items.length = 0;

    const cellOf = (name) => {
      const i = ATLAS.index[name];
      return [(i % ATLAS.cols) * 8, ((i / ATLAS.cols) | 0) * 8];
    };
    const waterCells = ['water', 'water2'].map(cellOf);
    const floorCells = ['floor', 'floor2'].map(cellOf);
    const sameCell = (b, c) => b.sx >= c[0] && b.sx < c[0] + 8 &&
                               b.sy >= c[1] && b.sy < c[1] + 8;

    frame('wetcorners');
    const px = ctx.VIEW_PX + (cxp + 2 - (P.x - (ctx.VIEW_W >> 1))) * 8;
    const py = ctx.VIEW_PY + (cyp - (P.y - (ctx.VIEW_H >> 1))) * 8;
    let wet = 0, dry = 0;
    for (const b of blits) {
      if (b.tag !== 'screen') continue;
      if (!(b.sw === 2 && b.sh === 2)) continue;              /* corner patch */
      if (b.dx < px || b.dx >= px + 8 || b.dy < py || b.dy >= py + 8) continue;
      if (waterCells.some(c => sameCell(b, c))) wet++;
      else if (floorCells.some(c => sameCell(b, c))) dry++;
    }
    console.log('pillar in water      :', wet, 'corners filled with water,', dry, 'with dry floor');
    if (!wet) problems.push('a pillar in water has no corner filled with water');
    if (dry) problems.push(dry + ' corners of a pillar in water were filled with dry floor');

    /* the bridge: the water underneath it and the planks over it */
    const bh = cellOf('bridge_h'), bv = cellOf('bridge_v');
    const bpx = ctx.VIEW_PX + (cxp - (P.x - (ctx.VIEW_W >> 1))) * 8;
    const bpy = ctx.VIEW_PY + (cyp - 2 - (P.y - (ctx.VIEW_H >> 1))) * 8;
    let planks = 0, under = 0;
    for (const b of blits) {
      if (b.tag !== 'screen' || b.dx !== bpx || b.dy !== bpy) continue;
      if (b.sw !== 8 || b.sh !== 8) continue;
      if (sameCell(b, bh) || sameCell(b, bv)) planks++;
      else if (waterCells.some(c => sameCell(b, c))) under++;
    }
    console.log('bridge               :', under, 'blit of what it spans,', planks, 'of planks');
    if (!planks) problems.push('a bridge was not drawn');
    if (!under) problems.push('a bridge does not show the water under it');
  }

  /* ---- TAB gets you out of aiming a wand ------------------------------ */
  {
    const P = ctx.P, G = ctx.G;
    G.mode = 'play'; G.menu = null; G.aim = null; G.dead = 0; G.choice = null;
    ctx.setPouch(null); G.box = null; G.invOpen = 0;
    P.hp = P.mhp;
    const w = ctx.mkItem('wand', 0); w.ch = 5;
    G.aim = w; G.mode = 'dir';
    key('Tab');
    if (G.mode !== 'inv') problems.push('TAB while aiming did not open the pack');
    if (G.aim) problems.push('TAB while aiming left the wand still aimed');
    key('Escape');
    /* and ESC still simply stops */
    G.aim = w; G.mode = 'dir';
    key('Escape');
    if (G.mode !== 'play' || G.aim) problems.push('ESC no longer cancels a zap');
    console.log('aiming a wand        : TAB opens the pack and drops the aim, ESC just stops');
    G.aim = null; G.mode = 'play'; G.invOpen = 0;
  }

  /* ---- the pack: buttons under the grid, name where it belongs -------- */
  {
    const P = ctx.P, G = ctx.G, L = ctx.L;
    G.mode = 'play'; G.menu = null; G.aim = null; G.dead = 0; G.choice = null;
    ctx.setPouch(null); G.box = null; G.sel = null; G.invOpen = 0;
    P.hp = P.mhp;
    L.items.length = 0;
    /* no pouch anywhere: one button, and it says EXIT */
    P.slots = new Array(ctx.N_SLOTS).fill(null);
    P.eq = { rh: null, body: null, lh: null, head: null, feet: null };
    P.slots[0] = ctx.mkItem('potion', 0);
    key('Tab');
    if (G.mode !== 'inv') problems.push('TAB did not open the pack');
    let b1 = ctx.invButtons();
    if (b1.length !== 1 || b1[0][1] !== 'EXIT')
      problems.push('with no pouch the buttons are ' + b1.map(x => x[1]).join('/'));
    /* with one, two buttons */
    P.slots[1] = ctx.mkItem('pouch', 0);
    let b2 = ctx.invButtons();
    if (b2.length !== 2) problems.push('with a pouch there are ' + b2.length + ' buttons');
    else if (b2[0][1] !== 'POUCH' || b2[1][1] !== 'EXIT')
      problems.push('the buttons read ' + b2.map(x => x[1]).join('/'));

    /* everything drawn stays on the screen */
    frame('inv-buttons');
    for (const bl of blits)
      if (bl.tag === 'screen' && (bl.dx < 0 || bl.dy < 0 ||
          bl.dx + bl.dw > ctx.SW || bl.dy + bl.dh > ctx.SH))
        problems.push('the pack draws outside the screen');
    for (const f of fills)
      if (f.tag === 'screen' && (f.y < 0 || f.y + f.h > ctx.SH))
        problems.push('a pack panel runs off the bottom: y=' + f.y + ' h=' + f.h);
    /* the buttons really are wider and shorter than a square */
    const btn = fills.filter(f => f.tag === 'screen' && f.h === ctx.BTN_H &&
                                  f.y === ctx.BTN_Y);
    if (!btn.length) problems.push('the buttons were not drawn');
    else {
      if (btn[0].w <= ctx.SL) problems.push('a button is no wider than a square');
      if (ctx.BTN_H >= ctx.SL) problems.push('a button is no shorter than a square');
    }
    /* The name is underlined, and sits below the two key hints.  The
       rule goes down before the name, so a descender can cross it: drawn
       afterwards it clipped the tail off every g and p. */
    const rule = fills.find(f => f.tag === 'screen' && f.h === 1 &&
                                 f.y > 26 && f.y < 46 && f.w > 40);
    if (!rule) problems.push('the item name is not underlined');
    else {
      /* Put a name with a descender in it under the cursor on purpose.
         Left to whatever the soak was hovering over, the check passed
         whether the rule went down first or last, because most names
         have no letter that reaches the line. */
      P.slots[0] = ctx.mkItem('weapon', ctx.weaponIndex('spear'));
      P.slots[0].known = 1;
      G.cur.r = 1; G.cur.c = 0;
      frame('name with a descender');
      /* The underline, picked by its exact geometry rather than by
         "the first thin fill in a band" - the panel has separators of
         its own, drawn earlier, and one of those was being measured
         instead. */
      const NX = ctx.GX + 5 * ctx.PITCH + 3, NW = ctx.SW - NX - 2;
      const rule2 = fills.find(f => f.tag === 'screen' && f.h === 1 &&
                                    f.x === NX && f.w === NW && f.y < 46);
      const name = blits.filter(b => b.tag === 'screen' && b.from === 'font' &&
        b.dx >= ctx.GX + 5 * ctx.PITCH && rule2 &&
        b.dy <= rule2.y && b.dy + b.dh > rule2.y);
      if (!rule2 || !name.length)
        problems.push('could not get a name with a descender under the cursor');
      else for (const g of name)
        if (g.seq < rule2.seq)
          problems.push('the rule was drawn over the name, clipping its descenders');
    }

    /* walk down onto the buttons and press EXIT */
    G.cur.r = 1; G.cur.c = 0;
    for (let i = 0; i < 6; i++) key('ArrowDown');
    const ref = ctx.cursorRef();
    if (!ref || ref.kind !== 'button')
      problems.push('you cannot walk the cursor down onto the buttons');
    else {
      /* the first is POUCH here, so step right to EXIT */
      key('ArrowRight');
      key('Enter');
      if (G.mode === 'inv') problems.push('EXIT did not close the pack');
    }
    console.log('pack buttons         :', b2.map(x => x[1]).join(' + '),
      '- one when you have no pouch, name underlined');

    /* --- and a third one when there is a chest at your feet ---------- */
    {
      G.mode = 'play'; ctx.setPouch(null); G.invOpen = 0; G.box = null;
      P.slots[1] = ctx.mkItem('pouch', 0);
      /* a chest, on the square the player is standing on */
      const chest = ctx.mkItem('chest', 0);
      chest.x = P.x; chest.y = P.y; chest.seen = 1;
      chest.items[0] = ctx.mkItem('potion', 0);
      L.items.push(chest);
      G.box = chest;
      key('Tab');
      if (G.mode !== 'inv') problems.push('TAB did not open the pack over a chest');

      const b3 = ctx.invButtons();
      if (b3.length !== 3)
        problems.push('with a chest underfoot there are ' + b3.length + ' buttons: ' +
          b3.map(x => x[1]).join('/'));
      else if (b3.map(x => x[1]).join('/') !== 'POUCH/CHEST/EXIT')
        problems.push('the buttons read ' + b3.map(x => x[1]).join('/'));

      /* three buttons, drawn side by side and none on top of another */
      frame('inv-buttons-chest');
      /* the bodies, not the one-pixel edges of the frame round each */
      const row = fills.filter(f => f.tag === 'screen' && f.h === ctx.BTN_H &&
                                    f.y === ctx.BTN_Y && f.w > 2);
      if (row.length < 3) problems.push('only ' + row.length + ' buttons were drawn');
      else {
        row.sort((a, b) => a.x - b.x);
        for (let i = 1; i < row.length; i++)
          if (row[i].x < row[i - 1].x + row[i - 1].w)
            problems.push('button ' + i + ' overlaps the one before it');
        const last = row[row.length - 1];
        if (last.x + last.w > ctx.SW) problems.push('the last button runs off the screen');
        /* and each label sits squarely in the middle of its button */
        const label = blits.filter(b => b.tag === 'screen' && b.from === 'font' &&
          b.dy >= ctx.BTN_Y && b.dy + b.dh <= ctx.BTN_Y + ctx.BTN_H);
        if (!label.length) problems.push('the buttons have no labels on them');
        for (const g of label) {
          const above = g.dy - ctx.BTN_Y;
          const below = ctx.BTN_Y + ctx.BTN_H - (g.dy + g.dh);
          if (above !== below)
            problems.push('a button label sits ' + above + ' from the top and ' +
              below + ' from the bottom');
        }
        /* the row reaches the bottom of the screen and no further */
        if (ctx.BTN_Y + ctx.BTN_H !== ctx.SH)
          problems.push('the buttons end at ' + (ctx.BTN_Y + ctx.BTN_H) + ', not ' + ctx.SH);
        /* and the labels above the equip row have not moved with it */
        if (ctx.LABEL_Y !== 12) problems.push('the RH BD LH HD FT labels moved to ' + ctx.LABEL_Y);
        if (ctx.GY_EQ - (ctx.LABEL_Y + 7) < 0)
          problems.push('the equip squares now overlap their own labels');
      }

      /* walk down onto the row and press the middle one: into the chest */
      G.cur.r = 1; G.cur.c = 0;
      for (let i = 0; i < 6; i++) key('ArrowDown');
      key('ArrowRight');
      let r2 = ctx.cursorRef();
      if (!r2 || r2.kind !== 'button' || r2.what !== 'box')
        problems.push('the middle button is not the chest button');
      key('Enter');
      if (!ctx.inBox()) problems.push('the CHEST button did not open the chest');

      /* it now reads PACK, and the cursor is still on it */
      const b4 = ctx.invButtons();
      if (b4[1][1] !== 'PACK')
        problems.push('inside the chest the button reads ' + b4[1][1] + ', not PACK');
      let r3 = ctx.cursorRef();
      if (!r3 || r3.kind !== 'button' || r3.what !== 'box')
        problems.push('the cursor did not stay on the button after switching');
      frame('inv-chest-buttons');

      /* and back again */
      key('Enter');
      if (ctx.inBox()) problems.push('the PACK button did not take you back to the pack');

      /* from inside the chest you can walk down onto the buttons too */
      ctx.setPouch(chest); G.pcur.r = 0; G.pcur.c = 0;
      for (let i = 0; i < 4; i++) key('ArrowDown');
      let r4 = ctx.cursorRef();
      if (!r4 || r4.kind !== 'button')
        problems.push('you cannot reach the buttons from inside a chest');
      frame('inv-chest-row');

      console.log('chest buttons        :', b3.map(x => x[1]).join(' + '),
        '- the middle one swaps between the two sets of squares');

      /* leave nothing behind for the checks that follow */
      key('Escape'); key('Escape');
      G.mode = 'play'; ctx.setPouch(null); G.invOpen = 0; G.box = null;
      const at = L.items.indexOf(chest);
      if (at >= 0) L.items.splice(at, 1);
    }
    G.mode = 'play'; ctx.setPouch(null); G.invOpen = 0;
    P.slots = new Array(ctx.N_SLOTS).fill(null);
  }

/* ---- the hunger and experience readings are on the panel --------- */
{
  const G = ctx.G, P = ctx.P, L = ctx.L;
  G.mode = 'play'; G.pause = null; G.slots = null; G.hint = null;
  G.menu = null; G.invOpen = 0; G.aim = null; G.dead = 0; G.look = null;
  P.lv = 3; P.exp = 40; P.food = 900; G.hungerState = 0;
  const want = ctx.E_LEVELS[P.lv - 1];

  frame('panel with the readings');
  /* the text is drawn glyph by glyph, so look for the sprites that head
     each reading and check the block still fits above the flags line */
  const icons = blits.filter(b => b.tag === 'screen' && b.from === 'atlas');
  const foodIcon = ctx.ATLAS.index['food'], magicIcon = ctx.ATLAS.index['magic'];
  const cell = i => [(i % ctx.ATLAS.cols) * 8, ((i / ctx.ATLAS.cols) | 0) * 8];
  const [fx, fy] = cell(foodIcon), [mx, my] = cell(magicIcon);
  const inPanel = b => b.dx < ctx.PANEL_W;
  if (!icons.some(b => inPanel(b) && b.sx === fx && b.sy === fy))
    problems.push('no hunger reading on the panel');
  if (!icons.some(b => inPanel(b) && b.sx === mx && b.sy === my))
    problems.push('no experience reading on the panel');
  /* nothing of the stat block may run past the last line */
  for (const b of blits)
    if (b.tag === 'screen' && b.dx < ctx.PANEL_W && b.dy + b.dh > ctx.SH)
      problems.push('the stat block runs off the bottom of the panel');

  /* and the pack spells both out */
  key('Tab');
  frame('pack with the readings');
  const t2 = ctx.xpText(), pct = ctx.foodPct();
  if (t2 !== '40/' + want) problems.push('the pack reads experience as ' + t2);
  if (pct !== Math.round(900 * 100 / ctx.FOOD_MAX))
    problems.push('the pack reads hunger as ' + pct + '%');
  /* the four stats share one line, and nothing in the column runs past
     its right hand edge */
  const IXX = ctx.GX + 5 * ctx.PITCH + 3, IW = ctx.SW - IXX - 2;
  const rowsUsed = new Set();
  for (const b of blits)
    if (b.tag === 'screen' && b.from === 'font' && b.dx >= IXX) {
      rowsUsed.add(b.dy);
      if (b.dx + b.dw > IXX + IW)
        problems.push('the right hand column runs over at ' + b.dx + ',' + b.dy);
    }
  /* drained on every stat at once is the widest the line ever gets */
  P.str = 8; P.mstr = 18; P.dex = 12; P.mdex = 22; P.wis = 9; P.mwis = 24;
  frame('pack, every stat drained');
  for (const b of blits)
    if (b.tag === 'screen' && b.from === 'font' && b.dx >= IXX &&
        b.dx + b.dw > IXX + IW)
      problems.push('the stat line runs over when everything is drained');
  P.str = P.mstr; P.dex = P.mdex; P.wis = P.mwis;
  console.log('the readings         : exp ' + t2 + ', food ' + pct + '% ' + ctx.foodWord() +
    ' - both on the panel and in the pack, and the column never runs over');
  key('Tab');
  G.mode = 'play'; P.lv = 1; P.exp = 0;
}

/* ---- a dark room is drawn dark, even when you can see into it ----- */
{
  const G = ctx.G, P = ctx.P, L = ctx.L;
  G.mode = 'play'; G.pause = null; G.slots = null; G.hint = null;
  G.menu = null; G.invOpen = 0; G.aim = null; G.dead = 0; G.look = null;
  G.pan = null;
  L.mons.length = 0;
  P.perks = {}; P.seer = 0; P.blind = 0;
  /* a room, lit, with the player in the middle of it */
  const room = L.rooms.find(r => !r.gone && r.floors.length > 12);
  if (!room) problems.push('no room big enough to darken');
  else {
    P.x = room.cx; P.y = room.cy;
    room.dark = 0; room.lit = 1;
    vm.runInContext('buildLitMap(L); buildDarkMap(L, G.depth); computeVis();', ctx);
    frame('room lit');
    const brightTiles = blits.filter(b => b.tag === 'screen' && b.from === 'atlas' &&
                                          (b.at === undefined || b.at === 1)).length;

    /* put it out, and look with night eyes: everything still drawn, but
       every square of it shaded */
    room.dark = 1; room.lit = 0;
    P.perks = { nightstalker: 1 };
    vm.runInContext('buildLitMap(L); buildDarkMap(L, G.depth); computeVis();', ctx);
    frame('room dark, night eyes');
    /* Which square each mark landed on, so the count is about the dark
       room and not about the whole screen.  Counting every bright mark
       anywhere swept in the panel and the lit corridor outside. */
    const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
    let shaded = 0, brightInDark = 0;
    for (const b of blits) {
      if (b.tag !== 'screen' || b.from !== 'atlas') continue;
      const ox = b.dx - ctx.VIEW_PX, oy = b.dy - ctx.VIEW_PY;
      if (ox % ctx.TS || oy % ctx.TS) continue;
      const mx = camx + ox / ctx.TS, my = camy + oy / ctx.TS;
      if (mx < 0 || my < 0 || mx >= ctx.MAP_W || my >= ctx.MAP_H) continue;
      if (!L.darkMap[my * ctx.MAP_W + mx]) continue;
      const a = b.at === undefined ? 1 : b.at;
      if (Math.abs(a - ctx.NIGHT_SHADE) < 0.001) shaded++;
      else if (a === 1) brightInDark++;
    }
    if (!shaded) problems.push('nothing in the dark room was shaded');
    if (brightInDark) problems.push(brightInDark +
      ' marks on dark squares are drawn at full brightness');
    const seen = blits.filter(b => b.tag === 'screen' && b.from === 'atlas');

    /* And without the eyes you see almost nothing of it.  Counted on the
       dark squares themselves: the totals include the panel and whatever
       lit corridor is on screen, which the soak leaves in a different
       place every run, so comparing them proved nothing. */
    /* Squares of the dark room you are actually seeing, not ones you
       merely remember: a remembered square is drawn dim whether you can
       see it now or not, and counting those made the dark look free. */
    const onDark = () => {
      let n = 0;
      for (const b of blits) {
        if (b.tag !== 'screen' || b.from !== 'atlas') continue;
        const a = b.at === undefined ? 1 : b.at;
        if (Math.abs(a - ctx.NIGHT_SHADE) > 0.001) continue;
        const ox = b.dx - ctx.VIEW_PX, oy = b.dy - ctx.VIEW_PY;
        if (ox % ctx.TS || oy % ctx.TS) continue;
        const mx = camx + ox / ctx.TS, my = camy + oy / ctx.TS;
        if (mx < 0 || my < 0 || mx >= ctx.MAP_W || my >= ctx.MAP_H) continue;
        if (L.darkMap[my * ctx.MAP_W + mx]) n++;
      }
      return n;
    };
    const withEyes = onDark();
    P.perks = {};
    vm.runInContext('computeVis();', ctx);
    frame('room dark, no night eyes');
    const blindTiles = onDark();
    if (blindTiles >= withEyes)
      problems.push('the dark cost you nothing without night eyes: ' +
        blindTiles + ' squares of it seen against ' + withEyes);
    console.log('a dark room          :', brightTiles, 'bright marks lit,', shaded,
      'of its squares seen with night eyes,', blindTiles, 'without them');

    /* leave it as it was */
    room.dark = 0; room.lit = 1;
    vm.runInContext('buildLitMap(L); buildDarkMap(L, G.depth); computeVis();', ctx);
  }
}

/* ---- SHIFT slides the panel away and pans the map ----------------- */
{
  const G = ctx.G, P = ctx.P, L = ctx.L;
  G.mode = 'play'; G.pause = null; G.slots = null; G.hint = null;
  G.menu = null; G.invOpen = 0; G.aim = null; G.dead = 0; G.look = null;
  G.pan = null;
  for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;
  /* stand in the middle, so there is map on every side to uncover */
  P.x = ctx.MAP_W >> 1; P.y = ctx.MAP_H >> 1;

  /* before: the panel is home and its text is on screen */
  frame('panel home');
  const homeText = blits.filter(b => b.tag === 'screen' && b.from === 'font' &&
                                     b.dx < ctx.PANEL_W).length;
  if (!homeText) problems.push('the panel had no text on it to begin with');
  if (ctx.panShift() !== 0) problems.push('the panel starts part way out');

  /* hold SHIFT: it starts moving, and the slide is quick */
  shiftKey('Shift');
  if (!ctx.panning()) problems.push('SHIFT did not start the panel moving');
  /* fake the clock forward by winding the start time back */
  G.pan.t = Date.now() - Math.floor(ctx.PAN_SLIDE / 2);
  const half = ctx.panShift();
  if (half <= 0 || half >= ctx.PANEL_W)
    problems.push('half way through the slide the panel is at ' + half);
  frame('panel sliding');
  const midText = blits.filter(b => b.tag === 'screen' && b.from === 'font' &&
                                    b.dx < ctx.PANEL_W - half).length;
  if (midText) problems.push('panel text is drawn while the panel is moving');

  /* all the way out: the map covers the whole screen and the compass shows */
  G.pan.t = Date.now() - ctx.PAN_SLIDE - 1;
  if (ctx.panShift() !== ctx.PANEL_W)
    problems.push('the panel did not finish leaving');
  frame('panel out');
  const leftTiles = blits.filter(b => b.tag === 'screen' && b.from === 'atlas' &&
                                      b.dx < ctx.PANEL_W - 8).length;
  if (leftTiles < 20)
    problems.push('only ' + leftTiles + ' things drawn where the panel used to be');
  const compass = blits.filter(b => b.tag === 'screen' && b.dx === 1 && b.dy === 1).length;
  if (!compass) problems.push('no compass in the corner while panning');

  /* the arrows move the view, not the player */
  const px = P.x, py = P.y, turn = G.turn;
  shiftKey('ArrowLeft'); shiftKey('ArrowLeft'); shiftKey('ArrowUp');
  if (P.x !== px || P.y !== py) problems.push('panning moved the player');
  if (G.turn !== turn) problems.push('panning cost a turn');
  if (G.pan.dx !== -2 || G.pan.dy !== -1)
    problems.push('the view went to ' + G.pan.dx + ',' + G.pan.dy + ' instead of -2,-1');
  frame('panned');
  /* and it stops at the limit rather than running off for ever */
  for (let i = 0; i < ctx.PAN_MAX + 5; i++) shiftKey('ArrowRight');
  if (G.pan.dx !== ctx.PAN_MAX)
    problems.push('the view ran to ' + G.pan.dx + ', past the limit of ' + ctx.PAN_MAX);
  frame('panned to the limit');

  /* A shifted key that is not an arrow is not for the view.  ? is typed
     with SHIFT held on most keyboards, so it has to get through. */
  shiftKey('?');
  if (ctx.G.mode !== 'look')
    problems.push('SHIFT and ? did not open the look cursor, mode is ' + ctx.G.mode);
  if (ctx.panning()) problems.push('a shifted key that was not an arrow kept the panel out');
  key('Escape');
  ctx.G.mode = 'play';
  /* and the arrows go back to panning when SHIFT is held again */
  shiftKey('Shift');
  ctx.G.pan.t = Date.now() - ctx.PAN_SLIDE - 1;
  const dx0 = ctx.G.pan.dx;
  shiftKey('ArrowLeft');
  if (ctx.G.pan.dx === dx0) problems.push('the arrows stopped panning after a shifted key');

  /* let go and it comes back, and forgets where it had been pushed to */
  shiftUp();
  if (ctx.panning()) problems.push('letting go of SHIFT did not send the panel back');
  G.pan.t = Date.now() - ctx.PAN_SLIDE - 1;
  frame('panel back');
  const backText = blits.filter(b => b.tag === 'screen' && b.from === 'font' &&
                                     b.dx < ctx.PANEL_W).length;
  if (!backText) problems.push('the panel came back empty');
  if (G.pan) problems.push('the panel is still half thinking about it');

  /* a plain arrow, with no SHIFT, still moves you */
  const wasX = P.x, wasY = P.y;
  key('ArrowRight');
  if (P.x === wasX && P.y === wasY && ctx.walkable(P.x + 1, P.y))
    problems.push('an ordinary arrow stopped moving the player');

  console.log('panning              : slides', ctx.PANEL_W + 'px in', ctx.PAN_SLIDE + 'ms,',
    leftTiles, 'tiles behind it, arrows move the view up to', ctx.PAN_MAX, 'squares');
  G.pan = null; G.mode = 'play';
}

/* ---- a burning creature and a frozen one are drawn as such ------- */
{
  const G = ctx.G, P = ctx.P, L = ctx.L;
  G.mode = 'play'; G.pause = null; G.slots = null; G.hint = null;
  G.menu = null; G.invOpen = 0; G.aim = null; G.dead = 0; G.look = null;
  L.mons.length = 0;
  for (let i = 0; i < L.flags.length; i++) L.flags[i] |= 3;
  /* the panning check left the player standing in the middle of the
     map, which is as likely to be rock as anything else */
  if (!vm.runInContext('walkable(P.x,P.y)', ctx)) {
    outer:
    for (let y = 1; y < ctx.MAP_H - 1; y++)
      for (let x = 1; x < ctx.MAP_W - 1; x++)
        if (vm.runInContext('walkable(' + x + ',' + y + ')', ctx)) { P.x = x; P.y = y; break outer; }
  }
  let spot = null;
  for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = P.x + d[0], y = P.y + d[1];
    if (vm.runInContext('walkable(' + x + ',' + y + ')', ctx)) { spot = { x, y }; break; }
  }
  if (!spot) problems.push('nowhere beside the player to stand a creature');
  else {
    const m = ctx.mkMonster('E', 5, spot.x, spot.y);
    m.hp = 50; m.mhp = 50; m.state = 2; m.burn = 0; m.stuck = 0;
    L.mons.push(m);
    frame('mon plain');
    const plain = blits.filter(b => b.tag === 'screen' && b.from === 'atlas').length;
    m.burn = 3;
    frame('mon alight');
    const alight = blits.filter(b => b.tag === 'screen' && b.from === 'atlas').length;
    m.burn = 0; m.stuck = 2;
    frame('mon frozen');
    const frozen = blits.filter(b => b.tag === 'screen' && b.from === 'atlas').length;
    if (alight <= plain) problems.push('a burning creature is drawn no differently');
    if (frozen <= plain) problems.push('a frozen creature is drawn no differently');
    console.log('burning and frozen   :', plain, 'marks plain,', alight, 'alight,', frozen, 'frozen');
    m.stuck = 0;
    L.mons.length = 0;
  }
}

/* ---- SAVE, LOAD and HINTS ---------------------------------------- */
  {
    const names = ctx.PAUSE_OPTS.map(o => o[0]);
    ['save', 'load', 'hints'].forEach(n => {
      if (names.indexOf(n) < 0) problems.push(n.toUpperCase() + ' is not on the menu');
    });

    /* SAVE: the screen draws, the run goes into slot one, and the slot
       then describes itself rather than saying "empty" */
    ctx.G.mode = 'play'; ctx.G.pause = null; ctx.G.slots = null; ctx.G.hint = null;
    key('Escape'); ctx.G.pause.i = names.indexOf('save'); key('Enter');
    if (ctx.G.mode !== 'slots') problems.push('SAVE did not open the slot list');
    else {
      frame('save slots');
      const drawnS = blits.filter(b => b.tag === 'screen').length;
      if (drawnS < 30) problems.push('the save screen was not drawn');
      key('Enter');
      frame('save slots after saving');
      const lab = ctx.slotLabel(0);
      if (lab === 'empty') problems.push('saving left the slot empty');
      if (ctx.G.slots.msg !== 'Saved.') problems.push('saving said "' + ctx.G.slots.msg + '"');
      console.log('save screen          :', drawnS, 'marks, slot one now reads "' + lab + '"');
      key('Escape');
      if (ctx.G.mode !== 'pause') problems.push('ESC did not go back to the menu');
    }

    /* LOAD: picking the saved slot puts you back in the game */
    ctx.G.pause.i = names.indexOf('load'); key('Enter');
    if (ctx.G.mode !== 'slots') problems.push('LOAD did not open the slot list');
    else {
      frame('load slots');
      key('Enter');
      if (ctx.G.mode !== 'play') problems.push('loading did not resume the game, mode is ' + ctx.G.mode + ' msg=' + (ctx.G.slots && ctx.G.slots.msg) + ' slot=' + (ctx.G.slots && ctx.G.slots.i));
      console.log('load screen          : picking a full slot takes you back into the game');
    }

    /* an empty slot refuses politely and stays put */
    ctx.G.mode = 'play'; ctx.G.pause = null;
    key('Escape'); ctx.G.pause.i = names.indexOf('load'); key('Enter');
    ctx.G.slots.i = ctx.SAVE_SLOTS - 1;
    key('Enter');
    if (ctx.G.mode !== 'slots') problems.push('an empty slot left the slot list');
    if (!ctx.G.slots.msg) problems.push('an empty slot said nothing');
    /* BACK is the row after the slots */
    ctx.G.slots.i = ctx.SAVE_SLOTS; key('Enter');
    if (ctx.G.mode !== 'pause') problems.push('BACK did not return to the menu');

    /* HINTS: one at a time, a new one on SPACE, and every one fits */
    ctx.G.pause.i = names.indexOf('hints'); key('Enter');
    if (ctx.G.mode !== 'hint') problems.push('HINTS did not open');
    else {
      frame('hints');
      const drawnH = blits.filter(b => b.tag === 'screen').length;
      if (drawnH < 30) problems.push('the hint box was not drawn');
      let changed = 0;
      for (let i = 0; i < 12; i++) {
        const was = ctx.G.hint.i;
        key(' ');
        if (ctx.G.hint.i !== was) changed++;
        else problems.push('SPACE showed the same hint twice');
        frame('hint ' + i);
      }
      /* every hint has to fit the box it is drawn in */
      let worst = 0, tall = 0;
      for (let i = 0; i < ctx.HINTS.length; i++) {
        ctx.G.hint.i = i;
        const lines = vm.runInContext('hintLines()', ctx);
        tall = Math.max(tall, lines.length);
        lines.forEach(l => { worst = Math.max(worst, vm.runInContext('textW(' + JSON.stringify(l) + ')', ctx)); });
        frame('hint text ' + i);
      }
      const boxH = 14 + Math.max(tall, 3) * 9 + 12;
      if (boxH > ctx.SH) problems.push('a hint box is ' + boxH + ' tall, taller than the screen');
      if (worst > ctx.HINT_W - 10) problems.push('a hint line is ' + worst + ' wide, wider than the box');
      console.log('hints                :', ctx.HINTS.length, 'hints,', changed,
        'of 12 SPACE presses gave a new one, tallest', tall, 'lines, widest', worst + '/' + (ctx.HINT_W - 10) + 'px');
      key('Escape');
      if (ctx.G.mode !== 'pause') problems.push('ESC did not close the hint box');
    }
    ctx.G.mode = 'play'; ctx.G.pause = null; ctx.G.slots = null; ctx.G.hint = null;
  }

  // scaling maths
  vm.runInContext('fit();', ctx);
  const cvs = canvases.find(c => c._tag === 'screen');
  const dpr = ctx.window.devicePixelRatio;
  const SW = ctx.SW, SH = ctx.SH;
  const cssW = parseFloat(cvs.style.width), cssH = parseFloat(cvs.style.height);
  const devW = cssW * dpr, devH = cssH * dpr;
  if (devW % SW !== 0 || devH % SH !== 0)
    problems.push('scaling not whole device pixels: ' + devW + 'x' + devH);
  if (devW / SW !== devH / SH)
    problems.push('aspect distorted: ' + (devW / SW) + ' vs ' + (devH / SH));
  console.log('canvas backing store  :', cvs.width + 'x' + cvs.height);
  console.log('css size @dpr' + dpr + '      :', cssW + 'x' + cssH);
  console.log('device pixels         :', devW + 'x' + devH, '= x' + (devW / SW), 'integer scale');
  console.log('smoothing disabled    :', ctx.cx.imageSmoothingEnabled === false);
  console.log('blits per frame       :', JSON.stringify(counts));

  /* --- the stat line spells the stats out ---------------------------- */
  {
    const IXX = ctx.GX + 5 * ctx.PITCH + 3, IW = ctx.SW - IXX - 2;
    const gap = ctx.statGap();
    const width = ps => ps.reduce((w, p, i) => w + ctx.textW(p.s) + (i ? gap : 0), 0);
    const P = ctx.P;
    P.str = P.mstr = 16; P.dex = P.mdex = 11; P.wis = P.mwis = 10;

    let plain = ctx.statLineParts(IW);
    let bad = [];
    if (plain.map(p => p.s.slice(0, 3)).join(' ') !== 'str dex wis arm')
      bad.push('the labels read ' + plain.map(p => p.s).join(' '));
    if (width(plain) > IW) bad.push('the line is ' + width(plain) + ' wide in a ' + IW + ' column');

    /* every figure carrying its maximum, which is the widest it gets */
    P.mstr = 31; P.str = 8; P.mdex = 24; P.dex = 9; P.mwis = 24; P.wis = 9;
    const drained = ctx.statLineParts(IW);
    if (width(drained) > IW)
      bad.push('drained, the line is ' + width(drained) + ' wide in a ' + IW + ' column: ' +
        drained.map(p => p.s).join(' '));
    console.log('stat line            : "' + plain.map(p => p.s).join(' ') + '" ' +
      width(plain) + 'px, drained "' + drained.map(p => p.s).join(' ') + '" ' +
      width(drained) + 'px of ' + IW);
    P.str = P.mstr = 16; P.dex = P.mdex = 11; P.wis = P.mwis = 10;
    bad.forEach(b => problems.push(b));
  }

  /* --- everything the pack says fits the row it says it on ----------- */
  {
    /* The functions that talk while the pack is open.  Their message
       literals are read straight out of the source rather than listed
       here, so a new line added to any of them is measured the next time
       this runs.  Add a function to the list, not a string. */
    const TALKERS = ['invKey', 'pressInvButton', 'invSpace', 'menuKey',
                     'doMenuAction', 'dropFromPack', 'doScrollPick', 'beginPin',
                     'takeFromBox', 'invEnter', 'useItem'];
    const bodies = {};
    for (const f of ['part3_actions.js', 'part4_render.js']) {
      const s = fs.readFileSync(path.join(D, f), 'utf8');
      for (const name of TALKERS) {
        const at = s.indexOf('\nfunction ' + name + '(');
        if (at < 0) continue;
        let i = s.indexOf('{', at), depth = 0, end = i;
        for (; i < s.length; i++) {
          if (s[i] === '{') depth++;
          else if (s[i] === '}') { depth--; if (!depth) { end = i; break; } }
        }
        bodies[name] = s.slice(at, end);
      }
    }
    const missing = TALKERS.filter(n => !(n in bodies));
    const room = ctx.packLineRoom();
    const lines = [];
    for (const name in bodies) {
      const re = /msg\('((?:[^'\\]|\\.)*)'/g;
      let m;
      while ((m = re.exec(bodies[name]))) lines.push([name, m[1].replace(/\\'/g, "'")]);
    }
    const over = lines.filter(([, s]) => !ctx.packLineFits(s));
    const widest = lines.reduce((a, b) => ctx.textW(a[1]) > ctx.textW(b[1]) ? a : b, ['', '']);
    console.log('the pack talks       : ' + lines.length + ' lines, ' + over.length +
      ' too wide for the ' + room + 'px row; longest "' + widest[1] + '" ' +
      ctx.textW(widest[1]) + 'px');
    over.slice(0, 4).forEach(([f, s]) =>
      problems.push(f + ' says "' + s + '" (' + ctx.textW(s) + 'px) on a ' + room + 'px row'));
    if (missing.length) problems.push('no such function to read: ' + missing.join(', '));
  }

  /* --- the ? and the ! come out red in a hint ------------------------ */
  {
    /* Find a hint that has both marks in it, put it up, and look at what
       colour each glyph was drawn from.  The glyphs come off per-colour
       font sheets, so the sheet a glyph came from is the colour it is. */
    let want = -1;
    for (let i = 0; i < ctx.HINTS.length; i++)
      if (ctx.HINTS[i].indexOf('?') >= 0 && ctx.HINTS[i].indexOf('!') >= 0) { want = i; break; }
    if (want < 0) problems.push('no hint mentions both marks, so nothing was checked');
    else {
      ctx.G.mode = 'hint';
      ctx.G.hint = { i: want };
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const glyphs = blits.filter(b => b.from === 'font');
      const marks = ctx.HINTS[want].split('').filter(c => c === '?' || c === '!').length;
      /* every glyph off the red sheet, and every glyph off any other */
      const red = glyphs.filter(g => g.tint === ctx.COLS.R).length;
      console.log('marks in a hint      : ' + marks + ' of them, ' + red +
        ' glyphs drawn red out of ' + glyphs.length);
      if (red !== marks)
        problems.push(red + ' red glyphs in a hint with ' + marks + ' marks in it');
      ctx.G.mode = 'play';
    }
  }

  /* --- every note about every item fits the column ------------------- */
  {
    /* Built one of each and read its notes, rather than scanning the
       source for strings: most of these lines are assembled out of the
       item's own numbers, so only the real thing tells you how wide it
       ends up.  Each is shown identified and unidentified, and equipped,
       because that changes what it says. */
    const IXX = ctx.GX + 5 * ctx.PITCH + 3, colW = ctx.SW - IXX - 2;
    const kinds = [['weapon', ctx.WEAPONS], ['armor', ctx.ARMORS], ['head', ctx.HEADS],
                   ['feet', ctx.FEET], ['shield', ctx.SHIELDS], ['potion', ctx.POTIONS],
                   ['scroll', ctx.SCROLLS], ['wand', ctx.WANDS], ['ring', ctx.RINGS],
                   ['food', ctx.FOODS]];
    const over = [];
    let counted = 0, widest = ['', 0];
    for (const [kind, table] of kinds) {
      if (!table) continue;
      for (let k = 0; k < table.length; k++) {
        for (const known of [0, 1]) {
          const it = ctx.mkItem(kind, k);
          if (!it) continue;
          it.known = known; it.brKnown = known;
          if (known) { it.hp = 2; it.dp = 1; it.ap = 2; }
          let notes;
          try { notes = ctx.itemNotes(it); } catch (e) { over.push(kind + ' ' + k + ' threw ' + e.message); continue; }
          for (const [s] of notes) {
            counted++;
            const w = ctx.textW(s);
            if (w > widest[1]) widest = [s, w];
            if (w > colW) over.push('"' + s + '" (' + w + 'px) on ' + kind);
          }
        }
      }
    }
    console.log('item notes           : ' + counted + ' read, ' + over.length +
      ' wider than the ' + colW + 'px column; longest "' + widest[0] + '" ' + widest[1] + 'px');
    [...new Set(over)].slice(0, 5).forEach(o => problems.push('note too wide: ' + o));
  }

  /* --- a hole is a hole, and it asks before it takes you ------------- */
  {
    const L = ctx.L, P = ctx.P;
    /* put a hole where we can see it and look at what is drawn there */
    let spot = null;
    for (let i = 0; i < L.tiles.length && !spot; i++) {
      if (L.tiles[i] !== ctx.FLOOR) continue;
      const x = i % ctx.MAP_W, y = (i / ctx.MAP_W) | 0;
      for (const [dx, dy] of ctx.DIR4)
        if (ctx.walkable(x - dx, y - dy)) { spot = { x, y, dx, dy }; break; }
    }
    if (!spot) problems.push('nowhere to put a hole to look at');
    else {
      const was = L.tiles[spot.y * ctx.MAP_W + spot.x];
      L.tiles[spot.y * ctx.MAP_W + spot.x] = ctx.HOLE;
      P.x = spot.x - spot.dx; P.y = spot.y - spot.dy;
      ctx.computeVis();
      ctx.G.mode = 'play'; ctx.G.ask = null;
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
      const hx = ctx.VIEW_PX + (spot.x - camx) * ctx.TS;
      const hy = ctx.VIEW_PY + (spot.y - camy) * ctx.TS;
      const onIt = f => f.x === hx && f.y === hy && f.w === ctx.TS && f.h === ctx.TS;
      const black = fills.filter(f => onIt(f) && f.col === '#000000').length;
      const sprites = blits.filter(b => b.dx === hx && b.dy === hy && b.from === 'atlas' &&
                                        b.dw === ctx.TS && b.dh === ctx.TS).length;
      console.log('a hole in the floor  : ' + black + ' black fills over it, ' +
        sprites + ' sprites drawn on it');
      if (!black) problems.push('a hole is not filled black');
      if (sprites) problems.push(sprites + ' sprites are drawn on a hole, so it is not pitch black');

      /* and walking into it puts up the question rather than dropping you */
      ctx.G.msgq = []; ctx.G.ask = null;
      key(spot.dx > 0 ? 'ArrowRight' : spot.dx < 0 ? 'ArrowLeft' :
          spot.dy > 0 ? 'ArrowDown' : 'ArrowUp');
      if (ctx.G.mode !== 'ask') problems.push('walking into a hole did not ask; mode is ' + ctx.G.mode);
      else {
        blits = []; fills = [];
        vm.runInContext('render();', ctx);
        if (blits.filter(b => b.tag === 'screen').length < 30)
          problems.push('the question box was not drawn');
        key('Escape');
        if (ctx.G.mode !== 'play') problems.push('ESC did not answer the question');
      }
      L.tiles[spot.y * ctx.MAP_W + spot.x] = was;
      ctx.computeVis();
    }
  }

  /* --- the mouse ----------------------------------------------------- */
  {
    const M = ctx.MOUSE;
    /* a click in client pixels lands on the right buffer pixel: the fake
       canvas is 3x at the origin, so 3 client pixels are 1 of ours */
    const move = (cx2, cy2) => canvasListeners.mousemove({ clientX: cx2, clientY: cy2 });
    move(0, 0);
    if (M.x !== 0 || M.y !== 0) problems.push('the top left corner maps to ' + M.x + ',' + M.y);
    move(3 * 100 + 1, 3 * 50 + 2);
    if (M.x !== 100 || M.y !== 50) problems.push('100,50 maps to ' + M.x + ',' + M.y);
    move(3 * 229 + 2, 3 * 127 + 2);
    if (M.x !== 229 || M.y !== 127) problems.push('the far corner maps to ' + M.x + ',' + M.y);
    if (!M.on) problems.push('the pointer is not on the picture at the far corner');

    /* moving the mouse hands it the pointer; a key takes it back */
    if (!ctx.usingMouse()) problems.push('moving the mouse did not put it in charge');
    key('Escape');
    if (ctx.usingMouse()) problems.push('a key did not take the pointer back off the mouse');
    move(3 * 60, 3 * 60);

    /* the pointer is drawn, over everything, and only when it is ours */
    ctx.G.mode = 'play'; ctx.G.pause = null; ctx.G.slots = null; ctx.G.hint = null;
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    const arrowCell = n => { const i = ATLAS.index[n]; return [(i % ATLAS.cols) * 8, ((i / ATLAS.cols) | 0) * 8]; };
    const [ax, ay] = arrowCell('mouse');
    const arrows = blits.filter(b => b.tag === 'screen' && b.sx === ax && b.sy === ay);
    if (arrows.length !== 1) problems.push(arrows.length + ' pointers drawn, wanted 1');
    else {
      if (arrows[0].dx !== 60 || arrows[0].dy !== 60)
        problems.push('the pointer is drawn at ' + arrows[0].dx + ',' + arrows[0].dy + ' not 60,60');
      const last = Math.max(...blits.filter(b => b.tag === 'screen').map(b => b.seq));
      if (arrows[0].seq !== last) problems.push('something is drawn over the pointer');
      /* smaller than a tile: a whole 8x8 of arrow is the size of a monster */
      if (arrows[0].dw !== ctx.MOUSE_PX || arrows[0].dh !== ctx.MOUSE_PX)
        problems.push('the pointer is ' + arrows[0].dw + 'x' + arrows[0].dh +
          ', wanted ' + ctx.MOUSE_PX + ' square');
      if (arrows[0].dw >= ctx.TS) problems.push('the pointer is as big as a tile');
    }
    console.log('the pointer          : ' + (arrows[0] ? arrows[0].dw + 'x' + arrows[0].dh : '-') +
      ' at ' + (arrows[0] ? arrows[0].dx + ',' + arrows[0].dy : '-') + ', last of all');

    /* a yellow frame follows it round the map.  x=60 is still the panel,
       so step over the divide first - VIEW_PX is where the map starts. */
    {
      move(3 * (ctx.VIEW_PX + 40), 3 * 60);
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const t2 = ctx.mouseTile();
      if (!t2) problems.push('the pointer is over the map but no square is under it');
      else {
        const edges = fills.filter(f => f.col === ctx.HOVER_COL);
        const onIt = edges.filter(f => f.x >= t2.px - 1 && f.x <= t2.px + ctx.TS &&
                                       f.y >= t2.py - 1 && f.y <= t2.py + ctx.TS);
        if (!onIt.length) problems.push('no frame is drawn round the square under the pointer');
        console.log('hover frame          : ' + onIt.length + ' yellow edges round ' +
          t2.x + ',' + t2.y);
      }
      /* over the panel there is no square, and no frame */
      move(3 * 10, 3 * 60);
      if (ctx.mouseTile()) problems.push('the panel counts as a map square');
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      if (fills.some(f => f.col === ctx.HOVER_COL))
        problems.push('a hover frame is drawn while the pointer is over the panel');
      move(3 * (ctx.VIEW_PX + 40), 3 * 60);
    }

    /* off the picture and the pointer goes with it */
    canvasListeners.mouseout({});
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    if (blits.some(b => b.tag === 'screen' && b.sx === ax && b.sy === ay))
      problems.push('the pointer is still drawn after the mouse left the picture');
    if (fills.some(f => f.col === ctx.HOVER_COL))
      problems.push('the hover frame is still drawn after the mouse left the picture');
    move(3 * 60, 3 * 60);

    /* the pack icon, and clicking it */
    const pack = ctx.HITS.filter(h => h.what === 'pack');
    if (pack.length !== 1) problems.push(pack.length + ' pack icons on the play screen');
    else {
      if (pack[0].y + pack[0].h > ctx.SH) problems.push('the pack icon hangs off the bottom');
      if (pack[0].x > 20) problems.push('the pack icon is not in the left corner');
      ctx.clickAt(pack[0].x + 2, pack[0].y + 2, false);
      if (ctx.G.mode !== 'inv') problems.push('clicking the pack did not open it');
      vm.runInContext('render();', ctx);
      ctx.clickAt(pack[0].x + 2, pack[0].y + 2, false);
      if (ctx.G.mode === 'inv') problems.push('clicking the pack again did not close it');
    }

    /* a key takes the pointer back, and then there is no pointer and no
       pack icon on screen at all */
    key('Escape'); key('Escape');
    ctx.G.mode = 'play'; ctx.G.pause = null;
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    if (blits.some(b => b.tag === 'screen' && b.sx === ax && b.sy === ay))
      problems.push('the pointer is still drawn after a key was pressed');
    if (ctx.HITS.some(h => h.what === 'pack'))
      problems.push('the pack icon is still there after a key was pressed');

    /* every menu answers a click on the row you clicked */
    move(3 * 60, 3 * 60);
    const rowTest = (mode, setup, what, want) => {
      setup();
      vm.runInContext('render();', ctx);
      const rows = ctx.HITS.filter(h => h.what === what);
      if (!rows.length) { problems.push('no clickable rows on the ' + mode + ' screen'); return; }
      const r = rows[rows.length - 1];
      ctx.clickAt(r.x + 2, r.y + 2, false);
      want(rows.length - 1);
    };
    rowTest('title', () => { ctx.G.mode = 'title'; ctx.G.titleMenu = { i: 0 }; }, 'title',
      () => { if (ctx.G.mode === 'title' && ctx.G.titleMenu) problems.push('clicking a title row did nothing'); });
    rowTest('pause', () => { ctx.G.mode = 'play'; ctx.G.pause = null; key('Escape'); ctx.G.pause.i = 0; }, 'pause',
      () => { if (ctx.G.mode === 'pause') problems.push('clicking a pause row did nothing'); });
    console.log('clicking menus       : title and pause rows both answer the pointer');
    ctx.G.mode = 'play'; ctx.G.pause = null; ctx.G.slots = null; ctx.G.hint = null; ctx.G.titleMenu = null;
  }

  /* --- walking, striking, and picking things up ---------------------- */
  {
    const L = ctx.L, P = ctx.P;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.ctx = null; ctx.G.pause = null;
    ctx.G.dead = 0; P.hp = P.mhp = 400;
    L.mons.length = 0;
    /* the earlier blocks have walked the player about; stand him in the
       middle of the roomiest chamber so there is somewhere to walk to */
    {
      let big = null;
      for (const r of L.rooms)
        if (!r.gone && (!big || r.floors.length > big.floors.length)) big = r;
      if (big) { P.x = big.cx; P.y = big.cy; ctx.computeVis(); }
    }

    /* Somewhere to walk to inside the room you are standing in.  Any old
       square on the floor will not do: a vault behind a locked door is
       genuinely unreachable, and that is the pathfinder being right. */
    let far = null;
    const home = L.rooms.find(r => !r.gone && r.floors.some(f => f[0] === P.x && f[1] === P.y));
    if (home) {
      for (const f of home.floors) {
        const d = Math.abs(f[0] - P.x) + Math.abs(f[1] - P.y);
        if (d > 3 && ctx.walkable(f[0], f[1]) && (!far || d > far.d))
          far = { x: f[0], y: f[1], d };
      }
    }
    if (!far) problems.push('nowhere far enough in this room to test a walk');
    else {
      const path = ctx.findPath(far.x, far.y, {});
      if (!path) problems.push('no path across a room, ' + ctx.P.x + ',' + ctx.P.y +
        ' to ' + far.x + ',' + far.y);
      else {
        if (!path.length) problems.push('the path to somewhere else is empty');
        /* every square of it is one step from the last, and none of them
           is a hole, a seen trap or a barrel */
        let px = P.x, py = P.y, bad = 0;
        for (const s of path) {
          if (Math.abs(s.x - px) + Math.abs(s.y - py) !== 1) bad++;
          if (!ctx.stepCost(s.x, s.y)) bad++;
          px = s.x; py = s.y;
        }
        if (bad) problems.push(bad + ' squares of the path are not walkable steps');
        if (px !== far.x || py !== far.y) problems.push('the path does not arrive');
        console.log('pathfinding          : ' + path.length + ' steps to a square ' +
          far.d + ' away, all of them legal');
      }
      /* water costs more than floor, and a hole costs nothing at all */
      const dry = ctx.STEP_COST;
      let wet = null;
      for (let i = 0; i < L.tiles.length && wet === null; i++)
        if (L.tiles[i] === ctx.WATER) wet = ctx.stepCost(i % ctx.MAP_W, (i / ctx.MAP_W) | 0);
      if (wet !== null && wet <= dry)
        problems.push('a square of water costs ' + wet + ', no more than dry ground');
      console.log('a wade               : ' + (wet === null ? 'no water on this floor'
        : 'costs ' + wet + ' against ' + dry + ' on dry ground'));
    }

    /* clicking yourself reaches into your own pack */
    {
      ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.drag = null; ctx.G.ctx = null;
      ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
      ctx.LAST_INPUT = 'mouse'; ctx.MOUSE.on = 1;
      /* nothing lying underfoot, or the click rightly picks that up */
      for (let i = L.items.length - 1; i >= 0; i--)
        if (L.items[i].x === P.x && L.items[i].y === P.y) L.items.splice(i, 1);
      ctx.computeVis();
      const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
      ctx.MOUSE.x = ctx.VIEW_PX + (P.x - camx) * ctx.TS + 3;
      ctx.MOUSE.y = ctx.VIEW_PY + (P.y - camy) * ctx.TS + 3;
      const sq = ctx.mouseTile();
      if (!sq || sq.x !== P.x || sq.y !== P.y)
        problems.push('the pointer is not over the player for the own-square click');
      else {
        ctx.mapClick(ctx.MOUSE.x, ctx.MOUSE.y, false);
        if (ctx.G.mode !== 'inv')
          problems.push('clicking yourself left the game in ' + ctx.G.mode + ', not the pack');
        ctx.closeInv(); ctx.G.mode = 'play';
        console.log('clicking yourself    : opens the pack');
      }
      ctx.G.walk = null;
    }

    /* a walk gives up the moment something is watching */
    if (far) {
      ctx.walkTo(far.x, far.y, null);
      if (!ctx.G.walk) problems.push('clicking a far square started no walk');
      else {
        const m = ctx.mkMonster('T', 5, P.x + 1, P.y);
        m.state = 2; m.disguise = 0; m.hp = m.mhp = 900;
        L.mons.push(m);
        ctx.computeVis();
        ctx.G.walk.at = 0;
        ctx.walkTick();
        if (ctx.G.walk) problems.push('a walk carried on with a troll watching');
        console.log('breaking off         : a walk stops when something sees you');
        L.mons.length = 0;
      }
      ctx.G.walk = null;
    }

    /* picking up: the keyboard takes it, the mouse asks you to click */
    {
      const spot = { x: P.x, y: P.y };
      let step = null;
      for (const [dx, dy] of ctx.DIR4)
        if (ctx.walkable(spot.x + dx, spot.y + dy) && !ctx.itemAt(L, spot.x + dx, spot.y + dy))
          { step = [dx, dy]; break; }
      if (!step) problems.push('nowhere to step for the pickup test');
      else {
        const put = () => {
          const it = ctx.mkItem('potion', 0);
          it.x = spot.x + step[0]; it.y = spot.y + step[1];
          L.items.push(it);
          return it;
        };
        /* keyboard: unchanged - walking on takes it */
        key('Escape');
        P.x = spot.x; P.y = spot.y;
        let it = put();
        ctx.G.msgq = [];
        ctx.playerMove(step[0], step[1]);
        if (L.items.indexOf(it) >= 0)
          problems.push('walking onto an item with the keyboard did not pick it up');

        /* mouse: it stays on the floor and says so */
        canvasListeners.mousemove({ clientX: 300, clientY: 300 });
        P.x = spot.x; P.y = spot.y;
        it = put();
        ctx.G.msgq = [];
        ctx.playerMove(step[0], step[1]);
        const said = ctx.G.msgq.map(q => q.s || '').join(' ');
        if (L.items.indexOf(it) < 0)
          problems.push('walking onto an item with the mouse in hand took it anyway');
        else if (said.indexOf('lick') < 0)
          problems.push('nothing told you to click it; it said "' + said + '"');
        else {
          /* and clicking it does take it */
          ctx.G.msgq = [];
          ctx.handPickup();
          if (L.items.indexOf(it) >= 0) problems.push('clicking the item did not take it');
        }
        console.log('picking up           : the keyboard takes it, the mouse waits to be clicked');
        key('Escape');
      }
    }

    /* the right-click menu offers what is on the square */
    {
      ctx.G.mode = 'play'; ctx.G.ctx = null;
      ctx.openCtxMenu(P.x, P.y);
      if (ctx.G.mode !== 'ctx') problems.push('right-clicking opened no menu');
      else {
        const names = ctx.G.ctx.opts.map(o => o[0]);
        for (const want of ['look', 'inv'])
          if (names.indexOf(want) < 0) problems.push('your own square offers no ' + want);
        /* Look at yourself is your pack: what there is to know about the
           square you are standing on is what you are carrying. */
        ctx.G.ctx.i = names.indexOf('look');
        ctx.G.msgq = [];
        ctx.ctxKey('Enter');
        if (ctx.G.mode !== 'inv')
          problems.push('Look at yourself left the game in ' + ctx.G.mode + ', not the pack');
        ctx.closeInv(); ctx.G.ctx = null; ctx.G.mode = 'play';
        console.log('right-click menu     : ' + names.join(', ') +
          ' on your own square, and Look is your pack');

        /* Look at any other square still says what is there */
        let other = null;
        for (const [dx, dy] of ctx.DIR4)
          if (ctx.walkable(P.x + dx, P.y + dy)) { other = { x: P.x + dx, y: P.y + dy }; break; }
        if (!other) problems.push('nowhere beside you to look at');
        else {
          ctx.openCtxMenu(other.x, other.y);
          const n2 = ctx.G.ctx.opts.map(o => o[0]);
          ctx.G.ctx.i = n2.indexOf('look');
          ctx.G.msgq = []; ctx.G.log = [];
          ctx.ctxKey('Enter');
          if (ctx.G.mode !== 'play') problems.push('Look at a square left the menu open');
          if (!ctx.G.msgq.length && !ctx.G.log.length)
            problems.push('Look at a square said nothing');
          /* and it no longer tells you what dynamite would do to a wall */
          const said = ctx.G.msgq.concat(ctx.G.log).map(q => q.s || '').join(' ');
          if (/[Dd]ynamite/.test(said))
            problems.push('looking at a square gave the dynamite away: ' + said);
        }
        /* nor does the wall's own description */
        for (const t of [ctx.WALL, ctx.SDOOR]) {
          const lines = (ctx.TILE_INFO[t] || []).join(' ');
          if (/[Dd]ynamite/.test(lines))
            problems.push('a wall still says dynamite would blow it in');
        }
      }
      ctx.G.ctx = null; ctx.G.mode = 'play';
    }
  }

  /* --- pointing past the edge of the map you know --------------------- */
  {
    /* A fresh run: an earlier block marks the whole floor seen to test
       the shading, and with nothing unseen there is nothing to point at. */
    vm.runInContext('newGame(false);', ctx);
    const L = ctx.L, P = ctx.P;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.ctx = null;
    /* an unseen square just outside what you have seen */
    let out = null, far = null;
    for (let i = 0; i < L.tiles.length && (!out || !far); i++) {
      const x = i % ctx.MAP_W, y = (i / ctx.MAP_W) | 0;
      if (L.flags[i] & ctx.F_SEEN) continue;
      const d = ctx.unseenReach(x, y);
      if (d === 1 && !out) out = { x, y };
      if (d > ctx.UNSEEN_REACH && d < 99 && !far) far = { x, y };
    }
    if (!out) problems.push('no unseen square sits beside a seen one');
    else {
      /* the frame fades: full strength one square out, nothing at six */
      const alphaAt = d => (ctx.UNSEEN_REACH + 1 - d) / ctx.UNSEEN_REACH;
      if (Math.abs(alphaAt(1) - 1) > 0.001) problems.push('one square out is not full strength');
      if (alphaAt(ctx.UNSEEN_REACH + 1) > 0.001) problems.push('six squares out is not invisible');
      let falls = true;
      for (let d = 1; d < ctx.UNSEEN_REACH; d++) if (alphaAt(d + 1) >= alphaAt(d)) falls = false;
      if (!falls) problems.push('the frame does not fade with distance');

      /* clicking one walks you as near as the map allows */
      const before = { x: P.x, y: P.y };
      const near = ctx.nearestApproach(out.x, out.y);
      if (!near) problems.push('no square can be reached near an unseen one');
      else {
        const d = Math.max(Math.abs(near.x - out.x), Math.abs(near.y - out.y));
        if (d > ctx.UNSEEN_REACH)
          problems.push('the nearest approach is ' + d + ' squares off, further than the reach');
        if (!(L.flags[near.y * ctx.MAP_W + near.x] & ctx.F_SEEN))
          problems.push('the approach square is one you have never seen');
      }
      const steps = [];
      for (let d = 1; d <= ctx.UNSEEN_REACH + 1; d++) steps.push(Math.round(alphaAt(d) * 100) + '%');
      console.log('into the dark        : ' + ctx.UNSEEN_REACH + ' squares of reach, frame ' +
        'fades ' + steps.join(' '));
      P.x = before.x; P.y = before.y;
    }
    if (far && ctx.unseenReach(far.x, far.y) <= ctx.UNSEEN_REACH)
      problems.push('a square well out in the dark counts as within reach');
    ctx.G.walk = null;
  }

  /* --- throwing at what you click ------------------------------------- */
  {
    const L = ctx.L, P = ctx.P;
    ctx.G.mode = 'play'; ctx.G.walk = null;
    L.mons.length = 0;
    /* a fresh run starts with three stones, but earlier blocks throw and
       drop things, so put one in if the pack has none left */
    let stone = ctx.P.slots.find(s => s && s.t === 'weapon' && ctx.WEAPONS[s.k].thrown);
    if (!stone) {
      const st = ctx.mkItem('weapon', ctx.weaponIndex('stone'));
      st.cnt = 3; st.known = 1; ctx.addItem(st);
      stone = ctx.P.slots.find(s => s && s.t === 'weapon' && ctx.WEAPONS[s.k].thrown);
    }
    if (!stone) console.log('throwing by mouse    : no stone in the pack to try it with');
    else {
      /* the pack: a click asks what to do rather than acting at once */
      ctx.openInv();
      vm.runInContext('render();', ctx);
      const cells = ctx.HITS.filter(h => h.what === 'cell');
      const idx = ctx.P.slots.indexOf(stone);
      const cell = cells.find(h => h.i.r === ((idx / 5) | 0) + 1 && h.i.c === idx % 5);
      if (!cell) problems.push('the stone has no square on the pack screen');
      else {
        ctx.clickAt(cell.x + 2, cell.y + 2, false);
        if (!ctx.G.menu) problems.push('clicking the stone did not ask what to do with it');
        else {
          /* the menu stands beside its own square, not a row below it */
          vm.runInContext('render();', ctx);
          const rows = ctx.HITS.filter(h => h.what === 'menu');
          const top = Math.min(...rows.map(r => r.y));
          if (Math.abs(top - cell.y) > ctx.SL)
            problems.push('the item menu is ' + (top - cell.y) + 'px off its square');
          console.log('item menu            : opens beside its square, ' +
            (top - cell.y) + 'px from its top');
          /* take Throw out of it */
          const names = ctx.G.menu.opts.map(o => o[0]);
          if (names.indexOf('throw') < 0) problems.push('a stone cannot be thrown from its menu');
          else {
            ctx.G.menu.i = names.indexOf('throw');
            ctx.menuKey('Enter');
            if (ctx.G.mode !== 'aim') problems.push('Throw did not start aiming');
            else {
              /* and a click on a square throws it there.  Any square in
                 range will do, so long as the throw is a legal one. */
              let tgt = null;
              for (const [dx, dy] of ctx.DIR4)
                for (let n = 1; n <= 3 && !tgt; n++) {
                  const cx3 = P.x + dx * n, cy3 = P.y + dy * n;
                  if (ctx.throwValid(cx3, cy3, stone)) tgt = { x: cx3, y: cy3 };
                }
              if (!tgt) problems.push('nowhere legal to throw a stone from here');
              else {
                const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
                canvasListeners.mousemove({
                  clientX: 3 * (ctx.VIEW_PX + (tgt.x - camx) * ctx.TS + 2),
                  clientY: 3 * (ctx.VIEW_PY + (tgt.y - camy) * ctx.TS + 2)
                });
                vm.runInContext('render();', ctx);
                /* how many stones are in the pack all told, since a
                   throw may split or merge the stack it came from */
                const stones = () => ctx.carriedItems()
                  .filter(s => s.t === 'weapon' && ctx.WEAPONS[s.k].thrown)
                  .reduce((n, s) => n + (s.cnt || 1), 0);
                const held = stones();
                ctx.clickAt(ctx.MOUSE.x, ctx.MOUSE.y, false);
                if (ctx.G.mode === 'aim') problems.push('clicking a square did not throw it');
                if (stones() >= held)
                  problems.push('the stone was not spent: ' + held + ' before, ' + stones() + ' after');
                console.log('throwing by mouse    : clicking a square lets it go');
              }
            }
          }
        }
      }
      ctx.G.mode = 'play'; ctx.G.menu = null; ctx.G.aimSq = null; ctx.G.throwing = null;
      ctx.G.invOpen = 0;
    }
  }

  /* --- the fading frame paints each pixel once ------------------------ */
  {
    fills = [];
    ctx.frameFade(20, 30, ctx.TS, ctx.TS, ctx.HOVER_DARK_COL, 0.5);
    const drawn = fills.filter(f => f.col === ctx.HOVER_DARK_COL);
    /* count how many of the four rectangles cover each corner pixel */
    const covers = (f, x, y) => x >= f.x && y >= f.y && x < f.x + f.w && y < f.y + f.h;
    const corners = [[20, 30], [20 + ctx.TS - 1, 30],
                     [20, 30 + ctx.TS - 1], [20 + ctx.TS - 1, 30 + ctx.TS - 1]];
    let twice = 0;
    for (const [cxp, cyp] of corners)
      if (drawn.filter(f => covers(f, cxp, cyp)).length > 1) twice++;
    if (twice) problems.push(twice + ' corners of the fading frame are painted twice, ' +
      'so they come out brighter than its sides');
    /* and the whole outline is still there */
    let missing = 0;
    for (let i = 0; i < ctx.TS; i++) {
      const edge = [[20 + i, 30], [20 + i, 30 + ctx.TS - 1],
                    [20, 30 + i], [20 + ctx.TS - 1, 30 + i]];
      for (const [ex, ey] of edge)
        if (!drawn.some(f => covers(f, ex, ey))) missing++;
    }
    if (missing) problems.push(missing + ' pixels of the fading frame are not drawn');
    console.log('the fading frame     : ' + drawn.length + ' strips, no corner painted twice');
  }

  /* --- clicking a locked door walks you over and tries it ------------- */
  {
    const L = ctx.L, P = ctx.P, MAP_W = ctx.MAP_W;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.drag = null;
    ctx.G.dead = 0; L.mons.length = 0; P.hp = P.mhp = 900;
    P.blind = 0; P.frozen = 0; P.held = 0; P.conf = 0;

    /* a locked door somewhere on this floor, and a square to stand on
       three or more steps off with a way through to it */
    let door = null, from = null;
    for (let i = 0; i < L.tiles.length && !from; i++) {
      if (L.tiles[i] !== ctx.LOCKED) continue;
      const dx = i % MAP_W, dy = (i / MAP_W) | 0;
      for (const [ox, oy] of ctx.DIR4) {
        const sx = dx + ox, sy = dy + oy;
        if (!ctx.walkable(sx, sy)) continue;
        /* stand back a little, so there is a walk to watch */
        for (const [bx, by] of ctx.DIR4) {
          const px = sx + bx * 3, py = sy + by * 3;
          if (!ctx.walkable(px, py) || ctx.monAt(L, px, py)) continue;
          const was = { x: P.x, y: P.y };
          P.x = px; P.y = py;
          const road = ctx.findPath(sx, sy, {});
          P.x = was.x; P.y = was.y;
          if (road && road.length >= 2) {
            door = { x: dx, y: dy, i: i, mat: L.locks[i] };
            from = { x: px, y: py };
            break;
          }
        }
        if (from) break;
      }
    }

    if (!door) console.log('a locked door        : none on this floor to click');
    else {
      const tryClick = (withKey) => {
        P.x = from.x; P.y = from.y;
        L.tiles[door.i] = ctx.LOCKED; L.locks[door.i] = door.mat;
        P.keys = {}; if (withKey) P.keys[door.mat] = 1;
        ctx.computeVis();
        L.flags[door.i] |= ctx.F_SEEN;
        ctx.G.walk = null; ctx.G.msgq = []; ctx.G.log = [];
        /* point at the door and click it */
        const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
        ctx.MOUSE.x = ctx.VIEW_PX + (door.x - camx) * ctx.TS + 3;
        ctx.MOUSE.y = ctx.VIEW_PY + (door.y - camy) * ctx.TS + 3;
        const under = ctx.mouseTile();
        if (!under || under.x !== door.x || under.y !== door.y) return 'pointer missed the door';
        ctx.mapClick(ctx.MOUSE.x, ctx.MOUSE.y, false);
        if (!ctx.G.walk) return 'no walk started';
        if (!ctx.G.walk.job || !ctx.G.walk.job.door) return 'the walk was not about the door';
        /* walk it out */
        for (let t = 0; t < 60 && ctx.G.walk; t++) { ctx.G.walk.at = 0; ctx.walkTick(); }
        return null;
      };

      /* the walk drains msgq into the log as it goes, so read both */
      const said = () => ctx.G.msgq.concat(ctx.G.log).map(q => q.s || '').join(' ');

      let why = tryClick(false);
      if (why) problems.push('clicking a locked door with no key: ' + why);
      else {
        if (Math.abs(P.x - door.x) + Math.abs(P.y - door.y) !== 1)
          problems.push('you did not end up standing at the door, but at ' +
            P.x + ',' + P.y + ' with the door at ' + door.x + ',' + door.y);
        if (!/is locked/.test(said()))
          problems.push('no word that the door was locked: ' + said());
        if (/can't go there/.test(said()))
          problems.push('clicking a locked door still says you cannot go there');
        if (ctx.L.tiles[door.i] !== ctx.LOCKED)
          problems.push('the door opened without a key');
      }

      why = tryClick(true);
      if (why) problems.push('clicking a locked door with the key: ' + why);
      else {
        if (ctx.L.tiles[door.i] !== ctx.DOOR)
          problems.push('the key did not open the door');
        if (!/You open the door/.test(said()))
          problems.push('no word that the door opened: ' + said());
      }
      console.log('clicking a lock      : you walk over and try it - ' +
        'the ' + ctx.MATS[door.mat] + ' door opens with its key and says so without');
      L.tiles[door.i] = ctx.LOCKED; L.locks[door.i] = door.mat;
      ctx.G.walk = null; ctx.G.msgq = [];
    }
  }

  /* --- the mouse: a drag moves the map, a click chooses a square ------ */
  {
    const P = ctx.P;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.drag = null; ctx.G.pan = null;
    const at = (bx, by) => ({ clientX: 3 * bx, clientY: 3 * by });
    const start = { x: ctx.VIEW_PX + 40, y: 60 };
    /* press, move a long way, release: the map has moved and nothing walked */
    const was = { x: P.x, y: P.y };
    canvasListeners.mousedown(Object.assign(at(start.x, start.y), { button: 0 }));
    canvasListeners.mousemove(at(start.x + 40, start.y + 16));
    if (!ctx.G.drag) problems.push('dragging the mouse did not move the map');
    canvasListeners.mouseup(Object.assign(at(start.x + 40, start.y + 16), { button: 0 }));
    if (ctx.G.walk) problems.push('a drag started a walk');
    if (P.x !== was.x || P.y !== was.y) problems.push('a drag moved the player');
    const moved = ctx.G.drag ? Math.abs(ctx.G.drag.dx) + Math.abs(ctx.G.drag.dy) : 0;
    if (!moved) problems.push('the drag left the view where it was');
    /* the square under the pointer follows the dragged view */
    const tile = ctx.mouseTile();
    if (!tile) problems.push('no square under the pointer after a drag');
    console.log('dragging the map     : the view shifted ' + moved +
      ' squares and nothing walked');

    /* --- and it follows the hand a pixel at a time -------------------- */
    /* The map used to move only once the hand had crossed half a square,
       and then it moved a whole one, which is what made a drag stutter.
       Every pixel of hand movement has to show up in the picture. */
    {
      const TS = ctx.TS;
      /* where the map is drawn, in pixels, however the offset is split
         between whole tiles and the fraction the drawing carries */
      const drawnPx = () => {
        const t = ctx.camTarget(), slip = ctx.camSlip();
        return { x: t.x * TS - slip.x, y: t.y * TS - slip.y };
      };
      ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.MOUSE.held = null;
      const from = { x: ctx.VIEW_PX + 40, y: 60 };
      canvasListeners.mousedown(Object.assign(at(from.x, from.y), { button: 0 }));
      /* past the slop, so the gesture is a drag, then one pixel at a time */
      canvasListeners.mousemove(at(from.x + ctx.DRAG_SLOP, from.y));
      const base = drawnPx().x;
      let steps = 0, missed = 0, wrong = 0;
      for (let px = ctx.DRAG_SLOP + 1; px <= ctx.DRAG_SLOP + 12; px++) {
        const before = drawnPx().x;
        canvasListeners.mousemove(at(from.x + px, from.y));
        const now = drawnPx().x;
        steps++;
        if (now === before) missed++;                    /* the picture stood still */
        if (Math.abs(now - before) > 1.001) wrong++;      /* or jumped a whole square */
      }
      const total = base - drawnPx().x;
      if (missed) problems.push(missed + ' of ' + steps +
        ' single pixels of hand movement did not move the map at all');
      if (wrong) problems.push(wrong + ' pixels of hand movement moved the map more than a pixel');
      if (Math.abs(total - 12) > 0.5)
        problems.push('twelve pixels of hand movement moved the map ' + total + 'px');
      canvasListeners.mouseup(Object.assign(at(from.x + ctx.DRAG_SLOP + 12, from.y),
        { button: 0 }));
      /* Let go half a square off the grid and it eases onto the grid over
         the next few frames rather than snapping there - and it must
         actually arrive, or every sprite stays drawn between two pixels
         for as long as the map sits. */
      const offGrid = ctx.camSlip().x;
      let settle = 0;
      while ((ctx.camSlip().x || ctx.camSlip().y) && settle < 100) { ctx.camEase(); settle++; }
      if (ctx.camSlip().x || ctx.camSlip().y)
        problems.push('the map never settled back onto the grid');
      if (Math.abs(offGrid) > ctx.TS / 2)
        problems.push('letting go left the map ' + offGrid + 'px off the grid, over half a tile');
      console.log('a drag, pixel by pixel: ' + steps + ' single-pixel moves, each one a ' +
        'single pixel of map; letting go ' + Math.abs(offGrid) + 'px off the grid settles in ' +
        settle + ' frames');
      ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.MOUSE.held = null;
    }

    /* a press and release on the same spot is a click, and does walk */
    ctx.G.drag = null;
    ctx.computeVis();
    let dest = null;
    for (const [dx, dy] of ctx.DIR4) {
      const tx = P.x + dx * 2, ty = P.y + dy * 2;
      if (ctx.walkable(tx, ty) && !ctx.monAt(ctx.L, tx, ty) &&
          (ctx.L.flags[ty * ctx.MAP_W + tx] & ctx.F_SEEN)) { dest = { x: tx, y: ty }; break; }
    }
    if (!dest) problems.push('nowhere two squares off to click on');
    else {
      const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
      const px = ctx.VIEW_PX + (dest.x - camx) * ctx.TS + 3;
      const py = ctx.VIEW_PY + (dest.y - camy) * ctx.TS + 3;
      canvasListeners.mousemove(at(px, py));
      canvasListeners.mousedown(Object.assign(at(px, py), { button: 0 }));
      canvasListeners.mouseup(Object.assign(at(px, py), { button: 0 }));
      if (!ctx.G.walk) problems.push('a click that did not drag started no walk');
      console.log('clicking a square    : still walks when the mouse has not moved');
      ctx.G.walk = null;
    }
    ctx.G.drag = null;
  }

  /* --- floors and walls draw all of their variants -------------------- */
  {
    const seenF = {}, seenW = {};
    for (let y = 0; y < 40; y++) for (let x = 0; x < 60; x++) {
      seenF[ctx.floorSprite(x, y)] = (seenF[ctx.floorSprite(x, y)] || 0) + 1;
      seenW[ctx.wallVariant(x, y)] = (seenW[ctx.wallVariant(x, y)] || 0) + 1;
    }
    const total = 40 * 60;
    const pc = n => Math.round(100 * n / total);
    for (const n of ['floor', 'floor2', 'floor3'])
      if (!seenF[n]) problems.push('flagstone ' + n + ' is never drawn');
    for (const n of ['wall', 'wall2', 'wall3', 'wall_moss'])
      if (!seenW[n]) problems.push('wall face ' + n + ' is never drawn');
    /* the three flagstones share the floor between them */
    for (const n of ['floor', 'floor2', 'floor3'])
      if (pc(seenF[n]) < 25) problems.push(n + ' is only ' + pc(seenF[n]) + '% of the floor');
    /* plain wall is the common one, broken is here and there */
    if (pc(seenW.wall) < 60) problems.push('plain wall is only ' + pc(seenW.wall) + '%');
    if (pc(seenW.wall2) >= pc(seenW.wall))
      problems.push('broken wall is as common as plain wall');
    if (pc(seenW.wall2) < 5) problems.push('broken wall almost never turns up');
    /* both mossy faces get used, and used about equally */
    const m1 = seenW.wall3, m2 = seenW.wall_moss;
    if (Math.max(m1, m2) > Math.min(m1, m2) * 2)
      problems.push('the two mossy faces are used ' + m1 + ' and ' + m2);
    console.log('floors and walls     : floor ' +
      ['floor', 'floor2', 'floor3'].map(n => pc(seenF[n]) + '%').join('/') +
      ', wall ' + pc(seenW.wall) + '% broken ' + pc(seenW.wall2) +
      '% mossy ' + (pc(m1) + pc(m2)) + '%');
  }

  /* --- the view comes home because you walk it home ------------------- */
  {
    const P = ctx.P, TS = ctx.TS, half = ctx.VIEW_W >> 1, halfY = ctx.VIEW_H >> 1;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.pan = null; ctx.G.ctx = null;
    ctx.MOUSE.held = null;

    /* Where the map is actually drawn, in tiles, for a given settled
       tile offset and drawing position.  This is the sum the renderer
       does: the tiles go down at the whole-tile offset and the whole lot
       is then shifted by camSlip. */
    const drawnAt = () => {
      const t = ctx.camTarget(), slip = ctx.camSlip();
      return { x: t.x - slip.x / TS, y: t.y - slip.y / TS };
    };

    /* --- a slide goes the way it is pointed --------------------------- */
    /* The map is at 14 and is told to go to 0.  Every frame of the slide
       has to be drawn somewhere between the two.  It used to be shifted
       the wrong way, so the first frame threw the picture 14 squares
       past where it started before easing back - which is what a slide
       looked like from the outside. */
    ctx.G.drag = { dx: 14, dy: 6 };
    ctx.CAM_AT.x = 14; ctx.CAM_AT.y = 6;
    ctx.G.drag = null;                       /* told to come all the way home */
    let outside = 0, frames = 0, subTile = 0, seen = [], jump = 0;
    let prev = drawnAt();
    if (Math.abs(prev.x - 14) > 0.01 || Math.abs(prev.y - 6) > 0.01)
      problems.push('the map is drawn at ' + prev.x.toFixed(2) + ',' + prev.y.toFixed(2) +
        ' when it should still be where it was, at 14,6');
    while ((ctx.camSlip().x || ctx.camSlip().y) && frames < 400) {
      ctx.camEase(); frames++;
      const now = drawnAt();
      if (now.x > 14.01 || now.x < -0.01 || now.y > 6.01 || now.y < -0.01) outside++;
      if (now.x > prev.x + 0.01 || now.y > prev.y + 0.01) outside++;   /* went backwards */
      jump = Math.max(jump, Math.abs(now.x - prev.x));
      if (Math.abs(ctx.camSlip().x) % TS !== 0) subTile++;
      seen.push(now.x);
      prev = now;
    }
    if (outside) problems.push(outside + ' frames of the slide were drawn outside the ' +
      'stretch between where the map was and where it was going');
    if (frames < 3) problems.push('the slide was over in ' + frames + ' frames');
    if (frames >= 400) problems.push('the slide never finished');
    if (subTile < frames / 2)
      problems.push('the map is mostly drawn on whole tiles, so it hops rather than glides');
    if (jump > 1) problems.push('the map moves ' + jump.toFixed(2) + ' tiles in one frame');
    const settled = drawnAt();
    if (Math.abs(settled.x) > 0.01 || Math.abs(settled.y) > 0.01)
      problems.push('the slide finished at ' + settled.x + ',' + settled.y + ', not home');
    console.log('the slide            : ' + frames + ' frames from 14 squares out to centred, ' +
      subTile + ' of them part way across a tile, never past either end');

    /* --- off the screen: one order and it comes all the way home ------ */
    ctx.G.drag = { dx: 14, dy: 6 };
    ctx.CAM_AT.x = 14; ctx.CAM_AT.y = 6;
    if (ctx.playerShown(14, 6)) problems.push('the player counts as on screen 14 squares off');
    ctx.camSaw();
    ctx.camFollow();
    if (ctx.G.drag)
      problems.push('an order with the player off screen left the view at ' +
        ctx.G.drag.dx + ',' + ctx.G.drag.dy + ' instead of bringing it home');

    /* And that first order is spent on the view: the player does not
       take the step, because a step you cannot watch is a step into
       whatever happens to be standing there. */
    {
      const start = { x: P.x, y: P.y };
      ctx.L.mons.length = 0; P.frozen = 0; P.held = 0; P.conf = 0; P.runSteps = 0;
      /* a direction there is actually floor in, so the second press has
         somewhere to take him */
      const keys = { ArrowRight: [1, 0], ArrowLeft: [-1, 0],
                     ArrowUp: [0, -1], ArrowDown: [0, 1] };
      let key = null;
      for (const k of Object.keys(keys))
        if (ctx.walkable(P.x + keys[k][0], P.y + keys[k][1])) { key = k; break; }
      if (!key) problems.push('nowhere to step from where the player is standing');
      ctx.G.drag = { dx: 14, dy: 6 };
      ctx.CAM_AT.x = 14; ctx.CAM_AT.y = 6;
      ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.dead = 0;
      ctx.playKey(key);
      if (P.x !== start.x || P.y !== start.y)
        problems.push('an arrow key with the player off screen moved him as well as the view');
      if (ctx.G.drag) problems.push('an arrow key off screen did not bring the view home');
      /* the picture is still out there, so there is a slide to watch */
      const slip = ctx.camSlip();
      if (!slip.x && !slip.y)
        problems.push('the view snapped home with no slide to watch');
      /* and once it is home the next press walks him */
      let frames = 0;
      while ((ctx.camSlip().x || ctx.camSlip().y) && frames < 400) { ctx.camEase(); frames++; }
      ctx.playKey(key);
      if (P.x === start.x && P.y === start.y)
        problems.push('the order after the view came home did not move the player');
      P.x = start.x; P.y = start.y;
      ctx.computeVis();
      /* a click on the map is the same order by another hand.  Shove
         the view far enough that he is off the screen, and with the
         floor known so there is certainly something in view - but which
         way to shove depends on where the floor is, since near the edge
         of the map a shove can put the whole view into the rock. */
      for (let i = 0; i < ctx.L.flags.length; i++)
        if (ctx.L.tiles[i] !== ctx.ROCK) ctx.L.flags[i] |= ctx.F_SEEN;
      let OFF = null, target = null;
      for (const cand of [{ x: (ctx.VIEW_W >> 1) + 1, y: 0 },
                          { x: -((ctx.VIEW_W >> 1) + 1), y: 0 },
                          { x: 0, y: (ctx.VIEW_H >> 1) + 1 },
                          { x: 0, y: -((ctx.VIEW_H >> 1) + 1) }]) {
        if (ctx.playerShown(cand.x, cand.y)) continue;
        const cx2 = P.x - (ctx.VIEW_W >> 1) + cand.x, cy2 = P.y - (ctx.VIEW_H >> 1) + cand.y;
        for (let gx = 0; gx < ctx.VIEW_W && !target; gx++)
          for (let gy = 0; gy < ctx.VIEW_H; gy++) {
            const tx = cx2 + gx, ty = cy2 + gy;
            if (tx < 0 || ty < 0 || tx >= ctx.MAP_W || ty >= ctx.MAP_H) continue;
            if (!ctx.walkable(tx, ty)) continue;
            if (!(ctx.L.flags[ty * ctx.MAP_W + tx] & ctx.F_SEEN)) continue;
            /* somewhere there is actually a way to - the whole floor was
               marked known above, vaults included, and a click on a
               walled in one is rightly answered with "you can't go
               there" */
            const road = ctx.findPath(tx, ty, {});
            if (!road || !road.length) continue;
            target = { gx, gy }; break;
          }
        if (target) { OFF = cand; break; }
      }
      if (OFF) {
        ctx.G.drag = { dx: OFF.x, dy: OFF.y };
        ctx.CAM_AT.x = OFF.x; ctx.CAM_AT.y = OFF.y;
        ctx.G.walk = null;
        ctx.MOUSE.on = 1;
        /* the game only answers the pointer when the pointer is what you
           are using, and the last thing pressed here was a key */
        ctx.LAST_INPUT = 'mouse';
        ctx.MOUSE.x = ctx.VIEW_PX + target.gx * TS + 3;
        ctx.MOUSE.y = ctx.VIEW_PY + target.gy * TS + 3;
        const under = ctx.mouseTile();
        if (!under) problems.push('no square under the pointer for the off-screen click');
        const wasAt = { x: P.x, y: P.y };
        ctx.mapClick(ctx.MOUSE.x, ctx.MOUSE.y, false);
        if (ctx.G.walk) problems.push('a click with the player off screen set a walk going');
        if (ctx.G.drag) problems.push('a click off screen did not bring the view home');
        if (P.x !== wasAt.x || P.y !== wasAt.y)
          problems.push('a click with the player off screen moved him');
        /* the square is kept, not the place on the screen */
        if (!ctx.G.waiting) problems.push('the click was thrown away instead of remembered');
        else if (ctx.G.waiting.x !== under.x || ctx.G.waiting.y !== under.y)
          problems.push('the wrong square was remembered');

        /* nothing happens while the view is still travelling */
        let held = 0;
        for (let f = 0; f < 400 && (ctx.camSlip().x || ctx.camSlip().y); f++) {
          ctx.camWaiting();
          if (ctx.G.walk || P.x !== wasAt.x || P.y !== wasAt.y) { held = 1; break; }
          ctx.camEase();
        }
        if (held) problems.push('the remembered click was acted on before the view arrived');

        /* and the moment it lands, the order is carried out */
        ctx.camWaiting();
        if (ctx.G.waiting) problems.push('the click was still waiting after the view arrived');
        const off = ctx.G.walk || P.x !== wasAt.x || P.y !== wasAt.y;
        if (!off) problems.push('the remembered click was never acted on');

        /* a step of your own instead drops it */
        ctx.G.walk = null; P.x = wasAt.x; P.y = wasAt.y;
        ctx.G.drag = { dx: OFF.x, dy: OFF.y };
        ctx.CAM_AT.x = OFF.x; ctx.CAM_AT.y = OFF.y;
        ctx.mapClick(ctx.MOUSE.x, ctx.MOUSE.y, false);
        if (!ctx.G.waiting) problems.push('the second off-screen click was not remembered');
        ctx.playKey(key);
        if (ctx.G.waiting) problems.push('a key press did not drop the waiting click');
        ctx.G.waiting = null; ctx.G.walk = null;
        P.x = wasAt.x; P.y = wasAt.y;
      } else {
        /* silently skipping is how a check proves nothing for months */
        problems.push('no way to shove the view off the player with floor still in it');
      }
      console.log('shoved off screen    : the first order spends itself bringing the view ' +
        'home over ' + frames + ' frames, and the next one walks - by key or by click');
      ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
    }

    /* --- on screen: the map holds still and you walk to the middle ---- */
    /* Where the world is actually drawn, in pixels.  Working it through:
       a tile is put down at VIEW_PX + (mx - camx) * TS with
       camx = P - half + target, and the whole map is then shifted by
       camSlip, which is (target - CAM_AT) * TS.  The target cancels, and
       what is left is that the world is drawn at -(P + CAM_AT) * TS.
       So the map has moved if and only if P + CAM_AT has changed - which
       is the sum the offset alone cannot see, and the reason the first
       go at this looked right and played jerky. */
    const worldPx = () => ({ x: -(P.x + ctx.CAM_AT.x) * TS, y: -(P.y + ctx.CAM_AT.y) * TS });

    const walk = (sdx, sdy, from) => {
      ctx.G.drag = { dx: from.dx, dy: from.dy };
      ctx.CAM_AT.x = from.dx; ctx.CAM_AT.y = from.dy;
      ctx.camSaw();
      const before = worldPx();
      P.x += sdx; P.y += sdy;
      ctx.camFollow();
      const after = worldPx();
      /* and it must still be there once the easing has had its say: a
         picture that is a tile from its target slides back over the next
         few frames, which is the jerk itself */
      let drift = 0;
      for (let f = 0; f < 30; f++) {
        ctx.camEase();
        const now = worldPx();
        drift = Math.max(drift, Math.abs(now.x - after.x), Math.abs(now.y - after.y));
      }
      const d = ctx.G.drag || { dx: 0, dy: 0 };
      P.x -= sdx; P.y -= sdy;
      return { moved: { x: after.x - before.x, y: after.y - before.y }, drift: drift, off: d };
    };

    /* Three squares left of centre, stepping right: towards the middle.
       The map must not move by so much as a pixel, now or over the
       frames that follow. */
    let r = walk(1, 0, { dx: 3, dy: 0 });
    if (r.moved.x !== 0 || r.moved.y !== 0)
      problems.push('walking towards the middle moved the map ' + r.moved.x + 'px');
    if (r.drift !== 0)
      problems.push('walking towards the middle left the map sliding ' + r.drift + 'px afterwards');
    if (r.off.dx !== 2)
      problems.push('a step towards the middle left the view ' + r.off.dx + ' off, not 2');

    /* stepping away: the map goes with you, one square, and settles */
    r = walk(-1, 0, { dx: 3, dy: 0 });
    if (r.moved.x !== TS)
      problems.push('walking away from the middle moved the map ' + r.moved.x + 'px, not ' + TS);
    if (r.drift !== 0)
      problems.push('walking away from the middle left the map sliding afterwards');
    if (r.off.dx !== 3)
      problems.push('a step away from the middle changed the offset to ' + r.off.dx);

    /* a step along the other axis pulls nothing home */
    r = walk(0, 1, { dx: 3, dy: 0 });
    if (r.off.dx !== 3)
      problems.push('a step that was not towards the middle still pulled the view home');

    /* both axes at once, and still not a pixel of movement */
    r = walk(1, -1, { dx: 2, dy: -2 });
    if (r.moved.x !== 0 || r.moved.y !== 0)
      problems.push('a step towards the middle both ways moved the map ' +
        r.moved.x + ',' + r.moved.y + 'px');
    if (r.drift !== 0) problems.push('a diagonal step towards the middle left the map sliding');
    if (r.off.dx !== 1 || r.off.dy !== -1)
      problems.push('a diagonal step left the view at ' + r.off.dx + ',' + r.off.dy);

    /* walking towards the middle centres you, and the map never stirs */
    ctx.G.drag = { dx: 3, dy: 0 }; ctx.CAM_AT.x = 3; ctx.CAM_AT.y = 0;
    ctx.camSaw();
    let steps = 0, stirred = 0;
    const home0 = worldPx();
    while (ctx.G.drag && steps < 10) {
      P.x += 1; ctx.camFollow(); steps++;
      for (let f = 0; f < 10; f++) ctx.camEase();
      if (worldPx().x !== home0.x) stirred++;
    }
    P.x -= steps;
    if (ctx.G.drag) problems.push('walking towards the middle never centred the view');
    if (steps !== 3) problems.push('it took ' + steps + ' steps to cross 3 squares');
    if (stirred) problems.push('the map moved on ' + stirred + ' of ' + steps +
      ' steps towards the middle');
    console.log('walking home         : three steps to centred and the map never moves a ' +
      'pixel; step away and it follows you one square');

    /* --- anywhere on screen is on screen ------------------------------ */
    /* Shoved until he sits against the border but still inside it, the
       next order must not haul the view back to centre.  It used to want
       him two squares clear of the edge. */
    {
      const edgeDx = half;                 /* screen column 0: the far left */
      if (!ctx.playerShown(edgeDx, 0))
        problems.push('the player against the left border does not count as on screen');
      if (ctx.playerShown(edgeDx + 1, 0))
        problems.push('a player one square off the left border counts as on screen');
      const edgeDy = halfY;
      if (!ctx.playerShown(0, edgeDy))
        problems.push('the player against the top border does not count as on screen');
      /* and the far corner in, which is the last square of the view */
      if (!ctx.playerShown(half - (ctx.VIEW_W - 1), halfY - (ctx.VIEW_H - 1)))
        problems.push('the bottom right corner of the view does not count as on screen');
      /* an order there holds the view where it is */
      ctx.G.drag = { dx: edgeDx, dy: 0 };
      ctx.CAM_AT.x = edgeDx; ctx.CAM_AT.y = 0;
      ctx.camSaw();
      ctx.camFollow();
      if (!ctx.G.drag || ctx.G.drag.dx !== edgeDx)
        problems.push('an order with the player on the border centred him anyway');
      console.log('at the border        : still on screen, and the view is left where it is');
    }

    ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.CAM_SEEN = null;
  }

  /* --- a sliding map is drawn all the way across ---------------------- */
  {
    const P = ctx.P, L = ctx.L, TS = ctx.TS, MAP_W = ctx.MAP_W;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.pan = null; ctx.G.ctx = null;
    ctx.G.dead = 0; ctx.MOUSE.held = null; L.mons.length = 0;
    /* the whole floor known, so anything missing is the drawing's doing
       and not the dark */
    for (let i = 0; i < L.flags.length; i++)
      if (L.tiles[i] !== ctx.ROCK) L.flags[i] |= ctx.F_SEEN;
    ctx.computeVis();

    /* Every square of the map area whose ground ought to be drawn, and
       is not.  Where the picture is shifted, the tile that lands under a
       given square of screen is worked out from the shift - so this asks
       the exact question however far the map has slid, and does not care
       how much rock happens to be in view. */
    const bare = () => {
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const slip = ctx.camSlip();
      const camx = P.x - (ctx.VIEW_W >> 1) + (ctx.G.drag ? ctx.G.drag.dx : 0);
      const camy = P.y - (ctx.VIEW_H >> 1) + (ctx.G.drag ? ctx.G.drag.dy : 0);
      const painted = [];
      for (const b of blits)
        if (b.tag === 'screen' && b.from === 'atlas') painted.push(b);
      let out = 0;
      for (let gx = 0; gx < ctx.VIEW_W; gx++) for (let gy = 0; gy < ctx.VIEW_H; gy++) {
        const px = ctx.VIEW_PX + gx * TS, py = ctx.VIEW_PY + gy * TS;
        const mx = camx + Math.floor((gx * TS - slip.x) / TS);
        const my = camy + Math.floor((gy * TS - slip.y) / TS);
        if (mx < 0 || my < 0 || mx >= MAP_W || my >= ctx.MAP_H) continue;
        const f = L.flags[my * MAP_W + mx];
        if (!(f & ctx.F_SEEN) || L.tiles[my * MAP_W + mx] === ctx.ROCK) continue;
        if (!painted.some(b => b.dx <= px && b.dx + b.dw > px &&
                               b.dy <= py && b.dy + b.dh > py)) out++;
      }
      return out;
    };

    /* settled, nothing may be missing - which also says the sum above is
       the right sum */
    ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
    const still = bare();
    if (still) problems.push(still + ' squares of known floor are not drawn even standing still');

    /* Shoved half a screen and told to come home.  Only one extra row
       and column used to be drawn beyond the edges, however far the
       picture was shifted, so most of the map area went bare and the map
       went black exactly when you wanted to watch it travel. */
    ctx.G.drag = { dx: 9, dy: 4 };
    ctx.CAM_AT.x = 9; ctx.CAM_AT.y = 4;
    const sitting = bare();
    if (sitting) problems.push(sitting + ' squares bare with the view shoved but settled');
    ctx.G.drag = null;                        /* the order that sends it home */
    let frames = 0, worst = 0;
    while ((ctx.camSlip().x || ctx.camSlip().y) && frames < 400) {
      worst = Math.max(worst, bare());
      ctx.camEase(); frames++;
    }
    worst = Math.max(worst, bare());
    if (worst)
      problems.push('mid-slide ' + worst + ' squares of known floor go bare - the shift ' +
        'outruns what is drawn');
    console.log('sliding home         : nine squares out to centred over ' + frames +
      ' frames, and not one square of known floor goes bare on the way');
    ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
  }

  /* --- what you threw at is still there while it is in the air -------- */
  {
    const P = ctx.P, L = ctx.L, MAP_W = ctx.MAP_W;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.drag = null; ctx.G.pan = null;
    ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.G.dead = 0;
    L.mons.length = 0; P.blind = 0; P.hp = P.mhp = 900;
    ctx.computeVis();

    /* somewhere in sight to stand it, and a square out of sight to send
       it to - the step it takes on the turn your stone is still flying */
    let here = null, gone = null;
    for (const [dx, dy] of ctx.DIR4) {
      const x = P.x + dx * 2, y = P.y + dy * 2;
      if (!ctx.walkable(x, y)) continue;
      if (!(L.flags[y * MAP_W + x] & ctx.F_VIS)) continue;
      here = { x, y }; break;
    }
    for (let y = 1; y < ctx.MAP_H - 1 && !gone; y++) for (let x = 1; x < MAP_W - 1; x++)
      if (ctx.walkable(x, y) && !(L.flags[y * MAP_W + x] & ctx.F_VIS)) { gone = { x, y }; break; }

    if (!here || !gone) console.log('a stone in the air   : nowhere to set the shot up');
    else {
      const m = ctx.mkMonster('O', 5, here.x, here.y);
      m.hp = m.mhp = 900; m.state = 2;
      L.mons.push(m);
      const drawn = () => {
        blits = []; fills = [];
        vm.runInContext('render();', ctx);
        const cell = ctx.ATLAS.index['mon_' + m.c];
        const sx = (cell % ctx.ATLAS.cols) * 8, sy = ((cell / ctx.ATLAS.cols) | 0) * 8;
        return blits.some(b => b.tag === 'screen' && b.from === 'atlas' &&
          b.sx === sx && b.sy === sy);
      };
      if (!drawn()) problems.push('a creature standing in plain sight is not drawn');

      /* It takes its step on this turn, but the step is played back a
         moment from now - the stone is still crossing the room. */
      const RealDate = ctx.Date, T0 = RealDate.now();
      m.anim = [[m.x, m.y, gone.x, gone.y, T0 + 400]];
      m.x = gone.x; m.y = gone.y;
      ctx.Date = { now: () => T0 };           /* the stone is still in the air */
      const whileFlying = drawn();
      ctx.Date = { now: () => T0 + 900 };     /* well after it has walked off */
      const afterLanding = drawn();
      ctx.Date = RealDate;
      m.anim = null;

      if (!whileFlying)
        problems.push('it vanished the instant the turn was worked out, ' +
          'while the stone was still in the air');
      if (afterLanding)
        problems.push('it is still drawn after it has walked out of sight');
      console.log('a stone in the air   : what you threw at is still there while the ' +
        'stone flies, and gone once it has walked away');
      L.mons.length = 0;
    }
  }

  /* --- a finger works the same controls, without the arrow ------------ */
  {
    const P = ctx.P, L = ctx.L, TS = ctx.TS;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.drag = null; ctx.G.pan = null;
    ctx.G.ctx = null; ctx.G.waiting = null; ctx.G.dead = 0;
    ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.MOUSE.held = null;
    L.mons.length = 0; P.hp = P.mhp = 900; P.blind = 0;
    ctx.computeVis();

    if (!canvasListeners.touchstart) problems.push('the canvas does not listen for touches');
    else {
      /* the canvas is drawn at three device pixels to one of ours */
      const at = (bx, by) => ({ clientX: 3 * bx, clientY: 3 * by,
                                identifier: 1, preventDefault() { this.stopped = 1; } });
      const touch = (name, bx, by) => {
        const t = at(bx, by);
        canvasListeners[name]({ touches: name === 'touchend' ? [] : [t],
                                changedTouches: [t],
                                preventDefault() { this.stopped = 1; } });
      };
      const drawn = (sprite) => {
        blits = []; fills = [];
        vm.runInContext('render();', ctx);
        const cell = ctx.ATLAS.index[sprite];
        const sx = (cell % ctx.ATLAS.cols) * 8, sy = ((cell / ctx.ATLAS.cols) | 0) * 8;
        return blits.some(b => b.tag === 'screen' && b.from === 'atlas' &&
          b.sx === sx && b.sy === sy);
      };

      /* somewhere two squares off to tap on */
      let dest = null;
      for (const [dx, dy] of ctx.DIR4) {
        const tx = P.x + dx * 2, ty = P.y + dy * 2;
        if (ctx.walkable(tx, ty) && !ctx.monAt(L, tx, ty) &&
            (L.flags[ty * ctx.MAP_W + tx] & ctx.F_SEEN)) { dest = { x: tx, y: ty }; break; }
      }
      if (!dest) problems.push('nowhere two squares off to tap on');
      else {
        const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
        const px = ctx.VIEW_PX + (dest.x - camx) * TS + 3;
        const py = ctx.VIEW_PY + (dest.y - camy) * TS + 3;

        /* a tap is a click: it sets a walk going */
        touch('touchstart', px, py);
        touch('touchend', px, py);
        if (!ctx.G.walk) problems.push('a tap on a square started no walk');
        ctx.G.walk = null;

        /* and it leaves no arrow on the screen */
        touch('touchstart', px, py);
        if (drawn('mouse')) problems.push('the pointer is drawn for a finger');
        touch('touchend', px, py);
        ctx.G.walk = null;
        if (ctx.usingMouse()) problems.push('a finger counts as a mouse');
        if (!ctx.usingPointer()) problems.push('a finger does not count as a pointer');
        /* the pack is still reachable, or a finger cannot open the bag */
        if (!drawn('pouch')) problems.push('no pack icon for a finger to tap');

        /* move a real mouse and the arrow comes back */
        canvasListeners.mousemove({ clientX: 3 * px, clientY: 3 * py });
        if (!ctx.usingMouse()) problems.push('moving a mouse did not bring the mouse back');
        if (!drawn('mouse')) problems.push('the pointer is not drawn for a mouse');

        /* a finger dragged across the map pushes the map, and walks nowhere */
        ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.G.walk = null;
        const was = { x: P.x, y: P.y };
        touch('touchstart', px, py);
        touch('touchmove', px + 20, py);
        if (!ctx.G.drag) problems.push('dragging a finger did not push the map');
        touch('touchend', px + 20, py);
        if (ctx.G.walk) problems.push('a finger drag started a walk');
        if (P.x !== was.x || P.y !== was.y) problems.push('a finger drag moved the player');
        ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;

        /* a press held still is the right button: it opens the menu */
        const RealDate = ctx.Date, T0 = RealDate.now();
        ctx.G.mode = 'play'; ctx.G.ctx = null; ctx.G.walk = null;
        ctx.Date = { now: () => T0 };
        touch('touchstart', px, py);
        ctx.touchHold();
        if (ctx.G.mode === 'ctx') problems.push('a press became the right button at once');
        ctx.Date = { now: () => T0 + ctx.TOUCH_HOLD_MS + 20 };
        ctx.touchHold();
        ctx.Date = RealDate;
        if (ctx.G.mode !== 'ctx')
          problems.push('a press held still did not open the menu, mode is ' + ctx.G.mode);
        /* and letting go afterwards must not also count as a tap */
        const wasMode = ctx.G.mode;
        touch('touchend', px, py);
        if (ctx.G.mode !== wasMode)
          problems.push('letting go after a long press counted as a tap as well');
        ctx.G.ctx = null; ctx.G.mode = 'play'; ctx.G.walk = null;
        console.log('a finger             : taps walk, drags push the map, a held press ' +
          'is the right button - and no arrow is drawn until a mouse moves');
      }
    }
    ctx.MOUSE.held = null; ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
  }

  /* --- the flagstones the map actually lays ---------------------------- */
  {
    const L = ctx.L, P = ctx.P, TS = ctx.TS, MAP_W = ctx.MAP_W;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.drag = null; ctx.G.pan = null;
    ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.MOUSE.held = null;
    L.mons.length = 0; L.items.length = 0;
    ctx.computeVis();

    /* Counting what floorSprite returns proves nothing about the map:
       the tile loop had a pattern of its own, two stones in stripes with
       floor3 never laid at all, and the check that was here asked the
       function rather than the picture. */
    const cellOf = (n) => {
      const i = ctx.ATLAS.index[n];
      return [(i % ctx.ATLAS.cols) * 8, ((i / ctx.ATLAS.cols) | 0) * 8];
    };
    const stones = ['floor', 'floor2', 'floor3'].map(cellOf);
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    const laid = [0, 0, 0];
    for (const b of blits) {
      if (b.tag !== 'screen' || b.from !== 'atlas') continue;
      for (let k = 0; k < 3; k++)
        if (b.sx === stones[k][0] && b.sy === stones[k][1]) laid[k]++;
    }
    const total = laid[0] + laid[1] + laid[2];
    if (total < 40) problems.push('only ' + total + ' flagstones drawn - too few to judge');
    else {
      for (let k = 0; k < 3; k++) {
        const pc = Math.round(100 * laid[k] / total);
        if (!laid[k]) problems.push('flagstone ' + k + ' is never laid on the map');
        else if (pc < 20) problems.push('flagstone ' + k + ' is only ' + pc + '% of the floor');
      }
      /* and no stripes: the stone on a square must not be settled by its
         column alone, which is what an (x*3+y*5) pattern comes to */
      let sameAsLeft = 0, pairs = 0;
      for (let y = 1; y < ctx.MAP_H - 1; y++)
        for (let x = 2; x < MAP_W - 1; x++) {
          if (L.tiles[y * MAP_W + x] !== ctx.FLOOR) continue;
          if (L.tiles[y * MAP_W + x - 1] !== ctx.FLOOR) continue;
          pairs++;
          if (ctx.floorSprite(x, y) === ctx.floorSprite(x - 1, y)) sameAsLeft++;
        }
      if (pairs > 200) {
        const pc = Math.round(100 * sameAsLeft / pairs);
        if (pc > 45) problems.push('neighbouring squares share a flagstone ' + pc +
          '% of the time - the stones run in stripes');
      }
      console.log('flagstones on the map: ' +
        laid.map(n => Math.round(100 * n / total) + '%').join('/') + ' of ' + total +
        ' drawn, all three laid');
    }
  }

  /* --- the right-click menu opens beside the pointer -------------------- */
  {
    const P = ctx.P, TS = ctx.TS;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.pan = null; ctx.G.ctx = null;
    ctx.MOUSE.held = null;

    /* Where the menu's own panel is drawn.  Not its yellow frame: the
       square under the pointer is framed in the same yellow, and looking
       for that colour finds the hover frame sitting exactly on the
       pointer whatever the menu is doing - which is a check that can
       never fail. */
    const menuBox = () => {
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      /* small enough to be a menu and not the screen behind it, which
         is painted in the same colour */
      const panel = fills.filter(f => f.col === '#0b0d1c' &&
        f.w > 20 && f.w < ctx.SW - 40 && f.h > 6 && f.h < ctx.SH - 40);
      if (!panel.length) return null;
      panel.sort((a, b) => b.w * b.h - a.w * a.h);
      return { x: panel[0].x, y: panel[0].y };
    };

    /* Opened with the map where it started, and again with the map
       shoved a long way: the menu must land beside the pointer both
       times.  It used to be anchored to the square by working the camera
       out from the player alone, so a dragged map put it elsewhere. */
    const put = (drag) => {
      ctx.G.drag = drag ? { dx: drag, dy: drag } : null;
      ctx.CAM_AT.x = drag || 0; ctx.CAM_AT.y = drag || 0;
      ctx.G.ctx = null; ctx.G.mode = 'play';
      ctx.LAST_INPUT = 'mouse';
      ctx.MOUSE.on = 1;
      ctx.MOUSE.x = ctx.VIEW_PX + 6 * TS + 2;
      ctx.MOUSE.y = ctx.VIEW_PY + 4 * TS + 2;
      const sq = ctx.mouseTile();
      if (!sq) return null;
      ctx.openCtxMenu(sq.x, sq.y);
      return menuBox();
    };
    const still = put(0), shoved = put(7);
    if (!still || !shoved) problems.push('the right-click menu was not drawn');
    else {
      const near = (b) => Math.abs(b.x - ctx.MOUSE.x) <= TS + 4 &&
                          Math.abs(b.y - ctx.MOUSE.y) <= TS + 4;
      if (!near(still))
        problems.push('with the map where it started the menu opened at ' +
          still.x + ',' + still.y + ' and the pointer was at ' +
          ctx.MOUSE.x + ',' + ctx.MOUSE.y);
      if (!near(shoved))
        problems.push('with the map shoved the menu opened at ' + shoved.x + ',' +
          shoved.y + ' and the pointer was at ' + ctx.MOUSE.x + ',' + ctx.MOUSE.y);
      console.log('the right-click menu : opens beside the pointer, map shoved or not');
    }
    ctx.G.ctx = null; ctx.G.mode = 'play';
    ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
  }

  /* --- two fingers on a trackpad push the map --------------------------- */
  {
    const P = ctx.P, TS = ctx.TS;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.pan = null; ctx.G.ctx = null;
    ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.MOUSE.held = null;
    if (!canvasListeners.wheel) problems.push('the canvas does not listen for scrolling');
    else {
      const was = { x: P.x, y: P.y };
      const wheel = (dx, dy) => canvasListeners.wheel({ deltaX: dx, deltaY: dy,
        deltaMode: 0, preventDefault() { } });
      /* the world is drawn at -(P + CAM_AT) tiles, so this is what moves */
      const worldAt = () => ({ x: -(P.x + ctx.CAM_AT.x), y: -(P.y + ctx.CAM_AT.y) });
      const before = worldAt();
      wheel(0, 3 * TS);
      const down = worldAt();
      if (down.y === before.y) problems.push('scrolling down did not move the map');
      if (down.x !== before.x) problems.push('scrolling down moved the map sideways');
      wheel(2 * TS, 0);
      const side = worldAt();
      if (side.x === down.x) problems.push('scrolling sideways did not move the map');
      if (P.x !== was.x || P.y !== was.y) problems.push('scrolling moved the player');
      if (ctx.G.walk) problems.push('scrolling started a walk');
      /* a pixel of scrolling is a pixel of map, not a whole square */
      ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
      wheel(0, 1);
      const fine = Math.abs(ctx.CAM_AT.y);
      if (!(fine > 0 && fine < 1))
        problems.push('one pixel of scrolling moved the view ' + fine + ' squares');
      console.log('two fingers          : scrolling pushes the map, a pixel at a time, ' +
        'and walks nowhere');
    }
    ctx.G.drag = null; ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0;
  }

  /* --- a click takes the stairs, and a second step is a quick one ------ */
  {
    const P = ctx.P, L = ctx.L, TS = ctx.TS, MAP_W = ctx.MAP_W;
    ctx.G.mode = 'play'; ctx.G.walk = null; ctx.G.drag = null; ctx.G.pan = null;
    ctx.G.ctx = null; ctx.G.waiting = null; ctx.G.dead = 0;
    ctx.CAM_AT.x = 0; ctx.CAM_AT.y = 0; ctx.MOUSE.held = null;
    L.mons.length = 0; P.hp = P.mhp = 900; P.blind = 0;

    /* stand on the way down and click it: no keyboard anywhere */
    const st = L.stair;
    if (!st) problems.push('this floor has no way down');
    else {
      P.x = st.x; P.y = st.y;
      ctx.computeVis();
      ctx.LAST_INPUT = 'mouse'; ctx.MOUSE.on = 1;
      const camx = P.x - (ctx.VIEW_W >> 1), camy = P.y - (ctx.VIEW_H >> 1);
      ctx.MOUSE.x = ctx.VIEW_PX + (st.x - camx) * TS + 3;
      ctx.MOUSE.y = ctx.VIEW_PY + (st.y - camy) * TS + 3;
      const under = ctx.mouseTile();
      if (!under || under.x !== st.x || under.y !== st.y)
        problems.push('the pointer is not over the staircase');
      else {
        const was = ctx.G.depth;
        ctx.mapClick(ctx.MOUSE.x, ctx.MOUSE.y, false);
        if (ctx.G.depth === was)
          problems.push('clicking the staircase you are standing on did not use it');
        else console.log('taking the stairs    : a click uses them - depth ' + was +
          ' to ' + ctx.G.depth + ', no keyboard needed');
      }
    }
    ctx.G.walk = null; ctx.G.mode = 'play';
  }

  /* --- a creature that moves twice hurries the second step ------------- */
  {
    const L = ctx.L, P = ctx.P;
    ctx.G.mode = 'play'; ctx.G.dead = 0; L.mons.length = 0;
    P.hp = P.mhp = 90000; P.blind = 0;
    ctx.computeVis();
    let spot = null;
    for (const [dx, dy] of ctx.DIR4) {
      const x = P.x + dx * 3, y = P.y + dy * 3;
      if (ctx.walkable(x, y) && !ctx.monAt(L, x, y)) { spot = { x, y }; break; }
    }
    if (!spot) console.log('a second step        : nowhere to set one up');
    else {
      const m = ctx.mkMonster('O', 5, spot.x, spot.y);
      m.hp = m.mhp = 90000; m.state = 2; m.hasted = 20;
      L.mons.push(m);
      ctx.G.beat = 0;
      m.anim = null;
      ctx.monstersMove();
      const steps = m.anim || [];
      if (steps.length < 2)
        console.log('a second step        : it did not take two this turn');
      else {
        /* the sixth number on each step is how long it takes to cross */
        const first = steps[0][5] || ctx.MOVE_ANIM_MS;
        const second = steps[1][5] || ctx.MOVE_ANIM_MS;
        if (first !== ctx.MOVE_ANIM_MS)
          problems.push('the first step of a turn takes ' + first + 'ms, not the usual ' +
            ctx.MOVE_ANIM_MS);
        if (second !== Math.round(ctx.MOVE_ANIM_MS * ctx.EXTRA_STEP))
          problems.push('the second step takes ' + second + 'ms, not half of ' +
            ctx.MOVE_ANIM_MS);
        /* and it starts sooner than a full beat after the first */
        const gap = steps[1][4] - steps[0][4];
        if (gap >= ctx.BEAT_STEP)
          problems.push('the second step waits ' + gap + 'ms, a whole beat');
        console.log('a second step        : first ' + first + 'ms, second ' + second +
          'ms, ' + gap + 'ms between them');
      }
      L.mons.length = 0;
    }
  }

  /* --- the pack answers the pointer ----------------------------------- */
  {
    canvasListeners.mousemove({ clientX: 3 * 200, clientY: 3 * 60 });
    ctx.openInv();
    blits = []; fills = [];
    vm.runInContext('render();', ctx);
    const cells = ctx.HITS.filter(h => h.what === 'cell');
    if (!cells.length) problems.push('no squares on the pack screen');
    else {
      const c = cells[0];
      /* nothing under the pointer: the square is drawn plain */
      canvasListeners.mousemove({ clientX: 3 * 200, clientY: 3 * 60 });
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const plain = fills.filter(f => f.x === c.x && f.y === c.y).map(f => f.col);
      /* pointer over it: it is drawn differently */
      canvasListeners.mousemove({ clientX: 3 * (c.x + 2), clientY: 3 * (c.y + 2) });
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const lit = fills.filter(f => f.x === c.x && f.y === c.y).map(f => f.col);
      if (JSON.stringify(plain) === JSON.stringify(lit))
        problems.push('a square looks the same with the pointer over it');
      console.log('hovering a square    : ' + plain.join(',') + ' -> ' + lit.join(','));
    }
    /* a button lights up when it is pressed */
    const btns = ctx.HITS.filter(h => h.what === 'btn');
    if (!btns.length) problems.push('no buttons under the pack');
    else {
      ctx.BTN_FLASH.i = -1;
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const before = fills.filter(f => f.x === btns[0].x && f.y === ctx.BTN_Y)
        .some(f => f.col === ctx.HOVER_COL);
      ctx.BTN_FLASH.i = 0; ctx.BTN_FLASH.t = Date.now();
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      const after = fills.filter(f => f.x === btns[0].x && f.y === ctx.BTN_Y)
        .some(f => f.col === ctx.HOVER_COL);
      if (before) problems.push('a button is yellow before it is pressed');
      if (!after) problems.push('a pressed button does not light up');
      /* and it goes out again */
      ctx.BTN_FLASH.t = Date.now() - ctx.BTN_FLASH_MS - 10;
      blits = []; fills = [];
      vm.runInContext('render();', ctx);
      if (fills.filter(f => f.x === btns[0].x && f.y === ctx.BTN_Y)
            .some(f => f.col === ctx.HOVER_COL))
        problems.push('a pressed button stays lit');
      console.log('pressing a button    : lights for ' + ctx.BTN_FLASH_MS + 'ms and goes out');
      ctx.BTN_FLASH.i = -1;
    }
    ctx.closeInv();
  }

  if (problems.length) {
    console.log('\nPROBLEMS (' + problems.length + '):');
    [...new Set(problems)].slice(0, 10).forEach(p => console.log(' * ' + p));
    process.exit(1);
  }
  console.log('\nRENDER CHECKS PASSED');
}, 20);
