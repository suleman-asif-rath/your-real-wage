"use client";

import { useEffect, useState } from "react";
import { WageResult } from "@/lib/wage";
import { useCountUp } from "@/lib/useCountUp";
import {
  formatHourly,
  formatHours,
  formatMoney,
  formatPercent,
} from "@/lib/format";

interface RevealProps {
  result: WageResult;
  currency: string;
  onShare: () => void;
  onReset: () => void;
}

const COUNT_MS = 1400;
const HOLD_MS = 1000;
const DROP_MS = 1100;

type Stage = "counting" | "dropping" | "done";

/** Round to 2 significant figures so the example price looks deliberate. */
function roundNice(value: number): number {
  if (value <= 0) return 0;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)) - 1);
  return Math.round(value / magnitude) * magnitude;
}

export default function Reveal({
  result,
  currency,
  onShare,
  onReset,
}: RevealProps) {
  const [stage, setStage] = useState<Stage>("counting");
  const [target, setTarget] = useState(0);

  const dropped = stage !== "counting";
  const display = useCountUp(target, dropped ? DROP_MS : COUNT_MS);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Count up to the nominal (illusion) wage.
    timers.push(setTimeout(() => setTarget(result.nominalHourly), 150));
    // Hold, then drop to the real wage.
    timers.push(
      setTimeout(() => {
        setStage("dropping");
        setTarget(result.realHourly);
      }, 150 + COUNT_MS + HOLD_MS),
    );
    // Settle: reveal the breakdown.
    timers.push(
      setTimeout(
        () => setStage("done"),
        150 + COUNT_MS + HOLD_MS + DROP_MS,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [result]);

  const negative = result.realHourly <= 0;

  // A relatable big-ticket purchase, sized to roughly a month of nominal pay so
  // it feels real in any currency without needing exchange rates.
  const refPrice = roundNice(
    (result.nominalHourly * result.officialHoursPerYear) / 12,
  );
  const refRealHours = result.realHourly > 0 ? refPrice / result.realHourly : 0;
  const refNominalHours =
    result.nominalHourly > 0 ? refPrice / result.nominalHourly : 0;

  return (
    <div className="text-center">
      {/* The hero number. */}
      <p className="text-sm font-medium uppercase tracking-widest text-muted">
        {dropped ? "You actually earn" : "You think you earn"}
      </p>

      <div
        className="tabular mt-3 text-7xl font-bold leading-none sm:text-8xl"
        style={{
          color: dropped ? "var(--real)" : "var(--nominal)",
          transition: "color 0.8s ease",
        }}
      >
        {formatHourly(display, currency)}
        <span className="text-3xl font-semibold text-muted sm:text-4xl">
          /hr
        </span>
      </div>

      {/* Once dropped, remind them of the illusion they started from. */}
      <p
        className={`mt-3 text-sm text-muted transition-opacity duration-700 ${
          stage === "done" ? "opacity-100" : "opacity-0"
        }`}
      >
        You thought it was{" "}
        <span className="font-semibold text-nominal line-through decoration-muted/60">
          {formatHourly(result.nominalHourly, currency)}/hr
        </span>
      </p>

      {/* Everything below fades in after the drop lands. */}
      <div
        className={`transition-opacity duration-700 ${
          stage === "done" ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* The gut-punch summary. */}
        <p className="mx-auto mt-8 max-w-md text-balance text-lg text-foreground sm:text-xl">
          {negative ? (
            <>
              After everything it costs, this job takes back more than it pays.
              Your real wage is{" "}
              <span className="font-semibold text-real">at or below $0/hr</span>
              .
            </>
          ) : (
            <>
              That&apos;s{" "}
              <span className="font-semibold text-real">
                {formatPercent(result.percentDrop)} less
              </span>{" "}
              than you thought. Every year, your job quietly takes back{" "}
              <span className="font-semibold text-foreground">
                {formatMoney(result.annualJobCosts, currency)}
              </span>{" "}
              and{" "}
              <span className="font-semibold text-foreground">
                {formatHours(result.extraHoursPerYear)} hours
              </span>{" "}
              of your life.
            </>
          )}
        </p>

        {/* Credibility breakdown. */}
        <dl className="mx-auto mt-8 grid max-w-md gap-3 text-left">
          <BreakdownRow
            label="Hours lost each week"
            sub="Commute + prep, on top of work"
            value={`${formatHours(
              result.weeklyCommuteHours + result.weeklyPrepHours,
            )} hrs`}
          />
          <BreakdownRow
            label="Real hours / year"
            sub={`vs ${formatHours(result.officialHoursPerYear)} official hours`}
            value={`${formatHours(result.realHoursPerYear)} hrs`}
          />
          <BreakdownRow
            label="What the job costs you / year"
            sub="Commute, food, clothes, childcare, decompression"
            value={formatMoney(result.annualJobCosts, currency)}
          />
        </dl>

        {/* One non-preachy line of perspective, in the user's own currency. */}
        {!negative && refPrice > 0 && (
          <p className="mx-auto mt-8 max-w-md text-balance text-sm text-muted">
            At your real wage, a{" "}
            <span className="font-semibold text-foreground">
              {formatMoney(refPrice, currency)}
            </span>{" "}
            purchase costs you{" "}
            <span className="font-semibold text-foreground">
              {formatHours(refRealHours)} hours
            </span>{" "}
            of actual life — not {formatHours(refNominalHours)}.
          </p>
        )}

        {/* Actions. */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onShare}
            className="rounded-xl bg-accent px-6 py-3.5 font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Share my real wage
          </button>
          <button
            onClick={onReset}
            className="rounded-xl border border-border bg-surface px-6 py-3.5 font-medium text-foreground transition-colors hover:bg-surface-2"
          >
            Recalculate
          </button>
        </div>

        <p className="mx-auto mt-8 max-w-md text-xs text-muted">
          An estimate for personal insight, not financial advice. Now you can
          negotiate, compare, or decide with the honest number in hand.
        </p>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  sub,
  value,
}: {
  label: string;
  sub: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
      <dt>
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted">{sub}</span>
      </dt>
      <dd className="tabular shrink-0 text-lg font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}
