import { CloseIcon } from './Icons.jsx';

const tips = [
  {
    icon: '📐',
    title: 'সরাসরি সামনে থেকে তুলুন',
    en: 'Shoot straight-on (perpendicular)',
    desc: 'ক্যামেরা অবজেক্টের সামনে সোজাসুজি রাখুন। কোণা থেকে তুললে মাপ ভুল হবে।',
  },
  {
    icon: '📏',
    title: 'রেফারেন্স একই সমতলে রাখুন',
    en: 'Reference must be in the same plane',
    desc: 'যেটা দিয়ে রেফারেন্স দিচ্ছেন (যেমন: মুখের উচ্চতা) এবং যেটা মাপছেন — দুটোই ছবিতে একই দূরত্বে থাকতে হবে।',
  },
  {
    icon: '🔍',
    title: 'পরিষ্কার, শার্প ছবি',
    en: 'Use a sharp, well-lit image',
    desc: 'ঝাপসা বা অন্ধকার ছবিতে পয়েন্ট সঠিকভাবে দেওয়া যায় না। জুম ইন করে সঠিক বিন্দু ট্যাপ করুন।',
  },
  {
    icon: '🏠',
    title: 'ফ্ল্যাট/সমান পৃষ্ঠ',
    en: 'Best on flat surfaces',
    desc: 'দরজা, দেয়াল, আসবাবপত্র — এ ধরনের সমতল জিনিস মাপার জন্য এই টুল সবচেয়ে ভালো কাজ করে।',
  },
  {
    icon: '📌',
    title: 'রেফারেন্স নিখুঁতভাবে দিন',
    en: 'Be precise with reference points',
    desc: 'রেফারেন্সের দুটো বিন্দু যত সঠিকভাবে দেবেন, বাকি সব মাপ তত নির্ভুল হবে। জুম ইন করে পয়েন্ট দিন।',
  },
  {
    icon: '📷',
    title: 'ক্যামেরা লেভেল রাখুন',
    en: 'Keep camera level & steady',
    desc: 'হাতিয়ে বা হেলিয়ে তোলা ছবিতে perspective distortion হয়। ট্রাইপড বা দেয়ালে ঠেস দিয়ে তুলুন।',
  },
  {
    icon: '✅',
    title: 'সবচেয়ে ভালো রেফারেন্স কী?',
    en: 'Best reference objects',
    desc: 'টাকার নোট (৬.৬ × ১৫.৬ সেমি), A4 কাগজ (২১ × ২৯.৭ সেমি), ক্রেডিট কার্ড (৮.৫৬ × ৫.৪ সেমি), মিটার স্কেল।',
  },
];

export default function TipsModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'flex-end',
      zIndex: 950, backdropFilter: 'blur(6px)',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxHeight: '88vh',
        background: '#0f0f1e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px 20px 0 0',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky', top: 0, background: '#0f0f1e', zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#e8e8f8', marginBottom: 2 }}>
              💡 নির্ভুল মাপের গাইড
            </div>
            <div style={{ fontSize: 12, color: 'rgba(180,180,210,0.45)' }}>
              Accuracy Guide — এটা পড়লে মাপ অনেক সঠিক হবে
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(180,180,210,0.5)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CloseIcon />
          </button>
        </div>

        {/* Tips list */}
        <div style={{ overflowY: 'auto', padding: '10px 14px 24px' }}>

          {/* Warning banner */}
          <div style={{
            background: 'rgba(255,107,53,0.1)',
            border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 14,
            fontSize: 12.5, color: 'rgba(255,180,140,0.9)', lineHeight: 1.6,
          }}>
            ⚠️ <strong>মনে রাখুন:</strong> এই অ্যাপ শুধু <strong>2D flat perspective</strong> থেকে মাপ দেয়।
            গোলাকার বস্তু, কোণাকুণি ছবি বা বিভিন্ন দূরত্বের বস্তু মাপলে ভুল হবে।
          </div>

          {tips.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '12px 4px',
              borderBottom: i < tips.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#d8d8f0', marginBottom: 2 }}>
                  {t.title}
                </div>
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontSize: 9,
                  color: 'rgba(0,212,255,0.4)', marginBottom: 5, letterSpacing: 0.5,
                }}>
                  {t.en}
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(180,180,210,0.6)', lineHeight: 1.65 }}>
                  {t.desc}
                </div>
              </div>
            </div>
          ))}

          {/* Standard sizes table */}
          <div style={{
            background: 'rgba(0,212,255,0.07)',
            border: '1px solid rgba(0,212,255,0.18)',
            borderRadius: 12, padding: '14px', marginTop: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#00d4ff', marginBottom: 10 }}>
              📋 সাধারণ রেফারেন্স মাপ
            </div>
            {[
              ['A4 কাগজ (প্রস্থ)',  '21.0 cm', '8.27"'],
              ['A4 কাগজ (দৈর্ঘ্য)', '29.7 cm', '11.69"'],
              ['ক্রেডিট কার্ড (প্রস্থ)', '8.56 cm', '3.37"'],
              ['ক্রেডিট কার্ড (উচ্চতা)', '5.40 cm', '2.13"'],
              ['৫০০ টাকার নোট (দৈর্ঘ্য)', '15.6 cm', '6.14"'],
              ['৫০০ টাকার নোট (প্রস্থ)',  '6.6 cm',  '2.60"'],
              ['স্মার্টফোন (Galaxy S21)', '15.1 cm', '5.97"'],
              ['মানুষের মুখের উচ্চতা (গড়)', '22–24 cm', '8.7–9.4"'],
            ].map(([name, cm, inch], i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <span style={{ fontSize: 12, color: 'rgba(180,180,210,0.65)' }}>{name}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: '#00d4ff' }}>{cm}</span>
                  <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(180,180,210,0.35)' }}>{inch}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Close button */}
        <div style={{ padding: '10px 14px calc(10px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onClose} style={{
            width: '100%', padding: '13px',
            borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #00d4ff, #0099bb)',
            color: '#000', fontFamily: 'inherit',
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
            letterSpacing: 0.3,
          }}>
            বুঝেছি, শুরু করি ✓
          </button>
        </div>
      </div>
    </div>
  );
}
