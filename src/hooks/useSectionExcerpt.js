import { useCallback } from 'react';
import { getSectionWikitext } from './useWikipediaApi';
import { extractSentencesAroundLink } from '../utils/wikitextParser';

export function useSectionExcerpt() {
  const fetchExcerpt = useCallback(async (rootTitle, linkedTitle, linkLocation) => {
    if (!linkLocation) return null;
    try {
      const wikitext = await getSectionWikitext(rootTitle, linkLocation.sectionIndex);
      const excerpt = extractSentencesAroundLink(wikitext, linkedTitle);
      return {
        excerpt,
        highlightedTitle: linkedTitle,
        sectionTitle: linkLocation.sectionTitle,
        sectionAnchor: linkLocation.sectionAnchor || linkLocation.sectionTitle?.replace(/ /g, '_'),
      };
    } catch {
      return null;
    }
  }, []);

  return { fetchExcerpt };
}
