import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { endpoints, api } from "@/lib/api";
import type { Section } from "@/types";

async function fetchSections(): Promise<Section[]> {
  const response = await api.get(endpoints.sections);
  if (!response.ok) {
    throw new Error("Failed to fetch sections");
  }
  return response.json();
}

export function useSections() {
  return useQuery({
    queryKey: queryKeys.sections,
    queryFn: fetchSections,
  });
}
