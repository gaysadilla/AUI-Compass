import { figmaApi } from '../services/figmaApi';

const COMPONENTS_FILE_KEY = 'm53qXHtSGzqPNze050jhTp'; // 🟢 AsurionUI -2- Components

async function getAllComponentDetails() {
  console.log('Fetching all component and component set details...');
  
  // Get the file details
  const fileResponse = await figmaApi.getFileDetails(COMPONENTS_FILE_KEY, 3);
  
  if (fileResponse.status !== 200 || !fileResponse.data) {
    console.error('Error fetching file:', fileResponse.error);
    console.error('Response status:', fileResponse.status);
    console.error('Full response:', JSON.stringify(fileResponse, null, 2));
    return;
  }

  // Recursively collect all COMPONENT and COMPONENT_SET nodes
  const components: any[] = [];
  function collectComponents(node: any) {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push(node);
    }
    if (node.children) {
      node.children.forEach(collectComponents);
    }
  }
  collectComponents(fileResponse.data.document);

  if (components.length === 0) {
    console.log('No components or component sets found in the file.');
    return;
  }

  console.log(`\nFound ${components.length} components/component sets.`);

  // Fetch and print details for each component/component set
  for (const comp of components) {
    console.log('\n------------------------');
    console.log(`Name: ${comp.name}`);
    console.log(`ID: ${comp.id}`);
    console.log(`Type: ${comp.type}`);
    if (comp.description) {
      console.log(`Description: ${comp.description}`);
    }
    if (comp.documentationLinks) {
      console.log('Documentation Links:');
      comp.documentationLinks.forEach((link: string) => console.log(`- ${link}`));
    }
    if (comp.componentPropertyDefinitions) {
      console.log('Properties:');
      Object.entries(comp.componentPropertyDefinitions).forEach(([key, value]: [string, any]) => {
        console.log(`- ${key}: ${value.type}`);
      });
    }
    if (comp.variantProperties) {
      console.log('Variants:');
      Object.entries(comp.variantProperties).forEach(([key, value]: [string, any]) => {
        console.log(`- ${key}: ${value}`);
      });
    }
    if (comp.children && comp.type === 'COMPONENT_SET') {
      console.log('Variants in Set:');
      comp.children.forEach((variant: any) => {
        console.log(`- ${variant.name} (ID: ${variant.id})`);
      });
    }
  }
}

// Run the script
getAllComponentDetails().catch(error => {
  console.error('Script error:', error);
}); 