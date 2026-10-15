"use client";

import Link from "next/link";
import { useState } from "react";
import { accountDestinations } from "@/components/site-nav/destinations";
import type { SessionMember } from "@/components/site-nav/use-session";
import { signOut } from "@/features/accounts/sign-out";

/** Avatar button and its popover; the native popover closes on Escape or outside click and returns focus. */
export function AccountMenu({ member }: { member: SessionMember }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="avatar-btn"
        popoverTarget="account-menu"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="avatar" aria-hidden="true">
          {member.initials}
        </span>
        <span className="visually-hidden">Account menu for {member.displayName}</span>
      </button>
      <div
        id="account-menu"
        popover="auto"
        className="popover account-menu"
        role="dialog"
        aria-labelledby="account-menu-title"
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <h2 id="account-menu-title">{member.displayName}</h2>
        <ul aria-label="Account">
          {accountDestinations(member).map((d) => (
            <li key={d.label}>
              <Link href={d.href} onClick={() => document.getElementById("account-menu")?.hidePopover()}>
                {d.label}
              </Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
