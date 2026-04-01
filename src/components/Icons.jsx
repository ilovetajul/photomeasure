export const RulerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1.5" y="6" width="15" height="6" rx="1.5"/>
    <line x1="4.5" y1="6" x2="4.5" y2="9"/>
    <line x1="7.5" y1="6" x2="7.5" y2="8"/>
    <line x1="10.5" y1="6" x2="10.5" y2="9"/>
    <line x1="13.5" y1="6" x2="13.5" y2="8"/>
  </svg>
);

export const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="9" r="6.5"/>
    <circle cx="9" cy="9" r="2.5"/>
    <line x1="9" y1="1.5" x2="9" y2="4.5"/>
    <line x1="9" y1="13.5" x2="9" y2="16.5"/>
    <line x1="1.5" y1="9" x2="4.5" y2="9"/>
    <line x1="13.5" y1="9" x2="16.5" y2="9"/>
  </svg>
);

export const HandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 8.5V4a1.25 1.25 0 0 1 2.5 0v4"/>
    <path d="M9.5 7.5V3.25a1.25 1.25 0 0 1 2.5 0V8"/>
    <path d="M12 7.25V5.5a1.25 1.25 0 0 1 2.5 0V10c0 3-1.8 6-5.5 6S3.5 13 3.5 10.5V10l2.5-1.5"/>
  </svg>
);

export const UploadIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="4" y="4" width="40" height="40" rx="10" strokeDasharray="6 4"/>
    <path d="M24 30V18M17 25l7-7 7 7"/>
    <path d="M15 36h18"/>
  </svg>
);

export const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 7H10a3.5 3.5 0 0 1 0 7H8"/>
    <path d="M4 7L7 4M4 7L7 10"/>
  </svg>
);

export const RedoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 7H6a3.5 3.5 0 0 0 0 7H8"/>
    <path d="M12 7L9 4M12 7L9 10"/>
  </svg>
);

export const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 2v9M5 8l3 3 3-3"/>
    <path d="M2 11v1.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V11"/>
  </svg>
);

export const JsonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M4 2.5H2.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H4"/>
    <path d="M12 2.5h1.5a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H12"/>
    <line x1="6.5" y1="10.5" x2="9.5" y2="5.5"/>
  </svg>
);

export const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 2l10 10M12 2L2 12"/>
  </svg>
);

export const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2.5"/>
    <circle cx="5.5" cy="5.5" r="1.5"/>
    <path d="M1.5 10.5l4-4 3 3 2-2 3.5 3.5"/>
  </svg>
);

export const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <line x1="3" y1="6" x2="17" y2="6"/>
    <line x1="3" y1="10" x2="17" y2="10"/>
    <line x1="3" y1="14" x2="17" y2="14"/>
  </svg>
);

export const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M4 6l4 4 4-4"/>
  </svg>
);

export const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="7" y1="2" x2="7" y2="12"/>
    <line x1="2" y1="7" x2="12" y2="7"/>
  </svg>
);
