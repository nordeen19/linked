import { normalizeTitle } from '../hooks/useWikipediaApi';
import { getValidCandidates } from './articleFilter';

export function rankSuggestions(correctCards, allLinksCache, shownTitles, firstParaLinksCache) {
  const shownSet = new Set([...shownTitles].map(normalizeTitle));
  const counts = new Map(); // title → { count, relatedTo, card }

  for (const card of correctCards) {
    const links = allLinksCache[card.title];
    const firstPara = firstParaLinksCache[card.title];
    if (!links) continue;

    const valid = getValidCandidates(links, card.title, firstPara || new Set());
    const sample = valid.slice(0, 20);

    for (const link of sample) {
      const norm = normalizeTitle(link.title);
      if (shownSet.has(norm)) continue;
      if (!counts.has(norm)) {
        counts.set(norm, { count: 0, relatedTo: card.title, title: link.title });
      }
      counts.get(norm).count++;
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
