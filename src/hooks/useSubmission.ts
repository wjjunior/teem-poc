import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import type { FormData } from "@/types";

interface SubmissionResponse {
  data: FormData | null;
}

async function fetchSubmission(sectionKey: string): Promise<FormData | null> {
  const response = await fetch(`/api/sections/${sectionKey}/submission`);
  if (!response.ok) {
    throw new Error("Failed to fetch submission");
  }
  const result: SubmissionResponse = await response.json();
  return result.data;
}

async function updateSubmission(sectionKey: string, data: FormData): Promise<FormData> {
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
    mutationFn: (data: FormData) => updateSubmission(sectionKey, data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.submission(sectionKey), data);
    },
  });
}
