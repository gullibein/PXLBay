export class FontRenderer {
  private pixels: boolean[][][] = [];
  private loaded: boolean = false;
  private charWidth: number = 8;
  private charHeight: number = 16;
  
  private readonly cp437 = " ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";

  constructor(url: string) {
    this.loadFon(url);
  }

  async loadFon(url: string) {
    try {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const view = new DataView(buf);
      
      const neOffset = view.getUint16(0x3C, true);
      const resTableOffset = neOffset + view.getUint16(neOffset + 0x24, true);
      const shift = view.getUint16(resTableOffset, true);
      
      let p = resTableOffset + 2;
      let fntOffset = 0;
      while (true) {
        const typeId = view.getUint16(p, true);
        if (typeId === 0) break;
        const count = view.getUint16(p + 2, true);
        if (typeId === 0x8008) { // Font resource
          fntOffset = view.getUint16(p + 8, true) << shift;
          break;
        }
        p += 8 + count * 12;
      }
      
      if (fntOffset === 0) return;
      
      this.charWidth = view.getUint16(fntOffset + 0x56, true);
      this.charHeight = view.getUint16(fntOffset + 0x58, true);
      const firstChar = view.getUint8(fntOffset + 0x5F);
      const lastChar = view.getUint8(fntOffset + 0x60);
      
      for (let i = 0; i < 256; i++) {
        this.pixels[i] = [];
      }
      
      for (let c = firstChar; c <= lastChar; c++) {
        const entryOffset = fntOffset + 0x76 + c * 4;
        const width = view.getUint16(entryOffset, true);
        const offset = view.getUint16(entryOffset + 2, true);
        const bitsOffset = fntOffset + offset;
        
        const charPixels: boolean[][] = [];
        const bytesPerRow = width <= 8 ? 1 : 2;
        
        for (let r = 0; r < this.charHeight; r++) {
          charPixels[r] = [];
          let rowData = 0;
          if (bytesPerRow === 1) {
            rowData = view.getUint8(bitsOffset + r);
          } else {
            rowData = view.getUint16(bitsOffset + r * 2, false); // MSB first
          }
          
          for (let x = 0; x < width; x++) {
            if (bytesPerRow === 1) {
              charPixels[r][x] = (rowData & (1 << (7 - x))) !== 0;
            } else {
              charPixels[r][x] = (rowData & (1 << (15 - x))) !== 0;
            }
          }
        }
        this.pixels[c] = charPixels;
      }
      
      this.loaded = true;
      this.synthesizeIcelandicChars();
    } catch (e) {
      console.error("Failed to load .FON:", e);
    }
  }

  private synthesizeIcelandicChars() {
    // Generate 'Ð' (ETH) from 'D'
    const charD = this.pixels[68];
    if (charD) {
      const ethUpper = charD.map(row => [...row]);
      ethUpper[3] = [true, true, true, false, true, false, false]; // Add crossbar
      this.pixels['Ð'.charCodeAt(0)] = ethUpper;
    }

    // Generate 'ð' (eth) from 'd'
    const chard = this.pixels[100];
    if (chard) {
      const ethLower = chard.map(row => [...row]);
      ethLower[1] = [false, false, true, true, true, false, false]; // Add crossbar
      this.pixels['ð'.charCodeAt(0)] = ethLower;
    }

    // Generate 'þ' (thorn) from 'p'
    const charp = this.pixels[112];
    if (charp) {
      const thornLower = charp.map(row => [...row]);
      thornLower[0] = [false, true, false, false, false, false, false]; // Extend stem up
      thornLower[1] = [false, true, false, false, false, false, false];
      // Remove horizontal line at the bottom of the descender if it exists
      if (thornLower[7]) {
        thornLower[7] = thornLower[7].map((_, i) => i === 1); // Only keep the stem at column 1
      }
      this.pixels['þ'.charCodeAt(0)] = thornLower;
    }

    // Generate 'Þ' (THORN)
    this.pixels['Þ'.charCodeAt(0)] = [
      [false, true, false, false, false, false, false],
      [false, true, false, false, false, false, false],
      [false, true, true, true, true, false, false],
      [false, true, false, false, false, true, false],
      [false, true, false, false, false, true, false],
      [false, true, true, true, true, false, false],
      [false, true, false, false, false, false, false],
      [false, true, false, false, false, false, false],
    ];
  }

  private getCharIndex(char: string): number {
    const idx = this.cp437.indexOf(char);
    if (idx !== -1) return idx;
    
    const code = char.charCodeAt(0);
    return code < 256 ? code : 63; // 63 = '?'
  }

  measureText(text: string): number {
    if (!this.loaded || !text) return 0;
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      const idx = this.getCharIndex(text[i]);
      width += (this.pixels[idx] && this.pixels[idx][0]) ? this.pixels[idx][0].length : this.charWidth;
    }
    return width;
  }

  drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string = '#000000') {
    if (!this.loaded) {
      ctx.fillStyle = 'red';
      ctx.font = '16px monospace';
      ctx.fillText(text, x, y + 16);
      return;
    }

    if (!text) return;

    ctx.fillStyle = color;
    let currentX = x;

    for (let i = 0; i < text.length; i++) {
      const idx = this.getCharIndex(text[i]);
      const charPixels = this.pixels[idx];
      
      if (!charPixels || charPixels.length === 0) {
        currentX += this.charWidth;
        continue;
      }

      for (let r = 0; r < charPixels.length; r++) {
        if (!charPixels[r]) continue;
        for (let c = 0; c < charPixels[r].length; c++) {
          if (charPixels[r][c]) {
            ctx.fillRect(currentX + c, y + r, 1, 1);
          }
        }
      }
      currentX += charPixels[0].length; // advance by character width
    }
  }
}
