"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import { syncService } from "@/lib/services/si-prestasi/prestasiService";
import type { WorkflowStatus } from "@/lib/services/si-prestasi/types";

type Props = {
  type: "prestasi" | "sertifikasi" | "rekognisi";
  id: string;
  status: WorkflowStatus | string;
  /** Disabled bila status bukan ready/error. */
  onSubmitted?: () => void;
  size?: "sm" | "md";
  variant?: "solid" | "flat" | "bordered";
};

/**
 * SubmitButton — tombol "Kirim ke SIMKATMAWA" yang reusable di list/detail
 * page prestasi-mandiri / sertifikasi / rekognisi.
 *
 * Hanya enabled saat status_workflow = ready atau error.
 * Dispatch ke endpoint /api/v1/sync/submit/{type}/{id} (async queue).
 */
export default function SubmitButton({
  type,
  id,
  status,
  onSubmitted,
  size = "sm",
  variant = "flat",
}: Props) {
  const [loading, setLoading] = useState(false);
  const canSubmit = status === "ready" || status === "error";

  const tooltip = canSubmit
    ? "Kirim payload ke SIMKATMAWA"
    : `Tidak bisa submit dari status '${status}'. Set ke 'ready' dulu.`;

  async function handleClick() {
    if (!canSubmit || loading) return;
    if (!confirm("Kirim record ini ke SIMKATMAWA? Status akan berubah menjadi 'sending'.")) return;

    setLoading(true);
    try {
      await syncService.submit(type, id);
      toast.success("Job submit di-dispatch. Cek tab Sync Log untuk hasil.");
      onSubmitted?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(`Gagal submit: ${err.response?.data?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      color={canSubmit ? "primary" : "default"}
      isDisabled={!canSubmit}
      isLoading={loading}
      startContent={<FiSend className="w-4 h-4" />}
      onPress={handleClick}
      title={tooltip}
    >
      Kirim
    </Button>
  );
}
