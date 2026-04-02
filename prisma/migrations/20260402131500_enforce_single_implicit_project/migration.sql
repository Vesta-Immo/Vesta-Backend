-- Normalize duplicates before adding uniqueness constraint
WITH ranked_implicit_projects AS (
  SELECT
    "id",
    "userId",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC
    ) AS rank
  FROM "public"."projects"
  WHERE "isImplicit" = true
)
UPDATE "public"."projects" p
SET "isImplicit" = false
FROM ranked_implicit_projects rip
WHERE p."id" = rip."id"
  AND rip.rank > 1;

-- Enforce one implicit project per user
CREATE UNIQUE INDEX "projects_single_implicit_per_user_idx"
ON "public"."projects"("userId")
WHERE "isImplicit" = true;
