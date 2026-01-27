import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMockUserEmail } from "@/lib/mockUser";
import { assertCanAccessSection, AuthorizationError } from "@/lib/authorization";

type RouteContext = { params: Promise<{ sectionKey: string }> };

const submissionSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

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
    where: { sectionId: section.id },
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
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data format", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const submission = await prisma.onboardingSectionSubmission.upsert({
    where: { sectionId: section.id },
    create: {
      sectionId: section.id,
      data: parsed.data.data as Prisma.InputJsonValue,
    },
    update: {
      data: parsed.data.data as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ data: submission.data });
}
