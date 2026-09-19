"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { AnimatedChevron } from "@/components/ui/animated";

export interface ThinkReasoningProps {
  isThinking?: boolean;
  promptText?: string;
  thinkingSteps?: string[];
  elapsedSeconds?: number;
}

function extractKeyTopic(prompt?: string): string {
  if (!prompt || !prompt.trim()) return "";
  const cleaned = prompt
    .replace(
      /^(can you|could you|please|help me|i want to|i need to|write a|write an|write|create a|create|generate a|generate|draft a|draft|build a|build|explain|how do i|how to)\\s+/i,
      ""
    )
    .replace(/[?.!]+$/, "")
    .trim();
  const words = cleaned.split(/\s+/);
  if (words.length <= 5) return cleaned;
  return words.slice(0, 5).join(" ") + "…";
}

function getDynamicSteps(prompt?: string): string[] {
  const p = (prompt || "").toLowerCase();
  const topic = extractKeyTopic(prompt);
  const topicPrefix = topic ? ` for "${topic}"` : "";

  // 1. Career / Cover Letter / Resume
  if (
    p.includes("resume") ||
    p.includes("cv") ||
    p.includes("cover letter") ||
    p.includes("portfolio") ||
    p.includes("interview") ||
    p.includes("hiring") ||
    p.includes("ats") ||
    p.includes("job")
  ) {
    return [
      `Analyzing candidate background and target position expectations${topicPrefix}.`,
      "Deconstructing job description requirements and identifying core alignment vectors.",
      "Synthesizing quantifiable accomplishments, impact metrics, and leadership indicators.",
      "Structuring narrative arc: impactful opening hook, proven achievements, and forward vision.",
      "Aligning industry keywords, ATS scoring benchmarks, and semantic terminology.",
      "Calibrating tone for authentic executive confidence and professional clarity.",
      "Drafting compelling value proposition and core engineering strengths.",
      "Refining narrative momentum and eliminating generic corporate boilerplate.",
      "Optimizing paragraph cadence, sentence length variability, and readability score.",
      "Ensuring cultural resonance with company mission and engineering values.",
      "Formulating strategic closing statement with actionable call to dialogue.",
      "Reviewing structural cohesiveness, section layout, and typographic presentation.",
      "Conducting final qualitative evaluation against top candidate benchmarks.",
      "Deepening domain analysis and verifying persuasive alignment.",
      "Finalizing comprehensive review and response synthesis.",
    ];
  }

  // 2. Code / Development / Debugging
  if (
    p.includes("code") ||
    p.includes("bug") ||
    p.includes("error") ||
    p.includes("function") ||
    p.includes("api") ||
    p.includes("typescript") ||
    p.includes("react") ||
    p.includes("javascript") ||
    p.includes("python") ||
    p.includes("sql") ||
    p.includes("css") ||
    p.includes("tailwind") ||
    p.includes("component") ||
    p.includes("fix") ||
    p.includes("refactor")
  ) {
    return [
      `Parsing technical requirements, syntax constraints, and runtime patterns${topicPrefix}.`,
      "Deconstructing architectural boundaries, state management, and lifecycle events.",
      "Tracing execution flow and pinpointing potential edge cases or race conditions.",
      "Evaluating type safety, interface contracts, and null-safety guarantees.",
      "Formulating clean, maintainable implementation following idiomatic standards.",
      "Analyzing asymptotic time and space complexity across target operations.",
      "Verifying defensive error boundaries, exception handling, and fallback states.",
      "Cross-referencing reactive dependency trees and memoization strategies.",
      "Structuring modular solution with decoupled responsibilities and clean exports.",
      "Validating compliance with strict compiler options and best practices.",
      "Optimizing rendering performance, DOM mutations, and bundle weight.",
      "Reviewing code ergonomics, readable naming conventions, and inline documentation.",
      "Conducting sanity checks across synchronous and asynchronous execution paths.",
      "Formulating structured explanatory walkthrough alongside the implementation.",
      "Finalizing response code and verifying logical coherence.",
    ];
  }

  // 3. System Design / Architecture / Cloud / DB
  if (
    p.includes("system") ||
    p.includes("architecture") ||
    p.includes("database") ||
    p.includes("cloud") ||
    p.includes("redis") ||
    p.includes("postgres") ||
    p.includes("docker") ||
    p.includes("scale") ||
    p.includes("microservice")
  ) {
    return [
      `Evaluating high-level scalability targets and throughput requirements${topicPrefix}.`,
      "Deconstructing functional and non-functional system constraints.",
      "Mapping data ingestion flows, persistence layers, and read/write access patterns.",
      "Evaluating storage paradigms: relational consistency vs distributed key-value models.",
      "Designing caching layers, cache eviction policies, and replication topologies.",
      "Analyzing fault tolerance, circuit breakers, and disaster recovery redundancy.",
      "Structuring event-driven messaging pipelines and backpressure mechanisms.",
      "Evaluating API gateway routing, rate-limiting, and authentication protocols.",
      "Assessing cost efficiency, compute elasticity, and infrastructure provisioning.",
      "Conducting bottleneck analysis across network partitions and database sharding.",
      "Synthesizing architectural tradeoffs and clear component boundaries.",
      "Finalizing comprehensive system design strategy.",
    ];
  }

  // 4. Math, Science & Algorithms
  if (
    p.includes("math") ||
    p.includes("physics") ||
    p.includes("algorithm") ||
    p.includes("formula") ||
    p.includes("calculate") ||
    p.includes("equation") ||
    p.includes("matrix")
  ) {
    return [
      `Deconstructing mathematical formulation and identifying underlying invariants${topicPrefix}.`,
      "Mapping known boundary conditions, parameter constraints, and target theorems.",
      "Developing formal derivation step-by-step from foundational axioms.",
      "Evaluating asymptotic bounds, recurrence relations, and algorithmic optimizations.",
      "Validating edge cases: boundary singularities, zero boundaries, and extreme limits.",
      "Checking dimensional consistency, numerical stability, and precision bounds.",
      "Formulating clear intuitive explanations alongside formal mathematical notation.",
      "Synthesizing step-by-step derivation with illustrative test cases.",
      "Finalizing mathematical proofs and logical conclusions.",
    ];
  }

  // 5. General inquiries / Strategy / Writing
  return [
    `Analyzing prompt intent and establishing core objectives${topicPrefix}.`,
    "Exploring contextual nuances, underlying principles, and key thematic vectors.",
    "Synthesizing multifaceted perspectives, objective trade-offs, and critical context.",
    "Structuring narrative progression from foundational premises to concrete insights.",
    "Calibrating rhetorical clarity, tone consistency, and conceptual depth.",
    "Evaluating nuance, eliminating ambiguities, and sharpening terminology.",
    "Formulating a step-by-step comprehensive explanation with concrete details.",
    "Refining readability, paragraph rhythm, and structural transitions.",
    "Conducting second-pass evaluation for logical coherence and factual precision.",
    "Deepening domain analysis and verifying holistic clarity.",
    "Synthesizing comprehensive response output.",
    "Finalizing polished answer presentation.",
  ];
}

/**
 * Format seconds into dynamic human-readable duration: "3s", "1m 24s", "2h 5m 10s"
 */
function formatDuration(totalSeconds: number): string {
  const secs = Math.max(1, Math.round(totalSeconds));
  if (secs < 60) return `${secs}s`;
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;

  if (hours > 0) {
    const parts: string[] = [`${hours}h`];
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSecs > 0) parts.push(`${remainingSecs}s`);
    return parts.join(" ");
  }

  return remainingSecs > 0 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
}

export function ThinkReasoning({
  isThinking = false,
  promptText,
  thinkingSteps,
  elapsedSeconds,
}: ThinkReasoningProps) {
  const baseSentences = useMemo(() => {
    if (thinkingSteps && thinkingSteps.length > 0) return thinkingSteps;
    return getDynamicSteps(promptText);
  }, [thinkingSteps, promptText]);

  const [phase, setPhase] = useState<"thinking" | "done">(isThinking ? "thinking" : "done");
  const [revealed, setRevealed] = useState<number>(isThinking ? 1 : baseSentences.length);
  const [open, setOpen] = useState<boolean>(isThinking);
  const [liveSeconds, setLiveSeconds] = useState<number>(1);
  const [actualDuration, setActualDuration] = useState<number>(
    elapsedSeconds !== undefined ? elapsedSeconds : 1
  );

  const startTsRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const stepTimerRef = useRef<any>(null);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the thinking steps panel and main chat container as new steps appear
  useEffect(() => {
    if (isThinking && open && stepsEndRef.current) {
      stepsEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [revealed, isThinking, open]);

  // Live timer & progressive step reveal when isThinking is active
  useEffect(() => {
    if (isThinking) {
      setPhase("thinking");
      setOpen(true);
      setRevealed(1);
      startTsRef.current = Date.now();
      setLiveSeconds(1);

      // Increment live seconds continuously
      timerRef.current = setInterval(() => {
        const secs = Math.max(1, Math.round((Date.now() - startTsRef.current) / 1000));
        setLiveSeconds(secs);
      }, 1000);

      // Progressively reveal sentences one by one (capped at baseSentences.length — NO repeats)
      stepTimerRef.current = setInterval(() => {
        setRevealed((prev) => {
          if (prev < baseSentences.length) {
            return prev + 1;
          }
          // All unique steps revealed — stop the interval, no more steps to add
          if (stepTimerRef.current) {
            clearInterval(stepTimerRef.current);
            stepTimerRef.current = null;
          }
          return prev;
        });
      }, 1700);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      };
    } else if (phase === "thinking") {
      // Transitioning from live thinking to done
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);

      const diff = Math.max(1, Math.round((Date.now() - startTsRef.current) / 1000));
      const finalSecs = elapsedSeconds !== undefined ? elapsedSeconds : diff;
      setActualDuration(finalSecs);

      // Show all unique base steps when done (no duplicates, no repeats)
      setRevealed(baseSentences.length);
      setOpen(false);

      const t = setTimeout(() => setPhase("done"), 250);
      return () => clearTimeout(t);
    }
  }, [isThinking, elapsedSeconds, phase, baseSentences.length]);

  const done = phase === "done";

  // When done, show all base steps. When thinking, show revealed count.
  const visibleCount = done
    ? baseSentences.length
    : Math.min(revealed, baseSentences.length);

  const visibleSentences = baseSentences.slice(0, visibleCount);

  const displayElapsed = done
    ? elapsedSeconds !== undefined
      ? elapsedSeconds
      : actualDuration
    : liveSeconds;

  const formattedElapsed = formatDuration(displayElapsed);

  const toggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col w-full max-w-full select-none">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 self-start min-h-[22px] p-0 border-0 bg-transparent cursor-pointer outline-none select-none group"
        aria-expanded={open}
        aria-label="Toggle thought"
        onClick={toggle}
      >
        {done ? (
          <span className="text-[13.5px] leading-[18px] font-normal text-muted-foreground tracking-[-0.005em]">
            <span className="font-medium text-foreground">Thought</span> for {formattedElapsed}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[13.5px] leading-[18px] text-muted-foreground">
            <span className="font-medium animate-shimmer-text text-muted-foreground">Thinking…</span>
            <span className="font-normal text-xs opacity-80 text-muted-foreground">{formattedElapsed}</span>
          </span>
        )}
        <AnimatedChevron
          open={open}
          orientation="right-down"
          size={13}
          strokeWidth={1.5}
          disableHover
          className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors"
        />
      </button>

      {open && (
        <div className="mt-1.5 overflow-hidden">
          <div className="flex flex-col gap-1 max-h-[480px] overflow-y-auto scrollbar-thin pr-1 select-text">
            {visibleSentences.map((line, i) => (
              <p
                key={`${i}-${line}`}
                className="m-0 py-0.5 text-[13.5px] leading-5 text-muted-foreground/90 select-text"
              >
                {line}
              </p>
            ))}
            <div ref={stepsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ThinkReasoning;
