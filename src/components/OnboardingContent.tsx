"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardingAccordion, { Section } from "./OnboardingAccordion";

interface OnboardingContentProps {
  userEmail: string;
}

export default function OnboardingContent({ userEmail }: OnboardingContentProps) {
  const [sections, setSections] = useState<Section[]>([]);
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
    } catch {
      setError("Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  function handleSwitchUser() {
    router.push("/login");
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">Loading sections...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    return <OnboardingAccordion sections={sections} onRefresh={fetchSections} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
            <p className="text-sm text-gray-600">Logged in as {userEmail}</p>
          </div>
          <button
            onClick={handleSwitchUser}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Switch user
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
