"use client";

import Link from "next/link";
import type { RefObject } from "react";
import type { Destination } from "@/components/site-nav/destinations";

type Props = {
  ref: RefObject<HTMLDialogElement | null>;
  destinations: Destination[];
  onClose: () => void;
};

/** Modal site menu below 768 px; the native dialog keeps the page inert and returns focus on close. */
export function SiteMenuSheet({ ref, destinations, onClose }: Props) {
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
            {destinations.map((d) => (
              <li key={d.label}>
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
