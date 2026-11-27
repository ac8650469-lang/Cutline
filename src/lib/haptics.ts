/**
 * Haptics for meaningful moments only (apple-design §13 Utility): a committed gesture, a success, an error.
 * Fires on the same frame as the visual change. Uses the Vibration API where it exists (Android browsers);
 * elsewhere it is a no-op, so the visual feedback must always stand on its own.
 */
const patterns = { commit: 8, success: [10, 40, 12], error: [30, 50, 30] } as const;

export function haptic(kind: keyof typeof patterns) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(patterns[kind] as number | number[]);
  } catch {
    /* some browsers throw without a user gesture; feedback is optional */
  }
}
