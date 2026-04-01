import { useCallback, useRef, useState } from 'react';

/**
 * Manages zoom, pan, and coordinate transforms for the canvas.
 * Supports both mouse and touch (pinch-to-zoom).
 */
export default function useCanvas(cvSize) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });

  const zoomRef = useRef(zoom);
  const panRef  = useRef(pan);
  zoomRef.current = zoom;
  panRef.current  = pan;

  // ── Transform helpers ──────────────────────────────────────────────────
  const toCanvas = useCallback(
    (p) => ({ x: p.x * zoom + pan.x, y: p.y * zoom + pan.y }),
    [zoom, pan],
  );

  const toImage = useCallback(
    (p) => ({ x: (p.x - pan.x) / zoom, y: (p.y - pan.y) / zoom }),
    [zoom, pan],
  );

  // ── Fit image to canvas ────────────────────────────────────────────────
  const fitImage = useCallback((img, w, h) => {
    const scale = Math.min((w * 0.92) / img.naturalWidth, (h * 0.92) / img.naturalHeight, 1);
    const nx    = (w - img.naturalWidth  * scale) / 2;
    const ny    = (h - img.naturalHeight * scale) / 2;
    setZoom(scale);
    setPan({ x: nx, y: ny });
  }, []);

  // ── Zoom around a canvas point ─────────────────────────────────────────
  const zoomAt = useCallback((cx, cy, factor) => {
    const z  = zoomRef.current;
    const p  = panRef.current;
    const nz = Math.max(0.05, Math.min(20, z * factor));
    setZoom(nz);
    setPan({ x: cx - (cx - p.x) * (nz / z), y: cy - (cy - p.y) * (nz / z) });
  }, []);

  const zoomIn  = useCallback(() => zoomAt(cvSize.w / 2, cvSize.h / 2, 1.25), [zoomAt, cvSize]);
  const zoomOut = useCallback(() => zoomAt(cvSize.w / 2, cvSize.h / 2, 1 / 1.25), [zoomAt, cvSize]);

  return { zoom, pan, setZoom, setPan, toCanvas, toImage, fitImage, zoomAt, zoomIn, zoomOut };
}
