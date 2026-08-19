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
npm install commander @clack/prompts picocolors ora execa fs-extra lucide-react

# Install developer tools; Typescript compiler and tsup high-speed ERM budler
npm install -D typescript @types/node @types/fs-extra tsup
```

### 2.2 CLI Configuration (`package.json`) - Documented
### <kbd>package.json</kbd>
```json
{
  "name": "@marv3l/canopy-ui",
  "version": "1.0.0",
  "description": "An accessible, themable React UI component library built for fast-moving web applications.",
  "main": "./dist/index.js",
  "bin": {
    "canopy-ui": "./dist/index.js"
  },
  "files": [
    "dist",
    "templates"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run build",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ShawnR04/canopy-ui.git"
  },
  "keywords": [
    "react",
    "ui",
    "toast",
    "shadcn",
    "components",
    "cli"
  ],
  "author": "Shawn Rimai",
  "license": "MIT",
  "type": "module",
  "bugs": {
    "url": "https://github.com/ShawnR04/canopy-ui/issues"
  },
  "homepage": "https://github.com/ShawnR04/canopy-ui#readme",
  "dependencies": {
    "@clack/prompts": "^1.7.0",
    "commander": "^15.0.0",
    "execa": "^10.0.1",
    "fs-extra": "^11.4.0",
    "lucide-react": "^1.31.0",
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

### 2.4 Create a `tsup.config.ts` file in the Root directory
### <kbd>tsup.config.ts</kbd>
```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
```

### 2.4 Typescript Configuration (`tsconfig.json`) - Documented

#### Creeate the `tsconfig.json` file
```bash
npx tsc --init
```
### <kbd>tsconfig.json</kbd>
```json
{
  // Visit https://aka.ms/tsconfig to read more about this file
  "compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "./dist",

    // Environment Settings
    // See also https://aka.ms/tsconfig/module
    "module": "nodenext",
    "target": "es2022",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "types": ["node],
    // For nodejs:
    // "lib": ["esnext"],
    // "types": ["node"],
    // and npm install -D @types/node

    // Other Outputs
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    // "noFallthroughCasesInSwitch": true,
    // "noPropertyAccessFromIndexSignature": true,

    // Recommended Options
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}

```

## 3. Toast Component Source Code
These files live inside the `templates/toast/` directory of the CLI repository and get written into the customer's `components/ui/` directory

### 3.1 Toast State Management Engine (`templates/toast/use-toast.ts`)
### <kbd>templates/toast/use-toast.ts</kbd>
```ts
"use client";

// Import React runtime and component types
import * as React from "react";
// Import semantic SVG icons from lucide-react
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
// Import toast hook and type interfaces
import { useToast, ToastItem } from "./use-toast";

// Props accepted by the root Toaster container mounted in the root layout
export interface ToasterProps {
  // Global lifespan (in milliseconds) for all toasts; defaults to 4000ms
  defaultDuration?: number;
  // Screen viewport placement position
  position?: "top-right" | "bottom-right" | "top-center" | "bottom-center" | "top-left" | "bottom-left";
}

// Visual preset configurations mapped to your semantic theme tokens
const variantStyles: Record<
  string,
  { bg: string; border: string; text: string; progress: string; icon: any }
> = {
  default: {
    bg: "bg-card",
    border: "border-border",
    text: "text-card-foreground",
    progress: "bg-foreground/20",
    icon: null,
  },
  success: {
    bg: "bg-success-bg",
    border: "border-success/40",
    text: "text-success",
    progress: "bg-success",
    icon: CheckCircle2,
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    progress: "bg-destructive",
    icon: AlertCircle,
  },
  warning: {
    bg: "bg-warning-bg",
    border: "border-warning/40",
    text: "text-warning",
    progress: "bg-warning",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-accent",
    border: "border-primary/30",
    text: "text-accent-foreground",
    progress: "bg-primary",
    icon: Info,
  },
};

// Root Toaster Component placed into layout.tsx
export function Toaster({ defaultDuration = 4000, position = "top-center" }: ToasterProps) {
  const { toasts, dismiss } = useToast();

  const positionClasses = {
    "top-right": "top-4 right-4 items-end",
    "top-left": "top-4 left-4 items-start",
    "bottom-right": "bottom-4 right-4 items-end",
    "bottom-left": "bottom-4 left-4 items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  }[position];

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>

      <div className={`fixed z-50 pointer-events-none flex flex-col gap-2 p-4 w-full max-w-sm ${positionClasses}`}>
        {toasts.map((item) => (
          <ToastElement
            key={item.id}
            toast={item}
            defaultDuration={defaultDuration}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </>
  );
}

// Atomic Toast Card Component
function ToastElement({
  toast,
  defaultDuration,
  onDismiss,
}: {
  toast: ToastItem;
  defaultDuration: number;
  onDismiss: () => void;
}) {
  const duration = toast.duration ?? defaultDuration;

  React.useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const variant = toast.variant || "default";
  const defaultStyle = variantStyles[variant] || variantStyles.default;
  const IconComponent = defaultStyle.icon;

  // 1. Only build inline styles for values that are explicitly provided
  const customInlineStyle: React.CSSProperties = {};
  if (toast.customColor?.bg) customInlineStyle.backgroundColor = toast.customColor.bg;
  if (toast.customColor?.border) customInlineStyle.borderColor = toast.customColor.border;
  if (toast.customColor?.text) customInlineStyle.color = toast.customColor.text;

  // 2. Prevent default Tailwind classes from overriding user custom classes or inline styles
  const userHasBg = Boolean(toast.customColor?.bg || toast.className?.match(/(?:^|\s)bg-/));
  const userHasBorder = Boolean(toast.customColor?.border || toast.className?.match(/(?:^|\s)border-/));
  const userHasText = Boolean(toast.customColor?.text || toast.className?.match(/(?:^|\s)text-/));

  return (
    <div
      style={customInlineStyle}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 w-full p-4 rounded-[var(--radius-lg,0.625rem)] border shadow-lg transition-all duration-200 backdrop-blur-sm ${
        !userHasBg ? defaultStyle.bg : ""
      } ${!userHasBorder ? defaultStyle.border : ""} ${
        !userHasText ? defaultStyle.text : ""
      } ${toast.className || ""}`}
    >
      {/* Render icon if preset defines one */}
      {IconComponent && (
        <IconComponent
          className="w-5 h-5 mt-0.5 shrink-0"
          style={{ color: toast.customColor?.icon }}
        />
      )}

      {/* Toast Content Area */}
      <div className="flex-1 text-sm space-y-1">
        {toast.title && <div className="font-semibold leading-tight">{toast.title}</div>}
        {toast.description && (
          <div className="opacity-90 leading-relaxed text-xs">
            {toast.description}
          </div>
        )}
        {toast.action && <div className="pt-1">{toast.action}</div>}
      </div>

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-foreground/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Animated Lifespan Progress Bar */}
      {duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
            !toast.customColor?.progress ? defaultStyle.progress : ""
          }`}
          style={{
            backgroundColor: toast.customColor?.progress,
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}
```

### 3.2 Toast UI Container and Renderer (`templates/toast/toast.tsx`)
### <kbd>templates/toast/toast.tsx</kbd>
```tsx
// Import React runtime and component types
import * as React from "react";
// Import semantic sVG icons from lucide-react
import { CheckCircle2, AlertCircle, AlertTriangle, Info ,X} from "lucide-react";
// Import toast hook and type interfaces
import { useToast, ToastItem } from "./use-toast";

// Props accepted by the root Toaster container mounted in the root layout
export interface ToasterProps {
    // Global lifespan (in milliseconds) for all toasts; defaults to 400ms
    defaultDuration?: number;
    //Screen viewport placement position
    position?: "top-right" | "bottom-right" | "top-center" | "bottom-center" | "top-left" | "bottom-left";
}
// Visual preset configurations defining Tailwind colors and associated icons
//TODO: Add `progress: string` in the dictionary
const variantSyles : Record<string, {bg: string; border: string; text: string; icon: any}> = {
    //Neutral default theme
    default: {
        bg: "bg-slate-900",
        border: "border-slate-800",
        text: "text-slate-100",
        //progress: "bg-slate-100",
        icon: null,
    },

    //Success preset: Emerald theme with Check icon
    success: {
        bg: "bg-emerald-950/90",
        border: "border-emerald-700/60",
        text: "text-emerald-200",
        //progress: "text-emerald-200",
        icon: CheckCircle2
    },

    // Error preset: Rose theme with AlertCircle
    error: {
        bg: "bg-rose-950/90",
        border: "border-rose-700/60",
        text: "text-rose-200",
        //progress: "text-rose-200",
        icon: AlertCircle
    },

    //Warning preset: Amber theme with AlertTriangle icon
    warning: {
        bg: "bg-amber-950/90",
        border: "border-amber-700/60",
        text: "text-amber-200",
        //progress: "text-amber-200",
        icon: AlertTriangle
    },

    //Informational preset: Sky blue theme with Info iocn
    info: {
        bg: "bg-sky-950/90",
        border: "border-sky-700/60",
        text: "text-sky-200",
        //progress: "text-sky-200",
        icon: Info
    },
}

// Root Toaster Component placed into layout.tsx
export function Toaster({ defaultDuration = 400, position = "top-center"}: ToasterProps){
    // Extract real-time toast arary and dismiss helper from custom hook
    const { toasts, dismiss } = useToast();

    // Map position prop to Tailwind absolute positioning classes
    const positionClasses = {
        "top-right" : "top-4 right-4 items-end",
        "top-left" : "top-4 left-4 items-start",
        "bottom-right" : "bottom-4 right-4 items-end",
        "bottom-left" : "bottom-4 left-4 items-start",
        "top-center" : "top-4 left-1/2 -translate-x-1/2 items-center",
        "bottom-center" : "bottom-4 left-1/2 -translate-x-1/2 items-center",
    }[position];

    return (
        // Fixed viewport container ; pointer-events-none ensures it doesn't block background clicks
        <div className={`fixed z-50 pointer-none flex flex-col gap-2 p-4 w-full max-w-sm ${positionClasses}`}>
            {/* Map through active toast state and render atomic  toast items */}
            {toasts.map((item) => (
                <ToastElement
                    key={item.id}
                    toast={item}
                    defaultDuration={defaultDuration}
                    onDismiss={() => dismiss(item.id)}
                />
            ))}
        </div>
    );
}

// Atomic Toast Card Component
function ToastElement({
    toast,
    defaultDuration,
    onDismiss,
}: {
    toast: ToastItem;
    defaultDuration: number;
    onDismiss: () => void;
}) {
    // Priority: toast.duration > layout defaultDuration
    const duration = toast.duration ?? defaultDuration;

    // Set up auto-dismiss timer on component mount
    React.useEffect(() => {
        // If duration is set to <= 0, toast stays on screen indefinitely until manual dismissal
        if (duration <= 0) return;
        // Schedule dismissal
        const timer = setTimeout(() => {
            onDismiss();
        }, duration);
        // Clean up timer when toast unmounts or duration changes
        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    // Resolve visual preset or fall back to default
    const variant = toast.variant || "default"
    const defaultStyle = variantSyles[variant] || variantSyles.default;
    const IconComponent = defaultStyle.icon;

    // Inline style overrides for user-specified dynamic colors
    const customInlineStyle: React.CSSProperties ={
        backgroundColor: toast.customColor?.bg,
        borderColor: toast.customColor?.border,
        //progress: toast.customColor?.progress,
        color: toast.customColor?.text,
    };

    return (
        // Card container with pointer-events-none to re-enable interaction on the toast itself
        <div 
            style={customInlineStyle}
            className={` pointer-events-auto flex items-start gap-3 w-full p-4 rounded-lg border shadow-lg
                transition-all duration-200 backdrop-blur-sm 
                ${!toast.customColor?.bg ? defaultStyle.bg : ""} 
                ${!toast.customColor?.border ? defaultStyle.border : ""} 
                ${!toast.customColor?.text ? defaultStyle.text : ""}
                ${toast.className || ""}
            `}
        >
            {/* Render icon if preset defines one */}
            {IconComponent && (
                <IconComponent
                    className="w-5 h-5 mt-0.5 shrink-0"
                    style={{ color: toast.customColor?.icon}}
                />
            )}
            {/* Toast Content Area */}
            <div className="flex-1 text-sm space-y-1">
                {/* Title rendering */}
                {toast.title && <div className="font-semibold">{toast.title}</div>}
                {/* Description rendering */}
                {toast.description && (
                    <div className="opacity-90 leading-relaxed text-xs">
                        {toast.description}
                    </div>
                )}
                {/* Action button/node rendering */}
                {toast.action && <div className="pt-1">{toast.action}</div>}
            </div>
            {/* Close button */}
            <button 
                onClick={onDismiss}
                className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-slate-800/40 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
```

## 4. CLI Engine & Registry Source Code
### 4.1 Component Registry Index (`src/registry.ts`) - Documented
### <kbd>src/registry.ts</kbd>
```ts
// Type interface specifying component metadata and dependancy requirements
export interface ComponentMeta {
    // Human-readable title
    name: string;
    // Production npm packages requierd by this component
    dependencies: string[];
    // Developmemnt dependancies required by this component
    devDependencies?: string[];
    // File distribution mappings
    files: {
        // Relative path to file inside the CLI package's templates/ folder
        templatePath: string;
        // Filename written inside teh consumer project's components/ui folder
        targetName: string;
    }[];
}

// Central catalog mapping component aliases to metadata definitions
export const REGISTRY: Record<string,ComponentMeta> = {
    // Toast component registration
    toast: {
        name: "Custom Toast Notification System",
        // Packages to automatically install in consumer project
        dependencies: ["lucide-react", "clsx", "tailwind-merge"],
        files: [
            {
                templatePath: "toast/toast.tsx",
                targetName: "toast.tsx",
            },
            {
                templatePath: "toast/use-toast.ts",
                targetName: "use-toast.ts"
            },
        ],
    },
    // Future components (dialog, sheet, dropdown) are added here
}
```

### 4.2 Installer & Copy Engine (`src/commands/add.ts`) - Documented
### <kbd>src/commands/add.ts</kbd>
```ts
// Native Node.js path utilities
import path from "node:path";
// Helper to derive __dirname in ESM
import { fileURLToPath } from "node:url";
// File system helper with promise support
import fs from "fs-extra";
// Subprocess execution library for running npm commands
import { execa } from "execa";
// Modern interactive CLI prompts
import * as p from "@clack/prompts"
// Terminal color styling
import pc from "picocolors";
// Component registry index
import  { REGISTRY } from "../registry.js";

// Derive current directory path in ES Module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main execution function for adding components
export async function add(componentKeys: string[]) {
    // Print styled welcome banner in terminal
    p.intro(pc.bgCyan(pc.black(" Canopy UI")));

    // Hold list of components to install
    let selected = componentKeys;

    // If user did'nt specify components in CLI args, prompt with interactive multi-select
    if (!selected || selected.length === 0) {
        // Generate prompt choices from registered components
        const choices = Object.keys(REGISTRY).map((key) => ({
            value: key,
            label: `${REGISTRY[key]?.name} (${key})`,
        }));

        // Display interactive terminal multi-select
        const response = await p.multiselect({
            message: "Select UI components to install:",
            options: choices,
            required:true,
        });

        // Handle user cancellation (Ctrl+C / Esc)
        if (p.isCancel(response)) {
            p.cancel("Operation aborted.");
            process.exit(0);
        }
        selected = response as string[];
    }

    // Get path to current user workspace
    const projectRoot = process.cwd();
    // Target destination directory: /components/ui
    const targetDir = path.join(projectRoot, "components", "ui");
    // Ensure the destination directory exists (create recursively if missing)
    await fs.ensureDir(targetDir);

    // Initialize terminal animated progress spinner
    const spinner = p.spinner();

    // Iterate over each selected component identifier
    for (const key of selected) {
        const meta = REGISTRY[key];
        // Guard against invalid component keys
        if (!meta) {
            p.log.error(`Component "${key}" was not found in registry.`);
            continue;
        }

        // Start progress spinner
        spinner.start(`Copying ${meta.name} source files.`)

        // Copy each template file to user's codebase
        for (const file of meta.files) {
            // Resolve path to bundled template within  the installed package
            const srcPath = path.resolve(__dirname, "../../templates", file.templatePath);
            // Resolve destiantion path in user's project
            const destPath = path.join(targetDir, file.targetName);

            // Verify templaet file exisits in package bundle
            if (await fs.pathExists(srcPath)) {
                // Copy file and overwrite existing version
                await fs.copy(srcPath, destPath, { overwrite: true });
            } else {
                spinner.stop(pc.red(`Template file missing: ${file.templatePath}`));
                return;
            }
        }

        // INstall required dependancies ifn specified
        if (meta.dependencies.length > 0) {
            spinner.message(`Installing required npm packages: ${meta.dependencies.join(", ")}...`);
            // Run npm install in user's root directory
            await execa("npm", ["install", ...meta.dependencies], { cwd: projectRoot });
        }

        // Mark comletion for current component
        spinner.stop(pc.green(`✔ Added ${meta.name} into components/ui/`))
    }

    // Final success message
    p.outro(pc.green("All components successfully installed!"))
}

```

### 4.1 CLI Entry Router (`src/index.ts`) - Documented
### <kbd>src/index.ts</kbd>
```ts
// Import Commander framework for CLLI argument parsing
import { Command } from "commander";
// Import add command handler
import { add } from "./commands/add.js"

// Initialize command program instance
const program = new Command();

// Configure CLI identity and metadata
program
    .name("Canopy UI")
    .description("Install custom modular UI components directly to your project")
    .version("1.0.0");

// Define 'add' command with variadic component arguments
program
 .command("add")
 .description("Add a component to your project")
 .argument("[components...]", "Component identifiers (e.g., toast")
 .action(async (components: string[]) => {
    // Invoke add handlerwith parsed component names
    await add(components);
 });

// Parse command line arguments from process.argv
program.parse(process.argv);
```

## 5. How the User Consumes the Installed Toast
### 5.1 Mounted in Root Layout (`app/layout.tsx`)
Duration is configured in the root level
### <kbd>app/layout.tsx</kbd>
```tsx
import { Toaster } from "@/components/ui/toast";
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
                {/* Set global default duration (3500ms) and viewport position */}
                <Toaster defaultDuration={3500} position="bottom-right" />
            </body>
        </html>
    );
}

```

### 5.2 Invoking Toasts with Built-in Variants & Custom Colors
### <kbd>app/page.tsx</kbd>
```tsx
"use client";

import { toast } from "@/components/ui/use-toast";

export default function Page() {
  return (
    <div className="p-8 flex flex-wrap gap-4 items-center min-h-screen bg-background text-foreground">
      {/* 1. Success Variant */}
      <button
        className="px-4 py-2 text-sm font-medium rounded-md bg-success text-success-foreground hover:opacity-90 transition-opacity"
        onClick={() =>
          toast({
            variant: "success",
            title: "Changes Saved",
            description: "Your preferences were updated successfully.",
          })
        }
      >
        Success Toast
      </button>

      {/* 2. Error / Destructive Variant */}
      <button
        className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
        onClick={() =>
          toast({
            variant: "error",
            title: "Action Failed",
            description: "Could not connect to the remote server.",
          })
        }
      >
        Error Toast
      </button>

      {/* 3. Custom CSS Variables & Progress Bar */}
      <button
        className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
        onClick={() =>
          toast({
            title: "Pro Subscription Unlocked",
            description: "Welcome to VIP perks and custom styling.",
            duration: 5000,
            customColor: {
              bg: "var(--card)",
              border: "var(--primary)",
              text: "var(--card-foreground)",
              icon: "var(--primary)",
              progress: "var(--primary)",
            },
          })
        }
      >
        Custom Token Toast
      </button>

      {/* 4. Direct ClassName Override */}
      <button
        className="px-4 py-2 text-sm font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
        onClick={() =>
          toast({
            title: "Tailwind Classes Applied",
            description: "Styled with direct className overrides.",
            duration: 3500,
            customColor: {
              progress: "var(--destructive)",
            },
            className: "border-destructive/40 text-primary bg-card",
          })
        }
      >
        ClassName Override Toast
      </button>
    </div>
  );
}

```

## 6. Local Testing , Git and npm Publishing Procedures
### Local Verification Steps

1. Compile the CLI: `npm run build` inside `canopy-ui`.
2. Create a global symlink: `npm link`.
3. Navigate to a test Next.js app and run: `canopy-ui add toast`.
4. Verify that `components/ui.toast.tsx` and `components/ui/use-toast.ts` exist and dependencies are installed
5. Clean up synlink: `npm unlink` in the CLI folder

### Git and GitHub Repository Initialization
```bash
git init
git add .
git commit -m "feat: initial commit with CLI engine, toast template, and documentation"
git branch -M main
git remote add origin https://github.com/ShawnR04/canopy-ui.git
git push -u origin main

```

### Publishing to npm Registry
```bash
# Step 1: Log in with credentials
npm login
# Step 2: Validate package bundle in dry-run mode
npm publish --dry-run
# Step 3: Publish package publicly to npm
npm publish --access public

```