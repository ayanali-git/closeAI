"use client";

import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { AnimatedArrow } from "@/components/ui/animated";

export default function ContactPage() {
  return (
    <div className="py-12 sm:py-16 w-full max-w-4xl mx-auto min-w-0 px-4">
      <header className="mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground mb-4 sm:mb-6">
          Contact Us
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground">
          Get in touch with the closeAI team for support, press inquiries, or
          partnerships.
        </p>
      </header>

      <div className="p-6 sm:p-10 md:p-12 bg-card border border-border/80 dark:border-none rounded-3xl">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">
              Get in Touch
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label
                  className="block text-base font-medium mb-1.5 text-foreground"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-3 bg-secondary/80 border border-border/80 dark:border-none rounded-xl focus:outline-none text-base focus:placeholder:text-foreground placeholder:text-muted-foreground transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  className="block text-base font-medium mb-1.5 text-foreground"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-3 bg-secondary/80 border border-border/80 dark:border-none rounded-xl focus:outline-none text-base focus:placeholder:text-foreground placeholder:text-muted-foreground transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label
                  className="block text-base font-medium mb-1.5 text-foreground"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full p-3 bg-secondary/80 border border-border/80 dark:border-none rounded-xl focus:outline-none text-base focus:placeholder:text-foreground placeholder:text-muted-foreground transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-medium rounded-full hover:opacity-90 transition-opacity text-base group cursor-pointer"
              >
                <span>Send Message</span>
                <AnimatedArrow size={18} />
              </button>
            </form>
          </div>

          <div className="space-y-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">
                Support & Inquiries
              </h2>
              <div className="space-y-3">
                <a
                  href="mailto:support@closeai.example.com"
                  className="group flex items-center justify-between p-4 bg-secondary/60 hover:bg-secondary border border-border/80 dark:border-none rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border/80 dark:border-none flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-base">
                        General Support
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        support@closeai.example.com
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>

                <a
                  href="mailto:press@closeai.example.com"
                  className="group flex items-center justify-between p-4 bg-secondary/60 hover:bg-secondary border border-border/80 dark:border-none rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border/80 dark:border-none flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-base">
                        Press & Media
                      </div>
                      <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        press@closeai.example.com
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">
                Office
              </h2>
              <a
                href="[https://www.google.com/maps/search/?api=1&query=1455+3rd+St%2C+San+Francisco%2C+CA+94158%2C+USA](https://www.google.com/maps/search/?api=1&query=1455+3rd+St%2C+San+Francisco%2C+CA+94158%2C+USA)
"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 bg-secondary/60 hover:bg-secondary border border-border/80 dark:border-none rounded-2xl transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border/80 dark:border-none flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-base mb-0.5">
                      CloseAI
                    </div>
                    <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      1455 3rd Street
                      <br />
                      San Francisco, CA 94158, USA
                    </div>
                  </div>
                </div>
                <AnimatedArrow size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
