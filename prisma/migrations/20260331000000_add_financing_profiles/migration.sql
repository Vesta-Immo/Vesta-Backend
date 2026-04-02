-- Migration: Ajout des tables pour les profils de financement
-- Date: 2026-03-31

-- Table des profils de financement
CREATE TABLE "financing_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceScenarioId" TEXT NOT NULL,
    "sourceProjectId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financing_profiles_pkey" PRIMARY KEY ("id")
);

-- Table des préférences utilisateur (profil actif)
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- Index pour financing_profiles
CREATE INDEX "financing_profiles_userId_idx" ON "financing_profiles"("userId");
CREATE INDEX "financing_profiles_sourceScenarioId_idx" ON "financing_profiles"("sourceScenarioId");
CREATE INDEX "financing_profiles_sourceProjectId_idx" ON "financing_profiles"("sourceProjectId");

-- Index pour user_preferences
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");
CREATE INDEX "user_preferences_activeProfileId_idx" ON "user_preferences"("activeProfileId");

-- Contraintes d'unicité
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- Clés étrangères
ALTER TABLE "financing_profiles" ADD CONSTRAINT "financing_profiles_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_activeProfileId_fkey" 
    FOREIGN KEY ("activeProfileId") REFERENCES "financing_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
