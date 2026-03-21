-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseAuthUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseAuthUserId_key" ON "User"("supabaseAuthUserId");

-- AlterTable
ALTER TABLE "PropertyListState" ADD COLUMN "userId" TEXT;

-- Preserve existing singleton data by assigning it to a legacy user.
INSERT INTO "User" ("id", "supabaseAuthUserId", "updatedAt")
VALUES ('legacy_default_user', 'legacy-default-user', CURRENT_TIMESTAMP)
ON CONFLICT ("supabaseAuthUserId") DO NOTHING;

UPDATE "PropertyListState"
SET "userId" = (
    SELECT "id"
    FROM "User"
    WHERE "supabaseAuthUserId" = 'legacy-default-user'
)
WHERE "userId" IS NULL;

-- AlterColumn
ALTER TABLE "PropertyListState" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PropertyListState_userId_key" ON "PropertyListState"("userId");

-- AddForeignKey
ALTER TABLE "PropertyListState" ADD CONSTRAINT "PropertyListState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
