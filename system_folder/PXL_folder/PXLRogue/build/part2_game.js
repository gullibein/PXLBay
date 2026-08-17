/* ============================================================ ROGUE-8
   Part 2 : items, slot inventory, player, monsters, line of sight.
   ============================================================ */

var G = null, P = null, L = null;
var APPEAR = null, KNOWN = null;

var EQ_ORDER = ['rh', 'body', 'lh', 'head', 'feet'];
var EQ_LABEL = { rh: 'RH', body: 'BD', lh: 'LH', head: 'HD', feet: 'FT' };
var EQ_LONG = { rh: 'right hand', body: 'body', lh: 'left hand', head: 'head', feet: 'feet' };
var N_SLOTS = 20, POUCH_CAP = 10;
/* A chest is a container like a pouch, but one you leave on the floor:
   five squares, which is exactly what one has ever held. */
var CHEST_CAP = 5;

/* ---------------------------------------------------------- appearances */
function makeAppearances() {
  var i, j;
  APPEAR = { pot: [], scr: [], wand: [], wandType: [], wandSpr: [], stone: {} };
  KNOWN = { pot: [], scr: [], wand: [], weap: [] };
  /* Two different things are hidden about a piece of kit, and they are
     learned separately.  KNOWN.gear says you recognise the kind on
     sight - a long sword, not "a notched blade".  it.known says you
     know what this particular one is worth, numbers and curse and all.
     Wearing one teaches you both about that one, and the kind for good. */
  KNOWN.gear = { weapon: [], armor: [], head: [], feet: [], shield: [] };
  APPEAR.gear = { weapon: [], armor: [], head: [], feet: [], shield: [] };

  /* one look per kind of gear, so a second long sword looks like the
     first and you can put two and two together */
  var looks = shuffle(GEAR_LOOKS.slice()), li = 0;
  function dressUp(list, key) {
    for (var g = 0; g < list.length; g++) {
      if (!list[g].gen) { APPEAR.gear[key].push(''); continue; }
      APPEAR.gear[key].push(looks[li++ % looks.length]);
    }
  }
  dressUp(WEAPONS, 'weapon');
  dressUp(ARMORS, 'armor');
  dressUp(HEADS, 'head');
  dressUp(FEET, 'feet');
  dressUp(SHIELDS, 'shield');

  var cols = shuffle(P_COLORS.slice());
  for (i = 0; i < POTIONS.length; i++) { APPEAR.pot.push(cols[i]); KNOWN.pot.push(0); }

  var usedTitles = {};
  for (i = 0; i < SCROLLS.length; i++) {
    var t, guard = 0;
    do {
      t = '';
      var nw = rnd(2) + 2;
      for (j = 0; j < nw; j++) {
        var word = '', ns = rnd(2) + 1;
        for (var k = 0; k < ns; k++) word += pick(SYL);
        if (word.length > 8) word = word.substr(0, 8);
        var nt = t + (j ? ' ' : '') + word;
        if (nt.length > 22) break;
        t = nt;
      }
      if (!t) t = pick(SYL) + pick(SYL);
      guard++;
    } while (usedTitles[t] && guard < 40);
    usedTitles[t] = 1;
    APPEAR.scr.push(t);
    /* everyone knows what an identify scroll looks like */
    KNOWN.scr.push(SCROLLS[i].n === 'identify' ? 1 : 0);
  }

  /* A runed stone gives nothing away by looking at it.  Each rune wore
     its own carving, in the same order every run, so a blasting stone
     was a blasting stone the moment it appeared on the floor - which is
     the whole of what identifying one is for.  The five looks are dealt
     out afresh each game. */
  var stoneLooks = shuffle(RUNE_STONE_SPRITES.slice()), sli = 0;
  for (i = 0; i < WEAPONS.length; i++) {
    if (!WEAPONS[i].rune) continue;
    APPEAR.stone[i] = stoneLooks[sli++ % stoneLooks.length];
  }

  /* Two shapes and five carvings between them, so a run does not hand
     you six wands that all look like the same stick.  The sprite goes
     with the name: a copper wand and a birch staff are different things
     to look at as well as different words. */
  var woods = shuffle(WOODS.slice()), metals = shuffle(METALS.slice());
  var wandSprs = shuffle(WAND_SPRITES.slice()), staffSprs = shuffle(STAFF_SPRITES.slice());
  var wi = 0, mi = 0, ws = 0, ss = 0;
  for (i = 0; i < WANDS.length; i++) {
    if (rnd(2)) {
      APPEAR.wand.push(woods[wi++] + ' staff'); APPEAR.wandType.push('staff');
      APPEAR.wandSpr.push(staffSprs[ss++ % staffSprs.length]);
    } else {
      APPEAR.wand.push(metals[mi++] + ' wand'); APPEAR.wandType.push('wand');
      APPEAR.wandSpr.push(wandSprs[ws++ % wandSprs.length]);
    }
    KNOWN.wand.push(0);
  }
}

/* The whole of the game's running state, in one place, so the test
   harness and a real game can never drift apart. */
function freshG() {
  return {
    depth: 0, maxDepth: 1, turn: 0, msgq: [], msgIdx: 0, mode: 'play',
    dead: 0, deathBy: '', hungerState: 0, amuletMade: 0, bolt: null, log: [],
    level: null, floors: {}, pendingFall: 0, queuePick: null, pickJob: null, beat: 0,
    ask: null,
    perkPick: null, choice: null, pause: null, look: null,
    titleMenu: null, walk: null, ctx: null, drag: null, waiting: null,
    openBox: null, box: null,
    deadAt: 0, pouchT: 0, pouchLast: null,
    cur: { r: 0, c: 0 }, pcur: { r: 0, c: 0 }, sel: null, pouch: null,
    menu: null, invMode: 'normal', aim: null, invOpen: 0, splash: null,
    slots: null, hint: null, pan: null, wasDark: 0,
    shot: null, targets: [], tIdx: 0, bl: null, pouchMade: 0, throwing: null,
    monUid: 0,
    aimSq: null, drops: null,
    ret: null,
    ringsMade: {},
    holyFloors: pickHolyFloors(),
    pouchFloor: POUCH_FLOOR_MIN + rnd(POUCH_FLOOR_MAX - POUCH_FLOOR_MIN + 1)
  };
}

/* ---------------------------------------------------------- items */
function mkItem(t, k) {
  var it = { t: t, k: k, cnt: 1, hp: 0, dp: 0, ap: 0, ch: 0, cursed: 0, known: 0,
             tried: 0, x: 0, y: 0 };
  if (t === 'pouch') { it.items = new Array(POUCH_CAP).fill(null); }
  if (t === 'chest') { it.items = new Array(CHEST_CAP).fill(null); it.gold = 0; }
  if (t === 'crystal' || t === 'pin' || t === 'dynamite') { it.known = 1; }
  if (t === 'weapon' && KNOWN && KNOWN.weap && KNOWN.weap[k]) it.known = 1;
  /* A ring says what it is on the band.  It comes with its charges and
     keeps its own clock for winding one back on. */
  /* The ring of invisibility holds one charge, not three: vanishing is
     worth more than stepping five squares, so it comes rarer. */
  if (t === 'ring') {
    it.known = 1;
    /* Once a run has seen this ring, it has seen it.  Marked here rather
       than at the drop so a ring off a leprechaun counts too. */
    if (G && G.ringsMade) G.ringsMade[k] = 1;
    it.ch = RINGS[k].charges === undefined ? RING_CHARGES : RINGS[k].charges;
    it.wind = 0;
  }
  return it;
}
function pouchCount(p) {
  var c = 0;
  for (var i = 0; i < POUCH_CAP; i++) if (p.items[i]) c++;
  return c;
}
function itemDef(it) {
  switch (it.t) {
    case 'weapon': return WEAPONS[it.k];
    case 'armor': return ARMORS[it.k];
    case 'head': return HEADS[it.k];
    case 'feet': return FEET[it.k];
    case 'shield': return SHIELDS[it.k];
    case 'potion': return POTIONS[it.k];
    case 'scroll': return SCROLLS[it.k];
    case 'wand': return WANDS[it.k];
    case 'ring': return RINGS[it.k];
  }
  return null;
}
function isGear(it) { return it.t === 'armor' || it.t === 'head' || it.t === 'feet' || it.t === 'shield'; }
function gearAC(it) { return (itemDef(it).a || 0) + it.ap; }

/* Is this the very thing you are wearing or holding? */
function isEquipped(it) {
  for (var k in P.eq) if (P.eq[k] === it) return true;
  return false;
}
/* What the pack is allowed to tell you about a thing's numbers.

   A cursed breastplate protects less than a breastplate should, and a
   cursed blade hits softer - so printing the real figure gave the curse
   away before you ever put the thing on, and nobody would ever be
   caught by one.  Until you have worn it or identified it you are told
   what is ordinary for its kind, which is all you could really know by
   looking. */
function numbersKnown(it) { return !!(it.known || isEquipped(it)); }
function shownAC(it) {
  return numbersKnown(it) ? gearAC(it) : (itemDef(it).a || 0);
}

function enchantGear(it, def) {
  if (def.bad) { layCurse(it); return; }
  var r = rnd(100);
  if (r < 16) { layCurse(it); it.ap = -(rnd(3) + 1); }
  else if (r < 26) { it.ap = rnd(2) + 1; }
  /* headwear draws from the worn runes and from the one that is only
     ever cut into a hood or a cap */
  addRune(it, it.t === 'head' ? 'gh' : 'g', 18);
  if (it.br === 'clearwater') it.wet = 1;    /* found with a charge in it */
}

/* Give an item a rune now and then.  A bad one comes with a curse. */
function addRune(it, kind, chance) {
  if (it.br) return;
  if (rnd(100) >= chance) return;
  /* Both sides are sets of letters: the item asks with 'w', 'g' or 'gh',
     and a rune answers with the slots it can be cut into.  This used to
     ask whether the rune's whole type appeared inside the item's, which
     works for single letters and silently fails for anything longer -
     'w'.indexOf('wg') is -1, so the one rune that goes on both a blade
     and a breastplate could never be rolled at all. */
  var pool = [], i, c;
  for (i = 0; i < RUNES.length; i++) {
    var fits = false;
    for (c = 0; c < RUNES[i].t.length; c++)
      if (kind.indexOf(RUNES[i].t.charAt(c)) >= 0) fits = true;
    if (fits) pool.push(RUNES[i]);
  }
  var pick2 = pool[weightedPick(pool)];
  it.br = pick2.n;
  if (pick2.bad) layCurse(it);
}
function runeDef(it) { return it && it.br ? RUNE_BY_NAME[it.br] : null; }
/* The rune that is actually doing something: a latent one sleeps until
   you have identified the item it is cut into. */
/* An enchantment is a secret whatever it is.  Putting a thing on tells
   you what the thing is - its name, its plusses, whether it is cursed -
   and nothing at all about the magic worked into it.  For that you have
   to study it or read a scroll over it, and until you have, it does
   nothing: an enchantment you do not know about is one you are not
   getting the benefit of. */
function activeRune(it) {
  var r = runeDef(it);
  if (!r) return null;
  if (!it.brKnown) return null;
  return r;
}
/* and the one place that lets the secret out */
function learnRune(it) {
  if (!it || !it.br || it.brKnown) return 0;
  it.brKnown = 1;
  return 1;
}
/* ------------------------------------------------- clearwater
   A cap of clearwater holds a charge of water.  Worn wet it hides you
   for ten turns.  Take it off, or strike anything, and the charge is
   spent and you are there again.  The only way to fill it is to leave it
   in the water and pick it up dripping. */
function isClearwater(it) {
  return !!(it && it.t === 'head' && it.br === 'clearwater');
}
function wearClearwater(it) {
  if (!isClearwater(it) || !activeRune(it)) return;
  if (!it.wet) { msg('The cap is dry. Nothing happens.', '6'); return; }
  it.wet = 0;
  P.unseen = Math.max(P.unseen, CLEARWATER_TURNS);
  msg('Cold water runs down your face. You fade out of sight.', 'c');
}
/* Everything that happens when a worn thing comes off.  It lives here so
   the one path is what the tests exercise as well. */
function takeOffEffects(it) {
  if (isClearwater(it)) breakClearwater('You are visible again.');
}

/* whatever ends it - taking the thing off, or hitting something */
function breakClearwater(why) {
  if (P.unseen <= 0) return 0;
  P.unseen = 0;
  msg(why, 'y');
  return 1;
}

/* ------------------------------------------------------------- perks
   You either have one or you do not.  Every effect in the game asks this
   one question, in the one place that already computes the number the
   perk is meant to change. */
function hasPerk(id) { return !!(P.perks && P.perks[id]); }

/* ----------------------------------------------------------- wading
   Water is thigh deep.  Every second step through it costs you the turn
   - the dungeon gets a move and you do not - so a pool is somewhere you
   can be caught rather than a blue patch of floor.

   Riverborn turns that on its head, and it is not only about crossing:
   standing in water, every second thing you do is free, so you act twice
   for each turn the dungeon takes.  Water becomes your ground. */
function inWater(x, y) {
  var tt = tileAt(x, y);
  return tt === WATER || tt === HOLY;
}
/* what a step just cost you: 1 for a lost turn, -1 for a free one, 0 for
   an ordinary step */
function wadeStep(moved) {
  if (!inWater(P.x, P.y)) { P.wade = 0; return 0; }
  P.wade = (P.wade || 0) + 1;
  if (hasPerk('riverborn')) {
    /* anything at all, not just a step: you are at home in it */
    if (P.wade < RIVER_FREE_EVERY) return 0;
    P.wade = 0;
    return -1;
  }
  /* but wading is about getting across.  Swinging a sword while you
     stand in it is no slower than swinging it anywhere else. */
  if (!moved) { P.wade--; return 0; }
  if (P.wade < WADE_EVERY) return 0;
  P.wade = 0;
  return 1;
}
/* and the same for a creature, unless the water is nothing to it */
function monWades(m) {
  if (m.def.swim || m.def.fly) return false;
  if (!inWater(m.x, m.y)) { m.wade = 0; return false; }
  m.wade = (m.wade || 0) + 1;
  if (m.wade < WADE_EVERY) return false;
  m.wade = 0;
  return true;                      /* this step is spent getting through it */
}
function perkList() {
  var out = [], i;
  for (i = 0; i < PERKS.length; i++) if (hasPerk(PERKS[i].id)) out.push(PERKS[i]);
  return out;
}
/* the ones still on the table, in a random order */
function perkOffer() {
  var pool = [], i;
  for (i = 0; i < PERKS.length; i++) if (!hasPerk(PERKS[i].id)) pool.push(PERKS[i]);
  shuffle(pool);
  return pool.slice(0, PERK_OFFER);
}
function takePerk(id) {
  if (!PERK_BY_ID[id]) return false;
  P.perks[id] = 1;
  msg('You have learned: ' + PERK_BY_ID[id].n + '.', 'c');
  msg(cap(PERK_BY_ID[id].txt) + '.', 'c');
  return true;
}
/* Does this level hand you the choice?  Only the listed ones do, and
   only the first time you reach them - draining a level and earning it
   back does not pay out twice. */
function perkLevel(lv) { return PERK_LEVELS.indexOf(lv) >= 0; }

function hasRune(name) {
  var e = equippedItems();
  for (var i = 0; i < e.length; i++) {
    var r = activeRune(e[i]);
    if (r && r.n === name) return e[i];
  }
  return null;
}
/* The same, but only what you are wearing.  A rune that can be cut into
   either a blade or a breastplate has a different job in each, and the
   armour's job must not be done by the sword in your hand. */
function hasGearRune(name) {
  var i, keys = ['body', 'lh', 'head', 'feet'];
  for (i = 0; i < keys.length; i++) {
    var it = P.eq[keys[i]];
    if (!it || !isGear(it)) continue;
    var r = activeRune(it);
    if (r && r.n === name) return it;
  }
  return null;
}
function weaponRune() {
  return P.eq.rh ? activeRune(P.eq.rh) : null;
}

/* Some weapons do not belong near the surface.  Roll again rather than
   handing a throwing dagger to somebody on the first floor. */
function pickWeaponFor(depth) {
  for (var t = 0; t < 24; t++) {
    var k = weightedPick(WEAPONS);
    var W = WEAPONS[k];
    if (!W.minDepth || depth >= W.minDepth) return k;
  }
  return weaponIndex('dagger');
}

function newItem(depth) {
  var t = THINGS[weightedPick(THINGS)].t, it, k;
  switch (t) {
    case 'food': it = mkItem('food', weightedPick(FOODS)); break;
    case 'potion': it = mkItem('potion', weightedPick(POTIONS)); break;
    case 'scroll': it = mkItem('scroll', weightedPick(SCROLLS)); break;
    case 'wand': k = weightedPick(WANDS); it = mkItem('wand', k); it.ch = 3 + rnd(8); break;
    case 'weapon': {
      k = pickWeaponFor(depth); it = mkItem('weapon', k);
      if (WEAPONS[k].grp) it.cnt = pileSize(k);
      var r = rnd(100);
      if (r < 10) { layCurse(it); it.hp = -(rnd(3) + 1); }
      else if (r < 17) { it.hp = rnd(3) + 1; it.dp = rnd(2); }
      /* A bow asks with 'b' too, so the runes that only make sense on
         something you shoot can be rolled onto one and onto nothing
         else. */
      if (!WEAPONS[k].grp) addRune(it, WEAPONS[k].launch ? 'wb' : 'w', 16);
      break;
    }
    case 'armor': k = weightedPick(ARMORS); it = mkItem('armor', k); enchantGear(it, ARMORS[k]); break;
    case 'head': k = weightedPick(HEADS); it = mkItem('head', k); enchantGear(it, HEADS[k]); break;
    case 'feet': k = weightedPick(FEET); it = mkItem('feet', k); enchantGear(it, FEET[k]); break;
    case 'shield': k = weightedPick(SHIELDS); it = mkItem('shield', k); enchantGear(it, SHIELDS[k]); break;
    case 'ring': {
      /* One of each in a run.  If the set is complete the dungeon has
         nothing left to give here, so it gives a wand instead rather
         than a second ring nobody can tell from the first. */
      var rk = pickUnfoundRing();
      if (rk < 0) { k = weightedPick(WANDS); it = mkItem('wand', k); it.ch = 3 + rnd(8); }
      else it = mkItem('ring', rk);
      break;
    }
  }
  return it;
}

function artic(s) { return ('aeiou'.indexOf(s[0]) >= 0 ? 'an ' : 'a ') + s; }
/* Some things are a pair: boots and sandals are not "a boots". */
function articPl(s, plural) { return plural ? 'a pair of ' + s : artic(s); }
function sgn(n) { return (n >= 0 ? '+' : '') + n; }

function itemName(it) {
  if (!it) return 'nothing';
  var n = it.cnt || 1, s = '';
  switch (it.t) {
    case 'gold': s = it.cnt + ' gold pieces'; break;
    case 'amulet': s = 'the Amulet of Yendor'; break;
    case 'pouch': s = 'a pouch (' + pouchCount(it) + '/' + POUCH_CAP + ')'; break;
    case 'key': s = artic(MATS[it.k] + ' key'); break;
    case 'crystal': s = (n > 1) ? (n + ' healing crystals') : 'a healing crystal'; break;
    case 'pin': s = (n > 1) ? (n + ' magical pins') : 'a magical pin'; break;
    case 'dynamite': s = (n > 1) ? (n + ' sticks of dynamite') : 'a stick of dynamite'; break;
    case 'chest': s = it.lock ? artic(MATS[it.lock] + ' chest (locked)') : 'a wooden chest'; break;
    case 'food':
      s = (n > 1) ? (n + ' ' + FOODS[it.k].pl) : artic(FOODS[it.k].n);
      break;
    case 'potion': {
      var d = KNOWN.pot[it.k] ? 'potion of ' + POTIONS[it.k].n : APPEAR.pot[it.k] + ' potion';
      s = (n > 1) ? (n + ' ' + d + 's') : artic(d);
      break;
    }
    case 'scroll': {
      var d2 = KNOWN.scr[it.k] ? 'scroll of ' + SCROLLS[it.k].n
        : "scroll '" + APPEAR.scr[it.k] + "'";
      s = (n > 1) ? (n + ' ' + d2 + 's') : artic(d2);
      break;
    }
    case 'wand': {
      var d3 = KNOWN.wand[it.k] ? (APPEAR.wandType[it.k] + ' of ' + WANDS[it.k].n) : APPEAR.wand[it.k];
      s = artic(d3);
      if (KNOWN.wand[it.k]) s += ' [' + it.ch + ']';
      break;
    }
    case 'ring':
      /* A ring that works by being carried holds nothing, so it has no
         count to show: "[0]" reads as spent rather than as always on. */
      s = 'the ring of ' + RINGS[it.k].n +
          (RINGS[it.k].worn ? '' : ' [' + it.ch + ']');
      break;
    case 'weapon': {
      var W = WEAPONS[it.k];
      /* Not yet identified: you have a blade in your hands and no idea
         what sort.  All you can say is what it looks like. */
      if (hidesItsName(it)) {
        /* You cannot name it, but you can feel what it is worth: a thing
           you are holding shows its plusses and its curse against the
           word for what it looks like. */
        var lk = numsPrefix(it) + looksLike(it);
        s = (n > 1) ? (n + ' ' + lk + 's') : artic(lk);
        break;
      }
      if (!it.known && (W.rune || it.br)) {
        /* You can see there is writing on it, not what it says - and the
           name must not give the game away either. */
        var plain = W.rune ? 'stone' : W.n;
        s = (n > 1) ? (n + ' ' + plain + 's with strange letters')
                    : artic(plain + ' with strange letters');
        break;
      }
      /* Nothing to say about a plain blade: "+0,+0" is just noise.  Once
         you know there is nothing to know, say so. */
      /* A curse is the one thing about a piece of kit you cannot undo
         by putting it down, so once you know it is there it belongs in
         the name - not only in a line you have to select the item to
         read.  The message when you put it on scrolls away; the name
         does not. */
      /* Three separate pieces of knowledge, and putting a thing on only
         gives you one of them.  Its weight in the hand tells you what it
         is worth and whether it will come off again; what it is called
         and what is worked into it are still its own business. */
      var curse = (numbersKnown(it) && it.cursed) ? 'cursed ' : '';
      var pfx = curse + ((numbersKnown(it) && (it.hp || it.dp))
        ? (sgn(it.hp) + ',' + sgn(it.dp) + ' ') : '');
      /* a blasting stone is already named for what it does */
      var sfx = (it.brKnown && it.br && !W.rune) ? ' of ' + it.br : '';
      /* A stone is a stone.  There used to be a "normal " here for an
         identified thing with nothing special about it, so you could
         tell it from one you had not looked at yet - but the pack
         already says "no enchantment" against the one and "enchantment
         unknown" against the other, so the word was only ever making
         "normal arrows" out of arrows. */
      s = (n > 1) ? (n + ' ' + pfx + W.n + 's' + sfx) : artic(pfx + W.n + sfx);
      break;
    }
    default: {
      if (isGear(it)) {
        var A = itemDef(it);
        /* Not yet identified: all you can say is what it looks like. */
        if (hidesItsName(it)) { s = articPl(numsPrefix(it) + looksLike(it), A.pl); break; }
        var pfx2 = ((numbersKnown(it) && it.cursed) ? 'cursed ' : '') +
                   ((numbersKnown(it) && it.ap) ? (sgn(it.ap) + ' ') : '');
        var sfx2 = (it.brKnown && it.br) ? ' of ' + it.br : '';
        /* The total protection used to be tacked on the end in brackets.
           It is in the notes under the name already, it meant nothing to
           anybody who had not worked out what it was, and it made long
           names longer - which pushed the whole right hand column down
           a line. */
        s = articPl(pfx2 + A.n + sfx2, A.pl);
      }
    }
  }
  return s;
}

function itemSprite(it) {
  switch (it.t) {
    case 'gold': return it.cnt > 60 ? 'gold2' : 'gold';
    case 'amulet': return 'amulet';
    case 'pouch': return 'pouch';
    case 'pin': return 'pin';
    case 'dynamite': return 'dynamite';
    case 'key': return 'key_' + MATS[it.k];
    case 'chest': return it.seen ? 'chest_open'
      : it.lock ? 'chest_' + MATS[it.lock] : 'chest';
    case 'crystal': return 'crystal';
    case 'food': return FOODS[it.k].s;
    case 'potion': return P_SPRITE[APPEAR.pot[it.k]] || 'pot_b';
    case 'scroll': return 'scroll';
    case 'wand': return APPEAR.wandSpr[it.k] ||
      (APPEAR.wandType[it.k] === 'staff' ? 'staff' : 'wand');
    case 'ring': return RINGS[it.k].s;
  }
  /* A runed stone wears whichever carving this run dealt it. */
  if (isRuneStone(it) && APPEAR.stone && APPEAR.stone[it.k])
    return APPEAR.stone[it.k];
  var d = itemDef(it);
  return d && d.s ? d.s : 'void';
}

/* ---------------------------------------------------------- inventory */
function stackable(a, b) {
  if (!a || !b || a.t !== b.t || a.k !== b.k) return false;
  /* Sticks of dynamite are sticks of dynamite: nothing distinguishes one
     from the next, so a handful of them takes one slot. */
  if (a.t === 'potion' || a.t === 'scroll' || a.t === 'food' ||
      a.t === 'crystal' || a.t === 'dynamite' || a.t === 'pin') return true;
  if (a.t === 'weapon' && WEAPONS[a.k].grp)
    return a.hp === b.hp && a.dp === b.dp && a.cursed === b.cursed;
  return false;
}
function freeSlot() {
  for (var i = 0; i < N_SLOTS; i++) if (!P.slots[i]) return i;
  return -1;
}
function packCount() {
  var c = 0;
  for (var i = 0; i < N_SLOTS; i++) if (P.slots[i]) c++;
  return c;
}
/* try to add: stack, then free slot, then any open pouch */
function addItem(it) {
  var i;
  for (i = 0; i < N_SLOTS; i++)
    if (stackable(P.slots[i], it)) { P.slots[i].cnt += it.cnt; return P.slots[i]; }
  var f = freeSlot();
  if (f >= 0) { P.slots[f] = it; return it; }
  for (i = 0; i < N_SLOTS; i++) {
    var s = P.slots[i];
    if (s && s.t === 'pouch' && it.t !== 'pouch') {
      for (var j = 0; j < POUCH_CAP; j++)
        if (stackable(s.items[j], it)) { s.items[j].cnt += it.cnt; return s.items[j]; }
      for (j = 0; j < POUCH_CAP; j++)
        if (!s.items[j]) { s.items[j] = it; return it; }
    }
  }
  return null;
}
function equippedItems() {
  var a = [];
  for (var i = 0; i < EQ_ORDER.length; i++) { var e = P.eq[EQ_ORDER[i]]; if (e) a.push(e); }
  return a;
}
function carriedItems() {
  var a = equippedItems(), i, j;
  for (i = 0; i < N_SLOTS; i++) {
    var s = P.slots[i];
    if (!s) continue;
    a.push(s);
    if (s.t === 'pouch') for (j = 0; j < POUCH_CAP; j++) if (s.items[j]) a.push(s.items[j]);
  }
  return a;
}
/* You have learned what this kind of weapon looks like.  Potions and
   scrolls have a table of what you know; weapons carry it item by item,
   so learning one means walking the pack and telling the rest. */
/* You have watched this kind of stone work.  Every one you are carrying
   names itself, and so does every one you pick up afterwards - the
   lesson is about the rune, not about the particular pebble. */
function learnWeapon(k) {
  var all = carriedItems(), n = 0, i;
  if (KNOWN && KNOWN.weap) KNOWN.weap[k] = 1;
  for (i = 0; i < all.length; i++) {
    var it = all[i];
    if (it && it.t === 'weapon' && it.k === k && !it.known) { it.known = 1; n++; }
  }
  return n;
}
function slotOf(it) {
  for (var i = 0; i < N_SLOTS; i++) if (P.slots[i] === it) return i;
  return -1;
}
/* ---------------------------------------------------------- charges
   A scroll of charging puts half as much again into a thing that gets
   used up, rounded up - so the one-shot scroll in your pack becomes a
   two-shot.  Wands simply gain charges.  Everything else keeps a count
   of spare uses, and spending one of those is what happens instead of
   the thing being consumed. */
var CHARGE_MULT = 1.5;

function isRuneStone(it) {
  return it && it.t === 'weapon' && WEAPONS[it.k].rune;
}
function isPlainAmmo(it) {
  return it && it.t === 'weapon' && WEAPONS[it.k].grp && !WEAPONS[it.k].rune;
}
function chargeable(it) {
  if (!it) return false;
  return it.t === 'wand' || it.t === 'ring' || it.t === 'scroll' ||
         isRuneStone(it) || isPlainAmmo(it);
}
/* How many charges a ring holds.  The scroll of charging raises the roof
   as well as filling it, so a charged ring stays a bigger ring. */
function ringCap(it) {
  var base = RINGS[it.k].charges === undefined ? RING_CHARGES : RINGS[it.k].charges;
  return base + (it.cap || 0);
}
/* Which rings this run has not turned up yet.  The leprechaun's ring is
   never laid on a floor, so it is not in the running here. */
function pickUnfoundRing() {
  var pool = [], i;
  for (i = 0; i < RINGS.length; i++) {
    if (!RINGS[i].p) continue;                 /* not left lying about */
    if (G.ringsMade && G.ringsMade[i]) continue;
    pool.push(RINGS[i]);
  }
  if (!pool.length) return -1;
  var pickd = pool[weightedPick(pool)];
  for (i = 0; i < RINGS.length; i++) if (RINGS[i] === pickd) return i;
  return -1;
}
/* Two of the rings do nothing when you press them: they work while you
   are carrying them, and that is the whole of what they do.  Everything
   that wants to know about one asks here. */
function carryingRing(name) {
  var all = carriedItems(), i;
  for (i = 0; i < all.length; i++)
    if (all[i] && all[i].t === 'ring' && RINGS[all[i].k].n === name) return all[i];
  return null;
}
function ringIndex(name) {
  for (var i = 0; i < RINGS.length; i++) if (RINGS[i].n === name) return i;
  return -1;
}
function chargeItem(it) {
  if (!chargeable(it)) return null;
  if (it.t === 'ring') {
    var wasr = it.ch || 0;
    it.cap = (it.cap || 0) + Math.max(1, Math.ceil(ringCap(it) * (CHARGE_MULT - 1)));
    it.ch = ringCap(it);
    return { kind: 'ring', from: wasr, to: it.ch };
  }
  if (it.t === 'wand') {
    var was = it.ch || 0;
    it.ch = Math.ceil(was * CHARGE_MULT);
    if (it.ch <= was) it.ch = was + 1;
    return { kind: 'wand', from: was, to: it.ch };
  }
  if (isPlainAmmo(it)) {
    /* nothing to spend: it simply survives being thrown more often */
    it.chg = (it.chg || 0) + 1;
    return { kind: 'sturdy' };
  }
  /* A returning stone does not carry spare throws - it carries flights
     home, and charging it doubles those. */
  if (isRuneStone(it) && WEAPONS[it.k].rune === 'return') {
    var was = (it.ret === undefined ? RETURN_USES : it.ret);
    it.ret = was * 2;
    return { kind: 'returns', from: was, to: it.ret };
  }
  var n = it.cnt || 1;
  var bonus = Math.ceil(n * CHARGE_MULT) - n;
  if (bonus < 1) bonus = 1;
  it.chg = (it.chg || 0) + bonus;
  return { kind: 'uses', bonus: bonus, total: it.chg };
}
/* Spend a use.  A spare charge is spent before the thing itself is, so
   a charged item survives until its charges run out. */
/* One place for "did that actually cost a charge?", so a wand, a stone,
   a ring and a scroll all get the same practised hand. */
function keepsCharge(it) {
  if (!it || !hasPerk('dexterous')) return false;
  var keep = it.t === 'scroll' ? PERK_SCROLL_PCT : PERK_CHARGE_PCT;
  if (rnd(100) >= keep) return false;
  msg(it.t === 'scroll' ? 'The ink holds. You could read it again.'
                        : 'The charge holds.', 'c');
  return true;
}

function spendUse(it) {
  /* Dexterous: a practised hand gets a second reading out of a scroll
     now and then, and makes a wand or a stone go further. */
  if (keepsCharge(it)) return false;
  if (it && it.chg > 0 && !isPlainAmmo(it)) { it.chg--; return false; }
  removeItem(it, 1);
  return true;
}

function removeItem(it, n) {
  n = n || 1;
  if (it.cnt > n) { it.cnt -= n; return; }
  var i, j;
  for (i = 0; i < EQ_ORDER.length; i++) if (P.eq[EQ_ORDER[i]] === it) P.eq[EQ_ORDER[i]] = null;
  for (i = 0; i < N_SLOTS; i++) {
    if (P.slots[i] === it) { P.slots[i] = null; continue; }
    var s = P.slots[i];
    if (s && s.t === 'pouch')
      for (j = 0; j < POUCH_CAP; j++) if (s.items[j] === it) s.items[j] = null;
  }
  /* A thing can also be sitting in a chest on the floor.  It used to be
     looked for only in your own pack, so using something straight out of
     a chest consumed nothing - the potion was still there afterwards,
     and again after that. */
  if (L && L.items)
    for (i = 0; i < L.items.length; i++) {
      var c = L.items[i];
      if (!c || c.t !== 'chest' || !c.items) continue;
      for (j = 0; j < CHEST_CAP; j++) if (c.items[j] === it) c.items[j] = null;
    }
}
/* which of the five equip slots will accept this item */
function slotFor(it) {
  if (!it) return null;
  /* a stone lives in the pack and is thrown from there */
  if (it.t === 'weapon' && WEAPONS[it.k].thrown) return null;
  if (it.t === 'weapon') return WEAPONS[it.k].launch ? 'lh' : 'rh';
  if (it.t === 'armor') return 'body';
  if (it.t === 'shield') return 'lh';
  if (it.t === 'head') return 'head';
  if (it.t === 'feet') return 'feet';
  return null;
}
function twoHanded(it) {
  return !!(it && it.t === 'weapon' && WEAPONS[it.k].two);
}
/* Why a slot refused something.  "That does not go on your left hand" is
   wrong and confusing when the answer is that both hands are busy. */
function slotWhyNot(key, it) {
  if (!it) return null;
  if (key === 'lh' && twoHanded(P.eq.rh)) {
    var oneHanded = (it.t === 'shield' ||
      (it.t === 'weapon' && WEAPONS[it.k].launch && !WEAPONS[it.k].thrown));
    if (oneHanded)
      return 'Both hands are on your ' + itemDef(P.eq.rh).n + '.';
  }
  if (it.t === 'weapon' && WEAPONS[it.k].thrown)
    return 'You throw those, not wield them.';
  return 'That does not go on your ' + EQ_LONG[key] + '.';
}
function slotAccepts(key, it) {
  if (!it) return true;
  if (it.t === 'weapon' && WEAPONS[it.k].thrown) return false;
  if (key === 'rh') return it.t === 'weapon';
  /* both hands are on the hilt: nothing else fits */
  if (key === 'lh' && twoHanded(P.eq.rh)) return false;
  if (key === 'lh') return it.t === 'shield' || (it.t === 'weapon' && WEAPONS[it.k].launch);
  if (key === 'body') return it.t === 'armor';
  if (key === 'head') return it.t === 'head';
  if (key === 'feet') return it.t === 'feet';
  return false;
}

/* ---------------------------------------------------------- player */
function newPlayer() {
  return {
    x: 0, y: 0, hp: START_HP, mhp: START_HP, str: 16, mstr: 16, dex: 11, mdex: 11,
    wis: 10, mwis: 10,
    keys: [0, 0, 0, 0, 0, 0],
    exp: 0, lv: 1, gold: 0, food: 1300,
    slots: new Array(N_SLOTS).fill(null),
    eq: { rh: null, body: null, lh: null, head: null, feet: null },
    amulet: 0,
    blind: 0, conf: 0, hallu: 0, haste: 0, frozen: 0, iced: 0, held: 0, heldBy: null,
    seeinv: 0, monsight: 0, scare: 0, confuseTouch: 0, aggravate: 0, fireShield: 0,
    unseen: 0, perks: {}, wade: 0, freeIdent: 0, abstCtr: 0, webbed: 0,
    runSteps: 0, seer: 0, warp: null,
    statWas: null, statLit: {},
    regenCtr: 0
  };
}
function hasProp(name) {
  var e = equippedItems();
  for (var i = 0; i < e.length; i++) {
    var d = itemDef(e[i]);
    if (d && d.prop === name) return e[i];
  }
  return null;
}
/* Armour class, Rogue style: ten minus everything you are wearing. */
function playerAC() {
  var prot = 0;
  ['body', 'lh', 'head', 'feet'].forEach(function (kk) {
    var it = P.eq[kk];
    if (it && isGear(it)) prot += gearAC(it);
  });
  if (hasRune('warding')) prot += 1;
  return 10 - prot;
}
function strBonus() { return hasProp('add strength') ? 2 : 0; }
function effStr() { return clamp(P.str + strBonus(), 3, 31); }
function effDex() { return clamp(P.dex + (hasProp('dexterity') ? 2 : 0), 3, 24); }
function effWis() { return clamp(P.wis + (hasProp('wisdom') ? 3 : 0) + (hasRune('insight') ? 2 : 0), 3, 24); }

/* Wisdom: how good you are at reading a room and reading an object. */
function searchSkill() {
  var s = 6 + (effWis() - 10) * 5;
  if (hasProp('searching')) s += 30;
  if (hasPerk('keeneye')) s += PERK_SEARCH;
  return clamp(s, 2, 85);
}
function apprSkill() {
  return clamp((effWis() - 8) * 6 + (hasPerk('antiquary') ? PERK_APPRAISE : 0), 0, 95);
}
function wisWord() {
  var w = effWis();
  if (w <= 8) return 'dull';
  if (w <= 11) return 'ordinary';
  if (w <= 15) return 'keen';
  if (w <= 19) return 'shrewd';
  return 'uncanny';
}
/* What a piece of kit looks like to you before you know what it is: the
   look its kind wears this run, and a plain word for what sort of thing
   it is.  Ammunition and stones are exempt - nobody needs telling what a
   stone is - and a runed stone has its own way of hiding. */
function looksLike(it) {
  var d = itemDef(it);
  if (!d || !d.gen) return null;
  if (!APPEAR || !APPEAR.gear || !APPEAR.gear[it.t]) return null;
  var look = APPEAR.gear[it.t][it.k];
  return look ? (look + ' ' + d.gen) : d.gen;
}
/* do you recognise what sort of thing this is? */
function kindKnown(it) {
  if (it.known) return true;
  return !!(KNOWN && KNOWN.gear && KNOWN.gear[it.t] && KNOWN.gear[it.t][it.k]);
}
/* What a thing in your hand tells you about itself before you can put a
   name to it: the curse, and the plusses. */
function numsPrefix(it) {
  if (!numbersKnown(it)) return '';
  var out = it.cursed ? 'cursed ' : '';
  if (it.t === 'weapon') {
    if (it.hp || it.dp) out += sgn(it.hp) + ',' + sgn(it.dp) + ' ';
  } else if (it.ap) out += sgn(it.ap) + ' ';
  return out;
}
function hidesItsName(it) {
  return !kindKnown(it) && !!looksLike(it);
}
/* You have handled one of these.  Every other one you meet this run is
   recognisable on sight - though what any particular one is worth is
   still its own business. */
function learnGear(it) {
  if (!it || !KNOWN || !KNOWN.gear || !KNOWN.gear[it.t]) return 0;
  if (KNOWN.gear[it.t][it.k]) return 0;
  KNOWN.gear[it.t][it.k] = 1;
  return 1;
}

/* Can you form a view on this thing at all?  Gear and blades you can
   weigh in the hand; a sealed flask tells you nothing. */
function canAppraise(it) {
  if (!it || it.known) return false;
  return it.t === 'weapon' || isGear(it);
}
/* One look, one chance.  A practised eye can price a blade at a glance,
   and a poor one is left guessing for good - after this the answer has
   to come from a scroll. */
function appraise(it) {
  if (!canAppraise(it)) { msg('You can make nothing of it by eye.', '6'); return false; }
  if (it.tried) { msg('You have already puzzled over it.', '6'); return false; }
  it.tried = 1;
  /* An antiquarian gets one certainty a floor, and after that his
     practised eye, which is very good but not infallible. */
  if (hasPerk('antiquary') && P.freeIdent > 0) {
    P.freeIdent--;
    it.known = 1; learnRune(it); learnGear(it);
    msg('You know this one on sight: ' + itemName(it) + '.', 'c');
    return true;
  }
  if (rnd(100) >= apprSkill()) {
    msg('You turn it over and learn nothing.', '4');
    return false;
  }
  it.known = 1; learnRune(it); learnGear(it);
  msg('You size it up: ' + itemName(it) + '.', 'c');
  return true;
}

/* how quietly you move.  A beginner is heard almost at once; a rogue with
   high dexterity and soft boots can get within a couple of squares. */
function stealthScore() {
  var s = (effDex() - 10) * 5;
  if (hasProp('stealth')) s += 26;
  if (hasPerk('silent')) s += PERK_STEALTH;
  if (hasRune('shadow')) s += 14;
  if (hasRune('burden')) s -= 10;
  /* Silent feet is partly about learning to wear the stuff: the plate
     still clanks, but only half as much. */
  if (P.eq.body && ARMORS[P.eq.body.k].a <= 4) s -= hasPerk('silent') ? 6 : 12;
  return s;
}
function stealthWord() {
  var s = stealthScore();
  if (s < 0) return 'clumsy';
  if (s < 14) return 'poor';
  if (s < 30) return 'fair';
  if (s < 48) return 'good';
  return 'ghostly';
}
/* chance to slip aside from an incoming blow */
function dodgeChance() {
  return clamp((effDex() - 10) * 4 + 4 + (hasRune('reflexes') ? 9 : 0) +
    (hasPerk('grace') ? PERK_DODGE : 0), 0, 64);
}
function playerDamBonus() {
  var b = addDam(effStr());
  if (hasPerk('heavyhand')) b += PERK_MELEE_DAM;
  if (P.eq.rh) b += P.eq.rh.dp;
  var r = weaponRune();
  if (r && r.n === 'slaying') b += 2;
  if (r && r.n === 'dullness') b -= 2;
  return b;
}
function playerHitBonus() {
  var b = strPlus(effStr()) + (((effDex() - 10) / 3) | 0);
  if (P.eq.rh) b += P.eq.rh.hp;
  var r = weaponRune();
  if (r && r.n === 'slaying') b += 2;
  if (r && r.n === 'dullness') b -= 1;
  return b;
}
/* attacking something that has not noticed you, or is still reeling from
   noticing you, is much easier */
function surpriseHit(m) {
  if (m.state < 2) return SNEAK_HIT_BONUS;
  if (m.surprised) return SURPRISE_HIT_BONUS;
  /* a creature running away has its back to you and is not watching
     your blade - easier to land a blow or an arrow on */
  if (m.flee > 0) return FLEE_HIT_BONUS;
  return 0;
}
function surpriseDam(m) {
  /* The reward for sneaking used to be almost entirely in the to-hit
     roll - but that roll is capped at needing a 2 on a d20, and a plain
     +6 already reached the cap, so adding more to it changed nothing at
     all.  A blow nobody saw coming lands harder instead, and it keeps
     paying as you get better at it. */
  var perk = hasPerk('backstab') ? PERK_BACKSTAB : 0;
  if (m.state < 2) return SNEAK_DAM_FLAT + roll(P.lv, SNEAK_DAM_DIE) + perk;
  if (m.surprised) return 1 + rnd(3) + perk;
  return 0;
}
function launcher() {
  var it = P.eq.lh;
  return (it && it.t === 'weapon' && WEAPONS[it.k].launch) ? it : null;
}
/* Something you can throw with your bare hands.  Only used when you have
   actually chosen to throw one. */
function thrownAmmo() {
  var all = carriedItems();
  for (var i = 0; i < all.length; i++) {
    var it = all[i];
    if (it.t === 'weapon' && WEAPONS[it.k].thrown) return it;
  }
  return null;
}
/* Anything you can lob: a stone, or any flask at all.  Most flasks just
   break, but you are allowed to find that out - and the two that matter
   work whether or not you know what is in them. */
/* Anything you can send through the air.  Stones only ever fly; a spear
   or a throwing dagger will do either, so they count wielded as well. */
function isThrowable(it) {
  if (!it) return false;
  if (it.t === 'weapon' && (WEAPONS[it.k].thrown || WEAPONS[it.k].hurl)) return true;
  return it.t === 'potion' || it.t === 'dynamite';
}
/* a weapon that fights in the hand and flies from it */
function isHurlWeapon(it) { return !!(it && it.t === 'weapon' && WEAPONS[it.k].hurl); }

/* ------------------------------------------------- the scroll of return
   One thing at a time carries the charm.  It is a property of the item,
   not a rune, so it can sit on a spear, a dagger, a stone, an arrow or a
   bolt without any of them needing to know about it. */
function canReturn(it) {
  if (!it || it.t !== 'weapon') return false;
  var W = WEAPONS[it.k];
  return !!(W.thrown || W.hurl || W.ammoFor);
}
function returningItem() {
  var all = carriedItems();
  for (var i = 0; i < all.length; i++) if (all[i] && all[i].homing) return all[i];
  return null;
}
function setReturning(it) {
  var all = carriedItems();
  for (var i = 0; i < all.length; i++) if (all[i]) all[i].homing = 0;
  if (it) it.homing = 1;
}
function isFlask(it) { return !!(it && it.t === 'potion'); }
function flaskEffect(it) {
  return (it && it.t === 'potion') ? (POTIONS[it.k].hurl || null) : null;
}
/* What this launcher eats.  It used to be the other way about - each
   kind of ammunition naming the launchers it fitted - which needed
   editing in two places every time a bow was added, and quietly gave the
   third one nothing to shoot. */
function findAmmo(lname) {
  var want = null, i;
  for (i = 0; i < WEAPONS.length; i++)
    if (WEAPONS[i].n === lname) want = WEAPONS[i].ammo;
  if (!want) return null;
  var all = carriedItems();
  for (i = 0; i < all.length; i++) {
    var it = all[i];
    var W = it.t === 'weapon' ? WEAPONS[it.k] : null;
    if (W && W.n === want) return it;
  }
  return null;
}

/* --------------------------------------------------- what is on you now
   Everything the game is quietly doing to you, spelled out, so a message
   like "your hands glow red" is never a mystery. */
var PROP_TEXT = {
  'see invisible': ['you spot invisible things', 'c'],
  'stealth': ['you move silently', 'c'],
  'slow digestion': ['you eat little', 'c'],
  'regeneration': ['wounds close fast', 'c'],
  'searching': ['you spot hidden things', 'c'],
  'add strength': ['strength +2', 'c'],
  'sustain strength': ['strength cannot drop', 'c'],
  'dexterity': ['dexterity +2', 'c'],
  'wisdom': ['wisdom +3', 'c'],
  'aggravate monster': ['you wake monsters!', 'R'],
  'teleportation': ['you blink at random!', 'R']
};
/* How much experience the next level asks for, and how far along you
   are.  The last level has nothing beyond it, so it says so. */
function xpNext() { return (P.lv < 21 && E_LEVELS[P.lv - 1]) ? E_LEVELS[P.lv - 1] : 0; }
function xpText() {
  var want = xpNext();
  return want ? (P.exp + '/' + want) : ('' + P.exp);
}
/* Hunger, as a share of a full stomach.  The clock runs on a scale
   nobody can hold in their head - a percentage of a full meal is what
   you actually want to know. */
function foodPct() { return clamp(Math.round(P.food * 100 / FOOD_MAX), 0, 100); }
function foodWord() {
  if (G.hungerState === 3) return 'starving';
  if (G.hungerState === 2) return 'weak';
  if (G.hungerState === 1) return 'hungry';
  return foodPct() > 60 ? 'fed' : 'peckish';
}
function foodCol() {
  return G.hungerState >= 3 ? 'R' : G.hungerState >= 1 ? 'O' : '6';
}

/* ------------------------------------------------------------- curses
   Cursing a thing and lifting the curse both go through one door, so a
   named curse cannot be attached in one place and forgotten in another.
   Most cursed things merely refuse to come off; some carry worse. */
function layCurse(it) {
  if (!it) return;
  it.cursed = 1;
  /* Which curse, if any, is not settled here.  Rolling it now would mean
     every cursed thing dropped on a floor pulled a number out of the
     dungeon's own random stream, and the whole floor after it came out
     different - two seeded checks in the suite failed for no reason but
     that.  A curse is not felt until it is worn, so it is not decided
     until then either. */
  if (it.curse === undefined) it.curse = 0;      /* 0: not yet settled */
}
/* Settle it: called the moment the thing goes on. */
function settleCurse(it) {
  if (!it || it.curse !== 0) return;
  it.curse = rnd(100) < NAMED_CURSE_PCT ? CURSES[weightedPick(CURSES)].id : null;
}
function liftCurse(it) {
  if (!it) return;
  it.cursed = 0;
  it.curse = null;
}
/* A curse only reaches you through something you are actually wearing.
   A cursed blade at the bottom of the pack is a blade. */
function curseOn(id) {
  for (var k in P.eq) {
    var it = P.eq[k];
    if (!it || !it.cursed) continue;
    settleCurse(it);              /* it is on you, so it is time to know */
    if (it.curse === id) return it;
  }
  return null;
}
function hasCurse(id) { return !!curseOn(id); }
function curseDef(id) {
  for (var i = 0; i < CURSES.length; i++) if (CURSES[i].id === id) return CURSES[i];
  return null;
}
/* Every curse you are carrying, for the panel and for the shrine. */
function cursesOnYou() {
  var out = [], k;
  for (k in P.eq) {
    var it = P.eq[k];
    if (!it || !it.cursed) continue;
    settleCurse(it);
    if (it.curse && out.indexOf(it.curse) < 0) out.push(it.curse);
  }
  return out;
}

/* ======================================================= going somewhere
   A click on a square sets off a walk: the cheapest route in turns, not
   in squares.  Water is thigh deep and costs you every second step, so a
   long way round dry ground can be quicker than a short wade - and the
   other way about, which is why it is measured rather than avoided.

   The route goes nowhere you can see would hurt you: a trap you have
   found, a hole, a wall of fire or ice, a barrel of powder.  It cannot
   route round what you have not seen, and it does not pretend to. */
var STEP_COST = 2;                 /* an ordinary square, in half-turns */
function stepCost(x, y) {
  if (!walkable(x, y)) return 0;
  var t = tileAt(x, y);
  if (t === HOLE) return 0;
  if (barrelAt(x, y)) return 0;
  var tr = trapAtLevel(L, x, y);
  if (tr && tr.found && !tr.spent) return 0;     /* one you can see */
  if (!inWater(x, y)) return STEP_COST;
  /* Wading: every WADE_EVERY-th step through it costs the turn as well,
     so a square of water is worth that much more than a square of
     floor.  Riverborn is at home in it and pays nothing extra. */
  if (hasPerk('riverborn')) return STEP_COST;
  return STEP_COST + Math.round(STEP_COST / WADE_EVERY);
}
/* Dijkstra, since the squares do not all cost the same.  Returns the
   path from where you are to the square asked for, not including the
   square you are standing on, or null if there is no way. */
function findPath(tx, ty, opts) {
  opts = opts || {};
  if (tx === P.x && ty === P.y) return [];
  var n = MAP_W * MAP_H, dist = new Int32Array(n), from = new Int32Array(n), i;
  for (i = 0; i < n; i++) { dist[i] = 2147483647; from[i] = -1; }
  var start = P.y * MAP_W + P.x, goal = ty * MAP_W + tx;
  dist[start] = 0;
  /* a plain binary heap: the floors are small enough that this is
     nothing, and it keeps the walk instant however far you click */
  var heap = [[0, start]];
  function push(d, k) {
    heap.push([d, k]);
    var c = heap.length - 1;
    while (c > 0) {
      var par = (c - 1) >> 1;
      if (heap[par][0] <= heap[c][0]) break;
      var tmp = heap[par]; heap[par] = heap[c]; heap[c] = tmp; c = par;
    }
  }
  function pop() {
    var top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      var c = 0;
      for (;;) {
        var l = c * 2 + 1, r = l + 1, s = c;
        if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
        if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
        if (s === c) break;
        var tmp2 = heap[s]; heap[s] = heap[c]; heap[c] = tmp2; c = s;
      }
    }
    return top;
  }
  while (heap.length) {
    var top2 = pop(), d0 = top2[0], k0 = top2[1];
    if (d0 > dist[k0]) continue;
    if (k0 === goal) break;
    var x0 = k0 % MAP_W, y0 = (k0 / MAP_W) | 0, q;
    for (q = 0; q < DIR4.length; q++) {
      var nx = x0 + DIR4[q][0], ny = y0 + DIR4[q][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var k1 = ny * MAP_W + nx;
      var c1 = stepCost(nx, ny);
      /* Walking up to something rather than onto it does not care
         whether the square itself can be stood on - a locked door is
         asked for exactly so you can go and try the handle. */
      if (!c1) {
        if (!opts.stopShort || k1 !== goal) continue;
        c1 = STEP_COST;
      }
      /* Something standing in the way is in the way - unless it is the
         square you asked for, which is how you walk up to a monster. */
      if (k1 !== goal && monAt(L, nx, ny)) continue;
      if (dist[k0] + c1 < dist[k1]) {
        dist[k1] = dist[k0] + c1;
        from[k1] = k0;
        push(dist[k1], k1);
      }
    }
  }
  if (dist[goal] === 2147483647) return null;
  var path = [], at = goal;
  while (at !== start) { path.push({ x: at % MAP_W, y: (at / MAP_W) | 0 }); at = from[at]; }
  path.reverse();
  /* Walking up to something rather than onto it: drop the last square. */
  if (opts.stopShort) path.pop();
  return path;
}

/* How far a square is from the nearest one you have seen.  Zero if you
   have seen it yourself.  Beyond UNSEEN_REACH it stops counting, because
   nothing further than that is worth pointing at. */
function unseenReach(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return 99;
  if (L.flags[y * MAP_W + x] & F_SEEN) return 0;
  for (var d = 1; d <= UNSEEN_REACH + 1; d++) {
    for (var dy = -d; dy <= d; dy++) for (var dx = -d; dx <= d; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
      var nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (L.flags[ny * MAP_W + nx] & F_SEEN) return d;
    }
  }
  return 99;
}
/* The square you can actually reach that comes nearest to the one you
   pointed at.  Clicking into the dark is a guess - there may be no floor
   there at all - so you walk as close as the map allows and stop. */
function nearestApproach(tx, ty) {
  var best = null, bestD = 1e9, i;
  for (i = 0; i < L.tiles.length; i++) {
    if (!(L.flags[i] & F_SEEN)) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0;
    if (!stepCost(x, y)) continue;
    if (monAt(L, x, y)) continue;
    var d = Math.max(Math.abs(x - tx), Math.abs(y - ty));
    if (d >= bestD) continue;
    if (d && !findPath(x, y, {})) continue;      /* no way to it */
    bestD = d; best = { x: x, y: y };
    if (!d) break;
  }
  return best;
}

/* Everything hostile that can see you at this moment. */
function watchingNow() {
  var out = [], i;
  for (i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    if (m.ally || m.disguise || m.state === 0) continue;
    if (monSeesPlayer(m)) out.push(m);
  }
  return out;
}
/* Anything hostile that has just noticed you - which is what ends a
   walk.  Something that was already watching when you set off does not:
   a fight that has begun is one you are allowed to walk about in. */
function watchedByFoe(known) {
  for (var i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    if (m.ally || m.disguise || m.state === 0) continue;
    if (known && known.indexOf(m) >= 0) continue;
    if (monSeesPlayer(m)) return m;
  }
  return null;
}
/* You cannot walk while something is holding you. */
function heldFast() {
  return P.frozen > 0 || P.held || P.webbed > 0 || P.iced > 0;
}

/* ------------------------------------------------- asking you first
   A hole in the floor is the one step you cannot take back, and you used
   to take it by leaning on an arrow key.  The question is raised as
   plain data so the engine can ask it without knowing anything about the
   screen, and the screen can draw it without knowing what it is for. */
function askPlayer(q, kind, x, y) {
  G.ask = { q: q, kind: kind, x: x, y: y, i: 1 };   /* the cursor starts on No */
}
/* Returns true if the answer costs a turn. */
function answerAsk(yes) {
  var a = G.ask;
  G.ask = null;
  if (!a || !yes) return false;
  if (a.kind === 'jump') { P.x = a.x; P.y = a.y; fallDown(); return true; }
  return false;
}

/* Water on the skin of somebody who cannot bear it.  One door for all of
   it: the pool you are standing in, the trap that douses you, the flask
   that breaks over your head. */
function soakPlayer(why) {
  if (G.dead || !hasCurse('water')) return 0;
  P.hp -= CURSE_WATER_DAMAGE;
  markHurt(P, P.x, P.y - 1);
  if (typeof splashDrops === 'function') splashDrops(P.x, P.y, WATER_BURN_COL);
  msgTrap(why || 'The water burns you.', 'R', CURSE_WATER_DAMAGE + ' burn', 'R');
  if (P.hp <= 0) die('water');
  return CURSE_WATER_DAMAGE;
}
/* Nothing happened, and you can see that nothing happened. */
function fizzle(what) {
  if (typeof splashDrops === 'function') splashDrops(P.x, P.y, FIZZLE_COL);
  msg(what ? 'The ' + what + ' does nothing in your hand.'
           : 'Nothing happens. The magic will not come.', '6');
}
/* Is the magic dead in your hands?  Asked by everything magical you can
   set off yourself. */
function squibbed(what) {
  if (!hasCurse('squib')) return false;
  fizzle(what);
  return true;
}

function playerEffects() {
  var out = [], i;
  if (G.hungerState === 1) out.push(['hungry: healing halved', 'O']);
  if (G.hungerState === 2) out.push(['weak: no healing', 'O']);
  if (G.hungerState === 3) out.push(['starving: losing hp', 'R']);
  if (P.conf) out.push(['confused (' + P.conf + ')', 'P']);
  if (P.blind) out.push(['blind (' + P.blind + ')', 'P']);
  if (P.hallu) out.push(['hallucinating', 'P']);
  if (P.haste) out.push(['hasted (' + P.haste + ')', 'c']);
  if (P.frozen) out.push([(P.iced ? 'frozen solid (' : P.webbed ? 'stuck in web (' : 'held fast (') + P.frozen + ')', 'R']);
  if (P.held) out.push(['gripped by a monster', 'R']);
  if (P.scare) out.push(['monsters flee you (' + P.scare + ')', 'G']);
  if (P.seeinv) out.push(['seeing invisible (' + P.seeinv + ')', 'c']);
  if (P.unseen) out.push(['unseen (' + P.unseen + ')', 'c']);
  if (P.fireShield) out.push(['ringed in fire (' + P.fireShield + ')', 'O']);
  if (P.monsight) out.push(['monster sight (' + P.monsight + ')', 'c']);
  if (P.seer) out.push(['seeing all (' + P.seer + ')', 'P']);
  if (darkAt(P.x, P.y)) out.push([nightEyes() ? 'in the dark, and seeing'
                                              : 'in the dark: one square', nightEyes() ? 'c' : 'p']);
  if (playerRunning()) out.push(['running: you may stumble', 'O']);
  if (P.confuseTouch) out.push(['hands glow red: next hit', 'y']);
  if (P.confuseTouch) out.push(['  confuses a monster', 'y']);
  if (P.amulet) out.push(['carrying the Amulet', 'y']);

  var pk = perkList();
  /* One line each: the panel has very little room to spare, so the name
     and what it does share a line and the short wording exists to make
     that fit. */
  for (i = 0; i < pk.length; i++)
    out.push([pk[i].n + ': ' + (pk[i].s || pk[i].txt), 'G']);

  var eq = equippedItems();
  for (i = 0; i < eq.length; i++) {
    var d = itemDef(eq[i]);
    if (d && d.prop && PROP_TEXT[d.prop]) out.push(PROP_TEXT[d.prop].slice());
    var rn = activeRune(eq[i]);
    if (rn) out.push([rn.txt, rn.bad ? 'R' : 'c']);
    else if (eq[i].br && !eq[i].brKnown && effWis() >= 12)
      out.push(['something sleeps in it', 'P']);
    if (eq[i].protected) out.push(['armor is protected', 'c']);
  }
  var cz = cursesOnYou();
  for (i = 0; i < cz.length; i++) {
    var cd = curseDef(cz[i]);
    if (cd) out.push(['curse of ' + cd.n + ': ' + cd.txt, 'R']);
  }
  for (i = 0; i < eq.length; i++)
    if (eq[i].cursed) out.push(['cursed: ' + shortItem(eq[i]), 'R']);
  if (!out.length) out.push(['nothing unusual', '4']);
  return out;
}
function shortItem(it) {
  var d = itemDef(it);
  return d && d.n ? d.n : it.t;
}

/* ------------------------------------------------------ looking about
   Everything the game can put on a square, read out in plain words.  It
   works from the top down - a creature standing on a trap on a floor is
   described as the creature first - and it only tells you what you could
   actually know from where you are standing. */
function lookAt(x, y) {
  var out = [], j = y * MAP_W + x, i;
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return ['Beyond the edge of the world.'];
  var f = L.flags[j];
  if (!(f & F_SEEN)) return ['You have not seen this square.'];
  var lit = !!(f & F_VIS);

  if (x === P.x && y === P.y) out.push('You are standing here.');

  /* whatever is alive on it */
  var m = monAt(L, x, y);
  if (m && lit && canSeeMon(m)) {
    out.push(cap(monName(m)) + (m.ally ? ' (yours)' : ''));
    var mi = MON_INFO[m.c];
    if (m.disguise) out.push('It looks like a chest.');
    else if (mi) for (i = 0; i < mi.length; i++) out.push(mi[i]);
    out.push(m.state === 0 ? 'It is fast asleep.' :
             m.state === 1 ? 'It has not noticed you.' : 'It is hunting you.');
    if (m.burn) out.push('It is on fire.');
    if (dazzled(m)) out.push('The light has it reeling.');
    if (m.doused > 0) out.push('It is too wet to breathe fire.');
    if (m.blind) out.push('It has been blinded.');
    if (m.slowed) out.push('It is moving slowly.');
    if (m.webbed) out.push('It is caught in web.');
    else if (m.held || m.stuck) out.push('It is held fast.');
  }

  /* whatever is lying on it */
  var it = itemAt(L, x, y);
  if (it) {
    out.push(cap(itemName(it)));
    if (it.t === 'chest') out.push(it.seen ? 'You have looked in it.' : 'Press ENTER to open it.');
  }

  /* a trap you have found */
  var tr = trapAtLevel(L, x, y);
  if (tr && tr.found) {
    out.push(cap(tr.k.n) + (tr.spent ? ' (sprung)' : ''));
    var ti = TRAP_INFO[tr.k.k];
    if (ti) for (i = 0; i < ti.length; i++) out.push(ti[i]);
  }

  /* The ground is only worth describing when nothing is standing on it.
     If you asked about a dragon you asked about the dragon, and you can
     always put the cursor on a bare square to ask about the floor. */
  if (out.length && !(out.length === 1 && x === P.x && y === P.y)) return out;

  /* Moss, rubble, bones, a rug: things lying on the floor, and the floor
     underneath them is no more worth a line than the floor under a
     potion is.  Only a square with nothing whatever on it describes
     itself as floor. */
  var dk = L.decor[j];
  var tt = L.tiles[j];
  if (dk && DECOR_INFO[dk]) {
    var di = DECOR_INFO[dk];
    for (i = 0; i < di.length; i++) out.push(di[i]);
    /* Plain floor under it is not worth a line.  Anything else - water,
       a bridge, a staircase - still is, because that is a fact about
       the square and not just what colour the stone is. */
    if (tt === FLOOR || tt === CORR) return out;
  }

  var tinfo = TILE_INFO[tt];
  if (tt === BRIDGE) {
    out.push('A plank bridge.');
    out.push(L.under[j] === HOLE ? 'A drop runs under it.' : 'Water runs under it.');
  } else if (tinfo) {
    for (i = 0; i < tinfo.length; i++) out.push(tinfo[i]);
  } else out.push('You cannot make it out.');

  return out;
}

/* ============================================================ saving
   A run is the pack, the dice, what you have worked out about potions
   and scrolls, and every floor you have walked - which is mostly three
   arrays of bytes per floor.  Those go across as base64; everything else
   is already plain data.

   Two things are deliberately not stored.  A monster's `def` is a
   reference into the monster table, so it is rebuilt from its letter on
   the way back in - storing it would put a copy of the table in every
   save.  And the half-open screens (a chest you were looking in, a thing
   you were carrying between squares) are dropped: you save from the
   pause menu, where none of them are open.  */
var SAVE_KEY = 'rogue8.saves', SAVE_SLOTS = 3, SAVE_VERSION = 1;

function b64FromBytes(arr) {
  var s = '', i, CH = 8192;
  for (i = 0; i < arr.length; i += CH)
    s += String.fromCharCode.apply(null, arr.subarray(i, i + CH));
  return btoa(s);
}
function bytesFromB64(s, Kind) {
  var bin = atob(s), out = new Kind(bin.length), i;
  for (i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function packLevel(lv) {
  var o = {}, k;
  for (k in lv) {
    if (k === 'tiles' || k === 'flags' || k === 'roomAt') continue;
    if (k === 'mons') continue;
    if (k === 'litMap' || k === 'darkMap') continue;   /* stored as bytes */
    o[k] = lv[k];
  }
  o.tiles = b64FromBytes(lv.tiles);
  o.flags = b64FromBytes(lv.flags);
  o.roomAt = b64FromBytes(new Uint8Array(lv.roomAt.buffer.slice(0)));
  o.litMap = b64FromBytes(lv.litMap);
  o.darkMap = b64FromBytes(lv.darkMap);
  o.mons = lv.mons.map(packMon);
  return o;
}
function unpackLevel(o) {
  var lv = {}, k;
  for (k in o) {
    if (k === 'tiles' || k === 'flags' || k === 'roomAt' || k === 'mons' ||
        k === 'litMap' || k === 'darkMap') continue;
    lv[k] = o[k];
  }
  lv.tiles = bytesFromB64(o.tiles, Uint8Array);
  lv.flags = bytesFromB64(o.flags, Uint8Array);
  lv.roomAt = new Int8Array(bytesFromB64(o.roomAt, Uint8Array).buffer);
  lv.litMap = bytesFromB64(o.litMap, Uint8Array);
  lv.darkMap = bytesFromB64(o.darkMap, Uint8Array);
  lv.mons = o.mons.map(unpackMon);
  return lv;
}
function packMon(m) {
  var o = {}, k;
  for (k in m) { if (k === 'def' || k === 'heldBy' || k === 'anim') continue; o[k] = m[k]; }
  return o;
}
function unpackMon(o) {
  var m = {}, k;
  for (k in o) m[k] = o[k];
  m.def = MON_BY_C[m.c];
  m.anim = null;
  return m;
}

/* the player, minus the one field that points at a live monster */
function packPlayer() {
  var o = {}, k;
  for (k in P) { if (k === 'heldBy') continue; o[k] = P[k]; }
  o.held = 0;
  return o;
}

/* everything that has to survive, and nothing that does not */
function packRun() {
  var g = {}, k;
  var skip = { level: 1, floors: 1, msgq: 1, log: 1, pouch: 1, pouchLast: 1, waiting: 1,
               box: 1, openBox: 1, sel: 1, menu: 1, aim: 1, throwing: 1,
               targets: 1, bolt: 1, shot: 1, splash: 1, ret: 1, drops: 1,
               bl: 1, look: 1, pause: 1, choice: 1, perkPick: 1,
               queuePick: 1, pickJob: 1, aimSq: 1, slots: 1, hint: 1, pan: 1 };
  for (k in G) if (!skip[k]) g[k] = G[k];
  var floors = {}, d;
  for (d in G.floors) floors[d] = packLevel(G.floors[d]);
  return {
    v: SAVE_VERSION,
    at: Date.now(),
    depth: G.depth, lv: P.lv, gold: P.gold,
    seed: _seed,
    g: g, p: packPlayer(), floors: floors,
    appear: APPEAR, known: KNOWN,
    mw: MAP_W, mh: MAP_H
  };
}
function unpackRun(s) {
  var k, d;
  G = freshG();            /* freshG rolls dice, so seed the run after it */
  srand(s.seed);
  APPEAR = s.appear; KNOWN = s.known;
  for (k in s.g) G[k] = s.g[k];
  G.floors = {};
  for (d in s.floors) G.floors[d] = unpackLevel(s.floors[d]);
  P = s.p;
  if (!P.perks) P.perks = {};
  setDims(s.mw, s.mh);
  L = G.floors[G.depth];
  G.level = L;
  if (L) setDims(L.mw, L.mh);
  /* a creature holding you is a reference, not a copy */
  P.heldBy = null; P.held = 0;
  G.msgq = []; G.log = []; G.msgIdx = 0; G.beat = 0;
  G.mode = 'play'; G.invOpen = 0;
  computeVis();
  return true;
}

/* --- the store: one place, several slots ---------------------------- */
function saveStore() {
  try {
    var raw = window.localStorage.getItem(SAVE_KEY);
    var o = raw ? JSON.parse(raw) : null;
    return (o && o.slots) ? o : { slots: [] };
  } catch (e) { return null; }
}
function writeStore(o) {
  try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(o)); return true; }
  catch (e) { return false; }
}
function saveInto(i) {
  var store = saveStore();
  if (!store) return 'This browser will not let the game save.';
  store.slots[i] = packRun();
  return writeStore(store) ? null : 'There is no room left to save.';
}
function loadFrom(i) {
  var store = saveStore();
  if (!store) return 'This browser will not let the game load.';
  var s = store.slots[i];
  if (!s) return 'That slot is empty.';
  if (s.v !== SAVE_VERSION) return 'That save is from an older game.';
  unpackRun(s);
  return null;
}
function slotLabel(i) {
  var store = saveStore();
  var s = store && store.slots[i];
  if (!s) return 'empty';
  return 'floor -' + s.depth + '  level ' + s.lv + '  ' + s.gold + ' gold';
}

/* -------------------------------------------------------------- clock
   G.beat is how far into the turn we are, in milliseconds.  Everything
   that happens stamps itself with that instant so the picture and the
   words arrive together. */
function beatNow() { return Date.now() + (G.beat || 0); }
/* An auto-walk plays the same turn out, only faster: every wait in it is
   scaled so the step, the lines of text and the creatures' own moves all
   stay in step with each other rather than the walk running ahead of the
   log.  Walking a square takes WALK_MS instead of a whole beat. */
function beatScale() {
  if (!G || !G.walk) return 1;
  return Math.max(0.04, WALK_MS / BEAT);
}
function beatWait(ms) { G.beat = (G.beat || 0) + Math.round(ms * beatScale()); }

/* ---------------------------------------------------------- messages */
function msg(s, col) { G.msgq.push({ s: s, c: col || 'w', at: beatNow() }); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* A combat line.  The top bar splits into three: what happened, what it
   did, and how the other fellow is holding up. */
function msgFight(s, col, fx, fxCol, m) {
  G.msgq.push({
    s: s, c: col || 'w', fx: fx || '', fc: fxCol || '6', fight: 1, at: beatNow(),
    spr: m.disguise ? 'chest' : ('mon_' + m.c),
    hp: Math.max(0, m.hp), mhp: Math.max(1, m.mhp)
  });
}

/* A trap line.  The top bar splits in two: what happened, and what it
   cost you. */
function msgTrap(s, col, fx, fxCol) {
  G.msgq.push({ s: s, c: col || 'w', fx: fx || '', fc: fxCol || '6', trap: 1,
                at: beatNow() });
}

/* --------------------------------------------------------- edging
   Water and holes have hard square borders.  Rounding them means two
   different jobs, and only ever taking a corner away or filling one in -
   never adding a lump where there was nothing.

     On a LIQUID square, a corner whose two neighbouring sides are both
     dry is sticking out.  Chamfer it: that corner becomes floor.

     On a FLOOR square, a corner whose two neighbouring sides are both
     liquid is a notch.  Fill it: that corner becomes liquid.

   A diagonal on its own is left alone.  Putting something in that corner
   is what made pools look like they had beads stuck to them. */
var EDGE_TILES = {};
EDGE_TILES[WATER] = 1;
EDGE_TILES[HOLE] = 1;
function isEdgeTile(x, y) {
  var t = tileAt(x, y);
  /* A bridge is a plank laid over the water, not a bank.  As far as the
     outline of the pool is concerned it is still water underneath, or
     the stream would come to a rounded stop at each end of the bridge
     and read as two separate pools with a floorboard between them. */
  if (t === BRIDGE) {
    var u = L.under[y * MAP_W + x];
    return EDGE_TILES[u] ? u : 0;
  }
  return EDGE_TILES[t] ? t : 0;
}

/* Stone gets the same treatment as water.  A wall is anything you cannot
   walk through and cannot see through: raw rock, dressed wall, a hidden
   door.  Doorways are deliberately not walls - rounding a corner into a
   doorway would close it up. */
function isWallish(x, y) {
  var t = tileAt(x, y);
  return (t === WALL || t === ROCK || t === SDOOR) ? 1 : 0;
}
function wallCorners(mx, my) {
  var here = isWallish(mx, my);
  var n = isWallish(mx, my - 1), s = isWallish(mx, my + 1);
  var w = isWallish(mx - 1, my), e = isWallish(mx + 1, my);
  var want = here ? 0 : 1;
  return [(w === want && n === want) ? 1 : 0,
          (e === want && n === want) ? 1 : 0,
          (w === want && s === want) ? 1 : 0,
          (e === want && s === want) ? 1 : 0];
}

/* The four corners in reading order: NW, NE, SW, SE.  Each entry is 1 if
   that corner should be rounded, 0 if it should be left square. */
function edgeCorners(mx, my) {
  var here = isEdgeTile(mx, my);
  var n = isEdgeTile(mx, my - 1) ? 1 : 0, s = isEdgeTile(mx, my + 1) ? 1 : 0;
  var w = isEdgeTile(mx - 1, my) ? 1 : 0, e = isEdgeTile(mx + 1, my) ? 1 : 0;
  var want = here ? 0 : 1;    /* liquid: cut where it is dry.  floor: fill where it is wet. */
  return [(w === want && n === want) ? 1 : 0,
          (e === want && n === want) ? 1 : 0,
          (w === want && s === want) ? 1 : 0,
          (e === want && s === want) ? 1 : 0];
}

/* ---------------------------------------------------------- monsters *//* ---------------------------------------------------------- monsters */
/* Centred on the floor you are standing on, so the dungeon gets harder
   at a steady rate rather than drifting behind you. */
/* Aim at a monster level that tracks the floor, then take one of the
   species that actually sits at that level.  Depth chooses the strength;
   which creature it is, is only flavour. */
function randMonsterChar(depth) {
  /* Rounding the target down would make two floors in a row identical,
     so round it up in proportion to the fraction instead: over many
     monsters the average climbs smoothly rather than in steps. */
  var exact = 1 + (depth - 1) * MON_LEVEL_PER_FLOOR;
  var want = Math.floor(exact);
  if (rnd(1000) < Math.round((exact - want) * 1000)) want++;
  /* The top floors never spike upward: you have twenty hit points and a
     dagger, and one creature from two floors down would simply kill you.
     Below that, anything within a level either way, and now and then
     something that should not be there at all. */
  want += (depth <= 2) ? -rnd(2) : rnd(3) - 1;
  if (depth >= 3 && rnd(100) < 12) want += 1 + rnd(2);
  want = clamp(want, 1, MON_LEVELS[MON_LEVELS.length - 1]);

  /* the nearest level that has anything in it */
  var best = MON_LEVELS[0], bd = 1e9;
  for (var i = 0; i < MON_LEVELS.length; i++) {
    var d = Math.abs(MON_LEVELS[i] - want);
    if (d < bd) { bd = d; best = MON_LEVELS[i]; }
  }
  var pool = MON_BY_LEVEL[best];
  /* Some creatures do not belong this near the surface whatever their
     level says - an ice monster on the first floor freezes you solid
     before you have anything to break out with. */
  var ok = [];
  for (i = 0; i < pool.length; i++) {
    var D = MON_BY_CHAR[pool[i]];
    if (D && D.minDepth && depth < D.minDepth) continue;
    ok.push(pool[i]);
  }
  if (!ok.length) ok = pool;
  return ok[rnd(ok.length)];
}
/* Some creatures are one to a floor.  Roll again if this one is already
   down here somewhere. */
function pickMonsterChar(Lv, depth) {
  for (var t = 0; t < 12; t++) {
    var c = randMonsterChar(depth);
    var D = MON_BY_CHAR[c];
    if (!D || !D.only) return c;
    var seen = 0;
    for (var i = 0; i < Lv.mons.length; i++) if (Lv.mons[i].def.c === c) seen = 1;
    if (!seen) return c;
  }
  /* twelve rolls all landed on the one that is already here: send
     something ordinary instead rather than a second of him */
  for (var j = 0; j < 12; j++) {
    var c2 = randMonsterChar(depth);
    if (!MON_BY_CHAR[c2] || !MON_BY_CHAR[c2].only) return c2;
  }
  return 'r';
}

/* level d6 plus eight a level, scaled for the odd scrawny species */
function monHP(lv, mul) {
  var base = roll(lv, MON_HP_DIE) + Math.round(lv * lv * MON_HP_CURVE) + MON_HP_FLAT;
  return Math.max(1, Math.round(base * (mul || 1)));
}
function mkMonster(c, depth, x, y) {
  var D = MON_BY_C[c];
  /* state 0 dormant, 1 wandering, 2 hunting you */
  var st = 0;
  if (!D.still && rnd(100) < (D.mean ? 48 : 30)) st = 1;
  var m = {
    c: c, def: D, x: x, y: y, lv: D.lv, ar: D.ar, xp: D.xp,
    mhp: monHP(D.lv, D.hpMul), hp: 0,
    state: st, surprised: 0, lost: 0, wx: x, wy: y, ally: 0, life: 0,
    conf: 0, hasted: 0, slowed: 0, cancel: 0, disc: 0, animT: 0, wade: 0,
    blind: 0, dmgBonus: 0, seek: null, mark: null, blindTo: 0,
    held: 0, stuck: 0, webbed: 0, burn: 0, cast: 0, doused: 0, runSteps: 0,
    /* A number of its own, so one creature can point at another across a
       save: a reference would be written out as a second copy of the
       creature and come back as somebody else. */
    uid: (G.monUid = (G.monUid || 0) + 1),
    flasks: D.sp === 'witch' ? WITCH_FLASKS : 0, blinkIn: 0, spiderIn: 0,
    flaskIn: 0, petOf: 0, warp: null, showAt: 0, face: 1,
    invis: D.invis ? 1 : 0, item: null, gold: 0, home: -1,
    bolted: 0, holed: 0, spent: 0, goal: null, ran: 0,
    disguise: D.sp === 'mimic' ? 1 : 0, flee: 0
  };
  m.hp = m.mhp;
  giveBeat(m);
  if (!D.nodrop) {
    if (D.greedy || rnd(100) < 12) m.gold = rnd(depth * 30 + 20);
    var lootChance = (D.n === 'nymph' || D.n === 'leprechaun') ? 45 : 9;
    if (rnd(100) < lootChance) m.item = newItem(depth);
    else if (rnd(100) < 8) {                        /* a handful of arrows */
      var ak = weaponIndex('arrow');
      m.item = mkItem('weapon', ak); m.item.cnt = pileSize(ak); m.item.known = 1;
    }
    else if (!G.pouchMade && depth >= POUCH_FLOOR_MIN && rnd(1000) < 12) {
      m.item = mkItem('pouch', 0); G.pouchMade = 1;
    }
  }
  return m;
}
function monAt(Lv, x, y) {
  for (var i = 0; i < Lv.mons.length; i++)
    if (Lv.mons[i].x === x && Lv.mons[i].y === y) return Lv.mons[i];
  return null;
}
function itemAt(Lv, x, y) {
  for (var i = 0; i < Lv.items.length; i++)
    if (Lv.items[i].x === x && Lv.items[i].y === y) return Lv.items[i];
  return null;
}
function monName(m) {
  if (P.hallu) return 'the ' + MONS[rnd(MONS.length)].n;
  return 'the ' + m.def.n;
}
/* bare name, for the cramped combat bar */
function monShort(m) {
  if (m.invis && !P.seeinv && !hasProp('see invisible')) return 'something unseen';
  return P.hallu ? MONS[rnd(MONS.length)].n : m.def.n;
}
/* Build a combat line that is guaranteed to fit the left hand section.

   It used to give way on the name, chopping it wherever the count ran
   out - so a long phrase around a short name produced "A sour note
   settles on yet." out of a yeti.  A word broken off in the middle is
   not shorter, it is wrong.  The words around the name are decoration
   and the name is the news, so the decoration goes first, and anything
   that still has to be shortened is shortened at a space. */
var FIGHT_COLS = 26;
/* the longest leading run of whole words that fits in w characters */
function clipWords(s, w) {
  if (w <= 0) return '';
  if (s.length <= w) return s;
  var cut = s.lastIndexOf(' ', w);
  if (cut <= 0) return s.substr(0, w);        /* one long word: let it run */
  return s.substr(0, cut);
}
function fightLine(pre, name, post) {
  post = post || '';
  if (pre.length + name.length + post.length <= FIGHT_COLS) return pre + name + post;
  /* What gives way, in order of what it costs to lose.  The full stop
     first: it carries no information at all, and it is exactly the
     character that used to be taken off the end of a creature's name.
     Then whole words of the phrase around the name, because the phrase
     is decoration and the name is the news.  The name last, and then
     only at one of its own spaces - a yeti chopped to "yet" is not a
     shorter yeti, it is a different word. */
  if (pre.length + name.length <= FIGHT_COLS) return pre + name;
  var keep = clipWords(pre.replace(/\s+$/, ''), FIGHT_COLS - name.length - 1);
  if (keep) return keep + ' ' + name;
  return clipWords(name, FIGHT_COLS);
}

function mkChest(depth, lockMat, rich) {
  var c = mkItem('chest', 0);
  c.lock = lockMat || 0;
  /* usually one thing, sometimes two, rarely three */
  var n = 1;
  if (rnd(100) < (c.lock || rich ? 60 : 40)) n++;
  if (n === 2 && rnd(100) < (c.lock || rich ? 30 : 12)) n++;
  var i;
  for (i = 0; i < n; i++)
    chestStock(c, (c.lock || rich) ? newGoodItem(depth) : newItem(depth));
  /* a pouch takes one of the slots rather than adding a fourth */
  if (!G.pouchMade && depth >= POUCH_FLOOR_MIN && rnd(100) < (c.lock ? 30 : 10)) {
    c.items[rnd(n)] = mkItem('pouch', 0);
    G.pouchMade = 1;
  }
  /* the things you only find shut away */
  if (rnd(100) < PIN_CHEST_PCT + (c.lock ? 12 : 0)) chestStock(c, mkItem('pin', 0));
  if (rnd(100) < DYNAMITE_CHEST_PCT + (c.lock ? 10 : 0)) chestStock(c, mkItem('dynamite', 0));
  if (rnd(100) < RUNESTONE_CHEST_PCT + (c.lock ? 10 : 0)) chestStock(c, mkRuneStone());
  /* coins are not one of the five things: they go straight in your purse
     when the lid comes up */
  if (rnd(100) < 60)
    c.gold = rnd(80 + depth * 20) + 20 + (c.lock ? 150 : 0);
  return c;
}
/* put something in the first free square, if there is one */
/* Put a thing in a chest.  This is what you do, and the only question is
   whether there is a square free.

   It used to apply the stocking rules as well - one weapon to a chest,
   never two of the same piece of armour - and refuse you on those
   grounds.  Those rules are about what the dungeon leaves lying around,
   not about what you are allowed to store, and the refusal came back as
   "the chest is full" when it plainly was not.  A chest is for clearing
   out your pack; it does not get an opinion about what you put in it. */
function chestPut(c, it) {
  for (var i = 0; i < CHEST_CAP; i++)
    if (!c.items[i]) { c.items[i] = it; return true; }
  return false;
}
function chestRoom(c) {
  for (var i = 0; i < CHEST_CAP; i++) if (!c.items[i]) return true;
  return false;
}

/* What the dungeon is allowed to leave in one: one weapon, and never the
   same piece of armour twice. */
function chestStock(c, it) {
  var fam = chestFamily(it);
  if (fam) {
    for (var w = 0; w < CHEST_CAP; w++)
      if (c.items[w] && chestFamily(c.items[w]) === fam) return false;
  }
  return chestPut(c, it);
}

/* ------------------------------------------------------- containers
   A pouch you carry and a chest you leave on the floor are the same
   thing to the pack screen: a row or two of squares you can move things
   into and out of. */
function contCap(c) { return c && c.t === 'chest' ? CHEST_CAP : POUCH_CAP; }
function contRows(c) { return Math.ceil(contCap(c) / 5); }
function contCount(c) {
  var n = 0, i;
  if (!c || !c.items) return 0;
  for (i = 0; i < contCap(c); i++) if (c.items[i]) n++;
  return n;
}
/* Loot worth putting behind a lock: never plain food, and inclined to
   come already enchanted. */
/* What is worth locking away.  An even pick across the eight kinds made
   three quarters of every hoard into gear, which is where most of the
   clutter came from; treasure still leans that way, but not that far. */
var GOOD_THINGS = [
  { t: 'potion', p: 22 }, { t: 'scroll', p: 22 }, { t: 'wand', p: 12 },
  { t: 'weapon', p: 12 }, { t: 'armor', p: 10 }, { t: 'shield', p: 8 },
  { t: 'head', p: 7 }, { t: 'feet', p: 7 }
];
function newGoodItem(depth) {
  /* A ring of the huntress turns up a quiver in a hoard now and then -
     not instead of the good things, but among them. */
  if (carryingRing('the huntress') && rnd(100) < HUNTRESS_CHEST_PCT) {
    var ak2 = weaponIndex('arrow');
    var q = mkItem('weapon', ak2);
    q.cnt = pileSize(ak2) + pileSize(ak2); q.known = 1;
    return q;
  }
  var t = GOOD_THINGS[weightedPick(GOOD_THINGS)].t;
  var it, k;
  switch (t) {
    case 'wand': k = weightedPick(WANDS); it = mkItem('wand', k); it.ch = 6 + rnd(8); break;
    case 'scroll': it = mkItem('scroll', weightedPick(SCROLLS)); break;
    case 'potion': it = mkItem('potion', weightedPick(POTIONS)); break;
    case 'weapon':
      do { k = weightedPick(WEAPONS); } while (WEAPONS[k].grp);
      it = mkItem('weapon', k); it.hp = 1 + rnd(3); it.dp = rnd(3);
      break;
    default:
      k = weightedPick(t === 'armor' ? ARMORS : t === 'head' ? HEADS : t === 'feet' ? FEET : SHIELDS);
      it = mkItem(t, k);
      it.ap = 1 + rnd(2);
      break;
  }
  return it;
}
/* Keys hang on your belt rather than filling a pack slot, and a key is
   used up the moment it turns in a lock. */
function hasKey(mat) { return P.keys[mat] > 0; }
function takeKey(mat) { if (P.keys[mat] > 0) { P.keys[mat]--; return true; } return false; }
function keyCount() {
  var n = 0;
  for (var i = 0; i < P.keys.length; i++) n += P.keys[i];
  return n;
}

function populate(Lv) {
  var i;
  var n = MON_BASE + rnd(MON_SPREAD) + Math.min(MON_MAX_EXTRA, (Lv.depth / MON_PER_DEPTH) | 0);
  /* the first floor is where you learn the controls: a tenth quieter */
  if (Lv.depth === 1) n = Math.round(n * FLOOR1_MONSTERS);
  for (i = 0; i < n; i++) {
    var s = randSpot(Lv, randRoom(Lv));
    if (monAt(Lv, s.x, s.y)) continue;
    if (s.x === Lv.stair.x && s.y === Lv.stair.y) continue;
    /* A nursery is one brood of one kind, asleep.  Dropping a wandering
       something else in among them makes it just another room. */
    var sri = Lv.roomAt[s.y * MAP_W + s.x];
    if (sri >= 0 && Lv.rooms[sri] && Lv.rooms[sri].special === 'nursery') continue;
    var nm = mkMonster(pickMonsterChar(Lv, Lv.depth), Lv.depth, s.x, s.y);
    nm.home = Lv.roomAt[s.y * MAP_W + s.x];
    nm.wx = s.x; nm.wy = s.y;
    Lv.mons.push(nm);
  }
  /* A floor should feel picked over, not stocked.  One or two things
     worth stooping for, occasionally a third. */
  var ni = 1;
  if (rnd(100) < 55) ni++;
  for (i = 0; i < ni; i++) dropOnFloor(Lv, newItem(Lv.depth));
  var ng = rnd(3) + 1;
  for (i = 0; i < ng; i++) {
    var g = mkItem('gold', 0);
    g.cnt = rnd(50 + 10 * Lv.depth) + 2 + Lv.depth * 5;
    dropOnFloor(Lv, g);
  }
  scatterAmmo(Lv);
  /* healing crystals: about one a floor, sometimes none, rarely three */
  var r100 = rnd(100);
  var ncry = r100 < 64 ? 0 : r100 < 92 ? 1 : r100 < 98 ? 2 : 3;
  for (i = 0; i < ncry; i++) dropOnFloor(Lv, mkItem('crystal', 0));

  var nc = rnd(100) < 45 ? 1 : 0;
  if (rnd(100) < 10) nc++;
  var chestLocks = [];
  for (i = 0; i < nc; i++) {
    var lm = 0;
    if (Lv.depth > 2 && rnd(100) < 40) { lm = 1 + rnd(MATS.length - 1); chestLocks.push(lm); }
    dropOnFloor(Lv, mkChest(Lv.depth, lm));
  }

  if (Lv.depth >= MAX_DEPTH && !G.amuletMade) {
    dropOnFloor(Lv, mkItem('amulet', 0));
    G.amuletMade = 1;
  }
  placeKeys(Lv, chestLocks);
  stockVault(Lv);
  /* the pockets of rock the halls walled in - each gets a chest, and no
     door.  Bring dynamite. */
  stockDeadSpace(Lv);
  /* The pouch turns up on one of three floors and no others: not so
     early that the pack was never tight, not so late that you have
     spent the run without one.  The floor it lands on is chosen at the
     start of the game, so it is a fact about the dungeon rather than a
     die roll each time you arrive. */
  if (!G.pouchMade && Lv.depth === G.pouchFloor) {
    dropOnFloor(Lv, mkItem('pouch', 0));
    G.pouchMade = 1;
  }
  /* and now take away whatever piled up on top of itself */
  thinRoomLoot(Lv);
}

/* Anything you can only reach by unlocking a door is worth the trip. */
function stockVault(Lv) {
  if (!Object.keys(Lv.locks).length) return;
  var open = reachCopy(Lv, P.x, P.y, true);
  var shut = reachCopy(Lv, P.x, P.y, {});
  var cells = [], x, y;
  for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
    var i = y * MAP_W + x;
    if (!open[i] || shut[i]) continue;
    if (Lv.tiles[i] !== FLOOR) continue;
    if (x === Lv.stair.x && y === Lv.stair.y) continue;
    if (itemAt(Lv, x, y)) continue;
    cells.push([x, y]);
  }
  if (cells.length < 4) return;
  shuffle(cells);
  var n = 1 + rnd(3), placed = 0;
  /* Decide what it is going to be first, then find it somewhere.  Making
     the thing and throwing it away when the square turns out to be no
     good draws from the dice for nothing, and quietly changed how much
     of everything else the floor got. */
  var wantChest = rnd(100) < 55;
  for (var j = 0; j < cells.length && placed < n; j++) {
    var c = cells[j];
    var asChest = (placed === 0 && wantChest);
    if (asChest && blocksDoorway(c[0], c[1], Lv)) continue;
    if (badItemSpot(c[0], c[1], Lv, null)) continue;
    var it = asChest ? mkChest(Lv.depth, 0, 1) : newGoodItem(Lv.depth);
    it.x = c[0]; it.y = c[1]; Lv.items.push(it);
    placed++;
  }
  var gp = cells[cells.length - 1];
  if (!itemAt(Lv, gp[0], gp[1]) && !decorHides(gp[0], gp[1], Lv)) {
    var g = mkItem('gold', 0);
    g.cnt = 120 + rnd(120 + Lv.depth * 30);
    g.x = gp[0]; g.y = gp[1]; Lv.items.push(g);
  }
}

/* Keys go down in reach order: the key to a lock is always somewhere you
   can already walk to before that lock is opened, so a floor is never
   soft-locked. */
function placeKeys(Lv, chestLocks) {
  /* A key is consumed by its lock, so the floor needs exactly as many keys
     as it has locks - doors and chests both. */
  var doorMats = [], doorCount = {}, k, i;
  for (k in Lv.locks) {
    var m = Lv.locks[k];
    doorCount[m] = (doorCount[m] || 0) + 1;
    if (doorMats.indexOf(m) < 0) doorMats.push(m);
  }
  var opened = {}, sx = P.x, sy = P.y;
  for (i = 0; i < doorMats.length; i++) {
    var seen = reachSet(Lv, sx, sy, opened);
    var shun = roomsAtLocks(Lv, doorMats[i], seen);
    for (var c = 0; c < doorCount[doorMats[i]]; c++)
      placeKeyIn(Lv, seen, doorMats[i], shun);
    opened[doorMats[i]] = 1;
  }
  /* one more for every locked chest, anywhere you can eventually walk */
  if (chestLocks.length) {
    var all = reachCopy(Lv, sx, sy, true);
    /* Keys of the same material open each other's locks, so a chest key
       has to keep clear of the doors that share its metal too. */
    for (i = 0; i < chestLocks.length; i++)
      placeKeyIn(Lv, all, chestLocks[i], roomsAtLocks(Lv, chestLocks[i], all));
  }
}
/* Walk the materials in the order you would have to open them, and make
   sure a key of each is standing somewhere you could already have got
   to.  Anything stranded is picked up and put down again within reach. */
function verifyKeys(Lv, sx, sy) {
  var opened = {}, moved = 0, guard = 0;
  var mats = [], k;
  for (k in Lv.locks) if (mats.indexOf(Lv.locks[k]) < 0) mats.push(Lv.locks[k]);
  while (mats.length && guard++ < 12) {
    var seen = reachCopy(Lv, sx, sy, opened);
    var got = -1, i;
    for (i = 0; i < Lv.items.length && got < 0; i++) {
      var it = Lv.items[i];
      if (it.t !== 'key' || mats.indexOf(it.k) < 0) continue;
      if (seen[it.y * MAP_W + it.x]) got = it.k;
    }
    if (got < 0) {
      /* nothing in reach: take the first key of a locked material and
         put it somewhere you can actually walk to */
      var stray = null;
      for (i = 0; i < Lv.items.length && !stray; i++)
        if (Lv.items[i].t === 'key' && mats.indexOf(Lv.items[i].k) >= 0) stray = Lv.items[i];
      if (!stray) break;
      /* Somewhere you can walk to - and, if there is any choice at all,
         not in a room the key's own lock opens onto.  Rescuing a
         stranded key used to ignore that rule and drop it right in
         front of the door it unlocks. */
      var spots = [], away = [], x, y;
      var shun = roomsAtLocks(Lv, stray.k, seen);
      for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
        var j = y * MAP_W + x;
        if (!seen[j] || Lv.tiles[j] !== FLOOR) continue;
        if (x === Lv.stair.x && y === Lv.stair.y) continue;
        if (itemAt(Lv, x, y) || decorHides(x, y, Lv)) continue;
        spots.push([x, y]);
        var ri2 = Lv.roomAt[j];
        if (ri2 < 0 || !shun[ri2]) away.push([x, y]);
      }
      if (away.length) spots = away;
      else stray.cramped = 1;
      if (!spots.length) break;
      var c = spots[rnd(spots.length)];
      /* The key has a new home, so the old one stops being one.  Adding
         the new square without dropping the old left a home no key was
         ever on, and a key carried off the floor could be put back
         there - somewhere it had never been. */
      forgetKeyHome(Lv, stray.k, stray.home);
      stray.x = c[0]; stray.y = c[1];
      stray.home = { d: Lv.depth, x: c[0], y: c[1] };
      if (!Lv.keyHomes) Lv.keyHomes = {};
      (Lv.keyHomes[stray.k] = Lv.keyHomes[stray.k] || []).push({ x: c[0], y: c[1] });
      moved++;
      got = stray.k;
    }
    opened[got] = 1;
    mats.splice(mats.indexOf(got), 1);
  }
  return moved;
}

/* Which rooms a locked door of this material opens onto.  A key lying in
   the same room as the door it opens is no puzzle at all - you would see
   both at once - so those rooms are out of bounds for it. */
function roomsAtLocks(Lv, mat, seen) {
  var out = {}, k, d;
  for (k in Lv.locks) {
    if (Lv.locks[k] !== mat) continue;
    var at = k | 0, dx = at % MAP_W, dy = (at / MAP_W) | 0;
    for (d = 0; d < 4; d++) {
      var j = (dy + DIR4[d][1]) * MAP_W + (dx + DIR4[d][0]);
      var ri = Lv.roomAt[j];
      if (ri < 0) continue;
      /* Only the side you can already stand on.  The room behind the
         lock cannot hold the key in any case, and shunning it as well
         left nowhere to put one on a cramped floor. */
      if (seen && !seen[j]) continue;
      out[ri] = 1;
    }
  }
  return out;
}
function placeKeyIn(Lv, seen, mat, shun) {
  var cands = [], far = [], loose = [], x, y;
  /* Rooms next door to the ones the lock opens onto.  A key in the very
     next room is barely a search; it should be at least one room away. */
  var near = neighbourRooms(Lv, shun);
  for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
    var j = y * MAP_W + x;
    if (!seen[j]) continue;
    if (Lv.tiles[j] !== FLOOR && Lv.tiles[j] !== CORR) continue;
    if (x === Lv.stair.x && y === Lv.stair.y) continue;
    if (itemAt(Lv, x, y) || decorHides(x, y, Lv)) continue;
    loose.push([x, y]);
    var ri = Lv.roomAt[j];
    if (shun && ri >= 0 && shun[ri]) continue;
    cands.push([x, y]);
    if (ri >= 0 && !near[ri]) far.push([x, y]);
  }
  /* a whole room away if the floor allows it, the next room if not, and
     if the reachable part is that one room then a key there beats none */
  var pool = far.length ? far : (cands.length ? cands : loose);
  var key = mkItem('key', mat);
  /* Every square you can reach without a key is inside a room this very
     lock opens onto.  A key there is not what anybody wants, but a floor
     with no key at all is worse.  Mark it, so the fact that this was a
     last resort is recorded rather than inferred. */
  if (!cands.length && loose.length) key.cramped = 1;
  if (pool.length) {
    var c = pool[rnd(pool.length)];
    key.x = c[0]; key.y = c[1];
    /* Where it was lying.  Carry it off the floor unused and it goes
       back to exactly this square. */
    key.home = { d: Lv.depth, x: c[0], y: c[1] };
    if (!Lv.keyHomes) Lv.keyHomes = {};
    (Lv.keyHomes[mat] = Lv.keyHomes[mat] || []).push({ x: c[0], y: c[1] });
    Lv.items.push(key);
  } else dropOnFloor(Lv, key);
}

/* every room that shares a door with one of these */
function neighbourRooms(Lv, rooms) {
  var out = {}, k, i, d;
  if (!rooms) return out;
  for (k in rooms) out[k] = 1;
  for (i = 0; i < Lv.tiles.length; i++) {
    var tt = Lv.tiles[i];
    if (tt !== DOOR && tt !== SDOOR && tt !== LOCKED) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, sides = [];
    for (d = 0; d < 4; d++) {
      var ri = Lv.roomAt[(y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0])];
      if (ri >= 0 && sides.indexOf(ri) < 0) sides.push(ri);
    }
    /* a corridor joins two rooms through two doors, so walk the hall as
       well: anything this door touches that is next to a shunned room */
    for (d = 0; d < sides.length; d++)
      if (rooms[sides[d]])
        for (var e = 0; e < sides.length; e++) out[sides[e]] = 1;
  }
  return out;
}
/* Stones, arrows and bolts lying about, and now and then one with
   letters cut into it. */
function runeStoneKinds() {
  var out = [], i;
  for (i = 0; i < WEAPONS.length; i++) if (WEAPONS[i].rune) out.push(i);
  return out;
}
/* How many of a stackable thing lie together.  One rule, so a pile on
   the floor, a pile in a chest and a pile from the general item table
   are all the same size - and a stone pile is never a hoard. */
function pileSize(k) {
  var W = WEAPONS[k], p = W && W.pile;
  if (!p) return 1;
  return p[0] + rnd(p[1] - p[0] + 1);
}
function mkAmmo(depth) {
  /* Two things fly: stones you throw and arrows you loose.  Bolts used
     to be a third, and the only difference they ever made was whether
     the launcher you had happened to match the quiver you found. */
  var r = rnd(100), name;
  /* A ring of the huntress does not conjure arrows out of nothing: what
     was going to be a couple of stones turns out to be a quiver. */
  var arrowAt = carryingRing('the huntress') ? HUNTRESS_ARROW_PCT : 48;
  name = (r < arrowAt) ? 'arrow' : 'stone';
  var k = weaponIndex(name);
  var it = mkItem('weapon', k);
  it.cnt = pileSize(k); it.known = 1;
  return it;
}
function mkRuneStone() {
  var kinds = runeStoneKinds();
  if (!kinds.length) return mkItem('weapon', weaponIndex('stone'));
  var it = mkItem('weapon', kinds[rnd(kinds.length)]);
  it.cnt = 1;                      /* and unidentified: strange letters */
  return it;
}
function scatterAmmo(Lv) {
  var n = AMMO_PILES_MIN + rnd(AMMO_PILES_MAX - AMMO_PILES_MIN + 1), i;
  for (i = 0; i < n; i++) dropOnFloor(Lv, mkAmmo(Lv.depth));
  if (rnd(100) < RUNESTONE_FLOOR_PCT) dropOnFloor(Lv, mkRuneStone());
  if (rnd(100) < DYNAMITE_FLOOR_PCT) dropOnFloor(Lv, mkItem('dynamite', 0));
}

/* A chest is furniture: you stop on it, you open it, you stand there
   sorting through it.  In the mouth of a doorway that is a cork in the
   only way into the room.  Anything small enough to step over is fine
   there; a chest is not. */
function blocksDoorway(x, y, Lv) {
  var T = (Lv || L).tiles;
  for (var d = 0; d < 4; d++) {
    var nx = x + DIR4[d][0], ny = y + DIR4[d][1];
    if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
    var t = T[ny * MAP_W + nx];
    if (t === DOOR || t === SDOOR || t === LOCKED) return true;
  }
  return false;
}
/* Move any chest that has ended up in a doorway.  Nearby first, so it
   stays in the room it was meant to furnish; anywhere on the floor if
   the room has no clear square left. */
function unblockChests(Lv) {
  var moved = 0, i, d, r;
  for (i = 0; i < Lv.items.length; i++) {
    var c = Lv.items[i];
    if (c.t !== 'chest' || !blocksDoorway(c.x, c.y, Lv)) continue;
    var spot = null;
    for (r = 1; r <= 3 && !spot; r++)
      for (d = 0; d < 8 && !spot; d++) {
        var x = c.x + DIR8[d][0] * r, y = c.y + DIR8[d][1] * r;
        if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
        if (badItemSpot(x, y, Lv, c)) continue;
        spot = { x: x, y: y };
      }
    if (!spot) {
      var cells = [], xx, yy;
      for (yy = 1; yy < MAP_H - 1; yy++) for (xx = 1; xx < MAP_W - 1; xx++)
        if (!badItemSpot(xx, yy, Lv, c)) cells.push([xx, yy]);
      if (cells.length) { var pick2 = cells[rnd(cells.length)]; spot = { x: pick2[0], y: pick2[1] }; }
    }
    /* Nowhere at all on the floor is clear: better a chest in a doorway
       than a chest nobody can find, so leave it and say so. */
    if (!spot) continue;
    c.x = spot.x; c.y = spot.y;
    moved++;
  }
  return moved;
}
function badItemSpot(x, y, Lv, it) {
  if ((Lv || L).tiles[y * MAP_W + x] !== FLOOR) return true;
  if (itemAt(Lv || L, x, y)) return true;
  if (decorHides(x, y, Lv)) return true;
  if (it && it.t === 'chest' && blocksDoorway(x, y, Lv)) return true;
  return false;
}

function dropOnFloor(Lv, it) {
  /* Bare stone only: something lying on bones or under a table cannot be
     seen, and an item you cannot see may as well not be there. */
  for (var t = 0; t < 120; t++) {
    var s = randSpot(Lv, randRoom(Lv));
    if (badItemSpot(s.x, s.y, Lv, it)) continue;
    it.x = s.x; it.y = s.y; Lv.items.push(it);
    return true;
  }
  return false;
}
/* Litter you cannot see past: an item lying on a skull is invisible.
   Moss and cracks are flat markings and hide nothing. */
/* Scenery you cannot put anything down on.  A rug is flat - things lie
   on rugs - so it does not count, any more than moss or a crack does. */
function isRug(d) { return !!d && d.indexOf('rug_') === 0; }
function decorHides(x, y, Lv) {
  var d = (Lv || L).decor[y * MAP_W + x];
  if (!d) return false;
  if (isRug(d)) return false;
  return !isMoss(d) && !isCrack(d);
}
function dropNear(x, y, it) {
  var ring = [[0, 0]].concat(DIR4).concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  var i, nx, ny;
  /* A stone thrown onto a stone joins it.  Every square in the ring
     having something on it used to mean the thing was simply lost, and
     the commonest way to arrange that is to throw twice at the same
     spot. */
  for (i = 0; i < ring.length; i++) {
    nx = x + ring[i][0]; ny = y + ring[i][1];
    if (!walkable(nx, ny)) continue;
    var there = itemAt(L, nx, ny);
    if (!there || !stackable(there, it)) continue;
    there.cnt = (there.cnt || 1) + (it.cnt || 1);
    return true;
  }
  /* first pass: somewhere clear of the scenery */
  for (i = 0; i < ring.length; i++) {
    nx = x + ring[i][0]; ny = y + ring[i][1];
    if (!walkable(nx, ny) || itemAt(L, nx, ny) || decorHides(nx, ny, L)) continue;
    it.x = nx; it.y = ny; L.items.push(it); return true;
  }
  /* nowhere clean nearby - better on the bones than gone */
  for (i = 0; i < ring.length; i++) {
    nx = x + ring[i][0]; ny = y + ring[i][1];
    if (!walkable(nx, ny) || itemAt(L, nx, ny)) continue;
    it.x = nx; it.y = ny; L.items.push(it); return true;
  }
  return false;
}

/* ---------------------------------------------------------- map query */
function tileAt(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return ROCK;
  return L.tiles[y * MAP_W + x];
}
function walkable(x, y) {
  var t = tileAt(x, y);
  return t === FLOOR || t === CORR || t === DOOR || t === STAIR ||
         t === STAIR_UP || t === WATER || t === HOLY || t === BRIDGE;
}
function isTempWall(x, y) { var t = tileAt(x, y); return t === ICEWALL || t === FIREWALL; }
function isDoorish(x, y) {
  var t = tileAt(x, y);
  return t === DOOR || t === SDOOR || t === LOCKED;
}
/* arrows and bolts cannot fly through stone or a shut door.  A sheet of
   flame is see-through and shoot-through; a wall of ice is not. */
function blocksShot(x, y) {
  var t = tileAt(x, y);
  return !(t === FLOOR || t === CORR || t === STAIR || t === STAIR_UP ||
           t === WATER || t === HOLY || t === HOLE || t === FIREWALL ||
           t === BRIDGE);
}
/* Bresenham again, this time for a clear shot rather than clear sight. */
function shotClear(x0, y0, x1, y1) {
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy, x = x0, y = y0, guard = 0;
  while (guard++ < 80) {
    if (x === x1 && y === y1) return true;
    if (!(x === x0 && y === y0) && blocksShot(x, y)) return false;
    var e2 = err + err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return false;
}
/* every enemy you could put an arrow into right now, nearest first */
function shotTargets() {
  var out = [], i;
  for (i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    if (m.ally || m.disguise) continue;
    if (!canSeeMon(m)) continue;
    var d = Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y));
    if (d > shotRange() || d === 0) continue;
    if (!shotClear(P.x, P.y, m.x, m.y)) continue;
    out.push(m);
  }
  out.sort(function (a, b) {
    return (Math.abs(a.x - P.x) + Math.abs(a.y - P.y)) -
           (Math.abs(b.x - P.x) + Math.abs(b.y - P.y));
  });
  return out;
}

/* --------------------------------------------------- conjured barriers */
function placeTempWall(x, y, kind) {
  if (!walkable(x, y)) return false;
  if (monAt(L, x, y)) return false;
  if (x === P.x && y === P.y) return false;
  if (tileAt(x, y) === STAIR) return false;
  var i = y * MAP_W + x;
  L.temp[i] = { under: L.tiles[i], turns: kind === ICEWALL ? ICE_WALL_TURNS : FIRE_WALL_TURNS };
  L.tiles[i] = kind;
  /* A sheet of flame standing on a barrel of powder is a naked flame on
     a barrel of powder, whatever else it is. */
  if (kind === FIREWALL && typeof lightBarrel === 'function') lightBarrel(x, y);
  return true;
}
function ageTempWalls() {
  var gone = 0;
  for (var k in L.temp) {
    var w = L.temp[k];
    if (--w.turns > 0) continue;
    L.tiles[k] = w.under;
    delete L.temp[k];
    gone++;
  }
  if (gone) computeVis();
}
function isWater(x, y) { return tileAt(x, y) === WATER; }
/* The stream runs on under a bridge, so a current in the water crosses
   from one bank to the other even though the planks themselves are dry.
   You do not get shocked for standing on the bridge. */
function waterUnder(x, y) {
  var t = tileAt(x, y);
  if (t === WATER) return 1;
  return (t === BRIDGE && L.under[y * MAP_W + x] === WATER) ? 1 : 0;
}

/* every water tile joined to this one - separate pools stay separate */
function waterBody(x, y) {
  var out = [], seen = {}, q = [[x, y]];
  seen[y * MAP_W + x] = 1;
  while (q.length) {
    var c = q.pop();
    out.push(c);
    for (var d = 0; d < 4; d++) {
      var nx = c[0] + DIR4[d][0], ny = c[1] + DIR4[d][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var k = ny * MAP_W + nx;
      if (seen[k] || !waterUnder(nx, ny)) continue;
      seen[k] = 1; q.push([nx, ny]);
    }
  }
  return out;
}
function roomIndexAt(x, y) {
  /* A creature can be made while a floor is still being built - the
     nursery does it - and at that moment there is no current floor to
     ask.  Answering "no room" is right for the one thing that asks
     during generation, which only wants to know whether to give the
     creature a round to walk. */
  if (!L || x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return -1;
  return L.roomAt[y * MAP_W + x];
}
function trapAt(x, y) {
  for (var i = 0; i < L.traps.length; i++)
    if (L.traps[i].x === x && L.traps[i].y === y) return L.traps[i];
  return null;
}

/* ============================================================ SIGHT
   Fog of war. Every tile you have ever seen stays on the map, dimmed.
   Right now you can see 8 tiles inside a lit room, 3 by torchlight,
   and stone blocks the view.
   ============================================================ */
/* lookup instead of a chain of comparisons - this is the hot path */
var BLOCKS = new Uint8Array(24);
BLOCKS[ROCK] = 1; BLOCKS[WALL] = 1; BLOCKS[SDOOR] = 1;
BLOCKS[DOOR] = 1; BLOCKS[LOCKED] = 1; BLOCKS[ICEWALL] = 1;
/* BARS deliberately absent: the whole point of a grille is that you
   can see the room you cannot get into. */

function blocksSight(x, y) { return BLOCKS[tileAt(x, y)] === 1; }

function losClear(x0, y0, x1, y1) {
  var T = L.tiles, W = MAP_W;
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy, x = x0, y = y0, guard = 0;
  while (guard++ < 80) {
    if (x === x1 && y === y1) return true;
    if (!(x === x0 && y === y0) && BLOCKS[T[y * W + x]]) return false;
    var e2 = err + err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return false;
}
/* Sight, and the one rule for it.

   Bresenham is not symmetric: stepping from A to B can slip past a
   corner that stepping from B to A runs into.  This used to be settled
   with "clear either way", which is generous by about one square in a
   hundred and fifty - and those squares are exactly the corner peeks.
   Worse, the player's sight and a creature's sight each worked it out
   separately, so the two could disagree about who could see whom.

   One predicate, and it wants the line clear both ways. */
function sightClear(x0, y0, x1, y1) {
  return losClear(x0, y0, x1, y1) && losClear(x1, y1, x0, y0);
}

function markVis(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
  var i = y * MAP_W + x;
  /* seen with your own eyes, so it is no longer only on a map */
  L.flags[i] = (L.flags[i] | F_VIS | F_SEEN) & ~F_MAP;   /* secret doors draw as plain wall */
}
/* ------------------------------------------------------------ running
   Five steps in a row without striking anything and you are running
   rather than fighting: moving faster than you are looking.  After that
   there is a chance of going over on each step.  Quick feet are most of
   what stops it; being frightened is most of what causes it. */
function stumbleChance(dex, scared) {
  var c = STUMBLE_PCT + (scared ? STUMBLE_SCARED : 0) - (dex - 10) * STUMBLE_DEX;
  return Math.max(STUMBLE_FLOOR, Math.round(c));
}
/* Is there a fight on?  Something hostile, awake, close, and in plain
   sight.  Being near is not enough: a creature hunting you from the far
   side of a wall is not a reason for you to be running, and stumbling
   over nothing while you explore an empty floor is maddening.  If you
   cannot see what you are supposed to be running from, you are not
   running - you are walking. */
function battleNear() {
  for (var i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    if (m.ally || m.state < 2) continue;
    if (mdist(m) > BATTLE_NEAR) continue;
    /* Both ways.  It has to be able to see you - a creature still
       nominally hunting you from behind a wall is not fighting anybody -
       and you have to be able to see it, or there is nothing there to
       be running from as far as you know. */
    if (!monSeesPlayer(m)) continue;
    if (!canSeeMon(m)) continue;
    return true;
  }
  return false;
}
function playerRunning() { return battleNear() && (P.runSteps || 0) >= RUN_AFTER; }
/* Is this step running away?

   Going over your own feet is something that happens when you turn your
   back on a fight, so the step has to be a retreat from all of it.
   Backing off one creature straight into the reach of another is not
   fleeing - it is closing with the second one, and you are watching
   where you put your feet the whole way.

   Steps are up, down, left or right, so a step changes the distance to
   anything by exactly one square either way; away from every one of
   them is the whole test. */
function stepIsFleeing(dx, dy) {
  var nx = P.x + dx, ny = P.y + dy, any = false, i;
  for (i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    if (m.ally || m.state < 2) continue;
    if (mdist(m) > BATTLE_NEAR) continue;
    if (!monSeesPlayer(m)) continue;
    if (!canSeeMon(m)) continue;
    any = true;
    var now = Math.abs(m.x - P.x) + Math.abs(m.y - P.y);
    var soon = Math.abs(m.x - nx) + Math.abs(m.y - ny);
    if (soon <= now) return false;
  }
  return any;
}
/* Called on every step you take.  Returns true if you went over, in
   which case the step is spent picking yourself up. */
function playerStumbles(dx, dy) {
  if (!playerRunning()) return false;
  if (!stepIsFleeing(dx, dy)) return false;
  if (rnd(100) >= stumbleChance(effDex(), 0)) return false;
  P.runSteps = 0;
  msg('You are running too fast and stumble.', 'O');
  sound('miss');
  return true;
}
function monRunning(m) {
  return mdist(m) <= BATTLE_NEAR && (m.runSteps || 0) >= RUN_AFTER;
}
function monStumbles(m) {
  /* Not the thief with your purse.  He is not running headlong in a
     fight, he is leaving - a scripted flight with a patience of its own -
     and losing turns out of it at random only makes it flaky. */
  if (m.bolted) return false;
  if (!monRunning(m)) return false;
  /* A creature has no dexterity of its own, so its armour class stands
     in for one: the nimble things are the hard ones to hit. */
  var dex = clamp(14 - (m.ar || 5), 3, 20);
  if (rnd(100) >= stumbleChance(dex, m.flee > 0 || P.scare)) return false;
  m.runSteps = 0;
  if (canSeeMon(m))
    msgFight(fightLine('', cap(monShort(m)), ' stumbles.'), 'O', 'stumble', 'O', m);
  return true;
}

/* Is this square one nobody has lit for a very long time? */
function darkAt(x, y) {
  return !!(L.darkMap && L.darkMap[y * MAP_W + x]);
}
/* Whether the dark troubles you at all.  A Night stalker was born to it;
   a ring of the seer lends you the same eyes for a while. */
function nightEyes() { return hasPerk('nightstalker') || P.seer > 0; }
function inTheDark() {
  return darkAt(P.x, P.y) && !nightEyes();
}
/* Twenty turns in which nothing on the floor is hidden from you.  A seam
   in a wall you have laid eyes on stays found afterwards: you cannot
   unsee it when the ring goes cold. */
function seerLook() {
  if (P.seer <= 0) return 0;
  var found = 0, i, x, y;
  for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
    var j = y * MAP_W + x;
    if (!(L.flags[j] & F_VIS)) continue;
    if (L.tiles[j] === SDOOR) { L.tiles[j] = DOOR; found++; }
  }
  for (i = 0; i < L.traps.length; i++) {
    var tr = L.traps[i];
    if (tr.found) continue;
    if (L.flags[tr.y * MAP_W + tr.x] & F_VIS) { tr.found = 1; found++; }
  }
  if (found) {
    msg(found > 1 ? 'The ring shows you ' + found + ' things that were hidden.'
                  : 'The ring shows you something that was hidden.', 'P');
    computeVis();
  }
  return found;
}

/* does this square have a floor of that room beside it? */
function touchesRoom(idx, ri) {
  var W = MAP_W, RA = L.roomAt, x = idx % W, y = (idx / W) | 0;
  /* The sight pass asks this of nearly every square it looks at, and
     away from the very edge of the map none of the eight neighbours can
     fall off it - so the bounds check, and walking a list of pairs to
     get the offsets, are both work that need not happen. */
  if (x > 0 && y > 0 && x < W - 1 && y < MAP_H - 1) {
    return RA[idx - W - 1] === ri || RA[idx - W] === ri || RA[idx - W + 1] === ri ||
           RA[idx - 1]     === ri ||                       RA[idx + 1]     === ri ||
           RA[idx + W - 1] === ri || RA[idx + W] === ri || RA[idx + W + 1] === ri;
  }
  for (var d = 0; d < 8; d++) {
    var nx = x + DIR8[d][0], ny = y + DIR8[d][1];
    if (nx < 0 || ny < 0 || nx >= W || ny >= MAP_H) continue;
    if (RA[ny * W + nx] === ri) return true;
  }
  return false;
}

function computeVis() {
  var F = L.flags, T = L.tiles, W = MAP_W, LM = L.litMap;
  var px = P.x, py = P.y, i, x, y, dx, dy;
  for (i = 0; i < F.length; i++) F[i] &= ~F_VIS;
  markVis(px, py);
  if (P.blind) return;

  /* Standing in the dark you see the square you are on and the ones you
     could touch, and nothing further - unless the dark is nothing to
     you.  A dark square is no more visible from a lit one, either: you
     cannot see into a room with no light in it. */
  var blind = inTheDark();
  var seeInDark = nightEyes();
  /* The room you are standing in lights its own walls and doorways, out
     as far as it lights its floor.  Only the room you are in: a lit room
     used to light its outline for anybody within nine squares, so from a
     dark corridor you could pick out its doors long before you could see
     the ground under your feet. */
  var myRoom = roomIndexAt(px, py);
  var myLit = myRoom >= 0 && L.rooms[myRoom] && L.rooms[myRoom].lit &&
              !L.rooms[myRoom].dark;

  var R = LIT_RADIUS, x0 = Math.max(0, px - R), x1 = Math.min(MAP_W - 1, px + R);
  var y0 = Math.max(0, py - R), y1 = Math.min(MAP_H - 1, py + R);
  /* A lamp lights the room it hangs in, however big the room is.  The
     search used to stop nine squares out whatever it was looking at, so
     in a chamber wider than that the far wall and the door in it stayed
     dark while the floor beside them was plain to see - the room looked
     like it had no far side.  Standing in a lit room, its own floor and
     its own outline are inside the search whatever the distance; what
     you can actually see of it is still up to the line of sight. */
  var mine = myLit ? L.rooms[myRoom] : null;
  if (mine) {
    x0 = Math.min(x0, Math.max(0, mine.x - 1));
    x1 = Math.max(x1, Math.min(MAP_W - 1, mine.x + mine.w));
    y0 = Math.min(y0, Math.max(0, mine.y - 1));
    y1 = Math.max(y1, Math.min(MAP_H - 1, mine.y + mine.h));
  }

  for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
    if (x === px && y === py) continue;
    var ax = x > px ? x - px : px - x, ay = y > py ? y - py : py - y;
    var dist = ax > ay ? ax : ay;
    var idx = y * W + x;
    var reach = LM[idx] ? LIT_RADIUS : TORCH_RADIUS;
    if (reach === TORCH_RADIUS && myLit && BLOCKS[T[idx]] && touchesRoom(idx, myRoom))
      reach = LIT_RADIUS;
    /* your own lit room, floor and outline both, at any distance */
    if (myLit && (L.roomAt[idx] === myRoom || touchesRoom(idx, myRoom)))
      reach = MAP_W + MAP_H;
    if (!seeInDark && (blind || L.darkMap[idx])) reach = DARK_RADIUS;
    if (dist > reach) continue;
    if (sightClear(px, py, x, y)) F[idx] = (F[idx] | F_VIS | F_SEEN) & ~F_MAP;
  }
  /* Light the wall faces bordering anything you can see, so a room never
     looks like it has holes punched in its outline.  Doors sit inside a
     wall, so they get lit exactly the same way - otherwise a doorway you
     are staring straight at stays invisible. */
  for (y = Math.max(1, y0); y <= Math.min(MAP_H - 2, y1); y++) {
    for (x = Math.max(1, x0); x <= Math.min(MAP_W - 2, x1); x++) {
      var j = y * W + x;
      if (F[j] & F_VIS) continue;
      if (!BLOCKS[T[j]] || T[j] === ROCK) continue;
      var bx = x > px ? x - px : px - x, by = y > py ? y - py : py - y;
      var d0 = bx > by ? bx : by;
      var lit = 0;
      for (var a = -1; a <= 1 && !lit; a++) for (var b = -1; b <= 1; b++) {
        if (!a && !b) continue;
        var nx = x + a, ny = y + b;
        var cx = nx > px ? nx - px : px - nx, cy = ny > py ? ny - py : py - ny;
        if ((cx > cy ? cx : cy) > d0) continue;
        var ni = ny * W + nx;
        if ((F[ni] & F_VIS) && !BLOCKS[T[ni]]) { lit = 1; break; }
      }
      if (lit) F[j] = (F[j] | F_VIS | F_SEEN) & ~F_MAP;
    }
  }
}
function canSeeMonAt(m, x, y) {
  if (P.blind) return false;
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
  if (!(L.flags[y * MAP_W + x] & F_VIS)) return false;
  if (m.invis && !P.seeinv && !hasProp('see invisible')) return false;
  return true;
}
/* Where it really is.  The rules always want this one; only the drawing
   asks about the square it happens to be standing on at this instant of
   the playback. */
function canSeeMon(m) { return canSeeMonAt(m, m.x, m.y); }
/* Felt rather than seen.  Monster sight reaches through stone, so no
   line of sight is asked for and the dark is no object - but it reaches
   only so far, and it finds creatures, never things.  Measured corner to
   corner, so its edge is a square about you rather than a diamond: what
   you watch is the ring of floor around you, walls and all. */
function sensedMon(m) {
  if (!(P.monsight > 0)) return false;
  return Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y)) <= MONSIGHT_RANGE;
}

/* ---------------------------------------------------------- level flow */
/* Where you come out, arriving on a floor you have already walked.
   Stairs are a pair: the one you go down and the one you come up are the
   same pair of steps seen from either end. */
function arriveOn(Lv, how) {
  var at = null;
  if (how === 'up') at = Lv.stair;              /* back at the way down */
  else if (how === 'down') at = Lv.up;          /* out of the way up */
  if (how === 'fall' || !at) {
    var cands = [], x, y, out = wayOutSet(Lv);
    for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
      var j = y * MAP_W + x;
      if (Lv.tiles[j] !== FLOOR) continue;
      if (Lv.roomAt[j] < 0) continue;
      if (Lv.caged && Lv.caged[j]) continue;
      if (Lv.rooms[Lv.roomAt[j]] && Lv.rooms[Lv.roomAt[j]].sealed) continue;
      if (monAt(Lv, x, y) || itemAt(Lv, x, y)) continue;
      /* and it has to be somewhere you can walk out of again */
      if (!canLeaveFrom(Lv, x, y, out)) continue;
      cands.push([x, y]);
    }
    if (cands.length) { var c = cands[rnd(cands.length)]; return { x: c[0], y: c[1] }; }
    at = Lv.up || Lv.stair;
  }
  return { x: at.x, y: at.y };
}

/* how: 'down' by the stairs, 'up' by the stairs, or 'fall' through the
   floor.  A floor you have been on before is the floor you left. */
/* An unused key belongs to the floor it was cut for, not to you.  Leave
   without turning it and it goes back to the flagstone you took it from,
   so a floor you come back to still has its key where you left it - and
   so a pocketful of keys from four floors up is not a lockpick set. */
function returnKeys(from) {
  var lv = G.floors && G.floors[from];
  if (!lv || !P.keys) return 0;
  var back = 0;
  for (var mat = 0; mat < P.keys.length; mat++) {
    while (P.keys[mat] > 0) {
      P.keys[mat]--;
      var spot = keyHome(lv, mat);
      var key = mkItem('key', mat);
      key.x = spot.x; key.y = spot.y;
      key.home = { d: from, x: spot.x, y: spot.y };
      lv.items.push(key);
      back++;
    }
  }
  if (back) msg('You leave the ' + (back > 1 ? 'keys' : 'key') + ' behind.', '6');
  return back;
}
function forgetKeyHome(Lv, mat, home) {
  var list = Lv.keyHomes && Lv.keyHomes[mat];
  if (!list || !home) return;
  for (var i = list.length - 1; i >= 0; i--)
    if (list[i].x === home.x && list[i].y === home.y) { list.splice(i, 1); return; }
}
/* where a key of this metal was lying on that floor */
function keyHome(lv, mat) {
  if (lv.keyHomes && lv.keyHomes[mat] && lv.keyHomes[mat].length)
    return lv.keyHomes[mat][rnd(lv.keyHomes[mat].length)];
  return { x: lv.stair.x, y: lv.stair.y };
}

/* The walkable square furthest from here, measured by walking rather
   than as the crow flies - the long way round is what makes it far. */
/* The furthest square from here that a staircase may stand on.  Pass a
   room to keep out of and it prefers anywhere else: two staircases in
   the room you arrive in makes crossing the floor optional, which is the
   one thing they are for. */
function farthestFloorFrom(Lv, fx, fy, avoidRoom) {
  var dist = {}, q = [fy * MAP_W + fx], head = 0, best = null, bestD = -1;
  var away = null, awayD = -1;
  dist[q[0]] = 0;
  while (head < q.length) {
    var c = q[head++], cx = c % MAP_W, cy = (c / MAP_W) | 0;
    for (var d = 0; d < 4; d++) {
      var nx = cx + DIR4[d][0], ny = cy + DIR4[d][1];
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      var n = ny * MAP_W + nx;
      if (dist[n] !== undefined || !walkTile(Lv.tiles[n])) continue;
      dist[n] = dist[c] + 1;
      q.push(n);
      /* only a plain room floor will do for a staircase, and not one
         walled in on purpose */
      if (Lv.tiles[n] !== FLOOR) continue;
      if (Lv.roomAt[n] < 0) continue;
      if (Lv.sealed && Lv.sealed[n]) continue;
      if (Lv.rooms[Lv.roomAt[n]] && Lv.rooms[Lv.roomAt[n]].sealed) continue;
      /* Not in a hand-made room either.  The way down already keeps out
         of them; the way back up is placed later, which is how a
         staircase ended up in the middle of a nursery. */
      if (Lv.rooms[Lv.roomAt[n]] && Lv.rooms[Lv.roomAt[n]].special) continue;
      if (Lv.caged && Lv.caged[n]) continue;
      if (dist[n] > bestD) { bestD = dist[n]; best = { x: nx, y: ny }; }
      if (avoidRoom !== undefined && avoidRoom >= 0 && Lv.roomAt[n] !== avoidRoom &&
          dist[n] > awayD) { awayD = dist[n]; away = { x: nx, y: ny }; }
    }
  }
  return away || best;
}

function enterLevel(depth, how) {
  how = how || 'down';
  /* the floor you are stepping off keeps its own keys */
  if (G.depth && G.depth !== depth) returnKeys(G.depth);
  G.depth = depth;
  if (depth > G.maxDepth) G.maxDepth = depth;

  /* The dungeon remembers.  Every floor you have walked is kept, with
     its monsters, its loot and every wall you blew open, so climbing
     back up puts you where you were rather than somewhere new. */
  if (G.floors && G.floors[depth]) {
    L = G.floors[depth]; G.level = L;
    setDims(L.mw, L.mh);
    var spot = arriveOn(L, how);
    P.x = spot.x; P.y = spot.y;
    /* Arriving somewhere else on a floor you have been on before changes
       what you can reach without a key, so the keys are checked again
       from where you are actually standing. */
    verifyKeys(L, P.x, P.y);
    computeVis();
    return;
  }

  /* Deal a floor, seal its secret room and its vault, and only keep it if
     everything is still walkable afterwards.  Sealing is what can go
     wrong - bricking up a door to isolate one room can isolate another
     by accident - and it is far cheaper to deal again than to unpick. */
  var cand = null, start = null, i, rr;
  for (var tries = 0; tries < 24; tries++) {
    var Lv = genLevel(depth);
    var s0 = startSpot(Lv);
    var seen = reachSet(Lv, s0.x, s0.y, true);
    if (!seen[Lv.stair.y * MAP_W + Lv.stair.x]) continue;
    var ok = 0, tot = 0;
    for (i = 0; i < Lv.rooms.length; i++) {
      rr = Lv.rooms[i]; if (rr.gone) continue;
      tot++; if (seen[rr.cy * MAP_W + rr.cx]) ok++;
    }
    if (ok < tot) continue;

    /* the sealing has to happen before we can judge the result */
    L = Lv; G.level = Lv;
    setDims(Lv.mw, Lv.mh);
    ensureSecretDoor(Lv, s0.x, s0.y);
    lockDoors(Lv, depth, s0.x, s0.y);
    /* sealing cuts fresh doors and can leave a hallway going nowhere */
    tidyFloor(Lv);
    if (!everywhereReachable(Lv)) continue;     /* sealing went wrong */

    /* and it must have both: a room behind a hidden door, and a vault.
       On a cramped floor there may not be room for two, in which case
       another deal is cheaper than a floor missing one. */
    var hasSecret = 0, hasLock = 0;
    for (i = 0; i < Lv.tiles.length; i++) {
      if (Lv.tiles[i] === SDOOR) hasSecret = 1;
      else if (Lv.tiles[i] === LOCKED) hasLock = 1;
    }
    if (!hasSecret || !hasLock) continue;
    if (!secretApproachable(Lv, s0.x, s0.y)) continue;
    /* and the key has to be worth carrying */
    if (!everyLockGuardsSomething(Lv)) continue;

    cand = Lv; start = s0; break;
  }
  if (!cand) {
    cand = genLevel(depth); start = startSpot(cand);
    L = cand; G.level = cand; setDims(cand.mw, cand.mh);
    ensureSecretDoor(cand, start.x, start.y);
    lockDoors(cand, depth, start.x, start.y);
    tidyFloor(cand);
  }

  L = cand; G.level = L;
  setDims(L.mw, L.mh);   /* the globals must match the floor we kept */
  P.x = start.x; P.y = start.y;     /* set first: keys are placed by reach */
  populate(L);

  /* if something landed on the entry square, move within the same region
     so we never start on the wrong side of a locked door */
  if (monAt(L, P.x, P.y) || itemAt(L, P.x, P.y) ||
      (P.x === L.stair.x && P.y === L.stair.y)) {
    var region = reachSet(L, start.x, start.y, {}), cands = [], x, y;
    for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
      var j = y * MAP_W + x;
      if (!region[j] || L.tiles[j] !== FLOOR) continue;
      if (L.caged && L.caged[j]) continue;
      if (monAt(L, x, y) || itemAt(L, x, y)) continue;
      if (x === L.stair.x && y === L.stair.y) continue;
      cands.push([x, y]);
    }
    if (cands.length) { var c = cands[rnd(cands.length)]; P.x = c[0]; P.y = c[1]; }
  }

  /* However you got here, the way down is not in this room. */
  moveStairAwayFrom(L, P.x, P.y);
  /* Fell in through the ceiling?  Then the stairs up are not where you
     landed - they are somewhere else on the floor, to be found. */
  if (how === 'fall') {
    var upSpot = arriveOn(L, 'fall');
    /* the two staircases want to be at opposite ends of the floor, so
       crossing it is the price of going down */
    var farUp = farthestFloorFrom(L, L.stair.x, L.stair.y,
      L.roomAt[L.stair.y * MAP_W + L.stair.x]);
    if (farUp) upSpot = farUp;
    if (tileAt(upSpot.x, upSpot.y) === FLOOR &&
        !(upSpot.x === L.stair.x && upSpot.y === L.stair.y)) {
      L.tiles[upSpot.y * MAP_W + upSpot.x] = STAIR_UP;
      L.up = { x: upSpot.x, y: upSpot.y };
    }
  }

  /* The way back is exactly where you came in - that is where the stairs
     from the floor above let you out.  The first floor gets one too: it
     is how you entered the dungeon, even though it will not take you
     back out again. */
  if (!L.up) {
    /* Where you came in, unless that happens to be inside a hand-made
       room - then the furthest ordinary floor from the way down, which
       is where it would have gone anyway.  Every floor must have one:
       skipping it left you on a floor with no way back. */
    var upAt = null;
    var homeRi = roomIndexAt(P.x, P.y);
    var homeOk = tileAt(P.x, P.y) === FLOOR &&
                 !(homeRi >= 0 && L.rooms[homeRi] && L.rooms[homeRi].special);
    if (homeOk) upAt = { x: P.x, y: P.y };
    else upAt = farthestFloorFrom(L, L.stair.x, L.stair.y,
      L.roomAt[L.stair.y * MAP_W + L.stair.x]);
    if (upAt && !(upAt.x === L.stair.x && upAt.y === L.stair.y) &&
        tileAt(upAt.x, upAt.y) === FLOOR) {
      L.tiles[upAt.y * MAP_W + upAt.x] = STAIR_UP;
      L.up = { x: upAt.x, y: upAt.y };
      /* You came down a staircase, so you are standing on one.  When the
         square you arrived on could not take the stairs - a hand-made
         room will not have one - the stairs go elsewhere and you go with
         them, rather than being left across the floor from your own way
         back. */
      if (!homeOk && how !== 'fall') { P.x = upAt.x; P.y = upAt.y; }
    }
  }
  /* Nothing is left standing on the way back up.  The staircase is put in
     after the floor has been furnished, so it can come down on top of a
     barrel somebody rolled into the room - and a barrel underneath a
     staircase is not a barrel, it is a drawing mistake. */
  if (L.up) {
    var uj = L.up.y * MAP_W + L.up.x;
    delete L.decor[uj];
    if (L.barrels) delete L.barrels[uj];
    if (L.rugId) delete L.rugId[uj];
  }
  /* Nothing stands on a barrel, so no barrel may wall a way through.
     This waits until the end rather than running with the rest of the
     generator because the floor is not finished until the staircase back
     up has been placed and the last of the doors have stopped moving,
     and a floor still being cut about is not one you can ask whether you
     can walk all of. */

  /* last of all: anything that is called a door and is not one stops
     being one, any lock that turns out to guard nothing becomes an
     ordinary door, so no key is ever ceremonial, and any rug the rest of
     the building work has spoiled is lifted */
  tidyDoors(L);
  /* Dead ends are trimmed while the floor is being cut, but a good deal
     happens afterwards - a door that turns out not to be one takes a
     wall with it - so look once more now that nothing else will move.
     Only at squares with nothing on them: a hallway with the stairs at
     the end of it is not a mistake. */
  trimDeadEnds(L, 1);
  retireEmptyLocks(L);
  tidyRugs(L);
  /* A chest is placed on a square that is clear of doorways at the time
     - but a great deal of door work happens afterwards, and a door made
     next to a chest corks the doorway just as surely as a chest put
     next to a door.  So look once at the end, when the doors have
     stopped moving, and shift anything standing in a gateway. */
  unblockChests(L);
  /* And now check the keys, with the floor in the state you will
     actually walk into.  A key has to be findable with the doors it does
     not open still shut, and a great deal happens to a floor between
     laying the keys down and finishing it - so look at the end rather
     than reason about every pass in between. */
  verifyKeys(L, P.x, P.y);
  tidyBarrels(L);
  tidyCracks(L);
  edgeTheMoss(L);
  tidyMossEdges(L);
  /* last of all, with nothing else left to move the stone about */
  sealRock(L);

  if (hasPerk('antiquary')) P.freeIdent = 1;

  if (!G.floors) G.floors = {};
  G.floors[depth] = L;

  /* Nothing is waiting for you in the room you arrive in on the first
     floor.  You get to read the controls before anything bites. */
  if (depth === 1) {
    var homeRoom = roomIndexAt(P.x, P.y);
    for (var mi = L.mons.length - 1; mi >= 0; mi--) {
      var mm = L.mons[mi];
      if (roomIndexAt(mm.x, mm.y) === homeRoom) L.mons.splice(mi, 1);
    }
  }
  computeVis();
}
/* start away from any locked door so its key is reachable */
/* The way down must never share a room with the way in - however you
   arrived, by stair or by falling through the ceiling.  Finding the
   next staircase should cost you a walk. */
/* A hidden door is only a secret room if you can get to the wall it is
   in.  One walled away behind the rest of the sealing is just a room
   nobody will ever see. */
function secretApproachable(Lv, sx, sy) {
  var seen = reachSet(Lv, sx, sy, true), i, d;
  for (i = 0; i < Lv.tiles.length; i++) {
    if (Lv.tiles[i] !== SDOOR) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0;
    for (d = 0; d < 4; d++) {
      var j = (y + DIR4[d][1]) * MAP_W + (x + DIR4[d][0]);
      var t = Lv.tiles[j];
      if ((t === FLOOR || t === CORR) && seen[j]) return true;
    }
  }
  return false;
}

/* ------------------------------------------------------ thinning out
   A vault and a walled-in pocket were each being stocked generously by
   their own code, and then the ordinary scatter added more on top.  One
   chest to a room, two things on its floor, and never two of a kind -
   two swords in a heap is a pile of loot, not a find.

   The rooms you asked for by hand are exempt: a cell with eight potions
   in it is the whole point of a cell with eight potions in it. */
var ROOM_ITEM_CAP = 2;

/* What may not turn up twice in the same place.  Two potions, two
   scrolls, two piles of stones are all perfectly fine - it is only arms
   and armour that read as a pile of loot rather than a find.  Arrows and
   the like are ammunition, not weapons. */
function gearFamily(it) {
  if (!it) return null;
  if (it.t === 'weapon') return WEAPONS[it.k].grp ? null : 'weapon';
  if (it.t === 'armor' || it.t === 'head' || it.t === 'feet' || it.t === 'shield')
    return 'armour';
  return null;
}
/* Inside a chest the rule is looser: one weapon, and no two of the same
   kind of armour - two helmets, two pairs of boots. */
function chestFamily(it) {
  if (!it) return null;
  if (it.t === 'weapon') return WEAPONS[it.k].grp ? null : 'weapon';
  if (it.t === 'armor' || it.t === 'head' || it.t === 'feet' || it.t === 'shield')
    return 'armour:' + it.t;
  return null;
}

function thinRoomLoot(Lv) {
  var byRoom = {}, i, cut = 0;
  for (i = 0; i < Lv.items.length; i++) {
    var it = Lv.items[i];
    if (it.t === 'gold' || it.t === 'key') continue;   /* coins and keys are not treasure */
    var ri = Lv.roomAt[it.y * MAP_W + it.x];
    if (ri < 0) continue;                              /* corridors are their own business */
    var r = Lv.rooms[ri];
    if (!r || r.special) continue;                     /* hand made rooms keep what they were given */
    (byRoom[ri] = byRoom[ri] || []).push(it);
  }
  var drop = [];
  for (var k in byRoom) {
    var list = byRoom[k], kept = [], chests = 0, fams = {};
    shuffle(list);
    /* a chest first if there is one, so a room never loses its chest */
    list.sort(function (a, b) { return (b.t === 'chest') - (a.t === 'chest'); });
    for (i = 0; i < list.length; i++) {
      var o = list[i];
      if (o.t === 'chest') {
        if (chests) { drop.push(o); continue; }        /* one chest to a room */
        chests++; kept.push(o); continue;
      }
      if (kept.length - chests >= ROOM_ITEM_CAP) { drop.push(o); continue; }
      var fam = gearFamily(o);
      if (fam && fams[fam]) { drop.push(o); continue; } /* never two of a kind */
      if (fam) fams[fam] = 1;
      kept.push(o);
    }
  }
  for (i = 0; i < drop.length; i++) {
    var at = Lv.items.indexOf(drop[i]);
    if (at >= 0) { Lv.items.splice(at, 1); cut++; }
  }
  return cut;
}

function moveStairAwayFrom(Lv, sx, sy) {
  var home = roomIndexAt(sx, sy);
  var here = roomIndexAt(Lv.stair.x, Lv.stair.y);
  if (home < 0 || here !== home) return 0;
  var seen = reachSet(Lv, sx, sy, true), cands = [], x, y;
  for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
    var j = y * MAP_W + x;
    if (!seen[j] || Lv.tiles[j] !== FLOOR) continue;
    var ri = Lv.roomAt[j];
    if (ri < 0 || ri === home) continue;            /* another room, not a hall */
    if (Lv.rooms[ri] && Lv.rooms[ri].sealed) continue;
    /* and not into a hand-made room - this pass runs after they are
       built, which is how a staircase turned up in a nursery */
    if (Lv.rooms[ri] && Lv.rooms[ri].special) continue;
    if (x === sx && y === sy) continue;
    if (monAt(Lv, x, y) || itemAt(Lv, x, y) || decorHides(x, y, Lv)) continue;
    if (trapAt && trapAt(x, y)) continue;
    cands.push([x, y]);
  }
  if (!cands.length) return 0;
  var c = cands[rnd(cands.length)];
  Lv.tiles[Lv.stair.y * MAP_W + Lv.stair.x] = FLOOR;
  Lv.tiles[c[1] * MAP_W + c[0]] = STAIR;
  Lv.stair.x = c[0]; Lv.stair.y = c[1];
  return 1;
}

function startSpot(Lv) {
  var r = randRoom(Lv), s = randSpot(Lv, r);
  if (Lv.caged && Lv.caged[s.y * MAP_W + s.x]) s = { x: -1, y: -1 };
  if (s.x < 0 || Lv.tiles[s.y * MAP_W + s.x] !== FLOOR) {
    for (var i = 0; i < Lv.rooms.length; i++) {
      if (Lv.rooms[i].gone) continue;
      var t = randSpot(Lv, Lv.rooms[i]);
      if (Lv.caged && Lv.caged[t.y * MAP_W + t.x]) continue;
      if (Lv.tiles[t.y * MAP_W + t.x] === FLOOR) return t;
    }
  }
  return s;
}

/* ---------------------------------------------------------- combat */
/* d20 against a target number.  Always at least a 5% chance either way,
   so nothing is ever completely immune or completely helpless. */
function swing(atLvl, opArm, wplus, base) {
  var need = ((base === undefined ? HIT_BASE_MON : base) - atLvl) - opArm - wplus;
  if (need < 2) need = 2;
  if (need > 19) need = 19;
  return (rnd(20) + 1) >= need;
}
function swingP(atLvl, opArm, wplus) { return swing(atLvl, opArm, wplus, HIT_BASE_PLAYER); }
function damRoll(dice) {
  var t = 0;
  for (var i = 0; i < dice.length; i++) t += roll(dice[i][0], dice[i][1]);
  return t;
}
/* It has just been hit by something of yours - a blade, an arrow, a
   bolt of fire, a flask that broke over it.  However far off you were
   standing, it now knows where you are, and the tally of rounds it has
   spent without a glimpse of you starts again from nothing.

   That tally is what decides whether stepping into view catches it off
   guard.  Only melee used to reset it, so anything you could hit from
   further off than a creature can see - a bow carries ten squares and
   nothing sees past nine - handed you a fresh ambush with every shot. */
function hurtByPlayer(m) {
  if (!m || m.ally) return;
  m.runSteps = 0;                 /* it has stopped to fight */
  m.state = 2;
  m.surprised = 0;
  m.disguise = 0;
  m.blindTo = 0;
  m.lost = 0;
  m.seek = null;
  m.mark = { x: P.x, y: P.y, dx: 0, dy: 0 };
}

function playerAttack(m) {
  var sneak = surpriseHit(m), extra = surpriseDam(m), unaware = m.state < 2;
  var reeling = m.surprised;
  m.disguise = 0;
  var w = P.eq.rh;
  var dice = w ? [WEAPONS[w.k].d] : [[1, 4]];
  var name = monShort(m);
  /* It has been hit.  It knows exactly where you are, and it will not
     count as having lost you until it really has - the tally of rounds
     without a glimpse of you starts again from nothing.  Without this,
     a creature you woke by hitting it was still carrying all the rounds
     it had spent asleep, so it flagged itself caught out on its very
     next turn and handed you a second free strike. */
  hurtByPlayer(m);
  P.runSteps = 0;                 /* you have stopped to fight */
  /* Swinging a thing tells you what it is, the same way wearing it
     does - by finding out the hard way. */
  if (w && !w.known) { w.known = 1; learnGear(w); msg('You feel out ' + itemName(w) + '.', 'c'); }
  breakClearwater('You strike, and the water runs off you.');
  markLunge(P, m.x, m.y);          /* lean into it, hit or miss */
  if (swingP(P.lv, m.ar + (dazzled(m) ? DAZZLE_ARMOR : 0), playerHitBonus() + sneak)) {
    var dm = damRoll(dice) + playerDamBonus() + extra;
    if (dm < 1) dm = 1;
    /* Now and then a blow goes in properly.  A ring of battle luck makes
       it happen a good deal more often. */
    var critAt = CRIT_PCT + (carryingRing('battle luck') ? LUCK_CRIT_PCT : 0);
    var crit = rnd(100) < critAt;
    if (crit) dm *= CRIT_MULT;
    m.hp -= dm;
    markHurt(m, P.x, P.y);
    var fx = dm + (extra ? ' sneak' : crit ? ' telling' : ' damage');
    if (m.hp <= 0) { killMonster(m, true, fx); return; }
    /* An executioner finishes what is already almost finished. */
    if (hasPerk('executioner') && m.hp * PERK_EXECUTE_FRAC <= m.mhp &&
        rnd(100) < PERK_EXECUTE_PCT) {
      msgFight(fightLine('You finish ', name, ' off.'), 'y', 'executed', 'R', m);
      killMonster(m, true, 'executed');
      return;
    }
    msgFight(fightLine(unaware ? 'You ambush ' : reeling ? 'You batter ' : 'You hit ',
      name, '.'), unaware ? 'c' : 'y', fx, 'O', m);
    if (P.confuseTouch) {
      P.confuseTouch = 0; m.conf = rnd(8) + 8;
      msgFight('Your hands flare red.', 'P', 'confused', 'P', m);
    }
    if (runeStrike(m)) return;                 /* the rune finished it */
    if (weaponRune() && weaponRune().n === 'knockback' &&
        rnd(100) < KNOCKBACK_PCT && L.mons.indexOf(m) >= 0) {
      if (knockBack(m, P.x, P.y))
        msgFight(fightLine('You send ', name, ' reeling.'), 'y', 'knocked back', 'c', m);
    }
    if (!m.flee && m.hp * 4 < m.mhp && rnd(100) < 30) m.flee = FLEE_TURNS + rnd(FLEE_TURNS);
  } else {
    sound('miss');
    msgFight(fightLine('You miss ', name, '.'), 'g', 'miss', '6', m);
  }
}
/* Setting something alight, and freezing it solid.  A sword of fire, a
   burning stone and anything else that catches all end up here, so they
   burn for the same length of time and leave the same trail. */
function igniteMon(m, line) {
  if (m.def.sp === 'flame') {              /* it is made of the stuff */
    if (canSeeMon(m)) msgFight('The flames wash over it.', '6', 'unburnt', '6', m);
    return 0;
  }
  /* Standing in the water is the one place nothing catches. */
  if (inWater(m.x, m.y)) {
    if (canSeeMon(m)) msgFight('The water keeps it from catching.', 'c', 'wet', 'c', m);
    return 0;
  }
  var turns = BURN_MIN + rnd(BURN_MAX - BURN_MIN + 1);
  m.burn = Math.max(m.burn || 0, turns);
  hurtByPlayer(m);
  msgFight(line || 'It catches fire.', 'R', 'alight', 'R', m);
  return turns;
}
function freezeMon(m, line) {
  var turns = ICE_MIN + rnd(ICE_MAX - ICE_MIN + 1);
  m.stuck = (m.stuck || 0) + turns;
  hurtByPlayer(m);
  msgFight(line || 'It freezes solid.', 'c', 'frozen ' + turns, 'c', m);
  return turns;
}
/* One turn of burning: the damage, and the countdown.  Returns true if
   the fire finished it, in which case the caller must stop touching it. */
function burnTick(m) {
  if (!m.burn) return false;
  /* Into the water and it is out.  Walking into a pool is the obvious
     thing to do when you are alight, and it ought to work. */
  if (inWater(m.x, m.y)) {
    m.burn = 0;
    if (canSeeMon(m)) msgFight(fightLine('', cap(monShort(m)), ' steps into the water.'),
      'c', 'out', 'c', m);
    return false;
  }
  m.burn--;
  var d = roll(BURN_DAMAGE[0], BURN_DAMAGE[1]);
  m.hp -= d;
  markHurt(m, m.x, m.y + 1);
  if (m.hp <= 0) { killMonster(m, true, d + ' burn'); return true; }
  msgFight(fightLine('', cap(monShort(m)), ' is burning.'), 'R', d + ' burn', 'R', m);
  return false;
}

/* What the rune in your right hand does to whatever you just hit.
   Returns true if the monster died here. */
function runeStrike(m) {
  var r = weaponRune();
  if (!r) return false;
  var d;
  switch (r.n) {
    case 'fire':
      if (rnd(100) < BURN_CHANCE) igniteMon(m, 'The blade sets it alight.');
      break;
    case 'ice':
      if (rnd(100) < ICE_CHANCE) freezeMon(m, 'Ice sheathes it.');
      break;
    case 'venom':
      if (rnd(100) < 35) {
        m.ar = Math.min(10, m.ar + 1);
        d = roll(1, 3); m.hp -= d;
        msgFight('Venom runs into the wound.', 'g', d + ' venom', 'g', m);
      }
      break;
    case 'leeching':
      if (P.hp < P.mhp) {
        P.hp = Math.min(P.mhp, P.hp + 1);
        msgFight('The blade drinks.', 'r', 'you heal 1', 'G', m);
      }
      break;
    case 'discord':
      if (rnd(100) < 22 && !m.disc) {
        m.disc = DISCORD_TURNS;
        msgFight('A sour note hangs in the air.', 'P', 'marked', 'P', m);
      }
      break;
    case 'quickness':
      if (rnd(100) < 20 && m.hp > 0) {
        d = damRoll([WEAPONS[P.eq.rh.k].d]) + playerDamBonus();
        if (d < 1) d = 1;
        m.hp -= d;
        msgFight('You strike again in the same breath.', 'y', d + ' damage', 'O', m);
      }
      break;
  }
  if (m.hp <= 0) { killMonster(m, true, 'slain'); return true; }
  return false;
}

function killMonster(m, byPlayer, fx, delay) {
  var i = L.mons.indexOf(m);
  if (i >= 0) L.mons.splice(i, 1);
  if (P.heldBy === m) { P.held = 0; P.heldBy = null; }
  /* it stays on screen, blinking, so you see what your arrow hit */
  L.corpses.push({
    spr: m.disguise ? 'chest' : 'mon_' + m.c, x: m.x, y: m.y,
    t: beatNow() + (delay || 0), ally: m.ally
  });
  if (byPlayer) {
    m.hp = 0;
    sound('kill');                 /* four notes over the fallen */
    msgFight(fightLine('You slay ', monShort(m), '.'), 'G', fx || 'slain', 'y', m);
    P.exp += m.xp + (m.lv > 1 ? ((m.lv - 1) * m.xp / 10) | 0 : 0);
    checkLevelUp();
  }
  if (m.gold > 0) { var g = mkItem('gold', 0); g.cnt = m.gold; dropNear(m.x, m.y, g); }
  /* A leprechaun keeps more than coin about him, and now and then the
     one ring in the game that nobody leaves lying on a floor. */
  /* He already carries something better than half the time - that is
     what makes him worth chasing - so this only adds the ring on top,
     rather than a second helping of loot. */
  /* Her spider going down is what she waits on before calling another. */
  if (m.petOf) {
    for (var wi2 = 0; wi2 < L.mons.length; wi2++)
      if (L.mons[wi2].uid === m.petOf) L.mons[wi2].spiderIn = WITCH_SPIDER_WAIT + 1;
  }
  /* And the ring off her own finger.  Like the leprechaun's, it is the
     only way that one ever turns up. */
  if (m.def.sp === 'witch' && byPlayer && rnd(100) < WITCH_RING_PCT) {
    var wi = ringIndex('the witch');
    if (wi >= 0) {
      dropNear(m.x, m.y, mkItem('ring', wi));
      msg('A ring slips from her hand.', 'P');
    }
  }
  if (m.def.sp === 'stealgold' && byPlayer && rnd(100) < LEP_RING_PCT) {
    var ri = ringIndex('the unseen');
    if (ri >= 0) {
      dropNear(m.x, m.y, mkItem('ring', ri));
      msg('Something small rolls free of his fingers.', 'P');
    }
  }
  if (m.item) dropNear(m.x, m.y, m.item);
}
function checkLevelUp() {
  while (P.lv < 21 && E_LEVELS[P.lv - 1] && P.exp >= E_LEVELS[P.lv - 1]) {
    P.lv++;
    var add = roll(1, LEVEL_HP_DIE) + LEVEL_HP_FLAT;
    P.mhp += add; P.hp += add;
    msg('Welcome to level ' + P.lv + '!', 'c');
    /* Some levels come of age.  Queue the choice rather than making it
       here: this can happen in the middle of resolving a blow, and the
       screen has to wait until the turn has finished playing out. */
    if (perkLevel(P.lv) && !G.perkPick) {
      var offer = perkOffer();
      G.perkPick = { lv: P.lv, offer: offer, i: 0, at: beatNow() + PERK_PAUSE };
    }
  }
}

/* Is the fighting over, and has the dust settled?

   A level comes of age on the blow that kills something, and the screen
   used to open on that instant - over the corpse still blinking, with
   the killing line not yet printed and whatever else was in the room
   still coming for you.  It waits now: nothing hostile in sight, and a
   moment after the last blow. */
function perkReady() {
  var job = G.perkPick;
  if (!job) return false;
  if (Date.now() < (job.at || 0)) return false;
  if (battleFoes().length) return false;
  return true;
}

/* what the choice does, whichever way it goes */
function takeLevelReward(which) {
  var job = G.perkPick;
  if (!job) return false;
  G.perkPick = null;
  if (which === 'hp' || !job.offer.length) {
    P.mhp += PERK_HP; P.hp += PERK_HP;
    msg('You are hardier for it. +' + PERK_HP + ' max hp.', 'G');
    return true;
  }
  return takePerk(which);
}
/* Which way to flinch: directly away from whatever did it.  A shot from
   an angle knocks you back on the diagonal. */
/* Which way is "away from there", as one of the eight directions, with
   a diagonal only when the angle really is diagonal. */
function shoveDir(dx, dy) {
  var ax = Math.abs(dx), ay = Math.abs(dy);
  if (!ax && !ay) return { dx: 0, dy: 1 };
  return {
    dx: (ax && ax * 2 >= ay) ? (dx > 0 ? 1 : -1) : 0,
    dy: (ay && ay * 2 >= ax) ? (dy > 0 ? 1 : -1) : 0
  };
}
/* scale damage without the rounding swallowing it */
function softenDamage(dm, mul) {
  var v = dm * mul, fl = Math.floor(v);
  if (rnd(1000) < Math.round((v - fl) * 1000)) fl++;
  return Math.max(1, fl);
}

function markHurt(ent, sx, sy) {
  if (!ent) return;
  var d = shoveDir(ent.x - sx, ent.y - sy);
  ent.hurt = { t: beatNow(), dx: d.dx, dy: d.dy };
  /* one place for the sound of a landed blow, so nothing that hurts
     anybody can forget to make a noise */
  if (ent === P || canSeeMon(ent)) sound('hurt');
}
/* The other half of a blow: whoever is swinging leans into it. */
function markLunge(ent, tx, ty) {
  if (!ent) return;
  var d = shoveDir(tx - ent.x, ty - ent.y);
  ent.lunge = { t: beatNow(), dx: d.dx, dy: d.dy };
}
function hurtAt(ent, delay, sx, sy) {
  markHurt(ent, sx, sy);
  if (delay) ent.hurt.t += delay;
}

/* ------------------------------------------------------ the health bar
   A turn is worked out in one go, so by the time the blow that took four
   points off you is drawn and heard, your health has been sitting four
   points lower for most of a second.  The number people watch is the
   meter, and it was running ahead of the fight.

   So every change to it is stamped with the moment it belongs to, and
   the meter shows the last one that has actually arrived. */
/* Hold the old reading until the blow that changed it has landed.  Each
   entry says "show this until then", so a change nobody stamped simply
   appears at once - the meter can never get stuck on a stale number. */
function holdHp(hp, mhp) {
  var at = beatNow();
  if (at <= Date.now()) return;          /* nothing to wait for */
  if (!G.hpq) G.hpq = [];
  G.hpq.push({ at: at, hp: hp, mhp: mhp });
  if (G.hpq.length > 40) G.hpq.splice(0, G.hpq.length - 40);
}
/* what the meter should read this instant */
function shownHp() {
  var q = G.hpq, now = Date.now(), i;
  if (!q || !q.length) return { hp: P.hp, mhp: P.mhp };
  for (i = 0; i < q.length; i++) if (q[i].at > now) break;
  if (i > 0) q.splice(0, i);             /* those moments have passed */
  if (!q.length) return { hp: P.hp, mhp: P.mhp };
  return { hp: q[0].hp, mhp: q[0].mhp };
}
/* bring the meter up to date at once - for a screen that must not lie */
function settleHp() { if (G.hpq) G.hpq.length = 0; }

/* Ember skin, Frostborn and Ironblood all do the same thing to a
   different sort of harm, so they are one rule applied at the one place
   every wound passes through.  Pass the kind and it is halved; pass
   nothing and it is ordinary damage that no perk touches. */
var PERK_FOR_KIND = { fire: 'ember', cold: 'frost', poison: 'ironblood' };
/* Magic of the one kind a creature cannot stand goes twice as deep.
   Ordinary steel does not: this is for wands, rings and runes. */
function elemDamage(m, dmg, kind) {
  if (!m || !m.def) return dmg;
  /* and the other way about: the one kind a creature does not feel at
     all.  A witch walks through frost. */
  if (m.def.immune && m.def.immune === kind) return 0;
  if (m.def.weak && m.def.weak === kind) return dmg * WEAKNESS_MULT;
  return dmg;
}
/* and the other way about: what your own fire and lightning do to
   something else.  Fire wielder covers everything that burns - flasks,
   wands, flame runes, dynamite and powder. */
/* how far you can pick a target: a marksman sees one square further */
function shotRange() {
  /* and a long bow carries further than a short one */
  var lw = launcher();
  var reach = (lw && WEAPONS[lw.k].reach) || 0;
  return SHOT_RANGE + reach + (hasPerk('marksman') ? PERK_SHOT_RANGE : 0);
}
function perkElemental(dm, kind) {
  if (kind === 'fire' && hasPerk('firewield')) return softenDamage(dm, PERK_ELEM_MULT);
  if (kind === 'lightning' && hasPerk('storm')) return softenDamage(dm, PERK_ELEM_MULT);
  return dm;
}
function resistPlayer(dm, kind) {
  var id = PERK_FOR_KIND[kind];
  if (!id || !hasPerk(id)) return dm;
  return softenDamage(dm, PERK_RESIST);
}
function hurtPlayer(dm, src, kind) {
  dm = resistPlayer(dm, kind);
  if (dm < 0) dm = 0;
  var was = P.hp, wasM = P.mhp;
  P.hp -= dm;
  if (P.hp <= 0) { P.hp = 0; die(src || 'something'); }
  if (dm) holdHp(was, wasM);
}
/* every other way the number moves, so healing waits its turn too */
function healPlayer(n) {
  var was = P.hp, wasM = P.mhp;
  P.hp += n;
  if (P.hp > P.mhp) P.hp = P.mhp;
  if (P.hp !== was) holdHp(was, wasM);
}
/* Death does not put the tombstone up by itself.  It stops the game and
   sets a deadline; the dungeon stays on screen until the log has said
   everything this turn had to say, and a moment longer after that. */
function die(src) {
  G.dead = 1; G.deathBy = src;
  G.mode = 'dying';
  G.deadAt = beatNow() + DEATH_PAUSE;
  sound('death');
}

/* A blow that missed you left an opening.  Riposte is the one perk you
   can watch happen, which is the point of it. */
function riposte(m) {
  if (!hasPerk('riposte')) return 0;
  if (P.scare || mdist(m) !== 1) return 0;
  if (rnd(100) >= PERK_RIPOSTE_PCT) return 0;
  var w = P.eq.rh, dice = w ? [WEAPONS[w.k].d] : [[1, 4]];
  var dm = damRoll(dice) + playerDamBonus();
  if (dm < 1) dm = 1;
  m.hp -= dm;
  m.state = 2; m.disguise = 0;
  markLunge(P, m.x, m.y);
  markHurt(m, P.x, P.y);
  if (m.hp <= 0) { killMonster(m, true, dm + ' riposte'); return 1; }
  msgFight(fightLine('You answer ', monShort(m), '.'), 'y', dm + ' riposte', 'O', m);
  return 1;
}

function monAttack(m) {
  m.runSteps = 0;                 /* it has stopped to fight */
  if (P.scare) return;
  /* Melee is strictly orthogonal and strictly adjacent.  Anything at
     range has to use breath or magic instead. */
  if (mdist(m) !== 1) return;
  var name = monShort(m);
  if (rnd(100) < dodgeChance()) {
    sound('miss');            /* a dodge is a blow that did not land */
    msgFight(fightLine('You dodge ', name, '.'), 'c', 'dodged', 'c', m);
    riposte(m);
    return;
  }
  var dice = m.def.d, hitAny = false, i;
  markLunge(m, P.x, P.y);
  if (m.def.sp === 'flame' && rnd(100) < 30 && !m.cancel) {
    var fd = roll(6, 6);
    msgFight(fightLine('', cap(name), ' breathes fire!'), 'R', fd + ' burn', 'R', m);
    breatheFire(m, fd);
    return;
  }
  for (i = 0; i < dice.length; i++) {
    if (swing(m.lv + (m.hasted ? 2 : 0), playerAC(), 0)) {
      markHurt(P, m.x, m.y);
      var dm = damRoll([dice[i]]) + (m.dmgBonus || 0) - (dazzled(m) ? DAZZLE_DAMAGE : 0);
      if (dm < 1) dm = 1;
      /* Rounding a tenth off a small die does nothing - two becomes 1.8
         becomes two again - so take the fraction as a chance instead.
         Over many bites that really is a tenth less. */
      if (m.def.dmgMul) dm = softenDamage(dm, m.def.dmgMul);
      msgFight(fightLine('', cap(name), ' hits you.'), 'R', dm + ' damage', 'R', m);
      hurtPlayer(dm, m.def.n);
      hitAny = true;
      if (G.dead) return;
    } else {
      sound('miss');
      msgFight(fightLine('', cap(name), ' misses.'), '6', 'miss', '6', m);
      riposte(m);
      if (L.mons.indexOf(m) < 0) return;      /* the counter finished it */
    }
  }
  if (m.cancel) return;
  var sp = m.def.sp;
  if (!sp) return;
  if (sp === 'rust' && hitAny) {
    var bd = P.eq.body;
    if (bd && !bd.protected && ARMORS[bd.k].n.indexOf('leather') < 0) {
      bd.ap--;
      msgFight('Your armor corrodes.', 'R', 'armor -1', 'R', m);
    }
  } else if (sp === 'freeze' && !hitAny) {
    if (!P.frozen) {
      var ice = rnd(3) + 2;
      if (hasPerk('frost')) ice = Math.max(1, ice >> 1);
      P.frozen += ice; P.iced = Math.max(P.iced || 0, ice);
      msgFight(fightLine('', cap(name), ' freezes you!'), 'c', 'frozen', 'c', m);
    }
  } else if (sp === 'stealgold') {
    if (P.gold > 0 && rnd(100) < 60) {
      var take = ((P.gold / 2) | 0) + 1;
      take = Math.min(P.gold, take);
      P.gold -= take;
      m.gold += take;
      msgFight(fightLine('', cap(name), ' robs you!'), 'y', '-' + take + ' gold', 'y', m);
      /* He does not vanish out of the world with it.  He goes invisible
         and runs for the far side of the floor, and once he has made his
         stand there he cannot hide again - so the purse is recoverable. */
      if (m.spent) { m.state = 2; m.flee = FLEE_TURNS; }
      else startBolt(m);
    }
  } else if (sp === 'stealitem') {
    var cand = [];
    for (i = 0; i < N_SLOTS; i++) if (P.slots[i] && P.slots[i].t !== 'amulet') cand.push(P.slots[i]);
    if (cand.length && rnd(100) < 55) {
      var it = pick(cand);
      msgFight('She steals your things!', 'P', 'item gone', 'P', m);
      msg('You lost ' + itemName(it) + '.', 'P');
      removeItem(it, it.cnt);
      killMonster(m, false);
    }
  } else if (sp === 'weaken' && hitAny) {
    if (!hasProp('sustain strength') && !hasPerk('ironblood') && rnd(100) < 40) {
      P.str--;
      msgFight('The venom burns.', 'R', '-1 Str', 'R', m);
    }
  } else if (sp === 'drainexp' && hitAny) {
    if (rnd(100) < 15) {
      if (P.lv <= 1) { P.exp = 0; msgFight('Your life force ebbs.', 'P', 'exp drain', 'P', m); }
      else {
        P.lv--; P.exp = E_LEVELS[P.lv - 2] || 0;
        P.mhp = Math.max(1, P.mhp - roll(1, 10)); P.hp = Math.min(P.hp, P.mhp);
        msgFight('Your life force ebbs.', 'P', '-1 level', 'P', m);
      }
    }
  } else if (sp === 'drainmax' && hitAny) {
    if (rnd(100) < 30) {
      P.mhp = Math.max(1, P.mhp - 1); P.hp = Math.min(P.hp, P.mhp);
      msgFight(fightLine('', cap(name), ' drinks deep.'), 'R', '-1 max Hp', 'R', m);
    }
  } else if (sp === 'confuse' && hitAny) {
    if (rnd(100) < 40 && !P.blind) {
      P.conf += rnd(8) + 8;
      msgFight('That gaze! You reel.', 'P', 'confused', 'P', m);
    }
  } else if (sp === 'hold' && hitAny) {
    P.held = 1; P.heldBy = m;
    msgFight(fightLine('', cap(name), ' grips you.'), 'R', 'held fast', 'R', m);
  }
  /* whatever laid a hand on you pays for it */
  if (hitAny && L.mons.indexOf(m) >= 0) retaliate(m);
}

/* The enchantment on what you are wearing answers back. */
/* ------------------------------------------------------ Thunder Charge
   The armour holds the shock of a blow and lets go on every third one.
   It earths through the squares around you - and if you are standing in
   water, through the whole pool, because water carries it.  Only the
   pool you are actually in: a second puddle across the room is not
   joined to this one, so nothing reaches it. */
function thunderCells() {
  var cells = [], seen = {}, d;
  function add(x, y) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
    var k = y * MAP_W + x;
    if (seen[k]) return;
    seen[k] = 1; cells.push([x, y]);
  }
  for (d = 0; d < 8; d++) add(P.x + DIR8[d][0], P.y + DIR8[d][1]);
  if (tileAt(P.x, P.y) === WATER) {
    var body = waterBody(P.x, P.y);
    for (d = 0; d < body.length; d++)
      if (tileAt(body[d][0], body[d][1]) === WATER)
        add(body[d][0], body[d][1]);
    add(P.x, P.y);
  }
  return cells;
}
function thunderDischarge(gear) {
  var cells = thunderCells(), i, hit = 0;
  var wet = tileAt(P.x, P.y) === WATER;
  G.splash = { cells: cells, t: beatNow(), kind: 'zap' };
  sound('lightning');
  for (i = 0; i < cells.length; i++) {
    var m2 = monAt(L, cells[i][0], cells[i][1]);
    if (!m2) continue;
    var dm = perkElemental(roll(THUNDER_DAMAGE[0], THUNDER_DAMAGE[1]), 'lightning');
    m2.hp -= dm; m2.state = 2; m2.disguise = 0;
    markHurt(m2, P.x, P.y);
    hit++;
    if (m2.hp <= 0) killMonster(m2, true, dm + ' shocked');
    else msgFight(fightLine('', cap(monShort(m2)), ' is jolted.'), 'c', dm + ' shock', 'c', m2);
  }
  if (gear) gear.known = 1;
  msgTrap(wet ? 'The water crackles with current!' : 'Your gear discharges!',
    'c', hit ? hit + ' caught' : 'nothing near', hit ? 'c' : '6');
  return hit;
}

/* Drive something back a square.  It only works if there is somewhere to
   drive it to - shoved into a wall it just thumps against it, which is
   fair enough and needs no message of its own. */
function knockBack(m, fromx, fromy) {
  var d = shoveDir(m.x - fromx, m.y - fromy);
  var nx = m.x + d.dx, ny = m.y + d.dy;
  if (!d.dx && !d.dy) return 0;
  if (!walkable(nx, ny) || monAt(L, nx, ny)) return 0;
  if (nx === P.x && ny === P.y) return 0;
  if (!m.anim) m.anim = [];
  /* the fifth number is when it starts, the sixth how long it takes:
     a hurried step is over in half the time */
  m.anim.push([m.x, m.y, nx, ny, beatNow(),
               m.quickStep ? Math.round(MOVE_ANIM_MS * EXTRA_STEP) : MOVE_ANIM_MS]);
  m.x = nx; m.y = ny;
  m.held = 0;
  if (P.heldBy === m) { P.held = 0; P.heldBy = null; }
  var ktr = trapAt(nx, ny);
  if (ktr) monTrap(m, ktr);
  return 1;
}

/* and the same for you, when something wearing knockback hits you */
function knockPlayer(fromx, fromy) {
  var d = shoveDir(P.x - fromx, P.y - fromy);
  var nx = P.x + d.dx, ny = P.y + d.dy;
  if (!d.dx && !d.dy) return 0;
  if (!walkable(nx, ny) || monAt(L, nx, ny)) return 0;
  P.x = nx; P.y = ny;
  P.walkT = Date.now();
  P.held = 0; P.heldBy = null;
  computeVis();
  return 1;
}

function retaliate(m) {
  var th;
  /* it counts the blows the armour takes, not the ones you land */
  var tc = hasRune('thunder');
  if (tc) {
    tc.jolt = (tc.jolt || 0) + 1;
    if (tc.jolt >= THUNDER_EVERY) { tc.jolt = 0; thunderDischarge(tc); }
    if (L.mons.indexOf(m) < 0) return;      /* the jolt finished it */
  }
  var kb = hasGearRune('knockback');
  if (kb && rnd(100) < KNOCKBACK_ARMOR_PCT) {
    kb.known = 1;
    if (knockBack(m, P.x, P.y))
      msgFight('Your gear throws it off.', 'c', 'knocked back', 'c', m);
  }
  if (L.mons.indexOf(m) < 0) return;
  if (hasRune('thorns')) {
    th = roll(1, 3); m.hp -= th;
    if (m.hp <= 0) { killMonster(m, true, 'slain'); return; }
    msgFight('Your gear bristles.', 'c', th + ' thorns', 'c', m);
  }
  if (hasRune('blight')) {
    th = roll(1, 4); m.hp -= th;
    m.ar = Math.min(10, m.ar + 1);          /* the poison slackens it */
    if (m.hp <= 0) { killMonster(m, true, 'slain'); return; }
    msgFight('Poison weeps from your gear.', 'g', th + ' venom', 'g', m);
  }
  if (hasRune('rime')) {
    th = roll(1, 3); m.hp -= th;
    if (m.hp <= 0) { killMonster(m, true, 'slain'); return; }
    if (rnd(100) < 35) {
      m.stuck += 1 + rnd(2);
      msgFight('Rime spreads over it.', 'c', th + ', frozen', 'c', m);
    } else msgFight('Cold burns your attacker.', 'c', th + ' cold', 'c', m);
  }
}

/* Everything that has noticed you and is close enough to see: the ones
   you are actually fighting, nearest first. */
function battleFoes() {
  var out = [], i;
  for (i = 0; i < L.mons.length; i++) {
    var m = L.mons[i];
    if (m.ally || m.state !== 2) continue;
    if (!canSeeMon(m)) continue;
    out.push(m);
  }
  out.sort(function (a, b) { return mdist(a) - mdist(b); });
  return out.slice(0, BATTLE_MAX);
}

/* ---------------------------------------------------------- monster turn */
/* Where this creature stands at the end of its turn, and whether it can
   see you from there.

   This used to be worked out at the START of a creature's turn, which
   is a turn too early: something that walks round a corner or steps
   into a doorway has just laid eyes on you, but the check had already
   run from the square it was standing on before it moved.  So it
   arrived in the doorway not yet caught out, you hit it with no bonus,
   and only on its next turn did the game notice - by which time it was
   awake and swinging.  Now it is settled once, after the creature has
   finished moving, so stepping into view is what catches it out. */
function noteSight(m) {
  if (!m || m.ally || L.mons.indexOf(m) < 0) return;
  if (m.state < 2) return;
  if (monSeesPlayer(m) || mdist(m) <= 1) {
    /* Two whole rounds without a glimpse of you, and stepping back into
       view catches it out.  One round is just you rounding a pillar. */
    if (m.blindTo >= SURPRISE_AFTER) m.surprised = 1;
    m.blindTo = 0;
    /* where you were last seen, and which way you were going */
    m.mark = { x: P.x, y: P.y,
               dx: m.mark ? Math.sign(P.x - m.mark.x) : 0,
               dy: m.mark ? Math.sign(P.y - m.mark.y) : 0 };
  } else {
    m.blindTo = (m.blindTo || 0) + 1;       /* another round without you */
  }
}

function monstersMove() {
  var list = L.mons.slice(), q;
  for (q = 0; q < list.length; q++) { list[q].anim = null; list[q].animT = 0; }

  for (var i = 0; i < list.length; i++) {
    var m = list[i];
    if (L.mons.indexOf(m) < 0) continue;
    if (m.blind > 0) m.blind--;
    /* fire first: a frozen thing still burns, and burning can finish it
       before it gets a step */
    if (m.burn > 0 && burnTick(m)) continue;
    if (L.mons.indexOf(m) < 0) continue;
    /* A turn it loses is still a turn it did not see you.  Frozen,
       slowed, dazzled or thigh deep in water, it takes no step - but
       the rounds it has gone without a glimpse of you have to keep
       counting, or ducking out of sight of something standing in a
       stream never adds up to the two rounds that catch it out. */
    if ((m.slowed || dazzled(m)) && (G.turn & 1)) { noteSight(m); continue; }
    if (m.stuck > 0) { m.stuck--; if (m.webbed > 0) m.webbed--; noteSight(m); continue; }
    /* thigh deep in water: this step goes on getting through it */
    if (monWades(m)) { noteSight(m); continue; }

    /* Each creature gets its own moment.  Something you never see does
       not need one - waiting on it would just feel like lag - but one
       that walks into view during its move very much does. */
    /* Whatever has just hurt it is seen to hurt it before it does
       anything about it.  A creature alight takes its burn at the top of
       its own turn, and a creature caught by another one is hurt in the
       middle of the same phase - both used to wince and step in the very
       same instant, so the wince was never seen at all.  The flinch plays
       out, then a moment, and then it moves. */
    var watched = canSeeMon(m);
    if (m.hurt && watched) {
      var settle = m.hurt.t + HURT_MS + HURT_HOLD - beatNow();
      if (settle > 0) beatWait(settle);
    }
    monOneMove(m);
    if (G.dead) return;
    watched = watched || canSeeMon(m);

    if ((m.hasted || (m.def.fly && rnd(100) < 35)) && L.mons.indexOf(m) >= 0) {
      /* A second step is a second thing to see, but it is not worth as
         much of the turn as the first: something quick enough to move
         twice should look quick.  Everything after the first step is
         taken at half the pace - half the pause before it, and half the
         time crossing the square - so two steps read as one hurried
         creature rather than as two ordinary ones. */
      if (watched) beatWait(Math.round(BEAT_STEP * EXTRA_STEP));
      m.quickStep = 1;
      monOneMove(m);
      m.quickStep = 0;
      if (G.dead) return;
      watched = watched || canSeeMon(m);
    }
    noteSight(m);
    if (watched) beatWait(BEAT_ACT);
  }
}

function mdist(m) { return Math.abs(m.x - P.x) + Math.abs(m.y - P.y); }

/* can this monster make out the player from where it stands? */
function monSeesPlayer(m) {
  var d = mdist(m);
  if (m.blind > 0) return false;          /* a faceful of dark */
  /* The dark is the dark for everything down there.  A bat hunts by ear
     and a vampire was born in it; the rest are as blind as you are. */
  if (!m.def.dark && (darkAt(m.x, m.y) || darkAt(P.x, P.y)) && d > DARK_RADIUS)
    return false;
  /* Nine squares in the dark of the dungeon - but a lit room is lit end
     to end, and you can be seen across the whole of one.  The player's
     own sight works that way, and sight has to read the same from both
     ends or you can watch something that cannot watch you. */
  if (d > 9) {
    var mr = roomIndexAt(m.x, m.y);
    var lit = mr >= 0 && L.rooms[mr] && L.rooms[mr].lit && !L.rooms[mr].dark;
    if (!lit || roomIndexAt(P.x, P.y) !== mr) return false;
  }
  if (P.blind) { /* being blind does not hide you */ }
  /* Out of sight is out of sight - unless the thing looking at you sees
     invisible things itself. */
  if (P.unseen > 0 && !m.def.seeinv) return false;
  return sightClear(m.x, m.y, P.x, P.y);
}
/* roll for the monster spotting or hearing you this turn */
function monNotices(m) {
  if (P.aggravate) return true;
  var d = mdist(m), base;
  if (P.unseen > 0 && !m.def.seeinv) return rnd(100) < (d <= 1 ? 12 : 3);
  if (d <= 1) base = 92;
  else if (monSeesPlayer(m)) base = 62 - d * 5;
  else base = 14 - d * 2;                       /* heard through the stone */
  if (m.state === 0) base -= 22;                /* fast asleep */
  if (m.def.mean) base += 8;
  base -= stealthScore();
  if (base < 2) base = 2;
  return rnd(100) < base;
}
function alert(m) {
  m.state = 2; m.surprised = 1; m.lost = 0;
  if (canSeeMon(m)) msg(cap(monName(m)) + ' spots you!', 'O');
}

/* one monster laying into another - summoned help, mostly */
function monVsMon(a, d) {
  var seen = canSeeMon(a) || canSeeMon(d);
  var dice = a.def.d.length ? a.def.d : [[1, 4]];
  markLunge(a, d.x, d.y);
  if (swing(a.lv, d.ar, 0, HIT_BASE_PLAYER)) {
    markHurt(d, a.x, a.y);
    var dm = damRoll([dice[0]]);
    d.hp -= dm;
    d.state = 2;
    if (d.hp <= 0) {
      if (seen) msgFight(fightLine('', cap(monShort(a)), ' fells ' + monShort(d) + '.'),
        'G', dm + ' damage', 'y', d);
      killMonster(d, false);
    } else if (seen) {
      msgFight(fightLine('', cap(monShort(a)), ' strikes ' + monShort(d) + '.'),
        'c', dm + ' damage', 'O', d);
    }
  } else if (seen) {
    if (seen) sound('miss');
    msgFight(fightLine('', cap(monShort(a)), ' misses ' + monShort(d) + '.'), '6', 'miss', '6', d);
  }
}
/* Who counts as an enemy.  A creature under the mark of discord is
   everyone's enemy, including its own kind. */
function hostileTo(a, b) {
  if (!a || !b || a === b) return false;
  if (a.disc > 0 || b.disc > 0) return true;
  return a.ally !== b.ally;
}
/* the nearest marked creature worth turning on */
function discordTarget(m) {
  if (m.disc > 0) return null;
  var best = null, bd = 99;
  for (var i = 0; i < L.mons.length; i++) {
    var o = L.mons[i];
    if (o === m || !(o.disc > 0)) continue;
    var d = Math.abs(o.x - m.x) + Math.abs(o.y - m.y);
    if (d < bd) { bd = d; best = o; }
  }
  return bd <= DISCORD_RANGE ? best : null;
}
/* Whatever is charging you, nearest to your creature first.  It has to
   be awake and hunting, and it has to be near enough to you to be your
   problem - otherwise your spider is off across the floor and you are
   standing on your own. */
function chargingFoe(m) {
  var best = null, bd = 99, i;
  for (i = 0; i < L.mons.length; i++) {
    var o = L.mons[i];
    if (o === m || !hostileTo(m, o)) continue;
    if (o.state !== 2) continue;                       /* not coming for anybody */
    if (Math.max(Math.abs(o.x - P.x), Math.abs(o.y - P.y)) > ALLY_GUARD) continue;
    var d = Math.max(Math.abs(o.x - m.x), Math.abs(o.y - m.y));
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
function nearestFoe(m) {
  var best = null, bd = 99;
  for (var i = 0; i < L.mons.length; i++) {
    var o = L.mons[i];
    if (o === m || !hostileTo(m, o)) continue;
    var d = Math.abs(o.x - m.x) + Math.abs(o.y - m.y);
    if (d < bd) { bd = d; best = o; }
  }
  return bd <= 14 ? best : null;
}
function adjacentFoe(m) {
  for (var i = 0; i < 4; i++) {
    var o = monAt(L, m.x + DIR4[i][0], m.y + DIR4[i][1]);
    if (o && hostileTo(m, o)) return o;
  }
  return null;
}
/* walk one square towards something, orthogonally */
function stepToward(m, tx, ty) {
  var dx = Math.sign(tx - m.x), dy = Math.sign(ty - m.y), opts = [];
  if (Math.abs(tx - m.x) >= Math.abs(ty - m.y)) {
    if (dx) opts.push([dx, 0]); if (dy) opts.push([0, dy]);
  } else {
    if (dy) opts.push([0, dy]); if (dx) opts.push([dx, 0]);
  }
  for (var j = 0; j < opts.length; j++) if (tryMonStep(m, opts[j][0], opts[j][1])) return true;
  return false;
}
/* a summoned creature: hunt whatever is hostile, else stay near you */
function allyMove(m) {
  if (--m.life <= 0) {
    if (canSeeMon(m)) msg('The ' + m.def.n + ' fades back into the air.', 'P');
    var i = L.mons.indexOf(m); if (i >= 0) L.mons.splice(i, 1);
    return;
  }
  var foe = adjacentFoe(m);
  if (foe) { monVsMon(m, foe); return; }
  /* It is yours, not a hunter of its own.  It goes for whatever is
     actually coming at you - nearest to itself first - and when nothing
     is, it walks at your heel.

     Going for the nearest hostile of any kind meant going for anything
     at all: a thing asleep in the next room three squares nearer than
     you was reason enough to wander off, and it never came back. */
  foe = chargingFoe(m);
  var tx, ty;
  if (foe) { tx = foe.x; ty = foe.y; }
  else {
    if (Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y)) <= ALLY_HEEL) return;
    tx = P.x; ty = P.y;
  }
  var dx = Math.sign(tx - m.x), dy = Math.sign(ty - m.y);
  var opts = [];
  if (Math.abs(tx - m.x) >= Math.abs(ty - m.y)) {
    if (dx) opts.push([dx, 0]); if (dy) opts.push([0, dy]);
  } else {
    if (dy) opts.push([0, dy]); if (dx) opts.push([dx, 0]);
  }
  for (var j = 0; j < opts.length; j++) if (tryMonStep(m, opts[j][0], opts[j][1])) return;
  randStep(m);
}

/* Breath and spells carry across the room, at any angle, so long as the
   line is clear.  Teeth do not. */
/* ---------------------------------------------------------------- web
   A patch of web on the floor holds the first thing that steps into it
   and comes away with it.  It does not care whose side anybody is on. */
function webAt(x, y) {
  return !!(L.webs && L.webs[y * MAP_W + x]);
}
function layWeb(x, y, at) {
  if (!walkable(x, y)) return 0;
  if (L.decor[y * MAP_W + x] && L.decor[y * MAP_W + x] !== 'web') return 0;
  if (!L.webs) L.webs = {};
  var k = y * MAP_W + x;
  if (L.webs[k]) { L.webs[k] = WEB_LIFE; return 0; }
  L.webs[k] = WEB_LIFE;
  L.decor[k] = 'web';
  /* and the moment it is there to see.  A creature's turn is worked out
     in one go and played back afterwards, so web still in the air must
     not already be lying on the floor. */
  if (at) { L.showAt = L.showAt || {}; L.showAt[k] = at; }
  return 1;
}
function clearWeb(x, y) {
  var k = y * MAP_W + x;
  if (!L.webs || !L.webs[k]) return;
  delete L.webs[k];
  if (L.decor[k] === 'web') delete L.decor[k];
}
/* Somebody has walked into one.  Returns true if they are stuck. */
function webCatches(x, y) {
  if (!webAt(x, y)) return false;
  clearWeb(x, y);
  return true;
}
/* the webs on the floor grow old and rot away */
function ageWebs() {
  if (!L.webs) return;
  for (var k in L.webs) {
    if (--L.webs[k] > 0) continue;
    var x = (k | 0) % MAP_W, y = ((k | 0) / MAP_W) | 0;
    clearWeb(x, y);
  }
}

/* A web spinner does not close with you.  It spits, every other turn,
   and what misses lands on the floor and waits. */
function monWeb(m) {
  if (m.cancel || m.def.sp !== 'web') return false;
  if (m.cast > 0) { m.cast--; return false; }
  var d = Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y));
  if (d < 2 || d > WEB_RANGE) return false;
  if (!shotClear(m.x, m.y, P.x, P.y)) return false;
  /* Counted down at the start of each turn, so the wait is one shorter
     than the gap: setting it to the gap itself put three turns between
     shots when two were wanted. */
  m.cast = WEB_EVERY - 1;
  /* Wait first, then start the flight from that moment: timed from now
     it is over before the frame is drawn, which reads as the web landing
     on you in the same instant the creature spat it. */
  var wfly = 170;
  beatWait(wfly);
  G.shot = { sx: m.x, sy: m.y, ex: P.x, ey: P.y, t: beatNow() - wfly, dur: wfly,
             col: '#c3ccd9' };
  /* At you, unless it would rather put one across the ground between
     you - which is what makes it worth watching where you tread. */
  var atGround = rnd(100) < 30;
  if (!atGround && swing(m.lv + 2, playerAC(), 0)) {
    var hold = WEB_HOLD_MIN + rnd(WEB_HOLD_MAX - WEB_HOLD_MIN + 1);
    P.frozen += hold; P.webbed = Math.max(P.webbed || 0, hold);
    msgFight(fightLine('', cap(monShort(m)), ' spits web over you.'),
      'c', 'stuck ' + hold, 'O', m);
    sound('miss');
    return true;
  }
  /* it lands short, or on purpose, and sticks to the floor */
  var laid = 0, step;
  var dx = Math.sign(P.x - m.x), dy = Math.sign(P.y - m.y);
  for (step = 1; step <= 2; step++) {
    var wx = P.x - dx * (step - 1), wy = P.y - dy * (step - 1);
    laid += layWeb(wx, wy, beatNow());
  }
  if (laid) msgFight(fightLine('', cap(monShort(m)), ' webs the floor.'),
    'c', laid + ' web', 'c', m);
  else msgFight(fightLine('', cap(monShort(m)), ' spits and misses.'), '6', 'miss', '6', m);
  return true;
}

/* A half dragon spits fire from across the room, but not with its feet
   in water and not with a flask of it running off its back. */
function monFireball(m) {
  if (m.cancel || m.def.sp !== 'fireball') return false;
  if (m.cast > 0) { m.cast--; return false; }
  if (m.doused > 0) {
    m.doused--;
    if (m.doused === 0 && canSeeMon(m)) msg(cap(monShort(m)) + ' steams dry.', '6');
    return false;
  }
  if (isWater(m.x, m.y)) return false;         /* standing in the stuff */
  var d = Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y));
  if (d < 2 || d > FIREBALL_RANGE) return false;
  if (!shotClear(m.x, m.y, P.x, P.y)) return false;
  m.cast = FIREBALL_EVERY - 1;
  var fd = perkElemental(roll(FIREBALL_DAMAGE[0], FIREBALL_DAMAGE[1]), 'fire');
  msgFight(fightLine('', cap(monShort(m)), ' spits fire!'), 'R', fd + ' burn', 'R', m);
  throwFireball(m, fd);
  return true;
}
/* ------------------------------------------------------------ the witch
   Everything she does, she does from across the room, and she has an
   order of preference: get out of reach first, then put something between
   you and her, then poison, then a stone.  She never closes and never
   swings. */
/* Going somewhere else without walking there.  The model moves it at
   once; this is the part you watch.  It shakes where it stood, goes in a
   flash, and comes back in another one - and the whole thing takes real
   time, so the turn waits for it. */
function warpAway(who, fx, fy) {
  who.warp = { fx: fx, fy: fy, t: beatNow() };
  who.anim = null;
  beatWait(WARP_SHAKE + WARP_FLASH);
  sound('magic');
}

function witchSpider(m) {
  var i;
  for (i = 0; i < L.mons.length; i++)
    if (L.mons[i].petOf && L.mons[i].petOf === m.uid) return L.mons[i];
  return null;
}
/* Somewhere in her own room she can stand, as far from you as she can
   get.  A witch does not leave the room she is in - being chased out of
   it would only put her in a corridor with you. */
function witchBlink(m) {
  if (m.blinkIn > 0) return false;
  /* Not with you standing over her.  Closing the last square is what
     stops her slipping away, and it is the whole reason for closing. */
  if (mdist(m) <= 1) return false;
  if (mdist(m) > WITCH_KEEP) return false;
  var ri = roomIndexAt(m.x, m.y);
  if (ri < 0) return false;
  var r = L.rooms[ri], best = null, bestD = mdist(m), i;
  for (i = 0; i < r.floors.length; i++) {
    var x = r.floors[i][0], y = r.floors[i][1];
    if (!walkable(x, y) || monAt(L, x, y)) continue;
    if (x === P.x && y === P.y) continue;
    if (barrelAt(x, y)) continue;
    var d = Math.max(Math.abs(x - P.x), Math.abs(y - P.y));
    if (d <= bestD) continue;
    best = [x, y]; bestD = d;
  }
  if (!best) return false;
  m.blinkIn = WITCH_BLINK_EVERY;
  /* It does not always come off.  When it fails she goes nowhere at all -
     which is to say she arrives on the square she left, so the whole
     thing still plays out and you can see it not work. */
  var failed = rnd(100) < WITCH_BLINK_FAIL;
  if (failed) best = [m.x, m.y];
  var seen = canSeeMon(m);
  warpAway(m, m.x, m.y);
  m.x = best[0]; m.y = best[1];
  if (seen || canSeeMon(m))
    msgFight(fightLine('', cap(monShort(m)), failed ? ' snatches at the air.' : ' steps sideways.'),
      'P', failed ? 'held' : 'gone', 'P', m);
  computeVis();
  return true;
}
/* A spider of her own, called up somewhere between the two of you.  Only
   ever one, and not for a turn or two after the last one died. */
function witchSummon(m) {
  if (m.spiderIn > 0) return false;
  if (witchSpider(m)) return false;
  if (mdist(m) > WITCH_SPIDER_RANGE * 2) return false;
  var spots = [], dx, dy;
  for (dy = -WITCH_SPIDER_RANGE; dy <= WITCH_SPIDER_RANGE; dy++)
    for (dx = -WITCH_SPIDER_RANGE; dx <= WITCH_SPIDER_RANGE; dx++) {
      var x = m.x + dx, y = m.y + dy;
      if (!walkable(x, y) || monAt(L, x, y) || barrelAt(x, y)) continue;
      if (x === P.x && y === P.y) continue;
      if (!losClear(m.x, m.y, x, y)) continue;
      spots.push([x, y]);
    }
  if (!spots.length) return false;
  /* the one nearest you, so it is worth calling at all */
  spots.sort(function (a, b) {
    return (Math.abs(a[0] - P.x) + Math.abs(a[1] - P.y)) -
           (Math.abs(b[0] - P.x) + Math.abs(b[1] - P.y));
  });
  var at = spots[0];
  /* You see her throw it: something crosses the room, and the spider is
     there when it arrives - not before it leaves her hand. */
  G.shot = { sx: m.x, sy: m.y, ex: at[0], ey: at[1], t: beatNow(), dur: BEAT_STEP,
             spr: 'magic' };
  beatWait(BEAT_STEP);
  var s = mkMonster('E', G.depth, at[0], at[1]);
  s.state = 2; s.petOf = m.uid;
  /* conjured, not found: it carries nothing to be farmed for */
  s.item = null; s.gold = 0;
  s.showAt = beatNow();
  s.warp = { fx: at[0], fy: at[1], t: beatNow() - WARP_SHAKE };
  L.mons.push(s);
  beatWait(WARP_FLASH);
  sound('magic');
  if (canSeeMon(m) || canSeeMon(s))
    msgFight(fightLine('', cap(monShort(m)), ' calls up a spider.'), 'P', 'spider', 'P', m);
  computeVis();
  return true;
}
/* A flask of poison, thrown to burst where you stand. */
function witchFlask(m) {
  if (m.flasks <= 0) return false;
  if (m.flaskIn > 0) return false;
  var d = mdist(m);
  if (d < 2 || d > WITCH_FLASK_RANGE) return false;
  if (!shotClear(m.x, m.y, P.x, P.y)) return false;
  /* Not where her own spider would be standing in it.  The gas does not
     care whose side anything is on and it hangs about for turns, so she
     picks where to burst it: on you if that is clear, and otherwise
     beside you - behind, in front, either flank - taking whichever puts
     the most floor between her spider and the cloud.  She knows it
     spreads, so a square beside you still catches you. */
  var pet = witchSpider(m);
  var spots = [[P.x, P.y]], i;
  for (i = 0; i < DIR4.length; i++) spots.push([P.x + DIR4[i][0], P.y + DIR4[i][1]]);
  var aim = null, room = -1;
  for (i = 0; i < spots.length; i++) {
    var sx = spots[i][0], sy = spots[i][1];
    if (!walkable(sx, sy)) continue;
    if (!shotClear(m.x, m.y, sx, sy)) continue;
    var clear = pet ? Math.max(Math.abs(pet.x - sx), Math.abs(pet.y - sy)) : 99;
    /* As much floor between the burst and her spider as she can manage.
       A cloud reaches one square almost always and two more often than
       not, so this is aiming rather than a guarantee - which is what she
       can actually do about it. */
    if (clear < WITCH_FLASK_CLEAR) continue;
    /* the furthest from her spider, and of those the nearest to you */
    var near = Math.max(Math.abs(sx - P.x), Math.abs(sy - P.y));
    var score = clear * 10 - near;
    if (score > room) { room = score; aim = [sx, sy]; }
  }
  if (!aim) return false;
  m.flasks--;
  m.flaskIn = WITCH_FLASK_EVERY;
  beatWait(BEAT_STEP);
  G.shot = { sx: m.x, sy: m.y, ex: aim[0], ey: aim[1], t: beatNow(), dur: BEAT_STEP,
             spr: 'pot_g' };
  beatWait(BEAT_STEP);
  sound('magic');
  msgFight(fightLine('', cap(monShort(m)), ' throws a flask.'), 'g', 'poison', 'g', m);
  spawnCloud(aim[0], aim[1], 'poison', GAS_TURNS_MIN + rnd(GAS_TURNS_MAX - GAS_TURNS_MIN + 1),
    beatNow());
  computeVis();
  return true;
}
/* and a stone, when there is nothing better left */
function witchRock(m) {
  var d = mdist(m);
  if (d < 2 || d > WITCH_ROCK_RANGE) return false;
  if (!shotClear(m.x, m.y, P.x, P.y)) return false;
  if (rnd(100) >= 55) return false;
  beatWait(BEAT_STEP);
  G.shot = { sx: m.x, sy: m.y, ex: P.x, ey: P.y, t: beatNow(), dur: BEAT_STEP,
             spr: 'stone' };
  beatWait(BEAT_STEP);
  sound('miss');
  if (!swing(m.lv, playerAC(), 0)) {
    msgFight(fightLine('', cap(monShort(m)), ' throws a stone and misses.'), '6', 'miss', '6', m);
    return true;
  }
  /* Struck, and it shows: the same flinch and the same red as a blow
     from something standing next to you.  Without it the stone simply
     arrived and vanished, which read as passing straight through. */
  var rd = roll(WITCH_ROCK_DAMAGE[0], WITCH_ROCK_DAMAGE[1]);
  markHurt(P, m.x, m.y);
  msgFight(fightLine('', cap(monShort(m)), ' throws a stone.'), 'O', rd + ' damage', 'O', m);
  hurtPlayer(rd, m.def.n);
  return true;
}
function monWitch(m) {
  if (m.def.sp !== 'witch') return false;
  if (m.blinkIn > 0) m.blinkIn--;
  if (m.spiderIn > 0) m.spiderIn--;
  if (m.flaskIn > 0) m.flaskIn--;
  if (m.cancel) return false;
  if (!monSeesPlayer(m)) return false;
  if (witchBlink(m)) return true;
  /* The flask before the spider.  She will not throw poison over her own
     spider, and her spider spends its life next to you - so called up
     first it corks the flasks for the rest of the fight. */
  if (witchFlask(m)) return true;
  if (witchSummon(m)) return true;
  if (witchRock(m)) return true;
  return false;
}

function monRanged(m) {
  /* Caught flat footed is caught flat footed: a half dragon that has
     just been surprised does not calmly line up a fireball. */
  if (m.surprised) return false;
  if (monWitch(m)) return true;
  if (monWeb(m)) return true;
  if (monFireball(m)) return true;
  if (m.cancel || m.def.sp !== 'flame') return false;
  var d = Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y));
  if (d < 2 || d > RANGED_BREATH_RANGE) return false;
  if (!shotClear(m.x, m.y, P.x, P.y)) return false;
  if (rnd(100) >= 28) return false;
  var fd = roll(6, 6);
  msgFight(fightLine('', cap(monShort(m)), ' breathes fire!'), 'R', fd + ' burn', 'R', m);
  breatheFire(m, fd);
  return true;
}

/* ------------------------------------------------------- making off
   A thief with your gold does not fight and does not follow you.  He
   goes invisible and makes for the room furthest from where he robbed
   you - and when he gets there he stops, gives up hiding, and stays.

   He does not wander the floor for ever and he cannot vanish twice: run
   him down and the purse is yours again, with whatever else is on him. */
function startBolt(m) {
  m.invis = 1;
  m.bolted = 1;
  m.state = 2;
  m.disguise = 0;
  m.holed = 0;
  m.goal = farthestRoom(P.x, P.y, m);
  m.ran = 0;
  if (canSeeMon(m)) msg(cap(monShort(m)) + ' bolts for the dark!', 'y');
  else msg('He is gone before you can look at him.', 'y');
}

/* the room centre furthest from here, by walking distance rather than as
   the crow flies - the long way round is what makes it far */
function farthestRoom(fx, fy, m) {
  var seen = reachCopy(L, fx, fy, true);
  var dist = {}, q = [fy * MAP_W + fx], head = 0, best = null, bestD = -1;
  dist[q[0]] = 0;
  while (head < q.length) {
    var c = q[head++], cx = c % MAP_W, cy = (c / MAP_W) | 0;
    for (var d = 0; d < 4; d++) {
      var nx = cx + DIR4[d][0], ny = cy + DIR4[d][1];
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      var n = ny * MAP_W + nx;
      if (dist[n] !== undefined || !walkable(nx, ny)) continue;
      dist[n] = dist[c] + 1;
      q.push(n);
    }
  }
  for (var i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || r.sealed) continue;
    var k = r.cy * MAP_W + r.cx;
    if (!seen[k] || dist[k] === undefined) continue;
    if (dist[k] > bestD) { bestD = dist[k]; best = { room: i, x: r.cx, y: r.cy }; }
  }
  return best;
}

/* Breadth first out from where he is going, so the first square beside
   him that the wave reaches is the way he should step. */
function boltStep(m, gx, gy) {
  var dist = {}, q = [[gx, gy]], head = 0;
  dist[gy * MAP_W + gx] = 0;
  while (head < q.length) {
    var c = q[head++], cd = dist[c[1] * MAP_W + c[0]];
    if (cd > 90) break;
    for (var d = 0; d < 4; d++) {
      var nx = c[0] + DIR4[d][0], ny = c[1] + DIR4[d][1];
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      var k = ny * MAP_W + nx;
      if (dist[k] !== undefined || !walkable(nx, ny)) continue;
      dist[k] = cd + 1;
      q.push([nx, ny]);
    }
  }
  var best = null, bd = 1e9;
  for (var d2 = 0; d2 < 4; d2++) {
    var ax = m.x + DIR4[d2][0], ay = m.y + DIR4[d2][1], kk = ay * MAP_W + ax;
    if (dist[kk] === undefined) continue;
    if (monAt(L, ax, ay)) continue;
    if (ax === P.x && ay === P.y) continue;      /* he will not barge past you */
    if (dist[kk] < bd) { bd = dist[kk]; best = DIR4[d2]; }
  }
  return best;
}

/* He has arrived, or he can get no further.  Either way this is where he
   stays, and he never hides again. */
function boltHoleUp(m, arrived) {
  m.bolted = 0;
  m.holed = 1;
  m.invis = 0;
  m.spent = 1;                       /* no second vanishing */
  m.state = 1;
  m.flee = 0;
  giveBeat(m);
  if (canSeeMon(m))
    msg(cap(monShort(m)) + (arrived ? ' turns at bay.' : ' has nowhere left to run.'), 'y');
}

function boltMove(m) {
  if (m.holed) return;
  if (!m.goal) { boltHoleUp(m, false); return; }
  /* He is running, not migrating.  If the far room will not come to him
     he settles for wherever he has got to. */
  m.ran = (m.ran || 0) + 1;
  if (m.ran > BOLT_PATIENCE) { boltHoleUp(m, false); return; }
  /* home: this room is where he makes his stand */
  if (roomIndexAt(m.x, m.y) === m.goal.room) { boltHoleUp(m, true); return; }
  var step = boltStep(m, m.goal.x, m.goal.y);
  if (!step) { boltHoleUp(m, false); return; }
  if (!tryMonStep(m, step[0], step[1])) boltHoleUp(m, false);
}

/* Working the trail.  First to the square where you were last seen; then
   a few squares on past it, the way you were heading, looking about.
   Returns false when it has run out of trail and patience. */
function huntStep(m) {
  var s = m.seek;
  if (!s) return false;
  if (++s.ran > HUNT_PATIENCE) return false;
  /* not there yet: walk to the mark */
  if (m.x !== s.x || m.y !== s.y) {
    var step = boltStep(m, s.x, s.y);
    if (!step) return false;
    return tryMonStep(m, step[0], step[1]) || step[0] !== 0 || step[1] !== 0;
  }
  /* Standing on it.  Cast about: a few more squares onward, the way you
     were going when it last saw you, before it tries anywhere else.
     This used to shuffle all four directions evenly, which meant a
     creature was as likely to search back the way it came as to follow
     you - so from the outside it did not look like following at all. */
  if (s.cast <= 0) return false;
  s.cast--;
  var d = DIR4.slice();
  shuffle(d);
  if (s.dx || s.dy) {
    d.sort(function (a, b) {
      return (b[0] * s.dx + b[1] * s.dy) - (a[0] * s.dx + a[1] * s.dy);
    });
  }
  for (var i = 0; i < d.length; i++) {
    var nx = m.x + d[i][0], ny = m.y + d[i][1];
    if (!walkable(nx, ny) || monAt(L, nx, ny)) continue;
    if (nx === P.x && ny === P.y) continue;
    s.x = nx; s.y = ny;                    /* the search moves on a square */
    return tryMonStep(m, d[i][0], d[i][1]);
  }
  return false;
}

function monOneMove(m) {
  if (m.held) { m.held--; return; }
  if (m.disc > 0) {
    m.disc--;
    if (m.disc === 0 && canSeeMon(m)) msg(cap(monShort(m)) + ' comes to its senses.', '6');
  }
  if (m.ally) { allyMove(m); return; }
  if (m.bolted) { boltMove(m); return; }        /* he has your purse */
  /* somebody is wearing the mark - settle that first */
  var mk = discordTarget(m);
  if (mk) {
    m.state = 2; m.lost = 0;
    var near = adjacentFoe(m);
    if (near) { monVsMon(m, near); return; }
    if (stepToward(m, mk.x, mk.y)) return;
  }
  if (m.disc > 0) {
    /* the marked one lashes out at whatever is closest */
    var f2 = adjacentFoe(m);
    if (f2) { monVsMon(m, f2); return; }
  }
  /* a hostile will turn on your summoned help if you are out of reach */
  if (m.state === 2 && mdist(m) > 1) {
    var pal = adjacentFoe(m);
    if (pal) { monVsMon(m, pal); return; }
  }
  if (m.surprised) { m.surprised--; return; }   /* caught flat footed */

  if (m.state < 2) {
    if (m.disguise) {
      if (mdist(m) <= 1) { m.disguise = 0; m.state = 2; msg('That chest was a mimic!', 'R'); }
      return;
    }
    if (monNotices(m)) { alert(m); return; }
    if (m.state === 0) { if (rnd(1000) < 6) m.state = 1; return; }
    wanderStep(m);
    return;
  }
  if (m.disguise) { m.disguise = 0; }

  /* Losing sight of you.

     An animal gives up after three turns - chasing you across the floor
     on a scent it cannot see meant losing something was never really
     possible.  A clever thing does not forget so easily: it walks to the
     square it last saw you on, casts about a few squares past that, and
     only then goes home. */
  /* Whether it can see you decides what it does now.  Whether that
     counts as having found you again is settled at the end of the turn,
     by noteSight, once it has finished moving. */
  if (monSeesPlayer(m) || mdist(m) <= 1) {
    m.lost = 0;
    m.seek = null;
  } else {
    m.lost++;
    if (m.def.smart) {
      if (!m.seek && m.mark) {
        /* take up the trail: the last place you stood, and then a few
           squares beyond it in the direction you were going */
        m.seek = { x: m.mark.x, y: m.mark.y,
                   dx: m.mark.dx || 0, dy: m.mark.dy || 0,
                   cast: HUNT_CAST_MIN + rnd(HUNT_CAST_MAX - HUNT_CAST_MIN + 1),
                   ran: 0 };
      }
      if (m.seek) {
        if (huntStep(m)) return;           /* still following it up */
        m.state = 1; m.lost = 0; m.seek = null; m.mark = null;
        if (canSeeMon(m)) msg(cap(monShort(m)) + ' gives up the search.', '6');
        return;
      }
    }
    if (m.lost > GIVE_UP_TURNS) {
      m.state = 1;
      m.lost = 0;
      m.seek = null;
      if (canSeeMon(m)) msg(cap(monShort(m)) + ' loses interest.', '6');
      return;                              /* wanderStep walks it home */
    }
  }

  if (monRanged(m)) return;
  if (m.def.still) { if (mdist(m) === 1) monAttack(m); return; }

  var tx = P.x, ty = P.y;
  /* Something with no blow worth landing does not walk towards you.  It
     backs off and waits for whatever it does at a distance to come round
     again. */
  if (m.def.keepAway) {
    var md = mdist(m);
    if (md <= WITCH_KEEP) { tx = m.x * 2 - P.x; ty = m.y * 2 - P.y; }
    else if (md <= WITCH_ROCK_RANGE) return;      /* near enough to work from */
  }
  if (m.flee > 0) {
    m.flee--;
    /* panic is not a straight line - it stumbles, which is what makes a
       wounded monster catchable without a bow */
    if (rnd(100) < FLEE_STAGGER_PCT) { randStep(m); return; }
  }
  if (P.scare || m.flee > 0) { tx = m.x * 2 - P.x; ty = m.y * 2 - P.y; }

  if (m.conf) { m.conf--; if (rnd(100) < 60) { randStep(m); return; } }
  if (m.def.err && rnd(100) < 50) { randStep(m); return; }

  var dx = Math.sign(tx - m.x), dy = Math.sign(ty - m.y);
  if (!dx && !dy) return;
  if (!P.scare && m.flee <= 0 && mdist(m) === 1 && !m.def.nomelee) { monAttack(m); return; }

  /* orthogonal only: try the longer axis first */
  var opts = [];
  if (Math.abs(tx - m.x) >= Math.abs(ty - m.y)) {
    if (dx) opts.push([dx, 0]);
    if (dy) opts.push([0, dy]);
  } else {
    if (dy) opts.push([0, dy]);
    if (dx) opts.push([dx, 0]);
  }
  if (dy) opts.push([0, -dy]);
  if (dx) opts.push([-dx, 0]);
  for (var i = 0; i < opts.length; i++) if (tryMonStep(m, opts[i][0], opts[i][1])) return;
  randStep(m);
}
function randStep(m) {
  var d = DIR4.slice(); shuffle(d);
  for (var i = 0; i < d.length; i++) if (tryMonStep(m, d[i][0], d[i][1])) return;
}
/* an idle monster mooching about its room */
/* ------------------------------------------------------------- beats
   A creature has a post and, mostly, a round to walk: two or three
   places in its own room that it goes between, over and over.  Some
   simply stand where they are.  It gives a floor the look of a place
   people live in rather than a bag of things milling about, and it
   means giving one the slip actually gets you somewhere - it goes back
   to its round rather than drifting after you for ever. */
function giveBeat(m) {
  m.post = { x: m.x, y: m.y };
  m.beatIdx = 0;
  m.track = null;
  if (m.def.still) return;                 /* rooted things have no round */
  if (rnd(100) < STILL_PCT) return;        /* and some just stand guard */
  var ri = roomIndexAt(m.x, m.y);
  var r = (ri >= 0 && L.rooms[ri] && !L.rooms[ri].gone) ? L.rooms[ri] : null;
  if (!r || r.floors.length < 4) return;
  var n = 2 + rnd(2), pts = [[m.x, m.y]], i;
  for (i = 0; i < n; i++) {
    var s = randSpot(L, r);
    if (!walkable(s.x, s.y)) continue;
    pts.push([s.x, s.y]);
  }
  if (pts.length > 1) m.track = pts;
}

/* the spot it is making for on its round, or its post if it has none */
function beatTarget(m) {
  if (m.track && m.track.length) {
    var p = m.track[m.beatIdx % m.track.length];
    return { x: p[0], y: p[1] };
  }
  return m.post ? { x: m.post.x, y: m.post.y } : { x: m.x, y: m.y };
}

function wanderStep(m) {
  if (m.def.still) return;
  /* Back on its round: walk it.  Nothing here is random - that is the
     point of a round. */
  if (m.post) {
    var t = beatTarget(m);
    if (t.x === m.x && t.y === m.y) {
      if (m.track && m.track.length) m.beatIdx++;
      else if (rnd(100) < 70) return;      /* standing at its post */
      t = beatTarget(m);
    }
    if (t.x !== m.x || t.y !== m.y) {
      if (rnd(100) < 30) return;           /* an unhurried pace */
      var bx = Math.sign(t.x - m.x), by = Math.sign(t.y - m.y);
      var bo = [];
      if (Math.abs(t.x - m.x) >= Math.abs(t.y - m.y)) {
        if (bx) bo.push([bx, 0]); if (by) bo.push([0, by]);
      } else {
        if (by) bo.push([0, by]); if (bx) bo.push([bx, 0]);
      }
      for (var bi = 0; bi < bo.length; bi++)
        if (tryMonStep(m, bo[bi][0], bo[bi][1])) return;
      /* blocked - try the next stop rather than shoving */
      if (m.track && m.track.length) m.beatIdx++;
      return;
    }
    return;
  }
  if (rnd(100) < 55) return;              /* often they just stand about */
  if (m.wx === m.x && m.wy === m.y || rnd(100) < 6) {
    /* pick somewhere in its own room - monsters should not tour the floor */
    var here = roomIndexAt(m.x, m.y);
    if (here >= 0) m.home = here;
    /* now and then one of them takes itself off to another room */
    var roam = rnd(100) < 18;
    var home = (m.home === undefined || m.home < 0) ? here : m.home;
    var r2 = roam ? randRoom(L)
      : ((home >= 0 && L.rooms[home] && !L.rooms[home].gone) ? L.rooms[home] : null);
    var s2 = r2 ? randSpot(L, r2) : { x: m.x, y: m.y };
    if (roam && r2) m.home = r2.idx;
    m.wx = s2.x; m.wy = s2.y;
  }
  var dx = Math.sign(m.wx - m.x), dy = Math.sign(m.wy - m.y);
  var opts = [];
  if (Math.abs(m.wx - m.x) >= Math.abs(m.wy - m.y)) {
    if (dx) opts.push([dx, 0]); if (dy) opts.push([0, dy]);
  } else {
    if (dy) opts.push([0, dy]); if (dx) opts.push([dx, 0]);
  }
  for (var i = 0; i < opts.length; i++)
    if (tryMonStep(m, opts[i][0], opts[i][1])) return;
  randStep(m);
}
function tryMonStep(m, dx, dy) {
  var nx = m.x + dx, ny = m.y + dy;
  if (!walkable(nx, ny)) return false;
  if (nx === P.x && ny === P.y) {
    if (m.state < 2) { alert(m); return true; }        /* walked right into you */
    if (m.def.nomelee) return false;                   /* she does not fight */
    if (!P.scare && m.flee <= 0) { monAttack(m); return true; }
    return false;
  }
  var occ = monAt(L, nx, ny);
  if (occ) {
    if (occ.ally !== m.ally) { monVsMon(m, occ); return true; }
    return false;
  }
  /* A barrel of powder is a barrel, not a rug.  Nothing stands on one. */
  if (barrelAt(nx, ny)) return false;
  /* A real step, and the only place one can be taken: this is where
     running headlong catches up with you.  It used to be settled at the
     top of the creature's turn, before it had decided what the turn was
     for, so a creature within reach of you could go over in the middle
     of a swing - and a swing is not a step. */
  if (monStumbles(m)) return true;
  /* Remember where it came from, and when this particular step happens.
     A quick creature takes two steps in a turn, and both used to share
     one start time - so the first was thrown away and the pair replayed
     together after a pause, which looked exactly like teleporting. */
  if (!m.anim) m.anim = [];
  /* the fifth number is when it starts, the sixth how long it takes:
     a hurried step is over in half the time */
  m.anim.push([m.x, m.y, nx, ny, beatNow(),
               m.quickStep ? Math.round(MOVE_ANIM_MS * EXTRA_STEP) : MOVE_ANIM_MS]);
  /* And it faces the way it went.  The sprites are painted facing right,
     so this is only ever a mirror, and only for the creatures that have
     a front and a back worth speaking of.  Being shoved is not walking,
     so a knockback leaves it facing where it was. */
  if (nx !== m.x) m.face = nx < m.x ? -1 : 1;
  /* Steps only count while the fight is close.  A creature that has
     walked the length of the floor on its rounds is not running. */
  m.runSteps = mdist(m) <= BATTLE_NEAR ? (m.runSteps || 0) + 1 : 0;
  /* Something running while it burns sets light to the floor behind it.
     That fire does not care who walks into it afterwards. */
  if (m.burn > 0) dropEmber(m.x, m.y);
  m.x = nx; m.y = ny;
  if (webCatches(nx, ny)) {
    /* Held, not frozen.  They are the same lost turn to the game and
       nothing like the same thing to look at: web is not ice. */
    m.stuck = (m.stuck || 0) + WEB_FLOOR_HOLD;
    m.webbed = (m.webbed || 0) + WEB_FLOOR_HOLD;
    if (canSeeMon(m))
      msgFight(fightLine('', cap(monShort(m)), ' walks into web.'), 'c', 'stuck', 'c', m);
  }
  var mtr = trapAt(nx, ny);
  if (mtr) { monTrap(m, mtr); if (L.mons.indexOf(m) < 0) return true; }
  var it = itemAt(L, nx, ny);
  if (it && m.def.greedy && it.t === 'gold') {
    m.gold += it.cnt; L.items.splice(L.items.indexOf(it), 1);
  }
  return true;
}

/* ---------------------------------------------------------- upkeep */
/* ---------------------------------------------------------- fire shield
   A ring of flame that moves with you.  Every square you could be
   reached from is alight, so anything that comes to hit you has to
   stand in fire to do it.  It is relit each turn under your feet, which
   is what makes it follow you about. */
/* The squares the ring is burning this instant.  It is not made of
   anything that stays behind: it hangs about you and goes where you go.
   Setting real fire on the floor meant every step took you into the
   flames you had just been standing next to, which was fatal and not
   what a shield is for. */
function fireShieldCells() {
  var out = [], d;
  if (!P.fireShield) return out;
  for (d = 0; d < 8; d++) {
    var x = P.x + DIR8[d][0], y = P.y + DIR8[d][1];
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
    if (!walkable(x, y)) continue;
    out.push([x, y]);
  }
  return out;
}
/* Burn whatever is standing in it.  Never the one wearing it. */
function fireShieldBurn() {
  var cells = fireShieldCells(), hit = 0, i;
  for (i = 0; i < cells.length; i++) {
    var m = monAt(L, cells[i][0], cells[i][1]);
    if (!m || m.ally) continue;
    var d1 = roll(FIRE_DAMAGE[0], FIRE_DAMAGE[1]);
    m.hp -= d1; m.state = 2; m.disguise = 0;
    markHurt(m, P.x, P.y);
    hit++;
    if (m.hp <= 0) killMonster(m, true, d1 + ' burnt');
    else msgFight(fightLine('', cap(monShort(m)), ' is scorched.'), 'O', d1 + ' burn', 'O', m);
  }
  /* a barrel beside you is still a barrel beside a naked flame */
  for (i = 0; i < cells.length; i++)
    if (typeof barrelAt === 'function' && barrelAt(cells[i][0], cells[i][1])) {
      lightBarrel(cells[i][0], cells[i][1]);
      break;
    }
  return hit;
}

/* Every ring you are carrying counts turns, and gets a charge back when
   it has counted enough of them.  It counts only when it needs to, so a
   full ring is not sitting on a part-wound clock. */
/* How long this ring takes to find another charge.  Every enchantment
   cut into the band takes a third off the wait, up to three of them. */
function ringBaseWind(it) {
  var r = RINGS[it.k];
  return r.recharge === undefined ? RING_RECHARGE : r.recharge;
}
function ringWind(it) {
  var n = Math.min(it.quick || 0, RING_QUICK_MAX);
  return Math.max(10, Math.round(ringBaseWind(it) * Math.pow(1 - RING_QUICK_PCT / 100, n)));
}
function windRings() {
  var all = carriedItems(), i;
  for (i = 0; i < all.length; i++) {
    var it = all[i];
    if (!it || it.t !== 'ring') continue;
    if (it.ch >= ringCap(it)) { it.wind = 0; continue; }
    it.wind = (it.wind || 0) + 1;
    if (it.wind < ringWind(it)) continue;
    it.wind = 0;
    it.ch++;
    msg('The ring of ' + RINGS[it.k].n + ' warms in your pack.', 'c');
  }
}

/* ------------------------------------------------------- the four stats
   Everything that can move a stat - a potion, a curse, an aquator, a ring
   going on or coming off - would have to remember to say so.  Instead the
   four figures the panel actually prints are read once a turn and
   compared with what they were: whatever moved them, the change is
   noticed in one place. */
function statsNow() {
  return { str: effStr(), dex: effDex(), wis: effWis(), arm: 10 - playerAC() };
}
function markStats() {
  var now = statsNow(), k;
  if (!P.statWas) { P.statWas = now; P.statLit = P.statLit || {}; return; }
  if (!P.statLit) P.statLit = {};
  for (k in now) {
    if (now[k] === P.statWas[k]) continue;
    P.statLit[k] = { d: now[k] > P.statWas[k] ? 1 : -1, till: G.turn + STAT_LIT_TURNS };
  }
  P.statWas = now;
}
/* What colour that stat is drawn: lately raised, lately lost, or drained
   and still short of what it was. */
function statColour(k) {
  var m = P.statLit && P.statLit[k];
  if (m && G.turn <= m.till) return m.d > 0 ? 'G' : 'R';
  if (k === 'str' && P.str < P.mstr) return 'R';
  if (k === 'dex' && P.dex < P.mdex) return 'R';
  if (k === 'wis' && P.wis < P.mwis) return 'R';
  return '6';
}

function upkeep() {
  markStats();
  /* Standing in it is touching it, every turn you stand there. */
  if (inWater(P.x, P.y)) soakPlayer('The water burns where it touches you.');
  ageWebs();
  /* powder first: a lit barrel has had its turn */
  if (typeof tickFuses === 'function') tickFuses();
  /* the ring burns whatever has come close, wherever you are now */
  if (P.fireShield > 0) {
    fireShieldBurn();
    if (P.fireShield === 1) msg('The ring of fire gutters out.', '6');
  }
  /* Nothing may leave you walled in with no way to the stairs - not a
     teleport, not a fall, not blinking through the rock after a chest. */
  escapeIfStranded();
  /* a ring winds itself back up while you carry it */
  windRings();
  if (P.unseen > 0) {
    P.unseen--;
    if (P.unseen === 0) msg('You come back into view.', 'y');
  }
  var burn = hasProp('slow digestion') ? 0 : 1;
  /* Abstemious: three turns in thirteen cost you nothing, which makes a
     ration go thirty per cent further.  It does not make you proof
     against starving - it just takes longer to get there. */
  if (burn && hasPerk('abstemious')) {
    P.abstCtr = ((P.abstCtr || 0) + 1) % ABSTEMIOUS_CYCLE;
    if (P.abstCtr < ABSTEMIOUS_FREE) burn = 0;
  }
  if (P.food > 0 || burn === 0) P.food -= burn;
  var old = G.hungerState, st = 0;
  if (P.food < 20) st = 3; else if (P.food < 150) st = 2; else if (P.food < 300) st = 1;
  G.hungerState = st;
  if (st > old) {
    if (st === 1) msg('You are hungry. Wounds close half as fast.', 'O');
    if (st === 2) msg('You are weak with hunger. No more healing.', 'O');
    if (st === 3) msg('You are starving. Find food or die.', 'R');
  }
  if (P.food <= -160) { die('starvation'); return; }
  /* Starving used to make you faint on the spot, which read as the game
     freezing you for no reason - it said only "You cannot move." and gave
     no hint why.  Hunger costs you health.  That is all it costs. */

  /* Starving gnaws at you whether you rest or not. */
  if (st === 3 && G.turn % STARVE_DAMAGE_EVERY === 0) {
    msg('You are starving!', 'R');
    /* it costs health, so it sounds like it - the meter dropping in
       silence read as nothing having happened */
    markHurt(P, P.x, P.y - 1);
    hurtPlayer(1, 'starvation');
    if (G.dead) return;
  }

  /* ---- the waters you can stand in --------------------------------- */
  var here = tileAt(P.x, P.y);
  var atShrine = L.shrine && L.shrine.x === P.x && L.shrine.y === P.y;
  var atFount = L.alchemy && L.alchemy.x === P.x && L.alchemy.y === P.y;

  /* The shrine takes something for what it gives.  Standing in it once
     lifts every curse you carry; the price is a piece of you that does
     not come back. */
  if (atShrine && !L.shrine.used) {
    L.shrine.used = 1;
    var cursed = 0, all = carriedItems(), ci;
    for (ci = 0; ci < all.length; ci++) if (all[ci].cursed) { liftCurse(all[ci]); cursed++; }
    for (var ek in P.eq) if (P.eq[ek] && P.eq[ek].cursed) { liftCurse(P.eq[ek]); cursed++; }
    P.mhp = Math.max(1, P.mhp - SHRINE_COST);
    if (P.hp > P.mhp) P.hp = P.mhp;
    msg('The water is very cold, and something lets go of you.', 'c');
    msg(cursed ? cursed + (cursed === 1 ? ' curse lifts.' : ' curses lift.')
               : 'Nothing you carry was cursed.', cursed ? 'G' : '6');
    msg('You feel permanently diminished. -' + SHRINE_COST + ' max hp.', 'R');
    holdHp(P.hp, P.mhp + SHRINE_COST);
  }

  /* The alchemist's fount tells you what one thing is, and then it is
     just water. */
  if (atFount && !L.alchemy.used) {
    var unknown = [], ai, carried = carriedItems();
    for (ai = 0; ai < carried.length; ai++) {
      var it2 = carried[ai];
      if (it2.t === 'potion' && !KNOWN.pot[it2.k]) unknown.push(it2);
    }
    if (unknown.length) {
      L.alchemy.used = 1;
      var pick2 = unknown[rnd(unknown.length)];
      KNOWN.pot[pick2.k] = 1; pick2.known = 1;
      msg('The fount clouds, then clears.', 'c');
      msg('It is ' + itemName(pick2) + '.', 'c');
    } else if (!L.alchemy.told) {
      L.alchemy.told = 1;
      msg('A still fount. It has nothing to tell you.', '6');
    }
  }

  /* A spring of holy water mends you whatever your state - even starving. */
  if (here === HOLY && P.hp < P.mhp && !atShrine && !atFount) {
    healPlayer(HOLY_HEAL);
    msg('The holy water knits your wounds. +' + HOLY_HEAL + ' hp.', 'c');
  }

  /* Moss is soft and damp and grows over everything.  Resting in it
     mends you faster than bare stone - and the smell carries. */
  if (L.decor[P.y * MAP_W + P.x] && P.hp < P.mhp) {
    var dk = L.decor[P.y * MAP_W + P.x];
    /* Only the garden's moss mends you.  The tufts that grow anywhere on
       a damp floor are just tufts - it is the room that is magical, and
       healing on every mossy square in the dungeon made the garden worth
       nothing to find. */
    var ri = roomIndexAt(P.x, P.y);
    var garden = ri >= 0 && L.rooms[ri] && L.rooms[ri].special === 'moss';
    if (garden && isMoss(dk) &&
        rnd(100) < MOSS_HEAL_PCT * (hasPerk('mender') ? 2 : 1)) {
      healPlayer(1);
      if (rnd(100) < 25) msg('Healed by magical moss.', 'G');
    }
  }

  /* Natural healing: slow, halved when hungry, stopped when weak. */
  if (st < 2) {
    var rate = HEAL_RATE[Math.min(9, P.lv - 1)];
    if (hasProp('regeneration')) rate = Math.max(3, rate >> 1);
    if (hasPerk('mender')) rate = Math.max(3, rate >> 1);
    if (st === 1) rate *= 2;                       /* hungry: half speed */
    P.regenCtr++;
    if (P.regenCtr >= rate) {
      P.regenCtr = 0;
      if (P.hp < P.mhp) P.hp += (P.lv < 8) ? 1 : rnd(P.lv - 7) + 1;
      if (P.hp > P.mhp) P.hp = P.mhp;
    }
  }

  ['blind', 'conf', 'hallu', 'haste', 'frozen', 'iced', 'webbed', 'seeinv',
   'monsight', 'scare', 'fireShield', 'seer'].forEach(function (k) {
    if (P[k] > 0) {
      P[k]--;
      if (P[k] === 0) {
        if (k === 'blind') msg('The veil of darkness lifts.', 'c');
        if (k === 'conf') msg('You feel less confused.', 'c');
        if (k === 'hallu') msg('Everything looks normal again.', 'c');
        if (k === 'haste') msg('You feel yourself slowing down.', 'c');
        if (k === 'seer') msg('The ring goes quiet. The floor keeps its secrets again.', 'p');
        if (k === 'webbed') msg('You tear free of the web.', 'c');
        if (k === 'monsight') msg('You stop feeling what moves nearby.', 'c');
      }
    }
  });
  /* while it lasts, it keeps showing you things */
  if (P.seer > 0) seerLook();

  /* passive searching - no key needed for it any more */
  if (rnd(100) < searchSkill()) doSearch(true);
  /* A cursed item that throws you across the floor is not much fun if you
     cannot tell what is doing it.  It happens rarely, and the thing
     responsible names itself the first time. */
  var tp = hasProp('teleportation');
  if (tp && rnd(1000) < TELEPORT_CURSE_PER_MILLE) {
    /* Armour is never anonymous - the name says "blinking sandals" from
       the moment you pick them up - so there is nothing to reveal.  Just
       say which thing did it. */
    layCurse(tp);
    teleportPlayer();
    msg('Your ' + itemDef(tp).n + ' wrench you across the room!', 'P');
  }
  P.aggravate = hasProp('aggravate monster') ? 1 : 0;

  ageTempWalls();
  ageClouds();
  if (L.wanderLeft > 0) {
    var alive = 0;
    for (var mi = 0; mi < L.mons.length; mi++) if (!L.mons[mi].ally) alive++;
    /* Damp moss and a resting body: something always comes to look. */
    var pull = 1;
    var dHere = L.decor[P.y * MAP_W + P.x];
    if (isMoss(dHere)) pull = MOSS_WANDER_MULT;
    if (alive < MON_CAP &&
        rnd(1000) < (WANDER_CHANCE_PER_MILLE + Math.min(8, (G.depth / 3) | 0)) * pull) {
      if (spawnWanderer()) L.wanderLeft--;
    }
  }
}
/* poison hangs about for a few turns and stings anything standing in it */
/* Set light to a list of squares.  Everything that throws fire about ends
   up here - a wand, a stick of dynamite, a dragon - so that all of them
   leave the same thing behind them: a square that burns for a turn or
   two, takes the furniture standing on it, and lights any powder there.
   Only the squares you could walk on: fire does not stick to stone. */
function scorch(cells, turns, at) {
  var i, life = turns || (SPELL_FIRE_MIN + rnd(SPELL_FIRE_MAX - SPELL_FIRE_MIN + 1));
  var lit = 0;
  for (i = 0; i < cells.length; i++) {
    var x = cells[i][0], y = cells[i][1];
    if (!walkable(x, y) || inWater(x, y)) continue;
    lit++;
    dropEmber(x, y, life, at);
  }
  return lit;
}

/* ------------------------------------------------------ scenery alight
   A table is wood and a rug is cloth.  Fire that reaches one catches it,
   and it goes on burning for a turn after the flame that lit it would
   have died - and then it is not there any more.

   A rug is one thing rather than nine, the same rule the generator uses
   when a stream takes a corner off one: touch any square of it with fire
   and the whole rug goes up. */
function burnableAt(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return '';
  var d = L.decor[y * MAP_W + x];
  if (!d) return '';
  if (BURNS[d]) return BURNS[d];
  if (isRugName(d)) return 'rug';
  return '';
}
/* the fire on this square takes hold of whatever is standing on it */
function catchScenery(c) {
  var j = c.y * MAP_W + c.x;
  L.burning = L.burning || {};
  if (L.burning[j] || !burnableAt(c.x, c.y)) return;
  L.burning[j] = 1;
  c.turns += DECOR_BURN_TURNS;
  /* and the rest of the rug with it.  The flame passed on is a fixed
     one turn, not however long this square has left: twenty squares of
     rug each handing the others their own count sets a fire going that
     climbs faster than it burns down, and the rug never finishes. */
  var id = L.rugId && L.rugId[j];
  if (!id) return;
  for (var k in L.rugId) {
    if (L.rugId[k] !== id || (k | 0) === j) continue;
    dropEmber((k | 0) % MAP_W, ((k | 0) / MAP_W) | 0, DECOR_BURN_TURNS);
  }
}
/* and when that fire finally goes out, what it was standing on is gone */
function burnAway(x, y) {
  var j = y * MAP_W + x;
  if (!L.burning || !L.burning[j]) return '';
  delete L.burning[j];
  var what = burnableAt(x, y);
  if (!what) return '';
  var id = L.rugId && L.rugId[j];
  if (!id) { delete L.decor[j]; return what; }
  /* A rug is one thing rather than nine, so the first square of it to go
     takes the whole rug with it - and only the one square has anything
     to say about it. */
  for (var k in L.rugId) {
    if (L.rugId[k] !== id) continue;
    delete L.decor[k | 0]; delete L.burning[k | 0]; delete L.rugId[k];
  }
  return what;
}
/* One line for the lot of them, naming what went: a wall of fire across
   a furnished room would otherwise say the same thing five times over,
   and "something burned" is not worth saying at all. */
function saySceneryBurnt(gone) {
  if (!gone.length) return;
  var kinds = [], i;
  for (i = 0; i < BURNS_ORDER.length; i++)
    if (gone.indexOf(BURNS_ORDER[i]) >= 0) kinds.push(BURNS_ORDER[i]);
  if (!kinds.length) return;
  var words = kinds.map(function (k) {
    var n = gone.filter(function (g) { return g === k; }).length;
    return n > 1 ? BURNS_PLURAL[k] : k;
  });
  var list = words.length === 1 ? words[0]
           : words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
  /* one thing of one kind takes the singular; moss always does */
  var one = gone.length === 1 || (kinds.length === 1 && kinds[0] === 'moss');
  msg('The ' + list + (one ? ' burns away.' : ' burn away.'), '6');
}

function ageClouds() {
  var i, hurt = 0, burn = 0, mend = 0, gone = [];
  for (i = L.clouds.length - 1; i >= 0; i--) {
    var c = L.clouds[i];
    var fire = c.kind === 'fire', kind = c.kind;
    var m = monAt(L, c.x, c.y);
    if (kind === 'mend') {
      /* a red mist puts things back rather than taking them away, and
         it does not care whose side anybody is on */
      if (m && m.hp < m.mhp) {
        m.hp = Math.min(m.mhp, m.hp + roll(MEND_CLOUD[0], MEND_CLOUD[1]));
        if (canSeeMon(m))
          msgFight(fightLine('', cap(monShort(m)), ' knits together.'), 'r', 'healed', 'G', m);
      }
      if (P.x === c.x && P.y === c.y) mend++;
    } else if (m && !m.ally) {
      var d = fire ? perkElemental(roll(FIRE_DAMAGE[0], FIRE_DAMAGE[1]), 'fire')
                   : roll(1, 3);
      m.hp -= d; m.state = 2;
      markHurt(m, c.x, c.y + 1);
      if (m.hp <= 0) killMonster(m, true, fire ? 'burnt' : 'choked');
    }
    if (fire && typeof lightBarrel === 'function') lightBarrel(c.x, c.y);
    if (fire) catchScenery(c);
    if (kind !== 'mend' && P.x === c.x && P.y === c.y) { if (fire) burn++; else hurt++; }
    if (--c.turns <= 0) {
      L.clouds.splice(i, 1);
      var ate = burnAway(c.x, c.y);
      if (ate && (L.flags[c.y * MAP_W + c.x] & F_VIS)) gone.push(ate);
    }
  }
  if (mend && P.hp < P.mhp) {
    var mv = roll(MEND_CLOUD[0], MEND_CLOUD[1]);
    msgTrap('The red mist closes your wounds.', 'G', '+' + mv + ' hp', 'G');
    healPlayer(mv);
  }
  if (hurt) {
    msg('The poison burns your lungs.', 'g');
    if (!hasProp('sustain strength') && !hasPerk('ironblood') && rnd(100) < 25)
      P.str = Math.max(3, P.str - 1);
    /* it comes from the air round you, so the flinch has no direction -
       but something took health off you and that always shows */
    markHurt(P, P.x, P.y - 1);
    hurtPlayer(roll(1, 3), 'poison gas', 'poison');
  }
  if (burn) {
    var bd = roll(FIRE_DAMAGE[0], FIRE_DAMAGE[1]);
    msgTrap('You are standing in fire!', 'R', bd + ' burn', 'R');
    markHurt(P, P.x, P.y - 1);
    hurtPlayer(bd, 'fire', 'fire');
  }
  /* last, because what the fire did to you matters more than what it
     did to the furniture */
  saySceneryBurnt(gone);
}
/* everything already standing in a new fire feels it at once */
/* Lighting the room you are standing in.  A wand, a scroll and a ring
   all end up here, and all of them leave the room `blazing` - lit by
   magic rather than by a lamp somebody left burning, which is a thing
   certain creatures can tell the difference between. */
function lightTheRoom(inRoom, inCorridor) {
  var ri = roomIndexAt(P.x, P.y);
  if (ri < 0) { msg(inCorridor, 'y'); return 0; }
  var lr = L.rooms[ri], q;
  lr.lit = 1;
  lr.blaze = 1;
  /* And it is no longer dark.  Only `lit` used to be set, but a pitch
     dark room is dark because of `dark`, and buildDarkMap reads that -
     so the ring said the room came up bright and then the room was
     rebuilt just as black as it was.  A hallway square inside it is on
     the dark list of its own, so that goes too. */
  lr.dark = 0;
  for (q = 0; q < lr.floors.length; q++) {
    var fk = lr.floors[q][1] * MAP_W + lr.floors[q][0];
    if (L.darkHall) delete L.darkHall[fk];
  }
  /* The spill lives in these two maps, so rebuilding them without running
     it again rubs out every opening on the floor that light was coming
     through. */
  buildLitMap(L); buildDarkMap(L, G.depth); spillLight(L);
  msg(inRoom, 'y');
  computeVis();
  return 1;
}
/* is this creature standing in light that was conjured, not left? */
function inBlaze(m) {
  var ri = roomIndexAt(m.x, m.y);
  return ri >= 0 && !!L.rooms[ri].blaze;
}
/* A vampire in conjured light drags its feet, hits softer and covers
   itself worse.  Walk out of the room and it is a vampire again. */
function dazzled(m) {
  return m && m.def.sp === 'drainmax' && !m.cancel && inBlaze(m);
}

/* a single square of fire left behind, not a spreading blaze */
function dropEmber(x, y, turns, at) {
  /* Water does not catch.  A pool with a fire burning on it was the one
     thing in the dungeon that read as a mistake however it got there. */
  if (inWater(x, y)) return;
  if (typeof lightBarrel === 'function') lightBarrel(x, y);
  var life = turns || BURN_TRAIL_TURNS;
  for (var i = 0; i < L.clouds.length; i++) {
    var c = L.clouds[i];
    if (c.x === x && c.y === y && c.kind === 'fire') {
      c.turns = Math.max(c.turns, life);
      if (at && c.at) c.at = Math.min(c.at, at);
      else if (!at) c.at = 0;
      return;
    }
  }
  /* `at` is the moment the flame should appear.  Fire thrown across a
     room is worked out the instant the creature takes its turn, but the
     ball is still in the air for a beat afterwards - and a fire drawn
     the moment it was worked out had the player standing in flames
     before the thing that lit them had left the creature's mouth. */
  L.clouds.push({ x: x, y: y, kind: 'fire', turns: life, at: at || 0 });
}

/* ---------------------------------------------------------- breathing
   A jet of flame from a creature to you: a row of fire drawn square by
   square along the line, and every square it crossed left burning for a
   turn or two afterwards.

   It was drawn as a single flying object with its clock started at once,
   which meant the flight was over before the frame was drawn - so the
   fire appeared to land in the same instant the creature moved, and
   looked like an arrow while it did it. */
/* The squares a jet of flame crosses on its way to you.

   It used to step one square at a time in your general direction, which
   is not the same as a line to you: on anything but a straight run that
   walk clips the corner of the room and carries on into the rock, and
   the flame was drawn - and left burning - out in the stone beyond the
   wall.  It follows the same line an arrow would now, and stops at the
   first thing that would stop an arrow. */
function breathPath(x0, y0, x1, y1, range) {
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy, x = x0, y = y0, out = [];
  while (out.length < range) {
    var e2 = err + err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
    if (blocksShot(x, y)) break;
    out.push([x, y]);
    if (x === x1 && y === y1) break;
  }
  return out;
}

function breatheFire(m, dmg, kind) {
  var i, path = breathPath(m.x, m.y, P.x, P.y, RANGED_BREATH_RANGE + 2);
  var dx = Math.sign(P.x - m.x), dy = Math.sign(P.y - m.y);
  if (!path.length) return 0;
  /* Wait first, then set the flame going from that moment: an animation
     timed from now is finished before anybody sees it. */
  beatWait(BREATH_LEAD);
  G.bolt = { path: path.slice(), kind: 'fire', mode: 'beam',
             dir: [dx, dy], t: beatNow() };
  sound('boom');
  /* What it leaves burning behind it.  dropEmber lights a powder barrel
     standing on the square, so a jet that reaches the powder sets it
     off - and one that is stopped by the wall in front of it does not. */
  var life = BREATH_FIRE_MIN + rnd(BREATH_FIRE_MAX - BREATH_FIRE_MIN + 1);
  var last = path[path.length - 1];
  /* lit the moment the jet is drawn, not the moment the turn is worked out */
  var when = beatNow();
  for (i = 0; i < path.length; i++) {
    if (!walkable(path[i][0], path[i][1])) continue;
    dropEmber(path[i][0], path[i][1], life, when);
  }
  /* and it only burns you if it got as far as you */
  if (last[0] === P.x && last[1] === P.y) {
    markHurt(P, m.x, m.y);
    hurtPlayer(dmg, m.def.n, kind || 'fire');
  } else msg('The flames wash across the stone.', '6');
  return path.length;
}

/* A ball of fire, thrown rather than breathed: one thing crossing the
   room, and fire only where it lands. */
function throwFireball(m, dmg) {
  var path = breathPath(m.x, m.y, P.x, P.y, FIREBALL_RANGE + 2);
  if (!path.length) return 0;
  var last = path[path.length - 1];
  beatWait(BREATH_LEAD);
  G.shot = { sx: m.x, sy: m.y, ex: last[0], ey: last[1],
             t: beatNow(), dur: BREATH_LEAD, spr: 'flame' };
  sound('boom');
  beatWait(BREATH_LEAD);
  /* and this one waits for the ball to get there */
  var life = BREATH_FIRE_MIN + rnd(BREATH_FIRE_MAX - BREATH_FIRE_MIN + 1);
  if (walkable(last[0], last[1])) dropEmber(last[0], last[1], life, beatNow());
  if (last[0] === P.x && last[1] === P.y) {
    markHurt(P, m.x, m.y);
    hurtPlayer(dmg, m.def.n, 'fire');
  } else msg('The fire bursts against the stone.', '6');
  return 1;
}

function burnEverything() {
  for (var i = 0; i < L.clouds.length; i++) {
    var c = L.clouds[i];
    if (c.kind !== 'fire') continue;
    var m = monAt(L, c.x, c.y);
    if (m && !m.ally) {
      var d = perkElemental(roll(FIRE_DAMAGE[0], FIRE_DAMAGE[1]), 'fire');
      m.hp -= d; m.state = 2; m.disguise = 0;
      markHurt(m, c.x, c.y + 1);
      if (m.hp <= 0) killMonster(m, true, d + ' burn');
      else msgFight(fightLine('', cap(monShort(m)), ' is alight.'), 'R', d + ' burn', 'R', m);
    }
  }
}

function spawnWanderer() {
  for (var t = 0; t < 20; t++) {
    var s = randSpot(L, randRoom(L));
    if (Math.abs(s.x - P.x) + Math.abs(s.y - P.y) < 12) continue;
    if (monAt(L, s.x, s.y)) continue;
    var m = mkMonster(pickMonsterChar(L, G.depth), G.depth, s.x, s.y);
    m.state = rnd(100) < 60 ? 1 : 0;
    m.home = roomIndexAt(s.x, s.y);
    m.wx = s.x; m.wy = s.y;
    L.mons.push(m);
    return true;
  }
  return false;
}
/* ------------------------------------------------- somewhere you can
   leave again

   Some of a floor is walled in on purpose: the pockets in the rock with
   a chest and no door, and the vault behind a locked door.  They are
   fine to blast your way into.  They are not fine to be *put* into: a
   teleport trap that drops you inside one with no dynamite ends the run
   on the spot with nothing to be done about it.

   So anything that moves you without your choosing the square - a
   teleport, a fall, arriving on a floor - has to land somewhere the way
   down can still be reached from, with the keys you are actually
   carrying. */
/* Everywhere you could walk to if you were standing at the way down,
   with the keys you are actually carrying.  Reachability runs both ways,
   so this one flood fill answers "can I get out of here?" for every
   square at once - asking it per square meant a fresh fill per candidate
   and thousands of them for one arrival.

   It is a copy, not the shared scratch buffer: whoever asked for this is
   going to hold on to it while other things ask for their own. */
function wayOutSet(Lv, keys) {
  var st = Lv.stair || Lv.up;
  if (!st) return null;
  return reachCopy(Lv, st.x, st.y, keys === undefined ? (P.keys || {}) : keys);
}
function canLeaveFrom(Lv, x, y, set) {
  if (x < 1 || y < 1 || x >= Lv.mw - 1 || y >= Lv.mh - 1) return false;
  if (!walkTile(Lv.tiles[y * Lv.mw + x])) return false;
  var seen = set || wayOutSet(Lv);
  return !!(seen && seen[y * Lv.mw + x]);
}
/* Are you walled in where you stand - really walled in, by stone?

   A locked door is not a wall: the key is somewhere on the floor and
   finding it is the game.  Nor is a secret door: searching finds it.
   Counting those as walls made the net fire on anybody standing in a
   vault without the key yet, and it would quietly chew a hole in the
   masonry to "rescue" them. */
function strandedHere() {
  /* a secret door is not a wall either: you can search your way through
     one from the inside, and digging a hole beside it would spoil the
     room it hides */
  var T = L.tiles, hidden = [], i, out;
  for (i = 0; i < T.length; i++) if (T[i] === SDOOR) { hidden.push(i); T[i] = DOOR; }
  out = wayOutSet(L, true);
  for (i = 0; i < hidden.length; i++) T[hidden[i]] = SDOOR;
  return !canLeaveFrom(L, P.x, P.y, out);
}

/* The last resort, and it should never be needed.  If you are somehow
   standing somewhere the way down cannot be reached from, the dungeon
   opens a way rather than leaving you to restart: it tries to move you
   first, and failing that it eats through the thinnest stretch of rock
   between you and the rest of the floor. */
function escapeIfStranded() {
  if (!strandedHere()) return 0;
  /* It digs rather than moving you.  Blinking into a walled-in pocket to
     get at the chest is a fair thing to do on purpose, and being flung
     straight back out of it would be a worse answer than a crack in the
     wall.  Either way you are not stuck. */
  /* breadth first through the stone, looking for anywhere that can leave */
  var T = L.tiles, dist = {}, from = {}, q = [P.y * MAP_W + P.x], head = 0, goal = null;
  var hid = [], hi;
  for (hi = 0; hi < T.length; hi++) if (T[hi] === SDOOR) { hid.push(hi); T[hi] = DOOR; }
  var out = wayOutSet(L, true);
  for (hi = 0; hi < hid.length; hi++) T[hid[hi]] = SDOOR;
  dist[q[0]] = 0;
  while (head < q.length && goal === null) {
    var c = q[head++], cx = c % MAP_W, cy = (c / MAP_W) | 0;
    for (var d = 0; d < 4; d++) {
      var nx = cx + DIR4[d][0], ny = cy + DIR4[d][1];
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      var n = ny * MAP_W + nx;
      if (dist[n] !== undefined) continue;
      var tt = T[n];
      if (tt === BARS) continue;                 /* nothing breaks those */
      dist[n] = dist[c] + 1;
      from[n] = c;
      if (canLeaveFrom(L, nx, ny, out)) { goal = n; break; }
      q.push(n);
    }
  }
  if (goal === null) return 0;
  var cur = goal, dug = 0;
  while (cur !== undefined && cur !== P.y * MAP_W + P.x) {
    if (T[cur] === ROCK || T[cur] === WALL || T[cur] === SDOOR) { T[cur] = CORR; dug++; }
    cur = from[cur];
  }
  buildCorridorWalls(L);
  computeVis();
  if (dug) msg('The stone crumbles. A way out opens.', 'y');
  return 1;
}

function teleportPlayer() {
  var t, s, out = wayOutSet(L), fx = P.x, fy = P.y;
  for (t = 0; t < 200; t++) {
    s = randSpot(L, randRoom(L));
    if (monAt(L, s.x, s.y) || !walkable(s.x, s.y)) continue;
    if (!canLeaveFrom(L, s.x, s.y, out)) continue;
    warpAway(P, fx, fy);
    P.x = s.x; P.y = s.y; computeVis(); return true;
  }
  /* the random darts all missed: walk the whole floor rather than give
     up and leave you where you were */
  var cands = [], x, y;
  for (y = 1; y < MAP_H - 1; y++) for (x = 1; x < MAP_W - 1; x++) {
    if (L.tiles[y * MAP_W + x] !== FLOOR) continue;
    if (monAt(L, x, y)) continue;
    if (L.caged && L.caged[y * MAP_W + x]) continue;
    if (!canLeaveFrom(L, x, y, out)) continue;
    cands.push([x, y]);
  }
  if (!cands.length) return false;
  var c = cands[rnd(cands.length)];
  warpAway(P, fx, fy);
  P.x = c[0]; P.y = c[1]; computeVis();
  return true;
}
function doSearch(silent) {
  var found = 0;
  for (var i = 0; i < DIR4.length; i++) {
    var x = P.x + DIR4[i][0], y = P.y + DIR4[i][1];
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
    var keen = 25 + (effWis() - 10) * 5;
    if (tileAt(x, y) === SDOOR && rnd(100) < keen) {
      L.tiles[y * MAP_W + x] = DOOR; found = 1;
      msg('You found a secret door!', 'y');
    }
    var tr = trapAt(x, y);
    if (tr && !tr.found && rnd(100) < keen) {
      tr.found = 1; found = 1;
      msg('You found ' + artic(tr.k.n) + '.', 'y');
    }
  }
  return found;
}
