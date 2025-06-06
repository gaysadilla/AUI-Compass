import fs from 'fs/promises';
import path from 'path';
import { ComponentRegistry, ComponentMetadata, ComponentMapping } from '../types/registry';

export class RegistryService {
  private registryPath: string;
  private registry: ComponentRegistry | null = null;

  constructor(registryPath: string = path.join(process.cwd(), 'data', 'registry.json')) {
    this.registryPath = registryPath;
  }

  async initialize(): Promise<void> {
    try {
      await fs.access(this.registryPath);
      const data = await fs.readFile(this.registryPath, 'utf-8');
      this.registry = JSON.parse(data);
    } catch (error) {
      // Create new registry if it doesn't exist
      this.registry = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        components: {},
        mappings: [],
        metadata: {
          totalComponents: 0,
          deprecatedComponents: 0,
          validatedMappings: 0,
          pendingMappings: 0
        }
      };
      await this.saveRegistry();
    }
  }

  private async saveRegistry(): Promise<void> {
    if (!this.registry) throw new Error('Registry not initialized');
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.registryPath), { recursive: true });
    
    // Update metadata
    this.registry.lastUpdated = new Date().toISOString();
    this.registry.metadata = {
      totalComponents: Object.keys(this.registry.components).length,
      deprecatedComponents: Object.values(this.registry.components).filter(c => c.deprecated).length,
      validatedMappings: this.registry.mappings.filter(m => m.validationStatus === 'validated').length,
      pendingMappings: this.registry.mappings.filter(m => m.validationStatus === 'pending').length
    };

    await fs.writeFile(this.registryPath, JSON.stringify(this.registry, null, 2));
  }

  async addComponent(component: ComponentMetadata): Promise<void> {
    if (!this.registry) throw new Error('Registry not initialized');
    this.registry.components[component.id] = component;
    await this.saveRegistry();
  }

  async updateComponent(id: string, updates: Partial<ComponentMetadata>): Promise<void> {
    if (!this.registry) throw new Error('Registry not initialized');
    if (!this.registry.components[id]) throw new Error(`Component ${id} not found`);
    
    this.registry.components[id] = {
      ...this.registry.components[id],
      ...updates
    };
    await this.saveRegistry();
  }

  async addMapping(mapping: ComponentMapping): Promise<void> {
    if (!this.registry) throw new Error('Registry not initialized');
    this.registry.mappings.push(mapping);
    await this.saveRegistry();
  }

  async updateMapping(index: number, updates: Partial<ComponentMapping>): Promise<void> {
    if (!this.registry) throw new Error('Registry not initialized');
    if (index < 0 || index >= this.registry.mappings.length) {
      throw new Error('Invalid mapping index');
    }
    
    this.registry.mappings[index] = {
      ...this.registry.mappings[index],
      ...updates
    };
    await this.saveRegistry();
  }

  async getComponent(id: string): Promise<ComponentMetadata | null> {
    if (!this.registry) throw new Error('Registry not initialized');
    return this.registry.components[id] || null;
  }

  async getDeprecatedComponents(): Promise<ComponentMetadata[]> {
    if (!this.registry) throw new Error('Registry not initialized');
    return Object.values(this.registry.components).filter(c => c.deprecated);
  }

  async getMappingsBySource(sourceId: string): Promise<ComponentMapping[]> {
    if (!this.registry) throw new Error('Registry not initialized');
    return this.registry.mappings.filter(m => m.sourceComponent.id === sourceId);
  }

  async getMappingsByTarget(targetId: string): Promise<ComponentMapping[]> {
    if (!this.registry) throw new Error('Registry not initialized');
    return this.registry.mappings.filter(m => m.targetComponent.id === targetId);
  }

  async getPendingMappings(): Promise<ComponentMapping[]> {
    if (!this.registry) throw new Error('Registry not initialized');
    return this.registry.mappings.filter(m => m.validationStatus === 'pending');
  }
} 