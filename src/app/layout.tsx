import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TicketHub - Ghana's Premier Event Ticketing Platform",
    template: "%s | TicketHub",
  },
  description:
    "Discover, book, and enjoy amazing events across Ghana. Secure ticketing powered by Paystack.",
  keywords: ["events", "tickets", "Ghana", "concerts", "sports", "entertainment"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
