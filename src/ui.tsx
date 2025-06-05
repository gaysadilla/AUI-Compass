/// <reference types="react" />
/// <reference types="react-dom" />

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles.css';
import { MESSAGE_TYPES } from './utils/constants';

declare global {
  interface Window {
    pluginLog: (msg: string, data?: any) => void;
  }
}

// Initialize UI when the DOM is ready
function initializeUI() {
  try {
    window.pluginLog('React script loaded', { version: React.version });
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    window.pluginLog('Creating React root');
    const root = createRoot(container);

    // Remove loading content
    container.innerHTML = '';

    window.pluginLog('Rendering App');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Notify plugin that UI is ready
    window.pluginLog('Sending READY message');
    parent.postMessage({ pluginMessage: { type: MESSAGE_TYPES.READY } }, '*');
  } catch (error: unknown) {
    window.pluginLog('Initialization error', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px;">
          <h2 style="margin: 0 0 16px; font-size: 16px; color: #ff3333;">Error</h2>
          <div class="debug">
            ${error instanceof Error ? error.message : String(error)}
          </div>
        </div>
      `;
    }
  }
}

// Wait for DOM content to be loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
} 