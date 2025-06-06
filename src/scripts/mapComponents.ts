import { RegistryService } from '../services/registryService';
import { ComponentMapping, ComponentMetadata } from '../types/registry';

async function mapComponents() {
  console.log('Initializing registry service...');
  const registryService = new RegistryService();
  await registryService.initialize();

  // Get all deprecated components
  const deprecatedComponents = await registryService.getDeprecatedComponents();
  console.log(`Found ${deprecatedComponents.length} deprecated components`);

  for (const deprecated of deprecatedComponents) {
    console.log(`\nProcessing deprecated component: ${deprecated.name}`);

    // Skip if already has a replacement
    if (deprecated.replacement) {
      console.log(`Component already has replacement: ${deprecated.replacement}`);
      continue;
    }

    // Find potential replacements based on naming patterns
    const potentialReplacements = await findPotentialReplacements(deprecated, registryService);
    
    if (potentialReplacements.length === 0) {
      console.log('No potential replacements found');
      continue;
    }

    console.log('Potential replacements:');
    potentialReplacements.forEach((replacement, index) => {
      console.log(`${index + 1}. ${replacement.name} (Confidence: ${replacement.confidence}%)`);
    });

    // Create mapping with highest confidence replacement
    const bestMatch = potentialReplacements[0];
    const mapping: ComponentMapping = {
      sourceComponent: {
        id: deprecated.id,
        name: deprecated.name,
        key: deprecated.key
      },
      targetComponent: {
        id: bestMatch.id,
        name: bestMatch.name,
        key: bestMatch.key
      },
      propertyMappings: generatePropertyMappings(deprecated, bestMatch.component),
      confidence: bestMatch.confidence,
      validationStatus: 'pending'
    };

    await registryService.addMapping(mapping);
    console.log(`Created mapping with ${bestMatch.name} (Confidence: ${bestMatch.confidence}%)`);
  }
}

interface PotentialReplacement {
  id: string;
  name: string;
  key: string;
  confidence: number;
  component: ComponentMetadata;
}

async function findPotentialReplacements(
  deprecated: ComponentMetadata,
  registryService: RegistryService
): Promise<PotentialReplacement[]> {
  const replacements: PotentialReplacement[] = [];
  
  // Get all non-deprecated components
  const allComponents = Object.values(await registryService.getComponent('') || {}) as ComponentMetadata[];
  const nonDeprecated = allComponents.filter(c => !c.deprecated);

  for (const component of nonDeprecated) {
    let confidence = 0;

    // Name similarity
    const deprecatedName = deprecated.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const componentName = component.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (componentName.includes(deprecatedName) || deprecatedName.includes(componentName)) {
      confidence += 40;
    }

    // Property similarity
    const deprecatedProps = Object.keys(deprecated.properties);
    const componentProps = Object.keys(component.properties);
    const commonProps = deprecatedProps.filter(p => componentProps.includes(p));
    
    confidence += (commonProps.length / Math.max(deprecatedProps.length, componentProps.length)) * 40;

    // Variant similarity
    if (deprecated.variants && component.variants) {
      const deprecatedVariantKeys = Object.keys(deprecated.variants);
      const componentVariantKeys = Object.keys(component.variants);
      const commonVariants = deprecatedVariantKeys.filter(k => componentVariantKeys.includes(k));
      
      confidence += (commonVariants.length / Math.max(deprecatedVariantKeys.length, componentVariantKeys.length)) * 20;
    }

    if (confidence > 30) { // Only include if confidence is above 30%
      replacements.push({
        id: component.id,
        name: component.name,
        key: component.key,
        confidence,
        component
      });
    }
  }

  // Sort by confidence
  return replacements.sort((a, b) => b.confidence - a.confidence);
}

function generatePropertyMappings(source: ComponentMetadata, target: ComponentMetadata): ComponentMapping['propertyMappings'] {
  const mappings: ComponentMapping['propertyMappings'] = {};

  // Map common properties
  Object.keys(source.properties).forEach(prop => {
    if (target.properties[prop]) {
      mappings[prop] = {
        targetProperty: prop,
        description: `Direct mapping of ${prop}`
      };
    }
  });

  // Add special case mappings
  if (source.name.includes('Button') && target.name.includes('Action')) {
    mappings['variant'] = {
      targetProperty: 'variant',
      transformation: (value: string) => {
        const buttonToActionMap: { [key: string]: string } = {
          'primary': 'primary',
          'secondary': 'secondary',
          'tertiary': 'tertiary',
          'danger': 'danger'
        };
        return buttonToActionMap[value] || value;
      },
      description: 'Maps Button variants to Action variants'
    };
  }

  return mappings;
}

// Run the script
mapComponents().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
}); 