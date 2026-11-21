// WP-1.1 — deterministic icon generator for the Electrophysics Lab desktop
// shell. Pure Node (node:zlib only), no dependencies, no network: writes
// exactly the icons referenced by `tauri.conf.json` (`bundle.icon`):
//   icons/32x32.png, icons/128x128.png, icons/icon.ico
//
// The mark is a simple geometric composition — navy rounded square, amber
// electron orbit, cyan lightning bolt — rasterized by a tiny supersampled
// software rasterizer. Run: `node gen-icon.mjs` (from this directory).

import { deflateSync, crc32 } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

// --- palette (sRGB, 0-255) -------------------------------------------------
const BG = [11, 30, 58, 255]; // navy  #0B1E3A
const RING_RGB = [255, 179, 71, 255]; // amber #FFB347
const BOLT = [53, 224, 216, 255]; // cyan  #35E0D8
const CORNER_RADIUS = 0.18; // fraction of size
const RING = { cx: 0.5, cy: 0.52, rx: 0.44, ry: 0.17, thickness: 0.045 };
// Lightning bolt polygon (unit square, y down).
const BOLT_POLY = [
  [0.58, 0.06], [0.22, 0.55], [0.42, 0.55], [0.34, 0.94],
  [0.70, 0.42], [0.49, 0.42], [0.63, 0.06],
];

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Coverage (0..1) of the drawn mark at normalized (x, y), 3×3 supersampled. */
function coverage(x, y) {
  let hit = 0;
  for (let sy = 0; sy < 3; sy++) {
    for (let sx = 0; sx < 3; sx++) {
      const px = x + (sx + 0.5) / 3;
      const py = y + (sy + 0.5) / 3;
      // Rounded-square background.
      const r = CORNER_RADIUS;
      const dx = Math.max(Math.abs(px - 0.5) - (0.5 - r), 0);
      const dy = Math.max(Math.abs(py - 0.5) - (0.5 - r), 0);
      if (Math.hypot(dx, dy) > r) continue;
      // Electron orbit ring (normalized ellipse distance in stretched space).
      const ex = (px - RING.cx) / RING.rx;
      const ey = (py - RING.cy) / RING.ry;
      const d = Math.abs(Math.hypot(ex, ey) - 1);
      const ringPx = d * Math.min(RING.rx, RING.ry) * 2; // approx px distance
      if (ringPx <= RING.thickness || pointInPolygon(px, py, BOLT_POLY)) hit++;
    }
  }
  return hit / 9;
}

function rasterize(size) {
  // RGBA top-down buffer.
  const buf = Buffer.alloc(size * size * 4);
  const scale = 1 / size;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const c = coverage(px * scale, py * scale);
      const i = (py * size + px) * 4;
      if (c <= 0) continue; // transparent
      // Blend: ring first, bolt on top; bg where neither covers.
      // coverage() blends ring/bolt/bg jointly; recompute layers for color.
      let r = BG[0], g = BG[1], b = BG[2];
      const ex = (px + 0.5) * scale - RING.cx, ey = (py + 0.5) * scale - RING.cy;
      const d = Math.abs(Math.hypot(ex / RING.rx, ey / RING.ry) - 1);
      const ringPx = d * Math.min(RING.rx, RING.ry) * 2;
      const onRing = ringPx <= RING.thickness;
      const onBolt = pointInPolygon((px + 0.5) * scale, (py + 0.5) * scale, BOLT_POLY);
      if (onRing) { r = RING_RGB[0]; g = RING_RGB[1]; b = RING_RGB[2]; }
      if (onBolt) { r = BOLT[0]; g = BOLT[1]; b = BOLT[2]; }
      buf[i] = Math.round(r);
      buf[i + 1] = Math.round(g);
      buf[i + 2] = Math.round(b);
      buf[i + 3] = Math.round(255 * c);
    }
  }
  return buf;
}

// --- minimal PNG encoder (RGBA, filter 0) ----------------------------------
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

function png(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- ICO writer -------------------------------------------------------------
// Entries ≤ 64 px use classic BI_RGB 32bpp BMP data (max compatibility);
// 128/256 px entries are PNG-compressed inside the ICO (Vista+ standard,
// same as Tauri's own icons) to keep the binary small.
function ico(sizes) {
  const images = sizes.map((size) => {
    const rgba = rasterize(size);
    if (size > 64) {
      return { size, png: true, data: png(size, size, rgba) };
    }
    // XOR data: BGRA, bottom-up.
    const xor = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      const srcY = size - 1 - y;
      for (let x = 0; x < size; x++) {
        const s = (srcY * size + x) * 4;
        const d = (y * size + x) * 4;
        xor[d] = rgba[s + 2];
        xor[d + 1] = rgba[s + 1];
        xor[d + 2] = rgba[s];
        xor[d + 3] = rgba[s + 3];
      }
    }
    const andRow = (((size + 31) >> 5) * 4);
    const and = Buffer.alloc(andRow * size); // fully transparent alpha already in XOR
    const header = Buffer.alloc(40);
    header.writeUInt32LE(40, 0);
    header.writeInt32LE(size, 4);
    header.writeInt32LE(size * 2, 8); // double height (XOR + AND)
    header.writeUInt16LE(1, 12);
    header.writeUInt16LE(32, 14);
    header.writeUInt32LE(0, 16); // BI_RGB
    header.writeUInt32LE(xor.length + and.length, 20);
    return { size, png: false, data: Buffer.concat([header, xor, and]) };
  });
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const img of images) {
    const e = Buffer.alloc(16);
    e[0] = img.size === 256 ? 0 : img.size;
    e[1] = img.size === 256 ? 0 : img.size;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(img.data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += img.data.length;
    entries.push(e);
  }
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(images.length, 4);
  return Buffer.concat([dir, ...entries, ...images.map((i) => i.data)]);
}

// --- write outputs ----------------------------------------------------------
writeFileSync(path.join(here, '32x32.png'), png(32, 32, rasterize(32)));
writeFileSync(path.join(here, '128x128.png'), png(128, 128, rasterize(128)));
writeFileSync(path.join(here, 'icon.ico'), ico([16, 24, 32, 48, 64, 128, 256]));
console.log('icons written: 32x32.png, 128x128.png, icon.ico');
