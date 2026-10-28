/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Royal Botanical Wedding Monogram Crest
 * Ultra-luxury bespoke circular emblem featuring hand-crafted laurel branches,
 * celestial stars, and the couple's 'H & D' monogram.
 */
export function FloralCrest({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="crestGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F8DDA6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F8DDA6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle Central Radiance */}
      <circle cx="60" cy="60" r="44" fill="url(#crestGlow)" />

      {/* Outer Fine Dotted Ring */}
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 3.5"
        strokeOpacity="0.5"
      />

      {/* Primary Concentric Rings */}
      <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.75" />
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* Top Royal Celestial Star */}
      <g transform="translate(60, 15)">
        {/* 8-point Star */}
        <path
          d="M0 -7 L1.5 -2 L6.5 -2 L2.5 1 L4 6 L0 3 L-4 6 L-2.5 1 L-6.5 -2 L-1.5 -2 Z"
          fill="#F8DDA6"
        />
        <circle cx="0" cy="0" r="1.2" fill="#202A45" />
        {/* Micro radiance dots */}
        <circle cx="0" cy="-10" r="0.8" fill="#F8DDA6" />
        <circle cx="0" cy="9" r="0.8" fill="#F8DDA6" />
      </g>

      {/* Symmetrical Botanical Laurel Wreath (Left & Right) */}
      {/* Left Laurel Branch */}
      <g>
        {/* Main stem */}
        <path
          d="M 60 102 C 46 100 24 82 22 58 C 21 42 30 28 48 20"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Olive Leaves Left (Carefully Sculpted Pairs) */}
        {/* Leaf 1 (Top) */}
        <path d="M 44 22 C 38 18 34 22 36 27 C 40 28 44 26 44 22 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 41 27 C 35 27 33 32 37 36 C 41 36 43 32 41 27 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="34" cy="24" r="1.2" fill="#F8DDA6" />

        {/* Leaf 2 (Upper Middle) */}
        <path d="M 33 36 C 26 33 23 38 26 43 C 30 44 33 41 33 36 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 28 42 C 22 43 21 49 26 53 C 30 52 31 47 28 42 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="23" cy="38" r="1.3" fill="#F8DDA6" />

        {/* Leaf 3 (Center) */}
        <path d="M 25 54 C 18 53 17 60 22 64 C 26 64 27 59 25 54 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 24 64 C 19 67 20 74 26 76 C 29 74 29 68 24 64 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="18" cy="59" r="1.4" fill="#F8DDA6" />

        {/* Leaf 4 (Lower Middle) */}
        <path d="M 28 75 C 23 79 26 86 32 87 C 35 84 34 78 28 75 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 33 85 C 30 90 35 96 42 96 C 44 92 41 87 33 85 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="27" cy="81" r="1.3" fill="#F8DDA6" />

        {/* Leaf 5 (Base) */}
        <path d="M 43 95 C 41 100 48 104 54 103 C 55 99 50 95 43 95 Z" fill="currentColor" fillOpacity="0.85" />
      </g>

      {/* Right Laurel Branch */}
      <g>
        {/* Main stem */}
        <path
          d="M 60 102 C 74 100 96 82 98 58 C 99 42 90 28 72 20"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Olive Leaves Right (Carefully Sculpted Pairs) */}
        {/* Leaf 1 (Top) */}
        <path d="M 76 22 C 82 18 86 22 84 27 C 80 28 76 26 76 22 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 79 27 C 85 27 87 32 83 36 C 79 36 77 32 79 27 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="86" cy="24" r="1.2" fill="#F8DDA6" />

        {/* Leaf 2 (Upper Middle) */}
        <path d="M 87 36 C 94 33 97 38 94 43 C 90 44 87 41 87 36 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 92 42 C 98 43 99 49 94 53 C 90 52 89 47 92 42 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="97" cy="38" r="1.3" fill="#F8DDA6" />

        {/* Leaf 3 (Center) */}
        <path d="M 95 54 C 102 53 103 60 98 64 C 94 64 93 59 95 54 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 96 64 C 101 67 100 74 94 76 C 91 74 91 68 96 64 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="102" cy="59" r="1.4" fill="#F8DDA6" />

        {/* Leaf 4 (Lower Middle) */}
        <path d="M 92 75 C 97 79 94 86 88 87 C 85 84 86 78 92 75 Z" fill="currentColor" fillOpacity="0.85" />
        <path d="M 87 85 C 90 90 85 96 78 96 C 76 92 79 87 87 85 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <circle cx="93" cy="81" r="1.3" fill="#F8DDA6" />

        {/* Leaf 5 (Base) */}
        <path d="M 77 95 C 79 100 72 104 66 103 C 65 99 70 95 77 95 Z" fill="currentColor" fillOpacity="0.85" />
      </g>

      {/* Bottom Ribbon / Flourish Knot */}
      <g transform="translate(60, 102)">
        <path
          d="M -8 -1 C -4 3 4 3 8 -1 C 4 -3 -4 -3 -8 -1 Z"
          fill="#F8DDA6"
          stroke="currentColor"
          strokeWidth="0.6"
        />
        <circle cx="0" cy="0" r="1.6" fill="#F8DDA6" />
        <path d="M 0 3 L 2 6 L 0 9 L -2 6 Z" fill="#F8DDA6" />
      </g>

      {/* Center Monogram Typography: 'H & D' */}
      <g id="monogram" textAnchor="middle">
        <text
          x="60"
          y="63"
          fill="#F8DDA6"
          fontFamily="'Cormorant Garamond', 'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontSize="23"
          fontWeight="400"
          letterSpacing="1.5"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        >
          H<tspan fontSize="15" fontStyle="normal" fill="#AFC9E5"> &amp; </tspan>D
        </text>

        {/* Delicate Under-Monogram Gold Accent */}
        <path d="M 52 70 Q 60 72 68 70" stroke="#F8DDA6" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="74" r="1.2" fill="#F8DDA6" />
      </g>
    </svg>
  );
}

/**
 * Luxury Botanical Corner Flourish
 * An intricate, royal corner vignette featuring Art Nouveau acanthus curves,
 * fine scrollwork, celestial starbursts, and gold bead accents.
 * Designed naturally for Top-Left; rotate using Tailwind classes:
 * - Top-Left: ''
 * - Top-Right: 'rotate-90'
 * - Bottom-Right: 'rotate-180'
 * - Bottom-Left: '-rotate-90'
 */
export function FloralCorner({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Delicate Double Border with Inset Corner */}
      <path
        d="M 94 6 L 24 6 C 14 6 6 14 6 24 L 6 94"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      <path
        d="M 86 12 L 26 12 C 18 12 12 18 12 26 L 12 86"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeDasharray="2.5 3"
        strokeOpacity="0.5"
      />

      {/* Corner Apex Accent Starburst */}
      <g transform="translate(18, 18)">
        {/* Outer subtle glow */}
        <circle cx="0" cy="0" r="5" fill="#F8DDA6" fillOpacity="0.2" />
        {/* 4-point Celestial Diamond Star */}
        <path
          d="M 0 -8 C 0.8 -2.5 2.5 -0.8 8 0 C 2.5 0.8 0.8 2.5 0 8 C -0.8 2.5 -2.5 0.8 -8 0 C -2.5 -0.8 -0.8 -2.5 0 -8 Z"
          fill="#F8DDA6"
        />
        {/* Small diagonal secondary flares */}
        <path
          d="M 0 -4.5 C 0.5 -1.5 1.5 -0.5 4.5 0 C 1.5 0.5 0.5 1.5 0 4.5 C -0.5 1.5 -1.5 0.5 -4.5 0 C -1.5 -0.5 -0.5 -1.5 0 -4.5 Z"
          fill="#AFC9E5"
          opacity="0.8"
        />
        <circle cx="0" cy="0" r="1.5" fill="#202A45" />
      </g>

      {/* Horizontal Botanical Leaf Branch & Filigree */}
      <g>
        {/* Curving vine */}
        <path
          d="M 18 18 C 30 15 48 24 68 16 C 76 13 84 14 90 8"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Leaves along horizontal vine */}
        <path d="M 32 15 C 35 10 42 12 40 17 C 37 18 33 17 32 15 Z" fill="currentColor" fillOpacity="0.8" />
        <path d="M 46 20 C 50 15 57 18 54 23 C 50 24 47 22 46 20 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <path d="M 62 17 C 66 11 73 14 70 19 C 67 20 63 19 62 17 Z" fill="currentColor" fillOpacity="0.8" />
        {/* Accent beads */}
        <circle cx="43" cy="13" r="1.2" fill="#F8DDA6" />
        <circle cx="58" cy="19" r="1.2" fill="#F8DDA6" />
        <circle cx="94" cy="6" r="1.8" fill="#F8DDA6" />
      </g>

      {/* Vertical Botanical Leaf Branch & Filigree */}
      <g>
        {/* Curving vine */}
        <path
          d="M 18 18 C 15 30 24 48 16 68 C 13 76 14 84 8 90"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Leaves along vertical vine */}
        <path d="M 15 32 C 10 35 12 42 17 40 C 18 37 17 33 15 32 Z" fill="currentColor" fillOpacity="0.8" />
        <path d="M 20 46 C 15 50 18 57 23 54 C 24 50 22 47 20 46 Z" fill="#AFC9E5" fillOpacity="0.9" />
        <path d="M 17 62 C 11 66 14 73 19 70 C 20 67 19 63 17 62 Z" fill="currentColor" fillOpacity="0.8" />
        {/* Accent beads */}
        <circle cx="13" cy="43" r="1.2" fill="#F8DDA6" />
        <circle cx="19" cy="58" r="1.2" fill="#F8DDA6" />
        <circle cx="6" cy="94" r="1.8" fill="#F8DDA6" />
      </g>

      {/* Inner Elegant Inward Scroll Flourish */}
      <path
        d="M 26 26 C 36 36 46 44 48 56 C 49 63 43 68 37 64 C 32 60 35 52 42 49 C 48 46 58 51 60 58 C 62 66 54 74 46 72"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <circle cx="46" cy="72" r="1.4" fill="#F8DDA6" />
    </svg>
  );
}

export function CoupleIllustration({ type, className = 'w-24 h-24' }: { type: 'groom' | 'bride'; className?: string }) {
  if (type === 'groom') {
    return (
      <div className={`rounded-full overflow-hidden flex items-center justify-center bg-[#F9F6EE] border-2 border-[#7395C0]/50 shadow-inner ${className}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
          <circle cx="50" cy="50" r="48" fill="#F9F6EE" />
          {/* Groom head & neat hair */}
          <ellipse cx="50" cy="38" rx="14" ry="17" fill="#ecd3bf" />
          <path d="M35 34 C35 23 42 18 50 18 C58 18 65 23 65 34 C63 32 59 31 54 31 C47 31 43 32 35 34 Z" fill="#202A45" />
          <path d="M35 34 C33 38 34 42 35 44 C36 41 37 38 37 36 Z" fill="#202A45" />
          {/* Suit jacket & lapels */}
          <path d="M24 88 C24 64 34 56 50 56 C66 56 76 64 76 88 Z" fill="#202A45" />
          {/* White shirt & bowtie */}
          <path d="M42 56 L50 72 L58 56 Z" fill="#ffffff" />
          <path d="M46 60 L54 60 L50 63 Z" fill="#7395C0" />
          <circle cx="50" cy="61.5" r="1.5" fill="#F8DDA6" />
          {/* Boutonniere flower */}
          <circle cx="37" cy="66" r="2.5" fill="#F8DDA6" />
          <path d="M38 68 L41 72" stroke="#7395C0" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center bg-[#F9F6EE] border-2 border-[#7395C0]/50 shadow-inner ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
        <circle cx="50" cy="50" r="48" fill="#F9F6EE" />
        {/* Soft veil backdrop in light blue */}
        <path d="M30 30 C24 45 22 65 20 88 C32 88 68 88 80 88 C78 65 76 45 70 30 Z" fill="#AFC9E5" opacity="0.35" />
        {/* Bride head & elegant updo */}
        <ellipse cx="50" cy="38" rx="13" ry="16" fill="#f0dacf" />
        <path d="M36 34 C36 22 43 19 50 19 C57 19 64 22 64 34 C61 31 55 30 50 30 C45 30 39 31 36 34 Z" fill="#202A45" />
        {/* Hair bun and tiara/floral pins */}
        <circle cx="50" cy="19" r="6" fill="#202A45" />
        <circle cx="46" cy="24" r="1.8" fill="#F8DDA6" />
        <circle cx="50" cy="23" r="2.2" fill="#fff" />
        <circle cx="54" cy="24" r="1.8" fill="#F8DDA6" />
        {/* Elegant wedding dress collar & lace neckline */}
        <path d="M26 88 C26 66 36 58 50 58 C64 58 74 66 74 88 Z" fill="#F9F6EE" stroke="#DADDE0" strokeWidth="1" />
        <path d="M42 58 Q50 68 58 58" fill="#f0dacf" stroke="#DADDE0" strokeWidth="0.8" />
        {/* Pearl necklace */}
        <circle cx="46" cy="62" r="1" fill="#fff" />
        <circle cx="48.5" cy="63.5" r="1" fill="#fff" />
        <circle cx="51.5" cy="63.5" r="1" fill="#fff" />
        <circle cx="54" cy="62" r="1" fill="#fff" />
      </svg>
    </div>
  );
}

export function BankBadge({ bank, logoUrl }: { bank: string; logoUrl?: string }) {
  const resolvedUrl =
    logoUrl ||
    (bank === 'bca'
      ? '/bank/bca.png'
      : bank === 'seabank'
      ? '/bank/seabank.png'
      : undefined);

  if (resolvedUrl) {
    return (
      <div className="h-8 sm:h-8.5 px-3 py-1 rounded-xl bg-white flex items-center justify-center shadow-xs border border-white/20">
        <img
          src={resolvedUrl}
          alt={bank}
          className="h-4.5 sm:h-5 w-auto max-w-[85px] object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  if (bank === 'bca') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#003d79] text-white font-bold text-xs tracking-wider">
        <span>BCA</span>
      </div>
    );
  }
  if (bank === 'mandiri') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#003057] text-[#f5a800] font-bold text-xs tracking-wider">
        <span>MANDIRI</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00529b] text-white font-bold text-xs tracking-wider">
      <span>{bank.toUpperCase()}</span>
    </div>
  );
}
