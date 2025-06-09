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
const figmaApi_1 = require("../figmaApi");
describe('FigmaApiService', () => {
    // Replace with your actual team ID
    const TEST_TEAM_ID = 'YOUR_TEAM_ID';
    it('should fetch team components', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield figmaApi_1.figmaApi.getTeamComponents(TEST_TEAM_ID);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
    }));
    it('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield figmaApi_1.figmaApi.getTeamComponents('invalid-team-id');
        expect(response.status).not.toBe(200);
        expect(response.error).toBeDefined();
    }));
});
