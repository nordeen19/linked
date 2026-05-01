import { useEffect, useState } from 'react';
import ConnectionCard from './ConnectionCard';
import SuggestedConnections from './SuggestedConnections';
import { useSectionExcerpt } from '../hooks/useSectionExcerpt';
import { getArticleSummary } from '../hooks/useWikipediaApi';
import { rankSuggestions } from '../utils/suggestionRanker';

export default function ResultsScreen({ state, onBack }) {
  const { fetchExcerpt } = useSectionExcerpt();
  const [excerpts, setExcerpts] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { decisions, cards, featuredArticle, rootArticle, mode, allLinksCache, firstParaLinksCache } = state;
  const rootTitle = mode === 'daily' ? featuredArticle?.title : rootArticle?.title;
  const rootThumbnail = mode === 'daily' ? featuredArticle?.thumbnail : rootArticle?.thumbnail;

  const relatedDecisions = decisions.filter(d => d.isRelated);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Fetch excerpts for related cards
      const excerptEntries = await Promise.all(
        relatedDecisions.map(async (d) => {
          const card = cards.find(c => c.title === d.cardTitle);
          if (!card?.linkLocation) return [d.cardTitle, null];
          const data = await fetchExcerpt(rootTitle, d.cardTitle, card.linkLocation);
          return [d.cardTitle, data];
        })
      );
      const newExcerpts = Object.fromEntries(excerptEntries);
      setExcerpts(newExcerpts);

      // Rank suggestions
      const correctCards = relatedDecisions
        .filter(d => d.correct)
        .map(d => cards.find(c => c.title === d.cardTitle))
        .filter(Boolean);

      const shownTitles = cards.map(c => c.title);
      const ranked = rankSuggestions(correctCards, allLinksCache, shownTitles, firstParaLinksCache);

      // Fetch summaries for suggestions
      const withSummaries = await Promise.all(
        ranked.map(async (s) => {
          try {
            const summary = await getArticleSummary(s.title);
            return { ...s, thumbnail: summary.thumbnail, description: summary.description };
          } catch {
            return s;
          }
        })
      );
      setSuggestions(withSummaries.filter(s => s.description || s.thumbnail));
      setLoading(false);
    }

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Session recap chips
  const allDecisions = decisions;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* App bar with back */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', padding: '0 var(--spacing-100)',
        background: 'var(--color-surface-0)', borderBottom: '1px solid var(--color-surface-2)',
        flexShrink: 0, gap: 12,
      }}>
        <button onClick={onBack} aria-label="Back" style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--color-progressive)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-base)' }}>What you discovered</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-100)', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--color-surface-1)' }}>
        {/* Section A: recap chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {allDecisions.map((d, i) => (
            <div key={i} style={{
              flexShrink: 0,
              background: d.correct
                ? (d.isRelated ? 'rgba(0,175,137,0.12)' : 'rgba(0,175,137,0.08)')
                : 'rgba(215,51,51,0.1)',
              border: `1px solid ${d.correct ? 'var(--color-success)' : 'var(--color-destructive)'}`,
              borderRadius: 'var(--border-radius-pill)',
              padding: '3px 10px',
              fontSize: 12, fontWeight: 600,
              color: d.correct ? 'var(--color-success)' : 'var(--color-destructive)',
            }}>
              {d.correct ? '✓' : '✗'} {d.cardTitle.length > 18 ? d.cardTitle.slice(0, 16) + '…' : d.cardTitle}
            </div>
          ))}
        </div>

        {/* Section B: Connection Explorer */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-base)' }}>Connection Explorer</div>
        {loading ? (
          <div style={{ color: 'var(--color-subtle)', fontSize: 14, textAlign: 'center', padding: 20 }}>Loading connections…</div>
        ) : (
          relatedDecisions.map((d, i) => {
            const card = cards.find(c => c.title === d.cardTitle);
            return (
              <ConnectionCard
                key={i}
                rootTitle={rootTitle}
                rootThumbnail={rootThumbnail}
                card={card}
                excerptData={excerpts[d.cardTitle]}
                userCorrect={d.correct}
              />
            );
          })
        )}

        {/* Section C: Suggestions */}
        {!loading && suggestions.length > 0 && <SuggestedConnections suggestions={suggestions} />}

        {/* Section D: Read root article */}
        {rootTitle && (
          <a
            href={`https://en.m.wikipedia.org/wiki/${encodeURIComponent(rootTitle.replace(/ /g, '_'))}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', borderRadius: 16,
              background: 'var(--color-surface-0)',
              boxShadow: 'var(--box-shadow-card)',
              overflow: 'hidden', textDecoration: 'none',
            }}
          >
            {rootThumbnail && (
              <img src={rootThumbnail} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: '12px 16px 16px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-base)', marginBottom: 4 }}>{rootTitle}</div>
              <div style={{
                display: 'block', width: '100%', textAlign: 'center',
                height: 44, borderRadius: 'var(--border-radius-pill)',
                background: 'var(--color-progressive)', color: '#fff',
                fontSize: 15, fontWeight: 700, lineHeight: '44px',
                marginTop: 12,
              }}>
                Read full article →
              </div>
            </div>
          </a>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
