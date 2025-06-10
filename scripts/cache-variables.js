const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function cacheVariables() {
  console.log('🔄 Caching variable data from foundations library...');
  
  const figmaPAT = process.env.FIGMA_PAT;
  if (!figmaPAT) {
    console.error('❌ FIGMA_PAT not found in environment variables');
    process.exit(1);
  }
  
  const foundationsFileKey = '6U6RqnBEYnBL5oRovZY4Gt';
  
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${foundationsFileKey}/variables/local`, {
      method: 'GET',
      headers: {
        'X-Figma-Token': figmaPAT
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const variableData = await response.json();
    
    // Find the theme collection
    const themeCollection = Object.values(variableData.meta.variableCollections || {}).find(collection => 
      collection.name === 'System Tokens and Themes' ||
      Object.values(collection.modes || {}).some(mode => 
        ['Asurion - Light', 'Asurion - Dark', 'Partner - Light', 'Partner - Dark'].includes(mode.name)
      )
    );
    
    if (!themeCollection) {
      throw new Error('Theme collection not found in API response');
    }
    
    // Create optimized cache with just what we need
    const cache = {
      lastUpdated: new Date().toISOString(),
      foundationsFileKey,
      themeCollection: {
        id: themeCollection.id,
        name: themeCollection.name,
        modes: themeCollection.modes
      },
      // Get a sample variable for bridge imports
      bridgeVariables: Object.values(variableData.meta.variables || {})
        .filter(variable => variable.variableCollectionId === themeCollection.id)
        .slice(0, 3) // Keep first 3 as backup options
        .map(variable => ({
          key: variable.key,
          name: variable.name,
          id: variable.id
        }))
    };
    
    // Ensure cache directory exists
    const cacheDir = path.join(__dirname, '..', 'src', 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Write cache file
    const cachePath = path.join(cacheDir, 'variable-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    
    console.log('✅ Variable cache updated successfully');
    console.log(`📁 Cache location: ${cachePath}`);
    console.log(`🎨 Theme collection: "${themeCollection.name}"`);
    console.log(`🌉 Bridge variables: ${cache.bridgeVariables.length} available`);
    console.log(`📅 Last updated: ${cache.lastUpdated}`);
    
  } catch (error) {
    console.error('❌ Failed to cache variables:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cacheVariables();
}

module.exports = cacheVariables; 