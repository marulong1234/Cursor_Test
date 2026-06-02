"use client";

import { Bot, User } from "lucide-react";

import { MarkdownContent } from "@/components/chat/markdown-content";
import { ReasoningBlock } from "@/components/chat/reasoning-block";
import { cn } from "@/lib/cn";
import type { Message } from "@/lib/types";

type DisplayMessage = Message & {
  isStreaming?: boolean;
  streamingReasoning?: boolean;
  streamingContent?: boolean;
};

type MessageListProps = {
  messages: DisplayMessage[];
};

function Avatar({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isUser
          ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
      )}
    >
      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar isUser={isUser} />

      <div
        className={cn(
          "max-w-[calc(100%-3rem)] min-w-0 rounded-2xl px-4 py-3",
          isUser
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100",
        )}
      >
        {!isUser && (message.reasoning_content || message.streamingReasoning) && (
          <ReasoningBlock
            content={message.reasoning_content ?? ""}
            isStreaming={message.streamingReasoning}
          />
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        ) : (
          <div className="relative">
            <MarkdownContent content={message.content} />
            {message.streamingContent && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-zinc-500 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
