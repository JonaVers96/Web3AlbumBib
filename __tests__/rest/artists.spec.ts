import type supertest from 'supertest';
import { prisma } from '../../src/data';
import withServer from '../helpers/withServer';
import { login } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

const data = {
  albums: [
    {
      id: 1,
      artistId: 1,
      title: 'OK Computer',
      dateReleased: new Date(1997, 4, 21, 20, 0), // 1997-05-21 20:00 lokaal
      lengthSeconds: 3450,
      trackCount: 13,
    },
    {
      id: 2,
      artistId: 1,
      title: 'In Rainbows',
      dateReleased: new Date(2007, 9, 10, 20, 0), // 2007-10-10 20:00 lokaal
      lengthSeconds: 4530,
      trackCount: 10,
    },
    {
      id: 3,
      artistId: 2,
      title: 'Renaissance',
      dateReleased: new Date(2022, 6, 29, 20, 0), // 2022-07-29 20:00 lokaal
      lengthSeconds: 3600, 
      trackCount: 16,
    },
  ],
  artists: [
    {
      id: 1,
      name: 'Radiohead',
      genre: 'Alternative',
    },
    {
      id: 2,
      name: 'Beyoncé',
      genre: 'Pop',
    },
    {
      id: 3,
      name: 'Daft Punk',
      genre: 'Electronic',
    },
  ],
};

const dataToDelete = {
  albums: [1, 2, 3],
  artists: [1, 2, 3],
};

describe('Artists', () => {
  let request: supertest.Agent;
  let authHeader: string;

  withServer((r) => (request = r));

  beforeAll(async () => {
    authHeader = await login(request);
  });

  const url = '/api/artists';

  describe('GET /api/artists', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
    });

    afterAll(async () => {
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return all artists', async () => {
      const response = await request.get(url).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(3);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            id: 2,
            name: 'Beyoncé',
            genre: 'Pop',
          },
          {
            id: 3,
            name: 'Daft Punk',
            genre: 'Electronic',
          },
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

  describe('GET /api/artists/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
    });

    afterAll(async () => {
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return the requested artist', async () => {
      const response = await request.get(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Radiohead',
        genre: 'Alternative',
        albums: [],
      });
    });

    it('should 404 when requesting not existing artist', async () => {
      const response = await request.get(`${url}/200`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No artist with this id exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid artist id', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe('POST /api/artists', () => {
    const artistsToDelete: number[] = [];

    afterAll(async () => {
      if (artistsToDelete.length) {
        await prisma.album.deleteMany({ where: { artistId: { in: artistsToDelete } } });
        await prisma.artist.deleteMany({ where: { id: { in: artistsToDelete } } });
      }
    });

    it('should 201 and return the created artist', async () => {
      const response = await request
        .post(url)
        .send({
          name: 'Lovely artist',
          genre: 'Electronic',
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe('Lovely artist');
      expect(response.body.genre).toBe('Electronic');

      artistsToDelete.push(response.body.id);
    });

    it('should 400 for duplicate artist name', async () => {
      const response = await request
        .post(url)
        .send({ name: 'Lovely artist' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'An artist with this name already exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await request
        .post(url)
        .send({ genre: 'Electronic' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
    });

    it('should 400 when genre is not a string', async () => {
      const response = await request
        .post(url)
        .send({
          name: 'Wrong artist',
          genre: 3.5 as any,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('genre');
    });

    it('should 400 when genre is too long', async () => {
      const response = await request
        .post(url)
        .send({
          name: 'Wrong artist',
          genre: 'a'.repeat(300),
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('genre');
    });

    testAuthHeader(() => request.post(url));
  });

  describe('PUT /api/artists/:id', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
    });

    afterAll(async () => {
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return the updated artist', async () => {
      const response = await request
        .put(`${url}/1`)
        .send({
          name: 'Changed name',
          genre: 'Alt-Rock',
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Changed name',
        genre: 'Alt-Rock',
      });
    });

    it('should 400 for duplicate artist name', async () => {
      const response = await request
        .put(`${url}/2`)
        .send({
          name: 'Changed name', // bestaat nu al op id:1
          genre: 'Pop/R&B',
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: 'An artist with this name already exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when genre is not a string', async () => {
      const response = await request
        .put(`${url}/1`)
        .send({
          name: 'Another name',
          genre: 42 as any,
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('genre');
    });

    it('should 400 with invalid artist id', async () => {
      const response = await request
        .put(`${url}/invalid`)
        .send({ name: 'X' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe('DELETE /api/artists/:id', () => {
    beforeAll(async () => {
      await prisma.artist.create({ data: data.artists[0]! });
    });

    it('should 204 and return nothing', async () => {
      const response = await request.delete(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 404 with not existing artist', async () => {
      const response = await request.delete(`${url}/200`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No artist with this id exists',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid artist id', async () => {
      const response = await request.delete(`${url}/invalid`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });

  describe('GET /api/artists/:id/albums', () => {
    beforeAll(async () => {
      await prisma.artist.createMany({ data: data.artists });
      await prisma.album.createMany({ data : data.albums });
    });

    afterAll(async () => {
      await prisma.album.deleteMany({ where: { id: { in: dataToDelete.albums } } });
      await prisma.artist.deleteMany({ where: { id: { in: dataToDelete.artists } } });
    });

    it('should 200 and return the albums of the given artist', async () => {
      const response = await request.get(`${url}/1/albums`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(2);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 2,
            title: 'In Rainbows',
            dateReleased: expect.any(String),
            artist: {
              id: 1,
              name: 'Radiohead',
              genre: 'Alternative',
            },
          }),
          expect.objectContaining({
            id: 1,
            title: 'OK Computer',
            dateReleased: expect.any(String),
            artist: {
              id: 1,
              name: 'Radiohead',
              genre: 'Alternative',
            },
          }),
        ]),
      );
    });

    it('should 400 with invalid artist id', async () => {
      const response = await request.get(`${url}/invalid/albums`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    testAuthHeader(() => request.get(`${url}/1/albums`));
  });
});