'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FormBlock } from './extensions/form-block';
import { SlashCommand } from './extensions/slash-command';
import {
  SlashCommandList,
  ALL_COMMANDS,
  type SlashCommandListRef,
} from './blocks/slash-command-list';
import { editorFieldsToDoc, docToEditorFields } from './editor-utils';
import type { EditorField } from './types';
import type { JSONContent } from '@tiptap/core';
import type { SuggestionProps } from '@tiptap/suggestion';
import ReactDOM from 'react-dom/client';

interface DocumentEditorProps {
  fields: EditorField[];
  onChange: (fields: EditorField[]) => void;
  onDirty: () => void;
}

export interface DocumentEditorRef {
  updateField: (fieldId: string, updates: Record<string, unknown>) => void;
}

export const DocumentEditor = forwardRef<DocumentEditorRef, DocumentEditorProps>(
  function DocumentEditor({ fields, onChange, onDirty }, ref) {
    const [initialDoc] = useState<JSONContent | undefined>(() => editorFieldsToDoc(fields));
    const isUpdatingFromSidebar = useRef(false);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
          listItem: false,
          bulletList: false,
          orderedList: false,
        }),
        FormBlock,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === 'paragraph') {
              return 'Type / to insert a form block...';
            }
            return '';
          },
        }),
        SlashCommand.configure({
          suggestion: {
            items: ({ query }: { query: string }) => {
              return ALL_COMMANDS.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase()),
              );
            },
            render: () => {
              let component: HTMLDivElement | null = null;
              let reactRoot: ReactDOM.Root | null = null;
              let slashRef: SlashCommandListRef | null = null;

              return {
                onStart: (props: SuggestionProps) => {
                  component = document.createElement('div');
                  component.style.position = 'absolute';
                  component.style.zIndex = '50';

                  if (props.clientRect) {
                    const rect = props.clientRect();
                    if (rect) {
                      component.style.top = `${rect.bottom + window.scrollY + 4}px`;
                      component.style.left = `${rect.left + window.scrollX}px`;
                    }
                  }

                  document.body.appendChild(component);
                  reactRoot = ReactDOM.createRoot(component);
                  reactRoot.render(
                    <SlashCommandList
                      items={props.items}
                      command={props.command}
                      ref={(r) => { slashRef = r; }}
                    />,
                  );
                },
                onUpdate: (props: SuggestionProps) => {
                  if (!component || !reactRoot) return;

                  if (props.clientRect) {
                    const rect = props.clientRect();
                    if (rect) {
                      component.style.top = `${rect.bottom + window.scrollY + 4}px`;
                      component.style.left = `${rect.left + window.scrollX}px`;
                    }
                  }

                  reactRoot.render(
                    <SlashCommandList
                      items={props.items}
                      command={props.command}
                      ref={(r) => { slashRef = r; }}
                    />,
                  );
                },
                onKeyDown: (props: { event: KeyboardEvent }) => {
                  if (props.event.key === 'Escape') {
                    if (reactRoot) reactRoot.unmount();
                    if (component) component.remove();
                    component = null;
                    reactRoot = null;
                    return true;
                  }
                  return slashRef?.onKeyDown(props) ?? false;
                },
                onExit: () => {
                  if (reactRoot) reactRoot.unmount();
                  if (component) component.remove();
                  component = null;
                  reactRoot = null;
                },
              };
            },
          },
        }),
      ],
      content: initialDoc,
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] px-1 py-4',
        },
      },
      onUpdate: ({ editor: e }) => {
        if (isUpdatingFromSidebar.current) return;
        onDirty();
        const newFields = docToEditorFields(e.getJSON());
        onChange(newFields);
      },
    });

    useImperativeHandle(ref, () => ({
      updateField(fieldId: string, updates: Record<string, unknown>) {
        if (!editor) return;

        isUpdatingFromSidebar.current = true;
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'formBlock' && node.attrs.fieldId === fieldId) {
            const tr = editor.state.tr;
            for (const [key, value] of Object.entries(updates)) {
              tr.setNodeAttribute(pos, key, value);
            }
            editor.view.dispatch(tr);
            return false;
          }
        });
        isUpdatingFromSidebar.current = false;
      },
    }), [editor]);

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      if (!editor || !over || active.id === over.id) return;
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(fields, oldIndex, newIndex);
      editor.commands.setContent(editorFieldsToDoc(reordered));
    }

    return (
      <div className="w-full max-w-2xl mx-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <EditorContent editor={editor} />
          </SortableContext>
        </DndContext>
      </div>
    );
  },
);
