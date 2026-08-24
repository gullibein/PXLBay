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

## Twelve things, in one go (session of 17-22 Aug 2026)

A list handed over in one message and worked through unattended.  Every
one of them has a check that was proved to fail on the old code first,
and all four suites are green.

### A powder barrel burns for a turn first

Measured before changing anything: the fuse was already two ticks, which
is one full turn.  Left alone; `barrelFuseOK` now pins it so it stays
that way, and pins that the barrel is visibly alight while it burns.

### The web spinner spits twice a turn and keeps her distance

The five-turn round is gone.  `spinnerTurn` is the whole of it now:
two webs a turn (`SPIN_SPITS`), and if she is within `SPIN_KEEP` of you
she backs off a square afterwards so she can keep spitting.  The moment
you are stuck, she gets `SPIN_POINTS` (6) to spend on moving and
biting - **one** bite in a round, and if she has points left after it
she runs back out again.  `monCanCloseIn` is deleted.

### Lightning is drawn, and it runs to the wall

The wand of lightning used to stamp a row of `bolt` sprites over 14
squares.  Now `zapWand` gives it a reach of the whole map, so it stops
at the first thing that blocks a shot, and everything standing in the
row takes it.  `drawLightning` in `part4_render.js` draws the current
itself: points every square along the path, kicked alternately to each
side (`BOLT_WOBBLE`) with the kinks unevenly spaced (`BOLT_SLIP`), three
passes dark to bright (`BOLT_GLOW`, `BOLT_BLUE`, `BOLT_CORE`) and a fork
off the side here and there.  It re-jags every `BOLT_FLICKER_MS`, so it
crawls.  Checks: `lightningReachOK` in the harness (to the wall, past
fourteen, everything in the row hit, and a wand of cold still stops at
fourteen) and "a bolt of lightning" in `test_render.js` (blue, several
shades, spans the path, crooked, and not one sprite stamped).

### You start flickering before the blow lands

`die()` records `G.deadFrom`, and the blink only starts once
`Date.now()` has reached it - so the rock or the fireball is seen to
arrive first.

### A chasm across a room, about one room in twenty five

`addStream(L, r, HOLE)` already existed and already laid a bridge over
the gap; it just about never happened.  Measured: **one room in 98**.
`addStream` refuses a room it cannot span cleanly, and takes about one
attempt in six, so `CHASM_CHANCE` went 6 -> 33, which measures **one
room in 24**.  `chasmRoomsOK` holds it between 1-in-18 and 1-in-35 and
checks every one runs wall to wall, has planks over it, and has cracked
flagstones along the banks.

A room the floor has fallen out of is no longer picked for a special
room (`roomIsCut`): a powder store cut in half is a powder store with
half the barrels.  A nest of web now works out where it will go before
laying a strand, and tries another corner if the one it picked has
nowhere to spread.

### Stumbling, for both of you

A creature only trips when it is running from you, or running after
somebody who is running from it: `monStumbles` asks `monFleeing` and
`monChasingAFlight`.  Measured over 40 seeds that this did not make the
game harder - 27 runs alive against 22 on the old rule.

### A left click looks, a right click asks

In the pack, a left click with a real mouse picks the thing out and
shows its name; only a right click opens the menu.  A finger has no
second button, so a tap still opens it (`usingMouse()`).

### A wall of fire sets things alight, and bridges burn

`fireWallsCatch()` runs at the head of `ageTempWalls()`: every sheet of
flame lights the powder under it, catches the web beside it, and drops
an ember on anything burnable in the eight squares around it.  A bridge
counts as something that burns now (`BRIDGE_BURN_MIN/MAX`, two or three
turns); when it goes, what it spanned comes back, and standing on one
over a hole when it goes drops you.

One bug found on the way: the ember dropped to light a thing was sized
for that thing, and then `catchScenery` added the thing's burning time
on top - so web took six turns rather than three.  The ember is now
`IGNITE_TURNS` (one turn of flame) and the material supplies its own.

### The map does not move at all until you are centred

Ownership of the glide is explicit: `WALK_ON_MAN` says whether the step
being walked belongs to the man or to the map, `manLag()` and `mapLag()`
hand it to one of them, and `camFollow` sets it as it decides.  Off
centre, the map is held perfectly still and the man glides; centred, the
map glides and the man does not.

### Poison and fire in the air hit you at once

`cloudsOnYou()` was split out of `ageClouds()` and is called at the top
of the turn, before the beat is spent - so what the air does to you
happens as you step into it rather than after.

### Water thrown makes a puddle

`spillWater(x, y, holy)` lays one to four connected squares of water
(`PUDDLE_MIN/MAX`) where the flask broke, holy water laying the blessed
sort.  It will not lie on a rug (which soaks it up), on a bridge (a
plank over a drop), on a stairway (cut into the floor, and it drains),
in a doorway, or on a square another conjuring is already holding.  It
puts out any fire it lands on, and it dries after `PUDDLE_TURNS_MIN..MAX`
turns - the same `L.temp` machinery a wall of fire uses, which is why
`placeTempWall` now remembers the floor under the puddle rather than the
puddle.

### Every flask is a mouthful

Food was scarce enough to die of.  Measured on the old code: **0.12**
things to eat a floor, and 83% of floors with nothing on them at all.
Two changes, both small: every potion you drink is worth `POTION_SIP`
(120) on the food clock - the flask of nourishment excepted, which is a
meal already - and a quarter of floors get a snack lying about
(`FLOOR_SNACK_PCT`), a mushroom or a handful of berries rather than a
ration.  Rations are as rare as they were.  Now: **0.36** things to eat
a floor, 209 on the clock from the floor plus about 290 from flasks.
`potionSipOK` and `foodOnFloorsOK` hold both ends of it.

### Three probes that were measuring the wrong thing

Not loosened - corrected, and each still catches what it was written
for:

- **beats** asserted a creature stays within ten squares of its post.
  But a round is two or three places *in its own room*, and rooms can be
  long: fifteen squares from its post and still exactly where it belongs.
  It now asserts it never leaves the room it was posted in (a post in a
  corridor keeps the distance bound).  Verified it still catches
  drifting: with `wanderStep` made to walk toward the player it reports
  "one left the room it was posted in and was 24 squares away".
- **the hole corners** check counted every one-pixel cut on the screen
  and expected twelve.  A chasm is a hole too and has its corners cut
  the same way, so it now asserts no pixel is cut off a square that is
  not a hole.
- **three setup probes** (`throwAnywhereOK`, the fireball line,
  `wearFromFloorOK`) picked a square without asking whether it was dry
  floor, or stood on whatever the floor happened to leave there.  With
  more gaps about, they started picking holes.

## Light, and a spinner that no longer teleports (session of 22 Aug 2026)

### Every step of a six point round is seen

The playback machinery was right all along: each step a creature takes
is pushed onto `m.anim` stamped with the instant it happens, and the
renderer walks that queue.  But `spinnerTurn` spent all six points
without moving the clock on, so all six steps carried the same stamp -
and two steps stamped with the same instant cannot both be shown.  The
playback drew the first stride and then the finished position, which is
exactly the teleporting.

Each point she spends now pushes the clock along by `SPIN_STEP` (0.3) of
a beat - 150ms, comfortably longer than the 110ms a stride takes to
cross a square - and the bite is worth a whole `BEAT_ACT`, because a blow
has to be seen to land.  Measured on a real round: five steps at
0, 150, 150, 150, then 652ms across the bite.

`stepsAreSeenOK` in the harness pins it: no two steps of a round share a
moment, none starts before the last has finished crossing, and the whole
round is still a flurry rather than six turns.  It also checks the same
for a quick creature's second step.  On the old code it reports "two
steps of one round share the same moment".

### Fire and lightning light the room

New in `part4_render.js`: `buildGlow()` works out, once a frame, what
every burning or crackling thing is throwing on the squares around it,
and the map pass reads it twice.

- **a flame** - a fire cloud, a sheet of conjured flame, a creature
  walking about alight - lights its own square and the four beside it at
  full, and the four corners at half.  That half is what makes the pool
  read as round rather than square.
- **a blast** does the same and reaches one square further along the
  four ways, at half.  The far square only lights up if the square
  between it and the blast is see-through, so a barrel going off behind a
  wall does not light the floor you are standing on.
- **lightning** lights one square about it like a flame, in blue.

Two things happen on a lit square.  What is drawn there is brought up
towards full brightness - `a + (1 - a) * v` - so a dark square beside a
flame really does light up and a corner comes halfway up.  And a wash of
the light's own colour (`GLOW_FIRE`, `GLOW_BLAST`, `GLOW_BOLT` at
`GLOW_WASH`) is laid over the square with `lighter`, over the floor, the
furniture and whoever is standing in it - so it reads in a room that was
already lit.  The wash goes on after the dungeon and before anything you
are being asked to read, so a menu or a cursor is never washed orange.

### A fire is a light, and a light is a thing you see

The first cut of this had it backwards: light only fell on squares you
could already see, so a fire at the far end of a pitch dark hall showed
nothing at all until you had walked up to it.  That is not how light
works - light is what makes a thing visible in the first place.

So `lightMap()` moved out of the renderer and into the rules, where
`computeVis` reads it: every square the light falls on is visible from
any distance, however dark the room it is in, as long as `sightClear`
holds between you and it.  Round a corner it is not, and neither is the
floor it lights there - the wash is drawn only where the sight pass has
already said you can see.

`fireLightsFarOK` sets a fire down at the end of a hall it has just
blacked out - eighteen squares off on average, the furthest twenty nine -
and checks the fire and what it lights are seen, that the floor two
beyond the fire is not (it does not reach), and that a fire with stone
between you and it shows nothing.  `losSanity`, which asserts nothing is
visible beyond the lamp's reach, now knows about firelight as the one
other way a distant square can be lit.

"light from fire" in `test_render.js` measures the whole falloff off the
real draw calls - which squares were washed, how strongly, in what
colour, that the blast's light dies with its flash, that lightning's is
blue, that nothing is lit with nothing burning - and separately that a
dark square beside a flame is drawn at full and a dark corner halfway
up.  The fake canvas now records the alpha and the composite operation
of a `fillRect`, which is what makes that measurable at all.

## Light that ends with what makes it, and glass (session of 22 Aug 2026)

### A beam is a light in the air, not a fire on the floor

Lightning and the sheet of flame out of a wand now throw `GLOW_BEAM`
(half) of what the same thing burning on the floor would - and, more to
the point, they stop the instant the beam does.

That took splitting the light in two.  `lightMap(1)` asks for the
**standing** sort only: a fire on the floor, a sheet of conjured flame, a
creature alight, the lamp you are carrying.  Those are lights the dungeon
has, so `computeVis` reads that one and they decide what you can see and
what goes on your map.  `lightMap()` adds the **flashes** - the bolt, the
wand's flame, the instant a barrel goes up - which light what they fall
on for exactly as long as they last and leave nothing behind: a corridor
lit by lightning is a corridor you glimpsed, not one you have walked.
The drawing pass now draws a square that is lit even when it is not on
your map, and forgets it again when the flash goes.

A fire on its last turn gives half the light of one that is properly
burning, which is also what a **burning stone** thrown at bare floor now
looks like: it bursts, burns where it lies for `BURN_TRAIL_TURNS` (2)
turns, full light on the first and half on the second.
`burningStoneOK` measures all three.

### The wand of fire is drawn, and always has a light

**The bug:** the sheet of flame was a row of `flame` sprites, and its
light came entirely from the fire it left burning behind it - which
`scorch` refuses to lay on water, in a doorway or on any square you
cannot walk onto.  Fire a wand of fire across a stream and you got a
beam of flame with no light anywhere near it.

Now the beam carries its own light, and it is drawn rather than stamped:
`drawBeam` is the bolt's own machinery with the numbers in a table, so
lightning and flame are one drawing with different dice.  Flame gets a
third of the bolt's swing and twice as many points, so it runs nearly
straight down the row and ripples instead of zigzagging; it licks off its
own side constantly rather than forking now and then; and it is red at
the edge, orange through it, pale yellow at the core.

### Glass armour

`{ n: 'glass armor', a: 6, p: 4, w: 380, norust: 1 }` - turns a blow like
banded mail, rare, and worth a good deal.  Nothing corrodes it: the two
places that used to ask `name.indexOf('leather') < 0` now ask `canRust`,
which knows about leather, about a scroll of protection, and about glass.
A rust trap and an aquator are both measured against it in
`glassArmourOK`.

It has a sprite of its own, added through the procedure in `CLAUDE.md` -
and the sheet on the machine was **repainted since the last session**
(thirty sprites), so the migration was run against that one, staged down
from the device first.  `migrate_sheet.py` reported `graphics altered:
none` and the font intact, and it was checked again afterwards
cell-by-cell against the staged copy.  `armor_glass` is the one newly
drawn cell: pale cyan placeholder, waiting to be painted.

### "of light"

A rune for a blade or a breastplate (`t: 'wg'`).  It is a lamp you carry:
`LAMP_FULL` (2.3) squares of full light about you and half a square more
beyond that, measured as the crow flies so the pool is round.  The full
ring is set a little past two on purpose - two along and one up wants to
be inside it, or the pool reads as a cross.

It is a light like any other, so it is `lightMap`'s standing sort: in a
pitch dark room it does not merely brighten what you could already see,
it shows you the room (measured: 9 squares in sight, 34 with it on).

And it is the one enchantment that cannot keep itself secret.  Every
other rune sleeps until you have studied the thing; a light that only
shines once you know about it is no light at all.  So `lampOn` reads the
rune rather than the *known* rune, and `upkeep` takes the hint and writes
the name down - "Your long sword is glowing."

## Web, stones, dark eyes and a box to look in (session of 22 Aug 2026)

### One web every other turn, and no piling it on

`WEB_EVERY` (2): a spinner has to gather the next one, so she spits at
most once in two turns.  And `stickPlayer` now refuses outright when you
are already stuck: web on web used to add its own turns to the count, so
a spinner who kept spitting could hold you as long as she liked, and
being held for ever is not a fight, it is a wait.  She still spits over
you - it just does not make it any worse.

`webEveryOtherTurnOK` measures both: twelve turns of asking produces six
webs, never two inside two turns, and four more webs on a stuck player
add nothing to the count.

### The witch carries ten stones

`WITCH_STONES` (10), counted down as she throws.  When they are gone she
has nothing left to throw, however long you stand there.  Every stone
that goes wide is now lying on the floor - `dropStone` puts it where it
fell, stacking with anything already there - so a long fight with a witch
leaves you a handful of stones of your own.

### Night eyes see through every kind of darkness

**The bug:** there are two darknesses.  A room marked pitch dark, and the
far commoner sort - a room nobody left a lamp in.  The sight pass skipped
its dark clamp for a Night stalker, which fixed the first and did nothing
whatever for the second: an unlit room still gave him a torch's reach of
four squares, exactly what anybody else gets.

Now night eyes lift the reach to `LIT_RADIUS` on any square, dark or
merely unlit.  Measured: 59 more squares of sight in a room with no lamp
in it, and the two kinds of darkness now come out identical, which is
what "sees in the dark" has to mean.

### And a light costs you your quiet

`GLOW_STEALTH` (22) off `stealthScore` while anything of light is
equipped - about what soft boots are worth the other way.  Measured on a
creature four squares off: it notices you 66% of the time against 46% in
the dark.  It is the price of the lamp, and the rune's line in the
EFFECTS list says so: "armor glows: lit, easily seen".

### INSPECT

Every one of the 128 things in the dungeon can be held up and looked at:
a box with its picture at twice size, its name, a line or two about what
it actually is, and its details in full - the panel beside the pack has a
column 128 pixels wide, and this has the screen.

`LORE` in `part1_core.js` carries a written line for every item; `LORE_KIND`
catches anything that ever gets added without one.  `itemLore` picks
between the two, and - the rule that matters - describes **what you can
see**: an unidentified flask is a flask of aquamarine liquid, not "a
clean red brew that smells of iron".  `itemDetail` is the panel's notes
plus the part there was never room for.  The price waits on `worthKnown`
for the same reason: a flask worth two hundred gold is obviously not the
thirst quencher.

Reached three ways: `Inspect` on every item's menu, `i` on the square
under the cursor, and the top right panel.

### The other two panels

The middle panel opens a box about the man himself - level, health, the
three stats with what they were in brackets wherever something has
drained one, protection, what you are armed with and what it does, how
quietly you move, how often you slip aside, food, gold, floor and turn.

The bottom one opens a box about everything working on you: every effect
named, with a sentence under each saying what it means.  Perks and runes
explain themselves out of their own long form.  When it will not all fit,
the **names** all stay and the explanations fill what room is left -
cutting the list short would mean the effect you most needed to know
about was the one that fell off the bottom.

`inspectOK` in the harness walks all 128 items and checks each has a
finished sentence about it, that no unknown thing names itself or prices
itself, and that the two boxes about the player have something to say.
"inspecting a thing" in `test_render.js` opens the box on sixteen kinds
of thing and checks it has a picture, a good deal of writing, and fits on
the screen every time; that the menu offers it on everything; that a key
or a click puts it away; and that the three panels are three separate
things to press that open three different boxes.

## Runed stones, quieter descriptions, and the story so far (23 Aug 2026)

### A runed stone is not always used up

`RUNE_RECOVER_PCT` (25): a rune cut into stone survives going off about
a quarter of the time, and the stone is lying there afterwards with its
carving intact - not worn down to a pebble.  The same things that get
your arrows back (a ring of battle luck, the scavenger perk) get your
stones back too, and a charged one still always survives.  Both throwing
paths do it now - at a creature and at bare floor.  Measured over 400
throws: 25 in a hundred.

The returning stone is not part of this: it has its own arrangement and
comes home, which is what the box now says about it.

### Descriptions that only say what is worth saying

Out: whether a thing stacks, how to throw a pile one at a time, which
part of you a boot goes on, how many turns of the food clock a ration is
worth, and "one throw and the rune is spent" - which was never true of
the returning stone and is no longer true of any of them.

In: "the rune goes off where it lands", "about 25 throws in a hundred
leave it whole", and "it flies back to your hand" for the returning one.
The leather armour reads as asked: "...it is light and tough. Definitely
better than nothing."

`inspectSaysNothingIdleOK` walks every item and fails if any of the five
retired lines comes back.

### The frame walks onto the panels

`panelRects()` is one list of three rectangles, read by the drawing, by
the mouse and by the arrow keys - so what you see framed, what you click
and what ENTER opens are the same three boxes by construction.

Right off the edge of the grid steps onto them, up and down walk the
three, left comes back to the square you left, ESC steps off rather than
shutting the pack, and ENTER or SPACE opens the one the frame is on.  The
grid's own cursor stands aside while the frame is out there, so there is
never a yellow frame in two places.  Pressing the top panel with nothing
under the cursor says so rather than doing nothing at all.

### The story so far

The panel keeps the last sixty lines because it walks that list every
frame.  `G.hist` keeps `HIST_KEEP` (800) - the whole talk of the run -
and **T**, or a press on the panel's own text, opens it: a full screen
box, opened at the last thing said, with the arrows walking back into the
past (PAGE UP/DOWN, HOME and END as well), a rule between turns and a
bar down the edge showing how much run there is.

It is drawn after the side panel rather than inside the map's drawing -
every other box over the dungeon lives inside the map area, and this one
takes the whole screen, so drawn there the panel painted over it.

The help screen says so.  It had no spare row - it is exactly as tall as
the screen - so the two keys that read rather than do now share a line:
`?  T   read a square / read the log`.

## Trapdoors, cellars and a barrel that goes up properly (23 Aug 2026)

### Four small ones

A **returning stone** that comes through a throw carries its own tally
with it - `keepRuneStone` copies `ret` - so a spent one cannot wind
itself back up to full by surviving.  The **quagga is a skeleton** now
(name and hint; the sprite was already repainted).  **ESC out on the
panels** closes the pack, since the left arrow is what steps back into
the grid and pressing ESC twice to leave read as the key not working.
And the **frame round a panel** is drawn at the end of `drawInv` rather
than with the hit areas - the rules between the panels sit exactly on its
top line and were painting over it.

### A barrel of powder

Four things it does now that it did not.  The flash is drawn from three
sprites dealt by each square's own hash rather than the same flame
stamped twenty times.  It lights the room like a lamp for the moment it
goes up - `glowBoom`, full to two squares and half to four - instead of
a flask's one-square pool.  It leaves `BARREL_FIRES_MIN..MAX` squares
burning for a turn or two.  And it hangs a cloud of **smoke** over the
hole: the poison cloud's own machinery with a third colour, tinted grey
off the same sheet trick that tints the red mist, and `SMOKE_DAMAGE`
(1-2) instead of poison's 1-3.

`barrelBlastOK` measures all of it, including that smoke is kinder than
poison, and that the whole lot clears.

### Trapdoors, and the cellars under them

A new tile, `TRAPDOOR`, hidden until it is found and drawn as plain
flagstones until then.  `doSearch` looks at the square under your own
feet as well as the four beside it now, since a door in the floor is a
thing you stand on.  About one floor in four has one.

**Under a rug it cannot be found at all.**  `findTrapdoor` refuses while
`trapdoorCovered` holds, so the only way to that one is to burn the
carpet off it.  That took a fix in `tidyRugs`: it rolls up any rug that
has lost a square to something that is not flagstones, and a trapdoor
under one counted as lost - so laying a door under a carpet made the
carpet disappear.  A `TRAPDOOR` square is now still floor as far as the
rug is concerned, which is the whole point of it.

Down the trapdoor is a **cellar**: `genCellar` digs one to three small
rooms in its own patch of rock, joined by corridors, with the way back up
in the first room and the hoard in the last.  Four in five of its rooms
are pitch dark.  One in three cellars puts a long hallway before the last
room; one in four makes that room a large lit hall.  `stockCellar` fills
the far room: a ring a third of the time, otherwise a blade with plusses
on it and a rune more often than not, plus a few good things and a purse
of gold.

It is **not a floor of the dungeon**.  `G.depth` does not change, the
floor above is kept exactly as it was, and the cellar is kept beside it
under a key of its own - `"3c"` next to `"3"` - with `G.floorKey` saying
which of the two you are standing in.  The way up comes out on the
trapdoor itself.  `cellarSaveOK` saves a run from inside one and loads it
back: same cellar, same hoard, same square, and the way out still works.

### Three probes corrected on the way

Adding a trapdoor to the generator moves the dice, and three checks were
leaning on where the dice used to fall: the spinner probe measured a lane
whose middle square it never checked was walkable, the camera probe gave
up if the player did not happen to start with two clear squares in a row,
and the hole probe dug its pit wherever it liked - including squares out
of sight, which are not drawn at all.  All three now look for what they
actually need.

## The Persian rug (23 Aug 2026)

The rug used to be a nine-slice: ten cells on the sheet - four corners,
four edges and two middles dealt like a chequerboard - stamped out to
whatever size the room allowed.  It is now one Persian design, taken
from a picture, and every rug in the game is a slice of that one design.

### Six tiles, laid mirrored

The design is four squares across and six down and symmetrical both
ways, so only a quarter of it is kept: two columns of three tiles,
`rug_00` `rug_01` `rug_10` `rug_11` `rug_20` `rug_21` (row, then column).
The other three quarters are those same tiles laid over - mirrored left
to right, top to bottom, or both.  Rebuilding the whole picture from that
quarter differs from the original in 20 pixels of 1536, all of them on
the two fold seams, so the design really is symmetrical and nothing is
lost by keeping a quarter of it.

A square of rug carries in its name which tile it is and which way it
went down: `rug_11`, `rug_11h`, `rug_11v`, `rug_11hv`.  `rugTileName()`
in `part1_core.js` builds the name; `drawDecor` in `part4_render.js`
reads it and draws through the new `sprMirror()`, which is `sprFlip`
generalised to either axis (`sprFlip` now calls it).

### Which tiles a small rug is cut from

A rug is symmetrical both ways whatever size it is, so a rug is written
out a quarter at a time as well: its top left corner, down to and
including its middle row and middle column.  `RUG_CUT` in
`part1_core.js` holds one line per size - fifteen of them, `'2x2'` to
`'4x6'` - and each entry is `[row, column]` of the tile to use.
`rugSquareName()` folds it out: `min(dx, w-1-dx)` says which square of
the quarter this is, `dx > w-1-dx` says whether it is mirrored to get
there, and the middle row or column of an odd-sized rug is its own
reflection and goes down as painted.

Which tiles a size is cut from is taste rather than arithmetic - the
medallion has to end up in the middle whether there are six rows to play
with or two - so changing any size is one line and touches nothing else.
Sizes 2-4 tall use the medallion tile (row 2) for the middle row's inner
columns and the field tile (row 1) for its outer ones, which is how
Gulli drew the 4x4 by hand; 5 and 6 tall are the design's own rows.

Widths run 2-4 and heights 2-6 (`RUG_MAX_W`, `RUG_MAX_H`): no rug is
bigger than the design it is cut from, so no tile is ever repeated
unmirrored.

### The old ten cells are retired

`gen_atlas.py` refuses to write when a sprite disappears, which is right
- but it had no way to say a sprite was taken out on purpose when its
definition is deleted outright rather than merely unplaced.  It has a
`RETIRED` list now, holding the ten old rug names; anything that vanishes
without being listed there still stops the build.

**Gulli's repaint of those ten cells went with them.**  The sheet that
came off the device had fresh fringes painted on the old nine-slice
pieces and a repainted `trap_pit`; `trap_pit` carried across untouched,
the rug cells had nowhere to go.  If the new rug wants a fringe it has to
be painted into the six tiles.

### What proves it

- `rugCutTableFaults()` checks the table itself: every size the
  generator can ask for has a quarter written out, each quarter is half
  the rug rounded up both ways, and every tile it names is on the sheet.
  A quarter a row short would fold the wrong square onto the middle with
  nothing else noticing.
- `rugSliceFaults()` in `harness.js`, run on every floor that has a rug:
  every square names one of the six tiles, the rug is a size the table
  allows, every square is the tile `RUG_CUT` gives for it, and it
  reads the same from either end - the square opposite any square across
  the middle is the same tile mirrored the other way.  On an `addRug`
  that stamps the six tiles in a repeating grid: 590 faults.
- "the rug" in `test_render.js` lays a rug of all fifteen allowed sizes
  in turn and checks every square came off its own cell turned the way
  its name says.  The fake canvas now records `mirX`/`mirY` (the sign of
  each axis) as well as `flip`, because `flip` alone cannot tell a
  left-to-right mirror from a top-to-bottom one.  On a `drawDecor` that
  stamps the tile the right way up: 125 faults, one for every mirrored
  square of every size.

## The rug, second pass: a spine, and always upright (23 Aug 2026)

Two corrections from Gulli, both with a picture of the rug he wanted.

### A three-wide rug has a middle column of its own

The design is four wide and folds down the middle, so a three-wide rug
has a column with no twin to mirror against.  It used to borrow the
four-wide design's inner column, which meant the middle of the rug was
half of something.  There are now three tiles painted for it - `rug_0c`,
`rug_1c`, `rug_2c`, taken from his 3x6 picture - laid down the spine and
mirrored only top to bottom.  The game's 3x6 is pixel-for-pixel his
picture.

`rugCutTableFaults()` guards the pair of rules that go with them: a spine
tile belongs in the middle column of an odd-width rug and nowhere else,
and nothing else belongs there - anywhere else it would be laid against a
mirrored copy of itself, and the pattern would not meet.

### Every rug is woven upright

A rug is taller than it is wide.  One lying across a room is that same
rug turned a quarter circle, so `RUG_CUT` holds upright sizes only -
twelve of them, `'2x2'` to `'4x6'` - and `rugUpright()` turns a square of
a rug on the floor back to the square of the upright rug it came from.
The name carries the turn: `rug_11hvr`.  `sprMirror()` in
`part4_render.js` grew a quarter-turn argument and mirrors *inside* the
turn, which is the order the thing was made in - woven, then laid down.

Because the short side of the design is four squares and the long side
six, a rug on the floor can now be up to six squares across if it is
short enough (`RUG_MAX_SHORT`, `RUG_MAX_LONG`); `addRug` takes in
whichever side is shorter if the dice give something longer than four
both ways.

### A 3x5 rug repeats the field row

The middle row of an odd-height rug is its own reflection, and half a
medallion is not.  A 3x5 takes the field tile again rather than the
medallion's half - his instruction, and the same reasoning as the spine.

### What proves it

- The per-floor check knows which way a rug is lying: every square of a
  rug across a room says `r` and every square of an upright one does
  not, and the fold across the room's left-to-right is the rug's own
  top-to-bottom when it is turned.  Against a generator that names the
  squares of a turned rug as if it were upright: 602 faults.
- The render check now lays every size **both ways up** - 21 in all - and
  compares the whole canvas transform, not just which axes were
  mirrored: `[0,1,-1,0]` is a quarter turn and nothing else is.  It also
  folds each drawn rug in half both ways and requires the two halves to
  be the same tile drawn reflected, skipping the middle row or column,
  which folds onto itself.  Against a `drawDecor` that ignores the turn:
  349 faults.
- Table faults proved on a spine tile moved off the middle (2 faults) and
  on a size left out (1).

### A gap in the line-of-sight check, found on the way

Moving the rug dice reshuffled the dungeon and the soak's LOS phase
failed twice: one square visible ten squares off, outside the lit room.
It turned out to be the documented third rule - *the face of a wall
standing beside something you can see is lit, so an outline never has
holes punched in it* - reaching a wall beside a corridor square that was
itself part of the lit room's outline.  The probe knew about the lit room
and about fire, but not about wall faces.

Measured before touching anything: 7 such squares in 2,400 turns on the
new code and **11 on the build delivered an hour earlier**, so it is not
new and not the rug's doing - the phase samples 6 seeds and had simply
never landed on one.

`losSanity` now excuses a blocking square that stands beside a visible
square you could walk on, and says how many it excused (38 over the LOS
phase).  The allowance is deliberately looser than the rule that draws
it - any of the eight neighbours, at any distance - so it stays a check
on what may be seen rather than a copy of the code that decides it.  It
still bites: a light reaching three squares too far fails it.

## The rug, third pass: a middle row, and no more two-by-twos (23 Aug 2026)

### One new tile, for the middle row

A rug woven an odd number of tiles tall has a middle row with no twin to
fold against, the same problem the spine solved for odd widths.
`rug_c1` is painted for it - taken from Gulli's 4x5 picture, where it is
the only new tile - and goes in the inner columns of that row.  The
border column of the middle row is the design's own `rug_20`, and a
three-wide rug has its spine there instead.

Sizes with a middle row now use it: 2x3, 2x5, 4x5 (`rug_c1`), and the
three-wide ones keep `rug_1c` down the spine.  3x3's middle row took the
field tile on its border column before and now takes `rug_20`, matching
the 4x5.

`rugCutTableFaults()` guards it the way it guards the spine: a `c` row
tile belongs in the middle row of an odd-height rug and nowhere else.
Unlike the spine that rule is one-directional - the middle row is not
made only of `c` tiles - so it is written that way rather than pretending
otherwise.  Proved on `rug_c1` moved into 4x6's field row: 1 fault.

His picture and the game's 4x5 differ in 8 pixels, all on the fold
between the two middle columns: rows 1 and 3 of his copy are not quite
mirrored across it.  The game draws the tile and its exact mirror.

### Nothing smaller than two by three

`RUG_MIN_LONG` is 3.  A room with only two squares to spare both ways
gets no rug at all; a rug that comes out two by two is let out along
whichever wall has the room for it.  The per-floor check calls a 2x2 rug
'smaller than anything woven' - proved by putting `'2x2'` back in the
table: 4 faults, from the table and from the floors both.

Rugs on the floor went from 15.0 squares each to 21.2, and from 52 floors
in 96 to 67 - the minimum size pushes small rooms into laying a real rug
rather than a coaster.

### The save-slot check was reading a dead run's sight

Moving the rug dice again turned `test_rules.js` red: 'the slots
overwrote one another'.  It was not the slots.  The three runs it saves
are walked 200 turns and one of them now dies on turn 173; once you are
dead the game stops working out what you can see, so the sight flags
stand still at the moment of death - and loading the run back works them
out afresh.  Eight squares of firelight appeared, the print differed, and
the check blamed the slots.

Traced by hand: `runPrint` hashes `L.flags`, the flags differed by
`F_VIS|F_SEEN` on eight squares round a fire, `computeVis` proved
idempotent, and the difference vanished when the dead turn was excluded -
`tickT` and the game's own turn both end `if (!G.dead) computeVis()`.

The check now saves only a run that is still alive, taking another seed
if one dies, and says why in the comment.  It still bites: with
`saveInto` writing every slot to slot one, it fails.

## Stones, hints, selectable text, mushrooms and a way to the cellar (23 Aug 2026)

### Stones are a little more common

Not through the item table - a stone's weight there barely reaches the
floor, measured at 0.78 to 0.79 stones a floor over 500 floors when the
weight was raised by half.  Ammunition is scattered on purpose instead
(`scatterAmmo`), and that is where the lever is: `AMMO_ARROW_PCT` (the
share of those piles that are arrows) went 48 to 44, and a stone pile
went from one or two to one to three.  **0.78 stones a floor to 1.11**,
with arrows barely touched (0.41 to 0.37).

The soak's pile check asked for "no more than 2", a number that was true
of the old table.  It now asks the table what a handful is and keeps the
rule that made it small - a cap of 4 fails on its own.

### The hints

A period instead of the dash in the studying hint, the long sword hint in
Gulli's words, the rug hint gone, and three new ones: T for the log, the
keys worth learning, and the ESC menu's help screen.  `test_render` now
insists some hint names T and some hint names ?.

### Words can be picked out of a dialog

The game is a picture: there is no text on the page for the browser to
select.  So the drawing writes down what it drew - every run of text in
`TEXTS`, every box in `BOXES`, the same bargain `HITS` already made for
the things you can click - and a drag over a dialog is worked out from
those records: which run and which letter each end of the drag is over,
everything between them in reading order, a band painted behind them and
the words drawn again on top.  Ctrl+C (or the Mac's) copies.

Two things made it fiddly and are worth knowing:

- a line of a hint is drawn **a letter at a time** (each one has to be
  able to come out red), so a "run" is as often one character as a
  sentence.  What separates two runs in the copied text is therefore the
  gap between them, not the runs: none at all and they are one word, a
  step down the screen and they are two lines, anything else is a space.
- a drag inside a dialog used to push the map about.  It no longer does,
  and neither does a drag anywhere else while a dialog is up.

`part4_render.js` holds it all: `dialogUp()`, `selRuns/selSegments/
selPoint/selText`, `drawSelection`, `selCopy`.  Proved by ripping the
selection out of `onMouseMove`: 4 faults, including the map moving again.

### Five mushrooms

One of them is only food.  The others are poison, invisibility, a
berserker's strength and speed, and immunity to fire - `MUSH_TURNS` (20)
each.  Which colour is which is dealt afresh every run the way a potion's
is: `MUSH_LOOKS` are the five sprites, `APPEAR.mush` deals them,
`KNOWN.mush` remembers what eating one taught you, and an unknown one is
"a blue mushroom" until then.

`P.rage` lends `MUSH_RAGE_STR` through `strBonus()` - a count of turns
rather than a change to the figure, so nothing has to be put back when it
wears off - and `P.fireproof` is caught in `resistPlayer`, which is the
one funnel every kind of damage goes through.  `mushroomsOK()` in the
harness checks all of it, effects included, and that fire still hurts
without the ember.

Four new sprites (`mush_b/y/p/g`); the painted red one is the fifth look.

### What you drop stays dropped

Walking over your own cache used to empty it back into your pack.  A
thing you put down is marked `laid` and waits for ENTER, exactly the way
a chest you have already opened does - `laidHere()` and `takeLaid()` in
`part3_actions.js`, and `'take'` in the ENTER choice list.  Gear swapped
off you on the floor is marked the same way.

### A cellar in the playtest build

`A CELLAR` is a third choice in the playtest menu, and it asks which
sort: a trapdoor in the open, or one under a rug.  Either way it finds a
floor that has one, marks it found, and stands you beside it.  40 goes at
each found one every time.

## Five probes corrected, and why

Changing how often a stone turns up moves the dice, and five checks were
leaning on where they used to fall.  None of them was loosened; each was
asking its question of a floor that no longer answered it.

- **the dragon's breath** gave up if the player did not happen to start
  with four clear squares in front of him - `straightLine4(1)` goes and
  stands somewhere that has.
- **the web spinner** was stepping onto a trap and being frozen by it,
  which is not the same as being stuck in web.  The probe now picks a
  square with no trap on it.
- **the wand of lightning** measured the clear squares in a row and
  expected the current to reach exactly that many.  A row that ends at a
  doorway is one longer: the bolt stops **on** the door, which is lit by
  it.  And the same probe counted bolt sprites anywhere on the screen -
  a thunder discharge round your own feet is drawn with that sprite and
  stands on its own squares, so the count is now taken along the path.
- **the hole** and **the light of a fire** both wanted a patch of open
  lit flagstones in front of the player, and this floor had none in
  sight - bigger rugs cover more of it now.  Both lay their own ground
  (`clearPatch`) and put it back afterwards.
- **dim corners** wanted a remembered corner to be drawn from the faded
  sheet and waited for a 60-frame walk to wander past one.  It now puts a
  wall in a patch of remembered floor and looks at that.  Proved still to
  bite by drawing those patches from the plain sheet: it fails.

## Bags, a notice box, chest suppers and a current (23 Aug 2026)

### One box for anything that stops you

`openNote(line)` puts a line up in front of whatever it interrupted and
anything at all puts it away.  It remembers what it interrupted, so a
pouch that will not hold any more says so over the pack and hands the
pack back afterwards - `G.note.back`, and `drawFrame` draws that mode
first and the notice over the top of it.  The log is still where the game
talks to you; this is for the things that stop what you were doing, which
have to be seen to have happened.

Three of them so far: "The pouch is full.", "The pack is full.", "The
chest is full." (which was a line in the log before), and "Welcome to
level X!".

### Pack and pouch, both ways

Every item in the pack offers **Put in pouch** when you are carrying one,
and every item in the pouch offers **Put in pack**.  A pouch is not
offered a place inside itself.

`takeFromBox` needed a second thought: it used `addItem`, and `addItem`
puts a thing in the first place it will go - which, when the pack is
full, is a pouch.  Taking something out of the pouch put it straight back
in, and looked like nothing had happened.  Out of a **pouch** it is now
the pack or nowhere; out of a **chest** it is still anywhere it fits.

### Welcome to level X

`checkLevelUp` queues `G.levelUp` and the box goes up when the turn has
finished playing out - the same place the coming-of-age choice waits for.
If a perk choice is queued, no box: that screen says the same thing and
then asks you something.

### Drinking out of a chest

The chest menu offered only Take.  A flask you meant to drink and a meal
you meant to eat now say so there, along with Inspect.  `removeItem`
already looks inside chests, so what is drunk out of one leaves it.

### A shocking stone

The sixth runed stone.  On dry ground it jolts the square it lands on; in
water the whole pool goes up - `shockCells` walks the water body, which
is the same walk the thunder discharge uses - and everything standing in
that pool is jolted, **you included** if you are wading in it.  A second
pool a step away feels nothing.  `SHOCK_DAMAGE` is 3-6.

The spark is stamped on every square of the pool at once, which with one
little sprite reads as wallpaper.  Each square turns its own by an eighth
of a circle or two, dealt by the square's own coordinates - so it is
different from its neighbour's and the same every frame, which matters:
a spark that re-rolls each frame is a strobe.  `sprSpin()` in
`part4_render.js` turns a sprite by any angle at all; a quarter circle
lands on the pixel grid and an eighth does not, which for a spark is the
point of it.

### What proves it

- `shockStoneOK()`: dry ground covers one square, a pool covers all of
  it, the pool next door none of it, your own legs if you are in it and
  not if you are not.  Proved on a stone that spreads on dry ground (9
  squares), and on one that stops at the square it lands on (4 faults).
- "bags and notices" in `test_render`: the pack and the pouch pass things
  both ways, a full one puts a box up **and the box is drawn**, any key
  hands the pack back, a chest offers Drink and the flask leaves the
  chest, and a level gained is held up unless a perk choice is waiting.
  Proved on a build with the pouch option and the level notice ripped
  out: 3 faults.
- "a current in water": at least eight sparks over the pool, three or
  more angles between them, and the same angles next frame.  Proved on
  sparks all drawn the right way up: 1 angle.

## Picking up what you stepped over, and firelight that is not a band (23 Aug 2026)

### ENTER takes what is under you

Walking over something with a full pack leaves it where it is and says
so.  Until now nothing would pick it up afterwards but walking off the
square and back on with room - and even then only by accident.

`takeableHere()` is the general form of last round's `laidHere()`:
anything lying under you that has not been picked up, however it came to
be there - your own cache, or something you stepped over.  Gold is not
one of them: it goes in your purse, and a purse is never full.  ENTER
takes it (`'take'` in the underfoot list, ahead of wearing it where it
lies, which is only the answer while there is still no room), and with no
room it puts the "The pack is full." box up rather than doing nothing.

And the game offers it: `offerUnderfoot()` runs when the pack closes, so
emptying a slot and closing the pack says *"An oaken staff here. Press
ENTER to pick it up."*  Otherwise you would have to leave the square and
come back to be told again.

### Firelight varies from square to square

Every square a jet of flame or a current lit came out at exactly the same
brightness, which reads as a painted band rather than as fire.  `glowPut`
now takes a `vary` flag, and the light on a square is multiplied by
`glowVary(x, y)`: a hash of where the square is, so it differs from its
neighbour and is **the same every frame** - light that re-rolls each
frame is a flicker, and a whole room flickering is a strobe.

`GLOW_VARY` is 0.2, and it only ever takes light away.  Two-sided
variation was tried first and was worse: full is a ceiling, so half the
squares were flattened against it and came out identical after all.
Measured along an eight-square jet with the row beside it: 16 squares,
0.81 to 1.00, ten distinct brightnesses.  A lamp is left alone - a steady
light is steady - so the ring of light round a glowing blade is exactly
as it was.

### What proves it

- The three probes that compared light against an exact figure now
  compare it against the band it has to land in, **and** insist that no
  fire lights every square it touches to fewer than three brightnesses -
  a probe that only widened the tolerance would pass just as happily with
  the variation taken out again.  Proved by taking it out: 4 faults.
- The burning stone's second turn is checked as a ratio of its first as
  well as against the band, since both carry the same square's own
  variation.
- "bags and notices" grew a full-pack case: something stepped over stays
  on the floor, closing the pack after making room says so, ENTER takes
  it rather than starting to shoot, and closing the pack over bare floor
  says nothing at all.  Proved with the offer and the general underfoot
  rule removed: 3 faults.

### "something sleeps in it"

The EFFECTS list is what is going on with *you*, and one of its lines
read "something sleeps in it" - naming neither the thing nor what sleeps,
and printed twice over, word for word, when two of the things you were
wearing had an enchantment you had not read yet.  It now says
`sleeping rune: long sword`, which is the form the cursed line already
uses (`cursed: <item>`) and the word the help screen uses for them.
Checked in `test_render`: two unread enchantments give two lines, they
are not the same line, each names what it is in, and each fits the
column.  The old wording fails both of the first two.

### A rug with a door in the floor under it

A trapdoor is a **tile**, and only the plain-flagstone case drew what was
lying on a square - so a rug with a trapdoor under it had a bare stone in
the middle of the pattern, which is exactly what a rug laid over one must
not look like.  The TRAPDOOR case in `drawMapAt` now draws its decor the
same way FLOOR does, and the door itself still does not show through a
rug over it.  "a rug over a trapdoor" in `test_render` puts a rug square
over a hidden door and insists a rug tile is drawn there, that the door
is not, and that a door with nothing over it still is.  Without the fix:
one fault.

### Every fire varies, on its own flame's beat

The variation reached beams and left ordinary fire looking flat, for two
reasons worth writing down.

**It was dealt per contribution, not per square.**  A square in the
middle of a burning row is lit by its own fire and by both its
neighbours, and the brightest wins - so every square was the best of
three or four draws and the whole patch sat against the ceiling.
Measured over a patch of thirty burning squares: the average square came
out at 0.96 of full where the rule allows down to 0.80.  `glowPut` now
records which source won and what it was worth, and `glowShades()` deals
each square its own share once over the finished map.  Same patch: 0.89.

**And it was dealt once and left there.**  A flame swaps between its two
tiles every `FIRE_ANIM_MS`, and the light it throws is now dealt again on
exactly that beat - `flameFrame(x, y)` is the counter, and the drawing
picks the tile with the same call, so the two cannot drift apart.  A
light that changed while the flame stood still would be a loose
connection; one that stood still while the flame changed would be the
light of something that is not there.  One burning square over 700ms:
0.966 0.966 0.801 0.852 0.844 0.993 0.895.

`fireLightOK()` checks all of it: a row of fires lights itself to several
brightnesses, each inside the band, the average over a patch sits in the
**middle** of what the rule allows rather than at the top of it, the
light on a square is exactly what its own flame's frame deals, it does
not move while the frame does not, and a beam varies by more than a fire
does.  Proved on the two ways it was wrong before: dealing the variation
per contribution gives 0.962 and fails; not tying it to the flame's
counter fails the frame check.

### The light of a beam varies too

The variation was there but nobody could see it.  A beam's light is
halved to begin with - it is a light in the air, not a fire on the floor
- so the same 20% of it came to about two points of alpha.  A beam now
has its own share (`GLOW_VARY_BEAM` 0.45) and varies over time as well,
a step every `GLOW_BEAM_MS`: the current is already redrawn crackling
every few frames, and its light crackling with it is the same thing said
twice.  Measured in a dark room: the squares a bolt lights are drawn at
0.68 to 0.77 against an unlit 0.55, so half the lift now varies.
`glowVary` takes an amount and a phase; the probe checks the beam's own
band, the spread it achieves, and the rule behind the number - a beam has
to vary by more than a fire, whose light is twice as strong.  Setting it
back to a fire's share fails that.

## Three tiles for fire, a current that spreads, four save slots and a roll of the ten best (24 Aug 2026)

Four things asked for at once.

### A third fire tile and a second spark

`FIRE_TILES = ['fire_wall', 'flame', 'flame2']` and `SHOCK_TILES =
['bolt', 'bolt2']` in part1, with `fireSprite(x, y)` in part2 as the one
place that turns a square and the clock into a tile.  Every fire in the
game goes through it now: a burning cloud, a lit fuse, a creature
alight, the ring of a fire shield.  Two tiles read as a switch, three
read as movement, which is the whole reason for asking.

Two bugs came out of it, both of them the kind that only show up when
the number of tiles stops being two.

**The count went negative.**  `flameFrame` was
`((Date.now() / FIRE_ANIM_MS + x * 3 + y * 5) | 0)`.  `|0` is ToInt32:
everything above the thirty-second bit thrown away, the rest read as
signed.  The clock divided by 120 passes two thousand million partway
through **1 March 2027** and stays past it until **30 April 2035** - so
for eight years that count is negative.  It did no harm while the tile
was picked with `frame ? a : b`, because a negative number is truthy.
As an index into a list of three it is nothing at all, and fire would
have drawn as bare floor for eight years, starting six months from now.
Now `Math.floor`, which is exact to nine thousand years.  The probe
winds the clock to 2027, 2031 and 2034 and asks the fire to draw itself.

**The offsets did nothing.**  `x * 3` is no offset at all on a cycle of
three, so a whole row of fire showed the same tile as one another and a
wall of flame came out in horizontal stripes.  Seven and five are
coprime with two, three and four alike; the probe checks that a row and
a column of fire each show all three tiles at once.

### A current that spreads, and blinks

`shockOrder(cells, sx, sy)` walks the water breadth-first from the
square the current went in at and stamps every square with how many
steps of water away it is - round a rock the way the water goes, not as
the crow flies.  `shockSplash` builds the whole thing once when the
current is let loose; `shockLit(sp, i, now)` answers whether a square is
drawn this instant, and it has to pass two tests: the front has reached
it, and its turn has come round in the blink.

The blink is a three-beat cycle offset by a hash of the square, so a
third of the reached squares are lit at any moment, a different third
every 70ms, and the same third for every frame inside one beat - it
crackles rather than fizzes.  A current on **one** square does not blink
at all; two frames of nothing out of three is not a spark, it is a
missing sprite.

The light follows the sparks: a square the front has not reached, or one
blinked off this beat, throws none.  And the splash outlives the usual
flash by however long the front takes to cross - `shockLife` - so a lake
is not gone before its far side has lit.

Measured on the real build: a 24-square pool, the far corner nine steps
from where the current went in, 33% of it lit at a time over four angles
and both tiles.

`shockSprite` had the same ToInt32 bug and was fixed the same way; it
now counts from the splash's own age rather than from the epoch.

### Four save slots, chosen once

- `SAVE_SLOTS = 4`.
- **START** opens the slot list (`what: 'new'`) over the **title
  screen**, not over the boot dungeon.  An empty slot starts at once; a
  full one warns and takes the same key again to write over it.
- The run belongs to that slot from its first turn and cannot leave it.
  **LOAD is gone from the pause menu** - loading another slot mid-run
  would leave two runs sharing one, with the autosave writing to
  whichever it had last been told about.  LOAD stays on the title menu,
  which is where resuming belongs.
- `autosave()` at the very end of `tick`, every `AUTOSAVE_EVERY` (2)
  turns.  At the end, because a save taken mid-turn comes back with half
  a turn played.
- **SAVE AND QUIT** writes `G.slot` and quits.  No question - it was
  answered at START.
- **RESTART** keeps the slot: `newGame` reads `G.slot` before `freshG`
  wipes it.
- Dying, or winning, frees the slot (`clearSlot`).  A save that can only
  ever load you back onto your own gravestone is a slot you cannot use.

### The roll of the ten best

The table lives in a bin on jsonbin.io.  One config block at the top of
part1 decides how it is reached:

    var HS_BIN   = '6a8c44f9da38895dfe0a98c0';
    var HS_KEY   = '';   // jsonbin Access Key: this bin, read+update only
    var HS_PROXY = '';   // if set, posts go here and the key stays server-side

**A page served as one HTML file cannot keep a secret.**  Whatever key
is written there is readable by anyone who opens the file.  So:

- `HS_KEY` must be an **Access** Key restricted to this one bin with read
  and update rights.  The worst anyone can then do is rewrite the
  highscore table, and it can be rotated from the dashboard.  A Master
  Key must never go there: it opens the whole account.
- `HS_PROXY` is the way to have no key in the page at all - a small
  function of your own that holds the key and does the writing.  If it is
  set it is used and `HS_KEY` is ignored.
- With neither set the game still reads the table if the bin is public,
  and keeps new scores on the machine they were made on.

**The bin is private as of writing.**  An unauthenticated read of
`https://api.jsonbin.io/v3/b/6a8c44f9da38895dfe0a98c0/latest` returns
401, so the game cannot even read it yet.  Either set the bin to Public
(then reads need no key at all and only writes need one) or put a
read+update Access Key in `HS_KEY`.

The rules of the table are kept apart from the fetching so they can be
tested without a network: `hsClean` (sort, trim to ten, and treat every
name as somebody else's typing - letters, digits and spaces, cut to
twelve), `hsQualifies` (a full table takes only what **beats** its last
row; equal is not better, the rogue who got there first keeps the
place), `hsWith`, `hsPlace`.  `hsFetch` and `hsSubmit` both hand back
through a callback and neither ever fails outwardly - a table that could
not be fetched is the local one, a score that could not be sent is still
written down here.  A game is not the place to be told that somebody
else's website is down.

The screen (`mode: 'score'`) stands between the gravestone and the next
run.  If the run belongs on the roll there is a row with a cursor in it
waiting for a name; otherwise it is just the table.  It is also on the
title menu as HIGHSCORE, where it never asks for a name - the rogue on
the splash has not taken a step.

Four lines under the table, for four different things, because they are
four different things: `sent to the roll`, `sending...`, `the roll could
not be reached`, `no roll set up: kept on this machine`.  The last one is
the game admitting it did not manage to reach the bin, not the way it is
supposed to work.

One bug worth remembering: once the score has been sent, `G.hs.list`
**is** the table with the run in it.  Drawing it with `hsWith` again put
the rogue on the roll twice.  The probe counts what was drawn, off
`TEXTS`, not what is in the table behind it.

### Sprites

`flame2` and `bolt2` added to `gen_atlas.py`, placed in `effects` and
`arms`.  Both are placeholders in the palettes of the tiles beside them -
`flame2` a middling flame leaning, `bolt2` a blue crackle arranged
differently from the first.  `spritesheet.png` came down from the device
first (Gulli had touched up `gas`), then
`cp atlas.json atlas_layout_before.json`, `gen_atlas.py`,
`migrate_sheet.py` - `graphics altered: none`, 193 carried, 2 newly
drawn, sheet still 128x146.

    flame  row 11 col 0   flame2 row 11 col 1
    bolt   row  7 col 10  bolt2  row  7 col 11

### Probes, and what each of them catches

Every one was proved to fail on a copy of the build with that one thing
put back:

| probe | reverted | says |
|---|---|---|
| fire in 2027 | `|0` counter | the flame count went negative (-2081469008) |
| fire in 2027 | `x * 3` offset | a row of fire shows only 1 of its 3 tiles at a time |
| a current in water | splash without dist/blink | the whole pool lit at once: 24 of 24 |
| a current in water | one spark tile | only 1 of the 2 spark tiles were used |
| save and quit | LOAD back on pause | LOAD is still on the pause menu |
| save and quit | `SAVE_SLOTS = 3` | there are 3 slots, not four |
| the autosave | save every turn | saved itself on every turn, not every other |
| the autosave | no `clearSlot` on death | a dead run was left sitting in its slot |
| the roll | `hsWith` when already sent | the name is drawn 2 times on the roll |
| the ten best | `>=` in `hsQualifies` | a run equal to the last row got in |
| the ten best | name not scrubbed | a name kept its brackets |

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

## Round 11 - fire at range, a stopped clock, thrown arms, a shake

**Fire and lightning are seen wherever there is a clear line.**  Everything
else in the dungeon is drawn only where the lamp reaches; fire is its own
light.  `blazeSeen(x,y)` in part2 is the single rule (`F_VIS ||
sightClear`), and it is what `glowPut` already meant - now it is written
once and asked by every place that draws a flame or a current: lit fuses,
fire clouds, the blast and zap splashes, and a burning creature you
cannot otherwise see (drawn as the flame alone, with nothing behind it).
Fumes and frost keep the old rule; they have no light of their own.  It
deliberately does NOT cache: a blast opens walls in the middle of its own
animation, so an answer kept from the start of the turn is a lie by the
time the flames are drawn.

**A dialog box stops the world.**  Every world timestamp now comes from
`nowMs()` - the wall clock less however long has been spent behind a box -
and `worldPaused()` is true for the eleven modes in `PAUSE_MODES`.  A run
that has ENDED (dying, dead, win, score, title, choose) keeps the wall
clock or the stone never rises.  UI chrome - blinking cursors, panel
slides, button flashes - deliberately keeps `Date.now()`; there is a
keep-list in the round-11 conversion and the rule is written above
`nowMs`.  `underBox` exists because a notice draws its own backdrop by
putting the mode back to what was underneath and re-entering `drawFrame`:
for that one frame it looked exactly like a game with no box on it.

`nowMs` guards against the clock jumping backwards, because the render
suite drives probes on made-up clocks.  Any probe that installs one also
does `ctx.pauseFrom = ctx.pauseOwed = 0`, and probes that stamp world
timestamps use `ctx.nowMs()` rather than `Date.now()`.

**Thrown weapons wear out.**  `THROWN_BREAK_PCT = 20`, `WELL_MADE_PCT =
25`.  `it.make` is 1 for well made, -1 for worn, absent for ordinary;
`makeWord` puts it in the name, `rollMake` deals it out where a hurl
weapon enters the world, `hurlWear` decides a landing (0 whole, 1 worn,
2 gone).  One roll per throw, taken before the hit is known, so a hit, a
miss and a lob at bare floor all wear it the same.

**A barrel shakes the view** for `SHAKE_MS` 300ms up to `SHAKE_AMP` 3px,
falling away as it goes, seeded off the square rather than off the dice.
It goes through the same door as the map slide - clipped, translated -
so the panel does not move with it.  It is on the world clock, so a box
freezes it mid-shake.

**`BEAT_PLAYER` is 360ms**, not the full `BEAT` of 500.  It is the one gap
you sit through on every single step.  It may not go below
`WALK_ANIM_MS`, or the answer treads on the end of your own step; the
sound suite now asks for exactly that relationship and no longer demands
one number for all four beats.

**The identify game.**  `numbersKnown(it)` is now `it.known` alone.
Wielding or wearing tells you one thing - whether it is cursed, because a
cursed thing will not come off - and `curseKnown`/`seeCurse` remember
that for good.  Plusses, properties and enchantments come from studying
it, an antiquarian's eye, or a scroll.  Four probes encoded the old rule
and were rewritten, not loosened.

**Also:** one line per kill (the executioner said "You finish it off" and
then let `killMonster` say "You slay it", both stamped 'executed'); the
look now reaches the whole floor (`panMaxX/panMaxY` off `MAP_W`/`MAP_H`
instead of a flat `PAN_MAX = 40`, which was narrower than a large map);
`'note'` joined `dialogUp()` so a drag over a notice selects its words.

### Probes that were failing on the dice, not on the game

The wear roll shifts the item stream, which shifted four probes.  Each
was measured and pinned rather than loosened:

- **witch stones** asked only that SOME stone was left lying about.  She
  lands about four throws in five, so ten that all land is about one seed
  in seven.  It now counts the misses - off your own hit points, because
  the line she says is trimmed to fit the panel - and asks that exactly
  those are on the floor.
- **a second step** placed the creature on a walkable square three away
  without checking it could be seen.  The gap between a quick creature's
  two steps is only inserted when the step is watched, so an unseen spot
  made both steps share one instant.
- **lightning** measured its lane with `walkable()`.  A door is walkable
  and stops a shot dead.  It uses `blocksShot()` now, and measures the
  span against the part of the path that is on the screen - a wand fired
  down a long hall outruns the view.
- **the shake probe** (new) split panel from map by pixel column, and the
  fake canvas only pretends to clip, so a shaken map tile slid into the
  panel's column.  The panel is read by its words instead.
