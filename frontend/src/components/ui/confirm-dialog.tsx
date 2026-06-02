"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "删除中..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
