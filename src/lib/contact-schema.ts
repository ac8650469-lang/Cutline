import { z } from "zod";
import { services, budgets } from "@/config/services";

export const serviceOptions = [...services.map((s) => s.title), "Something else"];
export const budgetOptions = [...budgets];

/** Shared by the form (client) and the route handler (server). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(100, "That name is a little long."),
  email: z.string().trim().pipe(z.email("That email doesn’t look right.")),
  service: z.string().refine((v) => serviceOptions.includes(v), "Pick the closest service."),
  message: z
    .string()
    .trim()
    .min(20, "A couple of sentences about the project, please (20+ characters).")
    .max(4000, "Keep it under 4,000 characters. We can talk through the rest."),
  budget: z
    .string()
    .optional()
    .refine((v) => !v || budgetOptions.includes(v as (typeof budgetOptions)[number]), "Pick a budget range or leave it blank."),
  /** Honeypot. Humans never see it; anything in it fails validation. */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactField = keyof ContactInput;

export function fieldErrors(error: z.ZodError): Partial<Record<ContactField, string>> {
  const out: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) out[key as ContactField] = issue.message;
  }
  return out;
}
