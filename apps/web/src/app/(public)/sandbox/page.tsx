'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Eye,
  RotateCcw,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentEditor, type DocumentEditorRef } from '@/features/editor/document-editor';
import { FormRenderer } from '@/features/public-form/form-renderer';
import { FieldConfig } from '@/features/editor/field-config';
import { EditorSelectionContext } from '@/features/editor/editor-selection-context';
import { GuestClaimDialog } from '@/features/editor/guest-claim-dialog';
import { validateFields, type ValidationError } from '@/features/editor/editor-validation';
import {
  loadGuestDraft,
  saveGuestDraft,
  clearGuestDraft,
  createDefaultGuestDraft,
} from '@/lib/guest-draft';
import { ROUTES } from '@/constants/routes';
import type { EditorField } from '@/features/editor/types';

export default function SandboxPage() {
  const [fields, setFields] = useState<EditorField[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('Saved');
  const editorRef = useRef<DocumentEditorRef>(null);

  useEffect(() => {
    const draft = loadGuestDraft();
    setTitle(draft.title);
    setDescription(draft.description);
    setFields(draft.fields);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveGuestDraft({ title, description, fields });
    setLastSaved('Saved locally');
  }, [title, description, fields, isReady]);

  const handleFieldsChange = useCallback((newFields: EditorField[]) => {
    setFields(newFields);
    setValidationErrors([]);
  }, []);

  const handleFieldUpdate = useCallback(
    (updates: Partial<EditorField>) => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id !== selectedFieldId) return f;
          return { ...f, ...updates };
        }),
      );
      setValidationErrors([]);

      if (editorRef.current && selectedFieldId) {
        const tiptapUpdates: Record<string, unknown> = {};
        if ('label' in updates) tiptapUpdates.label = updates.label;
        if ('description' in updates) tiptapUpdates.description = updates.description;
        if ('placeholder' in updates) tiptapUpdates.placeholder = updates.placeholder;
        if ('required' in updates) tiptapUpdates.required = updates.required;
        if ('options' in updates) tiptapUpdates.options = JSON.stringify(updates.options ?? []);
        if ('validations' in updates)
          tiptapUpdates.validations = JSON.stringify(updates.validations ?? null);
        editorRef.current.updateField(selectedFieldId, tiptapUpdates);
      }
    },
    [selectedFieldId],
  );

  function handleReset() {
    if (window.confirm('Reset this sandbox form back to the default example?')) {
      clearGuestDraft();
      const fresh = createDefaultGuestDraft();
      setTitle(fresh.title);
      setDescription(fresh.description);
      setFields(fresh.fields);
      setSelectedFieldId(null);
      toast.success('Sandbox reset to default');
    }
  }

  function handleOpenClaimDialog() {
    const errors = validateFields(fields);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSelectedFieldId(errors[0].fieldId);
      toast.error('Please fix field errors before saving');
      return;
    }
    setShowClaimDialog(true);
  }

  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedFieldId) ?? null,
    [fields, selectedFieldId],
  );

  const selectedFieldErrors = useMemo(
    () =>
      validationErrors
        .filter((e) => e.fieldId === selectedFieldId)
        .map((e) => e.message),
    [validationErrors, selectedFieldId],
  );

  const validationErrorIds = useMemo(
    () => new Set(validationErrors.map((e) => e.fieldId)),
    [validationErrors],
  );

  if (!isReady) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Initializing Sandbox...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-0 bg-background overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 h-13 shrink-0 bg-background/95 backdrop-blur z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-xs">
              {title || 'Untitled Sandbox Form'}
            </span>
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10 hidden sm:inline-flex">
              Guest Sandbox
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{lastSaved}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
            title="Reset sandbox"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            variant={isPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            <span>{isPreview ? 'Exit Preview' : 'Preview'}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenClaimDialog}
            className="text-xs shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            <span>Save & Publish</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-y-auto bg-muted/20">
          {isPreview ? (
            <div className="max-w-xl mx-auto py-10 px-4">
              <div className="rounded-xl border bg-card p-6 sm:p-10 shadow-sm">
                <FormRenderer
                  title={title}
                  description={description}
                  uploadContext={{ mode: 'respondent', slug: 'sandbox-preview' }}
                  fields={fields.map((f) => ({
                    ...f,
                    formId: 'sandbox',
                    createdAt: '',
                    updatedAt: '',
                  }))}
                  isSubmitting={false}
                  onSubmit={() => {
                    toast.success('Mock submission received! In live mode, responses are recorded in your database.');
                  }}
                  previewMode
                />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Interactive preview — test filling your form as a respondent
              </p>
            </div>
          ) : (
            <div className="py-8 px-4">
              <div className="max-w-2xl mx-auto mb-6">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Form title"
                  className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Form description (optional)"
                  className="w-full mt-2 text-sm text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30"
                />
              </div>

              <EditorSelectionContext.Provider
                value={{
                  selectedFieldId,
                  onSelectField: setSelectedFieldId,
                  validationErrorIds,
                }}
              >
                <DocumentEditor
                  ref={editorRef}
                  fields={fields}
                  onChange={handleFieldsChange}
                  onDirty={() => setLastSaved('Unsaved changes')}
                />
              </EditorSelectionContext.Provider>

              {fields.length === 0 && (
                <div className="max-w-2xl mx-auto mt-8 text-center space-y-3">
                  <p className="text-muted-foreground">
                    Type <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">/</kbd> to insert any of 36 form blocks
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Add text fields, choices, ratings, matrix tables, file uploads, and more.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedField && !isPreview && (
          <div className="w-80 border-l bg-background overflow-y-auto p-4 shrink-0 shadow-sm animate-in slide-in-from-right-4">
            <FieldConfig
              key={selectedField.id}
              field={selectedField}
              allFields={fields}
              onChange={handleFieldUpdate}
              onClose={() => setSelectedFieldId(null)}
              errors={selectedFieldErrors}
            />
          </div>
        )}
      </div>

      <GuestClaimDialog
        open={showClaimDialog}
        onOpenChange={setShowClaimDialog}
        title={title}
        description={description}
        fields={fields}
      />
    </div>
  );
}
