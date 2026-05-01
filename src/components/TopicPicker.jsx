import { useState } from 'react';
import { TOPICS } from '../data/topicArticles';
import { getArticleSummary } from '../hooks/useWikipediaApi';

export default function TopicPicker({ onSelect }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(null); // title being loaded

  async function handleArticleSelect(title) {
    setLoading(title);
    try {
      const summary = await getArticleSummary(title);
      onSelect(summary);
    } catch {
      onSelect({ title, description: '', extract: '', thumbnail: null });
    } finally {
      setLoading(null);
    }
  }

  if (selectedTopic) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topic header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px var(--spacing-100)',
          background: 'var(--color-surface-0)',
          borderBottom: '1px solid var(--color-surface-2)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSelectedTopic(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-progressive)', padding: 4, display: 'flex', alignItems: 'center' }}
            aria-label="Back to topics"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <span style={{ fontSize: 20 }}>{selectedTopic.emoji}</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-base)' }}>{selectedTopic.label}</span>
        </div>

        {/* Article list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-100)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--color-subtle)', marginBottom: 4 }}>
            Pick an article to start your path from
          </p>
          {selectedTopic.articles.map((title) => (
            <button
              key={title}
              onClick={() => handleArticleSelect(title)}
              disabled={!!loading}
              style={{
                width: '100%', textAlign: 'left',
                background: loading === title ? 'var(--color-surface-2)' : 'var(--color-surface-0)',
                border: '1px solid var(--color-surface-2)',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 15, fontWeight: 600,
                color: 'var(--color-base)',
                cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 150ms',
              }}
            >
              <span>{loading === title ? 'Loading…' : title}</span>
              {loading !== title && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-subtle)', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px var(--spacing-100) 8px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-base)', marginBottom: 4 }}>Choose a topic</div>
        <div style={{ fontSize: 13, color: 'var(--color-subtle)' }}>Pick a category to start your Wikipedia journey</div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '0 var(--spacing-100) var(--spacing-100)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        alignContent: 'start',
      }}>
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            style={{
              background: 'var(--color-surface-0)',
              border: '1px solid var(--color-surface-2)',
              borderRadius: 14,
              padding: '14px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 6,
              transition: 'background 150ms',
            }}
          >
            <span style={{ fontSize: 26 }}>{topic.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-base)', lineHeight: 1.25 }}>
              {topic.label}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-subtle)' }}>
              {topic.articles.length} articles
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
