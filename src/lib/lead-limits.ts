// Max lead-form field lengths, shared by the forms (maxLength) and their API routes.
export const LEAD_MAX_LENGTH = {
  firstName: 100,
  phone: 50,
  email: 150,
  message: 3000,
};

type LeadField = keyof typeof LEAD_MAX_LENGTH;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks the contact fields of a lead request body: required fields must be
 * non-empty strings, any given field must be a string within its max length,
 * and the email must look like one. Returns the error message, or null.
 */
export function leadFieldsError(
  request: object,
  required: LeadField[],
): string | null {
  const body = request as Record<string, unknown>;

  if (required.some((field) => !body[field])) {
    return "Missing required fields";
  }

  for (const field of Object.keys(LEAD_MAX_LENGTH) as LeadField[]) {
    const value = body[field];
    if (value === undefined || value === "") continue;
    if (typeof value !== "string") return "Invalid input";
    if (value.length > LEAD_MAX_LENGTH[field]) return "Input is too long";
  }

  const email = body.email;
  if (
    typeof email === "string" &&
    email.trim() &&
    !EMAIL_PATTERN.test(email.trim())
  ) {
    return "Invalid email";
  }

  return null;
}
