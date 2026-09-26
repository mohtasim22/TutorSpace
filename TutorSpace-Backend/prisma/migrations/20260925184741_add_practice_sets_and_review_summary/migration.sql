-- AlterTable
ALTER TABLE "tutorprofiles" ADD COLUMN     "review_summary" TEXT,
ADD COLUMN     "review_summary_at" TIMESTAMP(3),
ADD COLUMN     "review_summary_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "practice_sets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "course_id" TEXT NOT NULL,
    "material_id" TEXT,
    "tutor_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practice_sets_course_id_idx" ON "practice_sets"("course_id");

-- CreateIndex
CREATE INDEX "practice_sets_tutor_id_idx" ON "practice_sets"("tutor_id");

-- AddForeignKey
ALTER TABLE "practice_sets" ADD CONSTRAINT "practice_sets_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sets" ADD CONSTRAINT "practice_sets_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "course_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sets" ADD CONSTRAINT "practice_sets_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutorprofiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
