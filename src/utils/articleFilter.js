import { normalizeTitle } from '../hooks/useWikipediaApi';

const NS_PREFIXES = [
  'File:', 'Category:', 'Wikipedia:', 'Template:', 'Help:', 'Portal:',
  'Talk:', 'User:', 'Special:', 'WP:', 'MOS:',
];

function isMainNamespace(title) {
  for (const prefix of NS_PREFIXES) {
    if (title.startsWith(prefix)) return false;
  }
  return true;
}

export function getValidCandidates(allLinks, rootTitle, firstParaLinks) {
  const normalizedRoot = normalizeTitle(rootTitle);
  return allLinks.filter(link => {
    if (!isMainNamespace(link.title)) return false;
    if (link.ns !== undefined && link.ns !== 0) return false;
    const normalized = normalizeTitle(link.title);
    if (firstParaLinks && firstParaLinks.has(normalized)) return false;
    if (normalized === normalizedRoot) return false;
    return true;
  });
}
