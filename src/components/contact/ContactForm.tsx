"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { budgetOptions, contactSchema, fieldErrors, serviceOptions, type ContactField } from "@/lib/contact-schema";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

type Values = Record<ContactField, string>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const EMPTY: Values = { name: "", email: "", service: "", message: "", budget: "", company: "" };
const ORDER: ContactField[] = ["name", "email", "service", "message", "budget"];

const control =
  "w-full rounded-none border-0 border-b border-(--rule) bg-transparent py-3 text-lg text-(--fg) transition-colors duration-300 placeholder:text-(--fg-mute) focus:border-(--fg) focus:outline-none aria-[invalid=true]:border-signal";

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="meta flex justify-between text-(--fg-mute)">
        <span>{label}</span>
        {optional && <span>Optional</span>}
      </label>
      {children}
      <p id={`${id}-err`} className={cn("meta mt-2 min-h-[1.3em] normal-case tracking-normal", error ? "text-(--fg)" : "")}>
        {error && (
          <>
            <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 -translate-y-px bg-signal" />
            {error}
          </>
        )}
      </p>
    </div>
  );
}

/** Brief form. Validates with zod on the client and again on the server. Never fakes success. */
export function ContactForm({ idPrefix = "cf" }: { idPrefix?: string }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Errors are felt on the same frame they appear (apple-design §13); success fires where it's set.
  useEffect(() => {
    if (status.kind === "error") haptic("error");
  }, [status]);
  const id = (k: ContactField) => `${idPrefix}-${k}`;

  const set = (k: ContactField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  // Inline validation (apple-design §16): check a field when you leave it, if it has something in it.
  // Empty required fields are only flagged on submit, so tabbing through doesn't nag.
  const check = (k: ContactField) => () => {
    if (!String(values[k] ?? "").trim()) return;
    const parsed = contactSchema.safeParse(values);
    const err = parsed.success ? undefined : fieldErrors(parsed.error)[k];
    setErrors((s) => (s[k] === err ? s : { ...s, [k]: err }));
  };

  const focusFirst = (errs: Partial<Record<ContactField, string>>) => {
    const first = ORDER.find((k) => errs[k]);
    if (first) document.getElementById(id(first))?.focus();
  };

  const notSent = `Nothing was sent. Please email ${site.email} directly.`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      focusFirst(errs);
      haptic("error");
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Partial<Record<ContactField, string>> };
      if (res.ok && data.ok) {
        setStatus({ kind: "sent" });
        haptic("success");
        setValues(EMPTY);
        return;
      }
      if (res.status === 400 && data.fieldErrors) {
        setErrors(data.fieldErrors);
        setStatus({ kind: "idle" });
        focusFirst(data.fieldErrors);
        return;
      }
      if (res.status === 503 && data.error === "not_configured") {
        setStatus({
          kind: "error",
          message:
            process.env.NODE_ENV === "development"
              ? "The form isn't configured: add RESEND_API_KEY and CONTACT_TO_EMAIL to .env.local and restart the dev server (README → Contact form). Nothing was sent."
              : `This form isn't connected yet. ${notSent}`,
        });
        return;
      }
      setStatus({ kind: "error", message: `Something went wrong on our side. ${notSent}` });
    } catch {
      setStatus({ kind: "error", message: `We couldn't reach the server. Check your connection and try again. ${notSent}` });
    }
  }

  if (status.kind === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-6 border-t border-(--rule) pt-8">
        <p className="meta flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-signal" /> Brief received
        </p>
        <p className="font-display text-h3">Thanks. We&rsquo;ll reply {site.responseTime}.</p>
        <Button variant="secondary" onClick={() => setStatus({ kind: "idle" })}>
          Send another brief
        </Button>
      </div>
    );
  }

  const describedBy = (k: ContactField) => `${id(k)}-err`;

  return (
    <form noValidate onSubmit={onSubmit} aria-describedby={`${idPrefix}-status`} className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      <Field id={id("name")} label="Name" error={errors.name}>
        <input
          id={id("name")}
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={set("name")}
          onBlur={check("name")}
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          className={control}
        />
      </Field>
      <Field id={id("email")} label="Email" error={errors.email}>
        <input
          id={id("email")}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={set("email")}
          onBlur={check("email")}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email")}
          className={control}
        />
      </Field>
      <Field id={id("service")} label="Service" error={errors.service}>
        <div className="relative">
          <select
            id={id("service")}
            name="service"
            value={values.service}
            onChange={set("service")}
          onBlur={check("service")}
            aria-invalid={!!errors.service}
            aria-describedby={describedBy("service")}
            className={cn(control, "appearance-none pr-8", !values.service && "text-(--fg-mute)")}
          >
            <option value="">Choose one</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2" />
        </div>
      </Field>
      <Field id={id("budget")} label="Budget" optional error={errors.budget}>
        <div className="relative">
          <select
            id={id("budget")}
            name="budget"
            value={values.budget}
            onChange={set("budget")}
          onBlur={check("budget")}
            aria-invalid={!!errors.budget}
            aria-describedby={describedBy("budget")}
            className={cn(control, "appearance-none pr-8", !values.budget && "text-(--fg-mute)")}
          >
            <option value="">Prefer not to say</option>
            {budgetOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2" />
        </div>
      </Field>
      <div className="sm:col-span-2">
        <Field id={id("message")} label="The project" error={errors.message}>
          <textarea
            id={id("message")}
            name="message"
            rows={4}
            value={values.message}
            onChange={set("message")}
          onBlur={check("message")}
            placeholder="What are you making, how long is it, and when does it need to ship?"
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message")}
            className={cn(control, "resize-y leading-relaxed")}
          />
        </Field>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots that fill it are rejected. */}
      <div aria-hidden="true" className="vh">
        <label htmlFor={id("company")}>Company website</label>
        <input id={id("company")} name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set("company")}
          onBlur={check("company")} />
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={status.kind === "sending"} icon={<ArrowRight aria-hidden="true" className="size-4" />} size="lg">
          {status.kind === "sending" ? "Sending…" : "Send the brief"}
        </Button>
        <p className="meta text-(--fg-mute)">We reply {site.responseTime}</p>
      </div>
      <p id={`${idPrefix}-status`} role="status" aria-live="polite" className={cn("sm:col-span-2", status.kind === "error" && "border-l-2 border-signal pl-4")}>
        {status.kind === "error" ? status.message : status.kind === "sending" ? <span className="vh">Sending your brief</span> : null}
      </p>
    </form>
  );
}
