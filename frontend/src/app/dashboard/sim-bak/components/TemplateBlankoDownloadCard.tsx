"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FiDownload, FiFileText, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";
import { getTemplateBlankoByLayanan, downloadTemplateBlanko } from "@/lib/services/sim-bak/simBakService";
import type { TemplateBlanko } from "@/lib/services/sim-bak/types";

/**
 * Card daftar template blanko (Word/PDF) yang dapat di-download mahasiswa.
 * Tampil di Step 1 form pengajuan untuk layanan yang punya template blanko.
 */
export default function TemplateBlankoDownloadCard({ idJenisLayanan }: { idJenisLayanan?: string }) {
  const [templates, setTemplates] = useState<TemplateBlanko[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idJenisLayanan) { setLoading(false); return; }
    getTemplateBlankoByLayanan(idJenisLayanan)
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [idJenisLayanan]);

  if (loading || templates.length === 0) return null;

  const handleDownload = async (item: TemplateBlanko) => {
    try {
      const ext = item.tipe_file.includes("wordprocessingml") ? "docx" :
                  item.tipe_file === "application/msword" ? "doc" : "pdf";
      const safeName = item.nm_template.replace(/[^A-Za-z0-9_\-]/g, "_");
      await downloadTemplateBlanko(item.id_template, `${safeName}.${ext}`);
      toast.success(`Template ${item.nm_template} berhasil diunduh`);
    } catch { toast.error("Gagal mengunduh template"); }
  };

  const formatLabel = (mime: string) => {
    if (mime.includes("wordprocessingml")) return "DOCX";
    if (mime === "application/msword") return "DOC";
    if (mime === "application/pdf") return "PDF";
    return mime.split("/").pop()?.toUpperCase() || "FILE";
  };

  return (
    <Card className="shadow-md rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10">
      <CardBody className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <FiInfo className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-semibold text-emerald-800 dark:text-emerald-300">Template Surat yang Diperlukan</h2>
        </div>
        <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-4">
          Download template di bawah ini, isi sesuai data Anda, lalu upload kembali pada langkah berikutnya sesuai persyaratan dokumen.
        </p>
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id_template} className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <FiFileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.nm_template}</p>
                    <Chip size="sm" variant="flat" color="success">{formatLabel(t.tipe_file)}</Chip>
                  </div>
                  {t.keterangan && <p className="text-xs text-gray-500 truncate">{t.keterangan}</p>}
                </div>
              </div>
              <Button size="sm" color="success" variant="flat" startContent={<FiDownload className="w-3.5 h-3.5" />}
                onPress={() => handleDownload(t)}>
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
