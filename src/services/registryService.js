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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class RegistryService {
    constructor(registryPath = path_1.default.join(process.cwd(), 'data', 'registry.json')) {
        this.registry = null;
        this.registryPath = registryPath;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield promises_1.default.access(this.registryPath);
                const data = yield promises_1.default.readFile(this.registryPath, 'utf-8');
                this.registry = JSON.parse(data);
            }
            catch (error) {
                // Create new registry if it doesn't exist
                this.registry = {
                    version: '1.0.0',
                    lastUpdated: new Date().toISOString(),
                    components: {},
                    mappings: [],
                    metadata: {
                        totalComponents: 0,
                        deprecatedComponents: 0,
                        validatedMappings: 0,
                        pendingMappings: 0
                    }
                };
                yield this.saveRegistry();
            }
        });
    }
    saveRegistry() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            // Ensure directory exists
            yield promises_1.default.mkdir(path_1.default.dirname(this.registryPath), { recursive: true });
            // Update metadata
            this.registry.lastUpdated = new Date().toISOString();
            this.registry.metadata = {
                totalComponents: Object.keys(this.registry.components).length,
                deprecatedComponents: Object.values(this.registry.components).filter(c => c.deprecated).length,
                validatedMappings: this.registry.mappings.filter(m => m.validationStatus === 'validated').length,
                pendingMappings: this.registry.mappings.filter(m => m.validationStatus === 'pending').length
            };
            yield promises_1.default.writeFile(this.registryPath, JSON.stringify(this.registry, null, 2));
        });
    }
    addComponent(component) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            this.registry.components[component.id] = component;
            yield this.saveRegistry();
        });
    }
    updateComponent(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            if (!this.registry.components[id])
                throw new Error(`Component ${id} not found`);
            this.registry.components[id] = Object.assign(Object.assign({}, this.registry.components[id]), updates);
            yield this.saveRegistry();
        });
    }
    addMapping(mapping) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            this.registry.mappings.push(mapping);
            yield this.saveRegistry();
        });
    }
    updateMapping(index, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            if (index < 0 || index >= this.registry.mappings.length) {
                throw new Error('Invalid mapping index');
            }
            this.registry.mappings[index] = Object.assign(Object.assign({}, this.registry.mappings[index]), updates);
            yield this.saveRegistry();
        });
    }
    getComponent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            return this.registry.components[id] || null;
        });
    }
    getDeprecatedComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            return Object.values(this.registry.components).filter(c => c.deprecated);
        });
    }
    getMappingsBySource(sourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            return this.registry.mappings.filter(m => m.sourceComponent.id === sourceId);
        });
    }
    getMappingsByTarget(targetId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            return this.registry.mappings.filter(m => m.targetComponent.id === targetId);
        });
    }
    getPendingMappings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.registry)
                throw new Error('Registry not initialized');
            return this.registry.mappings.filter(m => m.validationStatus === 'pending');
        });
    }
}
exports.RegistryService = RegistryService;
