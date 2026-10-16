"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { GTA_AREAS } from "@/lib/gta-areas";
import { VEHICLE_MAKES } from "@/lib/vehicle-makes";
import { VehicleCard } from "./vehicle-card";
import type { VehicleSearchResult } from "./vehicle-search-service";

const FILTERS = ["q", "seller", "make", "model", "minPrice", "maxPrice", "area"];

type Load = { state: "loading" } | { state: "failed" } | { state: "rejected"; fieldErrors: Record<string, string> } | { state: "ready"; result: VehicleSearchResult };

export function VehicleSearch() {
  const params = useSearchParams();
  const query = params.toString();
  const [load, setLoad] = useState<Load>({ state: "loading" });

  const fetchVehicles = useCallback(async () => {
    setLoad({ state: "loading" });
    try {
      const response = await fetch(`/api/vehicles?${query}`);
      if (response.status === 400) return setLoad({ state: "rejected", fieldErrors: (await response.json()).fieldErrors });
      if (!response.ok) return setLoad({ state: "failed" });
      setLoad({ state: "ready", result: await response.json() });
    } catch {
      setLoad({ state: "failed" });
    }
  }, [query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchVehicles();
  }, [fetchVehicles]);

  const errors = load.state === "rejected" ? load.fieldErrors : {};
  const invalid = (name: string) => (errors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});
  const error = (name: string) =>
    errors[name] ? (
      <p className="field__error" id={`${name}-error`}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <main id="main" className="container stack" tabIndex={-1} aria-busy={load.state === "loading"}>
      <div className="page-head">
        <h1>Vehicles</h1>
        <p>Search private sellers and dealers across the GTA.</p>
      </div>
      <form className="filters" role="search" action="/vehicles" method="get" key={query}>
        <div className="field">
          <label className="field__label" htmlFor="q">Search vehicles</label>
          <input className="input" id="q" name="q" {...invalid("q")} type="search" defaultValue={params.get("q") ?? ""} />
          {error("q")}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="seller">Seller type</label>
          <select className="select" id="seller" name="seller" {...invalid("seller")} defaultValue={params.get("seller") ?? ""}>
            <option value="">All sellers</option>
            <option value="private">Private sellers</option>
            <option value="dealer">Dealers</option>
          </select>
          {error("seller")}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="make">Make</label>
          <select className="select" id="make" name="make" {...invalid("make")} defaultValue={params.get("make") ?? ""}>
            <option value="">Any make</option>
            {VEHICLE_MAKES.map((make) => (
              <option key={make}>{make}</option>
            ))}
          </select>
          {error("make")}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="model">Model</label>
          <input className="input" id="model" name="model" {...invalid("model")} type="text" defaultValue={params.get("model") ?? ""} />
          {error("model")}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="minPrice">Min price</label>
          <input className="input" id="minPrice" name="minPrice" {...invalid("minPrice")} type="number" min="0" inputMode="numeric" defaultValue={params.get("minPrice") ?? ""} />
          {error("minPrice")}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="maxPrice">Max price</label>
          <input className="input" id="maxPrice" name="maxPrice" {...invalid("maxPrice")} type="number" min="0" inputMode="numeric" defaultValue={params.get("maxPrice") ?? ""} />
          {error("maxPrice")}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="area">GTA municipality</label>
          <select className="select" id="area" name="area" {...invalid("area")} defaultValue={params.get("area") ?? ""}>
            <option value="">All of the GTA</option>
            {GTA_AREAS.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
          {error("area")}
        </div>
        <button className="btn btn--primary" type="submit">Search</button>
      </form>
      <Results load={load} params={params} filtered={FILTERS.some((name) => params.has(name))} retry={fetchVehicles} />
    </main>
  );
}

function Results({ load, params, filtered, retry }: { load: Load; params: URLSearchParams; filtered: boolean; retry: () => void }) {
  if (load.state === "loading") {
    return (
      <>
        <div className="card stack" aria-hidden="true">
          <span className="skeleton skeleton--text" style={{ width: "65%" }} />
          <span className="skeleton skeleton--text" style={{ width: "95%" }} />
          <span className="skeleton skeleton--text" style={{ width: "80%" }} />
          <span className="skeleton skeleton--text" style={{ width: "45%" }} />
        </div>
        <p role="status">Loading…</p>
      </>
    );
  }
  if (load.state === "rejected") return null;
  if (load.state === "failed") {
    return (
      <>
        <Alert tone="danger" title="Could not load this page">
          Try again. Your information is safe.
        </Alert>
        <button className="btn" type="button" onClick={retry}>Try again</button>
      </>
    );
  }
  const { items, total, page, pageSize } = load.result;
  const pages = Math.ceil(total / pageSize);
  const pageHref = (target: number) => {
    const next = new URLSearchParams(params);
    if (target === 1) next.delete("page");
    else next.set("page", String(target));
    const query = next.toString();
    return query ? `/vehicles?${query}` : "/vehicles";
  };
  if (total === 0) {
    return filtered ? (
      <section className="card stack">
        <h2>No matches</h2>
        <p>Try other filters or a different search term.</p>
        <Link className="btn btn--primary" href="/vehicles">Clear filters</Link>
      </section>
    ) : (
      <section className="card stack">
        <h2>No vehicles listed yet</h2>
        <p>Listings will appear here as members and dealers publish them.</p>
      </section>
    );
  }
  return (
    <>
      <p role="status">
        {total} {total === 1 ? "vehicle" : "vehicles"} · Newest first
      </p>
      <ul className="vehicle-grid">
        {items.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </ul>
      {pages > 1 && (
        <nav aria-label="Pagination" className="stack">
          {page > 1 && (
            <Link className="btn" href={pageHref(page - 1)} rel="prev">Previous</Link>
          )}
          {page < pages && (
            <Link className="btn" href={pageHref(page + 1)} rel="next">Next</Link>
          )}
          <p role="status">Page {page} of {pages}</p>
        </nav>
      )}
    </>
  );
}
