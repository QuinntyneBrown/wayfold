import type { Metadata } from "next";
import { ProviderEditor } from "@/features/providers/provider-editor";

export const metadata: Metadata = { title: "List your business - Wayfold" };

export default function NewProviderPage() {
  return (
    <div className="container container--narrow stack">
      <ProviderEditor />
    </div>
  );
}
