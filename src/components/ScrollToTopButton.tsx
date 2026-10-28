/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ScrollToTopButton({ isVisible, onClick }: ScrollToTopButtonProps) {
  return (
    <div
      className={`fixed z-40 pb-safe left-4 sm:left-6 md:left-[max(1.25rem,calc(50%-215px+1.25rem))] bottom-6 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        onClick={onClick}
        aria-label="Kembali ke atas"
        title="Kembali ke atas"
        className="group w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 cursor-pointer border bg-[#202A45]/90 hover:bg-[#202A45] text-[#F9F6EE] border-[#7395C0]/50 hover:border-[#F8DDA6] backdrop-blur-md hover:shadow-lg hover:shadow-[#7395C0]/25 hover:scale-105"
      >
        <ChevronUp className="w-5 h-5 text-[#F8DDA6] group-hover:-translate-y-0.5 transition-transform duration-200" />
      </button>
    </div>
  );
}
