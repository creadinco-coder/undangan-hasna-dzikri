/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RsvpSubmission } from '../utils/rsvpUtils.ts';
import { InvitedGuest } from '../utils/guestManagerUtils.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ==========================================
// 1. RSVP SUBMISSIONS SUPABASE SERVICE
// ==========================================

export async function fetchRsvpFromSupabase(): Promise<RsvpSubmission[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('rsvp_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Gagal mengambil data RSVP:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      phone: item.phone || '',
      status: item.status,
      pax: Number(item.pax) || 0,
      wishes: item.wishes || '',
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetch RSVP:', err);
    return null;
  }
}

export async function insertRsvpToSupabase(submission: RsvpSubmission): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('rsvp_submissions').insert([
      {
        id: submission.id,
        name: submission.name,
        phone: submission.phone || null,
        status: submission.status,
        pax: submission.pax,
        wishes: submission.wishes || null,
        created_at: submission.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase] Gagal menyimpan RSVP:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error insert RSVP:', err);
    return false;
  }
}

// ==========================================
// 2. GUEST DIRECTORY SUPABASE SERVICE
// ==========================================

export async function fetchGuestsFromSupabase(): Promise<InvitedGuest[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('guest_directory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Gagal mengambil daftar tamu:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      phone: item.phone || '',
      category: item.category || 'Sahabat',
      paxReserved: Number(item.pax_reserved) || 2,
      customNotes: item.custom_notes || '',
      status: item.status || 'pending',
      sentAt: item.sent_at || undefined,
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Supabase] Error fetch daftar tamu:', err);
    return null;
  }
}

export async function upsertGuestToSupabase(guest: InvitedGuest): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('guest_directory').upsert(
      {
        id: guest.id,
        name: guest.name,
        phone: guest.phone || null,
        category: guest.category,
        pax_reserved: guest.paxReserved,
        custom_notes: guest.customNotes || null,
        status: guest.status,
        sent_at: guest.sentAt || null,
        created_at: guest.createdAt,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[Supabase] Gagal upsert tamu:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error upsert tamu:', err);
    return false;
  }
}

export async function bulkInsertGuestsToSupabase(guests: InvitedGuest[]): Promise<boolean> {
  if (!supabase || guests.length === 0) return false;
  try {
    const payload = guests.map((g) => ({
      id: g.id,
      name: g.name,
      phone: g.phone || null,
      category: g.category,
      pax_reserved: g.paxReserved,
      custom_notes: g.customNotes || null,
      status: g.status,
      sent_at: g.sentAt || null,
      created_at: g.createdAt,
    }));

    const { error } = await supabase.from('guest_directory').upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Gagal bulk insert tamu:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error bulk insert tamu:', err);
    return false;
  }
}

export async function deleteGuestFromSupabase(guestId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('guest_directory').delete().eq('id', guestId);

    if (error) {
      console.warn('[Supabase] Gagal menghapus tamu:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error delete tamu:', err);
    return false;
  }
}

