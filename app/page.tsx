"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/header";
import { Footer } from "@/components/ui/footer";
import { AnimatedArrow, AnimatedComingSoonText } from "@/components/ui/animated";
import { ArrowUpRight, ArrowRight, Sparkles, ArrowUp, Search, Loader } from "lucide-react";
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
    { label: "Research", prompt: "Summarize recent breakthrough papers in AI alignment and safety" },
    { label: "Talk with CloseAI", prompt: "Explain the latest frontier AI models and reasoning capabilities" },
    { label: "Stories", prompt: "Showcase customer success stories and real-world applications" },
    { label: "API Platform", prompt: "How do I get started with the API and developer platform?", disabled: true, hoverText: "Coming soon" },
    { label: "More", prompt: "Explore all closeAI features, enterprise solutions, and tools" },
  ];

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
          <form onSubmit={handleHeroSubmit} className="relative w-full max-w-3xl mx-auto mb-6">
            <div 
              onClick={() => textareaRef.current?.focus({ preventScroll: true })}
              className="relative w-full rounded-3xl bg-white/50 dark:bg-[#212121]/50 border border-border/80 dark:border-none backdrop-blur-sm p-4 min-h-[100px] flex flex-col justify-between transition-all cursor-text"
            >
              <textarea
                ref={textareaRef}
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleHeroSubmit(e);
                  }
                }}
                placeholder="Ask about anything"
                rows={3}
                disabled={isSubmitting}
                className="w-full bg-transparent resize-none text-[17px] font-normal text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors outline-none border-none ring-0 leading-relaxed"
              />
              <div className="flex items-center justify-end pt-3" onClick={(e) => e.stopPropagation()}>
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
              const isSelected = !pill.disabled && heroPrompt.trim() === pill.prompt;
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
                      : !pill.disabled && "bg-white/50 dark:bg-[#212121]/50 border border-border/80 dark:border-none backdrop-blur-sm hover:bg-secondary text-muted-foreground hover:text-foreground"
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
          <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-14">
            
            {/* STICKY LEFT COLUMN TRACK: Astra GPT-6 Spotlight */}
            <div className="w-full lg:w-[62%] relative">
              <div className="lg:sticky lg:top-24">
                <Link href="/research/overview" className="group block">
                {/* Big Cosmic Image Card with Astra GPT-6 */}
                <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-black transition-all duration-300">
                  {/* Space Planet, Earth Crescent & Cosmic Sun Flare Background */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop')`,
                    }}
                  />
                  {/* Planet Crescent Graphic Layer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-amber-500/20" />
                  <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-slate-900/90 border border-slate-700/50 blur-sm pointer-events-none" />
                  <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

                  {/* Top-Left: Bold Giant "Astra" */}
                  <div className="absolute top-6 sm:top-10 left-6 sm:left-10 z-10">
                    <span className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-muted-foreground group-hover:text-foreground select-none leading-none drop-shadow-2xl">
                      Astra
                    </span>
                  </div>

                  {/* Bottom-Right: Bold Giant "GPT-6" */}
                  <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 z-10">
                    <span className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-muted-foreground group-hover:text-foreground select-none leading-none drop-shadow-2xl">
                      GPT-6
                    </span>
                  </div>
                </div>

                {/* Left Title & Tag Below Card */}
                <div className="mt-4 flex flex-col justify-between h-[92px] max-w-2xl">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-muted-foreground group-hover:text-foreground leading-snug">
                    Astra GPT-6: Frontier intelligence that scales with your ambition
                  </h2>
                  <div className="flex items-center gap-2 text-md text-muted-foreground">
                    <span className="font-semibold text-foreground">Product</span>
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
              {/* Item 1: Expanding Daybreak Horizon */}
              <Link href="/company/blog" className="group block">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop')`,
                    }}
                  />
                  {/* Glowing Solar Arc Horizon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-amber-600/30 via-orange-500/10 to-transparent" />
                </div>
                <div className="mt-4 flex flex-col justify-between h-[92px]">
                  <h3 className="text-base sm:text-lg font-semibold text-muted-foreground group-hover:text-foreground leading-snug">
                    Expanding Daybreak as the Cyber Defense Window Narrows
                  </h3>
                  <div className="flex items-center gap-2 text-md text-muted-foreground">
                    <span className="font-semibold text-foreground">Security</span>
                    <span>·</span>
                    <span>Feb 10, 2026</span>
                    <span>·</span>
                    <span>8 min read</span>
                  </div>
                </div>
              </Link>

              {/* Item 2: Mobile Interface Sol */}
              <Link href="/product/features" className="group block">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0a0f] flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop')`,
                    }}
                  />
                  {/* Floating App Mockup Card with Phone Look */}
                  <div className="relative z-10 w-[74%] bg-white/95 dark:bg-[#1f1f22] backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-neutral-700/50">
                    <div className="text-md font-semibold text-center text-muted-foreground mb-2.5">
                      5.6 Medium
                    </div>
                    <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 rounded-full px-3 py-1.5 text-md mb-2">
                      <span className="font-medium text-foreground">5.6 Sol</span>
                      <div className="w-7 h-4 bg-blue-600 rounded-full relative">
                        <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
                      </div>
                    </div>
                    {/* Fake typing row */}
                    <div className="flex gap-1 justify-center py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-100" />
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col justify-between h-[92px]">
                  <h3 className="text-base sm:text-lg font-semibold text-muted-foreground group-hover:text-foreground leading-snug">
                    Improving GPT-5.6 Sol in CloseAI — and expanding access to GPT-5.6 Luna for free users
                  </h3>
                  <div className="flex items-center gap-2 text-md text-muted-foreground">
                    <span className="font-semibold text-foreground">Product</span>
                    <span>·</span>
                    <span>Mar 15, 2026</span>
                    <span>·</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </Link>

              {/* Item 3: Health in CloseAI (White Squircle + Red Flower Heart Badge matching Image 3) */}
              <Link href="/product/features" className="group block">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#fed1d8] via-[#fee5d4] to-[#fbcfe0] dark:from-[#32161d] dark:via-[#261612] dark:to-[#221019] flex items-center justify-center p-6">
                  {/* Soft Warm Blurred Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-300/30 via-amber-200/20 to-rose-300/30 blur-xl pointer-events-none" />

                  {/* Center Crisp White Squircle Card */}
                  <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-white flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18" xmlns="http://www.w3.org/2000/svg">
                      {/* Red Scalloped Flower / Petals */}
                      <g fill="#e50914">
                        <circle cx="50" cy="50" r="24" />
                        <circle cx="50" cy="27" r="14" />
                        <circle cx="69.9" cy="38.5" r="14" />
                        <circle cx="69.9" cy="61.5" r="14" />
                        <circle cx="50" cy="73" r="14" />
                        <circle cx="30.1" cy="61.5" r="14" />
                        <circle cx="30.1" cy="38.5" r="14" />
                      </g>
                      {/* Crisp White Heart in Center */}
                      <path
                        d="M50 63.5 C50 63.5 35 52 35 41 C35 34.5 40 30.5 45.5 30.5 C48.5 30.5 50 32.5 50 32.5 C50 32.5 51.5 30.5 54.5 30.5 C60 30.5 65 34.5 65 41 C65 52 50 63.5 50 63.5 Z"
                        fill="#ffffff"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex flex-col justify-between h-[92px]">
                  <h3 className="text-base sm:text-lg font-semibold text-muted-foreground group-hover:text-foreground leading-snug">
                    Launching Health in CloseAI
                  </h3>
                  <div className="flex items-center gap-2 text-md text-muted-foreground">
                    <span className="font-semibold text-foreground">Product</span>
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
              Latest News
            </h2>
            <Link
              href="/company/blog"
              className="group inline-flex items-center text-md font-semibold text-foreground uppercase tracking-wider"
            >
              <span>View news</span>
              <AnimatedArrow size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Global partnership for frontier AI research infrastructure",
                category: "Company",
                date: "May 05, 2026",
                color: "from-blue-600 via-indigo-600 to-purple-800",
              },
              {
                title: "Frontier safety commitments and verifiable alignment benchmarks",
                category: "Research",
                date: "Jun 10, 2026",
                color: "from-amber-500 via-orange-600 to-red-700",
              },
              {
                title: "New benchmark records on SWE-bench and Olympiad mathematics",
                category: "Research",
                date: "Jul 15, 2026",
                color: "from-emerald-500 via-teal-600 to-cyan-800",
              },
              {
                title: "Advancements in live audio synthesis and spatial perception",
                category: "Product",
                date: "Aug 20, 2026",
                color: "from-cyan-500 via-sky-600 to-blue-800",
              },
              {
                title: "Enterprise privacy safeguards with zero unauthorized retention",
                category: "Company",
                date: "Sep 25, 2026",
                color: "from-fuchsia-500 via-pink-600 to-rose-800",
              },
              {
                title: "Expanding developer grants for open frontier research",
                category: "Foundation",
                date: "Nov 30, 2026",
                color: "from-violet-500 via-purple-600 to-indigo-900",
              },
            ].map((news, i) => (
              <Link
                key={i}
                href="/company/blog"
                className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border/80 dark:border-none hover:border-border transition-all"
              >
                {/* Visual Thumbnail */}
                <div className={`h-40 w-full bg-gradient-to-br ${news.color} opacity-85 group-hover:opacity-100 transition-opacity flex items-end p-4`}>
                  <span className="text-[15px] font-semibold text-white/90 uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                    {news.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-medium text-muted-foreground group-hover:text-foreground leading-snug mb-3">
                    {news.title}
                  </h3>
                  <p className="text-md text-muted-foreground">{news.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* STORIES & REAL-WORLD IMPACT */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 sm:px-8 max-w-[1400px] mx-auto py-12 border-t border-border/80">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Stories
            </h2>
            <Link
              href="/company/blog"
              className="group inline-flex items-center text-md font-semibold text-foreground uppercase tracking-wider"
            >
              <span>View all</span>
              <AnimatedArrow size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Scaling exploration across polar science & climate dynamics",
                category: "Science",
                gradient: "from-sky-900 via-indigo-950 to-black",
              },
              {
                title: "Coding intelligence accelerated in high-velocity teams",
                category: "Engineering",
                gradient: "from-stone-900 via-neutral-900 to-black",
              },
              {
                title: "Next-generation motorsport aerodynamic engineering with closeAI",
                category: "Industry",
                gradient: "from-red-950 via-neutral-950 to-black",
              },
            ].map((story, i) => (
              <Link
                key={i}
                href="/company/blog"
                className="group rounded-3xl overflow-hidden bg-[#0f0f11] text-white border border-border/80 dark:border-none flex flex-col justify-between min-h-[360px] p-7 relative transition-all hover:border-border"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${story.gradient} opacity-90 z-0`} />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-md font-semibold text-neutral-300 uppercase tracking-wider">
                    {story.category}
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-muted-foreground group-hover:text-foreground leading-snug mb-2">
                    {story.title}
                  </h3>
                  <p className="text-md text-neutral-400">Individual Articles</p>
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
              Frontier Research
            </h2>
            <Link
              href="/research/overview"
              className="group inline-flex items-center text-md font-semibold text-foreground uppercase tracking-wider"
            >
              <span>View research</span>
              <AnimatedArrow size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/research/overview"
              className="group rounded-3xl p-7 bg-[#0e1118] text-white border border-border/80 dark:border-none flex flex-col justify-end min-h-[300px] hover:border-border transition-all"
            >
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-foreground leading-snug mb-2">
                  The next generation model architecture and self-verifying chains
                </h3>
                <p className="text-md text-neutral-400">Research Paper</p>
              </div>
            </Link>

            <Link
              href="/research/overview"
              className="group rounded-3xl p-7 bg-[#16140e] text-white border border-border/80 dark:border-none flex flex-col justify-end min-h-[300px] hover:border-border transition-all"
            >
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-foreground leading-snug mb-2">
                  Unit Distance Problem & Discrete Mathematics Optimization
                </h3>
                <p className="text-md text-neutral-400">Research Paper</p>
              </div>
            </Link>

            <Link
              href="/research/overview"
              className="group rounded-3xl p-7 bg-[#0e1713] text-white border border-border/80 dark:border-none flex flex-col justify-end min-h-[300px] hover:border-border transition-all"
            >
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-foreground leading-snug mb-2">
                  Introducing closeAI-Rosalind for Molecular Biology & Therapeutics
                </h3>
                <p className="text-md text-neutral-400">Research Paper</p>
              </div>
            </Link>
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
              className="group inline-flex items-center text-md font-semibold text-foreground uppercase tracking-wider"
            >
              <span>Explore enterprise</span>
              <AnimatedArrow size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/business/enterprise"
              className="group rounded-3xl p-8 bg-gradient-to-br from-[#7a6438] via-[#4d3d1f] to-[#1e1709] text-white border border-border/80 dark:border-none flex flex-col justify-end min-h-[280px] transition-all"
            >
              <div>
                <p className="text-md font-medium text-muted-foreground group-hover:text-foreground mb-1">
                  Accelerating deep learning experimentation with closeAI infrastructure
                </p>
                <p className="text-md text-neutral-300">Case study</p>
              </div>
            </Link>

            <Link
              href="/business/enterprise"
              className="group rounded-3xl p-8 bg-gradient-to-br from-[#2e333d] via-[#1a1d24] to-[#0c0e12] text-white border border-border/80 dark:border-none flex flex-col justify-end min-h-[280px] transition-all"
            >
              <div>
                <p className="text-md font-medium text-muted-foreground group-hover:text-foreground mb-1">
                  Scaling private institutional financial analysis with frontier security
                </p>
                <p className="text-md text-neutral-300">Case study</p>
              </div>
            </Link>

            <Link
              href="/business/enterprise"
              className="group rounded-3xl p-8 bg-gradient-to-br from-[#d95d1e] via-[#8c350a] to-[#2b0f02] text-white border border-border/80 dark:border-none flex flex-col justify-end min-h-[280px] transition-all"
            >
              <div>
                <p className="text-md font-medium text-muted-foreground group-hover:text-foreground mb-1">
                  Empowering millions with autonomous multi-agent task execution
                </p>
                <p className="text-md text-neutral-300">Case study</p>
              </div>
            </Link>
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
            <p className="text-muted-foreground text-md sm:text-base max-w-md">
              Experience the frontier intelligence designed to think, create, and build alongside you.
            </p>
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="group rounded-full px-8 h-12 text-md font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Link href="/c" className="flex items-center">
                  <span>Explore Now</span>
                  <AnimatedArrow size={15} />
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
