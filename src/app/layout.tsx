import type { Metadata } from "next";
import "./globals.css";
import "./markdown-styles.css";

export const metadata: Metadata = {
  title: "AI Learning Agent — 6-Month Career Accelerator",
  description: "Personalized AI-powered learning system with spaced repetition, mock interviews, and career tracking",
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
