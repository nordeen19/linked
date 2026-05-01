export default function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });

  return (
    <div style={{
      height: 24,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      flexShrink: 0,
    }}>
      <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
          <rect x="0" y="6" width="3" height="6" rx="0.5"/>
          <rect x="4.5" y="4" width="3" height="8" rx="0.5"/>
          <rect x="9" y="2" width="3" height="10" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5"/>
        </svg>
        {/* WiFi */}
        <svg width="15" height="12" viewBox="0 0 15 12" fill="white">
          <path d="M7.5 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
          <path d="M7.5 6C5.9 6 4.5 6.6 3.4 7.6L2 6.1A7.4 7.4 0 0 1 7.5 4c2.1 0 4 .9 5.5 2.1L11.6 7.6A5.5 5.5 0 0 0 7.5 6z"/>
          <path d="M7.5 2.5C4.8 2.5 2.3 3.6.5 5.4L-.8 4A9.9 9.9 0 0 1 7.5 0a9.9 9.9 0 0 1 8.3 4l-1.3 1.4A7.9 7.9 0 0 0 7.5 2.5z" opacity=".4"/>
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="white">
          <rect x="0" y="1" width="21" height="10" rx="2" stroke="white" strokeWidth="1" fill="none"/>
          <rect x="21.5" y="4" width="2.5" height="4" rx="1" fill="white" opacity=".5"/>
          <rect x="1.5" y="2.5" width="16" height="7" rx="1" fill="white"/>
        </svg>
      </div>
    </div>
  );
}
