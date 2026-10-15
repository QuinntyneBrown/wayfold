import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found - Wayfold" };

export default function NotFound() {
  return (
    <div className="container stack">
      <div className="page-head">
        <h1>Page not found</h1>
        <p>That page isn&apos;t here.</p>
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
