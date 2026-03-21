-- CreateEnum
CREATE TYPE "PropertyTrackingStatus" AS ENUM ('WANTED', 'VISITED');

-- CreateEnum
CREATE TYPE "PersistedPropertyType" AS ENUM ('NEW', 'OLD');

-- CreateTable
CREATE TABLE "PropertyListState" (
    "id" TEXT NOT NULL,
    "financingSettings" JSONB,
    "lastSimulation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyListState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyListItem" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "status" "PropertyTrackingStatus" NOT NULL,
    "propertyType" "PersistedPropertyType" NOT NULL,
    "listingUrl" TEXT,
    "departmentCode" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "addressOrSector" TEXT NOT NULL,
    "propertyTaxAnnual" DOUBLE PRECISION NOT NULL,
    "coOwnershipFeesAnnual" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyRenovationWorkItem" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "cost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PropertyRenovationWorkItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PropertyListItem" ADD CONSTRAINT "PropertyListItem_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "PropertyListState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyRenovationWorkItem" ADD CONSTRAINT "PropertyRenovationWorkItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "PropertyListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
