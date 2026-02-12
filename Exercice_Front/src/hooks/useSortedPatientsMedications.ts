import { useMemo } from "react";
import { usePatients, useMedications } from "./useApi";
import type { Patient, Medication } from "@/types";

/** Sort patients by last name + first name. */
export function useSortedPatients(): Patient[] {
  const { data: patients } = usePatients();
  return useMemo(
    () =>
      [...(patients ?? [])].sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(
          `${b.last_name} ${b.first_name}`
        )
      ),
    [patients]
  );
}

/** Sort medications by label. */
export function useSortedMedications(): Medication[] {
  const { data: medications } = useMedications();
  return useMemo(
    () => [...(medications ?? [])].sort((a, b) => a.label.localeCompare(b.label)),
    [medications]
  );
}
