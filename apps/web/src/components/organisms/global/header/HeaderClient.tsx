'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import LogoLink from '@/components/atoms/frontend/logo/Link';
import type { Locale } from '@/i18n/localized-collections';
import type { Navigation } from '@/payload-types';
import MainNavigation from './components/MainNavigation';
import MobileNavigation from './components/MobileNavigation';
import './header.css';

type Props = {
    main?: Navigation['navItems'] | null;
    mobile?: Navigation['navItems'] | null;
    locale: Locale;
};

export default function HeaderClient({ main, mobile, locale }: Props) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const updateScrollState = () => setIsScrolled(window.scrollY > 50);

        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });
        return () => window.removeEventListener('scroll', updateScrollState);
    }, []);

    return (
        <>
            <header
                className="site-header fixed inset-x-0 top-0 z-50 bg-bg-base text-fg-base"
                data-scrolled={isScrolled}
            >
                <div className="base-block flex h-full items-center justify-between xl:grid xl:grid-cols-1 xl:grid-rows-[minmax(0,1fr)_50px]">
                    <div className="flex min-h-0 items-center justify-center">
                        <LogoLink
                            variant="responsive"
                            className="site-header__logo"
                            label={locale === 'da' ? 'Bands of Tomorrow — forside' : 'Bands of Tomorrow — home'}
                        />
                    </div>

                    <div className="hidden min-w-0 items-center justify-center gap-6 xl:flex">
                        <MainNavigation data={main} locale={locale} />
                        <span
                            className="flex size-12 shrink-0 cursor-default items-center justify-center transition-[scale] duration-200 ease-out hover:scale-[1.2] motion-reduce:hover:scale-100 motion-reduce:transition-none"
                            title={locale === 'da' ? 'Søgning kommer snart' : 'Search coming soon'}
                        >
                            <Search aria-hidden="true" size={24} strokeWidth={2} />
                        </span>
                    </div>

                    <div className="flex items-center gap-1 xl:hidden">
                        <span
                            className="flex size-12 shrink-0 cursor-default items-center justify-center transition-[scale] duration-200 ease-out hover:scale-[1.2] motion-reduce:hover:scale-100 motion-reduce:transition-none"
                            title={locale === 'da' ? 'Søgning kommer snart' : 'Search coming soon'}
                        >
                            <Search aria-hidden="true" size={28} strokeWidth={2} />
                        </span>
                        <MobileNavigation data={mobile} locale={locale} />
                    </div>
                </div>
            </header>
            <div className="h-[var(--header-height)] shrink-0 xl:h-[var(--header-height-desktop)]" aria-hidden="true" />
        </>
    );
}
