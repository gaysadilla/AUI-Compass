# AUI Compass - Component Migration Plugin

## Current Status

**Last Updated**: June 6, 2025
**Current Phase**: Component Registry Implementation
**Next Task**: Integrate registry service with component detection

## Project Overview

Internal Figma plugin for migrating deprecated AUI design system components to newer versions. The plugin helps designers find deprecated components and provides automated migration with property mapping.

## Architecture Overview

### Current Implementation Status

### ✅ Completed

- [x]  Basic plugin setup with React/TypeScript/Webpack
- [x]  Figma REST API service with authentication
- [x]  Plugin initialization and message passing
- [x]  Basic UI framework
- [x]  Environment configuration (.env + config.ts)
- [x]  Utility scripts for API testing
- [x]  Troubleshooting documentation
- [x]  Component registry service implementation
- [x]  Registry data structure and types
- [x]  **Button-to-Action Mapping Config implemented in TypeScript**

### 🚧 In Progress

- [ ]  Registry service integration with component detection
- [ ]  UI to display found components
- [ ]  Component mapping validation system

### 📋 TODO

- [ ]  Migration preview functionality
- [ ]  Property mapping system
- [ ]  Migration execution
- [ ]  Undo functionality
- [ ]  Bulk operations

## Technical Architecture

### Data Flow

```
REST API (scripts) → Component Registry → Plugin → UI
                     ↓
              Figma File Analysis → Found Instances → Migration
```

### Key Components

1. **Figma API Service** (`src/services/figmaApi.ts`)
    - Handles all REST API calls
    - Methods: getTeamComponents, getComponentSets, getFileDetails
    - Uses PAT for authentication

2. **Registry Service** (`src/services/registryService.ts`)
    - Manages component metadata and mappings
    - Handles registry persistence
    - Provides methods for component and mapping management
    - Tracks validation status of mappings

3. **Plugin Core** (`src/code.ts`)
    - Runs in Figma environment
    - Handles UI communication
    - Will implement component search

4. **UI Layer** (`src/ui.tsx` + components)
    - React-based interface
    - Currently shows initialization state
    - Ready for component list implementation

## Critical Context for Cursor/LLMs

### Always Remember

1. **Build Command**: Run `npm run build` after EVERY code change
2. **Two Environments**:
    - `code.ts` runs in Figma (no DOM, no fetch)
    - `ui.tsx` runs in iframe (no Figma API access)
3. **Message Passing**: Only way to communicate between environments
4. **API Limitations**:
    - Cannot browse library dynamically
    - Must know component keys in advance
    - Need REST API to get component data

### Environment Setup

```bash
# .env file (gitignored)
FIGMA_PAT=your_personal_access_token

# src/config.ts (gitignored)
export const FIGMA_PAT = process.env.FIGMA_PAT || '';
```

### Current Message Types

```typescript
// From UI to Plugin
READY = 'ready'
SEARCH = 'search'
CANCEL = 'cancel'

// From Plugin to UI
INIT = 'init'
SEARCH_COMPLETE = 'search-complete'
ERROR = 'error'
```

## Code Patterns to Follow

### Message Passing Pattern

```typescript
// UI to Plugin (in React component)
parent.postMessage({
  pluginMessage: {
    type: MESSAGE_TYPES.SEARCH,
    data: { scope: 'page' }
  }
}, '*');

// Plugin to UI (in code.ts)
figma.ui.postMessage({
  type: MESSAGE_TYPES.SEARCH_COMPLETE,
  data: { components: [...] }
});
```

### Component Discovery Pattern (To Implement)

```typescript
// In code.ts
import { RegistryService } from './services/registryService';

const registry = new RegistryService();
await registry.initialize();

async function findDeprecatedComponents(scope: SearchScope) {
  const instances: InstanceNode[] = [];
  const deprecatedComponents = await registry.getDeprecatedComponents();
  
  // Get nodes based on scope
  let nodesToSearch: SceneNode[] = [];
  switch (scope) {
    case 'selection':
      nodesToSearch = figma.currentPage.selection;
      break;
    case 'page':
      nodesToSearch = figma.currentPage.children;
      break;
    case 'file':
      // Requires loading all pages
      for (const page of figma.root.children) {
        await page.loadAsync();
        nodesToSearch.push(...page.children);
      }
      break;
  }

  // Find instances of deprecated components
  function traverse(node: SceneNode) {
    if (node.type === 'INSTANCE' && node.mainComponent) {
      const componentKey = node.mainComponent.key;
      const isDeprecated = deprecatedComponents.some(c => c.id === componentKey);
      if (isDeprecated) {
        instances.push(node);
      }
    }
    if ('children' in node) {
      node.children.forEach(traverse);
    }
  }

  nodesToSearch.forEach(traverse);
  return instances;
}
```

### Error Handling Pattern

```typescript
try {
  const result = await someOperation();
  figma.ui.postMessage({
    type: MESSAGE_TYPES.SUCCESS,
    data: result
  });
} catch (error) {
  console.error('Operation failed:', error);
  figma.ui.postMessage({
    type: MESSAGE_TYPES.ERROR,
    data: {
      message: error instanceof Error ? error.message : 'Unknown error',
      context: 'someOperation'
    }
  });
}
```

## Development Commands

```bash
# Build plugin
npm run build

# Watch mode (auto-rebuild)
npm run watch

# Type checking
npm run type-check

# Test REST API scripts
npm run get-team-id
npm run get-library-files
npm run get-component-details

# Run tests
npm test
```

## Next Implementation Steps

### 1. Integrate Registry Service

```typescript
// In code.ts
import { RegistryService } from './services/registryService';

const registry = new RegistryService();
await registry.initialize();

// Use in component detection
async function findDeprecatedComponents(scope: SearchScope) {
  const instances: InstanceNode[] = [];
  const deprecatedComponents = await registry.getDeprecatedComponents();
  
  // Get nodes based on scope
  let nodesToSearch: SceneNode[] = [];
  switch (scope) {
    case 'selection':
      nodesToSearch = figma.currentPage.selection;
      break;
    case 'page':
      nodesToSearch = figma.currentPage.children;
      break;
    case 'file':
      // Requires loading all pages
      for (const page of figma.root.children) {
        await page.loadAsync();
        nodesToSearch.push(...page.children);
      }
      break;
  }

  // Find instances of deprecated components
  function traverse(node: SceneNode) {
    if (node.type === 'INSTANCE' && node.mainComponent) {
      const componentKey = node.mainComponent.key;
      const isDeprecated = deprecatedComponents.some(c => c.id === componentKey);
      if (isDeprecated) {
        instances.push(node);
      }
    }
    if ('children' in node) {
      node.children.forEach(traverse);
    }
  }

  nodesToSearch.forEach(traverse);
  return instances;
}
```

### 2. Implement Mapping Validation

```typescript
// In registryService.ts
async function validateMapping(mapping: ComponentMapping): Promise<boolean> {
  // Implement validation logic
  // Check property compatibility
  // Verify component structure
  return true;
}
```

### 3. Update UI to Show Results

```typescript
// New component: ComponentList.tsx
interface ComponentListProps {
  components: DeprecatedComponent[];
  onSelect: (component: DeprecatedComponent) => void;
}
```

## Testing Approach

### Manual Testing Checklist

- [ ]  Plugin loads without errors
- [ ]  REST API scripts work (`npm run get-team-id`)
- [ ]  UI initializes and shows ready state
- [ ]  Search button triggers message to plugin
- [ ]  Error messages display properly

### For Component Detection Testing

1. Create a test component in Figma
2. Name it with "deprecated" or "(old)"
3. Create instances on a page
4. Run search to verify detection

## Known Issues & Solutions

### Issue: Plugin doesn't update

**Solution**: Always run `npm run build` and reload plugin

### Issue: "Cannot find FIGMA_PAT"

**Solution**: Ensure .env exists and config.ts imports it

### Issue: UI shows but never becomes ready

**Solution**: Check console for errors, verify message passing

## File Structure Reference

```
src/
├── code.ts              # Figma environment code
├── ui.tsx              # React entry point
├── config.ts           # Environment config (gitignored)
├── components/         # React components
│   └── App.tsx        # Main app component
├── services/          # API and services
│   └── figmaApi.ts    # REST API client
├── scripts/           # Utility scripts for testing
├── types/             # TypeScript definitions
└── utils/             # Constants and helpers
```

## Security Notes

- PAT is stored in .env (never commit)
- config.ts imports env vars (gitignored)
- All API calls use authentication headers
- No sensitive data in console logs

## For New Features

When adding new features:

1. Update message types in `types/index.ts`
2. Add handler in `code.ts`
3. Update UI components
4. Document pattern here
5. Run build and test

## Mapping Configuration (Button → Action)

A comprehensive mapping configuration for migrating deprecated Button components to the new Action component is now implemented in TypeScript.

- **Location:** `tools/component-discovery/mapping-config/button-to-action-mapping.ts`
- **Purpose:** Provides type-safe, automated mapping of all Button properties and variants to their Action equivalents, including:
  - Variant, Size, State, Icon, Color, Label, and Icon Instance
  - Handles all 432 possible Button configurations
  - Warns for unmapped color values (theming)
  - Includes test cases for validation
- **Integration:** Ready to be imported into migration scripts or Figma plugin code for automated property mapping and migration.

See the mapping config file for details and usage examples.

---

*This README is the source of truth for maintaining context across Cursor development sessions. Update after each major change.* 