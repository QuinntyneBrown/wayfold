"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Sends a signed-in member home; returns true once the visitor is known to be signed out. */
export function useSignedOutOnly() {
  const router = useRouter();
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/session")
      .then((response) => {
        if (!active) return;
        if (response.ok) router.replace("/");
        else setSignedOut(true);
      })
      .catch(() => active && setSignedOut(true));
    return () => {
      active = false;
    };
  }, [router]);

  return signedOut;
}
