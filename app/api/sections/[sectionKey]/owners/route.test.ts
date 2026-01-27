import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "./route";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    onboardingSection: {
      findUnique: vi.fn(),
    },
    onboardingSectionOwner: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/mockUser", () => ({
  getMockUserEmail: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({
  assertCanManageOwners: vi.fn(),
  AuthorizationError: class AuthorizationError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 403) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

import { prisma } from "@/lib/prisma";
import { getMockUserEmail } from "@/lib/mockUser";
import { assertCanManageOwners, AuthorizationError } from "@/lib/authorization";

const mockGetMockUserEmail = vi.mocked(getMockUserEmail);
const mockFindUnique = vi.mocked(prisma.onboardingSection.findUnique);
const mockOwnerFindMany = vi.mocked(prisma.onboardingSectionOwner.findMany);
const mockOwnerCreate = vi.mocked(prisma.onboardingSectionOwner.create);
const mockOwnerDeleteMany = vi.mocked(prisma.onboardingSectionOwner.deleteMany);
const mockAssertCanManageOwners = vi.mocked(assertCanManageOwners);

function createRequest(body: object): Request {
  return new Request("http://localhost/api/sections/company/owners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockParams = { params: Promise.resolve({ sectionKey: "company" }) };

describe("GET /api/sections/[sectionKey]/owners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetMockUserEmail.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), mockParams);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 404 when section not found", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockFindUnique.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), mockParams);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Section not found");
  });

  it("returns list of owner emails", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockFindUnique.mockResolvedValue({ id: "1", key: "company", title: "Company", createdAt: new Date() });
    mockOwnerFindMany.mockResolvedValue([
      { id: "o1", sectionId: "1", ownerEmail: "owner1@test.com", createdAt: new Date() },
      { id: "o2", sectionId: "1", ownerEmail: "owner2@test.com", createdAt: new Date() },
    ]);

    const response = await GET(new Request("http://localhost"), mockParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(["owner1@test.com", "owner2@test.com"]);
  });
});

describe("POST /api/sections/[sectionKey]/owners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue({ id: "1", key: "company", title: "Company", createdAt: new Date() });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetMockUserEmail.mockResolvedValue(null);

    const response = await POST(createRequest({ email: "new@test.com" }), mockParams);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when email is missing", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockAssertCanManageOwners.mockResolvedValue(undefined);

    const response = await POST(createRequest({}), mockParams);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  it("returns 400 when email format is invalid", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockAssertCanManageOwners.mockResolvedValue(undefined);

    const response = await POST(createRequest({ email: "invalid-email" }), mockParams);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
  });

  it("returns 403 when user cannot manage owners", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockAssertCanManageOwners.mockRejectedValue(new AuthorizationError("Only owners can manage section owners"));

    const response = await POST(createRequest({ email: "new@test.com" }), mockParams);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Only owners can manage section owners");
  });

  it("returns 409 when owner already exists", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockAssertCanManageOwners.mockResolvedValue(undefined);
    mockOwnerCreate.mockRejectedValue({ code: "P2002" });

    const response = await POST(createRequest({ email: "existing@test.com" }), mockParams);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Owner already exists");
  });

  it("creates owner successfully", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockAssertCanManageOwners.mockResolvedValue(undefined);
    mockOwnerCreate.mockResolvedValue({
      id: "o1",
      sectionId: "1",
      ownerEmail: "new@test.com",
      createdAt: new Date(),
    });

    const response = await POST(createRequest({ email: "new@test.com" }), mockParams);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.ok).toBe(true);
    expect(mockOwnerCreate).toHaveBeenCalledWith({
      data: { sectionId: "1", ownerEmail: "new@test.com" },
    });
  });
});

describe("DELETE /api/sections/[sectionKey]/owners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue({ id: "1", key: "company", title: "Company", createdAt: new Date() });
  });

  it("returns 403 when user cannot manage owners", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockAssertCanManageOwners.mockRejectedValue(new AuthorizationError("Only owners can manage section owners"));

    const request = new Request("http://localhost", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner@test.com" }),
    });

    const response = await DELETE(request, mockParams);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Only owners can manage section owners");
  });

  it("deletes owner successfully", async () => {
    mockGetMockUserEmail.mockResolvedValue("owner@test.com");
    mockAssertCanManageOwners.mockResolvedValue(undefined);
    mockOwnerDeleteMany.mockResolvedValue({ count: 1 });

    const request = new Request("http://localhost", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner@test.com" }),
    });

    const response = await DELETE(request, mockParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockOwnerDeleteMany).toHaveBeenCalledWith({
      where: { sectionId: "1", ownerEmail: "owner@test.com" },
    });
  });
});
