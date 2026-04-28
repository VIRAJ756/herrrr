export type DemoUser = {
  name: string;
  email: string;
  loggedIn: boolean;
};

const KEY = "guardian-demo-user";
const DEMO_MODE_KEY = "guardian-demo-mode";

export function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function setDemoUser(user: DemoUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearDemoUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(getDemoUser()?.loggedIn);
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_MODE_KEY, enabled ? "true" : "false");
}

export function getDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_MODE_KEY) === "true";
}

