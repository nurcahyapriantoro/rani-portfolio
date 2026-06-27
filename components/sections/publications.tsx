'use client';

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

  return (
    <section id="publications" className="py-14 md:py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
          {t('title')}
        </h2>
        <p className="text-xs md:text-sm text-text-muted mb-10 md:mb-14 max-w-2xl">{t('subtitle')}</p>

        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 25,
            stretch: 0,
            depth: 150,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="!pb-12"
        >
          {publications.map((pub) => (
            <SwiperSlide key={pub.id} className="!w-[88%] md:!w-[420px]">
              <div className="group p-4 md:p-6 rounded-2xl glass h-full min-h-[340px] flex flex-col hover:scale-[1.02] transition-all shine">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                    <BookOpen className="w-4.5 h-4.5 text-bg-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                      {pub.type}
                    </span>
                    <p className="text-[11px] text-text-muted">{pub.date}</p>
                  </div>
                </div>

                <h3 className="font-display text-sm md:text-base font-bold mb-2 leading-tight group-hover:text-accent transition-colors line-clamp-3">
                  {pub.title}
                </h3>

                <p className="text-xs text-text-muted mb-3 line-clamp-2">
                  {pub.venue}
                </p>

                <div className="flex items-center gap-1.5 mb-3 text-[11px] text-text-secondary">
                  <Users className="w-3 h-3" />
                  <span className="line-clamp-1">
                    {pub.authors.slice(0, 3).join(', ')}
                    {pub.authors.length > 3 && ` +${pub.authors.length - 3}`}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed line-clamp-4 mb-3 flex-1">
                  {pub.abstract}
                </p>

                {pub.url && (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:gap-2 transition-all"
                  >
                    View Publication
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="section-divider mt-12 md:mt-16" />
    </section>
  );
}