import {
  RulerIcon, TargetIcon, HandIcon, UndoIcon, RedoIcon,
  ImageIcon, MenuIcon,
} from './Icons.jsx';
import { fmt } from '../utils/helpers.js';

// ─── Tool button ───────────────────────────────────────────────────────────
function ToolBtn({ icon: Icon, label, kbd, active, activeClass, disabled, onClick }) {
  return (
    <button
      className={`tb-tool ${active ? activeClass : ''} ${disabled ? 'tb-disabled' : ''}`}
      onClick={() => !disabled && onClick()}
      title={`${label}${kbd ? ` (${kbd})` : ''}`}
    >
      <Icon />
      <span className="tb-label">{label}</span>
      {kbd && <span className="tb-kbd">{kbd}</span>}
    </button>
  );
}

// ─── Desktop: Left sidebar ─────────────────────────────────────────────────
export function DesktopSidebar({
  tool, setTool, imgLoaded,
  canUndo, canRedo, onUndo, onRedo,
  displayUnit, setDisplayUnit,
  reference, calibAdj, setCalibAdj, effPpu,
  onNewImage, onExportPNG, onExportJSON, onShowTips,
}) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-mark">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="6" width="15" height="6" rx="1.5" stroke="#00d4ff" strokeWidth="1.4"/>
            <line x1="4.5" y1="6" x2="4.5" y2="9" stroke="#00d4ff" strokeWidth="1.1"/>
            <line x1="7.5" y1="6" x2="7.5" y2="8" stroke="#00d4ff" strokeWidth="1.1"/>
            <line x1="10.5" y1="6" x2="10.5" y2="9" stroke="#00d4ff" strokeWidth="1.1"/>
            <line x1="13.5" y1="6" x2="13.5" y2="8" stroke="#00d4ff" strokeWidth="1.1"/>
            <circle cx="9" cy="3" r="1.8" stroke="#ff6b35" strokeWidth="1.3"/>
          </svg>
        </div>
        <div>
          <div className="sb-logo-name">PhotoMeasure</div>
          <div className="sb-logo-sub">PRECISION TOOLS</div>
        </div>
      </div>

      <div className="sb-body">
        <div className="sb-sect">TOOLS</div>

        <ToolBtn icon={TargetIcon} label="Reference" kbd="R" active={tool==='reference'} activeClass="tb-ref" disabled={!imgLoaded} onClick={() => setTool('reference')} />
        <ToolBtn icon={RulerIcon}  label="Measure"   kbd="M" active={tool==='measure'}   activeClass="tb-meas" disabled={!imgLoaded} onClick={() => setTool('measure')} />
        <ToolBtn icon={HandIcon}   label="Pan"       kbd="⎵" active={tool==='pan'}       activeClass="tb-pan"  disabled={!imgLoaded} onClick={() => setTool('pan')} />

        <div className="sb-sep" />
        <div className="sb-sect">HISTORY</div>
        <div className="sb-row2">
          <button className="sb-icon" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"><UndoIcon /></button>
          <button className="sb-icon" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)"><RedoIcon /></button>
        </div>

        <div className="sb-sep" />
        <div className="sb-sect">UNIT</div>
        <div className="sb-units">
          {['in','ft','cm','m'].map(u => (
            <button key={u} className={`sb-unit ${displayUnit===u?'sb-unit-on':''}`} onClick={() => setDisplayUnit(u)}>{u}</button>
          ))}
        </div>

        {reference && (
          <>
            <div className="sb-sep" />
            <div className="sb-calib-card">
              <div className="sb-calib-lbl">CALIBRATED REF</div>
              <div className="sb-calib-val">{fmt(reference.valInches, displayUnit)}</div>
              <div className="sb-calib-ppu">{effPpu?.toFixed(2)} px / in</div>
            </div>
            <div className="sb-adj-row">
              <span>Adjust</span>
              <span className="sb-adj-val">{calibAdj}%</span>
            </div>
            <input type="range" min="50" max="200" value={calibAdj}
              onChange={e => setCalibAdj(+e.target.value)}
              className="sb-slider" />
          </>
        )}

        <div className="sb-sep" />
        <div className="sb-sect">FILE</div>
        <button className="sb-exp-btn" onClick={onNewImage}><ImageIcon /><span>New Image</span></button>
        <button className="sb-exp-btn" onClick={onExportPNG} disabled={!imgLoaded}><span>↓</span><span>Export PNG</span></button>
        <button className="sb-exp-btn" onClick={onExportJSON} disabled={!imgLoaded}><span>{}</span><span>Export JSON</span></button>

        <div className="sb-sep" />
        <button className="sb-exp-btn" onClick={onShowTips} style={{ color: 'rgba(255,215,0,0.7)', borderColor: 'rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.05)' }}>
          <span>💡</span><span>Accuracy Guide</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 196px; flex-shrink: 0;
          background: #0c0c18;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .sb-logo {
          display: flex; align-items: center; gap: 9px;
          padding: 15px 13px 13px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sb-logo-mark {
          width: 30px; height: 30px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(0,212,255,.16), rgba(0,212,255,.04));
          border: 1px solid rgba(0,212,255,.22); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .sb-logo-name { font-size: 13px; font-weight: 700; color: #d8d8f0; }
        .sb-logo-sub { font-size: 8.5px; color: rgba(180,180,210,.28); letter-spacing: 1.8px; font-weight: 500; }
        .sb-body { flex: 1; padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
        .sb-sect { font-size: 8.5px; font-weight: 600; letter-spacing: 2.5px; color: rgba(180,180,210,.26); padding: 4px 6px 2px; margin-top: 4px; }
        .sb-sep { height: 1px; background: rgba(255,255,255,.055); margin: 5px 0; }

        .tb-tool {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 8px; border-radius: 7px; width: 100%;
          border: 1px solid transparent; background: transparent;
          color: rgba(180,180,210,.5);
          font-family: inherit; font-size: 12.5px; font-weight: 500;
          cursor: pointer; transition: all .14s; text-align: left;
        }
        .tb-tool:hover:not(.tb-disabled) { background: rgba(255,255,255,.05); color: #d8d8f0; }
        .tb-tool.tb-ref  { background: rgba(255,107,53,.12); border-color: rgba(255,107,53,.3); color: #ff6b35; }
        .tb-tool.tb-meas { background: rgba(0,255,136,.1);   border-color: rgba(0,255,136,.28); color: #00ff88; }
        .tb-tool.tb-pan  { background: rgba(0,212,255,.1);   border-color: rgba(0,212,255,.28); color: #00d4ff; }
        .tb-tool.tb-disabled { opacity: .28; cursor: not-allowed; }
        .tb-label { flex: 1; }
        .tb-kbd { font-size: 9.5px; background: rgba(255,255,255,.07); border-radius: 3px; padding: 1px 5px; font-family: "Space Mono", monospace; color: rgba(180,180,210,.32); }

        .sb-row2 { display: flex; gap: 5px; }
        .sb-icon {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 7px; border-radius: 7px; border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.03); color: rgba(180,180,210,.5);
          cursor: pointer; transition: all .14s;
        }
        .sb-icon:hover:not(:disabled) { background: rgba(255,255,255,.08); color: #d8d8f0; }
        .sb-icon:disabled { opacity: .2; cursor: not-allowed; }

        .sb-units { display: flex; gap: 4px; }
        .sb-unit {
          flex: 1; padding: 5px 2px; border-radius: 5px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.03);
          color: rgba(180,180,210,.45);
          font-family: "Space Mono", monospace; font-size: 10px;
          cursor: pointer; transition: all .14s;
        }
        .sb-unit:hover { background: rgba(255,255,255,.07); color: #d8d8f0; }
        .sb-unit.sb-unit-on { background: rgba(0,212,255,.15); border-color: rgba(0,212,255,.38); color: #00d4ff; font-weight: 700; }

        .sb-calib-card { background: rgba(255,107,53,.07); border: 1px solid rgba(255,107,53,.2); border-radius: 8px; padding: 10px 11px; margin-top: 2px; }
        .sb-calib-lbl { font-size: 8px; font-weight: 600; letter-spacing: 2px; color: rgba(255,107,53,.45); margin-bottom: 4px; }
        .sb-calib-val { font-family: "Space Mono", monospace; font-size: 19px; font-weight: 700; color: #ff6b35; }
        .sb-calib-ppu { font-family: "Space Mono", monospace; font-size: 9px; color: rgba(255,107,53,.35); margin-top: 3px; }
        .sb-adj-row { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: rgba(180,180,210,.35); margin-top: 7px; }
        .sb-adj-val { font-family: "Space Mono", monospace; font-size: 10px; color: rgba(0,212,255,.65); }
        .sb-slider { width: 100%; accent-color: #00d4ff; cursor: pointer; margin-top: 4px; }

        .sb-exp-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 8px; border-radius: 7px; width: 100%;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.03);
          color: rgba(180,180,210,.5);
          font-family: inherit; font-size: 12px; font-weight: 500;
          cursor: pointer; transition: all .14s; text-align: left;
        }
        .sb-exp-btn:hover:not(:disabled) { background: rgba(0,212,255,.08); border-color: rgba(0,212,255,.22); color: #00d4ff; }
        .sb-exp-btn:disabled { opacity: .22; cursor: not-allowed; }
      `}</style>
    </aside>
  );
}

// ─── Mobile: Bottom toolbar ────────────────────────────────────────────────
export function MobileToolbar({
  tool, setTool, imgLoaded,
  canUndo, canRedo, onUndo, onRedo,
  measureCount, onOpenResults, onNewImage,
}) {
  return (
    <div className="mb-bar">

      {/* 📸 Upload / New Photo — always visible, most important */}
      <button className="mb-btn mb-upload" onClick={onNewImage} title="Upload Photo">
        <ImageIcon />
        <span>Upload</span>
      </button>

      <div className="mb-div" />

      {/* Reference tool */}
      <button
        className={`mb-btn ${tool==='reference' ? 'mb-ref' : ''} ${!imgLoaded ? 'mb-disabled' : ''}`}
        onClick={() => imgLoaded && setTool('reference')} title="Reference"
      >
        <TargetIcon /><span>Ref</span>
      </button>

      {/* Measure tool */}
      <button
        className={`mb-btn ${tool==='measure' ? 'mb-meas' : ''} ${!imgLoaded ? 'mb-disabled' : ''}`}
        onClick={() => imgLoaded && setTool('measure')} title="Measure"
      >
        <RulerIcon /><span>Measure</span>
      </button>

      {/* Pan tool */}
      <button
        className={`mb-btn ${tool==='pan' ? 'mb-pan' : ''} ${!imgLoaded ? 'mb-disabled' : ''}`}
        onClick={() => imgLoaded && setTool('pan')} title="Pan"
      >
        <HandIcon /><span>Pan</span>
      </button>

      <div className="mb-div" />

      {/* Undo */}
      <button className="mb-btn" onClick={onUndo} disabled={!canUndo} title="Undo (পূর্বাবস্থা)">
        <UndoIcon /><span>Undo</span>
      </button>

      {/* Redo ← NEW */}
      <button className="mb-btn" onClick={onRedo} disabled={!canRedo} title="Redo (পুনরায়)">
        <RedoIcon /><span>Redo</span>
      </button>

      <div className="mb-div" />

      {/* Results */}
      <button className="mb-btn mb-results" onClick={onOpenResults} title="Results">
        <RulerIcon />
        <span>Results</span>
        {measureCount > 0 && (
          <span className="mb-badge">{measureCount}</span>
        )}
      </button>

      <style>{`
        .mb-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center;
          background: rgba(8,8,18,0.97);
          border-top: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(16px) saturate(180%);
          padding: 5px 6px calc(5px + env(safe-area-inset-bottom, 0px));
          gap: 2px; overflow-x: auto;
        }
        .mb-bar::-webkit-scrollbar { display: none; }
        .mb-btn {
          flex-shrink: 0; min-width: 46px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; padding: 7px 6px 6px;
          border-radius: 10px; border: 1px solid transparent;
          background: transparent;
          color: rgba(180,180,210,0.45);
          font-family: inherit; font-size: 9px; font-weight: 600;
          cursor: pointer; transition: all .15s; position: relative;
          letter-spacing: 0.3px;
        }
        .mb-btn:active { transform: scale(0.93); }
        .mb-btn:hover:not(.mb-disabled):not(:disabled) { background: rgba(255,255,255,.07); color: #d0d0e8; }
        .mb-btn.mb-upload {
          background: rgba(0,212,255,0.13);
          border-color: rgba(0,212,255,0.35);
          color: #00d4ff; font-weight: 700;
        }
        .mb-btn.mb-ref  { background: rgba(255,107,53,.15); border-color: rgba(255,107,53,.35); color: #ff6b35; }
        .mb-btn.mb-meas { background: rgba(0,255,136,.12);  border-color: rgba(0,255,136,.32);  color: #00ff88; }
        .mb-btn.mb-pan  { background: rgba(0,212,255,.1);   border-color: rgba(0,212,255,.28);  color: #00d4ff; }
        .mb-btn.mb-results { color: rgba(180,180,210,0.6); }
        .mb-btn.mb-disabled { opacity: .25; cursor: not-allowed; }
        .mb-btn:disabled { opacity: .22; cursor: not-allowed; }
        .mb-div { width: 1px; height: 30px; background: rgba(255,255,255,.08); flex-shrink: 0; margin: 0 2px; }
        .mb-badge {
          position: absolute; top: 3px; right: 4px;
          background: #00d4ff; color: #000;
          font-size: 8px; font-weight: 800;
          padding: 1px 5px; border-radius: 8px; min-width: 15px; text-align: center;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

// ─── Mobile: Top header ────────────────────────────────────────────────────
export function MobileHeader({ tool, onShowTips, onNewImage }) {
  const modeMap = {
    reference: { label: 'REF',     color: '#ff6b35' },
    measure:   { label: 'MEASURE', color: '#00ff88' },
    pan:       { label: 'PAN',     color: '#00d4ff' },
  };
  const mode = modeMap[tool] || modeMap.pan;

  return (
    <div className="mh-bar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{
          width: 26, height: 26,
          background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.22)',
          borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="6" width="15" height="6" rx="1.5" stroke="#00d4ff" strokeWidth="1.6"/>
            <line x1="4.5" y1="6" x2="4.5" y2="9" stroke="#00d4ff" strokeWidth="1.2"/>
            <line x1="9" y1="6" x2="9" y2="9" stroke="#00d4ff" strokeWidth="1.2"/>
            <line x1="13.5" y1="6" x2="13.5" y2="9" stroke="#00d4ff" strokeWidth="1.2"/>
          </svg>
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#d8d8f0', letterSpacing: 0.2 }}>PhotoMeasure</span>
      </div>

      {/* Right: mode badge + tips + upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Current mode badge */}
        <span style={{
          fontSize: 8.5, fontWeight: 700, letterSpacing: '1.5px',
          color: mode.color, padding: '3px 8px',
          background: mode.color + '1a', borderRadius: 6,
          border: `1px solid ${mode.color}44`,
        }}>
          ● {mode.label}
        </span>

        {/* Tips button */}
        <button onClick={onShowTips} style={{
          width: 30, height: 30, borderRadius: 8,
          border: '1px solid rgba(255,215,0,0.3)',
          background: 'rgba(255,215,0,0.08)',
          color: 'rgba(255,215,0,0.8)',
          fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title="Accuracy Tips">
          💡
        </button>

        {/* Upload button */}
        <button onClick={onNewImage} style={{
          height: 30, padding: '0 10px', borderRadius: 8,
          border: '1px solid rgba(0,212,255,0.4)',
          background: 'rgba(0,212,255,0.13)',
          color: '#00d4ff',
          fontSize: 11, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
          letterSpacing: 0.3,
        }} title="Upload new photo">
          <ImageIcon /> Upload
        </button>
      </div>

      <style>{`
        .mh-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: calc(8px + env(safe-area-inset-top, 0px)) 12px 8px;
          background: rgba(8,8,18,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
          min-height: 52px;
        }
      `}</style>
    </div>
  );
}
