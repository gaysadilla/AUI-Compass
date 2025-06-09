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
const PROJECT_ID = '2767604';
function getLibraryFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching library files...');
        // Get the project files
        const response = yield figmaApi_1.figmaApi.getProjectFiles(PROJECT_ID);
        if (response.status === 200 && response.data) {
            const files = response.data.files;
            if (files.length === 0) {
                console.log('No files found in this project.');
                return;
            }
            console.log('\nLibrary Files:');
            files.forEach((file) => {
                console.log(`\nFile Name: ${file.name}`);
                console.log(`File Key: ${file.key}`);
                console.log(`Last Modified: ${new Date(file.last_modified).toLocaleString()}`);
                console.log('------------------------');
            });
        }
        else {
            console.error('Error fetching files:', response.error);
            console.error('Response status:', response.status);
            console.error('Full response:', JSON.stringify(response, null, 2));
        }
    });
}
// Run the script
getLibraryFiles().catch(error => {
    console.error('Script error:', error);
});
