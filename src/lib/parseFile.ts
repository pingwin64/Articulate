import { File } from 'expo-file-system';
import JSZip from 'jszip';
import { callEdgeFunction as callEdge } from './api';

interface ParsedFile {
  title: string;
  text: string;
  wordCount: number;
}

export async function parseFile(uri: string, mimeType: string): Promise<ParsedFile> {
  if (mimeType === 'application/pdf') return parsePDF(uri);
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return parseDocx(uri);
  return parsePlainText(uri);
}

async function parsePlainText(uri: string): Promise<ParsedFile> {
  const file = new File(uri);
  const content = await file.text();

  const text = content.trim();

  if (!text) {
    throw new Error('The file appears to be empty');
  }

  // Use the first line as title if it looks like a heading
  const lines = text.split('\n').filter((l) => l.trim());
  const firstLine = lines[0]?.trim() ?? '';
  const title =
    firstLine.length > 0 && firstLine.length <= 120
      ? firstLine
      : 'Imported Text';

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return { title, text, wordCount };
}

async function parsePDF(uri: string): Promise<ParsedFile> {
  const file = new File(uri);
  const base64 = await file.base64();

  if (base64.length > 5 * 1024 * 1024) {
    throw new Error('This PDF is too large (max 5 MB). Try a shorter document.');
  }

  const fileData = `data:application/pdf;base64,${base64}`;

  // Try gpt-4o-mini first, then fall back to gpt-4o
  let response = await callEdgeFunction(fileData, 'gpt-4o-mini');

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage = errorBody?.error ?? '';

    if (errorMessage.toLowerCase().includes('too large')) {
      throw new Error('This PDF is too large for text extraction. Try a shorter document.');
    }
    if (response.status === 429) {
      throw new Error('Rate limited — please wait a moment and try again.');
    }

    // Fallback to gpt-4o
    response = await callEdgeFunction(fileData, 'gpt-4o');

    if (!response.ok) {
      const fallbackError = await response.json().catch(() => null);
      throw new Error(
        fallbackError?.error ?? 'Failed to extract text from PDF. Try converting it to .txt first.'
      );
    }
  }

  const data = await response.json();
  const text = (data.text ?? '').trim();

  if (!text || text.length < 20) {
    throw new Error('Could not extract readable text from this PDF. It may be a scanned image — try a text-based PDF.');
  }

  const lines = text.split('\n').filter((l: string) => l.trim());
  const firstLine = lines[0]?.trim() ?? '';
  const title =
    firstLine.length > 0 && firstLine.length <= 120
      ? firstLine
      : 'Imported PDF';

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return { title, text, wordCount };
}

async function callEdgeFunction(fileData: string, model: string): Promise<Response> {
  return callEdge('parse-pdf', { fileData, model });
}

async function parseDocx(uri: string): Promise<ParsedFile> {
  const file = new File(uri);
  const base64 = await file.base64();

  // DOCX is a ZIP archive. Use JSZip to properly decompress and extract XML.
  const zip = await JSZip.loadAsync(base64, { base64: true });

  const documentXml = zip.file('word/document.xml');
  if (!documentXml) {
    throw new Error('Invalid DOCX file: could not find word/document.xml');
  }

  const xmlContent = await documentXml.async('string');

  // Extract text from <w:t> tags, using </w:p> as paragraph boundaries
  const paragraphs: string[] = [];
  const chunks = xmlContent.split('</w:p>');

  for (const chunk of chunks) {
    const runs: string[] = [];
    const tagRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;

    while ((match = tagRegex.exec(chunk)) !== null) {
      if (match[1]) {
        runs.push(match[1]);
      }
    }

    if (runs.length > 0) {
      paragraphs.push(runs.join(''));
    }
  }

  const text = paragraphs.join('\n\n').trim();

  if (!text || text.length < 20) {
    throw new Error('Could not extract readable text from this DOCX. Try converting it to .txt first.');
  }

  const firstParagraph = paragraphs[0]?.trim() ?? '';
  const title =
    firstParagraph.length > 0 && firstParagraph.length <= 120
      ? firstParagraph
      : 'Imported Document';

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return { title, text, wordCount };
}
