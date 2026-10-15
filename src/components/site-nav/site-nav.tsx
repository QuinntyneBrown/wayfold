import Link from "next/link";

export function SiteNav() {
  return (
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
    </nav>
  );
}
