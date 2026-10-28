/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRsvpForm,
  calculateRsvpStats,
  generateRsvpCsv,
  RsvpSubmission,
} from './rsvpUtils.ts';

describe('rsvpUtils', () => {
  describe('validateRsvpForm', () => {
    it('should invalidate an empty form', () => {
      const res = validateRsvpForm({});
      assert.equal(res.isValid, false);
      assert.ok(res.errors.name);
      assert.ok(res.errors.status);
    });

    it('should validate a valid attending form with meal choice and pax', () => {
      const res = validateRsvpForm({
        name: 'Siti Nurhaliza',
        phone: '081234567890',
        status: 'hadir',
        pax: 2,
        mealPreference: 'western',
        dietaryNotes: 'No peanuts',
        wishes: 'Barakallah!',
      });
      assert.equal(res.isValid, true);
      assert.deepEqual(res.errors, {});
    });

    it('should reject invalid pax for attending status', () => {
      const res = validateRsvpForm({
        name: 'Budi Santoso',
        status: 'hadir',
        pax: 0,
      });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.pax);
    });

    it('should accept non-attending status without pax requirement', () => {
      const res = validateRsvpForm({
        name: 'Agus Wijaya',
        status: 'tidak_hadir',
        pax: 0,
      });
      assert.equal(res.isValid, true);
    });
  });

  describe('calculateRsvpStats', () => {
    it('should accurately calculate attendance and meal percentages', () => {
      const mockSubmissions: RsvpSubmission[] = [
        {
          id: '1',
          name: 'Tamu A',
          phone: '',
          status: 'hadir',
          pax: 2,
          mealPreference: 'nusantara',
          dietaryNotes: '',
          wishes: '',
          createdAt: '',
        },
        {
          id: '2',
          name: 'Tamu B',
          phone: '',
          status: 'hadir',
          pax: 1,
          mealPreference: 'western',
          dietaryNotes: 'Alergi gluten',
          wishes: '',
          createdAt: '',
        },
        {
          id: '3',
          name: 'Tamu C',
          phone: '',
          status: 'hadir',
          pax: 1,
          mealPreference: 'vegetarian',
          dietaryNotes: '',
          wishes: '',
          createdAt: '',
        },
        {
          id: '4',
          name: 'Tamu D',
          phone: '',
          status: 'tidak_hadir',
          pax: 0,
          mealPreference: 'nusantara',
          dietaryNotes: '',
          wishes: '',
          createdAt: '',
        },
      ];

      const stats = calculateRsvpStats(mockSubmissions);
      assert.equal(stats.totalSubmissions, 4);
      assert.equal(stats.hadirSubmissionsCount, 3);
      assert.equal(stats.tidakHadirSubmissionsCount, 1);
      assert.equal(stats.totalAttendingPax, 4); // 2 + 1 + 1
      assert.equal(stats.dietaryAlertCount, 1);

      // Meal totals: 2 nusantara, 1 western, 1 vegetarian -> 4 total
      assert.equal(stats.mealBreakdown.nusantara.count, 2);
      assert.equal(stats.mealBreakdown.nusantara.percentage, 50);
      assert.equal(stats.mealBreakdown.western.count, 1);
      assert.equal(stats.mealBreakdown.western.percentage, 25);
      assert.equal(stats.mealBreakdown.vegetarian.count, 1);
      assert.equal(stats.mealBreakdown.vegetarian.percentage, 25);
    });
  });

  describe('generateRsvpCsv', () => {
    it('should generate properly escaped CSV text with headers', () => {
      const submissions: RsvpSubmission[] = [
        {
          id: '1',
          name: 'Budi "Handsome" Santoso',
          phone: '081234567890',
          status: 'hadir',
          pax: 2,
          mealPreference: 'nusantara',
          dietaryNotes: 'Alergi udang, kepiting',
          wishes: 'Selamat ya!',
          createdAt: '2026-10-26T10:00:00.000Z',
        },
      ];

      const csv = generateRsvpCsv(submissions);
      assert.ok(csv.includes('Nama Tamu'));
      assert.ok(csv.includes('Pilihan Menu Katering'));
      assert.ok(csv.includes('"Budi ""Handsome"" Santoso"'));
      assert.ok(csv.includes('"Alergi udang, kepiting"'));
      assert.ok(csv.includes('"Nusantara Heritage"'));
    });
  });
});
