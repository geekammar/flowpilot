/**
 * Generates the FlowPilot PWA icon set as PNGs (no image tooling needed
 * on-device — pure Node with the built-in zlib).
 *
 * Brand mark: dark rounded square + white "A" glyph (matches
 * public/icon.svg). Maskable + Apple variants use a full-bleed background
 * with the glyph inside the safe zone.
 *
 * Run with: pnpm icons
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── Minimal PNG encoder (RGBA, 8-bit) ──────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Brand mark rasterizer (64×64 design space, 4× supersampling) ──

const BG = [10, 10, 10, 255]; // #0a0a0a
const GLYPH = [255, 255, 255, 255];

/** Glyph strokes: an "A" — two diagonals + crossbar (matches icon.svg). */
const STROKES = [
  [18, 44, 32, 16],
  [32, 16, 46, 44],
  [24, 34, 40, 34],
];
const STROKE_RADIUS = 2.5; // half of stroke-width 5

function sdSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const lenSq = abx * abx + aby * aby;
  const t =
    lenSq === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / lenSq));
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}

function sdRoundRect(px, py, half, radius) {
  const qx = Math.abs(px - 32) - (half - radius);
  const qy = Math.abs(py - 32) - (half - radius);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(ox, oy) - radius;
}

function glyphHit(px, py, scale) {
  for (const [ax, ay, bx, by] of STROKES) {
    const sax = 32 + (ax - 32) * scale;
    const say = 32 + (ay - 32) * scale;
    const sbx = 32 + (bx - 32) * scale;
    const sby = 32 + (by - 32) * scale;
    if (sdSegment(px, py, sax, say, sbx, sby) <= STROKE_RADIUS * scale) {
      return true;
    }
  }
  return false;
}

const SUPERSAMPLE = 4;

/**
 * @param size       output square size in pixels
 * @param fullBleed  true → opaque background everywhere (maskable/Apple)
 * @param glyphScale glyph scale around the center (safe-zone aware)
 */
function renderIcon(size, { fullBleed, glyphScale }) {
  const rgba = Buffer.alloc(size * size * 4);
  const step = 64 / size;
  const half = 32;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy += 1) {
        for (let sx = 0; sx < SUPERSAMPLE; sx += 1) {
          const px = (x + (sx + 0.5) / SUPERSAMPLE) * step;
          const py = (y + (sy + 0.5) / SUPERSAMPLE) * step;
          const insideShape = fullBleed || sdRoundRect(px, py, half, 14) <= 0;
          if (!insideShape) continue;
          const [cr, cg, cb, ca] = glyphHit(px, py, glyphScale) ? GLYPH : BG;
          r += cr * ca;
          g += cg * ca;
          b += cb * ca;
          a += ca;
        }
      }
      const samples = SUPERSAMPLE * SUPERSAMPLE;
      const idx = (y * size + x) * 4;
      if (a === 0) {
        rgba[idx] = 0;
        rgba[idx + 1] = 0;
        rgba[idx + 2] = 0;
        rgba[idx + 3] = 0;
      } else {
        rgba[idx] = Math.round(r / a);
        rgba[idx + 1] = Math.round(g / a);
        rgba[idx + 2] = Math.round(b / a);
        rgba[idx + 3] = Math.round(a / samples);
      }
    }
  }
  return encodePng(size, size, rgba);
}

// ── Generate the set ────────────────────────────────────────────

const OUTPUTS = [
  {
    file: "public/icons/icon-192.png",
    size: 192,
    fullBleed: false,
    glyphScale: 1,
  },
  {
    file: "public/icons/icon-512.png",
    size: 512,
    fullBleed: false,
    glyphScale: 1,
  },
  // Maskable: full-bleed bg, glyph inside the ~80% safe zone.
  {
    file: "public/icons/maskable-512.png",
    size: 512,
    fullBleed: true,
    glyphScale: 0.62,
  },
  // Apple touch icon: full-bleed square (iOS applies its own corner mask).
  {
    file: "src/app/apple-icon.png",
    size: 180,
    fullBleed: true,
    glyphScale: 0.62,
  },
];

for (const output of OUTPUTS) {
  const target = resolve(PROJECT_ROOT, output.file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, renderIcon(output.size, output));
  console.log(`✔ ${output.file} (${output.size}×${output.size})`);
}
console.log("✅ تم توليد أيقونات PWA بنجاح.");
