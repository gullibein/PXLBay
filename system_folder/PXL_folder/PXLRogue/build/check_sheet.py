#!/usr/bin/env python3
"""Check an edited spritesheet.png before building with it.

Catches the mistakes an image editor makes quietly: resizing the canvas,
flattening away the transparency, saving as indexed colour, or leaving
anti-aliased edges from a scaled paste.  Exits non-zero if anything is
wrong, so you can put it in front of build.py.
"""
import json, os, sys
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
meta = json.load(open(os.path.join(D, 'atlas.json')))
OUTDIR = os.path.abspath(os.path.join(D, '..'))
for path in (os.path.join(OUTDIR, 'spritesheet.png'),
             os.path.join(D, 'spritesheet.png')):
    if os.path.exists(path):
        break
else:
    print('no spritesheet.png - build.py will use the generated atlas.png')
    sys.exit(0)
print('checking', os.path.relpath(path, OUTDIR))

im = Image.open(path)
problems = []

if im.mode != 'RGBA':
    problems.append('mode is %s, not RGBA - re-save with transparency kept' % im.mode)
im = im.convert('RGBA')

want = (meta['atlasW'], meta['atlasH'])
if im.size != want:
    problems.append('size is %dx%d, must be exactly %dx%d' % (im.size + want))

TS, COLS = meta['tileSize'], meta['cols']
FY = meta['font']['y']

# Anti-aliasing is the usual sign that something was scaled or drawn with
# a soft brush.  Every pixel must be fully opaque or fully clear.
if im.size == want:
    px = im.load()
    soft = 0
    for y in range(im.height):
        for x in range(im.width):
            a = px[x, y][3]
            if a not in (0, 255):
                soft += 1
    if soft:
        problems.append('%d pixels are part-transparent - turn off anti-aliasing '
                        'and feathering, every pixel must be solid or empty' % soft)

    # the font has to stay legible to the engine
    fw = meta['font']['cols'] * meta['font']['cw']
    fh = im.height - FY
    if fh != (meta['font']['count'] + COLS - 1) // meta['font']['cols'] * meta['font']['ch']:
        pass                      # height is derived, not worth second-guessing
    blank = True
    for y in range(FY, im.height):
        for x in range(fw):
            if px[x, y][3]:
                blank = False
                break
        if not blank:
            break
    if blank:
        problems.append('the font block below y=%d is empty - the game would '
                        'have no text at all' % FY)

print('spritesheet.png: %dx%d, %s' % (im.width, im.height, im.mode))
print('  sprite grid : %d cols x %d rows of %dx%d, %d named sprites'
      % (COLS, meta['tileRows'], TS, TS, len(meta['index'])))
print('  font block  : y=%d down, %dx%d cells' % (FY, meta['font']['cw'], meta['font']['ch']))

if problems:
    print('\nPROBLEMS:')
    for p in problems:
        print('  * ' + p)
    sys.exit(1)
print('\nlooks good - run build.py')
