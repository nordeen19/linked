import { useEffect, useRef } from 'react';

function NavItem({ icon, label, active, onClick }) {
  const rippleRef = useRef(null);

  function handleClick(e) {
    const btn = rippleRef.current;
    if (!btn) return;
    const circle = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    circle.style.cssText = `
      position:absolute;width:48px;height:48px;border-radius:50%;
      background:rgba(51,102,204,0.2);
      transform:scale(0);animation:ripple 400ms ease-out forwards;
      left:${e.clientX - rect.left - 24}px;top:${e.clientY - rect.top - 24}px;
      pointer-events:none;
    `;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 450);
    onClick();
  }

  return (
    <button
      ref={rippleRef}
      onClick={handleClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 3, padding: '8px 0',
        position: 'relative', overflow: 'hidden', background: 'none',
        color: active ? 'var(--color-progressive)' : 'var(--color-subtle)',
        minHeight: 48,
      }}
      aria-label={label}
    >
      {icon}
      <span style={{ fontSize: 12, fontWeight: active ? 700 : 400 }}>{label}</span>
    </button>
  );
}

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <div style={{
      height: 60,
      background: 'var(--color-surface-0)',
      borderTop: '1px solid var(--color-surface-2)',
      display: 'flex',
      flexShrink: 0,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <NavItem
        active={activeTab === 'daily'}
        onClick={() => onTabChange('daily')}
        label="Daily"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        }
      />
      <NavItem
        active={activeTab === 'traveler'}
        onClick={() => onTabChange('traveler')}
        label="Traveler"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
        }
      />
    </div>
  );
}
