import { NextRequest, NextResponse } from "next/server";
import { runFacebookSync } from "./syncService";

export async function POST(req: NextRequest) {
  try {
    const { manual } = await req.json().catch(() => ({ manual: false }));
    const result = await runFacebookSync(manual);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Facebook Auto-Sync API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
