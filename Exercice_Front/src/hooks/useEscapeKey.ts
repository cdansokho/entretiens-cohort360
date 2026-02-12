import { useEffect } from "react";

/** Listen for Escape key and call onClose. Cleans up on unmount. */
export function useEscapeKey(onClose: () => void): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
}
