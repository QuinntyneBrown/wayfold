import type { Metadata } from "next";
import { MemberProfile } from "@/features/community/member-profile";

export const metadata: Metadata = { title: "Member profile - Wayfold" };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  return <MemberProfile id={(await params).id} />;
}
