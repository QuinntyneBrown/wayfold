import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer/site-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import "./styles/tokens.css";
import "./styles/components.css";
import "./styles/ui.css";

export const metadata: Metadata = {
  title: "Wayfold",
  description: "Cars, care and community across Toronto and the GTA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
