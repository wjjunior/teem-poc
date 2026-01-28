import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { CACHE_TIME } from "@/lib/constants";
import { fetchSubmission } from "@/lib/submissionApi";
import type { Section } from "@/types";

export function useSubmissionStatus(sections: Section[]) {
  const ownedSections = sections.filter((s) => s.isOwner);

  const queries = useQueries({
    queries: ownedSections.map((section) => ({
      queryKey: queryKeys.submission(section.key),
      queryFn: () => fetchSubmission(section.key),
      staleTime: CACHE_TIME.STALE_TIME,
    })),
  });

  const status: Record<string, boolean> = {};
  ownedSections.forEach((section, index) => {
    const data = queries[index].data;
    status[section.key] =
      data !== null && data !== undefined && Object.keys(data).length > 0;
  });

  const isLoading = queries.some((q) => q.isLoading);

  return { status, isLoading };
}
