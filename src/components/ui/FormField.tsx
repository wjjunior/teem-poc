import type { FieldConfig } from "@/types";

interface FormFieldProps {
  field: FieldConfig;
  value: string | number | boolean;
  onChange: (name: string, value: string | number | boolean) => void;
  id: string;
}

export default function FormField({ field, value, onChange, id }: FormFieldProps) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">{field.label}</span>
      </label>
    );
  }

  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {field.label}
      </label>
      <input
        id={id}
        type={field.type}
        value={(value as string | number) ?? ""}
        onChange={(e) =>
          onChange(
            field.name,
            field.type === "number" ? Number(e.target.value) : e.target.value
          )
        }
        placeholder={field.placeholder}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </>
  );
}
