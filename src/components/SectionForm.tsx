"use client";

import { useEffect, useState, useCallback } from "react";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "checkbox";
  placeholder?: string;
}

interface SectionFormProps {
  sectionKey: string;
  fields: FieldConfig[];
}

type FormData = Record<string, string | number | boolean>;

export default function SectionForm({ sectionKey, fields }: SectionFormProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSubmission = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/sections/${sectionKey}/submission`);
      if (!response.ok) {
        throw new Error("Failed to load data");
      }
      const { data } = await response.json();
      if (data) {
        setFormData(data);
      }
    } catch {
      setError("Failed to load saved data");
    } finally {
      setIsLoading(false);
    }
  }, [sectionKey]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  function handleChange(name: string, value: string | number | boolean) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/sections/${sectionKey}/submission`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to save");
        return;
      }

      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setIsSaving(false);
    }
  }

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

      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="rounded bg-green-50 p-2 text-sm text-green-600">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
