"use client";

import { useState, type SubmitEventHandler } from "react";
import { useSubmission, useUpdateSubmission } from "@/hooks/useSubmission";
import { Alert, Button, FormField } from "./ui";
import { UI_TIMING } from "@/lib/constants";
import type { FieldConfig, FormData } from "@/types";

interface SectionFormProps {
  sectionKey: string;
  fields: FieldConfig[];
  onSave?: () => void;
}

export default function SectionForm({ sectionKey, fields, onSave }: SectionFormProps) {
  const [localChanges, setLocalChanges] = useState<FormData>({});
  const [success, setSuccess] = useState("");

  const { data: savedData, isLoading } = useSubmission(sectionKey);
  const updateMutation = useUpdateSubmission(sectionKey);

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
        setTimeout(() => setSuccess(""), UI_TIMING.SUCCESS_MESSAGE_DURATION); // 3 seconds
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
          <FormField
            field={field}
            value={formData[field.name] ?? ""}
            onChange={handleChange}
            id={`${sectionKey}-${field.name}`}
          />
        </div>
      ))}

      {updateMutation.error && (
        <Alert variant="error">{updateMutation.error.message}</Alert>
      )}

      {success && <Alert variant="success">{success}</Alert>}

      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
