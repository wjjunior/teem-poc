import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

async function addOwner(sectionKey: string, email: string): Promise<void> {
  const response = await fetch(`/api/sections/${sectionKey}/owners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to add owner");
  }
}

async function removeOwner(sectionKey: string, email: string): Promise<void> {
  const response = await fetch(`/api/sections/${sectionKey}/owners`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to remove owner");
  }
}

export function useAddOwner(sectionKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => addOwner(sectionKey, email),
    onSuccess: () => {
      // Invalidate sections to refresh owners list
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
}

export function useRemoveOwner(sectionKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => removeOwner(sectionKey, email),
    onSuccess: () => {
      // Invalidate sections to refresh owners list
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
}
