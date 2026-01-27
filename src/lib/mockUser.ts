import { cookies } from "next/headers";

export const MOCK_USER_COOKIE = "mock_user_email";

export async function getMockUserEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(MOCK_USER_COOKIE);
  return cookie?.value ?? null;
}
