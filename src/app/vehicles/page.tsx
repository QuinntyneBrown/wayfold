import type { Metadata } from "next";
import { Suspense } from "react";
import { VehicleSearch } from "@/features/marketplace/vehicle-search";

export const metadata: Metadata = { title: "Vehicles - Wayfold" };

export default function VehiclesPage() {
  return (
    <Suspense>
      <VehicleSearch />
    </Suspense>
  );
}
