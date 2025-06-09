"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registryData = void 0;
exports.registryData = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    components: {
        'button-deprecated': {
            id: 'button-deprecated',
            name: '.🛑 Button (Deprecated)',
            key: '34:246653',
            type: 'component_set',
            properties: {},
            deprecated: true,
            lastModified: new Date().toISOString(),
            fileKey: 'file-key',
        },
        'action-current': {
            id: 'action-current',
            name: 'Action',
            key: 'action-key',
            type: 'component',
            properties: {},
            deprecated: false,
            lastModified: new Date().toISOString(),
            fileKey: 'file-key',
        },
    },
    mappings: [
        {
            sourceComponent: {
                id: 'button-deprecated',
                name: '.🛑 Button (Deprecated)',
                key: '34:246653',
            },
            targetComponent: {
                id: 'action-current',
                name: 'Action',
                key: 'action-key',
            },
            propertyMappings: {},
            confidence: 100,
            validationStatus: 'validated',
        },
    ],
    metadata: {
        totalComponents: 2,
        deprecatedComponents: 1,
        validatedMappings: 1,
        pendingMappings: 0,
    },
};
