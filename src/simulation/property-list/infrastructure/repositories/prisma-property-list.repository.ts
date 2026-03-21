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

const DEFAULT_PROPERTY_LIST_STATE_ID = 'default';

@Injectable()
export class PrismaPropertyListRepository implements PropertyListRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveFinancingSettings(
    settings: PropertyListFinancingSettings,
  ): Promise<void> {
    await this.prisma.propertyListState.upsert({
      where: { id: DEFAULT_PROPERTY_LIST_STATE_ID },
      create: {
        id: DEFAULT_PROPERTY_LIST_STATE_ID,
        financingSettings: serializeJson(settings),
      },
      update: {
        financingSettings: serializeJson(settings),
      },
    });
  }

  async getFinancingSettings(): Promise<PropertyListFinancingSettings | null> {
    const state = await this.prisma.propertyListState.findUnique({
      where: { id: DEFAULT_PROPERTY_LIST_STATE_ID },
      select: { financingSettings: true },
    });

    return deserializeFinancingSettings(state?.financingSettings);
  }

  async addProperty(property: PropertyItemInput): Promise<void> {
    await this.prisma.propertyListState.upsert({
      where: { id: DEFAULT_PROPERTY_LIST_STATE_ID },
      create: { id: DEFAULT_PROPERTY_LIST_STATE_ID },
      update: {},
    });

    await this.prisma.propertyListItem.upsert({
      where: { id: property.id },
      create: {
        id: property.id,
        stateId: DEFAULT_PROPERTY_LIST_STATE_ID,
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
      update: {
        stateId: DEFAULT_PROPERTY_LIST_STATE_ID,
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
  }

  async listProperties(): Promise<PropertyItemInput[]> {
    const properties = await this.prisma.propertyListItem.findMany({
      where: { stateId: DEFAULT_PROPERTY_LIST_STATE_ID },
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

  async removeProperty(propertyId: string): Promise<boolean> {
    const result = await this.prisma.propertyListItem.deleteMany({
      where: {
        id: propertyId,
        stateId: DEFAULT_PROPERTY_LIST_STATE_ID,
      },
    });

    return result.count > 0;
  }

  async saveLastSimulation(
    simulation: PropertyListSimulationOutput | null,
  ): Promise<void> {
    await this.prisma.propertyListState.upsert({
      where: { id: DEFAULT_PROPERTY_LIST_STATE_ID },
      create: {
        id: DEFAULT_PROPERTY_LIST_STATE_ID,
        lastSimulation: simulation ? serializeJson(simulation) : Prisma.JsonNull,
      },
      update: {
        lastSimulation: simulation ? serializeJson(simulation) : Prisma.JsonNull,
      },
    });
  }

  async getLastSimulation(): Promise<PropertyListSimulationOutput | null> {
    const state = await this.prisma.propertyListState.findUnique({
      where: { id: DEFAULT_PROPERTY_LIST_STATE_ID },
      select: { lastSimulation: true },
    });

    return deserializeSimulation(state?.lastSimulation);
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