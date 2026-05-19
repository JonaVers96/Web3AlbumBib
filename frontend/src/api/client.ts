import type { ApiErrorBody } from "../types/common";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:9000";

export const API_URL =
  import.meta.env.VITE_API_URL ?? `${BACKEND_URL}/api`;

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.status = status;
    this.body = body;
    this.name = "ApiError";
  }
}

export const getToken = () => localStorage.getItem("token") ?? "";

export const setToken = (token: string) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  raw?: boolean;
};

export const apiFetch = async <T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const headers = new Headers(options.headers ?? {});

  if (!options.raw) {
    headers.set("Accept", "application/json");
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const body = isJson ? ((await res.json().catch(() => undefined)) as ApiErrorBody | undefined) : undefined;
    throw new ApiError(res.status, body?.message ?? res.statusText, body);
  }

  if (options.raw) return (res as unknown) as T;
  if (!isJson) return (undefined as unknown) as T;
  return (await res.json()) as T;
};

export const resolveImageUrl = (coverImageUrl?: string | null) => {
  if (!coverImageUrl) return "";
  if (coverImageUrl.startsWith("http")) return coverImageUrl;
  // covers come from /uploads (not /api)
  return `${BACKEND_URL}${coverImageUrl}`;
};

export const formatPrice = (priceCents: number) =>
  `€ ${(priceCents / 100).toFixed(2)}`;
