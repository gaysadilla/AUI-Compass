/// <reference types="@figma/plugin-typings" />

// This file runs in the Figma environment
import { UI_WIDTH, UI_HEIGHT, MESSAGE_TYPES } from './utils/constants';
import { UIMessage } from './types';
import { registryData } from './data/registryData';
import { DeprecatedComponent, ComponentInstance, SearchScope } from './types';
import { mapButtonToAction, ButtonProperties } from '../tools/component-discovery/mapping-config/button-to-action-mapping';
import { getSpecificComponentKeys } from './scripts/getSpecificComponentKeys';
import { analyzeAndCreateMapping } from './scripts/analyzeComponentStructure';

console.log('AUI Compass: BACKEND LOADED');

/**
 * Apply theme mode using Figma REST API to access variables across files
 */
async function applyThemeModeViaAPI(instance: InstanceNode, themeMode: string, warnings: string[]): Promise<void> {
  console.log(`🎨 Starting REST API theme application for: ${themeMode}`);
  
  try {
    // Method 1: Try to find local collections first (fastest)
    const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const localThemeCollection = localCollections.find(collection => 
      collection.name === 'System Tokens and Themes' ||
      collection.modes.some(mode => 
        ['Asurion - Light', 'Asurion - Dark', 'Partner - Light', 'Partner - Dark'].includes(mode.name)
      )
    );
    
    if (localThemeCollection) {
      console.log(`✅ Found local theme collection: "${localThemeCollection.name}"`);
      const targetMode = localThemeCollection.modes.find(mode => mode.name === themeMode);
      if (targetMode) {
        instance.setExplicitVariableModeForCollection(localThemeCollection, targetMode.modeId);
        console.log(`✅ Applied theme locally: "${themeMode}" (${targetMode.modeId})`);
        warnings.push(`Theme applied: ${themeMode}`);
        return;
      }
    }
    
    // Method 2: Use cached variable data (fast!) with bridge import
    console.log(`🔍 No local theme collection found, using cached data...`);
    
    try {
      // Import cached variable data
      const variableCache = require('./cache/variable-cache.json');
      console.log(`⚡ Using cached data from: ${variableCache.lastUpdated}`);
      
      // Find the target mode in cached data
      const targetMode = Object.values(variableCache.themeCollection.modes || {}).find((mode: any) => 
        mode.name === themeMode
      ) as any;
      
      if (!targetMode) {
        const availableModes = Object.values(variableCache.themeCollection.modes || {}).map((mode: any) => mode.name);
        throw new Error(`Theme mode "${themeMode}" not found. Available: ${availableModes.join(', ')}`);
      }
      
      // Smart Bridge: Import one variable to establish collection access, then apply theme
      console.log(`🌉 Creating bridge using cached variable data...`);
      
      if (variableCache.bridgeVariables.length === 0) {
        throw new Error('No bridge variables available in cache');
      }
      
      // Try bridge variables until one works
      let bridgeSuccess = false;
      for (const bridgeVariable of variableCache.bridgeVariables) {
        try {
          console.log(`🌉 Attempting bridge with variable: "${bridgeVariable.name}"`);
          const importedVariable = await figma.variables.importVariableByKeyAsync(bridgeVariable.key);
          console.log(`✅ Bridge established via variable: ${bridgeVariable.name}`);
          
          // Now we can access the collection locally
          const localCollection = await figma.variables.getVariableCollectionByIdAsync(importedVariable.variableCollectionId);
          
          if (!localCollection) {
            throw new Error(`Could not access collection after bridge import`);
          }
          
          console.log(`🎯 Collection accessible via bridge: "${localCollection.name}"`);
          
          // Apply the theme mode
          const localMode = localCollection.modes.find(mode => mode.name === themeMode);
          if (localMode) {
            instance.setExplicitVariableModeForCollection(localCollection, localMode.modeId);
            console.log(`⚡ Applied theme via cached bridge: "${themeMode}" (${localMode.modeId})`);
            warnings.push(`Theme applied: ${themeMode}`);
            bridgeSuccess = true;
            break;
          } else {
            const availableModes = localCollection.modes.map(mode => mode.name);
            throw new Error(`Mode "${themeMode}" not found. Available: ${availableModes.join(', ')}`);
          }
          
        } catch (bridgeError) {
          console.log(`⚠️ Bridge attempt failed with "${bridgeVariable.name}": ${bridgeError instanceof Error ? bridgeError.message : String(bridgeError)}`);
          // Continue to next bridge variable
        }
      }
      
      if (!bridgeSuccess) {
        throw new Error('All bridge variables failed - cache may be stale');
      }
      
    } catch (cacheError) {
      console.error(`❌ Cached approach failed:`, cacheError);
      console.log(`🔄 Falling back to live REST API call...`);
      
      // Fallback to original REST API approach
      const figmaPAT = process.env.FIGMA_PAT;
      if (!figmaPAT) {
        throw new Error('FIGMA_PAT environment variable not found and cache failed.');
      }
      
      const foundationsFileKey = '6U6RqnBEYnBL5oRovZY4Gt';
      console.log(`📡 Making fallback API call to: ${foundationsFileKey}`); 
      
      const response = await fetch(`https://api.figma.com/v1/files/${foundationsFileKey}/variables/local`, {
        method: 'GET',
        headers: {
          'X-Figma-Token': figmaPAT
        }
      });
      
      if (!response.ok) {
        throw new Error(`REST API fallback failed: ${response.status} ${response.statusText}`);
      }
      
      const variableData = await response.json();
      console.log(`📊 Fallback API response received`);
      
      // Find theme collection in API response
      const apiThemeCollection = Object.values(variableData.meta.variableCollections || {}).find((collection: any) => 
        collection.name === 'System Tokens and Themes' ||
        Object.values(collection.modes || {}).some((mode: any) => 
          ['Asurion - Light', 'Asurion - Dark', 'Partner - Light', 'Partner - Dark'].includes(mode.name)
        )
      ) as any;
      
      if (!apiThemeCollection) {
        throw new Error('No theme collection found in REST API response');
      }
      
      // Bridge with live API data
      const collectionVariables = Object.values(variableData.meta.variables || {}).filter((variable: any) => 
        variable.variableCollectionId === apiThemeCollection.id
      );
      
      if (collectionVariables.length === 0) {
        throw new Error('No variables found in theme collection');
      }
      
      const bridgeVariable = collectionVariables[0] as any;
      const importedVariable = await figma.variables.importVariableByKeyAsync(bridgeVariable.key);
      const localCollection = await figma.variables.getVariableCollectionByIdAsync(importedVariable.variableCollectionId);
      
      if (!localCollection) {
        throw new Error(`Could not access collection after fallback bridge import`);
      }
      
      const localMode = localCollection.modes.find(mode => mode.name === themeMode);
      if (localMode) {
        instance.setExplicitVariableModeForCollection(localCollection, localMode.modeId);
        console.log(`✅ Applied theme via fallback API: "${themeMode}" (${localMode.modeId})`);
        warnings.push(`Theme applied via fallback: ${themeMode}`);
      } else {
        const availableModes = localCollection.modes.map(mode => mode.name);
        throw new Error(`Mode "${themeMode}" not found. Available: ${availableModes.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ REST API theme application failed:', error);
    
    // Fallback: Try team library approach as backup
    console.log('🔄 Falling back to team library approach...');
    try {
      const libraryCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      
      for (const libraryCollection of libraryCollections) {
        if (libraryCollection.name === 'System Tokens and Themes') {
          const variables = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libraryCollection.key);
          
          if (variables.length > 0) {
            const importedVariable = await figma.variables.importVariableByKeyAsync(variables[0].key);
            const collection = await figma.variables.getVariableCollectionByIdAsync(importedVariable.variableCollectionId);
            
            if (collection) {
              const targetMode = collection.modes.find(mode => mode.name === themeMode);
              if (targetMode) {
                instance.setExplicitVariableModeForCollection(collection, targetMode.modeId);
                console.log(`✅ Applied theme via fallback: "${themeMode}"`);
                warnings.push(`Theme applied via fallback: ${themeMode}`);
                return;
              }
            }
          }
        }
      }
      
      throw new Error('Fallback approach also failed');
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      warnings.push(`Theme application failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Show the UI
figma.showUI(__html__, {
  width: UI_WIDTH,
  height: UI_HEIGHT,
  title: 'AUI Compass',
  visible: true // Ensure UI is visible
});

console.log('UI window created');

// Helper function to get component set key from variant key
async function getComponentSetInfoFromInstance(instance: InstanceNode): Promise<{
  componentSetKey?: string;
  componentSetName?: string;
  variantKey: string;
  variantName: string;
} | null> {
  try {
    const mainComponent = await instance.getMainComponentAsync();
    if (!mainComponent) return null;

    const variantKey = mainComponent.key;
    const variantName = mainComponent.name;
    
    // Check if this component has a parent (component set)
    if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
      const componentSet = mainComponent.parent as ComponentSetNode;
      return {
        componentSetKey: componentSet.key,
        componentSetName: componentSet.name,
        variantKey,
        variantName
      };
    }
    
    // This is a standalone component (not part of a component set)
    return {
      variantKey,
      variantName
    };
  } catch (error) {
    console.warn('Failed to get component info for instance:', error);
    return null;
  }
}

// Helper function to check if a component/variant belongs to a deprecated component set
function isDeprecatedComponent(componentInfo: any, deprecatedComponents: any[]): any | null {
  // First check if the component set key matches
  if (componentInfo.componentSetKey) {
    const match = deprecatedComponents.find(c => c.key === componentInfo.componentSetKey);
    if (match) return match;
  }
  
  // Also check if the variant key itself is in our deprecated list (for legacy support)
  const directMatch = deprecatedComponents.find(c => c.key === componentInfo.variantKey);
  if (directMatch) return directMatch;
  
  // Check by name pattern for additional matching
  const nameMatch = deprecatedComponents.find(c => {
    const setName = componentInfo.componentSetName || componentInfo.variantName;
    return setName && (
      setName.includes(c.name) || 
      c.name.includes(setName) ||
      setName.toLowerCase().includes('button') && c.name.toLowerCase().includes('button')
    );
  });
  
  return nameMatch || null;
}

// Helper function to set properties on nested Action components using EXACT property names
async function setActionNestedProperties(
  actionInstance: InstanceNode, 
  actionProps: any,
  warnings: string[]
): Promise<void> {
  console.log('🎯 Setting nested Action component properties with EXACT names from analysis...');
  console.log('Properties to apply:', actionProps);
  
  try {
    // CRITICAL: Find nested instances FRESH after component swap (old references are stale)
    const childInstances = actionInstance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
    console.log(`Found ${childInstances.length} FRESH child instances after swap`);
    
          for (const childInstance of childInstances) {
        console.log(`\n🔍 Processing nested instance (without main component check)...`);
        
        // Get available properties for this child component DIRECTLY (skip getMainComponentAsync which fails)
        const availableProps = childInstance.componentProperties || {};
        const availablePropNames = Object.keys(availableProps);
        console.log(`Available properties:`, availablePropNames);
        
        // Skip if no properties available
        if (availablePropNames.length === 0) {
          console.log(`⚠️ Skipping instance with no properties`);
          continue;
        }
        
        // Identify component type by available properties instead of name
        let componentType = 'unknown';
        if (availablePropNames.includes('Style') && availablePropNames.includes('State') && availablePropNames.includes('Size')) {
          componentType = 'style-component';
        } else if (availablePropNames.some(prop => prop.includes('Action Text') || prop.includes('Show') && prop.includes('icon'))) {
          componentType = 'content-component';
        }
        
        console.log(`🏷️ Identified as: ${componentType}`);
        
        // Debug: Show available values for variant properties
        for (const [propName, propDef] of Object.entries(availableProps)) {
          if (propDef.type === 'VARIANT') {
            console.log(`  🔍 ${propName} (VARIANT): current="${propDef.value}" type=${propDef.type}`);
            // Try to get preferred values if available
            if (propDef.preferredValues) {
              console.log(`    Available values:`, propDef.preferredValues);
            }
          }
        }
        
        const propsToSet: { [key: string]: any } = {};
        
        // ROUTE PROPERTIES TO CORRECT COMPONENTS based on component type
        if (componentType === 'style-component') {
          // This is the Style/State/Size component
          console.log(`📋 Routing Style/State/Size properties to style component`);
          
          // Only apply Style, State, Size properties to this component
          if (actionProps.Style && availablePropNames.includes('Style')) {
            propsToSet['Style'] = actionProps.Style;
            console.log(`✅ Routing Style = ${actionProps.Style}`);
          }
          if (actionProps.State && availablePropNames.includes('State')) {
            propsToSet['State'] = actionProps.State;
            console.log(`✅ Routing State = ${actionProps.State}`);
          }
          if (actionProps.Size && availablePropNames.includes('Size')) {
            propsToSet['Size'] = actionProps.Size;
            console.log(`✅ Routing Size = ${actionProps.Size}`);
          }
          
        } else if (componentType === 'content-component') {
          // This is the content component for text and icons
          console.log(`📝 Routing Text/Icon properties to content component`);
          
          // Only apply text and icon properties to this component
          for (const [targetProp, value] of Object.entries(actionProps)) {
            if (targetProp === '_variant' || targetProp === 'Style' || targetProp === 'State' || targetProp === 'Size') {
              continue; // Skip variant and style props (handled by other component)
            }
            
            if (availablePropNames.includes(targetProp) && value !== undefined && value !== null) {
              propsToSet[targetProp] = value;
              console.log(`✅ Routing ${targetProp} = ${value}`);
            } else {
              console.log(`❌ Missing property: ${targetProp} (value: ${value})`);
            }
          }
        } else {
          // For other components, try to apply any matching properties
          console.log(`🔧 Checking other component type: ${componentType}`);
          
          for (const [targetProp, value] of Object.entries(actionProps)) {
            if (targetProp === '_variant') continue; // Skip variant (handled by component swap)
            
            if (availablePropNames.includes(targetProp) && value !== undefined && value !== null) {
              propsToSet[targetProp] = value;
              console.log(`✅ Found exact match: ${targetProp} = ${value}`);
            }
          }
        }
      
      // Apply properties if we have any to set
      if (Object.keys(propsToSet).length > 0) {
        try {
          // Check if this component has variant properties (Style, State, Size)
          const hasVariantProps = ['Style', 'State', 'Size'].some(prop => propsToSet[prop] !== undefined);
          
          if (hasVariantProps) {
            console.log(`🔧 Setting variant properties individually on ${componentType} component...`);
            
            // Set variant properties one by one to avoid "variant combination not found" errors
            const variantProps = ['Style', 'State', 'Size'];
            for (const prop of variantProps) {
              if (propsToSet[prop] !== undefined) {
                try {
                  console.log(`  Setting ${prop} = ${propsToSet[prop]}`);
                  childInstance.setProperties({ [prop]: propsToSet[prop] });
                  console.log(`  ✅ Successfully set ${prop}`);
                } catch (propError) {
                  console.error(`  ❌ Failed to set ${prop}:`, propError);
                  warnings.push(`Could not set ${prop} on ${componentType} component: ${propError}`);
                }
              }
            }
            
            // Set non-variant properties
            const nonVariantProps = Object.fromEntries(
              Object.entries(propsToSet).filter(([key]) => !variantProps.includes(key))
            );
            
            if (Object.keys(nonVariantProps).length > 0) {
              console.log(`🔧 Setting content properties on ${componentType} component:`, nonVariantProps);
              childInstance.setProperties(nonVariantProps);
              console.log(`✅ Successfully set content properties`);
            }
            
          } else {
            // No variant properties, set all at once
            console.log(`🔧 Setting ${Object.keys(propsToSet).length} properties on ${componentType} component:`, propsToSet);
            childInstance.setProperties(propsToSet);
            console.log(`✅ Successfully set properties on ${componentType} component`);
          }
          
          // Verify the properties were actually set
          console.log('🔍 Verification:');
          for (const [key, expectedValue] of Object.entries(propsToSet)) {
            const actualProp = childInstance.componentProperties?.[key];
            if (actualProp) {
              const match = actualProp.value === expectedValue ? '✅' : '❌';
              console.log(`  ${match} ${key}: ${actualProp.type} = ${actualProp.value} (expected: ${expectedValue})`);
            } else {
              console.log(`  ❌ ${key}: property not found after setting`);
            }
          }
        } catch (setError) {
          console.error(`❌ Failed to set properties on ${componentType} component:`, setError);
          warnings.push(`Could not set properties on ${componentType} component: ${setError}`);
        }
      } else {
        console.log(`ℹ️ No matching properties to set on ${componentType} component`);
        console.log(`Available: [${availablePropNames.join(', ')}]`);
        console.log(`Requested: [${Object.keys(actionProps).filter(k => k !== '_variant').join(', ')}]`);
      }
    }
    
    console.log('✅ Finished setting nested Action component properties');
    
  } catch (error) {
    console.error('❌ Error setting nested Action properties:', error);
    warnings.push(`Error setting nested Action properties: ${error}`);
  }
}

// Performance monitoring utility
interface PerformanceMetrics {
  migrationId: string;
  migrationStart: number;
  componentAnalysis?: number;
  propertyApplicationStart?: number;
  propertyApplicationEnd?: number;
  themeApplicationStart?: number;
  themeApplicationEnd?: number;
  totalMigration?: number;
  memoryUsage: {
    before?: number;
    after?: number;
  };
  warnings: string[];
}

function logPerformanceMetrics(metrics: PerformanceMetrics) {
  const total = metrics.totalMigration || (performance.now() - metrics.migrationStart);
  console.log(`\n📊 PERFORMANCE REPORT - Instance: ${metrics.migrationId}`);
  console.log(`⏱️  Total Migration Time: ${Math.round(total)}ms`);
  
  if (metrics.componentAnalysis) {
    console.log(`📋 Component Analysis: ${Math.round(metrics.componentAnalysis)}ms`);
  }
  
  if (metrics.propertyApplicationStart && metrics.propertyApplicationEnd) {
    const propTime = metrics.propertyApplicationEnd - metrics.propertyApplicationStart;
    console.log(`🔧 Property Application: ${Math.round(propTime)}ms`);
  }
  
  if (metrics.themeApplicationStart && metrics.themeApplicationEnd) {
    const themeTime = metrics.themeApplicationEnd - metrics.themeApplicationStart;
    console.log(`🎨 Theme Application: ${Math.round(themeTime)}ms`);
  }
  
  if (metrics.memoryUsage.before && metrics.memoryUsage.after) {
    const memoryDelta = metrics.memoryUsage.after - metrics.memoryUsage.before;
    console.log(`💾 Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
  }
  
  if (metrics.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${metrics.warnings.length}`);
  }
  
  // Performance benchmarks
  if (total < 1000) console.log(`✅ EXCELLENT: Sub-second migration`);
  else if (total < 3000) console.log(`✅ GOOD: Fast migration`);
  else if (total < 10000) console.log(`⚠️  SLOW: Migration took ${(total/1000).toFixed(1)}s`);
  else console.log(`❌ VERY SLOW: Migration took ${(total/1000).toFixed(1)}s - investigate bottlenecks`);
  
  console.log(`📊 END PERFORMANCE REPORT\n`);
}

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
          // Load all pages first for file-wide search
          console.log('📄 Loading all pages for file-wide search...');
          await figma.loadAllPagesAsync();
          nodes = figma.root.findAll(isSceneNode) as SceneNode[];
        }
        console.log(`Found ${nodes.length} nodes to search`);
        
        // Get deprecated components from registry
        const deprecatedComponents = Object.values(registryData.components).filter(c => c.deprecated);
        console.log('Deprecated components from registry:', deprecatedComponents.map(c => ({
          name: c.name,
          key: c.key,
          type: c.type
        })));
        
        // Track found instances by component set
        const foundComponentSets = new Map<string, {
          registryComponent: any;
          instances: ComponentInstance[];
          componentSetName: string;
        }>();
        
        console.log('Starting instance detection...');
        
        // Find all instance nodes
        const instanceNodes = nodes.filter(node => node.type === 'INSTANCE') as InstanceNode[];
        console.log(`Found ${instanceNodes.length} instance nodes to check`);
        
        // Check each instance
        for (const instance of instanceNodes) {
          try {
            console.log(`\nChecking instance: ${instance.name} (${instance.id})`);
            
            const componentInfo = await getComponentSetInfoFromInstance(instance);
            if (!componentInfo) {
              console.log('Could not get component info for instance');
                continue;
              }
            
            console.log('Component info:', componentInfo);
            
            // Debug: Check if this matches our target Button key
            const buttonKey = '8f646f204ad28670137420637fad9fda7fff73d1';
            if (componentInfo.componentSetKey === buttonKey) {
              console.log('🎯 FOUND BUTTON INSTANCE!', instance.name);
            }
            
            // Check if this belongs to a deprecated component
            const deprecatedMatch = isDeprecatedComponent(componentInfo, deprecatedComponents);
            if (deprecatedMatch) {
              console.log('✅ Found deprecated component match:', deprecatedMatch.name);
              
              // Use component set key as the grouping key, fallback to variant key
              const groupingKey = componentInfo.componentSetKey || componentInfo.variantKey;
              const displayName = componentInfo.componentSetName || deprecatedMatch.displayName || deprecatedMatch.name;
              
              if (!foundComponentSets.has(groupingKey)) {
                foundComponentSets.set(groupingKey, {
                  registryComponent: deprecatedMatch,
                  instances: [],
                  componentSetName: displayName
                });
              }
              
              foundComponentSets.get(groupingKey)!.instances.push({
                nodeId: instance.id,
                pageName: instance.parent && 'name' in instance.parent ? (instance.parent as PageNode).name : figma.currentPage.name,
            });
          } else {
              console.log('❌ No deprecated match found for:', componentInfo.componentSetName || componentInfo.variantName);
            }
          } catch (error) {
            console.warn(`Failed to process instance ${instance.id}:`, error);
          }
        }
        
        // Convert map to results array
        const results: DeprecatedComponent[] = Array.from(foundComponentSets.entries()).map(([key, data]) => ({
          key: key,
          name: data.registryComponent.name,
          displayName: data.componentSetName,
          deprecatedDate: data.registryComponent.lastModified,
          instanceCount: data.instances.length,
          instances: data.instances,
        }));
        
        console.log('Search complete. Results:', results);
        figma.ui.postMessage({
          type: MESSAGE_TYPES.SEARCH_COMPLETE,
          data: { components: results },
        });
        break;

      case MESSAGE_TYPES.GET_COMPONENT_KEYS:
        try {
          const keys = await getSpecificComponentKeys();
          figma.ui.postMessage({ type: 'COMPONENT_KEYS_RESULT', data: keys });
        } catch (error) {
          console.error('Error getting component keys:', error);
          figma.ui.postMessage({ 
            type: 'ERROR', 
            data: `Error getting component keys: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
        break;

      case MESSAGE_TYPES.ANALYZE_COMPONENTS:
        try {
          await analyzeAndCreateMapping();
          figma.ui.postMessage({ type: 'ANALYSIS_COMPLETE', data: 'Check console for detailed component analysis' });
        } catch (error) {
          console.error('Analysis failed:', error);
          figma.ui.postMessage({ type: 'ERROR', data: `Analysis failed: ${error}` });
        }
        break;

      case MESSAGE_TYPES.MIGRATE:
        console.log('🚀 PERFORMANCE: Migration started for instance:', msg.data.instanceId);
        const migrationStartTime = performance.now();
        
        try {
          const { instanceId, targetComponentKey } = msg.data;
          console.log('Starting migration for instance:', instanceId);
          
          // Get the instance node
          const instance = await figma.getNodeByIdAsync(instanceId) as InstanceNode;
          if (!instance || instance.type !== 'INSTANCE') {
            throw new Error('Invalid instance node');
          }

          // Get component info
          const componentInfo = await getComponentSetInfoFromInstance(instance);
          if (!componentInfo) {
            throw new Error('Could not get component info for instance');
          }
          
          // Performance checkpoint 1: Component analysis
          const analysisTime = performance.now();
          console.log(`⏱️  PERF: Component analysis took ${Math.round(analysisTime - migrationStartTime)}ms`);

          // CAPTURE CURRENT PROPERTIES BEFORE MIGRATION
          console.log('Capturing current Button properties...');
          const currentVariantProps = instance.variantProperties || {};
          const currentComponentProps = instance.componentProperties || {};
          
          console.log('Current variant properties:', currentVariantProps);
          console.log('Current component properties:', currentComponentProps);

          // Extract Button properties for mapping
          console.log('🔍 Extracting Button properties...');
          console.log('Available variant properties:', Object.keys(currentVariantProps));
          console.log('Available component properties:', Object.keys(currentComponentProps));
          
          // Look for the actual text label property name
          let buttonText = '';
          for (const [key, value] of Object.entries(currentComponentProps)) {
            if (key.toLowerCase().includes('text') || key.toLowerCase().includes('label')) {
              buttonText = typeof value?.value === 'string' ? value.value : '';
              console.log(`Found text property '${key}':`, buttonText);
              console.log(`Text property value type:`, typeof value?.value);
              console.log(`Full property value:`, value);
              break;
            }
          }
          
          // Fallback to instance name if no text property found
          if (!buttonText) {
            buttonText = instance.name || '';
            console.log('Using instance name as fallback:', buttonText);
          }
          
          console.log(`🎯 Final extracted button text: "${buttonText}"`);
          console.log(`Button text length: ${buttonText.length}`);
          console.log(`Button text trimmed: "${buttonText.trim()}"`);
          console.log(`Button text is empty: ${!buttonText || buttonText.trim() === ''}`);
          
          // Debug: Show all component properties that might contain text
          console.log('🔍 All component properties for text debugging:');
          for (const [key, value] of Object.entries(currentComponentProps)) {
            console.log(`  "${key}": ${value?.type} = "${value?.value}"`);
          }

          // Extract icon instance value with proper property name detection
          let iconInstanceValue = null;
          for (const [key, value] of Object.entries(currentComponentProps)) {
            if (key.toLowerCase().includes('icon instance')) {
              iconInstanceValue = value?.value || null;
              console.log(`🔍 Found icon instance property: "${key}" = "${iconInstanceValue}"`);
              break;
            }
          }

          const buttonProps: ButtonProperties = {
            Variant: (currentVariantProps['Variant'] as ButtonProperties['Variant']) || 'Filled',
            Size: (currentVariantProps['Size'] as ButtonProperties['Size']) || 'Medium (Default)',
            State: (currentVariantProps['State'] as ButtonProperties['State']) || 'Default',
            Icon: (currentVariantProps['Icon'] as ButtonProperties['Icon']) || 'None',
            Color: (currentVariantProps['Color'] as ButtonProperties['Color']) || 'Asurion Purple',
            Label: buttonText,
            'Icon Instance': iconInstanceValue
          };

          console.log('Extracted Button properties:', buttonProps);

          // Map Button properties to Action properties
          const mappingResult = mapButtonToAction(buttonProps);
          console.log('Mapping result:', mappingResult);
          console.log('Expected Action properties:', {
            variant: mappingResult.actionProps._variant,
            style: mappingResult.actionProps.Style,
            state: mappingResult.actionProps.State,
            size: mappingResult.actionProps.Size,
            label: mappingResult.actionProps.Label,
            leftIcon: mappingResult.actionProps["Show 'Left icon'"],
            rightIcon: mappingResult.actionProps["Show 'Right icon'"]
          });

          if (mappingResult.warnings.length > 0) {
            console.warn('Mapping warnings:', mappingResult.warnings);
          }

          // Get the target component key (either from message data or registry fallback)
          const finalTargetComponentKey = targetComponentKey || registryData.components['action'].key;
          console.log('Target component key:', finalTargetComponentKey);

          // Import the component set
          const importedComponent = await figma.importComponentSetByKeyAsync(finalTargetComponentKey);
          if (!importedComponent) {
            throw new Error('Failed to import target component set from library');
          }

          console.log('Successfully imported component set:', {
            id: importedComponent.id,
            name: importedComponent.name,
            type: importedComponent.type
          });

          // Determine which Action variant to use based on Button icon configuration
          const targetVariantName = mappingResult.actionProps._variant; // "Text and Icons", "Icon Only", or "Text"
          console.log('Target Action variant needed:', targetVariantName);

          // Find the specific variant in the component set
          let targetVariant = importedComponent.defaultVariant;
          
          // Look for the specific variant that matches our mapping
          const allVariants = importedComponent.children as ComponentNode[];
          console.log('Available Action variants:', allVariants.map(v => v.name));
          
          for (const variant of allVariants) {
            const variantName = variant.name.toLowerCase();
            const targetName = targetVariantName.toLowerCase();
            
            if (
              (targetName.includes('icon only') && variantName.includes('icon only')) ||
              (targetName.includes('text and icons') && variantName.includes('text and icons')) ||
              (targetName === 'text' && variantName.includes('text') && !variantName.includes('icon'))
            ) {
              targetVariant = variant;
              console.log(`✅ Found matching variant: ${variant.name}`);
              break;
            }
          }

          console.log('Using Action variant:', targetVariant.name);

          // SYSTEMATIC APPROACH: Capture → Swap → Apply One-by-One
          console.log('📋 SYSTEMATIC MIGRATION: Capture → Swap → Apply');
          
          // STEP 1: Capture what we need to apply (already done in mappingResult)
          const propertiesToApply = {
            style: mappingResult.actionProps.Style,
            state: mappingResult.actionProps.State,
            size: mappingResult.actionProps.Size,
            text: mappingResult.actionProps['Action Text#12254:9'],
            leftIcon: mappingResult.actionProps["Show 'Left icon'#12254:10"],
            rightIcon: mappingResult.actionProps["Show 'Right icon'#12254:11"]
          };
          console.log('Properties to apply after swap:', propertiesToApply);
          
          // STEP 2: Swap to the correct Action variant
          instance.swapComponent(targetVariant);
          console.log('✅ Successfully swapped to Action variant');
          
          // STEP 3: IMMEDIATE RE-FIND SOLUTION - Apply properties right after swap
          console.log('🔧 STEP 3: Applying properties immediately after swap (stale reference fix)...');
          
          const allWarnings = [...mappingResult.warnings];
          
          // PROVEN SOLUTION: Re-find nested instances immediately after swap
          console.log('🎯 IMMEDIATE RE-FIND: Discovering fresh Action structure post-swap...');
          
          // IMMEDIATE APPLICATION: Apply properties in rapid succession to prevent stale references
          console.log('⚡ IMMEDIATE APPLICATION: Applying properties in rapid succession...');
          
          // ULTRA-SAFE APPROACH: Re-find and apply properties one by one to prevent stale references
          const applyPropertySafely = async (propName: string, propValue: any, maxRetries: number = 3): Promise<boolean> => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                console.log(`🔄 FRESH-FIND Attempt ${attempt} for property: ${propName} = ${propValue}`);
                
                // Re-find ALL nested instances fresh each time
                const currentNestedInstances = instance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
                console.log(`  Fresh search found ${currentNestedInstances.length} nested instances`);
                
                // Find the component that has this specific property
                for (const freshInstance of currentNestedInstances) {
                  try {
                    const availableProps = freshInstance.componentProperties || {};
                    const availablePropNames = Object.keys(availableProps);
                    
                    // Check if this instance has the property we want to set
                    if (availablePropNames.includes(propName)) {
                      console.log(`  ✅ Found property "${propName}" on component with properties: [${availablePropNames.join(', ')}]`);
                      
                      // Apply just this one property
                      freshInstance.setProperties({ [propName]: propValue });
                      console.log(`  ✅ Successfully set ${propName} = ${propValue}`);
                      
                      // Verify it was set
                      const verification = freshInstance.componentProperties || {};
                      const currentValue = verification[propName]?.value;
                      console.log(`  ✅ VERIFY: ${propName}: Set "${propValue}" → Current "${currentValue}"`);
                      
                      return true; // Success - property found and set
                    }
                                     } catch (instanceError) {
                     console.log(`  ⚠️ Error checking instance: ${instanceError instanceof Error ? instanceError.message : instanceError}`);
                     continue; // Try next instance
                   }
                }
                
                console.log(`  ❌ Property "${propName}" not found in any component on attempt ${attempt}`);
                
              } catch (globalError) {
                console.error(`  ❌ Global error on attempt ${attempt}:`, globalError);
                
                if (attempt < maxRetries) {
                  const delayMs = 50; // Minimal delay instead of progressive
                  console.log(`  🔄 Retrying in ${delayMs}ms...`);
                  await new Promise(resolve => setTimeout(resolve, delayMs));
                }
              }
            }
            
            console.log(`❌ Failed to set property "${propName}" after ${maxRetries} attempts`);
            allWarnings.push(`Failed to set property "${propName}"`);
            return false;
          };
          
          // Apply each property individually with fresh component discovery
          console.log('🔧 Applying properties one-by-one with fresh discovery...');
          
          // Apply variant properties first (Style, State, Size)
          if (propertiesToApply.style) {
            await applyPropertySafely('Style', propertiesToApply.style);
          }
          if (propertiesToApply.state) {
            await applyPropertySafely('State', propertiesToApply.state);
          }
          if (propertiesToApply.size) {
            await applyPropertySafely('Size', propertiesToApply.size);
          }
          
          // Apply text property (skip for Icon-Only variants)
          if (propertiesToApply.text && targetVariantName !== 'Icon Only') {
            // Try fuzzy matching for text properties
            const textApplied = await applyPropertySafely('Action Text#12254:9', propertiesToApply.text);
            if (!textApplied) {
              // Fallback: try to find any text property
              const allInstances = instance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
              for (const inst of allInstances) {
                const props = Object.keys(inst.componentProperties || {});
                const textProp = props.find(p => p.toLowerCase().includes('action text') || p.toLowerCase().includes('text'));
                if (textProp) {
                  console.log(`📝 Found fallback text property: ${textProp}`);
                  await applyPropertySafely(textProp, propertiesToApply.text);
                  break;
                }
              }
            }
          } else if (targetVariantName === 'Icon Only') {
            console.log(`🚫 Skipping text property for Icon-Only variant`);
          }
          
          // Apply icon show/hide properties (skip for Icon-Only variants)
          if (targetVariantName !== 'Icon Only') {
            if (propertiesToApply.leftIcon !== undefined) {
              const leftIconApplied = await applyPropertySafely("Show 'Left icon'#12254:10", propertiesToApply.leftIcon);
              if (!leftIconApplied) {
                // Fallback: try to find any left icon property
                const allInstances = instance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
                for (const inst of allInstances) {
                  const props = Object.keys(inst.componentProperties || {});
                  const leftIconProp = props.find(p => p.toLowerCase().includes('show') && p.toLowerCase().includes('left') && p.toLowerCase().includes('icon'));
                  if (leftIconProp) {
                    console.log(`🔍 Found fallback left icon property: ${leftIconProp}`);
                    await applyPropertySafely(leftIconProp, propertiesToApply.leftIcon);
                    break;
                  }
                }
              }
            }
            
            if (propertiesToApply.rightIcon !== undefined) {
              const rightIconApplied = await applyPropertySafely("Show 'Right icon'#12254:11", propertiesToApply.rightIcon);
              if (!rightIconApplied) {
                // Fallback: try to find any right icon property
                const allInstances = instance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
                for (const inst of allInstances) {
                  const props = Object.keys(inst.componentProperties || {});
                  const rightIconProp = props.find(p => p.toLowerCase().includes('show') && p.toLowerCase().includes('right') && p.toLowerCase().includes('icon'));
                  if (rightIconProp) {
                    console.log(`🔍 Found fallback right icon property: ${rightIconProp}`);
                    await applyPropertySafely(rightIconProp, propertiesToApply.rightIcon);
                    break;
                  }
                }
              }
            }
          } else {
            console.log(`🚫 Skipping icon show/hide properties for Icon-Only variant`);
          }
          
          // Immediate application approach completed above - no additional steps needed
          console.log('⚡ IMMEDIATE APPLICATION COMPLETE - All properties applied per component');
          
          // Old batched approach has been disabled - properties are now applied immediately after swap
          
          // Check properties after setting
          console.log('🔍 VERIFICATION: Properties after setting...');
          console.log('Final Action variant properties:', instance.variantProperties);
          console.log('Final Action component properties:', Object.keys(instance.componentProperties || {}));
          
          // Check nested components after setting
          const finalNestedInstances = instance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
          console.log(`Found ${finalNestedInstances.length} nested instances after property setting`);
          
          for (const nestedInstance of finalNestedInstances) {
            try {
              const nestedMainComponent = await nestedInstance.getMainComponentAsync();
              if (nestedMainComponent) {
                const nestedProps = nestedInstance.componentProperties || {};
                console.log(`📦 Final nested component: ${nestedMainComponent.name}`);
                console.log(`  Properties:`, Object.keys(nestedProps));
                for (const [key, prop] of Object.entries(nestedProps)) {
                  console.log(`    ${key}: ${prop.type} = ${prop.value}`);
                }
              }
            } catch (error) {
              console.log(`⚠️ Could not check nested component: ${error}`);
            }
          }
          
          // Handle icon instance swapping if needed
          if (mappingResult.iconMapping && buttonProps['Icon Instance']) {
            console.log('🔄 Starting icon instance swapping...');
            console.log('Original Button icon instance:', buttonProps['Icon Instance']);
            console.log('Icon mapping config:', mappingResult.iconMapping);
            
            try {
              // Get the original icon instance from the Button
              const originalIconInstanceId = buttonProps['Icon Instance'];
              
              // Find the icon instance properties in the Action component
              const actionInstances = instance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
              
              for (const actionInstance of actionInstances) {
                const actionProps = actionInstance.componentProperties || {};
                const iconSelectProps = Object.keys(actionProps).filter(key => 
                  key.toLowerCase().includes('select') && 
                  key.toLowerCase().includes('icon') &&
                  (key.toLowerCase().includes('left') || key.toLowerCase().includes('right') || 
                   !key.toLowerCase().includes('left') && !key.toLowerCase().includes('right')) // Include icon-only properties
                );
                
                if (iconSelectProps.length > 0) {
                  console.log(`📍 Found icon selection properties in Action:`, iconSelectProps);
                  
                  // Determine which icon property to update based on Button icon position and Action variant
                  let targetIconProp = null;
                  
                  if (mappingResult.iconMapping.targetIconOnly) {
                    // Icon-Only variant uses a single icon property
                    targetIconProp = mappingResult.iconMapping.targetIconOnly;
                    console.log(`🎯 Using Icon-Only target property: ${targetIconProp}`);
                  } else if (buttonProps.Icon && buttonProps.Icon.includes('Right')) {
                    // Button had right icon, find right icon property in Action
                    targetIconProp = iconSelectProps.find(prop => prop.toLowerCase().includes('right'));
                  } else if (buttonProps.Icon && (buttonProps.Icon.includes('Left') || buttonProps.Icon.includes('❖ Left'))) {
                    // Button had left icon, find left icon property in Action
                    targetIconProp = iconSelectProps.find(prop => prop.toLowerCase().includes('left'));
                  }
                  
                  if (targetIconProp) {
                    console.log(`🎯 Will set Action icon property: ${targetIconProp}`);
                    
                    // Find the actual icon instance in the original Button to get its component key
                    try {
                      console.log(`🔍 Looking for original icon instance in Button component...`);
                      
                      // Find the icon instance in the current page that matches this ID
                      let sourceIconInstance: InstanceNode | null = null;
                      const allInstancesInPage = figma.currentPage.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
                      
                      // Check each instance asynchronously
                      for (const pageInstance of allInstancesInPage) {
                        if (pageInstance.id === originalIconInstanceId) {
                          sourceIconInstance = pageInstance;
                          console.log(`✅ Found source icon instance by ID: ${pageInstance.name}`);
                          break;
                        }
                        
                        // Check main component key asynchronously
                        try {
                          const mainComponent = await pageInstance.getMainComponentAsync();
                          if (mainComponent && mainComponent.key === originalIconInstanceId) {
                            sourceIconInstance = pageInstance;
                            console.log(`✅ Found source icon instance by component key: ${pageInstance.name}`);
                            break;
                          }
                        } catch (error) {
                          // Skip instances that can't get main component
                          continue;
                        }
                      }
                      
                      if (!sourceIconInstance) {
                        // Try to find the icon within the original Button instance that we're migrating
                        try {
                          const originalButtonInstance = await figma.getNodeByIdAsync(instance.id) as InstanceNode;
                          if (originalButtonInstance) {
                            const buttonIconInstances = originalButtonInstance.findAll(node => 
                              node.type === 'INSTANCE' && node.id === originalIconInstanceId
                            ) as InstanceNode[];
                            
                            if (buttonIconInstances && buttonIconInstances.length > 0) {
                              sourceIconInstance = buttonIconInstances[0];
                              console.log(`✅ Found icon within Button: ${sourceIconInstance.name}`);
                            }
                          }
                        } catch (getNodeError) {
                          console.log(`⚠️ Could not get original button instance: ${getNodeError instanceof Error ? getNodeError.message : getNodeError}`);
                        }
                      }
                      
                      if (sourceIconInstance) {
                        try {
                          const mainComponent = await sourceIconInstance.getMainComponentAsync();
                          if (mainComponent) {
                            const iconComponentKey = mainComponent.key;
                            console.log(`✅ Found icon component key: ${iconComponentKey}`);
                            console.log(`Icon component name: ${mainComponent.name}`);
                            
                            // Set the icon in the Action component using the component key
                            await applyPropertySafely(targetIconProp, iconComponentKey);
                            console.log(`✅ Successfully applied icon to Action component`);
                          } else {
                            console.log(`⚠️ Could not get main component for icon instance`);
                            allWarnings.push(`Could not get main component for icon instance`);
                          }
                        } catch (asyncError) {
                          console.error(`❌ Error getting main component:`, asyncError);
                          allWarnings.push(`Error getting icon main component: ${asyncError instanceof Error ? asyncError.message : asyncError}`);
                        }
                      } else {
                        // ⚡ EFFICIENT FALLBACK: Try using the icon instance ID directly as component key
                        console.log(`🚀 EFFICIENT FALLBACK: Using icon instance ID directly as component key...`);
                        console.log(`🎯 Icon instance ID from Button: ${originalIconInstanceId}`);
                        
                        try {
                          // Many times the icon instance ID is actually the component key
                          await applyPropertySafely(targetIconProp, originalIconInstanceId);
                          console.log(`✅ Successfully applied icon using direct component key transfer!`);
                        } catch (directApplicationError) {
                          console.log(`⚠️ Direct key application failed: ${directApplicationError instanceof Error ? directApplicationError.message : directApplicationError}`);
                          allWarnings.push(`Could not transfer icon from Button to Action component`);
                        }
                      }
                    } catch (iconMappingError) {
                      console.error(`❌ Error during icon mapping:`, iconMappingError);
                      allWarnings.push(`Error mapping icon: ${iconMappingError instanceof Error ? iconMappingError.message : iconMappingError}`);
                    }
                  } else {
                    console.log(`⚠️ Could not determine target icon property for Button icon position: ${buttonProps.Icon}`);
                    allWarnings.push(`Could not map icon position from Button to Action`);
                  }
                  
                  break; // Found the component with icon properties, exit loop
                }
              }
            } catch (iconMappingError) {
              console.error(`❌ Error during icon instance swapping:`, iconMappingError);
              allWarnings.push(`Error during icon swapping: ${iconMappingError instanceof Error ? iconMappingError.message : iconMappingError}`);
            }
          } else if (buttonProps['Icon Instance']) {
            console.log('ℹ️ Button has icon but no icon mapping needed (Button icon was "None" or not configured for mapping)');
          }

          // Apply theme mode if specified
          console.log(`🔍 Theme check: mappingResult.themeMode = "${mappingResult.themeMode}"`);
          if (mappingResult.themeMode) {
            console.log(`🎨 Applying theme mode: ${mappingResult.themeMode}`);
            try {
              await applyThemeModeViaAPI(instance, mappingResult.themeMode, allWarnings);
            } catch (error) {
              console.error('❌ Error applying theme mode:', error);
              allWarnings.push(`Error applying theme: ${error instanceof Error ? error.message : String(error)}`);
            }
          } else {
            console.log('ℹ️ No theme change needed (themeMode is empty or undefined)');
          }

          console.log('Property mapping completed successfully');

          // PERFORMANCE TRACKING SECTION
          const performanceMetrics = {
            migrationId: instanceId,
            migrationStart: migrationStartTime,
            componentAnalysis: analysisTime - migrationStartTime,
            propertyApplicationStart: 0,
            propertyApplicationEnd: 0,
            themeApplicationStart: 0,
            themeApplicationEnd: 0,
            totalMigration: 0,
            memoryUsage: {
              before: (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 'unavailable',
              after: 'pending'
            },
            warnings: allWarnings
          };

          // Notify UI of success
          figma.ui.postMessage({
            type: 'MIGRATION_COMPLETE',
            data: {
              success: true,
              message: 'Component migrated successfully with property mapping',
              warnings: allWarnings
            }
          });

          // Log performance metrics
          logPerformanceMetrics(performanceMetrics);
        } catch (error) {
          console.error('Migration failed:', error);
          figma.ui.postMessage({
            type: 'MIGRATION_COMPLETE',
            data: {
              success: false,
              message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          });
        }
        break;

      case MESSAGE_TYPES.CANCEL:
        figma.closePlugin();
        break;

      case 'migrate':
        // ... existing migrate code ...
        break;

      case 'diagnose-themes':
        console.log('🔍 THEME DIAGNOSTIC: Analyzing variable structure...');
        
        try {
          const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
          
          // Also get remote collections from team libraries for complete analysis
          const remoteCollections = [];
          try {
            const libraryCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
            
            for (const libraryCollection of libraryCollections) {
              try {
                const variables = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libraryCollection.key);
                
                if (variables.length > 0) {
                  const importedVariable = await figma.variables.importVariableByKeyAsync(variables[0].key);
                  const collectionId = importedVariable.variableCollectionId;
                  const variableCollection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
                  if (variableCollection) {
                    remoteCollections.push(variableCollection);
                  }
                }
              } catch (err) {
                console.error(`Failed to process library collection: ${libraryCollection.name}`, err);
              }
            }
          } catch (err) {
            console.log('No library collections available:', err);
          }
          
          const allCollections = [...localCollections, ...remoteCollections];
          console.log(`\n📊 THEME ANALYSIS REPORT:`);
          console.log(`Found ${allCollections.length} variable collections (${localCollections.length} local, ${remoteCollections.length} remote)\n`);
          
          for (let i = 0; i < allCollections.length; i++) {
            const collection = allCollections[i];
            console.log(`📁 Collection ${i + 1}: "${collection.name}"`);
            console.log(`   ID: ${collection.id}`);
            console.log(`   Modes (${collection.modes.length}):`);
            collection.modes.forEach((mode, idx) => {
              console.log(`     ${idx + 1}. "${mode.name}" (ID: ${mode.modeId})`);
            });
            
            // Check if this looks like a theme collection
            const hasThemeKeywords = collection.modes.some(mode => 
              mode.name.toLowerCase().includes('light') ||
              mode.name.toLowerCase().includes('dark') ||
              mode.name.toLowerCase().includes('asurion') ||
              mode.name.toLowerCase().includes('partner')
            );
            
            console.log(`   🎨 Theme collection? ${hasThemeKeywords ? 'YES' : 'NO'}`);
            
            // Sample some variables
            const allVariables = await figma.variables.getLocalVariablesAsync();
            const collectionVars = allVariables.filter(v => v.variableCollectionId === collection.id);
            console.log(`   📋 Variables: ${collectionVars.length} total`);
            
            // Show color variables specifically
            const colorVars = collectionVars.filter(v => v.resolvedType === 'COLOR');
            if (colorVars.length > 0) {
              console.log(`   🎨 Color variables: ${colorVars.length}`);
              colorVars.slice(0, 3).forEach(variable => {
                console.log(`     - "${variable.name}"`);
              });
              if (colorVars.length > 3) {
                console.log(`     ... and ${colorVars.length - 3} more`);
              }
            }
            console.log('');
          }
          
          // Provide recommendations
          console.log(`\n💡 RECOMMENDATIONS:`);
          if (allCollections.length === 0) {
            console.log(`❌ No variable collections found. Create theme variable collections first.`);
          } else if (allCollections.length === 1 && allCollections[0].modes.length === 1) {
            console.log(`⚠️  Found only 1 collection with 1 mode. For theming, you'll need:`);
            console.log(`   1. Multiple modes (Light/Dark) OR`);
            console.log(`   2. Multiple collections (Asurion/Partner) OR`);
            console.log(`   3. Tell us the exact collection + mode names to use`);
          } else {
            const hasMultiMode = allCollections.some(c => c.modes.length > 1);
            if (hasMultiMode) {
              console.log(`✅ Found collections with multiple modes - good for theming!`);
            }
          }
          
          figma.ui.postMessage({
            type: 'DIAGNOSTIC_COMPLETE',
            data: {
              collections: allCollections.map(c => ({
                name: c.name,
                id: c.id,
                modes: c.modes.map(m => ({ name: m.name, id: m.modeId }))
              }))
            }
          });
          
        } catch (error) {
          console.error('❌ Error in theme diagnostic:', error);
          figma.ui.postMessage({
            type: 'DIAGNOSTIC_ERROR',
            data: { error: error instanceof Error ? error.message : String(error) }
          });
        }
        break;

      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error: unknown) {
    console.error('Error in message handler:', error);
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