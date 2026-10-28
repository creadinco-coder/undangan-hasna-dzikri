-- ============================================================
-- SQL SCHEMA UNTUK UNDANGAN PERNIKAHAN DIGITAL HASNA & DZIKRI
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda
-- ============================================================

-- 1. Tabel Konfirmasi Kehadiran Tamu (RSVP)
create table if not exists public.rsvp_submissions (
  id text primary key,
  name text not null,
  phone text,
  status text not null check (status in ('hadir', 'tidak_hadir', 'ragu')),
  pax integer default 1 check (pax >= 0),
  wishes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Index untuk mempercepat query waktu dan status
create index if not exists idx_rsvp_created_at on public.rsvp_submissions (created_at desc);
create index if not exists idx_rsvp_status on public.rsvp_submissions (status);

-- Aktifkan Row Level Security (RLS)
alter table public.rsvp_submissions enable row level security;

-- Policy RSVP: Izinkan publik untuk melihat ucapan doa dan mengirim RSVP
create policy "Allow public read from rsvp_submissions"
  on public.rsvp_submissions for select
  using (true);

create policy "Allow public insert to rsvp_submissions"
  on public.rsvp_submissions for insert
  with check (true);

create policy "Allow update to rsvp_submissions"
  on public.rsvp_submissions for update
  using (true);

-- 2. Tabel Buku Tamu & Direktori Undangan Pasangan
create table if not exists public.guest_directory (
  id text primary key,
  name text not null,
  phone text,
  category text default 'Sahabat',
  pax_reserved integer default 2 check (pax_reserved >= 1),
  custom_notes text,
  status text default 'pending' check (status in ('pending', 'sent')),
  sent_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Index untuk buku tamu
create index if not exists idx_guest_created_at on public.guest_directory (created_at desc);
create index if not exists idx_guest_category on public.guest_directory (category);
create index if not exists idx_guest_status on public.guest_directory (status);

-- Aktifkan Row Level Security (RLS)
alter table public.guest_directory enable row level security;

-- Policy Guest Directory: Izinkan akses dasbor pengantin
create policy "Allow public select guest_directory"
  on public.guest_directory for select
  using (true);

create policy "Allow public insert guest_directory"
  on public.guest_directory for insert
  with check (true);

create policy "Allow public update guest_directory"
  on public.guest_directory for update
  using (true);

create policy "Allow public delete guest_directory"
  on public.guest_directory for delete
  using (true);

-- 3. Aktifkan Fitur Realtime (agar live sync di RSVP feed & Dasbor berjalan mulus)
begin;
  -- Tambahkan rsvp_submissions dan guest_directory ke realtime publication jika belum ada
  alter publication supabase_realtime add table public.rsvp_submissions;
  alter publication supabase_realtime add table public.guest_directory;
commit;

