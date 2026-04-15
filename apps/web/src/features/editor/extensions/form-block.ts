import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FormBlockRenderer } from '../blocks/form-block-renderer';

export const FormBlock = Node.create({
  name: 'formBlock',
  group: 'block',
  atom: true,
  draggable: false,

  addAttributes() {
    return {
      fieldId: { default: '' },
      fieldType: { default: 'SHORT_TEXT' },
      label: { default: '' },
      description: { default: null },
      placeholder: { default: null },
      required: { default: false },
      options: { default: '[]' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-form-block]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-form-block': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormBlockRenderer);
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this;
        const { selection } = editor.state;
        const node = selection.$from.nodeAfter ?? selection.$from.parent;
        const isFormBlockSelected = node?.type?.name === 'formBlock';

        if (!isFormBlockSelected && selection.empty && selection.$from.parent.type.name !== 'formBlock') {
          return false;
        }

        return editor.chain().focus().insertContentAt(selection.to, { type: 'paragraph' }).run();
      },
    };
  },
});
