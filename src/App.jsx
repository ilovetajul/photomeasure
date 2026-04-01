import { useState, useRef, useEffect, useCallback } from 'react';
import CanvasView       from './components/CanvasView.jsx';
import CalibModal       from './components/CalibModal.jsx';
import ResultsPanel     from './components/ResultsPanel.jsx';
import { DesktopSidebar, MobileToolbar, MobileHeader } from './components/Toolbar.jsx';
import { UploadIcon }   from './components/Icons.jsx';
import TipsModal        from './components/TipsModal.jsx';
import ScaleAdjustPanel from './components/ScaleAdjustPanel.jsx';
import useHistory       from './hooks/useHistory.js';
import useCanvas        from './hooks/useCanvas.js';
import { dist, toInches, fmt, MEAS_COLORS } from './utils/helpers.js';

// ─── Responsive breakpoint ────────────────────────────────────────────────
const MOBILE_BP = 768;

export default function App() {
  /* ── Refs ── */
  const canvasRef    = useRef(null);
  const wrapperRef   = useRef(null);
  const imgRef       = useRef(null);
  const fileRef      = useRef(null);
  const isPanning    = useRef(false);
  const panStart     = useRef(null);
  const panOff       = useRef(null);
  const pinchRef     = useRef(null); // for pinch-to-zoom
  const stateSnap    = useRef({});   // live zoom/pan for wheel handler

  /* ── Layout state ── */
  const [cvSize, setCvSize]       = useState({ w: 800, h: 600 });
  const [isMobile, setIsMobile]   = useState(window.innerWidth < MOBILE_BP);
  const [showResults, setShowResults] = useState(false);
  const [showTips, setShowTips]       = useState(false);

  /* ── Image ── */
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  /* ── Canvas transform ── */
  const {
    zoom, pan, setZoom, setPan,
    toCanvas, toImage, fitImage, zoomAt, zoomIn, zoomOut,
  } = useCanvas(cvSize);

  /* ── Tool & interaction ── */
  const [tool, setTool]         = useState('reference');
  const [activeP, setActiveP]   = useState([]);
  const [mouseIp, setMouseIp]   = useState(null);

  /* ── Data ── */
  const [reference, setReference]       = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [displayUnit, setDisplayUnit]   = useState('in');
  const [calibAdj, setCalibAdj]         = useState(100);

  /* ── Calibration modal ── */
  const [showModal, setShowModal]   = useState(false);
  const [pendingPts, setPendingPts] = useState(null);

  /* ── History ── */
  const history = useHistory();

  // Keep live ref for wheel handler
  stateSnap.current = { zoom, pan };

  const effPpu = reference ? reference.ppu * (calibAdj / 100) : null;

  // ── Responsive listener ──────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Canvas resize observer ───────────────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setCvSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Load image ───────────────────────────────────────────────────────────
  const loadImage = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      fitImage(img, cvSize.w, cvSize.h);
      setReference(null);
      setMeasurements([]);
      setActiveP([]);
      setTool('reference');
      setImgLoaded(true);
      setShowResults(false);
      // Show tips on first load
      if (!sessionStorage.getItem('pm_tips_seen')) {
        setShowTips(true);
        sessionStorage.setItem('pm_tips_seen', '1');
      }
    };
    img.src = url;
  }, [cvSize, fitImage]);

  // Reload fit when canvas resizes while image is present
  useEffect(() => {
    if (imgLoaded && imgRef.current) fitImage(imgRef.current, cvSize.w, cvSize.h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvSize]);

  // ── Save current state snapshot ─────────────────────────────────────────
  const saveHistory = useCallback(() => {
    history.save({ measurements, reference });
  }, [measurements, reference, history]);

  const undo = useCallback(() => {
    const prev = history.undo({ measurements, reference });
    if (prev) { setMeasurements(prev.measurements); setReference(prev.reference); }
  }, [measurements, reference, history]);

  const redo = useCallback(() => {
    const next = history.redo({ measurements, reference });
    if (next) { setMeasurements(next.measurements); setReference(next.reference); }
  }, [measurements, reference, history]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
      if (e.key === 'r' || e.key === 'R') setTool('reference');
      if (e.key === 'm' || e.key === 'M') setTool('measure');
      if (e.key === ' ')  { e.preventDefault(); setTool('pan'); }
      if (e.key === 'Escape') setActiveP([]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [undo, redo]);

  // ── Wheel zoom ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e) => {
      e.preventDefault();
      const { zoom: z, pan: p } = stateSnap.current;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const nz     = Math.max(0.05, Math.min(20, z * factor));
      const rect   = canvas.getBoundingClientRect();
      const cx     = e.clientX - rect.left;
      const cy     = e.clientY - rect.top;
      setZoom(nz);
      setPan({ x: cx - (cx - p.x) * (nz / z), y: cy - (cy - p.y) * (nz / z) });
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [setZoom, setPan]);

  // ── Canvas point from event ──────────────────────────────────────────────
  const getCanvasPt = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // ── Mouse events ─────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (e.button === 1 || e.button === 2 || tool === 'pan') {
      isPanning.current = true;
      panStart.current  = { x: e.clientX, y: e.clientY };
      panOff.current    = { ...stateSnap.current.pan };
      return;
    }
    if (e.button !== 0 || !imgRef.current) return;

    const ip  = toImage(getCanvasPt(e));
    const img = imgRef.current;
    if (ip.x < 0 || ip.y < 0 || ip.x > img.naturalWidth || ip.y > img.naturalHeight) return;

    if (tool === 'reference') {
      if (activeP.length === 0) {
        setActiveP([ip]);
      } else {
        setPendingPts([activeP[0], ip]);
        setActiveP([]);
        setShowModal(true);
      }
    } else if (tool === 'measure') {
      if (activeP.length === 0) {
        setActiveP([ip]);
      } else {
        addMeasurement(activeP[0], ip);
        setActiveP([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, activeP, toImage, getCanvasPt, measurements]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning.current) {
      const p = panOff.current;
      setPan({
        x: p.x + (e.clientX - panStart.current.x),
        y: p.y + (e.clientY - panStart.current.y),
      });
      return;
    }
    if (imgRef.current) setMouseIp(toImage(getCanvasPt(e)));
  }, [toImage, getCanvasPt, setPan]);

  const handleMouseUp   = useCallback(() => { isPanning.current = false; }, []);
  const handleMouseLeave = useCallback(() => { setMouseIp(null); }, []);

  // ── Touch events (pan + pinch-to-zoom) ────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1 && tool === 'pan') {
      // Single-finger pan
      isPanning.current = true;
      panStart.current  = { x: touches[0].clientX, y: touches[0].clientY };
      panOff.current    = { ...stateSnap.current.pan };
      return;
    }

    if (touches.length === 2) {
      // Pinch-to-zoom init
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      pinchRef.current = {
        dist: Math.sqrt(dx * dx + dy * dy),
        zoom: stateSnap.current.zoom,
        cx: (touches[0].clientX + touches[1].clientX) / 2,
        cy: (touches[0].clientY + touches[1].clientY) / 2,
        pan: { ...stateSnap.current.pan },
      };
      isPanning.current = false;
      return;
    }

    if (touches.length === 1 && (tool === 'reference' || tool === 'measure')) {
      // Single-finger tap → place point (handled on touchEnd)
      panStart.current = { x: touches[0].clientX, y: touches[0].clientY };
    }
  }, [tool]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 2 && pinchRef.current) {
      // Pinch zoom
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const { dist: startD, zoom: startZ, cx, cy, pan: startP } = pinchRef.current;

      const rect = canvasRef.current.getBoundingClientRect();
      const nz   = Math.max(0.05, Math.min(20, startZ * (d / startD)));
      const lcx  = cx - rect.left;
      const lcy  = cy - rect.top;

      setZoom(nz);
      setPan({
        x: lcx - (lcx - startP.x) * (nz / startZ),
        y: lcy - (lcy - startP.y) * (nz / startZ),
      });
      return;
    }

    if (touches.length === 1 && isPanning.current) {
      const p = panOff.current;
      setPan({
        x: p.x + (touches[0].clientX - panStart.current.x),
        y: p.y + (touches[0].clientY - panStart.current.y),
      });
    }
  }, [setZoom, setPan]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    pinchRef.current  = null;
    isPanning.current = false;

    // If it was a single-tap (not a pan), place point
    if (e.changedTouches.length === 1 && tool !== 'pan' && panStart.current) {
      const touch  = e.changedTouches[0];
      const dxM    = Math.abs(touch.clientX - panStart.current.x);
      const dyM    = Math.abs(touch.clientY - panStart.current.y);
      const isTap  = dxM < 10 && dyM < 10;

      if (isTap && imgRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const cp   = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        const ip   = toImage(cp);
        const img  = imgRef.current;

        if (ip.x >= 0 && ip.y >= 0 && ip.x <= img.naturalWidth && ip.y <= img.naturalHeight) {
          if (tool === 'reference') {
            if (activeP.length === 0) {
              setActiveP([ip]);
            } else {
              setPendingPts([activeP[0], ip]);
              setActiveP([]);
              setShowModal(true);
            }
          } else if (tool === 'measure') {
            if (activeP.length === 0) {
              setActiveP([ip]);
            } else {
              addMeasurement(activeP[0], ip);
              setActiveP([]);
            }
          }
        }
      }
    }
    panStart.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, activeP, toImage, measurements]);

  // ── Add measurement ──────────────────────────────────────────────────────
  const addMeasurement = useCallback((p1, p2) => {
    const nm = {
      id:        Date.now(),
      p1, p2,
      pixelDist: dist(p1, p2),
      color:     MEAS_COLORS[measurements.length % MEAS_COLORS.length],
      label:     `M${measurements.length + 1}`,
    };
    saveHistory();
    setMeasurements(prev => [...prev, nm]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurements, saveHistory]);

  // ── Calibration confirm ──────────────────────────────────────────────────
  const handleCalibConfirm = useCallback(({ value, unit }) => {
    if (!pendingPts) return;
    const pd  = dist(pendingPts[0], pendingPts[1]);
    const ppu = pd / toInches(value, unit);
    saveHistory();
    setReference({
      p1: pendingPts[0], p2: pendingPts[1],
      pixelDist: pd, ppu,
      valInches: toInches(value, unit),
    });
    setCalibAdj(100);
    setShowModal(false);
    setPendingPts(null);
    setTool('measure');
  }, [pendingPts, saveHistory]);

  // ── Delete measurement ───────────────────────────────────────────────────
  const deleteMeasurement = useCallback((id) => {
    saveHistory();
    setMeasurements(m => m.filter(x => x.id !== id));
  }, [saveHistory]);

  // ── Clear all ────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    saveHistory();
    setMeasurements([]);
  }, [saveHistory]);

  // ── Export PNG ───────────────────────────────────────────────────────────
  const exportPNG = useCallback(() => {
    const link    = document.createElement('a');
    link.download = 'photomeasure.png';
    link.href     = canvasRef.current.toDataURL('image/png');
    link.click();
  }, []);

  // ── Export JPG ───────────────────────────────────────────────────────────
  const exportJPG = useCallback(() => {
    const link    = document.createElement('a');
    link.download = 'photomeasure.jpg';
    link.href     = canvasRef.current.toDataURL('image/jpeg', 0.92);
    link.click();
  }, []);

  // ── Bake correction into calibration (fixes scale conflict) ──────────────
  // This permanently applies the calibAdj % into ppu so all lines are consistent
  const bakeCorrection = useCallback(() => {
    if (!reference || calibAdj === 100) return;
    saveHistory();
    setReference(prev => ({
      ...prev,
      ppu: prev.ppu * (calibAdj / 100),
    }));
    setCalibAdj(100);
  }, [reference, calibAdj, saveHistory]);

  // ── Export JSON ──────────────────────────────────────────────────────────
  const exportJSON = useCallback(() => {
    const ep  = effPpu;
    const out = {
      exportedAt:   new Date().toISOString(),
      calibration:  reference ? {
        pixelsPerInch: +ep?.toFixed(4),
        referenceInches: reference.valInches,
        adjustmentPct: calibAdj,
      } : null,
      measurements: measurements.map(m => {
        const ri = ep ? m.pixelDist / ep : null;
        return {
          label:        m.label,
          pixelDistance: +m.pixelDist.toFixed(3),
          ...(ri ? {
            inches: +ri.toFixed(4),
            feet:   +(ri / 12).toFixed(5),
            cm:     +(ri * 2.54).toFixed(4),
          } : {}),
        };
      }),
    };
    const link    = document.createElement('a');
    link.download = 'measurements.json';
    link.href     = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }));
    link.click();
  }, [reference, measurements, calibAdj, effPpu]);

  // ── New image ────────────────────────────────────────────────────────────
  const openFilePicker = useCallback(() => {
    fileRef.current?.click();
  }, []);

  // ── Zoom bar ─────────────────────────────────────────────────────────────
  const ZoomBar = () => (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? 80 : 40,
      left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 3,
      background: 'rgba(10,10,20,0.92)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 10, padding: 4,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      zIndex: 50,
    }}>
      {[
        { lbl: '−', fn: () => zoomAt(cvSize.w/2, cvSize.h/2, 1/1.25) },
        { lbl: null },
        { lbl: '+', fn: () => zoomAt(cvSize.w/2, cvSize.h/2, 1.25) },
        { lbl: '⊡', fn: () => fitImage(imgRef.current, cvSize.w, cvSize.h) },
      ].map((b, i) =>
        b.lbl === null ? (
          <span key={i} style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10.5,
            color: 'rgba(180,180,210,0.4)', minWidth: 48, textAlign: 'center',
          }}>
            {Math.round(zoom * 100)}%
          </span>
        ) : (
          <button key={i} onClick={b.fn} style={{
            width: 28, height: 28, borderRadius: 6,
            border: 'none', background: 'rgba(255,255,255,0.05)',
            color: 'rgba(200,200,220,0.6)', fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {b.lbl}
          </button>
        )
      )}
    </div>
  );

  // ── Status hint ───────────────────────────────────────────────────────────
  const StatusBar = () => {
    const hints = {
      reference: activeP.length === 1
        ? 'Tap second point · Esc to cancel'
        : 'Tap first reference point',
      measure: activeP.length === 1
        ? 'Tap second point · Esc to cancel'
        : reference
        ? 'Tap to start measuring'
        : '⚠ Set a reference first',
      pan: 'Drag to pan · Pinch to zoom',
    };
    const colors = { reference: '#ff6b35', measure: '#00ff88', pan: '#00d4ff' };
    return (
      <div style={{
        position: 'absolute', bottom: isMobile ? 130 : 10,
        left: '50%', transform: 'translateX(-50%)',
        fontFamily: '"Space Mono", monospace', fontSize: 10,
        color: 'rgba(180,180,210,0.35)',
        background: 'rgba(8,8,15,0.7)',
        padding: '4px 12px', borderRadius: 20,
        whiteSpace: 'nowrap', pointerEvents: 'none',
        zIndex: 50,
      }}>
        <span style={{ color: colors[tool], fontWeight: 700 }}>●</span>
        {' '}{hints[tool]}
      </div>
    );
  };

  // ── Floating Download Button (canvas এর উপরে সবসময় দেখা যাবে) ────────────
  const DownloadBtn = () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{
        position: 'absolute',
        top: isMobile ? 10 : 14,
        right: 14,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
      }}>
        {/* Main button */}
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 14px', borderRadius: 10,
            border: '1px solid rgba(0,212,255,0.45)',
            background: open ? 'rgba(0,212,255,0.22)' : 'rgba(10,10,22,0.88)',
            color: '#00d4ff',
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
            cursor: 'pointer', backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'all .15s',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M7.5 2v8M5 7.5l2.5 2.5 2.5-2.5"/>
            <path d="M2 11v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1"/>
          </svg>
          Download
          <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
        </button>

        {/* Dropdown options */}
        {open && (
          <div style={{
            background: 'rgba(10,10,22,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
            minWidth: 160,
          }}>
            {[
              { label: '🖼️ PNG (স্বচ্ছ)', sub: 'High quality', fn: () => { exportPNG(); setOpen(false); } },
              { label: '📷 JPG (ছোট সাইজ)', sub: 'Compressed', fn: () => { exportJPG(); setOpen(false); } },
              { label: '📊 JSON (ডেটা)', sub: 'Measurement data', fn: () => { exportJSON(); setOpen(false); } },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.fn}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  width: '100%', padding: '11px 14px',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  border: 'none',
                  background: 'transparent',
                  color: '#d0d0e8',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
                <span style={{ fontSize: 10, color: 'rgba(180,180,210,0.35)', fontWeight: 400, marginTop: 2 }}>
                  {item.sub}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Drop zone ────────────────────────────────────────────────────────────
  const DropZone = () => (
    <div
      style={{
        position: 'absolute', inset: isMobile ? '16px' : '24px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        border: `1.5px dashed ${isDragOver ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 16, cursor: 'pointer',
        background: isDragOver ? 'rgba(0,212,255,0.04)' : 'transparent',
        color: isDragOver ? 'rgba(0,212,255,0.7)' : 'rgba(180,180,210,0.35)',
        transition: 'all 0.2s',
      }}
      onClick={openFilePicker}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => { e.preventDefault(); setIsDragOver(false); loadImage(e.dataTransfer.files[0]); }}
    >
      <UploadIcon size={isMobile ? 40 : 52} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: 'rgba(210,210,230,0.65)', marginBottom: 6 }}>
          {isMobile ? 'Tap to upload photo' : 'Drop your photo here'}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(180,180,210,0.35)' }}>
          {isMobile ? 'Camera or gallery' : 'or click to browse'}
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
        padding: '8px 18px', borderRadius: 24,
        background: 'rgba(0,212,255,0.07)',
        border: '1px solid rgba(0,212,255,0.14)',
        fontSize: 12, color: 'rgba(0,212,255,0.55)',
      }}>
        <span>📐</span>
        <span>Upload → Calibrate → Measure</span>
      </div>
      <div style={{
        fontFamily: '"Space Mono", monospace', fontSize: 10,
        color: 'rgba(180,180,210,0.18)', letterSpacing: 1,
      }}>
        PNG · JPG · WEBP · HEIC · BMP
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', width: '100dvw', height: '100dvh',
      overflow: 'hidden', flexDirection: 'row',
    }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <DesktopSidebar
          tool={tool} setTool={setTool} imgLoaded={imgLoaded}
          canUndo={history.canUndo} canRedo={history.canRedo}
          onUndo={undo} onRedo={redo}
          displayUnit={displayUnit} setDisplayUnit={setDisplayUnit}
          reference={reference} calibAdj={calibAdj}
          setCalibAdj={setCalibAdj} effPpu={effPpu}
          onNewImage={openFilePicker}
          onExportPNG={exportPNG} onExportJPG={exportJPG} onExportJSON={exportJSON} onBakeCorrection={bakeCorrection}
          onShowTips={() => setShowTips(true)}
        />
      )}

      {/* ── Canvas area ── */}
      <div
        ref={wrapperRef}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          background: '#0a0a12',
          paddingTop:    isMobile ? 52 : 0,
          paddingBottom: isMobile ? 68 : 0,
        }}
      >
        {!imgLoaded ? (
          <DropZone />
        ) : (
          <CanvasView
            canvasRef={canvasRef}
            cvSize={cvSize}
            zoom={zoom} pan={pan}
            tool={tool} imgRef={imgRef}
            activeP={activeP} mouseIp={mouseIp}
            reference={reference} measurements={measurements}
            displayUnit={displayUnit} calibAdj={calibAdj}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        )}

        {imgLoaded && <ZoomBar />}
        {imgLoaded && <StatusBar />}
        {imgLoaded && <DownloadBtn />}
      </div>

      {/* Desktop results panel */}
      {!isMobile && (
        <ResultsPanel
          reference={reference} measurements={measurements}
          displayUnit={displayUnit} setDisplayUnit={setDisplayUnit}
          calibAdj={calibAdj} setCalibAdj={setCalibAdj}
          effPpu={effPpu}
          onDelete={deleteMeasurement} onClear={clearAll}
          onExportPNG={exportPNG} onExportJPG={exportJPG} onExportJSON={exportJSON}
          onBakeCorrection={bakeCorrection}
          isMobile={false}
        />
      )}

      {/* Mobile header */}
      {isMobile && imgLoaded && (
        <MobileHeader
          tool={tool}
          onShowTips={() => setShowTips(true)}
          onNewImage={openFilePicker}
        />
      )}

      {/* Mobile bottom toolbar */}
      {isMobile && (
        <MobileToolbar
          tool={tool} setTool={setTool} imgLoaded={imgLoaded}
          canUndo={history.canUndo} canRedo={history.canRedo}
          onUndo={undo} onRedo={redo}
          measureCount={measurements.length}
          onOpenResults={() => setShowResults(true)}
          onNewImage={openFilePicker}
        />
      )}

      {/* Mobile results bottom sheet — Scale panel এখন এর ভেতরেই আছে */}
      {isMobile && (
        <ResultsPanel
          reference={reference} measurements={measurements}
          displayUnit={displayUnit} setDisplayUnit={setDisplayUnit}
          calibAdj={calibAdj} setCalibAdj={setCalibAdj}
          effPpu={effPpu}
          onDelete={deleteMeasurement} onClear={clearAll}
          onExportPNG={exportPNG} onExportJPG={exportJPG} onExportJSON={exportJSON}
          onBakeCorrection={bakeCorrection}
          isMobile={true}
          isOpen={showResults}
          onClose={() => setShowResults(false)}
        />
      )}

      {/* Calibration modal */}
      {showModal && (
        <CalibModal
          pendingPts={pendingPts}
          onConfirm={handleCalibConfirm}
          onCancel={() => { setShowModal(false); setPendingPts(null); }}
        />
      )}

      {/* Accuracy Tips modal */}
      {showTips && <TipsModal onClose={() => setShowTips(false)} />}

      {/* Hidden file input — gallery + camera both allowed */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => loadImage(e.target.files[0])}
      />
    </div>
  );
}
