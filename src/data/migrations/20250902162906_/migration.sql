-- DropForeignKey
ALTER TABLE `user_albums` DROP FOREIGN KEY `user_albums_album_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_albums` DROP FOREIGN KEY `user_albums_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `user_albums` ADD CONSTRAINT `user_albums_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_albums` ADD CONSTRAINT `user_albums_album_id_fkey` FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
