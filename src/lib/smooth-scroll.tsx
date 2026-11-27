/**
 * Scrolling stays native everywhere (apple-design §16 Familiarity): the platform's own momentum, rubber-band
 * and scroll indicators, with no wheel hijacking. These helpers only cover programmatic scrolls and locks.
 */

let locks = 0;

/** Scroll to a target (element, selector or y). Smooth unless the user prefers reduced motion. */
export function scrollToTarget(target: string | number | HTMLElement, opts: { offset?: number } = {}) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
  const offset = opts.offset ?? 0;
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior });
}

/** Lock page scroll while a dialog or menu is open (ref-counted). */
export function lockScroll(lock: boolean) {
  locks = Math.max(0, locks + (lock ? 1 : -1));
  document.documentElement.classList.toggle("scroll-locked", locks > 0);
}
