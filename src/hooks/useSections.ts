import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import type { Section } from "@/components/OnboardingAccordion";

async function fetchSections(): Promise<Section[]> {
  const response = await fetch("/api/sections");
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
