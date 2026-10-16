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

type Load = { state: "loading" } | { state: "failed" } | { state: "ready"; result: VehicleSearchResult };

export function VehicleSearch() {
  const params = useSearchParams();
  const query = params.toString();
  const [load, setLoad] = useState<Load>({ state: "loading" });

  const fetchVehicles = useCallback(async () => {
    setLoad({ state: "loading" });
    try {
      const response = await fetch(`/api/vehicles?${query}`);
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

  return (
    <main id="main" className="container stack" tabIndex={-1} aria-busy={load.state === "loading"}>
      <div className="page-head">
        <h1>Vehicles</h1>
        <p>Search private sellers and dealers across the GTA.</p>
      </div>
      <form className="filters" role="search" action="/vehicles" method="get" key={query}>
        <div className="field">
          <label className="field__label" htmlFor="q">Search vehicles</label>
          <input className="input" id="q" name="q" type="search" defaultValue={params.get("q") ?? ""} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="seller">Seller type</label>
          <select className="select" id="seller" name="seller" defaultValue={params.get("seller") ?? ""}>
            <option value="">All sellers</option>
            <option value="private">Private sellers</option>
            <option value="dealer">Dealers</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="make">Make</label>
          <select className="select" id="make" name="make" defaultValue={params.get("make") ?? ""}>
            <option value="">Any make</option>
            {VEHICLE_MAKES.map((make) => (
              <option key={make}>{make}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="model">Model</label>
          <input className="input" id="model" name="model" type="text" defaultValue={params.get("model") ?? ""} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="minPrice">Min price</label>
          <input className="input" id="minPrice" name="minPrice" type="number" min="0" inputMode="numeric" defaultValue={params.get("minPrice") ?? ""} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="maxPrice">Max price</label>
          <input className="input" id="maxPrice" name="maxPrice" type="number" min="0" inputMode="numeric" defaultValue={params.get("maxPrice") ?? ""} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="area">GTA municipality</label>
          <select className="select" id="area" name="area" defaultValue={params.get("area") ?? ""}>
            <option value="">All of the GTA</option>
            {GTA_AREAS.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </div>
        <button className="btn btn--primary" type="submit">Search</button>
      </form>
      <Results load={load} filtered={FILTERS.some((name) => params.has(name))} retry={fetchVehicles} />
    </main>
  );
}

function Results({ load, filtered, retry }: { load: Load; filtered: boolean; retry: () => void }) {
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
  const { items, total } = load.result;
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
    </>
  );
}
