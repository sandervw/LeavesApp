import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';

const MarkdownText = (props) => {
  const [text, setText] = useState(props.text ? props.text : '');
  const [wordCount, setWordCount] = useState(text.trim().split(/\s+/).filter(word => word).length);

  const editor = useEditor({
    editable: !!props.update,
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: 'Write something here...',
      }),
    ],
    content: (props.text ? props.text : ''), // Set initial content if needed
    onUpdate: ({ editor }) => {
      const newMarkdown = editor.storage.markdown.getMarkdown();
      const newWordCount = newMarkdown.trim().split(/\s+/).filter(word => word).length;

      if (props.locked) {
        // Only allow deletions
        if (newWordCount <= wordCount) {
          setText(newMarkdown);
          setWordCount(newWordCount);
          // Update word count in real-time on frontend
          if (props.wordCount) {
            props.wordCount(newWordCount);
          }
        } else {
          // Revert to previous content if new text is added
          editor.commands.setContent(text);
        }
      } else {
        setText(newMarkdown);
        setWordCount(newWordCount);
        // Update word count in real-time on frontend
        if (props.wordCount) {
          props.wordCount(newWordCount);
        }
      }
    },
    onBlur: ({ editor }) => {
      if(props.update) {
        // Save content as Markdown when editor loses focus
        const markdown = editor.storage.markdown.getMarkdown();
        props.update(markdown);
        setText(markdown);
      }
    },
  });

  return (
    <EditorContent editor={editor} />
  );
};

export default MarkdownText;