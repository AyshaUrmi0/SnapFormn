
import type { FormField } from '@/modules/form/types';

export type Operator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'includes'
  | 'not_includes'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'is_empty'
  | 'is_not_empty';

export interface LogicCondition {
  sourceFieldId: string;
  op: Operator;
  value: unknown;
}

export interface CalculateAction {
  type: 'calculate';
  targetFieldId: string;
  op: '+' | '-' | '*' | '/';
  value: number;
}

export interface VisibilityAction {
  type: 'show' | 'hide';
  targetFieldId: string;
}

export type LogicAction = CalculateAction | VisibilityAction;

export type ActionType = LogicAction['type'];

export interface LogicBlock {
  combinator: 'and' | 'or';
  conditions: LogicCondition[];
  actions: LogicAction[];
}

export interface CalculatedOptions {
  valueType?: 'number' | 'text';
  initialValue?: number | string;
  initialValueFieldId?: string | null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function containsValue(haystack: unknown, needle: unknown): boolean {
  if (typeof haystack === 'string' && typeof needle === 'string') {
    return haystack.toLowerCase().includes(needle.toLowerCase());
  }
  return false;
}

function multiIncludes(list: unknown, needle: unknown): boolean {
  if (!Array.isArray(list)) return false;
  return list.some((item) => {
    if (typeof item === typeof needle) return item === needle;
    return String(item) === String(needle);
  });
}

function evalCondition(cond: LogicCondition, values: Record<string, unknown>): boolean {
  const src = values[cond.sourceFieldId];
  switch (cond.op) {
    case 'is_empty':
      return isEmpty(src);
    case 'is_not_empty':
      return !isEmpty(src);
    case 'equals':
      if (typeof src === typeof cond.value) return src === cond.value;
      return String(src ?? '') === String(cond.value ?? '');
    case 'not_equals':
      if (typeof src === typeof cond.value) return src !== cond.value;
      return String(src ?? '') !== String(cond.value ?? '');
    case 'contains':
      return containsValue(src, cond.value);
    case 'not_contains':
      return !containsValue(src, cond.value);
    case 'includes':
      return multiIncludes(src, cond.value);
    case 'not_includes':
      return !multiIncludes(src, cond.value);
    case 'gt':
    case 'lt':
    case 'gte':
    case 'lte': {
      const a = toNumber(src);
      const b = toNumber(cond.value);
      if (a === null || b === null) return false;
      if (cond.op === 'gt') return a > b;
      if (cond.op === 'lt') return a < b;
      if (cond.op === 'gte') return a >= b;
      return a <= b;
    }
  }
}

function evalBlock(block: LogicBlock, values: Record<string, unknown>): boolean {
  if (block.conditions.length === 0) return false;
  if (block.combinator === 'or') {
    return block.conditions.some((c) => evalCondition(c, values));
  }
  return block.conditions.every((c) => evalCondition(c, values));
}

function applyCalculate(
  currentValues: Record<string, unknown>,
  action: CalculateAction,
): Record<string, unknown> {
  const current = toNumber(currentValues[action.targetFieldId]);
  const base = current ?? 0;
  let next: number;
  switch (action.op) {
    case '+':
      next = base + action.value;
      break;
    case '-':
      next = base - action.value;
      break;
    case '*':
      next = base * action.value;
      break;
    case '/':
      next = action.value === 0 ? base : base / action.value;
      break;
  }
  return { ...currentValues, [action.targetFieldId]: next };
}

export function parseLogicBlock(options: unknown): LogicBlock | null {
  if (!options || typeof options !== 'object' || Array.isArray(options)) return null;
  const raw = options as Record<string, unknown>;
  const combinator = raw.combinator === 'or' ? 'or' : 'and';
  const conditions = Array.isArray(raw.conditions)
    ? (raw.conditions.filter(
        (c): c is LogicCondition =>
          !!c && typeof c === 'object' && typeof (c as LogicCondition).sourceFieldId === 'string',
      ) as LogicCondition[])
    : [];
  const actions = Array.isArray(raw.actions)
    ? (raw.actions.filter((a): a is LogicAction => {
        if (!a || typeof a !== 'object') return false;
        const t = (a as LogicAction).type;
        return t === 'calculate' || t === 'show' || t === 'hide';
      }) as LogicAction[])
    : [];
  return { combinator, conditions, actions };
}

export interface LogicResult {
  values: Record<string, unknown>;
  hiddenFieldIds: Set<string>;
  shownFieldIds: Set<string>;
}

export function runLogic(
  fields: FormField[],
  baseValues: Record<string, unknown>,
): LogicResult {
  let values: Record<string, unknown> = { ...baseValues };
  const hiddenFieldIds = new Set<string>();
  const shownFieldIds = new Set<string>();

  for (const f of fields) {
    if (f.type !== 'CALCULATED') continue;
    const opts = (f.options ?? {}) as CalculatedOptions;
    const fallback = opts.valueType === 'text' ? '' : 0;
    let initial: number | string = opts.initialValue ?? fallback;
    if (opts.initialValueFieldId) {
      const referenced = baseValues[opts.initialValueFieldId];
      if (referenced !== undefined && referenced !== null && referenced !== '') {
        if (opts.valueType === 'number') {
          const n = toNumber(referenced);
          initial = n ?? fallback;
        } else {
          initial = typeof referenced === 'string' ? referenced : String(referenced);
        }
      }
    }
    values[f.id] = initial;
  }

  const logicFields = fields
    .filter((f) => f.type === 'CONDITIONAL_LOGIC')
    .sort((a, b) => a.order - b.order);

  for (const lf of logicFields) {
    const block = parseLogicBlock(lf.options);
    if (!block) continue;
    if (!evalBlock(block, values)) continue;
    for (const action of block.actions) {
      if (action.type === 'calculate') {
        values = applyCalculate(values, action);
      } else if (action.type === 'hide' && action.targetFieldId) {
        shownFieldIds.delete(action.targetFieldId);
        hiddenFieldIds.add(action.targetFieldId);
      } else if (action.type === 'show' && action.targetFieldId) {
        hiddenFieldIds.delete(action.targetFieldId);
        shownFieldIds.add(action.targetFieldId);
      }
    }
  }

  return { values, hiddenFieldIds, shownFieldIds };
}

export function operatorsForFieldType(type: string): Operator[] {
  switch (type) {
    case 'SHORT_TEXT':
    case 'LONG_TEXT':
    case 'EMAIL':
    case 'URL':
    case 'PHONE':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'];
    case 'NUMBER':
    case 'SCALE':
    case 'RATING':
      return ['equals', 'not_equals', 'gt', 'lt', 'gte', 'lte', 'is_empty', 'is_not_empty'];
    case 'DATE':
    case 'TIME':
      return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
    case 'RADIO':
    case 'DROPDOWN':
      return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
    case 'CHECKBOX':
    case 'MULTI_SELECT':
      return ['includes', 'not_includes', 'is_empty', 'is_not_empty'];
    case 'HIDDEN':
    case 'COUNTRY':
    case 'CALCULATED':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'];
    default:
      return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
  }
}

export function operatorLabel(op: Operator): string {
  switch (op) {
    case 'equals': return 'is';
    case 'not_equals': return 'is not';
    case 'contains': return 'contains';
    case 'not_contains': return "doesn't contain";
    case 'includes': return 'includes';
    case 'not_includes': return "doesn't include";
    case 'gt': return 'is greater than';
    case 'lt': return 'is less than';
    case 'gte': return 'is at least';
    case 'lte': return 'is at most';
    case 'is_empty': return 'is empty';
    case 'is_not_empty': return 'is not empty';
  }
}

export function operatorRequiresValue(op: Operator): boolean {
  return op !== 'is_empty' && op !== 'is_not_empty';
}
