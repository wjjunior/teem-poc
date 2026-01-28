import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockUserEmail } from "@/lib/mockUser";
import { assertCanManageOwners, AuthorizationError } from "@/lib/authorization";
import { getSectionByKey } from "@/lib/sections";
import { isValidEmail } from "@/lib/validation";

type RouteContext = { params: Promise<{ sectionKey: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  const email = await getMockUserEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sectionKey } = await params;
  const section = await getSectionByKey(sectionKey);

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const owners = await prisma.onboardingSectionOwner.findMany({
    where: { sectionId: section.id },
  });

  return NextResponse.json(owners.map((o) => o.ownerEmail));
}

export async function POST(request: Request, { params }: RouteContext) {
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
    await assertCanManageOwners({ sectionId: section.id, email });
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }

  const body = await request.json();
  const { email: ownerEmail } = body;

  if (!ownerEmail || typeof ownerEmail !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!isValidEmail(ownerEmail)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 },
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
        { status: 409 },
      );
    }
    throw e;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteContext) {
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
    await assertCanManageOwners({ sectionId: section.id, email });
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }

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
}
