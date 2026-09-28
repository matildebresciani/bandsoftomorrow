'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BurgerButton from '@/components/atoms/frontend/buttons/BurgerButton';
import type { Locale } from '@/i18n/localized-collections';
import { getLinkTarget } from '@/lib/utilities/composables';
import { formatLink } from '@/lib/utilities/format-link';
import { cn } from '@/lib/utilities/ui';
import type { Navigation } from '@/payload-types';

type Props = {
    data: Navigation['navItems'] | null | undefined;
    locale: Locale;
};

const MobileNavigation = ({ data, locale }: Props) => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const panelId = 'site-mobile-navigation';

    useEffect(() => {
        if (!isMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setIsMenuOpen(false);
            menuButtonRef.current?.focus();
        };
        const desktopQuery = window.matchMedia('(min-width: 1280px)');
        const closeOnDesktop = () => {
            if (desktopQuery.matches) setIsMenuOpen(false);
        };

        window.addEventListener('keydown', closeOnEscape);
        desktopQuery.addEventListener('change', closeOnDesktop);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
            desktopQuery.removeEventListener('change', closeOnDesktop);
        };
    }, [isMenuOpen]);

    if (!data?.length) return null;

    return (
        <>
            <BurgerButton
                isOpen={isMenuOpen}
                onClick={setIsMenuOpen}
                controlsId={panelId}
                buttonRef={menuButtonRef}
                label={locale === 'da' ? 'Åbn eller luk menu' : 'Open or close menu'}
            />
            <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[var(--header-height)] overflow-hidden xl:hidden">
                <nav
                    id={panelId}
                    className={cn(
                        'absolute inset-0 overflow-y-auto border-t border-border-base bg-bg-base px-5 py-8 transition-[translate,visibility] duration-300 ease-out md:px-12 motion-reduce:transition-none',
                        isMenuOpen
                            ? 'visible pointer-events-auto translate-x-0'
                            : 'invisible pointer-events-none translate-x-full',
                    )}
                    aria-label={locale === 'da' ? 'Mobilnavigation' : 'Mobile navigation'}
                    aria-hidden={!isMenuOpen}
                    inert={!isMenuOpen}
                >
                    <ul className="mx-auto flex max-w-[1920px] flex-col items-start gap-5">
                        {data.map((item, i) => {
                            const itemLink = formatLink(item.link, locale);
                            if (!itemLink) return null;

                            const isCurrent = itemLink === pathname;

                            return (
                                <li key={item.id ?? i}>
                                    <Link
                                        href={itemLink}
                                        className={cn(
                                            'inline-block px-1 py-1 font-primary text-xl leading-tight uppercase transition-[color,translate,scale] duration-200 ease-out hover:translate-x-1 hover:text-fg-highlight active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-highlight motion-reduce:hover:translate-x-0 motion-reduce:active:scale-100 motion-reduce:transition-none',
                                            isCurrent && 'bg-bg-highlight text-fg-on-color hover:text-fg-on-color',
                                        )}
                                        aria-current={isCurrent ? 'page' : undefined}
                                        target={getLinkTarget(item.link)}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.link?.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default MobileNavigation;
