"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { CommunityToast, type ToastMessage } from "./community-toast";
import { PostComposer } from "./post-composer";
import { PostList } from "./post-list";
import type { PostItem } from "./post-service";

type Load = { state: "loading" } | { state: "failed" } | { state: "ready"; posts: PostItem[] };

/** The signed-in member's feed; when the server says the session is gone, shows `fallback` (the public landing page). */
export function Feed({ fallback }: { fallback: ReactNode }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [signedOut, setSignedOut] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoad({ state: "loading" });
    try {
      const response = await fetch("/api/feed");
      if (response.status === 401) return setSignedOut(true);
      if (!response.ok) return setLoad({ state: "failed" });
      setLoad({ state: "ready", posts: (await response.json()).posts });
    } catch {
      setLoad({ state: "failed" });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchFeed();
  }, [fetchFeed]);

  if (signedOut) return fallback;

  const head = (
    <div className="page-head">
      <h1>Your feed</h1>
      <p>{load.state === "ready" ? "Cars, questions and recommendations from members you follow." : "Cars and people you follow."}</p>
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
        <button type="button" className="btn" onClick={fetchFeed}>
          Try again
        </button>
      </div>
    );
  }

  const setPosts = (posts: PostItem[]) => setLoad({ state: "ready", posts });

  return (
    <div className="container stack">
      {head}
      <PostComposer onPublished={(post) => setPosts([post, ...load.posts])} onToast={setToast} />
      {load.posts.length === 0 ? (
        <section className="card stack">
          <h2>Nothing here yet</h2>
          <p>New activity will appear here as people join the community.</p>
        </section>
      ) : (
        <PostList posts={load.posts} onChange={setPosts} onToast={setToast} />
      )}
      <CommunityToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
