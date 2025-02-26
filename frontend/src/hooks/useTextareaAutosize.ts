import { useEffect, RefObject } from 'react';

export function useTextareaAutosize(
  textareaRef: RefObject<HTMLTextAreaElement>,
  value: string
) {
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, textareaRef]);
} 