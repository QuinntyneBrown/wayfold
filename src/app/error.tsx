"use client";

import Link from "next/link";

/** Unexpected render errors: a generic message, never the error text (L2-021 AC3). */
export default function ServerError() {
  return (
    <div className="container stack">
      <div className="page-head">
        <h1>Something went wrong</h1>
        <p>We couldn&apos;t load the page. Please try again.</p>
      </div>
      <section className="card stack">
        <h2>Back to Wayfold</h2>
        <p>Browse vehicles, providers and products while you continue.</p>
        <Link className="btn btn--primary" href="/">
          Go home
        </Link>
      </section>
    </div>
  );
}
