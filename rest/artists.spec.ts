// __tests__/rest/artists.spec.ts
import type supertest from 'supertest';
import { prisma } from '../src/data';
import withServer from '../helpers/withServer';
import { login } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

const data = {
  artists: [
    { id: 1, name: 'Taylor Swift', genre: 'Pop' },
    { id: 2, name: 'Kendrick Lamar', genre: 'Hip-Hop' },
    { id: 3, name: 'Pink Floyd', genre: 'Rock' },
  ],
};

const dataToDelete = {
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

      // sommige implementaties gebruiken { items: [...] }, andere geven een array terug
      const items = Array.isArray(response.body) ? response.body : response.body.items;
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(3);

      expect(items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 2, name: 'Kendrick Lamar' }),
          expect.objectContaining({ id: 3, name: 'Pink Floyd' }),
        ]),
      );
    });

    it('should 400 when given an unexpected query arg', async () => {
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
      expect(response.body).toMatchObject({
        id: 1,
        name: 'Taylor Swift',
        genre: 'Pop',
      });
      // Als jouw endpoint ook albums meelevert, kun je eventueel dit asserten:
      // expect(response.body.albums).toBeDefined();
      // expect(Array.isArray(response.body.albums)).toBe(true);
    });

    it('should 404 when requesting non-existing artist', async () => {
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
      await prisma.artist.deleteMany({ where: { id: { in: artistsToDelete } } });
    });

    it('should 201 and return the created artist', async () => {
      const response = await request
        .post(url)
        .send({ name: 'Unit Test Artist', genre: 'Rock' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe('Unit Test Artist');

      artistsToDelete.push(response.body.id);
    });

    it('should 400 for duplicate artist name', async () => {
      const response = await request
        .post(url)
        .send({ name: 'Unit Test Artist' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      // _handleDBError.ts geeft “A artist with this name already exists”
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: expect.stringMatching(/artist with this name already exists/i),
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await request
        .post(url)
        .send({ genre: 'Pop' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
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
        .send({ name: 'Taylor (Edited)', genre: 'Pop' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: 'Taylor (Edited)',
      });
    });

    it('should 400 for duplicate artist name', async () => {
      const response = await request
        .put(`${url}/2`)
        .send({ name: 'Taylor (Edited)', genre: 'Hip-Hop' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        message: expect.stringMatching(/artist with this name already exists/i),
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 when missing name', async () => {
      const response = await request
        .put(`${url}/1`)
        .send({ genre: 'Pop' })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('name');
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

  // (optioneel) Endpoint voor albums van een artist, als je die route hebt:
  // describe('GET /api/artists/:id/albums', () => {
  //   it('should 200 and return albums for the given artist', async () => {
  //     const response = await request.get(`${url}/1/albums`).set('Authorization', authHeader);
  //     expect(response.statusCode).toBe(200);
  //     const items = Array.isArray(response.body) ? response.body : response.body.items;
  //     expect(Array.isArray(items)).toBe(true);
  //   });
  //   testAuthHeader(() => request.get(`${url}/1/albums`));
  // });
});
