'use client';

import { AnimatedArrow } from '@/components/ui/animated';

export default function CareersPage() {
  const roles = [
    { title: "Research Scientist, Alignment", team: "AI Research", location: "San Francisco, CA / Remote" },
    { title: "Senior Frontend Engineer", team: "Engineering", location: "New York, NY / Remote" },
    { title: "Product Designer", team: "Product & Design", location: "Remote" },
    { title: "Machine Learning Engineer, Inference", team: "Engineering", location: "San Francisco, CA" }
  ];

  return (
    <div className="py-12 sm:py-16 w-full max-w-4xl mx-auto min-w-0">
      <header className="mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground mb-4 sm:mb-6">Careers at closeAI</h1>
        <p className="text-base sm:text-xl text-muted-foreground mb-8">
          Join us in building safe, beneficial AI. We are looking for talented individuals who are passionate about our mission.
        </p>
      </header>

      <section className="mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Culture & Perks</h2>
        <div className="grid gap-6 sm:grid-cols-2 text-muted-foreground text-base sm:text-base">
          <div>
            <ul className="space-y-3">
              <li>• Comprehensive health, dental, and vision insurance</li>
              <li>• Generous equity packages and 401(k) matching</li>
              <li>• Flexible PTO and company-wide recharge weeks</li>
            </ul>
          </div>
          <div>
            <ul className="space-y-3">
              <li>• Remote-first culture with global offsites</li>
              <li>• Learning and development stipends</li>
              <li>• Home office setup allowance</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Open Roles</h2>
        <div className="flex flex-col gap-4">
          {roles.map((role, i) => (
            <div key={i} className="group flex items-center justify-between p-4 sm:p-6 bg-card border border-border rounded-2xl hover:bg-secondary/50 transition-colors cursor-pointer">
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-1">{role.title}</h3>
                <div className="text-base sm:text-base text-muted-foreground">
                  {role.team} • {role.location}
                </div>
              </div>
              <AnimatedArrow size={18} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
