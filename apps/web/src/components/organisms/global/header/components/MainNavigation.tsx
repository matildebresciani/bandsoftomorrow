'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/localized-collections';
import { getLinkTarget } from '@/lib/utilities/composables';
import { formatLink } from '@/lib/utilities/format-link';
import { cn } from '@/lib/utilities/ui';
import type { Navigation } from '@/payload-types';

type Props = {
    data: Navigation['navItems'] | null;
    locale: Locale;
};

const MainNavigation = ({ data, locale }: Props) => {
    const pathname = usePathname();

    return (
        <nav aria-label={locale === 'da' ? 'Hovednavigation' : 'Main navigation'}>
            <ul className="flex items-center justify-center gap-6 2xl:gap-8">
                {data?.map((item, i) => {
                    const itemLink = formatLink(item.link, locale);
                    if (!itemLink) return null;

                    const isCurrent = itemLink === pathname;

                    return (
                        <li key={item.id ?? i}>
                            <Link
                                href={itemLink}
                                className={cn(
                                    'inline-block whitespace-nowrap px-1 py-1 font-primary text-base leading-tight uppercase transition-[color,scale] duration-200 ease-out hover:scale-[1.08] hover:text-fg-highlight active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-highlight motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:transition-none',
                                    isCurrent && 'bg-bg-highlight text-fg-on-color hover:text-fg-on-color',
                                )}
                                aria-current={isCurrent ? 'page' : undefined}
                                target={getLinkTarget(item.link)}
                            >
                                {item.link?.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default MainNavigation;
