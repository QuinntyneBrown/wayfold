"use client";

import type { Car } from "./garage-service";
import { carTitle } from "./remove-car-dialog";

type Props = { cars: Car[]; isOwner: boolean; onEdit: (car: Car) => void; onRemove: (car: Car) => void };

/** One card per car, in a single column on a phone; the owner also gets Edit and Remove. */
export function GarageSection({ cars, isOwner, onEdit, onRemove }: Props) {
  if (cars.length === 0) return <p>No cars in this garage yet.</p>;

  return (
    <div className="garage-grid">
      {cars.map((car) => (
        <article key={car.id} className="garage-card card">
          {car.photoRef && (
            // eslint-disable-next-line @next/next/no-img-element -- member uploads are served by a route handler, not the image optimizer
            <img src={`/api/photos/${car.photoRef}`} alt={`${car.year} ${car.make} ${car.model}`} width={640} height={480} />
          )}
          <div className="stack">
            <h3>{carTitle(car)}</h3>
            {car.notes && <p>{car.notes}</p>}
            {isOwner && (
              <div className="cluster">
                <button type="button" className="btn" aria-haspopup="dialog" onClick={() => onEdit(car)}>
                  Edit car
                </button>
                <button type="button" className="btn btn--ghost" aria-haspopup="dialog" onClick={() => onRemove(car)}>
                  Remove car
                </button>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
