import { useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";

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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg animate-toast-in ${
        isError
          ? "bg-danger text-white"
          : "bg-text text-white"
      }`}
    >
      {isError ? (
        <AlertCircle size={18} className="shrink-0" />
      ) : (
        <Check size={18} className="shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
