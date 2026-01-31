interface ExtractedArticle {
  title: string;
  text: string;
  wordCount: number;
}

export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Articulate/1.0)',
      Accept: 'text/html,application/xhtml+xml,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch article (${response.status})`);
  }

  const html = await response.text();

  // Extract title from <title> or <h1>
  const titleMatch =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ??
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ??
    '';
  const title = decodeHTMLEntities(titleMatch).trim();

  // Try to extract from <article> first, then fall back to <body>
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const contentHtml = articleMatch?.[1] ?? bodyMatch?.[1] ?? html;

  // Strip scripts, styles, nav, header, footer, aside
  const cleaned = contentHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '');

  // Convert block elements to newlines, then strip all tags
  const withBreaks = cleaned
    .replace(/<\/?(p|div|br|h[1-6]|li|blockquote|section)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  // Decode HTML entities and clean up whitespace
  const text = decodeHTMLEntities(withBreaks)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) {
    throw new Error('Could not extract readable text from that URL');
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return { title: title || 'Imported Article', text, wordCount };
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, ' ');
}
