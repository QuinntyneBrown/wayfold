"use client";

import { notFound, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { CommunityToast, SAVE_FAILED, type ToastMessage } from "./community-toast";
import { EditProfileDialog } from "./edit-profile-dialog";
import { CarDialog } from "@/features/garage/car-dialog";
import { GarageSection } from "@/features/garage/garage-section";
import type { Car } from "@/features/garage/garage-service";
import { RemoveCarDialog } from "@/features/garage/remove-car-dialog";
import { FollowButton } from "./follow-button";
import { PostList } from "./post-list";
import type { PostItem } from "./post-service";

export type Profile = {
  id: string;
  displayName: string;
  gtaArea: string | null;
  bio: string | null;
  homeChurch?: string;
  followers: number;
  following: boolean;
  isOwner: boolean;
  garage: Car[];
  posts: PostItem[];
  listings: unknown[];
  recommendations: unknown[];
};

type Load = { state: "loading" } | { state: "failed" } | { state: "ready"; profile: Profile };

const SECTIONS = [
  { key: "garage", label: "Garage", empty: "No cars in this garage yet." },
  { key: "for-sale", label: "For sale", empty: "Nothing for sale right now." },
  { key: "recommendations", label: "Recommendations", empty: "No recommendations yet." },
  { key: "posts", label: "Posts", empty: "No posts yet." },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

function initialSection(): SectionKey {
  if (typeof window === "undefined") return "garage";
  const hash = window.location.hash.slice(1);
  return SECTIONS.find((section) => section.key === hash)?.key ?? "garage";
}

export function MemberProfile({ id }: { id: string }) {
  const router = useRouter();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [missing, setMissing] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoad({ state: "loading" });
    try {
      const response = await fetch(`/api/members/${id}`);
      if (response.status === 401) return router.replace("/sign-in");
      if (response.status === 404) return setMissing(true);
      if (!response.ok) return setLoad({ state: "failed" });
      setLoad({ state: "ready", profile: await response.json() });
    } catch {
      setLoad({ state: "failed" });
    }
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProfile();
  }, [fetchProfile]);

  if (missing) notFound();

  const head = (
    <div className="page-head">
      <h1>{load.state === "ready" ? load.profile.displayName : "Member profile"}</h1>
      <p>{load.state === "ready" ? "A member of the GTA auto community." : "Cars, sales and recommendations."}</p>
    </div>
  );

  if (load.state === "loading") {
    return (
      <div className="container stack" aria-busy="true">
        {head}
        <div className="card stack" aria-hidden="true">
          <span className="skeleton skeleton--text" style={{ width: "65%" }} />
          <span className="skeleton skeleton--text" style={{ width: "95%" }} />
          <span className="skeleton skeleton--text" style={{ width: "80%" }} />
          <span className="skeleton skeleton--text" style={{ width: "45%" }} />
        </div>
        <p role="status">Loading…</p>
      </div>
    );
  }

  if (load.state === "failed") {
    return (
      <div className="container stack">
        {head}
        <Alert tone="danger" title="Could not load this page">
          Try again. Your information is safe.
        </Alert>
        <button type="button" className="btn" onClick={fetchProfile}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="container stack">
      {head}
      <ProfileBody profile={load.profile} onChange={(change) => setLoad({ state: "ready", profile: { ...load.profile, ...change } })} />
    </div>
  );
}

function ProfileBody({ profile, onChange }: { profile: Profile; onChange: (change: Partial<Profile>) => void }) {
  const [section, setSection] = useState<SectionKey>(initialSection);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [carDialog, setCarDialog] = useState<{ kind: "add" } | { kind: "edit"; car: Car } | { kind: "remove"; car: Car } | null>(null);
  const editDialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLElement>(null);
  const initials = profile.displayName
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const followers = `${profile.followers} ${profile.followers === 1 ? "follower" : "followers"}`;
  const active = SECTIONS.find((s) => s.key === section)!;

  return (
    <>
      <section className="member-head card" aria-label="Member details">
        <div className="avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <h2>{profile.displayName}</h2>
          <p>{[profile.gtaArea, followers].filter(Boolean).join(" · ")}</p>
          {profile.homeChurch && (
            <span className="tag church-tag">
              <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12 3v18M7 8h10" />
              </svg>
              {profile.homeChurch}
            </span>
          )}
          {profile.bio && <p>{profile.bio}</p>}
        </div>
        <div className="cluster">
          {profile.isOwner && (
            <button type="button" className="btn" aria-haspopup="dialog" onClick={() => editDialog.current?.showModal()}>
              Edit profile
            </button>
          )}
          {profile.isOwner && (
            <button type="button" className="btn btn--primary" aria-haspopup="dialog" onClick={() => setCarDialog({ kind: "add" })}>
              Add a car
            </button>
          )}
          {!profile.isOwner && (
            <FollowButton
              memberId={profile.id}
              firstName={profile.displayName.split(/\s+/)[0]}
              following={profile.following}
              onChange={(following, followers) => onChange({ following, followers })}
              onError={() => setToast(SAVE_FAILED)}
            />
          )}
        </div>
      </section>
      {profile.isOwner && <EditProfileDialog ref={editDialog} bio={profile.bio} onSaved={(bio) => onChange({ bio })} />}
      <nav className="segmented" aria-label="Profile sections">
        {SECTIONS.map(({ key, label }) => (
          <button key={key} type="button" aria-pressed={section === key} onClick={() => setSection(key)}>
            {label}
          </button>
        ))}
      </nav>
      <section ref={content} aria-label="Profile content" tabIndex={-1}>
        {section === "garage" ? (
          <GarageSection
            cars={profile.garage}
            isOwner={profile.isOwner}
            onEdit={(car) => setCarDialog({ kind: "edit", car })}
            onRemove={(car) => setCarDialog({ kind: "remove", car })}
          />
        ) : section === "posts" && profile.posts.length > 0 ? (
          <PostList posts={profile.posts} onChange={(posts) => onChange({ posts })} onToast={setToast} />
        ) : (
          <p>{active.empty}</p>
        )}
      </section>
      {carDialog && carDialog.kind !== "remove" && (
        <CarDialog
          car={carDialog.kind === "edit" ? carDialog.car : undefined}
          onSaved={(saved) =>
            onChange({ garage: carDialog.kind === "edit" ? profile.garage.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...profile.garage] })
          }
          onClose={() => setCarDialog(null)}
        />
      )}
      {carDialog?.kind === "remove" && (
        <RemoveCarDialog
          car={carDialog.car}
          onRemoved={(removed) => {
            onChange({ garage: profile.garage.filter((c) => c.id !== removed.id) });
            content.current?.focus();
          }}
          onClose={() => setCarDialog(null)}
        />
      )}
      <CommunityToast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
