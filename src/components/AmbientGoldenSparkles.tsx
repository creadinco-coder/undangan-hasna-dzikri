/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  driftX: number;
}

const PARTICLES: Particle[] = [
  { id: 1, left: '15%', top: '75%', size: 3, delay: '0s', duration: '5.5s', driftX: 12 },
  { id: 2, left: '28%', top: '65%', size: 4, delay: '1.2s', duration: '6.2s', driftX: -16 },
  { id: 3, left: '42%', top: '80%', size: 2.5, delay: '2.4s', duration: '4.8s', driftX: 14 },
  { id: 4, left: '55%', top: '70%', size: 3.5, delay: '0.8s', duration: '7s', driftX: -10 },
  { id: 5, left: '72%', top: '60%', size: 4, delay: '1.8s', duration: '5.8s', driftX: 18 },
  { id: 6, left: '85%', top: '78%', size: 2.8, delay: '3.1s', duration: '6.5s', driftX: -14 },
  { id: 7, left: '20%', top: '45%', size: 3.2, delay: '2.1s', duration: '6s', driftX: 10 },
  { id: 8, left: '35%', top: '35%', size: 4.2, delay: '0.4s', duration: '5.2s', driftX: -12 },
  { id: 9, left: '68%', top: '40%', size: 3, delay: '1.5s', duration: '6.8s', driftX: 16 },
  { id: 10, left: '80%', top: '30%', size: 2.5, delay: '2.7s', duration: '5.7s', driftX: -8 },
  { id: 11, left: '48%', top: '25%', size: 3.8, delay: '3.5s', duration: '7.2s', driftX: 12 },
  { id: 12, left: '60%', top: '85%', size: 4.5, delay: '1.9s', duration: '6.4s', driftX: -15 },
  { id: 13, left: '10%', top: '88%', size: 2.5, delay: '0.7s', duration: '5s', driftX: 8 },
  { id: 14, left: '90%', top: '50%', size: 3.5, delay: '2.9s', duration: '6.7s', driftX: -12 },
];

export function AmbientGoldenSparkles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#F8DDA6] shadow-[0_0_8px_#F8DDA6]"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `floatParticle ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            opacity: 0,
            filter: 'drop-shadow(0 0 6px rgba(248, 221, 166, 0.8))',
          }}
        />
      ))}
    </div>
  );
}
