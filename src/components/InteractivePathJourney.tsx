/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  FastForward,
  Lock,
} from 'lucide-react';
import { WeddingInvitationData } from '../data/invitationData.ts';
import { FloralCrest, FloralCorner } from './WeddingDecorativeAssets.tsx';
import { EditorialImage } from './EditorialImage.tsx';
import { AmbientGoldenSparkles } from './AmbientGoldenSparkles.tsx';
import {
  playWaypointChime,
  playDragTickSound,
  playCelebrationFanfare,
} from '../utils/audioEffects.ts';

interface InteractivePathJourneyProps {
  data: WeddingInvitationData;
  guestName: string;
  onComplete: (targetSectionId?: string) => void;
  onSkip: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Segment {
  start: Point;
  end: Point;
  length: number;
  direction: 'down' | 'right' | 'left' | 'up';
}

interface WaypointConfig {
  id: number;
  vertexIndex: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  style: React.CSSProperties;
}

export function InteractivePathJourney({
  data,
  guestName,
  onComplete,
  onSkip,
}: InteractivePathJourneyProps) {
  // SVG ViewBox coordinate system: 0 0 380 620
  // Elongated orthogonal winding path to provide generous breathing space:
  // P0 (Start): (65, 35)
  // P1 (Turn 1): (65, 140)  -> Turn Right
  // P2 (Turn 2): (315, 140) -> Turn Down
  // P3 (Turn 3): (315, 275) -> Turn Left
  // P4 (Turn 4): (65, 275)  -> Turn Down
  // P5 (Turn 5): (65, 430)  -> Turn Right
  // P6 (Turn 6): (315, 430) -> Turn Down
  // P7 (Finish): (315, 575) -> Finish Point
  const POINTS: Point[] = useMemo(
    () => [
      { x: 65, y: 35 }, // 0: Start
      { x: 65, y: 140 }, // 1: Belokan 1 (Mempelai)
      { x: 315, y: 140 }, // 2: Belokan 2 (Save the Date)
      { x: 315, y: 275 }, // 3: Belokan 3 (Akad Nikah)
      { x: 65, y: 275 }, // 4: Belokan 4 (Resepsi)
      { x: 65, y: 430 }, // 5: Belokan 5 (Doa & Kasih)
      { x: 315, y: 430 }, // 6: Belokan 6 (Pintu Gerbang)
      { x: 315, y: 575 }, // 7: Finish Point
    ],
    []
  );

  // Segments geometry calculation
  const segments: Segment[] = useMemo(() => {
    const list: Segment[] = [];
    for (let i = 0; i < POINTS.length - 1; i++) {
      const p1 = POINTS[i];
      const p2 = POINTS[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      let direction: 'down' | 'right' | 'left' | 'up' = 'down';
      if (dy > 0 && dx === 0) direction = 'down';
      else if (dx > 0 && dy === 0) direction = 'right';
      else if (dx < 0 && dy === 0) direction = 'left';
      else if (dy < 0 && dx === 0) direction = 'up';
      list.push({ start: p1, end: p2, length, direction });
    }
    return list;
  }, [POINTS]);

  const totalLength = useMemo(() => {
    return segments.reduce((sum, s) => sum + s.length, 0);
  }, [segments]);

  // Cumulative distance for each vertex
  const vertexDistances = useMemo(() => {
    const dists = [0];
    let acc = 0;
    for (const s of segments) {
      acc += s.length;
      dists.push(acc);
    }
    return dists;
  }, [segments]);

  // Persistent Waypoints Configuration:
  // Badges have been removed as requested. Each card cleanly displays the title and subtitle.
  // Cards are positioned with generous vertical spacing so they never feel cramped.
  const WAYPOINTS: WaypointConfig[] = useMemo(
    () => [
      {
        id: 1,
        vertexIndex: 1, // Belokan 1 (65, 140)
        title: 'Hasna & Dzikri',
        subtitle: 'Dua hati bersatu dalam ikatan suci nan abadi',
        icon: Heart,
        style: {
          left: '23%',
          top: '8.5%',
          width: '71%',
        },
      },
      {
        id: 2,
        vertexIndex: 2, // Belokan 2 (315, 140)
        title: data.weddingDateDisplay,
        subtitle: 'Hitung hari menuju momen sakral',
        icon: Calendar,
        style: {
          left: '16%',
          top: '25.0%',
          width: '62%',
        },
      },
      {
        id: 3,
        vertexIndex: 3, // Belokan 3 (315, 275)
        title: 'Akad: 08.00 – 10.30 WIB',
        subtitle: 'Kediaman Mempelai Wanita, Majalaya',
        icon: Clock,
        style: {
          left: '16%',
          top: '34.7%',
          width: '62%',
        },
      },
      {
        id: 4,
        vertexIndex: 4, // Belokan 4 (65, 275)
        title: 'Resepsi: 11.00 – 15.00 WIB',
        subtitle: 'Kediaman Mempelai Wanita, Majalaya',
        icon: MapPin,
        style: {
          left: '23%',
          top: '47.8%',
          width: '71%',
        },
      },
      {
        id: 5,
        vertexIndex: 5, // Belokan 5 (65, 430)
        title: 'Doa Restu & Kehadiran',
        subtitle: 'Pelengkap kebahagiaan dan berkah kami',
        icon: Sparkles,
        style: {
          left: '23%',
          top: '58.0%',
          width: '71%',
        },
      },
    ],
    [data.weddingDateDisplay]
  );

  // State
  const [currentDist, setCurrentDist] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [unlockedWaypoints, setUnlockedWaypoints] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const currentDistRef = useRef<number>(0);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasTriggeredCompleteRef = useRef<boolean>(false);

  // Sync ref with state
  useEffect(() => {
    currentDistRef.current = currentDist;
  }, [currentDist]);

  // Convert distance along path to (x, y) coordinates
  const currentPos = useMemo<Point>(() => {
    let d = currentDist;
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (d <= s.length || i === segments.length - 1) {
        const ratio = s.length === 0 ? 0 : Math.min(1, Math.max(0, d / s.length));
        return {
          x: s.start.x + (s.end.x - s.start.x) * ratio,
          y: s.start.y + (s.end.y - s.start.y) * ratio,
        };
      }
      d -= s.length;
    }
    return POINTS[POINTS.length - 1];
  }, [currentDist, segments, POINTS]);

  // Current segment index
  const activeSegmentIndex = useMemo(() => {
    for (let i = 0; i < segments.length; i++) {
      if (currentDist < vertexDistances[i + 1] || i === segments.length - 1) {
        return i;
      }
    }
    return segments.length - 1;
  }, [currentDist, segments.length, vertexDistances]);

  // Direction arrow for current segment
  const currentDirection = useMemo(() => {
    const s = segments[activeSegmentIndex];
    return s ? s.direction : 'down';
  }, [segments, activeSegmentIndex]);

  // Progress percentage (0 to 100)
  const progressPercent = useMemo(() => {
    return Math.min(100, Math.round((currentDist / totalLength) * 100));
  }, [currentDist, totalLength]);

  // Check waypoints and unlock them permanently as distance advances
  const checkWaypoints = useCallback(
    (dist: number) => {
      WAYPOINTS.forEach((wp) => {
        const triggerDist = vertexDistances[wp.vertexIndex] - 6;
        if (dist >= triggerDist) {
          setUnlockedWaypoints((prev) => {
            if (!prev.has(wp.id)) {
              const next = new Set(prev);
              next.add(wp.id);
              // Play crystal audio chime for this checkpoint
              playWaypointChime(wp.id - 1);
              return next;
            }
            return prev;
          });
        }
      });

      // Check Finish: Trigger celebratory fanfare and ceremonial arrival overlay
      if (dist >= totalLength - 4 && !hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true;
        setIsCompleted(true);
        playCelebrationFanfare();

        // 1.5s celebratory duration so user enjoys the grand accomplishment & VIP welcome
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    },
    [WAYPOINTS, vertexDistances, totalLength, onComplete]
  );

  // Pure Delta Drag Engine:
  // Converts finger delta directly to path movement.
  // 100% immune to jumping or "geser sendiri". When finger stops, movement stops immediately!
  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    setIsDragging(true);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.height === 0 || rect.width === 0) return;

    // Delta in screen pixels
    const screenDeltaX = e.clientX - lastPointerRef.current.x;
    const screenDeltaY = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    // Scale from screen pixels to SVG coordinate units (0..380 x 0..620)
    const scaleX = 380 / rect.width;
    const scaleY = 620 / rect.height;

    const svgDeltaX = screenDeltaX * scaleX;
    const svgDeltaY = screenDeltaY * scaleY;

    // Project delta onto current segment direction
    let curDist = currentDistRef.current;
    let segIdx = 0;
    for (let i = 0; i < segments.length; i++) {
      if (curDist < vertexDistances[i + 1] || i === segments.length - 1) {
        segIdx = i;
        break;
      }
    }

    const currentSeg = segments[segIdx];
    if (!currentSeg) return;

    let forwardDelta = 0;
    if (currentSeg.direction === 'down') {
      forwardDelta = svgDeltaY;
    } else if (currentSeg.direction === 'right') {
      forwardDelta = svgDeltaX;
    } else if (currentSeg.direction === 'left') {
      forwardDelta = -svgDeltaX;
    } else if (currentSeg.direction === 'up') {
      forwardDelta = -svgDeltaY;
    }

    // If near the end of current segment, also accept movement in the next segment's direction
    const segEndDist = vertexDistances[segIdx + 1];
    if (segIdx < segments.length - 1 && curDist >= segEndDist - 12) {
      const nextSeg = segments[segIdx + 1];
      let nextDelta = 0;
      if (nextSeg.direction === 'down') nextDelta = svgDeltaY;
      else if (nextSeg.direction === 'right') nextDelta = svgDeltaX;
      else if (nextSeg.direction === 'left') nextDelta = -svgDeltaX;
      else if (nextSeg.direction === 'up') nextDelta = -svgDeltaY;

      if (nextDelta > forwardDelta) {
        forwardDelta = nextDelta;
      }
    }

    // Limit maximum distance advancement per frame to ensure buttery smoothness
    const clampedDelta = Math.max(-12, Math.min(18, forwardDelta));

    // Allow forward movement and limited smooth backward movement
    const proposedDist = Math.max(0, Math.min(totalLength, curDist + clampedDelta));

    if (Math.abs(proposedDist - curDist) > 0.05) {
      currentDistRef.current = proposedDist;
      setCurrentDist(proposedDist);
      checkWaypoints(proposedDist);
      playDragTickSound();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="region"
      aria-label="Interaktif Penelusuran Jalur Undangan"
      className="fixed inset-0 z-50 flex flex-col justify-center items-center text-center overflow-hidden select-none bg-[#161D30] text-[#F9F6EE] transition-all duration-700"
      style={{ height: '100dvh', minHeight: '100dvh', maxHeight: '100dvh' }}
    >
      {/* Background Animated Atmosphere */}
      {/* 1. Cinematic Full-Bleed Animated Photography with Ken-Burns Breathing Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-full animate-ken-burns scale-105">
          <EditorialImage
            src={data.heroCover.src}
            alt={data.heroCover.alt}
            priority={true}
            objectPosition={data.heroCover.objectPosition || 'center 30%'}
            className="w-full h-full opacity-25 blur-[1.5px]"
            imgClassName="w-full h-full object-cover"
          />
        </div>

        {/* 2. Deep Multi-Stop Vignettes to preserve labyrinth contrast & legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#161D30]/85 via-[#161D30]/90 to-[#161D30]/95" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#161D30]/60 to-[#161D30]" />

        {/* 3. Floating Celestial Glow Orbs with Slow Drift Animation */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#7395C0]/25 blur-3xl animate-ambient-drift" />
        <div className="absolute -bottom-28 -right-20 w-88 h-88 rounded-full bg-[#F8DDA6]/20 blur-3xl animate-ambient-drift-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#AFC9E5]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4. Floating Golden Stardust / Particles */}
      <AmbientGoldenSparkles />

      {/* 5. Delicate Corner Filigrees framing the screen */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[#7395C0]/35 pointer-events-none z-10">
        <FloralCorner className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#7395C0]/35 pointer-events-none rotate-90 z-10">
        <FloralCorner className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-[#7395C0]/35 pointer-events-none -rotate-90 z-10">
        <FloralCorner className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-[#7395C0]/35 pointer-events-none rotate-180 z-10">
        <FloralCorner className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>

      {/* Main Interactive Canvas Area: Vertically Mid-Centered & Fit to Screen */}
      <div className="relative w-full max-w-md mx-auto h-[100dvh] flex flex-col justify-center items-center px-3 sm:px-4 py-2 touch-none">
        {/* Instructional Header Banner - Centered above the maze */}
        <div className="text-center mb-1.5 sm:mb-2 relative z-10">
          <div className="flex justify-center mb-1">
            <FloralCrest className="w-6 h-6 sm:w-7 sm:h-7 text-[#F8DDA6] drop-shadow-xs" />
          </div>
          <p className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.24em] text-[#AFC9E5] font-medium">
            Telusuri Perjalanan Kami
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-[#DADDE0]/75 font-light">
            Sentuh &amp; geser ikon dari <strong className="text-[#F8DDA6] font-medium">Start</strong> hingga{' '}
            <strong className="text-[#F8DDA6] font-medium">Finish</strong>
          </p>
        </div>

        {/* SVG Interactive Labyrinth Board Container: Fit-to-screen aspect ratio */}
        <div className="relative w-full aspect-[380/620] max-h-[76dvh] flex items-center justify-center">
          {/* SVG Vector Path & Slider Handle */}
          <svg
            ref={svgRef}
            viewBox="0 0 380 620"
            className="w-full h-full drop-shadow-2xl overflow-visible pointer-events-none"
          >
            <defs>
              {/* Path Active Glow Gradient */}
              <linearGradient id="activeTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8DDA6" />
                <stop offset="50%" stopColor="#7395C0" />
                <stop offset="100%" stopColor="#F8DDA6" />
              </linearGradient>

              {/* Slider Node Glow Filter */}
              <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Background Inactive Track (Dark Translucent Blue with Dashes) */}
            <path
              d="M 65 35 L 65 140 L 315 140 L 315 275 L 65 275 L 65 430 L 315 430 L 315 575"
              fill="none"
              stroke="#202A45"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 65 35 L 65 140 L 315 140 L 315 275 L 65 275 L 65 430 L 315 430 L 315 575"
              fill="none"
              stroke="#7395C0"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Completed / Active Traced Path with Glowing Gold Gradient */}
            <path
              d="M 65 35 L 65 140 L 315 140 L 315 275 L 65 275 L 65 430 L 315 430 L 315 575"
              fill="none"
              stroke="url(#activeTrackGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={totalLength}
              strokeDashoffset={Math.max(0, totalLength - currentDist)}
              className="transition-[stroke-dashoffset] duration-75 ease-out"
            />

            {/* Waypoint Checkpoint Medallions along Path */}
            {WAYPOINTS.map((wp) => {
              const pt = POINTS[wp.vertexIndex];
              const isUnlocked = unlockedWaypoints.has(wp.id);

              return (
                <g key={wp.id} transform={`translate(${pt.x}, ${pt.y})`}>
                  {/* Outer Pulsing Ping Ring if unlocked */}
                  {isUnlocked && (
                    <circle
                      r="11"
                      fill="none"
                      stroke="#F8DDA6"
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  {/* Waypoint Base Disk */}
                  <circle
                    r="8"
                    fill={isUnlocked ? '#F8DDA6' : '#202A45'}
                    stroke={isUnlocked ? '#F8DDA6' : '#7395C0'}
                    strokeWidth="1.5"
                    className="transition-colors duration-300"
                  />

                  {/* Inner Mark: Small dot or number */}
                  {isUnlocked ? (
                    <circle r="3" fill="#161D30" />
                  ) : (
                    <text
                      textAnchor="middle"
                      dy="2.5"
                      fill="#DADDE0"
                      fontSize="7.5"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      {wp.id}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Start Node Indicator at (65, 35) */}
            <g transform="translate(65, 35)">
              <circle r="10" fill="#202A45" stroke="#7395C0" strokeWidth="1.5" />
              <circle r="3.5" fill="#F8DDA6" />
              <text
                x="15"
                y="3.5"
                fill="#F8DDA6"
                fontSize="8.5"
                fontFamily="serif"
                letterSpacing="0.1em"
                fontWeight="bold"
              >
                START
              </text>
            </g>

            {/* Finish Node Indicator at (315, 575) */}
            <g transform="translate(315, 575)">
              {isCompleted && (
                <>
                  <circle
                    r="24"
                    fill="none"
                    stroke="#F8DDA6"
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                  <circle
                    r="36"
                    fill="none"
                    stroke="#F8DDA6"
                    strokeWidth="1"
                    className="animate-pulse opacity-40"
                  />
                </>
              )}
              <circle
                r="14"
                fill={isCompleted ? '#F8DDA6' : '#202A45'}
                stroke="#F8DDA6"
                strokeWidth="2.5"
                className={isCompleted ? 'animate-pulse' : ''}
              />
              <circle r="5" fill={isCompleted ? '#161D30' : '#7395C0'} />
              <text
                x="-48"
                y="3.5"
                fill="#F8DDA6"
                fontSize="8.5"
                fontFamily="serif"
                letterSpacing="0.1em"
                fontWeight="bold"
              >
                FINISH
              </text>
            </g>

            {/* Draggable Slider Couple Icon Handle (Using public/icon_game.webp) */}
            <g
              transform={`translate(${currentPos.x}, ${currentPos.y})`}
              className="pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Invisible Generous Touch Target (Radius 36px = 72px diameter touch hitbox) */}
              <circle r="36" fill="transparent" />

              {/* Pulsing Ripple Ring when dragging */}
              {isDragging && (
                <circle
                  r="24"
                  fill="none"
                  stroke="#F8DDA6"
                  strokeWidth="1.5"
                  opacity="0.5"
                  className="animate-ping"
                />
              )}

              {/* Subtle Glowing Halo Behind Couple Avatar */}
              <circle
                r="21"
                fill="#202A45"
                stroke="#F8DDA6"
                strokeWidth="2"
                filter="url(#goldGlow)"
              />

              {/* Couple Avatar Sticker from public/icon_game.webp */}
              <image
                href="/icon_game.webp"
                x="-21"
                y="-21"
                width="42"
                height="42"
                preserveAspectRatio="xMidYMid meet"
                className={`transition-transform duration-75 pointer-events-none ${isDragging ? 'scale-110' : 'scale-100'
                  }`}
                style={{ transformOrigin: '0 0' }}
              />

              {/* Directional Guide Pin pointing in travel direction */}
              <g
                transform={`translate(${currentDirection === 'down'
                  ? '0, 24'
                  : currentDirection === 'right'
                    ? '24, 0'
                    : currentDirection === 'left'
                      ? '-24, 0'
                      : '0, -24'
                  })`}
              >
                <circle r="6" fill="#202A45" stroke="#F8DDA6" strokeWidth="1.2" />
                <path
                  d={
                    currentDirection === 'down'
                      ? 'M -2.5 -1.5 L 2.5 -1.5 L 0 2 Z'
                      : currentDirection === 'right'
                        ? 'M -1.5 -2.5 L 2 0 L -1.5 2.5 Z'
                        : currentDirection === 'left'
                          ? 'M 1.5 -2.5 L -2 0 L 1.5 2.5 Z'
                          : 'M -2.5 1.5 L 2.5 1.5 L 0 -2 Z'
                  }
                  fill="#F8DDA6"
                />
              </g>
            </g>
          </svg>

          {/* Persistent Checkpoint Info Cards:
              Badges removed. Elongated path ensures no crowding.
              Appear at each turn and stay visible continuously! */}
          <div className="absolute inset-0 pointer-events-none">
            {WAYPOINTS.map((wp) => {
              const isUnlocked = unlockedWaypoints.has(wp.id);
              const IconComponent = wp.icon;

              return (
                <div
                  key={wp.id}
                  style={wp.style}
                  className={`absolute transition-all duration-500 ease-out ${isUnlocked
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-35 scale-95 translate-y-0.5'
                    }`}
                >
                  <div
                    className={`rounded-xl p-2 sm:p-2.5 backdrop-blur-md text-left relative overflow-hidden transition-all duration-300 ${isUnlocked
                      ? 'bg-[#202A45]/95 border border-[#F8DDA6]/70 shadow-lg shadow-black/40'
                      : 'bg-[#161D30]/60 border border-dashed border-[#7395C0]/25'
                      }`}
                  >
                    {/* Top Golden Sheen when unlocked */}
                    {isUnlocked && (
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F8DDA6]/60 to-transparent" />
                    )}

                    <div className="flex items-center gap-2">
                      {/* Icon Disc */}
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isUnlocked
                          ? 'bg-[#7395C0]/25 text-[#F8DDA6] border border-[#7395C0]/40'
                          : 'bg-white/5 text-[#DADDE0]/40 border border-white/5'
                          }`}
                      >
                        {isUnlocked ? (
                          <IconComponent className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>

                      {/* Content Info (Clean title & subtitle without badges) */}
                      <div className="flex-1 min-w-0 pr-0.5">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4
                            className={`text-xs sm:text-[12.5px] font-sans font-semibold tracking-normal truncate ${isUnlocked ? 'text-white' : 'text-[#DADDE0]/60'
                              }`}
                          >
                            {wp.title}
                          </h4>
                          {isUnlocked && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                        </div>

                        <p
                          className={`text-[9.5px] sm:text-[10px] truncate font-light leading-tight ${isUnlocked ? 'text-[#DADDE0]/80' : 'text-[#DADDE0]/30'
                            }`}
                        >
                          {wp.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Teaser Message: Penggugah Rasa Penasaran untuk Membuka Full Undangan (Tanpa Card/Direct) */}
            <div
              style={{
                left: '7%',
                top: '78%',
                width: '58%',
              }}
              className="absolute pointer-events-none text-left select-none"
            >
              <div className="flex items-center gap-1.5 mb-1 opacity-75">
                <span className="h-px w-3 bg-gradient-to-r from-transparent to-[#F8DDA6]" />
                <span className="text-[9px] uppercase tracking-[0.24em] text-[#F8DDA6] font-light">
                  Menuju Hari Bahagia
                </span>
              </div>
              <p className="font-serif italic text-xs sm:text-[12.5px] text-[#F9F6EE] leading-snug font-normal drop-shadow-xs mb-1">
                Perjalanan Kami menanti Anda di dalam.
              </p>
              <p className="text-[9.5px] sm:text-[10px] text-[#DADDE0]/70 font-light leading-relaxed">
                Geser hingga ke titik <span className="text-[#F8DDA6] font-medium">Finish</span> untuk membuka undangan seutuhnya.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Bottom Controls: Guest Info & Skip Button, with Guide Progress Pill Below Tamu */}
      <div className="fixed bottom-4 sm:bottom-5 left-4 right-4 z-40 max-w-md mx-auto flex flex-col gap-2 pointer-events-none">
        {/* Row 1: Guest Info & Skip Button with Space Gap */}
        <div className="w-full flex items-center justify-between">
          {/* Left: Floating Guest Info Pill (Icon removed as requested) */}
          <div className="pointer-events-auto inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#202A45]/90 border border-[#7395C0]/40 text-[#F8DDA6] text-xs font-medium shadow-xl backdrop-blur-md">
            <span className="truncate max-w-[170px] sm:max-w-[220px]">
              Tamu: <strong className="text-white font-semibold">{guestName || 'Bapak/Ibu/Saudara/i'}</strong>
            </span>
          </div>

          {/* Right: Floating Skip Button (Icon Only) */}
          <button
            onClick={onSkip}
            aria-label="Langsung buka undangan"
            title="Langsung buka undangan"
            className="pointer-events-auto w-10 h-10 rounded-full bg-[#202A45]/90 hover:bg-[#202A45] border border-[#7395C0]/40 hover:border-[#F8DDA6] text-[#F8DDA6] hover:text-white flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: Simpan di bawah info Tamu - Floating Guide & Progress Pill */}
        <div className="flex justify-start">
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202A45]/85 border border-[#7395C0]/35 text-[#DADDE0]/90 text-[10px] sm:text-[10.5px] font-light shadow-xl backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F8DDA6] animate-ping" />
            <span>Tahan &amp; geser ikon mengikuti rel garis</span>
            <span className="text-[#F8DDA6] font-medium border-l border-[#7395C0]/35 pl-2">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Grand Ceremonial Welcome Overlay upon Reaching Finish */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141A2B]/85 backdrop-blur-md pointer-events-auto select-none"
          >
            {/* Background Ambient Radial Gold Flare */}
            <div className="absolute inset-0 bg-radial from-[#F8DDA6]/15 via-transparent to-transparent pointer-events-none" />

            {/* Elegant Royal Invitation Envelope / Plaque */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -12 }}
              transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-xs sm:max-w-sm w-full text-center px-6 py-7 rounded-3xl bg-gradient-to-b from-[#202C48]/95 to-[#161D30]/95 border border-[#F8DDA6]/60 shadow-2xl overflow-hidden"
            >
              {/* Top Golden Light Sheen */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F8DDA6] to-transparent" />
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#F8DDA6]/20 blur-2xl pointer-events-none" />

              {/* Royal Botanical Crest Emblem */}
              <div className="flex justify-center mb-3">
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 120 }}
                  className="relative"
                >
                  <FloralCrest className="w-16 h-16 text-[#F8DDA6] drop-shadow-[0_0_18px_rgba(248,221,166,0.65)]" />
                </motion.div>
              </div>

              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F8DDA6]/20 border border-[#F8DDA6]/40 text-[#F8DDA6] text-[10px] font-semibold tracking-[0.2em] uppercase mb-3 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F8DDA6]" />
                <span>Pintu Gerbang Terbuka</span>
              </motion.div>

              {/* Welcome Headline */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className="font-serif text-xl sm:text-2xl text-[#F9F6EE] font-light tracking-wide mb-1"
              >
                Selamat Datang
              </motion.h3>

              {/* Guest Recipient Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.32 }}
                className="font-serif italic text-lg sm:text-xl text-[#F8DDA6] font-normal mb-2.5 truncate px-2"
              >
                {guestName || 'Bapak/Ibu/Saudara/i'}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                className="text-[11px] text-[#DADDE0]/85 font-light leading-relaxed mb-5 max-w-[260px] mx-auto"
              >
                Perjalanan telah sampai. Membuka lembaran penuh berkah pernikahan kami...
              </motion.p>

              {/* Animated Progress Unlocking Line */}
              <div className="w-full bg-[#141A2B] h-1.5 rounded-full overflow-hidden border border-[#7395C0]/30 relative mb-1.5">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-[#7395C0] via-[#F8DDA6] to-[#F9F6EE] rounded-full shadow-[0_0_8px_#F8DDA6]"
                />
              </div>
              <span className="text-[9px] uppercase tracking-[0.22em] text-[#AFC9E5]/75 font-medium animate-pulse block">
                Menuju Halaman Undangan...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
