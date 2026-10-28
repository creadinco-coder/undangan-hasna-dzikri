/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AttendanceStatus = 'hadir' | 'tidak_hadir' | 'ragu';
export type MealPreference = 'nusantara' | 'western' | 'vegetarian';

export interface RsvpSubmission {
  id: string;
  name: string;
  phone: string;
  status: AttendanceStatus;
  pax: number;
  mealPreference?: MealPreference;
  dietaryNotes?: string;
  wishes: string;
  createdAt: string;
}

export interface RsvpFormInput {
  name: string;
  phone: string;
  status: AttendanceStatus;
  pax: number;
  mealPreference?: MealPreference;
  dietaryNotes?: string;
  wishes: string;
}

export interface RsvpStats {
  totalSubmissions: number;
  totalAttendingPax: number;
  hadirSubmissionsCount: number;
  tidakHadirSubmissionsCount: number;
  raguSubmissionsCount: number;
  mealBreakdown: {
    nusantara: { count: number; percentage: number };
    western: { count: number; percentage: number };
    vegetarian: { count: number; percentage: number };
  };
  dietaryAlertCount: number;
}

export const MEAL_OPTIONS: { id: MealPreference; label: string; description: string; badge: string }[] = [
  {
    id: 'nusantara',
    label: 'Nusantara Heritage',
    description: 'Rendang Sapi Wagyu Padang, Ayam Betutu Gianyar, Nasi Wangi Daun Jeruk & Sambal Matah',
    badge: 'Signature',
  },
  {
    id: 'western',
    label: 'Western Fine Dine',
    description: 'Pan-seared Truffle Norwegian Salmon atau Australian Tenderloin Steak & Garlic Mousseline',
    badge: 'Chef Special',
  },
  {
    id: 'vegetarian',
    label: 'Plant-Based & Vegetarian',
    description: 'Wild Mushroom Truffle Risotto, Organic Tofu Medallion & Roasted Seasonal Garden Greens',
    badge: 'Healthy Vegan',
  },
];

/**
 * Validates the RSVP form fields
 */
export function validateRsvpForm(input: Partial<RsvpFormInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length === 0) {
    errors.name = 'Nama lengkap wajib diisi.';
  } else if (input.name.trim().length < 2) {
    errors.name = 'Nama minimal 2 karakter.';
  }

  if (input.phone) {
    const cleanPhone = input.phone.replace(/[\s\-+]/g, '');
    if (cleanPhone.length > 0 && cleanPhone.length < 9) {
      errors.phone = 'Nomor WhatsApp minimal 9 digit.';
    }
  }

  if (!input.status) {
    errors.status = 'Silakan pilih status konfirmasi kehadiran.';
  }

  const pax = Number(input.pax);
  if (input.status === 'hadir') {
    if (!pax || isNaN(pax) || pax < 1) {
      errors.pax = 'Jumlah kehadiran minimal 1 orang.';
    } else if (pax > 10) {
      errors.pax = 'Jumlah kehadiran maksimal 10 orang per konfirmasi.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates aggregated statistics for guest list & catering management
 */
export function calculateRsvpStats(submissions: RsvpSubmission[]): RsvpStats {
  const totalSubmissions = submissions.length;
  let totalAttendingPax = 0;
  let hadirSubmissionsCount = 0;
  let tidakHadirSubmissionsCount = 0;
  let raguSubmissionsCount = 0;
  let dietaryAlertCount = 0;

  let nusantaraCount = 0;
  let westernCount = 0;
  let vegetarianCount = 0;

  for (const item of submissions) {
    if (item.status === 'hadir') {
      const pax = item.pax || 1;
      hadirSubmissionsCount += 1;
      totalAttendingPax += pax;

      // Meal count assigned by pax
      if (item.mealPreference === 'western') {
        westernCount += pax;
      } else if (item.mealPreference === 'vegetarian') {
        vegetarianCount += pax;
      } else {
        nusantaraCount += pax;
      }
    } else if (item.status === 'tidak_hadir') {
      tidakHadirSubmissionsCount += 1;
    } else {
      raguSubmissionsCount += 1;
    }

    if (item.dietaryNotes && item.dietaryNotes.trim().length > 0) {
      dietaryAlertCount += 1;
    }
  }

  const mealTotal = nusantaraCount + westernCount + vegetarianCount;

  return {
    totalSubmissions,
    totalAttendingPax,
    hadirSubmissionsCount,
    tidakHadirSubmissionsCount,
    raguSubmissionsCount,
    mealBreakdown: {
      nusantara: {
        count: nusantaraCount,
        percentage: mealTotal > 0 ? Math.round((nusantaraCount / mealTotal) * 100) : 0,
      },
      western: {
        count: westernCount,
        percentage: mealTotal > 0 ? Math.round((westernCount / mealTotal) * 100) : 0,
      },
      vegetarian: {
        count: vegetarianCount,
        percentage: mealTotal > 0 ? Math.round((vegetarianCount / mealTotal) * 100) : 0,
      },
    },
    dietaryAlertCount,
  };
}

/**
 * Exports submissions to CSV string for caterer and wedding planner
 */
export function generateRsvpCsv(submissions: RsvpSubmission[]): string {
  const headers = [
    'Nama Tamu',
    'WhatsApp',
    'Status Kehadiran',
    'Jumlah Tamu (Pax)',
    'Pesan & Doa',
    'Waktu Konfirmasi',
  ];

  const escapeCsv = (val: string | number) => {
    const stringVal = String(val ?? '').replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const statusLabelMap: Record<AttendanceStatus, string> = {
    hadir: 'Hadir',
    tidak_hadir: 'Tidak Hadir',
    ragu: 'Ragu-ragu / Tentative',
  };

  const rows = submissions.map((sub) => [
    escapeCsv(sub.name),
    escapeCsv(sub.phone || '-'),
    escapeCsv(statusLabelMap[sub.status] || sub.status),
    escapeCsv(sub.status === 'hadir' ? sub.pax : 0),
    escapeCsv(sub.wishes || '-'),
    escapeCsv(sub.createdAt ? new Date(sub.createdAt).toLocaleString('id-ID') : '-'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Initial sample guest list for realistic couple management demo
 */
export function getInitialSeedRsvps(): RsvpSubmission[] {
  return [
    {
      id: 'rsvp-seed-1',
      name: 'Dimas Prasetyo, S.T. & Keluarga',
      phone: '081234567890',
      status: 'hadir',
      pax: 2,
      mealPreference: 'nusantara',
      dietaryNotes: 'Tidak ada',
      wishes: 'Selamat menempuh hidup baru Hasna & Dzikri! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'rsvp-seed-2',
      name: 'dr. Amanda Clarissa',
      phone: '085712349988',
      status: 'hadir',
      pax: 1,
      mealPreference: 'western',
      dietaryNotes: 'Alergi crustacean (udang/kepiting)',
      wishes: 'Happy wedding dear Hasna & Mas Dzikri! Sangat bahagia melihat kalian berdua bersanding di hari bahagia ini!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'rsvp-seed-3',
      name: 'Bima Satria & Partner',
      phone: '081399887766',
      status: 'hadir',
      pax: 2,
      mealPreference: 'vegetarian',
      dietaryNotes: 'Vegetarian murni (no meat/seafood)',
      wishes: 'Lancar sampai hari H Hasna & Dzikri, bahagia selalu selamanya.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: 'rsvp-seed-4',
      name: 'H. Suryadi & Hj. Nuraini',
      phone: '081122334455',
      status: 'tidak_hadir',
      pax: 0,
      mealPreference: 'nusantara',
      dietaryNotes: '',
      wishes: 'Mohon maaf belum bisa hadir secara langsung karena bertepatan dengan dinas ke luar kota. Doa terbaik kami untuk kedua mempelai.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'rsvp-seed-5',
      name: 'Fitria Indah Kusumawardhani',
      phone: '087812993344',
      status: 'ragu',
      pax: 1,
      mealPreference: 'nusantara',
      dietaryNotes: '',
      wishes: 'Insya Allah diusahakan hadir ya Hasna sayang. Selamat berbahagia!',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ];
}
