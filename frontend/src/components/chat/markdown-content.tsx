"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/cn";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

function CodeBlock({ className, children, ...props }: React.ComponentPropsWithoutRef<"code">) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className ?? "");
  const isBlock = Boolean(match);
  const text = String(children).replace(/\n$/, "");

  if (!isBlock) {
    return (
      <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
        <span>{match?.[1] ?? "code"}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: CodeBlock,
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
