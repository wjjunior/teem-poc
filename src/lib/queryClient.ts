import { QueryClient } from "@tanstack/react-query";
import { CACHE_TIME } from "./constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME.STALE_TIME, // 5 minutes
      gcTime: CACHE_TIME.GC_TIME, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  sections: ["sections"] as const,
  submission: (sectionKey: string) => ["submission", sectionKey] as const,
  owners: (sectionKey: string) => ["owners", sectionKey] as const,
};
