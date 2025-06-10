/// <reference types="@figma/plugin-typings" />

// This script needs to run inside the Figma Plugin environment
// Add this to your code.ts temporarily to get the keys

export async function getSpecificComponentKeys() {
  console.log('🔍 Getting component keys for Button and Action components...');
  
  const results: Array<{
    name: string;
    type: string;
    key: string;
    id: string;
    variantCount?: number;
  }> = [];

  // Load all pages first (required for dynamic-page access)
  console.log('📄 Loading all pages...');
  await figma.loadAllPagesAsync();
  
  // Find all components in the current file
  console.log('🔍 Searching for components...');
  const allNodes = figma.root.findAll((node) => 
    node.type === 'COMPONENT_SET' || node.type === 'COMPONENT'
  );

  console.log(`Found ${allNodes.length} total components/component sets`);

  for (const node of allNodes) {
    const name = node.name.toLowerCase();
    
    // Look for Button (deprecated) and Action components specifically
    if (
      name.includes('button') && name.includes('deprecated') ||
      name.includes('action') && !name.includes('card') && !name.includes('micro') ||
      name === '🟢 action' ||
      name === '.action' ||
      name.includes('🛑') && name.includes('button')
    ) {
      const result = {
        name: node.name,
        type: node.type,
        key: (node as ComponentNode | ComponentSetNode).key,
        id: node.id,
        variantCount: node.type === 'COMPONENT_SET' ? (node as ComponentSetNode).children.length : undefined
      };
      
      results.push(result);
      console.log(`✅ Found: ${result.name} (${result.type}) - Key: ${result.key}`);
    }
  }

  console.log('\n📋 Component Keys Summary:');
  console.table(results);
  
  return results;
}

// Add this to your message handler in code.ts:
/*
case 'GET_COMPONENT_KEYS':
  const keys = await getSpecificComponentKeys();
  figma.ui.postMessage({ type: 'COMPONENT_KEYS_RESULT', data: keys });
  break;
*/ 