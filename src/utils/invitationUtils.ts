/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeddingEventDetails {
  title: string;
  startDate: string; // ISO string or YYYYMMDDTHHmmss
  endDate: string;
  venue: string;
  address: string;
  description?: string;
}

/**
 * Extracts and safely sanitizes the guest name from URL query parameter 'to'.
 * If absent, empty, or whitespace, returns the fallback (default: '').
 */
export function parseGuestName(
  input?: string | URLSearchParams | null,
  fallback = ''
): string {
  if (!input) {
    return fallback;
  }

  let rawValue: string | null = null;

  if (typeof input === 'string') {
    try {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        const url = new URL(input);
        rawValue = url.searchParams.get('to');
      } else if (input.includes('?')) {
        const queryPart = input.slice(input.indexOf('?'));
        const params = new URLSearchParams(queryPart);
        rawValue = params.get('to');
      } else if (input.includes('=')) {
        const params = new URLSearchParams(input.startsWith('?') ? input : `?${input}`);
        rawValue = params.get('to');
      } else {
        rawValue = input;
      }
    } catch {
      rawValue = input;
    }
  } else if (input instanceof URLSearchParams) {
    rawValue = input.get('to');
  }

  if (!rawValue) {
    return fallback;
  }

  // Trim and decode
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return fallback;
  }

  // Strip any HTML tags to prevent XSS injection
  const sanitized = trimmed.replace(/<[^>]*>/g, '').trim();

  return sanitized.length > 0 ? sanitized : fallback;
}

/**
 * Formats bank account number into spaced groups of 4 digits for easy reading.
 */
export function formatBankAccount(accNumber: string): string {
  const digitsOnly = accNumber.replace(/\D/g, '');
  if (!digitsOnly) return accNumber;
  return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Generates a Google Calendar event URL for adding the wedding to calendar.
 */
export function generateGoogleCalendarUrl(event: WeddingEventDetails): string {
  const formatDateForGCal = (isoOrDate: string): string => {
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) {
      return isoOrDate.replace(/[-:]/g, '');
    }
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const start = formatDateForGCal(event.startDate);
  const end = formatDateForGCal(event.endDate);
  const details = encodeURIComponent(
    `${event.description || ''}\n\nLokasi: ${event.venue}\nAlamat: ${event.address}`.trim()
  );
  const location = encodeURIComponent(`${event.venue}, ${event.address}`);
  const text = encodeURIComponent(event.title);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Formats a Date or ISO string into UTC format for RFC 5545 iCalendar (YYYYMMDDTHHmmssZ).
 */
export function formatDateToIcsUtc(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput).replace(/[-:]/g, '');
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes characters for iCalendar (RFC 5545) text fields.
 */
export function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Generates RFC 5545 compliant .ics (iCalendar) file contents for saving events
 * to Google Calendar, Apple Calendar, Outlook, and mobile devices.
 */
export function generateIcsCalendarContent(event: WeddingEventDetails): string {
  const startUtc = formatDateToIcsUtc(event.startDate);
  const endUtc = formatDateToIcsUtc(event.endDate);
  const nowUtc = formatDateToIcsUtc(new Date());
  const uid = `wedding-${startUtc}-${Math.random().toString(36).slice(2, 9)}@hasna-dzikri.wedding`;

  const fullLocation = [event.venue, event.address].filter(Boolean).join(', ');
  const escapedSummary = escapeIcsText(event.title);
  const escapedDescription = escapeIcsText(
    `${event.description || ''}\n\nLokasi: ${event.venue}\nAlamat: ${event.address}`.trim()
  );
  const escapedLocation = escapeIcsText(fullLocation);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hasna & Dzikri Wedding//ID//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapedSummary}`,
    `DESCRIPTION:${escapedDescription}`,
    `LOCATION:${escapedLocation}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Pengingat 1 Hari Sebelum Acara: ${escapedSummary}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Pengingat 2 Jam Sebelum Acara: ${escapedSummary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/**
 * Triggers a browser download of the .ics calendar file.
 */
export function downloadIcsFile(event: WeddingEventDetails, customFilename?: string): boolean {
  try {
    const icsContent = generateIcsCalendarContent(event);
    const defaultFilename = `${event.title.replace(/[\s&/\\?%*:|"<>]+/g, '_')}.ics`;
    const filename = customFilename || defaultFilename;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Generates an optimized Unsplash image URL with tailored width, quality, and webp/auto format.
 */
export function buildOptimizedImageUrl(url: string, width = 800, quality = 80): string {
  if (!url || !url.includes('images.unsplash.com')) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('w', width.toString());
    parsed.searchParams.set('q', quality.toString());
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Formats a date (string, ISO, or Date object) into an elegant long-form Indonesian format
 * (e.g. '28 November 2026' or 'Sabtu, 28 November 2026').
 * Converts any numeric or abbreviated format (like '2026-11-28', '28/11/2026') into
 * full Indonesian month names (Januari, Februari, ..., Desember).
 */
export function formatLongIndonesianDate(
  dateInput: string | Date,
  options?: { includeDayName?: boolean }
): string {
  if (!dateInput) return '';

  const monthsIndonesian = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const daysIndonesian = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  let dateObj: Date | null = null;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // Check if it already has Indonesian month name like "28 November 2026"
    for (const m of monthsIndonesian) {
      if (trimmed.toLowerCase().includes(m.toLowerCase())) {
        if (options?.includeDayName && !daysIndonesian.some(d => trimmed.toLowerCase().startsWith(d.toLowerCase()))) {
          // If day name requested but missing, try to parse
          const parsed = new Date(trimmed);
          if (!isNaN(parsed.getTime())) {
            const dayName = daysIndonesian[parsed.getDay()];
            return `${dayName}, ${trimmed}`;
          }
        }
        return trimmed;
      }
    }

    // Try parsing standard ISO (e.g. 2026-11-28T08:00:00+07:00 or 2026-11-28)
    const isoParsed = new Date(trimmed);
    if (!isNaN(isoParsed.getTime())) {
      dateObj = isoParsed;
    } else {
      // Try parsing formats like DD/MM/YYYY or DD-MM-YYYY
      const parts = trimmed.split(/[/.-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY/MM/DD
          dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else {
          // DD/MM/YYYY
          dateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        }
      }
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return String(dateInput);
  }

  const dayOfMonth = dateObj.getDate();
  const monthName = monthsIndonesian[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const dayName = daysIndonesian[dateObj.getDay()];

  if (options?.includeDayName) {
    return `${dayName}, ${dayOfMonth} ${monthName} ${year}`;
  }

  return `${dayOfMonth} ${monthName} ${year}`;
}

export function parseDateComponents(dateStr: string, dayStr?: string) {
  // If string contains day, month, year like "28 November 2026"
  const tokens = dateStr.trim().split(/\s+/);
  if (tokens.length >= 3) {
    return {
      day: tokens[0],
      month: tokens[1],
      year: tokens[2],
      monthShort: tokens[1].slice(0, 3).toUpperCase(),
      dayOfWeek: dayStr || 'Sabtu',
    };
  }
  return {
    day: '28',
    month: 'November',
    year: '2026',
    monthShort: 'NOV',
    dayOfWeek: dayStr || 'Sabtu',
  };
}

