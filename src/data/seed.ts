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
  const taylor = await prisma.artist.create({ data: { name: 'Taylor Swift', genre: 'Pop' } });
  const kendrick = await prisma.artist.create({ data: { name: 'Kendrick Lamar', genre: 'Hip-Hop' } });
  const pinkFloyd = await prisma.artist.create({ data: { name: 'Pink Floyd', genre: 'Rock' } });
  const queen = await prisma.artist.create({ data: { name: 'Queen', genre: 'Rock' } });
  const rhcp = await prisma.artist.create({ data: { name: 'Red Hot Chili Peppers', genre: 'Rock' } });
  const michaelKiwanuka = await prisma.artist.create({ data: { name: 'Michael Kiwanuka', genre: 'Soul' } });
  const littleSimz = await prisma.artist.create({ data: { name: 'Little Simz', genre: 'Hip-Hop' } });
  const petitBiscuit = await prisma.artist.create({ data: { name: 'Petit Biscuit', genre: 'Electronic' } });
  const daan = await prisma.artist.create({ data: { name: 'Daan', genre: 'Pop' } });
  const stavroz = await prisma.artist.create({ data: { name: 'Stavroz', genre: 'Electronic' } });
  const avicii = await prisma.artist.create({ data: { name: 'Avicii', genre: 'Electronic' } });
  const arcticMonkeys = await prisma.artist.create({ data: { name: 'Arctic Monkeys', genre: 'Rock' } });
  const eminem = await prisma.artist.create({ data: { name: 'Eminem', genre: 'Hip-Hop' } });
  const davidBowie = await prisma.artist.create({ data: { name: 'David Bowie', genre: 'Classical' } });
  const zwangereGuy = await prisma.artist.create({ data: { name: 'Zwangere Guy', genre: 'Hip-Hop' } });
  const chumbawamba = await prisma.artist.create({ data: { name: 'Chumbawamba', genre: 'Folk' } });
  const aphexTwin = await prisma.artist.create({ data: { name: 'Aphex Twin', genre: 'Electronic' } });
  const theXx = await prisma.artist.create({ data: { name: 'The xx', genre: 'Indie' } });
  const antony = await prisma.artist.create({ data: { name: 'Antony and the Johnsons', genre: 'Alternative' } });
  const anneMarie = await prisma.artist.create({ data: { name: 'Anne-Marie', genre: 'Pop' } });
  const russ = await prisma.artist.create({ data: { name: 'Russ', genre: 'Hip-Hop' } });
  const tomMisch = await prisma.artist.create({ data: { name: 'Tom Misch', genre: 'R&B' } });
  const amyWinehouse = await prisma.artist.create({ data: { name: 'Amy Winehouse', genre: 'Soul' } });
  const tiesto = await prisma.artist.create({ data: { name: 'Tiësto', genre: 'Dance' } });
  const mika = await prisma.artist.create({ data: { name: 'MIKA', genre: 'Pop' } });
  const ao = await prisma.artist.create({ data: { name: 'Ão', genre: 'Electronic' } });
  const charliXcx = await prisma.artist.create({ data: { name: 'Charli xcx', genre: 'Pop' } });
  const daftPunk = await prisma.artist.create({ data: { name: 'Daft Punk', genre: 'Electronic' } });
  const tool = await prisma.artist.create({ data: { name: 'TOOL', genre: 'Metal' } });
  const kaeTempest = await prisma.artist.create({ data: { name: 'Kae Tempest', genre: 'Hip-Hop' } });
  const milesDavis = await prisma.artist.create({ data: { name: 'Miles Davis', genre: 'Jazz' } });
  const josseDevos = await prisma.artist.create({ data: { name: 'Josse Devos', genre: 'Pop' } });
  const bmth = await prisma.artist.create({ data: { name: 'Bring Me The Horizon', genre: 'Rock' } });
  const kyteman = await prisma.artist.create({ data: { name: 'Kyteman', genre: 'Hip-Hop' } });
  const trixieSmith = await prisma.artist.create({ data: { name: 'Trixie Smith', genre: 'Blues' } });
  const yannTiersen = await prisma.artist.create({ data: { name: 'Yann Tiersen', genre: 'Classical' } });
  const manuChao = await prisma.artist.create({ data: { name: 'Manu Chao', genre: 'Alternative' } });
  const massiveAttack = await prisma.artist.create({ data: { name: 'Massive Attack', genre: 'Electronic' } });
  const gregoryPorter = await prisma.artist.create({ data: { name: 'Gregory Porter', genre: 'Jazz' } });
  const nickCave = await prisma.artist.create({ data: { name: 'Nick Cave & The Bad Seeds', genre: 'Alternative' } });
  const edSheeran = await prisma.artist.create({ data: { name: 'Ed Sheeran', genre: 'Pop' } });
  const stikstof = await prisma.artist.create({ data: { name: 'STIKSTOF', genre: 'Hip-Hop' } });
  const metallica = await prisma.artist.create({ data: { name: 'Metallica', genre: 'Metal' } });
  const blackwave = await prisma.artist.create({ data: { name: 'blackwave.', genre: 'Hip-Hop' } });
  const kidsWithBuns = await prisma.artist.create({ data: { name: 'Kids With Buns', genre: 'Indie' } });
  const jazzBrak = await prisma.artist.create({ data: { name: 'JAZZ BRAK', genre: 'Hip-Hop' } });
  const kanyeWest = await prisma.artist.create({ data: { name: 'Kanye West', genre: 'Hip-Hop' } });
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
  await prisma.album.createMany({
    data: [
      { title: 'Californication (Deluxe Edition)', dateReleased: new Date('1999-06-08'), lengthSeconds: 3376, 
        trackCount: 15, artistId: rhcp.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Love & Hate', dateReleased: new Date('2016-07-15'), lengthSeconds: 2364, 
        trackCount: 10, artistId: michaelKiwanuka.id, priceCents: 1599, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Wish You Were Here', dateReleased: new Date('1975-09-12'), lengthSeconds: 2650, 
        trackCount: 5, artistId: pinkFloyd.id, priceCents: 1299, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Sometimes I Might Be Introvert', dateReleased: new Date('2021-09-03'), lengthSeconds: 3912,
        trackCount: 19, artistId: littleSimz.id, priceCents: 1899, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Presence', dateReleased: new Date('2017-11-10'), lengthSeconds: 2840, 
        trackCount: 14, artistId: petitBiscuit.id, priceCents: 1399, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'good kid, m.A.A.d city (Deluxe)', dateReleased: new Date('2012-10-22'), lengthSeconds: 4104, 
        trackCount: 15, artistId: kendrick.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Simple', dateReleased: new Date('2010-11-26'), lengthSeconds: 2520, 
        trackCount: 12, artistId: daan.id, priceCents: 1199, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'The Ginning', dateReleased: new Date('2013-05-01'), lengthSeconds: 1680, 
        trackCount: 4, artistId: stavroz.id, priceCents: 999, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'True: Avicii By Avicii', dateReleased: new Date('2014-03-21'), lengthSeconds: 2160, 
        trackCount: 9, artistId: avicii.id, priceCents: 1299, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'AM', dateReleased: new Date('2013-09-09'), lengthSeconds: 2483, 
        trackCount: 12, artistId: arcticMonkeys.id, priceCents: 1399, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Music To Be Murdered By', dateReleased: new Date('2020-01-17'), lengthSeconds: 3840, 
        trackCount: 20, artistId: eminem.id, priceCents: 1699, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'David Bowie narrates Prokofiev\'s Peter and the Wolf & The Young Person\'s Guide to the Orchestra'
        , dateReleased: new Date('1978-05-02'), lengthSeconds: 2600, 
        trackCount: 15, artistId: davidBowie.id, priceCents: 1299, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Wish You Were Here 50', dateReleased: new Date('2025-01-01'), lengthSeconds: 2650, 
        trackCount: 5, artistId: pinkFloyd.id, priceCents: 1799, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Pourriture Noble', dateReleased: new Date('2022-11-04'), lengthSeconds: 2715, 
        trackCount: 13, artistId: zwangereGuy.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'English Rebel Songs: 1381 - 1984', dateReleased: new Date('1988-01-01'), lengthSeconds: 2340, 
        trackCount: 13, artistId: chumbawamba.id, priceCents: 1099, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Selected Ambient Works 85-92', dateReleased: new Date('1992-11-09'), lengthSeconds: 4467, 
        trackCount: 13, artistId: aphexTwin.id, priceCents: 1599, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'xx', dateReleased: new Date('2009-08-14'), lengthSeconds: 2320, 
        trackCount: 11, artistId: theXx.id, priceCents: 1199, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'I Am A Bird Now', dateReleased: new Date('2005-02-01'), lengthSeconds: 2040, 
        trackCount: 10, artistId: antony.id, priceCents: 1299, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Speak Your Mind (Deluxe)', dateReleased: new Date('2018-04-27'), lengthSeconds: 3120, 
        trackCount: 16, artistId: anneMarie.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'There\'s Really A Wolf', dateReleased: new Date('2017-05-05'), lengthSeconds: 4500, 
        trackCount: 20, artistId: russ.id, priceCents: 1599, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Geography', dateReleased: new Date('2018-04-06'), lengthSeconds: 3240, 
        trackCount: 13, artistId: tomMisch.id, priceCents: 1399, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Back To Black (Deluxe Edition)', dateReleased: new Date('2006-10-27'), lengthSeconds: 2100, 
        trackCount: 11, artistId: amyWinehouse.id, priceCents: 1299, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'DRIVE', dateReleased: new Date('2023-04-21'), lengthSeconds: 2040, 
        trackCount: 12, artistId: tiesto.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Life In Cartoon Motion', dateReleased: new Date('2007-02-05'), lengthSeconds: 2640, 
        trackCount: 12, artistId: mika.id, priceCents: 999, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Malandra', dateReleased: new Date('2025-10-10'), lengthSeconds: 2200, 
        trackCount: 10, artistId: ao.id, priceCents: 1299, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Brat and it’s completely different but also still brat', dateReleased: new Date('2024-10-11'), 
        lengthSeconds: 5800, trackCount: 34, artistId: charliXcx.id, priceCents: 1999, 
        coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Random Access Memories', dateReleased: new Date('2013-05-17'), lengthSeconds: 4464, 
        trackCount: 13, artistId: daftPunk.id, priceCents: 1699, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Fear Inoculum', dateReleased: new Date('2019-08-30'), lengthSeconds: 5200, 
        trackCount: 10, artistId: tool.id, priceCents: 1899, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'The Book Of Traps And Lessons', dateReleased: new Date('2019-06-14'), lengthSeconds: 2700, 
        trackCount: 11, artistId: kaeTempest.id, priceCents: 1399, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Kind Of Blue (Legacy Edition)', dateReleased: new Date('1959-08-17'), lengthSeconds: 2700, 
        trackCount: 5, artistId: milesDavis.id, priceCents: 1199, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'for friends and family', dateReleased: new Date('2024-01-01'), lengthSeconds: 2100, 
        trackCount: 10, artistId: josseDevos.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'That\'s The Spirit', dateReleased: new Date('2015-09-11'), lengthSeconds: 2700, 
        trackCount: 11, artistId: bmth.id, priceCents: 1399, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'The Hermit Sessions', dateReleased: new Date('2009-02-20'), lengthSeconds: 3500, 
        trackCount: 13, artistId: kyteman.id, priceCents: 1099, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Trixie Smith Vol. 2 1925-1929', dateReleased: new Date('1990-01-01'), lengthSeconds: 3000, 
        trackCount: 15, artistId: trixieSmith.id, priceCents: 899, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Amelie from Montmartre (Original SoundTrack)', dateReleased: new Date('2001-04-23'), 
        lengthSeconds: 3240, 
        trackCount: 20, artistId: yannTiersen.id, priceCents: 1299, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'The Wall (Remastered)', dateReleased: new Date('2011-01-01'), lengthSeconds: 4860, 
        trackCount: 26, artistId: pinkFloyd.id, priceCents: 1699, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Clandestino', dateReleased: new Date('1998-10-06'), lengthSeconds: 2800, 
        trackCount: 16, artistId: manuChao.id, priceCents: 1199, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Mezzanine', dateReleased: new Date('1998-04-20'), lengthSeconds: 3800, trackCount: 11, 
        artistId: massiveAttack.id, priceCents: 1399, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Liquid Spirit', dateReleased: new Date('2013-09-02'), lengthSeconds: 3600, 
        trackCount: 14, artistId: gregoryPorter.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Murder Ballads (2011 Remaster)', dateReleased: new Date('1996-02-05'), lengthSeconds: 3500, 
        trackCount: 10, artistId: nickCave.id, priceCents: 1599, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'x (10th Anniversary Edition)', dateReleased: new Date('2014-06-20'), lengthSeconds: 3800, 
        trackCount: 16, artistId: edSheeran.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'FAMILIE BOVEN ALLES', dateReleased: new Date('2021-10-15'), lengthSeconds: 2800, 
        trackCount: 14, artistId: stikstof.id, priceCents: 1599, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'Metallica (Remastered 2021)', dateReleased: new Date('1991-08-12'), lengthSeconds: 3750, 
        trackCount: 12, artistId: metallica.id, priceCents: 1699, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'ARE WE STILL DREAMING?', dateReleased: new Date('2019-11-08'), lengthSeconds: 2700, 
        trackCount: 14, artistId: blackwave.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'out of place', dateReleased: new Date('2023-10-13'), lengthSeconds: 2200, 
        trackCount: 11, artistId: kidsWithBuns.id, priceCents: 1399, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'AUTOFOCUS', dateReleased: new Date('2024-03-01'), lengthSeconds: 2000, 
        trackCount: 12, artistId: jazzBrak.id, priceCents: 1499, coverImageUrl: '/uploads/covers/test.jpg' },
      { title: 'My Beautiful Dark Twisted Fantasy', dateReleased: new Date('2010-11-22'), lengthSeconds: 4100, 
        trackCount: 13, artistId: kanyeWest.id, priceCents: 1699, coverImageUrl: '/uploads/covers/test.jpg' },
    ],
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
