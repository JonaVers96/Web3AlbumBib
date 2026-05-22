/// <reference types="jest" />

import type supertest from 'supertest';
import { prisma } from '../../src/data';
import withServer from '../helpers/withServer';
import { login} from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

const data = {
  albums: [
    {
      id: 1,
      artistId: 1,
      title: 'OK Computer',
      dateReleased: new Date(1997, 4, 21, 19, 40), // 1997-05-21T17:40:00.000Z (afh. TZ)
      trackCount: 12,
      lengthSeconds: 3000,
      priceCents: 1599,
    },
    {
      id: 2,
      artistId: 2,
      title: 'Renaissance',
      dateReleased: new Date(2022, 6, 29, 20, 0),
      trackCount: 16,
      lengthSeconds: 2400,
      priceCents: 1599,
    },
    {
      id: 3,
      artistId: 1,
      title: 'In Rainbows',
      dateReleased: new Date(2007, 9, 10, 14, 30),
      trackCount: 10,
      lengthSeconds: 3600,
      priceCents: 1599,
    },
  ],
  artists: [
    { id: 1, name: 'Radiohead', genre: 'Alternative' },
    { id: 2, name: 'Beyoncé', genre: 'Pop' },
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
    authHeader = await login(request);
  });

  const url = '/api/albums';

  describe('GET /api/albums', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.createMany({ data: data.albums });
    });

    afterAll(async () => {
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return all albums', async () => {
      const response = await request.get(url).set('Authorization', authHeader);
      expect(response.status).toBe(200);

      expect(response.body.items.length).toBe(3);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: 'OK Computer',
            artist: { id: 1, name: 'Radiohead', genre: 'Alternative' },
            dateReleased: new Date(1997, 4, 21, 19, 40).toJSON(),
          }),
          expect.objectContaining({
            id: 2,
            title: 'Renaissance',
            artist: { id: 2, name: 'Beyoncé', genre: 'Pop' },
            dateReleased: new Date(2022, 6, 29, 20, 0).toJSON(),
          }),
          expect.objectContaining({
            id: 3,
            title: 'In Rainbows',
            artist: { id: 1, name: 'Radiohead', genre: 'Alternative' },
            dateReleased: new Date(2007, 9, 10, 14, 30).toJSON(),
          }),
        ]),
      );
    });

    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });

    testAuthHeader(() => request.get(url));
  });

  describe('GET /api/albums/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.createMany({ data: data.albums });
    });

    afterAll(async () => {
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return the requested album', async () => {
      const response = await request.get(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        title: 'OK Computer',
        artist: { id: 1, name: 'Radiohead', genre: 'Alternative' },
        dateReleased: new Date(1997, 4, 21, 19, 40).toJSON(),
        trackCount: 12,
        lengthSeconds: 3000,
        priceCents: 1599,
      });
    });

    it('should 404 when requesting not existing album', async () => {
      const response = await request.get(`${url}/200`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No album with this id exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid album id', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe('POST /api/albums', () => {
    const albumsToDelete: number[] = [];

    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
    });

    afterAll(async () => {
      if (albumsToDelete.length) {
        await prisma.album.deleteMany({ where: { id: { in: albumsToDelete } } });
      }
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 201 and return the created album', async () => {
      const response = await request
        .post(url)
        .send({
          title: 'Lemonade',
          dateReleased: '2016-04-23T00:00:00.000Z',
          artistId: 2,
          priceCents: 1599,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.title).toBe('Lemonade');
      expect(response.body.dateReleased).toBe('2016-04-23T00:00:00.000Z');
      expect(response.body.artist).toEqual({
        id: 2,
        name: 'Beyoncé',
        genre: 'Pop',
      });

      albumsToDelete.push(response.body.id);
    });

    it('should 404 when artist does not exist', async () => {
      const response = await request
        .post(url)
        .send({
          title: 'Ghost Album',
          dateReleased: '2020-01-01T00:00:00.000Z',
          artistId: 123,
          priceCents: 1599,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No artist with this id exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing title', async () => {
      const response = await request
        .post(url)
        .send({
          dateReleased: '2016-04-23T00:00:00.000Z',
          artistId: 2,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('title');
    });

    it('should 400 when missing dateReleased', async () => {
      const response = await request
        .post(url)
        .send({
          title: 'No Date',
          artistId: 2,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('dateReleased');
    });

    it('should 400 when missing artistId', async () => {
      const response = await request
        .post(url)
        .send({
          title: 'No Artist',
          dateReleased: '2016-04-23T00:00:00.000Z',
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('artistId');
    });

    testAuthHeader(() => request.post(url));
  });

  describe('PUT /api/albums/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
    });

    beforeEach(async () => {
      // zet albums vers voor elke test
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.album.createMany({ data: data.albums });
    });

    afterAll(async () => {
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return the updated album', async () => {
      const response = await request
        .put(`${url}/1`)
        .send({
          title: 'OK Computer (Remastered)',
          dateReleased: '1997-05-21T19:40:00.000Z',
          artistId: 1,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        title: 'OK Computer (Remastered)',
        dateReleased: '1997-05-21T19:40:00.000Z',
        artist: { id: 1, name: 'Radiohead', genre: 'Alternative' },
        trackCount: 12,
        lengthSeconds: 3000,
      });
    });

    it('should 404 when updating not existing album', async () => {
      const response = await request
        .put(`${url}/200`)
        .send({
          title: 'Missing',
          dateReleased: '2020-01-01T00:00:00.000Z',
          artistId: 1,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No album with this id exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 404 when artist does not exist', async () => {
      const response = await request
        .put(`${url}/2`)
        .send({
          title: 'Wrong Artist',
          dateReleased: '2022-07-29T20:00:00.000Z',
          artistId: 999,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No artist with this id exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid album id', async () => {
      const response = await request
        .put(`${url}/invalid`)
        .send({ title: 'X' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe('DELETE /api/albums/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.create({ data: data.albums[0]! });
    });

    afterAll(async () => {
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 204 and return nothing', async () => {
      const response = await request.delete(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 404 with not existing album', async () => {
      const response = await request.delete(`${url}/4`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No album with this id exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid album id', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });
});