import { RegistryService } from '../services/registryService';
import { ComponentMapping } from '../types/registry';

async function validateMappings() {
  console.log('Initializing registry service...');
  const registryService = new RegistryService();
  await registryService.initialize();

  // Get all pending mappings
  const pendingMappings = await registryService.getPendingMappings();
  console.log(`Found ${pendingMappings.length} pending mappings to validate`);

  const validationReport = {
    total: pendingMappings.length,
    validated: 0,
    rejected: 0,
    skipped: 0,
    details: [] as Array<{
      source: string;
      target: string;
      confidence: number;
      status: 'validated' | 'rejected' | 'skipped';
      reason?: string;
    }>
  };

  for (const mapping of pendingMappings) {
    console.log(`\nValidating mapping: ${mapping.sourceComponent.name} -> ${mapping.targetComponent.name}`);
    
    // Skip if confidence is too low
    if (mapping.confidence < 50) {
      console.log('Skipping: Confidence too low');
      validationReport.skipped++;
      validationReport.details.push({
        source: mapping.sourceComponent.name,
        target: mapping.targetComponent.name,
        confidence: mapping.confidence,
        status: 'skipped',
        reason: 'Confidence too low'
      });
      continue;
    }

    // Validate property mappings
    const validationResult = validatePropertyMappings(mapping);
    
    if (validationResult.isValid) {
      console.log('Validating mapping...');
      await registryService.updateMapping(
        pendingMappings.indexOf(mapping),
        { validationStatus: 'validated', lastValidated: new Date().toISOString() }
      );
      validationReport.validated++;
      validationReport.details.push({
        source: mapping.sourceComponent.name,
        target: mapping.targetComponent.name,
        confidence: mapping.confidence,
        status: 'validated'
      });
    } else {
      console.log('Rejecting mapping:', validationResult.reason);
      await registryService.updateMapping(
        pendingMappings.indexOf(mapping),
        { validationStatus: 'rejected', notes: validationResult.reason }
      );
      validationReport.rejected++;
      validationReport.details.push({
        source: mapping.sourceComponent.name,
        target: mapping.targetComponent.name,
        confidence: mapping.confidence,
        status: 'rejected',
        reason: validationResult.reason
      });
    }
  }

  // Print validation report
  console.log('\nValidation Report:');
  console.log('-----------------');
  console.log(`Total mappings: ${validationReport.total}`);
  console.log(`Validated: ${validationReport.validated}`);
  console.log(`Rejected: ${validationReport.rejected}`);
  console.log(`Skipped: ${validationReport.skipped}`);
  
  console.log('\nDetailed Results:');
  validationReport.details.forEach(detail => {
    console.log(`\n${detail.source} -> ${detail.target}`);
    console.log(`Confidence: ${detail.confidence}%`);
    console.log(`Status: ${detail.status}`);
    if (detail.reason) {
      console.log(`Reason: ${detail.reason}`);
    }
  });
}

function validatePropertyMappings(componentMapping: ComponentMapping): { isValid: boolean; reason?: string } {
  // Check if there are any property mappings
  if (Object.keys(componentMapping.propertyMappings).length === 0) {
    return {
      isValid: false,
      reason: 'No property mappings defined'
    };
  }

  // Check for required property mappings
  const requiredProperties = ['variant', 'size', 'state'];
  const missingRequired = requiredProperties.filter(prop => !componentMapping.propertyMappings[prop]);
  
  if (missingRequired.length > 0) {
    return {
      isValid: false,
      reason: `Missing required property mappings: ${missingRequired.join(', ')}`
    };
  }

  // Validate transformation functions
  for (const [sourceProp, propMapping] of Object.entries(componentMapping.propertyMappings)) {
    if (propMapping.transformation) {
      try {
        // Test transformation with a sample value
        const testValue = 'test';
        propMapping.transformation(testValue);
      } catch (error) {
        return {
          isValid: false,
          reason: `Invalid transformation function for property ${sourceProp}`
        };
      }
    }
  }

  return { isValid: true };
}

// Run the script
validateMappings().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
}); 