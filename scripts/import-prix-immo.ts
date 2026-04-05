import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface PrixImmoRow {
  code_departement: string;
  nom_departement: string;
  type_bien: string;
  annee: number;
  prix_median_m2: number;
  nb_transactions: number;
  evolution_1an_pct?: number;
  statut: string;
}

const BATCH_SIZE = 1000;

async function importPrixImmo(filePath: string, batchSize: number): Promise<void> {
  const prisma = new PrismaClient();
  const startTime = Date.now();

  let totalRead = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let invalidCount = 0;

  try {
    console.log(`📂 Lecture du fichier: ${filePath} (ou ./data/pricing.json par défaut)`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: PrixImmoRow[] = JSON.parse(fileContent);
    totalRead = data.length;
    console.log(`📊 ${totalRead} enregistrements à traiter\n`);

    const batches: PrixImmoRow[][] = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNum = i + 1;

      // Validate batch
      const validRecords = batch.filter((row) => {
        const isValid =
          row.code_departement &&
          row.nom_departement &&
          row.type_bien &&
          typeof row.annee === 'number' &&
          typeof row.prix_median_m2 === 'number' &&
          typeof row.nb_transactions === 'number' &&
          row.statut;
        if (!isValid) {
          invalidCount++;
        }
        return isValid;
      });

      if (validRecords.length === 0) {
        console.log(`⚠️  Batch ${batchNum}/${batches.length}: aucun enregistrement valide`);
        continue;
      }

      try {
        const result = await prisma.prixImmoDepartement.createMany({
          data: validRecords.map((row) => ({
            codeDepartement: String(row.code_departement),
            nomDepartement: String(row.nom_departement),
            typeBien: String(row.type_bien),
            annee: Number(row.annee),
            prixMedianM2: Number(row.prix_median_m2),
            nbTransactions: Number(row.nb_transactions),
            evolution1anPct: row.evolution_1an_pct != null ? Number(row.evolution_1an_pct) : null,
            statut: String(row.statut),
          })),
          skipDuplicates: true,
        });

        totalInserted += result.count;
        totalSkipped += validRecords.length - result.count;
        console.log(
          `✅ Batch ${batchNum}/${batches.length} - Insérés: ${result.count}, Ignorés: ${validRecords.length - result.count}`,
        );
      } catch (error) {
        console.error(`❌ Batch ${batchNum}/${batches.length} - Erreur:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('📈 RÉSUMÉ DE L\'IMPORT');
  console.log('='.repeat(50));
  console.log(`Total lu:        ${totalRead}`);
  console.log(`Total inséré:    ${totalInserted}`);
  console.log(`Total ignoré:    ${totalSkipped} (doublons)`);
  console.log(`Total invalide:  ${invalidCount}`);
  console.log(`Durée:           ${duration}s`);
  console.log('='.repeat(50));
}

const args = process.argv.slice(2);
const filePath = args[0] || path.resolve(process.cwd(), './data/pricing.json');
const batchSize = args[1] ? parseInt(args[1], 10) : BATCH_SIZE;

if (isNaN(batchSize) || batchSize < 1) {
  console.error('❌ Taille de batch invalide');
  process.exit(1);
}

console.log(`🚀 Import PrixImmo - Fichier: ${filePath}, Batch: ${batchSize}\n`);

importPrixImmo(filePath, batchSize)
  .then(() => {
    console.log('\n✅ Import terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import échoué:', error);
    process.exit(1);
  });