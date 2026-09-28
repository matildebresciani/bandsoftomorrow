'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
// biome-ignore lint/style/useImportType: Vitest uses the classic JSX transform for this rendered component test.
import React, { useEffect, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { A11y, Autoplay, EffectCreative } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-creative';
import TagBadge from '@/components/atoms/frontend/labels/TagBadge';
import { ImageMedia } from '@/components/atoms/frontend/media/ImageMedia';
import type { Locale } from '@/i18n/localized-collections';
import type { EditorialHeroSlide } from './types';

type Props = {
    slides: EditorialHeroSlide[];
    locale: Locale;
};

const EditorialHeroSlider: React.FC<Props> = ({ slides, locale }) => {
    const [swiper, setSwiper] = useState<SwiperType | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const shouldReduceMotion = useReducedMotion();
    const hasMultipleSlides = slides.length > 1;
    const currentIndex = activeIndex < slides.length ? activeIndex : 0;
    const activeSlide = slides[currentIndex];

    useEffect(() => {
        if (!swiper) return;
        if (shouldReduceMotion) {
            swiper.autoplay.stop();
        } else if (!swiper.autoplay.running) {
            swiper.autoplay.start();
        }
    }, [swiper, shouldReduceMotion]);

    if (!activeSlide) return null;

    const renderSlideLink = (slide: EditorialHeroSlide, index: number) => (
        <Link
            href={slide.href}
            prefetch={false}
            aria-label={slide.title}
            tabIndex={index === currentIndex ? 0 : -1}
            className="absolute inset-0 block"
        >
            <ImageMedia
                resource={slide.image}
                alt={slide.image.alt || slide.title}
                className="h-full w-full object-cover"
                fill
                size="100vw"
                priority={index === 0}
                loading={index === 0 ? undefined : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
        </Link>
    );

    return (
        <section
            aria-roledescription="carousel"
            aria-label={locale === 'da' ? 'Fremhævede artikler' : 'Featured posts'}
            onFocusCapture={() => swiper?.autoplay.pause()}
            onBlurCapture={(event) => {
                const nextFocusedElement = event.relatedTarget;
                if (
                    !shouldReduceMotion &&
                    (!(nextFocusedElement instanceof Node) || !event.currentTarget.contains(nextFocusedElement))
                ) {
                    swiper?.autoplay.resume();
                }
            }}
            className="svh-screen-incl-header relative flex w-full items-end text-fg-on-color"
        >
            {hasMultipleSlides ? (
                <Swiper
                    modules={[A11y, Autoplay, EffectCreative]}
                    onSwiper={setSwiper}
                    onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
                    preventClicks
                    preventClicksPropagation
                    loop
                    effect="creative"
                    speed={shouldReduceMotion ? 0 : 1000}
                    autoplay={
                        shouldReduceMotion
                            ? false
                            : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }
                    }
                    creativeEffect={{
                        prev: { translate: ['-20%', 0, -1] },
                        next: { translate: ['100%', 0, 0] },
                    }}
                    className="!absolute inset-0"
                >
                    {slides.map((slide, index) => (
                        <SwiperSlide key={slide.id}>{renderSlideLink(slide, index)}</SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="absolute inset-0">{renderSlideLink(activeSlide, 0)}</div>
            )}

            <div className="base-block oakgrid pointer-events-none relative z-20 pb-m">
                <div className="col-span-12 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSlide.id}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeInOut' }}
                            className="grid w-full grid-cols-subgrid"
                        >
                            {activeSlide.badge && (
                                <div className="col-span-12 mb-m w-fit">
                                    <TagBadge tag={activeSlide.badge} />
                                </div>
                            )}
                            {activeSlide.date && <span className="col-span-12 mb-xs body-md">{activeSlide.date}</span>}
                            <h1 className="col-span-12 heading-3">{activeSlide.title}</h1>
                            {activeSlide.excerpt && (
                                <p className="col-span-12 mt-base max-w-[65ch] line-clamp-3 italic">
                                    {activeSlide.excerpt}
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {hasMultipleSlides && (
                    <div className="pointer-events-auto col-span-12 mt-l flex justify-center gap-1">
                        {slides.map((slide, index) => (
                            <motion.button
                                key={slide.id}
                                type="button"
                                aria-label={locale === 'da' ? `Gå til slide ${index + 1}` : `Go to slide ${index + 1}`}
                                aria-current={index === currentIndex ? 'true' : undefined}
                                onClick={() => swiper?.slideToLoop(index, shouldReduceMotion ? 0 : 1000)}
                                whileHover={shouldReduceMotion ? undefined : { scale: 1.2 }}
                                whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                                animate={{ scale: shouldReduceMotion ? 1 : index === currentIndex ? 1.2 : 1 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                                className="flex size-10 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-on-color"
                            >
                                <span
                                    className={`block size-4 rounded-full border border-button-primary transition-colors ${index === currentIndex ? 'bg-button-primary' : 'bg-transparent'}`}
                                />
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default EditorialHeroSlider;
