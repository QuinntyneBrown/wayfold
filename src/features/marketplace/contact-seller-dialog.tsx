"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/alert/alert";

type Props = { vehicleId: string; onClose: () => void };

/** Sends a message to a vehicle's seller; opens itself when mounted. */
export function ContactSellerDialog({ vehicleId, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);

  const close = () => ref.current?.close();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = new FormData(event.currentTarget).get("message");
    setBusy(true);
    setFailed(false);
    setError(undefined);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/inquiries`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (response.ok) setSent(true);
      else if (response.status === 400)
        setError(
          (await response.json()).fieldErrors?.message ?? "Write a message",
        );
      else setFailed(true);
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="contact-seller-title"
      aria-describedby="contact-seller-desc"
      onCancel={(event) => busy && event.preventDefault()}
      onClose={onClose}
    >
      <form
        className={`dialog__panel ${sent ? "dialog__panel--sm" : "dialog__panel--form"}`}
        noValidate
        onSubmit={submit}
      >
        <div className="dialog__header">
          <div className="dialog__heading">
            <h2 className="dialog__title" id="contact-seller-title">
              Message the seller
            </h2>
            <p className="dialog__desc" id="contact-seller-desc">
              Ask about the vehicle. Your message goes to the seller.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--icon"
            aria-label="Close"
            disabled={busy}
            onClick={close}
          >
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="dialog__body stack">
          {sent ? (
            <Alert tone="success" title="Posted">
              Your message is available now.
            </Alert>
          ) : (
            <>
              {busy && (
                <p className="visually-hidden" role="status">
                  Sending…
                </p>
              )}
              {error && (
                <Alert tone="danger" title="Check the marked fields">
                  Correct the errors and try again.
                </Alert>
              )}
              {failed && (
                <Alert tone="danger" title="Could not send">
                  Try again. Your text is still here.
                </Alert>
              )}
              <div className="field">
                <label
                  className="field__label"
                  htmlFor="contact-seller-message"
                >
                  Your message (up to 2000 characters)
                </label>
                <textarea
                  className="textarea"
                  id="contact-seller-message"
                  name="message"
                  rows={4}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={
                    error ? "contact-seller-message-error" : undefined
                  }
                />
                {error && (
                  <span
                    className="field__error"
                    id="contact-seller-message-error"
                  >
                    {error}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="dialog__footer">
          {sent ? (
            <button type="button" className="btn btn--primary" onClick={close}>
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={close}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={busy}
                aria-busy={busy || undefined}
              >
                {busy ? "Sending…" : "Send message"}
              </button>
            </>
          )}
        </div>
      </form>
    </dialog>
  );
}
