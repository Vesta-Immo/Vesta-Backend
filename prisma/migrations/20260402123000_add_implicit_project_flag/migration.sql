-- Add implicit project flag
ALTER TABLE "public"."projects"
ADD COLUMN "isImplicit" BOOLEAN NOT NULL DEFAULT false;

-- Add index for implicit project lookup by user
CREATE INDEX "projects_userId_isImplicit_idx"
ON "public"."projects"("userId", "isImplicit");

-- Backfill one implicit project per user, choosing most recently updated
WITH ranked_projects AS (
  SELECT
    "id",
    "userId",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC
    ) AS rank
  FROM "public"."projects"
)
UPDATE "public"."projects" p
SET "isImplicit" = true
FROM ranked_projects rp
WHERE p."id" = rp."id"
  AND rp.rank = 1;
