import { format } from "date-fns";

export function formatDate(value: Date | string | null | undefined, pattern = "dd MMM yyyy") {
  if (!value) {
    return "N/A";
  }

  return format(new Date(value), pattern);
}
