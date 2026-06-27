'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { BookOpen, ExternalLink, Users } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  type: string;
  abstract: string;
  url?: string;
}

export function Publications({ publications }: { publications: Publication[] }) {
  const t = useTranslations('publications');
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="publications" ref={ref} className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {t('title')}
        </h2>
        <p className="text-text-muted text-lg mb-16 max-w-2xl">{t('subtitle')}</p>

        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="!pb-16"
        >
          {publications.map((pub) => (
            <SwiperSlide key={pub.id} className="!w-[90%] md:!w-[500px]">
              <div className="group p-6 md:p-8 rounded-3xl glass h-full min-h-[420px] flex flex-col hover:scale-[1.02] transition-all shine">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-bg-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-accent">
                      {pub.type}
                    </span>
                    <p className="text-xs text-text-muted">{pub.date}</p>
                  </div>
                </div>

                <h3 className="font-display text-lg md:text-xl font-bold mb-3 leading-tight group-hover:text-accent transition-colors line-clamp-3">
                  {pub.title}
                </h3>

                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {pub.venue}
                </p>

                <div className="flex items-center gap-2 mb-4 text-xs text-text-secondary">
                  <Users className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">
                    {pub.authors.slice(0, 3).join(', ')}
                    {pub.authors.length > 3 && ` +${pub.authors.length - 3}`}
                  </span>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed line-clamp-4 mb-4 flex-1">
                  {pub.abstract}
                </p>

                {pub.url && (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all"
                  >
                    View Publication
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="section-divider mt-16" />
    </section>
  );
}