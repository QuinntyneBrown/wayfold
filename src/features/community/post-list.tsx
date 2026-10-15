"use client";

import { type FormEvent, useState } from "react";
import { CONNECTION_INTERRUPTED, SAVE_FAILED, type ToastMessage } from "./community-toast";
import type { PostComment, PostItem } from "./post-service";

type Props = { posts: PostItem[]; onChange: (posts: PostItem[]) => void; onToast: (toast: ToastMessage) => void };

/** Posts with their likes, comments and, for the author, Delete. Text is rendered as text, never as HTML. */
export function PostList({ posts, onChange, onToast }: Props) {
  const update = (post: PostItem) => onChange(posts.map((p) => (p.id === post.id ? post : p)));
  const remove = (id: string) => onChange(posts.filter((p) => p.id !== id));

  return (
    <section className="stack" aria-label="Latest posts">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={update} onRemove={remove} onToast={onToast} />
      ))}
    </section>
  );
}

type CardProps = {
  post: PostItem;
  onUpdate: (post: PostItem) => void;
  onRemove: (id: string) => void;
  onToast: (toast: ToastMessage) => void;
};

function PostCard({ post, onUpdate, onRemove, onToast }: CardProps) {
  const [busy, setBusy] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  /** Runs a request, hands a successful response to `done`, and reports a failure as a toast. */
  async function call(path: string, init: RequestInit, done: (response: Response) => Promise<void> | void, onBadRequest?: (response: Response) => Promise<void>) {
    try {
      const response = await fetch(path, init);
      if (response.ok) await done(response);
      else if (response.status === 400 && onBadRequest) await onBadRequest(response);
      else onToast(SAVE_FAILED);
    } catch {
      onToast(CONNECTION_INTERRUPTED);
    }
  }

  async function toggleLike() {
    setBusy(true);
    await call(`/api/posts/${post.id}/like`, { method: "POST" }, async (response) => {
      const { liked, likes } = await response.json();
      onUpdate({ ...post, liked, likes });
    });
    setBusy(false);
  }

  async function deletePost() {
    setBusy(true);
    await call(`/api/posts/${post.id}`, { method: "DELETE" }, () => onRemove(post.id));
    setBusy(false);
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCommenting(true);
    setCommentError(null);
    await call(
      `/api/posts/${post.id}/comments`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: new FormData(form).get("comment") }),
      },
      async (response) => {
        const comment: PostComment = await response.json();
        onUpdate({ ...post, comments: [...post.comments, comment] });
        form.reset();
      },
      async (response) => setCommentError((await response.json()).fieldErrors?.text ?? "Check this field"),
    );
    setCommenting(false);
  }

  const { author } = post;
  const commentId = `comment-${post.id}`;

  return (
    <article className="card post stack">
      <p>
        <strong>{author.displayName}</strong> · {post.topic}
        {author.gtaArea ? ` · ${author.gtaArea}` : ""}{" "}
        {author.homeChurch && (
          <span className="tag church-tag">
            <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 3v18M7 8h10" />
            </svg>
            {author.homeChurch}
          </span>
        )}
      </p>
      <p>{post.text}</p>
      <div className="cluster">
        <button type="button" className="btn btn--sm" aria-pressed={post.liked} disabled={busy} onClick={toggleLike}>
          Like · {post.likes}
        </button>
        <span>
          {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </span>
        {post.mine && (
          <button type="button" className="btn btn--sm btn--ghost" disabled={busy} onClick={deletePost}>
            Delete post
          </button>
        )}
      </div>
      {post.comments.length > 0 && (
        <ul className="stack">
          {post.comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.author.displayName}:</strong> {comment.text}
            </li>
          ))}
        </ul>
      )}
      <form className="stack" noValidate onSubmit={addComment}>
        <div className="field">
          <label className="field__label" htmlFor={commentId}>
            Add a comment (up to 500 characters)
          </label>
          <textarea
            className="textarea"
            id={commentId}
            name="comment"
            rows={2}
            aria-invalid={commentError ? true : undefined}
            aria-describedby={commentError ? `${commentId}-error` : undefined}
          />
          {commentError && (
            <span className="field__error" id={`${commentId}-error`}>
              {commentError}
            </span>
          )}
        </div>
        <button className="btn" type="submit" disabled={commenting} aria-busy={commenting || undefined}>
          {commenting ? "Sending…" : "Comment"}
        </button>
      </form>
    </article>
  );
}
