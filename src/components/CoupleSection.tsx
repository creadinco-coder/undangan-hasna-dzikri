/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Instagram, Sparkles } from 'lucide-react';
import { FloralCrest } from './WeddingDecorativeAssets.tsx';
import { WeddingInvitationData } from '../data/invitationData.ts';
import { FadeInUp } from './FadeInUp.tsx';
import { EditorialImage } from './EditorialImage.tsx';
import { CountdownTimer } from './CountdownTimer.tsx';

interface CoupleSectionProps {
  data: WeddingInvitationData;
}

export function CoupleSection({ data }: CoupleSectionProps) {
  return (
    <section
      id="couple"
      aria-label="Profil Kedua Mempelai"
      className="w-full min-h-[100dvh] flex flex-col justify-center px-5 sm:px-8 py-20 sm:py-28 relative overflow-hidden bg-wedding-pattern"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-[#AFC9E5]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-[#F8DDA6]/20 blur-3xl pointer-events-none" />

      {/* Countdown to Akad Nikah (Menghitung Hari Menuju Akad) */}
      <FadeInUp className="max-w-sm sm:max-w-md mx-auto w-full mb-10 sm:mb-12 relative z-10" duration={0.6}>
        <CountdownTimer
          targetIsoDate={data.events[0]?.startDateIso || '2026-11-14T08:00:00+07:00'}
          title="Menghitung Hari Menuju Akad"
          variant="light"
        />
      </FadeInUp>

      {/* Header with Bismillah & Quranic Verse */}
      <FadeInUp className="text-center max-w-sm sm:max-w-md mx-auto mb-12 sm:mb-14" duration={0.6}>
        <div className="flex justify-center mb-3">
          <FloralCrest className="w-12 h-12 text-[#7395C0] drop-shadow-xs" />
        </div>
        <p className="font-serif italic text-base sm:text-lg text-[#7395C0] font-normal mb-1.5">
          Bismillahirrohmanirrohim
        </p>
        <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] text-[#202A45] font-medium mb-3">
          Assalamu’alaikum Warahmatullahi Wabarakatuh
        </p>
        <p className="text-xs sm:text-[13px] text-[#202A45]/75 leading-relaxed font-light mb-6 px-2">
          Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:
        </p>

        {/* Verse Card with Refined Arch Style & Airy Padding */}
        <div className="bg-white/95 backdrop-blur-md border border-[#AFC9E5]/50 rounded-[28px] p-6 sm:p-7 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#7395C0] to-transparent" />
          <p className="font-arabic text-base sm:text-lg text-[#202A45] leading-[2.3] mb-3 text-center" dir="rtl">
            {data.quranVerse.arabic}
          </p>
          <p className="text-xs sm:text-[12.5px] text-[#202A45]/80 italic leading-relaxed font-light mb-2.5 px-2">
            {data.quranVerse.translation}
          </p>
          <p className="text-[10px] text-[#7395C0] font-medium tracking-widest uppercase">
            {data.quranVerse.source}
          </p>
        </div>
      </FadeInUp>

      {/* Modern Arch Frame Couple Profiles */}
      <div className="max-w-sm sm:max-w-md mx-auto w-full flex flex-col gap-8 sm:gap-10">
        {/* ==================== THE BRIDE (Mempelai Wanita) ==================== */}
        <FadeInUp delay={0.1} duration={0.6}>
          <div className="bg-white/95 backdrop-blur-md border border-[#7395C0]/25 rounded-[32px] p-6 sm:p-8 shadow-xs relative group hover:shadow-md transition-shadow">
            {/* Top Badge */}
            <div className="text-center mb-5">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#AFC9E5]/25 border border-[#7395C0]/35 text-[10px] font-medium uppercase tracking-[0.24em] text-[#202A45]">
                <span>The Bride</span>
              </span>
            </div>

            {/* Modern Arch Window Photo Frame */}
            <div className="w-full max-w-[240px] sm:max-w-[250px] mx-auto mb-6">
              <div className="p-1.5 rounded-t-full rounded-b-2xl border-2 border-[#7395C0]/45 bg-gradient-to-b from-[#AFC9E5]/30 via-white/80 to-[#F9F6EE] shadow-sm">
                <div className="relative aspect-[3/4] w-full rounded-t-full rounded-b-xl overflow-hidden bg-stone-100">
                  <EditorialImage
                    src={data.bride.photoUrl}
                    alt={data.bride.photoAlt}
                    aspectRatio="portrait"
                    objectPosition={data.bride.photoObjectPosition || 'center 20%'}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 rounded-t-full rounded-b-xl shadow-inner pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="text-center flex flex-col items-center">
              <h2 className="font-serif text-2xl sm:text-[28px] font-normal text-[#202A45] tracking-wide leading-tight mb-1">
                {data.bride.shortName}
              </h2>
              <p className="font-serif italic text-sm sm:text-base text-[#7395C0] font-medium mb-3">
                {data.bride.fullName}
              </p>

              {/* Delicate Hairline Divider */}
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#7395C0]/60 to-transparent mb-3.5" />

              <p className={`text-xs sm:text-[12.5px] text-[#202A45]/80 leading-relaxed font-light ${data.bride.bio ? 'mb-3' : 'mb-5'} max-w-xs px-2`}>
                {data.bride.parentInfo}
              </p>

              {data.bride.bio && (
                <p className="text-xs text-[#202A45]/70 italic leading-relaxed font-light mb-5 max-w-xs px-2">
                  &ldquo;{data.bride.bio}&rdquo;
                </p>
              )}

              {data.bride.instagram && (
                <a
                  href={`https://instagram.com/${data.bride.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#202A45] hover:text-[#161D30] bg-[#AFC9E5]/20 hover:bg-[#AFC9E5]/35 px-4 py-1.5 rounded-full transition-all border border-[#7395C0]/35 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer font-medium"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#7395C0]" />
                  <span>{data.bride.instagram}</span>
                </a>
              )}
            </div>
          </div>
        </FadeInUp>

        {/* ==================== Connecting Monogram Ornament ==================== */}
        <FadeInUp delay={0.2} duration={0.5} className="flex items-center justify-center gap-3 my-2 z-20">
          <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#7395C0]/60 to-[#7395C0]/60" />
          <div className="w-11 h-11 rounded-full bg-[#202A45] border border-[#7395C0]/50 flex items-center justify-center shadow-md transform hover:rotate-12 transition-transform">
            <span className="font-serif italic text-lg font-light text-[#F8DDA6]">&amp;</span>
          </div>
          <div className="h-[1px] w-14 bg-gradient-to-l from-transparent via-[#7395C0]/60 to-[#7395C0]/60" />
        </FadeInUp>

        {/* ==================== THE GROOM (Mempelai Pria) ==================== */}
        <FadeInUp delay={0.25} duration={0.6}>
          <div className="bg-white/95 backdrop-blur-md border border-[#7395C0]/25 rounded-[32px] p-6 sm:p-8 shadow-xs relative group hover:shadow-md transition-shadow">
            {/* Top Badge */}
            <div className="text-center mb-5">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#AFC9E5]/25 border border-[#7395C0]/35 text-[10px] font-medium uppercase tracking-[0.24em] text-[#202A45]">
                <span>The Groom</span>
              </span>
            </div>

            {/* Modern Arch Window Photo Frame */}
            <div className="w-full max-w-[240px] sm:max-w-[250px] mx-auto mb-6">
              <div className="p-1.5 rounded-t-full rounded-b-2xl border border-[#7395C0]/40 bg-gradient-to-b from-[#AFC9E5]/25 via-white/80 to-[#F9F6EE] shadow-sm">
                <div className="relative aspect-[3/4] w-full rounded-t-full rounded-b-xl overflow-hidden bg-stone-100">
                  <EditorialImage
                    src={data.groom.photoUrl}
                    alt={data.groom.photoAlt}
                    aspectRatio="portrait"
                    objectPosition={data.groom.photoObjectPosition || 'center 18%'}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 rounded-t-full rounded-b-xl shadow-inner pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="text-center flex flex-col items-center">
              <h2 className="font-serif text-2xl sm:text-[28px] font-normal text-[#202A45] tracking-wide leading-tight mb-1">
                {data.groom.shortName}
              </h2>
              <p className="font-serif italic text-sm sm:text-base text-[#7395C0] font-medium mb-3">
                {data.groom.fullName}
              </p>

              {/* Delicate Hairline Divider */}
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#7395C0]/60 to-transparent mb-3.5" />

              <p className={`text-xs sm:text-[12.5px] text-[#202A45]/80 leading-relaxed font-light ${data.groom.bio ? 'mb-3' : 'mb-5'} max-w-xs px-2`}>
                {data.groom.parentInfo}
              </p>

              {data.groom.bio && (
                <p className="text-xs text-[#202A45]/70 italic leading-relaxed font-light mb-5 max-w-xs px-2">
                  &ldquo;{data.groom.bio}&rdquo;
                </p>
              )}

              {data.groom.instagram && (
                <a
                  href={`https://instagram.com/${data.groom.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#202A45] hover:text-[#161D30] bg-[#AFC9E5]/20 hover:bg-[#AFC9E5]/35 px-4 py-1.5 rounded-full transition-all border border-[#7395C0]/35 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer font-medium"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#7395C0]" />
                  <span>{data.groom.instagram}</span>
                </a>
              )}
            </div>
          </div>
        </FadeInUp>

      </div>
    </section>
  );
}
