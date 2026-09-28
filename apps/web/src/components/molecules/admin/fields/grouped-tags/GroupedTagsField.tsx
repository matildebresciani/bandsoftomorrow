'use client';

import {
    Button,
    EditIcon,
    FieldDescription,
    FieldError,
    FieldLabel,
    PlusIcon,
    ReactSelect,
    type ReactSelectOption,
    useAuth,
    useConfig,
    useDocumentDrawer,
    useDocumentEvents,
    useField,
    useLocale,
    useTranslation,
    withCondition,
} from '@payloadcms/ui';
import type { RelationshipFieldClientProps, Validate } from 'payload';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import da from '@/lib/messages/da.json';
import en from '@/lib/messages/en.json';
import { tagOptionSchema } from '@/lib/schemas/tag-picker';
import { getTagGroupId, groupTagOptions, selectedTagOptions } from './options';
import { useTagOptions } from './use-tag-options';
import './index.css';

const EditContext = React.createContext<{ edit?: (id: string) => void; label: string }>({ label: '' });

const TagLabel = ({ data }: { data: ReactSelectOption }) => {
    const { edit, label } = useContext(EditContext);
    const text = typeof data.label === 'string' ? data.label : '';
    const id = typeof data.value === 'string' ? data.value : '';
    return (
        <span className="grouped-tags__label">
            {text}
            {edit && id && (
                <button
                    type="button"
                    className="grouped-tags__edit"
                    aria-label={`${label}: ${text}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                        event.stopPropagation();
                        edit(id);
                    }}
                >
                    <EditIcon />
                </button>
            )}
        </span>
    );
};

const GroupedTagsFieldComponent = ({
    field,
    path: pathFromProps,
    readOnly,
    validate,
}: RelationshipFieldClientProps) => {
    const { config } = useConfig();
    const { code: locale } = useLocale();
    const { i18n } = useTranslation();
    const messages = (i18n.language === 'da' ? da : en).tagPicker;
    const { permissions } = useAuth();
    const memoizedValidate: Validate = useCallback(
        (value, options) => {
            if (typeof validate === 'function')
                return validate(value, {
                    ...options,
                    required: field.required,
                    relationTo: 'tags',
                    hasMany: true,
                    type: 'relationship',
                    name: field.name,
                });
            return true;
        },
        [field.required, field.name, validate],
    );
    const {
        value,
        setValue,
        path,
        disabled,
        formProcessing,
        showError,
        customComponents: { Label, Error: CustomError, Description, BeforeInput, AfterInput } = {},
    } = useField<string[]>({ potentiallyStalePath: pathFromProps, validate: memoizedValidate });
    const ids = useMemo(() => value ?? [], [value]);
    const isDisabled = Boolean(readOnly || disabled || formProcessing);
    const canCreate =
        !isDisabled && field.admin?.allowCreate !== false && Boolean(permissions?.collections?.tags?.create);
    const canEdit = !isDisabled && field.admin?.allowEdit !== false && Boolean(permissions?.collections?.tags?.update);
    const [search, setSearch] = useState('');
    const api = `${config.serverURL || ''}${config.routes.api}`;
    const options = useTagOptions(api, locale, ids, search);
    const grouped = useMemo(
        () => groupTagOptions(options.groups, options.candidates, locale),
        [options.groups, options.candidates, locale],
    );
    const selected = selectedTagOptions(ids, options.tags, messages.unavailable);
    const [drawerTarget, setDrawerTarget] = useState<{ id?: string } | null>(null);
    const pendingDrawer = useRef(false);
    const [DocumentDrawer, , { openDrawer, closeDrawer }] = useDocumentDrawer({
        collectionSlug: 'tags',
        id: drawerTarget?.id,
    });
    const { mostRecentUpdate } = useDocumentEvents();
    const { refresh } = options;
    useEffect(() => {
        if (mostRecentUpdate?.entitySlug === 'tags' || mostRecentUpdate?.entitySlug === 'tag-groups') refresh();
    }, [mostRecentUpdate, refresh]);
    useEffect(() => {
        if (drawerTarget && pendingDrawer.current) {
            pendingDrawer.current = false;
            openDrawer();
        }
    }, [drawerTarget, openDrawer]);
    const edit = useCallback((id?: string) => {
        pendingDrawer.current = true;
        setDrawerTarget({ id });
    }, []);
    const editContext = useMemo(
        () => ({ edit: canEdit ? edit : undefined, label: messages.edit }),
        [canEdit, edit, messages.edit],
    );

    return (
        <div
            className={`field-type relationship grouped-tags ${canCreate ? 'relationship--allow-create' : ''} ${showError ? 'error' : ''}`}
            id={`field-${path}`}
        >
            {Label || <FieldLabel htmlFor={`field-${path}-input`} label={field.label} required={field.required} />}
            {BeforeInput}
            {CustomError || <FieldError path={path} />}
            <div className="relationship__wrap grouped-tags__control">
                <EditContext.Provider value={editContext}>
                    <ReactSelect
                        inputId={`field-${path}-input`}
                        options={grouped}
                        value={selected}
                        components={{ MultiValueLabel: TagLabel }}
                        isMulti
                        isSortable={!isDisabled}
                        isSearchable
                        isClearable={!isDisabled}
                        disabled={isDisabled}
                        showError={showError}
                        isLoading={options.isLoading}
                        filterOption={() => true}
                        onInputChange={setSearch}
                        onMenuScrollToBottom={() => {
                            void options.loadMore();
                        }}
                        onChange={(selection) => {
                            if (isDisabled) return;
                            const nextIds = Array.isArray(selection)
                                ? selection.flatMap((option) =>
                                      typeof option.value === 'string' ? [option.value] : [],
                                  )
                                : [];
                            setValue([...new Set(nextIds)]);
                        }}
                        noOptionsMessage={() =>
                            options.hasError
                                ? messages.error
                                : options.isLoading
                                  ? messages.loading
                                  : options.groups.length
                                    ? messages.empty
                                    : messages.noGroups
                        }
                    />
                </EditContext.Provider>
                {canCreate && (
                    <div className="relationship-add-new">
                        <button
                            type="button"
                            className="relationship-add-new__add-button"
                            aria-label={messages.create}
                            title={messages.create}
                            onClick={() => edit()}
                        >
                            <PlusIcon />
                        </button>
                    </div>
                )}
            </div>
            <div className="grouped-tags__actions">
                {!isDisabled && options.hasMore && (
                    <Button
                        buttonStyle="secondary"
                        size="small"
                        disabled={options.isLoading}
                        onClick={() => {
                            void options.loadMore();
                        }}
                    >
                        {messages.more}
                    </Button>
                )}
                {options.hasError && (
                    <Button buttonStyle="secondary" size="small" onClick={refresh}>
                        {messages.retry}
                    </Button>
                )}
            </div>
            <output aria-live="polite" className="grouped-tags__status">
                {options.hasError
                    ? messages.error
                    : options.isLoading || options.isLoadingSelection
                      ? messages.loading
                      : ''}
            </output>
            {Description || <FieldDescription path={path} description={field.admin?.description} />}
            {AfterInput}
            <DocumentDrawer
                onSave={({ doc, operation }) => {
                    const result = tagOptionSchema.safeParse(doc);
                    if (
                        !isDisabled &&
                        operation === 'create' &&
                        result.success &&
                        options.groups.some((group) => group.id === getTagGroupId(result.data))
                    ) {
                        setValue([...new Set([...ids, result.data.id])]);
                    }
                    refresh();
                    closeDrawer();
                }}
                onDelete={() => {
                    refresh();
                    closeDrawer();
                }}
            />
        </div>
    );
};

/** Ordered relationship IDs, with taxonomy grouping confined to the editor presentation. */
export const GroupedTagsField = withCondition(GroupedTagsFieldComponent);
