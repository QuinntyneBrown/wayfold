import type { SessionMember } from "./use-session";

export type Destination = { href: string; label: string };

export const BROWSE: Destination[] = [
  { href: "/vehicles", label: "Vehicles" },
  { href: "/providers", label: "Providers" },
  { href: "/products", label: "Products" },
];

export const SIGNED_OUT: Destination[] = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
];

export const FEED: Destination = { href: "/", label: "Feed" };
export const SELL: Destination = { href: "/vehicles/new", label: "Sell your car" };

export function accountDestinations(member: SessionMember): Destination[] {
  return [
    { href: `/members/${member.id}`, label: "Your profile" },
    { href: `/members/${member.id}#garage`, label: "Your garage" },
    { href: "/settings", label: "Settings" },
    { href: "/providers/new", label: "List your business" },
  ];
}
