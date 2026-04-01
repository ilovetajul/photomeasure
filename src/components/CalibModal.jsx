import { useState } from 'react';
import { dist } from '../utils/helpers.js';

export default function CalibModal({ pendingPts, onConfirm, onCancel }) {
  const [val, setVal]   = useState('');
  const [unit, setUnit] = useState('cm');

  if (!pendingPts) return null;
  const pixDist = dist(pendingPts[0], pendingPts[1]);

  const handleConfirm = () => {
    const v = parseFloat(val);
    if (!v || v <= 0) return;
    onConfirm({ value: v, unit });
  };

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',
      display:'flex',alignItems:'flex-end',justifyContent:'center',
      zIndex:900,backdropFilter:'blur(6px)',
    }} onClick={onCancel}>
      <div style={{
        width:'100%',maxWidth:480,
        background:'#111120',
        border:'1px solid rgba(255,255,255,0.11)',
        borderRadius:'20px 20px 0 0',
        padding:'20px 16px calc(20px + env(safe-area-inset-bottom,0px))',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.7)',
      }} onClick={e=>e.stopPropagation()}>

        <div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.15)',margin:'0 auto 18px'}}/>

        <div style={{fontSize:18,fontWeight:800,color:'#e0e0f0',marginBottom:5}}>📏 রেফারেন্স মাপ দিন</div>
        <div style={{fontSize:12.5,color:'rgba(180,180,210,0.5)',lineHeight:1.6,marginBottom:12}}>
          দুটো বিন্দুর মধ্যে বাস্তব দূরত্ব কত? এটা দিয়েই সব মাপ ক্যালিব্রেট হবে।
        </div>

        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'7px 12px',marginBottom:16,fontFamily:'"Space Mono",monospace',fontSize:11,color:'rgba(180,180,210,0.4)'}}>
          Pixel distance: <strong style={{color:'#e0e0f0'}}>{pixDist.toFixed(2)} px</strong>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
          <input
            type="number" placeholder="মাপ লিখুন... যেমন: 22"
            value={val} min="0.001" step="any" autoFocus
            onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleConfirm()}
            style={{
              width:'100%',padding:'14px 16px',borderRadius:12,
              border:'1px solid rgba(255,255,255,0.14)',
              background:'rgba(255,255,255,0.07)',
              color:'#e0e0f0',fontFamily:'"Space Mono",monospace',
              fontSize:22,outline:'none',boxSizing:'border-box',
            }}
          />
          <div style={{display:'flex',gap:6}}>
            {[{v:'cm',label:'cm'},{v:'in',label:'inch'},{v:'ft',label:'feet'},{v:'m',label:'m'}].map(u=>(
              <button key={u.v} onClick={()=>setUnit(u.v)} style={{
                flex:1,padding:'10px 4px',borderRadius:10,
                border:`1px solid ${unit===u.v?'rgba(0,212,255,0.5)':'rgba(255,255,255,0.1)'}`,
                background:unit===u.v?'rgba(0,212,255,0.18)':'rgba(255,255,255,0.05)',
                color:unit===u.v?'#00d4ff':'rgba(180,180,210,0.5)',
                fontFamily:'"Space Mono",monospace',
                fontSize:12,fontWeight:unit===u.v?700:400,
                cursor:'pointer',transition:'all .14s',
              }}>{u.label}</button>
            ))}
          </div>
        </div>

        <div style={{fontSize:9.5,fontWeight:600,letterSpacing:'1.5px',color:'rgba(180,180,210,0.25)',marginBottom:7}}>QUICK PICK</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>
          {[
            {label:'মুখ',val:'22',unit:'cm'},
            {label:'A4 লম্বা',val:'29.7',unit:'cm'},
            {label:'A4 চওড়া',val:'21',unit:'cm'},
            {label:'কার্ড',val:'8.56',unit:'cm'},
            {label:'৫০০৳ নোট',val:'15.6',unit:'cm'},
          ].map(q=>(
            <button key={q.label} onClick={()=>{setVal(q.val);setUnit(q.unit);}} style={{
              padding:'6px 11px',borderRadius:8,
              border:'1px solid rgba(255,255,255,0.1)',
              background:val===q.val?'rgba(255,107,53,0.15)':'rgba(255,255,255,0.04)',
              color:val===q.val?'#ff6b35':'rgba(180,180,210,0.55)',
              fontSize:11.5,fontWeight:500,cursor:'pointer',transition:'all .14s',
            }}>
              {q.label} <span style={{fontFamily:'"Space Mono",monospace',fontSize:10,opacity:0.6}}>{q.val}{q.unit}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={onCancel} style={{
            flex:1,padding:'13px',borderRadius:12,
            border:'1px solid rgba(255,255,255,0.1)',
            background:'rgba(255,255,255,0.04)',
            color:'rgba(180,180,210,0.5)',
            fontFamily:'inherit',fontSize:14,cursor:'pointer',
          }}>বাতিল</button>
          <button onClick={handleConfirm} disabled={!val||+val<=0} style={{
            flex:2,padding:'13px',borderRadius:12,border:'none',
            background:val&&+val>0?'linear-gradient(135deg,#00d4ff,#0099bb)':'rgba(255,255,255,0.08)',
            color:val&&+val>0?'#000':'rgba(180,180,210,0.3)',
            fontFamily:'inherit',fontSize:14,fontWeight:800,
            cursor:val&&+val>0?'pointer':'not-allowed',
            transition:'all .15s',letterSpacing:0.3,
          }}>ক্যালিব্রেট করুন →</button>
        </div>
      </div>
    </div>
  );
}
