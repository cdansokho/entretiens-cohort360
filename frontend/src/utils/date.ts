import { format } from "date-fns";
import { fr } from "date-fns/locale";

/** Format a date string (YYYY-MM-DD or ISO) to French locale (e.g. "15 mai 2010"). */
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy", { locale: fr });
}
