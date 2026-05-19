import type { Entity, PaginatedListResponse } from "./common";

export interface Artist extends Entity {
  name: string;
  genre: string | null;
}

export interface ArtistDetail extends Artist {
  albumCount: number;
}

export type GetArtistsResponse = PaginatedListResponse<Artist>;
