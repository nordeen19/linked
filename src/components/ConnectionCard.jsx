function HighlightedExcerpt({ excerpt, highlightedTitle }) {
  if (!excerpt || !highlightedTitle) return <span>{excerpt || ''}</span>;

  const re = new RegExp(`(${highlightedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = excerpt.split(re);

  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
}

export default function ConnectionCard({ rootTitle, rootThumbnail, card, excerptData, userCorrect }) {
  const rootEncoded = encodeURIComponent((rootTitle || '').replace(/ /g, '_'));
  const cardEncoded = encodeURIComponent((card?.title || '').replace(/ /g, '_'));
  const sectionAnchor = excerptData?.sectionAnchor;

  return (
    <div style={{
      background: 'var(--color-surface-0)',
      borderRadius: 16,
      padding: 'var(--spacing-100)',
      boxShadow: 'var(--box-shadow-card)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Header: root → card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {rootThumbnail && (
          <img src={rootThumbnail} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div style={{ fontSize: 16, color: 'var(--color-subtle)' }}>→</div>
        {card?.thumbnail && (
          <img src={card.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-base)', lineHeight: 1.25 }}>
            {rootTitle} → {card?.title}
          </div>
        </div>
      </div>

      {/* Section link */}
      {excerptData?.sectionTitle && (
        <a
          href={`https://en.wikipedia.org/wiki/${rootEncoded}${sectionAnchor ? '#' + sectionAnchor : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, color: 'var(--color-subtle)', textDecoration: 'none',
          }}
        >
          <span>§</span>
          <span>Found in: <strong>{excerptData.sectionTitle}</strong></span>
        </a>
      )}

      {/* Highlighted excerpt */}
      {excerptData?.excerpt && (
        <div style={{ fontSize: 14, color: 'var(--color-base)', lineHeight: 1.6, background: 'var(--color-surface-1)', borderRadius: 8, padding: '10px 12px' }}>
          <HighlightedExcerpt excerpt={excerptData.excerpt} highlightedTitle={card?.title} />
        </div>
      )}

      {/* User answer badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: userCorrect ? 'rgba(0,175,137,0.1)' : 'rgba(215,51,51,0.1)',
        borderRadius: 'var(--border-radius-pill)',
        padding: '4px 12px',
        fontSize: 12, fontWeight: 700,
        color: userCorrect ? 'var(--color-success)' : 'var(--color-destructive)',
        alignSelf: 'flex-start',
      }}>
        {userCorrect ? '✓ You got this' : '✗ You missed this'}
      </div>

      {/* Read links */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a
          href={`https://en.m.wikipedia.org/wiki/${cardEncoded}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: 'var(--color-progressive)', textDecoration: 'none' }}
        >
          Read "{card?.title}" →
        </a>
        <a
          href={`https://en.m.wikipedia.org/wiki/${rootEncoded}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: 'var(--color-progressive)', textDecoration: 'none' }}
        >
          Read "{rootTitle}" →
        </a>
      </div>
    </div>
  );
}
