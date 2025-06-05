import { figmaApi } from '../services/figmaApi';

const PROJECT_ID = '2767604';

async function getLibraryFiles() {
  console.log('Fetching library files...');
  
  // Get the project files
  const response = await figmaApi.getProjectFiles(PROJECT_ID);
  
  if (response.status === 200 && response.data) {
    const files = response.data.files;
    
    if (files.length === 0) {
      console.log('No files found in this project.');
      return;
    }

    console.log('\nLibrary Files:');
    files.forEach((file: any) => {
      console.log(`\nFile Name: ${file.name}`);
      console.log(`File Key: ${file.key}`);
      console.log(`Last Modified: ${new Date(file.last_modified).toLocaleString()}`);
      console.log('------------------------');
    });
  } else {
    console.error('Error fetching files:', response.error);
    console.error('Response status:', response.status);
    console.error('Full response:', JSON.stringify(response, null, 2));
  }
}

// Run the script
getLibraryFiles().catch(error => {
  console.error('Script error:', error);
}); 