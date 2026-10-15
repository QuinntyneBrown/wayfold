"use client";

import Link from "next/link";
import type { RefObject } from "react";

type Props = {
  ref: RefObject<HTMLDialogElement | null>;
  onClose: () => void;
};

const DESTINATIONS = [
  { href: "/vehicles", label: "Vehicles" },
  { href: "/providers", label: "Providers" },
  { href: "/products", label: "Products" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
];

/** Modal site menu below 768 px; the native dialog keeps the page inert and returns focus on close. */
export function SiteMenuSheet({ ref, onClose }: Props) {
  const close = () => ref.current?.close();

  return (
    <dialog ref={ref} className="sheet" aria-labelledby="site-menu-title" onClose={onClose}>
      <div className="sheet__header">
        <h2 id="site-menu-title">Menu</h2>
        <button type="button" className="btn btn--ghost" aria-label="Close menu" onClick={close}>
          Close
        </button>
      </div>
      <div className="sheet__body">
        <nav aria-label="Main">
          <ul className="section-list">
            {DESTINATIONS.map((d) => (
              <li key={d.href}>
                <Link className="section-link" href={d.href} onClick={close}>
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </dialog>
  );
}
