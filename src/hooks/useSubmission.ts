import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

type SubmissionData = Record<string, string | number | boolean>;

interface SubmissionResponse {
  data: SubmissionData | null;
}

async function fetchSubmission(sectionKey: string): Promise<SubmissionData | null> {
  const response = await fetch(`/api/sections/${sectionKey}/submission`);
  if (!response.ok) {
    throw new Error("Failed to fetch submission");
  }
  const result: SubmissionResponse = await response.json();
  return result.data;
}

async function updateSubmission(
  sectionKey: string,
  data: SubmissionData
): Promise<SubmissionData> {
  const response = await fetch(`/api/sections/${sectionKey}/submission`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to save");
  }

  return result.data;
}

export function useSubmission(sectionKey: string) {
  return useQuery({
    queryKey: queryKeys.submission(sectionKey),
    queryFn: () => fetchSubmission(sectionKey),
  });
}

export function useUpdateSubmission(sectionKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmissionData) => updateSubmission(sectionKey, data),
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(queryKeys.submission(sectionKey), data);
    },
  });
}
