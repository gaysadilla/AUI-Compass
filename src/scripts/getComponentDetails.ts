import { figmaApi } from '../services/figmaApi';

const FILE_KEY = 'm53qXHtSGzqPNze050jhTp';

async function getComponentDetails() {
  console.log('Fetching components from Figma...');
  const response = await figmaApi.getFileDetails(FILE_KEY, 30);
  
  if (response.status !== 200 || !response.data) {
    console.error('Error fetching file details:', response.error);
    return;
  }

  const document = response.data.document;
  const components: any[] = [];

  // Recursively collect components
  function collectComponents(node: any, fileKey: string) {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push({
        id: node.id,
        name: node.name,
        key: node.key,
        type: node.type,
        properties: node.properties || {},
        variants: node.variantGroupProperties || {},
        fileKey,
      });
    }

    // Recursively process children
    if (node.children) {
      node.children.forEach((child: any) => collectComponents(child, fileKey));
    }
  }

  collectComponents(document, FILE_KEY);

  console.log(`Found ${components.length} components`);

  // Log details for the deprecated Button and Action components
  const deprecatedButton = components.find(c => c.name === '.🛑 Button (Deprecated)');
  const actionComponent = components.find(c => c.name.includes('🟢 Action'));

  if (deprecatedButton) {
    console.log('\nDeprecated Button Component Details:');
    console.log(JSON.stringify(deprecatedButton, null, 2));
  } else {
    console.log('Deprecated Button component not found.');
  }

  if (actionComponent) {
    console.log('\nAction Component Details:');
    console.log(JSON.stringify(actionComponent, null, 2));
  } else {
    console.log('Action component not found.');
  }
}

// Run the script
getComponentDetails().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
}); 