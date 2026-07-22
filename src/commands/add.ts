import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { copyComponentTemplate } from '../utils/template.js';

interface AddOptions {
  path?: string;
}

const AVAILABLE_COMPONENTS = {
  wallet: {
    name: '💳 Wallet Connection',
    description: 'Add wallet connection components with Privy.io integration',
    files: ['components/wallet-connect.tsx', 'providers/wallet-provider.tsx'],
  },
  swap: {
    name: '🔄 Token Swap',
    description: 'Add Jupiter-powered token swap interface',
    files: ['components/swap-interface.tsx', 'hooks/use-swap.ts'],
  },
  nft: {
    name: '🖼️ NFT Components',
    description: 'Add NFT minting and display components',
    files: ['components/nft-gallery.tsx', 'components/mint-nft.tsx', 'actions/nft-actions.ts'],
  },
  game: {
    name: '🎮 Game Components',
    description: 'Add real-time multiplayer game components with Convex',
    files: ['components/game-canvas.tsx', 'hooks/use-game.ts', 'convex/game.ts'],
  },
  defi: {
    name: '💰 DeFi Features',
    description: 'Add staking, lending, and yield farming components',
    files: ['components/staking-pool.tsx', 'components/lending-interface.tsx'],
  },
  ai: {
    name: '🤖 AI Integration',
    description: 'Add AI-powered features with Vercel AI SDK',
    files: ['components/ai-chat.tsx', 'actions/ai-actions.ts'],
  },
  vm: {
    name: '🖥️ E2B Sandbox',
    description: 'Add E2B code execution sandbox components',
    files: ['components/code-sandbox.tsx', 'lib/sandbox.ts'],
  },
  runpod: {
    name: '⚡ RunPod GPU Compute',
    description: 'Add RunPod serverless GPU endpoints and media execution hooks',
    files: ['components/runpod-gpu.tsx', 'lib/runpod.ts', 'hooks/use-runpod.ts'],
  },
  gmi: {
    name: '☁️ GMI Cloud Cluster',
    description: 'Add GMI Cloud enterprise H100/H200 cluster and vLLM integration',
    files: ['components/gmi-cluster.tsx', 'lib/gmi-cloud.ts', 'actions/gmi-actions.ts'],
  },
  gpu: {
    name: '🚀 Hybrid GPU Compute Hub',
    description: 'Add unified GPU orchestrator with Solana on-chain compute payments',
    files: ['components/gpu-compute-hub.tsx', 'lib/compute-router.ts', 'lib/solana-compute-pay.ts'],
  },
};

export async function addCommand(component: string, options: AddOptions = {}) {
  try {
    console.log(chalk.cyan('🔧 Adding component to your Bonk Computer project...\n'));

    // Check if we're in a Bonk Computer project
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      console.error(chalk.red('❌ No package.json found. Are you in a project directory?'));
      process.exit(1);
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const isBonkProject = packageJson.dependencies?.['bonk-computer-framework-v2'] ||
                         packageJson.dependencies?.['@bonkcomputer/frameworkv2'] ||
                         packageJson.dependencies?.['@bonkcomputer/framework'] ||
                         packageJson.dependencies?.['@bonk-computer/framework'] ||
                         packageJson.name?.includes('bonk') ||
                         packageJson.description?.includes('Bonk Computer');

    if (!isBonkProject) {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'This doesn\'t appear to be a Bonk Computer project. Continue anyway?',
          default: false,
        },
      ]);

      if (!proceed) {
        console.log(chalk.yellow('❌ Operation cancelled.'));
        process.exit(0);
      }
    }

    // Validate component type
    if (!AVAILABLE_COMPONENTS[component as keyof typeof AVAILABLE_COMPONENTS]) {
      console.log(chalk.yellow(`❓ Unknown component: ${component}\n`));
      console.log('Available components:');
      
      Object.entries(AVAILABLE_COMPONENTS).forEach(([key, info]) => {
        console.log(chalk.cyan(`  ${key}`), '-', info.name);
        console.log(chalk.dim(`    ${info.description}`));
      });
      
      process.exit(1);
    }

    const componentInfo = AVAILABLE_COMPONENTS[component as keyof typeof AVAILABLE_COMPONENTS];

    // Confirm installation
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Add ${componentInfo.name}?\n  ${chalk.dim(componentInfo.description)}`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('❌ Operation cancelled.'));
      process.exit(0);
    }

    // Get installation path
    let installPath = options.path || process.cwd();
    if (!options.path) {
      const { customPath } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'customPath',
          message: 'Use custom installation path?',
          default: false,
        },
      ]);

      if (customPath) {
        const { path: selectedPath } = await inquirer.prompt([
          {
            type: 'input',
            name: 'path',
            message: 'Enter the installation path:',
            default: './src',
          },
        ]);
        installPath = path.resolve(process.cwd(), selectedPath);
      }
    }

    // Install component
    const spinner = ora(`📦 Installing ${componentInfo.name}...`).start();
    try {
      await copyComponentTemplate(component, installPath, {
        projectName: packageJson.name,
      });
      
      // Update dependencies if needed
      await updateProjectDependencies(component, packageJsonPath);
      
      spinner.succeed(`✅ ${componentInfo.name} installed successfully`);
    } catch (error) {
      spinner.fail(`❌ Failed to install ${componentInfo.name}`);
      throw error;
    }

    // Show next steps
    console.log(chalk.green('\n🎉 Component added successfully!\n'));
    console.log('Files added:');
    componentInfo.files.forEach(file => {
      console.log(chalk.cyan(`  ${file}`));
    });

    console.log(chalk.dim('\n📚 Check the documentation for usage examples:'));
    console.log(chalk.dim('https://github.com/bonkcomputer/framework/docs'));

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to add component:'));
    console.error(error);
    process.exit(1);
  }
}

async function updateProjectDependencies(component: string, packageJsonPath: string) {
  const packageJson = await fs.readJson(packageJsonPath);
  let updated = false;

  const componentDependencies: Record<string, string[]> = {
    wallet: ['@privy-io/react-auth', '@solana/wallet-adapter-react'],
    swap: ['jupiverse-kit', '@solana/web3.js'],
    nft: ['@metaplex-foundation/js', '@solana/web3.js'],
    game: ['@convex-dev/react', 'convex'],
    defi: ['@solana/web3.js', '@coral-xyz/anchor'],
    ai: ['ai', '@ai-sdk/anthropic', '@ai-sdk/openai'],
    vm: ['@e2b/code-interpreter'],
    runpod: ['runpod-sdk'],
    gmi: ['@ai-sdk/openai'],
    gpu: ['runpod-sdk', '@solana/web3.js', '@e2b/code-interpreter'],
  };

  const deps = componentDependencies[component];
  if (deps) {
    for (const dep of deps) {
      if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies[dep] = 'latest';
        updated = true;
      }
    }
  }

  if (updated) {
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.yellow('\n📦 Dependencies updated. Run your package manager to install new packages.'));
  }
}
