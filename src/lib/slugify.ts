/**
 * Generate a URL-friendly slug from an article title.
 * For Arabic-only titles (where Latin extraction yields < 5 chars),
 * falls back to "article-{hash}" using the fallbackId.
 */
export function generateSlug(title: string, fallbackId?: string): string {
  // Strip HTML tags if any
  let text = title.replace(/<[^>]*>/g, '');

  // Normalize unicode and extract Latin characters, digits, spaces, hyphens
  text = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase();

  // Keep only alphanumeric (Latin), spaces, and hyphens
  let slug = text
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
    .replace(/-+$/, '');

  // If result is too short (Arabic-only title), use hash fallback
  if (slug.length < 5) {
    const source = fallbackId || title;
    const hash = simpleHash(source);
    slug = `article-${hash}`;
  }

  return slug;
}

/**
 * Simple 8-char hex hash for deterministic fallback slugs.
 */
function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
