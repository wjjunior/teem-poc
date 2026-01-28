interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value, showLabel = true }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="ml-3 font-medium text-gray-700">{value}%</span>
      )}
    </div>
  );
}
