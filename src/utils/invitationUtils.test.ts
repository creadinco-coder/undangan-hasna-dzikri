import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGuestName,
  formatBankAccount,
  generateGoogleCalendarUrl,
  buildOptimizedImageUrl,
  formatDateToIcsUtc,
  escapeIcsText,
  generateIcsCalendarContent,
} from './invitationUtils.ts';

test('parseGuestName handles URLSearchParams with valid name', () => {
  const params = new URLSearchParams('?to=Dzikri%20Amrulloh');
  assert.equal(parseGuestName(params), 'Dzikri Amrulloh');
});

test('parseGuestName handles full URL string', () => {
  assert.equal(
    parseGuestName('https://domain.com/invitation?to=Sarah%20%26%20Family'),
    'Sarah & Family'
  );
});

test('parseGuestName falls back to Hasna when to param is absent or empty', () => {
  assert.equal(parseGuestName(''), 'Hasna');
  assert.equal(parseGuestName(null), 'Hasna');
  assert.equal(parseGuestName('?other=123'), 'Hasna');
  assert.equal(parseGuestName('?to='), 'Hasna');
  assert.equal(parseGuestName('?to=%20%20'), 'Hasna');
  assert.equal(parseGuestName(null, 'Custom Name'), 'Custom Name');
});

test('parseGuestName sanitizes HTML tags to prevent XSS injection', () => {
  const malicious = '?to=%3Cscript%3Ealert(1)%3C%2Fscript%3EBudi%20Santoso';
  assert.equal(parseGuestName(malicious), 'alert(1)Budi Santoso');

  const tagged = '?to=<b>Ahmad</b>';
  assert.equal(parseGuestName(tagged), 'Ahmad');
});

test('formatBankAccount groups digits into readable groups of 4', () => {
  assert.equal(formatBankAccount('5270381923'), '5270 3819 23');
  assert.equal(formatBankAccount('123456781234'), '1234 5678 1234');
  assert.equal(formatBankAccount('123'), '123');
});

test('generateGoogleCalendarUrl formats valid Google Calendar URL', () => {
  const event = {
    title: 'Akad Nikah Hasna & Dzikri',
    startDate: '2026-11-20T08:00:00Z',
    endDate: '2026-11-20T10:00:00Z',
    venue: 'Masjid Agung Sunda Kelapa',
    address: 'Menteng, Jakarta Pusat',
    description: 'Pernikahan Hasna & Dzikri'
  };

  const url = generateGoogleCalendarUrl(event);
  assert.ok(url.startsWith('https://calendar.google.com/calendar/render?'));
  assert.ok(url.includes('text=Akad%20Nikah%20Hasna%20%26%20Dzikri'));
  assert.ok(url.includes('Menteng'));
});

test('buildOptimizedImageUrl appends width and quality params for unsplash urls', () => {
  const unsplashUrl = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format';
  const optimized = buildOptimizedImageUrl(unsplashUrl, 600, 75);
  assert.ok(optimized.includes('w=600'));
  assert.ok(optimized.includes('q=75'));
  assert.ok(optimized.includes('fit=crop'));
});

test('buildOptimizedImageUrl returns original url for non-unsplash urls', () => {
  const customUrl = '/assets/images/custom.jpg';
  assert.equal(buildOptimizedImageUrl(customUrl, 600), customUrl);
});

test('formatDateToIcsUtc converts date to proper UTC string', () => {
  const dateStr = '2026-11-28T08:00:00+07:00';
  const utc = formatDateToIcsUtc(dateStr);
  assert.equal(utc, '20261128T010000Z');
});

test('escapeIcsText escapes semicolons, commas, and newlines', () => {
  const raw = 'The Grand Ballroom, Hotel Dharmawangsa;\nJakarta';
  const escaped = escapeIcsText(raw);
  assert.equal(escaped, 'The Grand Ballroom\\, Hotel Dharmawangsa\\;\\nJakarta');
});

test('generateIcsCalendarContent generates valid RFC 5545 iCalendar content', () => {
  const event = {
    title: 'Akad Nikah Hasna & Dzikri',
    startDate: '2026-11-28T08:00:00+07:00',
    endDate: '2026-11-28T10:00:00+07:00',
    venue: 'The Grand Ballroom, Dharmawangsa',
    address: 'Jl. Brawijaya Raya No.26, Jakarta Selatan',
    description: 'Pernikahan Hasna & Dzikri'
  };

  const ics = generateIcsCalendarContent(event);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('VERSION:2.0'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('DTSTART:20261128T010000Z'));
  assert.ok(ics.includes('DTEND:20261128T030000Z'));
  assert.ok(ics.includes('SUMMARY:Akad Nikah Hasna & Dzikri'));
  assert.ok(ics.includes('LOCATION:The Grand Ballroom\\, Dharmawangsa\\, Jl. Brawijaya Raya No.26\\, Jakarta Selatan'));
  assert.ok(ics.includes('BEGIN:VALARM'));
  assert.ok(ics.includes('END:VEVENT'));
  assert.ok(ics.includes('END:VCALENDAR'));
});

