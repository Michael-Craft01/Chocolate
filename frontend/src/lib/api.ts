"use client";

import { createClient } from "@/lib/supabase";

/**
 * Robust API URL Resolver
 * Ensures we always hit the Lead Engine on port 3000 during development,
 * even if environment variables are missing or cached incorrectly.
 */
const resolveApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, "");
  }
  
  // Support both localhost and 127.0.0.1
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return "http://localhost:3005";
  }

  return (envUrl || "").replace(/\/$/, "");
};

const apiBaseUrl = resolveApiBaseUrl();

// Debugging: Log the target on every load
if (typeof window !== 'undefined') {
  console.log(`%c[Chocolate API] Backend: ${apiBaseUrl}`, "color: #3b82f6; font-weight: bold;");
}

export class ApiAuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "ApiAuthError";
  }
}

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new ApiAuthError();

  // Ensure path starts with /
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${apiBaseUrl}${sanitizedPath}`;

  // Dev logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 [API] ${init.method || 'GET'} ${fullUrl}`);
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(fullUrl, {
    ...init,
    headers,
  });
}

export async function authJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authFetch(path, init);
  let payload: any = null;
  try {
    payload = await response.json();
  } catch (e) {
    // Ignore JSON parse errors for 404s/500s
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Request failed (${response.status})`;
    throw new ApiRequestError(response.status, message);
  }

  return (payload ?? {}) as T;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}
