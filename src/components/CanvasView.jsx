import { useRef, useEffect, useCallback } from 'react';
import {
  drawGrid, drawMeasureLine, drawDot,
  dist, fmt, roundRect, MEAS_COLORS,
} from '../utils/helpers.js';

export default function CanvasView({
  canvasRef, cvSize, zoom, pan,
  tool, imgRef,
  activeP, mouseIp,
  reference, measurements,
  displayUnit, calibAdj,
  onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
  onTouchStart, onTouchMove, onTouchEnd,
  onWheel,
}) {
  const effPpu = reference ? reference.ppu * (calibAdj / 100) : null;

  // ── Full canvas redraw ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = cvSize;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, w, h);

    // Dot grid
    drawGrid(ctx, w, h, zoom, pan);

    const img = imgRef.current;
    if (!img) return;

    const iw = img.naturalWidth  * zoom;
    const ih = img.naturalHeight * zoom;

    // Image shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur  = 28;
    ctx.fillStyle   = '#000';
    ctx.fillRect(pan.x, pan.y, iw, ih);
    ctx.restore();

    // Image
    ctx.drawImage(img, pan.x, pan.y, iw, ih);

    const toC = (p) => ({ x: p.x * zoom + pan.x, y: p.y * zoom + pan.y });

    // ── Reference line ─────────────────────────────────────────────────
    if (reference) {
      const p1c = toC(reference.p1);
      const p2c = toC(reference.p2);
      drawMeasureLine(ctx, p1c, p2c, '#ff6b35', `REF: ${fmt(reference.valInches, displayUnit)}`);
      drawDot(ctx, p1c, '#ff6b35', 5.5);
      drawDot(ctx, p2c, '#ff6b35', 5.5);
    }

    // ── Saved measurements ─────────────────────────────────────────────
    measurements.forEach(m => {
      const p1c = toC(m.p1);
      const p2c = toC(m.p2);
      const lbl = effPpu ? fmt(m.pixelDist / effPpu, displayUnit) : `${m.pixelDist.toFixed(0)}px`;
      drawMeasureLine(ctx, p1c, p2c, m.color, lbl);
      drawDot(ctx, p1c, m.color, 4.5);
      drawDot(ctx, p2c, m.color, 4.5);
    });

    // ── Active first point + ghost line ────────────────────────────────
    if (activeP.length === 1) {
      const color = tool === 'reference'
        ? '#ff6b35'
        : MEAS_COLORS[measurements.length % MEAS_COLORS.length];
      const p1c = toC(activeP[0]);
      drawDot(ctx, p1c, color, 7);

      if (mouseIp) {
        const mc = toC(mouseIp);
        drawMeasureLine(ctx, p1c, mc, color, null, true);

        // Live distance label near cursor
        if (effPpu) {
          const pd = dist(activeP[0], mouseIp);
          if (pd > 2) {
            const lbl = fmt(pd / effPpu, displayUnit);
            const lx  = mc.x + 14;
            const ly  = mc.y - 16;
            ctx.save();
            ctx.font  = 'bold 12px "Space Mono", monospace';
            const tw  = ctx.measureText(lbl).width;
            ctx.fillStyle = 'rgba(6,6,16,0.9)';
            roundRect(ctx, lx - 5, ly - 11, tw + 10, 22, 5);
            ctx.fill();
            ctx.strokeStyle = color + '66';
            ctx.lineWidth   = 1;
            roundRect(ctx, lx - 5, ly - 11, tw + 10, 22, 5);
            ctx.stroke();
            ctx.fillStyle    = color;
            ctx.textAlign    = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(lbl, lx, ly);
            ctx.restore();
          }
        }
      }
    }

    // ── Crosshair ──────────────────────────────────────────────────────
    if (mouseIp && tool !== 'pan') {
      const mc = toC(mouseIp);
      if (mc.x >= pan.x && mc.x <= pan.x + iw && mc.y >= pan.y && mc.y <= pan.y + ih) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth   = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(mc.x, pan.y);      ctx.lineTo(mc.x, pan.y + ih); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pan.x, mc.y);      ctx.lineTo(pan.x + iw, mc.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  });

  return (
    <canvas
      ref={canvasRef}
      width={cvSize.w}
      height={cvSize.h}
      style={{
        display: 'block',
        position: 'absolute', top: 0, left: 0,
        cursor: tool === 'pan' ? 'grab' : 'crosshair',
        touchAction: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onContextMenu={e => e.preventDefault()}
    />
  );
}
