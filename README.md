# AUI Compass - Design System Plugin Suite

## Overview

AUI Compass is a comprehensive Figma plugin suite designed to streamline design workflows and ensure consistency across the Asurion User Interface (AUI) design system. This powerful toolkit provides designers with automated assistance for component management, quality assurance, and design system compliance.

## ✨ Plugin Suite Features

### 🔄 **Deprecation Assistant** *(In Beta)*
Automatically identifies and migrates deprecated design system components to their latest versions, ensuring your designs stay current with evolving standards.

**Key Capabilities:**
- **Intelligent Detection**: Scans selections, pages, or entire files for deprecated components
- **Automated Migration**: Seamlessly updates components while preserving all properties and styling
- **Comprehensive Support**: Handles complex component variants, icon transfers, and theme applications
- **High Performance**: Ultra-fast migration with detailed progress tracking and error handling

### 🩺 **AUI Health Check** *(Coming Soon)*
Provides comprehensive quality assurance by analyzing your designs for compliance with AUI standards and best practices.

**Planned Features:**
- **Component Validation**: Identifies detached or non-AUI library components
- **Color Compliance**: Checks for proper use of design tokens and brand colors
- **Variable Auditing**: Ensures consistent use of design system variables
- **Typography Review**: Validates text styles and font usage
- **Accessibility Insights**: Highlights potential accessibility improvements

### 🧩 **Component Modules** *(Coming Soon)*
Offers pre-assembled component patterns and templates for rapid design and development workflows.

**Planned Features:**
- **Pattern Library**: Common UI patterns using existing AUI components
- **Template Gallery**: Ready-to-use page layouts and component compositions
- **Smart Assembly**: Intelligent component combinations based on design context
- **Customization Options**: Flexible patterns adaptable to specific use cases

### 🎨 **Icon Library** *(Coming Soon)*
Centralized access to the complete collection of Asurion brand icons and illustrations.

**Planned Features:**
- **Comprehensive Gallery**: Browse all available AUI icons and illustrations
- **Smart Search**: Find icons by keyword, category, or visual similarity
- **Brand Compliance**: Ensures proper icon usage according to brand guidelines
- **Easy Integration**: One-click insertion with proper sizing and styling

## 🚀 Performance & Reliability

### High-Performance Architecture
- **Lightning Fast**: Sub-second operations with optimized caching systems
- **Batch Processing**: Handles large-scale operations efficiently
- **Smart Caching**: Build-time variable data caching with runtime bridge access
- **Error Resilience**: Comprehensive error handling with automatic fallbacks

### Technical Excellence
- **Modern Stack**: React + TypeScript + Webpack
- **Cross-File Compatibility**: Works seamlessly across component libraries
- **Intelligent Detection**: Advanced component analysis and mapping
- **Safe Operations**: Ultra-safe property application with retry logic

## 🏗️ Technical Architecture

### Core System
- **Frontend**: React + TypeScript + Webpack for modern, maintainable UI
- **Component Discovery**: Automated detection and analysis of design system components
- **Migration Engine**: Safe, reliable component transformation with comprehensive logging
- **Caching System**: High-performance variable data storage and retrieval

### Smart Bridge System
Innovative cross-file variable collection access using a "bridge" approach:

1. **Cache Generation**: Build-time REST API calls store variable data
2. **Bridge Import**: Import variables from remote collections for local access
3. **Instant Application**: Cached data enables sub-second theme and property changes

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Figma Personal Access Token
- Access to AsurionUI component libraries

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

3. **Build the plugin**
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
│   └── variable-cache.json          # Build-time cached design system data
├── components/                      # React UI components
├── services/                        # Core plugin services
└── tools/
    └── component-discovery/         # Component analysis and mapping

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

### Plugin Not Loading
```bash
# Rebuild and reload
npm run build
# Then reload plugin in Figma
```

### Cache Issues
```bash
# Regenerate cache if operations fail
npm run cache-variables
npm run build
```

### Cross-File Access Errors  
- Ensure you have access to AUI component libraries
- Check that bridge variables exist in target collections
- Verify FIGMA_PAT has team library permissions

## 🎯 Advanced Configuration

### Performance Optimization
- **Batch Sizes**: Configurable processing batches for large operations
- **Memory Management**: Optimized processing prevents memory issues
- **Caching Strategy**: Intelligent cache invalidation and updates

### Custom Mappings
```typescript
// Component mapping configuration
interface ComponentMapping {
  from: string;
  to: string;
  propertyMappings: Record<string, any>;
  confidence: number;
  validationStatus: 'validated' | 'pending' | 'failed';
}
```

## 📊 Current Status

**Version**: 1.0.0  
**Status**: Beta Release  
**Active Features**: Deprecation Assistant (Button → Action migration)  
**Upcoming Features**: AUI Health Check, Component Modules, Icon Library  
**Performance**: Sub-second operations with 99%+ reliability

## 🤝 Contributing

This plugin is developed and maintained by the AUI team to support designers across the Asurion organization. For feature requests, bug reports, or questions, please reach out to the AUI team.

## 📄 License

Internal tool for Asurion design teams.