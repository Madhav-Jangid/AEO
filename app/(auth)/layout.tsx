import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | AEOlytics",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[rgb(16,17,18)] font-sans text-white">
      {/* Left Pane - Product Info */}


      {/* Right Pane - Auth Form */}
      <div className="w-full flex items-center justify-center p-6 sm:p-12 relative">
        <Image
          src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
          alt="AEOlytics preview"
          width={720}
          height={720}
          className="absolute inset-0 mx-auto w-[40%] h-auto object-contain animate-rotate-slow blur-[10px]"
          priority
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[rgba(16,17,18,0.75)]" />

        <div className="w-full max-w-md relative z-10">
          <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[rgb(145,75,241)] rounded-lg text-white font-bold text-xl">A</div>
            <span className="font-semibold text-xl tracking-wide">AEOlytics</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
