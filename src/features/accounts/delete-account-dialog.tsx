"use client";

import { type RefObject, useState } from "react";
import { Alert } from "@/components/alert/alert";

/** Confirms, then deletes the account and reloads home so every part of the page sees the visitor state. */
export function DeleteAccountDialog({ ref }: { ref: RefObject<HTMLDialogElement | null> }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const close = () => ref.current?.close();

  async function confirm() {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (response.ok) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        return window.location.assign("/");
      }
    } catch {}
    setFailed(true);
    setBusy(false);
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-desc"
      onCancel={(event) => busy && event.preventDefault()}
      onClose={() => setFailed(false)}
    >
      <div className="dialog__panel dialog__panel--sm">
        <div className="dialog__header">
          <div className="dialog__heading">
            <h2 className="dialog__title" id="delete-account-title">
              Delete your account?
            </h2>
            <p className="dialog__desc" id="delete-account-desc">
              Your profile, garage, posts and listings are removed. This cannot be undone.
            </p>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" aria-label="Close" disabled={busy} onClick={close}>
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="dialog__body">
          {busy && (
            <p className="visually-hidden" role="status">
              Deleting…
            </p>
          )}
          {failed && (
            <Alert tone="danger" title="Could not delete your account">
              Try again.
            </Alert>
          )}
        </div>
        <div className="dialog__footer">
          {/* React's autoFocus focuses on mount; the native attribute makes showModal() focus Cancel each time it opens. */}
          <button type="button" className="btn" {...{ autofocus: "" }} disabled={busy} onClick={close}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" disabled={busy} aria-busy={busy || undefined} onClick={confirm}>
            {busy ? "Deleting…" : failed ? "Try again" : "Delete account"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
