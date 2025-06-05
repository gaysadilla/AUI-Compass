# Figma Plugin Troubleshooting Guide

## Common Initialization Issues

### Symptom: Plugin Shows Loading State But Never Initializes
If you see messages like:
```
Loading Plugin...
Page starting to load...
DOM content loaded
Window fully loaded
Script error: ui.js
```

This usually indicates a script loading or initialization timing issue.

### Root Causes & Solutions

#### 1. Script Loading Order
**Problem**: Scripts trying to access DOM elements before they're available.

**Solution**:
```typescript
// Wait for DOM content to be loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}
```

#### 2. Webpack Configuration
**Problem**: Scripts not properly inlined or loaded in the wrong order.

**Solution**:
```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HTMLInlineScriptPlugin = require('html-inline-script-webpack-plugin');

module.exports = {
  // ... other config
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
      inject: 'body'
    }),
    new HTMLInlineScriptPlugin()
  ]
};
```

#### 3. Proper Logging Setup
**Problem**: Difficult to debug initialization issues.

**Solution**:
```html
<!-- Place in <head> of ui.html -->
<script>
  window.pluginLog = function(msg, data) {
    const log = msg + (data ? ': ' + JSON.stringify(data) : '');
    console.log(log);
    const debugEl = document.getElementById('debug');
    if (debugEl) {
      debugEl.textContent += log + '\n';
    }
  };

  // Global error handler
  window.onerror = function(msg, url, line, col, error) {
    window.pluginLog('Error:', { msg, url, line, col });
    return false;
  };

  // Add lifecycle logging
  window.pluginLog('Page starting to load...');
  document.addEventListener('DOMContentLoaded', () => {
    window.pluginLog('DOM content loaded');
  });
  window.addEventListener('load', () => {
    window.pluginLog('Window fully loaded');
  });
</script>
```

#### 4. React Initialization Pattern
**Problem**: React trying to render before DOM is ready.

**Solution**:
```typescript
function initializeUI() {
  try {
    window.pluginLog('React script loaded', { version: React.version });
    
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    window.pluginLog('Creating React root');
    const root = createRoot(container);

    window.pluginLog('Rendering App');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    window.pluginLog('Sending READY message');
    parent.postMessage({ pluginMessage: { type: MESSAGE_TYPES.READY } }, '*');
  } catch (error) {
    window.pluginLog('Initialization error', error);
    // Handle error appropriately
  }
}
```

### Expected Initialization Flow
When working correctly, you should see logs in this order:
1. "Page starting to load..."
2. "DOM content loaded"
3. "Window fully loaded"
4. "React script loaded"
5. "Creating React root"
6. "Rendering App"
7. "Sending READY message"

If logs appear in a different order or are missing, it indicates an initialization issue.

### Dependencies
Make sure you have these dependencies in your `package.json`:
```json
{
  "devDependencies": {
    "html-webpack-plugin": "^5.x.x",
    "html-inline-script-webpack-plugin": "^3.x.x"
  }
}
```

### Additional Tips
1. Always include error boundaries in your React components
2. Use comprehensive logging during development
3. Consider adding a timeout warning if initialization takes too long
4. Test plugin in both development and production modes
5. Check browser console for additional errors
6. Verify all required DOM elements exist before accessing them

### Common Error Messages
- "Root element not found": DOM not ready or element missing
- "Script error: ui.js": Script loading or parsing error
- "Cannot read property 'x' of undefined": Trying to access objects before initialization

Remember to remove or conditionally include detailed logging in production builds. 