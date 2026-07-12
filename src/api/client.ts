import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || '';
const PREFIX = '/api/v1';

/** In-memory access token. Refresh token lives in an HTTP-only cookie. */
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
export function getAccessToken(): string | null {
  return accessToken;
}
export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn;
}

export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}${PREFIX}`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

/** Normalized client-side error surfaced to the UI. */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly fieldErrors: ApiError['errors'];
  constructor(status: number, body: Partial<ApiError>) {
    super(body.message ?? 'Request failed');
    this.name = 'ApiClientError';
    this.status = status;
    this.code = body.code ?? 'UNKNOWN';
    this.fieldErrors = body.errors ?? [];
  }
}

/** Token refresh queue — prevents concurrent refresh calls and race conditions. */
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<{ data: { accessToken: string } }>(
      `${API_URL}${PREFIX}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = res.data.data.accessToken;
    setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status ?? 0;
    const isAuthRoute = /\/auth\/(?:login|register|refresh|forgot|reset|verify)/.test(original?.url ?? '');

    // Attempt a single transparent refresh on 401 (except for auth routes).
    if (status === 401 && original && !original._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token) {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          }
          throw new ApiClientError(401, { message: 'Session expired' });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const token = await refreshAccessToken();
        processQueue(null, token);
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
        onUnauthorized?.();
      } catch (err) {
        processQueue(err, null);
        onUnauthorized?.();
      } finally {
        isRefreshing = false;
      }
    }

    const body = error.response?.data;
    throw new ApiClientError(status, body ?? { message: error.message });
  },
);
