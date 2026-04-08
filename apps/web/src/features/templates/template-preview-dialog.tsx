'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormPreview } from '@/features/editor/form-preview';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { useCreateForm, useUpdateFormFields } from '@/modules/form/form.queries';
import { queryKeys } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import type { FormTemplate, TemplateField } from '@/constants/form-templates';
import type { EditorField } from '@/features/editor/types';

function templateFieldsToEditorFields(fields: TemplateField[]): EditorField[] {
  return fields.map((f) => ({
    id: crypto.randomUUID(),
    type: f.type,
    label: f.label,
    description: f.description,
    placeholder: f.placeholder,
    required: f.required,
    order: f.order,
    options: f.options,
    validations: null,
    conditionals: null,
  }));
}

interface TemplatePreviewDialogProps {
  template: FormTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewDialog({ template, open, onOpenChange }: TemplatePreviewDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: workspaces } = useWorkspaces();
  const createForm = useCreateForm();
  const updateFormFields = useUpdateFormFields();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const workspaceId = selectedWorkspaceId || workspaces?.[0]?.id || '';

  const previewFields = useMemo(() => {
    if (!template) return [];
    return templateFieldsToEditorFields(template.fields);
  }, [template]);

  async function handleUseTemplate() {
    if (!template || !workspaceId) return;

    setIsCreating(true);
    try {
      // Add a short random suffix to the slug so users can create
      // multiple forms from the same template in one workspace
      const suffix = crypto.randomUUID().slice(0, 6);
      const slug = `${template.id}-${suffix}`;

      const newForm = await createForm.mutateAsync({
        workspaceId,
        data: { title: template.title, description: template.description, slug },
      });

      await updateFormFields.mutateAsync({
        workspaceId,
        formId: newForm.id,
        fields: template.fields.map((f) => ({
          type: f.type,
          label: f.label,
          description: f.description,
          placeholder: f.placeholder,
          required: f.required,
          order: f.order,
          options: f.options,
          validations: null,
          conditionals: null,
        })),
      });

      // Wait for the detail query to refetch with fields before navigating,
      // otherwise the editor initializes with 0 fields from stale cache
      await queryClient.refetchQueries({
        queryKey: queryKeys.forms.detail(workspaceId, newForm.id),
      });

      onOpenChange(false);
      router.push(ROUTES.workspace(workspaceId).form(newForm.id).EDIT);
    } catch {
      // Error toasts handled by mutation onError callbacks
    } finally {
      setIsCreating(false);
    }
  }

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-4 px-4 min-h-0">
          <FormPreview title={template.title} fields={previewFields} />
        </div>

        <DialogFooter>
          {workspaces && workspaces.length > 1 && (
            <select
              value={workspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm mr-auto"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          )}
          <Button
            onClick={handleUseTemplate}
            disabled={isCreating || !workspaceId}
          >
            {isCreating && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Use this template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
