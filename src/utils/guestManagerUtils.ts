/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InvitedGuest {
  id: string;
  name: string;
  phone: string;
  category: 'Keluarga' | 'Sahabat' | 'Rekan Kerja' | 'VIP' | 'Lainnya';
  paxReserved: number;
  customNotes?: string;
  status: 'pending' | 'sent';
  sentAt?: string;
  createdAt: string;
}

export interface WaTemplateVariables {
  nama: string;
  link: string;
  mempelai: string;
  panggilan: string;
  hari_tanggal: string;
  waktu: string;
  lokasi: string;
}

export const WEDDING_DETAILS_STATIC = {
  mempelai: 'Hasna Najwa Sabrina, S.M. & Dzikri Amrulloh, S.H., CDMP., CDA.',
  panggilan: 'Hasna & Dzikri',
  hari_tanggal: 'Sabtu, 14 November 2026',
  waktu: 'Akad: 08:00 - 10:30 WIB | Resepsi: 11:00 - 15:00 WIB',
  lokasi: 'Kediaman Mempelai Wanita (Kp. Toblong RT02/03 Desa Sukamukti, Kecamatan Majalaya)',
};

export const DEFAULT_WA_TEMPLATES = {
  formal: `Kepada Yth. Bapak/Ibu/Saudara/i
*{nama}*

Assalamu’alaikum Warahmatullahi Wabarakatuh,

Dengan penuh rasa syukur dan memohon ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan kami:

*{mempelai}*

🗓 *Hari/Tanggal:* {hari_tanggal}
⏰ *Waktu:* {waktu}
📍 *Lokasi:* {lokasi}

Detail acara, galeri, peta lokasi, dan konfirmasi kehadiran dapat diakses melalui tautan undangan digital pribadi Anda berikut:
{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.

Salam hangat kami,
*{panggilan}*`,

  casual: `Halo *{nama}*! 👋

Semoga harimu menyenangkan dan selalu sehat yaa!

Kami punya kabar bahagia yang ingin kami bagikan. Insya Allah kami akan melangsungkan hari bahagia pernikahan:

*{mempelai}*

🗓 {hari_tanggal}
📍 {lokasi}

Untuk melihat detail acara dan konfirmasi kehadiranmu, langsung klik tautan undangan berikut ya:
{link}

Kehadiran dan doa restu darimu sangat berarti buat kami berdua. Sampai jumpa di hari bahagia kami! ✨

Warm hugs,
*{panggilan}*`,

  family: `Assalamu’alaikum Warahmatullahi Wabarakatuh.

Yang kami hormati sekeluarga:
*{nama}*

Dengan tulus hati kami mengharapkan kehadiran serta doa restu Bapak/Ibu/Saudara/i sekalian dalam rangka mengikat janji suci pernikahan putra-putri kami:

*{mempelai}*

🗓 *Hari/Tanggal:* {hari_tanggal}
📍 *Tempat:* {lokasi}

Tautan resmi undangan digital:
{link}

Atas perhatian, kehadiran, dan doa restu yang tulus dari keluarga besar, kami haturkan terima kasih yang sebesar-besarnya.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.
*{panggilan} & Keluarga Besar*`,
};

/**
 * Sanitizes Indonesian or international phone number for WhatsApp wa.me links
 * e.g., '0812-3456-7890' -> '6281234567890'
 */
export function formatPhoneForWhatsapp(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length >= 9) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Formats a clean human-readable phone number for UI display
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('62') && clean.length >= 11) {
    return `+62 ${clean.slice(2, 5)}-${clean.slice(5, 9)}-${clean.slice(9)}`;
  }
  if (clean.startsWith('0') && clean.length >= 10) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
  }
  return phone;
}

/**
 * Generates the full invitation URL for a guest name
 */
export function generateGuestInvitationLink(guestName: string, customBaseUrl?: string): string {
  const origin =
    customBaseUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3030');
  const encodedName = encodeURIComponent(guestName.trim());
  return `${origin}/?to=${encodedName}`;
}

/**
 * Compiles a WhatsApp message template by substituting all query variables
 */
export function compileWaMessage(
  template: string,
  guestName: string,
  customBaseUrl?: string
): string {
  const link = generateGuestInvitationLink(guestName, customBaseUrl);
  return template
    .replace(/{nama}/g, guestName.trim())
    .replace(/{link}/g, link)
    .replace(/{mempelai}/g, WEDDING_DETAILS_STATIC.mempelai)
    .replace(/{panggilan}/g, WEDDING_DETAILS_STATIC.panggilan)
    .replace(/{hari_tanggal}/g, WEDDING_DETAILS_STATIC.hari_tanggal)
    .replace(/{waktu}/g, WEDDING_DETAILS_STATIC.waktu)
    .replace(/{lokasi}/g, WEDDING_DETAILS_STATIC.lokasi);
}

/**
 * Builds the WhatsApp web / mobile intent URL
 */
export function buildWhatsappLink(phone: string, message: string): string {
  const cleanPhone = formatPhoneForWhatsapp(phone);
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Seed guests for initial demonstration of couple dashboard
 */
export function getInitialGuestDirectory(): InvitedGuest[] {
  return [
    {
      id: 'guest-1',
      name: 'Bpk. H. Ahmad Fauzi & Ibu',
      phone: '081234567890',
      category: 'Keluarga',
      paxReserved: 2,
      customNotes: 'Paman dari pihak mempelai pria',
      status: 'sent',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'guest-2',
      name: 'dr. Amanda Clarissa',
      phone: '085712349988',
      category: 'Sahabat',
      paxReserved: 1,
      customNotes: 'Sahabat SMA Hasna',
      status: 'sent',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'guest-3',
      name: 'Dimas Prasetyo, S.T. & Rekan',
      phone: '081399887766',
      category: 'Rekan Kerja',
      paxReserved: 2,
      customNotes: 'Senior engineer tim Dzikri',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'guest-4',
      name: 'Bpk. Ir. Bambang Hermanto & Keluarga',
      phone: '081122334455',
      category: 'VIP',
      paxReserved: 4,
      customNotes: 'Kolega orang tua mempelai wanita',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: 'guest-5',
      name: 'Nabila Syahrani & Partner',
      phone: '087812993344',
      category: 'Sahabat',
      paxReserved: 2,
      customNotes: 'Teman satu komunitas',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];
}

/**
 * Generates CSV string of all invited guests in the directory
 */
export function generateGuestDirectoryCsv(guests: InvitedGuest[]): string {
  const headers = ['Nama Tamu', 'Nomor WhatsApp', 'Kategori', 'Alokasi Pax', 'Status Pengiriman', 'Waktu Kirim', 'Catatan'];
  const rows = guests.map((g) => [
    `"${g.name.replace(/"/g, '""')}"`,
    `"${g.phone ? formatPhoneDisplay(g.phone) : '-'}"`,
    `"${g.category}"`,
    g.paxReserved || 1,
    `"${g.status === 'sent' ? 'Sudah Dikirim' : 'Belum Dikirim'}"`,
    `"${g.sentAt ? new Date(g.sentAt).toLocaleString('id-ID') : '-'}"`,
    `"${(g.customNotes || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generates an empty sample template CSV for importing guests
 */
export function generateGuestImportTemplateCsv(): string {
  const headers = ['Nama Tamu', 'Nomor WhatsApp', 'Kategori', 'Alokasi Pax', 'Catatan'];
  const sampleRows = [
    ['Bpk. H. Ahmad Fauzi & Ibu', '081234567890', 'Keluarga', '2', 'Paman dari mempelai pria'],
    ['dr. Amanda Clarissa', '085712349988', 'Sahabat', '1', 'Teman SMA Hasna'],
    ['Dimas Prasetyo, S.T. & Rekan', '081399887766', 'Rekan Kerja', '2', 'Senior engineer tim Dzikri'],
    ['Bpk. Ir. Bambang Hermanto & Keluarga', '081122334455', 'VIP', '4', 'Meja VIP Utama'],
    ['Nabila Syahrani & Partner', '087812993344', 'Sahabat', '2', 'Teman satu komunitas'],
  ];

  const lines = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ];
  return lines.join('\n');
}

/**
 * Helper to split a single CSV line with quote awareness and custom delimiter
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses raw CSV text into InvitedGuest objects with error validation
 */
export function parseGuestsFromCsv(csvText: string): { guests: InvitedGuest[]; errors: string[] } {
  const errors: string[] = [];
  const guests: InvitedGuest[] = [];

  const rawLines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (rawLines.length === 0) {
    return { guests: [], errors: ['File CSV kosong atau tidak memiliki baris data.'] };
  }

  // Detect delimiter (, or ;) from the first line
  const firstLine = rawLines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  // Check if first line is a header
  let startIndex = 0;
  const firstTokens = splitCsvLine(firstLine, delimiter).map((t) => t.toLowerCase().replace(/["']/g, ''));
  const isHeader = firstTokens.some((t) => t.includes('nama') || t.includes('name') || t.includes('tamu'));
  if (isHeader) {
    startIndex = 1;
  }

  for (let i = startIndex; i < rawLines.length; i++) {
    const line = rawLines[i];
    const tokens = splitCsvLine(line, delimiter).map((t) => t.replace(/^["']|["']$/g, '').trim());

    const name = tokens[0] || '';
    if (!name) {
      continue; // Skip lines without guest name
    }

    const phone = tokens[1] || '';
    const rawCat = (tokens[2] || '').toLowerCase();
    let category: InvitedGuest['category'] = 'Sahabat';
    if (rawCat.includes('keluarga') || rawCat.includes('family')) {
      category = 'Keluarga';
    } else if (rawCat.includes('vip')) {
      category = 'VIP';
    } else if (rawCat.includes('rekan') || rawCat.includes('kerja') || rawCat.includes('kantor') || rawCat.includes('colleague')) {
      category = 'Rekan Kerja';
    } else if (rawCat.includes('lain')) {
      category = 'Lainnya';
    }

    const paxVal = parseInt(tokens[3] || '2', 10);
    const paxReserved = isNaN(paxVal) || paxVal < 1 ? 2 : paxVal;
    const customNotes = tokens[4] || '';

    guests.push({
      id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      phone,
      category,
      paxReserved,
      customNotes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  if (guests.length === 0) {
    errors.push('Tidak ditemukan baris data tamu yang valid dalam file CSV. Pastikan kolom pertama berisi nama tamu.');
  }

  return { guests, errors };
}


