import * as FileSystem from 'expo-file-system';

interface ParsedFile {
  title: string;
  text: string;
  wordCount: number;
}

export async function parseFile(uri: string, mimeType: string): Promise<ParsedFile> {
  if (mimeType === 'application/epub+zip') {
    return parseEpub(uri);
  }

  // Default: treat as plain text (.txt or unknown)
  return parsePlainText(uri);
}

async function parsePlainText(uri: string): Promise<ParsedFile> {
  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

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

async function parseEpub(uri: string): Promise<ParsedFile> {
  // EPUB is a zip archive containing XHTML files.
  // For a lightweight approach, read as base64 and extract text content.
  // Full EPUB parsing would require a dedicated library — this extracts
  // readable text from the raw content as a best-effort approach.

  try {
    const content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode base64 to find text content within the EPUB
    const decoded = atob(content);

    // Extract text between XML/HTML tags from the raw EPUB content
    // Find all text content that appears between > and < (tag content)
    const textParts: string[] = [];
    const tagContentRegex = />([^<]{20,})</g;
    let match;

    while ((match = tagContentRegex.exec(decoded)) !== null) {
      const segment = match[1].trim();
      // Filter out non-readable content (CSS, scripts, metadata XML)
      if (
        segment &&
        !segment.includes('{') &&
        !segment.includes('function') &&
        !segment.includes('xmlns') &&
        !segment.includes('<?') &&
        !segment.startsWith('http')
      ) {
        textParts.push(segment);
      }
    }

    const text = textParts.join('\n\n').trim();

    if (!text || text.length < 50) {
      throw new Error(
        'Could not extract readable text from this EPUB. Try converting it to .txt first.'
      );
    }

    // Try to find a title from early content
    const title =
      textParts[0] && textParts[0].length <= 120
        ? textParts[0]
        : 'Imported Book';

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return { title, text, wordCount };
  } catch (error: any) {
    if (error.message?.includes('Could not extract')) {
      throw error;
    }
    throw new Error(
      'Failed to read EPUB file. Try converting it to .txt first.'
    );
  }
}
