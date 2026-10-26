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
        { error: "Облачное хранилище не настроено" },
        { status: 400 },
      ),
    };
  }
  if (!(await isAuthenticated(env))) {
    return {
      response: NextResponse.json({ error: "Требуется вход" }, { status: 401 }),
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
    return NextResponse.json(
      { error: "Не удалось загрузить расчёты из облака" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await guard();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => null)) as { record?: unknown } | null;
  if (!body?.record) {
    return NextResponse.json({ error: "Нет данных расчёта" }, { status: 400 });
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
    return NextResponse.json({ error: "Некорректные данные расчёта" }, { status: 400 });
  }

  try {
    const existing = await listRecords(auth.env);
    if (existing.some((item) => item.period === record.period)) {
      return NextResponse.json(
        { error: "За этот месяц уже есть расчёт" },
        { status: 409 },
      );
    }
    await saveRecord(auth.env, record);
    return NextResponse.json({ record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить расчёт" }, { status: 500 });
  }
}

/** Массовое добавление (импорт резервной копии или перенос локальных данных). */
export async function PUT(request: Request) {
  const auth = await guard();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => null)) as { records?: unknown } | null;
  if (!Array.isArray(body?.records)) {
    return NextResponse.json({ error: "Нет списка расчётов" }, { status: 400 });
  }
  if (body.records.length > 5000) {
    return NextResponse.json({ error: "Слишком много записей в файле" }, { status: 400 });
  }

  const records = body.records.map((item) => sanitizeRecord(item));
  if (records.some((record) => record === null)) {
    return NextResponse.json({ error: "В файле есть некорректные записи" }, { status: 400 });
  }

  try {
    const result = await mergeRecords(
      auth.env,
      records.filter((record): record is NonNullable<typeof record> => record !== null),
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Не удалось импортировать расчёты" }, { status: 500 });
  }
}
