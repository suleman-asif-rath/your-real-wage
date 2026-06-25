// Display formatting helpers. Kept separate from the math so the numbers stay
// pure and the presentation stays in one place.

export function formatMoney(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Money for an hourly wage — keep the cents, they matter here. */
export function formatHourly(value: number): string {
  return formatMoney(value, 2);
}

export function formatHours(value: number): string {
  const rounded = Math.round(value);
  return new Intl.NumberFormat("en-US").format(rounded);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
