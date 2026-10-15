"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { AccountMenu } from "@/components/account-menu/account-menu";
import { SiteMenuSheet } from "@/components/site-menu-sheet/site-menu-sheet";
import { accountDestinations, BROWSE, FEED, SELL, SIGNED_OUT } from "./destinations";
import { useSession } from "./use-session";

/** The sign-in and sign-up pages show only the wordmark, as in their mocks. */
const FOCUSED_ROUTES = ["/sign-in", "/sign-up"];

export function SiteNav() {
  const pathname = usePathname();
  const member = useSession();
  const menuRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  if (FOCUSED_ROUTES.includes(pathname)) return null;

  const openMenu = () => {
    menuRef.current?.showModal();
    setMenuOpen(true);
  };

  const menuDestinations = member
    ? [FEED, ...BROWSE, SELL, ...accountDestinations(member)]
    : member === null
      ? [...BROWSE, ...SIGNED_OUT]
      : BROWSE;

  return (
    <>
      <nav className="site-nav" aria-label="Primary">
        {member && (
          <Link className="site-nav__link site-nav__extra" href={FEED.href}>
            {FEED.label}
          </Link>
        )}
        {BROWSE.map((d) => (
          <Link key={d.href} className="site-nav__link site-nav__extra" href={d.href}>
            {d.label}
          </Link>
        ))}
        {member === null && (
          <>
            <Link className="site-nav__link site-nav__extra" href="/sign-in">
              Sign in
            </Link>
            <Link className="btn btn--primary btn--sm site-nav__extra" href="/sign-up">
              Create account
            </Link>
          </>
        )}
        {member && (
          <>
            <Link className="btn btn--primary btn--sm site-nav__extra" href={SELL.href}>
              {SELL.label}
            </Link>
            <AccountMenu member={member} />
          </>
        )}
        <button
          type="button"
          className="btn btn--ghost site-nav__menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={openMenu}
        >
          <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          Menu
        </button>
      </nav>
      <SiteMenuSheet
        ref={menuRef}
        destinations={menuDestinations}
        signedIn={Boolean(member)}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
