import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getCloudEnv,
  refreshSession,
  sessionCookieOptions,
} from "@/lib/server/auth";

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
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const authenticated = await refreshSession(env, token);
    const response = NextResponse.json({
      cloud: true,
      pinRequired: !authenticated,
      authenticated,
    });

    // Скользящая сессия: каждый запуск приложения продлевает cookie на 400 дней.
    if (authenticated && token) {
      response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    }
    return response;
  } catch {
    return NextResponse.json({
      cloud: true,
      pinRequired: true,
      authenticated: false,
      error: "storage_unavailable",
    });
  }
}
