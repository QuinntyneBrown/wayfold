import Link from "next/link";
import { SiteNav } from "@/components/site-nav/site-nav";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        Wayfold <span className="wordmark__tag">Toronto</span>
      </Link>
      <SiteNav />
    </header>
  );
}
