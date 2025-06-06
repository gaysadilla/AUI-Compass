import { figmaApi } from '../services/figmaApi';
import * as fs from 'fs/promises';

interface ComponentWithDetails {
  metadata: any;
  nodeData: any;
  properties: any;
  variants: any;
}

async function fetchButtonAndActionComponents() {
  try {
    // Step 1: Get team components (Button & Action)
    const teamComponents = await figmaApi.get('/teams/{TEAM_ID}/components');

    // Step 2: Filter for target components
    const buttonComponent = teamComponents.data.meta.components.find((c: any) =>
      c.name.includes('🛑 Button') && c.name.toLowerCase().includes('deprecated')
    );

    const actionComponent = teamComponents.data.meta.components.find((c: any) =>
      c.name.includes('🟢 Action')
    );

    if (!buttonComponent || !actionComponent) {
      throw new Error('Could not find target components');
    }

    // Step 3: Get detailed component data
    const buttonDetails = await fetchComponentDetails(buttonComponent);
    const actionDetails = await fetchComponentDetails(actionComponent);

    // Step 4: Export to JSON
    await fs.writeFile('button-deprecated.json', JSON.stringify(buttonDetails, null, 2), 'utf8');
    await fs.writeFile('action-current.json', JSON.stringify(actionDetails, null, 2), 'utf8');

    console.log('Components exported successfully!');

  } catch (error) {
    console.error('Error:', error);
  }
}

async function fetchComponentDetails(component: any): Promise<ComponentWithDetails> {
  // Get the file key from component
  const fileKey = component.containing_frame?.file_key || component.file_key;

  if (!fileKey) {
    throw new Error('No file key found for component');
  }

  // Fetch node details with properties
  const nodeResponse = await figmaApi.get(`/files/${fileKey}/nodes?ids=${component.node_id}`);
  const nodeData = nodeResponse.data.nodes[component.node_id];

  return {
    metadata: component,
    nodeData: nodeData,
    properties: extractProperties(nodeData),
    variants: extractVariants(nodeData)
  };
}

function extractProperties(nodeData: any) {
  // Extract component properties from node data
  return nodeData.document?.componentPropertyDefinitions || {};
}

function extractVariants(nodeData: any) {
  // Extract variants from component set or component
  const variants = [];

  if (nodeData.document?.type === 'COMPONENT_SET') {
    // Handle component set variants
    variants.push(...nodeData.document.children.map((child: any) => ({
      name: child.name,
      properties: child.variantProperties || {}
    })));
  }

  return variants;
}

// Run the script
fetchButtonAndActionComponents().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
}); 