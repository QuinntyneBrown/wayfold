"use client";

import { type FormEvent, type RefObject, useState } from "react";
import { Alert } from "@/components/alert/alert";

type Props = { ref: RefObject<HTMLDialogElement | null>; bio: string | null; onSaved: (bio: string | null) => void };

/** Edits the member's bio; the text stays in the field when saving fails. */
export function EditProfileDialog({ ref, bio, onSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => ref.current?.close();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("bio") ?? "");
    setBusy(true);
    setFailed(false);
    setError(null);
    try {
      const response = await fetch("/api/members/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bio: value }),
      });
      if (response.ok) {
        onSaved(value.trim() || null);
        close();
      } else if (response.status === 400) {
        setError((await response.json()).fieldErrors?.bio ?? "Check this field");
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="edit-profile-title"
      aria-describedby="edit-profile-desc"
      onCancel={(event) => busy && event.preventDefault()}
      onClose={() => {
        setFailed(false);
        setError(null);
      }}
    >
      <form className="dialog__panel dialog__panel--form" noValidate onSubmit={submit}>
        <div className="dialog__header">
          <div className="dialog__heading">
            <h2 className="dialog__title" id="edit-profile-title">
              Edit your profile
            </h2>
            <p className="dialog__desc" id="edit-profile-desc">
              Tell the community a little about you.
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
              Saving…
            </p>
          )}
          {(failed || error) && (
            <Alert tone="danger" title={failed ? "Could not save" : "Check the marked fields"}>
              {failed ? "Try again. Your changes are still here." : "Correct the errors and try again."}
            </Alert>
          )}
          <div className="field">
            <label className="field__label" htmlFor="bio">
              Bio (optional)
            </label>
            <textarea
              className="textarea"
              id="bio"
              name="bio"
              rows={5}
              defaultValue={bio ?? ""}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "bio-help bio-error" : "bio-help"}
            />
            <span className="field__help" id="bio-help">
              Up to 500 characters.
            </span>
            {error && (
              <span className="field__error" id="bio-error">
                {error}
              </span>
            )}
          </div>
        </div>
        <div className="dialog__footer">
          <button type="button" className="btn" disabled={busy} onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy} aria-busy={busy || undefined}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
