import { env } from './env';
import { ApiError, normalizeError } from './errors';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
};

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${env.API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${env.API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data.data?.accessToken ?? null;
    if (newToken) setAccessToken(newToken);
    return newToken;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders as Record<string, string>,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = buildUrl(path, params);

  let res = await fetch(url, {
    ...rest,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && accessToken) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, {
        ...rest,
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      errorBody?.message ?? 'Something went wrong',
      errorBody?.errorCode ?? 'UNKNOWN',
      errorBody?.errors,
    );
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();
  return json.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  del: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
