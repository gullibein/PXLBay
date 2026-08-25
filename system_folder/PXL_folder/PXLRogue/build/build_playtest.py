#!/usr/bin/env python3
"""Bundle the game plus the playtest way-in into playtest.html.

Same engine, same spritesheet, same everything - with one extra file on
the end that asks what you want to look at and puts you next to it.  The
game itself is untouched: if the two ever disagree, this is the one that
is wrong."""
import json, os, sys

D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(D, '..', 'playtest.html'))

# The sheet is loaded at run time from beside the page, never baked in -
# see build.py for why.
SHEET = os.path.join(os.path.dirname(OUT), 'spritesheet.png')
if not os.path.exists(SHEET):
    sys.exit('no spritesheet.png beside %s' % os.path.basename(OUT))
meta = json.load(open(os.path.join(D, 'atlas.json')))

# ------------------------------------------------------------- caching
# The sheet is a separate file, and a browser - or worse, a CDN in front
# of one - will happily go on serving yesterday's copy of it next to
# today's HTML.  The result is not a stale game, which would be fine; it
# is a BROKEN one, because the layout in the HTML and the pixels in the
# PNG no longer agree and every sprite is cut from the wrong cell.  On a
# real site that meant a hard reload every single visit.
#
# So the sheet is asked for by a name that changes when its contents do.
# A cache cannot serve the old bytes for a URL it has never seen, and an
# old HTML still asks for its own old sheet - so a stale cache gives you
# an old game that WORKS rather than a new one that does not.
#
# It does not bake anything in and it does not add a build step for art:
# a query string does not change which file the server hands over, so
# repainting spritesheet.png and reloading still shows the new paint.
def _stamp(path):
    try:
        import hashlib
        return hashlib.sha1(open(path, 'rb').read()).hexdigest()[:10]
    except Exception:
        return '0'


parts = ['part1_core.js', 'part2_game.js', 'part3_actions.js', 'part4_render.js',
         'part5_sound.js', 'part6_playtest.js']
js = '\n'.join(open(os.path.join(D, p)).read() for p in parts)

# boot() ends by starting an ordinary run at the title screen.  Here it
# should stop and ask instead, so the one call is swapped out.
assert 'newGame(true);' in js, 'boot no longer starts a game the way this expects'
js = js.replace('    newGame(true);',
                '    newGame(true);\n    playtestMenu();   /* ask, rather than open on the title */', 1)

HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<!-- Added to the home screen, these make it start with no browser
     furniture at all - which on an iPhone is the only way to the
     whole screen, since Safari there has no fullscreen for
     anything that is not a video. -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="PXLRogue">
<meta name="theme-color" content="#05060d">
<title>Rogue-8 playtest</title>
<style>
  /* dvh is the height that is actually showing once the address bar
     has slid away; the plain percentage is the fallback. */
  html,body{margin:0;padding:0;height:100%%;height:100dvh;
            background:#05060d;overflow:hidden;overscroll-behavior:none;}
  body{display:flex;align-items:center;justify-content:center;}
  canvas{
    image-rendering:pixelated;
    image-rendering:crisp-edges;
    image-rendering:-moz-crisp-edges;
    -ms-interpolation-mode:nearest-neighbor;
    display:block;
    background:#0b0d1c;
    /* the game draws its own pointer, off the sheet, at 230x128 */
    cursor:none;
    /* A finger works the controls, so the browser must not also read it
       as scrolling, zooming, selecting or a link being tapped. */
    touch-action:none;
    -webkit-user-select:none;
    user-select:none;
    -webkit-touch-callout:none;
    -webkit-tap-highlight-color:transparent;
    box-shadow:0 0 0 1px #1b2140;
  }
  /* the retro monitor - see build.py, which has the reasoning */
  #crt{
    position:fixed; display:none; pointer-events:none; z-index:5;
    background:
      repeating-linear-gradient(to bottom,
        rgba(0,0,0,0.34) 0px, rgba(0,0,0,0.34) 1px,
        rgba(0,0,0,0.00) 1px, rgba(0,0,0,0.00) 3px),
      repeating-linear-gradient(to right,
        rgba(255,64,64,0.045) 0px, rgba(64,255,64,0.045) 1px,
        rgba(64,64,255,0.045) 2px, rgba(0,0,0,0.00) 3px);
    box-shadow:inset 0 0 34px 6px rgba(0,0,0,0.42);
  }
  #crt.on{ display:block; }
  /* The picker is ordinary HTML over the canvas.  It is scaffolding for
     testing, not part of the game, so it does not pretend to be pixels. */
  #pick{
    position:fixed; inset:0; display:none;
    flex-direction:column; align-items:center; justify-content:center;
    background:rgba(5,6,13,0.94); color:#c3ccd9;
    font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;
    z-index:10;
  }
  #pickhead{ color:#fad039; margin-bottom:14px; letter-spacing:1px; }
  #picklist{
    display:flex; flex-wrap:wrap; gap:8px;
    max-width:720px; justify-content:center;
  }
  #picklist button{
    font:inherit; color:#c3ccd9; background:#141829;
    border:1px solid #3f4966; padding:7px 13px; cursor:pointer;
    letter-spacing:1px;
  }
  #picklist button:hover{ background:#2b3352; border-color:#fad039; color:#fff; }
  #again{
    position:fixed; right:10px; top:10px; z-index:11;
    font:12px ui-monospace,Menlo,Consolas,monospace;
    color:#86909f; background:#141829; border:1px solid #3f4966;
    padding:5px 10px; cursor:pointer;
  }
  #again:hover{ color:#fff; border-color:#fad039; }
</style>
</head>
<body>
<canvas id="scr" width="320" height="200"></canvas>
<div id="crt"></div>
<div id="nosheet" style="position:fixed;inset:0;display:none;align-items:center;
  justify-content:center;color:#c3ccd9;background:#05060d;text-align:center;
  font:14px/1.6 ui-monospace,Menlo,Consolas,monospace">
spritesheet.png is not beside this file.<br>The graphics live in that PNG.</div>
<button id="again">pick again</button>
<div id="pick"><div id="pickhead"></div><div id="picklist"></div></div>
<script>
var ATLAS = %(meta)s;
var ATLAS_PNG = "spritesheet.png?v=%(sheetv)s";
%(js)s
document.getElementById('again').onclick = function () {
  this.blur();
  playtestMenu();
};
</script>
</body>
</html>
"""

SHEET = os.path.join(os.path.dirname(OUT), 'spritesheet.png')
out = HTML % {'meta': json.dumps(meta), 'js': js, 'sheetv': _stamp(SHEET)}
if 'data:image/png' in out:
    sys.exit('REFUSING TO WRITE: the spritesheet has been baked into the HTML')
open(OUT, 'w', encoding='utf-8').write(out)
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
