import type { Agent } from 'supertest';
import withServer from '../helpers/withServer';

describe('Sessions', () => {
  let supertest: Agent;

  withServer((s) => supertest = s);

  describe('POST /api/sessions', () => {
    const url = '/api/sessions';

    it('should 200 and return the token when succesfully logged in', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'test.user@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
    });

    it('should 401 with wrong email', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'invalid@hogent.be',
          password: '12345678',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 401 with wrong password', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'test.user@hogent.be',
          password: 'invalidpassword',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'The given email and password do not match',
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid email', async () => {
      const response = await supertest.post(url)
        .send({
          email: 'invalid',
          password: '12345678',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });

    it('should 400 when no password given', async () => {
      const response = await supertest.post(url)
        .send({ email: 'test.user@hogent.be' });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('password');
    });

    it('should 400 when no email given', async () => {
      const response = await supertest.post(url)
        .send({ password: '12345678' });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });
  });
});