import { useState, useCallback } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

const CATEGORY_COLORS = [
  '#3366CC', '#00af89', '#a55858', '#6b5cb1', '#c07428', '#2e8b57',
];

function getCategoryColor(title) {
  let hash = 0;
  for (const ch of (title || '')) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export default function SwipeCard({ card, onSwipe, isTop, style }) {
  const [drag, setDrag] = useState({ deltaX: 0, rotation: 0, direction: null });
  const [leaving, setLeaving] = useState(null); // 'left' | 'right' | null

  const handleSwipe = useCallback((dir) => {
    setLeaving(dir);
    setTimeout(() => {
      setLeaving(null);
      setDrag({ deltaX: 0, rotation: 0, direction: null });
      onSwipe(dir);
    }, 260);
  }, [onSwipe]);

  const handleDrag = useCallback((info) => {
    setDrag(info);
  }, []);

  const handlers = useSwipeGesture({ onSwipe: handleSwipe, onDrag: handleDrag });

  const tintOpacity = Math.min(Math.abs(drag.deltaX) / 120, 1) * 0.5;

  let transform = `translateX(${drag.deltaX}px) rotate(${drag.rotation}deg)`;
  let transition = 'none';

  if (leaving === 'right') {
    transform = 'translateX(500px) rotate(30deg)';
    transition = 'transform 250ms ease-in';
  } else if (leaving === 'left') {
    transform = 'translateX(-500px) rotate(-30deg)';
    transition = 'transform 250ms ease-in';
  } else if (drag.deltaX === 0 && !leaving) {
    transition = 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  const accentColor = getCategoryColor(card?.title);
  const hasImage = !!card?.thumbnail;

  return (
    <div
      className="card"
      {...(isTop ? handlers : {})}
      style={{
        width: 'calc(100% - 32px)',
        maxWidth: 340,
        borderRadius: 16,
        background: 'var(--color-surface-0)',
        boxShadow: 'var(--box-shadow-elevated)',
        overflow: 'hidden',
        position: 'absolute',
        transform,
        transition,
        cursor: isTop ? 'grab' : 'default',
        userSelect: 'none',
        touchAction: 'none',
        ...style,
      }}
    >
      {/* Image or placeholder */}
      {hasImage ? (
        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
          <img
            src={card.thumbnail}
            alt={card.title}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (
        <div style={{
          height: 180,
          background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}66)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 72, color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
            {(card?.title || '?')[0]}
          </span>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ fontSize: 'var(--font-size-large)', fontWeight: 700, color: 'var(--color-base)', lineHeight: 1.25, marginBottom: 6 }}>
          {card?.title}
        </div>
        <div style={{
          fontSize: 14, color: 'var(--color-subtle)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: hasImage ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 10,
        }}>
          {card?.description || card?.extract}
        </div>
        {card?.category && (
          <div style={{
            display: 'inline-block',
            background: 'var(--color-surface-2)',
            color: 'var(--color-subtle)',
            fontSize: 12, borderRadius: 'var(--border-radius-pill)',
            padding: '2px 10px',
          }}>
            {card.category}
          </div>
        )}
      </div>

      {/* Swipe tint overlay */}
      {isTop && drag.direction === 'right' && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: `rgba(0, 175, 137, ${tintOpacity})`,
          pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px',
        }}>
          <div style={{
            border: '3px solid #00af89', borderRadius: 8, padding: '4px 12px',
            color: '#00af89', fontWeight: 700, fontSize: 18, opacity: tintOpacity * 2,
            transform: 'rotate(-15deg)',
          }}>
            RELATED ✓
          </div>
        </div>
      )}
      {isTop && drag.direction === 'left' && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: `rgba(215, 51, 51, ${tintOpacity})`,
          pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 20px',
        }}>
          <div style={{
            border: '3px solid #D73333', borderRadius: 8, padding: '4px 12px',
            color: '#D73333', fontWeight: 700, fontSize: 18, opacity: tintOpacity * 2,
            transform: 'rotate(15deg)',
          }}>
            ✗ NOT RELATED
          </div>
        </div>
      )}
    </div>
  );
}
