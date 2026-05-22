import type { Entity, PaginatedListResponse } from './common';
import type { Artist } from './artist';

export interface Album extends Entity {
  title: string;
  dateReleased: string;
  lengthSeconds: number | null;
  trackCount: number | null;
  priceCents: number;
  coverImageUrl: string | null;
  artist: Pick<Artist, 'id' | 'name'>;

  /** Only present on catalog endpoints. */
  isOwned?: boolean;
}

export interface AlbumCatalogQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  artistId?: number;
}

export interface AlbumCreateInput {
  title: string;
  dateReleased: string;
  lengthSeconds?: number | null;
  trackCount?: number | null;
  priceCents: number;
  coverImageUrl?: string | null;
  artistId: number;
}

export interface AlbumUpdateInput extends AlbumCreateInput {}

export interface CreateAlbumRequest extends AlbumCreateInput {}
export interface UpdateAlbumRequest extends AlbumUpdateInput {}

export interface GetCatalogAlbumsResponse extends PaginatedListResponse<Album> {}
export interface GetAdminAlbumsResponse extends PaginatedListResponse<Album> {}
export interface GetOwnedAlbumsResponse {
  items: Album[];
}

export interface GetAlbumByIdResponse extends Album {}
export interface CreateAlbumResponse extends Album {}
export interface UpdateAlbumResponse extends Album {}
