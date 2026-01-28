type BadgeVariant = "warning" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-50 text-blue-700",
};

export default function Badge({ children, variant = "info" }: BadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
