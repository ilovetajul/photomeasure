import { useState } from 'react';
import { CloseIcon, DownloadIcon, JsonIcon } from './Icons.jsx';
import { fmt } from '../utils/helpers.js';

function MeasItem({ m, effPpu, displayUnit, onDelete }) {
  const ri = effPpu ? m.pixelDist / effPpu : null;
  return (
    <div className="ri-item">
      <div className="ri-dot" style={{ background: m.color }} />
      <div className="ri-info">
        <div className="ri-lbl">{m.label}</div>
        <div className="ri-val" style={{ color: m.color }}>
          {ri ? fmt(ri, displayUnit) : `${m.pixelDist.toFixed(0)} px`}
        </div>
        {ri && (
          <div className="ri-sub">
            {(ri * 2.54).toFixed(1)} cm · {ri.toFixed(2)}" · {(ri/12).toFixed(3)}'
          </div>
        )}
      </div>
      <button className="ri-del" onClick={() => onDelete(m.id)}>
        <CloseIcon />
      </button>
    </div>
  );
}

export default function ResultsPanel({
  reference, measurements, displayUnit, setDisplayUnit,
  calibAdj, setCalibAdj,
  onDelete, onClear, onExportPNG, onExportJPG, onExportJSON,
  onBakeCorrection,
  isMobile, isOpen, onClose,
}) {
  const effPpu = reference ? reference.ppu * (calibAdj / 100) : null;
  const [showBody, setShowBody] = useState(false);
  const [manualVal, setManualVal] = useState('');

  const onePctCm = effPpu && reference
    ? (reference.pixelDist / effPpu) * 2.54 * 0.01 : 0;

  const applyManual = () => {
    const v = parseFloat(manualVal);
    if (v >= 50 && v <= 200) { setCalibAdj(v); setManualVal(''); }
  };

  /* ── Desktop: full side panel ── */
  if (!isMobile) {
    return (
      <div style={{
        width: 260, flexShrink: 0,
        background: '#0c0c18',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <DesktopContent
          reference={reference} measurements={measurements}
          displayUnit={displayUnit} setDisplayUnit={setDisplayUnit}
          calibAdj={calibAdj} setCalibAdj={setCalibAdj}
          effPpu={effPpu} onePctCm={onePctCm}
          onDelete={onDelete} onClear={onClear}
          onExportPNG={onExportPNG} onExportJPG={onExportJPG} onExportJSON={onExportJSON}
          onBakeCorrection={onBakeCorrection}
          showBody={showBody} setShowBody={setShowBody}
          manualVal={manualVal} setManualVal={setManualVal} applyManual={applyManual}
        />
      </div>
    );
  }

  /* ── Mobile: bottom sheet ── */
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 199,
          }}
        />
      )}

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: isOpen ? '60vh' : 0,
        overflow: 'hidden',
        background: '#0e0e1e',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px 20px 0 0',
        transition: 'height 0.32s cubic-bezier(.4,0,.2,1)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Drag handle */}
        <div style={{ padding: '10px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px 10px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#d0d0e8' }}>
            📊 Measurements
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'rgba(0,212,255,0.18)', color: '#00d4ff',
              fontFamily: '"Space Mono",monospace', fontSize: 10.5, fontWeight: 700,
              padding: '2px 9px', borderRadius: 10,
            }}>{measurements.length}</span>
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: 'rgba(180,180,210,0.5)', cursor: 'pointer', padding: 4,
            }}><CloseIcon /></button>
          </div>
        </div>

        {/* Scrollable body — THIS WAS THE BUG: overflow must be 'auto' not 'hidden' */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

          {/* ── Unit selector ── */}
          <div style={{ display: 'flex', gap: 5, padding: '10px 12px 0' }}>
            {['in','ft','cm','m'].map(u => (
              <button key={u} onClick={() => setDisplayUnit(u)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 8,
                border: `1px solid ${displayUnit===u?'rgba(0,212,255,0.45)':'rgba(255,255,255,0.09)'}`,
                background: displayUnit===u?'rgba(0,212,255,0.16)':'rgba(255,255,255,0.04)',
                color: displayUnit===u?'#00d4ff':'rgba(180,180,210,0.5)',
                fontFamily: '"Space Mono",monospace', fontSize: 12,
                cursor: 'pointer', fontWeight: displayUnit===u?700:400,
              }}>{u}</button>
            ))}
          </div>

          {/* ── Scale correction ── */}
          {reference && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(180,180,210,0.65)' }}>
                  📐 Scale Correction
                  {onePctCm > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 10, fontFamily: '"Space Mono",monospace', color: 'rgba(180,180,210,0.3)' }}>
                      1%={onePctCm.toFixed(1)}cm
                    </span>
                  )}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontFamily: '"Space Mono",monospace', fontSize: 18, fontWeight: 800,
                    color: calibAdj===100?'#00ff88':calibAdj>100?'#ffd166':'#ff6b9d',
                  }}>{calibAdj}%</span>
                  {calibAdj !== 100 && (
                    <button onClick={() => setCalibAdj(100)} style={{
                      padding: '2px 7px', borderRadius: 5,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(180,180,210,0.5)',
                      fontSize: 10, cursor: 'pointer',
                    }}>Reset</button>
                  )}
                </div>
              </div>

              <input type="range" min="50" max="200" step="1" value={calibAdj}
                onChange={e => setCalibAdj(+e.target.value)}
                style={{ width: '100%', accentColor: '#00d4ff', marginBottom: 4 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(180,180,210,0.22)', fontFamily: '"Space Mono",monospace', marginBottom: 8 }}>
                <span>50%</span><span>75%</span><span>100%</span><span>150%</span><span>200%</span>
              </div>

              {/* Quick presets */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                {[
                  {label:'সঠিক',v:100,c:'#00ff88'},
                  {label:'+৩%',v:103,c:'#00d4ff'},
                  {label:'+৫%',v:105,c:'#00d4ff'},
                  {label:'+৮%',v:108,c:'#ffd166'},
                  {label:'+১০%',v:110,c:'#ff6b9d'},
                  {label:'-৩%',v:97,c:'#00d4ff'},
                  {label:'-৫%',v:95,c:'#ffd166'},
                ].map(p=>(
                  <button key={p.v} onClick={()=>setCalibAdj(p.v)} style={{
                    padding:'5px 9px', borderRadius:7,
                    border:`1px solid ${calibAdj===p.v?p.c+'66':'rgba(255,255,255,0.09)'}`,
                    background:calibAdj===p.v?p.c+'1a':'rgba(255,255,255,0.04)',
                    color:calibAdj===p.v?p.c:'rgba(180,180,210,0.5)',
                    fontFamily:'"Space Mono",monospace', fontSize:10.5,
                    fontWeight:calibAdj===p.v?700:400, cursor:'pointer',
                  }}>{p.label}</button>
                ))}
              </div>

              {/* Manual input */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  type="number" min="50" max="200"
                  placeholder="% লিখুন (50-200)"
                  value={manualVal}
                  onChange={e=>setManualVal(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&applyManual()}
                  style={{
                    flex:1, padding:'8px 10px', borderRadius:8,
                    border:'1px solid rgba(255,255,255,0.12)',
                    background:'rgba(255,255,255,0.06)',
                    color:'#e0e0f0', fontFamily:'"Space Mono",monospace',
                    fontSize:13, outline:'none',
                  }}
                />
                <button onClick={applyManual} style={{
                  padding:'8px 14px', borderRadius:8, border:'none',
                  background:'rgba(0,212,255,0.2)', color:'#00d4ff',
                  fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer',
                }}>Apply</button>
              </div>

              {/* Bake button */}
              {calibAdj !== 100 && (
                <button onClick={onBakeCorrection} style={{
                  width:'100%', padding:'8px', borderRadius:8,
                  border:'1px solid rgba(255,215,0,0.35)',
                  background:'rgba(255,215,0,0.1)',
                  color:'rgba(255,215,0,0.9)',
                  fontFamily:'inherit', fontSize:11.5, fontWeight:700, cursor:'pointer',
                }}>
                  ✓ {calibAdj}% Bake করুন → সব মাপ ঠিক হবে
                </button>
              )}

              {/* Body presets toggle */}
              <button onClick={()=>setShowBody(v=>!v)} style={{
                width:'100%', padding:'7px', borderRadius:7, marginTop:7,
                border:'1px solid rgba(255,215,0,0.2)',
                background:'rgba(255,215,0,0.05)',
                color:'rgba(255,215,0,0.65)',
                fontFamily:'inherit', fontSize:11.5, fontWeight:600, cursor:'pointer',
              }}>
                {showBody?'▲':'▼'} মানুষ মাপার Correction Presets
              </button>

              {showBody && (
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:7 }}>
                  {[
                    {label:'মুখ রেফ → পুরো উচ্চতা',note:'+৭% perspective',v:107},
                    {label:'মুখ রেফ → কোমর পর্যন্ত',note:'+৩% perspective',v:103},
                    {label:'Tape (সামনে) → body পেছনে',note:'+৫% depth correction',v:105},
                    {label:'দরজা / দেয়াল রেফ',note:'flat — কোনো correction নেই',v:100},
                  ].map(b=>(
                    <button key={b.label} onClick={()=>setCalibAdj(b.v)} style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'9px 12px', borderRadius:8,
                      border:`1px solid ${calibAdj===b.v?'rgba(255,215,0,0.4)':'rgba(255,255,255,0.08)'}`,
                      background:calibAdj===b.v?'rgba(255,215,0,0.1)':'rgba(255,255,255,0.03)',
                      color:calibAdj===b.v?'rgba(255,215,0,0.9)':'rgba(180,180,210,0.55)',
                      fontFamily:'inherit', fontSize:11.5, cursor:'pointer',
                    }}>
                      <div style={{textAlign:'left'}}>
                        <div style={{fontWeight:600}}>{b.label}</div>
                        <div style={{fontSize:10,opacity:0.6,marginTop:1}}>{b.note}</div>
                      </div>
                      <span style={{
                        fontFamily:'"Space Mono",monospace', fontSize:13, fontWeight:700,
                        color:b.v===100?'#00ff88':'#ffd166',
                      }}>{b.v}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Reference card ── */}
          {reference && (
            <div style={{
              margin:'10px 10px 0', padding:'10px 12px',
              background:'rgba(255,107,53,0.08)',
              border:'1px solid rgba(255,107,53,0.22)', borderRadius:10,
            }}>
              <div style={{fontSize:9,fontWeight:600,letterSpacing:'2px',color:'rgba(255,107,53,0.5)',marginBottom:4}}>CALIBRATED REFERENCE</div>
              <div style={{fontFamily:'"Space Mono",monospace',fontSize:20,fontWeight:700,color:'#ff6b35'}}>
                {fmt(reference.valInches, displayUnit)}
              </div>
              <div style={{fontFamily:'"Space Mono",monospace',fontSize:9.5,color:'rgba(255,107,53,0.38)',marginTop:3}}>
                {effPpu?.toFixed(3)} px/in · adj {calibAdj}%
              </div>
            </div>
          )}

          {/* ── Hint ── */}
          {!reference && (
            <div style={{margin:12,padding:'12px 14px',background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.14)',borderRadius:10,fontSize:12.5,color:'rgba(180,180,210,0.7)',lineHeight:1.6}}>
              <span style={{fontSize:20,marginRight:8}}>📐</span>
              <strong style={{color:'#00d4ff'}}>Ref</strong> টুল দিয়ে দুটো বিন্দু ট্যাপ করুন।
            </div>
          )}

          {/* ── Empty state ── */}
          {reference && measurements.length === 0 && (
            <div style={{padding:'20px',textAlign:'center',fontSize:12.5,color:'rgba(180,180,210,0.25)',lineHeight:1.8}}>
              এখনো কোনো মাপ নেই।<br/>
              <strong style={{color:'rgba(0,255,136,0.45)'}}>Measure</strong> → দুটো বিন্দু ট্যাপ করুন।
            </div>
          )}

          {/* ── Measurement list ── */}
          {measurements.map(m => (
            <MeasItem key={m.id} m={m} effPpu={effPpu} displayUnit={displayUnit} onDelete={onDelete} />
          ))}

          {/* ── Export ── */}
          {measurements.length > 0 && (
            <div style={{padding:'8px 10px',display:'flex',gap:5}}>
              <button className="ri-export" onClick={onExportPNG}><DownloadIcon /><span>PNG</span></button>
              <button className="ri-export" onClick={onExportJPG}><DownloadIcon /><span>JPG</span></button>
              <button className="ri-export" onClick={onExportJSON}><JsonIcon /><span>JSON</span></button>
            </div>
          )}

          {/* ── Clear ── */}
          {measurements.length > 0 && (
            <div style={{padding:'8px 10px 20px'}}>
              <button onClick={onClear} style={{
                width:'100%', padding:'9px', borderRadius:8,
                border:'1px solid rgba(255,80,80,0.22)',
                background:'rgba(255,80,80,0.07)',
                color:'rgba(255,80,80,0.65)',
                fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer',
              }}>সব মুছুন</button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .ri-item { display:flex; align-items:center; gap:10px; padding:10px 12px; margin:3px 8px; border-radius:9px; border:1px solid transparent; transition:all .15s; }
        .ri-item:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08); }
        .ri-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .ri-info { flex:1; min-width:0; }
        .ri-lbl { font-size:9px; font-weight:600; letter-spacing:2px; color:rgba(180,180,210,0.3); margin-bottom:2px; }
        .ri-val { font-family:"Space Mono",monospace; font-size:16px; font-weight:700; line-height:1.2; }
        .ri-sub { font-family:"Space Mono",monospace; font-size:9px; color:rgba(180,180,210,0.28); margin-top:3px; }
        .ri-del { width:24px; height:24px; border-radius:6px; border:none; background:transparent; color:rgba(180,180,210,0.2); cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:all .15s; flex-shrink:0; }
        .ri-item:hover .ri-del { opacity:1; }
        .ri-del:hover { background:rgba(255,80,80,0.2); color:#ff5252; }
        .ri-export { flex:1; display:flex; align-items:center; justify-content:center; gap:5px; padding:7px 8px; border-radius:7px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(180,180,210,0.5); font-family:inherit; font-size:11.5px; font-weight:500; cursor:pointer; transition:all .14s; }
        .ri-export:hover { background:rgba(0,212,255,0.09); border-color:rgba(0,212,255,0.28); color:#00d4ff; }
      `}</style>
    </>
  );
}

// Desktop sidebar content (same but no sheet animation)
function DesktopContent({ reference, measurements, displayUnit, setDisplayUnit, calibAdj, setCalibAdj, effPpu, onePctCm, onDelete, onClear, onExportPNG, onExportJPG, onExportJSON, onBakeCorrection, showBody, setShowBody, manualVal, setManualVal, applyManual }) {
  return (
    <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'12px 14px 10px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#d0d0e8', marginBottom:10 }}>📊 Measurements <span style={{ background:'rgba(0,212,255,0.18)',color:'#00d4ff',fontFamily:'"Space Mono",monospace',fontSize:10,fontWeight:700,padding:'1px 8px',borderRadius:10,marginLeft:6 }}>{measurements.length}</span></div>
        <div style={{ display:'flex', gap:4, marginBottom:10 }}>
          {['in','ft','cm','m'].map(u=>(
            <button key={u} onClick={()=>setDisplayUnit(u)} style={{ flex:1,padding:'6px 2px',borderRadius:6,border:`1px solid ${displayUnit===u?'rgba(0,212,255,0.45)':'rgba(255,255,255,0.09)'}`,background:displayUnit===u?'rgba(0,212,255,0.16)':'rgba(255,255,255,0.04)',color:displayUnit===u?'#00d4ff':'rgba(180,180,210,0.5)',fontFamily:'"Space Mono",monospace',fontSize:10.5,cursor:'pointer',fontWeight:displayUnit===u?700:400 }}>{u}</button>
          ))}
        </div>
        {reference && (
          <>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
              <span style={{ fontSize:11,color:'rgba(180,180,210,0.55)' }}>Scale {onePctCm>0&&<span style={{fontFamily:'"Space Mono",monospace',fontSize:9,color:'rgba(180,180,210,0.3)'}}>1%={onePctCm.toFixed(1)}cm</span>}</span>
              <span style={{ fontFamily:'"Space Mono",monospace',fontSize:16,fontWeight:800,color:calibAdj===100?'#00ff88':calibAdj>100?'#ffd166':'#ff6b9d' }}>{calibAdj}%</span>
            </div>
            <input type="range" min="50" max="200" value={calibAdj} onChange={e=>setCalibAdj(+e.target.value)} style={{ width:'100%',accentColor:'#00d4ff',marginBottom:6 }}/>
            {calibAdj!==100&&<button onClick={onBakeCorrection} style={{ width:'100%',padding:'6px',borderRadius:7,border:'1px solid rgba(255,215,0,0.3)',background:'rgba(255,215,0,0.08)',color:'rgba(255,215,0,0.8)',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer',marginBottom:6 }}>✓ Bake {calibAdj}%</button>}
          </>
        )}
      </div>

      <div style={{ flex:1, overflowY:'auto', minHeight:0 }}>
        {!reference && <div style={{ margin:10,padding:10,background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.14)',borderRadius:8,fontSize:12,color:'rgba(180,180,210,0.65)',lineHeight:1.6 }}>📐 Ref টুল দিয়ে calibrate করুন।</div>}
        {reference && <div style={{ margin:'8px 10px 0',padding:'9px 11px',background:'rgba(255,107,53,0.08)',border:'1px solid rgba(255,107,53,0.2)',borderRadius:8 }}>
          <div style={{ fontSize:8,fontWeight:600,letterSpacing:'2px',color:'rgba(255,107,53,0.45)',marginBottom:3 }}>REF</div>
          <div style={{ fontFamily:'"Space Mono",monospace',fontSize:18,fontWeight:700,color:'#ff6b35' }}>{fmt(reference.valInches,displayUnit)}</div>
        </div>}
        {measurements.map(m=><MeasItem key={m.id} m={m} effPpu={effPpu} displayUnit={displayUnit} onDelete={onDelete}/>)}
        {measurements.length>0&&<div style={{ padding:'6px 10px',display:'flex',gap:5 }}>
          <button className="ri-export" onClick={onExportPNG}><DownloadIcon/><span>PNG</span></button>
          <button className="ri-export" onClick={onExportJPG}><DownloadIcon/><span>JPG</span></button>
          <button className="ri-export" onClick={onExportJSON}><JsonIcon/><span>JSON</span></button>
        </div>}
        {measurements.length>0&&<div style={{ padding:'6px 10px 10px' }}><button onClick={onClear} style={{ width:'100%',padding:'7px',borderRadius:7,border:'1px solid rgba(255,80,80,0.2)',background:'rgba(255,80,80,0.06)',color:'rgba(255,80,80,0.6)',fontFamily:'inherit',fontSize:11,fontWeight:600,cursor:'pointer' }}>সব মুছুন</button></div>}
      </div>
      <style>{`
        .ri-item { display:flex; align-items:center; gap:10px; padding:9px 10px; margin:2px 6px; border-radius:8px; border:1px solid transparent; }
        .ri-item:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.07); }
        .ri-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
        .ri-info { flex:1; min-width:0; }
        .ri-lbl { font-size:8px; font-weight:600; letter-spacing:2px; color:rgba(180,180,210,0.28); margin-bottom:2px; }
        .ri-val { font-family:"Space Mono",monospace; font-size:14px; font-weight:700; }
        .ri-sub { font-family:"Space Mono",monospace; font-size:8.5px; color:rgba(180,180,210,0.28); margin-top:2px; }
        .ri-del { width:22px; height:22px; border-radius:5px; border:none; background:transparent; color:rgba(180,180,210,0.2); cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; flex-shrink:0; }
        .ri-item:hover .ri-del { opacity:1; }
        .ri-del:hover { background:rgba(255,80,80,0.18); color:#ff5252; }
        .ri-export { flex:1; display:flex; align-items:center; justify-content:center; gap:4px; padding:6px 5px; border-radius:6px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.03); color:rgba(180,180,210,0.45); font-family:inherit; font-size:11px; cursor:pointer; }
        .ri-export:hover { background:rgba(0,212,255,0.08); color:#00d4ff; }
      `}</style>
    </div>
  );
}
