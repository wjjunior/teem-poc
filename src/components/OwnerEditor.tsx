"use client";

import { useState, type SubmitEventHandler } from "react";
import { useAddOwner, useRemoveOwner } from "@/hooks/useOwners";
import { Alert, Button, OwnerList } from "./ui";

interface OwnerEditorProps {
  sectionKey: string;
  owners: string[];
  canManage: boolean;
}

export default function OwnerEditor({
  sectionKey,
  owners,
  canManage,
}: OwnerEditorProps) {
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const addOwnerMutation = useAddOwner(sectionKey);
  const removeOwnerMutation = useRemoveOwner(sectionKey);

  const isAdding = addOwnerMutation.isPending;
  const isRemoving = removeOwnerMutation.isPending;
  const error = addOwnerMutation.error || removeOwnerMutation.error;

  const handleAddOwner: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!newOwnerEmail.trim()) return;

    addOwnerMutation.mutate(newOwnerEmail, {
      onSuccess: () => setNewOwnerEmail(""),
    });
  };

  const handleRemoveOwner = (email: string) => {
    setRemovingEmail(email);
    removeOwnerMutation.mutate(email, {
      onSettled: () => setRemovingEmail(null),
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">Owners:</div>

      <OwnerList
        owners={owners}
        onRemove={canManage ? handleRemoveOwner : undefined}
        removingEmail={isRemoving ? removingEmail : null}
      />

      {canManage && (
        <form onSubmit={handleAddOwner} className="flex gap-2">
          <input
            type="email"
            value={newOwnerEmail}
            onChange={(e) => setNewOwnerEmail(e.target.value)}
            placeholder="owner@example.com"
            disabled={isAdding || isRemoving}
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isAdding || isRemoving || !newOwnerEmail.trim()}
          >
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </form>
      )}

      {error && <Alert variant="error">{error.message}</Alert>}
    </div>
  );
}
