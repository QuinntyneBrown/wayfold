/** The nine kinds of auto provider (L2-030), by stored value. */
export const PROVIDER_CATEGORIES = [
  { value: "dealer", label: "Dealer" },
  { value: "mechanic", label: "Mechanic" },
  { value: "body-shop", label: "Body shop" },
  { value: "tire-shop", label: "Tire shop" },
  { value: "detailer", label: "Detailer" },
  { value: "towing", label: "Towing" },
  { value: "insurance-broker", label: "Insurance broker" },
  { value: "financing", label: "Financing professional" },
  { value: "parts-store", label: "Parts store" },
] as const;

export function isProviderCategory(value: string) {
  return PROVIDER_CATEGORIES.some((category) => category.value === value);
}
