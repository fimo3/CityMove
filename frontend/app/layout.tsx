import type { Metadata } from "next";
import "./globals.css";
// Leaflet CSS imported globally to ensure styles are available for the map
import "leaflet/dist/leaflet.css";
import Nav from "./(components)/Nav";

export const metadata: Metadata = {
  title: "CityMove",
  description: "Your integrated transport platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </body>
    </html>
  );
}
