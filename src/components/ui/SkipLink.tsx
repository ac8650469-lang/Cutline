"use client";

/** Skip link that targets the visible <main> (hidden routes stay in the DOM under cacheComponents). */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="skip-link meta"
      onClick={(e) => {
        const main = Array.from(document.querySelectorAll<HTMLElement>("main")).find((m) => m.offsetParent !== null || m.getClientRects().length > 0);
        if (!main) return;
        e.preventDefault();
        main.tabIndex = -1;
        main.focus();
        main.scrollIntoView();
      }}
    >
      Skip to content
    </a>
  );
}
