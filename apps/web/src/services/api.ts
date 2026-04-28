import axios, { type AxiosInstance } from "axios";
import { supabase } from "./supabase";

function getBaseUrl(): string {
  return (
    (import.meta.env.NEXT_PUBLIC_API_URL as string | undefined) ??
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "http://localhost:4000"
  );
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // eslint-disable-next-line no-console
    console.error("API request failed", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      message: error?.message,
    });
    return Promise.reject(error);
  },
);

