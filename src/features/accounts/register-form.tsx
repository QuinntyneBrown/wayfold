"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { TextField } from "@/components/text-field/text-field";
import { AuthLoading } from "./auth-loading";
import { useSignedOutOnly } from "./use-signed-out-only";

type Problem = "invalid" | "duplicate" | "error";

export function RegisterForm() {
  const signedOut = useSignedOutOnly();
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (response.status === 201) return setRegistered(true);
      if (response.status === 400) {
        setFieldErrors((await response.json()).fieldErrors ?? {});
        return setProblem("invalid");
      }
      setFieldErrors({});
      setProblem(response.status === 409 ? "duplicate" : "error");
    } catch {
      setFieldErrors({});
      setProblem("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!signedOut) return <AuthLoading />;

  if (registered) {
    return (
      <section className="card stack">
        <h2>You&apos;re in</h2>
        <p>Your account is ready. Start by adding a car to your garage.</p>
        {/* A full page load, so the header picks up the new session. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="btn btn--primary" href="/">
          Add your first car
        </a>
      </section>
    );
  }

  return (
    <>
      <form className="card stack" noValidate onSubmit={submit} inert={submitting}>
        {problem === "invalid" && (
          <Alert tone="danger" title="Check these fields">
            Please correct the marked fields.
          </Alert>
        )}
        {problem === "duplicate" && (
          <Alert tone="danger" title="We couldn't create your account">
            Check your details, or sign in if you already have an account.
          </Alert>
        )}
        {problem === "error" && (
          <Alert tone="danger" title="Something went wrong">
            Try again in a moment.
          </Alert>
        )}
        <TextField id="name" name="displayName" label="Display name" autoComplete="name" error={fieldErrors.displayName} />
        <TextField id="email" name="email" label="Email" type="email" autoComplete="email" error={fieldErrors.email} />
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.password}
        />
        <button className="btn btn--primary" type="submit" disabled={submitting} aria-busy={submitting || undefined}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p>
        Already have an account? <Link href="/sign-in">Sign in</Link>.
      </p>
    </>
  );
}
