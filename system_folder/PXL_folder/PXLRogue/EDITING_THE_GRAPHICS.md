# Changing the graphics yourself

`spritesheet.png` is now the game's art. Paint on it, rebuild, done.

## The three files you need

| file | what it is |
|---|---|
| `spritesheet.png` | **the one you edit** — 128 x 122, RGBA |
| `spritesheet_named.png` | every sprite at 4x with its name under it |
| `spritesheet_grid.png` | the sheet at 6x with the 8x8 grid and cell numbers drawn on |

`spritesheet_map.csv` says the same thing as text: name, index, x, y.

## Doing it

1. Open `spritesheet.png` in Aseprite, Photoshop, GIMP, Piskel — anything
   that edits pixels.
2. Find the sprite you want in `spritesheet_named.png`, then find that
   square in `spritesheet_grid.png` (it shows cell numbers and the grid).
3. Paint. Save it **in place**, as a PNG, same size, keeping transparency.
4. From the `build` folder:

       python3 check_sheet.py     # catches the usual mistakes
       python3 build.py           # writes ../rogue8.html

`build.py` reads the `spritesheet.png` that sits **beside `rogue8.html`**
— the one you just edited. It prints which file it used and how big it
was, so you can see your change went in. Running `gen_atlas.py` will not
overwrite your sheet; that writes `build/atlas.png`, the fallback.

If the game looks unchanged, check that line: it names the file it
actually read, and warns if another copy is being ignored.

## Rules the game relies on

- **128 x 122 exactly.** Resizing the canvas moves every sprite.
- **Sprites are 8 x 8**, 16 per row, starting at the top left. Keep art
  inside its square or it will bleed into the neighbouring tile.
- **No anti-aliasing.** Every pixel must be fully opaque or fully clear.
  Soft brushes, feathering and scaling all leave half-transparent edges;
  `check_sheet.py` counts them and refuses.
- **Below y=80 is the font.** 6 x 7 cells, 16 per row, ASCII 32 upward.
  You can restyle the letters, but each must stay in its cell and no ink
  may cross to the right of its own width or letters will smear.
- Transparent means transparent — the floor shows through it.

## Moving or adding sprites

The names in `atlas.json` map to grid positions. If you only repaint
squares, leave it alone. If you want to move a sprite to a different
square, or add one, edit the `index` in `atlas.json` to match — the game
looks sprites up by name.

## If it goes wrong

`build/atlas.png` is the original art, regenerated any time by `python3
gen_atlas.py`. To start over:

    cp build/atlas.png spritesheet.png

There is also a full snapshot in `backup_v1_230x128/`.

## Proving your edit landed

`build.py` prints the file and byte count it used. If you want to be
certain, pull the sheet back out of the finished game and compare:

    python3 - <<'EOF'
    import base64, hashlib, re
    h = open('rogue8.html').read()
    raw = base64.b64decode(re.search(r'ATLAS_PNG\s*=\s*"data:image/png;base64,([^"]+)"', h).group(1))
    print('in the game :', hashlib.md5(raw).hexdigest())
    print('your file   :', hashlib.md5(open('spritesheet.png','rb').read()).hexdigest())
    EOF

The two hashes should be identical.

## Checking your work

    python3 check_sheet.py    # size, mode, anti-aliasing, font block
    node test_render.js       # every screen still draws on whole pixels
    node shot.js && python3 compose.py    # re-render build/shot_*.png
