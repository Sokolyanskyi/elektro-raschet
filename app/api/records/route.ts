import { NextResponse } from "next/server";
import { getCloudEnv, isAuthenticated, type CloudEnv } from "@/lib/server/auth";
import {
  listRecords,
  mergeRecords,
  sanitizeRecord,
  saveRecord,
} from "@/lib/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Guard = { env: CloudEnv } | { response: NextResponse };

async function guard(): Promise<Guard> {
  const env = getCloudEnv();
  if (!env) {
    return {
      response: NextResponse.json(
        { error: "storage_not_configured" },
        { status: 400 },
      ),
    };
  }
  if (!(await isAuthenticated(env))) {
    return {
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  return { env };
}

export async function GET() {
  const auth = await guard();
  if ("response" in auth) return auth.response;

  try {
    const records = await listRecords(auth.env);
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ error: "load_failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await guard();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => null)) as { record?: unknown } | null;
  if (!body?.record) {
    return NextResponse.json({ error: "no_data" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const record = sanitizeRecord({
    ...(body.record as Record<string, unknown>),
    id: crypto.randomUUID(),
    paid: false,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  });

  if (!record) {
    return NextResponse.json({ error: "invalid_record" }, { status: 400 });
  }

  try {
    const existing = await listRecords(auth.env);
    if (existing.some((item) => item.period === record.period)) {
      return NextResponse.json(
        { error: "duplicate_period" },
        { status: 409 },
      );
    }
    await saveRecord(auth.env, record);
    return NextResponse.json({ record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}

/** Массовое добавление (импорт резервной копии или перенос локальных данных). */
export async function PUT(request: Request) {
  const auth = await guard();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => null)) as { records?: unknown } | null;
  if (!Array.isArray(body?.records)) {
    return NextResponse.json({ error: "no_records" }, { status: 400 });
  }
  if (body.records.length > 5000) {
    return NextResponse.json({ error: "too_many_records" }, { status: 400 });
  }

  const records = body.records.map((item) => sanitizeRecord(item));
  if (records.some((record) => record === null)) {
    return NextResponse.json({ error: "invalid_records" }, { status: 400 });
  }

  try {
    const result = await mergeRecords(
      auth.env,
      records.filter((record): record is NonNullable<typeof record> => record !== null),
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "import_failed" }, { status: 500 });
  }
}
