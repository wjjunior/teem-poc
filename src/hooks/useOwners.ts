import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { endpoints, api } from "@/lib/api";

async function addOwner(sectionKey: string, email: string): Promise<void> {
  const response = await api.post(endpoints.owners(sectionKey), { email });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to add owner");
  }
}

async function removeOwner(sectionKey: string, email: string): Promise<void> {
  const response = await api.delete(endpoints.owners(sectionKey), { email });

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
