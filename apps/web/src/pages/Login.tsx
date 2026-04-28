import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDemoUser } from "../services/auth";

type Tab = "signin" | "signup";

export default function Login(): React.ReactElement {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSignIn = tab === "signin";
  const title = useMemo(() => (isSignIn ? "Sign In" : "Sign Up"), [isSignIn]);

  async function fakeProcess(action: () => void): Promise<void> {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    action();
    setLoading(false);
    navigate("/dashboard");
  }

  function validateSignIn(): boolean {
    const next: Record<string, string> = {};
    if (!signinEmail.includes("@")) next.signinEmail = "Enter a valid email address.";
    if (signinPassword.length < 6) next.signinPassword = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateSignUp(): boolean {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!signupEmail.includes("@")) next.signupEmail = "Enter a valid email address.";
    if (signupPassword.length < 6) next.signupPassword = "Password must be at least 6 characters.";
    if (confirmPassword !== signupPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submitSignIn(): void {
    if (!validateSignIn()) return;
    void fakeProcess(() =>
      setDemoUser({
        name: signinEmail.split("@")[0] || "Guardian User",
        email: signinEmail,
        loggedIn: true,
      }),
    );
  }

  function submitSignUp(): void {
    if (!validateSignUp()) return;
    void fakeProcess(() =>
      setDemoUser({
        name,
        email: signupEmail,
        loggedIn: true,
      }),
    );
  }

  function continueGuest(): void {
    void fakeProcess(() =>
      setDemoUser({
        name: "Demo User",
        email: "demo@guardian.app",
        loggedIn: true,
      }),
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-[#f8fafc]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-[#1a2235]">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l7 3v6c0 5.2-3.3 9.8-7 11-3.7-1.2-7-5.8-7-11V5l7-3z" fill="#06b6d4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Guardian</h1>
          <p className="mt-1 text-sm text-slate-400">Your personal safety companion</p>
        </div>

        <section className="rounded-xl border border-white/10 bg-[#111827] p-4 shadow-xl">
          <div className="mb-4 grid grid-cols-2 rounded-lg bg-[#0f172a] p-1">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`rounded-md px-3 py-2 text-sm transition ${isSignIn ? "bg-[#06b6d4] text-[#001018]" : "text-slate-300"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-md px-3 py-2 text-sm transition ${!isSignIn ? "bg-[#06b6d4] text-[#001018]" : "text-slate-300"}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold">{title}</h2>
            {isSignIn ? (
              <>
                <Field label="Email" value={signinEmail} onChange={setSigninEmail} type="email" />
                {errors.signinEmail ? <ErrorText text={errors.signinEmail} /> : null}
                <Field label="Password" value={signinPassword} onChange={setSigninPassword} type="password" />
                {errors.signinPassword ? <ErrorText text={errors.signinPassword} /> : null}
                <PrimaryButton loading={loading} onClick={submitSignIn} text="Sign In" />
              </>
            ) : (
              <>
                <Field label="Full Name" value={name} onChange={setName} />
                {errors.name ? <ErrorText text={errors.name} /> : null}
                <Field label="Email" value={signupEmail} onChange={setSignupEmail} type="email" />
                {errors.signupEmail ? <ErrorText text={errors.signupEmail} /> : null}
                <Field label="Password" value={signupPassword} onChange={setSignupPassword} type="password" />
                {errors.signupPassword ? <ErrorText text={errors.signupPassword} /> : null}
                <Field
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type="password"
                />
                {errors.confirmPassword ? <ErrorText text={errors.confirmPassword} /> : null}
                <PrimaryButton loading={loading} onClick={submitSignUp} text="Create Account" />
              </>
            )}
            <button
              type="button"
              className="h-12 w-full rounded-lg border border-[#06b6d4]/50 text-sm font-semibold text-[#7dd3fc]"
              onClick={continueGuest}
            >
              Continue as Guest (Demo)
            </button>
            <p className="text-center text-xs text-slate-400">
              Demo mode - no real account needed. Firebase auth coming soon.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}): React.ReactElement {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300">{props.label}</span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="h-12 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm outline-none focus:border-[#06b6d4]"
      />
    </label>
  );
}

function PrimaryButton(props: {
  loading: boolean;
  onClick: () => void;
  text: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.loading}
      className="h-12 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-semibold text-white disabled:opacity-70"
    >
      {props.loading ? "Processing..." : props.text}
    </button>
  );
}

function ErrorText(props: { text: string }): React.ReactElement {
  return <div className="-mt-1 text-xs text-red-400">{props.text}</div>;
}

