import { NextResponse } from "next/server";
import { getCloudEnv, isAuthenticated, type CloudEnv } from "@/lib/server/auth";
import {
  deleteRecord,
  getRecord,
  listRecords,
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await guard();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    record?: unknown;
    paid?: boolean;
    unlock?: boolean;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Нет данных" }, { status: 400 });
  }

  try {
    const current = await getRecord(auth.env, id);
    if (!current) {
      return NextResponse.json({ error: "Расчёт не найден" }, { status: 404 });
    }

    if (current.paid && body.unlock !== true) {
      return NextResponse.json(
        { error: "Расчёт оплачен и заблокирован. Сначала отмените оплату." },
        { status: 409 },
      );
    }

    let next = { ...current };
    let changed = false;
    const now = new Date().toISOString();

    if (body.unlock === true && next.paid) {
      next.paid = false;
      next.paidAt = null;
      changed = true;
    }

    if (body.record) {
      const candidate = sanitizeRecord(
        {
          ...(body.record as Record<string, unknown>),
          id,
          paid: false,
          paidAt: null,
          createdAt: current.createdAt,
          updatedAt: now,
        },
        id,
      );
      if (!candidate) {
        return NextResponse.json({ error: "Некорректные данные расчёта" }, { status: 400 });
      }

      const existing = await listRecords(auth.env);
      if (existing.some((item) => item.period === candidate.period && item.id !== id)) {
        return NextResponse.json(
          { error: "За этот месяц уже есть расчёт" },
          { status: 409 },
        );
      }

      next = { ...candidate, paid: false, paidAt: null };
      changed = true;
    }

    if (body.paid === true && !next.paid) {
      next.paid = true;
      next.paidAt = now;
      changed = true;
    }

    if (!changed) {
      return NextResponse.json({ error: "Нет изменений" }, { status: 400 });
    }

    next.updatedAt = now;
    await saveRecord(auth.env, next);
    return NextResponse.json({ record: next });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить расчёт" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await guard();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;

  try {
    const current = await getRecord(auth.env, id);
    if (!current) {
      return NextResponse.json({ error: "Расчёт не найден" }, { status: 404 });
    }
    if (current.paid) {
      return NextResponse.json(
        { error: "Оплаченный расчёт нельзя удалить. Сначала отмените оплату." },
        { status: 409 },
      );
    }
    await deleteRecord(auth.env, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить расчёт" }, { status: 500 });
  }
}
