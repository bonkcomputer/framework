import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TemplateConfig {
  projectName: string;
  useConvex?: boolean;
  useE2B?: boolean;
  useGpu?: boolean;
  packageManager?: string;
}

export async function getTemplateInfo(templateName: string) {
  const templatesDir = path.join(__dirname, '../../templates');
  const templatePath = path.join(templatesDir, templateName);
  
  if (!await fs.pathExists(templatePath)) {
    throw new Error(`Template "${templateName}" not found`);
  }
  
  const configPath = path.join(templatePath, 'template.json');
  if (await fs.pathExists(configPath)) {
    return await fs.readJson(configPath);
  }
  
  return {
    name: templateName,
    description: `${templateName} template for Bonk Computer Framework`,
  };
}

export async function copyTemplate(templateName: string, targetPath: string, config: TemplateConfig) {
  // Find the package root by looking for package.json
  let currentDir = __dirname;
  while (currentDir !== path.dirname(currentDir)) {
    if (await fs.pathExists(path.join(currentDir, 'package.json'))) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  
  const templatesDir = path.join(currentDir, 'templates');
  const templatePath = path.join(templatesDir, templateName);
  
  if (!await fs.pathExists(templatePath)) {
    throw new Error(`Template "${templateName}" not found at ${templatePath}`);
  }
  
  // Copy all template files
  await fs.copy(templatePath, targetPath, {
    filter: (src) => !src.includes('template.json'),
  });
  
  // Process template files with variables
  await processTemplateFiles(targetPath, config);
}

export async function copyComponentTemplate(componentName: string, targetPath: string, config: TemplateConfig) {
  const templatesDir = path.join(__dirname, '../../templates/components');
  const componentPath = path.join(templatesDir, componentName);
  
  if (!await fs.pathExists(componentPath)) {
    throw new Error(`Component template "${componentName}" not found`);
  }
  
  // Copy component files
  await fs.copy(componentPath, targetPath);
  
  // Process template files with variables
  await processTemplateFiles(targetPath, config);
}

async function processTemplateFiles(dirPath: string, config: TemplateConfig) {
  const files = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      await processTemplateFiles(filePath, config);
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.json') || file.name.endsWith('.md'))) {
      let content = await fs.readFile(filePath, 'utf-8');
      
      // Replace template variables
      content = content.replace(/{{PROJECT_NAME}}/g, config.projectName);
      content = content.replace(/{{PROJECT_NAME_KEBAB}}/g, kebabCase(config.projectName));
      content = content.replace(/{{PROJECT_NAME_PASCAL}}/g, pascalCase(config.projectName));
      content = content.replace(/{{USE_CONVEX}}/g, config.useConvex ? 'true' : 'false');
      content = content.replace(/{{USE_E2B}}/g, config.useE2B ? 'true' : 'false');
      content = content.replace(/{{USE_GPU}}/g, config.useGpu ? 'true' : 'false');
      content = content.replace(/{{PACKAGE_MANAGER}}/g, config.packageManager || 'pnpm');
      
      await fs.writeFile(filePath, content);
    }
  }
}

function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function pascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}
