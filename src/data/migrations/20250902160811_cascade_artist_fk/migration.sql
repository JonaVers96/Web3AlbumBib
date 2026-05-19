-- DropForeignKey
ALTER TABLE `albums` DROP FOREIGN KEY `albums_artist_id_fkey`;

-- AddForeignKey
ALTER TABLE `albums` ADD CONSTRAINT `albums_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
