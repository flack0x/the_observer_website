/**
 * Content processing utilities for normalizing Telegram content
 */

// Common acronyms to preserve in uppercase
const ACRONYMS = new Set([
  'USA', 'UK', 'UN', 'EU', 'NATO', 'CIA', 'FBI', 'NSA', 'MI6', 'MI5',
  'IDF', 'IRGC', 'PMF', 'SDF', 'YPG', 'PKK', 'ISIS', 'ISIL', 'AQAP',
  'UAE', 'KSA', 'GCC', 'OPEC', 'IMF', 'WTO', 'WHO', 'BRICS',
  'PM', 'FM', 'DM', 'VP', 'CEO', 'CFO', 'CTO',
  'GPS', 'EMP', 'AI', 'IT', 'ID', 'TV', 'US', 'IR', 'IL',
  'CENTCOM', 'DOD', 'DOJ', 'DHS', 'ICJ', 'ICC',
  'HAMAS', 'HEZBOLLAH', // Keep as-is for recognition
  'USD', 'EUR', 'GBP', 'CNY', 'RUB',
  'SWIFT', 'JCPOA', 'AUMF', 'NDA',
  'RT', 'BBC', 'CNN', 'AP', 'AFP',
]);

// Words that should stay lowercase (unless at start of sentence)
const LOWERCASE_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'between', 'under', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
]);

/**
 * Check if a string is mostly ALL CAPS (>70% uppercase letters)
 */
function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 10) return false; // Too short to determine

  const uppercase = letters.replace(/[^A-Z]/g, '').length;
  const ratio = uppercase / letters.length;

  return ratio > 0.7;
}

/**
 * Convert a word to proper case, preserving acronyms
 */
function convertWord(word: string, isFirstWord: boolean): string {
  const upperWord = word.toUpperCase();

  // Check if it's an acronym
  if (ACRONYMS.has(upperWord)) {
    return upperWord;
  }

  // Check if word has numbers (like "2." or "1st") - keep as-is
  if (/\d/.test(word)) {
    return word.toLowerCase();
  }

  const lowerWord = word.toLowerCase();

  // Keep lowercase words lowercase (unless first word)
  if (!isFirstWord && LOWERCASE_WORDS.has(lowerWord)) {
    return lowerWord;
  }

  // Title case: first letter uppercase, rest lowercase
  return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
}

/**
 * Convert ALL CAPS text to sentence case
 * - First letter of each sentence uppercase
 * - Rest lowercase except acronyms and proper nouns
 */
export function convertAllCapsToSentenceCase(text: string): string {
  if (!isAllCaps(text)) {
    return text;
  }

  // Split into sentences (by . ! ? or colon followed by space/newline)
  const sentences = text.split(/(?<=[.!?:])\s+/);

  return sentences.map(sentence => {
    // Split into words while preserving punctuation
    const words = sentence.split(/(\s+)/);
    let isFirstContentWord = true;

    return words.map(part => {
      // Preserve whitespace
      if (/^\s+$/.test(part)) {
        return part;
      }

      // Extract word and surrounding punctuation
      const match = part.match(/^([^\w]*)(\w+)([^\w]*)$/);
      if (!match) {
        return part.toLowerCase();
      }

      const [, prefix, word, suffix] = match;
      const converted = convertWord(word, isFirstContentWord);
      isFirstContentWord = false;

      return prefix + converted + suffix;
    }).join('');
  }).join(' ');
}

/**
 * Process a paragraph - converts ALL CAPS and handles bold markers
 */
export function processParagraph(paragraph: string): string {
  // Check if the paragraph (excluding HTML tags) is ALL CAPS
  const plainText = paragraph.replace(/<[^>]+>/g, '');

  if (!isAllCaps(plainText)) {
    return paragraph;
  }

  // Process content while preserving HTML tags
  // Split by HTML tags
  const parts = paragraph.split(/(<[^>]+>)/);

  return parts.map(part => {
    // Don't modify HTML tags
    if (part.startsWith('<')) {
      return part;
    }
    // Convert text content
    return convertAllCapsToSentenceCase(part);
  }).join('');
}

/**
 * Process entire content - line by line conversion
 */
export function normalizeContent(content: string): string {
  // Split by double newlines (paragraphs)
  const paragraphs = content.split(/\n\n+/);

  return paragraphs.map(para => {
    // Check each line within the paragraph
    const lines = para.split('\n');
    return lines.map(line => processParagraph(line)).join('\n');
  }).join('\n\n');
}
