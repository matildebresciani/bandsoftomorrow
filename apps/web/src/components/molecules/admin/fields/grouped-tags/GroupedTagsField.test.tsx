// @vitest-environment happy-dom
import assert from 'node:assert/strict';
import type { DocumentDrawerProps, ReactSelect } from '@payloadcms/ui';
import React, { act, type ComponentProps, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { GroupedTagsField } from './GroupedTagsField';

const state = vi.hoisted<{
    locale: string;
    ids: string[];
    canWrite: boolean;
    setValue: Mock<(value: string[]) => void>;
    openDrawer: Mock<() => void>;
    closeDrawer: Mock<() => void>;
    select?: ComponentProps<typeof ReactSelect>;
    drawer?: DocumentDrawerProps;
}>(() => ({
    locale: 'da',
    ids: ['legacy', 'rock'],
    canWrite: true,
    setValue: vi.fn(),
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
}));

vi.mock('@payloadcms/ui', () => ({
    useAuth: () => ({ permissions: { collections: { tags: { create: state.canWrite, update: state.canWrite } } } }),
    useConfig: () => ({ config: { routes: { api: '/api' } } }),
    useLocale: () => ({ code: state.locale }),
    useTranslation: () => ({ i18n: { language: 'en' } }),
    useDocumentEvents: () => ({ mostRecentUpdate: null }),
    useDocumentDrawer: () => [
        (props: DocumentDrawerProps) => {
            state.drawer = props;
            return null;
        },
        null,
        { openDrawer: state.openDrawer, closeDrawer: state.closeDrawer },
    ],
    useField: () => {
        const [value, setValue] = React.useState(state.ids);
        return {
            value,
            path: 'tags',
            disabled: false,
            showError: true,
            setValue: (next: string[]) => {
                state.setValue(next);
                setValue(next);
            },
        };
    },
    withCondition: (component: unknown) => component,
    FieldLabel: () => <label htmlFor="field-tags-input">Tags</label>,
    FieldError: () => <span>Validation feedback</span>,
    FieldDescription: () => null,
    EditIcon: () => <span>Edit</span>,
    PlusIcon: () => <span>+</span>,
    Button: ({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) => (
        <button type="button" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
    ReactSelect: (props: ComponentProps<typeof ReactSelect>) => {
        state.select = props;
        const Label = props.components?.MultiValueLabel;
        return (
            <div>
                <input
                    id={props.inputId}
                    disabled={props.disabled}
                    onChange={(event) => props.onInputChange?.(event.target.value)}
                />
                {Array.isArray(props.value) &&
                    props.value.map((option) => (
                        <span key={String(option.value)}>{Label ? <Label data={option} /> : String(option.label)}</span>
                    ))}
            </div>
        );
    },
}));

let root: Root;
let container: HTMLDivElement;
const fetchMock = vi.fn<typeof fetch>();
const group = { id: 'genre', name: 'Genre', collectionsOnTagGroup: ['posts'] };
const tag = { id: 'rock', name: 'Rock', tag: 'Rock music', tagGroup: 'genre' };
const response = (docs: unknown[], nextPage: number | null = null) => Response.json({ docs, nextPage });
const render = async (isReadOnly = false) =>
    act(async () => {
        root.render(
            <GroupedTagsField
                path="tags"
                readOnly={isReadOnly}
                field={{ name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true }}
            />,
        );
    });
const settle = async () =>
    act(async () => {
        await vi.advanceTimersByTimeAsync(250);
    });
const search = async (value: string) =>
    act(async () => {
        state.select?.onInputChange?.(value);
    });

beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('fetch', fetchMock);
    state.locale = 'da';
    state.ids = ['legacy', 'rock'];
    state.canWrite = true;
    state.select = undefined;
    state.drawer = undefined;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    fetchMock.mockImplementation(async (url, init) => {
        assert(init?.body instanceof URLSearchParams);
        if (String(url).endsWith('tag-groups')) return response([group]);
        if (init.body.has('where[id][in][0]'))
            return response([tag, { id: 'legacy', name: 'Old tag', tagGroup: 'unassigned' }]);
        return response([tag]);
    });
});

afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('post tag editor', () => {
    it('keeps ordered selections separate from dropdown choices, and supports removal and reorder', async () => {
        await render();
        await settle();
        expect(state.select?.options).toEqual([{ label: 'Genre', options: [{ label: 'Rock music', value: 'rock' }] }]);
        expect(state.select?.value).toEqual([
            { label: 'Old tag', value: 'legacy' },
            { label: 'Rock music', value: 'rock' },
        ]);
        expect(state.select).toMatchObject({ isMulti: true, isSortable: true, showError: true });
        expect(container.textContent).toContain('Validation feedback');
        await act(async () => state.select?.onChange?.([{ value: 'rock' }, { value: 'legacy' }]));
        expect(state.setValue).toHaveBeenLastCalledWith(['rock', 'legacy']);
        await act(async () => state.select?.onChange?.([{ value: 'legacy' }]));
        expect(state.setValue).toHaveBeenLastCalledWith(['legacy']);
    });

    it('preserves saved IDs and labels on a network failure and retries without editing the form', async () => {
        await render();
        await settle();
        fetchMock.mockRejectedValue(new TypeError('offline'));
        await search('test');
        await settle();
        expect(container.textContent).toContain('Your selections have been kept');
        expect(container.textContent).toContain('Old tag');
        expect(state.select?.value).toHaveLength(2);
        expect(state.setValue).not.toHaveBeenCalled();
        const retry = [...container.querySelectorAll('button')].find(
            (button) => button.textContent === 'Retry loading tags',
        );
        assert(retry);
        fetchMock.mockImplementation(async () => response([]));
        await act(async () => retry.click());
        await settle();
        expect(container.textContent).not.toContain('Your selections have been kept');
        expect(state.select?.value).toHaveLength(2);
    });

    it('ignores a stale search response even when fetch does not honor cancellation', async () => {
        await render();
        await settle();
        let completeOld: ((result: Response) => void) | undefined;
        fetchMock.mockImplementation(async (url, init) => {
            assert(init?.body instanceof URLSearchParams);
            if (String(url).endsWith('tag-groups')) return response([group]);
            if (init.body.get('where[and][1][or][0][tag][like]') === 'old') {
                return new Promise<Response>((resolve) => {
                    completeOld = resolve;
                });
            }
            return response([{ ...tag, id: 'new', tag: 'New result' }]);
        });
        await search('old');
        await settle();
        await search('new');
        await settle();
        assert(completeOld);
        await act(async () => completeOld?.(response([{ ...tag, tag: 'Stale result' }])));
        expect(state.select?.options).toEqual([{ label: 'Genre', options: [{ value: 'new', label: 'New result' }] }]);
        expect(state.setValue).not.toHaveBeenCalled();
    });

    it('refreshes localized selections and ignores the old locale response', async () => {
        let completeDanish: ((result: Response) => void) | undefined;
        fetchMock.mockImplementation(async (url, init) => {
            assert(init?.body instanceof URLSearchParams);
            if (String(url).endsWith('tag-groups')) return response([group]);
            if (init.body.has('where[id][in][0]') && init.body.get('locale') === 'da') {
                return new Promise<Response>((resolve) => {
                    completeDanish = resolve;
                });
            }
            return response([{ ...tag, tag: 'English label' }]);
        });
        await render();
        await settle();
        state.locale = 'en';
        await render();
        await settle();
        assert(completeDanish);
        await act(async () => completeDanish?.(response([{ ...tag, tag: 'Danish label' }])));
        expect(state.select?.value).toContainEqual({ value: 'rock', label: 'English label' });
        expect(state.select?.value).toContainEqual({ value: 'legacy', label: 'Unavailable tag (legacy)' });
        expect(state.setValue).not.toHaveBeenCalled();
    });

    it('loads subsequent pages and keeps options after a pagination failure', async () => {
        let hasFailed = false;
        fetchMock.mockImplementation(async (url, init) => {
            assert(init?.body instanceof URLSearchParams);
            if (String(url).endsWith('tag-groups')) return response([group]);
            if (init.body.has('where[id][in][0]')) return response([tag]);
            if (init.body.get('page') === '2') {
                if (!hasFailed) {
                    hasFailed = true;
                    return new Response('', { status: 503 });
                }
                return response([{ ...tag, id: 'jazz', tag: 'Jazz' }]);
            }
            return response([tag], 2);
        });
        await render();
        await settle();
        await act(async () => state.select?.onMenuScrollToBottom?.());
        expect(state.select?.options).toEqual([{ label: 'Genre', options: [{ value: 'rock', label: 'Rock music' }] }]);
        expect(container.textContent).toContain('Your selections have been kept');
        await act(async () => state.select?.onMenuScrollToBottom?.());
        expect(state.select?.options).toEqual([
            {
                label: 'Genre',
                options: [
                    { value: 'jazz', label: 'Jazz' },
                    { value: 'rock', label: 'Rock music' },
                ],
            },
        ]);
    });

    it('disables changes, sorting and drawers when read-only', async () => {
        await render(true);
        await settle();
        expect(state.select).toMatchObject({ disabled: true, isSortable: false, isClearable: false });
        expect(container.querySelector('input')?.disabled).toBe(true);
        expect(container.querySelector('button')).toBeNull();
        await act(async () => state.select?.onChange?.([]));
        expect(state.setValue).not.toHaveBeenCalled();
    });

    it('offers document drawers only with create/update permission', async () => {
        await render();
        await settle();
        const edit = container.querySelector('button[aria-label="Edit tag: Rock music"]');
        assert(edit instanceof HTMLButtonElement);
        await act(async () => edit.click());
        expect(state.openDrawer).toHaveBeenCalled();
        state.canWrite = false;
        await render();
        expect(container.querySelector('button')).toBeNull();
    });

    it('refreshes after drawer saves and only selects newly created tags in eligible groups', async () => {
        await render();
        await settle();
        const before = fetchMock.mock.calls.length;
        const createdTag = { id: 'new', name: 'New', tagGroup: 'genre' };
        const ineligibleTag = { id: 'excluded', name: 'Excluded', tagGroup: 'unassigned' };
        await act(async () => {
            await state.drawer?.onSave?.({
                doc: createdTag,
                operation: 'create',
                result: {},
            });
        });
        expect(state.setValue).toHaveBeenLastCalledWith(['legacy', 'rock', 'new']);
        expect(state.closeDrawer).toHaveBeenCalled();
        await settle();
        expect(fetchMock.mock.calls.length).toBeGreaterThan(before);
        state.setValue.mockClear();
        await act(async () => {
            await state.drawer?.onSave?.({
                doc: ineligibleTag,
                operation: 'create',
                result: {},
            });
        });
        expect(state.setValue).not.toHaveBeenCalled();
    });
});
