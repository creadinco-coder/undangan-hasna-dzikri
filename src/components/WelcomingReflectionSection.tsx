/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { FloralCrest, FloralCorner } from './WeddingDecorativeAssets.tsx';
import { EditorialImage } from './EditorialImage.tsx';

interface WelcomingReflectionSectionProps {
  guestName?: string;
  photoUrl?: string;
  photoAlt?: string;
  weddingDate?: string;
}

export function WelcomingReflectionSection({
  guestName = '',
  photoUrl = '/photo/cover.webp',
  photoAlt = 'Potret Cover Pernikahan Hasna Najwa Sabrina & Dzikri Amrulloh',
  weddingDate = 'Sabtu, 14 November 2026',
}: WelcomingReflectionSectionProps) {
  const scrollToNext = () => {
    const coupleEl = document.getElementById('couple');
    if (coupleEl) {
      coupleEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="reflection"
      aria-label="The Wedding of Hasna & Dzikri"
      className="w-full relative min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col justify-between items-center text-center overflow-hidden bg-[#161D30] select-none"
    >
      {/* 1. Full-screen Fit-to-screen Photography Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <EditorialImage
          src={photoUrl}
          alt={photoAlt}
          priority={true}
          objectPosition="center 32%"
          className="w-full h-full"
          imgClassName="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-[12000ms] ease-out will-change-transform"
        />

        {/* Cinematic Vignette Layers */}
        {/* Top Vignette */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#161D30]/80 via-[#161D30]/30 to-transparent pointer-events-none" />

        {/* Deep Bottom Vignette for Optimum Text Contrast */}
        <div className="absolute bottom-0 inset-x-0 h-[65%] bg-gradient-to-t from-[#161D30] via-[#161D30]/85 via-50% to-transparent pointer-events-none" />

        {/* Radial Depth Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#161D30]/20 to-[#161D30]/50 pointer-events-none" />
      </div>

      {/* Decorative Golden Corner Filigrees on Screen Edges */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[#7395C0]/50 pointer-events-none z-10">
        <FloralCorner className="w-11 h-11 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#7395C0]/50 pointer-events-none rotate-90 z-10">
        <FloralCorner className="w-11 h-11 sm:w-14 sm:h-14" />
      </div>

      {/* 2. Top Header Elements */}
      <div className="relative z-10 pt-6 sm:pt-10 px-4 flex flex-col items-center animate-fade-in">
        <div className="mb-2">
          <FloralCrest className="w-11 h-11 sm:w-13 sm:h-13 text-[#7395C0] drop-shadow-md" />
        </div>

        {/* Guest Personalized Greeting Glass Pill */}
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#202A45]/80 backdrop-blur-md border border-[#7395C0]/40 text-[#F9F6EE] text-[10px] sm:text-[11px] font-medium shadow-lg">
          <span>
            Kepada Yth. <strong className="text-white font-semibold">{guestName || 'Bapak/Ibu/Saudara/i'}</strong>
          </span>
        </div>
      </div>

      {/* 3. Bottom Typography - Modern Editorial Minimalist */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-6 sm:px-8 pb-10 sm:pb-14 flex flex-col items-center animate-fade-in">
        {/* Editorial Floating Typography Directly Over Vignette */}
        <div className="w-full relative px-2 py-2 flex flex-col items-center text-center">
          {/* Subtitle with Flanking Fine Hairlines */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-2">
            <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent via-[#AFC9E5]/50 to-[#AFC9E5]" />
            <p className="text-[10px] sm:text-[11px] font-serif uppercase tracking-[0.32em] text-[#AFC9E5] font-medium drop-shadow-xs">
              The Wedding of
            </p>
            <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent via-[#AFC9E5]/50 to-[#AFC9E5]" />
          </div>

          {/* Main Couple Names in Clean, High-Fashion Luxury Serif Typography */}
          <h1 className="font-serif text-[28px] sm:text-[34px] font-light tracking-wide text-[#F9F6EE] drop-shadow-md leading-snug my-2 flex items-center justify-center flex-wrap">
            <span>Hasna</span>
            <span className="text-[#F8DDA6] italic font-serif mx-2 sm:mx-2.5 text-2xl sm:text-[28px] font-light opacity-95">
              &amp;
            </span>
            <span>Dzikri</span>
          </h1>

          {/* Fine Ornamental Divider */}
          <div className="flex items-center justify-center gap-2.5 my-2 opacity-75">
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent via-[#7395C0] to-[#7395C0]" />
            <span className="text-[#F8DDA6] text-[7px] transform rotate-45">◆</span>
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent via-[#7395C0] to-[#7395C0]" />
          </div>

          {/* Wedding Date */}
          <p className="text-[#DADDE0]/90 text-[10px] sm:text-[11px] font-serif tracking-[0.24em] uppercase font-light drop-shadow-xs">
            {weddingDate}
          </p>
        </div>

        {/* Scroll Prompt to Next Section */}
        <button
          onClick={scrollToNext}
          className="mt-4 sm:mt-5 inline-flex flex-col items-center gap-1.5 text-[#AFC9E5]/90 hover:text-white transition-colors cursor-pointer group"
          aria-label="Gulir ke profil kedua mempelai"
        >
          <span className="text-[9.5px] sm:text-[10px] tracking-[0.22em] uppercase font-medium text-[#DADDE0]/80 drop-shadow-xs group-hover:text-white transition-colors">
            Mengenal Mempelai
          </span>
          <div className="w-8 h-8 rounded-full bg-[#202A45]/70 hover:bg-[#202A45] backdrop-blur-md border border-[#7395C0]/40 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-[#AFC9E5] transition-all">
            <ChevronDown className="w-4 h-4 text-[#7395C0] group-hover:text-[#F8DDA6] animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}

// Named alias for convenience
export const HeroPhotoEngravedSection = WelcomingReflectionSection;
