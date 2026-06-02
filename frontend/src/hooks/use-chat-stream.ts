"use client";

import { useCallback, useRef, useState } from "react";

import { streamChat } from "@/lib/chat-stream";
import type { ChatMode } from "@/lib/types";

type UseChatStreamOptions = {
  sessionId: string;
  onFinish?: () => void;
};

export function useChatStream({ sessionId, onFinish }: UseChatStreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      mode: ChatMode,
      handlers: {
        onReasoningDelta: (delta: string) => void;
        onContentDelta: (delta: string) => void;
        onError: (error: string) => void;
      },
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        await streamChat(
          { session_id: sessionId, message, mode },
          {
            onReasoningDelta: handlers.onReasoningDelta,
            onContentDelta: handlers.onContentDelta,
            onDone: () => {
              setIsStreaming(false);
              onFinish?.();
            },
            onError: (error) => {
              setIsStreaming(false);
              handlers.onError(error);
            },
          },
          controller.signal,
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handlers.onError((error as Error).message);
        }
        setIsStreaming(false);
      }
    },
    [sessionId, onFinish],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  return { sendMessage, isStreaming, abort };
}
