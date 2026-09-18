/**
 * Dynamic Thinking Steps Generator
 * Generates natural, content-specific, progressive reasoning chains tailored
 * to the user's actual prompt, intent, and thinking duration.
 */

export interface PromptContext {
  topic: string;
  category: 'greeting' | 'code' | 'writing' | 'math' | 'system_design' | 'general';
}

export function extractKeyTopic(prompt?: string): string {
  if (!prompt || !prompt.trim()) return "";
  const cleaned = prompt
    .replace(
      /^(can you|could you|please|help me|i want to|i need to|write a|write an|write|create a|create|generate a|generate|draft a|draft|build a|build|explain|how do i|how to|tell me about|what is|what are|show me)\s+/i,
      ""
    )
    .replace(/[?.!]+$/, "")
    .trim();

  const words = cleaned.split(/\s+/);
  if (words.length <= 8) return cleaned;
  return words.slice(0, 8).join(" ") + "…";
}

export function detectCategory(prompt?: string): PromptContext['category'] {
  const p = (prompt || "").toLowerCase().trim();

  // 1. Casual / Greetings
  if (
    /^(hi|hii|hiii|hello|hey|heyy|greetings|good morning|good afternoon|good evening|howdy|sup|yo|what's up|how are you|who are you)[!.? ]*$/i.test(
      p
    ) ||
    p === "hi" ||
    p === "hii" ||
    p === "hello" ||
    p === "hey"
  ) {
    return "greeting";
  }

  // 2. Math & Science
  if (
    p.includes("calculate") ||
    p.includes("derivative") ||
    p.includes("integral") ||
    p.includes("equation") ||
    p.includes("matrix") ||
    p.includes("formula") ||
    p.includes("physics") ||
    p.includes("proof") ||
    p.includes("algebra") ||
    p.includes("geometry") ||
    p.includes("probability") ||
    p.includes("math")
  ) {
    return "math";
  }

  // 3. System Design & Architecture
  if (
    p.includes("system design") ||
    p.includes("architecture") ||
    p.includes("database") ||
    p.includes("postgres") ||
    p.includes("redis") ||
    p.includes("docker") ||
    p.includes("kubernetes") ||
    p.includes("microservice") ||
    p.includes("scalability") ||
    p.includes("kafka") ||
    p.includes("sharding") ||
    p.includes("load balancer")
  ) {
    return "system_design";
  }

  // 4. Code & Development
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
    p.includes("refactor") ||
    p.includes("script") ||
    p.includes("backend") ||
    p.includes("frontend") ||
    p.includes("algorithm") ||
    p.includes("html")
  ) {
    return "code";
  }

  // 5. Professional Writing & Career
  if (
    p.includes("resume") ||
    p.includes("cv") ||
    p.includes("cover letter") ||
    p.includes("portfolio") ||
    p.includes("interview") ||
    p.includes("job") ||
    p.includes("email") ||
    p.includes("essay") ||
    p.includes("draft") ||
    p.includes("letter") ||
    p.includes("rewrite") ||
    p.includes("speech") ||
    p.includes("article") ||
    p.includes("blog")
  ) {
    return "writing";
  }

  return "general";
}

export function isNonTechnicalPrompt(prompt?: string): boolean {
  if (!prompt || !prompt.trim()) return true;
  const p = prompt.toLowerCase().trim();

  // 1. Common casual greetings
  if (
    /^(hi|hii|hiii|hello|hey|heyy|greetings|good morning|good afternoon|good evening|howdy|sup|yo|what's up|how are you|who are you|hlo|helo)[!.? ]*$/i.test(p) ||
    p === "hi" || p === "hii" || p === "hello" || p === "hey"
  ) {
    return true;
  }

  // 2. Pleasantries, acknowledgments & simple conversation
  if (
    /^(thanks|thank you|thx|bye|goodbye|see you|ok|okay|cool|nice|great|good|fine|awesome|lol|haha|tell me a joke|who made you|what can you do|how do you work)[!.? ]*$/i.test(p)
  ) {
    return true;
  }

  // 3. Short prompts without any technical, coding, or mathematical keywords
  const words = p.split(/\s+/);
  const technicalKeywords = [
    "code", "function", "bug", "error", "api", "typescript", "javascript", "python", "sql", "css", "html",
    "react", "docker", "algorithm", "database", "math", "calculate", "derivative", "integral", "matrix",
    "system design", "architecture", "redis", "kafka", "microservice", "proof", "physics", "formula",
    "analyze", "optimize", "refactor", "implement", "debug", "explain how to build", "write a", "create a",
    "build a", "develop", "equation", "theorem", "query", "backend", "frontend", "server", "class", "async"
  ];

  if (words.length <= 6 && !technicalKeywords.some((k) => p.includes(k))) {
    return true;
  }

  return false;
}

/**
 * Generates an array of progressive thinking steps matching the prompt and duration.
 * @param prompt The user's input prompt
 * @param durationSecondsOrCount Number of elapsed seconds (e.g. 41) or target step count
 */
export function generateThinkingSteps(
  prompt?: string,
  durationSecondsOrCount?: number
): string[] {
  const category = detectCategory(prompt);
  const isNonTech = isNonTechnicalPrompt(prompt);
  const rawTopic = extractKeyTopic(prompt);
  const topic = rawTopic ? `"${rawTopic}"` : "user request";

  // For non-technical, casual greetings or simple chat: quick, natural thinking (2-3 steps max)
  if (isNonTech || category === "greeting") {
    return [
      `Acknowledging conversational intent for ${topic}.`,
      "Calibrating persona and preparing active assistance posture.",
      "Ready to assist with any request or task.",
    ];
  }

  // Calculate target step count for technical / logical queries
  let targetCount = 30; // default for live streaming
  if (typeof durationSecondsOrCount === "number") {
    if (durationSecondsOrCount > 60) {
      targetCount = Math.min(30, durationSecondsOrCount);
    } else {
      targetCount = Math.max(4, Math.round(durationSecondsOrCount / 1.7));
    }
  }

  let steps: string[] = [];

  switch (category) {
    case "code":
      steps = [
        `Parsing technical requirements and syntax constraints for ${topic}.`,
        `Deconstructing architectural boundaries, lifecycle events, and runtime environment for ${topic}.`,
        "Evaluating library dependencies, connection drivers, and modern idiomatic patterns.",
        "Tracing execution flow, state transformations, and input data contracts.",
        "Analyzing asymptotic time and space complexity across core operations.",
        "Formulating defensive error boundaries, exception handling, and recovery mechanisms.",
        "Validating type safety, interface contracts, and null-safety guarantees.",
        "Structuring modular implementation with clean separation of concerns.",
        "Reviewing memory footprint, resource pooling, and lifecycle cleanup.",
        "Anticipating edge cases: boundary singularities, malformed payloads, and race conditions.",
        "Formulating idiomatic implementation adhering strictly to language standards.",
        "Validating compliance with modern compiler options and runtime best practices.",
        "Structuring step-by-step explanatory walkthrough alongside the implementation.",
        "Verifying code correctness against common test vectors and inputs.",
        "Conducting qualitative pass on variable ergonomics, inline comments, and readability.",
        "Checking for potential security vulnerabilities, injection vectors, and sanitization.",
        "Optimizing rendering performance, async event loops, and computation bottlenecks.",
        "Reviewing defensive assertions and ensuring robust error messages.",
        "Cross-referencing modular exports, helper utilities, and consumption ergonomics.",
        "Confirming full coverage of all user specifications and constraints.",
        "Validating output formatting, code fence highlighting, and visual clarity.",
        "Conducting final qualitative check against production standards.",
        "Synthesizing complete executable code and usage instructions.",
        "Finalizing robust, production-ready solution presentation.",
      ];
      break;

    case "writing":
      steps = [
        `Parsing communication objectives and narrative goals for ${topic}.`,
        `Deconstructing target audience expectations, context, and tone requirements for ${topic}.`,
        "Synthesizing quantifiable accomplishments, key themes, and persuasive anchors.",
        "Calibrating rhetorical clarity, authentic executive voice, and professional confidence.",
        "Structuring logical progression: impactful opening hook, evidence-based body, and strategic close.",
        "Eliminating passive phrasing, corporate boilerplate, and ambiguous wording.",
        "Optimizing paragraph cadence, sentence length variability, and readability metrics.",
        "Aligning industry terminology, relevant keywords, and cultural resonance.",
        "Refining narrative momentum and ensuring seamless transitions between sections.",
        "Formulating clear, actionable closing statement or call-to-action.",
        "Conducting comprehensive proofreading pass for grammatical elegance and precision.",
        "Reviewing visual formatting, section layout, and typographic rhythm.",
        "Verifying persuasive alignment with the user's primary objectives.",
        "Polishing rhetorical impact and emotional resonance.",
        "Finalizing compelling, high-impact written communication.",
      ];
      break;

    case "math":
      steps = [
        `Deconstructing mathematical formulation and parameter constraints for ${topic}.`,
        "Identifying underlying invariants, boundary limits, and relevant theorems.",
        "Mapping foundational axioms and selecting optimal derivation trajectory.",
        "Executing intermediate algebraic transformations and symbolic simplifications.",
        "Applying relevant differentiation, integration, or algebraic rules step-by-step.",
        "Validating boundary conditions, zero denominators, and extreme limits.",
        "Verifying numerical precision, sign consistency, and dimensional analysis.",
        "Checking for factoring efficiencies and algebraic cancellation opportunities.",
        "Formulating clear intuitive explanations alongside rigorous mathematical notation.",
        "Synthesizing step-by-step derivation with illustrative test values.",
        "Reviewing LaTeX mathematical formatting and symbolic clarity.",
        "Conducting sanity checks on intermediate arithmetic and final values.",
        "Verifying logical rigor and step-by-step mathematical coherence.",
        "Finalizing clean formal derivation and comprehensive solution.",
      ];
      break;

    case "system_design":
      steps = [
        `Evaluating high-level scalability targets and throughput requirements for ${topic}.`,
        `Deconstructing functional and non-functional constraints for ${topic}.`,
        "Mapping data ingestion flows, persistence tiers, and read/write access patterns.",
        "Evaluating storage paradigms: relational consistency vs distributed document/key-value models.",
        "Designing caching hierarchies, cache invalidation policies, and replication topologies.",
        "Analyzing fault tolerance, circuit breakers, failover strategies, and disaster recovery.",
        "Structuring event-driven messaging pipelines, partitions, and backpressure mechanisms.",
        "Evaluating API gateway routing, rate-limiting, and security protocols.",
        "Assessing horizontal compute elasticity, containerization, and cost efficiency.",
        "Conducting bottleneck analysis across network boundaries, serialization, and database sharding.",
        "Synthesizing architectural tradeoffs and defining clear component boundaries.",
        "Validating consistency guarantees, consensus protocols, and replication lag mitigation.",
        "Formulating comprehensive architecture overview and component walkthrough.",
        "Finalizing robust, scalable system design specification.",
      ];
      break;

    case "general":
    default:
      steps = [
        `Analyzing prompt intent and establishing primary objectives for ${topic}.`,
        `Deconstructing core conceptual foundations and underlying principles for ${topic}.`,
        "Mapping domain boundaries, key terminologies, and thematic vectors.",
        "Synthesizing multifaceted perspectives, objective trade-offs, and critical context.",
        "Structuring narrative progression from foundational premises to concrete insights.",
        "Formulating direct, structured explanations tailored specifically to the prompt.",
        "Exploring practical implications, illustrative real-world examples, and nuanced distinctions.",
        "Calibrating rhetorical clarity, tone consistency, and conceptual depth.",
        "Evaluating nuance, eliminating ambiguities, and sharpening terminology.",
        "Cross-referencing factual accuracy and logical consistency across all points.",
        "Refining readability, paragraph rhythm, and structural transitions.",
        "Highlighting core takeaways and actionable conclusions for the user.",
        "Conducting second-pass evaluation to verify complete coverage of the question.",
        "Polishing prose clarity and optimizing conceptual retention.",
        "Synthesizing comprehensive, high-clarity response output.",
        "Finalizing polished, structured answer presentation.",
      ];
      break;
  }

  // Deduplicate and ensure no repeated steps or duplicate messages
  const uniqueSteps: string[] = [];
  const seen = new Set<string>();

  for (const s of steps) {
    if (!seen.has(s)) {
      seen.add(s);
      uniqueSteps.push(s);
    }
  }

  // Cap steps up to available unique steps or target count without looping duplicates
  const maxToReturn = Math.min(uniqueSteps.length, Math.max(3, targetCount));
  return uniqueSteps.slice(0, maxToReturn);
}
