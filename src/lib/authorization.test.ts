import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AuthorizationError,
  isOwnerEmailForSection,
  assertCanAccessSection,
  assertCanManageOwners,
} from "./authorization";

// Mock prisma
vi.mock("./prisma", () => ({
  prisma: {
    onboardingSectionOwner: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "./prisma";

const mockFindUnique = vi.mocked(prisma.onboardingSectionOwner.findUnique);
const mockFindMany = vi.mocked(prisma.onboardingSectionOwner.findMany);

describe("authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isOwnerEmailForSection", () => {
    it("returns true when user is owner", async () => {
      mockFindUnique.mockResolvedValue({
        id: "1",
        sectionId: "section-1",
        ownerEmail: "owner@test.com",
        createdAt: new Date(),
      });

      const result = await isOwnerEmailForSection({
        sectionId: "section-1",
        email: "owner@test.com",
      });

      expect(result).toBe(true);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          sectionId_ownerEmail: {
            sectionId: "section-1",
            ownerEmail: "owner@test.com",
          },
        },
      });
    });

    it("returns false when user is not owner", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await isOwnerEmailForSection({
        sectionId: "section-1",
        email: "notowner@test.com",
      });

      expect(result).toBe(false);
    });
  });

  describe("assertCanAccessSection", () => {
    it("allows access when no owners exist", async () => {
      mockFindMany.mockResolvedValue([]);

      await expect(
        assertCanAccessSection({ sectionId: "section-1", email: "anyone@test.com" })
      ).resolves.toBeUndefined();
    });

    it("allows access when user is owner", async () => {
      mockFindMany.mockResolvedValue([
        { id: "1", sectionId: "section-1", ownerEmail: "owner@test.com", createdAt: new Date() },
      ]);

      await expect(
        assertCanAccessSection({ sectionId: "section-1", email: "owner@test.com" })
      ).resolves.toBeUndefined();
    });

    it("throws AuthorizationError when user is not owner", async () => {
      mockFindMany.mockResolvedValue([
        { id: "1", sectionId: "section-1", ownerEmail: "owner@test.com", createdAt: new Date() },
      ]);

      await expect(
        assertCanAccessSection({ sectionId: "section-1", email: "notowner@test.com" })
      ).rejects.toThrow(AuthorizationError);

      await expect(
        assertCanAccessSection({ sectionId: "section-1", email: "notowner@test.com" })
      ).rejects.toThrow("You do not have access to this section");
    });
  });

  describe("assertCanManageOwners", () => {
    it("allows anyone to manage when no owners exist (first claim)", async () => {
      mockFindMany.mockResolvedValue([]);

      await expect(
        assertCanManageOwners({ sectionId: "section-1", email: "anyone@test.com" })
      ).resolves.toBeUndefined();
    });

    it("allows owner to manage owners", async () => {
      mockFindMany.mockResolvedValue([
        { id: "1", sectionId: "section-1", ownerEmail: "owner@test.com", createdAt: new Date() },
      ]);

      await expect(
        assertCanManageOwners({ sectionId: "section-1", email: "owner@test.com" })
      ).resolves.toBeUndefined();
    });

    it("throws AuthorizationError when non-owner tries to manage", async () => {
      mockFindMany.mockResolvedValue([
        { id: "1", sectionId: "section-1", ownerEmail: "owner@test.com", createdAt: new Date() },
      ]);

      await expect(
        assertCanManageOwners({ sectionId: "section-1", email: "notowner@test.com" })
      ).rejects.toThrow(AuthorizationError);

      await expect(
        assertCanManageOwners({ sectionId: "section-1", email: "notowner@test.com" })
      ).rejects.toThrow("Only owners can manage section owners");
    });

    it("AuthorizationError has correct statusCode", async () => {
      mockFindMany.mockResolvedValue([
        { id: "1", sectionId: "section-1", ownerEmail: "owner@test.com", createdAt: new Date() },
      ]);

      try {
        await assertCanManageOwners({ sectionId: "section-1", email: "notowner@test.com" });
      } catch (e) {
        expect(e).toBeInstanceOf(AuthorizationError);
        expect((e as AuthorizationError).statusCode).toBe(403);
      }
    });
  });
});
