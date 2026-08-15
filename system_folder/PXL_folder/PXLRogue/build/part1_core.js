/* ============================================================ ROGUE-8
   Part 1 : constants, RNG, data tables, dungeon generation.
   The whole game renders into a 230x128 pixel buffer, nothing else.
   ============================================================ */
'use strict';

/* ---------------------------------------------------------- constants */
var TS = 8, SW = 230, SH = 128;
/* The left hand panel keeps the text and your stats where they stay put;
   the map fills everything to the right of it. */
var PANEL_W = 78;
var VIEW_W = 19, VIEW_H = 16, VIEW_PX = PANEL_W, VIEW_PY = 0;
/* Hold SHIFT and the panel gets out of the way so you can see the whole
   floor.  It leaves quickly - long enough to read as a movement, short
   enough that you are not waiting on it. */
var PAN_SLIDE = 140;               /* milliseconds, out and back */
var PAN_MAX = 40;                  /* how far you may push the view */
var MAP_W = 64, MAP_H = 32;          /* the floor you are on; both vary */
/* A floor is a little larger than it was: the rooms grew with it, so the
   number of chambers is much the same and each one has more room in it. */
var MAP_MIN_W = 50, MAP_MAX_W = 86;
var MAP_MIN_H = 29, MAP_MAX_H = 44;
function setDims(w, h) { MAP_W = w; MAP_H = h; }
var MAX_DEPTH = 26;
var LIT_RADIUS = 9, TORCH_RADIUS = 4;
/* Pitch dark: rooms and stretches of hallway nobody has lit for a very
   long time.  In one you can see the square you are standing on and the
   ones you could reach out and touch, and nothing else - and so can
   everything else down there, bar the few things at home in the dark. */
var DARK_RADIUS = 1;
var DARK_ROOM_PCT = 16;            /* how many rooms are pitch dark */
var DARK_HALL_PCT = 14;            /* and how often a hallway goes dark */
var DARK_HALL_RUN = 12;            /* how far a dark stretch of it runs */
var DARK_MIN_DEPTH = 2;            /* not on the first floor */
/* How often a way between two spaces is a plain opening rather than a
   door, and how far the light of a lit room reaches through one into a
   dark one.  A door stops light; a hole in the wall does not. */
var ARCH_PCT = 32;
var SPILL_RANGE = 3;
/* Seen with night eyes, a dark room is all there to be read - but it is
   still a dark room, and it should look like one. */
var NIGHT_SHADE = 0.55;
/* Three stages of light.  Close to you it is as bright as it gets; out
   at the edge of what you can see it is dimmer, so you can tell where
   your sight is about to run out; and beyond that is what you remember
   of the floor, which shows you the map and none of what is on it.

   NEAR is how many squares the bright stage reaches. */
var LIGHT_NEAR = 3, LIGHT_EDGE = 0.58;

/* Running.  This is about a fight, not about walking: crossing an empty
   floor at your own pace is not running, however far you go.  With
   something awake and hostile close by, five steps in a row without
   striking anything means you are moving faster than you are looking,
   and after that there is a chance of going over.  Being quick on your
   feet is most of what stops it, and being frightened is most of what
   causes it. */
var BATTLE_NEAR = 7;               /* how close a fight has to be to count */
var RUN_AFTER = 5;
var STUMBLE_PCT = 11;              /* the base chance once you are running */
var STUMBLE_DEX = 1.3;             /* taken off per point of dexterity over ten */
var STUMBLE_FLOOR = 2;             /* and it never drops below this */
var STUMBLE_SCARED = 12;           /* a creature in a panic, on top of the base */

var ROCK = 0, WALL = 1, FLOOR = 2, CORR = 3, DOOR = 4, STAIR = 5, SDOOR = 6,
    LOCKED = 7, WATER = 8, ICEWALL = 9, FIREWALL = 10, HOLY = 11, HOLE = 12,
    STAIR_UP = 13,
    /* Iron bars: you can see straight through them and you can never get
       past them.  Nothing breaks them - not even dynamite. */
    BARS = 14,
    /* A bridge laid over water or over a gap in the floor.  You walk it
       like any other square; what it spans is remembered in L.under so
       the water still shows at its sides. */
    BRIDGE = 15;

var MATS = ['wood', 'bronze', 'iron', 'silver', 'gold', 'crystal'];

var F_SEEN = 1, F_VIS = 2;

/* orthogonal only - no diagonals anywhere in this game */
var DIR4 = [[0, -1], [0, 1], [-1, 0], [1, 0]];
/* the diagonals as well, for things that billow rather than walk */
var DIR8 = [[0, -1], [0, 1], [-1, 0], [1, 0],
            [-1, -1], [1, -1], [-1, 1], [1, 1]];
var DIAG4 = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

/* ---------------------------------------------------------- rng */
var _seed = 1;
function srand(s) { _seed = (s >>> 0) || 1; }
function rnd(n) {
  _seed = (Math.imul(_seed, 1664525) + 1013904223) >>> 0;
  return n <= 0 ? 0 : (_seed >>> 8) % n;
}
function roll(n, s) { var t = 0; for (var i = 0; i < n; i++) t += rnd(s) + 1; return t; }
function pick(a) { return a[rnd(a.length)]; }
function chance(p) { return rnd(100) < p; }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

/* ---------------------------------------------------------- str tables */
function strPlus(s) {
  if (s < 8) return s - 7;
  if (s < 17) return 0;
  if (s < 21) return 1;
  if (s < 31) return 2;
  return 3;
}
function addDam(s) {
  if (s < 8) return s - 7;
  if (s < 16) return 0;
  if (s < 18) return 1;
  if (s < 19) return 2;
  if (s < 21) return 3;
  if (s < 22) return 4;
  if (s < 31) return 5;
  return 6;
}
/* Experience needed for the next level.  Tuned against what clearing one
   floor actually pays, so you gain roughly a level per floor and never
   coast: floor -12 monsters expect a level 12 rogue. */
/* Experience needed for each level.  Derived from what the floors
   actually pay out, measured over two hundred generated dungeons per
   floor, and set at 85% of the running total - so keeping up means
   fighting most of what you meet, and clearing everything puts you a
   little ahead.  Re-derive these whenever monster experience changes. */
/* ------------------------------------------------------------- perks
   What you pick instead of hit points when you come of age.  There are
   no ranks: you either have a perk or you do not, which keeps each one a
   single flat rule with one place in the code that reads it.

   The choice comes at these levels.  The gaps widen, and the next one
   after 16 would be 22 - past the cap - so a maximal run makes five of
   these choices and an ordinary one makes three or four.  That is a
   tight budget, so every perk has to be worth a whole level. */
/* The one pouch in the game turns up on one of these floors - late
   enough that the pack has been tight, early enough to be worth having. */
var POUCH_FLOOR_MIN = 3, POUCH_FLOOR_MAX = 5;

var PERK_LEVELS = [2, 4, 7, 11, 16];
/* how long he will keep making for a room before settling for where he
   has got to */
var BOLT_PATIENCE = 120;
var PERK_OFFER = 3;          /* how many you are shown to choose between */
/* How long after the last blow the screen waits before it appears.  The
   creature you just killed is still on the tombstone list, the log has
   not caught up, and a full-screen menu on top of that reads as the game
   glitching rather than as a reward. */
var PERK_PAUSE = 500;
var PERK_HP = 4;             /* what the other option is worth */

/* Each perk says its piece twice.  txt is the long line, shown on the
   screen where you choose it and there is room to explain.  s is the
   short one for the pack, where the column is 34 characters wide and
   anything longer simply runs off the edge. */
var PERKS = [
  /* --- moving unseen ------------------------------------------------ */
  { id: 'silent',  n: 'Silent feet',  txt: 'you move much more quietly' , s: 'quieter afoot' },
  { id: 'grace',   n: "Cat's grace",  txt: 'you slip aside more often',
    s: 'you dodge more' },
  { id: 'backstab',n: 'Backstabber',  txt: 'a strike from the dark cuts deep' , s: 'sneak hits harder' },
  /* --- the elements ------------------------------------------------- */
  { id: 'firewield', n: 'Fire wielder', txt: 'your fires burn hotter' , s: 'hotter fires' },
  { id: 'ember',     n: 'Ember skin',   txt: 'flame does you half its harm' , s: 'half fire damage' },
  { id: 'frost',     n: 'Frostborn',    txt: 'cold does you half its harm' , s: 'half cold damage' },
  { id: 'storm',     n: 'Storm touched',txt: 'your lightning bites harder' , s: 'sharper lightning' },
  { id: 'ironblood', n: 'Ironblood',    txt: 'poison can barely touch you' , s: 'half poison damage' },
  /* --- fighting ----------------------------------------------------- */
  { id: 'heavyhand', n: 'Heavy hand',   txt: 'every blow of yours lands harder' , s: '+2 melee damage' },
  { id: 'riposte',   n: 'Riposte',      txt: 'a miss against you invites one back' , s: 'you counter a miss' },
  { id: 'marksman',  n: 'Marksman',     txt: 'you throw and shoot further and harder' , s: 'better at range' },
  { id: 'executioner', n: 'Executioner',txt: 'a hurt thing may simply drop' , s: 'can kill by hurting' },
  /* --- the dungeon itself ------------------------------------------- */
  { id: 'keeneye',   n: 'Keen eye',     txt: 'little stays hidden from you' , s: 'you find hidden things' },
  { id: 'antiquary', n: 'Antiquarian',  txt: 'you read an object at a glance' , s: 'you read gear by eye' },
  { id: 'scavenger', n: 'Scavenger',    txt: 'you find more coin, and lose fewer stones' , s: 'more coin, fewer losses' },
  { id: 'abstemious',n: 'Abstemious',   txt: 'a ration carries you further' , s: 'food lasts 30% longer' },
  { id: 'mender',    n: 'Mender', txt: 'your wounds close twice as fast', s: 'you mend twice as fast' },
  { id: 'riverborn', n: 'Riverborn',    txt: 'in water you act twice a turn' , s: '2x speed in water' },
  { id: 'dexterous', n: 'Dexterous',    txt: 'magic items last longer in your hands', s: 'magic items last longer' },
  { id: 'nightstalker', n: 'Night stalker', txt: 'the dark is no darker than the light to you',
    s: 'you see in the dark' }
];
var PERK_BY_ID = {};
(function () { for (var i = 0; i < PERKS.length; i++) PERK_BY_ID[PERKS[i].id] = PERKS[i]; })();

/* --- what each one is worth ---------------------------------------- */
var PERK_STEALTH = 20, PERK_DODGE = 12, PERK_BACKSTAB = 5;
var PERK_ELEM_MULT = 1.6;          /* fire wielder, storm touched */
var PERK_RESIST = 0.5;             /* ember skin, frostborn, ironblood */
var PERK_MELEE_DAM = 2, PERK_SHOT_DAM = 4, PERK_SHOT_RANGE = 1;
var PERK_RIPOSTE_PCT = 20, PERK_EXECUTE_PCT = 12, PERK_EXECUTE_FRAC = 4;
var PERK_SEARCH = 35, PERK_APPRAISE = 40;
var PERK_GOLD_MULT = 1.5;
/* Dexterous: how often a scroll survives the reading, and how often a
   wand or a stone keeps the charge you just spent. */
var PERK_SCROLL_PCT = 20, PERK_CHARGE_PCT = 25;

/* ------------------------------------------------------------ wading
   Water is not decoration.  Every second step through it costs you the
   turn, so a pool is somewhere you can be caught - unless you are
   Riverborn, in which case every second step is free instead and you
   move through water at half again your speed on dry land. */
var WADE_EVERY = 2;
/* Riverborn gives one back every second action taken in the water, so
   two actions cost one turn: double speed, for as long as you are in it. */
var RIVER_FREE_EVERY = 2;
/* Abstemious: three turns in every thirteen cost you no appetite at all,
   which is ten units of food where it used to be thirteen - so a ration
   carries you thirty per cent further. */
var ABSTEMIOUS_CYCLE = 13, ABSTEMIOUS_FREE = 3;

var E_LEVELS = [
  15, 37, 128, 292, 529, 857, 1319, 2127, 3216, 4640, 7459, 11784, 18582,
  31930, 62086, 112938, 179532, 258345, 343832, 430700, 0];

/* hit points gained per level - modest, so armour and tactics keep
   mattering instead of the health bar outrunning the dungeon */
var LEVEL_HP_DIE = 4, LEVEL_HP_FLAT = 1;

/* --- combat and survival dials -------------------------------------
   Lower "hit base" means blows land more often.  Monsters carry three
   times the hit points they used to, so a fight is a real exchange
   rather than a long series of whiffs. */
var HIT_BASE_PLAYER = 15;
var HIT_BASE_MON = 19;

/* Hit points per monster level.  The old "level d8, tripled" gave a level
   one snake anything from 3 to 24, which is why two snakes felt like
   different species.  A flat floor plus a small die keeps the average
   where it was but stops the wild swings. */
/* Monster health: a die per level plus a term that grows with the square
   of it, so the first floors are survivable and the deep ones are not. */
var MON_HP_DIE = 5, MON_HP_CURVE = 1.1, MON_HP_FLAT = 9;

/* How busy a floor is.  Too many bodies and the first floor becomes a
   meat grinder, so keep the count low and let wanderers trickle in. */
var MON_BASE = 3, MON_SPREAD = 3, MON_PER_DEPTH = 4, MON_MAX_EXTRA = 5;
var FLOOR1_MONSTERS = 0.9;    /* the first floor is a tenth quieter */
var MON_CAP = 8;                   /* how many may be alive at once */
var WANDER_CHANCE_PER_MILLE = 20;  /* plus a little with depth */
/* A floor only ever sends this many reinforcements in total.  Without it
   you could stand in a room healing and the dungeon would keep posting
   fresh monsters through the door for as long as you cared to wait. */
var WANDER_BUDGET = 3, WANDER_BUDGET_PER_DEPTH = 6;
var RANGED_BREATH_RANGE = 6;
/* Breathed fire: how long you watch it cross the room before it lands,
   and how long the squares it crossed go on burning afterwards. */
var BREATH_LEAD = 220;
var BREATH_FIRE_MIN = 1, BREATH_FIRE_MAX = 2;
var ARROW_RECOVER_PCT = 20;   /* chance a hit arrow survives to be reused */
/* A blow that lands well.  Everybody gets a few; a ring of battle luck
   gets more, and picks its shafts back up more often besides. */
var CRIT_PCT = 6, CRIT_MULT = 2;
var LUCK_CRIT_PCT = 14, LUCK_RECOVER_PCT = 35;
/* and how much more often the huntress turns up arrows rather than
   stones, and finds a quiver in a chest */
var HUNTRESS_ARROW_PCT = 78, HUNTRESS_CHEST_PCT = 30;
var ARROW_OVERSHOOT = 4;      /* how far a miss can sail past its mark */
var CRYSTAL_MIN_PCT = 10, CRYSTAL_MAX_PCT = 25;
var MOVE_ANIM_MS = 110;       /* how long one monster step takes on screen */
/* A hit knocks the victim back a pixel and flashes it red, so you can see
   the blow land rather than inferring it from the numbers. */
/* A blow reads as two movements: the one striking leans a pixel in, the
   one struck is knocked two pixels back and flashes red. */
/* How long a stat stays coloured after it changes: green if it went up,
   red if it went down, and a fall always wins over a rise. */
var STAT_LIT_TURNS = 20;
var HURT_MS = 150, HURT_PX = 2;
/* and a moment after the wince before the thing that took it is allowed
   to move, so the two are never read as one motion */
var HURT_HOLD = 90;
var LUNGE_MS = 130, LUNGE_PX = 1;
/* how often cursed gear throws you across the floor, per thousand turns */
var TELEPORT_CURSE_PER_MILLE = 55;
/* A flask of fire: where it lands catches, and the flames run from square
   to square while the luck holds. */
var FIRE_SPREAD_PCT = 70, FIRE_MAX_CELLS = 24;
var FIRE_TURNS_MIN = 1, FIRE_TURNS_MAX = 4;
var FIRE_DAMAGE = [1, 5];
/* A runed stone does something extra where it lands. */
var BLAST_DAMAGE = [2, 4], BLAST_RANGE = 1;
var STONE_SLOW_TURNS = 8;
var RETURN_MS = 260;          /* how long the flight home takes to draw */
/* A returning stone comes back this many times before the rune is
   spent and it is just a stone lying on the floor. */
var RETURN_USES = 10;
/* Thunder Charge: the armour soaks up blows and lets go on the third.
   Standing in water spreads the current through the whole pool. */
var THUNDER_EVERY = 3, THUNDER_DAMAGE = [2, 6];
/* A turn is played out rather than resolved all at once: your blow, then
   a pause, then each creature acting in turn, each with its own moment.
   Every line of text is stamped with the instant it belongs to.

   One number for all of it.  Your blow, the answer, the next creature,
   the second step of a quick one - each is a thing to watch, and none of
   them is worth less time than another. */
var BEAT = 500;
var BEAT_PLAYER = BEAT;       /* after your action, before theirs */
var BEAT_ACT = BEAT;          /* between one creature acting and the next */
var BEAT_STEP = BEAT;         /* between two steps of the same creature */
/* Dying is the one thing you cannot take back, so the dungeon holds
   still afterwards and lets you read what happened before the tombstone
   goes up.  Measured from the last thing that was said. */
var DEATH_PAUSE = 1100;
var DEATH_BLINK_MS = 130;     /* how fast you flicker out */
var WALK_ANIM_MS = 180;       /* how long the walk cycle runs after a step */
/* how long the mark of discord lasts, and how far it carries */
var DISCORD_TURNS = 14, DISCORD_RANGE = 9;
/* how many attackers the side panel tracks at once */
var BATTLE_MAX = 4;
/* the holy pool: how many exist in the whole dungeon, and what it gives
   back for every turn you stand in it */
var HOLY_MIN = 2, HOLY_MAX = 3, HOLY_HEAL = 2;
/* holes in the floor: how likely, how big, and how far you drop */
var HOLE_CHANCE = 15, HOLE_MIN = 1, HOLE_MAX = 4;
var FALL_MIN = 1, FALL_MAX = 5;
/* What breaks a fall, and by how much.  Landing on something soft is the
   difference between a bad landing and a very bad one. */
var SOFT_LANDING = {
  moss:   [0.20, 'You land in soft moss. It breaks your fall.'],
  moss2:  [0.20, 'You land in soft moss. It breaks your fall.'],
  rubble: [0.10, 'You land in loose rubble. It gives a little.'],
  rug_nw: [0.15, 'You land on an old rug. It takes some of it.'],
  rug_n:  [0.15, 'You land on an old rug. It takes some of it.'],
  rug_ne: [0.15, 'You land on an old rug. It takes some of it.'],
  rug_w:  [0.15, 'You land on an old rug. It takes some of it.'],
  rug_c:  [0.15, 'You land on an old rug. It takes some of it.'],
  rug_c2: [0.15, 'You land on an old rug. It takes some of it.'],
  rug_e:  [0.15, 'You land on an old rug. It takes some of it.'],
  rug_sw: [0.15, 'You land on an old rug. It takes some of it.'],
  rug_s:  [0.15, 'You land on an old rug. It takes some of it.'],
  rug_se: [0.15, 'You land on an old rug. It takes some of it.']
};
/* and water, which is not decor but is by far the softest thing down here */
var SOFT_WATER = 0.35;
/* furnished rooms: a table with chairs pulled up to it */
var FURNISH_CHANCE = 30;
/* how many pillars a hall may have */
var PILLARS_MAX = 4;
/* Ammunition is scattered on purpose rather than left to the general item
   roll: a stone is worth almost nothing, so it never won that lottery and
   a runed one turned up about once in sixty floors. */
var AMMO_PILES_MIN = 0, AMMO_PILES_MAX = 2;
/* dynamite: hard to come by, and it hurts whatever is beside it */
var DYNAMITE_DAMAGE = [4, 8];
var DYNAMITE_CHEST_PCT = 16, DYNAMITE_FLOOR_PCT = 9;
var RUNESTONE_FLOOR_PCT = 30;      /* chance of one lying about per floor */
var PIN_CHEST_PCT = 22;            /* chance a chest holds a magical pin */
var RUNESTONE_CHEST_PCT = 18;
var FLEE_TURNS = 6, FLEE_STAGGER_PCT = 38, FLEE_HIT_BONUS = 4;
/* how long a creature keeps after you once it has lost sight of you */
var GIVE_UP_TURNS = 3;
/* A clever thing does not simply forget you.  It walks to the last
   square it saw you on, then casts about a few squares further before it
   gives you up and goes home. */
var HUNT_CAST_MIN = 4, HUNT_CAST_MAX = 7, HUNT_PATIENCE = 25;
/* Run him down and now and then he has the ring on him.  He already
   carries an ordinary piece of loot about half the time. */
var LEP_RING_PCT = 12;
/* a hallway that arrives nowhere has to be at least this roomy to be
   a place in its own right rather than a mistake */
/* How long a blind corridor has to be before it is left alone as a
   gallery rather than filled back in.  At four, most floors had a stub
   or two going nowhere; a blind passage is only interesting if it is
   long enough to be somewhere. */
var DEAD_END_MIN = 8;
/* how often a room is cut in two by a stream, and how often by a gap in
   the floor.  Either way a bridge is laid across it. */
var STREAM_CHANCE = 9, CHASM_CHANCE = 6;
/* how often a room has a rug laid in the middle of it, and how big */
var RUG_CHANCE = 26, RUG_MIN = 2, RUG_MAX = 5;
/* and how many simply stand their post instead of walking a round */
var STILL_PCT = 30;
/* Coming at something that has not seen you is the whole point of
   sneaking, so it is worth a great deal more than a nudge. */
/* A bow of the spider: now and then it looses web instead of a shaft,
   which costs no arrow and sticks what it hits where it stands. */
var SPIDER_BOW_PCT = 30, SPIDER_BOW_HOLD = [1, 2];
/* and how often a scroll of enchantment cuts a rune into a plain bow */
var SCROLL_RUNE_PCT = 25, SCROLL_RUNE_GREAT_PCT = 50;
/* How far a summoned creature will go from you to meet something, and
   how close it walks when there is nothing to meet. */
var ALLY_GUARD = 7, ALLY_HEEL = 1;
/* Set this and every new run gets the same dungeon.  Zero means the
   clock decides, which is what a real game wants; the render suite pins
   it so a failure can be looked at again rather than guessed at. */
var FORCED_SEED = 0;
/* how often a knockback enchantment actually shoves, and how far */
var KNOCKBACK_PCT = 35, KNOCKBACK_ARMOR_PCT = 30;
var SNEAK_HIT_BONUS = 10, SURPRISE_HIT_BONUS = 7;
/* A bow is an awkward thing to use with something in your face.  Inside
   this many squares every step closer costs you accuracy, so backing off
   before you loose is worth the turn it takes. */
var POINT_BLANK = 4, POINT_BLANK_PENALTY = 3;
/* how many rounds a creature has to go without a glimpse of you before
   walking back into its view catches it out */
var SURPRISE_AFTER = 2;
var SNEAK_DAM_FLAT = 2, SNEAK_DAM_DIE = 3;
/* The witch.  She has no blow worth the name and never tries one: she
   keeps her distance and works from there.  Two flasks of poison, a
   spider she can call up, a rock when there is nothing better, and a step
   sideways across the room when you get close - which she can only manage
   every few turns, so closing on her is worth doing.  Fire goes through
   her; frost does not touch her at all. */
var WITCH_KEEP = 3;            /* she wants at least this much floor between you */
/* Five turns and fifteen per cent: she is slower to gather herself than
   anything else that goes without walking. */
var WITCH_BLINK_EVERY = 6;
var WITCH_BLINK_FAIL = 40;     /* and it comes to nothing this often, in percent */
var WITCH_FLASKS = 5;          /* how many flasks of poison she carries */
var WITCH_FLASK_EVERY = 10;    /* and how long between throwing them */
var WITCH_FLASK_RANGE = 7;
/* how much room her own spider needs from where the flask bursts: the
   gas spreads a couple of squares and does not care whose side anything
   standing in it is on */
var WITCH_FLASK_CLEAR = 2;
var WITCH_SPIDER_RANGE = 5;    /* how far off she can call one up */
var WITCH_SPIDER_WAIT = 2;     /* turns after hers dies before she calls another */
var WITCH_ROCK_RANGE = 7, WITCH_ROCK_DAMAGE = [2, 5];
/* and what she is sometimes carrying when she goes */
var WITCH_RING_PCT = 30;
/* The ring off her finger: a spider of your own, one at a time, and a
   long wait for each charge. */
var WITCH_RING_TURNS = 400;
var WITCH_SPIDER_LIFE = 60;

/* Going somewhere else without walking there.  It shakes on the spot for
   a moment, goes in a flash, and comes back in another one - so a thing
   that vanishes is something you watched vanish rather than something
   that was suddenly elsewhere. */
var WARP_SHAKE = 300, WARP_FLASH = 120;
/* how often the shiver picks a new pixel to sit on - small, so it reads
   as a vibration rather than a wobble */
var WARP_SHAKE_STEP = 16;
/* and the flash itself: three frames, so going and arriving are things
   that happen rather than things that have happened */
var WARP_FRAMES = ['flash1', 'flash2', 'flash3'];

/* Motes drifting in a room that has something in the air: green over the
   moss, blue over the holy pool.  They are drawn, not simulated - each
   one is a number that turns into a position - so they cost nothing and
   there is nothing to save. */
var MOTES_PER_ROOM = 14, MOTE_MS = 5200;

/* Fire shield: the squares round you burn for a few turns. */
var FIRE_SHIELD_TURNS = 5;
/* the special rooms */
var SHRINE_COST = 1;          /* maximum health, permanently */
var MOSS_HEAL_PCT = 22;       /* chance per turn of mending in moss */
var MOSS_WANDER_MULT = 3;     /* and how much faster it draws company */
var BARREL_DAMAGE = [6, 10];  /* a barrel of powder, not a stick */
/* A lit barrel does not go up on the spot: it burns for a turn, which is
   one turn to get out of the room.  Then it takes everything within two
   squares, walls included, and lights any other barrel it reaches - so a
   powder room comes down in a cascade you can watch and outrun. */
var BARREL_FUSE = 1, BARREL_BLAST = 2;
/* and it goes off as a disc rather than a box: two squares straight out,
   one on the diagonals.  Squared, so the shape does not have to be
   written down twice. */
var BARREL_BLAST_SQ = BARREL_BLAST * BARREL_BLAST;
/* How long fire left behind by a wand or a stick of dynamite goes on
   burning.  The same one or two turns a dragon leaves. */
var SPELL_FIRE_MIN = 1, SPELL_FIRE_MAX = 2;
/* Barrels are not only found in the store.  One gets left standing about
   the place here and there, which turns an ordinary room into somewhere
   worth thinking about before you throw fire around in it. */
var STRAY_BARREL_DEPTH = 2, STRAY_BARREL_PCT = 55, STRAY_BARREL_MAX = 3;

/* Scenery that burns: wood and cloth.  Fire takes a turn longer over one
   of these than it does over bare stone, and then the thing is gone.
   Barrels are not in the list - they have a fuse of their own - and
   neither is anything made of stone or bone. */
var BURNS = { table: 'table', chair: 'chair', moss: 'moss', moss_b: 'moss',
              moss2: 'moss', moss3: 'moss', moss4: 'moss' };
var BURNS_PLURAL = { table: 'tables', chair: 'chairs', rug: 'rugs', moss: 'moss' };
/* the order to name them in when several go at once */
var BURNS_ORDER = ['table', 'chair', 'rug', 'moss'];
/* What somebody put in a room, as against what the room is made of.  A
   room chosen to be something in particular clears the first and leaves
   the second: a stone kerb round a pool and cracked flagstones round a
   chasm are the floor itself, and lifting them leaves a drawing with a
   piece missing. */
var FURNISHINGS = { table: 1, chair: 1, barrel: 1 };
var DECOR_BURN_TURNS = 1;

/* turns per point of natural healing, by experience level */
var HEAL_RATE = [38, 34, 31, 27, 24, 21, 19, 17, 15, 13];
var STARVE_DAMAGE_EVERY = 10;
var START_HP = 20;
var SHOT_RANGE = 10;          /* how far a bow will carry */
var BLINK_RANGE = 5;          /* how far the blink wand throws you */
/* The ring of the untouched: three steps out of trouble, and one of them
   comes back after a long wait.  A ring is worth more than a sword, so
   the wait is long enough to make you choose your moment.

   An enchantment scroll shortens the wait by a third each time - the one
   thing a scroll can do for a ring, since a ring has no edge to sharpen
   and no plate to thicken. */
var RING_CHARGES = 3, RING_RECHARGE = 150;
/* what a ring of fire or of ice throws */
var RING_BEAM = [4, 6], RING_BEAM_RANGE = 10;
var RING_SEER_TURNS = 20;
/* Something a spell is cut out to hurt takes half again as much of it */
var WEAKNESS_MULT = 2;
/* The half dragon's fireball: how often it can spit, how far it carries,
   and how long a flask of water keeps it quiet. */
var FIREBALL_EVERY = 3, FIREBALL_RANGE = 7, FIREBALL_DAMAGE = [3, 5];
/* The web spinner: how often it can spit, how far the web carries, how
   long it holds you, and how long a patch of it lies on the floor. */
var WEB_EVERY = 2, WEB_RANGE = 6;
var WEB_HOLD_MIN = 1, WEB_HOLD_MAX = 2;
var WEB_FLOOR_HOLD = 1;
var WEB_LIFE = 40;
var DOUSED_TURNS = 12;
/* holy water, thrown at something that cannot bear it */
var HOLY_WATER_DAMAGE = [8, 8];
var RING_QUICK_PCT = 33, RING_QUICK_MAX = 3;
var RING_INVIS_TURNS = 20;
/* how long a wet cap of clearwater keeps you out of sight */
var CLEARWATER_TURNS = 10;
var ICE_WALL_TURNS = 25, FIRE_WALL_TURNS = 15;
/* A vampire cannot bear light that was not there before.  In a room lit
   by a wand or a ring it drags, hits softer and guards itself worse -
   and a beam of light full in the face is very nearly the end of it. */
var DAZZLE_DAMAGE = 2, DAZZLE_ARMOR = 3;
var LIGHT_BEAM_DAMAGE = [6, 8];
/* A weapon of fire does no more damage than its plain twin.  What it
   does is set the thing alight, and burning is where the harm is: a few
   turns of it, and a trail of fire behind anything that runs while it
   burns - which will burn you just as happily if you follow. */
var BURN_CHANCE = 40, BURN_MIN = 1, BURN_MAX = 3, BURN_DAMAGE = [1, 3];
var BURN_TRAIL_TURNS = 2;
/* A weapon of ice, likewise: the damage is ordinary, the freeze is not */
var ICE_CHANCE = 30, ICE_MIN = 1, ICE_MAX = 3;

/* ---------------------------------------------------------- item tables */
/* ------------------------------------------------------------- food
   A ration is a meal.  The rest are snacks: something to take the edge
   off while you look for a proper one.  `feed` is the base and the spread
   of what it puts back on the clock, out of the 2000 you can hold. */
var FOODS = [
  { n: 'food ration', pl: 'food rations', feed: [1100, 300], p: 30, w: 2,
    s: 'food', line: 'Yum, that tasted good.', col: 'G' },
  /* the old mold ball, still the thing you eat when there is nothing else */
  { n: 'mold ball', pl: 'mold balls', feed: [700, 300], p: 14, w: 4,
    s: 'fruit', line: 'Yuk, this tastes awful.', col: 'g' },
  { n: 'mushroom', pl: 'mushrooms', feed: [320, 140], p: 20, w: 2,
    s: 'mushroom', line: 'Earthy, and gone in two bites.', col: 'G' },
  { n: 'handful of berries', pl: 'handfuls of berries', feed: [260, 140], p: 22, w: 2,
    s: 'berries', line: 'Sharp and sweet. Hardly a meal.', col: 'G' }
];
var FOOD_MAX = 2000;
/* what a potion of nourishment is worth: more than a snack, less than a
   ration, and it does not take up a hand to carry */
var POTION_FEED = [520, 200];

var POTIONS = [
  { n: 'confusion', p: 7, w: 5, hurl: 'daze' },
  { n: 'hallucination', p: 7, w: 5 },
  { n: 'poison', p: 7, w: 5, hurl: 'gas' },
  { n: 'gain strength', p: 10, w: 150, hurl: 'strong' },
  { n: 'gain dexterity', p: 8, w: 160 },
  { n: 'gain wisdom', p: 7, w: 170 },
  { n: 'see invisible', p: 3, w: 100 },
  { n: 'fire shield', p: 4, w: 190 },
  { n: 'healing', p: 12, w: 130, hurl: 'mend' },
  { n: 'monster detection', p: 6, w: 130 },
  { n: 'magic detection', p: 5, w: 105 },
  { n: 'raise level', p: 2, w: 250 },
  { n: 'extra healing', p: 5, w: 200, hurl: 'mend' },
  { n: 'liquid fire', p: 5, w: 180, hurl: 'fire' },
  { n: 'haste self', p: 5, w: 190 },
  { n: 'restore ability', p: 11, w: 130 },
  { n: 'blindness', p: 5, w: 5, hurl: 'blind' },
  { n: 'thirst quenching', p: 6, w: 5 },
  /* a meal in a bottle, near enough - it will not fill you like a
     ration, but it will get you off the floor you are starving on */
  { n: 'nourishment', p: 8, w: 45 },
  /* Water is water.  It is worth carrying because of what it does when
     you throw it, not when you drink it. */
  { n: 'water', p: 9, w: 3, hurl: 'water' },
  { n: 'holy water', p: 4, w: 70, hurl: 'holy' }
];
/* What a piece of kit looks like before you know anything about it.
   Assigned per kind at the start of a run, the way a potion's colour is,
   so that every long sword in this dungeon is "notched" and finding a
   second one tells you something.  The words carry no information of
   their own: a glowing blade is as likely to be cursed as a rusty one. */
var GEAR_LOOKS = ['rusty', 'notched', 'plain', 'battered', 'tarnished',
  'blackened', 'polished', 'chipped', 'gilded', 'glowing', 'humming',
  'pitted', 'scratched', 'oiled', 'cold', 'heavy', 'crude', 'ornate',
  'worn', 'dull', 'bright', 'greasy', 'silvered', 'weathered'];

var P_COLORS = ['amber', 'aquamarine', 'black', 'blue', 'brown', 'clear',
  'crimson', 'cyan', 'ecru', 'gold', 'green', 'grey', 'magenta', 'orange',
  'pink', 'plaid', 'purple', 'red', 'silver', 'tan', 'tangerine', 'topaz',
  'turquoise', 'vermilion', 'violet', 'white', 'yellow'];
var P_SPRITE = {
  amber: 'pot_y', aquamarine: 'pot_c', black: 'pot_p', blue: 'pot_b',
  brown: 'pot_o', clear: 'pot_w', crimson: 'pot_r', cyan: 'pot_c',
  ecru: 'pot_w', gold: 'pot_y', green: 'pot_g', grey: 'pot_w',
  magenta: 'pot_p', orange: 'pot_o', pink: 'pot_r', plaid: 'pot_g',
  purple: 'pot_p', red: 'pot_r', silver: 'pot_w', tan: 'pot_o',
  tangerine: 'pot_o', topaz: 'pot_y', turquoise: 'pot_c',
  vermilion: 'pot_r', violet: 'pot_p', white: 'pot_w', yellow: 'pot_y'
};

/* what colour a flask splashes, keyed by the sprite it uses */
var P_COLOUR = {
  pot_y: '#fad039', pot_c: '#74d6e8', pot_p: '#b26ce0', pot_b: '#1f8fd8',
  pot_o: '#f59e0b', pot_w: '#e6edf5', pot_r: '#d82b2b', pot_g: '#93bd27'
};

var SCROLLS = [
  { n: 'monster confusion', p: 7, w: 140 },
  { n: 'magic mapping', p: 5, w: 150 },
  { n: 'hold monster', p: 2, w: 180 },
  { n: 'sleep', p: 3, w: 5 },
  { n: 'enchantment', p: 11, w: 160, pick: 1 },
  { n: 'greater enchantment', p: 4, w: 340, pick: 1 },
  { n: 'malediction', p: 6, w: 20, pick: 1 },
  { n: 'identify', p: 34, w: 85, pick: 1 },
  { n: 'scare monster', p: 3, w: 200 },
  { n: 'teleportation', p: 5, w: 165 },
  { n: 'create monster', p: 4, w: 75 },
  { n: 'remove curse', p: 7, w: 105, pick: 1 },
  { n: 'aggravate monsters', p: 3, w: 20 },
  { n: 'protect armor', p: 3, w: 250, pick: 1 },
  { n: 'summon aid', p: 5, w: 320 },
  { n: 'light', p: 9, w: 90 },
  { n: 'blank paper', p: 6, w: 5 },
  { n: 'charging', p: 6, w: 210, pick: 1 },
  { n: 'fire shield', p: 4, w: 195 },
  /* Only ever one thing at a time carries it: reading it over something
     new lets go of whatever held it before. */
  { n: 'return', p: 5, w: 230, pick: 1 }
];
var SYL = ['a', 'ab', 'ag', 'aks', 'ala', 'an', 'app', 'arg', 'arze', 'ash',
  'bek', 'bie', 'bit', 'bjor', 'blu', 'bot', 'bu', 'byt', 'comp', 'con',
  'cos', 'cre', 'dalf', 'dan', 'den', 'do', 'e', 'eep', 'el', 'eng', 'er',
  'ere', 'erk', 'esh', 'evs', 'fa', 'fid', 'fri', 'fu', 'gan', 'gar', 'glen',
  'gop', 'gre', 'ha', 'hyd', 'i', 'ing', 'ip', 'ish', 'it', 'ite', 'iv',
  'jo', 'kho', 'kli', 'klis', 'la', 'lech', 'mar', 'me', 'mi', 'mic', 'mik',
  'mon', 'mung', 'mur', 'nej', 'nelg', 'nep', 'ner', 'nes', 'nih',
  'nin', 'o', 'od', 'ood', 'org', 'orn', 'ox', 'oxy', 'pay', 'ple', 'plu',
  'po', 'pot', 'prok', 're', 'rea', 'rhov', 'ri', 'ro', 'rog', 'rok', 'rol',
  'sa', 'san', 'sat', 'sef', 'seh', 'shu', 'ski', 'sna', 'sne', 'snik',
  'sno', 'so', 'sol', 'sri', 'sta', 'sun', 'ta', 'tab', 'tem', 'ther', 'ti',
  'tox', 'trol', 'tue', 'turs', 'u', 'ulk', 'um', 'un', 'uni', 'ur', 'uth',
  'vaz', 'vish', 'vly', 'vom', 'wah', 'wed', 'werg', 'wex', 'whon', 'wun',
  'xo', 'y', 'yot', 'yu', 'zant', 'zek', 'zim', 'zon', 'zum'];

var WANDS = [
  { n: 'light', p: 12, w: 250 },
  /* the other way about: it puts a room out */
  { n: 'darkness', p: 6, w: 180 },
  { n: 'invisibility', p: 6, w: 5 },
  { n: 'lightning', p: 4, w: 330 },
  { n: 'fire', p: 4, w: 330 },
  { n: 'cold', p: 4, w: 330 },
  { n: 'polymorph', p: 13, w: 310 },
  { n: 'magic missile', p: 11, w: 170 },
  { n: 'haste monster', p: 8, w: 5 },
  { n: 'slow monster', p: 11, w: 350 },
  { n: 'drain life', p: 8, w: 300 },
  { n: 'nothing', p: 1, w: 5 },
  { n: 'teleport away', p: 7, w: 340 },
  { n: 'teleport to', p: 5, w: 50 },
  { n: 'cancellation', p: 6, w: 280 },
  { n: 'ice wall', p: 6, w: 300, wall: 1 },
  { n: 'fire wall', p: 6, w: 300, wall: 1 },
  { n: 'blink', p: 7, w: 260, blink: 1 },
  { n: 'discord', p: 7, w: 300 }
];
var WOODS = ['avocado wood', 'balsa', 'bamboo', 'banyan', 'birch', 'cedar',
  'cherry', 'cinnabar', 'cypress', 'dogwood', 'driftwood', 'ebony', 'elm',
  'eucalyptus', 'fall', 'hemlock', 'holly', 'ironwood', 'kukui wood',
  'mahogany', 'manzanita', 'maple', 'oaken', 'persimmon', 'pine',
  'poplar', 'redwood', 'rosewood', 'spruce', 'teak', 'walnut', 'zebrawood'];
var METALS = ['aluminum', 'beryllium', 'bone', 'brass', 'bronze', 'copper',
  'electrum', 'gold', 'iron', 'lead', 'magnesium', 'mercury', 'nickel',
  'pewter', 'platinum', 'steel', 'silver', 'silicon', 'tin', 'titanium',
  'tungsten', 'zinc'];

/* --- worn gear.  "prop" replaces the old ring effects --------------- */
var WEAPONS = [
  { n: 'mace', gen: 'club', d: [2, 4], p: 12, w: 8, s: 'mace' },
  { n: 'long sword', gen: 'blade', d: [3, 4], p: 12, w: 15, s: 'sword' },
  { n: 'dagger', gen: 'blade', d: [1, 6], p: 10, w: 3, s: 'dagger' },
  /* hurl: a weapon you can fight with or throw.  What it does in the air
     is what it does in the hand, and it is always there to pick up
     again - a spear is not consumed by being thrown. */
  { n: 'spear', gen: 'shaft', d: [2, 3], p: 11, w: 5, s: 'spear', hurl: 1 },
  { n: 'throwing dagger', gen: 'blade', d: [1, 5], p: 9, w: 12, s: 'dagger_throw', hurl: 1,
    minDepth: 3 },
  { n: 'battle axe', gen: 'axe', d: [3, 5], p: 9, w: 60, s: 'axe', two: 1 },
  { n: 'two handed sword', gen: 'blade', d: [4, 4], p: 8, w: 75, s: 'sword', two: 1 },
  { n: 'short bow', gen: 'bow', d: [1, 2], p: 10, w: 15, s: 'bow', launch: 1, ammo: 'arrow',
    shot: [1, 4], fly: 'arrow' },
  /* pile: how many of a stackable thing you find at once.  Arrows and
     bolts come in a bundle because a quiver spilled; stones are picked
     up off the ground one or two at a time, and a runed one is a find
     all by itself. */
  { n: 'arrow', d: [1, 2], p: 14, w: 1, s: 'arrow', grp: 1, pile: [3, 9],
    ammoFor: 'short bow', alsoFor: 'crossbow', ammoText: 'for a bow or a crossbow' },
  /* Taller than a short bow and drawn further: it reaches the length of
     the room and hits harder for it, at the cost of being awkward in a
     crowd - which the point blank penalty already charges you for. */
  { n: 'long bow', gen: 'bow', d: [1, 2], p: 8, w: 55, s: 'bow_long', launch: 1,
    ammo: 'arrow', shot: [2, 4], fly: 'arrow', two: 1, reach: 3 },
  /* Heavier, slower to wind, and it hits a little harder - and it takes
     the same arrows as the bow.  Two kinds of ammunition meant carrying
     a quiver you could not use with the launcher you had found, which is
     bookkeeping rather than a decision. */
  { n: 'crossbow', gen: 'bow', d: [1, 3], p: 8, w: 40, s: 'crossbow', launch: 1, ammo: 'arrow',
    shot: [1, 5], fly: 'arrow' },
  /* No bow needed, and a little softer than one: a stone is what you
     have before you find anything better. */
  { n: 'stone', d: [1, 3], p: 16, w: 1, s: 'stone', grp: 1, pile: [1, 2],
    thrown: 1, shot: [1, 2] },
  { n: 'blasting stone', d: [1, 3], p: 2, w: 60, s: 'stone_blast', grp: 1,
    pile: [1, 1], thrown: 1, shot: [1, 2], rune: 'blast' },
  { n: 'binding stone', d: [1, 3], p: 2, w: 55, s: 'stone_slow', grp: 1,
    pile: [1, 1], thrown: 1, shot: [1, 2], rune: 'slow' },
  { n: 'returning stone', d: [1, 3], p: 1, w: 80, s: 'stone_return', grp: 1,
    pile: [1, 1], thrown: 1, shot: [1, 2], rune: 'return' },
  /* The two that carry an element rather than a trick.  They hit like a
     stone and leave the elemental part behind them. */
  { n: 'burning stone', d: [1, 3], p: 2, w: 65, s: 'stone_fire', grp: 1,
    pile: [1, 1], thrown: 1, shot: [1, 2], rune: 'fire' },
  { n: 'freezing stone', d: [1, 3], p: 2, w: 65, s: 'stone_ice', grp: 1,
    pile: [1, 1], thrown: 1, shot: [1, 2], rune: 'ice' }
];
/* Every worn thing now stores PROTECTION POINTS: bigger is better, and a
   breastplate finally beats a leather jerkin. */
var ARMORS = [
  { n: 'leather armor', gen: 'coat', a: 2, p: 20, w: 20, s: 'armor_l' },
  { n: 'studded leather', gen: 'coat', a: 3, p: 15, w: 20, s: 'armor_l' },
  { n: 'ring mail', gen: 'coat', a: 3, p: 15, w: 25, s: 'armor_c' },
  { n: 'scale mail', gen: 'coat', a: 4, p: 13, w: 30, s: 'armor_c' },
  { n: 'chain mail', gen: 'coat', a: 5, p: 12, w: 75, s: 'armor_c' },
  { n: 'splint mail', gen: 'coat', a: 6, p: 10, w: 80, s: 'armor_p' },
  { n: 'banded mail', gen: 'coat', a: 6, p: 10, w: 90, s: 'armor_p' },
  { n: 'plate mail', gen: 'coat', a: 7, p: 5, w: 150, s: 'armor_p' }
];
var HEADS = [
  { n: 'leather cap', gen: 'helm', a: 1, p: 24, w: 20, s: 'cap' },
  { n: 'iron helmet', gen: 'helm', a: 2, p: 20, w: 60, s: 'helm' },
  { n: 'horned helm', gen: 'helm', a: 2, p: 13, w: 40, s: 'helm', prop: 'aggravate monster', bad: 1 },
  { n: 'circlet of vision', gen: 'helm', a: 1, p: 12, w: 200, s: 'crown', prop: 'see invisible' },
  { n: 'crown of might', gen: 'helm', a: 2, p: 8, w: 400, s: 'crown', prop: 'add strength' },
  { n: 'hood of the seeker', gen: 'helm', a: 1, p: 12, w: 220, s: 'cap', prop: 'searching' },
  { n: 'sage circlet', gen: 'helm', a: 1, p: 11, w: 350, s: 'crown', prop: 'wisdom' },
  { n: 'helm of regrowth', gen: 'helm', a: 2, p: 11, w: 460, s: 'helm', prop: 'regeneration' }
];
/* pl: the name is already plural, so it is "a pair of boots" and never
   "a boots" - and never "an iron boots" either */
var FEET = [
  { n: 'sandals', gen: 'boots', a: 0, p: 20, w: 5, s: 'sandals', pl: 1 },
  { n: 'leather boots', gen: 'boots', a: 1, p: 26, w: 25, s: 'boots', pl: 1 },
  { n: 'iron boots', gen: 'boots', a: 2, p: 17, w: 70, s: 'ironboots', pl: 1 },
  { n: 'elven boots', gen: 'boots', a: 1, p: 14, w: 300, s: 'boots', prop: 'stealth', pl: 1 },
  { n: 'wanderer boots', gen: 'boots', a: 1, p: 13, w: 240, s: 'boots', prop: 'slow digestion', pl: 1 },
  { n: 'nimble boots', gen: 'boots', a: 1, p: 12, w: 330, s: 'boots', prop: 'dexterity', pl: 1 },
  { n: 'blinking sandals', gen: 'boots', a: 1, p: 10, w: 30, s: 'sandals', prop: 'teleportation', bad: 1, pl: 1 }
];
var SHIELDS = [
  { n: 'buckler', gen: 'shield', a: 1, p: 30, w: 20, s: 'shield' },
  { n: 'kite shield', gen: 'shield', a: 2, p: 26, w: 60, s: 'shield2' },
  { n: 'tower shield', gen: 'shield', a: 3, p: 16, w: 120, s: 'shield3' },
  { n: 'warded shield', gen: 'shield', a: 2, p: 14, w: 280, s: 'shield2', prop: 'sustain strength' },
  { n: 'mirror shield', gen: 'shield', a: 2, p: 14, w: 320, s: 'shield3', prop: 'see invisible' }
];

/* What turns up when the dungeon decides to leave something lying about.
   Consumables carry the game: you will find several potions and scrolls
   for every weapon or piece of armour, so the interesting decisions are
   about what to drink and read rather than what to wear. */
/* ------------------------------------------------------------- rings
   Worn magic you set off yourself.  There is exactly one of each in a
   run: find the ring of fire and that is the ring of fire, for good.
   That is what makes finding one an event rather than a drop.

   `charges` is what it holds, `recharge` how long a charge takes to come
   back, `aim` means it is pointed at something. */
var RINGS = [
  { n: 'the untouched', p: 100, w: 400, s: 'ring_b',
    txt: 'it steps you out of reach' },
  { n: 'fire', p: 70, w: 450, s: 'ring_r', charges: 3, aim: 'fire',
    txt: 'it throws fire from your hand' },
  { n: 'ice', p: 70, w: 450, s: 'ring_c', charges: 3, aim: 'cold',
    txt: 'it throws ice from your hand' },
  /* One charge, and a long wait for it - but a lit room is worth a lot
     more than a lit room sounds, and there are things down there that
     cannot bear the light. */
  { n: 'light', p: 80, w: 300, s: 'ring_y', charges: 1, recharge: 400,
    light: 1, txt: 'it fills the room with light' },
  /* Not light - sight.  For twenty turns nothing on the floor is hidden
     from you: the dark, the invisible, the seam in the wall and the
     flagstone that is not a flagstone. */
  { n: 'the seer', p: 60, w: 520, s: 'ring_p', charges: 2, seer: 1,
    txt: 'it shows you what is hidden' },
  /* Never lying about the dungeon: the only one in the game is on a
     leprechaun's finger, and you have to catch him to get it.  Two
     charges, but each one buys a long stretch of walking unseen. */
  { n: 'the unseen', p: 0, w: 600, s: 'ring_g', invis: 1, charges: 2,
    txt: 'it takes you out of sight' },
  /* Off a witch's finger, and nowhere else.  A spider of your own, one
     at a time, and four hundred turns of walking for each charge. */
  { n: 'the witch', p: 0, w: 560, s: 'ring_m', charges: 3, spider: 1,
    recharge: WITCH_RING_TURNS, txt: 'it calls a spider to your side' },
  /* The two that do nothing when you press them.  They work while you
     are carrying them, which is the whole of what they do - so they hold
     no charges and there is nothing to wind up. */
  { n: 'battle luck', p: 55, w: 480, s: 'ring_o', worn: 1, charges: 0,
    txt: 'your blows land better, and keep' },
  { n: 'the huntress', p: 55, w: 420, s: 'ring_n', worn: 1, charges: 0,
    txt: 'more chance of finding arrows' }
];

var THINGS = [
  { t: 'potion', p: 32 }, { t: 'scroll', p: 30 }, { t: 'food', p: 10 },
  { t: 'weapon', p: 6 }, { t: 'armor', p: 5 }, { t: 'wand', p: 5 },
  { t: 'head', p: 4 }, { t: 'feet', p: 4 }, { t: 'shield', p: 4 },
  /* One of each in a whole run, so the chance of turning one up has to
     be low or you would have the set by the sixth floor. */
  { t: 'ring', p: 4 }
];

/* ------------------------------------------------------------ runes
   Magic an item carries beyond its plusses.  A rune marked "latent" lies
   dormant until you know what you are holding: appraise the item, or read
   a scroll of identify over it, and only then does it wake up. */
var RUNES = [
  /* --- weapons --- */
  { n: 'fire', t: 'w', p: 10, txt: 'it sets its mark alight' },
  { n: 'ice', t: 'w', p: 10, txt: 'it freezes its mark solid' },
  { n: 'venom', t: 'w', p: 8, latent: 1, txt: 'its bite weakens a foe' },
  { n: 'slaying', t: 'w', p: 8, latent: 1, txt: 'it finds its mark (+2,+2)' },
  { n: 'quickness', t: 'w', p: 7, latent: 1, txt: 'it sometimes strikes twice' },
  { n: 'leeching', t: 'w', p: 6, latent: 1, txt: 'it feeds your wounds' },
  { n: 'discord', t: 'w', p: 5, latent: 1, txt: 'its mark turns friends' },
  { n: 'dullness', t: 'w', p: 6, bad: 1, txt: 'the edge will not hold' },
  /* Bows only, which is what the 'b' is for: everything else asks with
     'w' and never sees it. */
  { n: 'the spider', t: 'b', p: 12, txt: 'it looses web, not arrows' },
  /* --- worn --- */
  { n: 'warding', t: 'g', p: 10, txt: 'it turns a blow aside (+1)' },
  { n: 'thorns', t: 'g', p: 7, txt: 'it bites your attacker' },
  { n: 'blight', t: 'g', p: 7, txt: 'its touch poisons attackers' },
  { n: 'rime', t: 'g', p: 7, txt: 'its touch freezes attackers' },
  { n: 'reflexes', t: 'g', p: 8, latent: 1, txt: 'you slip aside more often' },
  { n: 'shadow', t: 'g', p: 8, latent: 1, txt: 'it muffles your step' },
  { n: 'insight', t: 'g', p: 7, latent: 1, txt: 'it sharpens the eye (+2 wis)' },
  { n: 'vigour', t: 'g', p: 7, latent: 1, txt: 'wounds close faster' },
  { n: 'burden', t: 'g', p: 6, bad: 1, txt: 'it drags at every step' },
  { n: 'thunder', t: 'g', p: 7, latent: 1,
    txt: 'it answers every third blow' },
  /* Cut into a blade it drives your foe back; cut into armour it throws
     off whoever hit you.  One rune, one name, and it is offered to both
     - two entries sharing a name meant the lookup found only the last of
     them, so a knockback sword described itself as a breastplate. */
  { n: 'knockback', t: 'wg', p: 8, latent: 1, txt: 'its blow drives things back' },
  /* --- head only --- */
  { n: 'clearwater', t: 'h', p: 10, txt: 'worn wet, it hides you' }
];
var RUNE_BY_NAME = {};
(function () { for (var i = 0; i < RUNES.length; i++) RUNE_BY_NAME[RUNES[i].n] = RUNES[i]; })();

/* ------------------------------------------------------ what is this?
   Every square in the game can be looked at, so every square has to have
   something to say.  One line each, and the rule for adding anything new
   to the dungeon is that it gets its line here at the same time.

   Keep them under about 34 characters a line, which is what the box is
   wide enough to show. */
/* What the game says the first time you walk into a room somebody built
   on purpose.  A special room is worth noticing, and noticing it in the
   log is better than working it out from the furniture. */
var ROOM_ENTRY = {
  moss:      ['You enter a room filled with soft moss.',
              'You feel something magical in the air.'],
  nursery:   ['The room is full of sleeping shapes.',
              'Tread carefully.'],
  shrine:    ['A quiet shrine, and an offering bowl.',
              'Something here wants paying.'],
  alchemist: ["An alchemist's cell. Flasks everywhere,",
              'and none of them labelled.'],
  powder:    ['A powder store. Barrels line the walls.',
              'Do not bring a flame in here.'],
  mint:      ['A mint. Gold glitters behind iron bars.',
              'The lock will want a key.']
};

var TILE_INFO = {};
TILE_INFO[ROCK]     = ['Solid rock.', 'Dynamite might open it.'];
TILE_INFO[WALL]     = ['A dressed stone wall.', 'Dynamite would blow it in.'];
TILE_INFO[FLOOR]    = ['Bare stone floor.'];
TILE_INFO[CORR]     = ['A hallway between rooms.'];
TILE_INFO[DOOR]     = ['A doorway. It blocks sight', 'and arrows both ways.'];
TILE_INFO[SDOOR]    = ['A dressed stone wall.', 'Dynamite would blow it in.'];
TILE_INFO[LOCKED]   = ['A locked door. You need the', 'key of the right metal.'];
TILE_INFO[STAIR]    = ['Stairs down to the next floor.'];
TILE_INFO[STAIR_UP] = ['Stairs back up the way', 'you came.'];
TILE_INFO[WATER]    = ['Water. Wading costs you every', 'second step, and it carries',
                       'cold and lightning.'];
TILE_INFO[HOLY]     = ['A holy spring. Standing in it', 'mends you.'];
TILE_INFO[HOLE]     = ['A hole clean through the floor.', 'Step in and you fall.'];
TILE_INFO[BRIDGE]   = ['A plank bridge over the gap.'];
TILE_INFO[BARS]     = ['Iron bars. You can see through', 'them and nothing breaks them.'];
TILE_INFO[ICEWALL]  = ['A wall of ice. It will melt.'];
TILE_INFO[FIREWALL] = ['A sheet of flame. You can see', 'and shoot through it.'];

/* Four kinds of each, so a mossy floor and a cracked one do not read as
   the same two tiles repeated.  Everything that used to name the two by
   hand asks these instead. */
/* The looks a wand can wear.  A metal one is a wand, a wooden one is a
   staff, and each shape has more than one carving. */
/* The carvings a runed stone can wear.  Which rune wears which is dealt
   afresh every run - see makeAppearances. */
/* Which of the four wall faces a square wears.  A pure function of where
   the square is, so the renderer and the floor builder always agree
   without either storing anything. */
function wallVariant(x, y) {
  var h = (x * 7 + y * 13 + ((x * y) & 7)) % 9;
  if (h === 8) return 'wall_moss';
  if (h === 5) return 'wall3';
  return (h & 1) ? 'wall2' : 'wall';
}

var RUNE_STONE_SPRITES = ['stone_blast', 'stone_slow', 'stone_return',
                          'stone_fire', 'stone_ice'];
var WAND_SPRITES = ['wand', 'wand2', 'wand3'];
var STAFF_SPRITES = ['staff', 'staff2'];

/* Three tiles of moss for the middle of a patch and two for its edge.
   An edge tile is drawn turned so its top faces what it borders - the
   moss it grows out from, or the wall it grows up - exactly as a cracked
   flagstone faces the hole beside it. */
var MOSS_FIELD = ['moss', 'moss_b', 'moss2'];
var MOSS_EDGE = ['moss3', 'moss4'];
var MOSSES = MOSS_FIELD.concat(MOSS_EDGE);
var CRACKS = ['crack', 'crack2', 'crack3', 'crack4'];
function isMoss(d) { return !!d && MOSSES.indexOf(d) >= 0; }
function isMossEdge(d) { return !!d && MOSS_EDGE.indexOf(d) >= 0; }
function isCrack(d) { return !!d && CRACKS.indexOf(d) >= 0; }
/* how often moss creeps up an ordinary wall, and up a mossy one */
var MOSS_WALL_PCT = 2, MOSS_WALL_MOSSY_PCT = 18;
/* how much bare stone a cave of moss keeps, for the moss to thin against */
var MOSS_BARE_PCT = 9, MOSS_BARE_MIN = 4;

var DECOR_INFO = {
  moss:    ['You see moss on the floor.'],
  moss_b:  ['You see moss on the floor.'],
  moss2:   ['You see moss on the floor.'],
  moss3:   ['You see moss on the floor.'],
  moss4:   ['You see moss on the floor.'],
  crack:   ['The floor is cracked here.', 'Might not be safe.'],
  crack2:  ['The floor is cracked here.', 'Might not be safe.'],
  crack3:  ['The floor is cracked here.', 'Might not be safe.'],
  crack4:  ['The floor is cracked here.', 'Might not be safe.'],
  bones:   ['Somebody died here.'],
  skull:   ['A skull, picked clean.'],
  rubble:  ['Loose rubble and broken stone.'],
  table:   ['A table. You can walk round it,', 'not over it.'],
  chair:   ['A chair, long since abandoned.'],
  kerb:    ['Dressed stone round the spring.'],
  barrel:  ['A barrel of black powder.', 'Fire or a blast sets it off.'],
  web:     ['Sticky web across the floor.', 'Whatever steps in it stops.'],
  rug_nw:  ['An old, dusty rug.'],
  rug_n:   ['An old, dusty rug.'],
  rug_ne:  ['An old, dusty rug.'],
  rug_w:   ['An old, dusty rug.'],
  rug_c:   ['An old, dusty rug.'],
  rug_c2:  ['An old, dusty rug.'],
  rug_e:   ['An old, dusty rug.'],
  rug_sw:  ['An old, dusty rug.'],
  rug_s:   ['An old, dusty rug.'],
  rug_se:  ['An old, dusty rug.']
};

/* what is written on each kind of trap when you have found it */
var TRAP_INFO = {
  bear:    ['A bear trap. It holds you fast.'],
  spike:   ['A spike pit. It hurts and holds.'],
  sleep:   ['A sleeping gas trap.'],
  arrow:   ['An arrow trap. It shoots at you', 'and resets itself.'],
  shooter: ['A dart shooter. It saps your', 'strength as well.'],
  gas:     ['A poison gas trap.'],
  flame:   ['A flame jet set in the wall.'],
  alarm:   ['An alarm rune. It wakes the', 'whole floor.'],
  dart:    ['A poison dart trap.'],
  rust:    ['A rust trap. It corrodes', 'metal armour.']
};

/* ---------------------------------------------------------- monsters */
/* swim: the water is nothing to it.  The two fliers, the two spirits,
   the thing that lives in water, the snakes, and the two that never move
   anyway.  Everything else wades. */
/* smart: it hunts rather than merely chasing.  Lose one of these and it
   walks to where it last saw you and searches past that before giving
   up.  This is cunning, not ferocity: a troll or a jabberwock will tear
   you apart and still lose you round the first corner. */
var MONS = [
  /* It had no attack dice at all, so it could never land a blow - and
     since rust only bites on a hit, it could never corrode anything
     either.  It needs a claw for its real trick to work. */
  { c: 'A', n: 'aquator', swim: 1, lv: 5, xp: 20, ar: 2, d: [[1, 6]], mean: 1, sp: 'rust' },
  { c: 'B', n: 'bat', swim: 1, lv: 1, xp: 2, ar: 3, d: [[1, 4]], fly: 1, err: 1, nodrop: 1, hpMul: 0.85 , dmgMul: 0.9, dark: 1 },
  { c: 'C', n: 'centaur', smart: 1, lv: 4, xp: 15, ar: 4, d: [[1, 6]] },
  { c: 'D', n: 'dragon', smart: 1, lv: 10, xp: 5000, ar: -1, d: [[1, 8], [1, 8], [3, 10]], mean: 1, sp: 'flame' },
  { c: 'E', n: 'spider', lv: 1, xp: 3, ar: 7, d: [[1, 6]], mean: 1 , dmgMul: 0.9 },
  { c: 'F', n: 'venus flytrap', swim: 1, lv: 8, xp: 80, ar: 3, d: [[1, 1]], mean: 1, sp: 'hold', still: 1 },
  { c: 'G', n: 'griffin', swim: 1, lv: 13, xp: 2000, ar: 2, d: [[4, 3], [3, 5]], mean: 1, fly: 1, regen: 1 },
  { c: 'H', n: 'hobgoblin', smart: 1, lv: 2, xp: 5, ar: 5, d: [[1, 6]], mean: 1 },
  { c: 'I', n: 'ice monster', lv: 1, xp: 5, ar: 9, d: [[1, 4]], sp: 'freeze', minDepth: 2 },
  { c: 'J', n: 'jabberwock', lv: 15, xp: 3000, ar: 6, d: [[2, 12], [2, 4]] },
  /* faces: the sprite has a nose and a tail, so it is mirrored when it
     walks the other way rather than running backwards */
  { c: 'K', n: 'rat', lv: 1, xp: 2, ar: 7, d: [[1, 4]], mean: 1, nodrop: 1,
    hpMul: 0.85, dmgMul: 0.9, faces: 1 },
  /* only: one to a floor.  Two of them and your purse is gone before you
     have found the first one again. */
  { c: 'L', n: 'leprechaun', smart: 1, lv: 3, xp: 10, ar: 8, d: [[1, 1]], sp: 'stealgold', only: 1 },
  { c: 'M', n: 'medusa', smart: 1, lv: 8, xp: 200, ar: 2, d: [[3, 4], [3, 4], [2, 5]], mean: 1, sp: 'confuse' },
  { c: 'N', n: 'nymph', smart: 1, lv: 3, xp: 37, ar: 9, d: [[1, 1]], sp: 'stealitem' },
  { c: 'O', n: 'orc', smart: 1, lv: 2, xp: 7, ar: 6, d: [[1, 6]], greedy: 1 },
  { c: 'P', n: 'phantom', swim: 1, lv: 8, xp: 120, ar: 3, d: [[4, 4]], invis: 1 },
  { c: 'Q', n: 'quagga', lv: 3, xp: 15, ar: 3, d: [[1, 5]], mean: 1 },
  { c: 'R', n: 'rattlesnake', swim: 1, lv: 2, xp: 9, ar: 3, d: [[1, 6]], mean: 1, sp: 'weaken' },
  { c: 'S', n: 'snake', swim: 1, lv: 1, xp: 2, ar: 5, d: [[1, 4]], mean: 1, nodrop: 1, hpMul: 0.85 },
  { c: 'T', n: 'troll', lv: 6, xp: 120, ar: 4, d: [[1, 8], [1, 8], [2, 6]], mean: 1, regen: 1 },
  { c: 'U', n: 'ur-vile', smart: 1, lv: 7, xp: 190, ar: -2, d: [[1, 3], [1, 3], [1, 3], [4, 6]], mean: 1 },
  { c: 'V', n: 'vampire', smart: 1, lv: 8, xp: 350, ar: 1, d: [[1, 10]], mean: 1, regen: 1, sp: 'drainmax', dark: 1 },
  { c: 'W', n: 'wraith', smart: 1, swim: 1, lv: 5, xp: 55, ar: 4, d: [[1, 6]], sp: 'drainexp' },
  { c: 'X', n: 'xeroc', smart: 1, swim: 1, lv: 7, xp: 100, ar: 7, d: [[4, 4]], sp: 'mimic' },
  { c: 'Y', n: 'yeti', lv: 4, xp: 50, ar: 6, d: [[1, 6], [1, 6]] },
  { c: 'Z', n: 'zombie', lv: 2, xp: 6, ar: 8, d: [[1, 8]], mean: 1 },
  /* The alphabet ran out at Z, so the newer creatures take lower case
     keys.  Nothing ever shows the letter to the player - it only names
     the sprite and looks the creature up in the table - so the case is
     free to mean "added later".

     A half dragon is an orc that spits fire: the same weight of health,
     a slightly worse bite, and a fireball every few turns from across
     the room.  It cannot spit with its feet in water, a flask of water
     puts it out for a while, and cold goes through it like nothing. */
  { c: 'h', n: 'half dragon', smart: 1, lv: 2, xp: 22, ar: 5, d: [[1, 8]],
    mean: 1, sp: 'fireball', weak: 'cold', minDepth: 3 },
  /* A lighter spider that fights at a distance: it spits web rather than
     closing, and what it does not stick to you it leaves on the floor
     for you to walk into later. */
  { c: 'w', n: 'web spinner', lv: 1, xp: 6, ar: 8, d: [[1, 4]],
    hpMul: 0.75, dmgMul: 0.9, sp: 'web', minDepth: 2 },
  /* A witch keeps her distance and never closes: no melee at all, and
     every trick she has works across a room.  Fire goes through her and
     frost does not touch her. */
  { c: 'k', n: 'witch', smart: 1, lv: 5, xp: 90, ar: 6, d: [[1, 2]],
    hpMul: 0.8, sp: 'witch', nomelee: 1, keepAway: 1,
    weak: 'fire', immune: 'cold', minDepth: 4 }
];
/* A line about each creature: what it is, and the thing about it that
   will kill you if you have not met one before. */
var MON_INFO = {
  A: ['An aquator. Its touch corrodes', 'metal armour off your back.'],
  B: ['A bat. It flits about at random', 'and moves twice in a turn.', 'The dark does not trouble it.'],
  C: ['A centaur. Quick, and clever', 'enough to hunt you down.'],
  D: ['A dragon. It breathes fire.', 'Do not fight one in the open.'],
  E: ['A giant spider. Fast and mean', 'for something so small.'],
  F: ['A venus flytrap. It cannot move,', 'but it holds what it catches.'],
  G: ['A griffin. It flies, and it is', 'as strong as anything down here.'],
  H: ['A hobgoblin. It will come for', 'you and it does not lose you.'],
  I: ['An ice monster. Its touch', 'freezes you where you stand.'],
  J: ['A jabberwock. Enormous teeth,', 'no wit at all behind them.'],
  K: ['A rat. Small, quick, and there', 'are always more of them.'],
  L: ['A leprechaun. He steals gold and', 'runs. Kill him to get it back.'],
  M: ['A medusa. Her gaze leaves you', 'confused and stumbling.'],
  N: ['A nymph. She takes something', 'from your pack and vanishes.'],
  O: ['An orc. It goes out of its way', 'for gold lying on the floor.'],
  P: ['A phantom. Invisible unless you', 'can see invisible things.'],
  Q: ['A quagga. It charges, and it', 'is faster than it looks.'],
  R: ['A rattlesnake. Its venom saps', 'your strength for good.'],
  S: ['A snake. Common, and it swims.'],
  T: ['A troll. It heals as fast as you', 'can cut it, and hits like a cart.'],
  U: ['An ur-vile. Four attacks a turn', 'and armour you can barely dent.'],
  V: ['A vampire. Every bite takes a', 'point of your maximum health.'],
  W: ['A wraith. Its touch drains the', 'experience out of you.'],
  X: ['A xeroc. It sits still pretending', 'to be a chest until you are close.'],
  Y: ['A yeti. Two heavy paws.'],
  Z: ['A zombie. Slow, tough, and it', 'never stops coming.'],
  h: ['A half dragon. It spits fire', 'across the room every few turns.',
      'Water stops its breath. Cold', 'hurts it badly.'],
  w: ['A web spinner. Lighter than a', 'spider, and it fights from across',
      'the room: web that sticks you', 'where you stand, and web left',
      'on the floor to walk into.'],
  k: ['A witch. She will not come near', 'you: poison, spiders and stones',
      'from across the room, and a step', 'sideways when you close.',
      'Fire hurts her. Frost does not.']
};

/* Hints.  Each one is a thing the game does not say out loud anywhere
   else - a rule you would otherwise only learn by dying of it.  Kept to
   plain sentences; the box wraps them itself. */
/* ------------------------------------------------------------- curses
   A curse is not a property of the wearer but of the thing worn: it
   arrives with a cursed item, it is felt the moment the item goes on,
   and it goes when the item does - which means the shrine and a scroll
   of remove curse already lift it, and nothing new is needed to be rid
   of one.  Not every cursed item carries one; most are only stuck fast.

   `id` is what the code asks for, `n` what the panel calls it. */
var CURSES = [
  { id: 'water', n: 'water intolerance', p: 50,
    txt: 'water burns you', long: 'Water burns. Wading, a doused trap, a thrown flask - all of it.' },
  { id: 'squib', n: 'the squib', p: 50,
    txt: 'no magic will work', long: 'No magic works in your hands. Wands, scrolls, rings and runes all fizzle.' }
];
/* how much a turn in the water costs the intolerant */
var CURSE_WATER_DAMAGE = 5;
/* the chance a cursed thing carries a named curse rather than simply
   refusing to come off */
var NAMED_CURSE_PCT = 40;
/* the puff of white that says the magic did not happen */
var FIZZLE_COL = '#ffffff';
/* and the blue of water that is doing you harm */
var WATER_BURN_COL = '#74d6e8';

var HINTS = [
  "It's easier to hit far away enemies with arrows or throwing weapons. Once they get closer than four squares, they are harder to hit.",
  'Step out of a creature\u2019s sight for two turns and it loses track of you. Come back at it and the first blow catches it off guard.',
  'Water slows you down, and also most enemies. Flying things, ghosts and snakes travel through it unbothered.',
  'A fall onto moss, rubble or a rug hurts less than a fall onto stone. Falling into water hurts least of all.',
  'A spear or a throwing dagger can be hurled at range and picked up again afterwards.',
  'Bows and crossbows both take arrows. There is no need to carry two kinds.',
  'A locked door always has its key somewhere on the same floor, never in a room the door itself shuts off.',
  'Keys you never used go back where you found them when you leave the floor. Spend them before you take the stairs.',
  'A leprechaun robs you and runs for the far side of the floor. Kill it quickly or lose the gold.',
  'Throwing a rock at a trap sets it off from a safe distance.',
  'Potions can be thrown. A potion of blindness will blind what it hits, and a healing potion will heal it, so aim with care.',
  "It's much safer to identify objects with a scroll than to try them on yourself.",
  'You get one chance to try and study an unknown blade or piece of armour, but wisdom is needed to successfully identify an object \u2014 at the wisdom you start with, you will usually learn nothing.',
  'A rusty blade and a rusty coat tell you nothing about what they are worth. Put a thing on to find out - and find out at the same time whether it comes off again.',
  'Every long sword in a run looks alike until you handle one. Find a second of something you have worn and you will know it on sight.',
  'A full pack does not mean walking over a breastplate. Stand on it and press ENTER to put it on: what you were wearing goes down in its place.',
  'Not every way between two rooms has a door in it. An opening lets sight, arrows and light through - which is worth knowing before you back through one.',
  'Press ? to look around. Move the cursor over anything and the game will tell you what it is.',
  'Fighting in a doorway means only one creature can reach you at a time.',
  'Hunger creeps up on you. Eat before the game starts warning you, not after.',
  'Some walls are thinner than they look. A dead end in a corridor is worth searching.',
  'Every few levels you may take a perk or four more hit points. There is no wrong answer, but perks stack up over a long run.',
  'A wand is worth saving for something that would otherwise kill you.',
  'Armour that has rusted stays rusted. Something that protects from rust is worth wearing in a wet place.',
  'You can put things in a chest and come back for them. The chest stays where it is.',
  'A vampire hates bright light and holy water.',
  'A scroll of enchantment on a ring will not sharpen it. It shortens the wait for the next charge by a third.',
  'Hold SHIFT and the side panel gets out of the way. The arrows then move the view instead of you, so you can see what is coming.',
  'Some rooms and hallways are pitch dark. In one you can see a single square, and so can whatever is in there with you.',
  'Bats and vampires hunt in the dark as well as they do in the light. Nothing else down there does.',
  'A web spinner fights from across the room. Watch where you tread afterwards: what missed you is still on the floor.',
  'A wand of darkness puts out the light in a room. What that is worth depends on who is standing in it.',
  'Any fire lights a barrel of powder. It burns for one turn - long enough to get clear - and then takes everything within two squares, walls and other barrels included.',
  'With something hostile in plain sight, five steps without striking anything means you are running, and you may go over. Frightened creatures are worse at it than you are.',
  'A clever creature that loses you walks to the square it last saw you on and searches onward from there. Doubling back is often safer than running.',
  'Once you have hit something it knows where you are. Only breaking away for two full rounds will catch it out again.',
  'A half dragon spits fire from across the room. A flask of water puts it out, and so does making it stand in water.',
  'You cannot strike your own. Walk into an ally and the two of you change places.',
  "A monster with ? above it has not seen you. The ! symbol means it's surprised. Both cases allow for a sneak bonus attack!",
  'A cursed thing you cannot take off may carry a curse of its own. The shrine lifts both at once, and so does a scroll of remove curse.',
  'It might be worth it to return to an upper floor to use a moss cave or healing water if your character is low on HP.'
];

var MON_BY_C = {};
for (var _i = 0; _i < MONS.length; _i++) MON_BY_C[MONS[_i].c] = MONS[_i];
/* Which monsters belong at what depth.  This used to be a hand-written
   order that the game indexed by floor number, and it disagreed with the
   monsters' own levels: the first six entries were all level one, so
   floors one to three drew from an identical pool, and the order ran
   backwards in places (the dragon is the last entry but weaker than the
   griffin above it).  Difficulty is now taken from the level itself. */
var MON_BY_LEVEL = {}, MON_BY_CHAR = {};
(function () {
  for (var i = 0; i < MONS.length; i++) {
    var lv = MONS[i].lv;
    (MON_BY_LEVEL[lv] = MON_BY_LEVEL[lv] || []).push(MONS[i].c);
    MON_BY_CHAR[MONS[i].c] = MONS[i];
  }
})();
var MON_LEVELS = Object.keys(MON_BY_LEVEL).map(Number).sort(function (a, b) { return a - b; });
/* how fast the monsters you meet climb as you go down */
var MON_LEVEL_PER_FLOOR = 0.55;

/* ---------------------------------------------------------- traps */
/* spr: which tile to draw.  open: how often it is left in plain sight. */
/* spr: tile to draw.  open: how often it is left in plain sight.
   reusable: a mechanism that resets, rather than a one-shot.
   shoots: fires something you can throw yourself flat under. */
/* There was a teleport trap here.  It took the floor you had learned and
   threw you somewhere else on it for no reason you could act on, which is
   not a puzzle, only an interruption. */
/* There was a trap door here.  It dropped you several floors without
   warning, usually onto something that killed you, and there was nothing
   you could have done differently - which makes it a punishment rather
   than a trap.  Holes in the floor are still there to be fallen down;
   the difference is that you can see one and you have to walk into it. */
var TRAPS = [
  { n: 'bear trap', k: 'bear', spr: 'trap', open: 60 },
  { n: 'spike pit', k: 'spike', spr: 'trap_pit', open: 55 },
  { n: 'sleeping gas trap', k: 'sleep', spr: 'trap_gas', open: 30 },
  { n: 'arrow trap', k: 'arrow', spr: 'trap_dart', open: 40, reusable: 1, shoots: 1 },
  { n: 'dart shooter', k: 'shooter', spr: 'trap_dart', open: 25, reusable: 1, shoots: 1 },
  { n: 'poison gas trap', k: 'gas', spr: 'trap_gas', open: 30 },
  { n: 'flame jet', k: 'flame', spr: 'trap_gas', open: 45, reusable: 1, shoots: 1 },
  { n: 'alarm rune', k: 'alarm', spr: 'trap', open: 20 },
  { n: 'poison dart trap', k: 'dart', spr: 'trap_dart', open: 30, reusable: 1, shoots: 1 },
  { n: 'rust trap', k: 'rust', spr: 'trap_gas', open: 35 }
];
var GAS_TURNS_MIN = 3, GAS_TURNS_MAX = 6;
/* what a healing cloud puts back, each turn you stand in it */
var MEND_CLOUD = [1, 3];
/* what a hurled draught of strength is worth to whatever it soaks */
var POTION_STRONG_DAM = 3;
var GAS_CELLS_MIN = 4, GAS_CELLS_MAX = 8;
/* how long a splash of droplets hangs in the air */
var SPLASH_MS = 320, SPLASH_DROPS = 9;
/* how far a droplet carries, in squares - a flask breaks, it does not
   explode */
var SPLASH_REACH = 1.6;

/* the dungeon reads as depth below ground: floor -1, -2, -3 ... */
function floorName() { return '-' + G.depth; }

/* find a weapon by name, so the starting kit does not depend on the
   order of the table */
function weaponIndex(name) {
  for (var i = 0; i < WEAPONS.length; i++) if (WEAPONS[i].n === name) return i;
  return 0;
}
function scrollIndex(name) {
  for (var i = 0; i < SCROLLS.length; i++) if (SCROLLS[i].n === name) return i;
  return 0;
}
function weightedPick(list) {
  var tot = 0, i;
  for (i = 0; i < list.length; i++) tot += list[i].p;
  var r = rnd(tot);
  for (i = 0; i < list.length; i++) { r -= list[i].p; if (r < 0) return i; }
  return list.length - 1;
}

/* ============================================================ LEVEL GEN
   Rooms are carved from a boolean mask so they need not be rectangles.
   Walls are then derived from whatever touches a floor tile, which means
   any shape at all gets a correct stone border for free.
   ============================================================ */

var SHAPES = ['rect', 'rect', 'oct', 'cross', 'ell', 'oval', 'cave',
  'pillars', 'twin', 'pillar4', 'pillar4'];

function newLevelObj(depth) {
  return {
    depth: depth, mw: MAP_W, mh: MAP_H,
    tiles: new Uint8Array(MAP_W * MAP_H),
    flags: new Uint8Array(MAP_W * MAP_H),
    roomAt: new Int8Array(MAP_W * MAP_H).fill(-1),
    rooms: [], items: [], mons: [], traps: [], decor: {},
    locks: {}, doorMat: {}, temp: {}, corpses: [], clouds: [], sealed: {},
    barrels: {}, fuses: {}, burning: {}, webs: {}, showAt: {}, arch: {}, cornerKept: {}, caged: {}, under: {}, bspan: {}, keyHomes: {}, rugId: {}, rugs: 0,
    darkHall: {}, shrine: null, alchemy: null, special: null,
    wanderLeft: WANDER_BUDGET + ((depth / WANDER_BUDGET_PER_DEPTH) | 0),
    stair: { x: 0, y: 0 }
  };
}

function blankMask(w, h) {
  var m = [], y, x;
  for (y = 0; y < h; y++) { m.push([]); for (x = 0; x < w; x++) m[y].push(false); }
  return m;
}
function fillMask(m, w, h, v) { for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) m[y][x] = v; }

function shapeMask(w, h, shape) {
  var m = blankMask(w, h), x, y;
  if (w < 5 || h < 4) shape = 'rect';
  switch (shape) {
    case 'rect':
      fillMask(m, w, h, true); break;

    case 'oct': {
      fillMask(m, w, h, true);
      var c = 1 + rnd(Math.max(1, Math.min(w, h) >> 2));
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        var dl = x + y, dr = (w - 1 - x) + y;
        var bl = x + (h - 1 - y), br = (w - 1 - x) + (h - 1 - y);
        if (dl < c || dr < c || bl < c || br < c) m[y][x] = false;
      }
      break;
    }
    case 'cross': {
      var vb = 2 + rnd(Math.max(1, w - 4));
      var hb = 2 + rnd(Math.max(1, h - 3));
      var vx = (w - vb) >> 1, hy = (h - hb) >> 1;
      for (y = 0; y < h; y++) for (x = 0; x < w; x++)
        m[y][x] = (x >= vx && x < vx + vb) || (y >= hy && y < hy + hb);
      break;
    }
    case 'ell': {
      fillMask(m, w, h, true);
      var qw = 2 + rnd(Math.max(1, w - 3)), qh = 2 + rnd(Math.max(1, h - 2));
      var qx = rnd(2) ? 0 : w - qw, qy = rnd(2) ? 0 : h - qh;
      for (y = qy; y < qy + qh && y < h; y++)
        for (x = qx; x < qx + qw && x < w; x++) m[y][x] = false;
      break;
    }
    case 'oval': {
      var rx = (w - 1) / 2, ry = (h - 1) / 2;
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        var ex = (x - rx) / (rx + 0.42), ey = (y - ry) / (ry + 0.42);
        m[y][x] = (ex * ex + ey * ey) <= 1;
      }
      break;
    }
    case 'cave': {
      fillMask(m, w, h, true);
      for (var pass = 0; pass < 2; pass++) {
        var snap = [];
        for (y = 0; y < h; y++) snap.push(m[y].slice());
        for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
          if (!snap[y][x]) continue;
          var edge = (x === 0 || y === 0 || x === w - 1 || y === h - 1);
          if (!edge) {
            if (!snap[y - 1][x] || !snap[y + 1][x] || !snap[y][x - 1] || !snap[y][x + 1]) edge = true;
          }
          if (edge && rnd(100) < 28) m[y][x] = false;
        }
      }
      break;
    }
    case 'pillars': {
      fillMask(m, w, h, true);
      if (w >= 7 && h >= 5) {
        /* A hall has a few pillars, not a forest of them: the old rule
           studded every other square and a big room came out as a grid. */
        var spots = [];
        for (y = 2; y < h - 2; y += 2) for (x = 2; x < w - 2; x += 2) spots.push([x, y]);
        shuffle(spots);
        var want = Math.min(PILLARS_MAX, 1 + rnd(PILLARS_MAX), spots.length);
        for (var pi = 0; pi < want; pi++) m[spots[pi][1]][spots[pi][0]] = false;
      }
      break;
    }
    case 'pillar4': {
      /* one square pillar of four wall tiles in the middle of the room */
      fillMask(m, w, h, true);
      if (w >= 6 && h >= 5) {
        var px0 = (w >> 1) - 1, py0 = (h >> 1) - 1;
        m[py0][px0] = false; m[py0][px0 + 1] = false;
        m[py0 + 1][px0] = false; m[py0 + 1][px0 + 1] = false;
      }
      break;
    }
    case 'twin': {
      var aw = 3 + rnd(Math.max(1, w - 3)), ah = 2 + rnd(Math.max(1, h - 2));
      var ax = rnd(w - aw + 1), ay = rnd(h - ah + 1);
      var bw = 3 + rnd(Math.max(1, w - 3)), bh = 2 + rnd(Math.max(1, h - 2));
      var bx = rnd(w - bw + 1), by = rnd(h - bh + 1);
      for (y = ay; y < ay + ah; y++) for (x = ax; x < ax + aw; x++) m[y][x] = true;
      for (y = by; y < by + bh; y++) for (x = bx; x < bx + bw; x++) m[y][x] = true;
      break;
    }
  }
  return largestBlob(m, w, h);
}

/* keep only the biggest 4-connected component so a room is never split */
function largestBlob(m, w, h) {
  var lab = blankMask(w, h), best = null, bestN = 0, x, y;
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    if (!m[y][x] || lab[y][x]) continue;
    var q = [[x, y]], cells = [];
    lab[y][x] = true;
    while (q.length) {
      var c = q.pop(); cells.push(c);
      for (var d = 0; d < 4; d++) {
        var nx = c[0] + DIR4[d][0], ny = c[1] + DIR4[d][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (!m[ny][nx] || lab[ny][nx]) continue;
        lab[ny][nx] = true; q.push([nx, ny]);
      }
    }
    if (cells.length > bestN) { bestN = cells.length; best = cells; }
  }
  var out = blankMask(w, h);
  if (best) for (var i = 0; i < best.length; i++) out[best[i][1]][best[i][0]] = true;
  return { mask: out, count: bestN };
}

/* Scatter rooms across the floor at random, keeping a lane of raw rock
   between any two of them so a corridor can run down it.  Nothing is on a
   grid, so no two floors have the same rhythm. */
function scatterRooms() {
  /* Fewer, roomier chambers: a floor of big spaces joined by a handful of
     passages reads better than a warren of little ones. */
  var target = clamp(Math.round(MAP_W * MAP_H / 205), 5, 10);
  var rects = [], tries = 0;
  while (rects.length < target && tries++ < 1600) {
    var fw = 8 + rnd(11), fh = 6 + rnd(7);
    if (fw > MAP_W - 6) fw = MAP_W - 6;
    if (fh > MAP_H - 6) fh = MAP_H - 6;
    var rx = 2 + rnd(Math.max(1, MAP_W - fw - 3));
    var ry = 2 + rnd(Math.max(1, MAP_H - fh - 3));
    var clash = 0;
    for (var q = 0; q < rects.length; q++) {
      var o = rects[q];
      /* three tiles clear: their wall, a rock lane, our wall */
      if (rx - 3 < o.x + o.w && rx + fw + 3 > o.x &&
          ry - 3 < o.y + o.h && ry + fh + 3 > o.y) { clash = 1; break; }
    }
    if (!clash) rects.push({ x: rx, y: ry, w: fw, h: fh });
  }
  return rects;
}

/* Two doorways side by side read as a mistake.  Nearly all of them are
   headed off while the corridors are dug; the handful that survive are
   load bearing on both sides, and the cheapest cure for those is to deal
   the floor again. */
function touchingDoors(L) {
  var T = L.tiles, i, d;
  for (i = 0; i < T.length; i++) {
    var t = T[i];
    if (t !== DOOR && t !== SDOOR && t !== LOCKED) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0;
    if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
    for (d = 0; d < 4; d++) {
      var n = T[(y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0])];
      if (n === DOOR || n === SDOOR || n === LOCKED) return true;
    }
  }
  return false;
}

function genLevel(depth) {
  var L, best = null;
  for (var attempt = 0; attempt < 10; attempt++) {
    L = genLevelOnce(depth);
    if (touchingDoors(L)) continue;
    /* and nowhere walled off by accident: a stranded corridor stub is
       cheaper to re-deal than to repair */
    if (!everywhereReachable(L)) { best = best || L; continue; }
    return L;
  }
  return best || L;
}

/* A spring of holy water: a small blob of bright water inside a course of
   dressed stone.  There are only ever two or three in the whole dungeon,
   and never two on the same floor. */
function pickHolyFloors() {
  var n = HOLY_MIN + rnd(HOLY_MAX - HOLY_MIN + 1), out = [], guard = 0;
  while (out.length < n && guard++ < 200) {
    var d = 2 + rnd(23);
    if (out.indexOf(d) < 0) out.push(d);
  }
  return out;
}
/* ================================================== special rooms
   Most rooms are somewhere to fight in.  A few are somewhere to make a
   decision in, and those are the ones you remember.  At most one per
   floor, in a room big enough to be worth the walk. */
var SPECIAL_CHANCE = 42;          /* per floor, if a room will take one */

function roomOpenSpots(L, r) {
  var out = [], i;
  for (i = 0; i < r.floors.length; i++) {
    var x = r.floors[i][0], y = r.floors[i][1];
    if (L.tiles[y * MAP_W + x] !== FLOOR) continue;
    if (x === L.stair.x && y === L.stair.y) continue;
    if (itemAt(L, x, y)) continue;
    if (decorHides(x, y, L)) continue;      /* nothing goes under a table */
    out.push([x, y]);
  }
  shuffle(out);
  return out;
}

/* --- the nursery: a brood asleep, and something worth waking them for */
function makeNursery(L, r, depth) {
  var spots = roomOpenSpots(L, r);
  if (spots.length < 8) return false;
  /* A brood is by definition several of one kind, so the kind must be
     one there can be several of.  A nursery of leprechauns put seven of
     the one-to-a-floor thief on a single floor. */
  var c = null, i;
  for (i = 0; i < 24 && !c; i++) {
    var cand = randMonsterChar(depth);
    if (!MON_BY_CHAR[cand] || !MON_BY_CHAR[cand].only) c = cand;
  }
  if (!c) return false;
  var n = 5 + rnd(4);
  for (i = 0; i < n && i < spots.length - 1; i++) {
    if (monAt(L, spots[i][0], spots[i][1])) continue;
    var m = mkMonster(c, depth, spots[i][0], spots[i][1]);
    m.state = 0;                  /* fast asleep, every one of them */
    m.home = r.idx;
    L.mons.push(m);
  }
  /* the last open spot, unless that happens to be the doorway - a chest
     in the mouth of a door corks the only way in */
  var cs = null;
  for (i = spots.length - 1; i >= 0 && !cs; i--)
    if (!blocksDoorway(spots[i][0], spots[i][1], L)) cs = spots[i];
  if (!cs) cs = spots[spots.length - 1];
  var chest = mkChest(depth, 0, 1);
  chest.x = cs[0];
  chest.y = cs[1];
  L.items.push(chest);
  r.special = 'nursery';
  return true;
}

/* --- the shrine: every curse lifted, for a piece of you */
function makeShrine(L, r, depth) {
  var spots = roomOpenSpots(L, r);
  if (!spots.length) return false;
  var at = spots[0];
  L.tiles[at[1] * MAP_W + at[0]] = HOLY;
  L.shrine = { x: at[0], y: at[1], used: 0 };
  /* a ring of bones round it, so it reads as a place people came to */
  for (var d = 0; d < 8; d++) {
    var bx = at[0] + DIR8[d][0], by = at[1] + DIR8[d][1];
    if (L.tiles[by * MAP_W + bx] !== FLOOR) continue;
    if (itemAt(L, bx, by)) continue;          /* never bury the loot */
    if (L.decor[by * MAP_W + bx]) continue;   /* nor paint over the cracks */
    if (rnd(100) < 55) L.decor[by * MAP_W + bx] = rnd(2) ? 'bones' : 'skull';
  }
  r.special = 'shrine';
  return true;
}

/* --- the alchemist's cell: shelves of unknowns, and one answer */
function makeAlchemist(L, r, depth) {
  var spots = roomOpenSpots(L, r);
  if (spots.length < 10) return false;
  var n = 7 + rnd(4), i;
  for (i = 0; i < n && i < spots.length - 1; i++) {
    var pot = mkItem('potion', weightedPick(POTIONS));
    pot.x = spots[i][0]; pot.y = spots[i][1];
    delete L.decor[pot.y * MAP_W + pot.x];
    L.items.push(pot);
  }
  var at = spots[spots.length - 1];
  L.tiles[at[1] * MAP_W + at[0]] = HOLY;
  L.alchemy = { x: at[0], y: at[1], used: 0 };
  r.special = 'alchemist';
  return true;
}

/* Take the furnishings out of a room.  Rooms are dressed before anybody
   decides what they are, so a room chosen to be something in particular
   starts by clearing what was put in it. */
function clearDecor(L, r) {
  var i, lifted = 0;
  for (i = 0; i < r.floors.length; i++) {
    var j = r.floors[i][1] * MAP_W + r.floors[i][0];
    var d = L.decor[j];
    if (!d || !FURNISHINGS[d] && !isRugName(d)) continue;
    delete L.decor[j];
    if (L.rugId) delete L.rugId[j];
    if (L.barrels) delete L.barrels[j];
    lifted++;
  }
  return lifted;
}

/* --- the moss garden: rest here, but something will find you */
function makeMossGarden(L, r, depth) {
  var i;
  if (r.floors.length < 12) return false;
  /* Clear the room out first.  It is furnished before anybody decides
     what it is, and a rug laid over most of the floor left a garden with
     moss on three squares of fifteen - the rest of it was carpet. */
  clearDecor(L, r);
  /* And nothing underfoot.  It is the one room on the floor you can stop
     in, and a trap in it makes stopping the mistake. */
  for (i = L.traps.length - 1; i >= 0; i--) {
    var tp = L.traps[i];
    if (L.roomAt[tp.y * MAP_W + tp.x] === r.idx) L.traps.splice(i, 1);
  }
  for (i = 0; i < r.floors.length; i++) {
    var x = r.floors[i][0], y = r.floors[i][1];
    if (L.tiles[y * MAP_W + x] !== FLOOR) continue;
    if (L.decor[y * MAP_W + x]) continue;
    if (itemAt(L, x, y)) continue;
    if (rnd(100) < 88) L.decor[y * MAP_W + x] = pick(MOSS_FIELD);
  }
  r.special = 'moss';
  r.lit = 0;                       /* dim and overgrown */
  /* moss does not hide anything, so the room is still usable */
  return true;
}

/* How many separate pieces the walkable floor is in.  Sealed rooms and
   rooms behind a secret door are pieces of their own and always were, so
   the number is only ever used to compare a floor against itself.  Ask
   for the list and it hands back the pieces themselves. */
function openParts(L, barrelsSolid, wantList) {
  var T = L.tiles, n = T.length, seen = new Uint8Array(n), out = [], i, d;
  function open(j) {
    return walkTile(T[j]) && !(barrelsSolid && L.barrels && L.barrels[j]);
  }
  for (i = 0; i < n; i++) {
    if (seen[i] || !open(i)) continue;
    var st = [i], comp = [];
    seen[i] = 1;
    while (st.length) {
      var j = st.pop(), x = j % MAP_W, y = (j / MAP_W) | 0;
      comp.push(j);
      for (d = 0; d < DIR4.length; d++) {
        var k = (y + DIR4[d][1]) * MAP_W + x + DIR4[d][0];
        if (k < 0 || k >= n || seen[k] || !open(k)) continue;
        seen[k] = 1; st.push(k);
      }
    }
    out.push(comp);
  }
  return wantList ? out : out.length;
}

/* A door has to be a door: stone on one side and a way through on the
   other.  A corridor that arrives two squares wide, or a room that opens
   out beside one, leaves a door standing in the open with floor all round
   it - which reads as a door dropped in the middle of a room, because
   that is what it is.

   It is not a door, so it stops being one and becomes the opening it
   already was: hallway where it adjoins hallway, room floor where it
   adjoins nothing but room. */
function tidyDoors(L) {
  var T = L.tiles, n = T.length, i, d, fixed = 0;
  /* Anything you cannot walk onto counts as the jamb, not just dressed
     stone: a door set into a line of iron bars is a door, and listing the
     two kinds of wall by hand opened the mint. */
  function solid(v) { return !walkTile(v); }
  for (i = 0; i < n; i++) {
    var t = T[i];
    /* A locked door is there on purpose and something is behind it.  If
       one of those ever looks loose, leave it: opening a vault is a
       worse fault than a door in an odd place. */
    if (t !== DOOR && t !== SDOOR) continue;
    if (L.locks[i]) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0;
    if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
    var up = T[i - MAP_W], dn = T[i + MAP_W], lf = T[i - 1], rt = T[i + 1];
    if ((solid(up) && solid(dn)) || (solid(lf) && solid(rt))) continue;
    /* not set in anything: whatever it is, it is not a door */
    var corridor = 0;
    for (d = 0; d < DIR4.length; d++)
      if (T[(y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0])] === CORR) corridor = 1;
    T[i] = (corridor && L.roomAt[i] < 0) ? CORR : FLOOR;
    delete L.locks[i];
    delete L.doorMat[i];
    fixed++;
  }
  return fixed;
}

/* Nothing stands on a barrel, so a barrel can wall a way through.  Take
   out any that does. */
function tidyBarrels(L) {
  var removed = 0, guard = 0, i, d;
  while (guard++ < 30 && openParts(L, 1) > openParts(L, 0)) {
    /* Find the piece of floor that has been cut off and take away a
       barrel standing on the edge of it.

       Trying each barrel in turn and keeping whichever one joined the
       most floor back on sounds equivalent and is not: two barrels can
       plug a way through together, and with one of them still in place
       taking the other away joins nothing, so every candidate scored the
       same and nothing was ever removed. */
    var parts = openParts(L, 1, 1), got = 0;
    parts.sort(function (a, b) { return a.length - b.length; });
    /* A loose barrel goes before one out of a store: a store is a room
       somebody built, and a loose barrel is only a barrel. */
    for (var pass = 0; pass < 2 && !got; pass++) {
      for (i = 0; i < parts.length && !got; i++) {
        var comp = parts[i];
        for (var c = 0; c < comp.length && !got; c++) {
          var x = comp[c] % MAP_W, y = (comp[c] / MAP_W) | 0;
          for (d = 0; d < DIR4.length; d++) {
            var k = (y + DIR4[d][1]) * MAP_W + x + DIR4[d][0];
            if (k < 0 || k >= L.tiles.length || !L.barrels[k]) continue;
            var ri = L.roomAt[k];
            var store = ri >= 0 && L.rooms[ri] && L.rooms[ri].special === 'powder';
            if (!pass && store) continue;
            delete L.barrels[k];
            delete L.decor[k];
            removed++; got = 1;
            break;
          }
        }
      }
    }
    if (!got) break;                 /* nothing left that a barrel is doing */
  }
  return removed + tidyStores(L);
}

/* A powder store is a pile: every barrel touches another, so one going up
   takes the lot.  Taking a barrel out of one to clear a way through can
   leave a barrel, or a clump of them, standing on its own - and a barrel
   on its own in a powder store is a thing that does not go off when the
   rest of the room does.  Keep the biggest clump and clear the strays. */
function tidyStores(L) {
  var removed = 0, i, k, d;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || r.special !== 'powder') continue;
    var mine = [];
    for (k in L.barrels) if (L.roomAt[k | 0] === r.idx) mine.push(k | 0);
    if (mine.length < 2) continue;
    var inSet = {};
    for (k = 0; k < mine.length; k++) inSet[mine[k]] = 1;
    var seen = {}, best = null;
    for (k = 0; k < mine.length; k++) {
      if (seen[mine[k]]) continue;
      var st = [mine[k]], clump = [];
      seen[mine[k]] = 1;
      while (st.length) {
        var j = st.pop(), x = j % MAP_W, y = (j / MAP_W) | 0;
        clump.push(j);
        for (d = 0; d < DIR8.length; d++) {
          var n2 = (y + DIR8[d][1]) * MAP_W + (x + DIR8[d][0]);
          if (!inSet[n2] || seen[n2]) continue;
          seen[n2] = 1; st.push(n2);
        }
      }
      if (!best || clump.length > best.length) best = clump;
    }
    if (!best) continue;
    var keep = {};
    for (k = 0; k < best.length; k++) keep[best[k]] = 1;
    for (k = 0; k < mine.length; k++) {
      if (keep[mine[k]]) continue;
      delete L.barrels[mine[k]];
      delete L.decor[mine[k]];
      removed++;
    }
  }
  return removed;
}

/* --- the powder store: barrels, and a very short argument */
function makePowderStore(L, r, depth) {
  var spots = roomOpenSpots(L, r);
  if (spots.length < 6) return false;
  /* Stacked against each other, not scattered - a barrel across the room
     from the rest is not a powder store, it is a barrel.  Grow the pile
     outward from one spot so every barrel touches another.

     Nothing stands on a barrel, so the pile must not wall the room off
     either.  Each one is refused as it is put down rather than taken away
     afterwards: a pile tidied afterwards loses barrels out of its middle
     and stops being a pile, and a barrel that is refused must never have
     been part of it, or the next one grows off a square that is not
     there and the pile comes apart in two halves. */
  var want = 5 + rnd(5), i, d;
  var free = {};
  for (i = 0; i < spots.length; i++) free[spots[i][1] * MAP_W + spots[i][0]] = 1;
  L.barrels = L.barrels || {};
  var parts = openParts(L, 1), laid = [];
  function put(x, y) {
    var j = y * MAP_W + x;
    L.decor[j] = 'barrel';
    L.barrels[j] = 1;
    if (openParts(L, 1) > parts) {
      delete L.decor[j]; delete L.barrels[j];
      return 0;
    }
    laid.push(j);
    return 1;
  }
  function takeItAllBack() {
    for (var q = 0; q < laid.length; q++) {
      delete L.decor[laid[q]]; delete L.barrels[laid[q]];
    }
  }
  var taken = {};
  taken[spots[0][1] * MAP_W + spots[0][0]] = 1;
  if (!put(spots[0][0], spots[0][1])) return false;
  var pile = [spots[0]], guard = 0;
  while (pile.length < want && guard++ < 200) {
    var from = pile[rnd(pile.length)];
    d = rnd(8);
    var nx = from[0] + DIR8[d][0], ny = from[1] + DIR8[d][1], k = ny * MAP_W + nx;
    if (!free[k] || taken[k]) continue;
    taken[k] = 1;                       /* tried, whether it went down or not */
    if (!put(nx, ny)) continue;
    pile.push([nx, ny]);
  }
  if (pile.length < 4) { takeItAllBack(); return false; }
  r.special = 'powder';
  return true;
}

/* --- and one left standing about, away from the store
   A lone barrel is a hazard rather than a room, and it wants clear ground
   round it: not tucked into a doorway, not under a staircase, and never
   touching another one.  Two barrels side by side are the beginning of a
   pile, and a pile belongs in the powder store.

   This runs after the floor has stopped changing, for the same reason the
   moss does - a barrel placed before the streams are cut can end up in
   the water. */
function scatterBarrels(L, depth) {
  if (depth < STRAY_BARREL_DEPTH) return 0;
  if (rnd(100) >= STRAY_BARREL_PCT) return 0;
  L.barrels = L.barrels || {};
  var want = 1 + rnd(STRAY_BARREL_MAX), put = 0, tries = 0;
  while (put < want && tries++ < want * 40) {
    var r = randRoom(L);
    if (!r || r.gone || r.special === 'powder') continue;
    var s = randSpot(L, r), j = s.y * MAP_W + s.x;
    if (L.tiles[j] !== FLOOR || L.decor[j]) continue;
    if (s.x === L.stair.x && s.y === L.stair.y) continue;
    if (L.up && s.x === L.up.x && s.y === L.up.y) continue;
    if (itemAt(L, s.x, s.y) || trapAtLevel(L, s.x, s.y)) continue;
    var ok = 1;
    for (var d = 0; d < DIR8.length; d++) {
      var nx = s.x + DIR8[d][0], ny = s.y + DIR8[d][1];
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) { ok = 0; break; }
      var k = ny * MAP_W + nx, t = L.tiles[k];
      if (L.barrels[k]) { ok = 0; break; }
      if (t === DOOR || t === STAIR || t === STAIR_UP) { ok = 0; break; }
    }
    if (!ok) continue;
    L.decor[j] = 'barrel';
    L.barrels[j] = 1;
    put++;
  }
  return put;
}

/* --- the mint: gold you can see and cannot reach without the key */
function makeMint(L, r, depth) {
  if (r.w < 6 || r.h < 4) return false;
  /* cut the room in two with a line of bars, and put the money behind */
  var vertical = r.w >= r.h;
  var cut = vertical ? r.x + 2 + rnd(Math.max(1, r.w - 4))
                     : r.y + 2 + rnd(Math.max(1, r.h - 4));
  var behind = [], bars = [], i;
  for (i = 0; i < r.floors.length; i++) {
    var x = r.floors[i][0], y = r.floors[i][1];
    if (L.tiles[y * MAP_W + x] !== FLOOR) continue;
    var v = vertical ? x : y;
    if (v === cut) bars.push([x, y]);
    else if (v > cut) behind.push([x, y]);
  }
  /* three bars at least: one becomes the locked gate, and a grille of
     a single bar is not a grille */
  if (bars.length < 3 || behind.length < 3) return false;
  /* the way in must not be on the wrong side of the grille */
  if (roomHolds(r, L.stair.x, L.stair.y)) {
    var sv = vertical ? L.stair.x : L.stair.y;
    if (sv >= cut) return false;
  }
  /* and there must be no door round the back, or the grille guards
     nothing at all - which is worse than not building it */
  var ds = roomDoors(L, r), di;
  for (di = 0; di < ds.length; di++) {
    var dxr = ds[di] % MAP_W, dyr = (ds[di] / MAP_W) | 0;
    if ((vertical ? dxr : dyr) >= cut) return false;
  }
  /* nor any other way in that is not a door */
  for (i = 0; i < behind.length; i++) {
    var bxq = behind[i][0], byq = behind[i][1];
    for (var q = 0; q < 4; q++) {
      var nx = bxq + DIR4[q][0], ny = byq + DIR4[q][1];
      if (roomHolds(r, nx, ny)) continue;
      if (walkTile(L.tiles[ny * MAP_W + nx])) return false;
    }
  }
  var undo = [];
  for (i = 0; i < bars.length; i++) {
    undo.push([bars[i][1] * MAP_W + bars[i][0], L.tiles[bars[i][1] * MAP_W + bars[i][0]]]);
    L.tiles[bars[i][1] * MAP_W + bars[i][0]] = BARS;
  }
  /* Rooms are not all rectangles.  A straight line of bars across a
     cross or an ell can leave a way round the end of it, so prove the
     far side really is cut off before putting anything valuable there. */
  var nearFrom = null;
  for (i = 0; i < r.floors.length; i++) {
    var fx0 = r.floors[i][0], fy0 = r.floors[i][1];
    if (L.tiles[fy0 * MAP_W + fx0] !== FLOOR) continue;
    if ((vertical ? fx0 : fy0) < cut) { nearFrom = [fx0, fy0]; break; }
  }
  var sealedOK = false;
  if (nearFrom) {
    var reach = reachSet(L, nearFrom[0], nearFrom[1], true);
    sealedOK = true;
    for (i = 0; i < behind.length; i++)
      if (reach[behind[i][1] * MAP_W + behind[i][0]]) { sealedOK = false; break; }
  }
  if (!sealedOK) {
    for (i = 0; i < undo.length; i++) L.tiles[undo[i][0]] = undo[i][1];
    return false;
  }
  shuffle(behind);
  /* Nobody starts the floor already inside the cage - it would hand you
     the gold and leave the key pointless. */
  for (i = 0; i < behind.length; i++)
    L.caged[behind[i][1] * MAP_W + behind[i][0]] = 1;
  var piles = Math.min(behind.length, 4 + rnd(4));
  for (i = 0; i < piles; i++) {
    var g = mkItem('gold', 0);
    g.cnt = 120 + rnd(200 + depth * 40);
    g.x = behind[i][0]; g.y = behind[i][1];
    delete L.decor[g.y * MAP_W + g.x];
    L.items.push(g);
  }
  /* and one way in, locked, in the line of bars */
  var door = bars[(bars.length / 2) | 0];
  var mat = 1 + rnd(MATS.length - 1);
  L.tiles[door[1] * MAP_W + door[0]] = LOCKED;
  L.locks[door[1] * MAP_W + door[0]] = mat;
  L.doorMat[door[1] * MAP_W + door[0]] = mat;
  r.special = 'mint';
  r.mintBars = bars.length;
  return true;
}

var SPECIAL_ROOMS = [
  { n: 'nursery', f: makeNursery, min: 2 },
  { n: 'shrine', f: makeShrine, min: 1 },
  { n: 'alchemist', f: makeAlchemist, min: 2 },
  { n: 'moss', f: makeMossGarden, min: 1 },
  { n: 'powder', f: makePowderStore, min: 3 },
  { n: 'mint', f: makeMint, min: 4 }
];

/* Is there a staircase anywhere in this room?  r.floors is the list from
   when the room was carved, and a square can have become something else
   since - so ask the map, not the list. */
function roomHasStair(L, r) {
  for (var i = 0; i < r.floors.length; i++) {
    var t = L.tiles[r.floors[i][1] * MAP_W + r.floors[i][0]];
    if (t === STAIR || t === STAIR_UP) return true;
  }
  return false;
}

function addSpecialRoom(L, depth) {
  if (rnd(100) >= SPECIAL_CHANCE) return null;
  var rooms = [], i;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || r.sealed || r.special) continue;
    if (r.floors.length < 10) continue;
    if (roomHolds(r, L.stair.x, L.stair.y)) continue;
    if (L.up && roomHolds(r, L.up.x, L.up.y)) continue;
    /* and nothing with a staircase actually cut into it, whatever the
       room's own list of floors says */
    if (roomHasStair(L, r)) continue;
    rooms.push(r);
  }
  if (!rooms.length) return null;
  shuffle(rooms);
  var kinds = SPECIAL_ROOMS.slice();
  shuffle(kinds);
  for (i = 0; i < kinds.length; i++) {
    if (depth < kinds[i].min) continue;
    for (var j = 0; j < rooms.length; j++)
      if (kinds[i].f(L, rooms[j], depth)) return kinds[i].n;
  }
  return null;
}

function addHolyPool(L) {
  var tries, i, r, best = null;
  for (tries = 0; tries < 40 && !best; tries++) {
    r = L.rooms[rnd(L.rooms.length)];
    if (r.gone || r.floors.length < 14) continue;
    best = r;
  }
  if (!best) return false;

  /* Site it in open floor rather than jammed against a wall: try a dozen
     spots and take the one with the most room around it. */
  var c0 = null, c0score = -1, t2;
  for (t2 = 0; t2 < 14; t2++) {
    var cand = best.floors[rnd(best.floors.length)];
    var score = 0;
    for (var sy = -2; sy <= 2; sy++) for (var sx = -2; sx <= 2; sx++) {
      var qx = cand[0] + sx, qy = cand[1] + sy;
      if (qx < 0 || qy < 0 || qx >= MAP_W || qy >= MAP_H) continue;
      if (L.tiles[qy * MAP_W + qx] === FLOOR) score++;
    }
    if (score > c0score) { c0score = score; c0 = cand; }
  }
  if (!c0) return false;

  var cells = [], seen = {};
  var shape = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  if (rnd(100) < 45) shape.push([1, 1]);
  for (i = 0; i < shape.length; i++) {
    var x = c0[0] + shape[i][0], y = c0[1] + shape[i][1], j = y * MAP_W + x;
    if (L.tiles[j] !== FLOOR) continue;
    if (x === L.stair.x && y === L.stair.y) continue;
    if (seen[j]) continue;
    seen[j] = 1; cells.push([x, y, j]);
  }
  if (cells.length < 3) return false;

  /* the pool must not seal anything off, so keep a walkable ring */
  for (i = 0; i < cells.length; i++) L.tiles[cells[i][2]] = HOLY;
  /* dressed stone all round the edge */
  for (i = 0; i < cells.length; i++) {
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      var nx = cells[i][0] + dx, ny = cells[i][1] + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var k = ny * MAP_W + nx;
      if (L.tiles[k] === FLOOR && !L.decor[k]) L.decor[k] = 'kerb';
    }
  }
  L.holy = { x: cells[0][0], y: cells[0][1], n: cells.length };
  return true;
}

/* A table in the middle of a room with chairs drawn up to it.  Furniture
   is scenery: you walk round it because it looks like something, not
   because the game stops you. */
function furnishRoom(L, r) {
  if (r.floors.length < 20) return false;
  var cx0 = r.cx, cy0 = r.cy, j = cy0 * MAP_W + cx0;
  if (L.tiles[j] !== FLOOR || L.decor[j]) return false;
  if (cx0 === L.stair.x && cy0 === L.stair.y) return false;
  L.decor[j] = 'table';
  var placed = 1, d;
  for (d = 0; d < 4; d++) {
    if (rnd(100) < 30) continue;               /* not every seat is taken */
    var x = cx0 + DIR4[d][0], y = cy0 + DIR4[d][1], k = y * MAP_W + x;
    if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
    if (L.tiles[k] !== FLOOR || L.decor[k]) continue;
    if (x === L.stair.x && y === L.stair.y) continue;
    L.decor[k] = 'chair';
    placed++;
  }
  return placed > 1;
}

/* Can you still walk to every square you could walk to before? */
/* Is every square you could walk on still connected to every other?  A
   secret door counts as a way through, since searching will find it.

   This runs inside the generator's retry loop and inside sealRoom's
   candidate search, so it walks the tile array as few times as it can and
   allocates nothing. */
var _walkList = null, _hiddenList = null;
/* A stream, or a gap in the floor, running clean across a room from one
   wall to the other - and one bridge over it, so the room is still one
   room.  Without the bridge a chasm would cut the floor in half.

   The band has to reach both walls or it is a pool, not a stream, so
   every row (or column) it crosses must have floor in it. */
function addStream(L, r, liquid) {
  var T = L.tiles, x, y, i;
  if (r.floors.length < 24) return 0;
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (i = 0; i < r.floors.length; i++) {
    var f = r.floors[i];
    if (f[0] < x0) x0 = f[0]; if (f[0] > x1) x1 = f[0];
    if (f[1] < y0) y0 = f[1]; if (f[1] > y1) y1 = f[1];
  }
  /* Either way, if the room can take it.  Always following the longer
     axis meant nine streams in ten ran down the room and the ones that
     ran across it were a rarity. */
  var canV = (x1 - x0) >= 6 && (y1 - y0 + 1) >= 3;
  var canH = (y1 - y0) >= 6 && (x1 - x0 + 1) >= 3;
  var vert;
  if (canV && canH) vert = rnd(2) === 0;
  else if (canV) vert = true;
  else if (canH) vert = false;
  else return 0;
  var lo = vert ? x0 : y0, hi = vert ? x1 : y1;
  var across = vert ? (y1 - y0 + 1) : (x1 - x0 + 1);
  if (hi - lo < 6 || across < 3) return 0;
  var wide = 1 + (rnd(100) < 40 ? 1 : 0);
  /* leave at least two columns of dry room on each bank */
  var at = lo + 2 + rnd(Math.max(1, (hi - lo - 3) - wide));

  /* collect the band, and refuse if it does not span or if it would
     drown something that is already there */
  var band = [], rows = {};
  for (i = 0; i < r.floors.length; i++) {
    var fx = r.floors[i][0], fy = r.floors[i][1];
    var alongPos = vert ? fx : fy;
    if (alongPos < at || alongPos >= at + wide) continue;
    var j = fy * MAP_W + fx;
    if (T[j] !== FLOOR) return 0;
    if (L.decor[j] || itemAt(L, fx, fy) || trapAtLevel(L, fx, fy)) return 0;
    band.push([fx, fy, j]);
    rows[vert ? fy : fx] = (rows[vert ? fy : fx] || 0) + 1;
  }
  var keys = Object.keys(rows);
  if (keys.length !== across) return 0;          /* a gap: not a stream */
  for (i = 0; i < keys.length; i++)
    if (rows[keys[i]] !== wide) return 0;        /* ragged: not a stream */

  /* Both banks have to be dry floor the whole way along.  Where a room
     narrows, a band can end up with stone on one side of it - and a gap
     wedged against a wall has nowhere to lay the cracked flagstones that
     warn you it is there. */
  for (i = 0; i < band.length; i++) {
    var lx = vert ? at - 1 : band[i][0], ly = vert ? band[i][1] : at - 1;
    var rx = vert ? at + wide : band[i][0], ry = vert ? band[i][1] : at + wide;
    if (T[ly * MAP_W + lx] !== FLOOR || T[ry * MAP_W + rx] !== FLOOR) return 0;
  }

  /* the crossing: one whole row (or column) of the band, not at the very
     end of it, so the bridge sits in the room rather than in a doorway */
  var cross = (vert ? y0 : x0) + 1 + rnd(Math.max(1, across - 2));

  for (i = 0; i < band.length; i++) {
    var bx = band[i][0], by = band[i][1], bj = band[i][2];
    if ((vert ? by : bx) === cross) {
      T[bj] = BRIDGE;
      L.under[bj] = liquid;
      /* Which way the planks lie.  A stream running down the room is
         crossed from side to side, and the other way about.  Working
         this out afterwards from the neighbours went wrong on a two wide
         stream: the far half of the bridge is itself a bridge, and it
         reports the water underneath it, which looks exactly like the
         stream carrying on in that direction. */
      L.bspan[bj] = vert ? 'h' : 'v';
    } else {
      T[bj] = liquid;
    }
  }
  /* a chasm gets cracked flagstones along both banks, the same warning a
     hole in the middle of a room gets */
  if (liquid === HOLE) {
    for (i = 0; i < band.length; i++) {
      for (var d = 0; d < 4; d++) {
        var cxx = band[i][0] + DIR4[d][0], cyy = band[i][1] + DIR4[d][1];
        var ck = cyy * MAP_W + cxx;
        if (T[ck] !== FLOOR) continue;
        L.decor[ck] = pick(CRACKS);
      }
    }
  }
  return band.length;
}

/* Does this lock actually divide the floor into two places worth being?

   Wall it up and flood from each side in turn.  It guards something only
   if BOTH sides hold at least one square you could stand about in - not
   counting doorways, which are ways through rather than places, and not
   counting the pockets that are walled in on purpose.

   Flooding from one side only was not enough: measured from inside a
   vault that holds nothing but its own doorway, the whole rest of the
   floor is "cut off" and the lock looks vital.  Measured from outside,
   it guards an empty step.  Both sides, or it is just a door. */
function lockDivides(Lv, idx) {
  var T = Lv.tiles, was = T[idx];
  if (was !== LOCKED && was !== DOOR) return false;
  var x = idx % Lv.mw, y = (idx / Lv.mw) | 0, d, i, j;
  var sides = [];
  T[idx] = WALL;
  for (d = 0; d < 4; d++) {
    var nx = x + DIR4[d][0], ny = y + DIR4[d][1];
    if (nx < 0 || ny < 0 || nx >= Lv.mw || ny >= Lv.mh) continue;
    if (walkTile(T[ny * Lv.mw + nx])) sides.push(ny * Lv.mw + nx);
  }
  if (sides.length < 2) { T[idx] = was; return false; }

  /* flood from the first side; whatever it reaches is one half */
  var here = reachCopy(Lv, sides[0] % Lv.mw, (sides[0] / Lv.mw) | 0, true);
  var other = -1;
  for (i = 1; i < sides.length; i++) if (!here[sides[i]]) { other = sides[i]; break; }
  if (other < 0) { T[idx] = was; return false; }   /* it is on a loop */

  var there = reachCopy(Lv, other % Lv.mw, (other / Lv.mw) | 0, true);
  T[idx] = was;

  /* and each half has to be somewhere, not just a step */
  var a = 0, b = 0;
  for (j = 0; j < T.length; j++) {
    if (!standTile(T[j])) continue;
    if (Lv.sealed && Lv.sealed[j]) continue;
    if (here[j]) a++;
    else if (there[j]) b++;
    if (a && b) return true;
  }
  return false;
}

/* Any lock that turns out to guard nothing becomes an ordinary door, so
   no key is ever ceremonial.  This runs last, after the pockets have
   been carved and the stairs placed, because those are the passes that
   can quietly open a second way in. */
function retireEmptyLocks(Lv) {
  var T = Lv.tiles, keys = Object.keys(Lv.locks), k, i, gone = 0;
  if (!keys.length) return 0;
  var hidden = [];
  for (i = 0; i < T.length; i++) if (T[i] === SDOOR) { hidden.push(i); T[i] = DOOR; }
  for (k = 0; k < keys.length; k++) {
    var idx = parseInt(keys[k], 10);
    if (T[idx] !== LOCKED) continue;
    if (lockDivides(Lv, idx)) continue;
    T[idx] = DOOR;
    Lv.doorMat[idx] = Lv.locks[idx];
    delete Lv.locks[idx];
    gone++;
  }
  for (i = 0; i < hidden.length; i++) T[hidden[i]] = SDOOR;
  return gone;
}

function everyLockGuardsSomething(Lv) {
  var T = Lv.tiles, keys = Object.keys(Lv.locks), k, i, ok = true;
  if (!keys.length) return true;
  var hidden = [];
  for (i = 0; i < T.length; i++) if (T[i] === SDOOR) { hidden.push(i); T[i] = DOOR; }
  for (k = 0; k < keys.length && ok; k++)
    if (!lockDivides(Lv, parseInt(keys[k], 10))) ok = false;
  for (i = 0; i < hidden.length; i++) T[hidden[i]] = SDOOR;
  return ok;
}

/* A rug laid in the middle of a room.  Nine pieces so the edges are
   edges whatever size it is, and two middles so the pattern is not a
   grid of the same stamp.  It is decor: you walk over it, and it only
   goes down where the floor is plain and empty. */
function addRug(L, r) {
  var i, x, y;
  if (r.floors.length < 12) return 0;
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (i = 0; i < r.floors.length; i++) {
    var f = r.floors[i];
    if (f[0] < x0) x0 = f[0]; if (f[0] > x1) x1 = f[0];
    if (f[1] < y0) y0 = f[1]; if (f[1] > y1) y1 = f[1];
  }
  var rw = Math.min(RUG_MAX, x1 - x0 - 1), rh = Math.min(RUG_MAX, y1 - y0 - 1);
  if (rw < RUG_MIN || rh < RUG_MIN) return 0;
  rw = RUG_MIN + rnd(rw - RUG_MIN + 1);
  rh = RUG_MIN + rnd(rh - RUG_MIN + 1);
  /* centred, which is where a rug goes */
  var ax = x0 + (((x1 - x0 + 1) - rw) >> 1);
  var ay = y0 + (((y1 - y0 + 1) - rh) >> 1);

  /* every square of it has to be plain empty floor */
  for (y = ay; y < ay + rh; y++) for (x = ax; x < ax + rw; x++) {
    var j = y * MAP_W + x;
    if (L.tiles[j] !== FLOOR) return 0;
    if (L.roomAt[j] !== r.idx) return 0;
    if (L.decor[j]) return 0;
    if (x === L.stair.x && y === L.stair.y) return 0;
    if (L.up && x === L.up.x && y === L.up.y) return 0;
    if (itemAt(L, x, y) || trapAtLevel(L, x, y)) return 0;
  }
  var id = ++L.rugs;
  for (y = ay; y < ay + rh; y++) for (x = ax; x < ax + rw; x++) {
    var north = (y === ay), south = (y === ay + rh - 1);
    var west = (x === ax), east = (x === ax + rw - 1);
    var name;
    if (north && west) name = 'rug_nw';
    else if (north && east) name = 'rug_ne';
    else if (south && west) name = 'rug_sw';
    else if (south && east) name = 'rug_se';
    else if (north) name = 'rug_n';
    else if (south) name = 'rug_s';
    else if (west) name = 'rug_w';
    else if (east) name = 'rug_e';
    else name = ((x + y) & 1) ? 'rug_c' : 'rug_c2';
    L.decor[y * MAP_W + x] = name;
    L.rugId[y * MAP_W + x] = id;
  }
  return rw * rh;
}

/* A rug is laid while the room is still being furnished, and a good deal
   happens to a floor afterwards: streams are cut, holes are dug, special
   rooms are built and the staircase back up is placed last of all.  Any
   piece of rug that no longer has plain floor under it, or has ended up
   beneath a staircase, is simply lifted. */
/* A cracked flagstone beside a hole is drawn turned to face it.  One
   that only touches a corner has no side to face, so it was drawn
   pointing at nothing - and cracks are scattered about the floor for
   their own sake too, so some land corner-on to a hole by chance.  Rather
   than police every place a crack can come from, sweep once at the end:
   a crack that touches a hole only corner-on is not a crack. */
/* ------------------------------------------------------- edging the moss
   The middle of a patch is one of the three field tiles; its border is
   one of the two edge tiles, laid on a bare square that touches the moss
   along a side.  Never on a square that only meets it corner-on: an edge
   tile is drawn turned to face what it borders, and a corner has no side
   to face.

   Moss also creeps up a wall, and much more readily up one that has moss
   growing on it already - which is a matter of where the wall is, so the
   floor builder can ask the same question the renderer does. */
/* Where a patch of moss meets bare floor, the join is drawn with the two
   edge tiles, and which side of the join they sit on depends on which
   there is more of.

   Out in the dungeon moss comes in tufts, and a tuft is the thing being
   edged: the border goes on the bare floor around it, one side of it or
   all four.  In a cave of moss it is the other way about - the floor is
   moss and the bare patches are the exception - so the moss itself
   thins where it meets a clear spot, and the squares around that spot
   fade from whole moss to an edge.  Either way the thick side of the
   tile faces the moss; the renderer turns it. */
function edgeTheMoss(L) {
  var laid = 0, i, k;
  var garden = {};
  for (i = 0; i < L.rooms.length; i++)
    if (!L.rooms[i].gone && L.rooms[i].special === 'moss') garden[i] = 1;
  function inGarden(idx) {
    var ri = L.roomAt[idx];
    return ri >= 0 && garden[ri];
  }

  /* --- a cave: the moss beside a clear spot fades to an edge -------- */
  var fade = {};
  for (i = 0; i < L.tiles.length; i++) {
    if (L.tiles[i] !== FLOOR || !inGarden(i)) continue;
    if (isMoss(L.decor[i])) continue;            /* mossy, so not a clear spot */
    var gx = i % MAP_W, gy = (i / MAP_W) | 0;
    for (k = 0; k < DIR4.length; k++) {
      var ax = gx + DIR4[k][0], ay = gy + DIR4[k][1];
      if (ax < 0 || ay < 0 || ax >= MAP_W || ay >= MAP_H) continue;
      var aj = ay * MAP_W + ax;
      if (isMoss(L.decor[aj]) && !isMossEdge(L.decor[aj])) fade[aj] = 1;
    }
  }
  for (k in fade) { L.decor[k] = pick(MOSS_EDGE); laid++; }

  /* --- a tuft out in the dungeon: bordered on one side, or on four -- */
  for (i = 0; i < L.tiles.length; i++) {
    var d = L.decor[i];
    if (!isMoss(d) || isMossEdge(d) || inGarden(i)) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, bare = [];
    for (k = 0; k < DIR4.length; k++) {
      var nx = x + DIR4[k][0], ny = y + DIR4[k][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var j = ny * MAP_W + nx;
      if (L.tiles[j] !== FLOOR || L.decor[j]) continue;
      bare.push(j);
    }
    shuffle(bare);
    var want = 1 + rnd(4);                       /* one side of it, up to all four */
    for (k = 0; k < bare.length && k < want; k++) {
      L.decor[bare[k]] = pick(MOSS_EDGE);
      laid++;
    }
  }

  /* --- and moss creeping up a wall, far likelier up a mossy one ----- */
  for (i = 0; i < L.tiles.length; i++) {
    if (L.tiles[i] !== FLOOR || L.decor[i]) continue;
    var wx = i % MAP_W, wy = (i / MAP_W) | 0, wall = 0, mossy = 0;
    for (k = 0; k < DIR4.length; k++) {
      var bx = wx + DIR4[k][0], by = wy + DIR4[k][1];
      if (bx < 0 || by < 0 || bx >= MAP_W || by >= MAP_H) continue;
      if (L.tiles[by * MAP_W + bx] !== WALL) continue;
      wall++;
      if (wallVariant(bx, by) === 'wall_moss') mossy = 1;
    }
    if (!wall) continue;
    if (rnd(100) >= (mossy ? MOSS_WALL_MOSSY_PCT : MOSS_WALL_PCT)) continue;
    L.decor[i] = pick(MOSS_EDGE);
    laid++;
  }
  return laid;
}
/* An edge tile has to have something to face.  Anything that lost its
   moss - burnt away, blasted, walked over - leaves its border pointing
   at nothing, so the border goes too. */
function tidyMossEdges(L) {
  var gone = 0, i, k;
  for (i = 0; i < L.tiles.length; i++) {
    if (!isMossEdge(L.decor[i])) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, faces = 0;
    for (k = 0; k < DIR4.length; k++) {
      var nx = x + DIR4[k][0], ny = y + DIR4[k][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var j = ny * MAP_W + nx;
      if (isMoss(L.decor[j]) && !isMossEdge(L.decor[j])) faces++;
      else if (L.tiles[j] === WALL) faces++;
    }
    if (!faces) { delete L.decor[i]; gone++; }
  }
  return gone;
}

function tidyCracks(L) {
  var removed = 0, i, k;
  for (i = 0; i < L.tiles.length; i++) {
    var d = L.decor[i];
    if (!isCrack(d)) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, side = 0, corner = 0;
    for (k = 0; k < DIR4.length; k++) {
      var nx = x + DIR4[k][0], ny = y + DIR4[k][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (L.tiles[ny * MAP_W + nx] === HOLE) side++;
    }
    if (side) continue;                    /* it has an edge to face */
    for (k = 0; k < DIR8.length; k++) {
      var mx = x + DIR8[k][0], my = y + DIR8[k][1];
      if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) continue;
      if (L.tiles[my * MAP_W + mx] === HOLE) corner++;
    }
    if (!corner) continue;                 /* nowhere near a hole at all */
    delete L.decor[i];
    removed++;
  }
  return removed;
}

function tidyRugs(L) {
  /* A rug is one thing, not nine.  Plenty happens to a floor after one
     is laid - streams are cut, holes dug, cracked flagstones painted
     round a chasm, staircases placed - and any of it can take a square
     out of the middle or off the edge.  A rug missing a corner reads as
     a drawing mistake, so if it loses any of itself, the whole thing is
     rolled up and taken away. */
  var lost = {}, k, id, lifted = 0;
  for (k in L.rugId) {
    id = L.rugId[k];
    if (!id) continue;
    var j = k | 0, x = j % MAP_W, y = (j / MAP_W) | 0;
    var gone = !isRugName(L.decor[j]) || L.tiles[j] !== FLOOR;
    if (!gone && L.stair && x === L.stair.x && y === L.stair.y) gone = 1;
    if (!gone && L.up && x === L.up.x && y === L.up.y) gone = 1;
    if (gone) lost[id] = 1;
  }
  for (k in L.rugId) {
    id = L.rugId[k];
    if (!id || !lost[id]) continue;
    if (isRugName(L.decor[k | 0])) { delete L.decor[k | 0]; lifted++; }
    delete L.rugId[k];
  }
  return lifted;
}
function isRugName(d) { return !!d && String(d).indexOf('rug_') === 0; }

function everywhereReachable(L) {
  var T = L.tiles, n = T.length, i, from = -1;
  if (!_walkList || _walkList.length < n) {
    _walkList = new Int32Array(n); _hiddenList = new Int32Array(n);
  }
  var walk = _walkList, hid = _hiddenList, wn = 0, hn = 0;
  for (i = 0; i < n; i++) {
    var t = T[i];
    if (t === SDOOR) { hid[hn++] = i; T[i] = DOOR; t = DOOR; }
    /* A vault walled into the dead rock is meant to be unreachable on
       foot: it is what the dynamite is for.  It is not a generation
       fault, so it does not count against this. */
    if (L.sealed && L.sealed[i]) continue;
    if (t === FLOOR || t === CORR || t === DOOR || t === STAIR ||
        t === STAIR_UP || t === WATER || t === HOLY || t === LOCKED) {
      walk[wn++] = i;
      if (from < 0 && (t === FLOOR || t === CORR)) from = i;
    }
  }
  if (from < 0) { for (i = 0; i < hn; i++) T[hid[i]] = SDOOR; return true; }
  var seen = reachSet(L, from % MAP_W, (from / MAP_W) | 0, true);
  var ok = true;
  for (i = 0; i < wn; i++) if (!seen[walk[i]]) { ok = false; break; }
  for (i = 0; i < hn; i++) T[hid[i]] = SDOOR;
  return ok;
}

/* A hole clean through the floor, with the flagstones round it cracked
   so you can see it coming. */
function digHole(L, r) {
  if (r.floors.length < 16) return false;
  var want = HOLE_MIN + rnd(HOLE_MAX - HOLE_MIN + 1);
  var cells = [], seen = {}, taken = {};

  /* Only open ground, well inside the room: a hole jammed against a wall
     has nowhere to put the cracks that warn you about it. */
  function usable(x, y) {
    var j = y * MAP_W + x;
    if (taken[j]) return true;
    if (L.tiles[j] !== FLOOR || L.decor[j]) return false;
    if (x === L.stair.x && y === L.stair.y) return false;
    for (var d = 0; d < 4; d++) {
      var k = (y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0]);
      if (taken[k]) continue;
      if (L.tiles[k] !== FLOOR) return false;
    }
    return true;
  }

  var start = r.floors[rnd(r.floors.length)];
  if (!usable(start[0], start[1])) {
    start = null;
    for (var t2 = 0; t2 < r.floors.length && !start; t2++)
      if (usable(r.floors[t2][0], r.floors[t2][1])) start = r.floors[t2];
    if (!start) return false;
  }

  var queue = [start];
  while (queue.length && cells.length < want) {
    var c0 = queue.shift(), j = c0[1] * MAP_W + c0[0];
    if (seen[j]) continue;
    seen[j] = 1;
    if (!usable(c0[0], c0[1])) continue;
    cells.push(c0); taken[j] = 1;
    shuffle(DIR4);
    for (var d = 0; d < 4; d++)
      queue.push([c0[0] + DIR4[d][0], c0[1] + DIR4[d][1]]);
  }
  if (!cells.length) return false;

  /* a hole is a wall as far as walking is concerned, so it must not cut
     the room in two */
  var i;
  for (i = 0; i < cells.length; i++) L.tiles[cells[i][1] * MAP_W + cells[i][0]] = HOLE;
  /* Checking room centres is not enough: a hole can strand a corner of a
     room while every centre stays reachable.  Every walkable square has
     to survive. */
  var ok = everywhereReachable(L);
  if (!ok) {
    for (i = 0; i < cells.length; i++) L.tiles[cells[i][1] * MAP_W + cells[i][0]] = FLOOR;
    return false;
  }

  /* Cracked flagstones run along the edges of a hole, not off its
     corners: a crack sprite is drawn turned to face the hole it belongs
     to, and a square that only touches one corner-on has no side facing
     it to point at. */
  for (i = 0; i < cells.length; i++) {
    for (var dd = 0; dd < DIR4.length; dd++) {
      var nx = cells[i][0] + DIR4[dd][0], ny = cells[i][1] + DIR4[dd][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var k2 = ny * MAP_W + nx;
      if (L.tiles[k2] !== FLOOR) continue;
      if (L.decor[k2] === 'kerb') continue;      /* dressed stone stays put */
      L.decor[k2] = pick(CRACKS);
    }
  }
  L.holes = (L.holes || 0) + cells.length;
  return true;
}

function genLevelOnce(depth) {
  /* every floor is its own size and shape */
  setDims(MAP_MIN_W + rnd(MAP_MAX_W - MAP_MIN_W + 1),
          MAP_MIN_H + rnd(MAP_MAX_H - MAP_MIN_H + 1));
  var L = newLevelObj(depth);
  var T = L.tiles, i, x, y;
  var rects = scatterRooms();
  var NCELL = rects.length;

  /* --- carve room floors ------------------------------------------- */
  for (i = 0; i < NCELL; i++) {
    var r, fw = rects[i].w, fh = rects[i].h;
    var rx = rects[i].x, ry = rects[i].y;

    var res = shapeMask(fw, fh, pick(SHAPES));
    if (res.count < 6) res = shapeMask(fw, fh, 'rect');
    var mask = res.mask;

    var floors = [], sx = 0, sy = 0;
    for (y = 0; y < fh; y++) for (x = 0; x < fw; x++) {
      if (!mask[y][x]) continue;
      var ax = rx + x, ay = ry + y;
      T[ay * MAP_W + ax] = FLOOR;
      L.roomAt[ay * MAP_W + ax] = L.rooms.length;
      floors.push([ax, ay]); sx += ax; sy += ay;
    }
    r = { gone: 0, id: i, idx: L.rooms.length, x: rx, y: ry, w: fw, h: fh,
          floors: floors, lit: !(depth > 1 && rnd(12) < depth - 1) };
    /* centre = the floor tile nearest the centroid */
    var mcx = sx / floors.length, mcy = sy / floors.length, bd = 1e9;
    for (var f = 0; f < floors.length; f++) {
      var dd = Math.abs(floors[f][0] - mcx) + Math.abs(floors[f][1] - mcy);
      if (dd < bd) { bd = dd; r.cx = floors[f][0]; r.cy = floors[f][1]; }
    }
    L.rooms.push(r);
  }

  /* --- pools of water on some room floors -------------------------- */
  if (rnd(100) < 52) {
    for (i = 0; i < L.rooms.length; i++)
      if (!L.rooms[i].gone && rnd(100) < 20) addWater(L, L.rooms[i]);
  }

  /* --- derive stone walls around every floor tile ------------------- */
  buildWalls(L);

  /* --- connect the rooms: shortest-first spanning tree, then loops ---
     With no grid to lean on, every pair of rooms is a candidate and the
     cheap ones win, which keeps hallways short without making them tidy. */
  var pairs = [], j;
  for (i = 0; i < NCELL; i++) for (j = i + 1; j < NCELL; j++) {
    var ra = L.rooms[i], rb = L.rooms[j];
    var ddx = Math.abs(ra.cx - rb.cx), ddy = Math.abs(ra.cy - rb.cy);
    /* jitter the ranking so the same layout twice never joins up the same way */
    pairs.push([i, j, ddx >= ddy ? 'h' : 'v', ddx + ddy + rnd(5)]);
  }
  pairs.sort(function (p, q) { return p[3] - q[3]; });

  var par = []; for (i = 0; i < NCELL; i++) par.push(i);
  function find(a) { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; }
  var used = [], extra = [];
  for (i = 0; i < pairs.length; i++) {
    var a = find(pairs[i][0]), b = find(pairs[i][1]);
    if (a !== b) { par[a] = b; used.push(pairs[i]); }
    else if (pairs[i][3] < 44) extra.push(pairs[i]);
  }
  var nSpan = used.length;
  shuffle(extra);
  for (i = 0; i < 1 + rnd(3) && i < extra.length; i++) used.push(extra[i]);
  for (i = 0; i < used.length; i++) {
    /* Corridors never hide doors any more.  A secret door has to be the
       only way into somewhere, and a door on a redundant loop is by
       definition not that. */
    SECRET_OK = false;
    var r1 = L.rooms[used[i][0]], r2 = L.rooms[used[i][1]], dr = used[i][2];
    /* connect() digs from the first room towards the second */
    if (dr === 'h' ? r1.cx > r2.cx : r1.cy > r2.cy) { var t2 = r1; r1 = r2; r2 = t2; }
    connect(L, r1, r2, dr);
  }
  SECRET_OK = false;

  /* --- never leave two doors shoulder to shoulder ------------------ */
  tidyFloor(L);

  /* --- give the hallways their own stone walls --------------------- */
  buildCorridorWalls(L);


  /* --- stairs, traps, decor ---------------------------------------- */
  var sp = randSpot(L, randRoom(L));
  L.tiles[sp.y * MAP_W + sp.x] = STAIR;
  L.stair.x = sp.x; L.stair.y = sp.y;

  /* the springs are decided once, at the start of the game, so climbing
     back up a floor does not conjure another one */
  if (G.holyFloors && G.holyFloors.indexOf(depth) >= 0) addHolyPool(L);

  for (i = 0; i < L.rooms.length; i++) {
    if (L.rooms[i].gone) continue;
    if (rnd(100) < RUG_CHANCE) addRug(L, L.rooms[i]);
    if (rnd(100) < FURNISH_CHANCE) furnishRoom(L, L.rooms[i]);
    if (depth > 1 && rnd(100) < HOLE_CHANCE) digHole(L, L.rooms[i]);
    /* a stream across the room, or a gap that needs bridging */
    if (rnd(100) < STREAM_CHANCE) addStream(L, L.rooms[i], WATER);
    else if (depth > 1 && rnd(100) < CHASM_CHANCE) addStream(L, L.rooms[i], HOLE);
  }

  /* one room on some floors is worth walking into for its own sake */
  L.special = addSpecialRoom(L, depth);
  /* The rooms know their own shape again by now, and a moss garden is
     mossy: anything the tidying opened up came out bare, so top it up
     once the floor has stopped changing. */
  remossGardens(L);
  /* and a barrel or two left about the rest of the floor */
  scatterBarrels(L, depth);

  /* every floor has something to step on */
  var nt = 1 + rnd(2 + Math.min(depth, 5));
  var placed = 0, tries = 0;
  while (placed < nt && tries++ < nt * 12) {
    var tp = randSpot(L, randRoom(L));
    if (L.tiles[tp.y * MAP_W + tp.x] !== FLOOR) continue;
    if (tp.x === L.stair.x && tp.y === L.stair.y) continue;
    if (trapAtLevel(L, tp.x, tp.y)) continue;
    /* not in the moss: it is the one room you can stop and rest in, and
       something underfoot makes stopping the mistake */
    var tri = L.roomAt[tp.y * MAP_W + tp.x];
    if (tri >= 0 && L.rooms[tri] && L.rooms[tri].special === 'moss') continue;
    var kind = pick(TRAPS);
    /* plenty of them sit in plain view - a dungeon you can read */
    L.traps.push({ x: tp.x, y: tp.y, k: kind, spent: 0,
                   found: rnd(100) < kind.open ? 1 : 0 });
    placed++;
  }
  /* Scattered litter, last of all - so it must not bury anything the
     rest of the floor has already put down.  This ran after the special
     rooms and was dropping skulls on top of their chests. */
  for (i = 0; i < 26; i++) {
    var dp = randSpot(L, randRoom(L));
    var dj = dp.y * MAP_W + dp.x;
    if (L.tiles[dj] !== FLOOR) continue;
    if (L.decor[dj]) continue;
    if (itemAt(L, dp.x, dp.y)) continue;
    L.decor[dj] = pick(MOSS_FIELD.concat(['bones', 'skull', 'rubble']));
  }
  buildLitMap(L);
  pickDarkness(L, depth);
  return L;
}

/* turn raw rock into dressed stone wherever it touches a given tile kind */
function wallPass(L, isTarget) {
  var T = L.tiles, x, y, dx, dy;
  for (y = 0; y < MAP_H; y++) for (x = 0; x < MAP_W; x++) {
    var i = y * MAP_W + x;
    if (T[i] !== ROCK) continue;
    var touch = false;
    for (dy = -1; dy <= 1 && !touch; dy++) for (dx = -1; dx <= 1; dx++) {
      var nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (isTarget(T[ny * MAP_W + nx])) { touch = true; break; }
    }
    if (touch) T[i] = WALL;
  }
}
function trapAtLevel(Lv, x, y) {
  for (var i = 0; i < Lv.traps.length; i++)
    if (Lv.traps[i].x === x && Lv.traps[i].y === y) return Lv.traps[i];
  return null;
}
function buildWalls(L) {
  wallPass(L, function (t) { return t === FLOOR || t === WATER || t === HOLY; });
}
function buildCorridorWalls(L) {
  wallPass(L, function (t) { return t === CORR || t === DOOR || t === SDOOR; });
}

/* a pool of water eating into part of one room */
function addWater(L, r) {
  if (r.floors.length < 8) return;
  var pools = 1 + (rnd(100) < 38 ? 1 : 0), b;
  for (b = 0; b < pools; b++) {
    var frac = 18 + rnd(45);
    var target = 3 + (((r.floors.length * frac) / 100) | 0);
    var seed = r.floors[rnd(r.floors.length)];
    if (L.tiles[seed[1] * MAP_W + seed[0]] !== FLOOR) continue;
    var open = [seed], cells = [], seen = {};
    seen[seed[1] * MAP_W + seed[0]] = 1;
    while (open.length && cells.length < target) {
      var c = open.splice(rnd(open.length), 1)[0];
      var ci = c[1] * MAP_W + c[0];
      if (L.tiles[ci] !== FLOOR) continue;
      cells.push(c);
      for (var d = 0; d < 4; d++) {
        var nx = c[0] + DIR4[d][0], ny = c[1] + DIR4[d][1];
        var k = ny * MAP_W + nx;
        if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
        if (seen[k] || L.roomAt[k] !== r.idx || L.tiles[k] !== FLOOR) continue;
        seen[k] = 1; open.push([nx, ny]);
      }
    }
    for (var j = 0; j < cells.length; j++)
      L.tiles[cells[j][1] * MAP_W + cells[j][0]] = WATER;
  }
}

/* fit locks to a few doors.  Keys are placed later, in reach order. */
/* Every floor gets a lock.  A door that shuts off a dead end is the best
   kind - it makes a vault - so those are preferred. */
function lockDoors(L, depth, sx, sy) {
  var doors = [], i;
  for (i = 0; i < L.tiles.length; i++) if (L.tiles[i] === DOOR) doors.push(i);
  if (!doors.length) return;
  shuffle(doors);

  if (sx === undefined) {
    for (i = 0; i < L.rooms.length; i++)
      if (!L.rooms[i].gone) { sx = L.rooms[i].cx; sy = L.rooms[i].cy; break; }
  }
  if (sx === undefined) return;

  /* A lock is only worth having if it is the sole way in - counting
     secret doors, which is why they are opened for this test.  A vault
     with a hidden back way is not a vault. */
  /* the secret doors, found once rather than once per candidate */
  var hidden = [], q;
  for (q = 0; q < L.tiles.length; q++) if (L.tiles[q] === SDOOR) hidden.push(q);

  var scored = [];
  for (i = 0; i < doors.length && i < 16; i++) {
    var old = L.tiles[doors[i]];
    L.tiles[doors[i]] = WALL;
    for (q = 0; q < hidden.length; q++) L.tiles[hidden[q]] = DOOR;
    var seen = reachSet(L, sx, sy, true);
    var sealed = 0;
    for (var r = 0; r < L.rooms.length; r++) {
      var rm = L.rooms[r];
      if (rm.gone) continue;
      if (!seen[rm.cy * MAP_W + rm.cx]) sealed++;
    }
    for (q = 0; q < hidden.length; q++) L.tiles[hidden[q]] = SDOOR;
    L.tiles[doors[i]] = old;
    if (sealed > 0 && sealed <= 3) { scored.push({ i: doors[i], sealed: sealed }); break; }
  }
  /* No room is naturally sealed by a single door?  Then make one: brick
     up the spare ways in until a single door governs the room. */
  if (!scored.length) {
    var made = sealRoom(L, sx, sy);
    if (made >= 0) scored = [{ i: made, sealed: 1 }];
  }
  if (!scored.length) { L.noVault = 1; return; }
  scored.sort(function (a, b) { return a.sealed - b.sealed; });
  doors = scored.map(function (s2) { return s2.i; });

  var n = 1;
  if (depth > 6 && scored.length > 1 && rnd(100) < 30) n = 2;
  n = Math.min(n, doors.length, MATS.length - 1);
  var mats = shuffle([1, 2, 3, 4, 5]);
  for (i = 0; i < n; i++) {
    L.tiles[doors[i]] = LOCKED;
    L.locks[doors[i]] = mats[i];
    L.doorMat[doors[i]] = mats[i];
  }
}

function edgeTile(r, dir, other) {
  var best = r.floors[0], bs = -1e9;
  for (var i = 0; i < r.floors.length; i++) {
    var f = r.floors[i], s;
    if (dir === 'e') s = f[0] * 64 - Math.abs(f[1] - other.cy);
    else if (dir === 'w') s = -f[0] * 64 - Math.abs(f[1] - other.cy);
    else if (dir === 's') s = f[1] * 64 - Math.abs(f[0] - other.cx);
    else s = -f[1] * 64 - Math.abs(f[0] - other.cx);
    if (s > bs) { bs = s; best = f; }
  }
  return { x: best[0], y: best[1] };
}

/* the tiles an L-shaped hallway would occupy for a given bend */
function pathCells(a, b, dir, m) {
  var cells = [], x, y;
  if (dir === 'h') {
    for (x = a.x + 1; x <= m; x++) cells.push([x, a.y]);
    for (y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) cells.push([m, y]);
    for (x = m; x < b.x; x++) cells.push([x, b.y]);
  } else {
    for (y = a.y + 1; y <= m; y++) cells.push([a.x, y]);
    for (x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) cells.push([x, m]);
    for (y = m; y < b.y; y++) cells.push([b.x, y]);
  }
  return cells;
}
/* how many walls this route would punch through - two is ideal, one door
   at each end.  More than that means it is cutting across a room. */
function doorNear(T, x, y) {
  for (var d = 0; d < 4; d++) {
    var nx = x + DIR4[d][0], ny = y + DIR4[d][1];
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    var t = T[ny * MAP_W + nx];
    if (t === DOOR || t === SDOOR || t === LOCKED) return true;
  }
  return false;
}
/* the corner square of a room's masonry: no room floor beside it, but
   room floor on the diagonal */
function cornerWall(T, x, y) {
  var d;
  for (d = 0; d < 4; d++) {
    var nx = x + DIR4[d][0], ny = y + DIR4[d][1];
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    if (walkTile(T[ny * MAP_W + nx])) return false;
  }
  for (d = 0; d < 4; d++) {
    var dx = x + DIAG4[d][0], dy = y + DIAG4[d][1];
    if (dx < 0 || dy < 0 || dx >= MAP_W || dy >= MAP_H) continue;
    if (walkTile(T[dy * MAP_W + dx])) return true;
  }
  return false;
}

function pathCost(T, cells) {
  var cost = 0, mine = {}, i, d;
  for (i = 0; i < cells.length; i++) {
    var x = cells[i][0], y = cells[i][1], j = y * MAP_W + x;
    var t = T[j];
    if (t === WALL) {
      /* a doorway shoulder to shoulder with another one looks broken -
         whether the neighbour is already there or this same corridor is
         about to punch it on the way round a bend */
      cost += doorNear(T, x, y) ? 25 : 1;
      /* A doorway in the corner of a room opens onto the diagonal and so
         opens onto nothing.  Route round it if there is any other way. */
      if (cornerWall(T, x, y)) cost += 40;
      for (d = 0; d < 4; d++)
        if (mine[(y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0])]) cost += 25;
      mine[j] = 1;
    }
    else if (t === FLOOR || t === WATER || t === HOLY) cost += 14;   /* barge through a room only as a last resort */
    else if (t === DOOR || t === LOCKED || t === SDOOR) cost += 6;
  }
  return cost;
}

function connect(L, ra, rb, dir) {
  DIG_L = L;                       /* so dig can note where it left a gap */
  var T = L.tiles, i, m, lo, hi, best = null, bestCost = 1e9;
  var a, b;
  if (dir === 'h') {
    a = edgeTile(ra, 'e', rb); b = edgeTile(rb, 'w', ra);
    if (b.x <= a.x + 1) { dig(T, a.x + 1, a.y); dig(T, b.x - 1, b.y); return; }
    lo = a.x + 1; hi = b.x - 1;
  } else {
    a = edgeTile(ra, 's', rb); b = edgeTile(rb, 'n', ra);
    if (b.y <= a.y + 1) { dig(T, a.x, a.y + 1); dig(T, b.x, b.y - 1); return; }
    lo = a.y + 1; hi = b.y - 1;
  }
  /* try a handful of bends and take the one that makes the fewest doors */
  for (i = 0; i < 18; i++) {
    m = lo + rnd(Math.max(1, hi - lo + 1));
    var cells = pathCells(a, b, dir, m);
    var c = pathCost(T, cells);
    if (c < bestCost) { bestCost = c; best = cells; }
    if (c <= 2) break;
  }
  for (i = 0; i < best.length; i++) dig(T, best[i][0], best[i][1]);
}

/* No two doors may sit next to each other.  Drop the spare ones, but only
   while the whole floor stays walkable. */
/* the door tiles sitting on a room's boundary */
function roomDoors(L, r) {
  var out = [], seen = {}, i, d;
  for (i = 0; i < r.floors.length; i++) {
    for (d = 0; d < 4; d++) {
      var x = r.floors[i][0] + DIR4[d][0], y = r.floors[i][1] + DIR4[d][1];
      var j = y * MAP_W + x;
      if (seen[j]) continue;
      seen[j] = 1;
      if (L.tiles[j] === DOOR) out.push(j);
    }
  }
  return out;
}

/* If the random passes produced no secret door, turn one redundant door
   into one - redundant meaning the floor stays walkable without it. */
/* ------------------------------------------------------- sealed rooms
   A secret door that opens onto somewhere you could already walk to is
   just a door.  Same for a lock.  So both are made the same way: take a
   room, wall up every way in but one, and make that one the secret door
   or the lock.  If the rest of the floor is still fully connected
   afterwards, that room is now genuinely behind it.

   Returns the tile index of the door that now guards the room, or -1. */
function roomHolds(r, x, y) {
  for (var i = 0; i < r.floors.length; i++)
    if (r.floors[i][0] === x && r.floors[i][1] === y) return true;
  return false;
}
function sealRoom(L, sx, sy) {
  var T = L.tiles, i, j;
  if (sx === undefined) {
    for (i = 0; i < L.rooms.length; i++)
      if (!L.rooms[i].gone) { sx = L.rooms[i].cx; sy = L.rooms[i].cy; break; }
  }
  if (sx === undefined) return -1;

  var order = [];
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone) continue;
    if (r.sealed) continue;                    /* one secret per room */
    if (roomHolds(r, sx, sy)) continue;        /* not the one you start in */
    /* and never the way down: a stair behind a door you have to find by
       luck can strand you on the floor for good */
    if (roomHolds(r, L.stair.x, L.stair.y)) continue;
    order.push(r);
  }
  shuffle(order);

  /* the walkable squares, gathered once - the candidate loop below would
     otherwise walk the whole map for every door it tries */
  var walkAt = [], walkN = 0;
  for (i = 0; i < T.length; i++) {
    var t0 = T[i];
    if (t0 === FLOOR || t0 === CORR || t0 === DOOR || t0 === STAIR ||
        t0 === STAIR_UP || t0 === WATER || t0 === HOLY || t0 === LOCKED)
      walkAt.push(i);
  }
  walkN = walkAt.length;

  for (i = 0; i < order.length; i++) {
    var room = order[i];
    var doors = roomDoors(L, room);
    if (!doors.length || doors.length > 3) continue;

    for (var keep = 0; keep < doors.length; keep++) {
      var saved = [];
      for (j = 0; j < doors.length; j++) {
        if (j === keep) continue;
        saved.push([doors[j], T[doors[j]]]);
        T[doors[j]] = WALL;                    /* bricked up */
      }
      var old = T[doors[keep]];
      T[doors[keep]] = WALL;                   /* and the survivor, to test */

      /* Everything except this room must still hang together - and that
         means every walkable square, not just the room centres.  Walling
         a door can strand a corridor stub while every centre stays fine. */
      var inside = {};
      for (j = 0; j < room.floors.length; j++)
        inside[room.floors[j][1] * MAP_W + room.floors[j][0]] = 1;
      /* a secret door already on the floor is still a way through, so
         open them for the purpose of this check */
      var hidden = [];
      for (j = 0; j < T.length; j++)
        if (T[j] === SDOOR) { hidden.push(j); T[j] = DOOR; }
      var seen = reachSet(L, sx, sy, true);
      var ok = 1, cut = 0;
      for (var wi = 0; wi < walkN && ok; wi++) {
        var t2 = walkAt[wi];
        if (T[t2] === WALL) continue;              /* just bricked up */
        var got = !!seen[t2];
        if (inside[t2]) { if (got) ok = 0; else cut = 1; }
        else if (!got) ok = 0;
      }
      var stairOK = !!seen[L.stair.y * MAP_W + L.stair.x];
      for (j = 0; j < hidden.length; j++) T[hidden[j]] = SDOOR;
      if (ok && cut === 1 && stairOK) {
        T[doors[keep]] = old;                  /* put the door back */
        room.sealed = 1;
        return doors[keep];
      }
      T[doors[keep]] = old;
      for (j = 0; j < saved.length; j++) T[saved[j][0]] = saved[j][1];
    }
  }
  return -1;
}

/* Exactly one hidden door per floor, and it always guards something. */
/* Every floor hides a room.  Not merely a hidden door somewhere - a
   whole room you can only get into by searching a wall you had a reason
   to be suspicious of, which is why the door has to open off another
   room rather than out of a corridor. */
function ensureSecretDoor(L, sx, sy) {
  var T = L.tiles;
  /* Carving first, always.  Sealing an existing room gives you a hidden
     door in whatever corridor already led to it - and a panel in a
     tunnel wall is not something anyone thinks to search.  A carved room
     is entered through the wall of a room you are standing in. */
  if (carveSecretRoom(L)) return 2;
  /* nowhere to carve: fall back to shutting a room away */
  var at = sealRoom(L, sx, sy);
  if (at >= 0) {
    T[at] = SDOOR;
    delete L.locks[at];
    return 1;
  }
  return 0;
}

/* A one square chamber walled in on every side but the secret door. */
/* ------------------------------------------------- the dead space
   Rooms and corridors are laid down over solid rock, and now and then
   they ring a pocket of it: rock with no way out, walled in on every
   side by the halls that went round it.  It was simply wasted map.

   Each pocket now holds a vault - a chamber cut into the middle of it
   with a chest inside.  There is no door.  The only way in is to blow
   the wall, which is what gives dynamite something to be for.  The
   squares are marked sealed so the reachability checks know they are
   meant to be unreachable rather than a generation fault. */
/* can something stand on this kind of tile? */
/* Somewhere you would call a place, rather than a way through one.  A
   doorway is walkable but it is not room: a lock whose only prize is the
   doorway behind it guards nothing worth a key. */
function standTile(t) {
  return t === FLOOR || t === CORR || t === STAIR || t === STAIR_UP ||
         t === WATER || t === HOLY || t === BRIDGE;
}
function walkTile(t) {
  return t === FLOOR || t === CORR || t === DOOR || t === SDOOR ||
         t === STAIR || t === STAIR_UP || t === WATER || t === HOLY ||
         t === LOCKED || t === HOLE || t === BRIDGE;
}

function deadPockets(L) {
  var T = L.tiles, n = T.length, mark = new Uint8Array(n), q = [], i, x, y;
  /* everything reachable through rock from the edge of the map is the
     outside; whatever rock is left over is walled in */
  for (x = 0; x < MAP_W; x++) { q.push(x); q.push((MAP_H - 1) * MAP_W + x); }
  for (y = 0; y < MAP_H; y++) { q.push(y * MAP_W); q.push(y * MAP_W + MAP_W - 1); }
  for (i = 0; i < q.length; i++) if (T[q[i]] === ROCK) mark[q[i]] = 1;
  var head = 0;
  while (head < q.length) {
    var at = q[head++];
    if (T[at] !== ROCK) continue;
    var ax = at % MAP_W, ay = (at / MAP_W) | 0;
    for (var d = 0; d < 4; d++) {
      var nx = ax + DIR4[d][0], ny = ay + DIR4[d][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var j = ny * MAP_W + nx;
      if (mark[j] || T[j] !== ROCK) continue;
      mark[j] = 1; q.push(j);
    }
  }
  /* what is left: group the unmarked rock into pockets */
  var pockets = [], seen = new Uint8Array(n);
  for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
    var s = y * MAP_W + x;
    if (T[s] !== ROCK || mark[s] || seen[s]) continue;
    var cells = [s], h2 = 0;
    seen[s] = 1;
    while (h2 < cells.length) {
      var c = cells[h2++], cx2 = c % MAP_W, cy2 = (c / MAP_W) | 0;
      for (var e = 0; e < 4; e++) {
        var mx = cx2 + DIR4[e][0], my = cy2 + DIR4[e][1], k = my * MAP_W + mx;
        if (mx < 1 || my < 1 || mx >= MAP_W - 1 || my >= MAP_H - 1) continue;
        if (seen[k] || T[k] !== ROCK || mark[k]) continue;
        seen[k] = 1; cells.push(k);
      }
    }
    pockets.push(cells);
  }
  return pockets;
}

function stockDeadSpace(L) {
  var pockets = deadPockets(L), made = 0, i, j, k;
  for (i = 0; i < pockets.length; i++) {
    var cells = pockets[i];
    if (cells.length < 4) continue;

    /* Carve the whole pocket, not one square of it.  A single chamber
       left the rest of the rock solid, so blasting in from any other
       side found nothing at all - which is exactly what it looked like:
       a hole into more stone.

       The cells with something walkable beside them become this room's
       own wall; everything further in becomes its floor. */
    var inside = [], edge = [];
    for (j = 0; j < cells.length; j++) {
      var at = cells[j], ax = at % MAP_W, ay = (at / MAP_W) | 0;
      var touches = 0;
      for (k = 0; k < 8; k++) {
        var nx = ax + DIR8[k][0], ny = ay + DIR8[k][1];
        if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) { touches = 1; break; }
        if (walkTile(L.tiles[ny * MAP_W + nx])) { touches = 1; break; }
      }
      if (touches) edge.push(at); else inside.push(at);
    }
    if (inside.length < 2) continue;          /* nothing left to stand in */

    var floors = [], minx = MAP_W, miny = MAP_H, maxx = 0, maxy = 0;
    for (j = 0; j < inside.length; j++) {
      var f = inside[j], fx = f % MAP_W, fy = (f / MAP_W) | 0;
      L.tiles[f] = FLOOR;
      L.sealed[f] = 1;
      floors.push([fx, fy]);
      if (fx < minx) minx = fx;
      if (fy < miny) miny = fy;
      if (fx > maxx) maxx = fx;
      if (fy > maxy) maxy = fy;
    }
    for (j = 0; j < edge.length; j++)
      if (L.tiles[edge[j]] === ROCK) L.tiles[edge[j]] = WALL;
    /* and any rock still touching the new floor becomes its wall */
    for (j = 0; j < floors.length; j++)
      for (k = 0; k < 8; k++) {
        var wx = floors[j][0] + DIR8[k][0], wy = floors[j][1] + DIR8[k][1];
        var w = wy * MAP_W + wx;
        if (L.tiles[w] === ROCK) L.tiles[w] = WALL;
      }

    var idx = L.rooms.length;
    var cx = floors[(floors.length / 2) | 0][0];
    var cy = floors[(floors.length / 2) | 0][1];
    L.rooms.push({ gone: 0, lit: 1, idx: idx, id: idx, sealed: 1, vault: 1,
                   x: minx, y: miny, w: maxx - minx + 1, h: maxy - miny + 1,
                   cx: cx, cy: cy, floors: floors });
    for (j = 0; j < floors.length; j++)
      L.roomAt[floors[j][1] * MAP_W + floors[j][0]] = idx;

    /* a chest, and a thing or two lying about it */
    var spots = floors.slice();
    shuffle(spots);
    /* it is blasted into, not walked into, but a chest against the hole
       you just made is still in the way */
    var cs2 = spots[0];
    for (var ci = 0; ci < spots.length; ci++)
      if (!blocksDoorway(spots[ci][0], spots[ci][1], L)) { cs2 = spots[ci]; break; }
    var chest = mkChest(L.depth, 0, 1);
    chest.x = cs2[0]; chest.y = cs2[1];
    L.items.push(chest);
    /* A pocket can be four squares or two hundred; a big one deserves
       more than the same single chest.  Scale it with the room, gently -
       the square root, not the area. */
    var extras = clamp(Math.round(Math.sqrt(floors.length) / 2) + rnd(2),
                       1, Math.min(6, spots.length - 1));
    for (j = 0; j < extras; j++) {
      var loose = rnd(100) < 20 ? mkChest(L.depth, 0, 1) : newGoodItem(L.depth);
      loose.x = spots[j + 1][0]; loose.y = spots[j + 1][1];
      L.items.push(loose);
    }
    made++;
  }
  return made;
}

/* ------------------------------------------------ the secret room
   Every floor hides one.  It is cut into the dead rock beside a room,
   and the only way in is a panel in that room's own wall - so you find
   it by being suspicious of a room, which is the part that is fun.  A
   hidden door off a corridor is a different thing entirely: nobody
   searches a tunnel wall on a hunch.

   Rooms are joined by corridors, so a door almost never opens straight
   into another room; trying to seal an existing room and call it secret
   simply never succeeded.  Carving the room is what makes this work. */
function carveSecretRoom(L) {
  /* Room to spare is nice but not required: a cramped floor still gets
     its secret, even if the secret is a cupboard.  Bigger shapes are
     tried first and it works down until something fits. */
  var shapes = [[3, 2], [2, 3], [2, 2], [2, 1], [1, 2], [1, 1]];
  for (var si = 0; si < shapes.length; si++)
    if (carveSecretShape(L, shapes[si][0], shapes[si][1])) return true;
  return false;
}
function carveSecretShape(L, sw, sh) {
  var T = L.tiles, tries, xx, yy, i;
  for (tries = 0; tries < 260; tries++) {
    var r = L.rooms[rnd(L.rooms.length)];
    if (!r || r.gone || !r.floors.length) continue;
    var f = r.floors[rnd(r.floors.length)], d = rnd(4);
    var dx = DIR4[d][0], dy = DIR4[d][1];
    var wx = f[0] + dx, wy = f[1] + dy;          /* the panel */
    if (T[wy * MAP_W + wx] !== WALL) continue;

    /* a chamber beyond it, across the way in and along it */
    var w = sw, h = sh;
    if (dx) { var s = w; w = h; h = s; }         /* deeper than it is wide */
    var x0 = wx + dx, y0 = wy + dy;
    if (dx < 0) x0 -= w - 1;
    if (dy < 0) y0 -= h - 1;
    if (dx) y0 -= (h >> 1); else x0 -= (w >> 1);

    if (x0 < 2 || y0 < 2 || x0 + w >= MAP_W - 2 || y0 + h >= MAP_H - 2) continue;

    /* every square of it, and everything touching it, must still be raw
       rock or existing stone - the room may not breach anything */
    var ok = 1;
    for (yy = y0 - 1; yy <= y0 + h && ok; yy++)
      for (xx = x0 - 1; xx <= x0 + w; xx++) {
        if (xx === wx && yy === wy) continue;    /* the panel itself */
        var nt = T[yy * MAP_W + xx];
        if (nt !== ROCK && nt !== WALL) { ok = 0; break; }
      }
    if (!ok) continue;

    T[wy * MAP_W + wx] = SDOOR;
    var floors = [];
    for (yy = y0; yy < y0 + h; yy++) for (xx = x0; xx < x0 + w; xx++) {
      T[yy * MAP_W + xx] = FLOOR;
      floors.push([xx, yy]);
    }
    for (yy = y0 - 1; yy <= y0 + h; yy++) for (xx = x0 - 1; xx <= x0 + w; xx++) {
      if (xx === wx && yy === wy) continue;
      if (T[yy * MAP_W + xx] === ROCK) T[yy * MAP_W + xx] = WALL;
    }

    var idx = L.rooms.length;
    var room = { gone: 0, lit: 1, idx: idx, id: idx, sealed: 1, secret: 1,
                 x: x0, y: y0, w: w, h: h,
                 cx: x0 + (w >> 1), cy: y0 + (h >> 1), floors: floors };
    L.rooms.push(room);
    for (i = 0; i < floors.length; i++)
      L.roomAt[floors[i][1] * MAP_W + floors[i][0]] = idx;

    /* something worth the search, in the middle where it will be seen */
    var cache = newGoodItem(L.depth);
    cache.x = room.cx; cache.y = room.cy;
    delete L.decor[room.cy * MAP_W + room.cx];
    L.items.push(cache);
    return true;
  }
  return false;
}

/* Where does each of a room's doors actually lead?

   Not by flooding out of one with the others open - that reaches the
   whole floor and says every door goes everywhere.  Brick them all up
   first, then step outside each in turn: what you can reach from there
   is what that door is for. */
function doorDestinations(L, r) {
  var T = L.tiles, doors = roomDoors(L, r), saved = [], out = [], i, j, d;
  for (i = 0; i < doors.length; i++) { saved.push(T[doors[i]]); T[doors[i]] = WALL; }
  for (i = 0; i < doors.length; i++) {
    var at = doors[i], x = at % MAP_W, y = (at / MAP_W) | 0, side = -1;
    for (d = 0; d < 4; d++)
      if (roomHolds(r, x - DIR4[d][0], y - DIR4[d][1])) { side = d; break; }
    if (side < 0) { out.push(null); continue; }
    var ox = x + DIR4[side][0], oy = y + DIR4[side][1];
    var key = '';
    if (walkTile(T[oy * MAP_W + ox])) {
      var reach = reachSet(L, ox, oy, true), hits = [];
      for (j = 0; j < L.rooms.length; j++) {
        if (L.rooms[j] === r || L.rooms[j].gone) continue;
        if (reach[L.rooms[j].cy * MAP_W + L.rooms[j].cx]) hits.push(j);
      }
      key = hits.join(',');
    }
    out.push({ at: at, side: side, key: key });
  }
  for (i = 0; i < doors.length; i++) T[doors[i]] = saved[i];
  return out;
}

/* Two doors in the same wall that come out in the same place are one
   door too many: you walk out of one, along a corridor, and back in
   beside where you started.  Brick up the spare, as long as the floor
   still hangs together without it. */
function dedupeParallelDoors(L) {
  var T = L.tiles, i, j;
  function doorish(t) { return t === DOOR || t === SDOOR || t === LOCKED; }
  for (var ri = 0; ri < L.rooms.length; ri++) {
    var r = L.rooms[ri];
    if (r.gone) continue;
    var info = doorDestinations(L, r);
    if (info.length < 2) continue;
    for (i = 0; i < info.length; i++) {
      if (!info[i] || !info[i].key) continue;
      for (j = i + 1; j < info.length; j++) {
        if (!info[j] || !info[j].key) continue;
        if (info[i].side !== info[j].side) continue;
        if (info[i].key !== info[j].key) continue;
        var spare = info[j].at;
        if (!doorish(T[spare])) continue;
        var old = T[spare];
        T[spare] = WALL;
        if (!everywhereReachable(L)) T[spare] = old;
        else { delete L.locks[spare]; delete L.doorMat[spare]; }
      }
    }
  }
}

/* A door in the corner of a room touches the room only diagonally, and
   nobody walks diagonally - so it reads as a door set into the corner of
   the masonry, opening onto nothing.  A door between two corridors has
   no room floor beside it either, which is fine; the tell is the room
   being there on the diagonal. */
function doorAtCorner(L, at) {
  var T = L.tiles, x = at % MAP_W, y = (at / MAP_W) | 0, d;
  if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) return false;
  /* Part of a room, whatever it happens to be paved with - a room's edge
     square can be water, or a spring, or a bridge over a stream, and a
     door opening onto one of those is a perfectly good door. */
  function roomSide(j) { return L.roomAt[j] >= 0 && walkTile(T[j]); }
  for (d = 0; d < 4; d++)
    if (roomSide((y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0]))) return false;
  for (d = 0; d < 4; d++)
    if (roomSide((y + DIAG4[d][1]) * MAP_W + (x + DIAG4[d][0]))) return true;
  return false;
}

/* A doorway you cannot pass through is not a doorway.

   Whatever made it - a hallway filled back in behind it, a room sealed
   after the fact, a corridor that was re-routed - the result is a door
   standing in a wall with solid stone on the other side.  Rather than
   chase every pass that can leave one, this walls up any door that has
   fewer than two ways out of it, which is the property that matters. */
function blindDoor(L, at) {
  var T = L.tiles, x = at % MAP_W, y = (at / MAP_W) | 0, d, ways = 0;
  if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) return false;
  for (d = 0; d < 4; d++)
    if (walkTile(T[(y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0])])) ways++;
  return ways < 2;
}
function brickUpBlindDoors(L) {
  var T = L.tiles, i, walled = 0;
  for (i = 0; i < T.length; i++) {
    var t = T[i];
    if (t !== DOOR && t !== SDOOR && t !== LOCKED) continue;
    if (!blindDoor(L, i)) continue;
    T[i] = WALL;
    delete L.locks[i];
    delete L.doorMat[i];
    walled++;
  }
  return walled;
}

/* Brick up every one of them the floor can spare. */
function fixCornerDoors(L) {
  var T = L.tiles, i, fixed = 0;
  for (i = 0; i < T.length; i++) {
    var t = T[i];
    if (t !== DOOR && t !== SDOOR && t !== LOCKED) continue;
    if (!doorAtCorner(L, i)) continue;
    T[i] = WALL;
    if (!everywhereReachable(L)) {
      /* Walling it up would cut the floor in two, so it stays.  A door
         in a corner is untidy; a floor you cannot walk all of is worse.
         Marked, so the fact that this one was a deliberate exception is
         recorded rather than guessed at afterwards. */
      T[i] = t;
      if (!L.cornerKept) L.cornerKept = {};
      L.cornerKept[i] = 1;
      continue;
    }
    delete L.locks[i]; delete L.doorMat[i];
    fixed++;
  }
  return fixed;
}

/* Where a corridor ends in nothing.  A hallway should arrive somewhere:
   a room, or at the very least a space you can stand about in. */
function corridorBlob(L, at, seen) {
  var T = L.tiles, q = [at], out = [], head = 0;
  seen[at] = 1;
  while (head < q.length) {
    var c = q[head++];
    out.push(c);
    var x = c % MAP_W, y = (c / MAP_W) | 0;
    for (var d = 0; d < 4; d++) {
      var nx = x + DIR4[d][0], ny = y + DIR4[d][1], j = ny * MAP_W + nx;
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      if (seen[j]) continue;
      var t = T[j];
      if (t === CORR) { seen[j] = 1; q.push(j); }
      else if (t === FLOOR || t === DOOR || t === SDOOR || t === LOCKED ||
               t === STAIR || t === STAIR_UP || t === WATER || t === HOLY ||
               t === BRIDGE) {
        out.push(-j - 1);              /* negative: it reaches something */
      }
    }
  }
  return out;
}

/* Fill in any run of corridor that arrives nowhere.  Repeat until there
   is nothing left to fill: taking a dead end away can leave a shorter
   one behind it. */
function trimDeadEnds(L, careful) {
  var T = L.tiles, filled = 0, pass, i;
  for (pass = 0; pass < 20; pass++) {
    var seen = {}, cut = 0;
    for (i = 0; i < T.length; i++) {
      if (T[i] !== CORR || seen[i]) continue;
      var blob = corridorBlob(L, i, seen);
      var run = [], reaches = 0;
      for (var b = 0; b < blob.length; b++) {
        if (blob[b] < 0) reaches++; else run.push(blob[b]);
      }
      /* it must reach two things - somewhere to come from and somewhere
         to go - or be roomy enough to be a place in its own right */
      if (reaches >= 2 || run.length >= DEAD_END_MIN) continue;
      /* Late in the build there are things standing about, and filling a
         square in on top of one loses it.  Leave any run that is holding
         something. */
      if (careful) {
        var busy = 0, q;
        for (q = 0; q < run.length; q++) {
          var rx = run[q] % MAP_W, ry = (run[q] / MAP_W) | 0;
          if (itemAt(L, rx, ry) || trapAtLevel(L, rx, ry) || L.decor[run[q]]) busy = 1;
          if (L.stair && rx === L.stair.x && ry === L.stair.y) busy = 1;
          if (L.up && rx === L.up.x && ry === L.up.y) busy = 1;
          if (monAt(L, rx, ry)) busy = 1;
        }
        if (busy) continue;
      }
      /* Filled in, and everything that was recorded about the square
         goes with it - an opening marked on a square that is now solid
         rock is an archway in the middle of the stone. */
      for (var k = 0; k < run.length; k++) {
        T[run[k]] = ROCK; cut++;
        if (L.arch) delete L.arch[run[k]];
        delete L.decor[run[k]];
      }
      /* and the doorway it hung off is a door to nowhere now */
      for (k = 0; k < blob.length; k++) {
        if (blob[k] >= 0) continue;
        var at2 = -blob[k] - 1, t2 = T[at2];
        if (t2 === DOOR || t2 === SDOOR || t2 === LOCKED) {
          var lone = 1;
          for (var d2 = 0; d2 < 4; d2++) {
            var nt = T[at2 + DIR4[d2][1] * MAP_W + DIR4[d2][0]];
            if (nt === CORR) lone = 0;
          }
          if (lone) {
            T[at2] = WALL;
            delete L.locks[at2]; delete L.doorMat[at2];
            if (L.arch) delete L.arch[at2];
          }
        }
      }
    }
    filled += cut;
    if (!cut) break;
  }
  return filled;
}

/* Filling in a hallway leaves the stone that lined it standing round
   nothing.  Anything with no walkable square anywhere near it is not a
   wall any more, it is just rock. */
function clearStrandedWalls(L) {
  var T = L.tiles, i, gone = 0;
  for (i = 0; i < T.length; i++) {
    if (T[i] !== WALL) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, near = 0;
    for (var d = 0; d < 8 && !near; d++) {
      var nx = x + DIR8[d][0], ny = y + DIR8[d][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (walkTile(T[ny * MAP_W + nx])) near = 1;
    }
    if (!near) { T[i] = ROCK; gone++; }
  }
  return gone;
}

/* The whole tidying, in the order it has to happen.  It is run once when
   the floor is dealt and again after the vault and the hidden room are
   sealed, because sealing cuts new doors and can strand a hallway. */
function tidyFloor(L) {
  dedupeDoors(L);
  fixCornerDoors(L);
  trimDeadEnds(L);
  clearStrandedWalls(L);
  dedupeDoors(L);
  dedupeParallelDoors(L);
  /* after all of that, anything left standing in a wall with stone
     behind it is masonry, not a doorway */
  brickUpBlindDoors(L);
  /* Anything that changes the shape of the floor has to leave the stone
     round it right.  This runs again after the vault and the hidden room
     are sealed, and that sealing digs fresh corridors - which were left
     with raw rock against them because nothing re-derived the walls. */
  buildWalls(L);
  buildCorridorWalls(L);
  /* And last, tell the rooms what shape they are now.  Every pass above
     can take floor away, and a room's list of its own squares was never
     brought up to date - so a room could still be holding coordinates
     that are solid rock, and everything that reads that list, from the
     lighting to where a monster is put down, was reading fiction. */
  refreshRooms(L);
  /* An opening that the tidying has since walled up is not an opening.
     The mark outlived the gap, the way a room's floor list used to
     outlive its floor. */
  for (var ai in L.arch)
    if (!walkTile(L.tiles[ai | 0])) delete L.arch[ai];
}

/* Rebuild each room's floor list from what is actually on the map, and
   move its centre onto a square that still exists.  A room left with
   nothing is marked gone rather than kept as an empty shell. */
/* A square that powder has opened belongs to whatever it opened into.

   A room is drawn lit from its own list of floors, and a square that is
   on no room's list is treated like a piece of hallway: dark unless you
   are standing next to it.  So blowing a wall out of a lit room left a
   dim band running exactly where the wall had been - the wall was gone,
   and its shadow was still there.

   Rooms are grown outward a square at a time so that a two-deep hole
   fills in from the room side, and the far lip of it - which belongs to
   whatever is on the far side - keeps whatever room it already had. */
function adoptOpened(L, cells) {
  var pass, i, d, added = 0;
  for (pass = 0; pass < BARREL_BLAST; pass++) {
    for (i = 0; i < cells.length; i++) {
      var x = cells[i][0], y = cells[i][1], j = y * MAP_W + x;
      if (L.tiles[j] !== FLOOR || L.roomAt[j] >= 0) continue;
      var ri = -1;
      for (d = 0; d < DIR4.length; d++) {
        var k = (y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0]);
        if (L.tiles[k] === FLOOR && L.roomAt[k] >= 0) { ri = L.roomAt[k]; break; }
      }
      if (ri < 0) continue;                    /* it opened into hallway or rock */
      var r = L.rooms[ri];
      if (!r || r.gone || !r.floors) continue;
      L.roomAt[j] = ri;
      r.floors.push([x, y]);
      added++;
    }
  }
  return added;
}

function refreshRooms(L) {
  var i, f, dropped = 0;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || !r.floors) continue;
    var live = [], sx = 0, sy = 0;
    for (f = 0; f < r.floors.length; f++) {
      var x = r.floors[f][0], y = r.floors[f][1], j = y * MAP_W + x;
      if (!walkTile(L.tiles[j])) continue;
      if (L.roomAt[j] !== r.idx) continue;
      live.push(r.floors[f]); sx += x; sy += y;
    }
    if (live.length !== r.floors.length) dropped += r.floors.length - live.length;
    r.floors = live;
    if (!live.length) { r.gone = 1; continue; }
    /* the centre, nearest the middle of what is left */
    var mcx = sx / live.length, mcy = sy / live.length, bd = 1e9;
    for (f = 0; f < live.length; f++) {
      var dd = Math.abs(live[f][0] - mcx) + Math.abs(live[f][1] - mcy);
      if (dd < bd) { bd = dd; r.cx = live[f][0]; r.cy = live[f][1]; }
    }
  }
  return dropped;
}

function dedupeDoors(L) {
  var T = L.tiles, i, j;
  var start = null;
  for (i = 0; i < L.rooms.length; i++)
    if (!L.rooms[i].gone) { start = L.rooms[i]; break; }
  if (!start) return;

  function isDoorTile(t) { return t === DOOR || t === SDOOR || t === LOCKED; }
  /* Every walkable square, not just the room centres: bricking up a door
     can leave a corridor stub hanging off nothing while every centre is
     still perfectly reachable. */
  function connected() { return everywhereReachable(L); }

  /* one pass to find the offenders, then only test those */
  var doors = [];
  for (i = 0; i < T.length; i++) if (isDoorTile(T[i])) doors.push(i);
  var touching = [];
  for (j = 0; j < doors.length; j++) {
    i = doors[j];
    var x = i % MAP_W, y = (i / MAP_W) | 0;
    if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
    for (var d = 0; d < 4; d++) {
      var n = (y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0]);
      if (isDoorTile(T[n])) { touching.push(i); break; }
    }
  }
  for (j = 0; j < touching.length; j++) {
    i = touching[j];
    if (!isDoorTile(T[i])) continue;
    var old = T[i];
    T[i] = WALL;
    if (!connected()) T[i] = old;         /* that one was load bearing */
    else { delete L.locks[i]; delete L.doorMat[i]; }
  }
}

var SECRET_OK = false;
function dig(T, x, y) {
  if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) return;
  var t = T[y * MAP_W + x];
  if (t === ROCK) { T[y * MAP_W + x] = CORR; return; }
  if (t !== WALL) return;
  if (SECRET_OK && rnd(100) < 22) { T[y * MAP_W + x] = SDOOR; return; }
  /* Not every way between two spaces was ever hung with a door.  Some
     are simply gaps in the stone - which matters for more than the look
     of them: an opening does not stop sight, or arrows, or light. */
  if (rnd(100) < ARCH_PCT) {
    T[y * MAP_W + x] = CORR;
    if (DIG_L) DIG_L.arch[y * MAP_W + x] = 1;   /* an opening, not a hallway */
  } else T[y * MAP_W + x] = DOOR;
}
/* dig() is handed a raw tile array, so the floor it belongs to is told
   to it separately rather than threaded through every caller. */
var DIG_L = null;

/* 4-way flood fill - matches the player's orthogonal-only movement.
   "keys" is an optional map of material -> 1 for locks you can already open;
   pass true to treat every lock as open. */
var _reachSeen = null, _reachStack = null;
function reachSet(Lv, sx, sy, keys) {
  var N = MAP_W * MAP_H, T = Lv.tiles;
  if (!_reachSeen || _reachSeen.length < N) {
    _reachSeen = new Uint8Array(N); _reachStack = new Int32Array(N);
  }
  var seen = _reachSeen, stack = _reachStack;
  seen.fill(0);
  var sp = 0, s0 = sy * MAP_W + sx;
  seen[s0] = 1; stack[sp++] = s0;
  while (sp) {
    var c = stack[--sp];
    var cx = c % MAP_W, cy = (c / MAP_W) | 0;
    for (var i = 0; i < 4; i++) {
      var nx = cx + DIR4[i][0], ny = cy + DIR4[i][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var n = ny * MAP_W + nx;
      if (seen[n]) continue;
      var t = T[n];
      /* This listed what stops you rather than what lets you through, so
         a tile it had never heard of counted as open floor - and a wall
         of iron bars was walked through as if it were not there. */
      if (t === ROCK || t === WALL || t === SDOOR || t === HOLE || t === BARS) continue;
      if (t === LOCKED && keys !== true && !(keys && keys[Lv.locks[n]])) continue;
      seen[n] = 1; stack[sp++] = n;
    }
  }
  return seen;
}
/* reachSet reuses one buffer, so take a copy if you need to keep it */
function reachCopy(Lv, sx, sy, keys) {
  return new Uint8Array(reachSet(Lv, sx, sy, keys));
}

/* Which squares a lit room is throwing light on: its own floor, and
   nothing else.  Precomputed because the sight pass asks for it
   constantly.

   The walls and doorways round a lit room used to be in here too, so
   that a room never looked like it had holes punched in its outline.
   But the map is what decides how far a square can be seen from, so it
   also meant a door was visible from nine squares away while the
   corridor you were standing in ran out at four - doors and walls
   floating in the dark, seen from further off than the floor.  Drawing
   the outline is the sight pass's own job: it lights any wall or door
   that touches a square you can actually see. */
/* Which squares are pitch dark.  Whole rooms, and stretches of hallway,
   picked when the floor is built and then left alone - except by a wand
   of darkness, which puts a lit room out. */
function buildDarkMap(L, depth) {
  var m = new Uint8Array(MAP_W * MAP_H), i, f;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (!r.dark || r.gone) continue;
    for (f = 0; f < r.floors.length; f++)
      m[r.floors[f][1] * MAP_W + r.floors[f][0]] = 1;
  }
  for (i = 0; i < L.tiles.length; i++) if (L.darkHall && L.darkHall[i]) m[i] = 1;
  L.darkMap = m;
}
/* Mark some rooms and some runs of hallway as unlit before the map is
   built.  A dark room is dark whether or not it was ever lit. */
function pickDarkness(L, depth) {
  var i, j;
  L.darkHall = {};
  if (depth < DARK_MIN_DEPTH) { buildDarkMap(L, depth); return; }
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || r.special || r.sealed) continue;
    if (rnd(100) < DARK_ROOM_PCT) { r.dark = 1; r.lit = 0; }
  }
  /* a stretch of hallway that the lamps have gone out along */
  var seeds = [];
  for (i = 0; i < L.tiles.length; i++) if (L.tiles[i] === CORR) seeds.push(i);
  shuffle(seeds);
  var want = Math.round(seeds.length * DARK_HALL_PCT / 100);
  var done = 0;
  for (i = 0; i < seeds.length && done < want; i++) {
    if (L.darkHall[seeds[i]]) continue;
    /* walk the hallway out from here, both ways, for a little while */
    var open = [seeds[i]], seen = {}, run = 0;
    seen[seeds[i]] = 1;
    while (open.length && run < DARK_HALL_RUN) {
      var c = open.shift(), cx = c % MAP_W, cy = (c / MAP_W) | 0;
      L.darkHall[c] = 1; done++; run++;
      for (j = 0; j < DIR4.length; j++) {
        var k = (cy + DIR4[j][1]) * MAP_W + (cx + DIR4[j][0]);
        if (seen[k] || L.tiles[k] !== CORR) continue;
        seen[k] = 1; open.push(k);
      }
    }
  }
  buildDarkMap(L, depth);
  spillLight(L);
}

/* Light from a lit space runs through any opening into the dark beyond
   it, a few squares in, and stops at anything that would stop sight.  A
   door stops it; a gap in the wall does not - which is the whole
   difference between the two.  Run again whenever a wall comes down. */
function spillLight(L) {
  if (!L.darkMap || !L.litMap) return 0;
  var open = [], seen = {}, i, x, y, lit = 0;
  for (i = 0; i < L.tiles.length; i++) {
    if (!L.litMap[i] || L.darkMap[i]) continue;
    if (!walkTile(L.tiles[i])) continue;
    open.push([i % MAP_W, (i / MAP_W) | 0, 0]);
    seen[i] = 1;
  }
  var head = 0;
  while (head < open.length) {
    var c = open[head++], cx = c[0], cy = c[1], step = c[2];
    if (step >= SPILL_RANGE) continue;
    for (var d = 0; d < 4; d++) {
      var nx = cx + DIR4[d][0], ny = cy + DIR4[d][1], k = ny * MAP_W + nx;
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      if (seen[k]) continue;
      var nt = L.tiles[k];
      if (!walkTile(nt)) continue;
      /* a shut door is a shut door, whatever is burning behind it */
      if (nt === DOOR || nt === SDOOR || nt === LOCKED) continue;
      seen[k] = 1;
      /* Anywhere the light was not already, not only the rooms marked
         pitch dark.  Most unlit rooms are not marked dark at all - they
         are simply rooms nobody left a lamp in, which is the ordinary
         way a room is dark - and light stopped at the threshold of every
         one of them.  Blow a wall through into a lit room from inside
         one and nothing came in. */
      if (!L.litMap[k]) { L.darkMap[k] = 0; L.litMap[k] = 1; lit++; }
      open.push([nx, ny, step + 1]);
    }
  }
  return lit;
}

/* Moss over whatever of a moss garden is still bare floor - but not all
   of it.  This runs after the garden has already been mossed once, and
   between them the two passes used to leave a cave carpeted end to end
   with barely a square of stone showing.  A few bare spots are what the
   edge tiles are for: the moss thins as it comes up to one. */
function remossGardens(L) {
  var i, f, laid = 0;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || r.special !== 'moss') continue;
    /* how many squares of bare stone this cave keeps */
    var keep = Math.max(MOSS_BARE_MIN,
      Math.round(r.floors.length * MOSS_BARE_PCT / 100));
    var bare = [];
    for (f = 0; f < r.floors.length; f++) {
      var j = r.floors[f][1] * MAP_W + r.floors[f][0];
      if (L.tiles[j] !== FLOOR) continue;
      if (!L.decor[j]) bare.push(j);
    }
    shuffle(bare);
    for (f = keep; f < bare.length; f++) {
      L.decor[bare[f]] = pick(MOSS_FIELD);
      laid++;
    }
    /* and clear a few squares that the first pass had covered, so the
       bare spots are scattered through the moss rather than only where
       the first pass happened to miss */
    var mossy = [];
    for (f = 0; f < r.floors.length; f++) {
      var k2 = r.floors[f][1] * MAP_W + r.floors[f][0];
      if (isMoss(L.decor[k2]) && !isMossEdge(L.decor[k2])) mossy.push(k2);
    }
    shuffle(mossy);
    var more = keep - Math.min(keep, bare.length);
    for (f = 0; f < more && f < mossy.length; f++) delete L.decor[mossy[f]];
  }
  return laid;
}

function buildLitMap(L) {
  var m = new Uint8Array(MAP_W * MAP_H), i, f;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || !r.lit) continue;
    for (f = 0; f < r.floors.length; f++)
      m[r.floors[f][1] * MAP_W + r.floors[f][0]] = 1;
  }
  L.litMap = m;
}

function randRoom(L) {
  var solid = [];
  for (var i = 0; i < L.rooms.length; i++) if (!L.rooms[i].gone) solid.push(L.rooms[i]);
  return solid.length ? solid[rnd(solid.length)] : L.rooms[0];
}
function randSpot(L, r) {
  if (r.gone || !r.floors.length) return { x: r.x, y: r.y };
  var t, f;
  for (t = 0; t < 60; t++) {
    f = r.floors[rnd(r.floors.length)];
    if (L.tiles[f[1] * MAP_W + f[0]] === FLOOR) return { x: f[0], y: f[1] };
  }
  for (t = 0; t < r.floors.length; t++) {
    f = r.floors[t];
    if (L.tiles[f[1] * MAP_W + f[0]] === FLOOR) return { x: f[0], y: f[1] };
  }
  return { x: r.cx, y: r.cy };
}
