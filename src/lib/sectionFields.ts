export const sectionFields = {
  company: [
    {
      name: "companyName",
      label: "Company Name",
      type: "text" as const,
      placeholder: "Acme Inc.",
    },
    {
      name: "website",
      label: "Website",
      type: "text" as const,
      placeholder: "https://example.com",
    },
  ],
  billing: [
    {
      name: "billingEmail",
      label: "Billing Email",
      type: "email" as const,
      placeholder: "billing@example.com",
    },
    {
      name: "vatId",
      label: "VAT ID",
      type: "text" as const,
      placeholder: "XX123456789",
    },
  ],
  team: [
    {
      name: "teamSize",
      label: "Team Size",
      type: "number" as const,
      placeholder: "10",
    },
    {
      name: "mainContact",
      label: "Main Contact Email",
      type: "email" as const,
      placeholder: "contact@example.com",
    },
  ],
  security: [
    {
      name: "enable2FA",
      label: "Enable Two-Factor Authentication",
      type: "checkbox" as const,
    },
    {
      name: "securityContactEmail",
      label: "Security Contact Email",
      type: "email" as const,
      placeholder: "security@example.com",
    },
  ],
} as const;

export type SectionKey = keyof typeof sectionFields;
