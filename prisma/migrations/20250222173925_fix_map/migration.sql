/*
  Warnings:

  - You are about to drop the `student` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `student`;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(90) NOT NULL,
    `email` VARCHAR(90) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `academicRegistration` VARCHAR(13) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
