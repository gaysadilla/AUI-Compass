export interface ComponentRegistry {
  version: string;
  lastUpdated: string;
  components: Record<string, ComponentDefinition>;
  mappings: ComponentMapping[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  displayName: string;
  key: string;
  type: 'component' | 'component_set';
  properties: Record<string, any>;
  deprecated: boolean;
  lastModified: string;
  fileKey: string;
}

export interface ComponentMapping {
  from: string;
  to: string;
  mappingFunction?: string;
}