import { useState } from 'react';
import { fmt } from '../utils/helpers.js';

// ── Quick-fix presets based on common photography errors ──────────────────
const PRESETS = [
  { label: 'সঠিক', en: 'Exact', value: 100, color: '#00ff88' },
  { label: '+৩%',  en: 'Slight+', value: 103, color: '#00d4ff' },
  { label: '+৫%',  en: 'Med+',    value: 105, color: '#00d4ff' },
  { label: '+৮%',  en: 'High+',   value: 108, color: '#ffd166' },
  { label: '+১০%', en: 'Max+',    value: 110, color: '#ff6b9d' },
  { label: '-৩%',  en: 'Slight-', value: 97,  color: '#00d4ff' },
  { label: '-৫%',  en: 'Med-',    value: 95,  color: '#ffd166' },
];

// ── Body part presets for person measurement ───────────────────────────────
const BODY_CORR = [
  { label: 'মুখ (Face)', note: 'রেফ দিয়েছেন মুখে', value: 100 },
  { label: 'মুখ → পুরো উচ্চতা', note: 'perspective +৭%', value: 107 },
  { label: 'মুখ → কোমর', note: 'perspective +৩%', value: 103 },
  { label: 'দরজা (Door)', note: 'ফ্ল্যাট রেফ', value: 100 },
  { label: 'জুতা (Shoe)', note: 'নিচে থেকে রেফ', value: 100 },
];

export default function ScaleAdjustPanel({
  displayUnit, setDisplayUnit,
  calibAdj, setCalibAdj,
  effPpu, reference,
}) {
  const [manualInput, setManualInput] = useState('');
  const [showBody, setShowBody]       = useState(false);

  const applyManual = () => {
    const v = parseFloat(manualInput);
    if (v >= 50 && v <= 200) { setCalibAdj(v); setManualInput(''); }
  };

  // How much difference 1% makes
  const onePctCm = effPpu ? (reference.pixelDist / effPpu) * 2.54 * 0.01 : 0;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
      background: '#0e0e1e',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px 16px 0 0',
      padding: '14px 14px calc(14px + env(safe-area-inset-bottom, 0px))',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
    }}>

      {/* ── Unit selector ── */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
        {['in','ft','cm','m'].map(u => (
          <button key={u} onClick={() => setDisplayUnit(u)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 8,
            border: `1px solid ${displayUnit===u ? 'rgba(0,212,255,0.45)' : 'rgba(255,255,255,0.09)'}`,
            background: displayUnit===u ? 'rgba(0,212,255,0.16)' : 'rgba(255,255,255,0.04)',
            color: displayUnit===u ? '#00d4ff' : 'rgba(180,180,210,0.5)',
            fontFamily: '"Space Mono", monospace', fontSize: 12,
            cursor: 'pointer', fontWeight: displayUnit===u ? 700 : 400,
            transition: 'all .15s',
          }}>{u}</button>
        ))}
      </div>

      {/* ── Scale header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(180,180,210,0.7)' }}>
            📐 Scale Correction
          </span>
          {onePctCm > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 10,
              fontFamily: '"Space Mono", monospace',
              color: 'rgba(180,180,210,0.3)',
            }}>
              1% = {onePctCm.toFixed(1)} cm
            </span>
          )}
        </div>
        {/* Live value + reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            fontFamily: '"Space Mono", monospace', fontSize: 18, fontWeight: 800,
            color: calibAdj === 100 ? '#00ff88' : calibAdj > 100 ? '#ffd166' : '#ff6b9d',
          }}>{calibAdj}%</span>
          {calibAdj !== 100 && (
            <button onClick={() => setCalibAdj(100)} style={{
              padding: '3px 8px', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(180,180,210,0.5)',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
            }}>Reset</button>
          )}
        </div>
      </div>

      {/* ── Main slider — expanded range 50~200% ── */}
      <input
        type="range" min="50" max="200" step="1" value={calibAdj}
        onChange={e => setCalibAdj(+e.target.value)}
        style={{ width: '100%', accentColor: '#00d4ff', height: 6, marginBottom: 4 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'rgba(180,180,210,0.25)', fontFamily: '"Space Mono", monospace', marginBottom: 12 }}>
        <span>50%</span><span>75%</span><span>100%</span><span>150%</span><span>200%</span>
      </div>

      {/* ── Quick preset buttons ── */}
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(180,180,210,0.3)', marginBottom: 6 }}>
        QUICK PRESETS
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
        {PRESETS.map(p => (
          <button key={p.value} onClick={() => setCalibAdj(p.value)} style={{
            padding: '6px 10px', borderRadius: 7,
            border: `1px solid ${calibAdj === p.value ? p.color + '66' : 'rgba(255,255,255,0.09)'}`,
            background: calibAdj === p.value ? p.color + '1a' : 'rgba(255,255,255,0.04)',
            color: calibAdj === p.value ? p.color : 'rgba(180,180,210,0.5)',
            fontFamily: '"Space Mono", monospace',
            fontSize: 11, fontWeight: calibAdj === p.value ? 700 : 400,
            cursor: 'pointer', transition: 'all .14s',
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Manual input ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input
          type="number" min="50" max="200"
          placeholder="সরাসরি % লিখুন (50-200)"
          value={manualInput}
          onChange={e => setManualInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyManual()}
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: '#e0e0f0',
            fontFamily: '"Space Mono", monospace', fontSize: 14,
            outline: 'none',
          }}
        />
        <button onClick={applyManual} style={{
          padding: '9px 16px', borderRadius: 9, border: 'none',
          background: 'rgba(0,212,255,0.2)',
          color: '#00d4ff', fontFamily: 'inherit',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>Apply</button>
      </div>

      {/* ── Body part correction (toggle) ── */}
      <button onClick={() => setShowBody(v => !v)} style={{
        width: '100%', padding: '8px', borderRadius: 8,
        border: '1px solid rgba(255,215,0,0.2)',
        background: 'rgba(255,215,0,0.06)',
        color: 'rgba(255,215,0,0.7)',
        fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', marginBottom: showBody ? 8 : 0,
      }}>
        {showBody ? '▲' : '▼'} মানুষ মাপার Correction Presets
      </button>

      {showBody && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 10, color: 'rgba(180,180,210,0.35)', lineHeight: 1.6, padding: '4px 0' }}>
            রেফারেন্স কোথায় দিয়েছিলেন সেটা বেছে নিন:
          </div>
          {BODY_CORR.map(b => (
            <button key={b.value + b.label} onClick={() => setCalibAdj(b.value)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 12px', borderRadius: 8,
              border: `1px solid ${calibAdj === b.value ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: calibAdj === b.value ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
              color: calibAdj === b.value ? 'rgba(255,215,0,0.9)' : 'rgba(180,180,210,0.55)',
              fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
              transition: 'all .14s',
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>{b.label}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 1 }}>{b.note}</div>
              </div>
              <span style={{
                fontFamily: '"Space Mono", monospace', fontSize: 13, fontWeight: 700,
                color: b.value === 100 ? '#00ff88' : '#ffd166',
              }}>{b.value}%</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
