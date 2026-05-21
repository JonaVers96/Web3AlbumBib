import type { Entity, PaginatedListResponse } from "./common";

export interface Album extends Entity {
  title: string;
  dateReleased: string; // ISO
  lengthSeconds: number | null;
  trackCount: number | null;
  priceCents: number;
  coverImageUrl: string | null;
  artist: { id: number; name: string };
  isOwned?: boolean;
}
export interface SaveAlbumRequest {
  title: string;
  artistId: number;
  dateReleased: string;
  trackCount: number | null;
  lengthSeconds: number | null;
  priceCents: number;
  coverImageUrl: string | null;
}

export type GetCatalogAlbumsResponse = PaginatedListResponse<Album>;
export type GetAdminAlbumsResponse = PaginatedListResponse<Album>;

export interface GetOwnedAlbumsResponse {
  items: Album[];
}
