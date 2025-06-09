"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE_TYPES = exports.UI_HEIGHT = exports.UI_WIDTH = exports.PLUGIN_VERSION = exports.PLUGIN_NAME = void 0;
exports.PLUGIN_NAME = 'AUI Compass';
exports.PLUGIN_VERSION = '1.0.0';
// Figma UI dimensions
exports.UI_WIDTH = 400;
exports.UI_HEIGHT = 600;
// Message types for type safety
exports.MESSAGE_TYPES = {
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
};
