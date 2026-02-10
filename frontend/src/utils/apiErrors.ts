const DEFAULT_MESSAGE = "Une erreur est survenue. Veuillez réessayer.";

/** Axios-style error with optional response.data (Django REST format). */
export interface ApiErrorResponse {
  response?: {
    data?: Record<string, string | string[]>;
  };
}

/**
 * Parse an API error (e.g. Axios) into field errors and a user message.
 * Django REST returns { "field_name": ["msg1", "msg2"] } or { "field_name": "msg" }.
 */
export function parseApiError(err: unknown): {
  fieldErrors: Record<string, string>;
  message: string;
} {
  const fieldErrors: Record<string, string> = {};
  let message = DEFAULT_MESSAGE;

  if (err && typeof err === "object" && "response" in err) {
    const response = (err as ApiErrorResponse).response;
    const data = response?.data;
    if (data && typeof data === "object") {
      Object.entries(data).forEach(([key, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
        fieldErrors[key] = text;
      });
      const firstMsg = Object.values(fieldErrors)[0];
      if (firstMsg) message = firstMsg;
    }
  }

  return { fieldErrors, message };
}
