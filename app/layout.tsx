import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorReporter } from "@/components/ErrorReporter";

export const metadata: Metadata = {
  title: "Dragon Valley // Attack Ledger",
  description: "A unified guild hub for tracking Dragon Valley attacks",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0704",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-pixel scanlines h-full overflow-hidden bg-dv-bg">
        <ErrorReporter />
        {children}
      </body>
    </html>
  );
}
