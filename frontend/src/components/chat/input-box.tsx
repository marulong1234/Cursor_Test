"use client";

import { ArrowUp, Square } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { ChatMode } from "@/lib/types";

type InputBoxProps = {
  onSend: (message: string, mode: ChatMode) => void;
  onAbort: () => void;
  isStreaming: boolean;
  disabled?: boolean;
};

const MODES: { value: ChatMode; label: string }[] = [
  { value: "normal", label: "普通模式" },
  { value: "reasoning", label: "推理模式" },
];

export function InputBox({ onSend, onAbort, isStreaming, disabled }: InputBoxProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("normal");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed, mode);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              disabled={isStreaming}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                mode === item.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
              onClick={() => setMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <textarea
            ref={textareaRef}
            value={input}
            disabled={disabled || isStreaming}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            rows={1}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none"
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {isStreaming ? (
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              onClick={onAbort}
              aria-label="停止生成"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="shrink-0 rounded-xl"
              disabled={!input.trim() || disabled}
              onClick={handleSend}
              aria-label="发送"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
