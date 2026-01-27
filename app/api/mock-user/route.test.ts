import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock next/headers
const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    set: mockCookieSet,
  })),
}));

function createRequest(body: object): Request {
  return new Request("http://localhost/api/mock-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/mock-user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(createRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  it("returns 400 when email is not a string", async () => {
    const response = await POST(createRequest({ email: 123 }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  it("returns 400 when email format is invalid", async () => {
    const response = await POST(createRequest({ email: "invalid-email" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
  });

  it("returns 400 for email without domain", async () => {
    const response = await POST(createRequest({ email: "user@" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
  });

  it("returns 400 for email without TLD", async () => {
    const response = await POST(createRequest({ email: "user@domain" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
  });

  it("sets cookie and returns ok for valid email", async () => {
    const response = await POST(createRequest({ email: "user@test.com" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockCookieSet).toHaveBeenCalledWith(
      "mock_user_email",
      "user@test.com",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })
    );
  });

  it("accepts email with subdomain", async () => {
    const response = await POST(createRequest({ email: "user@mail.test.com" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("accepts email with plus sign", async () => {
    const response = await POST(createRequest({ email: "user+tag@test.com" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });
});
