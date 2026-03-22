import * as XLSX from 'xlsx';

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = 'Data',
  headers?: Record<string, string>
): void {
  if (!data.length) return;

  // Remap headers if provided
  const rows = headers
    ? data.map((row) => {
        const newRow: Record<string, unknown> = {};
        Object.entries(headers).forEach(([key, label]) => {
          newRow[label] = row[key] ?? '';
        });
        return newRow;
      })
    : data;

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
