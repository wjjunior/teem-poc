type AlertVariant = "success" | "error";

interface AlertProps {
  children: React.ReactNode;
  variant: AlertVariant;
}

const variantStyles: Record<AlertVariant, string> = {
  success: "bg-green-50 text-green-600",
  error: "bg-red-50 text-red-600",
};

export default function Alert({ children, variant }: AlertProps) {
  return (
    <p className={`rounded p-2 text-sm ${variantStyles[variant]}`}>
      {children}
    </p>
  );
}
