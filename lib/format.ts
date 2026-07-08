export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(value));
}

export function confidenceLabel(value: number) {
  if (value >= 0.8) return "High";
  if (value >= 0.62) return "Medium";
  return "Review";
}