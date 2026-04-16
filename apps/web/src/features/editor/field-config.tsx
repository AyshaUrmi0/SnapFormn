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
import { LogicBlockEditor, blockFromField } from './logic-block-editor';
import { CHOICE_FIELD_TYPES, MEDIA_FIELD_TYPES, getChoiceOptions, getMediaOptions } from './types';
import type { EditorField, FieldOption, MediaOptions } from './types';
import type { LogicBlock, CalculatedOptions } from './logic-engine';
import type { ResourceType } from '@/lib/cloudinary-upload';

const PREFILL_EXCLUDED_TYPES: string[] = [
  'STATEMENT', 'PAGE_BREAK', 'THANK_YOU_PAGE',
  'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
  'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
  'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA', 'COUNTRY',
];

interface FieldConfigProps {
  field: EditorField;
  allFields: EditorField[];
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

function getCalculatedOptions(field: EditorField): CalculatedOptions {
  if (field.options && !Array.isArray(field.options) && typeof field.options === 'object') {
    return field.options as CalculatedOptions;
  }
  return {};
}

export function FieldConfig({ field, allFields, onChange, onClose, errors }: FieldConfigProps) {
  const config = FIELD_TYPE_CONFIG[field.type];
  const showPlaceholder = !NO_PLACEHOLDER_TYPES.includes(field.type);
  const showRequired = !NO_REQUIRED_TYPES.includes(field.type);
  const showOptions = CHOICE_FIELD_TYPES.includes(field.type);
  const showMediaUploader = MEDIA_FIELD_TYPES.includes(field.type);
  const showHiddenFieldInputs = field.type === 'HIDDEN';
  const hiddenOptions = showHiddenFieldInputs ? getHiddenOptions(field) : {};
  const showCalculatedInputs = field.type === 'CALCULATED';
  const calculatedOptions = showCalculatedInputs ? getCalculatedOptions(field) : {};
  const showLogicEditor = field.type === 'CONDITIONAL_LOGIC';

  const showPrefillKey = !PREFILL_EXCLUDED_TYPES.includes(field.type);
  const currentPrefillKey = (field.validations as { prefillKey?: string } | null)?.prefillKey ?? '';
  const derivedPrefillKey = slugify(field.label || '');

  const hasLabelError = errors?.some((e) => e.toLowerCase().includes('label'));
  const hasOptionsError = errors?.some((e) => e.toLowerCase().includes('option'));

  // Text-display blocks can pipe calculated field values via `@name`.
  const TEXT_BLOCKS: string[] = [
    'STATEMENT', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'TITLE', 'LABEL',
  ];
  const showMentionHint = TEXT_BLOCKS.includes(field.type);
  const calculatedFieldNames = allFields
    .filter((f) => f.type === 'CALCULATED' && f.label.trim().length > 0)
    .map((f) => f.label.trim());

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
          {showMentionHint && calculatedFieldNames.length > 0 && (
            <div className="text-[11px] text-muted-foreground space-y-1">
              <p>Insert a live calculated value with:</p>
              <div className="flex flex-wrap gap-1">
                {calculatedFieldNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      const token = `@${name}`;
                      const current = field.label ?? '';
                      const nextLabel = current
                        ? (current.endsWith(' ') ? current + token : current + ' ' + token)
                        : token;
                      onChange({ label: nextLabel });
                    }}
                    className="rounded border bg-muted px-1.5 py-0.5 font-mono hover:bg-muted-foreground/10"
                  >
                    @{name}
                  </button>
                ))}
              </div>
            </div>
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

      {showLogicEditor && (
        <>
          <Separator />
          <LogicBlockEditor
            selfFieldId={field.id}
            allFields={allFields}
            value={blockFromField(field)}
            onChange={(next: LogicBlock) =>
              onChange({ options: next as unknown as Record<string, unknown> })
            }
          />
        </>
      )}

      {showCalculatedInputs && (
        <>
          <Separator />
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Calculated field</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invisible to respondents. Its value is driven by Logic blocks
                and can be displayed in text with{' '}
                <code className="text-[10px]">@{field.label || 'name'}</code>.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calc-value-type">Value type</Label>
              <select
                id="calc-value-type"
                value={calculatedOptions.valueType ?? 'number'}
                onChange={(e) => {
                  const next = (e.target as HTMLSelectElement).value as 'number' | 'text';
                  onChange({
                    options: {
                      ...calculatedOptions,
                      valueType: next,
                      initialValue: next === 'number' ? 0 : '',
                    } as Record<string, unknown>,
                  });
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="number">Number (for math)</option>
                <option value="text">Text (for labels)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Initial value</Label>
              <select
                value={calculatedOptions.initialValueFieldId ? 'field' : 'literal'}
                onChange={(e) => {
                  const next = (e.target as HTMLSelectElement).value;
                  if (next === 'literal') {
                    onChange({
                      options: {
                        ...calculatedOptions,
                        initialValueFieldId: null,
                      } as Record<string, unknown>,
                    });
                  } else {
                    const firstPickable = allFields.find(
                      (f) =>
                        f.id !== field.id &&
                        f.type !== 'CALCULATED' &&
                        f.type !== 'CONDITIONAL_LOGIC' &&
                        !['STATEMENT','PAGE_BREAK','THANK_YOU_PAGE','HEADING_1','HEADING_2','HEADING_3','DIVIDER','TITLE','LABEL','IMAGE','VIDEO','AUDIO','EMBED','RECAPTCHA'].includes(f.type),
                    );
                    onChange({
                      options: {
                        ...calculatedOptions,
                        initialValueFieldId: firstPickable?.id ?? '',
                      } as Record<string, unknown>,
                    });
                  }
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="literal">Write a value</option>
                <option value="field">Use another field's answer</option>
              </select>

              {!calculatedOptions.initialValueFieldId && (
                <Input
                  id="calc-initial-value"
                  type={calculatedOptions.valueType === 'text' ? 'text' : 'number'}
                  value={
                    calculatedOptions.initialValue === undefined
                      ? ''
                      : String(calculatedOptions.initialValue)
                  }
                  onChange={(e) => {
                    const raw = (e.target as HTMLInputElement).value;
                    const parsed =
                      calculatedOptions.valueType === 'text' ? raw : (raw === '' ? 0 : Number(raw));
                    onChange({
                      options: {
                        ...calculatedOptions,
                        initialValue: parsed,
                      } as Record<string, unknown>,
                    });
                  }}
                  placeholder={calculatedOptions.valueType === 'text' ? '' : '0'}
                />
              )}

              {calculatedOptions.initialValueFieldId !== null &&
                calculatedOptions.initialValueFieldId !== undefined && (
                  <select
                    value={calculatedOptions.initialValueFieldId ?? ''}
                    onChange={(e) =>
                      onChange({
                        options: {
                          ...calculatedOptions,
                          initialValueFieldId: (e.target as HTMLSelectElement).value,
                        } as Record<string, unknown>,
                      })
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="">Pick a field…</option>
                    {allFields
                      .filter(
                        (f) =>
                          f.id !== field.id &&
                          f.type !== 'CALCULATED' &&
                          f.type !== 'CONDITIONAL_LOGIC' &&
                          ![
                            'STATEMENT','PAGE_BREAK','THANK_YOU_PAGE',
                            'HEADING_1','HEADING_2','HEADING_3',
                            'DIVIDER','TITLE','LABEL',
                            'IMAGE','VIDEO','AUDIO','EMBED','RECAPTCHA',
                          ].includes(f.type),
                      )
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label || `(${f.type})`}
                        </option>
                      ))}
                  </select>
                )}

              <p className="text-xs text-muted-foreground">
                Logic blocks reset the field to this value before each recalculation.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
