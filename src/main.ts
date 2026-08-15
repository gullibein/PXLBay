import { OS } from './os';

const canvas = document.getElementById('os-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const os = new OS();
os.resize(canvas.width, canvas.height);

let mouseX = 320;
let mouseY = 180;
let isTouchMode = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

window.addEventListener('os-resize', (e: Event) => {
  const customEvent = e as CustomEvent;
  const { width, height, scale, zoomMode } = customEvent.detail;
  os.resize(width, height, scale, zoomMode);
});

function getLogicalCoords(clientX: number, clientY: number): { x: number, y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;

  const lx = (clientX - rect.left) / scaleX;
  const ly = (clientY - rect.top) / scaleY;

  return {
    x: Math.max(0, Math.min(canvas.width - 1, Math.floor(lx))),
    y: Math.max(0, Math.min(canvas.height - 1, Math.floor(ly)))
  };
}

window.addEventListener('mousemove', (e) => {
  if (e.movementX !== 0 || e.movementY !== 0) {
    isTouchMode = false;
  }
  const { x, y } = getLogicalCoords(e.clientX, e.clientY);
  mouseX = x;
  mouseY = y;
  os.handleMouseMove(x, y);
});

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

window.addEventListener('mousedown', (e) => {
  if (!isTouchMode) {
    const { x, y } = getLogicalCoords(e.clientX, e.clientY);
    mouseX = x;
    mouseY = y;
    os.handleMouseDown(x, y, e.button, e.shiftKey, e.ctrlKey || e.metaKey);
  }
});

// Touch event handling for Phones & Tablets
let touchStartX = 0;
let touchStartY = 0;
let prevTouchY = 0;
let touchMoved = false;
let isLongPressed = false;
let longPressTimer: any = null;

canvas.addEventListener('touchstart', (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  isTouchMode = true;
  const touch = e.touches[0];
  const { x, y } = getLogicalCoords(touch.clientX, touch.clientY);
  touchStartX = x;
  touchStartY = y;
  prevTouchY = y;
  touchMoved = false;
  isLongPressed = false;

  mouseX = x;
  mouseY = y;

  if (longPressTimer) {
    clearTimeout(longPressTimer);
  }

  // Touching and holding equals right-clicking
  longPressTimer = setTimeout(() => {
    isLongPressed = true;
    os.handleTouchHold(touchStartX, touchStartY);
  }, 450);
}, { passive: false });

canvas.addEventListener('touchmove', (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  e.preventDefault();
  const touch = e.touches[0];
  const { x, y } = getLogicalCoords(touch.clientX, touch.clientY);
  const dist = Math.hypot(x - touchStartX, y - touchStartY);

  if (dist > 6) {
    touchMoved = true;
    if (!isLongPressed && longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
      // Scroll desktop vertically if moving without holding
      const dy = y - prevTouchY;
      os.handleScroll(dy, x, y);
    } else if (isLongPressed) {
      // Moving finger after holding moves the file/folder
      os.handleTouchMoveDrag(x, y);
    }
  }

  prevTouchY = y;
  mouseX = x;
  mouseY = y;
}, { passive: false });

canvas.addEventListener('touchend', (_e: TouchEvent) => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }

  if (!isLongPressed && !touchMoved) {
    // Single touch opens file/folder once or clicks UI
    os.handleTouchTap(touchStartX, touchStartY);
  } else if (isLongPressed) {
    os.handleMouseUp();
  }

  isLongPressed = false;
  touchMoved = false;
}, { passive: false });

canvas.addEventListener('touchcancel', () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  os.handleMouseUp();
  isLongPressed = false;
  touchMoved = false;
});

window.addEventListener('keydown', (e) => {
  os.handleKeyDown(e.key, e.ctrlKey || e.metaKey, e.shiftKey, e.altKey);
});

window.addEventListener('paste', (e) => {
  const text = e.clipboardData?.getData('text');
  if (text) {
    os.handlePaste(text);
  }
});

window.addEventListener('mouseup', () => {
  if (!isTouchMode) {
    os.handleMouseUp();
  }
});

window.addEventListener('blur', () => {
  os.handleMouseUp();
});

window.addEventListener('focus', () => {
  os.handleMouseUp();
});

document.addEventListener('mouseleave', () => {
  os.handleMouseUp();
});

window.addEventListener('wheel', (e) => {
  const delta = Math.sign(e.deltaY) * 20; 
  os.handleScroll(-delta, mouseX, mouseY);
});

function drawCursor() {
  if (isTouchMode) return;

  ctx.fillStyle = '#FFF';
  ctx.strokeStyle = '#000';
  
  const clampedX = Math.max(0, Math.min(canvas.width - 1, mouseX));
  const clampedY = Math.max(0, Math.min(canvas.height - 1, mouseY));

  ctx.beginPath();
  ctx.moveTo(clampedX, clampedY);
  ctx.lineTo(clampedX + 10, clampedY + 10);
  ctx.lineTo(clampedX + 4, clampedY + 10);
  ctx.lineTo(clampedX + 4, clampedY + 15);
  ctx.lineTo(clampedX, clampedY + 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function loop() {
  os.update();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  os.draw(ctx);
  drawCursor();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
