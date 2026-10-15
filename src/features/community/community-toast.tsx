"use client";

import { useEffect } from "react";

export type ToastMessage = { tone: "info" | "success" | "warning" | "danger"; title: string; text: string };

/** The server rejected a save. */
export const SAVE_FAILED: ToastMessage = { tone: "danger", title: "Could not save", text: "Please try again." };

/** The request never reached the server; what the member typed is still on screen. */
export const CONNECTION_INTERRUPTED: ToastMessage = {
  tone: "warning",
  title: "Connection interrupted",
  text: "Your post is still here. Try again.",
};

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
