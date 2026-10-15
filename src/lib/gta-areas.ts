/** Toronto districts and the municipalities of Peel, Halton, York and Durham (L2-014). */
export const GTA_AREAS = [
  "Toronto", "Etobicoke", "North York", "Scarborough", "East York", "York",
  "Mississauga", "Brampton", "Caledon",
  "Oakville", "Burlington", "Milton", "Halton Hills",
  "Markham", "Vaughan", "Richmond Hill", "Newmarket", "Aurora", "King", "Whitchurch-Stouffville", "East Gwillimbury", "Georgina",
  "Pickering", "Ajax", "Whitby", "Oshawa", "Clarington", "Uxbridge", "Scugog", "Brock",
] as const;

export function isGtaArea(value: string) {
  return (GTA_AREAS as readonly string[]).includes(value);
}
