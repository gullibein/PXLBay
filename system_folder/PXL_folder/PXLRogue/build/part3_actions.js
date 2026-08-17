/* ============================================================ ROGUE-8
   Part 3 : player actions, item use, traps, magic.
   Movement is orthogonal only - no diagonals for anyone.
   ============================================================ */

/* Trade places with an ally.  It costs the turn, like a step, and it
   cannot put either of you somewhere you could not have walked. */
function swapWithAlly(m) {
  var ox = P.x, oy = P.y;
  if (!walkable(m.x, m.y)) { msg('There is no room to get past.', '6'); return true; }
  if (!m.anim) m.anim = [];
  m.anim.push([m.x, m.y, ox, oy, beatNow()]);
  P.x = m.x; P.y = m.y;
  m.x = ox; m.y = oy;
  msg('You push past ' + monShort(m) + '.', 'c');
  /* whatever is underfoot for either of you now applies */
  var tr = trapAt(m.x, m.y);
  if (tr) monTrap(m, tr);
  computeVis();
  afterStep();
  return true;
}

function playerMove(dx, dy) {
  /* Say which of the several things that stop you is stopping you: a
     bald "You cannot move." is indistinguishable from a bug. */
  if (P.frozen) {
    msg(P.iced ? 'You are frozen solid.'
      : P.webbed ? 'You are stuck in the web.'
      : P.held ? 'You are held fast.'
      : 'You cannot move yet.', 'c');
    return true;
  }
  if (P.conf && rnd(100) < 55) { var d = pick(DIR4); dx = d[0]; dy = d[1]; }
  if (P.held && P.heldBy && L.mons.indexOf(P.heldBy) >= 0) {
    msg('You are being held!', 'R');
    if (rnd(100) < 35) { P.held = 0; P.heldBy = null; msg('You break free.', 'y'); }
    return true;
  }
  var nx = P.x + dx, ny = P.y + dy;
  var m = monAt(L, nx, ny);
  /* Something fighting for you is not something to swing at.  Walk into
     it and the two of you change places, which is what you wanted when
     you pressed the key: to get past it, or to put it between you and
     whatever is coming. */
  if (m && m.ally) return swapWithAlly(m);
  if (m) { playerAttack(m); return true; }
  if (tileAt(nx, ny) === LOCKED) return tryUnlock(nx, ny);
  /* Feel along the stone.  A hidden door in the very square you push
     against always gives itself away - no dice, no waiting. */
  if (tileAt(nx, ny) === SDOOR) {
    L.tiles[ny * MAP_W + nx] = DOOR;
    msg('Your hand finds a seam. A hidden door!', 'y');
    computeVis();
    return true;
  }
  /* You may always walk into a hole.  Nothing else will, which is why a
     hole counts as solid ground everywhere except right here.  It is the
     one step with no way back, so it is asked rather than taken: the
     turn is not spent until you say yes. */
  if (tileAt(nx, ny) === HOLE) {
    askPlayer('Jump down the hole?', 'jump', nx, ny);
    return false;
  }
  if (!walkable(nx, ny)) return false;
  /* A barrel of powder is a barrel.  You go round it, or you set it off
     and go through where it was. */
  if (barrelAt(nx, ny)) { msg('A barrel of powder blocks the way.', '6'); return false; }
  /* With a fight on, five steps in a row without striking anything and
     you are running.  The step is still spent, but you spend it on the
     floor.  Away from a fight none of this applies: walking across an
     empty floor is just walking - and neither does a step that carries
     you towards something, which is advancing, not fleeing. */
  if (playerStumbles(dx, dy)) return true;
  P.runSteps = battleNear() ? (P.runSteps || 0) + 1 : 0;
  P.x = nx; P.y = ny;
  P.walkT = Date.now();
  /* web on the floor holds the first thing into it, and comes away */
  if (webCatches(nx, ny)) {
    P.frozen += WEB_FLOOR_HOLD;
    P.webbed = Math.max(P.webbed || 0, WEB_FLOOR_HOLD);
    msgTrap('You walk into a web.', 'c', 'stuck ' + WEB_FLOOR_HOLD, 'O');
  }
  computeVis();
  afterStep();
  return true;
}

/* Down through the floor, and possibly through the one below that. */
/* What you came down on, and what it saves you.  Returns the fraction of
   the damage it takes off, and the line to say about it. */
function softLanding(x, y) {
  var tt = tileAt(x, y);
  if (tt === WATER || tt === HOLY)
    return [SOFT_WATER, 'You come down in water. It swallows the fall.'];
  var d = L.decor[y * MAP_W + x];
  if (d && SOFT_LANDING[d]) return SOFT_LANDING[d];
  return null;
}

function fallDown() {
  var floors = FALL_MIN + rnd(FALL_MAX - FALL_MIN + 1);
  if (G.depth + floors > 26) floors = Math.max(1, 26 - G.depth);
  var dm = roll(floors, 5) + floors;
  msg('The floor gives way!', 'R');
  msg('You fall ' + floors + ' floor' + (floors > 1 ? 's' : '') + '.', 'O');
  enterLevel(G.depth + floors, 'fall');
  /* Whatever you landed on has a say in how much of that you feel. */
  var soft = softLanding(P.x, P.y);
  if (soft) {
    dm = Math.max(1, softenDamage(dm, 1 - soft[0]));
    msg(soft[1], 'G');
  }
  msgTrap(soft ? 'You land.' : 'You land hard.', 'R', dm + ' damage', 'R');
  hurtPlayer(dm, 'a long fall');
}

function tryUnlock(x, y) {
  var i = y * MAP_W + x, mat = L.locks[i];
  var name = MATS[mat];
  if (hasKey(mat)) {
    takeKey(mat);                       /* the key stays in the lock */
    L.tiles[i] = DOOR;
    delete L.locks[i];
    msg('You open the door with the ' + name + ' key.', 'y');
    computeVis();
    return true;
  }
  msg('The ' + name + ' door is locked. You need a ' + name + ' key.', 'R');
  return false;
}

function afterStep() {
  noteDarkness();
  announceRoom();
  /* Whether the plate was held down has to be settled before the thing
     holding it down is picked up, or lifting the stone is what sets the
     trap off - which is the opposite of the point of the stone. */
  var tr = trapAt(P.x, P.y);
  var pinned = trapPinned(tr);
  /* With a mouse in your hand, a thing on the floor is picked up by
     clicking it and a chest is opened by clicking it - walking over
     something does not help itself to it.  With the keyboard there is
     nothing to click with, so walking on is what picking up is. */
  if (typeof usingPointer !== 'function' || !usingPointer()) autoPickup();
  else noteUnderfoot();
  if (tr && pinned) {
    tr.found = 1;
    msgTrap('You lift it clear of the plate.', 'c', 'held', 'G');
  } else if (tr) springTrap(tr);
  var st = tileAt(P.x, P.y);
  if (st === STAIR) msg('Stairs down. Press ENTER.', 'c');
  else if (st === STAIR_UP) msg('Stairs up. Press ENTER.', 'c');
}

/* Walking into the dark, and out of it again.  Said once at the step
   that crosses the line, because the whole screen changing under you
   without a word about it reads as a bug. */
function noteDarkness() {
  var now = darkAt(P.x, P.y) ? 1 : 0;
  if (now === G.wasDark) return;
  G.wasDark = now;
  /* Coming out of the dark is only worth remarking on if the dark was
     costing you something.  Night eyes make it a change of scenery. */
  if (!now) {
    if (!nightEyes()) msg('You can see again.', 'c');
    return;
  }
  msg(nightEyes()
    ? 'It is pitch dark but you see well.'
    : 'It is pitch dark. You can barely see your own hands.',
    nightEyes() ? 'c' : 'p');
}

/* The first time you set foot in a room somebody built on purpose, the
   game says what sort of room it is.  Once only, and only for the rooms
   that are worth remarking on. */
function announceRoom() {
  var ri = roomIndexAt(P.x, P.y);
  if (ri < 0) return;
  var r = L.rooms[ri];
  if (!r || !r.special || r.told) return;
  r.told = 1;
  var lines = ROOM_ENTRY[r.special];
  if (!lines) return;
  for (var i = 0; i < lines.length; i++) msg(lines[i], i ? 'c' : 'y');
}

/* ---------------------------------------------------------- pickup */
/* Mouse in hand: say what you are standing on rather than taking it. */
function noteUnderfoot() {
  var it = itemAt(L, P.x, P.y);
  if (!it) return;
  if (it.t === 'chest')
    msg(it.seen ? 'An open chest. Click it to look.' : 'A chest. Click it to open it.', 'k');
  else if (it.t === 'gold') msg('Gold on the floor. Click it to take it.', 'y');
  else msg(cap(itemName(it)) + ' lies here. Click it to take it.', 'c');
}
function autoPickup() {
  var it = itemAt(L, P.x, P.y);
  if (!it) return;
  sound('pickup');
  if (it.t === 'gold') {
    var coin = hasPerk('scavenger') ? Math.round(it.cnt * PERK_GOLD_MULT) : it.cnt;
    P.gold += coin;
    msg('You pick up ' + coin + ' gold pieces.', 'y');
    L.items.splice(L.items.indexOf(it), 1);
    return;
  }
  /* A chest you have already been through does not fly open every time
     you walk over it - it sits there with its lid up until you say. */
  if (it.t === 'chest') {
    if (it.seen) {
      G.box = it;
      msg('An open chest. Press ENTER to look.', 'k');
      return;
    }
    G.openBox = openChest(it);
    return;
  }
  if (it.t === 'key') {
    P.keys[it.k]++;
    L.items.splice(L.items.indexOf(it), 1);
    msg('You pick up ' + artic(MATS[it.k] + ' key') + '.', 'y');
    return;
  }
  /* name what is on the floor, not the pile it joins - picking up one
     crystal when you already hold two is not "you pick up 3 crystals" */
  var picked = itemName(it);
  /* A cap of clearwater fills up if it has been lying in the water.  It
     is the only way to charge one, so it is worth saying so out loud. */
  var wetted = 0;
  if (isClearwater(it) && !it.wet) {
    var ut = tileAt(P.x, P.y);
    if (ut === WATER || ut === HOLY) { it.wet = 1; wetted = 1; }
  }
  var added = addItem(it);
  if (!added) {
    /* Nowhere to put it - but if it is something you could be wearing
       or wielding, there is one place left: on you.  Say so, and let
       ENTER make the swap. */
    if (slotFor(it)) {
      msg('Your pack is full. ENTER to put on ' + picked + '.', 'k');
      return;
    }
    msg('Your pack is full. You step over ' + picked + '.', 'R');
    return;
  }
  L.items.splice(L.items.indexOf(it), 1);
  if (it.t === 'amulet') { P.amulet = 1; msg('You take ' + picked + '!', 'y'); }
  else msg('You pick up ' + picked + '.', 'w');
  if (wetted) msg('It comes up dripping. The charge is back.', 'c');
}

/* Something on the floor you could be wearing, and no room in the pack
   to carry it.  Put it on where it lies: whatever it replaces goes down
   on the floor in its place, which is the trade you were offered. */
function wearHere() {
  var it = itemAt(L, P.x, P.y);
  if (!it || !slotFor(it)) return null;
  /* only when the pack really is full - otherwise picking it up is the
     obvious thing and it has already happened */
  if (freeSlot() >= 0) return null;
  return it;
}
function equipFromFloor(it) {
  var key = slotFor(it);
  if (!key) return false;
  var cur = P.eq[key];
  if (cur && cur.cursed) {
    msg('You cannot remove your ' + itemDef(cur).n + '. It is cursed.', 'R');
    return false;
  }
  /* both hands on the hilt of a two hander */
  var off = null;
  if (key === 'rh' && twoHanded(it) && P.eq.lh) {
    if (P.eq.lh.cursed) {
      msg('You cannot let go of your ' + itemDef(P.eq.lh).n + '. It is cursed.', 'R');
      return false;
    }
    off = P.eq.lh;
  }
  L.items.splice(L.items.indexOf(it), 1);
  P.eq[key] = it;
  if (off) { P.eq.lh = null; }
  /* Putting it on is how you find out what it is - and whether it will
     come off again. */
  it.known = 1;
  learnGear(it);
  sound('pickup');
  msg('You are now using ' + itemName(it) + '.', 'w');
  if (it.cursed) {
    /* what kind of cursed it is, settled now that it is on you */
    settleCurse(it);
    msg('You feel a malignant aura. It is cursed!', 'R');
    var cd = it.curse ? curseDef(it.curse) : null;
    if (cd) msg('A curse of ' + cd.n + '. ' + cap(cd.txt) + '.', 'R');
  }
  if (cur) {
    takeOffEffects(cur);
    if (dropNear(P.x, P.y, cur)) msg('You put down ' + itemName(cur) + '.', '6');
    else msg(cap(itemName(cur)) + ' is lost in the clutter.', 'R');
  }
  if (off && !stow(off)) dropNear(P.x, P.y, off);
  wearClearwater(it);
  return true;
}

/* Opening a chest shows you the chest, rather than reading its contents
   out at you and stuffing them into a pack that may not have room.  It
   stays where it is, lid up, so you can take what you want, come back
   for the rest, and leave behind whatever you have finished with.
   Returns the chest if it is now open for you to look in. */
function openChest(ch) {
  if (ch.lock && !ch.unlocked) {
    var name = MATS[ch.lock];
    if (!hasKey(ch.lock)) {
      msg('The ' + name + ' chest is locked. You need a ' + name + ' key.', 'R');
      return null;
    }
    takeKey(ch.lock);
    ch.unlocked = 1;
    msg('You open the chest with the ' + name + ' key.', 'y');
  } else msg(ch.seen ? 'You look in the chest.' : 'You open the chest.', 'y');
  ch.seen = 1;
  /* coins go straight in the purse - they are not one of the five things */
  if (ch.gold > 0) {
    P.gold += hasPerk('scavenger') ? Math.round(ch.gold * PERK_GOLD_MULT) : ch.gold;
    msg('There are ' + ch.gold + ' gold pieces in it.', 'y');
    ch.gold = 0;
  }
  if (!contCount(ch)) msg('There is nothing else in it.', '6');
  return ch;
}

/* ---------------------------------------------------------- traps */
/* fire something at the player from the far wall along a clear line */
/* Find a wall facing the victim and fire from it.  The victim is you
   unless somebody else stepped on the plate. */
function wallShooter(what, tx, ty) {
  if (tx === undefined) { tx = P.x; ty = P.y; }
  var best = null, i, d;
  for (i = 0; i < DIR4.length; i++) {
    for (d = 1; d <= 9; d++) {
      var x = tx + DIR4[i][0] * d, y = ty + DIR4[i][1] * d;
      if (blocksShot(x, y)) {
        if (tileAt(x, y) === WALL && d >= 2) best = [x, y];
        break;
      }
    }
    if (best) break;
  }
  if (!best) best = [tx, ty - 1];
  sound('shoot');
  G.shot = { sx: best[0], sy: best[1], ex: tx, ey: ty,
             t: beatNow(), dur: 160, col: what };
  return best;
}
/* The same wall nozzle, but what comes out of it is fire.  Every square
   between the wall and your feet is alight at once and stays alight for
   as long as it takes to read the line. */
function wallJet(tx, ty) {
  if (tx === undefined) { tx = P.x; ty = P.y; }
  var best = null, i, d;
  for (i = 0; i < DIR4.length; i++) {
    for (d = 1; d <= 9; d++) {
      var x = tx + DIR4[i][0] * d, y = ty + DIR4[i][1] * d;
      if (blocksShot(x, y)) {
        if (tileAt(x, y) === WALL && d >= 2) best = [x, y, DIR4[i][0], DIR4[i][1]];
        break;
      }
    }
    if (best) break;
  }
  if (!best) best = [tx, ty - 1, 0, -1];
  /* from the nozzle back down the line to the square you are standing on */
  var path = [], px = best[0], py = best[1];
  for (i = 0; i < 12; i++) {
    px -= best[2]; py -= best[3];
    path.push([px, py]);
    if (px === tx && py === ty) break;
  }
  G.bolt = { path: path, kind: 'fire', mode: 'beam',
             dir: [-best[2], -best[3]], t: beatNow() };
  sound('boom');
  return best;
}

/* a drifting cloud that sits on a few squares for a handful of turns */
/* Fire runs from square to square while the luck holds.  The square it
   lands on always catches; each square joined to a burning one catches
   seven times in ten, and every fire burns out after a turn or four. */
function spawnFire(fx, fy) {
  /* a naked flame and a barrel of powder settle it between themselves */
  /* a naked flame and a barrel of powder settle it between themselves */
  if (barrelAt(fx, fy)) { lightBarrel(fx, fy); return 1; }

  var seen = {}, open = [[fx, fy]], made = 0;
  seen[fy * MAP_W + fx] = 1;
  while (open.length && made < FIRE_MAX_CELLS) {
    var c = open.shift();
    /* fire crosses the floor, not the water: a pool stops it dead */
    if (!walkable(c[0], c[1]) || inWater(c[0], c[1])) continue;
    if (barrelAt(c[0], c[1])) { lightBarrel(c[0], c[1]); continue; }
    L.clouds.push({ x: c[0], y: c[1], kind: 'fire',
                    turns: FIRE_TURNS_MIN + rnd(FIRE_TURNS_MAX - FIRE_TURNS_MIN + 1) });
    made++;
    for (var d = 0; d < 4; d++) {
      var nx = c[0] + DIR4[d][0], ny = c[1] + DIR4[d][1], k = ny * MAP_W + nx;
      if (seen[k] || !walkable(nx, ny)) continue;
      if (rnd(100) >= FIRE_SPREAD_PCT) { seen[k] = 1; continue; }
      seen[k] = 1;
      open.push([nx, ny]);
    }
  }
  G.splash = { cells: [[fx, fy]], t: beatNow(), kind: 'blast' };
  sound('boom');
  return made;
}

/* Gas billows: it goes round corners as readily as along them, so it
   spreads eight ways and always finds at least one diagonal.  Every
   square holds it for its own length of time, so the cloud frays at the
   edges instead of vanishing all at once. */
function spawnCloud(cx, cy, kind, turns, at) {
  var cells = [[cx, cy]], seen = {}, open = [[cx, cy]], i, d;
  seen[cy * MAP_W + cx] = 1;
  var want = GAS_CELLS_MIN + rnd(GAS_CELLS_MAX - GAS_CELLS_MIN + 1);

  /* one diagonal from the source, so it never comes out a neat cross */
  var diag = DIAG4.slice();
  shuffle(diag);
  for (i = 0; i < diag.length; i++) {
    var dx = cx + diag[i][0], dy = cy + diag[i][1];
    var dk = dy * MAP_W + dx;
    if (seen[dk] || !walkable(dx, dy)) continue;
    seen[dk] = 1; cells.push([dx, dy]); open.push([dx, dy]);
    break;
  }

  while (open.length && cells.length < want) {
    var c = open.splice(rnd(open.length), 1)[0];
    var dirs = DIR8.slice();
    shuffle(dirs);
    for (d = 0; d < dirs.length; d++) {
      var nx = c[0] + dirs[d][0], ny = c[1] + dirs[d][1];
      var k = ny * MAP_W + nx;
      if (seen[k] || !walkable(nx, ny)) continue;
      seen[k] = 1;
      cells.push([nx, ny]); open.push([nx, ny]);
      if (cells.length >= want) break;
    }
  }

  for (i = 0; i < cells.length; i++) {
    /* the given lifetime is a guide; each square keeps its own */
    var life = turns ? Math.max(1, turns + rnd(3) - 1)
                     : GAS_TURNS_MIN + rnd(GAS_TURNS_MAX - GAS_TURNS_MIN + 1);
    /* `at` is the moment it should be there to see.  A creature's whole
       turn is worked out in one go and played back afterwards, so gas
       from a flask that is still in the air has to wait for it to land -
       it used to boil up before the flask left her hand. */
    L.clouds.push({ x: cells[i][0], y: cells[i][1], kind: kind, turns: life,
                    seed: rnd(1000), at: at || 0 });
  }
  return cells.length;
}

function cloudAt(x, y) {
  for (var i = 0; i < L.clouds.length; i++)
    if (L.clouds[i].x === x && L.clouds[i].y === y) return L.clouds[i];
  return null;
}

/* A trap set off from across the room, by something thrown onto it.
   It is revealed, it is spent if it only works once, and it does
   whatever it does to the square it is on - but not to you, because you
   are not standing on it.  That is the whole point of throwing a stone
   at a suspicious flagstone. */
/* Whoever stands on the line from a to b, the far end included and the
   near end - the wall the shot comes out of - left out.  firstInLine
   answers the same question for a trap you set off by standing on it,
   where you are the far end and cannot be in your own way; a trap sprung
   by a thrown stone has no victim of its own, so the shot simply takes
   the first thing it meets, and the plate itself is fair game. */
function firstOnLine(a, b) {
  var x0 = a[0], y0 = a[1], x1 = b[0], y1 = b[1];
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy, x = x0, y = y0, guard = 0;
  while (guard++ < 40) {
    var e2 = err + err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
    if (x === P.x && y === P.y) return P;
    var m = monAt(L, x, y);
    if (m) return m;
    if (x === x1 && y === y1) return null;
  }
  return null;
}
/* A trap that shoots, sprung from across the room.  Whatever the shot
   meets on its way to the plate takes it - and that includes you, if you
   were standing in the line when you threw the stone. */
function trapCatches(src, tr) {
  if (!src) return 0;
  var who = firstOnLine(src, [tr.x, tr.y]);
  if (!who) return 0;
  if (who !== P) { shotCatches(who, tr, src); return 1; }
  /* you are in the way of it */
  if (rnd(100) < dodgeChance() + 10) {
    msgTrap('It comes at you. You throw yourself flat.', 'c', 'dodged', 'G');
    return 1;
  }
  var dm = tr.k.k === 'flame' ? roll(2, 6) : roll(1, 6);
  markHurt(P, src[0], src[1]);
  msgTrap(tr.k.k === 'flame' ? 'The jet washes over you!' : 'It catches you in the line of it!',
    'R', dm + (tr.k.k === 'flame' ? ' burn' : ' damage'), 'R');
  hurtPlayer(dm, tr.k.n);
  return 1;
}

function springFromAfar(tr) {
  if (!tr) return 0;
  tr.found = 1;
  if (tr.spent) { msg('A sprung ' + tr.k.n + '. Nothing happens.', '4'); return 0; }
  if (!tr.k.reusable) tr.spent = 1;
  var here = { x: tr.x, y: tr.y };
  switch (tr.k.k) {
    case 'flame': {
      var fsrc = wallJet(tr.x, tr.y);
      msg('A jet of flame roars across the square.', 'O');
      trapCatches(fsrc, tr);
      break;
    }
    case 'arrow': case 'shooter': case 'dart': {
      var ssrc = wallShooter(tr.k.k === 'dart' ? '#93bd27' : '#c3ccd9', tr.x, tr.y);
      msg('Something shoots out across the square.', 'y');
      trapCatches(ssrc, tr);
      break;
    }
    case 'gas':
      spawnCloud(tr.x, tr.y, 'poison',
        GAS_TURNS_MIN + rnd(GAS_TURNS_MAX - GAS_TURNS_MIN + 1));
      msg('Green vapour boils up over there.', 'g');
      break;
    case 'sleep':
      msg('A strange white mist rises over there.', 'P');
      break;
    case 'alarm': {
      var woke = 0;
      for (var ai = 0; ai < L.mons.length; ai++) {
        var am = L.mons[ai];
        if (am.ally || am.state === 2) continue;
        am.state = 2; am.lost = 0; woke++;
      }
      msg('A horn sounds. ' + (woke ? woke + ' answer it.' : 'Nothing answers.'),
        woke ? 'R' : '6');
      break;
    }
    case 'spike':
      msg('The floor opens onto spikes.', 'O');
      break;
    case 'bear':
      msg('The jaws snap shut on nothing.', 'y');
      break;
    default:
      msg('The ' + tr.k.n + ' goes off with nobody on it.', 'y');
  }
  return 1;
}

/* Something lying on a trap holds the plate down.  A stone thrown onto
   one sets it off, and if the trap is the sort that resets, the stone is
   still sitting on it afterwards - so the next thing along walks over a
   plate that is already pressed. */
function trapPinned(tr) {
  return !!(tr && !tr.spent && itemAt(L, tr.x, tr.y));
}
/* The first creature standing on the line from a to b, not counting
   whatever is standing at either end. */
function firstInLine(a, b) {
  var x0 = a[0], y0 = a[1], x1 = b[0], y1 = b[1];
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy, x = x0, y = y0, guard = 0;
  while (guard++ < 40) {
    var e2 = err + err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
    if (x === x1 && y === y1) return null;
    var m = monAt(L, x, y);
    if (m) return m;
  }
  return null;
}
/* Something else took it.  The trap is sprung either way - the plate has
   been stepped on - but the dart never reached the far end. */
function shotCatches(m, tr, src) {
  G.shot = { sx: src[0], sy: src[1], ex: m.x, ey: m.y,
             t: beatNow(), dur: 160, col: tr.k.k === 'dart' ? '#93bd27' : '#c3ccd9' };
  beatWait(160);
  var dm = tr.k.k === 'flame' ? roll(2, 6) : roll(1, 6);
  m.hp -= dm; m.state = 2; m.disguise = 0;
  markHurt(m, src[0], src[1]);
  if (tr.k.k === 'flame') igniteMon(m, 'It catches light.');
  if (m.hp <= 0) killMonster(m, false, dm + (tr.k.k === 'flame' ? ' burn' : ' damage'));
  else msgFight(fightLine('', cap(monShort(m)), ' is caught in the way.'), 'O',
    dm + (tr.k.k === 'flame' ? ' burn' : ' damage'), 'O', m);
}

function springTrap(tr) {
  tr.found = 1;
  if (tr.spent) { msgTrap('A sprung ' + tr.k.n + '.', '4', 'spent', '4'); return; }
  if (trapPinned(tr)) return;                 /* something is holding it down */
  if (!tr.k.reusable) tr.spent = 1;

  /* Whatever it throws, it throws - whether or not it catches you.  The
     arrow used to be drawn only on the cases that happened to remember
     to, and never at all if you ducked, so a trap you dodged looked like
     nothing had happened. */
  var src = null;
  if (tr.k.shoots) {
    src = (tr.k.k === 'flame') ? wallJet()
        : wallShooter(tr.k.k === 'dart' ? '#93bd27' : '#c3ccd9');
    /* It comes out of a wall and travels to the square that set it off.
       Anything standing in between is in the way of it, and the way of
       it is the whole line - so a spider between you and the nozzle
       takes the dart instead of you. */
    var caught = firstInLine(src, [P.x, P.y]);
    if (caught) { shotCatches(caught, tr, src); return; }
  }
  /* anything that shoots at you can be ducked */
  if (tr.k.shoots && rnd(100) < dodgeChance() + 10) {
    msgTrap('You throw yourself flat.', 'c', 'dodged', 'G');
    return;
  }
  var dm;
  switch (tr.k.k) {
    case 'bear':
      dm = rnd(4) + 2;
      msgTrap('You are caught in a bear trap.', 'R', 'held ' + dm, 'O');
      P.frozen += dm;
      break;
    case 'sleep':
      dm = rnd(5) + 3;
      msgTrap('A strange white mist rises.', 'P', 'asleep ' + dm, 'O');
      P.frozen += dm;
      break;
    case 'arrow':
      if (swing(6, playerAC(), 0)) {
        dm = roll(1, 6);
        markHurt(P, src ? src[0] : P.x, src ? src[1] : P.y - 1);
        msgTrap('An arrow shoots out at you!', 'R', dm + ' damage', 'R');
        hurtPlayer(dm, 'an arrow trap');
      } else msgTrap('An arrow shoots past you.', 'y', 'missed', '6');
      break;
    case 'dart':
      if (swing(6, playerAC(), 0)) {
        dm = roll(1, 4);
        if (src) markHurt(P, src[0], src[1]);
        var wk = !hasProp('sustain strength');
        msgTrap('A dart hits your shoulder.', 'R',
          dm + ' dmg' + (wk ? ', Str-1' : ''), 'R');
        hurtPlayer(dm, 'a dart trap');
        if (wk && !hasPerk('ironblood')) P.str = Math.max(3, P.str - 1);
      } else msgTrap('A dart whizzes past your ear.', 'y', 'missed', '6');
      break;
    case 'spike':
      dm = roll(2, 5);
      msgTrap('The floor opens onto spikes!', 'R', dm + ' damage', 'R');
      P.frozen += rnd(3) + 1;
      hurtPlayer(dm, 'a spike pit');
      break;
    case 'shooter':
      if (swing(8, playerAC(), 0)) {
        markHurt(P, src[0], src[1]);
        dm = roll(2, 4);
        var poi = !hasProp('sustain strength') && rnd(100) < 45;
        msgTrap('A shutter snaps open in the wall!', 'R',
          dm + ' dmg' + (poi ? ', Str-1' : ''), 'R');
        if (poi && !hasPerk('ironblood')) P.str = Math.max(3, P.str - 1);
        hurtPlayer(dm, 'a dart shooter');
      } else msgTrap('A shutter snaps open in the wall!', 'R', 'missed', '6');
      break;
    case 'gas':
      msgTrap('Green vapour boils up!', 'g', 'poison cloud', 'g');
      spawnCloud(P.x, P.y, 'poison', GAS_TURNS_MIN + rnd(GAS_TURNS_MAX - GAS_TURNS_MIN + 1));
      break;
    case 'flame': {
      /* It is fire, so it is drawn as fire - the whole run of squares
         from the nozzle to your feet, alight - rather than the thin dash
         of an arrow sliding down the line. */
      dm = roll(2, 6);
      markHurt(P, src[0], src[1]);
      msgTrap('A jet of flame roars past!', 'R', dm + ' damage', 'R');
      hurtPlayer(dm, 'a flame jet', 'fire');
      break;
    }
    case 'alarm': {
      var woke = 0;
      for (var ai = 0; ai < L.mons.length; ai++) {
        var am = L.mons[ai];
        if (am.ally || am.state === 2) continue;
        am.state = 2; am.lost = 0; woke++;
      }
      msgTrap('A rune flares and a horn sounds!', 'R',
        woke ? woke + ' awake' : 'silence', woke ? 'O' : '6');
      break;
    }
    case 'rust': {
      var bd = P.eq.body, rusted = 0;
      if (bd && !bd.protected && ARMORS[bd.k].n.indexOf('leather') < 0) {
        bd.ap--; rusted = 1;
      }
      msgTrap('A gush of water hits your head.', 'B',
        rusted ? 'armor -1' : 'no harm', rusted ? 'R' : '6');
      soakPlayer('It burns like acid.');
      break;
    }
  }
}

/* A monster treading on the same plate.  It gets the same dungeon, not a
   softer one: the only creatures that skim over floor plates are the ones
   that never touch the floor. */
function monTrap(m, tr) {
  if (m.def.fly) return;
  if (tr.spent) return;
  tr.found = 1;                 /* watching it go off tells you it is there */
  if (!tr.k.reusable) tr.spent = 1;
  var seen = canSeeMon(m), who = cap(monShort(m)), dm = 0;

  function hit(d, note) {
    m.hp -= d;
    if (seen) msgTrap(who + ' ' + note, 'O', d + ' damage', 'R');
    if (m.hp <= 0) {
      /* the dungeon killed it, so the dungeon keeps the experience */
      killMonster(m, 0);
      if (seen) msgTrap(who + ' is killed by the trap.', 'G', 'slain', 'y');
    }
  }

  switch (tr.k.k) {
    case 'bear':
      m.stuck += rnd(4) + 2;
      if (seen) msgTrap(who + ' is caught in a bear trap.', 'O', 'held ' + m.stuck, 'y');
      break;
    case 'sleep':
      m.stuck += rnd(5) + 3; m.state = 0; m.lost = 0;
      if (seen) msgTrap(who + ' slumps into a white mist.', 'P', 'asleep', 'y');
      break;
    case 'arrow': hit(roll(1, 6), 'takes an arrow.'); break;
    case 'dart': hit(roll(1, 4), 'takes a dart.'); break;
    case 'shooter':
      wallShooter('#c3ccd9', m.x, m.y);
      hit(roll(2, 4), 'is struck by a dart.');
      break;
    case 'spike': hit(roll(2, 5), 'falls onto spikes.'); break;
    case 'flame':
      wallShooter('#f59e0b', m.x, m.y);
      hit(roll(2, 6), 'is caught in the flames.');
      break;
    case 'gas':
      spawnCloud(m.x, m.y, 'poison',
        GAS_TURNS_MIN + rnd(GAS_TURNS_MAX - GAS_TURNS_MIN + 1), beatNow());
      hit(roll(1, 5), 'chokes on green vapour.');
      break;
    case 'alarm': {
      var woke = 0;
      for (var ai = 0; ai < L.mons.length; ai++) {
        var am = L.mons[ai];
        if (am.ally || am.state === 2) continue;
        am.state = 2; am.lost = 0; woke++;
      }
      msgTrap('A horn sounds somewhere below.', 'R',
        woke ? woke + ' awake' : 'silence', woke ? 'O' : '6');
      break;
    }
    case 'rust':
      if (seen) msgTrap(who + ' is doused with water.', 'B', 'no harm', '6');
      break;
  }
}

/* ---------------------------------------------------------- stairs */
function useStairs() {
  var t = tileAt(P.x, P.y);

  /* the way back up - never above the floor you started on */
  if (t === STAIR_UP) {
    if (G.depth <= 1) {
      if (P.amulet) { G.mode = 'win'; return false; }
      msg('The staircase has collapsed. You cannot get out!', 'R');
      return false;
    }
    enterLevel(G.depth - 1, 'up');
    msg('You climb up to floor ' + floorName() + '.', 'c');
    return true;
  }

  if (t !== STAIR) return false;
  if (P.amulet && G.depth === 1) { G.mode = 'win'; return false; }
  enterLevel(G.depth + 1, 'down');
  msg('You descend to floor ' + floorName() + '.', 'c');
  return true;
}

/* ---------------------------------------------------------- equipment */
/* Put something back in the pack, or on the floor if there is no room. */
/* Put something away.  A full pack is not the end of it: a pouch is
   there to be used, and dropping a breastplate on the floor because the
   twenty-first square was taken is not what anybody wanted.  Returns
   true if it really did end up on the ground. */
function stow(it, why) {
  var hadRoom = freeSlot() >= 0;
  var got = addItem(it);
  if (got) {
    if (!hadRoom) msg('Your pack is full - it goes in the pouch.', 'w');
    return false;
  }
  dropNear(P.x, P.y, it);
  msg('No room anywhere - you drop ' + itemName(it) + '.', 'O');
  return true;
}

/* Take something off and put it away.  The work lives here rather than
   in the screen that asks for it, so the same path is what the tests
   exercise.  Returns false if it is cursed and stayed put. */
function unequipTo(it) {
  if (!it) return false;
  var key = null, i;
  for (i = 0; i < EQ_ORDER.length; i++) if (P.eq[EQ_ORDER[i]] === it) key = EQ_ORDER[i];
  if (!key) return false;
  if (it.cursed) { it.known = 1; msg('You cannot. It is cursed.', 'R'); return false; }
  P.eq[key] = null;
  takeOffEffects(it);
  if (stow(it)) return true;                 /* it went on the floor */
  msg('You put away ' + itemName(it) + '.', 'w');
  return true;
}

function equipTo(key, it) {
  if (P.eq[key] === it) { msg('You are already using that.', '6'); return false; }
  if (!slotAccepts(key, it)) {
    msg(slotWhyNot(key, it), 'R');
    return false;
  }
  var cur = P.eq[key];
  if (cur && cur.cursed) {
    msg('You cannot remove your ' + itemDef(cur).n + '. It is cursed.', 'R');
    return false;
  }
  /* Both hands go on the hilt of a two hander, so the off hand empties. */
  var off = null;
  if (key === 'rh' && twoHanded(it) && P.eq.lh) {
    if (P.eq.lh.cursed) {
      msg('You cannot let go of your ' + itemDef(P.eq.lh).n + '. It is cursed.', 'R');
      return false;
    }
    off = P.eq.lh;
  }
  removeItem(it, it.cnt);        /* detach from wherever it was */
  P.eq[key] = it;
  if (off) {
    P.eq.lh = null;
    msg('You need both hands. You put away ' + itemName(off) + '.', 'y');
    stow(off);
  }
  if (cur) stow(cur);
  /* Putting it on tells you its weight: what it is worth, and whether it
     will come off again.  Not what it is called - a blade in the hand is
     a good blade or a poor one long before you can name it - and not
     what is worked into it.  Those come from studying it or from a
     scroll read over it. */
  msg('You are now using ' + itemName(it) + '.', 'w');
  if (it.cursed) {
    settleCurse(it);
    msg('You feel a malignant aura. It is cursed!', 'R');
    var cdef = it.curse ? curseDef(it.curse) : null;
    if (cdef) msg('A curse of ' + cdef.n + '. ' + cap(cdef.txt) + '.', 'R');
  }
  if (cur) takeOffEffects(cur);
  wearClearwater(it);
  return true;
}
function autoEquip(it) {
  var key = slotFor(it);
  if (!key) { msg('You cannot wear or wield that.', 'R'); return false; }
  return equipTo(key, it);
}

/* ---------------------------------------------------------- eating */
function eat(it) {
  var F = FOODS[it.k];
  P.food += F.feed[0] + rnd(F.feed[1]);
  if (P.food > FOOD_MAX) P.food = FOOD_MAX;
  /* A snack takes the edge off but does not reset the clock the way a
     meal does - you are still peckish afterwards. */
  if (F.feed[0] >= 700) G.hungerState = 0;
  else if (G.hungerState > 0) G.hungerState--;
  msg(F.line, F.col || 'G');
  removeItem(it, 1);
  return true;
}

/* ---------------------------------------------------------- potions */
function quaff(it) {
  var k = it.k, n = POTIONS[k].n, id = 1;
  removeItem(it, 1);
  switch (n) {
    case 'confusion': msg("Wait, what's going on? Huh? What? Who?", 'P'); P.conf += rnd(8) + 12; break;
    case 'hallucination': msg('Oh wow, everything seems so cosmic!', 'P'); P.hallu += rnd(200) + 100; break;
    case 'poison':
      msg('You feel very sick now.', 'g');
      if (!hasProp('sustain strength') && !hasPerk('ironblood'))
        P.str = Math.max(3, P.str - (rnd(3) + 1));
      hurtPlayer(rnd(3), 'a poison potion', 'poison');
      break;
    case 'gain strength':
      if (P.str < 31) P.str++;
      if (P.str > P.mstr) P.mstr = P.str;
      msg('You feel stronger. What bulging muscles!', 'G'); break;
    case 'gain dexterity':
      if (P.dex < 22) P.dex++;
      if (P.dex > P.mdex) P.mdex = P.dex;
      msg('You feel lighter on your feet.', 'G'); break;
    case 'gain wisdom':
      if (P.wis < 22) P.wis++;
      if (P.wis > P.mwis) P.mwis = P.wis;
      msg('The world seems to hold fewer secrets.', 'G'); break;
    case 'see invisible': msg('This tastes like slime mold juice.', 'c'); P.seeinv += 400; break;
    case 'fire shield': lightFireShield(); break;
    case 'healing':
      var hb1 = P.hp, hm1 = P.mhp;
      P.hp += roll(P.lv, 4);
      if (P.hp > P.mhp) { P.mhp++; P.hp = P.mhp; }
      holdHp(hb1, hm1);
      P.blind = 0; msg('You begin to feel better.', 'G'); break;
    case 'extra healing':
      var hb2 = P.hp, hm2 = P.mhp;
      P.hp += roll(P.lv, 8);
      if (P.hp > P.mhp) { P.mhp += 2; P.hp = P.mhp; }
      holdHp(hb2, hm2);
      P.blind = 0; msg('You begin to feel much better.', 'G'); break;
    case 'liquid fire': {
      /* it was meant to be thrown */
      var fd = perkElemental(roll(FIRE_DAMAGE[0], FIRE_DAMAGE[1]) + 2, 'fire');
      msgTrap('It goes down burning!', 'R', fd + ' damage', 'R');
      spawnFire(P.x, P.y);
      hurtPlayer(fd, 'a flask of liquid fire', 'fire');
      break;
    }
    /* Not a roll-call of the floor - a sense of what is moving close by.
       It reaches through stone, but only as far as MONSIGHT_RANGE, and it
       shows creatures and nothing else: no chest, no scroll, no square of
       floor you have not walked. */
    case 'monster sight':
      P.monsight = Math.max(P.monsight || 0, MONSIGHT_TURNS);
      msg('You feel every living thing that moves nearby.', 'P');
      break;
    case 'magic detection': {
      var any = false;
      for (var i = 0; i < L.items.length; i++) {
        var o = L.items[i];
        if (o.t === 'potion' || o.t === 'scroll' || o.t === 'wand' || o.t === 'amulet' || o.t === 'chest') {
          /* this one is about the things themselves, so the square stops
             being a bare line on a map and shows what is on it */
          var mj = o.y * MAP_W + o.x;
          L.flags[mj] = (L.flags[mj] | F_SEEN) & ~F_MAP; any = true;
        }
      }
      if (any) msg('You sense the presence of magic.', 'P');
      else { msg('You have a strange feeling for a moment.', '6'); id = 0; }
      break;
    }
    case 'raise level':
      P.exp = E_LEVELS[P.lv - 1] || P.exp;
      msg('You suddenly feel much more skillful.', 'c');
      checkLevelUp(); break;
    case 'haste self': msg('You feel yourself moving much faster.', 'c'); P.haste += rnd(4) + 11; break;
    case 'restore ability':
      P.str = P.mstr; P.dex = P.mdex; P.wis = P.mwis;
      msg('Hey, this tastes great! You feel warm all over.', 'G');
      /* Sight is an ability like any other, and nothing else in the game
         gives it back to you before it wears off on its own. */
      if (P.blind) { P.blind = 0; msg('The darkness lifts from your eyes.', 'G'); }
      break;
    case 'blindness': msg('A cloak of darkness falls around you.', 'p'); P.blind += rnd(40) + 250; break;
    case 'thirst quenching': msg('This potion tastes extremely dull.', '6'); break;
    case 'nourishment':
      P.food = Math.min(FOOD_MAX, P.food + POTION_FEED[0] + rnd(POTION_FEED[1]));
      if (G.hungerState > 0) G.hungerState--;
      msg('Thick and filling. That will hold you a while.', 'G'); break;
    /* Drinking either of these is a waste of a good flask.  Water is
       water; the blessed sort settles the head a little, which is worth
       something but not what it is really for. */
    case 'water': msg('It is water. Cold, and nothing else.', '6'); break;
    case 'holy water':
      msg('Clear and cold. Your head clears with it.', 'c');
      P.conf = 0; P.hallu = 0; P.blind = 0;
      healPlayer(roll(1, 4));
      break;
  }
  if (id) KNOWN.pot[k] = 1;
  computeVis();
  return true;
}

/* Light the ring.  Whatever is already standing beside you is standing
   in it the moment it catches. */
function lightFireShield() {
  P.fireShield = FIRE_SHIELD_TURNS;
  var lit = fireShieldCells().length;
  fireShieldBurn();                /* whatever is already beside you */
  msg('A ring of fire shields you!', 'O');
  sound('boom');
  G.splash = { cells: (function () {
    var c = [], d;
    for (d = 0; d < 8; d++) c.push([P.x + DIR8[d][0], P.y + DIR8[d][1]]);
    return c;
  })(), t: beatNow(), kind: 'blast' };
  if (!lit) msg('There is nowhere for it to burn.', '6');
  return true;
}

/* ---------------------------------------------------------- scrolls */
function readScroll(it) {
  if (P.blind) { msg('You are blind and cannot read.', 'R'); return false; }
  /* The squib reads the words perfectly well.  Nothing answers them. */
  if (squibbed('scroll')) return false;
  var k = it.k, n = SCROLLS[k].n, id = 1, i;
  var used = spendUse(it);
  if (!used) msg('The words fade but the parchment holds.', 'c');
  switch (n) {
    case 'monster confusion': P.confuseTouch = 1; msg('Your hands begin to glow red.', 'R'); break;
    /* A map of the floor as the people who built it knew it.  What was
       walled up on purpose is not on it - a vault with no door and the
       chamber behind a secret door are secrets the map does not tell,
       and it leaves the seam in the wall a seam.  Nor does it list what
       is lying about: you learn the shape of the rooms and where the
       chests stand, and find the rest by walking. */
    case 'magic mapping': {
      msg('This scroll has a map on it.', 'c');
      var hush = {}, ri, rf;
      for (ri = 0; ri < L.rooms.length; ri++) {
        var rm = L.rooms[ri];
        if (rm.gone || !rm.sealed) continue;
        for (rf = 0; rf < rm.floors.length; rf++)
          hush[rm.floors[rf][1] * MAP_W + rm.floors[rf][0]] = 1;
      }
      for (i = 0; i < L.tiles.length; i++) {
        if (L.tiles[i] === ROCK || L.tiles[i] === SDOOR) continue;
        if (hush[i] || (L.sealed && L.sealed[i])) continue;
        L.flags[i] |= F_SEEN | F_MAP;
      }
      break;
    }
    case 'hold monster': {
      /* It used to reach a diamond five squares across, which is a good
         deal smaller than a room: read it with three spiders across the
         floor from you and it announced that the monsters around you had
         frozen while they walked up and ate you.  It holds what is in
         your field of view - the same reach as the rest of the spell
         book - so what the line says is what you can watch happen. */
      var c = 0;
      for (i = 0; i < L.mons.length; i++) {
        var m = L.mons[i];
        if (!(L.flags[m.y * MAP_W + m.x] & F_VIS)) continue;
        if (m.ally) continue;                    /* not your own spider */
        m.held = rnd(10) + 8; c++;
      }
      msg(c ? (c === 1 ? 'It freezes where it stands.' : 'The monsters around you freeze.')
            : 'You feel a strange sense of loss.', c ? 'c' : '6');
      if (!c) id = 0;
      break;
    }
    case 'sleep': msg('You fall asleep.', 'p'); P.frozen += rnd(5) + 4; break;
    case 'fire shield': lightFireShield(); break;
    case 'charging':
    case 'return':
    case 'remove curse':
    case 'enchantment': case 'greater enchantment': case 'malediction':
    case 'protect armor':
    case 'identify':
      msg('The parchment waits for you to choose something.', 'c');
      G.queuePick = { kind: n, k: k };
      return true;                       /* identified only after the pick */
    case 'scare monster': msg('You hear maniacal laughter in the distance.', 'p'); P.scare += rnd(10) + 10; break;
    case 'teleportation': teleportPlayer(); msg('You feel a wrenching sensation in your gut.', 'P'); break;
    case 'create monster': {
      var spots = [];
      for (i = 0; i < DIR4.length; i++) {
        var xx = P.x + DIR4[i][0], yy = P.y + DIR4[i][1];
        if (walkable(xx, yy) && !monAt(L, xx, yy)) spots.push([xx, yy]);
      }
      if (spots.length) {
        var s = pick(spots);
        var nm = mkMonster(randMonsterChar(G.depth), G.depth, s[0], s[1]);
        nm.state = 2; nm.disguise = 0; L.mons.push(nm);
        msg('A monster appears beside you!', 'R');
      } else { msg('You hear a faint cry of anguish.', '6'); id = 0; }
      break;
    }

    case 'summon aid': {
      var made = summonAid(1 + rnd(3));
      if (made) msg(made + ' shape' + (made > 1 ? 's step' : ' steps') + ' from the air to fight for you!', 'G');
      else { msg('Something tries to arrive and cannot.', '6'); id = 0; }
      break;
    }
    case 'aggravate monsters':
      msg('You hear a high pitched humming noise.', 'R');
      L.mons.forEach(function (m2) { m2.state = 2; });
      break;
    case 'light':
      lightTheRoom('The room floods with light.', 'The corridor glows and then fades.');
      break;
    case 'blank paper': msg('This scroll seems to be blank.', '6'); break;
  }
  if (id) KNOWN.scr[k] = 1;
  computeVis();
  return true;
}

/* ------------------------------------------------------- dynamite
   The only thing in the game that changes the shape of the dungeon.  It
   clears the four squares around where it lands: creatures there are
   badly hurt, and stone there stops being stone.

   Opening a wall onto the rock beyond would show you the void, so any
   square that is bared and has nothing walkable behind it simply
   becomes the new wall - the dungeon grows a fresh face rather than a
   hole into nothing.  Blowing into one of the sealed vaults is the
   whole point, so those are opened up properly and stop being sealed. */
/* ------------------------------------------------------ powder barrels
   A barrel is a stick of dynamite you did not have to carry, sitting
   where somebody left it.  Setting one off sets off its neighbours, and
   theirs - which is either a tunnel through several walls or the last
   mistake you make, depending entirely on where you are standing. */
function barrelAt(x, y) {
  return !!(L.barrels && L.barrels[y * MAP_W + x]);
}
/* Fire has reached a barrel.  It does not go up on the spot: the powder
   catches, and a turn later the barrel does - which is one turn to get
   out of the room, and the difference between a trap and a decision.

   Every fire in the game comes through here: a flask, a jet from a
   trap, a burning stone, the trail behind something running while it
   burns.  Only the flask used to, so lighting a powder room with a
   burning stone did nothing at all. */
function lightBarrel(x, y) {
  if (!barrelAt(x, y)) return 0;
  var k = y * MAP_W + x;
  if (!L.fuses) L.fuses = {};
  if (L.fuses[k]) return 0;                 /* already burning */
  L.fuses[k] = BARREL_FUSE + 1;             /* ticked down at the turn's end */
  if (L.flags[k] & F_SEEN) msg('The powder catches. Get back!', 'R');
  return 1;
}
/* One turn of every fuse on the floor.  Collected first and acted on
   after, because a barrel going up lights others and moving the list
   about underneath the loop is how a chain reaction hangs. */
function tickFuses() {
  if (!L.fuses) return 0;
  var due = [], k;
  for (k in L.fuses) {
    L.fuses[k]--;
    if (L.fuses[k] <= 0) due.push(k | 0);
  }
  for (var i = 0; i < due.length; i++) {
    delete L.fuses[due[i]];
    blowBarrel(due[i] % MAP_W, (due[i] / MAP_W) | 0);
  }
  return due.length;
}
/* One barrel, going up.  Two squares in every direction: creatures,
   walls, and any barrel it reaches, which lights and follows a turn
   later. */
function blowBarrel(bx, by) {
  var k = by * MAP_W + bx;
  delete L.barrels[k];
  delete L.decor[k];
  /* A disc, not a box.  Two squares straight out and one on the
     diagonals: a blast that reached the same distance into the corners
     as it did along the walls looked like a stamped square, and put the
     far corner of a room inside a radius the near wall was not. */
  var cells = [], x, y, lit = 0;
  for (y = by - BARREL_BLAST; y <= by + BARREL_BLAST; y++)
    for (x = bx - BARREL_BLAST; x <= bx + BARREL_BLAST; x++) {
      if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
      var ox = x - bx, oy = y - by;
      if (ox * ox + oy * oy > BARREL_BLAST_SQ) continue;
      cells.push([x, y]);
    }
  G.splash = { cells: cells.slice(), t: beatNow(), kind: 'blast' };
  sound('boom');
  msgTrap('A barrel of powder goes up!', 'R', 'blast', 'R');
  /* the neighbours catch before the blast clears them away */
  for (var i = 0; i < cells.length; i++)
    if (barrelAt(cells[i][0], cells[i][1])) lit += lightBarrel(cells[i][0], cells[i][1]);
  for (i = 0; i < cells.length; i++) blastSquare(cells[i][0], cells[i][1], BARREL_DAMAGE);
  /* give the new opening a face, the way dynamite does */
  faceTheRock(cells);
  /* and the squares it opened join the room they opened into, or they
     are drawn as though the wall were still standing there */
  adoptOpened(L, cells);
  buildLitMap(L); buildDarkMap(L, G.depth); spillLight(L);
  computeVis();
  return 1;
}

function blastSquare(x, y, dmg) {
  if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) return;
  var j = y * MAP_W + x, t = L.tiles[j];
  if (t !== BARS &&
      (t === WALL || t === ROCK || t === SDOOR || t === DOOR || t === LOCKED)) {
    L.tiles[j] = FLOOR;
    delete L.locks[j];
  }
  delete L.sealed[j];
  var m = monAt(L, x, y);
  if (m) {
    var d1 = roll(dmg[0], dmg[1]);
    m.hp -= d1; m.state = 2; m.disguise = 0;
    markHurt(m, x, y);
    if (m.hp <= 0) killMonster(m, true, d1 + ' blasted');
    else msgFight(fightLine('', cap(monShort(m)), ' is caught in it.'),
      'O', d1 + ' blast', 'O', m);
  }
  if (P.x === x && P.y === y) {
    var self = roll(dmg[0], dmg[1]);
    markHurt(P, x, y);
    msgTrap('The blast catches you!', 'R', self + ' damage', 'R');
    hurtPlayer(self, 'a powder barrel');
  }
}

function dynamiteAt(bx, by) {
  var cells = [[bx, by]], i, d;
  for (d = 0; d < 4; d++) cells.push([bx + DIR4[d][0], by + DIR4[d][1]]);

  var broke = 0, hit = [], barred = 0;
  for (i = 0; i < cells.length; i++) {
    var x = cells[i][0], y = cells[i][1];
    if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
    var j = y * MAP_W + x, t = L.tiles[j];
    /* Iron bars are the one thing the powder will not shift. */
    if (t === BARS) { barred = 1; continue; }
    if (t === WALL || t === ROCK || t === SDOOR || t === DOOR || t === LOCKED) {
      L.tiles[j] = FLOOR;
      delete L.locks[j];
      delete L.sealed[j];
      broke++;
    } else if (L.sealed[j]) delete L.sealed[j];
    var m = monAt(L, x, y);
    if (m) hit.push(m);
  }

  /* Give the new opening a face.  Anything now touching bare rock gets a
     wall built against it, and rock that was only ever a neighbour of
     the blast is left as rock behind that wall. */
  faceTheRock(cells);
  adoptOpened(L, cells);
  /* A hole in a wall is an opening like any other: if there was light on
     one side of it there is light a few squares into the other now. */
  buildLitMap(L); buildDarkMap(L, G.depth); spillLight(L);

  /* Powder next to powder: every barrel the explosion touches, which
     means the whole square around where it went off and not only the
     four squares the blast itself clears.  A stick thrown into a group
     of barrels used to light the one square it landed on, so landing on
     the bare floor between them did nothing at all. */
  var lit = 0, tx, ty, round = [];
  for (ty = by - 1; ty <= by + 1; ty++)
    for (tx = bx - 1; tx <= bx + 1; tx++) {
      lit += lightBarrel(tx, ty);
      round.push([tx, ty]);
    }
  /* and it leaves the square burning, so what is standing there burns
     with it - a stick thrown onto a table should not leave the table */
  scorch(round);

  G.splash = { cells: cells.slice(), t: beatNow(), kind: 'blast' };
  sound('boom');
  /* Say what actually happened.  It announced that it had torn the stone
     open whether or not there was any stone in reach of it. */
  if (broke)
    msgTrap('The blast tears the stone open!', 'O',
      broke + (broke === 1 ? ' wall' : ' walls'), 'O');
  else if (!lit) msgTrap('The dynamite explodes.', 'O', 'blast', 'O');
  /* both can be true at once, and powder catching is the bigger news */
  if (lit)
    msgTrap('The blast lights the powder!', 'R',
      lit + (lit === 1 ? ' barrel' : ' barrels'), 'R');
  if (barred) msg('The iron bars do not even bend.', '6');

  for (i = 0; i < hit.length; i++) {
    var mm = hit[i];
    var dmg = perkElemental(roll(DYNAMITE_DAMAGE[0], DYNAMITE_DAMAGE[1]), 'fire');
    mm.hp -= dmg; mm.state = 2; mm.disguise = 0;
    markHurt(mm, bx, by);
    if (mm.hp <= 0) killMonster(mm, true, dmg + ' blasted');
    else msgFight(fightLine('', cap(monShort(mm)), ' is caught in it.'),
      'O', dmg + ' blast', 'O', mm);
  }
  /* it does not care whose side you are on */
  if (Math.abs(P.x - bx) + Math.abs(P.y - by) <= 1) {
    var self = roll(DYNAMITE_DAMAGE[0], DYNAMITE_DAMAGE[1]);
    markHurt(P, bx, by);
    msgTrap('The blast catches you!', 'R', self + ' damage', 'R');
    hurtPlayer(self, 'her own dynamite');
  }
  faceTheRock(cells);
  computeVis();
  return broke;
}

/* Wall in every newly opened square that looks out onto solid rock, so a
   blast never reveals the emptiness outside the map. */
function faceTheRock(cells) {
  var i, d;
  for (i = 0; i < cells.length; i++) {
    var x = cells[i][0], y = cells[i][1];
    if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
    if (L.tiles[y * MAP_W + x] !== FLOOR) continue;
    for (d = 0; d < 8; d++) {
      var nx = x + DIR8[d][0], ny = y + DIR8[d][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var j = ny * MAP_W + nx;
      if (L.tiles[j] === ROCK) L.tiles[j] = WALL;
    }
  }
}

/* ---------------------------------------------------------- wands */
function zapWand(it, dx, dy) {
  breakClearwater('You give yourself away.');
  if (squibbed('wand')) return true;          /* the turn is spent trying */
  if (it.ch <= 0) { msg('Nothing happens.', '6'); return true; }
  if (!keepsCharge(it)) it.ch--;
  var k = it.k, n = WANDS[k].n, id = 1, i;
  var path = [], x = P.x, y = P.y;
  var pierce = (n === 'lightning' || n === 'fire' || n === 'cold');
  /* A missile bursts on the first solid thing in its way, and a barrel of
     powder is a solid thing.  A sheet of flame goes straight through one
     and lights it on the way past. */
  var stopsAtPowder = (n === 'magic missile');
  for (i = 0; i < 14; i++) {
    x += dx; y += dy;
    if (isDoorish(x, y)) { path.push([x, y]); break; }   /* stopped by the door */
    if (blocksShot(x, y)) break;
    path.push([x, y]);
    if (monAt(L, x, y) && !pierce) break;
    if (stopsAtPowder && barrelAt(x, y)) break;
  }
  G.bolt = { path: path.slice(), kind: n, mode: pierce ? 'beam' : 'fly',
             dir: [dx, dy], t: Date.now() };
  sound(n === 'lightning' ? 'lightning' : 'magic');
  var first = null;
  for (i = 0; i < path.length; i++) { var mm = monAt(L, path[i][0], path[i][1]); if (mm) { first = mm; break; } }
  /* Everything the beam passes over knows it was you.  A wand reaches
     further than anything can see, so without this every zap from the
     far side of a room counted as coming out of nowhere. */
  for (i = 0; i < path.length; i++) {
    var wm = monAt(L, path[i][0], path[i][1]);
    if (wm) hurtByPlayer(wm);
  }

  if (n === 'blink') {
    var bx = P.x, by = P.y, step;
    for (step = 1; step <= BLINK_RANGE; step++) {
      var tx = P.x + dx * step, ty = P.y + dy * step;
      if (!walkable(tx, ty) || monAt(L, tx, ty)) break;
      bx = tx; by = ty;
    }
    if (bx !== P.x || by !== P.y) {
      warpAway(P, P.x, P.y);
      P.x = bx; P.y = by; computeVis(); msg('The world lurches sideways.', 'P'); afterStep();
    }
    else msg('You twitch and stay put.', '6');
    KNOWN.wand[k] = 1;
    return true;
  }
  switch (n) {
    case 'light': {
      lightTheRoom('The room floods with light.', 'The corridor glows.');
      /* Full in the face of something that lives in the dark, a beam of
         light is not a convenience.  It is a weapon. */
      if (first && first.def.sp === 'drainmax') {
        var ld = roll(LIGHT_BEAM_DAMAGE[0], LIGHT_BEAM_DAMAGE[1]);
        first.state = 2; first.disguise = 0; first.hp -= ld;
        markHurt(first, P.x, P.y);
        if (first.hp <= 0) killMonster(first, true, ld + ' light');
        else msgFight(fightLine('Light sears ', monShort(first), '.'), 'y', ld + ' light', 'y', first);
      }
      break;
    }
    case 'darkness': {
      var rd = roomIndexAt(P.x, P.y);
      if (rd >= 0) {
        var rr = L.rooms[rd];
        rr.lit = 0; rr.blaze = 0; rr.dark = 1;
        buildLitMap(L); buildDarkMap(L, G.depth); spillLight(L);
        msg('The light goes out of the room.', 'p');
        computeVis();
      } else { msg('The dark deepens for a moment, and passes.', '6'); id = 0; }
      break;
    }
    case 'nothing': msg('You feel a strange sense of loss.', '6'); id = 0; break;
    case 'ice wall': {
      var nw = buildWall(dx, dy, ICEWALL);
      if (nw) { msg('A wall of ice grinds up out of the floor!', 'c'); computeVis(); }
      else { msg('The cold fizzles against something.', '6'); id = 0; }
      break;
    }
    case 'fire wall': {
      var nf = buildWall(dx, dy, FIREWALL);
      if (nf) { msg('A sheet of fire roars up from the stone!', 'R'); computeVis(); }
      else { msg('The heat gutters and dies.', '6'); id = 0; }
      break;
    }
    case 'invisibility':
      if (first) { first.invis = 1; msg(cap(monName(first)) + ' vanishes.', 'P'); } else id = 0;
      break;
    case 'polymorph':
      if (first) {
        var px2 = first.x, py2 = first.y;
        L.mons.splice(L.mons.indexOf(first), 1);
        var np = mkMonster(pick(MONS).c, G.depth, px2, py2);
        np.state = 2; np.disguise = 0; L.mons.push(np);
        msg('It transforms into ' + artic(np.def.n) + '!', 'P');
      } else id = 0;
      break;
    case 'haste monster':
      if (first) { first.hasted = 1; first.state = 2; msg(cap(monName(first)) + ' speeds up.', 'R'); } else id = 0;
      break;
    case 'slow monster':
      if (first) { first.slowed = 1; first.state = 2; msg(cap(monName(first)) + ' slows down.', 'c'); } else id = 0;
      break;
    case 'cancellation':
      if (first) { first.cancel = 1; first.invis = 0; msg(cap(monName(first)) + ' looks less dangerous.', 'c'); } else id = 0;
      break;
    case 'teleport away':
      if (first) {
        for (var t = 0; t < 100; t++) {
          var s = randSpot(L, randRoom(L));
          if (!monAt(L, s.x, s.y) && !(s.x === P.x && s.y === P.y)) { first.x = s.x; first.y = s.y; break; }
        }
        msg(cap(monName(first)) + ' disappears.', 'P');
      } else id = 0;
      break;
    case 'teleport to':
      if (first) {
        var open = [];
        for (i = 0; i < DIR4.length; i++) {
          var ox = P.x + DIR4[i][0], oy = P.y + DIR4[i][1];
          if (walkable(ox, oy) && !monAt(L, ox, oy)) open.push([ox, oy]);
        }
        if (open.length) {
          var o2 = pick(open); first.x = o2[0]; first.y = o2[1]; first.state = 2;
          msg(cap(monName(first)) + ' appears beside you!', 'R');
        }
      } else id = 0;
      break;
    case 'drain life': {
      var targets = L.mons.filter(function (m3) { return (L.flags[m3.y * MAP_W + m3.x] & F_VIS) !== 0; });
      if (!targets.length) { msg('You feel an absence of magic.', '6'); id = 0; break; }
      if (P.hp < 2) { msg('You are too weak to use it.', 'R'); break; }
      var dam = (P.hp / 2) | 0; var hb4 = P.hp; P.hp -= dam; holdHp(hb4, P.mhp);
      var each = Math.max(1, (dam / targets.length) | 0);
      msg('You feel your life force draining away.', 'p');
      targets.forEach(function (m4) {
        m4.hp -= each; m4.state = 2;
        if (m4.hp <= 0) killMonster(m4, true);
      });
      break;
    }
    case 'discord':
      if (first) {
        first.state = 2; first.disguise = 0; first.disc = DISCORD_TURNS;
        msgFight(fightLine('Marked ', monShort(first), '.'),
          'P', 'marked', 'P', first);
        var pals = 0;
        for (i = 0; i < L.mons.length; i++) {
          var pm = L.mons[i];
          if (pm === first || pm.ally || pm.disc > 0) continue;
          if (Math.abs(pm.x - first.x) + Math.abs(pm.y - first.y) > DISCORD_RANGE) continue;
          pm.state = 2; pm.lost = 0; pals++;
        }
        if (pals) msg(pals + ' turn' + (pals > 1 ? '' : 's') + ' on it.', 'P');
        else msg('Nothing nearby cares.', '6');
      } else { msg('The note fades into the dark.', '6'); id = 0; }
      break;
    case 'magic missile':
      if (first) {
        var md = roll(1, 4) + 3;
        first.state = 2; first.disguise = 0; first.hp -= md;
        markHurt(first, P.x, P.y);
        if (first.hp <= 0) killMonster(first, true, md + ' damage');
        else msgFight(fightLine('Missile hits ', monShort(first), '.'), 'P', md + ' damage', 'P', first);
      } else msg('The missile vanishes into the dark.', '6');
      /* It bursts where it stops, and a burst is hot enough to catch what
         it lands on - powder included. */
      if (path.length) scorch([path[path.length - 1]]);
      break;
    case 'lightning': case 'fire': case 'cold': {
      var word = n === 'lightning' ? 'bolt of lightning' : n === 'fire' ? 'sheet of flame' : 'blast of ice';
      var wcol = n === 'cold' ? 'c' : n === 'fire' ? 'R' : 'y';
      var fxWord = n === 'fire' ? ' burn' : n === 'cold' ? ' cold' : ' shock';
      msg('A ' + word + ' streaks out!', wcol);
      var pools = [];
      path.forEach(function (pp) {
        var m5 = monAt(L, pp[0], pp[1]);
        if (m5) {
          var bd2 = elemDamage(m5, perkElemental(roll(6, 6), n), n);
          m5.state = 2; m5.disguise = 0; m5.hp -= bd2;
          markHurt(m5, P.x, P.y);
          if (isWater(m5.x, m5.y)) pools.push([m5.x, m5.y]);
          if (m5.hp <= 0) killMonster(m5, true, bd2 + fxWord);
          else msgFight(fightLine(cap(word.split(' ')[0]) + ' sears ', monShort(m5), '.'),
            wcol, bd2 + fxWord, wcol, m5);
        }
        if (isWater(pp[0], pp[1])) pools.push(pp);
      });
      if (n !== 'fire' && pools.length) conductPools(pools, n);
      /* A sheet of flame leaves the room burning behind it, the same way
         a dragon's breath does - which means it takes the furniture with
         it and sets off any powder standing in its way. */
      if (n === 'fire') scorch(path);
      break;
    }
  }
  if (id) KNOWN.wand[k] = 1;
  computeVis();
  return true;
}

/* ---------------------------------------------------- water conduction
   Cold and lightning run through a pool of water and hit everything
   standing in it.  Only the pool that was struck: a second, separate
   puddle in the same room is untouched. */
function conductPools(seeds, kind) {
  var done = {}, bodies = [], i, j;
  for (i = 0; i < seeds.length; i++) {
    var k0 = seeds[i][1] * MAP_W + seeds[i][0];
    if (done[k0] || !isWater(seeds[i][0], seeds[i][1])) continue;
    var body = waterBody(seeds[i][0], seeds[i][1]);
    for (j = 0; j < body.length; j++) done[body[j][1] * MAP_W + body[j][0]] = 1;
    bodies.push(body);
  }
  if (!bodies.length) return;

  var cells = [];
  for (i = 0; i < bodies.length; i++) cells = cells.concat(bodies[i]);
  G.splash = { cells: cells, kind: kind, t: beatNow() };
  msg(kind === 'cold' ? 'The water freezes over!' : 'The water crackles with lightning!',
    kind === 'cold' ? 'c' : 'y');

  var dmg = roll(4, 6), hitMe = false;
  var fxw = dmg + (kind === 'cold' ? ' cold' : ' shock');
  for (i = 0; i < cells.length; i++) {
    var c = cells[i];
    var m = monAt(L, c[0], c[1]);
    if (m) {
      m.state = 2; m.disguise = 0; m.hp -= dmg;
      if (kind === 'cold') m.held = Math.max(m.held, rnd(6) + 4);
      if (m.hp <= 0) killMonster(m, true, fxw);
      else msgFight(fightLine('Water hits ', monShort(m), '.'), kind === 'cold' ? 'c' : 'y',
        fxw, kind === 'cold' ? 'c' : 'y', m);
    }
    if (P.x === c[0] && P.y === c[1]) hitMe = true;
  }
  if (hitMe) {
    msg('The water carries it straight into you!', 'R');
    if (kind === 'cold') { var ic = rnd(3) + 2; P.frozen += ic;
      P.iced = Math.max(P.iced || 0, ic); }
    if (kind === 'lightning' && hasPerk('storm'))
      msg('The current runs round you and away.', 'c');
    else
      hurtPlayer(dmg, kind === 'cold' ? 'a blast of ice' : 'a bolt of lightning', kind);
  }
}

/* ---------------------------------------------------------- shooting */
/* ---------------------------------------------------------- shooting
   A bow will send an arrow at any angle at all, so long as nothing
   solid stands on the line between you and the mark. */
function canShoot() {
  /* If you have picked something out of the pack and said "throw this",
     that is what flies.  The bow used to win every time, so choosing a
     stone while a loaded bow was in your off hand loosed an arrow at
     whatever you were aiming the stone at. */
  var th = G.throwing;
  if (th && countOf(th) > 0)
    return { bow: th, ammo: th, def: WEAPONS[th.k], thrown: 1 };
  var lw = launcher();
  if (lw) {
    var W = WEAPONS[lw.k];
    var am = findAmmo(W.n);
    if (am) return { bow: lw, ammo: am, def: W };
  }
  return null;
}
/* A flask bursting: a handful of droplets thrown outward, each with its
   own direction and speed, drawn for a fraction of a second. */
function splashDrops(x, y, col) {
  var parts = [];
  for (var i = 0; i < SPLASH_DROPS; i++) {
    var ang = (i / SPLASH_DROPS) * Math.PI * 2 + rnd(100) / 160;
    /* a fraction of a square to a square and a half, never further */
    var sp = 0.45 + rnd(100) / 100 * (SPLASH_REACH - 0.45);
    parts.push({ dx: Math.cos(ang) * sp, dy: Math.sin(ang) * sp - 0.25 });
  }
  G.drops = { x: x, y: y, t: beatNow(), dur: SPLASH_MS, col: col, parts: parts };
}
function potionColour(it) {
  if (!it || it.t !== 'potion') return '#c3ccd9';
  var w = flaskEffect(it);
  if (w === 'fire') return '#f59e0b';
  if (w === 'gas') return '#93bd27';
  return P_COLOUR[P_SPRITE[APPEAR.pot[it.k]]] || '#74d6e8';
}

/* somewhere you could actually land it */
function throwValid(x, y, it) {
  if (Math.max(Math.abs(x - P.x), Math.abs(y - P.y)) > shotRange()) return false;
  if (x === P.x && y === P.y) return true;      /* at your own feet is legal */
  /* Dynamite is the exception: the whole point is to throw it *at* the
     wall, so a square you cannot walk into is a legal target as long as
     nothing stands between you and it. */
  var blast = it && it.t === 'dynamite';
  /* A doorway stops an arrow, but something standing in one is in plain
     sight and perfectly hittable - the shot ends at it, not past it. */
  if (!blast && blocksShot(x, y) && !monAt(L, x, y)) return false;
  if (blast) {
    var sx = P.x, sy = P.y;
    var dx = x - sx, dy = y - sy;
    var n = Math.max(Math.abs(dx), Math.abs(dy)), i;
    for (i = 1; i < n; i++) {
      var px = sx + Math.round(dx * i / n), py = sy + Math.round(dy * i / n);
      if (blocksShot(px, py)) return false;     /* stopped short */
    }
    return true;
  }
  return shotClear(P.x, P.y, x, y);
}

/* ------------------------------------------------------ lobbing things
   A stone or a flask, at any square in range.  Whether something is
   standing there only changes what happens when it arrives. */
function throwAtSquare(it, tx, ty) {
  breakClearwater('You give yourself away.');
  if (!it) return false;
  var victim = monAt(L, tx, ty);
  var boom = it.t === 'dynamite';
  /* A flask is thrown at a square, not at a target, so it can be lobbed
     to an ally as easily as at a foe - which is the only way to get a
     healing mist onto somebody fighting for you. */
  if (victim && !isFlask(it) && !boom) {
    if (victim.ally) { msg('You will not shoot your own.', '6'); return false; }
    return fireAt(victim);                    /* a stone finds its mark */
  }

  var flight = 80 + Math.round(Math.max(Math.abs(tx - P.x),
    Math.abs(ty - P.y)) * 20);
  sound('shoot');
  G.shot = { sx: P.x, sy: P.y, ex: tx, ey: ty, t: beatNow(),
             dur: flight, tail: 4,
             spr: (it.t === 'weapon') ? WEAPONS[it.k].s : null,
             col: boom ? '#d82b2b' : isFlask(it) ? '#f59e0b' : null };
  beatWait(flight);
  removeItem(it, 1);

  if (boom) { dynamiteAt(tx, ty); return true; }

  /* A flagstone you are suspicious of is worth a stone.  Whatever lands
     on a trap sets it off, from wherever you are standing. */
  var hitTrap = trapAtLevel(L, tx, ty);
  if (hitTrap && !hitTrap.spent) springFromAfar(hitTrap);

  if (!isFlask(it)) {
    /* thrown at open floor, it simply lands there - unless it is charmed
       to come back, or runed to do something first */
    if (WEAPONS[it.k].rune) {
      msg(cap(WEAPONS[it.k].n) + ' clatters to the ground.', '6');
      stoneRune(WEAPONS[it.k].rune, { x: tx, y: ty }, it, flight);
    } else if (!flyHome(it, tx, ty, flight)) {
      msg(cap(WEAPONS[it.k].n) + ' clatters to the ground.', '6');
      dropNear(tx, ty, likeItem(it));
    }
    return true;
  }

  /* a flask breaks wherever it lands */
  splashDrops(tx, ty, potionColour(it));
  if (victim) hurtByPlayer(victim);
  var what = flaskEffect(it);
  msg('The flask shatters' + (victim ? ' on ' + monShort(victim) : '') + '.', 'O');
  if (what) KNOWN.pot[it.k] = 1;      /* you saw what it did */
  if (what === 'fire') {
    var n = spawnFire(tx, ty);
    msg('Fire spreads across ' + n + ' square' + (n > 1 ? 's' : '') + '.', 'R');
    burnEverything();
  } else if (what === 'gas') {
    spawnCloud(tx, ty, 'poison', GAS_TURNS_MIN + rnd(GAS_TURNS_MAX - GAS_TURNS_MIN + 1),
      beatNow());
    msg('Green vapour billows out.', 'g');
  } else if (what === 'mend') {
    /* The same vapour, the other way about: it mends whatever stands in
       it, you and your allies included, and it hangs about the same
       handful of turns. */
    spawnCloud(tx, ty, 'mend', GAS_TURNS_MIN + rnd(GAS_TURNS_MAX - GAS_TURNS_MIN + 1),
      beatNow());
    msg('A red mist rolls out of the shards.', 'r');
  } else if (what === 'blind') {
    if (victim) {
      victim.blind = (victim.blind || 0) + rnd(8) + 8;
      victim.state = 2; victim.disguise = 0;
      msgFight(fightLine('The dark splashes over ', monShort(victim), '.'),
        'p', 'blinded', 'p', victim);
    } else msg('The dark soaks away into the stone.', '6');
  } else if (what === 'water' || what === 'holy') {
    var blessed = what === 'holy';
    /* thrown at your own feet, or near enough to break over them */
    if (tx === P.x && ty === P.y) soakPlayer('The water burns you.');
    if (victim) {
      /* Water puts a fire breather out.  It is not damage - it is the
         difference between being shot at from across the room and not. */
      if (victim.def.sp === 'fireball') {
        victim.doused = DOUSED_TURNS;
        victim.state = 2; victim.disguise = 0;
        msgFight(fightLine('Water runs over ', monShort(victim), '.'),
          'c', 'doused', 'c', victim);
      }
      if (blessed && (victim.def.sp === 'drainmax' || victim.def.sp === 'drainexp')) {
        var hd = roll(HOLY_WATER_DAMAGE[0], HOLY_WATER_DAMAGE[1]);
        victim.hp -= hd; victim.state = 2; victim.disguise = 0;
        markHurt(victim, P.x, P.y);
        if (victim.hp <= 0) killMonster(victim, true, hd + ' holy');
        else msgFight(fightLine('It scalds ', monShort(victim), ' to the bone.'),
          'y', hd + ' holy', 'y', victim);
      } else if (victim.def.sp !== 'fireball') {
        msgFight(fightLine('', cap(monShort(victim)), ' is merely wet.'), '6', 'wet', '6', victim);
      }
    } else msg(blessed ? 'The blessing soaks away into the stone.'
                       : 'A puddle spreads across the floor.', '6');
  } else if (what === 'daze') {
    if (victim) {
      victim.conf = (victim.conf || 0) + rnd(8) + 8;
      victim.state = 2; victim.disguise = 0;
      msgFight(fightLine('', cap(monShort(victim)), ' reels, wide eyed.'),
        'P', 'confused', 'P', victim);
    } else msg('The fumes drift away.', '6');
  } else if (what === 'strong') {
    if (victim) {
      victim.dmgBonus = (victim.dmgBonus || 0) + POTION_STRONG_DAM;
      victim.state = 2; victim.disguise = 0;
      msgFight(fightLine('', cap(monShort(victim)), ' swells with strength!'),
        'R', 'stronger', 'R', victim);
    } else msg('The draught soaks away into the stone.', '6');
  } else {
    msg('Nothing much happens.', '6');
  }
  return true;
}

/* how many of a stack are left, or 0 if it has gone */
function countOf(it) {
  var all = carriedItems();
  for (var i = 0; i < all.length; i++) if (all[i] === it) return it.cnt;
  return 0;
}

/* The thing that lands on the floor, or flies back to you: the same
   weapon, with everything about it that mattered carried over.  Four
   places used to build this by hand and the charm would have been
   dropped by the first one that forgot. */
function likeItem(am) {
  var c = mkItem('weapon', am.k);
  c.cnt = 1; c.hp = am.hp; c.dp = am.dp; c.known = am.known;
  if (am.homing) c.homing = 1;
  if (am.ret !== undefined) c.ret = am.ret;
  return c;
}
/* The scroll of return brings it home rather than leaving it where it
   fell.  Returns true if it handled the landing. */
function flyHome(am, fx, fy, flight) {
  if (!am.homing) return false;
  G.ret = { fx: fx, fy: fy, tx: P.x, ty: P.y,
            t: beatNow(), dur: RETURN_MS, spr: WEAPONS[am.k].s };
  beatWait(RETURN_MS);
  var back = likeItem(am);
  if (addItem(back)) msg(cap(WEAPONS[am.k].n) + ' flies back to your hand.', 'G');
  else { dropNear(P.x, P.y, back); msg('It returns, and you fumble it.', 'O'); }
  return true;
}

/* Web from a bow: it flies like a shot, it holds like a web, and the
   quiver is untouched. */
function looseWeb(best, lw) {
  var gap = Math.max(Math.abs(best.x - P.x), Math.abs(best.y - P.y));
  var flight = 90 + gap * 22;
  sound('shoot');
  G.shot = { sx: P.x, sy: P.y, ex: best.x, ey: best.y, t: beatNow(), dur: flight,
             col: '#c3ccd9', tail: 4 };
  beatWait(flight);
  var hold = SPIDER_BOW_HOLD[0] + rnd(SPIDER_BOW_HOLD[1] - SPIDER_BOW_HOLD[0] + 1);
  best.stuck = (best.stuck || 0) + hold;
  best.webbed = (best.webbed || 0) + hold;
  best.state = 2; best.disguise = 0;
  markHurt(best, P.x, P.y);
  msgFight(fightLine('Web wraps ', monShort(best), '.'), 'c', 'stuck ' + hold, 'O', best);
  lw.known = 1;                      /* you have just watched it work */
  computeVis();
  return true;
}

function fireAt(best) {
  var kit = canShoot();
  if (!kit || !best) return false;
  breakClearwater('You give yourself away.');
  var lw = kit.bow, am = kit.ammo, W = kit.def;

  var sneak = surpriseHit(best), extra = surpriseDam(best);
  var unaware = best.state < 2, name = monShort(best);
  var ammoName = cap(WEAPONS[am.k].n);
  var landed = null;                  /* where it came down, if it missed */
  hurtByPlayer(best);
  /* A bow of the spider now and then looses web rather than a shaft.  It
     costs no arrow, does no damage, and sticks what it hits where it
     stands - which is worth more than the arrow would have been. */
  if (!kit.thrown && lw && activeRune(lw) && activeRune(lw).n === 'the spider' &&
      rnd(100) < SPIDER_BOW_PCT) {
    return looseWeb(best, lw);
  }
  /* A charged runestone survives being thrown, but it still leaves your
     hand: it lands where it fell, one charge poorer, and waits to be
     picked up.  Spending the charge in place would leave you holding it
     and lying on the floor at the same time. */
  var chargedRune = isRuneStone(am) && am.chg > 0;
  var keepChg = chargedRune ? am.chg - 1 : 0;
  var wasCharged = am.chg || 0;
  /* A returning stone is not spent by being thrown - it comes back.  It
     stays in the pack and its flights are counted down in place, so a
     stack of three is three stones used one after another rather than
     three stones sharing one tally between them. */
  var homer = isRuneStone(am) && WEAPONS[am.k].rune === 'return';
  if (homer) { /* stoneRune counts it down when it lands */ }
  else if (isRuneStone(am)) removeItem(am, 1);
  else spendUse(am);

  var thrown = !!kit.thrown;
  /* A bow of fire lights the shaft as it leaves the string.  What it
     hits catches; what it comes down on catches; and it is the bow that
     does it, so an arrow out of any other bow is only an arrow. */
  var aflame = !thrown && lw && activeRune(lw) && activeRune(lw).n === 'fire';
  /* A crossbow sends it flatter and faster than a bow does.  They share
     the same arrows now, so it is the launcher that decides, not what is
     loaded into it. */
  var isBolt = !thrown && lw && WEAPONS[lw.k].n === 'crossbow';
  var flight = (isBolt ? 70 : 90) +
    Math.round(Math.max(Math.abs(best.x - P.x), Math.abs(best.y - P.y)) * (isBolt ? 17 : 22));
  sound('shoot');
  /* An arrow is a streak; a stone or a spear is a thing, and it should
     look like the thing on the way out as well as on the way home.
     Watching an arrow fly off and a runestone come back was the same
     object wearing two faces. */
  /* Stamped on the same clock as everything else in the turn.  It used
     to start flying the instant the key was pressed while the blow it
     lands was timed properly, so with anything else already queued the
     stone arrived before it had been thrown. */
  G.shot = { sx: P.x, sy: P.y, ex: best.x, ey: best.y, t: beatNow(), dur: flight,
             tail: isBolt ? 3 : 6,
             spr: thrown ? WEAPONS[am.k].s : null };

  /* everything waits for the arrow to arrive */
  beatWait(flight);

  /* Too close to draw properly: one square away is the worst of it, and
     it eases off with every step of room you have. */
  var gap = Math.max(Math.abs(best.x - P.x), Math.abs(best.y - P.y));
  var crowded = gap < POINT_BLANK ? (POINT_BLANK - gap) * POINT_BLANK_PENALTY : 0;
  if (swingP(P.lv, best.ar,
             playerHitBonus() + (thrown ? 0 : lw.hp) + am.hp + sneak - crowded)) {
    /* A spear or a throwing dagger is the same weapon whether it is in
       your hand or in the air, so it rolls its own dice and nothing
       else.  Everything shot from a bow adds the bow's. */
    var dice = W.shot ? [WEAPONS[am.k].d, W.shot] : [WEAPONS[am.k].d];
    var dmg = Math.max(1, (hasPerk('marksman') ? PERK_SHOT_DAM : 0) +
      damRoll(dice) + addDam(effStr()) +
      (thrown ? 0 : lw.dp) + am.dp + extra);
    best.hp -= dmg;
    markHurt(best, P.x, P.y);            /* the clock already holds the flight */
    var fx = dmg + (extra ? ' sneak' : ' damage');
    /* Now and then the shaft comes through intact - and a stone that has
       been charged is half as likely to be lost as one that has not. */
    var keepPct = ARROW_RECOVER_PCT;
    /* a ring of battle luck: what you loose, you mostly get back */
    if (carryingRing('battle luck')) keepPct = Math.max(keepPct, LUCK_RECOVER_PCT);
    if (wasCharged && isPlainAmmo(am)) keepPct = 100 - (100 - keepPct) / 2;
    /* a scavenger picks his shafts back out of the wall */
    if (hasPerk('scavenger')) keepPct = 100 - (100 - keepPct) / 2;
    /* A spear does not shatter.  It is there to be picked up, every
       time, which is the whole point of throwing one. */
    if (isHurlWeapon(am)) keepPct = 100;
    if (!W.rune && !flyHome(am, best.x, best.y, flight) && rnd(100) < keepPct)
      dropNear(best.x, best.y, likeItem(am));
    if (aflame) {
      /* the square first: it burns whether or not the shot killed it */
      var bx0 = best.x, by0 = best.y;
      if (best.hp <= 0) { killMonster(best, true, fx, flight); dropEmber(bx0, by0); return true; }
      igniteMon(best, 'The burning shaft sets it alight.');
      dropEmber(bx0, by0);
      if (best.hp <= 0) { killMonster(best, true, 'burnt', flight); return true; }
    }
    if (best.hp <= 0) { killMonster(best, true, fx, flight); return true; }
    msgFight(fightLine(ammoName + ' hits ', name, '.'), 'y', fx, 'O', best);
    if (!best.flee && best.hp * 4 < best.mhp && rnd(100) < 30) best.flee = 1;
  } else {
    msgFight(fightLine(ammoName + ' misses ', name, '.'), '6', 'miss', '6', best);
    /* it sails on past and clatters down somewhere behind */
    var vx = best.x - P.x, vy = best.y - P.y;
    var len = Math.sqrt(vx * vx + vy * vy) || 1;
    var fx = best.x, fy = best.y;
    var over = 1 + rnd(ARROW_OVERSHOOT);
    for (var st = 1; st <= over; st++) {
      var nx2 = Math.round(best.x + (vx / len) * st), ny2 = Math.round(best.y + (vy / len) * st);
      if (blocksShot(nx2, ny2)) break;
      fx = nx2; fy = ny2;
    }
    /* not `extra` - that is the sneak damage, and var is not block
       scoped, so reusing the name here quietly emptied it */
    var sail = 30 * (Math.abs(fx - best.x) + Math.abs(fy - best.y));
    G.shot.ex = fx; G.shot.ey = fy;
    G.shot.dur = flight + sail;
    /* It is still in the air.  Anything that happens where it comes down
       - a rune going off, a charmed stone turning round - has to wait for
       it to get there, or the same stone is on the screen twice: one
       sailing on past and one already flying home. */
    beatWait(sail);
    landed = { x: fx, y: fy };
    if (aflame) dropEmber(fx, fy);
    if (W.rune !== 'return' && !flyHome(am, fx, fy, flight))
      dropNear(fx, fy, likeItem(am));
  }
  /* and it comes home from where it landed, not from what it missed */
  if (W.rune) stoneRune(W.rune, landed || best, am, flight);
  /* It kept its charge, so it is still a stone: it should be there to
     pick up again.  If there is nowhere clear to put it down - a corner
     already piled with things - it goes back in your pack rather than
     being quietly lost, which is the whole point of charging it. */
  if (chargedRune && W.rune !== 'return') {
    var again = mkItem('weapon', am.k);
    again.cnt = 1; again.hp = am.hp; again.dp = am.dp;
    again.known = am.known; again.chg = keepChg;
    if (!dropNear(best.x, best.y, again) && !addItem(again))
      dropNear(P.x, P.y, again);
  }
  return true;
}

/* ------------------------------------------------------- runed stones
   Whatever the stone was cut for happens where it lands. */
function stoneRune(rune, target, am, flight) {
  var i;
  /* You have just watched it do the thing it was cut for.  Whatever else
     is a mystery about it, what kind of stone it is no longer is - so it
     names itself, and so does every other one like it in your pack.
     Only the returning stone used to do this, which left the blasting,
     binding, burning and freezing stones reading "a stone with strange
     letters" for the whole run however often you threw one. */
  if (am && am.t === 'weapon') { am.known = 1; learnWeapon(am.k); }
  /* A rune cut by somebody else still needs a hand that magic will
     answer.  In a squib's it is a stone, and it lands like one. */
  if (squibbed('rune')) return;
  if (target && L.mons.indexOf(target) >= 0) hurtByPlayer(target);
  switch (rune) {
    case 'blast': {
      /* Everything beside the impact, the target included - but a blast
         fills a room, it does not fill the stone around it.  A square you
         could not walk onto is not part of it, and neither is one with a
         wall standing in front of it: it used to be drawn as a flat
         square of fire whatever it was drawn over, and it caught things
         through walls. */
      var cells = [], hit = [], dx, dy;
      for (dy = -BLAST_RANGE; dy <= BLAST_RANGE; dy++)
        for (dx = -BLAST_RANGE; dx <= BLAST_RANGE; dx++) {
          var bx = target.x + dx, by = target.y + dy;
          if (!walkable(bx, by)) continue;
          if (!shotClear(target.x, target.y, bx, by)) continue;
          cells.push([bx, by]);
          var m2 = monAt(L, bx, by);
          if (m2 && hit.indexOf(m2) < 0) hit.push(m2);
        }
      G.splash = { cells: cells.slice(), t: beatNow(), kind: 'blast' };
      sound('boom');
      /* and it leaves the squares it filled burning, which takes the
         furniture and sets off any powder standing in them */
      scorch(cells, 0, beatNow());
      msgTrap('The stone bursts!', 'O', hit.length + ' caught', 'O');
      for (i = 0; i < hit.length; i++) {
        var bm = hit[i], bd = roll(BLAST_DAMAGE[0], BLAST_DAMAGE[1]);
        bm.hp -= bd; bm.state = 2; bm.disguise = 0;
        markHurt(bm, target.x, target.y);
        if (bm.hp <= 0) killMonster(bm, true, bd + ' blast');
        else msgFight(fightLine('', cap(monShort(bm)), ' is caught.'), 'O', bd + ' blast', 'O', bm);
      }
      break;
    }
    /* A stone of fire, and a stone of ice.  Both hit like a plain stone
       and then do the thing they are cut for - to whatever they land on,
       friend or foe, since a stone cannot tell. */
    case 'fire':
      if (L.mons.indexOf(target) >= 0) igniteMon(target, 'The stone bursts into flame.');
      else { dropEmber(target.x, target.y); msg('The stone flares where it lands.', 'O'); }
      break;
    case 'ice':
      if (L.mons.indexOf(target) >= 0) {
        freezeMon(target, 'The stone bursts into frost.');
        /* and if the cold is the very thing it cannot stand, it bites */
        if (target.def.weak === 'cold') {
          var cd = elemDamage(target, roll(RING_BEAM[0], RING_BEAM[1]), 'cold');
          target.hp -= cd;
          markHurt(target, target.x, target.y + 1);
          if (target.hp <= 0) killMonster(target, true, cd + ' cold');
          else msgFight(fightLine('The cold goes through ', monShort(target), '.'),
            'c', cd + ' cold', 'c', target);
        }
      } else msg('Frost spreads where the stone lands.', 'c');
      break;
    case 'slow':
      if (L.mons.indexOf(target) >= 0) {
        target.slowed = STONE_SLOW_TURNS;
        msgFight(fightLine('Bindings coil round ', monShort(target), '.'),
          'c', 'slowed', 'c', target);
      }
      break;
    case 'return': {
      /* The rune is not endless: it will bring the stone home a set
         number of times, and after that it is a stone like any other.

         The count belongs to the stone in the air, not to the pile it
         came from.  It is spent in place, so the first of a stack is
         worn out before the second is touched. */
      var left = (am.ret === undefined ? RETURN_USES : am.ret) - 1;
      G.ret = { fx: target.x, fy: target.y, tx: P.x, ty: P.y,
                t: beatNow(), dur: RETURN_MS, spr: WEAPONS[am.k].s };
      beatWait(RETURN_MS);
      /* You have just watched it come back to your hand.  Whatever else
         it may be carrying, there is no longer any question about what
         kind of stone it is - so it names itself, and so does every
         other one like it you happen to be carrying. */
      am.known = 1;
      learnWeapon(am.k);
      if (left > 0) {
        am.ret = left;
        msg('The stone flies back to your hand.' +
            (left <= 3 ? ' The marks are faint now.' : ''), 'G');
        break;
      }
      /* The last flight of this one.  It comes home as an ordinary
         stone, and the next of the stack starts fresh. */
      removeItem(am, 1);
      if (countOf(am) > 0) am.ret = undefined;
      var plain = mkItem('weapon', weaponIndex('stone'));
      plain.cnt = 1; plain.known = 1;
      if (addItem(plain)) msg('The stone returns, and the marks fade from it.', '6');
      else { dropNear(P.x, P.y, plain); msg('The stone returns spent, and you drop it.', '6'); }
      break;
    }
  }
}

/* --------------------------------------------------- conjured barriers
   The wall forms two squares away, across the line you are facing. */
function buildWall(dx, dy, kind) {
  var ox = P.x + dx * 2, oy = P.y + dy * 2;
  var px = -dy, py = dx;               /* perpendicular */
  var made = 0;
  for (var i = -1; i <= 1; i++)
    if (placeTempWall(ox + px * i, oy + py * i, kind)) made++;
  if (!made) {
    for (i = -1; i <= 1; i++)
      if (placeTempWall(P.x + dx + px * i, P.y + dy + py * i, kind)) made++;
  }
  return made;
}

/* A spider of your own, off a witch's ring.  One at a time: the ring
   knows whether the last one is still on its feet, and will not call
   another until it is not. */
function yourSpider() {
  for (var i = 0; i < L.mons.length; i++)
    if (L.mons[i].ally && L.mons[i].c === 'E') return L.mons[i];
  return null;
}
function ringSpider(it) {
  if (yourSpider()) {
    msg('Your spider is already at your heel.', '6');
    return false;
  }
  var spots = [], dx, dy;
  for (dy = -2; dy <= 2; dy++) for (dx = -2; dx <= 2; dx++) {
    if (!dx && !dy) continue;
    var x = P.x + dx, y = P.y + dy;
    if (!walkable(x, y) || monAt(L, x, y) || barrelAt(x, y)) continue;
    if (!losClear(P.x, P.y, x, y)) continue;
    spots.push([x, y]);
  }
  if (!spots.length) { msg('There is nowhere for it to stand.', '6'); return false; }
  if (!keepsCharge(it)) { it.ch--; it.wind = 0; }
  shuffle(spots);
  var m = mkMonster('E', Math.max(1, G.depth), spots[0][0], spots[0][1]);
  m.ally = 1; m.state = 2; m.surprised = 0; m.disguise = 0;
  m.life = WITCH_SPIDER_LIFE;
  m.item = null; m.gold = 0;
  L.mons.push(m);
  msg('A spider climbs out of the ring.', 'P');
  sound('magic');
  computeVis();
  return true;
}

/* --------------------------------------------------------- summoning */
function summonAid(n) {
  var spots = [], dx, dy, made = 0;
  for (dy = -2; dy <= 2; dy++) for (dx = -2; dx <= 2; dx++) {
    if (!dx && !dy) continue;
    var x = P.x + dx, y = P.y + dy;
    if (!walkable(x, y) || monAt(L, x, y)) continue;
    if (!losClear(P.x, P.y, x, y)) continue;
    spots.push([x, y]);
  }
  shuffle(spots);
  for (var i = 0; i < n && i < spots.length; i++) {
    var c = spots[i];
    var m = mkMonster(randMonsterChar(Math.max(1, G.depth - 2)), G.depth, c[0], c[1]);
    m.ally = 1; m.state = 2; m.surprised = 0; m.disguise = 0;
    m.life = 45 + rnd(35);
    L.mons.push(m);
    made++;
  }
  return made;
}

/* a bolt looks nothing like an arrow, in the quiver or in the air */
function arrowSprite(d, ammo) {
  var base = 'arrow';
  if (d[0] > 0) return base + '_e';
  if (d[0] < 0) return base + '_w';
  if (d[1] < 0) return base + '_n';
  return base + '_s';
}

/* ------------------------------------------------- scroll-on-an-item
   These are the scrolls you aim at something in your pack.  Until the
   scroll is identified you have no idea whether it will bless the thing
   or ruin it. */
function enchantable(it) {
  return it && (it.t === 'weapon' || it.t === 'ring' || isGear(it));
}
/* A magical pin: fasten it to a piece of clothing and something happens
   to it.  Usually good, sometimes not, and you find out either way. */
function pinOnto(it) {
  if (!it || !isGear(it)) {
    msg('A pin goes on clothing, not on that.', '6');
    return false;
  }
  if (squibbed('pin')) return false;
  var r = rnd(100);
  it.known = 1;
  if (r < 42) {
    /* a plain improvement */
    it.ap += 1 + (rnd(100) < 25 ? 1 : 0);
    liftCurse(it);
    msg('The pin sinks in. ' + cap(itemName(it)) + '.', 'G');
  } else if (r < 76) {
    /* an enchantment, if there is room for one */
    if (it.br) {
      it.ap += 1;
      msg('It is already spoken for. ' + cap(itemName(it)) + '.', 'c');
    } else {
      addRune(it, it.t === 'head' ? 'gh' : 'g', 100);
      learnRune(it);             /* you watched it go in */
      var rn = runeDef(it);
      if (rn && rn.bad) msg('The pin blackens. ' + cap(itemName(it)) + '.', 'R');
      else msg('The pin glows. ' + cap(itemName(it)) + '.', 'G');
    }
  } else if (r < 90) {
    /* a curse */
    it.ap -= 1 + rnd(2);
    layCurse(it);
    msg('The pin bites you. ' + cap(itemName(it)) + '.', 'R');
    msg('It is cursed!', 'R');
  } else {
    msg('The pin crumbles to dust. Nothing happens.', '6');
  }
  return true;
}

function applyScrollTo(kind, it, scrollK) {
  var ok = true;
  switch (kind) {
    case 'pin':
      pinOnto(it);
      break;
    case 'identify':
      identifyItem(it);
      break;
    case 'remove curse':
      if (!it.cursed) {
        msg(cap(itemName(it)) + ' was never cursed.', '6');
        ok = false;
        break;
      }
      liftCurse(it);
      it.known = 1;
      msg('The curse lifts from ' + itemName(it) + '.', 'G');
      break;
    case 'return': {
      if (!canReturn(it)) {
        msg('The scroll crumbles. That is not something you throw.', '6');
        ok = false; break;
      }
      /* The charm will only hold one thing at a time.  Reading it over
         something new lets go of whatever had it before. */
      var had = returningItem();
      setReturning(it);
      it.known = 1;
      if (had && had !== it)
        msg('The charm leaves ' + itemName(had) + ' and settles on ' +
            itemName(it) + '.', 'c');
      else
        msg(cap(itemName(it)) + ' will come back to your hand.', 'G');
      break;
    }
    case 'charging': {
      var got = chargeItem(it);
      if (!got) { msg('The scroll crumbles. Nothing happens.', '6'); ok = false; break; }
      it.known = 1;
      if (got.kind === 'wand')
        msg(cap(itemName(it)) + ' hums: ' + got.from + ' charges become ' + got.to + '.', 'c');
      else if (got.kind === 'returns')
        msg(cap(itemName(it)) + ' will come back ' + got.to + ' times now, not ' +
            got.from + '.', 'c');
      else if (got.kind === 'sturdy')
        msg(cap(itemName(it)) + ' hardens. It will survive a throw far more often.', 'c');
      else
        msg(cap(itemName(it)) + ' takes on a charge. ' + got.bonus +
            ' more use' + (got.bonus > 1 ? 's' : '') + '.', 'c');
      break;
    }
    case 'enchantment':
      if (!enchantable(it)) { msg('The scroll crumbles. Nothing happens.', '6'); ok = false; break; }
      bumpItem(it, 1); liftCurse(it); it.known = 1;
      msg(cap(itemName(it)) + ' glows silver for a moment.', 'c');
      cutRune(it, SCROLL_RUNE_PCT);
      break;
    case 'greater enchantment':
      if (!enchantable(it)) { msg('The scroll crumbles. Nothing happens.', '6'); ok = false; break; }
      bumpItem(it, 2); liftCurse(it); it.known = 1;
      msg(cap(itemName(it)) + ' blazes with white light!', 'y');
      cutRune(it, SCROLL_RUNE_GREAT_PCT);
      break;
    case 'malediction':
      if (!enchantable(it)) { msg('The scroll crumbles. Nothing happens.', '6'); ok = false; break; }
      bumpItem(it, -1); layCurse(it); it.known = 1;
      msg(cap(itemName(it)) + ' turns black and cold. It is cursed!', 'R');
      break;
    case 'protect armor':
      if (!isGear(it)) { msg('That cannot be protected.', '6'); ok = false; break; }
      it.protected = 1;
      msg(cap(itemName(it)) + ' is sheathed in a golden shimmer.', 'y');
      break;
  }
  if (ok && scrollK !== undefined) KNOWN.scr[scrollK] = 1;
  return ok;
}
/* A scroll of enchantment on something that has no magic in it yet can
   put some there.  Only on a bow, and only if the bow is plain: the
   scroll's job is still the plusses, and this is the rarer thing that
   happens on top of them. */
function cutRune(it, chance) {
  if (!it || it.br) return 0;
  if (it.t !== 'weapon' || !WEAPONS[it.k].launch) return 0;
  addRune(it, 'wb', chance);
  if (!it.br) return 0;
  learnRune(it);                 /* you watched it being worked in */
  var rn = runeDef(it);
  msg('Something is worked into the wood. ' + cap(itemName(it)) + '.',
      rn && rn.bad ? 'R' : 'G');
  return 1;
}

function bumpItem(it, d) {
  /* A ring has no edge and no plate.  What a scroll does for it is wind
     it back up faster - or, cut the wrong way, slower. */
  if (it.t === 'ring') {
    it.quick = clamp((it.quick || 0) + d, -RING_QUICK_MAX, RING_QUICK_MAX);
    return;
  }
  if (it.t === 'weapon') {
    if (d > 0) { it.hp += d; it.dp += (d > 1 ? 1 : 0); }
    else { it.hp += d; }
  } else it.ap += d;
}

/* --------------------------------------------------- healing crystal */
function useCrystal(it) {
  if (squibbed('crystal')) return false;
  if (P.hp >= P.mhp) { msg('You are unhurt. The crystal stays cold.', '6'); return false; }
  var pct = CRYSTAL_MIN_PCT + rnd(CRYSTAL_MAX_PCT - CRYSTAL_MIN_PCT + 1);
  var heal = Math.max(1, Math.round(P.mhp * pct / 100));
  var hb3 = P.hp;
  P.hp = Math.min(P.mhp, P.hp + heal);
  holdHp(hb3, P.mhp);
  removeItem(it, 1);
  msg('The crystal warms and crumbles. ' + heal + ' hit points return.', 'G');
  return true;
}

/* ------------------------------------------------------------- blink */
function blinkTo(x, y) {
  if (Math.max(Math.abs(x - P.x), Math.abs(y - P.y)) > BLINK_RANGE) return false;
  if (monAt(L, x, y)) { msg('Something is already standing there.', 'R'); return true; }

  warpAway(P, P.x, P.y);
  P.x = x; P.y = y;
  computeVis();
  /* Through the wall is allowed.  Into it is not survivable. */
  if (!walkable(x, y)) {
    msg('You teleport into a wall and die!', 'R');
    hurtPlayer(P.hp + 1, 'blinking into solid rock');
    return true;
  }
  msg('The world lurches sideways.', 'P');
  afterStep();
  return true;
}

/* ------------------------------------------------------------- rings
   A ring of fire or of ice throws the same bolt a wand of fire or cold
   would, a little softer, and it costs a charge.  Aimed like a wand, so
   it goes down the same path and lands on the same creature. */
function zapRing(it, dx, dy) {
  breakClearwater('You give yourself away.');
  if (it.ch <= 0) { msg('The ring is cold and quiet.', '6'); return true; }
  var kind = RINGS[it.k].aim;
  if (!keepsCharge(it)) { it.ch--; it.wind = 0; }
  var path = [], x = P.x, y = P.y, i;
  for (i = 0; i < RING_BEAM_RANGE; i++) {
    x += dx; y += dy;
    if (isDoorish(x, y)) { path.push([x, y]); break; }
    if (blocksShot(x, y)) break;
    path.push([x, y]);
  }
  G.bolt = { path: path.slice(), kind: kind, mode: 'beam', dir: [dx, dy], t: Date.now() };
  sound('magic');
  var word = kind === 'fire' ? 'flame' : 'frost';
  var col = kind === 'fire' ? 'R' : 'c';
  msg('A lance of ' + word + ' leaps from the ring.', col);
  var pools = [], hits = 0;
  for (i = 0; i < path.length; i++) {
    var m = monAt(L, path[i][0], path[i][1]);
    if (m) {
      var d = elemDamage(m, perkElemental(roll(RING_BEAM[0], RING_BEAM[1]), kind), kind);
      hurtByPlayer(m); m.hp -= d;
      markHurt(m, P.x, P.y);
      hits++;
      if (m.hp <= 0) killMonster(m, true, d + (kind === 'fire' ? ' burn' : ' cold'));
      else {
        msgFight(fightLine(cap(word) + ' strikes ', monShort(m), '.'), col,
          d + (kind === 'fire' ? ' burn' : ' cold'), col, m);
        /* and then it does what fire and ice do */
        if (kind === 'fire') igniteMon(m, 'It catches light.');
        else freezeMon(m, 'It ices over.');
      }
    }
    if (isWater(path[i][0], path[i][1])) pools.push(path[i]);
  }
  if (kind === 'cold' && pools.length) conductPools(pools, 'cold');
  if (!hits) msg('It spends itself against the stone.', '6');
  computeVis();
  return true;
}
/* the ring of the seer: for a while, nothing on the floor is hidden */
function ringSeer(it) {
  if (!keepsCharge(it)) { it.ch--; it.wind = 0; }
  P.seer = Math.max(P.seer || 0, RING_SEER_TURNS);
  P.seeinv = Math.max(P.seeinv || 0, RING_SEER_TURNS);
  msg('The world sharpens. You see what is there.', 'P');
  computeVis();
  seerLook();
  return true;
}

/* the ring of light: the room, all of it, and it stays lit */
function ringLight(it) {
  if (!keepsCharge(it)) { it.ch--; it.wind = 0; }
  lightTheRoom('The ring blazes and the room comes up bright.',
               'The ring blazes, and the corridor swallows it.');
  return true;
}

/* ---------------------------------------------------------- identify */
function identifyItem(it) {
  if (!it) return;
  switch (it.t) {
    case 'potion': KNOWN.pot[it.k] = 1; break;
    case 'scroll': KNOWN.scr[it.k] = 1; break;
    case 'wand': KNOWN.wand[it.k] = 1; break;
    case 'ring': break;                       /* the name is on the band */
  }
  it.known = 1;
  learnRune(it);
  /* and now that you can put a name to this one, every other one of the
     kind is recognisable on sight - what any particular one is worth is
     still its own business */
  learnGear(it);
  msg('It is ' + itemName(it) + '.', 'c');
}

/* ---------------------------------------------------------- use */
function useItem(it) {
  if (!it) return { took: false };
  /* A stone has one obvious use, and it is not being worn.  ENTER on it
     does what the menu's Throw does. */
  if (it.t === 'weapon' && WEAPONS[it.k].thrown) return { took: false, hurl: it };
  switch (it.t) {
    case 'potion': return { took: quaff(it) };
    case 'scroll': return { took: readScroll(it) };
    case 'food': return { took: eat(it) };
    case 'crystal': return { took: useCrystal(it) };
    case 'wand':
      if (WANDS[it.k].blink && KNOWN.wand[it.k]) return { took: false, blink: it };
      return { took: false, aim: it };
    case 'ring':
      if (squibbed('ring')) return { took: false };
      if (RINGS[it.k].worn) {
        msg('It works by being carried, not pressed.', '6');
        return { took: false };
      }
      if (it.ch <= 0) { msg('The ring is cold and quiet.', '6'); return { took: false }; }
      /* fire and ice are pointed at something; light needs no aiming,
         because a room is not in any particular direction */
      if (RINGS[it.k].aim) return { took: false, aim: it };
      if (RINGS[it.k].light) return { took: ringLight(it) };
      if (RINGS[it.k].seer) return { took: ringSeer(it) };
      if (RINGS[it.k].spider) return { took: ringSpider(it) };
      /* the untouched puts you elsewhere; the other one puts you out of
         sight where you stand */
      if (RINGS[it.k].invis) {
        if (!keepsCharge(it)) { it.ch--; it.wind = 0; }
        P.unseen = Math.max(P.unseen, RING_INVIS_TURNS);
        msg('The world looks straight through you.', 'P');
        return { took: true };
      }
      return { took: false, blink: it };
    case 'pouch': return { took: false, pouch: it };
    case 'pin': return { took: false, pin: it };
    case 'dynamite': return { hurl: it };
    case 'weapon': case 'armor': case 'head': case 'feet': case 'shield': {
      var got = autoEquip(it);
      return { took: got, equipped: got };
    }
    case 'amulet':
      msg('The Amulet hums. Carry it up to the surface!', 'y');
      return { took: false };
  }
  return { took: false };
}

/* every line the inventory shows under an item's name: [text, colour] */
/* One line about the magic in a thing: what it does, that it is a mystery,
   or that there is nothing to know. */
function runeNote(it) {
  /* Knowing what the thing is and knowing what is worked into it are two
     different pieces of knowledge.  Wearing it gives you the first only.

     A thing you have identified and that has nothing in it says so - it
     is not a mystery, it is a plain sword.  Saying "enchantment unknown"
     of one was the first cut of this, and it turned every plain blade in
     the game into a maybe. */
  if (!it.known) return ['enchantment unknown', '4'];
  if (it.br && !it.brKnown) return ['enchantment unknown', '4'];
  var r = runeDef(it);
  if (r) return [r.txt, r.bad ? 'R' : 'G'];
  /* A plus or a property is an enchantment too, and it is already listed
     on its own line - so say nothing rather than contradict it. */
  var d = itemDef(it);
  if (it.ap || it.hp || it.dp || (d && d.prop)) return null;
  return ['no enchantment', '6'];
}
function pushNote(out, n) { if (n) out.push(n); }
function itemNotes(it) {
  if (!it) return [];
  var d = itemDef(it), out = [];
  if (it.chg > 0)
    out.push([isPlainAmmo(it) ? 'charged: it survives a throw'
      : it.chg + ' spare charge' + (it.chg > 1 ? 's' : ''), 'c']);
  if (it.known && isRuneStone(it) && WEAPONS[it.k].rune === 'return')
    out.push([(it.ret === undefined ? RETURN_USES : it.ret) + ' flights home left',
      (it.ret !== undefined && it.ret <= 3) ? 'O' : 'c']);
  if (it.homing) out.push(['charmed: it comes back to you', 'G']);
  switch (it.t) {
    case 'ring':
      out.push([d.txt, 'c']);
      if (d.worn) { out.push(['it works while you carry it', 'G']); break; }
      if (d.invis) out.push([RING_INVIS_TURNS + ' turns unseen a charge', 'c']);
      if (d.seer) out.push([RING_SEER_TURNS + ' turns of seeing all', 'c']);
      out.push([it.ch + ' of ' + ringCap(it) + ' charges', it.ch ? 'c' : 'O']);
      if (it.ch < ringCap(it))
        out.push([(ringWind(it) - (it.wind || 0)) + ' turns to the next', '6']);
      if (it.quick)
        out.push([(it.quick > 0 ? 'winds up ' : 'winds up ') +
          Math.abs(Math.round((1 - ringWind(it) / ringBaseWind(it)) * 100)) + '% ' +
          (it.quick > 0 ? 'faster' : 'slower'), it.quick > 0 ? 'G' : 'R']);
      break;
    case 'weapon':
      out.push(['damage ' + d.d[0] + 'd' + d.d[1], '6']);
      if (d.launch) out.push(['fires ' + d.ammo + 's', 'c']);
      if (d.ammoFor)
        out.push([d.ammoText || ('for a ' + d.ammoFor + (d.alsoFor ? ' or ' + d.alsoFor : '')), 'c']);
      if (d.hurl) out.push(['wield or throw it; never lost', 'c']);
      if (numbersKnown(it) && (it.hp || it.dp))
        out.push([sgn(it.hp) + ' to hit, ' + sgn(it.dp) + ' damage',
          (it.hp + it.dp) < 0 ? 'R' : 'G']);
      pushNote(out, runeNote(it));
      break;
    case 'armor': case 'head': case 'feet': case 'shield':
      out.push(['protection ' + shownAC(it), '6']);
      /* What a thing does is exactly what identifying is for.  Printing
         "you blink at random" on an unknown pair of sandals gave the
         whole game away, curse and all. */
      if (d.prop && PROP_TEXT[d.prop] && numbersKnown(it))
        out.push(PROP_TEXT[d.prop].slice());
      if (numbersKnown(it) && it.ap) out.push([sgn(it.ap) + ' protection',
        it.ap < 0 ? 'R' : 'G']);
      pushNote(out, runeNote(it));
      if (it.protected) out.push(['protected from rust', 'c']);
      break;
    case 'potion':
      out.push([KNOWN.pot[it.k] ? 'you know this brew' : 'unknown - drink to learn',
        KNOWN.pot[it.k] ? '6' : '4']);
      break;
    case 'scroll':
      out.push([KNOWN.scr[it.k] ? 'you know this scroll' : 'unknown - read to learn',
        KNOWN.scr[it.k] ? '6' : '4']);
      if (KNOWN.scr[it.k] && d.pick) out.push(['you choose the target', 'c']);
      break;
    case 'wand':
      out.push([KNOWN.wand[it.k] ? it.ch + ' charges left' : 'unknown - zap to learn',
        KNOWN.wand[it.k] ? '6' : '4']);
      break;
    case 'food':
      out.push([FOODS[it.k].feed[0] >= 700 ? 'a meal: it fills you up'
        : 'a snack: it takes the edge off', '6']);
      break;
    case 'crystal': out.push(['heals ' + CRYSTAL_MIN_PCT + '-' + CRYSTAL_MAX_PCT + '% of your health', '6'],
      ['about ' + Math.max(1, Math.round(P.mhp * 0.175)) + ' hit points for you', 'c']); break;
    case 'dynamite': out.push(['throw it to blast stone', 'O'],
      ['four squares, and it hurts', '6']); break;
    case 'pin': out.push(['pin it on any clothing', '6'],
      ['it will change it somehow', 'y'],
      ['not always for the better', 'R']); break;
    case 'chest': out.push(['holds ' + CHEST_CAP + ' things', '6'],
      ['step on it to look inside', 'c']); break;
    case 'pouch': out.push(['holds ' + POUCH_CAP + ' things', '6'],
      ['SPACE opens it', 'c']); break;
    case 'key': out.push(['opens ' + MATS[it.k] + ' doors', '6'],
      ['and ' + MATS[it.k] + ' chests', '6']); break;
    case 'amulet': out.push(['carry it out to win', 'y']); break;
  }
  /* the weight in your hand tells you this much, name or no name */
  if (it.cursed && numbersKnown(it)) out.push(['CURSED - cannot be removed', 'R']);
  return out;
}

function computeScore() {
  var s = P.gold + P.exp;
  if (P.amulet) s += 10000;
  return s;
}
