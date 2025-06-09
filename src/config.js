"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIGMA_PAT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Figma API Configuration
exports.FIGMA_PAT = process.env.FIGMA_PAT || '';
// Add other configuration constants here as needed 
