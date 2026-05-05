"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChartBarIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(145,75,241)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─────────────────────────────────────────
   MARQUEE
───────────────────────────────────────── */
function Marquee({
  children,
  direction = "left",
  vertical = false,
}: {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  vertical?: boolean;
}) {
  const animClass = vertical
    ? direction === "up" ? "animate-marquee-up" : "animate-marquee-down"
    : direction === "left" ? "animate-marquee-left" : "animate-marquee-right";
  return (
    <div className="overflow-hidden" style={vertical ? { height: "100%" } : {}}>
      <div
        className={`flex ${vertical ? "flex-col" : "flex-row"} ${animClass}`}
        style={{ width: vertical ? "100%" : "fit-content" }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const aiEngines = [
  "GPT-4o", "Claude 3.5", "Gemini 1.5", "Perplexity",
  "Copilot", "Meta AI", "Mistral", "Llama 3",
  "GPT-4o mini", "Claude Haiku", "Gemini Flash", "You.com",
];

const stepCards = [
  {
    icon: <SearchIcon />,
    title: "Enter a Query",
    text: "Type a search query the way a customer would. Example: 'best magnesium supplement for seniors'.",
  },
  {
    icon: <ChartBarIcon />,
    title: "Run Across AI Models",
    text: "We send the query to multiple AI systems and collect their responses.",
  },
  {
    icon: <LightbulbIcon />,
    title: "Review the Report",
    text: "See if your product is mentioned, where it ranks, and what can be improved.",
  },
];
const benefitCards = [
  {
    title: "Understand AI Visibility",
    text: "See whether your product appears in AI-generated recommendations, how often it is mentioned, and how consistently it shows up across different AI systems.",
  },
  {
    title: "Track Competitors",
    text: "Identify which competing products are being suggested instead of yours, and understand how frequently they appear and in what context.",
  },
  {
    title: "Improve Discoverability",
    text: "Spot gaps between your product listing and what AI systems tend to recommend, helping you align your content with how products are actually surfaced.",
  },
  {
    title: "Clear Next Steps",
    text: "Get practical, actionable suggestions based on real AI responses so you know exactly what to improve and where to focus next.",
  },
];

const pricingPlans = [
  {
    name: "FREE",
    price: "$0",
    period: "No card required",
    features: [
      "1 diagnostic scan",
      "Responses from major AI models",
      "Basic mention detection",
      "Overall AEO score",
    ],
    highlight: false,
    btnVariant: "outline" as const,
    btnLabel: "Try for Free",
  },
  {
    name: "PRO",
    price: "$29",
    period: "Per month",
    features: [
      "Unlimited scans",
      "Competitor comparison",
      "Ranking and sentiment analysis",
      "Actionable recommendations",
      "Scan history",
      "Export reports",
    ],
    highlight: true,
    btnVariant: "primary" as const,
    btnLabel: "Upgrade to Pro",
  },
  {
    name: "AGENCY",
    price: "$79",
    period: "Per month",
    features: [
      "Everything in Pro",
      "Multiple brand profiles",
      "White-label reports",
      "API access",
      "Team access",
      "Priority support",
    ],
    highlight: false,
    btnVariant: "outline" as const,
    btnLabel: "Contact Sales",
  },
];



const testimonials = [
  {
    name: "Sarah M.",
    text: "We discovered our product wasn’t being mentioned at all in AI answers. That alone made the tool worth it.",
  },
  {
    name: "Michael S.",
    text: "The competitor comparison helped us understand what others were doing better.",
  },
  {
    name: "David L.",
    text: "We used the suggestions to improve our listing and saw gradual improvement in mentions.",
  },
  {
    name: "James K.",
    text: "It’s a useful starting point when auditing a new client’s product visibility.",
  },
  {
    name: "Robert P.",
    text: "The recommendations were specific enough to act on without guesswork.",
  },
  {
    name: "William M.",
    text: "If you're relying on AI-driven discovery, tools like this help you stay informed.",
  },
];

const faqs = [
  {
    q: "What is AEOlytics?",
    a: "AEOlytics helps you understand how your product appears in AI-generated answers from systems like GPT, Claude, and Gemini.",
  },
  {
    q: "How does it work?",
    a: "You enter a query and your brand name. The tool runs the query across multiple AI models and analyzes mentions, ranking, and tone.",
  },
  {
    q: "Do I need an account?",
    a: "You can run one scan for free without an account. Sign up to save and track results.",
  },
  {
    q: "What does the score mean?",
    a: "The score reflects how often your product appears, where it ranks, and how it is described.",
  },
  {
    q: "How often should I use it?",
    a: "After major updates or periodically to track changes over time.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your queries and results are private and not used to train models.",
  },
];

const articles = [
  {
    title: "What Is AEO and Why It's the New SEO for Product Brands",
    category: "Guide",
    date: "Apr 28, 2025",
    readTime: "7 min read",
  },
  {
    title: "How ChatGPT Decides Which Products to Recommend",
    category: "Research",
    date: "Apr 15, 2025",
    readTime: "9 min read",
  },
  {
    title: "5 Listing Changes That Improved Our AEO Score in 30 Days",
    category: "Case Study",
    date: "Apr 3, 2025",
    readTime: "6 min read",
  },
];

const footerLinks = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faqs" },
  { label: "Sign In", href: "/login" },
];

/* ─────────────────────────────────────────
   SHARED BUTTON COMPONENTS
───────────────────────────────────────── */
function PrimaryButton({
  children,
  href = "#",
  external = false,
}: {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="inline-flex items-center justify-center font-medium transition-all hover:opacity-90"
      style={{
        backgroundColor: "rgb(145, 75, 241)",
        color: "rgb(255,255,255)",
        width: "160px",
        height: "44px",
        borderRadius: "8px",
        fontFamily: "var(--font-outfit)",
        fontSize: "16px",
      }}
    >
      {children}
    </Link>
  );
}

function OutlineButton({
  children,
  href = "#",
  external = false,
}: {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="inline-flex items-center justify-center font-medium transition-all hover:opacity-90"
      style={{
        backgroundColor: "transparent",
        color: "rgb(255,255,255)",
        width: "100%",
        height: "44px",
        borderRadius: "8px",
        border: "1px solid rgb(145, 75, 241)",
        fontFamily: "var(--font-outfit)",
        fontSize: "16px",
      }}
    >
      {children}
    </Link>
  );
}

/* ─────────────────────────────────────────
   SECTION COMPONENTS
───────────────────────────────────────── */

/* ── NAV ── */
function NavBar() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
    });
  }, []);

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: "rgb(16, 17, 18)" }}>
      <div className="max-w-[1200px] mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <div
            className="flex items-center justify-center overflow-hidden shrink-0"
            style={{ width: "34px", height: "34px", borderRadius: "9px" }}
          >
            <Image
              src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
              alt="AEOlytics"
              width={34}
              height={34}
              style={{ objectFit: "contain", borderRadius: "9px" }}
              unoptimized
            />
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4 md:gap-8">
          {footerLinks.slice(0, -1).map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-base font-regular transition-all hover:opacity-70"
              style={{ color: "rgb(217,217,217)", fontFamily: "var(--font-outfit)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {/* Desktop CTA */}
          <Link
            href={authed ? "/dashboard" : "/login"}
            className="hidden md:inline-flex items-center justify-center font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: "rgb(145,75,241)",
              color: "rgb(255,255,255)",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          >
            {authed ? "Dashboard" : "Sign In"}
          </Link>

          {/* Mobile hamburger — accessible, working */}
          <button
            title="Toggle Menu"
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col items-center justify-center gap-[4px] w-[44px] h-[44px] md:hidden bg-[rgb(39,40,41)] rounded-[8px]"
          >
            {open ? (
              <CloseIcon />
            ) : (
              <>
                <span className="block w-6 h-[3px]" style={{ backgroundColor: "rgb(255,255,255)", borderRadius: "0.5px" }} />
                <span className="block w-6 h-[3px]" style={{ backgroundColor: "rgb(255,255,255)", borderRadius: "0.5px" }} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden flex flex-col px-5 pb-5 gap-1"
          style={{ backgroundColor: "rgb(16,17,18)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          {footerLinks.map((l) => {
            const isAuthLink = l.label === "Sign In";
            const label = isAuthLink && authed ? "Dashboard" : l.label;
            const href = isAuthLink && authed ? "/dashboard" : l.href;
            return (
              <Link
                key={l.label}
                href={href}
                onClick={() => setOpen(false)}
                className="text-base font-regular transition-all hover:opacity-70 py-3"
                style={{
                  color: "rgb(217,217,217)",
                  fontFamily: "var(--font-outfit)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

/* ── HERO ── */
function HeroSection() {
  return (
    <section className="px-4 md:mt-20  md:px-5 pt-[30px] pb-[60px] flex justify-center">
      <div
        className="relative md:h-[520px] w-full max-w-[1200px] overflow-hidden"
        style={{ backgroundColor: "rgb(39, 40, 41)", borderRadius: "24px", padding: "40px 24px", minHeight: "auto" }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center h-full gap-6 lg:gap-0">
          <div className="flex self-start flex-col gap-[24px] md:gap-[30px] z-10 w-full lg:w-auto" style={{ maxWidth: "620px" }}>
            <div className="flex flex-col gap-[10px]">
              <h1
                className="font-semibold"
                style={{ color: "rgb(255,255,255)", fontSize: "clamp(28px, 6vw, 68px)", lineHeight: "1.2em", letterSpacing: "0px" }}
              >
                See How Your Product Appears in AI Answers
              </h1>
              <p
                className="font-regular"
                style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em", maxWidth: "510px" }}
              >
                Run real queries across GPT, Claude, and Gemini to check visibility, compare competitors, and identify what to improve.

              </p>
            </div>
            <div className="flex flex-wrap items-center gap-[16px] md:gap-[20px]">
              <PrimaryButton href="/dashboard">Run Free Diagnostic</PrimaryButton>
              <Link
                href="/login"
                className="font-regular transition-all hover:opacity-70"
                style={{ color: "rgb(217,217,217)", fontSize: "16px", fontFamily: "var(--font-outfit)" }}
              >
                Sign in to save reports →
              </Link>
            </div>
          </div>
        </div>
        {/* Mobile hero image */}
        <img
          src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
          alt="AEOlytics diagnostic report preview"
          className="block lg:hidden w-full -mx-6 md:-mx-8 mt-8"
          style={{ maxHeight: "400px", objectFit: "cover" }}
        />
        {/* Desktop hero image */}
        <img
          src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
          alt="AEOlytics diagnostic report preview"
          className="hidden lg:block absolute"
          style={{ right: "-100px", bottom: "-250px", width: "640px", height: "723px", zIndex: 1, objectFit: "cover" }}
        />
      </div>
    </section>
  );
}

/* ── TRUSTED BY ── */
function TrustedBySection() {
  const brands = ["NutriPeak", "VitaCore", "PureBrand", "HealthFirst", "AlphaVit", "SupplyCo"];
  return (
    <section className="flex justify-center">
      <div className="w-full max-w-[1200px] overflow-hidden" style={{ height: "80px" }}>
        <Marquee>
          <div className="flex items-center gap-[80px] px-10">
            {brands.map((name, i) => (
              <span
                key={i}
                className="whitespace-nowrap font-semibold opacity-30"
                style={{ color: "rgb(217,217,217)", fontSize: "15px", letterSpacing: "0.05em" }}
              >
                {name}
              </span>
            ))}
          </div>
        </Marquee>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ── */
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="flex justify-center px-4 md:px-5" style={{ paddingTop: "100px" }}>
      <div className="w-full max-w-[1200px] flex flex-col gap-[40px]">
        <div className="flex flex-col gap-[10px]" style={{ maxWidth: "680px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            Query to Report in 3 Steps
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em" }}
          >
            Enter a query and we analyze how AI systems respond — showing mentions, rankings, and gaps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          {stepCards.map((card, i) => (
            <div
              key={i}
              className="flex flex-col gap-[24px] md:gap-[40px]"
              style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px", padding: "20px" }}
            >
              <div
                className="flex items-center justify-center w-[50px] h-[50px]"
                style={{ backgroundColor: "rgb(145,75,241)", borderRadius: "277px" }}
              >
                <span style={{ color: "rgb(255,255,255)" }}>{card.icon}</span>
              </div>
              <div className="flex flex-col gap-[8px] md:gap-[10px]">
                <h3 className="font-medium" style={{ color: "rgb(255,255,255)", fontSize: "clamp(22px, 5vw, 30px)", lineHeight: "1.2em" }}>
                  {card.title}
                </h3>
                <p className="font-regular" style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 3vw, 16px)", lineHeight: "1.5em" }}>
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FEATURES ── */
function FeaturesSection() {
  const features = [
    {
      title: "Visibility & Mention Detection",
      description:
        "Check whether AI systems mention your brand across GPT, Claude, and Gemini — and how consistently you appear.",
      image: "https://framerusercontent.com/images/uSPMcReDiSjV8jE4Zd41qQVs1k.png",
      imageAlt: "Visibility detection showing brand mention status across AI engines",
      reverse: false,
    },
    {
      title: "Competitor Intelligence Table",
      description:
        "See which products AI systems recommend in your category, along with relative positioning and frequency.",
      image: "https://framerusercontent.com/images/5eKLSZwh3WIo6tT8oUpgs5xQxrQ.png",
      imageAlt: "Competitor intelligence table showing brand rankings across AI engines",
      reverse: true,
    },
    {
      title: "Actionable Recommendations",
      description:
        "Get clear, actionable suggestions based on real responses so you know what to improve next.",
      image: "https://framerusercontent.com/images/IdvIsFJqzUFaka88cL0CCAXIHKY.png",
      imageAlt: "Actionable insights panel with specific AEO improvement steps",
      reverse: false,
    },
  ];

  return (
    <section id="features" className="flex justify-center" style={{ padding: "100px 0" }}>
      <div className="w-full max-w-[1200px] flex flex-col gap-[80px] md:gap-[120px] px-5">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex flex-col ${f.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center justify-between gap-10`}
          >
            <div className="flex flex-col gap-[20px] w-full lg:w-auto" style={{ maxWidth: "500px" }}>
              <div className="flex flex-col gap-[10px]">
                <h3
                  className="font-medium"
                  style={{ color: "rgb(255,255,255)", fontSize: "clamp(28px, 4vw, 46px)", lineHeight: "1.2em" }}
                >
                  {f.title}
                </h3>
                <p className="font-regular" style={{ color: "rgb(217,217,217)", fontSize: "16px", lineHeight: "1.6em" }}>
                  {f.description}
                </p>
              </div>
              <PrimaryButton href="/dashboard">Run a Diagnostic</PrimaryButton>
            </div>
            <div className="w-full max-w-[380px] lg:w-[380px]" style={{ height: "auto", aspectRatio: "0.806" }}>
              <img src={f.image} alt={f.imageAlt} className="w-full h-full object-cover" style={{ borderRadius: "20px" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── BENEFITS ── */
function BenefitsSection() {
  return (
    <section className="flex justify-center px-4 md:px-5">
      <div className="w-full max-w-[1200px] flex flex-col gap-[40px]">
        <div className="flex flex-col gap-[10px]" style={{ maxWidth: "680px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            What You Get from AEOlytics
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em" }}
          >
            A single report showing how your product appears in AI answers, who competes with you, and where you can improve.

          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-[20px]" >
          {benefitCards.map((card, i) => {
            let colSpan = "col-span-1";

            if (i === 1) colSpan = "lg:col-span-4 md:col-span-2"; // big
            else if (i === 0) colSpan = "lg:col-span-2 md:col-span-2"; // tall side
            else if (i === 2) colSpan = "lg:col-span-3 md:col-span-1";
            else colSpan = "lg:col-span-3 md:col-span-1";

            return (
              <div
                key={i}
                className={`flex flex-col justify-between p-5 relative ${colSpan}`}
                style={{
                  backgroundColor: i === 1 ? "rgb(145,75,241)" : "rgb(39,40,41)",
                  borderRadius: "20px",
                  minHeight: i === 0 || i === 1 ? "320px" : "240px",
                  padding: "20px",
                  gap: "40px",
                }}
              >
                <div className="flex items-start justify-between">
                  <p
                    className="font-regular"
                    style={{
                      color: i === 1 ? "rgb(255,255,255)" : "rgb(217,217,217)",
                      fontSize: "clamp(14px, 3vw, 16px)",
                      lineHeight: "1.5em",
                      maxWidth: "calc(100% - 60px)",
                      paddingRight: "20px",
                    }}
                  >
                    {card.text}
                  </p>
                  <div
                    className="flex-shrink-0 w-[50px] h-[50px] flex items-center justify-center"
                    style={{
                      backgroundColor: i === 1 ? "rgb(255,255,255)" : "rgb(145,75,241)",
                      borderRadius: "333px",
                      transform: "rotate(-45deg)",
                    }}
                  >
                    <span style={{ color: i === 1 ? "rgb(145,75,241)" : "rgb(255,255,255)", transform: "rotate(45deg)" }}>
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
                <h3
                  className="font-medium"
                  style={{ color: "rgb(255,255,255)", fontSize: "clamp(22px, 5vw, 32px)", lineHeight: "1.2em" }}
                >
                  {card.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── PRICING ── */
function PricingSection() {
  return (
    <section id="pricing" className="flex justify-center px-4 md:px-5" style={{ paddingTop: "100px" }}>
      <div className="w-full max-w-[1200px] flex flex-col gap-[40px]">
        <div className="flex flex-col gap-[10px]" style={{ maxWidth: "680px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em" }}
          >
            Start free. Upgrade when you need more scans, tracking, and deeper insights.
          </p>
        </div>
        <div className="flex flex-col gap-[30px] items-center">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] w-full">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className="flex flex-col p-4"
                style={{
                  backgroundColor: "rgb(39,40,41)",
                  borderRadius: "16px",
                  minHeight: "auto",
                  justifyContent: "space-between",
                  gap: "24px",
                  border: plan.highlight ? "2px solid rgb(145,75,241)" : "2px solid transparent",
                }}
              >
                <div className="flex flex-col gap-[18px]">
                  <div className="flex flex-col gap-[20px]">
                    <span className="font-regular" style={{ color: "rgb(217,217,217)", fontSize: "16px" }}>
                      {plan.name}
                    </span>
                    <div className="flex flex-col gap-[8px]">
                      <span className="font-semibold" style={{ color: "rgb(255,255,255)", fontSize: "clamp(24px, 5vw, 32px)" }}>
                        {plan.price}
                      </span>
                      <span className="font-light" style={{ color: "rgb(217,217,217)", fontSize: "14px" }}>
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <div className="w-full" style={{ height: "1px", backgroundColor: "rgb(217,217,217)", opacity: 0.3 }} />
                  <div className="flex flex-col gap-[14px]">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-[6px]">
                        <CheckIcon />
                        <span className="font-regular" style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 3vw, 16px)" }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {plan.btnVariant === "primary" ? (
                  <PrimaryButton href="/login">{plan.btnLabel}</PrimaryButton>
                ) : (
                  <OutlineButton href="/login">{plan.btnLabel}</OutlineButton>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── INTEGRATION ── */
function IntegrationSection() {
  return (
    <section className="flex justify-center px-4 md:px-5" style={{ paddingTop: "100px" }}>
      <div
        className="w-full max-h-[400px] max-w-[1200px] overflow-hidden flex flex-col lg:flex-row items-start lg:items-center gap-[40px] lg:gap-[110px] px-6 lg:px-10 py-10"
        style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px", minHeight: "460px" }}
      >
        <div className="flex flex-col gap-[10px] w-full lg:w-auto" style={{ maxWidth: "680px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            Covers Every Major AI Engine
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em" }}
          >
            AEOlytics runs queries across major AI models and expands coverage as new systems become relevant.
          </p>
        </div>
        <div
          className="flex-1 flex gap-[40px] lg:gap-[80px] justify-center items-center h-[300px] lg:h-full w-full lg:w-auto"
          aria-hidden="true"
        >
          {[aiEngines.slice(0, 4), aiEngines.slice(4, 8), aiEngines.slice(8, 12)].map((group, col) => (
            <div key={col} style={{ width: "80px", height: "100%" }}>
              <Marquee direction={col % 2 === 0 ? "down" : "up"} vertical>
                <div className="flex flex-col gap-[40px] items-center py-5">
                  {group.map((name, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-center font-medium text-center"
                      style={{
                        color: "rgb(217,217,217)",
                        fontSize: "11px",
                        backgroundColor: "rgb(16,17,18)",
                        borderRadius: "12px",
                        width: "80px",
                        height: "60px",
                        border: "1px solid rgba(145,75,241,0.2)",
                      }}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </Marquee>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ── */
function TestimonialsSection() {
  return (
    <section className="flex justify-center px-4 md:px-5" style={{ paddingTop: "100px" }}>
      <div className="w-full max-w-[1200px] flex flex-col gap-[40px] md:gap-[60px]">
        <div className="flex flex-col gap-[20px]" style={{ maxWidth: "720px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            What Users Are Seeing
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em" }}
          >
            Feedback from teams using AEOlytics to understand and improve their AI visibility.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col gap-[20px] md:gap-[30px]"
              style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "12px", padding: "20px" }}
            >
              <div className="flex items-center gap-[16px] md:gap-[20px]">
                <div
                  className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: "rgb(145,75,241)", borderRadius: "302px", color: "rgb(255,255,255)", fontSize: "20px" }}
                >
                  {t.name[0]}
                </div>
                <span className="font-medium" style={{ color: "rgb(255,255,255)", fontSize: "clamp(18px, 4vw, 22px)", lineHeight: "1.2em" }}>
                  {t.name}
                </span>
              </div>
              <p className="font-regular" style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 3vw, 18px)", lineHeight: "1.5em" }}>
                &quot;{t.text}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQS ── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faqs" className="flex justify-center px-4 md:px-5" style={{ paddingTop: "100px" }}>
      <div
        className="w-full max-w-[1200px] flex flex-col lg:flex-row items-start lg:items-center gap-[40px] lg:gap-[110px] px-6 lg:px-10 py-10"
        style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
      >
        <div className="flex flex-col gap-[10px] w-full lg:w-auto" style={{ maxWidth: "580px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em" }}
          >
            Common questions about how AEOlytics works and what the results mean.

          </p>
        </div>
        <div className="flex-1 flex flex-col w-full lg:w-auto">
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                className="flex items-center justify-between w-full cursor-pointer py-5 gap-4 text-left bg-transparent border-0"
                style={{ background: "none", border: "none", padding: "20px 0", width: "100%", cursor: "pointer" }}
              >
                <span className="font-semibold" style={{ color: "rgb(255,255,255)", fontSize: "16px" }}>{faq.q}</span>
                <ChevronDownIcon open={openIndex === i} />
              </button>
              {openIndex === i && (
                <p className="font-regular pb-5" style={{ color: "rgb(217,217,217)", fontSize: "16px", lineHeight: "1.6em" }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── BLOG ── */
function BlogSection() {
  return (
    <section className="flex justify-center px-4 md:px-5" style={{ paddingTop: "100px" }}>
      <div className="w-full max-w-[1200px] flex flex-col gap-[40px]">
        <div className="flex flex-col gap-[20px]" style={{ maxWidth: "720px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            AEO Strategy & Insights
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em" }}
          >
            Guides, research, and case studies on winning AI-driven product discovery. Learn how brands are improving their visibility inside AI answers — and how you can too.
          </p>
        </div>
        <div className="flex flex-col gap-[30px] items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] w-full">
            {articles.map((article, i) => (
              <Link
                key={i}
                href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
                className="flex flex-col overflow-hidden group"
                style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
              >
                <div className="w-full flex items-center justify-center" style={{ height: "200px", backgroundColor: "rgb(16,17,18)" }}>
                  <span className="text-5xl" style={{ opacity: 0.08 }}>📊</span>
                </div>
                <div className="flex flex-col gap-[20px] p-4" style={{ padding: "20px 16px 30px 16px" }}>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2 py-1"
                      style={{ backgroundColor: "rgba(145,75,241,0.15)", color: "rgb(145,75,241)", borderRadius: "4px" }}
                    >
                      {article.category}
                    </span>
                    <span style={{ color: "rgb(217,217,217)", fontSize: "13px" }}>{article.date}</span>
                  </div>
                  <h3
                    className="font-medium group-hover:opacity-80 transition-opacity"
                    style={{ color: "rgb(255,255,255)", fontSize: "22px", lineHeight: "1.3em" }}
                  >
                    {article.title}
                  </h3>
                  <span style={{ color: "rgb(217,217,217)", fontSize: "14px" }}>{article.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
          <PrimaryButton href="/blog">Read More</PrimaryButton>
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTASection() {
  return (
    <section className="flex justify-center px-4 md:px-5" style={{ padding: "100px 0" }}>
      <div
        className="relative w-full max-w-[1200px] overflow-hidden flex flex-col gap-[24px] md:gap-[30px] p-6 md:p-10"
        style={{ backgroundColor: "rgb(43, 44, 46)", borderRadius: "20px", padding: "40px 24px" }}
      >
        <div className="flex flex-col gap-[10px]" style={{ maxWidth: "660px" }}>
          <h2
            className="font-medium"
            style={{ color: "rgb(255,255,255)", fontSize: "clamp(32px, 5vw, 58px)", lineHeight: "1.1em" }}
          >
            Find Out If AI Recommends Your Brand — Free
          </h2>
          <p
            className="font-regular"
            style={{ color: "rgb(217,217,217)", fontSize: "clamp(14px, 2vw, 18px)", lineHeight: "1.5em", maxWidth: "460px" }}
          >
            Run your first diagnostic in under 60 seconds. No credit card required. No commitment.
          </p>
        </div>
        <PrimaryButton href="/dashboard">Run Free Diagnostic</PrimaryButton>
        <img
          src="https://framerusercontent.com/images/7v57BBeB1Jiv01VSQK14meVxao.png"
          alt="AEOlytics report illustration"
          className="hidden lg:block absolute"
          style={{ top: "-20px", right: "-107px", width: "552px", height: "628px", zIndex: 1, objectFit: "cover" }}
        />
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function FooterSection() {
  return (
    <footer className="flex justify-center px-4 md:px-5" style={{ backgroundColor: "rgb(39,40,41)" }}>
      <div
        className="w-full max-w-[1200px] flex flex-col gap-[40px] md:gap-[60px] py-10 md:py-20"
        style={{ padding: "60px 0" }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-[24px] md:gap-[40px] flex-wrap">
          <Link href="/" className="flex items-center gap-[6px]">
            <div
              className="flex items-center justify-center w-[36px] h-[36px]"
              style={{ backgroundColor: "rgb(145,75,241)", borderRadius: "8px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="font-semibold text-lg" style={{ color: "rgb(255,255,255)" }}>AEOlytics</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-[16px] md:gap-[24px]">
            {footerLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="font-regular transition-all hover:opacity-70"
                style={{ color: "rgb(255,255,255)", fontSize: "16px" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-[10px] pt-[24px] md:pt-[30px]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-[20px]">
            <Link
              href="/privacy-policy"
              className="font-medium transition-all hover:opacity-70"
              style={{ color: "rgb(255,255,255)", fontSize: "14px" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-conditions"
              className="font-medium transition-all hover:opacity-70"
              style={{ color: "rgb(255,255,255)", fontSize: "14px" }}
            >
              Terms & Conditions
            </Link>
          </div>
          <span className="font-medium" style={{ color: "rgb(255,255,255)", fontSize: "14px" }}>
            © {new Date().getFullYear()} AEOlytics. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────── */
export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(16, 17, 18)", fontFamily: "var(--font-outfit), Outfit, sans-serif" }}
    >
      <NavBar />
      <main className="space-y-40">
        <HeroSection />
        <TrustedBySection />
        <HowItWorksSection />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection />
        <IntegrationSection />
        <TestimonialsSection />
        <FAQSection />
        {/* <BlogSection /> */}
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}