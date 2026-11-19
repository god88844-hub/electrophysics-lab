/**
 * Blackbody colour ramp — Planck's law mapped through CIE 1931 to RGB.
 * Interpolation anchors are the verified stops from
 * data/reference-library/06_failure_physics_thresholds.json
 * (parameters.blackbody_rgb_temperature_curve.visible_color_mapping).
 */

const STOPS = [
  { tK: 300, rgb: [0, 0, 0] },
  { tK: 500, rgb: [64, 0, 0] },
  { tK: 750, rgb: [153, 0, 0] },
  { tK: 1000, rgb: [255, 40, 0] },
  { tK: 1500, rgb: [255, 128, 24] },
  { tK: 2000, rgb: [255, 190, 76] },
  { tK: 2500, rgb: [255, 225, 155] },
];

/** Kelvin → [r, g, b] (0..255), piecewise-linear over the verified stops. */
export function tempToRGB(tempK) {
  const t = Math.max(STOPS[0].tK, Math.min(STOPS[STOPS.length - 1].tK, tempK));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (t >= a.tK && t <= b.tK) {
      const f = (t - a.tK) / (b.tK - a.tK);
      return [
        Math.round(a.rgb[0] + f * (b.rgb[0] - a.rgb[0])),
        Math.round(a.rgb[1] + f * (b.rgb[1] - a.rgb[1])),
        Math.round(a.rgb[2] + f * (b.rgb[2] - a.rgb[2])),
      ];
    }
  }
  return STOPS[STOPS.length - 1].rgb;
}

/** Kelvin → THREE-friendly normalised [r, g, b] (0..1, gamma-naive linear). */
export function tempToRGBf(tempK) {
  const [r, g, b] = tempToRGB(tempK);
  return [r / 255, g / 255, b / 255];
}

export const BLACKBODY_STOPS = STOPS;
