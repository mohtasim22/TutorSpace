/*
  Warnings:

  - You are about to drop the `tutor_courses` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `student_id` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tutor_id` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tutor_courses" DROP CONSTRAINT "tutor_courses_course_id_fkey";

-- DropForeignKey
ALTER TABLE "tutor_courses" DROP CONSTRAINT "tutor_courses_tutor_id_fkey";

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "tutor_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "tutor_courses";

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutorprofiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
