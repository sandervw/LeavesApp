import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";

interface MarkdownTextProps {
  text?: string;
  locked?: boolean;
  update?: (markdown: string) => void;
  placeholder?: string;
  wordLimit?: number;
  wordCount?: (count: number) => void;
}

const MarkdownText = ({
  text = "",
  locked = false,
  update = undefined,
  placeholder = "Write something here...",
  wordLimit = undefined,
  wordCount = undefined,
  ...props
}: MarkdownTextProps) => {
  const [markdownText, setMarkdownText] = useState(text);
  const [innerWordCount, setInnerWordCount] = useState(
    markdownText
      .trim()
      .split(/\s+/)
      .filter((word) => word).length
  );

  const editor = useEditor({
    editable: !!update,
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: text ? text : "", // Set initial content if needed
    onUpdate: ({ editor }) => {
      const newMarkdown = editor.storage.markdown.getMarkdown();
      const newWordCount = newMarkdown
        .trim()
        .split(/\s+/)
        .filter((word: string) => word).length;

      // Check if we should lock the editor (either explicitly locked OR word limit reached)
      const isLocked = locked || (wordLimit && innerWordCount >= wordLimit);

      if (isLocked) {
        // Only allow deletions
        if (newWordCount <= innerWordCount) {
          setMarkdownText(newMarkdown);
          setInnerWordCount(newWordCount);
          // Update word count in real-time on frontend
          if (wordCount) {
            wordCount(newWordCount);
          }
        } else {
          // Revert to previous content if new text is added
          editor.commands.setContent(markdownText);
        }
      } else {
        setMarkdownText(newMarkdown);
        setInnerWordCount(newWordCount);
        // Update word count in real-time on frontend
        if (wordCount) {
          wordCount(newWordCount);
        }
      }
    },
    onBlur: ({ editor }) => {
      if (update) {
        // Save content as Markdown when editor loses focus
        const markdown = editor.storage.markdown.getMarkdown();
        update(markdown);
      }
    },
  });

  return <EditorContent editor={editor} {...props} />;
};

export default MarkdownText;
