import Image from "next/image";
import { BookingWizard } from "@/components/booking-wizard";

export default function Home() {
  return (
    <main>
      <section className="relative min-h-[88svh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80"
          alt="Team collaborating around laptops"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,32,28,0.82),rgba(11,110,79,0.45))]" />
        <div className="relative mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-24 sm:px-8">
          <p className="fade-up font-[family-name:var(--font-display)] text-5xl text-white sm:text-7xl">
            StudioBook
          </p>
          <h1 className="fade-up-delay mt-4 max-w-2xl text-2xl text-white/95 sm:text-3xl">
            Qualify clients, price above €17.50/hr, and generate a scope before you hop on a call.
          </h1>
          <p className="fade-up-delay mt-3 max-w-xl text-white/75">
            Real problem: freelancers burn evenings on tire-kickers. StudioBook scores fit,
            rejects impossible budgets, and outputs a scope doc you can send.
          </p>
          <a
            href="#intake"
            className="fade-up-delay mt-8 inline-flex w-fit rounded-xl bg-white px-5 py-3 font-medium text-[var(--ink)]"
          >
            Start client intake
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
            Why this exists
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
            Intake that protects your rate
          </h2>
          <p className="mt-3 text-lg text-[var(--muted)]">
            Budget, decision-maker, design/content readiness, and timeline feed a lead score.
            Low-budget leads get rejected. Viable ones get a package quote and scope checklist.
          </p>
        </div>
      </section>

      <section id="intake" className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <BookingWizard />
      </section>
    </main>
  );
}
