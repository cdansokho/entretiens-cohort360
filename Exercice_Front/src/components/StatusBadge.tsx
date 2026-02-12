import type { PrescriptionStatus } from "@/types";

const STATUS_CONFIG: Record<
  PrescriptionStatus,
  { label: string; className: string }
> = {
  valide: {
    label: "Valide",
    className: "bg-success/15 text-success border border-success/30",
  },
  en_attente: {
    label: "En attente",
    className: "bg-warning/15 text-warning border border-warning/30",
  },
  suppr: {
    label: "Supprimée",
    className: "bg-danger/15 text-danger border border-danger/30",
  },
};

interface StatusBadgeProps {
  status: PrescriptionStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
