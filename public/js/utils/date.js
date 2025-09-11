// Small date utilities used by the UI.
export function formatDateShort(d) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  try {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    // Fallback to ISO date portion
    return date.toISOString().split("T")[0];
  }
}
