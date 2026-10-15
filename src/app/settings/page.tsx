import type { Metadata } from "next";
import { SettingsForm } from "@/features/accounts/settings-form";

export const metadata: Metadata = { title: "Settings - Wayfold" };

export default function SettingsPage() {
  return (
    <div className="container container--narrow stack">
      <SettingsForm />
    </div>
  );
}
