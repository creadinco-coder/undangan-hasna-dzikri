# 💍 Undangan Pernikahan Digital & Couple Dashboard

> **The Wedding of Hasna Najwa Sabrina, S.M. & Dzikri Amrulloh, S.H., CDMP., CDA.**  
> Crafted with ❤️ by [creadin.co](https://creadin.co/)

Platform undangan pernikahan digital modern, elegan, dan interaktif yang dilengkapi dengan **Dasbor Pengelola Tamu (Couple Management Portal)**, sinkronisasi cloud real-time via **Supabase**, generator pesan WhatsApp personal, serta konfigurasi siap deploy ke **Vercel** dengan *custom subdomain*.

---

## ✨ Fitur Unggulan

### 1. Halaman Undangan Publik (Guest View)
* **Personalisasi Nama Tamu:** Membaca nama tamu secara dinamis dari query parameter URL (`/?to=Nama+Tamu`).
* **Sampul Amplop Interaktif:** Plakat sampul elegan dengan animasi pembuka undangan dan musik latar otomatis.
* **Kisah Perjalanan Cinta (Milestone):** Rangkuman cerita perjalanan cinta dari awal perkenalan hingga menuju pelaminan.
* **Informasi Rangkaian Acara:**
  * **Akad Nikah:** Sabtu, 14 November 2026 (08:00 – 10:30 WIB)
  * **Resepsi:** Sabtu, 14 November 2026 (11:00 – 15:00 WIB)
  * **Lokasi:** Kediaman Mempelai Wanita (Kp. Toblong RT02/03 Desa Sukamukti, Kec. Majalaya)
  * Integrasi navigasi Google Maps dan tombol simpan ke Google Calendar.
* **Galeri Foto & Video:** Tampilan potret momen bahagia dengan layout masonry responsif.
* **Tanda Kasih / Amplop Digital:** Rekening BCA & SeaBank dengan fitur salin nomor rekening instan 1-klik dan alamat pengiriman kado fisik.
* **Konfirmasi Kehadiran & Doa (RSVP):** Formulir kehadiran (Hadir, Tidak Hadir, Ragu-ragu), alokasi pax, dan ucapan doa yang langsung tersimpan secara live.
* **Floating Audio Player:** Kontrol pemutar musik latar yang tidak mengganggu navigasi tamu.
* **Optimasi Tampilan Mobile:** Dilengkapi pengingat kenyamanan tampilan perangkat smartphone.

---

### 2. Dasbor Pengantin & Buku Tamu Eksklusif (`/dashboard`)
Portal privat khusus pasangan untuk mengelola seluruh aspek kepanitiaan undangan:
* **Gerbang Autentikasi Pengaman:** Dilindungi kata sandi yang dikonfigurasikan via environment variable (`VITE_DASHBOARD_PASSWORD`).
* **Executive KPI Metric Cards:**
  * Total Kontak Tamu Terdata (beserta breakdown kategori).
  * Status Undangan Terkirim vs Belum Dikirim (dengan visual progress bar).
  * Akumulasi Konfirmasi RSVP Masuk.
  * Estimasi Total Porsi / Pax Hadir untuk persiapan katering.
* **Generator Tautan & WhatsApp Cepat:**
  * Input nama tamu, no. WA, alokasi pax, dan catatan meja.
  * Tautan personal unik (`/?to=...`) otomatis tergenerate dengan tombol salin.
  * Tombol kirim langsung membuka WhatsApp dengan draft pesan personal yang sudah terisi rapi.
  * Pratinjau live bubble chat WhatsApp yang mencerminkan format pesan asli.
* **Buku Tamu & Direktori Kontak:**
  * Pencarian cerdas (nama, no. WA, catatan) dan filter status pengiriman.
  * Pengelompokan kategori: *Keluarga, Sahabat, Rekan Kerja, VIP, Lainnya*.
  * Tombol aksi cepat: Kirim WA, Salin Link, Pratinjau Tamu, Toggle Status Kirim, dan Hapus.
* **Impor & Ekspor Massal CSV:**
  * **Unduh Template CSV:** File format resmi (`template_import_tamu.csv`) siap diisi di Excel / Google Sheets.
  * **Impor Tamu CSV:** Unggah daftar tamu massal dengan deteksi otomatis pemisah koma (`,`) maupun titik-koma (`;`), opsi *append* atau *replace*.
  * **Ekspor CSV:** Unduh seluruh kontak buku tamu ke file Excel/CSV kapan saja.
* **Editor Template Pesan WhatsApp:**
  * 3 Preset bawaan: *Formal & Khidmat*, *Kasual & Sahabat*, *Keluarga Besar*.
  * Chip variabel dinamis siap klik: `{nama}`, `{link}`, `{mempelai}`, `{panggilan}`, `{hari_tanggal}`, `{waktu}`, `{lokasi}`.
* **Rekap Konfirmasi RSVP:**
  * Statistik pasti hadir, tidak hadir, dan tentatif.
  * Pencarian doa dan harapan dari para tamu.
  * Ekspor seluruh respon RSVP ke file CSV.
* **Dual-Layer Data Storage:**
  * Sinkronisasi otomatis ke cloud database **Supabase** (jika terkonfigurasi).
  * Fallback otomatis ke **LocalStorage** browser sehingga sistem tetap dapat digunakan 100% tanpa internet.

---

## 🛠️ Tech Stack

* **Frontend Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite 8](https://vite.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Animasi:** [Framer Motion](https://www.framer.com/motion/)
* **Ikonografi:** [Lucide React](https://lucide.dev/)
* **Cloud Database & Realtime:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
* **Deployment & Hosting:** [Vercel](https://vercel.com/) (dengan konfigurasi SPA routing `vercel.json`)

---

## 🚀 Memulai (Local Development)

### 1. Prasyarat
* [Node.js](https://nodejs.org/) versi 18 ke atas
* npm atau yarn / pnpm

### 2. Instalasi Dependensi
```bash
# Clone repository
git clone https://github.com/USERNAME/undangan-pernikahan-digital.git
cd undangan-pernikahan-digital

# Install package
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan sesuaikan nilainya:
```env
# Kata Sandi Akses Dasbor (/dashboard)
VITE_DASHBOARD_PASSWORD="hasnadzikri2026"

# Konfigurasi Supabase (Opsional untuk testing lokal)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3030` untuk melihat undangan, atau `http://localhost:3030/dashboard` untuk membuka dasbor pengantin.

---

## 🗄️ Konfigurasi Database Supabase

Aplikasi ini telah menyediakan skrip database lengkap pada file [`supabase/schema.sql`](./supabase/schema.sql).

### Langkah Setup Supabase:
1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** pada sidebar dashboard Supabase Anda.
3. Buka file `supabase/schema.sql`, salin seluruh kodenya, tempelkan di SQL Editor, lalu klik **Run**.
4. Skrip ini akan secara otomatis:
   * Membuat tabel `rsvp_submissions` dan `guest_directory`.
   * Mengatur index performa query.
   * Mengaktifkan *Row Level Security (RLS)* dengan policy yang aman.
   * Mengaktifkan *Supabase Realtime* untuk live sync instan.
5. Salin **Project URL** dan **anon public key** dari menu **Project Settings** $\rightarrow$ **API** ke environment variables Anda.

---

## 🌐 Panduan Deploy ke Vercel & Custom Subdomain

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "feat: digital wedding invitation ready for deployment"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

### 2. Import Project di Vercel
1. Masuk ke [vercel.com](https://vercel.com) dan klik **Add New...** $\rightarrow$ **Project**.
2. Pilih repository GitHub Anda, lalu klik **Import**.
3. Pada bagian **Environment Variables**, daftarkan:
   * `VITE_DASHBOARD_PASSWORD` = `kata-sandi-anda`
   * `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
   * `VITE_SUPABASE_ANON_KEY` = `kunci-anon-supabase`
4. Klik **Deploy**. File `vercel.json` sudah terkonfigurasi untuk menangani rewrite SPA dan caching aset.

### 3. Menghubungkan Custom Subdomain
1. Di Vercel, masuk ke **Project Settings** $\rightarrow$ **Domains**.
2. Masukkan subdomain Anda (misalnya: `undangan.domainanda.com`), lalu klik **Add**.
3. Di panel kelola DNS domain Anda (Cloudflare, Niagahoster, Rumahweb, Namecheap, dll), tambahkan record:
   * **Type:** `CNAME`
   * **Name / Host:** `undangan` *(sesuai awalan subdomain)*
   * **Value / Target:** `cname.vercel-dns.com`
   * **TTL:** Auto / 3600
4. Tunggu proses propagasi DNS (1–5 menit). Vercel akan otomatis menerbitkan sertifikat SSL HTTPS gratis.

---

## 📂 Struktur Direktori

```text
├── public/                     # Aset statis gambar, audio, bank logo, galeri
│   ├── bank/                   # Logo bank (BCA, SeaBank)
│   ├── gallery/                # Foto galeri prewedding
│   ├── groom_bride/            # Foto mempelai pria & wanita
│   └── audio/                  # File musik latar romantis
├── src/
│   ├── components/             # Komponen UI utama
│   │   ├── CoupleDashboard.tsx # Dasbor manajemen tamu, generator WA & RSVP
│   │   ├── DashboardAuthGate.tsx# Gerbang login sandi dasbor
│   │   ├── InvitationCover.tsx # Sampul amplop buka undangan
│   │   ├── HeroSection.tsx     # Hero banner nama pengantin
│   │   ├── CoupleSection.tsx   # Profil kedua mempelai
│   │   ├── MilestoneSection.tsx# Kisah perjalanan cinta
│   │   ├── EventSection.tsx    # Jadwal Akad & Resepsi
│   │   ├── GallerySection.tsx  # Galeri foto kenangan
│   │   ├── GiftSection.tsx     # Tanda kasih & amplop digital
│   │   ├── RSVPSection.tsx     # Formulir konfirmasi kehadiran & doa
│   │   └── ClosingSection.tsx  # Penutup, doa restu & credit footer
│   ├── data/
│   │   └── invitationData.ts   # Sumber data statis teks, foto, dan jadwal
│   ├── lib/
│   │   └── supabase.ts         # Klien Supabase & service CRUD cloud
│   └── utils/
│       ├── guestManagerUtils.ts# Helper tautan undangan, format WA & parser CSV
│       └── rsvpUtils.ts        # Validasi formulir RSVP & ekspor CSV
├── supabase/
│   └── schema.sql              # Skema SQL Supabase lengkap
├── .env.example                # Template konfigurasi environment variables
├── vercel.json                 # Konfigurasi routing rewrite Vercel
└── README.md                   # Dokumentasi project
```

---

## 📄 Lisensi & Hak Cipta

© 2026 The Wedding of **Hasna & Dzikri**. All Rights Reserved.  
Crafted with passion by [creadin.co](https://creadin.co/).

