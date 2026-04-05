import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { DEPARTEMENT_TO_REGION, REGIONS } from '../constants/regions';

export interface DepartementPrixImmo {
  codeDepartement: string;
  nomDepartement: string;
  typeBien: string;
  annee: number;
  prixMedianM2: number;
  nbTransactions: number;
  evolution1anPct: number | null;
  statut: string;
}

export interface RegionPrixImmo {
  nomRegion: string;
  typeBien: string;
  annee: number;
  prixMedianM2: number;
  nbTransactions: number;
  evolution1anPct: number | null;
  departements: string[];
}

@Injectable()
export class PrixImmoService {
  constructor(private readonly prisma: PrismaService) {}

  async getDepartements(annee?: number, typeBien?: string): Promise<DepartementPrixImmo[]> {
    const where: Record<string, unknown> = {};

    if (annee !== undefined) {
      where.annee = annee;
    }

    if (typeBien !== undefined) {
      where.typeBien = typeBien;
    }

    const results = await this.prisma.prixImmoDepartement.findMany({
      where,
      orderBy: [{ annee: 'desc' }, { codeDepartement: 'asc' }],
    });

    return results.map((row) => ({
      codeDepartement: row.codeDepartement,
      nomDepartement: row.nomDepartement,
      typeBien: row.typeBien,
      annee: row.annee,
      prixMedianM2: row.prixMedianM2,
      nbTransactions: row.nbTransactions,
      evolution1anPct: row.evolution1anPct,
      statut: row.statut,
    }));
  }

  async getRegions(annee?: number, typeBien?: string): Promise<RegionPrixImmo[]> {
    const where: Record<string, unknown> = {};

    if (annee !== undefined) {
      where.annee = annee;
    }

    if (typeBien !== undefined) {
      where.typeBien = typeBien;
    }

    const departements = await this.prisma.prixImmoDepartement.findMany({
      where,
    });

    const regionMap = new Map<string, DepartementPrixImmo[]>();

    for (const dept of departements) {
      const region = DEPARTEMENT_TO_REGION[dept.codeDepartement];
      if (!region) {
        continue;
      }

      const key = `${region}-${dept.typeBien}-${dept.annee}`;
      if (!regionMap.has(key)) {
        regionMap.set(key, []);
      }
      regionMap.get(key)!.push({
        codeDepartement: dept.codeDepartement,
        nomDepartement: dept.nomDepartement,
        typeBien: dept.typeBien,
        annee: dept.annee,
        prixMedianM2: dept.prixMedianM2,
        nbTransactions: dept.nbTransactions,
        evolution1anPct: dept.evolution1anPct,
        statut: dept.statut,
      });
    }

    const regions: RegionPrixImmo[] = [];

    for (const [, depts] of regionMap) {
      if (depts.length === 0) {
        continue;
      }

      const firstDept = depts[0];
      const region = DEPARTEMENT_TO_REGION[firstDept.codeDepartement];

      // Calcul du prix médian pondéré
      const totalPrixTransactions = depts.reduce(
        (sum, d) => sum + d.prixMedianM2 * d.nbTransactions,
        0,
      );
      const totalTransactions = depts.reduce((sum, d) => sum + d.nbTransactions, 0);

      const prixMedianPondere =
        totalTransactions > 0 ? totalPrixTransactions / totalTransactions : 0;

      // Calcul de l'évolution 1 an (moyenne pondérée par nbTransactions)
      const evolution1anPondere = this.calculateWeightedEvolution(depts);

      regions.push({
        nomRegion: region,
        typeBien: firstDept.typeBien,
        annee: firstDept.annee,
        prixMedianM2: prixMedianPondere,
        nbTransactions: totalTransactions,
        evolution1anPct: evolution1anPondere,
        departements: depts.map((d) => d.codeDepartement),
      });
    }

    return regions.sort((a, b) => {
      if (a.nomRegion !== b.nomRegion) {
        return a.nomRegion.localeCompare(b.nomRegion);
      }
      if (a.typeBien !== b.typeBien) {
        return a.typeBien.localeCompare(b.typeBien);
      }
      return b.annee - a.annee;
    });
  }

  private calculateWeightedEvolution(depts: DepartementPrixImmo[]): number | null {
    const deptsWithEvolution = depts.filter((d) => d.evolution1anPct !== null);

    if (deptsWithEvolution.length === 0) {
      return null;
    }

    const totalWeight = deptsWithEvolution.reduce((sum, d) => sum + d.nbTransactions, 0);

    if (totalWeight === 0) {
      return null;
    }

    const weightedSum = deptsWithEvolution.reduce(
      (sum, d) => sum + (d.evolution1anPct ?? 0) * d.nbTransactions,
      0,
    );

    return weightedSum / totalWeight;
  }
}