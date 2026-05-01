export default function AppBar({ title = 'Daily Game', streak = 0 }) {
  return (
    <div style={{
      height: 56,
      background: 'var(--color-surface-0)',
      borderBottom: '1px solid var(--color-surface-2)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--spacing-100)',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Wikipedia W logo */}
      <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="24" stroke="#A2A9B1" strokeWidth="1.5" fill="white"/>
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
            style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif', fill: '#202122' }}>W</text>
        </svg>
      </div>

      {/* Centered title */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        fontSize: 17, fontWeight: 700, color: 'var(--color-base)',
        letterSpacing: -0.2,
      }}>
        {title}
      </div>

      {/* Streak badge */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-surface-2)',
          borderRadius: 'var(--border-radius-pill)',
          padding: '4px 10px',
        }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-base)' }}>{streak}</span>
        </div>
      </div>
    </div>
  );
}
