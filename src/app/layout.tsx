import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicLens AI — Autonomous Civic Audit & Proof-of-Work Platform",
  description:
    "Tonal Spot Eco Design: Enterprise Fleet Architecture, Dual-Vision Closed Loop & Contractor Governance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-eco-surface text-eco-on-surface antialiased selection:bg-eco-primary-container selection:text-eco-on-primary-container">
        {children}
      </body>
    </html>
  );
}
