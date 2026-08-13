# Low Resolution Manifest: PixDraw 640x340

To ensure a truly native low-resolution experience, the following rules are ABSOLUTE and MUST NOT be broken.

## 1. The Single Source of Truth
- The application must render to a single buffer (HTML5 Canvas) with a fixed size of **640 x 340 pixels**.
- NO other visual elements (DOM buttons, text, overlays) are permitted.

## 2. UI and Text
- ALL UI elements (panels, windows, buttons, sliders) must be drawn directly into the 640x340 buffer.
- Text must be rendered using a pixel-perfect bitmap font. Standard browser font rendering at high DPI is strictly forbidden.

## 3. The Cursor
- The system cursor MUST be hidden (`cursor: none`).
- A custom cursor must be drawn at the native 640x340 resolution.
- Mouse coordinates must be mapped from the screen/window space back to the 640x340 coordinate space.

## 4. Upscaling
- The 640x340 canvas is the only thing the application "knows" about rendering.
- Upscaling for the user's display must be handled exclusively by CSS (`image-rendering: pixelated`) or a separate "display-only" canvas that performs a nearest-neighbor upscale.
- The internal state and rendering logic MUST remain at 640x340.
- **Integer Scaling**: 
  - Always use **integer multiples** for upscaling (2x, 3x, 4x, etc.).
  - Never use fractional scaling (e.g., 1.5x) to avoid distorted or "fat" pixels.

## 5. Input Handling
- All input (mouse clicks, movement) must be integer-aligned to the 640x340 grid before being processed by the application logic.

## 6. No Anti-Aliasing
- All drawing operations must result in sharp, pixelated edges. No sub-pixel rendering or anti-aliasing is allowed.
