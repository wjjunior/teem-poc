import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Mock user endpoint" });
}

export async function POST() {
  return NextResponse.json({ message: "Mock user endpoint" });
}
