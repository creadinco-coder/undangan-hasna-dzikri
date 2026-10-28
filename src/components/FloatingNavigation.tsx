/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Users, Calendar, Image as ImageIcon, BookOpen, Gift, Heart, Compass, ClipboardCheck, Sparkles } from 'lucide-react';

interface FloatingNavigationProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isVisible: boolean;
  onReplayPath?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'couple', label: 'Mempelai', icon: Users },
  { id: 'event', label: 'Acara', icon: Calendar },
  { id: 'gallery', label: 'Galeri', icon: ImageIcon },
  { id: 'story', label: 'Cerita', icon: BookOpen },
  { id: 'gift', label: 'Tanda Kasih', icon: Gift },
  { id: 'rsvp', label: 'RSVP Tamu', icon: ClipboardCheck },
  { id: 'closing', label: 'Penutup', icon: Heart },
];

export function FloatingNavigation({
  activeSection,
  onNavigate,
  isVisible,
  onReplayPath,
}: FloatingNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect if a modal dialog (such as Lightbox) is present or active
  useEffect(() => {
    const handleLightboxToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      setIsModalOpen(Boolean(customEvent.detail?.open));
    };

    window.addEventListener('wedding:lightbox-toggle', handleLightboxToggle);
    return () => window.removeEventListener('wedding:lightbox-toggle', handleLightboxToggle);
  }, []);

  if (!isVisible || isModalOpen) return null;

  const handleSelect = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {isOpen && (
        <div
          role="presentation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#161D30]/60 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Expanded Direct-Access Menu */}
      <nav
        aria-label="Navigasi Halaman Undangan"
        className={`fixed z-50 transition-all duration-300 ease-out flex flex-col items-end pb-safe right-4 sm:right-6 md:right-[max(1.25rem,calc(50%-215px+1.25rem))] ${
          isOpen
            ? 'bottom-22 sm:bottom-24 opacity-100 scale-100 pointer-events-auto origin-bottom-right'
            : 'bottom-16 opacity-0 scale-95 pointer-events-none origin-bottom-right'
        }`}
      >
        <div className="bg-[#202A45]/95 border border-[#7395C0]/40 backdrop-blur-md rounded-3xl p-3 shadow-2xl w-64 max-w-[85vw] flex flex-col gap-1">
          <div className="px-3 py-1.5 text-center border-b border-[#7395C0]/20 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#F8DDA6] font-semibold">
              Menu Undangan
            </span>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#7395C0] text-[#161D30] font-bold shadow-xs'
                    : 'text-[#DADDE0] hover:bg-[#161D30]/80 active:bg-[#161D30]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#161D30] text-[#7395C0]' : 'bg-[#161D30]/80 text-[#DADDE0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#161D30]" />
                )}
              </button>
            );
          })}

          {/* Replay Interactive Path Journey */}
          {onReplayPath && (
            <button
              onClick={() => {
                onReplayPath();
                setIsOpen(false);
              }}
              className="mt-1 pt-1.5 border-t border-[#7395C0]/20 flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold text-[#F8DDA6] hover:text-white hover:bg-[#161D30]/80 transition-all text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#161D30] text-[#F8DDA6]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1">Mainkan Jalur Cinta</span>
            </button>
          )}
        </div>
      </nav>

      {/* Floating Circular Trigger Button (Bottom Right) */}
      <div className="fixed z-40 pb-safe right-4 sm:right-6 md:right-[max(1.25rem,calc(50%-215px+1.25rem))] bottom-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 cursor-pointer border ${
            isOpen
              ? 'bg-[#7395C0] text-[#161D30] border-white/60 rotate-90 scale-105'
              : 'bg-[#202A45]/95 text-[#F9F6EE] border-[#7395C0]/60 hover:border-[#F8DDA6] backdrop-blur-md shadow-black/50'
          }`}
          title="Menu Navigasi Undangan"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <div className="flex flex-col items-center">
              <Compass className="w-4 h-4 text-[#7395C0]" />
              <span className="text-[8px] font-medium uppercase tracking-wider text-[#F9F6EE] leading-none mt-0.5">
                Menu
              </span>
            </div>
          )}
        </button>
      </div>
    </>
  );
}
