import {
  PropertyItemInput,
  PropertyListFinancingSettings,
  PropertyListSimulationOutput,
} from './property-list.types';

export const PROPERTY_LIST_REPOSITORY = Symbol('PROPERTY_LIST_REPOSITORY');

export interface PropertyListRepository {
  saveFinancingSettings(settings: PropertyListFinancingSettings): void;
  getFinancingSettings(): PropertyListFinancingSettings | null;
  addProperty(property: PropertyItemInput): void;
  listProperties(): PropertyItemInput[];
  removeProperty(propertyId: string): boolean;
  saveLastSimulation(simulation: PropertyListSimulationOutput | null): void;
  getLastSimulation(): PropertyListSimulationOutput | null;
}
