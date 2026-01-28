import type { FieldConfig, SectionMeta, SectionKey } from "@/types";

export const sectionFields: Record<SectionKey, FieldConfig[]> = {
  company: [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      placeholder: "Acme Inc.",
    },
    {
      name: "website",
      label: "Website",
      type: "text",
      placeholder: "https://example.com",
    },
  ],
  billing: [
    {
      name: "billingEmail",
      label: "Billing Email",
      type: "email",
      placeholder: "billing@example.com",
    },
    {
      name: "vatId",
      label: "VAT ID",
      type: "text",
      placeholder: "XX123456789",
    },
  ],
  team: [
    {
      name: "teamSize",
      label: "Team Size",
      type: "number",
      placeholder: "10",
    },
    {
      name: "mainContact",
      label: "Main Contact Email",
      type: "email",
      placeholder: "contact@example.com",
    },
  ],
  security: [
    {
      name: "enable2FA",
      label: "Enable Two-Factor Authentication",
      type: "checkbox",
    },
    {
      name: "securityContactEmail",
      label: "Security Contact Email",
      type: "email",
      placeholder: "security@example.com",
    },
  ],
};

export const sectionMeta: Record<SectionKey, SectionMeta> = {
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
