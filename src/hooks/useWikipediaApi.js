const API = 'https://en.wikipedia.org/w/api.php';
const REST = 'https://en.wikipedia.org/api/rest_v1';

const cache = new Map();

async function fetchCached(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export async function getFeaturedArticle(date = new Date()) {
  // Try today, then up to 3 previous days (API can 404 early UTC or on some dates)
  for (let offset = 0; offset <= 3; offset++) {
    const d = new Date(date);
    d.setDate(d.getDate() - offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `tfa-${y}-${m}-${day}`;
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    try {
      const res = await fetch(`${REST}/page/featured/${y}/${m}/${day}`);
      if (!res.ok) continue;
      const data = await res.json();
      const tfa = data.tfa;
      if (!tfa) continue;

      const result = {
        title: tfa.title,
        description: tfa.description || tfa.extract?.split('.')[0] || '',
        extract: tfa.extract || '',
        thumbnail: tfa.thumbnail?.source || null,
      };
      sessionStorage.setItem(key, JSON.stringify(result));
      return result;
    } catch {}
  }
  // Final fallback: use a known good article so the game still works
  const FALLBACK_TITLES = [
    'Albert Einstein', 'World War II', 'Solar System',
    'Ancient Rome', 'Charles Darwin',
  ];
  const fallbackTitle = FALLBACK_TITLES[Math.floor(Math.random() * FALLBACK_TITLES.length)];
  try {
    const summary = await getArticleSummary(fallbackTitle);
    return summary;
  } catch {
    throw new Error('Could not connect to Wikipedia. Check your internet connection.');
  }
}

export async function getArticleSummary(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const data = await fetchCached(`${REST}/page/summary/${encoded}`);
  return {
    title: data.title,
    description: data.description || '',
    extract: data.extract || '',
    thumbnail: data.thumbnail?.source || null,
    url: data.content_urls?.mobile?.page || `https://en.m.wikipedia.org/wiki/${encoded}`,
  };
}

export async function getArticleLinks(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  let links = [];
  let plcontinue = null;

  do {
    const cont = plcontinue ? `&plcontinue=${encodeURIComponent(plcontinue)}` : '';
    const url = `${API}?action=query&titles=${encoded}&prop=links&pllimit=500&plnamespace=0&format=json&origin=*${cont}`;
    const data = await fetchCached(url);
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];
    if (page?.links) links = links.concat(page.links);
    plcontinue = data.continue?.plcontinue || null;
  } while (plcontinue);

  return links.map(l => ({ title: l.title, ns: 0 }));
}

export async function getLeadSectionLinks(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const url = `${API}?action=parse&page=${encoded}&prop=wikitext&section=0&format=json&origin=*`;
  const data = await fetchCached(url);
  const wikitext = data.parse?.wikitext?.['*'] || '';
  const links = new Set();
  const re = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
  let m;
  while ((m = re.exec(wikitext)) !== null) {
    links.add(normalizeTitle(m[1]));
  }
  return links;
}

export async function getArticleSections(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const url = `${API}?action=parse&page=${encoded}&prop=sections&format=json&origin=*`;
  const data = await fetchCached(url);
  return data.parse?.sections || [];
}

export async function getSectionWikitext(title, sectionIndex) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const url = `${API}?action=parse&page=${encoded}&prop=wikitext&section=${sectionIndex}&format=json&origin=*`;
  const data = await fetchCached(url);
  return data.parse?.wikitext?.['*'] || '';
}

export async function getRandomArticles(count = 10) {
  const url = `${API}?action=query&list=random&rnnamespace=0&rnlimit=${count}&format=json&origin=*`;
  const data = await fetch(url).then(r => r.json()); // don't cache random
  return (data.query?.random || []).map(r => ({ title: r.title, ns: 0 }));
}

export async function searchArticles(query, limit = 8) {
  const url = `${API}?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&namespace=0&format=json&origin=*`;
  const data = await fetch(url).then(r => r.json());
  // opensearch returns [query, titles[], descriptions[], urls[]]
  const titles = data[1] || [];
  const descriptions = data[2] || [];
  return titles.map((t, i) => ({ title: t, description: descriptions[i] || '' }));
}

// Find which section of rootTitle contains a link to linkedTitle
export async function findLinkLocation(rootTitle, linkedTitle) {
  try {
    const sections = await getArticleSections(rootTitle);
    const normalizedTarget = normalizeTitle(linkedTitle);
    for (const section of sections) {
      const wikitext = await getSectionWikitext(rootTitle, section.index);
      const re = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
      let m;
      while ((m = re.exec(wikitext)) !== null) {
        if (normalizeTitle(m[1]) === normalizedTarget) {
          return {
            sectionTitle: section.line.replace(/<[^>]+>/g, ''),
            sectionIndex: section.index,
            sectionAnchor: section.anchor,
          };
        }
      }
    }
  } catch {}
  return null;
}

export function normalizeTitle(t) {
  return (t || '').toLowerCase().replace(/_/g, ' ').trim();
}
