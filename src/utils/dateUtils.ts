/**
 * Date utility functions for parsing, age calculation, and activity window filtering.
 */

/**
 * Attempt to parse a date from various string formats.
 * Returns null if parsing fails.
 */
export function parseDate(value: unknown): Date | null {
  if (value == null || value === '') return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    // Excel serial date number (days since 1900-01-01 with the leap year bug)
    if (value > 25569 && value < 60000) {
      const utcDays = value - 25569;
      const utcValue = utcDays * 86400 * 1000;
      const d = new Date(utcValue);
      return isNaN(d.getTime()) ? null : d;
    }
    // Unix timestamp (seconds)
    if (value > 946684800 && value < 4102444800) {
      return new Date(value * 1000);
    }
    // Unix timestamp (milliseconds)
    if (value > 946684800000) {
      return new Date(value);
    }
    return null;
  }

  if (typeof value !== 'string') return null;

  const str = value.trim();
  if (!str) return null;

  // Try native Date parsing first
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // Try common formats: DD/MM/YYYY, DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (dmyMatch) {
    const [, d1, d2, year, hours, minutes, seconds] = dmyMatch;
    const day = parseInt(d1);
    const month = parseInt(d2);
    // Heuristic: if first number > 12, it's day; otherwise try month-first
    let actualDay: number, actualMonth: number;
    if (day > 12) {
      actualDay = day;
      actualMonth = month;
    } else if (month > 12) {
      actualDay = month;
      actualMonth = day;
    } else {
      // Ambiguous - default to MM/DD/YYYY (US format)
      actualMonth = day;
      actualDay = month;
    }
    const date = new Date(
      parseInt(year),
      actualMonth - 1,
      actualDay,
      hours ? parseInt(hours) : 0,
      minutes ? parseInt(minutes) : 0,
      seconds ? parseInt(seconds) : 0
    );
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Calculate age in hours between a date and now.
 */
export function getAgeInHours(date: Date, now: Date = new Date()): number {
  const diffMs = now.getTime() - date.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Calculate age in days between a date and now.
 */
export function getAgeInDays(date: Date, now: Date = new Date()): number {
  const diffMs = now.getTime() - date.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * Format age as a human-readable string.
 */
export function formatAge(date: Date | null | undefined, now: Date = new Date()): string {
  if (!date) return 'Unknown';
  const hours = getAgeInHours(date, now);
  if (hours < 0) return 'Future date';
  if (hours < 1) return '< 1 hour';
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a date falls within a given window.
 */
export function isWithinWindow(
  date: Date | null | undefined,
  windowStart: Date,
  windowEnd: Date
): boolean {
  if (!date) return false;
  return date >= windowStart && date <= windowEnd;
}

/**
 * Get the date range for a preset activity window.
 */
export function getActivityWindowDates(
  preset: '24h' | '7d' | '30d' | 'custom',
  customStart?: Date,
  customEnd?: Date
): { start: Date; end: Date } {
  const now = new Date();
  switch (preset) {
    case '24h':
      return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now };
    case '7d':
      return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
    case '30d':
      return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
    case 'custom':
      return {
        start: customStart || new Date(now.getTime() - 24 * 60 * 60 * 1000),
        end: customEnd || now,
      };
    default:
      return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now };
  }
}
