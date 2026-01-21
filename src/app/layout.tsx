import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I&P AC/AB Operations Hub",
  description: "Plateforme de pilotage des Advisory Committees & Advisory Boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
