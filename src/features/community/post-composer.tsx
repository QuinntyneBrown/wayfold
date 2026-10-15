"use client";

import { type FormEvent, useState } from "react";
import { CONNECTION_INTERRUPTED, SAVE_FAILED, type ToastMessage } from "./community-toast";
import type { PostItem } from "./post-service";
import { TOPICS } from "./topics";

type Props = { onPublished: (post: PostItem) => void; onToast: (toast: ToastMessage) => void };

/** Writes a post with an auto topic; the text stays in the field when publishing fails. */
export function PostComposer({ onPublished, onToast }: Props) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setErrors({});
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: data.get("topic"), text: data.get("text") }),
      });
      if (response.ok) {
        onPublished(await response.json());
        form.reset();
        onToast({ tone: "success", title: "Posted", text: "Your post is on your feed." });
      } else if (response.status === 400) {
        setErrors((await response.json()).fieldErrors ?? {});
      } else {
        onToast(SAVE_FAILED);
      }
    } catch {
      onToast(CONNECTION_INTERRUPTED);
    }
    setBusy(false);
  }

  return (
    <form className="card stack" aria-labelledby="composer-title" noValidate onSubmit={submit}>
      <h2 id="composer-title">Share with your community</h2>
      <div className="field">
        <label className="field__label" htmlFor="topic">
          Auto topic
        </label>
        <select
          className="select"
          id="topic"
          name="topic"
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={errors.topic ? "topic-error" : undefined}
        >
          {TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
        {errors.topic && (
          <span className="field__error" id="topic-error">
            {errors.topic}
          </span>
        )}
      </div>
      <div className="field">
        <label className="field__label" htmlFor="post-text">
          What would you like to share?
        </label>
        <textarea
          className="textarea"
          id="post-text"
          name="text"
          rows={4}
          aria-invalid={errors.text ? true : undefined}
          aria-describedby={errors.text ? "post-text-error" : undefined}
        />
        {errors.text && (
          <span className="field__error" id="post-text-error">
            {errors.text}
          </span>
        )}
      </div>
      <button className="btn btn--primary" type="submit" disabled={busy} aria-busy={busy || undefined}>
        {busy ? "Posting…" : "Post to feed"}
      </button>
    </form>
  );
}
