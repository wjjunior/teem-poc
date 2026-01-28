import { endpoints, api } from "./api";
import type { FormData } from "@/types";

interface SubmissionResponse {
  data: FormData | null;
}

/**
 * Fetches submission data for a section.
 * Returns null if not found or on error.
 */
export async function fetchSubmission(
  sectionKey: string
): Promise<FormData | null> {
  const response = await api.get(endpoints.submission(sectionKey));
  if (!response.ok) {
    return null;
  }
  const result: SubmissionResponse = await response.json();
  return result.data;
}

/**
 * Fetches submission data for a section.
 * Throws error if request fails.
 */
export async function fetchSubmissionOrThrow(
  sectionKey: string
): Promise<FormData | null> {
  const response = await api.get(endpoints.submission(sectionKey));
  if (!response.ok) {
    throw new Error("Failed to fetch submission");
  }
  const result: SubmissionResponse = await response.json();
  return result.data;
}
