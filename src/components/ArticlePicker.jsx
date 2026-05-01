import { useState, useEffect, useRef } from 'react';
import { searchArticles, getArticleSummary } from '../hooks/useWikipediaApi';

export default function ArticlePicker({ onSelect, suggestions = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchArticles(query);
        setResults(r);
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function handleSelect(title) {
    try {
      const summary = await getArticleSummary(title);
      onSelect(summary);
    } catch {
      onSelect({ title, description: '', extract: '', thumbnail: null });
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--spacing-100)', gap: 16, overflowY: 'auto' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-base)' }}>Choose your starting article</div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Wikipedia…"
          style={{
            width: '100%', height: 48, borderRadius: 'var(--border-radius-base)',
            border: '2px solid var(--color-surface-2)',
            padding: '0 16px 0 44px',
            fontSize: 16, color: 'var(--color-base)',
            background: 'var(--color-surface-0)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-progressive)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-surface-2)'}
        />
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)' }}
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div style={{ background: 'var(--color-surface-0)', borderRadius: 'var(--border-radius-base)', border: '1px solid var(--color-surface-2)', overflow: 'hidden' }}>
          {results.map((r, i) => (
            <button
              key={r.title}
              onClick={() => handleSelect(r.title)}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px',
                borderBottom: i < results.length - 1 ? '1px solid var(--color-surface-2)' : 'none',
                background: 'none', cursor: 'pointer', display: 'block',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-base)' }}>{r.title}</div>
              {r.description && <div style={{ fontSize: 13, color: 'var(--color-subtle)', marginTop: 2 }}>{r.description}</div>}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {!query && suggestions.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-subtle)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Suggested starts
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {suggestions.map(s => (
              <button
                key={s.title}
                onClick={() => handleSelect(s.title)}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  background: 'var(--color-surface-1)', border: '1px solid var(--color-surface-2)',
                  borderRadius: 12, padding: '8px 10px', cursor: 'pointer', maxWidth: 100,
                }}
              >
                {s.thumbnail && (
                  <img src={s.thumbnail} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                )}
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-base)', textAlign: 'center', lineHeight: 1.3 }}>
                  {s.title.length > 20 ? s.title.slice(0, 18) + '…' : s.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
