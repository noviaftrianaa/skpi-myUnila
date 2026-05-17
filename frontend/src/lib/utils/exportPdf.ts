import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPdf<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  options?: {
    title?: string;
    subtitle?: string;
    headers?: Record<string, string>;
    orientation?: "portrait" | "landscape";
  }
): void {
  if (!data.length) return;

  const {
    title = "Data Export",
    subtitle,
    headers,
    orientation = "landscape",
  } = options ?? {};

  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 40, 40);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
    doc.text(subtitle, 40, 56);
    doc.setTextColor(0);
  }

  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    `Diunduh: ${new Date().toLocaleString("id-ID")}`,
    40,
    subtitle ? 70 : 56
  );
  doc.setTextColor(0);

  const keys = headers ? Object.keys(headers) : Object.keys(data[0]);
  const head = [keys.map((k) => (headers ? headers[k] : k))];
  const body = data.map((row) =>
    keys.map((k) => {
      const v = row[k];
      if (v === null || v === undefined) return "-";
      return String(v);
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: subtitle ? 84 : 70,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(140);
      doc.text(
        `Halaman ${data.pageNumber} / ${pageCount}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 20,
        { align: "right" }
      );
      doc.setTextColor(0);
    },
  });

  doc.save(`${filename}.pdf`);
}
