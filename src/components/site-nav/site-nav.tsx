"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { SiteMenuSheet } from "@/components/site-menu-sheet/site-menu-sheet";

/** The sign-in and sign-up pages show only the wordmark, as in their mocks. */
const FOCUSED_ROUTES = ["/sign-in", "/sign-up"];

export function SiteNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => {
    menuRef.current?.showModal();
    setMenuOpen(true);
  };

  if (FOCUSED_ROUTES.includes(pathname)) return null;

  return (
    <>
      <nav className="site-nav" aria-label="Primary">
        <Link className="site-nav__link site-nav__extra" href="/vehicles">
          Vehicles
        </Link>
        <Link className="site-nav__link site-nav__extra" href="/providers">
          Providers
        </Link>
        <Link className="site-nav__link site-nav__extra" href="/products">
          Products
        </Link>
        <Link className="site-nav__link site-nav__extra" href="/sign-in">
          Sign in
        </Link>
        <Link className="btn btn--primary btn--sm site-nav__extra" href="/sign-up">
          Create account
        </Link>
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
      <SiteMenuSheet ref={menuRef} onClose={() => setMenuOpen(false)} />
    </>
  );
}
