import { Injectable } from '@nestjs/common';
import { PropertyListRepository } from '../../domain/property-list.repository';
import {
  PropertyItemInput,
  PropertyListFinancingSettings,
  PropertyListSimulationOutput,
} from '../../domain/property-list.types';

@Injectable()
export class InMemoryPropertyListRepository implements PropertyListRepository {
  private financingSettings: PropertyListFinancingSettings | null = null;
  private readonly properties = new Map<string, PropertyItemInput>();
  private lastSimulation: PropertyListSimulationOutput | null = null;

  saveFinancingSettings(settings: PropertyListFinancingSettings): void {
    this.financingSettings = { ...settings };
  }

  getFinancingSettings(): PropertyListFinancingSettings | null {
    if (!this.financingSettings) {
      return null;
    }

    return { ...this.financingSettings };
  }

  addProperty(property: PropertyItemInput): void {
    this.properties.set(property.id, {
      ...property,
      renovationWorkItems: property.renovationWorkItems.map((item) => ({ ...item })),
    });
  }

  listProperties(): PropertyItemInput[] {
    return Array.from(this.properties.values()).map((property) => ({
      ...property,
      renovationWorkItems: property.renovationWorkItems.map((item) => ({ ...item })),
    }));
  }

  removeProperty(propertyId: string): boolean {
    return this.properties.delete(propertyId);
  }

  saveLastSimulation(simulation: PropertyListSimulationOutput | null): void {
    if (!simulation) {
      this.lastSimulation = null;
      return;
    }

    this.lastSimulation = {
      ...simulation,
      results: simulation.results.map((result) => ({ ...result })),
    };
  }

  getLastSimulation(): PropertyListSimulationOutput | null {
    if (!this.lastSimulation) {
      return null;
    }

    return {
      ...this.lastSimulation,
      results: this.lastSimulation.results.map((result) => ({ ...result })),
    };
  }
}
