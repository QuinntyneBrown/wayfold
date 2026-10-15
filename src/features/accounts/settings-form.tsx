"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { TextField } from "@/components/text-field/text-field";
import { SESSION_CHANGED } from "@/components/site-nav/use-session";
import { GTA_AREAS } from "@/lib/gta-areas";

type Settings = { displayName: string; gtaArea: string | null; homeChurch: string | null; showHomeChurch: boolean };
type Load = { state: "loading" } | { state: "failed" } | { state: "ready"; settings: Settings };

export function SettingsForm() {
  const router = useRouter();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [crash, setCrash] = useState<unknown>(null);

  const fetchSettings = useCallback(async () => {
    setLoad({ state: "loading" });
    try {
      const response = await fetch("/api/account");
      if (response.status === 401) return router.replace("/sign-in");
      if (!response.ok) return setLoad({ state: "failed" });
      // A body that is not JSON is unexpected: hand it to the error boundary below.
      setLoad({ state: "ready", settings: await response.json().catch((error) => Promise.reject(error)) });
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") return setLoad({ state: "failed" });
      setCrash(error ?? new Error("unexpected"));
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSettings();
  }, [fetchSettings]);

  if (crash) throw crash;

  const head = (
    <div className="page-head">
      <h1>Settings</h1>
      <p>{load.state === "ready" ? "Choose what members see and manage your password." : "Manage your profile and account."}</p>
    </div>
  );

  if (load.state === "loading") {
    return (
      <div aria-busy="true">
        {head}
        <div className="card stack" aria-hidden="true">
          <span className="skeleton skeleton--text" style={{ width: "65%" }} />
          <span className="skeleton skeleton--text" style={{ width: "95%" }} />
          <span className="skeleton skeleton--text" style={{ width: "80%" }} />
          <span className="skeleton skeleton--text" style={{ width: "45%" }} />
        </div>
        <p role="status">Loading…</p>
      </div>
    );
  }

  if (load.state === "failed") {
    return (
      <>
        {head}
        <Alert tone="danger" title="Could not load this page">
          Try again. Your information is safe.
        </Alert>
        <button type="button" className="btn" onClick={fetchSettings}>
          Try again
        </button>
      </>
    );
  }

  return (
    <>
      {head}
      <SettingsFields settings={load.settings} />
    </>
  );
}

type Notice = "invalid" | "saved" | "error" | null;

function SettingsFields({ settings }: { settings: Settings }) {
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          gtaArea: form.get("gtaArea"),
          homeChurch: form.get("homeChurch"),
          showHomeChurch: form.get("showHomeChurch") === "on",
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
        }),
      });
      if (response.ok) {
        setFieldErrors({});
        setNotice("saved");
        formElement.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((input) => (input.value = ""));
        window.dispatchEvent(new Event(SESSION_CHANGED));
      } else if (response.status === 400) {
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
        <Alert tone="danger" title="Check your settings">
          Please correct the marked fields.
        </Alert>
      )}
      {notice === "saved" && (
        <Alert tone="success" title="Saved">
          Your profile and church visibility have been updated.
        </Alert>
      )}
      {notice === "error" && (
        <Alert tone="danger" title="Something went wrong">
          Try again in a moment.
        </Alert>
      )}
      <TextField id="display-name" name="displayName" label="Display name" defaultValue={settings.displayName} error={fieldErrors.displayName} />
      <div className="field">
        <label className="field__label" htmlFor="area">
          GTA area
        </label>
        <select
          className="select"
          id="area"
          name="gtaArea"
          defaultValue={settings.gtaArea ?? ""}
          aria-invalid={fieldErrors.gtaArea ? true : undefined}
          aria-describedby={fieldErrors.gtaArea ? "area-error" : undefined}
        >
          <option value="">Choose your area</option>
          {GTA_AREAS.map((area) => (
            <option key={area}>{area}</option>
          ))}
        </select>
        {fieldErrors.gtaArea && (
          <span className="field__error" id="area-error">
            {fieldErrors.gtaArea}
          </span>
        )}
      </div>
      <TextField id="home-church" name="homeChurch" label="Home church (optional)" defaultValue={settings.homeChurch ?? ""} optional error={fieldErrors.homeChurch} />
      <label className="choice">
        <input type="checkbox" name="showHomeChurch" defaultChecked={settings.showHomeChurch} aria-describedby="church-help" />
        <span className="choice__text">Show my home church to signed-in members</span>
      </label>
      <p className="field__help" id="church-help">
        Your church is never visible to signed-out visitors.
      </p>
      <TextField id="current-password" name="currentPassword" label="Current password" type="password" autoComplete="current-password" optional error={fieldErrors.currentPassword} />
      <TextField id="new-password" name="newPassword" label="New password" type="password" autoComplete="new-password" optional error={fieldErrors.newPassword} />
      <button className="btn btn--primary" type="submit" disabled={submitting} aria-busy={submitting || undefined}>
        Save settings
      </button>
    </form>
  );
}
