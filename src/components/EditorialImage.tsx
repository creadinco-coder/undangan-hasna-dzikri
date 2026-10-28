/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FloralCrest } from './WeddingDecorativeAssets.tsx';
import { buildOptimizedImageUrl } from '../utils/invitationUtils.ts';

export interface EditorialImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'wide' | 'tall' | 'full' | 'auto';
  objectPosition?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  overlay?: 'dark-gradient' | 'cover-hero' | 'subtle-vignette' | 'none';
  caption?: string;
  category?: string;
  onClick?: () => void;
  bordered?: boolean;
}

export function EditorialImage({
  src,
  alt,
  aspectRatio = 'auto',
  objectPosition = 'center',
  priority = false,
  className = '',
  imgClassName = '',
  sizes,
  overlay = 'none',
  caption,
  category,
  onClick,
  bordered = false,
}: EditorialImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute responsive srcSet for Unsplash assets
  const computedSrcSet =
    src && src.includes('images.unsplash.com')
      ? `${buildOptimizedImageUrl(src, 400)} 400w, ${buildOptimizedImageUrl(src, 800)} 800w, ${buildOptimizedImageUrl(src, 1200)} 1200w`
      : undefined;

  // Aspect ratio classes
  const aspectClass =
    aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : aspectRatio === 'landscape'
      ? 'aspect-[16/10]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : aspectRatio === 'tall'
      ? 'aspect-[9/16]'
      : aspectRatio === 'full'
      ? 'h-full w-full'
      : '';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden ${aspectClass} ${
        bordered ? 'border border-[#DADDE0] shadow-xs' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Shimmer skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#DADDE0]/30 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#7395C0]/50 animate-spin" />
        </div>
      )}

      {/* Fallback state when image fails to load */}
      {hasError ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#F9F6EE] to-[#DADDE0]/50 border border-[#7395C0]/40 flex flex-col items-center justify-center p-4 text-center">
          <FloralCrest className="w-12 h-12 text-[#7395C0] mb-2" />
          <span className="font-serif italic text-sm text-[#202A45] block max-w-[200px] truncate">
            {alt}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#7395C0] mt-1 font-medium">
            Hasna & Dzikri
          </span>
        </div>
      ) : (
        <img
          src={src}
          srcSet={computedSrcSet}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          sizes={sizes || '(max-width: 768px) 100vw, 420px'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{ objectPosition }}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}

      {/* Preset Gradient Overlays */}
      {overlay === 'dark-gradient' && (
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/35 to-stone-950/40 pointer-events-none" />
      )}
      {overlay === 'cover-hero' && (
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/75 via-stone-900/40 to-stone-950/90 pointer-events-none" />
      )}
      {overlay === 'subtle-vignette' && (
        <div className="absolute inset-0 bg-stone-950/30 mix-blend-multiply pointer-events-none" />
      )}

      {/* Optional Editorial Label Caption */}
      {(caption || category) && (
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#202A45]/90 via-[#202A45]/50 to-transparent text-[#F9F6EE] pointer-events-none">
          {category && (
            <span className="text-[9px] uppercase tracking-widest text-[#F8DDA6] font-semibold block mb-0.5">
              {category}
            </span>
          )}
          {caption && (
            <p className="font-serif text-xs font-medium text-[#F9F6EE] drop-shadow-xs truncate">
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
