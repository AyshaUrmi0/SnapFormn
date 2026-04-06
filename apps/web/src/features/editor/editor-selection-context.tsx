'use client';

import { createContext, useContext } from 'react';

interface EditorSelectionContextValue {
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  validationErrorIds: Set<string>;
}

const EditorSelectionContext = createContext<EditorSelectionContextValue>({
  selectedFieldId: null,
  onSelectField: () => {},
  validationErrorIds: new Set(),
});

export function useEditorSelection() {
  return useContext(EditorSelectionContext);
}

export { EditorSelectionContext };
