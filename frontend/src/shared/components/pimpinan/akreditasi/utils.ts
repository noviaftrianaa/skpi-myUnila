export const getAkreditasiBadgeColor = (
  status: string,
): "primary" | "secondary" | "success" | "warning" | "danger" | "default" => {
  const colorMap: Record<
    string,
    "primary" | "secondary" | "success" | "warning" | "danger" | "default"
  > = {
    Unggul: "warning",
    "Baik Sekali": "success",
    Baik: "success",
    A: "primary",
    B: "secondary",
    C: "danger",
    Proses: "default",
  };
  return colorMap[status] || "default";
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
