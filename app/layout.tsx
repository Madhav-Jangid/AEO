import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NajmAI - Your AI-Powered Design Assistant",
  description: "Unlock your creative potential. Seamlessly generate, customize, and perfect your designs with cutting-edge AI technology.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
