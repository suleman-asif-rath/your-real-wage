// The list of currencies the picker offers.
//
// Backed by a static snapshot (currency-data.ts) rather than a live Intl call,
// so the <option> list is byte-for-byte identical on server and client. Engine
// currency data drifts between Node and browsers (e.g. SLE vs SLL), which would
// otherwise cause a React hydration mismatch.

import { CURRENCIES } from "./currency-data";

export interface CurrencyOption {
  code: string;
  /** e.g. "PKR — Pakistani Rupee" */
  label: string;
}

/** Pinned to the top of the picker for quick access. */
const COMMON_CODES = [
  "USD",
  "EUR",
  "GBP",
  "PKR",
  "INR",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
];

const labelFor = (code: string, name: string) =>
  name && name !== code ? `${code} — ${name}` : code;

export function getCurrencyGroups(): {
  common: CurrencyOption[];
  all: CurrencyOption[];
} {
  const byCode = new Map(CURRENCIES.map((c) => [c.code, c.name]));

  const all = CURRENCIES.map((c) => ({
    code: c.code,
    label: labelFor(c.code, c.name),
  }));

  const common = COMMON_CODES.filter((code) => byCode.has(code)).map((code) => ({
    code,
    label: labelFor(code, byCode.get(code) as string),
  }));

  return { common, all };
}

export const DEFAULT_CURRENCY = "USD";
