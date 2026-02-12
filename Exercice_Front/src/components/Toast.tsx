import { useEffect } from "react";
import { Check, AlertCircle, X } from "lucide-react";

interface Props {
  message: string;
  variant?: "success" | "error";
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  variant = "success",
  onDismiss,
  duration = 4000,
}: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  const isError = variant === "error";
  return (
    <div
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-xl px-4 py-3 shadow-[0_10px_40px_-10px_oklch(0_0_0_/_0.25)] animate-toast-in min-w-[280px] max-w-[90vw] ${
        isError
          ? "bg-danger text-white"
          : "bg-success text-white"
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="shrink-0" aria-hidden />
      ) : (
        <Check size={20} className="shrink-0" aria-hidden />
      )}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="shrink-0 p-1 rounded-md hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition"
      >
        <X size={18} />
      </button>
    </div>
  );
}
