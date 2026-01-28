"use client";

import { useState, type SubmitEventHandler } from "react";
import { useSubmission, useUpdateSubmission } from "@/hooks/useSubmission";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "checkbox";
  placeholder?: string;
}

interface SectionFormProps {
  sectionKey: string;
  fields: FieldConfig[];
  onSave?: () => void;
}

type FormData = Record<string, string | number | boolean>;

export default function SectionForm({ sectionKey, fields, onSave }: SectionFormProps) {
  const [localChanges, setLocalChanges] = useState<FormData>({});
  const [success, setSuccess] = useState("");

  const { data: savedData, isLoading } = useSubmission(sectionKey);
  const updateMutation = useUpdateSubmission(sectionKey);

  // Merge saved data with local changes (local changes take priority)
  const formData: FormData = { ...savedData, ...localChanges };

  function handleChange(name: string, value: string | number | boolean) {
    setLocalChanges((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData, {
      onSuccess: () => {
        setLocalChanges({});
        setSuccess("Saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
        onSave?.();
      },
    });
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          {field.type === "checkbox" ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
              </span>
            </label>
          ) : (
            <>
              <label
                htmlFor={`${sectionKey}-${field.name}`}
                className="block text-sm font-medium text-gray-700"
              >
                {field.label}
              </label>
              <input
                id={`${sectionKey}-${field.name}`}
                type={field.type}
                value={(formData[field.name] as string | number) ?? ""}
                onChange={(e) =>
                  handleChange(
                    field.name,
                    field.type === "number" ? Number(e.target.value) : e.target.value
                  )
                }
                placeholder={field.placeholder}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </>
          )}
        </div>
      ))}

      {updateMutation.error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-600">
          {updateMutation.error.message}
        </p>
      )}

      {success && (
        <p className="rounded bg-green-50 p-2 text-sm text-green-600">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={updateMutation.isPending}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {updateMutation.isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
