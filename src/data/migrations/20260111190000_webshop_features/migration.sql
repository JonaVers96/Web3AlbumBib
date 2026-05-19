-- Add role to users
ALTER TABLE `users` ADD COLUMN `role` ENUM('admin','user') NOT NULL DEFAULT 'user';

-- Add webshop fields to albums
ALTER TABLE `albums`
  ADD COLUMN `price_cents` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `cover_image_url` VARCHAR(2048) NULL;

-- Create payments table
CREATE TABLE `payments` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(64) NOT NULL,
  `mollie_payment_id` VARCHAR(64) NULL,
  `status` ENUM('created','open','paid','failed','canceled','expired') NOT NULL DEFAULT 'created',
  `amount_cents` INTEGER NOT NULL,
  `checkout_url` VARCHAR(2048) NULL,
  `items` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` INTEGER UNSIGNED NOT NULL,

  UNIQUE INDEX `payments_reference_key` (`reference`),
  INDEX `payments_user_id_idx` (`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `payments`
  ADD CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
