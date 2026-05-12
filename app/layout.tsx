import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gender Reveal Link",
  description: "Hash + AES only static gender reveal"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
