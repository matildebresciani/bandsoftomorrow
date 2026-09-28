import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Pagination from '@/components/molecules/frontend/Pagination';
import { generateArchiveMetadata } from '@/lib/data/metadata';
import { getPostArchivePage } from '@/lib/data/post-archive';
import { formatLinkByCollection } from '@/lib/utilities/format-link';

type Props = {
    params: Promise<{
        locale: string;
        tag?: string;
        pageNumber?: string;
    }>;
};

export const dynamic = 'force-dynamic';

export default async function PostsPage({ params }: Props) {
    const { locale, tag, pageNumber } = await params;
    const archive = await getPostArchivePage(locale, tag, pageNumber);
    setRequestLocale(archive.locale);
    const t = await getTranslations({ locale: archive.locale, namespace: 'postArchive' });
    const title = archive.tag?.tag || archive.tag?.name || t('title');

    return (
        <article>
            <div className="base-block oakgrid mt-6 lg:mt-16">
                <div className="col-span-12">
                    <h1 className="text-2xl font-medium lg:text-4xl">{title}</h1>
                </div>
            </div>

            <div className="base-block-outer">
                <div className="base-block oakgrid mt-6 lg:mt-10">
                    <div className="col-span-12 grid gap-y-10 gap-x-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
                        {archive.entries.docs.length === 0 && <p>{t('empty')}</p>}
                        {archive.entries.docs.map((entry) => {
                            const link = formatLinkByCollection(entry.slug, 'posts', archive.locale);
                            if (!link) return null;

                            return (
                                <Link key={entry.id} href={link}>
                                    {entry.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Pagination
                totalPages={archive.entries.totalPages}
                pageNumber={archive.currentPage}
                locale={archive.locale}
                className="my-6 lg:mt-20 lg:mb-16"
                routeDetails={archive.routeDetails}
            />
        </article>
    );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, tag, pageNumber } = await params;
    const archive = await getPostArchivePage(locale, tag, pageNumber);

    return generateArchiveMetadata({
        slug: tag,
        title: archive.tag?.tag || archive.tag?.name,
        collection: 'posts',
        locale: archive.locale,
        pageNumber: archive.currentPage,
    });
}
