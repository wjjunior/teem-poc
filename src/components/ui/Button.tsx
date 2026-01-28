type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded ${variantStyles[variant]} ${sizeStyles[size]} disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
