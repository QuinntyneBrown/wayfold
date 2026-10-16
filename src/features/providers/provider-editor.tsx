"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { useSession } from "@/components/site-nav/use-session";
import { TextField } from "@/components/text-field/text-field";
import { GTA_AREAS } from "@/lib/gta-areas";
import { PROVIDER_CATEGORIES } from "@/lib/provider-categories";

type Notice = "invalid" | "error" | null;

export function ProviderEditor() {
  const router = useRouter();
  const session = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) router.replace("/sign-in");
  }, [session, router]);

  if (createdId) {
    return (
      <>
        <div className="page-head">
          <h1>Business submitted</h1>
          <p>Your provider profile has been saved.</p>
        </div>
        <section className="card stack">
          <h2>Next steps</h2>
          <Link className="btn btn--primary" href={`/providers/${createdId}`}>
            View provider profile
          </Link>
        </section>
      </>
    );
  }

  const head = (
    <div className="page-head">
      <h1>List your business</h1>
      <p>One profile for every kind of auto provider.</p>
    </div>
  );

  if (!session) {
    return (
      <div aria-busy="true">
        {head}
        <div className="card stack" aria-hidden="true">
          <span className="skeleton skeleton--text" style={{ width: "65%" }} />
          <span className="skeleton skeleton--text" style={{ width: "95%" }} />
          <span className="skeleton skeleton--text" style={{ width: "80%" }} />
        </div>
        <p role="status">Loading…</p>
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          category: form.get("category"),
          municipality: form.get("municipality"),
          description: form.get("description"),
          contactEmail: form.get("contactEmail"),
          phone: form.get("phone"),
        }),
      });
      if (response.status === 201) {
        setCreatedId((await response.json()).id);
        return;
      }
      if (response.status === 400) {
        setFieldErrors((await response.json()).fieldErrors ?? {});
        setNotice("invalid");
      } else {
        setNotice("error");
      }
    } catch {
      setNotice("error");
    }
    setSubmitting(false);
  }

  return (
    <>
      {head}
      <form className="card stack" noValidate onSubmit={submit} inert={submitting}>
        {notice === "invalid" && (
          <Alert tone="danger" title="Complete the required fields">
            Please correct the marked fields.
          </Alert>
        )}
        {notice === "error" && (
          <Alert tone="danger" title="Something went wrong">
            Try again in a moment.
          </Alert>
        )}
        <TextField id="business-name" name="name" label="Business or professional name" error={fieldErrors.name} />
        <SelectField id="category" name="category" label="Category" error={fieldErrors.category}>
          {PROVIDER_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </SelectField>
        <SelectField id="municipality" name="municipality" label="GTA municipality" error={fieldErrors.municipality}>
          {GTA_AREAS.map((area) => (
            <option key={area}>{area}</option>
          ))}
        </SelectField>
        <div className="field">
          <label className="field__label" htmlFor="description">
            What do you do?
          </label>
          <textarea
            className="textarea"
            id="description"
            name="description"
            rows={4}
            required
            aria-invalid={fieldErrors.description ? true : undefined}
            aria-describedby={fieldErrors.description ? "description-error" : undefined}
          />
          {fieldErrors.description && (
            <span className="field__error" id="description-error">
              {fieldErrors.description}
            </span>
          )}
        </div>
        <TextField id="contact" name="contactEmail" label="Contact email" type="email" autoComplete="email" error={fieldErrors.contactEmail} />
        <TextField id="phone" name="phone" label="Phone (optional)" type="tel" autoComplete="tel" optional />
        <button className="btn btn--primary" type="submit" disabled={submitting} aria-busy={submitting || undefined}>
          {submitting ? "Saving…" : "Save business profile"}
        </button>
      </form>
    </>
  );
}

function SelectField({ id, name, label, error, children }: { id: string; name: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select
        className="select"
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {children}
      </select>
      {error && (
        <span className="field__error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
