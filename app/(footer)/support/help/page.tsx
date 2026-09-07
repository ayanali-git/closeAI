'use client';

import { Search, HelpCircle, FileText, Settings } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="py-12 sm:py-16 w-full max-w-4xl mx-auto min-w-0">
      <header className="mb-10 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground mb-4 sm:mb-6">How can we help?</h1>
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search for articles, guides, and FAQs..." 
            className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-card border border-border/80 dark:border-none rounded-full text-base sm:text-lg focus:outline-none text-foreground placeholder:text-muted-foreground focus:placeholder:text-foreground transition-colors"
          />
        </div>
      </header>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 mb-12 sm:mb-16">
        <div className="p-5 sm:p-6 bg-card border border-border/80 dark:border-none rounded-2xl cursor-pointer hover:bg-secondary/50 transition-colors">
          <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4 text-foreground" />
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Getting Started</h3>
          <p className="text-base sm:text-base text-muted-foreground">Basics of using our web interface and features.</p>
        </div>
        <div className="p-5 sm:p-6 bg-card border border-border/80 dark:border-none rounded-2xl cursor-pointer hover:bg-secondary/50 transition-colors">
          <Settings className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4 text-foreground" />
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Account & Billing</h3>
          <p className="text-base sm:text-base text-muted-foreground">Manage subscriptions, usage limits, and invoices.</p>
        </div>
        <div className="p-5 sm:p-6 bg-card border border-border/80 dark:border-none rounded-2xl cursor-pointer hover:bg-secondary/50 transition-colors">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4 text-foreground" />
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Troubleshooting</h3>
          <p className="text-base sm:text-base text-muted-foreground">Solutions for common errors and technical issues.</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            "How do I reset my password?",
            "What are the usage limits for the free tier?",
            "Can I use generated content for commercial purposes?",
            "How do I upgrade to a team plan?"
          ].map((question, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/60 hover:bg-secondary/30 transition-colors cursor-pointer text-base sm:text-base">
              <span className="font-medium">{question}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
