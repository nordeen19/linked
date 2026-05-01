import { useState, useCallback } from 'react';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useStreak() {
  const [streakData, setStreakData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wikiGameStreak') || '{"lastPlayed":null,"streak":0}');
    } catch {
      return { lastPlayed: null, streak: 0 };
    }
  });

  const incrementStreak = useCallback(() => {
    setStreakData(prev => {
      const today = todayStr();
      const yesterday = yesterdayStr();
      let newStreak = prev.streak;

      if (prev.lastPlayed === today) {
        // already played today, no change
      } else if (prev.lastPlayed === yesterday) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1;
      }

      const next = { lastPlayed: today, streak: newStreak };
      try { localStorage.setItem('wikiGameStreak', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { streak: streakData.streak, incrementStreak };
}
