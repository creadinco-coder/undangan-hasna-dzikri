/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  targetIsoDate?: string;
  title?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export function CountdownTimer({
  targetIsoDate = '2026-11-14T08:00:00+07:00',
  title = 'Menghitung Hari Menuju Akad',
  variant = 'light',
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(targetIsoDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetIsoDate]);

  return (
    <div
      className={`w-full rounded-[24px] p-5 sm:p-6 text-center border shadow-xs ${
        variant === 'dark'
          ? 'bg-[#202A45]/85 backdrop-blur-md border-[#7395C0]/35 text-white shadow-sm'
          : 'bg-white/95 backdrop-blur-md border-[#AFC9E5]/50 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center justify-center gap-2 mb-3.5">
        <span className="w-5 h-[1px] bg-gradient-to-r from-transparent via-[#7395C0]/50 to-[#7395C0]/50" />
        <p
          className={`text-[10px] uppercase tracking-[0.24em] font-medium ${
            variant === 'dark' ? 'text-[#F8DDA6]' : 'text-[#202A45]'
          }`}
        >
          <span>{title}</span>
        </p>
        <span className="w-5 h-[1px] bg-gradient-to-l from-transparent via-[#7395C0]/50 to-[#7395C0]/50" />
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        <div
          className={`rounded-xl p-2.5 sm:p-3 border text-center transition-transform ${
            variant === 'dark'
              ? 'bg-[#161D30]/80 border-[#7395C0]/25'
              : 'bg-[#F9F6EE] border-[#DADDE0]/80'
          }`}
        >
          <span
            className={`block font-serif text-xl sm:text-2xl font-light tabular-nums ${
              variant === 'dark' ? 'text-[#F9F6EE]' : 'text-[#202A45]'
            }`}
          >
            {timeLeft.days}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-[#7395C0] font-medium uppercase tracking-wider">
            Hari
          </span>
        </div>

        <div
          className={`rounded-xl p-2.5 sm:p-3 border text-center transition-transform ${
            variant === 'dark'
              ? 'bg-[#161D30]/80 border-[#7395C0]/25'
              : 'bg-[#F9F6EE] border-[#DADDE0]/80'
          }`}
        >
          <span
            className={`block font-serif text-xl sm:text-2xl font-light tabular-nums ${
              variant === 'dark' ? 'text-[#F9F6EE]' : 'text-[#202A45]'
            }`}
          >
            {timeLeft.hours}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-[#7395C0] font-medium uppercase tracking-wider">
            Jam
          </span>
        </div>

        <div
          className={`rounded-xl p-2.5 sm:p-3 border text-center transition-transform ${
            variant === 'dark'
              ? 'bg-[#161D30]/80 border-[#7395C0]/25'
              : 'bg-[#F9F6EE] border-[#DADDE0]/80'
          }`}
        >
          <span
            className={`block font-serif text-xl sm:text-2xl font-light tabular-nums ${
              variant === 'dark' ? 'text-[#F9F6EE]' : 'text-[#202A45]'
            }`}
          >
            {timeLeft.minutes}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-[#7395C0] font-medium uppercase tracking-wider">
            Menit
          </span>
        </div>

        <div
          className={`rounded-xl p-2.5 sm:p-3 border text-center transition-transform ${
            variant === 'dark'
              ? 'bg-[#161D30]/80 border-[#7395C0]/25'
              : 'bg-[#F9F6EE] border-[#DADDE0]/80'
          }`}
        >
          <span
            className={`block font-serif text-xl sm:text-2xl font-light tabular-nums ${
              variant === 'dark' ? 'text-[#F9F6EE]' : 'text-[#202A45]'
            }`}
          >
            {timeLeft.seconds}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-[#7395C0] font-medium uppercase tracking-wider">
            Detik
          </span>
        </div>
      </div>
    </div>
  );
}
