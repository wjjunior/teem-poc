import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/apiHandler";
import { assertCanAccessSection } from "@/lib/authorization";
import { validateSectionData } from "@/lib/sectionValidation";
import { getSectionByKey } from "@/lib/sections";

export const GET = withAuth(
  async (_, { email, sectionKey }) => {
    const section = await getSectionByKey(sectionKey!);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await assertCanAccessSection({ sectionId: section.id, email });

    const submission = await prisma.onboardingSectionSubmission.findUnique({
      where: {
        sectionId_userEmail: {
          sectionId: section.id,
          userEmail: email,
        },
      },
    });

    return NextResponse.json({ data: submission?.data ?? null });
  },
  { requireSectionKey: true }
);

export const PUT = withAuth(
  async (request, { email, sectionKey }) => {
    const section = await getSectionByKey(sectionKey!);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await assertCanAccessSection({ sectionId: section.id, email });

    const body = await request.json();

    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json(
        { error: "Invalid data format: 'data' object is required" },
        { status: 400 }
      );
    }

    const validation = validateSectionData(sectionKey!, body.data);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const submission = await prisma.onboardingSectionSubmission.upsert({
      where: {
        sectionId_userEmail: {
          sectionId: section.id,
          userEmail: email,
        },
      },
      create: {
        sectionId: section.id,
        userEmail: email,
        data: validation.data as Prisma.InputJsonValue,
      },
      update: {
        data: validation.data as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ data: submission.data });
  },
  { requireSectionKey: true }
);
