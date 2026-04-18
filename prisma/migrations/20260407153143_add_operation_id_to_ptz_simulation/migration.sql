-- AlterTable
ALTER TABLE "public"."ptz_simulations" ADD COLUMN     "operationId" TEXT;

-- CreateIndex
CREATE INDEX "ptz_simulations_operationId_idx" ON "public"."ptz_simulations"("operationId");
