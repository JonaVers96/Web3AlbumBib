// __tests__/rest/albums.spec.ts
import type supertest from 'supertest';
import { prisma } from '../src/data';
import withServer from '../helpers/withServer';
import { login } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

const data = {
  artists: [
    { id: 1, name: 'Test Artist', genre: 'Rock' },
    { id: 2, name: 'Second Artist', genre: 'Pop' },
  ],
  albums: [
    {
      id: 1,
      title: 'Alpha',
      dateReleased: new Date('2020-01-01'),
      lengthSeconds: 2400, // 40 min
      trackCount: 10,
      artistId: 1,
    },
    {
      id: 2,
      title: 'Bravo',
      dateReleased: new Date('2020-02-01'),
      lengthSeconds: 2100, // 35 min
      trackCount: 9,
      artistId: 1,
    },
    {
      id: 3,
      title: 'Charlie',
      dateReleased: new Date('2020-03-01'),
      lengthSeconds: 1800, // 30 min
      trackCount: 8,
      artistId: 2,
    },
  ],
  owners: [
    { userId: 1, albumId: 1 },
    { userId: 1, albumId: 3 },
    { userId: 2, albumId: 2 },
  ],
};

const dataToDelete = {
  albums: [1, 2, 3],
  artists: [1, 2],
};

describe('Albums', () => {
  let request: supertest.Agent;
  let authHeader: string;

  withServer((r) => (request = r));

  beforeAll(async () => {
    authHeader = await login(request);       // verwacht user id = 1 (zoals in je oude tests) // verwacht user id = 2
  });

  const url = '/api/albums';

  describe('GET /api/albums', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.createMany({ data: data.albums });
      await prisma.userAlbum.createMany({ data: data.owners });
    });

    afterAll(async () => {
      await prisma.userAlbum.deleteMany({ where: { albumId: { in: dataToDelete.albums } } });
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return albums for the signed-in user', async () => {
      const res = await request.get(url).set('Authorization', authHeader);
      expect(res.status).toBe(200);

      const items = Array.isArray(res.body) ? res.body : res.body.items;
      expect(Array.isArray(items)).toBe(true);

      // user 1 heeft album 1 (Alpha) en 3 (Charlie)
      expect(items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: 'Alpha',
            artist: expect.objectContaining({ id: 1, name: 'Test Artist' }),
          }),
          expect.objectContaining({
            id: 3,
            title: 'Charlie',
            artist: expect.objectContaining({ id: 2, name: 'Second Artist' }),
          }),
        ]),
      );
    });

    it('should 400 when unexpected query arg is given', async () => {
      const res = await request.get(`${url}?invalid=true`).set('Authorization', authHeader);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_FAILED');
      expect(res.body.details.query).toHaveProperty('invalid');
    });

    testAuthHeader(() => request.get(url));
  });

  describe('GET /api/albums/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.createMany({ data: data.albums });
      await prisma.userAlbum.createMany({ data: data.owners });
    });

    afterAll(async () => {
      await prisma.userAlbum.deleteMany({ where: { albumId: { in: dataToDelete.albums } } });
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return the requested album (owned by user)', async () => {
      const res = await request.get(`${url}/1`).set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 1,
        title: 'Alpha',
        artist: { id: 1, name: 'Test Artist' },
      });
    });

    it('should 404 when requesting non-owned album', async () => {
      const res = await request.get(`${url}/2`).set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No album with this id exists',
      });
    });

    it('should 400 with invalid album id', async () => {
      const res = await request.get(`${url}/invalid`).set('Authorization', authHeader);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_FAILED');
      expect(res.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe('POST /api/albums', () => {
    const created: number[] = [];

    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
    });

    afterAll(async () => {
      if (created.length) {
        await prisma.userAlbum.deleteMany({ where: { albumId: { in: created } } });
        await prisma.album.deleteMany({ where: { id: { in: created } } });
      }
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 201 and return the created album (and link to current user)', async () => {
      const res = await request
        .post(url)
        .send({ title: 'Delta', artistId: 1 })
        .set('Authorization', authHeader);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeTruthy();
      expect(res.body).toMatchObject({
        title: 'Delta',
        artist: { id: 1, name: 'Test Artist' },
      });

      created.push(res.body.id);
    });

    it('should 404 when artist does not exist', async () => {
      const res = await request
        .post(url)
        .send({ title: 'Ghost', artistId: 9999 })
        .set('Authorization', authHeader);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No artist with this id exists',
      });
    });

    it('should 400 when missing title/artistId', async () => {
      const res1 = await request.post(url).send({ artistId: 1 }).set('Authorization', authHeader);
      expect(res1.status).toBe(400);
      expect(res1.body.details.body).toHaveProperty('title');

      const res2 = await request.post(url).send({ title: 'No Artist' }).set('Authorization', authHeader);
      expect(res2.status).toBe(400);
      expect(res2.body.details.body).toHaveProperty('artistId');
    });

    testAuthHeader(() => request.post(url));
  });

  describe('PUT /api/albums/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.createMany({ data: data.albums });
    });

    afterAll(async () => {
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe('DELETE /api/albums/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.create({ data: data.albums[0]! });
      await prisma.userAlbum.create({ data: { userId: 1, albumId: 1 } });
    });

    afterAll(async () => {
      await prisma.userAlbum.deleteMany({ where: { albumId: 1 } });
      await prisma.album.deleteMany({ where: { id: 1 } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 204 and unlink the album from the current user', async () => {
      const res = await request.delete(`${url}/1`).set('Authorization', authHeader);
      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    it('should 404 with not existing album', async () => {
      const res = await request.delete(`${url}/999`).set('Authorization', authHeader);
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No album with this id exists',
      });
    });

    it('should 400 with invalid album id', async () => {
      const res = await request.delete(`${url}/invalid`).set('Authorization', authHeader);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_FAILED');
      expect(res.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });
});
