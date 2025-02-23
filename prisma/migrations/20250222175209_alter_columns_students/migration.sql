/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[academicRegistration]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `students_email_key` ON `students`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `students_academicRegistration_key` ON `students`(`academicRegistration`);
