#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ROGUE-8 : sprite atlas generator.
Produces a TRUE PIXEL atlas.  Every tile/sprite is exactly 8x8 pixels.
A 5x7 bitmap font lives in 6x8 cells in a block below the sprite grid.
No anti-aliasing, no scaling, no filters -- pixels are written one at a time.
"""
import json, os
from PIL import Image

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- palette
PAL = {
    '.': None,                    # transparent
    '0': (0x0b, 0x0d, 0x1c),      # ink / near black
    '1': (0x28, 0x2b, 0x36),      # room floor base - grey stone, faint blue
    '2': (0x2b, 0x33, 0x52),      # mortar / dim detail
    'd': (0x38, 0x3c, 0x48),      # the grit speckled across a floor tile
    '3': (0x3f, 0x49, 0x66),      # stone dark
    '4': (0x63, 0x6d, 0x85),      # stone mid
    '5': (0x86, 0x90, 0xa4),      # stone light
    '6': (0xc3, 0xcc, 0xd9),      # light grey
    '7': (0xff, 0xff, 0xff),      # white
    'r': (0x8a, 0x20, 0x2b),      # dark red
    'R': (0xd8, 0x2b, 0x2b),      # red
    'o': (0xc0, 0x5c, 0x11),      # dark orange
    'O': (0xf5, 0x9e, 0x0b),      # orange
    'y': (0xfa, 0xd0, 0x39),      # yellow
    'g': (0x44, 0x6b, 0x1c),      # dark green
    'G': (0x93, 0xbd, 0x27),      # lime / moss
    'e': (0x2f, 0x9e, 0x44),      # emerald
    'b': (0x10, 0x4e, 0x87),      # dark blue
    'B': (0x1f, 0x8f, 0xd8),      # blue
    'c': (0x74, 0xd6, 0xe8),      # cyan
    'p': (0x6b, 0x2f, 0x9c),      # purple
    'P': (0xb2, 0x6c, 0xe0),      # light purple
    'n': (0x45, 0x2d, 0x1e),      # dark brown
    'N': (0x8a, 0x5a, 0x2b),      # brown
    'k': (0xd2, 0x9d, 0x63),      # tan
    's': (0xf0, 0xbf, 0x99),      # skin
    'm': (0xff, 0x7f, 0xa8),      # pink
    # the four colours the Persian rug is painted in
    'q': (0x8b, 0x23, 0x22),      # rug: the deep red field
    'Q': (0xb9, 0x25, 0x29),      # rug: the bright red
    'j': (0xbf, 0xa5, 0x8c),      # rug: the cream
    'J': (0x2d, 0x25, 0x2c),      # rug: the near black
    'w': (0x9c, 0xa5, 0xb8),      # metal dark
    'W': (0xe6, 0xed, 0xf5),      # metal bright
}

# ---------------------------------------------------------------- sprites
S = {}

def spr(name, rows):
    assert name not in S, 'sprite %r is defined twice' % name
    assert len(rows) == 8, name
    for r in rows:
        assert len(r) == 8, (name, r)
        for ch in r:
            assert ch in PAL, (name, ch)
    S[name] = rows

# ----- terrain -----------------------------------------------------------
spr('void', ["........"]*8)

spr('floor', [
    "11111111",
    "1d1111d1",
    "11111111",
    "11111111",
    "11111111",
    "111d111d",
    "11111111",
    "11111111"])

spr('floor2', [
    "11111111",
    "11111111",
    "111d1111",
    "11111111",
    "111111d1",
    "11111111",
    "1d111111",
    "11111111"])

spr('floor3', [
    "11111111",
    "11111111",
    "11d11111",
    "11111111",
    "11111d11",
    "11111111",
    "111d1111",
    "11111111"])

spr('corr', [
    "00000000",
    "02000200",
    "00000000",
    "00000000",
    "00000000",
    "00020002",
    "00000000",
    "00000000"])

spr('wall', [
    "22222222",
    "55525555",
    "44424444",
    "44424444",
    "22222222",
    "55555552",
    "44444442",
    "44444442"])

spr('wall2', [
    "22222222",
    "55555552",
    "44444442",
    "44444442",
    "22222222",
    "55525555",
    "44424444",
    "44424444"])

spr('wall3', [
    "22222222",
    "55555255",
    "44444244",
    "44444244",
    "22222222",
    "55255555",
    "44244444",
    "44244444"])

spr('wall_moss', [
    "22222222",
    "5G525555",
    "44424G44",
    "444244G4",
    "22222222",
    "55555552",
    "4G444442",
    "44444G42"])

spr('door', [
    "22222222",
    "2nNNNNn2",
    "2nNkkNn2",
    "2nNkkNn2",
    "2nNkkyn2",
    "2nNkkNn2",
    "2nNNNNn2",
    "22222222"])

spr('dooropen', [
    "nnnnnnnn",
    "n111111n",
    "n111111n",
    "n111111n",
    "n111111n",
    "n111111n",
    "n111111n",
    "nnnnnnnn"])

spr('stairs_down', [
    ".....666",
    ".....633",
    "...66633",
    "...63333",
    ".6666333",
    ".6333333",
    "66633333",
    "63333333"])

spr('stairs_up', [
    "63333333",
    "66633333",
    ".6333333",
    ".6666333",
    "...63333",
    "...66633",
    ".....633",
    ".....666"])

# A door in the floor: planks with a ring to pull it up by, and a dark
# seam down the side where it does not quite sit flush.
spr('trapdoor', [
    "nnnnnnnn",
    "nNNNNNNn",
    "nN0NNNNn",
    "nNNN0NNn",
    "nNNNNNNn",
    "nNN0NNNn",
    "nNNNNN6n",
    "nnnnnnnn"])

spr('trap', [
    "........",
    ".444444.",
    "4R4444R4",
    "4RR44RR4",
    "4RR44RR4",
    "4R4444R4",
    ".444444.",
    "........"])

spr('trap_dart', [
    "........",
    ".444444.",
    "46666664",
    "46000064",
    "460W0064",
    "46000064",
    ".444444.",
    "........"])

spr('trap_gas', [
    "........",
    ".444444.",
    "4G4444G4",
    "44G44G44",
    "444GG444",
    "44G44G44",
    ".4G44G4.",
    "........"])

spr('trap_pit', [
    "........",
    ".000000.",
    "06777760",
    "06000060",
    "06000060",
    "06777760",
    ".000000.",
    "........"])

spr('gas', [
    "..gg....",
    ".gGGg..g",
    "gGGGGggG",
    ".gGGGGg.",
    "g.gGGg.g",
    ".g.gg.g.",
    "..g..g..",
    ".g....g."])

spr('moss', [
    "........",
    "...G....",
    "..GgG...",
    ".G.G.G..",
    "..GGG...",
    "...G.G..",
    "..G.G...",
    "........"])

spr('moss_b', [
    "........",
    "...G.G..",
    "..GGgG..",
    ".G.GG.G.",
    "..GGgG..",
    ".G..G...",
    "...G.G..",
    "........"])

spr('moss2', [
    "........",
    ".....G..",
    "....GG..",
    "..G.G...",
    ".GGGG...",
    "..G.....",
    "........",
    "........"])

# the two edge tiles: moss thick along the top edge and thinning down,
# drawn turned so the thick side faces the moss or the wall it grows from
spr('moss3', [
    "GGgGGGgG",
    ".GGGgGG.",
    "G.GG.G.G",
    "..G...G.",
    ".G......",
    "........",
    "........",
    "........"])

spr('moss4', [
    "gGGGgGGG",
    "GG.GGG.G",
    ".G..G.G.",
    "G....G..",
    "..G.....",
    ".....G..",
    "........",
    "........"])

spr('bones', [
    "........",
    ".....677",
    "....677.",
    "...67...",
    "..67....",
    ".67.....",
    "776.....",
    "........"])

spr('skull', [
    "........",
    "..7777..",
    ".777777.",
    ".707707.",
    ".777777.",
    "..7777..",
    "..7.7.7.",
    "........"])

spr('rubble', [
    "........",
    "........",
    "...44...",
    "..4444..",
    ".444.44.",
    "4444444.",
    "..4..4..",
    "........"])

# A second heap, so a floor that came down in a heap is not the same
# stone stamped over and over.  Coarser than the first: bigger blocks,
# fewer of them, and lying the other way about.
spr('rubble2', [
    "........",
    "..3.44..",
    ".444.3..",
    "34.4444.",
    ".44444.4",
    "4.44.444",
    ".4.44.4.",
    "...4...."])

spr('column', [
    ".655556.",
    ".656556.",
    ".656556.",
    ".656556.",
    ".656556.",
    ".656556.",
    ".655556.",
    "........"])

# the second of two definitions of this used to overwrite the first,
# which kept the cell - so this is the art, at that cell
spr('table', [
    "........",
    ".nnnnnn.",
    ".nkkkkn.",
    ".nkkkkn.",
    ".nnnnnn.",
    "..n..n..",
    "..n..n..",
    "........"])

spr('barrel', [
    "........",
    ".nNNNNn.",
    ".NkkkkN.",
    ".nnnnnn.",
    ".NkkkkN.",
    ".NkkkkN.",
    ".nnnnnn.",
    "........"])

spr('chest', [
    "........",
    ".RRRRRR.",
    "RRRRRRRR",
    "RRRyyRRR",
    "NNNyyNNN",
    "NNNNNNNN",
    "NNNNNNNN",
    "........"])

# ----- items -------------------------------------------------------------
spr('gold', [
    "........",
    "........",
    "...yy...",
    "..yOOy..",
    ".yOOOOy.",
    "yOOOOOOy",
    ".yyyyyy.",
    "........"])

spr('gold2', [
    "........",
    "..yy....",
    ".yOOy...",
    "yOOOOy.y",
    ".yyyyOOy",
    "yOOOyyyy",
    "yOOOOOOy",
    ".yyyyyy."])

spr('food', [
    "........",
    "........",
    "..OOOO..",
    ".OkkkkO.",
    "OkkkkkkO",
    "OkkkkkkO",
    ".OOOOOO.",
    "........"])

spr('fruit', [
    "........",
    "...g....",
    "..OOO...",
    ".OOOOO..",
    ".OOOOO..",
    "..OOO...",
    "........",
    "........"])

spr('mushroom', [
    "........",
    "..RRR...",
    ".RRrRR..",
    "RRrRRRR.",
    "..666...",
    "..666...",
    ".66666..",
    "........"])

# The other four mushrooms.  Same shape, different cap: which colour does
# what is dealt out afresh every run, so the shape has to be the one thing
# they all share.
spr('mush_b', [
    "........",
    "..BBB...",
    ".BBbBB..",
    "BBbBBBB.",
    "..666...",
    "..666...",
    ".66666..",
    "........"])

spr('mush_y', [
    "........",
    "..yyy...",
    ".yyOyy..",
    "yyOyyyy.",
    "..666...",
    "..666...",
    ".66666..",
    "........"])

spr('mush_p', [
    "........",
    "..PPP...",
    ".PPpPP..",
    "PPpPPPP.",
    "..666...",
    "..666...",
    ".66666..",
    "........"])

spr('mush_g', [
    "........",
    "..GGG...",
    ".GGgGG..",
    "GGgGGGG.",
    "..666...",
    "..666...",
    ".66666..",
    "........"])

spr('berries', [
    "........",
    "...G....",
    "..GG....",
    ".pp.pp..",
    ".pppppp.",
    "..pp.pp.",
    "...pp...",
    "........"])

spr('amulet', [
    "........",
    ".y....y.",
    "..y..y..",
    "...yy...",
    "..yPPy..",
    ".yPccPy.",
    "..yPPy..",
    "...yy..."])

def potion(name, col):
    spr(name, [
        "........",
        "...66...",
        "...66...",
        "..6666..",
        ".6%%%%6.".replace('%', col),
        "6%%%%%%6".replace('%', col),
        "6%%%%%%6".replace('%', col),
        ".666666."])

for nm, c in [('pot_r','R'), ('pot_b','B'), ('pot_g','e'), ('pot_y','y'),
              ('pot_p','P'), ('pot_c','c'), ('pot_w','6'), ('pot_o','O')]:
    potion(nm, c)

# A vial is not a flask.  It is short, thick walled and stoppered with a
# cork rather than a rag, and the glass is dark - what is in one is too
# strong to drink and the shape has to say so at a glance, at eight
# pixels, next to eight potions that are all neck and shoulder.
def vial(name, col):
    spr(name, [
        "........",
        "..nn....",
        "..44....",
        ".3%%3...".replace('%', col),
        ".3%%3...".replace('%', col),
        ".3%%3...".replace('%', col),
        ".3%%3...".replace('%', col),
        "..33...."])

for nm, c in [('vial_g','G'), ('vial_k','p'), ('vial_p','P'), ('vial_w','6'),
              ('vial_r','R'), ('vial_y','y'), ('vial_b','B')]:
    vial(nm, c)

# Slime is a slick, not a glaze: it pools rather than covering, so it is
# a blotch with a couple of runs off it and clear stone showing round
# the edges.  Drawn over the tile underneath at ALPHA, like the ice.
spr('slime', [
    "..gg....",
    ".geeg.g.",
    "geeGeeg.",
    ".geeeeeg",
    "..geeeeg",
    ".geeeg..",
    "..geg.g.",
    "...g...."])

# Ice is a glaze laid over whatever the square already was, so it is
# mostly holes: a few pale cracks and a highlight, drawn half
# transparent over the tile underneath.
spr('ice', [
    ".c....c.",
    "c..cc...",
    "...c..c.",
    ".c...c..",
    "..cc....",
    "c...c..c",
    "..c...c.",
    ".c..c..."])

spr('scroll', [
    "........",
    "..6666..",
    ".677776.",
    ".622226.",
    ".677776.",
    ".622226.",
    ".677776.",
    "..6666.."])

spr('wand', [
    "......cc",
    ".....cc.",
    "....NN..",
    "...NN...",
    "..NN....",
    ".NN.....",
    "NN......",
    "........"])

spr('staff', [
    "...ee...",
    "..e..e..",
    "...ee...",
    "...N....",
    "...N....",
    "...N....",
    "...N....",
    "...N...."])

spr('wand2', [
    ".......c",
    "......c.",
    ".....6..",
    "....NN..",
    "...NN...",
    "..NN....",
    ".NN.....",
    "N......."])

spr('wand3', [
    "......yy",
    ".....y6.",
    "....66..",
    "...NN...",
    "..NN....",
    ".NN.....",
    "NN......",
    "........"])

spr('staff2', [
    "...N....",
    "..NeN...",
    "...N....",
    "...N....",
    "..NN....",
    "...N....",
    "...N....",
    "...N...."])

def ring(name, col):
    spr(name, [
        "........",
        "...%%...".replace('%', col),
        "..6%%6..".replace('%', col),
        ".66..66.",
        ".6....6.",
        ".66..66.",
        "..6666..",
        "........"])

for nm, c in [('ring_r','R'), ('ring_b','B'), ('ring_g','e'), ('ring_y','y'),
              ('ring_c','c'), ('ring_p','P'), ('ring_m','m'),
              ('ring_o','O'), ('ring_n','5')]:
    ring(nm, c)

spr('sword', [
    "...WW...",
    "...WW...",
    "...WW...",
    "...WW...",
    ".yyWWyy.",
    "...NN...",
    "...NN...",
    "...yy..."])

spr('dagger', [
    "........",
    "....WW..",
    "...WW...",
    "..WW....",
    ".yWWy...",
    "..NN....",
    "..yy....",
    "........"])

spr('mace', [
    "..4444..",
    ".444444.",
    ".444444.",
    "..4444..",
    "...NN...",
    "...NN...",
    "...NN...",
    "...yy..."])

spr('axe', [
    "..4444..",
    ".444444.",
    ".44444N.",
    "..444N..",
    "...NN...",
    "...N....",
    "...N....",
    "...N...."])

spr('spear', [
    "...WW...",
    "..WWWW..",
    "...WW...",
    "...NN...",
    "...NN...",
    "...NN...",
    "...NN...",
    "...NN..."])

spr('bow', [
    "..NN6...",
    ".N...6..",
    "N....6..",
    "N....6..",
    "N....6..",
    ".N...6..",
    "..NN6...",
    "........"])

spr('arrow', [
    "......WW",
    ".....W7.",
    "....N...",
    "...N....",
    "..N.....",
    ".N......",
    "66......",
    "6......."])

spr('dart', [
    "........",
    ".....WW.",
    "....WW..",
    "...NN...",
    "..66....",
    ".6......",
    "........",
    "........"])

spr('armor_l', [
    ".N....N.",
    "NNNNNNNN",
    "NkkkkkkN",
    "NkkkkkkN",
    "NkkkkkkN",
    "NkkkkkkN",
    ".NkkkkN.",
    "..NNNN.."])

spr('armor_c', [
    ".4....4.",
    "44444444",
    "4w4w4w44",
    "44w4w4w4",
    "4w4w4w44",
    "44w4w4w4",
    ".4w4w4w.",
    "..4444.."])

spr('armor_p', [
    ".6....6.",
    "66666666",
    "6WWWWWW6",
    "6WW66WW6",
    "6WWWWWW6",
    "6WWWWWW6",
    ".6WWWW6.",
    "..6666.."])

# Glass armour: a coat of something that is not metal.  Pale cyan with a
# white highlight down one side, so it reads as glass rather than as one
# more grey breastplate.
spr('armor_glass', [
    ".c....c.",
    "cccccccc",
    "c7cccccc",
    "c7ccccBc",
    "cc7cccBc",
    "ccccccBc",
    ".ccccBc.",
    "..cccc.."])

spr('shield', [
    ".666666.",
    ".6WWWW6.",
    ".6WRRW6.",
    ".6WRRW6.",
    "..6WW6..",
    "..6WW6..",
    "...66...",
    "........"])

spr('shield2', [
    ".666666.",
    ".6BBBB6.",
    ".6ByyB6.",
    ".6ByyB6.",
    ".6BBBB6.",
    "..6BB6..",
    "...66...",
    "........"])

spr('shield3', [
    ".666666.",
    "6wwwwww6",
    "6w4444w6",
    "6w4RR4w6",
    "6w4RR4w6",
    "6w4444w6",
    "6wwwwww6",
    ".666666."])

spr('cap', [
    "........",
    "........",
    "..NNNN..",
    ".NkkkkN.",
    "NkkkkkkN",
    "NNNNNNNN",
    "........",
    "........"])

spr('helm', [
    "........",
    "..wwww..",
    ".wWWWWw.",
    "wWWWWWWw",
    "wW0ww0Ww",
    "wWWWWWWw",
    ".w.ww.w.",
    "........"])

spr('crown', [
    "........",
    ".y.yy.y.",
    ".y.yy.y.",
    ".yyyyyy.",
    ".yRyyRy.",
    ".yyyyyy.",
    "........",
    "........"])

spr('boots', [
    "........",
    ".NN..NN.",
    ".NN..NN.",
    ".NN..NN.",
    "NNNN.NNN",
    "kkkk.kkk",
    "NNNN.NNN",
    "........"])

spr('sandals', [
    "........",
    "........",
    ".NNN.NNN",
    ".kkk.kkk",
    ".NkN.NkN",
    ".kkk.kkk",
    ".NNN.NNN",
    "........"])

spr('ironboots', [
    "........",
    ".ww..ww.",
    ".wW..wW.",
    ".ww..ww.",
    "wwww.www",
    "WWWW.WWW",
    "wwww.www",
    "........"])

spr('pouch', [
    "........",
    "..N..N..",
    "..NNNN..",
    ".NkkkkN.",
    "NkkkkkkN",
    "NkkNNkkN",
    "NkkkkkkN",
    ".NNNNNN."])

spr('chest_open', [
    ".RRRRRR.",
    "R......R",
    "NyOyOyON",
    "NNNNNNNN",
    "NNNNNNNN",
    "NNNNNNNN",
    "........",
    "........"])

spr('arrow_up', [
    "...66...",
    "..6666..",
    ".66..66.",
    "6.6666.6",
    "...66...",
    "...66...",
    "...66...",
    "........"])

# ----- water -------------------------------------------------------------
spr('water', [
    "bbbbbbbb",
    "bBBbbbbb",
    "bbbbbBBb",
    "bbbbbbbb",
    "bBBbbbbb",
    "bbbbbBBb",
    "bbbbbbbb",
    "bBBbbbbb"])

spr('water2', [
    "bbbbbbbb",
    "bbbbBBbb",
    "bBbbbbbb",
    "bbbbbbBb",
    "bbbBBbbb",
    "bbbbbbbb",
    "bBbbbbBb",
    "bbbbbbbb"])

# ----- furniture and holes ----------------------------------------------

spr('chair', [
    "........",
    "..nnn...",
    "..nkn...",
    "..nkn...",
    ".nnnnn..",
    ".n...n..",
    ".n...n..",
    "........"])

spr('hole', [
    "00000000",
    "00000000",
    "00000000",
    "00000000",
    "00000000",
    "00000000",
    "00000000",
    "00000000"])

# cracked flagstones, drawn over the floor around a hole
spr('crack', [
    "....0...",
    "...0....",
    "..0.....",
    "..0.0...",
    ".0...0..",
    "0.....0.",
    "........",
    "...0...."])

spr('crack2', [
    "........",
    ".....0..",
    "....0...",
    "...0....",
    "..0..0..",
    ".0....0.",
    "0.......",
    "......0."])

spr('crack3', [
    "...0....",
    "...0....",
    "..0.0...",
    ".0...0..",
    "0.....0.",
    ".......0",
    "..0.....",
    ".0......"])

spr('crack4', [
    "......0.",
    ".....0..",
    "..0..0..",
    "..0.0...",
    ".0.0....",
    "0.0.....",
    "....0...",
    "...0...."])

# ----- the holy pool: bright water inside a course of dressed stone -----
spr('holy', [
    "c7cccccc",
    "cccc7ccc",
    "cc7ccccc",
    "ccccccc7",
    "c7cccccc",
    "ccccc7cc",
    "cc7ccccc",
    "cccccc7c"])

spr('holy2', [
    "cccc7ccc",
    "cc7ccccc",
    "ccccccc7",
    "c7cccccc",
    "ccccc7cc",
    "c7cccccc",
    "cccccc7c",
    "cc7ccccc"])

spr('kerb', [
    "55555555",
    "56666665",
    "54444445",
    "54344345",
    "54344345",
    "54444445",
    "56666665",
    "55555555"])

# ----- flying arrows (one per facing) ------------------------------------
spr('arrow_e', [
    "........",
    "........",
    ".6..W...",
    "66666WW.",
    ".6..W...",
    "........",
    "........",
    "........"])
spr('arrow_w', [
    "........",
    "........",
    "...W..6.",
    ".WW66666",
    "...W..6.",
    "........",
    "........",
    "........"])
spr('arrow_n', [
    "..6.6...",
    "....W...",
    "...WWW..",
    "....W...",
    "....6...",
    "....6...",
    "....6...",
    "........"])
spr('arrow_s', [
    "....6...",
    "....6...",
    "....6...",
    "....W...",
    "...WWW..",
    "....W...",
    "..6.6...",
    "........"])

# taller than the short bow, and drawn deeper
spr('bow_long', [
    "...nn...",
    "..n66n..",
    ".n6..6n.",
    "n6....6n",
    "n6....6n",
    ".n6..6n.",
    "..n66n..",
    "...nn..."])

spr('crossbow', [
    "........",
    "N.....N.",
    ".N...N..",
    "..N4N...",
    "444444..",
    "..NnN...",
    "...n....",
    "........"])

# defined twice: the later art at the earlier cell, kept as it was
spr('bolt', [
    "........",
    "....yy..",
    "...yy...",
    "..yyyy..",
    "..yy....",
    ".yy.....",
    "........",
    "........"])

# The second spark, for the current running through water.  Painted in the
# blues the first one is painted in rather than in the yellow of a crossbow
# bolt, so the two sit together in a pool - the fork is arranged
# differently, which is the point of having a second one at all.
spr('bolt2', [
    "B.c.B.cB",
    ".BWcWB..",
    "cB.Bc.Bc",
    "..BcWB..",
    "BcB.BcB.",
    ".BWcWB.c",
    "cB...B.B",
    "..B...B."])

# ----- flying crossbow bolts (one per facing) ---------------------------
spr('bolt_e', [
    "........",
    "........",
    "....6...",
    ".44446WW",
    "....6...",
    "........",
    "........",
    "........"])
spr('bolt_w', [
    "........",
    "........",
    "...6....",
    "WW64444.",
    "...6....",
    "........",
    "........",
    "........"])
spr('bolt_n', [
    "...WW...",
    "...66...",
    "..6..6..",
    "...4....",
    "...4....",
    "...4....",
    "...4....",
    "........"])
spr('bolt_s', [
    "...4....",
    "...4....",
    "...4....",
    "...4....",
    "..6..6..",
    "...66...",
    "...WW...",
    "........"])

# ----- a small pointer for the item menu --------------------------------
spr('point', [
    "........",
    "..y.....",
    "..yy....",
    "..yyy...",
    "..yyy...",
    "..yy....",
    "..y.....",
    "........"])

# ----- awareness markers -------------------------------------------------
# 3x5 glyphs on a solid dark plate so they read over any tile behind them
spr('mk_z', [
    ".00000..",
    ".0ccc0..",
    ".000c0..",
    ".00c00..",
    ".0c000..",
    ".0ccc0..",
    ".00000..",
    "........"])

spr('mk_q', [
    ".00000..",
    ".0yyy0..",
    ".000y0..",
    ".00yy0..",
    ".00000..",
    ".00y00..",
    ".00000..",
    "........"])

spr('mk_x', [
    ".00000..",
    ".00R00..",
    ".00R00..",
    ".00R00..",
    ".00000..",
    ".00R00..",
    ".00000..",
    "........"])

spr('mk_ally', [
    ".00000..",
    ".00000..",
    ".00e00..",
    ".0eee0..",
    ".00e00..",
    ".00000..",
    ".00000..",
    "........"])

spr('crystal', [
    "...cc...",
    "..c77c..",
    ".c7WW7c.",
    "c7WccW7c",
    "c7WccW7c",
    ".c7WW7c.",
    "..c77c..",
    "...cc..."])

# ----- conjured barriers -------------------------------------------------
spr('ice_wall', [
    "BBcBBBcB",
    "BcBBBcBB",
    "BBBBcBBB",
    "BcBBBBBB",
    "BBBcBBcB",
    "BcBBBBBB",
    "BBBBcBBB",
    "BBcBBBcB"])

spr('fire_wall', [
    "..R..R..",
    ".RyR.RyR",
    "RyORyOyR",
    "ROyOOyOR",
    "ROOOOOOR",
    "RoOOOOoR",
    "roooooor",
    "rrrrrrrr"])

# ----- keyhole overlay for a locked door ---------------------------------
spr('keyhole', [
    "........",
    "........",
    "...77...",
    "..7007..",
    "..7007..",
    "...70...",
    "...70...",
    "........"])

# ----- material sets: doors, keys and chests -----------------------------
# d = dark, m = mid, l = light, h = handle / lock highlight
MATERIALS = [
    ('wood',    'n', 'N', 'k', 'y'),
    ('bronze',  'o', 'N', 'O', 'y'),
    ('iron',    '2', '4', '6', '7'),
    ('silver',  '4', '6', '7', 'c'),
    ('gold',    'o', 'O', 'y', '7'),
    ('crystal', 'b', 'B', 'c', '7'),
]

def sub(rows, d, m, l, h):
    out = []
    for r in rows:
        out.append(r.replace('D', d).replace('M', m).replace('L', l).replace('H', h))
    return out

DOOR_T = [
    "22222222",
    "2DMMMMD2",
    "2DMLLMD2",
    "2DMLLMD2",
    "2DMLLHD2",
    "2DMLLMD2",
    "2DMMMMD2",
    "22222222"]

KEY_T = [
    "........",
    ".MMM....",
    "M..DM...",
    "M..DMMMM",
    "M...M..L",
    ".MMM..LL",
    "........",
    "........"]

CHEST_T = [
    "........",
    ".MMMMMM.",
    "MMMMMMMM",
    "MMMLLMMM",
    "nnnLLnnn",
    "nNNNNNNn",
    "nNNNNNNn",
    "........"]

for (nm, d, m, l, h) in MATERIALS:
    spr('door_' + nm, sub(DOOR_T, d, m, l, h))
    spr('key_' + nm, sub(KEY_T, d, m, l, h))
    spr('chest_' + nm, sub(CHEST_T, d, m, l, h))

# ----- hero --------------------------------------------------------------
spr('hero', [
    "..6666..",
    ".67ss76.",
    ".6s00s6.",
    "..BBBB..",
    ".BBBBBB.",
    "6BBBBBB6",
    "..B..B..",
    "..n..n.."])

spr('hero2', [
    "..6666..",
    ".67ss76.",
    ".6s00s6.",
    "..BBBB..",
    ".BBBBBB.",
    "6BBBBBB6",
    "...BB...",
    "..n..n.."])

spr('grave', [
    "..6666..",
    ".666666.",
    ".622226.",
    ".622226.",
    ".666666.",
    "..6666..",
    ".GGGGGG.",
    "GGGGGGGG"])

# ----- monsters A..Z -----------------------------------------------------
spr('mon_A', [   # aquator
    "........",
    "..BBBB..",
    ".BbbbbB.",
    "B7bbbb7B",
    "BbbbbbbB",
    "Bb7bb7bB",
    ".BbbbbB.",
    "..B..B.."])

spr('mon_B', [   # bat
    "........",
    "........",
    "4.4554.4",
    "44455444",
    ".4R55R4.",
    "..5555..",
    "...55...",
    "........"])

spr('mon_C', [   # centaur
    "...ss...",
    "..s7s...",
    ".NsssN..",
    "..NNN...",
    ".NNNNNN.",
    ".NNNNNN.",
    ".N.NN.N.",
    ".N.NN.N."])

spr('mon_D', [   # dragon
    "........",
    "..eeee..",
    ".eeeeee.",
    "eRe..eRe",
    "eeeeeeee",
    "e7e77e7e",
    ".eeeeee.",
    "..e..e.."])

spr('mon_E', [   # spider - pale legs, so it reads on a dark floor
    "5..55..5",
    ".5.55.5.",
    "..5665..",
    "5.6776.5",
    ".566665.",
    "..6556..",
    ".5.55.5.",
    "5..55..5"])

spr('mon_F', [   # venus flytrap
    ".e....e.",
    ".ee..ee.",
    ".e7e.e7e",
    ".eeeeee.",
    "..eeee..",
    "...gg...",
    "..g.gg..",
    "..ggggg."])

spr('mon_G', [   # griffin
    "...yy...",
    "..y77y..",
    ".yyOyy..",
    ".6yyyy6.",
    "66NNNN66",
    ".NNNNNN.",
    ".N.NN.N.",
    ".y.yy.y."])

spr('mon_H', [   # hobgoblin
    "..o..o..",
    "..oooo..",
    ".o7oo7o.",
    "..oooo..",
    ".RRRRRR.",
    "RRRRRRRR",
    "..R..R..",
    "..n..n.."])

spr('mon_I', [   # ice monster
    "..c..c..",
    ".cccccc.",
    "c7cccc7c",
    "cccccccc",
    ".cccccc.",
    "..cccc..",
    ".c.cc.c.",
    ".c....c."])

spr('mon_J', [   # jabberwock
    ".P....P.",
    ".PPPPPP.",
    "P7PPPP7P",
    "PP7777PP",
    ".PPPPPP.",
    "PPPPPPPP",
    ".P.PP.P.",
    ".P....P."])

spr('mon_K', [   # rat - pale grey, so it shows on a grey floor it must
    "........",
    "4......4",
    ".44..44.",
    "4555554.",
    "45555554",
    "455555R6",
    ".4.4.4..",
    "........"])

spr('mon_L', [   # leprechaun
    ".GGGGG..",
    ".GGGGG..",
    "..sss...",
    "..s7s...",
    ".eeeee..",
    ".eeeee..",
    "..n.n...",
    "..y.y..."])

spr('mon_M', [   # medusa
    "e.e.e.e.",
    ".eeeeee.",
    ".s7ss7s.",
    ".ssssss.",
    "..ssss..",
    ".eeeeee.",
    "..eeee..",
    "..e..e.."])

spr('mon_N', [   # nymph
    "..kkkk..",
    ".kssssk.",
    ".s7ss7s.",
    "..ssss..",
    ".mmmmmm.",
    ".mmmmmm.",
    "..s..s..",
    "..s..s.."])

spr('mon_O', [   # orc
    "..gGGg..",
    ".G7GG7G.",
    ".GG77GG.",
    ".GGGGGG.",
    "RGGGGGGR",
    ".GGGGGG.",
    "..G..G..",
    "..n..n.."])

spr('mon_P', [   # phantom
    "..6666..",
    ".666666.",
    "66066066",
    "66666666",
    "66666666",
    "6.6666.6",
    "6.6.6.6.",
    "........"])

spr('mon_Q', [   # quagga
    "...666..",
    "..67.6..",
    "...66...",
    ".666666.",
    ".606060.",
    ".666666.",
    ".6.66.6.",
    ".6.66.6."])

spr('mon_R', [   # rattlesnake
    "........",
    "..RRRR..",
    ".R....R.",
    "R..RR..R",
    "R.R77R.R",
    "R..RR..R",
    ".RRRRRy.",
    "......y."])

spr('mon_S', [   # snake
    "..eeee..",
    ".e....e.",
    ".e......",
    "..eee...",
    ".....e..",
    "e7....e.",
    ".eeeee..",
    "........"])

spr('mon_T', [   # troll
    "..GGGG..",
    ".G7GG7G.",
    ".GGGGGG.",
    "GGGGGGGG",
    "GGGGGGGG",
    "G.GGGG.G",
    "..G..G..",
    "..n..n.."])

spr('mon_U', [   # ur-vile
    "..pppp..",
    ".pRppRp.",
    ".pppppp.",
    "pp.pp.pp",
    ".pppppp.",
    ".p.pp.p.",
    ".p.pp.p.",
    "p......p"])

spr('mon_V', [   # vampire
    "..7777..",
    ".7s77s7.",
    ".sR..Rs.",
    "..ssss..",
    ".r0000r.",
    "r000000r",
    ".r0000r.",
    "..r..r.."])

spr('mon_W', [   # wraith
    "..3333..",
    ".3c33c3.",
    ".333333.",
    "33333333",
    ".333333.",
    ".3.33.3.",
    "..3..3..",
    "........"])

spr('mon_X', [   # xeroc (mimic)
    "........",
    ".RRRRRR.",
    "RR7RR7RR",
    "RRRRRRRR",
    "NN7777NN",
    "NNNNNNNN",
    "NNNNNNNN",
    "........"])

spr('mon_Y', [   # yeti
    "..7777..",
    ".7b77b7.",
    ".777777.",
    "77777777",
    "77777777",
    "7.7777.7",
    "..7..7..",
    "..6..6.."])

spr('mon_Z', [   # zombie
    "..gggg..",
    ".g7gg7g.",
    ".gg..gg.",
    ".gggggg.",
    "gggggggg",
    "gg.gg.gg",
    "..g..g..",
    "..n..n.."])

# ----- fx / ui -----------------------------------------------------------

spr('mon_h', [   # half dragon
    "..e..e..",
    "..eeee..",
    ".eR77e..",
    "eeeeeeO.",
    ".eeeee..",
    ".e.e.e..",
    ".e...e..",
    "n.....n."])

# Going somewhere else without walking there: three frames, a spark
# opening out into a burst and back to a scatter.
spr('flash1', [
    "........",
    "...7....",
    "........",
    "..7.7...",
    "........",
    "...7....",
    "........",
    "........"])

spr('flash2', [
    "...7....",
    ".7.6.7..",
    "..666...",
    "76677 7.".replace(' ', '6'),
    "..666...",
    ".7.6.7..",
    "...7....",
    "........"])

spr('flash3', [
    ".7....7.",
    "..6..6..",
    "...66...",
    "..6776..",
    "...66...",
    "..6..6..",
    ".7....7.",
    "........"])

spr('mon_k', [   # witch - the hat first, so she reads at a glance
    "...p....",
    "..ppp...",
    ".ppppp..",
    "..sss...",
    ".pspsp..",
    "..ppp...",
    "..p.p...",
    ".G...G.."])

spr('mon_w', [   # web spinner
    "........",
    "..6..6..",
    "6.7667.6",
    ".66666..",
    "6666666.",
    ".6.66.6.",
    "6..66..6",
    "........"])

spr('web', [
    "6..6..6.",
    ".6.6.6..",
    "..666...",
    "66666666",
    "..666...",
    ".6.6.6..",
    "6..6..6.",
    "........"])

spr('flame', [
    "........",
    "...R....",
    "..RyR...",
    ".RyyyR..",
    ".RyOyR..",
    "..RyR...",
    "...R....",
    "........"])

# A third tile for a fire, so a flame has three pictures to move through
# rather than two to switch between.  Placeholder art in the same reds and
# yellows as the sheet of flame beside it: a middling flame leaning the
# other way, so the three read wide, narrow, leaning.
spr('flame2', [
    "...RR...",
    "..RoOR..",
    ".RoOOR..",
    ".RoOyOR.",
    "RoOyyOR.",
    "RoOyOR..",
    ".RRoOR..",
    "..RRR..."])

spr('frost', [
    "........",
    "...c....",
    ".c.c.c..",
    "..ccc...",
    ".ccccc..",
    "..ccc...",
    ".c.c.c..",
    "...c...."])

spr('magic', [
    "........",
    "...P....",
    "..PPP...",
    ".PPcPP..",
    "..PPP...",
    "...P....",
    "........",
    "........"])

spr('pan_cross', [
    "...7....",
    "..777...",
    "...7....",
    ".7.7.7..",
    "7777777.",
    ".7.7.7..",
    "...7....",
    "..777..."])

# The mouse pointer, drawn by the game at its own resolution: the browser's
# cursor is hidden over the canvas so the arrow is a sprite like everything
# else, and stays square however far the picture is blown up.  The point of
# it is the top-left pixel.
#
# Only the top-left MOUSE_PX square of the cell is ever drawn - a whole
# 8x8 of arrow is the size of a monster - so keep the arrow inside those
# five pixels.  The pack on mouse_get rides in the rest of the top row,
# which is drawn with it.
spr('mouse', [
    "7.......",
    "7w7.....",
    "7ww7....",
    "7w777...",
    "77......",
    "........",
    "........",
    "........"])

# and the same arrow with a small pack beside it, shown where a click
# would pick something up
spr('mouse_get', [
    "7....kk.",
    "7w7.k77k",
    "7ww7kkkk",
    "7w777k7k",
    "77...kkk",
    "........",
    "........",
    "........"])

spr('cursor', [
    "77....77",
    "7......7",
    "........",
    "........",
    "........",
    "........",
    "7......7",
    "77....77"])

spr('heart', [
    "........",
    ".RR..RR.",
    "RRRRRRRR",
    "RRRRRRRR",
    ".RRRRRR.",
    "..RRRR..",
    "...RR...",
    "........"])

# ----- appended after the sheet was first laid out, so every earlier
# ----- sprite keeps the cell it already had
spr('stone', [
    "........",
    "..444...",
    ".45544..",
    ".45554..",
    ".44554..",
    "..444...",
    "........",
    "........"])

spr('stone_blast', [
    "........",
    "..RRR...",
    ".R4y4R..",
    ".Ry7yR..",
    ".R4y4R..",
    "..RRR...",
    "........",
    "........"])

spr('stone_slow', [
    "........",
    "..ccc...",
    ".c4B4c..",
    ".cB7Bc..",
    ".c4B4c..",
    "..ccc...",
    "........",
    "........"])

spr('stone_return', [
    "........",
    "..GGG...",
    ".G4e4G..",
    ".Ge7eG..",
    ".G4e4G..",
    "..GGG...",
    "........",
    "........"])

spr('stone_fire', [
    "........",
    "..OOO...",
    ".O4R4O..",
    ".OR7RO..",
    ".O4R4O..",
    "..OOO...",
    "........",
    "........"])

spr('stone_ice', [
    "........",
    "..777...",
    ".747c7..",
    ".7c6c7..",
    ".747c7..",
    "..777...",
    "........",
    "........"])

# A stone with a current in it: a forked line, the way lightning is drawn.
spr('stone_shock', [
    "........",
    "..777...",
    ".74c47..",
    ".7cyc7..",
    ".74c47..",
    "..777...",
    "........",
    "........"])

spr('pin', [
    "........",
    "...PP...",
    "..P77P..",
    "..P7PP..",
    "...PP...",
    "....P...",
    "....P...",
    "....P..."])

# a red stick with a lit fuse: the only thing in the game that moves rock
spr('dynamite', [
    "......y.",
    ".....y..",
    "..RRR...",
    "..RnR...",
    "..RRR...",
    "..RnR...",
    "..RRR...",
    "........"])

# frozen solid: a block of ice with the light catching two facets
spr('icecube', [
    "cccccccc",
    "cwwccccc",
    "cwcccccc",
    "cccccccB",
    "ccccccBB",
    "cBcccccB",
    "cBBccccB",
    "BBBBBBBB"])

# iron bars: you see the room beyond, you just cannot reach it
spr('bars', [
    "wWw.wWw.",
    ".w.w.w.w",
    "wWw.wWw.",
    ".w.w.w.w",
    "wWw.wWw.",
    ".w.w.w.w",
    "wWw.wWw.",
    ".w.w.w.w"])

# A bridge: planks laid crosswise over whatever is underneath, with a
# dark rail down the two sides you walk between.  The two outer rows are
# left clear so the water - or the drop - shows past the sides of it and
# the stream reads as running underneath rather than stopping at each
# end of the planks.  Two of them, because a
# bridge over a stream running north-south is crossed east-west.
spr('bridge_h', [
    "........",
    "nnnnnnnn",
    "kNkNkNkN",
    "kNkNkNkN",
    "kNkNkNkN",
    "kNkNkNkN",
    "nnnnnnnn",
    "........"])

spr('bridge_v', [
    ".nkkkkn.",
    ".nNNNNn.",
    ".nkkkkn.",
    ".nNNNNn.",
    ".nkkkkn.",
    ".nNNNNn.",
    ".nkkkkn.",
    ".nNNNNn."])

# A throwing dagger: a leaf blade with no crossguard and a wrapped grip,
# so it reads apart from the plain dagger at a glance.
spr('dagger_throw', [
    "...W....",
    "..WWW...",
    "..WWW...",
    "..WWW...",
    "...W....",
    "..nNn...",
    "..nNn...",
    "...k...."])

# ----- a rug ------------------------------------------------------------
# A Persian rug, painted 4 tiles wide and 6 tall and folded in half twice:
# the left half is the mirror of the right and the top half the mirror of
# the bottom, so the whole of it is these six tiles and the drawing turns
# them over as it lays them.  Which of them a rug of a given size is cut
# from is RUG_CUT in part1_core.js.
#
# Row 0 is the border, row 1 the field between border and medallion, row 2
# the middle of the medallion.  Column 0 is the border and column 1 the
# middle of a four-wide rug - but a three-wide rug has a middle column of
# its own, which is never mirrored because it is its own reflection, and
# that is column 'c'.
spr('rug_00', [
    "jqjqjqjq",
    "qQqQqQqQ",
    "jqQjjQJj",
    "qQjJQjjJ",
    "jqjQJQQQ",
    "qQQjQjJj",
    "jqJjQJqq",
    "qQjJQjqq"])

spr('rug_01', [
    "jqjqjqjq",
    "qQqQqQqj",
    "jQJJQjjq",
    "QJjjJQJQ",
    "JqQQQQqJ",
    "qjqjqjJj",
    "qjqqqjqq",
    "jjqjjqqq"])

spr('rug_10', [
    "jqjQQqqj",
    "qQQJqjjj",
    "jqJjQqqq",
    "qQJjQjqj",
    "jqQJQJqj",
    "qQjQQjjq",
    "jqjJQJqQ",
    "qjQQQjqq"])

spr('rug_11', [
    "qqjqqqqq",
    "qqjqQqqj",
    "jjjqqqjJ",
    "qqqqqjqQ",
    "qqjqqjJQ",
    "qjqjqqjq",
    "qqjqqqqj",
    "qqqqqqqq"])

spr('rug_20', [
    "jqjJQqqq",
    "qQQJQjqj",
    "jqjQJqqq",
    "qQQjQjqq",
    "jqQjQqqQ",
    "qQjQQjqq",
    "jqQJqqqq",
    "qQjQJjqq"])

spr('rug_21', [
    "jqqQqqqj",
    "qjqqqqjq",
    "jqqqqJjQ",
    "qqqjjjJq",
    "qqqjqJQj",
    "qqJjJqjq",
    "qjjJQjQJ",
    "jQqqjqqQ"])

# The middle column of a three-wide rug.  It is laid down the spine of the
# rug and mirrored only top to bottom, so unlike every other tile it is
# never turned over left to right.
spr('rug_0c', [
    "qjqjjqjq",
    "jqQqqQqj",
    "qjjQQjjq",
    "QJQJJQJQ",
    "JqQQQQqJ",
    "jJjqqjJj",
    "qqjqqjqq",
    "qqqjjqqq"])

spr('rug_1c', [
    "qqqqqqqq",
    "QqqjjqqQ",
    "qqjqqjqq",
    "qjJQQJjq",
    "qjqQQqjq",
    "qqjJJjqq",
    "qqqjjqqq",
    "qqqqqqqq"])

spr('rug_2c', [
    "qqqjjqqq",
    "qqjqQjqq",
    "qJjQqjJq",
    "qjJqqJjq",
    "JjQjjQjJ",
    "jqjqqjqj",
    "jjQJJQjj",
    "jqJQQJqj"])

# The middle row of a rug woven an odd number of tiles tall - three, five,
# seven - where the pattern has to stand on its own rather than fold
# against its twin.  It goes in the inner columns; the border column of
# that row is the medallion's own outer tile, and a three-wide rug has
# its spine there instead.
spr('rug_c1', [
    "qqqqqqqj",
    "qqqqqqjq",
    "qqqqqjqJ",
    "qQjqjqJQ",
    "qjJqjqJQ",
    "qqqqqjqJ",
    "qqqqqqjq",
    "qqqqqqqj"])

# ---------------------------------------------------------------- font 5x7
F = {}
def gl(ch, s):
    rows = s.split(',')
    assert len(rows) == 7, ch
    for r in rows:
        assert len(r) == 5, (ch, r)
    F[ch] = rows

gl(' ', "00000,00000,00000,00000,00000,00000,00000")
gl('!', "00100,00100,00100,00100,00100,00000,00100")
gl('"', "01010,01010,00000,00000,00000,00000,00000")
gl('#', "01010,01010,11111,01010,11111,01010,01010")
gl('$', "00100,01111,10100,01110,00101,11110,00100")
gl('%', "11000,11001,00010,00100,01000,10011,00011")
gl('&', "01100,10010,10100,01000,10101,10010,01101")
gl("'", "00100,00100,00000,00000,00000,00000,00000")
gl('(', "00010,00100,01000,01000,01000,00100,00010")
gl(')', "01000,00100,00010,00010,00010,00100,01000")
gl('*', "00000,00100,10101,01110,10101,00100,00000")
gl('+', "00000,00100,00100,11111,00100,00100,00000")
gl(',', "00000,00000,00000,00000,00110,00100,01000")
gl('-', "00000,00000,00000,11111,00000,00000,00000")
gl('.', "00000,00000,00000,00000,00000,00110,00110")
gl('/', "00001,00010,00010,00100,01000,01000,10000")
gl('0', "01110,10001,10011,10101,11001,10001,01110")
gl('1', "00100,01100,00100,00100,00100,00100,01110")
gl('2', "01110,10001,00001,00010,00100,01000,11111")
gl('3', "11111,00010,00100,00010,00001,10001,01110")
gl('4', "00010,00110,01010,10010,11111,00010,00010")
gl('5', "11111,10000,11110,00001,00001,10001,01110")
gl('6', "00110,01000,10000,11110,10001,10001,01110")
gl('7', "11111,10001,00001,00010,00100,00100,00100")
gl('8', "01110,10001,10001,01110,10001,10001,01110")
gl('9', "01110,10001,10001,01111,00001,00010,01100")
gl(':', "00000,00110,00110,00000,00110,00110,00000")
gl(';', "00000,00110,00110,00000,00110,00100,01000")
gl('<', "00010,00100,01000,10000,01000,00100,00010")
gl('=', "00000,00000,11111,00000,11111,00000,00000")
gl('>', "01000,00100,00010,00001,00010,00100,01000")
gl('?', "01110,10001,00001,00010,00100,00000,00100")
gl('@', "01110,10001,00001,01101,10101,10101,01110")
gl('A', "01110,10001,10001,10001,11111,10001,10001")
gl('B', "11110,10001,10001,11110,10001,10001,11110")
gl('C', "01110,10001,10000,10000,10000,10001,01110")
gl('D', "11100,10010,10001,10001,10001,10010,11100")
gl('E', "11111,10000,10000,11110,10000,10000,11111")
gl('F', "11111,10000,10000,11110,10000,10000,10000")
gl('G', "01110,10001,10000,10111,10001,10001,01111")
gl('H', "10001,10001,10001,11111,10001,10001,10001")
gl('I', "01110,00100,00100,00100,00100,00100,01110")
gl('J', "00111,00010,00010,00010,00010,10010,01100")
gl('K', "10001,10010,10100,11000,10100,10010,10001")
gl('L', "10000,10000,10000,10000,10000,10000,11111")
gl('M', "10001,11011,10101,10101,10001,10001,10001")
gl('N', "10001,10001,11001,10101,10011,10001,10001")
gl('O', "01110,10001,10001,10001,10001,10001,01110")
gl('P', "11110,10001,10001,11110,10000,10000,10000")
gl('Q', "01110,10001,10001,10001,10101,10010,01101")
gl('R', "11110,10001,10001,11110,10100,10010,10001")
gl('S', "01111,10000,10000,01110,00001,00001,11110")
gl('T', "11111,00100,00100,00100,00100,00100,00100")
gl('U', "10001,10001,10001,10001,10001,10001,01110")
gl('V', "10001,10001,10001,10001,10001,01010,00100")
gl('W', "10001,10001,10001,10101,10101,11011,10001")
gl('X', "10001,10001,01010,00100,01010,10001,10001")
gl('Y', "10001,10001,01010,00100,00100,00100,00100")
gl('Z', "11111,00001,00010,00100,01000,10000,11111")
gl('[', "01110,01000,01000,01000,01000,01000,01110")
gl('\\', "10000,01000,01000,00100,00010,00010,00001")
gl(']', "01110,00010,00010,00010,00010,00010,01110")
gl('^', "00100,01010,10001,00000,00000,00000,00000")
gl('_', "00000,00000,00000,00000,00000,00000,11111")
gl('`', "01000,00100,00000,00000,00000,00000,00000")
gl('a', "00000,00000,01110,00001,01111,10001,01111")
gl('b', "10000,10000,11110,10001,10001,10001,11110")
gl('c', "00000,00000,01111,10000,10000,10001,01110")
gl('d', "00001,00001,01111,10001,10001,10001,01111")
gl('e', "00000,00000,01110,10001,11111,10000,01110")
gl('f', "00110,01001,01000,11100,01000,01000,01000")
gl('g', "00000,01111,10001,10001,01111,00001,01110")
gl('h', "10000,10000,11110,10001,10001,10001,10001")
gl('i', "00100,00000,01100,00100,00100,00100,01110")
gl('j', "00010,00000,00110,00010,00010,10010,01100")
gl('k', "10000,10000,10010,10100,11000,10100,10010")
gl('l', "01100,00100,00100,00100,00100,00100,01110")
gl('m', "00000,00000,11010,10101,10101,10101,10101")
gl('n', "00000,00000,11110,10001,10001,10001,10001")
gl('o', "00000,00000,01110,10001,10001,10001,01110")
gl('p', "00000,11110,10001,10001,11110,10000,10000")
gl('q', "00000,01111,10001,10001,01111,00001,00001")
gl('r', "00000,00000,10110,11001,10000,10000,10000")
gl('s', "00000,00000,01111,10000,01110,00001,11110")
gl('t', "01000,01000,11100,01000,01000,01001,00110")
gl('u', "00000,00000,10001,10001,10001,10011,01101")
gl('v', "00000,00000,10001,10001,10001,01010,00100")
gl('w', "00000,00000,10001,10001,10101,10101,01010")
gl('x', "00000,00000,10001,01010,00100,01010,10001")
gl('y', "00000,10001,10001,10001,01111,00001,01110")
gl('z', "00000,00000,11111,00010,00100,01000,11111")
gl('{', "00010,00100,00100,01000,00100,00100,00010")
gl('|', "00100,00100,00100,00100,00100,00100,00100")
gl('}', "01000,00100,00100,00010,00100,00100,01000")
gl('~', "00000,00000,01000,10101,00010,00000,00000")

# ---------------------------------------------------------------- build
COLS = 16

# The order the sprites are laid out in, declared here rather than left to
# fall out of the order they happen to be defined in.  Anything defined
# above and not listed here is dropped: the game never draws it, and a
# cell that holds nothing is a cell somebody has to scroll past.
#
# Adding a sprite means adding it to its group below.  The build refuses
# to run if anything is defined and unplaced, or placed and undefined, so
# neither can be forgotten.
LAYOUT = [
    ('ground',    ['void', 'floor', 'floor2', 'floor3', 'corr',
                   'wall', 'wall2', 'wall3', 'wall_moss',
                   'water', 'water2', 'holy', 'holy2', 'hole',
                   'bridge_h', 'bridge_v', 'bars', 'kerb']),

    ('ways',      ['stairs_down', 'stairs_up', 'trapdoor', 'keyhole', 'ice_wall', 'fire_wall',
                   'door_wood', 'door_bronze', 'door_iron',
                   'door_silver', 'door_gold', 'door_crystal']),

    # three tiles for the middle of a patch, then the two for its edge
    ('scenery',   ['moss', 'moss_b', 'moss2', 'moss3', 'moss4',
                   'crack', 'crack2', 'crack3', 'crack4',
                   'bones', 'skull', 'web',
                   'rubble', 'table', 'chair', 'barrel',
                   'trap', 'trap_dart', 'trap_gas', 'trap_pit']),

    # ten tiles, folded twice: see the rug block above
    ('rugs',      ['rug_00', 'rug_01', 'rug_0c', 'rug_10', 'rug_11', 'rug_1c',
                   'rug_20', 'rug_21', 'rug_2c', 'rug_c1']),

    ('chests',    ['chest', 'chest_open', 'pouch',
                   'chest_wood', 'chest_bronze', 'chest_iron',
                   'chest_silver', 'chest_gold', 'chest_crystal',
                   'key_wood', 'key_bronze', 'key_iron',
                   'key_silver', 'key_gold', 'key_crystal']),

    ('treasure',  ['gold', 'gold2', 'amulet', 'crystal', 'pin', 'dynamite',
                   'food', 'fruit', 'mushroom', 'mush_b', 'mush_y',
                   'mush_p', 'mush_g', 'berries',
                   'scroll', 'wand', 'wand2', 'wand3', 'staff', 'staff2',
                   'ring_b', 'ring_g', 'ring_r', 'ring_c', 'ring_y', 'ring_p',
                   'ring_m', 'ring_o', 'ring_n']),

    ('potions',   ['pot_r', 'pot_b', 'pot_g', 'pot_y',
                   'pot_p', 'pot_c', 'pot_w', 'pot_o']),

    ('arms',      ['sword', 'dagger', 'dagger_throw', 'mace', 'axe', 'spear',
                   'bow', 'bow_long', 'crossbow', 'arrow', 'bolt', 'bolt2',
                   'stone', 'stone_blast', 'stone_slow', 'stone_return',
                   'stone_fire', 'stone_ice', 'stone_shock']),

    ('armour',    ['armor_l', 'armor_c', 'armor_p', 'armor_glass',
                   'shield', 'shield2', 'shield3',
                   'cap', 'helm', 'crown',
                   'boots', 'sandals', 'ironboots']),

    ('creatures', ['hero', 'hero2', 'grave'] +
                  ['mon_' + c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] +
                  # the alphabet ran out, so newer creatures use lower case
                  ['mon_' + c for c in 'hwk']),

    # the crossbow bolt doubles as the lightning streak 
    ('effects',   ['flame', 'flame2', 'frost', 'magic', 'gas', 'icecube',
                   'flash1', 'flash2', 'flash3']),

    ('interface', ['mouse', 'mouse_get', 'cursor', 'point', 'heart', 'pan_cross',
                   'mk_z', 'mk_q', 'mk_x', 'mk_ally']),

    # Added last on purpose.  Every group above it keeps the cells it was
    # painted in, so a sheet painted before the vials existed is still
    # correct everywhere it has anything painted - see migrate_sheet.
    ('vials',     ['vial_g', 'vial_k', 'vial_p', 'vial_w',
                   'vial_r', 'vial_y', 'vial_b', 'ice', 'slime', 'rubble2']),
]

# Sprites deliberately taken out of the game altogether - the definition
# above is gone as well as the placement, so there is nothing left to
# notice their absence.  A name listed here is retired on purpose and the
# check further down lets it go; a name that vanishes without being
# listed here still stops the build, which is the whole point of that
# check.  The old rug was nine pieces cut for a nine-slice; the Persian
# rug that replaced it is six tiles laid mirrored, so none of the nine
# has anywhere to go.
RETIRED = ['rug_nw', 'rug_n', 'rug_ne', 'rug_w', 'rug_c', 'rug_c2',
           'rug_e', 'rug_sw', 'rug_s', 'rug_se']

names = []
for _group, _members in LAYOUT:
    names.extend(_members)

# nothing placed twice, nothing defined and forgotten, nothing listed and
# never drawn
_dupes = sorted(n for n in set(names) if names.count(n) > 1)
if _dupes:
    raise SystemExit('placed more than once: %s' % ', '.join(_dupes))
_missing = [n for n in names if n not in S]
if _missing:
    raise SystemExit('placed but never drawn: %s' % ', '.join(_missing))
_dropped = sorted([n for n in S if n not in names] + RETIRED)
if _dropped:
    print('dropped (never drawn by the game):', ', '.join(_dropped))

rows_needed = (len(names) + COLS - 1) // COLS
TILE_H = rows_needed * 8

# The glyphs live in their own module so the font can be swapped without
# touching the sprite sheet.
from font_everyday import FONT, CELL_W, CELL_H
F = {ch: rows.split(',') for ch, (adv, rows) in FONT.items()}
ADV = {ch: adv for ch, (adv, rows) in FONT.items()}
GLYPH_W, GLYPH_H = CELL_W, CELL_H

# Two letters that draw the same pixels are a bug you only notice when a
# word looks wrong, so refuse to build an atlas that contains any.
_seen = {}
for _ch, _rows in sorted(F.items()):
    for _r in _rows:
        assert len(_r) == GLYPH_W, (_ch, _r)
    assert len(_rows) == GLYPH_H, _ch
    # the renderer copies only a glyph's advance width, so no ink may
    # stray past it
    for _r in _rows:
        _last = _r.rfind('1')
        assert _last < ADV[_ch], ('ink past the advance', _ch, ADV[_ch], _r)
    _key = ''.join(_rows)
    if _ch == ' ':
        continue
    assert _key != '0' * (GLYPH_W * GLYPH_H), 'glyph %r is blank' % _ch
    if _key in _seen:
        raise SystemExit('font: %r and %r draw exactly the same pixels'
                         % (_seen[_key], _ch))
    _seen[_key] = _ch

FONT_COLS = 16
FONT_CELL_W, FONT_CELL_H = CELL_W, CELL_H
FONT_ROWS = (95 + FONT_COLS - 1) // FONT_COLS      # ascii 32..126
FONT_Y = TILE_H
FONT_H = FONT_ROWS * FONT_CELL_H

W = COLS * 8                    # 128
H = TILE_H + FONT_H

img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
px = img.load()

index = {}
for i, nm in enumerate(names):
    ox, oy = (i % COLS) * 8, (i // COLS) * 8
    index[nm] = i
    for y, row in enumerate(S[nm]):
        for x, ch in enumerate(row):
            c = PAL[ch]
            if c is not None:
                px[ox + x, oy + y] = (c[0], c[1], c[2], 255)

for i in range(95):
    ch = chr(32 + i)
    ox = (i % FONT_COLS) * FONT_CELL_W
    oy = FONT_Y + (i // FONT_COLS) * FONT_CELL_H
    rows = F.get(ch, F[' '])
    for y, row in enumerate(rows):
        for x, b in enumerate(row):
            if b == '1':
                px[ox + x, oy + y] = (255, 255, 255, 255)

img.save(os.path.join(OUT_DIR, 'atlas.png'))

meta = {
    'tileSize': 8,
    'cols': COLS,
    'tileRows': rows_needed,
    'index': index,
    'font': {'x': 0, 'y': FONT_Y, 'cols': FONT_COLS,
             'cw': FONT_CELL_W, 'ch': FONT_CELL_H,
             'glyphW': GLYPH_W, 'glyphH': GLYPH_H, 'first': 32, 'count': 95,
             # each glyph carries its own advance: this font is proportional 
             'widths': [ADV[chr(32 + i)] for i in range(95)]},
    'atlasW': W, 'atlasH': H,
}
# Moving a sprite is allowed; losing one is not.
#
# The old rule here was "nothing may ever change cell", which made the
# sheet impossible to tidy - and it watched the wrong thing anyway.  What
# matters is that every graphic follows its own name to wherever the name
# now lives, and that nothing quietly vanishes.  The migration below is
# what enforces that; this only records where everything went so the
# migration has something to work from.
_prev_path = os.path.join(OUT_DIR, 'atlas.json')
_moves = {}
if os.path.exists(_prev_path):
    _old = json.load(open(_prev_path)).get('index', {})
    _lost = sorted(n for n in _old if n not in index and n not in _dropped)
    if _lost:
        raise SystemExit(
            'REFUSING TO WRITE: these sprites disappeared without being '
            'dropped on purpose:\n  %s' % '\n  '.join(_lost))
    for n, i in _old.items():
        if n in index and index[n] != i:
            _moves[n] = (i, index[n])
    if _moves:
        print('moved %d sprites; run migrate_sheet.py to bring the '
              'hand-painted sheet with them' % len(_moves))
meta['moved'] = _moves
meta['dropped'] = _dropped

with open(os.path.join(OUT_DIR, 'atlas.json'), 'w') as f:
    json.dump(meta, f)

# preview (nearest-neighbour, integer scale only)
img.convert('RGB').resize((W * 4, H * 4), Image.NEAREST).save(
    os.path.join(OUT_DIR, 'atlas_preview.png'))

print("sprites:", len(names), "atlas:", W, "x", H, "tileRows:", rows_needed)
