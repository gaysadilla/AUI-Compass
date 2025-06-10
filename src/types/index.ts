// Communication between plugin and UI
export interface PluginMessage {
  type: 'init' | 'search-complete' | 'migration-progress' | 'migration-complete' | 'error';
  data?: any;
}

export interface UIMessage {
  type: 'ready' | 'search' | 'migrate' | 'undo' | 'preview' | 'cancel' | 'GET_COMPONENT_KEYS' | 'ANALYZE_COMPONENTS' | 'diagnose-themes';
  data?: any;
}

// Core data structures
export interface DeprecatedComponent {
  key: string;
  name: string;
  displayName?: string;
  deprecatedDate: string;
  instanceCount: number;
  instances: ComponentInstance[];
}

export interface ComponentInstance {
  nodeId: string;
  pageName: string;
}

// Plugin state
export type SearchScope = 'selection' | 'page' | 'file'; 