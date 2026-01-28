export interface Section {
  key: string;
  title: string;
  owners: string[];
  isOwner: boolean;
}

export interface SectionMeta {
  description: string;
  deadline: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "checkbox";
  placeholder?: string;
}

export type FormData = Record<string, string | number | boolean>;

export type SectionKey = "company" | "billing" | "team" | "security";
