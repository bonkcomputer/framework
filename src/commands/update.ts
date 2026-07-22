import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execa } from 'execa';
import semver from 'semver';
import fs from 'fs-extra';
import path from 'path';

interface UpdateOptions {
  check?: boolean;
}

export async function updateCommand(options: UpdateOptions = {}) {
  try {
    console.log(chalk.cyan('🔄 Checking for Bonk Computer Framework updates...\n'));

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      console.error(chalk.red('❌ No package.json found. Are you in a project directory?'));
      process.exit(1);
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const currentVersion = packageJson.dependencies?.['bonk-computer-framework-v2'] ||
                          packageJson.devDependencies?.['bonk-computer-framework-v2'] ||
                          packageJson.dependencies?.['@bonkcomputer/frameworkv2'] || 
                          packageJson.devDependencies?.['@bonkcomputer/frameworkv2'] ||
                          packageJson.dependencies?.['@bonkcomputer/framework'] ||
                          packageJson.dependencies?.['@bonk-computer/framework'];

    if (!currentVersion) {
      console.error(chalk.red('❌ Bonk Computer Framework not found in dependencies.'));
      process.exit(1);
    }

    const spinner = ora('🔍 Checking for updates...').start();
    
    try {
      // Check for latest version
      const { stdout } = await execa('npm', ['view', 'bonk-computer-framework-v2', 'version']);
      const latestVersion = stdout.trim();
      
      spinner.stop();

      const cleanCurrentVersion = semver.clean(currentVersion);
      const isUpdateAvailable = cleanCurrentVersion && semver.lt(cleanCurrentVersion, latestVersion);

      if (!isUpdateAvailable) {
        console.log(chalk.green('✅ You are using the latest version!'));
        console.log(chalk.dim(`Current version: ${currentVersion}`));
        return;
      }

      console.log(chalk.yellow('📦 Update available!'));
      console.log(chalk.dim(`Current: ${currentVersion}`));
      console.log(chalk.green(`Latest: ${latestVersion}`));

      if (options.check) {
        console.log(chalk.cyan('\nRun without --check flag to install updates.'));
        return;
      }

      // Ask user if they want to update
      const { shouldUpdate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldUpdate',
          message: 'Would you like to update now?',
          default: true,
        },
      ]);

      if (!shouldUpdate) {
        console.log(chalk.yellow('❌ Update cancelled.'));
        return;
      }

      // Detect package manager
      const packageManager = await detectPackageManager();
      
      // Update framework
      const updateSpinner = ora('📦 Updating Bonk Computer Framework...').start();
      
      try {
        await execa(packageManager, ['add', `bonk-computer-framework-v2@${latestVersion}`]);
        updateSpinner.succeed('✅ Framework updated successfully!');
      } catch (error) {
        updateSpinner.fail('❌ Failed to update framework');
        throw error;
      }

      // Update related dependencies
      const depsSpinner = ora('🔄 Updating related dependencies...').start();
      
      try {
        await updateRelatedDependencies(packageManager, packageJson);
        depsSpinner.succeed('✅ Dependencies updated!');
      } catch (error) {
        depsSpinner.fail('❌ Failed to update some dependencies');
        console.warn(chalk.yellow('Some dependencies may need manual updates.'));
      }

      // Run post-update tasks
      await runPostUpdateTasks(packageManager);

      console.log(chalk.green('\n🎉 Update completed successfully!'));
      console.log(chalk.dim('Run your development server to see the changes.'));

    } catch (error) {
      spinner.fail('❌ Failed to check for updates');
      throw error;
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Update failed:'));
    console.error(error);
    process.exit(1);
  }
}

async function detectPackageManager(): Promise<string> {
  const cwd = process.cwd();
  
  if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  
  if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  
  return 'npm';
}

async function updateRelatedDependencies(packageManager: string, packageJson: any) {
  const bonkDependencies = [
    '@solana/web3.js',
    '@solana/wallet-adapter-react',
    'solana-agent-kit',
    'solana-app-kit',
    'jupiverse-kit',
    '@e2b/code-interpreter',
    '@privy-io/react-auth',
    '@convex-dev/react',
    'convex',
    'ai',
    '@ai-sdk/anthropic',
    '@ai-sdk/openai',
  ];

  const currentDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const depsToUpdate = bonkDependencies.filter(dep => currentDeps[dep]);

  if (depsToUpdate.length > 0) {
    const updateArgs = packageManager === 'yarn' 
      ? ['add', ...depsToUpdate.map(dep => `${dep}@latest`)]
      : ['install', ...depsToUpdate.map(dep => `${dep}@latest`)];
    
    await execa(packageManager, updateArgs);
  }
}

async function runPostUpdateTasks(packageManager: string) {
  const spinner = ora('🔧 Running post-update tasks...').start();
  
  try {
    // Check if convex needs updating
    if (await fs.pathExists('convex')) {
      await execa('npx', ['convex', 'dev', '--once'], { stdio: 'pipe' });
    }

    // Update types if using TypeScript
    if (await fs.pathExists('tsconfig.json')) {
      await execa(packageManager, ['run', 'build'], { stdio: 'pipe' });
    }

    spinner.succeed('✅ Post-update tasks completed');
  } catch (error) {
    spinner.warn('⚠️ Some post-update tasks failed');
    console.warn(chalk.yellow('You may need to manually run build commands.'));
  }
}
