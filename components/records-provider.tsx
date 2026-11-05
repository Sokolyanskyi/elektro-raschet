"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRecords, type RecordsStore } from "@/lib/client/use-records";

const RecordsContext = createContext<RecordsStore | null>(null);

/**
 * Хранилище записей живёт в корневом layout, а не на странице счётчика:
 * при переходе между вкладками «Электричество ↔ Газ» оно не пересоздаётся,
 * поэтому boot-заставка с картинкой показывается только на холодном старте
 * приложения, а переключение вкладок происходит мгновенно.
 */
export function RecordsProvider({ children }: { children: ReactNode }) {
  const store = useRecords();
  return (
    <RecordsContext.Provider value={store}>{children}</RecordsContext.Provider>
  );
}

export function useRecordsStore(): RecordsStore {
  const store = useContext(RecordsContext);
  if (!store) {
    throw new Error("useRecordsStore must be used inside RecordsProvider");
  }
  return store;
}
