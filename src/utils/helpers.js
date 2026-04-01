// ─── Measurement colors pool ───────────────────────────────────────────────
export const MEAS_COLORS = [
  '#00ff88', '#00d4ff', '#ff6b9d', '#ffd166',
  '#a29bfe', '#74b9ff', '#55efc4', '#fdcb6e',
  '#e17055', '#81ecec', '#6c5ce7', '#00cec9',
];

// ─── Euclidean distance between two image-space points ─────────────────────
export function dist(a, b) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

// ─── Unit conversions (everything stored in inches internally) ─────────────
export function toInches(value, unit) {
  if (unit === 'ft') return value * 12;
  if (unit === 'cm') return value / 2.54;
  if (unit === 'm')  return value / 0.0254;
  return value; // 'in'
}

export function fromInches(value, unit) {
  if (unit === 'ft') return value / 12;
  if (unit === 'cm') return value * 2.54;
  if (unit === 'm')  return value * 0.0254;
  return value; // 'in'
}

// ─── Format inches into display string ────────────────────────────────────
export function fmt(inches, unit) {
  if (unit === 'ft') {
    const ft    = Math.floor(inches / 12);
    const inL   = inches % 12;
    if (ft === 0) return `${inches.toFixed(2)}"`;
    return `${ft}' ${inL.toFixed(2)}"`;
  }
  const v = fromInches(inches, unit);
  if (unit === 'in') return `${v.toFixed(2)}"`;
  if (unit === 'm')  return `${v.toFixed(3)} m`;
  return `${v.toFixed(2)} cm`;
}

// ─── Cross-browser roundRect helper ───────────────────────────────────────
export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Draw a measurement line with end-caps and a label badge ──────────────
export function drawMeasureLine(ctx, p1c, p2c, color, label, ghost = false) {
  const angle = Math.atan2(p2c.y - p1c.y, p2c.x - p1c.x);
  const perp  = angle + Math.PI / 2;
  const cap   = 8;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = ghost ? 1.5 : 2.2;
  ctx.lineCap     = 'round';

  if (ghost) ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(p1c.x, p1c.y);
  ctx.lineTo(p2c.x, p2c.y);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!ghost) {
    [p1c, p2c].forEach(pt => {
      ctx.beginPath();
      ctx.moveTo(pt.x + Math.cos(perp) * cap, pt.y + Math.sin(perp) * cap);
      ctx.lineTo(pt.x - Math.cos(perp) * cap, pt.y - Math.sin(perp) * cap);
      ctx.stroke();
    });
  }

  if (label) {
    const mx  = (p1c.x + p2c.x) / 2;
    const my  = (p1c.y + p2c.y) / 2;
    ctx.font  = 'bold 11px "Space Mono", monospace';
    const tw  = ctx.measureText(label).width;
    const pad = 5;
    const lh  = 16;

    ctx.fillStyle = 'rgba(6,6,16,0.9)';
    roundRect(ctx, mx - tw / 2 - pad, my - lh / 2 - pad, tw + pad * 2, lh + pad * 2, 5);
    ctx.fill();

    ctx.strokeStyle = color + '55';
    ctx.lineWidth   = 1;
    roundRect(ctx, mx - tw / 2 - pad, my - lh / 2 - pad, tw + pad * 2, lh + pad * 2, 5);
    ctx.stroke();

    ctx.fillStyle    = color;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, mx, my);
  }

  ctx.restore();
}

// ─── Draw endpoint circle ──────────────────────────────────────────────────
export function drawDot(ctx, pc, color, r = 5) {
  ctx.save();
  ctx.fillStyle   = color;
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.arc(pc.x, pc.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ─── Draw dot background grid ─────────────────────────────────────────────
export function drawGrid(ctx, w, h, zoom, pan) {
  const gs = Math.max(18, 36 * zoom);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let x = ((pan.x % gs) + gs) % gs; x < w; x += gs) {
    for (let y = ((pan.y % gs) + gs) % gs; y < h; y += gs) {
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
