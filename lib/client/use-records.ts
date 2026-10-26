"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tNow } from "@/lib/i18n";
import type { CloudStatus, MeterRecord, RecordDraft, Settings, StorageMode } from "@/lib/types";
import {
  ApiError,
  createCloudRecord,
  deleteCloudRecord,
  getStatus,
  listCloudRecords,
  login,
  logout,
  mergeCloudRecords,
  updateCloudRecord,
} from "./api";
import {
  DEFAULT_SETTINGS,
  loadLocalRecords,
  loadLocalSettings,
  mergeRecordLists,
  newId,
  saveLocalRecords,
  saveLocalSettings,
  sortRecords,
} from "./local-store";

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : tNow("error.unexpected");
}

export interface RecordsStore {
  mode: StorageMode;
  records: MeterRecord[];
  settings: Settings;
  cloud: CloudStatus | null;
  error: string | null;
  busy: boolean;
  localCount: number;
  refresh: () => Promise<void>;
  save: (draft: RecordDraft, editingId?: string) => Promise<MeterRecord>;
  setPaid: (id: string, paid: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  importRecords: (records: MeterRecord[], settings?: Settings | null) => Promise<{
    added: number;
    updated: number;
    skipped: number;
  }>;
  pushLocalToCloud: () => Promise<{ added: number; updated: number; skipped: number }>;
  updateSettings: (settings: Settings) => void;
  signIn: (pin: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useRecords(): RecordsStore {
  const [mode, setMode] = useState<StorageMode>("loading");
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [cloud, setCloud] = useState<CloudStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setSettings(loadLocalSettings());
    setLocalCount(loadLocalRecords().length);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const status = await getStatus();
      if (!mounted.current) return;
      setCloud(status);
      setLocalCount(loadLocalRecords().length);

      if (status.error) {
        setMode("error");
        setError(tNow("error.storageUnavailableCloud"));
        return;
      }

      if (!status.cloud) {
        setRecords(loadLocalRecords());
        setMode("local");
        return;
      }

      if (!status.authenticated) {
        setRecords([]);
        setMode("locked");
        return;
      }

      const list = await listCloudRecords();
      if (!mounted.current) return;
      setRecords(sortRecords(list));
      setMode("cloud");
    } catch (cause) {
      if (!mounted.current) return;
      setMode("error");
      setError(errorMessage(cause));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "elec.records.v1" && mode === "local") {
        setRecords(loadLocalRecords());
        setLocalCount(loadLocalRecords().length);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mode]);

  const withBusy = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    setBusy(true);
    try {
      return await action();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && mounted.current) {
        setRecords([]);
        setMode("locked");
      }
      throw error;
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, []);

  const save = useCallback(
    (draft: RecordDraft, editingId?: string) =>
      withBusy(async (): Promise<MeterRecord> => {
        if (mode === "cloud") {
          if (editingId) {
            const updated = await updateCloudRecord(editingId, { record: draft });
            setRecords((current) =>
              sortRecords(current.map((record) => (record.id === updated.id ? updated : record))),
            );
            return updated;
          }
          const created = await createCloudRecord(draft);
          setRecords((current) => sortRecords([...current, created]));
          return created;
        }

        if (mode !== "local") {
          throw new Error(tNow("error.storageUnavailable"));
        }

        const now = new Date().toISOString();
        if (editingId) {
          const current = records.find((record) => record.id === editingId);
          if (!current) throw new Error(tNow("error.recordNotFound"));
          if (current.paid) {
            throw new Error(tNow("error.paidLocked"));
          }
          const updated: MeterRecord = {
            ...current,
            ...draft,
            updatedAt: now,
          };
          const next = records.map((record) => (record.id === editingId ? updated : record));
          saveLocalRecords(next);
          setRecords(sortRecords(next));
          return updated;
        }

        const created: MeterRecord = {
          ...draft,
          id: newId(),
          paid: false,
          paidAt: null,
          createdAt: now,
          updatedAt: now,
        };
        const next = [...records, created];
        saveLocalRecords(next);
        setRecords(sortRecords(next));
        return created;
      }),
    [mode, records, withBusy],
  );

  const setPaid = useCallback(
    (id: string, paid: boolean) =>
      withBusy(async () => {
        if (mode === "cloud") {
          const updated = await updateCloudRecord(id, paid ? { paid: true } : { unlock: true });
          setRecords((current) =>
            sortRecords(current.map((record) => (record.id === updated.id ? updated : record))),
          );
          return;
        }

        if (mode !== "local") throw new Error(tNow("error.storageUnavailable"));
        const now = new Date().toISOString();
        let found = false;
        const next = records.map((record) => {
          if (record.id !== id) return record;
          found = true;
          return {
            ...record,
            paid,
            paidAt: paid ? now : null,
            updatedAt: now,
          };
        });
        if (!found) throw new Error(tNow("error.recordNotFound"));
        saveLocalRecords(next);
        setRecords(sortRecords(next));
      }),
    [mode, records, withBusy],
  );

  const remove = useCallback(
    (id: string) =>
      withBusy(async () => {
        if (mode === "cloud") {
          await deleteCloudRecord(id);
          setRecords((current) => current.filter((record) => record.id !== id));
          return;
        }
        if (mode !== "local") throw new Error(tNow("error.storageUnavailable"));
        const next = records.filter((record) => record.id !== id);
        saveLocalRecords(next);
        setRecords(sortRecords(next));
      }),
    [mode, records, withBusy],
  );

  const importRecords = useCallback(
    (incoming: MeterRecord[], incomingSettings?: Settings | null) =>
      withBusy(async () => {
        if (incomingSettings) {
          setSettings(incomingSettings);
          saveLocalSettings(incomingSettings);
        }

        if (mode === "cloud") {
          const result = await mergeCloudRecords(incoming);
          const list = await listCloudRecords();
          setRecords(sortRecords(list));
          return result;
        }
        if (mode !== "local") throw new Error(tNow("error.storageUnavailable"));

        const local = loadLocalRecords();
        const result = mergeRecordLists(local, incoming);
        saveLocalRecords(result.records);
        setRecords(result.records);
        setLocalCount(result.records.length);
        return { added: result.added, updated: result.updated, skipped: result.skipped };
      }),
    [mode, withBusy],
  );

  const pushLocalToCloud = useCallback(
    () =>
      withBusy(async () => {
        const local = loadLocalRecords();
        if (local.length === 0) throw new Error(tNow("error.noLocalRecords"));
        if (mode !== "cloud") throw new Error(tNow("error.cloudNotConnected"));
        const result = await mergeCloudRecords(local);
        const list = await listCloudRecords();
        setRecords(sortRecords(list));
        return result;
      }),
    [mode, withBusy],
  );

  const updateSettings = useCallback((next: Settings) => {
    setSettings(next);
    saveLocalSettings(next);
  }, []);

  const signIn = useCallback(
    (pin: string) =>
      withBusy(async () => {
        await login(pin);
        await refresh();
      }),
    [refresh, withBusy],
  );

  const signOut = useCallback(
    () =>
      withBusy(async () => {
        await logout();
        setRecords([]);
        setMode("locked");
      }),
    [withBusy],
  );

  return {
    mode,
    records,
    settings,
    cloud,
    error,
    busy,
    localCount,
    refresh,
    save,
    setPaid,
    remove,
    importRecords,
    pushLocalToCloud,
    updateSettings,
    signIn,
    signOut,
  };
}
