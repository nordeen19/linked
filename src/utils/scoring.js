export function calculateDailyScore(decisions, startTime) {
  let score = 0;
  let correct = 0;
  for (const d of decisions) {
    if (d.correct) {
      score += d.isRelated ? 100 : 75;
      correct++;
    }
  }
  if (correct === decisions.length) score += 200;
  else if (correct === decisions.length - 1) score += 100;

  const elapsed = (Date.now() - startTime) / 1000;
  const avgPerCard = elapsed / Math.max(decisions.length, 1);
  if (avgPerCard < 2) score += 50;

  return { score, correct, total: decisions.length };
}

export function calculateTravelerScore(decisions, wrongSwipes) {
  const nodes = decisions.filter(d => d.correct && d.isRelated).length;
  let score = nodes * 100;
  score += decisions.filter(d => d.correct && !d.isRelated).length * 10;
  score -= wrongSwipes * 5;
  if (wrongSwipes === 0 && nodes === 5) score += 100;
  return Math.max(0, score);
}
