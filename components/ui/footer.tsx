"use client";

import Link from "next/link";
import { CloseAIIcon } from "@/components/brand/logo";
import { Globe, ArrowUpRight, Copy, Copyright } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-background text-foreground pt-10 pb-5 select-none">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        {/* Multi-Tier 5-Column Links Grid matching */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 pb-16 border-b border-border/80">
          
          {/* Column 1: Research, Latest Advancements, Safety */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Research
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/research/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    Research Index
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    Research Overview
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    Economic Research
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Latest Advancements
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/research/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    GPT-5.6
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    GPT-5.5
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    GPT-5.4
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Safety
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/research/safety" className="text-muted-foreground hover:text-foreground transition-colors">
                    Safety Approach
                  </Link>
                </li>
                <li>
                  <Link href="/research/safety" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Deployment Safety</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/research/safety" className="text-muted-foreground hover:text-foreground transition-colors">
                    Security & Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/research/safety" className="text-muted-foreground hover:text-foreground transition-colors">
                    Trust & Transparency
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: Products, API Platform */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Products
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/c" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>CloseAI Chat</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>CloseAI Business</span>
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>CloseAI Education</span>
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>CloseAI Enterprise</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/product/features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Codex
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Release Notes
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                API Platform
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/product/api-docs" className="text-muted-foreground hover:text-foreground transition-colors">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Docs</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Business, Developers */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Business
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/business/enterprise" className="text-muted-foreground hover:text-foreground transition-colors">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="text-muted-foreground hover:text-foreground transition-colors">
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="text-muted-foreground hover:text-foreground transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="text-muted-foreground hover:text-foreground transition-colors">
                    Customer Stories
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="text-muted-foreground hover:text-foreground transition-colors">
                    Partner Network
                  </Link>
                </li>
                <li>
                  <Link href="/company/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Contact Sales</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Developers
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Apps SDK</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="text-muted-foreground hover:text-foreground transition-colors">
                    Open Models
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Docs</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Resources</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Developer Forum</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Company, Support */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/company/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/foundation" className="text-muted-foreground hover:text-foreground transition-colors">
                    Our Charter
                  </Link>
                </li>
                <li>
                  <Link href="/company/careers" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Careers</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    News
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Support
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/support/help" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <span>Help Center</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 5: More, Terms & Policies */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                More
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/company/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Stories
                  </Link>
                </li>
                <li>
                  <Link href="/foundation" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    Academy
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Livestreams
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Podcast
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Terms & Policies
              </h4>
              <ul className="space-y-2.5 text-md">
                <li>
                  <Link href="/support/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/support/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Center Language, & Social Links (Single divider above) */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[15px] text-muted-foreground">
          {/* Left: Brand & Copyright */}
          <div className="flex flex-wrap items-center justify-center text-base md:justify-start gap-x-1 text-center md:text-left">
            <Copyright className="w-4 h-4" />
            <span className="text-muted-foreground/80">2026 CloseAI. All rights reserved.</span>
          </div>

          {/* Center: Language Switcher */}
          <div className="flex items-center justify-center">
            <button className="flex items-center text-base gap-1.5 px-4 py-2 rounded-full bg-white/50 dark:bg-[#212121]/50 hover:bg-secondary dark:hover:bg-[#2f2f2f] text-muted-foreground hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">
              <Globe className="w-4 h-4" />
              <span>English (United States)</span>
            </button>
          </div>

          {/* Right / Middle: Social Links with ArrowUpRight Icons */}
          <div className="flex flex-wrap text-base items-center justify-center md:justify-end gap-x-5 gap-y-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap"
            >
              <span>X</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap"
            >
              <span>Discord</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
