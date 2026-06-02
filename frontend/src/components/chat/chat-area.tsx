"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { InputBox } from "@/components/chat/input-box";
import { MessageList } from "@/components/chat/message-list";
import { useChatStream } from "@/hooks/use-chat-stream";
import { sessionKey, useSession } from "@/hooks/use-sessions";
import type { ChatMode, Message } from "@/lib/types";

type DisplayMessage = Message & {
  isStreaming?: boolean;
  streamingReasoning?: boolean;
  streamingContent?: boolean;
};

const EXAMPLE_PROMPTS = [
  "用 Python 写一个快速排序算法",
  "解释量子纠缠是什么",
  "帮我写一封请假邮件",
];

export function ChatArea({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useSession(sessionId);
  const [localMessages, setLocalMessages] = useState<DisplayMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef(false);

  const refreshSession = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  }, [queryClient, sessionId]);

  const { sendMessage, isStreaming, abort } = useChatStream({
    sessionId,
    onFinish: refreshSession,
  });

  useEffect(() => {
    if (!streamingRef.current && data?.messages) {
      setLocalMessages(data.messages);
    }
  }, [data?.messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [localMessages]);

  const handleSend = useCallback(
    async (content: string, mode: ChatMode) => {
      setError(null);
      streamingRef.current = true;

      const userMessage: DisplayMessage = {
        id: `temp-user-${Date.now()}`,
        session_id: sessionId,
        role: "user",
        content,
        reasoning_content: null,
        token_count: null,
        created_at: new Date().toISOString(),
      };

      const assistantMessage: DisplayMessage = {
        id: `temp-assistant-${Date.now()}`,
        session_id: sessionId,
        role: "assistant",
        content: "",
        reasoning_content: mode === "reasoning" ? "" : null,
        token_count: null,
        created_at: new Date().toISOString(),
        isStreaming: true,
        streamingReasoning: mode === "reasoning",
        streamingContent: false,
      };

      setLocalMessages((prev) => [...prev, userMessage, assistantMessage]);

      await sendMessage(content, mode, {
        onReasoningDelta: (delta) => {
          setLocalMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (!last || last.role !== "assistant") return prev;
            next[next.length - 1] = {
              ...last,
              reasoning_content: (last.reasoning_content ?? "") + delta,
              streamingReasoning: true,
            };
            return next;
          });
        },
        onContentDelta: (delta) => {
          setLocalMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (!last || last.role !== "assistant") return prev;
            next[next.length - 1] = {
              ...last,
              content: last.content + delta,
              streamingReasoning: false,
              streamingContent: true,
            };
            return next;
          });
        },
        onError: (message) => {
          setError(message);
          streamingRef.current = false;
          setLocalMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant" && last.isStreaming) {
              next.pop();
            }
            return next;
          });
        },
      });

      streamingRef.current = false;
      setLocalMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isStreaming: false,
          streamingReasoning: false,
          streamingContent: false,
        })),
      );
    },
    [sendMessage, sessionId],
  );

  const displayMessages = useMemo(() => localMessages, [localMessages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500">
        加载会话中...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-500">
        会话不存在或加载失败
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="truncate text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {data.title}
        </h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6">
            <div className="max-w-lg text-center">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                开始新对话
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                选择普通模式或推理模式，向 DeepSeek 提问（阿里云百炼）
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-1">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isStreaming}
                    className="rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    onClick={() => handleSend(prompt, "normal")}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={displayMessages} />
        )}
      </div>

      {error && (
        <div className="shrink-0 border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <InputBox
        onSend={handleSend}
        onAbort={abort}
        isStreaming={isStreaming}
      />
    </div>
  );
}
