import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockUserEmail } from "@/lib/mockUser";

export async function GET() {
  const email = await getMockUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sections = await prisma.onboardingSection.findMany({
    orderBy: { createdAt: "asc" },
    include: { owners: true },
  });

  const response = sections.map((section) => ({
    key: section.key,
    title: section.title,
    owners: section.owners.map((o) => o.ownerEmail),
    isOwner:
      section.owners.length === 0 ||
      section.owners.some((o) => o.ownerEmail === email),
  }));

  return NextResponse.json(response);
}
