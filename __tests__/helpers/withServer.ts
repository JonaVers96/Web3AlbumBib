import supertest from 'supertest';
import type { Server } from '../../src/createServer';
import createServer from '../../src/createServer';
import { prisma } from '../../src/data';
import { hashPassword } from '../../src/core/password';

async function truncateAll() {
  // FK checks uit/aan is niet nodig met cascades, maar kan op MySQL:
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE user_albums');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE albums');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE artists');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE users');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
}

export default function withServer(setter: (s: supertest.Agent) => void): void {
  let server: Server;

  beforeAll(async () => {
    await truncateAll();
    server = await createServer();

    // Users
    const passwordHash = await hashPassword('12345678');
    await prisma.user.createMany({
      data: [
        {
          id: 1,
          firstName: 'Test',
          lastName: 'User',
          email: 'test.user@hogent.be',
          passwordHash,
        },
        {
          id: 2,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin.user@hogent.be',
          passwordHash,
        },
      ],
    });

    // Artists
    await prisma.artist.createMany({
      data: [
        { id: 1, name: 'Radiohead', genre: 'Alternative' },
        { id: 2, name: 'Beyoncé', genre: 'Pop' },
      ],
    });

    // Albums
    await prisma.album.createMany({
      data: [
        {
          id: 1,
          title: 'OK Computer',
          dateReleased: new Date('1997-05-21'),
          artistId: 1,
          trackCount: 12,
          lengthSeconds: 3200,
        },
        {
          id: 2,
          title: 'Renaissance',
          dateReleased: new Date('2022-07-29'),
          artistId: 2,
          trackCount: 16,
          lengthSeconds: 3600,
        },
        {
          id: 3,
          title: 'In Rainbows',
          dateReleased: new Date('2007-10-10'),
          artistId: 1,
          trackCount: 10,
          lengthSeconds: 3600,
        },
      ],
    });

    // (optioneel) user_albums link
    await prisma.userAlbum.createMany({
      data: [
        { userId: 1, albumId: 1, addedAt: new Date() },
        { userId: 1, albumId: 3, addedAt: new Date() },
      ],
    });

    setter(supertest(server.getApp().callback()));
  });

  afterAll(async () => {
    // volg FK-volgorde
    await prisma.userAlbum.deleteMany();
    await prisma.album.deleteMany();
    await prisma.artist.deleteMany();
    await prisma.user.deleteMany();

    await server.stop();
  });
}
