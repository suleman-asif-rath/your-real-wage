"use client";

import { useEffect, useMemo, useState } from "react";
import { WageResult } from "@/lib/wage";
import { renderShareCard } from "@/lib/shareCard";
import { shareOrDownload } from "@/lib/share";
import { SITE_URL } from "@/lib/site";

interface ShareModalProps {
  result: WageResult;
  onClose: () => void;
}

export default function ShareModal({ result, onClose }: ShareModalProps) {
  const [includeNominal, setIncludeNominal] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  // The preview is a pure function of the result + privacy toggle.
  const preview = useMemo(
    () =>
      renderShareCard({
        nominalHourly: result.nominalHourly,
        realHourly: result.realHourly,
        percentDrop: result.percentDrop,
        includeNominal,
      }).toDataURL("image/png"),
    [result, includeNominal],
  );

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleShare = async () => {
    setBusy(true);
    setStatus("");
    try {
      const canvas = renderShareCard({
        nominalHourly: result.nominalHourly,
        realHourly: result.realHourly,
        percentDrop: result.percentDrop,
        includeNominal,
      });
      const outcome = await shareOrDownload(canvas, `https://${SITE_URL}`);
      setStatus(
        outcome === "downloaded"
          ? "Image saved — share it anywhere."
          : "Thanks for sharing!",
      );
    } catch {
      setStatus("Couldn't generate the image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share your real wage"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Share your real wage
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* A canvas data URL — next/image would add no value here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Preview of your shareable real-wage card"
          className="w-full rounded-xl border border-border"
        />

        <label className="mt-4 flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={includeNominal}
            onChange={(e) => setIncludeNominal(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            Show my &ldquo;before&rdquo; wage too
            <span className="block text-xs text-muted">
              Off = share only the % drop and your real wage. No salary is ever
              shown.
            </span>
          </span>
        </label>

        <button
          onClick={handleShare}
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-accent px-6 py-3.5 font-semibold text-black transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? "Preparing…" : "Share / download image"}
        </button>

        {status && (
          <p className="mt-3 text-center text-sm text-muted">{status}</p>
        )}
      </div>
    </div>
  );
}
