'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  operatorsForFieldType,
  operatorLabel,
  operatorRequiresValue,
  parseLogicBlock,
  type LogicBlock,
  type LogicCondition,
  type CalculateAction,
  type Operator,
} from './logic-engine';
import { getChoiceOptions } from './types';
import type { EditorField } from './types';

const LAYOUT_TYPES = new Set([
  'STATEMENT', 'PAGE_BREAK', 'THANK_YOU_PAGE',
  'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
  'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
  'CONDITIONAL_LOGIC', 'RECAPTCHA',
]);

interface LogicBlockEditorProps {
  selfFieldId: string;
  allFields: EditorField[];
  value: LogicBlock;
  onChange: (next: LogicBlock) => void;
}

export function LogicBlockEditor({
  selfFieldId,
  allFields,
  value,
  onChange,
}: LogicBlockEditorProps) {
  // Fields that can be used as condition SOURCES: any answerable field,
  // excluding layout, the current logic block itself, and other logic blocks.
  const sourceFields = allFields.filter(
    (f) => !LAYOUT_TYPES.has(f.type) && f.id !== selfFieldId,
  );

  // Fields that can be CALCULATE targets: only CALCULATED fields.
  const targetFields = allFields.filter((f) => f.type === 'CALCULATED');

  function updateConditions(next: LogicCondition[]) {
    onChange({ ...value, conditions: next });
  }

  function updateActions(next: CalculateAction[]) {
    onChange({ ...value, actions: next });
  }

  function addCondition() {
    const first = sourceFields[0];
    const op = first ? operatorsForFieldType(first.type)[0] : 'equals';
    updateConditions([
      ...value.conditions,
      { sourceFieldId: first?.id ?? '', op: op as Operator, value: '' },
    ]);
  }

  function removeCondition(i: number) {
    updateConditions(value.conditions.filter((_, idx) => idx !== i));
  }

  function patchCondition(i: number, patch: Partial<LogicCondition>) {
    updateConditions(
      value.conditions.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );
  }

  function addAction() {
    const firstTarget = targetFields[0];
    updateActions([
      ...value.actions,
      { type: 'calculate', targetFieldId: firstTarget?.id ?? '', op: '+', value: 0 },
    ]);
  }

  function removeAction(i: number) {
    updateActions(value.actions.filter((_, idx) => idx !== i));
  }

  function patchAction(i: number, patch: Partial<CalculateAction>) {
    updateActions(
      value.actions.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">Logic</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          When the IF conditions match, every THEN action runs top-to-bottom.
        </p>
      </div>

      {/* IF */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            If
          </Label>
          {value.conditions.length > 1 && (
            <div className="flex rounded-md border overflow-hidden">
              <button
                type="button"
                onClick={() => onChange({ ...value, combinator: 'and' })}
                className={cn(
                  'px-2 py-0.5 text-[11px]',
                  value.combinator === 'and'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted',
                )}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, combinator: 'or' })}
                className={cn(
                  'px-2 py-0.5 text-[11px] border-l',
                  value.combinator === 'or'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted',
                )}
              >
                ANY
              </button>
            </div>
          )}
        </div>

        {value.conditions.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No conditions yet.</p>
        )}

        {value.conditions.map((cond, i) => {
          const source = sourceFields.find((f) => f.id === cond.sourceFieldId);
          const ops = source ? operatorsForFieldType(source.type) : (['equals'] as Operator[]);
          const needsValue = operatorRequiresValue(cond.op);
          const choiceOptions = source ? getChoiceOptions(source) : [];

          return (
            <div key={i} className="flex flex-col gap-1.5 rounded-md border p-2 bg-background">
              <div className="flex gap-1.5">
                <select
                  value={cond.sourceFieldId}
                  onChange={(e) => {
                    const nextId = (e.target as HTMLSelectElement).value;
                    const nextSource = sourceFields.find((f) => f.id === nextId);
                    const validOps = nextSource
                      ? operatorsForFieldType(nextSource.type)
                      : (['equals'] as Operator[]);
                    patchCondition(i, {
                      sourceFieldId: nextId,
                      op: validOps.includes(cond.op) ? cond.op : validOps[0],
                      value: '',
                    });
                  }}
                  className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs min-w-0"
                >
                  {sourceFields.length === 0 && (
                    <option value="">No fields available</option>
                  )}
                  {sourceFields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label || `(${f.type})`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeCondition(i)}
                  className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  aria-label="Remove condition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-1.5">
                <select
                  value={cond.op}
                  onChange={(e) =>
                    patchCondition(i, {
                      op: (e.target as HTMLSelectElement).value as Operator,
                      value: operatorRequiresValue(
                        (e.target as HTMLSelectElement).value as Operator,
                      )
                        ? cond.value
                        : '',
                    })
                  }
                  className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {ops.map((op) => (
                    <option key={op} value={op}>
                      {operatorLabel(op)}
                    </option>
                  ))}
                </select>
                {needsValue && (
                  choiceOptions.length > 0 ? (
                    <select
                      value={(cond.value as string) ?? ''}
                      onChange={(e) =>
                        patchCondition(i, { value: (e.target as HTMLSelectElement).value })
                      }
                      className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="">Pick an option…</option>
                      {choiceOptions.map((opt) => (
                        <option key={opt.value} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={
                        source && ['NUMBER', 'SCALE', 'RATING'].includes(source.type)
                          ? 'number'
                          : 'text'
                      }
                      value={(cond.value as string | number) ?? ''}
                      onChange={(e) =>
                        patchCondition(i, { value: (e.target as HTMLInputElement).value })
                      }
                      className="flex-1 h-8 text-xs"
                      placeholder="Value"
                    />
                  )
                )}
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCondition}
          disabled={sourceFields.length === 0}
          className="w-full border-dashed h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" /> Add condition
        </Button>
      </div>

      {/* THEN */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Then</Label>

        {value.actions.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No actions yet.</p>
        )}

        {value.actions.map((action, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-md border p-2 bg-background">
            <div className="flex gap-1.5">
              <span className="h-8 flex items-center rounded-md bg-muted px-2 text-xs text-muted-foreground">
                Calculate
              </span>
              <select
                value={action.targetFieldId}
                onChange={(e) =>
                  patchAction(i, { targetFieldId: (e.target as HTMLSelectElement).value })
                }
                className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs min-w-0"
              >
                {targetFields.length === 0 && (
                  <option value="">Add a Calculated field first</option>
                )}
                {targetFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label || '(unnamed)'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeAction(i)}
                className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                aria-label="Remove action"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <select
                value={action.op}
                onChange={(e) =>
                  patchAction(i, { op: (e.target as HTMLSelectElement).value as CalculateAction['op'] })
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="+">Add (+)</option>
                <option value="-">Subtract (−)</option>
                <option value="*">Multiply (×)</option>
                <option value="/">Divide (÷)</option>
              </select>
              <Input
                type="number"
                value={Number.isFinite(action.value) ? action.value : 0}
                onChange={(e) =>
                  patchAction(i, { value: Number((e.target as HTMLInputElement).value) || 0 })
                }
                className="flex-1 h-8 text-xs"
                placeholder="0"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAction}
          disabled={targetFields.length === 0}
          className="w-full border-dashed h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" /> Add action
        </Button>

        {targetFields.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            Actions need a Calculated field to target. Insert one with <code>/calculated field</code>.
          </p>
        )}
      </div>
    </div>
  );
}

export function defaultLogicBlock(): LogicBlock {
  return { combinator: 'and', conditions: [], actions: [] };
}

export function blockFromField(field: EditorField): LogicBlock {
  return parseLogicBlock(field.options) ?? defaultLogicBlock();
}
