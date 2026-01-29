import { parse, HTMLElement } from 'node-html-parser';

export interface ExtractedArticle {
  title: string;
  text: string;
  wordCount: number;
}

const REMOVE_TAGS = ['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe', 'noscript', 'svg', 'form'];

function cleanText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

function extractTextFromElement(el: HTMLElement): string {
  // Remove unwanted elements first
  for (const tag of REMOVE_TAGS) {
    el.querySelectorAll(tag).forEach((node) => node.remove());
  }

  // Get all paragraph text
  const paragraphs = el.querySelectorAll('p');
  if (paragraphs.length > 0) {
    return paragraphs
      .map((p) => p.textContent.trim())
      .filter((t) => t.length > 0)
      .join('\n\n');
  }

  // Fallback: get text content directly
  return el.textContent;
}

function getTitle(root: HTMLElement): string {
  // Try h1 first
  const h1 = root.querySelector('h1');
  if (h1) {
    const text = h1.textContent.trim();
    if (text.length > 0 && text.length < 200) return text;
  }

  // Try og:title meta
  const ogTitle = root.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    const content = ogTitle.getAttribute('content')?.trim();
    if (content) return content;
  }

  // Try <title> tag
  const titleTag = root.querySelector('title');
  if (titleTag) {
    const text = titleTag.textContent.trim();
    if (text.length > 0) return text;
  }

  return 'Imported Article';
}

export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Articulate/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Couldn't reach that URL (${response.status})`);
  }

  const html = await response.text();
  const root = parse(html);
  const title = getTitle(root);

  // Strategy 1: Try <article> tag
  const article = root.querySelector('article');
  if (article) {
    const text = cleanText(extractTextFromElement(article));
    if (text.length > 50) {
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      return { title, text, wordCount };
    }
  }

  // Strategy 2: Try main content area
  const main = root.querySelector('main') || root.querySelector('[role="main"]');
  if (main) {
    const text = cleanText(extractTextFromElement(main));
    if (text.length > 50) {
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      return { title, text, wordCount };
    }
  }

  // Strategy 3: Fallback to all <p> from body
  const body = root.querySelector('body');
  if (body) {
    const text = cleanText(extractTextFromElement(body));
    if (text.length > 50) {
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      return { title, text, wordCount };
    }
  }

  throw new Error('No article text found at that URL');
}
