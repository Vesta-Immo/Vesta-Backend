import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service';
import { PtzEligibilityRepository } from '../../domain/ptz-eligibility.repository';
import { PtzEligibilityInput, PtzEligibilityResult, PtzSimulationRecord } from '../../domain/ptz.types';

/**
 * Implémentation Prisma du repository PTZ
 */
@Injectable()
export class PrismaPtzRepository implements PtzEligibilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    input: PtzEligibilityInput,
    result: PtzEligibilityResult,
  ): Promise<PtzSimulationRecord> {
    const record = await this.prisma.ptzSimulation.create({
      data: {
        userId: input.userId,
        propertyPrice: input.propertyPrice,
        propertyZone: input.propertyZone,
        householdSize: input.householdSize,
        isPrimoAccedant: input.isPrimoAccedant,
        annualIncome: input.annualIncome,
        workPercentage: input.workPercentage ?? 0,
        isEligible: result.isEligible,
        maxPtzAmount: result.maxPtzAmount ?? 0,
        ptzRate: result.ptzRate ?? 0,
        ptzDuration: result.ptzDuration ?? 0,
        operationId: input.operationId ?? null,
      },
    });

    return this.mapToRecord(record);
  }

  async findByUserId(userId: string): Promise<PtzSimulationRecord[]> {
    const records = await this.prisma.ptzSimulation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.mapToRecord(record));
  }

  async findById(id: string): Promise<PtzSimulationRecord | null> {
    const record = await this.prisma.ptzSimulation.findUnique({
      where: { id },
    });

    if (!record) return null;
    return this.mapToRecord(record);
  }

  async existsByOperationId(operationId: string): Promise<boolean> {
    if (!operationId) {
      return false;
    }
    const count = await this.prisma.ptzSimulation.count({
      where: { operationId },
    });
    return count > 0;
  }

  async findByOperationId(operationId: string): Promise<PtzSimulationRecord | null> {
    if (!operationId) {
      return null;
    }
    const record = await this.prisma.ptzSimulation.findFirst({
      where: { operationId },
    });

    if (!record) return null;
    return this.mapToRecord(record);
  }

  private mapToRecord(record: any): PtzSimulationRecord {
    return {
      id: record.id,
      userId: record.userId,
      propertyPrice: record.propertyPrice,
      propertyZone: record.propertyZone,
      householdSize: record.householdSize,
      isPrimoAccedant: record.isPrimoAccedant,
      annualIncome: record.annualIncome,
      workPercentage: record.workPercentage,
      isEligible: record.isEligible,
      maxPtzAmount: record.maxPtzAmount,
      ptzRate: record.ptzRate,
      ptzDuration: record.ptzDuration,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
