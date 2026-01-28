import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/apiHandler";
import { assertCanManageOwners } from "@/lib/authorization";
import { getSectionByKey } from "@/lib/sections";
import { isValidEmail } from "@/lib/validation";

export const GET = withAuth(
  async (_, { sectionKey }) => {
    const section = await getSectionByKey(sectionKey!);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const owners = await prisma.onboardingSectionOwner.findMany({
      where: { sectionId: section.id },
    });

    return NextResponse.json(owners.map((o) => o.ownerEmail));
  },
  { requireSectionKey: true }
);

export const POST = withAuth(
  async (request, { email, sectionKey }) => {
    const section = await getSectionByKey(sectionKey!);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await assertCanManageOwners({ sectionId: section.id, email });

    const body = await request.json();
    const { email: ownerEmail } = body;

    if (!ownerEmail || typeof ownerEmail !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!isValidEmail(ownerEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    try {
      await prisma.onboardingSectionOwner.create({
        data: {
          sectionId: section.id,
          ownerEmail,
        },
      });
    } catch (e: unknown) {
      // Handle unique constraint violation
      if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
        return NextResponse.json(
          { error: "Owner already exists" },
          { status: 409 }
        );
      }
      throw e;
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  },
  { requireSectionKey: true }
);

export const DELETE = withAuth(
  async (request, { email, sectionKey }) => {
    const section = await getSectionByKey(sectionKey!);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await assertCanManageOwners({ sectionId: section.id, email });

    const body = await request.json();
    const { email: ownerEmail } = body;

    if (!ownerEmail || typeof ownerEmail !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await prisma.onboardingSectionOwner.deleteMany({
      where: {
        sectionId: section.id,
        ownerEmail,
      },
    });

    return NextResponse.json({ ok: true });
  },
  { requireSectionKey: true }
);
