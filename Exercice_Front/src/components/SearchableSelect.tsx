import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import { FORM_INPUT_BASE, FORM_INPUT_OK, FORM_INPUT_ERROR } from "@/constants";

export interface SearchableSelectOption {
  value: number;
  label: string;
}

interface Props {
  options: SearchableSelectOption[];
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: React.ReactNode;
  error?: boolean;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  inputClassName?: string;
  disabled?: boolean;
  /** Ref to focus when opening (e.g. first field in form) */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const MAX_VISIBLE_OPTIONS = 8;
const OPTION_HEIGHT = 40;

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Rechercher…",
  label,
  error = false,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  inputClassName = "",
  disabled = false,
  inputRef: externalInputRef,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery("");
    setHighlightedIndex(0);
  }, [disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const select = useCallback(
    (option: SearchableSelectOption) => {
      onChange(option.value);
      close();
    },
    [onChange, close]
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, close]);

  // Escape: close dropdown first, do not close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, close]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          select(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      default:
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const el = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex, isOpen]);

  const inputCn = `${FORM_INPUT_BASE} ${error ? FORM_INPUT_ERROR : FORM_INPUT_OK} ${inputClassName}`.trim();

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-listbox` : undefined}
        aria-activedescendant={
          isOpen && filteredOptions[highlightedIndex]
            ? `${id ?? "list"}-option-${filteredOptions[highlightedIndex].value}`
            : undefined
        }
        className={`flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-sm transition ${error ? "border-danger focus-within:ring-danger focus-within:border-danger" : "border-border focus-within:ring-primary focus-within:border-primary"} focus-within:ring-1 outline-none ${disabled ? "opacity-60 pointer-events-none" : "cursor-text"}`}
        onClick={() => (isOpen ? null : open())}
      >
        <Search size={18} className="shrink-0 text-text-secondary" aria-hidden />
        {isOpen ? (
          <input
            ref={externalInputRef ?? undefined}
            type="text"
            id={id}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-controls={id ? `${id}-listbox` : undefined}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            autoFocus
            className="flex-1 min-w-0 bg-transparent border-0 p-0 text-text placeholder:text-text-secondary focus:ring-0 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            id={id}
            onClick={open}
            onKeyDown={handleKeyDown}
            className={`flex-1 min-w-0 text-left bg-transparent border-0 p-0 ${selectedOption ? "text-text" : "text-text-secondary"}`}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </button>
        )}
        <ChevronDown
          size={18}
          className={`shrink-0 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-[20rem] overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-3 text-sm text-text-secondary text-center">
              Aucun résultat pour « {searchQuery} »
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                id={id ? `${id}-option-${option.value}` : undefined}
                role="option"
                aria-selected={option.value === value}
                className={`flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  index === highlightedIndex
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text hover:bg-surface-hover"
                } ${option.value === value ? "bg-primary/5" : ""}`}
                style={{ height: OPTION_HEIGHT }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => select(option)}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
