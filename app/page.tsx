"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MarketingHeader } from "@/components/marketing/header";
import { Footer } from "@/components/ui/footer";
import {
  AnimatedArrow,
  AnimatedComingSoonText,
} from "@/components/ui/animated";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  ArrowUp,
  Search,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [heroPrompt, setHeroPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = heroPrompt.trim();
    if (!prompt || isSubmitting) return;

    setIsSubmitting(true);
    router.push(`/c?q=${encodeURIComponent(prompt)}`);
  };

  const handlePillClick = (prompt: string) => {
    setHeroPrompt(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  };

  const quickPills = [
    {
      label: "Research",
      prompt: "Summarize recent breakthrough papers in AI alignment and safety",
    },
    {
      label: "Talk with CloseAI",
      prompt:
        "Explain the latest frontier AI models and reasoning capabilities",
    },
    {
      label: "Business",
      prompt: "How does closeAI help enterprises with secure AI solutions?",
    },
    {
      label: "API Platform",
      prompt: "How do I get started with the API and developer platform?",
      disabled: true,
      hoverText: "Coming soon",
    },
    {
      label: "More",
      prompt: "Explore all closeAI features, enterprise solutions, and tools",
    },
  ];

  // Recent News: glass avatars (seeded per-article so each card gets a distinct pattern)
  const newsAvatar = (seed: string) =>
    `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(seed)}`;

  // Latest Research: constellation avatars, light/dark variants
  const researchAvatarDark = (seed: string) =>
    `https://api.dicebear.com/10.x/constellation/svg?backgroundColor=07080d,0a0b12&constellationColor=eaf2ff,d8e6f5&seed=${encodeURIComponent(
      seed
    )}`;
  const researchAvatarLight = (seed: string) =>
    `https://api.dicebear.com/10.x/constellation/svg?backgroundColor=eef2f7,e8eef5&constellationColor=2a3550&seed=${encodeURIComponent(
      seed
    )}`;

  // closeAI for Business: planets avatars, light/dark variants
  const businessAvatarDark = (seed: string) =>
    `https://api.dicebear.com/10.x/planets/svg?backgroundColor=0a0b0f&planetColor=ff2e88,00e5ff,ffe600,7cff00,b400ff&seed=${encodeURIComponent(
      seed
    )}`;
  const businessAvatarLight = (seed: string) =>
    `https://api.dicebear.com/10.x/planets/svg?backgroundColor=e6ecf5,eef1f7&moonColor=8c93a3&seed=${encodeURIComponent(
      seed
    )}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none antialiased">
      <MarketingHeader />

      <main className="flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* HERO PROMPT DOCK */}
        {/* ---------------------------------------------------------------- */}
        <section className="min-h-[calc(100svh-180px)] sm:min-h-[calc(100svh-300px)] lg:min-h-[calc(100vh-350px)] flex flex-col items-center justify-center pt-8 pb-4 px-6 sm:px-8 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-8">
            What can I help with?
          </h1>

          {/* Hero Input Card */}
          <form
            onSubmit={handleHeroSubmit}
            className="relative w-full max-w-3xl mx-auto mb-6"
          >
            <div
              onClick={() =>
                textareaRef.current?.focus({ preventScroll: true })
              }
              className="relative w-full rounded-3xl bg-white/50 dark:bg-[#212121]/50 border border-border/80 dark:border-none backdrop-blur-sm p-4 min-h-[100px] flex flex-col justify-between transition-all cursor-text"
            >
              <textarea
                ref={textareaRef}
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleHeroSubmit(e);
                  }
                }}
                placeholder="Ask about anything"
                rows={3}
                disabled={isSubmitting}
                className="w-full bg-transparent resize-none text-[17px] font-normal text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors outline-none border-none ring-0 leading-relaxed"
              />
              <div
                className="flex items-center justify-end pt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="submit"
                  disabled={!heroPrompt.trim() || isSubmitting}
                  className={cn(
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                    heroPrompt.trim().length > 0 && !isSubmitting
                      ? "bg-foreground text-background cursor-pointer hover:opacity-90 active:scale-95"
                      : "bg-white/50 dark:bg-[#212121]/50 text-foreground border border-border/80 dark:border-none cursor-not-allowed opacity-60"
                  )}
                  aria-label="Send prompt"
                >
                  {isSubmitting ? (
                    <Loader className="w-5 h-5 animate-spin text-foreground" />
                  ) : (
                    <ArrowUp className="w-5 h-5 stroke-[3]" />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Suggestion Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {quickPills.map((pill, i) => {
              const isSelected =
                !pill.disabled && heroPrompt.trim() === pill.prompt;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (pill.disabled) return;
                    handlePillClick(pill.prompt);
                  }}
                  className={cn(
                    "px-4 py-3 rounded-full text-md sm:text-[15px] transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0",
                    pill.disabled
                      ? "cursor-not-allowed select-none bg-white/50 dark:bg-[#212121]/50 hover:bg-secondary dark:hover:bg-[#2f2f2f] border border-border/80 dark:border-none backdrop-blur-sm text-muted-foreground hover:text-foreground group/pill"
                      : "cursor-pointer bg-white/50 dark:bg-[#212121]/50 hover:bg-secondary dark:hover:bg-[#2f2f2f]",
                    isSelected
                      ? "bg-secondary text-foreground border border-border/80 dark:border-none"
                      : !pill.disabled &&
                          "bg-white/50 dark:bg-[#212121]/50 border border-border/80 dark:border-none backdrop-blur-sm hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {pill.disabled ? (
                    <AnimatedComingSoonText
                      label={pill.label}
                      comingSoonText={pill.hoverText || "Coming soon"}
                      align="center"
                    />
                  ) : (
                    pill.label
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FEATURED SPOTLIGHT (Sticky Left + Scrolling Right) */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 sm:px-8 max-w-[1400px] mx-auto pt-6 pb-28">
          <div className="group/spotlight relative flex flex-col lg:flex-row gap-8 lg:gap-14">
            {/* STICKY LEFT COLUMN TRACK: Astra GPT-6 Spotlight */}
            <div className="w-full lg:w-[62%] relative">
              <div className="lg:sticky lg:top-24">
                <Link
                  href="/research/overview"
                  className="group/card block transition-opacity duration-200 group-hover/spotlight:opacity-50 hover:!opacity-100"
                >
                  {/* Big Card */}
                  <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-black transition-all duration-300">
                    <Image
                      src="/assets/images/gpt-6.png"
                      alt="GPT-6 Astra"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Left Title & Tag Below Card */}
                  <div className="mt-4 flex flex-col justify-between h-[92px] max-w-2xl">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-muted-foreground group-hover/card:text-foreground leading-snug">
                      GPT-6 Astra: A new generation of intelligence
                    </h2>
                    <div className="flex items-center gap-2 mb-5 text-md text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Product
                      </span>
                      <span>·</span>
                      <span>Jan 05, 2026</span>
                      <span>·</span>
                      <span>18 min read</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* SCROLLING RIGHT COLUMN: 3 Items Stream (one by one) */}
            <div className="w-full lg:w-[38%] flex flex-col gap-8 lg:gap-10">
              {/* Item 1 */}
              <Link
                href="/company/blog"
                className="group/card block transition-opacity duration-200 group-hover/spotlight:opacity-50 hover:!opacity-100"
              >
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black">
                  <Image
                    src="/assets/images/images-2.5.png"
                    alt="Introducing CloseAI images 2.5"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex flex-col justify-between h-[92px]">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground group-hover/card:text-foreground leading-snug">
                    Introducing CloseAI images 2.5
                  </h3>
                  <div className="flex items-center gap-2 mb-5 text-md text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Security
                    </span>
                    <span>·</span>
                    <span>Feb 10, 2026</span>
                    <span>·</span>
                    <span>8 min read</span>
                  </div>
                </div>
              </Link>

              {/* Item 2 */}
              <Link
                href="/product/features"
                className="group/card block transition-opacity duration-200 group-hover/spotlight:opacity-50 hover:!opacity-100"
              >
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black">
                  <Image
                    src="/assets/images/system-card.png"
                    alt="GPT-6 Astra System Cards"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex flex-col justify-between h-[92px]">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground group-hover/card:text-foreground leading-snug">
                    GPT-6 Astra System Cards
                  </h3>
                  <div className="flex items-center gap-2 mb-5 text-md text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Product
                    </span>
                    <span>·</span>
                    <span>Mar 15, 2026</span>
                    <span>·</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </Link>

              {/* Item 3 */}
              <Link
                href="/product/features"
                className="group/card block transition-opacity duration-200 group-hover/spotlight:opacity-50 hover:!opacity-100"
              >
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black">
                  <Image
                    src="/assets/images/hugging-face.png"
                    alt="Improving GPT-5.6 Sol in CloseAI"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex flex-col justify-between h-[92px]">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground group-hover/card:text-foreground leading-snug">
                    Launching Health in CloseAI
                  </h3>
                  <div className="flex items-center gap-2 mb-5 text-md text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Product
                    </span>
                    <span>·</span>
                    <span>Apr 20, 2026</span>
                    <span>·</span>
                    <span>7 min read</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* LATEST NEWS & UPDATES */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 sm:px-8 max-w-[1400px] mx-auto py-12 border-t border-border/80">
          <div className="flex items-center justify-between mb-8 ">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Recent News
            </h2>
            <Link
              href="/company/blog"
              className="group inline-flex items-center text-md font-semibold text-foreground tracking-tight"
            >
              <span>View more</span>
              <AnimatedArrow size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title:
                  "Global partnership for frontier AI research infrastructure",
                category: "Company",
                date: "May 05, 2026",
              },
              {
                title:
                  "Frontier safety commitments and verifiable alignment benchmarks",
                category: "Research",
                date: "Jun 10, 2026",
              },
              {
                title:
                  "New benchmark records on SWE-bench and Olympiad mathematics",
                category: "Research",
                date: "Jul 15, 2026",
              },
              {
                title:
                  "Advancements in live audio synthesis and spatial perception",
                category: "Product",
                date: "Aug 20, 2026",
              },
              {
                title:
                  "Enterprise privacy safeguards with zero unauthorized retention",
                category: "Company",
                date: "Sep 25, 2026",
              },
              {
                title: "Expanding developer grants for open frontier research",
                category: "Foundation",
                date: "Nov 30, 2026",
              },
            ].map((news, i) => (
              <Link
                key={i}
                href="/company/blog"
                className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border/80 dark:border-none transition-all"
              >
                {/* Visual Thumbnail: DiceBear glass avatar */}
                <div className="relative h-40 w-full bg-secondary overflow-hidden flex items-end p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={newsAvatar(news.title)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="relative text-[15px] font-semibold text-white/90 uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                    {news.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground group-hover:text-foreground leading-snug mb-3">
                    {news.title}
                  </h3>
                  <p className="text-md text-muted-foreground">{news.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FRONTIER RESEARCH SHOWCASE                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 sm:px-8 max-w-[1400px] mx-auto py-12 border-t border-border/80">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Latest Research
            </h2>
            <Link
              href="/research/overview"
              className="group inline-flex items-center text-md font-semibold text-foreground tracking-tight"
            >
              <span>View all</span>
              <AnimatedArrow size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title:
                  "The next generation model architecture and self-verifying chains",
                seed: "The",
              },
              {
                title:
                  "Unit Distance Problem & Discrete Mathematics Optimization",
                seed: "Unit",
              },
              {
                title:
                  "Introducing closeAI-Rosalind for Molecular Biology & Therapeutics",
                seed: "Introducing",
              },
            ].map((paper, i) => (
              <Link
                key={i}
                href="/research/overview"
                className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border/80 dark:border-none transition-all"
              >
                {/* Visual Thumbnail: DiceBear constellation avatar (theme-aware) */}
                <div className="relative h-44 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={researchAvatarLight(paper.seed)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover block dark:hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={researchAvatarDark(paper.seed)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover hidden dark:block"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-muted-foreground group-hover:text-foreground leading-snug mb-3">
                    {paper.title}
                  </h3>
                  <p className="text-md text-muted-foreground">
                    Research Paper
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* BUSINESS & ENTERPRISE PARTNERS */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 sm:px-8 max-w-[1400px] mx-auto py-12 border-t border-border/80">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              closeAI for Business
            </h2>
            <Link
              href="/business/enterprise"
              className="group inline-flex items-center text-md font-semibold text-foreground tracking-tight"
            >
              <span>View all</span>
              <AnimatedArrow size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title:
                  "Accelerating deep learning experimentation with closeAI infrastructure",
                seed: "Accelerating",
              },
              {
                title:
                  "Scaling private institutional financial analysis with frontier security",
                seed: "Scaling",
              },
              {
                title:
                  "Empowering millions with autonomous multi-agent task execution",
                seed: "Empowering",
              },
            ].map((study, i) => (
              <Link
                key={i}
                href="/business/enterprise"
                className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border/80 dark:border-none transition-all"
              >
                {/* Visual Thumbnail: DiceBear planets avatar (theme-aware) */}
                <div className="relative h-40 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={businessAvatarLight(study.seed)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover block dark:hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={businessAvatarDark(study.seed)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover hidden dark:block"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground group-hover:text-foreground mb-1">
                    {study.title}
                  </p>
                  <p className="text-md text-muted-foreground">Case study</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* BOTTOM CALL TO ACTION BANNER */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 sm:px-8 max-w-[1400px] mx-auto py-16">
          <div className="rounded-3xl bg-card border border-border/80 dark:border-none p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
              Get started with closeAI
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-md">
              Experience the frontier intelligence designed to think, create,
              and build alongside you.
            </p>
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="group rounded-full px-8 h-12 text-md font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Link href="/c" className="flex items-center">
                  <span>Explore Now</span>
                  <AnimatedArrow size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
