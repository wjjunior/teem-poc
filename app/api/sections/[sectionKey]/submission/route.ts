import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  const { sectionKey } = await params;
  return NextResponse.json({ 
    message: "Section submission endpoint",
    sectionKey 
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  const { sectionKey } = await params;
  return NextResponse.json({ 
    message: "Section submission endpoint",
    sectionKey 
  });
}
