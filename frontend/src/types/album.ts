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

export type GetCatalogAlbumsResponse = PaginatedListResponse<Album>;
export type GetAdminAlbumsResponse = PaginatedListResponse<Album>;

export interface GetOwnedAlbumsResponse {
  items: Album[];
}
