/// <reference types="@figma/plugin-typings" />

// This file runs in the Figma environment
import { UI_WIDTH, UI_HEIGHT, MESSAGE_TYPES } from './utils/constants';
import { UIMessage } from './types';
import { registryData } from './data/registryData';
import { DeprecatedComponent, ComponentInstance, SearchScope } from './types';

console.log('AUI Compass: BACKEND LOADED');

// Show the UI
figma.showUI(__html__, {
  width: UI_WIDTH,
  height: UI_HEIGHT,
  title: 'AUI Compass',
  visible: true // Ensure UI is visible
});

console.log('UI window created');

// Handle messages from the UI
figma.ui.onmessage = async (msg: UIMessage) => {
  console.log('Received message from UI:', msg);
  try {
    switch (msg.type) {
      case MESSAGE_TYPES.READY:
        console.log('UI is ready, sending initial data');
        // UI is ready, send initial data
        figma.ui.postMessage({
          type: MESSAGE_TYPES.INIT,
          data: {
            selection: figma.currentPage.selection.length,
            currentPage: figma.currentPage.name
          }
        });
        break;

      case MESSAGE_TYPES.SEARCH:
        console.log('AUI Compass: BACKEND SEARCH HANDLER', msg.data);
        console.log('Search requested:', msg.data);
        // Determine scope
        const scope: SearchScope = msg.data?.scope || 'selection';
        let nodes: readonly SceneNode[] = [];
        function isSceneNode(node: BaseNode): node is SceneNode {
          return node.type !== 'PAGE';
        }
        if (scope === 'selection') {
          nodes = figma.currentPage.selection;
        } else if (scope === 'page') {
          nodes = figma.currentPage.findAll(isSceneNode) as SceneNode[];
        } else if (scope === 'file') {
          nodes = figma.root.findAll(isSceneNode) as SceneNode[];
        }
        // Get deprecated components from registry
        const deprecatedComponents = Object.values(registryData.components).filter(c => c.deprecated);
        // Map component key to registry entry
        const deprecatedKeyMap = new Map(deprecatedComponents.map(c => [c.key, c]));
        // Find all instances of deprecated components
        const results: DeprecatedComponent[] = [];
        for (const component of deprecatedComponents) {
          const instances: ComponentInstance[] = [];
          for (const node of nodes) {
            if (node.type === 'INSTANCE' && node.mainComponent?.key === component.key) {
              instances.push({
                nodeId: node.id,
                pageName: node.parent && 'name' in node.parent ? (node.parent as PageNode).name : figma.currentPage.name,
              });
            }
          }
          if (instances.length > 0) {
            results.push({
              key: component.key,
              name: component.name,
              deprecatedDate: component.lastModified,
              instanceCount: instances.length,
              instances,
            });
          }
        }
        figma.ui.postMessage({
          type: MESSAGE_TYPES.SEARCH_COMPLETE,
          data: { components: results },
        });
        break;

      case MESSAGE_TYPES.CANCEL:
        figma.closePlugin();
        break;

      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error: unknown) {
    console.error('Error handling message:', error);
    figma.ui.postMessage({
      type: MESSAGE_TYPES.ERROR,
      data: { message: error instanceof Error ? error.message : 'An unknown error occurred' }
    });
  }
};

// Clean up function (important for good UX)
figma.on('close', () => {
  console.log('Plugin closing');
}); 