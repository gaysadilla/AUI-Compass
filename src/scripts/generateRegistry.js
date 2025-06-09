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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
function importMappingsFromDir(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const mappings = [];
        const files = yield promises_1.default.readdir(dir);
        for (const file of files) {
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                const filePath = path_1.default.join(dir, file);
                // Use dynamic import for ESM/TS compatibility
                const imported = yield Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
                if (imported.default) {
                    if (Array.isArray(imported.default)) {
                        mappings.push(...imported.default);
                    }
                    else {
                        mappings.push(imported.default);
                    }
                }
            }
        }
        return mappings;
    });
}
function generateRegistry() {
    return __awaiter(this, void 0, void 0, function* () {
        const deprecatedDir = path_1.default.join(__dirname, '../mappings/deprecated');
        const activeDir = path_1.default.join(__dirname, '../mappings/active');
        const registryPath = path_1.default.join(process.cwd(), 'data', 'registry.json');
        const deprecatedMappings = yield importMappingsFromDir(deprecatedDir);
        // Optionally, import active mappings if needed
        // const activeMappings = await importMappingsFromDir(activeDir);
        // Build components and mappings from deprecated mappings
        const components = {};
        for (const mapping of deprecatedMappings) {
            components[mapping.sourceComponent.id] = {
                id: mapping.sourceComponent.id,
                name: mapping.sourceComponent.name,
                key: mapping.sourceComponent.key,
                deprecated: true,
            };
            components[mapping.targetComponent.id] = {
                id: mapping.targetComponent.id,
                name: mapping.targetComponent.name,
                key: mapping.targetComponent.key,
                deprecated: false,
            };
        }
        const registry = {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            components,
            mappings: deprecatedMappings,
            metadata: {
                totalComponents: Object.keys(components).length,
                deprecatedComponents: Object.values(components).filter((c) => c.deprecated).length,
                validatedMappings: deprecatedMappings.filter(m => m.validationStatus === 'validated').length,
                pendingMappings: deprecatedMappings.filter(m => m.validationStatus === 'pending').length,
            },
        };
        yield promises_1.default.mkdir(path_1.default.dirname(registryPath), { recursive: true });
        yield promises_1.default.writeFile(registryPath, JSON.stringify(registry, null, 2));
        console.log('Registry generated at', registryPath);
    });
}
generateRegistry().catch(err => {
    console.error('Error generating registry:', err);
    process.exit(1);
});
