/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `books` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isbn]` on the table `books` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `availableQuantity` to the `books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantity` to the `books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `books` DROP COLUMN `isAvailable`,
    ADD COLUMN `availableQuantity` INTEGER NOT NULL,
    ADD COLUMN `totalQuantity` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `books_isbn_key` ON `books`(`isbn`);
