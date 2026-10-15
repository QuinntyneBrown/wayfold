"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/alert/alert";
import type { Car } from "./garage-service";

type Props = { car: Car; onRemoved: (car: Car) => void; onClose: () => void };

export function carTitle(car: Car) {
  return `${car.year} ${car.make} ${car.model}${car.nickname ? ` “${car.nickname}”` : ""}`;
}

/** Confirms before removing a car from the garage; opens itself when mounted. */
export function RemoveCarDialog({ car, onRemoved, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);

  const close = () => ref.current?.close();

  async function confirm() {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/garage-cars/${car.id}`, { method: "DELETE" });
      if (response.ok) {
        onRemoved(car);
        return close();
      }
    } catch {}
    setFailed(true);
    setBusy(false);
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="remove-car-title"
      aria-describedby="remove-car-desc"
      onCancel={(event) => busy && event.preventDefault()}
      onClose={onClose}
    >
      <div className="dialog__panel dialog__panel--sm">
        <div className="dialog__header">
          <div className="dialog__heading">
            <h2 className="dialog__title" id="remove-car-title">
              Remove this car?
            </h2>
            <p className="dialog__desc" id="remove-car-desc">
              {carTitle(car)} will be removed from your garage.
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
              Removing…
            </p>
          )}
          {failed && (
            <Alert tone="danger" title="Could not remove this car">
              Try again.
            </Alert>
          )}
        </div>
        <div className="dialog__footer">
          {/* The native attribute makes showModal() focus Cancel; React's autoFocus only runs on mount. */}
          <button type="button" className="btn" {...{ autofocus: "" }} disabled={busy} onClick={close}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" disabled={busy} aria-busy={busy || undefined} onClick={confirm}>
            {busy ? "Removing…" : failed ? "Try again" : "Remove car"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
