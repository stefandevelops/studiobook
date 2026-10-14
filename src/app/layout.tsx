import type { Metadata } from "next";
import { Literata, Outfit } from "next/font/google";
import "./globals.css";

const display = Literata({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudioBook · Book a web build consult",
  description:
    "Multi-step booking flow for a fictional web studio — junior frontend portfolio project.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
