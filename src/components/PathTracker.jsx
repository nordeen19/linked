export default function PathTracker({ path, rootArticle, targetLength = 5 }) {
  const totalSteps = targetLength;
  const completedCount = path.length;

  return (
    <div style={{
      background: 'var(--color-surface-1)',
      borderBottom: '1px solid var(--color-surface-2)',
      padding: '10px var(--spacing-100)',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 11, color: 'var(--color-subtle)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Your Path
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
        {/* Starting / current article */}
        {path.length === 0 ? (
          <div style={{
            background: 'var(--color-progressive)',
            borderRadius: 'var(--border-radius-pill)',
            padding: '4px 10px',
            fontSize: 12, fontWeight: 700, color: 'var(--color-inverted)',
            flexShrink: 0, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {rootArticle?.title || '…'}
          </div>
        ) : (
          path.map((stop, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--color-success)',
                transition: 'all 400ms cubic-bezier(0.2, 0, 0, 1)',
                flexShrink: 0,
              }} />
              {i < path.length - 1 && (
                <span style={{ color: 'var(--color-subtle)', fontSize: 12 }}>→</span>
              )}
            </div>
          ))
        )}

        {/* Arrow to current */}
        {path.length > 0 && (
          <>
            <span style={{ color: 'var(--color-subtle)', fontSize: 12, flexShrink: 0 }}>→</span>
            <div style={{
              background: 'var(--color-progressive)',
              borderRadius: 'var(--border-radius-pill)',
              padding: '4px 10px',
              fontSize: 12, fontWeight: 700, color: 'var(--color-inverted)',
              flexShrink: 0, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {rootArticle?.title || '…'}
            </div>
          </>
        )}

        {/* Remaining empty slots */}
        {Array.from({ length: Math.max(0, totalSteps - completedCount - 1) }, (_, i) => (
          <div key={`empty-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ color: 'var(--color-subtle)', fontSize: 12 }}>→</span>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid var(--color-base--disabled)',
              flexShrink: 0,
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
