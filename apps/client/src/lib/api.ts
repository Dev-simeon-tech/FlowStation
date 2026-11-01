import { API_VERSION } from "@flowstation/constants";

interface ApiAuthHandlers {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string>;
  onUnauthorized: () => void;
}

let authHandlers: ApiAuthHandlers | null = null;

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/$/,
  "",
);

export function configureApiAuth(handlers: ApiAuthHandlers) {
  authHandlers = handlers;
  return () => {
    if (authHandlers === handlers) authHandlers = null;
  };
}

function getRequestUrl(path: string) {
  const versionedApiPrefix = `/api/${API_VERSION}/`;
  if (path.startsWith("/api/") && !path.startsWith(versionedApiPrefix)) {
    path = `${versionedApiPrefix}${path.slice("/api/".length)}`;
  }
  return `${API_BASE_URL}${path}`;
}

function createHeaders(options: RequestInit, token: string | null) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function getErrorMessage(response: Response) {
  const body = await response.json().catch(() => ({}));
  return (
    body.error.message || body.message || `Request failed (${response.status})`
  );
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const handlers = authHandlers;
  let token = handlers?.getAccessToken() ?? null;
  const url = getRequestUrl(path);
  const sendRequest = (accessToken: string | null) =>
    fetch(url, {
      ...options,
      headers: createHeaders(options, accessToken),
    });

  let response = await sendRequest(token);

  if (response.status === 401 && handlers) {
    try {
      token = await handlers.refreshAccessToken();
    } catch (error) {
      handlers.onUnauthorized();
      throw new Error(
        error instanceof Error
          ? `Unauthorized: ${error.message}`
          : "Unauthorized. Please log in again.",
        { cause: error },
      );
    }

    response = await sendRequest(token);
    if (response.status === 401) {
      handlers.onUnauthorized();
      throw new Error("Unauthorized. Please log in again.");
    }
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
