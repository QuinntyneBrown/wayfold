"use client";

import type { ReactNode } from "react";
import { useSession } from "@/components/site-nav/use-session";
import { Feed } from "./feed";

/** A signed-in member sees their feed; everyone else, and anyone while the session is still being asked, sees the public landing page. */
export function Home({ landing }: { landing: ReactNode }) {
  const member = useSession();
  return member ? <Feed fallback={landing} /> : landing;
}
