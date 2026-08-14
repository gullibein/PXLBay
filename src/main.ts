import { OS } from './os';

const canvas = document.getElementById('os-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const os = new OS();
os.resize(canvas.width, canvas.height);

let mouseX = 320;
let mouseY = 180;



window.addEventListener('os-resize', (e: Event) => {
  const customEvent = e as CustomEvent;
  const { width, height } = customEvent.detail;
  os.resize(width, height);
});



window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate the actual CSS-to-Logical scale directly from the canvas dimensions.
  // This is the most robust way to ensure 1:1 alignment with the system cursor.
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;

  mouseX = (e.clientX - rect.left) / scaleX;
  mouseY = (e.clientY - rect.top) / scaleY;

  const clampedX = Math.max(0, Math.min(canvas.width - 1, mouseX));
  const clampedY = Math.max(0, Math.min(canvas.height - 1, mouseY));

  os.handleMouseMove(Math.floor(clampedX), Math.floor(clampedY));
});

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

window.addEventListener('mousedown', (e) => {
  os.handleMouseDown(Math.floor(mouseX), Math.floor(mouseY), e.button, e.shiftKey, e.ctrlKey || e.metaKey);
});

window.addEventListener('keydown', (e) => {
  os.handleKeyDown(e.key);
});

window.addEventListener('mouseup', () => {
  os.handleMouseUp();
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
