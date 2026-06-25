// Display formatting helpers. Kept separate from the math so the numbers stay
// pure and the presentation stays in one place. Every money helper takes an ISO
// currency code so the whole app can render in the user's own currency.

const LOCALE = "en-US";

/** Whole-unit money (no cents) — for salaries, costs, big totals. */
export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Money for an hourly wage. Lets each currency use its own natural number of
 * decimals (USD → $19.78, JPY → ¥2,080, KWD → 3 decimals).
 */
export function formatHourly(value: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
  }).format(value);
}

/** The symbol (or code) a currency renders with, e.g. "$", "₹", "PKR". */
export function currencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

export function formatHours(value: number): string {
  const rounded = Math.round(value);
  return new Intl.NumberFormat(LOCALE).format(rounded);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
