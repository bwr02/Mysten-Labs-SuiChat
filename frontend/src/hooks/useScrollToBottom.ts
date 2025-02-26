import { useCallback, useEffect, RefObject } from 'react';
import { Message } from '@/types/types';

export function useScrollToBottom(
  messagesEndRef: RefObject<HTMLDivElement>,
  messages: Message[]
) {
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messagesEndRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return scrollToBottom;
} 