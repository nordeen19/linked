import { useState, useCallback, useEffect } from 'react';
import CardStack from './CardStack';
import FeedbackSheet from './FeedbackSheet';
import SkeletonCard from './SkeletonCard';
import { useHaptics } from '../hooks/useHaptics';

function RippleButton({ children, onClick, style, outlined, destructive }) {
  function handleClick(e) {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    circle.style.cssText = `
      position:absolute;width:80px;height:80px;border-radius:50%;
      background:rgba(255,255,255,0.3);transform:scale(0);
      animation:ripple 400ms ease-out forwards;
      left:${e.clientX - rect.left - 40}px;top:${e.clientY - rect.top - 40}px;
      pointer-events:none;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 450);
    onClick();
  }

  return (
    <button onClick={handleClick} style={{
      height: 48, borderRadius: 'var(--border-radius-pill)',
      fontSize: 15, fontWeight: 700,
      cursor: 'pointer', flex: 1, position: 'relative', overflow: 'hidden',
      ...(outlined ? {
        background: 'none',
        border: `1.5px solid ${destructive ? 'var(--color-destructive)' : 'var(--color-progressive)'}`,
        color: destructive ? 'var(--color-destructive)' : 'var(--color-progressive)',
      } : {
        background: destructive ? 'var(--color-destructive)' : 'var(--color-progressive)',
        border: 'none',
        color: 'var(--color-inverted)',
      }),
      ...style,
    }}>
      {children}
    </button>
  );
}

export default function DailyGameScreen({
  state, onSwipe, onNextCard,
}) {
  const haptics = useHaptics();
  const [hintVisible, setHintVisible] = useState(true);

  const { cards, currentIndex, score, phase, featuredArticle,
    lastDecisionCorrect, feedbackSnippet, pointsAwarded } = state;

  const current = cards[currentIndex];
  const progress = currentIndex / Math.min(cards.length, 10);

  useEffect(() => {
    if (currentIndex > 0) setHintVisible(false);
  }, [currentIndex]);

  const handleSwipe = useCallback((dir) => {
    setHintVisible(false);
    onSwipe(dir, current);
  }, [onSwipe, current]);

  if (phase === 'loading') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: '100%', height: 4, background: 'var(--color-surface-2)', flexShrink: 0 }}>
          <div style={{ height: 4, background: 'var(--color-progressive)', width: '30%', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ fontSize: 16, color: 'var(--color-base)', textAlign: 'center' }}>{state.error || 'Failed to load. Check your connection.'}</div>
        <button onClick={() => window.location.reload()} style={{
          padding: '12px 24px', borderRadius: 'var(--border-radius-pill)',
          background: 'var(--color-progressive)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Root article banner */}
      {featuredArticle && (
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--color-surface-1)', padding: '0 var(--spacing-100)',
          flexShrink: 0, borderBottom: '1px solid var(--color-surface-2)',
        }}>
          {featuredArticle.thumbnail && (
            <img src={featuredArticle.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--color-subtle)', marginBottom: 1 }}>Today's article:</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-base)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {featuredArticle.title}
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--color-surface-2)', flexShrink: 0 }}>
        <div style={{
          height: 4, background: 'var(--color-progressive)',
          width: `${progress * 100}%`,
          transition: 'width 300ms cubic-bezier(0.2, 0, 0, 1)',
        }} />
      </div>

      {/* Score row */}
      <div style={{
        padding: '8px var(--spacing-100)',
        display: 'flex', justifyContent: 'center', gap: 16,
        fontSize: 13, color: 'var(--color-subtle)', flexShrink: 0,
      }}>
        <span>⭐ {score} pts</span>
        <span style={{ color: 'var(--color-surface-2)' }}>|</span>
        <span>{currentIndex}/{Math.min(cards.length, 10)} answered</span>
      </div>

      {/* Card stack */}
      {current && (
        <CardStack
          cards={cards.slice(currentIndex)}
          currentIndex={0}
          onSwipe={handleSwipe}
        />
      )}

      {/* Swipe hint */}
      {hintVisible && (
        <div style={{
          textAlign: 'center', fontSize: 13, color: 'var(--color-subtle)',
          padding: '4px var(--spacing-100)', flexShrink: 0,
          transition: 'opacity 300ms',
        }}>
          ← Not Related &nbsp;&nbsp;&nbsp; Related →
        </div>
      )}

      {/* Button fallbacks */}
      <div style={{ display: 'flex', gap: 12, padding: '8px var(--spacing-100) var(--spacing-100)', flexShrink: 0 }}>
        <RippleButton outlined destructive onClick={() => handleSwipe('left')}>
          ✗ Not Related
        </RippleButton>
        <RippleButton onClick={() => handleSwipe('right')}>
          ✓ Related
        </RippleButton>
      </div>

      {/* Feedback sheet */}
      {phase === 'feedback' && current && (
        <FeedbackSheet
          correct={lastDecisionCorrect}
          cardTitle={current.title}
          rootTitle={featuredArticle?.title}
          feedbackSnippet={feedbackSnippet}
          pointsAwarded={pointsAwarded}
          linkLocation={current.linkLocation}
          onNext={onNextCard}
        />
      )}
    </div>
  );
}
