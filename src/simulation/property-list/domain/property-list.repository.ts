import {
  PropertyItemInput,
  PropertyListFinancingSettings,
  PropertyListSimulationOutput,
} from './property-list.types';

export const PROPERTY_LIST_REPOSITORY = Symbol('PROPERTY_LIST_REPOSITORY');

export interface PropertyListRepository {
  saveFinancingSettings(userId: string, settings: PropertyListFinancingSettings): Promise<void>;
  getFinancingSettings(userId: string): Promise<PropertyListFinancingSettings | null>;
  addProperty(userId: string, property: PropertyItemInput): Promise<void>;
  listProperties(userId: string): Promise<PropertyItemInput[]>;
  removeProperty(userId: string, propertyId: string): Promise<boolean>;
  saveLastSimulation(
    userId: string,
    simulation: PropertyListSimulationOutput | null,
  ): Promise<void>;
  getLastSimulation(userId: string): Promise<PropertyListSimulationOutput | null>;
}
