import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aeo-dignostics.vercel.app"),
  title: {
    default: "AEOlytics",
    template: "%s | AEOlytics",
  },
  description: "Understand how often and where your brand appears in AI answers.",
  applicationName: "AEOlytics",
  icons: {
    icon: [
      {
        url: "https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    shortcut: "https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png",
    apple: "https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
