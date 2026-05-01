import { useEffect, useState } from 'react';
import Confetti from './Confetti';

export default function CompletionScreen({ mode, score, decisions, streak, featuredArticle, path, onResults, onReset, onSwitchMode }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = Math.floor((tomorrow - now) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      setCountdown(`${h}h ${m}m`);
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const correct = decisions.filter(d => d.correct).length;
  const total = decisions.length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  function copyShare() {
    const dayNum = Math.floor(Date.now() / 86400000) - 19000;
    const text = mode === 'daily'
      ? `📚 Wikipedia Daily #${dayNum}\n${correct}/${total} correct | ${score} pts | 🔥${streak} day streak`
      : `🧭 Wikipedia Traveler\nPath: ${path.map(p => p.title).join(' → ')}\n${score} pts`;
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: 'var(--color-surface-1)' }}>
      {showConfetti && <Confetti />}

      <div style={{ padding: 'var(--spacing-150) var(--spacing-100)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Score card */}
        <div style={{
          background: 'var(--color-surface-0)', borderRadius: 16,
          padding: 'var(--spacing-150)', boxShadow: 'var(--box-shadow-card)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-base)', marginBottom: 4 }}>
            {mode === 'daily' ? `Today's score: ${score} / 1050` : `Score: ${score} pts`}
          </div>
          <div style={{ fontSize: 15, color: 'var(--color-subtle)', marginBottom: 12 }}>
            {correct}/{total} correct · {accuracy}% accuracy
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-base)' }}>
            🔥 {streak} day streak {mode === 'daily' ? '— keep it up!' : ''}
          </div>
        </div>

        {/* Decisions breakdown */}
        <div style={{ background: 'var(--color-surface-0)', borderRadius: 16, padding: 'var(--spacing-100)', boxShadow: 'var(--box-shadow-card)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-subtle)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Results
          </div>
          {decisions.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8,
              borderBottom: i < decisions.length - 1 ? '1px solid var(--color-surface-2)' : 'none',
              marginBottom: i < decisions.length - 1 ? 8 : 0,
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>
                {d.correct ? '✓' : '✗'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-base)', flex: 1, lineHeight: 1.3 }}>{d.cardTitle}</span>
              <span style={{ fontSize: 12, color: d.correct ? 'var(--color-success)' : 'var(--color-destructive)', fontWeight: 600, flexShrink: 0 }}>
                {d.isRelated ? 'Related' : 'Not Related'}
              </span>
            </div>
          ))}
        </div>

        {/* Traveler path display */}
        {mode === 'traveler' && path.length > 0 && (
          <div style={{ background: 'var(--color-surface-0)', borderRadius: 16, padding: 'var(--spacing-100)', boxShadow: 'var(--box-shadow-card)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-subtle)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Your Path
            </div>
            <div style={{ display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 4 }}>
              {path.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <div style={{
                    background: 'var(--color-surface-1)', borderRadius: 8, padding: '6px 10px',
                    fontSize: 12, fontWeight: 600, color: 'var(--color-base)',
                    border: '1px solid var(--color-surface-2)', maxWidth: 100, textAlign: 'center',
                    lineHeight: 1.3,
                  }}>
                    {p.title}
                  </div>
                  {i < path.length - 1 && <span style={{ color: 'var(--color-subtle)', fontSize: 14 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <button
          onClick={onResults}
          style={{
            width: '100%', height: 48, borderRadius: 'var(--border-radius-pill)',
            background: 'var(--color-progressive)', color: 'var(--color-inverted)',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}
        >
          Explore connections →
        </button>

        <button
          onClick={copyShare}
          style={{
            width: '100%', height: 48, borderRadius: 'var(--border-radius-pill)',
            background: 'none', color: 'var(--color-progressive)',
            border: '1.5px solid var(--color-progressive)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Share result
        </button>

        {mode === 'daily' && (
          <button
            onClick={onSwitchMode}
            style={{ background: 'none', border: 'none', color: 'var(--color-progressive)', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Play Traveler Mode →
          </button>
        )}

        {mode === 'traveler' && (
          <button
            onClick={onReset}
            style={{ background: 'none', border: 'none', color: 'var(--color-progressive)', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Play Again
          </button>
        )}

        {mode === 'daily' && countdown && (
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-subtle)' }}>
            Next Daily in {countdown}
          </div>
        )}
      </div>
    </div>
  );
}
