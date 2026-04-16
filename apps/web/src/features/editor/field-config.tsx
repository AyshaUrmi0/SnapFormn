'use client';

import { X } from 'lucide-react';
import { slugify } from '@snapform/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { FIELD_TYPE_CONFIG } from '@/constants/field-types';
import { FieldOptionsEditor } from './field-options-editor';
import { MediaUploader } from './media-uploader';
import { CHOICE_FIELD_TYPES, MEDIA_FIELD_TYPES, getChoiceOptions, getMediaOptions } from './types';
import type { EditorField, FieldOption, MediaOptions } from './types';
import type { ResourceType } from '@/lib/cloudinary-upload';

const PREFILL_EXCLUDED_TYPES: string[] = [
  'STATEMENT', 'PAGE_BREAK', 'THANK_YOU_PAGE',
  'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
  'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
  'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA', 'COUNTRY',
];

interface FieldConfigProps {
  field: EditorField;
  onChange: (updates: Partial<EditorField>) => void;
  onClose: () => void;
  errors?: string[];
}

const NO_PLACEHOLDER_TYPES = [
  'STATEMENT', 'PAGE_BREAK', 'FILE_UPLOAD', 'RATING', 'SCALE', 'CHECKBOX',
  'MATRIX', 'RANKING', 'SIGNATURE', 'THANK_YOU_PAGE',
  'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
  'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
  'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA', 'COUNTRY',
];
const NO_REQUIRED_TYPES = [
  'STATEMENT', 'PAGE_BREAK', 'THANK_YOU_PAGE',
  'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
  'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
  'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA', 'COUNTRY',
];

interface HiddenOptions {
  paramName?: string;
  defaultValue?: string;
}

function getHiddenOptions(field: EditorField): HiddenOptions {
  if (field.options && !Array.isArray(field.options) && typeof field.options === 'object') {
    return field.options as HiddenOptions;
  }
  return {};
}

export function FieldConfig({ field, onChange, onClose, errors }: FieldConfigProps) {
  const config = FIELD_TYPE_CONFIG[field.type];
  const showPlaceholder = !NO_PLACEHOLDER_TYPES.includes(field.type);
  const showRequired = !NO_REQUIRED_TYPES.includes(field.type);
  const showOptions = CHOICE_FIELD_TYPES.includes(field.type);
  const showMediaUploader = MEDIA_FIELD_TYPES.includes(field.type);
  const showHiddenFieldInputs = field.type === 'HIDDEN';
  const hiddenOptions = showHiddenFieldInputs ? getHiddenOptions(field) : {};

  const showPrefillKey = !PREFILL_EXCLUDED_TYPES.includes(field.type);
  const currentPrefillKey = (field.validations as { prefillKey?: string } | null)?.prefillKey ?? '';
  const derivedPrefillKey = slugify(field.label || '');

  const hasLabelError = errors?.some((e) => e.toLowerCase().includes('label'));
  const hasOptionsError = errors?.some((e) => e.toLowerCase().includes('option'));

  // Cloudinary resource type per block
  const resourceTypeFor: Record<string, ResourceType> = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'raw',
    EMBED: 'auto',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{config.label}</h3>
          <p className="text-xs text-muted-foreground">Configure this field</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onChange({ label: (e.target as HTMLInputElement).value })}
            placeholder="Field label"
            className={hasLabelError ? 'border-destructive' : ''}
          />
          {hasLabelError && (
            <p className="text-sm text-destructive">Label is required</p>
          )}
        </div>

        {showPlaceholder && (
          <div className="space-y-1.5">
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder ?? ''}
              onChange={(e) => onChange({ placeholder: (e.target as HTMLInputElement).value || null })}
              placeholder="Placeholder text (optional)"
            />
          </div>
        )}

        {showRequired && (
          <div className="flex items-center justify-between">
            <Label htmlFor="field-required">Required</Label>
            <Switch
              id="field-required"
              checked={field.required}
              onCheckedChange={(checked) => onChange({ required: checked })}
            />
          </div>
        )}

        {showPrefillKey && (
          <div className="space-y-1.5">
            <Label htmlFor="field-prefill-key">URL pre-fill key (optional)</Label>
            <Input
              id="field-prefill-key"
              value={currentPrefillKey}
              onChange={(e) =>
                onChange({
                  validations: {
                    ...(field.validations ?? {}),
                    prefillKey: (e.target as HTMLInputElement).value,
                  },
                })
              }
              placeholder={derivedPrefillKey || 'auto-generated from label'}
            />
            <p className="text-xs text-muted-foreground">
              Pre-fills this field from the URL. E.g. <code className="text-[10px]">?{currentPrefillKey || derivedPrefillKey || 'key'}=value</code>
            </p>
          </div>
        )}
      </div>

      {showOptions && (
        <>
          <Separator />
          <div>
            <FieldOptionsEditor
              options={getChoiceOptions(field)}
              onChange={(options: FieldOption[]) => onChange({ options })}
            />
            {hasOptionsError && (
              <p className="text-sm text-destructive mt-1">At least one option is required</p>
            )}
          </div>
        </>
      )}

      {showMediaUploader && (
        <>
          <Separator />
          <MediaUploader
            value={getMediaOptions(field)}
            onChange={(next: MediaOptions) => onChange({ options: next as Record<string, unknown> })}
            fieldId={field.id}
            resourceType={resourceTypeFor[field.type] ?? 'auto'}
            label={field.type === 'IMAGE' ? 'Image' : field.type === 'VIDEO' ? 'Video' : field.type === 'AUDIO' ? 'Audio' : 'Embed URL'}
            allowExternalUrl={field.type !== 'IMAGE'}
          />
        </>
      )}

      {showHiddenFieldInputs && (
        <>
          <Separator />
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Hidden field</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Silently capture a value from the URL query string. Respondents never see this.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hidden-param-name">URL parameter name</Label>
              <Input
                id="hidden-param-name"
                value={hiddenOptions.paramName ?? ''}
                onChange={(e) =>
                  onChange({
                    options: {
                      ...hiddenOptions,
                      paramName: (e.target as HTMLInputElement).value,
                    } as Record<string, unknown>,
                  })
                }
                placeholder="utm_source"
              />
              <p className="text-xs text-muted-foreground">
                Reads from <code className="text-[10px]">?{hiddenOptions.paramName || 'param'}=value</code> on the form URL.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hidden-default-value">Default value</Label>
              <Input
                id="hidden-default-value"
                value={hiddenOptions.defaultValue ?? ''}
                onChange={(e) =>
                  onChange({
                    options: {
                      ...hiddenOptions,
                      defaultValue: (e.target as HTMLInputElement).value,
                    } as Record<string, unknown>,
                  })
                }
                placeholder="Used when the URL has no such parameter"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
