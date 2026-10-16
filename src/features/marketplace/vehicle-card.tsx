import Link from "next/link";
import type { VehicleCard as Vehicle } from "./vehicle-search-service";

const dollars = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-CA");

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <li className="vehicle-card">
      {vehicle.photoRef ? (
        // eslint-disable-next-line @next/next/no-img-element -- listing photos are served by a route handler, not the image optimizer
        <img className="vehicle-card__media" src={`/api/photos/${vehicle.photoRef}`} alt={`${vehicle.title}, front view`} width={640} height={480} />
      ) : (
        <div className="vehicle-card__media" aria-hidden="true" />
      )}
      <div className="vehicle-card__body">
        <strong className="vehicle-card__price">{dollars.format(vehicle.price)}</strong>
        <Link className="vehicle-card__title" href={`/vehicles/${vehicle.id}`}>
          {vehicle.title}
        </Link>
        <span className="list__meta">
          {number.format(vehicle.mileage)} km · {vehicle.municipality}
        </span>
        <span className="list__meta">{vehicle.sellerType === "private" ? `Private seller · ${vehicle.sellerName}` : vehicle.sellerName}</span>
      </div>
    </li>
  );
}
