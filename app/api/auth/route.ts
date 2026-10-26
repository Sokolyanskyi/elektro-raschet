import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPin,
  createSession,
  destroySession,
  getCloudEnv,
  isRateLimited,
  registerFailedAttempt,
  resetFailedAttempts,
} from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const env = getCloudEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Облачное хранилище не настроено" },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => null)) as { pin?: unknown } | null;
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

  if (!pin) {
    return NextResponse.json({ error: "Введите PIN-код" }, { status: 400 });
  }

  const ip = clientIp(request);

  try {
    if (await isRateLimited(env, ip)) {
      return NextResponse.json(
        { error: "Слишком много попыток. Попробуйте через 15 минут." },
        { status: 429 },
      );
    }

    if (!(await checkPin(env, pin))) {
      await registerFailedAttempt(env, ip);
      return NextResponse.json({ error: "Неверный PIN-код" }, { status: 401 });
    }

    await resetFailedAttempts(env, ip);
    const token = await createSession(env);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Не удалось войти. Проверьте настройки хранилища." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const env = getCloudEnv();
  if (env) {
    try {
      const store = await cookies();
      await destroySession(env, store.get(SESSION_COOKIE)?.value);
    } catch {
      // выходим локально даже если облако недоступно
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
