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
      /^(can you|could you|please|help me|i want to|i need to|write a|write an|write|create a|create|generate a|generate|draft a|draft|build a|build|explain|how do i|how to)\s+/i,
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

  const [activeSteps, setActiveSteps] = useState<string[]>(baseSentences);
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

  // Sync active steps if baseSentences changes
  useEffect(() => {
    setActiveSteps(baseSentences);
  }, [baseSentences]);

  // Live timer & progressive step stream when isThinking is active
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

      // Progressively reveal sentences one by one like AI agents / Codex
      let currentIdx = 1;
      stepTimerRef.current = setInterval(() => {
        setActiveSteps((prev) => {
          // If we ever reach the end of initial steps, dynamically generate next deep-dive steps
          if (currentIdx >= prev.length) {
            const nextStepNumber = prev.length + 1;
            const dynamicExtensions = [
              "Deepening contextual assessment and validating secondary constraints.",
              "Refining edge-case permutations and cross-referencing domain requirements.",
              "Conducting secondary sanity pass across synthesized concepts.",
              "Synthesizing final high-precision response structure.",
              "Polishing response formatting and preparing answer output.",
            ];
            const extra =
              dynamicExtensions[(nextStepNumber - 1) % dynamicExtensions.length];
            return [...prev, extra];
          }
          return prev;
        });

        currentIdx += 1;
        setRevealed(currentIdx);
      }, 1700);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      };
    } else {
      // Done thinking
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);

      const diff = Math.max(1, Math.round((Date.now() - startTsRef.current) / 1000));
      const finalSecs = elapsedSeconds !== undefined ? elapsedSeconds : diff;
      setActualDuration(finalSecs);

      // Calculate how many steps correspond to the duration (approx 1 step per 1.7s, min 3)
      const targetCount = Math.min(
        activeSteps.length,
        Math.max(3, Math.round(finalSecs / 1.7))
      );
      setRevealed(targetCount);
      setOpen(false);

      const t = setTimeout(() => setPhase("done"), 250);
      return () => clearTimeout(t);
    }
  }, [isThinking, elapsedSeconds]);

  const done = phase === "done";
  const count = done
    ? Math.min(
        activeSteps.length,
        Math.max(3, Math.round((elapsedSeconds ?? actualDuration) / 1.7))
      )
    : Math.min(revealed, activeSteps.length);

  const visibleSentences = activeSteps.slice(0, count);

  const displayElapsed = done
    ? elapsedSeconds !== undefined
      ? elapsedSeconds
      : actualDuration
    : liveSeconds;

  const toggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="tr-container">
      <style jsx global>{`
        .tr-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          font-family: inherit;
          animation: tr-block-in 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
          user-select: none;
        }
        @keyframes tr-block-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tr-header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          align-self: flex-start;
          min-height: 22px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          outline: none;
        }
        .tr-label {
          font-size: 13.5px;
          line-height: 18px;
          font-weight: 500;
          color: var(--tre-label, #737373);
          letter-spacing: -0.005em;
        }
        .tr-verb {
          color: var(--tre-verb, #a3a3a3);
        }
        .tr-collapsible {
          display: grid;
          grid-template-rows: 1fr;
          opacity: 1;
          transition: grid-template-rows 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease;
        }
        .tr-collapsible.is-collapsed {
          grid-template-rows: 0fr;
          opacity: 0;
          pointer-events: none;
        }
        .tr-inner {
          min-height: 0;
          overflow: hidden;
        }
        .tr-stream {
          display: flex;
          flex-direction: column;
          gap: 2.5px;
          margin-top: 6px;
          overflow: visible;
        }
        .tr-sentence {
          margin: 0;
          padding: 1.5px 0;
          line-height: 20px;
          font-size: 13.5px;
          font-weight: 400;
          color: var(--tre-sentence, #8e8e8e);
          letter-spacing: -0.005em;
          user-select: text;
          animation: tr-sentence-fade-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes tr-sentence-fade-in {
          from {
            opacity: 0;
            transform: translateY(3px);
            filter: blur(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .tr-shimmer {
          color: transparent;
          -webkit-text-fill-color: transparent;
          background: linear-gradient(
            90deg,
            #8e8e8e 0%,
            #8e8e8e 30%,
            rgba(220, 220, 220, 0.9) 50%,
            #8e8e8e 70%,
            #8e8e8e 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: tr-shine 2.25s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
        }
        @keyframes tr-shine {
          0%, 18% { background-position: 100% 0; }
          82%, 100% { background-position: 0% 0; }
        }
        :root,
        [data-theme="light"] {
          --tre-label: #737373;
          --tre-verb: #171717;
          --tre-chevron: #737373;
          --tre-sentence: #666666;
          --tre-hover: #171717;
        }
        :root.dark,
        [data-theme="dark"],
        .dark {
          --tre-label: #737373;
          --tre-verb: #e5e5e5;
          --tre-chevron: #737373;
          --tre-sentence: #8e8e8e;
          --tre-hover: #f5f5f5;
        }
      `}</style>

      <button
        type="button"
        className="tr-header group"
        aria-expanded={open}
        aria-label="Toggle thought"
        onClick={toggle}
      >
        {done ? (
          <span className="tr-label">
            <span className="tr-verb font-medium text-foreground">Thought</span> for {displayElapsed}s
          </span>
        ) : (
          <span className="tr-label tr-shimmer">
            Thinking… <span className="font-normal text-xs text-muted-foreground/80">{displayElapsed}s</span>
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

      <div className={`tr-collapsible ${open ? "" : "is-collapsed"}`}>
        <div className="tr-inner">
          <div className="tr-stream">
            {visibleSentences.map((line, i) => (
              <p key={i} className="tr-sentence">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThinkReasoning;
