import type { Locale } from '@/i18n/localized-collections';
import { getCachedNavigation } from '@/lib/data/payload/get-cached-navigation';
import HeaderClient from './HeaderClient';

export async function Header({ locale }: { locale: Locale }) {
    const [main, mobile] = await Promise.all([
        getCachedNavigation('position.main', locale),
        getCachedNavigation('position.mobile', locale),
    ]);

    return <HeaderClient main={main} mobile={mobile?.length ? mobile : main} locale={locale} />;
}
