import type { Metadata } from "next";
import { SignInForm } from "@/features/accounts/sign-in-form";

export const metadata: Metadata = { title: "Sign in - Wayfold" };

export default function SignInPage() {
  return (
    <div className="auth">
      <div className="auth__head">
        <h1>Sign in to Wayfold</h1>
        <p>Welcome back to your GTA auto community.</p>
      </div>
      <SignInForm />
    </div>
  );
}
