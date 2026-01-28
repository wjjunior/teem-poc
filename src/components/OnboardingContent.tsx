"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import OnboardingAccordion from "./OnboardingAccordion";
import { useSections } from "@/hooks/useSections";
import { useSubmissionStatus } from "@/hooks/useSubmissionStatus";
import { queryKeys } from "@/lib/queryClient";

interface OnboardingContentProps {
  userEmail: string;
}

export default function OnboardingContent({ userEmail }: OnboardingContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: sections = [], isLoading, error } = useSections();
  const { status: submissionStatus } = useSubmissionStatus(sections);

  const progress = useMemo(() => {
    if (sections.length === 0) return 0;
    const completed = Object.values(submissionStatus).filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  }, [sections, submissionStatus]);

  function handleSectionSave(sectionKey: string) {
    queryClient.invalidateQueries({ queryKey: queryKeys.submission(sectionKey) });
  }

  function handleSwitchUser() {
    router.push("/login");
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">Loading sections...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">Failed to load sections</p>
        </div>
      );
    }

    return (
      <OnboardingAccordion
        sections={sections}
        onSectionSave={handleSectionSave}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Logged in as{" "}
            <span className="font-medium text-gray-700">{userEmail}</span>
          </p>
          <button
            onClick={handleSwitchUser}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            Switch user
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                Getting Started
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Complete the onboarding information below so we can get
                everything up and running for your practice and future Team
                Member.
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="ml-3 font-medium text-gray-700">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
