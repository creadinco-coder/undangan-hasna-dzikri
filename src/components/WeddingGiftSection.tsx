/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Gift, Copy, Check, CheckCircle2, X, Sparkles, MapPin } from 'lucide-react';
import { WeddingInvitationData } from '../data/invitationData.ts';
import { formatBankAccount } from '../utils/invitationUtils.ts';
import { BankBadge, FloralCrest } from './WeddingDecorativeAssets.tsx';
import { FadeInUp } from './FadeInUp.tsx';
import { EditorialImage } from './EditorialImage.tsx';

interface WeddingGiftSectionProps {
  data: WeddingInvitationData;
}

interface ToastNotification {
  id: string;
  title: string;
  detail: string;
}

export function WeddingGiftSection({ data }: WeddingGiftSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (title: string, detail: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ id: `toast-${Date.now()}`, title, detail });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  const copyToClipboard = async (id: string, text: string, bankName: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('fallback needed');
      }
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        // graceful fallback
      }
    }

    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);

    const formatted = formatBankAccount(text);
    showToast(
      'Nomor Rekening Berhasil Disalin',
      `${bankName} (${formatted}) telah tersalin ke clipboard.`
    );
  };

  const copyAddress = async (address: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
      } else {
        throw new Error('fallback needed');
      }
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        // graceful fallback
      }
    }

    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 3000);

    showToast(
      'Alamat Berhasil Disalin',
      'Alamat pengiriman kado fisik telah tersalin ke clipboard.'
    );
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      id="gift"
      aria-label="Tanda Kasih dan Amplop Digital"
      className="w-full flex flex-col justify-center px-5 sm:px-8 py-20 sm:py-28 relative overflow-hidden bg-[#161D30] text-[#F9F6EE]"
    >
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4 flex justify-center"
      >
        {toast && (
          <div
            key={toast.id}
            role="status"
            data-testid="copy-notification-toast"
            className="pointer-events-auto bg-[#202A45]/95 text-white border border-[#7395C0]/60 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 w-full max-w-xs md:max-w-sm relative overflow-hidden ring-1 ring-black/40 transition-all duration-300 animate-fade-in"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pr-1 text-left">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#F8DDA6]">
                  Tersalin
                </span>
                <span className="w-1 h-1 rounded-full bg-stone-500" />
                <span className="text-xs font-medium text-white truncate">
                  {toast.title}
                </span>
              </div>
              <p className="text-[11px] text-[#DADDE0]/90 leading-snug font-light">
                {toast.detail}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Tutup notifikasi"
              className="text-[#DADDE0] hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#7395C0] via-[#AFC9E5] to-[#F8DDA6]" />
          </div>
        )}
      </div>

      {/* Background Photography Backdrop */}
      <div className="absolute inset-0 z-0">
        <EditorialImage
          src={data.giftBackdrop.src}
          alt={data.giftBackdrop.alt}
          objectPosition={data.giftBackdrop.objectPosition || 'center 50%'}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#161D30]/85 backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#161D30]/90 via-[#161D30]/80 to-[#161D30]/95" />
      </div>

      <div className="relative z-10 max-w-sm sm:max-w-md mx-auto w-full">
        {/* Header */}
        <FadeInUp className="text-center mb-10 sm:mb-12">
          <div className="flex justify-center mb-3">
            <FloralCrest className="w-11 h-11 text-[#7395C0]" />
          </div>
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#AFC9E5]/15 border border-[#7395C0]/35 text-[#AFC9E5] text-[10.5px] font-medium tracking-[0.2em] uppercase mb-3">
            <span>Tanda Kasih</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide mb-3">
            Wedding Gift
          </h2>
          <p className="text-xs sm:text-[13px] text-[#DADDE0]/80 leading-relaxed font-light max-w-xs sm:max-w-sm mx-auto">
            Doa restu Anda adalah karunia terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, kami menyediakan amplop digital di bawah ini:
          </p>
        </FadeInUp>

        {/* Digital Bank Account Envelope Cards */}
        <div className="flex flex-col gap-6 sm:gap-8 mb-8">
          {data.giftAccounts.map((acc, idx) => {
            const isCopied = copiedId === acc.id;
            const formattedNumber = formatBankAccount(acc.accountNumber);

            return (
              <FadeInUp key={acc.id} delay={0.1 + idx * 0.1}>
                <div className="bg-gradient-to-br from-[#202A45]/90 to-[#161D30]/90 backdrop-blur-md border border-[#7395C0]/30 rounded-[30px] sm:rounded-[32px] p-6 sm:p-7 shadow-xl relative text-left overflow-hidden group">
                  {/* Top Ambient Hairline Accent */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7395C0] to-transparent" />

                  {/* Card Header: Bank Badge & Chip Motif */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <BankBadge bank={acc.logoType} logoUrl={acc.logoUrl} />
                    <span className="text-[11px] text-[#AFC9E5] font-medium tracking-wider uppercase">
                      {acc.bankName}
                    </span>
                  </div>

                  {/* Account Number Presentation */}
                  <div className="bg-[#161D30]/75 border border-[#7395C0]/25 rounded-2xl p-4 sm:p-5 mb-4">
                    <span className="text-[10.5px] text-[#AFC9E5]/80 uppercase tracking-widest block mb-1.5 font-light">
                      Nomor Rekening:
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-medium text-[#F8DDA6] tracking-wider block tabular-nums select-all drop-shadow-xs">
                      {formattedNumber}
                    </span>
                    <div className="mt-2.5 pt-2.5 border-t border-[#7395C0]/20 flex items-center justify-between">
                      <span className="text-xs sm:text-[12.5px] text-[#DADDE0]/90 font-light">
                        a.n. <strong className="font-medium text-white">{acc.accountHolder}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Single Unified Copy Button */}
                  <button
                    onClick={() => copyToClipboard(acc.id, acc.accountNumber, acc.bankName)}
                    aria-label={`Salin nomor rekening ${acc.bankName}`}
                    data-testid={`copy-account-btn-${acc.id}`}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.98] ${
                      isCopied
                        ? 'bg-emerald-600 text-white border border-emerald-500 shadow-emerald-950/40'
                        : 'bg-gradient-to-r from-[#7395C0] via-[#8bb0dc] to-[#7395C0] hover:brightness-105 text-[#161D30] border border-[#AFC9E5]/60'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Nomor Rekening Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#161D30]" />
                        <span>Salin Nomor Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              </FadeInUp>
            );
          })}
        </div>

        {/* Physical Gift / Address Card */}
        <FadeInUp delay={0.25} className="w-full">
          <div className="bg-gradient-to-br from-[#202A45]/90 to-[#161D30]/90 backdrop-blur-md border border-[#7395C0]/30 rounded-[30px] sm:rounded-[32px] p-6 sm:p-7 shadow-xl text-left relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-3 text-[#F8DDA6]">
              <div className="w-7 h-7 rounded-full bg-[#7395C0]/20 flex items-center justify-center border border-[#7395C0]/30">
                <Gift className="w-4 h-4 text-[#F8DDA6]" />
              </div>
              <h3 className="font-serif text-base sm:text-lg font-normal text-white tracking-wide">
                Kirim Kado Fisik
              </h3>
            </div>
            <p className="text-xs sm:text-[13px] text-[#DADDE0]/80 leading-relaxed font-light mb-4">
              Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan kado fisik langsung ke kediaman mempelai:
            </p>

            <div className="bg-[#161D30]/75 border border-[#7395C0]/25 rounded-2xl p-4 sm:p-5 mb-4 space-y-2 text-xs text-[#DADDE0]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#7395C0] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-medium text-xs sm:text-sm">
                    {data.physicalGiftAddress.recipient}
                  </strong>
                  <span className="text-[#AFC9E5] text-[11px] block mt-0.5 font-light">
                    {data.physicalGiftAddress.phone}
                  </span>
                  <p className="text-[#DADDE0]/85 text-[11px] sm:text-xs leading-relaxed mt-1 font-light">
                    {data.physicalGiftAddress.address}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => copyAddress(`${data.physicalGiftAddress.recipient} (${data.physicalGiftAddress.phone})\n${data.physicalGiftAddress.address}`)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                copiedAddress
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#161D30]/90 hover:bg-[#161D30] text-[#F9F6EE] border-[#7395C0]/40 hover:border-[#AFC9E5]'
              }`}
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Alamat Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#AFC9E5]" />
                  <span>Salin Alamat Lengkap</span>
                </>
              )}
            </button>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
