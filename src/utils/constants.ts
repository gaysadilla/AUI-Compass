export const PLUGIN_NAME = 'AUI Compass';
export const PLUGIN_VERSION = '1.0.0';

// Figma UI dimensions
export const UI_WIDTH = 400;
export const UI_HEIGHT = 600;

// Message types for type safety
export const MESSAGE_TYPES = {
  // From Plugin to UI
  INIT: 'init',
  SEARCH_COMPLETE: 'search-complete',
  MIGRATION_PROGRESS: 'migration-progress',
  MIGRATION_COMPLETE: 'migration-complete',
  ERROR: 'error',

  // From UI to Plugin
  READY: 'ready',
  SEARCH: 'search',
  MIGRATE: 'migrate',
  UNDO: 'undo',
  PREVIEW: 'preview',
  CANCEL: 'cancel',
  GET_COMPONENT_KEYS: 'GET_COMPONENT_KEYS',
  ANALYZE_COMPONENTS: 'ANALYZE_COMPONENTS',
} as const; 