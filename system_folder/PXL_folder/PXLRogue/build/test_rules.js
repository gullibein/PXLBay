/* The rules suite: what happens when you walk about on a floor.

   test.js builds floors and weighs what is on them; this one asks how
   the game behaves once one exists.  They were a single file until it
   grew past three minutes, which is longer than anybody waits before
   they stop running it. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname;
const ATLAS = JSON.parse(fs.readFileSync(path.join(D, 'atlas.json')));

const src = ['part1_core.js', 'part2_game.js', 'part3_actions.js', 'part5_sound.js']
  .map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n');

/* The engine runs in this process's own global scope rather than a vm
   sandbox.  A sandbox proxies every global read, which made generating a
   floor about fifty times slower than it is in a browser - slow enough
   that the suite could not finish, and not what the game actually does. */
globalThis.ATLAS = ATLAS;
/* The save store lives in the browser.  Here it is a plain object with
   the same three methods, so the round trip is the real one. */
globalThis.window = {
  localStorage: (function () {
    const m = {};
    return {
      getItem: k => (k in m ? m[k] : null),
      setItem: (k, v) => { m[k] = String(v); },
      removeItem: k => { delete m[k]; }
    };
  })()
};
vm.runInThisContext(src);
const ctx = globalThis;

vm.runInThisContext(fs.readFileSync(path.join(D, 'harness.js'), 'utf8'));

/* The rules suite starts from a fresh run of its own. */
let errors = [];
const check = (c, m) => { if (!c) errors.push(m); };
ctx.bootTest(1);

/* --- 7. the three section combat bar ------------------------------- */
for (let s = 0; s < 6; s++) { ctx.bootTest(31000 + s); ctx.combatDrill(); }
const fs2 = ctx.fightStats();
const FBW = ctx.barWidths().fight;
console.log('combat lines : ' + fs2.n + ' seen, widest action ' + fs2.maxS +
  '/' + FBW.lw + ', widest effect ' + fs2.maxFx + '/' + FBW.mw);
check(fs2.maxS <= FBW.lw, 'combat action text too wide: ' + fs2.maxS + '/' + FBW.lw);
check(fs2.maxFx <= FBW.mw, 'combat effect text too wide: ' + fs2.maxFx + '/' + FBW.mw);
check(fs2.bad.length === 0, 'bad combat lines: ' + [...new Set(fs2.bad)].slice(0, 5).join(', '));
check(fs2.n > 800, 'the soak barely fought anything: ' + fs2.n);

/* --- 7b. fire, ice, rings, food, and what the cursor tells you ------ */
{
  const fi = ctx.fireIceOK();
  console.log('fire and ice : catches ' + fi.catchPct + '% of hits, burns ' +
    ctx.BURN_MIN + '-' + ctx.BURN_MAX + ' turns; ice freezes ' +
    ctx.ICE_MIN + '-' + ctx.ICE_MAX + ' turns');
  check(fi.bad.length === 0, 'fire and ice: ' + [...new Set(fi.bad)].slice(0, 4).join('; '));
  /* the runes do the damage of the weapon they are cut into, no more */
  const plain = ctx.WEAPONS[ctx.weaponIndex('long sword')].d;
  console.log('             : a sword of fire does the same ' + plain[0] + 'd' + plain[1] +
    ' as a plain one - the burning is the extra');
  check(ctx.RUNE_BY_NAME['fire'] && ctx.RUNE_BY_NAME['ice'],
    'the runes are not called fire and ice');

  const bt = ctx.burnTrailOK();
  console.log('burning      : ' + (bt.bad.length ? bt.bad.length + ' problems' :
    'it loses blood each turn, lays fire on the square it leaves, and that fire burns you too'));
  check(bt.bad.length === 0, 'burning: ' + [...new Set(bt.bad)].slice(0, 4).join('; '));

  const kh = ctx.keyHomesOK(8);
  console.log('key homes    : ' + kh.homes + ' recorded over ' + kh.floors +
    ' floors, ' + (kh.bad.length ? kh.bad.length + ' with no key on them' :
    'every one with its key standing on it'));
  check(kh.bad.length === 0, 'key homes: ' + [...new Set(kh.bad)].slice(0, 3).join('; '));

  const rg = ctx.ringsOK();
  console.log('rings        : winds up in ' + rg.base + ' turns, ' + rg.oneScroll +
    ' with a scroll, ' + rg.twoScrolls + ' with two');
  check(rg.bad.length === 0, 'rings: ' + [...new Set(rg.bad)].slice(0, 4).join('; '));

  const fd = ctx.foodOK();
  console.log('food         : ' + fd.names + ' (' + fd.meals + ' meal, ' +
    fd.snacks + ' snacks) plus a potion of nourishment');
  check(fd.bad.length === 0, 'food: ' + [...new Set(fd.bad)].slice(0, 4).join('; '));

  const tc = ctx.thrownConfusionOK();
  console.log('thrown potion: a potion of confusion confused ' + tc.hit + ' of 40 it hit');
  check(tc.bad.length === 0, 'thrown confusion: ' + [...new Set(tc.bad)].slice(0, 3).join('; '));

  const lk = ctx.lookOnlyTheThingOK();
  console.log('the ? cursor : a bare square gives ' + lk.bare + ' lines; put an item, a ' +
    'creature or any of ' + lk.decor + ' kinds of ground cover on it and the floor ' +
    'drops out of the report');
  check(lk.bad.length === 0, 'look: ' + [...new Set(lk.bad)].slice(0, 4).join('; '));

  /* the scroll you most want is the one you find most often */
  {
    const tot = ctx.SCROLLS.reduce((a, s) => a + s.p, 0);
    const id = ctx.SCROLLS.find(s => s.n === 'identify');
    const share = id.p * 100 / tot;
    const next = ctx.SCROLLS.filter(s => s !== id).sort((a, b) => b.p - a.p)[0];
    console.log('scrolls      : identify is ' + share.toFixed(0) + '% of them, ' +
      'next commonest is ' + next.n + ' at ' + (next.p * 100 / tot).toFixed(0) + '%');
    check(share > 15, 'identify is only ' + share.toFixed(0) + '% of scrolls');
    check(id.p > next.p, 'identify is not the commonest scroll');
  }
}

/* --- 7c. rings, and what light does to a vampire -------------------- */
{
  const rs = ctx.ringSetOK(8);
  console.log('the ring set : ' + rs.perRun + ' rings in 4000 rolls of a run, ' +
    'never two of a kind (' + rs.kinds + ')');
  check(rs.bad.length === 0, 'ring set: ' + [...new Set(rs.bad)].slice(0, 4).join('; '));
  check(rs.worst <= 1, 'a run turned up ' + rs.worst + ' of one ring');

  const rr = ctx.ringRarity(4);
  console.log('             : ' + rr.perRun + ' lying about in a whole descent, ' +
    rr.perFloor + ' a floor');
  check(rr.perRun < 3, 'a whole descent turns up ' + rr.perRun + ' rings - too many');

  const nr = ctx.newRingsOK();
  console.log('new rings    : fire burned ' + nr.burned + '/20, ice froze ' + nr.frozen +
    '/20, light lit ' + nr.lit + '/20 rooms');
  check(nr.bad.length === 0, 'new rings: ' + [...new Set(nr.bad)].slice(0, 4).join('; '));

  const vl = ctx.vampireLightOK();
  console.log('vampires     : conjured light costs one ' + vl.soft + ' damage a bite, ' +
    vl.armour + ' armour, and half its turns (' + vl.moves + ' in 20 instead of 20)');
  console.log('             : a beam from a wand of light does ' + vl.dmg.toFixed(1) +
    ' to a vampire and nothing at all to an orc');
  check(vl.bad.length === 0, 'vampires: ' + [...new Set(vl.bad)].slice(0, 4).join('; '));
}

/* --- 7d. stones, ambushes, water and the half dragon ---------------- */
{
  const sl = ctx.stoneLearningOK();
  console.log('runed stones : ' + sl.learned + '/' + sl.kinds +
    ' name themselves the moment you watch one work (' + sl.names + ')');
  check(sl.bad.length === 0, 'runed stones: ' + [...new Set(sl.bad)].slice(0, 4).join('; '));
  check(sl.learned === sl.kinds, 'only ' + sl.learned + ' of ' + sl.kinds + ' stones identify');

  const sa = ctx.struckAwareOK();
  console.log('ambushes     : over ' + sa.trials + ' creatures, ' + sa.secondSneak +
    ' could be ambushed twice running; ' + sa.afterHiding +
    ' were caught out again after two rounds out of sight');
  check(sa.bad.length === 0, 'ambushes: ' + [...new Set(sa.bad)].slice(0, 3).join('; '));

  const wa = ctx.waterOK();
  console.log('water        : holy water does ' + wa.vamp.toFixed(1) +
    ' to a vampire and nothing to an orc; plain water doused ' +
    wa.doused + '/' + wa.tries + ' half dragons');
  check(wa.bad.length === 0, 'water: ' + [...new Set(wa.bad)].slice(0, 4).join('; '));

  const hd = ctx.halfDragonOK();
  console.log('half dragon  : orc health, a worse bite, spits every ' +
    hd.gap.toFixed(1) + ' turns; cold does ' + hd.cold.toFixed(2) +
    'x, fire ' + hd.fire.toFixed(2) + 'x what an orc takes');
  check(hd.bad.length === 0, 'half dragon: ' + [...new Set(hd.bad)].slice(0, 4).join('; '));

  const hs = ctx.halfDragonSpawnOK(6);
  console.log('             : ' + hs.seen + ' met over ' + hs.floors +
    ' floors, none above floor ' + ctx.MON_BY_C['h'].minDepth);
  check(hs.seen > 0, 'the half dragon never turns up');
  check(hs.shallow === 0, hs.shallow + ' half dragons were found too near the surface');
}

/* --- 7e. following a cold trail, and getting past your own --------- */
{
  const ht = ctx.huntTrailOK(60);
  console.log('the search   : of ' + ht.tried + ' hunters that lost sight of you, ' +
    ht.took + ' took up the trail and ' + ht.stood +
    ' stood on the very square you were last seen on');
  console.log('             : then cast about ' + ht.cast.toFixed(1) + ' squares beyond it (' +
    ht.onward + ' onward against ' + ht.backward + ' back the way it came), ' +
    ht.turns.toFixed(1) + ' turns of hunting in all');
  check(ht.bad.length === 0, 'the search: ' + [...new Set(ht.bad)].slice(0, 4).join('; '));

  const ab = ctx.alertedByOK();
  console.log('once it is hit : ' + ab.ways +
    ' - creatures that could be ambushed a second time straight afterwards');
  check(ab.bad.length === 0, 'alerting: ' + [...new Set(ab.bad)].slice(0, 4).join('; '));

  const lt = ctx.lostTurnsCountOK();
  console.log('turns it lost: ' + lt.ways +
    ' - caught out after two rounds out of sight, however it spent them');
  check(lt.bad.length === 0, 'lost turns: ' + [...new Set(lt.bad)].slice(0, 4).join('; '));

  const bf = ctx.breathOK();
  console.log('breathed fire: after ' + ctx.BREATH_LEAD + 'ms, and burning where it went - ' +
    bf.ways);
  check(bf.bad.length === 0, 'breath: ' + [...new Set(bf.bad)].slice(0, 4).join('; '));

  const fso = ctx.fireSourcesOK(20);
  console.log('what sets fire: ' + fso.ways);
  check(fso.bad.length === 0, 'fire sources: ' + [...new Set(fso.bad)].slice(0, 4).join('; '));

  const bsh = ctx.blastShapeOK(20);
  console.log('a barrel going up: ' + bsh.squares + ' squares - two straight out, one on the ' +
    'diagonals; ' + bsh.fuses + ' lit barrels stood in plain sight');
  check(bsh.bad.length === 0, 'blast shape: ' + [...new Set(bsh.bad)].slice(0, 4).join('; '));

  const ew = ctx.effectsWaitOK(20);
  console.log('effects wait : ' + ew.ways + ' - nothing is on the floor before the thing ' +
    'that put it there');
  check(ew.bad.length === 0, 'effects wait: ' + [...new Set(ew.bad)].slice(0, 4).join('; '));

  const osa = ctx.oneStoneAloftOK(20);
  console.log('a stone that misses: ' + osa.tried + ' sailed on past and came home from where ' +
    'they landed; ' + osa.overlapped + ' were in the air twice at once');
  check(osa.bad.length === 0, 'stone aloft: ' + [...new Set(osa.bad)].slice(0, 3).join('; '));

  const tk = ctx.threeKindsOfKnowingOK();
  console.log('what you know: ' + tk.ways);
  check(tk.bad.length === 0, 'knowing: ' + [...new Set(tk.bad)].slice(0, 4).join('; '));

  const cr = ctx.carriedRingsOK(20);
  console.log('carried rings: battle luck lands a telling blow ' + cr.crit +
    ' of the time and keeps ' + cr.keep + ' of its shafts; the huntress turns ' + cr.mix +
    ' of loose ammunition into arrows');
  check(cr.bad.length === 0, 'carried rings: ' + [...new Set(cr.bad)].slice(0, 4).join('; '));

  const rsec = ctx.runeSecretOK();
  console.log('enchantments : wearing a thing names the thing and nothing else; a scroll or a ' +
    'good eye turns up what is worked into it (' + rsec.studied + ' studied)');
  check(rsec.bad.length === 0, 'rune secret: ' + [...new Set(rsec.bad)].slice(0, 4).join('; '));

  const pt = ctx.pinnedTrapOK(20);
  console.log('a stone on a trap: ' + pt.held + '/' + pt.tried + ' plates stayed down and the ' +
    'stone came up with you; a bare one still went off ' + pt.bare);
  check(pt.bad.length === 0, 'pinned trap: ' + [...new Set(pt.bad)].slice(0, 3).join('; '));

  const cf = ctx.crossfireOK(20);
  console.log('in the way   : ' + cf.caught + '/' + cf.tried +
    ' standing between the wall and the plate took the dart, and it reached you ' +
    (cf.tried - cf.spared) + ' times');
  check(cf.bad.length === 0, 'crossfire: ' + [...new Set(cf.bad)].slice(0, 3).join('; '));

  const ms = ctx.mossIsSafeOK(40);
  console.log('the moss     : ' + ms.gardens + ' gardens, ' + ms.trapped + ' with anything underfoot');
  check(ms.bad.length === 0, 'moss: ' + [...new Set(ms.bad)].slice(0, 3).join('; '));

  const dd = ctx.doorsAreDoorsOK(20);
  console.log('doors        : ' + dd.doors + ' over ' + dd.floors + ' floors, ' + dd.loose +
    ' standing in the open and ' + dd.corrInRoom + ' squares of hallway inside a room');
  check(dd.bad.length === 0, 'doors: ' + [...new Set(dd.bad)].slice(0, 3).join('; '));

  const bw = ctx.bowsOK();
  console.log('bows         : ' + bw.ways + ' - all four take the same arrows');
  check(bw.bad.length === 0, 'bows: ' + [...new Set(bw.bad)].slice(0, 4).join('; '));

  const bfire = ctx.bowOfFireOK(20);
  console.log('bow of fire  : ' + bfire.lit + '/' + bfire.hits + ' shots set their mark alight ' +
    'and ' + bfire.hitFires + ' left the square burning; ' + bfire.missFires + '/' +
    bfire.misses + ' wide shots lit where they fell; a plain bow lit nothing in ' +
    bfire.plain + ', and an unlearned one nothing in ' + bfire.unknown);
  check(bfire.bad.length === 0, 'bow of fire: ' + [...new Set(bfire.bad)].slice(0, 4).join('; '));

  const sb3 = ctx.spiderBowOK(20);
  console.log('bow of the spider: web on ' + sb3.webs + ' of ' + sb3.shots + ' shots (' +
    sb3.pct + '%), no arrow spent and no damage done; ' + sb3.onBow +
    ' bows took the rune and a scroll cut it into ' + sb3.cut +
    '; unidentified, it loosed web ' + sb3.blind);
  check(sb3.bad.length === 0, 'spider bow: ' + [...new Set(sb3.bad)].slice(0, 4).join('; '));

  const af = ctx.allyFollowsOK(20);
  console.log('your spider  : kept up in ' + af.trailed + '/' + af.tried +
    ' walks (never more than ' + af.worst + ' squares behind) and took the nearer of two ' +
    af.right + '/' + af.picks + ' times');
  check(af.bad.length === 0, 'ally follows: ' + [...new Set(af.bad)].slice(0, 4).join('; '));

  const hs = ctx.hurtShowsOK(20);
  console.log('being hurt   : ' + hs.ways + ' - nothing takes health off you without showing it');
  check(hs.bad.length === 0, 'being hurt: ' + [...new Set(hs.bad)].slice(0, 4).join('; '));

  const wp = ctx.warpOK(20);
  console.log('teleporting  : ' + wp.drew + '/' + wp.tried + ' shook, flashed and went; it came ' +
    'to nothing ' + wp.pct + '% of the time (wanted ' + ctx.WITCH_BLINK_FAIL + '%), and ' +
    wp.summons + ' spiders were thrown to where they landed; ' +
    wp.aimed + ', and was pinned ' + wp.pinned +
    ' times with you standing over her');
  check(wp.bad.length === 0, 'teleporting: ' + [...new Set(wp.bad)].slice(0, 4).join('; '));

  const wk = ctx.witchOK(20);
  console.log('the witch    : ' + wk.witches + ' of them over ' + wk.turns + ' turns - no blow ' +
    'landed, ' + wk.flasks + ' flasks (two apiece), ' + wk.spiders + ' spiders (never two at ' +
    'once), ' + wk.rocks + ' stones and ' + wk.blinks + ' steps sideways');
  console.log('             : she was within reach ' + wk.adjacent + ' times in ' + wk.turns +
    ', and waited ' + wk.wait + ' turns before calling another spider');
  check(wk.bad.length === 0, 'witch: ' + [...new Set(wk.bad)].slice(0, 4).join('; '));

  const wr = ctx.witchRingOK(20);
  console.log('her ring     : left behind ' + wr.dropped + ' times in ' + wr.kills +
    '; three charges, one spider at a time, ' + ctx.WITCH_RING_TURNS + ' turns a charge');
  check(wr.bad.length === 0, 'witch ring: ' + [...new Set(wr.bad)].slice(0, 4).join('; '));

  const bst = ctx.blastStoneOK(20);
  console.log('blasting stone: ' + bst.tried + ' thrown against a wall filled ' + bst.cells +
    ' squares, none of them stone and none behind a wall; ' + bst.burnt +
    ' left the place burning and ' + bst.lit + ' set off the barrel beside them');
  check(bst.bad.length === 0, 'blasting stone: ' + [...new Set(bst.bad)].slice(0, 4).join('; '));

  const tf = ctx.thrownFireWaitsOK();
  console.log('thrown fire  : the flames a fireball leaves start ' + tf.ball +
    'ms after the creature spits, a jet\'s ' + tf.jet + 'ms - the wait is ' +
    ctx.BREATH_LEAD + 'ms');
  check(tf.bad.length === 0, 'thrown fire: ' + [...new Set(tf.bad)].slice(0, 3).join('; '));

  const bs2 = ctx.barrelsAreSolidOK(20);
  console.log('solid barrels: ' + bs2.kept + ' standing over ' + bs2.floors +
    ' floors, none of them walling a way through; walked into ' + bs2.blocked +
    ' and stopped every time');
  check(bs2.bad.length === 0, 'solid barrels: ' + [...new Set(bs2.bad)].slice(0, 3).join('; '));

  const so = ctx.stumbleOnlyWalkingOK();
  console.log('stumbling    : ' + so.ways);
  check(so.bad.length === 0, 'stumbling: ' + [...new Set(so.bad)].slice(0, 3).join('; '));

  const sp = ctx.spillThroughHoleOK(20);
  console.log('light through a hole: standing in ' + sp.cases + ' rooms with no lamp and breaking ' +
    'the wall into a lit one let the light into ' + sp.letIn + ' of them, ' + sp.lit +
    ' squares apiece - ' + sp.before + ' squares in sight before, ' + sp.after + ' after');
  check(sp.bad.length === 0, 'spill through a hole: ' + [...new Set(sp.bad)].slice(0, 3).join('; '));

  const bo = ctx.blastOpensLightOK(20, 0), bo2 = ctx.blastOpensLightOK(20, 1);
  console.log('a hole in a wall: ' + (bo.opened + bo2.opened) + ' squares opened by ' +
    (bo.cases + bo2.cases) + ' blasts and sticks join the room they opened into - ' +
    (bo.dim + bo2.dim) + ' were left off the lit room and drawn as if the wall still stood');
  check(bo.bad.length === 0, 'blast light: ' + [...new Set(bo.bad)].slice(0, 3).join('; '));
  check(bo2.bad.length === 0, 'dynamite light: ' + [...new Set(bo2.bad)].slice(0, 3).join('; '));

  const sb = ctx.strayBarrelsOK(200);
  console.log('loose powder : ' + sb.loose + ' barrels left about ' + sb.withOne + ' of ' +
    sb.floors + ' floors, at most ' + sb.most + ' on one, none touching another or in a doorway' +
    ' (and ' + sb.stored + ' more in the stores)');
  check(sb.bad.length === 0, 'stray barrels: ' + [...new Set(sb.bad)].slice(0, 4).join('; '));

  const sc = ctx.sceneryBurnsOK(120);
  console.log('what burns   : fire lasts ' + sc.plain + ' turn on bare stone - ' + sc.lines);
  console.log('             : ' + sc.held + ' of ' + sc.stone +
    ' kinds of stone and bone scenery were untouched by it');
  check(sc.bad.length === 0, 'burning scenery: ' + [...new Set(sc.bad)].slice(0, 4).join('; '));

  const bs = ctx.breathStaysInsideOK(120);
  console.log('             : ' + bs.jets + ' crooked jets burned ' + bs.floor +
    ' squares of floor and ' + bs.stone + ' of solid rock; ' + bs.reached +
    ' got to the player');
  console.log('             : powder on the line caught ' + bs.lit + '/' + bs.hits +
    ' times, and 0/' + bs.past + ' times through a wall');
  check(bs.bad.length === 0, 'breath reach: ' + [...new Set(bs.bad)].slice(0, 4).join('; '));

  const dw = ctx.darkWordsOK();
  console.log('into the dark: "' + dw.plain + '" without night eyes, "' + dw.eyes +
    '" with them, and nothing at all on the way out');
  check(dw.bad.length === 0, 'dark words: ' + [...new Set(dw.bad)].slice(0, 3).join('; '));

  const sv = ctx.statReadingsOK();
  console.log('the readings : experience counts against the next level all the way to 21, ' +
    'and hunger reads as a share of a full stomach in ' + sv.words + ' words');
  check(sv.bad.length === 0, 'readings: ' + [...new Set(sv.bad)].slice(0, 4).join('; '));

  const aw = ctx.archwaysOK(20);
  console.log('ways through : over ' + aw.floors + ' floors, ' + aw.doors + ' doors and ' +
    aw.arches + ' plain openings (' + aw.pct.toFixed(0) + '% open), and an opening ' +
    'stops neither sight nor arrows');
  check(aw.bad.length === 0, 'archways: ' + [...new Set(aw.bad)].slice(0, 3).join('; '));

  const ls = ctx.lightSpillOK();
  console.log('light spills : ' + ctx.SPILL_RANGE + ' squares through an opening and none ' +
    'through a door; ' + ls.avg.toFixed(1) + ' squares of dark lit on a floor that has both');
  check(ls.bad.length === 0, 'light spill: ' + [...new Set(ls.bad)].slice(0, 3).join('; '));

  const stk = ctx.stackingOK();
  console.log('stacking     : all ' + stk.kinds + ' kinds that should share a slot do, ' +
    'and armour does not');
  check(stk.bad.length === 0, 'stacking: ' + [...new Set(stk.bad)].slice(0, 4).join('; '));

  const wf = ctx.wearFromFloorOK();
  console.log('a full pack  : offers ENTER to put on what you are standing on, ' +
    'and puts down what it replaces');
  check(wf.bad.length === 0, 'wearing off the floor: ' + [...new Set(wf.bad)].slice(0, 4).join('; '));

  const gl = ctx.gearLooksOK();
  console.log('unknown gear : all ' + gl.hidden + '/' + gl.total +
    ' kinds of weapon and armour hide behind one of ' + gl.looks +
    ' looks until you handle one - name, numbers and curse together');
  check(gl.bad.length === 0, 'gear looks: ' + [...new Set(gl.bad)].slice(0, 4).join('; '));

  const sr2 = ctx.sightReachOK(20);
  console.log('how far you see: from ' + sr2.stood + ' hallways, the furthest door was drawn ' +
    sr2.doorMargin + ' squares beyond the furthest floor in sight and the furthest wall ' +
    sr2.wallMargin + ' (it used to be 5)');
  console.log('             : standing in ' + sr2.rooms + ' lit rooms, ' + sr2.doors +
    ' of their own doors drawn and ' + sr2.holes + ' gaps in the outline');
  check(sr2.bad.length === 0, 'sight reach: ' + [...new Set(sr2.bad)].slice(0, 3).join('; '));

  const ws = ctx.webSpinnerOK(60);
  console.log('web spinners : ' + ws.shots + ' shots over ' + ws.tries + ' set ups, one every ' +
    ws.gap.toFixed(1) + ' turns - ' + ws.stuck + ' stuck you where you stood, ' +
    ws.laid + ' left web on the floor');
  check(ws.bad.length === 0, 'web spinner: ' + [...new Set(ws.bad)].slice(0, 4).join('; '));

  const br = ctx.barrelsOK(30);
  console.log('powder rooms : ' + br.chains + '/' + br.rooms +
    ' went up whole from one burning stone, over ' + br.turns.toFixed(1) +
    ' turns, opening ' + br.opened + ' squares of wall');
  console.log('             : the blast carries ' + ctx.BARREL_BLAST +
    ' squares (' + br.reach + ')');
  console.log('             : dynamite thrown among them lights ' + br.byStick +
    ', a wall of fire raised over one lights ' + br.byFire);
  check(br.bad.length === 0, 'barrels: ' + [...new Set(br.bad)].slice(0, 4).join('; '));

  const fl = ctx.fightLineOK();
  console.log('combat lines : ' + fl.phrases + ' phrases against ' + fl.names +
    ' names, widest ' + fl.widest + '/' + ctx.FIGHT_COLS + ' - ' + fl.whole +
    ' fit whole, ' + fl.noStop + ' gave up only the full stop, ' + fl.trimmed +
    ' a word of the phrase as well, and none the middle of a name');
  check(fl.bad.length === 0, 'fight lines: ' + [...new Set(fl.bad)].slice(0, 4).join('; '));

  const da = ctx.doorAmbushOK(60);
  console.log('through a door: ' + da.sawThrough + ' of ' + da.tried +
    ' could see through a shut one; ' + da.caught +
    ' were caught out the moment they stepped into the doorway');
  check(da.bad.length === 0, 'doorways: ' + [...new Set(da.bad)].slice(0, 3).join('; '));

  const dk = ctx.darknessOK(10);
  console.log('the dark     : ' + dk.roomPct.toFixed(0) + '% of rooms and ' +
    dk.hallPct.toFixed(0) + '% of hallway, on ' + dk.withDark + ' of ' + dk.floors + ' floors');
  console.log('             : ' + dk.lit.toFixed(0) + ' squares in sight from a lit room, ' +
    dk.dim.toFixed(0) + ' from a dark one, ' + dk.eyes.toFixed(0) + ' with Night stalker');
  console.log('             : across a dark room an orc saw you ' + dk.orc +
    ', a bat ' + dk.bat + ', a vampire ' + dk.vamp);
  check(dk.bad.length === 0, 'darkness: ' + [...new Set(dk.bad)].slice(0, 4).join('; '));

  const wd = ctx.wandOfDarknessOK();
  console.log('             : a wand of darkness put out ' + wd.doused + '/' + wd.tried + ' rooms');
  check(wd.bad.length === 0, 'wand of darkness: ' + [...new Set(wd.bad)].slice(0, 3).join('; '));

  const cn = ctx.curseNamedOK();
  console.log('curses       : all ' + cn.kinds + ' kinds of kit read as cursed the moment ' +
    'they are on you, and not a moment before');
  check(cn.bad.length === 0, 'curse naming: ' + [...new Set(cn.bad)].slice(0, 4).join('; '));

  const st = ctx.stumbleOK();
  console.log('running      : ' + ctx.RUN_AFTER + ' steps without a blow, with something ' +
    'hostile in sight within ' + ctx.BATTLE_NEAR + ' squares: ' + st.falls +
    ' falls in ' + st.steps + ' steps, none before the fifth');
  console.log('             : ' + st.quiet + ' falls in ' + st.quietSteps +
    ' steps with nothing in sight - including one hunting you from behind a wall');
  console.log('             : ' + st.lowDex + '% at dexterity 6, ' + st.highDex +
    '% at 20; a frightened creature ' + st.scared + '% against a calm ' + st.calm + '%');
  check(st.bad.length === 0, 'stumbling: ' + [...new Set(st.bad)].slice(0, 4).join('; '));

  const sf = ctx.stumbleFleeingOnlyOK();
  console.log('turning tail : ' + sf.ways + ' - a step towards a second creature is ' +
    'closing with it, not running away, and cannot trip you');
  check(sf.bad.length === 0, 'fleeing: ' + [...new Set(sf.bad)].slice(0, 3).join('; '));

  const sr = ctx.seerOK();
  console.log('the seer     : ' + ctx.RING_SEER_TURNS + ' turns a charge; it found ' +
    sr.doors + '/' + sr.tried + ' hidden seams and ' + sr.traps + '/' + sr.tried +
    ' traps, and lends you night eyes and sight of the invisible');
  check(sr.bad.length === 0, 'the seer: ' + [...new Set(sr.bad)].slice(0, 4).join('; '));

  const as = ctx.allySwapOK();
  console.log('your own     : walked into ' + as.tried + ' allies, changed places with ' +
    as.swaps + ', struck none; an enemy in the same square is still struck');
  check(as.bad.length === 0, 'allies: ' + [...new Set(as.bad)].slice(0, 4).join('; '));
}

/* --- 8. saving a run and taking it up again ------------------------ */
{
  let same = 0, tried = 0, mismatch = null, sizes = [];
  for (let s = 0; s < 10; s++) {
    if (!ctx.playAWhile(52000 + s, 260)) continue;   /* dead runs cannot be saved */
    tried++;
    const before = ctx.runPrint();
    const err = ctx.saveInto(s % ctx.SAVE_SLOTS);
    if (err) { mismatch = mismatch || ('save refused: ' + err); continue; }
    sizes.push(JSON.stringify(ctx.packRun()).length);
    /* wander off: a brand new run, nothing of the old one left in memory */
    ctx.playAWhile(99000 + s, 120);
    const err2 = ctx.loadFrom(s % ctx.SAVE_SLOTS);
    if (err2) { mismatch = mismatch || ('load refused: ' + err2); continue; }
    const after = ctx.runPrint();
    if (before === after) same++;
    else if (!mismatch) {
      const a = before.split('\n'), b = after.split('\n');
      for (let i = 0; i < Math.max(a.length, b.length); i++)
        if (a[i] !== b[i]) { mismatch = 'line ' + i + ': ' + String(a[i]).slice(0, 70) +
                                        ' -> ' + String(b[i]).slice(0, 70); break; }
    }
  }
  const kb = sizes.length ? Math.round(sizes.reduce((x, y) => x + y, 0) / sizes.length / 1024) : 0;
  console.log('save and load: ' + same + '/' + tried + ' runs came back exactly as they went in, ' +
    'about ' + kb + 'kB each');
  check(tried >= 3, 'too few runs survived long enough to save: ' + tried);
  check(same === tried, 'a saved run came back different - ' + mismatch);
  check(kb < 700, 'a save is ' + kb + 'kB, too big for the store');

  const md = ctx.monDefsOK();
  console.log('             : ' + (md.length ? md.length + ' problems' :
    'every creature came back pointing at the real table entry'));
  check(md.length === 0, 'monster entries after loading: ' + md.slice(0, 3).join('; '));

  /* three slots that do not tread on one another */
  ctx.playAWhile(61001, 200); const s0 = ctx.runPrint(); ctx.saveInto(0);
  ctx.playAWhile(61002, 200); const s1 = ctx.runPrint(); ctx.saveInto(1);
  ctx.playAWhile(61003, 200); const s2 = ctx.runPrint(); ctx.saveInto(2);
  ctx.loadFrom(0); const g0 = ctx.runPrint();
  ctx.loadFrom(2); const g2 = ctx.runPrint();
  ctx.loadFrom(1); const g1 = ctx.runPrint();
  console.log('             : ' + ctx.SAVE_SLOTS + ' slots, each holding its own run (' +
    [ctx.slotLabel(0), ctx.slotLabel(1), ctx.slotLabel(2)].join(' | ') + ')');
  check(g0 === s0 && g1 === s1 && g2 === s2, 'the slots overwrote one another');
  check(ctx.loadFrom(0) === null, 'slot one would not load');

  /* an empty slot says so rather than wrecking the run */
  const store = JSON.parse(globalThis.window.localStorage.getItem(ctx.SAVE_KEY));
  store.slots[2] = null;
  globalThis.window.localStorage.setItem(ctx.SAVE_KEY, JSON.stringify(store));
  const live = ctx.runPrint();
  const emptyErr = ctx.loadFrom(2);
  check(emptyErr !== null, 'loading an empty slot did not complain');
  check(ctx.runPrint() === live, 'loading an empty slot disturbed the run in progress');
  console.log('             : an empty slot answers "' + emptyErr + '" and leaves the run alone');
}

/* --- 9. hints ------------------------------------------------------ */
{
  const H = ctx.HINTS;
  const bad = [];
  H.forEach((h, i) => {
    if (typeof h !== 'string' || !h.trim()) bad.push('hint ' + i + ' is empty');
    if (!/[.!?]$/.test(h.trim())) bad.push('hint ' + i + ' has no full stop');
    if (h.length > 200) bad.push('hint ' + i + ' is ' + h.length + ' characters');
  });
  const dupes = H.length - new Set(H).size;
  console.log('hints        : ' + H.length + ' of them, longest ' +
    Math.max(...H.map(h => h.length)) + ' characters');
  check(bad.length === 0, 'hints: ' + bad.slice(0, 4).join('; '));
  check(dupes === 0, dupes + ' hints are repeated');
  check(H.length >= 10, 'only ' + H.length + ' hints');
  check(H.some(h => h.indexOf('four squares') >= 0), 'the range hint is missing');
}

/* --- a stat that has just moved says so ----------------------------- */
{
  const bad = [];
  ctx.bootTest(4242);
  const P = ctx.P, G = ctx.G;   /* bootTest makes new ones - take them after */
  const settle = () => { ctx.markStats(); };
  settle(); settle();
  if (ctx.statColour('str') !== '6') bad.push('a stat nobody has touched is not plain');

  /* a potion of strength */
  P.str++; P.mstr++; G.turn++; settle();
  if (ctx.statColour('str') !== 'G') bad.push('a stat that went up is not green');
  if (ctx.statColour('dex') !== '6') bad.push('the stat beside it was coloured too');
  /* and it stays green for the twenty turns, then stops */
  G.turn += ctx.STAT_LIT_TURNS - 1; settle();
  if (ctx.statColour('str') !== 'G')
    bad.push('the green went out after ' + (ctx.STAT_LIT_TURNS - 1) + ' turns');
  G.turn += 2; settle();
  if (ctx.statColour('str') !== '6') bad.push('the green never goes out');

  /* a penalty on top of a rise turns it red */
  P.dex++; G.turn++; settle();
  if (ctx.statColour('dex') !== 'G') bad.push('a raised stat is not green');
  P.dex -= 2; G.turn++; settle();
  if (ctx.statColour('dex') !== 'R') bad.push('a penalty does not turn a raised stat red');

  /* armour counts as a stat: put something on and it goes green */
  G.turn += ctx.STAT_LIT_TURNS + 2; settle();
  if (ctx.statColour('arm') !== '6') bad.push('armour is coloured for no reason');
  const before = 10 - ctx.playerAC();
  P.eq.body.ap += 3; G.turn++; settle();
  if (10 - ctx.playerAC() !== before + 3) bad.push('the armour figure did not move');
  if (ctx.statColour('arm') !== 'G') bad.push('better armour is not green');

  /* and something drained stays red past the twenty turns */
  P.wis = P.mwis - 2; G.turn++; settle();
  G.turn += ctx.STAT_LIT_TURNS + 2; settle();
  if (ctx.statColour('wis') !== 'R') bad.push('a drained stat goes back to plain');

  console.log('stat colours : green on a rise, red on a fall, ' +
    ctx.STAT_LIT_TURNS + ' turns of it');
  check(bad.length === 0, 'stat colours: ' + bad.slice(0, 4).join('; '));
}

/* --- the two named curses ------------------------------------------- */
{
  ctx.bootTest(5150);
  const w = ctx.waterCurseOK();
  console.log('water curse  : ' + (w.length ? w.length + ' problems' :
    ctx.CURSE_WATER_DAMAGE + ' hit points a turn in the water, and nothing out of it'));
  check(w.length === 0, 'water curse: ' + [...new Set(w)].slice(0, 3).join('; '));

  ctx.bootTest(5151);
  const s = ctx.squibOK();
  console.log('the squib    : ' + (s.length ? s.length + ' problems' :
    'scroll, wand and crystal all fizzle, and work again once it lifts'));
  check(s.length === 0, 'squib: ' + [...new Set(s)].slice(0, 3).join('; '));

  const ms = ctx.monsterSightOK();
  console.log('monster sight: felt ' + ms.near + ' of ' + ms.walled + ' creatures through ' +
    'stone within ' + ctx.MONSIGHT_RANGE + ' squares, none beyond it, for ' +
    ctx.MONSIGHT_TURNS + ' turns - and put not one square on your map');
  check(ms.bad.length === 0, 'monster sight: ' + [...new Set(ms.bad)].slice(0, 3).join('; '));

  const mp = ctx.mapScrollOK();
  console.log('the map      : over ' + mp.tried + ' floors it drew the shape of the place ' +
    'and every chest, left every loose thing off, and told nothing of the rooms ' +
    'that were walled up on purpose');
  check(mp.bad.length === 0, 'the map: ' + [...new Set(mp.bad)].slice(0, 3).join('; '));
}

/* --- holes: edged, not cornered, and they ask first ------------------ */
{
  let edges = 0, diag = 0, cbad = [], asked = 0, abad = [];
  for (let s = 0; s < 25; s++) {
    ctx.bootTest(6400 + s);
    for (let d = 2; d <= 12; d++) {
      ctx.enterLevel(d);
      const c = ctx.crackEdgesOK();
      edges += c.edge; diag += c.diag; cbad = cbad.concat(c.bad);
      if (!asked) {
        const h = ctx.holeAsksOK();
        if (h.asked) { asked = 1; abad = h.bad; }
      }
    }
  }
  console.log('cracks by holes: ' + edges + ' along an edge, ' + diag + ' off a corner');
  check(cbad.length === 0, 'cracks: ' + [...new Set(cbad)].slice(0, 3).join('; '));
  check(edges > 0, 'no hole anywhere had a cracked flagstone beside it');
  console.log('jumping in    : ' + (asked ? (abad.length ? abad.length + ' problems'
    : 'asked first; no costs nothing, yes drops you') : 'no hole to test with'));
  check(asked === 1, 'never found a hole to walk into');
  check(abad.length === 0, 'the hole: ' + [...new Set(abad)].slice(0, 3).join('; '));
}

/* --- the ring of light actually lights the room ---------------------- */
{
  let rl = ['no dark room found'];
  for (let s = 0; s < 8; s++) {
    ctx.bootTest(7700 + s); ctx.enterLevel(6);
    const got = ctx.ringLightOK();
    if (got.length && got[0].indexOf('no room') === 0) continue;
    rl = got; break;
  }
  console.log('ring of light : ' + (rl.length ? rl.length + ' problems' :
    'a pitch dark room comes up bright and stays that way'));
  check(rl.length === 0, 'ring of light: ' + [...new Set(rl)].slice(0, 3).join('; '));
}

/* --- a trap sprung from afar still shoots through whoever is there --- */
{
  let cf = { bad: ['not tested'], tries: 0 };
  for (let s = 0; s < 8; s++) {
    ctx.bootTest(8800 + s); ctx.enterLevel(4);
    const got = ctx.afarCrossfireOK();
    if (!got.tries) continue;
    cf = got; break;
  }
  console.log('sprung from afar: ' + (cf.bad.length ? cf.bad.length + ' problems' :
    'you were hit ' + cf.hitP + '/' + cf.tries + ', a creature ' + cf.hitM + '/' + cf.tries));
  check(cf.bad.length === 0, 'crossfire from afar: ' + [...new Set(cf.bad)].slice(0, 3).join('; '));
}

/* --- moss: a field, an edge, and nothing on a corner ----------------- */
{
  let edge = 0, field = 0, onWall = 0, mossyWall = 0, mbad = [];
  for (let s = 0; s < 12; s++) {
    ctx.bootTest(6600 + s);
    for (let d = 1; d <= 8; d++) {
      ctx.enterLevel(d);
      const m = ctx.mossEdgesOK();
      edge += m.edge; field += m.field; onWall += m.onWall; mossyWall += m.mossyWall;
      mbad = mbad.concat(m.bad);
    }
  }
  console.log('moss         : ' + field + ' in the middle, ' + edge + ' edging it; ' +
    onWall + ' creep up a wall, ' + mossyWall + ' of those a mossy one');

  /* a tuft is edged on one side, or on two, or on all four */
  let sides = {};
  for (let s = 0; s < 12; s++) {
    ctx.bootTest(6900 + s);
    for (let d = 1; d <= 8; d++) {
      ctx.enterLevel(d);
      const c = ctx.mossSidesReport();
      for (const k in c) sides[k] = (sides[k] || 0) + c[k];
    }
  }
  console.log('sides edged  : ' + JSON.stringify(sides));
  for (const n of ['1', '2', '3', '4'])
    check((sides[n] || 0) > 0, 'no tuft of moss is ever edged on ' + n + ' sides');

  /* and a cave is whole moss with the border only round its clear spots */
  let cave = { caves: 0, moss: 0, edge: 0, clear: 0, unfaded: 0 }, cbad2 = [];
  for (let s = 0; s < 30; s++) {
    ctx.bootTest(7100 + s);
    for (let d = 1; d <= 10; d++) {
      ctx.enterLevel(d);
      const c = ctx.mossCaveOK();
      cbad2 = cbad2.concat(c.bad);
      for (const k in cave) cave[k] += c.out[k];
    }
  }
  console.log('moss caves   : ' + cave.caves + ' of them - ' +
    (cave.moss / Math.max(1, cave.caves)).toFixed(1) + ' whole, ' +
    (cave.edge / Math.max(1, cave.caves)).toFixed(1) + ' faded, ' +
    (cave.clear / Math.max(1, cave.caves)).toFixed(1) + ' clear spots each');
  check(cbad2.length === 0, 'moss cave: ' + [...new Set(cbad2)].slice(0, 3).join('; '));
  check(cave.caves > 0, 'no moss cave was ever built');
  check(cave.clear > 0, 'a moss cave has no bare stone for the moss to thin against');
  check(cave.edge > 0, 'the moss in a cave never fades to an edge');
  check(mbad.length === 0, 'moss edges: ' + [...new Set(mbad)].slice(0, 3).join('; '));
  check(edge > 0, 'no moss was ever edged');
  check(onWall > 0, 'moss never creeps up a wall');
  check(mossyWall * 3 > onWall, 'a mossy wall is no likelier than a bare one: ' +
    mossyWall + ' of ' + onWall);
}

/* --- a runestone gives nothing away --------------------------------- */
{
  const sl = ctx.stoneLooksOK(12);
  console.log('runed stones : ' + (sl.length ? sl.length + ' problems' :
    'the five looks are dealt afresh each run, no two alike'));
  check(sl.length === 0, 'runestone looks: ' + [...new Set(sl)].slice(0, 3).join('; '));
}

/* --- a pile of stones, and a dragon caught out ----------------------- */
{
  let sp = ['not tested'];
  for (let s = 0; s < 6; s++) {
    ctx.bootTest(9400 + s); ctx.enterLevel(3);
    const got = ctx.stonePileOK();
    if (got.length && got[0].indexOf('no') === 0) continue;
    sp = got; break;
  }
  console.log('a pile of stones: ' + (sp.length ? sp.length + ' problems' :
    'one thrown onto another makes two on the square'));
  check(sp.length === 0, 'stone pile: ' + [...new Set(sp)].slice(0, 3).join('; '));

  let sf = ['not tested'];
  for (let s = 0; s < 8; s++) {
    ctx.bootTest(9500 + s); ctx.enterLevel(4);
    const got = ctx.surprisedHoldsFireOK();
    if (got.length && got[0].indexOf('no ') === 0) continue;
    sf = got; break;
  }
  console.log('caught flat footed: ' + (sf.length ? sf.length + ' problems' :
    'a surprised half dragon holds its fire, and shoots again once it recovers'));
  check(sf.length === 0, 'surprised: ' + [...new Set(sf)].slice(0, 3).join('; '));
}

/* --- fire and water --------------------------------------------------- */
{
  let fw = ['not tested'];
  for (let s = 0; s < 12; s++) {
    ctx.bootTest(9700 + s); ctx.enterLevel(3);
    const got = ctx.fireAndWaterOK();
    if (got.length && got[0].indexOf('no water') === 0) continue;
    fw = got; break;
  }
  console.log('fire and water: ' + (fw.length ? fw.length + ' problems' :
    'water will not catch, nothing standing in it catches, and a wade puts you out'));
  check(fw.length === 0, 'fire and water: ' + [...new Set(fw)].slice(0, 3).join('; '));
}

if (errors.length) {
  console.log('\nFAILURES (' + errors.length + '):');
  [...new Set(errors)].slice(0, 12).forEach(e => console.log(' * ' + e));
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
