"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { SessionSidebar } from "@/components/sidebar/session-sidebar";
import { cn } from "@/lib/cn";

const SIDEBAR_KEY = "chat-sidebar-open";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) {
      setSidebarOpen(stored === "true");
    }
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {mounted && sidebarOpen && (
        <SessionSidebar onCollapse={toggleSidebar} />
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        {mounted && !sidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg",
              "border border-zinc-200 bg-white text-zinc-600 shadow-sm",
              "hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
            )}
            aria-label="展开侧边栏"
            title="展开历史对话"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}

        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
