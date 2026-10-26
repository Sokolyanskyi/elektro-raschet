import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export interface CloudEnv {
  url: string;
  token: string;
  pin: string;
}

export const SESSION_COOKIE = "elec_session";
// Браузеры ограничивают срок жизни cookie примерно 400 днями.
// Поэтому сессия «скользящая»: каждое обращение продлевает и cookie, и ключ в Redis.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 400; // 400 дней

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

/**
 * Облако включается только если настроены все три переменные:
 * KV_REST_API_URL, KV_REST_API_TOKEN и APP_PIN.
 * Без них приложение работает полностью локально (localStorage).
 */
export function getCloudEnv(): CloudEnv | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  const pin = process.env.APP_PIN;
  if (!url || !token || !pin) return null;
  return { url, token, pin };
}

export async function kvCommand<T>(env: CloudEnv, command: unknown[]): Promise<T> {
  const response = await fetch(env.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { result?: T; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
}

export async function kvPipeline(
  env: CloudEnv,
  commands: unknown[][],
): Promise<void> {
  if (commands.length === 0) return;
  const response = await fetch(`${env.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis HTTP ${response.status}`);
  }

  const payload = (await response.json()) as Array<{ error?: string }>;
  const failed = payload.find((item) => item?.error);
  if (failed?.error) throw new Error(failed.error);
}

function pinMatches(input: string, expected: string): boolean {
  const inputHash = createHash("sha256").update(input).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);
}

export async function createSession(env: CloudEnv): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  await kvCommand(env, ["SET", `elec:sess:${token}`, "1", "EX", SESSION_TTL_SECONDS]);
  return token;
}

export async function sessionExists(env: CloudEnv, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const result = await kvCommand<number>(env, ["EXISTS", `elec:sess:${token}`]);
  return result === 1;
}

export async function destroySession(env: CloudEnv, token: string | undefined): Promise<void> {
  if (!token) return;
  await kvCommand(env, ["DEL", `elec:sess:${token}`]);
}

export async function checkPin(env: CloudEnv, input: string): Promise<boolean> {
  return pinMatches(input, env.pin);
}

/** Простое ограничение перебора PIN-кода: 10 попыток за 15 минут на IP. */
export async function isRateLimited(env: CloudEnv, ip: string): Promise<boolean> {
  const attempts = await kvCommand<number | null>(env, ["GET", `elec:fail:${ip}`]);
  return Number(attempts ?? 0) >= 10;
}

export async function registerFailedAttempt(env: CloudEnv, ip: string): Promise<void> {
  const key = `elec:fail:${ip}`;
  await kvCommand(env, ["INCR", key]);
  await kvCommand(env, ["EXPIRE", key, 900]);
}

export async function resetFailedAttempts(env: CloudEnv, ip: string): Promise<void> {
  await kvCommand(env, ["DEL", `elec:fail:${ip}`]);
}

/** Продлевает ключ сессии в Redis. Возвращает false, если сессии уже нет. */
export async function refreshSession(
  env: CloudEnv,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  // EXPIRE возвращает 1, если ключ существует, и 0, если сессии уже нет.
  const refreshed = await kvCommand<number>(env, [
    "EXPIRE",
    `elec:sess:${token}`,
    SESSION_TTL_SECONDS,
  ]);
  return refreshed === 1;
}

/** Проверяет cookie сессии и продлевает её при каждом обращении. */
export async function isAuthenticated(env: CloudEnv): Promise<boolean> {
  const store = await cookies();
  return refreshSession(env, store.get(SESSION_COOKIE)?.value);
}
