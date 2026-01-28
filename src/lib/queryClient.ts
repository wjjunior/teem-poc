import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (garbage collection)
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
