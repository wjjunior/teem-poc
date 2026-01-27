import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    onboardingSection: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/mockUser", () => ({
  getMockUserEmail: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getMockUserEmail } from "@/lib/mockUser";

const mockGetMockUserEmail = vi.mocked(getMockUserEmail);
const mockFindMany = vi.mocked(prisma.onboardingSection.findMany);

describe("GET /api/sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetMockUserEmail.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns sections with isOwner=true when no owners", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockFindMany.mockResolvedValue([
      {
        id: "1",
        key: "company",
        title: "Company Information",
        createdAt: new Date(),
        owners: [],
      },
    ] as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      key: "company",
      title: "Company Information",
      owners: [],
      isOwner: true,
    });
  });

  it("returns isOwner=true when user is owner", async () => {
    mockGetMockUserEmail.mockResolvedValue("owner@test.com");
    mockFindMany.mockResolvedValue([
      {
        id: "1",
        key: "company",
        title: "Company Information",
        createdAt: new Date(),
        owners: [{ id: "o1", sectionId: "1", ownerEmail: "owner@test.com", createdAt: new Date() }],
      },
    ] as never);

    const response = await GET();
    const data = await response.json();

    expect(data[0].isOwner).toBe(true);
    expect(data[0].owners).toEqual(["owner@test.com"]);
  });

  it("returns isOwner=false when user is not owner", async () => {
    mockGetMockUserEmail.mockResolvedValue("other@test.com");
    mockFindMany.mockResolvedValue([
      {
        id: "1",
        key: "company",
        title: "Company Information",
        createdAt: new Date(),
        owners: [{ id: "o1", sectionId: "1", ownerEmail: "owner@test.com", createdAt: new Date() }],
      },
    ] as never);

    const response = await GET();
    const data = await response.json();

    expect(data[0].isOwner).toBe(false);
  });
});
