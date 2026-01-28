interface OwnerListProps {
  owners: string[];
  onRemove?: (email: string) => void;
  isLoading?: boolean;
}

export default function OwnerList({ owners, onRemove, isLoading }: OwnerListProps) {
  if (owners.length === 0) {
    return <p className="text-sm text-gray-500 italic">No owners assigned</p>;
  }

  return (
    <ul className="space-y-1">
      {owners.map((email) => (
        <li
          key={email}
          className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
        >
          <span className="text-gray-900">{email}</span>
          {onRemove && (
            <button
              onClick={() => onRemove(email)}
              disabled={isLoading}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
