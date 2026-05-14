export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>
): void {
  if (!data.length) return;

  const keys = headers ? Object.keys(headers) : Object.keys(data[0]);
  const labels = keys.map((k) => (headers ? headers[k] : k));

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n\r;]/.test(s) ? `"${s}"` : s;
  };

  const lines = [
    labels.map(escape).join(","),
    ...data.map((row) => keys.map((k) => escape(row[k])).join(",")),
  ];

  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJson<T>(data: T[], filename: string): void {
  if (!data.length) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
