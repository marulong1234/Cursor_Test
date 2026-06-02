"use client";

import { useEffect, useRef } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useCreateSession } from "@/hooks/use-sessions";

export default function HomePage() {
  const createSession = useCreateSession();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    createSession.mutate();
  }, [createSession.mutate]);

  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            {createSession.isError ? "创建会话失败" : "正在打开新对话..."}
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            {createSession.isError
              ? "请确认后端已启动，且 frontend/.env.local 中的 API 地址与后端端口一致。"
              : "即将进入聊天界面，请稍候"}
          </p>
          {createSession.isError && (
            <button
              type="button"
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
              onClick={() => createSession.mutate()}
            >
              重试
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
