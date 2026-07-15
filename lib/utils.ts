export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Keep loaders visible briefly so the finish moment can settle. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export const UPLOAD_FINISH_DELAY_MS = 900;
