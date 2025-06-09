"use strict";
/// <reference types="@figma/plugin-typings" />
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
// This file runs in the Figma environment
const constants_1 = require("./utils/constants");
const registryData_1 = require("./data/registryData");
console.log('AUI Compass: BACKEND LOADED');
// Show the UI
figma.showUI(__html__, {
    width: constants_1.UI_WIDTH,
    height: constants_1.UI_HEIGHT,
    title: 'AUI Compass',
    visible: true // Ensure UI is visible
});
console.log('UI window created');
// Handle messages from the UI
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('Received message from UI:', msg);
    try {
        switch (msg.type) {
            case constants_1.MESSAGE_TYPES.READY:
                console.log('UI is ready, sending initial data');
                // UI is ready, send initial data
                figma.ui.postMessage({
                    type: constants_1.MESSAGE_TYPES.INIT,
                    data: {
                        selection: figma.currentPage.selection.length,
                        currentPage: figma.currentPage.name
                    }
                });
                break;
            case constants_1.MESSAGE_TYPES.SEARCH:
                console.log('AUI Compass: BACKEND SEARCH HANDLER', msg.data);
                console.log('Search requested:', msg.data);
                // Determine scope
                const scope = ((_a = msg.data) === null || _a === void 0 ? void 0 : _a.scope) || 'selection';
                let nodes = [];
                function isSceneNode(node) {
                    return node.type !== 'PAGE';
                }
                if (scope === 'selection') {
                    nodes = figma.currentPage.selection;
                }
                else if (scope === 'page') {
                    nodes = figma.currentPage.findAll(isSceneNode);
                }
                else if (scope === 'file') {
                    nodes = figma.root.findAll(isSceneNode);
                }
                // Get deprecated components from registry
                const deprecatedComponents = Object.values(registryData_1.registryData.components).filter(c => c.deprecated);
                // Map component key to registry entry
                const deprecatedKeyMap = new Map(deprecatedComponents.map(c => [c.key, c]));
                // Find all instances of deprecated components
                const results = [];
                for (const component of deprecatedComponents) {
                    const instances = [];
                    for (const node of nodes) {
                        if (node.type === 'INSTANCE' && ((_b = node.mainComponent) === null || _b === void 0 ? void 0 : _b.key) === component.key) {
                            instances.push({
                                nodeId: node.id,
                                pageName: node.parent && 'name' in node.parent ? node.parent.name : figma.currentPage.name,
                            });
                        }
                    }
                    if (instances.length > 0) {
                        results.push({
                            key: component.key,
                            name: component.name,
                            deprecatedDate: component.lastModified,
                            instanceCount: instances.length,
                            instances,
                        });
                    }
                }
                figma.ui.postMessage({
                    type: constants_1.MESSAGE_TYPES.SEARCH_COMPLETE,
                    data: { components: results },
                });
                break;
            case constants_1.MESSAGE_TYPES.CANCEL:
                figma.closePlugin();
                break;
            default:
                console.warn('Unknown message type:', msg.type);
        }
    }
    catch (error) {
        console.error('Error handling message:', error);
        figma.ui.postMessage({
            type: constants_1.MESSAGE_TYPES.ERROR,
            data: { message: error instanceof Error ? error.message : 'An unknown error occurred' }
        });
    }
});
// Clean up function (important for good UX)
figma.on('close', () => {
    console.log('Plugin closing');
});
