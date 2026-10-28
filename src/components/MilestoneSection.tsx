/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Heart, Compass, Gem, Calendar } from 'lucide-react';
import { WeddingInvitationData } from '../data/invitationData.ts';
import { FloralCrest } from './WeddingDecorativeAssets.tsx';
import { FadeInUp } from './FadeInUp.tsx';

interface MilestoneSectionProps {
  data: WeddingInvitationData;
}

export function MilestoneSection({ data }: MilestoneSectionProps) {
  const getIconForStep = (idx: number) => {
    switch (idx) {
      case 0:
        return <Compass className="w-3.5 h-3.5 text-[#7395C0]" />;
      case 1:
        return <Compass className="w-3.5 h-3.5 text-[#7395C0]" />;
      case 2:
        return <Heart className="w-3.5 h-3.5 text-[#7395C0]" />;
      case 3:
        return <Gem className="w-3.5 h-3.5 text-[#7395C0]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#7395C0]" />;
    }
  };

  const getChapterName = (idx: number) => {
    const chapters = ['Bagian I', 'Bagian II', 'Bagian III', 'Bagian IV', 'Bagian V'];
    return chapters[idx] || `Bagian ${idx + 1}`;
  };

  return (
    <section
      id="story"
      aria-label="Kisah Perjalanan Cinta"
      className="w-full flex flex-col justify-center px-5 sm:px-8 py-20 sm:py-28 relative overflow-hidden bg-wedding-pattern"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-[#AFC9E5]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-64 h-64 rounded-full bg-[#F8DDA6]/20 blur-3xl pointer-events-none" />

      {/* Section Header */}
      <FadeInUp className="max-w-sm sm:max-w-md mx-auto w-full text-center mb-12 sm:mb-14 relative z-10">
        <div className="flex justify-center mb-3">
          <FloralCrest className="w-11 h-11 text-[#7395C0] drop-shadow-xs" />
        </div>
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#AFC9E5]/25 border border-[#7395C0]/35 text-[#202A45]/90 text-[10.5px] font-medium tracking-[0.2em] uppercase mb-3">
          <span>Perjalanan Cinta</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#202A45] tracking-wide mb-3">
          Kisah Kami
        </h2>
        <p className="text-xs sm:text-[13px] text-[#202A45]/75 leading-relaxed font-light max-w-xs sm:max-w-sm mx-auto">
          Setiap bagian cerita adalah untaian takdir indah yang menuntun langkah kami menuju ikatan suci.
        </p>
      </FadeInUp>

      {/* Storybook Editorial Timeline */}
      <div className="max-w-sm sm:max-w-md mx-auto w-full relative z-10">
        {/* Continuous Gradient Timeline Spine */}
        <div className="absolute left-4 sm:left-5 top-4 bottom-4 w-[1.5px] -translate-x-1/2 bg-gradient-to-b from-[#7395C0]/80 via-[#AFC9E5] to-[#7395C0]/80" />

        <div className="space-y-10 sm:space-y-12">
          {data.milestones.map((ms, idx) => (
            <FadeInUp key={ms.id} delay={0.1 + idx * 0.1}>
              <div className="relative pl-11 sm:pl-14 text-left group">
                {/* Timeline Marker Medallion (Centered precisely on the spine line) */}
                <div className="absolute left-4 sm:left-5 top-3.5 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F9F6EE] border border-[#7395C0]/70 flex items-center justify-center shadow-xs z-10 group-hover:scale-110 group-hover:bg-[#202A45] group-hover:text-white transition-all">
                  {getIconForStep(idx)}
                </div>

                {/* Editorial Story Card (Typography & Narrative Focus - No Photo) */}
                <div className="bg-white/95 backdrop-blur-md border border-[#7395C0]/25 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
                  {/* Subtle Top Gradient Accent */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#7395C0]/40 to-transparent" />

                  {/* Header Row: Chapter & Tag + Period */}
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <span className="text-[10px] uppercase font-medium tracking-wider text-[#7395C0] bg-[#AFC9E5]/25 px-2.5 py-1 rounded-full border border-[#7395C0]/35">
                      {getChapterName(idx)} · {ms.tag}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#202A45]/75 bg-stone-100 border border-stone-200/80 px-2.5 py-0.5 rounded-md">
                      <Calendar className="w-3 h-3 text-[#7395C0]" />
                      <span>{ms.period}</span>
                    </span>
                  </div>

                  {/* Text Narrative Content */}
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-[#202A45] mb-2 leading-snug tracking-wide">
                      {ms.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#202A45]/80 leading-relaxed font-light italic">
                      &ldquo;{ms.story}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
