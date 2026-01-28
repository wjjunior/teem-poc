"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import OnboardingAccordion from "./OnboardingAccordion";
import { useSections } from "@/hooks/useSections";
import { useSubmissionStatus } from "@/hooks/useSubmissionStatus";
import { queryKeys } from "@/lib/queryClient";
import { ProgressBar, CheckBadgeIcon, Button } from "./ui";

interface OnboardingContentProps {
  userEmail: string;
}

function GettingStartedCard({ progress }: { progress: number }) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <CheckBadgeIcon />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            Getting Started
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete the onboarding information below so we can get everything
            up and running for your practice and future Team Member.
          </p>
          <div className="mt-4">
            <ProgressBar value={progress} />
          </div>
        </div>
      </div>
    </div>
  );
}

function UserHeader({
  email,
  onSwitchUser,
}: {
  email: string;
  onSwitchUser: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Logged in as <span className="font-medium text-gray-700">{email}</span>
      </p>
      <Button variant="secondary" size="sm" onClick={onSwitchUser}>
        Switch user
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="text-gray-500">Loading sections...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-red-600">Failed to load sections</p>
    </div>
  );
}

export default function OnboardingContent({
  userEmail,
}: OnboardingContentProps) {
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
    queryClient.invalidateQueries({
      queryKey: queryKeys.submission(sectionKey),
    });
  }

  function handleSwitchUser() {
    queryClient.clear();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <UserHeader email={userEmail} onSwitchUser={handleSwitchUser} />
        <GettingStartedCard progress={progress} />

        {isLoading && <LoadingState />}
        {error && <ErrorState />}
        {!isLoading && !error && (
          <OnboardingAccordion
            sections={sections}
            onSectionSave={handleSectionSave}
          />
        )}
      </div>
    </div>
  );
}
