"use client";

import OwnerEditor from "./OwnerEditor";
import SectionForm from "./SectionForm";
import { sectionFields, sectionMeta, SectionKey } from "@/lib/sectionFields";

export interface Section {
  key: string;
  title: string;
  owners: string[];
  isOwner: boolean;
}

interface OnboardingAccordionProps {
  sections: Section[];
  onRefresh: () => void;
  onSectionSave?: (sectionKey: string) => void;
}

function SectionIcon({ sectionKey }: { sectionKey: string }) {
  const icons: Record<string, React.ReactNode> = {
    company: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    billing: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    team: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    security: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  };

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
      {icons[sectionKey] || icons.company}
    </div>
  );
}

function OwnerIcon({ count }: { count: number }) {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
          {count}
        </span>
      )}
    </div>
  );
}

export default function OnboardingAccordion({
  sections,
  onRefresh,
  onSectionSave,
}: OnboardingAccordionProps) {
  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const fields = sectionFields[section.key as SectionKey];
        const meta = sectionMeta[section.key];

        return (
          <details
            key={section.key}
            className="group rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <summary
              className={`flex cursor-pointer items-center gap-4 p-5 ${
                section.isOwner ? "" : "cursor-not-allowed opacity-60"
              }`}
              onClick={(e) => {
                if (!section.isOwner) {
                  e.preventDefault();
                }
              }}
            >
              <SectionIcon sectionKey={section.key} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-blue-600">
                    {section.title}
                  </h3>
                  {!section.isOwner && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Locked
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {meta?.description}
                </p>
                {meta?.deadline && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {meta.deadline}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <OwnerIcon count={section.owners.length} />
                <svg
                  className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </summary>

            <div className="border-t border-gray-100 px-5 py-4">
              {section.isOwner ? (
                <>
                  <OwnerEditor
                    sectionKey={section.key}
                    owners={section.owners}
                    canManage={true}
                    onOwnersChange={onRefresh}
                  />

                  {fields && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <SectionForm sectionKey={section.key} fields={[...fields]} onSave={() => onSectionSave?.(section.key)} />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  You don&apos;t have access to this section. Contact an owner to request access.
                </p>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
