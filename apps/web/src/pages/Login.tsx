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
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Full screen background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url("/login-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'rgba(8, 10, 20, 0.72)',
        }}
      />

      {/* Login content above background */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <main style={{
          background: "transparent",
          color: "#f8fafc",
          fontFamily: "Inter, -apple-system, sans-serif"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            maxWidth: "448px",
            margin: "0 auto",
            minHeight: "100vh",
            padding: "32px 16px"
          }}>
        <div style={{
          textAlign: "center",
          marginBottom: "24px"
        }}>
          <div style={{
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "#111827"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l7 3v6c0 5.2-3.3 9.8-7 11-3.7-1.2-7-5.8-7-11V5l7-3z" fill="#06b6d4" />
            </svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 600 }}>Guardian</h1>
          <p style={{ marginTop: "4px", fontSize: "14px", color: "#94a3b8" }}>Your personal safety companion</p>
        </div>

        <section style={{
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(17, 24, 39, 0.85)",
          padding: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(2px)"
        }}>
          <div style={{
            marginBottom: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderRadius: "8px",
            background: "#0f172a",
            padding: "4px"
          }}>
            <button
              type="button"
              onClick={() => setTab("signin")}
              style={{
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "14px",
                transition: "all 150ms",
                background: isSignIn ? "#22c55e" : "transparent",
                color: isSignIn ? "#0a0f1a" : "#cbd5e1"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              style={{
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "14px",
                transition: "all 150ms",
                background: !isSignIn ? "#22c55e" : "transparent",
                color: !isSignIn ? "#0a0f1a" : "#cbd5e1"
              }}
            >
              Sign Up
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600 }}>{title}</h2>
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
              style={{
                height: "48px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid rgba(34,197,94,0.5)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#7dd3fc",
                cursor: "pointer",
                background: "transparent"
              }}
              onClick={continueGuest}
            >
              Continue as Guest (Demo)
            </button>
            <p style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#94a3b8"
            }}>
              Demo mode - no real account needed. Firebase auth coming soon.
            </p>
          </div>
        </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}): React.ReactElement {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block",
        marginBottom: "4px",
        fontSize: "12px",
        color: "#cbd5e1"
      }}>{props.label}</span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        style={{
          height: "48px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#0d1520",
          padding: "0 12px",
          fontSize: "14px",
          color: "#ffffff",
          outline: "none"
        }}
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
      style={{
        height: "48px",
        width: "100%",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        fontSize: "14px",
        fontWeight: 600,
        color: "#ffffff",
        cursor: props.loading ? "not-allowed" : "pointer",
        opacity: props.loading ? 0.7 : 1
      }}
    >
      {props.loading ? "Processing..." : props.text}
    </button>
  );
}

function ErrorText(props: { text: string }): React.ReactElement {
  return <div style={{ marginTop: "-4px", fontSize: "12px", color: "#f87171" }}>{props.text}</div>;
}

