'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { useModal } from '@/providers/modal-provider';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForm as useFormQuery } from '@/modules/form/form.queries';
import { useUpdateForm, useUpdateFormFields, useUpdateFormStatus } from '@/modules/form/form.queries';
import { EditorTopbar } from '@/features/editor/editor-topbar';
import { DocumentEditor, type DocumentEditorRef } from '@/features/editor/document-editor';
import { FormRenderer } from '@/features/public-form/form-renderer';
import { FieldConfig } from '@/features/editor/field-config';
import { PublishSuccessDialog } from '@/features/editor/publish-success-dialog';
import { EditorSelectionContext } from '@/features/editor/editor-selection-context';
import { validateFields, type ValidationError } from '@/features/editor/editor-validation';
import { CHOICE_FIELD_TYPES, toEditorField } from '@/features/editor/types';
import type { EditorField } from '@/features/editor/types';
import type { FormStatus } from '@/modules/form/types';

export default function FormEditorPage() {
  const params = useParams<{ workspaceId: string; formId: string }>();
  const { workspace } = useWorkspaceContext();
  const { confirm } = useModal();
  const workspaceId = workspace.id;
  const formId = params.formId;

  const { data: form, isLoading, isError, error, refetch } = useFormQuery(workspaceId, formId);
  const updateForm = useUpdateForm();
  const updateFormFields = useUpdateFormFields();
  const updateFormStatus = useUpdateFormStatus();

  const [fields, setFields] = useState<EditorField[]>([]);
  const [title, setTitle] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const editorRef = useRef<DocumentEditorRef>(null);
  const serverFieldIds = useRef<Set<string>>(new Set());

  // Initialize editor state from form data — runs once when form first loads
  useEffect(() => {
    if (form && !isReady) {
      setTitle(form.title);
      serverFieldIds.current = new Set((form.fields ?? []).map((f) => f.id));
      setFields(
        (form.fields ?? [])
          .sort((a, b) => a.order - b.order)
          .map(toEditorField),
      );
      setIsReady(true);
    }
  }, [form, isReady]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleFieldsChange = useCallback((newFields: EditorField[]) => {
    setFields(newFields);
    setValidationErrors([]);
  }, []);

  // Update a single field from the sidebar config panel
  const handleFieldUpdate = useCallback((updates: Partial<EditorField>) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedFieldId) return f;
        return { ...f, ...updates };
      }),
    );
    markDirty();
    setValidationErrors([]);

    // Sync changes back to TipTap
    if (editorRef.current && selectedFieldId) {
      const tiptapUpdates: Record<string, unknown> = {};
      if ('label' in updates) tiptapUpdates.label = updates.label;
      if ('description' in updates) tiptapUpdates.description = updates.description;
      if ('placeholder' in updates) tiptapUpdates.placeholder = updates.placeholder;
      if ('required' in updates) tiptapUpdates.required = updates.required;
      if ('options' in updates) tiptapUpdates.options = JSON.stringify(updates.options ?? []);
      if ('validations' in updates) tiptapUpdates.validations = JSON.stringify(updates.validations ?? null);
      editorRef.current.updateField(selectedFieldId, tiptapUpdates);
    }
  }, [selectedFieldId, markDirty]);

  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedFieldId) ?? null,
    [fields, selectedFieldId],
  );

  const validationErrorIds = useMemo(
    () => new Set(validationErrors.map((e) => e.fieldId)),
    [validationErrors],
  );

  const selectedFieldErrors = useMemo(
    () => validationErrors.filter((e) => e.fieldId === selectedFieldId).map((e) => e.message),
    [validationErrors, selectedFieldId],
  );

  async function handleSave() {
    // Client-side validation
    const errors = validateFields(fields);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSelectedFieldId(errors[0].fieldId);
      toast.error(`Please fix ${errors.length} field ${errors.length === 1 ? 'error' : 'errors'} before saving`);
      return;
    }

    setIsSaving(true);
    try {
      const promises: Promise<unknown>[] = [];

      if (title !== form?.title) {
        promises.push(
          updateForm.mutateAsync({ workspaceId, formId, data: { title } }),
        );
      }

      promises.push(
        updateFormFields.mutateAsync({
          workspaceId,
          formId,
          fields: fields.map((f) => ({
            id: serverFieldIds.current.has(f.id) ? f.id : undefined as unknown as string,
            type: f.type,
            label: f.label,
            description: f.description,
            placeholder: f.placeholder,
            required: f.required,
            order: f.order,
            options: f.options,
            validations: f.validations,
            conditionals: f.conditionals,
          })),
        }),
      );

      await Promise.all(promises);
      setIsDirty(false);
      // Refetch to get server-generated IDs for new fields
      const updated = await refetch();
      if (updated.data) {
        const serverFields = (updated.data.fields ?? [])
          .sort((a, b) => a.order - b.order)
          .map(toEditorField);
        setFields(serverFields);
        serverFieldIds.current = new Set(serverFields.map((f) => f.id));
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(status: FormStatus) {
    try {
      // If publishing, validate first
      if (status === 'PUBLISHED') {
        const errors = validateFields(fields);
        if (errors.length > 0) {
          setValidationErrors(errors);
          setSelectedFieldId(errors[0].fieldId);
          toast.error('Please fix field errors before publishing');
          return;
        }

        // Auto-save before publishing
        if (isDirty) {
          await handleSave();
        }
      }

      // Confirm before closing
      if (status === 'CLOSED') {
        const confirmed = await confirm({
          title: 'Close form',
          description: 'Closing this form will stop accepting new submissions. You can reopen it later.',
          confirmLabel: 'Close form',
          variant: 'destructive',
        });
        if (!confirmed) return;
      }

      await updateFormStatus.mutateAsync({ workspaceId, formId, data: { status } });

      if (status === 'PUBLISHED') {
        setShowPublishDialog(true);
      }
    } catch {
      // Error toast is handled by the mutation
    }
  }

  const formUrl = typeof window !== 'undefined' && form
    ? `${window.location.origin}/f/${form.slug}`
    : '';

  if (isLoading || !isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingState message="Loading form editor..." />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorState
          message={error?.message ?? 'Form not found'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <EditorTopbar
        workspaceId={workspaceId}
        formId={formId}
        workspaceName={workspace.name}
        title={title}
        status={form.status}
        isDirty={isDirty}
        isSaving={isSaving}
        isPreview={isPreview}
        onSave={handleSave}
        onStatusChange={handleStatusChange}
        onTogglePreview={() => setIsPreview(!isPreview)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main editor / preview area */}
        <div className="flex-1 overflow-y-auto bg-muted/20">
          {isPreview ? (
            <div className="max-w-xl mx-auto py-8 px-4">
              <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
                <FormRenderer
                  title={title}
                  description={form.description}
                  uploadContext={{ mode: 'owner', formId }}
                  fields={fields.map((f) => ({
                    ...f,
                    formId,
                    createdAt: '',
                    updatedAt: '',
                  }))}
                  isSubmitting={false}
                  onSubmit={() => {}}
                  previewMode
                  thankYouMessage={
                    (form.settings as { successPage?: { message?: string } } | null)?.successPage?.message
                  }
                />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Preview mode — submissions are not saved
              </p>
            </div>
          ) : (
            <div className="py-8 px-4">
              {/* Editable title */}
              <div className="max-w-2xl mx-auto mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); markDirty(); }}
                  placeholder="Form title"
                  className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
                />
                {form.description && (
                  <p className="mt-2 text-muted-foreground text-sm">{form.description}</p>
                )}
              </div>

              {/* TipTap document editor */}
              <EditorSelectionContext.Provider value={{ selectedFieldId, onSelectField: setSelectedFieldId, validationErrorIds }}>
                <DocumentEditor
                  ref={editorRef}
                  fields={fields}
                  onChange={handleFieldsChange}
                  onDirty={markDirty}
                />
              </EditorSelectionContext.Provider>

              {/* Helper text at bottom */}
              {fields.length === 0 && (
                <div className="max-w-2xl mx-auto mt-8 text-center space-y-3">
                  <p className="text-muted-foreground">
                    Type <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">/</kbd> to insert form blocks
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Add text fields, dropdowns, checkboxes, file uploads, and more.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar: field config */}
        {selectedField && !isPreview && (
          <div className="w-80 border-l bg-background overflow-y-auto p-4 shrink-0">
            <FieldConfig
              key={selectedField.id}
              field={selectedField}
              onChange={handleFieldUpdate}
              onClose={() => setSelectedFieldId(null)}
              errors={selectedFieldErrors}
            />
          </div>
        )}
      </div>

      {/* Publish success dialog */}
      <PublishSuccessDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        formUrl={formUrl}
      />
    </div>
  );
}
