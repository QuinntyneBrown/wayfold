"use client";

import { useEffect } from "react";

export type ToastMessage = { tone: "info" | "success" | "warning" | "danger"; title: string; text: string };

/** A transient message in a polite live region; the region stays mounted so screen readers announce what appears in it. */
export function CommunityToast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className={`toast toast--${toast.tone}`} role={toast.tone === "danger" ? "alert" : undefined}>
          <div className="toast__body">
            <div className="toast__title">{toast.title}</div>
            <div className="toast__text">{toast.text}</div>
          </div>
        </div>
      )}
    </div>
  );
}
