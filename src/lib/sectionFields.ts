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

export const sectionMeta: Record<string, { description: string; deadline: string }> = {
  company: {
    description: "In this step, we'll collect basic information to help you get started.",
    deadline: "Section must be completed by the Welcome Call",
  },
  billing: {
    description: "Set up billing information for your account.",
    deadline: "Section must be completed before first invoice",
  },
  team: {
    description: "Set up the team members who will support your organization.",
    deadline: "Section need to be finalized prior to the start date",
  },
  security: {
    description: "Configure security settings and acknowledge required policies.",
    deadline: "Section must be completed by the start date",
  },
};

export type SectionKey = keyof typeof sectionFields;
