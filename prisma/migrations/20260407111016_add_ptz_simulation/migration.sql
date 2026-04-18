-- CreateTable
CREATE TABLE "public"."ptz_simulations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyPrice" INTEGER NOT NULL,
    "propertyZone" TEXT NOT NULL,
    "householdSize" INTEGER NOT NULL,
    "isPrimoAccedant" BOOLEAN NOT NULL,
    "annualIncome" INTEGER NOT NULL,
    "workPercentage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEligible" BOOLEAN NOT NULL,
    "maxPtzAmount" INTEGER NOT NULL,
    "ptzRate" INTEGER NOT NULL,
    "ptzDuration" INTEGER NOT NULL,

    CONSTRAINT "ptz_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ptz_simulations_userId_idx" ON "public"."ptz_simulations"("userId");
