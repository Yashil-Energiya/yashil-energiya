type Status = "open" | "closed" | "completed";

/** Today's date in Tashkent as ISO "yyyy-mm-dd" (en-CA formats dates that way). */
export const tashkentToday = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(now);

/**
 * An open tender shows as closed once its deadline day has passed in
 * Tashkent; the deadline day itself still accepts proposals. ISO dates
 * compare correctly as strings.
 */
export const effectiveStatus = (status: Status, deadline: string, today: string): Status =>
  status === "open" && deadline < today ? "closed" : status;
