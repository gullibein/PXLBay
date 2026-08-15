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
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>PXLRogue</title>
<link rel="icon" href="%(favicon)s">
<style>
  html,body{margin:0;padding:0;height:100%%;background:#05060d;overflow:hidden;}
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
    box-shadow:0 0 0 1px #1b2140;
  }
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
<div id="nosheet">spritesheet.png is not beside this file.<br>
The graphics live in that PNG - keep the two together.</div>
<script>
var ATLAS = %(meta)s;
/* The graphics are the file on disk, not a copy of it welded in here.
   Repaint spritesheet.png and reload - there is no build step for art. */
var ATLAS_PNG = "spritesheet.png";
/* The title screen is a picture too, and the same rule applies: it is a
   file beside this one, not baked in.  If it is missing the title screen
   simply comes up black and the menu still works. */
var SPLASH_PNG = "%(splash)s";
%(js)s
</script>
</body>
</html>
"""

out = HTML % {'meta': json.dumps(meta), 'js': js,
              'splash': SPLASH, 'favicon': FAVICON}

# The rule this file exists to keep.  Cheap to check, and the one mistake
# that quietly undoes it is easy to make.
if 'data:image/png' in out:
    sys.exit('REFUSING TO WRITE: the spritesheet has been baked into the HTML')
if 'ATLAS_PNG = "spritesheet.png"' not in out:
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
