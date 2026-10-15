"use client";

import { useEffect, useState } from "react";

/** Dispatched on window when the member's name changes, so the header asks again. */
export const SESSION_CHANGED = "wayfold:session-changed";

export type SessionMember = { id: string; displayName: string; initials: string };

/** The signed-in member, `null` for a signed-out visitor, or `undefined` while still asking. */
export function useSession() {
  const [member, setMember] = useState<SessionMember | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetch("/api/session")
        .then(async (response) => (response.ok ? ((await response.json()) as SessionMember) : null))
        .catch(() => null)
        .then((result) => active && setMember(result));
    refresh();
    window.addEventListener(SESSION_CHANGED, refresh);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED, refresh);
    };
  }, []);

  return member;
}
