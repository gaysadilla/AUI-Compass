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
const FILE_KEY = 'm53qXHtSGzqPNze050jhTp';
function getComponentDetails() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching components from Figma...');
        const response = yield figmaApi_1.figmaApi.getFileDetails(FILE_KEY, 30);
        if (response.status !== 200 || !response.data) {
            console.error('Error fetching file details:', response.error);
            return;
        }
        const document = response.data.document;
        const components = [];
        // Recursively collect components
        function collectComponents(node, fileKey) {
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
                node.children.forEach((child) => collectComponents(child, fileKey));
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
        }
        else {
            console.log('Deprecated Button component not found.');
        }
        if (actionComponent) {
            console.log('\nAction Component Details:');
            console.log(JSON.stringify(actionComponent, null, 2));
        }
        else {
            console.log('Action component not found.');
        }
    });
}
// Run the script
getComponentDetails().catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
