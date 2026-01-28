"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import OnboardingAccordion, { Section } from "./OnboardingAccordion";

interface OnboardingContentProps {
  userEmail: string;
}

interface SubmissionStatus {
  [key: string]: boolean;
}

export default function OnboardingContent({ userEmail }: OnboardingContentProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchSections = useCallback(async () => {
    try {
      const response = await fetch("/api/sections");
      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }
      const data = await response.json();
      setSections(data);

      // Check submission status for each section the user owns
      const status: SubmissionStatus = {};
      for (const section of data) {
        if (section.isOwner) {
          try {
            const subResponse = await fetch(`/api/sections/${section.key}/submission`);
            if (subResponse.ok) {
              const subData = await subResponse.json();
              status[section.key] = subData.data !== null && Object.keys(subData.data).length > 0;
            }
          } catch {
            status[section.key] = false;
          }
        }
      }
      setSubmissionStatus(status);
    } catch {
      setError("Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleSectionSave = useCallback((sectionKey: string) => {
    setSubmissionStatus((prev) => ({ ...prev, [sectionKey]: true }));
  }, []);

  const progress = useMemo(() => {
    if (sections.length === 0) return 0;
    const completed = Object.values(submissionStatus).filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  }, [sections, submissionStatus]);

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
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    return <OnboardingAccordion sections={sections} onRefresh={fetchSections} onSectionSave={handleSectionSave} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header with Switch User */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Logged in as <span className="font-medium text-gray-700">{userEmail}</span></p>
          <button
            onClick={handleSwitchUser}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            Switch user
          </button>
        </div>

        {/* Getting Started Card */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Getting Started</h1>
              <p className="mt-1 text-sm text-gray-500">
                Complete the onboarding information below so we can get everything up and running for your practice and future Team Member.
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="ml-3 font-medium text-gray-700">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {renderContent()}
      </div>
    </div>
  );
}
