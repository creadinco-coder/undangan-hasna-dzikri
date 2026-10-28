/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MailOpen } from 'lucide-react';
import { FloralCrest, FloralCorner } from './WeddingDecorativeAssets.tsx';
import { WeddingInvitationData } from '../data/invitationData.ts';
import { EditorialImage } from './EditorialImage.tsx';
import { AmbientGoldenSparkles } from './AmbientGoldenSparkles.tsx';

interface InvitationCoverProps {
  data: WeddingInvitationData;
  guestName: string;
  onOpenInvitation: () => void;
  isOpen: boolean;
}

export function InvitationCover({
  data,
  guestName,
  onOpenInvitation,
  isOpen,
}: InvitationCoverProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Clean guest name & determine whether opened as specific guest or general
  const cleanName = (guestName || '').trim();
  const isGeneral =
    !cleanName ||
    cleanName.toLowerCase() === 'tamu' ||
    cleanName.toLowerCase() === 'guest';
  const recipientName = isGeneral ? 'Bapak / Ibu / Saudara / i' : cleanName;

  const handleOpen = () => {
    setIsPressed(true);
    setIsAnimating(true);
    // Allow animation to run smoothly before fully revealing underlying content
    setTimeout(() => {
      onOpenInvitation();
    }, 750);
  };

  // If already opened and animation completed, remove from layout
  if (isOpen && !isAnimating) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end items-center text-center p-4 sm:p-6 overflow-hidden transition-all duration-700 ease-in-out select-none ${isAnimating
        ? '-translate-y-full opacity-0 scale-105 pointer-events-none'
        : 'translate-y-0 opacity-100 scale-100'
        }`}
      style={{ height: '100dvh', minHeight: '100dvh', maxHeight: '100dvh' }}
    >
      {/* Full-bleed photography background with cinematic ambient breathing and zoom on open */}
      <div
        className={`absolute inset-0 transition-transform duration-1000 ease-out ${isAnimating ? 'scale-115 blur-xs' : 'scale-100'
          }`}
      >
        <div className="w-full h-full animate-ken-burns">
          <EditorialImage
            src={data.heroCover.src}
            alt={data.heroCover.alt}
            priority={true}
            objectPosition={data.heroCover.objectPosition || 'center 30%'}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover"
          />
        </div>

        {/* Multi-stop editorial vignette: soft at top to showcase illustration, deep at bottom for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#161D30]/40 via-transparent via-40% to-[#161D30]/95 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#161D30]/45 pointer-events-none" />
      </div>

      {/* Floating Ethereal Golden Stardust & Embers */}
      <AmbientGoldenSparkles />

      {/* Decorative filigree corners with soft twinkle */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[#7395C0]/50 pointer-events-none z-10 transition-opacity duration-1000">
        <FloralCorner className="w-11 h-11 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#7395C0]/50 pointer-events-none rotate-90 z-10 transition-opacity duration-1000">
        <FloralCorner className="w-11 h-11 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-[#7395C0]/50 pointer-events-none -rotate-90 z-10 transition-opacity duration-1000">
        <FloralCorner className="w-11 h-11 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-[#7395C0]/50 pointer-events-none rotate-180 z-10 transition-opacity duration-1000">
        <FloralCorner className="w-11 h-11 sm:w-14 sm:h-14" />
      </div>

      {/* Bottom Content Area: Wedding Title & Monogram, Guest Box, and CTA Button */}
      <div className="w-full max-w-sm sm:max-w-md pb-safe pb-6 sm:pb-8 relative z-10 px-6 sm:px-8 flex flex-col items-center animate-fade-in mt-auto">
        {/* Crest & Monogram Header (Directly above guest name box) */}
        <div className="flex flex-col items-center mb-4 sm:mb-5">
          <div className="mb-2 transform hover:scale-105 transition-transform duration-300">
            <FloralCrest className="w-11 h-11 sm:w-12 sm:h-12 text-[#F8DDA6] drop-shadow-md" />
          </div>

          {/* Subtitle with Flanking Fine Hairlines */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-1.5">
            <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-r from-transparent via-[#AFC9E5]/50 to-[#AFC9E5]" />
            <p className="text-[10px] sm:text-[11px] font-serif uppercase tracking-[0.32em] text-[#AFC9E5] font-medium drop-shadow-xs">
              The Wedding of
            </p>
            <span className="h-[1px] w-6 sm:w-8 bg-gradient-to-l from-transparent via-[#AFC9E5]/50 to-[#AFC9E5]" />
          </div>

          {/* Main Couple Initials in Clean, High-Fashion Luxury Serif Typography (Restrained Scale) */}
          <h1 className="font-serif text-[28px] sm:text-[34px] font-normal tracking-[0.16em] text-[#F9F6EE] drop-shadow-md leading-tight my-1.5 flex items-center justify-center">
            <span>H</span>
            <span className="text-[#F8DDA6] italic font-serif mx-2.5 sm:mx-3 text-2xl sm:text-[28px] font-light opacity-95 animate-twinkle inline-block">
              &amp;
            </span>
            <span>D</span>
          </h1>

          {/* Fine Ornamental Divider */}
          <div className="flex items-center justify-center gap-2.5 my-1.5 opacity-75">
            <span className="h-[1px] w-8 sm:w-10 bg-gradient-to-r from-transparent via-[#7395C0] to-[#7395C0]" />
            <span className="text-[#F8DDA6] text-[7px] transform rotate-45 animate-pulse">◆</span>
            <span className="h-[1px] w-8 sm:w-10 bg-gradient-to-l from-transparent via-[#7395C0] to-[#7395C0]" />
          </div>

          {/* Wedding Date */}
          <p className="text-[#DADDE0]/90 text-[10px] sm:text-[11px] font-serif tracking-[0.24em] uppercase font-light drop-shadow-xs">
            {data.weddingDateDisplay}
          </p>
        </div>

        {/* Guest Invitation Card (Double-Framed Luxury Stationery Plaque) */}
        <div className="w-full bg-[#182035]/85 backdrop-blur-xl border border-[#7395C0]/35 hover:border-[#F8DDA6]/40 transition-colors duration-300 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl mb-4 text-center relative overflow-hidden group ring-1 ring-white/5">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F8DDA6]/40 to-transparent" />

          {/* Inner Inset Framed Plaque */}
          <div className="border border-[#7395C0]/25 rounded-xl sm:rounded-2xl px-4 py-3 sm:py-3.5 bg-gradient-to-b from-white/[0.03] via-transparent to-black/10 relative">
            {/* Top Recipient Honorific: "Kepada Yth." flanked by gold hairlines */}
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#F8DDA6]/70" />
              <p className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.28em] text-[#F8DDA6] font-medium drop-shadow-xs">
                Kepada Yth.
              </p>
              <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#F8DDA6]/70" />
            </div>

            {/* Recipient Name in Dignified Editorial Serif */}
            <div className="text-xl sm:text-2xl font-serif text-[#F9F6EE] font-normal tracking-wide px-2 drop-shadow-xs leading-snug break-words my-1">
              {recipientName}
            </div>

            {/* Courtesy Note / Location */}
            <p className="text-[9.5px] sm:text-[10px] text-[#DADDE0]/65 italic font-light tracking-wide mt-1">
              {isGeneral ? 'di Tempat' : '*Mohon maaf bila ada kesalahan penulisan nama/gelar'}
            </p>
          </div>
        </div>

        {/* Primary CTA: Buka Undangan with Pulsing Radar Ring & Shimmer Sweep */}
        <div className="w-full relative">
          <button
            onClick={handleOpen}
            disabled={isAnimating}
            className={`w-full h-12 rounded-xl bg-gradient-to-r from-[#7395C0] via-[#8bb0dc] to-[#7395C0] hover:brightness-110 text-[#161D30] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-black/40 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden border border-[#AFC9E5]/70 animate-pulse-ring ${isPressed ? 'scale-95 brightness-125' : ''
              }`}
            aria-label="Buka Undangan Pernikahan"
          >
            {/* Shimmer Light Bar traveling across button */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Pulsing Micro-Floating Envelope Icon */}
            <MailOpen className="w-4 h-4 text-[#161D30] animate-envelope-float transition-transform group-hover:scale-110" />

            <span className="tracking-[0.16em] uppercase text-xs font-semibold drop-shadow-xs">
              Buka Undangan
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
