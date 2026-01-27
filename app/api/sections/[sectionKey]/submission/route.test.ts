import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "./route";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    onboardingSection: {
      findUnique: vi.fn(),
    },
    onboardingSectionSubmission: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/mockUser", () => ({
  getMockUserEmail: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({
  assertCanAccessSection: vi.fn(),
  AuthorizationError: class AuthorizationError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 403) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

vi.mock("@/lib/sectionValidation", () => ({
  validateSectionData: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getMockUserEmail } from "@/lib/mockUser";
import { assertCanAccessSection, AuthorizationError } from "@/lib/authorization";
import { validateSectionData } from "@/lib/sectionValidation";

const mockGetMockUserEmail = vi.mocked(getMockUserEmail);
const mockFindUnique = vi.mocked(prisma.onboardingSection.findUnique);
const mockSubmissionFindUnique = vi.mocked(prisma.onboardingSectionSubmission.findUnique);
const mockSubmissionUpsert = vi.mocked(prisma.onboardingSectionSubmission.upsert);
const mockAssertCanAccessSection = vi.mocked(assertCanAccessSection);
const mockValidateSectionData = vi.mocked(validateSectionData);

const mockParams = { params: Promise.resolve({ sectionKey: "company" }) };

function createPutRequest(body: object): Request {
  return new Request("http://localhost", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/sections/[sectionKey]/submission", () => {
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

  it("returns 403 when user cannot access section", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockFindUnique.mockResolvedValue({ id: "1", key: "company", title: "Company", createdAt: new Date() });
    mockAssertCanAccessSection.mockRejectedValue(
      new AuthorizationError("You do not have access to this section")
    );

    const response = await GET(new Request("http://localhost"), mockParams);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("You do not have access to this section");
  });

  it("returns null data when no submission exists", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockFindUnique.mockResolvedValue({ id: "1", key: "company", title: "Company", createdAt: new Date() });
    mockAssertCanAccessSection.mockResolvedValue(undefined);
    mockSubmissionFindUnique.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), mockParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ data: null });
  });

  it("returns submission data when exists", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockFindUnique.mockResolvedValue({ id: "1", key: "company", title: "Company", createdAt: new Date() });
    mockAssertCanAccessSection.mockResolvedValue(undefined);
    mockSubmissionFindUnique.mockResolvedValue({
      sectionId: "1",
      data: { companyName: "Acme Inc", website: "https://acme.com" },
      updatedAt: new Date(),
    });

    const response = await GET(new Request("http://localhost"), mockParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      data: { companyName: "Acme Inc", website: "https://acme.com" },
    });
  });
});

describe("PUT /api/sections/[sectionKey]/submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue({ id: "1", key: "company", title: "Company", createdAt: new Date() });
    mockAssertCanAccessSection.mockResolvedValue(undefined);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetMockUserEmail.mockResolvedValue(null);

    const response = await PUT(createPutRequest({ data: {} }), mockParams);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 when user cannot access section", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockAssertCanAccessSection.mockRejectedValue(
      new AuthorizationError("You do not have access to this section")
    );

    const response = await PUT(createPutRequest({ data: {} }), mockParams);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("You do not have access to this section");
  });

  it("returns 400 when data is missing", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");

    const response = await PUT(createPutRequest({}), mockParams);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("data");
  });

  it("returns 400 when validation fails", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockValidateSectionData.mockReturnValue({
      success: false,
      error: "billingEmail: Invalid billing email",
    });

    const response = await PUT(
      createPutRequest({ data: { billingEmail: "invalid" } }),
      mockParams
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("billingEmail: Invalid billing email");
  });

  it("saves submission successfully", async () => {
    mockGetMockUserEmail.mockResolvedValue("user@test.com");
    mockValidateSectionData.mockReturnValue({
      success: true,
      data: { companyName: "Acme Inc", website: "https://acme.com" },
    });
    mockSubmissionUpsert.mockResolvedValue({
      sectionId: "1",
      data: { companyName: "Acme Inc", website: "https://acme.com" },
      updatedAt: new Date(),
    });

    const response = await PUT(
      createPutRequest({ data: { companyName: "Acme Inc", website: "https://acme.com" } }),
      mockParams
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      data: { companyName: "Acme Inc", website: "https://acme.com" },
    });
    expect(mockSubmissionUpsert).toHaveBeenCalledWith({
      where: { sectionId: "1" },
      create: {
        sectionId: "1",
        data: { companyName: "Acme Inc", website: "https://acme.com" },
      },
      update: {
        data: { companyName: "Acme Inc", website: "https://acme.com" },
      },
    });
  });
});
