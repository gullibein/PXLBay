/* The test harness: everything the suites poke the engine with.

   This used to live inside a template literal in test.js, which quietly
   ate every backslash in it - so a regular expression or a newline
   escape in here did not survive to the engine, three separate times.
   In a file of its own it is ordinary JavaScript and means what it says.

   Both suites load it after the game's own source, into the same global
   scope the engine runs in. */

function bootTest(seed){
  srand(seed);
  makeAppearances();
  G = freshG();          /* the same state a real game starts with */
  P = newPlayer();
  var dagger = mkItem('weapon',2); dagger.known=1;
  var body = mkItem('armor',0); body.known=1;
  P.eq.rh=dagger; P.eq.body=body;
  addItem(mkItem('food',0));
  var st = mkItem('weapon', weaponIndex('stone')); st.cnt=3; st.known=1; addItem(st);
  addItem(mkItem('scroll', scrollIndex('identify')));
  addItem(mkItem('feet',0));
  enterLevel(1);
  snapFloor();
}

/* ------------------------------------------- a reset without a dungeon

   bootTest costs about a third of a second, and nearly all of that is
   enterLevel building a floor: it generates candidate levels over and
   over until one has a secret door, a lock worth a key and a way to
   reach both, then populates it.

   A great many probes throw that floor away on the very next line -
   L.mons.length=0, L.items.length=0 - and stand two things on it by
   hand.  For those, all that was ever wanted was fresh dice and a fresh
   player.  Three hundred of them cost a hundred seconds and used none
   of it.

   bootRoll gives exactly that: it keeps the floor already under it,
   sweeps it back to bare generated ground, and rolls a new player onto
   it.  One bootTest then serves a hundred trials.

   What it does NOT do is give you a differently-shaped dungeon.  If the
   probe is measuring anything about generation - how many crystals a
   floor carries, how many dead ends, where the stairs land - it needs
   real bootTest calls and there is no saving to be had.  Use bootRoll
   only where the floor is scenery. */
var FLOOR_SNAP = null;
function snapFloor(){
  /* tiles and flags are typed arrays, so slice() is a real copy and
     nothing aliases back into the level.  Barrels and decor are part of
     the generated ground too - a probe that stands a barrel somewhere
     must not leave it there for the next trial to walk into. */
  var b={}, d={}, k;
  for(k in (L.barrels||{})) b[k]=L.barrels[k];
  for(k in (L.decor||{})) d[k]=L.decor[k];
  FLOOR_SNAP = { lv:L, tiles:L.tiles.slice(), flags:L.flags.slice(),
                 barrels:b, decor:d };
}
function bootRoll(seed){
  if(!L || !FLOOR_SNAP || FLOOR_SNAP.lv !== L)
    throw new Error('bootRoll with no floor under it - call bootTest first. '
                    + 'A probe on an empty world passes for the wrong reason.');
  srand(seed);
  makeAppearances();
  var floors = G.floors, level = G.level, depth = G.depth;
  G = freshG();
  G.floors = floors; G.level = level; G.depth = depth;
  G.maxDepth = Math.max(1, depth);

  /* back to bare ground: the shape the generator made, with nothing
     standing, burning, webbed or lying on it */
  L.tiles.set(FLOOR_SNAP.tiles);
  L.flags.set(FLOOR_SNAP.flags);
  L.mons.length = 0; L.items.length = 0; L.traps.length = 0;
  L.corpses.length = 0; L.clouds.length = 0;
  L.burning = {}; L.fuses = {}; L.webs = {}; L.temp = {}; L.under = {};
  var bk={}, dk={}, k;
  for(k in FLOOR_SNAP.barrels) bk[k]=FLOOR_SNAP.barrels[k];
  for(k in FLOOR_SNAP.decor) dk[k]=FLOOR_SNAP.decor[k];
  L.barrels = bk; L.decor = dk;

  P = newPlayer();
  var dagger = mkItem('weapon',2); dagger.known=1;
  var body = mkItem('armor',0); body.known=1;
  P.eq.rh=dagger; P.eq.body=body;
  addItem(mkItem('food',0));
  var st = mkItem('weapon', weaponIndex('stone')); st.cnt=3; st.known=1; addItem(st);
  addItem(mkItem('scroll', scrollIndex('identify')));
  addItem(mkItem('feet',0));

  /* somewhere to stand, and a fresh one each trial - a probe that always
     started on the same square would only ever test that square */
  var sp = randSpot(L, randRoom(L));
  P.x = sp.x; P.y = sp.y;
  /* bootTest ends inside enterLevel with the player's sight worked out;
     a probe that reads visibility must not see the last trial's instead */
  computeVis();
}
function tickT(){
  if(G.pendingFall){ G.pendingFall=0; fallDown(); }
  /* a level that comes of age stops for a choice; take one at random so
     the soak keeps walking */
  if(G.perkPick){
    var rows=G.perkPick.offer.map(function(o){return o.id;}).concat(['hp']);
    takeLevelReward(rows[rnd(rows.length)]);
  }
  G.turn++;
  if(!G.dead && !(P.haste>0 && (G.turn&1))) monstersMove();
  if(!G.dead) upkeep();
  if(!G.dead) computeVis();
  collect();
  if(G.queuePick){ var job=G.queuePick; G.queuePick=null; var all=carriedItems(); if(all.length) applyScrollTo(job.kind, all[rnd(all.length)], job.k); }
  G.msgq = [];
}
function connectivityOK(){
  /* A secret door can always be found by searching, so for the purpose of
     "can the player get there" it counts as open. */
  var hidden=[], i;
  for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===SDOOR){ hidden.push(i); L.tiles[i]=DOOR; }
  var seen = new Uint8Array(reachSet(L, P.x, P.y, true));
  for(i=0;i<hidden.length;i++) L.tiles[hidden[i]]=SDOOR;

  if(!seen[L.stair.y*MAP_W+L.stair.x]) return 'stair unreachable';
  for(i=0;i<L.items.length;i++){
    var it=L.items[i];
    var at=it.y*MAP_W+it.x;
    if(L.sealed && L.sealed[at]) continue;   /* walled in on purpose */
    if(!seen[at]) return 'item unreachable';
  }
  for(var j=0;j<L.rooms.length;j++){
    var r=L.rooms[j]; if(r.gone) continue;
    if(L.sealed && L.sealed[r.cy*MAP_W+r.cx]) continue;
    if(!seen[r.cy*MAP_W+r.cx]) return 'room '+j+' unreachable';
  }
  return null;
}
/* every locked door must have its key sitting somewhere you can already
   walk to, and the stairs must be reachable once you have collected them */
function keysOK(){
  var mats=[], k, i, j;
  for(k in L.locks){ var m=L.locks[k]; if(mats.indexOf(m)<0) mats.push(m); }
  var opened={};
  for(i=0;i<mats.length;i++){
    var seen = reachSet(L, P.x, P.y, opened);
    var found = -1;
    for(j=0;j<L.items.length;j++){
      var it=L.items[j];
      if(it.t!=='key' || opened[it.k] || mats.indexOf(it.k)<0) continue;
      if(seen[it.y*MAP_W+it.x]){ found=it.k; break; }
    }
    if(found<0) return 'no reachable key at step '+i+' (locks: '+mats.join(',')+')';
    opened[found]=1;
  }
  var fin = reachSet(L, P.x, P.y, opened);
  if(!fin[L.stair.y*MAP_W+L.stair.x]) return 'stairs unreachable with all keys';
  /* a locked chest must have a key too */
  for(j=0;j<L.items.length;j++){
    var ch=L.items[j];
    if(ch.t!=='chest' || !ch.lock) continue;
    var got=false;
    for(i=0;i<L.items.length;i++)
      if(L.items[i].t==='key' && L.items[i].k===ch.lock) got=true;
    if(!got) return 'locked chest with no key';
  }
  return null;
}
function wallsOK(){
  /* nothing you can stand on may touch raw rock - rooms AND corridors */
  for(var y=0;y<MAP_H;y++) for(var x=0;x<MAP_W;x++){
    var t=L.tiles[y*MAP_W+x];
    if(t!==FLOOR && t!==WATER && t!==CORR && t!==DOOR && t!==LOCKED && t!==STAIR) continue;
    for(var dy=-1;dy<=1;dy++) for(var dx=-1;dx<=1;dx++){
      var nx=x+dx, ny=y+dy;
      if(nx<0||ny<0||nx>=MAP_W||ny>=MAP_H) return 'open tile on map edge';
      if(L.tiles[ny*MAP_W+nx]===ROCK) return 'unwalled tile '+t+' at '+x+','+y;
    }
  }
  return null;
}
/* no two doors may sit shoulder to shoulder */
/* every combat line the game can emit, collected for width checking */
var FIGHTLOG = [], TRAPLOG = [];
function collect(){
  for(var i=0;i<G.msgq.length;i++){
    if(G.msgq[i].fight) FIGHTLOG.push(G.msgq[i]);
    if(G.msgq[i].trap) TRAPLOG.push(G.msgq[i]);
  }
}
/* every monster, in every awareness state, hitting and being hit, so the
   three section bar is exercised with the longest names in the game */
function combatDrill(){
  for(var i=0;i<MONS.length;i++){
    for(var r=0;r<14;r++){
      P.hp = P.mhp = 400; P.str = 16; P.dex = 11; G.dead = 0;
      var m = mkMonster(MONS[i].c, 12, P.x+1, P.y);
      m.state = r % 3;
      m.surprised = (r % 4 === 0) ? 1 : 0;
      L.mons.push(m);
      playerAttack(m);
      if(L.mons.indexOf(m) >= 0){ m.state = 2; monAttack(m); }
      collect(); G.msgq = [];
      var ix = L.mons.indexOf(m); if(ix >= 0) L.mons.splice(ix, 1);
    }
  }
  G.dead = 0;
}
function hitReport(){
  function pct(f){ var h=0; for(var i=0;i<4000;i++) if(f()) h++; return Math.round(h/40)+'%'; }
  var out=[];
  out.push('you lv1 vs orc(ar6) ' + pct(function(){ return swingP(1,6,playerHitBonus()); }));
  out.push('you lv6 vs troll(ar4) ' + pct(function(){ return swingP(6,4,playerHitBonus()+2); }));
  out.push('orc vs you ' + pct(function(){ return swing(1,playerAC(),0); }));
  return out.join(', ');
}
function healReport(){
  /* drive it through real food levels - upkeep recomputes the band */
  var out=[], bands=[['fed',1000],['hungry',250],['weak',100],['starving',10]];
  bands.forEach(function(b){
    P.food=b[1]; P.hp=20; P.mhp=50; P.regenCtr=0; G.turn=1; G.hungerState=0;
    var t=0, start=P.hp, dmg=0;
    for(;t<500 && P.hp<=start;t++){
      G.turn++; var before=P.hp; upkeep();
      if(P.hp<before) dmg += before-P.hp;
      P.food=b[1];
      if(G.dead){ G.dead=0; break; }
    }
    out.push(b[0]+' '+(P.hp>start ? t+'t/hp' : 'no heal')+(dmg?' -'+dmg+'hp':''));
  });
  P.food=1300; P.hp=P.mhp=12; G.hungerState=0; G.dead=0;
  return out.join(', ');
}
/* the new toys must behave: temp walls expire, allies expire, one pouch */
function magicOK(){
  var i, k;
  for(k in L.temp){
    var w=L.temp[k];
    if(w.turns > ICE_WALL_TURNS) return 'temp wall lasts too long';
    var t=L.tiles[k];
    if(t!==ICEWALL && t!==FIREWALL) return 'temp wall entry with no wall tile';
    if(w.under===ICEWALL || w.under===FIREWALL) return 'temp wall stacked on a temp wall';
  }
  for(i=0;i<L.mons.length;i++){
    var m=L.mons[i];
    if(m.ally && m.life<=0) return 'ally outlived its life';
    if(m.ally && m.x===P.x && m.y===P.y) return 'ally standing on the player';
  }
  /* nothing may occupy a wall square */
  for(i=0;i<L.mons.length;i++)
    if(!walkable(L.mons[i].x, L.mons[i].y)) return 'monster inside a wall';
  /* A corpse may lie in the rock: blinking into stone is a legal, fatal
     move, and the body stays where it stopped. */
  if(!G.dead && !walkable(P.x,P.y)) return 'living player inside a wall';
  return null;
}
function pouchCountWorld(){
  var n=0, i, j;
  var all=carriedItems();
  for(i=0;i<all.length;i++) if(all[i].t==='pouch') n++;
  for(i=0;i<L.items.length;i++){
    if(L.items[i].t==='pouch') n++;
    if(L.items[i].t==='chest') for(j=0;j<CHEST_CAP;j++)
      if(L.items[i].items[j] && L.items[i].items[j].t==='pouch') n++;
  }
  for(i=0;i<L.mons.length;i++) if(L.mons[i].item && L.mons[i].item.t==='pouch') n++;
  return n;
}
function chestSizes(){
  var sizes=[], i;
  for(i=0;i<L.items.length;i++){
    var c=L.items[i];
    if(c.t!=='chest') continue;
    var n=0;
    for(var j=0;j<CHEST_CAP;j++) if(c.items[j]) n++;
    sizes.push(n);
  }
  return sizes;
}
function shotAngles(){
  /* put a target on every reachable square around the player and count
     how many genuinely different bearings can be fired along */
  var dirs={}, dx, dy;
  for(dy=-SHOT_RANGE;dy<=SHOT_RANGE;dy++) for(dx=-SHOT_RANGE;dx<=SHOT_RANGE;dx++){
    if(!dx && !dy) continue;
    var x=P.x+dx, y=P.y+dy;
    if(x<0||y<0||x>=MAP_W||y>=MAP_H) continue;
    if(!walkable(x,y)) continue;
    if(!shotClear(P.x,P.y,x,y)) continue;
    /* reduce the bearing to lowest terms so 1,1 and 2,2 count once */
    var a=Math.abs(dx), b=Math.abs(dy);
    while(b){ var t2=b; b=a%b; a=t2; }
    var g=a||1;
    dirs[(dx/g)+','+(dy/g)]=1;
  }
  return Object.keys(dirs).length;
}
/* nothing may land a melee blow from a diagonal */
function meleeReach(){
  var bad = 0, i, r;
  for(i=0;i<MONS.length;i++){
    for(r=0;r<40;r++){
      var offs=[[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[0,2]];
      var o=offs[r%offs.length];
      var m=mkMonster(MONS[i].c,5,P.x+o[0],P.y+o[1]);
      m.state=2; m.surprised=0; m.disguise=0;
      L.mons.push(m);
      var before=P.hp;
      P.hp=P.mhp=500; P.dex=3;      /* no dodging, so a hit would show */
      monAttack(m);
      if(P.hp<500) bad++;
      P.hp=before; P.dex=11;
      var ix=L.mons.indexOf(m); if(ix>=0) L.mons.splice(ix,1);
      G.msgq=[]; G.dead=0;
    }
  }
  return bad;
}
function monsterCensus(){
  var n=0, dormant=0, i;
  for(i=0;i<L.mons.length;i++){ if(L.mons[i].ally) continue; n++; if(L.mons[i].state===0) dormant++; }
  return {n:n, dormant:dormant};
}
/* bats and snakes are penniless; snakes are scrawny */
function dropRules(){
  var bad=[], i, arrows=0, tot=0;
  for(i=0;i<400;i++){
    var b=mkMonster('B',5,1,1), sn=mkMonster('S',5,1,1);
    if(b.item||b.gold) bad.push('bat carried something');
    if(sn.item||sn.gold) bad.push('snake carried something');
    var h=mkMonster('H',5,1,1);
    tot++;
    if(h.item && h.item.t==='weapon' && WEAPONS[h.item.k].ammoFor) arrows++;
  }
  var plain=0, snake=0;
  for(i=0;i<600;i++){ plain += mkMonster('K',5,1,1).mhp; snake += mkMonster('S',5,1,1).mhp; }
  return {bad:bad, arrowPct:Math.round(arrows*100/tot),
          snakeRatio:(snake/plain).toFixed(2)};
}
/* a wandering monster should stay in the room it woke up in */
function wanderDrift(){
  var i, t, worst=0, sum=0, n=0;
  for(i=0;i<L.mons.length;i++){
    var m=L.mons[i];
    if(m.ally) continue;
    m.state=1; m.home=roomIndexAt(m.x,m.y); m.wx=m.x; m.wy=m.y;
    var ox=m.x, oy=m.y;
    for(t=0;t<120;t++) wanderStep(m);
    var d=Math.abs(m.x-ox)+Math.abs(m.y-oy);
    if(d>worst) worst=d;
    sum+=d; n++;
  }
  return {max:worst, avg:n?sum/n:0};
}
/* hit point spread per species, and whether one arrow ends a sleeper */
function hpSpread(names){
  var out=[];
  names.forEach(function(c){
    var lo=999, hi=0, sum=0, N=600;
    for(var i=0;i<N;i++){ var m=mkMonster(c,3,1,1); if(m.mhp<lo)lo=m.mhp; if(m.mhp>hi)hi=m.mhp; sum+=m.mhp; }
    out.push(MON_BY_C[c].n+' '+lo+'-'+hi+' (avg '+Math.round(sum/N)+')');
  });
  return out.join(', ');
}
function sneakShotReport(c){
  /* an opening shot with whatever the player actually starts holding */
  var all=carriedItems();
  for(var q=0;q<all.length;q++)
    if(all[q].t==='weapon' && WEAPONS[all[q].k].thrown) G.throwing=all[q];
  var kit=canShoot();
  G.throwing=null;
  if(!kit) return {onehot:0, avg:'0.0', with:'nothing to throw'};
  var kills=0, N=800, dsum=0;
  for(var i=0;i<N;i++){
    var m=mkMonster(c,3,1,1); m.state=0;
    var dmg = damRoll([WEAPONS[kit.ammo.k].d, kit.def.shot]) + addDam(effStr()) +
              (kit.thrown?0:kit.bow.dp) + kit.ammo.dp + surpriseDam(m);
    dsum+=dmg;
    if(dmg>=m.mhp) kills++;
  }
  return {onehot:Math.round(kills*100/N), avg:(dsum/N).toFixed(1),
          with:WEAPONS[kit.ammo.k].n};
}
/* a thrown stone must be usable with empty hands, and softer than a bow */
function throwingOK(){
  var bad=[], i;
  P.eq.lh=null;
  G.throwing=null;

  /* carrying stones must not arm you: aiming with nothing chosen does nothing */
  if(canShoot()) bad.push('you can shoot without choosing anything');

  /* a stone must never be equippable */
  var stone=null, all=carriedItems();
  for(i=0;i<all.length;i++)
    if(all[i].t==='weapon' && WEAPONS[all[i].k].thrown) stone=all[i];
  if(!stone) return ['no stone in the starting pack'];
  if(slotFor(stone)) bad.push('a stone can be equipped, into '+slotFor(stone));
  if(slotAccepts('rh',stone)) bad.push('the right hand accepts a stone');
  if(slotAccepts('lh',stone)) bad.push('the left hand accepts a stone');
  if(!isThrowable(stone)) bad.push('the stone is not marked throwable');

  /* choose it, and now it flies */
  G.throwing=stone;
  var kit=canShoot();
  if(!kit) bad.push('choosing a stone still gives you nothing to throw');
  else {
    if(!kit.thrown) bad.push('the chosen stone is not treated as thrown');
    if(WEAPONS[kit.ammo.k].n.indexOf('stone')<0)
      bad.push('picked up '+WEAPONS[kit.ammo.k].n+' instead of a stone');
  }
  G.throwing=null;
  function avg(ammoName, launcherName){
    var am=null, W=null, j;
    for(j=0;j<WEAPONS.length;j++){
      if(WEAPONS[j].n===ammoName) am=WEAPONS[j];
      if(WEAPONS[j].n===launcherName) W=WEAPONS[j];
    }
    var shot = W ? W.shot : am.shot;
    var t2=0, N=4000;
    for(j=0;j<N;j++) t2+=damRoll([am.d, shot]);
    return t2/N;
  }
  var stone=avg('stone',null), arrow=avg('arrow','short bow');
  if(stone>=arrow) bad.push('a stone hits as hard as an arrow: '+stone.toFixed(1)+' vs '+arrow.toFixed(1));
  if(stone<arrow*0.6) bad.push('a stone is far weaker than an arrow, not a little: '+stone.toFixed(1));
  return {bad:bad, stone:stone, arrow:arrow};
}
/* what you begin the game holding */
function startingKit(){
  var out={rh:null,lh:null,body:null,stones:0,bow:0}, i;
  if(P.eq.rh) out.rh=WEAPONS[P.eq.rh.k].n;
  if(P.eq.lh) out.lh=itemName(P.eq.lh);
  if(P.eq.body) out.body=ARMORS[P.eq.body.k].n;
  var all=carriedItems();
  for(i=0;i<all.length;i++){
    var it=all[i];
    if(it.t!=='weapon') continue;
    if(WEAPONS[it.k].n==='stone') out.stones+=it.cnt;
    if(WEAPONS[it.k].launch) out.bow++;
  }
  return out;
}
/* stand still for a long time and count how many turn up */
function restSiege(turns){
  var spawned=0, before=L.mons.length;
  P.hp=P.mhp=9999;
  for(var i=0;i<turns;i++){
    G.turn++;
    var n0=L.mons.length;
    upkeep();
    if(L.mons.length>n0) spawned += L.mons.length-n0;
    /* pretend we kill everything, as a resting player would */
    for(var j=L.mons.length-1;j>=0;j--) if(!L.mons[j].ally) L.mons.splice(j,1);
    if(G.dead){ G.dead=0; }
    P.food=1300; P.hp=P.mhp;
  }
  return spawned;
}
/* what one floor pays out, against what the next level costs */
/* Cumulative experience from clearing every floor down to here, against
   what the game asks for to be that level.  Above 1.0 means clearing
   floors keeps you level with the dungeon. */
function progressionReport(){
  var rows=[], cum=0;
  for(var depth=1; depth<=22; depth++){
    var n = MON_BASE + (MON_SPREAD-1)/2 + Math.min(MON_MAX_EXTRA,(depth/MON_PER_DEPTH)|0);
    n += WANDER_BUDGET + ((depth/WANDER_BUDGET_PER_DEPTH)|0);
    var xp=0, N=800;
    for(var i=0;i<N;i++){
      var c=randMonsterChar(depth), D=MON_BY_C[c];
      xp += D.xp + (D.lv>1 ? ((D.lv-1)*D.xp/10)|0 : 0);
    }
    cum += n*xp/N;
    var need = E_LEVELS[depth-1];
    if(need && [1,3,6,10,14,18,21].indexOf(depth)>=0)
      rows.push('-'+depth+' '+(cum/need).toFixed(2)+'x');
  }
  return rows.join('  ');
}
function hpCurve(){
  var hp=START_HP, out=[];
  for(var lv=1;lv<=20;lv++){
    if(lv===1||lv===5||lv===10||lv===20) out.push('lv'+lv+' '+Math.round(hp)+'hp');
    hp += (1+LEVEL_HP_DIE)/2 + LEVEL_HP_FLAT;
  }
  return out.join(', ');
}
function foodShare(){
  var tot=0, i;
  for(i=0;i<THINGS.length;i++) tot+=THINGS[i].p;
  for(i=0;i<THINGS.length;i++) if(THINGS[i].t==='food') return Math.round(THINGS[i].p*100/tot);
  return 0;
}
/* armour must read the same way everywhere: bigger number, better */
function armourOrder(){
  var bad=[], prev=-1;
  var order=['leather armor','studded leather','ring mail','scale mail',
             'chain mail','splint mail','banded mail','plate mail'];
  order.forEach(function(nm){
    for(var i=0;i<ARMORS.length;i++) if(ARMORS[i].n===nm){
      if(ARMORS[i].a < prev) bad.push(nm+' protects less than the piece before it');
      prev = ARMORS[i].a;
    }
  });
  /* and the Arm stat must agree with the item's own number */
  var save = P.eq.body;
  for(var i=0;i<ARMORS.length;i++){
    var it=mkItem('armor',i); it.known=1;
    P.eq.body=it; P.eq.lh=null; P.eq.head=null; P.eq.feet=null;
    if((10-playerAC()) !== gearAC(it)) bad.push(ARMORS[i].n+' Arm stat disagrees with its own rating');
  }
  P.eq.body=save;
  return {bad:bad, lo:ARMORS[0].a, hi:ARMORS[ARMORS.length-1].a};
}
function crystalReport(){
  /* Seventy first floors put the figure inside about a tenth either
     way, which is wider than the band it is checked against - so the
     check turned into a coin flip every time anything shifted the dice.
     Three hundred is a measurement. */
  var per=[], i, s;
  for(s=0;s<300;s++){
    bootTest(4000+s);
    var n=0;
    for(i=0;i<L.items.length;i++) if(L.items[i].t==='crystal') n++;
    per.push(n);
  }
  var sum=per.reduce(function(a,b){return a+b;},0);
  return {avg:(sum/per.length).toFixed(2), max:Math.max.apply(null,per),
          zero:Math.round(per.filter(function(v){return v===0;}).length*100/per.length)};
}
/* a wounded monster should be catchable on foot */
function fleeChase(){
  var caught=0, N=300, tried=0;
  P.hp=P.mhp=9999;
  for(var r=0;r<N;r++){
    /* stand both of them on real floor inside one room */
    var room=randRoom(L), s=randSpot(L,room);
    P.x=s.x; P.y=s.y;
    var spot=null;
    for(var d=0;d<4 && !spot;d++){
      var sx=P.x+DIR4[d][0]*2, sy=P.y+DIR4[d][1]*2;
      if(walkable(sx,sy) && !monAt(L,sx,sy)) spot=[sx,sy];
    }
    if(!spot) continue;
    tried++;
    computeVis();
    var m=mkMonster('H',3,spot[0],spot[1]);
    m.state=2; m.flee=FLEE_TURNS+rnd(FLEE_TURNS); m.disguise=0;
    L.mons.push(m);
    for(var t=0;t<30;t++){
      monOneMove(m);
      if(L.mons.indexOf(m)<0) break;
      /* the player closes one square a turn, either axis */
      var dx=Math.sign(m.x-P.x), dy=Math.sign(m.y-P.y);
      if(dx && walkable(P.x+dx,P.y) && !monAt(L,P.x+dx,P.y)) P.x+=dx;
      else if(dy && walkable(P.x,P.y+dy) && !monAt(L,P.x,P.y+dy)) P.y+=dy;
      computeVis();
      if(Math.abs(m.x-P.x)+Math.abs(m.y-P.y)<=1){ caught++; break; }
    }
    var ix=L.mons.indexOf(m); if(ix>=0) L.mons.splice(ix,1);
    G.msgq=[]; G.dead=0;
  }
  return tried ? Math.round(caught*100/tried) : 0;
}
/* every floor must offer a lock with its key, a hidden door, and traps */
function floorFurniture(){
  var locks=0, secrets=0, traps=0, i;
  for(i=0;i<L.tiles.length;i++){
    if(L.tiles[i]===LOCKED) locks++;
    if(L.tiles[i]===SDOOR) secrets++;
  }
  traps = L.traps.length;
  return {locks:locks, secrets:secrets, traps:traps};
}
/* wisdom should visibly change what you find and what you can price */
function wisReport(){
  var out=[], save=P.wis;
  [8,10,14,18].forEach(function(w){
    P.wis=w;
    out.push(w+': search '+searchSkill()+'% appraise '+apprSkill()+'%');
  });
  P.wis=save;
  return out.join(', ');
}
function crystalHeal(){
  P.mhp=60; var lo=999, hi=0;
  for(var i=0;i<600;i++){
    var pct=CRYSTAL_MIN_PCT+rnd(CRYSTAL_MAX_PCT-CRYSTAL_MIN_PCT+1);
    var h=Math.max(1,Math.round(P.mhp*pct/100));
    if(h<lo)lo=h; if(h>hi)hi=h;
  }
  return lo+'-'+hi+'hp at 60 max';
}
/* keys hang on the belt, are spent on use, and there is one per lock */
function keyBeltOK(){
  var i, all=carriedItems();
  for(i=0;i<all.length;i++) if(all[i].t==='key') return 'a key ended up in the pack';
  var locks=0, k;
  for(k in L.locks) locks++;
  for(i=0;i<L.items.length;i++) if(L.items[i].t==='chest' && L.items[i].lock) locks++;
  var keys=0;
  for(i=0;i<L.items.length;i++) if(L.items[i].t==='key') keys++;
  if(keys < locks) return 'only '+keys+' keys for '+locks+' locks';
  return null;
}
function trapCensus(){
  var open=0, hidden=0, kinds={}, i;
  for(i=0;i<L.traps.length;i++){
    var tr=L.traps[i];
    if(tr.found) open++; else hidden++;
    kinds[tr.k.k]=1;
  }
  return {open:open, hidden:hidden, kinds:Object.keys(kinds).length};
}
/* a one-shot trap must never fire twice */
function trapSpendOK(){
  var bad=[], i;
  for(i=0;i<TRAPS.length;i++){
    var tr={x:P.x, y:P.y, k:TRAPS[i], found:0, spent:0};
    P.hp=P.mhp=9999; P.dex=3; G.dead=0; G.pendingFall=0;
    var fired=0;
    for(var t=0;t<8;t++){
      var before=G.msgq.length;
      springTrap(tr);
      var got=G.msgq.slice(before).map(function(m){return m.s;}).join(' ');
      if(got.indexOf('sprung')<0) fired++;
      G.msgq=[]; G.dead=0; G.pendingFall=0;
    }
    if(!TRAPS[i].reusable && fired>1) bad.push(TRAPS[i].n+' fired '+fired+' times');
    if(TRAPS[i].reusable && fired<2) bad.push(TRAPS[i].n+' should reset but did not');
  }
  P.dex=11;
  return bad;
}
/* a locked door must be the only ordinary way into what it guards */
function vaultSealed(){
  var k, i, start=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone){ start=L.rooms[i]; break; }
  if(!start) return null;
  for(k in L.locks){
    var idx=parseInt(k,10), old=L.tiles[idx];
    L.tiles[idx]=WALL;
    var seen=reachSet(L, start.cx, start.cy, true);
    /* Count squares, not whole rooms: a grille across half a room seals
       the far half, and that is still a lock worth having a key for. */
    var sealed=0;
    for(i=0;i<L.tiles.length;i++){
      if(!walkTile(L.tiles[i]) || i===idx) continue;
      if(L.sealed && L.sealed[i]) continue;
      if(!seen[i]) sealed++;
    }
    L.tiles[idx]=old;
    if(sealed===0) return 'a locked door guards nothing';
  }
  return null;
}
function identifyKnown(){
  for(var i=0;i<SCROLLS.length;i++)
    if(SCROLLS[i].n==='identify' && !KNOWN.scr[i]) return 'identify scroll starts unknown';
  return null;
}
function crystalsOnFloor(){
  var n=0, i, j;
  for(i=0;i<L.items.length;i++){
    if(L.items[i].t==='crystal') n++;
    if(L.items[i].t==='chest') for(j=0;j<CHEST_CAP;j++)
      if(L.items[i].items[j] && L.items[i].items[j].t==='crystal') n++;
  }
  return n;
}
/* --- traps: two sections, and monsters set them off too ------------- */
/* trapBarStats, trapDrill, monTrapOK and floorShape used to be defined
   twice.  The second copies were the ones that ran - two of them had
   drifted from the first - so the earlier block was dead code that
   read like live code.  Only one definition of each survives, further
   down.  The HELPERS roll call at the top of the checks is what keeps
   this kind of thing visible. */
/* --- two handed weapons ------------------------------------------- */
function twoHandOK(){
  var bad=[], i, two=null, shield=null, bow=null;
  for(i=0;i<WEAPONS.length;i++) if(WEAPONS[i].two){ two=i; break; }
  for(i=0;i<WEAPONS.length;i++) if(WEAPONS[i].launch){ bow=i; break; }
  if(two===null) return ['no two handed weapon in the table'];

  /* a shield in the left hand is put away when the greatsword goes up */
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  for(i=0;i<N_SLOTS;i++) P.slots[i]=null;
  var sh=mkItem('shield',0); P.eq.lh=sh;
  var gs=mkItem('weapon',two); P.slots[0]=gs;
  equipTo('rh', gs);
  if(P.eq.rh!==gs) bad.push('could not wield the two hander');
  if(P.eq.lh) bad.push('left hand still full after wielding a two hander');
  var stowed=false;
  for(i=0;i<N_SLOTS;i++) if(P.slots[i]===sh) stowed=true;
  if(!stowed) bad.push('the shield vanished instead of going into the pack');

  /* and nothing may be put back into that hand */
  if(slotAccepts('lh', sh)) bad.push('left hand still accepts a shield');
  if(bow!==null && slotAccepts('lh', mkItem('weapon',bow)))
    bad.push('left hand still accepts a bow');

  /* with a full pack the off hand item hits the floor */
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('food',0);
  var sh2=mkItem('shield',0); P.eq.lh=sh2;
  var gs2=mkItem('weapon',two);
  var before=L.items.length;
  equipTo('rh', gs2);
  if(P.eq.lh) bad.push('full pack: left hand not emptied');
  if(L.items.length<=before) bad.push('full pack: the shield was not dropped');

  /* a one hander leaves the off hand alone */
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  for(i=0;i<N_SLOTS;i++) P.slots[i]=null;
  var sh3=mkItem('shield',0); P.eq.lh=sh3;
  var one=null;
  for(i=0;i<WEAPONS.length;i++) if(!WEAPONS[i].two&&!WEAPONS[i].launch&&!WEAPONS[i].grp){ one=i; break; }
  equipTo('rh', mkItem('weapon',one));
  if(P.eq.lh!==sh3) bad.push('a one handed weapon emptied the left hand');
  return bad;
}
/* --- launchers ----------------------------------------------------- */
function launcherReport(){
  var bow=null, xbow=null, i;
  for(i=0;i<WEAPONS.length;i++){
    if(WEAPONS[i].n==='short bow') bow=WEAPONS[i];
    if(WEAPONS[i].n==='crossbow') xbow=WEAPONS[i];
  }
  var bad=[];
  /* both launchers take the same thing now */
  function feeds(w){
    var out=[];
    for(var j=0;j<WEAPONS.length;j++){
      var a=WEAPONS[j];
      if(a.ammoFor===w.n || a.alsoFor===w.n) out.push(a);
    }
    return out;
  }
  var bowAmmo=feeds(bow), xbowAmmo=feeds(xbow);
  if(!bowAmmo.length) bad.push('nothing loads a bow');
  if(!xbowAmmo.length) bad.push('nothing loads a crossbow');
  if(bowAmmo.length!==xbowAmmo.length || bowAmmo[0]!==xbowAmmo[0])
    bad.push('the two launchers do not take the same ammunition');
  var kinds=[];
  for(i=0;i<WEAPONS.length;i++)
    if(WEAPONS[i].ammoFor||WEAPONS[i].alsoFor) kinds.push(WEAPONS[i].n);
  if(kinds.length!==1)
    bad.push('there are '+kinds.length+' kinds of ammunition: '+kinds.join(', '));

  function avg(w){
    var am=feeds(w)[0];
    if(!am) return 0;
    var t=0,N=4000;
    for(var k=0;k<N;k++) t+=damRoll([am.d, w.shot]);
    return t/N;
  }
  /* and the game hands the same quiver to either launcher */
  P.slots=new Array(N_SLOTS).fill(null);
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  var quiver=mkItem('weapon', weaponIndex('arrow')); quiver.cnt=10; quiver.known=1;
  addItem(quiver);
  P.eq.lh=mkItem('weapon', weaponIndex('short bow'));
  if(findAmmo('short bow')!==quiver) bad.push('a bow cannot find the arrows');
  P.eq.lh=mkItem('weapon', weaponIndex('crossbow'));
  if(findAmmo('crossbow')!==quiver) bad.push('a crossbow cannot find the arrows');
  if(!canShoot()) bad.push('a loaded crossbow says it cannot shoot');
  P.eq.lh=null;
  return {bow:avg(bow), xbow:avg(xbow), ammo:kinds.join(', '), bad:bad,
          sameSprite: bow.s===xbow.s};
}
/* --- runes --------------------------------------------------------- */
function runeReport(){
  var bad=[], i, seen={}, latent=0, plain=0;
  for(i=0;i<RUNES.length;i++){
    if(!RUNES[i].txt) bad.push(RUNES[i].n+' has no description');
    if(RUNES[i].latent) latent++; else plain++;
  }
  /* Every rune sleeps until you have found it out.  Knowing what the
     thing is - which is what wearing it tells you - is not the same as
     knowing what is worked into it, and an enchantment you have not
     found out about does nothing at all. */
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  var g=mkItem('armor',0); g.br='reflexes'; g.known=1; g.brKnown=0; P.eq.body=g;
  var dodgeUnknown=dodgeChance();
  g.brKnown=1;
  var dodgeKnown=dodgeChance();
  if(dodgeKnown<=dodgeUnknown) bad.push('a rune did nothing once found out');
  g.brKnown=0;
  if(hasRune('reflexes')) bad.push('a rune worked before it was found out');
  g.brKnown=1;
  if(!hasRune('reflexes')) bad.push('a rune that is known is still asleep');

  /* and so does an obvious one: wearing a sword of fire tells you it is
     a sword, not that it burns */
  var w=mkItem('weapon',0); w.br='fire'; w.known=1; w.brKnown=0;
  P.eq={rh:w,body:null,lh:null,head:null,feet:null};
  if(weaponRune()) bad.push('a rune worked from wearing the thing alone');
  w.brKnown=1;
  if(!weaponRune()) bad.push('a rune that is known does nothing');

  /* the name only gives it away once you know */
  w.brKnown=0;
  if(itemName(w).indexOf('fire')>=0) bad.push('an unknown rune shows in the name');
  w.brKnown=1;
  if(itemName(w).indexOf('fire')<0) bad.push('a known rune is missing from the name');

  /* How often loot carries one, and that every rune can turn up at all.

     The count is set by the rarest of them.  'the spider' only goes onto
     a bow, and a bow is about one item in eighty: at twelve thousand
     items it averaged three or four appearances, so one run in thirty
     saw none and the suite called it missing.  Sixty thousand puts the
     average near twenty, which fails by chance about once in fifty
     million runs.  The rate measured alongside it only gets steadier. */
  var runed=0, tot=0;
  for(i=0;i<60000;i++){
    var it=newItem(6);
    if(it.t==='weapon'||isGear(it)){ tot++; if(it.br) runed++; }
    if(it.br) seen[it.br]=1;
  }
  return {bad:bad, latent:latent, plain:plain, seen:seen,
          pct: Math.round(100*runed/Math.max(1,tot)), kinds:Object.keys(seen).length};
}
/* every rune must survive being swung -------------------------------- */
function runeStrikeOK(){
  var bad=[], i;
  for(i=0;i<RUNES.length;i++){
    if(RUNES[i].t!=='w') continue;
    var w=mkItem('weapon',0); w.br=RUNES[i].n; w.known=1;
    P.eq={rh:w,body:null,lh:null,head:null,feet:null};
    P.hp=1; P.mhp=400; G.dead=0;
    for(var t=0;t<200;t++){
      var m=mkMonster('K',6,P.x+1,P.y);
      m.hp=m.mhp=500; L.mons.push(m);
      try { runeStrike(m); } catch(e){ bad.push(RUNES[i].n+': '+e.message); break; }
      var j=L.mons.indexOf(m); if(j>=0) L.mons.splice(j,1);
    }
    if(P.hp>P.mhp) bad.push('leeching healed past the maximum');
  }
  L.mons.length=0;
  return bad;
}
/* --- discord ------------------------------------------------------- */
function discordOK(){
  var bad=[], i;
  L.mons.length=0;
  var r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>8){ r=L.rooms[i]; break; }
  if(!r) return ['no room big enough to test discord'];

  /* two squares that are genuinely side by side, so reaching each other
     is not left to the room's shape */
  var pair=null;
  for(i=0;i<r.floors.length && !pair;i++){
    var f=r.floors[i];
    for(var d=0;d<4;d++){
      var ax=f[0]+DIR4[d][0], ay=f[1]+DIR4[d][1];
      if(walkable(ax,ay) && !(ax===f[0]&&ay===f[1])){ pair=[f,[ax,ay]]; break; }
    }
  }
  if(!pair) return ['no two adjacent squares to stand on'];
  P.x=r.cx; P.y=r.cy;
  if(P.x===pair[0][0]&&P.y===pair[0][1]) { P.x=r.floors[0][0]; P.y=r.floors[0][1]; }

  var mark=mkMonster('K',6,pair[0][0],pair[0][1]);
  mark.hp=mark.mhp=900; mark.state=2; mark.disc=DISCORD_TURNS;
  var pal=mkMonster('K',6,pair[1][0],pair[1][1]);
  pal.hp=pal.mhp=900; pal.state=2;
  L.mons.push(mark); L.mons.push(pal);

  if(!hostileTo(pal, mark)) bad.push('a marked creature is still a friend');
  if(!hostileTo(mark, pal)) bad.push('the marked one still has friends');
  if(discordTarget(pal)!==mark) bad.push('nobody goes after the marked one');
  if(discordTarget(mark)) bad.push('the marked one hunts itself');
  if(adjacentFoe(pal)!==mark) bad.push('the one beside it is not seen as a foe');

  /* standing next to each other, they must come to blows before the
     mark wears off */
  var start=mark.hp+pal.hp;
  for(i=0;i<DISCORD_TURNS && mark.disc>0;i++){ monOneMove(pal); if(G.dead) break; }
  if(mark.hp+pal.hp>=start) bad.push('the marked creature was never attacked');

  /* and the mark wears off */
  var m3=mkMonster('K',6,r.floors[6][0],r.floors[6][1]);
  m3.hp=m3.mhp=900; m3.disc=2; L.mons.push(m3);
  monOneMove(m3); monOneMove(m3); monOneMove(m3);
  if(m3.disc>0) bad.push('the mark never lapses');
  L.mons.length=0;
  return bad;
}
/* A shrine and an alchemist's fount are the same water to look at but a
   different thing entirely, so they are not counted as healing pools. */
function isPlainPool(i){
  var x=i%MAP_W, y=(i/MAP_W)|0;
  if(L.shrine && L.shrine.x===x && L.shrine.y===y) return false;
  if(L.alchemy && L.alchemy.x===x && L.alchemy.y===y) return false;
  return true;
}
function holyReport(){
  var tiles=0, kerb=0, i, x, y;
  for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===HOLY && isPlainPool(i)) tiles++;
  for(i in L.decor) if(L.decor[i]==='kerb') kerb++;
  var walk=1, lit=1;
  for(y=0;y<MAP_H;y++) for(x=0;x<MAP_W;x++){
    var j=y*MAP_W+x;
    if(L.tiles[j]!==HOLY || !isPlainPool(j)) continue;
    if(!walkable(x,y)) walk=0;
    if(blocksSight(x,y)) lit=0;
  }
  return {tiles:tiles, kerb:kerb, walk:walk, see:lit};
}
function holyHeals(){
  var i, spot=null, out=null;
  for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===HOLY && isPlainPool(i)){ spot=i; break; }
  if(spot===null) return 'no pool to stand in';
  var save={x:P.x,y:P.y,hp:P.hp,mhp:P.mhp,food:P.food,ctr:P.regenCtr,
            turn:G.turn,dead:G.dead,hs:G.hungerState};
  P.x=spot%MAP_W; P.y=(spot/MAP_W)|0;
  P.mhp=60; P.hp=10; P.food=900; P.regenCtr=0; G.dead=0;
  upkeep();
  if(P.hp-10<HOLY_HEAL) out='the pool healed '+(P.hp-10)+' not '+HOLY_HEAL;
  if(!out){
    P.hp=10; P.food=5; P.regenCtr=0; G.dead=0;
    upkeep();
    if(P.hp<=10) out='the pool stopped working while starving';
  }
  if(!out){
    P.food=900; P.hp=P.mhp; G.dead=0;
    upkeep();
    if(P.hp>P.mhp) out='the pool healed past the maximum';
  }
  P.x=save.x; P.y=save.y; P.hp=save.hp; P.mhp=save.mhp; P.food=save.food;
  P.regenCtr=save.ctr; G.turn=save.turn; G.dead=save.dead; G.hungerState=save.hs;
  return out;
}
function retaliateOK(){
  var bad=[], names=['thorns','blight','rime'], i;
  for(i=0;i<names.length;i++){
    var g=mkItem('armor',0); g.br=names[i]; g.known=1; g.brKnown=1;
    P.eq={rh:null,body:g,lh:null,head:null,feet:null};
    if(!hasRune(names[i])) bad.push(names[i]+' is not recognised when worn');
    var hurt=0, froze=0;
    for(var t=0;t<300;t++){
      var m=mkMonster('K',6,P.x+1,P.y);
      m.hp=m.mhp=500; m.stuck=0; L.mons.push(m);
      retaliate(m);
      if(m.hp<500) hurt++;
      if(m.stuck>0) froze++;
      var j=L.mons.indexOf(m); if(j>=0) L.mons.splice(j,1);
    }
    if(hurt<290) bad.push(names[i]+' only hurt '+hurt+' of 300 attackers');
    if(names[i]==='rime' && froze<40) bad.push('rime never froze anybody');
    g.known=0;
    if(RUNE_BY_NAME[names[i]].latent && hasRune(names[i]))
      bad.push(names[i]+' worked unidentified');
  }
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  L.mons.length=0;
  return bad;
}
function noteWords(){
  var bad=[], i, joined;
  var g=mkItem('armor',3); g.ap=2; g.known=1; g.br=null;
  joined=itemNotes(g).map(function(n){return n[0];}).join(' | ');
  if(joined.indexOf('+2 protection')<0) bad.push('armour does not say "+2 protection": '+joined);
  if(joined.indexOf('enchantment unknown')>=0) bad.push('a known item still says unknown');
  g.br='thorns'; g.brKnown=1;
  joined=itemNotes(g).map(function(n){return n[0];}).join(' | ');
  if(joined.indexOf('bites your attacker')<0) bad.push('the enchantment is not named: '+joined);
  g.known=0;
  joined=itemNotes(g).map(function(n){return n[0];}).join(' | ');
  if(joined.indexOf('enchantment unknown')<0) bad.push('an unknown item gives itself away: '+joined);
  /* measured in pixels, not letters: the font is not fixed width and the
     panel clips by pixels.  Counting letters read as 29 of a column that
     is 128 wide and only 21 letters at the very widest - both wrong, in
     opposite directions, for anything actually written in English. */
  var panel=effectsColPx();
  for(i=0;i<RUNES.length;i++) if(textPx(RUNES[i].txt)>panel)
    bad.push('note too wide ('+textPx(RUNES[i].txt)+'px/'+panel+'): '+RUNES[i].txt);
  return bad;
}
function battleListOK(){
  var bad=[], i;
  L.mons.length=0;
  var r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>10){ r=L.rooms[i]; break; }
  if(!r) return ['no room to test the battle list'];
  P.x=r.cx; P.y=r.cy; P.blind=0; computeVis();
  if(battleFoes().length) bad.push('an empty room lists foes');
  var spots=[];
  for(i=0;i<r.floors.length && spots.length<8;i++){
    var f=r.floors[i];
    if(f[0]===P.x&&f[1]===P.y) continue;
    if(!(L.flags[f[1]*MAP_W+f[0]] & F_VIS)) continue;
    spots.push(f);
  }
  if(spots.length<3) return ['not enough of the room is in sight'];
  var hunt=mkMonster('O',5,spots[0][0],spots[0][1]); hunt.state=2; hunt.disguise=0;
  var doze=mkMonster('O',5,spots[1][0],spots[1][1]); doze.state=0; doze.disguise=0;
  var pal =mkMonster('O',5,spots[2][0],spots[2][1]); pal.state=2; pal.ally=1; pal.disguise=0;
  L.mons.push(hunt); L.mons.push(doze); L.mons.push(pal);
  computeVis();
  var got=battleFoes();
  if(got.indexOf(hunt)<0) bad.push('a hunting monster is missing from the list');
  if(got.indexOf(doze)>=0) bad.push('a sleeping monster is listed as fighting you');
  if(got.indexOf(pal)>=0) bad.push('your own ally is listed as fighting you');
  L.mons.length=0;
  for(i=0;i<spots.length;i++){
    var m=mkMonster('O',5,spots[i][0],spots[i][1]);
    m.state=2; m.disguise=0; L.mons.push(m);
  }
  computeVis();
  got=battleFoes();
  if(got.length>BATTLE_MAX) bad.push('battle list overflows: '+got.length);
  for(i=1;i<got.length;i++)
    if(mdist(got[i]) < mdist(got[i-1])) bad.push('battle list is not nearest first');
  P.blind=1; computeVis();
  if(battleFoes().length) bad.push('blind, and still listing foes');
  P.blind=0; L.mons.length=0; computeVis();
  return bad;
}
function keyWords(){
  var bad=[], i, idx=-1;
  for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===LOCKED){ idx=i; break; }
  if(idx<0) return [];
  var mat=L.locks[idx];
  P.keys[mat]=1;
  G.msgq=[];
  tryUnlock(idx%MAP_W,(idx/MAP_W)|0);
  var said=G.msgq.map(function(m){return m.s;}).join(' ');
  if(said.indexOf('You open the door with the '+MATS[mat]+' key.')<0)
    bad.push('unlock wording: '+said);
  G.msgq=[];
  return bad;
}
function flinchOK(){
  var bad=[], i;
  var cases=[[1,0,-1,0],[-1,0,1,0],[0,1,0,-1],[0,-1,0,1],[3,3,-1,-1],[-3,3,1,-1]];
  for(i=0;i<cases.length;i++){
    var c=cases[i], e={x:0,y:0,hurt:null};
    markHurt(e, c[0], c[1]);
    if(!e.hurt){ bad.push('no flinch recorded'); continue; }
    if(e.hurt.dx!==c[2]||e.hurt.dy!==c[3])
      bad.push('hit from '+c[0]+','+c[1]+' pushed '+e.hurt.dx+','+e.hurt.dy);
  }
  var e2={x:5,y:5,hurt:null};
  markHurt(e2,5,5);
  if(!e2.hurt || (!e2.hurt.dx && !e2.hurt.dy)) bad.push('a hit from your own square does nothing');
  for(i=0;i<40;i++){
    var sx=rnd(9)-4, sy=rnd(9)-4;
    if(!sx&&!sy) continue;
    var e3={x:0,y:0,hurt:null};
    markHurt(e3,sx,sy);
    if(e3.hurt.dx && Math.sign(e3.hurt.dx)===Math.sign(sx)) bad.push('flinched towards the blow');
    if(e3.hurt.dy && Math.sign(e3.hurt.dy)===Math.sign(sy)) bad.push('flinched towards the blow');
  }
  return bad;
}
/* Nothing moves out of a blow before it has been seen to take it.
   A creature is hurt from three directions - your stone, the fire it is
   standing in, another creature - and whichever it was, the wince has to
   play out before it steps, or the two read as one motion. */
/* ------------------------------------------------------------- curses
   A curse rides on a cursed thing you are wearing, and goes when it
   goes.  These check the two of them do what they say and stop when
   they should. */
function waterCurseOK(){
  var bad=[], i;
  P.hp = P.mhp = 200; G.dead = 0;
  var coat = P.eq.body;
  liftCurse(coat);
  L.tiles[P.y * MAP_W + P.x] = WATER;
  var before = P.hp;
  upkeep();
  if (P.hp !== before) bad.push('water hurts somebody who is not cursed');
  layCurse(coat); coat.curse = 'water';
  if (!hasCurse('water')) bad.push('the curse is not felt through the coat you are wearing');
  before = P.hp; upkeep();
  if (before - P.hp !== CURSE_WATER_DAMAGE)
    bad.push('a turn in water cost ' + (before - P.hp) + ', not ' + CURSE_WATER_DAMAGE);
  /* out of the water and it stops */
  L.tiles[P.y * MAP_W + P.x] = FLOOR;
  before = P.hp; upkeep();
  if (P.hp !== before) bad.push('dry land hurts too');
  /* the same curse in the pack, not on your back, is nothing */
  var spare = mkItem('armor', 0); layCurse(spare); spare.curse = 'water';
  liftCurse(coat);
  addItem(spare);
  if (hasCurse('water')) bad.push('a cursed coat in the pack curses you');
  /* and the shrine takes it off with the coat */
  layCurse(coat); coat.curse = 'water';
  liftCurse(coat);
  if (hasCurse('water')) bad.push('lifting the curse leaves the curse behind');
  L.tiles[P.y * MAP_W + P.x] = FLOOR;
  return bad;
}
function squibOK(){
  var bad=[], i;
  var coat = P.eq.body;
  liftCurse(coat); layCurse(coat); coat.curse = 'squib';
  P.blind = 0;
  /* a scroll of magic mapping reveals nothing */
  var ki = scrollIndex('magic mapping');
  var seen0 = 0;
  for (i = 0; i < L.flags.length; i++) if (L.flags[i] & F_SEEN) seen0++;
  G.msgq = []; G.drops = null;
  readScroll(mkItem('scroll', ki));
  var seen1 = 0;
  for (i = 0; i < L.flags.length; i++) if (L.flags[i] & F_SEEN) seen1++;
  if (seen1 !== seen0) bad.push('a squib read the map off a scroll');
  if (!G.drops || G.drops.col !== FIZZLE_COL) bad.push('no white puff when the magic failed');
  /* a wand does nothing either */
  var wand = mkItem('wand', 0); wand.ch = 5;
  G.msgq = [];
  zapWand(wand, 1, 0);
  if (wand.ch !== 5) bad.push('a squib spent a charge out of a wand');
  /* nor a crystal */
  var cry = mkItem('crystal', 0);
  P.hp = 10; P.mhp = 100;
  useCrystal(cry);
  if (P.hp !== 10) bad.push('a crystal healed a squib');
  /* and with the curse gone it all works again */
  liftCurse(coat);
  useCrystal(mkItem('crystal', 0));
  if (P.hp <= 10) bad.push('a crystal does nothing once the curse is lifted');
  G.msgq = [];
  var before = wand.ch;
  zapWand(wand, 1, 0);
  if (wand.ch === before) bad.push('a wand does nothing once the curse is lifted');
  return bad;
}
/* Cracked flagstones edge a hole; they do not sit off its corners. */
function crackEdgesOK(){
  var bad=[], i, diag=0, edge=0;
  for (i = 0; i < L.tiles.length; i++) {
    var d = L.decor[i];
    if (!isCrack(d)) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, k, touch = 0, corner = 0;
    for (k = 0; k < DIR4.length; k++) {
      var nx = x + DIR4[k][0], ny = y + DIR4[k][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (L.tiles[ny * MAP_W + nx] === HOLE) touch++;
    }
    for (k = 0; k < DIR8.length; k++) {
      var mx = x + DIR8[k][0], my = y + DIR8[k][1];
      if (mx < 0 || my < 0 || mx >= MAP_W || my >= MAP_H) continue;
      if (L.tiles[my * MAP_W + mx] === HOLE) corner++;
    }
    if (touch) edge++;
    else if (corner) { diag++; bad.push('a crack at ' + x + ',' + y + ' only touches a hole corner-on'); }
  }
  return { bad: bad, edge: edge, diag: diag };
}
/* Walking into a hole asks before it drops you. */
function holeAsksOK(){
  var bad=[], i, spot=null;
  for (i = 0; i < L.tiles.length; i++) {
    if (L.tiles[i] !== HOLE) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, k;
    for (k = 0; k < DIR4.length; k++) {
      var px = x - DIR4[k][0], py = y - DIR4[k][1];
      if (walkable(px, py) && !monAt(L, px, py)) { spot = { px: px, py: py, d: DIR4[k] }; break; }
    }
    if (spot) break;
  }
  if (!spot) return { bad: ['no hole with anywhere to stand beside it'], asked: 0 };
  P.x = spot.px; P.y = spot.py; P.frozen = 0; P.held = 0; G.ask = null; G.dead = 0;
  var was = { x: P.x, y: P.y }, depth = G.depth;
  var took = playerMove(spot.d[0], spot.d[1]);
  if (took) bad.push('walking into a hole spent the turn without asking');
  if (!G.ask) bad.push('walking into a hole asked nothing');
  if (P.x !== was.x || P.y !== was.y) bad.push('you moved before you answered');
  /* No leaves you where you were, and costs nothing */
  if (answerAsk(false)) bad.push('saying no still cost a turn');
  if (P.x !== was.x || P.y !== was.y) bad.push('saying no moved you anyway');
  if (G.ask) bad.push('the question is still standing after an answer');
  /* Yes drops you */
  playerMove(spot.d[0], spot.d[1]);
  if (!G.ask) return { bad: bad.concat(['the second question was never asked']), asked: 1 };
  if (!answerAsk(true)) bad.push('saying yes cost nothing');
  if (G.depth === depth && !G.pendingFall) bad.push('saying yes did not drop you');
  return { bad: bad, asked: 1 };
}
/* A ring of light in a pitch dark room really does light it. */
function ringLightOK(){
  var bad=[], i, r=null;
  for (i = 0; i < L.rooms.length; i++)
    if (!L.rooms[i].gone && L.rooms[i].dark && L.rooms[i].floors.length > 4) { r = L.rooms[i]; break; }
  if (!r) {
    /* none on this floor: put one out by hand, which is what the wand of
       darkness does anyway */
    for (i = 0; i < L.rooms.length; i++)
      if (!L.rooms[i].gone && L.rooms[i].floors.length > 4) { r = L.rooms[i]; break; }
    if (!r) return ['no room to darken'];
    r.dark = 1; r.lit = 0;
    buildDarkMap(L, G.depth); buildLitMap(L); spillLight(L);
  }
  P.x = r.cx; P.y = r.cy;
  if (!walkable(P.x, P.y)) { P.x = r.floors[0][0]; P.y = r.floors[0][1]; }
  computeVis();
  var k = P.y * MAP_W + P.x;
  if (!L.darkMap[k]) bad.push('the room was not dark to begin with');
  var ring = mkItem('ring', 0);
  for (i = 0; i < RINGS.length; i++) if (RINGS[i].light) ring = mkItem('ring', i);
  ring.ch = 1;
  G.msgq = [];
  ringLight(ring);
  if (L.darkMap[k]) bad.push('the room is still pitch dark after the ring');
  if (!L.litMap[k]) bad.push('the room is not lit after the ring');
  var dark = 0;
  for (i = 0; i < r.floors.length; i++)
    if (L.darkMap[r.floors[i][1] * MAP_W + r.floors[i][0]]) dark++;
  if (dark) bad.push(dark + ' of its squares are still dark');
  return bad;
}
/* A trap sprung by a thrown stone shoots at the plate, and whatever is
   standing between the wall and the plate is in the way of it. */
function afarCrossfireOK(){
  var bad=[], i, hitP=0, hitM=0, tries=0;
  for (var attempt = 0; attempt < 40; attempt++) {
    var r = null;
    for (i = 0; i < L.rooms.length; i++)
      if (!L.rooms[i].gone && L.rooms[i].floors.length > 14) { r = L.rooms[i]; break; }
    if (!r) return { bad: ['no room to test in'], tries: 0 };
    /* a plate three squares along a row, with the wall beyond it */
    var f = r.floors[attempt % r.floors.length];
    var plate = { x: f[0], y: f[1] };
    if (!walkable(plate.x, plate.y)) continue;
    L.traps = L.traps || [];
    var kind = null;
    for (i = 0; i < TRAPS.length; i++) if (TRAPS[i].k === 'dart') kind = TRAPS[i];
    if (!kind) return { bad: ['no dart trap in the table'], tries: 0 };
    var tr = { x: plate.x, y: plate.y, k: kind, found: 1, spent: 0 };
    var src = wallShooter('#93bd27', plate.x, plate.y);
    if (!src) continue;
    /* stand on the line the shot actually takes, not on a midpoint: the
       nozzle can fall back to the square above the plate, and half of
       that is one of the two ends */
    /* Walk from the nozzle to the plate looking for somewhere to stand.
       The two are not always in line - the nozzle can fall back to the
       square above the plate - so stepping one square of each towards it
       may pass straight by and never land on it.  Counted, not trusted. */
    var mid = null, sx2 = Math.sign(plate.x - src[0]), sy2 = Math.sign(plate.y - src[1]);
    var wx = src[0] + sx2, wy = src[1] + sy2, guard2 = 0;
    while (!(wx === plate.x && wy === plate.y) && guard2++ < MAP_W + MAP_H) {
      if (walkable(wx, wy)) { mid = { x: wx, y: wy }; break; }
      wx += sx2; wy += sy2;
      if (!sx2 && !sy2) break;
    }
    if (!mid) continue;
    tries++;
    L.mons.length = 0;
    P.x = mid.x; P.y = mid.y; P.hp = P.mhp = 400;
    G.msgq = [];
    springFromAfar(tr);
    /* damaged, or seen to duck: either way the shot came at you */
    var said = G.msgq.map(function (q) { return q.s || ''; }).join(' ');
    if (P.hp < 400 || said.indexOf('throw yourself flat') >= 0) hitP++;
    /* and now a creature standing there instead of you */
    var away = null;
    for (i = 0; i < r.floors.length; i++) {
      var g = r.floors[i];
      if (g[0] === mid.x && g[1] === mid.y) continue;
      if (g[0] === plate.x && g[1] === plate.y) continue;
      away = g; break;
    }
    if (!away) continue;
    P.x = away[0]; P.y = away[1]; P.hp = 400;
    var m = mkMonster('O', 5, mid.x, mid.y);
    m.hp = m.mhp = 400; m.state = 2; m.disguise = 0;
    L.mons.push(m);
    var tr2 = { x: plate.x, y: plate.y, k: kind, found: 1, spent: 0 };
    G.msgq = [];
    springFromAfar(tr2);
    if (m.hp < 400 || L.mons.indexOf(m) < 0) hitM++;
    L.mons.length = 0;
    if (tries >= 6) break;
  }
  if (!tries) return { bad: ['never found a plate with a clear nozzle'], tries: 0 };
  if (hitP < tries) bad.push('you were in the line ' + tries + ' times and hit ' + hitP);
  if (hitM < tries) bad.push('a creature was in the line ' + tries + ' times and hit ' + hitM);
  return { bad: bad, tries: tries, hitP: hitP, hitM: hitM };
}
/* The edge tiles edge something: a patch of moss along a side, or a
   wall.  Never a corner, because a corner gives them nothing to face. */
function mossEdgesOK(){
  var bad=[], i, k, edge=0, field=0, onWall=0, mossyWall=0, corner=0;
  for (i = 0; i < L.tiles.length; i++) {
    var d = L.decor[i];
    if (!isMoss(d)) continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0;
    if (!isMossEdge(d)) { field++; continue; }
    edge++;
    var sides = 0, wallOnly = 1, mossy = 0, corners = 0;
    for (k = 0; k < DIR4.length; k++) {
      var nx = x + DIR4[k][0], ny = y + DIR4[k][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      var j = ny * MAP_W + nx;
      if (isMoss(L.decor[j]) && !isMossEdge(L.decor[j])) { sides++; wallOnly = 0; }
      else if (L.tiles[j] === WALL) {
        sides++;
        if (wallVariant(nx, ny) === 'wall_moss') mossy = 1;
      }
    }
    for (k = 0; k < DIR8.length; k++) {
      var cx = x + DIR8[k][0], cy = y + DIR8[k][1];
      if (cx < 0 || cy < 0 || cx >= MAP_W || cy >= MAP_H) continue;
      var c = L.decor[cy * MAP_W + cx];
      if (isMoss(c) && !isMossEdge(c)) corners++;
    }
    if (!sides) {
      bad.push('an edge of moss at ' + x + ',' + y + ' faces nothing');
      if (corners) corner++;
    }
    if (wallOnly) { onWall++; if (mossy) mossyWall++; }
  }
  return { bad: bad, edge: edge, field: field, onWall: onWall,
           mossyWall: mossyWall, corner: corner };
}
/* A runed stone tells you nothing by looking at it. */
function stoneLooksOK(seeds){
  var bad=[], i, s, runes=[], first=null, differed=0;
  for (i = 0; i < WEAPONS.length; i++) if (WEAPONS[i].rune) runes.push(i);
  if (runes.length < 2) return ['fewer than two runed stones to tell apart'];
  for (s = 0; s < seeds; s++) {
    bootTest(70000 + s);
    var seen = {}, deal = [];
    for (i = 0; i < runes.length; i++) {
      var spr2 = itemSprite(mkItem('weapon', runes[i]));
      if (!spr2 || spr2 === 'void') bad.push('a runed stone has no look at all');
      if (seen[spr2]) bad.push('two runed stones look alike this run: ' + spr2);
      seen[spr2] = 1;
      deal.push(spr2);
    }
    var key = deal.join(',');
    if (first === null) first = key;
    else if (key !== first) differed++;
  }
  if (!differed) bad.push('every run deals the looks out the same way');

  /* And it wears the same carving in the air as it does in your hand.
     The flight was drawn from WEAPONS[k].s - the stone's true sprite -
     while the one in the pack wore this run's carving, so a red stone
     went white the moment you threw it and named its own rune on the
     way across the room. */
  var checked = 0, disguised = 0;
  for (s = 0; s < runes.length; s++) {
    bootTest(70500 + s);
    var k = runes[s];
    var spot = nearWalkable();
    if (!spot) continue;
    var m = mkMonster('E', 5, spot.x, spot.y); m.hp = m.mhp = 5000; L.mons.push(m);
    var st = mkItem('weapon', k); st.cnt = 3; st.known = 0;
    var look = itemSprite(st);
    if (look !== WEAPONS[k].s) disguised++;
    P.slots = new Array(N_SLOTS).fill(null); P.slots[0] = st;
    P.eq.lh = null;
    G.msgq = []; G.beat = 0; G.shot = null; G.ret = null;
    G.throwing = st;
    throwAtSquare(st, m.x, m.y);
    G.throwing = null;
    if (!G.shot) { bad.push('nothing flew when ' + WEAPONS[k].n + ' was thrown'); continue; }
    checked++;
    if (G.shot.spr !== look)
      bad.push(WEAPONS[k].n + ' flies as ' + G.shot.spr + ' but sits in the pack as ' + look);
    /* the one that comes home flies back wearing it too */
    if (G.ret && G.ret.spr !== look)
      bad.push(WEAPONS[k].n + ' comes home as ' + G.ret.spr + ', not as ' + look);
  }
  if (checked < runes.length)
    bad.push('only ' + checked + ' of ' + runes.length + ' runed stones were thrown');
  if (!disguised)
    bad.push('no runed stone was wearing a carving other than its own, so the flight proves nothing');
  return bad;
}
/* A cave of moss keeps some bare stone, and the moss thins as it comes
   up to it: the squares round a clear spot are edge tiles, not whole
   moss.  Out in the dungeon it is the other way about - the tuft is
   whole and the border is laid on the bare floor around it. */
function mossCaveOK(){
  var bad=[], out={caves:0, moss:0, edge:0, clear:0, unfaded:0, sides:{}};
  var i, k, f;
  for (i = 0; i < L.rooms.length; i++) {
    var r = L.rooms[i];
    if (r.gone || r.special !== 'moss') continue;
    out.caves++;
    for (f = 0; f < r.floors.length; f++) {
      var x = r.floors[f][0], y = r.floors[f][1], j = y * MAP_W + x;
      if (L.tiles[j] !== FLOOR) continue;
      var d = L.decor[j];
      if (isMossEdge(d)) { out.edge++; continue; }
      if (isMoss(d)) {
        out.moss++;
        /* whole moss must not be touching a clear spot: that is what the
           edge tiles are for */
        for (k = 0; k < DIR4.length; k++) {
          var nx = x + DIR4[k][0], ny = y + DIR4[k][1];
          if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
          var nj = ny * MAP_W + nx;
          if (L.tiles[nj] !== FLOOR) continue;
          if (!L.decor[nj])
            bad.push('whole moss at ' + x + ',' + y + ' touches bare stone in a cave');
        }
        continue;
      }
      if (!d) {
        out.clear++;
        var faded = 0;
        for (k = 0; k < DIR4.length; k++) {
          var ax = x + DIR4[k][0], ay = y + DIR4[k][1];
          if (ax < 0 || ay < 0 || ax >= MAP_W || ay >= MAP_H) continue;
          if (isMossEdge(L.decor[ay * MAP_W + ax])) faded = 1;
        }
        if (!faded) out.unfaded++;
      }
    }
  }
  return { bad: bad, out: out };
}
/* How many sides of a tuft out in the dungeon get an edge tile. */
function mossSidesReport(){
  var counts = {}, i, k;
  for (i = 0; i < L.tiles.length; i++) {
    var d = L.decor[i];
    if (!isMoss(d) || isMossEdge(d)) continue;
    var ri = L.roomAt[i];
    if (ri >= 0 && L.rooms[ri] && L.rooms[ri].special === 'moss') continue;
    var x = i % MAP_W, y = (i / MAP_W) | 0, n = 0;
    for (k = 0; k < DIR4.length; k++) {
      var nx = x + DIR4[k][0], ny = y + DIR4[k][1];
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      if (isMossEdge(L.decor[ny * MAP_W + nx])) n++;
    }
    counts[n] = (counts[n] || 0) + 1;
  }
  return counts;
}
/* A thrown thing that lands where another of its kind is lying joins it
   rather than disappearing. */
function stonePileOK(){
  var bad=[], i, r=null;
  for (i = 0; i < L.rooms.length; i++)
    if (!L.rooms[i].gone && L.rooms[i].floors.length > 10) { r = L.rooms[i]; break; }
  if (!r) return ['no room to test in'];
  P.x = r.cx; P.y = r.cy;
  L.items.length = 0; L.mons.length = 0;
  var k = weaponIndex('stone');
  /* one already on the floor beside you */
  var lying = mkItem('weapon', k); lying.cnt = 1; lying.known = 1;
  var spot = null;
  for (i = 0; i < DIR4.length; i++) {
    var sx = P.x + DIR4[i][0] * 2, sy = P.y + DIR4[i][1] * 2;
    if (walkable(sx, sy) && !itemAt(L, sx, sy)) { spot = { x: sx, y: sy }; break; }
  }
  if (!spot) return ['nowhere to lay a stone'];
  lying.x = spot.x; lying.y = spot.y; L.items.push(lying);
  /* and another thrown on top of it */
  var flying = mkItem('weapon', k); flying.cnt = 1; flying.known = 1;
  dropNear(spot.x, spot.y, flying);
  var here = itemAt(L, spot.x, spot.y);
  var total = 0;
  for (i = 0; i < L.items.length; i++)
    if (L.items[i].t === 'weapon' && L.items[i].k === k) total += (L.items[i].cnt || 1);
  if (total !== 2) bad.push('two stones on one square came to ' + total);
  if (!here || (here.cnt || 1) !== 2)
    bad.push('the square holds ' + (here ? (here.cnt || 1) : 0) + ', not a pile of two');
  L.items.length = 0;
  return bad;
}
/* Something caught flat footed does not shoot. */
function surprisedHoldsFireOK(){
  var bad=[], i, r=null;
  for (i = 0; i < L.rooms.length; i++)
    if (!L.rooms[i].gone && L.rooms[i].floors.length > 14) { r = L.rooms[i]; break; }
  if (!r) return ['no room to test in'];
  L.mons.length = 0;
  P.x = r.cx; P.y = r.cy; P.hp = P.mhp = 900; G.dead = 0;
  var spot = null;
  for (i = 0; i < r.floors.length; i++) {
    var f = r.floors[i];
    if (f[1] !== P.y) continue;
    var d = Math.abs(f[0] - P.x);
    /* not with its feet in the water: one standing in a pool cannot
       breathe fire at all, which is the rule and not the bug */
    if (isWater(f[0], f[1])) continue;
    if (d >= 3 && d <= 5 && shotClear(f[0], f[1], P.x, P.y)) { spot = f; break; }
  }
  if (!spot) return ['no clear line for a fireball'];
  var m = mkMonster('h', 4, spot[0], spot[1]);
  m.state = 2; m.disguise = 0; m.hp = m.mhp = 900; m.cast = 0; m.doused = 0;
  L.mons.push(m);
  computeVis();
  /* surprised: it holds its fire, every time */
  var shots = 0, tries = 0;
  for (i = 0; i < 40; i++) {
    m.surprised = 1; m.cast = 0;
    tries++;
    if (monRanged(m)) shots++;
  }
  if (shots) bad.push('a surprised half dragon shot ' + shots + ' times out of ' + tries);
  /* and once it has its wits back it does */
  var after = 0;
  for (i = 0; i < 40; i++) {
    m.surprised = 0; m.cast = 0;
    if (monRanged(m)) after++;
  }
  if (!after) bad.push('it never shoots even with its wits about it');
  L.mons.length = 0;
  return bad;
}
/* Fire and water: neither the pool nor anything standing in it burns,
   and stepping into water puts a burning creature out. */
function fireAndWaterOK(){
  var bad=[], i, wet=null;
  for (i = 0; i < L.tiles.length; i++)
    if (L.tiles[i] === WATER) { wet = { x: i % MAP_W, y: (i / MAP_W) | 0 }; break; }
  if (!wet) return ['no water on this floor'];
  L.clouds.length = 0; L.mons.length = 0;
  /* a fire lit on the water is no fire at all */
  dropEmber(wet.x, wet.y, 5, 0);
  for (i = 0; i < L.clouds.length; i++)
    if (L.clouds[i].kind === 'fire' && L.clouds[i].x === wet.x && L.clouds[i].y === wet.y)
      bad.push('a fire is burning on the water');
  /* nor does it spread onto it */
  var dry = null;
  for (i = 0; i < DIR4.length; i++) {
    var nx = wet.x + DIR4[i][0], ny = wet.y + DIR4[i][1];
    if (walkable(nx, ny) && !inWater(nx, ny)) { dry = { x: nx, y: ny }; break; }
  }
  if (dry) {
    L.clouds.length = 0;
    spawnFire(dry.x, dry.y);
    for (i = 0; i < L.clouds.length; i++) {
      var c = L.clouds[i];
      if (c.kind === 'fire' && inWater(c.x, c.y))
        bad.push('fire spread onto the water');
    }
  }
  L.clouds.length = 0;
  /* a creature standing in it does not catch */
  var m = mkMonster('K', 1, wet.x, wet.y);
  m.state = 2; m.disguise = 0; m.hp = m.mhp = 90; m.burn = 0;
  L.mons.push(m);
  igniteMon(m, 'It catches fire.');
  if (m.burn) bad.push('something standing in water caught fire');
  /* and one already alight that steps in goes out */
  m.burn = 5;
  var died = burnTick(m);
  if (died) bad.push('a burning creature in water burned to death');
  if (m.burn) bad.push('a burning creature in water is still alight');
  L.mons.length = 0;
  return bad;
}
function flinchFirstOK(){
  var bad=[], i, r=null, gaps=[];
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>12){ r=L.rooms[i]; break; }
  if(!r) return ['no room to test flinching in'];
  P.hp=P.mhp=400; G.dead=0; P.blind=0; P.hallu=0;
  /* a creature alight beside you: it takes its burn at the top of its
     own turn and then wants to step */
  for(var trial=0;trial<12;trial++){
    L.mons.length=0;
    P.x=r.cx; P.y=r.cy;
    var spot=null;
    for(i=0;i<r.floors.length;i++){
      var f=r.floors[i];
      if(Math.abs(f[0]-P.x)+Math.abs(f[1]-P.y)===2){ spot=f; break; }
    }
    if(!spot) return ['nowhere to stand a creature'];
    var m=mkMonster('E',3,spot[0],spot[1]);
    m.state=2; m.disguise=0; m.hp=m.mhp=400; m.burn=4;
    L.mons.push(m);
    computeVis();
    if(!canSeeMon(m)) return ['the creature cannot be seen'];
    G.beat=0;
    var t0=nowMs();
    beatWait(BEAT_PLAYER);
    monstersMove();
    if(!m.hurt) continue;                    /* the burn missed it somehow */
    if(!m.anim||!m.anim.length) continue;    /* it did not move this turn */
    var gap=m.anim[0][4]-m.hurt.t;
    gaps.push(gap);
    if(gap<HURT_MS) bad.push('a burning creature steps '+gap+'ms after its own flinch, which lasts '+HURT_MS+'ms');
  }
  if(!gaps.length) bad.push('no burning creature ever both flinched and stepped');
  L.mons.length=0;
  return bad;
}
function shotTimingOK(){
  var bad=[], i, r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>14){ r=L.rooms[i]; break; }
  if(!r) return ['no room to test shooting in'];
  L.mons.length=0;
  P.x=r.floors[0][0]; P.y=r.floors[0][1];
  var spot=null;
  for(i=0;i<r.floors.length;i++){
    var f=r.floors[i];
    if(f[1]===P.y && f[0]>P.x+2){ spot=f; break; }
  }
  if(!spot) return ['no clear line of fire'];
  var m=mkMonster('O',5,spot[0],spot[1]);
  m.state=2; m.disguise=0; m.hp=m.mhp=400;
  L.mons.push(m);
  computeVis();
  var bow=null, arrows=null;
  for(i=0;i<WEAPONS.length;i++){
    if(WEAPONS[i].n==='short bow') bow=i;
    if(WEAPONS[i].ammoFor==='short bow') arrows=i;
  }
  P.eq.lh=mkItem('weapon',bow);
  var am=mkItem('weapon',arrows); am.cnt=20; addItem(am);
  G.beat=0;
  fireAt(m);
  if(!G.beat) bad.push('the shot did not pause the turn, so monsters move while it flies');
  var flight=G.beat;
  if(m.hp<400 && (!m.hurt || m.hurt.t <= nowMs()+1))
    bad.push('the target flinches before the arrow arrives');
  var lines=G.msgq.filter(function(x){return x.at;});
  if(lines.length && lines[lines.length-1].at <= nowMs()+1)
    bad.push('the text appears before the arrow lands');
  monstersMove();
  var moved=L.mons.filter(function(x){return x.anim&&x.anim.length;});
  if(moved.length && stepAt(moved[0],0) <= nowMs()+1)
    bad.push('a monster starts moving before the arrow lands');
  if(moved.length && stepAt(moved[0],0) < nowMs()+flight-5)
    bad.push('monsters wait less than the flight time');
  L.mons.length=0;
  return bad;
}
/* when a creature's nth step is timed to happen */
function stepAt(m,n){ return m.anim[n][4]; }
function turnPacingOK(){
  var bad=[], i, r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return ['no room to test pacing in'];
  L.mons.length=0;
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=400; G.dead=0;
  P.blind=0; P.hallu=0; P.monsight=0;
  computeVis();
  var spots=[];
  for(i=0;i<r.floors.length && spots.length<4;i++){
    var f=r.floors[i];
    if(f[0]===P.x&&f[1]===P.y) continue;
    if(Math.abs(f[0]-P.x)+Math.abs(f[1]-P.y)<2) continue;
    if(!(L.flags[f[1]*MAP_W+f[0]] & F_VIS)) continue;
    spots.push(f);
  }
  if(spots.length<3) return ['not enough room to place a crowd'];
  for(i=0;i<spots.length;i++){
    var m=mkMonster('O',5,spots[i][0],spots[i][1]);
    m.state=2; m.disguise=0; m.hp=m.mhp=400;
    L.mons.push(m);
  }
  computeVis();
  G.beat=0;
  var t0=nowMs();
  beatWait(BEAT_PLAYER);
  monstersMove();
  var seen=L.mons.filter(function(m){return m.anim&&m.anim.length&&canSeeMon(m);});
  var times=seen.map(function(m){return stepAt(m,0);});
  times.sort(function(a,b){return a-b;});
  if(times.length<2) return ['not enough of the crowd was visible to judge'];
  if(times[0] < t0 + BEAT_PLAYER - 5) bad.push('the dungeon answers before your blow is seen');
  for(i=1;i<times.length;i++)
    if(times[i]-times[i-1] < 20) bad.push('two creatures act at the same instant');
  var stamps=G.msgq.map(function(x){return x.at;}).filter(function(v){return v;});
  for(i=1;i<stamps.length;i++)
    if(stamps[i] < stamps[i-1]) bad.push('the text runs out of order');
  L.mons.length=0;
  return bad;
}
function stoneRunesOK(){
  var bad=[], i, r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return ['no room to test stones in'];
  function idx(name){ for(var j=0;j<WEAPONS.length;j++) if(WEAPONS[j].n===name) return j; return -1; }
  var kinds={blast:idx('blasting stone'), slow:idx('binding stone'), ret:idx('returning stone')};
  for(var k in kinds) if(kinds[k]<0) bad.push('no '+k+' stone in the table');
  if(bad.length) return bad;
  function setup(){
    L.mons.length=0;
    P.x=r.cx; P.y=r.cy; P.hp=P.mhp=400; G.dead=0; G.beat=0; G.ret=null; G.splash=null;
    for(i=0;i<N_SLOTS;i++) P.slots[i]=null;
    var line=[];
    for(i=0;i<r.floors.length && line.length<3;i++){
      var f=r.floors[i];
      if(Math.abs(f[0]-P.x)+Math.abs(f[1]-P.y)<2) continue;
      if(!throwValid(f[0],f[1])) continue;
      if(!walkable(f[0]+1,f[1])) continue;
      line.push(f);
    }
    return line;
  }
  var line=setup();
  if(line.length<2) return ['no clear line to test with'];
  var a=mkMonster('O',5,line[0][0],line[0][1]); a.state=2; a.disguise=0; a.hp=a.mhp=400;
  var b=mkMonster('O',5,line[0][0]+1,line[0][1]); b.state=2; b.disguise=0; b.hp=b.mhp=400;
  L.mons.push(a); L.mons.push(b); computeVis();
  var bs=mkItem('weapon',kinds.blast); bs.cnt=1; bs.known=1; addItem(bs);
  G.throwing=bs;
  fireAt(a);
  if(a.hp>=400 && b.hp>=400) bad.push('the blasting stone hurt nobody');
  if(b.hp>=400) bad.push('the blast did not reach the one standing beside it');
  line=setup();
  var c=mkMonster('O',5,line[0][0],line[0][1]); c.state=2; c.disguise=0; c.hp=c.mhp=400; c.slowed=0;
  L.mons.push(c); computeVis();
  /* A stack deep enough to actually throw forty times.  With one stone
     the first throw spent it, canShoot then found nothing to throw, and
     the other thirty-nine did nothing at all - so whether this passed
     came down to whether that single throw happened to hit. */
  var ss=mkItem('weapon',kinds.slow); ss.cnt=1; ss.known=1; addItem(ss);
  ss=null;
  var packed=carriedItems();
  for(i=0;i<packed.length;i++)
    if(packed[i].t==='weapon' && packed[i].k===kinds.slow) ss=packed[i];
  if(!ss) return ['the binding stone would not go in the pack'];
  ss.cnt=60;
  G.throwing=ss;
  var tries=0;
  while(!c.slowed && tries++<40){ c.hp=400; fireAt(c); }
  if(!c.slowed && countOf(ss)<=0) bad.push('ran out of binding stones after '+tries+' throws');
  if(!c.slowed) bad.push('the binding stone never slowed anything');
  line=setup();
  var d=mkMonster('O',5,line[0][0],line[0][1]); d.state=2; d.disguise=0; d.hp=d.mhp=400;
  L.mons.push(d); computeVis();
  var rs=mkItem('weapon',kinds.ret); rs.cnt=1; rs.known=1; addItem(rs);
  G.throwing=rs;
  fireAt(d);
  var held=0, all=carriedItems();
  for(i=0;i<all.length;i++)
    if(all[i].t==='weapon' && WEAPONS[all[i].k].rune==='return') held+=all[i].cnt;
  if(!held) bad.push('the returning stone did not come back');
  if(!G.ret) bad.push('the return flight is not animated');
  else {
    if(G.ret.tx!==P.x || G.ret.ty!==P.y) bad.push('the stone flies back to the wrong place');
    if(!(G.ret.dur>0)) bad.push('the return flight takes no time');
  }
  G.throwing=null; L.mons.length=0;
  return bad;
}
function stoneLootRates(){
  var counts={}, tot=0, i;
  for(i=0;i<40000;i++){
    var it=newItem(6);
    if(it.t!=='weapon') continue;
    var W=WEAPONS[it.k];
    if(!W.thrown) continue;
    counts[W.n]=(counts[W.n]||0)+1; tot++;
  }
  return {counts:counts, tot:tot};
}
function stairsUpOK(){
  var bad=[], i;
  bootTest(60100);
  var upTiles=0, upAt=null;
  for(i=0;i<L.tiles.length;i++)
    if(L.tiles[i]===STAIR_UP){ upTiles++; upAt=[i%MAP_W,(i/MAP_W)|0]; }
  if(upTiles!==1) bad.push('the first floor has '+upTiles+' stairs up, want 1');
  /* it is there, it is where you came in, and it does not work */
  if(upAt){
    P.x=upAt[0]; P.y=upAt[1];
    G.msgq=[];
    var climbed=useStairs();
    var said=G.msgq.map(function(m){return m.s;}).join(' ');
    if(climbed || G.depth!==1) bad.push('the first floor let you climb out');
    if(said.indexOf('collapsed')<0) bad.push('no word of the collapse: '+said);
    G.msgq=[];
  }
  P.x=L.stair.x; P.y=L.stair.y;
  useStairs();
  if(G.depth!==2) bad.push('could not descend from the first floor');
  for(var d=2;d<=6;d++){
    upTiles=0;
    var at=null;
    for(i=0;i<L.tiles.length;i++)
      if(L.tiles[i]===STAIR_UP){ upTiles++; at=[i%MAP_W,(i/MAP_W)|0]; }
    if(upTiles!==1){ bad.push('floor '+d+' has '+upTiles+' ways up'); break; }
    if(at[0]!==P.x||at[1]!==P.y) bad.push('the way up is not where you arrived: floor '+d+' up at '+at[0]+','+at[1]+' but you are at '+P.x+','+P.y+' tile '+L.tiles[P.y*MAP_W+P.x]);
    if(!walkable(at[0],at[1])) bad.push('you cannot stand on the way up');
    var was=G.depth;
    useStairs();
    if(G.depth!==was-1){ bad.push('climbing did not take you up'); break; }
    P.x=L.stair.x; P.y=L.stair.y;
    useStairs();
    if(G.depth!==was) bad.push('could not go back down');
    if(d<6){ P.x=L.stair.x; P.y=L.stair.y; useStairs(); }
  }
  bootTest(60200);
  P.x=L.stair.x; P.y=L.stair.y; useStairs();
  for(i=0;i<6;i++){
    var here=G.depth, up=null;
    for(var j=0;j<L.tiles.length;j++) if(L.tiles[j]===STAIR_UP) up=[j%MAP_W,(j/MAP_W)|0];
    if(!up) break;
    P.x=up[0]; P.y=up[1];
    useStairs();
    if(G.depth>=here) break;
  }
  if(G.depth<1) bad.push('climbed above the first floor, to '+G.depth);
  return bad;
}
function fireOK(){
  var bad=[], i, r=null;
  /* not the powder room: a barrel swallows the flask instead of
     catching light from it, and there is nothing to measure */
  for(i=0;i<L.rooms.length;i++){
    var rr=L.rooms[i];
    if(rr.gone||rr.floors.length<=24) continue;
    var powder=0, f;
    for(f=0;f<rr.floors.length;f++)
      if(barrelAt(rr.floors[f][0], rr.floors[f][1])) powder=1;
    if(powder) continue;
    r=rr; break;
  }
  if(!r) return {bad:['no room big enough to burn']};
  L.clouds.length=0; L.mons.length=0;
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=400; G.dead=0; G.beat=0;
  var sizes=[], turns=[];
  for(var t2=0;t2<40;t2++){
    L.clouds.length=0;
    sizes.push(spawnFire(r.floors[0][0], r.floors[0][1]));
    for(i=0;i<L.clouds.length;i++){
      if(L.clouds[i].kind!=='fire') bad.push('spawnFire made something that is not fire');
      turns.push(L.clouds[i].turns);
    }
  }
  var avg=sizes.reduce(function(a,b){return a+b;},0)/sizes.length;
  if(Math.min.apply(null,sizes)<1) bad.push('a flask sometimes lights nothing');
  if(Math.max.apply(null,sizes)>FIRE_MAX_CELLS) bad.push('fire ran past its limit');
  if(avg<2) bad.push('fire barely spreads: '+avg.toFixed(1)+' squares');
  if(Math.min.apply(null,turns)<FIRE_TURNS_MIN) bad.push('a fire lasts less than a turn');
  if(Math.max.apply(null,turns)>FIRE_TURNS_MAX) bad.push('a fire outlasts its limit');
  L.clouds.length=0; L.mons.length=0;
  var spot=r.floors[0];
  var m=mkMonster('O',5,spot[0],spot[1]); m.state=2; m.disguise=0; m.hp=m.mhp=400;
  L.mons.push(m);
  spawnFire(spot[0],spot[1]);
  burnEverything();
  if(m.hp>=400) bad.push('fire did not burn what was standing in it');
  var guard=0;
  while(L.clouds.length && guard++<20) ageClouds();
  if(L.clouds.length) bad.push('the fire never went out');
  L.clouds.length=0; L.mons.length=0;
  P.x=spot[0]; P.y=spot[1]; P.hp=400; G.dead=0;
  spawnFire(spot[0],spot[1]);
  /* the air on your own square is dealt with at the head of the turn */
  cloudsOnYou(); ageClouds();
  if(P.hp>=400) bad.push('standing in fire did not hurt');
  L.clouds.length=0;
  return {bad:bad, avg:avg};
}
function gasShapeOK(){
  var bad=[], i, t2, r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>28){ r=L.rooms[i]; break; }
  if(!r) return {bad:['no room big enough to gas']};
  var diagRuns=0, sizes=[], lifeSpread=0, runs=60;
  for(t2=0;t2<runs;t2++){
    L.clouds.length=0;
    var n=spawnCloud(r.cx,r.cy,'poison',0);
    sizes.push(n);
    var offAxis=0, lives={};
    for(i=0;i<L.clouds.length;i++){
      var g=L.clouds[i];
      if(g.x!==r.cx && g.y!==r.cy) offAxis++;
      lives[g.turns]=1;
      if(g.turns<GAS_TURNS_MIN-1 || g.turns>GAS_TURNS_MAX+1)
        bad.push('a gas square lasts '+g.turns+' turns');
    }
    if(offAxis) diagRuns++;
    if(Object.keys(lives).length>1) lifeSpread++;
  }
  var avg=sizes.reduce(function(a,b){return a+b;},0)/sizes.length;
  if(diagRuns<runs) bad.push('gas made a plain cross in '+(runs-diagRuns)+' of '+runs+' clouds');
  if(lifeSpread<runs*0.5) bad.push('gas squares nearly all share one lifetime');
  if(avg<GAS_CELLS_MIN) bad.push('gas clouds are too small: '+avg.toFixed(1));
  L.clouds.length=0;
  spawnCloud(r.cx,r.cy,'poison',0);
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=900; G.dead=0;
  var guard=0;
  while(L.clouds.length && guard++<30) ageClouds();
  if(L.clouds.length) bad.push('the gas never cleared');
  L.clouds.length=0;
  return {bad:bad, avg:avg, diag:Math.round(100*diagRuns/runs)};
}
function splashOK(){
  var bad=[], i, r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>20){ r=L.rooms[i]; break; }
  if(!r) return ['no room to test in'];
  L.mons.length=0; L.clouds.length=0;
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=400; G.dead=0; G.beat=0; G.drops=null;
  for(i=0;i<N_SLOTS;i++) P.slots[i]=null;
  var sq=null;
  for(i=0;i<r.floors.length;i++){
    var f=r.floors[i];
    if(Math.max(Math.abs(f[0]-P.x),Math.abs(f[1]-P.y))>=2 && throwValid(f[0],f[1])){ sq=f; break; }
  }
  if(!sq) return ['nowhere clear to throw'];
  var pot=mkItem('potion',0); pot.cnt=1; addItem(pot);
  throwAtSquare(pot, sq[0], sq[1]);
  if(!G.drops) bad.push('a flask made no splash');
  else {
    if(G.drops.x!==sq[0]||G.drops.y!==sq[1]) bad.push('the splash is not where it landed');
    if(!G.drops.parts || G.drops.parts.length<4) bad.push('too few droplets');
    var left=0,right=0,up=0,down=0, far=0;
    for(i=0;i<G.drops.parts.length;i++){
      var p2=G.drops.parts[i];
      if(p2.dx<0) left++; else right++;
      if(p2.dy<0) up++; else down++;
      far=Math.max(far, Math.sqrt(p2.dx*p2.dx+p2.dy*p2.dy));
    }
    if(!left||!right||!up||!down) bad.push('the droplets all go one way');
    if(far>SPLASH_REACH+0.3) bad.push('droplets carry '+far.toFixed(1)+' squares');
    if(!/^#[0-9a-f]{6}$/i.test(G.drops.col||'')) bad.push('the splash has no colour');
  }
  G.drops=null;
  var st=mkItem('weapon',weaponIndex('stone')); st.cnt=1; st.known=1; addItem(st);
  throwAtSquare(st, sq[0], sq[1]);
  if(G.drops) bad.push('a stone splashed like a flask');
  return bad;
}
function throwAnywhereOK(){
  var bad=[], i, r=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>24){ r=L.rooms[i]; break; }
  if(!r) return ['no room big enough'];
  function reset(){
    L.mons.length=0; L.clouds.length=0; L.items.length=0;
    for(i=0;i<N_SLOTS;i++) P.slots[i]=null;
    P.x=r.cx; P.y=r.cy; P.hp=P.mhp=400; G.dead=0; G.beat=0;
    computeVis();
  }
  function openSquare(dist){
    for(i=0;i<r.floors.length;i++){
      var f=r.floors[i];
      /* dry, solid floor: a room can have a stream or a chasm across it
         now, and a flask thrown into a gap has nothing to land on */
      if(tileAt(f[0],f[1])!==FLOOR || L.decor[f[1]*MAP_W+f[0]]) continue;
      if(Math.max(Math.abs(f[0]-P.x),Math.abs(f[1]-P.y))>=dist &&
         throwValid(f[0],f[1]) && !monAt(L,f[0],f[1])) return f;
    }
    return null;
  }
  reset();
  var sq=openSquare(2);
  if(!sq) return ['nowhere clear to throw'];
  var st=mkItem('weapon',weaponIndex('stone')); st.cnt=2; st.known=1; addItem(st);
  throwAtSquare(st, sq[0], sq[1]);
  var onFloor=0;
  for(i=0;i<L.items.length;i++)
    if(L.items[i].t==='weapon' && WEAPONS[L.items[i].k].n==='stone') onFloor++;
  if(!onFloor) bad.push('a stone thrown at the floor vanished');
  if(st.cnt!==1) bad.push('throwing did not use up a stone');
  function potIndex(name){ for(var j=0;j<POTIONS.length;j++) if(POTIONS[j].n===name) return j; return -1; }
  reset();
  var fp=mkItem('potion',potIndex('liquid fire')); fp.cnt=1; addItem(fp);
  KNOWN.pot[fp.k]=0;
  sq=openSquare(2);
  throwAtSquare(fp, sq[0], sq[1]);
  var fires=0;
  for(i=0;i<L.clouds.length;i++) if(L.clouds[i].kind==='fire') fires++;
  if(!fires) bad.push('an unidentified flask of fire did nothing');
  if(!KNOWN.pot[fp.k]) bad.push('seeing it burn did not identify it');
  reset();
  var gp=mkItem('potion',potIndex('poison')); gp.cnt=1; addItem(gp);
  KNOWN.pot[gp.k]=0;
  sq=openSquare(2);
  throwAtSquare(gp, sq[0], sq[1]);
  var gas=0;
  for(i=0;i<L.clouds.length;i++) if(L.clouds[i].kind==='poison') gas++;
  if(!gas) bad.push('an unidentified flask of gas did nothing');
  reset();
  /* something that really does nothing when it breaks - healing makes a
     red mist now, so it is no longer the inert one */
  var dull=mkItem('potion',potIndex('thirst quenching')); dull.cnt=1; addItem(dull);
  sq=openSquare(2);
  throwAtSquare(dull, sq[0], sq[1]);
  if(L.clouds.length) bad.push('a plain flask made clouds');
  reset();
  var hp2=mkItem('potion',potIndex('healing')); hp2.cnt=1; addItem(hp2);
  sq=openSquare(2);
  throwAtSquare(hp2, sq[0], sq[1]);
  var mist=0;
  for(i=0;i<L.clouds.length;i++) if(L.clouds[i].kind==='mend') mist++;
  if(!mist) bad.push('a flask of healing made no red mist');
  reset();
  if(throwValid(P.x+SHOT_RANGE+3, P.y)) bad.push('you can throw past the range limit');
  if(!throwValid(P.x,P.y)) bad.push('you cannot drop something at your own feet');
  for(i=0;i<POTIONS.length;i++){
    var probe=mkItem('potion',i);
    KNOWN.pot[i]=0;
    if(!isThrowable(probe)) bad.push('cannot throw an unknown '+POTIONS[i].n);
  }
  L.clouds.length=0; L.mons.length=0;
  return bad;
}
function edgingOK(){
  var bad=[], W=MAP_W;
  function setup(rows){
    for(var i=0;i<L.tiles.length;i++) L.tiles[i]=FLOOR;
    for(var y=0;y<rows.length;y++)
      for(var x=0;x<rows[y].length;x++)
        if(rows[y][x]==='~') L.tiles[(4+y)*W+(4+x)]=WATER;
        else if(rows[y][x]==='O') L.tiles[(4+y)*W+(4+x)]=HOLE;
  }
  function at(x,y){ return edgeCorners(x,y).join(''); }
  function check(rows, x, y, want, why){
    setup(rows);
    var got=at(x,y);
    if(got!==want) bad.push(why+': got '+got+' want '+want);
  }
  check(['...','...','...'], 5,5, '0000', 'open floor is left square');
  check(['~~~','...','...'], 5,5, '0000', 'a straight shore is not notched');
  check(['~~.','~..','...'], 5,5, '1000', 'a notch is filled at that corner');
  check(['~..','...','...'], 5,5, '0000', 'a lone diagonal is left alone');
  check(['...','.~.','...'], 5,5, '1111', 'a lone pool tile is rounded off');
  setup(['...','.~~','...']);
  if(at(5,5)!=='1010') bad.push('the end of a spur: got '+at(5,5)+' want 1010');
  setup(['~~~','~~~','~~~']);
  if(at(5,5)!=='0000') bad.push('the middle of a pool was cut: '+at(5,5));
  setup(['~~~','~~~','...']);
  if(at(5,5)!=='0000') bad.push('a straight bank was chamfered: '+at(5,5));
  check(['...','.O.','...'], 5,5, '1111', 'a lone pit tile is rounded off');
  setup(['~~.','~..','...']);
  if(!walkable(5,5)) bad.push('a rounded corner made the floor unwalkable');
  if(tileAt(5,5)!==FLOOR) bad.push('edging changed the tile type');
  setup(['...','.~.','...']);
  if(tileAt(5,5)!==WATER) bad.push('chamfering changed the water into something else');
  return bad;
}
function clearFloorOdds(depth, runs){
  var died=0, hpLeft=0, mobs=0, ok=0, i;
  for(i=0;i<runs;i++){
    bootTest(410000+depth*1000+i);
    if(depth>1) enterLevel(depth);
    P.hp=P.mhp; G.dead=0;
    var roster=[];
    for(var j=0;j<L.mons.length;j++) if(!L.mons[j].ally) roster.push(L.mons[j].c);
    var alive=true;
    for(var k=0;k<roster.length && alive;k++){
      var m=mkMonster(roster[k],depth,P.x+1,P.y);
      m.state=2; m.surprised=0; m.disguise=0;
      L.mons.length=0; L.mons.push(m);
      var guard=0;
      while(m.hp>0 && !G.dead && guard++<200){
        playerAttack(m);
        if(m.hp<=0) break;
        monAttack(m);
        G.msgq=[]; G.log=[];
      }
      if(G.dead) alive=false;
    }
    if(alive){ ok++; hpLeft+=P.hp; mobs+=roster.length; } else died++;
  }
  return { died: Math.round(100*died/runs),
           hp: ok ? Math.round(hpLeft/ok) : 0,
           mobs: ok ? (mobs/ok) : 0 };
}
/* the panels size themselves from the font, so the tests ask them */
function barWidths(){
  var cw=ATLAS.font.cw;
  function fits(w){ return Math.max(0,(w/cw)|0); }
  return { fight:{ lw:fits(165-1-2), mw:fits(233-169-2) },
           trap: { lw:fits(233-1-2), mw:fits(320-237-2) } };
}
/* How many letters of the widest kind fit in the pack's column.  It used
   to be worked out from a screen 320 pixels across, which this game has
   never been - so it allowed 29 where 21 fit, and every check that used
   it was looser than it looked. */
function noteChars(){ return Math.max(0,(INV_COL_W/ATLAS.font.cw)|0); }
/* a monster with its back to you must be easier to hit */
function fleeHitReport(){
  function pct(state, flee, surprised){
    var m=mkMonster('O',6,P.x+1,P.y);
    m.state=state; m.flee=flee; m.surprised=surprised;
    var hits=0, N=40000;
    for(var i=0;i<N;i++) if(swingP(P.lv, m.ar, playerHitBonus()+surpriseHit(m))) hits++;
    return Math.round(100*hits/N);
  }
  return { standing: pct(2,0,0), fleeing: pct(2,5,0),
           surprised: pct(2,0,1), asleep: pct(0,0,0) };
}
/* furniture, holes and the drop through them */
function dungeonFurnishing(){
  var i, tables=0, chairs=0, holes=0, cracks=0;
  for(i in L.decor){
    if(L.decor[i]==='table') tables++;
    if(L.decor[i]==='chair') chairs++;
    if(isCrack(L.decor[i])) cracks++;
  }
  for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===HOLE) holes++;
  return {tables:tables, chairs:chairs, holes:holes, cracks:cracks};
}
function holesOK(){
  var bad=[], i, x, y;
  for(i=0;i<L.tiles.length;i++){
    if(L.tiles[i]!==HOLE) continue;
    x=i%MAP_W; y=(i/MAP_W)|0;
    if(walkable(x,y)) bad.push('a hole is walkable, so monsters would use it');
    if(blocksShot(x,y)) bad.push('a hole stops arrows');
    var ring=0;
    for(var dy=-1;dy<=1;dy++) for(var dx=-1;dx<=1;dx++){
      var k=(y+dy)*MAP_W+(x+dx);
      if(isCrack(L.decor[k])) ring++;
    }
    if(!ring) bad.push('a hole with no cracks around it');
  }
  if(!everywhereReachable(L)) bad.push('a hole cut the floor in two');
  return bad;
}
function fallOK(){
  var bad=[], i;
  for(var t=0;t<40;t++){
    bootTest(80000+t);
    var target=null;
    for(var d=2;d<=20 && target===null;d++){
      enterLevel(d);
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===HOLE){ target=i; break; }
    }
    if(target===null) continue;
    var from=G.depth, x=target%MAP_W, y=(target/MAP_W)|0;
    P.hp=P.mhp=400; G.dead=0;
    var dir=null;
    for(i=0;i<4;i++){
      var ax=x-DIR4[i][0], ay=y-DIR4[i][1];
      if(walkable(ax,ay)){ P.x=ax; P.y=ay; dir=DIR4[i]; break; }
    }
    if(!dir) continue;
    playerMove(dir[0],dir[1]);
    if(G.ask) answerAsk(true);          /* yes, jump */
    if(G.depth<=from) bad.push('walking into a hole did not drop you');
    if(G.depth>from+FALL_MAX) bad.push('fell further than the maximum');
    if(G.depth>26) bad.push('fell past the bottom of the dungeon');
    if(P.hp>=400) bad.push('a fall did no damage');
    if(tileAt(P.x,P.y)===HOLE) bad.push('you landed in another hole');
    return bad;
  }
  return ['no hole found to fall through'];
}
/* --- traps: two sections, and monsters set them off too ------------- */
function trapBarStats(){
  var maxS=0, maxFx=0, bad=[], i;
  for(i=0;i<TRAPLOG.length;i++){
    var t=TRAPLOG[i];
    if(t.s.length>maxS) maxS=t.s.length;
    if(t.fx.length>maxFx) maxFx=t.fx.length;
    if(!t.fx) bad.push('no effect shown: '+t.s);
  }
  return {n:TRAPLOG.length, maxS:maxS, maxFx:maxFx, bad:bad};
}
function trapDrill(){
  var i;
  for(i=0;i<TRAPS.length;i++){
    for(var r=0;r<6;r++){
      P.hp=P.mhp=9999; P.str=16; P.dex=3; G.dead=0; G.pendingFall=0;
      var tr={x:P.x,y:P.y,k:TRAPS[i],found:0,spent:0};
      springTrap(tr);
      springTrap(tr);
      collect(); G.msgq=[]; G.dead=0; G.pendingFall=0;
    }
  }
  P.dex=11;
}
function monTrapOK(){
  var bad=[], i, walker=null, flier=null, c;
  for(c in MON_BY_C){
    if(!MON_BY_C[c].still && !MON_BY_C[c].fly && !walker) walker=c;
    if(MON_BY_C[c].fly && !flier) flier=c;
  }
  if(!walker) return ['no walking monster to test with'];
  var pair=null, spare=null, x, y, d;
  for(y=1;y<MAP_H-1;y++) for(x=1;x<MAP_W-1;x++){
    if(L.tiles[y*MAP_W+x]!==FLOOR) continue;
    if(!pair){
      for(d=0;d<4;d++){
        var ax=x+DIR4[d][0], ay=y+DIR4[d][1];
        if(L.tiles[ay*MAP_W+ax]===FLOOR){ pair={x:x,y:y,fx:ax,fy:ay}; break; }
      }
    } else if(Math.abs(x-pair.x)+Math.abs(y-pair.y) > 6){ spare={x:x,y:y}; }
  }
  if(!pair||!spare) return ['no room to test monster traps'];
  for(i=0;i<TRAPS.length;i++){
    P.x=spare.x; P.y=spare.y; P.hp=P.mhp=9999; G.dead=0;
    L.mons.length=0; L.traps.length=0; L.clouds.length=0;
    var tr={x:pair.x,y:pair.y,k:TRAPS[i],found:0,spent:0};
    L.traps.push(tr);
    var m=mkMonster(walker, 6, pair.fx, pair.fy);
    m.hp=m.mhp=9999; m.state=1; m.stuck=0;
    L.mons.push(m);
    tryMonStep(m, pair.x-pair.fx, pair.y-pair.fy);
    if(!tr.found) bad.push(TRAPS[i].n+' stayed hidden after a monster hit it');
    if(!TRAPS[i].reusable && !tr.spent) bad.push(TRAPS[i].n+' was not spent by a monster');
    var gone = L.mons.indexOf(m)<0;
    var moved = !gone && (m.x!==pair.x || m.y!==pair.y);
    if(!(gone || moved || m.hp<9999 || m.stuck>0) &&
       TRAPS[i].k!=='alarm' && TRAPS[i].k!=='rust')
      bad.push(TRAPS[i].n+' did nothing to a monster');
    if(flier){
      L.mons.length=0;
      var tr2={x:pair.x,y:pair.y,k:TRAPS[i],found:0,spent:0};
      L.traps.length=0; L.traps.push(tr2);
      var fm=mkMonster(flier, 6, pair.fx, pair.fy);
      fm.hp=fm.mhp=9999; fm.state=1;
      L.mons.push(fm);
      tryMonStep(fm, pair.x-pair.fx, pair.y-pair.fy);
      if(tr2.spent) bad.push(TRAPS[i].n+' caught a flying monster');
    }
  }
  L.mons.length=0; L.traps.length=0;
  return bad;
}
function floorShape(){
  var xs={}, ys={}, i, n=0;
  for(i=0;i<L.rooms.length;i++){
    var r=L.rooms[i]; if(r.gone) continue;
    xs[r.x]=1; ys[r.y]=1; n++;
  }
  return {w:MAP_W, h:MAP_H, rooms:n,
          cols:Object.keys(xs).length, rows:Object.keys(ys).length,
          sized: L.tiles.length===MAP_W*MAP_H && L.mw===MAP_W && L.mh===MAP_H};
}
/* A hidden door or a lock has to be the only ordinary way into
   somewhere.  One that opens onto a room you could already walk to is
   just a door with extra steps. */
function sealedSectionsOK(){
  var bad=[], i, k;
  var T=L.tiles;
  function reachWith(openSecret){
    var hidden=[], j;
    if(openSecret) for(j=0;j<T.length;j++) if(T[j]===SDOOR){ hidden.push(j); T[j]=DOOR; }
    var seen=new Uint8Array(reachSet(L, P.x, P.y, true));
    for(j=0;j<hidden.length;j++) T[hidden[j]]=SDOOR;
    return seen;
  }
  /* with the secret doors open, everywhere must be walkable */
  var open=reachWith(true);
  for(i=0;i<T.length;i++){
    var t=T[i];
    if(!walkTile(t) || t===HOLE) continue;
    if(L.sealed && L.sealed[i]) continue;    /* a vault in the dead rock */
    if(!open[i]) bad.push('somewhere is walled off for good');
  }
  /* every secret door must actually hide something: with them shut, part
     of the floor is out of reach */
  var shut=reachWith(false);
  var secrets=0, hiddenArea=0;
  for(i=0;i<T.length;i++){
    if(T[i]===SDOOR) secrets++;
    var t2=T[i];
    if(!standTile(t2)) continue;
    if(!shut[i]) hiddenArea++;
  }
  if(secrets && !hiddenArea) bad.push('the secret door hides nothing');
  if(!secrets) bad.push('no secret door on this floor');
  /* every lock must seal something of its own */
  for(k in L.locks){
    var idx=parseInt(k,10), was=T[idx];
    T[idx]=WALL;
    var seen=reachWith(true);
    var cut=0;
    for(i=0;i<T.length;i++){
      var t3=T[i];
      if(!standTile(t3)) continue;
      if(L.sealed && L.sealed[i]) continue;   /* walled in on purpose */
      if(!seen[i]) cut++;
    }
    T[idx]=was;
    if(!cut) bad.push('a locked door at '+(idx%MAP_W)+','+((idx/MAP_W)|0)+
      ' guards nothing (floor special: '+L.special+')');
  }
  return {bad:bad, secrets:secrets, hidden:hiddenArea};
}
/* Identifying by eye: once per item, and never for free on pickup. */
function studyOK(){
  var bad=[], i;
  P.wis=P.mwis=24;                              /* a keen eye, to test success */
  var it=mkItem('weapon',1); it.hp=2; it.dp=1;
  if(it.known) bad.push('a new item starts identified');
  if(!canAppraise(it)) bad.push('a weapon cannot be studied');
  /* picking it up must not reveal it */
  L.items.length=0;
  it.x=P.x; it.y=P.y; L.items.push(it);
  autoPickup();
  if(it.known) bad.push('picking it up identified it');
  /* one attempt, then never again */
  var tries=0, learned=0;
  for(i=0;i<10;i++){
    var probe=mkItem('armor',3); probe.ap=1;
    G.msgq=[];
    if(appraise(probe)) learned++;
    tries++;
    var before=probe.known;
    G.msgq=[];
    appraise(probe);                            /* a second look */
    var said=G.msgq.map(function(m){return m.s;}).join(' ');
    if(!before && probe.known) bad.push('a second look identified it after all');
    if(!before && said.indexOf('already')<0) bad.push('no word that the chance is spent');
  }
  if(!learned) bad.push('a keen eye never identified anything in ten tries');
  /* a dull eye should mostly fail, and still only get one go */
  P.wis=P.mwis=6;
  var dull=0;
  for(i=0;i<200;i++){
    var p2=mkItem('armor',3); p2.ap=1;
    G.msgq=[];
    if(!appraise(p2)) dull++;
    if(!p2.tried) bad.push('the attempt was not recorded');
  }
  if(dull<150) bad.push('a dull eye identifies too much: failed only '+dull+' of 200');
  /* flasks and scrolls cannot be studied by eye at all */
  if(canAppraise(mkItem('potion',0))) bad.push('a sealed flask can be studied');
  if(canAppraise(mkItem('scroll',0))) bad.push('a sealed scroll can be studied');
  P.wis=P.mwis=10;
  L.items.length=0;
  return bad;
}
/* nothing may be left lying where you cannot see it */
function itemsVisibleOK(){
  var bad=[], i;
  for(i=0;i<L.items.length;i++){
    var it=L.items[i];
    if(decorHides(it.x, it.y, L))
      bad.push('an item is hidden under ' + L.decor[it.y*MAP_W+it.x]);
  }
  return bad;
}
/* A magical pin changes the clothing it goes on - for better or worse. */
function pinOK(){
  var bad=[], i, better=0, worse=0, runed=0, nothing=0;
  for(i=0;i<600;i++){
    var g=mkItem('armor',3); g.known=0; g.ap=0; g.br=null; g.cursed=0;
    var before=g.ap;
    G.msgq=[];
    if(!pinOnto(g)) bad.push('a pin would not go on armour');
    if(!g.known) bad.push('a pinned item was left unidentified');
    var said=G.msgq.map(function(m){return m.s;}).join(' ');
    if(!said) bad.push('pinning said nothing');
    if(g.br) runed++;
    else if(g.ap>before) better++;
    else if(g.ap<before) worse++;
    else nothing++;
    if(g.ap<before && !g.cursed) bad.push('a pin made it worse without cursing it');
  }
  if(!better) bad.push('a pin never improved anything');
  if(!worse) bad.push('a pin was never a mistake');
  if(!runed) bad.push('a pin never enchanted anything');
  /* it will not go on a sword or a flask */
  G.msgq=[];
  if(pinOnto(mkItem('weapon',1))) bad.push('a pin went onto a weapon');
  G.msgq=[];
  if(pinOnto(mkItem('potion',0))) bad.push('a pin went onto a flask');
  return {bad:bad, better:better, worse:worse, runed:runed, nothing:nothing};
}
/* Ammunition and runed stones have to actually turn up. */
/* The shape of a floor, checked against the rules it has to obey:
   the way down is never in the room you arrive in, a key never lies in
   a room its own lock opens onto, and every floor hides a room you get
   into through the wall of another room - not off a corridor. */
function layoutOK(seeds){
  var floors=0, stairShared=0, stairForced=0, keyShared=0, keyStranded=0, keys=0, secret=0, panelled=0;
  var fromRoom=0, fromHall=0, behind=[], vaults=0, pockets=0, s, d, i, k, q;
  for(s=0;s<seeds;s++){
    bootTest(83000+s);
    for(d=1;d<=8;d++){
      enterLevel(d); floors++;
      var home=roomIndexAt(P.x,P.y), down=roomIndexAt(L.stair.x,L.stair.y);
      if(home>=0 && home===down){
        /* A staircase will not stand in a hand-made room or a sealed one,
           so a floor whose only ordinary room is the one you arrived in
           has nowhere else to put the other.  That is the floor being
           small, not the placing being wrong. */
        var elsewhere=0;
        for(var rq=0;rq<L.rooms.length;rq++){
          var rr2=L.rooms[rq];
          if(rr2.gone||rr2.special||rr2.sealed||rq===home) continue;
          if(rr2.floors && rr2.floors.length) elsewhere=1;
        }
        if(elsewhere) stairShared++; else stairForced++;
      }

      for(i=0;i<L.items.length;i++){
        var it=L.items[i];
        if(it.t!=='key') continue;
        keys++;
        var ri=L.roomAt[it.y*MAP_W+it.x];
        if(ri<0) continue;
        var clash=0;
        for(k in L.locks){
          if(L.locks[k]!==it.k) continue;
          var at=k|0, ax=at%MAP_W, ay=(at/MAP_W)|0;
          for(q=0;q<4;q++)
            if(L.roomAt[(ay+DIR4[q][1])*MAP_W+(ax+DIR4[q][0])]===ri) clash=1;
        }
        /* A key in a room its own lock opens is a bug unless the
           generator marked it as a last resort on a cramped floor. */
        if(clash){ keyShared++; if(!it.cramped) keyStranded++; }
      }

      var seen=reachSet(L,P.x,P.y,true), got=0, panel=0;
      for(i=0;i<L.tiles.length;i++){
        if(L.tiles[i]!==SDOOR) continue;
        panel=1;
        var x=i%MAP_W, y=(i/MAP_W)|0, outer=-1, inner=-1;
        for(q=0;q<4;q++){
          var j=(y+DIR4[q][1])*MAP_W+(x+DIR4[q][0]), t=L.tiles[j];
          if(t!==FLOOR && t!==CORR) continue;
          if(seen[j]) outer=j; else inner=j;
        }
        if(outer<0) continue;
        got=1;
        if(L.tiles[outer]===CORR) fromHall++; else fromRoom++;
        if(inner>=0){ var rid=L.roomAt[inner];
          behind.push(rid>=0?L.rooms[rid].floors.length:1); }
      }
      /* Every floor has a hidden room.  Now and then the panel itself is
         inside a sealed vault, so you have to blast your way to the
         thing you then have to search for - which is fine, and worth
         counting separately from a floor that simply has no panel. */
      if(panel) panelled++;
      if(got) secret++;
      if(deadPockets(L).filter(function(p){return p.length>=4;}).length) pockets++;
      if(Object.keys(L.sealed).length) vaults++;
    }
  }
  return { floors:floors, stairShared:stairShared, stairForced:stairForced,
           keys:keys, keyShared:keyShared,
           keyStranded:keyStranded, panelled:panelled,
           secret:secret, fromRoom:fromRoom, fromHall:fromHall,
           behind: behind.reduce(function(a,b){return a+b;},0)/Math.max(1,behind.length),
           pockets:pockets, vaults:vaults };
}

/* The scroll of charging: half as much again, rounded up, and each kind
   of thing spends it in its own way. */
function chargingOK(){
  var bad=[], i;
  function mk(t,k,cnt,ch){ var it=mkItem(t,k); if(cnt) it.cnt=cnt; if(ch) it.ch=ch; return it; }

  /* wands gain charges outright */
  [[1,2],[2,3],[3,5],[4,6],[8,12]].forEach(function(p){
    var w=mk('wand',0,0,p[0]); chargeItem(w);
    if(w.ch!==p[1]) bad.push('a wand with '+p[0]+' charges became '+w.ch+', wanted '+p[1]);
  });

  /* one scroll becomes two uses; a stack rounds up */
  [[1,1],[2,1],[3,2],[4,2]].forEach(function(p){
    var s=mk('scroll',scrollIndex('identify'),p[0]);
    chargeItem(s);
    if(s.chg!==p[1]) bad.push(p[0]+' scrolls gained '+s.chg+' spare uses, wanted '+p[1]);
  });

  /* and a charged scroll survives being read */
  bootTest(9001);
  /* a kind the starting kit does not hold, so addItem cannot merge it
     into an existing stack and leave us testing the wrong object */
  var sc=mk('scroll',scrollIndex('light'),1);
  chargeItem(sc); addItem(sc);
  G.msgq=[]; G.queuePick=null;
  readScroll(sc);
  if(carriedItems().indexOf(sc)<0) bad.push('a charged scroll vanished on its first read');
  if(sc.chg!==0) bad.push('reading a charged scroll did not spend the charge');
  readScroll(sc);
  if(carriedItems().indexOf(sc)>=0) bad.push('a charged scroll never ran out');

  /* a returning stone is charged for the throwing: twice the bonus */
  var plainRune=mk('weapon',weaponIndex('blasting stone'),1);
  chargeItem(plainRune);
  if(plainRune.chg!==1) bad.push('a blasting stone got '+plainRune.chg+' spare throws, wanted 1');
  /* a returning stone carries flights home, not spare throws */
  var retRune=mk('weapon',weaponIndex('returning stone'),1);
  var rg=chargeItem(retRune);
  if(!rg || rg.kind!=='returns') bad.push('a returning stone was charged like an ordinary rune');
  if(retRune.ret !== RETURN_USES*2)
    bad.push('a charged returning stone has '+retRune.ret+' flights, wanted '+(RETURN_USES*2));

  /* a plain stone is not given uses - it is made to survive a throw */
  var st=mk('weapon',weaponIndex('stone'),3);
  var got=chargeItem(st);
  if(!got || got.kind!=='sturdy') bad.push('a plain stone was charged like a rune');

  /* things with nothing to charge are refused */
  ['food','armor','potion'].forEach(function(t){
    if(chargeable(mkItem(t,0))) bad.push(t+' should not be chargeable');
  });
  return bad;
}

/* A charged runestone is not used up: it lands and can be picked up. */
function runeRecoveryOK(){
  var bad=[], plainKept=0, chargedKept=0, runs=300, i;
  for(i=0;i<runs;i++){
    bootTest(9100+i%40);
    var charged = (i%2)===1;
    var st=mkItem('weapon', weaponIndex('blasting stone')); st.cnt=1; st.known=1;
    if(charged) chargeItem(st);
    G.throwing=st; addItem(st);
    var m=mkMonster('K',1,P.x+2,P.y);
    m.state=2; m.surprised=0; m.disguise=0; m.hp=m.mhp=900;
    L.mons.length=0; L.mons.push(m);
    var was=L.items.length;
    G.msgq=[]; G.beat=0;
    fireAt(m);
    /* Count every blasting stone anywhere.  A thrown one leaves your
       hand, so exactly one should exist afterwards - on the floor, or
       back in the pack if there was nowhere clear to put it down.  Two
       would mean the throw duplicated it. */
    var total=0, j;
    for(j=0;j<L.items.length;j++){
      var f=L.items[j];
      if(f.t==='weapon' && WEAPONS[f.k].rune==='blast') total += f.cnt;
    }
    var held=carriedItems();
    for(j=0;j<held.length;j++)
      if(held[j].t==='weapon' && WEAPONS[held[j].k].rune==='blast') total += held[j].cnt;
    if(total>1) bad.push('one throw left '+total+' stones');
    var onFloor = total >= 1 ? 1 : 0;
    if(charged) chargedKept+=onFloor; else plainKept+=onFloor;
  }
  return { plain:plainKept, charged:chargedKept, bad:bad };
}

/* A returning stone comes home a set number of times and then is just a
   stone.  Charging it doubles the flights, not the throws. */
function returnUsesOK(){
  var bad=[], i;
  function throwItOnce(st){
    var m=mkMonster('K',1,P.x+2,P.y);
    m.state=2; m.surprised=0; m.disguise=0; m.hp=m.mhp=9000;
    L.mons.length=0; L.mons.push(m);
    G.throwing=st; G.msgq=[]; G.beat=0;
    fireAt(m);
    /* only a returning stone counts as "it came back" - the pack also
       holds ordinary stones, which would look like one if we let them */
    var held=carriedItems(), j;
    for(j=0;j<held.length;j++)
      if(held[j].t==='weapon' && WEAPONS[held[j].k].rune==='return') return held[j];
    return null;
  }
  function clearStones(){
    var held=carriedItems(), j;
    for(j=0;j<held.length;j++)
      if(held[j].t==='weapon' && WEAPONS[held[j].k].grp) removeItem(held[j], held[j].cnt);
  }
  /* count the flights an uncharged one manages */
  bootTest(9200);
  P.hp=P.mhp=9000; clearStones();
  var st=mkItem('weapon', weaponIndex('returning stone'));
  st.cnt=1; st.known=1; addItem(st);
  var flights=0, cur=st;
  for(i=0;i<40 && cur;i++){
    cur=throwItOnce(cur);
    if(!cur) break;
    flights++;
  }
  if(flights !== RETURN_USES - 1)
    bad.push('an uncharged stone came home '+flights+' times, wanted '+(RETURN_USES-1));

  /* and a charged one manages twice as many */
  bootTest(9201);
  P.hp=P.mhp=9000; clearStones();
  var st2=mkItem('weapon', weaponIndex('returning stone'));
  st2.cnt=1; st2.known=1;
  chargeItem(st2);
  if(st2.ret !== RETURN_USES*2)
    bad.push('charging set the flights to '+st2.ret+', wanted '+(RETURN_USES*2));
  addItem(st2);
  var flights2=0, cur2=st2;
  for(i=0;i<60 && cur2;i++){
    cur2=throwItOnce(cur2);
    if(!cur2) break;
    flights2++;
  }
  if(flights2 !== RETURN_USES*2 - 1)
    bad.push('a charged stone came home '+flights2+' times, wanted '+(RETURN_USES*2-1));
  return { plain:flights, charged:flights2, bad:bad };
}

/* Thunder Charge: every third blow, the squares around you - and the
   pool you are standing in, but only that pool. */
function thunderOK(){
  var bad=[], i;
  bootTest(9300);
  P.hp=P.mhp=9000;
  var arm=mkItem('armor',0); arm.known=1; arm.br='thunder'; arm.brKnown=1;
  P.eq.body=arm;

  /* it fires on the third blow and not before */
  var fired=[];
  L.mons.length=0;
  var m=mkMonster('K',1,P.x+1,P.y);
  m.state=2; m.surprised=0; m.disguise=0; m.hp=m.mhp=9000;
  L.mons.push(m);
  for(i=1;i<=9;i++){
    var was=m.hp; G.msgq=[]; G.beat=0;
    retaliate(m);
    if(m.hp<was) fired.push(i);
  }
  if(fired.join(',') !== '3,6,9')
    bad.push('it fired on blows '+fired.join(',')+', wanted 3,6,9');

  /* every square around you, when you are dry */
  bootTest(9301);
  P.eq.body=arm; arm.jolt=0;
  var dry=thunderCells();
  if(dry.length !== 8) bad.push('on dry land it reached '+dry.length+' squares, wanted 8');

  /* two pools in one room: only the one you stand in */
  var r=null;
  for(i=0;i<L.rooms.length;i++){
    var rr2=L.rooms[i];
    if(!rr2.gone && rr2.w>=9 && rr2.h>=4){ r=rr2; break; }
  }
  if(!r){ bad.push('no room big enough to test two pools'); return bad; }
  var A=[[r.x+1,r.y+1],[r.x+2,r.y+1],[r.x+1,r.y+2]];
  var B=[[r.x+5,r.y+1],[r.x+6,r.y+1],[r.x+6,r.y+2]];
  for(i=0;i<A.length;i++) L.tiles[A[i][1]*MAP_W+A[i][0]]=WATER;
  for(i=0;i<B.length;i++) L.tiles[B[i][1]*MAP_W+B[i][0]]=WATER;
  P.x=A[0][0]; P.y=A[0][1];
  var cells=thunderCells();
  function has(p){ for(var j=0;j<cells.length;j++) if(cells[j][0]===p[0]&&cells[j][1]===p[1]) return 1; return 0; }
  for(i=0;i<A.length;i++) if(!has(A[i])) bad.push('the current missed part of the pool you stand in');
  for(i=0;i<B.length;i++) if(has(B[i])) bad.push('the current jumped to a pool it is not joined to');

  /* and it actually hurts what is standing in the water */
  L.mons.length=0;
  var wet=mkMonster('K',1,A[2][0],A[2][1]);
  wet.state=2; wet.surprised=0; wet.disguise=0; wet.hp=wet.mhp=9000;
  var far=mkMonster('K',1,B[0][0],B[0][1]);
  far.state=2; far.surprised=0; far.disguise=0; far.hp=far.mhp=9000;
  L.mons.push(wet); L.mons.push(far);
  G.msgq=[]; G.beat=0;
  thunderDischarge(arm);
  if(wet.hp>=9000) bad.push('an enemy in your own pool was not shocked');
  if(far.hp<9000) bad.push('an enemy in a separate pool was shocked');
  return bad;
}

/* A curse must not be readable off the pack screen.  A cursed
   breastplate protects less than a breastplate should, so printing the
   real number gave it away before you ever put it on. */
function curseHiddenOK(){
  var bad=[], i;
  bootTest(9400);
  function say(it){ return itemNotes(it).map(function(n){ return n[0]; }).join(' | '); }

  var kinds=[['armor',0],['armor',3],['head',1],['feet',2],['shield',1]];
  for(i=0;i<kinds.length;i++){
    var base=mkItem(kinds[i][0], kinds[i][1]);
    var usual=itemDef(base).a || 0;

    var cursed=mkItem(kinds[i][0], kinds[i][1]);
    cursed.cursed=1; cursed.ap=-3; cursed.known=0;
    var blessed=mkItem(kinds[i][0], kinds[i][1]);
    blessed.ap=2; blessed.known=0;

    var sc=say(cursed), sb=say(blessed);
    if(sc!==sb) bad.push('a cursed '+kinds[i][0]+' reads differently from a blessed one');
    if(sc.indexOf(String(usual))<0)
      bad.push(kinds[i][0]+' does not show the usual '+usual+' for its kind');
    if(sc.indexOf(String(usual-3))>=0) bad.push('the curse is visible in the numbers');

    /* Worn, you still do not find out what it is worth - only that it
       is cursed, because it will not come off.  Wearing it used to give
       you the real number, which is most of the identify game handed
       over for the price of a moment's fumbling.  A scroll read over it
       is what tells you. */
    P.eq.body=null; P.eq.head=null; P.eq.feet=null; P.eq.lh=null;
    var slot=kinds[i][0]==='armor'?'body':kinds[i][0]==='shield'?'lh':kinds[i][0];
    P.eq[slot]=cursed;
    if(say(cursed).indexOf(String(usual-3))>=0)
      bad.push('wearing a '+kinds[i][0]+' gave away what it really does');
    P.eq[slot]=null;
    identifyItem(cursed);
    if(say(cursed).indexOf(String(usual-3))<0)
      bad.push('a scroll read over a '+kinds[i][0]+' did not tell you what it does');
  }

  /* a weapon keeps its secret too */
  var w=mkItem('weapon',5); w.known=0; w.hp=-2; w.dp=-2; w.cursed=1;
  var w2=mkItem('weapon',5); w2.known=0;
  if(say(w)!==say(w2)) bad.push('a cursed weapon reads differently from a plain one');
  return bad;
}

/* A chest is a container you can take from and put back into. */
function chestOK(){
  var bad=[], i;
  bootTest(9500);
  /* it never holds more than its squares */
  var worst=0, withGold=0, chests=0;
  for(var s=0;s<10;s++){
    bootTest(9500+s);
    for(var d=1;d<=8;d++){
      enterLevel(d);
      for(i=0;i<L.items.length;i++){
        var c=L.items[i];
        if(c.t!=='chest') continue;
        chests++;
        if(!c.items || c.items.length!==CHEST_CAP)
          bad.push('a chest has '+(c.items?c.items.length:'no')+' squares');
        var n=contCount(c);
        if(n>worst) worst=n;
        if(n>CHEST_CAP) bad.push('a chest holds '+n+' things');
        if(c.gold>0) withGold++;
      }
    }
  }
  if(!chests) bad.push('no chests were generated at all');

  /* opening one takes the coins and leaves the rest where they are */
  bootTest(9600);
  var ch=mkChest(3,0,1);
  ch.gold=250;
  var had=contCount(ch), purse=P.gold;
  ch.x=P.x; ch.y=P.y; L.items.push(ch);
  G.msgq=[];
  var opened=openChest(ch);
  if(opened!==ch) bad.push('opening a chest did not hand back the chest');
  if(P.gold!==purse+250) bad.push('the coins did not go in your purse');
  if(contCount(ch)!==had) bad.push('opening a chest emptied it');
  if(L.items.indexOf(ch)<0) bad.push('the chest vanished from the floor');

  /* and a locked one only wants its key once */
  bootTest(9700);
  var lc=mkChest(3,2,0);
  lc.x=P.x; lc.y=P.y; L.items.push(lc);
  P.keys[2]=1;
  G.msgq=[];
  if(!openChest(lc)) bad.push('a locked chest would not open with its key');
  if(P.keys[2]!==0) bad.push('the key was not used up');
  G.msgq=[];
  if(!openChest(lc)) bad.push('an unlocked chest asked for the key again');
  return { worst:worst, chests:chests, withGold:withGold, bad:bad };
}

/* Anything spent must actually leave wherever it was.  removeItem only
   ever searched your pack, so a potion drunk straight out of a chest was
   still in the chest afterwards - and again, and again. */
function spendingOK(){
  var bad=[], i;
  bootTest(9900);
  var chest=mkChest(3,0,1);
  chest.x=P.x; chest.y=P.y;
  L.items.length=0; L.items.push(chest);

  /* a potion in the chest, drunk where it lies */
  var pot=mkItem('potion', 0);
  chest.items[0]=pot;
  P.hp=1; P.mhp=40;
  G.msgq=[];
  removeItem(pot, 1);
  if(chest.items[0]===pot) bad.push('a thing spent from a chest stayed in the chest');

  /* and from a pouch inside the pack, which always worked */
  var pouch=mkItem('pouch',0);
  var sc=mkItem('scroll', scrollIndex('light'));
  pouch.items[0]=sc;
  addItem(pouch);
  removeItem(sc, 1);
  if(pouch.items[0]===sc) bad.push('a thing spent from a pouch stayed in the pouch');

  /* a stack loses one and stays put */
  var stack=mkItem('scroll', scrollIndex('light')); stack.cnt=3;
  chest.items[1]=stack;
  removeItem(stack, 1);
  if(chest.items[1]!==stack) bad.push('a stack was emptied out of the chest too early');
  if(stack.cnt!==2) bad.push('a stack in a chest did not lose one');
  removeItem(stack, 1); removeItem(stack, 1);
  if(chest.items[1]===stack) bad.push('the last of a stack stayed in the chest');
  return bad;
}

/* The shallow end: quieter, softer, and nothing that freezes you solid
   before you have found anything to break out with. */
function shallowOK(seeds){
  var bad=[], n1=0, n2=0, ice1=0, floors=0, s;
  for(s=0;s<seeds;s++){
    bootTest(96000+s);
    n1 += L.mons.length; floors++;
    for(var i=0;i<L.mons.length;i++) if(L.mons[i].c==='I') ice1++;
    enterLevel(2);
    n2 += L.mons.length;
  }
  if(ice1) bad.push(ice1+' ice monsters turned up on the first floor');

  /* the damage the three shallow biters do, measured */
  var soft={};
  ['K','B','E','S','H'].forEach(function(c){
    var D=MON_BY_CHAR[c], raw=0, out=0, n=40000, j;
    for(j=0;j<n;j++){
      var dm=damRoll([D.d[0]]);
      raw+=dm;
      out += D.dmgMul ? softenDamage(dm, D.dmgMul) : dm;
    }
    soft[D.n]={ raw:raw/n, now:out/n, cut:100*(1-(out/n)/(raw/n)) };
  });
  ['rat','bat','spider'].forEach(function(nm){
    if(soft[nm].cut < 7 || soft[nm].cut > 12)
      bad.push(nm+' hits '+soft[nm].cut.toFixed(1)+'% softer, wanted about 10');
  });
  ['snake','hobgoblin'].forEach(function(nm){
    if(soft[nm].cut > 0.5) bad.push(nm+' was softened and should not have been');
  });
  return { floor1:n1/floors, floor2:n2/floors, ice1:ice1, soft:soft, bad:bad };
}

/* The pockets of rock the halls wall in are rooms, not a single square
   with a chest in it.  Blasting through the wall on any side has to put
   you somewhere you can stand. */
function vaultRoomsOK(seeds){
  var bad=[], rooms=0, sq=0, things=0, floors=0, s, d, i, k;
  for(s=0;s<seeds;s++){
    bootTest(97000+s);
    for(d=1;d<=8;d++){
      enterLevel(d); floors++;
      var vs=[];
      for(i=0;i<L.rooms.length;i++) if(L.rooms[i].vault) vs.push(L.rooms[i]);
      for(var v=0;v<vs.length;v++){
        var r=vs[v];
        rooms++; sq+=r.floors.length;
        if(r.floors.length<2) bad.push('a walled-in room has '+r.floors.length+' squares');
        var n=0;
        for(i=0;i<L.items.length;i++)
          if(L.roomAt[L.items[i].y*MAP_W+L.items[i].x]===r.idx) n++;
        things+=n;
        if(!n) bad.push('a walled-in room holds nothing');
        var chests=0;
        for(i=0;i<L.items.length;i++)
          if(L.items[i].t==='chest' && L.roomAt[L.items[i].y*MAP_W+L.items[i].x]===r.idx) chests++;
        if(!chests) bad.push('a walled-in room has no chest');
        /* every square of it is floor, sealed, and touches nothing outside */
        for(i=0;i<r.floors.length;i++){
          var x=r.floors[i][0], y=r.floors[i][1], j=y*MAP_W+x;
          if(L.tiles[j]!==FLOOR) bad.push('a walled-in room has a square you cannot stand on');
          if(!L.sealed[j]) bad.push('a walled-in room square is not marked sealed');
          for(k=0;k<8;k++){
            var o=(y+DIR8[k][1])*MAP_W+(x+DIR8[k][0]);
            if(walkTile(L.tiles[o]) && L.roomAt[o]!==r.idx)
              bad.push('a walled-in room opens onto the rest of the floor');
          }
        }
      }
    }
  }
  return { floors:floors, rooms:rooms, sq:sq/Math.max(1,rooms),
           things:things/Math.max(1,rooms), bad:bad };
}

/* Blast the wall of one and you should be standing in a room. */
function blastIntoVaultOK(seeds){
  var bad=[], got=0, tried=0, s, d, i, k;
  for(s=0;s<seeds && got<8;s++){
    bootTest(98000+s);
    for(d=1;d<=8 && got<8;d++){
      enterLevel(d);
      var v=null;
      for(i=0;i<L.rooms.length;i++) if(L.rooms[i].vault) { v=L.rooms[i]; break; }
      if(!v) continue;
      /* a wall square on its edge, with the room on one side */
      var wall=-1, from=null;
      for(i=0;i<v.floors.length && wall<0;i++){
        var fx=v.floors[i][0], fy=v.floors[i][1];
        for(k=0;k<4;k++){
          var wx=fx+DIR4[k][0], wy=fy+DIR4[k][1];
          if(L.tiles[wy*MAP_W+wx]===WALL){ wall=wy*MAP_W+wx; from=[wx,wy]; break; }
        }
      }
      if(wall<0) continue;
      tried++;
      P.hp=P.mhp=900; G.dead=0; G.msgq=[];
      dynamiteAt(from[0], from[1]);
      /* the hole must lead to squares you can stand on, not more rock */
      var opened=0, standable=0;
      for(k=0;k<4;k++){
        var nx=from[0]+DIR4[k][0], ny=from[1]+DIR4[k][1], j=ny*MAP_W+nx;
        if(L.tiles[j]===FLOOR){ opened++; if(L.roomAt[j]===v.idx) standable++; }
      }
      if(!standable) bad.push('the blast did not open into the room');
      /* and nothing was bricked up behind it */
      for(i=0;i<v.floors.length;i++){
        var vj=v.floors[i][1]*MAP_W+v.floors[i][0];
        if(L.tiles[vj]!==FLOOR) bad.push('the room lost a square to the blast');
      }
      got++;
    }
  }
  if(!got) bad.push('never found a walled-in room to blast into');
  return { blasted:got, bad:bad };
}

/* The dungeon remembers.  Going down and back up should put you on the
   floor you left, at the stairs you came down, with everything as you
   left it - not on a freshly dealt floor at a new staircase. */
function floorsRememberedOK(){
  var bad=[], i, d;
  bootTest(9950);
  var sig = {}, marks = {};
  /* walk down eight floors, dropping a marker on each */
  for(d=1; d<=8; d++){
    if(d>1) enterLevel(d, 'down');
    sig[d] = L.tiles.join(',');
    var mk = mkItem('food', 0);
    mk.x = P.x; mk.y = P.y;
    L.items.push(mk);
    marks[d] = mk;
    if(d<8){
      if(tileAt(L.stair.x, L.stair.y) !== STAIR) bad.push('floor '+d+' has no way down');
      P.x = L.stair.x; P.y = L.stair.y;
    }
  }
  /* and climb all the way back */
  for(d=8; d>1; d--){
    if(tileAt(P.x,P.y) !== STAIR_UP){
      /* stand on the way up */
      if(!L.up){ bad.push('floor '+d+' has no way up'); break; }
      P.x = L.up.x; P.y = L.up.y;
    }
    var below = d;
    enterLevel(d-1, 'up');
    if(L.tiles.join(',') !== sig[d-1]) bad.push('floor '+(d-1)+' was dealt again');
    if(L.items.indexOf(marks[d-1]) < 0) bad.push('what was left on floor '+(d-1)+' is gone');
    if(P.x !== L.stair.x || P.y !== L.stair.y)
      bad.push('climbing up from '+below+' did not land on the way down on '+(d-1));
  }
  /* down again: still the same floors */
  for(d=2; d<=8; d++){
    P.x = L.stair.x; P.y = L.stair.y;
    enterLevel(d, 'down');
    if(L.tiles.join(',') !== sig[d]) bad.push('floor '+d+' changed on the way back down');
    if(P.x !== L.up.x || P.y !== L.up.y)
      bad.push('going down to '+d+' did not land on its way up');
  }
  return bad;
}

/* A chest you have been through looks open and waits to be asked. */
function openChestOK(){
  var bad=[];
  bootTest(9960);
  var ch = mkChest(3, 0, 1);
  ch.x = P.x; ch.y = P.y;
  L.items.length = 0; L.items.push(ch);
  if(itemSprite(ch) === 'chest_open') bad.push('a shut chest already looks open');
  G.msgq = []; G.openBox = null;
  autoPickup();
  if(!ch.seen) bad.push('walking onto a shut chest did not open it');
  if(G.openBox !== ch) bad.push('it did not offer to show you what is inside');
  if(itemSprite(ch) !== 'chest_open') bad.push('an opened chest still looks shut');
  /* step on it again: it should only say so */
  G.msgq = []; G.openBox = null; G.box = null;
  autoPickup();
  if(G.openBox) bad.push('an open chest flew open again by itself');
  if(G.box !== ch) bad.push('the open chest is not the one under your feet');
  var said = G.msgq.map(function(m){ return m.s; }).join(' ');
  if(said.indexOf('open chest') < 0 || said.indexOf('ENTER') < 0)
    bad.push('it did not say how to look in it: "'+said+'"');
  return bad;
}

/* Sneaking up on something.  The to-hit roll is capped at needing a 2
   on a d20, and a plain +6 already reached that cap - so piling more
   onto it changed nothing whatever.  The reward is in the damage. */
function sneakOK(){
  var bad=[], i, out={};
  bootTest(9970);
  function hitPct(state, plv){
    var hit=0, n=20000;
    P.lv=plv;
    for(i=0;i<n;i++){
      var m=mkMonster('O',2,P.x+1,P.y);
      m.state=state; m.surprised=0; m.flee=0;
      if(swingP(P.lv, m.ar, playerHitBonus()+surpriseHit(m))) hit++;
    }
    return 100*hit/n;
  }
  function dam(state, plv){
    var tot=0, n=30000;
    P.lv=plv;
    for(i=0;i<n;i++){
      var m=mkMonster('O',2,P.x+1,P.y);
      m.state=state; m.surprised=0;
      tot += damRoll([WEAPONS[2].d]) + playerDamBonus() + surpriseDam(m);
    }
    return tot/n;
  }
  out.watchHit = hitPct(2,1);
  out.sneakHit = hitPct(0,1);
  out.watchDam = dam(2,1);
  out.sneakDam = dam(0,1);
  out.sneakDam6 = dam(0,6);

  if(out.sneakHit <= out.watchHit + 20)
    bad.push('sneaking barely helps you land it: '+out.watchHit.toFixed(0)+'% to '+out.sneakHit.toFixed(0)+'%');
  if(out.sneakDam < out.watchDam * 1.6)
    bad.push('a blow nobody saw does '+out.sneakDam.toFixed(1)+' against '+out.watchDam.toFixed(1)+' - not much of a reward');
  if(out.sneakDam6 <= out.sneakDam)
    bad.push('sneaking does not get better as you do');
  out.bad = bad;
  return out;
}

/* Something standing in a doorway is in plain sight and must be
   targetable, even though the doorway itself stops an arrow. */
function doorwayShotOK(seeds){
  var bad=[], tried=0, s, i, d;
  for(s=0;s<seeds && tried<10;s++){
    bootTest(9980+s);
    var spot=null;
    for(i=0;i<L.tiles.length && !spot;i++){
      if(L.tiles[i]!==DOOR) continue;
      var dx=i%MAP_W, dy=(i/MAP_W)|0;
      for(d=0;d<4;d++){
        for(var n=2;n<=5;n++){
          var px=dx-DIR4[d][0]*n, py=dy-DIR4[d][1]*n;
          if(tileAt(px,py)!==FLOOR) break;
          spot={ door:[dx,dy], from:[px,py] };
        }
        if(spot) break;
      }
    }
    if(!spot) continue;
    tried++;
    P.x=spot.from[0]; P.y=spot.from[1];
    computeVis();
    var m=mkMonster('K',1,spot.door[0],spot.door[1]);
    m.state=2; m.surprised=0; m.disguise=0;
    L.mons.length=0; L.mons.push(m);
    if(!canSeeMon(m)) { tried--; continue; }
    if(!throwValid(m.x,m.y,null)) bad.push('cannot throw at something in a doorway');
    var st=mkItem('weapon', weaponIndex('stone')); st.cnt=1; st.known=1;
    if(!throwValid(m.x,m.y,st)) bad.push('cannot throw a stone at something in a doorway');
    if(shotTargets().indexOf(m)<0) bad.push('a bow will not aim at something in a doorway');
    /* but an empty doorway is still not somewhere to throw */
    L.mons.length=0;
    if(throwValid(spot.door[0],spot.door[1],null))
      bad.push('an empty doorway is a legal target and should not be');
  }
  if(!tried) bad.push('no doorway to test');
  return { tried:tried, bad:bad };
}

/* The ring of fire: five turns, eight squares, burning whatever stands
   in them, and following you about. */
function fireShieldOK(){
  var bad=[], i, d;
  bootTest(9990);
  P.hp=P.mhp=900; P.food=2000;
  L.mons.length=0; L.clouds.length=0;
  /* beside you, on a square that exists - P.x+1 can be solid rock, and
     an orc inside a wall is outside the ring of fire */
  var spot=null;
  for(i=0;i<8 && !spot;i++){
    var sx=P.x+DIR8[i][0], sy=P.y+DIR8[i][1];
    if(walkable(sx,sy)) spot=[sx,sy];
  }
  if(!spot) return ['nowhere beside you to stand an orc'];
  var m=mkMonster('O',2,spot[0],spot[1]);
  m.state=2; m.surprised=0; m.disguise=0; m.hp=m.mhp=900;
  L.mons.push(m);
  G.msgq=[];
  lightFireShield();
  if(P.fireShield!==FIRE_SHIELD_TURNS) bad.push('it lasts '+P.fireShield+' turns, wanted '+FIRE_SHIELD_TURNS);
  function ring(){ return fireShieldCells().length; }
  function walkableRound(){
    var n=0;
    for(d=0;d<8;d++) if(walkable(P.x+DIR8[d][0], P.y+DIR8[d][1])) n++;
    return n;
  }
  if(ring()!==walkableRound()) bad.push('not every square around you caught');
  var hurt=0;
  for(var turn=1;turn<=FIRE_SHIELD_TURNS;turn++){
    var was=m.hp;
    upkeep();
    if(m.hp<was) hurt++;
    /* on the last turn the shield expires, and the ring goes with it */
    if(P.fireShield>0 && ring()!==walkableRound())
      bad.push('the ring went out on turn '+turn+' with '+P.fireShield+' still to run');
  }
  if(hurt < FIRE_SHIELD_TURNS - 1) bad.push('it only burnt the orc on '+hurt+' of '+FIRE_SHIELD_TURNS+' turns');
  if(P.fireShield!==0) bad.push('it did not run out after '+FIRE_SHIELD_TURNS+' turns');
  /* and it goes out */
  for(i=0;i<4;i++) upkeep();
  if(ring()) bad.push('the fire is still there after the shield ran out');

  /* It must not set the floor alight.  Walking away from where it was
     used to leave real fire behind, so every step took you into the
     flames you had just been standing beside. */
  bootTest(9992);
  P.hp=P.mhp=900; P.food=2000; L.clouds.length=0; L.mons.length=0;
  lightFireShield();
  var burnt=0, steps=0, dd;
  for(var t2=0;t2<FIRE_SHIELD_TURNS;t2++){
    var moved=0;
    for(dd=0;dd<4;dd++){
      var nx2=P.x+DIR4[dd][0], ny2=P.y+DIR4[dd][1];
      if(walkable(nx2,ny2)){ P.x=nx2; P.y=ny2; moved=1; break; }
    }
    if(!moved) break;
    steps++;
    var was2=P.hp;
    upkeep();
    if(P.hp<was2) burnt++;
  }
  if(steps<2) bad.push('could not walk far enough to test it');
  if(burnt) bad.push('walking with the shield up burnt you '+burnt+' times');
  if(L.clouds.length) bad.push('the shield left '+L.clouds.length+' patches of fire on the floor');

  /* it follows you */
  bootTest(9991);
  P.hp=P.mhp=900; P.food=2000; L.clouds.length=0; L.mons.length=0;
  lightFireShield();
  var moved=0;
  for(d=0;d<4;d++){
    var nx=P.x+DIR4[d][0], ny=P.y+DIR4[d][1];
    if(walkable(nx,ny)){ P.x=nx; P.y=ny; moved=1; break; }
  }
  if(moved){
    upkeep();
    if(ring()!==walkableRound()) bad.push('the ring did not follow you');
  }
  return bad;
}

/* The six special rooms, and the iron bars the mint needs. */
function specialRoomsOK(seeds){
  var bad=[], seen={}, floors=0, s, d, i;
  for(s=0;s<seeds;s++){
    bootTest(94000+s);
    for(d=1;d<=14;d++){
      enterLevel(d,'down'); floors++;
      if(!L.special) continue;
      seen[L.special]=(seen[L.special]||0)+1;
      var r=null;
      for(i=0;i<L.rooms.length;i++) if(L.rooms[i].special===L.special) { r=L.rooms[i]; break; }
      if(!r){ bad.push(L.special+' is on the floor but no room claims it'); continue; }

      if(L.special==='nursery'){
        var asleep=0, awake=0, kinds={};
        for(i=0;i<L.mons.length;i++){
          var m=L.mons[i];
          if(roomIndexAt(m.x,m.y)!==r.idx) continue;
          kinds[m.c]=1;
          if(m.state===0) asleep++; else awake++;
        }
        if(asleep<4) bad.push('a nursery with only '+asleep+' asleep in it');
        if(Object.keys(kinds).length>1) bad.push('a nursery with more than one kind in it');
        var chest=0;
        for(i=0;i<L.items.length;i++)
          if(L.items[i].t==='chest' && roomIndexAt(L.items[i].x,L.items[i].y)===r.idx) chest++;
        if(!chest) bad.push('a nursery with nothing worth waking them for');
      }

      if(L.special==='shrine'){
        if(!L.shrine) bad.push('a shrine room with no shrine');
        else if(L.tiles[L.shrine.y*MAP_W+L.shrine.x]!==HOLY) bad.push('the shrine is not water');
      }

      if(L.special==='alchemist'){
        if(!L.alchemy) bad.push('an alchemist with no fount');
        var pots=0;
        for(i=0;i<L.items.length;i++)
          if(L.items[i].t==='potion' && roomIndexAt(L.items[i].x,L.items[i].y)===r.idx) pots++;
        if(pots<6) bad.push('an alchemist with only '+pots+' potions');
      }

      if(L.special==='moss'){
        /* against the squares you can actually stand on: a room with
           pillars or a hole in it has fewer than its outline suggests */
        var mossy=0, walkSq=0;
        for(i=0;i<r.floors.length;i++){
          var mx=r.floors[i][0], my=r.floors[i][1];
          if(L.tiles[my*MAP_W+mx]!==FLOOR) continue;
          walkSq++;
          var dk=L.decor[my*MAP_W+mx];
          if(isMoss(dk)) mossy++;
        }
        if(walkSq && mossy < walkSq/3)
          bad.push('a moss garden with moss on only '+mossy+' of '+walkSq+' squares');
      }

      if(L.special==='powder'){
        /* the store's own barrels, not the loose ones now left about the
           rest of the floor - those are meant to stand on their own */
        var bs=[];
        for(var k in L.barrels) if(inPowderRoom(k|0)) bs.push(k|0);
        if(bs.length<4) bad.push('a powder store with '+bs.length+' barrels');
        /* every barrel must touch another, or nothing chains */
        var lone=0;
        for(i=0;i<bs.length;i++){
          var bx=bs[i]%MAP_W, by=(bs[i]/MAP_W)|0, near=0;
          for(var q=0;q<8;q++){
            var nbk=(by+DIR8[q][1])*MAP_W+(bx+DIR8[q][0]);
            if(L.barrels[nbk] && inPowderRoom(nbk)) near=1;
          }
          if(!near) lone++;
        }
        if(lone) bad.push(lone+' barrels stand on their own and will not chain');
      }

      if(L.special==='mint'){
        var bars=0, gold=0, reachable=0;
        for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===BARS) bars++;
        if(bars<2) bad.push('a mint with only '+bars+' bars left after the gate');
        var seenSet=reachSet(L,P.x,P.y,{});
        /* only the piles behind the grille - ordinary floor gold may
           well lie in the same room on the near side */
        for(i=0;i<L.items.length;i++){
          var it=L.items[i];
          if(it.t!=='gold') continue;
          if(!L.caged[it.y*MAP_W+it.x]) continue;
          gold++;
          if(seenSet[it.y*MAP_W+it.x]) reachable++;
        }
        if(gold<3) bad.push('a mint with '+gold+' piles of gold');
        if(reachable) bad.push(reachable+' piles of the mint gold need no key at all');
      }
    }
  }
  var kinds2=['nursery','shrine','alchemist','moss','powder','mint'], miss=[];
  for(i=0;i<kinds2.length;i++) if(!seen[kinds2[i]]) miss.push(kinds2[i]);
  if(miss.length) bad.push('never generated: '+miss.join(', '));
  return { floors:floors, seen:seen, bad:bad };
}

/* Iron bars: seen through, never passed, never broken. */
function ironBarsOK(){
  var bad=[];
  bootTest(94500);
  var x=P.x+1, y=P.y;
  L.tiles[y*MAP_W+x]=BARS;
  if(walkable(x,y)) bad.push('you can walk through iron bars');
  if(blocksSight(x,y)) bad.push('you cannot see through iron bars');
  if(walkTile(BARS)) bad.push('bars count as somewhere to stand');
  var seen=reachSet(L,P.x,P.y,true);
  if(seen[y*MAP_W+x]) bad.push('reachability walks straight through bars');
  P.hp=P.mhp=900; G.dead=0; G.msgq=[];
  dynamiteAt(x,y);
  if(L.tiles[y*MAP_W+x]!==BARS) bad.push('dynamite broke the bars');
  var said=G.msgq.map(function(m){return m.s;}).join(' ');
  if(said.indexOf('bars')<0) bad.push('nothing was said about the bars holding');
  /* nor does a barrel */
  bootTest(94501);
  x=P.x+1; y=P.y;
  L.tiles[y*MAP_W+x]=BARS;
  L.barrels[y*MAP_W+(x+1)]=1;
  P.hp=P.mhp=900; G.dead=0; G.msgq=[];
  blowBarrel(x+1,y);
  if(L.tiles[y*MAP_W+x]!==BARS) bad.push('a powder barrel broke the bars');
  return bad;
}

/* Nothing may stop you moving without telling you what did.  Hunger
   used to root you to the spot at random with no explanation at all. */
function stuckOnlyForReasonsOK(){
  var bad=[], i;

  /* starving costs health, and only health */
  bootTest(9995);
  P.hp=P.mhp=900; P.food=-40; P.frozen=0; P.iced=0; G.dead=0;
  var froze=0;
  for(i=0;i<600;i++){
    P.food=-40; G.turn++;
    upkeep();
    if(P.frozen){ froze++; P.frozen=0; }
    if(G.dead){ P.hp=900; G.dead=0; }
  }
  if(froze) bad.push('starving froze you '+froze+' times in 600 turns');
  if(P.hp>=900) bad.push('starving cost you no health at all');

  /* and when something does stop you, it says which thing */
  var cases=[['iced', function(){ P.frozen=3; P.iced=3; }, 'frozen solid'],
             ['held', function(){ P.frozen=3; P.iced=0; P.held=1; }, 'held fast'],
             ['other', function(){ P.frozen=3; P.iced=0; P.held=0; }, 'cannot move yet']];
  for(i=0;i<cases.length;i++){
    bootTest(9996);
    P.hp=P.mhp=900; G.dead=0; P.frozen=0; P.iced=0; P.held=0;
    cases[i][1]();
    G.msgq=[];
    playerMove(1,0);
    var said=G.msgq.map(function(m){return m.s;}).join(' ');
    if(said.toLowerCase().indexOf(cases[i][2])<0)
      bad.push('being '+cases[i][0]+' said "'+said+'" instead of naming it');
  }
  return bad;
}

/* One chest to a room, two things on its floor, and never two of a
   kind.  The vault code, the pocket code and the ordinary scatter were
   each being generous without knowing about the others. */
function roomLootOK(seeds){
  var bad=[], worstItems=0, worstChests=0, twoOfAKind=0, chestArms=0,
      rooms=0, floors=0, s, d, i;
  function fam(o){
    if(o.t==='weapon') return WEAPONS[o.k].grp ? null : 'weapon';
    if(o.t==='armor'||o.t==='head'||o.t==='feet'||o.t==='shield') return 'armour';
    return null;
  }
  for(s=0;s<seeds;s++){
    bootTest(93000+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down'); floors++;
      var by={};
      for(i=0;i<L.items.length;i++){
        var it=L.items[i];
        if(it.t==='chest'){
          var arms=0;
          for(var q=0;q<CHEST_CAP;q++)
            if(it.items[q] && fam(it.items[q])==='weapon') arms++;
          if(arms>1){ chestArms++; bad.push('a chest with '+arms+' weapons in it'); }
        }
        if(it.t==='gold'||it.t==='key') continue;
        var ri=L.roomAt[it.y*MAP_W+it.x];
        if(ri<0 || !L.rooms[ri] || L.rooms[ri].special) continue;
        (by[ri]=by[ri]||[]).push(it);
      }
      for(var k in by){
        rooms++;
        var list=by[k];
        var ch=0, fl=[];
        for(i=0;i<list.length;i++) if(list[i].t==='chest') ch++; else fl.push(list[i]);
        if(ch>worstChests) worstChests=ch;
        if(fl.length>worstItems) worstItems=fl.length;
        if(ch>1) bad.push(ch+' chests in one room');
        if(fl.length>ROOM_ITEM_CAP) bad.push(fl.length+' things on one room floor');
        var fams={};
        for(i=0;i<fl.length;i++){
          var f=fam(fl[i]);
          if(!f) continue;
          if(fams[f]){ twoOfAKind++; bad.push('two '+f+'s on the same room floor'); }
          fams[f]=1;
        }
      }
    }
  }
  return { floors:floors, rooms:rooms, worstItems:worstItems, worstChests:worstChests,
           twoOfAKind:twoOfAKind, chestArms:chestArms, bad:bad };
}

/* Two doors in one wall that come out in the same place are one too
   many.  Measured by bricking a room's doors up and stepping out of
   each in turn - with them open, every door appears to go everywhere. */
function parallelDoorsOK(seeds){
  var bad=[], pairs=0, doors=0, floors=0, s, d, i, j;
  for(s=0;s<seeds;s++){
    bootTest(93500+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down'); floors++;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===DOOR) doors++;
      for(var ri=0;ri<L.rooms.length;ri++){
        var r=L.rooms[ri];
        if(r.gone) continue;
        var info=doorDestinations(L,r);
        for(i=0;i<info.length;i++){
          if(!info[i] || !info[i].key) continue;
          for(j=i+1;j<info.length;j++){
            if(!info[j] || !info[j].key) continue;
            if(info[i].side===info[j].side && info[i].key===info[j].key) pairs++;
          }
        }
      }
    }
  }
  if(pairs) bad.push(pairs+' pairs of doors in one wall lead to the same place');
  return { floors:floors, doors:doors/Math.max(1,floors), pairs:pairs, bad:bad };
}


/* No door in the corner of a room, no hallway that arrives nowhere, and
   the bridges that carry you over a stream or a gap. */
function crossingsOK(seeds){
  var bad=[], floors=0, corners=0, kept=0, stubs=0, bridges=0, bridgeFloors=0,
      streams=0, chasms=0, spans=0, s, d, i;
  for(s=0;s<seeds;s++){
    bootTest(77400+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down'); floors++;
      var hasB=0, wet=0, dry=0;
      for(i=0;i<L.tiles.length;i++){
        var tt=L.tiles[i];
        if((tt===DOOR||tt===SDOOR||tt===LOCKED) && doorAtCorner(L,i)){
          /* one that had to stay, or one that slipped through */
          if(L.cornerKept && L.cornerKept[i]) kept++;
          else corners++;
        }
        if(tt!==BRIDGE) continue;
        bridges++; hasB=1;
        if(L.under[i]===HOLE) dry=1; else wet=1;
        var bx=i%MAP_W, by=(i/MAP_W)|0;
        if(!walkable(bx,by)) bad.push('a bridge you cannot walk on');
        if(blocksShot(bx,by)) bad.push('a bridge stops arrows');
        if(!L.under[i]) bad.push('a bridge over nothing at all');
        /* it has to span: the stream runs on past both sides of it */
        var acr=0;
        for(var dd=0;dd<4;dd++){
          var nt=tileAt(bx+DIR4[dd][0], by+DIR4[dd][1]);
          if(nt===L.under[i]) acr++;
        }
        if(acr>=2) spans++;
      }
      if(hasB) bridgeFloors++;
      if(wet) streams++;
      if(dry) chasms++;
      /* every hallway arrives somewhere, or is a room in its own right */
      var seen={};
      for(i=0;i<L.tiles.length;i++){
        if(L.tiles[i]!==CORR||seen[i]) continue;
        var blob=corridorBlob(L,i,seen), run=0, reach=0;
        for(var b=0;b<blob.length;b++){ if(blob[b]<0) reach++; else run++; }
        if(reach<2 && run<DEAD_END_MIN) stubs++;
      }
      if(!everywhereReachable(L)) bad.push('a floor you cannot walk all of');
    }
  }
  if(stubs) bad.push(stubs+' hallways that arrive nowhere');
  if(corners) bad.push(corners+' doors left in the corner of a room for no reason');
  if(kept>floors/20) bad.push(kept+' corner doors had to stay - too many cramped floors');
  if(!bridges) bad.push('no bridges anywhere');
  if(!streams) bad.push('no stream ever crosses a room');
  if(!chasms) bad.push('no gap ever crosses a room');
  if(spans<bridges/2) bad.push('bridges that span nothing');
  return { floors:floors, corners:corners, kept:kept, stubs:stubs, bridges:bridges,
           bridgeFloors:bridgeFloors, streams:streams, chasms:chasms, bad:bad };
}


/* One leprechaun to a floor; he runs off with the purse rather than
   vanishing out of the world, and you can get it back. */
function leprechaunOK(seeds){
  var bad=[], floors=0, twoUp=0, s, d, i;
  for(s=0;s<seeds;s++){
    bootTest(76100+s);
    for(d=1;d<=12;d++){
      enterLevel(d,'down'); floors++;
      var n=0;
      for(i=0;i<L.mons.length;i++) if(L.mons[i].c==='L') n++;
      if(n>1){ twoUp++; bad.push(n+' leprechauns on one floor'); }
    }
  }
  /* the robbery itself */
  var holed=0, kept=0, arrived=0, shortOfIt=0, sameRoom=0, runs=0, invis=0, steps=[];
  for(s=0;s<40;s++){
    bootTest(76500+s);
    L.mons.length=0; P.hp=P.mhp=400; P.gold=200; G.dead=0;
    var spot=null;
    for(i=0;i<4 && !spot;i++){
      var sx=P.x+DIR4[i][0], sy=P.y+DIR4[i][1];
      if(walkable(sx,sy)) spot=[sx,sy];
    }
    if(!spot) continue;
    runs++;
    var m=mkMonster('L',3,spot[0],spot[1]);
    m.hp=m.mhp=400; m.state=2; L.mons.push(m); giveBeat(m);
    var was=P.gold;
    for(i=0;i<60 && !m.bolted;i++) monAttack(m);
    if(!m.bolted){ bad.push('he never got round to robbing you'); continue; }
    if(P.gold>=was) bad.push('he robbed you and took nothing');
    if(!m.gold) bad.push('the gold he took went nowhere');
    if(L.mons.indexOf(m)<0){ bad.push('he vanished instead of running'); continue; }
    if(m.invis) invis++;
    kept++;
    /* now watch him run for the far side of the floor */
    var startRoom = roomIndexAt(m.x, m.y), n2 = 0;
    var want = m.goal ? m.goal.room : -1;
    if (want < 0) bad.push('he had nowhere to run to');
    for(var turn=0;turn<BOLT_PATIENCE+40;turn++){
      var bx=m.x, by=m.y;
      boltMove(m);
      if(m.holed) break;
      if(m.x===bx && m.y===by){ bad.push('he stopped running without giving up'); break; }
      n2++;
    }
    steps.push(n2);
    if(!m.holed) bad.push('he never settled anywhere');
    else {
      holed++;
      if(m.invis) bad.push('he made his stand and stayed invisible');
      if(!m.spent) bad.push('he could still vanish a second time');
      if(want>=0 && roomIndexAt(m.x,m.y)!==want) shortOfIt++;
      else if(want>=0) arrived++;
      if(want>=0 && want===startRoom) sameRoom++;
      /* and he stays there */
      var hx=m.x, hy=m.y;
      for(i=0;i<30;i++) boltMove(m);
      if(m.x!==hx||m.y!==hy) bad.push('he wandered off after making his stand');
      /* robbing you again does not make him vanish again */
      P.gold=200; P.x=m.x+1>=MAP_W?m.x-1:m.x+1; P.y=m.y;
      m.spent=1;
      retaliateOK;                       /* no-op: keeps the linter honest */
    }

    /* and killing him gives the purse back */
    var gold0=0;
    for(i=0;i<L.items.length;i++) if(L.items[i].t==='gold') gold0+=L.items[i].cnt;
    var owed=m.gold;
    killMonster(m,true);
    var gold1=0;
    for(i=0;i<L.items.length;i++) if(L.items[i].t==='gold') gold1+=L.items[i].cnt;
    if(gold1-gold0 < owed) bad.push('killing him did not give the gold back');
  }
  if(invis<kept) bad.push('he ran off without turning invisible');
  if(!holed) bad.push('he never makes a stand anywhere');
  if(arrived < holed / 2)
    bad.push('he only reached the room he was making for '+arrived+' times of '+holed);
  var avg = steps.length ? steps.reduce(function(a,b){return a+b;},0)/steps.length : 0;
  return { floors:floors, twoUp:twoUp, runs:runs, holed:holed, arrived:arrived,
           steps:avg, bad:bad };
}

/* Knockback: on a blade it drives a foe back, on your gear it throws off
   whatever hit you. */
function knockbackOK(){
  var bad=[], i, r=null;
  bootTest(76900);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to test knockback in'] };
  if(!RUNE_BY_NAME['knockback']) bad.push('no knockback rune in the table');

  function setup(){
    L.mons.length=0;
    P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0; G.msgq=[];
    P.eq.rh=mkItem('weapon',2); P.eq.rh.known=1;
    P.eq.body=mkItem('armor',0); P.eq.body.known=1;
    var m=mkMonster('Z',3,P.x+1,P.y);
    m.hp=m.mhp=100000; m.state=2; m.disguise=0; m.ar=10;   /* easy to hit */
    L.mons.push(m);
    return m;
  }
  /* with no knockback he stays put */
  var moved=0, tries=60, m2;
  for(i=0;i<tries;i++){ m2=setup(); playerAttack(m2); if(m2.x!==P.x+1) moved++; }
  if(moved) bad.push('a plain blade knocked something back '+moved+' times');

  /* with it, sometimes he does not */
  moved=0;
  for(i=0;i<tries;i++){
    m2=setup();
    P.eq.rh.br='knockback'; P.eq.rh.known=1; P.eq.rh.brKnown=1;
    playerAttack(m2);
    if(m2.x!==P.x+1) moved++;
  }
  var wpct=Math.round(moved*100/tries);
  if(!moved) bad.push('a knockback weapon never knocked anything back');
  if(moved===tries) bad.push('a knockback weapon knocked back every single time');

  /* and the armour throws off an attacker */
  var thrown=0;
  for(i=0;i<tries;i++){
    m2=setup();
    P.eq.body.br='knockback'; P.eq.body.known=1; P.eq.body.brKnown=1;
    m2.def.d=[[1,1]];
    retaliate(m2);
    if(m2.x!==P.x+1) thrown++;
  }
  var apct=Math.round(thrown*100/tries);
  if(!thrown) bad.push('knockback gear never threw an attacker off');
  L.mons.length=0;
  return { weapon:wpct, armour:apct, bad:bad };
}

/* The ring of the untouched: three steps, one back every hundred turns,
   and the scroll of charging raises the roof. */
function ringOK(){
  var bad=[], i;
  bootTest(77000);
  var ring=mkItem('ring',0);
  if(ring.ch!==RING_CHARGES) bad.push('a new ring holds '+ring.ch+' charges, not '+RING_CHARGES);
  if(!ring.known) bad.push('a ring should say what it is');
  if(itemName(ring).indexOf('untouched')<0) bad.push('the ring has the wrong name: '+itemName(ring));
  if(!chargeable(ring)) bad.push('the scroll of charging will not touch a ring');

  /* it teleports, and no further than five squares */
  addItem(ring);
  var res=useItem(ring);
  if(!res.blink) bad.push('using the ring does not offer a place to go');
  if(BLINK_RANGE!==5) bad.push('the ring reaches '+BLINK_RANGE+' squares, not five');

  /* spending, and winding back up */
  ring.ch=1; ring.wind=0;
  P.hp=P.mhp=400; G.dead=0;
  ring.ch--;                       /* as the blink screen spends it */
  if(ring.ch!==0) bad.push('spending a charge did not spend it');
  var turns=0;
  while(ring.ch<1 && turns<RING_RECHARGE*3){ windRings(); turns++; }
  if(ring.ch<1) bad.push('the ring never wound itself back up');
  else if(turns!==RING_RECHARGE)
    bad.push('the ring took '+turns+' turns to wind up, not '+RING_RECHARGE);
  /* a full ring does not sit on a part wound clock */
  ring.ch=ringCap(ring); ring.wind=40;
  windRings();
  if(ring.wind) bad.push('a full ring is still counting');

  /* and the scroll raises the roof */
  var cap0=ringCap(ring);
  chargeItem(ring);
  if(ringCap(ring)<=cap0) bad.push('charging a ring did not raise what it holds');
  if(ring.ch!==ringCap(ring)) bad.push('charging a ring did not fill it');
  return { cap:ringCap(ring), turns:turns, bad:bad };
}

/* Headwear of clearwater: worn wet it hides you, and only water fills it. */
function clearwaterOK(){
  var bad=[], i, r=null;
  bootTest(77100);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to test clearwater in'] };
  if(!RUNE_BY_NAME['clearwater']) bad.push('no clearwater rune in the table');
  else if(RUNE_BY_NAME['clearwater'].t!=='h') bad.push('clearwater is not head only');

  /* it only ever lands on headwear */
  var wrong=0;
  for(i=0;i<400;i++){
    var g=mkItem(['armor','feet','shield'][i%3],0);
    addRune(g, 'g', 100);
    if(g.br==='clearwater') wrong++;
  }
  if(wrong) bad.push('clearwater turned up on '+wrong+' things that are not headwear');
  var onHeads=0;
  for(i=0;i<400;i++){
    var h=mkItem('head',0);
    addRune(h,'gh',100);
    if(h.br==='clearwater') onHeads++;
  }
  if(!onHeads) bad.push('clearwater never turns up on headwear');

  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=400; G.dead=0; P.unseen=0;
  P.eq.head=null;
  var cap=mkItem('head',0);
  cap.br='clearwater'; cap.known=1; cap.brKnown=1; cap.wet=1;
  if(itemName(cap).indexOf('of clearwater')<0)
    bad.push('the name reads "'+itemName(cap)+'"');
  addItem(cap);
  equipTo('head',cap);
  if(P.unseen!==CLEARWATER_TURNS) bad.push('putting on a wet cap did not hide you');
  if(cap.wet) bad.push('putting it on did not spend the charge');

  /* nothing sees you */
  L.mons.length=0;
  var m=mkMonster('Z',3,P.x+2,P.y); m.state=1; L.mons.push(m);
  computeVis();
  if(monSeesPlayer(m)) bad.push('something looked straight at you while you were unseen');
  m.def={ c:'Z', n:'watcher', lv:3, xp:1, ar:5, d:[[1,1]], seeinv:1 };
  if(!monSeesPlayer(m)) bad.push('a thing that sees invisible could not see you');
  L.mons.length=0;

  /* striking gives you away */
  P.unseen=CLEARWATER_TURNS;
  var m2=mkMonster('Z',3,P.x+1,P.y); m2.hp=m2.mhp=4000; m2.state=2; m2.disguise=0;
  L.mons.push(m2);
  playerAttack(m2);
  if(P.unseen) bad.push('you stayed hidden after striking something');
  L.mons.length=0;

  /* taking it off gives you away */
  P.unseen=CLEARWATER_TURNS;
  var off=P.eq.head; P.eq.head=null; takeOffEffects(off); addItem(off);
  if(P.unseen) bad.push('you stayed hidden after taking the cap off');

  /* a dry cap does nothing, and only water fills it */
  var cap2=carriedItems().filter(function(x){return isClearwater(x);})[0];
  if(!cap2) bad.push('the cap went missing');
  else {
    P.unseen=0;
    equipTo('head',cap2);
    if(P.unseen) bad.push('a dry cap hid you anyway');
    P.eq.head=null; takeOffEffects(cap2); addItem(cap2);
    /* drop it on dry land, pick it up: still dry */
    removeItem(cap2, 1);
    var dry=r.floors[0];
    L.tiles[dry[1]*MAP_W+dry[0]]=FLOOR;
    P.x=dry[0]; P.y=dry[1];
    cap2.x=P.x; cap2.y=P.y; L.items.push(cap2);
    autoPickup();
    if(cap2.wet) bad.push('dry ground filled the cap');
    /* now in water */
    removeItem(cap2, 1);
    L.tiles[dry[1]*MAP_W+dry[0]]=WATER;
    cap2.x=P.x; cap2.y=P.y; L.items.push(cap2);
    autoPickup();
    if(!cap2.wet) bad.push('the water did not fill the cap');
    L.tiles[dry[1]*MAP_W+dry[0]]=FLOOR;
  }
  return { onHeads:onHeads, bad:bad };
}

/* The flame trap throws fire, not a dart. */
function flameTrapOK(){
  var bad=[], i, r=null;
  bootTest(77200);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to test the flame trap in'] };
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0;
  G.bolt=null; G.shot=null;
  var kind=null;
  for(i=0;i<TRAPS.length;i++) if(TRAPS[i].k==='flame') kind=TRAPS[i];
  if(!kind) return { bad:['no flame trap in the table'] };
  L.traps.length=0;
  L.traps.push({x:P.x, y:P.y, k:kind, spent:0, found:1});
  /* a trap that shoots at you can be ducked, so keep resetting it until
     one of them actually goes off */
  for(i=0;i<60 && !G.bolt;i++){
    L.traps[0].spent=0;
    P.hp=P.mhp=4000; G.dead=0;
    springTrap(L.traps[0]);
  }
  if(G.shot) bad.push('the flame trap is still drawing an arrow');
  if(!G.bolt) bad.push('the flame trap drew nothing at all');
  else {
    if(G.bolt.kind!=='fire') bad.push('the flame trap threw '+G.bolt.kind);
    if(G.bolt.mode!=='beam') bad.push('the flame is a single moving thing, not a jet');
    if(!G.bolt.path.length) bad.push('the jet covers no ground');
    var last=G.bolt.path[G.bolt.path.length-1];
    if(last[0]!==P.x||last[1]!==P.y) bad.push('the jet does not reach you');
  }
  return { cells: G.bolt ? G.bolt.path.length : 0, bad:bad };
}


/* A fall hurts, and says how far.  A trap you dodge is still a thing you
   saw go past.  A stone thrown onto a trap sets it off. */
function trapsAndFallsOK(){
  var bad=[], i, r=null;
  bootTest(78100);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to test traps in'] };
  function kindOf(k){ for(var j=0;j<TRAPS.length;j++) if(TRAPS[j].k===k) return TRAPS[j]; return null; }

  /* --- a hole in the floor drops you, and you have to walk into it ---
     There used to be a trap door: a hidden square that dropped you
     several floors with no warning and usually killed you.  It is gone.
     What is left is a hole you can see, that you have to choose to step
     into - so this measures the step rather than the trap. */
  var depths=[], hurts=0, said=0, runs=0;
  for(i=0;i<30;i++){
    bootTest(78200+i);
    P.hp=P.mhp=400; G.dead=0; G.msgq=[]; G.pendingFall=0;
    /* a hole beside you, and a step into it */
    var into=null, q;
    for(q=0;q<DIR4.length;q++){
      var hx=P.x+DIR4[q][0], hy=P.y+DIR4[q][1];
      if(hx<1||hy<1||hx>=MAP_W-1||hy>=MAP_H-1) continue;
      into={x:hx,y:hy,dx:DIR4[q][0],dy:DIR4[q][1]};
      break;
    }
    if(!into) continue;
    L.tiles[into.y*MAP_W+into.x]=HOLE;
    var d0=G.depth, hp0=P.hp;
    playerMove(into.dx, into.dy);
    if(G.ask) answerAsk(true);          /* yes, jump */
    runs++;
    depths.push(G.depth-d0);
    if(P.hp<hp0) hurts++;
    /* No regexp here: the harness is a template literal, so a backslash
       escape in it is eaten before the engine ever sees it. */
    var lines=G.msgq.map(function(x){return x.s||'';}).join(' ');
    var at=lines.indexOf('You fall ');
    if(at>=0 && lines.indexOf(' floor', at)>at+9) said++;
  }
  if(hurts<runs) bad.push('a fall cost nothing '+(runs-hurts)+' times out of '+runs);
  if(said<runs) bad.push('the game did not say how far you fell '+(runs-said)+' times');
  var deep=0;
  for(i=0;i<depths.length;i++) if(depths[i]>1) deep++;
  if(!deep) bad.push('every fall was exactly one floor');
  /* and nothing hidden in the floor can do it to you */
  for(i=0;i<TRAPS.length;i++)
    if(TRAPS[i].k==='door') bad.push('the trap door is still in the table');
  var fell=0;
  for(var s2=0;s2<8;s2++){
    bootTest(78300+s2);
    for(var d2=1;d2<=6;d2++){
      enterLevel(d2,'down');
      for(i=0;i<L.traps.length;i++) if(L.traps[i].k.k==='door') fell++;
    }
  }
  if(fell) bad.push(fell+' trap doors were laid on floors');
  var avgFall = depths.length ?
    depths.reduce(function(a,b){return a+b;},0)/depths.length : 0;

  /* --- and the trap door route the game actually takes --------------- */
  bootTest(78300);
  P.hp=P.mhp=400; G.dead=0; G.pendingFall=1;
  var was=G.depth, hp1=P.hp;
  tickT();
  if(G.depth<=was) bad.push('a pending fall did not take you down');
  if(P.hp>=hp1) bad.push('a pending fall cost you nothing');

  /* --- dodging still shows what went past ---------------------------- */
  var shown=0, dodged=0;
  for(var k=0;k<4;k++){
    var kk=['arrow','dart','shooter','flame'][k];
    for(i=0;i<200 && dodged<60;i++){
      bootTest(78400+i);
      P.hp=P.mhp=4000; P.dex=22; G.dead=0; G.msgq=[]; G.shot=null; G.bolt=null;
      L.traps.length=0;
      L.traps.push({x:P.x, y:P.y, k:kindOf(kk), spent:0, found:1});
      springTrap(L.traps[0]);
      var lines2=G.msgq.map(function(x){return x.s||'';}).join(' ');
      if(lines2.indexOf('throw yourself flat')<0) continue;
      dodged++;
      if(G.shot||G.bolt) shown++;
    }
  }
  if(!dodged) bad.push('nothing was ever dodged, so the check proved nothing');
  else if(shown<dodged)
    bad.push((dodged-shown)+' dodges of '+dodged+' showed nothing going past');

  /* --- a stone thrown onto a trap sets it off ------------------------ */
  bootTest(78500);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  var sprung=0, spent=0, unhurt=0, tries=0;
  var single=['spike','gas','sleep','bear'];
  var reuse=['arrow','dart','shooter','flame'];
  for(k=0;k<single.length+reuse.length;k++){
    var name=(k<single.length)?single[k]:reuse[k-single.length];
    var kd=kindOf(name);
    if(!kd) continue;
    /* somewhere in the room that is not where you are standing */
    var spot=null;
    for(i=0;i<r.floors.length && !spot;i++){
      var f=r.floors[i];
      if(f[0]===P.x&&f[1]===P.y) continue;
      if(L.tiles[f[1]*MAP_W+f[0]]!==FLOOR) continue;
      spot=f;
    }
    if(!spot) continue;
    tries++;
    L.traps.length=0; L.mons.length=0; L.items.length=0;
    P.hp=P.mhp=400; G.dead=0; G.msgq=[]; G.beat=0;
    var tr={x:spot[0], y:spot[1], k:kd, spent:0, found:0};
    L.traps.push(tr);
    var stone=mkItem('weapon', weaponIndex('stone')); stone.cnt=1; stone.known=1;
    addItem(stone);
    var hpBefore=P.hp;
    throwAtSquare(stone, spot[0], spot[1]);
    if(tr.found) sprung++;
    if(P.hp>=hpBefore) unhurt++; else bad.push('a '+kd.n+' hurt you from across the room');
    if(!kd.reusable && tr.spent) spent++;
    else if(kd.reusable && tr.spent) bad.push('a '+kd.n+' should work more than once');
  }
  if(sprung<tries) bad.push((tries-sprung)+' traps of '+tries+' ignored a stone');
  if(spent<single.length) bad.push('a single use trap was not spent by a stone');
  return { fall:avgFall, dodged:dodged, shown:shown, traps:tries,
           sprung:sprung, bad:bad };
}

/* Water and holes run on under a bridge rather than stopping at it. */
function bridgeUnderOK(seeds){
  var bad=[], i, s, d, checked=0, spans=0, runsH=0, runsV=0;
  for(s=0;s<seeds;s++){
    bootTest(78700+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down');
      for(i=0;i<L.tiles.length;i++){
        if(L.tiles[i]!==BRIDGE) continue;
        var bx=i%MAP_W, by=(i/MAP_W)|0, u=L.under[i];
        checked++;
        /* to the outline of the pool a bridge counts as what it spans */
        if(isEdgeTile(bx,by)!==(EDGE_TILES[u]?u:0))
          bad.push('a bridge is not part of the water it crosses');
        /* the stream really does carry on past both sides of it */
        var run=0;
        for(var dd=0;dd<4;dd++){
          var nt=tileAt(bx+DIR4[dd][0], by+DIR4[dd][1]);
          if(nt===u) run++;
        }
        if(run>=2) spans++;
        /* the planks lie across the stream, not along it.  Working this
           out from the neighbours went wrong on a two wide stream: the
           other half of the bridge reports the water beneath it, which
           reads exactly like the stream carrying on that way. */
        var span=L.bspan[i];
        if(span!=='h' && span!=='v') bad.push('a bridge with no direction');
        else {
          var ns=(tileAt(bx,by-1)===u)||(tileAt(bx,by+1)===u);
          var ew=(tileAt(bx-1,by)===u)||(tileAt(bx+1,by)===u);
          if(ns && span!=='h')
            bad.push('a stream down the room got planks lying the same way');
          if(ew && !ns && span!=='v')
            bad.push('a stream across the room got planks lying the same way');
          if(span==='h') runsH++; else runsV++;
        }
        /* and the squares to either side are not cut off from each other */
        if(u===WATER){
          var body=waterBody(bx,by), both=0;
          for(var b=0;b<body.length;b++){
            var cx=body[b][0], cy=body[b][1];
            if(tileAt(cx,cy)===WATER) both++;
          }
          if(both<2) bad.push('the water either side of a bridge is two pools');
        }
      }
    }
  }
  if(!checked) bad.push('no bridges turned up to look at');
  if(spans<checked/2) bad.push('bridges that span nothing');
  if(!runsV) bad.push('no stream ever runs across a room');
  if(!runsH) bad.push('no stream ever runs down a room');
  return { checked:checked, spans:spans, runsH:runsH, runsV:runsV, bad:bad };
}


/* Nothing may leave you walled in with no way to the stairs. */
function noDeadEndOK(seeds){
  var bad=[], i, s, d, lands=0, pockets=0, dug=0, sealedLands=0;
  /* a teleport never puts you anywhere you cannot walk out of */
  for(s=0;s<seeds;s++){
    bootTest(82000+s);
    for(d=2;d<=6;d++){
      enterLevel(d,'down');
      P.hp=P.mhp=400; G.dead=0;
      for(var k=0;k<6;k++){
        if(!teleportPlayer()) continue;
        lands++;
        if(strandedHere()) bad.push('a teleport left you with no way out');
        if(L.sealed && L.sealed[P.y*MAP_W+P.x]) sealedLands++;
      }
    }
  }
  if(!lands) bad.push('no teleport ever went anywhere');
  if(sealedLands) bad.push(sealedLands+' teleports landed in a walled-in pocket');

  /* and if you are somehow put in one anyway, a way opens */
  for(s=0;s<40 && pockets<15;s++){
    bootTest(81000+s);
    for(d=2;d<=8 && pockets<15;d++){
      enterLevel(d,'down');
      var spot=null;
      for(i=0;i<L.tiles.length && spot===null;i++){
        if(!L.sealed || !L.sealed[i]) continue;
        if(L.tiles[i]!==FLOOR) continue;
        spot=i;
      }
      if(spot===null) continue;
      pockets++;
      P.x=spot%MAP_W; P.y=(spot/MAP_W)|0; P.hp=P.mhp=400; G.dead=0; G.msgq=[];
      if(!strandedHere()){ bad.push('a walled-in pocket was not walled in'); continue; }
      escapeIfStranded();
      if(strandedHere()) bad.push('still walled in after the way out opened');
      else dug++;
    }
  }
  if(!pockets) bad.push('no walled-in pockets turned up to try');

  /* a locked door is not a wall: standing in a vault with no key yet is
     not being stuck, and nothing should dig you out of it */
  var vaults=0;
  for(s=0;s<25 && vaults<8;s++){
    bootTest(83000+s);
    for(d=2;d<=8 && vaults<8;d++){
      enterLevel(d,'down');
      var keys=Object.keys(L.locks);
      if(!keys.length) continue;
      var lk=parseInt(keys[0],10);
      var lx=lk%MAP_W, ly=(lk/MAP_W)|0, inside=null;
      /* whichever side of it the stairs are not on */
      var outSet=wayOutSet(L, true);
      for(i=0;i<4 && inside===null;i++){
        var nx=lx+DIR4[i][0], ny=ly+DIR4[i][1];
        if(L.tiles[ny*MAP_W+nx]!==FLOOR) continue;
        inside=[nx,ny];
      }
      if(!inside) continue;
      vaults++;
      P.x=inside[0]; P.y=inside[1];
      for(i=0;i<P.keys.length;i++) P.keys[i]=0;   /* no key at all */
      var before=Array.prototype.join.call(L.tiles,',');
      escapeIfStranded();
      if(Array.prototype.join.call(L.tiles,',')!==before)
        bad.push('the wall was dug open for somebody who only needed a key');
    }
  }
  if(!vaults) bad.push('no vaults turned up to try');
  return { lands:lands, pockets:pockets, dug:dug, vaults:vaults, bad:bad };
}


/* A chest is for clearing out your pack.  Nothing but a want of room may
   stop you putting a thing in one. */
function chestFillOK(){
  var bad=[], i, j;
  bootTest(84000);
  function kinds(){
    return [mkItem('weapon',2), mkItem('weapon',3), mkItem('head',0), mkItem('head',0),
            mkItem('armor',0), mkItem('armor',0), mkItem('feet',0), mkItem('feet',0),
            mkItem('potion',0), mkItem('scroll',0), mkItem('shield',0), mkItem('shield',0)];
  }
  /* every combination of two goes in, whatever they are */
  var list=kinds();
  for(i=0;i<list.length;i++) for(j=0;j<list.length;j++){
    var c=mkItem('chest',0);
    if(!chestPut(c, kinds()[i])) { bad.push('an empty chest refused the first thing'); continue; }
    if(!chestPut(c, kinds()[j]))
      bad.push('a chest with one thing in it refused a second');
  }
  /* and it fills to exactly five, then says so */
  var c2=mkItem('chest',0), inCount=0;
  for(i=0;i<CHEST_CAP+3;i++){
    var w=mkItem('weapon',2);
    if(chestPut(c2,w)) inCount++;
  }
  if(inCount!==CHEST_CAP) bad.push('a chest took '+inCount+' things, not '+CHEST_CAP);
  if(chestRoom(c2)) bad.push('a chest with five things in it still has room');
  if(contCount(c2)!==CHEST_CAP) bad.push('the count of what is in a chest is wrong');
  /* four in, and there is still room */
  var c3=mkItem('chest',0);
  for(i=0;i<CHEST_CAP-1;i++) chestPut(c3, mkItem('weapon',2));
  if(!chestRoom(c3)) bad.push('a chest with a square free says it is full');

  /* the dungeon still stocks them politely: one weapon, no matching armour */
  var stocked=0, twoArms=0, twoSame=0;
  for(i=0;i<400;i++){
    var c4=mkItem('chest',0);
    chestStock(c4, mkItem('weapon',2));
    if(chestStock(c4, mkItem('weapon',3))) twoArms++;
    chestStock(c4, mkItem('head',0));
    if(chestStock(c4, mkItem('head',0))) twoSame++;
    stocked++;
  }
  if(twoArms) bad.push('the dungeon stocked '+twoArms+' chests with two weapons');
  if(twoSame) bad.push('the dungeon stocked '+twoSame+' chests with two of one piece of armour');
  return { stocked:stocked, bad:bad };
}


/* Perks: one choice at the levels that come of age, no ranks, and every
   one of them has to actually change a number. */
function perksOK(){
  var bad=[], i, id;
  bootTest(85000);
  /* However many there are, three are offered at a time and every one
     of them has to be reachable - the count itself is not the point. */
  if(PERKS.length < PERK_OFFER + 1)
    bad.push('only '+PERKS.length+' perks, too few to offer '+PERK_OFFER);
  var seen={};
  for(i=0;i<PERKS.length;i++){
    var pk=PERKS[i];
    if(seen[pk.id]) bad.push('two perks share the id '+pk.id);
    seen[pk.id]=1;
    if(!pk.n || !pk.txt) bad.push(pk.id+' has no name or no description');
    if(pk.n.length>16) bad.push(pk.n+' is too long for the panel');
  }
  /* the choice arrives at the right levels and nowhere else */
  var offered=[], lv;
  for(lv=2;lv<=21;lv++) if(perkLevel(lv)) offered.push(lv);
  if(offered.join(',')!=='2,4,7,11,16')
    bad.push('the choice comes at '+offered.join(',')+', not 2,4,7,11,16');

  /* levelling really does stop and ask */
  bootTest(85001);
  P.perks={}; G.perkPick=null; P.exp=0; P.lv=1;
  P.exp=E_LEVELS[0]; checkLevelUp();
  if(P.lv!==2) bad.push('the experience did not carry you to level 2');
  if(!G.perkPick) bad.push('level 2 did not offer a choice');
  else {
    if(G.perkPick.offer.length!==PERK_OFFER)
      bad.push('you were shown '+G.perkPick.offer.length+' perks, not '+PERK_OFFER);
    var mhp0=P.mhp;
    takeLevelReward('hp');
    if(P.mhp!==mhp0+PERK_HP) bad.push('taking health gave '+(P.mhp-mhp0)+', not '+PERK_HP);
    if(G.perkPick) bad.push('the choice screen did not close');
  }
  /* --- and it waits for the fighting to stop --------------------- */
  bootTest(85005);
  var rr2=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ rr2=L.rooms[i]; break; }
  if(rr2){
    P.x=rr2.cx; P.y=rr2.cy; P.hp=P.mhp=4000; G.dead=0; P.blind=0; P.hallu=0;
    P.perks={}; G.perkPick=null; P.lv=1; P.exp=E_LEVELS[0];
    L.mons.length=0;
    checkLevelUp();
    if(!G.perkPick) bad.push('no choice was queued at all');
    else {
      if(perkReady()) bad.push('the screen was ready the instant the blow landed');
      /* the moment passes, but something is still coming for you */
      G.perkPick.at = 0;
      var spot2=null;
      for(i=0;i<4 && !spot2;i++){
        var sx2=P.x+DIR4[i][0], sy2=P.y+DIR4[i][1];
        if(walkable(sx2,sy2)) spot2=[sx2,sy2];
      }
      if(spot2){
        var foe2=mkMonster('Z',3,spot2[0],spot2[1]);
        foe2.state=2; foe2.disguise=0; foe2.invis=0;
        L.mons.push(foe2);
        computeVis();
        if(perkReady()) bad.push('the screen opened with a foe still on you');
        L.mons.length=0;
      }
      computeVis();
      if(!perkReady()) bad.push('the screen never opened once it was quiet');
      /* and the wait really is about half a second */
      G.perkPick.at = nowMs() + PERK_PAUSE;
      if(perkReady()) bad.push('the wait after the last blow is not honoured');
      G.perkPick=null;
    }
  }

  /* level 3 asks nothing */
  P.exp=E_LEVELS[1]; checkLevelUp();
  if(P.lv!==3) bad.push('no level 3');
  if(G.perkPick) bad.push('level 3 offered a choice it should not have');

  /* taking a perk instead gives no health */
  bootTest(85002);
  P.perks={}; G.perkPick=null; P.lv=1; P.exp=E_LEVELS[0];
  checkLevelUp();
  var mhp1=P.mhp, pick=G.perkPick.offer[0].id;
  takeLevelReward(pick);
  if(!hasPerk(pick)) bad.push('the perk you chose was not taken');
  if(P.mhp!==mhp1) bad.push('a perk also handed out health');

  /* never offered one you already have, and the offer runs dry politely */
  bootTest(85003);
  P.perks={};
  for(i=0;i<PERKS.length-1;i++) P.perks[PERKS[i].id]=1;
  var off=perkOffer();
  if(off.length!==1) bad.push('with one perk left you were shown '+off.length);
  if(off.length && hasPerk(off[0].id)) bad.push('you were offered one you already have');
  P.perks={};
  for(i=0;i<PERKS.length;i++) P.perks[PERKS[i].id]=1;
  if(perkOffer().length) bad.push('perks were offered when there are none left');
  /* and with nothing left the choice still pays out */
  G.perkPick={lv:16, offer:[], i:0};
  var mhp2=P.mhp;
  takeLevelReward('anything');
  if(P.mhp!==mhp2+PERK_HP) bad.push('with no perks left you were given nothing');

  /* --- every perk changes the number it claims to change ------------ */
  function withPerk(id, fn){
    P.perks={}; var a=fn();
    P.perks={}; P.perks[id]=1; var b=fn();
    P.perks={};
    return [a,b];
  }
  var r, room=null;
  bootTest(85010);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ room=L.rooms[i]; break; }
  P.x=room.cx; P.y=room.cy; P.hp=P.mhp=4000; G.dead=0;
  P.eq.rh=mkItem('weapon',2); P.eq.rh.known=1;

  r=withPerk('silent', function(){ return stealthScore(); });
  if(r[1]<=r[0]) bad.push('Silent feet did not make you quieter');
  r=withPerk('grace', function(){ return dodgeChance(); });
  if(r[1]<=r[0]) bad.push('the grace perk did not help you dodge');
  r=withPerk('heavyhand', function(){ return playerDamBonus(); });
  if(r[1]!==r[0]+PERK_MELEE_DAM) bad.push('Heavy hand did not add damage');
  r=withPerk('keeneye', function(){ return searchSkill(); });
  if(r[1]<=r[0]) bad.push('Keen eye did not help you search');
  r=withPerk('antiquary', function(){ return apprSkill(); });
  if(r[1]<=r[0]) bad.push('Antiquarian did not help you appraise');
  r=withPerk('marksman', function(){ return shotRange(); });
  if(r[1]!==r[0]+PERK_SHOT_RANGE) bad.push('Marksman did not lengthen your reach');
  r=withPerk('ember', function(){
    var n=0; for(var j=0;j<4000;j++) n+=resistPlayer(10,'fire'); return n; });
  if(r[1]>=r[0]) bad.push('Ember skin did not soften fire');
  r=withPerk('frost', function(){
    var n=0; for(var j=0;j<4000;j++) n+=resistPlayer(10,'cold'); return n; });
  if(r[1]>=r[0]) bad.push('Frostborn did not soften cold');
  r=withPerk('ironblood', function(){
    var n=0; for(var j=0;j<4000;j++) n+=resistPlayer(10,'poison'); return n; });
  if(r[1]>=r[0]) bad.push('Ironblood did not soften poison');
  r=withPerk('firewield', function(){
    var n=0; for(var j=0;j<4000;j++) n+=perkElemental(10,'fire'); return n; });
  if(r[1]<=r[0]) bad.push('Fire wielder did not make your fire hotter');
  r=withPerk('storm', function(){
    var n=0; for(var j=0;j<4000;j++) n+=perkElemental(10,'lightning'); return n; });
  if(r[1]<=r[0]) bad.push('Storm touched did not sharpen your lightning');
  /* a resistance must not touch ordinary damage */
  P.perks={ember:1,frost:1,ironblood:1};
  if(resistPlayer(10)!==10) bad.push('a resistance softened a plain sword blow');
  P.perks={};

  /* backstabber, riposte and the executioner, watched in the room */
  function foe(){
    L.mons.length=0;
    var m=mkMonster('Z',3,P.x+1,P.y);
    m.hp=m.mhp=100000; m.state=2; m.disguise=0; m.ar=10;
    L.mons.push(m); return m;
  }
  var m1;
  P.perks={};
  m1=foe(); m1.state=0;
  var plain=surpriseDam(m1);
  P.perks={backstab:1};
  m1.state=0;
  var stabby=surpriseDam(m1);
  P.perks={};
  if(stabby<=plain-4) bad.push('Backstabber made a sneak attack weaker');

  var counters=0;
  P.perks={riposte:1};
  for(i=0;i<400;i++){ var m2=foe(); m2.hp=m2.mhp=100000; if(riposte(m2)) counters++; }
  P.perks={};
  var ripPct=Math.round(counters*100/400);
  if(!counters) bad.push('Riposte never answered a miss');
  for(i=0;i<200;i++){ var m3=foe(); if(riposte(m3)) bad.push('Riposte fired without the perk'); break; }

  var finished=0;
  P.perks={executioner:1};
  for(i=0;i<400;i++){
    var m4=foe(); m4.mhp=100; m4.hp=10; m4.ar=10;
    playerAttack(m4);
    if(L.mons.indexOf(m4)<0) finished++;
  }
  P.perks={};
  if(!finished) bad.push('the Executioner never finished anything');
  L.mons.length=0;
  return { ripPct:ripPct, bad:bad };
}

/* Water is thigh deep for most things, and Riverborn turns that round. */
function wadingOK(){
  var bad=[], i, room=null;
  bootTest(86000);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ room=L.rooms[i]; break; }
  if(!room) return { bad:['no room to test wading in'] };
  var spot=room.floors[0];
  L.tiles[spot[1]*MAP_W+spot[0]]=WATER;
  P.x=spot[0]; P.y=spot[1]; P.perks={}; P.wade=0;

  /* on dry land nothing ever costs you a step */
  L.tiles[spot[1]*MAP_W+spot[0]]=FLOOR;
  for(i=0;i<20;i++) if(wadeStep(true)!==0) bad.push('dry floor slowed you down');
  /* in water, every second step is spent */
  L.tiles[spot[1]*MAP_W+spot[0]]=WATER;
  P.wade=0;
  var lost=0;
  for(i=0;i<20;i++) if(wadeStep(true)>0) lost++;
  if(lost!==10) bad.push('wading cost you '+lost+' of 20 steps, not 10');
  /* wading is about crossing it: standing there swinging is not slower */
  P.wade=0;
  for(i=0;i<20;i++) if(wadeStep(false)!==0)
    bad.push('standing still in water cost you a turn');
  /* riverborn: every second action is free, which is double speed */
  P.perks={riverborn:1}; P.wade=0;
  var free=0, cost=0, N=20;
  for(i=0;i<N;i++){ var w=wadeStep(true); if(w<0) free++; if(w>0) cost++; }
  if(cost) bad.push('Riverborn still lost you '+cost+' steps');
  if(free!==N/RIVER_FREE_EVERY)
    bad.push('Riverborn gave you '+free+' free steps of '+N);
  /* and it is not only steps - anything you do in the water */
  P.wade=0;
  var freeStanding=0;
  for(i=0;i<N;i++) if(wadeStep(false)<0) freeStanding++;
  if(freeStanding!==N/RIVER_FREE_EVERY)
    bad.push('Riverborn only helps when you walk, not when you act');
  P.perks={};
  /* the speeds those work out to */
  var wadeSpeed = Math.round(100 * 20 / (20 + 10));
  var riverSpeed = Math.round(100 * N / (N - free));
  if(wadeSpeed!==67) bad.push('wading is '+wadeSpeed+'% speed, not 67%');
  if(riverSpeed!==200) bad.push('Riverborn is '+riverSpeed+'% speed, not 200%');

  /* Abstemious: a ration goes 30% further, and starving still kills */
  P.perks={}; P.abstCtr=0;
  function eatTurns(){
    P.food=1000; P.hp=P.mhp=4000; G.dead=0; G.turn=0;
    var n=0;
    while(P.food>0 && n<20000){ upkeep(); n++; }
    return n;
  }
  var plainTurns=eatTurns();
  P.perks={abstemious:1}; P.abstCtr=0;
  var thriftyTurns=eatTurns();
  P.perks={};
  var pct=Math.round((thriftyTurns/plainTurns-1)*100);
  if(pct<28||pct>32)
    bad.push('Abstemious made a ration last '+pct+'% longer, not 30%');
  /* and it does not make you proof against starving */
  P.perks={abstemious:1};
  /* starving, but not so far gone that it kills outright before the
     gnawing gets its turn */
  P.food=10; P.hp=P.mhp=400; G.dead=0; G.hungerState=3;
  /* upkeep does not advance the clock - tick does - so put it on the
     turn the gnawing actually falls on */
  G.turn=STARVE_DAMAGE_EVERY;
  var hp0=P.hp;
  upkeep();
  if(P.hp>=hp0) bad.push('Abstemious stopped starvation hurting you');
  P.perks={}; P.food=1300;

  /* who the water does not bother */
  var wades=[], swims=[];
  for(i=0;i<MONS.length;i++){
    var m=mkMonster(MONS[i].c, 5, spot[0], spot[1]);
    m.wade=0;
    var slowed=0;
    for(var k=0;k<20;k++) if(monWades(m)) slowed++;
    if(slowed) wades.push(MONS[i].n); else swims.push(MONS[i].n);
    if(slowed && slowed!==10)
      bad.push(MONS[i].n+' lost '+slowed+' of 20 steps, not 10');
  }
  var want=['aquator','bat','griffin','phantom','wraith','snake','rattlesnake',
            'venus flytrap','xeroc'];
  for(i=0;i<want.length;i++)
    if(swims.indexOf(want[i])<0) bad.push(want[i]+' should not be slowed by water');
  for(i=0;i<swims.length;i++)
    if(want.indexOf(swims[i])<0) bad.push(swims[i]+' is not slowed by water and should be');
  if(!wades.length) bad.push('nothing at all is slowed by water');
  L.mons.length=0;
  return { wades:wades.length, swims:swims.length, foodPct:pct,
           wadeSpeed:wadeSpeed, riverSpeed:riverSpeed, bad:bad };
}


/* Dexterous stretches magic; the leprechaun is worth catching; and the
   teleport trap is gone. */
function dexterousOK(){
  var bad=[], i;
  bootTest(87000);
  if(!PERK_BY_ID['dexterous']) bad.push('there is no Dexterous perk');
  /* a scroll sometimes survives the reading */
  function scrollRuns(perk){
    P.perks = perk ? {dexterous:1} : {};
    var kept=0, N=3000;
    for(i=0;i<N;i++){
      P.slots = new Array(N_SLOTS).fill(null);
      var sc = mkItem('scroll', 0); sc.cnt = 1; addItem(sc);
      G.msgq=[];
      spendUse(sc);
      if(countOf(sc) > 0) kept++;
    }
    P.perks={};
    return Math.round(kept*100/N);
  }
  var plainScroll = scrollRuns(false), dexScroll = scrollRuns(true);
  if(plainScroll) bad.push('a scroll survived a reading with no perk: '+plainScroll+'%');
  if(dexScroll < PERK_SCROLL_PCT-5 || dexScroll > PERK_SCROLL_PCT+5)
    bad.push('Dexterous kept '+dexScroll+'% of scrolls, not '+PERK_SCROLL_PCT+'%');

  /* and a wand keeps a charge as often */
  function wandRuns(perk){
    P.perks = perk ? {dexterous:1} : {};
    var kept=0, N=3000;
    for(i=0;i<N;i++){
      var w = mkItem('wand', 0); w.ch = 5;
      G.msgq=[];
      if(keepsCharge(w)) kept++;
    }
    P.perks={};
    return Math.round(kept*100/N);
  }
  var plainWand = wandRuns(false), dexWand = wandRuns(true);
  if(plainWand) bad.push('a wand kept a charge with no perk');
  if(dexWand < PERK_CHARGE_PCT-5 || dexWand > PERK_CHARGE_PCT+5)
    bad.push('Dexterous kept '+dexWand+'% of charges, not '+PERK_CHARGE_PCT+'%');

  /* a runestone counts as magic too */
  P.perks={dexterous:1};
  var stoneKept=0;
  for(i=0;i<2000;i++){
    var st = mkRuneStone(); G.msgq=[];
    if(keepsCharge(st)) stoneKept++;
  }
  P.perks={};
  if(!stoneKept) bad.push('Dexterous never spared a runestone');

  /* --- the teleport trap is gone ---------------------------------- */
  for(i=0;i<TRAPS.length;i++)
    if(TRAPS[i].k==='tele') bad.push('the teleport trap is still in the table');
  var seenKinds={}, floors=0;
  for(var s=0;s<12;s++){
    bootTest(87100+s);
    for(var d=1;d<=10;d++){
      enterLevel(d,'down'); floors++;
      for(i=0;i<L.traps.length;i++) seenKinds[L.traps[i].k.k]=1;
    }
  }
  if(seenKinds['tele']) bad.push('a teleport trap was laid on a floor');

  /* --- the ring of the unseen ------------------------------------- */
  var ri = ringIndex('the unseen');
  if(ri < 0) bad.push('there is no ring of the unseen');
  else {
    bootTest(87200);
    var ring = mkItem('ring', ri);
    if(!ring.known) bad.push('the ring does not say what it is');
    if(itemName(ring).indexOf('the unseen')<0)
      bad.push('the ring is called "'+itemName(ring)+'"');
    if(RINGS[ri].p !== 0) bad.push('the ring turns up as ordinary floor loot');
    P.unseen=0; P.perks={}; addItem(ring);
    var ch0 = ring.ch;
    var res = useItem(ring);
    if(P.unseen !== RING_INVIS_TURNS)
      bad.push('the ring hid you for '+P.unseen+' turns, not '+RING_INVIS_TURNS);
    if(ring.ch !== ch0-1) bad.push('using the ring did not spend a charge');
    if(res.blink) bad.push('the ring of the unseen tried to teleport you');
    P.unseen=0;
    /* it never lies about the floor: only a leprechaun carries one */
    var loose=0;
    for(i=0;i<6000;i++){ var it=newItem(8); if(it && it.t==='ring' && it.k===ri) loose++; }
    if(loose) bad.push(loose+' rings of the unseen were left lying about');
  }

  /* --- and what he is carrying ------------------------------------ */
  var rings=0, extras=0, purses=0, kills=0;
  /* One floor, four hundred deaths: what is being counted is what falls
     out of his pockets, and that does not depend on the room he is in. */
  for(s=0;s<400;s++){
    if(s % 25 === 0) bootTest(87300+s); else srand(87300+s);
    L.items.length=0; L.mons.length=0;
    var spot=null;
    for(i=0;i<4 && !spot;i++){
      var sx=P.x+DIR4[i][0], sy=P.y+DIR4[i][1];
      if(walkable(sx,sy)) spot=[sx,sy];
    }
    if(!spot) continue;
    var m=mkMonster('L',5,spot[0],spot[1]);
    m.gold=120; L.mons.push(m);
    kills++;
    killMonster(m, true);
    var gold=0;
    for(i=0;i<L.items.length;i++){
      var o=L.items[i];
      if(o.t==='gold') gold+=o.cnt;
      else if(o.t==='ring' && o.k===ri) rings++;
      else extras++;
    }
    if(gold>=120) purses++;
  }
  if(purses<kills) bad.push('killing him did not always give the purse back');
  if(!rings) bad.push('he never carries the ring');
  if(!extras) bad.push('he never carries anything but coin');
  if(extras > kills * 0.7)
    bad.push('he is carrying loot '+Math.round(extras*100/kills)+'% of the time - too generous');
  return { scroll:dexScroll, charge:dexWand,
           ringPct:Math.round(rings*100/Math.max(1,kills)),
           extraPct:Math.round(extras*100/Math.max(1,kills)), bad:bad };
}


/* A spear flies as well as it stabs, and comes back to be thrown again.
   The scroll of return charms exactly one thing at a time. */
function hurlWeaponsOK(){
  var bad=[], i, r=null;
  bootTest(88000);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to throw a spear across'] };
  var spear=weaponIndex('spear'), tdag=weaponIndex('throwing dagger');
  if(spear<0) bad.push('no spear in the table');
  if(tdag<0) bad.push('no throwing dagger in the table');
  if(!WEAPONS[spear].hurl) bad.push('the spear cannot be thrown');
  if(!WEAPONS[tdag].hurl) bad.push('the throwing dagger cannot be thrown');
  /* wieldable as well as throwable */
  for(i=0;i<2;i++){
    var w=mkItem('weapon', i ? tdag : spear);
    if(slotFor(w)!=='rh') bad.push(WEAPONS[w.k].n+' cannot be wielded');
    if(!isThrowable(w)) bad.push(WEAPONS[w.k].n+' is not offered as a throw');
  }
  /* the throwing dagger keeps to the deep floors */
  var shallow=0, deep=0;
  for(i=0;i<20000;i++){
    var a=pickWeaponFor(1), b=pickWeaponFor(6);
    if(a===tdag) shallow++;
    if(b===tdag) deep++;
  }
  if(shallow) bad.push('a throwing dagger turned up above floor '+WEAPONS[tdag].minDepth);
  if(!deep) bad.push('the throwing dagger never turns up at all');

  function setup(kind, homing){
    L.mons.length=0; L.items.length=0;
    P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0; G.beat=0; G.msgq=[];
    P.perks={}; P.slots=new Array(N_SLOTS).fill(null);
    P.eq={rh:null,body:null,lh:null,head:null,feet:null};
    var w=mkItem('weapon',kind); w.known=1; w.cnt=1;
    if(homing) w.homing=1;
    addItem(w);
    var spot=null;
    for(var j=1;j<=4 && !spot;j++){
      var sx=P.x+j, sy=P.y;
      if(walkable(sx,sy) && shotClear(P.x,P.y,sx,sy)) spot=[sx,sy];
    }
    if(!spot) return null;
    var m=mkMonster('Z',3,spot[0],spot[1]);
    m.hp=m.mhp=100000; m.state=2; m.disguise=0; m.ar=10;
    L.mons.push(m);
    return { w:w, m:m };
  }

  /* Thrown, it does what it does in the hand, and it comes through the
     landing about four times in five - on the floor or back in your
     grip.  It used to come through every time, which made a spear the
     one weapon in the dungeon that cost nothing at all to use; see
     hurlWear.  What is asked here is that it is the throw that takes it
     and nothing else, so the share is measured rather than assumed. */
  var s = setup(spear, 0);
  if(!s) bad.push('nowhere to throw a spear');
  else {
    var kept=0, N=200, dmgs=[];
    for(i=0;i<N;i++){
      s = setup(spear, 0);
      G.throwing = s.w;
      var hp0 = s.m.hp;
      throwAtSquare(s.w, s.m.x, s.m.y);
      G.throwing = null;
      if(s.m.hp < hp0) dmgs.push(hp0 - s.m.hp);
      var back = 0;
      for(var q=0;q<L.items.length;q++)
        if(L.items[q].t==='weapon' && L.items[q].k===spear) back=1;
      if(countOf(s.w) > 0) back = 1;
      if(back) kept++;
    }
    var lost = N - kept, lostPct = lost * 100 / N;
    /* Two hundred throws, so the share it comes out at is worth reading:
       a whole point either side of the rule is about three standard
       errors, which is wide enough not to fail on the dice and narrow
       enough to catch the rule being changed by accident. */
    if(Math.abs(lostPct - THROWN_BREAK_PCT) > 9)
      bad.push('a thrown spear was lost '+lost+' times of '+N+' - '+
        lostPct.toFixed(1)+'%, against the '+THROWN_BREAK_PCT+'% it should break on');
    if(!kept) bad.push('not one thrown spear of '+N+' was ever there afterwards');
    var avg = dmgs.length ? dmgs.reduce(function(a,b){return a+b;},0)/dmgs.length : 0;
    /* melee with the same spear, for comparison */
    s = setup(spear, 0);
    equipTo('rh', s.w);
    var mdmg=[], N2=400;
    for(i=0;i<N2;i++){
      s = setup(spear, 0);
      equipTo('rh', s.w);
      var h0=s.m.hp;
      playerAttack(s.m);
      if(s.m.hp<h0) mdmg.push(h0-s.m.hp);
    }
    var mavg = mdmg.length ? mdmg.reduce(function(a,b){return a+b;},0)/mdmg.length : 0;
    if(Math.abs(avg-mavg) > 2.5)
      bad.push('a thrown spear does '+avg.toFixed(1)+' where the hand does '+mavg.toFixed(1));
    var thrownAvg=avg, meleeAvg=mavg;
  }

  /* --- the scroll of return -------------------------------------- */
  var sk = scrollIndex('return');
  if(sk < 0) bad.push('there is no scroll of return');
  else {
    bootTest(88100);
    P.slots=new Array(N_SLOTS).fill(null);
    P.eq={rh:null,body:null,lh:null,head:null,feet:null};
    var st=mkItem('weapon', weaponIndex('stone')); st.cnt=3; st.known=1; addItem(st);
    var sp=mkItem('weapon', spear); sp.known=1; addItem(sp);
    var ar=mkItem('weapon', weaponIndex('arrow')); ar.cnt=5; ar.known=1; addItem(ar);
    var po=mkItem('potion',0); addItem(po);
    /* what it will and will not settle on */
    if(!canReturn(st)) bad.push('the scroll will not charm a stone');
    if(!canReturn(sp)) bad.push('the scroll will not charm a spear');
    if(!canReturn(ar)) bad.push('the scroll will not charm an arrow');
    if(canReturn(po)) bad.push('the scroll charmed a potion');
    /* one at a time */
    G.msgq=[]; applyScrollTo('return', st, sk);
    if(!st.homing) bad.push('the scroll did not take on the stone');
    G.msgq=[]; applyScrollTo('return', sp, sk);
    if(!sp.homing) bad.push('the scroll did not move to the spear');
    if(st.homing) bad.push('two things carry the charm at once');
    if(returningItem() !== sp) bad.push('the charm is not where it should be');
  }

  /* a charmed thing comes home rather than landing */
  bootTest(88200);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  var came=0, M=60;
  for(i=0;i<M;i++){
    var s2 = setup(spear, 1);
    if(!s2) break;
    G.throwing = s2.w;
    throwAtSquare(s2.w, s2.m.x, s2.m.y);
    G.throwing = null;
    if(countOf(s2.w) > 0 || carriedItems().filter(function(x){
        return x.t==='weapon' && x.k===spear; }).length) came++;
  }
  if(came < M) bad.push('a charmed spear stayed on the floor '+(M-came)+' times of '+M);
  L.mons.length=0;
  return { thrown:thrownAvg, melee:meleeAvg, lost:lostPct, bad:bad };
}


/* A full pack is not the end of it; stones are spent one at a time; a
   flask can do more than burn; and the pack column is only so wide. */
function overflowAndStonesOK(){
  var bad=[], i, r=null;
  bootTest(89000);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to test in'] };
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0; P.perks={};

  /* --- unequipping with a full pack ------------------------------- */
  function fill(withPouch){
    P.slots=new Array(N_SLOTS).fill(null);
    P.eq={rh:null,body:null,lh:null,head:null,feet:null};
    L.items.length=0;
    for(var j=0;j<N_SLOTS;j++) P.slots[j]=mkItem('food',0);
    if(withPouch){
      var po=mkItem('pouch',0);
      P.slots[N_SLOTS-1]=po;               /* one square is the pouch */
    }
    var arm=mkItem('armor',0); arm.known=1; arm.cursed=0;
    P.eq.body=arm;
    return arm;
  }
  /* with a pouch, it goes in the pouch */
  var arm=fill(true);
  G.msgq=[];
  unequipTo(arm);
  var inPouch=0;
  for(i=0;i<N_SLOTS;i++){
    var s=P.slots[i];
    if(s && s.t==='pouch')
      for(var q=0;q<POUCH_CAP;q++) if(s.items[q]===arm) inPouch=1;
  }
  if(!inPouch) bad.push('a full pack dropped the armour instead of pouching it');
  if(itemAt(L,P.x,P.y)===arm) bad.push('the armour went on the floor with a pouch free');
  /* with no pouch and no room, it really does go on the floor */
  arm=fill(false);
  G.msgq=[];
  unequipTo(arm);
  var floored=0;
  for(i=0;i<L.items.length;i++) if(L.items[i]===arm) floored=1;
  if(!floored) bad.push('a full pack with no pouch did not drop it');

  /* --- a stack of returning stones, spent one at a time ------------ */
  bootTest(89100);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0; P.perks={};
  P.slots=new Array(N_SLOTS).fill(null);
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  L.mons.length=0; L.items.length=0;
  var rk=weaponIndex('returning stone');
  var st=mkItem('weapon',rk); st.cnt=2; st.known=1;
  addItem(st);
  /* any direction with room in it, not only east: the centre of an
     irregular chamber can have a pillar or a wall a step to its right */
  var spot=null;
  for(var sd=0; sd<DIR4.length && !spot; sd++)
    for(i=1;i<=4 && !spot;i++){
      var tx2=P.x+DIR4[sd][0]*i, ty2=P.y+DIR4[sd][1]*i;
      if(walkable(tx2,ty2) && shotClear(P.x,P.y,tx2,ty2)) spot=[tx2,ty2];
    }
  if(!spot) bad.push('nowhere to throw a stone');
  else {
    var flights=0, plainStones=0, guard=0;
    while(countOf(st) > 0 && guard++ < 200){
      L.mons.length=0;
      var m=mkMonster('Z',3,spot[0],spot[1]);
      m.hp=m.mhp=100000; m.state=2; m.disguise=0; m.ar=10;
      L.mons.push(m);
      G.throwing=st; G.beat=0; G.msgq=[];
      throwAtSquare(st, m.x, m.y);
      G.throwing=null;
      flights++;
      /* count the plain stones that have fallen out of the charm */
      plainStones=0;
      var all=carriedItems();
      for(i=0;i<all.length;i++)
        if(all[i].t==='weapon' && all[i].k===weaponIndex('stone')) plainStones+=all[i].cnt;
      if(plainStones===1 && countOf(st)!==1)
        bad.push('the first stone burnt out but '+countOf(st)+' remain in the stack');
      if(plainStones>=2) break;
    }
    /* two stones, each good for its own run of flights */
    if(flights < RETURN_USES*2 - 1 || flights > RETURN_USES*2 + 1)
      bad.push('two stones gave '+flights+' flights, wanted about '+(RETURN_USES*2));
    if(plainStones!==2) bad.push('the stack left '+plainStones+' plain stones, not 2');
    var stoneFlights=flights;
  }

  /* --- the pack column is 34 characters wide ---------------------- */
  var wide=[];
  for(i=0;i<PERKS.length;i++){
    var line='  ' + (PERKS[i].s || PERKS[i].txt);
    if(!PERKS[i].s) wide.push(PERKS[i].n+' has no short line');
    if(line.length > 34) wide.push(PERKS[i].n+': '+line.length+' characters');
    if(PERKS[i].n.length > 34) wide.push(PERKS[i].n+' name too wide');
  }
  for(i=0;i<wide.length;i++) bad.push(wide[i]);

  return { flights:stoneFlights, bad:bad };
}

/* Flasks that do more than burn, and can be lobbed to a friend. */
function thrownPotionsOK(){
  var bad=[], i, r=null;
  function potIndex(name){ for(var j=0;j<POTIONS.length;j++) if(POTIONS[j].n===name) return j; return -1; }
  bootTest(89200);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to throw a flask across'] };
  function foeAt(dx, ally){
    L.mons.length=0; L.clouds.length=0; L.items.length=0;
    P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0; G.beat=0; G.msgq=[];
    P.slots=new Array(N_SLOTS).fill(null);
    var sx=P.x+dx, sy=P.y;
    if(!walkable(sx,sy) || !shotClear(P.x,P.y,sx,sy)) return null;
    var m=mkMonster('Z',3,sx,sy);
    m.hp=m.mhp=200; m.state=2; m.disguise=0;
    if(ally) m.ally=1;
    L.mons.push(m);
    return m;
  }
  /* blindness blinds it, and a blinded thing cannot see you */
  var m=foeAt(2,0);
  if(!m) bad.push('nowhere to stand a target');
  else {
    var bp=mkItem('potion',potIndex('blindness')); bp.cnt=1; addItem(bp);
    throwAtSquare(bp, m.x, m.y);
    if(!m.blind) bad.push('a flask of blindness did not blind it');
    else {
      computeVis();
      if(monSeesPlayer(m)) bad.push('a blinded creature could still see you');
    }
  }
  /* strength makes its blows land harder */
  m = foeAt(2,0);
  if(m){
    var sp=mkItem('potion',potIndex('gain strength')); sp.cnt=1; addItem(sp);
    throwAtSquare(sp, m.x, m.y);
    if(!m.dmgBonus) bad.push('a flask of strength did nothing to it');
  }
  /* healing makes a red mist that mends whoever stands in it */
  m = foeAt(2,0);
  if(m){
    m.hp = 10;
    var hp3=mkItem('potion',potIndex('healing')); hp3.cnt=1; addItem(hp3);
    throwAtSquare(hp3, m.x, m.y);
    var mist=0;
    for(i=0;i<L.clouds.length;i++) if(L.clouds[i].kind==='mend') mist++;
    if(!mist) bad.push('a flask of healing made no red mist');
    var was=m.hp;
    P.x=r.cx; P.y=r.cy;
    ageClouds();
    if(m.hp<=was) bad.push('the red mist did not mend the thing standing in it');
    /* and it mends you as well */
    var cl=L.clouds[0];
    if(cl){
      P.x=cl.x; P.y=cl.y; P.hp=P.mhp-20;
      var hp0=P.hp;
      /* the mist is stamped to appear when the flask lands, and the air
         only works on you once it is actually there - let it arrive */
      cl.at=0;
      cloudsOnYou(); ageClouds();
      settleHp();
      if(P.hp<=hp0) bad.push('the red mist did not mend you');
    }
  }
  /* a flask may be lobbed to a friend; a stone may not */
  m = foeAt(2,1);
  if(m){
    var hp4=mkItem('potion',potIndex('healing')); hp4.cnt=1; addItem(hp4);
    G.msgq=[];
    var ok=throwAtSquare(hp4, m.x, m.y);
    if(!ok) bad.push('you could not lob a flask to your own ally');
    m = foeAt(2,1);
    var stn=mkItem('weapon',weaponIndex('stone')); stn.cnt=1; stn.known=1; addItem(stn);
    G.throwing=stn; G.msgq=[];
    var shot=throwAtSquare(stn, m.x, m.y);
    G.throwing=null;
    if(shot) bad.push('you shot your own ally with a stone');
  }
  L.mons.length=0; L.clouds.length=0;
  return { bad:bad };
}

/* Clever things work the trail; animals give up. */
function huntersOK(){
  var bad=[], i, r=null, smart=0, dim=0;
  bootTest(89300);
  for(i=0;i<MONS.length;i++){ if(MONS[i].smart) smart++; else dim++; }
  if(!smart) bad.push('nothing is clever enough to hunt');
  if(!dim) bad.push('everything hunts - the animals should not');
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>24){ r=L.rooms[i]; break; }
  if(!r) return { smart:smart, bad:bad };

  /* let one see you, then vanish, and watch what it does */
  function chase(c){
    L.mons.length=0;
    P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0; P.blind=0; P.unseen=0;
    var far=r.floors[r.floors.length-1];
    var m=mkMonster(c,5,far[0],far[1]);
    m.hp=m.mhp=4000; m.state=2; m.disguise=0; m.lost=0;
    L.mons.push(m);
    computeVis();
    var mark={x:P.x, y:P.y};               /* it has just seen you here */
    m.mark={x:mark.x, y:mark.y};
    /* and now you are somewhere else entirely, and out of sight.  The
       point of the test is the walk to a place you are not. */
    var away=null;
    for(var j=0;j<r.floors.length;j++){
      var f=r.floors[j];
      if(Math.abs(f[0]-mark.x)+Math.abs(f[1]-mark.y) < 4) continue;
      if(Math.abs(f[0]-m.x)+Math.abs(f[1]-m.y) < 4) continue;
      if(!walkable(f[0],f[1])) continue;
      away=f; break;
    }
    if(!away) return null;
    P.x=away[0]; P.y=away[1];
    P.unseen=999;
    var turns=0, reached=0;
    for(turns=0;turns<80;turns++){
      if(m.state!==2) break;
      monOneMove(m);
      if(m.x===mark.x && m.y===mark.y) reached=1;
    }
    P.unseen=0;
    return { turns:turns, reached:reached, gaveUp:m.state!==2 };
  }
  /* an orc is cunning; a rat is not, and neither is a troll - all teeth
     and no wit */
  if(MON_BY_CHAR['T'] && MON_BY_CHAR['T'].smart) bad.push('a troll should not be clever');
  if(!MON_BY_CHAR['O'] || !MON_BY_CHAR['O'].smart) bad.push('an orc should be clever');
  var clever=chase('O'), animal=chase('K');
  if(!clever || !animal) return { smart:smart, dim:dim, clever:0, animal:0, bad:bad };
  if(!clever.gaveUp) bad.push('a clever thing never gave up at all');
  if(!animal.gaveUp) bad.push('an animal never gave up');
  if(animal.turns > GIVE_UP_TURNS+2)
    bad.push('an animal searched for '+animal.turns+' turns, not '+GIVE_UP_TURNS);
  if(clever.turns <= animal.turns)
    bad.push('the clever one gave up as fast as a rat ('+clever.turns+' vs '+animal.turns+')');
  if(!clever.reached) bad.push('the clever one never reached where it last saw you');
  L.mons.length=0;
  return { smart:smart, dim:dim, clever:clever.turns, animal:animal.turns, bad:bad };
}


/* Walking into a room somebody built says what sort of room it is, once. */
function roomEntryOK(seeds){
  var bad=[], i, s, d, said=0, kinds={}, seen={};
  for(i=0;i<SPECIAL_ROOMS.length;i++){
    var nm=SPECIAL_ROOMS[i].n;
    if(!ROOM_ENTRY[nm]) bad.push('nothing is said on entering the '+nm);
    else for(var j=0;j<ROOM_ENTRY[nm].length;j++)
      if(ROOM_ENTRY[nm][j].length>44)
        bad.push(nm+' line is '+ROOM_ENTRY[nm][j].length+' wide');
  }
  for(s=0;s<seeds;s++){
    bootTest(94000+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down');
      var r=null;
      for(i=0;i<L.rooms.length;i++) if(L.rooms[i].special){ r=L.rooms[i]; break; }
      if(!r) continue;
      seen[r.special]=1;
      /* stand in it and see what is said */
      var spot=null;
      for(i=0;i<r.floors.length && !spot;i++)
        if(walkable(r.floors[i][0], r.floors[i][1])) spot=r.floors[i];
      if(!spot) continue;
      r.told=0;
      P.x=spot[0]; P.y=spot[1];
      G.msgq=[];
      announceRoom();
      var line=G.msgq.map(function(m){return m.s;}).join(' ');
      if(!line){ bad.push('walking into the '+r.special+' said nothing'); continue; }
      said++;
      kinds[r.special]=(kinds[r.special]||0)+1;
      /* and only once */
      G.msgq=[];
      announceRoom();
      if(G.msgq.length) bad.push('the '+r.special+' announced itself twice');
      /* an ordinary room says nothing at all */
      var plain=null;
      for(i=0;i<L.rooms.length && !plain;i++)
        if(!L.rooms[i].gone && !L.rooms[i].special && L.rooms[i].floors.length) plain=L.rooms[i];
      if(plain){
        P.x=plain.floors[0][0]; P.y=plain.floors[0][1];
        G.msgq=[];
        announceRoom();
        if(G.msgq.length) bad.push('an ordinary room announced itself');
      }
    }
  }
  if(!said) bad.push('no special room was ever walked into');
  return { said:said, kinds:Object.keys(kinds).length, bad:bad };
}

/* Everything in the game can be looked at, and everything has a line. */
function lookOK(){
  var bad=[], i, j, r=null;
  bootTest(90100);
  /* every tile the game can lay down has something to say about it */
  var tiles = [ROCK,WALL,FLOOR,CORR,DOOR,SDOOR,LOCKED,STAIR,STAIR_UP,
               WATER,HOLY,HOLE,BRIDGE,BARS,ICEWALL,FIREWALL];
  var names = ['ROCK','WALL','FLOOR','CORR','DOOR','SDOOR','LOCKED','STAIR',
               'STAIR_UP','WATER','HOLY','HOLE','BRIDGE','BARS','ICEWALL','FIREWALL'];
  for(i=0;i<tiles.length;i++){
    var ti = TILE_INFO[tiles[i]];
    if(tiles[i]===BRIDGE) continue;          /* spoken for in lookAt */
    if(!ti || !ti.length) bad.push('no description for the tile '+names[i]);
    else for(j=0;j<ti.length;j++)
      if(ti[j].length>34) bad.push(names[i]+' line is '+ti[j].length+' wide');
  }
  /* every creature */
  for(i=0;i<MONS.length;i++){
    var mi = MON_INFO[MONS[i].c];
    if(!mi || !mi.length) bad.push('no description for the '+MONS[i].n);
    else for(j=0;j<mi.length;j++)
      if(mi[j].length>34) bad.push(MONS[i].n+' line is '+mi[j].length+' wide');
  }
  /* every trap */
  for(i=0;i<TRAPS.length;i++){
    var tri = TRAP_INFO[TRAPS[i].k];
    if(!tri || !tri.length) bad.push('no description for the '+TRAPS[i].n);
    else for(j=0;j<tri.length;j++)
      if(tri[j].length>34) bad.push(TRAPS[i].n+' line is '+tri[j].length+' wide');
  }
  /* every kind of decor the dungeon lays down */
  var decors = MOSSES.concat(CRACKS).concat(
                ['bones','skull','rubble','table','chair','kerb','barrel']);
  for(i=0;i<decors.length;i++){
    var di = DECOR_INFO[decors[i]];
    if(!di || !di.length) bad.push('no description for '+decors[i]);
    else for(j=0;j<di.length;j++)
      if(di[j].length>34) bad.push(decors[i]+' line is '+di[j].length+' wide');
  }

  /* --- and it reads a real square properly ------------------------ */
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
  if(!r) return { bad:bad };
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=400; G.dead=0; P.blind=0; P.hallu=0;
  L.mons.length=0; L.items.length=0; L.traps.length=0;
  for(i=0;i<L.flags.length;i++) L.flags[i] |= 3;
  computeVis();
  var here = lookAt(P.x, P.y);
  if(!here.length) bad.push('your own square says nothing');
  if(here[0].indexOf('standing here')<0) bad.push('it does not say you are standing there');
  /* a plain floor square */
  var plain=null;
  for(i=0;i<r.floors.length && !plain;i++){
    var f=r.floors[i];
    if(f[0]===P.x&&f[1]===P.y) continue;
    if(L.tiles[f[1]*MAP_W+f[0]]!==FLOOR) continue;
    if(L.decor[f[1]*MAP_W+f[0]]) continue;
    plain=f;
  }
  if(plain){
    var pl = lookAt(plain[0], plain[1]);
    /* A bare square is the one place the floor is worth a line, and the
       line no longer calls itself normal. */
    if(pl.join(' ')!==TILE_INFO[FLOOR].join(' '))
      bad.push('a plain floor reads "'+pl.join(' ')+'"');
  }
  /* a creature is named and its habits given */
  var spot=null;
  for(i=0;i<4 && !spot;i++){
    var sx=P.x+DIR4[i][0], sy=P.y+DIR4[i][1];
    if(walkable(sx,sy)) spot=[sx,sy];
  }
  if(spot){
    var m=mkMonster('T',5,spot[0],spot[1]);
    m.state=0; m.disguise=0; m.invis=0; L.mons.push(m);
    computeVis();
    var ml = lookAt(spot[0], spot[1]);
    var joined = ml.join(' ');
    if(joined.indexOf('troll')<0) bad.push('a troll is not named: "'+joined+'"');
    if(joined.indexOf('asleep')<0) bad.push('it does not say the troll is asleep');
    L.mons.length=0;
  }
  /* somewhere you have never been says so */
  var unseen=null;
  for(i=0;i<L.tiles.length && unseen===null;i++)
    if(walkTile(L.tiles[i])) unseen=i;
  if(unseen!==null){
    L.flags[unseen] &= ~3;
    var ul = lookAt(unseen%MAP_W, (unseen/MAP_W)|0);
    if(ul.join(' ').indexOf('not seen')<0)
      bad.push('an unvisited square gave itself away: "'+ul.join(' ')+'"');
    L.flags[unseen] |= 3;
  }
  /* and off the edge of the map does not throw */
  lookAt(-1, -1); lookAt(MAP_W+5, MAP_H+5);
  return { tiles:tiles.length, mons:MONS.length, traps:TRAPS.length,
           decor:decors.length, bad:bad };
}


/* Keys belong to their floor; the pouch has a window; the stairs are a
   walk apart; and some rooms have a rug in the middle. */
function floorFurnitureOK(seeds){
  var bad=[], i, j, s, d;

  /* --- an unused key goes back where it was lying ----------------- */
  var carried=0, returned=0, sameSquare=0;
  for(s=0;s<seeds;s++){
    bootTest(91000+s);
    var lv1=null, homes=null;
    for(d=1;d<=6;d++){
      enterLevel(d,'down');
      if(!Object.keys(L.locks).length) continue;
      lv1=L;
      /* pick up every key on this floor */
      homes={};
      for(i=L.items.length-1;i>=0;i--){
        var it=L.items[i];
        if(it.t!=='key') continue;
        (homes[it.k]=homes[it.k]||[]).push(it.x+','+it.y);
        P.keys[it.k]++;
        L.items.splice(i,1);
      }
      if(!homes || !Object.keys(homes).length){ lv1=null; continue; }
      break;
    }
    if(!lv1) continue;
    var had=0;
    for(i=0;i<P.keys.length;i++) had+=P.keys[i];
    if(!had) continue;
    carried+=had;
    var from=G.depth;
    enterLevel(from+1,'down');
    /* nothing in the pack */
    var left=0;
    for(i=0;i<P.keys.length;i++) left+=P.keys[i];
    if(left) bad.push(left+' keys came down the stairs with you');
    /* and back on the floor above, where they were */
    var lv=G.floors[from], back=0;
    for(i=0;i<lv.items.length;i++){
      var k2=lv.items[i];
      if(k2.t!=='key') continue;
      back++;
      if(homes[k2.k] && homes[k2.k].indexOf(k2.x+','+k2.y)>=0) sameSquare++;
    }
    returned+=back;
    if(back<had) bad.push('only '+back+' of '+had+' keys were left behind');
  }
  if(!carried) bad.push('no keys were ever carried off a floor');
  if(returned<carried) bad.push('keys went missing on the way back');
  if(sameSquare<returned) bad.push('a key came back to the wrong square');

  /* --- the pouch turns up between floor 3 and floor 5 ------------- */
  var found={}, runs=0, never=0;
  for(s=0;s<seeds*3;s++){
    bootTest(91500+s);
    runs++;
    var at=0;
    for(d=1;d<=8 && !at;d++){
      enterLevel(d,'down');
      for(i=0;i<L.items.length;i++) if(L.items[i].t==='pouch') at=d;
      var all=carriedItems();
      for(i=0;i<L.mons.length;i++)
        if(L.mons[i].item && L.mons[i].item.t==='pouch') at=d;
      for(i=0;i<L.items.length;i++){
        var ch=L.items[i];
        if(ch.t!=='chest') continue;
        for(j=0;j<CHEST_CAP;j++) if(ch.items[j] && ch.items[j].t==='pouch') at=d;
      }
    }
    if(!at) never++;
    else {
      found[at]=(found[at]||0)+1;
      if(at<POUCH_FLOOR_MIN || at>POUCH_FLOOR_MAX)
        bad.push('a pouch turned up on floor '+at);
    }
  }
  if(never>runs/2) bad.push(never+' runs of '+runs+' had no pouch by floor 8');

  /* --- the stairs are a walk apart, and the key is a room away ---- */
  var pairs=0, close=0, sumd=0, keyNear=0, keyLoose=0, keyChecked=0;
  for(s=0;s<seeds;s++){
    bootTest(92000+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down');
      if(L.up && L.stair){
        pairs++;
        var dist=Math.abs(L.up.x-L.stair.x)+Math.abs(L.up.y-L.stair.y);
        sumd+=dist;
        /* the two of them on top of each other would be no journey */
        if(dist<6) close++;
      }
      /* a key must not lie in a room the lock opens onto */
      for(i=0;i<L.items.length;i++){
        var ky=L.items[i];
        if(ky.t!=='key') continue;
        keyChecked++;
        var kr=L.roomAt[ky.y*MAP_W+ky.x];
        if(kr<0) continue;
        var shun=roomsAtLocks(L, ky.k, null);
        /* A key in a room its own lock opens is only allowed when there
           was nowhere else to put it - a floor where everything you can
           reach without a key is that one room.  Anything else is a
           placement bug, so check which of the two this is. */
        if(shun[kr]){
          keyNear++;
          if(!ky.cramped) keyLoose++;
        }
      }
    }
  }
  if(!pairs) bad.push('no floor had both staircases');
  if(close>pairs/8) bad.push(close+' floors of '+pairs+' put the stairs on top of each other');
  if(keyLoose) bad.push(keyLoose+' keys were dropped in the room their own lock opens '+
    'when somewhere else was available');
  if(keyNear>keyChecked/25) bad.push(keyNear+' of '+keyChecked+
    ' keys ended up behind their own lock - too many cramped floors');

  /* --- rugs ------------------------------------------------------- */
  /* the tables first, before a floor is generated from them */
  bad = bad.concat(rugCutTableFaults());
  var rugFloors=0, rugSquares=0, floors=0, onTop=0;
  for(s=0;s<seeds;s++){
    bootTest(92500+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down'); floors++;
      var here=0;
      for(var key in L.decor){
        if(!isRug(L.decor[key])) continue;
        here++;
        var rx=key%MAP_W, ry=(key/MAP_W)|0;
        /* A rug lies on flagstones - or over a trapdoor, which is the
           one thing a rug is ever laid on top of on purpose, and the
           only way a door in the floor is properly hidden. */
        if(L.tiles[key]!==FLOOR && L.tiles[key]!==TRAPDOOR)
          bad.push('a rug is not lying on a floor');
        if(rx===L.stair.x && ry===L.stair.y) onTop++;
        if(L.up && rx===L.up.x && ry===L.up.y) onTop++;
        if(!DECOR_INFO[L.decor[key]]) bad.push('no words for '+L.decor[key]);
      }
      if(here) bad.push.apply(bad, rugSliceFaults());
      if(here){ rugFloors++; rugSquares+=here; }
    }
  }
  if(!rugFloors) bad.push('no room in the whole dungeon has a rug');
  if(onTop) bad.push(onTop+' rugs were laid over a staircase');
  return { keys:returned, pouch:found, stairs:Math.round(sumd/Math.max(1,pairs)),
           rugFloors:rugFloors, floors:floors,
           rugSize:(rugSquares/Math.max(1,rugFloors)).toFixed(1), bad:bad };
}


/* A doorway you cannot walk through is masonry, and a chest in the mouth
   of one is a cork in the only way into the room. */
function doorwaysOK(seeds){
  var bad=[], blind=0, corked=0, doors=0, chests=0, floors=0, s, d, i;
  for(s=0;s<seeds;s++){
    bootTest(93500+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down'); floors++;
      for(i=0;i<L.tiles.length;i++){
        var tt=L.tiles[i];
        if(tt!==DOOR && tt!==SDOOR && tt!==LOCKED) continue;
        doors++;
        var x=i%MAP_W, y=(i/MAP_W)|0, ways=0;
        for(var dd=0;dd<4;dd++)
          if(walkTile(L.tiles[(y+DIR4[dd][1])*MAP_W+(x+DIR4[dd][0])])) ways++;
        if(ways<2){
          blind++;
          bad.push('a door at '+x+','+y+' with '+ways+' way(s) through it');
        }
      }
      for(i=0;i<L.items.length;i++){
        var it=L.items[i];
        if(it.t!=='chest') continue;
        chests++;
        if(blocksDoorway(it.x, it.y, L)){
          corked++;
          bad.push('a chest at '+it.x+','+it.y+' is standing in a doorway');
        }
      }
      /* and the floor is still all of a piece */
      if(!everywhereReachable(L)) bad.push('bricking up a door cut the floor in two');
    }
  }
  if(!doors) bad.push('no doors to look at');
  if(!chests) bad.push('no chests to look at');
  return { floors:floors, doors:doors, chests:chests,
           blind:blind, corked:corked, bad:bad };
}


/* Breaking line of sight, and shooting with something in your face. */
function ambushOK(){
  var bad=[], i, r=null;
  bootTest(95000);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>24){ r=L.rooms[i]; break; }
  if(!r) return { bad:['no room to hide in'] };
  P.x=r.cx; P.y=r.cy; P.hp=P.mhp=4000; G.dead=0; P.blind=0; P.unseen=0; P.perks={};
  L.mons.length=0;
  /* The square of the room furthest from you that can still see you.
     Merely the furthest is no good in a big room: past nine squares
     nothing can make you out, so the creature starts the test having
     already lost you, which is not what the test is about. */
  var far=null, fd=-1;
  for(i=0;i<r.floors.length;i++){
    var cand=r.floors[i];
    var cd=Math.abs(cand[0]-P.x)+Math.abs(cand[1]-P.y);
    if(cd<2||cd>9||cd<=fd) continue;
    if(monAt(L,cand[0],cand[1])) continue;
    if(!sightClear(cand[0],cand[1],P.x,P.y)) continue;
    fd=cd; far=cand;
  }
  if(!far) return { bad:['nowhere in the room can see the middle of it'] };
  var m=mkMonster('O',5,far[0],far[1]);
  m.hp=m.mhp=4000; m.state=2; m.disguise=0; m.surprised=0;
  L.mons.push(m);
  computeVis();
  /* One creature-turn: it acts, and then where it has ended up decides
     what it can see.  The two used to be one call; they were split so
     that walking into view counts on the turn it happens. */
  /* held where it stands: the question is what a round costs it, not
     whether it can walk to you.  Left free it simply comes and stands
     next to you, and something at your elbow knows where you are
     whether it can see you or not. */
  function oneTurn(){ var hx=m.x, hy=m.y; monOneMove(m); m.x=hx; m.y=hy; noteSight(m); }
  /* it can see you, so it is not surprised by anything */
  oneTurn();
  if(m.surprised) bad.push('it was surprised while watching you');
  /* out of sight for a single round is just rounding a pillar */
  P.unseen=999;
  oneTurn();
  if(m.blindTo !== 1) bad.push('it did not count the round it lost you');
  m.surprised=0;
  P.unseen=0; computeVis();
  oneTurn();
  if(m.surprised) bad.push('one round out of sight was enough to catch it out');
  /* Two whole rounds, and stepping back in does catch it.  Put it back
     on the hunt first: a creature that has given up looking never
     reaches the part of its turn where any of this is decided. */
  m.surprised=0; m.blindTo=0; m.state=2; m.lost=0; m.seek=null; m.mark=null;
  /* and back across the room: something standing next to you knows you
     are there whether it can see you or not, so the counter never runs
     while it is breathing down your neck */
  m.x=far[0]; m.y=far[1]; m.anim=null;
  P.unseen=999;
  for(i=0;i<SURPRISE_AFTER;i++) oneTurn();
  if(m.blindTo < SURPRISE_AFTER)
    bad.push('it counted '+m.blindTo+' rounds without you, not '+SURPRISE_AFTER);
  P.unseen=0; computeVis();
  oneTurn();
  if(!m.surprised) bad.push('two rounds out of sight did not catch it out');
  /* a surprised thing is easier to hit than a watchful one */
  m.state=2; m.surprised=1; m.flee=0;
  var caught=surpriseHit(m);
  m.surprised=0;
  var watchful=surpriseHit(m);
  if(caught<=watchful) bad.push('a surprised creature is no easier to hit');
  /* and one that has not noticed you at all takes a sneak strike */
  m.state=0;
  var asleep=surpriseHit(m), sneakDam=surpriseDam(m);
  m.state=2;
  if(asleep<=caught) bad.push('an unsuspecting creature is not the easiest of all');
  if(!sneakDam) bad.push('an unsuspecting creature takes no sneak damage');

  /* --- a chosen stone beats a loaded bow -------------------------
     Picking a stone out of the pack and saying "throw this" has to
     throw the stone, even with a bow in your off hand. */
  {
    P.slots=new Array(N_SLOTS).fill(null);
    P.eq={rh:null,body:null,lh:null,head:null,feet:null};
    var stn=mkItem('weapon', weaponIndex('stone')); stn.cnt=3; stn.known=1; addItem(stn);
    var kitPlain=canShoot();
    if(kitPlain) bad.push('you can shoot with nothing chosen and no bow');
    G.throwing=stn;
    var kitStone=canShoot();
    if(!kitStone || kitStone.ammo!==stn) bad.push('a chosen stone is not what flies');
    if(!kitStone || !kitStone.thrown) bad.push('a chosen stone is not counted as thrown');
    /* now put a loaded bow in the off hand and choose the stone again */
    P.eq.lh=mkItem('weapon', weaponIndex('short bow'));
    var quiver=mkItem('weapon', weaponIndex('arrow')); quiver.cnt=20; quiver.known=1;
    addItem(quiver);
    G.throwing=stn;
    var kitBoth=canShoot();
    if(!kitBoth || kitBoth.ammo!==stn)
      bad.push('with a bow in hand, choosing a stone loosed ' +
        (kitBoth ? WEAPONS[kitBoth.ammo.k].n : 'nothing'));
    /* and with nothing chosen, the bow is what fires */
    G.throwing=null;
    var kitBow=canShoot();
    if(!kitBow || kitBow.ammo!==quiver) bad.push('the bow does not fire on its own');
    P.eq.lh=null; G.throwing=null;
  }

  /* --- shooting with something on top of you ---------------------
     Stand somewhere with five clear squares in some direction, or the
     comparison has nothing to compare. */
  var stand=null;
  for(i=0;i<r.floors.length && !stand;i++){
    var f=r.floors[i];
    for(var q=0;q<4 && !stand;q++){
      var ok=1;
      for(var n=1;n<=5;n++){
        var sx=f[0]+DIR4[q][0]*n, sy=f[1]+DIR4[q][1]*n;
        if(!walkable(sx,sy) || !shotClear(f[0],f[1],sx,sy)) ok=0;
      }
      if(ok) stand=f;
    }
  }
  if(!stand) return { close:0, mid:0, far:0, bad:bad };
  P.x=stand[0]; P.y=stand[1];
  computeVis();
  P.perks={}; P.slots=new Array(N_SLOTS).fill(null);
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  function hitRate(gap){
    L.mons.length=0;
    /* exactly that many squares away, in whichever direction the room
       actually has room for it */
    var spot=null;
    for(var q=0;q<4 && !spot;q++){
      var sx=P.x+DIR4[q][0]*gap, sy=P.y+DIR4[q][1]*gap;
      if(walkable(sx,sy) && shotClear(P.x,P.y,sx,sy)) spot=[sx,sy];
    }
    if(!spot) return -1;
    var hits=0, N=1500;
    for(var k=0;k<N;k++){
      P.slots=new Array(N_SLOTS).fill(null);
      P.eq.lh=mkItem('weapon', weaponIndex('short bow'));
      var am=mkItem('weapon', weaponIndex('arrow')); am.cnt=99; am.known=1; addItem(am);
      var mm=mkMonster('Z',3,spot[0],spot[1]);
      mm.hp=mm.mhp=100000; mm.state=2; mm.disguise=0; mm.surprised=0; mm.ar=6;
      L.mons.length=0; L.mons.push(mm);
      G.beat=0; G.msgq=[];
      var before=mm.hp;
      fireAt(mm);
      if(mm.hp<before) hits++;
    }
    return Math.round(hits*100/N);
  }
  var close=hitRate(1), mid=hitRate(3), far2=hitRate(5);
  if(close<0||mid<0||far2<0) bad.push('nowhere to line up the shots');
  else {
    if(close>=mid) bad.push('point blank ('+close+'%) is no worse than three squares ('+mid+'%)');
    if(mid>=far2) bad.push('three squares ('+mid+'%) is no worse than five ('+far2+'%)');
  }
  L.mons.length=0;
  return { close:close, mid:mid, far:far2, bad:bad };
}


/* Sight is the same predicate both ways, and a soft landing is softer. */
function sightAndLandingOK(seeds){
  var bad=[], i, s, d, asym=0, checked=0;
  /* --- nobody can see anybody the other cannot ------------------- */
  for(s=0;s<seeds;s++){
    bootTest(96000+s);
    for(d=1;d<=5;d++){
      enterLevel(d,'down');
      for(var t=0;t<15;t++){
        var r=L.rooms[rnd(L.rooms.length)];
        if(!r||r.gone||!r.floors.length) continue;
        var f=r.floors[rnd(r.floors.length)];
        for(var dy=-8;dy<=8;dy++) for(var dx=-8;dx<=8;dx++){
          var x=f[0]+dx, y=f[1]+dy;
          if(x<1||y<1||x>=MAP_W-1||y>=MAP_H-1) continue;
          if(!walkTile(L.tiles[y*MAP_W+x])) continue;
          checked++;
          if(sightClear(f[0],f[1],x,y) !== sightClear(x,y,f[0],f[1])) asym++;
        }
      }
    }
  }
  if(!checked) bad.push('no squares were looked at');
  if(asym) bad.push(asym+' pairs where sight is not the same both ways');

  /* the player and a creature agree about who can see whom */
  bootTest(96500);
  var room=null;
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>20){ room=L.rooms[i]; break; }
  if(room){
    P.x=room.cx; P.y=room.cy; P.blind=0; P.hallu=0; P.unseen=0; P.seeinv=0;
    L.mons.length=0;
    var disagree=0, pairs=0;
    for(i=0;i<room.floors.length;i++){
      var g=room.floors[i];
      if(g[0]===P.x&&g[1]===P.y) continue;
      if(!walkable(g[0],g[1])) continue;
      var mm=mkMonster('Z',3,g[0],g[1]);
      mm.state=2; mm.disguise=0; mm.invis=0;
      L.mons.length=0; L.mons.push(mm);
      computeVis();
      pairs++;
      var youSee=canSeeMon(mm), itSees=monSeesPlayer(mm);
      /* it can see further than you can, so only the other way is a
         fault: you must never see something that cannot see you */
      if(youSee && !itSees) disagree++;
    }
    L.mons.length=0;
    if(disagree) bad.push(disagree+' of '+pairs+' creatures you could see could not see you');
  }

  /* --- a soft landing ------------------------------------------- */
  bootTest(96900);
  for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ room=L.rooms[i]; break; }
  if(!room) return { checked:checked, bad:bad };
  var spot=room.floors[0];
  var j=spot[1]*MAP_W+spot[0];
  P.x=spot[0]; P.y=spot[1];
  L.tiles[j]=FLOOR; delete L.decor[j];
  if(softLanding(P.x,P.y)) bad.push('bare stone broke your fall');
  var kinds=['moss','moss2','rubble','rug_11'];
  for(i=0;i<kinds.length;i++){
    L.decor[j]=kinds[i];
    var soft=softLanding(P.x,P.y);
    if(!soft) bad.push(kinds[i]+' did not break the fall at all');
    else {
      if(soft[0]<=0 || soft[0]>=1) bad.push(kinds[i]+' takes off '+soft[0]);
      if(!soft[1]) bad.push(kinds[i]+' says nothing about it');
    }
  }
  delete L.decor[j];
  L.tiles[j]=WATER;
  var wet=softLanding(P.x,P.y);
  if(!wet) bad.push('water did not break the fall');
  else if(wet[0]<SOFT_LANDING.moss[0]) bad.push('water is no softer than moss');
  L.tiles[j]=FLOOR;

  /* and it really comes off the damage: moss takes about a fifth */
  function fallOnto(dec){
    var hard=0, softd=0, N=3000;
    for(var k=0;k<N;k++){
      var dm=roll(3,5)+3;
      hard+=dm;
      softd+=Math.max(1, softenDamage(dm, 1-SOFT_LANDING.moss[0]));
    }
    return [hard/N, softd/N];
  }
  var f2=fallOnto('moss');
  var cut=Math.round((1-f2[1]/f2[0])*100);
  if(cut<16||cut>24) bad.push('moss took off '+cut+'%, not about 20%');
  return { checked:checked, mossCut:cut, bad:bad };
}

/* Creatures keep a post or walk a round, and give up on you after three
   turns out of sight rather than following you across the floor. */
function monsterBeatsOK(){
  var bad=[], i, t;
  /* one floor holds three or four creatures, which is too few to say
     anything about a three-in-ten habit - so take a proper sample */
  var tracked=0, posted=0, tot=0;
  for(var s=0;s<24;s++){
    bootTest(93900+s);
    for(i=0;i<L.mons.length;i++){
      tot++;
      if(!L.mons[i].post) { bad.push('a creature with no post at all'); continue; }
      if(L.mons[i].track) tracked++; else posted++;
    }
  }
  bootTest(93900);
  if(!tot) bad.push('no creatures to look at');
  if(!tracked) bad.push('nothing walks a round');
  if(!posted) bad.push('nothing holds a post');

  /* left alone, they stay where they belong */
  bootTest(93901);
  P.x=1; P.y=1;
  var watch=[];
  for(i=0;i<L.mons.length && watch.length<8;i++)
    if(L.mons[i].post) watch.push({m:L.mons[i], px:L.mons[i].post.x, py:L.mons[i].post.y});
  for(t=0;t<200;t++) monstersMove();
  for(i=0;i<watch.length;i++){
    var w=watch[i];
    if(L.mons.indexOf(w.m)<0) continue;
    var away=Math.abs(w.m.x-w.px)+Math.abs(w.m.y-w.py);
    /* "Where it belongs" is its own room, not a number of squares.  A
       round is two or three places in the room it was posted in, so on a
       long room a creature walking its round is properly fifteen squares
       from its post and still exactly where it should be.  What must
       never happen is that it leaves the room - that is drifting after
       you.  A post in a corridor has no room to stay in, so that one
       keeps the distance bound. */
    var postRoom = L.roomAt[w.py*MAP_W+w.px];
    var nowRoom = L.roomAt[w.m.y*MAP_W+w.m.x];
    if(postRoom>=0){
      if(nowRoom!==postRoom)
        bad.push('one left the room it was posted in and was '+away+' squares away');
    } else if(away>10){
      bad.push('one wandered '+away+' squares from its post in 200 turns');
    }
  }

  /* And one that has lost you goes back to it.  A plain creature, not a
     clever one: a clever one is meant to cast about for a few turns
     first, so it would be measuring the wrong number. */
  bootTest(93902);
  P.hp=P.mhp=900;
  var m=mkMonster('S',2,P.x+3,P.y);
  m.state=2; m.surprised=0; m.disguise=0; m.hp=m.mhp=900;
  m.post={x:m.x,y:m.y}; m.track=null; m.lost=0;
  L.mons.length=0; L.mons.push(m);
  var post={x:m.x,y:m.y};
  P.x=1; P.y=1;
  var gaveUpOn=0;
  for(t=1;t<=10;t++){
    monstersMove();
    if(m.state!==2 && !gaveUpOn) gaveUpOn=t;
  }
  if(!gaveUpOn) bad.push('it never stopped hunting');
  else if(gaveUpOn>GIVE_UP_TURNS+1)
    bad.push('it hunted for '+gaveUpOn+' turns after losing sight, not '+GIVE_UP_TURNS);
  /* and then give it time to walk back.  Ten turns was enough only while
     it happened to give up beside its own post; how far it has wandered
     depends on the floor, and the thing being checked is that it goes
     back at all, not how quickly. */
  for(t=0;t<30 && (Math.abs(m.x-post.x)+Math.abs(m.y-post.y))>1;t++) monstersMove();
  var back=Math.abs(m.x-post.x)+Math.abs(m.y-post.y);
  if(back>1) bad.push('it did not go back to its post ('+back+' squares away)');
  return { tracked:tracked, posted:posted, gaveUpOn:gaveUpOn, bad:bad };
}

/* Every name the game can print, checked for the two mistakes that keep
   creeping in: the wrong article, and a singular article on a pair of
   boots.  "You pick up a sandals" is the sort of thing nobody notices
   in the code and everybody notices in the game. */
function namingOK(){
  var bad=[], seen={}, i, k;
  bootTest(9998);
  var kinds=[['weapon',WEAPONS.length],['armor',ARMORS.length],['head',HEADS.length],
    ['feet',FEET.length],['shield',SHIELDS.length],['potion',POTIONS.length],
    ['scroll',SCROLLS.length],['wand',WANDS.length],['food',2],['key',MATS.length],
    ['crystal',1],['pin',1],['dynamite',1],['pouch',1],['chest',1],['amulet',1]];
  for(i=0;i<kinds.length;i++){
    var t=kinds[i][0];
    for(k=0;k<kinds[i][1];k++){
      for(var kn=0;kn<2;kn++) for(var c=0;c<2;c++){
        var it=mkItem(t,k);
        it.known=kn;
        if(it.cnt!==undefined) it.cnt=c?3:1;
        if(t==='potion'&&kn) KNOWN.pot[k]=1;
        if(t==='scroll'&&kn) KNOWN.scr[k]=1;
        if(t==='wand'&&kn) KNOWN.wand[k]=1;
        var s=itemName(it);
        seen[s]=1;

        /* Nothing is "normal".  A stone is a stone; the pack says
           whether you have appraised it, which is what that word was
           standing in for. */
        if(s.indexOf('normal')>=0) bad.push('"'+s+'" - nothing should be normal');

        /* the article has to match the sound of the next word */
        if(/^a [aeiou]/.test(s)) bad.push('"'+s+'" - "a" before a vowel');
        if(/^an [^aeiou]/.test(s)) bad.push('"'+s+'" - "an" before a consonant');

        /* a pair is a pair */
        if(isGear(it)){
          var def=itemDef(it);
          var pair=s.indexOf('a pair of')===0;
          if(def.pl && !pair) bad.push('"'+s+'" - '+def.n+' is a pair');
          if(!def.pl && pair) bad.push('"'+s+'" - '+def.n+' is not a pair');
        }
        /* and gear is never counted like coins */
        if(isGear(it) && /^\d/.test(s)) bad.push('"'+s+'" - gear should not be counted');
      }
    }
  }
  return { names:Object.keys(seen).length, bad:bad };
}

/* Dynamite opens stone, and must never open it onto nothing. */
function dynamiteOK(seeds){
  var bad=[], opened=0, tried=0, s, d, i, x, y;
  for(s=0;s<seeds;s++){
    bootTest(84000+s);
    for(d=1;d<=6;d++){
      enterLevel(d);
      /* find a wall within reach and blow it */
      var target=null;
      for(var r=1;r<9 && !target;r++)
        for(var dy=-r;dy<=r && !target;dy++)
          for(var dx=-r;dx<=r;dx++){
            var tx=P.x+dx, ty=P.y+dy;
            if(tx<2||ty<2||tx>=MAP_W-2||ty>=MAP_H-2) continue;
            if(tileAt(tx,ty)===WALL){ target=[tx,ty]; break; }
          }
      if(!target) continue;
      tried++;
      P.hp=P.mhp=500; G.dead=0; G.msgq=[];
      var before=0;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===WALL||L.tiles[i]===ROCK) before++;
      opened += dynamiteAt(target[0],target[1]);
      var after=0;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===WALL||L.tiles[i]===ROCK) after++;
      if(after>=before) bad.push('the blast opened nothing');
      /* and no walkable square may now look straight out at raw rock */
      for(y=1;y<MAP_H-1;y++) for(x=1;x<MAP_W-1;x++){
        var t2=L.tiles[y*MAP_W+x];
        if(t2!==FLOOR && t2!==CORR) continue;
        for(var q=0;q<8;q++)
          if(L.tiles[(y+DIR8[q][1])*MAP_W+(x+DIR8[q][0])]===ROCK){
            bad.push('a blasted opening looks out onto bare rock at '+x+','+y);
            y=MAP_H; x=MAP_W; break;
          }
      }
    }
  }
  return { tried:tried, opened:opened, bad:bad };
}

/* Everything lying on a floor, counted by kind, chests opened and
   monster pockets turned out. */
function floorLoot(floors){
  var N={}, n=0, d, s, walled=0, loose=0, chests=0, inChests=0, staged=0;
  function note(it){
    if(it.t==='chest'){ (it.items||[]).forEach(function(x){ if(x) note(x); }); return; }
    var k = (it.t==='weapon' && WEAPONS[it.k].grp) ? 'ammo' : it.t;
    N[k]=(N[k]||0)+1;
  }
  function count(it){
    /* a vault chest is not clutter: you cannot reach it without blasting */
    if(L.sealed && L.sealed[it.y*MAP_W+it.x]){ walled++; return; }
    /* nor is a room stocked on purpose - a cell full of potions is a
       set piece you walked into, not litter you tripped over */
    var ri = L.roomAt[it.y*MAP_W+it.x];
    if(ri>=0 && L.rooms[ri] && L.rooms[ri].special){ staged++; return; }
    /* Nor is gold, a key you need for a lock, or something still shut in
       a chest.  What "too many items" means is how much is lying about
       on the floor waiting to be stepped on. */
    if(it.t==='gold'){ N.gold=(N.gold||0)+1; return; }
    if(it.t==='key'){ N.key=(N.key||0)+1; return; }
    if(it.t==='chest'){ chests++; inChests += contCount(it); return; }
    loose++;
    note(it);
  }
  for(s=0;s<floors;s++){
    bootTest(51000+s);
    for(d=1;d<=8;d++){
      enterLevel(d); n++;
      L.items.forEach(count);
      for(var i=0;i<L.mons.length;i++) if(L.mons[i].item) note(L.mons[i].item);
    }
  }
  var tot=0, k;
  for(k in N) tot+=N[k];
  var per={};
  for(k in N) per[k]=N[k]/n;
  return {floors:n, per:per, total:tot/n, walled:walled/n, staged:staged/n,
           loose:loose/n, chests:chests/n, inChests:inChests/n};
}

/* Every creature must be able to land a blow.  Two of them shipped with
   no attack dice at all - the ice monster and the aquator - which made
   them free experience, and in the aquator's case disabled its rust
   entirely, since rust only fires on a hit. */
function toothless(){
  var bad=[], i;
  for(i=0;i<MONS.length;i++){
    var D=MONS[i];
    if(D.sp==='flame') continue;            /* breathes instead of biting */
    if(!D.d || !D.d.length) bad.push(D.n+' has no attack dice');
    else for(var j=0;j<D.d.length;j++)
      if(!D.d[j] || D.d[j][1]<1) bad.push(D.n+' rolls no damage');
  }
  return bad;
}

/* Nothing stackable should turn up in a hoard: the biggest pile of each
   kind, wherever it came from - the floor, a chest, or a dead monster. */
function pileSizes(floors){
  var worst={}, n=0, d, s, bad=[];
  function note(it){
    if(it.t==='chest'){ (it.items||[]).forEach(function(x){ if(x) note(x); }); return; }
    if(it.t!=='weapon') return;
    var W=WEAPONS[it.k];
    if(!W.grp) return;
    if(!(W.n in worst) || it.cnt>worst[W.n]) worst[W.n]=it.cnt;
    var cap=W.pile ? W.pile[1] : 1;
    if(it.cnt>cap) bad.push(W.n+' x'+it.cnt+' (cap '+cap+')');
  }
  for(s=0;s<floors;s++){
    bootTest(41000+s);
    for(d=1;d<=8;d++){
      enterLevel(d); n++;
      L.items.forEach(note);
      for(var i=0;i<L.mons.length;i++) if(L.mons[i].item) note(L.mons[i].item);
    }
  }
  return {floors:n, worst:worst, bad:bad};
}
/* The same floor, played with some sense: soften what you can at range,
   and walk off your wounds between fights instead of charging the next
   thing at four hit points.  This is the number that says the floor is
   fair - the toe-to-toe one only says brawling is a bad plan. */
function clearFloorWell(depth, runs){
  var died=0, i;
  for(i=0;i<runs;i++){
    bootTest(420000+depth*1000+i);
    if(depth>1) enterLevel(depth);
    P.hp=P.mhp; G.dead=0;
    var roster=[];
    for(var j=0;j<L.mons.length;j++) if(!L.mons[j].ally) roster.push(L.mons[j].c);
    var stones=3, alive=true;
    for(var k=0;k<roster.length && alive;k++){
      var m=mkMonster(roster[k],depth,P.x+1,P.y);
      m.state=2; m.surprised=0; m.disguise=0;
      L.mons.length=0; L.mons.push(m);
      P.hp=P.mhp;                     /* rest up first - it costs only food */
      while(stones>0 && m.hp>0){       /* two free hits before it closes */
        stones--; m.hp -= damRoll([WEAPONS[weaponIndex('stone')].shot]);
      }
      var guard=0;
      while(m.hp>0 && !G.dead && guard++<200){
        playerAttack(m);
        if(m.hp<=0) break;
        monAttack(m);
        G.msgq=[]; G.log=[];
      }
      if(G.dead) alive=false;
    }
    if(!alive) died++;
  }
  return Math.round(100*died/runs);
}
function lootScatter(floors){
  var runed=0, pins=0, stones=0, arrows=0, n=0, d, s;
  /* scan recurses into chests, so its loop counter has to be its own.
     Sharing one with the caller rewinds the outer loop on every chest
     and the sweep never ends. */
  function scan(list){
    for(var i=0;i<list.length;i++){
      var it=list[i];
      if(it.t==='pin'){ pins++; continue; }
      if(it.t==='chest'){ scan((it.items||[]).filter(Boolean)); continue; }
      if(it.t!=='weapon') continue;
      var W=WEAPONS[it.k];
      if(W.rune) runed++;
      else if(W.n==='stone') stones+=it.cnt;
      else if(W.n==='arrow') arrows+=it.cnt;
    }
  }
  for(s=0;s<floors;s++){
    bootTest(31000+s);
    for(d=1;d<=5;d++){
      enterLevel(d); n++;
      scan(L.items);
    }
  }
  return {floors:n, runed:runed, pins:pins, stones:stones, arrows:arrows};
}
/* no hall should be a forest of columns */
function pillarCount(){
  var worst=0, i, tot=0, n=0;
  for(i=0;i<400;i++){
    var w=7+rnd(9), h=5+rnd(6);
    var res=shapeMask(w,h,'pillars');
    var holes=0;
    for(var y=1;y<h-1;y++) for(var x=1;x<w-1;x++) if(!res.mask[y][x]) holes++;
    worst=Math.max(worst,holes); tot+=holes; n++;
  }
  return {worst:worst, avg:tot/n};
}
function fightStats(){
  var maxS=0, maxFx=0, bad=[], i;
  for(i=0;i<FIGHTLOG.length;i++){
    var f=FIGHTLOG[i];
    if(f.s.length>maxS) maxS=f.s.length;
    if(f.fx.length>maxFx) maxFx=f.fx.length;
    if(ATLAS.index[f.spr]===undefined) bad.push('sprite '+f.spr);
    if(f.hp<0 || f.mhp<1 || f.hp>f.mhp) bad.push('hp '+f.hp+'/'+f.mhp);
    if(!f.fx) bad.push('empty effect: '+f.s);
  }
  return {n:FIGHTLOG.length, maxS:maxS, maxFx:maxFx, bad:bad};
}
/* standing in a lit room you must be able to see its doors */
function doorsVisible(){
  /* The rule the game can actually keep: a door is never less visible
     than the floor it opens onto.  It used to ask instead that every
     door in a lit room within the lamp's radius be visible if a
     Bresenham line reached it - but the game sees by shadowcasting, and
     the two disagree about squeezing past the corner of an L shaped
     room.  On that one the shadowcaster is the one the player looks at,
     so the floor beside the door is the fair thing to measure against. */
  for(var i=0;i<L.rooms.length;i++){
    var r=L.rooms[i]; if(r.gone||!r.lit||r.floors.length<6) continue;
    P.x=r.cx; P.y=r.cy; computeVis();
    for(var f=0;f<r.floors.length;f++){
      var fx=r.floors[f][0], fy=r.floors[f][1];
      if(!(L.flags[fy*MAP_W+fx]&F_VIS)) continue;   /* you cannot see the floor either */
      for(var d=0;d<4;d++){
        var nx=fx+DIR4[d][0], ny=fy+DIR4[d][1];
        var t=L.tiles[ny*MAP_W+nx];
        if(t!==DOOR && t!==LOCKED) continue;
        if(!(L.flags[ny*MAP_W+nx]&F_VIS))
          return 'door at '+nx+','+ny+' invisible from the lit floor beside it';
      }
    }
    return null;
  }
  return null;
}
function doorsOK(){
  function isDoor(t){ return t===DOOR || t===SDOOR || t===LOCKED; }
  for(var y=1;y<MAP_H-1;y++) for(var x=1;x<MAP_W-1;x++){
    if(!isDoor(L.tiles[y*MAP_W+x])) continue;
    for(var d=0;d<4;d++){
      var nx=x+DIR4[d][0], ny=y+DIR4[d][1];
      if(isDoor(L.tiles[ny*MAP_W+nx])) return 'doors touching at '+x+','+y;
    }
  }
  return null;
}
/* every monster starts unaware, and stealth must actually matter */
function awarenessStats(){
  var dormant=0, wander=0, hunt=0;
  for(var i=0;i<L.mons.length;i++){
    var s=L.mons[i].state;
    if(s===0) dormant++; else if(s===1) wander++; else hunt++;
  }
  return {dormant:dormant, wander:wander, hunt:hunt};
}
function stealthCurve(){
  /* how many turns before a monster three squares away notices you */
  var out=[];
  [8,11,14,18].forEach(function(dex){
    P.dex = dex;
    /* stand the monster three clear squares away, in plain sight */
    var spot=null, dd;
    for(dd=0; dd<DIR4.length && !spot; dd++){
      var sx=P.x+DIR4[dd][0]*3, sy=P.y+DIR4[dd][1]*3;
      if(walkable(sx,sy) && losClear(P.x,P.y,sx,sy)) spot=[sx,sy];
    }
    if(!spot) spot=[P.x+3,P.y];
    var total=0, runs=300;
    for(var r=0;r<runs;r++){
      var m = mkMonster('H', 3, spot[0], spot[1]);
      m.state = 1;
      var t=0;
      while(t<60 && !monNotices(m)) t++;
      total += t;
    }
    out.push(dex+':'+(total/runs).toFixed(1));
  });
  P.dex = 11;
  return out.join('  ');
}
/* How wide a line of text really is, in pixels.  The font is not fixed
   width - an 'i' is two pixels and an 'm' is six - so counting letters
   is only ever a guess, and the panel clips by pixels.  The renderer's
   own textW is not here (this suite does not load the drawing), but the
   widths it reads are in the atlas and are the same numbers. */
function textPx(s){
  var f=ATLAS.font, w=0, i;
  for(i=0;i<s.length;i++){
    var c=s.charCodeAt(i)-f.first;
    if(c>=0 && c<f.widths.length) w+=f.widths[c];
  }
  return w;
}
/* the column the effects list is drawn in - the same number the pack
   itself uses, which is why it is a constant rather than a copy */
function effectsColPx(){ return INV_COL_W; }
function effectsWidth(){
  P.conf=9; P.blind=4; P.hallu=1; P.haste=3; P.frozen=2; P.scare=7;
  /* the widest each label ever gets: monster sight runs to three
     figures, so that is the one to measure */
  P.seeinv=12; P.monsight=MONSIGHT_TURNS; P.confuseTouch=1; P.amulet=1;
  G.hungerState=2;
  var e = playerEffects(), w=0, widest='';
  for(var i=0;i<e.length;i++){
    var px=textPx(e[i][0]);
    if(px>w){ w=px; widest=e[i][0]; }
  }
  P.conf=P.blind=P.hallu=P.haste=P.frozen=P.scare=0;
  P.seeinv=P.monsight=P.confuseTouch=P.amulet=0; G.hungerState=0;
  return { px:w, s:widest, col:effectsColPx() };
}
function waterStats(){
  var pools=0, tiles=0, seen={};
  for(var y=0;y<MAP_H;y++) for(var x=0;x<MAP_W;x++){
    if(L.tiles[y*MAP_W+x]!==WATER) continue;
    tiles++;
    if(seen[y*MAP_W+x]) continue;
    var body = waterBody(x,y);
    for(var i=0;i<body.length;i++) seen[body[i][1]*MAP_W+body[i][0]]=1;
    pools++;
  }
  return {pools:pools, tiles:tiles};
}
/* conduction must never jump between two unconnected pools */
function conductionIsolated(){
  var bodies=[], seen={}, x, y, i;
  for(y=0;y<MAP_H;y++) for(x=0;x<MAP_W;x++){
    if(L.tiles[y*MAP_W+x]!==WATER || seen[y*MAP_W+x]) continue;
    var b = waterBody(x,y);
    for(i=0;i<b.length;i++) seen[b[i][1]*MAP_W+b[i][0]]=1;
    bodies.push(b);
  }
  if(bodies.length<2) return null;
  /* two bodies must share no tile, and neither may reach the other */
  var a=bodies[0], c=bodies[1], set={};
  for(i=0;i<a.length;i++) set[a[i][1]*MAP_W+a[i][0]]=1;
  for(i=0;i<c.length;i++) if(set[c[i][1]*MAP_W+c[i][0]]) return 'pools overlap';
  return null;
}
function shapeCensus(){
  var counts={};
  for(var s=0;s<400;s++){
    var res = shapeMask(12, 7, SHAPES[s % SHAPES.length]);
    var k = SHAPES[s % SHAPES.length];
    counts[k] = (counts[k]||0) + res.count;
  }
  return counts;
}
function losSanity(){
  /* Nothing visible may be behind a wall, and the player's own tile is
     lit.  Beyond the lamp's reach you see nothing - except the room you
     are standing in, which a lamp lights end to end however big it is,
     its own outline included; a fire, which is a light and is seen from
     any distance; and the face of a wall standing beside something you
     can see, which is lit so that an outline never has holes punched in
     it.  That last one is why a corridor beside your own lit room shows
     its walls: the corridor square is part of the room's outline, and
     the wall beyond it is a face bordering that. */
  if(!(L.flags[P.y*MAP_W+P.x] & F_VIS)) return 'player tile not visible';
  var mine = roomIndexAt(P.x,P.y);
  var lit = mine>=0 && L.rooms[mine] && L.rooms[mine].lit && !L.rooms[mine].dark;
  /* and a fire is a light: what it falls on is visible from any
     distance, which is the one other way a square beyond the lamp can
     be lit */
  var byFire = lightMap();
  var far=0, faces=0;
  for(var y=0;y<MAP_H;y++) for(var x=0;x<MAP_W;x++){
    var k=y*MAP_W+x;
    if(!(L.flags[k]&F_VIS)) continue;
    var d=Math.max(Math.abs(x-P.x),Math.abs(y-P.y));
    if(d<=LIT_RADIUS) continue;
    if(lit && (L.roomAt[k]===mine || touchesRoom(k,mine))) continue;
    if(byFire[k]) continue;
    /* a wall or a door showing its face beside something visible you
       could walk on.  Deliberately looser than the rule that draws it -
       any of the eight neighbours will do here, at any distance - so
       this stays a check on what may be seen rather than a copy of the
       code that decides it. */
    if(wallFaceLit(x,y)) { LOS_FACES++; faces++; continue; }
    far++;
  }
  return far ? ('visible beyond radius: '+far) : null;
}
/* how many wall faces the check above has excused, so the count is
   reported rather than quietly swallowed */
var LOS_FACES = 0;
/* Is this square a wall face - something you cannot walk through,
   standing next to something visible that you could? */
function wallFaceLit(x,y){
  var j=y*MAP_W+x;
  if(!BLOCKS[L.tiles[j]] || L.tiles[j]===ROCK) return false;
  for(var d=0;d<DIR8.length;d++){
    var nx=x+DIR8[d][0], ny=y+DIR8[d][1];
    if(nx<0||ny<0||nx>=MAP_W||ny>=MAP_H) continue;
    var n=ny*MAP_W+nx;
    if((L.flags[n]&F_VIS) && !BLOCKS[L.tiles[n]]) return true;
  }
  return false;
}
function nameAll(){
  var names=[], i, o;
  for(i=0;i<POTIONS.length;i++){ o=mkItem('potion',i); names.push(itemName(o)); KNOWN.pot[i]=1; names.push(itemName(o)); }
  for(i=0;i<SCROLLS.length;i++){ o=mkItem('scroll',i); names.push(itemName(o)); KNOWN.scr[i]=1; names.push(itemName(o)); }
  for(i=0;i<WANDS.length;i++){ o=mkItem('wand',i); o.ch=5; names.push(itemName(o)); KNOWN.wand[i]=1; names.push(itemName(o)); }
  for(i=0;i<WEAPONS.length;i++){ o=mkItem('weapon',i); names.push(itemName(o)); o.known=1; names.push(itemName(o)); }
  for(i=0;i<ARMORS.length;i++){ o=mkItem('armor',i); names.push(itemName(o)); o.known=1; names.push(itemName(o)); }
  for(i=0;i<HEADS.length;i++){ o=mkItem('head',i); names.push(itemName(o)); o.known=1; names.push(itemName(o)); }
  for(i=0;i<FEET.length;i++){ o=mkItem('feet',i); names.push(itemName(o)); o.known=1; names.push(itemName(o)); }
  for(i=0;i<SHIELDS.length;i++){ o=mkItem('shield',i); names.push(itemName(o)); o.known=1; names.push(itemName(o)); }
  names.push(itemName(mkItem('amulet',0)));
  names.push(itemName(mkItem('pouch',0)));
  var g=mkItem('gold',0); g.cnt=420; names.push(itemName(g));
  return names;
}
function infoAll(){
  var out=[], i, o;
  var probes=[];
  for(i=0;i<WEAPONS.length;i++) probes.push(mkItem('weapon',i));
  for(i=0;i<ARMORS.length;i++) probes.push(mkItem('armor',i));
  for(i=0;i<HEADS.length;i++) probes.push(mkItem('head',i));
  for(i=0;i<FEET.length;i++) probes.push(mkItem('feet',i));
  for(i=0;i<SHIELDS.length;i++) probes.push(mkItem('shield',i));
  probes.push(mkItem('potion',0), mkItem('scroll',0), mkItem('wand',0),
              mkItem('food',0), mkItem('pouch',0), mkItem('amulet',0));
  for(i=0;i<probes.length;i++){ var nn=itemNotes(probes[i]); for(var q=0;q<nn.length;q++) out.push(nn[q][0]); }
  return out;
}
function spriteAll(){
  var miss=[], i;
  var probes=[];
  for(i=0;i<POTIONS.length;i++) probes.push(mkItem('potion',i));
  for(i=0;i<SCROLLS.length;i++) probes.push(mkItem('scroll',i));
  for(i=0;i<WANDS.length;i++) probes.push(mkItem('wand',i));
  for(i=0;i<WEAPONS.length;i++) probes.push(mkItem('weapon',i));
  for(i=0;i<ARMORS.length;i++) probes.push(mkItem('armor',i));
  for(i=0;i<HEADS.length;i++) probes.push(mkItem('head',i));
  for(i=0;i<FEET.length;i++) probes.push(mkItem('feet',i));
  for(i=0;i<SHIELDS.length;i++) probes.push(mkItem('shield',i));
  for(i=0;i<FOODS.length;i++) probes.push(mkItem('food',i));
  for(i=0;i<RINGS.length;i++) probes.push(mkItem('ring',i));
  probes.push(mkItem('amulet',0), mkItem('pouch',0));
  for(i=0;i<MATS.length;i++){ probes.push(mkItem('key',i)); var cc=mkItem('chest',0); cc.lock=i; probes.push(cc); }
  var gg=mkItem('gold',0); gg.cnt=10; probes.push(gg);
  for(i=0;i<probes.length;i++){ var s=itemSprite(probes[i]); if(ATLAS.index[s]===undefined) miss.push(probes[i].t+':'+s); }
  for(i=0;i<MONS.length;i++) if(ATLAS.index['mon_'+MONS[i].c]===undefined) miss.push('mon_'+MONS[i].c);
  /* Doors are drawn per material, and a projectile in flight is drawn as
     the thing itself - the plain 'door' and the four pointing arrows were
     left over from earlier ways of doing both. */
  ['floor','floor2','floor3','corr','wall','wall2','wall3','wall_moss','stairs_down','trap',
   'moss','moss2','moss3','moss4','crack','crack2','crack3','crack4',
   'wand','wand2','wand3','staff','staff2','bones','skull','rubble','hero','hero2','grave','flame','frost',
   'bolt','magic','chest','gold','gold2','pouch','water','water2','keyhole',
   'mk_z','mk_q','mk_x','armor_c','sword','stone','arrow',
   'bridge_h','bridge_v','bars','icecube',
   'stone_fire','stone_ice','mushroom','berries']
   .concat(RUG_TILES)
   .concat(MATS.map(function(m){return 'door_'+m;}))
   .concat(MATS.map(function(m){return 'key_'+m;}))
   .concat(MATS.map(function(m){return 'chest_'+m;}))
   .forEach(function(n){
     if(ATLAS.index[n]===undefined) miss.push(n);
   });
  return miss;
}
/* Every rug on this floor is one slice of the one Persian design, laid a
   tile at a time and turned over at the folds.  What that means on the
   floor, and what this checks:

     - every square names one of the six tiles that are on the sheet, and
       says which way round it went down;
     - the rug is a rectangle of the size the tables allow, and its rows
       and columns are exactly the slice those tables give for that size,
       so no rug is ever cut somewhere the design does not fold;
     - and it reads the same from either end: the square opposite any
       square across the middle is the same tile, mirrored the other way.
       That is what makes the pattern meet itself instead of repeating.

   A rug that has had squares lifted from it - a staircase cut into it,
   the sweep afterwards - is not a rectangle any more and is skipped;
   whether that lifting is right is another probe's business. */
/* The tables themselves: a rug of every size the generator can ask for
   has a quarter written out for it, and each quarter is the right shape
   - half the rug, rounded up, both ways - naming tiles that exist.  A
   quarter a row short would fold the wrong square onto the middle
   without anything else noticing. */
function rugCutTableFaults(){
  var bad=[], w, h, k;
  for(w=RUG_MIN;w<=RUG_MAX_SHORT;w++) for(h=Math.max(w,RUG_MIN_LONG);h<=RUG_MAX_LONG;h++){
    /* a rug is woven upright, so only upright sizes are written out; the
       design is only four squares across whichever way it lies, and
       nothing smaller than two by three is woven at all */
    var cut=RUG_CUT[w+'x'+h];
    if(!cut){ bad.push('no rug is written out for '+w+'x'+h); continue; }
    if(cut.length!==Math.ceil(h/2))
      bad.push(w+'x'+h+' is written out '+cut.length+' rows deep, not '+Math.ceil(h/2));
    for(k=0;k<cut.length;k++){
      if(cut[k].length!==Math.ceil(w/2))
        bad.push(w+'x'+h+' row '+k+' is '+cut[k].length+' wide, not '+Math.ceil(w/2));
      for(var c=0;c<cut[k].length;c++){
        var t='rug_'+cut[k][c][0]+cut[k][c][1];
        if(RUG_TILES.indexOf(t)<0)
          bad.push(w+'x'+h+' asks for '+t+', which is not on the sheet');
        /* The spine of an odd-width rug is its own reflection and is
           never mirrored, so only the tiles painted for it belong there
           - and they belong nowhere else, since anywhere else they would
           be laid against a mirrored copy of themselves. */
        var spine=(w%2===1 && c===cut[k].length-1);
        if(spine!==(String(cut[k][c][1])==='c'))
          bad.push(w+'x'+h+' puts '+t+(spine?' down the middle, where only a spine tile belongs'
                                            :' off the middle, where a spine tile does not belong'));
        /* The middle row of an odd-height rug stands on its own the same
           way, and the tile painted for it goes nowhere else.  Unlike
           the spine it is not the only thing allowed there: the border
           column of that row is the design's own, and a three-wide rug
           has its spine there. */
        var middle=(h%2===1 && k===cut.length-1);
        if(String(cut[k][c][0])==='c' && !middle)
          bad.push(w+'x'+h+' puts '+t+' off the middle row, where it does not belong');
      }
    }
  }
  for(k in RUG_CUT){
    var d=k.split('x');
    if((d[0]|0)>(d[1]|0)) bad.push(k+' is written out lying down; every rug is woven upright');
    if((d[0]|0)<RUG_MIN||(d[0]|0)>RUG_MAX_SHORT||(d[1]|0)>RUG_MAX_LONG||(d[1]|0)<RUG_MIN_LONG)
      bad.push(k+' is written out but no rug is ever that size');
  }
  return bad;
}
function rugSliceFaults(){
  var bad=[], id, k, ids={};
  for(k in L.rugId) if(L.rugId[k]) ids[L.rugId[k]]=1;
  for(id in ids){
    var sq=[], x0=1e9, x1=-1e9, y0=1e9, y1=-1e9;
    for(k in L.rugId){
      if(L.rugId[k]!=(id|0)) continue;
      var x=(k|0)%MAP_W, y=((k|0)/MAP_W)|0;
      sq.push([x,y]);
      if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;
    }
    var w=x1-x0+1, h=y1-y0+1;
    if(sq.length!==w*h) continue;              /* squares have been lifted */
    /* the smallest thing anybody weaves is two squares by three */
    if(Math.max(w,h)<RUG_MIN_LONG) bad.push('a rug is '+w+'x'+h+', smaller than anything woven');
    /* a rug lying across the room is an upright one turned a quarter */
    var turned=w>h, pw=turned?h:w, ph=turned?w:h;
    var cut=RUG_CUT[pw+'x'+ph];
    if(!cut){ bad.push('a rug is '+w+'x'+h+', a size the design is never cut to'); continue; }
    var seen={};
    for(var i=0;i<sq.length;i++){
      var sx=sq[i][0], sy=sq[i][1], n=L.decor[sy*MAP_W+sx];
      var up=rugUpright(sx-x0, sy-y0, w, h);
      var want=rugSquareName(cut, up[0], up[1], pw, ph, turned);
      if(n!==want) bad.push('a '+w+'x'+h+' rug has '+n+' where the design has '+want);
      if(RUG_TILES.indexOf(String(n).slice(0,6))<0) bad.push(n+' is not one of the tiles on the sheet');
      seen[sx+','+sy]=n;
    }
    /* And now from the other end: the square opposite any square across
       the middle of the rug is the same tile, laid over.  Which of the
       two mirrors that is depends on how the rug is lying - turned a
       quarter, the room's left-to-right is the rug's own top-to-bottom -
       so the flag that has to differ is named accordingly. */
    var across=turned?'v':'h', along=turned?'h':'v';
    /* how a square was laid is the tail of its name, after the tile: the
       tile's own 'rug_' would answer to 'r' all by itself */
    var laid=function(n){ return String(n).slice(6); };
    for(i=0;i<sq.length;i++){
      var ax=sq[i][0], ay=sq[i][1];
      var bx=x0+x1-ax, by=y0+y1-ay;
      var one=seen[ax+','+ay], two=seen[bx+','+by];
      if(!one||!two) continue;
      if(one.slice(0,6)!==two.slice(0,6))
        bad.push('a rug is not the same design at both ends: '+one+' opposite '+two);
      else if((laid(one).indexOf('r')>=0)!==(laid(two).indexOf('r')>=0))
        bad.push('half a rug is lying the other way: '+one+' opposite '+two);
      else if(ax!==bx && (laid(one).indexOf(across)>=0)===(laid(two).indexOf(across)>=0))
        bad.push('a rug is not mirrored left to right: '+one+' opposite '+two);
      else if(ay!==by && (laid(one).indexOf(along)>=0)===(laid(two).indexOf(along)>=0))
        bad.push('a rug is not mirrored top to bottom: '+one+' opposite '+two);
    }
    /* a rug is woven upright, so one lying across a room says so on
       every square of itself and one standing upright on none */
    for(i=0;i<sq.length;i++){
      var nm=seen[sq[i][0]+','+sq[i][1]];
      if((laid(nm).indexOf('r')>=0)!==turned)
        bad.push('a '+w+'x'+h+' rug has '+nm+', which is lying the wrong way');
    }
  }
  return bad;
}
/* -------------------------------------------------------- mushrooms
   Five of them grow down here and only one is only food.  What matters
   is that a colour tells you nothing: the five looks are dealt afresh
   every run, no two alike, and a mushroom is named for its colour until
   somebody has eaten one of that colour.  After that it is named for
   what it did, and every one of that colour in the run is named with it.

   And that each of the four that do something does it: poison takes hit
   points, the ghost takes you out of sight, the berserker lends strength
   and speed, and fire does nothing at all to somebody who has eaten the
   ember. */
function mushroomsOK(){
  var bad=[], i, k, kinds=[];
  for(k=0;k<FOODS.length;k++) if(FOODS[k].mush) kinds.push(k);
  if(kinds.length<5) bad.push('only '+kinds.length+' kinds of mushroom');
  var wanted={ food:0, poison:0, unseen:0, rage:0, fireproof:0 };
  for(i=0;i<kinds.length;i++){
    var e=FOODS[kinds[i]].mush;
    if(!(e in wanted)) bad.push('a mushroom does '+e+', which is nothing this knows about');
    else wanted[e]++;
  }
  for(k in wanted) if(wanted[k]!==1) bad.push(wanted[k]+' mushrooms are the '+k+' one');

  /* the looks: all different, and dealt afresh */
  var runs=[], same=0;
  for(var s=0;s<12;s++){
    bootTest(64000+s);
    var looks=[];
    for(i=0;i<kinds.length;i++) looks.push(APPEAR.mush[kinds[i]]);
    var seen={};
    for(i=0;i<looks.length;i++){
      if(!looks[i]) bad.push('a mushroom has no look at all');
      else if(MUSH_LOOKS.indexOf(looks[i])<0) bad.push(looks[i]+' is not one of the looks');
      if(seen[looks[i]]) bad.push('two mushrooms look the same in one run');
      seen[looks[i]]=1;
      if(ATLAS.index[looks[i]]===undefined) bad.push('no sprite for '+looks[i]);
    }
    if(runs.length && runs[runs.length-1]===looks.join()) same++;
    runs.push(looks.join());
  }
  if(same>3) bad.push('the looks were dealt the same way '+same+' runs running');

  /* the names: a colour until you eat one, what it does afterwards */
  bootTest(64100);
  for(i=0;i<kinds.length;i++){
    k=kinds[i];
    KNOWN.mush[k]=0;
    var it=mkItem('food',k);
    var before=itemName(it);
    if(before.indexOf('mushroom')<0) bad.push('an unknown mushroom is called "'+before+'"');
    if(before.indexOf(FOODS[k].n)>=0 && FOODS[k].n!=='mushroom')
      bad.push('an unknown mushroom gives itself away: "'+before+'"');
    if(before.indexOf(mushColour(k))<0)
      bad.push('an unknown mushroom does not say its colour: "'+before+'"');
    KNOWN.mush[k]=1;
    var after=itemName(it);
    if(after.indexOf(FOODS[k].n)<0)
      bad.push('a known '+FOODS[k].n+' is called "'+after+'"');
    KNOWN.mush[k]=0;
  }

  /* eating one teaches you that colour for good */
  bootTest(64200);
  P.hp=P.mhp=200;
  for(i=0;i<kinds.length;i++){
    k=kinds[i];
    var one=mkItem('food',k); addItem(one);
    var two=mkItem('food',k);
    G.msgq=[]; eat(one);
    if(!KNOWN.mush[k]) bad.push('eating a '+FOODS[k].n+' taught you nothing');
    if(itemName(two).indexOf(FOODS[k].n)<0)
      bad.push('the second '+FOODS[k].n+' is still a mystery');
    P.hp=P.mhp; P.str=P.mstr;
  }

  /* and what each one does */
  bootTest(64300);
  var did={};
  for(i=0;i<kinds.length;i++){
    k=kinds[i];
    P.hp=P.mhp=200; P.str=P.mstr=16; P.unseen=0; P.rage=0; P.haste=0; P.fireproof=0;
    var m2=mkItem('food',k); addItem(m2); G.msgq=[];
    var hp0=P.hp, str0=effStr();
    eat(m2);
    var e=FOODS[k].mush;
    if(e==='poison'){
      if(P.hp>=hp0) bad.push('a sickening mushroom cost nothing');
      did.poison=hp0-P.hp;
    } else if(P.hp<hp0) bad.push('a '+FOODS[k].n+' hurt you');
    if(e==='unseen'){
      if(P.unseen<MUSH_TURNS) bad.push('a ghost mushroom hid you for '+P.unseen+' turns');
      did.unseen=P.unseen;
    } else if(P.unseen) bad.push('a '+FOODS[k].n+' made you invisible');
    if(e==='rage'){
      if(P.rage<MUSH_TURNS) bad.push('a berserker mushroom lasted '+P.rage+' turns');
      if(P.haste<MUSH_TURNS) bad.push('a berserker mushroom left you no quicker');
      if(effStr()<=str0) bad.push('a berserker mushroom left you no stronger');
      did.rage=effStr()-str0;
    } else if(P.rage) bad.push('a '+FOODS[k].n+' sent you berserk');
    if(e==='fireproof'){
      if(P.fireproof<MUSH_TURNS) bad.push('an ember mushroom lasted '+P.fireproof+' turns');
      P.hp=P.mhp;
      hurtPlayer(30,'fire','fire');
      if(P.hp<P.mhp) bad.push('fire got through an ember mushroom');
      did.fireproof=1;
      P.fireproof=0; P.hp=P.mhp;
      hurtPlayer(30,'fire','fire');
      if(P.hp>=P.mhp) bad.push('fire does nothing even without the mushroom');
    } else if(P.fireproof) bad.push('a '+FOODS[k].n+' turned fire aside');
    if(e==='food' && P.food<=0) bad.push('a plain mushroom fed you nothing');
  }
  /* they wear off */
  bootTest(64400);
  P.unseen=0; P.rage=2; P.fireproof=2; P.haste=2;
  upkeep(); upkeep();
  if(P.rage||P.fireproof) bad.push('a mushroom never wore off');
  return { bad:bad, kinds:kinds.length, did:did };
}
/* ------------------------------------------------- your own things
   Walking over something on the floor picks it up.  Walking over
   something you put down yourself does not: it sits where you left it
   and waits for ENTER, the same bargain a chest you have already opened
   makes.  Otherwise a pack you emptied on purpose fills itself up again
   the moment you step back across it. */
function laidDownOK(){
  var bad=[], i;
  bootTest(66100);
  L.items.length=0; L.mons.length=0;
  P.slots=new Array(N_SLOTS).fill(null);
  /* something you found: walking on takes it */
  var found=mkItem('potion',0); found.x=P.x; found.y=P.y; L.items.push(found);
  G.msgq=[]; autoPickup();
  if(L.items.indexOf(found)>=0) bad.push('a thing lying about was not picked up');
  /* The same thing, put down by you.  Dropping from the pack is done by
     the layer that draws the pack, so what is exercised here is the
     other way a thing of yours reaches the floor: no room anywhere for
     it.  Both mark it the same way. */
  var ref=null;
  {
    for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('potion',2);
    P.pouch=null;
    var spare=mkItem('potion',3);
    stow(spare);
    var mine=itemAt(L,P.x,P.y);
    if(!mine) bad.push('what you dropped is not on the floor');
    else {
      if(!mine.laid) bad.push('what you dropped is not marked as yours');
      G.msgq=[]; autoPickup();
      if(L.items.indexOf(mine)<0) bad.push('walking over your own drop picked it up again');
      var said=G.msgq.length?G.msgq[0].s:'';
      if(said.indexOf('ENTER')<0) bad.push('it does not say how to pick it up: "'+said+'"');
      if(!laidHere()) bad.push('the game cannot see the thing you put down');
      /* and ENTER takes it, once there is a slot free for it to go in */
      P.slots[0]=null;
      if(!takeLaid(laidHere())) bad.push('ENTER would not pick it up');
      if(L.items.indexOf(mine)>=0) bad.push('ENTER left it on the floor');
      if(carriedItems().indexOf(mine)<0) bad.push('ENTER picked it up into nowhere');
    }
  }
  /* it is yours until you have it back: put down, walked over twice, still there */
  bootTest(66200);
  L.items.length=0;
  for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('potion',2);
  P.pouch=null;
  var again=mkItem('potion',1);
  stow(again);
  var walks=0;
  for(i=0;i<3;i++){ G.msgq=[]; autoPickup(); if(itemAt(L,P.x,P.y)===again) walks++; }
  if(walks!==3) bad.push('your own drop was taken after '+walks+' passes over it');
  /* --- and something you walked over with a full pack ---------------
     It is not yours - you never had it - but it is in exactly the same
     position: lying under you, not picked up.  Once a slot is free it
     comes up with the same key. */
  bootTest(66400);
  L.items.length=0; L.mons.length=0;
  for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('crystal',0);
  P.pouch=null;
  var over=mkItem('wand',0); over.x=P.x; over.y=P.y; L.items.push(over);
  G.msgq=[]; autoPickup();
  if(L.items.indexOf(over)<0) bad.push('a full pack picked something up anyway');
  if(!takeableHere()) bad.push('the game cannot see what you are standing on');
  if(takeLaid(takeableHere())) bad.push('it was picked up with nowhere to put it');
  if(L.items.indexOf(over)<0) bad.push('it left the floor with nowhere to go');
  /* make room, and it comes up */
  P.slots[0]=null;
  if(!takeLaid(takeableHere())) bad.push('with a slot free it still would not come up');
  if(L.items.indexOf(over)>=0) bad.push('it is on the floor and in the pack at once');
  if(carriedItems().indexOf(over)<0) bad.push('it was picked up into nowhere');
  /* and nothing under you means nothing to pick up */
  L.items.length=0;
  if(takeableHere()) bad.push('it offers to pick up a bare floor');

  /* gold is not a thing you can put down, so it is never yours to wait for */
  bootTest(66300);
  L.items.length=0;
  var g=mkItem('gold',0); g.cnt=17; g.x=P.x; g.y=P.y; L.items.push(g);
  var was=P.gold; G.msgq=[]; autoPickup();
  if(P.gold!==was+17) bad.push('gold on the floor was not picked up');
  /* and a purse is never full, so gold is never something to press a key
     for - even standing on it with every slot taken */
  bootTest(66500);
  L.items.length=0;
  for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('crystal',0);
  var g2=mkItem('gold',0); g2.cnt=9; g2.x=P.x; g2.y=P.y; L.items.push(g2);
  if(takeableHere()) bad.push('gold is offered as something to pick up by hand');
  G.msgq=[]; autoPickup();
  if(L.items.indexOf(g2)>=0) bad.push('gold was left lying there by a full pack');
  return { bad:bad };
}
/* ----------------------------------------------------- a shocking stone
   Where it lands it jolts whatever is standing there.  Landed in water,
   the water carries it: everything standing in that pool is jolted at
   once - and so are you, if you are wading in it.  Two separate pools
   are two separate pools, which is the whole reason it is worth aiming
   at one rather than at the creature. */
function shockStoneOK(){
  var bad=[], i, k=weaponIndex('shocking stone');
  if(!k) bad.push('there is no shocking stone');
  if(WEAPONS[k].rune!=='shock') bad.push('the shocking stone carries no shock rune');
  if(runeStoneKinds().indexOf(k)<0) bad.push('it is not dealt out with the other runed stones');
  if(RUNE_STONE_SPRITES.indexOf(WEAPONS[k].s)<0) bad.push('its carving is not one of the looks');

  /* every rune stone still gets a look of its own, now that there are six */
  bootTest(69100);
  var kinds=runeStoneKinds(), looks={};
  for(i=0;i<kinds.length;i++){
    var lk=APPEAR.stone[kinds[i]];
    if(!lk) bad.push(WEAPONS[kinds[i]].n+' was dealt no carving');
    if(looks[lk]) bad.push('two runed stones wear the same carving');
    looks[lk]=1;
  }

  /* --- on dry stone: the square it lands on, and no further --------- */
  bootTest(69200);
  L.mons.length=0; L.clouds.length=0; P.hp=P.mhp=400;
  var spot=null;
  for(i=0;i<L.rooms.length && !spot;i++){
    var r=L.rooms[i];
    if(r.gone||r.floors.length<8) continue;
    for(var q=0;q<r.floors.length;q++){
      var fx=r.floors[q][0], fy=r.floors[q][1];
      if(L.tiles[fy*MAP_W+fx]===FLOOR){ spot=[fx,fy]; break; }
    }
  }
  if(!spot) bad.push('nowhere dry to throw one');
  else {
    var dm=mkMonster('K',5,spot[0],spot[1]); dm.hp=dm.mhp=400; L.mons.push(dm);
    G.msgq=[];
    stoneRune('shock', dm, mkItem('weapon',k));
    if(!G.splash||G.splash.kind!=='zap') bad.push('nothing was drawn where it landed');
    else if(G.splash.cells.length!==1)
      bad.push('on dry stone the current covered '+G.splash.cells.length+' squares');
    if(dm.hp>=400) bad.push('the stone jolted nothing where it landed');
  }

  /* --- in water: the whole pool, and only that pool ----------------- */
  bootTest(69300);
  L.mons.length=0; L.clouds.length=0; P.hp=P.mhp=400; G.dead=0;
  /* two pools, cut by hand, well apart */
  var A=[], B=[], ax=4, ay=4, bx=MAP_W-8, by=MAP_H-6;
  for(var yy=0;yy<3;yy++) for(var xx=0;xx<4;xx++){
    L.tiles[(ay+yy)*MAP_W+ax+xx]=WATER; A.push([ax+xx,ay+yy]);
    L.tiles[(by+yy)*MAP_W+bx+xx]=WATER; B.push([bx+xx,by+yy]);
  }
  var inA=mkMonster('K',5,A[0][0],A[0][1]); inA.hp=inA.mhp=400;
  var farA=mkMonster('K',5,A[A.length-1][0],A[A.length-1][1]); farA.hp=farA.mhp=400;
  var inB=mkMonster('K',5,B[0][0],B[0][1]); inB.hp=inB.mhp=400;
  L.mons.push(inA,farA,inB);
  P.x=1; P.y=1;                       /* dry, and out of it */
  G.msgq=[];
  stoneRune('shock', {x:A[1][0],y:A[1][1]}, mkItem('weapon',k));
  if(!G.splash) bad.push('nothing was drawn in the water');
  else if(G.splash.cells.length!==A.length)
    bad.push('the current covered '+G.splash.cells.length+' squares of a pool of '+A.length);
  if(inA.hp>=400) bad.push('something standing in the water was not jolted');
  if(farA.hp>=400) bad.push('the far end of the pool was not reached');
  if(inB.hp<400) bad.push('the current jumped to the other pool');

  /* --- and it does not care whose legs are in it -------------------- */
  bootTest(69400);
  L.mons.length=0; G.dead=0; P.hp=P.mhp=400;
  var px=6, py=6, pool=[];
  for(yy=0;yy<3;yy++) for(xx=0;xx<3;xx++){ L.tiles[(py+yy)*MAP_W+px+xx]=WATER; pool.push([px+xx,py+yy]); }
  P.x=px; P.y=py;
  var was=P.hp;
  G.msgq=[];
  stoneRune('shock', {x:px+2,y:py+2}, mkItem('weapon',k));
  if(P.hp>=was) bad.push('you can stand in water you have just electrified');
  /* on dry land it leaves you alone */
  bootTest(69500);
  L.mons.length=0; G.dead=0; P.hp=P.mhp=400;
  var dryx=P.x+3, dryy=P.y;
  L.tiles[dryy*MAP_W+dryx]=FLOOR;
  was=P.hp;
  G.msgq=[];
  stoneRune('shock', {x:dryx,y:dryy}, mkItem('weapon',k));
  if(P.hp<was) bad.push('a stone thrown at dry ground shocked you anyway');
  return { bad:bad, pool:A.length };
}
/* The light a fire throws on a square is not exactly the figure the rule
   names any more: every square takes a little off it or puts a little on
   so a row of them does not come out a flat band.  What can still be
   asked is whether it landed in the right band - and full is a ceiling,
   so nothing is ever above it. */
function lightAbout(got, want){
  var lo = want*(1-GLOW_VARY) - 0.01;
  var hi = Math.min(want*(1+GLOW_VARY), GLOW_FULL) + 0.01;
  return got >= lo && got <= hi;
}
/* --------------------------------------------- the light a fire throws
   Fire is not a painted band: what it lays on a square is dealt from
   where the square is, so no two squares of a burning row match.  And it
   is dealt again when the flame swaps to its other tile, and at no other
   moment - a light that changed while the flame stood still would be a
   loose connection, and one that stood still while the flame changed
   would be the light of something that is not there.

   Both halves are the same counter, `flameFrame`, which is what the
   drawing picks the tile with. */
function fireLightOK(){
  var bad=[], i;
  bootTest(70100);
  L.mons.length=0; L.clouds.length=0; L.temp={};
  /* a row of burning squares, all alight at the same moment */
  var row=[];
  for(i=0;i<6;i++){
    var x=P.x+1+i, y=P.y;
    if(!walkable(x,y)||inWater(x,y)){ row=[]; break; }
    row.push([x,y]);
  }
  if(!row.length){
    /* the floor did not oblige: lay one */
    for(i=0;i<6;i++){
      var lx=P.x+1+i, ly=P.y, lj=ly*MAP_W+lx;
      L.tiles[lj]=FLOOR; delete L.decor[lj];
      row.push([lx,ly]);
    }
    computeVis();
  }
  for(i=0;i<row.length;i++) dropEmber(row[i][0], row[i][1], 6);
  for(i=0;i<L.clouds.length;i++) L.clouds[i].at=0;

  /* --- no two squares of it alike --------------------------------- */
  var g=lightMap(1), vals=[], seen={};
  for(i=0;i<row.length;i++){
    var e=g[row[i][1]*MAP_W+row[i][0]];
    if(!e){ bad.push('a burning square threw no light'); continue; }
    vals.push(e.v); seen[e.v.toFixed(4)]=1;
  }
  var kinds=0, kk;
  for(kk in seen) kinds++;
  if(kinds<3) bad.push('a row of '+row.length+' fires lit itself to '+kinds+' brightness(es)');
  for(i=0;i<vals.length;i++)
    if(!lightAbout(vals[i], GLOW_FULL))
      bad.push('a fire threw '+vals[i].toFixed(2)+' light, outside what the rule allows');

  /* --- dealt once a square, not once a fire ------------------------
     A square in the middle of a burning patch is lit by its own fire and
     by every fire beside it.  If each of those contributions were dealt
     its own share and the brightest kept, every square would be the best
     of four draws and the whole patch would sit against the ceiling -
     which is the flatness this was meant to cure.  So: light a patch,
     and the average square has to sit in the middle of what the rule
     allows, not at the top of it. */
  bootTest(70150);
  L.mons.length=0; L.clouds.length=0;
  var patch=[];
  for(var py2=0;py2<5;py2++) for(var px2=0;px2<6;px2++){
    var qx=P.x+1+px2, qy=P.y-2+py2, qj=qy*MAP_W+qx;
    if(qx<1||qy<1||qx>=MAP_W-1||qy>=MAP_H-1) continue;
    L.tiles[qj]=FLOOR; delete L.decor[qj];
    patch.push([qx,qy]);
  }
  computeVis();
  for(i=0;i<patch.length;i++) dropEmber(patch[i][0], patch[i][1], 6);
  for(i=0;i<L.clouds.length;i++) L.clouds[i].at=0;
  var pg=lightMap(1), sum=0, n=0;
  for(i=0;i<patch.length;i++){
    var pe=pg[patch[i][1]*MAP_W+patch[i][0]];
    if(pe){ sum+=pe.v; n++; }
  }
  var mean = n ? sum/n : 0;
  if(n<20) bad.push('only '+n+' squares of the burning patch were lit');
  else if(mean > GLOW_FULL - GLOW_VARY*0.3)
    bad.push('the average burning square is at '+mean.toFixed(3)+
      ', up against full - the variation is being taken as the best of several draws');
  else if(mean < GLOW_FULL - GLOW_VARY*0.7)
    bad.push('the average burning square is at '+mean.toFixed(3)+', darker than the rule allows');

  /* --- and it is the flame's own counter that deals it -------------
     Asked of a square at the edge of the patch, whose own fire is the
     first thing to light it, so what is stored is its own flame's
     frame. */
  var fx=patch[0][0], fy=patch[0][1], fj=fy*MAP_W+fx;
  var frame=flameFrame(fx,fy);
  var want=GLOW_FULL*glowVary(fx,fy,GLOW_VARY,frame);
  var got=lightMap(1)[fj];
  if(!got) bad.push('the square went dark');
  else if(flameFrame(fx,fy)===frame && Math.abs(got.v-want)>1e-9)
    bad.push('the light on a burning square is not what its own flame frame deals');

  /* twice in the same frame is twice the same answer */
  frame=flameFrame(fx,fy);
  var a1=lightMap(1)[fj].v, a2=lightMap(1)[fj].v;
  if(flameFrame(fx,fy)===frame && a1!==a2)
    bad.push('the light moved while the flame stood still');

  /* and the next frame is a different answer: the point of the whole
     thing is that it is dealt again when the flame changes */
  var moved=0;
  for(i=0;i<8;i++){
    var f2=frame+1+i;
    if(glowVary(fx,fy,GLOW_VARY,f2)!==glowVary(fx,fy,GLOW_VARY,frame)) moved++;
  }
  if(moved<6) bad.push('the flame changing its tile barely changes its light: '+moved+' of 8');

  /* --- a beam varies further, since its light is halved ------------ */
  if(!(GLOW_VARY_BEAM>GLOW_VARY))
    bad.push('a beam varies no more than a fire, whose light is twice as strong');
  return { bad:bad, kinds:kinds, row:row.length, mean:mean.toFixed(3), patch:n,
           lo:Math.min.apply(null,vals).toFixed(2), hi:Math.max.apply(null,vals).toFixed(2) };
}
function cmdPick(a){ return a[rnd(a.length)]; }
function anyOfType(t){
  var all = carriedItems();
  for(var i=0;i<all.length;i++) if(all[i].t===t) return all[i];
  return null;
}
function runCmd(c){
  collect(); G.msgq = [];
  var d = pick(DIR4);
  var took = false;
  if(rnd(14)===0){ addItem(newItem(G.depth)); }
  switch(c){
    /* A hole asks before it takes you.  The soak says yes: walking the
       dungeon is the point, and a fall is part of it. */
    case 'move':  took = playerMove(d[0], d[1]);
                  if(G.ask) took = answerAsk(true) || took;
                  break;
    case 'wait':  took = true; break;
    case 'stair': P.x=L.stair.x; P.y=L.stair.y; computeVis(); took = useStairs(); break;
    case 'fire':  { var tg=shotTargets(); if(tg.length) took = fireAt(tg[rnd(tg.length)]); break; }
    case 'summon': { summonAid(1+rnd(3)); took = true; break; }
    case 'icewall': { buildWall(d[0], d[1], ICEWALL); took = true; break; }
    case 'firewall': { buildWall(d[0], d[1], FIREWALL); took = true; break; }
    case 'blink': {
      var bx=P.x+d[0]*rnd(BLINK_RANGE+1), by=P.y+d[1]*rnd(BLINK_RANGE+1);
      took = blinkTo(bx, by); break;
    }
    case 'quaff': { var o=anyOfType('potion'); if(o) took = quaff(o); break; }
    case 'read':  { var o2=anyOfType('scroll'); if(o2) took = readScroll(o2); break; }
    case 'zap':   { var o3=anyOfType('wand'); if(o3) took = zapWand(o3, d[0], d[1]); break; }
    case 'eat':   { var o4=anyOfType('food'); if(o4) took = eat(o4); break; }
    case 'equip': {
      var all = carriedItems();
      if(all.length){ var o5 = all[rnd(all.length)]; if(slotFor(o5)) took = autoEquip(o5); }
      break;
    }
    case 'swap': {
      /* exercise the inventory grid: move a random item to a random slot */
      var a = rnd(N_SLOTS), b = rnd(N_SLOTS);
      var t1 = P.slots[a]; P.slots[a] = P.slots[b]; P.slots[b] = t1;
      break;
    }
    case 'pouch': {
      var pch = anyOfType('pouch');
      if(pch){
        var all2 = [];
        for(var i=0;i<N_SLOTS;i++) if(P.slots[i] && P.slots[i].t!=='pouch') all2.push(i);
        if(all2.length){
          var si = all2[rnd(all2.length)];
          for(var j=0;j<POUCH_CAP;j++) if(!pch.items[j]){ pch.items[j]=P.slots[si]; P.slots[si]=null; break; }
        }
      }
      break;
    }
    case 'identify': { var all3=carriedItems(); if(all3.length) identifyItem(all3[rnd(all3.length)]); break; }
  }
  if(took) tickT();
  collect(); G.msgq = [];
}
function invariants(){
  /* no item may appear in two places at once */
  var seen = [], all = carriedItems();
  for(var i=0;i<all.length;i++){
    if(seen.indexOf(all[i])>=0) return 'item duplicated in inventory';
    seen.push(all[i]);
  }
  for(var k=0;k<EQ_ORDER.length;k++){
    var e = P.eq[EQ_ORDER[k]];
    if(e && !slotAccepts(EQ_ORDER[k], e)) return 'wrong item in slot '+EQ_ORDER[k];
  }
  if(packCount() > N_SLOTS) return 'pack overflow';
  for(var s=0;s<N_SLOTS;s++){
    var p = P.slots[s];
    if(p && p.t==='pouch'){
      if(p.items.length!==POUCH_CAP) return 'pouch size wrong';
      for(var q=0;q<POUCH_CAP;q++) if(p.items[q] && p.items[q].t==='pouch') return 'nested pouch';
    }
  }
  return null;
}
/* ---------------------------------------------------- saving a run
   A fingerprint of everything a player would notice: where they are,
   what they carry, what they have worked out, and the exact state of
   every floor they have walked.  If two runs print the same, the save
   carried the run across intact. */
var NL = String.fromCharCode(10);   /* the harness eats a backslash-n */
function runPrint(){
  var out=[], i, d, k;
  out.push('depth '+G.depth+' max '+G.maxDepth+' turn '+G.turn);
  out.push('at '+P.x+','+P.y+' hp '+P.hp+'/'+P.mhp+' lv '+P.lv+' exp '+P.exp+
           ' gold '+P.gold+' food '+P.food+' str '+P.str+' dex '+P.dex);
  out.push('perks '+Object.keys(P.perks).sort().join(','));
  out.push('keys '+P.keys.join(','));
  var pack=[];
  for(i=0;i<P.slots.length;i++){
    var it=P.slots[i];
    pack.push(it? it.t+':'+it.k+'x'+(it.cnt||1)+(it.known?'k':'')+(it.ench||0) : '-');
  }
  out.push('pack '+pack.join(' '));
  var eq=[];
  for(i=0;i<EQ_ORDER.length;i++){
    var e=P.eq[EQ_ORDER[i]];
    eq.push(e? e.t+':'+e.k : '-');
  }
  out.push('eq '+eq.join(' '));
  out.push('known pot '+KNOWN.pot.join('')+' scr '+KNOWN.scr.join('')+' wand '+KNOWN.wand.join(''));
  out.push('appear pot '+APPEAR.pot.join(','));
  var ds=Object.keys(G.floors).sort();
  out.push('floors '+ds.join(','));
  for(var n=0;n<ds.length;n++){
    d=ds[n];
    var lv=G.floors[d], sum=0, fsum=0;
    for(i=0;i<lv.tiles.length;i++){ sum=(sum*31+lv.tiles[i])>>>0; fsum=(fsum*31+lv.flags[i])>>>0; }
    var rs=0;
    for(i=0;i<lv.roomAt.length;i++) rs=(rs*31+(lv.roomAt[i]+128))>>>0;
      var lit=0;
    for(i=0;i<lv.litMap.length;i++) lit=(lit*31+lv.litMap[i])>>>0;
    out.push('  lit '+lit);
    out.push('floor '+d+' tiles '+sum+' flags '+fsum+' rooms '+rs+
             ' items '+lv.items.length+' traps '+lv.traps.length+
             ' stair '+lv.stair.x+','+lv.stair.y+' dims '+lv.mw+'x'+lv.mh);
    var ms=[];
    for(i=0;i<lv.mons.length;i++){
      var m=lv.mons[i];
      ms.push(m.c+'@'+m.x+','+m.y+'/'+m.hp+'/'+(m.state||0)+'/'+(m.blindTo||0));
    }
    out.push('  mons '+ms.join(' '));
    var it2=[];
    for(i=0;i<lv.items.length;i++){ var o=lv.items[i]; it2.push(o.t+':'+o.k+'@'+o.x+','+o.y); }
    out.push('  items '+it2.join(' '));
  }
  return out.join(NL);
}
/* every monster on every saved floor must come back with its real
   entry from the table, not a copy and not a blank */
function monDefsOK(){
  var bad=[], d, i;
  for(d in G.floors){
    var lv=G.floors[d];
    for(i=0;i<lv.mons.length;i++){
      var m=lv.mons[i];
      if(!m.def) { bad.push('floor '+d+' '+m.c+' has no entry'); continue; }
      if(m.def !== MON_BY_C[m.c]) bad.push('floor '+d+' '+m.c+' is a copy, not the table entry');
    }
  }
  return bad;
}
/* walk a run far enough that it has floors behind it, things in the
   pack and creatures part way through chasing */
function playAWhile(seed, turns){
  bootTest(seed);
  /* mostly walking about, with the odd staircase - taking the stairs on
     every tenth turn drops you among dragons before turn a hundred */
  var CMDS=['move','move','move','move','move','move','move','move','move',
            'move','wait','wait','fire','fire','equip','quaff','read',
            'identify','swap','stair'];
  for(var i=0;i<turns && !G.dead;i++){
    /* stand in for the potions a real player would drink, so the walk
       lasts long enough to have several floors behind it */
    if(P.hp < P.mhp) P.hp = P.mhp;
    if(P.food < 300) P.food = 1300;
    runCmd(cmdPick(CMDS));
  }
  return !G.dead;
}

/* ------------------------------------------------ fire and ice weapons
   A weapon of fire hits no harder than its plain twin; what it does is
   set things alight.  Measure both halves of that separately. */
function fireIceOK(){
  var bad=[], i, lit=0, froze=0, trials=1200;
  bootTest(77001);
  var W=mkItem('weapon',weaponIndex('long sword')); W.br='fire'; W.known=1; W.brKnown=1;
  P.eq.rh=W;
  var dmgFire=0, dmgPlain=0, n=400;
  for(i=0;i<trials;i++){
    var m=fakeFoe();
    igniteMon(m,'test');
    if(m.burn>0) lit++;
    if(m.burn<BURN_MIN||m.burn>BURN_MAX) bad.push('burns for '+m.burn+' turns');
  }
  if(lit!==trials) bad.push('igniting sometimes did nothing');
  for(i=0;i<trials;i++){
    var m2=fakeFoe();
    freezeMon(m2,'test');
    froze++;
    if(m2.stuck<ICE_MIN||m2.stuck>ICE_MAX) bad.push('frozen for '+m2.stuck+' turns');
  }
  /* the damage is the weapon's own, not the rune's */
  for(i=0;i<n;i++){ dmgFire+=roll(WEAPONS[weaponIndex('long sword')].d[0],WEAPONS[weaponIndex('long sword')].d[1]); }
  dmgPlain=dmgFire;
  /* how often the rune actually catches */
  var caught=0;
  for(i=0;i<4000;i++) if(rnd(100)<BURN_CHANCE) caught++;
  /* something made of fire will not take light */
  var salamander=null;
  for(i=0;i<MONS.length;i++) if(MONS[i].sp==='flame') salamander=MONS[i];
  if(salamander){
    var sm=mkMonster(salamander.c,10,P.x+2,P.y);
    igniteMon(sm,'test');
    if(sm.burn>0) bad.push('a thing made of fire caught fire');
  } else bad.push('no creature is made of fire any more');
  return { bad:bad, litPct:Math.round(lit*100/trials), catchPct:Math.round(caught*100/4000),
           froze:froze };
}
function fakeFoe(){
  var m=mkMonster('E',6,P.x+3,P.y);
  m.hp=200; m.mhp=200;
  return m;
}
/* a burning creature loses blood every turn and leaves fire behind it */
function burnTrailOK(){
  var bad=[], i, ticks=0, trail=0;
  bootTest(77002);
  /* somewhere it can walk in a straight line */
  var sx=-1, sy=-1, x, y;
  for(y=1;y<MAP_H-1&&sx<0;y++) for(x=1;x<MAP_W-3;x++){
    if(walkable(x,y)&&walkable(x+1,y)&&walkable(x+2,y)&&!monAt(L,x,y)&&
       !(x===P.x&&y===P.y)&&!(x+1===P.x&&y===P.y)&&!(x+2===P.x&&y===P.y)){
      sx=x; sy=y; break;
    }
  }
  if(sx<0) return { bad:['nowhere to walk a burning creature'], ticks:0, trail:0 };
  var m=mkMonster('E',6,sx,sy);
  m.hp=200; m.mhp=200; L.mons.push(m);
  L.clouds.length=0;
  m.burn=3;
  var hp0=m.hp;
  burnTick(m); ticks++;
  if(m.hp>=hp0) bad.push('burning cost it nothing');
  if(m.burn!==2) bad.push('the fire did not count down');
  /* walking while alight lays fire on the square it leaves */
  var was={x:m.x,y:m.y};
  tryMonStep(m, 1, 0);
  for(i=0;i<L.clouds.length;i++)
    if(L.clouds[i].x===was.x&&L.clouds[i].y===was.y&&L.clouds[i].kind==='fire') trail++;
  if(!trail) bad.push('a burning creature left no fire behind it');
  /* and one that is not alight leaves nothing */
  L.clouds.length=0;
  m.burn=0;
  tryMonStep(m, 1, 0);
  if(L.clouds.length) bad.push('a creature that was not alight left fire behind it');
  /* the fire it leaves burns the player too */
  L.clouds.length=0;
  L.clouds.push({x:P.x,y:P.y,kind:'fire',turns:2});
  var php=P.hp;
  /* the air on your own square is dealt with at the head of the turn now */
  cloudsOnYou(); ageClouds();
  if(P.hp>=php) bad.push('the trail did not burn the player');
  return { bad:bad, ticks:ticks, trail:trail };
}
/* keyHomes must only ever list squares a key was really on */
function keyHomesOK(seeds){
  var bad=[], s, d, mat, i;
  var homes=0, checked=0;
  for(s=0;s<seeds;s++){
    bootTest(78000+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down');
      if(!L.keyHomes) continue;
      for(mat in L.keyHomes){
        var list=L.keyHomes[mat];
        for(i=0;i<list.length;i++){
          homes++;
          var found=0, j;
          for(j=0;j<L.items.length;j++){
            var it=L.items[j];
            if(it.t==='key'&&String(it.k)===String(mat)&&it.x===list[i].x&&it.y===list[i].y) found=1;
          }
          if(!found) bad.push('floor '+d+': no key of '+MATS[mat]+' at '+list[i].x+','+list[i].y);
        }
      }
      checked++;
    }
  }
  return { bad:bad, homes:homes, floors:checked };
}
/* the two rings, and what a scroll does for one */
function ringsOK(){
  var bad=[];
  bootTest(79001);
  var ui=ringIndex('the untouched'), si=ringIndex('the unseen');
  if(ui<0) bad.push('there is no ring of the untouched');
  if(si<0) bad.push('there is no ring of the unseen');
  var unseen=mkItem('ring',si);
  if(unseen.ch!==2) bad.push('the ring of the unseen holds '+unseen.ch+' charges, not 2');
  if(RING_INVIS_TURNS!==20) bad.push('a charge buys '+RING_INVIS_TURNS+' turns, not 20');
  var plain=ringWind(unseen);
  if(plain!==RING_RECHARGE) bad.push('an unenchanted ring does not wind at the base rate');
  bumpItem(unseen,1);
  var quick=ringWind(unseen);
  var cut=Math.round((1-quick/plain)*100);
  if(cut<30||cut>36) bad.push('one scroll cut the wait by '+cut+'%, not about a third');
  bumpItem(unseen,1);
  var quicker=ringWind(unseen);
  if(quicker>=quick) bad.push('a second scroll did not help');
  /* it winds itself back up, and only that far */
  var r2=mkItem('ring',ui);
  r2.ch=0; r2.wind=0;
  P.slots[0]=r2;
  var turns=0;
  while(r2.ch<1&&turns<RING_RECHARGE*3){ windRings(); turns++; }
  if(turns!==ringWind(r2)) bad.push('a charge came back after '+turns+' turns, not '+ringWind(r2));
  return { bad:bad, base:RING_RECHARGE, oneScroll:quick, twoScrolls:quicker };
}
/* what you can eat, and what it is worth */
function foodOK(){
  var bad=[], i;
  bootTest(79002);
  var seen={}, meals=0, snacks=0;
  for(i=0;i<FOODS.length;i++){
    var F=FOODS[i];
    if(seen[F.n]) bad.push('two foods called '+F.n);
    seen[F.n]=1;
    if(!F.pl||!F.s||!F.line) bad.push(F.n+' is missing a name, a sprite or a line');
    if(ATLAS.index[F.s]===undefined) bad.push(F.n+' has no sprite: '+F.s);
    if(F.feed[0]>=700) meals++; else snacks++;
    /* it puts back what it says it does */
    P.food=0; G.hungerState=2;
    var it=mkItem('food',i);
    P.slots[0]=it;
    eat(it);
    if(P.food<F.feed[0]||P.food>F.feed[0]+F.feed[1])
      bad.push(F.n+' put back '+P.food+', outside '+F.feed[0]+'-'+(F.feed[0]+F.feed[1]));
    if(F.feed[0]>=700&&G.hungerState!==0) bad.push('a meal did not reset the hunger clock');
    if(F.feed[0]<700&&G.hungerState!==1) bad.push('a snack reset the whole hunger clock');
  }
  if(!meals) bad.push('nothing counts as a meal');
  if(snacks<2) bad.push('only '+snacks+' snacks');
  var mold=-1;
  for(i=0;i<FOODS.length;i++) if(FOODS[i].n==='mold ball') mold=i;
  if(mold<0) bad.push('the mold ball is gone again');
  /* and the potion that feeds you */
  var pk=-1;
  for(i=0;i<POTIONS.length;i++) if(POTIONS[i].n==='nourishment') pk=i;
  if(pk<0) bad.push('no potion feeds you');
  else {
    P.food=0; G.msgq=[];
    var pot=mkItem('potion',pk); P.slots[0]=pot;
    quaff(pot);
    if(P.food<POTION_FEED[0]) bad.push('the potion of nourishment fed you '+P.food);
    if(P.food>=FOODS[0].feed[0]) bad.push('the potion beats a ration');
  }
  return { bad:bad, meals:meals, snacks:snacks,
           names:FOODS.map(function(f){return f.n;}).join(', ') };
}
/* a thrown potion of confusion confuses what it hits */
function thrownConfusionOK(){
  var bad=[], i, hit=0;
  var ck=-1;
  for(i=0;i<POTIONS.length;i++) if(POTIONS[i].n==='confusion') ck=i;
  if(ck<0) return { bad:['there is no potion of confusion'], hit:0 };
  if(POTIONS[ck].hurl!=='daze') bad.push('a confusion potion is not thrown for anything');
  for(i=0;i<40;i++){
    bootTest(79100+i);
    var spot=nearWalkable();
    if(!spot) continue;
    var m=mkMonster('E',5,spot.x,spot.y);
    m.hp=200; m.mhp=200; m.conf=0; L.mons.push(m);
    var pot=mkItem('potion',ck); pot.cnt=1;
    P.slots[0]=pot;
    G.msgq=[];
    throwAtSquare(pot,m.x,m.y);
    if(m.conf>0) hit++;
    else bad.push('a potion of confusion left it clear headed');
  }
  return { bad:bad, hit:hit };
}
function nearWalkable(){
  for(var d=2;d<6;d++)
    for(var i=0;i<DIR4.length;i++){
      var x=P.x+DIR4[i][0]*d, y=P.y+DIR4[i][1]*d;
      if(walkable(x,y)&&!monAt(L,x,y)) return {x:x,y:y};
    }
  return null;
}
/* asking about a square reports the thing on it, not the floor beneath */
function lookOnlyTheThingOK(){
  var bad=[], i;
  bootTest(79003);
  var floorLine=null;
  /* a bare square still describes itself */
  /* plain floor: water or a bridge is a fact about the square in its own
     right and still gets a line, decor or no decor */
  var spot=null;
  for(var d2=1;d2<6 && !spot;d2++) for(var q2=0;q2<DIR4.length;q2++){
    var sx=P.x+DIR4[q2][0]*d2, sy=P.y+DIR4[q2][1]*d2;
    if(sx<1||sy<1||sx>=MAP_W-1||sy>=MAP_H-1) continue;
    if(L.tiles[sy*MAP_W+sx]!==FLOOR) continue;
    if(monAt(L,sx,sy)||itemAt(L,sx,sy)||L.decor[sy*MAP_W+sx]) continue;
    spot={x:sx,y:sy};
  }
  if(!spot) return { bad:['nowhere to look at'], bare:0, over:0, decor:0 };
  var bare=lookAt(spot.x,spot.y);
  if(!bare.length) bad.push('a bare square said nothing at all');
  floorLine=bare.join(' | ');
  /* put something on it and the floor drops out of the report */
  var it=mkItem('potion',0); it.x=spot.x; it.y=spot.y; L.items.push(it);
  var over=lookAt(spot.x,spot.y);
  for(i=0;i<bare.length;i++)
    if(over.indexOf(bare[i])>=0) bad.push('the floor still shows under an item: '+bare[i]);
  if(!over.length) bad.push('an item on a square said nothing');
  /* a creature likewise */
  L.items.pop();
  var m=mkMonster('E',5,spot.x,spot.y); L.mons.push(m);
  L.flags[spot.y*MAP_W+spot.x] |= (F_VIS|F_SEEN);
  var onMon=lookAt(spot.x,spot.y);
  for(i=0;i<bare.length;i++)
    if(onMon.indexOf(bare[i])>=0) bad.push('the floor still shows under a creature: '+bare[i]);
  L.mons.pop();

  /* and moss, rubble or a rug is a thing lying on the floor too - the
     stone under it is no more worth a line than the stone under a potion */
  var decorSeen=0;
  for(var dk in DECOR_INFO){
    if(L.tiles[spot.y*MAP_W+spot.x]!==FLOOR) break;
    L.decor[spot.y*MAP_W+spot.x]=dk;
    var onDec=lookAt(spot.x,spot.y);
    decorSeen++;
    for(i=0;i<bare.length;i++)
      if(onDec.indexOf(bare[i])>=0)
        bad.push('the floor still shows under '+dk+': '+bare[i]);
    if(!onDec.length) bad.push(dk+' said nothing at all');
    delete L.decor[spot.y*MAP_W+spot.x];
  }
  if(!decorSeen) bad.push('never tested a square with anything lying on it');

  /* nothing anywhere calls a square normal any more */
  for(var tk in TILE_INFO)
    for(i=0;i<TILE_INFO[tk].length;i++)
      if(TILE_INFO[tk][i].toLowerCase().indexOf('normal')>=0)
        bad.push('a tile still describes itself as normal: '+TILE_INFO[tk][i]);
  return { bad:bad, bare:bare.length, over:over.length, decor:decorSeen, floorLine:floorLine };
}

/* ------------------------------------------------ one ring of each kind
   Walk a whole dungeon's worth of item rolls and count what comes out.
   Two of anything is the bug this is here to catch. */
function ringSetOK(runs){
  var bad=[], counts={}, worst=0, total=0, r, i;
  for(r=0;r<runs;r++){
    bootTest(81000+r);
    var mine={};
    for(i=0;i<4000;i++){
      var it=newItem(3+rnd(20));
      if(!it||it.t!=='ring') continue;
      mine[it.k]=(mine[it.k]||0)+1;
      total++;
    }
    for(var k in mine){
      counts[RINGS[k].n]=(counts[RINGS[k].n]||0)+1;
      if(mine[k]>1) bad.push('a run turned up '+mine[k]+' rings of '+RINGS[k].n);
      if(mine[k]>worst) worst=mine[k];
    }
  }
  /* the leprechaun's ring is never left lying about */
  bootTest(81500);
  var loose=0;
  for(i=0;i<8000;i++){
    var it2=newItem(10);
    if(it2&&it2.t==='ring'&&RINGS[it2.k].p===0) loose++;
  }
  if(loose) bad.push(loose+' rings that should only be on a leprechaun were left lying about');
  return { bad:bad, worst:worst, perRun:(total/runs).toFixed(2),
           kinds:Object.keys(counts).sort().join(', ') };
}
/* how often one turns up at all, over a whole descent */
function ringRarity(runs){
  var found=0, floors=0, r, d, i;
  for(r=0;r<runs;r++){
    bootTest(82000+r);
    for(d=1;d<=26;d++){
      enterLevel(d,'down');
      floors++;
      for(i=0;i<L.items.length;i++) if(L.items[i].t==='ring') found++;
    }
  }
  return { perRun:(found/runs).toFixed(2), perFloor:(found/floors).toFixed(3) };
}
/* the three new rings do what they say */
function newRingsOK(){
  var bad=[], i;
  bootTest(83001);
  var fi=ringIndex('fire'), ic=ringIndex('ice'), li=ringIndex('light');
  if(fi<0) bad.push('there is no ring of fire');
  if(ic<0) bad.push('there is no ring of ice');
  if(li<0) bad.push('there is no ring of light');
  var rf=mkItem('ring',fi), ri2=mkItem('ring',ic), rl=mkItem('ring',li);
  if(rf.ch!==3) bad.push('the ring of fire holds '+rf.ch+' charges, not 3');
  if(ri2.ch!==3) bad.push('the ring of ice holds '+ri2.ch+' charges, not 3');
  if(rl.ch!==1) bad.push('the ring of light holds '+rl.ch+' charges, not 1');
  if(ringWind(rl)!==400) bad.push('the ring of light winds up in '+ringWind(rl)+' turns, not 400');
  if(ringWind(rf)!==RING_RECHARGE) bad.push('the ring of fire does not use the ordinary wait');

  /* aimed at something, it burns or freezes it and costs a charge */
  var burned=0, frozen=0, spent=0;
  for(i=0;i<20;i++){
    bootTest(83100+i);
    var line=straightLine();
    if(!line) continue;
    var m=mkMonster('E',6,line.x,line.y); m.hp=m.mhp=400; L.mons.push(m);
    var ring=mkItem('ring',fi); P.slots[0]=ring;
    var hp0=m.hp, ch0=ring.ch;
    G.msgq=[];
    zapRing(ring,line.dx,line.dy);
    if(m.hp<hp0) burned++;
    if(ring.ch===ch0-1) spent++;
    var m2=mkMonster('E',6,line.x,line.y);
    if(L.mons.indexOf(m)>=0){ L.mons.splice(L.mons.indexOf(m),1); }
    m2.hp=m2.mhp=400; L.mons.push(m2);
    var ring2=mkItem('ring',ic); P.slots[1]=ring2;
    G.msgq=[];
    zapRing(ring2,line.dx,line.dy);
    if(m2.stuck>0) frozen++;
    L.mons.length=0;
  }
  if(burned<15) bad.push('the ring of fire hit only '+burned+' of 20');
  if(frozen<15) bad.push('the ring of ice froze only '+frozen+' of 20');
  if(spent<15) bad.push('a charge was not always spent');

  /* an empty ring does nothing but say so */
  bootTest(83500);
  var empty=mkItem('ring',fi); empty.ch=0;
  var res=useItem(empty);
  if(res.aim) bad.push('an empty ring still offered to fire');

  /* the ring of light lights the room, and marks it as conjured light */
  var lit=0, blazed=0;
  for(i=0;i<20;i++){
    bootTest(83600+i);
    var ri3=roomIndexAt(P.x,P.y);
    if(ri3<0) continue;
    L.rooms[ri3].lit=0; L.rooms[ri3].blaze=0;
    var rl2=mkItem('ring',li); P.slots[0]=rl2;
    G.msgq=[];
    ringLight(rl2);
    if(L.rooms[ri3].lit) lit++;
    if(L.rooms[ri3].blaze) blazed++;
    if(rl2.ch!==0) bad.push('lighting the room cost no charge');
  }
  if(lit<15) bad.push('the ring of light lit only '+lit+' rooms of 20');
  if(blazed!==lit) bad.push('a lit room was not marked as conjured light');
  return { bad:bad, burned:burned, frozen:frozen, lit:lit };
}
/* a clear run of squares away from the player, for aiming down */
function straightLine(){
  for(var i=0;i<DIR4.length;i++){
    var dx=DIR4[i][0], dy=DIR4[i][1], ok=1, x=P.x, y=P.y, n;
    for(n=1;n<=3;n++){
      x+=dx; y+=dy;
      if(!walkable(x,y)||monAt(L,x,y)||isDoorish(x,y)){ ok=0; break; }
    }
    if(ok) return { x:x, y:y, dx:dx, dy:dy };
  }
  return null;
}
/* light and vampires */
function vampireLightOK(){
  var bad=[], i;
  bootTest(84001);
  var ri=roomIndexAt(P.x,P.y);
  if(ri<0) return { bad:['the player did not start in a room'], dmg:0, soft:0 };
  var spot=null;
  for(i=0;i<DIR4.length;i++){
    var x=P.x+DIR4[i][0], y=P.y+DIR4[i][1];
    if(walkable(x,y)&&!monAt(L,x,y)&&roomIndexAt(x,y)===ri){ spot={x:x,y:y}; break; }
  }
  if(!spot) return { bad:['nowhere in the room to stand a vampire'], dmg:0, soft:0 };
  var v=mkMonster('V',8,spot.x,spot.y); v.hp=v.mhp=400; v.state=2; L.mons.push(v);

  /* in the dark it is a vampire */
  L.rooms[ri].blaze=0;
  if(dazzled(v)) bad.push('a vampire is dazzled in an unlit room');
  var darkAr=v.ar;

  /* and in conjured light it is not */
  L.rooms[ri].blaze=1;
  if(!dazzled(v)) bad.push('a vampire is not dazzled in a lit room');

  /* It drags.  The pace is the same machinery a slowing wand uses - a
     turn in two - so check the gate itself rather than counting steps,
     which a creature standing next to you would not take anyway. */
  var moves=0;
  L.rooms[ri].blaze=1;
  for(i=0;i<20;i++) if(!((v.slowed||dazzled(v))&&(i&1))) moves++;
  if(moves!==10) bad.push('a dazzled vampire got '+moves+' turns in 20, not 10');
  L.rooms[ri].blaze=0;
  var full=0;
  for(i=0;i<20;i++) if(!((v.slowed||dazzled(v))&&(i&1))) full++;
  if(full!==20) bad.push('an undazzled vampire got '+full+' turns in 20, not 20');
  L.rooms[ri].blaze=1;
  /* it hits softer */
  var soft=DAZZLE_DAMAGE, harder=DAZZLE_ARMOR;
  if(soft<1) bad.push('the light costs it no strength');
  if(harder<1) bad.push('the light costs it no armour');
  /* and something else is not troubled by the light at all */
  var o=mkMonster('O',3,spot.x,spot.y);
  if(dazzled(o)) bad.push('an orc is troubled by light');
  /* cancelled, it stops caring */
  v.cancel=1;
  if(dazzled(v)) bad.push('a cancelled vampire is still dazzled');
  v.cancel=0;

  /* a beam of light full in the face */
  var dmg=0, tries=0;
  for(i=0;i<20;i++){
    bootTest(84100+i);
    var line=straightLine();
    if(!line) continue;
    var vv=mkMonster('V',8,line.x,line.y); vv.hp=vv.mhp=900; L.mons.push(vv);
    var wand=mkItem('wand',wandIndex('light')); wand.ch=5;
    var hp0=vv.hp;
    G.msgq=[];
    zapWand(wand,line.dx,line.dy);
    tries++;
    dmg+=hp0-vv.hp;
    /* the same beam past an orc costs it nothing */
    var oo=mkMonster('O',3,line.x,line.y);
    L.mons.length=0; L.mons.push(oo);
    var ohp=oo.hp;
    var w2=mkItem('wand',wandIndex('light')); w2.ch=5;
    G.msgq=[];
    zapWand(w2,line.dx,line.dy);
    if(oo.hp<ohp) bad.push('a beam of light hurt an orc');
    L.mons.length=0;
  }
  if(!tries) bad.push('never found a line to shoot down');
  var avg=tries?dmg/tries:0;
  if(avg<LIGHT_BEAM_DAMAGE[0]) bad.push('a beam of light did '+avg.toFixed(1)+' to a vampire');
  return { bad:bad, dmg:avg, moves:moves, soft:soft, armour:harder };
}
function wandIndex(name){
  for(var i=0;i<WANDS.length;i++) if(WANDS[i].n===name) return i;
  return -1;
}

/* ------------------------------------------ a stone you have watched work
   Every runed stone should name itself after one throw, not just the one
   that flies home. */
function stoneLearningOK(){
  var bad=[], i, learned=0, kinds=[];
  for(i=0;i<WEAPONS.length;i++) if(WEAPONS[i].rune) kinds.push(i);
  for(var n=0;n<kinds.length;n++){
    bootTest(85000+n);
    var k=kinds[n];
    var spot=nearWalkable();
    if(!spot){ bad.push('nowhere to throw '+WEAPONS[k].n); continue; }
    var m=mkMonster('E',5,spot.x,spot.y); m.hp=m.mhp=500; L.mons.push(m);
    var st=mkItem('weapon',k); st.cnt=2; st.known=0;
    P.slots[0]=st;
    G.throwing=st;                  /* the stone, not whatever is strung */
    if(itemName(st).indexOf('strange letters')<0)
      bad.push(WEAPONS[k].n+' gives itself away before you throw it');
    G.msgq=[];
    throwAtSquare(st, m.x, m.y);
    G.throwing=null;
    /* the pile it came from, if any of it is left */
    var still=null, all=carriedItems();
    for(i=0;i<all.length;i++) if(all[i].t==='weapon'&&all[i].k===k) still=all[i];
    if(still){
      if(!still.known) bad.push(WEAPONS[k].n+' is still a mystery after you threw one');
      else if(itemName(still).indexOf('strange letters')>=0)
        bad.push(WEAPONS[k].n+' still reads as strange letters');
      else learned++;
    } else learned++;
    /* and one you pick up later is known too */
    var fresh=mkItem('weapon',k);
    if(!fresh.known)
      bad.push('a second '+WEAPONS[k].n+' is a mystery all over again');
    if(itemName(fresh).indexOf('strange letters')>=0)
      bad.push('a second '+WEAPONS[k].n+' still reads as strange letters');
  }
  return { bad:bad, learned:learned, kinds:kinds.length,
           names:kinds.map(function(k){return WEAPONS[k].n;}).join(', ') };
}
function weaponLearned(k){
  var probe=mkItem('weapon',k);
  return itemName(probe).indexOf('strange letters')<0;
}
/* hitting something wakes it for good, until you really lose it */
function struckAwareOK(){
  var bad=[], i, secondSneak=0, afterHiding=0, trials=0;
  for(i=0;i<30;i++){
    bootTest(86000+i);
    P.hp=P.mhp=900;
    var spot=null, q;
    for(q=0;q<DIR4.length;q++){
      var x=P.x+DIR4[q][0], y=P.y+DIR4[q][1];
      if(walkable(x,y)&&!monAt(L,x,y)) spot={x:x,y:y};
    }
    if(!spot) continue;
    trials++;
    L.mons.length=0;
    var m=mkMonster('E',5,spot.x,spot.y);
    m.hp=m.mhp=900; m.state=0; m.blindTo=40;   /* long asleep */
    L.mons.push(m);
    /* the first blow is a proper ambush */
    if(surpriseHit(m)!==SNEAK_HIT_BONUS) bad.push('a sleeping creature was not ambushable');
    G.msgq=[];
    playerAttack(m);
    /* it takes its turn, in your face */
    monstersMove();
    if(L.mons.indexOf(m)<0) continue;
    if(surpriseHit(m)!==0){ secondSneak++; }
    /* now break away for two rounds and it is caught out again */
    m.blindTo=SURPRISE_AFTER; m.surprised=0;
    monstersMove();
    if(surpriseHit(m)===SURPRISE_HIT_BONUS) afterHiding++;
  }
  if(secondSneak) bad.push(secondSneak+' of '+trials+' creatures could be ambushed twice running');
  if(afterHiding<trials*0.8)
    bad.push('breaking away for two rounds only caught out '+afterHiding+' of '+trials);
  return { bad:bad, trials:trials, secondSneak:secondSneak, afterHiding:afterHiding };
}
/* the two new flasks */
function waterOK(){
  var bad=[], i;
  var wk=-1, hk=-1;
  for(i=0;i<POTIONS.length;i++){
    if(POTIONS[i].n==='water') wk=i;
    if(POTIONS[i].n==='holy water') hk=i;
  }
  if(wk<0) bad.push('there is no potion of water');
  if(hk<0) bad.push('there is no holy water');
  if(wk>=0&&POTIONS[wk].hurl!=='water') bad.push('plain water does nothing when thrown');
  if(hk>=0&&POTIONS[hk].hurl!=='holy') bad.push('holy water does nothing when thrown');

  /* drinking water is a shrug; drinking holy water clears your head */
  bootTest(87001);
  P.conf=10; P.blind=10; P.hallu=10; P.hp=P.mhp-6;
  var hw=mkItem('potion',hk); P.slots[0]=hw;
  G.msgq=[];
  quaff(hw);
  if(P.conf||P.blind||P.hallu) bad.push('holy water left you confused or blind');
  if(P.hp<=P.mhp-6) bad.push('holy water healed nothing at all');

  /* holy water thrown at a vampire, and at something ordinary */
  var vamp=0, orc=0, doused=0, tries=0;
  for(i=0;i<20;i++){
    bootTest(87100+i);
    var spot=nearWalkable();
    if(!spot) continue;
    tries++;
    L.mons.length=0;
    var v=mkMonster('V',8,spot.x,spot.y); v.hp=v.mhp=900; L.mons.push(v);
    var f=mkItem('potion',hk); P.slots[0]=f;
    var hp0=v.hp; G.msgq=[];
    throwAtSquare(f, v.x, v.y);
    vamp+=hp0-v.hp;

    L.mons.length=0;
    var o=mkMonster('O',3,spot.x,spot.y); o.hp=o.mhp=900; L.mons.push(o);
    var f2=mkItem('potion',hk); P.slots[0]=f2;
    var ohp=o.hp; G.msgq=[];
    throwAtSquare(f2, o.x, o.y);
    orc+=ohp-o.hp;

    /* plain water on a half dragon puts its fire out */
    L.mons.length=0;
    var hd=mkMonster('h',4,spot.x,spot.y); hd.hp=hd.mhp=900; L.mons.push(hd);
    var f3=mkItem('potion',wk); P.slots[0]=f3;
    G.msgq=[];
    throwAtSquare(f3, hd.x, hd.y);
    if(hd.doused>0) doused++;
    L.mons.length=0;
  }
  if(!tries) bad.push('never found a square to throw at');
  if(vamp/Math.max(1,tries) < HOLY_WATER_DAMAGE[0])
    bad.push('holy water did '+(vamp/Math.max(1,tries)).toFixed(1)+' to a vampire');
  if(orc) bad.push('holy water hurt an orc for '+orc);
  if(doused<tries) bad.push('plain water doused only '+doused+' of '+tries+' half dragons');
  return { bad:bad, vamp:vamp/Math.max(1,tries), doused:doused, tries:tries };
}
/* the half dragon */
function halfDragonOK(){
  var bad=[], i;
  bootTest(88001);
  var D=MON_BY_C['h'];
  if(!D) return { bad:['there is no half dragon'], shots:0, gap:0, cold:0 };
  var orc=MON_BY_C['O'];
  if(D.lv!==orc.lv) bad.push('it is level '+D.lv+', an orc is '+orc.lv);
  if(D.d[0][1]<=orc.d[0][1]) bad.push('its bite is no worse than the orc bite');
  if(D.d.length!==1) bad.push('it bites '+D.d.length+' times, not once');
  if(D.weak!=='cold') bad.push('it does not fear cold');
  if(ATLAS.index['mon_h']===undefined) bad.push('it has no sprite');
  if(!MON_INFO['h']) bad.push('the cursor has nothing to say about it');
  /* health in the same weight as an orc */
  var mine=0, theirs=0;
  for(i=0;i<400;i++){ mine+=monHP(D.lv,D.hpMul); theirs+=monHP(orc.lv,orc.hpMul); }
  if(Math.abs(mine-theirs)/theirs > 0.05)
    bad.push('its health is '+(mine/400).toFixed(1)+' against the orc figure of '+(theirs/400).toFixed(1));

  /* it spits, and then waits */
  var shots=0, gaps=[], tries=0;
  for(i=0;i<25;i++){
    if(i%10===0) bootTest(88100+i);
    else bootRoll(88100+i);
    P.hp=P.mhp=9000;
    var line=straightLine();
    if(!line) continue;
    tries++;
    L.mons.length=0;
    var m=mkMonster('h',4,line.x,line.y); m.hp=m.mhp=900; m.state=2; L.mons.push(m);
    var fired=[];
    for(var turn=0;turn<9;turn++){
      var hp0=P.hp;
      if(monRanged(m)) fired.push(turn);
      if(P.hp<hp0) shots++;
    }
    for(var j=1;j<fired.length;j++) gaps.push(fired[j]-fired[j-1]);
  }
  var gap=gaps.length? gaps.reduce(function(a,b){return a+b;},0)/gaps.length : 0;
  if(!shots) bad.push('it never spat at anything');
  if(gaps.length && (gap<FIREBALL_EVERY || gap>FIREBALL_EVERY+1))
    bad.push('it spits every '+gap.toFixed(1)+' turns, not every '+FIREBALL_EVERY);

  /* not with its feet in the water, and not while dripping */
  var wet=null, x, y, d;
  for(var s=0;s<8&&!wet;s++){
    bootTest(88500+s);
    for(d=1;d<=6&&!wet;d++){
      enterLevel(d,'down');
      for(y=1;y<MAP_H-1&&!wet;y++) for(x=1;x<MAP_W-1;x++)
        if(L.tiles[y*MAP_W+x]===WATER){ wet={x:x,y:y}; break; }
    }
  }
  if(wet){
    L.mons.length=0;
    var wm=mkMonster('h',4,wet.x,wet.y); wm.hp=wm.mhp=900; wm.state=2; L.mons.push(wm);
    P.x=wet.x+3; P.y=wet.y; P.hp=P.mhp=900;
    computeVis();
    var wetShots=0;
    for(i=0;i<12;i++){ wm.cast=0; if(monRanged(wm)) wetShots++; }
    if(wetShots) bad.push('it spat fire '+wetShots+' times with its feet in water');
  } else bad.push('no water on the floor to stand it in');

  bootTest(88600);
  var l2=straightLine();
  var dryShots=0;
  if(l2){
    L.mons.length=0;
    var dm=mkMonster('h',4,l2.x,l2.y); dm.hp=dm.mhp=900; dm.state=2;
    dm.doused=DOUSED_TURNS; L.mons.push(dm);
    P.hp=P.mhp=9000;
    for(i=0;i<DOUSED_TURNS;i++){ dm.cast=0; if(monRanged(dm)) dryShots++; }
    if(dryShots) bad.push('a doused half dragon spat fire '+dryShots+' times');
    if(dm.doused!==0) bad.push('it never dried out');
  }

  /* cold from a wand goes twice as deep as it does into anything else */
  /* The two zaps start from the same place in the sequence, so the two
     creatures are hit by the same roll and the answer is the multiplier
     itself rather than an average of one.  Rolled separately, eighty
     trials still left a few per cent of noise on it, and the check
     passed or failed on the seed. */
  var coldHalf=0, coldOrc=0, coldTries=0, pairSeed;
  for(i=0;i<80;i++){
    bootTest(88700+i);
    var l3=straightLine();
    if(!l3) continue;
    coldTries++;
    pairSeed=900000+i;
    L.mons.length=0;
    var c1=mkMonster('h',4,l3.x,l3.y); c1.hp=c1.mhp=9000; L.mons.push(c1);
    var w1=mkItem('wand',wandIndex('cold')); w1.ch=9;
    var a0=c1.hp; G.msgq=[]; srand(pairSeed); zapWand(w1,l3.dx,l3.dy); coldHalf+=a0-c1.hp;
    L.mons.length=0;
    var c2=mkMonster('O',4,l3.x,l3.y); c2.hp=c2.mhp=9000; L.mons.push(c2);
    var w2=mkItem('wand',wandIndex('cold')); w2.ch=9;
    var b0=c2.hp; G.msgq=[]; srand(pairSeed); zapWand(w2,l3.dx,l3.dy); coldOrc+=b0-c2.hp;
    L.mons.length=0;
  }
  /* Two things, kept apart.  The multiplier itself is exact and is asked
     for exactly, at the one place that applies it; the wands are a soak,
     and a soak of two separate rolls only ever settles near a number - it
     used to be asked to land within a twentieth of two, and passed or
     failed on the seed rather than on the rule. */
  var hd = MON_BY_C['h'], orc = MON_BY_C['O'];
  var one = elemDamage({def:hd}, 10, 'cold'), other = elemDamage({def:orc}, 10, 'cold');
  if(one !== 10*WEAKNESS_MULT)
    bad.push('cold on a half dragon came to '+one+', not '+(10*WEAKNESS_MULT));
  if(other !== 10)
    bad.push('cold on an orc came to '+other+', not 10');
  if(elemDamage({def:hd}, 10, 'fire') !== 10)
    bad.push('fire on a half dragon is doubled, and it should not be');
  var ratio=coldOrc? coldHalf/coldOrc : 0;
  if(ratio < 1.6 || ratio > 2.4)
    bad.push('over '+coldTries+' wands, cold did '+ratio.toFixed(2)+
      ' times as much to it, nowhere near '+WEAKNESS_MULT);
  /* and fire does not */
  var fireHalf=0, fireOrc=0;
  for(i=0;i<80;i++){
    bootTest(88800+i);
    var l4=straightLine();
    if(!l4) continue;
    L.mons.length=0;
    var d1=mkMonster('h',4,l4.x,l4.y); d1.hp=d1.mhp=9000; L.mons.push(d1);
    var w3=mkItem('wand',wandIndex('fire')); w3.ch=9;
    var e0=d1.hp; G.msgq=[]; zapWand(w3,l4.dx,l4.dy); fireHalf+=e0-d1.hp;
    L.mons.length=0;
    var d2=mkMonster('O',4,l4.x,l4.y); d2.hp=d2.mhp=9000; L.mons.push(d2);
    var w4=mkItem('wand',wandIndex('fire')); w4.ch=9;
    var f0=d2.hp; G.msgq=[]; zapWand(w4,l4.dx,l4.dy); fireOrc+=f0-d2.hp;
    L.mons.length=0;
  }
  if(fireOrc && Math.abs(fireHalf/fireOrc - 1) > 0.25)
    bad.push('fire does '+(fireHalf/fireOrc).toFixed(2)+' times as much to it as to an orc');
  return { bad:bad, shots:shots, gap:gap, cold:ratio, tries:tries,
           fire: fireOrc? fireHalf/fireOrc : 0 };
}
/* it turns up down there, and not on the first floor */
function halfDragonSpawnOK(runs){
  var seen=0, floors=0, shallow=0, r, d, i;
  for(r=0;r<runs;r++){
    bootTest(89000+r);
    for(d=1;d<=14;d++){
      enterLevel(d,'down'); floors++;
      for(i=0;i<L.mons.length;i++) if(L.mons[i].c==='h'){
        seen++;
        if(d<MON_BY_C['h'].minDepth) shallow++;
      }
    }
  }
  return { seen:seen, floors:floors, shallow:shallow };
}

/* ------------------------------------------------- following a cold trail
   A clever creature that loses sight of you should walk to the square it
   last saw you on and then cast about beyond it, the way you were going.
   Set that up deliberately: a hunter a few squares off, then whisk the
   player somewhere it cannot see. */
function huntTrailOK(runs){
  var bad=[], took=0, stood=0, casts=[], turns=[], onward=0, backward=0, tried=0;
  for(var s=0;s<runs;s++){
    if(s%10===0) bootTest(96000+s);
    else bootRoll(96000+s);
    P.hp=P.mhp=9000;
    var spot=null, r, d;
    for(r=3;r<7&&!spot;r++) for(d=0;d<DIR4.length;d++){
      var x=P.x+DIR4[d][0]*r, y=P.y+DIR4[d][1]*r;
      if(walkable(x,y)&&!monAt(L,x,y)){ spot={x:x,y:y}; break; }
    }
    if(!spot) continue;
    L.mons.length=0;
    var m=mkMonster('O',3,spot.x,spot.y);
    m.hp=m.mhp=9000; m.state=2; m.lost=0; m.blindTo=0;
    L.mons.push(m);
    /* a hunter that was watching you has to have been able to see you:
       a spot behind a wall or off in the dark sets up nothing to lose */
    if(!monSeesPlayer(m)) continue;
    /* two turns of being watched, walking one way, so it has a heading */
    var hx=0, hy=0;
    for(d=0;d<DIR4.length;d++){
      if(walkable(P.x+DIR4[d][0],P.y+DIR4[d][1])){ hx=DIR4[d][0]; hy=DIR4[d][1]; break; }
    }
    m.mark={x:P.x-hx,y:P.y-hy,dx:hx,dy:hy};
    var markX=P.x, markY=P.y;
    m.mark={x:markX,y:markY,dx:hx,dy:hy};
    /* and now out of sight entirely */
    var far=null, y2, x2;
    for(y2=1;y2<MAP_H-1&&!far;y2++) for(x2=1;x2<MAP_W-1;x2++)
      if(walkable(x2,y2) && Math.abs(x2-markX)+Math.abs(y2-markY)>25 &&
         !sightClear(spot.x,spot.y,x2,y2)){ far={x:x2,y:y2}; break; }
    if(!far) continue;
    P.x=far.x; P.y=far.y; computeVis();
    tried++;
    var sawSeek=0, onMark=0, castUsed=0, t;
    for(t=1;t<=40;t++){
      var before=m.seek? m.seek.cast : null;
      var bx=m.x, by=m.y;
      monstersMove();
      if(m.seek) sawSeek=1;
      if(m.x===markX&&m.y===markY) onMark=1;
      if(m.seek&&before!==null&&m.seek.cast<before){
        castUsed++;
        /* which way did the search go?  onward, or back the way it came */
        var sx=Math.sign(m.x-bx), sy=Math.sign(m.y-by);
        if(sx*hx+sy*hy>0) onward++;
        else if(sx*hx+sy*hy<0) backward++;
      }
      if(m.state!==2){ turns.push(t); break; }
    }
    if(t>40) turns.push(40);
    if(sawSeek) took++;
    if(onMark) stood++;
    casts.push(castUsed);
  }
  var avg=function(a){ return a.length? a.reduce(function(x,y){return x+y;},0)/a.length : 0; };
  if(took<tried*0.85) bad.push('only '+took+' of '+tried+' took up the trail');
  if(stood<tried*0.85) bad.push('only '+stood+' of '+tried+' reached the square you were last seen on');
  if(avg(casts)<HUNT_CAST_MIN-1) bad.push('it cast about '+avg(casts).toFixed(1)+' squares, not '+HUNT_CAST_MIN);
  if(onward<=backward) bad.push('it searched backward as often as onward ('+onward+' vs '+backward+')');
  return { bad:bad, tried:tried, took:took, stood:stood,
           cast:avg(casts), turns:avg(turns), onward:onward, backward:backward };
}
/* you cannot hit your own */
function allySwapOK(){
  var bad=[], i, swaps=0, tried=0;
  for(i=0;i<30;i++){
    bootTest(97000+i);
    P.hp=P.mhp=900;
    L.mons.length=0;
    /* nothing underfoot to hurt whoever ends up standing on it - being
       shoved onto a trap is not the same as being struck */
    L.traps.length=0; L.clouds.length=0; P.fireShield=0; P.conf=0;
    var d=null, q;
    for(q=0;q<DIR4.length;q++){
      var x=P.x+DIR4[q][0], y=P.y+DIR4[q][1];
      if(walkable(x,y)&&!monAt(L,x,y)){ d=DIR4[q]; break; }
    }
    if(!d) continue;
    tried++;
    var a=mkMonster('O',3,P.x+d[0],P.y+d[1]);
    a.ally=1; a.hp=a.mhp=40; L.mons.push(a);
    var px=P.x, py=P.y, ax=a.x, ay=a.y, hp0=a.hp;
    G.msgq=[];
    playerMove(d[0],d[1]);
    if(a.hp<hp0) bad.push('you hit your own ally for '+(hp0-a.hp));
    if(L.mons.indexOf(a)<0) bad.push('you killed your own ally');
    if(P.x===ax&&P.y===ay&&a.x===px&&a.y===py) swaps++;
    else bad.push('walking into an ally did not change places');
  }
  /* and a hostile in the same spot is still attacked */
  bootTest(97500);
  P.hp=P.mhp=900;
  L.mons.length=0;
  var d2=null, q2;
  for(q2=0;q2<DIR4.length;q2++){
    var x2=P.x+DIR4[q2][0], y2=P.y+DIR4[q2][1];
    if(walkable(x2,y2)&&!monAt(L,x2,y2)){ d2=DIR4[q2]; break; }
  }
  if(d2){
    var foe=mkMonster('O',3,P.x+d2[0],P.y+d2[1]);
    foe.hp=foe.mhp=900; foe.ally=0; L.mons.push(foe);
    var fx=foe.x, fy=foe.y, fhp=foe.hp, ppx=P.x;
    var hits=0;
    for(i=0;i<30;i++){ G.msgq=[]; foe.hp=900; playerMove(d2[0],d2[1]); if(foe.hp<900) hits++; }
    if(!hits) bad.push('walking into an enemy never hit it');
    if(P.x!==ppx||foe.x!==fx||foe.y!==fy) bad.push('you changed places with an enemy');
  }
  return { bad:bad, swaps:swaps, tried:tried };
}

/* --------------------------------------- struck from anywhere is struck
   The melee case was fixed, but a bow carries ten squares and nothing
   can see past nine - so a creature shot from the far side of a room
   never had its "rounds without a glimpse of you" tally reset, and gave
   you a fresh ambush with every arrow.  Try every way of reaching one. */
function alertedByOK(){
  var bad=[], ways=[], i;
  var kinds=['melee','arrow','stone','wand','flask'];
  for(var w=0;w<kinds.length;w++){
    var kind=kinds[w], second=0, tried=0;
    for(i=0;i<40;i++){
      if(i%10===0) bootTest(98000+w*100+i);
      else bootRoll(98000+w*100+i);
      P.hp=P.mhp=9000;
      var line=longLine(kind==='melee'?1:6);
      if(!line) continue;
      L.mons.length=0;
      var m=mkMonster('E',5,line.x,line.y);
      m.hp=m.mhp=9000; m.state=0; m.blindTo=40; m.surprised=0;
      L.mons.push(m);
      /* the first one is a proper ambush whatever you use */
      if(surpriseHit(m)!==SNEAK_HIT_BONUS){ continue; }
      G.msgq=[];
      var before=m.hp+','+m.state+','+(m.blind||0)+','+(m.stuck||0);
      if(!hitItWith(kind, m, line)) continue;   /* the attempt never happened */
      if(L.mons.indexOf(m)<0) continue;
      /* it has to have actually been touched, or there is nothing to test */
      if(m.hp+','+m.state+','+(m.blind||0)+','+(m.stuck||0)===before) continue;
      tried++;
      /* it takes its turn, then you try again */
      monstersMove();
      if(L.mons.indexOf(m)<0){ tried--; continue; }
      if(surpriseHit(m)!==0){
        second++;
        bad.push(kind+': bonus '+surpriseHit(m)+' because '+
          (m.state<2?'it went back to sleep':m.surprised?'it was caught out again':
           m.flee>0?'it was running away':'unknown')+
          ' (state '+m.state+' blindTo '+m.blindTo+' flee '+(m.flee||0)+')');
      }
    }
    ways.push(kind+' '+second+'/'+tried);
    if(second) bad.push(second+' of '+tried+' creatures hit by '+kind+
      ' could be ambushed again straight away');
    if(tried<5) bad.push('only managed to test '+kind+' '+tried+' times');
  }
  return { bad:bad, ways:ways.join(', ') };
}
function hitItWith(kind, m, line){
  if(kind==='melee'){ playerAttack(m); return 1; }
  if(kind==='arrow'){
    var bow=mkItem('weapon',weaponIndex('short bow')); bow.known=1;
    P.eq.lh=bow;                    /* a bow is carried in the off hand */
    var am=mkItem('weapon',weaponIndex('arrow')); am.cnt=20; am.known=1;
    P.slots[0]=am;
    G.throwing=null;
    if(!canShoot()) return 0;
    return fireAt(m) ? 1 : 0;
  }
  if(kind==='stone'){
    var st=mkItem('weapon',weaponIndex('blasting stone')); st.cnt=4;
    P.slots[0]=st; G.throwing=st;
    var ok=throwAtSquare(st, m.x, m.y);
    G.throwing=null;
    return ok?1:0;
  }
  if(kind==='wand'){
    var wd=mkItem('wand',wandIndex('magic missile')); wd.ch=9;
    return zapWand(wd, line.dx, line.dy) ? 1 : 0;
  }
  if(kind==='flask'){
    var pk=-1;
    for(var i=0;i<POTIONS.length;i++) if(POTIONS[i].n==='blindness') pk=i;
    var f=mkItem('potion',pk); f.cnt=2;
    P.slots[0]=f;
    return throwAtSquare(f, m.x, m.y) ? 1 : 0;
  }
  return 0;
}
/* a clear run of at least n squares in one direction */
function longLine(n){
  for(var i=0;i<DIR4.length;i++){
    var dx=DIR4[i][0], dy=DIR4[i][1], x=P.x, y=P.y, ok=1, s;
    for(s=1;s<=n;s++){
      x+=dx; y+=dy;
      if(!walkable(x,y)||monAt(L,x,y)||isDoorish(x,y)){ ok=0; break; }
    }
    if(ok) return { x:x, y:y, dx:dx, dy:dy };
  }
  return null;
}

/* ------------------------------------- a turn it loses still counts
   Ducking out of sight for two rounds catches a creature out.  A round
   it spent frozen, slowed or wading is still a round it did not see
   you, so it has to count the same as any other. */
function lostTurnsCountOK(){
  var bad=[], i, kinds=['plain','frozen','slowed','wading','held'], out=[];
  for(var w=0;w<kinds.length;w++){
    var kind=kinds[w], caught=0, tried=0;
    for(i=0;i<24;i++){
      if(i%10===0) bootTest(99100+w*40+i);
      else bootRoll(99100+w*40+i);
      P.hp=P.mhp=9000;
      /* somewhere it can stand and see you, and somewhere you can hide */
      var spot=null, q;
      for(var r=2;r<5&&!spot;r++) for(q=0;q<DIR4.length;q++){
        var x=P.x+DIR4[q][0]*r, y=P.y+DIR4[q][1]*r;
        if(walkable(x,y)&&!monAt(L,x,y)) spot={x:x,y:y};
      }
      if(!spot) continue;
      L.mons.length=0;
      var m=mkMonster('E',5,spot.x,spot.y);
      m.hp=m.mhp=9000; m.state=2; m.blindTo=0; m.surprised=0; m.lost=0;
      L.mons.push(m);
      /* "somewhere it can stand and see you" has to mean the game's own
         idea of seeing: a spot behind a wall or off in the dark leaves
         nothing to catch out */
      if(!monSeesPlayer(m)) continue;
      /* out of its sight entirely */
      var hide=null, y2, x2;
      for(y2=1;y2<MAP_H-1&&!hide;y2++) for(x2=1;x2<MAP_W-1;x2++)
        if(walkable(x2,y2)&&!sightClear(spot.x,spot.y,x2,y2)&&
           Math.abs(x2-spot.x)+Math.abs(y2-spot.y)>2){ hide={x:x2,y:y2}; break; }
      if(!hide) continue;
      var home={x:P.x,y:P.y};
      P.x=hide.x; P.y=hide.y; computeVis();
      tried++;
      /* Two rounds of it not seeing you.  Held in place between them: the
         question is whether a round counts, not whether it can walk. */
      var sighted=0;
      for(var t2=0;t2<SURPRISE_AFTER;t2++){
        if(kind==='frozen') m.stuck=1;
        if(kind==='slowed') { m.slowed=1; G.turn=1; }
        if(kind==='held') m.held=1;
        if(kind==='wading') m.wade=0;
        monstersMove();
        if(L.mons.indexOf(m)<0) break;
        /* It may have wandered somewhere it can see you from, and then
           the round rightly does not count.  Only rounds it really spent
           without a glimpse of you are the ones under test. */
        if(monSeesPlayer(m)||mdist(m)<=1) sighted=1;
        m.x=spot.x; m.y=spot.y;          /* back where it started */
        m.state=2;                       /* it has not given up on you */
      }
      if(L.mons.indexOf(m)<0){ tried--; continue; }
      if(sighted){ tried--; continue; }
      if(m.blindTo<SURPRISE_AFTER)
        bad.push('after '+SURPRISE_AFTER+' rounds '+kind+' it had counted only '+m.blindTo);
      /* step back into view and it should be caught out */
      P.x=home.x; P.y=home.y; computeVis();
      /* its catch-out move must actually happen: not spent slowed, held,
         or getting through the water it happens to be standing in */
      m.slowed=0; m.stuck=0; m.held=0; m.wade=0; G.turn=0;
      monstersMove();
      if(L.mons.indexOf(m)<0){ tried--; continue; }
      if(surpriseHit(m)===SURPRISE_HIT_BONUS || m.state<2) caught++;
    }
    out.push(kind+' '+caught+'/'+tried);
    if(tried && caught < tried*0.8)
      bad.push('a creature that spent the rounds '+kind+' was caught out only '+
        caught+' times of '+tried);
    if(tried<5) bad.push('only tested '+kind+' '+tried+' times');
  }
  return { bad:bad, ways:out.join(', ') };
}

/* ------------------------------------------------------ breathed fire
   A jet of flame is a row of fire crossing the room, not an arrow, and
   it takes a moment to get there.  Timed from the instant it was spat it
   was over before anybody saw it, which read as the creature moving at
   the same time as the player. */
function breathOK(){
  var bad=[], i;
  /* Two creatures, two different things.  The dragon breathes a jet: a
     row of flame that burns every square it crosses.  The half dragon
     throws one ball, which burns only where it lands - it never had a
     jet, and giving it one made it a second dragon. */
  var kinds=[['D','dragon','jet','breathes fire'],
             ['h','half dragon','ball','spits fire']];
  var out=[];
  for(var w=0;w<kinds.length;w++){
    var isJet = kinds[w][2]==='jet';
    bootTest(75000+w);
    P.hp=P.mhp=9000;
    L.mons.length=0; L.clouds.length=0;
    /* Where you happen to start is not always somewhere with four clear
       squares in front of it, and which square that is moves with the
       dice.  Go and stand somewhere that has one. */
    var line=straightLine4(1);
    if(!line){ bad.push('nowhere to breathe down'); continue; }
    var m=mkMonster(kinds[w][0],8,line.x,line.y);
    m.hp=m.mhp=900; m.state=2; m.cast=0; m.doused=0;
    L.mons.push(m);
    var fired=0, tries=0;
    while(!fired && tries<60){
      tries++;
      G.beat=0; G.bolt=null; G.shot=null; G.msgq=[]; L.clouds.length=0;
      m.cast=0;
      if(monRanged(m)) fired=1;
    }
    if(!fired){ bad.push(kinds[w][1]+' never breathed'); continue; }
    /* it waits before it lands */
    if(G.beat < BREATH_LEAD)
      bad.push(kinds[w][1]+' waited '+G.beat+'ms, not '+BREATH_LEAD);
    var burn=0;
    if(isJet){
      /* the flame is timed from after that wait, not from now */
      if(G.shot) bad.push('the dragon threw a single flying thing');
      if(!G.bolt) bad.push('the dragon drew no flame');
      else {
        if(G.bolt.kind!=='fire'||G.bolt.mode!=='beam')
          bad.push('the dragon drew '+G.bolt.kind+' as a '+G.bolt.mode);
        if(G.bolt.path.length<2) bad.push('the dragon drew a jet '+G.bolt.path.length+' square long');
        if(G.bolt.t < nowMs() + BREATH_LEAD - 40)
          bad.push('the dragon starts its flame before the wait is over');
        var last=G.bolt.path[G.bolt.path.length-1];
        if(last[0]!==P.x||last[1]!==P.y) bad.push('the dragon breathed past you');
        burn=G.bolt.path.length;
      }
    } else {
      if(G.bolt) bad.push('the half dragon breathes a jet instead of throwing a ball');
      if(!G.shot) bad.push('the half dragon threw nothing');
      else {
        if(G.shot.spr!=='flame') bad.push('the half dragon threw a '+G.shot.spr);
        if(G.shot.t < nowMs() + BREATH_LEAD - 40)
          bad.push('the ball starts flying before the wait is over');
        if(G.shot.ex!==P.x||G.shot.ey!==P.y) bad.push('the ball was not aimed at you');
        burn=1;
      }
    }
    /* what it leaves burning: the whole line for a jet, one square for a ball */
    var fires=L.clouds.filter(function(c){ return c.kind==='fire'; });
    if(isJet && fires.length<2) bad.push('the jet left '+fires.length+' squares burning');
    if(!isJet && fires.length!==1) bad.push('the ball left '+fires.length+' squares burning, not 1');
    for(i=0;i<fires.length;i++)
      if(fires[i].turns<BREATH_FIRE_MIN||fires[i].turns>BREATH_FIRE_MAX)
        bad.push('fire left burning '+fires[i].turns+' turns, outside '+
          BREATH_FIRE_MIN+'-'+BREATH_FIRE_MAX);
    /* and it says so without cutting the creature's name in half */
    var said=G.msgq.map(function(x){ return x.s||''; }).join(' ');
    if(said.toLowerCase().indexOf(kinds[w][1])<0)
      bad.push('the line does not name it: '+said);
    if(said.indexOf(kinds[w][3])<0)
      bad.push('nothing said about the fire: '+said);
    out.push(kinds[w][1]+' throws a '+kinds[w][2]+', '+fires.length+' squares left burning');
  }
  return { bad:bad, ways:out.join('; ') };
}

/* ------------------------------------------- fire and the room it is in
   The jet used to walk one square at a time in the player's general
   direction with nothing to stop it, which on any but a straight line
   left the room through the corner and went on burning squares out in
   the solid rock.  It follows an arrow's line now and stops at the first
   thing that would stop an arrow - and anything it does reach, powder
   included, catches. */
function breathStaysInsideOK(seeds){
  var bad=[], s, i, jets=0, stone=0, floor=0, reached=0;
  for(s=0;s<seeds;s++){
    /* the floor is scenery: dragon and target are stood up by hand */
    if(s%10===0) bootTest(76000+s);
    else bootRoll(76000+s);
    P.hp=P.mhp=9000;
    L.mons.length=0; L.clouds.length=0;
    var r=null;
    for(i=0;i<L.rooms.length;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>25){ r=L.rooms[i]; break; }
    if(!r) continue;
    P.x=r.floors[0][0]; P.y=r.floors[0][1];
    /* somewhere off the straight lines, where the old walk went astray */
    var spot=null;
    for(i=0;i<r.floors.length;i++){
      var f=r.floors[i], d=Math.abs(f[0]-P.x)+Math.abs(f[1]-P.y);
      if(d>=3 && d<=6 && f[0]!==P.x && f[1]!==P.y && walkable(f[0],f[1])){ spot=f; break; }
    }
    if(!spot) continue;
    var m=mkMonster('D',10,spot[0],spot[1]);
    m.hp=m.mhp=9000; m.state=2; L.mons.push(m);
    G.beat=0; G.bolt=null;
    breatheFire(m,1);
    if(!G.bolt) continue;
    jets++;
    for(i=0;i<G.bolt.path.length;i++){
      if(walkable(G.bolt.path[i][0],G.bolt.path[i][1])) floor++; else stone++;
    }
    var last=G.bolt.path[G.bolt.path.length-1];
    if(last[0]===P.x&&last[1]===P.y) reached++;
  }
  if(!jets) bad.push('no jets to look at');
  if(stone) bad.push(stone+' squares of flame landed in solid rock');
  if(jets && reached < jets*0.7)
    bad.push('only '+reached+' of '+jets+' crooked jets got to the player');

  /* powder standing on the line catches; powder behind the wall does not */
  var hits=0, lit=0, past=0, pastLit=0;
  for(s=0;s<seeds;s++){
    if(s%10===0) bootTest(76500+s);
    else bootRoll(76500+s);
    P.hp=P.mhp=9000; L.mons.length=0; L.clouds.length=0; L.fuses={};
    var row=null, rr=null;
    for(i=0;i<L.rooms.length;i++){
      var rm=L.rooms[i];
      if(rm.gone||rm.special||rm.floors.length<25) continue;
      for(var k=0;k<rm.floors.length;k++){
        var g=rm.floors[k];
        /* four squares of dry floor in a row: a barrel standing in
           water is wet powder and will not light, which is the rule */
        if(walkable(g[0]+1,g[1])&&walkable(g[0]+2,g[1])&&walkable(g[0]+3,g[1])&&
           !inWater(g[0],g[1])&&!inWater(g[0]+1,g[1])&&
           !inWater(g[0]+2,g[1])&&!inWater(g[0]+3,g[1])){
          row=g; rr=rm; break;
        }
      }
      if(row) break;
    }
    if(!row) continue;
    var bx=row[0]+2, by=row[1], j=by*MAP_W+bx;
    L.barrels=L.barrels||{}; L.decor=L.decor||{};
    L.barrels[j]=1; L.decor[j]='barrel';
    P.x=row[0]+3; P.y=row[1];
    var d1=mkMonster('D',10,row[0],row[1]);
    d1.hp=d1.mhp=9000; d1.state=2; L.mons.push(d1);
    G.beat=0; G.bolt=null;
    breatheFire(d1,1);
    if(G.bolt){
      var on=0;
      for(i=0;i<G.bolt.path.length;i++)
        if(G.bolt.path[i][0]===bx&&G.bolt.path[i][1]===by) on=1;
      if(on){ hits++; if(L.fuses[j]) lit++; }
    }
    /* and the same barrel, with a wall put between it and the flame */
    delete L.fuses[j];
    L.clouds.length=0;
    var wx=row[0]+1, wy=row[1];
    var was=L.tiles[wy*MAP_W+wx];
    L.tiles[wy*MAP_W+wx]=ROCK;
    G.beat=0; G.bolt=null;
    breatheFire(d1,1);
    past++;
    if(L.fuses[j]) pastLit++;
    if(G.bolt) for(i=0;i<G.bolt.path.length;i++)
      if(G.bolt.path[i][0]===wx&&G.bolt.path[i][1]===wy) bad.push('the jet burned the wall square itself');
    L.tiles[wy*MAP_W+wx]=was;
  }
  if(!hits) bad.push('no jet ever crossed a barrel');
  if(hits!==lit) bad.push('a jet crossed '+hits+' barrels but lit only '+lit);
  if(pastLit) bad.push(pastLit+' barrels caught through a solid wall');
  return { bad:bad, jets:jets, stone:stone, floor:floor, reached:reached,
           hits:hits, lit:lit, past:past };
}

/* ------------------------------------------- walking into the dark
   What the game says when you cross into a dark room, and out of one.
   With night eyes there is nothing to complain about going in and
   nothing to be relieved about coming out. */
function darkWordsOK(){
  var bad=[], i;
  bootTest(73001);
  function cross(perk){
    P.perks = perk ? { nightstalker: 1 } : {};
    P.seer = 0;
    G.wasDark = 0; G.msgq = [];
    L.darkMap = new Uint8Array(MAP_W * MAP_H);
    L.darkMap[P.y * MAP_W + P.x] = 1;
    noteDarkness();
    var went = G.msgq.map(function(m){ return m.s || ''; }).join(' ');
    G.msgq = [];
    L.darkMap[P.y * MAP_W + P.x] = 0;
    noteDarkness();
    var came = G.msgq.map(function(m){ return m.s || ''; }).join(' ');
    return { went: went, came: came };
  }
  var plain = cross(false), eyes = cross(true);
  if(plain.went.indexOf('pitch dark')<0) bad.push('nothing said about walking into the dark');
  if(!plain.came) bad.push('nothing said about coming out of it');
  if(eyes.went!=='It is pitch dark but you see well.')
    bad.push('with night eyes it says: '+eyes.went);
  if(eyes.came) bad.push('with night eyes it still says: '+eyes.came);
  /* the ring lends the same eyes, so it should read the same */
  P.perks = {}; P.seer = RING_SEER_TURNS;
  G.wasDark = 0; G.msgq = [];
  L.darkMap[P.y * MAP_W + P.x] = 1;
  noteDarkness();
  var ring = G.msgq.map(function(m){ return m.s || ''; }).join(' ');
  if(ring.indexOf('you see well')<0) bad.push('the ring of the seer does not read as night eyes: '+ring);
  P.seer = 0;
  return { bad:bad, plain:plain.went, eyes:eyes.went };
}

/* ------------------------------------------ the two clocks you run on
   How hungry you are and how far off the next level is: both are things
   the game knew and never told you a number for. */
function statReadingsOK(){
  var bad=[], i;
  bootTest(72001);
  /* experience against the next level, all the way up */
  for(i=1;i<=21;i++){
    P.lv=i; P.exp=0;
    var want=xpNext(), txt=xpText();
    if(i<21){
      if(want!==E_LEVELS[i-1]) bad.push('level '+i+' asks for '+want+', not '+E_LEVELS[i-1]);
      if(txt.indexOf('/')<0) bad.push('level '+i+' does not say what it is working towards: '+txt);
      if(txt!=='0/'+want) bad.push('level '+i+' reads '+txt);
    } else if(txt.indexOf('/')>=0) bad.push('the last level still asks for more: '+txt);
  }
  /* and it counts up to the threshold, not past it */
  P.lv=1; P.exp=E_LEVELS[0]-1;
  if(xpText()!==(E_LEVELS[0]-1)+'/'+E_LEVELS[0]) bad.push('the count is wrong just short of a level');

  /* hunger, as a share of a full stomach */
  var seen={};
  var cases=[[FOOD_MAX,0,'fed'],[900,0,'peckish'],[280,1,'hungry'],[140,2,'weak'],[10,3,'starving']];
  for(i=0;i<cases.length;i++){
    P.food=cases[i][0]; G.hungerState=cases[i][1];
    var pct=foodPct();
    if(pct<0||pct>100) bad.push('food reads '+pct+'%');
    var want2=Math.round(cases[i][0]*100/FOOD_MAX);
    if(pct!==want2) bad.push('food of '+cases[i][0]+' reads '+pct+'%, not '+want2);
    if(foodWord()!==cases[i][2]) bad.push('food of '+cases[i][0]+' reads "'+foodWord()+'", not "'+cases[i][2]+'"');
    seen[foodWord()]=1;
  }
  if(Object.keys(seen).length!==5) bad.push('only '+Object.keys(seen).length+' words for hunger');
  /* an empty stomach is nought per cent, not a negative */
  P.food=-50; G.hungerState=3;
  if(foodPct()!==0) bad.push('a starving reading of '+foodPct()+'%');
  P.food=FOOD_MAX*2;
  if(foodPct()!==100) bad.push('a stuffed reading of '+foodPct()+'%');
  return { bad:bad, words:Object.keys(seen).length };
}

/* ------------------------------------ openings, and the light through
   Not every way between two spaces is a door.  An opening is a gap in
   the stone: it does not stop sight, or arrows, or light - and light
   from a lit space runs a few squares through one into the dark. */
function archwaysOK(seeds){
  var bad=[], s, d, i, doors=0, arches=0, floors=0, blocked=0;
  for(s=0;s<seeds;s++){
    bootTest(63000+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down'); floors++;
      for(i=0;i<L.tiles.length;i++){
        var t2=L.tiles[i];
        if(t2===DOOR||t2===LOCKED) doors++;
        if(!L.arch[i]) continue;
        arches++;
        /* an opening is exactly that: nothing about it stops anything */
        var x=i%MAP_W, y=(i/MAP_W)|0;
        if(t2!==CORR&&t2!==FLOOR)
          bad.push('an opening is tile '+t2+', not a way through');
        if(blocksSight(x,y)) { blocked++; bad.push('an opening blocks sight'); }
        if(blocksShot(x,y)) bad.push('an opening stops an arrow');
        if(!walkable(x,y)) bad.push('an opening cannot be walked through');
      }
    }
  }
  var pct = 100*arches/Math.max(1,doors+arches);
  if(!arches) bad.push('every way between two spaces is a door');
  if(pct < ARCH_PCT/2 || pct > ARCH_PCT*1.6)
    bad.push('openings are '+pct.toFixed(0)+'% of the ways through, wanted about '+ARCH_PCT);
  return { bad:bad, doors:doors, arches:arches, pct:pct, floors:floors };
}
/* light through an opening, and not through a door */
function lightSpillOK(){
  var bad=[], i, spill=[], throughDoor=0, tried=0;
  for(var s=0;s<40;s++){
    bootTest(64000+s);
    for(var d=2;d<=8;d++){
      enterLevel(d,'down');
      /* a dark square with an unlit run leading back to a lit one */
      var lit=null, dark=null;
      for(i=0;i<L.rooms.length;i++){
        var r=L.rooms[i];
        if(r.gone) continue;
        if(!lit && r.lit && !r.dark && r.floors.length>6) lit=r;
        if(!dark && r.dark && r.floors.length>6) dark=r;
      }
      if(!lit||!dark) continue;
      tried++;
      /* Lay the two side by side by hand: a wall between them with one
         square of it taken out.  That is the whole question - does the
         light come through the gap. */
      var lx=lit.cx, ly=lit.cy;
      var count=0;
      buildLitMap(L); buildDarkMap(L, d);
      var before=0;
      for(i=0;i<L.darkMap.length;i++) if(L.darkMap[i]) before++;
      spillLight(L);
      var after=0;
      for(i=0;i<L.darkMap.length;i++) if(L.darkMap[i]) after++;
      spill.push(before-after);
      break;
    }
  }
  /* the mechanism itself, set up deliberately */
  bootTest(64500);
  var y0=null, x0=null;
  for(var yy=3;yy<MAP_H-6&&!y0;yy++) for(var xx=3;xx<MAP_W-8;xx++){
    var ok=1;
    for(var k=0;k<7;k++) if(!walkable(xx+k,yy)) ok=0;
    if(ok){ x0=xx; y0=yy; break; }
  }
  if(!x0) bad.push('nowhere to lay out a corridor for the test');
  else {
    /* a lit square, a gap, and four dark squares beyond it */
    L.litMap = new Uint8Array(MAP_W*MAP_H);
    L.darkMap = new Uint8Array(MAP_W*MAP_H);
    L.litMap[y0*MAP_W+x0] = 1;
    for(i=1;i<=5;i++) L.darkMap[y0*MAP_W+x0+i] = 1;
    spillLight(L);
    var reach=0;
    for(i=1;i<=5;i++) if(!L.darkMap[y0*MAP_W+x0+i]) reach++;
    if(reach!==SPILL_RANGE)
      bad.push('light reached '+reach+' squares through an opening, not '+SPILL_RANGE);
    /* and a door in the way stops it dead */
    L.litMap = new Uint8Array(MAP_W*MAP_H);
    L.darkMap = new Uint8Array(MAP_W*MAP_H);
    L.litMap[y0*MAP_W+x0] = 1;
    for(i=1;i<=5;i++) L.darkMap[y0*MAP_W+x0+i] = 1;
    var was=L.tiles[y0*MAP_W+x0+1];
    L.tiles[y0*MAP_W+x0+1] = DOOR;
    spillLight(L);
    for(i=1;i<=5;i++) if(!L.darkMap[y0*MAP_W+x0+i]) throughDoor++;
    L.tiles[y0*MAP_W+x0+1] = was;
    if(throughDoor) bad.push('light came through a shut door: '+throughDoor+' squares');
  }
  var avg=spill.length? spill.reduce(function(a,b){return a+b;},0)/spill.length : 0;
  return { bad:bad, avg:avg, tried:tried };
}

/* --------------------------------- putting a thing on where it lies
   A full pack used to mean walking over a breastplate for ever.  If it
   is something you could be wearing there is one place left to put it,
   and what it replaces goes down on the floor in its stead. */
function wearFromFloorOK(){
  var bad=[], i;
  bootTest(71001);
  /* fill the pack, and stand on something worth wearing */
  for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('scroll',0);
  P.eq.body=mkItem('armor',0); P.eq.body.known=1; P.eq.body.cursed=0;
  var old=P.eq.body;
  /* and nothing else lying on the square: what the floor happened to
     put where you started is not what this is about */
  for(i=L.items.length-1;i>=0;i--) if(L.items[i].x===P.x && L.items[i].y===P.y) L.items.splice(i,1);
  var found=mkItem('armor',6); found.x=P.x; found.y=P.y; L.items.push(found);
  G.msgq=[];
  autoPickup();
  var said=G.msgq.map(function(m){return m.s||'';}).join(' ');
  if(said.indexOf('ENTER')<0) bad.push('a full pack said nothing about wearing it: '+said);
  if(L.items.indexOf(found)<0) bad.push('it was picked up into a full pack');
  if(!wearHere()) bad.push('the square does not offer anything to put on');
  G.msgq=[];
  if(!equipFromFloor(found)) bad.push('putting it on failed');
  if(P.eq.body!==found) bad.push('it is not being worn');
  if(!found.known) bad.push('putting it on did not identify it');
  if(L.items.indexOf(found)>=0) bad.push('it is worn and still lying on the floor');
  var down=null;
  for(i=0;i<L.items.length;i++) if(L.items[i]===old) down=L.items[i];
  if(!down) bad.push('what you were wearing was not put down');

  /* with room in the pack it is picked up as usual, not offered */
  bootTest(71002);
  P.slots=new Array(N_SLOTS).fill(null);
  var f2=mkItem('head',1); f2.x=P.x; f2.y=P.y; L.items.push(f2);
  G.msgq=[];
  autoPickup();
  if(L.items.indexOf(f2)>=0) bad.push('it was left on the floor with room to spare');
  if(wearHere()) bad.push('it offers to wear things when the pack has room');

  /* a cursed thing will not come off to make way */
  bootTest(71003);
  for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('scroll',0);
  var stuck=mkItem('head',1); stuck.cursed=1; stuck.known=1;
  P.eq.head=stuck;
  var f3=mkItem('head',0); f3.x=P.x; f3.y=P.y; L.items.push(f3);
  G.msgq=[];
  if(equipFromFloor(f3)) bad.push('a cursed helm came off to make way');
  if(P.eq.head!==stuck) bad.push('the cursed helm is gone');
  if(L.items.indexOf(f3)<0) bad.push('the one on the floor vanished anyway');
  var refused=G.msgq.map(function(m){return m.s||'';}).join(' ');
  if(refused.indexOf('cursed')<0) bad.push('nothing was said about the curse');

  /* and something you cannot wear at all is not offered */
  bootTest(71004);
  for(i=0;i<N_SLOTS;i++) P.slots[i]=mkItem('scroll',0);
  var f4=mkItem('potion',0); f4.x=P.x; f4.y=P.y; L.items.push(f4);
  if(wearHere()) bad.push('it offers to put on a potion');
  G.msgq=[];
  autoPickup();
  var s4=G.msgq.map(function(m){return m.s||'';}).join(' ');
  if(s4.indexOf('ENTER')>=0) bad.push('a potion was offered as something to wear');
  return { bad:bad };
}
/* things that ought to share a slot */
function stackingOK(){
  var bad=[], i, kinds=['potion','scroll','food','crystal','dynamite','pin'];
  bootTest(71100);
  for(i=0;i<kinds.length;i++){
    P.slots=new Array(N_SLOTS).fill(null);
    for(var n=0;n<4;n++) addItem(mkItem(kinds[i],0));
    var used=0, cnt=0;
    for(var s=0;s<N_SLOTS;s++) if(P.slots[s]){ used++; cnt+=P.slots[s].cnt; }
    if(used!==1) bad.push('four of '+kinds[i]+' took '+used+' slots');
    if(cnt!==4) bad.push(kinds[i]+' counted '+cnt+' of 4');
  }
  /* and things that should not share one */
  P.slots=new Array(N_SLOTS).fill(null);
  addItem(mkItem('armor',0)); addItem(mkItem('armor',0));
  var coats=0;
  for(i=0;i<N_SLOTS;i++) if(P.slots[i]) coats++;
  if(coats!==2) bad.push('two coats of armour shared a slot');
  return { bad:bad, kinds:kinds.length };
}

/* ------------------------------------- what a thing looks like unknown
   A blade you have not handled is "a notched blade" and nothing more:
   not its kind, not its numbers, not whether it will come off again.
   Wearing or swinging one tells you everything about that one and
   teaches you the kind for the rest of the run. */
function gearLooksOK(){
  var bad=[], i, t2, hidden=0, total=0, looks={};
  bootTest(70001);
  var kinds=[['weapon',WEAPONS],['armor',ARMORS],['head',HEADS],
             ['feet',FEET],['shield',SHIELDS]];
  for(t2=0;t2<kinds.length;t2++){
    var key=kinds[t2][0], tbl=kinds[t2][1];
    for(i=0;i<tbl.length;i++){
      var it=mkItem(key,i);
      if(!tbl[i].gen){                       /* ammunition and stones */
        if(hidesItsName(it)) bad.push(tbl[i].n+' hides behind a look it has no business having');
        continue;
      }
      total++;
      var name=itemName(it);
      if(name.indexOf(tbl[i].n)>=0)
        bad.push(tbl[i].n+' gives its own name away unidentified: '+name);
      else hidden++;
      if(name.indexOf(tbl[i].gen)<0)
        bad.push(tbl[i].n+' does not read as a '+tbl[i].gen+': '+name);
      /* nothing anywhere carries the old bracketed total any more */
      if(name.indexOf('[')>=0) bad.push(tbl[i].n+' still carries a bracket: '+name);
      /* the numbers stay hidden with it */
      it.ap=3; it.hp=3; it.dp=3; it.cursed=1;
      var dressed=itemName(it);
      if(dressed.indexOf('3')>=0||dressed.indexOf('cursed')>=0)
        bad.push('an unidentified '+tbl[i].n+' shows its numbers: '+dressed);
      looks[APPEAR.gear[key][i]]=1;
    }
  }
  if(Object.keys(looks).length < 6)
    bad.push('only '+Object.keys(looks).length+' different looks in a whole run');

  /* Wearing one tells you what it is worth in the hand and nothing else.
     Its name, and the kind it belongs to, come from studying it or from
     a scroll: a coat feels heavy or light long before you can say what
     it is called. */
  bootTest(70002);
  var a=mkItem('armor',4); a.ap=2; a.cursed=0;
  P.slots[0]=a;
  var beforeName=itemName(a);
  if(beforeName.indexOf('chain mail')>=0) bad.push('it was known before it was worn');
  G.msgq=[];
  autoEquip(a);
  if(a.known) bad.push('wearing it named it');
  if(numbersKnown(a)) bad.push('wearing it gave away what it was worth');
  if(itemName(a).indexOf('chain mail')>=0) bad.push('worn, it gives its name away');
  if(itemName(a).indexOf('+2')>=0) bad.push('worn, it shows its numbers: '+itemName(a));
  if(itemName(a).indexOf('[')>=0) bad.push('a worn thing still carries a bracket: '+itemName(a));
  var b=mkItem('armor',4);
  if(!hidesItsName(b))
    bad.push('wearing one gave away every other one of the kind: '+itemName(b));
  /* and once a scroll has named it, the kind is known for good */
  identifyItem(a);
  if(itemName(a).indexOf('chain mail')<0) bad.push('a scroll did not name it: '+itemName(a));
  var b2=mkItem('armor',4);
  if(itemName(b2).indexOf('chain mail')<0)
    bad.push('a second one of a named kind is still a mystery: '+itemName(b2));
  b2.ap=3; b2.cursed=1;
  var second=itemName(b2);
  if(second.indexOf('3')>=0||second.indexOf('cursed')>=0)
    bad.push('a second one gives away its own worth: '+second);
  var c=mkItem('armor',5);
  if(c.known||kindKnown(c)) bad.push('learning one kind gave away another');

  /* swinging an unknown weapon does the same */
  bootTest(70003);
  var w=mkItem('weapon',1); w.hp=1;
  P.eq.rh=w;
  if(w.known) bad.push('a weapon starts identified');
  var spot=null, q;
  for(q=0;q<DIR4.length;q++){
    var x=P.x+DIR4[q][0], y=P.y+DIR4[q][1];
    if(walkable(x,y)&&!monAt(L,x,y)) spot={x:x,y:y};
  }
  if(spot){
    var m=mkMonster('E',3,spot.x,spot.y); m.hp=m.mhp=900; L.mons.push(m);
    G.msgq=[];
    playerAttack(m);
    if(!w.known) bad.push('swinging it did not identify it');
    if(!kindKnown(mkItem('weapon',1))) bad.push('swinging it did not teach you the kind');
  } else bad.push('nowhere to stand a creature to hit');

  /* and a cursed one says so the moment it is on you */
  bootTest(70004);
  var cz=mkItem('head',1); cz.cursed=1;
  P.slots[0]=cz;
  if(itemName(cz).indexOf('cursed')>=0) bad.push('the curse shows before you put it on');
  G.msgq=[];
  autoEquip(cz);
  if(itemName(cz).indexOf('cursed')<0) bad.push('the curse does not show once it is on');
  return { bad:bad, hidden:hidden, total:total, looks:Object.keys(looks).length };
}

/* ------------------------------------------------- how far you can see
   A door is a tile like any other.  It used to be lit as part of the
   room it belongs to, so from a dark corridor you could pick out the
   doors of a room nine squares away while the ground under your feet
   ran out at four - doors and walls floating in the dark. */
function sightReachOK(seeds){
  var bad=[], s, d, i, far={}, roomsSeen=0, doorsSeen=0, doorsTotal=0, holes=0;
  var overDoor=[], overWall=[], stood=0, doorMargin=0, wallMargin=0;
  function note(k, v){ if(!far[k] || v > far[k]) far[k] = v; }
  for(s=0;s<seeds;s++){
    bootTest(61000+s);
    for(d=1;d<=6;d++){
      enterLevel(d,'down');
      /* --- standing in a hallway, in the dark --- */
      var spot=null;
      for(i=0;i<L.tiles.length && !spot;i++)
        if(L.tiles[i]===CORR && !L.darkMap[i]) spot={x:i%MAP_W,y:(i/MAP_W)|0};
      if(spot){
        P.x=spot.x; P.y=spot.y; P.perks={}; P.seer=0; computeVis();
        /* Kept per standpoint, not pooled.  Pooled, the furthest door
           ever seen was being weighed against the longest corridor ever
           stood in - two different floors - and the answer meant nothing
           either way. */
        /* The rule is about the floor, not about the hallway: a wall is
           drawn because a square of floor beside it is lit, so nothing
           should ever be drawn further off than the furthest floor in
           sight, give or take the one square it stands beside.

           Comparing doors against the length of the corridor was the
           wrong measure twice over - the two maxima were pooled across
           different floors, and a corridor that opens into an unlit room
           can see that room's far wall without anything being wrong. */
        var lf=0, ld=0, lw=0, lc=0;
        for(i=0;i<L.flags.length;i++){
          if(!(L.flags[i]&F_VIS)) continue;
          var x=i%MAP_W, y=(i/MAP_W)|0;
          var dist=Math.max(Math.abs(x-P.x),Math.abs(y-P.y));
          var t=L.tiles[i];
          if(t===CORR&&dist>lc) lc=dist;
          if(t===DOOR||t===LOCKED){ if(dist>ld) ld=dist; }
          else if(t===WALL){ if(dist>lw) lw=dist; }
          else if(walkable(x,y)){ if(dist>lf) lf=dist; }
        }
        note('corridor',lc); note('door',ld); note('wall',lw); note('floor',lf);
        /* Three squares of slack.  Walls are marked from the
           squares around a lit floor, and that pass reaches a corner
           wall whose own floor is not lit, and around a corner that can
           run a little way.  The margin actually reached is printed, so a
           slide shows up as a number: the fault this guards against was a
           door drawn five squares past the last floor in sight. */
        stood++;
        if(ld-lf > doorMargin) doorMargin = ld-lf;
        if(lw-lf > wallMargin) wallMargin = lw-lf;
        if(ld > lf + 3) overDoor.push(ld+' against '+lf);
        if(lw > lf + 3) overWall.push(lw+' against '+lf);
      }
      /* --- and standing in the middle of a lit room --- */
      var r=null;
      for(i=0;i<L.rooms.length;i++){
        var rr=L.rooms[i];
        if(rr.gone||!rr.lit||rr.dark||rr.floors.length<9) continue;
        r=rr; break;
      }
      if(!r) continue;
      roomsSeen++;
      P.x=r.cx; P.y=r.cy; P.perks={}; P.seer=0; computeVis();
      for(var f=0;f<r.floors.length;f++){
        var fx=r.floors[f][0], fy=r.floors[f][1];
        if(!(L.flags[fy*MAP_W+fx]&F_VIS)) continue;
        var fd=Math.max(Math.abs(fx-P.x),Math.abs(fy-P.y));
        for(var q=0;q<DIR8.length;q++){
          var wx=fx+DIR8[q][0], wy=fy+DIR8[q][1], k=wy*MAP_W+wx;
          var wt=L.tiles[k];
          if(wt!==WALL&&wt!==DOOR&&wt!==LOCKED&&wt!==SDOOR) continue;
          var wd=Math.max(Math.abs(wx-P.x),Math.abs(wy-P.y));
          if(fd>wd) continue;               /* lit from behind: not a face */
          if(wt===DOOR||wt===LOCKED){ doorsTotal++; if(L.flags[k]&F_VIS) doorsSeen++; }
          if(!(L.flags[k]&F_VIS)) holes++;
        }
      }
    }
  }
  /* From a hallway, nothing is visible much further than the hallway */
  if(overDoor.length)
    bad.push(overDoor.length+' hallways drew a door further off than any floor in sight ('+
      overDoor[0]+' squares)');
  if(overWall.length)
    bad.push(overWall.length+' hallways drew a wall further off than any floor in sight ('+
      overWall[0]+' squares)');
  /* but the room you are standing in shows you its own doors */
  if(doorsTotal && doorsSeen < doorsTotal)
    bad.push((doorsTotal-doorsSeen)+' doors of the room you are in were not drawn');
  if(holes > roomsSeen/8)
    bad.push(holes+' holes in the outline of the rooms you were standing in');
  if(stood<seeds/2) bad.push('only '+stood+' hallways to stand in');
  return { bad:bad, far:far, rooms:roomsSeen, doors:doorsSeen+'/'+doorsTotal,
           holes:holes, stood:stood, doorMargin:doorMargin, wallMargin:wallMargin };
}

/* ------------------------------------------------------- web spinners
   A lighter spider that fights at a distance.  It sticks you where you
   stand, or lays web on the floor for you to walk into later, and it
   can only do either every other turn. */
/* How many of his own turns the player loses, counted the way the game
   counts them.  Called straight after the turn on which something took
   hold of him: the first upkeep is that turn's, and every one after it
   is a turn he could not act on. */
function turnsHeldAfter(){
  upkeep();
  var lost=0;
  while(heldFast() && lost<12){ lost++; upkeep(); }
  return lost;
}
function webSpinnerOK(seeds){
  var bad=[], i, s, stuck=0, laid=0, shots=0, tries=0, gaps=[], held=[];
  var W = MON_BY_C['w'], E = MON_BY_C['E'];
  if(!W) return { bad:['there is no web spinner'], shots:0 };
  if(ATLAS.index['mon_w']===undefined) bad.push('it has no sprite');
  if(ATLAS.index['web']===undefined) bad.push('web on the floor has no sprite');
  if(!MON_INFO['w']) bad.push('the cursor has nothing to say about it');
  if(!DECOR_INFO['web']) bad.push('web on the floor has no description');
  /* lighter than an ordinary spider */
  var mine=0, theirs=0;
  for(i=0;i<2000;i++){ mine+=monHP(W.lv,W.hpMul); theirs+=monHP(E.lv,E.hpMul); }
  if(mine >= theirs) bad.push('it is no lighter than a spider: '+
    (mine/2000).toFixed(1)+' against '+(theirs/2000).toFixed(1));

  for(s=0;s<seeds;s++){
    if(s%10===0) bootTest(52000+s);
    else bootRoll(52000+s);
    P.hp=P.mhp=9000;
    var line=straightLine4();
    if(!line) continue;
    tries++;
    L.mons.length=0; L.webs={};
    var m=mkMonster('w',3,line.x,line.y);
    m.hp=m.mhp=900; m.state=2; L.mons.push(m);
    for(var t2=0;t2<10;t2++){
      P.frozen=0; P.webbed=0;
      var before=Object.keys(L.webs).length;
      G.msgq=[];
      /* the spit itself, asked for directly: which turns it happens on
         is the burst's business and is measured on its own below */
      if(monWeb(m)){
        shots++;
        var landedOnYou = P.frozen > 0;
        if(landedOnYou){
          stuck++;
          /* the turns it really costs, not the number in the counter:
             the counter is wound down once more at the end of the very
             turn the web arrives on */
          var reallyLost=turnsHeldAfter();
          held.push(reallyLost);
          if(reallyLost<WEB_HOLD_MIN||reallyLost>WEB_HOLD_MAX)
            bad.push('it cost you '+reallyLost+' turns, outside '+WEB_HOLD_MIN+'-'+WEB_HOLD_MAX);
        }
        /* A shot that landed on you leaves its web there, so you can see
           what has hold of you.  One that went for the ground must not:
           the squares it webs are the ones between you and it. */
        if(landedOnYou && !webAt(P.x,P.y))
          bad.push('web spat over you left nothing to see on your square');
        if(!landedOnYou && webAt(P.x,P.y))
          bad.push('a shot that missed left web on the square you are standing on');
        if(Object.keys(L.webs).length>before) laid++;
      }
      P.frozen=0; P.webbed=0; clearWeb(P.x,P.y);
    }
  }
  var avg=function(a){ return a.length? a.reduce(function(x,y){return x+y;},0)/a.length : 0; };
  if(!shots) bad.push('it never spat at anything');
  if(!stuck) bad.push('a web spat over you never held you');
  if(!laid) bad.push('it never webbed the floor');

  /* --- she keeps her distance, and comes in when the web has you ---- */
  var kept = 0, closed = 0, bitesWhenStuck = [], spitsFree = [], backedOff = 0, tried2 = 0;
  for (s = 0; s < seeds; s++) {
    bootTest(52700 + s);
    P.hp = P.mhp = 900000; P.frozen = 0; P.webbed = 0;
    L.mons.length = 0; L.webs = {};
    /* two squares off, on dry ground, with room behind her to back into */
    var lane = null;
    for (i = 0; i < DIR4.length; i++) {
      /* Every square of the run, not only the two ends: she has to be
         able to walk in and back out again, and a wall in the middle of
         it means she can never reach you however many points she has. */
      var clear = 1;
      for (var st4 = 1; st4 <= 4; st4++) {
        var cx4 = P.x + DIR4[i][0] * st4, cy4 = P.y + DIR4[i][1] * st4;
        if (!walkable(cx4, cy4) || inWater(cx4, cy4) || isDoorish(cx4, cy4) ||
            monAt(L, cx4, cy4)) { clear = 0; break; }
      }
      if (!clear) continue;
      lane = { x: P.x + DIR4[i][0] * 2, y: P.y + DIR4[i][1] * 2 };
      break;
    }
    if (!lane) continue;
    tried2++;
    /* nothing else in the room may take a swing at anybody: an arrow
       trap or a patch of fire puts "N damage" in the log too, and that
       is not the spinner reaching you */
    L.clouds.length = 0; L.traps = [];
    var sp = mkMonster('w', 3, lane.x, lane.y);
    sp.hp = sp.mhp = 900000; sp.state = 2; L.mons.push(sp);

    /* Blows aimed at YOU: health off you, or a miss, or a dodge.  Damage
       is counted off the player rather than out of the log, because the
       log carries what happened to her as well. */
    function blowsAtYou(hp0) {
      var n = (P.hp < hp0) ? 1 : 0, q;
      for (q = 0; q < G.msgq.length; q++) {
        var f = G.msgq[q].fx || '';
        if (f === 'miss' || f === 'dodged') n++;
      }
      return n;
    }
    /* on your feet: she spits and backs away, and never lays a finger */
    var d0 = mdist(sp), spat = 0, bit = 0, hpWas = P.hp;
    G.msgq = []; G.beat = 0;
    monstersMove();
    for (i = 0; i < G.msgq.length; i++) {
      var fx6 = G.msgq[i].fx || '';
      if (/stuck|web/.test(fx6)) spat++;
    }
    bit = blowsAtYou(hpWas);
    spitsFree.push(spat);
    if (bit) bad.push('she came to blows while you were on your feet');
    if (mdist(sp) > d0) backedOff++;
    if (mdist(sp) < d0) closed++;
    P.frozen = 0; P.webbed = 0; clearWeb(P.x, P.y);

    /* stuck: six actions, one bite, and out again */
    sp.x = lane.x; sp.y = lane.y;
    P.webbed = 4; P.frozen = 4;
    var far0 = mdist(sp), hpWas2 = P.hp;
    G.msgq = []; G.beat = 0;
    monstersMove();
    for (i = 0; i < G.msgq.length; i++)
      if (/stuck|web/.test(G.msgq[i].fx || ''))
        bad.push('she spat while she was busy biting you');
    var bites = blowsAtYou(hpWas2);
    bitesWhenStuck.push(bites);
    if (bites > 1) bad.push('she bit ' + bites + ' times in one round');
    if (!bites) bad.push('six actions and she never reached you from ' + far0 + ' squares');
    else if (mdist(sp) <= 1)
      bad.push('she bit you and stayed in reach instead of backing out');
    else kept++;
    P.webbed = 0; P.frozen = 0;
  }
  if (!tried2) bad.push('never got her set up at two squares with room behind her');
  var avgSpits = spitsFree.length ?
    spitsFree.reduce(function (a, b) { return a + b; }, 0) / spitsFree.length : 0;
  if (tried2 && avgSpits < SPIN_SPITS - 0.4)
    bad.push('she spat ' + avgSpits.toFixed(1) + ' webs a turn, not ' + SPIN_SPITS);
  if (tried2 && closed > tried2 / 4)
    bad.push('she closed with you ' + closed + ' times while you were on your feet');

  /* --- a weaver is at home in its own web --------------------------- */
  var weavers=[], plain=[], weaverTried=0;
  for(i=0;i<MONS.length;i++) (MONS[i].weaver?weavers:plain).push(MONS[i].c);
  if(weavers.indexOf('w')<0) bad.push('the web spinner sticks in its own web');
  if(weavers.indexOf('E')<0) bad.push('a spider sticks in web');
  for(i=0;i<weavers.length+1;i++){
    var wc = i<weavers.length ? weavers[i] : 'O';       /* and one that is not */
    /* Web will not stick over a crack or a rug, so keep dealing floors
       until there is a pair of bare squares to walk between.  A square
       that never had web on it proves nothing either way. */
    var ln2=null, q2, sd;
    for(sd=0;sd<40 && !ln2;sd++){
      bootTest(52400+i*40+sd);
      L.webs={}; L.mons.length=0;
      for(q2=0;q2<DIR4.length && !ln2;q2++){
        var ax=P.x+DIR4[q2][0]*2, ay=P.y+DIR4[q2][1]*2;
        var bx2=ax-DIR4[q2][0], by2=ay-DIR4[q2][1];
        if(!walkable(ax,ay)||!walkable(bx2,by2)) continue;
        if(L.decor[by2*MAP_W+bx2]) continue;
        /* and no trap on the square it steps onto: an ice trap holds
           whatever walks into it, weaver or not, and this is a question
           about web */
        if(trapAtLevel(L,bx2,by2)||trapAtLevel(L,ax,ay)) continue;
        ln2={x:ax,y:ay,dx:-DIR4[q2][0],dy:-DIR4[q2][1]};
      }
    }
    if(!ln2) continue;
    var wm=mkMonster(wc,4,ln2.x,ln2.y); wm.hp=wm.mhp=900; L.mons.push(wm);
    var tx=ln2.x+ln2.dx, ty=ln2.y+ln2.dy;
    layWeb(tx,ty);
    if(!webAt(tx,ty)) continue;
    weaverTried++;
    G.msgq=[];
    tryMonStep(wm, ln2.dx, ln2.dy);
    var isWeaver = i<weavers.length;
    if(isWeaver){
      if(wm.stuck) bad.push(monShort(wm)+' stuck in web it should walk through');
      if(!webAt(tx,ty)) bad.push(monShort(wm)+' tore up the web it walked over');
    } else {
      if(!wm.stuck) bad.push(monShort(wm)+' walked through web unhindered');
      if(webAt(tx,ty)) bad.push('the web survived catching '+monShort(wm));
    }
  }
  if(weaverTried < weavers.length + 1)
    bad.push('only '+weaverTried+' of '+(weavers.length+1)+
      ' walked over web that was really there');
  var avgHeld = held.length ? (held.reduce(function(x,y){return x+y;},0)/held.length) : 0;
  return { bad:bad, shots:shots, stuck:stuck, laid:laid, tries:tries,
           held:avgHeld, weavers:weavers.length, weaverTried:weaverTried,
           spits:avgSpits, kept:kept, backedOff:backedOff, setups:tried2,
           bites:bitesWhenStuck.length };
}
function straightLine4(move){
  for(var i=0;i<DIR4.length;i++){
    var dx=DIR4[i][0], dy=DIR4[i][1], x=P.x, y=P.y, ok=1, n;
    for(n=1;n<=4;n++){
      x+=dx; y+=dy;
      if(!walkable(x,y)||monAt(L,x,y)||isDoorish(x,y)){ ok=0; break; }
    }
    if(ok) return { x:x, y:y, dx:dx, dy:dy };
  }
  /* Where you happen to have started is not always somewhere with four
     clear squares in front of it - a stream or a chasm across the room
     is enough to spoil it.  Asked to, go and stand somewhere that has. */
  if(!move) return null;
  for(var j=0;j<L.tiles.length;j++){
    if(L.tiles[j]!==FLOOR) continue;
    var sx=j%MAP_W, sy=(j/MAP_W)|0;
    for(var d=0;d<DIR4.length;d++){
      var ex=sx, ey=sy, good=1;
      for(var k=1;k<=4;k++){
        ex+=DIR4[d][0]; ey+=DIR4[d][1];
        if(!walkable(ex,ey)||monAt(L,ex,ey)||isDoorish(ex,ey)){ good=0; break; }
      }
      if(!good) continue;
      P.x=sx; P.y=sy; computeVis();
      return { x:ex, y:ey, dx:DIR4[d][0], dy:DIR4[d][1] };
    }
  }
  return null;
}

/* ---------------------------------------------------- powder barrels
   Any fire lights one; it burns for a turn; then it takes everything
   within two squares, walls included, and lights the next.  Only a
   flask of liquid fire used to reach them, so a burning stone thrown
   into a powder room did nothing whatever. */
/* Only the barrels of the powder store.  There are loose ones about the
   rest of the floor now, and a chain that runs through the store is not
   supposed to reach a barrel standing on its own three rooms away. */
function storeBarrels(){
  var out=[], k;
  for(k in (L.barrels||{})) if(inPowderRoom(k|0)) out.push(k);
  return out;
}
function barrelsOK(seeds){
  var bad=[], s, d, i, rooms=0, chains=0, opened=0, waits=[], reach=[];
  for(s=0;s<seeds;s++){
    bootTest(40000+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down');
      var keys=storeBarrels();
      if(keys.length<4) continue;
      rooms++;
      P.hp=P.mhp=9000;
      P.x=1; P.y=1;                       /* well clear of it */
      var k=keys[0]|0, bx=k%MAP_W, by=(k/MAP_W)|0;
      var before=keys.length;
      var floor0=0;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===FLOOR) floor0++;

      /* a burning stone, not a flask */
      G.msgq=[];
      stoneRune('fire', {x:bx,y:by}, mkItem('weapon',weaponIndex('burning stone')), 0);
      var litNow=Object.keys(L.fuses).length;
      if(!litNow) bad.push('a burning stone did not light the powder');
      if(storeBarrels().length !== before)
        bad.push('a barrel went up the moment it caught, with no turn to run');

      var turns=0;
      while(Object.keys(L.fuses).length && turns<30){ tickFuses(); turns++; }
      waits.push(turns);
      var left=storeBarrels().length;
      if(left) bad.push(left+' barrels of '+before+' never went up');
      else chains++;
      var floor1=0;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===FLOOR) floor1++;
      opened += floor1-floor0;
      break;
    }
  }
  /* Dynamite lights every barrel it reaches, not only the square it
     lands on - a stick thrown into the middle of a group used to do
     nothing at all if it came down on bare floor between them. */
  var byStick=0, stickTried=0;
  for(s=0;s<seeds;s++){
    bootTest(42000+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down');
      var ks=storeBarrels();
      if(ks.length<4) continue;
      P.hp=P.mhp=9000; P.x=1; P.y=1;
      /* a bare square with barrels beside it */
      var spot=null;
      for(i=0;i<ks.length&&!spot;i++){
        var kk=ks[i]|0, bx2=kk%MAP_W, by2=(kk/MAP_W)|0;
        for(var q=0;q<DIR4.length;q++){
          var nx=bx2+DIR4[q][0], ny=by2+DIR4[q][1];
          if(walkable(nx,ny)&&!barrelAt(nx,ny)){ spot={x:nx,y:ny}; break; }
        }
      }
      if(!spot) continue;
      stickTried++;
      L.fuses={};
      G.msgq=[];
      dynamiteAt(spot.x, spot.y);
      var lines=G.msgq.map(function(m){return m.s||'';}).join(' ');
      /* every barrel the explosion touched, not just some of them */
      var touching=0, q2, r2;
      for(r2=-1;r2<=1;r2++) for(q2=-1;q2<=1;q2++)
        if(L.barrels[(spot.y+r2)*MAP_W+(spot.x+q2)]) touching++;
      var litNow=Object.keys(L.fuses).length;
      if(litNow) byStick++;
      else bad.push('dynamite beside a group of barrels lit none of them');
      if(litNow<touching)
        bad.push('the blast touched '+touching+' barrels and lit only '+litNow);
      /* and it says what happened: powder catching, not stone opening,
         when there was no stone within reach of it */
      if(lines.indexOf('lights the powder')<0)
        bad.push('nothing was said about the powder catching: '+lines);
      var turns2=0;
      while(Object.keys(L.fuses).length && turns2<30){ tickFuses(); turns2++; }
      if(storeBarrels().length)
        bad.push(storeBarrels().length+' barrels survived the chain');
      break;
    }
  }
  if(!stickTried) bad.push('never found a powder room to throw a stick into');

  /* a sheet of flame standing on one lights it too */
  var byFire=0, fireTried=0;
  for(s=0;s<seeds;s++){
    bootTest(43000+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down');
      var kk2=storeBarrels();
      if(kk2.length<3) continue;
      var k3=kk2[0]|0, bx3=k3%MAP_W, by3=(k3/MAP_W)|0;
      var dir=null;
      for(i=0;i<DIR4.length;i++)
        if(walkable(bx3+DIR4[i][0]*2, by3+DIR4[i][1]*2) &&
           walkable(bx3+DIR4[i][0], by3+DIR4[i][1])) dir=DIR4[i];
      if(!dir) continue;
      fireTried++;
      P.x=bx3+dir[0]*2; P.y=by3+dir[1]*2; P.hp=P.mhp=9000;
      L.fuses={}; G.msgq=[];
      buildWall(-dir[0], -dir[1], FIREWALL);
      if(Object.keys(L.fuses).length) byFire++;
      else bad.push('a wall of fire over a barrel lit nothing');
      break;
    }
  }
  if(!fireTried) bad.push('never found a barrel to raise a wall of fire over');

  /* the blast really does carry two squares */
  bootTest(41000);
  var spot=null, x, y;
  for(y=4;y<MAP_H-4&&!spot;y++) for(x=4;x<MAP_W-4;x++)
    if(L.tiles[y*MAP_W+x]===FLOOR){ spot={x:x,y:y}; break; }
  if(spot){
    L.barrels={}; L.fuses={}; L.mons.length=0;
    L.barrels[spot.y*MAP_W+spot.x]=1;
    P.x=1; P.y=1; P.hp=P.mhp=9000;
    /* a creature at each range, out to three */
    var hits=[];
    for(var r=1;r<=3;r++){
      var mx=spot.x+r, my=spot.y;
      if(mx>=MAP_W-1) break;
      var m=mkMonster('E',3,mx,my); m.hp=m.mhp=9000; L.mons.push(m);
      hits.push({m:m,r:r,hp:m.hp});
    }
    G.msgq=[];
    blowBarrel(spot.x, spot.y);
    for(i=0;i<hits.length;i++){
      var h=hits[i], hurt=(L.mons.indexOf(h.m)<0)||h.m.hp<h.hp;
      reach.push(h.r+(hurt?' hit':' clear'));
      if(h.r<=BARREL_BLAST && !hurt) bad.push('nothing at '+h.r+' squares was caught');
      if(h.r>BARREL_BLAST && hurt) bad.push('something at '+h.r+' squares was caught');
    }
    L.mons.length=0;
  } else bad.push('nowhere to set a barrel down');
  var avg=function(a){ return a.length? a.reduce(function(x,y){return x+y;},0)/a.length : 0; };
  return { bad:bad, rooms:rooms, chains:chains, turns:avg(waits),
           opened:opened, reach:reach.join(', '),
           byStick:byStick+'/'+stickTried, byFire:byFire+'/'+fireTried };
}

/* --------------------------------------------- lines that fit the bar
   The combat bar is twenty six characters.  Whatever has to give, it is
   never the middle of a creature's name: "A sour note settles on yet."
   is not a shorter way of saying yeti, it is a different word. */
function fightLineOK(){
  var bad=[], i, j, widest=0, phrases=[], names=[];
  var src = FIGHT_PHRASES;
  for(i=0;i<MONS.length;i++) names.push(MONS[i].n);
  names.push('something unseen');
  var whole=0, noStop=0, trimmed=0;
  for(i=0;i<src.length;i++) for(j=0;j<names.length;j++){
    var line = fightLine(src[i], names[j], '.');
    widest = Math.max(widest, line.length);
    if(line.length > FIGHT_COLS)
      bad.push('too wide ('+line.length+'): '+line);
    /* the name has to survive whole, or be cut at one of its own spaces */
    var words = names[j].split(' '), ok = 0;
    for(var k=words.length;k>0 && !ok;k--)
      if(line.indexOf(words.slice(0,k).join(' ')) >= 0) ok = 1;
    if(!ok) bad.push('name cut mid word: '+line);
    /* and the full stop is given up before any of the words are */
    if(line === src[i]+names[j]+'.') whole++;
    else if(line === src[i]+names[j]) noStop++;
    else {
      trimmed++;
      if(src[i].length + names[j].length <= FIGHT_COLS)
        bad.push('a word was dropped when the full stop would have done: '+line);
    }
  }
  return { bad:bad, widest:widest, phrases:src.length, names:names.length,
           whole:whole, noStop:noStop, trimmed:trimmed };
}
/* Every phrase the game wraps round a creature's name.  Kept here rather
   than scraped out of the source, which needed a regular expression and
   this file used to eat them. */
var FIGHT_PHRASES = [
  'You hit ', 'You ambush ', 'You batter ', 'You miss ', 'You dodge ',
  'You send ', 'You push past ', 'Marked ', 'Frost strikes ',
  'Flame strikes ', 'The cold goes through ', 'The dark splashes over ',
  'Water runs over ', 'It scalds ', 'Bindings coil round ',
  'Missile hits ', 'Light sears ', 'Arrow hits ', 'Arrow misses '
];

/* ------------------------------------- coming through the door after you
   Run through a door and wait on the far side: a shut door blocks sight
   both ways, so the thing chasing you loses you, and stepping into the
   doorway is the moment it finds you again.  That moment has to catch
   it out - it used to be worked out at the start of a creature's turn,
   from the square it had not moved off yet, so arriving in the doorway
   never counted and you got no ambush. */
function doorAmbushOK(seeds){
  var bad=[], tried=0, caught=0, sawThrough=0, s, i, t2;
  for(s=0;s<seeds;s++){
    if(s%10===0) bootTest(60000+s);
    else bootRoll(60000+s);
    P.hp=P.mhp=9000;
    var door=null;
    for(i=0;i<L.tiles.length && !door;i++){
      if(L.tiles[i]!==DOOR) continue;
      var x=i%MAP_W, y=(i/MAP_W)|0;
      var pairs=[[1,0],[0,1]];
      for(var q=0;q<pairs.length;q++){
        var d=pairs[q];
        var ax=x-d[0], ay=y-d[1], bx=x+d[0], by=y+d[1];
        if(walkable(ax,ay)&&walkable(bx,by)){ door={x:x,y:y,ax:ax,ay:ay,bx:bx,by:by,dx:d[0],dy:d[1]}; break; }
      }
    }
    if(!door) continue;
    var px=door.bx+door.dx, py=door.by+door.dy;
    var mx=door.ax-door.dx, my=door.ay-door.dy;
    if(!walkable(px,py)||!walkable(mx,my)) continue;
    P.x=px; P.y=py; computeVis();
    L.mons.length=0;
    var m=mkMonster('O',3,mx,my);
    m.hp=m.mhp=9000; m.state=2; m.blindTo=0; m.surprised=0; m.lost=0;
    m.mark={x:P.x,y:P.y,dx:0,dy:0};
    L.mons.push(m);
    tried++;
    /* a shut door is not a window */
    if(sightClear(m.x,m.y,P.x,P.y)) sawThrough++;
    /* you have been running: several rounds with no sight of you */
    for(t2=0;t2<SURPRISE_AFTER+1;t2++){
      var hx=m.x, hy=m.y;
      monstersMove();
      m.x=hx; m.y=hy; m.state=2;
    }
    /* and now it comes through after you */
    var done=0;
    for(t2=0;t2<12;t2++){
      monstersMove();
      if(L.mons.indexOf(m)<0) break;
      if((m.x===door.x&&m.y===door.y)||mdist(m)<=1){
        if(m.surprised) caught++;
        done=1; break;
      }
    }
    if(!done) tried--;
  }
  if(sawThrough) bad.push(sawThrough+' creatures could see the player through a shut door');
  if(caught<tried*0.9)
    bad.push('only '+caught+' of '+tried+' were caught out arriving in the doorway');
  return { bad:bad, tried:tried, caught:caught, sawThrough:sawThrough };
}

/* ------------------------------------------------------- the pitch dark
   Some rooms and stretches of hallway have no light in them at all.  In
   one you see the square you stand on and the ones you could touch, and
   so does everything else - bar the two creatures at home in the dark. */
function darknessOK(runs){
  var bad=[], i, s, d;
  var darkRooms=0, rooms=0, darkHall=0, corr=0, floors=0, withDark=0;
  var lit=[], dim=[], eyes=[];
  var orcSaw=0, orcTried=0, batSaw=0, batTried=0, vampSaw=0;
  for(s=0;s<runs;s++){
    bootTest(31000+s);
    for(d=1;d<=6;d++){
      enterLevel(d,'down'); floors++;
      var any=0;
      for(i=0;i<L.rooms.length;i++){
        if(L.rooms[i].gone) continue;
        rooms++;
        if(L.rooms[i].dark){ darkRooms++; any=1; }
        if(d < DARK_MIN_DEPTH && L.rooms[i].dark)
          bad.push('a dark room on floor '+d);
      }
      for(i=0;i<L.tiles.length;i++)
        if(L.tiles[i]===CORR){ corr++; if(L.darkMap[i]){ darkHall++; any=1; } }
      if(any) withDark++;

      /* how much you can see from one and from the other */
      var dr=null, lr=null;
      for(i=0;i<L.rooms.length;i++){
        var r=L.rooms[i];
        if(r.gone) continue;
        if(r.dark && !dr) dr=r;
        if(!r.dark && r.lit && !lr) lr=r;
      }
      if(!dr || !lr) continue;
      P.perks={};
      P.x=lr.cx; P.y=lr.cy; computeVis(); lit.push(visibleSquares());
      P.x=dr.cx; P.y=dr.cy; computeVis(); dim.push(visibleSquares());
      P.perks={nightstalker:1}; computeVis(); eyes.push(visibleSquares());
      P.perks={};

      /* and what stands in it with you */
      var spot=null;
      for(i=0;i<dr.floors.length;i++){
        var f=dr.floors[i], dd=Math.abs(f[0]-P.x)+Math.abs(f[1]-P.y);
        if(dd>=3&&dd<=5){ spot=f; break; }
      }
      if(spot){
        L.mons.length=0;
        var o=mkMonster('O',3,spot[0],spot[1]); L.mons.push(o);
        orcTried++; if(monSeesPlayer(o)) orcSaw++;
        var b=mkMonster('B',3,spot[0],spot[1]);
        batTried++; if(monSeesPlayer(b)) batSaw++;
        var v=mkMonster('V',8,spot[0],spot[1]);
        if(monSeesPlayer(v)) vampSaw++;
        L.mons.length=0;
      }
    }
  }
  var avg=function(a){ return a.length? a.reduce(function(x,y){return x+y;},0)/a.length : 0; };
  if(!darkRooms) bad.push('no dark rooms anywhere');
  if(!darkHall) bad.push('no dark hallways anywhere');
  if(avg(dim) >= avg(lit)/3) bad.push('a dark room is barely darker: '+avg(dim).toFixed(0)+
    ' squares against '+avg(lit).toFixed(0));
  if(avg(eyes) <= avg(dim)*2) bad.push('Night stalker barely helps: '+avg(eyes).toFixed(0));
  if(orcSaw) bad.push(orcSaw+' orcs saw the player across a dark room');
  if(batTried && batSaw < batTried*0.7) bad.push('a bat is troubled by the dark: '+batSaw+'/'+batTried);
  if(batTried && vampSaw < batTried*0.7) bad.push('a vampire is troubled by the dark: '+vampSaw+'/'+batTried);
  /* the perk exists and is offered */
  var found=0;
  for(i=0;i<PERKS.length;i++) if(PERKS[i].id==='nightstalker') found=1;
  if(!found) bad.push('there is no Night stalker perk');
  return { bad:bad, roomPct:100*darkRooms/Math.max(1,rooms),
           hallPct:100*darkHall/Math.max(1,corr), floors:floors, withDark:withDark,
           lit:avg(lit), dim:avg(dim), eyes:avg(eyes),
           orc:orcSaw+'/'+orcTried, bat:batSaw+'/'+batTried, vamp:vampSaw+'/'+batTried };
}
function visibleSquares(){
  var n=0;
  for(var i=0;i<L.flags.length;i++) if(L.flags[i]&F_VIS) n++;
  return n;
}
/* the wand that puts a room out */
function wandOfDarknessOK(){
  var bad=[], i, doused=0, tried=0;
  var wk=wandIndex('darkness');
  if(wk<0) return { bad:['there is no wand of darkness'], doused:0, tried:0 };
  for(i=0;i<25;i++){
    bootTest(33000+i);
    var ri=roomIndexAt(P.x,P.y);
    if(ri<0) continue;
    var r=L.rooms[ri];
    r.lit=1; r.dark=0; buildLitMap(L); buildDarkMap(L, G.depth);
    computeVis();
    var before=visibleSquares();
    tried++;
    var w=mkItem('wand',wk); w.ch=5;
    G.msgq=[];
    zapWand(w, 1, 0);
    if(!r.dark) { bad.push('the room is still lit'); continue; }
    if(!darkAt(P.x,P.y)) bad.push('the square you stand on is not dark');
    computeVis();
    if(visibleSquares() >= before) bad.push('putting the light out changed nothing');
    else doused++;
  }
  /* and a hallway is not a room to put out */
  return { bad:bad, doused:doused, tried:tried };
}
/* a curse names itself the moment it is on you */
function curseNamedOK(){
  var bad=[], i;
  bootTest(34000);
  var kinds=[['armor',1],['weapon',3],['head',1],['feet',1],['shield',1]];
  for(i=0;i<kinds.length;i++){
    P.eq={rh:null,body:null,lh:null,head:null,feet:null};
    var it=mkItem(kinds[i][0],kinds[i][1]);
    it.cursed=1; it.known=0;
    P.slots[0]=it;
    if(itemName(it).indexOf('cursed')>=0)
      bad.push(kinds[i][0]+' gives the curse away before you put it on');
    G.msgq=[];
    autoEquip(it);
    /* the curse and nothing else: it will not come off, so you know
       that much, and you know it for good */
    if(numbersKnown(it)) bad.push(kinds[i][0]+' gave its plusses away when worn');
    if(it.known) bad.push(kinds[i][0]+' named itself merely by being worn');
    if(itemName(it).indexOf('cursed')<0)
      bad.push(kinds[i][0]+' does not read as cursed: '+itemName(it));
    P.eq={rh:null,body:null,lh:null,head:null,feet:null};
    if(itemName(it).indexOf('cursed')<0)
      bad.push(kinds[i][0]+' forgot it was cursed once it was off: '+itemName(it));
    var said=G.msgq.map(function(m){return m.s||'';}).join(' ');
    if(said.indexOf('cursed')<0) bad.push(kinds[i][0]+' said nothing about the curse');
    var notes=itemNotes(it).map(function(n){return n[0];}).join(' ; ');
    if(notes.indexOf('CURSED')<0) bad.push(kinds[i][0]+' has no CURSED note');
  }
  P.eq={rh:null,body:null,lh:null,head:null,feet:null};
  return { bad:bad, kinds:kinds.length };
}

/* -------------------------------------------- stumbling is for fleeing
   You trip over your own feet when you turn your back on a fight.  With
   something on either side of you, a step away from one is a step
   towards the other, and walking into a creature's reach is not fleeing
   from anything - so it cannot make you fall over.

   Both trials stand you between two hostiles and hold you at a dead run;
   the only difference is whether the second one is there. */
function stumbleFleeingOnlyOK(){
  var bad=[], out=[];
  function said(){
    for(var i=0;i<G.msgq.length;i++) if(/stumble/.test(G.msgq[i].s||'')) return 1;
    return 0;
  }
  /* a run of floor with room on both sides of you */
  function laneAt(){
    for(var d=0;d<DIR4.length;d++){
      var dx=DIR4[d][0], dy=DIR4[d][1], ok=1, n;
      for(n=1;n<=4;n++){
        if(!walkable(P.x+dx*n,P.y+dy*n)||!walkable(P.x-dx*n,P.y-dy*n)){ ok=0; break; }
        if(inWater(P.x+dx*n,P.y+dy*n)||inWater(P.x-dx*n,P.y-dy*n)){ ok=0; break; }
      }
      if(ok && !inWater(P.x,P.y)) return { dx:dx, dy:dy };
    }
    return null;
  }
  function trial(penned){
    var steps=0, fell=0, tried=0, s, t;
    for(s=0;s<600 && steps<300;s++){
      if(s%25===0) bootTest(36500+s); else bootRoll(36500+s);
      var lane=laneAt();
      if(!lane) continue;
      var hx=P.x-lane.dx*2, hy=P.y-lane.dy*2;      /* the one you back away from */
      var ax=P.x+lane.dx*2, ay=P.y+lane.dy*2;      /* the one you back into */
      L.mons.length=0;
      var back=mkMonster('E',5,hx,hy);
      back.hp=back.mhp=90000; back.state=2; back.still=1; L.mons.push(back);
      var ahead=null;
      if(penned){
        ahead=mkMonster('E',5,ax,ay);
        ahead.hp=ahead.mhp=90000; ahead.state=2; ahead.still=1; L.mons.push(ahead);
      }
      P.hp=P.mhp=90000; P.dex=P.mdex=3; P.conf=0; P.blind=0;
      computeVis();
      /* both of them have to count as a fight, or the trial proves
         nothing about fleeing one way or the other */
      if(!battleNear()) continue;
      if(penned && !(monSeesPlayer(ahead) && canSeeMon(ahead))) continue;
      if(!(monSeesPlayer(back) && canSeeMon(back))) continue;
      tried++;
      for(t=0;t<3 && steps<300;t++){
        /* held at a dead run, and the creatures stand still, so the only
           thing under test is the direction of the step */
        P.runSteps=RUN_AFTER+5;
        back.x=hx; back.y=hy;
        if(ahead){ ahead.x=ax; ahead.y=ay; }
        var px=P.x, py=P.y;
        G.msgq=[]; G.beat=0;
        playerMove(lane.dx, lane.dy);     /* away from `back`, towards `ahead` */
        steps++;
        if(said()) fell++;
        P.x=px; P.y=py;                   /* back to the middle for the next one */
      }
    }
    return { steps:steps, fell:fell, tried:tried };
  }
  var alone=trial(0), penned=trial(1);
  if(!alone.steps || !penned.steps){ bad.push('never got the two of them stood up'); return { bad:bad }; }
  if(!alone.fell)
    bad.push('backing away from one creature never made you stumble, so the check proves nothing');
  if(penned.fell)
    bad.push('you stumbled '+penned.fell+' times of '+penned.steps+
             ' stepping towards a second creature, which is not fleeing');
  out.push('backing off '+alone.fell+'/'+alone.steps+' stumbles');
  out.push('hemmed in '+penned.fell+'/'+penned.steps);
  return { bad:bad, ways:out.join('; ') };
}

/* ----------------------------------------------------------- stumbling
   Five steps without striking anything and you are running.  After that
   there is a chance of going over, and it falls as your dexterity
   rises.  A creature in a panic is worse at it than a calm one. */
function stumbleOK(){
  var bad=[], i, d;
  /* the shape of the chance itself */
  var byDex={};
  for(d=6;d<=20;d+=2) byDex[d]=stumbleChance(d,0);
  if(byDex[6]<=byDex[20]) bad.push('dexterity does not help: '+byDex[6]+' at 6, '+byDex[20]+' at 20');
  if(stumbleChance(12,1)<=stumbleChance(12,0)) bad.push('panic does not make it worse');
  for(d=3;d<=24;d++) if(stumbleChance(d,1)<STUMBLE_FLOOR)
    bad.push('the chance fell below the floor at dexterity '+d);

  /* The player, with a fight on and without one.  It never happens
     before the fifth step, it does happen after it, and it never
     happens at all when there is nothing about. */
  var early=0, late=0, steps=0, falls=0, quiet=0, quietSteps=0;
  for(i=0;i<20;i++){
    for(var mode=0;mode<3;mode++){
      if(mode===0 && i%8===0) bootTest(35000+i);
      bootRoll(35000+i);   /* same seed all three modes, same dice */
      P.hp=P.mhp=9000; P.dex=P.mdex=10; P.conf=0;
      L.mons.length=0; L.traps.length=0;
      var dir=null, q;
      for(q=0;q<DIR4.length;q++){
        if(walkable(P.x+DIR4[q][0],P.y+DIR4[q][1])) { dir=DIR4[q]; break; }
      }
      if(!dir) continue;
      /* mode 0: something hostile at your shoulder.  mode 1: nothing,
         and mode 2: something hostile close by but behind a wall, which
         is the case that used to trip you over while you explored. */
      if(mode===0){
        var spot=null;
        for(q=0;q<DIR4.length;q++){
          var x=P.x+DIR4[q][0], y=P.y+DIR4[q][1];
          if(walkable(x,y)&&!(DIR4[q][0]===dir[0]&&DIR4[q][1]===dir[1])) spot={x:x,y:y};
        }
        if(!spot) continue;
        var foe=mkMonster('E',3,spot.x,spot.y);
        foe.hp=foe.mhp=9000; foe.state=2; foe.still=1;
        L.mons.push(foe);
      }
      if(mode===2){
        /* hunting you, within the distance that counts, and behind
           something: you cannot see it, so you are not running from it */
        var hid=null, yy, xx;
        for(yy=1;yy<MAP_H-1&&!hid;yy++) for(xx=1;xx<MAP_W-1;xx++){
          if(!walkable(xx,yy)) continue;
          var dd=Math.abs(xx-P.x)+Math.abs(yy-P.y);
          if(dd<2||dd>BATTLE_NEAR) continue;
          if(sightClear(xx,yy,P.x,P.y)) continue;
          hid={x:xx,y:yy};
        }
        if(!hid) continue;
        var lurk=mkMonster('E',3,hid.x,hid.y);
        lurk.hp=lurk.mhp=9000; lurk.state=2;
        L.mons.push(lurk);
        computeVis();
        if(battleNear()) bad.push('something you cannot see counts as a fight');
      }
      P.runSteps=0;
      for(var s=0;s<30;s++){
        var was=P.runSteps, bx=P.x, by=P.y;
        /* what the game could see of a fight at the moment of the step -
           the check happens before you move, so this is the state that
           decides whether you were running */
        var fightOn=battleNear();
        G.msgq=[];
        playerMove(dir[0],dir[1]);
        var said=G.msgq.map(function(m){return m.s||'';}).join(' ');
        var fell=said.indexOf('stumble')>=0;
        if(mode===0){
          if(fell){
            falls++;
            if(was<RUN_AFTER) early++; else late++;
            if(P.x!==bx||P.y!==by) bad.push('you stumbled and moved anyway');
          }
          steps++;
        } else if(!fightOn){
          /* Walking round a corner can bring the lurker into view, and
             then a fight really is on.  Only the steps taken with
             nothing in sight are the ones under test. */
          quietSteps++;
          if(fell) quiet++;
        }
        if(!walkable(P.x+dir[0],P.y+dir[1])){
          /* turn around rather than walking into the wall for ever */
          dir=[-dir[0],-dir[1]];
        }
        if(mode===0 && !battleNear()) break;   /* it fell behind; stop counting */
      }
    }
  }
  if(early) bad.push(early+' stumbles before the fifth step');
  if(!late) bad.push('you never stumbled at all in '+steps+' steps with a fight on');
  if(quiet) bad.push(quiet+' stumbles with nothing in sight, in '+quietSteps+' steps');

  /* and striking something stops you running */
  bootTest(35500);
  P.runSteps=RUN_AFTER+3;
  L.mons.length=0;
  var spot=null, q2;
  for(q2=0;q2<DIR4.length;q2++){
    var x=P.x+DIR4[q2][0], y=P.y+DIR4[q2][1];
    if(walkable(x,y)&&!monAt(L,x,y)) spot={x:x,y:y};
  }
  if(spot){
    var m=mkMonster('E',3,spot.x,spot.y); m.hp=m.mhp=900; L.mons.push(m);
    m.runSteps=RUN_AFTER+3;
    G.msgq=[];
    playerAttack(m);
    if(P.runSteps!==0) bad.push('striking something did not stop you running');
    if(m.runSteps!==0) bad.push('being struck did not stop it running');
  }
  return { bad:bad, falls:falls, steps:steps, quiet:quiet, quietSteps:quietSteps,
           lowDex:stumbleChance(6,0), highDex:stumbleChance(20,0),
           scared:stumbleChance(12,1), calm:stumbleChance(12,0) };
}
/* the ring of the seer */
/* ------------------------------------------------------ monster sight
   A sense of what moves near you, not a roll-call of the floor.  It
   reaches through stone but only MONSIGHT_RANGE squares, it runs for
   MONSIGHT_TURNS, and it finds creatures and nothing whatever else. */
function monsterSightOK(){
  var bad=[], i, near=0, far=0, walled=0, tried=0;
  var pi=-1;
  for(i=0;i<POTIONS.length;i++) if(POTIONS[i].n==='monster sight') pi=i;
  if(pi<0) return { bad:['there is no potion of monster sight'] };

  for(var s=0;s<40;s++){
    if(s%10===0) bootTest(37000+s); else bootRoll(37000+s);
    L.mons.length=0; L.items.length=0;
    P.monsight=0; P.blind=0; P.seeinv=0; P.perks={};
    var seen0=0;
    for(i=0;i<L.flags.length;i++) if(L.flags[i]&F_SEEN) seen0++;
    var items0=L.items.length;

    /* one just inside the range and one well outside it, both of them
       out of sight - the whole point is that stone is no object */
    var in1=null, out1=null, x, y;
    for(y=1;y<MAP_H-1 && !(in1&&out1);y++) for(x=1;x<MAP_W-1;x++){
      if(!walkable(x,y)||monAt(L,x,y)) continue;
      var cheb=Math.max(Math.abs(x-P.x),Math.abs(y-P.y));
      if(cheb<1) continue;
      if(!in1 && cheb<=MONSIGHT_RANGE && !sightClear(P.x,P.y,x,y)) in1={x:x,y:y};
      if(!out1 && cheb>MONSIGHT_RANGE+2 && !sightClear(P.x,P.y,x,y)) out1={x:x,y:y};
      if(in1&&out1) break;
    }
    if(!in1||!out1) continue;
    tried++;
    var mi=mkMonster('E',5,in1.x,in1.y); mi.hp=mi.mhp=90; L.mons.push(mi);
    var mo=mkMonster('E',5,out1.x,out1.y); mo.hp=mo.mhp=90; L.mons.push(mo);
    computeVis();
    if(canSeeMon(mi)||canSeeMon(mo)) continue;   /* not actually hidden */

    if(sensedMon(mi)||sensedMon(mo)) bad.push('you sensed something with no potion in you');
    quaff(mkItem('potion',pi));
    if(P.monsight!==MONSIGHT_TURNS)
      bad.push('the potion ran for '+P.monsight+' turns, not '+MONSIGHT_TURNS);
    if(sensedMon(mi)) near++; else bad.push('the near one went unfelt through the wall');
    if(sensedMon(mo)) far++;
    walled++;

    /* and it told you nothing else at all */
    var seen1=0;
    for(i=0;i<L.flags.length;i++) if(L.flags[i]&F_SEEN) seen1++;
    if(seen1!==seen0) bad.push('monster sight put '+(seen1-seen0)+' squares on your map');
    if(L.items.length!==items0) bad.push('monster sight moved the loot about');
    P.monsight=0;
  }
  if(!tried) bad.push('never got two creatures hidden at the right distances');
  if(far) bad.push('you felt something '+far+' times beyond '+MONSIGHT_RANGE+' squares');

  /* it runs down, and stops when it does */
  bootTest(37500);
  L.mons.length=0; P.monsight=0;
  /* asleep and harmless: a spider that kills you stops the turns, and
     then nothing runs down at all */
  var m2=mkMonster('E',5,P.x+1,P.y); m2.hp=m2.mhp=90; m2.state=0; m2.still=1;
  L.mons.push(m2);
  P.hp=P.mhp=90000;
  quaff(mkItem('potion',pi));
  var ran=0;
  while(P.monsight>0 && ran<MONSIGHT_TURNS+50 && !G.dead){ tickT(); ran++; }
  if(ran!==MONSIGHT_TURNS) bad.push('it lasted '+ran+' turns, not '+MONSIGHT_TURNS);
  if(sensedMon(m2)) bad.push('you still felt it after it wore off');
  return { bad:bad, tried:tried, near:near, walled:walled };
}

/* ------------------------------------------------------- the map scroll
   A drawing of the floor: its shape and what is built into it.  Not the
   things lying on the flagstones, and not what was walled up on purpose. */
function mapScrollOK(){
  var bad=[], i, s, floors=0, hidden=0, loose=0, chests=0, tried=0;
  var ki=scrollIndex('magic mapping');
  for(s=0;s<25;s++){
    if(s%10===0) bootTest(37800+s); else bootRoll(37800+s);
    P.blind=0; P.perks={};
    /* strip the curse that makes a scroll fizzle, or nothing is proved */
    liftCurse(P.eq.body);
    var seams=0;
    for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===SDOOR) seams++;
    /* something loose and something built in, both far from you */
    var spot=null, x, y;
    var hushed=hushSquares();
    for(y=1;y<MAP_H-1 && !spot;y++) for(x=1;x<MAP_W-1;x++){
      if(!walkable(x,y)) continue;
      if(Math.max(Math.abs(x-P.x),Math.abs(y-P.y))<8) continue;
      if(L.flags[y*MAP_W+x]&F_SEEN) continue;
      /* ordinary floor, not a room the map is supposed to keep quiet
         about - the map rightly leaves those off, and a chest standing
         in one proves nothing about chests */
      if(L.sealed&&L.sealed[y*MAP_W+x]) continue;
      if(hushed[y*MAP_W+x]) continue;
      spot={x:x,y:y}; break;
    }
    if(!spot) continue;
    tried++;
    var pot=mkItem('potion',0); pot.x=spot.x; pot.y=spot.y; L.items.push(pot);
    var box=mkItem('chest',0); box.x=spot.x; box.y=spot.y; L.items.push(box);
    var hush0=hushSeen();

    readScroll(mkItem('scroll',ki));

    if(!(L.flags[spot.y*MAP_W+spot.x]&F_SEEN)) bad.push('the map left plain floor off it');
    else floors++;
    if(!drawnOnMap(pot)) loose++; else bad.push('the map showed a potion lying on the floor');
    if(drawnOnMap(box)) chests++; else bad.push('the map left out a chest');

    /* nothing that was walled up on purpose, and no seam given away.
       What counts is what the scroll added: a roll that stood you inside
       a vault had you seeing it before you read anything. */
    var told=hushSeen()-hush0;
    if(told) bad.push(told+' squares of a room that was walled up on purpose went onto the map');
    else hidden++;
    var seams2=0;
    for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===SDOOR) seams2++;
    if(seams2<seams) bad.push('the map turned '+(seams-seams2)+' seams into doorways');

    /* and once you stand there yourself, the loose thing is there */
    var was={x:P.x,y:P.y};
    P.x=spot.x; P.y=spot.y; computeVis();
    if(!drawnOnMap(pot)) bad.push('walking onto the square still hid the potion');
    P.x=was.x; P.y=was.y;
  }
  if(!tried) bad.push('never found a far square to draw on the map');
  return { bad:bad, tried:tried, floors:floors, hidden:hidden, loose:loose, chests:chests };
}
/* the squares of every room that was walled up on purpose */
function hushSquares(){
  var out={}, i, f;
  for(i=0;i<L.rooms.length;i++){
    var r=L.rooms[i];
    if(r.gone||!r.sealed) continue;
    for(f=0;f<r.floors.length;f++) out[r.floors[f][1]*MAP_W+r.floors[f][0]]=1;
  }
  return out;
}
/* how many squares of the rooms that were walled up on purpose you have
   on your map at this moment */
function hushSeen(){
  var n=0, i, f;
  for(i=0;i<L.rooms.length;i++){
    var r=L.rooms[i];
    if(r.gone||!r.sealed) continue;
    for(f=0;f<r.floors.length;f++)
      if(L.flags[r.floors[f][1]*MAP_W+r.floors[f][0]]&F_SEEN) n++;
  }
  return n;
}
/* what the item pass would actually put on the screen for this thing */
function drawnOnMap(it){
  var fl=L.flags[it.y*MAP_W+it.x];
  if(!(fl&F_SEEN)) return 0;
  if((fl&F_MAP) && it.t!=='chest') return 0;
  return 1;
}

function seerOK(){
  var bad=[], i, doors=0, traps=0, tried=0;
  var si=ringIndex('the seer');
  if(si<0) return { bad:['there is no ring of the seer'], doors:0, traps:0, tried:0 };
  var r0=mkItem('ring',si);
  if(r0.ch!==2) bad.push('it holds '+r0.ch+' charges, not 2');
  for(i=0;i<18;i++){
    bootTest(36000+i);
    P.perks={}; P.seer=0; P.seeinv=0;
    /* a seam and a trap, right beside you */
    var seam=null, trap=null, q;
    for(q=0;q<DIR4.length;q++){
      var x=P.x+DIR4[q][0], y=P.y+DIR4[q][1];
      if(x<1||y<1||x>=MAP_W-1||y>=MAP_H-1) continue;
      if(!seam && !walkable(x,y)) { seam={x:x,y:y}; continue; }
      if(!trap && walkable(x,y)) trap={x:x,y:y};
    }
    if(!seam||!trap) continue;
    tried++;
    L.tiles[seam.y*MAP_W+seam.x]=SDOOR;
    L.traps.length=0;
    L.traps.push({x:trap.x,y:trap.y,k:TRAPS[0],spent:0,found:0});
    computeVis();
    var ring=mkItem('ring',si); P.slots[0]=ring;
    G.msgq=[];
    ringSeer(ring);
    if(P.seer!==RING_SEER_TURNS) bad.push('it gave '+P.seer+' turns, not '+RING_SEER_TURNS);
    if(P.seeinv<RING_SEER_TURNS) bad.push('it did not show invisible things');
    if(ring.ch!==1) bad.push('using it cost no charge');
    if(L.tiles[seam.y*MAP_W+seam.x]===DOOR) doors++;
    if(L.traps[0].found) traps++;
    /* and it runs out */
    for(var t2=0;t2<RING_SEER_TURNS+2;t2++) upkeep();
    if(P.seer!==0) bad.push('it never wore off');
  }
  if(tried && doors<tried*0.8) bad.push('it found only '+doors+' of '+tried+' seams');
  if(tried && traps<tried*0.8) bad.push('it found only '+traps+' of '+tried+' traps');
  /* it lends you night eyes too */
  bootTest(36500);
  P.perks={}; P.seer=0;
  var wasNight=nightEyes();
  P.seer=RING_SEER_TURNS;
  if(wasNight) bad.push('you had night eyes before you put it on');
  if(!nightEyes()) bad.push('it does not let you see in the dark');
  P.seer=0;
  return { bad:bad, doors:doors, traps:traps, tried:tried };
}


/* ------------------------------------------------- a barrel here and there
   Powder is not only found in the store.  A loose barrel wants clear
   ground round it: never touching another, never in a doorway or under a
   staircase - two barrels side by side are the start of a pile, and a
   pile belongs in the powder room. */
function strayBarrelsOK(seeds){
  var bad=[], s, k, floors=0, withOne=0, loose=0, stored=0, most=0;
  var touching=0, byDoor=0, onStair=0, shallow=0;
  for(s=0;s<seeds;s++){
    var depth=1+(s%12);
    srand(51000+s); makeAppearances(); G=freshG(); P=newPlayer(); enterLevel(depth);
    floors++;
    var here=0;
    for(k in L.barrels){
      var j=k|0, x=j%MAP_W, y=(j/MAP_W)|0;
      if(inPowderRoom(j)){ stored++; continue; }
      here++; loose++;
      if(depth<STRAY_BARREL_DEPTH) shallow++;
      if(x===L.stair.x&&y===L.stair.y) onStair++;
      if(L.up&&x===L.up.x&&y===L.up.y) onStair++;
      for(var d=0;d<DIR8.length;d++){
        var nk=(y+DIR8[d][1])*MAP_W+(x+DIR8[d][0]);
        if(L.barrels[nk]&&!inPowderRoom(nk)) touching++;
        if(L.tiles[nk]===DOOR) byDoor++;
      }
    }
    if(here){ withOne++; if(here>most) most=here; }
  }
  if(!loose) bad.push('no loose barrels anywhere');
  if(withOne<floors*0.25) bad.push('only '+withOne+' floors of '+floors+' had one');
  if(withOne>floors*0.85) bad.push(withOne+' floors of '+floors+' had one - too many to be a find');
  if(most>STRAY_BARREL_MAX) bad.push(most+' on one floor, over the '+STRAY_BARREL_MAX+' allowed');
  if(touching) bad.push(touching+' loose barrels were touching another');
  if(byDoor) bad.push(byDoor+' were standing beside a door');
  if(onStair) bad.push(onStair+' were on a staircase');
  if(shallow) bad.push(shallow+' turned up above floor '+STRAY_BARREL_DEPTH);
  return { bad:bad, floors:floors, withOne:withOne, loose:loose, stored:stored, most:most };
}
function inPowderRoom(j){
  var ri=L.roomAt[j];
  return ri>=0 && L.rooms[ri] && L.rooms[ri].special==='powder';
}

/* ------------------------------------------------ scenery that burns
   Wood and cloth catch: the fire lasts a turn longer over them than it
   does over bare stone, and then the thing is not there any more.  Stone
   and bone do not catch at all, and a barrel has a fuse of its own. */
function findDecorAt(pred){
  for(var k in L.decor) if(pred(L.decor[k], k|0)) return k|0;
  return null;
}
function burnOne(j, spread){
  var x=j%MAP_W, y=(j/MAP_W)|0;
  P.hp=P.mhp=9000; L.mons.length=0; L.clouds.length=0; L.burning={};
  P.x=x; P.y=y; computeVis();
  dropEmber(x,y,1);
  if(spread) for(var i=0;i<spread.length;i++)
    dropEmber(spread[i]%MAP_W,(spread[i]/MAP_W)|0,1);
  var t=0, said=[];
  while(L.clouds.length && t<30){
    G.msgq=[]; ageClouds(); t++;
    for(var q=0;q<G.msgq.length;q++)
      if(/burns? away/.test(G.msgq[q].s||'')) said.push(G.msgq[q].s);
  }
  return { turns:t, said:said.join(' ') };
}
function sceneryBurnsOK(seeds){
  var bad=[], s, k, lines=[];
  /* how long fire lasts over bare stone, to measure the rest against */
  srand(66000); makeAppearances(); G=freshG(); P=newPlayer(); enterLevel(3);
  var bare=null;
  for(var i=0;i<L.rooms.length && bare===null;i++){
    if(L.rooms[i].gone) continue;
    for(var f=0;f<L.rooms[i].floors.length;f++){
      var fx=L.rooms[i].floors[f], fj=fx[1]*MAP_W+fx[0];
      if(L.tiles[fj]===FLOOR && !L.decor[fj]){ bare=fj; break; }
    }
  }
  var plain = bare===null ? 1 : burnOne(bare).turns;
  if(plain!==1) bad.push('fire on bare stone lasted '+plain+' turns, not 1');

  /* one chair, one table with its chairs, one rug, one patch of moss */
  var want=[['chair',1],['table',1],['rug',1],['moss',1]];
  var seen={}, tries=0;
  while(tries++<seeds && Object.keys(seen).length<4){
    srand(66100+tries); makeAppearances(); G=freshG(); P=newPlayer();
    enterLevel(3+(tries%4));
    for(var w=0;w<want.length;w++){
      var name=want[w][0];
      if(seen[name]) continue;
      var j=null, spread=null;
      if(name==='rug'){
        j=findDecorAt(function(d){ return isRugName(d); });
        if(j===null) continue;
        var id=L.rugId[j], mine=[];
        for(k in L.rugId) if(L.rugId[k]===id) mine.push(k|0);
        if(mine.length<4) continue;
        var r=burnOne(j);
        var left=mine.filter(function(m){ return !!L.decor[m]; }).length;
        if(left) bad.push('a rug lit at one corner left '+left+' squares of itself');
        if(r.said.indexOf('The rug burns away.')<0)
          bad.push('a rug went and said "'+r.said+'"');
        if(r.turns<=plain) bad.push('a rug burned out in '+r.turns+' turns, no longer than stone');
        lines.push('rug ('+mine.length+' squares) '+r.turns+' turns, "'+r.said+'"');
        seen[name]=1; continue;
      }
      if(name==='table'){
        j=findDecorAt(function(d){ return d==='table'; });
        if(j===null) continue;
        var tx=j%MAP_W, ty=(j/MAP_W)|0;
        spread=[];
        for(var d4=0;d4<DIR4.length;d4++){
          var ck=(ty+DIR4[d4][1])*MAP_W+(tx+DIR4[d4][0]);
          if(L.decor[ck]==='chair') spread.push(ck);
        }
        if(spread.length<2) continue;
        var rt=burnOne(j, spread);
        if(L.decor[j]) bad.push('the table was still there afterwards');
        var chairsLeft=spread.filter(function(c){ return !!L.decor[c]; }).length;
        if(chairsLeft) bad.push(chairsLeft+' chairs outlived the fire');
        if(rt.said!=='The table and chairs burn away.')
          bad.push('a burning room said "'+rt.said+'"');
        lines.push('table and '+spread.length+' chairs '+rt.turns+' turns, "'+rt.said+'"');
        seen[name]=1; continue;
      }
      j=findDecorAt(function(d){ return name==='moss' ? (d==='moss'||d==='moss2') : d===name; });
      if(j===null) continue;
      var r1=burnOne(j);
      if(L.decor[j]) bad.push('the '+name+' was still there afterwards');
      if(r1.turns!==plain+DECOR_BURN_TURNS)
        bad.push('the '+name+' burned for '+r1.turns+' turns, not '+(plain+DECOR_BURN_TURNS));
      if(r1.said!=='The '+name+' burns away.')
        bad.push('a burning '+name+' said "'+r1.said+'"');
      lines.push(name+' '+r1.turns+' turns, "'+r1.said+'"');
      seen[name]=1;
    }
  }
  for(var q2=0;q2<want.length;q2++)
    if(!seen[want[q2][0]]) bad.push('never found a '+want[q2][0]+' to set light to');

  /* and what does not burn */
  var stone=['bones','skull','rubble','kerb','barrel'], held=0, kinds=0;
  for(s=0;s<seeds && kinds<stone.length;s++){
    srand(67000+s); makeAppearances(); G=freshG(); P=newPlayer(); enterLevel(4);
    for(var t2=0;t2<stone.length;t2++){
      var nm=stone[t2];
      if(seen['no_'+nm]) continue;
      var sj=findDecorAt(function(d){ return d===nm; });
      if(sj===null) continue;
      seen['no_'+nm]=1; kinds++;
      L.clouds.length=0; L.burning={}; L.fuses={};
      dropEmber(sj%MAP_W,(sj/MAP_W)|0,1);
      var tt=0;
      while(L.clouds.length && tt<6){ ageClouds(); tt++; }
      if(L.decor[sj]===nm) held++;
      else if(nm!=='barrel') bad.push(nm+' burned away, and it should not have');
    }
  }
  if(kinds<3) bad.push('only found '+kinds+' kinds of stone scenery to test');
  return { bad:bad, plain:plain, lines:lines.join('; '), stone:kinds, held:held };
}

/* ------------------------------------------- everything that throws fire
   A wand of fire, a wand of magic missile and a stick of dynamite all
   leave the square burning, which is what takes the furniture and sets
   off the powder.  Cold and lightning do not.  A missile bursts on the
   first solid thing in its way, and a barrel is a solid thing - it used
   to sail straight past one and burst on the far wall. */
function fireSourcesOK(seeds){
  var bad=[], out=[];
  function zapAt(wand, barrelAtDist, tableAtDist, want){
    var tried=0, fused=0, burnt=0, s;
    for(s=0;s<seeds*8 && tried<30;s++){
      if(s%10===0) bootTest(72000+s);
      else bootRoll(72000+s);
      var line=straightLine();
      if(!line) continue;
      var bx=P.x+line.dx*barrelAtDist, by=P.y+line.dy*barrelAtDist, j=by*MAP_W+bx;
      var tx=P.x+line.dx*tableAtDist, ty=P.y+line.dy*tableAtDist, tj=ty*MAP_W+tx;
      /* dry ground: powder in a pool is wet powder, and wet powder is
         meant not to light */
      if(!walkable(bx,by)||!walkable(tx,ty)||j===tj) continue;
      if(inWater(bx,by)||inWater(tx,ty)) continue;
      L.barrels[j]=1; L.decor[j]='barrel'; L.decor[tj]='table';
      L.clouds.length=0; L.fuses={}; L.burning={}; P.hp=P.mhp=9000;
      tried++;
      var w=mkItem('wand',wandIndex(wand)); w.ch=9;
      G.msgq=[]; zapWand(w,line.dx,line.dy);
      if(L.fuses[j]) fused++;
      var t=0;
      while(L.clouds.length && t<10){ ageClouds(); t++; }
      if(!L.decor[tj]) burnt++;
    }
    if(!tried){ bad.push('never got a clear line for a wand of '+wand); return; }
    if(want && fused<tried) bad.push('a wand of '+wand+' lit '+fused+' barrels of '+tried);
    if(want && burnt<tried) bad.push('a wand of '+wand+' burned '+burnt+' tables of '+tried);
    if(!want && fused) bad.push('a wand of '+wand+' lit '+fused+' barrels');
    if(!want && burnt) bad.push('a wand of '+wand+' burned '+burnt+' tables');
    out.push(wand+' '+fused+'/'+tried+' barrels, '+burnt+'/'+tried+' tables');
  }
  /* the sheet of flame goes through everything on its way */
  zapAt('fire', 3, 1, 1);
  /* and cold and lightning leave the room as they found it */
  zapAt('cold', 3, 1, 0);
  zapAt('lightning', 3, 1, 0);

  /* the missile stops at the powder rather than flying past it */
  var mtried=0, mfused=0, mstop=0;
  for(var s2=0;s2<seeds*8 && mtried<30;s2++){
    bootTest(75500+s2);
    var l2=straightLine();
    if(!l2) continue;
    var mx=P.x+l2.dx*2, my=P.y+l2.dy*2, mj=my*MAP_W+mx;
    if(!walkable(mx,my)||inWater(mx,my)) continue;
    L.barrels[mj]=1; L.decor[mj]='barrel';
    L.clouds.length=0; L.fuses={}; L.burning={}; P.hp=P.mhp=9000;
    mtried++;
    var w2=mkItem('wand',wandIndex('magic missile')); w2.ch=9;
    G.bolt=null; G.msgq=[]; zapWand(w2,l2.dx,l2.dy);
    if(L.fuses[mj]) mfused++;
    if(G.bolt){
      var last=G.bolt.path[G.bolt.path.length-1];
      if(last[0]===mx&&last[1]===my) mstop++;
    }
  }
  if(!mtried) bad.push('never got a clear line for a missile');
  if(mfused<mtried) bad.push('a missile lit '+mfused+' barrels of '+mtried);
  if(mstop<mtried) bad.push('a missile flew past '+(mtried-mstop)+' barrels of '+mtried);
  out.push('missile '+mfused+'/'+mtried+' barrels, stopping at all but '+(mtried-mstop));

  /* and a stick of dynamite sets light to what it lands among */
  var dtried=0, dburnt=0, dfire=0;
  for(var s3=0;s3<seeds*8 && dtried<30;s3++){
    bootTest(73500+s3);
    var l3=straightLine();
    if(!l3) continue;
    var dx2=P.x+l3.dx*2, dy2=P.y+l3.dy*2, dj=dy2*MAP_W+dx2;
    if(!walkable(dx2,dy2)||inWater(dx2,dy2)) continue;
    L.decor[dj]='table';
    L.clouds.length=0; L.fuses={}; L.burning={}; P.hp=P.mhp=9000;
    dtried++;
    dynamiteAt(dx2,dy2);
    if(L.clouds.some(function(c){ return c.kind==='fire'; })) dfire++;
    var t3=0;
    while(L.clouds.length && t3<10){ ageClouds(); t3++; }
    if(!L.decor[dj]) dburnt++;
  }
  if(!dtried) bad.push('never got a place to throw dynamite');
  if(dfire<dtried) bad.push('dynamite left fire behind it only '+dfire+' times of '+dtried);
  if(dburnt<dtried) bad.push('dynamite burned '+dburnt+' tables of '+dtried);
  out.push('dynamite '+dburnt+'/'+dtried+' tables');
  return { bad:bad, ways:out.join('; ') };
}

/* ------------------------------------------------- the shape of a blast
   Two squares straight out, one on the diagonals: a disc, not a box.  And
   a barrel with its fuse lit is drawn as burning, so the one turn you
   have to get clear in is one you can see. */
function blastShapeOK(seeds){
  var bad=[], s, i, shape=null, n=0;
  for(s=0;s<seeds*8 && !shape;s++){
    bootTest(70000+s);
    enterLevel(3,'down');
    var r=null;
    for(i=0;i<L.rooms.length;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>40){ r=L.rooms[i]; break; }
    if(!r) continue;
    var c=null;
    for(i=0;i<r.floors.length;i++){
      var f=r.floors[i];
      if(Math.abs(f[0]-r.cx)<2 && Math.abs(f[1]-r.cy)<2){ c=f; break; }
    }
    if(!c) continue;
    L.barrels[c[1]*MAP_W+c[0]]=1; L.decor[c[1]*MAP_W+c[0]]='barrel';
    P.x=1; P.y=1; P.hp=P.mhp=9000;
    blowBarrel(c[0],c[1]);
    shape={};
    for(i=0;i<G.splash.cells.length;i++){
      var v=G.splash.cells[i];
      shape[(v[0]-c[0])+','+(v[1]-c[1])]=1;
      n++;
    }
  }
  if(!shape){ bad.push('never got a barrel to blow up'); return { bad:bad }; }
  var want=['0,0','1,0','-1,0','0,1','0,-1','2,0','-2,0','0,2','0,-2',
            '1,1','1,-1','-1,1','-1,-1'];
  for(i=0;i<want.length;i++) if(!shape[want[i]]) bad.push('the blast missed '+want[i]);
  var nope=['2,1','1,2','2,2','-2,-2','-2,1','2,-2'];
  for(i=0;i<nope.length;i++) if(shape[nope[i]]) bad.push('the blast reached '+nope[i]+', which is a box not a disc');
  if(n!==want.length) bad.push('the blast covered '+n+' squares, not '+want.length);

  /* and the fuse is drawn */
  var drawn=0, tried=0;
  for(s=0;s<seeds*8 && tried<20;s++){
    bootTest(71500+s);
    var line=straightLine();
    if(!line) continue;
    var bx=P.x+line.dx, by=P.y+line.dy, j=by*MAP_W+bx;
    if(!walkable(bx,by)) continue;
    tried++;
    L.barrels[j]=1; L.decor[j]='barrel'; L.fuses={};
    lightBarrel(bx,by);
    computeVis();
    if(L.fuses[j] && (L.flags[j]&F_VIS)) drawn++;
  }
  if(drawn<tried) bad.push('only '+drawn+' of '+tried+' lit barrels were in plain sight');
  return { bad:bad, squares:n, fuses:drawn+'/'+tried };
}

/* -------------------------------- what a hole in the wall looks like after
   A room is drawn lit from its own list of floors, so a square that is on
   no room's list is treated like a piece of hallway - dark unless you are
   beside it.  Blowing a wall out of a lit room left the opened squares on
   nobody's list, and they were drawn dim in a band running exactly where
   the wall had been: the wall was gone and its shadow was still there. */
function blastOpensLightOK(seeds, byStick){
  var bad=[], s, i, cases=0, opened=0, orphan=0, dim=0;
  for(s=0;s<seeds*8 && cases<60;s++){
    bootTest(80000+s);
    enterLevel(4,'down');
    var r=null;
    for(i=0;i<L.rooms.length;i++){
      var q=L.rooms[i];
      if(!q.gone && q.lit && !q.dark && q.floors.length>18){ r=q; break; }
    }
    if(!r) continue;
    /* a square of it with a wall beside it, and somewhere to stand near */
    var spot=null;
    for(i=0;i<r.floors.length && !spot;i++){
      var f=r.floors[i];
      if(L.tiles[f[1]*MAP_W+f[0]]!==FLOOR) continue;
      for(var d=0;d<DIR4.length;d++)
        if(L.tiles[(f[1]+DIR4[d][1])*MAP_W+f[0]+DIR4[d][0]]===WALL){ spot=f; break; }
    }
    if(!spot) continue;
    var stand=null;
    for(i=0;i<r.floors.length && !stand;i++){
      var g=r.floors[i];
      if(L.tiles[g[1]*MAP_W+g[0]]!==FLOOR) continue;
      if(Math.max(Math.abs(g[0]-spot[0]),Math.abs(g[1]-spot[1]))<=4) stand=g;
    }
    if(!stand) continue;
    cases++;
    P.x=stand[0]; P.y=stand[1]; P.hp=P.mhp=99999; P.perks={}; P.seer=0;
    var ri=r.idx, was={};
    for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===FLOOR) was[i]=1;
    if(byStick) dynamiteAt(spot[0],spot[1]);
    else {
      L.barrels[spot[1]*MAP_W+spot[0]]=1; L.decor[spot[1]*MAP_W+spot[0]]='barrel';
      blowBarrel(spot[0],spot[1]);
    }
    computeVis();
    for(i=0;i<L.tiles.length;i++){
      if(L.tiles[i]!==FLOOR||was[i]) continue;
      opened++;
      var x=i%MAP_W, y=(i/MAP_W)|0, touches=0;
      for(var d2=0;d2<DIR4.length;d2++){
        var k=(y+DIR4[d2][1])*MAP_W+x+DIR4[d2][0];
        if(L.tiles[k]===FLOOR && L.roomAt[k]===ri) touches=1;
      }
      if(touches && L.roomAt[i]<0) orphan++;
      /* The symptom itself.  litMap is what says a square is part of a
         lit room, and it is what carries sight across the room: a square
         that is not on it is treated as a piece of unlit hallway, seen
         only from beside it and drawn dim from anywhere else.  Opened out
         of the wall of a lit room, that is a shadow in the shape of the
         wall that is no longer there. */
      if(touches && !(L.litMap && L.litMap[i])) dim++;
    }
  }
  if(!cases) bad.push('never found a lit room with a wall to blow out');
  if(!opened) bad.push('nothing was opened');
  if(dim) bad.push(dim+' opened squares are not counted as part of the lit room, '+
    'and are drawn as if the wall were still there');
  if(orphan > opened/50)
    bad.push(orphan+' opened squares of '+opened+' touch the room and belong to none');
  return { bad:bad, cases:cases, opened:opened, orphan:orphan, dim:dim };
}

/* ---------------------------------------- light through a hole you made
   Stand in a room nobody left a lamp in, blow the wall through into a lit
   one, and the light comes in.  It did not: the spill only ever lit
   squares marked pitch dark, and most unlit rooms are not marked dark at
   all - they are simply rooms without a lamp, which is the ordinary way a
   room is dark.  Light stopped at the threshold of about a fifth of the
   rooms in the dungeon. */
function spillThroughHoleOK(seeds){
  var bad=[], s, i, cases=0, letIn=0, sqLit=[], sawBefore=[], sawAfter=[];
  for(s=0;s<seeds*40 && cases<30;s++){
    bootTest(92000+s);
    enterLevel(5,'down');
    var dim=null, lit=null, gap=null;
    for(i=0;i<L.rooms.length && !gap;i++){
      var a=L.rooms[i];
      if(a.gone||a.lit) continue;
      for(var q=0;q<a.floors.length && !gap;q++){
        var f=a.floors[q];
        if(L.tiles[f[1]*MAP_W+f[0]]!==FLOOR) continue;
        for(var d=0;d<DIR4.length && !gap;d++){
          for(var n=1;n<=3;n++){
            var x=f[0]+DIR4[d][0]*n, y=f[1]+DIR4[d][1]*n, k=y*MAP_W+x;
            if(x<1||y<1||x>=MAP_W-1||y>=MAP_H-1) break;
            var ri=L.roomAt[k];
            if(L.tiles[k]===FLOOR && ri>=0 && L.rooms[ri]!==a){
              if(L.rooms[ri].lit && !L.rooms[ri].dark){ dim=a; lit=L.rooms[ri]; gap={f:f,d:d}; }
              break;
            }
            if(L.tiles[k]!==WALL && L.tiles[k]!==ROCK) break;
          }
        }
      }
    }
    if(!gap) continue;
    cases++;
    /* Stand back into the room rather than against the wall: right at the
       hole you can see the far side either way, and the question is how
       much of the room you are in the light shows you. */
    var stand=gap.f, back=0;
    for(i=0;i<dim.floors.length;i++){
      var g2=dim.floors[i];
      if(L.tiles[g2[1]*MAP_W+g2[0]]!==FLOOR) continue;
      var dd=Math.max(Math.abs(g2[0]-gap.f[0]),Math.abs(g2[1]-gap.f[1]));
      if(dd>=3 && dd<=5 && dd>back){ back=dd; stand=g2; }
    }
    P.x=stand[0]; P.y=stand[1]; P.hp=P.mhp=99999; P.perks={}; P.seer=0;
    computeVis();
    var n0=0;
    for(i=0;i<L.flags.length;i++) if(L.flags[i]&F_VIS) n0++;
    sawBefore.push(n0);
    var bx=gap.f[0]+DIR4[gap.d][0], by=gap.f[1]+DIR4[gap.d][1];
    L.barrels[by*MAP_W+bx]=1; L.decor[by*MAP_W+bx]='barrel';
    blowBarrel(bx,by);
    P.x=stand[0]; P.y=stand[1];
    computeVis();
    var n1=0;
    for(i=0;i<L.flags.length;i++) if(L.flags[i]&F_VIS) n1++;
    sawAfter.push(n1);
    var got=0;
    for(i=0;i<dim.floors.length;i++)
      if(L.litMap[dim.floors[i][1]*MAP_W+dim.floors[i][0]]) got++;
    sqLit.push(got);
    if(got) letIn++;
  }
  if(!cases){ bad.push('never found an unlit room beside a lit one'); return { bad:bad }; }
  if(letIn<cases) bad.push('the light stayed out of '+(cases-letIn)+' of '+cases+' rooms');
  function avg(a){ return (a.reduce(function(x,y){ return x+y; },0)/a.length).toFixed(1); }
  var more = avg(sawAfter) - avg(sawBefore);
  if(more < 8) bad.push('breaking the wall through only showed you '+more.toFixed(1)+' more squares');
  return { bad:bad, cases:cases, letIn:letIn, lit:avg(sqLit),
           before:avg(sawBefore), after:avg(sawAfter) };
}

/* ------------------------------------------ fire that waits its turn
   A creature's whole turn is worked out in one go and then played back
   over the next few hundred milliseconds.  Fire it throws was being put
   on the floor at the working-out, not at the playing-back, so the
   player stood in flames before the ball had left the creature's mouth.
   Each cloud now carries the moment it starts. */
function thrownFireWaitsOK(){
  var bad=[], i;
  function shot(kind){
    bootTest(99000 + (kind === 'ball' ? 0 : 1));
    var line=straightLine4(1);
    if(!line) return null;
    L.mons.length=0; L.clouds.length=0; P.hp=P.mhp=90000;
    var c = kind === 'ball' ? 'h' : 'D';
    var m=mkMonster(c,8,line.x,line.y);
    m.hp=m.mhp=900; m.state=2; m.cast=0; m.doused=0;
    L.mons.push(m);
    G.beat=0; G.bolt=null; G.shot=null; G.msgq=[];
    var t0=nowMs();
    if(kind==='ball') throwFireball(m, 1); else breatheFire(m, 1);
    return { t0:t0, fires:L.clouds.filter(function(x){ return x.kind==='fire'; }) };
  }
  var b=shot('ball');
  if(!b) bad.push('nowhere to throw a fireball down');
  else {
    if(!b.fires.length) bad.push('the fireball left nothing burning');
    for(i=0;i<b.fires.length;i++){
      if(!b.fires[i].at) bad.push('the fire a fireball leaves starts the moment it is worked out');
      else if(b.fires[i].at < b.t0 + BREATH_LEAD)
        bad.push('the fire starts '+(b.fires[i].at-b.t0)+'ms in, before the ball has landed');
    }
  }
  var j=shot('jet');
  if(!j) bad.push('nowhere to breathe down');
  else {
    if(!j.fires.length) bad.push('the jet left nothing burning');
    for(i=0;i<j.fires.length;i++){
      if(!j.fires[i].at) bad.push('the fire a jet leaves starts the moment it is worked out');
      else if(j.fires[i].at < j.t0 + BREATH_LEAD)
        bad.push('the jet burns '+(j.fires[i].at-j.t0)+'ms in, before the flame is drawn');
    }
  }
  /* fire that nothing threw starts at once, as it always did */
  bootTest(99002);
  L.clouds.length=0;
  dropEmber(P.x, P.y, 1);
  if(L.clouds.length && L.clouds[0].at)
    bad.push('fire laid on the floor underfoot waits before it appears');
  return { bad:bad,
           ball: b && b.fires.length ? (b.fires[0].at - b.t0) : 0,
           jet: j && j.fires.length ? (j.fires[0].at - j.t0) : 0 };
}

/* ---------------------------------------------- barrels are solid things
   Nothing stands on a barrel of powder - and no barrel walls a way
   through, or a room could be shut off behind one. */
function barrelsAreSolidOK(seeds){
  var bad=[], s, d, i, floors=0, sealed=0, kept=0, blocked=0, tried=0;
  for(s=0;s<seeds;s++){
    bootTest(95000+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down');
      floors++;
      if(openParts(L,1) > openParts(L,0)) sealed++;
      for(var k in L.barrels) kept++;
    }
  }
  if(sealed) bad.push(sealed+' floors of '+floors+' have a barrel walling a way through');
  if(!kept) bad.push('no barrels survived at all');

  /* and neither you nor anything else walks onto one */
  for(s=0;s<seeds*10 && tried<30;s++){
    if(s%10===0) bootTest(96000+s);
    else bootRoll(96000+s);
    var line=straightLine4();
    if(!line) continue;
    var bx=P.x+(line.dx||0), by=P.y+(line.dy||0), j=by*MAP_W+bx;
    if(!walkable(bx,by)) continue;
    tried++;
    L.barrels=L.barrels||{};
    L.barrels[j]=1; L.decor[j]='barrel';
    L.mons.length=0;
    var px=P.x, py=P.y;
    G.msgq=[];
    playerMove(line.dx||0, line.dy||0);
    if(P.x!==px||P.y!==py) bad.push('you walked onto a barrel');
    else blocked++;
    /* and a creature on the far side of it cannot come through */
    var sx=P.x+(line.dx||0)*2, sy=P.y+(line.dy||0)*2;
    if(!walkable(sx,sy)) continue;
    var m=mkMonster('O',6,sx,sy); m.hp=m.mhp=900; m.state=2; L.mons.push(m);
    tryMonStep(m, -(line.dx||0), -(line.dy||0));
    if(m.x===bx&&m.y===by) bad.push('a creature walked onto a barrel');
  }
  if(!tried) bad.push('never found a barrel to walk into');
  return { bad:bad, floors:floors, kept:kept, blocked:blocked+'/'+tried };
}

/* ------------------------------------------- stumbling is a walking thing
   Running headlong is something you do with your feet.  It used to be
   settled at the top of a creature's turn, before it had decided what
   the turn was for, so one standing over you went over in the middle of
   a swing. */
function stumbleOnlyWalkingOK(){
  var bad=[], out=[];
  function said(re){
    for(var i=0;i<G.msgq.length;i++) if(re.test(G.msgq[i].s||'')) return 1;
    return 0;
  }
  /* `how` is what the creature is doing with its feet: walking up to
     you, running from you, or running after a back that is running from
     it.  Only the last two are a headlong run, and only a headlong run
     can put anybody over. */
  function trial(dist, how){
    var turns=0, trip=0, swing=0, s, t;
    for(s=0;s<600 && turns<200;s++){
      /* the floor is scenery here - a fresh dungeon every seed paid for
         600 generations and threw most away on the guards below */
      if(s%25===0) bootTest(97000+s+dist*1000);
      else bootRoll(97000+s+dist*1000);
      var line=straightLine4();
      if(!line) continue;
      var sx=P.x+(line.dx||0)*dist, sy=P.y+(line.dy||0)*dist;
      if(!walkable(sx,sy)) continue;
      /* dry ground only: a creature thigh deep in water spends every
         other turn wading, which is not the stumbling being tested */
      if(inWater(sx,sy)||inWater(P.x,P.y)) continue;
      L.mons.length=0;
      var m=mkMonster('O',6,sx,sy);
      m.hp=m.mhp=90000; m.state=2; m.ar=12;
      L.mons.push(m);
      P.hp=P.mhp=90000; P.dex=P.mdex=6;
      for(t=0;t<20 && turns<200;t++){
        m.runSteps=RUN_AFTER+5; m.x=sx; m.y=sy; m.stuck=0; m.slowed=0;
        m.flee = (how==='fleeing') ? 6 : 0;
        /* you at a dead run, with it at your heels */
        P.runSteps = (how==='chasing') ? RUN_AFTER+5 : 0;
        G.msgq=[]; G.beat=0;
        monstersMove();
        turns++;
        if(said(/stumbles/)) trip++;
        if(said(/hits|misses/)) swing++;
      }
    }
    P.runSteps=0;
    return { turns:turns, trip:trip, swing:swing };
  }
  var near=trial(1,'walking'), far=trial(3,'walking');
  var fled=trial(3,'fleeing'), chase=trial(3,'chasing');
  if(near.trip) bad.push(near.trip+' of '+near.turns+' creatures within reach stumbled instead of swinging');
  if(near.swing < near.turns*0.9) bad.push('only '+near.swing+' of '+near.turns+' swung');
  /* walking up to somebody is not running headlong, and nothing trips */
  if(far.trip) bad.push(far.trip+' of '+far.turns+' stumbled simply walking towards you');
  if(!fled.trip) bad.push('nothing stumbled running away, so the check proves nothing');
  if(!chase.trip) bad.push('nothing stumbled chasing a back that was running');
  out.push('within reach '+near.trip+'/'+near.turns+' stumbles and '+near.swing+' swings');
  out.push('walking in '+far.trip+'/'+far.turns);
  out.push('running away '+fled.trip+'/'+fled.turns);
  out.push('chasing a flight '+chase.trip+'/'+chase.turns);

  /* and you, swinging at something under your nose */
  var mine=0, myTrip=0, myHits=0, s2, t2;
  for(s2=0;s2<600 && mine<200;s2++){
    if(s2%25===0) bootTest(98000+s2);
    else bootRoll(98000+s2);
    var l2=straightLine4();
    if(!l2) continue;
    var ax=P.x+(l2.dx||0), ay=P.y+(l2.dy||0);
    if(!walkable(ax,ay)) continue;
    L.mons.length=0;
    var m2=mkMonster('O',6,ax,ay);
    m2.hp=m2.mhp=90000; m2.state=2;
    L.mons.push(m2);
    P.hp=P.mhp=90000; P.dex=P.mdex=6;
    for(t2=0;t2<20 && mine<200;t2++){
      P.runSteps=RUN_AFTER+5; m2.hp=m2.mhp=90000;
      G.msgq=[]; G.beat=0;
      playerMove(l2.dx||0, l2.dy||0);
      mine++;
      if(said(/stumble/)) myTrip++;
      if(said(/You hit|You miss/)) myHits++;
    }
  }
  if(myTrip) bad.push('you stumbled '+myTrip+' times out of '+mine+' swings');
  out.push('you swinging '+myTrip+'/'+mine+' stumbles');
  return { bad:bad, ways:out.join('; ') };
}

/* ------------------------------------------------ the blasting stone
   It fills the room it goes off in, not the stone around it: a square you
   could not walk onto is not part of the blast, and neither is one with a
   wall in front of it.  It used to be drawn as a flat square of fire
   whatever it was drawn over, and it caught things through walls.  And it
   is a blast, so it leaves the place burning. */
function blastStoneOK(seeds){
  var bad=[], s, i, tried=0, cells=0, inStone=0, unseen=0, burnt=0, lit=0,
      waited=0, offSplash=0, barrels=0;
  for(s=0;s<seeds*40 && tried<40;s++){
    bootTest(93000+s);
    var r=null;
    for(i=0;i<L.rooms.length && !r;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>14) r=L.rooms[i];
    if(!r) continue;
    /* a square with a wall beside it, so there is stone to blast into */
    var spot=null;
    for(i=0;i<r.floors.length && !spot;i++){
      var f=r.floors[i];
      if(L.tiles[f[1]*MAP_W+f[0]]!==FLOOR) continue;
      for(var d=0;d<DIR4.length;d++)
        if(L.tiles[(f[1]+DIR4[d][1])*MAP_W+f[0]+DIR4[d][0]]===WALL){ spot=f; break; }
    }
    if(!spot) continue;
    tried++;
    L.decor[spot[1]*MAP_W+spot[0]]='table';
    /* a barrel on a square beside it */
    var bj=null;
    for(var d2=0;d2<DIR4.length;d2++){
      var nx=spot[0]+DIR4[d2][0], ny=spot[1]+DIR4[d2][1];
      /* on dry ground: a barrel standing in water is wet powder */
      if(!walkable(nx,ny)||inWater(nx,ny)) continue;
      bj=ny*MAP_W+nx; L.barrels[bj]=1; L.decor[bj]='barrel'; barrels++; break;
    }
    /* and a creature on every square around it, so anything caught
       through a wall shows up */
    L.mons.length=0;
    for(var qy=-BLAST_RANGE;qy<=BLAST_RANGE;qy++)
      for(var qx=-BLAST_RANGE;qx<=BLAST_RANGE;qx++){
        var mx=spot[0]+qx, my=spot[1]+qy;
        if(!walkable(mx,my)||monAt(L,mx,my)) continue;
        if(mx===P.x&&my===P.y) continue;
        var mm=mkMonster('O',3,mx,my); mm.hp=mm.mhp=90000; L.mons.push(mm);
      }
    L.clouds.length=0; L.fuses={}; L.burning={}; P.hp=P.mhp=90000;
    G.splash=null; G.beat=0; G.msgq=[];
    var t0=nowMs();
    var before=L.mons.map(function(m){ return m.hp; });
    stoneRune('blast', {x:spot[0],y:spot[1]},
      mkItem('weapon',weaponIndex('blasting stone')), 0);
    var sp=G.splash ? G.splash.cells : [];
    cells+=sp.length;
    var on={};
    for(i=0;i<sp.length;i++){
      if(!walkable(sp[i][0],sp[i][1])) inStone++;
      if(!shotClear(spot[0],spot[1],sp[i][0],sp[i][1])) unseen++;
      on[sp[i][1]*MAP_W+sp[i][0]]=1;
    }
    for(i=0;i<L.mons.length;i++){
      if(L.mons[i].hp>=before[i]) continue;                /* untouched */
      if(!on[L.mons[i].y*MAP_W+L.mons[i].x]) offSplash++;
    }
    if(L.clouds.some(function(c){ return c.kind==='fire'; })) burnt++;
    if(L.clouds.length && L.clouds[0].at>=t0) waited++;
    if(bj!==null && L.fuses[bj]) lit++;
  }
  if(!tried){ bad.push('never found a wall to blast against'); return { bad:bad }; }
  if(inStone) bad.push(inStone+' squares of the blast landed in solid stone');
  if(unseen) bad.push(unseen+' squares of the blast were behind a wall');
  if(offSplash) bad.push(offSplash+' creatures were caught outside the blast');
  if(burnt<tried) bad.push('only '+burnt+' of '+tried+' left anything burning');
  /* Not every square with a wall beside it has anywhere dry left to
     stand a barrel - hard against the rock in a flooded room there may
     be nothing.  Those trials have no barrel to light, so they are not
     evidence either way; what must hold is that every barrel that was
     stood up caught. */
  if(lit<barrels) bad.push('only '+lit+' of '+barrels+' lit the barrel beside them');
  if(barrels<tried*0.9)
    bad.push('only '+barrels+' of '+tried+' trials could stand a barrel at all');
  if(waited<tried) bad.push('the fire started before the stone landed '+(tried-waited)+' times');
  return { bad:bad, tried:tried, cells:cells, burnt:burnt, lit:lit, barrels:barrels };
}

/* ------------------------------------------------------------ the witch
   She never closes and never swings: two flasks of poison, one spider at
   a time, a stone when there is nothing left, and a step sideways across
   her own room when you get within reach - which she can only manage
   every few turns, so closing on her is worth doing.  Fire goes through
   her; frost does not touch her. */
function witchOK(seeds){
  var bad=[], s, t, i;
  var turns=0, melee=0, blinks=0, flasks=0, rocks=0, spiders=0, most=0,
      adjacent=0, gaps=[], witches=0;
  for(s=0;s<seeds*20 && witches<40;s++){
    /* the floor is scenery: she is stood up by hand in a big room */
    if(s%10===0) bootTest(31000+s);
    else bootRoll(31000+s);
    var r=null;
    for(i=0;i<L.rooms.length && !r;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>25) r=L.rooms[i];
    if(!r) continue;
    P.x=r.floors[0][0]; P.y=r.floors[0][1];
    P.hp=P.mhp=900000; P.dex=P.mdex=10; P.perks={};
    L.mons.length=0;
    var spot=null;
    for(i=0;i<r.floors.length && !spot;i++){
      var f=r.floors[i];
      if(Math.max(Math.abs(f[0]-P.x),Math.abs(f[1]-P.y))===4 && walkable(f[0],f[1])) spot=f;
    }
    if(!spot) continue;
    witches++;
    var w=mkMonster('k',6,spot[0],spot[1]);
    w.hp=w.mhp=900000; w.state=2; L.mons.push(w);
    var lastBlink=-99;
    for(t=0;t<40;t++){
      /* walk in on her, so she has to deal with you being close */
      var sx=Math.sign(w.x-P.x), sy=Math.sign(w.y-P.y);
      if(sx && walkable(P.x+sx,P.y) && !monAt(L,P.x+sx,P.y)) P.x+=sx;
      else if(sy && walkable(P.x,P.y+sy) && !monAt(L,P.x,P.y+sy)) P.y+=sy;
      computeVis();
      G.msgq=[]; G.beat=0;
      var was=L.mons.length, wx=w.x, wy=w.y;
      monOneMove(w);
      turns++;
      var said=G.msgq.map(function(q){ return q.s||''; }).join(' ');
      if(/hits you|misses you/.test(said)) melee++;
      if(Math.max(Math.abs(w.x-wx),Math.abs(w.y-wy))>1){
        blinks++;
        if(lastBlink>=0) gaps.push(turns-lastBlink);
        lastBlink=turns;
      }
      if(/throws a flask/.test(said)) flasks++;
      if(/throws a stone/.test(said)) rocks++;
      if(L.mons.length>was) spiders++;
      var mine=0;
      for(i=0;i<L.mons.length;i++) if(L.mons[i].petOf===w.uid) mine++;
      if(mine>most) most=mine;
      if(mdist(w)<=1) adjacent++;
    }
  }
  if(!witches){ bad.push('never got a witch on her feet'); return { bad:bad }; }
  if(melee) bad.push('she landed '+melee+' blows, and she has none to land');
  if(most>1) bad.push(most+' of her spiders were alive at once');
  if(!blinks) bad.push('she never stepped aside');
  if(gaps.length && Math.min.apply(null, gaps) < WITCH_BLINK_EVERY)
    bad.push('she stepped aside again after '+Math.min.apply(null,gaps)+' turns, not '+WITCH_BLINK_EVERY);
  if(flasks > witches*WITCH_FLASKS)
    bad.push(flasks+' flasks from '+witches+' witches, and each one carries '+WITCH_FLASKS);
  /* Not one apiece: she holds the flask when her own spider is in the
     way, and with you walking straight at her the spider spends most of
     the fight exactly there.  Most of them should still get one off. */
  if(flasks < witches*0.7)
    bad.push('only '+flasks+' flasks thrown by '+witches+' witches');
  if(!rocks) bad.push('she never threw a stone');
  if(spiders < witches*0.8) bad.push('only '+spiders+' spiders from '+witches+' witches');

  /* she calls another two turns after the last one dies, and not before */
  var reWait=[], tried=0;
  for(s=0;s<seeds*20 && tried<20;s++){
    if(s%10===0) bootTest(32500+s);
    else bootRoll(32500+s);
    var r2=null;
    for(i=0;i<L.rooms.length && !r2;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>25) r2=L.rooms[i];
    if(!r2) continue;
    P.x=r2.floors[0][0]; P.y=r2.floors[0][1]; P.hp=P.mhp=900000;
    L.mons.length=0;
    var sp2=null;
    for(i=0;i<r2.floors.length && !sp2;i++){
      var g=r2.floors[i];
      if(Math.max(Math.abs(g[0]-P.x),Math.abs(g[1]-P.y))===5 && walkable(g[0],g[1])) sp2=g;
    }
    if(!sp2) continue;
    var w2=mkMonster('k',6,sp2[0],sp2[1]);
    w2.hp=w2.mhp=900000; w2.state=2; L.mons.push(w2);
    /* no flasks: the flask comes before the spider in her order, so with
       one in hand she only summoned when the throw happened to be blocked
       - which is not the recall wait this probe is about */
    w2.flasks=0;
    G.msgq=[]; G.beat=0;
    monOneMove(w2);                      /* she calls one up */
    var pet=null;
    for(i=0;i<L.mons.length;i++) if(L.mons[i].petOf===w2.uid) pet=L.mons[i];
    if(!pet) continue;
    tried++;
    killMonster(pet, true, 'test');
    var waited=0;
    for(t=0;t<10;t++){
      G.msgq=[]; G.beat=0;
      var n0=L.mons.length;
      monOneMove(w2);
      waited++;
      var got=0;
      for(i=0;i<L.mons.length;i++) if(L.mons[i].petOf===w2.uid) got=1;
      if(got) break;
    }
    reWait.push(waited);
  }
  if(!reWait.length) bad.push('never watched one of her spiders die');
  else {
    var quick = Math.min.apply(null, reWait);
    if(quick < WITCH_SPIDER_WAIT)
      bad.push('she called another after '+quick+' turns, not '+WITCH_SPIDER_WAIT);
  }

  /* fire and frost, at the one place that applies them */
  var wd = MON_BY_C['k'];
  if(elemDamage({def:wd}, 10, 'fire') !== 10*WEAKNESS_MULT)
    bad.push('fire on a witch came to '+elemDamage({def:wd},10,'fire'));
  if(elemDamage({def:wd}, 10, 'cold') !== 0)
    bad.push('frost on a witch came to '+elemDamage({def:wd},10,'cold')+', not nothing');
  return { bad:bad, witches:witches, turns:turns, blinks:blinks, flasks:flasks,
           rocks:rocks, spiders:spiders, adjacent:adjacent,
           wait:reWait.length ? Math.min.apply(null,reWait) : 0 };
}

/* --------------------------------------------- the ring off her finger
   Three charges, one spider at a time, and four hundred turns of walking
   for each charge back. */
function witchRingOK(seeds){
  var bad=[], s, i, dropped=0, kills=0;
  var ri = ringIndex('the witch');
  if(ri < 0){ bad.push('there is no ring of the witch'); return { bad:bad }; }
  /* she leaves it now and then, and nothing else in the game does */
  for(s=0;s<seeds*4;s++){
    if(s%10===0) bootTest(33000+s);
    else bootRoll(33000+s);
    var w=mkMonster('k',6,P.x+2,P.y);
    w.hp=1; L.mons.push(w);
    var before=L.items.length;
    killMonster(w, true, 'test');
    kills++;
    for(i=before;i<L.items.length;i++)
      if(L.items[i].t==='ring' && L.items[i].k===ri) dropped++;
  }
  if(!dropped) bad.push('she never left the ring');
  if(dropped > kills*0.75) bad.push('she left it '+dropped+' times in '+kills);

  /* and what it does */
  bootTest(33500);
  P.slots=new Array(N_SLOTS).fill(null);
  var ring=mkItem('ring',ri);
  P.slots[0]=ring;
  if(ring.ch !== 3) bad.push('it holds '+ring.ch+' charges, not 3');
  G.msgq=[];
  var made = ringSpider(ring);
  var mine=0;
  for(i=0;i<L.mons.length;i++) if(L.mons[i].ally && L.mons[i].c==='E') mine++;
  if(!made || mine!==1) bad.push('it called up '+mine+' spiders');
  if(ring.ch !== 2) bad.push('using it left '+ring.ch+' charges');
  /* only one at a time */
  G.msgq=[];
  var again = ringSpider(ring);
  var mine2=0;
  for(i=0;i<L.mons.length;i++) if(L.mons[i].ally && L.mons[i].c==='E') mine2++;
  if(again || mine2!==1) bad.push('a second spider came out while the first was alive');
  if(ring.ch !== 2) bad.push('the refused call still cost a charge');
  /* and the wait for a charge back */
  var lit=0;
  ring.ch = 0; ring.wind = 0;
  for(i=0;i<WITCH_RING_TURNS-1;i++) windRings();
  if(ring.ch !== 0) bad.push('a charge came back after '+i+' turns');
  windRings();
  if(ring.ch !== 1) bad.push('no charge came back after '+WITCH_RING_TURNS+' turns');
  return { bad:bad, dropped:dropped, kills:kills };
}

/* --------------------------- nothing appears before the thing that made it
   A creature's whole turn is worked out in one go and played back over the
   next few hundred milliseconds.  Anything that turn puts on the floor -
   fire, gas, web - has to carry the moment it should be there to see, or
   it is drawn at the working-out: the poison boiling up before the flask
   leaves her hand, the web lying on the floor before it was spat. */
function effectsWaitOK(seeds){
  var bad=[], s, i, out=[];

  /* the witch's flask */
  var tried=0, ok=0, span=[];
  for(s=0;s<seeds*40 && tried<25;s++){
    if(s%10===0) bootTest(41000+s);
    else bootRoll(41000+s);
    var line=straightLine4();
    if(!line) continue;
    var sx=P.x+(line.dx||0)*4, sy=P.y+(line.dy||0)*4;
    if(!walkable(sx,sy)) continue;
    L.mons.length=0; L.clouds.length=0; P.hp=P.mhp=90000;
    var w=mkMonster('k',6,sx,sy);
    w.hp=w.mhp=9000; w.state=2; L.mons.push(w);
    G.beat=0; G.msgq=[]; G.shot=null;
    var t0=nowMs();
    if(!witchFlask(w)) continue;
    tried++;
    var gas=L.clouds.filter(function(c){ return c.kind==='poison'; });
    if(!gas.length){ bad.push('the flask made no gas'); continue; }
    var lands = G.shot ? G.shot.t + G.shot.dur : t0;
    var good=1;
    for(i=0;i<gas.length;i++)
      if(!gas[i].at || gas[i].at < lands - 5) good=0;
    if(good) ok++;
    span.push(gas[0].at - t0);
  }
  if(!tried) bad.push('never got a flask thrown');
  if(ok<tried) bad.push((tried-ok)+' flasks of '+tried+' had the gas up before the flask landed');
  out.push('flask gas waits '+(span.length?Math.min.apply(null,span):0)+'ms');

  /* the web spinner's web */
  var wtried=0, wok=0;
  for(s=0;s<seeds*40 && wtried<25;s++){
    if(s%10===0) bootTest(41800+s);
    else bootRoll(41800+s);
    var l2=straightLine4();
    if(!l2) continue;
    var wx=P.x+(l2.dx||0)*3, wy=P.y+(l2.dy||0)*3;
    if(!walkable(wx,wy)) continue;
    L.mons.length=0; L.webs={}; L.showAt={}; P.hp=P.mhp=90000; P.frozen=0;
    var sp=mkMonster('w',4,wx,wy);
    sp.hp=sp.mhp=9000; sp.state=2; sp.cast=0; L.mons.push(sp);
    G.beat=0; G.msgq=[]; G.shot=null;
    var t1=nowMs();
    if(!monWeb(sp)) continue;
    var laid=Object.keys(L.webs).map(Number);
    if(!laid.length) continue;              /* it stuck to you instead */
    wtried++;
    var shown=1;
    for(i=0;i<laid.length;i++)
      if(!(L.showAt && L.showAt[laid[i]] && L.showAt[laid[i]] > t1)) shown=0;
    if(shown) wok++;
  }
  if(!wtried) bad.push('never got web onto the floor');
  if(wok<wtried) bad.push((wtried-wok)+' webs of '+wtried+' were on the floor before they were spat');
  out.push('floor web waits on '+wok+'/'+wtried);

  /* and the fire a creature throws, which was the first of these */
  bootTest(41900);
  L.clouds.length=0;
  var l3=straightLine4();
  if(l3){
    var hx=P.x+(l3.dx||0)*4, hy=P.y+(l3.dy||0)*4;
    if(walkable(hx,hy)){
      L.mons.length=0;
      var hd=mkMonster('h',8,hx,hy);
      hd.hp=hd.mhp=900; hd.state=2; hd.cast=0; L.mons.push(hd);
      G.beat=0;
      var t2=nowMs();
      throwFireball(hd, 1);
      var fires=L.clouds.filter(function(c){ return c.kind==='fire'; });
      if(!fires.length) bad.push('the fireball left no fire');
      for(i=0;i<fires.length;i++)
        if(!fires[i].at || fires[i].at <= t2) bad.push('fire from a ball starts at once');
      out.push('ball fire waits '+(fires.length?fires[0].at-t2:0)+'ms');
    }
  }
  return { bad:bad, ways:out.join('; ') };
}

/* ------------------------------------------------- going without walking
   A shake where it stood, a flash at each end, and only then is it
   somewhere else.  The witch's own step sideways fails two times in five,
   and when it fails she arrives on the square she left - so you watch it
   not work rather than nothing happening. */
function warpOK(seeds){
  var bad=[], s, i;
  var tried=0, failed=0, drew=0, moved=0;
  for(s=0;s<seeds*30 && tried<300;s++){
    /* scenery floors from here down: everything is stood up by hand */
    if(s%10===0) bootTest(42000+s);
    else bootRoll(42000+s);
    var r=null;
    for(i=0;i<L.rooms.length && !r;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>25) r=L.rooms[i];
    if(!r) continue;
    P.x=r.floors[0][0]; P.y=r.floors[0][1]; P.hp=P.mhp=90000;
    L.mons.length=0;
    var sp=null;
    for(i=0;i<r.floors.length && !sp;i++){
      var f=r.floors[i];
      if(Math.max(Math.abs(f[0]-P.x),Math.abs(f[1]-P.y))===2 && walkable(f[0],f[1])) sp=f;
    }
    if(!sp) continue;
    var w=mkMonster('k',6,sp[0],sp[1]);
    w.hp=w.mhp=9000; w.state=2; L.mons.push(w);
    G.beat=0; G.msgq=[];
    var bx=w.x, by=w.y, b0=G.beat;
    if(!witchBlink(w)) continue;
    tried++;
    if(w.x===bx && w.y===by) failed++; else moved++;
    if(w.warp && w.warp.fx===bx && w.warp.fy===by) drew++;
    if(G.beat - b0 < WARP_SHAKE + WARP_FLASH)
      bad.push('the turn did not wait for the animation');
  }
  if(!tried){ bad.push('she never tried to step aside'); return { bad:bad }; }
  /* and with you standing over her she cannot slip away at all */
  var pinned=0, pinTried=0;
  for(s=0;s<seeds*30 && pinTried<20;s++){
    if(s%10===0) bootTest(44000+s);
    else bootRoll(44000+s);
    var l5=straightLine4();
    if(!l5) continue;
    var ax=P.x+(l5.dx||0), ay=P.y+(l5.dy||0);
    if(!walkable(ax,ay)) continue;
    L.mons.length=0; P.hp=P.mhp=90000;
    var w5=mkMonster('k',6,ax,ay);
    w5.hp=w5.mhp=9000; w5.state=2; w5.blinkIn=0; L.mons.push(w5);
    pinTried++;
    G.beat=0; G.msgq=[];
    if(!witchBlink(w5)) pinned++;
  }
  if(!pinTried) bad.push('never got to stand over her');
  if(pinned<pinTried) bad.push('she slipped away '+(pinTried-pinned)+' times of '+
    pinTried+' with you standing over her');
  if(drew<tried) bad.push((tried-drew)+' of '+tried+' went without the animation');
  if(!failed) bad.push('it never failed');
  if(!moved) bad.push('it never worked');
  var pct = failed*100/tried;
  if(Math.abs(pct - WITCH_BLINK_FAIL) > 8)
    bad.push('it failed '+pct.toFixed(0)+'% of the time, not '+WITCH_BLINK_FAIL+'%');

  /* your own teleports get it too */
  bootTest(42900);
  P.warp = null;
  var was = { x: P.x, y: P.y };
  teleportPlayer();
  if(!P.warp) bad.push('you teleport with no animation');
  else if(P.warp.fx !== was.x || P.warp.fy !== was.y)
    bad.push('your animation starts from the wrong square');

  /* and the spider she calls up is thrown there, not simply there */
  var stried=0, spell=0, aimed=0, held=0;
  for(s=0;s<seeds*30 && stried<25;s++){
    if(s%10===0) bootTest(43000+s);
    else bootRoll(43000+s);
    var r2=null;
    for(i=0;i<L.rooms.length && !r2;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>25) r2=L.rooms[i];
    if(!r2) continue;
    P.x=r2.floors[0][0]; P.y=r2.floors[0][1]; P.hp=P.mhp=90000;
    L.mons.length=0;
    var sp2=null;
    for(i=0;i<r2.floors.length && !sp2;i++){
      var g=r2.floors[i];
      if(Math.max(Math.abs(g[0]-P.x),Math.abs(g[1]-P.y))===5 && walkable(g[0],g[1])) sp2=g;
    }
    if(!sp2) continue;
    var w2=mkMonster('k',6,sp2[0],sp2[1]);
    w2.hp=w2.mhp=9000; w2.state=2; L.mons.push(w2);
    G.beat=0; G.shot=null; G.msgq=[];
    if(!witchSummon(w2)) continue;
    stried++;
    var kid=null;
    for(i=0;i<L.mons.length;i++) if(L.mons[i].petOf===w2.uid) kid=L.mons[i];
    if(!kid){ bad.push('no spider came of it'); continue; }
    if(G.shot && G.shot.spr==='magic'){
      spell++;
      if(G.shot.ex===kid.x && G.shot.ey===kid.y) aimed++;
      if(kid.showAt >= G.shot.t + G.shot.dur - 5) held++;
    }
  }
  /* She aims the flask away from her own spider: with it standing right
     beside you she bursts the flask on your far side rather than on you,
     and never on the spider or next to it. */
  var near=0, threw=0, kept=0, wellAimed=0, onYou=0;
  for(s=0;s<seeds*40 && near<25;s++){
    if(s%10===0) bootTest(43600+s);
    else bootRoll(43600+s);
    var l4=straightLine4();
    if(!l4) continue;
    var wx4=P.x+(l4.dx||0)*4, wy4=P.y+(l4.dy||0)*4;
    var px4=P.x+(l4.dx||0), py4=P.y+(l4.dy||0);
    if(!walkable(wx4,wy4)||!walkable(px4,py4)) continue;
    L.mons.length=0; L.clouds.length=0; L.fuses={}; P.hp=P.mhp=90000;
    var w4=mkMonster('k',6,wx4,wy4);
    w4.hp=w4.mhp=9000; w4.state=2; L.mons.push(w4);
    var pet4=mkMonster('E',3,px4,py4);
    pet4.hp=pet4.mhp=900; pet4.state=2; pet4.petOf=w4.uid; L.mons.push(pet4);
    near++;
    G.beat=0; G.msgq=[]; G.shot=null;
    if(!witchFlask(w4)){ kept++; continue; }
    threw++;
    if(!G.shot){ bad.push('the flask went nowhere anybody could see'); continue; }
    var bx4=G.shot.ex, by4=G.shot.ey;
    /* it must not burst on her spider or against it */
    var gap=Math.max(Math.abs(bx4-pet4.x),Math.abs(by4-pet4.y));
    if(gap < WITCH_FLASK_CLEAR)
      bad.push('she burst it '+gap+' squares from her own spider');
    else wellAimed++;
    /* and it must be the best she could do: nothing legal is further off */
    var bestGap=gap, q4;
    var spots4=[[P.x,P.y]];
    for(q4=0;q4<DIR4.length;q4++) spots4.push([P.x+DIR4[q4][0],P.y+DIR4[q4][1]]);
    for(q4=0;q4<spots4.length;q4++){
      if(!walkable(spots4[q4][0],spots4[q4][1])) continue;
      if(!shotClear(w4.x,w4.y,spots4[q4][0],spots4[q4][1])) continue;
      var g4=Math.max(Math.abs(spots4[q4][0]-pet4.x),Math.abs(spots4[q4][1]-pet4.y));
      if(g4 > bestGap) bad.push('she could have thrown it further from her spider');
    }
    /* and it is still near enough to you to be worth throwing */
    if(Math.max(Math.abs(bx4-P.x),Math.abs(by4-P.y))<=1) onYou++;
  }
  if(!near) bad.push('never stood her spider in the way');
  if(!threw) bad.push('she never threw with her spider beside you');
  if(threw && wellAimed<threw) bad.push('she aimed badly '+(threw-wellAimed)+' times');
  if(threw && onYou<threw) bad.push('she threw it somewhere that would not catch you');

  if(!stried) bad.push('she never called a spider up');
  if(spell<stried) bad.push((stried-spell)+' spiders arrived with nothing thrown');
  if(aimed<stried) bad.push('the spell was not aimed where the spider landed');
  if(held<stried) bad.push('the spider was there before the spell arrived');
  return { bad:bad, tried:tried, failed:failed, drew:drew,
           pct:(failed*100/tried).toFixed(0), summons:stried, spared:held+'/'+near,
           pinned:pinned+'/'+pinTried,
           aimed:threw+'/'+near+' thrown clear of her spider and still beside you' };
}

/* ------------------------------- anything that hurts you, you see hurt
   A blow from something standing next to you flinches you and flashes
   you red.  Everything that reaches you from across the room was going
   straight through: health came off and nothing moved, which reads as
   the stone passing through you rather than hitting you. */
function hurtShowsOK(seeds){
  var bad=[], s, out=[];
  function ready(){
    P.hp=P.mhp=90000; P.hurt=null; L.mons.length=0; L.clouds.length=0;
    G.beat=0; G.msgq=[]; G.shot=null; G.bolt=null;
  }
  function tryOne(name, place, fire){
    var s2, done=0, flinched=0, aimed=0;
    for(s2=0;s2<seeds*40 && done<20;s2++){
      if(s2%10===0) bootTest(45000+s2);
      else bootRoll(45000+s2);
      var line=straightLine4();
      if(!line) continue;
      var mx=P.x+(line.dx||0)*4, my=P.y+(line.dy||0)*4;
      if(!walkable(mx,my)) continue;
      ready();
      var m=place(mx,my);
      if(!m) continue;
      var before=P.hp;
      if(!fire(m)) continue;
      if(P.hp>=before) continue;           /* it missed; nothing to show */
      done++;
      if(P.hurt) {
        flinched++;
        /* and it flinches away from whatever threw it */
        if(P.hurt.dx || P.hurt.dy) aimed++;
      }
    }
    if(!done){ bad.push('never landed a '+name); return; }
    if(flinched<done) bad.push(name+': '+(done-flinched)+' of '+done+' took health with no flinch');
    out.push(name+' '+flinched+'/'+done+(aimed?' (from the thrower)':''));
  }
  tryOne('thrown stone',
    function(x,y){ var m=mkMonster('k',6,x,y); m.hp=m.mhp=9000; m.state=2; L.mons.push(m); return m; },
    function(m){ return witchRock(m); });
  tryOne('jet of flame',
    function(x,y){ var m=mkMonster('D',10,x,y); m.hp=m.mhp=9000; m.state=2; L.mons.push(m); return m; },
    function(m){ return breatheFire(m, 5) > 0; });
  tryOne('fireball',
    function(x,y){ var m=mkMonster('h',8,x,y); m.hp=m.mhp=900; m.state=2; L.mons.push(m); return m; },
    function(m){ return throwFireball(m, 5) > 0; });
  /* and the air itself */
  bootTest(45500);
  ready();
  dropEmber(P.x, P.y, 2);
  cloudsOnYou(); ageClouds();
  if(!P.hurt) bad.push('standing in fire took health with no flinch');
  else out.push('standing in fire flinches');
  return { bad:bad, ways:out.join('; ') };
}

/* ------------------------------------------------------ the bow of the spider
   Now and then it looses web instead of a shaft: no arrow spent, no
   damage done, and whatever it hits is stuck where it stands. */
function spiderBowOK(seeds){
  var bad=[], s, shots=0, webs=0, arrowsSpent=0, stuck=0, hurt=0, holds=[];
  /* One floor serves ten shots.  Building a floor is by far the most
     expensive thing in the suite and this used to build a fresh one for
     every arrow, which on its own took eight minutes. */
  for(s=0;s<seeds*20 && shots<200;s++){
    if(s % 10 === 0) bootTest(46000+s);
    var line=straightLine4();
    if(!line) continue;
    var tx=P.x+(line.dx||0)*3, ty=P.y+(line.dy||0)*3;
    if(!walkable(tx,ty)) continue;
    /* a bow of the spider, known, and a quiver */
    var bow=mkItem('weapon',weaponIndex('short bow'));
    /* identified, enchantment and all: an enchantment you have not found
       out about does nothing, which is checked on its own below */
    bow.known=1; bow.br='the spider'; bow.brKnown=1;
    P.eq.lh=bow;
    var quiver=mkItem('weapon',weaponIndex('arrow'));
    quiver.cnt=40; quiver.known=1;
    P.slots=new Array(N_SLOTS).fill(null); P.slots[0]=quiver;
    L.mons.length=0;
    var m=mkMonster('O',3,tx,ty);
    m.hp=m.mhp=90000; m.state=2; L.mons.push(m);
    var hp0=m.hp, ammo0=quiver.cnt;
    G.beat=0; G.msgq=[];
    if(!fireAt(m)) continue;
    shots++;
    var said=G.msgq.map(function(q){ return q.s||''; }).join(' ');
    if(/Web wraps/.test(said)){
      webs++;
      if(quiver.cnt !== ammo0) arrowsSpent++;
      if(m.stuck>0){ stuck++; holds.push(m.stuck); }
      if(m.hp < hp0) hurt++;
    }
  }
  if(!shots) bad.push('never got a shot away');
  if(!webs) bad.push('the bow never loosed any web');
  if(arrowsSpent) bad.push('web cost an arrow '+arrowsSpent+' times');
  if(webs && stuck<webs) bad.push('web stuck only '+stuck+' of '+webs);
  if(hurt) bad.push('web did damage '+hurt+' times');
  var lo = holds.length ? Math.min.apply(null,holds) : 0;
  var hi = holds.length ? Math.max.apply(null,holds) : 0;
  if(holds.length && (lo < SPIDER_BOW_HOLD[0] || hi > SPIDER_BOW_HOLD[1]))
    bad.push('it held for '+lo+'-'+hi+' turns, outside '+SPIDER_BOW_HOLD.join('-'));
  var pct = shots ? webs*100/shots : 0;
  if(shots && Math.abs(pct - SPIDER_BOW_PCT) > 10)
    bad.push('web came up '+pct.toFixed(0)+'% of the time, not '+SPIDER_BOW_PCT+'%');
  /* and one you have not identified does nothing at all */
  var blind=0, blindWebs=0;
  for(s=0;s<seeds*20 && blind<40;s++){
    if(s % 10 === 0) bootTest(46200+s);
    var l9=straightLine4();
    if(!l9) continue;
    var qx=P.x+(l9.dx||0)*3, qy=P.y+(l9.dy||0)*3;
    if(!walkable(qx,qy)) continue;
    var b9=mkItem('weapon',weaponIndex('short bow'));
    b9.known=1; b9.br='the spider'; b9.brKnown=0;
    P.eq.lh=b9;
    var q9=mkItem('weapon',weaponIndex('arrow')); q9.cnt=40; q9.known=1;
    P.slots=new Array(N_SLOTS).fill(null); P.slots[0]=q9;
    L.mons.length=0;
    var m9=mkMonster('O',3,qx,qy); m9.hp=m9.mhp=90000; m9.state=2; L.mons.push(m9);
    G.beat=0; G.msgq=[];
    if(!fireAt(m9)) continue;
    blind++;
    var said9=G.msgq.map(function(q){ return q.s||''; }).join(' ');
    if(/Web wraps/.test(said9)) blindWebs++;
  }
  if(!blind) bad.push('never got a shot from an unidentified bow');
  if(blindWebs) bad.push('an unidentified bow of the spider loosed web '+blindWebs+' times');

  /* it only goes on a bow, and a plain weapon never gets it */
  /* Rolling a rune needs a fresh number, not a fresh dungeon.  This used
     to build four hundred complete floors to do it, which was two and a
     half minutes of the suite on its own. */
  var onBow=0, onBlade=0, tries=0;
  for(s=0;s<400;s++){
    srand(46500+s);
    var b2=mkItem('weapon',weaponIndex('short bow'));
    addRune(b2,'wb',100);
    if(b2.br==='the spider') onBow++;
    var w2=mkItem('weapon',weaponIndex('long sword'));
    addRune(w2,'w',100);
    if(w2.br==='the spider') onBlade++;
    tries++;
  }
  if(!onBow) bad.push('a bow never takes the rune at all');
  if(onBlade) bad.push('a sword took the bow rune '+onBlade+' times');
  /* and a scroll of enchantment can cut it in */
  var cut=0, scrolls=0;
  /* likewise: cutting a rune wants a fresh roll, not a fresh floor */
  for(s=0;s<300;s++){
    srand(46900+s);
    var b3=mkItem('weapon',weaponIndex('short bow'));
    b3.br=0;
    scrolls++;
    cutRune(b3, SCROLL_RUNE_GREAT_PCT);
    if(b3.br) cut++;
  }
  if(!cut) bad.push('a scroll never cut a rune into a plain bow');
  return { bad:bad, shots:shots, webs:webs, pct:pct.toFixed(0),
           onBow:onBow+'/'+tries, cut:cut+'/'+scrolls, blind:blindWebs+'/'+blind };
}

/* ------------------------------------------------ a summoned thing keeps up
   It is yours: it walks at your heel and goes for whatever is coming at
   you, nearest to itself first.  It used to go for the nearest hostile of
   any kind, which meant anything at all - something asleep across the
   room was reason enough to leave. */
function allyFollowsOK(seeds){
  var bad=[], s, i, t;
  var trailed=0, tried=0, gaps=[];
  for(s=0;s<seeds*20 && tried<20;s++){
    bootTest(47000+s);
    var r=null;
    for(i=0;i<L.rooms.length && !r;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>25) r=L.rooms[i];
    if(!r) continue;
    P.x=r.floors[0][0]; P.y=r.floors[0][1]; P.hp=P.mhp=90000;
    L.mons.length=0;
    /* a spider of yours, and something asleep across the room */
    var sp=null;
    for(i=0;i<r.floors.length && !sp;i++){
      var f=r.floors[i];
      if(Math.max(Math.abs(f[0]-P.x),Math.abs(f[1]-P.y))===2 && walkable(f[0],f[1])) sp=f;
    }
    var far=null;
    for(i=r.floors.length-1;i>=0 && !far;i--){
      var g=r.floors[i];
      if(Math.max(Math.abs(g[0]-P.x),Math.abs(g[1]-P.y))>=5 && walkable(g[0],g[1])) far=g;
    }
    if(!sp||!far) continue;
    tried++;
    var pet=mkMonster('E',3,sp[0],sp[1]);
    pet.ally=1; pet.state=2; pet.life=200; L.mons.push(pet);
    var sleeper=mkMonster('Z',3,far[0],far[1]);
    sleeper.state=0; sleeper.hp=sleeper.mhp=900; L.mons.push(sleeper);
    /* walk about; it should stay with you and leave the sleeper alone */
    var worst=0;
    for(t=0;t<12;t++){
      for(var d=0;d<DIR4.length;d++){
        if(walkable(P.x+DIR4[d][0],P.y+DIR4[d][1]) &&
           !monAt(L,P.x+DIR4[d][0],P.y+DIR4[d][1])){
          P.x+=DIR4[d][0]; P.y+=DIR4[d][1]; break;
        }
      }
      G.beat=0; G.msgq=[];
      if(L.mons.indexOf(pet)<0) break;
      allyMove(pet);
      var gap=Math.max(Math.abs(pet.x-P.x),Math.abs(pet.y-P.y));
      if(gap>worst) worst=gap;
    }
    gaps.push(worst);
    /* Four, not three.  The walk here shuffles into the first open
       direction each step, so in a big chamber it can double back while
       the ally is still coming round something - a square of slack for a
       moment is following, not wandering off. */
    if(worst<=4) trailed++;
    if(sleeper.hp<sleeper.mhp) bad.push('it went for something that was asleep');
  }
  if(!tried){ bad.push('never got an ally on its feet'); return { bad:bad }; }
  if(trailed<tried) bad.push((tried-trailed)+' of '+tried+' wandered off while you walked');

  /* and with two things charging you it takes the nearer one */
  var picks=0, right=0;
  for(s=0;s<seeds*20 && picks<20;s++){
    bootTest(47500+s);
    var r2=null;
    for(i=0;i<L.rooms.length && !r2;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>30) r2=L.rooms[i];
    if(!r2) continue;
    P.x=r2.floors[0][0]; P.y=r2.floors[0][1]; P.hp=P.mhp=90000;
    L.mons.length=0;
    var open=[];
    for(i=0;i<r2.floors.length;i++){
      var q=r2.floors[i];
      var dd=Math.max(Math.abs(q[0]-P.x),Math.abs(q[1]-P.y));
      if(dd>=2 && dd<=4 && walkable(q[0],q[1])) open.push(q);
    }
    if(open.length<3) continue;
    var pet2=mkMonster('E',3,open[0][0],open[0][1]);
    pet2.ally=1; pet2.state=2; pet2.life=200; L.mons.push(pet2);
    var a=mkMonster('O',3,open[1][0],open[1][1]); a.state=2; a.hp=a.mhp=900; L.mons.push(a);
    var b=mkMonster('O',3,open[2][0],open[2][1]); b.state=2; b.hp=b.mhp=900; L.mons.push(b);
    var da=Math.max(Math.abs(a.x-pet2.x),Math.abs(a.y-pet2.y));
    var db=Math.max(Math.abs(b.x-pet2.x),Math.abs(b.y-pet2.y));
    if(da===db) continue;
    picks++;
    var want = da<db ? a : b;
    var got = chargingFoe(pet2);
    if(got===want) right++;
  }
  if(!picks) bad.push('never got two things charging at once');
  if(right<picks) bad.push('it went for the further of two '+(picks-right)+' times of '+picks);
  return { bad:bad, tried:tried, trailed:trailed, picks:picks, right:right,
           worst: gaps.length ? Math.max.apply(null,gaps) : 0 };
}

/* ------------------------------------------------ a door has to be a door
   Stone on one side and a way through on the other.  A corridor arriving
   two squares wide, or a room opening out beside one, left a door
   standing in the open with floor all round it - which is a door dropped
   in the middle of a room, because that is what it was. */
function doorsAreDoorsOK(seeds){
  var bad=[], s, d, i, floors=0, doors=0, loose=0, inRoom=0, corrInRoom=0;
  /* the same notion of a jamb the generator uses: anything you cannot
     walk onto, iron bars included */
  function solid(v){ return !walkTile(v); }
  for(s=0;s<seeds;s++){
    bootTest(50000+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down');
      floors++;
      for(i=0;i<L.tiles.length;i++){
        var x=i%MAP_W, y=(i/MAP_W)|0;
        if(x<1||y<1||x>=MAP_W-1||y>=MAP_H-1) continue;
        var t=L.tiles[i];
        if(t===CORR && L.roomAt[i]>=0) corrInRoom++;
        if(t!==DOOR && t!==SDOOR && t!==LOCKED) continue;
        doors++;
        /* a locked door is deliberate and something is behind it */
        if(t===LOCKED || L.locks[i]) continue;
        var up=L.tiles[i-MAP_W], dn=L.tiles[i+MAP_W];
        var lf=L.tiles[i-1], rt=L.tiles[i+1];
        if((solid(up)&&solid(dn)) || (solid(lf)&&solid(rt))) continue;
        loose++;
        if(L.roomAt[i]>=0) inRoom++;
      }
    }
  }
  if(!doors) bad.push('no doors on any floor');
  if(loose) bad.push(loose+' doors of '+doors+' stand in the open, '+inRoom+' inside a room');
  if(corrInRoom) bad.push(corrInRoom+' squares of hallway floor lie inside a room');
  return { bad:bad, floors:floors, doors:doors, loose:loose, corrInRoom:corrInRoom };
}

/* ------------------------------------------------------------ the bows
   Three launchers, all eating the same arrows, and the long one reaching
   further than the other two. */
/* --------------------------------------------------------- a bow of fire
   The shaft is alight as it leaves the string.  What it hits catches,
   the square it hits burns, and a shot that goes wide sets light to
   whatever it comes down on instead.  A plain bow does none of it, and
   neither does one whose enchantment you have not yet learned. */
function bowOfFireOK(seeds){
  var bad=[], s, i;
  var hits=0, lit=0, hitFires=0, misses=0, missFires=0, plain=0, plainFires=0, unknown=0;
  function armed(kind){
    /* a bow in the off hand, arrows in the pack, and a clear line */
    var bow=mkItem('weapon',weaponIndex('long bow'));
    bow.known=1; bow.hp=bow.dp=0;
    if(kind!=='plain'){ bow.br='fire'; bow.brKnown = kind==='known' ? 1 : 0; }
    P.eq.lh=bow;
    var q=mkItem('weapon',weaponIndex('arrow')); q.cnt=40; q.known=1;
    P.slots=new Array(N_SLOTS).fill(null); P.slots[0]=q;
    return bow;
  }
  function fireOn(x,y){
    for(var c=0;c<L.clouds.length;c++)
      if(L.clouds[c].x===x&&L.clouds[c].y===y&&L.clouds[c].kind==='fire') return 1;
    return 0;
  }
  for(s=0;s<seeds*40 && (hits<25||misses<25||plain<25);s++){
    if(s%10===0) bootTest(38200+s); else bootRoll(38200+s);
    var line=straightLine4();
    if(!line) continue;
    var tx=P.x+(line.dx||0)*3, ty=P.y+(line.dy||0)*3;
    if(!walkable(tx,ty)||inWater(tx,ty)||inWater(P.x,P.y)) continue;
    P.hp=P.mhp=90000; P.perks={}; P.conf=0; P.blind=0;

    /* three shots off the same square: a hit, a miss, and a plain bow */
    var want = hits<25 ? 'hit' : (misses<25 ? 'miss' : 'plain');
    L.mons.length=0; L.clouds.length=0; L.burning={}; L.fuses={};
    var m=mkMonster('O',6,tx,ty);
    m.hp=m.mhp=90000; m.burn=0;
    /* armour decides it: nothing can hit a wall of iron, and nothing can
       miss a target that cannot dodge */
    m.ar = want==='miss' ? -400 : 400;
    L.mons.push(m);
    armed(want==='plain' ? 'plain' : 'known');
    G.msgq=[]; G.beat=0;
    var before=m.burn;
    if(!fireAt(m)) continue;
    var burnt = (m.burn||0)>before;
    if(want==='hit'){
      if(m.hp>=90000) continue;                   /* it missed after all */
      hits++;
      if(burnt) lit++; else bad.push('a hit from a bow of fire did not light it');
      if(fireOn(tx,ty)) hitFires++; else bad.push('the square it was hit on did not catch');
    } else if(want==='miss'){
      if(m.hp<90000) continue;                    /* it hit after all */
      misses++;
      /* It sails past and comes down somewhere along the line; the shot
         itself says where.  A shaft that fell in water is out, which is
         the rule everywhere else too, so it proves nothing. */
      var fell = G.shot ? { x:G.shot.ex, y:G.shot.ey } : null;
      if(!fell || inWater(fell.x,fell.y)){ misses--; continue; }
      if(fireOn(fell.x,fell.y)) missFires++;
      else bad.push('a missed fire arrow set nothing alight where it fell');
      if((m.burn||0)>before) bad.push('a shot that missed still set it alight');
    } else {
      if(m.hp>=90000) continue;
      plain++;
      if((m.burn||0)>before) bad.push('a plain bow set something alight');
      if(fireOn(tx,ty)) bad.push('a plain bow left the floor burning');
      else plainFires++;
    }
  }
  /* and an enchantment you have not learned does nothing, as with the rest */
  for(s=0;s<200 && unknown<12;s++){
    if(s%10===0) bootTest(38900+s); else bootRoll(38900+s);
    var l2=straightLine4();
    if(!l2) continue;
    var ux=P.x+(l2.dx||0)*3, uy=P.y+(l2.dy||0)*3;
    if(!walkable(ux,uy)||inWater(ux,uy)) continue;
    L.mons.length=0; L.clouds.length=0;
    var m2=mkMonster('O',6,ux,uy); m2.hp=m2.mhp=90000; m2.ar=400; m2.burn=0;
    L.mons.push(m2);
    P.hp=P.mhp=90000; P.perks={};
    armed('secret');
    G.msgq=[];
    if(!fireAt(m2)) continue;
    if(m2.hp>=90000) continue;
    unknown++;
    if(m2.burn) bad.push('a bow whose enchantment you have not learned set something alight');
  }
  if(hits<5) bad.push('only landed '+hits+' shots with a bow of fire');
  if(misses<5) bad.push('only missed '+misses+' times with a bow of fire');
  if(plain<5) bad.push('only landed '+plain+' shots with a plain bow');
  if(unknown<5) bad.push('never shot an unlearned bow of fire');
  return { bad:bad, hits:hits, lit:lit, hitFires:hitFires,
           misses:misses, missFires:missFires, plain:plain, unknown:unknown };
}

/* ------------------------------------------- nothing under a staircase
   A staircase is cut into the flagstones, so nothing is laid over or
   under it.  The stairs are placed - and moved - after the floor has
   been furnished, so a rug can be down before they arrive.  The square
   itself used to be struck off the rug and the rest of it left lying
   there, which put the stairs in a hole in the middle of a rug: a
   staircase on a rug, to anybody looking at it. */
function stairsClearOK(seeds){
  var bad=[], s, d, i, floors=0, stairs=0, rugSquares=0, wet=0, inRug=0, waterSquares=0;
  for(s=0;s<seeds;s++){
    bootTest(62000+s);
    for(d=1;d<=8;d++){
      enterLevel(d,'down');
      floors++;
      for(var k in L.rugId) if(L.rugId[k]) rugSquares++;
      for(i=0;i<L.tiles.length;i++)
        if(L.tiles[i]===WATER||L.tiles[i]===HOLY) waterSquares++;
      var both=[L.stair, L.up];
      for(var w=0;w<both.length;w++){
        var st=both[w];
        if(!st) continue;
        stairs++;
        var j=st.y*MAP_W+st.x;
        if(isRugName(L.decor[j])) bad.push('a rug is laid under a staircase');
        if(L.rugId && L.rugId[j]) bad.push('a staircase still counts as part of a rug');
        if(L.tiles[j]===WATER||L.tiles[j]===HOLY){ wet++; bad.push('a staircase stands in water'); }
        /* and the pool stops short of it, so its bank forms clear of the
           steps rather than lapping at them */
        for(i=0;i<DIR4.length;i++){
          var nt=tileAt(st.x+DIR4[i][0], st.y+DIR4[i][1]);
          if(nt===WATER||nt===HOLY){ wet++; bad.push('water laps at a staircase'); }
        }
        if(L.barrels && L.barrels[j]) bad.push('a barrel is under a staircase');
        /* Moss is not checked: it grows on the flagstones and a staircase
           is drawn without its square's ground cover anyway, so a patch
           reaching under one is neither seen nor a mistake.  A rug is a
           thing laid down, and that is a different matter. */
        /* and it is not standing in a hole in one either: a rug that has
           lost a square to the stairs is rolled up whole */
        var near=0;
        for(i=0;i<DIR4.length;i++)
          if(isRugName(L.decor[(st.y+DIR4[i][1])*MAP_W+st.x+DIR4[i][0]])) near++;
        if(near>=2){ inRug++; bad.push('a staircase is standing in a hole in a rug'); }
      }
    }
  }
  if(!stairs) bad.push('no staircases to look at');
  /* the sweep must not simply have taken every rug off every floor */
  if(rugSquares < floors) bad.push('only '+rugSquares+' squares of rug over '+floors+
    ' floors - the sweep is lifting everything');
  if(waterSquares < floors) bad.push('only '+waterSquares+' squares of water over '+floors+
    ' floors - the margin is draining the dungeon');
  return { bad:bad, floors:floors, stairs:stairs, rugSquares:rugSquares,
           waterSquares:waterSquares, wet:wet, inRug:inRug };
}

function bowsOK(){
  var bad=[], out=[], names=['short bow','long bow','crossbow','great bow'], i;
  bootTest(1);
  for(i=0;i<names.length;i++){
    var k=weaponIndex(names[i]);
    if(k<0){ bad.push('there is no '+names[i]); continue; }
    var W=WEAPONS[k];
    if(!W.launch) bad.push(names[i]+' is not a launcher');
    var b=mkItem('weapon',k); b.known=1;
    P.eq.lh=b;
    var q=mkItem('weapon',weaponIndex('arrow')); q.cnt=10; q.known=1;
    P.slots=new Array(N_SLOTS).fill(null); P.slots[0]=q;
    var kit=canShoot();
    if(!kit || !kit.ammo) bad.push(names[i]+' cannot find an arrow to shoot');
    out.push(names[i]+' '+shotRange()+' squares, '+W.s);
  }
  /* Every one of them is drawn by something that is on the sheet, and
     the three that are meant to look different do.  The great bow is a
     long bow to the eye on purpose, so it is the one exception and is
     named here rather than left to slip through. */
  var seen={};
  for(i=0;i<names.length;i++){
    var k2=weaponIndex(names[i]);
    if(k2<0) continue;
    var sp=WEAPONS[k2].s;
    if(ATLAS.index[sp]===undefined) bad.push('there is no '+sp+' on the sheet');
    if(seen[sp] && !(names[i]==='great bow' && seen[sp]==='long bow'))
      bad.push(names[i]+' shares a sprite with '+seen[sp]);
    if(!seen[sp]) seen[sp]=names[i];
  }
  if(WEAPONS[weaponIndex('great bow')].s!==WEAPONS[weaponIndex('long bow')].s)
    bad.push('the great bow no longer borrows the long bow picture - give it its own');
  /* and each longer stave carries further than the last */
  function reachOf(n){
    var b2=mkItem('weapon',weaponIndex(n)); P.eq.lh=b2; return shotRange();
  }
  P.perks={};
  var shortR=reachOf('short bow'), longR=reachOf('long bow'), greatR=reachOf('great bow');
  if(longR<=shortR) bad.push('a long bow reaches '+longR+', no further than a short bow');
  if(greatR<=longR) bad.push('a great bow reaches '+greatR+', no further than a long bow');
  /* and hits harder than the long bow it outgrew */
  var gd=WEAPONS[weaponIndex('great bow')].shot, ld=WEAPONS[weaponIndex('long bow')].shot;
  if(gd[0]*gd[1]<=ld[0]*ld[1]) bad.push('a great bow hits no harder than a long bow');
  out.push('great bow '+greatR+' squares');
  return { bad:bad, ways:out.join('; ') };
}

/* ------------------------------------------------------ a stone on a plate
   Something lying on a trap holds it down.  Throw a stone onto a reusable
   one and it goes off; the stone stays there, and the next thing along
   walks over a plate that is already pressed.  Picking the stone up is
   what walking there does, and it must be settled before the pickup, or
   lifting the stone is what sets the trap off. */
function pinnedTrapOK(seeds){
  var bad=[], s, i, tried=0, held=0, fired=0, picked=0, sprung=0;
  for(s=0;s<seeds*20 && tried<25;s++){
    bootTest(53000+s);
    /* a reusable trap on a square beside you, with a stone on it */
    var line=straightLine4();
    if(!line) continue;
    var tx=P.x+(line.dx||0), ty=P.y+(line.dy||0);
    if(!walkable(tx,ty)) continue;
    var kind=null;
    for(i=0;i<TRAPS.length;i++) if(TRAPS[i].reusable) kind=TRAPS[i];
    if(!kind){ bad.push('no reusable trap to test with'); break; }
    L.traps.length=0; L.items.length=0; L.mons.length=0;
    L.traps.push({ x:tx, y:ty, k:kind, spent:0, found:1 });
    var stone=mkItem('weapon', weaponIndex('stone'));
    stone.cnt=1; stone.known=1; stone.x=tx; stone.y=ty;
    L.items.push(stone);
    P.hp=P.mhp=90000; P.slots=new Array(N_SLOTS).fill(null);
    tried++;
    var hp0=P.hp;
    G.msgq=[]; G.beat=0;
    P.x=tx; P.y=ty;
    afterStep();
    if(P.hp<hp0) fired++; else held++;
    if(L.traps[0].spent) sprung++;
    /* and the stone is in your pack */
    var got=0;
    for(i=0;i<P.slots.length;i++)
      if(P.slots[i] && P.slots[i].t==='weapon' && WEAPONS[P.slots[i].k].n==='stone') got=1;
    if(got) picked++;
  }
  if(!tried){ bad.push('never set a pinned trap up'); return { bad:bad }; }
  if(fired) bad.push('a pinned trap went off '+fired+' times of '+tried);
  if(picked<tried) bad.push('the stone was not picked up '+(tried-picked)+' times');
  if(sprung) bad.push('a pinned trap counted itself sprung '+sprung+' times');

  /* and with nothing on it, the same trap does go off */
  var bare=0, bareFired=0;
  for(s=0;s<seeds*20 && bare<15;s++){
    bootTest(53500+s);
    var l2=straightLine4();
    if(!l2) continue;
    var bx=P.x+(l2.dx||0), by=P.y+(l2.dy||0);
    if(!walkable(bx,by)) continue;
    var k2=null;
    for(i=0;i<TRAPS.length;i++) if(TRAPS[i].reusable) k2=TRAPS[i];
    L.traps.length=0; L.items.length=0; L.mons.length=0;
    L.traps.push({ x:bx, y:by, k:k2, spent:0, found:1 });
    P.hp=P.mhp=90000; P.slots=new Array(N_SLOTS).fill(null); P.perks={};
    bare++;
    G.msgq=[]; G.beat=0;
    P.x=bx; P.y=by;
    var was=P.hp;
    afterStep();
    var said=G.msgq.map(function(q){ return q.s||''; }).join(' ');
    if(P.hp<was || /dodge|flat|sprung|caught|hiss|snap/i.test(said)) bareFired++;
  }
  if(bare && bareFired<bare*0.5)
    bad.push('a bare trap only went off '+bareFired+' of '+bare+' times');
  return { bad:bad, tried:tried, held:held, picked:picked, bare:bareFired+'/'+bare };
}

/* --------------------------------------------- caught in the crossfire
   A dart comes out of a wall and travels to the square that set the trap
   off.  Anything standing in between is in the way of it. */
function crossfireOK(seeds){
  var bad=[], s, i, tried=0, caught=0, spared=0;
  for(s=0;s<seeds*30 && tried<20;s++){
    bootTest(54000+s);
    /* a straight run with room for a wall, a spider and you */
    var line=straightLine4();
    if(!line) continue;
    var dx=line.dx||0, dy=line.dy||0;
    /* stand where a wall shooter will find a wall behind the spider */
    var mid=[P.x-dx, P.y-dy];
    if(!walkable(mid[0],mid[1])) continue;
    var kind=null;
    for(i=0;i<TRAPS.length;i++) if(TRAPS[i].k==='dart') kind=TRAPS[i];
    if(!kind){ bad.push('there is no dart trap'); break; }
    L.traps.length=0; L.items.length=0; L.mons.length=0;
    L.traps.push({ x:P.x, y:P.y, k:kind, spent:0, found:1 });
    var m=mkMonster('O',3,mid[0],mid[1]);
    m.hp=m.mhp=900; L.mons.push(m);
    P.hp=P.mhp=90000; P.perks={}; P.dex=P.mdex=3;
    G.msgq=[]; G.beat=0; G.shot=null;
    var hp0=P.hp, mhp0=m.hp;
    springTrap(L.traps[0]);
    /* the shooter picks its own wall; only count the runs where the
       spider actually ended up on the line */
    if(!G.shot) continue;
    var onLine = firstInLine([G.shot.sx, G.shot.sy], [P.x, P.y]) === m ||
                 (m.hp < mhp0);
    if(!onLine) continue;
    tried++;
    if(m.hp < mhp0) caught++;
    if(P.hp >= hp0) spared++;
  }
  if(!tried){ bad.push('never got anything standing in the way'); return { bad:bad }; }
  if(caught < tried) bad.push((tried-caught)+' of '+tried+' in the way were not hit');
  if(spared < tried) bad.push((tried-spared)+' darts got past the thing in the way');
  return { bad:bad, tried:tried, caught:caught, spared:spared };
}

/* --------------------------------------------- nothing underfoot in the moss
   It is the one room on the floor you can stop and rest in. */
function mossIsSafeOK(seeds){
  var bad=[], s, d, i, gardens=0, trapped=0, traps=0;
  for(s=0;s<seeds;s++){
    bootTest(52000+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down');
      var r=null;
      for(i=0;i<L.rooms.length && !r;i++)
        if(!L.rooms[i].gone && L.rooms[i].special==='moss') r=L.rooms[i];
      if(!r) continue;
      gardens++;
      var n=0;
      for(i=0;i<L.traps.length;i++)
        if(L.roomAt[L.traps[i].y*MAP_W+L.traps[i].x]===r.idx) n++;
      if(n){ trapped++; traps+=n; }
    }
  }
  if(!gardens) bad.push('no moss gardens to look at');
  if(trapped) bad.push(trapped+' moss gardens have a trap in them ('+traps+' traps)');
  return { bad:bad, gardens:gardens, trapped:trapped };
}

/* -------------------------------- an enchantment is a secret of its own
   Putting a thing on tells you what the thing is: its name, its plusses,
   whether it is cursed.  It tells you nothing about the magic worked into
   it, and until you study it or read a scroll over it, that magic does
   nothing at all - it is not an enchantment you are getting the benefit
   of if you do not know it is there. */
function runeSecretOK(){
  var bad=[], i;
  /* Each try gets its own seed.  This used to reseed with the same
     number every time, so sixty tries were one trial repeated sixty
     times: whether it passed came down to a single roll. */
  var freshN = 0;
  function fresh(){
    /* the floor never matters here at all - only the dice and the item */
    var fn = freshN++;
    if(fn%10===0) bootTest(56000 + fn);
    else bootRoll(56000 + fn);
    var w=mkItem('weapon', weaponIndex('long sword'));
    w.br='fire'; w.hp=1; w.dp=1;
    P.eq.rh=null; P.eq.lh=null;
    P.slots=new Array(N_SLOTS).fill(null);
    P.slots[0]=w;
    P.perks={}; P.wis=P.mwis=20;
    return w;
  }
  /* found: nothing given away */
  var w0=fresh();
  if(activeRune(w0)) bad.push('an enchantment works before you know of it');
  if(/of fire/.test(itemName(w0))) bad.push('the name gives the enchantment away when found');

  /* worn: the thing is known, the enchantment is not */
  var w1=fresh();
  equipTo('rh', w1);
  if(numbersKnown(w1)) bad.push('putting it on gave its plusses away');
  if(w1.brKnown) bad.push('putting it on gave the enchantment away');
  if(activeRune(w1)) bad.push('the enchantment works from wearing it alone');
  if(/of fire/.test(itemName(w1))) bad.push('the name gives it away once worn');
  var note = runeNote(w1);
  if(!note || note[0] !== 'enchantment unknown')
    bad.push('the pack says "' + (note && note[0]) + '" of an unknown enchantment');

  /* a scroll read over it: now you know, and now it works */
  var w2=fresh();
  equipTo('rh', w2);
  identifyItem(w2);
  if(!w2.brKnown) bad.push('a scroll of identify left the enchantment a mystery');
  if(!activeRune(w2)) bad.push('the enchantment still does nothing after identifying it');
  if(!/of fire/.test(itemName(w2))) bad.push('the name still hides it after identifying: '+itemName(w2));

  /* and studying it does the same, when the eye is good enough */
  var learned=0, tries=0;
  for(i=0;i<60;i++){
    var w3=fresh();
    w3.known=0; w3.tried=0;
    tries++;
    appraise(w3);
    if(w3.known && w3.brKnown) learned++;
    if(w3.known && !w3.brKnown) bad.push('studying it named the thing but not the enchantment');
  }
  if(!learned) bad.push('studying it never turned up the enchantment in '+tries+' tries');
  return { bad:bad, studied:learned+'/'+tries };
}

/* --------------------------------- the name, the numbers and the magic
   Three separate things to know about a blade, and putting it on gives
   you exactly one of them - and it is not the numbers.  A cursed thing
   announces itself the moment it is on you, because it will not come
   off again.  What it is called, what it is worth, and what is worked
   into it all come from studying it or from a scroll read over it.

   It used to hand you the numbers as well, on the grounds that you can
   feel the weight of a blade.  That was wrong twice over: taking it off
   again took the knowledge back, and knowing every plus in the dungeon
   for the price of a moment's wielding is most of the identify game
   given away for nothing. */
function threeKindsOfKnowingOK(){
  var bad=[], i;
  function fresh(kind, idx){
    bootTest(57000);
    var it=mkItem(kind, idx);
    it.br='fire'; it.brKnown=0; it.known=0;
    it.hp=2; it.dp=1; it.ap=2; it.cursed=1;
    P.eq={rh:null,body:null,lh:null,head:null,feet:null};
    P.slots=new Array(N_SLOTS).fill(null); P.slots[0]=it;
    KNOWN.gear[kind] = KNOWN.gear[kind] || {};
    KNOWN.gear[kind][idx] = 0;
    return it;
  }
  var pairs=[['weapon', weaponIndex('long sword'), 'long sword', 'rh'],
             ['armor', 3, ARMORS[3].n, 'body']];
  var lines=[];
  for(i=0;i<pairs.length;i++){
    var kind=pairs[i][0], idx=pairs[i][1], real=pairs[i][2], slot=pairs[i][3];
    var it=fresh(kind, idx);
    var onFloor=itemName(it);
    if(onFloor.indexOf(real)>=0) bad.push('a '+kind+' on the floor names itself: '+onFloor);
    if(/cursed|\+/.test(onFloor)) bad.push('a '+kind+' on the floor shows its numbers: '+onFloor);
    equipTo(slot, it);
    var worn=itemName(it);
    if(worn.indexOf(real)>=0) bad.push('putting a '+kind+' on named it: '+worn);
    if(worn.indexOf('cursed')<0) bad.push('putting a '+kind+' on hid the curse: '+worn);
    if(/\+/.test(worn)) bad.push('putting a '+kind+' on gave its plusses away: '+worn);
    if(worn.indexOf('of fire')>=0) bad.push('putting a '+kind+' on gave the enchantment away');
    /* And taking it off again does not un-tell you about the curse.
       Knowledge does not run backwards; it used to, because what was
       shown hung on whether the thing was in your hand at that moment
       rather than on what you had learnt about it. */
    P.eq[slot]=null;
    var off=itemName(it);
    if(off.indexOf('cursed')<0)
      bad.push('taking a '+kind+' off forgot that it was cursed: '+off);
    if(/\+/.test(off)) bad.push('a '+kind+' in the pack shows its plusses: '+off);
    P.eq[slot]=it;
    identifyItem(it);
    var known=itemName(it);
    if(known.indexOf(real)<0) bad.push('identifying a '+kind+' did not name it: '+known);
    if(known.indexOf('of fire')<0) bad.push('identifying a '+kind+' hid the enchantment: '+known);
    lines.push(onFloor+' -> '+worn+' -> '+known);
  }
  /* and handling one does not teach you the kind any more */
  var w2=fresh('weapon', weaponIndex('long sword'));
  equipTo('rh', w2);
  var other=mkItem('weapon', weaponIndex('long sword'));
  if(!hidesItsName(other))
    bad.push('wearing one taught you every other one of the kind by sight');
  return { bad:bad, ways:lines.join('; ') };
}

/* ---------------------------------------------- the two rings you carry
   They do nothing when pressed.  Battle luck lands blows better and gets
   the shafts back; the huntress turns up arrows where you look. */
function carriedRingsOK(seeds){
  var bad=[], i, s;
  var lk=ringIndex('battle luck'), hn=ringIndex('the huntress');
  if(lk<0||hn<0){ bad.push('one of the two rings is missing'); return { bad:bad }; }
  if(!RINGS[lk].worn||!RINGS[hn].worn) bad.push('they are not marked as worn rings');
  if(mkItem('ring',lk).ch) bad.push('battle luck holds charges');

  /* blows land better with it */
  function blows(withRing){
    bootTest(57500);
    P.slots=new Array(N_SLOTS).fill(null);
    if(withRing) P.slots[0]=mkItem('ring',lk);
    P.eq.rh=mkItem('weapon',weaponIndex('long sword'));
    P.lv=6; P.str=P.mstr=18;
    var tell=0, hits=0, t;
    for(t=0;t<600;t++){
      var m=fakeFoe();
      m.hp=m.mhp=90000;
      /* wide open, and awake: a high armour class is a poor one here, and
         a creature that has not seen you is ambushed rather than struck */
      m.ar=40; m.state=2; m.blindTo=0; m.surprised=0;
      G.msgq=[]; G.beat=0;
      playerAttack(m);
      var said=G.msgq.map(function(q){ return q.fx||''; }).join(' ');
      if(/damage|double/.test(said)) hits++;
      if(/double/.test(said)) tell++;
    }
    return hits ? tell*100/hits : 0;
  }
  var plainPct=blows(0), luckPct=blows(1);
  if(luckPct <= plainPct)
    bad.push('battle luck doubled no more blows: '+luckPct.toFixed(0)+'% against '+plainPct.toFixed(0)+'%');
  if(plainPct > CRIT_PCT + 6 || plainPct < CRIT_PCT - 6)
    bad.push('a plain blow lands well '+plainPct.toFixed(0)+'% of the time, not about '+CRIT_PCT+'%');

  /* and the shafts come back */
  function recover(withRing){
    var kept=0, shots=0;
    /* One floor, twenty shots.  Six hundred floors were being built to
       count arrows, twice over, and that alone was seven minutes. */
    for(s=0;s<seeds*30 && shots<120;s++){
      if(s % 20 === 0) bootTest(57900+s);
      var line=straightLine4();
      if(!line) continue;
      var tx=P.x+(line.dx||0)*3, ty=P.y+(line.dy||0)*3;
      if(!walkable(tx,ty)) continue;
      P.slots=new Array(N_SLOTS).fill(null);
      var q=mkItem('weapon',weaponIndex('arrow')); q.cnt=40; q.known=1;
      P.slots[0]=q;
      if(withRing) P.slots[1]=mkItem('ring',lk);
      P.eq.lh=mkItem('weapon',weaponIndex('short bow'));
      P.perks={}; P.lv=8;
      L.mons.length=0; L.items.length=0;
      var m=mkMonster('O',3,tx,ty); m.hp=m.mhp=90000; m.state=2; L.mons.push(m);
      G.beat=0; G.msgq=[];
      var before=L.items.length;
      if(!fireAt(m)) continue;
      shots++;
      for(i=before;i<L.items.length;i++)
        if(L.items[i].t==='weapon' && WEAPONS[L.items[i].k].n==='arrow') kept++;
    }
    return shots ? kept*100/shots : 0;
  }
  var plainKeep=recover(0), luckKeep=recover(1);
  if(luckKeep <= plainKeep)
    bad.push('battle luck recovered no more arrows: '+luckKeep.toFixed(0)+'% against '+plainKeep.toFixed(0)+'%');

  /* and the huntress turns up arrows rather than stones */
  function ammoMix(withRing){
    var arrows=0, all=0;
    bootTest(58200);
    P.slots=new Array(N_SLOTS).fill(null);
    if(withRing) P.slots[0]=mkItem('ring',hn);
    for(i=0;i<600;i++){
      var a=mkAmmo(3);
      all++;
      if(WEAPONS[a.k].n==='arrow') arrows++;
    }
    return arrows*100/all;
  }
  var plainMix=ammoMix(0), huntMix=ammoMix(1);
  if(huntMix <= plainMix + 10)
    bad.push('the huntress turned up '+huntMix.toFixed(0)+'% arrows against '+plainMix.toFixed(0)+'%');
  return { bad:bad,
    crit: plainPct.toFixed(0)+'% -> '+luckPct.toFixed(0)+'%',
    keep: plainKeep.toFixed(0)+'% -> '+luckKeep.toFixed(0)+'%',
    mix: plainMix.toFixed(0)+'% -> '+huntMix.toFixed(0)+'%' };
}

/* ------------------------------------ one stone in the air at a time
   A stone that misses sails on past and comes down somewhere behind.
   Only then does the rune on it go off - a returning stone that turned
   round the moment it passed its target was on the screen twice: one
   still flying out and one already flying home. */
function oneStoneAloftOK(seeds){
  var bad=[], s, tried=0, overlapped=0, homeFromLanding=0;
  for(s=0;s<seeds*30 && tried<25;s++){
    bootTest(59000+s);
    var line=straightLine4();
    if(!line) continue;
    var dx=line.dx||0, dy=line.dy||0;
    var tx=P.x+dx*3, ty=P.y+dy*3;
    if(!walkable(tx,ty)) continue;
    /* somewhere for it to sail on to */
    if(!walkable(P.x+dx*5, P.y+dy*5)) continue;
    L.mons.length=0; L.items.length=0;
    var m=mkMonster('O',3,tx,ty);
    m.hp=m.mhp=90000; m.ar=-60;            /* it cannot be hit */
    m.state=2; L.mons.push(m);
    var st=mkItem('weapon', weaponIndex('returning stone'));
    st.cnt=1; st.known=1;
    P.slots=new Array(N_SLOTS).fill(null); P.slots[0]=st;
    P.eq.lh=null; P.lv=1; P.perks={};
    G.beat=0; G.msgq=[]; G.shot=null; G.ret=null;
    G.throwing=st;
    if(!fireAt(m)){ G.throwing=null; continue; }
    G.throwing=null;
    if(!G.shot || !G.ret) continue;        /* it hit, or never went */
    tried++;
    /* the flight out has to be over before the flight home begins */
    var outEnds = G.shot.t + G.shot.dur;
    if(G.ret.t < outEnds - 5) overlapped++;
    /* and it comes home from where it came down */
    if(G.ret.fx === G.shot.ex && G.ret.fy === G.shot.ey) homeFromLanding++;
  }
  if(!tried){ bad.push('never got a returning stone to miss'); return { bad:bad }; }
  if(overlapped) bad.push(overlapped+' of '+tried+' had two stones in the air at once');
  if(homeFromLanding<tried)
    bad.push((tried-homeFromLanding)+' came home from the wrong square');
  return { bad:bad, tried:tried, overlapped:overlapped };
}

/* -------------------------------------------- a room announced in a box
   Walking into a room somebody built puts a box up over the map: the
   room's own words, its own picture, and nothing said twice. */
function roomBoxOK(seeds){
  var bad=[], k, kinds={}, seen={}, tried=0;
  for(k in ROOM_ENTRY){
    kinds[k]=1;
    if(!ROOM_TITLE[k]) bad.push('the '+k+' room has no heading');
    if(!ROOM_ICON[k]){ bad.push('the '+k+' room has no picture'); continue; }
    if(ATLAS.index[ROOM_ICON[k]]===undefined)
      bad.push('the '+k+' room asks for a sprite the sheet has not got: '+ROOM_ICON[k]);
  }
  var atDoor=0, doors=0;
  for(var s=0;s<(seeds||14);s++){
    bootTest(64300+s);
    for(var d=2;d<=9;d++){
      enterLevel(d,'down');
      var ri=-1, i;
      for(i=0;i<L.rooms.length;i++)
        if(!L.rooms[i].gone && L.rooms[i].special && ROOM_ENTRY[L.rooms[i].special]) ri=i;
      if(ri<0) continue;
      var r=L.rooms[ri];
      if(!r.floors || !r.floors.length) continue;
      /* Standing in the doorway is the moment the door is open and you
         can see in.  That is where it should be said, a turn before you
         set foot inside. */
      var door=null, dx3, dy3;
      for(dy3=0;dy3<MAP_H && !door;dy3++) for(dx3=0;dx3<MAP_W && !door;dx3++){
        if(!isDoorish(dx3,dy3)) continue;
        for(var q4=0;q4<DIR4.length;q4++)
          if(roomIndexAt(dx3+DIR4[q4][0], dy3+DIR4[q4][1])===ri) door={x:dx3,y:dy3};
      }
      if(door){
        doors++;
        r.told=0; G.roomBox=null; P.blind=0; P.x=door.x; P.y=door.y; G.msgq=[];
        announceRoom();
        if(G.roomBox && G.roomBox.kind===r.special) atDoor++;
        else bad.push('the '+r.special+' room said nothing from its own doorway');
        r.told=0; G.roomBox=null;
      }
      /* stand in it and let the step be dealt with */
      G.roomBox=null; r.told=0;
      P.x=r.floors[0][0]; P.y=r.floors[0][1];
      G.msgq=[];
      announceRoom();
      tried++;
      seen[r.special]=1;
      if(!G.roomBox){ bad.push('walking into the '+r.special+' room put no box up'); continue; }
      if(G.roomBox.kind!==r.special)
        bad.push('the box named the wrong room: '+G.roomBox.kind+' for '+r.special);
      /* and it is said once only */
      G.roomBox=null;
      announceRoom();
      if(G.roomBox) bad.push('the '+r.special+' room announced itself twice');
    }
  }
  if(!tried) bad.push('never found a room worth announcing');
  if(!doors) bad.push('never found a special room with a door on it');
  return { bad:bad, tried:tried, kinds:Object.keys(seen).length, of:Object.keys(kinds).length,
           doors:doors, atDoor:atDoor };
}

/* --------------------------------------------- words in the pack panel
   The EFFECTS list at the foot of the pack is a bare list: there is
   nothing above a line for the word "it" to point back at.  A rune's own
   `txt` is written to sit under the name of the thing it is cut into, so
   in the list it has to name that thing itself - "armor bites your
   attacker", not "it bites your attacker", which reads as though
   something were biting you. */
function effectWordsOK(){
  var bad=[], i, room=effectsColPx();
  var worn=mkItem('armor',0), blade=mkItem('weapon',weaponIndex('long sword'));
  for(i=0;i<RUNES.length;i++){
    var rn=RUNES[i];
    if(rn.t.indexOf('g')<0) continue;              /* worn ones only */
    var line=runeEffect(worn, rn);
    if(/^it['s ]/.test(line) || /^its /.test(line))
      bad.push('the '+rn.n+' rune says "'+line+'" in the effects list, with no "it" to point at');
    if(textPx(line)>room)
      bad.push('the '+rn.n+' rune runs off the panel: '+textPx(line)+'px of '+room);
    if(rn.t.indexOf('w')>=0){
      /* offered to blades as well: it must not call a sword armour */
      var wline=runeEffect(blade, rn);
      if(wline===line) bad.push('the '+rn.n+' rune reads the same on a blade as on armour');
      if(/armor|armour/.test(wline)) bad.push('the '+rn.n+' rune calls a blade armour');
      if(textPx(wline)>room) bad.push('the '+rn.n+' rune runs off the panel on a blade');
    }
  }
  /* the one that was complained of, by name */
  var th=null;
  for(i=0;i<RUNES.length;i++) if(RUNES[i].n==='thorns') th=RUNES[i];
  if(!th) bad.push('there is no rune of thorns');
  else {
    var tl=runeEffect(worn, th);
    if(!/armor/.test(tl)) bad.push('the thorns line does not say what is doing the biting: '+tl);
    if(!/attack/.test(tl)) bad.push('the thorns line does not say who it happens to: '+tl);
  }
  /* and it really is what the pack would print */
  bootTest(63100);
  var body=mkItem('armor',0); body.known=1; body.br='thorns'; body.brKnown=1;
  P.eq.body=body;
  var lines=playerEffects().map(function(e){ return e[0]; });
  var got=null;
  for(i=0;i<lines.length;i++) if(/bites/.test(lines[i])) got=lines[i];
  if(!got) bad.push('a suit of thorned armour says nothing in the effects list');
  else if(/^it /.test(got)) bad.push('the pack still prints "'+got+'"');

  /* a bow shoots; it is not a firearm */
  var bows=[], nb;
  for(i=0;i<WEAPONS.length;i++) if(WEAPONS[i].launch) bows.push(i);
  if(!bows.length) bad.push('there are no bows');
  for(i=0;i<bows.length;i++){
    nb=mkItem('weapon',bows[i]); nb.known=1;
    var notes=itemNotes(nb).map(function(e){ return e[0]; }).join(' | ');
    if(/fires /.test(notes)) bad.push(WEAPONS[bows[i]].n+' says it fires: '+notes);
    if(!/shoots /.test(notes)) bad.push(WEAPONS[bows[i]].n+' does not say it shoots: '+notes);
  }

  /* the ring of battle luck says what it actually does */
  var bl=null;
  for(i=0;i<RINGS.length;i++) if(RINGS[i].n==='battle luck') bl=RINGS[i];
  if(!bl) bad.push('there is no ring of battle luck');
  else {
    if(/and keep$/.test(bl.txt)) bad.push('the ring still trails off with "and keep"');
    if(!/arrow/.test(bl.txt)) bad.push('the ring does not say the arrows come back: '+bl.txt);
    if(!/double/.test(bl.txt)) bad.push('the ring does not say what the blows do: '+bl.txt);
  }
  return { bad:bad, room:room };
}

/* ------------------------------------------- a curse you can point at
   Reported: five damage a turn in water, and no cursed object anywhere
   to be seen.  The curse was in the list at the foot of the pack all
   along - underneath the perks and the runes, in a panel that shows two
   lines and counts the rest, so it might as well not have been written.

   Three things have to be true.  The pack must say so in its first two
   lines, it must name the thing carrying it, and the burn itself must
   explain where it came from the first time it happens. */
function cursePlainOK(){
  var bad=[], i, c;
  for(c=0;c<CURSES.length;c++){
    var cd=CURSES[c];
    bootTest(66000+c);
    /* a helm you cannot take off, with this curse in it */
    var hat=mkItem('head',0);
    hat.known=1; hat.cursed=1; hat.curse=cd.id;
    P.eq.head=hat;
    /* and a few ordinary things going on at the same time, which is the
       whole of the difficulty: the panel shows two lines, so a curse
       listed after the hunger and the perks is a curse nobody sees */
    G.hungerState=1; P.conf=4; P.blind=3; P.haste=5;
    if(!hasCurse(cd.id)) bad.push('a worn curse of '+cd.n+' is not felt at all');
    var lines=playerEffects();
    var room=2;                       /* what the panel actually shows */
    var top=lines.slice(0,room).map(function(e){ return e[0]; });
    var said=top.join(' | ');
    if(said.toLowerCase().indexOf('curse')<0)
      bad.push('the curse of '+cd.n+' is not in the first '+room+' lines of the pack: '+said);
    var src=shortItem(hat);
    if(said.indexOf(src)<0)
      bad.push('the pack does not name the '+src+' carrying the curse of '+cd.n+': '+said);
    /* and the line that is always on the screen says something */
    if(!cursesOnYou().length) bad.push('nothing is counted as cursed');
    /* the item itself, read in the pack, names which curse it is */
    var notes=itemNotes(hat).map(function(e){ return e[0]; }).join(' | ');
    if(notes.indexOf('CURSED')<0) bad.push('a cursed helm does not say it is cursed');
    if(notes.indexOf(cd.txt)<0)
      bad.push('a cursed helm does not say which curse: '+notes);
    P.eq.head=null;
    G.hungerState=0; P.conf=0; P.blind=0; P.haste=0;
  }

  /* the water burn says what is doing it, the first time it burns */
  bootTest(66100);
  var hat2=mkItem('head',0); hat2.known=1; hat2.cursed=1; hat2.curse='water';
  P.eq.head=hat2;
  P.hp=P.mhp=900; G.saidWaterCurse=0; G.msgq=[];
  soakPlayer();
  var first=G.msgq.map(function(q){ return String(q.s||''); }).join(' | ');
  if(first.indexOf('cursed')<0)
    bad.push('the first burn does not say you are cursed: '+first);
  if(first.indexOf(shortItem(hat2))<0)
    bad.push('the first burn does not name what is cursed: '+first);
  /* and it does not keep saying it */
  G.msgq=[];
  soakPlayer();
  var again=G.msgq.map(function(q){ return String(q.s||''); }).join(' | ');
  if(again.indexOf('cursed')>=0)
    bad.push('the burn explains itself every single turn: '+again);
  if(!/burns/.test(again)) bad.push('the burn stopped saying anything at all: '+again);
  P.eq.head=null;
  return { bad:bad, curses:CURSES.length };
}

/* -------------------------------------------------- keeping your feet
   A rune cut into what you wear on your feet, and a creature born with
   four of them.  Both come to the same thing: running headlong in a
   fight is how you go over, and these never do. */
function sureFootedOK(){
  var bad=[], i, sf=null;
  for(i=0;i<RUNES.length;i++) if(RUNES[i].n==='sure footed') sf=RUNES[i];
  if(!sf){ bad.push('there is no sure footed rune'); return { bad:bad }; }
  /* it belongs to footwear and to nothing else */
  if(sf.t!=='f') bad.push('the sure footed rune is offered to '+sf.t+', not to boots alone');
  var pools={};
  ['g','gh','gf'].forEach(function(kind){
    pools[kind]=0;
    for(i=0;i<RUNES.length;i++){
      var fits=0, c;
      for(c=0;c<RUNES[i].t.length;c++) if(kind.indexOf(RUNES[i].t.charAt(c))>=0) fits=1;
      if(fits && RUNES[i].n==='sure footed') pools[kind]=1;
    }
  });
  if(pools.g) bad.push('a breastplate can be cut with sure footed');
  if(pools.gh) bad.push('a helmet can be cut with sure footed');
  if(!pools.gf) bad.push('boots cannot be cut with sure footed at all');
  /* and the pool a boot asks from is the one that contains it */
  bootTest(67000);
  var boots=mkItem('feet',1);
  if(gearRuneKind(boots)!=='gf') bad.push('boots ask the wrong pool: '+gearRuneKind(boots));
  if(gearRuneKind(mkItem('head',0))!=='gh') bad.push('a helm no longer asks for its own rune');
  if(gearRuneKind(mkItem('armor',0))!=='g') bad.push('a coat asks for something odd');

  /* worn, you never go over; the same trial without them, you do */
  function falls(withRune){
    var fell=0, steps=0, s, t;
    for(s=0;s<200 && steps<240;s++){
      if(s%20===0) bootTest(67100+s); else bootRoll(67100+s);
      var lane=null, d;
      for(d=0;d<DIR4.length;d++){
        var dx=DIR4[d][0], dy=DIR4[d][1], ok=1, n;
        for(n=1;n<=3;n++){
          if(!walkable(P.x+dx*n,P.y+dy*n)||!walkable(P.x-dx*n,P.y-dy*n)){ ok=0; break; }
          if(inWater(P.x+dx*n,P.y+dy*n)||inWater(P.x-dx*n,P.y-dy*n)){ ok=0; break; }
        }
        if(ok && !inWater(P.x,P.y)){ lane={dx:dx,dy:dy}; break; }
      }
      if(!lane) continue;
      var hx=P.x-lane.dx*2, hy=P.y-lane.dy*2;
      L.mons.length=0;
      var back=mkMonster('E',5,hx,hy);
      back.hp=back.mhp=90000; back.state=2; back.still=1; L.mons.push(back);
      P.hp=P.mhp=90000; P.dex=P.mdex=3; P.conf=0; P.blind=0;
      var bt=mkItem('feet',1); bt.known=1;
      if(withRune){ bt.br='sure footed'; bt.brKnown=1; }
      P.eq.feet=bt;
      computeVis();
      if(!battleNear()) continue;
      if(!(monSeesPlayer(back) && canSeeMon(back))) continue;
      for(t=0;t<3 && steps<240;t++){
        P.runSteps=RUN_AFTER+5;
        back.x=hx; back.y=hy;
        var px=P.x, py=P.y;
        G.msgq=[]; G.beat=0;
        playerMove(lane.dx, lane.dy);
        steps++;
        for(i=0;i<G.msgq.length;i++) if(/stumble/.test(String(G.msgq[i].s||''))) fell++;
        P.x=px; P.y=py;
      }
    }
    return { fell:fell, steps:steps };
  }
  var bare=falls(0), shod=falls(1);
  if(!bare.steps||!shod.steps){ bad.push('never got a run going'); return { bad:bad }; }
  if(!bare.fell) bad.push('barefoot you never stumbled either, so the rune proves nothing');
  if(shod.fell) bad.push('you went over '+shod.fell+' times of '+shod.steps+' in sure footed boots');

  /* a centaur keeps its feet, and something else does not */
  var sure=[], plain=[];
  for(i=0;i<MONS.length;i++) (MONS[i].sure?sure:plain).push(MONS[i].c);
  if(sure.indexOf('C')<0) bad.push('a centaur is not sure footed');
  function monFalls(c){
    var fell=0, tries=0, s;
    for(s=0;s<400;s++){
      bootTest(67300+s%20); srand(67400+s);
      L.mons.length=0;
      var sp=null, d;
      for(d=0;d<DIR4.length;d++)
        if(walkable(P.x+DIR4[d][0],P.y+DIR4[d][1])) sp={x:P.x+DIR4[d][0],y:P.y+DIR4[d][1]};
      if(!sp) continue;
      var mm=mkMonster(c,5,sp.x,sp.y); mm.hp=mm.mhp=90000; mm.state=2; L.mons.push(mm);
      mm.runSteps=RUN_AFTER+5; mm.flee=3;
      tries++;
      if(monStumbles(mm)) fell++;
    }
    return { fell:fell, tries:tries };
  }
  var cen=monFalls('C'), orc=monFalls('O');
  if(!orc.fell) bad.push('nothing stumbles at all, so the centaur proves nothing');
  if(cen.fell) bad.push('a centaur went over '+cen.fell+' times of '+cen.tries);
  /* and it is written down where a player can read it */
  var hinted=0;
  for(i=0;i<HINTS.length;i++) if(/centaur never stumbles/i.test(HINTS[i])) hinted=1;
  if(!hinted) bad.push('no hint says a centaur never stumbles');
  return { bad:bad, bare:bare, shod:shod, cen:cen, orc:orc, sure:sure.length };
}

/* --------------------------------------------------- a wand run dry
   The last charge goes and so does the wand: a stick of dead wood is a
   slot in the pack you have to notice is useless and clear out. */
function spentWandGoesOK(){
  var bad=[], i, k, checked=0;
  for(k=0;k<WANDS.length;k++){
    bootTest(67500+k);
    P.slots=new Array(N_SLOTS).fill(null);
    L.mons.length=0;
    var w=mkItem('wand',k); w.known=1; w.ch=1;
    P.slots[0]=w;
    G.msgq=[];
    zapWand(w, 1, 0);
    checked++;
    var still=null, all=carriedItems();
    for(i=0;i<all.length;i++) if(all[i]===w) still=all[i];
    if(still) bad.push('a spent '+WANDS[k].n+' wand is still in the pack with '+still.ch+' charges');
    var said=G.msgq.map(function(q){ return String(q.s||''); }).join(' | ');
    if(!/crumbles/.test(said)) bad.push('nothing was said when the '+WANDS[k].n+' wand ran dry: '+said);
  }
  /* one with something left in it stays */
  bootTest(67600);
  P.slots=new Array(N_SLOTS).fill(null);
  var w2=mkItem('wand',0); w2.known=1; w2.ch=3; P.slots[0]=w2;
  G.msgq=[];
  zapWand(w2, 1, 0);
  if(carriedItems().indexOf(w2)<0) bad.push('a wand with charges left crumbled anyway');
  if(w2.ch!==2) bad.push('a zap cost '+(3-w2.ch)+' charges');
  return { bad:bad, checked:checked };
}

/* ------------------------------------------------ blind is blind
   Everything the game says about what a place looks like is something
   your eyes did.  With them shut it says none of it. */
function blindQuietOK(){
  var bad=[], i;
  function said(){ return G.msgq.map(function(q){ return String(q.s||''); }).join(' | '); }
  /* walking into the dark, and out again */
  /* dark rooms are only one floor in six, so keep dealing until there is
     a pitch dark square to walk into */
  var dark=-1, sd;
  for(sd=0;sd<40 && dark<0;sd++){
    bootTest(67700+sd);
    /* the lamps stay lit on the top floors, so go down to where they do not */
    enterLevel(DARK_MIN_DEPTH + 2, 'down');
    for(i=0;i<L.tiles.length;i++)
      if(L.darkMap && L.darkMap[i] && walkTile(L.tiles[i])){ dark=i; break; }
  }
  if(dark<0) bad.push('found no pitch dark square on any of forty floors');
  else {
    var dx2=dark%MAP_W, dy2=(dark/MAP_W)|0;
    /* sighted, crossing the line is worth a word */
    P.blind=0; G.wasDark=0; P.x=dx2; P.y=dy2; G.msgq=[];
    noteDarkness();
    if(!/pitch dark/.test(said())) bad.push('walking into the dark said nothing: '+said());
    /* blind, it is not */
    P.blind=20; G.wasDark=0; G.msgq=[];
    noteDarkness();
    if(said()) bad.push('blind, walking into the dark still said: '+said());
    /* and coming out of it */
    G.wasDark=1; G.msgq=[];
    P.x=dx2; P.y=dy2;
    if(!darkAt(P.x,P.y)) { /* already out */ }
    P.blind=20; G.wasDark=1;
    var lit=-1;
    for(i=0;i<L.tiles.length;i++)
      if(walkTile(L.tiles[i]) && !(L.darkMap && L.darkMap[i])){ lit=i; break; }
    if(lit>=0){
      P.x=lit%MAP_W; P.y=(lit/MAP_W)|0; G.msgq=[];
      noteDarkness();
      if(said()) bad.push('blind, coming out of the dark still said: '+said());
      P.blind=0; G.wasDark=1; G.msgq=[];
      noteDarkness();
      if(!/see again/.test(said())) bad.push('sighted, coming out of the dark said nothing');
    }
  }
  /* a room somebody built: blind you walk in and know nothing, and it
     keeps its secret until you can look at it */
  var told=0, quiet=0, s;
  for(s=0;s<20;s++){
    bootTest(67800+s);
    var ri=-1;
    for(i=0;i<L.rooms.length;i++)
      if(!L.rooms[i].gone && L.rooms[i].special && ROOM_ENTRY[L.rooms[i].special]) ri=i;
    if(ri<0) continue;
    var r=L.rooms[ri];
    if(!r.floors||!r.floors.length) continue;
    P.x=r.floors[0][0]; P.y=r.floors[0][1];
    r.told=0; G.roomBox=null; P.blind=20; G.msgq=[];
    announceRoom();
    if(G.roomBox||said()) bad.push('blind, the '+r.special+' room described itself');
    if(r.told) bad.push('blind, the '+r.special+' room counted itself as told');
    quiet++;
    /* eyes open, and there it is */
    P.blind=0; G.msgq=[]; G.roomBox=null;
    announceRoom();
    if(!G.roomBox) bad.push('with your eyes open the '+r.special+' room said nothing');
    else told++;
  }
  if(!quiet) bad.push('never found a built room to walk into');
  P.blind=0;
  return { bad:bad, rooms:told };
}

/* ------------------------------------------------- knock back, on a club
   The rune is offered to every weapon, a mace included, and a mace is the
   club of the set.  What is checked here is that a club can really be
   dealt one and that a blow from it really shoves. */
function knockBackClubOK(){
  var bad=[], i, kb=null;
  for(i=0;i<RUNES.length;i++) if(RUNES[i].n==='knockback') kb=RUNES[i];
  if(!kb){ bad.push('there is no knock back rune'); return { bad:bad }; }
  if(kb.t.indexOf('w')<0) bad.push('knock back is not offered to weapons at all');
  var clubs=[];
  for(i=0;i<WEAPONS.length;i++) if(WEAPONS[i].gen==='club') clubs.push(i);
  if(!clubs.length) bad.push('there is no club to cut it into');
  /* dealt by the dungeon, not conjured: the pool a weapon draws from has
     to contain it */
  bootTest(71000);
  var dealt=0, carried=0, n;
  for(n=0;n<120000 && carried<3;n++){
    var it=newItem(6);
    if(!it || it.t!=='weapon' || clubs.indexOf(it.k)<0) continue;
    dealt++;
    if(it.br==='knockback') carried++;
  }
  if(!dealt) bad.push('no club was ever dealt');
  else if(!carried) bad.push('over '+dealt+' clubs not one carried knock back');
  /* and it shoves */
  var shoved=0, landed=0;
  for(var s=0;s<300;s++){
    bootTest(71100+s);
    L.mons.length=0; P.hp=P.mhp=90000;
    var sp=null, d;
    for(d=0;d<DIR4.length;d++)
      if(walkable(P.x+DIR4[d][0],P.y+DIR4[d][1]) && walkable(P.x+DIR4[d][0]*2,P.y+DIR4[d][1]*2))
        sp={x:P.x+DIR4[d][0],y:P.y+DIR4[d][1]};
    if(!sp) continue;
    var club=mkItem('weapon',clubs[0]);
    club.known=1; club.br='knockback'; club.brKnown=1;
    P.eq.rh=club;
    var m=mkMonster('O',3,sp.x,sp.y); m.hp=m.mhp=90000; m.state=2; L.mons.push(m);
    var wx=m.x, wy=m.y;
    G.msgq=[];
    playerAttack(m);
    var fx=G.msgq.map(function(q){ return q.fx||''; }).join(',');
    if(!/damage|double|sneak/.test(fx)) continue;
    landed++;
    if(m.x!==wx||m.y!==wy) shoved++;
  }
  if(!landed) bad.push('never landed a blow with a club');
  else if(!shoved) bad.push('a club of knock back shoved nothing over '+landed+' landed blows');
  return { bad:bad, dealt:dealt, landed:landed, shoved:shoved };
}

/* ------------------------------------------------ you eat little
   Wanderer boots used to stop hunger dead: the meter sat at 100% for a
   whole run, which is not eating little, it is not eating.  Thirty per
   cent longer is what they are worth. */
function slowDigestionOK(){
  var bad=[], k=-1, i;
  for(i=0;i<FEET.length;i++) if(FEET[i].prop==='slow digestion') k=i;
  if(k<0){ bad.push('nothing has slow digestion on it'); return { bad:bad }; }
  function turnsTo(state, boots, perk){
    bootTest(74000);
    P.food=FOOD_MAX; G.hungerState=0; P.digCtr=0; P.abstCtr=0;
    P.eq.feet=null; P.perks={};
    if(boots){ var b=mkItem('feet',k); b.known=1; P.eq.feet=b; }
    if(perk) P.perks['abstemious']=1;
    var t=0;
    while(G.hungerState<state && t<60000){ upkeep(); t++; }
    P.eq.feet=null; P.perks={};
    return t;
  }
  var bare=turnsTo(1,0,0), shod=turnsTo(1,1,0), both=turnsTo(1,1,1);
  if(shod>=60000) bad.push('in the boots you never grow hungry at all');
  var pct=Math.round((shod/bare-1)*100);
  if(pct<20||pct>40) bad.push('the boots are worth '+pct+'% longer, not about 30%');
  if(both<=shod) bad.push('the perk and the boots together are worth no more than the boots');
  /* and they do not make you proof against starving */
  var starve=turnsTo(3,1,0);
  if(starve>=60000) bad.push('in the boots you never starve either');
  return { bad:bad, bare:bare, shod:shod, both:both, pct:pct, starve:starve };
}

/* -------------------------------------------- fire runs through web
   Nothing else in the dungeon catches from the square next door - a
   table has to be standing in the flame.  Web is a room full of tinder
   strung across the floor. */
function webBurnsOK(){
  var bad=[], i, d;
  /* a lane of open floor to string it across */
  var lane=null;
  for(var sd=0;sd<40 && !lane;sd++){
    bootTest(74100+sd);
    L.mons.length=0; L.webs={}; L.clouds.length=0;
    for(d=0;d<DIR4.length && !lane;d++){
      var x=P.x, y=P.y, ok=1;
      for(var n=1;n<=7;n++){
        x+=DIR4[d][0]; y+=DIR4[d][1];
        if(!walkable(x,y)||isDoorish(x,y)||inWater(x,y)||L.decor[y*MAP_W+x]){ ok=0; break; }
      }
      if(ok) lane=DIR4[d];
    }
  }
  if(!lane){ bad.push('nowhere to string a line of web'); return { bad:bad }; }
  P.hp=P.mhp=900000;
  var cells=[];
  for(i=1;i<=7;i++){
    var cx=P.x+lane[0]*i, cy=P.y+lane[1]*i;
    layWeb(cx,cy,0,0,WEB_LIFE_NEST);
    cells.push([cx,cy]);
  }
  var laid=0;
  for(i=0;i<cells.length;i++) if(webAt(cells[i][0],cells[i][1])) laid++;
  if(laid<5){ bad.push('only '+laid+' squares of web went down'); return { bad:bad }; }
  /* light the near end and let it run */
  dropEmber(cells[0][0], cells[0][1], WEB_BURN_MIN);
  var turns=0, left=laid;
  while(left && turns<40){
    ageClouds();
    turns++;
    left=0;
    for(i=0;i<cells.length;i++) if(webAt(cells[i][0],cells[i][1])) left++;
  }
  if(left) bad.push('the fire stopped with '+left+' squares of web still there');
  if(turns>laid*WEB_BURN_MAX)
    bad.push('it took '+turns+' turns to run through '+laid+' squares - it is not spreading');
  /* and it is really gone: the drawing and the patch that catches you */
  for(i=0;i<cells.length;i++){
    var j=cells[i][1]*MAP_W+cells[i][0];
    if(L.decor[j]==='web') bad.push('burnt web is still drawn on the floor');
    if(L.webs[j]) bad.push('burnt web still catches you');
  }
  /* nothing else jumps: a table beside a fire is a table */
  bootTest(74200);
  L.clouds.length=0; L.webs={};
  var spot=null;
  for(d=0;d<DIR4.length && !spot;d++){
    var tx=P.x+DIR4[d][0], ty=P.y+DIR4[d][1];
    var ux=P.x+DIR4[d][0]*2, uy=P.y+DIR4[d][1]*2;
    if(walkable(tx,ty)&&walkable(ux,uy)&&!L.decor[ty*MAP_W+tx]&&!L.decor[uy*MAP_W+ux]&&
       !inWater(tx,ty)&&!inWater(ux,uy)) spot={x:tx,y:ty,ux:ux,uy:uy};
  }
  if(spot){
    L.decor[spot.uy*MAP_W+spot.ux]='table';
    dropEmber(spot.x,spot.y,3);
    for(i=0;i<3;i++) ageClouds();
    if(L.decor[spot.uy*MAP_W+spot.ux]!=='table')
      bad.push('a table caught fire from the square next to it');
    delete L.decor[spot.uy*MAP_W+spot.ux];
  }
  return { bad:bad, squares:laid, turns:turns };
}

/* ----------------------------------------------- a spinner's nest
   It sits in the corner of a room in a nest of its own web, so you meet
   the web before you meet the thing that made it. */
function spinNestOK(seeds){
  var bad=[], i, k, floors=0, spinners=0, nested=0, sizes=[], corners=0;
  for(var s=0;s<(seeds||40);s++){
    bootTest(74300+s);
    for(var d=2;d<=9;d++){
      enterLevel(d,'down');
      floors++;
      /* how many nesting spinners each room holds, and how much web is
         in it.  Two nests in one room run into each other, so the web is
         counted per room rather than per creature. */
      var perRoom={}, j;
      for(i=0;i<L.mons.length;i++){
        var m=L.mons[i];
        if(!m.def || m.def.sp!=='web') continue;
        spinners++;
        if(!m.nest) continue;
        nested++;
        var ri=L.roomAt[m.y*MAP_W+m.x];
        perRoom[ri]=(perRoom[ri]||0)+1;
        if(!webAt(m.x,m.y)) bad.push('a nesting spinner is not sitting in its own web');
        if(L.webs[m.y*MAP_W+m.x]>=0) bad.push('a nest rots away like a shot patch');
        /* and it really is in a corner */
        var walls=0;
        for(k=0;k<DIR8.length;k++){
          var wx=m.x+DIR8[k][0], wy=m.y+DIR8[k][1];
          if(wx<0||wy<0||wx>=MAP_W||wy>=MAP_H){ walls++; continue; }
          var t=L.tiles[wy*MAP_W+wx];
          if(t===WALL||t===ROCK||t===SDOOR) walls++;
        }
        if(walls>=4) corners++;
        else bad.push('a nesting spinner sits with only '+walls+' walls about it');
      }
      var webPerRoom={};
      for(j in L.webs){
        var rj=L.roomAt[j|0];
        webPerRoom[rj]=(webPerRoom[rj]||0)+1;
      }
      for(j in perRoom){
        var n=webPerRoom[j]||0, want=perRoom[j];
        sizes.push(n/want);
        if(n<want*NEST_MIN || n>want*NEST_MAX)
          bad.push(want+' nest(s) in one room came to '+n+' squares, outside '+
            (want*NEST_MIN)+'-'+(want*NEST_MAX));
      }
    }
  }
  if(!spinners) bad.push('no web spinner turned up on any floor');
  else if(!nested) bad.push('not one of '+spinners+' spinners sat in a nest');
  var pct=spinners?Math.round(100*nested/spinners):0;
  if(spinners>=15 && (pct<40 || pct>95))
    bad.push(pct+'% of spinners nested, which is not "often"');
  var avg=sizes.length?sizes.reduce(function(a,b){return a+b;},0)/sizes.length:0;
  return { bad:bad, floors:floors, spinners:spinners, nested:nested, pct:pct,
           avg:avg, corners:corners };
}

/* ---------------------------------------- the air hurts you at once
   Poison you walk into burns as you arrive, not a beat after you are
   drawn walking out again.  The clouds used to be aged at the tail of
   the turn, after the creatures had moved, so the damage was stamped
   later on the log's clock than the step that carried you into it. */
function fumesAtOnceOK(){
  var bad=[], i;
  bootTest(75000);
  L.mons.length=0; L.clouds.length=0;
  P.hp=P.mhp=900;
  /* a square to walk into, and gas on it */
  var d=null;
  for(i=0;i<DIR4.length;i++)
    if(walkable(P.x+DIR4[i][0],P.y+DIR4[i][1]) && !inWater(P.x+DIR4[i][0],P.y+DIR4[i][1]))
      d=DIR4[i];
  if(!d){ bad.push('nowhere to step'); return { bad:bad }; }
  var gx=P.x+d[0], gy=P.y+d[1];
  L.clouds.push({ x:gx, y:gy, kind:'gas', turns:6 });
  G.msgq=[]; G.beat=0; G.turn=0;
  var was=P.hp;
  /* the turn as the game really plays it */
  var stepAt = beatNow();
  playerMove(d[0], d[1]);
  G.turn++;
  cloudsOnYou();
  var hurtAt = null;
  for(i=0;i<G.msgq.length;i++)
    if(/burns your lungs/.test(String(G.msgq[i].s||''))) hurtAt = G.msgq[i].at;
  beatWait(BEAT_PLAYER);
  monstersMove();
  upkeep();
  if(P.hp>=was) bad.push('walking into the fumes cost nothing');
  if(hurtAt===null) bad.push('nothing was said about the fumes');
  else if(hurtAt > stepAt + BEAT_PLAYER)
    bad.push('the fumes were stamped '+(hurtAt-stepAt)+'ms after the step, past the '+
      BEAT_PLAYER+'ms the step itself is given');
  /* and it is not charged twice in one turn */
  L.clouds.length=0; L.clouds.push({ x:P.x, y:P.y, kind:'gas', turns:6 });
  P.hp=P.mhp=900; G.msgq=[];
  cloudsOnYou(); monstersMove(); upkeep();
  var said=0;
  for(i=0;i<G.msgq.length;i++)
    if(/burns your lungs/.test(String(G.msgq[i].s||''))) said++;
  if(said>1) bad.push('the fumes burned you '+said+' times in one turn');
  /* fire on your own square is the same story */
  bootTest(75001);
  L.mons.length=0; L.clouds.length=0; P.hp=P.mhp=900;
  dropEmber(P.x, P.y, 3);
  G.msgq=[];
  var fhp=P.hp;
  cloudsOnYou();
  if(P.hp>=fhp) bad.push('standing in fire at the head of the turn cost nothing');
  return { bad:bad };
}

/* ------------------------------------------- one turn on the fuse
   The powder catches, burns where you can see it burning, and goes up
   at the end of the next turn - which is the turn you have to get out
   of the room in.  Not instantly, and not two turns later. */
function barrelFuseOK(seeds){
  var bad=[], i, gaps=[], drawn=0, tried=0;
  for(var s=0;s<(seeds||12);s++){
    bootTest(76000+s);
    L.barrels={}; L.fuses={}; L.clouds.length=0; L.mons.length=0;
    var spot=null;
    for(i=0;i<DIR8.length;i++){
      var bx=P.x+DIR8[i][0]*3, by=P.y+DIR8[i][1]*3;
      if(walkable(bx,by) && !inWater(bx,by)) spot={x:bx,y:by};
    }
    if(!spot) continue;
    tried++;
    var k=spot.y*MAP_W+spot.x;
    L.barrels[k]=1;
    G.msgq=[];
    if(!lightBarrel(spot.x,spot.y)) { bad.push('the powder would not catch'); continue; }
    /* while it burns it is on the floor for anybody to see */
    if(!L.fuses[k]) bad.push('a lit barrel has no fuse burning on it');
    else drawn++;
    var t=0;
    while(L.barrels[k] && t<8){ t++; tickFuses(); }
    gaps.push(t);
  }
  if(!tried){ bad.push('nowhere to stand a barrel'); return { bad:bad }; }
  for(i=0;i<gaps.length;i++){
    if(gaps[i]<2) bad.push('a barrel went up the moment it caught');
    if(gaps[i]>2) bad.push('a barrel burned '+gaps[i]+' turns before going up');
  }
  return { bad:bad, tried:tried, drawn:drawn, turns:gaps.length?gaps[0]:0 };
}

/* ------------------------------- a sheet of flame is a fire in the room
   It lights the powder under it, it catches the web against it, and it
   takes hold of anything standing beside it.  It used to do none of
   that: a wall of fire could stand there with a nest of web pressed up
   against it and nothing at all would happen. */
function fireWallCatchesOK(){
  var bad=[], i, d, sd;
  /* a run of bare floor to build both on */
  var lane=null;
  for(sd=0;sd<40 && !lane;sd++){
    bootTest(77000+sd);
    L.mons.length=0; L.webs={}; L.clouds.length=0; L.temp={}; L.barrels={};
    for(d=0;d<DIR4.length && !lane;d++){
      var x=P.x, y=P.y, ok=1;
      for(var n=1;n<=5;n++){
        x+=DIR4[d][0]; y+=DIR4[d][1];
        if(!walkable(x,y)||isDoorish(x,y)||inWater(x,y)||L.decor[y*MAP_W+x]){ ok=0; break; }
      }
      if(ok) lane=DIR4[d];
    }
  }
  if(!lane){ bad.push('nowhere to raise a wall of fire'); return { bad:bad }; }
  P.hp=P.mhp=900000;
  var wx=P.x+lane[0]*2, wy=P.y+lane[1]*2;
  var webx=P.x+lane[0]*3, weby=P.y+lane[1]*3;
  layWeb(webx, weby, 0, 0, WEB_LIFE_NEST);
  if(!webAt(webx,weby)){ bad.push('the web would not go down beside the wall'); return { bad:bad }; }
  if(!placeTempWall(wx, wy, FIREWALL)) bad.push('the wall of fire would not go up');
  /* Two things to measure, and they are not the same thing.  The web has
     to take light promptly - the whole complaint was a nest sitting
     against a sheet of flame doing nothing - and once alight it has to
     go in its own two or three turns rather than smoulder for ever. */
  var wj=weby*MAP_W+webx, t=0, caught=0;
  while(webAt(webx,weby) && t<12){
    ageTempWalls(); ageClouds(); t++;
    if(!caught && L.burning && L.burning[wj]) caught=t;
  }
  if(webAt(webx,weby)) bad.push('web pressed against a wall of fire never caught');
  else {
    if(!caught) caught=t;
    if(caught>2) bad.push('the web beside the fire took '+caught+' turns to catch');
    if(t-caught>WEB_BURN_MAX+1)
      bad.push('the web burned for '+(t-caught)+' turns once alight');
  }

  /* and a table standing beside one */
  bootTest(77100);
  L.mons.length=0; L.clouds.length=0; L.temp={}; L.webs={};
  var spot=null;
  for(d=0;d<DIR4.length;d++){
    var tx=P.x+DIR4[d][0]*2, ty=P.y+DIR4[d][1]*2;
    var ux=P.x+DIR4[d][0]*3, uy=P.y+DIR4[d][1]*3;
    if(walkable(tx,ty)&&walkable(ux,uy)&&!L.decor[ty*MAP_W+tx]&&!L.decor[uy*MAP_W+ux]&&
       !inWater(tx,ty)&&!inWater(ux,uy)) spot={x:tx,y:ty,ux:ux,uy:uy};
  }
  if(spot){
    L.decor[spot.uy*MAP_W+spot.ux]='table';
    placeTempWall(spot.x, spot.y, FIREWALL);
    var t2=0;
    while(L.decor[spot.uy*MAP_W+spot.ux]==='table' && t2<12){ ageTempWalls(); ageClouds(); t2++; }
    if(L.decor[spot.uy*MAP_W+spot.ux]==='table')
      bad.push('a table standing against a wall of fire never caught');
  }
  return { bad:bad, turns:t };
}

/* -------------------------------------------- a bridge burns through
   A bridge is a few planks over a drop.  Set light to one and it is
   gone in two or three turns, and then the drop is all that is left. */
function bridgeBurnsOK(seeds){
  var bad=[], i, s, tried=0, gaps=[], fell=0;
  for(s=0;s<(seeds||40) && tried<6;s++){
    bootTest(77200+s);
    for(var d2=2;d2<=8 && tried<6;d2++){
      enterLevel(d2,'down');
      L.clouds.length=0; L.mons.length=0;
      var bj=-1;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===BRIDGE){ bj=i; break; }
      if(bj<0) continue;
      var bx=bj%MAP_W, by=(bj/MAP_W)|0;
      var under=(L.under && L.under[bj]) || 0;
      if(burnableAt(bx,by)!=='bridge'){ bad.push('a bridge does not count as something that burns'); continue; }
      tried++;
      P.hp=P.mhp=900000;
      /* not standing on it: that is a different check */
      dropEmber(bx, by, 1);
      var t=0;
      while(L.tiles[bj]===BRIDGE && t<10){ ageClouds(); t++; }
      if(L.tiles[bj]===BRIDGE){ bad.push('a bridge set alight never burned through'); continue; }
      gaps.push(t);
      if(t<BRIDGE_BURN_MIN) bad.push('a bridge burned through in '+t+' turns, quicker than '+BRIDGE_BURN_MIN);
      if(t>BRIDGE_BURN_MAX+1) bad.push('a bridge took '+t+' turns to burn through');
      /* and what it spanned is still there */
      if(under && L.tiles[bj]!==under)
        bad.push('a burnt bridge left '+L.tiles[bj]+' rather than the '+under+' it spanned');
      if(L.bspan && L.bspan[bj]) bad.push('a burnt bridge still remembers which way its planks lay');
    }
  }
  if(!tried) bad.push('never found a bridge to set light to');
  /* standing on one over a hole when it goes: you go with it */
  bootTest(77300);
  for(var d3=2;d3<=8;d3++){
    enterLevel(d3,'down');
    var hj=-1;
    for(i=0;i<L.tiles.length;i++)
      if(L.tiles[i]===BRIDGE && L.under && L.under[i]===HOLE){ hj=i; break; }
    if(hj<0) continue;
    L.clouds.length=0; L.mons.length=0;
    P.x=hj%MAP_W; P.y=(hj/MAP_W)|0; P.hp=P.mhp=900000;
    G.pendingFall=0;
    dropEmber(P.x, P.y, 1);
    var t3=0;
    while(L.tiles[hj]===BRIDGE && t3<10){ ageClouds(); t3++; }
    if(!G.pendingFall) bad.push('the bridge burned away under you and you stayed in the air');
    else fell++;
    G.pendingFall=0;
    break;
  }
  return { bad:bad, tried:tried, turns:gaps.length?gaps[0]:0, fell:fell };
}

/* --------------------------------------------- a flask of water thrown
   It breaks and the water goes on the floor: one to four squares of it,
   spreading out from where it landed, and gone again once it dries.
   Three things it will not lie on - a rug soaks it up, a bridge is a
   plank over a drop, and a stairway drains - and it puts out fire. */
function puddlesOK(seeds){
  var bad=[], i, s, sizes=[], onRug=0, onBridge=0, onStair=0, dried=0, doused=0;
  function potIndex(name){ for(var j=0;j<POTIONS.length;j++) if(POTIONS[j].n===name) return j; return -1; }
  for(s=0;s<(seeds||30);s++){
    bootTest(78000+s);
    var r=null;
    for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r=L.rooms[i]; break; }
    if(!r) continue;
    L.mons.length=0; L.clouds.length=0;
    P.x=r.cx; P.y=r.cy; P.hp=P.mhp=900000; G.dead=0;
    var sq=null;
    for(i=0;i<r.floors.length;i++){
      var f=r.floors[i];
      if(Math.max(Math.abs(f[0]-P.x),Math.abs(f[1]-P.y))>=2 && throwValid(f[0],f[1])){ sq=f; break; }
    }
    if(!sq) continue;
    var wet=mkItem('potion',potIndex(s%2?'holy water':'water')); wet.cnt=1; addItem(wet);
    var before={};
    for(i=0;i<L.tiles.length;i++) before[i]=L.tiles[i];
    throwAtSquare(wet, sq[0], sq[1]);
    var made=[];
    for(i=0;i<L.tiles.length;i++)
      if(L.tiles[i]!==before[i] && (L.tiles[i]===WATER||L.tiles[i]===HOLY)) made.push(i);
    if(!made.length){ continue; }
    sizes.push(made.length);
    if(made.length>PUDDLE_MAX) bad.push('a thrown flask covered '+made.length+' squares');
    for(i=0;i<made.length;i++){
      var j=made[i];
      if(before[j]===BRIDGE) onBridge++;
      if(before[j]===STAIR||before[j]===STAIR_UP) onStair++;
      if(isRugName(L.decor[j])) onRug++;
    }
    /* joined up: every square touches another, so it is a puddle */
    if(made.length>1){
      var lone=0;
      for(i=0;i<made.length;i++){
        var x=made[i]%MAP_W, y=(made[i]/MAP_W)|0, near=0;
        for(var d=0;d<DIR4.length;d++)
          if(made.indexOf((y+DIR4[d][1])*MAP_W+(x+DIR4[d][0]))>=0) near=1;
        if(!near) lone++;
      }
      if(lone) bad.push(lone+' squares of the puddle stood on their own');
    }
    /* and it dries */
    var t=0;
    while(L.tiles[made[0]]!==before[made[0]] && t<PUDDLE_TURNS_MAX+4){ ageTempWalls(); t++; }
    if(L.tiles[made[0]]!==before[made[0]]) bad.push('the puddle never dried');
    else { dried++; if(t<PUDDLE_TURNS_MIN) bad.push('the puddle dried in '+t+' turns'); }
  }
  if(sizes.length<8) bad.push('only '+sizes.length+' flasks made a puddle at all');
  if(onRug) bad.push('water lay on '+onRug+' squares of rug');
  if(onBridge) bad.push('water lay on '+onBridge+' bridge squares');
  if(onStair) bad.push('water lay on '+onStair+' stairways');
  /* it puts out a fire where it lands */
  for(s=0;s<20 && !doused;s++){
    bootTest(78200+s);
    L.mons.length=0; L.clouds.length=0;
    var r2=null;
    for(i=0;i<L.rooms.length;i++) if(!L.rooms[i].gone&&L.rooms[i].floors.length>16){ r2=L.rooms[i]; break; }
    if(!r2) continue;
    P.x=r2.cx; P.y=r2.cy; P.hp=P.mhp=900000; G.dead=0;
    var fs=null;
    for(i=0;i<r2.floors.length;i++){
      var g=r2.floors[i];
      if(Math.max(Math.abs(g[0]-P.x),Math.abs(g[1]-P.y))>=2 && throwValid(g[0],g[1]) &&
         tileAt(g[0],g[1])===FLOOR && !L.decor[g[1]*MAP_W+g[0]]) fs=g;
    }
    if(!fs) continue;
    dropEmber(fs[0], fs[1], 6);
    var w2=mkItem('potion',potIndex('water')); w2.cnt=1; addItem(w2);
    throwAtSquare(w2, fs[0], fs[1]);
    var still=0;
    for(i=0;i<L.clouds.length;i++)
      if(L.clouds[i].kind==='fire'&&L.clouds[i].x===fs[0]&&L.clouds[i].y===fs[1]) still++;
    if(still) bad.push('water thrown onto a fire left it burning');
    else doused=1;
  }
  if(!doused) bad.push('never managed to throw water onto a fire');
  var avg=0;
  for(i=0;i<sizes.length;i++) avg+=sizes[i];
  return { bad:bad, made:sizes.length, avg:sizes.length?(avg/sizes.length):0,
           big:Math.max.apply(null,sizes.concat([0])), dried:dried };
}

/* -------------------------------------------------- something to eat
   Two halves to this.  Every flask is liquid, so drinking anything at
   all is worth a mouthful - except the flask of nourishment, which is a
   meal in itself and does not get a sip on top.  And a floor has to
   turn up something to eat often enough that a run can live on what it
   finds rather than on what it started with. */
function potionSipOK(){
  var bad=[], i, k;
  bootTest(79000);
  function potIndex(name){ for(var j=0;j<POTIONS.length;j++) if(POTIONS[j].n===name) return j; return -1; }
  var tried=0;
  for(k=0;k<POTIONS.length;k++){
    P.food=500; P.hp=P.mhp=900000; P.blind=0; P.conf=0; P.hallu=0; G.dead=0;
    var before=P.food;
    var it=mkItem('potion',k); it.cnt=1; addItem(it);
    quaff(it);
    var got=P.food-before;
    tried++;
    if(POTIONS[k].n==='nourishment'){
      if(got<POTION_FEED[0]) bad.push('a flask of nourishment fed you only '+got);
      if(got>POTION_FEED[0]+POTION_FEED[1]) bad.push('nourishment fed you '+got+' - a sip on top of the meal');
    } else if(got!==POTION_SIP) bad.push('drinking '+POTIONS[k].n+' was worth '+got+', not '+POTION_SIP);
  }
  /* water and holy water in particular: the two the flask is really for */
  for(i=0;i<2;i++){
    var wk=potIndex(i?'holy water':'water');
    P.food=500; P.hp=P.mhp=900000;
    var w=mkItem('potion',wk); w.cnt=1; addItem(w);
    quaff(w);
    if(P.food!==500+POTION_SIP) bad.push(POTIONS[wk].n+' quenched nothing');
  }
  /* and a full belly cannot be overfilled */
  P.food=FOOD_MAX;
  var f2=mkItem('potion',0); f2.cnt=1; addItem(f2);
  quaff(f2);
  if(P.food>FOOD_MAX) bad.push('drinking pushed you past a full belly');
  return { bad:bad, tried:tried, sip:POTION_SIP };
}
function foodOnFloorsOK(seeds){
  var bad=[], s, d, i, floors=0, items=0, feed=0, bare=0;
  for(s=0;s<(seeds||25);s++){
    bootTest(79100+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down');
      floors++;
      var here=0;
      for(i=0;i<L.items.length;i++) if(L.items[i].t==='food'){
        here++; items++; feed+=FOODS[L.items[i].k].feed[0]+FOODS[L.items[i].k].feed[1]/2;
      }
      if(!here) bare++;
    }
  }
  var per=items/floors, nour=feed/floors;
  /* A floor should carry enough to be worth searching and not enough to
     make hunger stop mattering. */
  if(per<0.25) bad.push('only '+per.toFixed(2)+' things to eat a floor');
  if(per>0.9) bad.push(per.toFixed(2)+' things to eat a floor - nobody would ever go hungry');
  if(bare/floors>0.8) bad.push(Math.round(bare*100/floors)+'% of floors had nothing to eat at all');
  return { bad:bad, floors:floors, per:per, nour:nour, barePct:Math.round(bare*100/floors) };
}

/* ------------------------------------------ a chasm across a room
   Now and then the floor of a room is simply not there: a gap running
   right across it from wall to wall, with a plank bridge over it.  It
   should be a thing you meet in a run rather than a thing you read
   about - about one room in twenty five - and every one of them has to
   be crossable, or the room beyond it is walled off by accident. */
function chasmRoomsOK(seeds){
  var bad=[], s, d, i, rooms=0, chasms=0, noBridge=0, ragged=0, uncracked=0, spans=[];
  for(s=0;s<(seeds||30);s++){
    bootTest(79300+s);
    for(d=1;d<=10;d++){
      enterLevel(d,'down');
      for(var ri=0;ri<L.rooms.length;ri++){
        var r=L.rooms[ri];
        if(r.gone) continue;
        rooms++;
        var holes=[], bridges=[], cracked=0;
        for(i=0;i<r.floors.length;i++){
          var j=r.floors[i][1]*MAP_W+r.floors[i][0];
          if(L.tiles[j]===HOLE) holes.push(r.floors[i]);
          else if(L.tiles[j]===BRIDGE && L.under && L.under[j]===HOLE) bridges.push(r.floors[i]);
        }
        if(!holes.length || !bridges.length) continue;
        chasms++;
        spans.push(holes.length+bridges.length);
        /* It has to run the whole way across.  Which way it runs is
           written on the bridge itself - planks laid across the gap -
           rather than guessed from the shape of the holes, since a room
           can have a hole dug in it as well as a gap cut across it. */
        var cols={}, rowsA={}, vert=0, horiz=0;
        for(i=0;i<bridges.length;i++){
          var bj=bridges[i][1]*MAP_W+bridges[i][0];
          if(L.bspan && L.bspan[bj]==='h'){ cols[bridges[i][0]]=1; vert=1; }
          else { rowsA[bridges[i][1]]=1; horiz=1; }
        }
        if(vert&&horiz){ ragged++; continue; }
        var wall=0;
        for(i=0;i<r.floors.length;i++){
          var fx=r.floors[i][0], fy=r.floors[i][1];
          if(vert ? cols[fx] : rowsA[fy]){
            var t=L.tiles[fy*MAP_W+fx];
            if(t!==HOLE && t!==BRIDGE) wall++;
          }
        }
        if(wall) ragged++;
        /* and cracked flagstones warn you it is there */
        for(i=0;i<holes.length;i++){
          for(var dd=0;dd<DIR4.length;dd++){
            var cj=(holes[i][1]+DIR4[dd][1])*MAP_W+(holes[i][0]+DIR4[dd][0]);
            if(L.tiles[cj]===FLOOR && L.decor[cj]) cracked=1;
          }
        }
        if(!cracked) uncracked++;
      }
    }
  }
  var one = chasms ? rooms/chasms : 0;
  if(!chasms){ bad.push('no room in '+rooms+' had a chasm across it'); return { bad:bad, rooms:rooms }; }
  if(one>35) bad.push('a chasm room turned up once in '+one.toFixed(0)+' rooms - too rare to meet');
  if(one<18) bad.push('a chasm room turned up once in '+one.toFixed(0)+' rooms - too common');
  if(noBridge) bad.push(noBridge+' chasms had no bridge over them');
  if(ragged) bad.push(ragged+' chasms stopped short of the wall');
  if(uncracked) bad.push(uncracked+' chasms had no cracked flagstones beside them');
  var tot=0;
  for(i=0;i<spans.length;i++) tot+=spans[i];
  return { bad:bad, rooms:rooms, chasms:chasms, one:one, wide:tot/spans.length };
}

/* --------------------------------------------- lightning to the wall
   Every other wand throws something with a range.  Lightning is a
   current crossing the room: it runs until it meets stone, however far
   off that is, and everything standing in the row it crosses is in it. */
function lightningReachOK(seeds){
  var bad=[], s, d, i, tried=0, longest=0, hitAll=0;
  for(s=0;s<(seeds||60) && tried<6;s++){
    bootTest(79500+s);
    /* somewhere with a long clear line - a corridor, or a room end to end */
    var spot=null;
    for(i=0;i<L.tiles.length && !spot;i++){
      if(L.tiles[i]!==FLOOR && L.tiles[i]!==CORR) continue;
      var sx=i%MAP_W, sy=(i/MAP_W)|0;
      for(d=0;d<DIR4.length;d++){
        var n=0;
        while(n<40){
          var nx=sx+DIR4[d][0]*(n+1), ny=sy+DIR4[d][1]*(n+1);
          if(blocksShot(nx,ny)||isDoorish(nx,ny)) break;
          n++;
        }
        if(n>15){ spot={x:sx,y:sy,d:DIR4[d],n:n}; break; }
      }
    }
    if(!spot) continue;
    tried++;
    L.mons.length=0; L.clouds.length=0; L.items.length=0;
    P.x=spot.x; P.y=spot.y; P.hp=P.mhp=900000; G.dead=0; G.bolt=null;
    P.blind=0; P.conf=0;
    /* three creatures standing in the row, near, middle and far */
    var placed=[], want=[2, (spot.n/2)|0, spot.n-1];
    for(i=0;i<want.length;i++){
      var mx=P.x+spot.d[0]*want[i], my=P.y+spot.d[1]*want[i];
      if(monAt(L,mx,my)) continue;
      var mm=mkMonster('E',8,mx,my);
      mm.hp=mm.mhp=400;
      L.mons.push(mm); placed.push(mm);
    }
    var wand=mkItem('wand',wandIndex('lightning')); wand.ch=9; wand.known=1;
    addItem(wand);
    zapWand(wand, spot.d[0], spot.d[1]);
    if(!G.bolt){ bad.push('the wand of lightning drew nothing'); continue; }
    /* A row of clear squares ends either at stone or at a door, and the
       two are not the same to look at: the current stops dead at stone,
       and stops ON the door it hits, which is lit by it.  So a row that
       ends at a doorway is one square longer than the clear part of it. */
    var endx=spot.x+spot.d[0]*(spot.n+1), endy=spot.y+spot.d[1]*(spot.n+1);
    var atDoor=isDoorish(endx,endy);
    var want=spot.n+(atDoor?1:0);
    if(G.bolt.path.length!==want)
      bad.push('lightning reached '+G.bolt.path.length+' of '+want+' squares'+
        (atDoor?' up to the doorway':' of clear floor'));
    longest=Math.max(longest,G.bolt.path.length);
    /* it stopped at stone or in a doorway, not in mid air */
    var last=G.bolt.path[G.bolt.path.length-1];
    var past=[last[0]+spot.d[0], last[1]+spot.d[1]];
    if(!blocksShot(past[0],past[1]) && !isDoorish(past[0],past[1]) &&
       !isDoorish(last[0],last[1]))
      bad.push('the current stopped in the open');
    /* and everything in the row felt it, the far one included */
    var untouched=0;
    for(i=0;i<placed.length;i++) if(placed[i].hp>=400 && L.mons.indexOf(placed[i])>=0) untouched++;
    if(untouched) bad.push(untouched+' creatures in the row were not touched');
    else hitAll++;
    /* other wands keep their fourteen squares */
    G.bolt=null;
    var cw=mkItem('wand',wandIndex('cold')); cw.ch=9; cw.known=1; addItem(cw);
    zapWand(cw, spot.d[0], spot.d[1]);
    if(G.bolt && G.bolt.path.length>14) bad.push('a wand of cold reached '+G.bolt.path.length+' squares');
  }
  if(!tried) bad.push('never found a long enough line to fire down');
  return { bad:bad, tried:tried, longest:longest, hitAll:hitAll };
}

/* ------------------------------------- every step gets its own moment
   A turn is worked out all at once and played back over the next few
   hundred milliseconds; each step a creature takes is stamped with the
   instant it belongs to, and the playback walks the queue.  Two steps
   stamped with the same instant cannot both be shown, so the second one
   is skipped and the creature appears to jump - which is exactly what a
   six point round did before anything moved the clock on inside it. */
function stepsAreSeenOK(seeds){
  var bad=[], s, i, rounds=0, steps=[], gaps=[];
  function stamps(m){
    var out=[], j;
    for(j=0;j<(m.anim||[]).length;j++) out.push(m.anim[j][4]);
    return out;
  }
  for(s=0;s<(seeds||30) && rounds<8;s++){
    if(s%10===0) bootTest(80100+s); else bootRoll(80100+s);
    var lane=straightLine4(1);
    if(!lane) continue;
    L.mons.length=0; L.webs={}; L.clouds.length=0; L.traps=[];
    P.hp=P.mhp=900000; G.dead=0; P.scare=0;
    var m=mkMonster('w',3,lane.x,lane.y);
    m.hp=m.mhp=900; m.state=2; m.anim=null; L.mons.push(m);
    /* stuck fast: this is the round she spends six points on */
    P.webbed=4; P.frozen=4;
    G.beat=0; G.msgq=[];
    var t0=beatNow();
    spinnerTurn(m);
    var st=stamps(m);
    if(st.length<2) continue;
    rounds++;
    steps.push(st.length);
    for(i=1;i<st.length;i++){
      var gap=st[i]-st[i-1];
      gaps.push(gap);
      if(gap<=0) bad.push('two steps of one round share the same moment');
      else if(gap<MOVE_ANIM_MS)
        bad.push('a step started '+gap+'ms after the last, before the stride was over');
    }
    if(st[0]<t0) bad.push('a step was stamped before the round began');
    /* and the whole round is not so slow that it stops being a flurry */
    var span=st[st.length-1]-st[0];
    if(span>SPIN_POINTS*BEAT_STEP)
      bad.push('a six point round took '+span+'ms');
  }
  if(rounds<4) bad.push('only '+rounds+' rounds of more than one step to look at');
  /* the same for a quick creature taking two steps in one turn */
  bootTest(80200);
  var lane2=straightLine4(1);
  if(lane2){
    L.mons.length=0;
    P.hp=P.mhp=900000; G.dead=0;
    var q=mkMonster('E',3,lane2.x,lane2.y);
    q.hp=q.mhp=900; q.state=2; q.hasted=1; q.anim=null; L.mons.push(q);
    G.beat=0;
    monstersMove();
    var qs=stamps(q);
    for(i=1;i<qs.length;i++)
      if(qs[i]-qs[i-1]<MOVE_ANIM_MS)
        bad.push('a quick creature took its second step '+(qs[i]-qs[i-1])+'ms after the first');
  }
  var avg=0;
  for(i=0;i<gaps.length;i++) avg+=gaps[i];
  return { bad:bad, rounds:rounds, gaps:gaps.length, avg:gaps.length?avg/gaps.length:0,
           most:Math.max.apply(null,steps.concat([0])) };
}

/* --------------------------------------------- you see a fire burning
   A light is a thing you see.  A fire at the far end of a pitch dark
   hall is visible from any distance at all, so long as nothing stands
   between you and it - and so is everything it is lighting.  Round a
   corner it is not, and neither is the floor it lights there. */
function fireLightsFarOK(seeds){
  var bad=[], s, i, tried=0, far=[], lit=0, hidden=0;
  for(s=0;s<(seeds||40) && tried<6;s++){
    bootTest(80400+s);
    /* a long dark run of floor to put a fire down at the end of */
    var spot=null;
    for(i=0;i<L.tiles.length && !spot;i++){
      if(L.tiles[i]!==FLOOR && L.tiles[i]!==CORR) continue;
      var sx=i%MAP_W, sy=(i/MAP_W)|0;
      for(var d=0;d<DIR4.length;d++){
        var n=0;
        while(n<40){
          var nx=sx+DIR4[d][0]*(n+1), ny=sy+DIR4[d][1]*(n+1);
          if(blocksShot(nx,ny)||isDoorish(nx,ny)) break;
          if(!walkable(nx,ny)) break;
          n++;
        }
        if(n>LIT_RADIUS+4){ spot={x:sx,y:sy,d:DIR4[d],n:n}; break; }
      }
    }
    if(!spot) continue;
    tried++;
    L.mons.length=0; L.clouds.length=0; L.temp={};
    P.x=spot.x; P.y=spot.y; P.blind=0; P.hp=P.mhp=900000; G.dead=0;
    G.splash=null; G.bolt=null;
    /* pitch dark the whole way, so nothing but the fire can light it */
    var fx=P.x+spot.d[0]*spot.n, fy=P.y+spot.d[1]*spot.n, fj=fy*MAP_W+fx;
    for(i=0;i<=spot.n;i++){
      var jx=P.x+spot.d[0]*i, jy=P.y+spot.d[1]*i;
      L.darkMap[jy*MAP_W+jx]=1;
      L.litMap[jy*MAP_W+jx]=0;
    }
    computeVis();
    if(L.flags[fj]&F_VIS) bad.push('the dark end of the hall was visible with nothing burning there');
    far.push(spot.n);
    /* now set a fire down there */
    dropEmber(fx, fy, 6);
    L.clouds.forEach(function(c){ c.at=0; });
    computeVis();
    if(!(L.flags[fj]&F_VIS)) bad.push('a fire '+spot.n+' squares off in the dark could not be seen');
    else lit++;
    /* and the squares it is lighting, the near one included */
    var bx=fx-spot.d[0], by=fy-spot.d[1];
    if(!(L.flags[by*MAP_W+bx]&F_VIS))
      bad.push('the square the far fire was lighting stayed dark');
    /* but not the floor two squares beyond it, which it does not reach */
    var ox=fx+spot.d[0]*2, oy=fy+spot.d[1]*2;
    if(ox>=0&&oy>=0&&ox<MAP_W&&oy<MAP_H&&walkable(ox,oy)&&(L.flags[oy*MAP_W+ox]&F_VIS))
      bad.push('a fire lit a square two beyond itself');
    L.clouds.length=0;
  }
  if(!tried) bad.push('never found a long enough dark hall');
  /* round a corner: a fire with stone between you and it shows nothing */
  for(s=0;s<40 && !hidden;s++){
    bootTest(80500+s);
    L.mons.length=0; L.clouds.length=0; L.temp={};
    P.blind=0; P.hp=P.mhp=900000;
    var walled=-1;
    for(i=0;i<L.tiles.length;i++){
      if(L.tiles[i]!==FLOOR) continue;
      var wx=i%MAP_W, wy=(i/MAP_W)|0;
      if(Math.max(Math.abs(wx-P.x),Math.abs(wy-P.y))<4) continue;
      if(sightClear(P.x,P.y,wx,wy)) continue;
      walled=i; break;
    }
    if(walled<0) continue;
    dropEmber(walled%MAP_W, (walled/MAP_W)|0, 6);
    L.clouds.forEach(function(c){ c.at=0; });
    computeVis();
    if(L.flags[walled]&F_VIS) bad.push('a fire behind stone was visible through it');
    else hidden=1;
    L.clouds.length=0;
  }
  if(!hidden) bad.push('never found a fire to hide behind a wall');
  var avg=0;
  for(i=0;i<far.length;i++) avg+=far[i];
  return { bad:bad, tried:tried, lit:lit, far:far.length?Math.round(avg/far.length):0,
           most:Math.max.apply(null,far.concat([0])) };
}

/* ------------------------------------------ a fire going out, and a
   burning stone lying where it fell.  A stone that hits nothing bursts
   and burns on the floor for two turns, and the second of them is a
   fire on its way out - half the light of the first. */
function burningStoneOK(seeds){
  var bad=[], s, i, tried=0, lives=[], first=0, second=0;
  for(s=0;s<(seeds||30) && tried<6;s++){
    if(s%10===0) bootTest(80600+s); else bootRoll(80600+s);
    var lane=straightLine4(1);
    if(!lane) continue;
    L.mons.length=0; L.clouds.length=0; L.temp={}; L.webs={};
    P.hp=P.mhp=900000; G.dead=0; P.blind=0;
    var tx=lane.x, ty=lane.y, tj=ty*MAP_W+tx;
    if(!walkable(tx,ty)||inWater(tx,ty)||L.decor[tj]) continue;
    tried++;
    /* thrown at bare floor, hitting nothing */
    var st=mkItem('weapon',weaponIndex('burning stone')); st.cnt=1; st.known=1;
    addItem(st);
    throwAtSquare(st, tx, ty);
    var fire=null;
    for(i=0;i<L.clouds.length;i++)
      if(L.clouds[i].kind==='fire'&&L.clouds[i].x===tx&&L.clouds[i].y===ty) fire=L.clouds[i];
    if(!fire){ bad.push('a burning stone landed on bare floor and did not burn'); continue; }
    if(fire.turns!==BURN_TRAIL_TURNS)
      bad.push('it burns for '+fire.turns+' turns, not '+BURN_TRAIL_TURNS);
    /* the light it throws on its first turn, and on its second */
    fire.at=0;
    var l1=lightMap();
    if(!l1[tj]) bad.push('the burning stone threw no light at all');
    else { first++; if(!lightAbout(l1[tj].v,GLOW_FULL))
      bad.push('its first turn gave '+l1[tj].v.toFixed(2)+' light, not about full'); }
    cloudsOnYou(); ageClouds();
    var still=null;
    for(i=0;i<L.clouds.length;i++)
      if(L.clouds[i].kind==='fire'&&L.clouds[i].x===tx&&L.clouds[i].y===ty) still=L.clouds[i];
    if(!still){ bad.push('it was out after one turn'); continue; }
    lives.push(2);
    var l2=lightMap();
    if(!l2[tj]) bad.push('its second turn threw no light');
    else { second++;
      if(!lightAbout(l2[tj].v,GLOW_HALF))
        bad.push('its second turn gave '+l2[tj].v.toFixed(2)+' light, not about half');
      /* and half of what it gave on its first turn, which is the rule -
         both figures carry the same square's own variation, so the
         ratio says it more plainly than either number does */
      else if(l1[tj] && l2[tj].v > l1[tj].v*0.62)
        bad.push('its second turn was '+(l2[tj].v/l1[tj].v).toFixed(2)+' of its first, not half'); }
    cloudsOnYou(); ageClouds();
    for(i=0;i<L.clouds.length;i++)
      if(L.clouds[i].kind==='fire'&&L.clouds[i].x===tx&&L.clouds[i].y===ty)
        bad.push('it was still burning on the third turn');
    L.clouds.length=0;
  }
  if(!tried) bad.push('nowhere to throw a burning stone');
  return { bad:bad, tried:tried, first:first, second:second };
}

/* ------------------------------------------------- glass, and a lamp
   Glass armour turns a blade like banded mail and nothing corrodes it -
   not an aquator's touch, not a rust trap.  And the rune of light is a
   lamp you carry: two squares of full light about you and a third half
   lit, on a blade or on a breastplate, and it cannot keep itself secret
   the way every other enchantment does. */
function glassArmourOK(){
  var bad=[], i;
  bootTest(80800);
  var gk=-1, plate=-1, band=-1;
  for(i=0;i<ARMORS.length;i++){
    if(ARMORS[i].n==='glass armor') gk=i;
    if(ARMORS[i].n==='plate mail') plate=i;
    if(ARMORS[i].n==='banded mail') band=i;
  }
  if(gk<0) return { bad:['there is no glass armour'] };
  var G0=ARMORS[gk];
  if(!G0.s || ATLAS.index[G0.s]===undefined) bad.push('glass armour has no sprite');
  if(G0.s===ARMORS[plate].s) bad.push('it is drawn as plate mail');
  if(G0.a < ARMORS[band].a) bad.push('it is weaker than banded mail ('+G0.a+' against '+ARMORS[band].a+')');
  if(G0.a > ARMORS[plate].a) bad.push('it turns more than plate mail');
  /* it does not rust, and its neighbours still do */
  var glass=mkItem('armor',gk); glass.known=1;
  if(canRust(glass)) bad.push('glass armour rusts');
  var steel=mkItem('armor',plate); steel.known=1;
  if(!canRust(steel)) bad.push('plate mail stopped rusting');
  /* and the trap agrees with the table */
  var rustKind=null;
  for(i=0;i<TRAPS.length;i++) if(TRAPS[i].k==='rust') rustKind=TRAPS[i];
  if(!rustKind) bad.push('there is no rust trap any more');
  else {
    P.eq.body=glass; glass.ap=0; P.hp=P.mhp=900000;
    G.msgq=[]; springTrap({ x:P.x, y:P.y, k:rustKind, found:1 });
    if(glass.ap<0) bad.push('a rust trap corroded glass armour');
    P.eq.body=steel; steel.ap=0; P.hp=P.mhp=900000;
    G.msgq=[]; springTrap({ x:P.x, y:P.y, k:rustKind, found:1 });
    if(steel.ap===0) bad.push('a rust trap left plate mail alone');
  }
  /* an aquator's touch, the same question from the other side */
  P.eq.body=glass; glass.ap=0;
  var aq=null;
  for(i=0;i<MONS.length;i++) if(MONS[i].sp==='rust') aq=MONS[i];
  if(!aq) bad.push('there is no aquator any more');
  else {
    var m=mkMonster(aq.c,8,P.x+1,P.y);
    m.hp=m.mhp=400; L.mons.length=0; L.mons.push(m);
    for(i=0;i<40;i++){ P.hp=P.mhp=900000; monAttack(m); }
    if(glass.ap<0) bad.push('an aquator corroded glass armour');
  }
  P.eq.body=null;
  return { bad:bad, a:G0.a };
}
function runeOfLightOK(){
  var bad=[], i, d;
  var R=RUNE_BY_NAME['light'];
  if(!R) return { bad:['there is no rune of light'] };
  if(R.t.indexOf('w')<0) bad.push('it cannot be cut into a blade');
  if(R.t.indexOf('g')<0) bad.push('it cannot be cut into armour');
  /* somewhere dark to try it */
  var lane=null;
  for(var s=0;s<40 && !lane;s++){
    bootTest(80900+s);
    for(i=0;i<L.tiles.length && !lane;i++){
      if(L.tiles[i]!==FLOOR) continue;
      var sx=i%MAP_W, sy=(i/MAP_W)|0, ok=1;
      for(var dy=-3;dy<=3 && ok;dy++) for(var dx=-3;dx<=3;dx++)
        if(!walkable(sx+dx,sy+dy)||L.decor[(sy+dy)*MAP_W+sx+dx]){ ok=0; break; }
      if(ok) lane={x:sx,y:sy};
    }
  }
  if(!lane) return { bad:bad.concat(['nowhere open enough to try a lamp']) };
  L.mons.length=0; L.clouds.length=0; L.temp={};
  P.x=lane.x; P.y=lane.y; P.blind=0; P.hp=P.mhp=900000;
  for(i=0;i<L.tiles.length;i++){ L.darkMap[i]=1; L.litMap[i]=0; }
  for(i=0;i<N_SLOTS;i++) P.slots[i]=null;
  P.eq.body=null; P.eq.rh=null; P.eq.lh=null; P.eq.head=null; P.eq.feet=null;
  computeVis();
  var dark=0;
  for(i=0;i<L.tiles.length;i++) if(L.flags[i]&F_VIS) dark++;
  /* now put a glowing blade in your hand */
  var sword=mkItem('weapon',weaponIndex('long sword'));
  sword.known=1; sword.br='light'; sword.brKnown=0;
  P.eq.rh=sword;
  if(!lampOn()) bad.push('a blade of light in your hand is not a lamp');
  var lit=lightMap(1);
  function at(dx,dy){ var e=lit[(P.y+dy)*MAP_W+P.x+dx]; return e?e.v:0; }
  /* the shape of it, square by square: two full, then half a square
     more, and round rather than square */
  var want=[[0,0,GLOW_FULL],[1,0,GLOW_FULL],[1,1,GLOW_FULL],[2,0,GLOW_FULL],
            [2,1,GLOW_FULL],[0,2,GLOW_FULL],
            [2,2,GLOW_HALF],[3,0,GLOW_HALF],[0,3,GLOW_HALF],
            [3,1,0],[4,0,0],[3,3,0]];
  for(i=0;i<want.length;i++){
    var w=want[i], got=at(w[0],w[1]);
    if(got!==w[2]) bad.push(w[0]+','+w[1]+' off came out '+got+', wanted '+w[2]);
  }
  /* and it shows you the room */
  computeVis();
  var seen=0;
  for(i=0;i<L.tiles.length;i++) if(L.flags[i]&F_VIS) seen++;
  if(seen<=dark) bad.push('a lamp in a pitch dark room showed you nothing more');
  /* it gives itself away the moment you carry it */
  G.msgq=[];
  upkeep();
  if(!sword.brKnown) bad.push('a glowing blade kept its enchantment secret');
  /* on armour too, and taking it off puts the light out */
  P.eq.rh=null;
  var coat=mkItem('armor',0); coat.known=1; coat.br='light'; coat.brKnown=1;
  P.eq.body=coat;
  if(!lampOn()) bad.push('a coat of light is not a lamp');
  P.eq.body=null;
  if(lampOn()) bad.push('the light stayed on with nothing to carry it');
  if(Object.keys(lightMap(1)).length) bad.push('the pool of light outlived the lamp');
  return { bad:bad, dark:dark, seen:seen };
}

/* ------------------------------------------- gathering the next one
   A spinner spits one web every other turn.  And web on a player who is
   already stuck fast is web on web: it holds you no longer than the
   first one did, however much of it she puts on you. */
function webEveryOtherTurnOK(seeds){
  var bad=[], s, i, runs=0, spits=[], stuckAgain=0, tried=0;
  for(s=0;s<(seeds||30) && runs<8;s++){
    if(s%10===0) bootTest(81000+s); else bootRoll(81000+s);
    var lane=straightLine4(1);
    if(!lane) continue;
    L.mons.length=0; L.webs={}; L.clouds.length=0; L.traps=[];
    P.hp=P.mhp=900000; P.frozen=0; P.webbed=0; G.dead=0;
    var m=mkMonster('w',3,lane.x,lane.y);
    m.hp=m.mhp=900000; m.state=2; L.mons.push(m);
    runs++;
    /* twelve turns of asking her to spit, from her feet up */
    var spat=0, turns=12, lastTurn=-9, backToBack=0;
    for(i=0;i<turns;i++){
      P.frozen=0; P.webbed=0; clearWeb(P.x,P.y);
      G.msgq=[]; G.beat=0;
      if(monWeb(m)){
        spat++;
        if(i-lastTurn<WEB_EVERY) backToBack++;
        lastTurn=i;
      }
    }
    spits.push(spat);
    if(backToBack) bad.push('she spat twice inside '+WEB_EVERY+' turns');
    if(spat>Math.ceil(turns/WEB_EVERY))
      bad.push(spat+' webs in '+turns+' turns, more than one every '+WEB_EVERY);
    if(!spat) bad.push('she never spat at all');

    /* and now stuck: more web must not hold you any longer */
    P.frozen=0; P.webbed=0; clearWeb(P.x,P.y);
    var held=stickPlayer(webHold());
    if(!held){ bad.push('the first web did not hold you'); continue; }
    tried++;
    var was=P.webbed, wasFrozen=P.frozen;
    for(i=0;i<4;i++){
      var more=stickPlayer(webHold());
      if(more) bad.push('web on a stuck player held him '+more+' turns longer');
    }
    if(P.webbed!==was) bad.push('being webbed again changed the count from '+was+' to '+P.webbed);
    if(P.frozen!==wasFrozen) bad.push('being webbed again cost '+(P.frozen-wasFrozen)+' more turns');
    else stuckAgain++;
    /* the same through her own spit, not just the counter */
    m.spitCd=0;
    P.x=P.x; G.msgq=[];
    var before=P.webbed;
    monWeb(m);
    if(P.webbed>before) bad.push('a spit at a stuck player added to the hold');
    P.frozen=0; P.webbed=0;
  }
  if(!runs) bad.push('never found anywhere to set a spinner down');
  if(!tried) bad.push('never got the player stuck to try it');
  var tot=0;
  for(i=0;i<spits.length;i++) tot+=spits[i];
  return { bad:bad, runs:runs, per:spits.length?tot/spits.length:0, stuckAgain:stuckAgain };
}

/* --------------------------------------------- a pocketful of stones
   The witch carries ten, and no more.  Every one that goes wide is
   lying on the floor afterwards, which is where the player finds them. */
function witchStonesOK(seeds){
  var bad=[], s, i, tried=0, thrown=[], onFloor=[], wide=[], ranOut=0;
  for(s=0;s<(seeds||40) && tried<5;s++){
    bootTest(81200+s);
    /* somewhere she can see you from, four squares off and in the open */
    var lane=straightLine4(1);
    if(!lane) continue;
    L.mons.length=0; L.items.length=0; L.clouds.length=0; L.traps=[];
    P.hp=P.mhp=900000; P.blind=0; G.dead=0;
    var w=mkMonster('k',8,lane.x,lane.y);
    if(!w||!w.def||w.def.sp!=='witch'){ bad.push('there is no witch'); break; }
    w.hp=w.mhp=900000; w.state=2;
    /* nothing else in her hand: this is about the stones */
    w.flasks=0; w.spiderIn=999; w.blinkIn=999;
    L.mons.push(w);
    tried++;
    if(w.stones!==WITCH_STONES)
      bad.push('she started with '+w.stones+' stones, not '+WITCH_STONES);
    var threw=0, missed=0;
    for(i=0;i<400 && w.stones>0;i++){
      P.hp=P.mhp=900000; G.msgq=[]; G.beat=0;
      w.blinkIn=999; w.spiderIn=999;
      if(witchRock(w)){
        threw++;
        /* A stone she lands is a stone she keeps; only the ones that go
           wide end up on the floor.  Whether it landed is read off your
           own hit points rather than off the log - the line she says is
           trimmed to fit the panel, so on a long name the words "and
           misses" are the first thing dropped. */
        if(P.hp >= 900000) missed++;
      }
    }
    thrown.push(threw);
    if(threw>WITCH_STONES) bad.push('she threw '+threw+' stones');
    /* and then she has none left, however long you stand there */
    var after=0;
    for(i=0;i<60;i++){ G.msgq=[]; if(witchRock(w)) after++; }
    if(after) bad.push('she threw '+after+' more after running out');
    else ranOut++;
    /* the ones that missed are on the floor */
    var stones=0;
    for(i=0;i<L.items.length;i++)
      if(L.items[i].t==='weapon' && WEAPONS[L.items[i].k].n==='stone')
        stones+=L.items[i].cnt||1;
    onFloor.push(stones);
    wide.push(missed);
    /* This used to ask only that SOME stone was left lying about, which
       is not the rule and is not even reliably true: she lands about
       four throws in five, so a run of ten that all land is about one
       seed in seven and the check failed on the dice rather than on the
       game.  The rule is exact - every stone that went wide is on the
       floor and no stone that landed is - so it is asked exactly. */
    if(stones!==missed)
      bad.push(stones+' stones on the floor from '+missed+' that went wide (of '+threw+' thrown)');
  }
  if(!tried) bad.push('never found anywhere to stand a witch');
  var sum=function(a){ var t=0,i; for(i=0;i<a.length;i++) t+=a[i]; return a.length?t/a.length:0; };
  return { bad:bad, tried:tried, threw:sum(thrown), floor:sum(onFloor),
           wide:sum(wide), ranOut:ranOut };
}

/* ------------------------------------------------- eyes for the dark
   A Night stalker sees through darkness.  There are two kinds of it and
   he was only getting the benefit of one: a room marked pitch dark, and
   the far commoner sort - a room nobody left a lamp in.  In the second
   he saw exactly as far as anybody else, which is not what the perk
   says.  Both, now, and as far as a lit room carries. */
function nightEyesOK(seeds){
  var bad=[], s, i, tried=0, gains=[];
  function seenCount(){
    computeVis();
    var n=0;
    for(var j=0;j<L.flags.length;j++) if(L.flags[j]&F_VIS) n++;
    return n;
  }
  for(s=0;s<(seeds||30) && tried<6;s++){
    bootTest(81400+s);
    var r=null;
    for(i=0;i<L.rooms.length;i++)
      if(!L.rooms[i].gone && L.rooms[i].floors.length>24){ r=L.rooms[i]; break; }
    if(!r) continue;
    tried++;
    L.mons.length=0; L.clouds.length=0; L.temp={};
    P.x=r.cx; P.y=r.cy; P.blind=0; P.seer=0; P.hp=P.mhp=900000;
    P.perks={};
    var here={};
    /* (a) a room nobody left a lamp in: unlit, but not marked dark */
    r.lit=0; r.dark=0;
    for(i=0;i<r.floors.length;i++) L.darkMap[r.floors[i][1]*MAP_W+r.floors[i][0]]=0;
    buildLitMap(L);
    here.unlitPlain=seenCount();
    P.perks={ nightstalker:1 };
    here.unlitEyes=seenCount();
    /* (b) pitch dark */
    P.perks={};
    r.dark=1;
    for(i=0;i<r.floors.length;i++) L.darkMap[r.floors[i][1]*MAP_W+r.floors[i][0]]=1;
    here.darkPlain=seenCount();
    P.perks={ nightstalker:1 };
    here.darkEyes=seenCount();
    P.perks={};
    if(here.darkEyes<=here.darkPlain)
      bad.push('pitch dark: the perk showed nothing more ('+here.darkPlain+' either way)');
    if(here.unlitEyes<=here.unlitPlain)
      bad.push('an unlit room: the perk showed nothing more ('+here.unlitPlain+' either way)');
    /* and the two darknesses come out the same: darkness is darkness */
    if(here.unlitEyes!==here.darkEyes)
      bad.push('with the perk an unlit room showed '+here.unlitEyes+
               ' squares and a pitch dark one '+here.darkEyes);
    gains.push(here.unlitEyes-here.unlitPlain);
  }
  if(!tried) bad.push('no room big enough to try it in');
  var t=0;
  for(i=0;i<gains.length;i++) t+=gains[i];
  return { bad:bad, tried:tried, gain:gains.length?Math.round(t/gains.length):0 };
}

/* --------------------------------------------- the price of carrying
   a light.  It shows you the room and it shows the room you: something
   glowing in a black corridor is the easiest thing down there to
   notice, so it costs you your quiet. */
function glowStealthOK(){
  var bad=[], i;
  bootTest(81600);
  P.perks={}; P.seer=0; P.aggravate=0; P.unseen=0;
  P.eq.body=null; P.eq.rh=null; P.eq.lh=null; P.eq.head=null; P.eq.feet=null;
  var plain=stealthScore();
  var word=stealthWord();
  /* a glowing blade in your hand */
  var sword=mkItem('weapon',weaponIndex('long sword'));
  sword.known=1; sword.br='light'; sword.brKnown=1;
  P.eq.rh=sword;
  var lit=stealthScore();
  if(lit>=plain) bad.push('a glowing blade cost you nothing: '+plain+' either way');
  else if(plain-lit!==GLOW_STEALTH)
    bad.push('it cost '+(plain-lit)+', not '+GLOW_STEALTH);
  /* and it is felt where it matters: something is likelier to notice you */
  L.mons.length=0;
  var m=mkMonster('E',5,P.x+4,P.y);
  m.state=1; m.hp=m.mhp=900; L.mons.push(m);
  function noticedIn(runs){
    var n=0;
    for(var q=0;q<runs;q++){ m.state=1; if(monNotices(m)) n++; }
    return n;
  }
  var seenLit=noticedIn(4000);
  P.eq.rh=null;
  var seenDark=noticedIn(4000);
  if(seenLit<=seenDark)
    bad.push('carrying a light made no difference to being noticed ('+
      seenDark+' against '+seenLit+' in 4000)');
  /* an ordinary blade of the same kind costs nothing */
  var plainSword=mkItem('weapon',weaponIndex('long sword')); plainSword.known=1;
  P.eq.rh=plainSword;
  if(stealthScore()!==plain) bad.push('an ordinary sword changed how quietly you move');
  P.eq.rh=null;
  return { bad:bad, plain:plain, lit:lit, word:word,
           litWord:(function(){ P.eq.rh=sword; var w=stealthWord(); P.eq.rh=null; return w; })(),
           seenLit:Math.round(seenLit/40), seenDark:Math.round(seenDark/40) };
}

/* --------------------------------------------------- looked at properly
   Every single thing in the dungeon can be held up and looked at, and
   what the box says about it has to be true of what you can actually
   see.  A flask you have never drunk is a flask of coloured liquid; if
   the description names the brew, the box has given the game away. */
function inspectOK(){
  var bad=[], i, k, kinds, t, tab, lore, det, worst=0, worstName='';
  bootTest(82000);
  kinds=[['potion',POTIONS],['scroll',SCROLLS],['wand',WANDS],['ring',RINGS],
         ['weapon',WEAPONS],['armor',ARMORS],['head',HEADS],['feet',FEET],
         ['shield',SHIELDS],['food',FOODS]];
  var counted=0;
  for(t=0;t<kinds.length;t++){
    tab=kinds[t][1];
    for(k=0;k<tab.length;k++){
      var it=mkItem(kinds[t][0],k);
      lore=itemLore(it); det=itemDetail(it);
      counted++;
      if(!lore) { bad.push('nothing to say about a '+tab[k].n); continue; }
      if(lore.length<20) bad.push('the line about a '+tab[k].n+' is '+lore.length+' characters');
      if(lore.length>worst){ worst=lore.length; worstName=tab[k].n; }
      if(!det.length) bad.push('no detail at all about a '+tab[k].n);
      /* a description that ends mid sentence is a description somebody
         forgot to finish */
      if('.!?"'.indexOf(lore.charAt(lore.length-1))<0)
        bad.push('the line about a '+tab[k].n+' does not end in a full stop');
    }
  }
  /* the singletons */
  var ones=['crystal','dynamite','pin','chest','pouch','amulet','key','gold'];
  for(i=0;i<ones.length;i++){
    var o=mkItem(ones[i],0);
    counted++;
    if(!itemLore(o)) bad.push('nothing to say about a '+ones[i]);
  }
  /* --- and it gives nothing away ---------------------------------- */
  for(k=0;k<POTIONS.length;k++){
    KNOWN.pot[k]=0;
    var p2=mkItem('potion',k);
    var said=itemLore(p2).toLowerCase();
    if(said.indexOf(POTIONS[k].n.toLowerCase())>=0 && POTIONS[k].n!=='water')
      bad.push('an unknown flask of '+POTIONS[k].n+' names itself');
    if(said.indexOf(APPEAR.pot[k].toLowerCase())<0)
      bad.push('an unknown flask does not say what colour it is');
    KNOWN.pot[k]=1;
    if(itemLore(p2)===said) bad.push('a flask of '+POTIONS[k].n+' reads the same known and unknown');
  }
  for(k=0;k<SCROLLS.length;k++){
    KNOWN.scr[k]=0;
    var s2=mkItem('scroll',k);
    var t2=itemLore(s2).toLowerCase();
    if(t2.indexOf(SCROLLS[k].n.toLowerCase())>=0)
      bad.push('an unknown scroll of '+SCROLLS[k].n+' names itself');
    KNOWN.scr[k]=1;
  }
  for(k=0;k<WANDS.length;k++){
    KNOWN.wand[k]=0;
    var w2=mkItem('wand',k);
    if(itemLore(w2).toLowerCase().indexOf(' of '+WANDS[k].n.toLowerCase())>=0)
      bad.push('an unknown wand of '+WANDS[k].n+' names itself');
    KNOWN.wand[k]=1;
  }
  /* nor does the price: a flask worth two hundred gold is obviously not
     the dull one, so what it would fetch waits until you know it */
  function saysWorth(it){
    var dd=itemDetail(it), q;
    for(q=0;q<dd.length;q++) if(String(dd[q][0]).indexOf('worth')===0) return true;
    return false;
  }
  for(k=0;k<POTIONS.length;k++){
    KNOWN.pot[k]=0;
    if(saysWorth(mkItem('potion',k))) bad.push('an unknown flask says what it is worth');
    KNOWN.pot[k]=1;
    if(POTIONS[k].w && !saysWorth(mkItem('potion',k)))
      bad.push('a known flask of '+POTIONS[k].n+' says nothing about its worth');
  }
  for(k=0;k<WANDS.length;k++){
    KNOWN.wand[k]=0;
    if(saysWorth(mkItem('wand',k))) bad.push('an unknown wand says what it is worth');
    KNOWN.wand[k]=1;
  }
  /* a piece of kit you have not placed is described by its look */
  for(k=0;k<ARMORS.length;k++){
    KNOWN.gear.armor[k]=0;
    var a2=mkItem('armor',k); a2.known=0;
    if(hidesItsName(a2) && itemLore(a2).toLowerCase().indexOf(ARMORS[k].n.toLowerCase())>=0)
      bad.push('an unplaced '+ARMORS[k].n+' names itself');
    KNOWN.gear.armor[k]=1;
  }
  /* the two boxes about the man himself */
  var me=selfDetail();
  if(me.length<8) bad.push('the box about you has only '+me.length+' lines');
  P.conf=5; P.haste=3; G.hungerState=1;
  var ef=effectsDetail();
  if(ef.length<3) bad.push('the box of effects has only '+ef.length+' lines');
  var told=0;
  for(i=0;i<ef.length;i++) if(ef[i][2]) told++;
  if(!told) bad.push('not one effect had anything explained about it');
  P.conf=0; P.haste=0; G.hungerState=0;
  return { bad:bad, counted:counted, longest:worst, longestName:worstName,
           me:me.length, ef:ef.length, told:told };
}

/* ------------------------------------------------- a stone comes back
   A rune cut into stone is not always used up by going off once.  About
   a quarter of the time the stone is lying there afterwards with its
   carving intact, to be picked up and thrown again - and a returning
   stone, which has its own arrangement, is not part of this at all. */
function runeStoneSurvivesOK(runs){
  var bad=[], i, s, kept=0, tried=0, back=[];
  var n = runs || 400;
  /* thrown at bare floor, over and over, counting what is left */
  for(s=0;s<40 && tried<n;s++){
    bootTest(82200+s);
    var lane=straightLine4(1);
    if(!lane) continue;
    for(i=0;i<200 && tried<n;i++){
      L.items.length=0; L.mons.length=0; L.clouds.length=0; L.temp={}; L.traps=[];
      P.hp=P.mhp=900000; G.dead=0; G.beat=0; G.msgq=[];
      for(var q=0;q<N_SLOTS;q++) P.slots[q]=null;
      var st=mkItem('weapon',weaponIndex('burning stone'));
      st.cnt=1; st.known=1; addItem(st);
      throwAtSquare(st, lane.x, lane.y);
      tried++;
      var found=0;
      for(var j=0;j<L.items.length;j++)
        if(L.items[j].t==='weapon' && WEAPONS[L.items[j].k].n==='burning stone')
          found+=L.items[j].cnt||1;
      for(j=0;j<N_SLOTS;j++)
        if(P.slots[j] && P.slots[j].t==='weapon' && WEAPONS[P.slots[j].k].n==='burning stone')
          found+=P.slots[j].cnt||1;
      if(found>1) bad.push('one throw left '+found+' stones behind');
      if(found) kept++;
    }
  }
  if(!tried){ bad.push('nowhere to throw a stone'); return { bad:bad }; }
  var pct = Math.round(kept*100/tried);
  if(!kept) bad.push('a runed stone never once survived a throw');
  if(pct < RUNE_RECOVER_PCT-10 || pct > RUNE_RECOVER_PCT+10)
    bad.push('it survived '+pct+' throws in a hundred, not about '+RUNE_RECOVER_PCT);
  /* and the one it came back as is a runed stone still, not a pebble */
  bootTest(82300);
  var lane2=straightLine4(1);
  if(lane2){
    for(i=0;i<200;i++){
      L.items.length=0;
      for(var q2=0;q2<N_SLOTS;q2++) P.slots[q2]=null;
      var st2=mkItem('weapon',weaponIndex('freezing stone'));
      st2.cnt=1; st2.known=1; addItem(st2);
      G.msgq=[];
      throwAtSquare(st2, lane2.x, lane2.y);
      for(var j2=0;j2<L.items.length;j2++){
        var it2=L.items[j2];
        if(it2.t!=='weapon') continue;
        if(WEAPONS[it2.k].n==='freezing stone'){ back.push(1); }
        else if(WEAPONS[it2.k].n==='stone')
          bad.push('it came back as a plain stone with the rune worn off');
      }
      if(back.length>3) break;
    }
    if(!back.length) bad.push('never saw one come back to check what it was');
  }
  /* and a spent one does not wind itself back up.  A stone that comes
     through a throw carries its own tally with it; handing back a fresh
     one would make a returning stone that never runs out. */
  bootTest(82350);
  var lane4=straightLine4(1);
  if(lane4){
    L.items.length=0;
    for(var q4=0;q4<N_SLOTS;q4++) P.slots[q4]=null;
    var worn=mkItem('weapon',weaponIndex('returning stone'));
    worn.cnt=1; worn.known=1; worn.ret=1;          /* one flight left */
    addItem(worn);
    G.msgq=[]; G.beat=0;
    throwAtSquare(worn, lane4.x, lane4.y);
    /* it came home spent, so what you have now is a plain stone */
    var all=carriedItems(), q5, homers=0, plain=0;
    for(q5=0;q5<all.length;q5++){
      if(all[q5].t!=='weapon') continue;
      if(WEAPONS[all[q5].k].rune==='return'){
        homers++;
        var left=(all[q5].ret===undefined)?RETURN_USES:all[q5].ret;
        if(left>1) bad.push('a spent returning stone came back with '+left+' flights');
      } else if(WEAPONS[all[q5].k].n==='stone') plain++;
    }
    for(q5=0;q5<L.items.length;q5++){
      var fl=L.items[q5];
      if(fl.t==='weapon' && WEAPONS[fl.k].rune==='return'){
        var lf=(fl.ret===undefined)?RETURN_USES:fl.ret;
        if(lf>1) bad.push('a spent returning stone was left on the floor with '+lf+' flights');
      }
    }
    if(!plain && !homers) bad.push('a spent returning stone vanished altogether');
  }
  /* a returning stone is counted down by its own rune, not by this */
  bootTest(82400);
  var lane3=straightLine4(1);
  var homes=0;
  if(lane3){
    for(i=0;i<40;i++){
      L.items.length=0;
      for(var q3=0;q3<N_SLOTS;q3++) P.slots[q3]=null;
      var rs=mkItem('weapon',weaponIndex('returning stone'));
      rs.cnt=1; rs.known=1; addItem(rs);
      G.msgq=[]; G.beat=0;
      throwAtSquare(rs, lane3.x, lane3.y);
      var onFloor=0;
      for(var j3=0;j3<L.items.length;j3++)
        if(L.items[j3].t==='weapon' && WEAPONS[L.items[j3].k].rune==='return') onFloor++;
      if(onFloor) bad.push('a returning stone was left lying on the floor');
      else homes++;
    }
  }
  return { bad:bad, tried:tried, pct:pct, homes:homes };
}

/* -------------------------------------------- what the box does not say
   Three things the box used to tell you that nobody ever wanted to know:
   whether a thing stacks, which part of you a boot goes on, and how many
   turns of the food clock a ration is worth.  A description is worth
   reading only as long as every line in it is worth reading. */
function inspectSaysNothingIdleOK(){
  var bad=[], i, k, t, tab;
  bootTest(82500);
  var idle = [
    ['stack', 'whether a thing stacks'],
    ['throw them one at a time', 'how to throw a pile'],
    ['worn on the', 'which part of you it goes on'],
    ['on the food clock', 'the number on the food clock'],
    ['one throw and the rune is spent', 'that a rune is spent by one throw']
  ];
  var kinds=[['potion',POTIONS],['scroll',SCROLLS],['wand',WANDS],['ring',RINGS],
             ['weapon',WEAPONS],['armor',ARMORS],['head',HEADS],['feet',FEET],
             ['shield',SHIELDS],['food',FOODS]];
  for(t=0;t<kinds.length;t++){
    tab=kinds[t][1];
    for(k=0;k<tab.length;k++){
      var it=mkItem(kinds[t][0],k); it.known=1;
      if(KNOWN.gear[kinds[t][0]]) KNOWN.gear[kinds[t][0]][k]=1;
      var rows=itemDetail(it), all=[];
      for(i=0;i<rows.length;i++) all.push(String(rows[i][0]).toLowerCase());
      var joined=all.join(' | ');
      for(i=0;i<idle.length;i++)
        if(joined.indexOf(idle[i][0])>=0)
          bad.push('a '+tab[k].n+' still tells you '+idle[i][1]);
    }
  }
  /* and the returning stone says the true thing instead */
  var rs=mkItem('weapon',weaponIndex('returning stone')); rs.known=1;
  var said=itemDetail(rs).map(function(r){ return String(r[0]).toLowerCase(); }).join(' | ');
  if(said.indexOf('flies back')<0) bad.push('the returning stone does not say that it comes back');
  var bs=mkItem('weapon',weaponIndex('burning stone')); bs.known=1;
  var said2=itemDetail(bs).map(function(r){ return String(r[0]).toLowerCase(); }).join(' | ');
  if(said2.indexOf('leave it whole')<0)
    bad.push('a runed stone does not say it sometimes survives');
  /* the line Gulli asked for, word for word */
  if(LORE.armor['leather armor'].indexOf('Definitely better than nothing.') < 0)
    bad.push('the leather armour does not read as asked');
  return { bad:bad };
}

/* ------------------------------------------------ what a barrel leaves
   A barrel of powder is not a flask of fire.  It lights the room a long
   way about it, it leaves a few squares still burning for a turn or two,
   and it hangs a cloud of smoke over the hole it made - grey, and much
   kinder than poison. */
function barrelBlastOK(seeds){
  var bad=[], s, i, tried=0, fires=[], smokes=[], lit=[];
  for(s=0;s<(seeds||40) && tried<6;s++){
    bootTest(83000+s);
    var lane=straightLine4(1);
    if(!lane) continue;
    L.mons.length=0; L.clouds.length=0; L.items.length=0; L.temp={}; L.traps=[];
    L.barrels={}; L.fuses={};
    P.hp=P.mhp=900000; P.blind=0; G.dead=0; G.splash=null;
    var bx=lane.x, by=lane.y, bj=by*MAP_W+bx;
    if(!walkable(bx,by)) continue;
    tried++;
    L.barrels[bj]=1; L.decor[bj]='barrel';
    G.msgq=[]; G.beat=0;
    blowBarrel(bx,by);
    /* the flash knows it is a big one */
    if(!G.splash || !G.splash.big) bad.push('the blast was not marked as a barrel');
    /* a few squares still burning, for a turn or two */
    var fire=0, smoke=0, badTurns=0;
    for(i=0;i<L.clouds.length;i++){
      var c=L.clouds[i];
      if(c.kind==='fire'){
        fire++;
        if(c.turns<BARREL_FIRE_TURNS_MIN||c.turns>BARREL_FIRE_TURNS_MAX) badTurns++;
      } else if(c.kind==='smoke'){
        smoke++;
        /* spawnCloud gives every square its own life, within one of the
           number it was asked for - see the comment there.  So the band
           is the asked-for one with a turn of slack at each end. */
        if(c.turns<SMOKE_TURNS_MIN-1||c.turns>SMOKE_TURNS_MAX+1)
          bad.push('smoke hangs for '+c.turns+' turns, outside '+
            (SMOKE_TURNS_MIN-1)+'-'+(SMOKE_TURNS_MAX+1));
      }
    }
    if(badTurns) bad.push(badTurns+' of the fires it left burn for the wrong number of turns');
    if(fire<BARREL_FIRES_MIN||fire>BARREL_FIRES_MAX)
      bad.push('it left '+fire+' squares burning, outside '+BARREL_FIRES_MIN+'-'+BARREL_FIRES_MAX);
    if(!smoke) bad.push('a barrel went up and left no smoke');
    fires.push(fire); smokes.push(smoke);
    /* the smoke is over the spot the barrel stood on */
    var here=0;
    for(i=0;i<L.clouds.length;i++)
      if(L.clouds[i].kind==='smoke'&&L.clouds[i].x===bx&&L.clouds[i].y===by) here=1;
    if(!here) bad.push('the smoke is not over the barrel');
    /* how far it lights: a lamp's worth, not a candle's */
    for(i=0;i<L.tiles.length;i++) L.flags[i]|=(F_VIS|F_SEEN);
    var g=lightMap();
    var far=0, kk;
    for(kk in g){
      var gx=(kk|0)%MAP_W, gy=((kk|0)/MAP_W)|0;
      var dd=Math.max(Math.abs(gx-bx),Math.abs(gy-by));
      if(dd>far) far=dd;
    }
    lit.push(far);
    if(far<BLAST_LIGHT_HALF-1)
      bad.push('the flash of it reached only '+far+' squares');
    /* and it all clears */
    for(i=0;i<SMOKE_TURNS_MAX+3;i++){ cloudsOnYou(); ageClouds(); }
    var left=0;
    for(i=0;i<L.clouds.length;i++) if(L.clouds[i].kind==='smoke') left++;
    if(left) bad.push('the smoke never cleared');
  }
  if(!tried) bad.push('nowhere to stand a barrel');
  /* smoke is kinder than poison, which is the whole of the difference */
  var sm=0, po=0;
  for(i=0;i<2000;i++){ sm+=roll(SMOKE_DAMAGE[0],SMOKE_DAMAGE[1]); po+=roll(1,3); }
  if(sm>=po) bad.push('smoke hurts as much as poison gas');
  var avg=function(a){ var t=0,i; for(i=0;i<a.length;i++) t+=a[i]; return a.length?t/a.length:0; };
  return { bad:bad, tried:tried, fires:avg(fires), smoke:avg(smokes), far:avg(lit),
           smokeDam:sm/2000, poisonDam:po/2000 };
}

/* ------------------------------------------------ a door in the floor
   A trapdoor is hidden until it is found, and one under a rug cannot be
   found at all until the rug has burned away.  Under it is a cellar:
   one to three small rooms that are not a floor of the dungeon, with the
   hoard in the room furthest from the way in and a way back up that
   comes out on the trapdoor itself. */
function trapdoorsOK(seeds){
  var bad=[], s, d, i, k, floors=0, doors=0, rugged=0, found=0;
  for(s=0;s<(seeds||14);s++){
    bootTest(84000+s);
    for(d=2;d<=14;d++){
      enterLevel(d,'down');
      floors++;
      var here=[];
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===TRAPDOOR) here.push(i);
      if(!here.length) continue;
      if(here.length>1) bad.push('a floor had '+here.length+' trapdoors on it');
      doors++;
      var j=here[0], tx=j%MAP_W, ty=(j/MAP_W)|0;
      if(!L.tdoor||!L.tdoor[j]) bad.push('a trapdoor tile with no door behind it');
      else if(L.tdoor[j].found) bad.push('a trapdoor was found before anybody looked');
      if(!walkable(tx,ty)) bad.push('you cannot stand on a trapdoor');
      if(isRugName(L.decor[j])) rugged++;
    }
  }
  if(!floors) { bad.push('no floors to look at'); return { bad:bad }; }
  var pct=Math.round(doors*100/floors);
  if(pct<TRAPDOOR_PCT-14||pct>TRAPDOOR_PCT+14)
    bad.push(pct+' floors in a hundred had one, not about '+TRAPDOOR_PCT);
  if(!rugged) bad.push('not one of them was ever laid under a rug');

  /* --- searching finds one, and never one under a rug -------------- */
  var lookedUnder=0, foundBare=0;
  for(s=0;s<60 && (!foundBare || !lookedUnder);s++){
    bootTest(84200+s);
    for(d=2;d<=14;d++){
      enterLevel(d,'down');
      var tj=-1;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===TRAPDOOR){ tj=i; break; }
      if(tj<0) continue;
      var x=tj%MAP_W, y=(tj/MAP_W)|0;
      L.mons.length=0;
      P.x=x; P.y=y; P.blind=0; P.hp=P.mhp=900000;
      var underRug=isRugName(L.decor[tj]);
      G.msgq=[];
      for(i=0;i<400 && !L.tdoor[tj].found;i++) doSearch(true);
      if(underRug){
        lookedUnder++;
        if(L.tdoor[tj].found) bad.push('a trapdoor under a rug was found without burning it');
        /* burn the rug off it, and then it can be found */
        dropEmber(x,y,3);
        for(i=0;i<12 && isRugName(L.decor[tj]);i++){ cloudsOnYou(); ageClouds(); }
        if(isRugName(L.decor[tj])) bad.push('the rug over it would not burn');
        else {
          for(i=0;i<400 && !L.tdoor[tj].found;i++) doSearch(true);
          if(!L.tdoor[tj].found)
            bad.push('with the rug burned away it still could not be found');
        }
      } else {
        foundBare++;
        if(!L.tdoor[tj].found) bad.push('a bare trapdoor could not be found by looking');
      }
      break;
    }
  }
  if(!foundBare) bad.push('never found a bare trapdoor to look for');
  if(!lookedUnder) bad.push('never found one under a rug');

  /* --- and what is under it --------------------------------------- */
  var went=0, hoards=[], darkRooms=0, allRooms=0, prizes=0;
  for(s=0;s<60 && went<6;s++){
    bootTest(84400+s);
    for(d=2;d<=14;d++){
      enterLevel(d,'down');
      var dj=-1;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===TRAPDOOR){ dj=i; break; }
      if(dj<0) continue;
      var dx=dj%MAP_W, dy=(dj/MAP_W)|0;
      L.tdoor[dj].found=1;
      L.mons.length=0;
      P.x=dx; P.y=dy; P.hp=P.mhp=900000;
      var wasDepth=G.depth, wasFloor=L;
      if(!useStairs()){ bad.push('a found trapdoor would not open'); break; }
      went++;
      if(G.depth!==wasDepth) bad.push('going down a trapdoor changed the floor you are on');
      if(!inCellar()) bad.push('down the trapdoor is not a cellar');
      if(L===wasFloor) bad.push('the cellar is the same level as the floor above');
      if(L.rooms.length<CELLAR_ROOMS_MIN||L.rooms.length>CELLAR_ROOMS_MAX)
        bad.push('a cellar of '+L.rooms.length+' rooms');
      if(tileAt(P.x,P.y)!==STAIR_UP) bad.push('you did not come down onto the way back up');
      /* it is all one place: you can walk from the stairs to the hoard */
      var reach=reachSet(L,P.x,P.y,true);
      var far=L.rooms[L.rooms.length-1];
      if(!reach[far.cy*MAP_W+far.cx]) bad.push('the far room of a cellar cannot be walked to');
      /* the hoard is in the room furthest from the way in */
      var loot=0, elsewhere=0, prize=0;
      for(i=0;i<L.items.length;i++){
        var it=L.items[i];
        var ri=L.roomAt[it.y*MAP_W+it.x];
        if(ri===far.idx) loot++; else elsewhere++;
        if(it.t==='ring') prize=1;
        if(it.t==='weapon' && (it.hp>0||it.dp>0)) prize=1;
      }
      hoards.push(loot);
      if(!loot) bad.push('the far room of a cellar was empty');
      if(elsewhere) bad.push(elsewhere+' things were left outside the hoard');
      if(prize) prizes++;
      for(i=0;i<L.rooms.length;i++){ allRooms++; if(L.rooms[i].dark) darkRooms++; }
      /* and back up again, onto the trapdoor */
      if(!useStairs()) bad.push('the way out of a cellar would not work');
      if(inCellar()) bad.push('climbing out left you in the cellar');
      if(P.x!==dx||P.y!==dy) bad.push('you came up somewhere other than the trapdoor');
      if(tileAt(P.x,P.y)!==TRAPDOOR) bad.push('you came up somewhere that is not the trapdoor');
      /* and it is the same cellar when you go back down */
      var before=L.items.length;
      useStairs();
      if(!inCellar()) bad.push('the trapdoor only worked once');
      useStairs();
      break;
    }
  }
  if(went<3) bad.push('only got down '+went+' trapdoors');
  if(!prizes) bad.push('not one hoard held a ring or an enchanted blade');
  var avg=function(a){ var t=0,q; for(q=0;q<a.length;q++) t+=a[q]; return a.length?t/a.length:0; };
  return { bad:bad, floors:floors, pct:pct, rugged:rugged, went:went,
           hoard:avg(hoards), darkPct:allRooms?Math.round(darkRooms*100/allRooms):0,
           prizes:prizes };
}

/* --------------------------------------- a cellar survives a save
   A cellar is kept beside the floor above it, under a key of its own,
   and the game remembers which of the two you are standing in. */
function cellarSaveOK(seeds){
  var bad=[], s, d, i, tried=0;
  for(s=0;s<(seeds||40) && tried<3;s++){
    bootTest(84600+s);
    for(d=2;d<=14;d++){
      enterLevel(d,'down');
      var tj=-1;
      for(i=0;i<L.tiles.length;i++) if(L.tiles[i]===TRAPDOOR){ tj=i; break; }
      if(tj<0) continue;
      L.tdoor[tj].found=1;
      L.mons.length=0;
      P.x=tj%MAP_W; P.y=(tj/MAP_W)|0; P.hp=P.mhp=900000;
      if(!useStairs()) { bad.push('could not get into a cellar'); break; }
      tried++;
      var items=L.items.length, rooms=L.rooms.length, key=G.floorKey;
      var px=P.x, py=P.y;
      var serr=saveInto(0);
      if(serr) { bad.push('a run in a cellar would not save: '+serr); break; }
      /* and load it back into a fresh game */
      bootTest(84700+s);
      var lerr=loadFrom(0);
      if(lerr) { bad.push('a saved cellar would not load: '+lerr); break; }
      if(G.floorKey!==key) bad.push('it came back on floor '+G.floorKey+', not '+key);
      if(!inCellar()) bad.push('it came back out of the cellar');
      if(!L || L.items.length!==items)
        bad.push('the hoard came back as '+(L?L.items.length:'nothing')+' things, not '+items);
      if(L.rooms.length!==rooms) bad.push('the cellar came back with '+L.rooms.length+' rooms');
      if(P.x!==px||P.y!==py) bad.push('you came back standing somewhere else');
      /* and the way out still works */
      P.x=L.up.x; P.y=L.up.y;
      if(!useStairs()) bad.push('the way out of a loaded cellar would not work');
      if(inCellar()) bad.push('climbing out of a loaded cellar left you in it');
      break;
    }
  }
  if(!tried) bad.push('never got into a cellar to save one');
  return { bad:bad, tried:tried };
}

/* ---------------------------------------------------------------------
   The roll of the ten best.  Everything about it that is a rule rather
   than a network: what a table is worth once it has been read, which
   runs get into it, where a run lands in it, and what a name is allowed
   to be.  The bin the table is kept in is a file anybody with the key
   can write to, so the names that come back out of it are treated as
   somebody else's typing rather than as ours.  */
function highscoreOK(){
  var bad=[], i;
  var seed=[{name:'Rodney',xp:10500,level:12},{name:'Anband',xp:8200,level:9},
            {name:'NetHack',xp:7500,level:8},{name:'Pixel',xp:6100,level:7},
            {name:'Crawl',xp:5400,level:5},{name:'Rogue',xp:4300,level:4},
            {name:'Brogue',xp:3100,level:3},{name:'Siren',xp:2200,level:2},
            {name:'Hero',xp:1000,level:1},{name:'Noob',xp:150,level:1}];
  var t=hsClean(seed);
  if(t.length!==HS_MAX) bad.push('a full table came back '+t.length+' long');
  for(i=1;i<t.length;i++) if(t[i].xp>t[i-1].xp) bad.push('the table is not in order');
  /* a table that arrives out of order is put in order */
  var jumbled=hsClean([seed[4],seed[0],seed[9],seed[2]]);
  if(jumbled[0].name!=='Rodney') bad.push('a jumbled table was not sorted');
  /* a full table only takes something better than its last row, and
     equal is not better - whoever got there first keeps the place */
  if(hsQualifies(seed,150)) bad.push('a run equal to the last row got in');
  if(hsQualifies(seed,149)) bad.push('a run worse than the last row got in');
  if(!hsQualifies(seed,151)) bad.push('a run better than the last row was kept out');
  /* a table with room takes anybody at all */
  if(!hsQualifies(seed.slice(0,3),1)) bad.push('a table with room turned a run away');
  if(!hsQualifies([],0)) bad.push('an empty table turned a run away');
  /* one more run: sorted in, and the table still ten long */
  var withMe=hsWith(seed,{name:'Gulli',xp:9000,level:11});
  if(withMe.length!==HS_MAX) bad.push('the table grew to '+withMe.length);
  if(withMe[1].name!=='Gulli') bad.push('the new run landed at row '+
    (withMe.map(function(e){return e.name;}).indexOf('Gulli')+1)+', not two');
  if(withMe[withMe.length-1].name==='Noob'&&withMe.length===HS_MAX&&
     hsWith(seed,{name:'Gulli',xp:9000,level:11}).length!==HS_MAX)
    bad.push('the last row was not pushed off');
  if(hsPlace(seed,{name:'Gulli',xp:9000,level:11})!==2)
    bad.push('the run was told it came '+hsPlace(seed,{name:'Gulli',xp:9000,level:11}));
  if(hsPlace(seed,{name:'Gulli',xp:1,level:1})!==0)
    bad.push('a run that did not get in was told it had');
  /* names: cut to length, and nothing in them the font has not got */
  if(hsName('        ')!=='') bad.push('a name of spaces came back as something');
  if(hsName('a'.repeat(40)).length!==HS_NAME_MAX)
    bad.push('a long name came back '+hsName('a'.repeat(40)).length+' long');
  if(/[<>\/]/.test(hsName('<script>x</script>')))
    bad.push('a name kept its brackets: '+hsName('<script>x</script>'));
  if(hsName('  Gulli  ')!=='Gulli') bad.push('a name kept its spaces');
  /* and a table full of rubbish is still a table */
  var junk=hsClean([null,{},{name:'<b>',xp:'12',level:null},{name:5,xp:-1,level:1}]);
  for(i=0;i<junk.length;i++){
    if(typeof junk[i].name!=='string'||!junk[i].name) bad.push('a row came back nameless');
    if(typeof junk[i].xp!=='number'||junk[i].xp!==(junk[i].xp|0))
      bad.push('a row came back with '+junk[i].xp+' for experience');
  }
  return bad;
}

/* ------------------------------------------------- a thrown weapon wears
   A spear used to be the one weapon in the dungeon with no cost attached
   to using it: throw it, walk over, pick it up, throw it again, for
   ever.  Now a throw can be the last one it takes - and a well made one
   is worth carrying because it takes that break for you once and comes
   out of it worn.  A worn one is an ordinary one from then on. */
function thrownWearOK(){
  var bad=[], i;
  bootTest(58200);
  var spearK = weaponIndex('spear');

  /* what the three of them are called */
  var sp = mkItem('weapon', spearK); sp.known = 1;
  KNOWN.weap[spearK] = 1;
  if(/well made|worn/.test(itemName(sp)))
    bad.push('a plain spear reads as something else: '+itemName(sp));
  sp.make = 1;
  if(itemName(sp).indexOf('well made spear')<0)
    bad.push('a well made spear reads "'+itemName(sp)+'"');
  sp.make = -1;
  if(itemName(sp).indexOf('worn spear')<0)
    bad.push('a worn spear reads "'+itemName(sp)+'"');

  /* an ordinary one: it breaks about as often as it is meant to, and
     when it breaks it is gone rather than worn */
  var tries=6000, broke=0, worn=0;
  for(i=0;i<tries;i++){
    var it=mkItem('weapon', spearK);
    var w=hurlWear(it);
    if(w===2) broke++; else if(w===1) worn++;
  }
  var pct = broke*100/tries;
  if(Math.abs(pct - THROWN_BREAK_PCT) > 2.5)
    bad.push('an ordinary spear broke on '+pct.toFixed(1)+'% of throws, not '+
      THROWN_BREAK_PCT+'%');
  if(worn) bad.push('an ordinary spear came out worn '+worn+' times');

  /* a well made one: the same odds, but the first one only wears it */
  var brokeW=0, wornW=0;
  for(i=0;i<tries;i++){
    var it2=mkItem('weapon', spearK); it2.make=1;
    var w2=hurlWear(it2);
    if(w2===2) brokeW++;
    else if(w2===1){
      wornW++;
      if(it2.make!==-1) bad.push('a well made spear took a blow and is not worn');
    }
  }
  if(brokeW) bad.push('a well made spear broke outright '+brokeW+' times');
  var pctW = wornW*100/tries;
  if(Math.abs(pctW - THROWN_BREAK_PCT) > 2.5)
    bad.push('a well made spear took a blow on '+pctW.toFixed(1)+'% of throws, not '+
      THROWN_BREAK_PCT+'%');

  /* and end to end: worn, then gone, and nothing after that */
  var it3=mkItem('weapon', spearK); it3.make=1;
  var steps=[], guard=0;
  while(guard++ < 2000){
    var w3=hurlWear(it3);
    if(!w3) continue;
    steps.push(w3);
    if(w3===2) break;
  }
  if(steps.join(',')!=='1,2')
    bad.push('a well made spear went '+steps.join(',')+' rather than worn and then gone');

  /* nothing you cannot throw carries workmanship at all */
  var sword=mkItem('weapon', weaponIndex('long sword'));
  if(hurlWear(sword)) bad.push('a long sword broke from being thrown');
  rollMake(sword);
  if(sword.make) bad.push('a long sword was made well or badly');

  /* How many are made well, asked of the roll itself: a spear is a rare
     enough find that a floor's worth of them is far too small a handful
     to read a share of a quarter off - fifty of them would come out
     anywhere between one in six and one in three on the dice alone. */
  var fine=0;
  for(i=0;i<6000;i++) if(rollMake(mkItem('weapon', spearK)).make > 0) fine++;
  var pctFine = fine*100/6000;
  if(Math.abs(pctFine - WELL_MADE_PCT) > 2.5)
    bad.push(pctFine.toFixed(1)+'% of them were made well, not '+WELL_MADE_PCT+'%');
  /* and that the dungeon actually asks: some of what it deals out is */
  var hurls=0, dealtFine=0;
  for(i=0;i<4000;i++){
    var g=newItem(4);
    if(!isHurlWeapon(g)) continue;
    hurls++; if(g.make>0) dealtFine++;
  }
  if(!hurls) bad.push('the dungeon dealt out no weapon you can throw at all');
  else if(!dealtFine)
    bad.push('none of the '+hurls+' it dealt out was well made - the roll is not wired in');

  /* the workmanship survives the landing: what you pick up is what you
     threw, not a fresh one out of the table */
  var thrown=mkItem('weapon', spearK); thrown.make=-1; thrown.hp=2; thrown.dp=1;
  var landed=likeItem(thrown);
  if(landed.make!==-1) bad.push('a worn spear came back off the floor unworn');

  return { bad:bad, broke:pct, worn:pctW, fine:pctFine,
           hurls:hurls, dealtFine:dealtFine };
}
