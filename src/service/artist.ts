import type { Prisma } from '@prisma/client';
import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { Artist, ArtistCreateInput, ArtistDetail, ArtistQuery, ArtistUpdateInput } from '../types/artist';
import handleDBError from './_handleDBError';

const normalizeArtistQuery = (query: ArtistQuery) => {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 25)));
  const q = query.q?.trim() ? query.q.trim() : undefined;
  return { page, pageSize, q };
};

const buildWhere = (q?: string): Prisma.ArtistWhereInput => {
  if (!q) return {};
  return {
    OR: [
      { name: { contains: q } },
      { genre: { contains: q } },
    ],
  };
};

export const getAll = async (query: ArtistQuery) => {
  const { page, pageSize, q } = normalizeArtistQuery(query);
  const where = buildWhere(q);

  const [total, items] = await Promise.all([
    prisma.artist.count({ where }),
    prisma.artist.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items: items as unknown as Artist[], page, pageSize, total };
};

export const getById = async (id: number): Promise<ArtistDetail> => {
  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) {
    throw ServiceError.notFound(`Artist with id ${id} not found`);
  }

  const albumCount = await prisma.album.count({ where: { artistId: id } });

  return {
    ...(artist as unknown as Artist),
    albumCount,
  };
};

export const create = async (artist: ArtistCreateInput): Promise<ArtistDetail> => {
  try {
    const created = await prisma.artist.create({ data: artist });
    return { ...(created as unknown as Artist), albumCount: 0 };
  } catch (error) {
    throw handleDBError(error);
  }
};

export const updateById = async (id: number, changes: ArtistUpdateInput): Promise<ArtistDetail> => {
  try {
    const updated = await prisma.artist.update({ where: { id }, data: changes });
    const albumCount = await prisma.album.count({ where: { artistId: id } });
    return { ...(updated as unknown as Artist), albumCount };
  } catch (error) {
    throw handleDBError(error);
  }
};

export const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.artist.delete({ where: { id } });
  } catch (error) {
    throw handleDBError(error);
  }
};

export const checkArtistExists = async (id: number): Promise<void> => {
  const count = await prisma.artist.count({ where: { id } });

  if (count === 0) {
    throw ServiceError.notFound('No artist with this id exists');
  }
};
