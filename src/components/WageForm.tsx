"use client";

import { WageInputs } from "@/lib/wage";
import { currencySymbol } from "@/lib/format";
import NumberField from "./NumberField";

interface WageFormProps {
  inputs: WageInputs;
  currency: string;
  onChange: (inputs: WageInputs) => void;
  onSubmit: () => void;
}

export default function WageForm({
  inputs,
  currency,
  onChange,
  onSubmit,
}: WageFormProps) {
  const set = <K extends keyof WageInputs>(key: K, value: WageInputs[K]) =>
    onChange({ ...inputs, [key]: value });

  const symbol = currencySymbol(currency);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-8"
    >
      {/* --- Money in --- */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <SectionHeader
          step="1"
          title="Money in"
          subtitle="What the job pays on paper."
        />

        <div className="mb-5 inline-flex rounded-xl border border-border bg-surface-2 p-1">
          <ModeButton
            active={inputs.salaryMode === "annual"}
            onClick={() => set("salaryMode", "annual")}
          >
            Annual salary
          </ModeButton>
          <ModeButton
            active={inputs.salaryMode === "hourly"}
            onClick={() => set("salaryMode", "hourly")}
          >
            Hourly rate
          </ModeButton>
        </div>

        {inputs.salaryMode === "annual" ? (
          <NumberField
            key="annual"
            label="Annual salary"
            prefix={symbol}
            step={1000}
            value={inputs.annualSalary}
            onChange={(v) => set("annualSalary", v)}
          />
        ) : (
          <NumberField
            key="hourly"
            label="Hourly rate"
            prefix={symbol}
            step={0.5}
            hint="We'll turn this into a yearly figure using your official hours below."
            value={inputs.hourlyRate}
            onChange={(v) => set("hourlyRate", v)}
          />
        )}
      </section>

      {/* --- Time it really takes --- */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <SectionHeader
          step="2"
          title="Time it really takes"
          subtitle="The hours the job quietly eats — not just the ones you're paid for."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            label="Official hours / week"
            value={inputs.officialHoursPerWeek}
            onChange={(v) => set("officialHoursPerWeek", v)}
            suffix="hrs"
          />
          <NumberField
            label="Actual hours / week"
            hint="The honest number — include the unpaid overtime you never log."
            value={inputs.actualHoursPerWeek}
            onChange={(v) => set("actualHoursPerWeek", v)}
            suffix="hrs"
          />
          <NumberField
            label="One-way commute"
            hint="Counted both ways, 5 days a week."
            value={inputs.oneWayCommuteMin}
            onChange={(v) => set("oneWayCommuteMin", v)}
            suffix="min"
          />
          <NumberField
            label="Daily prep / decompression"
            hint="Getting ready + the dead zone after work when you can't do anything."
            value={inputs.dailyPrepMin}
            onChange={(v) => set("dailyPrepMin", v)}
            suffix="min"
          />
        </div>
      </section>

      {/* --- Money it really costs --- */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <SectionHeader
          step="3"
          title="Money it really costs"
          subtitle="Per month, only the spending you wouldn't have without this job. All optional."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            label="Commute"
            hint="Gas, transit, parking."
            prefix={symbol}
            value={inputs.commuteCost}
            onChange={(v) => set("commuteCost", v)}
            suffix="/mo"
          />
          <NumberField
            label="Work lunches & coffee"
            prefix={symbol}
            value={inputs.lunches}
            onChange={(v) => set("lunches", v)}
            suffix="/mo"
          />
          <NumberField
            label="Work clothes & dry cleaning"
            prefix={symbol}
            value={inputs.clothes}
            onChange={(v) => set("clothes", v)}
            suffix="/mo"
          />
          <NumberField
            label="Childcare"
            hint="Only what you need because you work."
            prefix={symbol}
            value={inputs.childcare}
            onChange={(v) => set("childcare", v)}
            suffix="/mo"
          />
          <NumberField
            label="Decompression spending"
            hint="Takeout, drinks, retail therapy you only do because the job drains you."
            prefix={symbol}
            value={inputs.decompSpending}
            onChange={(v) => set("decompSpending", v)}
            suffix="/mo"
          />
        </div>
      </section>

      <button
        type="submit"
        className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-black transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Reveal my real wage →
      </button>

      <p className="text-center text-xs text-muted">
        🔒 All math runs in your browser. Nothing is sent anywhere — no servers,
        no accounts, no tracking.
      </p>
    </form>
  );
}

function SectionHeader({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-accent">
          {step}
        </span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-accent text-black"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
