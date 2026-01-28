"use client";

import OwnerEditor from "./OwnerEditor";
import SectionForm from "./SectionForm";
import { sectionFields, sectionMeta } from "@/lib/sectionFields";
import {
  Badge,
  ClockIcon,
  ChevronRightIcon,
  UserIcon,
  sectionIcons,
} from "./ui";
import type { Section, SectionKey } from "@/types";

export type { Section } from "@/types";

interface OnboardingAccordionProps {
  sections: Section[];
  onSectionSave?: (sectionKey: string) => void;
}

function SectionIcon({ sectionKey }: { sectionKey: string }) {
  const IconComponent =
    sectionIcons[sectionKey as SectionKey] ?? sectionIcons.company;

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
      <IconComponent />
    </div>
  );
}

function OwnerBadge({
  count,
  owners,
}: {
  count: number;
  owners: string[];
}) {
  return (
    <div className="group/badge relative flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
      <UserIcon />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
          {count}
        </span>
      )}
      {owners.length > 0 && (
        <div className="invisible absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-all duration-200 group-hover/badge:visible group-hover/badge:opacity-100">
          <p className="mb-1.5 font-medium">Owners:</p>
          <ul className="space-y-1">
            {owners.map((email) => (
              <li key={email} className="flex items-center gap-1.5">
                <UserIcon className="h-3 w-3" />
                {email}
              </li>
            ))}
          </ul>
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ section }: { section: Section }) {
  const meta = sectionMeta[section.key as SectionKey];

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-blue-600">{section.title}</h3>
        {!section.isOwner && <Badge variant="warning">Locked</Badge>}
      </div>
      {meta && (
        <>
          <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <ClockIcon />
              {meta.deadline}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function SectionContent({
  section,
  onSectionSave,
}: {
  section: Section;
  onSectionSave?: (key: string) => void;
}) {
  if (!section.isOwner) {
    return (
      <p className="text-sm text-gray-500">
        You don&apos;t have access to this section. Contact an owner to request
        access.
      </p>
    );
  }

  const fields = sectionFields[section.key as SectionKey];

  return (
    <>
      <OwnerEditor
        sectionKey={section.key}
        owners={section.owners}
        canManage={true}
      />
      {fields && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <SectionForm
            sectionKey={section.key}
            fields={fields}
            onSave={() => onSectionSave?.(section.key)}
          />
        </div>
      )}
    </>
  );
}

export default function OnboardingAccordion({
  sections,
  onSectionSave,
}: OnboardingAccordionProps) {
  return (
    <div className="space-y-3">
      {sections.map((section) => (
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
            <SectionHeader section={section} />
            <div className="flex items-center gap-3">
              <OwnerBadge count={section.owners.length} owners={section.owners} />
              <ChevronRightIcon className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-90" />
            </div>
          </summary>

          <div className="border-t border-gray-100 px-5 py-4">
            <SectionContent section={section} onSectionSave={onSectionSave} />
          </div>
        </details>
      ))}
    </div>
  );
}
