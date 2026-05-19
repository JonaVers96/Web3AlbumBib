import type { Prisma } from '@prisma/client';
import { prisma } from '../data';
import type {
  Album,
  AlbumCatalogQuery,
  AlbumCreateInput,
  AlbumUpdateInput,
} from '../types/album';
import ServiceError from '../core/serviceError';
import handleDBError from './_handleDBError';
import * as artistService from './artist';

const ALBUM_SELECT = {
  id: true,
  title: true,
  dateReleased: true,
  lengthSeconds: true,
  trackCount: true,
  priceCents: true,
  coverImageUrl: true,
  artist: {
    select: { id: true, name: true },
  },
} as const;

const normalizeCatalogQuery = (query: AlbumCatalogQuery) => {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 12)));
  const q = query.q?.trim() ? query.q.trim() : undefined;
  const artistId = query.artistId ? Number(query.artistId) : undefined;

  return { page, pageSize, q, artistId };
};

const buildCatalogWhere = (
  q?: string,
  artistId?: number,
): Prisma.AlbumWhereInput => {
  const where: Prisma.AlbumWhereInput = {};
  if (artistId) {
    where.artistId = artistId;
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { artist: { name: { contains: q } } },
    ];
  }
  return where;
};

export const getCatalog = async (query: AlbumCatalogQuery, userId?: number) => {
  const { page, pageSize, q, artistId } = normalizeCatalogQuery(query);
  const where = buildCatalogWhere(q, artistId);

  const [total, rows] = await Promise.all([
    prisma.album.count({ where }),
    prisma.album.findMany({
      where,
      select: ALBUM_SELECT,
      orderBy: { title: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const items = rows as unknown as Album[];

  if (!userId || items.length === 0) {
    return { items, page, pageSize, total };
  }

  const owned = await prisma.userAlbum.findMany({
    where: {
      userId,
      albumId: { in: items.map((a) => a.id) },
    },
    select: { albumId: true },
  });

  const ownedIds = new Set(owned.map((o) => o.albumId));
  return {
    items: items.map((a) => ({ ...a, isOwned: ownedIds.has(a.id) })),
    page,
    pageSize,
    total,
  };
};

export const getAdminList = async (query: AlbumCatalogQuery) => {
  // admin list = catalog list, but without isOwned
  return getCatalog(query, undefined);
};

export const getCatalogById = async (
  id: number,
  userId?: number,
): Promise<Album> => {
  const album = await prisma.album.findUnique({
    where: { id },
    select: ALBUM_SELECT,
  });

  if (!album) {
    throw ServiceError.notFound(`Album with id ${id} not found`);
  }

  const result = album as unknown as Album;

  if (!userId) {
    return result;
  }

  const owned = await prisma.userAlbum.findUnique({
    where: { userId_albumId: { userId, albumId: id } },
  });

  return {
    ...result,
    isOwned: Boolean(owned),
  };
};

export const getOwned = async (userId: number): Promise<Album[]> => {
  const rows = await prisma.album.findMany({
    where: { owners: { some: { userId } } },
    select: ALBUM_SELECT,
    orderBy: { title: 'asc' },
  });

  return rows as unknown as Album[];
};

export const removeOwned = async (
  userId: number,
  albumId: number,
): Promise<void> => {
  try {
    await prisma.userAlbum.delete({
      where: { userId_albumId: { userId, albumId } },
    });
  } catch (error) {
    throw handleDBError(error);
  }
};

export const create = async (input: AlbumCreateInput): Promise<Album> => {
  const {
    title,
    dateReleased,
    lengthSeconds,
    trackCount,
    artistId,
    priceCents,
    coverImageUrl,
  } = input;

  try {
    await artistService.checkArtistExists(artistId);

    const album = await prisma.album.create({
      data: {
        title,
        dateReleased: new Date(dateReleased),
        lengthSeconds: lengthSeconds ?? null,
        trackCount: trackCount ?? null,
        priceCents,
        coverImageUrl: coverImageUrl ?? null,
        artistId,
      },
      select: ALBUM_SELECT,
    });

    return album as unknown as Album;
  } catch (error) {
    throw handleDBError(error);
  }
};

export const updateById = async (
  id: number,
  input: AlbumUpdateInput,
): Promise<Album> => {
  const {
    title,
    dateReleased,
    lengthSeconds,
    trackCount,
    artistId,
    priceCents,
    coverImageUrl,
  } = input;

  try {
    await artistService.checkArtistExists(artistId);

    const album = await prisma.album.update({
      where: { id },
      data: {
        title,
        dateReleased: new Date(dateReleased),
        lengthSeconds: lengthSeconds ?? null,
        trackCount: trackCount ?? null,
        priceCents,
        coverImageUrl: coverImageUrl ?? null,
        artistId,
      },
      select: ALBUM_SELECT,
    });

    return album as unknown as Album;
  } catch (error) {
    throw handleDBError(error);
  }
};

export const deleteCatalogById = async (id: number): Promise<void> => {
  try {
    await prisma.album.delete({ where: { id } });
  } catch (error) {
    throw handleDBError(error);
  }
};

export const exportCatalogCsv = async (): Promise<string> => {
  const albums = await prisma.album.findMany({
    select: {
      ...ALBUM_SELECT,
      artist: { select: { id: true, name: true } },
    },
    orderBy: { title: 'asc' },
  });

  const escape = (value: unknown) => {
    const s = String(value ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = [
    [
      'id',
      'title',
      'artistId',
      'artistName',
      'dateReleased',
      'trackCount',
      'lengthSeconds',
      'priceCents',
      'coverImageUrl',
    ].join(','),
    ...albums.map((a: any) =>
      [
        a.id,
        escape(a.title),
        a.artist.id,
        escape(a.artist.name),
        new Date(a.dateReleased).toISOString(),
        a.trackCount ?? '',
        a.lengthSeconds ?? '',
        a.priceCents,
        escape(a.coverImageUrl ?? ''),
      ].join(','),
    ),
  ];

  return rows.join('\n');
};

export const getAlbumsByArtistIdForUser = async (
  artistId: number,
  userId: number,
): Promise<Album[]> => {
  const albums = await prisma.album.findMany({
    where: {
      artistId,
      owners: { some: { userId } },
    },
    select: ALBUM_SELECT,
    orderBy: { title: 'asc' },
  });

  return albums as unknown as Album[];
};
