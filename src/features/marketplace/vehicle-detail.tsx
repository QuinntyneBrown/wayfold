"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { useSession } from "@/components/site-nav/use-session";
import { ContactSellerDialog } from "./contact-seller-dialog";
import type { VehicleDetail } from "./vehicle-detail-service";

const dollars = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-CA");

type Load =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "ready"; vehicle: VehicleDetail };

export function VehicleDetailView({ id }: { id: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [messaging, setMessaging] = useState(false);
  const session = useSession();

  const fetchVehicle = useCallback(async () => {
    setLoad({ state: "loading" });
    try {
      const response = await fetch(`/api/vehicles/${id}`);
      if (!response.ok) return setLoad({ state: "failed" });
      setLoad({ state: "ready", vehicle: await response.json() });
    } catch {
      setLoad({ state: "failed" });
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchVehicle();
  }, [fetchVehicle]);

  if (load.state !== "ready") {
    return (
      <main
        id="main"
        className="container stack"
        tabIndex={-1}
        aria-busy={load.state === "loading"}
      >
        <div className="page-head">
          <h1>Vehicle detail</h1>
          <p>A GTA vehicle for sale.</p>
        </div>
        {load.state === "loading" ? (
          <>
            <div className="card stack" aria-hidden="true">
              <span
                className="skeleton skeleton--text"
                style={{ width: "65%" }}
              />
              <span
                className="skeleton skeleton--text"
                style={{ width: "95%" }}
              />
              <span
                className="skeleton skeleton--text"
                style={{ width: "80%" }}
              />
              <span
                className="skeleton skeleton--text"
                style={{ width: "45%" }}
              />
            </div>
            <p role="status">Loading…</p>
          </>
        ) : (
          <>
            <Alert tone="danger" title="Could not load this page">
              Try again. Your information is safe.
            </Alert>
            <button type="button" className="btn" onClick={fetchVehicle}>
              Try again
            </button>
          </>
        )}
      </main>
    );
  }

  const { vehicle } = load;
  const { seller } = vehicle;

  return (
    <main id="main" className="container stack" tabIndex={-1}>
      <div className="page-head">
        <h1>{vehicle.title}</h1>
        <p>
          {dollars.format(vehicle.price)} ·{" "}
          {seller.sellerType === "dealer" ? "Dealer" : "Private seller"} ·{" "}
          {vehicle.municipality}
        </p>
      </div>
      <div className="detail-layout">
        <div className="stack">
          {vehicle.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- listing photos are served by a route handler, not the image optimizer
            <img
              key={photo}
              className="gallery__main"
              src={`/api/photos/${photo}`}
              alt={`${vehicle.title}, front view`}
              width={640}
              height={480}
            />
          ))}
          <section className="card stack" aria-labelledby="vehicle-details">
            <h2 id="vehicle-details">Vehicle details</h2>
            <dl className="detail-list">
              <div>
                <dt>Mileage</dt>
                <dd>{number.format(vehicle.mileage)} km</dd>
              </div>
              {vehicle.condition && (
                <div>
                  <dt>Condition</dt>
                  <dd>{vehicle.condition}</dd>
                </div>
              )}
              <div>
                <dt>Location</dt>
                <dd>{vehicle.municipality}</dd>
              </div>
              {vehicle.features.length > 0 && (
                <div>
                  <dt>Features</dt>
                  <dd>{vehicle.features.join(", ")}</dd>
                </div>
              )}
            </dl>
            {vehicle.description && <p>{vehicle.description}</p>}
          </section>
        </div>
        <aside className="stack">
          {vehicle.status === "sold" ? (
            <section className="card stack">
              <h2>Sold</h2>
              <p>This vehicle is no longer available.</p>
            </section>
          ) : (
            <section className="card stack" aria-labelledby="vehicle-seller">
              <h2 id="vehicle-seller">{seller.name}</h2>
              <p>
                {seller.sellerType === "dealer" ? "Dealer" : "Private seller"} ·{" "}
                {vehicle.municipality}
              </p>
              {seller.homeChurch && (
                <span className="tag church-tag">
                  <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12 3v18M7 8h10" />
                  </svg>
                  {seller.homeChurch}
                </span>
              )}
              {seller.sellerType === "dealer" && (
                <Link href={seller.profilePath}>View dealer profile</Link>
              )}
              {seller.canMessage && session === null && (
                <Link className="btn btn--primary" href="/sign-in">
                  Message seller
                </Link>
              )}
              {seller.canMessage && session && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setMessaging(true)}
                >
                  Message seller
                </button>
              )}
            </section>
          )}
        </aside>
      </div>
      {messaging && (
        <ContactSellerDialog
          vehicleId={vehicle.id}
          onClose={() => setMessaging(false)}
        />
      )}
    </main>
  );
}
