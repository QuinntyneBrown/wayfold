import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wayfold",
  description: "Cars, care and community across Toronto and the GTA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA">
      <body>{children}</body>
    </html>
  );
}
