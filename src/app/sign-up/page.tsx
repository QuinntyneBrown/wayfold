import type { Metadata } from "next";
import { RegisterForm } from "@/features/accounts/register-form";

export const metadata: Metadata = { title: "Create account - Wayfold" };

export default function SignUpPage() {
  return (
    <div className="auth">
      <div className="auth__head">
        <h1>Create your Wayfold account</h1>
        <p>Anyone in the GTA can join the auto community.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
