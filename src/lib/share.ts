// Turns the rendered canvas into something the user can keep or share: the
// native share sheet where available (mostly mobile), a file download otherwise.

const FILENAME = "my-real-wage.png";
const SHARE_TEXT =
  "I found out my real hourly wage after what my job actually costs me. Calculate yours:";

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not render the image."));
    }, "image/png");
  });
}

export type ShareOutcome = "shared" | "downloaded";

/**
 * Share the card via the Web Share API when the browser can share files,
 * otherwise download it. Returns how it was handled. A user-cancelled share
 * sheet (AbortError) is swallowed and reported as "shared".
 */
export async function shareOrDownload(
  canvas: HTMLCanvasElement,
  shareUrl: string,
): Promise<ShareOutcome> {
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], FILENAME, { type: "image/png" });

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFiles && typeof navigator.share === "function") {
    try {
      await navigator.share({
        files: [file],
        title: "My Real Wage",
        text: SHARE_TEXT,
        url: shareUrl,
      });
      return "shared";
    } catch (err) {
      // The user dismissed the sheet — not an error worth surfacing.
      if (err instanceof DOMException && err.name === "AbortError") {
        return "shared";
      }
      // Anything else: fall through to a download so they still get the image.
    }
  }

  downloadBlob(blob);
  return "downloaded";
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
