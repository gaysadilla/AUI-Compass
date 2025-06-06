import { figmaApi } from '../services/figmaApi';
import { RegistryService } from '../services/registryService';
import { ComponentMetadata } from '../types/registry';

const FILE_KEY = 'm53qXHtSGzqPNze050jhTp';

async function updateRegistry() {
  console.log('Initializing registry service...');
  const registryService = new RegistryService();
  await registryService.initialize();

  console.log('Fetching components from Figma...');
  const response = await figmaApi.getFileDetails(FILE_KEY, 10);
  
  if (response.status !== 200 || !response.data) {
    console.error('Error fetching file details:', response.error);
    return;
  }

  const document = response.data.document;
  const components: ComponentMetadata[] = [];

  // Recursively collect components
  function collectComponents(node: any, fileKey: string) {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      const component: ComponentMetadata = {
        id: node.id,
        name: node.name,
        key: node.key,
        type: node.type === 'COMPONENT' ? 'component' : 'component_set',
        properties: {},
        lastModified: new Date().toISOString(),
        fileKey
      };

      // Extract properties
      if (node.properties) {
        Object.entries(node.properties).forEach(([key, value]: [string, any]) => {
          component.properties[key] = {
            type: typeof value,
            value: value
          };
        });
      }

      // Extract variants for component sets
      if (node.type === 'COMPONENT_SET' && node.variantGroupProperties) {
        component.variants = node.variantGroupProperties;
      }

      // Check for deprecated status (based on name or other indicators)
      if (node.name.includes('(Deprecated)') || node.name.includes('🔴')) {
        component.deprecated = true;
      }

      components.push(component);
    }

    // Recursively process children
    if (node.children) {
      node.children.forEach((child: any) => collectComponents(child, fileKey));
    }
  }

  collectComponents(document, FILE_KEY);

  console.log(`Found ${components.length} components`);

  // Update registry with new components
  for (const component of components) {
    await registryService.addComponent(component);
  }

  console.log('Registry updated successfully');
  console.log('Summary:');
  console.log(`- Total components: ${components.length}`);
  console.log(`- Deprecated components: ${components.filter(c => c.deprecated).length}`);
}

// Run the script
updateRegistry().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
}); 