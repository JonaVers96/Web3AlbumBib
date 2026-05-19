import type { Entity, PaginatedListResponse } from './common';

export interface Artist extends Entity {
  name: string;
  genre: string | null;
}

export interface ArtistDetail extends Artist {
  albumCount: number;
}

export interface ArtistQuery {
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface ArtistCreateInput {
  name: string;
  genre: string | null;
}

export interface ArtistUpdateInput extends ArtistCreateInput {}

export interface CreateArtistRequest extends ArtistCreateInput {}
export interface UpdateArtistRequest extends ArtistUpdateInput {}

export interface GetAllArtistsResponse extends PaginatedListResponse<Artist> {}
export interface GetArtistByIdResponse extends ArtistDetail {}
export interface CreateArtistResponse extends GetArtistByIdResponse {}
export interface UpdateArtistResponse extends GetArtistByIdResponse {}
