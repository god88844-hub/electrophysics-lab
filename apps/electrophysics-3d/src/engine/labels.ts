import * as THREE from 'three';

export interface LabelOptions {
  fontSize?: number;
  color?: string;
  background?: string;
  padding?: number;
  width?: number;
  scale?: number;
  bold?: boolean;
}

/** Crisp canvas-based text label as a THREE.Sprite (no font download). */
export function makeTextSprite(text: string, opts: LabelOptions = {}): THREE.Sprite {
  const fontSize = opts.fontSize ?? 42;
  const color = opts.color ?? '#dbe6f5';
  const background = opts.background ?? 'rgba(8, 12, 18, 0.72)';
  const padding = opts.padding ?? 14;
  const scale = opts.scale ?? 1;
  const bold = opts.bold ?? true;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `${bold ? '600 ' : ''}${fontSize}px "Segoe UI", system-ui, sans-serif`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width + padding * 2);
  const h = Math.ceil(fontSize * 1.35 + padding * 2);
  canvas.width = w;
  canvas.height = h;
  ctx.font = font;
  if (background !== 'none') {
    ctx.fillStyle = background;
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const aspect = w / h;
  sprite.scale.set((scale * aspect) / 2, scale / 2, 1);
  sprite.renderOrder = 10;
  return sprite;
}
