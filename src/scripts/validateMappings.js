"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const registryService_1 = require("../services/registryService");
function validateMappings() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Initializing registry service...');
        const registryService = new registryService_1.RegistryService();
        yield registryService.initialize();
        // Get all pending mappings
        const pendingMappings = yield registryService.getPendingMappings();
        console.log(`Found ${pendingMappings.length} pending mappings to validate`);
        const validationReport = {
            total: pendingMappings.length,
            validated: 0,
            rejected: 0,
            skipped: 0,
            details: []
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
                yield registryService.updateMapping(pendingMappings.indexOf(mapping), { validationStatus: 'validated', lastValidated: new Date().toISOString() });
                validationReport.validated++;
                validationReport.details.push({
                    source: mapping.sourceComponent.name,
                    target: mapping.targetComponent.name,
                    confidence: mapping.confidence,
                    status: 'validated'
                });
            }
            else {
                console.log('Rejecting mapping:', validationResult.reason);
                yield registryService.updateMapping(pendingMappings.indexOf(mapping), { validationStatus: 'rejected', notes: validationResult.reason });
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
    });
}
function validatePropertyMappings(componentMapping) {
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
            }
            catch (error) {
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
