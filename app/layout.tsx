import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onoo Core Services",
  description: "Backend API for Onoo Outreach Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
