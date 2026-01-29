import * as FileSystem from 'expo-file-system/legacy';
import { EncodingType } from 'expo-file-system/legacy';
import JSZip from 'jszip';

export interface ParsedFile {
  title: string;
  text: string;
  wordCount: number;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

async function parseTxt(uri: string): Promise<ParsedFile> {
  const content = await FileSystem.readAsStringAsync(uri);
  const text = content.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Try to extract title from first line
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const firstLine = lines[0] || 'Imported Text';
  const title = firstLine.length > 100 ? firstLine.slice(0, 97) + '...' : firstLine;

  return { title, text, wordCount };
}

async function parseEpub(uri: string): Promise<ParsedFile> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });

  const zip = await JSZip.loadAsync(base64, { base64: true });

  // 1. Find OPF path from container.xml
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) {
    throw new Error('Invalid EPUB: missing container.xml');
  }

  const rootfileMatch = containerXml.match(/full-path="([^"]+)"/);
  if (!rootfileMatch) {
    throw new Error('Invalid EPUB: cannot find rootfile path');
  }

  const opfPath = rootfileMatch[1];
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // 2. Read OPF
  const opfContent = await zip.file(opfPath)?.async('text');
  if (!opfContent) {
    throw new Error('Invalid EPUB: missing OPF file');
  }

  // 3. Extract title from Dublin Core metadata
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Imported Book';

  // 4. Build manifest map (id -> href)
  const manifest: Record<string, string> = {};
  const manifestRegex = /<item\s+[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*(?:media-type="([^"]+)")?[^>]*\/?>/gi;
  let match;
  while ((match = manifestRegex.exec(opfContent)) !== null) {
    manifest[match[1]] = match[2];
  }
  // Also match alternate attribute order
  const manifestRegex2 = /<item\s+[^>]*href="([^"]+)"[^>]*id="([^"]+)"[^>]*\/?>/gi;
  while ((match = manifestRegex2.exec(opfContent)) !== null) {
    if (!manifest[match[2]]) {
      manifest[match[2]] = match[1];
    }
  }

  // 5. Get spine reading order
  const spineIds: string[] = [];
  const spineRegex = /<itemref\s+[^>]*idref="([^"]+)"[^>]*\/?>/gi;
  while ((match = spineRegex.exec(opfContent)) !== null) {
    spineIds.push(match[1]);
  }

  // 6. Read chapters in spine order and extract text
  const chapters: string[] = [];
  for (const id of spineIds) {
    const href = manifest[id];
    if (!href) continue;

    const filePath = opfDir + href;
    const file = zip.file(filePath);
    if (!file) continue;

    const html = await file.async('text');
    const text = stripHtml(html);
    if (text.length > 0) {
      chapters.push(text);
    }
  }

  if (chapters.length === 0) {
    throw new Error('No readable content found in EPUB');
  }

  const fullText = chapters.join('\n\n');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return { title, text: fullText, wordCount };
}

export async function parseFile(uri: string, mimeType: string): Promise<ParsedFile> {
  if (mimeType === 'application/epub+zip' || uri.toLowerCase().endsWith('.epub')) {
    return parseEpub(uri);
  }

  // Default: treat as plain text
  return parseTxt(uri);
}
