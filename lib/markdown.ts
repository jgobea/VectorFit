export type InlineToken = { type: 'bold' | 'italic' | 'text'; text: string };

export type MarkdownBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

const BULLET_RE = /^[-*]\s+/;
const ORDERED_RE = /^\d+\.\s+/;
const HEADING_RE = /^(#{1,3})\s+(.*)$/;
const INLINE_RE = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) tokens.push({ type: 'text', text: text.slice(lastIndex, index) });
    const [, bold, star, underscore] = match;
    tokens.push({ type: bold !== undefined ? 'bold' : 'italic', text: bold ?? star ?? underscore ?? '' });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) tokens.push({ type: 'text', text: text.slice(lastIndex) });

  return tokens;
}

// Minimal block grammar covering what Gemini's fitness-advice replies
// actually use — headings, paragraphs, bullet/numbered lists. Not a full
// CommonMark implementation: no tables, code fences, or nested lists.
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (BULLET_RE.test(line) || ORDERED_RE.test(line)) {
      const ordered = ORDERED_RE.test(line);
      const marker = ordered ? ORDERED_RE : BULLET_RE;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) {
        items.push(lines[i].replace(marker, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !BULLET_RE.test(lines[i]) &&
      !ORDERED_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') });
  }

  return blocks;
}
