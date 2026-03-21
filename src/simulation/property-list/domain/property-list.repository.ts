import {
  PropertyItemInput,
  PropertyListFinancingSettings,
  PropertyListSimulationOutput,
} from './property-list.types';

export const PROPERTY_LIST_REPOSITORY = Symbol('PROPERTY_LIST_REPOSITORY');

export interface PropertyListRepository {
  saveFinancingSettings(settings: PropertyListFinancingSettings): Promise<void>;
  getFinancingSettings(): Promise<PropertyListFinancingSettings | null>;
  addProperty(property: PropertyItemInput): Promise<void>;
  listProperties(): Promise<PropertyItemInput[]>;
  removeProperty(propertyId: string): Promise<boolean>;
  saveLastSimulation(simulation: PropertyListSimulationOutput | null): Promise<void>;
  getLastSimulation(): Promise<PropertyListSimulationOutput | null>;
}
