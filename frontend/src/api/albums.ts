import type {
  Album,
  GetAdminAlbumsResponse,
  GetCatalogAlbumsResponse,
  GetOwnedAlbumsResponse,
} from "../types/album";
import { apiFetch } from "./client";

export const fetchCatalogAlbums = (params: {
  page?: number;
  pageSize?: number;
  q?: string;
  artistId?: number | "";
}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.q) qs.set("q", params.q);
  if (params.artistId) qs.set("artistId", String(params.artistId));
  return apiFetch<GetCatalogAlbumsResponse>(`/albums/catalog?${qs.toString()}`, {
    auth: true, // optional auth supported; if no token it is ignored by backend
  });
};

export const fetchCatalogAlbumById = (id: number) =>
  apiFetch<Album>(`/albums/catalog/${id}`, { auth: true });

export const fetchOwnedAlbums = () =>
  apiFetch<GetOwnedAlbumsResponse>(`/albums`, { auth: true });

export const removeOwnedAlbum = (albumId: number) =>
  apiFetch<void>(`/albums/me/${albumId}`, { method: "DELETE", auth: true });

export const fetchAdminAlbums = (params: {
  page?: number;
  pageSize?: number;
  q?: string;
  artistId?: number | "";
}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.q) qs.set("q", params.q);
  if (params.artistId) qs.set("artistId", String(params.artistId));
  return apiFetch<GetAdminAlbumsResponse>(`/albums/admin?${qs.toString()}`, {
    auth: true,
  });
};

export const createAlbum = (body: any) =>
  apiFetch<Album>(`/albums`, {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateAlbum = (id: number, body: any) =>
  apiFetch<Album>(`/albums/${id}`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteAlbum = (id: number) =>
  apiFetch<void>(`/albums/${id}`, { method: "DELETE", auth: true });

export const exportAlbumsCsv = async () => {
  const res = await apiFetch<Response>(`/albums/admin/export`, {
    method: "GET",
    auth: true,
    raw: true,
  });
  return res.text();
};
