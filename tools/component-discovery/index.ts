import { figmaApi } from '../../src/services/figmaApi';
import * as fs from 'fs';
import * as path from 'path';

interface ComponentAnalysis {
  key: string;
  name: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  properties: Record<string, {
    type: string;
    values?: string[];
    defaultValue?: any;
  }>;
  variants: Array<{
    name: string;
    properties: Record<string, string>;
  }>;
  nestedComponents: Array<{
    key: string;
    name: string;
    type: string;
    properties: Record<string, any>;
  }>;
  structure: {
    hasNestedComponents: boolean;
    usesAutoLayout: boolean;
    childrenCount: number;
  };
}

interface ComponentPropertyDefinition {
  type: string;
  variantOptions?: string[];
  defaultValue?: any;
}

async function extractComponentKey(url: string): Promise<{ fileKey: string; nodeId: string }> {
  // Extract file key after /design/ or /file/
  const fileKeyMatch = url.match(/(?:design|file)\/([^/?]+)/);
  if (!fileKeyMatch) {
    throw new Error('Invalid Figma URL: missing file key');
  }
  const fileKey = fileKeyMatch[1];

  // Extract node-id from query string
  const nodeIdMatch = url.match(/[?&]node-id=([^&]+)/);
  if (!nodeIdMatch) {
    throw new Error('Invalid Figma URL: missing node-id');
  }
  const nodeId = nodeIdMatch[1].replace(/-/g, ':'); // Convert dashes to colons

  return { fileKey, nodeId };
}

// Helper to recursively extract properties from all nested components/instances
function extractAllProperties(node: any, path: string[] = []): Record<string, any> {
  let properties: Record<string, any> = {};

  // Extract properties at this node
  if (node.componentPropertyDefinitions) {
    for (const [key, def] of Object.entries(node.componentPropertyDefinitions)) {
      const cleanKey = key.split('#')[0];
      const propPath = [...path, cleanKey].join('.');
      const typedDef = def as ComponentPropertyDefinition;
      properties[propPath] = {
        type: typedDef.type || 'VARIANT',
        values: typedDef.variantOptions || [],
        defaultValue: typedDef.defaultValue,
      };
    }
  }
  if (node.componentProperties) {
    for (const [key, def] of Object.entries(node.componentProperties)) {
      const cleanKey = key.split('#')[0];
      const propPath = [...path, cleanKey].join('.');
      properties[propPath] = def as any;
    }
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      // Only recurse into instances/components
      if (child.type === 'INSTANCE' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET') {
        const childPath = [...path, child.name.replace(/\s+/g, ' ')];
        const childProps = extractAllProperties(child, childPath);
        properties = { ...properties, ...childProps };
      }
    }
  }

  return properties;
}

async function analyzeComponent(url: string): Promise<ComponentAnalysis> {
  console.log(`\nAnalyzing component from URL: ${url}`);
  const { fileKey, nodeId } = await extractComponentKey(url);
  const response = await figmaApi.getFileNodes(fileKey, [nodeId]);
  if (response.status !== 200 || !response.data?.nodes?.[nodeId]) {
    console.error(`Failed to fetch component: ${response.error || 'Unknown error'}`);
    throw new Error(`Failed to fetch component: ${response.error || 'Unknown error'}`);
  }
  const node = response.data.nodes[nodeId].document;
  const flatProperties = extractAllProperties(node);
  const analysis: ComponentAnalysis = {
    key: nodeId,
    name: node.name,
    type: node.type,
    properties: flatProperties, // Use the flat property map
    variants: [],
    nestedComponents: [],
    structure: {
      hasNestedComponents: false,
      usesAutoLayout: false,
      childrenCount: 0,
    },
  };
  // Analyze variants (top-level only)
  if (node.type === 'COMPONENT_SET') {
    analysis.variants = parseVariants(node.children || []);
  }
  // Analyze structure and nested components
  const { hasNested, components, usesAutoLayout, childrenCount } = analyzeStructure(node);
  analysis.structure = {
    hasNestedComponents: hasNested,
    usesAutoLayout,
    childrenCount,
  };
  analysis.nestedComponents = components;
  return analysis;
}

function parseComponentProperties(propDefs: Record<string, ComponentPropertyDefinition>): Record<string, any> {
  const properties: Record<string, any> = {};
  
  for (const [key, def] of Object.entries(propDefs)) {
    const cleanKey = key.split('#')[0];
    properties[cleanKey] = {
      type: def.type || 'VARIANT',
      values: def.variantOptions || [],
      defaultValue: def.defaultValue,
    };
  }
  
  return properties;
}

function parseVariants(children: any[]): Array<{ name: string; properties: Record<string, string> }> {
  return children
    .filter(child => child.type === 'COMPONENT')
    .map(child => ({
      name: child.name,
      properties: parseVariantName(child.name),
    }));
}

function parseVariantName(name: string): Record<string, string> {
  const properties: Record<string, string> = {};
  const parts = name.split(', ');
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      properties[key.trim()] = value.trim();
    }
  }
  
  return properties;
}

function analyzeStructure(node: any): {
  hasNested: boolean;
  components: Array<{ key: string; name: string; type: string; properties: Record<string, any> }>;
  usesAutoLayout: boolean;
  childrenCount: number;
} {
  const components: Array<{ key: string; name: string; type: string; properties: Record<string, any> }> = [];
  let hasNested = false;
  
  function traverse(n: any) {
    if (n.type === 'INSTANCE') {
      hasNested = true;
      components.push({
        key: n.componentId,
        name: n.name,
        type: n.type,
        properties: n.componentProperties || {},
      });
    }
    if (n.children) {
      n.children.forEach(traverse);
    }
  }
  
  if (node.children) {
    node.children.forEach(traverse);
  }
  
  return {
    hasNested,
    components,
    usesAutoLayout: node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL',
    childrenCount: node.children?.length || 0,
  };
}

async function generateReport(buttonAnalysis: ComponentAnalysis, actionAnalysis: ComponentAnalysis): Promise<void> {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save individual analyses
  fs.writeFileSync(
    path.join(outputDir, 'button-analysis.json'),
    JSON.stringify(buttonAnalysis, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'action-analysis.json'),
    JSON.stringify(actionAnalysis, null, 2)
  );
  
  // Generate comparison report
  const comparison = {
    generated: new Date().toISOString(),
    button: {
      name: buttonAnalysis.name,
      type: buttonAnalysis.type,
      propertyCount: Object.keys(buttonAnalysis.properties).length,
      variantCount: buttonAnalysis.variants.length,
      nestedComponentCount: buttonAnalysis.nestedComponents.length,
      structure: buttonAnalysis.structure,
    },
    action: {
      name: actionAnalysis.name,
      type: actionAnalysis.type,
      propertyCount: Object.keys(actionAnalysis.properties).length,
      variantCount: actionAnalysis.variants.length,
      nestedComponentCount: actionAnalysis.nestedComponents.length,
      structure: actionAnalysis.structure,
    },
    differences: {
      propertyTypes: comparePropertyTypes(buttonAnalysis.properties, actionAnalysis.properties),
      structure: compareStructure(buttonAnalysis, actionAnalysis),
    },
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'comparison-report.json'),
    JSON.stringify(comparison, null, 2)
  );
  
  console.log('\n✅ Analysis complete! Check the output directory for results.');
}

function comparePropertyTypes(buttonProps: Record<string, any>, actionProps: Record<string, any>): {
  buttonOnly: string[];
  actionOnly: string[];
  common: string[];
  typeDifferences: Array<{ property: string; buttonType: string; actionType: string }>;
} {
  const buttonOnly = Object.keys(buttonProps).filter(p => !actionProps[p]);
  const actionOnly = Object.keys(actionProps).filter(p => !buttonProps[p]);
  const common = Object.keys(buttonProps).filter(p => actionProps[p]);
  
  const typeDifferences = common
    .filter(p => buttonProps[p].type !== actionProps[p].type)
    .map(p => ({
      property: p,
      buttonType: buttonProps[p].type,
      actionType: actionProps[p].type,
    }));
  
  return {
    buttonOnly,
    actionOnly,
    common,
    typeDifferences,
  };
}

function compareStructure(button: ComponentAnalysis, action: ComponentAnalysis): {
  hasNestedComponents: boolean;
  usesAutoLayout: boolean;
  childrenCount: number;
  nestedComponentDifferences: {
    buttonOnly: string[];
    actionOnly: string[];
    common: string[];
  };
} {
  const buttonNested = button.nestedComponents.map(c => c.name);
  const actionNested = action.nestedComponents.map(c => c.name);
  
  return {
    hasNestedComponents: button.structure.hasNestedComponents !== action.structure.hasNestedComponents,
    usesAutoLayout: button.structure.usesAutoLayout !== action.structure.usesAutoLayout,
    childrenCount: Math.abs(button.structure.childrenCount - action.structure.childrenCount),
    nestedComponentDifferences: {
      buttonOnly: buttonNested.filter(n => !actionNested.includes(n)),
      actionOnly: actionNested.filter(n => !buttonNested.includes(n)),
      common: buttonNested.filter(n => actionNested.includes(n)),
    },
  };
}

// Main execution
async function main() {
  try {
    const buttonUrl = 'https://www.figma.com/design/m53qXHtSGzqPNze050jhTp/%F0%9F%9F%A2-AsurionUI--2--Components?m=auto&node-id=34-246653&t=iEmeobQLYzOLmFMb-1';
    const actionUrl = 'https://www.figma.com/design/m53qXHtSGzqPNze050jhTp/%F0%9F%9F%A2-AsurionUI--2--Components?m=auto&node-id=12318-7152&t=iEmeobQLYzOLmFMb-1';
    
    console.log('🔍 Starting component analysis...');
    
    const buttonAnalysis = await analyzeComponent(buttonUrl);
    const actionAnalysis = await analyzeComponent(actionUrl);
    
    await generateReport(buttonAnalysis, actionAnalysis);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 