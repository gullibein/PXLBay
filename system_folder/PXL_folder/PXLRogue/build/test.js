/* Headless soak test: runs the engine with no DOM to catch crashes. */
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


let errors = [];
const check = (c, m) => { if (!c) errors.push(m); };

/* ------------------------------------------------------------- roll call
   Editing this file by cutting a span between two function names has
   silently deleted whole batches of helpers more than once.  Name every
   check here: if one goes missing the suite says so on the first line,
   instead of dying with "not a function" halfway down. */
const HELPERS = [
  'bootTest', 'tickT', 'connectivityOK', 'wallsOK', 'keysOK', 'doorsOK',
  'conductionIsolated', 'waterStats', 'shapeCensus', 'trapCensus',
  'trapSpendOK', 'vaultSealed', 'identifyKnown', 'crystalsOnFloor',
  'floorFurniture', 'awarenessStats', 'doorsVisible', 'keyBeltOK',
  'holyReport', 'holyHeals', 'retaliateOK', 'noteWords', 'battleListOK',
  'keyWords', 'flinchOK', 'flinchFirstOK', 'shotTimingOK', 'turnPacingOK', 'stoneRunesOK',
  'stoneLootRates', 'stairsUpOK', 'fireOK', 'gasShapeOK', 'splashOK',
  'throwAnywhereOK', 'edgingOK', 'clearFloorOdds', 'clearFloorWell', 'barWidths', 'noteChars',
  'stepAt', 'fleeHitReport', 'dungeonFurnishing', 'holesOK', 'fallOK', 'trapBarStats',
  'trapDrill', 'monTrapOK', 'floorShape', 'fightStats', 'sneakShotReport', 'sealedSectionsOK',
  'studyOK', 'itemsVisibleOK', 'pinOK', 'lootScatter', 'pillarCount', 'pileSizes', 'floorLoot', 'toothless',
  'layoutOK', 'dynamiteOK', 'chargingOK', 'runeRecoveryOK',
  'returnUsesOK', 'thunderOK', 'thunderCells', 'thunderDischarge',
  'curseHiddenOK', 'chestOK', 'openChest', 'contCount', 'chestPut', 'spendingOK',
  'shallowOK', 'softenDamage', 'vaultRoomsOK', 'blastIntoVaultOK', 'walkTile', 'standTile',
  'everyLockGuardsSomething', 'canLeaveFrom', 'wayOutSet', 'escapeIfStranded', 'strandedHere',
  'floorsRememberedOK', 'openChestOK', 'arriveOn',
  'sneakOK', 'doorwayShotOK', 'fireShieldOK', 'lightFireShield', 'fireShieldCells', 'fireShieldBurn',
  'specialRoomsOK', 'ironBarsOK', 'blowBarrel', 'lightBarrel', 'tickFuses', 'addSpecialRoom',
  'stuckOnlyForReasonsOK', 'roomLootOK', 'parallelDoorsOK', 'crossingsOK',
  'leprechaunOK', 'knockbackOK', 'ringOK', 'clearwaterOK', 'flameTrapOK', 'noDeadEndOK',
  'chestFillOK', 'chestPut', 'chestRoom', 'chestStock', 'contCount',
  'perksOK', 'wadingOK', 'dexterousOK', 'perkReady', 'announceRoom', 'verifyKeys', 'keepsCharge', 'ringIndex', 'hasGearRune',
  'hurlWeaponsOK', 'canReturn', 'returningItem', 'setReturning', 'isHurlWeapon',
  'overflowAndStonesOK', 'thrownPotionsOK', 'huntersOK', 'huntStep', 'unequipTo',
  'lookOK', 'lookAt', 'roomEntryOK', 'ambushOK', 'surpriseHit', 'surpriseDam',
  'sightAndLandingOK', 'sightClear', 'softLanding', 'floorFurnitureOK', 'isRug', 'addRug', 'returnKeys',
  'doorwaysOK', 'blocksDoorway', 'blindDoor', 'brickUpBlindDoors', 'badItemSpot',
  'farthestFloorFrom', 'roomsAtLocks', 'neighbourRooms',
  'pickWeaponFor', 'likeItem', 'flyHome',
  'hasPerk', 'perkOffer', 'takePerk', 'perkLevel', 'takeLevelReward',
  'perkList', 'resistPlayer', 'perkElemental', 'shotRange', 'wadeStep', 'monWades', 'riposte',
  'inWater',
  'lockDivides', 'retireEmptyLocks', 'strandedHere', 'escapeIfStranded', 'wayOutSet', 'canLeaveFrom',
  'trapsAndFallsOK', 'bridgeUnderOK', 'monsterBeatsOK',
  'thinRoomLoot', 'doorDestinations', 'giveBeat', 'beatTarget', 'namingOK',
  'chestFamily', 'articPl',
  'throwingOK', 'startingKit', 'discordOK', 'combatDrill', 'wisReport',
  'crystalHeal'
];
{
  const missing = HELPERS.filter(n => typeof ctx[n] !== 'function');
  if (missing.length) {
    console.log('MISSING HELPERS (' + missing.length + '): ' + missing.join(', '));
    console.log('Something deleted them - check the last edit to this file.');
    process.exit(1);
  }
  console.log('helpers      : all ' + HELPERS.length + ' present');
}

/* --- 1. atlas coverage --------------------------------------------- */
ctx.bootTest(12345);
const missing = ctx.spriteAll();
check(missing.length === 0, 'missing sprites: ' + missing.join(', '));

/* --- 2. names and info strings fit the 320px screen ---------------- */
let longest = '', longInfo = '';
for (let s = 0; s < 40; s++) {
  ctx.bootTest(1000 + s);
  for (const n of ctx.nameAll()) if (n.length > longest.length) longest = n;
  for (const n of ctx.infoAll()) if (n.length > longInfo.length) longInfo = n;
}
console.log('longest name (<=53):', longest.length, '->', longest);
console.log('longest note (<=29):', longInfo.length, '->', longInfo);
check(longest.length <= 53, 'item name too long for the message line');

/* --- 2b. effects panel and the stealth curve ----------------------- */
ctx.bootTest(4242);
const ew = ctx.effectsWidth();
console.log('widest effect line : ' + ew.px + 'px of ' + ew.col + ' - "' + ew.s + '"');
check(ew.px <= ew.col, 'effect line too wide for the panel: ' + ew.px + 'px of ' + ew.col +
  ' - "' + ew.s + '"');
console.log('turns to be spotted at 3 squares, by dex:', ctx.stealthCurve());

/* --- 3. room shapes actually vary ---------------------------------- */
ctx.bootTest(5);
const census = ctx.shapeCensus();
console.log('shape sizes  :', JSON.stringify(census));
for (const k of Object.keys(census)) check(census[k] > 0, 'shape produced nothing: ' + k);

/* --- 4. generation: connectivity, walls, keys, water --------------- */
let genFail = 0, wallFail = 0, keyFail = 0, poolFail = 0, doorFail = 0, visFail = 0;
let beltFail = 0, trapOpen = 0, trapHidden = 0, trapKinds = 0, vaultFail = 0;
let lockMiss = 0, secretMiss = 0, trapMiss = 0;
let cryMax = 0, crySum = 0, cryN = 0;
let dims = {}, sizeFail = 0, colSum = 0, rowSum = 0, shapeN = 0;
let holyFloors = 0, holyGames = 0, holyBad = [], holySizes = [];
let sealBad = [], sealFloors = 0, sealArea = 0, hiddenItems = [];
let dormant = 0, wandering = 0, hunting = 0;
let levels = 0, lockedLevels = 0, waterLevels = 0, pools = 0, waterTiles = 0, rooms = 0;
for (let s = 0; s < 10; s++) {
  ctx.bootTest(7000 + s);
  const wantHoly = ctx.G.holyFloors.slice();
  let foundHoly = [];
  for (let d = 1; d <= 26; d++) {
    ctx.enterLevel(d);
    levels++;
    const hp2 = ctx.holyReport();
    if (hp2.tiles) {
      foundHoly.push(d);
      holyFloors++; holySizes.push(hp2.tiles);
      if (!hp2.walk) holyBad.push('you cannot walk into the pool');
      if (!hp2.see) holyBad.push('the pool blocks sight');
      if (!hp2.kerb) holyBad.push('the pool has no stone edge');
      const hh = ctx.holyHeals();
      if (hh) holyBad.push(hh);
    }
    rooms += ctx.L.rooms.filter(r => !r.gone).length;
    if (Object.keys(ctx.L.locks).length) lockedLevels++;
    const w = ctx.waterStats();
    if (w.tiles) { waterLevels++; pools += w.pools; waterTiles += w.tiles; }

    const bad = ctx.connectivityOK();
    if (bad) { genFail++; if (genFail < 4) console.log('  L' + d + ' seed' + s + ': ' + bad); }
    const wb = ctx.wallsOK();
    if (wb) { wallFail++; if (wallFail < 4) console.log('  L' + d + ' seed' + s + ': ' + wb); }
    const kb = ctx.keysOK();
    if (kb) { keyFail++; if (keyFail < 4) console.log('  L' + d + ' seed' + s + ': ' + kb); }
    const pb = ctx.conductionIsolated();
    if (pb) { poolFail++; }
    const db = ctx.doorsOK();
    if (db) { doorFail++; if (doorFail < 4) console.log('  L' + d + ' seed' + s + ': ' + db); }
    hiddenItems = hiddenItems.concat(ctx.itemsVisibleOK());
    const ss2 = ctx.sealedSectionsOK();
    sealBad = sealBad.concat(ss2.bad);
    if (ss2.secrets) { sealFloors++; sealArea += ss2.hidden; }
    const vs = ctx.vaultSealed();
    if (vs) { vaultFail++; if (vaultFail < 4) console.log('  L' + d + ': ' + vs); }
    const kbelt = ctx.keyBeltOK();
    if (kbelt) { beltFail++; if (beltFail < 4) console.log('  L' + d + ': ' + kbelt); }
    const tc = ctx.trapCensus();
    trapOpen += tc.open; trapHidden += tc.hidden;
    trapKinds = Math.max(trapKinds, tc.kinds);
    cryMax = Math.max(cryMax, ctx.crystalsOnFloor());
    crySum += ctx.crystalsOnFloor(); cryN++;
    const ff = ctx.floorFurniture();
    if (ff.locks < 1) lockMiss++;
    if (ff.secrets < 1) secretMiss++;
    if (ff.traps < 1) trapMiss++;
    const sh = ctx.floorShape();
    dims[sh.w + 'x' + sh.h] = 1;
    if (!sh.sized) sizeFail++;
    colSum += sh.cols / Math.max(1, sh.rooms);
    rowSum += sh.rows / Math.max(1, sh.rooms);
    shapeN++;
    const aw = ctx.awarenessStats();
    dormant += aw.dormant; wandering += aw.wander; hunting += aw.hunt;
    const vb = ctx.doorsVisible();
    if (vb) { visFail++; if (visFail < 4) console.log('  L' + d + ' seed' + s + ': ' + vb); }
  }
  holyGames++;
  if (foundHoly.length > wantHoly.length) holyBad.push('more pools than the game planned');
  for (const d of foundHoly) if (wantHoly.indexOf(d) < 0) holyBad.push('a pool on an unplanned floor');
}
check(visFail === 0, 'doors invisible from inside a lit room: ' + visFail);
console.log('monsters     : ' + Math.round(100 * dormant / (dormant + wandering + hunting)) +
  '% dormant, ' + Math.round(100 * wandering / (dormant + wandering + hunting)) +
  '% wandering, ' + hunting + ' already hunting (should be 0)');
check(hunting === 0, 'monsters start out already hunting');
check(doorFail === 0, 'doors side by side: ' + doorFail);
console.log('levels       : ' + levels + ', avg rooms ' + (rooms / levels).toFixed(1) +
  ', ' + Math.round(100 * lockedLevels / levels) + '% have a locked door, ' +
  Math.round(100 * waterLevels / levels) + '% have water (' +
  (pools / Math.max(1, waterLevels)).toFixed(1) + ' pools, ' +
  (waterTiles / Math.max(1, waterLevels)).toFixed(0) + ' tiles avg)');
check(genFail === 0, 'connectivity failures: ' + genFail);
check(wallFail === 0, 'unwalled tile failures: ' + wallFail);
check(keyFail === 0, 'key reachability failures: ' + keyFail);
check(poolFail === 0, 'water pool separation failures: ' + poolFail);

console.log('phase: LOS start');
/* --- 5. line of sight ---------------------------------------------- */
let losFail = 0;
for (let s = 0; s < 6; s++) {
  ctx.bootTest(9000 + s);
  for (let t = 0; t < 40; t++) {
    ctx.runCmd('move');
    const bad = ctx.losSanity();
    if (bad) { losFail++; if (losFail < 3) console.log('  LOS: ' + bad); break; }
  }
}
check(losFail === 0, 'line of sight failures: ' + losFail);
console.log('line of sight: nothing seen beyond the lamp but your own lit room, ' +
  'a fire, and ' + ctx.LOS_FACES + ' wall faces beside something visible');

console.log('phase: soak start');
/* --- 6. soak ------------------------------------------------------- */
const cmds = ['move', 'move', 'move', 'move', 'move', 'wait', 'fire', 'quaff', 'read',
  'zap', 'eat', 'equip', 'swap', 'pouch', 'identify', 'move', 'move', 'stair',
  'summon', 'icewall', 'firewall', 'blink'];
let deaths = 0, turns = 0, invFail = 0, pouchFail = 0, chestFail = 0;
let chestN = [], diagShots = 0;
for (let s = 0; s < 8; s++) {
  ctx.bootTest(50000 + s);
  for (let t = 0; t < 150; t++) {
    if (ctx.G.dead) { deaths++; break; }
    const c = ctx.cmdPick(cmds);
    try { ctx.runCmd(c); } catch (err) {
      errors.push('crash [' + c + '] seed ' + s + ': ' + err.message + '\n   ' +
        (err.stack || '').split('\n').slice(1, 3).join('\n   '));
      break;
    }
    const bad = ctx.invariants() || ctx.magicOK();
    if (bad) { invFail++; if (invFail < 4) errors.push('invariant: ' + bad); break; }
    if (ctx.pouchCountWorld() > 1) { pouchFail++; break; }
    /* one to three finds, plus the extras a chest can carry: coin, a
       magical pin, a runed stone */
    ctx.chestSizes().forEach(n => { chestN.push(n); if (n > 6) chestFail++; });
    diagShots = Math.max(diagShots, ctx.shotAngles());
    turns++;
  }
}
const avgChest = chestN.length ? (chestN.reduce((a, b) => a + b, 0) / chestN.length).toFixed(2) : 'n/a';
console.log('soak         : turns=' + turns + ' deaths=' + deaths);
console.log('loot         : chest holds ' + avgChest + ' things on average, max ' +
  (chestN.length ? Math.max(...chestN) : 0) + '; distinct firing bearings ' + diagShots);
check(pouchFail === 0, 'more than one pouch existed at once');
check(chestFail === 0, 'a chest held more than six things');
check(diagShots >= 16, 'shooting still looks orthogonal only: ' + diagShots + ' bearings');

/* --- 6b. combat balance ------------------------------------------- */
ctx.bootTest(777);
console.log('hit chance   : ' + ctx.hitReport());
console.log('heal / hunger: ' + ctx.healReport());

/* --- 6b2. pacing --------------------------------------------------- */
ctx.bootTest(99);
let siege = 0;
for (let s = 0; s < 8; s++) { ctx.bootTest(880 + s); siege += ctx.restSiege(600); }
siege /= 8;
console.log('resting 600t : ' + siege.toFixed(1) + ' wanderers arrive in total (floor -1)');
check(siege <= 5, 'reinforcements are still endless: ' + siege.toFixed(1));
ctx.bootTest(99);
const prog = ctx.progressionReport();
console.log('progression  : earned/needed by floor -> ' + prog);
prog.split('  ').forEach(p => {
  const r = parseFloat(p.split(' ')[1]);
  if (r < 1.0) errors.push('falls behind the level curve at floor ' + p.split(' ')[0] + ': ' + r + 'x');
});
console.log('hp curve     : ' + ctx.hpCurve() + '; food is ' + ctx.foodShare() + '% of floor loot');

/* --- 6b3. armour, crystals, fleeing -------------------------------- */
ctx.bootTest(31);
const ao = ctx.armourOrder();
check(ao.bad.length === 0, [...new Set(ao.bad)].join('; '));
console.log('armour       : leather protects ' + ao.lo + ', plate ' + ao.hi +
  ' (bigger is better, matches the Arm stat)');
const cr = ctx.crystalReport();
console.log('crystals     : ' + cr.avg + ' per floor, ' + cr.zero + '% of floors have none, max ' +
  cr.max);
/* the table gives about 0.46 a floor; the rest turn up inside chests */
check(cr.avg > 0.28 && cr.avg < 0.7, 'crystal rate off: ' + cr.avg);
check(cr.max <= 3, 'too many crystals on one floor: ' + cr.max);
ctx.bootTest(77);
const fc = ctx.fleeChase();
console.log('fleeing      : caught on foot ' + fc + '% of the time');
check(fc > 45, 'runners are still uncatchable: ' + fc + '%');

/* --- 6c. monster behaviour ---------------------------------------- */
ctx.bootTest(2024);
console.log('hit points   : ' + ctx.hpSpread(['S', 'K', 'H', 'O', 'Z', 'T']));
const ss = ctx.sneakShotReport('S');
console.log('opening shot : ' + ss.avg + ' damage avg, one-shots a sleeping snake ' +
  ss.onehot + '% of the time');
/* The old limit here assumed a starting bow and a 20hp snake.  Vermin
   are now meant to die fast, so a lucky thrown stone finishing a sleeping
   snake is fine - it just must not be the usual outcome. */
check(ss.onehot < 35, 'one thrown stone kills sleeping snakes too often: ' + ss.onehot + '%');
const badMelee = ctx.meleeReach();
check(badMelee === 0, 'melee landed from a non-adjacent square: ' + badMelee);
const dr = ctx.dropRules();
check(dr.bad.length === 0, [...new Set(dr.bad)].join(', '));
console.log('drops        : hobgoblin carries arrows ' + dr.arrowPct +
  '% of the time; snake hp is ' + dr.snakeRatio + 'x a kestrel');
let mtot = 0, mdorm = 0, mlv = 0, drift = 0, driftSum = 0, driftN = 0;

for (let s = 0; s < 12; s++) {
  ctx.bootTest(600 + s);
  for (let d = 1; d <= 6; d++) {
    ctx.enterLevel(d);
    const c = ctx.monsterCensus();
    mtot += c.n; mdorm += c.dormant; mlv++;
    const wd = ctx.wanderDrift();
    drift = Math.max(drift, wd.max); driftSum += wd.avg; driftN++;
  }
}
console.log('monsters     : ' + (mtot / mlv).toFixed(1) + ' per floor on -1..-6, ' +
  Math.round(100 * mdorm / mtot) + '% asleep; idle drift over 120 turns avg ' +
  (driftSum / driftN).toFixed(1) + ', furthest ' + drift + ' squares');
check(mtot / mlv > 3.5 && mtot / mlv < 7, 'monster count off: ' + (mtot / mlv).toFixed(1));
check(mdorm / mtot > 0.40 && mdorm / mtot < 0.75,
  'the sleeping/awake mix is off: ' + Math.round(100 * mdorm / mtot) + '% asleep');
check(driftSum / driftN < 20, 'most idle monsters should stay near home: ' + (driftSum / driftN).toFixed(1));
console.log('furniture    : floors missing a lock ' + lockMiss + ', a hidden door ' +
  secretMiss + ', a trap ' + trapMiss + ' (of ' + mlv + ')');
check(lockMiss === 0, 'floors with no locked door: ' + lockMiss);
check(secretMiss === 0, 'floors with no hidden door: ' + secretMiss);
check(trapMiss === 0, 'floors with no traps: ' + trapMiss);
console.log('traps        : ' + Math.round(100 * trapOpen / (trapOpen + trapHidden)) +
  '% in plain sight, ' + trapKinds + ' kinds seen');
console.log('keys         : ' + (beltFail ? beltFail + ' floors short of keys' : 'one per lock, none in the pack'));
console.log('crystals     : ' + (crySum / cryN).toFixed(2) + ' per floor, never more than ' + cryMax);
check(beltFail === 0, 'key bookkeeping is wrong on ' + beltFail + ' floors');
check(cryMax <= 3, 'more than three crystals on a floor: ' + cryMax);
check(trapOpen > 0 && trapHidden > 0, 'traps should be a mix of seen and hidden');
const tsp = ctx.trapSpendOK();
check(tsp.length === 0, 'trap reuse wrong: ' + [...new Set(tsp)].slice(0, 4).join('; '));
check(ctx.identifyKnown() === null, 'identify scroll should be known from the start');
check(hiddenItems.length === 0, 'items out of sight: ' + [...new Set(hiddenItems)].slice(0, 3).join('; '));
console.log('sealed rooms : ' + sealFloors + ' floors have a secret door, hiding ' +
  (sealArea / Math.max(1, sealFloors)).toFixed(1) + ' squares behind it on average');
check(sealBad.length === 0, 'sealed sections: ' + [...new Set(sealBad)].slice(0, 3).join('; '));
console.log('vaults       : ' + (vaultFail ? vaultFail + ' pointless locks' : 'every lock guards something'));
check(vaultFail === 0, 'locked doors that guard nothing: ' + vaultFail);
console.log('wisdom       : ' + ctx.wisReport());
console.log('crystals heal: ' + ctx.crystalHeal());

const dimList = Object.keys(dims);
console.log('floor shapes : ' + dimList.length + ' distinct sizes, ' +
  'rooms share a left edge ' + Math.round(100 - 100 * colSum / shapeN) + '% ' +
  'and a top edge ' + Math.round(100 - 100 * rowSum / shapeN) + '% of the time');
check(dimList.length >= 20, 'floors are all the same size: ' + dimList.length);
check(sizeFail === 0, 'map dimensions out of step with the tile buffer: ' + sizeFail);
check(colSum / shapeN > 0.82, 'rooms still line up in columns');
check(rowSum / shapeN > 0.74, 'rooms still line up in rows');

/* --- 6d. traps: monsters, and the two section bar ------------------ */
for (let s = 0; s < 4; s++) { ctx.bootTest(41000 + s); ctx.trapDrill(); }
const tb = ctx.trapBarStats();
const TBW = ctx.barWidths().trap;
console.log('trap lines   : ' + tb.n + ' seen, widest action ' + tb.maxS +
  '/' + TBW.lw + ', widest effect ' + tb.maxFx + '/' + TBW.mw);
check(tb.maxS <= TBW.lw, 'trap action text too wide: ' + tb.maxS + '/' + TBW.lw);
check(tb.maxFx <= TBW.mw, 'trap effect text too wide: ' + tb.maxFx + '/' + TBW.mw);
check(tb.bad.length === 0, 'bad trap lines: ' + [...new Set(tb.bad)].slice(0, 4).join('; '));

let mtBad = [];
for (let s = 0; s < 5; s++) {
  ctx.bootTest(43000 + s);
  ctx.enterLevel(3);
  mtBad = mtBad.concat(ctx.monTrapOK());
}
console.log('monster traps: ' + (mtBad.length ? mtBad.length + ' problems' :
  'every kind fires on enemies too, once'));
check(mtBad.length === 0, 'monster traps: ' + [...new Set(mtBad)].slice(0, 4).join('; '));

/* --- 6e. two hands, launchers, runes, discord ---------------------- */
ctx.bootTest(51000);
ctx.enterLevel(4);
const th = ctx.twoHandOK();
console.log('two handed   : ' + (th.length ? th.length + ' problems' :
  'the off hand empties, and stays empty'));
check(th.length === 0, 'two handed weapons: ' + [...new Set(th)].slice(0, 4).join('; '));

const lr = ctx.launcherReport();
console.log('launchers    : short bow ' + lr.bow.toFixed(1) + ' dmg, crossbow ' +
  lr.xbow.toFixed(1) + ' dmg; both load ' + lr.ammo + 's');
check(lr.xbow > lr.bow, 'the crossbow does not hit harder than the bow');
check(lr.xbow < lr.bow * 1.6, 'the crossbow is far more than slightly better');
check(!lr.sameSprite, 'the crossbow looks like a bow');
check(lr.bad.length === 0, 'launchers: ' + [...new Set(lr.bad)].slice(0, 3).join('; '));

const rr = ctx.runeReport();
console.log('runes        : ' + rr.plain + ' plain, ' + rr.latent + ' latent; ' +
  rr.pct + '% of gear carries one, ' + rr.kinds + ' kinds seen');
check(rr.bad.length === 0, 'runes: ' + [...new Set(rr.bad)].slice(0, 4).join('; '));
check(rr.latent >= 5, 'too few runes need identifying: ' + rr.latent);
check(rr.pct >= 8 && rr.pct <= 30, 'rune frequency off: ' + rr.pct + '%');
/* Every one of them, not all but one.  The slack in this check is what
   let a rune that could never be rolled at all sit there unnoticed. */
check(rr.kinds === ctx.RUNES.length,
  'only ' + rr.kinds + ' of ' + ctx.RUNES.length + ' runes ever appear: missing ' +
  ctx.RUNES.map(r => r.n).filter(n => !rr.seen[n]).join(', '));

ctx.bootTest(52000); ctx.enterLevel(4);
const rs = ctx.runeStrikeOK();
check(rs.length === 0, 'rune strikes: ' + [...new Set(rs)].slice(0, 4).join('; '));

ctx.bootTest(53000); ctx.enterLevel(4);
const dc = ctx.discordOK();
console.log('discord      : ' + (dc.length ? dc.length + ' problems' :
  'the marked creature is set upon, then forgiven'));
check(dc.length === 0, 'discord: ' + [...new Set(dc)].slice(0, 4).join('; '));

/* --- 6f. holy water, retaliation, wording, waiting ----------------- */
console.log('holy springs : ' + (holyFloors / holyGames).toFixed(1) +
  ' per game across 26 floors, ' +
  (holySizes.reduce((a, b) => a + b, 0) / Math.max(1, holySizes.length)).toFixed(1) +
  ' tiles each, never two on a floor');
check(holyBad.length === 0, 'holy pool: ' + [...new Set(holyBad)].slice(0, 4).join('; '));
check(holyFloors / holyGames >= 1.5 && holyFloors / holyGames <= 3,
  'wrong number of holy pools: ' + (holyFloors / holyGames));

ctx.bootTest(62000); ctx.enterLevel(4);
const rt = ctx.retaliateOK();
console.log('worn magic   : ' + (rt.length ? rt.length + ' problems' :
  'thorns, blight and rime all answer an attacker'));
check(rt.length === 0, 'retaliation: ' + [...new Set(rt)].slice(0, 4).join('; '));

const nw = ctx.noteWords();
check(nw.length === 0, 'item wording: ' + [...new Set(nw)].slice(0, 4).join('; '));

ctx.bootTest(64000); ctx.enterLevel(3);
const fh = ctx.fleeHitReport();
console.log('backs turned : standing ' + fh.standing + '%, fleeing ' + fh.fleeing +
  '%, surprised ' + fh.surprised + '%, asleep ' + fh.asleep + '%');
check(fh.fleeing > fh.standing + 10, 'a fleeing monster is no easier to hit');
check(fh.fleeing <= fh.asleep, 'a runner is easier to hit than a sleeper');

/* --- 6g. the battle panel and the key wording ---------------------- */
ctx.bootTest(71000); ctx.enterLevel(3);
const bl = ctx.battleListOK();
console.log('battle panel : ' + (bl.length ? bl.length + ' problems' :
  'lists only what can see you, nearest first, at most ' + ctx.BATTLE_MAX));
check(bl.length === 0, 'battle panel: ' + [...new Set(bl)].slice(0, 4).join('; '));

let kw = [];
for (let s = 0; s < 6; s++) { ctx.bootTest(72000 + s); ctx.enterLevel(2 + s); kw = kw.concat(ctx.keyWords()); }
console.log('opening locks: ' + (kw.length ? kw.length + ' problems' :
  '"You open the door with the iron key."'));
check(kw.length === 0, 'key wording: ' + [...new Set(kw)].slice(0, 3).join('; '));

/* --- 6h. furniture and holes --------------------------------------- */
let furn = { tables: 0, chairs: 0, holes: 0, cracks: 0 }, furnFloors = 0;
let holeBad = [], holeFloors = 0, corrTiles = 0, roomTiles = 0, sweep = 0;
for (let s = 0; s < 8; s++) {
  ctx.bootTest(75000 + s);
  for (let d = 1; d <= 26; d++) {
    ctx.enterLevel(d);
    const f = ctx.dungeonFurnishing();
    furn.tables += f.tables; furn.chairs += f.chairs;
    furn.holes += f.holes; furn.cracks += f.cracks;
    if (f.tables) furnFloors++;
    if (f.holes) { holeFloors++; holeBad = holeBad.concat(ctx.holesOK()); }
    for (let i = 0; i < ctx.L.tiles.length; i++) {
      if (ctx.L.tiles[i] === ctx.CORR) corrTiles++;
      if (ctx.L.tiles[i] === ctx.FLOOR) roomTiles++;
    }
    sweep++;
  }
}
console.log('furniture    : ' + (furn.tables / sweep).toFixed(2) + ' tables and ' +
  (furn.chairs / sweep).toFixed(2) + ' chairs per floor, on ' +
  Math.round(100 * furnFloors / sweep) + '% of floors');
console.log('holes        : ' + (furn.holes / Math.max(1, holeFloors)).toFixed(1) +
  ' squares each on ' + Math.round(100 * holeFloors / sweep) + '% of floors, ' +
  (furn.cracks / Math.max(1, furn.holes)).toFixed(1) + ' cracked stones per square');
console.log('floor makeup : ' + Math.round(100 * roomTiles / (roomTiles + corrTiles)) +
  '% room, ' + Math.round(100 * corrTiles / (roomTiles + corrTiles)) + '% corridor');
check(furnFloors > sweep * 0.4, 'too few furnished rooms: ' + furnFloors + '/' + sweep);
check(furn.chairs > furn.tables, 'tables without chairs');
check(holeFloors > sweep * 0.2, 'too few floors have a hole: ' + holeFloors);
check(furn.holes / Math.max(1, holeFloors) <= 4 * 4, 'holes bigger than four squares');
check(holeBad.length === 0, 'holes: ' + [...new Set(holeBad)].slice(0, 3).join('; '));
check(corrTiles / (roomTiles + corrTiles) < 0.30, 'still mostly corridor: ' +
  Math.round(100 * corrTiles / (roomTiles + corrTiles)) + '%');

const fo = ctx.fallOK();
console.log('falling      : ' + (fo.length ? fo.length + ' problems' :
  'one to five floors down, and it hurts'));
check(fo.length === 0, 'falling: ' + [...new Set(fo)].slice(0, 3).join('; '));

/* --- 6i. hit reactions --------------------------------------------- */
ctx.bootTest(90000); ctx.enterLevel(3);
const fl2 = ctx.flinchOK();
console.log('flinch       : ' + (fl2.length ? fl2.length + ' problems' :
  'always a pixel away from the blow, diagonals included'));
check(fl2.length === 0, 'flinch: ' + [...new Set(fl2)].slice(0, 4).join('; '));

let flOrder = [];
for (let s = 0; s < 6; s++) {
  ctx.bootTest(90500 + s); ctx.enterLevel(3);
  const got = ctx.flinchFirstOK();
  if (got.length && got[0].indexOf('no ') === 0) continue;
  if (got.length && got[0].indexOf('nowhere ') === 0) continue;
  if (got.length && got[0].indexOf('the creature cannot') === 0) continue;
  flOrder = got; break;
}
console.log('flinch then step: ' + (flOrder.length ? flOrder.length + ' problems' :
  'nothing moves out of a blow before the wince has been seen'));
check(flOrder.length === 0, 'flinch order: ' + [...new Set(flOrder)].slice(0, 3).join('; '));

let st2 = [];
for (let s = 0; s < 5 && !st2.length; s++) {
  ctx.bootTest(91000 + s); ctx.enterLevel(2 + s);
  const got = ctx.shotTimingOK();
  if (got.length && got[0].indexOf('no ') === 0) continue;
  st2 = got; break;
}
console.log('shot timing  : ' + (st2.length ? st2.length + ' problems' :
  'nothing moves until the arrow lands'));
check(st2.length === 0, 'shot timing: ' + [...new Set(st2)].slice(0, 3).join('; '));

ctx.bootTest(92000); ctx.enterLevel(4);
const tp = ctx.turnPacingOK();
console.log('turn pacing  : ' + (tp.length ? tp.length + ' problems' :
  'your blow, a pause, then each creature in its own moment'));
check(tp.length === 0, 'turn pacing: ' + [...new Set(tp)].slice(0, 3).join('; '));

/* --- 6j. the starting kit and throwing ----------------------------- */
ctx.bootTest(93000);
const kit = ctx.startingKit();
console.log('you start as : ' + kit.rh + ', ' + kit.body + ', ' + kit.stones +
  ' stones, ' + (kit.bow ? kit.bow + ' bow(s)' : 'no bow'));
check(kit.stones === 3, 'should start with 3 stones, got ' + kit.stones);
check(kit.bow === 0, 'should start with no bow');
check(kit.lh === null, 'the off hand should start empty');

const th2 = ctx.throwingOK();
console.log('throwing     : stone ' + th2.stone.toFixed(1) + ' dmg vs arrow ' +
  th2.arrow.toFixed(1) + ' - ' + (th2.bad.length ? th2.bad.length + ' problems' : 'a little softer, no bow needed'));
check(th2.bad.length === 0, 'throwing: ' + [...new Set(th2.bad)].slice(0, 3).join('; '));

/* the difficulty curve: gentle at the top, steep at the bottom */
const curve = [1, 2, 6, 10, 15].map(lv => {
  let t3 = 0;
  for (let i = 0; i < 3000; i++) t3 += ctx.monHP(lv, 1);
  return { lv, avg: t3 / 3000 };
});
console.log('monster hp   : ' + curve.map(c => 'lv' + c.lv + ' ' + c.avg.toFixed(0)).join(', '));
for (let i = 1; i < curve.length; i++)
  check(curve[i].avg > curve[i - 1].avg * 1.4,
    'the curve flattens between lv' + curve[i - 1].lv + ' and lv' + curve[i].lv);
/* Raw hit points say little on their own; what matters is whether the
   floor can be walked through without a scratch.  It should not be. */
/* 400 runs puts the standard error near two and a half points, small
   enough to tell a real shift in difficulty from sampling noise. */
const f1 = ctx.clearFloorOdds(1, 400);
const f2 = ctx.clearFloorOdds(2, 400);
const f3 = ctx.clearFloorOdds(3, 400);
/* The probe fights every creature on the floor toe to toe from full
   health, with the starting dagger and jerkin, and never heals, throws,
   drinks or runs.  So this is the cost of refusing to play well: floor
   one has to punish it more often than not-quite-a-third of the time,
   and floor two should be out of reach without using what you find. */
console.log('toe to toe   : floor -1 kills you ' + f1.died + '% of the time (' +
  f1.hp + ' hp left), -2 ' + f2.died + '%, -3 ' + f3.died + '%');
check(f1.died >= 30, 'floor one can be brawled through: only ' + f1.died + '% deaths');
check(f1.died <= 55, 'floor one is a meat grinder: ' + f1.died + '% deaths');
check(f2.died >= 60, 'floor two does not demand your items: only ' + f2.died + '% deaths');

const w1 = ctx.clearFloorWell(1, 400), w2 = ctx.clearFloorWell(2, 400);
console.log('played well  : throwing first and resting between fights, ' +
  'floor -1 kills you ' + w1 + '%, -2 ' + w2 + '%');
check(w1 <= 12, 'even playing well, floor one kills you ' + w1 + '% of the time');
check(w2 <= 45, 'floor two is unfair even played well: ' + w2 + '% deaths');
check(f1.died - w1 >= 20, 'playing well barely helps on floor one (' +
  f1.died + '% brawling vs ' + w1 + '%) - the floor is not about choices');
/* Floors are randomly generated, so any two can land either side of the
   line; it is the trend that has to hold. */
check(f2.died > f1.died, 'floor two is no harder than floor one');
check(f3.died > f1.died + 8, 'floor three is barely harder than floor one');
check(f3.died >= f2.died - 6, 'floor three is easier than floor two');

ctx.bootTest(94000); ctx.enterLevel(2);
const eg = ctx.edgingOK();
console.log('edge rounding: ' + (eg.length ? eg.length + ' problems' :
  'notches filled, jutting corners chamfered, lone diagonals untouched'));
check(eg.length === 0, 'edging: ' + [...new Set(eg)].slice(0, 4).join('; '));

ctx.bootTest(95000); ctx.enterLevel(4);
const sr = ctx.stoneRunesOK();
console.log('runed stones : ' + (sr.length ? sr.length + ' problems' :
  'blast catches neighbours, binding slows, returning comes home'));
check(sr.length === 0, 'runed stones: ' + [...new Set(sr)].slice(0, 4).join('; '));

ctx.bootTest(96000);
const sl = ctx.stoneLootRates();
const plain = sl.counts['stone'] || 0;
const runed = sl.tot - plain;
console.log('stones found : ' + sl.tot + ' in 40k rolls - ' + plain + ' plain, ' +
  runed + ' runed (' + Object.keys(sl.counts).filter(n => n !== 'stone').join(', ') + ')');
check(plain > 0, 'plain stones are never found in the dungeon');
check(runed > 0, 'runed stones are never found');
check(runed < plain, 'runed stones are not rarer than plain ones');

/* --- 6k. stairs up and flasks of fire ------------------------------ */
const su = ctx.stairsUpOK();
console.log('stairs up    : ' + (su.length ? su.length + ' problems' :
  'one per floor below the first, exactly where you came in'));
check(su.length === 0, 'stairs up: ' + [...new Set(su)].slice(0, 4).join('; '));

ctx.bootTest(97000); ctx.enterLevel(3);
const fi = ctx.fireOK();
if (fi.bad) {
  console.log('liquid fire  : ' + (fi.bad.length ? fi.bad.length + ' problems' :
    'lands, spreads to ' + fi.avg.toFixed(1) + ' squares on average, burns out'));
  check(fi.bad.length === 0, 'fire: ' + [...new Set(fi.bad)].slice(0, 4).join('; '));
} else {
  check(false, 'fire: ' + fi.join('; '));
}

ctx.bootTest(98000); ctx.enterLevel(3);
const ta = ctx.throwAnywhereOK();
console.log('throwing     : ' + (ta.length ? ta.length + ' problems' :
  'stones land, fire and gas flasks work unidentified, others just break'));
check(ta.length === 0, 'throwing: ' + [...new Set(ta)].slice(0, 4).join('; '));

ctx.bootTest(99000); ctx.enterLevel(3);
const gs2 = ctx.gasShapeOK();
if (gs2.bad && !gs2.bad.length)
  console.log('gas clouds   : ' + gs2.avg.toFixed(1) + ' squares, ' + gs2.diag +
    '% reach off the axes, lifetimes vary per square');
check(gs2.bad && gs2.bad.length === 0,
  'gas: ' + [...new Set(gs2.bad || ['no result'])].slice(0, 4).join('; '));

ctx.bootTest(99100); ctx.enterLevel(3);
const sp2 = ctx.splashOK();
console.log('splash       : ' + (sp2.length ? sp2.length + ' problems' :
  'droplets fly out in every direction, stones do not'));
check(sp2.length === 0, 'splash: ' + [...new Set(sp2)].slice(0, 4).join('; '));

ctx.bootTest(97500); ctx.enterLevel(2);
const study = ctx.studyOK();
console.log('studying     : ' + (study.length ? study.length + ' problems' :
  'one look per item, none of it free on pickup'));
check(study.length === 0, 'studying: ' + [...new Set(study)].slice(0, 4).join('; '));

/* --- 6l. pins, scattered ammunition, pillars ----------------------- */
ctx.bootTest(30000); ctx.enterLevel(2);
const pin = ctx.pinOK();
console.log('magical pins : ' + (pin.bad.length ? pin.bad.length + ' problems' :
  pin.better + ' improved, ' + pin.runed + ' enchanted, ' + pin.worse +
  ' cursed, ' + pin.nothing + ' wasted, of 600'));
check(pin.bad.length === 0, 'pins: ' + [...new Set(pin.bad)].slice(0, 4).join('; '));

const loot = ctx.lootScatter(20);
console.log('loose loot   : over ' + loot.floors + ' early floors - a runed stone every ' +
  (loot.floors / Math.max(1, loot.runed)).toFixed(1) + ' floors, ' + loot.pins +
  ' pins, ' + loot.stones + ' stones, ' + loot.arrows + ' arrows');
check(loot.runed >= loot.floors / 6, 'runed stones are still too scarce: one every ' +
  (loot.floors / Math.max(1, loot.runed)).toFixed(1) + ' floors');
check(loot.pins > 0, 'magical pins are never found');
/* Loose ammunition has to stay findable without going back to littering
   the place: something to throw on most floors, not a stockpile. */
check(loot.stones > loot.floors / 3, 'too few stones lying about');
check(loot.arrows > 0, 'no loose arrows lying about');

const lay = ctx.layoutOK(14);
console.log('the way down : in the room you arrive in ' + lay.stairShared +
  ' times in ' + lay.floors + ' (and ' + lay.stairForced +
  ' more where the floor had only the one ordinary room)');
check(lay.stairShared === 0, 'the stairs down share a room with the way in ' +
  lay.stairShared + ' times');
console.log('keys         : ' + lay.keys + ' placed, ' + lay.keyShared +
  ' in a room their own lock opens onto' +
  (lay.keyShared ? ' - every one on a floor with nowhere else' : ''));
check(lay.keyStranded === 0, lay.keyStranded +
  ' keys lie in the room their lock guards with somewhere else to go');
check(lay.keyShared <= lay.keys / 40, lay.keyShared + ' of ' + lay.keys +
  ' keys ended up behind their own lock - too many cramped floors');
console.log('secret rooms : ' + lay.panelled + '/' + lay.floors + ' floors have a panel, ' +
  lay.secret + ' of them reachable without blasting; ' +
  lay.behind.toFixed(1) + ' squares behind it, from a room ' +
  lay.fromRoom + ', from a hallway ' + lay.fromHall);
check(lay.panelled === lay.floors, (lay.floors - lay.panelled) + ' floors hide no room at all');
check(lay.secret >= lay.floors * 0.95, 'only ' + lay.secret + ' of ' + lay.floors +
  ' hidden rooms can be reached without blasting a wall');
check(lay.fromHall === 0, lay.fromHall + ' hidden doors are panels in a corridor wall');
console.log('dead rock    : ' + lay.pockets + ' floors have a pocket walled in by the ' +
  'halls, ' + lay.vaults + ' have a vault in one');
check(lay.vaults >= lay.pockets * 0.9, 'dead space is going to waste: ' +
  lay.pockets + ' pockets but only ' + lay.vaults + ' vaults');

const chg = ctx.chargingOK();
console.log('charging     : ' + (chg.length ? chg.length + ' problems' :
  'wands gain charges, one scroll becomes two reads, a returning stone gets double'));
check(chg.length === 0, 'charging: ' + [...new Set(chg)].slice(0, 4).join('; '));

const rec = ctx.runeRecoveryOK();
console.log('charged runes: thrown 150 times each - ' + rec.plain +
  ' plain ones left on the floor to pick up, ' + rec.charged + ' charged ones');
/* A plain one is only there to pick up when the throw missed; a charged
   one is there every time, hit or miss. */
check(rec.charged === 150, 'a charged runestone was lost ' + (150 - rec.charged) +
  ' times out of 150');
check(rec.plain < rec.charged, 'charging made no difference to recovery');

const ret = ctx.returnUsesOK();
console.log('returning    : comes home ' + ret.plain + ' times, ' + ret.charged +
  ' when charged, then it is just a stone');
check(ret.bad.length === 0, 'returning stone: ' + [...new Set(ret.bad)].slice(0, 3).join('; '));

const thu = ctx.thunderOK();
console.log('thunder      : ' + (thu.length ? thu.length + ' problems' :
  'every third blow, the eight squares round you, and only the pool you stand in'));
check(thu.length === 0, 'thunder charge: ' + [...new Set(thu)].slice(0, 4).join('; '));

/* "no enchantment" beside "+2 protection" was flatly wrong */
{
  const say = it => ctx.itemNotes(it).map(n => n[0]).join(' | ');
  const plain = ctx.mkItem('armor', 0); plain.known = 1;
  const plussed = ctx.mkItem('armor', 0); plussed.known = 1; plussed.ap = 2;
  const runed = ctx.mkItem('armor', 0); runed.known = 1; runed.br = 'thorns';
  const boots = ctx.mkItem('feet', 3); boots.known = 1;
  console.log('enchantments : plain armour says "' + say(plain) + '"');
  console.log('             : +2 armour says "' + say(plussed) + '"');
  check(say(plain).indexOf('no enchantment') >= 0, 'plain armour should say it has none');
  check(say(plussed).indexOf('no enchantment') < 0,
    'armour with +2 protection still claims to have no enchantment');
  check(say(runed).indexOf('no enchantment') < 0, 'runed armour claims to have none');
  check(say(boots).indexOf('no enchantment') < 0,
    'boots with a property still claim to have no enchantment');
}

const nm = ctx.namingOK();
console.log('item names   : ' + nm.names + ' distinct - ' + (nm.bad.length ?
  nm.bad.length + ' problems' : 'articles agree and a pair is a pair'));
check(nm.bad.length === 0, 'naming: ' + [...new Set(nm.bad)].slice(0, 4).join('; '));

const rl = ctx.roomLootOK(16);
console.log('room loot    : over ' + rl.rooms + ' ordinary rooms - at most ' +
  rl.worstChests + ' chest and ' + rl.worstItems + ' things on the floor, ' +
  rl.twoOfAKind + ' pairs of a kind, ' + rl.chestArms + ' chests with two weapons');
check(rl.bad.length === 0, 'room loot: ' + [...new Set(rl.bad)].slice(0, 4).join('; '));

const pkr = ctx.perksOK();
console.log('perks        : ' + ctx.PERKS.length + ', chosen at levels ' +
  ctx.PERK_LEVELS.join(', ') + ' - a perk or +' + ctx.PERK_HP +
  ' health, never both; riposte answers ' + pkr.ripPct + '% of misses');
console.log('             : the choice waits ' + ctx.PERK_PAUSE +
  'ms and for the fighting to stop');
check(pkr.bad.length === 0, 'perks: ' + [...new Set(pkr.bad)].slice(0, 4).join('; '));

const ovf = ctx.overflowAndStonesOK();
console.log('a full pack  : what you take off goes in the pouch, not on the floor; ' +
  'two returning stones gave ' + ovf.flights + ' flights, one after the other');
check(ovf.bad.length === 0, 'overflow: ' + [...new Set(ovf.bad)].slice(0, 4).join('; '));

const flask = ctx.thrownPotionsOK();
console.log('thrown flasks: blindness blinds, strength strengthens, healing lays a red mist, ' +
  'and a flask may be lobbed to a friend');
check(flask.bad.length === 0, 'flasks: ' + [...new Set(flask.bad)].slice(0, 4).join('; '));

const dway = ctx.doorwaysOK(14);
console.log('doorways     : ' + dway.doors + ' doors over ' + dway.floors + ' floors, ' +
  dway.blind + ' of them opening onto stone; ' + dway.chests + ' chests, ' +
  dway.corked + ' standing in a doorway');
check(dway.bad.length === 0, 'doorways: ' + [...new Set(dway.bad)].slice(0, 3).join('; '));

const ff = ctx.floorFurnitureOK(12);
console.log('keys         : ' + ff.keys + ' unused keys left behind on the floor they came from');
console.log('the pouch    : found on floor ' +
  Object.keys(ff.pouch).sort().map(k => k + ' x' + ff.pouch[k]).join(', '));
console.log('stairs       : ' + ff.stairs + ' squares apart on average; ' +
  (ff.keyNear ? ff.keyNear + ' of ' + ff.keyChecked + ' keys had to be left in a room ' +
    'their own lock opens, every one on a floor with nowhere else to put it'
   : 'no key sits in the room its own lock opens'));
console.log('rugs         : ' + ff.rugFloors + ' of ' + ff.floors + ' floors have one, ' +
  ff.rugSize + ' squares of rug each');
check(ff.bad.length === 0, 'furniture: ' + [...new Set(ff.bad)].slice(0, 4).join('; '));

const sal = ctx.sightAndLandingOK(8);
console.log('sight        : ' + sal.checked + ' square pairs, and sight is the same ' +
  'both ways in every one of them; moss takes ' + sal.mossCut + '% off a fall');
check(sal.bad.length === 0, 'sight: ' + [...new Set(sal.bad)].slice(0, 3).join('; '));

const amb = ctx.ambushOK();
console.log('ambush       : break line of sight and it is caught out coming back; ' +
  'shooting lands ' + amb.close + '% at one square, ' + amb.mid + '% at three, ' +
  amb.far + '% at five');
check(amb.bad.length === 0, 'ambush: ' + [...new Set(amb.bad)].slice(0, 3).join('; '));

const re = ctx.roomEntryOK(12);
console.log('walking in   : ' + re.said + ' special rooms announced themselves, ' +
  re.kinds + ' different kinds, and only ever once each');
check(re.bad.length === 0, 'room entry: ' + [...new Set(re.bad)].slice(0, 3).join('; '));

const lk = ctx.lookOK();
console.log('looking about: every one of ' + lk.tiles + ' tiles, ' + lk.mons +
  ' creatures, ' + lk.traps + ' traps and ' + lk.decor +
  ' bits of decor has a line, and none of them overruns the box');
check(lk.bad.length === 0, 'looking: ' + [...new Set(lk.bad)].slice(0, 4).join('; '));

const hunt = ctx.huntersOK();
console.log('hunters      : ' + hunt.smart + ' clever, ' + hunt.dim +
  ' not; an orc works the trail for ' + hunt.clever + ' turns where a rat gives up in ' +
  hunt.animal);
check(hunt.bad.length === 0, 'hunters: ' + [...new Set(hunt.bad)].slice(0, 4).join('; '));

const hw = ctx.hurlWeaponsOK();
console.log('thrown arms  : a spear does ' + (hw.thrown || 0).toFixed(1) +
  ' in the air against ' + (hw.melee || 0).toFixed(1) + ' in the hand, and always keeps; ' +
  'the scroll of return charms one thing at a time');
check(hw.bad.length === 0, 'thrown arms: ' + [...new Set(hw.bad)].slice(0, 4).join('; '));

const dex = ctx.dexterousOK();
console.log('dexterous    : ' + dex.scroll + '% of scrolls survive the reading, ' +
  dex.charge + '% of charges hold; no teleport traps anywhere');
console.log('the thief    : ' + dex.ringPct + '% of the time he has the ring on him, ' +
  dex.extraPct + '% some other prize, and always your purse');
check(dex.bad.length === 0, 'dexterous: ' + [...new Set(dex.bad)].slice(0, 4).join('; '));

const wad = ctx.wadingOK();
console.log('wading       : ' + wad.wades + ' creatures lose every second step in water (' +
  wad.wadeSpeed + '% speed), ' + wad.swims + ' do not; Riverborn is ' +
  wad.riverSpeed + '% and covers everything you do in there');
console.log('appetite     : Abstemious makes a ration last ' + wad.foodPct +
  '% longer, and starving still kills you');
check(wad.bad.length === 0, 'wading: ' + [...new Set(wad.bad)].slice(0, 3).join('; '));

const cf = ctx.chestFillOK();
console.log('filling chests: anything goes in while a square is free; the dungeon still stocks ' +
  cf.stocked + ' politely');
check(cf.bad.length === 0, 'chests: ' + [...new Set(cf.bad)].slice(0, 3).join('; '));

const nde = ctx.noDeadEndOK(20);
console.log('no dead ends : ' + nde.lands + ' teleports, none of them into a sealed pocket; ' +
  nde.dug + '/' + nde.pockets + ' pockets opened a way out; ' + nde.vaults +
  ' vaults left alone for want of a key');
check(nde.bad.length === 0, 'dead ends: ' + [...new Set(nde.bad)].slice(0, 3).join('; '));

const tfl = ctx.trapsAndFallsOK();
console.log('falling      : ' + tfl.fall.toFixed(1) + ' floors a drop, always damage, always said out loud');
console.log('traps        : ' + tfl.shown + '/' + tfl.dodged +
  ' dodges still showed the shot; ' + tfl.sprung + '/' + tfl.traps +
  ' sprung by a thrown stone without touching you');
check(tfl.bad.length === 0, 'traps: ' + [...new Set(tfl.bad)].slice(0, 3).join('; '));

const bru = ctx.bridgeUnderOK(12);
console.log('under bridges: ' + bru.checked + ' bridges, ' + bru.spans +
  ' with the water running on past both sides; ' + bru.runsH +
  ' laid across a stream that runs down the room, ' + bru.runsV + ' the other way');
check(bru.bad.length === 0, 'bridges: ' + [...new Set(bru.bad)].slice(0, 3).join('; '));

const lep = ctx.leprechaunOK(10);
console.log('leprechaun   : over ' + lep.floors + ' floors, never two at once; ' +
  lep.runs + ' robberies - he runs ' + lep.steps.toFixed(0) +
  ' squares to the far side, reaches it ' + lep.arrived + '/' + lep.holed +
  ' times, and stays there in plain sight');
check(lep.bad.length === 0, 'leprechaun: ' + [...new Set(lep.bad)].slice(0, 3).join('; '));

const kbk = ctx.knockbackOK();
console.log('knockback    : the blade shoves ' + kbk.weapon + '% of blows, the gear throws off ' +
  kbk.armour + '%');
check(kbk.bad.length === 0, 'knockback: ' + [...new Set(kbk.bad)].slice(0, 3).join('; '));

const rng = ctx.ringOK();
console.log('the ring     : five squares, ' + ctx.RING_CHARGES + ' charges, one back every ' +
  rng.turns + ' turns, ' + rng.cap + ' after a scroll of charging');
check(rng.bad.length === 0, 'ring: ' + [...new Set(rng.bad)].slice(0, 3).join('; '));

const cwt = ctx.clearwaterOK();
console.log('clearwater   : head only (' + cwt.onHeads + '/400 caps), hides you for ' +
  ctx.CLEARWATER_TURNS + ' turns, spent by a blow or by taking it off');
check(cwt.bad.length === 0, 'clearwater: ' + [...new Set(cwt.bad)].slice(0, 3).join('; '));

const flm = ctx.flameTrapOK();
console.log('flame trap   : a jet of fire over ' + flm.cells + ' squares, not an arrow');
check(flm.bad.length === 0, 'flame trap: ' + [...new Set(flm.bad)].slice(0, 3).join('; '));

const xing = ctx.crossingsOK(14);
console.log('crossings    : over ' + xing.floors + ' floors - ' + xing.corners +
  ' doors left in a room corner, ' + xing.kept +
  ' kept there because walling them up would cut the floor in two, ' +
  xing.stubs + ' hallways to nowhere');
console.log('             : ' + xing.bridges + ' bridges on ' + xing.bridgeFloors +
  ' floors - ' + xing.streams + ' with a stream across a room, ' + xing.chasms + ' with a gap');
check(xing.bad.length === 0, 'crossings: ' + [...new Set(xing.bad)].slice(0, 3).join('; '));

const pd = ctx.parallelDoorsOK(16);
console.log('doors        : ' + pd.doors.toFixed(1) + ' a floor, ' + pd.pairs +
  ' pairs in one wall leading to the same place');
check(pd.bad.length === 0, 'doors: ' + [...new Set(pd.bad)].slice(0, 3).join('; '));

const mb = ctx.monsterBeatsOK();
console.log('beats        : ' + (mb.bad.length ? mb.bad.length + ' problems' :
  mb.tracked + ' walk a round, ' + mb.posted + ' hold a post, and one that loses you ' +
  'gives up on turn ' + mb.gaveUpOn + ' and goes home'));
check(mb.bad.length === 0, 'beats: ' + [...new Set(mb.bad)].slice(0, 4).join('; '));

const stk = ctx.stuckOnlyForReasonsOK();
console.log('being stuck  : ' + (stk.length ? stk.length + ' problems' :
  'hunger costs health only, and anything that holds you says what it is'));
check(stk.length === 0, 'stuck: ' + [...new Set(stk)].slice(0, 3).join('; '));

const sp = ctx.specialRoomsOK(24);
console.log('special rooms: over ' + sp.floors + ' floors - ' +
  Object.keys(sp.seen).sort().map(function (k) { return k + ' ' + sp.seen[k]; }).join(', '));
check(sp.bad.length === 0, 'special rooms: ' + [...new Set(sp.bad)].slice(0, 4).join('; '));

const ib = ctx.ironBarsOK();
console.log('iron bars    : ' + (ib.length ? ib.length + ' problems' :
  'seen through, never passed, and nothing breaks them'));
check(ib.length === 0, 'iron bars: ' + [...new Set(ib)].slice(0, 4).join('; '));

const sn = ctx.sneakOK();
console.log('sneaking     : landing it ' + sn.watchHit.toFixed(0) + '% watched, ' +
  sn.sneakHit.toFixed(0) + '% unseen; damage ' + sn.watchDam.toFixed(1) + ' to ' +
  sn.sneakDam.toFixed(1) + ' at level 1, ' + sn.sneakDam6.toFixed(1) + ' at level 6');
check(sn.bad.length === 0, 'sneaking: ' + [...new Set(sn.bad)].slice(0, 3).join('; '));

const dw = ctx.doorwayShotOK(30);
console.log('doorways     : ' + (dw.bad.length ? dw.bad.length + ' problems' :
  dw.tried + ' tested - you can shoot what stands in one, but not the empty doorway'));
check(dw.bad.length === 0, 'doorways: ' + [...new Set(dw.bad)].slice(0, 3).join('; '));

const fsh = ctx.fireShieldOK();
console.log('fire shield  : ' + (fsh.length ? fsh.length + ' problems' :
  ctx.FIRE_SHIELD_TURNS + ' turns, every square round you alight, and it follows you'));
check(fsh.length === 0, 'fire shield: ' + [...new Set(fsh)].slice(0, 3).join('; '));

const mem = ctx.floorsRememberedOK();
console.log('the way back : ' + (mem.length ? mem.length + ' problems' :
  'eight floors walked down and back up, each one the floor you left'));
check(mem.length === 0, 'floors: ' + [...new Set(mem)].slice(0, 4).join('; '));

const oc = ctx.openChestOK();
console.log('open chests  : ' + (oc.length ? oc.length + ' problems' :
  'shut ones open when stepped on, open ones wait to be asked'));
check(oc.length === 0, 'open chests: ' + [...new Set(oc)].slice(0, 4).join('; '));

const vr = ctx.vaultRoomsOK(12);
console.log('walled-in    : ' + vr.rooms + ' rooms over ' + vr.floors + ' floors, ' +
  vr.sq.toFixed(0) + ' squares and ' + vr.things.toFixed(1) + ' things in each');
check(vr.bad.length === 0, 'walled-in rooms: ' + [...new Set(vr.bad)].slice(0, 4).join('; '));

const sc = ctx.stairsClearOK(12);
console.log('the stairs   : ' + sc.stairs + ' over ' + sc.floors + ' floors - nothing laid ' +
  'under one, none standing in a hole in a rug (' + sc.rugSquares + ' squares of rug still ' +
  'down), and the water stops short of every one (' + sc.waterSquares + ' squares still cut)');
check(sc.bad.length === 0, 'the stairs: ' + [...new Set(sc.bad)].slice(0, 4).join('; '));

const bi = ctx.blastIntoVaultOK(20);
console.log('blasting in  : ' + (bi.bad.length ? bi.bad.length + ' problems' :
  bi.blasted + ' walls blown, every one opening into a room you can stand in'));
check(bi.bad.length === 0, 'blasting in: ' + [...new Set(bi.bad)].slice(0, 3).join('; '));

const sh = ctx.shallowOK(60);
console.log('shallow end  : floor -1 has ' + sh.floor1.toFixed(2) + ' monsters, -2 has ' +
  sh.floor2.toFixed(2) + '; ice monsters on -1: ' + sh.ice1);
console.log('             : ' + ['rat','bat','spider','snake'].map(function(n){
  return n + ' ' + sh.soft[n].raw.toFixed(2) + '->' + sh.soft[n].now.toFixed(2);
}).join(', '));
check(sh.bad.length === 0, 'the shallow end: ' + [...new Set(sh.bad)].slice(0, 4).join('; '));
check(sh.floor1 < sh.floor2, 'the first floor is not quieter than the second');

const spend = ctx.spendingOK();
console.log('spending     : ' + (spend.length ? spend.length + ' problems' :
  'what is used up leaves the chest, the pouch or the pack it came from'));
check(spend.length === 0, 'spending: ' + [...new Set(spend)].slice(0, 4).join('; '));

const hid = ctx.curseHiddenOK();
console.log('curses       : ' + (hid.length ? hid.length + ' problems' :
  'the figures are the ones before any curse, until you put it on'));
check(hid.length === 0, 'curse showing: ' + [...new Set(hid)].slice(0, 4).join('; '));

const box = ctx.chestOK();
console.log('chests       : ' + box.chests + ' seen, most in one ' + box.worst +
  '/' + ctx.CHEST_CAP + ' squares, ' + box.withGold + ' with coins in');
check(box.bad.length === 0, 'chests: ' + [...new Set(box.bad)].slice(0, 4).join('; '));

/* the curse scroll now picks one thing rather than blessing everything */
{
  ctx.bootTest(9800);
  const P = ctx.P;
  const a = ctx.mkItem('armor', 0), b = ctx.mkItem('weapon', 5);
  a.cursed = 1; b.cursed = 1;
  ctx.addItem(a); ctx.addItem(b);
  ctx.G.msgq = [];
  ctx.applyScrollTo('remove curse', a, ctx.scrollIndex('remove curse'));
  console.log('remove curse : lifts it from the one you choose (' +
    (a.cursed ? 'FAILED' : 'clear') + '), leaves the rest (' +
    (b.cursed ? 'still cursed' : 'ALSO CLEARED') + ')');
  check(!a.cursed, 'the scroll did not lift the curse it was aimed at');
  check(b.cursed, 'the scroll lifted a curse it was not aimed at');
  check(ctx.SCROLLS[ctx.scrollIndex('remove curse')].pick === 1,
    'remove curse does not ask you to choose');
}

const dyn = ctx.dynamiteOK(6);
console.log('dynamite     : ' + (dyn.bad.length ? dyn.bad.length + ' problems' :
  (dyn.opened / Math.max(1, dyn.tried)).toFixed(1) + ' walls per stick, and never ' +
  'a view of bare rock'));
check(dyn.bad.length === 0, 'dynamite: ' + [...new Set(dyn.bad)].slice(0, 3).join('; '));

const tl = ctx.toothless();
console.log('every bite   : ' + (tl.length ? tl.length + ' problems' :
  'all ' + ctx.MONS.length + ' creatures can land a blow'));
check(tl.length === 0, 'toothless monsters: ' + tl.slice(0, 4).join('; '));

const fl = ctx.floorLoot(14);
const per = fl.per, sum = ks => ks.reduce((a, k) => a + (per[k] || 0), 0);
const gearKinds = ['weapon', 'armor', 'shield', 'head', 'feet'];
console.log('floor loot   : ' + fl.loose.toFixed(1) + ' things lying about per floor - ' +
  Object.keys(per).filter(k => k !== 'gold' && k !== 'key')
    .sort((a, b) => per[b] - per[a])
    .map(k => k + ' ' + per[k].toFixed(2)).join(', '));
console.log('             : plus ' + per.gold.toFixed(1) + ' gold piles, ' +
  per.key.toFixed(1) + ' keys, ' + fl.chests.toFixed(1) + ' chests holding ' +
  fl.inChests.toFixed(1) + ', ' + fl.staged.toFixed(1) + ' set out in special rooms, and ' +
  fl.walled.toFixed(1) + ' walled into the rock');
check(fl.loose <= 7, 'floors are still cluttered: ' + fl.loose.toFixed(1) +
  ' things lying about on each');
check(sum(['potion', 'scroll']) > sum(['weapon']) * 3,
  'potions and scrolls barely outnumber weapons');
check(sum(['potion', 'scroll']) > sum(gearKinds),
  'gear still outnumbers potions and scrolls');
check(per.potion > 0.7 && per.scroll > 0.7, 'consumables have become too scarce');

const piles = ctx.pileSizes(14);
console.log('pile sizes   : over ' + piles.floors + ' floors, biggest of each - ' +
  Object.keys(piles.worst).sort().map(n => n + ' x' + piles.worst[n]).join(', '));
check(piles.bad.length === 0, 'oversized piles: ' + [...new Set(piles.bad)].slice(0, 4).join('; '));
/* A stone pile is a handful off the ground, never a hoard.  How big a
   handful is the table's business - it has been two and is now three -
   so ask the table, and keep the rule that made the number small. */
const stoneCap = ctx.WEAPONS[ctx.weaponIndex('stone')].pile[1];
check(stoneCap <= 4, 'a stone pile can be ' + stoneCap + ' - that is a hoard, not a handful');
check((piles.worst['stone'] || 0) <= stoneCap,
  'found ' + piles.worst['stone'] + ' stones in one place, and the table allows ' + stoneCap);

const pil = ctx.pillarCount();
console.log('pillars      : at most ' + pil.worst + ' per hall, ' + pil.avg.toFixed(1) + ' on average');
check(pil.worst <= ctx.PILLARS_MAX, 'a hall had ' + pil.worst + ' pillars');

/* the soak's own bookkeeping, checked where the soak ran */
check(invFail === 0, 'inventory invariant failures: ' + invFail);

if (errors.length) {
  console.log('\nFAILURES (' + errors.length + '):');
  [...new Set(errors)].slice(0, 12).forEach(e => console.log(' * ' + e));
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
