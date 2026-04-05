-- CreateTable
CREATE TABLE "public"."prix_immo_departement" (
    "id" BIGSERIAL NOT NULL,
    "code_departement" TEXT NOT NULL,
    "nom_departement" TEXT NOT NULL,
    "type_bien" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "prix_median_m2" DOUBLE PRECISION NOT NULL,
    "nb_transactions" INTEGER NOT NULL,
    "evolution_1an_pct" DOUBLE PRECISION,
    "statut" TEXT NOT NULL,

    CONSTRAINT "prix_immo_departement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prix_immo_departement_code_departement_annee_idx" ON "public"."prix_immo_departement"("code_departement", "annee");

-- CreateIndex
CREATE INDEX "prix_immo_departement_type_bien_annee_idx" ON "public"."prix_immo_departement"("type_bien", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "prix_immo_departement_code_departement_type_bien_annee_key" ON "public"."prix_immo_departement"("code_departement", "type_bien", "annee");
