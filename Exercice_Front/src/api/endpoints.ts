/** API path segments (no leading slash; baseURL is /api). */
export const ENDPOINTS = {
  patients: "/Patient",
  medications: "/Medication",
  prescriptions: "/Prescription",
  prescription: (id: number) => `/Prescription/${id}`,
  prescriptionsImport: "/Prescription/import",
} as const;
