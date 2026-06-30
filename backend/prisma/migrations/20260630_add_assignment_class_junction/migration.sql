-- Make classId nullable on Assignment
ALTER TABLE "Assignment" ALTER COLUMN "classId" DROP NOT NULL;

-- Create AssignmentClass junction table
CREATE TABLE "AssignmentClass" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentClass_pkey" PRIMARY KEY ("id")
);

-- Unique constraint
CREATE UNIQUE INDEX "AssignmentClass_assignmentId_classId_key" ON "AssignmentClass"("assignmentId", "classId");

-- Indexes
CREATE INDEX "AssignmentClass_classId_idx" ON "AssignmentClass"("classId");
CREATE INDEX "AssignmentClass_assignmentId_idx" ON "AssignmentClass"("assignmentId");

-- Foreign keys
ALTER TABLE "AssignmentClass" ADD CONSTRAINT "AssignmentClass_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentClass" ADD CONSTRAINT "AssignmentClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: populate AssignmentClass from Assignment.classId
INSERT INTO "AssignmentClass" ("id", "assignmentId", "classId", "createdAt")
SELECT gen_random_uuid()::text, "id", "classId", NOW()
FROM "Assignment"
WHERE "classId" IS NOT NULL;
