"use client";

import { useState } from "react";

type Props = {
  memberId: string;
  firstName: string;
  following: boolean;
  onChange: (following: boolean, followers: number) => void;
  onError: () => void;
};

/** Follows or unfollows the member; disabled while the request runs. */
export function FollowButton({ memberId, firstName, following, onChange, onError }: Props) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const response = await fetch(`/api/members/${memberId}/follow`, { method: following ? "DELETE" : "POST" });
      if (response.ok) onChange(!following, (await response.json()).followers);
      else onError();
    } catch {
      onError();
    }
    setBusy(false);
  }

  return (
    <button type="button" className={following ? "btn" : "btn btn--primary"} aria-pressed={following} disabled={busy} onClick={toggle}>
      {following ? "Following" : `Follow ${firstName}`}
    </button>
  );
}
