"use client";

import Link from "next/link";
import { useRef, type ReactNode, type MouseEventHandler } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  children: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  variant?: Variant;
  magnetic?: boolean;
  icon?: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Custom cursor label */
  cursor?: string;
  size?: "md" | "lg";
  "aria-label"?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-3 whitespace-nowrap meta select-none disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-(--fg) text-(--bg) before:absolute before:inset-0 before:bg-signal before:[clip-path:inset(0_100%_0_0)] before:transition-[clip-path] before:duration-500 before:ease-cut hover:before:[clip-path:inset(0_0_0_0)] hover:text-paper transition-colors duration-500",
  secondary:
    "border border-(--fg) text-(--fg) before:absolute before:inset-0 before:bg-(--fg) before:[clip-path:inset(100%_0_0_0)] before:transition-[clip-path] before:duration-500 before:ease-cut hover:before:[clip-path:inset(0_0_0_0)] hover:text-(--bg) transition-colors duration-500",
  ghost: "text-(--fg) px-0! underline-offset-[6px] decoration-1 hover:underline",
};

const sizes = { md: "min-h-11 px-5 py-3", lg: "min-h-14 px-7 py-4 text-[0.8125rem]" };

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  magnetic = false,
  icon,
  className,
  type = "button",
  disabled,
  cursor,
  size = "md",
  ...rest
}: Props) {
  const wrap = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = wrap.current;
      if (!magnetic || !el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.fine} and ${MQ.motion}`, () => {
        const inner = el.firstElementChild as HTMLElement | null;
        if (!inner) return;
        const xTo = gsap.quickTo(inner, "x", { duration: 0.6, ease: "expo.out" });
        const yTo = gsap.quickTo(inner, "y", { duration: 0.6, ease: "expo.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: wrap, dependencies: [magnetic] },
  );

  const content = (
    <>
      <span className="roll relative z-10">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {icon && <span className="relative z-10 transition-transform duration-500 ease-out-expo group-hover:translate-x-1">{icon}</span>}
    </>
  );

  const cls = cn(base, variants[variant], variant !== "ghost" && sizes[size], className);
  const common = { className: cls, "data-cursor": cursor, onClick, ...rest };

  let el: ReactNode;
  if (href && href.startsWith("/")) {
    el = (
      <Link href={href} {...common}>
        {content}
      </Link>
    );
  } else if (href) {
    const external = href.startsWith("http");
    el = (
      <a href={href} {...common} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  } else {
    el = (
      <button type={type} disabled={disabled} {...common}>
        {content}
      </button>
    );
  }

  return magnetic ? (
    <span ref={wrap} className="inline-flex p-3 -m-3">
      {el}
    </span>
  ) : (
    el
  );
}
