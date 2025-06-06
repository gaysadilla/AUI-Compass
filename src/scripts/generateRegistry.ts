import fs from 'fs/promises';
import path from 'path';
import { ComponentRegistry, ComponentMapping } from '../types/registry';

async function importMappingsFromDir(dir: string): Promise<ComponentMapping[]> {
  const mappings: ComponentMapping[] = [];
  const files = await fs.readdir(dir);
  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const filePath = path.join(dir, file);
      // Use dynamic import for ESM/TS compatibility
      const imported = await import(filePath);
      if (imported.default) {
        if (Array.isArray(imported.default)) {
          mappings.push(...imported.default);
        } else {
          mappings.push(imported.default);
        }
      }
    }
  }
  return mappings;
}

async function generateRegistry() {
  const deprecatedDir = path.join(__dirname, '../mappings/deprecated');
  const activeDir = path.join(__dirname, '../mappings/active');
  const registryPath = path.join(process.cwd(), 'data', 'registry.json');

  const deprecatedMappings = await importMappingsFromDir(deprecatedDir);
  // Optionally, import active mappings if needed
  // const activeMappings = await importMappingsFromDir(activeDir);

  // Build components and mappings from deprecated mappings
  const components: { [id: string]: any } = {};
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

  const registry: ComponentRegistry = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    components,
    mappings: deprecatedMappings,
    metadata: {
      totalComponents: Object.keys(components).length,
      deprecatedComponents: Object.values(components).filter((c: any) => c.deprecated).length,
      validatedMappings: deprecatedMappings.filter(m => m.validationStatus === 'validated').length,
      pendingMappings: deprecatedMappings.filter(m => m.validationStatus === 'pending').length,
    },
  };

  await fs.mkdir(path.dirname(registryPath), { recursive: true });
  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
  console.log('Registry generated at', registryPath);
}

generateRegistry().catch(err => {
  console.error('Error generating registry:', err);
  process.exit(1);
}); 