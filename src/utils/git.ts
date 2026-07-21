import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

export async function initGit(projectPath: string) {
  const spinner = ora('🔧 Initializing git repository...').start();
  
  try {
    // Check if git is available
    await execa('git', ['--version'], { stdio: 'pipe' });
    
    // Initialize git repo
    await execa('git', ['init'], { cwd: projectPath, stdio: 'pipe' });
    
    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(projectPath, '.gitignore');
    if (!await fs.pathExists(gitignorePath)) {
      await createGitignore(gitignorePath);
    }
    
    // Add and commit initial files
    await execa('git', ['add', '.'], { cwd: projectPath, stdio: 'pipe' });
    await execa('git', ['commit', '-m', 'Initial commit from Bonk Computer Framework'], { 
      cwd: projectPath, 
      stdio: 'pipe' 
    });
    
    spinner.succeed('✅ Git repository initialized');
  } catch (error) {
    spinner.warn('⚠️ Git initialization failed');
    console.warn(chalk.yellow('You may need to initialize git manually:'));
    console.warn(chalk.cyan(`cd ${projectPath} && git init`));
  }
}

async function createGitignore(gitignorePath: string) {
  const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Production
build/
dist/
out/

# Environment variables & secrets
.env
.env.*
*.env
*.pem
*.key
*.secret
*.keystore
id_rsa*
secrets/

# Chat context & memory files
chatcontextmemory.md
chatcontextmemory*.md

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# ESLint cache
.eslintcache

# Typescript cache
*.tsbuildinfo

# Next.js
.next/

# Convex
.convex/

# MicroVM & GPU Cloud Caches
.e2b/
.runpod/
.gmi/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary folders
tmp/
temp/

# Solana
.solana/
target/
`;

  await fs.writeFile(gitignorePath, gitignoreContent);
}
