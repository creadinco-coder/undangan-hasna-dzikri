/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, QrCode, Copy, Check, ExternalLink, RotateCcw } from 'lucide-react';
import { FloralCrest } from './WeddingDecorativeAssets.tsx';

interface MobileRestrictionOverlayProps {
  guestName: string;
  onBypassRestriction: () => void;
  isSimulatedMobile: boolean;
}

export function MobileRestrictionOverlay({
  guestName,
  onBypassRestriction,
  isSimulatedMobile,
}: MobileRestrictionOverlayProps) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // If already in simulated mobile frame, do not block
  if (isSimulatedMobile) {
    return (
      <aside aria-label="Simulator Controls" className="hidden md:flex fixed top-3 left-1/2 -translate-x-1/2 z-50 items-center gap-2 bg-[#202A45]/90 text-[#F9F6EE] text-xs px-4 py-1.5 rounded-full shadow-lg border border-[#7395C0]/40 backdrop-blur-md">
        <Smartphone className="w-3.5 h-3.5 text-[#F8DDA6]" />
        <span>Mode Simulator Layar Ponsel (Aktif)</span>
        <button
          onClick={onBypassRestriction}
          className="ml-2 text-[#AFC9E5] hover:text-white underline underline-offset-2 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Keluar Simulator
        </button>
      </aside>
    );
  }

  return (
    <div className="hidden md:flex fixed inset-0 z-50 bg-[#161D30] text-[#F9F6EE] flex-col items-center justify-center p-4 sm:p-6 bg-wedding-pattern">
      <div className="max-w-md w-full max-h-[92vh] overflow-y-auto no-scrollbar bg-[#202A45] border border-[#7395C0]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#AFC9E5]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#F8DDA6]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-4">
          <FloralCrest className="w-16 h-16 text-[#7395C0]" />
        </div>

        <p className="text-xs uppercase tracking-[0.25em] text-[#AFC9E5] font-medium mb-1">
          Undangan Digital Interaktif
        </p>
        <h2 className="font-serif text-3xl text-white font-semibold mb-2">
          Hasna &amp; Dzikri
        </h2>

        <div className="inline-flex items-center gap-2 bg-[#161D30] border border-[#7395C0]/30 px-3.5 py-1.5 rounded-full my-3">
          <Smartphone className="w-4 h-4 text-[#F8DDA6]" />
          <span className="text-xs text-[#DADDE0] font-medium">Khusus Perangkat Mobile</span>
        </div>

        <p className="text-[#DADDE0] text-sm leading-relaxed mb-6">
          Kepada Yth. <strong className="text-white font-semibold">{guestName || 'Bapak/Ibu/Saudara/i'}</strong>, undangan ini dirancang secara eksklusif untuk pengalaman layar sentuh ponsel dalam orientasi portrait.
        </p>

        {/* QR Code Representation for instant mobile opening */}
        <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto mb-5 shadow-lg flex flex-col items-center justify-center border border-[#DADDE0]">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#202A45]" fill="currentColor">
            {/* Authentic SVG QR pattern */}
            <rect x="10" y="10" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="4" fill="none" />
            <rect x="18" y="18" width="8" height="8" fill="currentColor" />
            <rect x="66" y="10" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="4" fill="none" />
            <rect x="74" y="18" width="8" height="8" fill="currentColor" />
            <rect x="10" y="66" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="4" fill="none" />
            <rect x="18" y="74" width="8" height="8" fill="currentColor" />
            <rect x="42" y="12" width="6" height="12" />
            <rect x="52" y="18" width="6" height="6" />
            <rect x="42" y="32" width="8" height="6" />
            <rect x="14" y="44" width="8" height="8" />
            <rect x="30" y="48" width="12" height="6" />
            <rect x="48" y="46" width="6" height="14" />
            <rect x="62" y="42" width="10" height="6" />
            <rect x="78" y="42" width="8" height="10" />
            <rect x="42" y="68" width="10" height="6" />
            <rect x="60" y="64" width="10" height="12" />
            <rect x="76" y="66" width="8" height="8" />
            <rect x="44" y="82" width="14" height="6" />
            <rect x="66" y="84" width="8" height="6" />
            <rect x="80" y="80" width="6" height="10" />
          </svg>
          <span className="text-[10px] text-stone-500 font-medium mt-1">Pindai dengan Ponsel</span>
        </div>

        {/* Copy Link Button */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#161D30] hover:bg-[#161D30]/80 text-[#F9F6EE] text-xs font-medium border border-[#7395C0]/40 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Tautan Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#F8DDA6]" />
                <span>Salin Tautan untuk Ponsel</span>
              </>
            )}
          </button>

          {/* Simulator Option for testing/reviewing on desktop */}
          <button
            onClick={onBypassRestriction}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#7395C0] hover:bg-[#5879a3] text-[#161D30] font-bold text-xs shadow-md transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>Buka Simulasi Frame Mobile</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-400 mt-4">
          Atau ubah ukuran jendela browser menjadi &le; 500px untuk beralih otomatis.
        </p>
      </div>
    </div>
  );
}
