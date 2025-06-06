export interface ComponentMetadata {
  id: string;
  name: string;
  key: string;
  description?: string;
  type: 'component' | 'component_set';
  properties: {
    [key: string]: {
      type: string;
      value: any;
      description?: string;
    };
  };
  variants?: {
    [key: string]: string[];
  };
  deprecated?: boolean;
  replacement?: string;
  lastModified: string;
  fileKey: string;
}

export interface ComponentMapping {
  sourceComponent: {
    id: string;
    name: string;
    key: string;
  };
  targetComponent: {
    id: string;
    name: string;
    key: string;
  };
  propertyMappings: {
    [sourceProperty: string]: {
      targetProperty: string;
      transformation?: (value: any) => any;
      description?: string;
    };
  };
  confidence: number;
  validationStatus: 'pending' | 'validated' | 'rejected';
  lastValidated?: string;
  notes?: string;
}

export interface ComponentRegistry {
  version: string;
  lastUpdated: string;
  components: {
    [componentId: string]: ComponentMetadata;
  };
  mappings: ComponentMapping[];
  metadata: {
    totalComponents: number;
    deprecatedComponents: number;
    validatedMappings: number;
    pendingMappings: number;
  };
} 