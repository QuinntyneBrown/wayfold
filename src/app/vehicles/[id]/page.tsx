import type { Metadata } from "next";
import { VehicleDetailView } from "@/features/marketplace/vehicle-detail";

export const metadata: Metadata = { title: "Vehicle - Wayfold" };

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  return <VehicleDetailView id={(await params).id} />;
}
