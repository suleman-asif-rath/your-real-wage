"use client";

import { useMemo, useState } from "react";
import { computeWage, DEFAULT_INPUTS, WageInputs } from "@/lib/wage";
import { SITE_URL } from "@/lib/site";
import WageForm from "@/components/WageForm";
import Reveal from "@/components/Reveal";
import ShareModal from "@/components/ShareModal";

type View = "form" | "reveal";

export default function Home() {
  const [inputs, setInputs] = useState<WageInputs>(DEFAULT_INPUTS);
  const [view, setView] = useState<View>("form");
  const [sharing, setSharing] = useState(false);

  const result = useMemo(() => computeWage(inputs), [inputs]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-10 sm:py-16">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Your Real Wage
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-muted">
          You think you make $X/hr. After the time and money your job actually
          costs you, you make $Y/hr. Let&apos;s find your real number.
        </p>
      </header>

      <div className="flex-1">
        {view === "form" ? (
          <div className="animate-fade-up">
            <WageForm
              inputs={inputs}
              onChange={setInputs}
              onSubmit={() => setView("reveal")}
            />
          </div>
        ) : (
          <div className="animate-fade-up">
            <Reveal
              // Remount on each calculation so the animation replays.
              key={JSON.stringify(inputs)}
              result={result}
              onShare={() => setSharing(true)}
              onReset={() => setView("form")}
            />
          </div>
        )}
      </div>

      <footer className="mt-16 text-center text-xs text-muted">
        {SITE_URL} · Runs entirely in your browser · Not financial advice
      </footer>

      {sharing && (
        <ShareModal result={result} onClose={() => setSharing(false)} />
      )}
    </main>
  );
}
