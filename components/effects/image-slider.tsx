'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: string[];
  alt: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'full';
  /**
   * Maximum number of images to show per "page". Defaults to 4 — this gives a
   * comfortable grid on desktop (4 columns) that collapses gracefully to
   * 2-up on tablet and 1-up on mobile. If there are more images than this,
   * the slider exposes prev/next + dot navigation.
   */
  perPage?: number;
}

const MAX_WIDTH_CLASS: Record<NonNullable<ImageSliderProps['maxWidth']>, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  full: ''
};

/**
 * Responsive grid classes for the per-page image count. Defaults to a 2x2
 * layout for 4 images (which feels more portfolio-like than the cramped
 * 4-up). On mobile everything collapses to 1 column so portrait images
 * stay legible, then it scales up to 2 columns on tablet/desktop.
 * Use the optional `perPage` prop to switch to a tighter 4-up grid.
 */
function gridCols(perPage: number): string {
  // col-mobile col-tablet col-desktop
  if (perPage <= 1) return 'grid-cols-1';
  if (perPage === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (perPage === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  // perPage 4+ (default — keep grid wide so individual thumbnails read big)
  return 'grid-cols-1 sm:grid-cols-2';
}

export function ImageSlider({
  images,
  alt,
  maxWidth = 'full',
  perPage = 4
}: ImageSliderProps) {
  const [page, setPage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const totalPages = Math.max(1, Math.ceil(images.length / perPage));
  const showControls = totalPages > 1;
  const safePerPage = Math.max(1, perPage);

  // Clamp page in case the array shrinks (e.g. user removes photos live).
  const currentPage = Math.min(page, totalPages - 1);

  const next = useCallback(() => {
    if (!showControls) return;
    setPage((p) => (p + 1) % totalPages);
  }, [showControls, totalPages]);

  const prev = useCallback(() => {
    if (!showControls) return;
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }, [showControls, totalPages]);

  if (!images || images.length === 0) return null;

  const startIdx = currentPage * safePerPage;
  const visibleImages = images.slice(startIdx, startIdx + safePerPage);

  return (
    <div
      className={cn('relative mt-3 group/slider mx-auto', MAX_WIDTH_CLASS[maxWidth])}
    >
      <div
        className={cn(
          'grid gap-1.5',
          gridCols(safePerPage)
        )}
      >
        {visibleImages.map((src, i) => {
          const globalIndex = startIdx + i;
          return (
            <button
              key={`${startIdx}-${i}`}
              type="button"
              onClick={() => setLightbox(globalIndex)}
              aria-label={`View ${alt} image ${globalIndex + 1} full size`}
              className="relative aspect-video w-full rounded-md overflow-hidden bg-bg-tertiary border border-border hover:opacity-90 active:scale-[0.98] transition"
            >
              <Image
                src={src}
                alt={`${alt} - ${globalIndex + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {showControls && (
        <>
          <button
            onClick={prev}
            aria-label="Previous page"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity hover:bg-bg-primary active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={next}
            aria-label="Next page"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity hover:bg-bg-primary active:scale-95"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-bg-primary/85 backdrop-blur-sm text-[10px] font-mono">
            {currentPage + 1} / {totalPages}
          </div>
        </>
      )}

      {lightbox !== null && (
        <Lightbox
          images={images}
          startIndex={lightbox}
          alt={alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

interface LightboxProps {
  images: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}

function Lightbox({ images, startIndex, alt, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => onClose(), [onClose]);
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [close, next, prev]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} image viewer`}
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={close}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div
        className="relative max-w-[90vw] max-h-[85vh] aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`${alt} - ${index + 1}`}
          fill
          sizes="90vw"
          className="object-contain"
          quality={90}
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-mono">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
