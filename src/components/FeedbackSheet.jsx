import { useEffect, useRef, useState } from 'react';

export default function FeedbackSheet({ correct, cardTitle, rootTitle, feedbackSnippet, pointsAwarded, linkLocation, onNext }) {
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleNext() {
    setVisible(false);
    setTimeout(onNext, 200);
  }

  function onTouchStart(e) {
    startY.current = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  }

  function onTouchEnd() {
    if (dragY > 80) handleNext();
    else setDragY(0);
  }

  const sectionAnchor = linkLocation?.sectionAnchor || linkLocation?.sectionTitle?.replace(/ /g, '_');
  const wikiUrl = rootTitle
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(rootTitle.replace(/ /g, '_'))}${sectionAnchor ? '#' + sectionAnchor : ''}`
    : null;

  return (
    <>
      {/* Scrim */}
      <div
        onClick={handleNext}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 20,
          opacity: visible ? 1 : 0,
          transition: 'opacity 200ms',
        }}
      />

      {/* Sheet */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'var(--color-surface-0)',
          borderRadius: '16px 16px 0 0',
          padding: '0 var(--spacing-100) var(--spacing-150)',
          zIndex: 21,
          transform: visible ? `translateY(${dragY}px)` : 'translateY(100%)',
          transition: dragY > 0 ? 'none' : `transform ${visible ? 280 : 200}ms cubic-bezier(${visible ? '0.2, 0, 0, 1' : '0.4, 0, 1, 1'})`,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '80%',
          overflowY: 'auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-surface-2)' }} />
        </div>

        {/* Result header */}
        <div style={{
          fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 12,
          color: correct ? 'var(--color-success)' : 'var(--color-destructive)',
        }}>
          {correct ? '✓ Correct!' : '✗ Not quite'}
        </div>

        {/* Snippet */}
        {feedbackSnippet && (
          <div style={{
            fontSize: 14, color: 'var(--color-base)', lineHeight: 1.6,
            marginBottom: 12,
          }}>
            {feedbackSnippet}
          </div>
        )}

        {/* Section tag */}
        {linkLocation?.sectionTitle && correct && (
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-surface-2)',
              borderRadius: 'var(--border-radius-pill)',
              padding: '4px 12px',
              fontSize: 13, color: 'var(--color-progressive)',
              textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            § Linked in: {linkLocation.sectionTitle}
          </a>
        )}

        {/* Points */}
        <div style={{
          textAlign: 'center', fontSize: 20, fontWeight: 700,
          color: 'var(--color-progressive)',
          marginBottom: 16,
          animation: 'score-pop 400ms ease-out',
        }}>
          {pointsAwarded > 0 ? `+${pointsAwarded} pts` : 'No points'}
        </div>

        {/* Next button */}
        <button
          autoFocus
          onClick={handleNext}
          style={{
            width: '100%', height: 48, borderRadius: 'var(--border-radius-pill)',
            background: 'var(--color-progressive)', color: 'var(--color-inverted)',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}
        >
          Next →
        </button>
      </div>
    </>
  );
}
