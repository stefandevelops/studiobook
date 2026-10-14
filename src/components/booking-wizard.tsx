"use client";

import { useMemo, useState } from "react";
import {
  emptyIntake,
  packages,
  qualifyLead,
  slots,
  type IntakeAnswers,
  type PackageId,
} from "@/lib/intake";

const steps = ["Need", "Fit", "Quote", "Book", "Confirm"] as const;

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<IntakeAnswers>(emptyIntake);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");

  const result = useMemo(() => qualifyLead(draft), [draft]);
  const selectedPkg = packages.find((p) => p.id === draft.packageId);

  function next() {
    setError("");
    if (step === 0 && draft.goal.trim().length < 20) {
      setError("Describe the real outcome in at least a couple sentences.");
      return;
    }
    if (step === 1) {
      if (!draft.hasDesign || !draft.hasContent || !draft.timeline || !draft.budget || !draft.decisionMaker) {
        setError("Answer every fit question — this protects both of you.");
        return;
      }
    }
    if (step === 2) {
      if (result.tier === "reject") {
        setError("This lead is below a workable budget/rate. Decline or revise scope.");
        return;
      }
      if (!draft.packageId) {
        setDraft((d) => ({
          ...d,
          packageId: (result.recommendedPackageId ?? "landing") as PackageId,
        }));
      }
    }
    if (step === 3) {
      if (!draft.slot || !draft.name.trim() || !draft.email.trim()) {
        setError("Name, email, and a slot are required.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
        setError("Enter a valid email.");
        return;
      }
    }
    if (step === 4) {
      const id = `lead_${Date.now()}`;
      const payload = {
        id,
        createdAt: new Date().toISOString(),
        draft,
        result,
      };
      const prev = JSON.parse(localStorage.getItem("studiobook-leads") || "[]") as unknown[];
      localStorage.setItem("studiobook-leads", JSON.stringify([payload, ...prev].slice(0, 50)));
      setSavedId(id);
      setDone(true);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function reset() {
    setDraft(emptyIntake);
    setStep(0);
    setDone(false);
    setError("");
    setSavedId("");
  }

  if (done) {
    return (
      <div className="fade-up rounded-3xl border border-[var(--line)] bg-[var(--card)] p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
          Lead captured · {result.tier.toUpperCase()}
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl">
          {result.tier === "reject" ? "Politely declined" : "Consult reserved"}
        </h3>
        <p className="mt-3 text-[var(--muted)]">
          {draft.name} · {draft.slot || "unscheduled"} · score {result.score}/100
          {result.quoteEur != null ? ` · quote €${result.quoteEur}` : ""}
        </p>
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-[var(--bg)] p-4 text-sm whitespace-pre-wrap">
          {result.scopeDoc}
        </pre>
        <p className="mt-3 text-xs text-[var(--muted)]">Saved locally as {savedId}</p>
        <button type="button" onClick={reset} className="mt-8 rounded-xl bg-[var(--accent)] px-5 py-3 text-white">
          New intake
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
      <ol className="mb-8 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 text-sm ${
              index === step
                ? "bg-[var(--ink)] text-white"
                : index < step
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--bg)] text-[var(--muted)]"
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="fade-up space-y-4">
          <label className="block space-y-2 text-sm">
            <span>What real outcome do you need?</span>
            <textarea
              rows={5}
              value={draft.goal}
              onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
              placeholder="Example: Rebuild our service landing page so mobile visitors can book a consult in under a minute."
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="fade-up grid gap-4 sm:grid-cols-2">
          <Select
            label="Design ready?"
            value={draft.hasDesign}
            onChange={(v) => setDraft({ ...draft, hasDesign: v as IntakeAnswers["hasDesign"] })}
            options={[
              ["yes", "Yes"],
              ["partial", "Partial"],
              ["no", "No"],
            ]}
          />
          <Select
            label="Content ready?"
            value={draft.hasContent}
            onChange={(v) => setDraft({ ...draft, hasContent: v as IntakeAnswers["hasContent"] })}
            options={[
              ["yes", "Yes"],
              ["partial", "Partial"],
              ["no", "No"],
            ]}
          />
          <Select
            label="Timeline"
            value={draft.timeline}
            onChange={(v) => setDraft({ ...draft, timeline: v as IntakeAnswers["timeline"] })}
            options={[
              ["asap", "ASAP"],
              ["2weeks", "About 2 weeks"],
              ["month", "This month"],
              ["flexible", "Flexible"],
            ]}
          />
          <Select
            label="Budget"
            value={draft.budget}
            onChange={(v) => setDraft({ ...draft, budget: v as IntakeAnswers["budget"] })}
            options={[
              ["under400", "Under €400"],
              ["400to800", "€400–800"],
              ["800to1500", "€800–1,500"],
              ["1500plus", "€1,500+"],
            ]}
          />
          <Select
            label="Are you the decision maker?"
            value={draft.decisionMaker}
            onChange={(v) => setDraft({ ...draft, decisionMaker: v as IntakeAnswers["decisionMaker"] })}
            options={[
              ["yes", "Yes"],
              ["no", "No"],
            ]}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="fade-up space-y-5">
          <div className={`rounded-2xl border px-4 py-4 ${
            result.tier === "reject"
              ? "border-red-300 bg-red-50"
              : result.tier === "hot"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] bg-[var(--bg)]"
          }`}>
            <p className="text-sm uppercase tracking-[0.14em]">Lead score {result.score}/100 · {result.tier}</p>
            <p className="mt-2 text-lg">
              {result.quoteEur != null
                ? `Recommended quote €${result.quoteEur}${result.hourlyEur != null ? ` (~€${result.hourlyEur}/hr)` : ""}`
                : "No safe quote — budget too low for quality delivery."}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
              {result.reasons.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </div>

          {result.tier !== "reject" ? (
            <div className="grid gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, packageId: pkg.id })}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    draft.packageId === pkg.id || (!draft.packageId && result.recommendedPackageId === pkg.id)
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)]"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{pkg.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{pkg.blurb}</p>
                    </div>
                    <p className="text-sm">from €{pkg.basePrice}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="fade-up grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setDraft({ ...draft, slot })}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  draft.slot === slot ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)]"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <input
            placeholder="Your name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="rounded-xl border border-[var(--line)] px-3 py-2.5"
          />
          <input
            placeholder="Email"
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            className="rounded-xl border border-[var(--line)] px-3 py-2.5"
          />
          <input
            placeholder="Company (optional)"
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
            className="rounded-xl border border-[var(--line)] px-3 py-2.5"
          />
          <textarea
            rows={3}
            placeholder="Constraints, links, must-haves"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            className="rounded-xl border border-[var(--line)] px-3 py-2.5"
          />
        </div>
      ) : null}

      {step === 4 ? (
        <div className="fade-up space-y-3 text-[var(--muted)]">
          <p><span className="text-[var(--ink)]">Package:</span> {selectedPkg?.title ?? result.recommendedPackageId}</p>
          <p><span className="text-[var(--ink)]">Quote:</span> {result.quoteEur != null ? `€${result.quoteEur}` : "N/A"}</p>
          <p><span className="text-[var(--ink)]">Slot:</span> {draft.slot}</p>
          <p><span className="text-[var(--ink)]">Contact:</span> {draft.name} · {draft.email}</p>
          <pre className="overflow-x-auto rounded-2xl bg-[var(--bg)] p-4 text-sm whitespace-pre-wrap text-[var(--ink)]">
            {result.scopeDoc}
          </pre>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={back} disabled={step === 0} className="rounded-xl border border-[var(--line)] px-4 py-2.5 disabled:opacity-40">
          Back
        </button>
        <button type="button" onClick={next} className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-white">
          {step === 4 ? "Save lead + scope" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block space-y-1.5 text-sm sm:col-span-1">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"
      >
        <option value="">Select…</option>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
