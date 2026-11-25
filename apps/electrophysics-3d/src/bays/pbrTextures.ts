// @ts-nocheck
// This module uses plain ECMAScript so Node can exercise the exact renderer input
// without a canvas, WebGL, or an installed Three.js package.
export const PBR_SURFACES = Object.freeze([
  'aluminum', 'gold', 'brass', 'copper', 'silicon', 'fr4-green', 'fr4-black', 'glass', 'sapphire',
]);

const SIZE_OPTIONS = new Set([64, 128, 256]);
const PCB_TINT = { 'fr4-green': [15, 81, 50], 'fr4-black': [18, 21, 25] };
const LETTERS = [
  ['111', '101', '111', '100', '100'],
  ['111', '100', '100', '100', '111'],
  ['110', '101', '110', '101', '110'],
];

function validate(surface, seed, size) {
  if (!PBR_SURFACES.includes(surface)) throw new RangeError('Unknown studio surface');
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('Expected an unsigned 32-bit texture seed');
  if (!SIZE_OPTIONS.has(size)) throw new RangeError('Texture size must be 64, 128, or 256 texels');
}

function noise(seed, x, y) {
  let hash = seed ^ Math.imul(x + 1, 0x45d9f3b) ^ Math.imul(y + 1, 0x27d4eb2d);
  hash = Math.imul(hash ^ hash >>> 16, 0x7feb352d);
  hash = Math.imul(hash ^ hash >>> 15, 0x846ca68b);
  return ((hash ^ hash >>> 16) >>> 0) / 0xffffffff;
}

function byte(n) {
  return Math.round(Math.min(255, Math.max(0, n)));
}

/** Cosmetic material fields. The sampled values do not represent metrology. */
function profile(surface, u, v, grain, rake) {
  const radius = Math.hypot(u - 0.5, v - 0.5);
  switch (surface) {
    case 'aluminum':
      return 0.75 * Math.cos(v * Math.PI * 96) + 0.43 * rake + 0.12 * grain;
    case 'gold':
    case 'brass':
      return 0.55 * Math.cos(radius * Math.PI * 152) + 0.2 * grain;
    case 'copper':
      return 0.27 * grain + 0.16 * Math.sin(Math.PI * 12 * u) * Math.sin(Math.PI * 12 * v);
    case 'silicon':
      return 0.08 * Math.sin(radius * Math.PI * 22) + 0.035 * grain;
    case 'glass':
    case 'sapphire':
      return 0.045 * grain;
    default: {
      const x = Math.cos(u * Math.PI * 24);
      const y = Math.cos(v * Math.PI * 24);
      const interleave = Math.cos(u * Math.PI * 12) * Math.cos(v * Math.PI * 12);
      return 0.28 * (x + y) + 0.2 * interleave * (x - y) + 0.08 * grain;
    }
  }
}

function pcbLayer(u, v) {
  const x = Math.floor((u - 0.09) * 64);
  const y = Math.floor((v - 0.80) * 64);
  if (x >= 0 && x < 11 && y >= 0 && y < 5 && LETTERS[Math.floor(x / 4)]?.[y]?.[x % 4] === '1') return 2;
  if (u < 0.1 || u > 0.9 || v < 0.09 || v > 0.72) return 0;
  const t = (v - 0.09) / 0.63 * 6;
  const lane = Math.floor(t);
  // Each trace follows an X/Z dogleg and ends in exposed pads.
  const bend = Math.min(0.24, Math.max(0, (u - 0.28) * 1.1));
  const distance = Math.abs(t - lane - 0.36 - bend);
  if (distance < 0.1 || (distance < 0.23 && (u < 0.15 || u > 0.85))) return 1;
  return 0;
}

/** Return RGBA albedo, tangent-space normal and scalar roughness map descriptors. */
export function generatePbrMaps(surface, seed = 72, size = 128) {
  validate(surface, seed, size);
  const count = size * size;
  const field = new Float32Array(count);
  const albedo = new Uint8Array(count * 4);
  const normal = new Uint8Array(count * 4);
  const roughness = new Uint8Array(count * 4);
  const tint = PCB_TINT[surface];
  const metallic = tint ? new Uint8Array(count * 4) : null;
  for (let y = 0; y < size; y++) {
    const rake = noise(seed, 0, y) - 0.5;
    for (let x = 0; x < size; x++) {
      field[y * size + x] = profile(surface, x / size, y / size, noise(seed, x, y) - 0.5, rake);
    }
  }
  const texel = (x, y) => field[((y + size) % size) * size + (x + size) % size];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const value = texel(x, y);
      const layer = tint ? pcbLayer(x / size, y / size) : 0;
      if (layer === 2) albedo.set([220, 232, 215, 255], i);
      else if (layer === 1) albedo.set([184, 113, 53, 255], i);
      else {
        const shade = tint ? 1 + value * 0.22 : 0.94 + value * 0.06;
        albedo[i] = byte((tint?.[0] ?? 255) * shade);
        albedo[i + 1] = byte((tint?.[1] ?? 255) * shade);
        albedo[i + 2] = byte((tint?.[2] ?? 255) * shade);
        albedo[i + 3] = 255;
      }
      const dx = (texel(x - 1, y) - texel(x + 1, y)) * 0.22;
      const dy = (texel(x, y - 1) - texel(x, y + 1)) * 0.22;
      const length = Math.hypot(dx, dy, 1);
      normal[i] = byte(127.5 * (1 + dx / length));
      normal[i + 1] = byte(127.5 * (1 + dy / length));
      normal[i + 2] = byte(127.5 * (1 + 1 / length));
      normal[i + 3] = 255;
      const rough = layer === 1 ? 98 : byte(235 + value * 24);
      roughness[i] = roughness[i + 1] = roughness[i + 2] = rough;
      roughness[i + 3] = 255;
      if (metallic) {
        metallic[i] = metallic[i + 1] = metallic[i + 2] = layer === 1 ? 255 : 0;
        metallic[i + 3] = 255;
      }
    }
  }
  const map = (data, colorSpace) => ({ data, size, colorSpace });
  return {
    albedo: map(albedo, 'srgb'), normal: map(normal, 'linear'),
    roughness: map(roughness, 'linear'), ...(metallic ? { metalness: map(metallic, 'linear') } : {}),
  };
}

/** Cache owns its textures. Consumers lease entries and release them on disposal. */
export function createPbrTextureCache(instantiate, limit = 16) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 32) throw new RangeError('Texture cache capacity must be 1–32');
  const cache = new Map();
  function evict(key, entry) {
    cache.delete(key);
    for (const texture of Object.values(entry.maps)) texture.dispose();
  }
  return {
    get size() { return cache.size; },
    acquire(surface, seed = 72, size = 128) {
      validate(surface, seed, size);
      const key = `${surface}:${seed}:${size}`;
      let entry = cache.get(key);
      if (!entry) {
        if (cache.size >= limit) {
          const unused = [...cache].find(([, candidate]) => candidate.leases === 0);
          if (!unused) throw new RangeError('All procedural textures are in use');
          evict(...unused);
        }
        const maps = {};
        try {
          for (const [channel, spec] of Object.entries(generatePbrMaps(surface, seed, size))) {
            maps[channel] = instantiate(spec, `wp72:${key}:${channel}`);
          }
        } catch (error) {
          for (const texture of Object.values(maps)) texture.dispose();
          throw error;
        }
        entry = { maps: Object.freeze(maps), leases: 0 };
        cache.set(key, entry);
      }
      entry.leases++;
      let released = false;
      return {
        maps: entry.maps,
        release() {
          if (released) return;
          released = true;
          entry.leases--;
        },
      };
    },
    disposeUnused() {
      for (const [key, entry] of cache) if (entry.leases === 0) evict(key, entry);
    },
  };
}
