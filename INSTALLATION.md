# Installing the Bonk Computer Framework V2

## 🔧 Package Names

Use the following package names depending on which generation you are installing:

- V2: `bonk-computer-framework-v2`
- Legacy V1: `@bonkcomputer/framework`

The V2 package is the recommended path for all new installs and project generation.

## 🚀 Install

### Global Installation (recommended)

```bash
npm install -g bonk-computer-framework-v2
# or
pnpm add -g bonk-computer-framework-v2
# or
yarn global add bonk-computer-framework-v2
```

### One-off Use

```bash
npx bonk-computer-framework-v2@latest init my-bonk-app
```

### Legacy V1 Installation

If you are still following older documentation or supporting a V1 project, the legacy install path is:

```bash
npm install -g @bonkcomputer/framework
```

## 🧩 Usage Commands

```bash
# Create new project
bonk-computer-framework init my-project
bcf init my-project

# Create a project from a template
bcf init my-game --template game
bcf init my-defi-app --template defi
bcf init my-nft-marketplace --template nft
bcf init simple-app --template minimal

# Add components
bcf add wallet
bcf add swap
bcf add nft
bcf add runpod
bcf add gmi
bcf add gpu

# Update framework
bcf update
```

## 📦 Package Structure

```
bonk-computer-framework/
├── src/                       # Source code
│   ├── cli.ts                # CLI entry point
│   ├── index.ts              # Package exports
│   ├── commands/             # CLI commands
│   │   ├── init.ts           # Project initialization
│   │   ├── add.ts            # Component addition
│   │   └── update.ts         # Framework updates
│   └── utils/                # Utility functions
│       ├── template.ts       # Template processing
│       ├── install.ts        # Dependency management
│       └── git.ts            # Git operations
├── templates/                # Project templates
│   ├── default/              # Default template
│   └── components/           # Component templates
├── dist/                     # Built output (generated)
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript config
├── tsup.config.ts            # Build configuration
└── biome.json                # Linting/formatting
```

## 🏗️ Template System

The framework uses a template system where:

1. **Templates** are stored in `templates/` directory
2. **Variables** like `{{PROJECT_NAME}}` are replaced during project creation
3. **Components** can be added incrementally using `bcf add`

### Available Templates For You To Build With NOW❗❗❗

- `default` - Full-stack Solana dApp
- `minimal` - Basic setup
- `game` - Multiplayer game template
- `defi` - DeFi application template
- `nft` - NFT marketplace template

### Template Variables

- `{{PROJECT_NAME}}` - Project display name
- `{{PROJECT_NAME_KEBAB}}` - kebab-case version
- `{{PROJECT_NAME_PASCAL}}` - PascalCase version
- `{{USE_CONVEX}}` - Boolean for Convex integration
- `{{USE_E2B}}` - Boolean for E2B integration
- `{{USE_GPU}}` - Boolean for RunPod/GMI Cloud GPU integration
- `{{PACKAGE_MANAGER}}` - User's package manager choice

## 🔍 Troubleshooting

### TypeScript Errors During Development

The TypeScript errors you see are expected during development since the dependencies aren't installed in the CLI package itself. They will be resolved when:

1. The package is built with `tsup`
2. Users install the generated projects with proper dependencies

### Missing Dependencies

If you see import errors, ensure all dependencies are listed in `package.json`:

```json
{
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^11.1.0",
    "execa": "^8.0.1",
    "fs-extra": "^11.2.0",
    "inquirer": "^9.2.12",
    "ora": "^7.0.1",
    "semver": "^7.5.4",
    "validate-npm-package-name": "^5.0.0"
  }
}
```

### Template Issues

If templates aren't copying correctly:

1. Check the `templates/` directory structure
2. Ensure template variables are properly formatted
3. Verify file paths in template copying logic

## 🚀 Next Steps

1. **Build and test** the package locally
2. **Create additional templates** for different use cases
3. **Add more components** to the component library
4. **Publish to NPM** for public use
5. **Create documentation** and examples

## 📖 Similar Projects

This package structure follows patterns from:

- `create-next-app`
- `create-react-app` 
- `@next-forge/cli`
- `create-t3-app`

The goal is to provide the same developer experience for Solana Web3 development.
