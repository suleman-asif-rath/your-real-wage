"use client";

import { useId, useMemo } from "react";
import { getCurrencyGroups } from "@/lib/currencies";

interface CurrencySelectProps {
  value: string;
  onChange: (currency: string) => void;
}

export default function CurrencySelect({
  value,
  onChange,
}: CurrencySelectProps) {
  const id = useId();
  const { common, all } = useMemo(() => getCurrencyGroups(), []);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        Currency
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-lg border border-border bg-surface-2 py-1.5 pl-3 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/40"
        >
          <optgroup label="Common">
            {common.map((c) => (
              <option key={`common-${c.code}`} value={c.code}>
                {c.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="All currencies">
            {all.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </optgroup>
        </select>
        {/* Custom chevron since we hid the native one. */}
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
          ▾
        </span>
      </div>
    </div>
  );
}
