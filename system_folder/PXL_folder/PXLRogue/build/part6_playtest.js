/* ============================================================ playtest
   The game, with a way in that skips the walking.

   This file is only in playtest.html.  It adds nothing to the rules: it
   picks a floor that has the thing you asked for on it, stands you next
   to it, and hands you a pack full of gear so you can get straight to
   whatever you meant to look at.  Everything after that is the game.

   Two questions, in order.  What sort of thing - a room, or a creature -
   and then which one.  The menu is ordinary HTML over the canvas rather
   than pixels on it: it is scaffolding, and scaffolding should not have
   to be drawn twice. */

/* --------------------------------------------------------- a full pack
   One of everything worth carrying, so nothing has to be searched for.
   Weapons and armour come identified: you are here to test how a thing
   fights, not to work out what it is. */
function playtestKit() {
  var i, it;
  P.slots = new Array(N_SLOTS).fill(null);
  P.eq = { rh: null, body: null, lh: null, head: null, feet: null };

  var sword = mkItem('weapon', weaponIndex('long sword'));
  sword.known = 1; sword.hp = 2; sword.dp = 2;
  var mail = mkItem('armor', ARMORS.length - 2);
  mail.known = 1; mail.ap = 2;
  var bow = mkItem('weapon', weaponIndex('short bow')); bow.known = 1;
  var helm = mkItem('head', 1); helm.known = 1;
  var boots = mkItem('feet', 1); boots.known = 1;
  P.eq.rh = sword; P.eq.body = mail; P.eq.lh = bow;
  P.eq.head = helm; P.eq.feet = boots;
  learnGear(sword); learnGear(mail); learnGear(bow);
  learnGear(helm); learnGear(boots);

  /* The pouch goes in first.  Filled last it never found a slot, and
     everything meant to be in it ended up in an object nobody was
     carrying. */
  var pouch = mkItem('pouch', 0);
  addItem(pouch);

  /* what goes in the pack: something of every kind you might reach for */
  var arrows = mkItem('weapon', weaponIndex('arrow'));
  arrows.cnt = 30; arrows.known = 1; addItem(arrows);

  var stones = mkItem('weapon', weaponIndex('stone'));
  stones.cnt = 8; stones.known = 1; addItem(stones);

  /* one of each runed stone, named, three apiece */
  for (i = 0; i < WEAPONS.length; i++) {
    if (!WEAPONS[i].rune) continue;
    it = mkItem('weapon', i); it.cnt = 3; it.known = 1;
    learnWeapon(i);
    addItem(it);
  }

  var dyn = mkItem('dynamite', 0); dyn.cnt = 5; addItem(dyn);
  var pins = mkItem('pin', 0); pins.cnt = 3; addItem(pins);
  var crystals = mkItem('crystal', 0); crystals.cnt = 5; addItem(crystals);

  /* --- and then a handful of whatever ------------------------------
     What is left of the pack is dealt rather than laid out.  A kit with
     one of everything in it is a fine way to test a thing you already
     know about and a poor way to notice one you do not: it looks the
     same every time, so nothing in it ever looks odd.

     It was never one of everything anyway - there are 19 wands and 20
     slots, so the old loop simply filled the pack with wands in table
     order and stopped, and half of what it meant to hand you never fit.

     Unidentified, on purpose.  Half of what a vial or a mushroom or a
     ring IS lives in not knowing which one you are holding, and a
     playtest that hands you the answer cannot show you that half.
     Wands are the exception: they are the tool you reach for while
     testing something else, so the ones dealt come charged and named. */
  function ofKind(kind) {
    var out = [], q;
    if (kind === 'vial') for (q = 0; q < VIALS.length; q++) out.push(q);
    if (kind === 'food') for (q = 0; q < FOODS.length; q++) if (isMushroom(q)) out.push(q);
    if (kind === 'ring') for (q = 0; q < RINGS.length; q++) if (RINGS[q].p) out.push(q);
    if (kind === 'wand') for (q = 0; q < WANDS.length; q++) out.push(q);
    if (kind === 'potion') for (q = 0; q < POTIONS.length; q++) out.push(q);
    if (kind === 'scroll') for (q = 0; q < SCROLLS.length; q++) out.push(q);
    return out;
  }
  /* The KIND is drawn first and the thing second, so nineteen wands do
     not crowd out four vials simply by being nineteen. */
  var kinds = ['vial', 'food', 'ring', 'wand', 'potion', 'scroll'];
  function deal(kind, k) {
    var thing = mkItem(kind, k);
    if (kind === 'wand') { thing.ch = 9; KNOWN.wand[k] = 1; }
    if (kind === 'ring') thing.ch = RINGS[k].charges === undefined
      ? RING_CHARGES : RINGS[k].charges;
    if (kind === 'vial' || kind === 'food') thing.cnt = 1 + rnd(2);
    return addItem(thing);
  }
  function dealOne(kind) {
    var list = ofKind(kind);
    if (!list.length) return null;
    return deal(kind, list[rnd(list.length)]);
  }
  /* one of each of the three that are worth seeing and easy to miss */
  dealOne('vial'); dealOne('food'); dealOne('ring');
  var guard = 0;
  while (freeSlot() >= 0 && guard++ < 60) dealOne(kinds[rnd(kinds.length)]);

  /* and the pouch, likewise: a mix of glass rather than the same ten
     flasks every time.  addItem puts potions and vials in it by itself,
     so this is only about filling what is left of it. */
  var glass = [];
  for (i = 0; i < POTIONS.length; i++) glass.push(['potion', i]);
  for (i = 0; i < VIALS.length; i++) glass.push(['vial', i]);
  for (var s = 0; s < POUCH_CAP && glass.length; s++) {
    if (pouch.items[s]) continue;
    var g = glass[rnd(glass.length)];
    var gi = mkItem(g[0], g[1]);
    gi.cnt = 1 + rnd(2);
    pouch.items[s] = gi;
  }
  /* Scrolls stay known: they are the one kind you read to make something
     else happen, and hunting for the identify scroll in a list of made-up
     titles is not what anybody opened this file to do. */
  for (i = 0; i < SCROLLS.length; i++) KNOWN.scr[i] = 1;

  P.food = FOOD_MAX;
  P.gold = 500;
}

/* --------------------------------------------- a floor with that on it
   Roll floors until one has what was asked for, then stand the player
   beside it.  Rolling is simpler than building a floor by hand and it
   gives you a real one - the room you get is the room the game makes. */
var PLAYTEST_TRIES = 400;

function playtestRoom(kind) {
  var depth, tries;
  for (tries = 0; tries < PLAYTEST_TRIES; tries++) {
    depth = 1;
    for (var i = 0; i < SPECIAL_ROOMS.length; i++)
      if (SPECIAL_ROOMS[i].n === kind) depth = Math.max(1, SPECIAL_ROOMS[i].min);
    /* A floor you have already been on is remembered, so asking for it
       again hands back the same one.  Forget it, and get a new floor. */
    G.floors = {};
    enterLevel(depth);
    var r = null;
    for (i = 0; i < L.rooms.length; i++)
      if (!L.rooms[i].gone && L.rooms[i].special === kind) r = L.rooms[i];
    if (!r) continue;
    /* stand in the doorway of it, or in the middle if it has none */
    standIn(r);
    return true;
  }
  return false;
}

/* ------------------------------------------------------ a way down
   A trapdoor turns up on about one floor in four and is hidden until it
   is found, which makes it the one thing in the game you cannot go and
   look at when you want to.  So: a floor that has one, standing beside
   it with it already found, and the cellar underneath it left exactly
   as the dungeon built it. */
function playtestCellar(rugged) {
  var tries, i;
  for (tries = 0; tries < PLAYTEST_TRIES; tries++) {
    G.floors = {};
    enterLevel(2 + rnd(6));
    if (!L.tdoor) continue;
    var keys = [], k;
    for (k in L.tdoor) keys.push(k | 0);
    if (!keys.length) continue;
    var j = keys[0];
    var tx = j % MAP_W, ty = (j / MAP_W) | 0;
    /* under a rug, or in plain sight - both are worth being able to ask
       for, since the rug is the whole reason one can be missed */
    if (rugged && !isRugName(L.decor[j])) continue;
    if (!rugged && isRugName(L.decor[j])) continue;
    /* found, so it can be used - a rug over it still hides it, which is
       the point of asking for that one */
    L.tdoor[j].found = 1;
    /* stand beside it, or on it if there is nowhere beside it */
    var spot = null;
    for (i = 0; i < DIR8.length; i++) {
      var nx = tx + DIR8[i][0], ny = ty + DIR8[i][1];
      if (walkable(nx, ny) && !monAt(L, nx, ny) && tileAt(nx, ny) !== TRAPDOOR) { spot = [nx, ny]; break; }
    }
    P.x = spot ? spot[0] : tx; P.y = spot ? spot[1] : ty;
    L.mons.length = 0;
    computeVis();
    return true;
  }
  return false;
}

/* A plain room, with one of these in it and nothing else alive. */
function playtestMonster(c) {
  var D = MON_BY_C[c];
  var depth = Math.max(1, D && D.minDepth ? D.minDepth : 1);
  var tries;
  for (tries = 0; tries < PLAYTEST_TRIES; tries++) {
    G.floors = {};
    enterLevel(depth);
    var r = biggestPlainRoom();
    if (!r) continue;
    standIn(r);
    L.mons.length = 0;
    /* far enough off to see it coming, near enough to reach it */
    var spot = spotInRoom(r, 4, 8);
    if (!spot) spot = spotInRoom(r, 2, 12);
    if (!spot) continue;
    var m = mkMonster(c, Math.max(depth, 6), spot.x, spot.y);
    m.state = 2; m.disguise = 0;
    L.mons.push(m);
    computeVis();
    return true;
  }
  return false;
}

/* the biggest room with nothing special about it */
function biggestPlainRoom() {
  var best = null, i;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || r.special || r.sealed || r.dark) continue;
    if (r.floors.length < 14) continue;
    if (!best || r.floors.length > best.floors.length) best = r;
  }
  return best;
}
function standIn(r) {
  P.x = r.cx; P.y = r.cy;
  if (!walkable(P.x, P.y) && r.floors.length) { P.x = r.floors[0][0]; P.y = r.floors[0][1]; }
  computeVis();
}
function spotInRoom(r, lo, hi) {
  var out = [], i;
  for (i = 0; i < r.floors.length; i++) {
    var f = r.floors[i];
    var d = Math.abs(f[0] - P.x) + Math.abs(f[1] - P.y);
    if (d < lo || d > hi) continue;
    if (!walkable(f[0], f[1]) || monAt(L, f[0], f[1])) continue;
    out.push({ x: f[0], y: f[1] });
  }
  return out.length ? out[rnd(out.length)] : null;
}

/* ---------------------------------------------------------- the start
   Set a run up the way newGame does, then put the asked-for thing in
   front of you. */
function playtestStart(what, which) {
  srand((Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0);
  makeAppearances();
  G = freshG();
  P = newPlayer();
  P.lv = 6; P.exp = E_LEVELS[4];
  P.mhp = 60; P.hp = 60;
  P.str = P.mstr = 18; P.dex = P.mdex = 16; P.wis = P.mwis = 16;
  playtestKit();

  var ok = (what === 'room') ? playtestRoom(which) :
           (what === 'cellar') ? playtestCellar(which === 'rug') :
           playtestMonster(which);
  G.msgq = [];
  G.mode = 'play';
  if (!ok) msg('Could not find one. Reload and try again.', 'R');
  else if (what === 'room') msg('A ' + which + ' room. Have a look round.', 'c');
  else if (what === 'cellar')
    msg(which === 'rug' ? 'A trapdoor under that rug. Burn it off to find it.'
                        : 'A trapdoor, found. ENTER on it goes down.', 'c');
  else msg('One ' + MON_BY_C[which].n + ', waiting for you.', 'c');
  msg('TAB for the pack. ESC for the menu.', '6');
  finishMsgs();
}

/* ------------------------------------------------------------ the menu
   Two lists, one after the other, in plain HTML over the canvas. */
function playtestMenu() {
  var box = document.getElementById('pick');
  var head = document.getElementById('pickhead');
  var list = document.getElementById('picklist');

  function show(rows, title, pick) {
    head.textContent = title;
    list.innerHTML = '';
    rows.forEach(function (row) {
      var b = document.createElement('button');
      b.textContent = row[1];
      b.onclick = function () { pick(row[0]); };
      list.appendChild(b);
    });
    box.style.display = 'flex';
  }

  show([['room', 'A ROOM'], ['monster', 'A MONSTER'], ['cellar', 'A CELLAR']],
    'What do you want to try?',
    function (what) {
      if (what === 'cellar') {
        show([['open', 'A TRAPDOOR IN THE OPEN'], ['rug', 'ONE UNDER A RUG']],
          'Which sort?', function (which) {
            box.style.display = 'none';
            playtestStart('cellar', which);
          });
      } else if (what === 'room') {
        var rooms = SPECIAL_ROOMS.map(function (s) { return [s.n, s.n.toUpperCase()]; });
        show(rooms, 'Which room?', function (which) {
          box.style.display = 'none';
          playtestStart('room', which);
        });
      } else {
        var mons = MONS.map(function (m) { return [m.c, m.n.toUpperCase()]; });
        mons.sort(function (a, b) { return a[1] < b[1] ? -1 : 1; });
        show(mons, 'Which creature?', function (which) {
          box.style.display = 'none';
          playtestStart('monster', which);
        });
      }
    });
}
