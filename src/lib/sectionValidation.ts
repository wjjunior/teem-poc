import { z } from "zod";

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required").optional(),
  website: z
    .string()
    .refine(
      (val) => val === "" || /^https?:\/\/.+\..+/.test(val),
      { message: "Invalid website URL" }
    )
    .optional()
    .or(z.literal("")),
});

const billingSchema = z.object({
  billingEmail: z
    .string()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid billing email" }
    )
    .optional()
    .or(z.literal("")),
  vatId: z.string().optional(),
});

const teamSchema = z.object({
  teamSize: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? Number.parseInt(val, 10) || 0 : val))
    .pipe(z.number().min(0, "Team size must be positive"))
    .optional(),
  mainContact: z
    .string()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid contact email" }
    )
    .optional()
    .or(z.literal("")),
});

const securitySchema = z.object({
  enable2FA: z.boolean().optional(),
  securityContactEmail: z
    .string()
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid security contact email" }
    )
    .optional()
    .or(z.literal("")),
});

export const sectionSchemas: Record<string, z.ZodSchema> = {
  company: companySchema,
  billing: billingSchema,
  team: teamSchema,
  security: securitySchema,
};

export function validateSectionData(
  sectionKey: string,
  data: unknown
): { success: true; data: Record<string, unknown> } | { success: false; error: string } {
  const schema = sectionSchemas[sectionKey];

  if (!schema) {
    // No specific validation, accept any object
    return { success: true, data: data as Record<string, unknown> };
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const path = firstIssue.path.join(".");
    return {
      success: false,
      error: path ? `${path}: ${firstIssue.message}` : firstIssue.message,
    };
  }

  return { success: true, data: result.data as Record<string, unknown> };
}
