"use client";

import { useId, useState } from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Text shown below the label to explain the field. */
  hint?: string;
  /** Symbol shown inside the input, e.g. "$" or "min". */
  prefix?: string;
  suffix?: string;
  min?: number;
  step?: number;
}

/**
 * A numeric input that keeps its own text state so the field can be cleared
 * while typing, but always reports a clean number (empty → 0) to the parent.
 */
export default function NumberField({
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  min = 0,
  step = 1,
}: NumberFieldProps) {
  const id = useId();
  // This field owns its own text so it can be cleared mid-edit. The parent is
  // the only other writer, and it feeds our own onChange straight back, so they
  // never drift. Fields that swap on mode change are remounted via `key`.
  const [text, setText] = useState(value === 0 ? "" : String(value));

  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      <div className="mt-2 flex items-center rounded-xl border border-border bg-surface-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/40 transition-colors">
        {prefix && (
          <span className="pl-3 pr-1 text-muted select-none">{prefix}</span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={text}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            const parsed = parseFloat(raw);
            onChange(Number.isNaN(parsed) ? 0 : Math.max(min, parsed));
          }}
          onBlur={() => {
            if (text.trim() === "") setText("");
            else setText(String(value));
          }}
          className="w-full bg-transparent px-3 py-2.5 text-foreground outline-none tabular [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="pr-3 pl-1 text-sm text-muted select-none">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
