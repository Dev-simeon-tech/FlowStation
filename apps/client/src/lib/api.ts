/**
 * apiFetch — thin wrapper around fetch that:
 *  - Prefixes every request with the API base URL
 *  - Reads the stored token from localStorage and attaches Authorization header
 *  - Throws on non-2xx responses with the server's error message
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let token: string | null = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) token = JSON.parse(stored)?.token ?? null;
  } catch {
    /* ignore */
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const BASE_URL = import.meta.env.VITE_API_URL ?? "";

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || body.message || `Request failed (${res.status})`,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
