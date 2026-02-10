import type { PrescriptionStatus, PrescriptionFilters } from "@/types";

/** Default number of prescriptions per page. */
export const DEFAULT_PAGE_SIZE = 10;

/** Initial filter state for the prescriptions list. */
export const DEFAULT_PRESCRIPTION_FILTERS: PrescriptionFilters = {
  patient: "",
  medication: "",
  status: "",
  start_date_gte: "",
  start_date_lte: "",
  end_date_gte: "",
  end_date_lte: "",
  ordering: "",
  page: 1,
  page_size: DEFAULT_PAGE_SIZE,
};

/** Page size options for pagination. */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/** Status options for prescription forms (value, label). */
export const PRESCRIPTION_STATUS_OPTIONS: { value: PrescriptionStatus; label: string }[] = [
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Valide" },
  { value: "suppr", label: "Supprimée" },
];

/** Keys that do not count as "active" filters for the filter badge. */
export const FILTER_KEYS_EXCLUDED_FROM_COUNT = ["ordering", "page", "page_size"] as const;

// ─── Form styles (shared by prescription forms) ─────────────────────────────

export const FORM_INPUT_BASE =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-1 outline-none transition";

export const FORM_INPUT_OK = "border-border focus:border-primary focus:ring-primary";

export const FORM_INPUT_ERROR = "border-danger focus:border-danger focus:ring-danger";

export const FORM_SELECT_BASE =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";

export const FORM_BUTTON_SECONDARY =
  "rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover transition cursor-pointer";

export const FORM_BUTTON_PRIMARY =
  "flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition disabled:opacity-50 cursor-pointer";

export const MODAL_CLOSE_BUTTON =
  "rounded-lg p-1 hover:bg-surface-hover transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
