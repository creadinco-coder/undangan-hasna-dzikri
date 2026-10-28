/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CalendarPlus,
} from 'lucide-react';
import { WeddingInvitationData } from '../data/invitationData.ts';
import { generateGoogleCalendarUrl } from '../utils/invitationUtils.ts';
import { FloralCrest } from './WeddingDecorativeAssets.tsx';
import { FadeInUp } from './FadeInUp.tsx';
import { EditorialImage } from './EditorialImage.tsx';

interface EventSectionProps {
  data: WeddingInvitationData;
}

export function EventSection({ data }: EventSectionProps) {
  return (
    <section
      id="event"
      aria-label="Rangkaian Acara Pernikahan"
      className="w-full min-h-[100dvh] flex flex-col justify-center px-5 sm:px-8 py-20 sm:py-28 relative overflow-hidden bg-[#161D30] text-white"
    >
      {/* Full-bleed Venue / Architectural Photographic Backdrop */}
      <div className="absolute inset-0 z-0">
        <EditorialImage
          src={data.eventBackdrop.src}
          alt={data.eventBackdrop.alt}
          objectPosition={data.eventBackdrop.objectPosition || 'center 40%'}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
        />
        {/* Contrast protective overlays for legibility */}
        <div className="absolute inset-0 bg-[#161D30]/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#161D30] via-[#161D30]/75 to-[#161D30]" />
      </div>

      <div className="relative z-10 max-w-sm sm:max-w-md mx-auto w-full">
        {/* Header */}
        <FadeInUp className="text-center mb-10 sm:mb-12">
          <div className="flex justify-center mb-3">
            <FloralCrest className="w-12 h-12 text-[#7395C0]" />
          </div>
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#AFC9E5]/20 border border-[#7395C0]/35 text-[#AFC9E5] text-[10px] font-medium tracking-[0.24em] uppercase mb-2.5">
            <span>Rangkaian Acara</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide mt-1 mb-2.5">
            Waktu &amp; Lokasi
          </h2>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#202A45]/80 border border-[#7395C0]/35 text-[#F8DDA6] text-xs font-serif tracking-wider mb-3 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#7395C0]" />
            <span className="font-light">{data.weddingDateDisplay}</span>
          </div>
          <p className="text-xs sm:text-[13px] text-[#DADDE0]/80 leading-relaxed font-light max-w-sm mx-auto mb-2">
            Dengan penuh rasa syukur, kami mengundang Anda untuk hadir pada hari istimewa kami:
          </p>
        </FadeInUp>

        {/* Event Cards: Akad & Resepsi with Luxury Pass Aesthetic */}
        <div className="flex flex-col gap-8 sm:gap-10">
          {data.events.map((evt, idx) => {
            const googleCalendarUrl = generateGoogleCalendarUrl({
              title: `${evt.name} ${data.bride.shortName} & ${data.groom.shortName}`,
              startDate: evt.startDateIso,
              endDate: evt.endDateIso,
              venue: evt.venue,
              address: evt.address,
              description: `Pernikahan ${data.bride.fullName} & ${data.groom.fullName} (${evt.name})`,
            });

            return (
              <FadeInUp key={evt.id} delay={0.15 + idx * 0.1}>
                <div className="bg-[#202A45]/90 backdrop-blur-md border border-[#7395C0]/30 rounded-[32px] p-6 sm:p-8 shadow-xl relative text-left overflow-hidden group">
                  {/* Top Ambient Glow Line */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#7395C0] to-transparent" />

                  {/* Event Header: Event Name & Timezone */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-white tracking-wide">
                      {evt.name}
                    </h3>
                    <span className="text-[10px] sm:text-[10.5px] text-[#AFC9E5]/90 font-light tracking-wide bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                      Zona WIB
                    </span>
                  </div>

                  {/* Elegant Date & Time Presentation Block */}
                  <div className="bg-[#161D30]/85 border border-[#7395C0]/25 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner">
                    <div className="flex items-center gap-3.5">
                      {/* Date Block */}
                      <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#202A45] to-[#161D30] border border-[#7395C0]/40 rounded-xl w-14 h-16 shrink-0 shadow-sm text-center px-1">
                        <span className="text-[9px] uppercase tracking-widest text-[#F8DDA6] font-bold">
                          {evt.day}
                        </span>
                        <span className="font-serif text-2xl font-bold text-white leading-none my-0.5">
                          {evt.date.trim().split(/\s+/)[0] || '28'}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-[#AFC9E5] font-medium">
                          {(evt.date.trim().split(/\s+/)[1] || 'Nov').slice(0, 3)}
                        </span>
                      </div>

                      {/* Long-form Date & Time */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#AFC9E5] font-semibold mb-0.5">
                          <Calendar className="w-3 h-3 text-[#7395C0] shrink-0" />
                          <span>Hari &amp; Tanggal</span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-white tracking-wide">
                          {evt.day}, {evt.date}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-[#DADDE0]">
                          <Clock className="w-3.5 h-3.5 text-[#7395C0] shrink-0" />
                          <span className="font-medium text-stone-200">{evt.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Venue & Location details */}
                    <div className="mt-3.5 pt-3 border-t border-[#7395C0]/25 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#7395C0] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-white font-medium text-xs sm:text-sm leading-snug">
                          {evt.venue}
                        </strong>
                        <span className="text-[#DADDE0] text-[11px] leading-relaxed block mt-0.5">
                          {evt.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Google Maps (Secondary) & Simpan ke Google Kalender (Highlighted) */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-3.5 border-t border-[#7395C0]/25">
                    {/* Secondary Action: Google Maps */}
                    <a
                      href={evt.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-3 px-2 sm:px-3 rounded-xl bg-[#161D30]/90 hover:bg-[#161D30] text-[#F9F6EE] text-xs font-medium transition-all border border-[#7395C0]/40 hover:border-[#AFC9E5] shadow-xs active:scale-[0.98] cursor-pointer text-center"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#AFC9E5] shrink-0" />
                      <span className="truncate">Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-[#AFC9E5]/60 shrink-0" />
                    </a>

                    {/* Highlighted Primary Action: Simpan ke Google Kalender */}
                    <a
                      href={googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Simpan ke Google Kalender"
                      className="flex items-center justify-center gap-1.5 py-3 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-[#7395C0] via-[#8bb0dc] to-[#7395C0] hover:brightness-105 text-[#161D30] text-xs font-semibold transition-all shadow-md active:scale-[0.98] border border-[#AFC9E5]/60 cursor-pointer text-center"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#161D30] shrink-0" />
                      <span className="truncate">
                        <span className="hidden min-[380px]:inline">Simpan ke </span>Google Kalender
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#161D30]/60 shrink-0" />
                    </a>
                  </div>
                </div>
              </FadeInUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
