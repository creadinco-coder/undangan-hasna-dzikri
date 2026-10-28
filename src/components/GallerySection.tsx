/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pause,
  Play,
  Hand,
} from 'lucide-react';
import { WeddingInvitationData, GalleryItem } from '../data/invitationData.ts';
import { FloralCrest } from './WeddingDecorativeAssets.tsx';
import { FadeInUp } from './FadeInUp.tsx';
import { EditorialImage } from './EditorialImage.tsx';

interface GallerySectionProps {
  data: WeddingInvitationData;
}

interface DraggableMarqueeTrackProps {
  items: GalleryItem[];
  direction: 'left' | 'right';
  baseSpeed: number;
  isGlobalPaused: boolean;
  speedMultiplier: 'normal' | 'slow';
  widthClass: string;
  aspectClass: string;
  trackId: string;
  onOpenLightbox: (item: GalleryItem) => void;
}

function DraggableMarqueeTrack({
  items,
  direction,
  baseSpeed,
  isGlobalPaused,
  speedMultiplier,
  widthClass,
  aspectClass,
  trackId,
  onOpenLightbox,
}: DraggableMarqueeTrackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Position & physics references for zero-layout-thrashing GPU animation
  const currentXRef = useRef<number>(0);
  const halfWidthRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const animFrameIdRef = useRef<number | null>(null);
  const inertiaRafRef = useRef<number | null>(null);
  const [isCurrentlyDragging, setIsCurrentlyDragging] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Replicate array exactly 2 times for seamless mathematical wrap
  // Reduces DOM nodes and image decoding overhead by 50% compared to 4x!
  const repeatedItems = useMemo(() => [...items, ...items], [items]);

  // Apply GPU hardware-accelerated transform directly without triggering React re-renders
  const applyTransform = useCallback((x: number) => {
    if (stripRef.current) {
      stripRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  }, []);

  // IntersectionObserver: Only animate when track is in or near the viewport!
  // Saves 100% CPU/GPU cycles when user is on Cover, Mempelai, Acara, RSVP, etc.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure and cache halfWidth once on mount and upon resize (NO layout thrashing in RAF loop!)
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const updateWidth = () => {
      const fullWidth = strip.scrollWidth;
      if (fullWidth > 0) {
        const half = fullWidth / 2;
        halfWidthRef.current = half;
        // Initialize position based on direction
        if (direction === 'right' && currentXRef.current === 0) {
          currentXRef.current = -half;
          applyTransform(-half);
        }
      }
    };

    updateWidth();
    const t1 = setTimeout(updateWidth, 150);
    const t2 = setTimeout(updateWidth, 600);

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(strip);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
    };
  }, [items, direction, applyTransform]);

  // Continuous buttery smooth auto-sliding via GPU transform
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = Math.min(50, timestamp - lastTimestamp) / 1000; // in seconds
      lastTimestamp = timestamp;

      const halfWidth = halfWidthRef.current;

      // Only run auto-scroll if visible in viewport, not paused, not dragging, and not in momentum glide
      if (
        isVisible &&
        !isGlobalPaused &&
        !isDraggingRef.current &&
        !inertiaRafRef.current &&
        !document.hidden &&
        halfWidth > 0
      ) {
        // Speed in pixels per second: ~45px/s normal, ~26px/s slow
        const speed = baseSpeed * 50 * (speedMultiplier === 'normal' ? 1 : 0.58);

        if (direction === 'left') {
          currentXRef.current -= speed * delta;
          if (currentXRef.current <= -halfWidth) {
            currentXRef.current += halfWidth;
          }
        } else {
          currentXRef.current += speed * delta;
          if (currentXRef.current >= 0) {
            currentXRef.current -= halfWidth;
          }
        }

        applyTransform(currentXRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isVisible, direction, baseSpeed, isGlobalPaused, speedMultiplier, applyTransform]);

  // Unified Pointer Drag Engine (Touch & Mouse with Inertial Momentum)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0) return;

    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsCurrentlyDragging(true);

    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    dragStartXRef.current = currentXRef.current;
    velocityRef.current = 0;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 8) {
      velocityRef.current = (e.clientX - lastXRef.current) / dt; // px/ms
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }

    const halfWidth = halfWidthRef.current;
    if (halfWidth > 0) {
      let nextX = dragStartXRef.current + deltaX;
      while (nextX <= -halfWidth) nextX += halfWidth;
      while (nextX > 0) nextX -= halfWidth;

      currentXRef.current = nextX;
      applyTransform(nextX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsCurrentlyDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Momentum glide if released with swipe flick
    const halfWidth = halfWidthRef.current;
    let v = velocityRef.current;

    if (Math.abs(v) > 2.2) {
      v = Math.sign(v) * 2.2;
    }

    if (Math.abs(v) > 0.12 && halfWidth > 0) {
      let lastInertiaTime = performance.now();
      const glide = (time: number) => {
        const dt = Math.min(32, time - lastInertiaTime);
        lastInertiaTime = time;

        v *= Math.pow(0.92, dt / 16.67);
        currentXRef.current += v * dt;

        while (currentXRef.current <= -halfWidth) currentXRef.current += halfWidth;
        while (currentXRef.current > 0) currentXRef.current -= halfWidth;

        applyTransform(currentXRef.current);

        if (Math.abs(v) > 0.025 && !isDraggingRef.current) {
          inertiaRafRef.current = requestAnimationFrame(glide);
        } else {
          inertiaRafRef.current = null;
        }
      };
      inertiaRafRef.current = requestAnimationFrame(glide);
    }
  };

  // Smooth ease-out cubic animation for nudge buttons
  const handleNudge = (nudgeDirection: 'left' | 'right') => {
    const halfWidth = halfWidthRef.current;
    if (halfWidth <= 0) return;

    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
    }

    const distance = nudgeDirection === 'left' ? -220 : 220;
    const startX = currentXRef.current;
    const duration = 400; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      let cur = startX + distance * ease;

      while (cur <= -halfWidth) cur += halfWidth;
      while (cur > 0) cur -= halfWidth;

      currentXRef.current = cur;
      applyTransform(cur);

      if (progress < 1) {
        inertiaRafRef.current = requestAnimationFrame(step);
      } else {
        inertiaRafRef.current = null;
      }
    };

    inertiaRafRef.current = requestAnimationFrame(step);
  };

  // Card Tap Handler
  const handleCardClick = (item: GalleryItem) => {
    if (hasDraggedRef.current) {
      return;
    }
    onOpenLightbox(item);
  };

  return (
    <div ref={containerRef} className="w-full relative group/track py-1 overflow-hidden select-none">
      {/* Floating Manual Navigation Arrows on Track */}
      <button
        onClick={() => handleNudge('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#202A45]/80 hover:bg-[#202A45] text-[#F9F6EE] backdrop-blur-md border border-[#7395C0]/50 shadow-lg flex items-center justify-center opacity-0 group-hover/track:opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer pointer-events-auto"
        aria-label="Geser ke kiri"
        title="Geser ke kiri"
      >
        <ChevronLeft className="w-5 h-5 text-[#7395C0]" />
      </button>

      <button
        onClick={() => handleNudge('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#202A45]/80 hover:bg-[#202A45] text-[#F9F6EE] backdrop-blur-md border border-[#7395C0]/50 shadow-lg flex items-center justify-center opacity-0 group-hover/track:opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer pointer-events-auto"
        aria-label="Geser ke kanan"
        title="Geser ke kanan"
      >
        <ChevronRight className="w-5 h-5 text-[#7395C0]" />
      </button>

      {/* Marquee Track Mask Container */}
      <div className="w-full marquee-mask overflow-hidden py-1">
        {/* GPU Hardware-Accelerated Strip (pan-y allows effortless vertical document scroll) */}
        <div
          ref={stripRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`flex gap-3.5 px-4 will-change-transform ${
            isCurrentlyDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            touchAction: 'pan-y',
            backfaceVisibility: 'hidden',
          }}
          data-testid={`draggable-track-${trackId}`}
        >
          {repeatedItems.map((item, idx) => {
            return (
              <div
                key={`${trackId}-${item.id}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(item);
                  }
                }}
                aria-label={`Foto ${idx + 1}`}
                className={`group/card relative shrink-0 ${widthClass} ${aspectClass} rounded-2xl overflow-hidden shadow-sm border border-[#DADDE0] hover:border-[#7395C0] bg-[#161D30]/20 transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] select-none text-left cursor-pointer`}
              >
                {/* Pure Photography with Async Decoding for Zero-Jank Rendering */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                  <img
                    src={item.src}
                    alt={item.alt || 'Foto Galeri'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105 pointer-events-none select-none"
                    style={{ objectPosition: item.objectPosition || 'center' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function GallerySection({ data }: GallerySectionProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<'normal' | 'slow'>('normal');

  // Track 1 items and Track 2 items (reversed order for visual asymmetry)
  const track1Items = data.gallery;
  const track2Items = [...data.gallery].reverse();

  const openLightbox = (item: GalleryItem) => {
    const index = data.gallery.findIndex((g) => g.id === item.id);
    if (index !== -1) {
      setSelectedItemIndex(index);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wedding:lightbox-toggle', { detail: { open: true } }));
    }
  };

  const closeLightbox = useCallback(() => {
    setSelectedItemIndex(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wedding:lightbox-toggle', { detail: { open: false } }));
    }
  }, []);

  const nextPhoto = useCallback(() => {
    setSelectedItemIndex((prev) => (prev !== null ? (prev + 1) % data.gallery.length : null));
  }, [data.gallery.length]);

  const prevPhoto = useCallback(() => {
    setSelectedItemIndex((prev) =>
      prev !== null ? (prev - 1 + data.gallery.length) % data.gallery.length : null
    );
  }, [data.gallery.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedItemIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, closeLightbox, nextPhoto, prevPhoto]);

  // Touch gesture support for swipe in lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      nextPhoto(); // swiped left
    } else if (diff < -50) {
      prevPhoto(); // swiped right
    }
    setTouchStartX(null);
  };

  const activeItem = selectedItemIndex !== null ? data.gallery[selectedItemIndex] : null;

  return (
    <section
      id="gallery"
      aria-label="Galeri Foto Prewedding dan Momen Bahagia"
      className="w-full min-h-[100dvh] flex flex-col justify-center py-20 sm:py-28 relative overflow-hidden bg-wedding-pattern"
    >
      {/* Decorative floral background aura */}
      <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-[#AFC9E5]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-60 h-60 rounded-full bg-[#F8DDA6]/20 blur-3xl pointer-events-none" />

      {/* Section Header */}
      <FadeInUp className="max-w-sm sm:max-w-md mx-auto w-full text-center px-5 sm:px-8 mb-8 sm:mb-10 relative z-10">
        <div className="flex justify-center mb-3">
          <FloralCrest className="w-12 h-12 text-[#7395C0]" />
        </div>
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#AFC9E5]/25 border border-[#7395C0]/35 text-[#202A45] text-[10px] font-medium tracking-[0.24em] uppercase mb-2.5">
          <span>Potret Kebersamaan</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#202A45] tracking-wide mb-2.5">
          Galeri Foto
        </h2>
        <p className="text-xs sm:text-[13px] text-[#202A45]/75 leading-relaxed font-light max-w-sm mx-auto mb-3">
          Momen-momen indah yang kami abadikan dalam lembaran perjalanan cinta menuju hari bahagia.
        </p>

        {/* Gestures hint badge */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#202A45]/5 border border-[#DADDE0]/80 text-[10px] text-[#202A45]/70 font-light">
          <Hand className="w-3 h-3 text-[#7395C0]" />
          <span>Geser bebas dengan jari / mouse · Putar otomatis tetap berjalan</span>
        </div>
      </FadeInUp>

      {/* Dual Draggable & Auto-Scrolling Marquee Slider Tracks */}
      <div className="w-full relative space-y-3.5 sm:space-y-4">
        {/* Track 1: Moving left automatically, draggable in both directions */}
        <DraggableMarqueeTrack
          trackId="top"
          items={track1Items}
          direction="left"
          baseSpeed={0.85}
          isGlobalPaused={isPaused || selectedItemIndex !== null}
          speedMultiplier={speedMultiplier}
          widthClass="w-[185px] sm:w-[210px]"
          aspectClass="aspect-[3/4]"
          onOpenLightbox={openLightbox}
        />

        {/* Track 2: Moving right automatically, draggable in both directions */}
        <DraggableMarqueeTrack
          trackId="bottom"
          items={track2Items}
          direction="right"
          baseSpeed={0.85}
          isGlobalPaused={isPaused || selectedItemIndex !== null}
          speedMultiplier={speedMultiplier}
          widthClass="w-[205px] sm:w-[235px]"
          aspectClass="aspect-[4/3]"
          onOpenLightbox={openLightbox}
        />
      </div>

      {/* Interactive Controls & Status Bar */}
      <div className="max-w-sm mx-auto w-full px-4 mt-5 flex flex-col items-center gap-2 relative z-10">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#DADDE0] px-3.5 py-1.5 rounded-full shadow-xs text-xs text-[#202A45]">
          {/* Pause / Play toggle button */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[#202A45] hover:text-[#161D30] px-2 py-0.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label={isPaused ? 'Jalankan putaran otomatis galeri' : 'Jeda putaran otomatis galeri'}
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-[#7395C0] fill-current" />
                <span>Lanjutkan Auto-Slide</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-[#7395C0] fill-current" />
                <span>Jeda Auto-Slide</span>
              </>
            )}
          </button>

          <span className="text-[#DADDE0]">|</span>

          {/* Speed toggle */}
          <button
            onClick={() => setSpeedMultiplier((prev) => (prev === 'normal' ? 'slow' : 'normal'))}
            className="text-[11px] font-medium text-[#202A45]/80 hover:text-[#202A45] px-2 py-0.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
            title="Ubah kecepatan putaran"
          >
            {speedMultiplier === 'normal' ? 'Kecepatan: Normal' : 'Kecepatan: Santai'}
          </button>
        </div>

        <p className="text-[10px] text-[#202A45]/70 italic text-center">
          *Ketuk foto untuk ukuran penuh · Anda bebas menggeser galeri kapan saja
        </p>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && selectedItemIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Galeri: ${activeItem.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-[#161D30]/95 backdrop-blur-md flex flex-col justify-between p-4"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Lightbox Header */}
            {/* Lightbox Header - Minimalist Photo Counter & Close */}
            <div className="flex items-center justify-between text-white pt-safe z-10 w-full max-w-md mx-auto">
              <span className="text-xs tracking-wider text-[#AFC9E5] font-medium bg-[#202A45]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#7395C0]/40">
                Foto {selectedItemIndex + 1} dari {data.gallery.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-[#202A45]/80 hover:bg-[#202A45] border border-[#7395C0]/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Tutup preview galeri"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Center Content - Pure Full Resolution Photo */}
            <div
              className="my-auto max-w-md mx-auto w-full relative flex flex-col items-center justify-center py-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full rounded-2xl bg-[#202A45] border border-[#7395C0]/30 overflow-hidden shadow-2xl text-center flex items-center justify-center">
                <div
                  className={`w-full ${
                    activeItem.aspectRatio === 'portrait'
                      ? 'aspect-[3/4] max-h-[75vh]'
                      : 'aspect-[4/3] max-h-[65vh]'
                  } relative overflow-hidden bg-[#161D30] mx-auto flex items-center justify-center`}
                >
                  <EditorialImage
                    src={activeItem.src}
                    alt={activeItem.alt || 'Foto Galeri'}
                    priority={true}
                    objectPosition={activeItem.objectPosition || 'center'}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#202A45]/90 hover:bg-[#202A45] border border-[#7395C0]/40 text-[#7395C0] flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-20"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-6 h-6 text-[#7395C0]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#202A45]/90 hover:bg-[#202A45] border border-[#7395C0]/40 text-[#7395C0] flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-20"
                aria-label="Foto selanjutnya"
              >
                <ChevronRight className="w-6 h-6 text-[#7395C0]" />
              </button>
            </div>

            {/* Lightbox Footer */}
            <div className="text-center pb-safe text-[#DADDE0] text-xs">
              <span>Usap atau ketuk panah untuk berpindah · Sentuh di luar untuk menutup</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
