/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { VolumeX, Music } from 'lucide-react';

interface AudioControllerProps {
  shouldStart: boolean;
}

const STORAGE_KEY = 'wedding_bg_music_muted';
const MUSIC_SRC = '/music/Celestial%20Invitation.mp3';

export function AudioController({ shouldStart }: AudioControllerProps) {
  // Read persisted mute preference; default to false (enabled on invitation open)
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and handle playback when shouldStart or isMuted changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.65;

    if (shouldStart && !isMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay policy prevented playback until explicit user interaction
            setIsPlaying(false);
          });
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [shouldStart, isMuted]);

  // Synchronize playing state with native audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Toggle user audio preference and persist to localStorage
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // storage disabled or quota exceeded
      }
    } else {
      setIsMuted(false);
      try {
        localStorage.setItem(STORAGE_KEY, 'false');
      } catch {
        // storage disabled
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }

    // Briefly show visual feedback
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2400);
  };

  return (
    <>
      {/* HTML5 Audio element for background music */}
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        playsInline
      />

      {shouldStart && (
        <div
          className="fixed z-40 pb-safe right-[18px] sm:right-[26px] md:right-[max(1.35rem,calc(50%-215px+1.35rem))] bottom-[82px] sm:bottom-[88px] flex items-center gap-2"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Floating Status Pill - floats to the left of the audio button */}
          {showTooltip && (
            <div
              role="status"
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#202A45]/95 text-[#F9F6EE] border border-[#7395C0]/40 backdrop-blur-md shadow-xl animate-fade-in flex items-center gap-1.5 whitespace-nowrap"
            >
              <Music className={`w-3 h-3 ${isPlaying ? 'text-[#7395C0] animate-pulse' : 'text-[#DADDE0]'}`} />
              <span>{isPlaying ? 'Celestial Invitation' : 'Musik Hening'}</span>
            </div>
          )}

          {/* Visual Audio Toggle Button with persistent state */}
          <button
            onClick={toggleAudio}
            aria-label={isPlaying ? 'Heningkan musik latar' : 'Putar musik latar belakang'}
            aria-pressed={isPlaying}
            data-testid="audio-toggle-button"
            className={`relative group w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
              isPlaying
                ? 'bg-[#202A45]/90 text-[#7395C0] border-2 border-[#7395C0] shadow-[#7395C0]/30 backdrop-blur-md hover:scale-105 active:scale-95'
                : 'bg-[#202A45]/90 text-[#DADDE0] border border-[#7395C0]/40 backdrop-blur-md hover:bg-[#161D30] hover:text-white hover:scale-105 active:scale-95'
            }`}
            title={isPlaying ? 'Klik untuk mematikan musik latar' : 'Klik untuk memutar musik latar (Celestial Invitation)'}
          >
            {isPlaying ? (
              <div className="flex items-center justify-center">
                {/* Spinning decorative ring */}
                <span
                  className="absolute inset-0 rounded-full border border-[#7395C0]/40 animate-spin-slow pointer-events-none"
                  style={{ animationDuration: '8s' }}
                />
                {/* Equalizer Wave Bars in Primary Blue */}
                <div className="flex items-end gap-[2px] h-4">
                  <span className="w-[2.5px] bg-[#7395C0] rounded-full animate-bounce h-2.5" style={{ animationDelay: '0ms' }} />
                  <span className="w-[2.5px] bg-[#7395C0] rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
                  <span className="w-[2.5px] bg-[#7395C0] rounded-full animate-bounce h-3" style={{ animationDelay: '300ms' }} />
                  <span className="w-[2.5px] bg-[#7395C0] rounded-full animate-bounce h-2" style={{ animationDelay: '75ms' }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-[#DADDE0] group-hover:text-white transition-colors">
                <VolumeX className="w-5 h-5" />
              </div>
            )}
          </button>
        </div>
      )}
    </>
  );
}
