import { NextResponse } from "next/server";
import { getMockUserEmail } from "./mockUser";
import { AuthorizationError } from "./authorization";

interface AuthenticatedRequest {
  email: string;
  sectionKey?: string;
}

type AuthenticatedHandler = (
  request: Request,
  auth: AuthenticatedRequest
) => Promise<NextResponse>;

type RouteContextWithParams = { params: Promise<{ sectionKey: string }> };
type RouteContextEmpty = { params: Promise<Record<string, never>> };

/**
 * Wraps an API route handler with authentication and error handling.
 * Eliminates the need for repetitive auth checks and try/catch blocks.
 */
export function withAuth(handler: AuthenticatedHandler): (
  request: Request,
  context?: RouteContextEmpty
) => Promise<NextResponse>;

export function withAuth(
  handler: AuthenticatedHandler,
  options: { requireSectionKey: true }
): (request: Request, context: RouteContextWithParams) => Promise<NextResponse>;

export function withAuth(
  handler: AuthenticatedHandler,
  options?: { requireSectionKey?: boolean }
) {
  return async (
    request: Request,
    context?: RouteContextWithParams | RouteContextEmpty
  ): Promise<NextResponse> => {
    const email = await getMockUserEmail();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const auth: AuthenticatedRequest = { email };

      if (options?.requireSectionKey && context) {
        const params = await context.params;
        auth.sectionKey = (params as { sectionKey: string }).sectionKey;
      }

      return await handler(request, auth);
    } catch (e) {
      if (e instanceof AuthorizationError) {
        return NextResponse.json({ error: e.message }, { status: e.statusCode });
      }
      throw e;
    }
  };
}
