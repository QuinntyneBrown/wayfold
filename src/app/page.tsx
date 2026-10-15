import Link from "next/link";
import { Home } from "@/features/community/home";

function Landing() {
  return (
    <div className="container">
      <section className="home-hero">
        <h1>Find your people in the GTA auto community</h1>
        <p className="subtitle">
          Discover cars for sale, local auto providers and the products members recommend. Anyone in
          the GTA can join.
        </p>
        <div className="cluster">
          <Link className="btn btn--primary" href="/sign-up">
            Create account
          </Link>
          <Link className="btn" href="/vehicles">
            Browse vehicles
          </Link>
        </div>
      </section>
      <section className="section-gap cluster">
        <div>
          <section className="card stack">
            <h2>Local providers</h2>
            <p>Find mechanics, dealers, financing professionals and more.</p>
            <Link className="btn" href="/providers">
              Explore providers
            </Link>
          </section>
        </div>
        <div>
          <section className="card stack">
            <h2>Recommended products</h2>
            <p>See what local drivers use and where they bought it.</p>
            <Link className="btn" href="/products">
              Explore products
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return <Home landing={<Landing />} />;
}
