/// <reference types="@figma/plugin-typings" />

interface ComponentAnalysis {
  componentName: string;
  componentSetKey: string;
  variants: Array<{
    name: string;
    key: string;
    variantProperties: { [key: string]: string };
    componentProperties: { [key: string]: any };
  }>;
  nestedComponents: Array<{
    name: string;
    key: string;
    properties: { [key: string]: any };
    propertyDefinitions: { [key: string]: any };
  }>;
}

async function findComponentSetInFile(componentKey: string): Promise<ComponentSetNode | null> {
  console.log(`🔍 Searching for unpublished component with key: ${componentKey}`);
  
  const allComponents = figma.root.findAll(node => 
    node.type === 'COMPONENT_SET' && (node as ComponentSetNode).key === componentKey
  ) as ComponentSetNode[];
  
  if (allComponents.length > 0) {
    console.log(`✅ Found unpublished component set: ${allComponents[0].name}`);
    return allComponents[0];
  }
  
  console.log(`❌ Component set not found in current file`);
  return null;
}

async function analyzeExistingInstances(componentKey: string): Promise<ComponentAnalysis | null> {
  console.log(`🔍 Fallback: Analyzing existing instances with key: ${componentKey}`);
  
  // First find all instances
  const allInstances = figma.root.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
  console.log(`Found ${allInstances.length} total instances to check`);
  
  // Then check each instance asynchronously to find matching ones
  const matchingInstances: InstanceNode[] = [];
  
  for (const instance of allInstances) {
    try {
      const mainComponent = await instance.getMainComponentAsync();
      if (mainComponent?.parent?.type === 'COMPONENT_SET') {
        const componentSet = mainComponent.parent as ComponentSetNode;
        if (componentSet.key === componentKey) {
          matchingInstances.push(instance);
          console.log(`✅ Found matching instance: ${instance.name}`);
        }
      }
    } catch (error) {
      // Skip instances that can't be accessed
      console.log(`⚠️ Could not check instance: ${instance.name}`);
    }
  }
  
  console.log(`Found ${matchingInstances.length} matching instances for component key`);
  
  if (matchingInstances.length === 0) {
    console.log(`❌ No matching instances found for component key: ${componentKey}`);
    return null;
  }
  
  // Use the first instance to analyze structure
  const firstInstance = matchingInstances[0];
  const mainComponent = await firstInstance.getMainComponentAsync();
  if (!mainComponent || !mainComponent.parent || mainComponent.parent.type !== 'COMPONENT_SET') {
    console.log(`❌ Could not get component set from instance`);
    return null;
  }
  
  const componentSet = mainComponent.parent as ComponentSetNode;
  console.log(`✅ Found component set from instance: ${componentSet.name}`);
  
  // Get variant properties (the dropdown selections)
  const variantProps = firstInstance.variantProperties || {};
  console.log('Instance variant properties:', variantProps);
  
  // Get component properties (the content/settings)
  const componentProps = firstInstance.componentProperties || {};
  console.log('Instance component properties:', Object.keys(componentProps));
  
  // Detailed component property analysis
  const detailedComponentProps: { [key: string]: any } = {};
  for (const [key, prop] of Object.entries(componentProps)) {
    detailedComponentProps[key] = {
      type: prop.type,
      value: prop.value,
      preferredValues: prop.preferredValues || null
    };
  }
  
  const analysis: ComponentAnalysis = {
    componentName: componentSet.name,
    componentSetKey: componentKey,
    variants: [{
      name: mainComponent.name,
      key: mainComponent.key,
      variantProperties: variantProps,
      componentProperties: detailedComponentProps
    }],
    nestedComponents: []
  };
  
  // Analyze nested components within this instance
  console.log('🔍 Looking for nested components...');
  const nestedInstances = firstInstance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
  
  for (const nestedInstance of nestedInstances) {
    const nestedMainComponent = await nestedInstance.getMainComponentAsync();
    if (!nestedMainComponent) continue;
    
    console.log(`  📦 Found nested component: ${nestedMainComponent.name}`);
    
    const nestedProps = nestedInstance.componentProperties || {};
    const nestedPropDefs: { [key: string]: any } = {};
    
    for (const [key, prop] of Object.entries(nestedProps)) {
      nestedPropDefs[key] = {
        type: prop.type,
        value: prop.value,
        preferredValues: prop.preferredValues || null
      };
    }
    
    analysis.nestedComponents.push({
      name: nestedMainComponent.name,
      key: nestedMainComponent.key,
      properties: nestedProps,
      propertyDefinitions: nestedPropDefs
    });
  }
  
  return analysis;
}

export async function analyzeComponentStructure(componentKeys: string[]): Promise<ComponentAnalysis[]> {
  console.log('🔬 Starting comprehensive component analysis...');
  
  const results: ComponentAnalysis[] = [];
  
  // Load all pages first
  await figma.loadAllPagesAsync();
  
  for (const componentKey of componentKeys) {
    console.log(`\n📊 Analyzing component: ${componentKey}`);
    
    try {
      let componentSet: ComponentSetNode | null = null;
      
      // First try to import from library (for published components)
      try {
        componentSet = await figma.importComponentSetByKeyAsync(componentKey);
        if (componentSet) {
          console.log(`✅ Imported published component set: ${componentSet.name}`);
        }
      } catch (importError) {
        console.log(`⚠️ Failed to import from library, searching in current file...`);
      }
      
      // If import failed, search in current file (for unpublished components)
      if (!componentSet) {
        componentSet = await findComponentSetInFile(componentKey);
      }
      
      // If still not found, try analyzing existing instances
      if (!componentSet) {
        console.log(`⚠️ Component set not found, trying to analyze existing instances...`);
        const instanceAnalysis = await analyzeExistingInstances(componentKey);
        if (instanceAnalysis) {
          results.push(instanceAnalysis);
          continue;
        }
      }
      
      if (!componentSet) {
        console.warn(`❌ Could not find component set or instances: ${componentKey}`);
        continue;
      }
      
      const analysis: ComponentAnalysis = {
        componentName: componentSet.name,
        componentSetKey: componentKey,
        variants: [],
        nestedComponents: []
      };
      
      // Analyze each variant in the component set
      const variants = componentSet.children as ComponentNode[];
      console.log(`📋 Found ${variants.length} variants`);
      
      for (const variant of variants) {
        console.log(`\n🔍 Analyzing variant: ${variant.name}`);
        
        // Create a temporary instance to analyze properties
        const tempInstance = variant.createInstance();
        
        // Get variant properties (the dropdown selections)
        const variantProps = tempInstance.variantProperties || {};
        console.log('Variant properties:', variantProps);
        
        // Get component properties (the content/settings)
        const componentProps = tempInstance.componentProperties || {};
        console.log('Component properties:', Object.keys(componentProps));
        
        // Detailed component property analysis
        const detailedComponentProps: { [key: string]: any } = {};
        for (const [key, prop] of Object.entries(componentProps)) {
          detailedComponentProps[key] = {
            type: prop.type,
            value: prop.value,
            preferredValues: prop.preferredValues || null
          };
        }
        
        // Special focus on Style property - try to discover available values
        for (const [key, prop] of Object.entries(componentProps)) {
          if (key === 'Style' && prop.type === 'VARIANT') {
            console.log(`🔍 STYLE PROPERTY INVESTIGATION:`);
            console.log(`  Current value: "${prop.value}"`);
            console.log(`  Property object:`, prop);
            
            // Try to get the main component and see its variants
            try {
              const mainComp = await tempInstance.getMainComponentAsync();
              if (mainComp && mainComp.parent && mainComp.parent.type === 'COMPONENT_SET') {
                const compSet = mainComp.parent as ComponentSetNode;
                const allVariants = compSet.children as ComponentNode[];
                console.log(`  Parent component set has ${allVariants.length} variants:`);
                
                const styleValues = new Set<string>();
                for (const v of allVariants) {
                  // Try to extract Style property from variant name
                  if (v.name.includes('Style=')) {
                    const styleMatch = v.name.match(/Style=([^,]+)/);
                    if (styleMatch) {
                      styleValues.add(styleMatch[1].trim());
                    }
                  }
                }
                console.log(`  Available Style values found:`, Array.from(styleValues));
              }
            } catch (error) {
              console.log(`  Could not investigate parent variants:`, error);
            }
          }
        }
        
        analysis.variants.push({
          name: variant.name,
          key: variant.key,
          variantProperties: variantProps,
          componentProperties: detailedComponentProps
        });
        
        // Analyze nested components within this variant
        console.log('🔍 Looking for nested components...');
        const nestedInstances = tempInstance.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
        
        for (const nestedInstance of nestedInstances) {
          const nestedMainComponent = await nestedInstance.getMainComponentAsync();
          if (!nestedMainComponent) continue;
          
          console.log(`  📦 Found nested component: ${nestedMainComponent.name}`);
          
          const nestedProps = nestedInstance.componentProperties || {};
          const nestedPropDefs: { [key: string]: any } = {};
          
          for (const [key, prop] of Object.entries(nestedProps)) {
            nestedPropDefs[key] = {
              type: prop.type,
              value: prop.value,
              preferredValues: prop.preferredValues || null
            };
          }
          
          analysis.nestedComponents.push({
            name: nestedMainComponent.name,
            key: nestedMainComponent.key,
            properties: nestedProps,
            propertyDefinitions: nestedPropDefs
          });
        }
        
        // Clean up temporary instance
        tempInstance.remove();
        
        // Only analyze first variant to avoid too much output (we can expand later)
        break;
      }
      
      results.push(analysis);
      
    } catch (error) {
      console.error(`Failed to analyze component ${componentKey}:`, error);
    }
  }
  
  return results;
}

export async function analyzeAndCreateMapping(): Promise<void> {
  console.log('🎯 Creating comprehensive Button-to-Action mapping...');
  
  const buttonKey = '8f646f204ad28670137420637fad9fda7fff73d1';
  const actionKey = '090f47fec4dcae8e14a1ee5baf521cc7d9a2cda0';
  
  const analyses = await analyzeComponentStructure([buttonKey, actionKey]);
  
  console.log('\n📊 COMPONENT ANALYSIS RESULTS:');
  console.log('='.repeat(60));
  
  for (const analysis of analyses) {
    console.log(`\n🔷 COMPONENT: ${analysis.componentName}`);
    console.log(`Key: ${analysis.componentSetKey}`);
    
    console.log('\n📋 VARIANTS:');
    for (const variant of analysis.variants) {
      console.log(`  • ${variant.name} (${variant.key})`);
      console.log(`    Variant Properties:`, variant.variantProperties);
      console.log(`    Component Properties:`, Object.keys(variant.componentProperties));
      
      for (const [key, prop] of Object.entries(variant.componentProperties)) {
        console.log(`      - ${key}: ${prop.type} = ${prop.value}`);
      }
    }
    
    console.log('\n🔧 NESTED COMPONENTS:');
    for (const nested of analysis.nestedComponents) {
      console.log(`  • ${nested.name} (${nested.key})`);
      console.log(`    Properties:`, Object.keys(nested.propertyDefinitions));
      
      for (const [key, prop] of Object.entries(nested.propertyDefinitions)) {
        console.log(`      - ${key}: ${prop.type} = ${prop.value}`);
      }
    }
  }
  
  // Create mapping suggestions
  if (analyses.length >= 2) {
    console.log('\n🗺️ SUGGESTED PROPERTY MAPPINGS:');
    console.log('='.repeat(60));
    
    const buttonAnalysis = analyses.find(a => a.componentName.includes('Button'));
    const actionAnalysis = analyses.find(a => a.componentName.includes('Action'));
    
    if (buttonAnalysis && actionAnalysis) {
      console.log('Button → Action Property Mapping Suggestions:');
      
      // Compare variant properties
      if (buttonAnalysis.variants[0] && actionAnalysis.variants[0]) {
        const buttonVariantProps = Object.keys(buttonAnalysis.variants[0].variantProperties);
        const actionVariantProps = Object.keys(actionAnalysis.variants[0].variantProperties);
        
        console.log('\nVariant Properties:');
        for (const buttonProp of buttonVariantProps) {
          const matchingActionProp = actionVariantProps.find(ap => 
            ap.toLowerCase().includes(buttonProp.toLowerCase()) ||
            buttonProp.toLowerCase().includes(ap.toLowerCase())
          );
          
          console.log(`  ${buttonProp} → ${matchingActionProp || 'NOT FOUND'}`);
        }
      }
      
      // Compare component properties
      if (buttonAnalysis.variants[0] && actionAnalysis.nestedComponents[0]) {
        const buttonComponentProps = Object.keys(buttonAnalysis.variants[0].componentProperties);
        const actionNestedProps = Object.keys(actionAnalysis.nestedComponents[0].propertyDefinitions);
        
        console.log('\nComponent Properties:');
        for (const buttonProp of buttonComponentProps) {
          const matchingActionProp = actionNestedProps.find(ap => 
            ap.toLowerCase().includes(buttonProp.toLowerCase()) ||
            buttonProp.toLowerCase().includes(ap.toLowerCase()) ||
            ap.toLowerCase().includes('text') && buttonProp.toLowerCase().includes('label')
          );
          
          console.log(`  ${buttonProp} → ${matchingActionProp || 'NOT FOUND'}`);
        }
      }
    }
  }
}

// Add to message handler in code.ts:
/*
case 'ANALYZE_COMPONENTS':
  try {
    await analyzeAndCreateMapping();
    figma.ui.postMessage({ type: 'ANALYSIS_COMPLETE', data: 'Check console for detailed analysis' });
  } catch (error) {
    console.error('Analysis failed:', error);
    figma.ui.postMessage({ type: 'ERROR', data: `Analysis failed: ${error}` });
  }
  break;
*/ 