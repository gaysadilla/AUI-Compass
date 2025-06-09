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
exports.figmaApi = void 0;
const config_1 = require("../config");
class FigmaApiService {
    constructor() {
        this.baseUrl = 'https://api.figma.com/v1';
        this.headers = {
            'X-Figma-Token': config_1.FIGMA_PAT,
            'Content-Type': 'application/json',
        };
    }
    makeRequest(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, options = {}) {
            try {
                const response = yield fetch(`${this.baseUrl}${endpoint}`, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, this.headers), options.headers) }));
                const data = yield response.json();
                if (!response.ok) {
                    return {
                        status: response.status,
                        error: data.message || 'An error occurred',
                    };
                }
                return {
                    status: response.status,
                    data,
                };
            }
            catch (error) {
                return {
                    status: 500,
                    error: error instanceof Error ? error.message : 'An unknown error occurred',
                };
            }
        });
    }
    // Get project files
    getProjectFiles(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(`/projects/${projectId}/files`);
        });
    }
    // Get file nodes
    getFileNodes(fileKey, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(`/files/${fileKey}/nodes?ids=${ids.join(',')}`);
        });
    }
    // Get file details with depth
    getFileDetails(fileKey_1) {
        return __awaiter(this, arguments, void 0, function* (fileKey, depth = 2) {
            return this.makeRequest(`/files/${fileKey}?depth=${depth}`);
        });
    }
    // Get team components
    getTeamComponents(teamId_1) {
        return __awaiter(this, arguments, void 0, function* (teamId, pageSize = 100) {
            return this.makeRequest(`/teams/${teamId}/components?page_size=${pageSize}`);
        });
    }
    // Get component sets
    getComponentSets(teamId_1) {
        return __awaiter(this, arguments, void 0, function* (teamId, pageSize = 100) {
            return this.makeRequest(`/teams/${teamId}/component_sets?page_size=${pageSize}`);
        });
    }
    // Get component details
    getComponentDetails(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(`/components/${key}`);
        });
    }
    // Generic GET request
    get(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(endpoint);
        });
    }
}
exports.figmaApi = new FigmaApiService();
