/*
  Warnings:

  - Added the required column `tutor_id` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "tutor_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutorprofiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
