import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MOCK_USER_COOKIE } from "@/lib/mockUser";
import { isValidEmail } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(MOCK_USER_COOKIE, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({ ok: true });
}
