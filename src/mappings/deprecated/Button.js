"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buttonToActionMapping = {
    sourceComponent: {
        id: 'DEPRECATED_BUTTON_ID', // Replace with actual ID
        name: '.🔴 Button',
        key: 'DEPRECATED_BUTTON_KEY', // Replace with actual key
    },
    targetComponent: {
        id: 'ACTION_COMPONENT_ID', // Replace with actual ID
        name: '🟢 Action',
        key: 'ACTION_COMPONENT_KEY', // Replace with actual key
    },
    propertyMappings: {
        variant: {
            targetProperty: 'variant',
            transformation: (value) => {
                const buttonToActionMap = {
                    'primary': 'primary',
                    'secondary': 'secondary',
                    'tertiary': 'tertiary',
                    'danger': 'danger',
                };
                return buttonToActionMap[value] || value;
            },
            description: 'Maps Button variants to Action variants',
        },
        size: {
            targetProperty: 'size',
            description: 'Direct mapping of size property',
        },
        state: {
            targetProperty: 'state',
            description: 'Direct mapping of state property',
        },
        // Add more direct property mappings as needed
        // For example:
        // icon: {
        //   targetProperty: 'icon',
        //   description: 'Direct mapping of icon property',
        // },
        // label: {
        //   targetProperty: 'label',
        //   description: 'Direct mapping of label property',
        // },
        // For brand theming/dark mode properties, you can add a placeholder or a transformation that logs a warning
        // brandTheme: {
        //   targetProperty: 'brandTheme',
        //   transformation: (value: string) => {
        //     console.warn('Brand theming is now controlled via tokens/variants. Please update your usage.');
        //     return value;
        //   },
        //   description: 'Brand theming is now controlled via tokens/variants',
        // },
    },
    confidence: 100,
    validationStatus: 'pending',
};
exports.default = buttonToActionMapping;
