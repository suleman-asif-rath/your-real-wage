// Regenerates src/lib/currency-data.ts — a static snapshot of ISO 4217
// currencies (code + English name) taken from this Node runtime's Intl data.
//
// Run from the project root:
//   node scripts/gen-currencies.mjs
//
// We snapshot rather than call Intl at render time so the currency picker's
// markup is identical on server and client (engine currency data drifts).

import { writeFileSync } from "node:fs";

const codes = Intl.supportedValuesOf("currency");
const names = new Intl.DisplayNames(["en"], { type: "currency" });

const entries = codes
  .map((code) => {
    let name = code;
    try {
      const n = names.of(code);
      if (n && n !== code) name = n;
    } catch {
      // keep the code as the name
    }
    return { code, name };
  })
  .sort((a, b) => a.code.localeCompare(b.code));

const body =
  `// AUTO-GENERATED — do not edit by hand.\n` +
  `// A static snapshot of ISO 4217 currencies (code + English name) so the\n` +
  `// currency picker renders identically on server and client (no hydration\n` +
  `// mismatch from engine-specific Intl data). Regenerate with\n` +
  `// scripts/gen-currencies.mjs if the list ever needs updating.\n\n` +
  `export interface CurrencyEntry {\n  code: string;\n  name: string;\n}\n\n` +
  `export const CURRENCIES: CurrencyEntry[] = ${JSON.stringify(entries, null, 2)};\n`;

writeFileSync("src/lib/currency-data.ts", body, "utf8");
console.log(`Wrote ${entries.length} currencies to src/lib/currency-data.ts`);
