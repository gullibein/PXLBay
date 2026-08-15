#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bring the hand-painted spritesheet across to a new atlas layout.

Every graphic follows its own NAME to wherever that name now sits.  No
pixel is redrawn, resampled or recoloured - each 8x8 cell is copied
whole, and the font block is lifted to its new row intact.

Run it after gen_atlas.py has moved anything.  It refuses to write unless
every surviving sprite comes out byte-for-byte identical to what went in,
which is the only property that actually matters here.
"""
import json, os, sys
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
SHEET = os.path.join(os.path.dirname(D), 'spritesheet.png')
NEW = json.load(open(os.path.join(D, 'atlas.json')))
OLD = json.load(open(os.path.join(D, 'atlas_layout_before.json')))

def cell(i, cols):
    return ((i % cols) * 8, (i // cols) * 8)

def crop(img, i, cols):
    x, y = cell(i, cols)
    return img.crop((x, y, x + 8, y + 8))

old_img = Image.open(SHEET).convert('RGBA')
oc, nc = OLD['cols'], NEW['cols']
print('sheet %dx%d -> %dx%d' % (old_img.width, old_img.height,
                                NEW['atlasW'], NEW['atlasH']))

out = Image.new('RGBA', (NEW['atlasW'], NEW['atlasH']), (0, 0, 0, 0))

# 1. every sprite that survives, carried to its new cell
carried, fresh = 0, []
for name, ni in NEW['index'].items():
    if name in OLD['index']:
        x, y = cell(ni, nc)
        out.paste(crop(old_img, OLD['index'][name], oc), (x, y))
        carried += 1
    else:
        fresh.append(name)          # newly drawn: gen_atlas.py supplies it
if fresh:
    gen = Image.open(os.path.join(D, 'atlas.png')).convert('RGBA')
    for name in fresh:
        ni = NEW['index'][name]
        x, y = cell(ni, nc)
        out.paste(crop(gen, ni, nc), (x, y))

# 2. the font block, lifted whole to wherever it now lives
of, nf = OLD['font']['y'], NEW['font']['y']
fh = old_img.height - of
out.paste(old_img.crop((0, of, old_img.width, of + fh)), (0, nf))

# 3. and now prove it: every surviving graphic identical, font identical
bad = []
for name, ni in NEW['index'].items():
    if name not in OLD['index']:
        continue
    if crop(old_img, OLD['index'][name], oc).tobytes() != crop(out, ni, nc).tobytes():
        bad.append(name)
font_ok = (old_img.crop((0, of, old_img.width, of + fh)).tobytes() ==
           out.crop((0, nf, out.width, nf + fh)).tobytes())

print('carried %d sprites, %d newly drawn' % (carried, len(fresh)))
print('dropped: %s' % (', '.join(NEW.get('dropped', [])) or 'none'))
print('graphics altered: %s' % (', '.join(bad) or 'none'))
print('font carried intact: %s' % font_ok)
if bad or not font_ok:
    sys.exit('REFUSING TO WRITE: the migration changed artwork')

out.save(SHEET)
print('wrote', SHEET)
