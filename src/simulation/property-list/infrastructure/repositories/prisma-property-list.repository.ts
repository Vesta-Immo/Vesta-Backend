import { Injectable } from '@nestjs/common';
import {
  PersistedPropertyType,
  Prisma,
  PropertyTrackingStatus as PrismaPropertyTrackingStatus,
} from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service';
import { PropertyListRepository } from '../../domain/property-list.repository';
import {
  PropertyItemInput,
  PropertyListFinancingSettings,
  PropertyListSimulationOutput,
  PropertyTrackingStatus,
  PropertyType,
} from '../../domain/property-list.types';

@Injectable()
export class PrismaPropertyListRepository implements PropertyListRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveFinancingSettings(
    userId: string,
    settings: PropertyListFinancingSettings,
  ): Promise<void> {
    const state = await this.ensureUserState(userId);

    await this.prisma.propertyListState.upsert({
      where: { id: state.id },
      create: {
        id: state.id,
        userId: state.userId,
        financingSettings: serializeJson(settings),
      },
      update: {
        financingSettings: serializeJson(settings),
      },
    });
  }

  async getFinancingSettings(userId: string): Promise<PropertyListFinancingSettings | null> {
    const state = await this.findUserState(userId, {
      financingSettings: true,
    });

    return deserializeFinancingSettings(state?.financingSettings);
  }

  async addProperty(userId: string, property: PropertyItemInput): Promise<void> {
    const state = await this.ensureUserState(userId);

    const existingProperty = await this.prisma.propertyListItem.findFirst({
      where: {
        id: property.id,
        stateId: state.id,
      },
      select: { id: true },
    });

    if (existingProperty) {
      await this.prisma.propertyListItem.update({
        where: { id: property.id },
        data: {
          status: mapTrackingStatusToPrisma(property.status),
          propertyType: mapPropertyTypeToPrisma(property.propertyType),
          listingUrl: property.listingUrl,
          departmentCode: property.departmentCode,
          price: property.price,
          addressOrSector: property.addressOrSector,
          propertyTaxAnnual: property.propertyTaxAnnual,
          coOwnershipFeesAnnual: property.coOwnershipFeesAnnual,
          renovationWorkItems: {
            deleteMany: {},
            create: property.renovationWorkItems.map((item, index) => ({
              position: index,
              name: item.name,
              details: item.details,
              cost: item.cost,
            })),
          },
        },
      });
      return;
    }

    await this.prisma.propertyListItem.create({
      data: {
        id: property.id,
        stateId: state.id,
        status: mapTrackingStatusToPrisma(property.status),
        propertyType: mapPropertyTypeToPrisma(property.propertyType),
        listingUrl: property.listingUrl,
        departmentCode: property.departmentCode,
        price: property.price,
        addressOrSector: property.addressOrSector,
        propertyTaxAnnual: property.propertyTaxAnnual,
        coOwnershipFeesAnnual: property.coOwnershipFeesAnnual,
        renovationWorkItems: {
          create: property.renovationWorkItems.map((item, index) => ({
            position: index,
            name: item.name,
            details: item.details,
            cost: item.cost,
          })),
        },
      },
    });
  }

  async listProperties(userId: string): Promise<PropertyItemInput[]> {
    const state = await this.findUserState(userId, { id: true });

    if (!state) {
      return [];
    }

    const properties = await this.prisma.propertyListItem.findMany({
      where: { stateId: state.id },
      orderBy: { createdAt: 'asc' },
      include: {
        renovationWorkItems: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return properties.map((property) => ({
      id: property.id,
      status: mapTrackingStatusFromPrisma(property.status),
      propertyType: mapPropertyTypeFromPrisma(property.propertyType),
      listingUrl: property.listingUrl ?? undefined,
      departmentCode: property.departmentCode ?? undefined,
      price: property.price,
      addressOrSector: property.addressOrSector,
      propertyTaxAnnual: property.propertyTaxAnnual,
      coOwnershipFeesAnnual: property.coOwnershipFeesAnnual,
      renovationWorkItems: property.renovationWorkItems.map((item) => ({
        name: item.name,
        details: item.details ?? undefined,
        cost: item.cost,
      })),
    }));
  }

  async removeProperty(userId: string, propertyId: string): Promise<boolean> {
    const state = await this.findUserState(userId, { id: true });

    if (!state) {
      return false;
    }

    const result = await this.prisma.propertyListItem.deleteMany({
      where: {
        id: propertyId,
        stateId: state.id,
      },
    });

    return result.count > 0;
  }

  async saveLastSimulation(
    userId: string,
    simulation: PropertyListSimulationOutput | null,
  ): Promise<void> {
    const state = await this.ensureUserState(userId);

    await this.prisma.propertyListState.upsert({
      where: { id: state.id },
      create: {
        id: state.id,
        userId: state.userId,
        lastSimulation: simulation ? serializeJson(simulation) : Prisma.JsonNull,
      },
      update: {
        lastSimulation: simulation ? serializeJson(simulation) : Prisma.JsonNull,
      },
    });
  }

  async getLastSimulation(userId: string): Promise<PropertyListSimulationOutput | null> {
    const state = await this.findUserState(userId, {
      lastSimulation: true,
    });

    return deserializeSimulation(state?.lastSimulation);
  }

  private async findUserState<TSelection extends Prisma.PropertyListStateSelect>(
    supabaseAuthUserId: string,
    select: TSelection,
  ): Promise<Prisma.PropertyListStateGetPayload<{ select: TSelection }> | null> {
    return this.prisma.propertyListState.findFirst({
      where: {
        user: {
          supabaseAuthUserId,
        },
      },
      select,
    });
  }

  private async ensureUserState(
    supabaseAuthUserId: string,
  ): Promise<{ id: string; userId: string }> {
    const user = await this.prisma.user.upsert({
      where: { supabaseAuthUserId },
      create: { supabaseAuthUserId },
      update: {},
      select: { id: true },
    });

    const state = await this.prisma.propertyListState.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
      },
      update: {},
      select: { id: true, userId: true },
    });

    return state;
  }
}

function mapTrackingStatusToPrisma(
  status: PropertyTrackingStatus,
): PrismaPropertyTrackingStatus {
  return status === PropertyTrackingStatus.VISITED
    ? PrismaPropertyTrackingStatus.VISITED
    : PrismaPropertyTrackingStatus.WANTED;
}

function mapTrackingStatusFromPrisma(
  status: PrismaPropertyTrackingStatus,
): PropertyTrackingStatus {
  return status === PrismaPropertyTrackingStatus.VISITED
    ? PropertyTrackingStatus.VISITED
    : PropertyTrackingStatus.WANTED;
}

function mapPropertyTypeToPrisma(type: PropertyType): PersistedPropertyType {
  return type === PropertyType.NEW ? PersistedPropertyType.NEW : PersistedPropertyType.OLD;
}

function mapPropertyTypeFromPrisma(type: PersistedPropertyType): PropertyType {
  return type === PersistedPropertyType.NEW ? PropertyType.NEW : PropertyType.OLD;
}

function serializeJson(value: object): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function deserializeFinancingSettings(
  value: Prisma.JsonValue | null | undefined,
): PropertyListFinancingSettings | null {
  if (value === null || value === undefined) {
    return null;
  }

  return value as unknown as PropertyListFinancingSettings;
}

function deserializeSimulation(
  value: Prisma.JsonValue | null | undefined,
): PropertyListSimulationOutput | null {
  if (value === null || value === undefined) {
    return null;
  }

  return value as unknown as PropertyListSimulationOutput;
}