"use client";

import { useEffect, useState } from "react";

export type SessionMember = { id: string; displayName: string; initials: string };

/** The signed-in member, `null` for a signed-out visitor, or `undefined` while still asking. */
export function useSession() {
  const [member, setMember] = useState<SessionMember | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetch("/api/session")
      .then(async (response) => (response.ok ? ((await response.json()) as SessionMember) : null))
      .catch(() => null)
      .then((result) => active && setMember(result));
    return () => {
      active = false;
    };
  }, []);

  return member;
}
