import type { Metadata } from "next";
import { ProviderProfileView } from "@/features/providers/provider-profile";

export const metadata: Metadata = { title: "Provider - Wayfold" };

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProviderProfileView id={(await params).id} />;
}
