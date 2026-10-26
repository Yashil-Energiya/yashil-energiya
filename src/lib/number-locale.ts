// Browsers ship no Intl data for "uz" and format it as en ("1,500.5"), while
// Node formats it the Uzbek way ("1 500,5"); the mismatch breaks hydration
// (React #418). "ru" uses the same separators as Uzbek and exists everywhere.
export const numberLocale = (locale: string) =>
  locale.startsWith("uz") ? "ru" : locale;
