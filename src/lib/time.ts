// Localized time formatting utilities

export type Locale = 'en' | 'ar';

// Arabic numeral conversion
function toArabicNumerals(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)] || d).join('');
}

// Get relative time string in the specified locale
export function getRelativeTime(date: Date, locale: Locale): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'ar') {
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${toArabicNumerals(diffMins)} دقيقة`;
    if (diffHours < 24) return `منذ ${toArabicNumerals(diffHours)} ساعة`;
    if (diffDays < 7) return `منذ ${toArabicNumerals(diffDays)} يوم`;

    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  }

  // English
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format a date for display
export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format time for display
export function formatTime(date: Date, locale: Locale): string {
  return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
