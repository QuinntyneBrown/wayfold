"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { VehicleDetail } from "./vehicle-detail-service";

const dollars = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-CA");

export function VehicleDetailView({ id }: { id: string }) {
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch(`/api/vehicles/${id}`);
      if (response.ok) setVehicle(await response.json());
    })();
  }, [id]);

  if (!vehicle) return null;
  const { seller } = vehicle;

  return (
    <main id="main" className="container stack" tabIndex={-1}>
      <div className="page-head">
        <h1>{vehicle.title}</h1>
        <p>
          {dollars.format(vehicle.price)} · {seller.sellerType === "dealer" ? "Dealer" : "Private seller"} · {vehicle.municipality}
        </p>
      </div>
      <div className="detail-layout">
        <div className="stack">
          {vehicle.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- listing photos are served by a route handler, not the image optimizer
            <img key={photo} className="gallery__main" src={`/api/photos/${photo}`} alt={`${vehicle.title}, front view`} width={640} height={480} />
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
          <section className="card stack" aria-labelledby="vehicle-seller">
            <h2 id="vehicle-seller">{seller.name}</h2>
            <p>{seller.sellerType === "dealer" ? "Dealer" : "Private seller"} · {vehicle.municipality}</p>
            {seller.homeChurch && (
              <span className="tag church-tag">
                <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 3v18M7 8h10" />
                </svg>
                {seller.homeChurch}
              </span>
            )}
            {seller.sellerType === "dealer" && <Link href={seller.profilePath}>View dealer profile</Link>}
          </section>
        </aside>
      </div>
    </main>
  );
}
