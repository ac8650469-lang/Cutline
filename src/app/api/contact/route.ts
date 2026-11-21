import { contactSchema, fieldErrors } from "@/lib/contact-schema";

/**
 * POST /api/contact — validates with the shared zod schema, then sends through Resend's REST API.
 * Without RESEND_API_KEY + CONTACT_TO_EMAIL it answers 503 { error: "not_configured" }.
 * It never reports success unless Resend accepted the email.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid", fieldErrors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const d = parsed.data;
  const text = [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Service: ${d.service}`,
    `Budget: ${d.budget || "Not given"}`,
    "",
    d.message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL || "Website <onboarding@resend.dev>",
        to: [CONTACT_TO_EMAIL],
        reply_to: d.email,
        subject: `New brief: ${d.service} (${d.name})`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend rejected the email", res.status, await res.text().catch(() => ""));
      return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Could not reach Resend", err);
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
