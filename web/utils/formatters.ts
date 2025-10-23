/**
 * Consistent formatters to prevent SSR hydration mismatches
 * Always use explicit locales to ensure server and client render identically
 */

// Use explicit locale to prevent hydration mismatches
const DEFAULT_LOCALE = 'en-US';

export const createDateFormatter = (options?: Intl.DateTimeFormatOptions) => {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options);
};

export const createNumberFormatter = (options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat(DEFAULT_LOCALE, options);
};

// Common formatters
export const formatters = {
  dateTime: createDateFormatter({ dateStyle: 'medium', timeStyle: 'short' }),
  date: createDateFormatter({ dateStyle: 'medium' }),
  integer: createNumberFormatter({ maximumFractionDigits: 0 }),
  decimal: createNumberFormatter({ maximumFractionDigits: 2 }),
  percentage: createNumberFormatter({ style: 'percent', maximumFractionDigits: 1 }),
  currency: (currency: string) => createNumberFormatter({ style: 'currency', currency }),
};