import { useCallback, useState } from 'react';
import CardStack from './CardStack';
import FeedbackSheet from './FeedbackSheet';
import PathTracker from './PathTracker';
import SkeletonCard from './SkeletonCard';
import { useHaptics } from '../hooks/useHaptics';

export default function TravelerGameScreen({ state, onSwipe, onNextCard }) {
  const haptics = useHaptics();
  const [hintVisible, setHintVisible] = useState(true);

  const { cards, currentIndex, score, phase, rootArticle, path,
    lastDecisionCorrect, feedbackSnippet, pointsAwarded } = state;

  const current = cards[currentIndex];

  const handleSwipe = useCallback((dir, card) => {
    setHintVisible(false);
    onSwipe(dir, card);
  }, [onSwipe]);

  if (phase === 'loading') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PathTracker path={[]} rootArticle={null} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SkeletonCard />
        </div>
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
      <PathTracker path={path} rootArticle={rootArticle} />

      {/* Progress / score */}
      <div style={{ padding: '6px var(--spacing-100)', display: 'flex', justifyContent: 'center', fontSize: 13, color: 'var(--color-subtle)', flexShrink: 0 }}>
        ⭐ {score} pts · Path: {path.length}/5
      </div>

      {/* Card stack */}
      {current && (
        <CardStack
          cards={cards.slice(currentIndex)}
          currentIndex={0}
          onSwipe={(dir) => handleSwipe(dir, current)}
        />
      )}

      {/* Swipe hint */}
      {hintVisible && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-subtle)', padding: '4px', flexShrink: 0 }}>
          ← Not linked &nbsp;&nbsp;&nbsp; Linked →
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, padding: '8px var(--spacing-100) var(--spacing-100)', flexShrink: 0 }}>
        <button
          onClick={() => handleSwipe('left', current)}
          style={{
            flex: 1, height: 48, borderRadius: 'var(--border-radius-pill)',
            border: '1.5px solid var(--color-destructive)', color: 'var(--color-destructive)',
            background: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          ✗ Not Linked
        </button>
        <button
          onClick={() => handleSwipe('right', current)}
          style={{
            flex: 1, height: 48, borderRadius: 'var(--border-radius-pill)',
            background: 'var(--color-progressive)', color: '#fff',
            border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          ✓ Linked
        </button>
      </div>

      {/* Feedback sheet */}
      {phase === 'feedback' && current && (
        <FeedbackSheet
          correct={lastDecisionCorrect}
          cardTitle={current.title}
          rootTitle={rootArticle?.title}
          feedbackSnippet={feedbackSnippet}
          pointsAwarded={pointsAwarded}
          linkLocation={current.linkLocation}
          onNext={onNextCard}
        />
      )}
    </div>
  );
}
