import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../core/password';

const prisma = new PrismaClient();

async function main() {
  // Clean in FK order
  await prisma.userAlbum.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword('Password123456');

  // Users
  const jonas = await prisma.user.create({
    data: {
      firstName: 'Jonas',
      lastName: 'Verstraeten',
      email: 'jonas.verstraeten@student.hogent.be',
      passwordHash,
      role: 'admin',
    },
  });
  const eline = await prisma.user.create({
    data: {
      firstName: 'Eline',
      lastName: 'Verstraeten',
      email: 'eline.verstraeten@student.hogent.be',
      passwordHash,
    },
  });
  const bas = await prisma.user.create({
    data: {
      firstName: 'Bas',
      lastName: 'Boone',
      email: 'bas.boone@student.hogent.be',
      passwordHash,
    },
  });

  // Artists
  const taylor = await prisma.artist.create({
    data: { name: 'Taylor Swift', genre: 'Pop' },
  });
  const kendrick = await prisma.artist.create({
    data: { name: 'Kendrick Lamar', genre: 'Hip-Hop' },
  });
  const pinkFloyd = await prisma.artist.create({
    data: { name: 'Pink Floyd', genre: 'Rock' },
  });
  const queen = await prisma.artist.create({
    data: { name: 'Queen', genre: 'Rock' },
  });

  // Albums (no user_id here)
  const folklore = await prisma.album.create({
    data: {
      title: 'folklore',
      dateReleased: new Date('2020-07-24'),
      lengthSeconds: 3780,
      trackCount: 16,
      artistId: taylor.id,
      priceCents: 1299,
      coverImageUrl: '/uploads/covers/folklore.jpg',
    },
  });

  const damn = await prisma.album.create({
    data: {
      title: 'DAMN',
      dateReleased: new Date('2017-04-14'),
      lengthSeconds: 3300,
      trackCount: 14,
      artistId: kendrick.id,
      priceCents: 1199,
      coverImageUrl: '/uploads/covers/damn.jpg',
    },
  });

  const theWall = await prisma.album.create({
    data: {
      title: 'The Wall',
      dateReleased: new Date('1979-11-30'),
      lengthSeconds: 4260,
      trackCount: 26,
      artistId: pinkFloyd.id,
      priceCents: 1599,
      coverImageUrl: '/uploads/covers/theWall.jpg',
    },
  });

  const jazz = await prisma.album.create({
    data: {
      title: 'jazz',
      dateReleased: new Date('1982-05-21'),
      lengthSeconds: 2700,
      trackCount: 10,
      artistId: queen.id,
      priceCents: 999,
      coverImageUrl: '/uploads/covers/queen-jazz.png',
    },
  });

  const darkSide = await prisma.album.create({
    data: {
      title: 'Dark side of the moon',
      dateReleased: new Date('1973-03-01'),
      lengthSeconds: 4260,
      trackCount: 10,
      artistId: pinkFloyd.id,
      priceCents: 1499,
      coverImageUrl: '/uploads/covers/darkSide.jpg',
    },
  });

  // User collections via join-table
  await prisma.userAlbum.createMany({
    data: [
      { userId: jonas.id, albumId: folklore.id },
      { userId: eline.id, albumId: damn.id },
      { userId: jonas.id, albumId: damn.id }, // same album owned by two users
      { userId: bas.id, albumId: theWall.id },
      { userId: jonas.id, albumId: jazz.id },
      { userId: jonas.id, albumId: darkSide.id },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed completed');
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
