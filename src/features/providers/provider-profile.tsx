"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import type { ProviderDetail } from "./provider-service";

type Load = { state: "loading" } | { state: "failed" } | { state: "missing" } | { state: "ready"; provider: ProviderDetail };

export function ProviderProfileView({ id }: { id: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });

  const fetchProvider = useCallback(async () => {
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

  if (load.state === "missing") notFound();

  if (load.state !== "ready") {
    return (
      <main id="main" className="container stack" tabIndex={-1} aria-busy={load.state === "loading"}>
        <div className="page-head">
          <h1>Provider profile</h1>
          <p>An auto provider in the GTA.</p>
        </div>
        {load.state === "loading" ? (
          <>
            <div className="card stack" aria-hidden="true">
              <span className="skeleton skeleton--text" style={{ width: "65%" }} />
              <span className="skeleton skeleton--text" style={{ width: "95%" }} />
              <span className="skeleton skeleton--text" style={{ width: "80%" }} />
              <span className="skeleton skeleton--text" style={{ width: "45%" }} />
            </div>
            <p role="status">Loading…</p>
          </>
        ) : (
          <>
            <Alert tone="danger" title="Could not load this page">
              Try again. Your information is safe.
            </Alert>
            <button type="button" className="btn" onClick={fetchProvider}>
              Try again
            </button>
          </>
        )}
      </main>
    );
  }

  const { provider } = load;

  return (
    <main id="main" className="container stack" tabIndex={-1}>
      <div className="page-head">
        <h1>{provider.name}</h1>
        <p>
          {provider.categoryLabel} in {provider.municipality}.
        </p>
      </div>
      <section className="card stack">
        <p className="eyebrow">
          {provider.categoryLabel} · {provider.municipality}
        </p>
        <h2>{provider.name}</h2>
        <p>{provider.description}</p>
        {provider.ownerChurch && (
          <span className="tag church-tag">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 3v18M7 8h10" />
            </svg>
            Owner attends {provider.ownerChurch}
          </span>
        )}
        <div className="cluster">
          {provider.phone && (
            <a className="btn" href={`tel:${provider.phone}`}>
              Call {provider.phone}
            </a>
          )}
          <a className="btn" href={`mailto:${provider.contactEmail}`}>
            Email
          </a>
          {provider.isOwner && (
            <Link className="btn" href={`/providers/${provider.id}/edit`}>
              Edit profile
            </Link>
          )}
        </div>
      </section>
      <section className="section-gap stack" aria-labelledby="provider-recommendations">
        <h2 id="provider-recommendations">Member recommendations</h2>
        <p>No recommendations yet.</p>
      </section>
    </main>
  );
}
