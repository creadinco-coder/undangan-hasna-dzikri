/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface SectionDividerProps {
  /**
   * Visual theme variant:
   * - 'light': Blue/pastel botanical ornament on light ivory (#F9F6EE) background
   * - 'dark': Luminous blue/pastel ornament on dark navy (#161D30) background
   * - 'transition-dark-to-light': Seamless gradient transition from dark navy (#161D30) to light ivory (#F9F6EE)
   * - 'transition-light-to-dark': Seamless gradient transition from light ivory (#F9F6EE) to dark navy (#161D30)
   */
  variant?: 'light' | 'dark' | 'transition-dark-to-light' | 'transition-light-to-dark';
  /**
   * Optional decorative label or monogram in the center (e.g. 'H & D' or roman numeral)
   */
  label?: string;
  className?: string;
}

export function SectionDivider({
  variant = 'light',
  label,
  className = '',
}: SectionDividerProps) {
  // Determine gradient / background wrapper styling
  let containerBg = 'bg-transparent py-6';
  let lineColor = 'from-transparent via-[#7395C0]/60 to-transparent';
  let iconColor = 'text-[#7395C0]';
  let diamondFill = '#F8DDA6';
  let labelColor = 'text-[#202A45]';

  if (variant === 'dark') {
    containerBg = 'bg-transparent py-6';
    lineColor = 'from-transparent via-[#AFC9E5]/50 to-transparent';
    iconColor = 'text-[#7395C0]';
    diamondFill = '#F8DDA6';
    labelColor = 'text-[#F8DDA6]';
  } else if (variant === 'transition-dark-to-light') {
    // Bridges dark EventSection (#161D30) to light GallerySection (#F9F6EE)
    containerBg = 'w-full py-10 bg-gradient-to-b from-[#161D30] via-[#1c2438] to-[#F9F6EE] relative overflow-hidden';
    lineColor = 'from-[#7395C0]/20 via-[#7395C0]/70 to-[#AFC9E5]/40';
    iconColor = 'text-[#7395C0]';
    diamondFill = '#F8DDA6';
    labelColor = 'text-[#202A45]';
  } else if (variant === 'transition-light-to-dark') {
    containerBg = 'w-full py-10 bg-gradient-to-b from-[#F9F6EE] via-[#1c2438] to-[#161D30] relative overflow-hidden';
    lineColor = 'from-[#AFC9E5]/40 via-[#7395C0]/70 to-[#7395C0]/20';
    iconColor = 'text-[#7395C0]';
    diamondFill = '#F8DDA6';
    labelColor = 'text-[#F8DDA6]';
  }

  return (
    <div
      aria-hidden="true"
      className={`w-full flex flex-col items-center justify-center select-none ${containerBg} ${className}`}
    >
      <div className="w-full max-w-xs mx-auto px-6 flex items-center justify-center gap-3">
        {/* Left Tapered Hairline Rule */}
        <div
          className={`flex-1 h-[1px] bg-gradient-to-r ${
            variant === 'transition-dark-to-light'
              ? 'from-transparent via-[#7395C0]/40 to-[#7395C0]'
              : 'from-transparent via-[#7395C0]/50 to-[#7395C0]'
          }`}
        />

        {/* Minimalist Botanical / Floral Centerpiece */}
        <div className="flex items-center gap-1.5 shrink-0 px-1">
          {/* Left Floral Petal / Sprig */}
          <svg
            viewBox="0 0 32 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-7 h-4 ${iconColor} transition-transform duration-300`}
          >
            <path
              d="M30 9 C22 9 14 5 4 2 C10 6 16 11 26 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Delicate olive leaves */}
            <path
              d="M18 6.5 C16 4 11 4.5 12 7.5 C14 8.5 17 8 18 6.5 Z"
              fill="currentColor"
              opacity="0.85"
            />
            <path
              d="M10 3.5 C8 1.5 5 2.5 6 5 C7.5 5.5 9.5 4.5 10 3.5 Z"
              fill="currentColor"
              opacity="0.7"
            />
            <circle cx="2" cy="2" r="1.2" fill={diamondFill} />
          </svg>

          {/* Central Faceted Diamond or Optional Monogram */}
          {label ? (
            <span
              className={`font-serif text-[11px] uppercase tracking-[0.25em] font-semibold px-1.5 ${labelColor}`}
            >
              {label}
            </span>
          ) : (
            <div className="relative flex items-center justify-center mx-0.5">
              <div
                className="w-2.5 h-2.5 rotate-45 border border-current flex items-center justify-center"
                style={{ borderColor: diamondFill }}
              >
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: diamondFill }}
                />
              </div>
            </div>
          )}

          {/* Right Floral Petal / Sprig (Symmetrical Reflection) */}
          <svg
            viewBox="0 0 32 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-7 h-4 ${iconColor} scale-x-[-1] transition-transform duration-300`}
          >
            <path
              d="M30 9 C22 9 14 5 4 2 C10 6 16 11 26 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Delicate olive leaves */}
            <path
              d="M18 6.5 C16 4 11 4.5 12 7.5 C14 8.5 17 8 18 6.5 Z"
              fill="currentColor"
              opacity="0.85"
            />
            <path
              d="M10 3.5 C8 1.5 5 2.5 6 5 C7.5 5.5 9.5 4.5 10 3.5 Z"
              fill="currentColor"
              opacity="0.7"
            />
            <circle cx="2" cy="2" r="1.2" fill={diamondFill} />
          </svg>
        </div>

        {/* Right Tapered Hairline Rule */}
        <div
          className={`flex-1 h-[1px] bg-gradient-to-r ${
            variant === 'transition-dark-to-light'
              ? 'from-[#7395C0] via-[#7395C0]/40 to-transparent'
              : 'from-[#7395C0] via-[#7395C0]/50 to-transparent'
          }`}
        />
      </div>
    </div>
  );
}
