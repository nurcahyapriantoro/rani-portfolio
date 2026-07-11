'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: string[];
  alt: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'full';
}

const MAX_WIDTH_CLASS: Record<NonNullable<ImageSliderProps['maxWidth']>, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  full: ''
};

export function ImageSlider({ images, alt, maxWidth = 'full' }: ImageSliderProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className={cn('relative mt-3 rounded-xl overflow-hidden bg-bg-tertiary group/slider mx-auto', MAX_WIDTH_CLASS[maxWidth])}>
      <div className="relative aspect-[4/3] sm:aspect-video w-full">
        <Image
          src={images[index]}
          alt={`${alt} - ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover transition-opacity duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity hover:bg-bg-primary active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/slider:opacity-100 transition-opacity hover:bg-bg-primary active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-bg-primary/80 backdrop-blur-sm text-[10px] font-mono">
          {index + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-1 p-1.5 justify-center bg-bg-secondary">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'bg-accent w-5' : 'bg-text-muted/30 w-1.5 hover:bg-text-muted/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}