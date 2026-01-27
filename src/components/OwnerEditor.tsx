"use client";

import { useState } from "react";

interface OwnerEditorProps {
  sectionKey: string;
  owners: string[];
  canManage: boolean;
  onOwnersChange: () => void;
}

export default function OwnerEditor({
  sectionKey,
  owners,
  canManage,
  onOwnersChange,
}: OwnerEditorProps) {
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAddOwner(e: React.FormEvent) {
    e.preventDefault();
    if (!newOwnerEmail.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/sections/${sectionKey}/owners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newOwnerEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to add owner");
        return;
      }

      setNewOwnerEmail("");
      onOwnersChange();
    } catch {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveOwner(email: string) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/sections/${sectionKey}/owners`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to remove owner");
        return;
      }

      onOwnersChange();
    } catch {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">Owners:</div>

      {owners.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No owners assigned</p>
      ) : (
        <ul className="space-y-1">
          {owners.map((email) => (
            <li
              key={email}
              className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="text-gray-900">{email}</span>
              {canManage && (
                <button
                  onClick={() => handleRemoveOwner(email)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <form onSubmit={handleAddOwner} className="flex gap-2">
          <input
            type="email"
            value={newOwnerEmail}
            onChange={(e) => setNewOwnerEmail(e.target.value)}
            placeholder="owner@example.com"
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900"
          />
          <button
            type="submit"
            disabled={isLoading || !newOwnerEmail.trim()}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
