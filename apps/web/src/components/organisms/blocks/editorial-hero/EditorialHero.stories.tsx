import type { Meta, StoryObj } from '@storybook/nextjs';
import { imageMock, tagBadgeMocks } from '@/__mocks__/storybook-mocks';
import BaseBlock from '../base-block/BaseBlock';
import EditorialHeroSlider from './EditorialHeroSlider';
import type { EditorialHeroSlide } from './types';

const slides: EditorialHeroSlide[] = [
    {
        id: 'story-review',
        href: '/artikel/story-review',
        title: 'En koncert der bliver siddende længe efter sidste nummer',
        image: { ...imageMock, id: 'story-image-review' },
        badge: tagBadgeMocks.concert,
        date: '28. september 2026',
        excerpt: 'En aften med stærke sange, store øjeblikke og et publikum, der sang med hele vejen.',
    },
    {
        id: 'story-interview',
        href: '/artikel/story-interview',
        title: 'Mød morgendagens nye stemmer',
        image: { ...imageMock, id: 'story-image-interview' },
        badge: tagBadgeMocks.interview,
        date: '24. september 2026',
        excerpt: 'Vi taler med et nyt band om deres lyd, deres fællesskab og det næste skridt.',
    },
    {
        id: 'story-weekly-releases',
        href: '/artikel/story-weekly-releases',
        title: 'Ugens udgivelser er klar',
        image: { ...imageMock, id: 'story-image-weekly-releases' },
        badge: tagBadgeMocks.weeklyReleases,
        date: '20. september 2026',
        excerpt: 'Fem nye udgivelser, der fortjener en plads i din spilleliste.',
    },
    {
        id: 'story-album',
        href: '/artikel/story-album',
        title: 'Et album med plads til både ro og støj',
        image: { ...imageMock, id: 'story-image-album' },
        badge: tagBadgeMocks.album,
        date: '17. september 2026',
        excerpt: 'Nye nuancer folder sig ud på et album, der belønner endnu en gennemlytning.',
    },
    {
        id: 'story-genre',
        href: '/artikel/story-genre',
        title: 'Nye navne fra den danske rockscene',
        image: { ...imageMock, id: 'story-image-genre' },
        badge: tagBadgeMocks.genre,
        date: '12. september 2026',
        excerpt: 'Her er de artister, vi holder øje med lige nu.',
    },
];

const meta = {
    title: 'Organisms/Blocks/EditorialHero',
    component: EditorialHeroSlider,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    args: {
        locale: 'da',
        slides,
    },
    render: (args) => (
        <>
            <div aria-hidden="true" className="h-[var(--header-height)] xl:h-[var(--header-height-desktop)]" />
            <BaseBlock className="!max-w-full !p-0" classNameOuter="!p-0">
                <EditorialHeroSlider {...args} />
            </BaseBlock>
        </>
    ),
} satisfies Meta<typeof EditorialHeroSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FiveSlides: Story = {};
