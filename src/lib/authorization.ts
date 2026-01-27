import { prisma } from "./prisma";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function isOwnerEmailForSection({
  sectionId,
  email,
}: {
  sectionId: string;
  email: string;
}): Promise<boolean> {
  const owner = await prisma.onboardingSectionOwner.findUnique({
    where: {
      sectionId_ownerEmail: { sectionId, ownerEmail: email },
    },
  });
  return owner !== null;
}

export async function assertCanAccessSection({
  sectionId,
  email,
}: {
  sectionId: string;
  email: string;
}): Promise<void> {
  const owners = await prisma.onboardingSectionOwner.findMany({
    where: { sectionId },
  });

  // If no owners, anyone can access
  if (owners.length === 0) {
    return;
  }

  // Check if user is an owner
  const isOwner = owners.some((o) => o.ownerEmail === email);
  if (!isOwner) {
    throw new AuthorizationError("You do not have access to this section");
  }
}

export async function assertCanManageOwners({
  sectionId,
  email,
}: {
  sectionId: string;
  email: string;
}): Promise<void> {
  const owners = await prisma.onboardingSectionOwner.findMany({
    where: { sectionId },
  });

  // If no owners exist, anyone can manage (first owner claim)
  if (owners.length === 0) {
    return;
  }

  // Otherwise, only existing owners can manage
  const isOwner = owners.some((o) => o.ownerEmail === email);
  if (!isOwner) {
    throw new AuthorizationError("Only owners can manage section owners");
  }
}
