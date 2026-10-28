/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { WeddingInvitationData } from '../data/invitationData.ts';
import { FloralCrest, FloralCorner } from './WeddingDecorativeAssets.tsx';
import { FadeInUp } from './FadeInUp.tsx';
import { EditorialImage } from './EditorialImage.tsx';

interface ClosingSectionProps {
  data: WeddingInvitationData;
  onScrollToTop?: () => void;
}

export function ClosingSection({ data }: ClosingSectionProps) {
  return (
    <section
      id="closing"
      className="w-full min-h-[100dvh] flex flex-col justify-between items-center text-center px-5 sm:px-8 py-20 sm:py-28 relative overflow-hidden bg-[#161D30] text-white pb-32"
    >
      {/* Full-bleed Emotional Finale Couple Photograph */}
      <div className="absolute inset-0 z-0">
        <EditorialImage
          src={data.closingPhoto.src}
          alt={data.closingPhoto.alt}
          objectPosition={data.closingPhoto.objectPosition || 'center 25%'}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover scale-105"
        />
        {/* Editorial multi-stop luxury gradient overlay for maximum legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#161D30]/90 via-[#161D30]/75 to-[#161D30]/95 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#161D30]/40 to-[#161D30]/80 pointer-events-none" />
      </div>

      {/* Decorative corners */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 text-[#7395C0]/40 pointer-events-none z-10">
        <FloralCorner className="w-10 h-10 sm:w-14 sm:h-14" />
      </div>
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 text-[#7395C0]/40 pointer-events-none rotate-90 z-10">
        <FloralCorner className="w-10 h-10 sm:w-14 sm:h-14" />
      </div>

      {/* Main Closing Editorial Card */}
      <div className="max-w-sm sm:max-w-md mx-auto w-full pt-4 relative z-10 my-auto">
        <FadeInUp>
          {/* Top Seal / Monogram */}
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-[#F8DDA6]/35 bg-gradient-to-b from-[#202A45]/90 to-[#161D30]/90 backdrop-blur-md flex items-center justify-center p-2 shadow-xl ring-2 ring-white/5">
              <FloralCrest className="w-full h-full text-[#F8DDA6]" />
            </div>
          </div>

          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#7395C0]/35 text-[#F8DDA6] text-[10px] tracking-[0.2em] uppercase font-medium mb-3">
            <span>Ungkapan Syukur &amp; Doa Restu</span>
          </div>

          <h2 className="font-serif italic text-2xl sm:text-3xl text-[#F9F6EE] font-light mb-5 tracking-wide drop-shadow-sm">
            Terima Kasih
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="text-center relative mb-8 px-2 sm:px-4">
            <p className="font-serif italic text-base sm:text-lg text-[#F8DDA6] mb-3 drop-shadow-md">
              {data.closingMessage.greeting}
            </p>

            <p className="text-xs sm:text-[13px] text-[#DADDE0]/90 leading-relaxed mb-6 font-light max-w-xs sm:max-w-sm mx-auto drop-shadow-sm">
              {data.closingMessage.paragraph}
            </p>

            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#7395C0]/60 to-transparent mx-auto mb-5" />

            {/* Ilustrasi Avatar Mempelai */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-radial from-[#F8DDA6]/25 to-transparent blur-md pointer-events-none" />
                <img
                  src="/icon_game.webp"
                  alt="Hasna & Dzikri"
                  className="relative w-32 h-32 sm:w-32 sm:h-32 object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#AFC9E5] mb-2 font-light drop-shadow-xs">
              Kami yang berbahagia,
            </p>

            <p className="font-serif italic text-3xl sm:text-4xl text-[#F9F6EE] font-light tracking-wide mb-2 drop-shadow-md">
              Hasna <span className="text-[#F8DDA6] font-serif not-italic">&amp;</span> Dzikri
            </p>

            <p className="text-xs text-[#DADDE0]/80 italic font-light tracking-wide drop-shadow-xs">
              beserta seluruh keluarga besar kedua mempelai
            </p>
          </div>
        </FadeInUp>

      </div>

      {/* Footer copyright */}
      <div className="pt-8 text-[11px] text-[#DADDE0]/70 relative z-10 space-y-2 w-full max-w-md mx-auto border-t border-white/5">
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#F9F6EE]/90 font-serif italic">
          <span>Hasna</span>
          <Heart className="w-3 h-3 text-[#F8DDA6] fill-[#F8DDA6] inline" />
          <span>Dzikri</span>
        </div>
        <p className="text-[10px] tracking-wider uppercase text-[#DADDE0]/50 font-light">
          © 2026 The Wedding of Hasna &amp; Dzikri · All Rights Reserved
        </p>
        <p className="text-[11px] text-[#DADDE0]/60 font-light pt-0.5">
          Crafted by{' '}
          <a
            href="https://creadin.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#AFC9E5] hover:text-[#F8DDA6] underline underline-offset-2 transition-colors font-medium"
          >
            creadin.co
          </a>
        </p>
      </div>
    </section>
  );
}
