import type { Artist, ArtistDetail, GetArtistsResponse } from "../types/artist";
import { apiFetch } from "./client";

export const fetchArtists = (params: { page?: number; pageSize?: number; q?: string }) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.q) qs.set("q", params.q);
  return apiFetch<GetArtistsResponse>(`/artists?${qs.toString()}`, { auth: false });
};

export const fetchArtistById = (id: number) =>
  apiFetch<ArtistDetail>(`/artists/${id}`, { auth: false });

export const createArtist = (body: { name: string; genre?: string | null }) =>
  apiFetch<ArtistDetail>(`/artists`, {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateArtist = (id: number, body: { name: string; genre?: string | null }) =>
  apiFetch<ArtistDetail>(`/artists/${id}`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteArtist = (id: number) =>
  apiFetch<void>(`/artists/${id}`, { method: "DELETE", auth: true });
