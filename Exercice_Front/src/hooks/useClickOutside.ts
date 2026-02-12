import { useEffect, type RefObject } from "react";

/** Run callback when a mousedown happens outside the ref element. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  isActive: boolean,
  onClickOutside: () => void
): void {
  useEffect(() => {
    if (!isActive) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isActive, onClickOutside, ref]);
}
