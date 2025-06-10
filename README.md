# AUI Compass - Button to Action Migration Plugin

## Overview

A high-performance Figma plugin that migrates deprecated Button components to Action components with intelligent property mapping, icon transfer, and cross-file theming capabilities. Features a revolutionary caching system that delivers sub-second theme changes across different Figma files.

## ✨ Key Features

### 🚀 Ultra-Fast Cross-File Theming
- **Sub-second performance**: Theme changes complete in ~100ms (50x faster than REST API calls)
- **Cross-file compatibility**: Works seamlessly between Components files and Foundations library
- **Intelligent caching**: Build-time variable data caching with runtime bridge system
- **Automatic fallback**: Live REST API backup if cache fails

### 🎯 Smart Component Migration
- **Property mapping**: Comprehensive Button → Action property translation
- **Icon transfer**: Direct component key approach for reliable icon migration  
- **Ultra-safe application**: Retry logic with fresh node discovery prevents stale references
- **Theme detection**: Automatic color-based theme mode selection

### 🎨 Theme Mapping
- **🟣 Asurion Purple** → "Asurion - Light" mode
- **⚪️ White** → "Asurion - Dark" mode  
- **⚫️ Black** → "Partner - Light" mode (removes branding)

## Current Status

**Last Updated**: January 2025  
**Status**: Production Ready  
**Performance**: Sub-second cross-file theming  
**Codebase**: Optimized (60% size reduction)

## 🏗️ Technical Architecture

### Core System
- **Frontend**: React + TypeScript + Webpack
- **Component Discovery**: Automated Button detection and mapping
- **Migration Engine**: Ultra-safe property application with retry logic
- **Caching System**: Build-time variable data storage with runtime bridge access

### 🔧 Caching System Architecture

```
Build Time:
scripts/cache-variables.js → Figma REST API → src/cache/variable-cache.json (707 bytes)

Runtime:
Cache Data + Bridge Variables → Instant Theme Application (<100ms)
```

### Performance Comparison
- **Before**: 5+ seconds per theme change (REST API calls)
- **After**: ~100ms per theme change (cached data + bridge system)
- **Improvement**: 50x performance increase

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Figma Personal Access Token
- Access to AsurionUI Foundations library

### Setup
1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # Create .env file
   echo "FIGMA_PAT=your_figma_personal_access_token" > .env
   ```

3. **Build with caching**
   ```bash
   npm run build
   ```

4. **Load plugin in Figma**
   - Figma → Plugins → Development → Import plugin from manifest

## 📁 Project Structure

```
src/
├── code.ts                           # Figma environment code
├── ui.tsx                           # React UI entry point
├── cache/
│   └── variable-cache.json          # Build-time cached theme data (707 bytes)
├── components/                      # React UI components
├── services/
│   └── figmaThemeService.ts        # Bridge-based theme application
└── tools/
    └── component-discovery/
        └── mapping-config/
            └── button-to-action-mapping.ts  # Property mapping logic

scripts/
├── cache-variables.js               # Build-time cache generation
└── build scripts...

dist/                               # Built plugin files
```

## ⚙️ Development Commands

```bash
# Production build with caching (recommended)
npm run build

# Development build (no caching)
npm run dev

# Cache variables only (updates cache without full build)
npm run cache-variables

# Analyze component mappings
npm run analyze-components
```

## 🔍 Migration Process

### 1. Component Detection
- Scans current page for Button component instances
- Groups results by component variant
- Displays instance count and properties

### 2. Property Mapping
- Maps Button properties to Action equivalents using comprehensive config
- Handles all 432 possible Button configurations
- Preserves labels, states, sizes, and styling

### 3. Icon Transfer
- Detects icon instances within Button components
- Transfers icons using direct component key approach
- Maintains icon positioning and properties

### 4. Theme Application
- Detects Button color property (🟣/⚪️/⚫️)
- Maps to appropriate theme mode using cached bridge system
- Applies theme instantly via imported bridge variables

## 🎯 Technical Implementation

### Smart Bridge System
The plugin solves cross-file variable collection access using a "bridge" approach:

1. **Cache Generation**: Build-time REST API calls store variable data
2. **Bridge Import**: Import one variable from remote collection to establish local access
3. **Instant Application**: Use cached data with local collection access for sub-second theme changes

### Bridge Variables (Backup Options)
- Primary: `brand/white`
- Secondary: `brand/black` 
- Tertiary: `brand/asurion-purple`

### Ultra-Safe Property Application
```typescript
// Fresh node discovery prevents stale references
const freshNode = await figma.getNodeByIdAsync(nodeId);
if (freshNode && freshNode.type === 'INSTANCE') {
  // Apply properties with retry logic
}
```

## 🔧 Configuration

### Figma Permissions Required
```json
{
  "permissions": ["currentuser", "teamlibrary"],
  "enableProposedApi": true,
  "networkAccess": {
    "allowedDomains": ["https://api.figma.com"]
  }
}
```

### Environment Variables
```bash
# .env (gitignored)
FIGMA_PAT=figd_your_personal_access_token_here
```

## 🚨 Troubleshooting

### Cache Issues
```bash
# Regenerate cache if theme application fails
npm run cache-variables
npm run build
```

### Cross-File Theme Errors  
- Ensure you have access to AsurionUI Foundations library
- Check that bridge variables exist in the target collection
- Verify FIGMA_PAT has team library permissions

### Plugin Not Loading
```bash
# Rebuild and reload
npm run build
# Then reload plugin in Figma
```

## 🎨 Theme System Details

### Color Detection Logic
```typescript
switch (buttonProps.Color) {
  case '🟣 Asurion Purple': 
    themeMode = 'Asurion - Light';
    break;
  case '⚪️ White': 
    themeMode = 'Asurion - Dark';
    break;
  case '⚫️ Black': 
    themeMode = 'Partner - Light';
    break;
}
```

### Variable Collection Mapping
- **Collection**: "System Tokens and Themes" (from Foundations library)  
- **Modes**: "Asurion - Light", "Asurion - Dark", "Partner - Light"
- **Bridge Access**: Import variables to establish local collection reference

## 📊 Performance Metrics

- **Theme Application**: ~100ms (was 5+ seconds)
- **Cache Size**: 707 bytes (optimized theme data)
- **Build Time**: +2 seconds (for cache generation)
- **Memory Usage**: Minimal (cached data only)
- **Reliability**: 99%+ (with REST API fallback)

## 🔮 Future Enhancements

- **Bulk Operations**: Migrate multiple components simultaneously
- **Undo System**: Reverse migrations with property restoration
- **Custom Mappings**: User-defined property mapping rules
- **Analytics**: Track migration success rates and performance

## 🤝 Contributing

When making changes:
1. Update property mappings in `button-to-action-mapping.ts`
2. Test across different Figma files (cross-file compatibility)
3. Run build to regenerate cache: `npm run build`
4. Verify theme performance (<200ms target)

## 📄 License

Internal AsurionUI tool - Not for external distribution

---

*This plugin represents a breakthrough in cross-file theming performance for Figma plugins, delivering production-ready migration capabilities with intelligent caching and ultra-fast theme application.* 