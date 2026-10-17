"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { useSession } from "@/components/site-nav/use-session";
import { TextField } from "@/components/text-field/text-field";
import { GTA_AREAS } from "@/lib/gta-areas";
import { PROVIDER_CATEGORIES } from "@/lib/provider-categories";
import type { ProviderDetail } from "./provider-service";

type Notice = "invalid" | "error" | null;
type Load = { state: "loading" } | { state: "failed" } | { state: "missing" } | { state: "ready"; provider?: ProviderDetail };

/** Creates a profile, or edits the one with the given id (L2-032). */
export function ProviderEditor({ id }: { id?: string }) {
  const router = useRouter();
  const session = useSession();
  const [load, setLoad] = useState<Load>(id ? { state: "loading" } : { state: "ready" });
  const [createdId, setCreatedId] = useState<string | null>(null);

  const fetchProvider = useCallback(async () => {
    if (!id) return;
    setLoad({ state: "loading" });
    try {
      const response = await fetch(`/api/providers/${id}`);
      if (response.status === 404) return setLoad({ state: "missing" });
      if (!response.ok) return setLoad({ state: "failed" });
      setLoad({ state: "ready", provider: await response.json() });
    } catch {
      setLoad({ state: "failed" });
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProvider();
  }, [fetchProvider]);

  const notOwner = load.state === "ready" && load.provider !== undefined && !load.provider.isOwner;
  useEffect(() => {
    if (session === null) router.replace("/sign-in");
    else if (session && notOwner) router.replace(`/providers/${id}`);
  }, [session, notOwner, id, router]);

  if (load.state === "missing") notFound();

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
      <h1>{id ? "Edit your business" : "List your business"}</h1>
      <p>{id ? "Changes appear on your public profile." : "One profile for every kind of auto provider."}</p>
    </div>
  );

  if (load.state === "failed") {
    return (
      <>
        {head}
        <Alert tone="danger" title="Could not load this page">
          Try again. Your information is safe.
        </Alert>
        <button type="button" className="btn" onClick={fetchProvider}>
          Try again
        </button>
      </>
    );
  }

  if (!session || load.state !== "ready" || notOwner) {
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

  return (
    <>
      {head}
      <ProviderForm id={id} provider={load.provider} onCreated={setCreatedId} />
    </>
  );
}

function ProviderForm({ id, provider, onCreated }: { id?: string; provider?: ProviderDetail; onCreated: (id: string) => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch(id ? `/api/providers/${id}` : "/api/providers", {
        method: id ? "PUT" : "POST",
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
      if (id && response.ok) return router.push(`/providers/${id}`);
      if (!id && response.status === 201) return onCreated((await response.json()).id);
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
      <TextField id="business-name" name="name" label="Business or professional name" defaultValue={provider?.name} error={fieldErrors.name} />
      <SelectField id="category" name="category" label="Category" defaultValue={provider?.category} error={fieldErrors.category}>
        {PROVIDER_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </SelectField>
      <SelectField id="municipality" name="municipality" label="GTA municipality" defaultValue={provider?.municipality} error={fieldErrors.municipality}>
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
          defaultValue={provider?.description}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
        />
        {fieldErrors.description && (
          <span className="field__error" id="description-error">
            {fieldErrors.description}
          </span>
        )}
      </div>
      <TextField id="contact" name="contactEmail" label="Contact email" type="email" autoComplete="email" defaultValue={provider?.contactEmail} error={fieldErrors.contactEmail} />
      <TextField id="phone" name="phone" label="Phone (optional)" type="tel" autoComplete="tel" defaultValue={provider?.phone ?? undefined} optional />
      <button className="btn btn--primary" type="submit" disabled={submitting} aria-busy={submitting || undefined}>
        {submitting ? "Saving…" : id ? "Save changes" : "Save business profile"}
      </button>
    </form>
  );
}

type SelectFieldProps = { id: string; name: string; label: string; defaultValue?: string; error?: string; children: React.ReactNode };

function SelectField({ id, name, label, defaultValue, error, children }: SelectFieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <select
        className="select"
        id={id}
        name={name}
        defaultValue={defaultValue}
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
