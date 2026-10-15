import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <strong>Wayfold</strong>
        <span>Cars, care and community across Toronto and the GTA.</span>
      </div>
      <nav className="site-footer__links" aria-label="Footer">
        <ul>
          <li>
            <Link href="/vehicles">Vehicles</Link>
          </li>
          <li>
            <Link href="/providers">Providers</Link>
          </li>
          <li>
            <Link href="/products">Products</Link>
          </li>
          <li>
            <Link href="/sign-up">Create account</Link>
          </li>
        </ul>
      </nav>
      <p className="site-footer__copy">&copy; 2026 Wayfold - Toronto and the GTA</p>
    </footer>
  );
}
