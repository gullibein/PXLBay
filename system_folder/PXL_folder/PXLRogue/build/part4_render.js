/* ============================================================ ROGUE-8
   Part 4 : renderer (true 320x200), inventory screen, input, main loop.
   ============================================================ */

var cv, cx, atlasImg, splashImg, fonts = {}, hurtSheet = null, dimSheet = null, ready = false;
/* The page that wraps these files names the splash screen.  Nothing else
   does - not the test harness, which loads the parts on their own - so
   the file's own name is the fallback rather than a crash at boot. */
if (typeof SPLASH_PNG === 'undefined') var SPLASH_PNG = 'PXLRogue_splash.png';
/* One pre-faded copy of the sheet per shade the map is drawn at, keyed by
   that shade.  A corner patch is two pixels of the *other* material laid
   over a tile, so it has to cover what is under it rather than mix with
   it - which means taking its colour from a sheet already faded to the
   same amount.  There used to be exactly one of these, faded to the
   remembered shade, and it was used for every tile that was not at full
   brightness: with a third stage of light the corners of every dimmed
   wall came out at the darkness of a wall you were only remembering. */
var fadeSheets = {};
var IX = ATLAS.index, FNT = ATLAS.font;

/* Ambient opacity.  Every drawing helper used to reset globalAlpha to 1
   when it was done, which meant nothing could fade a group of things as
   a whole.  They now compose with this instead, so withAlpha() can dim a
   whole grid while the pieces keep their own alphas. */
var ALPHA = 1;
function withAlpha(a, fn) {
  var prev = ALPHA;
  ALPHA = prev * a; cx.globalAlpha = ALPHA;
  fn();
  ALPHA = prev; cx.globalAlpha = prev;
}

/* how strongly a remembered square is drawn, and what it fades towards */
var DIM_A = 0.34, BG_COL = '#0b0d1c';

var COLS = {
  w: '#ffffff', '6': '#c3ccd9', '4': '#636d85', '3': '#3f4966', y: '#fad039',
  O: '#f59e0b', R: '#d82b2b', r: '#8a202b', G: '#93bd27', g: '#2f9e44',
  c: '#74d6e8', B: '#1f8fd8', P: '#b26ce0', p: '#6b2f9c', k: '#d29d63',
  n: '#452d1e'
};

/* inventory geometry */
var SL = 17, GAP = 2, PITCH = SL + GAP;
/* The squares sit one pixel higher than the labels above them would
   suggest.  There were two spare pixels under RH BD LH HD FT, so the
   whole grid comes up one without the labels moving and without any of
   it looking any different - and the pixel that buys, together with the
   one spare row at the very bottom, makes the buttons two pixels taller
   so their text can sit squarely in the middle of them. */
var GX = 2, MSG_Y = 1, TITLE_Y = 12, LABEL_Y = 12, GY_EQ = 20, GY_BAG = 42;
/* The wide, short buttons under the four rows of the bag.  The last row
   of squares ends at 117 and the screen is 128 tall, so there are ten
   pixels to work with and the buttons are shorter than a square. */
var BTN_H = 11, BTN_Y = GY_BAG + 3 * PITCH + SL + 1;

/* the left hand panel: a log that keeps several turns of text, and your
   stats pinned to the bottom where they never move */
var PX0 = 1;                       /* left margin inside the panel */
var LOG_Y = 2, LOG_LINE = 7, LH = 7;
var STAT_ROW = 9, STAT_COL = 39;
/* the stats block: a health meter with your purse beside it, then two
   rows of numbers underneath */
var STAT_H = 39, HP_BAR_H = 7;
/* The stats sit on the floor of the panel and everything else stacks up
   from there: flags on the very bottom line, three rows of numbers above
   them, then whatever is currently trying to kill you, then the log. */
var FLAG_Y = 0, STAT_Y = 0;        /* both fixed up from the font at boot */
var BATTLE_ROW = 9;
var LOG_W = 0;                     /* worked out from the font at boot */

/* ---------------------------------------------------------- boot */
function boot() {
  cv = document.getElementById('scr');
  cv.width = SW; cv.height = SH;
  cx = cv.getContext('2d', { alpha: false });
  cx.imageSmoothingEnabled = false;

  /* The painted title screen, a file beside the page like the sheet is.
     Nothing waits on it: if it never loads, drawTitle falls back to a
     plain dark screen and the menu works just the same. */
  splashImg = new Image();
  splashImg.src = SPLASH_PNG;

  atlasImg = new Image();
  /* The sheet is a file beside this one, not a copy welded into it: what
     is painted in spritesheet.png is what the game draws with, and there
     is nothing to rebuild after painting it. */
  atlasImg.onerror = function () {
    var box = document.getElementById('nosheet');
    if (box) box.style.display = 'flex';
  };
  atlasImg.onload = function () {
    var keys = Object.keys(COLS);
    for (var i = 0; i < keys.length; i++) fonts[keys[i]] = makeFont(COLS[keys[i]]);
    hurtSheet = makeTint('#d82b2b');
    dimSheet = makeDim();
    soundStart();
    fitBars();
    ready = true;
    newGame(true);
    requestAnimationFrame(loop);
  };
  atlasImg.src = ATLAS_PNG;

  window.addEventListener('resize', fit);
  window.addEventListener('keydown', onKey, false);
  window.addEventListener('keyup', onKeyUp, false);
  window.addEventListener('blur', onBlur, false);
  /* The mouse listens on the canvas, not the window: the pointer is only
     ours while it is over the picture. */
  cv.addEventListener('mousemove', onMouseMove, false);
  cv.addEventListener('mousedown', onMouseDown, false);
  cv.addEventListener('mouseup', onMouseUp, false);
  /* Three ways out of the picture, and all of them count: off the edge
     of the canvas, off the edge of the page, and away from the window
     altogether.  mouseout alone missed the last two. */
  cv.addEventListener('mouseout', onMouseOut, false);
  cv.addEventListener('mouseleave', onMouseOut, false);
  window.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget && !e.toElement) onMouseOut();
  }, false);
  window.addEventListener('blur', onMouseOut, false);
  /* the right button is the game's, not the browser's */
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
  /* A finger works the same controls.  Not passive: these have to be
     able to refuse the browser's own scrolling and zooming, and refusing
     them is also what stops a tap arriving a second time as a
     mouse click and lighting the arrow up. */
  cv.addEventListener('touchstart', onTouchStart, { passive: false });
  cv.addEventListener('touchmove', onTouchMove, { passive: false });
  cv.addEventListener('touchend', onTouchEnd, { passive: false });
  cv.addEventListener('touchcancel', onTouchCancel, { passive: false });
  /* two fingers on a trackpad, or a wheel: both push the map */
  cv.addEventListener('wheel', onWheel, { passive: false });
  /* the visible area is not the window on a phone: the address bar comes
     and goes, and turning it sideways changes everything */
  window.addEventListener('orientationchange', fit);
  if (window.visualViewport && window.visualViewport.addEventListener)
    window.visualViewport.addEventListener('resize', fit);
  fit();
}

/* The sheet a third time, already faded onto the background colour.

   Remembered squares are drawn at DIM_A, and a rounded corner is a two
   pixel patch of the *other* material laid over the tile.  Painting that
   patch at DIM_A blends it with the wall underneath instead of replacing
   it, so out of sight the wall showed through and the corner stopped
   looking rounded.  Blitting from this pre-faded sheet at full opacity
   lands on exactly the colour a dim tile has, and covers what is there. */
function makeFade(a) {
  var c = document.createElement('canvas');
  c.width = ATLAS.atlasW; c.height = ATLAS.atlasH;
  c.kind = 'dim'; c.tint = BG_COL; c.shade = a;
  var g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(atlasImg, 0, 0);
  /* fade towards the background, keeping the sprite's own silhouette */
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 1 - a;
  g.fillStyle = BG_COL; g.fillRect(0, 0, c.width, c.height);
  return c;
}
function makeDim() { return makeFade(DIM_A); }

/* The sheet again, in one flat colour.  Laid over a sprite at part
   opacity it reads as a hit without hiding what was struck. */
function makeTint(color) {
  var c = document.createElement('canvas');
  c.width = ATLAS.atlasW; c.height = ATLAS.atlasH;
  c.tint = color; c.kind = 'tint';
  var g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(atlasImg, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
  return c;
}

function makeFont(color) {
  var w = FNT.cols * FNT.cw, h = Math.ceil(FNT.count / FNT.cols) * FNT.ch;
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  c.tint = color; c.kind = 'font';
  var g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(atlasImg, FNT.x, FNT.y, w, h, 0, 0, w, h);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color; g.fillRect(0, 0, w, h);
  return c;
}

/* --- integer-exact upscaling: snap to whole DEVICE pixels ------------ */
/* The room there actually is.  On a phone the window is not it: the
   address bar slides in and out, and window.innerHeight goes on
   reporting the taller figure.  visualViewport is what is really
   showing. */
function viewSize() {
  var vv = window.visualViewport;
  return { w: (vv && vv.width) || window.innerWidth,
           h: (vv && vv.height) || window.innerHeight };
}
function fit() {
  var dpr = window.devicePixelRatio || 1;
  var v = viewSize();
  var s = Math.floor(Math.min(v.w * dpr / SW, v.h * dpr / SH));
  if (s < 1) s = 1;
  cv.style.width = (SW * s / dpr) + 'px';
  cv.style.height = (SH * s / dpr) + 'px';
}
/* Take the whole screen if the browser will give it.

   It only ever happens on a real gesture, because that is the only time
   a browser will grant it, and only once - a refusal is final and asking
   again every tap would be noise.  Android and the desktop honour it.
   An iPhone does not: Safari there still has no fullscreen for anything
   that is not a video, so on one of those the way to get the whole
   screen is Share -> Add to Home Screen, which the tags in the page
   head make launch without any browser furniture at all. */
var FULLSCREEN_TRIED = 0;
function goFullscreen() {
  if (FULLSCREEN_TRIED) return;
  FULLSCREEN_TRIED = 1;
  try {
    var el = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    var go = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!go) return;                    /* an iPhone: nothing to ask for */
    var r = go.call(el, { navigationUI: 'hide' });
    if (r && r.catch) r.catch(function () { });
    /* sideways is the way this is meant to be played, and a phone that
       will lock to it should */
    if (screen.orientation && screen.orientation.lock) {
      var l = screen.orientation.lock('landscape');
      if (l && l.catch) l.catch(function () { });
    }
  } catch (e) { }
}


/* ============================================================ the mouse
   The pointer is a sprite off the sheet, drawn by the game at 230x128
   like everything else - the browser's own cursor is hidden over the
   canvas.  Blown up eight times, an operating system arrow would be the
   one thing on screen that was not made of square pixels.

   Where a click lands is worked out from the canvas rectangle rather
   than from the scale factor, so it stays right through a resize, a
   zoom, and a display with a different pixel ratio. */
var MOUSE = { x: -99, y: -99, on: 0 };
/* Which device you last used.  Only two things depend on it - whether
   walking over an item picks it up, and whether the pointer is drawn -
   and both should follow the hand you actually have on the desk. */
var LAST_INPUT = 'key';

/* A real mouse, with a pointer that hovers.  Only two things want this:
   the arrow drawn off the sheet, and the highlights that follow it.  A
   finger has nothing to hover with, and a drawn arrow sitting under it
   would be a lie. */
function usingMouse() { return LAST_INPUT === 'mouse'; }
/* Something you point at squares with, finger or mouse alike.  Anything
   that asks "which square is under it" or "is there a pack to tap on"
   wants this one, or a touch device gets no pack icon, cannot click a
   square, and helps itself to everything it walks over. */
function usingPointer() { return LAST_INPUT === 'mouse' || LAST_INPUT === 'touch'; }

/* Every clickable thing registers itself as it is drawn, so a click can
   never disagree with the picture: what you see is the hit list.  It is
   emptied at the top of every frame. */
/* which button was pressed, and when, so it can be seen to go down */
var BTN_FLASH = { i: -1, t: 0 };

var HITS = [];
function hit(x, y, w, h, what, i) {
  HITS.push({ x: x, y: y, w: w, h: h, what: what, i: i });
}
function hitAt(mx, my) {
  /* last drawn is on top */
  for (var k = HITS.length - 1; k >= 0; k--) {
    var r = HITS[k];
    if (mx >= r.x && my >= r.y && mx < r.x + r.w && my < r.y + r.h) return r;
  }
  return null;
}

/* client pixels to buffer pixels */
function mousePos(e) {
  if (!cv || !cv.getBoundingClientRect) return { x: -99, y: -99 };
  var r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return { x: -99, y: -99 };
  return {
    x: Math.floor((e.clientX - r.left) * SW / r.width),
    y: Math.floor((e.clientY - r.top) * SH / r.height)
  };
}
function onMouseMove(e) {
  var m = mousePos(e);
  MOUSE.x = m.x; MOUSE.y = m.y;
  MOUSE.on = m.x >= 0 && m.y >= 0 && m.x < SW && m.y < SH;
  if (MOUSE.on) LAST_INPUT = 'mouse';
  /* Held down and moved: you are pushing the map about, not choosing a
     square.  Once it counts as a drag the button no longer means a
     click, so the view can be shoved around without walking anywhere. */
  if (!MOUSE.held) return;
  var dx = m.x - MOUSE.held.x, dy = m.y - MOUSE.held.y;
  if (!MOUSE.held.drag &&
      Math.max(Math.abs(dx), Math.abs(dy)) >= DRAG_SLOP) MOUSE.held.drag = 1;
  if (!MOUSE.held.drag) return;
  /* picking the map up again is a change of mind about where you were
     going, so whatever was waiting on the view is dropped */
  G.waiting = null;
  G.drag = G.drag || { dx: 0, dy: 0 };
  /* The map goes exactly where the hand goes.  The squares are still
     drawn on their grid - G.drag is whole tiles, and everything that
     asks which square is which uses it - but CAM_AT keeps the fraction
     left over, and the map is drawn shifted by that fraction.  So the
     picture follows the mouse a pixel at a time while every sprite still
     lands on a whole pixel.

     Rounding the offset to whole tiles here is what made a drag stutter:
     the map only moved once the hand had crossed half a square, and then
     it moved a whole one. */
  var ex = clamp(MOUSE.held.ex - dx / TS, -PAN_MAX, PAN_MAX);
  var ey = clamp(MOUSE.held.ey - dy / TS, -PAN_MAX, PAN_MAX);
  G.drag.dx = Math.round(ex);
  G.drag.dy = Math.round(ey);
  CAM_AT.x = ex; CAM_AT.y = ey;
}
function onMouseOut() {
  MOUSE.on = 0; MOUSE.x = -99; MOUSE.y = -99; MOUSE.held = null;
}

/* ============================================================== a finger
   A touch screen works the mouse's controls, because they are the same
   controls: a tap is a click, a drag pushes the map about, and a press
   held still is the right button - which is the only one of the three a
   finger has no obvious way to say.

   What it does not get is the arrow.  The pointer is drawn off the sheet
   for a mouse; under a finger it would sit where the finger already is
   and be covered by it.  Connect a real mouse to the same device and the
   first movement of it brings the arrow back, because that is what sets
   LAST_INPUT - nothing has to be sniffed or guessed. */
var TOUCH = null;
function touchPos(t) {
  if (!cv || !cv.getBoundingClientRect) return { x: -99, y: -99 };
  var r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return { x: -99, y: -99 };
  return {
    x: Math.floor((t.clientX - r.left) * SW / r.width),
    y: Math.floor((t.clientY - r.top) * SH / r.height)
  };
}
function firstTouch(e) {
  if (e.touches && e.touches.length) return e.touches[0];
  if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0];
  return null;
}
function onTouchStart(e) {
  if (e.preventDefault) e.preventDefault();     /* no scrolling, no double-tap zoom */
  if (!ready) return;
  /* a finger is a good enough reason to start the sound, and it was the
     only thing that never woke it: the wake-up hung off the keyboard */
  if (typeof soundWake === 'function') soundWake();
  goFullscreen();
  var t = firstTouch(e);
  if (!t) return;
  LAST_INPUT = 'touch';
  var m = touchPos(t);
  MOUSE.x = m.x; MOUSE.y = m.y; MOUSE.on = 1;
  TOUCH = { x: m.x, y: m.y, t: Date.now(), held: 0, id: t.identifier };
  MOUSE.held = { x: m.x, y: m.y, right: 0, drag: 0,
                 dx: (G.drag ? G.drag.dx : 0), dy: (G.drag ? G.drag.dy : 0),
                 ex: CAM_AT.x, ey: CAM_AT.y };
}
function onTouchMove(e) {
  if (e.preventDefault) e.preventDefault();
  if (!ready || !TOUCH) return;
  var t = firstTouch(e);
  if (!t) return;
  LAST_INPUT = 'touch';
  onMouseMove({ clientX: t.clientX, clientY: t.clientY });
}
function onTouchEnd(e) {
  if (e.preventDefault) e.preventDefault();
  if (!ready) { TOUCH = null; MOUSE.held = null; return; }
  var held = MOUSE.held, press = TOUCH;
  MOUSE.held = null; TOUCH = null;
  if (!press) return;
  MOUSE.on = 0;                        /* a finger stops pointing at anything */
  if (!held || held.drag) return;      /* that was a shove, not a tap */
  if (press.held) return;              /* the long press already answered it */
  MOUSE.on = 1;
  clickAt(MOUSE.x, MOUSE.y, 0);
  MOUSE.on = 0;
}
function onTouchCancel() { TOUCH = null; MOUSE.held = null; MOUSE.on = 0; }

/* ---------------------------------------------------- two fingers
   A trackpad reports two fingers sliding about as scrolling, and there
   is nothing on this page to scroll, so it pushes the map instead -
   the same shove as dragging it with the button down, given by the
   other gesture people already use for moving a picture around.  A
   wheel does the same, which is no loss: it had nothing else to do. */
var WHEEL_T = 0;
function onWheel(e) {
  if (e.preventDefault) e.preventDefault();
  if (!ready) return;
  if (!MAP_MODES[G.mode]) return;         /* no dungeon behind it to move */
  /* pixels, lines or pages - only the first is any use as it stands */
  var k = e.deltaMode === 1 ? WHEEL_LINE_PX
        : e.deltaMode === 2 ? VIEW_H * TS : 1;
  var dx = (e.deltaX || 0) * k, dy = (e.deltaY || 0) * k;
  if (!dx && !dy) return;
  /* a shove of the view is a change of mind about where you were going */
  G.waiting = null;
  WHEEL_T = Date.now();
  G.drag = G.drag || { dx: 0, dy: 0 };
  var ex = clamp(CAM_AT.x + dx / TS, -PAN_MAX, PAN_MAX);
  var ey = clamp(CAM_AT.y + dy / TS, -PAN_MAX, PAN_MAX);
  G.drag.dx = Math.round(ex);
  G.drag.dy = Math.round(ey);
  CAM_AT.x = ex; CAM_AT.y = ey;
}
function wheeling() { return Date.now() - WHEEL_T < WHEEL_HOLD_MS; }
/* A press held still on one square is the right button.  It is answered
   where it stands rather than when the finger comes up, so it is plain
   the press was heard. */
function touchHold() {
  if (!TOUCH || TOUCH.held) return;
  if (MOUSE.held && MOUSE.held.drag) return;
  if (Date.now() - TOUCH.t < TOUCH_HOLD_MS) return;
  TOUCH.held = 1;
  MOUSE.on = 1;
  clickAt(TOUCH.x, TOUCH.y, 1);
}

/* The arrow, and the arrow with a pack beside it where a click would pick
   something up.  Drawn last of all, over everything.

   Only the top-left corner of the cell is drawn: a whole 8x8 tile is the
   size of a monster, which is far too much arrow.  MOUSE_PX square is
   about the size of a real pointer against these tiles, and the rest of
   the cell is there for the pack that rides beside it. */
function drawPointer() {
  if (!MOUSE.on || !usingMouse()) return;
  var name = pointerSprite();
  sprClip(name, MOUSE.x, MOUSE.y, name === 'mouse' ? MOUSE_PX : TS, MOUSE_PX);
}
function pointerSprite() {
  var h = hitAt(MOUSE.x, MOUSE.y);
  return (h && h.what === 'pack') ? 'mouse_get' : 'mouse';
}
/* the top-left w by h pixels of a sprite, and nothing else of it */
function sprClip(name, px, py, w, h) {
  var i = IX[name]; if (i === undefined) return;
  cx.drawImage(atlasImg, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS, w, h,
    px, py, w, h);
}

/* Which map square the pointer is over, or nothing if it is not over the
   map at all.  The camera is worked out the same way drawMap works it
   out, panning included, so the frame sits on the square you can see. */
function mouseTile() {
  if (!MOUSE.on || !usingPointer()) return null;
  /* Any mode with the dungeon on screen behind it.  This used to name
     only the three quiet ones, so a click while aiming a throw found no
     square under the pointer and backed out of the throw instead of
     letting it go. */
  if (!MAP_MODES[G.mode]) return null;
  var shift = panShift();
  if (MOUSE.x < VIEW_PX - shift || MOUSE.y < VIEW_PY) return null;
  var pdx = (G.pan ? G.pan.dx : 0) + (G.drag ? G.drag.dx : 0);
  var pdy = (G.pan ? G.pan.dy : 0) + (G.drag ? G.drag.dy : 0);
  var camx = P.x - (VIEW_W >> 1) + pdx;
  var camy = P.y - (VIEW_H >> 1) + pdy;
  var mx = camx + Math.floor((MOUSE.x - VIEW_PX) / TS);
  var my = camy + Math.floor((MOUSE.y - VIEW_PY) / TS);
  if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) return null;
  return { x: mx, y: my, px: VIEW_PX + (mx - camx) * TS, py: VIEW_PY + (my - camy) * TS };
}
/* A square of the map lights up under the pointer, so it is never in
   doubt which one a click would land on. */
function drawHoverTile() {
  var m = mouseTile();
  if (!m) return;
  if (L.flags[m.y * MAP_W + m.x] & F_SEEN) {
    frame(m.px, m.py, TS, TS, HOVER_COL);
    return;
  }
  /* Past the edge of the map you know, the frame turns orange and thins
     out with every square, so how far into the dark you are pointing is
     something you can see rather than something you count.  Full at one
     square out, gone at six. */
  var d = unseenReach(m.x, m.y);
  if (d < 1 || d > UNSEEN_REACH) return;
  frameFade(m.px, m.py, TS, TS, HOVER_DARK_COL, (UNSEEN_REACH + 1 - d) / UNSEEN_REACH);
}
/* A frame drawn at less than full strength.  Not the ordinary frame with
   the alpha turned down: that one lays its top and bottom across the
   full width and then its sides across the full height, so the four
   corner pixels get painted twice and come out brighter than the lines
   they join.  Here the sides stop short of them. */
function frameFade(x, y, w, h, col, a) {
  var was = cx.globalAlpha;
  cx.globalAlpha = ALPHA * clamp(a, 0, 1);
  rect(x, y, w, 1, col);
  rect(x, y + h - 1, w, 1, col);
  rect(x, y + 1, 1, h - 2, col);
  rect(x + w - 1, y + 1, 1, h - 2, col);
  cx.globalAlpha = was;
}

/* The start of anything you do.  A keypress has always cleared the turn
   clock before acting; a click did not, so it inherited whatever was
   left of the last turn - and with several creatures on you that was a
   second or more.  Everything you killed died on time and then waited
   that long to fall over. */
function beginAction() {
  settleLog();
  G.msgq = []; G.msgIdx = 0; G.beat = 0;
}

/* A click on a menu row is the same thing as walking the cursor onto it
   and pressing ENTER, so it goes through the same key handlers rather
   than repeating what they do. */
/* The button going down starts either a click or a drag; which of the
   two it was is only known when it comes back up. */
function onMouseDown(e) {
  if (!ready) return;
  if (typeof soundWake === 'function') soundWake();
  LAST_INPUT = 'mouse';
  var m = mousePos(e);
  MOUSE.x = m.x; MOUSE.y = m.y; MOUSE.on = 1;
  if (e.preventDefault) e.preventDefault();
  MOUSE.held = { x: m.x, y: m.y, right: e.button === 2, drag: 0,
                 dx: (G.drag ? G.drag.dx : 0), dy: (G.drag ? G.drag.dy : 0),
                 /* to the fraction, so picking the map up again does not
                    snap it to the nearest square first */
                 ex: CAM_AT.x, ey: CAM_AT.y };
}
function onMouseUp(e) {
  if (!ready) return;
  var held = MOUSE.held;
  MOUSE.held = null;
  if (!held) return;
  if (e && e.preventDefault) e.preventDefault();
  /* That was a shove, not a click.  The picture is left wherever the
     hand put it, up to half a square off the grid; the frame loop eases
     it onto the grid over the next few frames, so it settles rather than
     snapping and nothing is left drawn between two pixels. */
  if (held.drag) return;
  var m = mousePos(e);
  MOUSE.x = m.x; MOUSE.y = m.y; MOUSE.on = 1;
  clickAt(m.x, m.y, held.right);
}
function clickAt(mx, my, right) {
  var h = hitAt(mx, my);
  /* the pack, wherever you are */
  if (h && h.what === 'pack' && !right) {
    if (G.mode === 'inv') closeInv(); else openInv();
    return;
  }
  switch (G.mode) {
    case 'title':
      if (!G.titleMenu) { G.titleMenu = { i: 0 }; return; }
      if (h && h.what === 'title') { G.titleMenu.i = h.i; titleKey('Enter'); }
      return;
    case 'pause':
      if (h && h.what === 'pause') { G.pause.i = h.i; pauseKey('Enter'); }
      else if (!h) pauseKey('Escape');
      return;
    case 'slots':
      if (h && h.what === 'slot') { G.slots.i = h.i; slotsKey('Enter'); }
      else if (!h) slotsKey('Escape');
      return;
    case 'hint':
      hintKey(h && h.what === 'hint' && h.i === 1 ? 'Escape' : ' ');
      return;
    case 'help':
      onKey({ key: 'Escape', preventDefault: function () { } });
      return;
    case 'perk':
      if (h && h.what === 'perk') { G.perkPick.i = h.i; perkKey('Enter'); }
      return;
    case 'ask':
      if (h && h.what === 'ask') { G.ask.i = h.i; askKey('Enter'); }
      else if (!h) askKey('Escape');
      return;
    case 'choice':
      if (h && h.what === 'choice') { G.choice.i = h.i; chooseKey('Enter'); }
      else if (!h) chooseKey('Escape');
      return;
    case 'inv':
      invClick(h, right);
      return;
    case 'ctx':
      if (h && h.what === 'ctx') { G.ctx.i = h.i; ctxKey('Enter'); }
      else G.ctx = null, G.mode = 'play';
      return;
    case 'play':
      mapClick(mx, my, right);
      return;
    /* Aiming with the mouse: the square you click is the square you meant,
       so put the cursor there and let go of it.  The right button, or a
       click off the map, backs out. */
    case 'aim': {
      if (right) { aimKey('Escape'); return; }
      var a = mouseTile();
      if (!a) { aimKey('Escape'); return; }
      G.aimSq.x = a.x; G.aimSq.y = a.y;
      aimKey('Enter');
      return;
    }
    case 'target': {
      if (right) { targetKey('Escape'); return; }
      var s2 = mouseTile();
      if (!s2) { targetKey('Escape'); return; }
      var pick = -1, q;
      for (q = 0; q < G.targets.length; q++)
        if (G.targets[q].x === s2.x && G.targets[q].y === s2.y) pick = q;
      if (pick < 0) return;                    /* nothing of yours there */
      G.tIdx = pick;
      targetKey('Enter');
      return;
    }
    case 'dir': {
      if (right) { dirKey('Escape'); return; }
      var s3 = mouseTile();
      if (!s3) { dirKey('Escape'); return; }
      /* a wand goes in one of four directions: take the one the click
         lies furthest along */
      var ddx = s3.x - P.x, ddy = s3.y - P.y;
      if (!ddx && !ddy) return;
      var key2 = Math.abs(ddx) >= Math.abs(ddy)
        ? (ddx > 0 ? 'ArrowRight' : 'ArrowLeft')
        : (ddy > 0 ? 'ArrowDown' : 'ArrowUp');
      dirKey(key2);
      return;
    }
    case 'blink': {
      if (right) { blinkKey('Escape'); return; }
      var s4 = mouseTile();
      if (!s4) { blinkKey('Escape'); return; }
      G.bl.x = s4.x; G.bl.y = s4.y;
      blinkKey('Enter');
      return;
    }
    case 'look': {
      var s5 = mouseTile();
      if (right || !s5) { lookKey('Escape'); return; }
      G.look.x = s5.x; G.look.y = s5.y;
      lookKey('Enter');
      return;
    }
  }
}

/* ------------------------------------------------- clicking the dungeon
   The left button sends you somewhere: to a square, up to a monster and
   into it, onto a thing to pick it up, onto a chest to open it.  The
   right button asks what you want done with whatever is there. */
function mapClick(mx, my, right) {
  var m = mouseTile();
  if (!m) return;
  if (G.walk) { stopWalk(null); if (!right) return; }
  if (right) { openCtxMenu(m.x, m.y); return; }
  /* Already waiting on the view?  Then this is a change of mind, and it
     is the square you asked for last that you get. */
  if (G.waiting) { G.waiting = { x: m.x, y: m.y }; return; }
  /* With yourself off the screen the view comes home first - and the
     order is kept, not thrown away, so the square you pointed at is the
     square you walk to once you can see yourself again.  Looking is
     still free: a right click is a question, not an order. */
  if (camHomeFirst()) { G.waiting = { x: m.x, y: m.y }; return; }
  mapOrder(m.x, m.y);
}
/* An order to the map, whether it was given a moment ago or is only
   being carried out now that the view has arrived.  The square is what
   is remembered, not the place on the screen: the view has moved in
   between, and the same pixel is a different square by then. */
function mapOrder(mx2, my2) {
  var m = { x: mx2, y: my2 };
  beginAction();
  if (!(L.flags[m.y * MAP_W + m.x] & F_SEEN)) {
    /* Into the dark: you cannot know there is a floor there, so you go
       as near as the map you have allows and stop. */
    var d = unseenReach(m.x, m.y);
    if (d < 1 || d > UNSEEN_REACH) return;
    var near = nearestApproach(m.x, m.y);
    if (near) walkTo(near.x, near.y, null);
    return;
  }
  /* A staircase is a thing to use, not just a square to stand on.  With
     no keyboard there was no way off the floor at all: walking onto one
     left you standing on it, and ENTER was the only thing that took it. */
  if (tileAt(m.x, m.y) === STAIR || tileAt(m.x, m.y) === STAIR_UP) {
    if (m.x === P.x && m.y === P.y) { beginAction(); tick(useStairs()); return; }
    walkTo(m.x, m.y, { stairs: 1 });
    return;
  }
  /* A locked door is a thing to go and try, not a square to stand on.
     Clicking one used to be answered with "You can't go there", which is
     true and useless: you walk over and put your hand to it instead. */
  if (tileAt(m.x, m.y) === LOCKED) {
    if (mdist({ x: m.x, y: m.y }) === 1) {
      var mv = playerMove(m.x - P.x, m.y - P.y);
      tick(mv);
      return;
    }
    walkTo(m.x, m.y, { door: { x: m.x, y: m.y } });
    return;
  }
  var foe = monAt(L, m.x, m.y);
  if (foe && canSeeMon(foe) && !foe.ally) {
    if (mdist(foe) === 1) { playerAttack(foe); tick(true); return; }
    walkTo(m.x, m.y, { foe: foe });
    return;
  }
  var it = itemAt(L, m.x, m.y);
  if (it) {
    if (m.x === P.x && m.y === P.y) { tick(handPickup()); return; }
    walkTo(m.x, m.y, { what: it.t === 'chest' ? 'open' : 'get' });
    return;
  }
  /* Clicking yourself is reaching into your own pack.  It used to be
     the one square on the map a click did nothing at all with. */
  if (m.x === P.x && m.y === P.y) { openInv(); return; }
  walkTo(m.x, m.y, null);
}

/* ------------------------------------------------- the right-click menu
   What is on the square decides what it offers.  Look is always there;
   the rest depend on what you are pointing at and what you are holding. */
function openCtxMenu(x, y) {
  var opts = [], foe = monAt(L, x, y), it = itemAt(L, x, y);
  var mine = (x === P.x && y === P.y);
  opts.push(['look', 'Look']);
  if (foe && canSeeMon(foe) && !foe.ally && !mine && canShoot())
    opts.push(['shoot', 'Shoot']);
  if (it && it.t === 'chest') opts.push(['open', 'Open']);
  else if (it) opts.push(['get', 'Take']);
  if (mine) opts.push(['inv', 'Inventory']);
  opts.push(['cancel', 'Cancel']);
  /* Where the pointer was when it was asked.  The menu used to be
     anchored to the square by working the camera out from the player
     alone, which ignores however far the map has been pushed - so once
     you had dragged the view the menu opened somewhere else entirely. */
  G.ctx = { x: x, y: y, i: 0, opts: opts, px: MOUSE.x, py: MOUSE.y };
  G.mode = 'ctx';
}
function ctxKey(k) {
  var d = keyDir(k);
  if (!G.ctx) { G.mode = 'play'; return; }
  if (k === 'Escape' || k === 'Tab') { G.ctx = null; G.mode = 'play'; return; }
  if (d && d[1]) {
    G.ctx.i = (G.ctx.i + d[1] + G.ctx.opts.length) % G.ctx.opts.length;
    return;
  }
  if (k !== 'Enter' && k !== ' ') return;
  var job = G.ctx.opts[G.ctx.i][0], x = G.ctx.x, y = G.ctx.y;
  G.ctx = null; G.mode = 'play';
  if (job === 'cancel') return;
  if (job === 'look') {
    /* Looking at yourself is opening your pack: what there is to know
       about the square you are standing on is what you are carrying. */
    if (x === P.x && y === P.y) { openInv(); return; }
    beginAction();
    var lines = lookAt(x, y), i;
    for (i = 0; i < lines.length; i++) msg(lines[i], i ? '6' : 'c');
    finishMsgs();
    return;
  }
  if (job === 'inv') { openInv(); return; }
  if (job === 'shoot') {
    var foe2 = monAt(L, x, y);
    if (!foe2 || !canSeeMon(foe2)) { msg('It is not there now.', '6'); finishMsgs(); return; }
    beginAction();
    tick(fireAt(foe2));
    return;
  }
  if (job === 'get' || job === 'open') {
    if (x === P.x && y === P.y) { beginAction(); tick(handPickup()); return; }
    walkTo(x, y, { what: job });
    return;
  }
}
function drawCtxMenu() {
  var m = G.ctx, i, wide = 0;
  for (i = 0; i < m.opts.length; i++)
    if (textW(m.opts[i][1]) > wide) wide = textW(m.opts[i][1]);
  var w = 9 + wide + 2, h = m.opts.length * LH + 4;
  /* Beside the pointer that asked, then kept on the screen.  Anchoring
     it to the square meant working out where that square is drawn, and
     that has to agree with the camera down to the drag and the pan; the
     pointer is simply where it is. */
  var sq = mouseTile();
  var atx = (m.px !== undefined) ? m.px : (sq ? sq.px : VIEW_PX);
  var aty = (m.py !== undefined) ? m.py : (sq ? sq.py : VIEW_PY);
  var ax = clamp(atx + 3, 2, SW - w - 2);
  var ay = clamp(aty + 3, 2, SH - 2 - h);
  rect(ax, ay, w, h, '#0b0d1c');
  frame(ax, ay, w, h, '#fad039');
  for (i = 0; i < m.opts.length; i++) {
    var ty = ay + 2 + i * LH;
    hit(ax, ty - 1, w, LH, 'ctx', i);
    if (i === m.i) {
      rect(ax + 1, ty - 1, w - 2, LH, '#1b2a3d');
      spr('point', ax, ty - 2, 1);
    }
    text(m.opts[i][1], ax + 9, ty, i === m.i ? 'w' : '6');
  }
}
/* The pack screen: a square, a button, or a row of the item menu. */
function invClick(h, right) {
  if (!h) { if (G.menu) closeItemMenu(); return; }
  if (h.what === 'menu') { G.menu.i = h.i; menuKey('Enter'); return; }
  if (G.menu) { closeItemMenu(); return; }
  if (h.what === 'btn') {
    (G.pouch ? G.pcur : G.cur).r = btnRow();
    (G.pouch ? G.pcur : G.cur).c = h.i;
    BTN_FLASH.i = h.i; BTN_FLASH.t = Date.now();
    pressInvButton(invButtons()[h.i][0]);
    return;
  }
  if (h.what === 'cell') {
    var cur = G.pouch ? G.pcur : G.cur;
    cur.r = h.i.r; cur.c = h.i.c;
    /* Either button asks what you want done with it.  A click used to
       act on the thing straight away, which made a stone fly the moment
       you touched it and gave a potion no way to be anything but drunk. */
    invSpace();
    return;
  }
}

/* ---------------------------------------------------------- draw prims */
function spr(name, px, py, alpha) {
  var i = IX[name]; if (i === undefined) return;
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA * alpha;
  cx.drawImage(atlasImg, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS, TS, TS, px, py, TS, TS);
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA;
}
/* the same sprite, off a tinted copy of the sheet */
function sprFrom(sheet, name, px, py, alpha) {
  var i = IX[name]; if (i === undefined || !sheet) return;
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA * alpha;
  cx.drawImage(sheet, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS, TS, TS,
    px, py, TS, TS);
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA;
}
/* The same sprite, mirrored left to right.  A creature drawn facing one
   way looks wrong walking the other, and one 8x8 cell can face both ways
   without costing a second cell on the sheet. */
function sprFlip(name, px, py, alpha) {
  var i = IX[name]; if (i === undefined) return;
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA * alpha;
  cx.save();
  cx.translate(px + TS, py);
  cx.scale(-1, 1);
  cx.drawImage(atlasImg, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS, TS, TS,
    0, 0, TS, TS);
  cx.restore();
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA;
}
/* and turned in quarter circles, clockwise, about its own middle */
function sprTurn(name, px, py, alpha, quarters) {
  var i = IX[name]; if (i === undefined) return;
  quarters = ((quarters % 4) + 4) % 4;
  if (!quarters) { spr(name, px, py, alpha); return; }
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA * alpha;
  cx.save();
  cx.translate(px + TS / 2, py + TS / 2);
  cx.rotate(quarters * Math.PI / 2);
  cx.drawImage(atlasImg, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS, TS, TS,
    -TS / 2, -TS / 2, TS, TS);
  cx.restore();
  if (alpha !== undefined && alpha !== 1) cx.globalAlpha = ALPHA;
}

function sprS(name, px, py, k) {
  var i = IX[name]; if (i === undefined) return;
  cx.drawImage(atlasImg, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS, TS, TS,
    px, py, TS * k, TS * k);
}
function sprSC(name, py, k) { sprS(name, ((SW - TS * k) / 2) | 0, py, k); }

/* The glyphs are shorter than the eight pixel line box the panels use,
   so nudge them down to sit in the middle of it rather than on the lid. */
var TPAD = 0;
function text(s, px, py, col, scale) {
  s = String(s); scale = scale || 1;
  py += TPAD * scale;
  var f = fonts[col] || fonts.w;
  var pen = px;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i) - FNT.first;
    if (c < 0 || c >= FNT.count) continue;
    /* blit exactly the glyph's own width: the cell is padded to the
       widest letter, and copying that padding would overdraw the next one */
    var gw = adv(c);
    if (c > 0 && gw > 0)                         /* space draws nothing */
      cx.drawImage(f, (c % FNT.cols) * FNT.cw, ((c / FNT.cols) | 0) * FNT.ch,
        gw, FNT.glyphH,
        pen, py, gw * scale, FNT.glyphH * scale);
    pen += adv(c) * scale;
  }
}
/* This font is proportional, so nothing may assume a character is a fixed
   number of pixels wide.  Everything measures real strings instead. */
function adv(c) { return FNT.widths ? FNT.widths[c] : FNT.cw; }
function textW(s, scale) {
  var w = 0;
  s = String(s);
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i) - FNT.first;
    if (c >= 0 && c < FNT.count) w += adv(c);
  }
  return w * (scale || 1);
}
function textC(s, py, col, scale) {
  scale = scale || 1;
  text(s, ((SW - textW(s, scale)) / 2) | 0, py, col, scale);
}
function textR(s, rx, py, col) { text(s, rx - textW(s), py, col); }
/* the longest leading part of s that fits in w pixels */
function clipTo(s, w) {
  s = String(s);
  if (textW(s) <= w) return s;
  var out = '';
  for (var i = 0; i < s.length; i++) {
    if (textW(out + s[i]) > w) break;
    out += s[i];
  }
  return out;
}
function rect(x, y, w, h, col) { cx.fillStyle = col; cx.fillRect(x, y, w, h); }
/* Bresenham straight onto the 320x200 buffer, one pixel at a time, so a
   shot can travel at any angle and still be made of square pixels. */
function line(x0, y0, x1, y1, col) {
  cx.fillStyle = col;
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy, guard = 0;
  while (guard++ < 600) {
    if (y0 >= VIEW_PY && y0 < VIEW_PY + VIEW_H * TS && x0 >= 0 && x0 < SW)
      cx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    var e2 = err + err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}
function frame(x, y, w, h, col) {
  rect(x, y, w, 1, col); rect(x, y + h - 1, w, 1, col);
  rect(x, y, 1, h, col); rect(x + w - 1, y, 1, h, col);
}
/* break a string into lines no wider than w pixels, on word boundaries */
function wrap(s, w) {
  var words = String(s).split(' '), out = [], line = '';
  for (var i = 0; i < words.length; i++) {
    var t = line ? line + ' ' + words[i] : words[i];
    if (textW(t) > w && line) { out.push(line); line = words[i]; }
    else line = t;
  }
  if (line) out.push(line);
  return out;
}

/* ---------------------------------------------------------- new game */
function newGame(first) {
  /* A run is seeded from the clock.  FORCED_SEED overrides it, which is
     how a test gets the same dungeon twice and how a strange floor can be
     looked at again instead of described from memory. */
  srand(FORCED_SEED || ((Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0));
  makeAppearances();
  G = freshG();
  P = newPlayer();

  /* You start with the worst of everything: a plain dagger, plain
     leather, a plain bow and a thin quiver.  Almost anything you find
     down there will be an improvement. */
  var dagger = mkItem('weapon', 2); dagger.known = 1;
  var body = mkItem('armor', 0); body.known = 1;
  P.eq.rh = dagger; P.eq.body = body;

  addItem(mkItem('food', 0));
  /* three stones and a dagger: everything else has to be found */
  var st = mkItem('weapon', weaponIndex('stone'));
  st.cnt = 3; st.known = 1; addItem(st);
  /* one scroll of identify: enough to learn one thing you find */
  var idScroll = mkItem('scroll', scrollIndex('identify'));
  addItem(idScroll);
  var sandals = mkItem('feet', 0); sandals.known = 1; addItem(sandals);

  enterLevel(1);
  if (first) { G.msgq = []; G.mode = 'title'; return; }
  msg('Welcome to the Dungeons of Doom.', 'c');
  msg('Arrows move. TAB opens your pack. ? for help.', '6');
  finishMsgs();
}

/* ---------------------------------------------------------- messages */
/* Nothing has to be dismissed any more: everything said this turn joins
   the log on the left, where it stays until it scrolls off the top. */
function finishMsgs() {
  for (var i = 0; i < G.msgq.length; i++) logPush(G.msgq[i]);
  G.msgq = []; G.msgIdx = 0;
  resumeMode();
}
function logPush(m) {
  m.t = G.turn;
  G.log.push(m);
  if (G.log.length > 60) G.log.splice(0, G.log.length - 60);
}
/* Everything still waiting its turn to be said, brought forward to now.
   Called when you press a key: if you are going faster than the pacing,
   you get the words immediately rather than out of order. */
function settleLog() {
  var now = Date.now(), i;
  for (i = 0; i < G.log.length; i++) if (G.log[i].at > now) G.log[i].at = now;
  soundSettle();       /* and drop the noises that went with them */
}

function resumeMode() {
  if (G.mode === 'win') return;
  /* You stepped onto a chest and it opened: show it, the way a pouch is
     shown, so you can take from it and put things back. */
  if (G.openBox && !G.dead) {
    var box = G.openBox; G.openBox = null;
    G.box = box;
    G.invOpen = 1; G.invMode = 'normal'; G.sel = null; G.menu = null;
    G.mode = 'inv';
    settleHp();
    setPouch(box);
    G.pcur.r = 0; G.pcur.c = 0;
    return;
  }
  /* Not straight to the tombstone: the blow that killed you has usually
     not even been printed yet.  Hold on the dungeon until the log has
     caught up, then a moment longer. */
  if (G.dead) {
    if (G.mode !== 'dead') {
      G.mode = 'dying';
      /* measured from the last thing anyone has to say, not from the
         blow - the killing line is usually still queued behind it */
      var last = beatNow(), i;
      for (i = 0; i < G.log.length; i++) if (G.log[i].at > last) last = G.log[i].at;
      G.deadAt = last + DEATH_PAUSE;
    }
    return;
  }
  /* You came of age.  It waits for the fighting to stop and for the
     blow that earned it to finish being told - the pending choice sits
     there and is offered on the first quiet turn. */
  if (G.perkPick && perkReady()) { G.mode = 'perk'; settleHp(); return; }
  if (G.queuePick) {
    G.pickJob = G.queuePick; G.queuePick = null;
    G.invMode = 'pick'; G.sel = null; setPouch(null);
    G.invOpen = 1; G.mode = 'inv'; return;
  }
  if (G.ask) { G.mode = 'ask'; return; }
  if (G.aim) { G.mode = 'dir'; return; }
  G.mode = G.invOpen ? 'inv' : 'play';
}

/* ------------------------------------------------------ the camera
   Drag the map and the view sits where you left it, to the pixel.  The
   view never shoves itself back afterwards: it comes home because you
   walk it home.

   Two numbers do it.  G.drag is where the view is, counted in whole
   tiles, and it is what everything that asks "which square is that?"
   uses.  CAM_AT is where the drawing has actually got to, in tiles and
   fractions of one.  The gap between them is drawn as a shift of the
   whole map by that fraction of a tile, so the picture can sit anywhere
   the hand puts it while the squares underneath stay on their grid. */
var CAM_AT = { x: 0, y: 0 };
function camTarget() {
  return { x: (G.drag ? G.drag.dx : 0) + (G.pan ? G.pan.dx : 0),
           y: (G.drag ? G.drag.dy : 0) + (G.pan ? G.pan.dy : 0) };
}
/* How far, in pixels, to shift the whole map from where its tiles say it
   is, so that it appears at CAM_AT rather than at the whole-tile offset
   it is drawn on.

   The map is drawn with the offset in camTarget: a bigger offset puts
   the map further left.  To show it at CAM_AT instead, the shift is
   (target - CAM_AT) tiles' worth - that way round.  It was the other way
   round, which threw the map the wrong way by the whole distance of
   every slide before easing it back, and that is what made a dragged map
   look as though it were being torn about. */
function camSlip() {
  var w = camTarget();
  return { x: Math.round((w.x - CAM_AT.x) * TS),
           y: Math.round((w.y - CAM_AT.y) * TS) };
}
/* Is the hand pushing the map about this instant?  While it is, the view
   is wherever the hand has put it and nothing else may move it. */
function camDragging() {
  return !!(MOUSE.held && MOUSE.held.drag) ||
         (typeof wheeling === 'function' && wheeling());
}
/* Chase the target.  A fixed share of the remaining distance each frame:
   quick to start, easy at the end, and it always arrives. */
function camEase() {
  if (camDragging()) return;          /* the hand is holding it */
  var w = camTarget();
  var dx = w.x - CAM_AT.x, dy = w.y - CAM_AT.y;
  if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02) {
    CAM_AT.x = w.x; CAM_AT.y = w.y;
    return;
  }
  /* A share of what is left, but never more than a fraction of a tile in
     one frame: over a long shove a quarter of the distance is most of a
     tile a frame, which is a jump rather than a glide. */
  var sx = clamp(dx * CAM_CHASE, -CAM_MAX_STEP, CAM_MAX_STEP);
  var sy = clamp(dy * CAM_CHASE, -CAM_MAX_STEP, CAM_MAX_STEP);
  CAM_AT.x += sx;
  CAM_AT.y += sy;
}
/* Is the player inside the view, given an offset in tiles? */
function playerShown(dx, dy) {
  var vx = (VIEW_W >> 1) - dx, vy = (VIEW_H >> 1) - dy;
  /* Anywhere on the screen counts, the outermost row and column
     included.  It used to want him CAM_EDGE squares clear of the edge,
     so shoving the map until he sat against the border had the next
     order haul the whole view back to centre - which is the one thing
     the view is not supposed to do while you can see him. */
  return vx >= 0 && vy >= 0 && vx < VIEW_W && vy < VIEW_H;
}
/* You have shoved the map so far that you cannot see yourself.  The
   first order you give is spent on getting the view back: it slides home
   and nothing else happens, and the order after that is the one you
   walk on.  Moving a player you cannot see is how you walk into a troll
   you had no way of knowing was there.

   Returns true if it took the order. */
function camHomeFirst() {
  if (!G.drag) return false;
  if (playerShown(G.drag.dx, G.drag.dy)) return false;
  G.drag = null;                    /* CAM_AT is left out there, so it slides */
  camSaw();
  stopWalk(null);
  return true;
}
/* The order that is waiting for the view to arrive.  Nothing happens
   until the picture has stopped travelling, and then it happens as
   though you had clicked that square just now. */
function camWaiting() {
  if (!G.waiting) return;
  if (G.mode !== 'play' || G.dead || G.ask || G.walk) { G.waiting = null; return; }
  var s = camSlip();
  if (s.x || s.y) return;                 /* still on its way */
  var job = G.waiting;
  G.waiting = null;
  if (job.x < 0 || job.y < 0 || job.x >= MAP_W || job.y >= MAP_H) return;
  mapOrder(job.x, job.y);
}
/* Where the player was standing when the view last had a look at him. */
var CAM_SEEN = null;
function camSaw() { CAM_SEEN = { x: P.x, y: P.y }; }
/* What the view does about a turn you have just taken.

   It never drags itself back a square at a time.  That was a shove of
   the whole map every turn, which is a jump however smoothly it is
   drawn, and it happened whether you were walking towards the middle or
   away from it or standing still.

   Instead: a step that carries you towards the middle of the screen is
   one the map sits still for, so you cross the screen and centre
   yourself.  A step the other way the map follows as it always has.
   Walk about for a while and you end up in the middle, and the picture
   never moves under you except when you are moving.

   The one time it does bring itself home is when you have pushed the map
   so far that you are off the screen altogether.  Then the first order
   you give slides it the whole way back to centred - you cannot play
   looking at a square you are not on. */
function camFollow() {
  var was = CAM_SEEN;
  camSaw();
  if (!G.drag) return;
  if (!playerShown(G.drag.dx, G.drag.dy)) { G.drag = null; return; }
  if (!was) return;
  /* only a step counts: a fall or a teleport is not walking across the
     screen, and the view simply goes with you */
  var sdx = P.x - was.x, sdy = P.y - was.y;
  var hx = 0, hy = 0;
  if (Math.abs(sdx) === 1 && sdx === Math.sign(G.drag.dx)) hx = sdx;
  if (Math.abs(sdy) === 1 && sdy === Math.sign(G.drag.dy)) hy = sdy;
  if (!hx && !hy) return;
  /* Hold the map exactly where it is.  The tile offset shrinks by the
     step, which leaves every square drawn on the pixel it was already
     on - and CAM_AT has to shrink with it, or the drawing is suddenly a
     whole tile from its target and slides back over the next few frames.
     That slide was the jerk: the offset was right and the picture was
     lurching a square and crawling back every time you stepped towards
     the middle.

     What the world is drawn at comes to (P + CAM_AT) tiles; holding both
     ends of that sum steady is what "the map does not move" means. */
  G.drag.dx -= hx; G.drag.dy -= hy;
  CAM_AT.x -= hx; CAM_AT.y -= hy;
  if (!G.drag.dx && !G.drag.dy) G.drag = null;
}

/* ------------------------------------------------------- walking there
   A click sets a walk going and the loop takes one step per beat, so you
   watch yourself cross the room rather than arriving in one frame.  Any
   of the things below ends it - and none of them lose you anything, you
   simply click again. */
function walkTo(tx, ty, job) {
  var stopShort = !!(job && (job.foe || job.door));
  var path = findPath(tx, ty, { stopShort: stopShort });
  if (!path) { msg("You can't go there.", '6'); finishMsgs(); return false; }
  if (!path.length) {
    /* already standing where you clicked, or beside what you clicked */
    if (job) return doWalkJob(job);
    return false;
  }
  /* Whoever is already watching you when you set off does not stop you:
     once a fight has started you are free to walk about in it, and
     backing away from a troll or closing on one is half of fighting.
     Anything that spots you *during* the walk still ends it. */
  G.walk = { path: path, at: 0, job: job || null, hp: P.hp,
             hunger: G.hungerState, known: watchingNow() };
  return true;
}
function stopWalk(why) {
  if (!G.walk) return;
  G.walk = null;
  if (why) { msg(why, '6'); finishMsgs(); }
}
/* Whatever the walk was for, once you are there. */
function doWalkJob(job) {
  if (!job) return false;
  if (job.foe) {
    if (L.mons.indexOf(job.foe) < 0) return false;
    if (mdist(job.foe) !== 1) return false;
    beginAction();
    playerAttack(job.foe);
    tick(true);
    return true;
  }
  /* You walked over to try the door.  Pushing into it is what opens it,
     or what tells you which key you are missing - the same as walking
     into it would have done. */
  if (job.door) {
    var dx = job.door.x - P.x, dy = job.door.y - P.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
    if (tileAt(job.door.x, job.door.y) !== LOCKED) return false;
    beginAction();
    var opened = playerMove(dx, dy);
    tick(opened);
    return true;
  }
  /* walked over to the stairs: now go down them */
  if (job.stairs) {
    if (tileAt(P.x, P.y) !== STAIR && tileAt(P.x, P.y) !== STAIR_UP) return false;
    beginAction();
    tick(useStairs());
    return true;
  }
  if (job.what === 'get' || job.what === 'open') {
    beginAction();
    var got = handPickup();
    tick(got);
    return true;
  }
  return false;
}
/* One step of a walk, if the beat has caught up and nothing has
   happened that you ought to be looking at. */
function walkTick() {
  if (!G.walk) return;
  if (G.dead || G.mode !== 'play') { G.walk = null; return; }
  if (Date.now() < G.walk.at) return;
  var w = G.walk;
  /* the reasons to stop, all of them checked before the step */
  if (heldFast()) { stopWalk('You cannot move.'); return; }
  if (G.perkPick) { G.walk = null; return; }
  if (P.hp < w.hp) { stopWalk(null); return; }
  if (G.hungerState >= 2 && G.hungerState > w.hunger) { stopWalk(null); return; }
  var foe = watchedByFoe(w.known);
  if (foe) { stopWalk(cap(monShort(foe)) + ' has seen you.'); return; }
  if (!w.path.length) {
    var job = w.job;
    G.walk = null;
    if (job) doWalkJob(job);
    return;
  }
  var next = w.path[0];
  var dx = next.x - P.x, dy = next.y - P.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1 || !stepCost(next.x, next.y) ||
      monAt(L, next.x, next.y)) {
    stopWalk('The way is blocked.');
    return;
  }
  w.path.shift();
  beginAction();
  var moved = playerMove(dx, dy);
  if (G.ask) { G.walk = null; resumeMode(); return; }
  tick(moved);
  if (!G.walk) return;                     /* something ended it mid-step */
  w.hp = P.hp; w.hunger = G.hungerState;
  /* the beat has already been squeezed by beatScale, so what is left is
     how long this square actually takes */
  w.at = Date.now() + Math.max(20, G.beat);
  if (G.mode !== 'play') { G.walk = null; return; }
}

/* Picking a thing up by hand, which is what a click on it means.  With
   the keyboard, walking onto a square still does it for you. */
function handPickup() {
  var it = itemAt(L, P.x, P.y);
  if (!it) { msg('There is nothing here.', '6'); finishMsgs(); return false; }
  autoPickup();
  finishMsgs();
  return true;
}

/* ---------------------------------------------------------- turn */
function tick(took) {
  if (!took) { finishMsgs(); return; }
  /* You have moved, so the view starts coming back to you: a dragged map
     is for looking about, not a camera you have to put back by hand. */
  camFollow();
  /* A trap door drops you the same way a hole in the floor does: some
     number of floors, and it hurts.  This used to step you down exactly
     one level with no damage and nothing said, which is why falling
     through a trap door felt like taking the stairs. */
  if (G.pendingFall) { G.pendingFall = 0; fallDown(); }
  G.turn++;
  /* your action has already been stamped at the head of the turn; give it
     a moment to be seen before the dungeon answers */
  beatWait(BEAT_PLAYER);

  /* Wading.  Every second step through water costs you the turn, so the
     dungeon moves twice while you get one step; Riverborn instead makes
     every second step free, and the dungeon does not move at all. */
  var wade = wadeStep(took === 'step');
  /* The turn is simply spent getting through it.  It used to announce
     itself every other step, which is a lot of words for something the
     water in front of you already explains. */
  if (wade > 0 && !G.dead && !(P.haste > 0 && (G.turn & 1))) monstersMove();
  var freeStep = wade < 0;

  if (!G.dead && !freeStep && !(P.haste > 0 && (G.turn & 1))) monstersMove();
  if (!G.dead) upkeep();
  if (!G.dead) computeVis();
  finishMsgs();
}

/* ---------------------------------------------------------- input */
function keyDir(k) {
  if (k === 'ArrowLeft') return [-1, 0];
  if (k === 'ArrowRight') return [1, 0];
  if (k === 'ArrowUp') return [0, -1];
  if (k === 'ArrowDown') return [0, 1];
  return null;
}

function onKeyUp(e) {
  if (e.key === 'Shift') panSet(0);
}
/* clicking away with SHIFT down would otherwise leave the panel out */
function onBlur() { panSet(0); }

function onKey(e) {
  LAST_INPUT = 'key';
  /* a walk is yours to interrupt: any key ends it */
  if (G.walk) { G.walk = null; }
  if (!ready) return;
  var k = e.key;
  if (k === 'F5' || (e.ctrlKey && k === 'r')) return;
  e.preventDefault();
  soundWake();          /* browsers keep audio asleep until you act */

  /* SHIFT holds the panel open.  While it is open the arrows push the
     view about instead of pushing you about, and nothing you press
     costs a turn - it is a look, not a move. */
  if (k === 'Shift') { if (G.mode === 'play' && !G.dead) panSet(1); return; }
  if (panning()) {
    /* Only the arrows belong to the panning view.  Everything else has
       to go through, because half the punctuation on a keyboard is
       typed with SHIFT held down - ? is SHIFT and / on most of them, so
       swallowing every shifted key meant the look cursor could not be
       opened at all. */
    if (e.shiftKey && keyDir(k)) { panKey(k); return; }
    panSet(0);
  }

  /* Dead is dead.  This is on G.dead rather than on the mode because the
     mode is whatever screen you happened to be on when it happened - if
     you died with the pack open, the pack was still taking orders, and
     a corpse was swinging its sword. */
  if (G.dead && G.mode !== 'dead' && G.mode !== 'win') return;

  switch (G.mode) {
    case 'ask': askKey(k); return;
    case 'ctx': ctxKey(k); return;
    /* The first key opens the menu over the splash rather than starting
       a run: LOAD has to be reachable without playing a turn first. */
    case 'title':
      if (G.titleMenu) titleKey(k);
      else G.titleMenu = { i: 0 };
      return;
    case 'help': G.mode = G.titleMenu ? 'title' : 'play'; return;
    /* Your last turn is still playing out.  Nothing you press now can
       change it, and swallowing the keystroke is kinder than acting on
       whichever key you happened to be holding when you died. */
    case 'dying': return;
    case 'dead': case 'win':
      if (k === 'Enter' || k === ' ' || k === 'r' || k === 'R') newGame(false);
      return;
    case 'perk': perkKey(k); return;
    case 'choose': chooseKey(k); return;
    case 'pause': pauseKey(k); return;
    case 'slots': slotsKey(k); return;
    case 'hint': hintKey(k); return;
    case 'look': lookKey(k); return;
    case 'inv': invKey(k); return;
    case 'dir': dirKey(k); return;
    case 'target': targetKey(k); return;
    case 'blink': blinkKey(k); return;
    case 'aim': aimKey(k); return;
    default: playKey(k); return;
  }
}

function playKey(k) {
  /* the chest is open only while you are standing on it */
  if (G.box && !(G.box.x === P.x && G.box.y === P.y &&
      L.items.indexOf(G.box) >= 0)) G.box = null;
  /* going faster than the pacing?  then have it all at once, in
     order, rather than letting this turn overtake the last one */
  settleLog();
  G.msgq = []; G.msgIdx = 0; G.beat = 0;
  var d = keyDir(k);
  if (d) {
    /* A step of your own overrules a square you clicked a moment ago
       and have not arrived at yet. */
    G.waiting = null;
    /* the view comes back before you take a step you cannot watch */
    if (camHomeFirst()) return;
    /* only a step through the water can be a wade - swinging at
       something while you stand in it is not */
    var before = { x: P.x, y: P.y };
    var did = playerMove(d[0], d[1]);
    tick(did && (P.x !== before.x || P.y !== before.y) ? 'step' : did);
    return;
  }
  if (k === 'Tab') { openInv(); return; }
  if (k === 'Enter') {
    if (G.dead || G.mode === 'win') return;
    /* ENTER is the do-the-obvious key, and sometimes two obvious things
       are true at once: you are standing on a staircase or an open chest
       AND you are holding a loaded bow with something in your sights.
       Rather than guess, it asks.

       This has to come before the stairs are taken, not after.  Asking
       afterwards is asking on the next floor down. */
    var here = tileAt(P.x, P.y);
    var box = openBoxHere();
    var wearable = wearHere();
    var underfoot = (here === STAIR) ? 'down' :
                    (here === STAIR_UP) ? 'up' : (box ? 'look' :
                    (wearable ? 'wear' : null));
    if (underfoot && shootableNow()) {
      G.choice = { what: underfoot, box: box, wear: wearable, i: 0 };
      G.mode = 'choose';
      return;
    }
    if (underfoot === 'wear') {
      G.msgq = [];
      if (equipFromFloor(wearable)) { tick(true); return; }
      finishMsgs(); return;
    }
    if (useStairs()) { tick(true); return; }
    if (underfoot === 'look') { G.openBox = openChest(box); finishMsgs(); return; }
    /* on a staircase that refused you, ENTER means the stairs and only
       the stairs - it does not also mean "start shooting" */
    if (underfoot) { finishMsgs(); return; }
    beginShooting();
    return;
  }
  /* ? is no longer the help screen - it is the way you ask what
     something is.  Help lives on the ESC menu now. */
  if (k === '?' || k === '/') { openLook(); return; }
  if (k === 'Escape') { openPause(); return; }
  if (k === ' ') {
    /* SPACE waits a turn, and only that.  Looking in a chest is ENTER,
       which is what opens everything else in the game. */
    var before = G.msgq.length;
    tick(true);
    if (!G.dead && G.msgq.length === before) { msg('You wait.', '4'); finishMsgs(); }
    return;
  }
  G.msgq = [];
}

/* You chose something to lob; now choose where it goes.  Anywhere in
   range will do - the floor is a perfectly good target for a flask.  The
   cursor starts on the nearest enemy if you can see one, otherwise on
   your own square. */
function beginThrow(it) {
  closeInv();
  G.throwing = it;
  G.msgq = [];
  var near = nearestTarget();
  G.aimSq = near ? { x: near.x, y: near.y } : { x: P.x, y: P.y };
  G.mode = 'aim';
}
function nearestTarget() {
  var best = null, bd = 1e9;
  for (var i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    if (m.ally || !canSeeMon(m)) continue;
    var d = Math.abs(m.x - P.x) + Math.abs(m.y - P.y);
    if (d < bd && throwValid(m.x, m.y)) { bd = d; best = m; }
  }
  return best;
}
function aimKey(k) {
  if (k === 'Escape' || k === 'Tab') {
    G.aimSq = null; G.throwing = null; G.mode = 'play'; return;
  }
  if (k === 'Enter' || k === ' ') {
    var s = G.aimSq, it = G.throwing;
    if (!throwValid(s.x, s.y, G.throwing)) {
      G.msgq = []; msg('You cannot throw it there.', 'R'); finishMsgs(); return;
    }
    G.aimSq = null; G.mode = 'play'; G.msgq = [];
    tick(throwAtSquare(it, s.x, s.y));
    G.throwing = null;
    return;
  }
  var d = keyDir(k);
  if (!d) return;
  var nx = clamp(G.aimSq.x + d[0], 0, MAP_W - 1);
  var ny = clamp(G.aimSq.y + d[1], 0, MAP_H - 1);
  if (Math.max(Math.abs(nx - P.x), Math.abs(ny - P.y)) <= SHOT_RANGE) {
    G.aimSq.x = nx; G.aimSq.y = ny;
  }
}

/* --------------------------------------------------- pick your target *//* --------------------------------------------------- pick your target */
/* the chest under your feet, if it is one you have already been through */
function openBoxHere() {
  var it = itemAt(L, P.x, P.y);
  return (it && it.t === 'chest' && it.seen) ? it : null;
}
/* is there anything ENTER could sensibly be shot at right now? */
function shootableNow() {
  return !!(canShoot() && shotTargets().length);
}

/* ------------------------------------------------- two things at once
   Standing on an open chest with a loaded bow and a foe in view, ENTER
   is ambiguous.  Rather than guess, it asks - two lines, one keypress. */
var CHOICE_LABEL = { down: 'Climb down', up: 'Climb up', look: 'Open chest',
                     wear: 'Put it on' };
function choiceOpts() {
  if (!G.choice) return [];
  return [['shoot', 'Shoot'],
          [G.choice.what, CHOICE_LABEL[G.choice.what] || 'Use it']];
}
/* Yes or no, and nothing else.  Left and right walk between the two
   buttons; ESC is No, because the safe answer is the one you get by
   backing out. */
function askKey(k) {
  var d = keyDir(k);
  if (!G.ask) { G.mode = 'play'; return; }
  if (k === 'Escape' || k === 'Tab') { answerAsk(false); G.mode = 'play'; return; }
  if (d && (d[0] || d[1])) { G.ask.i = G.ask.i ? 0 : 1; return; }
  if (k !== 'Enter' && k !== ' ') return;
  var yes = G.ask.i === 0;
  G.msgq = [];
  if (answerAsk(yes)) { tick(true); return; }
  G.mode = 'play';
  finishMsgs();
}
function drawAsk() {
  var q = G.ask.q, i;
  var btn = ['Yes', 'No'];
  var w = Math.max(76, textW(q) + 12), h = 30;
  var x = VIEW_PX + ((VIEW_W * TS - w) >> 1), y = VIEW_PY + 20;
  rect(x, y, w, h, '#0b0d1c');
  frame(x, y, w, h, '#636d85');
  text(q, x + 5, y + 5, 'w');
  for (i = 0; i < 2; i++) {
    var bw = 30, bx = x + 5 + i * (bw + 6), by = y + 16;
    var cur = G.ask.i === i;
    hit(bx, by, bw, 10, 'ask', i);
    rect(bx, by, bw, 10, cur ? '#2b3352' : '#141829');
    frame(bx, by, bw, 10, cur ? '#fad039' : '#3f4966');
    textIn(btn[i], bx, bw, by + 2, cur ? 'w' : '4');
  }
}

function chooseKey(k) {
  var d = keyDir(k), opts = choiceOpts();
  if (k === 'Escape' || k === 'Tab') { G.choice = null; G.mode = 'play'; return; }
  if (d && d[1]) {
    G.choice.i = (G.choice.i + d[1] + opts.length) % opts.length;
    return;
  }
  if (k !== 'Enter' && k !== ' ') return;
  var pick = opts[G.choice.i][0], box = G.choice.box, worn = G.choice.wear;
  G.choice = null; G.mode = 'play';
  if (pick === 'shoot') { beginShooting(); return; }
  if (pick === 'look') { G.openBox = openChest(box); finishMsgs(); return; }
  if (pick === 'wear') {
    G.msgq = [];
    if (equipFromFloor(worn)) { tick(true); return; }
    finishMsgs(); return;
  }
  /* the stairs, either way */
  G.msgq = [];
  if (useStairs()) { tick(true); return; }
  finishMsgs();
}

/* ------------------------------------------------------- the pause menu
   ESC out in the dungeon stops the game and asks what you want. */
var PAUSE_OPTS = [['save', 'SAVE AND QUIT'], ['load', 'LOAD'], ['hints', 'HINTS'],
                  ['restart', 'RESTART'], ['help', 'HELP'], ['exit', 'EXIT']];
/* and the same menu on the title screen, where there is no run to save */
var TITLE_OPTS = [['start', 'START'], ['load', 'LOAD'], ['hints', 'HINTS'],
                  ['help', 'HELP'], ['exit', 'EXIT']];
function openPause() { G.pause = { i: 0 }; G.titleMenu = null; G.mode = 'pause'; }
function pauseKey(k) {
  var d = keyDir(k);
  if (k === 'Escape' || k === 'Tab') { G.pause = null; G.mode = 'play'; return; }
  if (d && d[1]) { G.pause.i = (G.pause.i + d[1] + PAUSE_OPTS.length) % PAUSE_OPTS.length; return; }
  if (k !== 'Enter' && k !== ' ') return;
  var pick = PAUSE_OPTS[G.pause.i][0];
  if (pick === 'save' || pick === 'load') { openSlots(pick, 'pause'); return; }
  if (pick === 'hints') { openHints('pause'); return; }
  G.pause = null;
  if (pick === 'help') { G.mode = 'help'; return; }
  if (pick === 'restart') { newGame(false); return; }
  G.mode = 'title';
}
function drawPause() {
  /* Wider than the title menu: SAVE AND QUIT is a longer line than
     anything on that one, and at 70 it ran into the frame. */
  var i, w = 76, h = 12 + PAUSE_OPTS.length * 10 + 4;
  var x = ((SW - w) >> 1), y = ((SH - h) >> 1);
  rect(x, y, w, h, '#0b0d1c');
  frame(x, y, w, h, '#636d85');
  text('PAUSED', x + 5, y + 4, 'y');
  for (i = 0; i < PAUSE_OPTS.length; i++) {
    var cur = G.pause && G.pause.i === i;
    if (cur) rect(x + 2, y + 13 + i * 10, w - 4, 10, '#2b3352');
    text((cur ? '>' : ' ') + ' ' + PAUSE_OPTS[i][1], x + 5, y + 15 + i * 10, cur ? 'w' : '4');
    hit(x + 2, y + 13 + i * 10, w - 4, 10, 'pause', i);
  }
}

/* The same menu on the title screen.  It opens on the first keypress
   rather than starting a run straight away, so LOAD is reachable without
   playing a turn first. */
function titleKey(k) {
  var d = keyDir(k);
  if (k === 'Escape' || k === 'Tab') { G.titleMenu = null; return; }
  if (d && d[1]) {
    G.titleMenu.i = (G.titleMenu.i + d[1] + TITLE_OPTS.length) % TITLE_OPTS.length;
    return;
  }
  if (k !== 'Enter' && k !== ' ') return;
  var pick = TITLE_OPTS[G.titleMenu.i][0];
  if (pick === 'start') { G.titleMenu = null; newGame(false); return; }
  if (pick === 'load') { openSlots('load', 'title'); return; }
  if (pick === 'hints') { openHints('title'); return; }
  if (pick === 'help') { G.mode = 'help'; return; }
  if (pick === 'exit') { G.titleMenu = null; return; }
}
function drawTitleMenu() {
  var i, w = 70, h = 12 + TITLE_OPTS.length * 10 + 4;
  var x = ((SW - w) >> 1), y = ((SH - h) >> 1);
  rect(x, y, w, h, '#0b0d1c');
  frame(x, y, w, h, '#636d85');
  text('PXLRogue', x + 5, y + 4, 'y');
  for (i = 0; i < TITLE_OPTS.length; i++) {
    var cur = G.titleMenu && G.titleMenu.i === i;
    if (cur) rect(x + 2, y + 13 + i * 10, w - 4, 10, '#2b3352');
    text((cur ? '>' : ' ') + ' ' + TITLE_OPTS[i][1], x + 5, y + 15 + i * 10, cur ? 'w' : '4');
    hit(x + 2, y + 13 + i * 10, w - 4, 10, 'title', i);
  }
}

/* ------------------------------------------------------ save and load
   One store, three slots.  The list shows what is in each slot so you
   never have to remember which is which, and overwriting is a single
   keypress with the floor and level of the old run in front of you. */
/* The slot list is reachable from two places - the pause menu mid-run and
   the title screen before one - and BACK has to return to whichever it
   was.  That is remembered here rather than worked out afterwards from
   whatever global happens to be set: a stale flag sent BACK to a pause
   menu for a run that had not started. */
function openSlots(what, from) {
  G.slots = { what: what, i: 0, msg: '', from: from || 'pause' };
  G.mode = 'slots';
}
function slotRows() {
  var out = [], i;
  for (i = 0; i < SAVE_SLOTS; i++) out.push(slotLabel(i));
  return out;
}
/* Back to wherever the slots were opened from. */
function closeSlots() {
  var back = (G.slots && G.slots.from) || 'pause';
  G.slots = null;
  G.mode = back;
}
function slotsKey(k) {
  var d = keyDir(k), n = SAVE_SLOTS + 1;      /* the slots, then BACK */
  if (k === 'Escape' || k === 'Tab') { closeSlots(); return; }
  if (d && d[1]) { G.slots.i = (G.slots.i + d[1] + n) % n; G.slots.msg = ''; return; }
  if (k !== 'Enter' && k !== ' ') return;
  if (G.slots.i === SAVE_SLOTS) { closeSlots(); return; }
  var err;
  if (G.slots.what === 'save') {
    err = saveInto(G.slots.i);
    G.slots.msg = err || 'Saved.';
    return;
  }
  err = loadFrom(G.slots.i);
  if (err) { G.slots.msg = err; return; }
  G.slots = null; G.pause = null;
  G.mode = 'play';
  msg('You take up where you left off.', 'C');
  finishMsgs();
}
function drawSlots() {
  var rows = slotRows(), i;
  var w = 132, h = 14 + (SAVE_SLOTS + 1) * 10 + 12;
  /* over the dungeon, not over the panel: the panel is text, and text
     under a box is still text you cannot read */
  var x = VIEW_PX + ((VIEW_W * TS - w) >> 1), y = ((SH - h) >> 1);
  rect(x, y, w, h, '#0b0d1c');
  frame(x, y, w, h, '#636d85');
  text(G.slots.what === 'save' ? 'SAVE GAME' : 'LOAD GAME', x + 5, y + 4, 'y');
  for (i = 0; i < rows.length; i++) {
    var cur = G.slots.i === i;
    if (cur) rect(x + 2, y + 14 + i * 10, w - 4, 10, '#2b3352');
    text((cur ? '>' : ' ') + ' ' + (i + 1) + '. ' + rows[i], x + 5, y + 16 + i * 10,
      cur ? 'w' : (rows[i] === 'empty' ? '4' : '3'));
    hit(x + 2, y + 14 + i * 10, w - 4, 10, 'slot', i);
  }
  var by = y + 14 + SAVE_SLOTS * 10;
  hit(x + 2, by, w - 4, 10, 'slot', SAVE_SLOTS);
  if (G.slots.i === SAVE_SLOTS) rect(x + 2, by, w - 4, 10, '#2b3352');
  text((G.slots.i === SAVE_SLOTS ? '>' : ' ') + ' BACK', x + 5, by + 2,
    G.slots.i === SAVE_SLOTS ? 'w' : '4');
  if (G.slots.msg) text(G.slots.msg, x + 5, by + 13, 'C');
}

/* ------------------------------------------------------------- hints
   One at a time, in no order you can predict, and never the same one
   twice in a row. */
/* Hints are read from the pause menu mid-run and from the title screen
   before one, and ESC has to go back to whichever it was.  Opened from
   the title it used to return to a pause menu that did not exist, and
   the next key pressed fell over. */
function openHints(from) {
  G.hint = { i: rnd(HINTS.length), from: from || 'pause' };
  G.mode = 'hint';
}
function nextHint() {
  if (HINTS.length < 2) return;
  var j = rnd(HINTS.length - 1);
  if (j >= G.hint.i) j++;                     /* anything but this one */
  G.hint.i = j;
}
function hintKey(k) {
  if (k === ' ') { nextHint(); return; }
  if (k === 'Escape' || k === 'Enter' || k === 'Tab') {
    var back = (G.hint && G.hint.from) || 'pause';
    G.hint = null;
    G.mode = back;
    return;
  }
}
function hintLines() { return wrap(HINTS[G.hint.i], HINT_W - 10); }
var HINT_W = 150;
/* A line with certain characters picked out in another colour.  The
   hints talk about the ? and the ! a creature wears over its head, and
   in the middle of a sentence a question mark looks like punctuation -
   drawn red it reads as the thing on the screen it is naming. */
function textMarked(s, px, py, col, markCol, marks) {
  var i, x = px;
  for (i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    text(ch, x, py, marks.indexOf(ch) >= 0 ? markCol : col);
    x += textW(ch);
  }
}

function drawHints() {
  var lines = hintLines(), i;
  var w = HINT_W, h = 14 + Math.max(lines.length, 3) * 9 + 12;
  var x = VIEW_PX + ((VIEW_W * TS - w) >> 1), y = ((SH - h) >> 1);
  rect(x, y, w, h, '#0b0d1c');
  frame(x, y, w, h, '#636d85');
  text('HINT', x + 5, y + 4, 'y');
  for (i = 0; i < lines.length; i++) textMarked(lines[i], x + 5, y + 15 + i * 9, 'w', 'R', '?!');
  /* click the box for another, click the bottom line to be done */
  hit(x, y, w, h - 12, 'hint', 0);
  hit(x, y + h - 12, w, 12, 'hint', 1);
  text('SPACE another   ESC back', x + 5, y + h - 10, '4');
}

/* ------------------------------------------------------- looking about
   A cursor you walk over the map.  ENTER or SPACE reads out whatever is
   on the square it is sitting on. */
function openLook() {
  G.look = { x: P.x, y: P.y, lines: null };
  G.mode = 'look';
}
function lookKey(k) {
  if (k === 'Escape' || k === 'Tab' || k === '?' || k === '/') {
    if (G.look && G.look.lines) { G.look.lines = null; return; }
    G.look = null; G.mode = 'play'; return;
  }
  if (k === 'Enter' || k === ' ') {
    if (G.look.lines) { G.look.lines = null; return; }
    G.look.lines = lookAt(G.look.x, G.look.y);
    return;
  }
  var d = keyDir(k);
  if (!d) return;
  G.look.lines = null;                    /* moving closes the box */
  /* it stays on the part of the map you can actually see */
  var camx = P.x - (VIEW_W >> 1), camy = P.y - (VIEW_H >> 1);
  G.look.x = clamp(G.look.x + d[0], Math.max(0, camx), Math.min(MAP_W - 1, camx + VIEW_W - 1));
  G.look.y = clamp(G.look.y + d[1], Math.max(0, camy), Math.min(MAP_H - 1, camy + VIEW_H - 1));
}
function drawLook(camx, camy) {
  if (!G.look) return;
  var lx = G.look.x - camx, ly = G.look.y - camy;
  if (lx >= 0 && ly >= 0 && lx < VIEW_W && ly < VIEW_H) {
    var px = VIEW_PX + lx * TS, py = VIEW_PY + ly * TS;
    /* a box round the square, blinking so it cannot be mistaken for a
       thing that is actually there */
    if (((Date.now() / 260) | 0) % 2)
      frame(px - 1, py - 1, TS + 2, TS + 2, '#fad039');
    else frame(px - 1, py - 1, TS + 2, TS + 2, '#c3ccd9');
  }
  if (!G.look.lines) {
    textC('ARROWS look around, ENTER reads', SH - 8, '6');
    return;
  }
  /* the box of words, kept clear of the square it is talking about */
  var lines = G.look.lines, i;
  var w = VIEW_W * TS - 8, h = 6 + lines.length * 8;
  var bx = VIEW_PX + 4;
  var by = (ly < VIEW_H / 2) ? VIEW_PY + VIEW_H * TS - h - 3 : VIEW_PY + 3;
  rect(bx, by, w, h, '#0b0d1c');
  frame(bx, by, w, h, '#636d85');
  for (i = 0; i < lines.length; i++)
    text(lines[i], bx + 3, by + 3 + i * 8, i === 0 ? 'y' : 'w');
}

function beginShooting() {
  var kit = canShoot();
  if (!kit) {
    var lw = launcher();
    if (!lw) msg('You have nothing to shoot with.', '6');
    else msg('You have no ' + WEAPONS[lw.k].ammo + 's.', 'R');
    finishMsgs();
    return;
  }
  var list = shotTargets();
  if (!list.length) { msg('Nothing is in your line of fire.', '6'); finishMsgs(); return; }
  if (list.length === 1) { tick(fireAt(list[0])); return; }
  G.targets = list; G.tIdx = 0; G.mode = 'target';
}
function targetKey(k) {
  if (k === 'Escape' || k === 'Tab') {
    G.targets = []; G.throwing = null; G.mode = 'play'; return;
  }
  if (k === 'Enter' || k === ' ') {
    var m = G.targets[G.tIdx];
    G.targets = []; G.mode = 'play';
    G.msgq = [];
    tick(fireAt(m));
    G.throwing = null;
    return;
  }
  var d = keyDir(k);
  if (!d) return;
  var step = (d[0] > 0 || d[1] > 0) ? 1 : -1;
  G.tIdx = (G.tIdx + step + G.targets.length) % G.targets.length;
}

/* ------------------------------------------------- pick where to blink */
function beginBlink(it) {
  closeInv();
  G.bl = { x: P.x, y: P.y, item: it };
  G.mode = 'blink';
}
function blinkKey(k) {
  if (k === 'Escape' || k === 'Tab') { G.bl = null; G.mode = 'play'; return; }
  if (k === 'Enter' || k === ' ') {
    var b = G.bl; G.bl = null; G.mode = 'play'; G.msgq = [];
    if (!blinkValid(b.x, b.y)) { msg('That is beyond the spell.', 'R'); finishMsgs(); return; }
    if (b.item.ch <= 0) { msg('Nothing happens.', '6'); finishMsgs(); return; }
    if (!keepsCharge(b.item)) b.item.ch--;
    if (b.item.t === 'wand') KNOWN.wand[b.item.k] = 1;
    else { b.item.wind = 0; msg('The ring takes you elsewhere.', 'P'); }
    tick(blinkTo(b.x, b.y));
    return;
  }
  var d = keyDir(k);
  if (!d) return;
  var nx = clamp(G.bl.x + d[0], 0, MAP_W - 1), ny = clamp(G.bl.y + d[1], 0, MAP_H - 1);
  if (Math.max(Math.abs(nx - P.x), Math.abs(ny - P.y)) <= BLINK_RANGE) {
    G.bl.x = nx; G.bl.y = ny;
  }
}

function dirKey(k) {
  if (k === 'Escape') { G.aim = null; G.mode = 'play'; return; }
  /* TAB is always the pack, wherever you are.  Aiming a wand should not
     be the one place in the game where it does nothing. */
  if (k === 'Tab') { G.aim = null; openInv(); return; }
  var d = keyDir(k);
  if (!d) return;
  var it = G.aim; G.aim = null; G.mode = 'play';
  G.msgq = [];
  tick(it.t === 'ring' ? zapRing(it, d[0], d[1]) : zapWand(it, d[0], d[1]));
}

/* ---------------------------------------------------------- inventory */
function openInv() {
  settleHp();      /* no lag on a screen you opened to read */
  G.mode = 'inv'; G.invMode = 'normal'; G.invOpen = 1;
  G.sel = null; setPouch(null); G.menu = null;
  G.msgq = [];
}
function closeInv() {
  G.invOpen = 0; G.sel = null; setPouch(null); G.invMode = 'normal';
  G.menu = null; G.mode = 'play'; G.msgq = [];
}
function cursorRef() {
  /* Row -1 is the equip row.  You can climb up onto it out of a chest or
     a pouch as well as out of the pack, so what you are wearing is not
     walled off behind closing the container first. */
  if (G.pouch) {
    if (G.pcur.r < 0) return { kind: 'eq', key: EQ_ORDER[G.pcur.c] };
    if (G.pcur.r === btnRow()) {
      var pb = invButtons();
      return { kind: 'button', what: (pb[G.pcur.c] || pb[0])[0] };
    }
    return { kind: 'pouch', i: G.pcur.r * 5 + G.pcur.c };
  }
  if (G.cur.r === 0) return { kind: 'eq', key: EQ_ORDER[G.cur.c] };
  if (G.cur.r === 5) {
    var b = invButtons();
    return { kind: 'button', what: (b[G.cur.c] || b[0])[0] };
  }
  return { kind: 'slot', i: (G.cur.r - 1) * 5 + G.cur.c };
}
function refGet(ref) {
  if (ref.kind === 'button') return null;
  if (ref.kind === 'eq') return P.eq[ref.key];
  if (ref.kind === 'slot') return P.slots[ref.i];
  return ref.pouch.items[ref.i];
}
function refSet(ref, it) {
  if (ref.kind === 'button') return;          /* nothing lives on a button */
  if (ref.kind === 'eq') P.eq[ref.key] = it;
  else if (ref.kind === 'slot') P.slots[ref.i] = it;
  else ref.pouch.items[ref.i] = it;
}
function sameRef(a, b) {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'eq') return a.key === b.key;
  if (a.kind === 'slot') return a.i === b.i;
  return a.i === b.i && a.pouch === b.pouch;
}
function bindRef(ref) { if (ref.kind === 'pouch') ref.pouch = G.pouch; return ref; }

function invKey(k) {
  settleLog();
  G.beat = 0;
  if (G.invMode === 'menu' && G.menu) { menuKey(k); return; }
  var d = keyDir(k);
  if (d) {
    var cur = G.pouch ? G.pcur : G.cur;
    /* The row under the grid is the row of buttons, whether the grid is
       your pack or an open chest.  They used to be reachable only from
       the pack, so with a chest open there was no way to walk onto them
       at all. */
    cur.r = clamp(cur.r + d[1], G.pouch ? -1 : 0, btnRow());
    if (cur.r === btnRow()) cur.c = clamp(cur.c + d[0], 0, invButtons().length - 1);
    else cur.c = clamp(cur.c + d[0], 0, 4);
    return;
  }
  /* With a chest open at your feet, TAB is the way between the two sets
     of squares - your pack and the chest - and ESC is the way out. */
  if (k === 'Tab') {
    if (G.pouch && G.pouch.t === 'chest') { setPouch(null); G.sel = null; return; }
    if (boxHere()) { setPouch(boxHere()); G.pcur.r = 0; G.pcur.c = 0; G.sel = null; return; }
    closeInv(); return;
  }
  if (k === 'Escape') {
    if (G.sel) { G.sel = null; return; }
    if (G.pouch && G.pouch.t !== 'chest') { setPouch(null); G.sel = null; return; }
    if (G.pouch) { setPouch(null); G.sel = null; closeInv(); return; }
    if (G.invMode === 'pick') {
      var was = G.pickJob;
      G.invMode = 'normal'; G.pickJob = null;
      G.msgq = [];
      msg(was && was.kind === 'pin' ? 'You put the pin away.'
                                    : 'The scroll crumbles to dust, unused.', '6');
      finishMsgs();
      return;
    }
    closeInv();
    return;
  }
  if (k === ' ') { invSpace(); return; }
  if (k === 'Enter') { invEnter(); return; }
}

/* A button is not a square: SPACE and ENTER both just press it. */
function pressInvButton(what) {
  if (what === 'exit') { setPouch(null); closeInv(); return true; }
  if (what === 'box') {
    var box = boxHere();
    if (!box) { msg('There is no chest here.', '6'); return true; }
    /* Land on the same button in the view you arrive in, so pressing it
       twice takes you there and back rather than dropping the cursor
       somewhere you have to hunt for. */
    var col = (G.pouch ? G.pcur : G.cur).c;
    if (inBox()) { setPouch(null); G.cur.r = 5; G.cur.c = col; }
    else { setPouch(box); G.pcur.r = contRows(box); G.pcur.c = col; }
    G.sel = null;
    return true;
  }
  if (what === 'pouch') {
    if (G.pouch && G.pouch.t !== 'chest') { setPouch(null); G.sel = null; return true; }
    var all = carriedItems(), i;
    for (i = 0; i < all.length; i++)
      if (all[i] && all[i].t === 'pouch') {
        setPouch(all[i]); G.pcur.r = 0; G.pcur.c = 0; G.sel = null; return true;
      }
    msg('You have no pouch.', '6');
    return true;
  }
  return false;
}

function invSpace() {
  var target = bindRef(cursorRef());
  if (target.kind === 'button') { pressInvButton(target.what); return; }
  var titem = refGet(target);

  if (G.invMode === 'pick') { doScrollPick(titem); return; }

  /* nothing held yet: ask what to do with it */
  if (!G.sel) {
    if (!titem) return;
    openItemMenu(titem, target);
    return;
  }

  var a = G.sel.ref, ia = G.sel.item;
  if (sameRef(a, target)) { G.sel = null; return; }
  var ib = titem;
  G.msgq = [];

  /* drop into an open pouch that is sitting in a slot */
  if (ib && ib.t === 'pouch' && target.kind !== 'pouch' && ia.t !== 'pouch') {
    for (var j = 0; j < contCap(ib); j++) {
      if (!ib.items[j]) {
        if (a.kind === 'eq' && ia.cursed) { msg('You cannot let go of it. It is cursed.', 'R'); return; }
        refSet(a, null); ib.items[j] = ia; G.sel = null;
        msg('You stow ' + itemName(ia) + ' in the pouch.', 'w');
        return;
      }
    }
  }
  /* stack identical things */
  if (ib && stackable(ib, ia)) {
    refSet(a, null); ib.cnt += ia.cnt; G.sel = null;
    msg('You now have ' + itemName(ib) + '.', 'w');
    return;
  }
  /* validate the swap */
  if (target.kind === 'eq' && !slotAccepts(target.key, ia)) {
    msg(slotWhyNot(target.key, ia), 'R'); return;
  }
  if (a.kind === 'eq' && ib && !slotAccepts(a.key, ib)) {
    msg(slotWhyNot(a.key, ib), 'R'); return;
  }
  if (a.kind === 'eq' && ia.cursed) { msg('You cannot remove it. It is cursed.', 'R'); return; }
  if (target.kind === 'eq' && ib && ib.cursed) { msg('You cannot remove it. It is cursed.', 'R'); return; }
  /* a pouch inside a pouch is a nesting problem; a pouch inside a chest
     is perfectly reasonable */
  if (target.kind === 'pouch' && ia.t === 'pouch' && G.pouch && G.pouch.t !== 'chest') {
    msg('A pouch will not fit inside a pouch.', 'R'); return;
  }
  if (a.kind === 'pouch' && ib && ib.t === 'pouch' && G.pouch && G.pouch.t !== 'chest') {
    msg('A pouch will not fit inside a pouch.', 'R'); return;
  }
  if (target.kind === 'pouch' && ia.t === 'chest') { msg('The chest will not go in itself.', 'R'); return; }

  refSet(a, ib); refSet(target, ia);
  G.sel = null;
  if (target.kind === 'eq') {
    arcBetween(a, target);
    msg('You are now using ' + itemName(ia) + '.', 'w');
    if (ia.cursed) { ia.known = 1; msg('It is cursed!', 'R'); }
  }
}

/* ------------------------------------------------- the item menu
   Space on something in the pack asks what you want done with it,
   rather than guessing.  Only the things that item can actually do
   are offered. */
function itemActions(it, ref) {
  /* Reaching into a chest, the only sensible thing to do is take it. */
  if (ref.kind === 'pouch' && G.pouch && G.pouch.t === 'chest')
    return [['takeout', 'Take'], ['move', 'Move'], ['cancel', 'Cancel']];

  var out = [];
  if (ref.kind === 'eq') {
    out.push(['unequip', 'Take off']);
  } else {
    var key = slotFor(it);
    if (key === 'rh') out.push(['equip', twoHanded(it) ? 'Wield (2h)' : 'Wield']);
    else if (key === 'lh') out.push(['equip', it.t === 'shield' ? 'Raise' : 'Ready']);
    else if (key) out.push(['equip', 'Wear']);
  }
  if (canAppraise(it) && !it.tried) out.push(['study', 'Study it']);
  if (isThrowable(it)) out.push(['throw',
    it.t === 'dynamite' ? 'Light it' : isFlask(it) ? 'Hurl' : 'Throw']);
  switch (it.t) {
    case 'potion': out.push(['use', 'Drink']); break;
    case 'scroll': out.push(['use', 'Read']); break;
    case 'food': out.push(['use', 'Eat']); break;
    case 'crystal': out.push(['use', 'Crush']); break;
    case 'wand': out.push(['use', 'Zap']); break;
    /* One verb for every ring.  "Slip away" was left over from the days
       when the only ring with charges in it stepped you out of reach, and
       it read as a promise the ring of fire had no intention of keeping;
       "Vanish" was worse, since it named the ring of the unseen before
       you had identified it.  What the ring does is in its description,
       once you know; the menu only offers to press it. */
    case 'ring': out.push(['use', 'Press it']); break;
    case 'pouch': out.push(['use', 'Open']); break;
    case 'pin': out.push(['use', 'Pin it on']); break;
    case 'amulet': out.push(['use', 'Look at it']); break;
  }
  /* Moving things between the pack and a chest by carrying them across
     two screens is more trouble than it is worth, so each side offers a
     one-press way over. */
  if (ref.kind === 'pouch') out.push(['takeout', 'Take']);
  else if (G.box && it.t !== 'chest' && !(ref.kind === 'eq' && it.cursed) &&
           (!G.pouch || G.pouch === G.box))
    out.push(['putin', 'Put in chest']);
  out.push(['move', 'Move']);
  if (!(ref.kind === 'eq' && it.cursed)) out.push(['drop', 'Drop']);
  out.push(['cancel', 'Cancel']);
  return out;
}
function openItemMenu(it, ref) {
  G.menu = { item: it, ref: ref, opts: itemActions(it, ref), i: 0 };
  G.invMode = 'menu';
  G.msgq = [];
}
function closeItemMenu() {
  G.menu = null;
  if (G.invMode === 'menu') G.invMode = 'normal';
}
function menuKey(k) {
  var d = keyDir(k);
  if (d) {
    if (d[1]) G.menu.i = (G.menu.i + d[1] + G.menu.opts.length) % G.menu.opts.length;
    return;
  }
  if (k === 'Escape') { closeItemMenu(); return; }
  if (k === 'Tab') { closeItemMenu(); closeInv(); return; }
  if (k === ' ' || k === 'Enter') doMenuAction(G.menu.opts[G.menu.i][0]);
}
function doMenuAction(act) {
  var it = G.menu.item, ref = G.menu.ref;
  closeItemMenu();
  G.msgq = [];
  switch (act) {
    case 'cancel': return;
    case 'move': G.sel = { item: it, ref: ref }; return;
    case 'takeout': takeFromBox(it, ref); return;
    case 'putin': {
      if (!G.box) return;
      if (!chestRoom(G.box)) {
        msg('The chest is full. ' + contCount(G.box) + ' of ' + CHEST_CAP + ' squares.', 'R');
        finishMsgs(); return;
      }
      chestPut(G.box, it);
      refSet(ref, null);
      msg('You put ' + itemName(it) + ' in the chest.', 'w');
      G.sel = null; finishMsgs(); return;
    }
    case 'equip': {
      var toKey = slotFor(it);
      if (autoEquip(it) && toKey) arcBetween(ref, { kind: 'eq', key: toKey });
      finishMsgs(); return;
    }
    case 'throw': beginThrow(it); return;
    case 'study': appraise(it); finishMsgs(); return;
    case 'unequip': unequipFrom(ref); finishMsgs(); return;
    case 'drop': dropFromPack(it, ref); finishMsgs(); return;
    case 'use': {
      var res = useItem(it);
      if (res.pouch) { setPouch(res.pouch); G.pcur.r = 0; G.pcur.c = 0; return; }
      if (res.hurl) { beginThrow(res.hurl); return; }
      if (res.pin) { beginPin(res.pin); return; }
      if (res.blink) { beginBlink(res.blink); return; }
      if (res.aim) { closeInv(); G.aim = res.aim; G.mode = 'dir'; return; }
      G.sel = null;
      finishMsgs();
      return;
    }
  }
}
function unequipFrom(ref) { unequipTo(P.eq[ref.key]); }
function dropFromPack(it, ref) {
  if (ref.kind === 'eq') {
    if (it.cursed) { it.known = 1; msg('You cannot let go. It is cursed.', 'R'); return; }
    P.eq[ref.key] = null;
    takeOffEffects(it);
  } else {
    refSet(ref, null);
  }
  dropNear(P.x, P.y, it);
  msg('You drop ' + itemName(it) + '.', 'w');
}

function doScrollPick(it) {
  G.msgq = [];
  if (!it) { msg('There is nothing in that square.', '6'); return; }
  /* A pouch is a bag, not a thing you enchant.  Picking it in the middle
     of a scroll used to burn the reading on it; now it simply does what
     pressing ENTER on a pouch always does, and the scroll waits. */
  if (it.t === 'pouch') {
    setPouch(it); G.pcur.r = 0; G.pcur.c = 0;
    return;
  }
  var job = G.pickJob;
  if (job.kind === 'pin') {
    /* the pin itself is only spent if it went somewhere */
    if (pinOnto(it) && job.item) removeItem(job.item, 1);
    G.invMode = 'normal'; G.pickJob = null;
    finishMsgs();
    return;
  }
  applyScrollTo(job.kind, it, job.k);
  G.invMode = 'normal'; G.pickJob = null;
  finishMsgs();
}
/* Fasten a pin: pick the clothing it goes on. */
function beginPin(it) {
  G.invMode = 'pick';
  G.pickJob = { kind: 'pin', item: it };
  G.msgq = [];
  msg('Pin it to what?', 'c');
  finishMsgs();
}

/* Out of the chest and into your pack.  Shared by ENTER and by the
   menu, so both do exactly the same thing. */
function takeFromBox(it, ref) {
  G.msgq = [];
  var got = addItem(it);
  if (!got) { msg('Your pack is full.', 'R'); finishMsgs(); return false; }
  refSet(ref, null);
  msg('You take ' + itemName(it) + '.', 'w');
  G.sel = null; finishMsgs();
  return true;
}

/* the open chest under your feet, or nothing */
function boxHere() {
  if (!G.box) return null;
  if (L.items.indexOf(G.box) < 0) return null;
  if (G.box.x !== P.x || G.box.y !== P.y) return null;
  return G.box;
}

function invEnter() {
  var target = bindRef(cursorRef());
  if (target.kind === 'button') { pressInvButton(target.what); return; }
  var it = refGet(target);
  if (G.invMode === 'pick') { doScrollPick(it); return; }
  if (!it) return;
  G.msgq = [];
  /* Something already on you comes off.  ENTER on a square is "do the
     obvious thing with this", and the obvious thing with a sword you are
     already holding is to put it away. */
  if (target.kind === 'eq') {
    unequipTo(it);
    G.sel = null;
    finishMsgs();
    return;
  }
  var wasKey = slotFor(it);
  /* Reaching into a chest takes the thing out.  Using it where it lies
     is not something you would do, and it was not something the game
     could do either - what came out of the chest was never spent. */
  if (target.kind === 'pouch' && G.pouch && G.pouch.t === 'chest') {
    takeFromBox(it, target);
    return;
  }
  var res = useItem(it);
  if (res.pouch) { setPouch(res.pouch); G.pcur.r = 0; G.pcur.c = 0; return; }
  if (res.hurl) { beginThrow(res.hurl); return; }
  if (res.pin) { beginPin(res.pin); return; }
  if (res.blink) { beginBlink(res.blink); return; }
  if (res.aim) { var w = res.aim; closeInv(); G.aim = w; G.mode = 'dir'; return; }
  if (res.equipped && wasKey) arcBetween(target, { kind: 'eq', key: wasKey });
  G.sel = null;
  /* equipping and consuming are free actions - the dungeon does not get
     a turn while you rummage in your own pack */
  finishMsgs();
}

/* ---------------------------------------------------------- render */
function loop() { walkTick(); touchHold(); camEase(); camWaiting(); render(); requestAnimationFrame(loop); }

function render() {
  /* The hit list is rebuilt every frame by the things that draw
     themselves, so a click can never act on a button that is no longer
     on the screen. */
  HITS = [];
  drawFrame();
  drawHoverTile();
  drawPointer();
}
function drawFrame() {
  rect(0, 0, SW, SH, '#0b0d1c');
  if (G.mode === 'title') { drawTitle(); return; }
  if (G.mode === 'win') { drawWin(); return; }
  if (G.mode === 'help') { drawHelp(); return; }
  if (G.mode === 'perk') { drawPerkPick(); return; }
  if (G.mode === 'inv') { drawInv(); return; }
  /* a question stands over the dungeon, so you can still see where you
     are and what is coming while you answer it */
  if (G.mode === 'ask' && G.ask) {
    drawMap(); drawKeyBelt(); drawSidePanel(); drawAsk(); return;
  }
  if (G.mode === 'ctx' && G.ctx) {
    drawMap(); drawKeyBelt(); drawSidePanel(); drawCtxMenu(); return;
  }
  /* the last words have been read; raise the stone */
  if (G.mode === 'dying' && Date.now() >= G.deadAt) G.mode = 'dead';
  drawMap();
  drawKeyBelt();
  drawSidePanel();
  if (G.mode === 'dead') drawDeath();
  panSettle();
}

/* When the game is waiting for you to point at something it says so in
   the panel, where there is room to wrap, rather than over the map. */
function panelPrompt() {
  var out = [], i, lines;
  function say(s, c) {
    lines = wrap(s, LOG_W);
    for (i = 0; i < lines.length; i++) out.push({ s: lines[i], c: c });
  }
  if (G.mode === 'dir') {
    say('Aim with the ARROWS.', 'y'); say('ESC or TAB cancels.', '4');
  } else if (G.mode === 'target' && G.targets.length) {
    say(fightLine('Shoot ', monShort(G.targets[G.tIdx]), '?'), 'y');
    say('ARROWS pick, ENTER fires.', '4');
  } else if (G.mode === 'blink' && G.bl) {
    say('Blink where?', 'P');
    var land = blinkLanding(G.bl.x, G.bl.y);
    if (land === 'far') say('Beyond the spell.', 'R');
    else if (!(L.flags[G.bl.y * MAP_W + G.bl.x] & F_SEEN)) say('You cannot see it.', 'O');
    say('ENTER goes, ESC stops.', '4');
  } else if (G.mode === 'aim' && G.aimSq) {
    var who = monAt(L, G.aimSq.x, G.aimSq.y);
    /* you throw one, not the whole stack */
    var one = itemDef(G.throwing);
    var nm = one && one.n ? one.n : 'it';
    if (G.throwing.t === 'potion' && !KNOWN.pot[G.throwing.k]) nm = 'flask';
    say('Throw the ' + nm + (who && canSeeMon(who)
      ? ' at ' + monShort(who) + '?' : ' there?'), 'y');
    say(throwValid(G.aimSq.x, G.aimSq.y, G.throwing)
      ? 'ARROWS aim, ENTER throws.' : 'No clear throw that way.',
      throwValid(G.aimSq.x, G.aimSq.y, G.throwing) ? '4' : 'R');
  }
  return out;
}

/* Where a monster should be drawn right now.  A creature that got two
   moves this turn walks them one after the other instead of blinking two
   squares at once. */
/* Where a creature is drawn.  Each step it took this turn carries the
   moment it happens, so a quick one taking two steps walks them one
   after the other instead of jumping the whole distance at once. */
/* A thing on its way somewhere else.

   0 to WARP_SHAKE      it is still on the square it left, shivering
   then WARP_FLASH      it is nowhere: a flash at each end instead
   after that           it is simply where it now is

   The jitter is settled from the clock and the square rather than rolled,
   so every frame of the same instant agrees with itself. */
function warpPhase(w) {
  if (!w) return null;
  var age = Date.now() - w.t;
  if (age < 0) return { part: 'before' };
  if (age < WARP_SHAKE) return { part: 'shake', age: age };
  if (age < WARP_SHAKE + WARP_FLASH) return { part: 'flash', age: age - WARP_SHAKE };
  return null;
}
function warpJitter(w, age) {
  var n = (age / WARP_SHAKE_STEP) | 0;
  var h = (n * 2654435761 + w.fx * 40507 + w.fy * 12289) >>> 0;
  /* one pixel, never none: a shiver that stands still for a frame reads
     as a stutter rather than a shake */
  var dx = (h & 1) ? 1 : -1, dy = ((h >> 1) & 1) ? 1 : -1;
  if ((h >> 2) & 1) dx = 0;
  else if ((h >> 3) & 1) dy = 0;
  return [dx, dy];
}
/* The flash runs its three frames over WARP_FLASH, at both ends of the
   jump: you watch it go and you watch it arrive. */
function drawWarpFlash(x, y, camx, camy, cols, age) {
  var vx = x - camx, vy = y - camy;
  if (vx < -cols || vy < 0 || vx >= VIEW_W || vy >= VIEW_H) return;
  var f = Math.floor(age / (WARP_FLASH / WARP_FRAMES.length));
  if (f < 0) f = 0;
  if (f >= WARP_FRAMES.length) f = WARP_FRAMES.length - 1;
  spr(WARP_FRAMES[f], VIEW_PX + vx * TS, VIEW_PY + vy * TS, 1);
}

/* The two squares a creature is between at this instant of the playback:
   the one it is leaving and the one it is walking onto, or the same
   square twice when it is standing still.

   A turn is worked out all at once and played back over the next few
   hundred milliseconds, so by the time the stone you threw is still in
   the air the creature has already, as far as the game is concerned,
   walked out of sight.  Asking whether you can see the square it ended
   on made it vanish before the stone landed.  Asking about the squares
   it is between right now keeps it there until it has actually gone. */
function monBetween(m) {
  var here = [m.x, m.y, m.x, m.y];
  if (!m.anim || !m.anim.length) return here;
  var now = Date.now(), i;
  for (i = 0; i < m.anim.length; i++) {
    var a = m.anim[i], t0 = a[4];
    if (now < t0) return [a[0], a[1], a[0], a[1]];      /* not started yet */
    if (now < t0 + (a[5] || MOVE_ANIM_MS)) return [a[0], a[1], a[2], a[3]];  /* crossing */
    if (i + 1 < m.anim.length && now < m.anim[i + 1][4])
      return [a[2], a[3], a[2], a[3]];                  /* arrived, waiting */
  }
  return here;
}
/* Drawn if you can see either end of the step it is taking, so you watch
   it walk out of sight and walk into view rather than having it pop. */
function monShown(m) {
  var b = monBetween(m);
  return canSeeMonAt(m, b[0], b[1]) || canSeeMonAt(m, b[2], b[3]);
}
function monPixel(m, camx, camy) {
  var px = VIEW_PX + (m.x - camx) * TS, py = VIEW_PY + (m.y - camy) * TS;
  if (!m.anim || !m.anim.length) return [px, py];
  var now = Date.now(), i;
  for (i = 0; i < m.anim.length; i++) {
    var a = m.anim[i], t0 = a[4];
    if (now < t0) {                      /* this step has not happened yet */
      return [VIEW_PX + (a[0] - camx) * TS, VIEW_PY + (a[1] - camy) * TS];
    }
    var span = a[5] || MOVE_ANIM_MS;
    if (now < t0 + span) {
      var f = (now - t0) / span;
      var fx = VIEW_PX + (a[0] - camx) * TS, fy = VIEW_PY + (a[1] - camy) * TS;
      var tx2 = VIEW_PX + (a[2] - camx) * TS, ty2 = VIEW_PY + (a[3] - camy) * TS;
      return [Math.round(fx + (tx2 - fx) * f), Math.round(fy + (ty2 - fy) * f)];
    }
    /* it has arrived; if there is another step, hold here until its turn */
    if (i + 1 < m.anim.length && now < m.anim[i + 1][4])
      return [VIEW_PX + (a[2] - camx) * TS, VIEW_PY + (a[3] - camy) * TS];
  }
  m.anim = null;
  return [px, py];
}

function tileCX(tx, camx) { return VIEW_PX + (tx - camx) * TS + 4; }
function tileCY(ty, camy) { return VIEW_PY + (ty - camy) * TS + 4; }
/* Blink goes through stone.  Whether there is floor on the other side is
   your problem: all the spell checks is that the distance is within
   reach.  Landing in rock is fatal, and it is meant to be. */
function blinkValid(x, y) {
  return Math.max(Math.abs(x - P.x), Math.abs(y - P.y)) <= BLINK_RANGE;
}
/* what the cursor should look like: safe, deadly, or out of range */
function blinkLanding(x, y) {
  if (!blinkValid(x, y)) return 'far';
  if (monAt(L, x, y)) return 'blocked';
  return walkable(x, y) ? 'safe' : 'solid';
}

function drawBolt(name, cell, camx, camy) {
  var bx = cell[0] - camx, by = cell[1] - camy;
  if (bx < 0 || by < 0 || bx >= VIEW_W || by >= VIEW_H) return;
  spr(name, VIEW_PX + bx * TS, VIEW_PY + by * TS, 1);
}

/* ------------------------------------------------------- edging
   Water and holes have hard square borders, which read as blocks rather
   than as pools and pits.  So a floor square next to one gets a few
   pixels of it spilled over the shared edge.

   The rule, for a floor square, is the same for both:
     - for each of the four sides, if that neighbour is water/hole, lay a
       two pixel strip along that side
     - for each of the four corners, if the diagonal neighbour is
       water/hole but neither side beside it is, dab a 2x2 in that corner

   The dab is the bit that matters: it is what rounds off a step in the
   outline.  Nothing here changes what a square *is* - you are standing on
   floor, and the game never asks the edging what it thinks. */
/* Round a corner by copying the other material's own 8x8 sprite into it,
   two pixels square.  Using the real sprite is what makes the result look
   like water or floor rather than like a coloured marker - and it follows
   the spritesheet, so repainting a tile repaints its edges too. */
function fadedSheet(a) {
  var key = Math.round(a * 100);
  if (!fadeSheets[key]) fadeSheets[key] = makeFade(a);
  return fadeSheets[key];
}
function cornerFrom(name, px, py, corner, a) {
  var i = IX[name];
  if (i === undefined) return;
  var sx = (i % ATLAS.cols) * TS, sy = ((i / ATLAS.cols) | 0) * TS;
  var ox = (corner & 1) ? TS - 2 : 0;      /* 0,2 = left   1,3 = right */
  var oy = (corner > 1) ? TS - 2 : 0;      /* 0,1 = top    2,3 = bottom */
  /* A patch has to cover the tile under it, not mix with it.  At part
     opacity it would mix, so take the colour from a sheet already faded
     to exactly this shade and lay it down solid instead. */
  var sheet = (a === undefined || a >= 1) ? atlasImg : fadedSheet(a);
  cx.drawImage(sheet || atlasImg,
    sx + ox, sy + oy, 2, 2, px + ox, py + oy, 2, 2);
}

/* the sprite a square would show if it were plain floor */
/* Three flagstones, scattered evenly over the floor by a cheap hash so
   the same square always draws the same one.  Two of the three used to
   turn up once in eight squares each, which read as one flagstone with
   the odd blemish rather than three kinds of stone. */
function floorSprite(mx, my) {
  var h = tileHash(mx, my) % 3;
  return h === 1 ? 'floor2' : h === 2 ? 'floor3' : 'floor';
}
function liquidSprite(t, mx, my) {
  if (t === HOLE) return 'hole';
  if (t === HOLY) return ((mx + my) & 1) ? 'holy' : 'holy2';
  return ((mx + my) & 1) ? 'water' : 'water2';
}

/* What the ground is at one corner of a square.  A pillar standing in a
   pool has its corners taken off, and the bite taken out of it has to be
   filled with the water that is lying there - filling it with dry floor
   left a little grey collar round every pillar in the water. */
function groundAtCorner(mx, my, corner) {
  var sx = mx + ((corner & 1) ? 1 : -1), sy = my + ((corner > 1) ? 1 : -1);
  var a = tileAt(sx, my), b = tileAt(mx, sy), t;
  if (a === WATER || a === HOLY || a === HOLE) t = a;
  else if (b === WATER || b === HOLY || b === HOLE) t = b;
  else if (a === BRIDGE) t = L.under[my * MAP_W + sx];
  else if (b === BRIDGE) t = L.under[sy * MAP_W + mx];
  return t ? liquidSprite(t, mx, my) : floorSprite(mx, my);
}

/* Stone corners, rounded the same way: an outside corner of a wall gets
   its point taken off, an inside corner gets filled in.  The colours are
   sampled from the wall and floor sprites, so it follows the sheet. */
function drawWallEdging(mx, my, px, py, a) {
  var c = wallCorners(mx, my), i, drew = 0;
  var wall = isWallish(mx, my);
  var at = [[0, 0], [TS - 2, 0], [0, TS - 2], [TS - 2, TS - 2]];
  for (i = 0; i < 4; i++) {
    if (!c[i]) continue;
    cornerFrom(wall ? groundAtCorner(mx, my, i) : wallVariant(mx, my),
      px, py, i, a);
    drew++;
  }
  return drew;
}

/* A floor square beside a pool: fill its notched corners with water. */
function drawEdging(mx, my, px, py, a) {
  var c = edgeCorners(mx, my), i, drew = 0;
  for (i = 0; i < 4; i++) {
    if (!c[i]) continue;
    /* whichever liquid is doing the notching */
    var t = isEdgeTile(mx + ((i & 1) ? 1 : -1), my) ||
            isEdgeTile(mx, my + ((i > 1) ? 1 : -1));
    if (!t) continue;
    cornerFrom(liquidSprite(t, mx, my), px, py, i, a);
    drew++;
  }
  return drew;
}

/* A pool square sticking out into the room: chamfer its bare corners. */
function drawLiquidCorners(mx, my, px, py, a) {
  var c = edgeCorners(mx, my), i, drew = 0;
  for (i = 0; i < 4; i++) {
    if (!c[i]) continue;
    cornerFrom(floorSprite(mx, my), px, py, i, a);
    drew++;
  }
  return drew;
}

/* A bridge shows what it spans at its two open ends, so the water still
   reads as running under it.  A bridge over a stream running north-south
   is walked east-west, and its planks lie the other way about. */
function drawBridge(mx, my, px, py, a) {
  var u = L.under[my * MAP_W + mx] || WATER;
  if (u === HOLE) drawHole(mx, my, px, py, a);
  else spr(liquidSprite(u, mx, my), px, py, a);
  var span = L.bspan[my * MAP_W + mx];
  if (!span) {
    /* an older floor, or one built some other way: read it off the raw
       tiles, never through another bridge */
    span = (tileAt(mx, my - 1) === u || tileAt(mx, my + 1) === u) ? 'h' : 'v';
  }
  spr(span === 'h' ? 'bridge_h' : 'bridge_v', px, py, a);
}

/* A pit, not just an unlit square:/* A pit, not just an unlit square: the broken lip is drawn on whichever
   sides are still floor, so a run of squares reads as one hole. */
/* What is lying on a square, seeing through a bridge to what it spans.
   A bridge is a plank over the drop, not the end of it. */
function liquidAt(mx, my) {
  var t = tileAt(mx, my);
  if (t !== BRIDGE) return t;
  return L.under[my * MAP_W + mx] || t;
}
/* A hole is a hole: nothing, drawn as nothing.  It used to get a lighter
   lip round whichever sides were still solid ground, which read as a
   rim standing above the floor rather than an absence of floor.  The
   cracked flagstones round it are the warning; the hole itself is dark. */
/* Most ground cover is drawn as it was painted.  Cracked flagstones are
   the exception: they are painted joining a hole above them, so beside a
   hole they have to be turned to face it - a quarter circle each way,
   and a half turn above.  A crack with a hole on more than one side
   takes the first it finds; there is only one way up. */
/* The middle stage of light: out at the far end of what you can see.

   A ring at a fixed distance from you is not that - in a small room
   everything is close and there is no ring at all, and in a big one the
   ring falls across the middle of the floor for no reason anybody
   looking at it could name.  What you actually want is the last squares
   before your sight runs out, so that is what this asks: far enough off
   to be dim, or standing next to something you cannot see. */
/* How brightly a square you can see is drawn.

   The question only really makes sense about ground: a wall has no light
   of its own, it is lit by whatever room it stands round.  So the ground
   is asked whether your sight is running out at it, and a wall simply
   takes the brightest of the ground beside it.

   Asking a wall the question directly gave one side of a room dimmer
   walls than the other, because a wall with a corridor behind it has an
   unlit square among its neighbours - the very square the wall is there
   to hide from you. */
/* Ground for the purpose of lighting: something with light falling on
   it that you could stand on.  A secret door is not on this list.  It is
   drawn as a wall and it has to be lit as a wall - lit as the floor it
   will one day become, it comes out a different shade from the stones
   round it, and a wall that is subtly the wrong colour is exactly how
   you find a secret door without searching for it. */
function litGround(mx, my) {
  var t = L.tiles[my * MAP_W + mx];
  return walkTile(t) && t !== SDOOR;
}
/* how bright a square of ground is: full where a lamp is burning, and
   otherwise however far your own light reaches */
function groundLight(mx, my) {
  if (L.litMap && L.litMap[my * MAP_W + mx]) return 1;
  return atEdgeOfSight(mx, my) ? LIGHT_EDGE : 1;
}
function tileLight(mx, my) {
  if (litGround(mx, my)) return groundLight(mx, my);
  /* a wall has no light of its own: it takes the best of the ground it
     stands beside */
  var d;
  for (d = 0; d < DIR8.length; d++) {
    var nx = mx + DIR8[d][0], ny = my + DIR8[d][1];
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    var j = ny * MAP_W + nx;
    if (!litGround(nx, ny) || !(L.flags[j] & F_VIS)) continue;
    if (groundLight(nx, ny) >= 1) return 1;
  }
  return LIGHT_EDGE;
}

function atEdgeOfSight(mx, my) {
  /* Only the squares you could walk on count.  A wall has solid rock
     behind it which you can never see, so asking about every neighbour
     made every wall in the game the edge of your sight - the floor of a
     room came out lit and its walls came out dim, which reads as the
     room being lit by something other than what you are carrying.

     And no ring at a fixed distance either.  A room with a lamp in it is
     lit all the way to its walls - that is what having a lamp means - so
     the dimmer stage belongs where your sight actually stops: the mouth
     of a corridor, a doorway, the last square your own light reaches in
     the dark. */
  for (var d = 0; d < DIR4.length; d++) {
    var nx = mx + DIR4[d][0], ny = my + DIR4[d][1];
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    if (!litGround(nx, ny)) continue;
    if (!(L.flags[ny * MAP_W + nx] & F_VIS)) return true;
  }
  return false;
}

function drawDecor(name, mx, my, px, py, a) {
  /* Two tiles are painted joining something above them and are turned to
     face it: a cracked flagstone faces its hole, an edge of moss faces
     the moss or the wall it grows from.  sprTurn goes clockwise, and the
     unturned case is the thing being above. */
  var faces = isCrack(name) ? holeAt : isMossEdge(name) ? mossAnchorAt : null;
  if (!faces) { spr(name, px, py, a); return; }
  var turn = -1;
  if (faces(mx, my - 1)) turn = 0;             /* above: as painted */
  else if (faces(mx + 1, my)) turn = 1;        /* to the right: a quarter clockwise */
  else if (faces(mx, my + 1)) turn = 2;        /* below: half a turn */
  else if (faces(mx - 1, my)) turn = 3;        /* to the left: a quarter the other way */
  if (turn < 0) { spr(name, px, py, a); return; }
  sprTurn(name, px, py, a, turn);
}
/* What an edge of moss can be growing out of: a square of moss proper,
   or a wall.  Moss on the wall counts first, so a border between two
   walls turns towards the mossy one. */
function mossAnchorAt(mx, my) {
  if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) return false;
  var j = my * MAP_W + mx;
  if (isMoss(L.decor[j]) && !isMossEdge(L.decor[j])) return true;
  return L.tiles[j] === WALL;
}
function holeAt(mx, my) {
  if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) return false;
  return liquidAt(mx, my) === HOLE;
}

/* The four figures on one line.  Returns what it drew, so a test can
   read the line back without a screenshot.

   Three ways of writing it, tried widest first: full labels with the
   maxima, full labels without them, and short labels without them.  The
   line is 128 pixels wide and the numbers are what anybody is reading,
   so the label is the last thing to give. */
var STAT_KEYS = ['str', 'dex', 'wis', 'arm'];
/* the gap between one figure and the next label, which has to be measured
   rather than assumed: the font is proportional */
function statGap() { return textW(' ') || 3; }
var STAT_SHORT = { str: 'St', dex: 'Dx', wis: 'Ws', arm: 'Ar' };
function statFigures(withMax) {
  return {
    str: '' + effStr() + (withMax && P.str < P.mstr ? '/' + P.mstr : ''),
    dex: '' + effDex() + (withMax && P.dex < P.mdex ? '/' + P.mdex : ''),
    wis: '' + effWis() + (withMax && P.wis < P.mwis ? '/' + P.mwis : ''),
    arm: '' + (10 - playerAC())
  };
}
function statLineParts(w) {
  var tries = [[1, 0], [0, 0], [0, 1]], i, k;
  for (i = 0; i < tries.length; i++) {
    var figs = statFigures(!!tries[i][0]), shortLbl = !!tries[i][1], parts = [], wide = 0;
    for (k = 0; k < STAT_KEYS.length; k++) {
      var key = STAT_KEYS[k];
      var s = (shortLbl ? STAT_SHORT[key] : key) + ' ' + figs[key];
      parts.push({ k: key, s: s });
      wide += textW(s) + (k ? statGap() : 0);
    }
    if (wide <= w || i === tries.length - 1) return parts;
  }
  return null;
}
/* Named for the line it draws, not for the stats in it: drawStats was
   already taken by the side panel, and a second declaration of the same
   name quietly replaced the first - so opening the pack drew the panel's
   whole stat block over the top of it. */
function drawStatLine(px, py, w) {
  var parts = statLineParts(w), i, x = px;
  for (i = 0; i < parts.length; i++) {
    text(parts[i].s, x, py, statColour(parts[i].k));
    x += textW(parts[i].s) + statGap();
  }
  return parts;
}

/* A hole is a hole: no sprite, no shading, no light reaching into it.
   Drawn from the sheet it took the light of the room like everything
   else, so at the edge of sight it came out a soft grey square. */
function drawHole(mx, my, px, py, a) {
  rect(px, py, TS, TS, '#000000');
}

/* 0 when nothing is happening, 1 at the moment of the blow, fading to 0
   again as the victim settles back. */
function hurtPhase(ent) {
  if (!ent || !ent.hurt) return 0;
  var age = Date.now() - ent.hurt.t;
  if (age < 0) return 0;                 /* the shot has not landed yet */
  if (age > HURT_MS) { ent.hurt = null; return 0; }
  return 1 - age / HURT_MS;
}
/* Draw something that has just been hit: knocked back a pixel away from
   whatever hit it, with a red wash over the top. */
/* how far into the lunge, 1 at the moment of the swing down to 0 */
function lungePhase(ent) {
  if (!ent || !ent.lunge) return 0;
  var age = Date.now() - ent.lunge.t;
  if (age < 0) return 0;
  if (age > LUNGE_MS) { ent.lunge = null; return 0; }
  return 1 - age / LUNGE_MS;
}

function sprHurt(name, px, py, alpha, ent) {
  var ph = hurtPhase(ent);
  if (ph > 0) {
    px += ent.hurt.dx * HURT_PX;
    py += ent.hurt.dy * HURT_PX;
  }
  /* leaning into a swing, if it is not busy being knocked about */
  var lu = lungePhase(ent);
  if (lu > 0 && ph <= 0) {
    px += ent.lunge.dx * LUNGE_PX;
    py += ent.lunge.dy * LUNGE_PX;
  }
  /* Something with a front and a back is mirrored when it is walking the
     other way.  The red flash over it has to be mirrored with it, or the
     creature and its own wound face opposite ways for a moment. */
  var mirror = ent && ent.face === -1 && ent.def && ent.def.faces;
  if (mirror) sprFlip(name, px, py, alpha);
  else spr(name, px, py, alpha);
  if (ph > 0 && hurtSheet) {
    var i = IX[name];
    if (i !== undefined) {
      cx.globalAlpha = ALPHA * (0.45 + 0.35 * ph);
      if (mirror) {
        cx.save();
        cx.translate(px + TS, py);
        cx.scale(-1, 1);
        cx.drawImage(hurtSheet, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS,
          TS, TS, 0, 0, TS, TS);
        cx.restore();
      } else {
        cx.drawImage(hurtSheet, (i % ATLAS.cols) * TS, ((i / ATLAS.cols) | 0) * TS,
          TS, TS, px, py, TS, TS);
      }
      cx.globalAlpha = ALPHA;
    }
  }
  return ph;
}

/* wallVariant and tileHash live in part1: which face a square wears is
   decided by where it is and nothing else, and the floor builder needs
   the answer too - moss gathers thicker along a wall that has moss
   growing on it.  A copy of wallVariant was left here for a while and
   quietly went stale; there is one of it now. */

/* ================================================== the panel steps aside
   Hold SHIFT and the left panel slides off to the left, uncovering the
   map underneath it, and the arrow keys push the view about instead of
   pushing you about.  Let go and it slides back.

   The map is not moved to make room: it was always drawn full width and
   simply covered up, so nothing jumps when the panel goes. */
function panShift() {
  if (!G.pan) return 0;
  var f = (Date.now() - G.pan.t) / PAN_SLIDE;
  if (f > 1) f = 1;
  if (f < 0) f = 0;
  return Math.round(PANEL_W * (G.pan.open ? f : 1 - f));
}
/* Open or close it, picking up from wherever the slide has got to, so
   letting go halfway through does not snap. */
function panSet(open) {
  var now = Date.now(), s = panShift() / PANEL_W;
  if (!G.pan) {
    if (!open) return;
    G.pan = { open: 1, t: now, dx: 0, dy: 0 };
    return;
  }
  if (!!G.pan.open === !!open) { if (open) G.pan.t = Math.min(G.pan.t, now); return; }
  G.pan.open = open ? 1 : 0;
  G.pan.t = now - PAN_SLIDE * (open ? s : 1 - s);
}
/* once it is all the way back in, forget it ever happened */
function panSettle() {
  if (G.pan && !G.pan.open && panShift() === 0) G.pan = null;
}
function panning() { return !!(G.pan && G.pan.open); }
function panKey(k) {
  if (!G.pan) return false;
  var d = keyDir(k);
  if (!d) return false;
  G.pan.dx = clamp(G.pan.dx + d[0], -PAN_MAX, PAN_MAX);
  G.pan.dy = clamp(G.pan.dy + d[1], -PAN_MAX, PAN_MAX);
  return true;
}

/* How brightly a square you can see is drawn: full, or the shade of a
   dark room you happen to be able to see into. */
function shadeAt(x, y) {
  return (L.darkMap && L.darkMap[y * MAP_W + x]) ? NIGHT_SHADE : 1;
}

function drawMap() {
  /* Sliding: the whole map is drawn off its own grid, with the map area
     clipped so nothing spills onto the panel, and enough extra tiles
     drawn beyond the edges to fill the space the shift opens up.

     One extra row and column used to be all it drew.  A slide of half a
     screen shifts the picture by far more than that, so most of the
     screen had nothing drawn on it and the map went black exactly when
     you wanted to watch it travel. */
  var slip = camSlip();
  if (slip.x || slip.y) {
    cx.save();
    cx.beginPath();
    cx.rect(0, 0, SW, SH);
    cx.clip();
    cx.translate(slip.x, slip.y);
    drawMapAt(Math.ceil(Math.abs(slip.x) / TS) + 1,
              Math.ceil(Math.abs(slip.y) / TS) + 1);
    cx.restore();
    return;
  }
  drawMapAt(0, 0);
}
function drawMapAt(overX, overY) {
  /* Never clamped: you sit in the middle of the screen wherever you are,
     so the edge of the map never gives away which way is out. */
  var shift = panShift();
  /* how many columns of map the retreating panel has uncovered */
  var pcols = Math.ceil(shift / TS);
  var pdx = (G.pan ? G.pan.dx : 0) + (G.drag ? G.drag.dx : 0);
  var pdy = (G.pan ? G.pan.dy : 0) + (G.drag ? G.drag.dy : 0);
  var camx = P.x - (VIEW_W >> 1) + pdx;
  var camy = P.y - (VIEW_H >> 1) + pdy;
  var vx, vy, i;

  for (vy = -overY; vy < VIEW_H + overY; vy++) {
    for (vx = -pcols - overX; vx < VIEW_W + overX; vx++) {
      var mx = camx + vx, my = camy + vy;
      if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) continue;
      var idx = my * MAP_W + mx;
      var f = L.flags[idx];
      if (!(f & F_SEEN)) continue;
      /* Seen with night eyes, everything in a dark room is there to be
         read - but it is still a dark room, and it is drawn like one.
         Without the shade there is no way to tell you are standing in
         one at all. */
      /* Three stages: bright near you, dimmer at the edge of what you
         can see, and dimmer still for what you only remember. */
      var a;
      if (!(f & F_VIS)) a = DIM_A;
      else if (L.darkMap && L.darkMap[idx]) a = NIGHT_SHADE;
      else a = tileLight(mx, my);
      var px = VIEW_PX + vx * TS, py = VIEW_PY + vy * TS;
      switch (L.tiles[idx]) {
        case WALL: case SDOOR:
          spr(wallVariant(mx, my), px, py, a);
          drawWallEdging(mx, my, px, py, a);
          break;
        case FLOOR:
          /* the three flagstones, dealt by the same hash the rest of the
             drawing uses.  This line had its own pattern - two of the
             three stones, one of them every eighth square, in stripes -
             so floor3 was never laid at all. */
          spr(floorSprite(mx, my), px, py, a);
          drawWallEdging(mx, my, px, py, a);
          drawEdging(mx, my, px, py, a);
          if (L.decor[idx] && !(L.showAt && L.showAt[idx] && Date.now() < L.showAt[idx]))
            drawDecor(L.decor[idx], mx, my, px, py, a);
          break;
        case WATER:
          spr(((mx + my) & 1) ? 'water' : 'water2', px, py, a);
          drawLiquidCorners(mx, my, px, py, a);
          break;
        case HOLY:
          spr(((mx + my + ((Date.now() / 420) | 0)) & 1) ? 'holy' : 'holy2', px, py, a);
          break;
        case HOLE:
          drawHole(mx, my, px, py, a);
          drawLiquidCorners(mx, my, px, py, a);
          break;
        case CORR: spr('corr', px, py, a); break;
        case BRIDGE: drawBridge(mx, my, px, py, a); break;
        /* the floor shows between the bars */
        case BARS: spr(floorSprite(mx, my), px, py, a);
          spr('bars', px, py, a); break;
        case ICEWALL: spr('ice_wall', px, py, a); break;
        case FIREWALL: spr('fire_wall', px, py, a); break;
        case DOOR:
          spr('door_' + MATS[L.doorMat[idx] || 0], px, py, a); break;
        case LOCKED:
          spr('door_' + MATS[L.locks[idx] || 0], px, py, a);
          spr('keyhole', px, py, a); break;
        case STAIR: spr('floor', px, py, a); spr('stairs_down', px, py, a); break;
        case STAIR_UP: spr('floor', px, py, a); spr('stairs_up', px, py, a); break;
      }
      var tr = trapAt(mx, my);
      if (tr && tr.found) spr(tr.k.spr || 'trap', px, py, a);
    }
  }
  for (i = 0; i < L.items.length; i++) {
    var it = L.items[i];
    var fl = L.flags[it.y * MAP_W + it.x];
    if (!(fl & F_SEEN)) continue;
    /* A square you only know from a map shows what is built into the
       floor - a chest stands there like furniture - but not the loose
       things lying on it, which no map ever recorded. */
    if ((fl & F_MAP) && it.t !== 'chest') continue;
    var ivx = it.x - camx, ivy = it.y - camy;
    if (ivx < -pcols - overX || ivy < -overY ||
        ivx >= VIEW_W + overX || ivy >= VIEW_H + overY) continue;
    spr(itemSprite(it), VIEW_PX + ivx * TS, VIEW_PY + ivy * TS,
      (fl & F_VIS) ? shadeAt(it.x, it.y) : 0.45);
  }
  /* the dead linger for a moment, blinking, so you see what you hit */
  for (i = L.corpses.length - 1; i >= 0; i--) {
    var co = L.corpses[i];
    var age = Date.now() - co.t;
    if (age > 620) { L.corpses.splice(i, 1); continue; }
    var cvx = co.x - camx, cvy = co.y - camy;
    if (cvx < -pcols - overX || cvy < -overY ||
        cvx >= VIEW_W + overX || cvy >= VIEW_H + overY) continue;
    if (age < 0) { spr(co.spr, VIEW_PX + cvx * TS, VIEW_PY + cvy * TS, 1); continue; }
    if (((age / 90) | 0) % 2 === 0)
      spr(co.spr, VIEW_PX + cvx * TS, VIEW_PY + cvy * TS, 1);
  }

  var markers = [];
  for (i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    var see = monShown(m), det = sensedMon(m);
    if (!see && !det) continue;
    /* conjured a moment ago and not there yet */
    if (m.showAt && Date.now() < m.showAt) continue;
    /* Both ends of the step it is taking, because it is drawn somewhere
       between them.  This used to throw it out on the square it ends on:
       one that walks a long way out of the view - or is picked up and
       put down somewhere else - was dropped before the drawing had a
       chance to show it still standing where you last saw it. */
    var mb = monBetween(m);
    var mvx = Math.min(mb[0], mb[2]) - camx, mvy = Math.min(mb[1], mb[3]) - camy;
    var mvx2 = Math.max(mb[0], mb[2]) - camx, mvy2 = Math.max(mb[1], mb[3]) - camy;
    if (mvx2 < -pcols - 1 - overX || mvy2 < -1 - overY ||
        mvx > VIEW_W + overX || mvy > VIEW_H + overY) continue;
    var pos = monPixel(m, camx, camy);
    /* on its way somewhere else, or arriving */
    var wp = warpPhase(m.warp);
    if (wp) {
      if (wp.part === 'flash') {
        drawWarpFlash(m.warp.fx, m.warp.fy, camx, camy, pcols, wp.age);
        drawWarpFlash(m.x, m.y, camx, camy, pcols, wp.age);
        continue;
      }
      if (wp.part === 'shake') {
        var j = warpJitter(m.warp, wp.age);
        pos = [VIEW_PX + (m.warp.fx - camx) * TS + j[0],
               VIEW_PY + (m.warp.fy - camy) * TS + j[1]];
      } else {
        pos = [VIEW_PX + (m.warp.fx - camx) * TS, VIEW_PY + (m.warp.fy - camy) * TS];
      }
    } else if (m.warp) m.warp = null;
    /* The square it stands on is inside the view, but it is drawn where
       the walk animation has got to - which for a creature stepping in
       from off-screen can be a whole tile outside it. */
    if (pos[0] < VIEW_PX - shift - TS || pos[1] < VIEW_PY - TS ||
        pos[0] > VIEW_PX + VIEW_W * TS || pos[1] > VIEW_PY + VIEW_H * TS) continue;
    var nm = m.disguise ? 'chest' : ('mon_' + (P.hallu ? MONS[rnd(MONS.length)].c : m.c));
    /* Something that should not be visible at all, that you can see
       anyway, is drawn as the half-thing it is - so the effect that
       lets you see it plainly shows you it is working. */
    var ghost = m.invis ? 0.55 : 1;
    sprHurt(nm, pos[0], pos[1], (see ? shadeAt(m.x, m.y) : 0.5) * ghost, m);
    /* what it knows about you: asleep, suspicious, or just caught sight */
    if (see && !m.disguise) {
      var mk = m.ally ? 'mk_ally' : m.surprised ? 'mk_x' :
        m.state === 0 ? 'mk_z' : m.state === 1 ? 'mk_q' : null;
      if (mk) markers.push([mk, pos[0], pos[1] - 6]);
    }
    /* alight, or frozen where it stands: both drawn over the creature
       so you can tell at a glance what is happening to it */
    if (see && m.burn > 0) spr('flame', pos[0], pos[1], 0.85);
    /* web looks like web and ice looks like ice: the block of ice used
       to be drawn over anything held for any reason at all */
    else if (see && m.webbed > 0) spr('web', pos[0], pos[1], 0.9);
    else if (see && m.stuck > 0) spr('icecube', pos[0], pos[1], 0.7);
  }
  /* drawn last so they sit on top of whatever is behind them */
  for (i = 0; i < markers.length; i++)
    spr(markers[i][0], markers[i][1], Math.max(VIEW_PY, markers[i][2]), 1);
  /* Something in the air.  A moss garden has spores drifting through it
     and a holy pool has a light coming off the water, and both are drawn
     the same way: a handful of single pixels wandering the room.

     Each mote is a number rather than a thing that is kept and stepped -
     position comes out of the clock and the mote's own index - so they
     cost nothing, there is nothing to save, and they carry on where they
     were when you come back to the floor. */
  for (i = 0; i < L.rooms.length; i++) {
    var mr = L.rooms[i];
    if (mr.gone) continue;
    var mcol = mr.special === 'moss' ? '#93bd27' : null;
    if (!mcol && L.holy && roomIndexAt(L.holy.x, L.holy.y) === i) mcol = '#74d6e8';
    if (!mcol) continue;
    for (var q = 0; q < MOTES_PER_ROOM; q++) {
      /* its own drift, its own pace, its own corner of the room */
      var ph = (Date.now() / MOTE_MS) + q * 0.61803;
      var swirl = Math.sin(ph * 2.1 + q) * 0.5 + 0.5;
      var rise = (ph + q * 0.137) % 1;
      var fx2 = mr.x + 0.5 + (mr.w - 1) * (((q * 0.7548 + swirl * 0.22) % 1));
      var fy2 = mr.y + mr.h - 0.5 - (mr.h - 1) * rise;
      var mvx = fx2 - camx, mvy = fy2 - camy;
      if (mvx < -pcols - overX || mvy < -overY ||
          mvx >= VIEW_W + overX || mvy >= VIEW_H + overY) continue;
      var mj = ((fy2 | 0) * MAP_W + (fx2 | 0));
      if (!(L.flags[mj] & F_VIS)) continue;
      /* brightest in the middle of its climb, so they wink in and out */
      var lifeA = Math.sin(rise * Math.PI);
      if (lifeA <= 0.08) continue;
      cx.globalAlpha = ALPHA * lifeA * 0.75;
      rect(Math.round(VIEW_PX + mvx * TS), Math.round(VIEW_PY + mvy * TS), 1, 1, mcol);
      cx.globalAlpha = ALPHA;
    }
  }

  /* A barrel with its fuse lit.  It burns for a turn before it goes, and
     that turn is the one you have to get out of the room in - so it has
     to be visible that it is burning, not only said once in the log. */
  for (var fk in (L.fuses || {})) {
    var fj = fk | 0, fbx = fj % MAP_W, fby = (fj / MAP_W) | 0;
    var fcx = fbx - camx, fcy = fby - camy;
    if (fcx < -pcols - overX || fcy < -overY ||
        fcx >= VIEW_W + overX || fcy >= VIEW_H + overY) continue;
    if (!(L.flags[fj] & F_VIS)) continue;
    var fz = ((Date.now() / 90 + fbx * 3 + fby * 5) | 0) % 2;
    spr(fz ? 'flame' : 'fire_wall', VIEW_PX + fcx * TS, VIEW_PY + fcy * TS, 1);
  }
  /* lingering gas */
  for (i = 0; i < L.clouds.length; i++) {
    var cl = L.clouds[i];
    var clx = cl.x - camx, cly = cl.y - camy;
    if (clx < -pcols - overX || cly < -overY ||
        clx >= VIEW_W + overX || cly >= VIEW_H + overY) continue;
    if (!(L.flags[cl.y * MAP_W + cl.x] & F_VIS)) continue;
    /* thrown fire is worked out at once and arrives a beat later */
    if (cl.at && Date.now() < cl.at) continue;
    if (cl.kind === 'fire') {
      /* flames flicker, so no two squares look stamped from the same die */
      var ff = ((Date.now() / 120 + cl.x * 3 + cl.y * 5) | 0) % 2;
      spr(ff ? 'flame' : 'fire_wall', VIEW_PX + clx * TS, VIEW_PY + cly * TS, 0.9);
    } else {
      /* Fumes roll: each square drifts on its own phase and breathes in
         and out, so a cloud never sits there as a grid of stamps. */
      var ph = (Date.now() / 260) + (cl.seed || 0);
      var bob = Math.round(Math.sin(ph) * 1.4);
      var sway = Math.round(Math.cos(ph * 0.7) * 1.2);
      var puff = 0.52 + 0.28 * (0.5 + 0.5 * Math.sin(ph * 1.3));
      /* thinning as it runs out, so you can see it is about to go */
      if (cl.turns <= 1) puff *= 0.6;
      /* the same rolling fumes, tinted red when they mend rather than
         poison - one sheet, already made for the flash of a wound */
      if (cl.kind === 'mend' && hurtSheet)
        sprFrom(hurtSheet, 'gas', VIEW_PX + clx * TS + sway,
          VIEW_PY + cly * TS + bob, puff);
      else
        spr('gas', VIEW_PX + clx * TS + sway, VIEW_PY + cly * TS + bob, puff);
    }
  }

  /* water that has just been frozen or electrified */
  if (G.splash) {
    if (Date.now() - G.splash.t > 320) G.splash = null;
    else {
      var sn = G.splash.kind === 'cold' ? 'frost' :
        G.splash.kind === 'blast' ? 'flame' : 'bolt';
      for (i = 0; i < G.splash.cells.length; i++) {
        var sx2 = G.splash.cells[i][0] - camx, sy2 = G.splash.cells[i][1] - camy;
        if (sx2 < 0 || sy2 < 0 || sx2 >= VIEW_W || sy2 >= VIEW_H) continue;
        if (!(L.flags[G.splash.cells[i][1] * MAP_W + G.splash.cells[i][0]] & F_VIS)) continue;
        spr(sn, VIEW_PX + sx2 * TS, VIEW_PY + sy2 * TS, 1);
      }
    }
  }
  /* one projectile, flying, facing the way it was sent */
  if (G.bolt) {
    var age = Date.now() - G.bolt.t;
    var life = G.bolt.mode === 'beam' ? 220 : 40 * G.bolt.path.length + 90;
    if (age > life || !G.bolt.path.length) G.bolt = null;
    /* Set to start later than now - a creature waits a beat before it
       breathes - so there is nothing to draw yet.  Keep it and wait. */
    else if (age < 0) { /* not yet */ }
    else {
      var kk = G.bolt.kind;
      /* A wand throws one of four things.  There used to be a fifth
         kind here, 'shot', carrying its own sprite name - nothing has
         set it for a long time, and the four pointing arrows it drew
         went with it. */
      var name = kk === 'fire' ? 'flame' : kk === 'cold' ? 'frost' :
        kk === 'lightning' ? 'bolt' : 'magic';
      if (G.bolt.mode === 'beam') {
        for (i = 0; i < G.bolt.path.length; i++) drawBolt(name, G.bolt.path[i], camx, camy);
      } else {
        var step = Math.min(G.bolt.path.length - 1, (age / 40) | 0);
        drawBolt(name, G.bolt.path[step], camx, camy);
      }
    }
  }
  /* The walk cycle belongs to walking.  Standing still, you stand still. */
  var stepping = P.walkT && Date.now() - P.walkT < WALK_ANIM_MS;
  var frame = stepping ? (((Date.now() - P.walkT) / 90 | 0) % 2) : 0;
  var hpx = VIEW_PX + (P.x - camx) * TS, hpy = VIEW_PY + (P.y - camy) * TS;
  /* Pushed far enough about, your own square leaves the screen.  Draw
     nothing rather than something off the edge of the buffer. */
  var onScreen = hpx > -TS - shift && hpx < SW && hpy > -TS && hpy < SH;
  /* Dying, you flicker out.  It is the one thing that needs no caption. */
  var goneNow = (G.mode === 'dying' && ((Date.now() / DEATH_BLINK_MS) | 0) % 2) || !onScreen;
  /* Unseen: you are still there, and you still need to see where you
     are, so you go translucent rather than away. */
  /* Shaded with everything else when you are standing in the dark: a
     room drawn dark with one bright figure in the middle of it does not
     read as a dark room. */
  var mine = shadeAt(P.x, P.y);
  /* On your way somewhere else: the same shake, the same two flashes as
     anything else that goes without walking. */
  var pwp = warpPhase(P.warp);
  if (pwp) {
    if (pwp.part === 'flash') {
      drawWarpFlash(P.warp.fx, P.warp.fy, camx, camy, pcols, pwp.age);
      drawWarpFlash(P.x, P.y, camx, camy, pcols, pwp.age);
      goneNow = 1;
    } else if (pwp.part === 'shake') {
      var pj = warpJitter(P.warp, pwp.age);
      hpx = VIEW_PX + (P.warp.fx - camx) * TS + pj[0];
      hpy = VIEW_PY + (P.warp.fy - camy) * TS + pj[1];
    } else {
      hpx = VIEW_PX + (P.warp.fx - camx) * TS;
      hpy = VIEW_PY + (P.warp.fy - camy) * TS;
    }
  } else if (P.warp) P.warp = null;
  if (!goneNow) sprHurt(frame ? 'hero2' : 'hero', hpx, hpy,
    (P.unseen > 0 ? 0.45 : 1) * mine, P);
  /* Frozen solid: a block of ice round you, so it is plain why nothing
     is happening when you press a key. */
  if (P.iced > 0 && !goneNow) spr('icecube', hpx, hpy, 0.8 * mine);

  /* The ring of fire is not on the floor, so nothing else draws it: it
     hangs in the air around you and moves when you do. */
  if (P.fireShield > 0) {
    var ring = fireShieldCells(), ri;
    for (ri = 0; ri < ring.length; ri++) {
      var rvx = ring[ri][0] - camx, rvy = ring[ri][1] - camy;
      if (rvx < -pcols - overX || rvy < -overY ||
          rvx >= VIEW_W + overX || rvy >= VIEW_H + overY) continue;
      /* flicker, so it reads as flame rather than a painted tile */
      var fa = 0.7 + 0.3 * Math.sin((Date.now() / 90) + ri);
      spr('flame', VIEW_PX + rvx * TS, VIEW_PY + rvy * TS, fa);
    }
  }

  /* a flask bursting: droplets thrown out and falling back */
  if (G.drops) {
    var df = (Date.now() - G.drops.t) / G.drops.dur;
    if (df >= 1) G.drops = null;
    else if (df >= 0) {
      var ox = VIEW_PX + (G.drops.x - camx) * TS + 4;
      var oy = VIEW_PY + (G.drops.y - camy) * TS + 4;
      cx.globalAlpha = ALPHA * (1 - df * df);   /* fade out towards the end */
      for (i = 0; i < G.drops.parts.length; i++) {
        var pt = G.drops.parts[i];
        /* out fast, then gravity takes over */
        var dxp = ox + pt.dx * df * TS;
        var dyp = oy + pt.dy * df * TS + 7 * df * df;
        var sz = df < 0.5 ? 2 : 1;
        if (dxp >= VIEW_PX - shift && dxp < SW - 1 && dyp >= VIEW_PY && dyp < SH - 1)
          rect(Math.round(dxp), Math.round(dyp), sz, sz, G.drops.col);
      }
      cx.globalAlpha = ALPHA;
    }
  }

  /* a runed stone on its way back to your hand */
  if (G.ret) {
    var rf = (Date.now() - G.ret.t) / G.ret.dur;
    if (rf >= 1 || rf < 0) { if (rf >= 1) G.ret = null; }
    else {
      var rx = G.ret.fx + (G.ret.tx - G.ret.fx) * rf;
      var ry = G.ret.fy + (G.ret.ty - G.ret.fy) * rf;
      var rvx = Math.round(VIEW_PX + (rx - camx) * TS);
      var rvy = Math.round(VIEW_PY + (ry - camy) * TS);
      if (rvx >= VIEW_PX - shift - TS && rvy >= VIEW_PY - TS && rvx < SW && rvy < SH)
        spr(G.ret.spr, rvx, rvy, 1);
    }
  }

  /* the arrow: a short line segment sliding along its true flight path */
  if (G.shot) {
    var f = (Date.now() - G.shot.t) / G.shot.dur;
    if (f >= 1) G.shot = null;
    else if (f < 0) { /* thrown on a later beat: nothing in the air yet */ }
    else {
      var ax = tileCX(G.shot.sx, camx), ay = tileCY(G.shot.sy, camy);
      var bx2 = tileCX(G.shot.ex, camx), by2 = tileCY(G.shot.ey, camy);
      var vx = bx2 - ax, vy = by2 - ay;
      var len = Math.sqrt(vx * vx + vy * vy) || 1;
      var hx = ax + vx * f, hy = ay + vy * f;
      var ux = vx / len, uy = vy / len;
      if (G.shot.spr && IX[G.shot.spr] !== undefined) {
        /* a thrown thing is drawn as itself, tumbling along the line */
        spr(G.shot.spr, Math.round(hx - TS / 2), Math.round(hy - TS / 2), 1);
      } else {
        /* a bolt is a short steel dash, an arrow a longer wooden streak */
        var tail = G.shot.tail || 5;
        line(hx - ux * tail, hy - uy * tail, hx, hy, G.shot.col || '#c3ccd9');
        line(hx - ux * 1.5, hy - uy * 1.5, hx, hy, G.shot.col ? '#fad039' : '#ffffff');
      }
    }
  }

  if (G.mode === 'choose' && G.choice) drawChoice();
  if (G.mode === 'look') drawLook(camx, camy);
  if (G.mode === 'pause') drawPause();
  if (G.mode === 'slots') drawSlots();
  if (G.mode === 'hint') drawHints();

  /* choosing what to shoot at */
  if (G.mode === 'target' && G.targets.length) {
    var tm = G.targets[G.tIdx];
    line(tileCX(P.x, camx), tileCY(P.y, camy),
         tileCX(tm.x, camx), tileCY(tm.y, camy), '#636d85');
    spr('cursor', VIEW_PX + (tm.x - camx) * TS, VIEW_PY + (tm.y - camy) * TS, 1);
  }
  /* choosing where to lob something */
  if (G.mode === 'aim' && G.aimSq) {
    var ok2 = throwValid(G.aimSq.x, G.aimSq.y, G.throwing);
    line(tileCX(P.x, camx), tileCY(P.y, camy),
         tileCX(G.aimSq.x, camx), tileCY(G.aimSq.y, camy),
         ok2 ? '#f59e0b' : '#8a202b');
    spr('cursor', VIEW_PX + (G.aimSq.x - camx) * TS,
        VIEW_PY + (G.aimSq.y - camy) * TS, 1);
  }
  /* choosing where to blink - through walls, at your own risk */
  if (G.mode === 'blink' && G.bl) {
    var land = blinkLanding(G.bl.x, G.bl.y);
    line(tileCX(P.x, camx), tileCY(P.y, camy),
         tileCX(G.bl.x, camx), tileCY(G.bl.y, camy),
         land === 'far' ? '#8a202b' : '#6b2f9c');
    spr('cursor', VIEW_PX + (G.bl.x - camx) * TS, VIEW_PY + (G.bl.y - camy) * TS, 1);
  }
}

/* --- the top bar.  In a fight it splits three ways: what you did, what
   it did, and how the other fellow is faring. ------------------------ */
/* How much text a panel line holds, worked out from the font once. */
function fitBars() {
  LH = FNT.ch;                       /* one line of text, from the sheet */
  LOG_LINE = LH;
  TPAD = 0;
  LOG_W = PANEL_W - PX0 - 2;         /* the panel measures in pixels now */
  FLAG_Y = SH - LH;                  /* the last line, flush with the floor */
  STAT_Y = FLAG_Y - 2 - STAT_H;
}

/* ============================================================ the panel
   Everything that is not the map lives down the left hand side: the
   things that have just happened, then your keys, then your stats. */
/* The panel, wherever the slide has left it.  Its contents are only
   worth drawing when it is home: the slide is a seventh of a second and
   nobody reads a moving column of text.  What you get instead is the
   slab and its edge travelling off, which is what makes it read as the
   panel leaving rather than the map growing. */
function drawSidePanel() {
  var shift = panShift();
  if (shift <= 0) { drawPanel(); return; }
  if (shift < PANEL_W) {
    rect(-shift, 0, PANEL_W, SH, '#0b0d1c');
    rect(PANEL_W - 1 - shift, 0, 1, SH, '#2b3352');
  }
  /* and the compass, once there is room for it, to say that the arrows
     now move the view rather than you */
  if (shift > PANEL_W >> 1) {
    rect(0, 0, 10, 10, '#0b0d1c');
    spr('pan_cross', 1, 1, 1);
  }
}
function drawPanel() {
  rect(0, 0, PANEL_W, SH, '#0b0d1c');
  rect(PANEL_W - 1, 0, 1, SH, '#2b3352');

  var foes = battleFoes();
  var bTop = STAT_Y - 3 - foes.length * BATTLE_ROW;
  var pr = panelPrompt();
  var room = Math.max(1, ((bTop - 3 - LOG_Y) / LOG_LINE) | 0);
  drawLog(Math.max(1, room - pr.length), pr);
  if (foes.length) {
    rect(PX0, bTop - 3, PANEL_W - PX0 - 2, 1, '#2b3352');
    drawBattle(foes, bTop);
  }
  rect(PX0, STAT_Y - 3, PANEL_W - PX0 - 2, 1, '#2b3352');
  drawStats();
}

/* One row each: what it is, and how much of it is left. */
function drawBattle(foes, y0) {
  for (var i = 0; i < foes.length; i++) {
    var m = foes[i], y = y0 + i * BATTLE_ROW;
    spr(m.disguise ? 'chest' : 'mon_' + m.c, PX0, y, 1);
    var frac = clamp(m.hp / m.mhp, 0, 1);
    var bx = PX0 + 10, bw = 40;
    rect(bx, y + 2, bw, 5, '#2b3352');
    rect(bx, y + 2, bw, 1, '#3f4966');
    var w = Math.round(bw * frac);
    if (w > 0) rect(bx, y + 2, w, 5,
      frac > 0.5 ? '#93bd27' : frac > 0.25 ? '#f59e0b' : '#d82b2b');
    var hs = m.hp + '/' + m.mhp;
    var hx = bx + bw + 2;
    if (hx + textW(hs) > PANEL_W - 1) hs = '' + m.hp;
    text(hs, hx, y + 1, frac > 0.25 ? '6' : 'R');
  }
}

/* Flatten the log into panel rows, newest last.  A fight or trap line
   contributes its text, then an indented line for what it did. */
function logRows(maxRows) {
  var rows = [], i, j, now = Date.now();
  for (i = G.log.length - 1; i >= 0; i--) {
    var e = G.log[i];
    if (e.at && e.at > now) continue;    /* has not happened yet */
    var block = [];
    var age = G.turn - (e.t || 0);
    var lines = wrap(e.s, LOG_W);
    for (j = 0; j < lines.length; j++)
      block.push({ s: lines[j], c: age === 0 ? e.c : age <= 2 ? '6' : '4' });
    /* no health bar here - the battle panel below shows that */
    if (e.fx) block.push({ s: e.fx, c: age === 0 ? e.fc : '4', ind: 1 });
    /* whole messages only - half a sentence at the top reads as a glitch */
    if (rows.length + block.length > maxRows) break;
    rows = block.concat(rows);
  }
  return rows;
}

function drawLog(maxRows, extra) {
  var rows = logRows(maxRows), i;
  if (extra && extra.length) rows = rows.concat(extra);
  for (i = 0; i < rows.length; i++) {
    var row = rows[i], y = LOG_Y + i * LOG_LINE;
    var x = PX0 + (row.ind ? 3 : 0);
    text(clipTo(row.s, LOG_W - (row.ind ? 3 : 0)), x, y, row.c);
  }
}

/* Your keys, then six numbers with a picture each, then whatever is
   currently being done to you. */
function drawStats() {
  /* the meter reads the health you have been shown, not the health the
     turn has already worked out - see shownHp */
  var sh = shownHp();
  var frac = clamp(sh.hp / Math.max(1, sh.mhp), 0, 1);
  var hpCol = frac <= 0.25 ? 'R' : frac <= 0.5 ? 'O' : '6';

  /* A heart, then a meter with the two numbers written inside it, then
     what you are carrying. */
  var bx = PX0 + 9, bw = (PANEL_W >> 1);
  spr('heart', PX0, STAT_Y, 1);
  rect(bx, STAT_Y, bw, HP_BAR_H, '#2b3352');
  rect(bx, STAT_Y, bw, 1, '#3f4966');
  var w = Math.round(bw * frac);
  if (w > 0) rect(bx, STAT_Y, w, HP_BAR_H,
    frac > 0.5 ? '#93bd27' : frac > 0.25 ? '#f59e0b' : '#d82b2b');
  text('' + sh.hp, bx + 2, STAT_Y, 'w');
  textR('' + sh.mhp, bx + bw - 2, STAT_Y, frac > 0.5 ? 'w' : '6');

  var gx = bx + bw + 2;
  spr('gold', gx, STAT_Y, 1);
  text(clipTo('' + P.gold, PANEL_W - gx - 10), gx + 8, STAT_Y + 1, 'y');

  var rows = [
    [['stairs_down', floorName(), '6'], ['hero', '' + P.lv, '6']],
    [['sword', '' + effStr(), P.str < P.mstr ? 'R' : '6'],
     ['armor_c', '' + (10 - playerAC()), '6']],
    /* the two clocks you are always running against: what the next
       level costs, and how long the food holds out */
    [['magic', xpText(), '6'],
     ['food', foodPct() + '%', foodCol()]]
  ];
  var r2, c2;
  for (r2 = 0; r2 < rows.length; r2++) {
    var y = STAT_Y + 12 + r2 * STAT_ROW;
    for (c2 = 0; c2 < 2; c2++) {
      var g = rows[r2][c2], x = PX0 + c2 * STAT_COL;
      spr(g[0], x, y, 1);
      text(g[1], x + 9, y + 1, g[2]);
    }
  }
  var fl = [];
  if (G.hungerState === 1) fl.push('Hungry');
  if (G.hungerState === 2) fl.push('Weak');
  if (G.hungerState === 3) fl.push('Starving');
  if (P.conf) fl.push('Conf');
  if (P.blind) fl.push('Blind');
  if (P.hallu) fl.push('Halu');
  if (P.haste) fl.push('Fast');
  if (P.frozen) fl.push('Stuck');
  if (P.scare) fl.push('Scare');
  if (P.amulet) fl.push('AMULET');
  /* The pack, in the corner, where a mouse can reach it without knowing
     that TAB opens it.  The flags shuffle along to make room. */
  var px2 = PX0, fx2 = PX0;
  if (usingPointer()) {
    /* flush with the floor of the screen: the flags line is the last one
       there is, so the icon sits in it rather than under it */
    var py2 = SH - TS;
    spr('pouch', px2, py2, 1);
    hit(px2, py2, TS + 1, TS, 'pack', 0);
    fx2 = px2 + TS + 2;
  }
  var s = clipTo(fl.join(' '), LOG_W - (fx2 - PX0));
  if (s) text(s, fx2, FLAG_Y, G.hungerState >= 2 ? 'R' : 'O');
}

/* Your keys, in the top corner of the map.  Nothing important happens
   that far from you, so they cost you no view. */
function drawKeyBelt() {
  var i, w = 0, n;
  for (i = 0; i < P.keys.length; i++) {
    if (!P.keys[i]) continue;
    w += 8 + (P.keys[i] > 1 ? textW(String(P.keys[i])) : 0) + 1;
  }
  if (!w) return;
  var x = SW - w - 1, y = 1;
  rect(x - 2, y - 1, w + 3, 10, '#0b0d1c');
  frame(x - 2, y - 1, w + 3, 10, '#2b3352');
  for (i = 0; i < P.keys.length; i++) {
    if (!P.keys[i]) continue;
    spr('key_' + MATS[i], x, y, 1);
    x += 8;
    if (P.keys[i] > 1) { n = String(P.keys[i]); text(n, x, y + 1, 'y'); x += textW(n); }
    x += 1;
  }
}

/* ---------------------------------------------------------- inv screen */
/* A slot you cannot use: struck through, corner to corner. */
function crossOut(x, y) {
  line(x + 2, y + 2, x + SL - 3, y + SL - 3, '#8a202b');
  line(x + 3, y + 2, x + SL - 3, y + SL - 4, '#8a202b');
}

function slotBox(x, y, it, hi, sel, dim) {
  /* under the pointer: the square lifts a little, so it is plain which
     one a click would land on without moving the keyboard cursor */
  var over = usingMouse() && MOUSE.on &&
    MOUSE.x >= x && MOUSE.y >= y && MOUSE.x < x + SL && MOUSE.y < y + SL;
  rect(x, y, SL, SL, sel ? '#1b2a3d' : over ? '#1b2140' : '#12172c');
  frame(x, y, SL, SL, hi ? '#fad039' : sel ? '#74d6e8' : over ? '#636d85' : '#3f4966');
  if (it) {
    sprS(itemSprite(it), x + 1, y + 1, 2);
    if (it.cnt > 1) {
      var t = String(it.cnt);
      rect(x + SL - 1 - textW(t), y + SL - LH, textW(t), LH, '#0b0d1c');
      text(t, x + SL - 1 - textW(t), y + SL - LH, 'y');
    }
    if (it.t === 'pouch') {
      var pc = String(pouchCount(it));
      rect(x + 1, y + SL - LH, textW(pc) + 1, LH, '#0b0d1c');
      text(pc, x + 1, y + SL - LH, 'k');
    }
  }
  if (dim) { cx.globalAlpha = ALPHA * 0.55; rect(x + 1, y + 1, SL - 2, SL - 2, '#0b0d1c'); cx.globalAlpha = ALPHA; }
}

/* The narrowest the pack's top line ever gets: the counter on the right
   is at its widest with every square of the roomiest container full. */
function packLineRoom() {
  var widest = 0, i;
  var counters = ['PACK ' + N_SLOTS + '/' + N_SLOTS,
                  'POUCH ' + POUCH_CAP + '/' + POUCH_CAP,
                  'CHEST ' + CHEST_CAP + '/' + CHEST_CAP];
  for (i = 0; i < counters.length; i++) {
    var w = textW(counters[i]);
    if (w > widest) widest = w;
  }
  return SW - 2 - widest - 4 - GX;
}
function packLineFits(s) { return textW(s) <= packLineRoom(); }

function drawInv() {
  var c, i, x, y;
  var ref = bindRef(cursorRef());
  var hov = refGet(ref);

  rect(0, 0, SW, SH, '#0b0d1c');
  var picking = G.invMode === 'pick';

  /* The log lives behind this screen, so the last thing said is repeated
     across the top - otherwise rummaging happens in silence. */
  var head = '';
  if (picking) head = (G.pickJob.kind === 'identify') ? 'Identify what?'
    : (G.pickJob.kind === 'pin') ? 'Pin it to what?'
    : (G.pickJob.kind === 'charging') ? 'Charge what?'
    : (G.pickJob.kind === 'remove curse') ? 'Lift the curse from what?'
    : 'Use it on what?';
  else if (G.log.length) {
    var e = G.log[G.log.length - 1];
    head = e.s + (e.fx ? '  ' + e.fx : '');
  }
  /* What sits on the right decides how much room is left on the left.
     Thirty-four pixels was a guess at the width of "PACK 25/25", and a
     guess is only right until something grows: a long enough line ran
     straight into it. */
  var right = G.pouch
    ? (G.pouch.t === 'chest' ? 'CHEST ' : 'POUCH ') +
      contCount(G.pouch) + '/' + contCap(G.pouch)
    : 'PACK ' + packCount() + '/' + N_SLOTS;
  var room = SW - 2 - textW(right) - 4 - GX;
  /* The counter grows a digit once you are carrying ten things, and the
     line beside it loses two letters off the end.  Clipping in silence is
     the wrong way round: what is written here has to fit the narrowest
     the row ever gets, which is what packLineRoom measures. */
  text(clipTo(head, room), GX, MSG_Y, picking ? 'c' : '6');
  textR(right, SW - 2, MSG_Y, G.pouch ? 'k' : 'y');
  rect(0, MSG_Y + LH + 2, SW, 1, '#2b3352');

  /* equip row */
  for (c = 0; c < 5; c++) {
    x = GX + c * PITCH;
    hit(x, GY_EQ, SL, SL, 'cell', { r: 0, c: c });
    var key = EQ_ORDER[c];
    var isCur = G.pouch ? (G.pcur.r < 0 && G.pcur.c === c)
                        : (G.cur.r === 0 && G.cur.c === c);
    var isSel = G.sel && G.sel.ref.kind === 'eq' && G.sel.ref.key === key;
    var barred = (key === 'lh' && twoHanded(P.eq.rh));
    text(EQ_LABEL[key], x + 3, LABEL_Y, barred ? '3' : isCur ? 'y' : '4');
    slotBox(x, GY_EQ, P.eq[key], isCur, isSel, false);
    if (barred) crossOut(x, GY_EQ);
  }
  rect(GX, GY_EQ + SL + 2, 5 * PITCH - GAP, 1, '#2b3352');

  /* bag - runs up out of the way when a pouch is opened over it */
  var ph = pouchPhase();
  if (ph < 1) {
    var lift = (POUCH_RISE * ph) | 0;
    withAlpha(1 - ph, function () {
      for (var rr = 0; rr < 4; rr++) for (var cc = 0; cc < 5; cc++) {
        var bi = rr * 5 + cc;
        var cu = !G.pouch && G.cur.r === rr + 1 && G.cur.c === cc;
        var se = G.sel && G.sel.ref.kind === 'slot' && G.sel.ref.i === bi;
        /* the squares are only clickable while the pack is the thing on
           screen - mid-slide they are on their way out */
        if (!G.pouch && ph === 0)
          hit(GX + cc * PITCH, GY_BAG + rr * PITCH, SL, SL, 'cell', { r: rr + 1, c: cc });
        slotBox(GX + cc * PITCH, GY_BAG + rr * PITCH - lift, P.slots[bi], cu, se, false);
      }
    });
  }

  /* -------- right hand column: the keys, the item, then you -------- */
  var IXX = GX + 5 * PITCH + 3, IW = SW - IXX - 2;
  var colW = IW;
  /* The two keys that always work, at the top where they are out of the
     way of the thing you are reading about. */
  var ly = TITLE_Y;
  /* With a chest open at your feet, ENTER on one of its squares takes
     the thing out, so the line says so. */
  text(picking ? 'SPACE picks  ESC stop'
     : inBox() ? 'SPACE menu-ESC close-ENTER take'
     : 'SPACE menu  TAB/ESC close',
    IXX, ly, '4');

  /* The name sits with what it says about itself rather than five lines
     above it, and it is underlined so the two do not read as one block
     of text. */
  ly = 20;
  if (hov) {
    var lines = wrap(itemName(hov), colW);
    var nameRows = Math.min(lines.length, 2);
    /* The rule goes down first and the name over the top of it.  Drawn
       the other way about it took the bottom pixel off every g and p in
       the name - the descenders reach the line, and whichever is drawn
       second wins. */
    rect(IXX, ly + nameRows * LH - 1, IW, 1, '#636d85');
    for (i = 0; i < nameRows; i++) { text(lines[i], IXX, ly, 'w'); ly += LH; }
    ly += 2;
    /* A note too long for the column used to have everything after the
       wrap thrown away without a word - the throwing knife said "wield
       it or throw it; it always" and stopped.  What will not fit on one
       line runs onto the next, and only the lines there is no room for
       are dropped. */
    var notes = itemNotes(hov);
    var noteRoom = 4 - (nameRows - 1), used = 0;
    for (i = 0; i < notes.length && used < noteRoom; i++) {
      var nl = wrap(notes[i][0], colW), j;
      for (j = 0; j < nl.length && used < noteRoom; j++, used++) {
        text(nl[j], IXX, ly, notes[i][1]); ly += LH;
      }
    }
  } else {
    text(picking ? 'choose something' : 'empty square', IXX, ly, '4');
  }

  ly = 60;
  rect(IXX, ly - 3, IW, 1, '#2b3352');
  /* The same meter as the panel, here where you drink things: a number
     going from 14 to 19 is easy to miss, a bar filling up is not.  The
     pack is not a moment in a fight, so it shows the real figure. */
  {
    var hfrac = clamp(P.hp / Math.max(1, P.mhp), 0, 1);
    var hbx = IXX + 13, hbw = IW - 13;
    spr('heart', IXX, ly - 1, 1);
    rect(hbx, ly, hbw, HP_BAR_H, '#2b3352');
    rect(hbx, ly, hbw, 1, '#3f4966');
    var hw = Math.round(hbw * hfrac);
    if (hw > 0) rect(hbx, ly, hw, HP_BAR_H,
      hfrac > 0.5 ? '#93bd27' : hfrac > 0.25 ? '#f59e0b' : '#d82b2b');
    text('' + P.hp, hbx + 2, ly, 'w');
    textR('' + P.mhp, hbx + hbw - 2, ly, hfrac > 0.5 ? 'w' : '6');
    ly += HP_BAR_H + 2;
  }
  /* All four on one line, each in its own colour: green for a while
     after it goes up, red for a while after it goes down, red as long as
     it is drained.  The line used to be drawn in one colour, so a potion
     of strength and an aquator's bite looked exactly alike.

     Three letters where they fit, which is nearly always.  Only when
     several stats are drained at once and every figure is carrying its
     "/18" does the line run out of column, and then it drops the maxima
     first and the third letter last. */
  drawStatLine(IXX, ly, IW); ly += LH;
  text('Lvl  ' + P.lv + '   exp ' + xpText(), IXX, ly, '6'); ly += LH;
  text('Food ' + foodPct() + '%', IXX, ly, foodCol());
  text('Gold ' + P.gold, IXX + 52, ly, 'y'); ly += LH;
  text('sneak ' + stealthWord() + '  dodge ' + dodgeChance() + '%', IXX, ly, 'c'); ly += LH;

  ly = 107;
  rect(IXX, ly - 3, IW, 1, '#2b3352');
  var ef = playerEffects(), room = 2;
  /* the overflow count rides on the heading, which costs no line */
  text('EFFECTS' + (ef.length > room ? '  +' + (ef.length - room) : ''), IXX, ly, 'y');
  ly += LH;
  for (i = 0; i < ef.length && i < room; i++)
    text(clipTo(ef[i][0], colW), IXX, ly, ef[i][1]), ly += LH;
  /* whatever you happen to be carrying between squares */
  if (G.sel) text(clipTo('holding ' + itemName(G.sel.item), colW), IXX, ly, 'c');

  /* Under the grid: the two things you do that are not about a single
     square.  One button if you have never found a pouch - offering to
     open a bag you do not own is worse than not offering. */
  drawInvButtons();

  if (ph > 0) drawPouch(ph);
  drawArc();
  if (G.menu) drawItemMenu();
}

/* The row of wide, short buttons under the grid.  They are squares like
   any other as far as the cursor is concerned - row 5 of the bag - so
   walking down onto them is how you reach them. */
function invButtons() {
  var out = [];
  if (havePouch()) out.push(['pouch', G.pouch && G.pouch.t !== 'chest' ? 'PACK' : 'POUCH']);
  /* With a chest open at your feet there are two sets of squares in play
     and the button says which one it will take you to - CHEST while you
     are looking at your pack, PACK while you are looking in the chest.
     It is the same journey TAB makes, with the destination written on
     it, which is the only way to see it is there at all. */
  if (boxHere()) out.push(['box', inBox() ? 'PACK' : 'CHEST']);
  out.push(['exit', 'EXIT']);
  return out;
}
function inBox() { return !!(G.pouch && G.pouch.t === 'chest'); }
/* Which row of the open container is the row of buttons under it.  The
   pack has five rows of squares and the buttons on row five; a container
   has however many rows it has, and the buttons on the row after. */
function btnRow() { return G.pouch ? contRows(G.pouch) : 5; }
function onButtons() {
  return G.pouch ? G.pcur.r === btnRow() : G.cur.r === 5;
}
function havePouch() {
  var all = carriedItems();
  for (var i = 0; i < all.length; i++) if (all[i] && all[i].t === 'pouch') return true;
  return false;
}
function drawInvButtons() {
  var b = invButtons(), i;
  var full = 5 * PITCH - GAP;
  /* However many there are, they share the width of the grid above them
     with one gap between each.  This used to divide by two whatever the
     count, so a third button was drawn on top of the second. */
  var w = ((full - GAP * (b.length - 1)) / b.length) | 0;
  for (i = 0; i < b.length; i++) {
    var bx = GX + i * (w + GAP);
    /* the last one takes up whatever the division left over */
    if (i === b.length - 1) w = full - (bx - GX);
    var cur = onButtons() && (G.pouch ? G.pcur : G.cur).c === i;
    var over = usingMouse() && MOUSE.on &&
      MOUSE.x >= bx && MOUSE.y >= BTN_Y && MOUSE.x < bx + w && MOUSE.y < BTN_Y + BTN_H;
    /* pressed a moment ago: the whole button goes yellow, so a press
       that opens nothing still shows it was heard */
    var lit = BTN_FLASH.i === i && Date.now() - BTN_FLASH.t < BTN_FLASH_MS;
    rect(bx, BTN_Y, w, BTN_H, lit ? '#fad039' : cur ? '#2b3352' : over ? '#1b2140' : '#141829');
    frame(bx, BTN_Y, w, BTN_H, lit ? '#fad039' : cur ? '#fad039' : over ? '#636d85' : '#3f4966');
    var tw = textW(b[i][1]);
    text(b[i][1], bx + ((w - tw) >> 1), BTN_Y + 2, lit ? 'n' : cur ? 'y' : '6');
    hit(bx, BTN_Y, w, BTN_H, 'btn', i);
  }
}

/* Where a square is on the pack screen, so an effect can be drawn
   between two of them. */
function refPixel(ref) {
  if (!ref) return null;
  if (ref.kind === 'eq') {
    var c = EQ_ORDER.indexOf(ref.key);
    if (c < 0) return null;
    return [GX + c * PITCH + (SL >> 1), GY_EQ + (SL >> 1)];
  }
  if (ref.kind === 'slot')
    return [GX + (ref.i % 5) * PITCH + (SL >> 1),
            GY_BAG + ((ref.i / 5) | 0) * PITCH + (SL >> 1)];
  if (ref.kind === 'pouch')
    return [POU.x + (ref.i % 5) * PITCH + (SL >> 1),
            POU.y + ((ref.i / 5) | 0) * PITCH + (SL >> 1)];
  return null;
}

/* A thread of current between where a thing was and the slot it just
   went into: the pack screen is otherwise entirely still, and a thing
   quietly appearing in another square is easy to miss. */
var ARC_MS = 260;
function arcBetween(fromRef, toRef) {
  var a = refPixel(fromRef), b = refPixel(toRef);
  if (!a || !b) return;
  G.arc = { x0: a[0], y0: a[1], x1: b[0], y1: b[1], t: Date.now() };
}
function drawArc() {
  if (!G.arc) return;
  var age = Date.now() - G.arc.t;
  if (age > ARC_MS) { G.arc = null; return; }
  var f = age / ARC_MS;
  var steps = 9, i;
  /* a jagged line that settles as it fades */
  for (i = 0; i <= steps; i++) {
    var u = i / steps;
    var x = G.arc.x0 + (G.arc.x1 - G.arc.x0) * u;
    var y = G.arc.y0 + (G.arc.y1 - G.arc.y0) * u;
    var wob = (1 - f) * 3;
    if (i > 0 && i < steps) {
      x += (rnd(3) - 1) * wob;
      y += (rnd(3) - 1) * wob;
    }
    var col = ((i + (age / 40) | 0) & 1) ? 'c' : 'w';
    rect(Math.round(x), Math.round(y), 1, 1, COLS[col]);
    if (i && i < steps && wob > 1)
      rect(Math.round(x), Math.round(y) - 1, 1, 1, COLS['B']);
  }
}

/* the little list of what you can do with the thing under the cursor */
function drawItemMenu() {
  var m = G.menu, i, wide = 0;
  for (i = 0; i < m.opts.length; i++)
    if (textW(m.opts[i][1]) > wide) wide = textW(m.opts[i][1]);
  var w = 9 + wide + 2;
  var h = m.opts.length * LH + 4;

  /* Beside the square it belongs to, level with its top, then kept on
     the screen.  It used to sit under the square - and for a bag slot it
     sat a whole square too low as well, because the bag rows are drawn
     from row one while the cursor counts the equip row as row zero. */
  var cur = G.pouch ? G.pcur : G.cur;
  var cellX, cellY;
  if (m.ref.kind === 'pouch') { cellX = POU.x + cur.c * PITCH; cellY = POU.y + cur.r * PITCH; }
  else if (m.ref.kind === 'eq') { cellX = GX + cur.c * PITCH; cellY = GY_EQ; }
  else { cellX = GX + cur.c * PITCH; cellY = GY_BAG + (cur.r - 1) * PITCH; }
  var ax = cellX + SL + 1, ay = cellY;
  /* if there is no room to its right, put it to its left instead */
  if (ax + w > SW - 2) ax = cellX - w - 1;
  ax = clamp(ax, 2, SW - w - 2);
  ay = clamp(ay, 2, SH - 2 - h);

  rect(ax, ay, w, h, '#0b0d1c');
  frame(ax, ay, w, h, '#fad039');
  for (i = 0; i < m.opts.length; i++) {
    var ty = ay + 2 + i * LH;
    hit(ax, ty - 1, w, LH, 'menu', i);
    if (i === m.i) {
      rect(ax + 1, ty - 1, w - 2, LH, '#1b2a3d');
      spr('point', ax, ty - 2, 1);
    }
    text(m.opts[i][1], ax + 9, ty, i === m.i ? 'y' : '6');
  }
}

/* The pouch is not a window over the pack: it takes the pack's place.
   Opening it runs the bag squares up and off while the pouch squares
   rise into the space they left, so it reads as one drawer sliding past
   another rather than a box appearing on top. */
var POUCH_SLIDE_MS = 170, POUCH_RISE = 30;
var POU = { x: GX, y: GY_BAG };

/* 0 = the pack is in place, 1 = the pouch has taken over, in between
   while it slides.  Runs backwards when the pouch closes. */
function pouchPhase() {
  var open = G.pouch ? 1 : 0;
  if (!G.pouchT) return open;
  var t = (Date.now() - G.pouchT) / POUCH_SLIDE_MS;
  if (t >= 1 || t < 0) return open;
  t = t * t * (3 - 2 * t);                 /* ease in and out */
  return open ? t : 1 - t;
}
/* every place that opens or closes a pouch goes through here, so the
   slide can never be skipped by one of them forgetting */
function setPouch(p) {
  if ((p || null) === (G.pouch || null)) return;
  G.pouch = p || null;
  /* the one being shut still has to be drawn while it slides away */
  if (p) G.pouchLast = p;
  G.pouchT = Date.now();
}

function drawPouch(ph) {
  var pouch = G.pouch || G.pouchLast;
  if (!pouch) return;
  var gy = POU.y + ((POUCH_RISE * (1 - ph)) | 0);
  withAlpha(ph, function () {
    var rowsN = contRows(pouch);
    for (var r2 = 0; r2 < rowsN; r2++) for (var c2 = 0; c2 < 5; c2++) {
      var i = r2 * 5 + c2;
      var cu = G.pouch && G.pcur.r === r2 && G.pcur.c === c2;
      var se = G.sel && G.sel.ref.kind === 'pouch' && G.sel.ref.i === i &&
               G.sel.ref.pouch === pouch;
      if (G.pouch && ph === 1)
        hit(POU.x + c2 * PITCH, POU.y + r2 * PITCH, SL, SL, 'cell', { r: r2, c: c2 });
      slotBox(POU.x + c2 * PITCH, gy + r2 * PITCH, pouch.items[i], cu, se, false);
    }
  });
}

/* ---------------------------------------------------------- screens */
var HELP = [
  ['ARROWS', 'walk; walk into a monster to attack'],
  ['ENTER', 'stairs, chest, wear it, or shoot'],
  ['TAB', 'open and close your pack'],
  ['SPACE', 'wait a turn'],
  ['?', 'look at any square and read it'],
  ['SHIFT', 'hide the panel; arrows move the view'],
  ['ESC', 'restart, help, or leave'],
  ['', ''],
  ['IN THE PACK', ''],
  ['SPACE', 'menu: wield, wear, drop, move, use'],
  ['ENTER', 'do the obvious thing at once'],
  ['ESC', 'back out / close pouch'],
  ['BUTTONS', 'walk down below the squares'],
  ['TOP ROW', 'R.hand  body  L.hand  head  feet'],
  ['MARKS', 'z asleep  ? hunting  ! seen  + ally'],
  ['RUNES', 'some sleep until the item is known']
];
/* Two lines over the map, because the answer is about the square you are
   standing on and you should still be able to see it. */
function drawChoice() {
  var opts = choiceOpts(), i;
  var w = 84, h = 8 + opts.length * 9 + 4;
  var x = VIEW_PX + ((VIEW_W * TS - w) >> 1), y = VIEW_PY + 14;
  rect(x, y, w, h, '#0b0d1c');
  frame(x, y, w, h, '#636d85');
  text('ENTER means:', x + 5, y + 3, 'y');
  for (i = 0; i < opts.length; i++) {
    var cur = G.choice && G.choice.i === i;
    hit(x + 2, y + 11 + i * 9, w - 4, 9, 'choice', i);
    if (cur) rect(x + 2, y + 11 + i * 9, w - 4, 9, '#2b3352');
    text((cur ? '>' : ' ') + ' ' + opts[i][1], x + 5, y + 12 + i * 9,
      cur ? 'w' : '4');
  }
}

/* ------------------------------------------------- coming of age
   Three perks you do not have, drawn at random, or four more hit points
   instead.  One choice, no going back, and no ranks to think about. */
function perkRows() {
  var job = G.perkPick, out = [], i;
  if (!job) return out;
  for (i = 0; i < job.offer.length; i++)
    out.push({ id: job.offer[i].id, n: job.offer[i].n, txt: job.offer[i].txt });
  out.push({ id: 'hp', n: '+' + PERK_HP + ' max health',
             txt: 'plain toughness, and nothing to remember' });
  return out;
}
function perkKey(k) {
  var rows = perkRows(), d = keyDir(k);
  if (!rows.length) { G.perkPick = null; G.mode = 'play'; return; }
  if (d && d[1]) { G.perkPick.i = (G.perkPick.i + d[1] + rows.length) % rows.length; return; }
  if (k === 'Enter' || k === ' ') {
    G.msgq = [];
    takeLevelReward(rows[G.perkPick.i].id);
    settleHp();
    finishMsgs();
    return;
  }
  /* there is no getting out of it - you have earned something */
}
function drawPerkPick() {
  var rows = perkRows(), i, y;
  rect(0, 0, SW, SH, '#0b0d1c');
  frame(0, 0, SW, SH, '#636d85');
  textC('LEVEL ' + (G.perkPick ? G.perkPick.lv : P.lv), 4, 'y');
  textC('Choose one', 13, 'c');
  y = 26;
  for (i = 0; i < rows.length; i++) {
    var cur = G.perkPick && G.perkPick.i === i;
    hit(4, y - 2, SW - 8, 17, 'perk', i);
    if (cur) rect(4, y - 2, SW - 8, 17, '#2b3352');
    text(cur ? '>' : ' ', 7, y, 'y');
    text(rows[i].n, 14, y, rows[i].id === 'hp' ? 'G' : 'c');
    text(rows[i].txt, 14, y + 8, cur ? 'w' : '4');
    y += 19;
  }
  textC('ENTER to take it', SH - 9, '6');
}

function drawHelp() {
  rect(0, 0, SW, SH, '#0b0d1c');
  frame(0, 0, SW, SH, '#636d85');
  textC('ROGUE-8', 2, 'y');
  var y = 11;
  for (var i = 0; i < HELP.length; i++) {
    if (!HELP[i][0] && !HELP[i][1]) { y += 3; continue; }
    text(HELP[i][0], 3, y, HELP[i][1] ? 'c' : 'y');
    text(HELP[i][1], 48, y, 'w');
    y += LH;
  }
  textC('Find the Amulet on -26, carry it up.', SH - 8, 'O');
}

/* The title screen is a painted picture, PXLRogue_splash.png, drawn over
   the whole 230x128 buffer.  If the file is not beside the page the
   screen simply comes up black and the menu still works - the same rule
   the spritesheet follows, and for the same reason.

   The first keypress opens the menu over it; before that it is just the
   picture and an invitation. */
function drawTitle() {
  if (splashImg && splashImg.complete && splashImg.naturalWidth) {
    cx.drawImage(splashImg, 0, 0, SW, SH);
  } else {
    rect(0, 0, SW, SH, '#0b0d1c');
  }
  if (G.titleMenu) {
    drawTitleMenu();
  } else {
    textC('press any key', 114, ((Date.now() / 500) | 0) % 2 ? 'c' : 'B');
  }
}

/* centre a line inside a box rather than across the whole screen */
function textIn(s, bx, bw, y, col) {
  text(s, bx + ((bw - textW(s)) >> 1), y, col);
}

/* The stone goes up over the dungeon, not over the whole screen: the
   panel keeps its log, so you can still read the blow that killed you
   and whatever the wand you gambled on turned out to do. */
function drawDeath() {
  var bx = VIEW_PX + 3, bw = SW - VIEW_PX - 6;
  var by = 3, bh = SH - 6;
  rect(bx, by, bw, bh, '#0b0d1c');
  frame(bx, by, bw, bh, '#636d85');
  var gk = 3;                        /* sprSC centres on the whole screen */
  sprS('grave', bx + ((bw - TS * gk) >> 1), by + 4, gk);
  textIn('R I P', bx, bw, by + 32, '6');
  textIn('the rogue', bx, bw, by + 42, 'w');
  textIn('killed by ' + G.deathBy, bx, bw, by + 54, 'R');
  textIn('on floor ' + floorName(), bx, bw, by + 63, '6');
  textIn(P.gold + ' gold pieces', bx, bw, by + 77, 'y');
  textIn('score ' + computeScore(), bx, bw, by + 86, 'O');
  textIn('deepest: -' + G.maxDepth, bx, bw, by + 95, '4');
  textIn('ENTER to rise again', bx, bw, by + 110,
    ((Date.now() / 500) | 0) % 2 ? 'c' : 'B');
}

function drawWin() {
  var i;
  for (i = 0; i < 29; i++) spr(i % 2 ? 'gold' : 'gold2', i * 8, SH - 8, 1);
  for (i = 0; i < 29; i++) spr('wall', i * 8, 0, 0.35);
  textC('YOU ESCAPE!', 12, 'y', 2);
  sprSC('amulet', 28, 3);
  textC('You climb out into the daylight still', 56, 'w');
  textC('clutching the Amulet of Yendor.', 64, 'w');
  textC('gold: ' + P.gold, 76, 'y');
  textC('experience: ' + P.exp + '  (level ' + P.lv + ')', 85, 'c');
  textC('final score: ' + computeScore(), 94, 'O');
  textC('press ENTER to play again', 108, ((Date.now() / 500) | 0) % 2 ? 'c' : 'B');
}

window.addEventListener('load', boot);
