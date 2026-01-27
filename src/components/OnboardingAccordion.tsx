"use client";

import OwnerEditor from "./OwnerEditor";

export interface Section {
  key: string;
  title: string;
  owners: string[];
  isOwner: boolean;
}

interface OnboardingAccordionProps {
  sections: Section[];
  onRefresh: () => void;
}

export default function OnboardingAccordion({
  sections,
  onRefresh,
}: OnboardingAccordionProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <details
          key={section.key}
          className="group rounded-lg border border-gray-200 bg-white"
        >
          <summary
            className={`flex cursor-pointer items-center justify-between p-4 ${
              !section.isOwner ? "cursor-not-allowed opacity-60" : ""
            }`}
            onClick={(e) => {
              if (!section.isOwner) {
                e.preventDefault();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900">
                {section.title}
              </span>
              {!section.isOwner && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  Locked
                </span>
              )}
              {section.owners.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({section.owners.length} owner{section.owners.length !== 1 ? "s" : ""})
                </span>
              )}
            </div>
            <svg
              className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>

          <div className="border-t border-gray-200 p-4">
            <OwnerEditor
              sectionKey={section.key}
              owners={section.owners}
              canManage={section.isOwner}
              onOwnersChange={onRefresh}
            />

            {section.isOwner && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  Form content for {section.title} will go here.
                </p>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
