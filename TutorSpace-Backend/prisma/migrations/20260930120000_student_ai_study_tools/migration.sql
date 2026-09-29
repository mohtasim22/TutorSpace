-- AI features now centre on course materials: students generate their own
-- practice quizzes, and each material can be summarised. The review summary on
-- tutor profiles is removed.

-- AlterTable
ALTER TABLE "tutorprofiles" DROP COLUMN "review_summary",
DROP COLUMN "review_summary_at",
DROP COLUMN "review_summary_count";

-- AlterTable
ALTER TABLE "course_materials" ADD COLUMN     "summary" JSONB,
ADD COLUMN     "summary_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "practice_sets" ADD COLUMN     "student_id" TEXT;

-- CreateIndex
CREATE INDEX "practice_sets_student_id_idx" ON "practice_sets"("student_id");

-- AddForeignKey
ALTER TABLE "practice_sets" ADD CONSTRAINT "practice_sets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
