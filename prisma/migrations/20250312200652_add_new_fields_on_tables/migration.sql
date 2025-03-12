/*
  Warnings:

  - You are about to drop the column `available` on the `books` table. All the data in the column will be lost.
  - Added the required column `birthYear` to the `authors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `authors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genre` to the `books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isbn` to the `books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearPublished` to the `books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `authors` ADD COLUMN `birthYear` INTEGER NOT NULL,
    ADD COLUMN `nationality` VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE `books` DROP COLUMN `available`,
    ADD COLUMN `genre` VARCHAR(50) NOT NULL,
    ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isbn` VARCHAR(25) NOT NULL,
    ADD COLUMN `yearPublished` INTEGER NOT NULL;
