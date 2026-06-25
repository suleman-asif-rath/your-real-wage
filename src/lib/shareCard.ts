// Renders a branded, screenshot-worthy share card entirely on the client using
// the Canvas API — no external image service. Returns a 1080×1080 canvas.

import { formatHourly, formatPercent } from "./format";
import { SITE_URL } from "./site";

export interface ShareCardData {
  nominalHourly: number;
  realHourly: number;
  percentDrop: number;
  /** When false, the "before" wage is hidden for privacy. */
  includeNominal: boolean;
}

const SIZE = 1080;
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const COLORS = {
  bgTop: "#0b0b11",
  bgBottom: "#07070a",
  glow: "rgba(255, 180, 84, 0.16)",
  glow2: "rgba(255, 90, 71, 0.14)",
  foreground: "#f2f2f5",
  muted: "#9a9aa8",
  nominal: "#5eead4",
  real: "#ff5a47",
  accent: "#ffb454",
  border: "rgba(255,255,255,0.08)",
};

export function renderShareCard(data: ShareCardData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // --- Background ---
  const bg = ctx.createLinearGradient(0, 0, 0, SIZE);
  bg.addColorStop(0, COLORS.bgTop);
  bg.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  radialGlow(ctx, SIZE * 0.5, SIZE * 0.05, SIZE * 0.7, COLORS.glow);
  radialGlow(ctx, SIZE * 0.9, SIZE * 0.95, SIZE * 0.6, COLORS.glow2);

  ctx.textAlign = "center";

  // --- Eyebrow ---
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText(letterspace("YOUR REAL WAGE"), SIZE / 2, 130);

  if (data.includeNominal) {
    // "You think you earn"
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 34px ${FONT}`;
    ctx.fillText("You think you earn", SIZE / 2, 300);

    // Struck-through nominal wage.
    ctx.fillStyle = COLORS.nominal;
    ctx.font = `700 96px ${FONT}`;
    const nominalText = `${formatHourly(data.nominalHourly)}/hr`;
    ctx.fillText(nominalText, SIZE / 2, 400);
    strikeThrough(ctx, SIZE / 2, 368, nominalText, COLORS.muted);

    // Down arrow.
    ctx.fillStyle = COLORS.real;
    ctx.font = `700 70px ${FONT}`;
    ctx.fillText("↓", SIZE / 2, 500);

    // "You actually earn"
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 34px ${FONT}`;
    ctx.fillText("You actually earn", SIZE / 2, 580);

    // The real wage — the hero.
    drawHeroWage(ctx, data.realHourly, 720);
  } else {
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 36px ${FONT}`;
    ctx.fillText("My real hourly wage", SIZE / 2, 470);
    drawHeroWage(ctx, data.realHourly, 640);
  }

  // --- Percent-drop pill ---
  const pillY = data.includeNominal ? 800 : 730;
  drawPill(
    ctx,
    `${formatPercent(data.percentDrop)} less than I thought`,
    pillY,
  );

  // --- Footer / teaser ---
  ctx.fillStyle = COLORS.foreground;
  ctx.font = `700 44px ${FONT}`;
  ctx.fillText("Calculate yours →", SIZE / 2, 960);

  ctx.fillStyle = COLORS.muted;
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(SITE_URL, SIZE / 2, 1010);

  return canvas;
}

function drawHeroWage(
  ctx: CanvasRenderingContext2D,
  value: number,
  y: number,
) {
  ctx.fillStyle = COLORS.real;
  ctx.font = `800 168px ${FONT}`;
  const text = formatHourly(value);
  ctx.fillText(text, SIZE / 2, y);

  // "/hr" suffix, smaller and muted, placed just after the number.
  const numWidth = ctx.measureText(text).width;
  ctx.fillStyle = COLORS.muted;
  ctx.font = `700 56px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("/hr", SIZE / 2 + numWidth / 2 + 12, y);
  ctx.textAlign = "center";
}

function drawPill(ctx: CanvasRenderingContext2D, text: string, y: number) {
  ctx.font = `600 34px ${FONT}`;
  const paddingX = 36;
  const w = ctx.measureText(text).width + paddingX * 2;
  const h = 72;
  const x = (SIZE - w) / 2;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = "rgba(255, 90, 71, 0.12)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 90, 71, 0.4)";
  ctx.stroke();

  ctx.fillStyle = COLORS.real;
  ctx.textBaseline = "middle";
  ctx.fillText(text, SIZE / 2, y + h / 2 + 2);
  ctx.textBaseline = "alphabetic";
}

function strikeThrough(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  text: string,
  color: string,
) {
  const w = ctx.measureText(text).width;
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(centerX - w / 2, y);
  ctx.lineTo(centerX + w / 2, y);
  ctx.stroke();
}

function radialGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function letterspace(text: string): string {
  return text.split("").join("  ");
}
