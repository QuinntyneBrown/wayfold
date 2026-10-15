export type MemberProfile = {
  id: string;
  email: string;
  displayName: string;
  gtaArea: string | null;
  homeChurch: string | null;
  showHomeChurch: boolean;
};

export type MemberView = { id: string; displayName: string; gtaArea: string | null; homeChurch?: string };

/** What a viewer may see: never the email, and the church only for a signed-in viewer when the member opted in (L2-019, L2-022, L2-023). */
export function projectMember(profile: MemberProfile, viewerSignedIn: boolean): MemberView {
  const view: MemberView = { id: profile.id, displayName: profile.displayName, gtaArea: profile.gtaArea };
  if (viewerSignedIn && profile.showHomeChurch && profile.homeChurch) view.homeChurch = profile.homeChurch;
  return view;
}
