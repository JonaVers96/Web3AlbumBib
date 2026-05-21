import type {
  Album,
  GetAdminAlbumsResponse,
  GetCatalogAlbumsResponse,
  GetOwnedAlbumsResponse,
  SaveAlbumRequest,
} from "../types/album";
import { apiFetch, API_URL, getToken } from "./client";

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
    auth: true, 
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

export const createAlbum = (body: SaveAlbumRequest) =>
  apiFetch<Album>(`/albums`, {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateAlbum = (id: number, body: SaveAlbumRequest) =>
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

export const exportCatalogCsv = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/albums/admin/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Het exporteren is mislukt");
  }

  const blob = await response.blob();
  
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "albums.csv"; // De naam van het bestand
  document.body.appendChild(link);
  link.click();

    document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
