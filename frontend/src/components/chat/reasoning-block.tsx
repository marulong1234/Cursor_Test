"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

type ReasoningBlockProps = {
  content: string;
  isStreaming?: boolean;
  defaultOpen?: boolean;
};

export function ReasoningBlock({
  content,
  isStreaming,
  defaultOpen = true,
}: ReasoningBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!content && !isStreaming) return null;

  return (
    <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/60">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-500"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        思考过程
        {isStreaming && <span className="animate-pulse text-zinc-400">生成中...</span>}
      </button>
      {open && (
        <div className="border-t border-zinc-200 px-3 py-2 text-sm leading-relaxed text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          <pre className="whitespace-pre-wrap font-sans">{content}</pre>
          {isStreaming && !content && (
            <span className="inline-block h-4 w-1.5 animate-pulse bg-zinc-400" />
          )}
        </div>
      )}
    </div>
  );
}
