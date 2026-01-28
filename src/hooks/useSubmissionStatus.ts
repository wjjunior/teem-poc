import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import type { Section, FormData } from "@/types";

interface SubmissionResponse {
  data: FormData | null;
}

async function fetchSubmission(sectionKey: string): Promise<FormData | null> {
  const response = await fetch(`/api/sections/${sectionKey}/submission`);
  if (!response.ok) {
    return null;
  }
  const result: SubmissionResponse = await response.json();
  return result.data;
}

export function useSubmissionStatus(sections: Section[]) {
  const ownedSections = sections.filter((s) => s.isOwner);

  const queries = useQueries({
    queries: ownedSections.map((section) => ({
      queryKey: queryKeys.submission(section.key),
      queryFn: () => fetchSubmission(section.key),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const status: Record<string, boolean> = {};
  ownedSections.forEach((section, index) => {
    const data = queries[index].data;
    status[section.key] = data !== null && data !== undefined && Object.keys(data).length > 0;
  });

  const isLoading = queries.some((q) => q.isLoading);

  return { status, isLoading };
}
