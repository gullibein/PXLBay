import { FontRenderer } from './font';
import fontUrl from '../public/Bm437_EverexME_7x8.FON?url';
import { VFS, type VFSNode } from './vfs';
import { fetchRepositoryTree } from './scanner';
import { getFavicon, normalizeUrl, fetchPageTitle } from './favicon';

function getCharIndexAtX(font: FontRenderer, text: string, relativeX: number): number {
  if (relativeX <= 0) return 0;
  let closestIndex = 0;
  let closestDist = Math.abs(relativeX);
  for (let i = 1; i <= text.length; i++) {
    const w = font.measureText(text.substring(0, i));
    const dist = Math.abs(relativeX - w);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }
  return closestIndex;
}

export class OS {
  private vfs = new VFS();
  private currentFiles: VFSNode[] = [];
  private font: FontRenderer;
  
  private readonly iconWidth = 32;
  private readonly iconHeight = 24;
  private cellWidth = 105;
  private cellHeight = 64;
  private readonly marginY = 8;

  public width: number = 640;
  public height: number = 340;
  
  private selectedIds: Set<string> = new Set();
  private lastSelectedId: string | null = null;
  private lastClickTime: number = 0;
  private scrollY: number = 0;

  private currentFolderId: string = 'root';
  private scrollHistory: Map<string, number> = new Map();

  private get emptyBinBtnRect() {
    return { x: this.width - 110, y: this.height - 30, w: 100, h: 20 };
  }

  private contextMenu: { 
    x: number, 
    y: number, 
    options: string[], 
    type: 'desktop' | 'item' | 'bin',
    hoveredIndex: number,
    hoveredSubIndex: number 
  } | null = null;
  
  private renamingId: string | null = null;
  private renameText: string = '';
  private renameOriginalName: string = '';
  private renameCursorPos: number = 0;
  private isRenameSelected: boolean = false;
  private renameSelStart: number | null = null;
  private renameSelEnd: number | null = null;
  private renameLastClickTime: number = 0;

  private textSelectTarget: 'modal-url' | 'modal-name' | 'rename' | null = null;
  private textSelectAnchor: number = 0;
  private modalUrlLastClickTime: number = 0;
  private modalNameLastClickTime: number = 0;
  private lastPasteTime: number = 0;
  private lastPastedText: string = '';

  private draggingId: string | null = null;
  private draggingSelected: boolean = false;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;
  private dragInitialPositions: Map<string, { x: number, y: number }> = new Map();

  private selectionBox: { x1: number, y1: number, x2: number, y2: number } | null = null;
  private clipboard: { ids: Set<string>, type: 'copy' | 'cut' } | null = null;

  private modal: {
    message: string,
    onConfirm: () => void,
    isAlert?: boolean,
    rect: { x: number, y: number, w: number, h: number },
    confirmBtnRect: { x: number, y: number, w: number, h: number },
    cancelBtnRect?: { x: number, y: number, w: number, h: number }
  } | null = null;

  private addFileModal: {
    name: string;
    url: string;
    activeField: 'url' | 'name';
    userEditedName: boolean;
    nameCursorPos: number;
    urlCursorPos: number;
    nameSelStart: number | null;
    nameSelEnd: number | null;
    urlSelStart: number | null;
    urlSelEnd: number | null;
    rect: { x: number; y: number; w: number; h: number };
    urlInputRect: { x: number; y: number; w: number; h: number };
    nameInputRect: { x: number; y: number; w: number; h: number };
    okBtnRect: { x: number; y: number; w: number; h: number };
    cancelBtnRect: { x: number; y: number; w: number; h: number };
    editingFileId?: string;
  } | null = null;

  constructor() {
    this.font = new FontRenderer(fontUrl);
    this.refreshFiles();
    this.initTree();
  }

  private async initTree() {
    try {
      const tree = await fetchRepositoryTree();
      if (tree && tree.length > 0) {
        this.vfs.loadTree(tree, 'root');
        this.refreshFiles();
      }
    } catch (err) {
      console.error('Failed to initialize repo tree in OS:', err);
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.clampScroll();
  }

  private clampScroll() {
    const cols = Math.floor(this.width / this.cellWidth);
    if (cols > 0) {
      const rows = Math.ceil(this.currentFiles.length / cols);
      const totalHeight = rows * this.cellHeight + this.marginY * 2;
      const maxScroll = Math.min(0, this.height - totalHeight);
      if (this.scrollY < maxScroll) this.scrollY = maxScroll;
      if (this.scrollY > 0) this.scrollY = 0;
    }
  }

  private refreshFiles() {
    let files = this.vfs.getChildren(this.currentFolderId);
    if (this.currentFolderId !== 'root') {
      const parentNode = this.vfs.getNode(this.currentFolderId);
      const parentId = parentNode?.parentId || 'root';
      files = [{ id: '..', name: '..', isDirectory: true, parentId: parentId } as VFSNode, ...files];
    }
    this.currentFiles = files;
    this.clampScroll();
  }

  handleScroll(deltaY: number, _mouseX: number, _mouseY: number) {
    if (this.contextMenu) return;
    this.scrollY += deltaY;
    this.clampScroll();
  }

  update() {}

  private formatNameLines(name: string): string[] {
    if (name.length <= 14) return [name];
    const spaceIdx = name.substring(0, 15).lastIndexOf(' ');
    let line1 = '';
    let line2 = '';
    if (spaceIdx > 0) {
      line1 = name.substring(0, spaceIdx);
      line2 = name.substring(spaceIdx + 1);
    } else {
      line1 = name.substring(0, 13) + '-';
      line2 = name.substring(13);
    }
    if (line2.length > 14) {
      line2 = line2.substring(0, 13) + '~';
    }
    return [line1, line2];
  }

  private drawIcon(ctx: CanvasRenderingContext2D, file: VFSNode, x: number, y: number, isSelected: boolean) {
    if (isSelected) {
      ctx.fillStyle = '#0000A8';
      ctx.fillRect(x - 2, y - 2, this.iconWidth + 4, this.iconHeight + 4);
    }

    if (file.isRecycleBin) {
      // Trash Can Icon
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = '#000';
      
      // Bin body
      ctx.fillRect(x + 6, y + 4, 20, 20);
      ctx.strokeRect(x + 6, y + 4, 20, 20);
      
      // Bin lid
      ctx.fillRect(x + 4, y, 24, 4);
      ctx.strokeRect(x + 4, y, 24, 4);
      
      // Lid handle
      ctx.fillRect(x + 12, y - 2, 8, 2);
      ctx.strokeRect(x + 12, y - 2, 8, 2);

      // Lines on body
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 8); ctx.lineTo(x + 10, y + 20);
      ctx.moveTo(x + 16, y + 8); ctx.lineTo(x + 16, y + 20);
      ctx.moveTo(x + 22, y + 8); ctx.lineTo(x + 22, y + 20);
      ctx.stroke();
    } else if (file.isDirectory) {
      const folderColor = file.isApp ? '#ff5555' : '#FFD700';
      ctx.fillStyle = folderColor;
      ctx.strokeStyle = '#000';
      
      // Tabbed folder with diagonal edge and 3px tab height
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 11, y);
      ctx.lineTo(x + 14, y + 3);
      ctx.lineTo(x + this.iconWidth, y + 3);
      ctx.lineTo(x + this.iconWidth, y + this.iconHeight);
      ctx.lineTo(x, y + this.iconHeight);
      ctx.lineTo(x, y);
      ctx.fill();
      ctx.stroke();

      if (file.isApp) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + Math.floor(this.iconWidth / 2) - 4, y + 10, 8, 8);
      }
    } else {
      // Executable / File Icon
      const favicon = file.url ? getFavicon(file.url) : null;
      if (favicon && favicon.complete && favicon.naturalWidth > 1) {
        // Draw favicon directly at 24x24 pixels (preserving transparency and natural circular/square shape)
        const fx = x + Math.floor((this.iconWidth - 24) / 2);
        ctx.drawImage(favicon, fx, y, 24, 24);
      } else if (file.isExecutable || file.url || file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.exe')) {
        // Custom Retro 32x24 Executable Window Icon
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x, y, this.iconWidth, this.iconHeight);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, y, this.iconWidth, this.iconHeight);

        // 3D Bevel highlight
        ctx.strokeStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(x + 1, y + this.iconHeight - 1);
        ctx.lineTo(x + 1, y + 1);
        ctx.lineTo(x + this.iconWidth - 1, y + 1);
        ctx.stroke();

        // Title bar (Dark Blue)
        ctx.fillStyle = '#0000A8';
        ctx.fillRect(x + 3, y + 3, this.iconWidth - 6, 4);

        // Mini Title button (yellow square)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + this.iconWidth - 7, y + 4, 2, 2);

        // Window Inner Canvas
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + 3, y + 8, this.iconWidth - 6, this.iconHeight - 11);

        // Mini Application Glyph: Retro program blocks
        ctx.fillStyle = '#008080';
        ctx.fillRect(x + 6, y + 10, 6, 6);
        ctx.fillStyle = '#FF5555';
        ctx.fillRect(x + 14, y + 10, 11, 3);
        ctx.fillStyle = '#0000A8';
        ctx.fillRect(x + 14, y + 14, 8, 2);
      } else {
        // Simple Text/Data File icon
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';
        ctx.fillRect(x, y, this.iconWidth, this.iconHeight);
        ctx.strokeRect(x, y, this.iconWidth, this.iconHeight);
        
        // Single detail line
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 4, y + 6, this.iconWidth - 8, 1);
      }
    }

    const isRenaming = this.renamingId === file.id;
    const nameToDraw = isRenaming ? this.renameText : file.name;
    const lines = this.formatNameLines(nameToDraw);
    const centerX = x + this.iconWidth / 2;

    const hasRenameSel = isRenaming && (this.isRenameSelected || (this.renameSelStart !== null && this.renameSelEnd !== null && this.renameSelStart !== this.renameSelEnd));
    const rSMin = isRenaming ? (this.isRenameSelected ? 0 : (this.renameSelStart !== null && this.renameSelEnd !== null ? Math.min(this.renameSelStart, this.renameSelEnd) : 0)) : 0;
    const rSMax = isRenaming ? (this.isRenameSelected ? this.renameText.length : (this.renameSelStart !== null && this.renameSelEnd !== null ? Math.max(this.renameSelStart, this.renameSelEnd) : 0)) : 0;

    if (isRenaming) {
        let maxLineWidth = 0;
        lines.forEach(line => {
          maxLineWidth = Math.max(maxLineWidth, this.font.measureText(line));
        });
        const boxWidth = Math.max(40, maxLineWidth + 10);
        const halfBoxWidth = Math.floor(boxWidth / 2);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(centerX - halfBoxWidth, y + this.iconHeight + 4, boxWidth, lines.length * 12 + 4);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(centerX - halfBoxWidth, y + this.iconHeight + 4, boxWidth, lines.length * 12 + 4);

        if (this.isRenameSelected || (hasRenameSel && rSMin === 0 && rSMax >= this.renameText.length)) {
          ctx.fillStyle = '#0000A8';
          ctx.fillRect(centerX - halfBoxWidth + 2, y + this.iconHeight + 6, boxWidth - 4, lines.length * 12);
        } else if (hasRenameSel) {
          lines.forEach((line, i) => {
            const lineStartIdx = i === 0 ? 0 : 14;
            const lineEndIdx = lineStartIdx + line.length;
            const lineSelStart = Math.max(lineStartIdx, rSMin);
            const lineSelEnd = Math.min(lineEndIdx, rSMax);
            if (lineSelStart < lineSelEnd) {
              const textBefore = line.substring(0, lineSelStart - lineStartIdx);
              const selText = line.substring(lineSelStart - lineStartIdx, lineSelEnd - lineStartIdx);
              const textWidth = this.font.measureText(line);
              const textX = Math.floor(centerX - textWidth / 2);
              const selX = textX + this.font.measureText(textBefore);
              const selW = this.font.measureText(selText);
              ctx.fillStyle = '#0000A8';
              ctx.fillRect(selX - 1, y + this.iconHeight + 5 + (i * 12), selW + 2, 12);
            }
          });
        } else {
          // Draw cursor
          const cursorLineIdx = this.renameCursorPos <= 14 ? 0 : 1;
          const lineTextBefore = this.renameText.substring(cursorLineIdx === 0 ? 0 : 14, this.renameCursorPos);
          const cursorXOffset = this.font.measureText(lineTextBefore);
          
          const textWidth = this.font.measureText(lines[cursorLineIdx]);
          const textX = Math.floor(centerX - textWidth / 2);
          
          ctx.fillStyle = '#000';
          ctx.fillRect(textX + cursorXOffset, y + this.iconHeight + 6 + (cursorLineIdx * 12), 1, 10);
        }
    }

    lines.forEach((line, i) => {
      const textWidth = this.font.measureText(line);
      const textX = Math.floor(centerX - textWidth / 2);
      
      let textColor = '#000';
      if (isSelected && !isRenaming) {
        ctx.fillStyle = '#0000A8';
        ctx.fillRect(textX - 2, y + this.iconHeight + 4 + (i * 12), textWidth + 4, 12);
        textColor = '#FFF';
      } else if (isRenaming) {
        if (this.isRenameSelected || (hasRenameSel && rSMin === 0 && rSMax >= this.renameText.length)) {
          textColor = '#FFF';
          this.font.drawText(ctx, line, textX, y + this.iconHeight + 6 + (i * 12), textColor);
          return;
        } else if (hasRenameSel) {
          const lineStartIdx = i === 0 ? 0 : 14;
          const lineEndIdx = lineStartIdx + line.length;
          const lineSelStart = Math.max(lineStartIdx, rSMin);
          const lineSelEnd = Math.min(lineEndIdx, rSMax);
          if (lineSelStart < lineSelEnd) {
            const before = line.substring(0, lineSelStart - lineStartIdx);
            const sel = line.substring(lineSelStart - lineStartIdx, lineSelEnd - lineStartIdx);
            const after = line.substring(lineSelEnd - lineStartIdx);
            let curX = textX;
            if (before) {
              this.font.drawText(ctx, before, curX, y + this.iconHeight + 6 + (i * 12), '#000');
              curX += this.font.measureText(before);
            }
            if (sel) {
              this.font.drawText(ctx, sel, curX, y + this.iconHeight + 6 + (i * 12), '#FFF');
              curX += this.font.measureText(sel);
            }
            if (after) {
              this.font.drawText(ctx, after, curX, y + this.iconHeight + 6 + (i * 12), '#000');
            }
            return;
          }
        }
      }
      
      this.font.drawText(ctx, line, textX, y + this.iconHeight + 6 + (i * 12), textColor);
    });
  }

  private drawModal(ctx: CanvasRenderingContext2D) {
    if (!this.modal) return;
    const { x, y, w, h } = this.modal.rect;
    
    // Dim background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Window
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#FFF';
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.stroke();

    const msgWidth = this.font.measureText(this.modal.message);
    const msgX = this.modal.isAlert ? Math.floor(x + (w - msgWidth) / 2) : x + 10;
    this.font.drawText(ctx, this.modal.message, msgX, y + 16);

    // Buttons
    const buttons = this.modal.isAlert 
      ? [{ rect: this.modal.confirmBtnRect, label: 'OK' }]
      : [
          { rect: this.modal.confirmBtnRect, label: 'OK' },
          { rect: this.modal.cancelBtnRect!, label: 'Cancel' }
        ];

    buttons.forEach(btn => {
      const { x: bx, y: by, w: bw, h: bh } = btn.rect;
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#FFF';
      ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx, by); ctx.lineTo(bx + bw, by); ctx.stroke();
      ctx.strokeStyle = '#000';
      ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh); ctx.stroke();
      this.font.drawText(ctx, btn.label, bx + (bw - this.font.measureText(btn.label))/2, by + 6);
    });
  }

  private drawAddFileModal(ctx: CanvasRenderingContext2D) {
    if (!this.addFileModal) return;
    const { rect, nameInputRect, urlInputRect, okBtnRect, cancelBtnRect, name, url, activeField, nameCursorPos, urlCursorPos, editingFileId } = this.addFileModal;
    const { x, y, w, h } = rect;

    // Dim background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Modal Window Box
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#FFF';
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.stroke();

    // Title bar
    ctx.fillStyle = '#0000A8';
    ctx.fillRect(x + 2, y + 2, w - 4, 14);
    const titleText = editingFileId ? 'Edit file' : 'Add file';
    this.font.drawText(ctx, titleText, x + 6, y + 4, '#FFF');

    // Label: Link (First field)
    this.font.drawText(ctx, 'Link:', x + 12, y + 20, '#000');

    // Input Box: URL
    ctx.fillStyle = '#FFF';
    ctx.fillRect(urlInputRect.x, urlInputRect.y, urlInputRect.w, urlInputRect.h);
    ctx.strokeStyle = '#808080';
    ctx.beginPath(); ctx.moveTo(urlInputRect.x, urlInputRect.y + urlInputRect.h); ctx.lineTo(urlInputRect.x, urlInputRect.y); ctx.lineTo(urlInputRect.x + urlInputRect.w, urlInputRect.y); ctx.stroke();
    ctx.strokeStyle = '#FFF';
    ctx.beginPath(); ctx.moveTo(urlInputRect.x + urlInputRect.w, urlInputRect.y); ctx.lineTo(urlInputRect.x + urlInputRect.w, urlInputRect.y + urlInputRect.h); ctx.lineTo(urlInputRect.x, urlInputRect.y + urlInputRect.h); ctx.stroke();

    // Draw URL Text, Selection & Cursor
    const { urlSelStart, urlSelEnd, nameSelStart, nameSelEnd } = this.addFileModal;
    const isUrlSelected = activeField === 'url' && urlSelStart !== null && urlSelEnd !== null && urlSelStart !== urlSelEnd;
    const urlSMin = isUrlSelected ? Math.min(urlSelStart!, urlSelEnd!) : 0;
    const urlSMax = isUrlSelected ? Math.max(urlSelStart!, urlSelEnd!) : 0;

    let visibleUrl = url;
    let urlOffset = 0;
    const maxUrlWidth = urlInputRect.w - 10;
    while (this.font.measureText(visibleUrl) > maxUrlWidth && urlOffset < urlCursorPos) {
      urlOffset++;
      visibleUrl = url.substring(urlOffset);
    }

    if (isUrlSelected) {
      const beforeSel = url.substring(urlOffset, Math.max(urlOffset, urlSMin));
      const selText = url.substring(Math.max(urlOffset, urlSMin), Math.max(urlOffset, urlSMax));
      const afterSel = url.substring(Math.max(urlOffset, urlSMax));

      let currX = urlInputRect.x + 4;
      if (beforeSel) {
        this.font.drawText(ctx, beforeSel, currX, urlInputRect.y + 4, '#000');
        currX += this.font.measureText(beforeSel);
      }
      if (selText) {
        const selW = this.font.measureText(selText);
        ctx.fillStyle = '#0000A8';
        ctx.fillRect(currX - 1, urlInputRect.y + 2, selW + 2, 12);
        this.font.drawText(ctx, selText, currX, urlInputRect.y + 4, '#FFF');
        currX += selW;
      }
      if (afterSel) {
        this.font.drawText(ctx, afterSel, currX, urlInputRect.y + 4, '#000');
      }
    } else {
      this.font.drawText(ctx, visibleUrl, urlInputRect.x + 4, urlInputRect.y + 4, '#000');
      if (activeField === 'url') {
        const textBefore = url.substring(urlOffset, urlCursorPos);
        const cursorX = urlInputRect.x + 4 + this.font.measureText(textBefore);
        ctx.fillStyle = '#000';
        ctx.fillRect(cursorX, urlInputRect.y + 3, 1, 10);
      }
    }

    // Label: Name (Second field)
    this.font.drawText(ctx, 'Name:', x + 12, y + 50, '#000');

    // Input Box: File Name
    ctx.fillStyle = '#FFF';
    ctx.fillRect(nameInputRect.x, nameInputRect.y, nameInputRect.w, nameInputRect.h);
    ctx.strokeStyle = '#808080';
    ctx.beginPath(); ctx.moveTo(nameInputRect.x, nameInputRect.y + nameInputRect.h); ctx.lineTo(nameInputRect.x, nameInputRect.y); ctx.lineTo(nameInputRect.x + nameInputRect.w, nameInputRect.y); ctx.stroke();
    ctx.strokeStyle = '#FFF';
    ctx.beginPath(); ctx.moveTo(nameInputRect.x + nameInputRect.w, nameInputRect.y); ctx.lineTo(nameInputRect.x + nameInputRect.w, nameInputRect.y + nameInputRect.h); ctx.lineTo(nameInputRect.x, nameInputRect.y + nameInputRect.h); ctx.stroke();

    // Draw Name Text, Selection & Cursor
    const isNameSelected = activeField === 'name' && nameSelStart !== null && nameSelEnd !== null && nameSelStart !== nameSelEnd;
    const nameSMin = isNameSelected ? Math.min(nameSelStart!, nameSelEnd!) : 0;
    const nameSMax = isNameSelected ? Math.max(nameSelStart!, nameSelEnd!) : 0;

    if (isNameSelected) {
      const beforeSel = name.substring(0, nameSMin);
      const selText = name.substring(nameSMin, nameSMax);
      const afterSel = name.substring(nameSMax);

      let currX = nameInputRect.x + 4;
      if (beforeSel) {
        this.font.drawText(ctx, beforeSel, currX, nameInputRect.y + 4, '#000');
        currX += this.font.measureText(beforeSel);
      }
      if (selText) {
        const selW = this.font.measureText(selText);
        ctx.fillStyle = '#0000A8';
        ctx.fillRect(currX - 1, nameInputRect.y + 2, selW + 2, 12);
        this.font.drawText(ctx, selText, currX, nameInputRect.y + 4, '#FFF');
        currX += selW;
      }
      if (afterSel) {
        this.font.drawText(ctx, afterSel, currX, nameInputRect.y + 4, '#000');
      }
    } else {
      this.font.drawText(ctx, name, nameInputRect.x + 4, nameInputRect.y + 4, '#000');
      if (activeField === 'name') {
        const textBefore = name.substring(0, nameCursorPos);
        const cursorX = nameInputRect.x + 4 + this.font.measureText(textBefore);
        ctx.fillStyle = '#000';
        ctx.fillRect(cursorX, nameInputRect.y + 3, 1, 10);
      }
    }

    // Buttons (OK & Cancel)
    [
      { rect: okBtnRect, label: 'OK' },
      { rect: cancelBtnRect, label: 'Cancel' }
    ].forEach(btn => {
      const { x: bx, y: by, w: bw, h: bh } = btn.rect;
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#FFF';
      ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.lineTo(bx, by); ctx.lineTo(bx + bw, by); ctx.stroke();
      ctx.strokeStyle = '#000';
      ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh); ctx.stroke();
      this.font.drawText(ctx, btn.label, bx + (bw - this.font.measureText(btn.label)) / 2, by + 6);
    });
  }

  private drawContextMenu(ctx: CanvasRenderingContext2D) {
    if (!this.contextMenu) return;
    
    const menuWidth = 120;
    const menuHeight = this.contextMenu.options.length * 20 + 4;
    
    let mx = this.contextMenu.x;
    let my = this.contextMenu.y;
    if (mx + menuWidth > this.width) mx = this.width - menuWidth;
    if (my + menuHeight > this.height) my = this.height - menuHeight;

    // Draw main menu
    this.drawMenuBox(ctx, mx, my, menuWidth, menuHeight, this.contextMenu.options, this.contextMenu.hoveredIndex);

    // Draw sub-menu if Zoom is hovered
    if (this.contextMenu.hoveredIndex !== -1 && this.contextMenu.options[this.contextMenu.hoveredIndex] === 'Zoom') {
      const subOptions = ['2x', '3x', '4x'];
      const subWidth = 60;
      const subHeight = subOptions.length * 20 + 4;
      let smx = mx + menuWidth;
      let smy = my + this.contextMenu.hoveredIndex * 20;
      
      if (smx + subWidth > this.width) smx = mx - subWidth;
      if (smy + subHeight > this.height) smy = this.height - subHeight;

      this.drawMenuBox(ctx, smx, smy, subWidth, subHeight, subOptions, this.contextMenu.hoveredSubIndex);
    }
  }

  private drawMenuBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, options: string[], hoveredIdx: number) {
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = '#FFF';
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    
    ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.stroke();

    options.forEach((opt, i) => {
      const isDisabled = opt === 'Paste' && !this.clipboard;
      
      if (i === hoveredIdx && !isDisabled) {
        ctx.fillStyle = '#0000A8';
        ctx.fillRect(x + 2, y + 2 + i * 20, w - 4, 20);
      }
      
      const textColor = isDisabled ? '#808080' : (i === hoveredIdx && !isDisabled ? '#FFF' : '#000');
      this.font.drawText(ctx, opt, x + 10, y + 6 + i * 20, textColor);
      
      if (opt === 'Zoom') {
        // Draw small arrow for sub-menu
        ctx.fillStyle = i === hoveredIdx ? '#FFF' : '#000';
        ctx.beginPath();
        ctx.moveTo(x + w - 15, y + 6 + i * 20);
        ctx.lineTo(x + w - 15, y + 14 + i * 20);
        ctx.lineTo(x + w - 7, y + 10 + i * 20);
        ctx.fill();
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#008080';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.currentFolderId === 'bin') {
      const { x, y, w, h } = this.emptyBinBtnRect;
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#FFF';
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
      ctx.strokeStyle = '#000';
      ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.stroke();
      this.font.drawText(ctx, 'Empty Bin', x + 16, y + 6);
    }

    const cols = Math.floor(this.width / this.cellWidth);
    if (cols > 0) {
      const gridOffsetX = Math.floor((this.width - (cols * this.cellWidth)) / 2);
      
      for (let i = 0; i < this.currentFiles.length; i++) {
        const file = this.currentFiles[i];
        let x, y;
        
        if (file.x !== undefined && file.y !== undefined) {
          x = file.x;
          y = file.y + this.scrollY;
        } else {
          const col = i % cols;
          const row = Math.floor(i / cols);
          x = gridOffsetX + col * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
          y = this.marginY + row * this.cellHeight + this.scrollY;
        }
        
        this.drawIcon(ctx, file, x, y, this.selectedIds.has(file.id));
      }
    }

    if (this.selectionBox) {
      ctx.strokeStyle = '#FFF';
      ctx.setLineDash([2, 2]);
      const x = Math.min(this.selectionBox.x1, this.selectionBox.x2);
      const y = Math.min(this.selectionBox.y1, this.selectionBox.y2);
      const w = Math.abs(this.selectionBox.x1 - this.selectionBox.x2);
      const h = Math.abs(this.selectionBox.y1 - this.selectionBox.y2);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }

    this.drawContextMenu(ctx);
    this.drawModal(ctx);
    this.drawAddFileModal(ctx);
  }

  handleMouseDown(x: number, y: number, button: number, shift: boolean = false, ctrl: boolean = false) {
    if (this.addFileModal) {
      if (button === 0) {
        const { okBtnRect, cancelBtnRect, nameInputRect, urlInputRect } = this.addFileModal;
        if (x >= okBtnRect.x && x <= okBtnRect.x + okBtnRect.w && y >= okBtnRect.y && y <= okBtnRect.y + okBtnRect.h) {
          this.submitAddFile();
        } else if (x >= cancelBtnRect.x && x <= cancelBtnRect.x + cancelBtnRect.w && y >= cancelBtnRect.y && y <= cancelBtnRect.y + cancelBtnRect.h) {
          this.addFileModal = null;
        } else if (x >= urlInputRect.x && x <= urlInputRect.x + urlInputRect.w && y >= urlInputRect.y && y <= urlInputRect.y + urlInputRect.h) {
          const now = performance.now();
          this.addFileModal.activeField = 'url';
          
          let visibleUrl = this.addFileModal.url;
          let urlOffset = 0;
          const maxUrlWidth = urlInputRect.w - 10;
          while (this.font.measureText(visibleUrl) > maxUrlWidth && urlOffset < this.addFileModal.urlCursorPos) {
            urlOffset++;
            visibleUrl = this.addFileModal.url.substring(urlOffset);
          }

          const clickOffset = x - (urlInputRect.x + 4);
          const charIdxInVisible = getCharIndexAtX(this.font, visibleUrl, clickOffset);
          const globalCharIdx = Math.min(this.addFileModal.url.length, urlOffset + charIdxInVisible);

          if (now - this.modalUrlLastClickTime < 350) {
            // Double click: Select All
            this.addFileModal.urlSelStart = 0;
            this.addFileModal.urlSelEnd = this.addFileModal.url.length;
            this.addFileModal.urlCursorPos = this.addFileModal.url.length;
            this.textSelectTarget = null;
          } else {
            // Single click: Start drag selection
            this.addFileModal.urlCursorPos = globalCharIdx;
            this.addFileModal.urlSelStart = globalCharIdx;
            this.addFileModal.urlSelEnd = globalCharIdx;
            this.textSelectTarget = 'modal-url';
            this.textSelectAnchor = globalCharIdx;
          }
          this.modalUrlLastClickTime = now;
          this.addFileModal.nameSelStart = null;
          this.addFileModal.nameSelEnd = null;
        } else if (x >= nameInputRect.x && x <= nameInputRect.x + nameInputRect.w && y >= nameInputRect.y && y <= nameInputRect.y + nameInputRect.h) {
          if (this.addFileModal.activeField === 'url') {
            this.resolveModalTitleNow();
          }
          const now = performance.now();
          this.addFileModal.activeField = 'name';

          const clickOffset = x - (nameInputRect.x + 4);
          const charIdx = Math.min(this.addFileModal.name.length, getCharIndexAtX(this.font, this.addFileModal.name, clickOffset));

          if (now - this.modalNameLastClickTime < 350) {
            // Double click: Select All
            this.addFileModal.nameSelStart = 0;
            this.addFileModal.nameSelEnd = this.addFileModal.name.length;
            this.addFileModal.nameCursorPos = this.addFileModal.name.length;
            this.textSelectTarget = null;
          } else {
            // Single click: Start drag selection
            this.addFileModal.nameCursorPos = charIdx;
            this.addFileModal.nameSelStart = charIdx;
            this.addFileModal.nameSelEnd = charIdx;
            this.textSelectTarget = 'modal-name';
            this.textSelectAnchor = charIdx;
          }
          this.modalNameLastClickTime = now;
          this.addFileModal.urlSelStart = null;
          this.addFileModal.urlSelEnd = null;
        }
      }
      return;
    }

    if (this.modal) {
      if (button === 0) {
        const { confirmBtnRect, cancelBtnRect, isAlert } = this.modal;
        if (x >= confirmBtnRect.x && x <= confirmBtnRect.x + confirmBtnRect.w && y >= confirmBtnRect.y && y <= confirmBtnRect.y + confirmBtnRect.h) {
          this.modal.onConfirm();
          this.modal = null;
        } else if (!isAlert && cancelBtnRect && x >= cancelBtnRect.x && x <= cancelBtnRect.x + cancelBtnRect.w && y >= cancelBtnRect.y && y <= cancelBtnRect.y + cancelBtnRect.h) {
          this.modal = null;
        }
      }
      return;
    }

    if (this.renamingId) {
      // Find the currently renaming item to check if click is inside its box
      const cols = Math.floor(this.width / this.cellWidth);
      const gridOffsetX = Math.floor((this.width - (cols * this.cellWidth)) / 2);
      
      let insideRenameBox = false;
      const cy = y - this.scrollY;

      for (let i = 0; i < this.currentFiles.length; i++) {
        const file = this.currentFiles[i];
        if (file.id === this.renamingId) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          let iconX, iconY;
          
          if (file.x !== undefined && file.y !== undefined) {
            iconX = file.x;
            iconY = file.y;
          } else {
            iconX = gridOffsetX + col * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
            iconY = this.marginY + row * this.cellHeight;
          }
          
          const centerX = iconX + this.iconWidth / 2;
          
          const nameToDraw = this.renameText;
          const lines = this.formatNameLines(nameToDraw);
          
          let maxLineWidth = 0;
          lines.forEach(line => {
            maxLineWidth = Math.max(maxLineWidth, this.font.measureText(line));
          });
          const boxWidth = Math.max(40, maxLineWidth + 10);
          const halfBoxWidth = Math.floor(boxWidth / 2);

          const bx = centerX - halfBoxWidth;
          const by = iconY + this.iconHeight + 4;
          const bw = boxWidth;
          const bh = lines.length * 12 + 4;
          
          if (x >= bx && x <= bx + bw && cy >= by && cy <= by + bh) {
            const now = performance.now();
            const lineIdx = (cy >= by + 12 && lines.length > 1) ? 1 : 0;
            const textWidth = this.font.measureText(lines[lineIdx]);
            const textX = Math.floor(centerX - textWidth / 2);
            const clickOffset = x - textX;
            const charIdxInLine = getCharIndexAtX(this.font, lines[lineIdx], clickOffset);
            const charIdx = lineIdx === 0 ? Math.min(this.renameText.length, Math.min(14, charIdxInLine)) : Math.min(this.renameText.length, 14 + charIdxInLine);

            if (now - this.renameLastClickTime < 350) {
              // Double click: Select all text
              this.isRenameSelected = true;
              this.renameSelStart = 0;
              this.renameSelEnd = this.renameText.length;
              this.renameCursorPos = this.renameText.length;
              this.textSelectTarget = null;
            } else {
              // Single click: Start drag selection
              this.isRenameSelected = false;
              this.renameCursorPos = charIdx;
              this.renameSelStart = charIdx;
              this.renameSelEnd = charIdx;
              this.textSelectTarget = 'rename';
              this.textSelectAnchor = charIdx;
            }
            this.renameLastClickTime = now;
            insideRenameBox = true;
          }
          break;
        }
      }

      if (insideRenameBox) {
        return;
      }

      this.commitRename();
      return;
    }

    if (this.contextMenu) {
      this.handleContextMenuClick(x, y);
      return;
    }

    if (this.currentFolderId === 'bin' && button === 0) {
      const { x: bx, y: by, w, h } = this.emptyBinBtnRect;
      if (x >= bx && x <= bx + w && y >= by && y <= by + h) {
        this.vfs.emptyBin();
        this.refreshFiles();
        return;
      }
    }

    const cols = Math.floor(this.width / this.cellWidth);
    if (cols <= 0) return;
    const gridOffsetX = Math.floor((this.width - (cols * this.cellWidth)) / 2);
    let clickedIndex = -1;
    
    const cy = y - this.scrollY;
    let lastClickedOnName = false;

    for (let i = 0; i < this.currentFiles.length; i++) {
      const file = this.currentFiles[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      let iconX, iconY;
      if (file.x !== undefined && file.y !== undefined) {
        iconX = file.x;
        iconY = file.y;
      } else {
        iconX = gridOffsetX + col * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
        iconY = this.marginY + row * this.cellHeight;
      }

      // Icon Hitbox
      const onIcon = x >= iconX && x <= iconX + this.iconWidth && cy >= iconY && cy <= iconY + this.iconHeight;
      
      // Name Hitbox (strictly around text lines)
      const lines = this.formatNameLines(file.name);
      const centerX = iconX + this.iconWidth / 2;
      const nameTop = iconY + this.iconHeight + 4;
      const nameBottom = nameTop + lines.length * 12 + 2;
      
      let maxTextWidth = 0;
      lines.forEach(line => {
        maxTextWidth = Math.max(maxTextWidth, this.font.measureText(line));
      });
      
      const onName = x >= centerX - (maxTextWidth / 2 + 3) && 
                     x <= centerX + (maxTextWidth / 2 + 3) && 
                     cy >= nameTop && cy <= nameBottom;

      if (onIcon || onName) {
        clickedIndex = i;
        lastClickedOnName = onName;
        break;
      }
    }

    if (button === 0) { // Left Click
      if (clickedIndex !== -1) {
        const file = this.currentFiles[clickedIndex];
        const wasAlreadySelected = this.selectedIds.has(file.id) && this.selectedIds.size === 1;
        const now = performance.now();
        const isDoubleClick = (now - this.lastClickTime < 500) && (this.lastSelectedId === file.id);

        if (shift && this.lastSelectedId) {
          const fromIdx = this.currentFiles.findIndex(f => f.id === this.lastSelectedId);
          const toIdx = clickedIndex;
          const start = Math.min(fromIdx, toIdx);
          const end = Math.max(fromIdx, toIdx);
          if (!ctrl) this.selectedIds.clear();
          for (let i = start; i <= end; i++) {
            if (this.currentFiles[i].id !== '..') this.selectedIds.add(this.currentFiles[i].id);
          }
          this.lastSelectedId = file.id;
        } else if (ctrl) {
          if (this.selectedIds.has(file.id)) {
            this.selectedIds.delete(file.id);
          } else {
            this.selectedIds.add(file.id);
          }
          this.lastSelectedId = file.id;
        } else {
          if (isDoubleClick) {
            this.executeFile(file);
          } else if (wasAlreadySelected && lastClickedOnName) {
            // Clicking on name of already selected file/folder enters rename mode
            this.startRename(file.id, file.name);
          } else {
            if (!this.selectedIds.has(file.id)) {
              this.selectedIds.clear();
              this.selectedIds.add(file.id);
            }
            this.lastSelectedId = file.id;
          }
        }

        // Dragging setup
        let iconX, iconY;
        if (file.x !== undefined && file.y !== undefined) {
          iconX = file.x;
          iconY = file.y;
        } else {
          const col = clickedIndex % cols;
          const row = Math.floor(clickedIndex / cols);
          iconX = gridOffsetX + col * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
          iconY = this.marginY + row * this.cellHeight;
        }
        
        this.draggingId = file.id;
        this.draggingSelected = this.selectedIds.has(file.id);
        this.dragOffsetX = x - iconX;
        this.dragOffsetY = cy - iconY;
        
        if (this.draggingSelected) {
          this.dragInitialPositions.clear();
          this.selectedIds.forEach(id => {
            const node = this.vfs.getNode(id);
            if (node) {
              if (node.x !== undefined && node.y !== undefined) {
                this.dragInitialPositions.set(id, { x: node.x, y: node.y });
              } else {
                // Get grid pos
                const idx = this.currentFiles.findIndex(f => f.id === id);
                const iconX = gridOffsetX + (idx % cols) * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
                const iconY = this.marginY + Math.floor(idx / cols) * this.cellHeight;
                this.dragInitialPositions.set(id, { x: iconX, y: iconY });
              }
            }
          });
        }

        this.lastClickTime = now;
      } else {
        // Clicked on empty space
        if (!ctrl && !shift) this.selectedIds.clear();
        this.lastSelectedId = null;
        this.selectionBox = { x1: x, y1: cy, x2: x, y2: cy };
      }
    } else if (button === 2) { // Right Click
      if (clickedIndex !== -1) {
        const file = this.currentFiles[clickedIndex];
        if (file.id === '..') return;
        if (!this.selectedIds.has(file.id)) {
          this.selectedIds.clear();
          this.selectedIds.add(file.id);
        }
        this.lastSelectedId = file.id;
        
        const isBin = this.currentFolderId === 'bin' || Array.from(this.selectedIds).some(id => this.vfs.getNode(id)?.isRecycleBin);
        const options = ['Open'];
        if (file.isApp && file.url) {
          options.push('Launch App');
        }
        if (!file.isDirectory && file.isUserCreated) {
          options.push('Edit file');
        }
        options.push('Copy', 'Paste', 'Rename', 'Delete');
        if (isBin) options.push('Empty Bin');
        this.contextMenu = { x, y, options, type: 'item', hoveredIndex: -1, hoveredSubIndex: -1 };
      } else {
        const options = ['New Folder', 'Add file', 'Paste', 'Tidy', 'Zoom'];
        if (this.currentFolderId === 'bin') options.push('Empty Bin');
        this.contextMenu = { x, y, options, type: 'desktop', hoveredIndex: -1, hoveredSubIndex: -1 };
      }
    }
  }

  private handleContextMenuClick(x: number, y: number) {
    if (!this.contextMenu) return;
    
    const menuWidth = 120;
    const menuHeight = this.contextMenu.options.length * 20 + 4;
    let mx = this.contextMenu.x;
    let my = this.contextMenu.y;
    if (mx + menuWidth > this.width) mx = this.width - menuWidth;
    if (my + menuHeight > this.height) my = this.height - menuHeight;

    // Check main menu
    if (x >= mx && x <= mx + menuWidth && y >= my && y <= my + menuHeight) {
      const clickedIdx = Math.floor((y - my - 2) / 20);
      if (clickedIdx >= 0 && clickedIdx < this.contextMenu.options.length) {
        const option = this.contextMenu.options[clickedIdx];
        const isDisabled = option === 'Paste' && !this.clipboard;
        if (option !== 'Zoom' && !isDisabled) {
          this.executeContextMenuOption(option);
          this.contextMenu = null;
        }
        return;
      }
    }

    // Check sub-menu if Zoom is hovered
    if (this.contextMenu.hoveredIndex !== -1 && this.contextMenu.options[this.contextMenu.hoveredIndex] === 'Zoom') {
      const subOptions = ['2x', '3x', '4x'];
      const subWidth = 60;
      const subHeight = subOptions.length * 20 + 4;
      let smx = mx + menuWidth;
      let smy = my + this.contextMenu.hoveredIndex * 20;
      if (smx + subWidth > this.width) smx = mx - subWidth;
      if (smy + subHeight > this.height) smy = this.height - subHeight;

      if (x >= smx && x <= smx + subWidth && y >= smy && y <= smy + subHeight) {
        const clickedIdx = Math.floor((y - smy - 2) / 20);
        if (clickedIdx >= 0 && clickedIdx < subOptions.length) {
          this.executeContextMenuOption('Zoom > ' + subOptions[clickedIdx]);
          this.contextMenu = null;
          return;
        }
      }
    }
    
    this.contextMenu = null;
  }

  private submitAddFile() {
    if (!this.addFileModal) return;
    const rawUrl = this.addFileModal.url.trim();
    if (rawUrl) {
      const url = normalizeUrl(rawUrl);
      const name = this.addFileModal.name.trim() || 'Untitled';
      if (this.addFileModal.editingFileId) {
        const node = this.vfs.getNode(this.addFileModal.editingFileId);
        if (node) {
          const oldUrl = node.url;
          node.name = name;
          node.url = url;
          if (oldUrl !== url) {
            getFavicon(url);
          }
          this.refreshFiles();
        }
      } else {
        const newNode = this.vfs.createFile(this.currentFolderId, name, url, true);
        this.refreshFiles();
        this.selectedIds.clear();
        this.selectedIds.add(newNode.id);
        this.lastSelectedId = newNode.id;
      }
    }
    this.addFileModal = null;
  }

  private titleFetchTimer: any = null;

  private resolveModalTitleNow() {
    if (!this.addFileModal || this.addFileModal.userEditedName) return;
    const targetUrl = this.addFileModal.url.trim();
    if (!targetUrl) return;

    fetchPageTitle(targetUrl).then(title => {
      if (title && this.addFileModal && !this.addFileModal.userEditedName && this.addFileModal.url.trim() === targetUrl) {
        this.addFileModal.name = title.substring(0, 30);
        this.addFileModal.nameCursorPos = this.addFileModal.name.length;
      }
    });
  }

  private onModalUrlChanged() {
    if (!this.addFileModal || this.addFileModal.userEditedName) return;

    if (this.titleFetchTimer) {
      clearTimeout(this.titleFetchTimer);
      this.titleFetchTimer = null;
    }

    const rawUrl = this.addFileModal.url.trim();
    if (!rawUrl) {
      this.addFileModal.name = '';
      this.addFileModal.nameCursorPos = 0;
      return;
    }

    // Debounce to allow user to complete typing the link
    this.titleFetchTimer = setTimeout(() => {
      this.resolveModalTitleNow();
    }, 250);
  }

  private executeContextMenuOption(option: string) {
    const file = this.lastSelectedId ? this.vfs.getNode(this.lastSelectedId) : null;

    switch (option) {
      case 'New Folder':
        const newNode = this.vfs.createFolder(this.currentFolderId, 'New Folder');
        this.refreshFiles();
        this.selectedIds.clear();
        this.selectedIds.add(newNode.id);
        this.lastSelectedId = newNode.id;
        this.startRename(newNode.id, newNode.name);
        break;
      case 'Add file':
        const w = 240;
        const h = 125;
        const mx = Math.floor((this.width - w) / 2);
        const my = Math.floor((this.height - h) / 2);
        this.addFileModal = {
          name: '',
          url: '',
          activeField: 'url',
          userEditedName: false,
          nameCursorPos: 0,
          urlCursorPos: 0,
          nameSelStart: null,
          nameSelEnd: null,
          urlSelStart: null,
          urlSelEnd: null,
          rect: { x: mx, y: my, w, h },
          urlInputRect: { x: mx + 12, y: my + 30, w: w - 24, h: 16 },
          nameInputRect: { x: mx + 12, y: my + 60, w: w - 24, h: 16 },
          okBtnRect: { x: mx + 30, y: my + 94, w: 80, h: 20 },
          cancelBtnRect: { x: mx + 130, y: my + 94, w: 80, h: 20 }
        };
        break;
      case 'Edit file':
        if (file && !file.isDirectory) {
          const w = 240;
          const h = 125;
          const mx = Math.floor((this.width - w) / 2);
          const my = Math.floor((this.height - h) / 2);
          this.addFileModal = {
            name: file.name,
            url: file.url || '',
            activeField: 'url',
            userEditedName: true,
            nameCursorPos: file.name.length,
            urlCursorPos: (file.url || '').length,
            nameSelStart: null,
            nameSelEnd: null,
            urlSelStart: null,
            urlSelEnd: null,
            rect: { x: mx, y: my, w, h },
            urlInputRect: { x: mx + 12, y: my + 30, w: w - 24, h: 16 },
            nameInputRect: { x: mx + 12, y: my + 60, w: w - 24, h: 16 },
            okBtnRect: { x: mx + 30, y: my + 94, w: 80, h: 20 },
            cancelBtnRect: { x: mx + 130, y: my + 94, w: 80, h: 20 },
            editingFileId: file.id
          };
        }
        break;
      case 'Open':
        if (file) this.executeFile(file);
        break;
      case 'Launch App':
        if (file?.url) {
          this.handleMouseUp();
          const normalized = normalizeUrl(file.url);
          const baseUrl = import.meta.env.BASE_URL || './';
          const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
          const targetUrl = normalized.startsWith('http://') || normalized.startsWith('https://') 
            ? normalized 
            : `${cleanBase}${normalized.replace(/^\/+/, '')}`;
          window.open(targetUrl, '_blank');
        }
        break;
      case 'Rename':
        if (file) this.startRename(file.id, file.name);
        break;
      case 'Delete':
        this.showDeleteConfirm();
        break;
      case 'Copy':
        this.clipboard = { ids: new Set(this.selectedIds), type: 'copy' };
        break;
      case 'Paste':
        if (this.clipboard) {
          this.clipboard.ids.forEach(id => {
            this.vfs.copyNode(id, this.currentFolderId);
          });
          this.refreshFiles();
        }
        break;
      case 'Empty Bin':
        this.vfs.emptyBin();
        this.refreshFiles();
        break;
      case 'Tidy':
        const currentNodes = this.vfs.getChildren(this.currentFolderId);
        const cols = Math.floor(this.width / this.cellWidth);
        if (cols > 0) {
          const gridOffsetX = Math.floor((this.width - (cols * this.cellWidth)) / 2);
          currentNodes.forEach(node => {
            if (node.x !== undefined && node.y !== undefined) {
              const col = Math.max(0, Math.min(cols - 1, Math.round((node.x - gridOffsetX - (this.cellWidth - this.iconWidth) / 2) / this.cellWidth)));
              const row = Math.max(0, Math.round((node.y - this.marginY) / this.cellHeight));
              
              const targetX = gridOffsetX + col * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
              const targetY = this.marginY + row * this.cellHeight;
              
              this.vfs.updateNodePosition(node.id, targetX, targetY);
            }
          });
        }
        this.refreshFiles();
        break;
      case 'Zoom > 2x':
        window.dispatchEvent(new CustomEvent('set-zoom', { detail: 2 }));
        break;
      case 'Zoom > 3x':
        window.dispatchEvent(new CustomEvent('set-zoom', { detail: 3 }));
        break;
      case 'Zoom > 4x':
        window.dispatchEvent(new CustomEvent('set-zoom', { detail: 4 }));
        break;
    }
  }

  private showDeleteConfirm() {
    if (this.selectedIds.size === 0) return;
    
    let message = "";
    if (this.selectedIds.size === 1) {
      const id = Array.from(this.selectedIds)[0];
      const node = this.vfs.getNode(id);
      message = `Delete ${node?.isDirectory ? 'Folder' : 'File'}?`;
    } else {
      message = `Delete ${this.selectedIds.size} items?`;
    }

    const w = 200;
    const h = 80;
    const x = Math.floor((this.width - w) / 2);
    const y = Math.floor((this.height - h) / 2);

    this.modal = {
      message,
      onConfirm: () => {
        this.selectedIds.forEach(id => this.vfs.deleteNode(id));
        this.selectedIds.clear();
        this.refreshFiles();
      },
      rect: { x, y, w, h },
      confirmBtnRect: { x: x + 20, y: y + 45, w: 70, h: 20 },
      cancelBtnRect: { x: x + 110, y: y + 45, w: 70, h: 20 }
    };
  }

  private showCannotEditAlert() {
    const w = 220;
    const h = 75;
    const x = Math.floor((this.width - w) / 2);
    const y = Math.floor((this.height - h) / 2);

    this.modal = {
      message: 'You cannot edit this file',
      onConfirm: () => {
        this.modal = null;
      },
      isAlert: true,
      rect: { x, y, w, h },
      confirmBtnRect: { x: x + 75, y: y + 42, w: 70, h: 20 }
    };
  }

  private startRename(id: string, currentName: string) {
    if (id === 'root' || id === 'bin' || id === '..') {
      return;
    }
    this.renamingId = id;
    this.renameText = currentName;
    this.renameOriginalName = currentName;
    this.renameCursorPos = currentName.length;
    this.isRenameSelected = true;
    this.renameSelStart = 0;
    this.renameSelEnd = currentName.length;
    this.renameLastClickTime = performance.now();
  }

  private commitRename() {
    if (this.renamingId) {
      const trimmed = this.renameText.trim();
      const node = this.vfs.getNode(this.renamingId);
      const isSystemOrProtected = !node || !node.isUserCreated || this.renamingId === 'root' || this.renamingId === 'bin' || this.renamingId === '..' || this.renamingId === 'sys';

      if (isSystemOrProtected && trimmed !== this.renameOriginalName) {
        this.showCannotEditAlert();
      } else if (trimmed.length > 0 && !isSystemOrProtected && trimmed !== this.renameOriginalName) {
        this.vfs.renameNode(this.renamingId, trimmed);
        this.refreshFiles();
      }
    }
    this.renamingId = null;
    this.renameText = '';
    this.renameOriginalName = '';
    this.renameSelStart = null;
    this.renameSelEnd = null;
    this.isRenameSelected = false;
  }

  handlePaste(pastedText: string) {
    if (!pastedText) return;
    const cleanText = pastedText.replace(/[\r\n]+/g, ' ').trim();
    if (!cleanText) return;

    const now = performance.now();
    if (now - this.lastPasteTime < 150 && cleanText === this.lastPastedText) {
      return;
    }
    this.lastPasteTime = now;
    this.lastPastedText = cleanText;

    if (this.addFileModal) {
      const isUrl = this.addFileModal.activeField === 'url';
      const text = isUrl ? this.addFileModal.url : this.addFileModal.name;
      let cursorPos = isUrl ? this.addFileModal.urlCursorPos : this.addFileModal.nameCursorPos;
      const selStart = isUrl ? this.addFileModal.urlSelStart : this.addFileModal.nameSelStart;
      const selEnd = isUrl ? this.addFileModal.urlSelEnd : this.addFileModal.nameSelEnd;

      let start = cursorPos;
      let end = cursorPos;
      if (selStart !== null && selEnd !== null && selStart !== selEnd) {
        start = Math.min(selStart, selEnd);
        end = Math.max(selStart, selEnd);
      }

      const maxLen = isUrl ? 255 : 30;
      const availableSpace = maxLen - (text.length - (end - start));
      const insertText = cleanText.substring(0, Math.max(0, availableSpace));

      const newText = text.slice(0, start) + insertText + text.slice(end);
      cursorPos = start + insertText.length;

      if (isUrl) {
        this.addFileModal.url = newText;
        this.addFileModal.urlCursorPos = cursorPos;
        this.addFileModal.urlSelStart = null;
        this.addFileModal.urlSelEnd = null;
        this.onModalUrlChanged();
      } else {
        this.addFileModal.name = newText;
        this.addFileModal.nameCursorPos = cursorPos;
        this.addFileModal.nameSelStart = null;
        this.addFileModal.nameSelEnd = null;
        this.addFileModal.userEditedName = true;
      }
      return;
    }

    if (this.renamingId) {
      let selStart = this.renameSelStart;
      let selEnd = this.renameSelEnd;
      if (this.isRenameSelected && (selStart === null || selEnd === null)) {
        selStart = 0;
        selEnd = this.renameText.length;
      }
      const hasSelection = (selStart !== null && selEnd !== null && selStart !== selEnd) || this.isRenameSelected;
      const sMin = hasSelection ? (selStart !== null && selEnd !== null ? Math.min(selStart, selEnd) : 0) : this.renameCursorPos;
      const sMax = hasSelection ? (selStart !== null && selEnd !== null ? Math.max(selStart, selEnd) : this.renameText.length) : this.renameCursorPos;

      const availableSpace = 24 - (this.renameText.length - (sMax - sMin));
      const insertText = cleanText.substring(0, Math.max(0, availableSpace));
      this.renameText = this.renameText.slice(0, sMin) + insertText + this.renameText.slice(sMax);
      this.renameCursorPos = sMin + insertText.length;
      this.renameSelStart = null;
      this.renameSelEnd = null;
      this.isRenameSelected = false;
    }
  }

  handleKeyDown(key: string, ctrl: boolean = false, shift: boolean = false, alt: boolean = false) {
    if (this.modal) {
      if (key === 'Enter') {
        this.modal.onConfirm();
        this.modal = null;
        return;
      }
      if (key === 'Escape') {
        this.modal = null;
        return;
      }
      return;
    }

    if (this.addFileModal) {
      if (key === 'Escape') {
        this.addFileModal = null;
        return;
      }
      if (key === 'Enter') {
        this.submitAddFile();
        return;
      }
      if (key === 'Tab') {
        if (this.addFileModal.activeField === 'url') {
          this.resolveModalTitleNow();
        }
        this.addFileModal.activeField = this.addFileModal.activeField === 'url' ? 'name' : 'url';
        this.addFileModal.urlSelStart = null;
        this.addFileModal.urlSelEnd = null;
        this.addFileModal.nameSelStart = null;
        this.addFileModal.nameSelEnd = null;
        return;
      }

      const isUrl = this.addFileModal.activeField === 'url';
      const text = isUrl ? this.addFileModal.url : this.addFileModal.name;
      let cursorPos = isUrl ? this.addFileModal.urlCursorPos : this.addFileModal.nameCursorPos;
      let selStart = isUrl ? this.addFileModal.urlSelStart : this.addFileModal.nameSelStart;
      let selEnd = isUrl ? this.addFileModal.urlSelEnd : this.addFileModal.nameSelEnd;

      const hasSelection = selStart !== null && selEnd !== null && selStart !== selEnd;
      const sMin = hasSelection ? Math.min(selStart!, selEnd!) : cursorPos;
      const sMax = hasSelection ? Math.max(selStart!, selEnd!) : cursorPos;

      // Handle Ctrl Shortcuts
      if (ctrl) {
        const k = key.toLowerCase();
        if (k === 'a') {
          // Select All
          selStart = 0;
          selEnd = text.length;
          cursorPos = text.length;
          if (isUrl) {
            this.addFileModal.urlSelStart = selStart;
            this.addFileModal.urlSelEnd = selEnd;
            this.addFileModal.urlCursorPos = cursorPos;
          } else {
            this.addFileModal.nameSelStart = selStart;
            this.addFileModal.nameSelEnd = selEnd;
            this.addFileModal.nameCursorPos = cursorPos;
          }
          return;
        } else if (k === 'c') {
          // Copy
          const copyText = hasSelection ? text.substring(sMin, sMax) : text;
          if (copyText && navigator.clipboard) {
            navigator.clipboard.writeText(copyText).catch(() => {});
          }
          return;
        } else if (k === 'x') {
          // Cut
          const copyText = hasSelection ? text.substring(sMin, sMax) : text;
          if (copyText && navigator.clipboard) {
            navigator.clipboard.writeText(copyText).catch(() => {});
          }
          const newText = text.slice(0, sMin) + text.slice(sMax);
          cursorPos = sMin;
          if (isUrl) {
            this.addFileModal.url = newText;
            this.addFileModal.urlCursorPos = cursorPos;
            this.addFileModal.urlSelStart = null;
            this.addFileModal.urlSelEnd = null;
            this.onModalUrlChanged();
          } else {
            this.addFileModal.name = newText;
            this.addFileModal.nameCursorPos = cursorPos;
            this.addFileModal.nameSelStart = null;
            this.addFileModal.nameSelEnd = null;
            this.addFileModal.userEditedName = true;
          }
          return;
        } else if (k === 'v') {
          // Paste event is handled by window 'paste' listener
          return;
        }
        return;
      }

      // Cursor movement with Shift (Selection)
      if (key === 'ArrowLeft') {
        if (shift) {
          if (selStart === null) selStart = cursorPos;
          cursorPos = Math.max(0, cursorPos - 1);
          selEnd = cursorPos;
        } else {
          cursorPos = hasSelection ? sMin : Math.max(0, cursorPos - 1);
          selStart = null;
          selEnd = null;
        }
      } else if (key === 'ArrowRight') {
        if (shift) {
          if (selStart === null) selStart = cursorPos;
          cursorPos = Math.min(text.length, cursorPos + 1);
          selEnd = cursorPos;
        } else {
          cursorPos = hasSelection ? sMax : Math.min(text.length, cursorPos + 1);
          selStart = null;
          selEnd = null;
        }
      } else if (key === 'Home') {
        if (shift) {
          if (selStart === null) selStart = cursorPos;
          cursorPos = 0;
          selEnd = cursorPos;
        } else {
          cursorPos = 0;
          selStart = null;
          selEnd = null;
        }
      } else if (key === 'End') {
        if (shift) {
          if (selStart === null) selStart = cursorPos;
          cursorPos = text.length;
          selEnd = cursorPos;
        } else {
          cursorPos = text.length;
          selStart = null;
          selEnd = null;
        }
      } else if (key === 'Backspace') {
        if (hasSelection) {
          const newText = text.slice(0, sMin) + text.slice(sMax);
          cursorPos = sMin;
          selStart = null;
          selEnd = null;
          if (isUrl) {
            this.addFileModal.url = newText;
            this.onModalUrlChanged();
          } else {
            this.addFileModal.name = newText;
            this.addFileModal.userEditedName = true;
          }
        } else if (cursorPos > 0) {
          const newText = text.slice(0, cursorPos - 1) + text.slice(cursorPos);
          cursorPos--;
          if (isUrl) {
            this.addFileModal.url = newText;
            this.onModalUrlChanged();
          } else {
            this.addFileModal.name = newText;
            this.addFileModal.userEditedName = true;
          }
        }
      } else if (key === 'Delete') {
        if (hasSelection) {
          const newText = text.slice(0, sMin) + text.slice(sMax);
          cursorPos = sMin;
          selStart = null;
          selEnd = null;
          if (isUrl) {
            this.addFileModal.url = newText;
            this.onModalUrlChanged();
          } else {
            this.addFileModal.name = newText;
            this.addFileModal.userEditedName = true;
          }
        } else if (cursorPos < text.length) {
          const newText = text.slice(0, cursorPos) + text.slice(cursorPos + 1);
          if (isUrl) {
            this.addFileModal.url = newText;
            this.onModalUrlChanged();
          } else {
            this.addFileModal.name = newText;
            this.addFileModal.userEditedName = true;
          }
        }
      } else if (key.length === 1 && !alt) {
        const maxLen = isUrl ? 255 : 30;
        const textWithoutSel = text.slice(0, sMin) + text.slice(sMax);
        if (textWithoutSel.length < maxLen) {
          const newText = text.slice(0, sMin) + key + text.slice(sMax);
          cursorPos = sMin + 1;
          selStart = null;
          selEnd = null;
          if (isUrl) {
            this.addFileModal.url = newText;
            this.onModalUrlChanged();
          } else {
            this.addFileModal.name = newText;
            this.addFileModal.userEditedName = true;
          }
        }
      }

      if (isUrl) {
        this.addFileModal.urlCursorPos = cursorPos;
        this.addFileModal.urlSelStart = selStart;
        this.addFileModal.urlSelEnd = selEnd;
      } else {
        this.addFileModal.nameCursorPos = cursorPos;
        this.addFileModal.nameSelStart = selStart;
        this.addFileModal.nameSelEnd = selEnd;
      }
      return;
    }

    if (this.renamingId) {
      let selStart = this.renameSelStart;
      let selEnd = this.renameSelEnd;
      if (this.isRenameSelected && (selStart === null || selEnd === null)) {
        selStart = 0;
        selEnd = this.renameText.length;
      }
      const hasSelection = (selStart !== null && selEnd !== null && selStart !== selEnd) || this.isRenameSelected;
      const sMin = hasSelection ? (selStart !== null && selEnd !== null ? Math.min(selStart, selEnd) : 0) : this.renameCursorPos;
      const sMax = hasSelection ? (selStart !== null && selEnd !== null ? Math.max(selStart, selEnd) : this.renameText.length) : this.renameCursorPos;

      if (ctrl) {
        const k = key.toLowerCase();
        if (k === 'a') {
          this.isRenameSelected = true;
          this.renameSelStart = 0;
          this.renameSelEnd = this.renameText.length;
          this.renameCursorPos = this.renameText.length;
          return;
        } else if (k === 'c') {
          const copyText = hasSelection ? this.renameText.substring(sMin, sMax) : this.renameText;
          if (copyText && navigator.clipboard) {
            navigator.clipboard.writeText(copyText).catch(() => {});
          }
          return;
        } else if (k === 'x') {
          const copyText = hasSelection ? this.renameText.substring(sMin, sMax) : this.renameText;
          if (copyText && navigator.clipboard) {
            navigator.clipboard.writeText(copyText).catch(() => {});
          }
          this.renameText = this.renameText.slice(0, sMin) + this.renameText.slice(sMax);
          this.renameCursorPos = sMin;
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
          return;
        } else if (k === 'v') {
          // Paste event is handled by window 'paste' listener
          return;
        }
        return;
      }

      if (key === 'Enter') {
        this.commitRename();
      } else if (key === 'Escape') {
        this.renamingId = null;
      } else if (key === 'ArrowLeft') {
        if (shift) {
          if (this.renameSelStart === null) this.renameSelStart = this.renameCursorPos;
          this.renameCursorPos = Math.max(0, this.renameCursorPos - 1);
          this.renameSelEnd = this.renameCursorPos;
          this.isRenameSelected = (this.renameSelStart !== this.renameSelEnd);
        } else {
          this.renameCursorPos = hasSelection ? sMin : Math.max(0, this.renameCursorPos - 1);
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
        }
      } else if (key === 'ArrowRight') {
        if (shift) {
          if (this.renameSelStart === null) this.renameSelStart = this.renameCursorPos;
          this.renameCursorPos = Math.min(this.renameText.length, this.renameCursorPos + 1);
          this.renameSelEnd = this.renameCursorPos;
          this.isRenameSelected = (this.renameSelStart !== this.renameSelEnd);
        } else {
          this.renameCursorPos = hasSelection ? sMax : Math.min(this.renameText.length, this.renameCursorPos + 1);
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
        }
      } else if (key === 'Home') {
        if (shift) {
          if (this.renameSelStart === null) this.renameSelStart = this.renameCursorPos;
          this.renameCursorPos = 0;
          this.renameSelEnd = this.renameCursorPos;
          this.isRenameSelected = (this.renameSelStart !== this.renameSelEnd);
        } else {
          this.renameCursorPos = 0;
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
        }
      } else if (key === 'End') {
        if (shift) {
          if (this.renameSelStart === null) this.renameSelStart = this.renameCursorPos;
          this.renameCursorPos = this.renameText.length;
          this.renameSelEnd = this.renameCursorPos;
          this.isRenameSelected = (this.renameSelStart !== this.renameSelEnd);
        } else {
          this.renameCursorPos = this.renameText.length;
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
        }
      } else if (key === 'Backspace') {
        if (hasSelection) {
          this.renameText = this.renameText.slice(0, sMin) + this.renameText.slice(sMax);
          this.renameCursorPos = sMin;
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
        } else if (this.renameCursorPos > 0) {
          this.renameText = this.renameText.slice(0, this.renameCursorPos - 1) + this.renameText.slice(this.renameCursorPos);
          this.renameCursorPos--;
        }
      } else if (key === 'Delete') {
        if (hasSelection) {
          this.renameText = this.renameText.slice(0, sMin) + this.renameText.slice(sMax);
          this.renameCursorPos = sMin;
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
        } else if (this.renameCursorPos < this.renameText.length) {
          this.renameText = this.renameText.slice(0, this.renameCursorPos) + this.renameText.slice(this.renameCursorPos + 1);
        }
      } else if (key.length === 1 && !alt) { 
        const textWithoutSel = this.renameText.slice(0, sMin) + this.renameText.slice(sMax);
        if (textWithoutSel.length < 24) {
          this.renameText = this.renameText.slice(0, sMin) + key + this.renameText.slice(sMax);
          this.renameCursorPos = sMin + 1;
          this.renameSelStart = null;
          this.renameSelEnd = null;
          this.isRenameSelected = false;
        }
      }
    } else {
      if (ctrl) {
        const k = key.toLowerCase();
        if (k === 'c' && this.selectedIds.size > 0) {
          this.clipboard = { ids: new Set(this.selectedIds), type: 'copy' };
          return;
        } else if (k === 'x' && this.selectedIds.size > 0) {
          this.clipboard = { ids: new Set(this.selectedIds), type: 'cut' };
          return;
        } else if (k === 'v' && this.clipboard) {
          this.clipboard.ids.forEach(id => {
            this.vfs.copyNode(id, this.currentFolderId);
          });
          this.refreshFiles();
          return;
        } else if (k === 'a') {
          this.selectedIds.clear();
          for (const f of this.currentFiles) {
            this.selectedIds.add(f.id);
          }
          return;
        }
      }
      if (key === 'Delete' && this.selectedIds.size > 0) {
        this.showDeleteConfirm();
      }
    }
  }

  handleMouseMove(x: number, y: number) {
    const cy = y - this.scrollY;

    if (this.textSelectTarget && this.addFileModal) {
      if (this.textSelectTarget === 'modal-url') {
        const { urlInputRect, url } = this.addFileModal;
        let visibleUrl = url;
        let urlOffset = 0;
        const maxUrlWidth = urlInputRect.w - 10;
        while (this.font.measureText(visibleUrl) > maxUrlWidth && urlOffset < this.addFileModal.urlCursorPos) {
          urlOffset++;
          visibleUrl = url.substring(urlOffset);
        }
        const clickOffset = x - (urlInputRect.x + 4);
        const charIdx = Math.min(url.length, urlOffset + getCharIndexAtX(this.font, visibleUrl, clickOffset));
        this.addFileModal.urlSelStart = this.textSelectAnchor;
        this.addFileModal.urlSelEnd = charIdx;
        this.addFileModal.urlCursorPos = charIdx;
        return;
      } else if (this.textSelectTarget === 'modal-name') {
        const { nameInputRect, name } = this.addFileModal;
        const clickOffset = x - (nameInputRect.x + 4);
        const charIdx = Math.min(name.length, getCharIndexAtX(this.font, name, clickOffset));
        this.addFileModal.nameSelStart = this.textSelectAnchor;
        this.addFileModal.nameSelEnd = charIdx;
        this.addFileModal.nameCursorPos = charIdx;
        return;
      }
    }

    if (this.textSelectTarget === 'rename' && this.renamingId) {
      const cols = Math.floor(this.width / this.cellWidth);
      const gridOffsetX = Math.floor((this.width - (cols * this.cellWidth)) / 2);
      for (let i = 0; i < this.currentFiles.length; i++) {
        const file = this.currentFiles[i];
        if (file.id === this.renamingId) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const iconX = file.x !== undefined ? file.x : gridOffsetX + col * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
          const iconY = file.y !== undefined ? file.y : this.marginY + row * this.cellHeight;
          const centerX = iconX + this.iconWidth / 2;
          const lines = this.formatNameLines(this.renameText);
          const by = iconY + this.iconHeight + 4;
          const lineIdx = (cy >= by + 12 && lines.length > 1) ? 1 : 0;
          const textWidth = this.font.measureText(lines[lineIdx]);
          const textX = Math.floor(centerX - textWidth / 2);
          const clickOffset = x - textX;
          const charIdxInLine = getCharIndexAtX(this.font, lines[lineIdx], clickOffset);
          const charIdx = lineIdx === 0 ? Math.min(this.renameText.length, Math.min(14, charIdxInLine)) : Math.min(this.renameText.length, 14 + charIdxInLine);
          this.renameSelStart = this.textSelectAnchor;
          this.renameSelEnd = charIdx;
          this.renameCursorPos = charIdx;
          this.isRenameSelected = (Math.min(this.textSelectAnchor, charIdx) === 0 && Math.max(this.textSelectAnchor, charIdx) >= this.renameText.length && this.renameText.length > 0);
          return;
        }
      }
    }

    if (this.selectionBox) {
      this.selectionBox.x2 = x;
      this.selectionBox.y2 = cy;
      
      const xMin = Math.min(this.selectionBox.x1, this.selectionBox.x2);
      const xMax = Math.max(this.selectionBox.x1, this.selectionBox.x2);
      const yMin = Math.min(this.selectionBox.y1, this.selectionBox.y2);
      const yMax = Math.max(this.selectionBox.y1, this.selectionBox.y2);
      
      const cols = Math.floor(this.width / this.cellWidth);
      const gridOffsetX = Math.floor((this.width - (cols * this.cellWidth)) / 2);

      this.currentFiles.forEach((file, i) => {
        if (file.id === '..') return;
        let iconX, iconY;
        if (file.x !== undefined && file.y !== undefined) {
          iconX = file.x;
          iconY = file.y;
        } else {
          const col = i % cols;
          const row = Math.floor(i / cols);
          iconX = gridOffsetX + col * this.cellWidth + (this.cellWidth - this.iconWidth) / 2;
          iconY = this.marginY + row * this.cellHeight;
        }
        
        // Simple bounding box check for icon
        const overlap = !(iconX > xMax || iconX + this.iconWidth < xMin || iconY > yMax || iconY + this.iconHeight < yMin);
        if (overlap) {
          this.selectedIds.add(file.id);
        }
      });
      return;
    }

    if (this.draggingId) {
      const cy = y - this.scrollY;
      const file = this.vfs.getNode(this.draggingId);
      if (file) {
        let newX = x - this.dragOffsetX;
        let newY = cy - this.dragOffsetY;
        
        if (this.draggingSelected) {
          const mainStart = this.dragInitialPositions.get(this.draggingId);
          if (mainStart) {
            const dx = newX - mainStart.x;
            const dy = newY - mainStart.y;
            
            this.selectedIds.forEach(id => {
              const start = this.dragInitialPositions.get(id);
              if (start) {
                this.vfs.updateNodePosition(id, start.x + dx, start.y + dy);
              }
            });
          }
        } else {
          this.vfs.updateNodePosition(this.draggingId, newX, newY);
        }
      }
      this.refreshFiles();
      return;
    }

    if (this.contextMenu) {
      const menuWidth = 120;
      const menuHeight = this.contextMenu.options.length * 20 + 4;
      let mx = this.contextMenu.x;
      let my = this.contextMenu.y;
      if (mx + menuWidth > this.width) mx = this.width - menuWidth;
      if (my + menuHeight > this.height) my = this.height - menuHeight;

      if (x >= mx && x <= mx + menuWidth && y >= my && y <= my + menuHeight) {
        const idx = Math.floor((y - my - 2) / 20);
        if (idx >= 0 && idx < this.contextMenu.options.length) {
          const opt = this.contextMenu.options[idx];
          const isDisabled = opt === 'Paste' && !this.clipboard;
          this.contextMenu.hoveredIndex = isDisabled ? -1 : idx;
          return;
        }
      }

      // Check if we are over the sub-menu if Zoom is hovered
      if (this.contextMenu.hoveredIndex !== -1 && this.contextMenu.options[this.contextMenu.hoveredIndex] === 'Zoom') {
        const subWidth = 60;
        const subHeight = 3 * 20 + 4;
        let smx = mx + menuWidth;
        let smy = my + this.contextMenu.hoveredIndex * 20;
        if (smx + subWidth > this.width) smx = mx - subWidth;
        if (smy + subHeight > this.height) smy = this.height - subHeight;

        if (x >= smx && x <= smx + subWidth && y >= smy && y <= smy + subHeight) {
          const idx = Math.floor((y - smy - 2) / 20);
          if (idx >= 0 && idx < 3) {
            this.contextMenu.hoveredSubIndex = idx;
          } else {
            this.contextMenu.hoveredSubIndex = -1;
          }
          return;
        }
      }

      this.contextMenu.hoveredIndex = -1;
      this.contextMenu.hoveredSubIndex = -1;
    }
  }

  handleMouseUp() {
    this.draggingId = null;
    this.draggingSelected = false;
    this.selectionBox = null;
    this.dragInitialPositions.clear();

    if (this.textSelectTarget) {
      if (this.addFileModal) {
        if (this.addFileModal.urlSelStart === this.addFileModal.urlSelEnd) {
          this.addFileModal.urlSelStart = null;
          this.addFileModal.urlSelEnd = null;
        }
        if (this.addFileModal.nameSelStart === this.addFileModal.nameSelEnd) {
          this.addFileModal.nameSelStart = null;
          this.addFileModal.nameSelEnd = null;
        }
      }
      if (this.renameSelStart === this.renameSelEnd) {
        this.renameSelStart = null;
        this.renameSelEnd = null;
        this.isRenameSelected = false;
      }
      this.textSelectTarget = null;
    }
  }

  private executeFile(file: VFSNode) {
    if (file.isDirectory) {
      this.scrollHistory.set(this.currentFolderId, this.scrollY);
      if (file.id === '..') {
        this.currentFolderId = file.parentId || 'root';
      } else {
        this.currentFolderId = file.id;
      }
      this.selectedIds.clear();
      this.lastSelectedId = null;
      this.refreshFiles();
      this.scrollY = this.scrollHistory.get(this.currentFolderId) || 0;
      this.clampScroll();
    } else if (file.url) {
      this.handleMouseUp();
      const normalized = normalizeUrl(file.url);
      const baseUrl = import.meta.env.BASE_URL || './';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const targetUrl = normalized.startsWith('http://') || normalized.startsWith('https://') 
        ? normalized 
        : `${cleanBase}${normalized.replace(/^\/+/, '')}`;
      window.open(targetUrl, '_blank');
    }
  }
}
