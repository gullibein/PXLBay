#!/usr/bin/env python3
"""Bundle the engine into index.html, which loads spritesheet.png beside it.

THE SHEET IS NOT BAKED IN.  It used to be, as base64 in the HTML, and that
made the graphics part of the build: editing spritesheet.png changed
nothing until somebody rebuilt, and rebuilding with a sheet painted for an
older layout replaced good artwork with bad.  The game now loads the PNG
at run time, so the file on disk IS the graphics.  Repaint it, reload the
page, done - no build step, nothing to get out of step with.

That means index.html and spritesheet.png travel together.  If you move
one, move both - and the splash screen and the favicon go with them.

Nothing here reads a pixel back off the sheet - the dim and hurt copies
are made with canvas composite operations - so the browser's rule about
tainted canvases never comes up and this works from file:// as it stands.
"""
import json, os, sys

D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(D, '..', 'index.html'))
SHEET = os.path.join(os.path.dirname(OUT), 'spritesheet.png')
# the two pictures that are not sprites: the title screen and the tab icon
SPLASH = 'PXLRogue_splash.png'
FAVICON = 'favicon.ico'

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


# The sheet is never read or written here, only checked: the game needs it
# beside the HTML, and it has to be the size the layout says.
if not os.path.exists(SHEET):
    sys.exit('no spritesheet.png beside %s - the game has nothing to draw with'
             % os.path.basename(OUT))
try:
    from PIL import Image
    w, h = Image.open(SHEET).size
    if (w, h) != (meta['atlasW'], meta['atlasH']):
        sys.exit('spritesheet.png is %dx%d, the layout wants %dx%d - run '
                 'migrate_sheet.py to bring the artwork across'
                 % (w, h, meta['atlasW'], meta['atlasH']))
    print('sheet: spritesheet.png %dx%d, %d bytes (loaded at run time, not baked in)'
          % (w, h, os.path.getsize(SHEET)))
except ImportError:
    print('sheet: spritesheet.png %d bytes (loaded at run time, not baked in)'
          % os.path.getsize(SHEET))

parts = ['part1_core.js', 'part2_game.js', 'part3_actions.js', 'part4_render.js',
         'part5_sound.js']
js = '\n'.join(open(os.path.join(D, p)).read() for p in parts)

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
<title>PXLRogue</title>
<link rel="icon" href="%(favicon)s">
<style>
  /* dvh is the height that is actually showing once the address bar
     has slid away; the plain percentage is the fallback. */
  html,body{margin:0;padding:0;height:100%%;height:100dvh;
            background:#05060d;overflow:hidden;overscroll-behavior:none;}
  body{display:flex;align-items:center;justify-content:center;}
  /* The canvas backing store is EXACTLY 230x128 device pixels.
     It is only ever blown up by a whole-number factor, with all
     smoothing disabled, so every source pixel stays a perfect square. */
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
  /* The retro monitor, switched on from the ESC menu.  It is a sheet of
     glass laid over the picture rather than anything drawn into it, and
     that is deliberate: the backing store stays exactly 230x128, and
     scanlines drawn into it would be a whole game pixel thick - four
     screen pixels at the usual scale, which cuts every sprite in half.
     Laid over the top they are as fine as the screen showing them,
     which is what a scanline actually is.  It also costs nothing per
     frame; the browser composites it and the game never thinks about
     it again. */
  #crt{
    position:fixed; display:none; pointer-events:none; z-index:5;
    background:
      repeating-linear-gradient(to bottom,
        rgba(0,0,0,0.34) 0px, rgba(0,0,0,0.34) 1px,
        rgba(0,0,0,0.00) 1px, rgba(0,0,0,0.00) 3px),
      repeating-linear-gradient(to right,
        rgba(255,64,64,0.045) 0px, rgba(64,255,64,0.045) 1px,
        rgba(64,64,255,0.045) 2px, rgba(0,0,0,0.00) 3px);
    /* the dark curve of the tube at its corners */
    box-shadow:inset 0 0 34px 6px rgba(0,0,0,0.42);
  }
  #crt.on{ display:block; }
  #nosheet{
    position:fixed; inset:0; display:none;
    align-items:center; justify-content:center; text-align:center;
    color:#c3ccd9; background:#05060d; padding:20px;
    font:14px/1.6 ui-monospace,Menlo,Consolas,monospace;
  }
</style>
</head>
<body>
<canvas id="scr" width="320" height="200"></canvas>
<div id="crt"></div>
<div id="nosheet">spritesheet.png is not beside this file.<br>
The graphics live in that PNG - keep the two together.</div>
<script>
var ATLAS = %(meta)s;
/* The graphics are the file on disk, not a copy of it welded in here.
   Repaint spritesheet.png and reload - there is no build step for art. */
var ATLAS_PNG = "spritesheet.png?v=%(sheetv)s";
/* The title screen is a picture too, and the same rule applies: it is a
   file beside this one, not baked in.  If it is missing the title screen
   simply comes up black and the menu still works. */
var SPLASH_PNG = "%(splash)s?v=%(splashv)s";
%(js)s
</script>
</body>
</html>
"""

out = HTML % {'meta': json.dumps(meta), 'js': js,
              'splash': SPLASH, 'favicon': FAVICON,
              'sheetv': _stamp(SHEET),
              'splashv': _stamp(os.path.join(os.path.dirname(OUT), SPLASH))}

# The rule this file exists to keep.  Cheap to check, and the one mistake
# that quietly undoes it is easy to make.
if 'data:image/png' in out:
    sys.exit('REFUSING TO WRITE: the spritesheet has been baked into the HTML')
# The name may carry a version stamp after it - see the note above - but
# it must still be that file beside this one and nothing else.
if 'ATLAS_PNG = "spritesheet.png' not in out:
    sys.exit('REFUSING TO WRITE: the game is not pointed at spritesheet.png')
# The title screen was hand-written into the built file once and nearly
# lost on the next build.  If it is not in the sources it is not real.
for want in ('drawTitleMenu', 'TITLE_OPTS', 'SPLASH_PNG'):
    if want not in out:
        sys.exit('REFUSING TO WRITE: %s is missing - the title screen has '
                 'fallen out of the sources' % want)

open(OUT, 'w', encoding='utf-8').write(out)
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
for extra in (SPLASH, FAVICON):
    if not os.path.exists(os.path.join(os.path.dirname(OUT), extra)):
        print('  note: %s is not beside it' % extra)
print('index.html, spritesheet.png, %s and %s go together' % (SPLASH, FAVICON))
print('sheet stamp: ?v=%s - a cache cannot serve old pixels under a new name'
      % _stamp(SHEET))
