"use client";

import { MessageSquarePlus, MoreHorizontal, PanelLeftClose, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useCreateSession,
  useDeleteSession,
  useSessions,
} from "@/hooks/use-sessions";
import { cn } from "@/lib/cn";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/utils";

export function SessionSidebar({ onCollapse }: { onCollapse?: () => void }) {
  const pathname = usePathname();
  const activeSessionId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]?.split("/")[0]
    : undefined;

  const { data, isLoading, isError } = useSessions();
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession(activeSessionId);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  return (
    <>
      <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2 p-3">
          <Button
            className="min-w-0 flex-1 justify-start gap-2"
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending}
          >
            <MessageSquarePlus className="h-4 w-4 shrink-0" />
            {createSession.isPending ? "创建中..." : "新对话"}
          </Button>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              aria-label="收起侧边栏"
              title="隐藏历史对话"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {isLoading && (
            <p className="px-2 py-4 text-sm text-zinc-500">加载会话中...</p>
          )}
          {isError && (
            <p className="px-2 py-4 text-sm text-red-500">无法加载会话列表</p>
          )}
          {!isLoading && !isError && data?.items.length === 0 && (
            <p className="px-2 py-4 text-sm text-zinc-500">暂无会话，点击上方新建</p>
          )}
          <ul className="space-y-1">
            {data?.items.map((session) => {
              const isActive = activeSessionId === session.id;
              const menuOpen = menuOpenId === session.id;

              return (
                <li key={session.id} className="relative">
                  <Link
                    href={`/chat/${session.id}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                    )}
                    onClick={() => setMenuOpenId(null)}
                  >
                    <span className="flex-1 truncate">{session.title}</span>
                    <button
                      type="button"
                      className="rounded p-1 opacity-60 hover:bg-zinc-300/60 hover:opacity-100 dark:hover:bg-zinc-700"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(menuOpen ? null : session.id);
                      }}
                      aria-label="会话菜单"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </Link>
                  <p
                    className="px-3 pb-1 text-xs text-zinc-500"
                    title={formatAbsoluteTime(session.updated_at)}
                  >
                    {formatRelativeTime(session.updated_at)}
                  </p>

                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-2 top-8 z-20 min-w-[120px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => {
                            setDeleteTarget({ id: session.id, title: session.title });
                            setMenuOpenId(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          删除
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除会话"
        description={`确定删除「${deleteTarget?.title ?? ""}」吗？此操作不可撤销，所有消息将被删除。`}
        confirmLabel="删除"
        loading={deleteSession.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteSession.mutate(deleteTarget.id, {
              onSettled: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </>
  );
}
