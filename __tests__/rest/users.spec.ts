import type supertest from 'supertest';
import { prisma } from '../../src/data';
import withServer from '../helpers/withServer';
import { login } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

describe('Users', () => {
  let request: supertest.Agent;
  let authHeader: string;

  withServer((r) => (request = r));

  beforeAll(async () => {
    await prisma.album.deleteMany({});
    await prisma.artist.deleteMany({});
    authHeader = await login(request);
  });

  const url = '/api/users';

  describe('GET /api/users (list)', () => {
    it('should 403: listing all users is not allowed for a normal user', async () => {
      const response = await request.get(url).set('Authorization', authHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You are not allowed to view this part of the application',
      });
    });

    // zonder token → 401
    testAuthHeader(() => request.get(url));
  });

  describe('GET /api/users/:id', () => {
    it('should 200 and return the requested user\'s own profile', async () => {
      const response = await request.get(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@hogent.be',
      });
      // geen passwordHash lekken
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should 200 and return my user info when passing \'me\' as id', async () => {
      const response = await request.get(`${url}/me`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@hogent.be',
      });
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should 400 with invalid user id', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    it('should 403 when requesting someone else\'s profile', async () => {
      const response = await request.get(`${url}/2`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You are not allowed to view this user\'s information',
      });
    });

    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe('POST /api/users (register)', () => {
    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: 'new.user@hogent.be' },
      });
    });

    it('should 200 and return a token after successful registration', async () => {
      const response = await request
        .post(url)
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'new.user@hogent.be',
          password: '123456789101112',
        })
        // registratie kan vaak zonder auth; header mag genegeerd worden
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toMatchObject({
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@hogent.be',
      });
      expect(response.body.user.passwordHash).toBeUndefined();
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should 200 and return the updated user (self-update)', async () => {
      const response = await request
        .put(`${url}/1`)
        .send({
          firstName: 'Changed',
          lastName: 'Name',
          email: 'changed.user@hogent.be',
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        firstName: 'Changed',
        lastName: 'Name',
        email: 'changed.user@hogent.be',
      });
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should 403 when updating someone else\'s user', async () => {
      const response = await request
        .put(`${url}/2`)
        .send({
          firstName: 'Changed',
          lastName: 'Name',
          email: 'changed.user@hogent.be',
        })
        .set('Authorization', authHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You are not allowed to view this user\'s information',
      });
    });

    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe('DELETE /api/users/:id', () => {
    it('should 204 and return nothing (self-delete)', async () => {
      const response = await request.delete(`${url}/1`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should 403 when deleting someone else\'s user', async () => {
      const response = await request.delete(`${url}/2`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You are not allowed to view this user\'s information',
      });
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });
});