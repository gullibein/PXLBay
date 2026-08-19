Resuming PXLRogue. The project is the folder you have open; read `CLAUDE.md`
first — its rules are binding, especially never baking the spritesheet into
the HTML and never hand-editing `index.html`.

## Where things stand (session of 16 Aug 2026)

Five changes to the game itself, all five with tests that were proved to
fail on the old code first. All four suites green.

### Clicking a locked door

It used to answer "You can't go there" and leave you where you stood,
because `LOCKED` is not walkable and so the pathfinder refused the
square. Now a click walks you over and puts your hand to it: with the
right key it opens, without it you get the usual "The iron door is
locked. You need an iron key." — the same as walking into it by
keyboard, which was always the only way to reach `tryUnlock`.

`findPath` grew one line for this: with `stopShort` the goal square's own
cost no longer matters, since that square is dropped from the path
anyway. Test in `test_render.js` ("clicking a lock").

### Stumbling is for fleeing

`playerStumbles` now takes the step's direction and asks
`stepIsFleeing(dx, dy)`: the step has to move away from *every* creature
the fight counts. Backing off one straight into the reach of another is
closing with the second one, and cannot trip you. Steps are orthogonal,
so a step changes any distance by exactly one square, which makes the
test simple. `stumbleFleeingOnlyOK` in the harness stands you between two
and holds you at a dead run: 0 falls in 300 steps hemmed in, against
50 in 300 when only one of them is there. On the old code the hemmed-in
figure was 51.

### Monster sight

The potion of **monster detection** is now the potion of **monster
sight**, and `P.detmon` is `P.monsight`. It no longer lists the whole
floor. It reaches `MONSIGHT_RANGE` (5) squares, corner to corner so its
edge is a square about you, straight through stone and dark alike, and
it runs `MONSIGHT_TURNS` (100). It shows creatures and nothing else: not
a square of map, not a chest.

**On the chests and potions you were seeing in rooms you had not
entered** — that was never this potion, which only ever drew monsters.
Two other things do it: the **map scroll** (fixed below) and the potion
of **magic detection**, whose whole purpose is to reveal potions,
scrolls, wands, amulets and chests wherever they lie. That one is left
alone; say the word if it should change too.

### The map scroll

It drew every non-rock square on the floor, which meant it also gave away
the walled-in vaults and the room behind a secret door, turned every
secret seam into a plain doorway, and — because an item draws wherever
its square is known — laid out every potion and scroll lying on the
flagstones. Measured on the old code over 25 floors: a loose potion shown
on all 25, 2,653 squares of walled-up rooms mapped, 25 seams given away.

Now it draws the shape of the place and what is built into it. Rooms
marked `sealed` are left off, seams stay seams, and a new flag bit
`F_MAP` marks squares known from a map rather than seen. The item pass
skips anything that is not a chest on an `F_MAP` square, and the bit is
struck off the moment you lay eyes on the square yourself — so walk in
and the loot is there, as it should be.

### Bows of fire, and a great bow

A bow could already roll the fire rune and name itself "long bow of
fire", and it did nothing whatever — `runeStrike` only runs on the melee
path and reads the right hand, while a bow lives in the left. Now
`fireAt` lights the shaft: what it hits catches, the square it hits
burns, and a shot that goes wide sets light to whatever it comes down on.
A plain bow does none of it, and neither does one whose enchantment you
have not learned, which is the rule the spider bow already followed.

The **great bow** is new: `shot: [3, 5]`, `reach: 5`, `p: 4`,
`minDepth: 5`, two-handed. It is drawn with the long bow's sprite on
purpose, so the sheet did not have to change — `bowsOK` now names that
exception rather than letting a shared sprite slip through silently.

## Two flaky tests found and fixed while doing it

Neither was caused by these changes; both were sitting on the edge and
the shifted RNG stream landed on them.

- `blastStoneOK` counted a trial as tried even when the floor left
  nowhere dry to stand the barrel, then required every trial to have lit
  one. It now judges the barrels it actually stood up.
- `runeReport` asked that all 21 runes appear in 12,000 sampled items.
  'the spider' only goes on a bow, and a bow is about one item in eighty:
  the average was 3.6 appearances, so about one run in thirty saw none.
  Raised to 60,000, which averages 18.

## The camera (same session, after the five changes above)

Dragging looked torn about, and the view shoving itself home a square a
turn looked worse. Three things, all in `part4_render.js`.

### The slide was pointed the wrong way

`camSlip` returned `(CAM_AT - target) * TS` when the shift needed is
`(target - CAM_AT) * TS`. The map is drawn on the whole-tile offset in
`camTarget`, and the slip is what moves the picture from there to where
`CAM_AT` says it is — so the sign was inverted. Every slide threw the
picture the whole distance *the wrong way* on its first frame and then
eased back across twice the gap. With the view 14 squares out it was
drawn +56px when it should have been -56px.

Nothing caught it because the old test only asked that the slip was
non-zero and that its magnitude shrank. The test now checks the drawn
position each frame lies between where the map was and where it is
going, and never moves backwards — which the old sign fails 61 frames
out of 33.

### Dragging follows the hand a pixel at a time

`G.drag` is still whole tiles, because everything that asks "which square
is that?" uses it. What changed is that the drag now also sets `CAM_AT`
to the exact fractional offset, so the leftover fraction is drawn as a
shift and the picture lands exactly under the hand. `camEase` stands
aside while the hand is down (`camDragging()`), and when you let go the
frame loop eases the last half-tile onto the grid so no sprite is left
between two pixels.

Before, the offset was rounded to whole tiles in `onMouseMove` and the
picture only caught up through `camEase` at a quarter of the remaining
distance per frame — so twelve pixels of hand movement moved the map
**nothing at all** on the frame they happened, then lurched. That is the
measurement the new test makes.

### The view comes home because you walk it home

`camFollow` no longer nudges. The rule now:

- Player off screen (`playerShown` is false): the view comes home before
  anything else happens. `camHomeFirst()` sits at the top of the
  direction-key branch of `playKey` and at the top of `mapClick`: it sets
  `G.drag = null` so the slide carries the map the whole way home, stops
  any walk, and returns true. Moving a player you cannot see is how you
  walk into a troll you had no way of knowing was there. A right click
  still looks freely — a question is not an order.

  A **click** is then remembered, not thrown away: `G.waiting` holds the
  clicked *square* (not the place on the screen — the view moves in
  between, and the same pixel is a different square by the time it
  lands). `camWaiting()`, called from the frame loop after `camEase`,
  does nothing until `camSlip` is zero and then carries the order out
  through `mapOrder` exactly as though you had clicked it just then.
  `mapClick` was split so `mapOrder(x, y)` can be given the order twice
  over — once live, once deferred.

  A direction key, or picking the map up again, drops whatever was
  waiting: both are a change of mind. Clicking a second square while one
  is waiting replaces it. `G.waiting` is in `packRun`'s skip list, so a
  save never comes back with an order pending.

  `camFollow` keeps the same rule as a fallback, for when something other
  than an order moves him.
- Player on screen: **the map is never moved to centre him.** A step
  that carries him towards the middle of the screen is one the map sits
  still for — the offset shrinks by one, so he crosses the screen and
  centres himself. A step the other way, the map follows as always.
  Standing still moves nothing.

`camFollow` compares `P` against `CAM_SEEN`, the position the view last
looked at, and only treats a one-square change as a step, so a fall or a
teleport is not mistaken for walking across the screen.

**Holding the map still means holding both numbers.** The first go at
this shrank the tile offset and left `CAM_AT` where it was, so the
drawing was suddenly a whole tile from its target and crawled back over
the next few frames — the offset was right and the picture lurched 8px
and slid back on every step towards the middle. `camFollow` now shrinks
`CAM_AT` by the same step.

The test missed it because it measured the tile offset, which was
correct. What the eye sees is `-(P + CAM_AT) * TS`: the target cancels
out of the sum entirely, so the offset alone cannot tell you whether the
map moved. The test now measures that, before the step, straight after
it, and across thirty frames of easing — and requires zero pixels of
movement in all three. Against the offset-only version it reports
"walking towards the middle moved the map -8px" and "left the map sliding
8px afterwards".

## Three more, after playing it

### What you threw at vanished before the stone landed

A turn is worked out in one go and played back over the next few hundred
milliseconds. The creature's step was decided at once, so by the time
your stone was still crossing the room the game already had it standing
out of sight — and the drawing asked `canSeeMon`, which looks at the
square it *ended* on. It was culled before the stone arrived.

The drawing now asks `monShown`, which looks at the two squares the
creature is between at this instant of the playback (`monBetween`, read
off the same `m.anim` list `monPixel` interpolates along) and draws it if
either end is in sight. So you watch it walk out of sight, and watch one
walk in, instead of either popping.

`canSeeMon` itself is unchanged — the rules still ask about the real
square. Only the renderer asks about the drawn one.

There was a second cull underneath doing the same damage: it threw the
creature out on `m.x, m.y` before the animation was consulted, so one
walking a long way off screen disappeared regardless. It now tests both
ends of the step.

### Anywhere on the screen counts as on the screen

`playerShown` wanted the player `CAM_EDGE` (2) squares clear of the
view's edge, so shoving the map until he sat against the border had the
next order haul the whole view back to centre. It now tests the view
proper, outermost row and column included.

### A sliding map went black

`drawMap` drew **one** extra row and column beyond the edges however far
the picture was shifted. A slide of half a screen shifts it by nine or
ten tiles, so most of the map area had nothing drawn on it — the map
went dark exactly when you wanted to watch it travel. It now draws
`ceil(|slip| / TS) + 1` extra tiles per axis, and every "is it on
screen?" cull inside `drawMapAt` — items, corpses, creatures, clouds,
fire, rubble — widens by the same amount, so the things standing on the
map travel with it.

The test computes, for each square of the map area, which tile lands
under it given the shift, and requires that any known, non-rock tile is
actually painted. Against the old code, 28 squares of known floor go
bare mid-slide.

## Touch, and the viewport on a phone

### A finger works the same controls

New listeners on the canvas — `touchstart`/`touchmove`/`touchend`/
`touchcancel`, all non-passive so they can refuse the browser's
scrolling and zooming. A tap is a click, a drag pushes the map about,
and a press held still for `TOUCH_HOLD_MS` (450) is the right button,
answered where it stands rather than when the finger lifts. The long
press marks the touch so the lift afterwards is not also read as a tap.

`LAST_INPUT` gained a third value, `'touch'`, and the one predicate
became two:

- `usingMouse()` — a real mouse, with something to hover. Gates only the
  arrow drawn off the sheet and the highlights that follow it. A finger
  never sets it, so **no pointer is drawn on a touch device** — and if a
  mouse is plugged into that same device, its first movement sets
  `LAST_INPUT = 'mouse'` and the arrow comes back. Nothing is sniffed.
- `usingPointer()` — finger or mouse. Gates `mouseTile()`, the pack icon
  in the corner, and the rule that tapping picks things up rather than
  walking over them doing it. All three were on `usingMouse()`, so a
  touch device would have had no pack, no clickable square, and
  autopickup.

Also: `soundWake()` hung off `onKey` alone, so on a touch-only device the
audio context was never unlocked and the game was silent. Both
`onTouchStart` and `onMouseDown` now wake it.

CSS on the canvas: `touch-action:none`, no user-select, no callout, no
tap highlight.

### The whole screen

`goFullscreen()` is called from the first touch (and only ever once — a
refusal is final and asking every tap would be noise). It asks for
`requestFullscreen` on the document element and, if the device offers it,
locks the orientation to landscape. Both are wrapped so a refusal is
silent.

**Where this works:** Android Chrome and the desktop, yes. iPad Safari,
yes. **iPhone Safari, no** — it still has no fullscreen for anything that
is not a `<video>`, and that is a WebKit limitation, not something the
page can work around. The route to the whole screen there is Share ->
Add to Home Screen, so the head now carries `apple-mobile-web-app-capable`
and friends, which make it launch with no browser furniture at all.

Sizing changed too. `fit()` used `window.innerWidth/innerHeight`, which
on a phone keeps reporting the taller figure while the address bar is
showing; it now uses `visualViewport` when there is one, and re-fits on
`orientationchange` and `visualViewport.resize`. The head has
`viewport-fit=cover` and the page uses `100dvh`.

## Seven smaller things, after more play

### The third flagstone was never laid

`floorSprite(mx, my)` deals all three stones off `tileHash`. The map's
own tile loop did not use it: it had a pattern of its own,
`((mx*3 + my*5) & 7) === 0 ? 'floor2' : 'floor'` — two of the three
stones, one of them every eighth square, in diagonal stripes, and
`floor3` never drawn at all. Now the loop calls `floorSprite` like
everything else does.

The old check could not have caught it: it counted what `floorSprite`
returned rather than what the map drew, so it reported a healthy
35/32/33 while the picture was doing something else entirely. The test
now counts flagstones in the rendered blits and also checks that
neighbouring squares do not share a stone too often, which is what a
striped pattern shows up as.

### The right-click menu opened in the wrong place

`drawCtxMenu` anchored itself to the clicked square by working the
camera out as `P.x - (VIEW_W>>1)` — the player alone, with no drag or pan
in it. Once the map had been pushed, the menu opened as far from the
pointer as the map had moved. It now opens beside the pointer, whose
position is recorded in `G.ctx.px/py` when the menu is asked for.

Watch out when testing this: the square under the pointer is framed in
`#fad039`, the same yellow as the menu's frame, so looking for that
colour finds the hover frame sitting exactly on the pointer no matter
what the menu does — a check that can never fail. The test looks for the
menu's `#0b0d1c` panel instead, bounded so it is not the screen behind
it.

### Two fingers on a trackpad push the map

A `wheel` listener on the canvas. There is nothing on the page to
scroll, so scrolling moves the view instead, exactly as dragging does —
pixel by pixel, with `deltaMode` normalised for the wheels that report
lines or pages. While it is still arriving, `camDragging()` reports true
so nothing else moves the view; it settles onto the grid
`WHEEL_HOLD_MS` after the last of it.

### A wall no longer gives the dynamite away

`TILE_INFO[WALL]` and `[SDOOR]` said "Dynamite would blow it in." They
now say what a wall is and stop there.

### Yourself, clicked

Left-clicking your own square opens the pack — it was the one square a
click did nothing with. Right-click → Look does the same, since what
there is to know about the square you are standing on is what you are
carrying. If something is lying underfoot the click still picks that up,
which is the more useful reading and matches the menu offering both
Take and Inventory.

### Stairs by click

There was no way off a floor without a keyboard: walking onto a
staircase left you standing on it and ENTER was the only thing that took
it. Clicking a staircase now uses it — at once if you are on it,
otherwise you walk over and take it on arrival (`walkTo` job
`{stairs: 1}`, carried out by `doWalkJob`). The check is ahead of the
own-square-opens-the-pack rule, so standing on stairs and clicking takes
them.

### A second step in a turn comes sooner, but is not a shorter stride

Anything quick enough to move twice — hasted, or a flier taking its
extra step — used to spend a full beat before the second step, so moving
twice took twice as long as everything else. The **pause** before every
step after the first is now `EXTRA_STEP` (0.5) of the usual one.

The **stride** is unchanged: both steps cross their square at
`MOVE_ANIM_MS`, because that is how fast a thing of that size moves.
Halving that as well was tried and reverted — it read as a skip rather
than a stride.

### Nothing under a staircase

Two things, both because the stairs are placed *and moved* after the
floor has been furnished:

- **Rugs.** The square under the up-stair was quietly struck off the rug
  (`delete L.rugId[uj]`), which left the rest of the rug lying there with
  a hole in the middle and the stairs standing in the hole — a staircase
  on a rug, to anyone looking at it. `tidyRugs` already rolls up a whole
  rug that has lost a square; it now runs again after the stairs are
  settled, and the hole-punch is gone. Measured over 480 floors: 8
  staircases in a hole in a rug, now 0, with 5,991 squares of rug still
  laid elsewhere.
- **Water.** `dryAroundStairs` pulls any pool square touching a staircase
  back to bare floor, so the bank forms clear of the steps instead of
  lapping at them. Bridges are left alone — a plank over the water is dry
  too. Over 480 floors: 71 pool squares touching a staircase, now 0, with
  15,610 squares of water still cut.

Moss is deliberately not swept: it grows on the flagstones, and a
staircase is drawn without its square's ground cover anyway, so a patch
reaching under one is neither seen nor a mistake.

`stairsClearOK` in the harness checks all of it from the soak suite, and
guards the other way too — that the sweeps have not simply lifted every
rug and drained every pool.

## Pack and Wait buttons, walls, and a following view

### A row of buttons along the floor of the panel

The pack was a small picture squeezed onto the flags line, and waiting a
turn had no way in at all without a keyboard. Two buttons now sit along
the bottom of the panel — **Pack** and **Wait** — with the flags line
above them. `fitBars` reserves the row (`PANEL_BTN_H`, `PANEL_BTN_Y`) and
everything else stacks up from it.

They are always drawn, not gated on `usingPointer()`: the panel is laid
out around them, and a row that came and went would shuffle the stats and
the log up and down as you touched the mouse. `waitTurn()` is now one
function that both SPACE and the button call, so they cannot drift apart.

This turned up a pre-existing collision: the look-mode hint
("ARROWS look around, ENTER reads") was centred on the **whole screen**,
so it began inside the panel and was written across whatever was there.
It is centred on the map now (`textM`), which is where what it is about
actually is.

### Clicking a wall walks you up to it

Pushing into stone is how a hidden door gives itself away, and with the
keyboard that is simply walking at it. A click used to answer "You can't
go there" and leave you standing — so a whole way of playing was shut to
the mouse. A click on a wall now walks you over and puts your hands on it
(`walkTo` job `{feel}`, carried out by `doWalkJob`), exactly as walking
into it would. No turn is spent on plain stone; a secret door reveals
itself, as ever.

### The view follows you instead of jumping

The player is pinned to the middle of the screen and the world moved a
whole tile between one frame and the next, which is the jerk. `WALK_AT`
is where the view has got to — your position, arrived at smoothly: it
closes `WALK_CHASE` (0.22) of the distance each frame, and `walkLag()`
feeds the remainder into `camSlip` so the world is drawn where the view
has reached rather than where you already are. Twelve frames to cross a
square, biggest step 1.8px of 8.

Corners come free: the view is still coming out of the last square when
you start into the next, so it cuts across rather than turning on the
spot.

It does **not** lag when `battleNear()` — in a fight the picture has to
say exactly where you are — nor across a fall, a teleport or a new floor,
where it snaps. `WALK_LAG_MAX` (1.4 squares) is the most it will ever
trail by.

`camWaiting` had to stop asking `camSlip`, which now includes the
following, and ask `camSettled()` instead — otherwise an order waiting on
the view would never fire while you were walking.

Known and accepted: `mouseTile()` does not account for the slip, so
mid-glide the hover frame sits on the settled grid, up to a square from
the drawn tiles. That is the same pre-existing quirk the camera slide
has.

## Rooms announced in a box, a hint, and rounder holes

### A box over the map when you walk into a built room

`announceRoom` still writes its two lines to the log, and now also sets
`G.roomBox = { kind }`. `resumeMode` puts the box up once the turn has
finished playing out (the same place `G.ask` is handled), so it never
lands in the middle of an animation and it stops an auto-walk dead.

`drawRoomBox` centres a 148-wide panel on the **map**, not the screen,
with the room's own picture drawn at 2x beside a heading. The words are
`ROOM_ENTRY` joined and re-wrapped, so the box does not depend on where
the log lines happened to break. Two new tables in `part1_core.js`:
`ROOM_TITLE` and `ROOM_ICON` — six rooms, six sprites, all of them
already on the sheet (`roomBoxOK` checks that, so a renamed sprite fails
the suite rather than drawing nothing).

ENTER, SPACE, TAB and ESC close it (`roomKey`), and so does a click or a
touch anywhere at all. That last check sits at the **top** of `clickAt`,
ahead of the Pack and Wait buttons: a click meant to dismiss the box must
not also open the pack behind it. The test clicks exactly there.

`room` is deliberately not in `MAP_MODES`, so the map cannot be dragged
or wheeled while the box is up.

### The hint about playing with the keys

One more line in `HINTS`, 42 of them now.

### Holes are rounded on the diagonal, not bitten square

A hole's corners were already cut, but by `drawLiquidCorners`, which
takes a **2x2 square** out. That does not remove the step - it moves it
two pixels - so the floor kept a right angle of its own pointing back
into the drop, and four of them round one hole read as a plus sign
rather than a pit.

`drawHoleCorners` replaces it for `HOLE` only: `cornerNib` takes **three
pixels** off - the corner and the one either side of it along the two
edges - which is a true 45 degree cut. Water keeps the square bite; a
pool is a bigger, softer shape and nobody has complained of it.

Nothing is taken off the squares around the hole. That was tried first
(the literal reading of the request) and it leaves a detached speck of
black in the floor at each corner, because the hole's own cut is still
there two pixels away. Pictures settled it; the corners wanted cutting
were the hole's own.

The check is in `test_render.js`: it digs a hole in a patch of bare
floor, finds the black 8x8 fill on screen, and requires exactly twelve
one-pixel blits at the twelve corner positions, no 2x2 blits inside the
hole, and **no one-pixel blit anywhere else on the frame**. On the old
code: 0 pixels cut, 4 square bites.

## Teleports, web, and words that meant nothing

### The jump is half as long, and you cannot act during it

`WARP_SHAKE` 300 -> 150 and `WARP_FLASH` 120 -> 60: the whole jump is
210ms rather than 420.

The real bug was that orders given during it went through. `beatWait`
only paces the log; it holds nothing back from the keyboard. So you could
press an arrow while the man was still shivering on the square he was
leaving and walk out of the far end of a teleport before you had arrived
at it. `warping()` (true while `warpPhase(P.warp)` is live) now guards
`playKey`, the `play` branch of `clickAt`, and `walkTick`.

### Web really holds you now - it held you for nothing at all

Measured before touching anything: **0 turns lost**, every trial, walking
into a patch of web on the floor.

The cause is a difference between the two clocks. A monster's `stuck` is
read at the top of its own turn, so `stuck = 1` costs it one turn. The
player's counters are wound down in the `upkeep` that runs at the end of
the **same turn the web caught him**, so `P.frozen = 1` was gone before he
had a turn to lose. `WEB_FLOOR_HOLD` was 1, and the spat web rolled 1-2,
so half the time that cost nothing either.

`stickPlayer(turns)` now adds one to pay for that wind down, and
`webHold()` (1-2 turns) is used for both the spat web and the floor
patch. By the time anything is drawn the figure on the status line is the
number of turns really left, so nothing lies to you. The suite counts
turns actually lost - `turnsHeldAfter()` - rather than reading the
counter, which is what let the old figure pass.

**The same off-by-one is still in ice, sleep and the rest of `P.frozen`.**
Left alone deliberately: those roll 2-5, so they always cost something,
and changing them changes the balance of the game. Worth knowing about.

`weaver: 1` on the spider and the web spinner: `webCatches(x, y, who)`
returns false for them, so they walk their own silk without sticking and
**without tearing it up**, which lets a spinner fight from inside the
mess it has made. The old web probe used a spider as its test creature;
it uses an orc now.

### Words

- The room box no longer says "ENTER to go on". Half the people playing
  are holding a telephone.
- A bow **shoots** arrows; it does not fire them.
- Ring of battle luck: "your blows land better, and keep" -> "double
  damage, arrows come back". The "keep" meant `LUCK_RECOVER_PCT` - shafts
  you loose come back 35% of the time instead of 20%.
- A blow that crits said "12 telling". It says "12 double", which is what
  actually happens (`CRIT_MULT` is 2). The effect column is ten
  characters, so "critical" does not fit.
- Runes now carry an `eff` used only in the pack's EFFECTS list, because
  that list is bare - there is nothing above a line for "it" to point at,
  and "it bites your attacker" reads as something biting *you*. So
  "armor bites your attacker". `knockback` is offered to blades as well
  and says whichever this copy is. `effectWordsOK` fails the suite if any
  worn rune's line starts with "it", or runs past the 29-character
  column.

### Not changed: the troll

Asked about, and left alone on request. A troll is not taking extra
turns - it has three attack dice (1d8/1d8/2d6, two claws and a bite,
straight out of Rogue), so one round prints three lines. Averages 16 a
round; medusa 21, ur-vile 20, dragon 25.5. Trolls start appearing around
floor 4-5 and are common by 8.

## A runed stone changed colour in the air

Reported: a red stone with the freezing rune flew white; a blue one with
the returning rune flew green.

The look of a runed stone is dealt afresh every run - `APPEAR.stone`,
a shuffle of the five carvings - and `itemSprite` respects it, so the one
in your pack and the one on the floor were right. The **flight** was
drawn from `WEAPONS[k].s`, the stone's true sprite, in all four places
that put something in the air: `throwAtSquare`, `fireAt`, and both
`G.ret` returns. So a stone changed carving the instant it left your hand
and named its own rune on the way across the room - which is the whole of
what identifying one is for.

All four now use `itemSprite(it)`. Nothing else in the renderer was
wrong; the floor and the pack already went through it.

The effects were already unconnected to the look - the deal is
reshuffled per run and `stoneLooksOK` has always checked that no two
stones look alike and that runs differ. What it did not check was that a
stone looks the same in the air as in the hand, which is why this got
through. It does now, for the flight out and the flight home, and it
fails unless at least one stone in the trial is actually wearing somebody
else's carving - otherwise an identity deal would let it pass.

## A curse you can point at, and a spinner that rushes

### The curse was written down where nobody could read it

Reported: five damage a turn in water, and no cursed object to be found.
Nothing was broken - `playerEffects` had listed the curse all along.  It
listed it **last**, after the hunger, the perks, the runes and the
protected armour, in a panel that shows **two** lines and counts the rest
as "+7".  So it was never once on the screen.

Three changes, all about saying so:

- Curses go to the **top** of `playerEffects`, and each one now takes two
  lines: `CURSED: water burns you` and `from your leather cap`
  (`curseSource(id)`).  It is the only entry in that list quietly costing
  hit points.
- `CURSED` on the panel flag line, which is always on the screen beside
  Hungry and Stuck.
- The first time the water burns you, an extra line: *"Your leather cap
  is cursed: water burns you."*  Once only (`G.saidWaterCurse`) - every
  turn would be noise, and the panel carries it after that.
- And the item's own notes in the pack say which curse, not just
  `CURSED - cannot be removed`.

`cursePlainOK` puts a cursed helm on with hunger, confusion, blindness
and haste all running, so the curse has four other lines competing with
it, and fails unless it is inside the first two.  That is what the old
code could not do.

### The web spinner gathers itself and rushes

`burst: 3` on the spinner: it banks an action a turn and spends three at
once - three steps, or a step and two bites, or three bites.  Average
speed is unchanged, it simply arrives all together.  Driven from
`monstersMove`, and only while it is hunting (`state === 2`), so it still
wakes up and patrols at the ordinary rate.

`monWeb` came **out** of `monRanged`: the spit is no longer something it
does in passing.  On its rush turn it asks `monCanCloseIn(m, 3)` - a
three-deep breadth first search for a square beside you, because straight
line distance says nothing about a wall - and if the answer is no, the
whole rush buys one web.  If it can neither reach you nor shoot (out of
`WEB_RANGE`, or no clear line) it spends the three on walking.

The aimed shot now **lays web on your square and then catches you with
it**, through the same `webCatches`/`stickPlayer` door that a patch on
the floor uses - one rule, written once.  A shot that goes wide lays web
on the ground *between* you and it, never under your own feet, which is
what "watch where you tread" is supposed to mean.  Measured: of 365 spits
at five squares, 163 landed on the player and held him every time.

Retired `WEB_EVERY`; the burst is the cadence now.

## Sure feet, spent wands, and blind is blind

### A third line in the EFFECTS list

It showed two, and a two-line entry was cut in half: "hands glow red:
next hit" with the half that said *what for* counted as "+3".  There were
ten spare pixels above the list doing nothing - the stats end at 96 and
the divider was at 104 - so it starts at 100 now, which is a third line.
`room` is worked out from the screen that is left rather than written
down as 2, and it keeps a line back for the thing in your hand.  The red
hands are one line again: "hands glow red: next hit confuses", 125px of
the 128 there are.

**The width checks were wrong in both directions and are now measured in
pixels.**  `noteChars()` worked from a screen 320 across, which this game
has never been: it allowed 29 letters where 21 of the widest fit.  And
21 letters is itself far too strict for anything written in English,
because the font is not fixed width - an 'i' is two pixels and an 'm' is
six.  `textPx()` measures the real thing against `INV_COL_W`, which is
now a constant in part1 that the drawing reads rather than a number
worked out twice.

### Sure footed, and a centaur

A new rune, `t: 'f'` - footwear only, the way `clearwater` is `'h'` for
headwear.  `gearRuneKind(it)` is the single place that decides which pool
a piece of gear draws from, asked by both the dungeon and the scroll of
enchantment, so they cannot drift apart.  Wearing it, `playerStumbles`
returns false: measured 52 falls in 240 running steps barefoot, 0 in the
boots.  Dealt to about 2% of the footwear that turns up.

`sure: 1` on the centaur, read by `monStumbles`: 0 falls in 400 against
an orc's 119.  And the hint "A centaur never stumbles."

### The web spinner, 1 / 1 / 3 - a round of five turns

Got wrong twice before it was right, both times by reading "1/1/3" as
actions in a three turn round.  It is **three parts of a five turn
round**: one turn spitting, one turn spitting, then three turns in which
it either walks and bites - an ordinary turn at a time - or spits one
more web and forfeits the other two, because there is nothing else it
can do to somebody it cannot reach.

    beside you   web web bite bite bite
    six squares  web web web idle idle

The reach is asked once, at the top of the three, and settles the rest of
the round.  Asking it again each turn would let a spinner spit, take a
step, and spit again.  `m.gather` is the phase, `m.rushing` the answer.

`monWeb` lost its minimum range.  A spinner standing over you
could not spit at all, so its gathering turns were spent on nothing
whatever, which was the whole of the complaint.  Web in the face is
exactly what it would do.

And a web spat over you now **stays on your square** rather than coming
away with you, so you can see what has hold of you.  It goes down over
whatever you were standing on - moss, a cracked flagstone - and
`L.webOver` remembers what it covered so `clearWeb` lays it back when the
web rots.  A patch you walk into still comes away on your boots; that one
you can see coming.

A spit that laid no web says `no web` in the bar rather than `miss`: a
blow that went wide and a shot that stuck to nothing are different
things and looked identical.

### A wand run dry crumbles

`wandSpent(it, spent)` after the zap has been resolved, so the charge you
paid for still does its work.  Both exits of `zapWand` go through it -
the teleport branch returns early.

### Blind is blind

- `noteDarkness` says nothing.  Walking from a lit room into a pitch dark
  one is not something you notice with your eyes shut.  The crossing is
  still **recorded**, so the line comes at the right moment if your sight
  is back before you cross again.
- `announceRoom` says nothing and does **not** set `r.told`, so a built
  room keeps its secret until you can look at it.
- Everything a creature does was already quiet: `canSeeMonAt` returns
  false when `P.blind`.

### Not changed: the bat, and knock back

The bat was measured over 300 one-on-one fights on floor 1 with the
starting kit: armour 3, your blows land 63% against the spider's 86% and
the ice monster's 92%, the fight drags 57 turns, and it kills you 10
times in 300 - twice the spider, five times the rat.  It is the hardest
thing on floor 1 to hit by a wide margin.  Armour 3 is the original Rogue
value and it stays, on request.

Knock back already existed and already worked on a club: 2.2% of the
maces the dungeon deals carry it, and 66 of 205 landed blows shoved -
`KNOCKBACK_PCT` is 35.  `knockBackClubOK` now holds both of those facts
down.

## A room announces itself at the door

`announceRoom` asked `roomIndexAt(P.x, P.y)`, and a doorway belongs to no
room - so the box came up on the step **after** you had walked in.
`roomToAnnounce()` looks through from a doorway to the rooms it joins and
takes the one with something to say, which is the moment the door is open
and you can see in.  40 of 40 special rooms with a door on them now say
so from the doorway.

## Eating, saving, and a nest that burns

### "You eat little" meant "you never eat"

`hasProp('slow digestion')` set the hunger burn to **zero**, so wanderer
boots stopped hunger dead - the meter sat at 100% for a whole run.  It
is thirty per cent now, by the same arithmetic the abstemious perk uses:
three turns in thirteen cost nothing, on a counter of its own so that
having both is worth having both.  Measured: hungry after 1701 turns
barefoot, 2213 in the boots (30% longer), 2878 with the perk as well.
And you still starve in them, which the check also holds down.

### SAVE AND QUIT does both

It opened the slot picker, wrote the file, printed "Saved." and sat there
with the run still going.  Now: the slot is asked for **once**, and
`G.slot` remembers it - set by `saveInto` before the run is packed, so
the save carries it, and by `loadFrom`, so a run taken out of slot two
knows it lives in slot two.  After that SAVE AND QUIT writes that slot
and drops you on the splash with no menus standing behind it
(`quitToTitle`).  If writing the remembered slot fails, the picker opens
with the reason.

### Fire runs through web

Web is the one thing in the dungeon that catches from the square next
door - everything else has to be standing in the flame.  `catchWebNear`
lights any of the eight neighbours that has web on it, two or three turns
each, so a fire crosses a nest at about a square a turn: measured, seven
squares in nine turns and none of it left.  A table beside a fire is
still a table, and the check says so.

Burning web goes through `clearWeb` rather than `delete L.decor[j]`: it
is held in two places - the drawing and the patch that catches you - and
deleting only the first left an invisible patch that still stuck you.

### A spinner sits in a nest

`spinNests` runs after `populate` and moves seven spinners in ten into a
corner of the room they were rolled in - `roomCorners` looks for a floor
square with five of its eight neighbours in the stone, which is what a
corner comes to, and works from the room's floor list because half the
rooms down here are not rectangles.  Then three or four squares of web
spun out from it.

Nest web is **permanent**: `L.webs[k] < 0` means `ageWebs` leaves it
alone.  A patch that rotted in forty turns would be gone long before you
walked across the floor to find it.  The creature is marked `m.nest` so
the check can tell a spinner that lives there from one that wandered
across somebody else's web.

This turned up an old invariant that had to give: `decorHides` counted
web as something you could lose an item under.  The drawing puts what is
on a square over its decor, exactly as it does with moss, so a thing
lying in a nest is in plain sight - a larder rather than a hiding place.

## A flaky render check, fixed

`player animation` set `P.walkT` a fixed distance behind `Date.now()` and
then rendered, so how far through the 180ms walk cycle the renderer
thought it was depended on how long the render took to start. Under load
— four suites on two cores — the 95ms sample could land past the end of
the cycle, the second frame never drew, and the suite failed with "the
player does not animate while walking". It failed about one run in
twenty-four under contention and never on an idle machine.

It now freezes the clock for each sample. Note **which** clock: the
engine runs in its own `vm` context in `test_render.js`, so it is
`ctx.Date` the renderer reads — freezing this file's `Date` leaves the
engine on the real clock and proves nothing. The first go at this fix did
exactly that and looked fine. The idiom to copy is the one the warp-flash
test already used. Twelve concurrent runs, no failures.

## Making the probes faster, part two (same session)

**There are no millisecond waits to disable.** `beatWait(ms)` only adds
to `G.beat`, a counter, and `beatNow()` returns `Date.now() + G.beat`.
Those numbers are timestamps handed to the browser so it can play a turn
back; in node nothing sleeps on them. There is no `setTimeout` and no
busy-wait anywhere in the turn path. Asked to "turn off the waits",
there is nothing to turn off.

What the time actually goes on is building floors. Four changes, each
kept only after proving the suites' output **byte-identical** to before
(`test.js` and `test_rules.js` are deterministic, so a plain `diff` of a
full run is the proof; `test_render.js` and `test_sound.js` are not -
see below):

- `roomDoors` - a reused stamped buffer instead of a fresh hash object
  per call.
- `wallPass` - asks its `isTarget` its 256 answers once, then runs from
  the target squares rather than nine-neighbour-checking every square of
  rock. Sound only because neither caller counts rock or wall as a
  target, so turning rock into wall never creates a new one and the
  order squares are visited in cannot matter; a caller that did would
  take the plain pass, which is still there.
- `doorDestinations` - the big one. It flooded the floor once per door;
  it now (a) marks the room's own squares once instead of scanning the
  floor list four times a door, (b) remembers a fill so a second door
  coming out on the same stretch is answered without another, and (c)
  skips the fill entirely unless some other door shares that door's
  wall - which is the only case the one caller ever compares. 9.8% of
  the soak down to 3.2%.
- `touchesRoom` - the sight pass asks it of nearly every square; away
  from the map edge no neighbour needs a bounds check or a walk through
  a list of offset pairs. This is what took the render suite from 22s
  to 14s.

Two things were tried, measured, and **thrown away** - do not re-try
them without measuring:

- Labelling every piece of the floor once in `doorDestinations` instead
  of flooding per door. Correct, and slower: two doors nearly always
  share a stretch, so the remembered fill already gets it in one pass.
- Clearing only the squares the last `reachSet` touched instead of
  `seen.fill(0)`. Slower - `fill` is a memset on a few kilobytes and
  beats a second write per square walked.

Result, run one at a time: soak 37.5s -> 29.6s, rules 24.7s -> 18.1s,
render 22.1s -> 14.2s, sound unchanged. Nothing about generation
changed: same floors, same dice, same output.

### `node tests.js` runs all four at once

New. They are separate processes that write nothing, so they can run
side by side; the runner prints each suite's output whole and in the
usual order, repeats any failure at the end, and exits non-zero if any
failed. `node tests.js rules` runs just the ones whose name matches.
Running a suite the old way still works and nothing here replaces it.

The sandbox this was measured in has **2 cores**, so the four together
took 44s against 63s one after another. On a machine with four or more
the whole set should come down to about the length of the soak.

### Two suites are not deterministic, and never were

`test_render.js` presses a random key (`Math.random`, line ~316) and
`test_sound.js` measures real noise (`Math.random` in `part5_sound.js`,
by design - noise ought to be random). Their printed figures move from
run to run on untouched code. Do not treat a diff of those two as a
regression; check they pass, and diff `test.js` and `test_rules.js`,
which are deterministic and are the real guard.

`test_rules.js` has one figure that jitters by a millisecond: the "ball
fire waits 440ms" line is derived from two `Date.now()` readings, so it
occasionally prints 441. The check itself is an ordering one and is not
flaky.

## Still to convert, in likely order of worth

From profiling `test_rules.js` (boots remaining by caller):
`blastOpensLightOK` (120 boots — but each is `bootTest` **plus**
`enterLevel(4)`, so converting means re-snapping with `snapFloor()`
after the `enterLevel`; it also blows up walls and light, so measure
extra carefully), `thrownConfusionOK`, `crossfireOK`, `lightSpillOK`,
`spillThroughHoleOK` (these last two mutate room lighting, which
`bootRoll` does **not** restore — restore it in-probe or extend the
snapshot first), and a long tail of ~20-60-boot probes.

Explicitly **not** candidates: `barrelsOK`, `barrelsAreSolidOK`'s first
loop, the crystal-counting loop, and anything measuring dead ends, room
sizes, stair placement or moss distribution — they measure generation
and need real floors.

## A loose thread worth knowing about

Probes are seed-deterministic only in isolation: running `keyHomesOK` or
`ringRarity` before `huntTrailOK` shifts which of its trials pass guards
(48 vs 50 tried), so something global survives `bootTest` — likely a
counter, not the dice. The converted probes are robust to it now, but if
a probe ever passes alone and fails in the suite, look here first.

## House rules that keep being earned the hard way

- Write the invariant as a test, measure how often it fails, find the
  pass that produces it, then fix it. Never loosen a test to make it
  pass.
- Prove a new test fails on the old code before keeping it.
- All four suites before calling anything done.
- Never hand-edit `index.html`; it is generated.
- Never bake `spritesheet.png` into the HTML, and never let anything but
  `migrate_sheet.py` write that PNG.
- Convert probes to `bootRoll` a few at a time, measuring pass rates
  before and after. If a rate drops, the probe was leaning on fresh-floor
  variety — find what it assumed and pin it down by hand.
- Speeding up generation is only allowed to be a speed-up: keep a full
  run of `test.js` and `test_rules.js` from before, and `diff` it. Same
  floors, same dice, same output, or the change goes back.
- Measure a supposed optimisation more than once. Two of these read as
  wins on a single run and were losses on three; run-to-run noise here
  is about half a second.
