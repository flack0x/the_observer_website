// Shared configuration constants

export const TELEGRAM_CHANNELS = {
  en: 'https://t.me/observer_5',
  ar: 'https://t.me/almuraqb',
} as const;

export const CONTACT_EMAIL = 'contact@theobserver.com';

// Helper to get Telegram channel by locale
export function getTelegramChannel(locale: 'en' | 'ar'): string {
  return TELEGRAM_CHANNELS[locale] || TELEGRAM_CHANNELS.en;
}
