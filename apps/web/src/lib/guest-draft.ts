import type { EditorField } from '@/features/editor/types';

export interface GuestDraft {
  title: string;
  description: string;
  fields: EditorField[];
  updatedAt: number;
}

const GUEST_DRAFT_KEY = 'snapform_guest_draft';

export function createDefaultGuestDraft(): GuestDraft {
  return {
    title: 'Customer Satisfaction Survey',
    description: 'We would love to hear your thoughts and feedback.',
    fields: [
      {
        id: crypto.randomUUID(),
        type: 'SHORT_TEXT',
        label: 'What is your name?',
        description: null,
        placeholder: 'e.g. Alex Morgan',
        required: true,
        order: 0,
        options: null,
        validations: null,
        conditionals: null,
      },
      {
        id: crypto.randomUUID(),
        type: 'EMAIL',
        label: 'What is your email address?',
        description: 'We will only use this to follow up if requested.',
        placeholder: 'alex@example.com',
        required: true,
        order: 1,
        options: null,
        validations: null,
        conditionals: null,
      },
      {
        id: crypto.randomUUID(),
        type: 'RATING',
        label: 'How would you rate your overall experience?',
        description: null,
        placeholder: null,
        required: true,
        order: 2,
        options: { maxRating: 5 },
        validations: null,
        conditionals: null,
      },
      {
        id: crypto.randomUUID(),
        type: 'LONG_TEXT',
        label: 'Any additional comments or suggestions for us?',
        description: null,
        placeholder: 'Type your feedback here...',
        required: false,
        order: 3,
        options: null,
        validations: null,
        conditionals: null,
      },
    ],
    updatedAt: Date.now(),
  };
}

export function loadGuestDraft(): GuestDraft {
  if (typeof window === 'undefined') return createDefaultGuestDraft();

  try {
    const raw = localStorage.getItem(GUEST_DRAFT_KEY);
    if (!raw) return createDefaultGuestDraft();
    const parsed = JSON.parse(raw) as GuestDraft;
    if (!parsed || !Array.isArray(parsed.fields)) {
      return createDefaultGuestDraft();
    }
    return parsed;
  } catch {
    return createDefaultGuestDraft();
  }
}

export function saveGuestDraft(draft: Omit<GuestDraft, 'updatedAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    const payload: GuestDraft = {
      ...draft,
      updatedAt: Date.now(),
    };
    localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save guest draft to localStorage', e);
  }
}

export function clearGuestDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_DRAFT_KEY);
}
