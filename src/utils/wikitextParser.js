export function stripWikitext(text) {
  return text
    .replace(/\[\[(?:[^\]|#]+\|)?([^\]]+)\]\]/g, '$1')  // [[link|text]] → text
    .replace(/\[\[([^\]]+)\]\]/g, '$1')                   // [[link]] → link
    .replace(/\{\{[^}]+\}\}/g, '')                        // templates
    .replace(/<ref[^>]*>.*?<\/ref>/gs, '')                // refs
    .replace(/<[^>]+>/g, '')                              // html tags
    .replace(/'{2,3}/g, '')                               // bold/italic markup
    .replace(/=+[^=]+=+/g, '')                            // headers
    .replace(/\[\s*https?:\/\/[^\s\]]+\s*([^\]]*)\]/g, '$1') // external links
    .replace(/^\s*\|.*$/gm, '')                           // table cells
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export function extractSentencesAroundLink(wikitext, linkedTitle) {
  // Find the [[LinkedTitle]] or [[LinkedTitle|display]] pattern
  const escapedTitle = linkedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkPattern = new RegExp(
    `\\[\\[(?:${escapedTitle})(?:\\|[^\\]]+)?\\]\\]`,
    'i'
  );

  const match = linkPattern.exec(wikitext);
  if (!match) return null;

  // Grab surrounding wikitext (500 chars each side)
  const start = Math.max(0, match.index - 500);
  const end = Math.min(wikitext.length, match.index + match[0].length + 500);
  const excerpt = wikitext.slice(start, end);

  // Strip wikitext and find the display title
  const displayTitle = (/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/i.exec(match[0]) || [, linkedTitle])[1];
  const stripped = stripWikitext(excerpt);

  // Split into sentences and find the one containing the title
  const sentences = stripped.split(/(?<=[.!?])\s+/);
  const idx = sentences.findIndex(s => s.toLowerCase().includes(displayTitle.toLowerCase()));

  if (idx === -1) return stripped.slice(0, 300).trim() + '…';

  // Return the matching sentence plus context
  const contextSentences = sentences.slice(Math.max(0, idx - 1), idx + 2);
  return contextSentences.join(' ');
}
