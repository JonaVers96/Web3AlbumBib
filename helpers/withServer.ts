import supertest from 'supertest';
import type { Server } from '../src/createServer';
import createServer from '../src/createServer';
import { prisma } from '../src/data';
import { hashPassword } from '../src/core/password';

export default function withServer(setter: (s: supertest.Agent) => void): void {
  let server: Server;

  beforeAll(async () => {
    server = await createServer();

    const passwordHash = await hashPassword('12345678');
    await prisma.user.createMany({
      data: [
        {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test.user@hogent.be',
          passwordHash: passwordHash,
        },
        {
          id: 2,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin.user@hogent.be',
          passwordHash: passwordHash,
        },
      ],
    });

    setter(supertest(server.getApp().callback()));
  });

  afterAll(async () => {
    await prisma.album.deleteMany();
    await prisma.user.deleteMany();
    await prisma.artist.deleteMany();

    await server.stop();
  });
}
