"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { TextField } from "@/components/text-field/text-field";
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

  const { settings } = load;
  return (
    <>
      {head}
      <form className="card stack" noValidate>
        <TextField id="display-name" name="displayName" label="Display name" defaultValue={settings.displayName} />
        <div className="field">
          <label className="field__label" htmlFor="area">
            GTA area
          </label>
          <select className="select" id="area" name="gtaArea" defaultValue={settings.gtaArea ?? ""}>
            <option value="">Choose your area</option>
            {GTA_AREAS.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </div>
        <TextField id="home-church" name="homeChurch" label="Home church (optional)" defaultValue={settings.homeChurch ?? ""} optional />
        <label className="choice">
          <input
            type="checkbox"
            name="showHomeChurch"
            defaultChecked={settings.showHomeChurch}
            aria-describedby="church-help"
          />
          <span className="choice__text">Show my home church to signed-in members</span>
        </label>
        <p className="field__help" id="church-help">
          Your church is never visible to signed-out visitors.
        </p>
        <TextField id="current-password" name="currentPassword" label="Current password" type="password" autoComplete="current-password" optional />
        <TextField id="new-password" name="newPassword" label="New password" type="password" autoComplete="new-password" optional />
        <button className="btn btn--primary" type="submit">
          Save settings
        </button>
      </form>
    </>
  );
}
