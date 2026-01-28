import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMockUserEmail } from "@/lib/mockUser";
import { assertCanAccessSection, AuthorizationError } from "@/lib/authorization";
import { validateSectionData } from "@/lib/sectionValidation";

type RouteContext = { params: Promise<{ sectionKey: string }> };

async function getSectionByKey(sectionKey: string) {
  const section = await prisma.onboardingSection.findUnique({
    where: { key: sectionKey },
  });
  return section;
}

export async function GET(request: Request, { params }: RouteContext) {
  const email = await getMockUserEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sectionKey } = await params;
  const section = await getSectionByKey(sectionKey);

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  try {
    await assertCanAccessSection({ sectionId: section.id, email });
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }

  const submission = await prisma.onboardingSectionSubmission.findUnique({
    where: {
      sectionId_userEmail: {
        sectionId: section.id,
        userEmail: email,
      },
    },
  });

  return NextResponse.json({ data: submission?.data ?? null });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const email = await getMockUserEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sectionKey } = await params;
  const section = await getSectionByKey(sectionKey);

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  try {
    await assertCanAccessSection({ sectionId: section.id, email });
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }

  const body = await request.json();

  if (!body.data || typeof body.data !== "object") {
    return NextResponse.json(
      { error: "Invalid data format: 'data' object is required" },
      { status: 400 }
    );
  }

  const validation = validateSectionData(sectionKey, body.data);

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
}
