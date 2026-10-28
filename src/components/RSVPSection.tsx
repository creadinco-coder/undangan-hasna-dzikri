/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Users,
  Search,
  Send,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  AttendanceStatus,
  RsvpSubmission,
  RsvpFormInput,
  validateRsvpForm,
  calculateRsvpStats,
  getInitialSeedRsvps,
} from '../utils/rsvpUtils.ts';
import { FloralCrest } from './WeddingDecorativeAssets.tsx';
import { FadeInUp } from './FadeInUp.tsx';
import {
  isSupabaseConfigured,
  fetchRsvpFromSupabase,
  insertRsvpToSupabase,
  supabase,
} from '../lib/supabase.ts';

interface RSVPSectionProps {
  guestName?: string;
}

const STORAGE_KEY = 'wedding_rsvp_submissions';

export function RSVPSection({ guestName = '' }: RSVPSectionProps) {
  // RSVP Submissions state persisted in localStorage (sanitized: phone numbers are never stored in public storage)
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Privacy sanitize: ensure phone is scrubbed from public view
          return parsed.map((item: any) => ({ ...item, phone: '' }));
        }
      }
    } catch {
      // Fallback
    }
    return getInitialSeedRsvps().map((item) => ({ ...item, phone: '' }));
  });

  // Active form inputs
  const [form, setForm] = useState<RsvpFormInput>({
    name: guestName || '',
    phone: '',
    status: 'hadir',
    pax: 2,
    wishes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Default collapsed as requested by user
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Open form if triggered externally (e.g. from Journey CTA)
  useEffect(() => {
    const handleOpenForm = () => setIsFormOpen(true);
    window.addEventListener('wedding:open-rsvp-form', handleOpenForm);
    return () => window.removeEventListener('wedding:open-rsvp-form', handleOpenForm);
  }, []);

  // Sync with Supabase on mount and listen to Realtime updates
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    let isMounted = true;
    fetchRsvpFromSupabase().then((data) => {
      if (isMounted && data) {
        // Scrub phone numbers for public view
        const publicClean = data.map((item) => ({ ...item, phone: '' }));
        setSubmissions(publicClean);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(publicClean));
        } catch {}
      }
    });

    const channel = supabase
      .channel('public:rsvp_submissions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rsvp_submissions' },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.id) {
            const incoming: RsvpSubmission = {
              id: newRow.id,
              name: newRow.name,
              phone: '', // Never expose phone numbers in public guest view
              status: newRow.status,
              pax: Number(newRow.pax) || 0,
              wishes: newRow.wishes || '',
              createdAt: newRow.created_at || new Date().toISOString(),
            };
            setSubmissions((prev) => {
              if (prev.some((item) => item.id === incoming.id)) return prev;
              const next = [incoming, ...prev];
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase?.removeChannel(channel);
    };
  }, []);

  // Search and filter state for public wishes list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Update name if guestName prop changes and form name is untouched
  useEffect(() => {
    if (guestName && (!form.name || form.name === 'Hasna' || form.name === 'Bapak/Ibu/Saudara/i')) {
      setForm((prev) => ({ ...prev, name: guestName }));
    }
  }, [guestName]);

  // Save submissions to localStorage (strictly scrubbing phone numbers)
  const persistSubmissions = (newSubmissions: RsvpSubmission[]) => {
    const publicClean = newSubmissions.map(({ phone, ...rest }) => ({
      ...rest,
      phone: '',
    }));
    setSubmissions(publicClean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(publicClean));
    } catch {
      // ignore storage error
    }
  };

  const handleStatusSelect = (status: AttendanceStatus) => {
    setForm((prev) => ({
      ...prev,
      status,
      pax: status === 'hadir' ? (prev.pax === 0 ? 1 : prev.pax) : 0,
    }));
    if (formErrors.status) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.status;
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRsvpForm(form);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      // Full payload with phone for secure sync to couple's Supabase
      const newSubmission: RsvpSubmission = {
        id: `rsvp-${Date.now()}`,
        name: form.name.trim(),
        phone: form.phone.trim(),
        status: form.status,
        pax: form.status === 'hadir' ? Number(form.pax) : 0,
        wishes: form.wishes.trim(),
        createdAt: new Date().toISOString(),
      };

      // Push real phone securely to couple's Supabase database
      if (isSupabaseConfigured()) {
        insertRsvpToSupabase(newSubmission).catch((err) => {
          console.warn('[Supabase Sync Error]:', err);
        });
      }

      // Public display with phone scrubbed
      const publicCleanSubmission: RsvpSubmission = {
        ...newSubmission,
        phone: '',
      };
      const updated = [publicCleanSubmission, ...submissions];
      persistSubmissions(updated);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 450);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setIsFormOpen(true);
    setForm({
      name: guestName || '',
      phone: '',
      status: 'hadir',
      pax: 2,
      wishes: '',
    });
  };

  const stats = calculateRsvpStats(submissions);

  const filteredSubmissions = submissions.filter((sub) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      sub.name.toLowerCase().includes(query) ||
      (sub.wishes && sub.wishes.toLowerCase().includes(query));

    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <section
      id="rsvp"
      aria-label="Konfirmasi Kehadiran Tamu Undangan"
      className="w-full flex flex-col justify-center px-5 sm:px-8 py-20 sm:py-28 relative overflow-hidden bg-wedding-pattern"
    >
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -right-24 w-72 h-72 rounded-full bg-[#AFC9E5]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full bg-[#F8DDA6]/20 blur-3xl pointer-events-none" />

      <div className="max-w-sm sm:max-w-md mx-auto w-full relative z-10">
        {/* Section Header */}
        <FadeInUp className="text-center mb-10 sm:mb-12">
          <div className="flex justify-center mb-3">
            <FloralCrest className="w-11 h-11 text-[#7395C0]" />
          </div>
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#AFC9E5]/25 border border-[#7395C0]/35 text-[#202A45]/90 text-[10.5px] font-medium tracking-[0.2em] uppercase mb-3">
            <span>Reservasi &amp; Kehadiran</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#202A45] tracking-wide mb-3">
            Konfirmasi Kehadiran
          </h2>
          <p className="text-xs sm:text-[13px] text-[#202A45]/75 leading-relaxed font-light max-w-xs sm:max-w-sm mx-auto">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan
            hadir dan memberikan doa restu.
          </p>
        </FadeInUp>

        {/* Main RSVP Card */}
        <FadeInUp delay={0.1}>
          <div className="bg-white/95 rounded-[30px] sm:rounded-[36px] p-6 sm:p-8 shadow-xs border border-[#7395C0]/25 backdrop-blur-md relative transition-all">
            {isSubmitted ? (
              /* Success confirmation screen */
              <div className="text-center py-6 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-[#7395C0]/15 text-[#202A45] flex items-center justify-center mx-auto mb-4 border border-[#7395C0]/30">
                  <CheckCircle2 className="w-8 h-8 text-[#7395C0]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#202A45] mb-2 tracking-wide">
                  Terima Kasih, {form.name}!
                </h3>
                <p className="text-xs sm:text-[13px] text-[#202A45]/80 mb-6 leading-relaxed font-light">
                  {form.status === 'hadir'
                    ? `Konfirmasi kehadiran (${form.pax} orang) Anda telah tersimpan dengan rapi.`
                    : form.status === 'tidak_hadir'
                      ? 'Konfirmasi ketidakhadiran dan doa tulus Anda telah kami terima dengan penuh rasa syukur.'
                      : 'Konfirmasi tentatif Anda telah dicatat. Kami menantikan kabar baik selanjutnya.'}
                </p>

                {/* Confirmation Summary Box */}
                <div className="bg-[#F9F6EE] rounded-2xl p-4 sm:p-5 border border-[#DADDE0]/80 text-left text-xs space-y-2.5 mb-6">
                  <div className="flex justify-between border-b border-[#DADDE0]/80 pb-2">
                    <span className="text-[#202A45]/70 font-light">Status Kehadiran</span>
                    <span className="font-medium text-[#202A45] capitalize">
                      {form.status === 'hadir' ? 'Hadir' : form.status === 'tidak_hadir' ? 'Tidak Hadir' : 'Ragu-ragu'}
                    </span>
                  </div>
                  {form.status === 'hadir' && (
                    <div className="flex justify-between border-b border-[#DADDE0]/80 pb-2">
                      <span className="text-[#202A45]/70 font-light">Jumlah Tamu</span>
                      <span className="font-medium text-[#202A45]">{form.pax} Orang</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full py-3 px-4 rounded-xl bg-[#7395C0] hover:bg-[#5879a3] text-[#161D30] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    Kirim Respon / Ucapan Lain
                  </button>
                </div>
              </div>
            ) : !isFormOpen ? (
              /* Collapsed State: Button to open/expand RSVP Form */
              <div className="text-center py-1">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#7395C0] via-[#8bb0dc] to-[#7395C0] hover:brightness-105 text-[#161D30] text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-[#AFC9E5]/60"
                >
                  <Send className="w-4 h-4 text-[#161D30]" />
                  <span>Kirim Pesan &amp; Doa</span>
                  <ChevronDown className="w-4 h-4 text-[#161D30]" />
                </button>
                <p className="text-[11px] text-[#202A45]/60 font-light mt-2.5">
                  Ketuk tombol di atas untuk mengirimkan pesan dan doa.
                </p>
              </div>
            ) : (
              /* Expanded RSVP Form */
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {/* Header toggle bar to collapse the form */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#DADDE0]/80">
                  <span className="text-xs font-semibold text-[#202A45] uppercase tracking-wider">
                    Kirim Pesan dan Doa
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-[11px] font-medium text-[#7395C0] hover:text-[#202A45] flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <span>Tutup</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  {/* Name field */}
                  <div>
                    <label htmlFor="rsvp-name" className="block text-xs font-medium text-[#202A45] mb-1.5">
                      Nama Lengkap Tamu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="rsvp-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Contoh: Raden & Partner / Hasna"
                      className={`w-full px-4 py-3 text-xs sm:text-[13px] rounded-xl border ${formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-[#DADDE0] bg-[#F9F6EE]/60'
                        } focus:outline-none focus:ring-1.5 focus:ring-[#7395C0] focus:bg-white transition-all text-[#202A45]`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-light">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Attendance Status Selection */}
                  <div>
                    <label className="block text-xs font-medium text-[#202A45] mb-2">
                      Konfirmasi Kehadiran <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                      {/* Hadir */}
                      <button
                        type="button"
                        onClick={() => handleStatusSelect('hadir')}
                        className={`py-3 px-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${form.status === 'hadir'
                          ? 'bg-[#7395C0] text-white border-[#7395C0] shadow-xs'
                          : 'bg-[#F9F6EE] text-[#202A45]/80 border-[#DADDE0] hover:bg-white'
                          }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${form.status === 'hadir' ? 'text-white' : 'text-[#7395C0]'}`}
                        />
                        <span>Hadir</span>
                      </button>

                      {/* Tidak Hadir */}
                      <button
                        type="button"
                        onClick={() => handleStatusSelect('tidak_hadir')}
                        className={`py-3 px-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${form.status === 'tidak_hadir'
                          ? 'bg-[#202A45] text-white border-[#202A45] shadow-xs'
                          : 'bg-[#F9F6EE] text-[#202A45]/80 border-[#DADDE0] hover:bg-white'
                          }`}
                      >
                        <XCircle
                          className={`w-4 h-4 ${form.status === 'tidak_hadir' ? 'text-white' : 'text-[#202A45]/50'}`}
                        />
                        <span>Tidak Hadir</span>
                      </button>

                      {/* Ragu-ragu */}
                      <button
                        type="button"
                        onClick={() => handleStatusSelect('ragu')}
                        className={`py-3 px-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${form.status === 'ragu'
                          ? 'bg-[#AFC9E5] text-[#202A45] border-[#7395C0] shadow-xs font-semibold'
                          : 'bg-[#F9F6EE] text-[#202A45]/80 border-[#DADDE0] hover:bg-white'
                          }`}
                      >
                        <HelpCircle
                          className={`w-4 h-4 ${form.status === 'ragu' ? 'text-[#202A45]' : 'text-[#202A45]/50'}`}
                        />
                        <span>Ragu-ragu</span>
                      </button>
                    </div>
                    {formErrors.status && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-light">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.status}</span>
                      </p>
                    )}
                  </div>

                  {/* Number of Pax (Only if Hadir) */}
                  {form.status === 'hadir' && (
                    <div className="bg-[#F9F6EE] p-4 sm:p-5 rounded-2xl border border-[#DADDE0]/80 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label htmlFor="rsvp-pax" className="text-xs font-medium text-[#202A45] flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#7395C0]" />
                          <span>Jumlah Tamu yang Hadir</span>
                        </label>
                        <span className="text-xs font-semibold text-[#202A45] bg-[#AFC9E5]/40 px-2.5 py-0.5 rounded-md border border-[#7395C0]/30">
                          {form.pax} Orang
                        </span>
                      </div>
                      <input
                        id="rsvp-pax"
                        type="range"
                        min="1"
                        max="6"
                        step="1"
                        value={form.pax}
                        onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })}
                        className="w-full accent-[#7395C0] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#202A45]/60 font-light">
                        <span>1 Tamu</span>
                        <span>2 Tamu</span>
                        <span>3 Tamu</span>
                        <span>4 Tamu</span>
                        <span>5+ Tamu</span>
                      </div>
                      {formErrors.pax && (
                        <p className="text-[11px] text-rose-500 mt-1 font-light">{formErrors.pax}</p>
                      )}
                    </div>
                  )}

                  {/* Wishes / Pesan & Doa */}
                  <div>
                    <label htmlFor="rsvp-wishes" className="block text-xs font-medium text-[#202A45] mb-1.5">
                      Pesan &amp; Doa untuk Mempelai <span className="text-[#202A45]/60 font-light">(Opsional)</span>
                    </label>
                    <textarea
                      id="rsvp-wishes"
                      rows={3}
                      value={form.wishes}
                      onChange={(e) => setForm({ ...form, wishes: e.target.value })}
                      placeholder="Tuliskan ucapan selamat dan doa restu terbaik Anda..."
                      className="w-full px-4 py-3 text-xs sm:text-[13px] rounded-xl border border-[#DADDE0] bg-[#F9F6EE]/60 focus:outline-none focus:ring-1.5 focus:ring-[#7395C0] focus:bg-white text-[#202A45] resize-none font-light"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7395C0] via-[#8bb0dc] to-[#7395C0] hover:brightness-105 text-[#161D30] text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 border border-[#AFC9E5]/60"
                  >
                    {isSubmitting ? (
                      <span>Menyimpan Pesan...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pesan dan Doa</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Ucapan & Doa Tamu Undangan (Selalu Terbuka / Tidak di-collapse) */}
            <div className="mt-8 pt-6 border-t border-[#DADDE0]/80 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#7395C0]" />
                  <h3 className="font-serif text-base font-normal text-[#202A45] tracking-wide">
                    Ucapan &amp; Doa Tamu
                  </h3>
                </div>
              </div>

              {/* Search & Filter tools */}
              <div className="mb-3.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#202A45]/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari ucapan berdasarkan nama atau kata kunci..."
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs rounded-xl border border-[#DADDE0] bg-[#F9F6EE]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7395C0] text-[#202A45] placeholder-[#202A45]/40 font-light"
                  />
                </div>
              </div>

              {/* Submissions List: Nama & Pesan saja */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-6 text-[#202A45]/60 text-xs font-light">
                    Belum ada ucapan yang cocok dengan pencarian.
                  </div>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 sm:p-4.5 rounded-2xl border border-[#DADDE0]/80 bg-[#F9F6EE]/50 hover:bg-white hover:border-[#7395C0]/40 transition-colors shadow-2xs space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#AFC9E5]/30 text-[#202A45] font-serif font-medium text-xs flex items-center justify-center shrink-0">
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-[#202A45] truncate">{sub.name}</span>
                      </div>

                      {sub.wishes && (
                        <p className="text-xs sm:text-[12.5px] text-[#202A45]/80 italic bg-white/80 p-3 sm:p-3.5 rounded-xl border border-[#DADDE0]/60 leading-relaxed font-light">
                          &ldquo;{sub.wishes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
