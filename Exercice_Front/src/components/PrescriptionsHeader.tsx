import { useRef, useState } from "react";
import { Plus, Pill, Download, ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useClickOutside } from "@/hooks/useClickOutside";
import ApiStatusIndicator from "./ApiStatusIndicator";

const HEADER_CLASS =
  "sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-[0_1px_0_0_var(--color-border)]";
const HEADER_INNER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const ROW_CLASS = "flex items-center justify-between h-14 sm:h-16";
const BTN_EXPORT =
  "flex items-center gap-2 rounded-xl border-2 border-border px-3 py-2.5 text-sm font-semibold text-text hover:bg-surface-hover disabled:opacity-50 transition cursor-pointer";
const BTN_PRIMARY =
  "flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light active:bg-primary-dark transition-colors shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0";
const MENU_ITEM =
  "w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-hover cursor-pointer";

interface ExportMenuProps {
  onExportCsv: () => void;
  onExportExcel: () => void;
  isExporting: boolean;
  isLoading: boolean;
}

function ExportMenu({ onExportCsv, onExportExcel, isExporting, isLoading }: ExportMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  useClickOutside(ref, open, close);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isExporting || isLoading}
        aria-label="Exporter la liste"
        aria-expanded={open}
        aria-haspopup="true"
        className={BTN_EXPORT}
      >
        <Download size={18} />
        <span className="hidden sm:inline">{isExporting ? "Export…" : "Exporter"}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <ExportDropdown
          onClose={close}
          onExportCsv={onExportCsv}
          onExportExcel={onExportExcel}
        />
      )}
    </div>
  );
}

function ExportDropdown({
  onClose,
  onExportCsv,
  onExportExcel,
}: {
  onClose: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
}) {
  const handleCsv = () => {
    onClose();
    onExportCsv();
  };
  const handleExcel = () => {
    onClose();
    onExportExcel();
  };
  return (
    <div
      className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg"
      role="menu"
    >
      <button type="button" role="menuitem" onClick={handleCsv} className={MENU_ITEM}>
        Exporter en CSV
      </button>
      <button type="button" role="menuitem" onClick={handleExcel} className={MENU_ITEM}>
        Exporter en Excel
      </button>
    </div>
  );
}

interface PrescriptionsHeaderProps {
  onNewPrescription: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  isExporting: boolean;
  isLoading: boolean;
}

export default function PrescriptionsHeader({
  onNewPrescription,
  onExportCsv,
  onExportExcel,
  isExporting,
  isLoading,
}: PrescriptionsHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={HEADER_CLASS}>
      <div className={HEADER_INNER}>
        <div className={ROW_CLASS}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-primary text-white shadow-sm"
              aria-hidden
            >
              <Pill size={22} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-text leading-tight tracking-tight truncate">
                Cohort360
              </h1>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                Gestion des prescriptions
                <ApiStatusIndicator />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              className="flex items-center justify-center rounded-xl border-2 border-border p-2.5 text-text hover:bg-surface-hover transition cursor-pointer"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <ExportMenu
              onExportCsv={onExportCsv}
              onExportExcel={onExportExcel}
              isExporting={isExporting}
              isLoading={isLoading}
            />
            <button
              type="button"
              onClick={onNewPrescription}
              aria-label="Créer une nouvelle prescription (Ctrl+Shift+N)"
              className={BTN_PRIMARY}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Nouvelle prescription</span>
              <span className="sm:hidden">Nouvelle</span>
              <kbd
                className="hidden sm:inline-flex ml-1 items-center px-1.5 py-0.5 text-xs font-mono bg-white/20 rounded-md"
                aria-hidden
              >
                ⌃⇧N
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
