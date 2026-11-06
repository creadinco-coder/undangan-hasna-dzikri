/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RsvpSubmission } from '../utils/rsvpUtils.ts';
import { InvitedGuest } from '../utils/guestManagerUtils.ts';

const sanitizeEnv = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

const getEnvVar = (name: string): string => {
  let val: unknown = '';
  if (typeof import.meta !== 'undefined' && import.meta?.env) {
    val = (import.meta.env as Record<string, unknown>)[name];
  }
  if (!val && typeof process !== 'undefined' && process?.env) {
    val = process.env[name];
  }
  return sanitizeEnv(val);
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    (supabaseUrl.startsWith('https://') || supabaseUrl.includes('.supabase.co')) &&
    supabaseAnonKey.length > 15
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

export function getSupabaseDiagnosticInfo() {
  return {
    isConfigured: isSupabaseConfigured(),
    urlDefined: Boolean(supabaseUrl),
    urlPreview: supabaseUrl ? supabaseUrl.slice(0, 15) + '...' : 'none',
    keyDefined: Boolean(supabaseAnonKey),
    keyLength: supabaseAnonKey?.length || 0,
  };
}

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

export async function deleteRsvpFromSupabase(rsvpId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('rsvp_submissions').delete().eq('id', rsvpId);

    if (error) {
      console.warn('[Supabase] Gagal menghapus RSVP:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Error delete RSVP:', err);
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

    return data
      .filter((item: any) => !item.id?.startsWith('__'))
      .map((item: any) => ({
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

// ==========================================
// 3. WHATSAPP TEMPLATES & SETTINGS SUPABASE SERVICE
// ==========================================

export interface WaTemplatesBundle {
  formal: string;
  casual: string;
  family: string;
  activePreset: 'formal' | 'casual' | 'family';
}

export async function fetchWaTemplatesFromSupabase(): Promise<WaTemplatesBundle | null> {
  if (!supabase) return null;
  try {
    // 1. Coba ambil bundle dari tabel terdedikasi 'wedding_settings'
    const { data: bundleData, error: bundleError } = await supabase
      .from('wedding_settings')
      .select('value')
      .eq('key', 'wa_templates')
      .maybeSingle();

    if (!bundleError && bundleData?.value) {
      try {
        const parsed = JSON.parse(bundleData.value);
        if (parsed && typeof parsed === 'object') {
          return {
            formal: parsed.formal || parsed.templates?.formal || '',
            casual: parsed.casual || parsed.templates?.casual || '',
            family: parsed.family || parsed.templates?.family || '',
            activePreset: parsed.activePreset || 'formal',
          };
        }
      } catch {}
    }

    // 2. Coba ambil dari 'wedding_settings' key = 'wa_template'
    const { data: singleData, error: singleError } = await supabase
      .from('wedding_settings')
      .select('value')
      .eq('key', 'wa_template')
      .maybeSingle();

    if (!singleError && singleData?.value) {
      const val = singleData.value;
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') {
          return {
            formal: parsed.formal || parsed.templates?.formal || '',
            casual: parsed.casual || parsed.templates?.casual || '',
            family: parsed.family || parsed.templates?.family || '',
            activePreset: parsed.activePreset || 'formal',
          };
        }
      } catch {}
      return {
        formal: val,
        casual: '',
        family: '',
        activePreset: 'formal',
      };
    }

    // 3. Fallback: Cek baris konfigurasi di 'guest_directory'
    const { data: configRow, error: configError } = await supabase
      .from('guest_directory')
      .select('custom_notes')
      .eq('id', '__config_wa_template__')
      .maybeSingle();

    if (!configError && configRow?.custom_notes) {
      const notes = configRow.custom_notes;
      try {
        const parsed = JSON.parse(notes);
        if (parsed && typeof parsed === 'object') {
          return {
            formal: parsed.formal || parsed.templates?.formal || '',
            casual: parsed.casual || parsed.templates?.casual || '',
            family: parsed.family || parsed.templates?.family || '',
            activePreset: parsed.activePreset || 'formal',
          };
        }
      } catch {}

      // Jika teks polos, deteksi jenis presetnya secara cerdas
      if (notes.includes('Warm hugs') || notes.includes('Halo *{nama}*')) {
        return {
          formal: '',
          casual: notes,
          family: '',
          activePreset: 'casual',
        };
      } else if (notes.includes('Keluarga Besar') || notes.includes('sekeluarga')) {
        return {
          formal: '',
          casual: '',
          family: notes,
          activePreset: 'family',
        };
      } else {
        return {
          formal: notes,
          casual: '',
          family: '',
          activePreset: 'formal',
        };
      }
    }

    return null;
  } catch (err) {
    console.warn('[Supabase] Error fetch WA templates:', err);
    return null;
  }
}

export async function saveWaTemplatesToSupabase(bundle: WaTemplatesBundle): Promise<boolean> {
  if (!supabase) return false;
  try {
    const jsonStr = JSON.stringify(bundle);
    const activeText = bundle[bundle.activePreset] || bundle.formal;

    // 1. Simpan ke tabel 'wedding_settings' jika sudah dibuat
    const { error: settingsError } = await supabase.from('wedding_settings').upsert(
      [
        {
          key: 'wa_templates',
          value: jsonStr,
          updated_at: new Date().toISOString(),
        },
        {
          key: 'wa_template',
          value: activeText,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'key' }
    );

    if (!settingsError) {
      return true;
    }

    // 2. Fallback instan: Simpan ke record konfigurasi di 'guest_directory'
    const { error: guestError } = await supabase.from('guest_directory').upsert(
      {
        id: '__config_wa_template__',
        name: '[CONFIG] Template WhatsApp',
        category: 'Lainnya',
        pax_reserved: 1,
        custom_notes: jsonStr,
        status: 'sent',
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (guestError) {
      console.warn('[Supabase] Gagal menyimpan template WA ke database:', guestError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[Supabase] Error save WA templates:', err);
    return false;
  }
}

// Backward-compatibility wrappers
export async function fetchWaTemplateFromSupabase(): Promise<string | null> {
  const bundle = await fetchWaTemplatesFromSupabase();
  if (!bundle) return null;
  return bundle[bundle.activePreset] || bundle.formal || null;
}

export async function saveWaTemplateToSupabase(template: string): Promise<boolean> {
  return saveWaTemplatesToSupabase({
    formal: template,
    casual: template,
    family: template,
    activePreset: 'formal',
  });
}


