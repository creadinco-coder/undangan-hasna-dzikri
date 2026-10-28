/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Link as LinkIcon,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
  Phone,
  Tag,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  Edit3,
  LogOut,
  X,
  FileSpreadsheet,
  Heart,
  HelpCircle,
  XCircle,
  Eye,
  RefreshCw,
  Upload,
  FileUp,
  FileText,
  AlertCircle,
  Database,
} from 'lucide-react';
import {
  InvitedGuest,
  DEFAULT_WA_TEMPLATES,
  formatPhoneForWhatsapp,
  formatPhoneDisplay,
  generateGuestInvitationLink,
  compileWaMessage,
  buildWhatsappLink,
  getInitialGuestDirectory,
  generateGuestDirectoryCsv,
  generateGuestImportTemplateCsv,
  parseGuestsFromCsv,
  WEDDING_DETAILS_STATIC,
} from '../utils/guestManagerUtils.ts';
import {
  calculateRsvpStats,
  generateRsvpCsv,
  RsvpSubmission,
} from '../utils/rsvpUtils.ts';
import {
  isSupabaseConfigured,
  supabase,
  fetchRsvpFromSupabase,
  fetchGuestsFromSupabase,
  upsertGuestToSupabase,
  bulkInsertGuestsToSupabase,
  deleteGuestFromSupabase,
} from '../lib/supabase.ts';

const GUEST_STORAGE_KEY = 'wedding_guest_directory';
const TEMPLATE_STORAGE_KEY = 'wedding_wa_custom_template';
const RSVP_STORAGE_KEY = 'wedding_rsvp_submissions';

interface CoupleDashboardProps {
  onBackToInvitation: () => void;
  onLogout?: () => void;
}

export function CoupleDashboard({ onBackToInvitation, onLogout }: CoupleDashboardProps) {
  // 1. Guest Directory State
  const [guests, setGuests] = useState<InvitedGuest[]>(() => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getInitialGuestDirectory();
  });

  // 2. WhatsApp Template State
  const [activePreset, setActivePreset] = useState<'formal' | 'casual' | 'family'>('formal');
  const [customTemplate, setCustomTemplate] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (stored) return stored;
    } catch {}
    return DEFAULT_WA_TEMPLATES.formal;
  });

  // 3. New Guest Form State
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formCategory, setFormCategory] = useState<InvitedGuest['category']>('Sahabat');
  const [formPax, setFormPax] = useState<number>(2);
  const [formNotes, setFormNotes] = useState<string>('');

  // 4. Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'generator' | 'guests' | 'template' | 'rsvp'>('generator');

  // RSVP filter state
  const [rsvpSearchQuery, setRsvpSearchQuery] = useState<string>('');
  const [rsvpFilterStatus, setRsvpFilterStatus] = useState<'all' | 'hadir' | 'tidak_hadir' | 'ragu'>('all');

  // 5. UI Feedback State
  const [copiedLinkGuestId, setCopiedLinkGuestId] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // 6. Live RSVP submissions from storage
  const [rsvps, setRsvps] = useState<RsvpSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(RSVP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Supabase Cloud Sync on mount and realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    let isMounted = true;

    // Fetch cloud guests
    fetchGuestsFromSupabase().then((data) => {
      if (isMounted && data && data.length > 0) {
        setGuests(data);
        try {
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }
    });

    // Fetch cloud RSVPs
    fetchRsvpFromSupabase().then((data) => {
      if (isMounted && data && data.length > 0) {
        setRsvps(data);
        try {
          localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }
    });

    // Setup realtime subscription
    const channel = supabase
      .channel('public:couple_dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rsvp_submissions' },
        () => {
          fetchRsvpFromSupabase().then((data) => {
            if (isMounted && data) {
              setRsvps(data);
              try {
                localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(data));
              } catch {}
            }
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guest_directory' },
        () => {
          fetchGuestsFromSupabase().then((data) => {
            if (isMounted && data) {
              setGuests(data);
              try {
                localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
              } catch {}
            }
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase?.removeChannel(channel);
    };
  }, []);

  // 7. CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importParsedGuests, setImportParsedGuests] = useState<InvitedGuest[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  // Persist guests to localStorage
  const saveGuests = (newGuests: InvitedGuest[]) => {
    setGuests(newGuests);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newGuests));
    } catch {}
  };

  // Persist template to localStorage
  const saveTemplate = (newTemplate: string) => {
    setCustomTemplate(newTemplate);
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, newTemplate);
    } catch {}
    triggerNotice('Template pesan WhatsApp berhasil disimpan!');
  };

  const triggerNotice = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 3200);
  };

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const csv = generateGuestImportTemplateCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_tamu.csv';
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Template contoh CSV berhasil diunduh!');
  };

  // File picker handler for CSV import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const { guests: parsed, errors } = parseGuestsFromCsv(text);
        setImportParsedGuests(parsed);
        setImportErrors(errors);
      }
    };
    reader.readAsText(file);
  };

  // Confirm import into directory
  const handleConfirmImport = () => {
    if (importParsedGuests.length === 0) return;

    let updated: InvitedGuest[];
    if (importMode === 'replace') {
      updated = importParsedGuests;
    } else {
      updated = [...importParsedGuests, ...guests];
    }

    saveGuests(updated);
    triggerNotice(`Berhasil mengimpor ${importParsedGuests.length} tamu ke Buku Tamu!`);

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      bulkInsertGuestsToSupabase(importParsedGuests).catch((err) =>
        console.warn('[Supabase Bulk Insert Error]:', err)
      );
    }

    setIsImportModalOpen(false);
    setImportFile(null);
    setImportParsedGuests([]);
    setImportErrors([]);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportParsedGuests([]);
    setImportErrors([]);
  };

  const handleApplyPreset = (presetKey: 'formal' | 'casual' | 'family') => {
    setActivePreset(presetKey);
    saveTemplate(DEFAULT_WA_TEMPLATES[presetKey]);
  };

  // Add a placeholder to template
  const insertVariable = (variable: string) => {
    setCustomTemplate((prev) => `${prev} ${variable}`);
  };

  // Create Guest handler
  const handleAddGuest = (e: React.FormEvent, sendImmediate = false) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newGuest: InvitedGuest = {
      id: `guest-${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      category: formCategory,
      paxReserved: Number(formPax) || 1,
      customNotes: formNotes.trim(),
      status: sendImmediate ? 'sent' : 'pending',
      sentAt: sendImmediate ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [newGuest, ...guests];
    saveGuests(updated);

    // Sync to Supabase
    if (isSupabaseConfigured()) {
      upsertGuestToSupabase(newGuest).catch((err) =>
        console.warn('[Supabase Upsert Guest Error]:', err)
      );
    }

    // Reset form
    setFormName('');
    setFormPhone('');
    setFormNotes('');
    setFormPax(2);

    if (sendImmediate) {
      const message = compileWaMessage(customTemplate, newGuest.name);
      const waUrl = buildWhatsappLink(newGuest.phone, message);
      window.open(waUrl, '_blank');
      triggerNotice(`Tamu ${newGuest.name} tersimpan dan WhatsApp dibuka!`);
    } else {
      triggerNotice(`Tamu ${newGuest.name} berhasil ditambahkan ke direktori!`);
    }
  };

  // Mark sent and open WhatsApp for an existing guest
  const handleSendWhatsapp = (guest: InvitedGuest) => {
    const message = compileWaMessage(customTemplate, guest.name);
    const waUrl = buildWhatsappLink(guest.phone, message);

    // Update status to sent if not already
    const updated = guests.map((g) =>
      g.id === guest.id ? { ...g, status: 'sent' as const, sentAt: g.sentAt || new Date().toISOString() } : g
    );
    saveGuests(updated);

    const target = updated.find((g) => g.id === guest.id);
    if (target && isSupabaseConfigured()) {
      upsertGuestToSupabase(target).catch(console.warn);
    }

    window.open(waUrl, '_blank');
  };

  // Toggle status between pending and sent
  const handleToggleStatus = (guestId: string) => {
    const updated = guests.map((g) => {
      if (g.id === guestId) {
        const nextStatus = g.status === 'sent' ? 'pending' : 'sent';
        return {
          ...g,
          status: nextStatus as 'sent' | 'pending',
          sentAt: nextStatus === 'sent' ? (g.sentAt || new Date().toISOString()) : undefined,
        };
      }
      return g;
    });
    saveGuests(updated);

    const target = updated.find((g) => g.id === guestId);
    if (target && isSupabaseConfigured()) {
      upsertGuestToSupabase(target).catch(console.warn);
    }
  };

  // Copy unique link for a guest
  const handleCopyGuestLink = (guest: InvitedGuest) => {
    const link = generateGuestInvitationLink(guest.name);
    navigator.clipboard.writeText(link);
    setCopiedLinkGuestId(guest.id);
    triggerNotice(`Tautan undangan untuk "${guest.name}" berhasil disalin!`);
    setTimeout(() => setCopiedLinkGuestId(null), 2500);
  };

  // Delete guest
  const handleDeleteGuest = (id: string, name: string) => {
    if (window.confirm(`Hapus tamu "${name}" dari daftar undangan?`)) {
      const updated = guests.filter((g) => g.id !== id);
      saveGuests(updated);
      if (isSupabaseConfigured()) {
        deleteGuestFromSupabase(id).catch(console.warn);
      }
      triggerNotice(`Tamu "${name}" telah dihapus.`);
    }
  };

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        guest.name.toLowerCase().includes(query) ||
        guest.phone.toLowerCase().includes(query) ||
        (guest.customNotes && guest.customNotes.toLowerCase().includes(query));

      const matchesStatus = filterStatus === 'all' || guest.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || guest.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [guests, searchQuery, filterStatus, filterCategory]);

  // Filtered RSVPs
  const filteredRsvps = useMemo(() => {
    return rsvps.filter((rsvp) => {
      const query = rsvpSearchQuery.toLowerCase();
      const matchesSearch =
        rsvp.name.toLowerCase().includes(query) ||
        (rsvp.phone && rsvp.phone.toLowerCase().includes(query)) ||
        (rsvp.wishes && rsvp.wishes.toLowerCase().includes(query));

      const matchesStatus = rsvpFilterStatus === 'all' || rsvp.status === rsvpFilterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [rsvps, rsvpSearchQuery, rsvpFilterStatus]);

  // Calculate statistics
  const totalGuestsCount = guests.length;
  const sentCount = guests.filter((g) => g.status === 'sent').length;
  const pendingCount = totalGuestsCount - sentCount;
  const sentPercentage = totalGuestsCount > 0 ? Math.round((sentCount / totalGuestsCount) * 100) : 0;
  const rsvpStats = calculateRsvpStats(rsvps);

  // Category breakdown for summary
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Keluarga: 0,
      Sahabat: 0,
      'Rekan Kerja': 0,
      VIP: 0,
      Lainnya: 0,
    };
    guests.forEach((g) => {
      if (counts[g.category] !== undefined) counts[g.category]++;
    });
    return counts;
  }, [guests]);

  // Countdown to wedding date: 14 Nov 2026
  const countdownDays = useMemo(() => {
    const weddingDate = new Date('2026-11-14T08:00:00+07:00');
    const now = new Date();
    const diff = weddingDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  // Live preview of compiled message for the active input form
  const previewGuestName = formName.trim() || 'Bpk. Ridwan Kamil & Ibu';
  const previewCompiledMessage = compileWaMessage(customTemplate, previewGuestName);
  const previewGeneratedLink = generateGuestInvitationLink(previewGuestName);

  return (
    <div className="min-h-screen bg-[#141A2B] text-[#DADDE0] font-sans antialiased pb-24 selection:bg-[#AFC9E5] selection:text-[#161D30]">
      {/* Executive Header / App Bar */}
      <header className="sticky top-0 z-40 bg-[#1A233A]/95 backdrop-blur-xl border-b border-[#7395C0]/25 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Monogram & Portal Info */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToInvitation}
              title="Kembali ke Halaman Undangan Publik"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#F9F6EE] hover:text-[#F8DDA6] bg-[#141A2B] hover:bg-[#202C48] border border-[#7395C0]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#7395C0]" />
              <span className="hidden sm:inline">Halaman Undangan</span>
            </button>

            <div className="h-4 w-[1px] bg-[#7395C0]/25 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#202C48] border border-[#7395C0]/40 flex items-center justify-center text-[#F8DDA6] font-serif font-bold text-xs tracking-wider shadow-inner">
                H&amp;D
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-sm sm:text-base font-bold text-[#F9F6EE] tracking-wide leading-tight">
                    Dasbor Pengantin
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#7395C0]/15 text-[#AFC9E5] border border-[#7395C0]/30">
                    Hasna &amp; Dzikri
                  </span>
                </div>
                <p className="text-[10px] text-[#DADDE0]/70 leading-none mt-0.5 hidden sm:block">
                  Sistem Manajemen Undangan Digital &amp; Konfirmasi RSVP
                </p>
              </div>
            </div>
          </div>

          {/* Right: Wedding Date Countdown & Logout */}
          <div className="flex items-center gap-2.5">
            {/* Event Countdown Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141A2B] border border-[#7395C0]/25 text-xs text-[#AFC9E5]">
              <Calendar className="w-3.5 h-3.5 text-[#F8DDA6]" />
              <span>Sabtu, 14 Nov 2026</span>
              <span className="text-[10px] font-semibold text-[#141A2B] bg-[#F8DDA6] px-1.5 py-0.5 rounded-md">
                H-{countdownDays}
              </span>
            </div>

            {/* Supabase Cloud Sync Status Badge */}
            {isSupabaseConfigured() ? (
              <div
                title="Tersinkronisasi otomatis dengan Cloud Database Supabase"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-[11px] text-emerald-300 font-medium shadow-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Supabase Sync</span>
              </div>
            ) : (
              <div
                title="Berjalan dalam mode LocalStorage. Tambahkan VITE_SUPABASE_URL di env untuk cloud sync."
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141A2B] border border-[#7395C0]/25 text-[11px] text-[#AFC9E5]/70"
              >
                <Database className="w-3 h-3 text-[#7395C0]" />
                <span>Local Storage</span>
              </div>
            )}

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-[#DADDE0] hover:text-[#F9F6EE] bg-[#141A2B] hover:bg-[#202C48] border border-[#7395C0]/30 px-3 py-1.5 rounded-xl transition-all shadow-sm"
              title="Buka halaman undangan utama di tab baru"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#7395C0]" />
              <span className="hidden sm:inline">Pratinjau Tamu</span>
            </a>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Kunci dasbor dan keluar dari sesi"
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Kunci Dasbor</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Floating Notification Toast */}
        {saveSuccessNotice && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in bg-[#1A233A] border border-emerald-500/50 text-[#F9F6EE] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs max-w-md">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="flex-1 font-medium">{saveSuccessNotice}</span>
            <button
              onClick={() => setSaveSuccessNotice(null)}
              className="text-[#DADDE0]/60 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Executive Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Tamu Terdata */}
          <div className="bg-[#1A233A] border border-[#7395C0]/25 rounded-2xl p-4 sm:p-5 shadow-lg text-left relative overflow-hidden group">
            <div className="flex items-center justify-between text-[#AFC9E5] mb-2">
              <span className="text-xs font-medium tracking-wide">Tamu Terdata</span>
              <div className="w-8 h-8 rounded-lg bg-[#7395C0]/15 flex items-center justify-center text-[#7395C0]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F9F6EE] tracking-tight">
              {totalGuestsCount}
              <span className="text-xs font-sans font-normal text-[#AFC9E5]/70 ml-1.5">Kontak</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#7395C0]/15 flex items-center justify-between text-[11px] text-[#DADDE0]/70">
              <span>VIP: {categoryCounts.VIP}</span>
              <span>Keluarga: {categoryCounts.Keluarga}</span>
              <span>Sahabat: {categoryCounts.Sahabat}</span>
            </div>
          </div>

          {/* Card 2: Undangan WhatsApp Terkirim */}
          <div className="bg-[#1A233A] border border-emerald-500/25 rounded-2xl p-4 sm:p-5 shadow-lg text-left relative overflow-hidden group">
            <div className="flex items-center justify-between text-emerald-300 mb-2">
              <span className="text-xs font-medium tracking-wide">Sudah Dikirim</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 tracking-tight">
              {sentCount}
              <span className="text-xs font-sans font-normal text-emerald-300/80 ml-2">
                ({sentPercentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#141A2B] rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${sentPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-[#DADDE0]/70 mt-1.5">
              {pendingCount} kontak menunggu broadcast WA
            </p>
          </div>

          {/* Card 3: Konfirmasi Hadir RSVP */}
          <div className="bg-[#1A233A] border border-[#F8DDA6]/25 rounded-2xl p-4 sm:p-5 shadow-lg text-left relative overflow-hidden group">
            <div className="flex items-center justify-between text-[#F8DDA6] mb-2">
              <span className="text-xs font-medium tracking-wide">Konfirmasi Hadir</span>
              <div className="w-8 h-8 rounded-lg bg-[#F8DDA6]/15 flex items-center justify-center text-[#F8DDA6]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F8DDA6] tracking-tight">
              {rsvpStats.hadirSubmissionsCount}
              <span className="text-xs font-sans font-normal text-[#AFC9E5]/70 ml-1.5">Tamu</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#7395C0]/15 flex items-center justify-between text-[11px] text-[#DADDE0]/70">
              <span className="text-rose-300">Tidak: {rsvpStats.tidakHadirSubmissionsCount}</span>
              <span className="text-amber-300">Ragu: {rsvpStats.raguSubmissionsCount}</span>
              <span className="text-[#AFC9E5]">Total: {rsvps.length} RSVP</span>
            </div>
          </div>

          {/* Card 4: Total Estimasi Porsi Pax */}
          <div className="bg-[#1A233A] border border-[#7395C0]/25 rounded-2xl p-4 sm:p-5 shadow-lg text-left relative overflow-hidden group">
            <div className="flex items-center justify-between text-[#AFC9E5] mb-2">
              <span className="text-xs font-medium tracking-wide">Estimasi Porsi / Pax</span>
              <div className="w-8 h-8 rounded-lg bg-[#7395C0]/15 flex items-center justify-center text-[#AFC9E5]">
                <Sparkles className="w-4 h-4 text-[#F8DDA6]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F9F6EE] tracking-tight">
              {rsvpStats.totalAttendingPax}
              <span className="text-xs font-sans font-normal text-[#F8DDA6] ml-1.5">Pax Katering</span>
            </div>
            <p className="text-[10px] text-[#DADDE0]/70 mt-2.5 pt-2 border-t border-[#7395C0]/15">
              Akad &amp; Resepsi di Kp. Toblong, Majalaya
            </p>
          </div>
        </div>

        {/* Segmented Control Navigation Tabs */}
        <div className="bg-[#1A233A] p-1.5 rounded-2xl border border-[#7395C0]/25 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-md">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-[#7395C0] text-[#141A2B] shadow-md font-bold'
                : 'text-[#DADDE0] hover:bg-[#202C48] hover:text-[#F9F6EE]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generator Link &amp; Kirim WA</span>
          </button>

          <button
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guests'
                ? 'bg-[#7395C0] text-[#141A2B] shadow-md font-bold'
                : 'text-[#DADDE0] hover:bg-[#202C48] hover:text-[#F9F6EE]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Buku Tamu Undangan ({guests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'template'
                ? 'bg-[#7395C0] text-[#141A2B] shadow-md font-bold'
                : 'text-[#DADDE0] hover:bg-[#202C48] hover:text-[#F9F6EE]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor Format WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('rsvp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rsvp'
                ? 'bg-[#7395C0] text-[#141A2B] shadow-md font-bold'
                : 'text-[#DADDE0] hover:bg-[#202C48] hover:text-[#F9F6EE]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rekap Konfirmasi RSVP ({rsvps.length})</span>
          </button>
        </div>

        {/* TAB 1: GENERATOR LINK & KIRIM CEPAT */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-7 bg-[#1A233A] border border-[#7395C0]/25 rounded-3xl p-5 sm:p-7 shadow-xl text-left space-y-5">
              <div className="border-b border-[#7395C0]/15 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#F8DDA6]" />
                  <h2 className="font-serif text-lg font-bold text-[#F9F6EE]">
                    Pendataan Tamu &amp; Buat Tautan Personal
                  </h2>
                </div>
                <p className="text-xs text-[#DADDE0]/75 leading-relaxed">
                  Masukkan nama tamu dan nomor WhatsApp. Sistem akan membuat tautan undangan berparameter khusus
                  secara otomatis dan menyiapkan pesan siap kirim.
                </p>
              </div>

              <form onSubmit={(e) => handleAddGuest(e, false)} className="space-y-4">
                {/* Nama Lengkap Tamu */}
                <div>
                  <label htmlFor="input-guest-name" className="block text-xs font-semibold text-[#DADDE0] mb-1.5">
                    Nama Lengkap Tamu / Pasangan / Keluarga <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-guest-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Bpk. H. Ridwan Kamil &amp; Ibu / Amanda Clarissa, S.Ked."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141A2B] border border-[#7395C0]/30 text-[#F9F6EE] placeholder:text-[#DADDE0]/40 focus:outline-none focus:border-[#7395C0] focus:ring-1 focus:ring-[#7395C0] transition-all"
                  />
                </div>

                {/* Nomor WhatsApp & Alokasi Pax */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label htmlFor="input-guest-phone" className="block text-xs font-semibold text-[#DADDE0] mb-1.5">
                      Nomor WhatsApp <span className="text-[#DADDE0]/60 font-normal text-[10px]">(Opsional, untuk kirim pesan langsung)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7395C0]" />
                      <input
                        id="input-guest-phone"
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#141A2B] border border-[#7395C0]/30 text-[#F9F6EE] placeholder:text-[#DADDE0]/40 focus:outline-none focus:border-[#7395C0] focus:ring-1 focus:ring-[#7395C0] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-guest-pax" className="block text-xs font-semibold text-[#DADDE0] mb-1.5">
                      Alokasi Pax
                    </label>
                    <input
                      id="input-guest-pax"
                      type="number"
                      min="1"
                      max="10"
                      value={formPax}
                      onChange={(e) => setFormPax(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141A2B] border border-[#7395C0]/30 text-[#F9F6EE] focus:outline-none focus:border-[#7395C0] transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Kelompok Kategori Pilihan Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#DADDE0]">
                      Kelompok / Kategori Tamu
                    </label>
                    <span className="text-[10px] text-[#AFC9E5]/70">Pilih salah satu</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(['Sahabat', 'Keluarga', 'Rekan Kerja', 'VIP', 'Lainnya'] as const).map((cat) => {
                      const isSelected = formCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormCategory(cat)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer border text-center ${
                            isSelected
                              ? cat === 'VIP'
                                ? 'bg-[#F8DDA6]/20 border-[#F8DDA6] text-[#F8DDA6] font-bold shadow-sm'
                                : cat === 'Keluarga'
                                ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold shadow-sm'
                                : cat === 'Sahabat'
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold shadow-sm'
                                : 'bg-[#7395C0]/30 border-[#7395C0] text-[#F9F6EE] font-bold shadow-sm'
                              : 'bg-[#141A2B] border-[#7395C0]/25 text-[#DADDE0]/70 hover:border-[#7395C0]/50 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Catatan Internal */}
                <div>
                  <label htmlFor="input-guest-notes" className="block text-xs font-semibold text-[#DADDE0] mb-1.5">
                    Catatan Internal <span className="text-[#DADDE0]/60 font-normal text-[10px]">(Opsional: nomor meja atau hubungan)</span>
                  </label>
                  <input
                    id="input-guest-notes"
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contoh: Teman kuliah Hasna / Rekan kerja Dzikri / Meja VIP 1"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#141A2B] border border-[#7395C0]/30 text-[#F9F6EE] placeholder:text-[#DADDE0]/40 focus:outline-none focus:border-[#7395C0] transition-all"
                  />
                </div>

                {/* Generated Invitation Link Card */}
                <div className="bg-[#141A2B] rounded-2xl p-4 border border-[#7395C0]/25 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#F8DDA6]">
                    <span className="font-semibold flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-[#7395C0]" /> Tautan Personal Undangan:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(previewGeneratedLink);
                        triggerNotice('Tautan undangan berhasil disalin!');
                      }}
                      className="text-xs text-[#AFC9E5] hover:text-[#F8DDA6] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </button>
                  </div>
                  <div className="text-xs font-mono text-[#AFC9E5] bg-[#0E1320] px-3.5 py-2.5 rounded-xl break-all select-all border border-[#7395C0]/20 flex items-center justify-between gap-2">
                    <span className="truncate">{previewGeneratedLink}</span>
                    <a
                      href={previewGeneratedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#DADDE0]/60 hover:text-white shrink-0 p-1"
                      title="Buka link ini"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleAddGuest(e, true)}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>Simpan &amp; Buka WhatsApp Langsung</span>
                  </button>

                  <button
                    type="submit"
                    className="py-3 px-5 rounded-xl bg-[#202C48] hover:bg-[#28375a] text-[#F9F6EE] border border-[#7395C0]/35 text-xs font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#7395C0]" />
                    <span>Simpan ke Daftar</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live WhatsApp Bubble Preview Column */}
            <div className="lg:col-span-5 bg-[#1A233A] border border-[#7395C0]/25 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#7395C0]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="font-serif text-base font-bold text-[#F9F6EE]">
                      Pratinjau Pesan WhatsApp
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#F8DDA6] bg-[#7395C0]/15 px-2.5 py-0.5 rounded-full border border-[#7395C0]/30 font-medium">
                    Gaya: {activePreset === 'formal' ? 'Formal' : activePreset === 'casual' ? 'Santai' : 'Keluarga'}
                  </span>
                </div>

                <p className="text-[11px] text-[#DADDE0]/75 mb-3">
                  Pesan yang otomatis terisi ketika Anda mengklik tombol "Kirim WhatsApp":
                </p>

                {/* Realistic WhatsApp Chat Bubble Container */}
                <div className="bg-[#0b141a] p-4 rounded-2xl border border-stone-800 text-left font-sans shadow-inner">
                  <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-xs p-4 text-xs whitespace-pre-wrap leading-relaxed shadow-md border border-[#005c4b]/50 select-text">
                    {previewCompiledMessage}
                  </div>
                  <div className="text-right text-[10px] text-stone-400 mt-2 pr-1 font-mono flex items-center justify-end gap-1">
                    <span>11:42</span>
                    <span className="text-sky-400 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#7395C0]/15 flex items-center justify-between text-xs">
                <span className="text-[#DADDE0]/70 text-[11px]">Ingin merubah kata-kata?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('template')}
                  className="text-[#AFC9E5] hover:text-[#F8DDA6] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#7395C0]" />
                  <span>Kustomisasi Template</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUKU TAMU / DIREKTORI KONTAK */}
        {activeTab === 'guests' && (
          <div className="bg-[#1A233A] border border-[#7395C0]/25 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 text-left">
            {/* Header Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-[#7395C0]/15">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#F9F6EE] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#7395C0]" />
                  <span>Buku Tamu &amp; Direktori Undangan</span>
                </h2>
                <p className="text-xs text-[#DADDE0]/75 mt-0.5">
                  Kelola daftar undangan, pantau status pengiriman, impor data massal, dan kirim pesan personal via WhatsApp.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Unduh Template CSV */}
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-2 rounded-xl bg-[#141A2B] hover:bg-[#202C48] text-[#AFC9E5] hover:text-[#F8DDA6] border border-[#7395C0]/30 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Unduh contoh template file CSV untuk format pengisian daftar tamu"
                >
                  <FileText className="w-3.5 h-3.5 text-[#F8DDA6]" />
                  <span>Template CSV</span>
                </button>

                {/* Import Tamu CSV */}
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-[#202C48] hover:bg-[#28385d] text-[#F9F6EE] hover:text-white border border-[#7395C0]/35 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Impor daftar tamu secara massal dari file CSV"
                >
                  <Upload className="w-3.5 h-3.5 text-[#7395C0]" />
                  <span>Impor CSV</span>
                </button>

                {/* Ekspor CSV */}
                <button
                  type="button"
                  onClick={() => {
                    const csv = generateGuestDirectoryCsv(guests);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `daftar_tamu_undangan_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    triggerNotice('Data kontak tamu berhasil diunduh dalam format CSV!');
                  }}
                  className="px-3 py-2 rounded-xl bg-[#141A2B] hover:bg-[#202C48] text-[#AFC9E5] hover:text-white border border-[#7395C0]/30 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Ekspor seluruh daftar tamu ke file Excel / CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ekspor CSV</span>
                </button>

                {/* Tambah Tamu Baru */}
                <button
                  type="button"
                  onClick={() => setActiveTab('generator')}
                  className="px-3.5 py-2 rounded-xl bg-[#7395C0] hover:bg-[#85a8d4] text-[#141A2B] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tamu</span>
                </button>
              </div>
            </div>

            {/* Filter Pills and Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs pt-1">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7395C0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, nomor WhatsApp, atau catatan..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#141A2B] border border-[#7395C0]/30 text-[#F9F6EE] placeholder:text-[#DADDE0]/40 focus:outline-none focus:border-[#7395C0]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-[#DADDE0]/50 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status and Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-1 bg-[#141A2B] p-1 rounded-xl border border-[#7395C0]/25">
                  {[
                    { id: 'all', label: `Semua (${guests.length})` },
                    { id: 'pending', label: `Belum (${pendingCount})` },
                    { id: 'sent', label: `Terkirim (${sentCount})` },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFilterStatus(s.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        filterStatus === s.id
                          ? 'bg-[#7395C0] text-[#141A2B] font-bold shadow-xs'
                          : 'text-[#DADDE0] hover:text-white hover:bg-[#202C48]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#141A2B] text-[#DADDE0] text-[11px] px-3 py-1.5 rounded-xl border border-[#7395C0]/30 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Sahabat">Sahabat</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Rekan Kerja">Rekan Kerja</option>
                  <option value="VIP">VIP</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#7395C0]/25 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#141A2B] text-[#AFC9E5] border-b border-[#7395C0]/25 font-semibold">
                    <th className="py-3 px-4">Nama Tamu &amp; Catatan</th>
                    <th className="py-3 px-4">WhatsApp</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Pax</th>
                    <th className="py-3 px-4">Status Pengiriman</th>
                    <th className="py-3 px-4 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7395C0]/15 bg-[#1A233A]">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#DADDE0]/60">
                        Tidak ada kontak tamu yang cocok dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const guestLink = generateGuestInvitationLink(guest.name);
                      const isCopied = copiedLinkGuestId === guest.id;
                      return (
                        <tr key={guest.id} className="hover:bg-[#202C48]/50 transition-colors">
                          {/* Nama & Catatan */}
                          <td className="py-3 px-4 font-semibold text-[#F9F6EE]">
                            <div>{guest.name}</div>
                            {guest.customNotes && (
                              <div className="text-[10px] text-[#DADDE0]/60 font-normal italic mt-0.5">
                                {guest.customNotes}
                              </div>
                            )}
                          </td>

                          {/* WhatsApp */}
                          <td className="py-3 px-4 text-[#AFC9E5] font-mono text-[11px]">
                            {guest.phone ? formatPhoneDisplay(guest.phone) : (
                              <span className="text-[#DADDE0]/40 italic">Tanpa nomor</span>
                            )}
                          </td>

                          {/* Kategori */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                guest.category === 'VIP'
                                  ? 'bg-[#F8DDA6]/15 text-[#F8DDA6] border border-[#F8DDA6]/35'
                                  : guest.category === 'Keluarga'
                                  ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40'
                                  : guest.category === 'Sahabat'
                                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                                  : 'bg-blue-950/50 text-blue-300 border border-blue-800/40'
                              }`}
                            >
                              {guest.category}
                            </span>
                          </td>

                          {/* Pax */}
                          <td className="py-3 px-4 text-center font-medium text-[#DADDE0]">
                            {guest.paxReserved || 1}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleStatus(guest.id)}
                              title="Klik untuk mengubah status kirim"
                              className="cursor-pointer"
                            >
                              {guest.status === 'sent' ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/50 px-2.5 py-1 rounded-lg border border-emerald-700/50 transition-colors">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Sudah Terkirim</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/50 hover:bg-amber-900/50 px-2.5 py-1 rounded-lg border border-amber-700/50 transition-colors">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Belum Dikirim</span>
                                </span>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Kirim WA */}
                              <button
                                onClick={() => handleSendWhatsapp(guest)}
                                title="Buka WhatsApp dengan pesan personal"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Kirim WA</span>
                              </button>

                              {/* Salin Tautan */}
                              <button
                                onClick={() => handleCopyGuestLink(guest)}
                                title="Salin tautan undangan tamu ini"
                                className="p-1.5 rounded-lg bg-[#141A2B] hover:bg-[#202C48] text-[#DADDE0] hover:text-white border border-[#7395C0]/30 transition-colors cursor-pointer"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Lihat Undangan */}
                              <a
                                href={guestLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Lihat tampilan undangan khusus tamu ini"
                                className="p-1.5 rounded-lg bg-[#141A2B] hover:bg-[#202C48] text-[#DADDE0] hover:text-white border border-[#7395C0]/30 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              {/* Hapus */}
                              <button
                                onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                title="Hapus dari daftar tamu"
                                className="p-1.5 rounded-lg bg-[#141A2B] hover:bg-rose-950/80 text-[#DADDE0]/60 hover:text-rose-400 border border-[#7395C0]/30 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {filteredGuests.length === 0 ? (
                <div className="py-8 text-center text-[#DADDE0]/60 text-xs">
                  Tidak ada kontak tamu yang cocok dengan filter.
                </div>
              ) : (
                filteredGuests.map((guest) => {
                  const guestLink = generateGuestInvitationLink(guest.name);
                  const isCopied = copiedLinkGuestId === guest.id;
                  return (
                    <div
                      key={guest.id}
                      className="bg-[#141A2B] border border-[#7395C0]/25 rounded-2xl p-4 space-y-3 text-left shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-[#F9F6EE] text-sm">{guest.name}</div>
                          <div className="text-[11px] font-mono text-[#AFC9E5] mt-0.5">
                            {guest.phone ? formatPhoneDisplay(guest.phone) : 'Tanpa nomor telepon'}
                          </div>
                          {guest.customNotes && (
                            <div className="text-[10px] text-[#DADDE0]/60 italic mt-0.5">
                              {guest.customNotes}
                            </div>
                          )}
                        </div>

                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                            guest.category === 'VIP'
                              ? 'bg-[#F8DDA6]/15 text-[#F8DDA6] border border-[#F8DDA6]/35'
                              : guest.category === 'Keluarga'
                              ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40'
                              : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                          }`}
                        >
                          {guest.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#7395C0]/15 text-xs">
                        <button
                          onClick={() => handleToggleStatus(guest.id)}
                          className="cursor-pointer"
                        >
                          {guest.status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-700/50">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Sudah Dikirim</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-700/50">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Belum Dikirim</span>
                            </span>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSendWhatsapp(guest)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Kirim WA</span>
                          </button>

                          <button
                            onClick={() => handleCopyGuestLink(guest)}
                            className="p-1.5 rounded-lg bg-[#1A233A] border border-[#7395C0]/30 text-[#DADDE0]"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <a
                            href={guestLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#1A233A] border border-[#7395C0]/30 text-[#DADDE0]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleDeleteGuest(guest.id, guest.name)}
                            className="p-1.5 rounded-lg bg-[#1A233A] border border-[#7395C0]/30 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EDITOR TEMPLATE PESAN WHATSAPP */}
        {activeTab === 'template' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor Form Column */}
            <div className="lg:col-span-7 bg-[#1A233A] border border-[#7395C0]/25 rounded-3xl p-5 sm:p-7 shadow-xl text-left space-y-4">
              <div className="border-b border-[#7395C0]/15 pb-3">
                <h2 className="font-serif text-lg font-bold text-[#F9F6EE] flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#7395C0]" />
                  <span>Kustomisasi Format Pesan WhatsApp</span>
                </h2>
                <p className="text-xs text-[#DADDE0]/75 mt-0.5">
                  Sesuaikan kata pengantar dan gunakan variabel otomatis di bawah agar nama dan tautan setiap tamu terisi dinamis.
                </p>
              </div>

              {/* Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#DADDE0] mb-2">
                  Pilih Gaya Bahasa / Template:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'formal', label: 'Formal & Khidmat', desc: 'Pejabat & Rekan Senior' },
                    { id: 'casual', label: 'Kasual & Sahabat', desc: 'Teman Sebaya & Komunitas' },
                    { id: 'family', label: 'Keluarga Besar', desc: 'Kerabat & Sesepuh' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id as any)}
                      className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                        activePreset === preset.id
                          ? 'bg-[#7395C0]/20 border-[#7395C0] text-[#F9F6EE]'
                          : 'bg-[#141A2B] border-[#7395C0]/20 text-[#DADDE0]/80 hover:border-[#7395C0]/40'
                      }`}
                    >
                      <div className="text-xs font-bold">{preset.label}</div>
                      <div className="text-[10px] text-[#AFC9E5]/70 mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Variables Chips */}
              <div>
                <label className="block text-[11px] font-semibold text-[#DADDE0]/80 mb-1.5">
                  Klik Chip Variabel untuk Menyisipkan Otomatis:
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { tag: '{nama}', desc: 'Nama Tamu' },
                    { tag: '{link}', desc: 'Link Undangan Personal' },
                    { tag: '{mempelai}', desc: 'Nama Lengkap Mempelai' },
                    { tag: '{panggilan}', desc: 'Hasna & Dzikri' },
                    { tag: '{hari_tanggal}', desc: 'Sabtu, 14 Nov 2026' },
                    { tag: '{waktu}', desc: 'Waktu Akad & Resepsi' },
                    { tag: '{lokasi}', desc: 'Tempat Acara Majalaya' },
                  ].map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      title={`Sisipkan ${v.desc}`}
                      className="px-2.5 py-1 rounded-lg bg-[#141A2B] hover:bg-[#202C48] border border-[#7395C0]/30 text-[#AFC9E5] text-[11px] font-mono hover:border-[#7395C0] transition-colors cursor-pointer"
                    >
                      + {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Template */}
              <div>
                <textarea
                  rows={13}
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[#141A2B] border border-[#7395C0]/30 text-[#F9F6EE] font-mono text-xs leading-relaxed focus:outline-none focus:border-[#7395C0] focus:ring-1 focus:ring-[#7395C0] resize-y"
                  placeholder="Ketik draf pesan WhatsApp Anda di sini..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => saveTemplate(customTemplate)}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Simpan Perubahan Template
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('formal')}
                  className="py-2.5 px-4 rounded-xl bg-[#141A2B] hover:bg-[#202C48] text-[#DADDE0] text-xs border border-[#7395C0]/30 transition-all cursor-pointer"
                >
                  Reset ke Formal Bawaan
                </button>
              </div>
            </div>

            {/* Live WhatsApp Bubble Preview Column */}
            <div className="lg:col-span-5 bg-[#1A233A] border border-[#7395C0]/25 rounded-3xl p-5 sm:p-7 shadow-xl text-left flex flex-col justify-between">
              <div>
                <div className="border-b border-[#7395C0]/15 pb-3 mb-3">
                  <h3 className="font-serif text-base font-bold text-[#F9F6EE] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Hasil Live di WhatsApp</span>
                  </h3>
                  <p className="text-[11px] text-[#DADDE0]/70 mt-0.5">
                    Contoh pesan terkompilasi untuk tamu: <strong>{previewGuestName}</strong>.
                  </p>
                </div>

                <div className="bg-[#0b141a] p-4 rounded-2xl border border-stone-800 font-sans shadow-inner">
                  <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-xs p-4 text-xs whitespace-pre-wrap leading-relaxed shadow-md select-text">
                    {previewCompiledMessage}
                  </div>
                  <div className="text-right text-[10px] text-stone-400 mt-2 pr-1 font-mono">
                    ✓✓ Terkirim otomatis via wa.me
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#7395C0]/15 text-center">
                <p className="text-[11px] text-[#DADDE0]/70">
                  Semua tombol "Kirim WA" di buku tamu akan langsung memakai template yang tersimpan ini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REKAP KONFIRMASI RSVP */}
        {activeTab === 'rsvp' && (
          <div className="bg-[#1A233A] border border-[#7395C0]/25 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 text-left">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#7395C0]/15">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#F9F6EE] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F8DDA6]" />
                  <span>Rekap Konfirmasi Kehadiran Tamu (RSVP)</span>
                </h2>
                <p className="text-xs text-[#DADDE0]/75 mt-0.5">
                  Daftar respon resmi dan ucapan doa dari para tamu undangan yang masuk ke sistem.
                </p>
              </div>

              <button
                onClick={() => {
                  const csv = generateRsvpCsv(rsvps);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `rekap_kehadiran_rsvp_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  triggerNotice('Data RSVP berhasil diekspor ke file CSV!');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#7395C0] hover:bg-[#85a8d4] text-[#141A2B] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap CSV</span>
              </button>
            </div>

            {/* Attendance Status Summary Badges */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="bg-emerald-950/40 border border-emerald-700/50 p-4 rounded-2xl">
                <div className="text-xl sm:text-2xl font-bold font-serif text-emerald-400">
                  {rsvpStats.totalAttendingPax} Pax
                </div>
                <div className="text-xs text-emerald-300 mt-0.5 font-medium">
                  {rsvpStats.hadirSubmissionsCount} Tamu Pasti Hadir
                </div>
              </div>

              <div className="bg-rose-950/40 border border-rose-700/50 p-4 rounded-2xl">
                <div className="text-xl sm:text-2xl font-bold font-serif text-rose-400">
                  {rsvpStats.tidakHadirSubmissionsCount} Respon
                </div>
                <div className="text-xs text-rose-300 mt-0.5 font-medium">
                  Berhalangan Hadir
                </div>
              </div>

              <div className="bg-amber-950/40 border border-amber-700/50 p-4 rounded-2xl">
                <div className="text-xl sm:text-2xl font-bold font-serif text-amber-400">
                  {rsvpStats.raguSubmissionsCount} Respon
                </div>
                <div className="text-xs text-amber-300 mt-0.5 font-medium">
                  Tentatif / Ragu-ragu
                </div>
              </div>
            </div>

            {/* Search & Status Filters for RSVP */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs pt-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7395C0]" />
                <input
                  type="text"
                  value={rsvpSearchQuery}
                  onChange={(e) => setRsvpSearchQuery(e.target.value)}
                  placeholder="Cari nama tamu atau kata dalam ucapan doa..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#141A2B] border border-[#7395C0]/30 text-[#F9F6EE] placeholder:text-[#DADDE0]/40 focus:outline-none focus:border-[#7395C0]"
                />
                {rsvpSearchQuery && (
                  <button
                    onClick={() => setRsvpSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-[#DADDE0]/50 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 bg-[#141A2B] p-1 rounded-xl border border-[#7395C0]/25">
                {[
                  { id: 'all', label: `Semua (${rsvps.length})` },
                  { id: 'hadir', label: `Hadir (${rsvpStats.hadirSubmissionsCount})` },
                  { id: 'tidak_hadir', label: `Tidak (${rsvpStats.tidakHadirSubmissionsCount})` },
                  { id: 'ragu', label: `Ragu (${rsvpStats.raguSubmissionsCount})` },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setRsvpFilterStatus(s.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      rsvpFilterStatus === s.id
                        ? 'bg-[#7395C0] text-[#141A2B] font-bold shadow-xs'
                        : 'text-[#DADDE0] hover:text-white hover:bg-[#202C48]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#7395C0]/25 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#141A2B] text-[#AFC9E5] border-b border-[#7395C0]/25 font-semibold">
                    <th className="py-3 px-4">Nama Tamu</th>
                    <th className="py-3 px-4">WhatsApp</th>
                    <th className="py-3 px-4">Status Kehadiran</th>
                    <th className="py-3 px-4 text-center">Pax</th>
                    <th className="py-3 px-4">Pesan Doa &amp; Harapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7395C0]/15 bg-[#1A233A]">
                  {filteredRsvps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#DADDE0]/60">
                        {rsvps.length === 0
                          ? 'Belum ada data konfirmasi kehadiran tamu (RSVP) yang masuk.'
                          : 'Tidak ada data yang sesuai dengan pencarian / filter Anda.'}
                      </td>
                    </tr>
                  ) : (
                    filteredRsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-[#202C48]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#F9F6EE]">{rsvp.name}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#AFC9E5]">
                          {rsvp.phone ? formatPhoneDisplay(rsvp.phone) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {rsvp.status === 'hadir' ? (
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/60 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Hadir</span>
                            </span>
                          ) : rsvp.status === 'tidak_hadir' ? (
                            <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-700/60 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>Tidak Hadir</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-700/60 inline-flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-amber-400" />
                              <span>Tentatif</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-[#DADDE0] font-semibold">
                          {rsvp.status === 'hadir' ? `${rsvp.pax} Pax` : '-'}
                        </td>
                        <td className="py-3 px-4 text-[#DADDE0]/85 italic max-w-sm">
                          {rsvp.wishes ? (
                            <span className="line-clamp-2">“{rsvp.wishes}”</span>
                          ) : (
                            <span className="text-[#DADDE0]/40">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#0E1320]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#1A233A] border border-[#7395C0]/35 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative text-left my-8 animate-fade-in">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#7395C0]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#7395C0]/20 text-[#F8DDA6] border border-[#7395C0]/30 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#F9F6EE]">
                      Impor Tamu dari File CSV
                    </h3>
                    <p className="text-xs text-[#DADDE0]/70 mt-0.5">
                      Tambahkan banyak kontak tamu sekaligus dari file spreadsheet / Excel CSV.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseImportModal}
                  className="p-1.5 rounded-lg text-[#DADDE0]/60 hover:text-white hover:bg-[#141A2B] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1: Template Info Box */}
              <div className="mt-4 p-4 rounded-2xl bg-[#141A2B] border border-[#7395C0]/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F8DDA6] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#7395C0]" /> Belum punya format CSV?
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-xs font-semibold text-[#AFC9E5] hover:text-[#F8DDA6] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh Contoh Template</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#DADDE0]/75 leading-relaxed">
                  Format kolom: <code className="bg-[#0E1320] px-1.5 py-0.5 rounded text-[#AFC9E5] font-mono">Nama Tamu</code>, <code className="bg-[#0E1320] px-1.5 py-0.5 rounded text-[#AFC9E5] font-mono">Nomor WhatsApp</code>, <code className="bg-[#0E1320] px-1.5 py-0.5 rounded text-[#AFC9E5] font-mono">Kategori</code>, <code className="bg-[#0E1320] px-1.5 py-0.5 rounded text-[#AFC9E5] font-mono">Alokasi Pax</code>, dan <code className="bg-[#0E1320] px-1.5 py-0.5 rounded text-[#AFC9E5] font-mono">Catatan</code>.
                </p>
              </div>

              {/* Step 2: File Picker */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#DADDE0] mb-2">
                  Pilih File CSV (.csv):
                </label>
                <label
                  htmlFor="csv-file-upload"
                  className="border-2 border-dashed border-[#7395C0]/35 hover:border-[#7395C0] bg-[#141A2B]/60 hover:bg-[#141A2B] rounded-2xl p-6 text-center block cursor-pointer transition-all"
                >
                  <input
                    id="csv-file-upload"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <FileUp className="w-8 h-8 text-[#7395C0] mx-auto mb-2" />
                  {importFile ? (
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block">{importFile.name}</span>
                      <span className="text-[10px] text-[#DADDE0]/60 mt-0.5 block">
                        {(importFile.size / 1024).toFixed(1)} KB · Klik untuk ganti file
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-[#F9F6EE] block">
                        Klik untuk memilih file CSV dari perangkat Anda
                      </span>
                      <span className="text-[10px] text-[#DADDE0]/60 mt-0.5 block">
                        Mendukung pemisah koma (,) atau titik-koma (;)
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Error Message if any */}
              {importErrors.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    {importErrors.map((err, idx) => (
                      <div key={idx}>{err}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Parsed Data Preview */}
              {importParsedGuests.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{importParsedGuests.length} Tamu Siap Diimpor</span>
                    </span>
                    <span className="text-[10px] text-[#DADDE0]/60">Pratinjau data:</span>
                  </div>

                  <div className="max-h-36 overflow-y-auto no-scrollbar rounded-xl border border-[#7395C0]/25 bg-[#141A2B] text-xs divide-y divide-[#7395C0]/15">
                    {importParsedGuests.slice(0, 5).map((guest, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="font-semibold text-[#F9F6EE]">{guest.name}</span>
                          <span className="text-[10px] text-[#AFC9E5] block font-mono">
                            {guest.phone ? formatPhoneDisplay(guest.phone) : 'Tanpa no. WA'} · {guest.paxReserved} Pax
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7395C0]/20 text-[#AFC9E5] border border-[#7395C0]/30 shrink-0">
                          {guest.category}
                        </span>
                      </div>
                    ))}
                    {importParsedGuests.length > 5 && (
                      <div className="p-2 text-center text-[10px] text-[#DADDE0]/60 italic bg-[#0E1320]/60">
                        + {importParsedGuests.length - 5} tamu lainnya...
                      </div>
                    )}
                  </div>

                  {/* Import Mode: Append or Replace */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-[#DADDE0]/80 mb-1.5">
                      Pilihan Metode Impor:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setImportMode('append')}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          importMode === 'append'
                            ? 'bg-[#7395C0]/25 border-[#7395C0] text-[#F9F6EE] font-semibold'
                            : 'bg-[#141A2B] border-[#7395C0]/25 text-[#DADDE0]/70'
                        }`}
                      >
                        <div className="font-bold">Tambahkan ke Daftar Saat Ini</div>
                        <div className="text-[10px] text-[#AFC9E5]/70 mt-0.5">Pertahankan {guests.length} tamu yang ada</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          importMode === 'replace'
                            ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold'
                            : 'bg-[#141A2B] border-[#7395C0]/25 text-[#DADDE0]/70'
                        }`}
                      >
                        <div className="font-bold">Gantikan Seluruh Daftar</div>
                        <div className="text-[10px] text-rose-300/70 mt-0.5">Hapus tamu lama &amp; ganti dengan file ini</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 pt-4 border-t border-[#7395C0]/20 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseImportModal}
                  className="px-4 py-2.5 rounded-xl bg-[#141A2B] hover:bg-[#202C48] text-[#DADDE0] text-xs font-medium border border-[#7395C0]/30 transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={importParsedGuests.length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Konfirmasi &amp; Impor ({importParsedGuests.length} Tamu)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
