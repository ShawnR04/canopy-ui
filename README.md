# Canopy UI
An accessible, themable React UI component library built for fast-moving web applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/
licenses/MIT)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)


## 1. Complete Repository File Structure
```text
my-project/
├── public/ # Static assets, favicons, logos
├── src/
│ ├── app/ # Next.js App Router (Pages, layouts, API routes)
│ │ ├── api/ # Backend endpoints & webhook handlers
│ │ ├── dashboard/ # Authenticated user dashboard
│ │ ├── layout.tsx # Root application layout & providers
│ │ └── page.tsx # Public landing page
│ ├── components/ # Reusable UI components
│ │ ├── ui/ # Atomic design system components (buttons, modals)
│ │ └── forms/ # Interactive form schemas & inputs
│ ├── db/ # Database schemas, migrations & connection pool
│ │ ├── index.ts # Database client entry point
│ │ └── schema.ts # Table schemas (Drizzle / Prisma)
│ ├── hooks/ # Custom React client hooks
│ ├── lib/ # Utility helpers, validators, constants
│ └── types/ # Global TypeScript interfaces & types
├── .env.example # Environment configuration template
├── package.json # Dependencies and script definitions
├── tailwind.config.ts # Tailwind design system configurations
├── tsconfig.json # TypeScript compiler configuration
└── README.md
```

## 2. Project Initialization & Workspace Configuration
### 2.1 Workplace Setup Commands
```bash
# Create project folder, initalize git and initialize npm package
mkdir canopy-ui && cd canopy-ui
git init
npm init -y

# Install runtime dependancies needed for CLI terminal interactions
npm install commander @clack/prompts picocolors ora execa fs-extra

# Install developer tools; Typescript compiler and tsup high-speed ERM budler
npm install -D typescript @types/node @types/fs-extra tsup
```

### 2.2 CLI Configuration (`package.json`) - Documented
```json
{
  "name": "@marv3l/canopy-ui",
  "version": "1.0.0",
  "description": "An accessible, themable React UI component library built for fast-moving web applications.",
  "main": "./dist/index.js",
  "bin" : {
    "canopy-ui": "./dist/index.js"
  },
  "files": [
    "dist",
    "templates"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm --banner:js \"#!/usr/bin/env node\"",
    "dev": "tsup src/index.ts --format esm --watch",
    "prepublishOnly": "npm run build",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ShawnR04/canopy-ui.git"
  },
  "keywords": ["react", "ui", "toast", "shadcn", "components", "cli"],
  "author": "Shawn Rimai",
  "license": "MIT",
  "type": "commonjs",
  "bugs": {
    "url": "https://github.com/ShawnR04/canopy-ui/issues"
  },
  "homepage": "https://github.com/ShawnR04/canopy-ui#readme",
  "dependencies": {
    "@clack/prompts": "^1.7.0",
    "commander": "^15.0.0",
    "execa": "^10.0.1",
    "fs-extra": "^11.4.0",
    "ora": "^9.4.1",
    "picocolors": "^1.1.1"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^26.2.0",
    "tsup": "^8.5.1",
    "typescript": "^7.0.2"
  }
}
```
