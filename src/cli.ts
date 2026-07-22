import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { updateCommand } from './commands/update.js';

const program = new Command();

console.log(chalk.cyan(`
🐶💻 Bonk Computer Framework
Production-grade Solana Web3 development toolkit
`));

program
  .name('bonk-computer-framework')
  .description('CLI for creating Solana Web3 applications with the Bonk Computer Framework')
  .version('1.0.2');

program
  .command('init')
  .description('Initialize a new Bonk Computer project')
  .argument('[project-name]', 'Name of the project')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--skip-deps', 'Skip dependency installation')
  .option('--skip-git', 'Skip git initialization')
  .action(initCommand);

program
  .command('add')
  .description('Add components, pages, or features to your project')
  .argument('<component>', 'Component type to add (wallet, swap, nft, game, etc.)')
  .option('-p, --path <path>', 'Custom path for the component')
  .action(addCommand);

program
  .command('update')
  .description('Update framework dependencies and templates')
  .option('--check', 'Check for updates without installing')
  .action(updateCommand);

program.parse();
