import { apiErrorMessage, tNow } from "@/lib/i18n";
import type { CloudStatus, MeterRecord } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  code: string | null;

  constructor(status: number, message: string, code: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, tNow("api.network"), "network");
  }

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
    message?: string;
  } & Record<string, unknown>;

  if (!response.ok) {
    const code = payload.error ?? payload.code ?? null;
    if (code && code.startsWith("api.")) {
      throw new ApiError(response.status, apiErrorMessage(code.slice(4)), code);
    }
    throw new ApiError(
      response.status,
      code ? apiErrorMessage(code) : tNow("api.request_failed"),
      code,
    );
  }

  return payload as T;
}

export function getStatus(): Promise<CloudStatus & { error?: string }> {
  return request<CloudStatus & { error?: string }>("/api/status");
}

export async function login(pin: string): Promise<void> {
  await request<{ ok: true }>("/api/auth", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

export async function logout(): Promise<void> {
  await request<{ ok: true }>("/api/auth", { method: "DELETE" });
}

export async function listCloudRecords(): Promise<MeterRecord[]> {
  const payload = await request<{ records: MeterRecord[] }>("/api/records");
  return payload.records;
}

export async function createCloudRecord(
  draft: Omit<MeterRecord, "id" | "paid" | "paidAt" | "createdAt" | "updatedAt">,
): Promise<MeterRecord> {
  const payload = await request<{ record: MeterRecord }>("/api/records", {
    method: "POST",
    body: JSON.stringify({ record: draft }),
  });
  return payload.record;
}

export async function updateCloudRecord(
  id: string,
  patch: {
    record?: Omit<
      MeterRecord,
      "id" | "paid" | "paidAt" | "createdAt" | "updatedAt"
    >;
    paid?: boolean;
    paidAt?: string;
    unlock?: boolean;
  },
): Promise<MeterRecord> {
  const payload = await request<{ record: MeterRecord }>(
    `/api/records/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
  );
  return payload.record;
}

export async function deleteCloudRecord(id: string): Promise<void> {
  await request<{ ok: true }>(`/api/records/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function mergeCloudRecords(records: MeterRecord[]): Promise<{
  added: number;
  updated: number;
  skipped: number;
}> {
  return request<{ added: number; updated: number; skipped: number }>(
    "/api/records",
    {
      method: "PUT",
      body: JSON.stringify({ records }),
    },
  );
}
