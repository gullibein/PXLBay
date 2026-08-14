# Rogue-8 — standing rules

Read this before touching anything. These are the constraints the project
is built on, in the order they matter.

## The spritesheet is a file, not part of the build

**`spritesheet.png` is the graphics.** The game loads it at run time from
beside the HTML. Gulli paints it by hand, and a repaint must show up in
the game on reload with no build step at all.

- **Never bake the sheet into the HTML.** No `data:image/png;base64` in
  `rogue8.html` or `playtest.html`, ever. `build.py` and
  `build_playtest.py` both refuse to write a file that contains one — do
  not "fix" that check by removing it.
- **Never overwrite `spritesheet.png` with a generated one.** The only
  thing allowed to write it is `migrate_sheet.py`, which carries every
  hand-painted cell across byte-for-byte and refuses to write if a single
  one changed.
- `build/atlas.png` is throwaway output from `gen_atlas.py` — placeholder
  art for cells nobody has painted yet. It is not the game's graphics and
  must never be copied over `spritesheet.png`.
- `rogue8.html` and `spritesheet.png` travel together. Moving one without
  the other gives a black screen with a line of text saying so.

### Changing the sprite layout

Adding or removing a sprite moves other sprites' cells, which makes every
sheet painted against the old layout wrong. So:

1. Add the game code that uses the sprite first (`gen_atlas.py` drops any
   sprite the game never draws, and monsters need their letter adding to
   the `creatures` row of `LAYOUT`).
2. `cp atlas.json atlas_layout_before.json` — this records the layout the
   sheet on disk is currently painted in.
3. `python3 gen_atlas.py`
4. `python3 migrate_sheet.py` — it will say `graphics altered: none`. If
   it says anything else, stop; something is about to be lost.

If a sheet turns up that was painted against an older layout, it cannot
just be dropped in — it has to go through step 2-4 with the layout it was
painted in. Ask before assuming which layout that was.

## Building

    python3 build/build.py            # rogue8.html
    python3 build/build_playtest.py   # playtest.html

Neither reads the PNG except to check it is there and the right size.

## The pixels

- Backing store is exactly **230x128**. Nothing may break this.
- Every tile and sprite is **8x8**, all from the one sheet.
- Upscaled by whole numbers only, smoothing off, so pixels stay square.

## Working habits that have earned their keep

- Write the invariant as a test, measure how often it fails, find the pass
  that produces it, then fix it. Do not loosen a test to make it pass.
- Prove a new test fails on the old code before keeping it.
- Four suites: `test.js` (~3 min), `test_rules.js`, `test_render.js`,
  `test_sound.js`. All four before calling anything done.
