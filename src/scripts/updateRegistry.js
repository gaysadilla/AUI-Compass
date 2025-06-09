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
const figmaApi_1 = require("../services/figmaApi");
const registryService_1 = require("../services/registryService");
const FILE_KEY = 'm53qXHtSGzqPNze050jhTp';
function updateRegistry() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Initializing registry service...');
        const registryService = new registryService_1.RegistryService();
        yield registryService.initialize();
        console.log('Fetching components from Figma...');
        const response = yield figmaApi_1.figmaApi.getFileDetails(FILE_KEY, 10);
        if (response.status !== 200 || !response.data) {
            console.error('Error fetching file details:', response.error);
            return;
        }
        const document = response.data.document;
        const components = [];
        // Recursively collect components
        function collectComponents(node, fileKey) {
            if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
                const component = {
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
                    Object.entries(node.properties).forEach(([key, value]) => {
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
                node.children.forEach((child) => collectComponents(child, fileKey));
            }
        }
        collectComponents(document, FILE_KEY);
        console.log(`Found ${components.length} components`);
        // Update registry with new components
        for (const component of components) {
            yield registryService.addComponent(component);
        }
        console.log('Registry updated successfully');
        console.log('Summary:');
        console.log(`- Total components: ${components.length}`);
        console.log(`- Deprecated components: ${components.filter(c => c.deprecated).length}`);
    });
}
// Run the script
updateRegistry().catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
