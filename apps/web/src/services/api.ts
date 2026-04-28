import axios, { type AxiosInstance } from "axios";
import { supabase } from "./supabase";

function getBaseUrl(): string {
  return (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";
}

export const api: AxiosInstance = axios.create({
  baseURL: `${getBaseUrl()}/api`,
  timeout: 20_000,
});

api.interceptors.request.use(async (config) => {
  // Auth is optional in the local SQLite build; this resolves to null.
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

