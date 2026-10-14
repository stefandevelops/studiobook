export const packages = [
  {
    id: "fix",
    title: "Landing page",
    blurb: "One conversion-focused page, mobile-ready, deployed.",
    basePrice: 450,
    hours: 18,
    minBudget: 400,
  },
  {
    id: "app-slice",
    title: "App UI slice",
    blurb: "One authenticated flow (forms, states, API wiring).",
    basePrice: 900,
    hours: 30,
    minBudget: 750,
  },
  {
    id: "rescue",
    title: "Bug/rescue week",
    blurb: "Stabilize a broken page or feature and hand back a checklist.",
    basePrice: 600,
    hours: 20,
    minBudget: 500,
  },
] as const;

export type PackageId = (typeof packages)[number]["id"];

export type IntakeAnswers = {
  goal: string;
  hasDesign: "yes" | "no" | "partial" | "";
  hasContent: "yes" | "no" | "partial" | "";
  timeline: "asap" | "2weeks" | "month" | "flexible" | "";
  budget: "under400" | "400to800" | "800to1500" | "1500plus" | "";
  decisionMaker: "yes" | "no" | "";
  name: string;
  email: string;
  company: string;
  notes: string;
  packageId: PackageId | "";
  slot: string;
};

export const emptyIntake: IntakeAnswers = {
  goal: "",
  hasDesign: "",
  hasContent: "",
  timeline: "",
  budget: "",
  decisionMaker: "",
  name: "",
  email: "",
  company: "",
  notes: "",
  packageId: "",
  slot: "",
};

export const slots = [
  "Tue 10:00",
  "Tue 15:00",
  "Wed 11:30",
  "Thu 16:00",
  "Fri 09:30",
] as const;

const budgetFloor: Record<NonNullable<IntakeAnswers["budget"]>, number> = {
  "": 0,
  under400: 300,
  "400to800": 600,
  "800to1500": 1100,
  "1500plus": 1800,
};

export type LeadResult = {
  score: number;
  tier: "hot" | "warm" | "cold" | "reject";
  reasons: string[];
  recommendedPackageId: PackageId | null;
  quoteEur: number | null;
  hourlyEur: number | null;
  scopeDoc: string;
};

export function qualifyLead(a: IntakeAnswers): LeadResult {
  let score = 0;
  const reasons: string[] = [];

  if (a.goal.trim().length >= 20) {
    score += 20;
    reasons.push("Clear project goal provided.");
  } else {
    reasons.push("Goal is vague — expect discovery overhead.");
  }

  if (a.decisionMaker === "yes") {
    score += 20;
    reasons.push("Talking to the decision maker.");
  } else if (a.decisionMaker === "no") {
    score -= 10;
    reasons.push("Not the decision maker — higher chance of delay.");
  }

  if (a.hasDesign === "yes") score += 15;
  if (a.hasDesign === "partial") score += 8;
  if (a.hasDesign === "no") {
    score += 0;
    reasons.push("No design yet — include discovery in quote.");
  }

  if (a.hasContent === "yes") score += 10;
  if (a.hasContent === "no") reasons.push("Missing content can block launch.");

  if (a.timeline === "asap") {
    score += 5;
    reasons.push("Urgent timeline — prioritize or charge rush.");
  }
  if (a.timeline === "flexible") score += 10;

  const budget = budgetFloor[a.budget];
  if (a.budget === "under400") {
    score -= 25;
    reasons.push("Budget under €400 usually cannot cover a quality web build.");
  } else if (a.budget === "400to800") {
    score += 10;
  } else if (a.budget === "800to1500") {
    score += 20;
  } else if (a.budget === "1500plus") {
    score += 25;
  }

  const recommended =
    packages.find((p) => budget >= p.minBudget) ??
    (budget >= 400 ? packages[0] : null);

  // Prefer app-slice for larger budgets with app-ish goals
  let recommendedPackageId: PackageId | null = recommended?.id ?? null;
  if (budget >= 800 && /app|dashboard|auth|saas|portal/i.test(a.goal)) {
    recommendedPackageId = "app-slice";
  } else if (/bug|broken|fix|rescue/i.test(a.goal)) {
    recommendedPackageId = "rescue";
  } else if (budget >= 400) {
    recommendedPackageId = recommendedPackageId ?? "fix";
  }

  const pkg = packages.find((p) => p.id === recommendedPackageId) ?? null;
  let quoteEur = pkg ? pkg.basePrice : null;
  if (pkg && a.hasDesign !== "yes") quoteEur = (quoteEur ?? 0) + 120;
  if (pkg && a.timeline === "asap") quoteEur = (quoteEur ?? 0) + 100;

  const hourlyEur =
    pkg && quoteEur != null ? Math.round((quoteEur / pkg.hours) * 10) / 10 : null;

  score = Math.max(0, Math.min(100, score));

  let tier: LeadResult["tier"] = "warm";
  if (budget < 400 || score < 35) tier = "reject";
  else if (score >= 75) tier = "hot";
  else if (score < 50) tier = "cold";

  if (hourlyEur != null && hourlyEur < 17.5) {
    tier = "reject";
    reasons.push(`Implied rate €${hourlyEur}/hr is below your €17.50 floor.`);
  } else if (hourlyEur != null) {
    reasons.push(`Implied rate about €${hourlyEur}/hr after scoped hours.`);
  }

  const scopeDoc = [
    `Client: ${a.name || "TBD"} (${a.company || "Independent"})`,
    `Email: ${a.email || "TBD"}`,
    `Goal: ${a.goal || "TBD"}`,
    `Package: ${pkg?.title ?? "None — budget too low"}`,
    `Quote: ${quoteEur != null ? `€${quoteEur}` : "N/A"}`,
    `Assumptions:`,
    `- Design ready: ${a.hasDesign || "unknown"}`,
    `- Content ready: ${a.hasContent || "unknown"}`,
    `- Timeline: ${a.timeline || "unknown"}`,
    `- Decision maker on call: ${a.decisionMaker || "unknown"}`,
    `Out of scope: extra pages, custom backend, SEO retainers, unlimited revisions.`,
    `Next step: ${tier === "reject" ? "Polite decline / refer" : "Book scoped consult and confirm milestone 1."}`,
  ].join("\n");

  return {
    score,
    tier,
    reasons,
    recommendedPackageId,
    quoteEur,
    hourlyEur,
    scopeDoc,
  };
}
