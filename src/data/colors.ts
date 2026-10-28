/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * =========================================================================
 * KONFIGURASI TEMA WARNA UTAMA APLIKASI (SINGLE SOURCE OF TRUTH)
 * =========================================================================
 * Cukup ubah nilai hex warna di file ini, maka seluruh tampilan undangan digital
 * dan dashboard pasangan akan otomatis mengikuti warna yang Anda atur di sini.
 */

export const THEME_COLORS = {
  // 1. Background utama (Ivory)
  background: '#F9F6EE',

  // 2. Primary: Elemen utama, tombol aksi (CTA), dan garis dekoratif (Biru)
  primary: '#7395C0',
  primaryHover: '#5879a3',
  primaryLight: '#8bb0dc',

  // 3. Secondary: Lingkaran, ilustrasi, bidang transparan, dan aksen lembut (Biru Muda)
  secondary: '#AFC9E5',
  secondaryLight: '#d6e4f3',

  // 4. Accent: Kuning pastel untuk menonjolkan visual penting (Angka countdown, rekening, plakat grafir)
  accent: '#F8DDA6',
  accentDark: '#e8c67d',

  // 5. Neutral: Abu-abu muda untuk gradasi border dan elemen pendukung
  neutral: '#DADDE0',
  neutralDark: '#a9afb5',

  // 6. Typography: Navy untuk teks utama dengan kontras tinggi
  typography: '#202A45',

  // 7. Dark Background: Deep navy untuk seksi gelap (Cover, Event, Gift, Closing, Dashboard)
  darkBackground: '#161D30',
  darkCard: '#202A45',

  // 8. Warna Aksi (Action Colors) - Menggantikan warna action gold sebelumnya
  action: {
    // Tombol aksi utama (Primary CTA: Buka Undangan, Add to Calendar, Copy Account, Simpan Tamu)
    primaryBg: '#7395C0',
    primaryHover: '#5879a3',
    primaryText: '#161D30',

    // Tombol aksi sekunder / tombol kartu gelap (Kirim RSVP, Menu Navigasi, Toggle Musik)
    secondaryBg: '#202A45',
    secondaryHover: '#161D30',
    secondaryText: '#F9F6EE',
    secondaryBorder: '#7395C0',

    // Ikon aksi & status interaktif
    actionIcon: '#7395C0',
    actionIconHover: '#AFC9E5',
  },
} as const;

export type ThemeColors = typeof THEME_COLORS;

/**
 * Injeksi CSS variables ke document root secara dinamis.
 * Memungkinkan pengubahan warna runtime secara otomatis tanpa reload halaman.
 */
export function applyThemeColors(colors: typeof THEME_COLORS = THEME_COLORS) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // CSS Custom Properties Utama
  root.style.setProperty('--color-bg-base', colors.background);
  root.style.setProperty('--color-ivory', colors.background);
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-dark', colors.primaryHover);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-light', colors.secondaryLight);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-dark', colors.accentDark);
  root.style.setProperty('--color-neutral', colors.neutral);
  root.style.setProperty('--color-neutral-dark', colors.neutralDark);
  root.style.setProperty('--color-typography', colors.typography);
  root.style.setProperty('--color-navy', colors.typography);
  root.style.setProperty('--color-navy-dark', colors.darkBackground);
  root.style.setProperty('--color-dark-card', colors.darkCard);

  // CSS Custom Properties untuk Aksi (Action Colors)
  root.style.setProperty('--color-action-primary', colors.action.primaryBg);
  root.style.setProperty('--color-action-primary-hover', colors.action.primaryHover);
  root.style.setProperty('--color-action-primary-text', colors.action.primaryText);
  root.style.setProperty('--color-action-secondary', colors.action.secondaryBg);
  root.style.setProperty('--color-action-secondary-text', colors.action.secondaryText);
  root.style.setProperty('--color-action-secondary-border', colors.action.secondaryBorder);
  root.style.setProperty('--color-action-icon', colors.action.actionIcon);
  root.style.setProperty('--color-action-icon-hover', colors.action.actionIconHover);
}
