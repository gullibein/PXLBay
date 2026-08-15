#!/usr/bin/env python3
"""Make the reference pictures for editing spritesheet.png by hand.

  sheet_grid.png    the sheet blown up 6x with an 8x8 grid and cell
                    numbers drawn over it, so you can find a square
  sheet_named.png   every sprite at 4x with its name underneath
  sheet_map.csv     name, index, x, y  - the same thing as text

None of these are used by the game.  They only exist so you know which
square is which before you paint over it.
"""
import csv, json, os
from PIL import Image, ImageDraw

D = os.path.dirname(os.path.abspath(__file__))
SHEET = os.path.join(D, 'spritesheet.png')
if not os.path.exists(SHEET):
    SHEET = os.path.join(D, 'atlas.png')

meta = json.load(open(os.path.join(D, 'atlas.json')))
sheet = Image.open(SHEET).convert('RGBA')
COLS, TS = meta['cols'], meta['tileSize']
by_index = {i: n for n, i in meta['index'].items()}

BG = (18, 23, 44, 255)
GRID = (70, 80, 110, 255)
FONT_TOP = meta['font']['y']


def checker(w, h, a=(24, 28, 50, 255), b=(32, 38, 64, 255), size=4):
    """A dark chequerboard, so transparent pixels are obvious."""
    im = Image.new('RGBA', (w, h), a)
    d = ImageDraw.Draw(im)
    for y in range(0, h, size):
        for x in range(0, w, size):
            if (x // size + y // size) % 2:
                d.rectangle([x, y, x + size - 1, y + size - 1], fill=b)
    return im


# ---------------------------------------------------------------- grid
Z = 6
MARGIN = 22
gw, gh = sheet.width * Z, sheet.height * Z
grid = Image.new('RGBA', (gw + MARGIN, gh + MARGIN), BG)
grid.alpha_composite(checker(gw, gh), (MARGIN, MARGIN))
grid.alpha_composite(sheet.resize((gw, gh), Image.NEAREST), (MARGIN, MARGIN))
d = ImageDraw.Draw(grid)

for c in range(COLS + 1):
    x = MARGIN + c * TS * Z
    d.line([(x, MARGIN), (x, MARGIN + gh)], fill=GRID)
for r in range(sheet.height // TS + 1):
    y = MARGIN + r * TS * Z
    d.line([(MARGIN, y), (MARGIN + gw, y)], fill=GRID)

# column and row numbers round the edge
for c in range(COLS):
    d.text((MARGIN + c * TS * Z + 16, 6), str(c), fill=(200, 210, 230, 255))
for r in range(sheet.height // TS):
    d.text((4, MARGIN + r * TS * Z + 16), str(r), fill=(200, 210, 230, 255))

# the index number inside each occupied cell
for i, name in sorted(by_index.items()):
    cx = MARGIN + (i % COLS) * TS * Z + 2
    cy = MARGIN + (i // COLS) * TS * Z + 2
    d.text((cx, cy), str(i), fill=(250, 208, 57, 255))

# mark where the font block starts - it is not made of 8x8 tiles
fy = MARGIN + FONT_TOP * Z
d.line([(MARGIN, fy), (MARGIN + gw, fy)], fill=(216, 43, 43, 255), width=3)
d.text((MARGIN + 4, fy + 4), 'FONT BELOW THIS LINE - %dx%d cells, leave the grid alone'
       % (meta['font']['cw'], meta['font']['ch']), fill=(216, 43, 43, 255))
grid.convert('RGB').save(os.path.join(D, 'sheet_grid.png'))

# --------------------------------------------------------------- names
S, PAD, LBL = 4, 6, 12
CW = TS * S + PAD * 2
CH = TS * S + LBL + PAD
NCOL = 8
rows = (len(by_index) + NCOL - 1) // NCOL
named = Image.new('RGBA', (NCOL * CW, rows * CH + 8), BG)
d2 = ImageDraw.Draw(named)
for n, (i, name) in enumerate(sorted(by_index.items())):
    col, row = n % NCOL, n // NCOL
    x, y = col * CW, row * CH + 4
    tile = sheet.crop(((i % COLS) * TS, (i // COLS) * TS,
                       (i % COLS) * TS + TS, (i // COLS) * TS + TS))
    named.alpha_composite(checker(TS * S, TS * S), (x + PAD, y))
    named.alpha_composite(tile.resize((TS * S, TS * S), Image.NEAREST), (x + PAD, y))
    d2.text((x + 2, y + TS * S + 2), name[:15], fill=(200, 210, 230, 255))
named.convert('RGB').save(os.path.join(D, 'sheet_named.png'))

# ----------------------------------------------------------------- csv
with open(os.path.join(D, 'sheet_map.csv'), 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['name', 'index', 'x', 'y', 'w', 'h'])
    for i, name in sorted(by_index.items()):
        w.writerow([name, i, (i % COLS) * TS, (i // COLS) * TS, TS, TS])
    w.writerow(['(font block)', '', 0, FONT_TOP,
                meta['font']['cols'] * meta['font']['cw'],
                sheet.height - FONT_TOP])

print('wrote sheet_grid.png, sheet_named.png, sheet_map.csv')
print('%d sprites, sheet is %dx%d, font block starts at y=%d'
      % (len(by_index), sheet.width, sheet.height, FONT_TOP))
