// Communication between plugin and UI
export interface PluginMessage {
  type: 'init' | 'search-complete' | 'migration-progress' | 'migration-complete' | 'error';
  data?: any;
}

export interface UIMessage {
  type: 'ready' | 'search' | 'migrate' | 'undo' | 'preview' | 'cancel';
  data?: any;
}

// Core data structures
export interface DeprecatedComponent {
  key: string;
  name: string;
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