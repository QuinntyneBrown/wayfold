"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/alert/alert";
import { TextField } from "@/components/text-field/text-field";
import { AuthLoading } from "./auth-loading";
import { useSignedOutOnly } from "./use-signed-out-only";

type Problem = "invalid" | "rejected" | "locked" | "error";

export function SignInForm() {
  const signedOut = useSignedOutOnly();
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      // A full page load, so the header picks up the new session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      if (response.ok) return window.location.assign("/");
      if (response.status === 400) {
        setFieldErrors((await response.json()).fieldErrors ?? {});
        return setProblem("invalid");
      }
      setFieldErrors({});
      setProblem(response.status === 401 ? "rejected" : response.status === 429 ? "locked" : "error");
    } catch {
      setFieldErrors({});
      setProblem("error");
    }
    setSubmitting(false);
  }

  if (!signedOut) return <AuthLoading />;

  return (
    <>
      <form className="card stack" noValidate onSubmit={submit} inert={submitting}>
        {problem === "invalid" && (
          <Alert tone="danger" title="Check these fields">
            Please correct the marked fields.
          </Alert>
        )}
        {problem === "rejected" && (
          <Alert tone="danger" title="Email or password is incorrect">
            Check them and try again.
          </Alert>
        )}
        {problem === "locked" && (
          <Alert tone="warning" title="Too many attempts">
            Wait 15 minutes before trying again.
          </Alert>
        )}
        {problem === "error" && (
          <Alert tone="danger" title="Something went wrong">
            Try again in a moment.
          </Alert>
        )}
        <TextField id="email" name="email" label="Email" type="email" autoComplete="email" error={fieldErrors.email} />
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={fieldErrors.password}
        />
        <button className="btn btn--primary" type="submit" disabled={submitting} aria-busy={submitting || undefined}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p>
        New here? <Link href="/sign-up">Create an account</Link>.
      </p>
    </>
  );
}
