"use client";

/** Ends this browser's session, then reloads home so every part of the page sees the visitor state. */
export async function signOut() {
  await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/");
}
