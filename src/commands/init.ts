import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execa } from 'execa';
import validatePackageName from 'validate-npm-package-name';
import { getTemplateInfo, copyTemplate } from '../utils/template.js';
import { installDependencies } from '../utils/install.js';
import { initGit } from '../utils/git.js';

interface InitOptions {
  template?: string;
  skipDeps?: boolean;
  skipGit?: boolean;
}

export async function initCommand(projectName?: string, options: InitOptions = {}) {
  try {
    console.log(chalk.cyan('🚀 Creating your Bonk Computer project...\n'));

    // Get project name if not provided
    let finalProjectName = projectName;
    if (!finalProjectName) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is your project name?',
          default: 'my-bonk-app',
          validate: (input: string) => {
            const validation = validatePackageName(input);
            if (!validation.validForNewPackages) {
              return validation.errors?.[0] || validation.warnings?.[0] || 'Invalid package name';
            }
            return true;
          },
        },
      ]);
      finalProjectName = name;
    }

    // Validate project name
    if (!finalProjectName) {
      console.error(chalk.red('❌ Project name is required'));
      process.exit(1);
    }

    const validation = validatePackageName(finalProjectName);
    if (!validation.validForNewPackages) {
      console.error(chalk.red(`❌ Invalid project name: ${validation.errors?.[0] || validation.warnings?.[0]}`));
      process.exit(1);
    }

    const projectPath = path.resolve(process.cwd(), finalProjectName);

    // Check if directory already exists
    if (await fs.pathExists(projectPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory "${finalProjectName}" already exists. Do you want to overwrite it?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('❌ Operation cancelled.'));
        process.exit(0);
      }

      await fs.remove(projectPath);
    }

    // Get template selection
    let template = options.template || 'default';
    if (!options.template) {
      const { selectedTemplate } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTemplate',
          message: 'Which template would you like to use?',
          choices: [
            { name: '🚀 Default - Full-stack Solana dApp with all features', value: 'default' },
            { name: '🎮 Game - Real-time multiplayer game template', value: 'game' },
            { name: '🏪 DeFi - Decentralized exchange and trading', value: 'defi' },
            { name: '🖼️ NFT - NFT marketplace and minting', value: 'nft' },
            { name: '⚡ Minimal - Basic Solana integration only', value: 'minimal' },
          ],
        },
      ]);
      template = selectedTemplate;
    }

    // Get additional configuration
    const config = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useConvex',
        message: 'Enable real-time features with Convex?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'useE2B',
        message: 'Enable E2B sandboxes for code execution?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'useGpu',
        message: 'Enable GPU Cloud compute (RunPod.io & GMI.cloud)?',
        default: true,
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Which package manager would you like to use?',
        choices: ['pnpm', 'npm', 'yarn'],
        default: 'pnpm',
      },
    ]);

    // Create project directory
    await fs.ensureDir(projectPath);

    // Copy template files
    const spinner = ora('📦 Setting up project structure...').start();
    try {
      await copyTemplate(template, projectPath, {
        projectName: finalProjectName,
        ...config,
      });
      spinner.succeed('📦 Project structure created');
    } catch (error) {
      spinner.fail('❌ Failed to create project structure');
      throw error;
    }

    // Install dependencies
    if (!options.skipDeps) {
      await installDependencies(projectPath, config.packageManager);
    }

    // Initialize git
    if (!options.skipGit) {
      await initGit(projectPath);
    }

    // Success message
    console.log(chalk.green('\n🎉 Success! Your Bonk Computer project is ready.\n'));
    
    console.log('Next steps:');
    console.log(chalk.cyan(`  cd ${finalProjectName}`));
    
    if (options.skipDeps) {
      console.log(chalk.cyan(`  ${config.packageManager} install`));
    }
    
    console.log(chalk.cyan('  cp .env.example .env.local'));
    console.log(chalk.cyan('  # Add your API keys to .env.local'));
    console.log(chalk.cyan(`  ${config.packageManager} run dev`));
    
    console.log(chalk.dim('\n📚 Documentation: https://github.com/bonkcomputer/framework'));
    console.log(chalk.dim('💬 Community: https://discord.gg/bonk'));

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to create project:'));
    console.error(error);
    process.exit(1);
  }
}
