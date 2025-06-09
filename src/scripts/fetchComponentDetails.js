"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const fs = __importStar(require("fs/promises"));
function fetchButtonAndActionComponents() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Get team components (Button & Action)
            const teamComponents = yield figmaApi_1.figmaApi.get('/teams/{TEAM_ID}/components');
            // Step 2: Filter for target components
            const buttonComponent = teamComponents.data.meta.components.find((c) => c.name.includes('🛑 Button') && c.name.toLowerCase().includes('deprecated'));
            const actionComponent = teamComponents.data.meta.components.find((c) => c.name.includes('🟢 Action'));
            if (!buttonComponent || !actionComponent) {
                throw new Error('Could not find target components');
            }
            // Step 3: Get detailed component data
            const buttonDetails = yield fetchComponentDetails(buttonComponent);
            const actionDetails = yield fetchComponentDetails(actionComponent);
            // Step 4: Export to JSON
            yield fs.writeFile('button-deprecated.json', JSON.stringify(buttonDetails, null, 2), 'utf8');
            yield fs.writeFile('action-current.json', JSON.stringify(actionDetails, null, 2), 'utf8');
            console.log('Components exported successfully!');
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
function fetchComponentDetails(component) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Get the file key from component
        const fileKey = ((_a = component.containing_frame) === null || _a === void 0 ? void 0 : _a.file_key) || component.file_key;
        if (!fileKey) {
            throw new Error('No file key found for component');
        }
        // Fetch node details with properties
        const nodeResponse = yield figmaApi_1.figmaApi.get(`/files/${fileKey}/nodes?ids=${component.node_id}`);
        const nodeData = nodeResponse.data.nodes[component.node_id];
        return {
            metadata: component,
            nodeData: nodeData,
            properties: extractProperties(nodeData),
            variants: extractVariants(nodeData)
        };
    });
}
function extractProperties(nodeData) {
    var _a;
    // Extract component properties from node data
    return ((_a = nodeData.document) === null || _a === void 0 ? void 0 : _a.componentPropertyDefinitions) || {};
}
function extractVariants(nodeData) {
    var _a;
    // Extract variants from component set or component
    const variants = [];
    if (((_a = nodeData.document) === null || _a === void 0 ? void 0 : _a.type) === 'COMPONENT_SET') {
        // Handle component set variants
        variants.push(...nodeData.document.children.map((child) => ({
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
