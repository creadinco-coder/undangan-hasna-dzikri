/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { FloralCrest, FloralCorner } from './WeddingDecorativeAssets.tsx';
import { CoupleDashboard } from './CoupleDashboard.tsx';

interface DashboardAuthGateProps {
  onBackToInvitation: () => void;
}

const STORAGE_AUTH_KEY = 'wedding_dashboard_authenticated';

export function DashboardAuthGate({ onBackToInvitation }: DashboardAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true';
  });

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Read environment variable password with secure fallback
  const validPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'hasnadzikri2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Verify password
    if (password.trim() === validPassword) {
      sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setIsSubmitting(false);
    } else {
      setTimeout(() => {
        setErrorMessage('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
        setIsSubmitting(false);
      }, 250);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_AUTH_KEY);
    setIsAuthenticated(false);
    setPassword('');
    onBackToInvitation();
  };

  // If already authenticated in this session, render the full Couple Dashboard
  if (isAuthenticated) {
    return (
      <CoupleDashboard
        onBackToInvitation={onBackToInvitation}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#161D30] text-[#F9F6EE] font-sans flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-[#7395C0]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-[#F8DDA6]/15 blur-3xl pointer-events-none" />

      {/* Decorative corner filigrees */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 text-[#7395C0]/40 pointer-events-none z-10">
        <FloralCorner className="w-10 h-10 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 text-[#7395C0]/40 pointer-events-none rotate-90 z-10">
        <FloralCorner className="w-10 h-10 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 text-[#7395C0]/40 pointer-events-none -rotate-90 z-10">
        <FloralCorner className="w-10 h-10 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 text-[#7395C0]/40 pointer-events-none rotate-180 z-10">
        <FloralCorner className="w-10 h-10 sm:w-14 sm:h-14" />
      </div>

      {/* Security Login Card */}
      <div className="max-w-sm sm:max-w-md w-full relative z-10">
        <div className="bg-[#1A233A]/90 backdrop-blur-xl border border-[#7395C0]/35 rounded-[30px] sm:rounded-[36px] p-7 sm:p-9 shadow-2xl relative overflow-hidden group">
          {/* Top golden hairline accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F8DDA6]/60 to-transparent" />

          {/* Crest & Lock Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#7395C0]/20 border border-[#7395C0]/40 flex items-center justify-center text-[#F8DDA6] mb-3 shadow-md">
              <Lock className="w-6 h-6" />
            </div>

            <span className="text-[10px] uppercase tracking-[0.28em] text-[#AFC9E5] font-medium mb-1.5">
              Portal Khusus Pasangan
            </span>

            <h1 className="font-serif text-2xl sm:text-[26px] text-[#F9F6EE] font-normal tracking-wide leading-tight">
              Akses Dasbor Pengantin
            </h1>

            <p className="text-xs text-[#DADDE0]/75 font-light leading-relaxed mt-2 max-w-xs">
              Area ini dilindungi kata sandi untuk mengelola daftar tamu undangan, generator pesan WhatsApp, dan konfirmasi RSVP.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="dashboard-password"
                className="block text-[11px] uppercase tracking-wider text-[#AFC9E5] font-medium mb-1.5 text-left"
              >
                Kata Sandi Pengaman
              </label>

              <div className="relative">
                <input
                  id="dashboard-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoFocus
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-4 pr-11 py-3 text-sm rounded-xl border border-[#7395C0]/35 bg-[#161D30]/80 text-[#F9F6EE] placeholder:text-[#DADDE0]/40 focus:outline-none focus:border-[#F8DDA6] focus:ring-1 focus:ring-[#F8DDA6] transition-all font-sans"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#DADDE0]/60 hover:text-[#F8DDA6] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMessage && (
                <div className="mt-2.5 flex items-start gap-2 text-rose-300 text-xs bg-rose-950/60 border border-rose-800/60 p-2.5 rounded-xl text-left">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7395C0] via-[#8bb0dc] to-[#7395C0] hover:brightness-110 active:scale-[0.98] text-[#161D30] font-semibold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Memverifikasi...' : 'Buka Dasbor'}</span>
            </button>
          </form>

          {/* Back to Public Invitation */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <button
              onClick={onBackToInvitation}
              type="button"
              className="inline-flex items-center gap-2 text-xs text-[#AFC9E5]/80 hover:text-[#F8DDA6] transition-colors font-light py-1 px-3 rounded-full hover:bg-white/5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Undangan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

