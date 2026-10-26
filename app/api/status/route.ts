import { NextResponse } from "next/server";
import { getCloudEnv, isAuthenticated } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const env = getCloudEnv();

  if (!env) {
    return NextResponse.json({
      cloud: false,
      pinRequired: false,
      authenticated: true,
    });
  }

  try {
    const authenticated = await isAuthenticated(env);
    return NextResponse.json({
      cloud: true,
      pinRequired: !authenticated,
      authenticated,
    });
  } catch {
    return NextResponse.json({
      cloud: true,
      pinRequired: true,
      authenticated: false,
      error: "storage_unavailable",
    });
  }
}
