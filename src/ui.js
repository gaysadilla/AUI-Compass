"use strict";
/// <reference types="react" />
/// <reference types="react-dom" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./components/App"));
require("./styles.css");
const constants_1 = require("./utils/constants");
// Initialize UI when the DOM is ready
function initializeUI() {
    try {
        window.pluginLog('React script loaded', { version: react_1.default.version });
        const container = document.getElementById('root');
        if (!container) {
            throw new Error('Root element not found');
        }
        window.pluginLog('Creating React root');
        const root = (0, client_1.createRoot)(container);
        // Remove loading content
        container.innerHTML = '';
        window.pluginLog('Rendering App');
        root.render(react_1.default.createElement(react_1.default.StrictMode, null,
            react_1.default.createElement(App_1.default, null)));
        // Notify plugin that UI is ready
        window.pluginLog('Sending READY message');
        parent.postMessage({ pluginMessage: { type: constants_1.MESSAGE_TYPES.READY } }, '*');
    }
    catch (error) {
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
}
else {
    initializeUI();
}
