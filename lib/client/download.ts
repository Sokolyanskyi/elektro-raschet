export interface BackupFile {
  app: "elektro-raschet";
  version: 1;
  exportedAt: string;
  settings: { dayRate: number; nightRate: number };
  records: unknown[];
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(filename: string, data: unknown): void {
  downloadFile(filename, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
}

/** CSV для Excel: BOM, точка с запятой, десятичная запятая только в числах. */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const escapeCell = (cell: string | number): string => {
    const text =
      typeof cell === "number" ? String(cell).replace(".", ",") : cell;
    return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = rows.map((row) => row.map(escapeCell).join(";")).join("\r\n");
  downloadFile(filename, `\uFEFF${csv}`, "text/csv;charset=utf-8");
}

export async function readJsonFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text) as unknown;
}
