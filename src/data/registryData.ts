import { ComponentRegistry } from '../types/registry';

export const registryData: ComponentRegistry = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  components: {
    'button-deprecated': {
      id: 'button-deprecated',
      name: '.🛑 Button (Deprecated)',
      displayName: 'Button',
      key: '8f646f204ad28670137420637fad9fda7fff73d1',
      type: 'component_set',
      properties: {},
      deprecated: true,
      lastModified: new Date().toISOString(),
      fileKey: 'file-key',
    },
    'action': {
      id: 'action',
      name: '🟢 Action',
      displayName: 'Action',
      key: '090f47fec4dcae8e14a1ee5baf521cc7d9a2cda0',
      type: 'component_set',
      properties: {},
      deprecated: false,
      lastModified: new Date().toISOString(),
      fileKey: 'm53qXHtSGzqPNze050jhTp'
    },
  },
  mappings: [
    {
      sourceComponent: {
        id: 'button-deprecated',
        name: '.🛑 Button (Deprecated)',
        key: '8f646f204ad28670137420637fad9fda7fff73d1'
      },
      targetComponent: {
        id: 'action',
        name: '🟢 Action',
        key: '090f47fec4dcae8e14a1ee5baf521cc7d9a2cda0'
      },
      propertyMappings: {
        // This will use your existing Button-to-Action mapping logic
      },
      confidence: 0.95,
      validationStatus: 'validated',
      notes: 'Uses Button-to-Action property mapping'
    }
  ],
  metadata: {
    totalComponents: 2,
    deprecatedComponents: 1,
    validatedMappings: 1,
    pendingMappings: 0,
  }
}; 