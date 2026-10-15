"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { TextField } from "@/components/text-field/text-field";
import type { Car } from "./garage-service";

type Props = { car?: Car; onSaved: (car: Car) => void; onClose: () => void };

/** Adds a car to the garage, or edits one when `car` is given; opens itself when mounted. */
export function CarDialog({ car, onSaved, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const editing = Boolean(car);

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);

  const close = () => ref.current?.close();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFailed(false);
    setFieldErrors({});
    try {
      const response = await fetch(editing ? `/api/garage-cars/${car!.id}` : "/api/garage-cars", {
        method: editing ? "PATCH" : "POST",
        body: new FormData(event.currentTarget),
      });
      if (response.ok) {
        onSaved(await response.json());
        close();
      } else if (response.status === 400) {
        setFieldErrors((await response.json()).fieldErrors ?? {});
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="car-dialog-title"
      aria-describedby="car-dialog-desc"
      onCancel={(event) => busy && event.preventDefault()}
      onClose={onClose}
    >
      <form className="dialog__panel dialog__panel--form" noValidate onSubmit={submit}>
        <div className="dialog__header">
          <div className="dialog__heading">
            <h2 className="dialog__title" id="car-dialog-title">
              {editing ? "Edit your car" : "Add a car to your garage"}
            </h2>
            <p className="dialog__desc" id="car-dialog-desc">
              {editing ? "Update the details of this car." : "Share the car you own with the community."}
            </p>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" aria-label="Close" disabled={busy} onClick={close}>
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="dialog__body stack">
          {busy && (
            <p className="visually-hidden" role="status">
              {editing ? "Saving…" : "Sending…"}
            </p>
          )}
          {hasErrors && (
            <Alert tone="danger" title="Check the marked fields">
              Correct the errors and try again.
            </Alert>
          )}
          {failed && (
            <Alert tone="danger" title={editing ? "Could not save" : "Could not send"}>
              {editing ? "Try again. Your changes are still here." : "Try again. Your text is still here."}
            </Alert>
          )}
          <TextField id="car-year" name="year" label="Year" defaultValue={car ? String(car.year) : ""} error={fieldErrors.year} />
          <TextField id="car-make" name="make" label="Make" defaultValue={car?.make ?? ""} error={fieldErrors.make} />
          <TextField id="car-model" name="model" label="Model" defaultValue={car?.model ?? ""} error={fieldErrors.model} />
          <TextField id="car-nickname" name="nickname" label="Nickname (optional)" optional defaultValue={car?.nickname ?? ""} error={fieldErrors.nickname} />
          <div className="field">
            <label className="field__label" htmlFor="car-photo">
              Photo (optional)
            </label>
            <input
              className="input"
              id="car-photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={fieldErrors.photo ? true : undefined}
              aria-describedby={fieldErrors.photo ? "car-photo-error" : undefined}
            />
            {fieldErrors.photo && (
              <span className="field__error" id="car-photo-error">
                {fieldErrors.photo}
              </span>
            )}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="car-notes">
              Notes (optional)
            </label>
            <textarea
              className="textarea"
              id="car-notes"
              name="notes"
              rows={4}
              defaultValue={car?.notes ?? ""}
              aria-invalid={fieldErrors.notes ? true : undefined}
              aria-describedby={fieldErrors.notes ? "car-notes-error" : undefined}
            />
            {fieldErrors.notes && (
              <span className="field__error" id="car-notes-error">
                {fieldErrors.notes}
              </span>
            )}
          </div>
        </div>
        <div className="dialog__footer">
          <button type="button" className="btn" disabled={busy} onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy} aria-busy={busy || undefined}>
            {busy ? (editing ? "Saving…" : "Sending…") : editing ? "Save changes" : "Add car"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
