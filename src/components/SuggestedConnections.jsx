export default function SuggestedConnections({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-base)' }}>Explore further</div>
      {suggestions.map((s, i) => {
        const encoded = encodeURIComponent((s.title || '').replace(/ /g, '_'));
        return (
          <a
            key={i}
            href={`https://en.m.wikipedia.org/wiki/${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', gap: 12, alignItems: 'center',
              background: 'var(--color-surface-0)',
              borderRadius: 12, padding: '10px 12px',
              boxShadow: 'var(--box-shadow-card)',
              textDecoration: 'none',
            }}
          >
            {s.thumbnail ? (
              <img src={s.thumbnail} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--color-surface-2)', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-base)', lineHeight: 1.25, marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--color-subtle)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                {s.description}
              </div>
              {s.relatedTo && (
                <div style={{ fontSize: 12, color: 'var(--color-progressive)' }}>→ Related to {s.relatedTo}</div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
