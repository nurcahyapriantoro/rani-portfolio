'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: string[];
  alt: string;
}

export function ImageSlider({ images, alt }: ImageSliderProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="relative mt-4 rounded-xl overflow-hidden bg-bg-tertiary group/slider">
      <div className="relative aspect-video w-full">
        <Image
          src={images[index]}
          alt={`${alt} - ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-opacity duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-bg-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-bg-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-bg-primary/80 backdrop-blur-sm text-xs font-mono">
          {index + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-1 p-2 justify-center bg-bg-secondary">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === index ? 'bg-accent w-6' : 'bg-text-muted/30 hover:bg-text-muted/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}