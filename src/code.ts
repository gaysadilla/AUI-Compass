/// <reference types="@figma/plugin-typings" />

// This file runs in the Figma environment
import { UI_WIDTH, UI_HEIGHT, MESSAGE_TYPES } from './utils/constants';
import { UIMessage } from './types';

console.log('Plugin code starting...');

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
        console.log('Search requested:', msg.data);
        // TODO: Implement search
        figma.ui.postMessage({
          type: MESSAGE_TYPES.SEARCH_COMPLETE,
          data: { components: [] }
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