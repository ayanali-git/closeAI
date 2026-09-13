"use client";

import Link from "next/link";
import { CloseAIIcon } from "@/components/brand/logo";
import { Globe, ArrowUpRight, Copy, Copyright } from "lucide-react";
import { AnimatedComingSoonText } from "@/components/ui/animated";

export function Footer() {
  return (
    <footer className="w-full bg-background text-foreground pt-10 pb-5 select-none">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10">
        {/* Multi-Tier 5-Column Links Grid matching */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 pb-16 border-b border-border/80">
          
          {/* Column 1: Research, Latest Advancements, Safety */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Research
              </h4>
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Research Index
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Research Overview
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Economic Research
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Latest Advancements
              </h4>
              <ul className="group/footer space-y-2.5 text-md">
              <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    GPT-6 Astra
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    GPT-5.6
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    GPT-5.5
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    GPT-5.3 Instant
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    GPT-5.3-Codex
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Safety
              </h4>
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/research/safety" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Safety Approach
                  </Link>
                </li>
                <li>
                  <Link href="/research/safety" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>Deployment Safety</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/research/safety" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Security & Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/research/safety" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
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
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/c" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>CloseAI Chat</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>CloseAI Business</span>
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>CloseAI Education</span>
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>CloseAI Enterprise</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/product/features" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Codex
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Release Notes
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                API Platform
              </h4>
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/product/api-docs" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
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
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/business/enterprise" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Customer Stories
                  </Link>
                </li>
                <li>
                  <Link href="/business/enterprise" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Partner Network
                  </Link>
                </li>
                <li>
                  <Link href="/company/contact" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
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
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>Apps SDK</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/research/overview" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Open Models
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>Docs</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>Resources</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/product/api-docs" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
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
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/company/about" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/foundation" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Our Charter
                  </Link>
                </li>
                <li>
                  <Link href="/company/careers" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    <span>Careers</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    News
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Support
              </h4>
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/support/help" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
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
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/company/blog" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Stories
                  </Link>
                </li>
                <li>
                  <Link href="/foundation" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Academy
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Livestreams
                  </Link>
                </li>
                <li>
                  <Link href="/company/blog" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Podcast
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-muted-foreground uppercase tracking-wider">
                Terms & Policies
              </h4>
              <ul className="group/footer space-y-2.5 text-md">
                <li>
                  <Link href="/support/terms" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/support/privacy" className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/footer:text-muted-foreground hover:!text-foreground">
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

          {/* Center: Language Switcher (disabled — Coming soon on hover/tap) */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              aria-disabled="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex items-center text-base gap-1.5 px-4 py-2 rounded-full bg-white/50 dark:bg-[#212121]/50 hover:bg-secondary dark:hover:bg-[#2f2f2f] text-muted-foreground transition-colors cursor-not-allowed select-none whitespace-nowrap"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <AnimatedComingSoonText
                label="English (United States)"
                comingSoonText="Coming soon"
                align="start"
              />
            </button>
          </div>

          {/* Right / Middle: Social Links with ArrowUpRight Icons */}
          <div className="group/social flex flex-wrap text-base items-center justify-center md:justify-end gap-x-5 gap-y-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/social:text-muted-foreground hover:!text-foreground whitespace-nowrap"
            >
              <span>X</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/social:text-muted-foreground hover:!text-foreground whitespace-nowrap"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/social:text-muted-foreground hover:!text-foreground whitespace-nowrap"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground transition-colors group-hover/social:text-muted-foreground hover:!text-foreground whitespace-nowrap"
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