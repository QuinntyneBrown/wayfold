import type { Metadata } from "next";
import { ProviderEditor } from "@/features/providers/provider-editor";

export const metadata: Metadata = { title: "Edit your business - Wayfold" };

export default async function EditProviderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="container container--narrow stack">
      <ProviderEditor id={(await params).id} />
    </div>
  );
}
